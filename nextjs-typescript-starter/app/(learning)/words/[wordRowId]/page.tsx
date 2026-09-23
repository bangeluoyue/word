import { notFound } from 'next/navigation';

import { BackButton } from 'components/ui/back-button';
import { WordDetailContent } from 'components/word-detail/word-detail-content';
import { getGlobalWordByRowId } from 'lib/repositories/word-repository';

const MAX_BIGINT = BigInt('9223372036854775807');

export default async function GlobalWordDetailPage({
  params,
}: {
  params: { wordRowId: string };
}) {
  const rowId = parseWordRowId(params.wordRowId);
  if (!rowId) notFound();

  const word = await getGlobalWordByRowId(rowId);
  if (!word) notFound();

  return (
    <div className="min-h-dvh">
      <header className="flex min-h-[76px] items-center gap-3 px-5 pt-[env(safe-area-inset-top)]">
        <BackButton fallback="/words" />
        <div className="min-w-0 flex-1 text-center">
          <p className="text-sm font-black text-ink">单词详情</p>
          <p className="mt-0.5 truncate text-[10px] text-ink/35">公共词库</p>
        </div>
        <div className="w-[54px]" aria-hidden="true" />
      </header>
      <WordDetailContent word={word} />
    </div>
  );
}

function parseWordRowId(value: string): bigint | null {
  if (!/^\d{1,19}$/.test(value)) return null;

  const rowId = BigInt(value);
  return rowId > BigInt(0) && rowId <= MAX_BIGINT ? rowId : null;
}
