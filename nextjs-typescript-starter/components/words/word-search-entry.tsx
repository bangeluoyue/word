import Link from 'next/link';

import { ArrowRightIcon, SearchIcon } from 'components/ui/icons';

export function WordSearchEntry() {
  return (
    <section aria-label="查询单词">
      <Link
        href="/words"
        className="group flex items-center gap-4 rounded-[24px] bg-forest px-4 py-4 text-white shadow-feature transition hover:-translate-y-0.5"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sun text-forest">
          <SearchIcon className="h-6 w-6" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[9px] font-bold uppercase tracking-[0.18em] text-white/40">
            Dictionary
          </span>
          <span className="mt-0.5 block text-base font-black">查询单词</span>
          <span className="mt-0.5 block text-xs text-white/50">
            搜索词库，查看完整释义
          </span>
        </span>
        <ArrowRightIcon className="h-5 w-5 shrink-0 text-white/35 transition group-hover:translate-x-0.5 group-hover:text-sun" />
      </Link>
    </section>
  );
}
