import 'server-only';

import { asc, desc, eq } from 'drizzle-orm';

import type { BookListItem } from 'lib/books/types';
import { db } from 'lib/db/client';
import { books } from 'lib/db/schema';

/**
 * 获取首页需要的全部单词书元数据。
 *
 * 这里显式选择首页实际使用的字段，避免把数据库内部主键、审计字段或后续新增
 * 字段暴露给页面。首页只读取目录数据，不加载体积较大的 words.content。
 */
export async function listBooks(): Promise<BookListItem[]> {
  const rows = await db
    .select({
      title: books.title,
      wordCount: books.wordCount,
      coverUrl: books.coverUrl,
      bookId: books.bookId,
      tags: books.tags,
    })
    .from(books)
    .orderBy(desc(books.createdAt), asc(books.bookId));

  return rows.map(mapBook);
}

export async function getBook(bookId: string): Promise<BookListItem | null> {
  const [book] = await db
    .select({
      title: books.title,
      wordCount: books.wordCount,
      coverUrl: books.coverUrl,
      bookId: books.bookId,
      tags: books.tags,
    })
    .from(books)
    .where(eq(books.bookId, bookId))
    .limit(1);

  return book ? mapBook(book) : null;
}

function mapBook(book: {
  title: string;
  wordCount: number;
  coverUrl: string | null;
  bookId: string;
  tags: string[] | null;
}): BookListItem {
  return {
    title: book.title,
    word_count: book.wordCount,
    cover_url: book.coverUrl,
    book_id: book.bookId,
    tags: normalizeTags(book.tags),
  };
}

/**
 * 兼容历史数据中出现过的 text、PostgreSQL text[] 和 JSON 数组形式。
 * 当前 schema 使用 text[]，兼容逻辑只放在数据库边界。
 */
function normalizeTags(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed || null;
  }

  if (Array.isArray(value)) {
    const tags = value
      .filter((tag): tag is string => typeof tag === 'string')
      .map((tag) => tag.trim())
      .filter(Boolean);
    return tags.length > 0 ? tags.join(',') : null;
  }

  return null;
}
