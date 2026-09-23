import { notFound, redirect } from 'next/navigation';

import { auth } from 'app/auth';
import { BackButton } from 'components/ui/back-button';
import { WordDetailContent } from 'components/word-detail/word-detail-content';
import { getSessionUserId } from 'lib/auth/session';
import { getBook } from 'lib/repositories/book-repository';
import { getWordByBusinessId } from 'lib/repositories/word-repository';

type SearchParams = Record<string, string | string[] | undefined>;

export default async function WordDetailPage({
  params,
  searchParams = {},
}: {
  params: { wordId: string };
  searchParams?: SearchParams;
}) {
  const bookIdValue = searchParams.bookId;
  const bookId = Array.isArray(bookIdValue) ? bookIdValue[0] : bookIdValue;
  const returnPath = bookId
    ? `/word/${encodeURIComponent(params.wordId)}?bookId=${encodeURIComponent(bookId)}`
    : '/mine';
  const session = await auth();
  const userId = getSessionUserId(session);

  if (!session?.user || !userId) {
    redirect(
      `/mine?${new URLSearchParams({ auth: 'login', returnTo: returnPath }).toString()}`,
    );
  }
  if (
    !bookId ||
    bookId.length > 128 ||
    !params.wordId ||
    params.wordId.length > 256
  ) {
    notFound();
  }

  const [book, word] = await Promise.all([
    getBook(bookId),
    getWordByBusinessId(bookId, params.wordId),
  ]);
  if (!book || !word) notFound();

  return (
    <div className="min-h-dvh">
      <header className="flex min-h-[76px] items-center gap-3 px-5 pt-[env(safe-area-inset-top)]">
        <BackButton fallback={`/learn/${encodeURIComponent(bookId)}`} />
        <div className="min-w-0 flex-1 text-center">
          <p className="text-sm font-black text-ink">单词详情</p>
          <p className="mt-0.5 truncate text-[10px] text-ink/35">{book.title}</p>
        </div>
        <div className="w-[54px]" aria-hidden="true" />
      </header>
      <WordDetailContent word={word} />
    </div>
  );
}
