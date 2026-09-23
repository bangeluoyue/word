import { notFound, redirect } from 'next/navigation';

import { auth } from 'app/auth';
import { NotebookWordList } from 'components/notebooks/notebook-word-list';
import { BackButton } from 'components/ui/back-button';
import { getSessionUserId } from 'lib/auth/session';
import {
  getNotebook,
  listNotebookWords,
} from 'lib/repositories/notebook-repository';
import { isNotebookId } from 'lib/services/notebook-service';

export default async function NotebookDetailPage({
  params,
}: {
  params: { notebookId: string };
}) {
  const returnTo = `/notebooks/${encodeURIComponent(params.notebookId)}`;
  const session = await auth();
  const userId = getSessionUserId(session);
  if (!userId) {
    redirect(
      `/mine?${new URLSearchParams({ auth: 'login', returnTo }).toString()}`,
    );
  }
  if (!isNotebookId(params.notebookId)) notFound();

  const [notebook, words] = await Promise.all([
    getNotebook(userId, params.notebookId),
    listNotebookWords(userId, params.notebookId),
  ]);
  if (!notebook) notFound();

  return (
    <div className="min-h-[calc(100dvh-76px)] px-5 pb-8">
      <header className="flex min-h-[76px] items-center gap-3 pt-[env(safe-area-inset-top)]">
        <BackButton fallback="/mine" />
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-sm font-black text-ink">{notebook.name}</p>
          <p className="mt-0.5 text-[10px] text-ink/35">{notebook.wordCount} 个单词</p>
        </div>
        <div className="w-[54px]" aria-hidden="true" />
      </header>

      <div className="mb-3 mt-4 px-1">
        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-ink/30">Saved words</p>
        <h1 className="mt-0.5 text-lg font-black text-ink">收藏的单词</h1>
      </div>
      <NotebookWordList words={words} />
    </div>
  );
}
