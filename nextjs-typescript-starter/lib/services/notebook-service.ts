import 'server-only';

import { postgresClient } from 'lib/db/client';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_BIGINT = BigInt('9223372036854775807');

export type CreateNotebookResult =
  | { ok: true; notebookId: string }
  | { ok: false; code: 'INVALID_INPUT' | 'WORD_NOT_FOUND'; message: string };

export type SaveFavoriteResult =
  | { ok: true; selectedNotebookIds: string[] }
  | {
      ok: false;
      code: 'INVALID_INPUT' | 'WORD_NOT_FOUND' | 'FORBIDDEN';
      message: string;
    };

export async function createNotebook(input: {
  userId: number;
  name: string;
  wordRowId?: string;
}): Promise<CreateNotebookResult> {
  const name = input.name.trim();
  if (!name || name.length > 50 || /[\u0000-\u001f\u007f]/.test(name)) {
    return { ok: false, code: 'INVALID_INPUT', message: '名称需要为 1–50 个字符' };
  }

  const wordRowId = input.wordRowId
    ? parseWordRowId(input.wordRowId)
    : null;
  if (input.wordRowId && !wordRowId) {
    return { ok: false, code: 'INVALID_INPUT', message: '待收藏的单词无效' };
  }

  return postgresClient.begin(async (transaction) => {
    if (wordRowId) {
      const [word] = await transaction`
        select id from public.words where id = ${wordRowId.toString()} limit 1
      `;
      if (!word) {
        return { ok: false, code: 'WORD_NOT_FOUND', message: '待收藏的单词不存在' };
      }
    }

    const [notebook] = await transaction`
      insert into public.user_notebooks (user_id, name)
      values (${input.userId}, ${name})
      returning id::text as id
    `;

    if (wordRowId) {
      await transaction`
        insert into public.user_notebook_words (notebook_id, word_id)
        values (${notebook.id}, ${wordRowId.toString()})
        on conflict (notebook_id, word_id) do nothing
      `;
    }

    return { ok: true, notebookId: String(notebook.id) };
  });
}

export async function saveWordNotebookSelections(input: {
  userId: number;
  wordRowId: string;
  notebookIds: string[];
}): Promise<SaveFavoriteResult> {
  const wordRowId = parseWordRowId(input.wordRowId);
  const notebookIds = Array.from(new Set(input.notebookIds));
  if (
    !wordRowId ||
    notebookIds.length > 100 ||
    notebookIds.some((id) => !UUID_PATTERN.test(id))
  ) {
    return { ok: false, code: 'INVALID_INPUT', message: '收藏请求无效' };
  }

  return postgresClient.begin(async (transaction) => {
    const [word] = await transaction`
      select id from public.words where id = ${wordRowId.toString()} limit 1
    `;
    if (!word) {
      return { ok: false, code: 'WORD_NOT_FOUND', message: '单词不存在' };
    }

    const ownedRows = await transaction`
      select id::text as id
      from public.user_notebooks
      where user_id = ${input.userId}
      for update
    `;
    const ownedIds = new Set(ownedRows.map((row) => String(row.id)));
    if (notebookIds.some((id) => !ownedIds.has(id))) {
      return { ok: false, code: 'FORBIDDEN', message: '没有权限使用该笔记本' };
    }

    await transaction`
      delete from public.user_notebook_words memberships
      using public.user_notebooks notebooks
      where memberships.notebook_id = notebooks.id
        and notebooks.user_id = ${input.userId}
        and memberships.word_id = ${wordRowId.toString()}
    `;

    for (const notebookId of notebookIds) {
      await transaction`
        insert into public.user_notebook_words (notebook_id, word_id)
        values (${notebookId}, ${wordRowId.toString()})
        on conflict (notebook_id, word_id) do nothing
      `;
    }

    if (notebookIds.length > 0) {
      await transaction`
        update public.user_notebooks
        set updated_at = now()
        where id in (
          select notebook_id
          from public.user_notebook_words
          where word_id = ${wordRowId.toString()}
        ) and user_id = ${input.userId}
      `;
    }

    return { ok: true, selectedNotebookIds: notebookIds };
  });
}

export function isNotebookId(value: string) {
  return UUID_PATTERN.test(value);
}

function parseWordRowId(value: string): bigint | null {
  if (!/^\d{1,19}$/.test(value)) return null;
  const id = BigInt(value);
  return id > BigInt(0) && id <= MAX_BIGINT ? id : null;
}
