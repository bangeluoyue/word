import { auth } from 'app/auth';
import { AccountCard } from 'components/mine/account-card';
import { GuestPanel } from 'components/mine/guest-panel';
import { ProgressList } from 'components/mine/progress-list';
import { NotebookSection } from 'components/notebooks/notebook-section';
import { getSafeReturnTo } from 'lib/auth-redirect';
import { getSessionUserId } from 'lib/auth/session';
import type { BookListItem } from 'lib/books/types';
import type { ProgressViewModel } from 'lib/progress/types';
import { listBooks } from 'lib/repositories/book-repository';
import type { NotebookListItem } from 'lib/notebooks/types';
import { listNotebooks } from 'lib/repositories/notebook-repository';
import { listProgressByUser } from 'lib/repositories/progress-repository';
import { getUserNickname } from 'lib/services/profile-service';

type SearchParams = Record<string, string | string[] | undefined>;

export default async function MinePage({
  searchParams = {},
}: {
  searchParams?: SearchParams;
}) {
  const session = await auth();
  const email = session?.user?.email;
  const userId = getSessionUserId(session);
  const authParam = firstValue(searchParams.auth);
  const initialOpen = !email && (authParam === 'login' || authParam === 'register');
  const initialMode = authParam === 'register' ? 'register' : 'login';
  const returnTo = getSafeReturnTo(firstValue(searchParams.returnTo));
  const mineData = email && userId ? await loadMineData(userId) : null;

  return (
    <div className="min-h-[calc(100dvh-76px)] px-5 pb-8 pt-[calc(28px+env(safe-area-inset-top))]">
      <header className="mb-7">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-forest/45">
          My learning
        </p>
        <h1 className="mt-1 text-[30px] font-black tracking-tight text-ink">我的</h1>
        <p className="mt-2 text-sm text-ink/45">
          {email ? '你的积累，都在这里。' : '登录后，让每一次学习都有迹可循。'}
        </p>
      </header>

      {email ? (
        <div className="space-y-8">
          <AccountCard email={email} nickname={mineData?.nickname ?? null} />
          <NotebookSection
            notebooks={mineData?.notebooks ?? []}
            loadFailed={mineData?.notebooksLoadFailed ?? false}
          />
          <section aria-labelledby="progress-title">
            <div className="mb-3 flex items-end justify-between px-1">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-ink/30">
                  Your journey
                </p>
                <h2 id="progress-title" className="mt-0.5 text-lg font-black text-ink">
                  学习进度
                </h2>
              </div>
              <span className="text-xs font-semibold text-ink/35">
                已开始 {mineData?.progress.length ?? 0} 本
              </span>
            </div>
            {mineData?.learningLoadFailed ? (
              <ProgressLoadError />
            ) : (
              <ProgressList
                books={mineData?.books ?? []}
                progress={mineData?.progress ?? []}
              />
            )}
          </section>
        </div>
      ) : (
        <GuestPanel
          initialOpen={initialOpen}
          initialMode={initialMode}
          returnTo={returnTo}
        />
      )}
    </div>
  );
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

async function loadMineData(userId: number): Promise<{
  books: BookListItem[];
  progress: ProgressViewModel[];
  notebooks: NotebookListItem[];
  nickname: string | null;
  learningLoadFailed: boolean;
  notebooksLoadFailed: boolean;
}> {
  const [booksResult, progressResult, notebooksResult, nicknameResult] =
    await Promise.allSettled([
      listBooks(),
      listProgressByUser(userId),
      listNotebooks(userId),
      getUserNickname(userId),
    ]);

  logLoadFailure('books', booksResult);
  logLoadFailure('progress', progressResult);
  logLoadFailure('notebooks', notebooksResult);
  logLoadFailure('nickname', nicknameResult);

  return {
    books: booksResult.status === 'fulfilled' ? booksResult.value : [],
    progress: progressResult.status === 'fulfilled' ? progressResult.value : [],
    notebooks: notebooksResult.status === 'fulfilled' ? notebooksResult.value : [],
    nickname: nicknameResult.status === 'fulfilled' ? nicknameResult.value : null,
    learningLoadFailed:
      booksResult.status === 'rejected' || progressResult.status === 'rejected',
    notebooksLoadFailed: notebooksResult.status === 'rejected',
  };
}

function logLoadFailure(
  resource: string,
  result: PromiseSettledResult<unknown>,
) {
  if (result.status === 'fulfilled') return;
  const details =
    result.reason instanceof Error
      ? { name: result.reason.name, message: result.reason.message }
      : { name: 'UnknownError' };
  console.error(`[mine] Failed to load ${resource}`, details);
}

function ProgressLoadError() {
  return (
    <div className="rounded-[24px] bg-white px-6 py-10 text-center shadow-card" role="alert">
      <p className="text-sm font-bold text-ink/70">学习进度加载失败</p>
      <p className="mt-1 text-xs text-ink/40">请检查网络后重新加载页面。</p>
      <a
        href="/mine"
        className="mt-5 inline-flex min-h-11 items-center rounded-full bg-forest px-5 text-xs font-bold text-white"
      >
        重新加载
      </a>
    </div>
  );
}
