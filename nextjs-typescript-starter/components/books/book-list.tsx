import type { BookListItem } from 'lib/books/types';
import type { ProgressViewModel } from 'lib/progress/types';

import { BookCard } from './book-card';

export function BookList({
  books,
  progress,
  isLoggedIn,
}: {
  books: BookListItem[];
  progress: ProgressViewModel[];
  isLoggedIn: boolean;
}) {
  if (books.length === 0) {
    return (
      <div className="rounded-[24px] border border-dashed border-ink/15 bg-white/60 px-6 py-12 text-center">
        <p className="text-sm font-semibold text-ink/60">暂无单词书，请稍后再来</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {books.map((book) => (
        <BookCard
          key={book.book_id}
          book={book}
          progress={progress.find((item) => item.book_id === book.book_id)}
          isLoggedIn={isLoggedIn}
        />
      ))}
    </div>
  );
}
