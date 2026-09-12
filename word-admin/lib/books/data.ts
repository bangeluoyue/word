import "server-only";

import { desc } from "drizzle-orm";
import { db } from "@/db";
import { books } from "@/db/schema";
import type { BookListItem } from "./types";

export const bookSelection = {
  bookId: books.bookId,
  title: books.title,
  wordCount: books.wordCount,
  coverUrl: books.coverUrl,
  tags: books.tags,
  createdAt: books.createdAt,
  updatedAt: books.updatedAt,
};

export function serializeBook(book: typeof books.$inferSelect): BookListItem {
  return {
    ...book,
    createdAt: book.createdAt.toISOString(),
    updatedAt: book.updatedAt.toISOString(),
  };
}

export async function listBooks() {
  const rows = await db.select(bookSelection).from(books).orderBy(desc(books.updatedAt));
  return rows.map(serializeBook);
}
