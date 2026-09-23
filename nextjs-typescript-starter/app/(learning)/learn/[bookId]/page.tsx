import { notFound, redirect } from 'next/navigation';

import { auth } from 'app/auth';
import { LearningExperience } from 'components/learning/learning-experience';
import { BackButton } from 'components/ui/back-button';
import { getSessionUserId } from 'lib/auth/session';
import type {
  NotebookListItem,
  WordNotebookMemberships,
} from 'lib/notebooks/types';
import { getBook } from 'lib/repositories/book-repository';
import {
  listNotebooks,
  listWordNotebookMemberships,
} from 'lib/repositories/notebook-repository';
import { getLearningPageState } from 'lib/services/learning-service';

export default async function LearnPage({ params }: { params: { bookId: string } }) {
  const session = await auth();
  const returnPath = `/learn/${encodeURIComponent(params.bookId)}`;
  const userId = getSessionUserId(session);

  if (!session?.user || !userId) {
    redirect(
      `/mine?${new URLSearchParams({ auth: 'login', returnTo: returnPath }).toString()}`,
    );
  }

  if (!params.bookId || params.bookId.length > 128) notFound();

  const [book, learningState, favoriteData] = await Promise.all([
    getBook(params.bookId),
    getLearningPageState(userId, params.bookId),
    loadFavoriteData(userId),
  ]);
  if (!book) notFound();

  return (
    <div className="min-h-dvh">
      <header className="flex min-h-[76px] items-center gap-3 px-5 pt-[env(safe-area-inset-top)]">
        <BackButton fallback="/" />
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-sm font-black text-ink">{book.title}</p>
          <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-ink/30">
            Focus mode · 自动保存进度
          </p>
        </div>
        <div className="w-[54px]" aria-hidden="true" />
      </header>

      {learningState.word || learningState.completed ? (
        <LearningExperience
          book={book}
          initialWord={learningState.word}
          totalWords={learningState.totalWords}
          initialLearnedCount={learningState.learnedCount}
          initialProgressVersion={learningState.progressVersion}
          initialCompleted={learningState.completed}
          notebooks={favoriteData.notebooks}
          initialMemberships={favoriteData.memberships}
          favoriteLoadFailed={favoriteData.loadFailed}
        />
      ) : (
        <div className="mx-5 mt-10 rounded-[28px] bg-white px-6 py-12 text-center shadow-card">
          <p className="text-base font-black text-ink">这本书还没有可学习的单词</p>
          <p className="mt-2 text-sm text-ink/45">请返回首页选择其他单词书。</p>
        </div>
      )}
    </div>
  );
}

async function loadFavoriteData(userId: number): Promise<{
  notebooks: NotebookListItem[];
  memberships: WordNotebookMemberships;
  loadFailed: boolean;
}> {
  try {
    const [notebooks, memberships] = await Promise.all([
      listNotebooks(userId),
      listWordNotebookMemberships(userId),
    ]);
    return { notebooks, memberships, loadFailed: false };
  } catch (error) {
    const details =
      error instanceof Error
        ? { name: error.name, message: error.message }
        : { name: 'UnknownError' };
    console.error('[learn] Failed to load notebooks', details);
    return { notebooks: [], memberships: {}, loadFailed: true };
  }
}
