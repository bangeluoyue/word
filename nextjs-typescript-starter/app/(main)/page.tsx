import { auth } from 'app/auth';
import { BookList } from 'components/books/book-list';
import { RecentLearningCard } from 'components/books/recent-learning-card';
import { SparkleIcon } from 'components/ui/icons';
import { WordSearchEntry } from 'components/words/word-search-entry';
import { getSessionUserId } from 'lib/auth/session';
import type { BookListItem } from 'lib/books/types';
import type { ProgressViewModel } from 'lib/progress/types';
import { listBooks } from 'lib/repositories/book-repository';
import { listProgressByUser } from 'lib/repositories/progress-repository';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const session = await auth();
  const isLoggedIn = Boolean(session?.user?.email);
  const userId = getSessionUserId(session);
  const { books, progress, booksLoadFailed, progressLoadFailed } =
    await loadHomeData(userId);
  const recentProgress = progress.find((item) => item.status === 'learning');
  const recentBook = recentProgress
    ? books.find((book) => book.book_id === recentProgress.book_id)
    : undefined;

  return (
    <div className="min-h-[calc(100dvh-76px)]">
      <header className="relative overflow-hidden bg-forest px-5 pb-20 pt-[calc(28px+env(safe-area-inset-top))] text-white">
        <div className="absolute -right-16 -top-14 h-52 w-52 rounded-full border-[34px] border-white/[0.035]" />
        <div className="absolute bottom-7 right-9 h-3 w-3 rotate-12 rounded-sm bg-coral" />
        <div className="absolute bottom-12 right-20 h-2 w-2 rounded-full bg-sun" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sun font-serif text-lg font-black text-forest">
                W
              </span>
              <div>
                <p className="text-sm font-black tracking-tight">词流</p>
                <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/40">
                  Word flow
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[10px] font-semibold text-white/55">
              <SparkleIcon className="h-3 w-3 text-sun" /> 每天进步一点
            </span>
          </div>

          <div className="mt-10 max-w-[320px]">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-sun">
              {isLoggedIn ? 'Welcome back' : 'Start small, grow daily'}
            </p>
            <h1 className="text-balance text-[30px] font-black leading-[1.2] tracking-tight">
              {isLoggedIn ? '接着上次的地方，继续向前。' : '把今天的单词，轻轻记住。'}
            </h1>
            <p className="mt-3 text-sm leading-6 text-white/48">
              {isLoggedIn
                ? '一点点积累，也会变成很远的路。'
                : '选择一本单词书，开启你的英语学习旅程。'}
            </p>
          </div>
        </div>
      </header>

      <div
        className={`relative space-y-8 px-5 pb-8 ${
          recentProgress && recentBook ? '-mt-11' : 'pt-7'
        }`}
      >
        {recentProgress && recentBook && (
          <section aria-labelledby="recent-title">
            <div className="mb-3 flex items-end justify-between px-1">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/40">
                  Pick up where you left
                </p>
                <h2 id="recent-title" className="mt-0.5 text-lg font-black text-white">
                  最近学习
                </h2>
              </div>
            </div>
            <RecentLearningCard book={recentBook} progress={recentProgress} />
          </section>
        )}

        <WordSearchEntry />

        <section aria-labelledby="all-books-title">
          <div className="mb-3 flex items-end justify-between px-1">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-ink/30">
                Find your next book
              </p>
              <h2 id="all-books-title" className="mt-0.5 text-lg font-black text-ink">
                全部单词书
              </h2>
            </div>
            <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-ink/35 shadow-sm">
              {booksLoadFailed ? '--' : books.length} 本
            </span>
          </div>
          {booksLoadFailed ? (
            <BookCatalogError />
          ) : (
            <>
              {progressLoadFailed && <ProgressLoadWarning />}
              <BookList
                books={books}
                progress={progress}
                isLoggedIn={isLoggedIn}
              />
            </>
          )}
        </section>
      </div>
    </div>
  );
}

async function loadHomeData(userId: number | null): Promise<{
  books: BookListItem[];
  progress: ProgressViewModel[];
  booksLoadFailed: boolean;
  progressLoadFailed: boolean;
}> {
  const [booksResult, progressResult] = await Promise.allSettled([
    listBooks(),
    userId ? listProgressByUser(userId) : Promise.resolve([]),
  ]);

  if (booksResult.status === 'rejected') {
    logLoadError('books', booksResult.reason);
  }
  if (progressResult.status === 'rejected') {
    logLoadError('progress', progressResult.reason);
  }

  return {
    books: booksResult.status === 'fulfilled' ? booksResult.value : [],
    progress: progressResult.status === 'fulfilled' ? progressResult.value : [],
    booksLoadFailed: booksResult.status === 'rejected',
    progressLoadFailed: progressResult.status === 'rejected',
  };
}

function BookCatalogError() {
  return (
    <div
      className="rounded-[24px] border border-coral/20 bg-white px-6 py-10 text-center shadow-card"
      role="alert"
    >
      <p className="text-sm font-bold text-ink/70">单词书加载失败</p>
      <p className="mt-1 text-xs leading-5 text-ink/40">
        数据库暂时无法连接，请稍后重试。
      </p>
      <a
        href="/"
        className="mt-5 inline-flex min-h-11 items-center rounded-full bg-forest px-5 text-xs font-bold text-white"
      >
        重新加载
      </a>
    </div>
  );
}

function ProgressLoadWarning() {
  return (
    <p className="mb-3 rounded-2xl bg-sun/15 px-4 py-3 text-xs leading-5 text-ink/55">
      学习进度暂时无法读取，单词书仍可正常浏览。
    </p>
  );
}

function logLoadError(resource: string, error: unknown) {
  const details =
    error instanceof Error
      ? { name: error.name, message: error.message }
      : { name: 'UnknownError' };
  console.error(`[home] Failed to load ${resource}`, details);
}
