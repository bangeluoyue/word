import 'server-only';

import { postgresClient } from 'lib/db/client';
import type { Word } from 'lib/db/schema';
import { getProgressByUserAndBook } from 'lib/repositories/progress-repository';
import {
  countValidWords,
  getFirstValidWord,
  getNextValidWord,
} from 'lib/repositories/word-repository';
import { mapLearningWordRow } from 'lib/words/mapper';
import type { LearningWordViewModel } from 'lib/words/types';

export type LearningPageState = {
  completed: boolean;
  totalWords: number;
  learnedCount: number;
  progressVersion: number;
  word: LearningWordViewModel | null;
};

export type AdvanceWordResult =
  | {
      ok: true;
      state: 'next';
      nextWord: LearningWordViewModel;
      learnedCount: number;
      totalWords: number;
      progressVersion: number;
    }
  | {
      ok: true;
      state: 'completed';
      learnedCount: number;
      totalWords: number;
      progressVersion: number;
    }
  | LearningFailure;

export type RestartBookResult =
  | {
      ok: true;
      firstWord: LearningWordViewModel;
      totalWords: number;
      progressVersion: number;
    }
  | LearningFailure;

type LearningFailure = {
  ok: false;
  code:
    | 'AUTH_REQUIRED'
    | 'INVALID_INPUT'
    | 'NOT_FOUND'
    | 'BOOK_EMPTY'
    | 'PROGRESS_CONFLICT'
    | 'DATABASE_ERROR';
  message: string;
  current?: LearningWordViewModel;
  learnedCount?: number;
  totalWords?: number;
  progressVersion?: number;
};

export async function getLearningPageState(
  userId: number,
  bookId: string,
): Promise<LearningPageState> {
  const progress = await getProgressByUserAndBook(userId, bookId);

  if (progress?.status === 'completed') {
    return {
      completed: true,
      totalWords: progress.totalWords,
      learnedCount: progress.learnedCount,
      progressVersion: progress.version,
      word: null,
    };
  }

  if (!progress) {
    const [totalWords, word] = await Promise.all([
      countValidWords(bookId),
      getFirstValidWord(bookId),
    ]);
    return {
      completed: false,
      totalWords,
      learnedCount: 0,
      progressVersion: 0,
      word,
    };
  }

  const word = await getNextValidWord(
    bookId,
    progress.lastWordRank ?? 0,
    progress.lastWordRowId,
  );
  return {
    completed: !word,
    totalWords: progress.totalWords,
    learnedCount: progress.learnedCount,
    progressVersion: progress.version,
    word,
  };
}

