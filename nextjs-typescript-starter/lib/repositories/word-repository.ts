import 'server-only';

import { and, asc, count, eq, gt, sql } from 'drizzle-orm';

import { db } from 'lib/db/client';
import { bookWords, words } from 'lib/db/schema';
import {
  mapGlobalWordRow,
  mapLearningWordRow,
} from 'lib/words/mapper';
import type {
  GlobalWordViewModel,
  LearningWordViewModel,
  WordSummary,
} from 'lib/words/types';

export const WORD_SEARCH_LIMIT = 500;

export async function countValidWords(bookId: string): Promise<number> {
  const [result] = await db
    .select({ value: count() })
    .from(bookWords)
    .innerJoin(words, eq(bookWords.wordId, words.id))
    .where(validWordCondition(bookId));

  return result?.value ?? 0;
}

export async function getFirstValidWord(
  bookId: string,
): Promise<LearningWordViewModel | null> {
  const [row] = await db
    .select(wordSelection)
    .from(bookWords)
    .innerJoin(words, eq(bookWords.wordId, words.id))
    .where(validWordCondition(bookId))
    .orderBy(asc(bookWords.wordRank), asc(words.id))
    .limit(1);

  return row ? mapLearningWordRow(row) : null;
}

export async function getNextValidWord(
  bookId: string,
  afterRank: number,
  afterRowId: bigint | null,
): Promise<LearningWordViewModel | null> {
  const cursor = afterRowId
    ? sql`(${bookWords.wordRank}, ${words.id}) > (${afterRank}, ${afterRowId})`
    : gt(bookWords.wordRank, afterRank);
  const [row] = await db
    .select(wordSelection)
    .from(bookWords)
    .innerJoin(words, eq(bookWords.wordId, words.id))
    .where(and(validWordCondition(bookId), cursor))
    .orderBy(asc(bookWords.wordRank), asc(words.id))
    .limit(1);

  return row ? mapLearningWordRow(row) : null;
}

export async function getWordByBusinessId(
  bookId: string,
  wordId: string,
): Promise<LearningWordViewModel | null> {
  const [row] = await db
    .select(wordSelection)
    .from(bookWords)
    .innerJoin(words, eq(bookWords.wordId, words.id))
    .where(
      and(
        validWordCondition(bookId),
        sql`${words.content} -> 'word' ->> 'wordId' = ${wordId}`,
      ),
    )
    .limit(1);

  return row ? mapLearningWordRow(row) : null;
}

/** 搜索页只读取列表需要的三个摘要字段，避免把完整词典 JSON 发给浏览器。 */
export async function listWordSummaries(): Promise<WordSummary[]> {
  const normalizedHeadWord = sql<string>`coalesce(
    nullif(btrim(${words.content} -> 'word' ->> 'wordHead'), ''),
    nullif(btrim(${words.headWord}), '')
  )`;
  const firstTranslation = sql<string | null>`(
    select nullif(btrim(item ->> 'tranCn'), '')
    from json_array_elements(
      case
        when json_typeof(${words.content} -> 'word' -> 'content' -> 'trans') = 'array'
          then ${words.content} -> 'word' -> 'content' -> 'trans'
        else '[]'::json
      end
    ) with ordinality as translations(item, position)
    where nullif(btrim(item ->> 'tranCn'), '') is not null
    order by position
    limit 1
  )`;
  const rows = await db
    .select({
      id: words.id,
      headWord: normalizedHeadWord,
      translation: firstTranslation,
    })
    .from(words)
    .where(
      and(
        sql`${normalizedHeadWord} is not null`,
        sql`nullif(btrim(${words.content} -> 'word' ->> 'wordId'), '') is not null`,
      ),
    )
    .orderBy(sql`lower(${normalizedHeadWord})`, asc(words.id))
    .limit(WORD_SEARCH_LIMIT);

  return rows.map((row) => ({
    id: row.id.toString(),
    headWord: row.headWord,
    translation: row.translation,
  }));
}

export async function getGlobalWordByRowId(
  rowId: bigint,
): Promise<GlobalWordViewModel | null> {
  const [row] = await db
    .select(globalWordSelection)
    .from(words)
    .where(eq(words.id, rowId))
    .limit(1);

  return row ? mapGlobalWordRow(row) : null;
}

function validWordCondition(bookId: string) {
  return and(
    eq(bookWords.bookId, bookId),
    gt(bookWords.wordRank, 0),
    sql`nullif(btrim(${words.content} -> 'word' ->> 'wordId'), '') is not null`,
    sql`coalesce(
      nullif(btrim(${words.content} -> 'word' ->> 'wordHead'), ''),
      nullif(btrim(${words.headWord}), '')
    ) is not null`,
  );
}

const wordSelection = {
  id: words.id,
  wordRank: bookWords.wordRank,
  headWord: words.headWord,
  content: words.content,
  bookId: bookWords.bookId,
};

const globalWordSelection = {
  id: words.id,
  headWord: words.headWord,
  content: words.content,
};
