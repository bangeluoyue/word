export type BookListItem = {
  bookId: string;
  title: string;
  wordCount: number;
  coverUrl: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type BookInput = Pick<BookListItem, "bookId" | "title" | "wordCount" | "coverUrl" | "tags">;
