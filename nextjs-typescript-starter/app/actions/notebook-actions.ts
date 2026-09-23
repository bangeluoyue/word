'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { auth } from 'app/auth';
import { getSafeReturnTo } from 'lib/auth-redirect';
import { getSessionUserId } from 'lib/auth/session';
import {
  createNotebook,
  saveWordNotebookSelections,
  type SaveFavoriteResult,
} from 'lib/services/notebook-service';

export type CreateNotebookActionState = {
  ok: boolean;
  message?: string;
  fieldError?: string;
};

export async function createNotebookAction(
  _previousState: CreateNotebookActionState,
  formData: FormData,
): Promise<CreateNotebookActionState> {
  const session = await auth();
  const userId = getSessionUserId(session);
  if (!userId) return { ok: false, message: '登录状态已失效，请重新登录' };

  const name = String(formData.get('name') ?? '');
  const wordRowId = String(formData.get('wordRowId') ?? '').trim() || undefined;
  const returnTo = getSafeReturnTo(
    String(formData.get('returnTo') ?? '').trim(),
  );

  let result;
  try {
    result = await createNotebook({ userId, name, wordRowId });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { ok: false, fieldError: '你已经有同名笔记本了' };
    }
    logNotebookError('create', error);
    return { ok: false, message: '创建失败，请检查网络后重试' };
  }

  if (!result.ok) return { ok: false, fieldError: result.message };

  revalidatePath('/mine');
  revalidatePath('/words');
  revalidatePath(`/notebooks/${result.notebookId}`);
  redirect(returnTo);
}

export async function saveFavoriteAction(input: {
  wordRowId: string;
  notebookIds: string[];
}): Promise<SaveFavoriteResult | { ok: false; code: 'AUTH_REQUIRED' | 'DATABASE_ERROR'; message: string }> {
  const session = await auth();
  const userId = getSessionUserId(session);
  if (!userId) {
    return { ok: false, code: 'AUTH_REQUIRED', message: '请先登录后收藏' };
  }

  try {
    const result = await saveWordNotebookSelections({ ...input, userId });
    if (result.ok) {
      revalidatePath('/mine');
      revalidatePath('/words');
      input.notebookIds.forEach((id) => revalidatePath(`/notebooks/${id}`));
    }
    return result;
  } catch (error) {
    logNotebookError('save-favorite', error);
    return { ok: false, code: 'DATABASE_ERROR', message: '收藏保存失败，请重试' };
  }
}

function isUniqueViolation(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === '23505'
  );
}

function logNotebookError(operation: string, error: unknown) {
  const details =
    error instanceof Error
      ? { name: error.name, message: error.message }
      : { name: 'UnknownError' };
  console.error(`[notebook:${operation}] database operation failed`, details);
}
