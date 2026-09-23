import Link from 'next/link';

import {
  ArrowRightIcon,
  NotebookIcon,
  PlusIcon,
} from 'components/ui/icons';
import type { NotebookListItem } from 'lib/notebooks/types';

export function NotebookSection({
  notebooks,
  loadFailed,
}: {
  notebooks: NotebookListItem[];
  loadFailed: boolean;
}) {
  return (
    <section aria-labelledby="notebooks-title">
      <div className="mb-3 flex items-end justify-between px-1">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-ink/30">
            Saved words
          </p>
          <h2 id="notebooks-title" className="mt-0.5 text-lg font-black text-ink">
            我的笔记本
          </h2>
        </div>
        <Link
          href="/notebooks/new?returnTo=%2Fmine"
          className="inline-flex min-h-10 items-center gap-1 rounded-full bg-forest px-3.5 text-xs font-bold text-white"
        >
          <PlusIcon className="h-4 w-4" /> 新建
        </Link>
      </div>

      {loadFailed ? (
        <div className="rounded-[24px] bg-white px-5 py-8 text-center shadow-card" role="alert">
          <p className="text-sm font-bold text-ink/65">笔记本加载失败</p>
          <a href="/mine" className="mt-3 inline-block text-xs font-bold text-forest underline">
            重新加载
          </a>
        </div>
      ) : notebooks.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-ink/10 bg-white/70 px-6 py-9 text-center">
          <NotebookIcon className="mx-auto h-10 w-10 text-forest/30" />
          <p className="mt-3 text-sm font-bold text-ink/65">还没有笔记本</p>
          <p className="mt-1 text-xs text-ink/38">创建一个，收藏想重点记忆的单词</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notebooks.map((notebook) => (
            <Link
              key={notebook.id}
              href={`/notebooks/${notebook.id}`}
              className="group flex min-h-[76px] items-center gap-3.5 rounded-[24px] bg-white px-4 py-3 shadow-card transition hover:-translate-y-0.5"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-mint text-forest">
                <NotebookIcon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-black text-ink">{notebook.name}</span>
                <span className="mt-1 block text-xs text-ink/38">{notebook.wordCount} 个单词</span>
              </span>
              <ArrowRightIcon className="h-5 w-5 text-ink/20 transition group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
