import { sql } from 'drizzle-orm';
import {
  bigint,
  bigserial,
  check,
  foreignKey,
  index,
  integer,
  json,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export type LearningStatus = 'learning' | 'completed';

export const books = pgTable(
  'books',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    title: text('title').notNull(),
    wordCount: integer('word_count').default(0).notNull(),
    coverUrl: text('cover_url'),
    bookId: text('book_id').notNull(),
    tags: text('tags'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    bookIdUnique: unique('books_book_id_unique').on(table.bookId),
    wordCountNonnegative: check(
      'books_word_count_nonnegative',
      sql`${table.wordCount} >= 0`,
    ),
  }),
);

export const words = pgTable(
  'words',
  {
    // Drizzle 0.29 has no identity-column builder. bigserial preserves the
    // generated bigint insert type while the checked-in SQL remains canonical.
    id: bigserial('id', { mode: 'bigint' }).primaryKey(),
    wordRank: integer('wordRank'),
    headWord: text('headWord'),
    content: json('content').$type<unknown>(),
    bookId: text('bookId'),
  },
  (table) => ({
    bookForeignKey: foreignKey({
      name: 'words_book_fk',
      columns: [table.bookId],
      foreignColumns: [books.bookId],
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    rankPositive: check(
      'words_rank_positive',
      sql`${table.wordRank} is null or ${table.wordRank} > 0`,
    ),
    bookRankIdIndex: index('words_book_rank_id_idx').on(
      table.bookId,
      table.wordRank,
      table.id,
    ),
    // words_book_word_id_unique is an expression index and is maintained in
    // the SQL migration because Drizzle 0.29 only accepts columns in .on().
  }),
);

export const users = pgTable('User', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 254 }).notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull(),
  // user_email_lower_unique is an expression index and lives in the SQL
  // migration for compatibility with the installed Drizzle version.
});

export const learningProgress = pgTable(
  'learning_progress',
  {
    id: bigserial('id', { mode: 'bigint' }).primaryKey(),
    userId: integer('user_id').notNull(),
    bookId: text('book_id').notNull(),
    lastWordRowId: bigint('last_word_row_id', { mode: 'bigint' }),
    lastWordRank: integer('last_word_rank'),
    learnedCount: integer('learned_count').default(0).notNull(),
    totalWords: integer('total_words').notNull(),
    status: text('status').$type<LearningStatus>().default('learning').notNull(),
    version: integer('version').default(0).notNull(),
    startedAt: timestamp('started_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    completedAt: timestamp('completed_at', {
      withTimezone: true,
      mode: 'date',
    }),
  },
  (table) => ({
    userForeignKey: foreignKey({
      name: 'learning_progress_user_fk',
      columns: [table.userId],
      foreignColumns: [users.id],
    }).onDelete('cascade'),
    bookForeignKey: foreignKey({
      name: 'learning_progress_book_fk',
      columns: [table.bookId],
      foreignColumns: [books.bookId],
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    lastWordForeignKey: foreignKey({
      name: 'learning_progress_last_word_fk',
      columns: [table.lastWordRowId],
      foreignColumns: [words.id],
    }).onDelete('set null'),
    userBookUnique: unique('learning_progress_user_book_unique').on(
      table.userId,
      table.bookId,
    ),
    statusCheck: check(
      'learning_progress_status_check',
      sql`${table.status} in ('learning', 'completed')`,
    ),
    countCheck: check(
      'learning_progress_count_check',
      sql`${table.totalWords} > 0
        and ${table.learnedCount} >= 0
        and ${table.learnedCount} <= ${table.totalWords}`,
    ),
    rankCheck: check(
      'learning_progress_rank_check',
      sql`(${table.learnedCount} = 0 and ${table.lastWordRank} is null)
        or (${table.learnedCount} > 0 and ${table.lastWordRank} is not null)`,
    ),
    completionCheck: check(
      'learning_progress_completion_check',
      sql`(
          ${table.status} = 'learning'
          and ${table.learnedCount} < ${table.totalWords}
          and ${table.completedAt} is null
        ) or (
          ${table.status} = 'completed'
          and ${table.learnedCount} = ${table.totalWords}
          and ${table.completedAt} is not null
        )`,
    ),
    userUpdatedIndex: index('learning_progress_user_updated_idx').on(
      table.userId,
      table.updatedAt,
    ),
    recentLearningIndex: index('learning_progress_recent_learning_idx')
      .on(table.userId, table.updatedAt)
      .where(sql`${table.status} = 'learning'`),
  }),
);

export const schemaMigrations = pgTable('schema_migrations', {
  name: text('name').primaryKey(),
  checksum: varchar('checksum', { length: 64 }).notNull(),
  appliedAt: timestamp('applied_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull(),
});

export type Book = typeof books.$inferSelect;
export type Word = typeof words.$inferSelect;
export type User = typeof users.$inferSelect;
export type LearningProgress = typeof learningProgress.$inferSelect;

