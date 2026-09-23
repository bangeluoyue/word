import 'server-only';

import { and, asc, count, desc, eq, sql } from 'drizzle-orm';

import { db } from 'lib/db/client';
import {
  userNotebooks,
  userNotebookWords,
  words,
} from 'lib/db/schema';
import type {
  NotebookListItem,
  WordNotebookMemberships,
} from 'lib/notebooks/types';
import type { WordSummary } from 'lib/words/types';

export async function listNotebooks(userId: number): Promise<NotebookListItem[]> {
  const rows = await db
    .select({
      id: userNotebooks.id,
      name: userNotebooks.name,
      wordCount: count(userNotebookWords.wordId),
      updatedAt: userNotebooks.updatedAt,
    })
    .from(userNotebooks)
    .leftJoin(
      userNotebookWords,
      eq(userNotebookWords.notebookId, userNotebooks.id),
    )
    .where(eq(userNotebooks.userId, userId))
    .groupBy(
      userNotebooks.id,
      userNotebooks.name,
      userNotebooks.updatedAt,
    )
    .orderBy(desc(userNotebooks.updatedAt), asc(userNotebooks.name));

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    wordCount: row.wordCount,
    updatedAt: row.updatedAt.toISOString(),
  }));
}

export async function listWordNotebookMemberships(
  userId: number,
): Promise<WordNotebookMemberships> {
  const rows = await db
    .select({
      notebookId: userNotebookWords.notebookId,
      wordId: userNotebookWords.wordId,
    })
    .from(userNotebookWords)
    .innerJoin(
      userNotebooks,
      and(
        eq(userNotebooks.id, userNotebookWords.notebookId),
        eq(userNotebooks.userId, userId),
      ),
    );

  return rows.reduce<WordNotebookMemberships>((memberships, row) => {
    const wordId = row.wordId.toString();
    memberships[wordId] = [...(memberships[wordId] ?? []), row.notebookId];
    return memberships;
  }, {});
}

export async function getNotebook(
  userId: number,
  notebookId: string,
): Promise<NotebookListItem | null> {
  const [row] = await db
    .select({
      id: userNotebooks.id,
      name: userNotebooks.name,
      wordCount: count(userNotebookWords.wordId),
      updatedAt: userNotebooks.updatedAt,
    })
    .from(userNotebooks)
    .leftJoin(
      userNotebookWords,
      eq(userNotebookWords.notebookId, userNotebooks.id),
    )
    .where(
      and(
        eq(userNotebooks.id, notebookId),
        eq(userNotebooks.userId, userId),
      ),
    )
    .groupBy(
      userNotebooks.id,
      userNotebooks.name,
      userNotebooks.updatedAt,
    )
    .limit(1);

  return row
    ? {
        id: row.id,
        name: row.name,
        wordCount: row.wordCount,
        updatedAt: row.updatedAt.toISOString(),
      }
    : null;
}

export async function listNotebookWords(
  userId: number,
  notebookId: string,
): Promise<WordSummary[]> {
  const normalizedHeadWord = sql<string>`coalesce(
    nullif(btrim(${words.content} -> 'word' ->> 'wordHead'), ''),
    nullif(btrim(${words.headWord}), '')
  )`;
  const firstTranslation = sql<string | null>`(
    select nullif(btrim(item ->> 'tranCn'), '')
    from json_array_elements(
      case
        when json_typeof(${words.content} -> 'word' -> 'content' -> 'trans') = 'array'
          then ${words.content} -> 'word' -> 'content' -> 'trans'
        else '[]'::json
      end
    ) with ordinality as translations(item, position)
    where nullif(btrim(item ->> 'tranCn'), '') is not null
    order by position
    limit 1
  )`;
  const rows = await db
    .select({
      id: words.id,
      headWord: normalizedHeadWord,
      translation: firstTranslation,
    })
    .from(userNotebookWords)
    .innerJoin(
      userNotebooks,
      and(
        eq(userNotebooks.id, userNotebookWords.notebookId),
        eq(userNotebooks.userId, userId),
      ),
    )
    .innerJoin(words, eq(words.id, userNotebookWords.wordId))
    .where(eq(userNotebookWords.notebookId, notebookId))
    .orderBy(desc(userNotebookWords.createdAt), asc(words.id));

  return rows.map((row) => ({
    id: row.id.toString(),
    headWord: row.headWord,
    translation: row.translation,
  }));
}
