import { auth } from 'app/auth';
import { BackButton } from 'components/ui/back-button';
import { WordSearchList } from 'components/words/word-search-list';
import { getSessionUserId } from 'lib/auth/session';
import type {
  NotebookListItem,
  WordNotebookMemberships,
} from 'lib/notebooks/types';
import {
  listNotebooks,
  listWordNotebookMemberships,
} from 'lib/repositories/notebook-repository';
import { listWordSummaries } from 'lib/repositories/word-repository';
import type { WordSummary } from 'lib/words/types';

export const dynamic = 'force-dynamic';
type SearchParams = Record<string, string | string[] | undefined>;

export default async function WordsPage({
  searchParams = {},
}: {
  searchParams?: SearchParams;
}) {
  const session = await auth();
  const userId = getSessionUserId(session);
  const [{ words, loadFailed }, favoriteData] = await Promise.all([
    loadWords(),
    userId ? loadFavoriteData(userId) : Promise.resolve(emptyFavoriteData()),
  ]);

  return (
    <div className="min-h-[calc(100dvh-76px)] px-5 pb-8">
      <header className="flex min-h-[76px] items-center gap-3 pt-[env(safe-area-inset-top)]">
        <BackButton fallback="/" />
        <div className="min-w-0 flex-1 text-center">
          <p className="text-sm font-black text-ink">查询单词</p>
          <p className="mt-0.5 text-[10px] text-ink/35">按英文原型模糊查询</p>
        </div>
        <div className="w-[54px]" aria-hidden="true" />
      </header>

      <WordSearchList
        words={words}
        loadFailed={loadFailed}
        isLoggedIn={Boolean(userId)}
        notebooks={favoriteData.notebooks}
        initialMemberships={favoriteData.memberships}
        favoriteLoadFailed={favoriteData.loadFailed}
        initialFavoriteWordId={firstValue(searchParams.favoriteWordId)}
      />
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
    logLoadError('favorites', error);
    return emptyFavoriteData(true);
  }
}

function emptyFavoriteData(loadFailed = false) {
  return {
    notebooks: [] as NotebookListItem[],
    memberships: {} as WordNotebookMemberships,
    loadFailed,
  };
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function logLoadError(resource: string, error: unknown) {
  const details =
    error instanceof Error
      ? { name: error.name, message: error.message }
      : { name: 'UnknownError' };
  console.error(`[words] Failed to load ${resource}`, details);
}

async function loadWords(): Promise<{
  words: WordSummary[];
  loadFailed: boolean;
}> {
  try {
    return { words: await listWordSummaries(), loadFailed: false };
  } catch (error) {
    const details =
      error instanceof Error
        ? { name: error.name, message: error.message }
        : { name: 'UnknownError' };
    console.error('[words] Failed to load summaries', details);
    return { words: [], loadFailed: true };
  }
}
