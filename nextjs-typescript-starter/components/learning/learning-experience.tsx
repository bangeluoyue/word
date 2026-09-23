'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  advanceWordAction,
  restartBookAction,
} from 'app/actions/learning-actions';
import { BookCover } from 'components/books/book-cover';
import {
  FavoritePicker,
  type FavoriteTarget,
} from 'components/notebooks/favorite-picker';
import { PronunciationControls } from 'components/pronunciation/pronunciation-controls';
import { ArrowRightIcon, CheckIcon, SparkleIcon, StarIcon } from 'components/ui/icons';
import { ProgressBar } from 'components/ui/progress-bar';
import type { BookListItem } from 'lib/books/types';
import type {
  NotebookListItem,
  WordNotebookMemberships,
} from 'lib/notebooks/types';
import type { LearningWordViewModel } from 'lib/words/types';

export function LearningExperience({
  book,
  initialWord,
  totalWords,
  initialLearnedCount,
  initialProgressVersion,
  initialCompleted,
  notebooks,
  initialMemberships,
  favoriteLoadFailed,
}: {
  book: BookListItem;
  initialWord: LearningWordViewModel | null;
  totalWords: number;
  initialLearnedCount: number;
  initialProgressVersion: number;
  initialCompleted: boolean;
  notebooks: NotebookListItem[];
  initialMemberships: WordNotebookMemberships;
  favoriteLoadFailed: boolean;
}) {
  const router = useRouter();
  const [word, setWord] = useState(initialWord);
  const [learnedCount, setLearnedCount] = useState(initialLearnedCount);
  const [progressVersion, setProgressVersion] = useState(initialProgressVersion);
  const [completed, setCompleted] = useState(initialCompleted);
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [favoriteTarget, setFavoriteTarget] = useState<FavoriteTarget | null>(null);
  const [memberships, setMemberships] =
    useState<WordNotebookMemberships>(initialMemberships);
  const [favoriteNotice, setFavoriteNotice] = useState<string>();

  async function restart() {
    if (!window.confirm('确定重新学习这本单词书吗？当前完成进度将从头开始。')) {
      return;
    }

    setPending(true);
    setErrorMessage(undefined);
    try {
      const result = await restartBookAction({ bookId: book.book_id });
      if (!result.ok) {
        setErrorMessage(result.message);
        return;
      }
      setWord(result.firstWord);
      setLearnedCount(0);
      setProgressVersion(result.progressVersion);
      setCompleted(false);
    } catch {
      setErrorMessage('网络连接失败，请稍后重试');
    } finally {
      setPending(false);
    }
  }

  if (completed) {
    return (
      <CompletionPanel
        book={book}
        totalWords={totalWords}
        onRestart={restart}
        pending={pending}
        errorMessage={errorMessage}
      />
    );
  }

  if (!word) return null;
  const currentWord = word;
  const body = currentWord.content.word.content;
  const firstTranslation =
    body.trans?.find((translation) => translation.tranCn?.trim())?.tranCn ??
    '暂无释义';
  const firstSentence = body.sentence?.sentences?.find(
    (sentence) => sentence.sContent?.trim() || sentence.sCn?.trim(),
  );
  const ordinal = Math.min(learnedCount + 1, totalWords);
  const percentage = totalWords > 0 ? Math.round((ordinal / totalWords) * 100) : 0;
  const isLast = ordinal >= totalWords;

  function chooseFavorite() {
    setFavoriteNotice(undefined);
    if (favoriteLoadFailed) {
      setFavoriteNotice('笔记本加载失败，请刷新后重试');
      return;
    }
    if (notebooks.length === 0) {
      router.push(
        `/notebooks/new?${new URLSearchParams({
          wordRowId: currentWord.id,
          returnTo: `/learn/${book.book_id}`,
        }).toString()}`,
      );
      return;
    }
    setFavoriteTarget({ id: currentWord.id, headWord: currentWord.headWord });
  }

  function favoriteSaved(notebookIds: string[]) {
    setMemberships((current) => ({
      ...current,
      [currentWord.id]: notebookIds,
    }));
    setFavoriteNotice(notebookIds.length > 0 ? '已保存到笔记本' : '已取消收藏');
    setFavoriteTarget(null);
  }

  async function goNext() {
    if (pending) return;
    setPending(true);
    setErrorMessage(undefined);
    try {
      const result = await advanceWordAction({
        bookId: book.book_id,
        currentWordRowId: currentWord.id,
        progressVersion,
      });

      if (!result.ok) {
        if (result.current) setWord(result.current);
        if (result.learnedCount !== undefined) setLearnedCount(result.learnedCount);
        if (result.progressVersion !== undefined) {
          setProgressVersion(result.progressVersion);
        }
        setErrorMessage(result.message);
        return;
      }

      setLearnedCount(result.learnedCount);
      setProgressVersion(result.progressVersion);
      if (result.state === 'completed') {
        setCompleted(true);
      } else {
        setWord(result.nextWord);
      }
    } catch {
      setErrorMessage('网络连接失败，当前进度尚未保存，请重试');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100dvh-76px)] flex-col px-5 pb-[calc(24px+env(safe-area-inset-bottom))]">
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-[11px] font-bold text-ink/45">
          <span>
            第 {ordinal} / {totalWords} 词
          </span>
          <span>{percentage}%</span>
        </div>
        <ProgressBar value={percentage} tone="mint" />
      </div>

      <article className="relative flex min-h-[440px] flex-1 flex-col overflow-hidden rounded-[32px] border border-ink/[0.06] bg-white p-6 shadow-word-card">
        <div className="absolute -right-14 -top-14 h-36 w-36 rounded-full bg-sun/20" />
        <button
          type="button"
          onClick={chooseFavorite}
          className={`absolute left-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-paper transition hover:bg-sun/25 ${
            memberships[currentWord.id]?.length ? 'text-sun-dark' : 'text-ink/30'
          }`}
          aria-label={`${memberships[currentWord.id]?.length ? '管理收藏' : '收藏'} ${currentWord.headWord}`}
          title="收藏到笔记本"
        >
          <StarIcon
            className="h-5 w-5"
            filled={Boolean(memberships[currentWord.id]?.length)}
          />
        </button>
        <div className="absolute right-7 top-7 flex items-center gap-1 rounded-full bg-paper px-2.5 py-1 text-[10px] font-bold text-ink/35">
          <SparkleIcon className="h-3 w-3 text-sun-dark" /> 点击单词看详情
        </div>

        <div className="relative flex flex-1 flex-col items-center justify-center pb-4 pt-12 text-center">
          <Link
            href={`/word/${encodeURIComponent(currentWord.content.word.wordId)}?bookId=${encodeURIComponent(book.book_id)}`}
            className="group inline-flex items-center gap-1 font-serif text-[46px] font-black leading-none tracking-tight text-forest decoration-sun decoration-[5px] underline-offset-8 hover:underline"
          >
            {currentWord.content.word.wordHead}
            <ArrowRightIcon className="mt-2 h-6 w-6 text-forest/25 transition group-hover:translate-x-1 group-hover:text-forest" />
          </Link>

          <div className="mt-5">
            <PronunciationControls
              headword={currentWord.content.word.wordHead}
              ukphone={body.ukphone}
              usphone={body.usphone}
            />
          </div>

          <p className="mt-8 text-[22px] font-black tracking-wide text-ink">
            {firstTranslation}
          </p>

          {firstSentence && (
            <div className="mt-10 w-full rounded-[22px] bg-paper px-5 py-5 text-left">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-forest/45">
                Example
              </p>
              {firstSentence.sContent && (
                <p className="font-serif text-[17px] font-bold leading-7 text-ink">
                  {firstSentence.sContent}
                </p>
              )}
              {firstSentence.sCn && (
                <p className="mt-1 text-sm leading-6 text-ink/48">{firstSentence.sCn}</p>
              )}
            </div>
          )}
        </div>
      </article>

      <button
        type="button"
        onClick={goNext}
        disabled={pending}
        className="mt-5 flex min-h-14 w-full items-center justify-center gap-2 rounded-[20px] bg-forest px-5 text-sm font-bold text-white shadow-button transition hover:-translate-y-0.5 hover:bg-forest-light disabled:cursor-wait disabled:translate-y-0 disabled:opacity-75"
      >
        {pending ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            正在保存…
          </>
        ) : isLast ? (
          <>
            完成学习 <CheckIcon className="h-5 w-5" />
          </>
        ) : (
          <>
            下一个 <ArrowRightIcon className="h-5 w-5" />
          </>
        )}
      </button>
      {errorMessage && (
        <p className="mt-3 rounded-xl bg-coral/10 px-4 py-3 text-center text-xs font-semibold text-coral-dark" role="alert">
          {errorMessage}
        </p>
      )}
      {favoriteNotice && (
        <p className="mt-3 rounded-xl bg-mint px-4 py-3 text-center text-xs font-semibold text-forest" role="status">
          {favoriteNotice}
        </p>
      )}
      <p className="mt-3 text-center text-[10px] text-ink/30">
        学习进度会实时保存到你的账号
      </p>
      <FavoritePicker
        target={favoriteTarget}
        notebooks={notebooks}
        selectedNotebookIds={
          favoriteTarget ? memberships[favoriteTarget.id] ?? [] : []
        }
        onClose={() => setFavoriteTarget(null)}
        onSaved={favoriteSaved}
      />
    </div>
  );
}

