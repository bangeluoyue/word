import { notFound, redirect } from 'next/navigation';

import { auth } from 'app/auth';
import { CreateNotebookForm } from 'components/notebooks/create-notebook-form';
import { BackButton } from 'components/ui/back-button';
import { getSafeReturnTo } from 'lib/auth-redirect';
import { getSessionUserId } from 'lib/auth/session';
import { getGlobalWordByRowId } from 'lib/repositories/word-repository';

type SearchParams = Record<string, string | string[] | undefined>;
const MAX_BIGINT = BigInt('9223372036854775807');

export default async function NewNotebookPage({
  searchParams = {},
}: {
  searchParams?: SearchParams;
}) {
  const wordRowId = firstValue(searchParams.wordRowId);
  const requestedReturnTo = getSafeReturnTo(firstValue(searchParams.returnTo));
  const currentPath = buildCurrentPath(wordRowId, requestedReturnTo);
  const session = await auth();
  const userId = getSessionUserId(session);

  if (!userId) {
    redirect(
      `/mine?${new URLSearchParams({ auth: 'login', returnTo: currentPath }).toString()}`,
    );
  }

  const parsedWordId = wordRowId ? parseWordRowId(wordRowId) : null;
  if (wordRowId && !parsedWordId) notFound();
  const word = parsedWordId ? await getGlobalWordByRowId(parsedWordId) : null;
  if (parsedWordId && !word) notFound();

  return (
    <div className="min-h-[calc(100dvh-76px)] px-5 pb-8">
      <header className="flex min-h-[76px] items-center gap-3 pt-[env(safe-area-inset-top)]">
        <BackButton fallback={requestedReturnTo} />
        <div className="min-w-0 flex-1 text-center">
          <p className="text-sm font-black text-ink">新建笔记本</p>
          <p className="mt-0.5 text-[10px] text-ink/35">只对你自己可见</p>
        </div>
        <div className="w-[54px]" aria-hidden="true" />
      </header>

      <section className="mt-4 rounded-[28px] bg-white p-5 shadow-card">
        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-forest/45">New notebook</p>
        <h1 className="mt-1 text-2xl font-black text-ink">给重点单词一个位置</h1>
        <p className="mt-2 text-sm leading-6 text-ink/45">
          {word
            ? `创建成功后，“${word.headWord}”会自动加入这个笔记本。`
            : '创建后，可以在学习页或查询单词时收藏。'}
        </p>
        <CreateNotebookForm
          wordRowId={wordRowId}
          returnTo={requestedReturnTo}
        />
      </section>
    </div>
  );
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseWordRowId(value: string): bigint | null {
  if (!/^\d{1,19}$/.test(value)) return null;
  const id = BigInt(value);
  return id > BigInt(0) && id <= MAX_BIGINT ? id : null;
}

function buildCurrentPath(wordRowId: string | undefined, returnTo: string) {
  const params = new URLSearchParams({ returnTo });
  if (wordRowId) params.set('wordRowId', wordRowId);
  return `/notebooks/new?${params.toString()}`;
}
