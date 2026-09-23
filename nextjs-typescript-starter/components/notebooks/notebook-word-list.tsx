import Link from 'next/link';

import { ArrowRightIcon, SearchIcon } from 'components/ui/icons';
import type { WordSummary } from 'lib/words/types';

export function NotebookWordList({ words }: { words: WordSummary[] }) {
  if (words.length === 0) {
    return (
      <div className="rounded-[24px] border border-dashed border-ink/12 bg-white/70 px-6 py-12 text-center">
        <p className="text-sm font-bold text-ink/60">还没有收藏单词</p>
        <Link href="/words" className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-forest underline">
          <SearchIcon className="h-4 w-4" /> 去查询单词
        </Link>
      </div>
    );
  }

  return (
    <ul className="overflow-hidden rounded-[24px] border border-ink/[0.06] bg-white shadow-card">
      {words.map((word) => (
        <li key={word.id} className="border-b border-ink/[0.06] last:border-0">
          <Link
            href={`/words/${word.id}`}
            className="group flex min-h-[72px] items-center gap-3 px-4 py-3 transition hover:bg-mint/35"
          >
            <span className="min-w-0 flex-1">
              <span className="block truncate font-serif text-[17px] font-black text-ink group-hover:text-forest">
                {word.headWord}
              </span>
              <span className="mt-1 block truncate text-xs text-ink/45">
                {word.translation ?? '暂无中文释义'}
              </span>
            </span>
            <ArrowRightIcon className="h-5 w-5 shrink-0 text-ink/20 transition group-hover:translate-x-0.5" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
