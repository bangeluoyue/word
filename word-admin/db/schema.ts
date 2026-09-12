import { relations, sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  index,
  integer,
  json,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const ADMIN_ROLES = ["system", "admin"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export const adminUsers = pgTable(
  "admin_users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    role: varchar("role", { length: 20 }).$type<AdminRole>().notNull().default("admin"),
    isActive: boolean("is_active").notNull().default(true),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("admin_users_email_unique").on(table.email),
    check("admin_users_role_check", sql`${table.role} in ('system', 'admin')`),
  ],
);

export const adminSessions = pgTable(
  "admin_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => adminUsers.id, { onDelete: "cascade" }),
    tokenHash: varchar("token_hash", { length: 64 }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("admin_sessions_token_hash_unique").on(table.tokenHash),
    index("admin_sessions_user_id_idx").on(table.userId),
    index("admin_sessions_expires_at_idx").on(table.expiresAt),
  ],
);

export const books = pgTable(
  "books",
  {
    bookId: text("book_id").primaryKey(),
    title: varchar("title", { length: 200 }).notNull(),
    wordCount: integer("word_count").notNull().default(0),
    coverUrl: text("cover_url").notNull(),
    tags: text("tags").array().notNull().default(sql`ARRAY[]::text[]`),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check("books_word_count_check", sql`${table.wordCount} >= 0`),
    index("books_updated_at_idx").on(table.updatedAt),
  ],
);

export const words = pgTable(
  "words",
  {
    id: bigint("id", { mode: "number" }).generatedByDefaultAsIdentity().primaryKey(),
    wordRank: integer("wordRank"),
    headWord: text("headWord"),
    content: json("content"),
    bookId: text("bookId").references(() => books.bookId, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  },
  (table) => [index("words_book_id_idx").on(table.bookId)],
);

export const booksRelations = relations(books, ({ many }) => ({
  words: many(words),
}));

export const wordsRelations = relations(words, ({ one }) => ({
  book: one(books, {
    fields: [words.bookId],
    references: [books.bookId],
  }),
}));

export type AdminUser = typeof adminUsers.$inferSelect;
export type NewAdminUser = typeof adminUsers.$inferInsert;
export type Book = typeof books.$inferSelect;
export type NewBook = typeof books.$inferInsert;
export type Word = typeof words.$inferSelect;
export type NewWord = typeof words.$inferInsert;