export async function advanceWord(input: {
  userId: number;
  bookId: string;
  currentWordRowId: string;
  progressVersion?: number;
}): Promise<AdvanceWordResult> {
  if (!isValidBookId(input.bookId) || !isValidBigintString(input.currentWordRowId)) {
    return failure('INVALID_INPUT', '学习请求无效，请刷新页面后重试');
  }

  const currentWordRowId = input.currentWordRowId;

  return postgresClient.begin(async (transaction) => {
    const [book] = await transaction`
      select book_id
      from public.books
      where book_id = ${input.bookId}
      limit 1
    `;
    if (!book) return failure('NOT_FOUND', '单词书不存在');

    let [progress] = await transaction`
      select *
      from public.learning_progress
      where user_id = ${input.userId}
        and book_id = ${input.bookId}
      for update
    `;

    if (!progress) {
      const [countRow] = await transaction`
        select count(*)::integer as total
        from public.book_words bw
        inner join public.words w on w.id = bw.word_id
        where bw.book_id = ${input.bookId}
          and bw.word_rank > 0
          and nullif(btrim(w.content -> 'word' ->> 'wordId'), '') is not null
          and coalesce(
            nullif(btrim(w.content -> 'word' ->> 'wordHead'), ''),
            nullif(btrim(w."headWord"), '')
          ) is not null
      `;
      const totalWords = Number(countRow?.total ?? 0);
      if (totalWords === 0) return failure('BOOK_EMPTY', '这本书还没有可学习的单词');

      await transaction`
        insert into public.learning_progress (
          user_id, book_id, learned_count, total_words, status, version
        ) values (
          ${input.userId}, ${input.bookId}, 0, ${totalWords}, 'learning', 0
        )
        on conflict (user_id, book_id) do nothing
      `;
      [progress] = await transaction`
        select *
        from public.learning_progress
        where user_id = ${input.userId}
          and book_id = ${input.bookId}
        for update
      `;
    }

    if (!progress) return failure('DATABASE_ERROR', '学习进度初始化失败，请重试');

    const totalWords = Number(progress.total_words);
    const learnedCount = Number(progress.learned_count);
    const version = Number(progress.version);

    if (progress.status === 'completed') {
      if (String(progress.last_word_row_id) === input.currentWordRowId) {
        return completedResult(totalWords, version);
      }
      return failure('PROGRESS_CONFLICT', '学习进度已在其他页面更新，请刷新后继续', {
        learnedCount,
        totalWords,
        progressVersion: version,
      });
    }

    const [expectedRow] = progress.last_word_row_id
      ? await transaction`
          select w.id, bw.word_rank as "wordRank", w."headWord", w.content,
            bw.book_id as "bookId"
          from public.book_words bw
          inner join public.words w on w.id = bw.word_id
          where bw.book_id = ${input.bookId}
            and bw.word_rank > 0
            and nullif(btrim(w.content -> 'word' ->> 'wordId'), '') is not null
            and coalesce(
              nullif(btrim(w.content -> 'word' ->> 'wordHead'), ''),
              nullif(btrim(w."headWord"), '')
            ) is not null
            and (bw.word_rank, w.id) > (
              ${Number(progress.last_word_rank)},
              ${String(progress.last_word_row_id)}
            )
          order by bw.word_rank asc, w.id asc
          limit 1
        `
      : await transaction`
          select w.id, bw.word_rank as "wordRank", w."headWord", w.content,
            bw.book_id as "bookId"
          from public.book_words bw
          inner join public.words w on w.id = bw.word_id
          where bw.book_id = ${input.bookId}
            and bw.word_rank > 0
            and nullif(btrim(w.content -> 'word' ->> 'wordId'), '') is not null
            and coalesce(
              nullif(btrim(w.content -> 'word' ->> 'wordHead'), ''),
              nullif(btrim(w."headWord"), '')
            ) is not null
          order by bw.word_rank asc, w.id asc
          limit 1
        `;
    const expectedWord = expectedRow ? mapSqlWord(expectedRow) : null;

    if (!expectedWord) {
      return failure('PROGRESS_CONFLICT', '词库已发生变化，请重新学习本书', {
        learnedCount,
        totalWords,
        progressVersion: version,
      });
    }

    if (expectedWord.id !== input.currentWordRowId) {
      if (String(progress.last_word_row_id) === input.currentWordRowId) {
        return {
          ok: true,
          state: 'next',
          nextWord: expectedWord,
          learnedCount,
          totalWords,
          progressVersion: version,
        };
      }
      return failure('PROGRESS_CONFLICT', '学习进度已在其他页面更新，已同步最新单词', {
        current: expectedWord,
        learnedCount,
        totalWords,
        progressVersion: version,
      });
    }

    const [nextRow] = await transaction`
      select w.id, bw.word_rank as "wordRank", w."headWord", w.content,
        bw.book_id as "bookId"
      from public.book_words bw
      inner join public.words w on w.id = bw.word_id
      where bw.book_id = ${input.bookId}
        and bw.word_rank > 0
        and nullif(btrim(w.content -> 'word' ->> 'wordId'), '') is not null
        and coalesce(
          nullif(btrim(w.content -> 'word' ->> 'wordHead'), ''),
          nullif(btrim(w."headWord"), '')
        ) is not null
        and (bw.word_rank, w.id) > (${expectedWord.wordRank}, ${currentWordRowId})
      order by bw.word_rank asc, w.id asc
      limit 1
    `;
    const nextWord = nextRow ? mapSqlWord(nextRow) : null;
    const nextVersion = version + 1;

    if (!nextWord) {
      await transaction`
        update public.learning_progress
        set last_word_row_id = ${currentWordRowId},
            last_word_rank = ${expectedWord.wordRank},
            learned_count = total_words,
            status = 'completed',
            version = version + 1,
            updated_at = now(),
            completed_at = now()
        where id = ${String(progress.id)}
      `;
      return completedResult(totalWords, nextVersion);
    }

    const nextLearnedCount = Math.min(learnedCount + 1, totalWords - 1);
    await transaction`
      update public.learning_progress
      set last_word_row_id = ${currentWordRowId},
          last_word_rank = ${expectedWord.wordRank},
          learned_count = ${nextLearnedCount},
          status = 'learning',
          version = version + 1,
          updated_at = now(),
          completed_at = null
      where id = ${String(progress.id)}
    `;

    return {
      ok: true,
      state: 'next',
      nextWord,
      learnedCount: nextLearnedCount,
      totalWords,
      progressVersion: nextVersion,
    };
  });
}

