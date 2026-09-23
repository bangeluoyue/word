import { bookThemes } from 'lib/books/themes';
import type { BookListItem } from 'lib/books/types';

export function BookCover({
  book,
  size = 'md',
}: {
  book: BookListItem;
  size?: 'sm' | 'md' | 'lg';
}) {
  const theme = bookThemes[book.book_id] ?? {
    accent: '#f7c65d',
    background: '#24473f',
    shortTitle: 'WORDS',
  };
  const dimensions = {
    sm: 'h-[72px] w-[56px] rounded-[13px]',
    md: 'h-[104px] w-[78px] rounded-[17px]',
    lg: 'h-[132px] w-[98px] rounded-[20px]',
  }[size];
  const coverUrl = getHttpUrl(book.cover_url);

  if (coverUrl) {
    return (
      <div
        className={`relative shrink-0 overflow-hidden bg-ink/5 bg-cover bg-center shadow-book ${dimensions}`}
        style={{ backgroundImage: `url(${JSON.stringify(coverUrl)})` }}
        aria-label={`${book.title}封面`}
        role="img"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 top-0 w-[7px] bg-black/10" />
      </div>
    );
  }

  return (
    <div
      className={`relative shrink-0 overflow-hidden shadow-book ${dimensions}`}
      style={{ backgroundColor: theme.background }}
      aria-label={`${book.title}封面`}
      role="img"
    >
      <div className="absolute bottom-0 left-0 top-0 w-[7px] bg-black/15" />
      <div
        className="absolute -right-4 -top-5 h-16 w-16 rounded-full opacity-90"
        style={{ backgroundColor: theme.accent }}
      />
      <div className="absolute left-4 right-2 top-5">
        <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-white/60">
          Word flow
        </p>
        <p className="mt-1 font-serif text-[13px] font-bold leading-tight text-white">
          {theme.shortTitle}
        </p>
      </div>
      <div
        className="absolute bottom-3 left-4 h-1 w-6 rounded-full"
        style={{ backgroundColor: theme.accent }}
      />
    </div>
  );
}

function getHttpUrl(value: string | null) {
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}
