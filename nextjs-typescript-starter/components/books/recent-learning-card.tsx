import Link from 'next/link';

import { ArrowRightIcon, SparkleIcon } from 'components/ui/icons';
import { ProgressBar } from 'components/ui/progress-bar';
import type { BookListItem } from 'lib/books/types';
import type { ProgressViewModel } from 'lib/progress/types';

import { BookCover } from './book-cover';

export function RecentLearningCard({
  book,
  progress,
}: {
  book: BookListItem;
  progress: ProgressViewModel;
}) {
  const percentage = Math.round(
    (progress.learned_count / progress.total_words) * 100,
  );

  return (
    <Link
      href={`/learn/${encodeURIComponent(book.book_id)}`}
      className="group relative block overflow-hidden rounded-[28px] bg-forest p-5 text-white shadow-feature transition duration-300 hover:-translate-y-0.5"
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full border-[24px] border-white/[0.04]" />
      <div className="pointer-events-none absolute bottom-4 right-20 h-3 w-3 rounded-full bg-sun" />
      <div className="relative flex items-center gap-4">
        <BookCover book={book} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-sun">
            <SparkleIcon className="h-3.5 w-3.5" /> Continue
          </div>
          <h3 className="line-clamp-2 text-sm font-bold leading-snug">{book.title}</h3>
          <p className="mt-1 text-xs text-white/55">
            已学 {progress.learned_count} / {progress.total_words} 个单词
          </p>
          <div className="mt-3 flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <ProgressBar value={percentage} tone="light" />
            </div>
            <span className="text-xs font-bold text-sun">{percentage}%</span>
          </div>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-forest shadow-sm transition group-hover:translate-x-0.5">
          <ArrowRightIcon className="h-5 w-5" />
        </span>
      </div>
    </Link>
  );
}