function CompletionPanel({
  book,
  totalWords,
  onRestart,
  pending,
  errorMessage,
}: {
  book: BookListItem;
  totalWords: number;
  onRestart: () => Promise<void>;
  pending: boolean;
  errorMessage?: string;
}) {
  return (
    <div className="relative mx-5 mt-8 overflow-hidden rounded-[34px] bg-forest px-6 py-12 text-center text-white shadow-feature">
      <span className="absolute left-8 top-9 h-2.5 w-2.5 rotate-12 rounded-sm bg-coral" />
      <span className="absolute right-9 top-14 h-3 w-1.5 -rotate-12 rounded-full bg-sun" />
      <span className="absolute bottom-28 left-10 h-2 w-2 rounded-full bg-mint-strong" />
      <span className="absolute bottom-20 right-8 h-2.5 w-2.5 rotate-45 bg-coral/80" />
      <div className="relative">
        <div className="mx-auto w-fit rotate-[-3deg]">
          <BookCover book={book} size="lg" />
        </div>
        <div className="mx-auto -mt-3 flex h-14 w-14 items-center justify-center rounded-full border-[5px] border-forest bg-sun text-forest shadow-lg">
          <CheckIcon className="h-7 w-7" />
        </div>
        <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-sun">
          Book completed
        </p>
        <h1 className="mt-2 text-2xl font-black tracking-tight">恭喜你，学完了！</h1>
        <p className="mt-2 text-sm leading-6 text-white/55">
          {book.title}
          <br />共完成 {totalWords} 个单词
        </p>
        <Link
          href="/"
          className="mt-8 flex min-h-12 w-full items-center justify-center rounded-2xl bg-white text-sm font-bold text-forest shadow-button transition hover:-translate-y-0.5"
        >
          返回首页
        </Link>
        <button
          type="button"
          onClick={onRestart}
          disabled={pending}
          className="mt-3 min-h-11 px-5 text-xs font-bold text-white/65 underline decoration-white/30 underline-offset-4 transition hover:text-white disabled:cursor-wait disabled:opacity-50"
        >
          {pending ? '正在重置…' : '重新学习'}
        </button>
        {errorMessage && (
          <p className="mt-3 text-xs font-semibold text-coral" role="alert">
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
}
