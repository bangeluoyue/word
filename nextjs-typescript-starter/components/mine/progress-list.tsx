import Link from 'next/link';

import { BookCover } from 'components/books/book-cover';
import { ArrowRightIcon, CheckIcon } from 'components/ui/icons';
import { ProgressBar } from 'components/ui/progress-bar';
import type { BookListItem } from 'lib/books/types';
import type { ProgressViewModel } from 'lib/progress/types';

export function ProgressList({
  books,
  progress,
}: {
  books: BookListItem[];
  progress: ProgressViewModel[];
}) {
  const sortedProgress = [...progress].sort((left, right) =>
    right.updated_at.localeCompare(left.updated_at),
  );

  if (sortedProgress.length === 0) {
    return (
      <div className="rounded-[28px] border border-dashed border-ink/10 bg-white px-6 py-10 text-center">
        <p className="text-sm font-bold text-ink/65">还没有学习记录</p>
        <p className="mt-1 text-xs text-ink/40">去首页选一本喜欢的单词书吧</p>
        <Link
          href="/"
          className="mt-5 inline-flex min-h-11 items-center rounded-full bg-forest px-5 text-xs font-bold text-white"
        >
          去首页
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sortedProgress.map((item) => {
        const book = books.find((candidate) => candidate.book_id === item.book_id);
        if (!book) return null;
        const percentage = Math.round((item.learned_count / item.total_words) * 100);

        return (
          <Link
            key={item.id}
            href={`/learn/${encodeURIComponent(item.book_id)}`}
            className="group flex items-center gap-3.5 rounded-[24px] bg-white p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover"
          >
            <BookCover book={book} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="line-clamp-2 text-sm font-bold leading-snug text-ink">
                  {book.title}
                </h3>
                <span
                  className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${
                    item.status === 'completed'
                      ? 'bg-mint text-forest'
                      : 'bg-sun/25 text-amber-900'
                  }`}
                >
                  {item.status === 'completed' ? (
                    <span className="inline-flex items-center gap-0.5">
                      <CheckIcon className="h-3 w-3" /> 已完成
                    </span>
                  ) : (
                    '学习中'
                  )}
                </span>
              </div>
              <div className="mb-1.5 mt-3 flex justify-between text-[11px] font-medium text-ink/45">
                <span>
                  已学 {item.learned_count} / {item.total_words}
                </span>
                <span className="font-bold text-forest">{percentage}%</span>
              </div>
              <ProgressBar value={percentage} tone="mint" />
            </div>
            <ArrowRightIcon className="h-5 w-5 shrink-0 text-ink/20 transition group-hover:translate-x-0.5" />
          </Link>
        );
      })}
    </div>
  );
}
