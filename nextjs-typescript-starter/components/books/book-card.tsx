import Link from 'next/link';

import { ArrowRightIcon, CheckIcon, LockIcon } from 'components/ui/icons';
import { ProgressBar } from 'components/ui/progress-bar';
import type { BookListItem } from 'lib/books/types';
import type { ProgressViewModel } from 'lib/progress/types';

import { BookCover } from './book-cover';

export function BookCard({
  book,
  progress,
  isLoggedIn,
}: {
  book: BookListItem;
  progress?: ProgressViewModel;
  isLoggedIn: boolean;
}) {
  const learnPath = `/learn/${encodeURIComponent(book.book_id)}`;
  const href = isLoggedIn
    ? learnPath
    : `/mine?${new URLSearchParams({
        auth: 'login',
        returnTo: learnPath,
      }).toString()}`;
  const percentage = progress
    ? Math.round((progress.learned_count / progress.total_words) * 100)
    : 0;
  const tags = book.tags?.split(',').map((tag) => tag.trim()).filter(Boolean) ?? [];

  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-[24px] border border-ink/[0.06] bg-white p-4 shadow-card transition duration-300 hover:-translate-y-0.5 hover:shadow-card-hover"
    >
      <BookCover book={book} />
      <div className="min-w-0 flex-1 py-0.5">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-mint px-2 py-0.5 text-[10px] font-bold text-forest/75"
            >
              {tag}
            </span>
          ))}
        </div>
        <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-ink">
          {book.title}
        </h3>

        {progress ? (
          <div className="mt-3">
            <div className="mb-1.5 flex items-center justify-between text-[11px] font-medium">
              <span className="text-ink/50">
                {progress.status === 'completed'
                  ? `${progress.total_words} 词已学完`
                  : `已学 ${progress.learned_count} / ${progress.total_words}`}
              </span>
              <span className="inline-flex items-center gap-1 font-bold text-forest">
                {progress.status === 'completed' && <CheckIcon className="h-3.5 w-3.5" />}
                {progress.status === 'completed' ? '已完成' : `${percentage}%`}
              </span>
            </div>
            <ProgressBar value={percentage} tone="mint" />
          </div>
        ) : (
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="font-medium text-ink/45">{book.word_count} 个单词</span>
            {!isLoggedIn && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-ink/40">
                <LockIcon className="h-3.5 w-3.5" /> 登录后学习
              </span>
            )}
          </div>
        )}
      </div>
      <ArrowRightIcon className="h-5 w-5 shrink-0 text-ink/25 transition group-hover:translate-x-0.5 group-hover:text-forest" />
    </Link>
  );
}