export async function restartBook(input: {
  userId: number;
  bookId: string;
}): Promise<RestartBookResult> {
  if (!isValidBookId(input.bookId)) {
    return failure('INVALID_INPUT', '单词书参数无效');
  }

  return postgresClient.begin(async (transaction) => {
    const [book] = await transaction`
      select book_id from public.books where book_id = ${input.bookId} limit 1
    `;
    if (!book) return failure('NOT_FOUND', '单词书不存在');

    const [firstRow] = await transaction`
      select w.id, bw.word_rank as "wordRank", w."headWord", w.content,
        bw.book_id as "bookId"
      from public.book_words bw
      inner join public.words w on w.id = bw.word_id
      where bw.book_id = ${input.bookId}
        and bw.word_rank > 0
        and nullif(btrim(w.content -> 'word' ->> 'wordId'), '') is not null
        and coalesce(
          nullif(btrim(w.content -> 'word' ->> 'wordHead'), ''),
          nullif(btrim(w."headWord"), '')
        ) is not null
      order by bw.word_rank asc, w.id asc
      limit 1
    `;
    const firstWord = firstRow ? mapSqlWord(firstRow) : null;
    if (!firstWord) return failure('BOOK_EMPTY', '这本书还没有可学习的单词');

    const [countRow] = await transaction`
      select count(*)::integer as total
      from public.book_words bw
      inner join public.words w on w.id = bw.word_id
      where bw.book_id = ${input.bookId}
        and bw.word_rank > 0
        and nullif(btrim(w.content -> 'word' ->> 'wordId'), '') is not null
        and coalesce(
          nullif(btrim(w.content -> 'word' ->> 'wordHead'), ''),
          nullif(btrim(w."headWord"), '')
        ) is not null
    `;
    const totalWords = Number(countRow.total);
    const [progress] = await transaction`
      insert into public.learning_progress (
        user_id, book_id, learned_count, total_words, status, version
      ) values (
        ${input.userId}, ${input.bookId}, 0, ${totalWords}, 'learning', 0
      )
      on conflict (user_id, book_id) do update
      set last_word_row_id = null,
          last_word_rank = null,
          learned_count = 0,
          total_words = excluded.total_words,
          status = 'learning',
          version = public.learning_progress.version + 1,
          started_at = now(),
          updated_at = now(),
          completed_at = null
      returning version
    `;

    return {
      ok: true,
      firstWord,
      totalWords,
      progressVersion: Number(progress.version),
    };
  });
}

function mapSqlWord(row: Record<string, unknown>): LearningWordViewModel | null {
  return mapLearningWordRow({
    id: BigInt(String(row.id)),
    wordRank: typeof row.wordRank === 'number' ? row.wordRank : null,
    headWord: typeof row.headWord === 'string' ? row.headWord : null,
    content: row.content,
    bookId: typeof row.bookId === 'string' ? row.bookId : null,
  } satisfies Word);
}

function completedResult(totalWords: number, progressVersion: number) {
  return {
    ok: true as const,
    state: 'completed' as const,
    learnedCount: totalWords,
    totalWords,
    progressVersion,
  };
}

function failure(
  code: LearningFailure['code'],
  message: string,
  details: Omit<LearningFailure, 'ok' | 'code' | 'message'> = {},
): LearningFailure {
  return { ok: false, code, message, ...details };
}

function isValidBookId(value: string) {
  return value.trim() === value && value.length > 0 && value.length <= 128;
}

function isValidBigintString(value: string) {
  if (!/^\d{1,19}$/.test(value)) return false;
  try {
    const parsed = BigInt(value);
    return parsed > BigInt(0) && parsed <= BigInt('9223372036854775807');
  } catch {
    return false;
  }
}
