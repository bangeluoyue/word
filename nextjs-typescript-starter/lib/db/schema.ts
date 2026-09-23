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
  primaryKey,
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
    bookId: text('book_id').primaryKey(),
    title: varchar('title', { length: 200 }).notNull(),
    wordCount: integer('word_count').default(0).notNull(),
    coverUrl: text('cover_url').notNull(),
    tags: text('tags').array().default(sql`ARRAY[]::text[]`).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    wordCountNonnegative: check(
      'books_word_count_check',
      sql`${table.wordCount} >= 0`,
    ),
    updatedAtIndex: index('books_updated_at_idx').on(table.updatedAt),
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
      name: 'words_book_legacy_fk',
      columns: [table.bookId],
      foreignColumns: [books.bookId],
    })
      .onUpdate('cascade')
      .onDelete('set null'),
    rankPositive: check(
      'words_rank_positive',
      sql`${table.wordRank} is null or ${table.wordRank} > 0`,
    ),
    bookIdIndex: index('words_book_id_idx').on(table.bookId),
    bookRankIdIndex: index('words_book_rank_id_idx').on(
      table.bookId,
      table.wordRank,
      table.id,
    ),
    // words_book_word_id_unique is an expression index and is maintained in
    // the SQL migration because Drizzle 0.29 only accepts columns in .on().
  }),
);

export const bookWords = pgTable(
  'book_words',
  {
    bookId: text('book_id').notNull(),
    wordId: bigint('word_id', { mode: 'bigint' }).notNull(),
    wordRank: integer('word_rank').notNull(),
    addedAt: timestamp('added_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    primaryKey: primaryKey({
      name: 'book_words_pkey',
      columns: [table.bookId, table.wordId],
    }),
    bookForeignKey: foreignKey({
      name: 'book_words_book_id_books_book_id_fk',
      columns: [table.bookId],
      foreignColumns: [books.bookId],
    }).onDelete('cascade'),
    wordForeignKey: foreignKey({
      name: 'book_words_word_id_words_id_fk',
      columns: [table.wordId],
      foreignColumns: [words.id],
    }).onDelete('restrict'),
    bookRankUnique: unique('book_words_book_rank_unique').on(
      table.bookId,
      table.wordRank,
    ),
    rankPositive: check(
      'book_words_rank_positive',
      sql`${table.wordRank} > 0`,
    ),
    wordIdIndex: index('book_words_word_id_idx').on(table.wordId),
  }),
);

export const appUsers = pgTable('app_users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 254 }).notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  nickName: varchar('nick_name', { length: 24 }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull(),
  // Case-insensitive email and nickname expression indexes live in SQL
  // migrations for compatibility with the installed Drizzle version.
});

export const userNotebooks = pgTable(
  'user_notebooks',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: integer('user_id').notNull(),
    name: varchar('name', { length: 50 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userForeignKey: foreignKey({
      name: 'user_notebooks_app_user_fk',
      columns: [table.userId],
      foreignColumns: [appUsers.id],
    }).onDelete('cascade'),
    nameCheck: check(
      'user_notebooks_name_check',
      sql`char_length(btrim(${table.name})) between 1 and 50`,
    ),
    userIdIndex: index('user_notebooks_user_id_idx').on(table.userId),
    // user_notebooks_user_name_unique is an expression index in SQL.
  }),
);

export const userNotebookWords = pgTable(
  'user_notebook_words',
  {
    notebookId: uuid('notebook_id').notNull(),
    wordId: bigint('word_id', { mode: 'bigint' }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    primaryKey: primaryKey({
      name: 'user_notebook_words_pkey',
      columns: [table.notebookId, table.wordId],
    }),
    notebookForeignKey: foreignKey({
      name: 'user_notebook_words_notebook_fk',
      columns: [table.notebookId],
      foreignColumns: [userNotebooks.id],
    }).onDelete('cascade'),
    wordForeignKey: foreignKey({
      name: 'user_notebook_words_word_fk',
      columns: [table.wordId],
      foreignColumns: [words.id],
    }).onDelete('restrict'),
    wordIdIndex: index('user_notebook_words_word_id_idx').on(table.wordId),
  }),
);

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
      name: 'learning_progress_app_user_fk',
      columns: [table.userId],
      foreignColumns: [appUsers.id],
    }).onDelete('cascade'),
    bookForeignKey: foreignKey({
      name: 'learning_progress_book_fk',
      columns: [table.bookId],
      foreignColumns: [books.bookId],
    })
      .onUpdate('cascade')
      .onDelete('restrict'),
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
export type BookWord = typeof bookWords.$inferSelect;
export type AppUser = typeof appUsers.$inferSelect;
export type UserNotebook = typeof userNotebooks.$inferSelect;
export type UserNotebookWord = typeof userNotebookWords.$inferSelect;
export type LearningProgress = typeof learningProgress.$inferSelect;
