'use server';

import { revalidatePath } from 'next/cache';

import { auth } from 'app/auth';
import { getSessionUserId } from 'lib/auth/session';
import {
  advanceWord,
  type AdvanceWordResult,
  restartBook,
  type RestartBookResult,
} from 'lib/services/learning-service';

export async function advanceWordAction(input: {
  bookId: string;
  currentWordRowId: string;
  progressVersion?: number;
}): Promise<AdvanceWordResult> {
  const session = await auth();
  const userId = getSessionUserId(session);
  if (!userId) {
    return {
      ok: false,
      code: 'AUTH_REQUIRED',
      message: '登录状态已失效，请重新登录',
    };
  }

  try {
    const result = await advanceWord({ ...input, userId });
    if (result.ok) revalidateLearningPages(input.bookId);
    return result;
  } catch (error) {
    logDatabaseError('advance', error);
    return {
      ok: false,
      code: 'DATABASE_ERROR',
      message: '保存进度失败，请检查网络后重试',
    };
  }
}

export async function restartBookAction(input: {
  bookId: string;
}): Promise<RestartBookResult> {
  const session = await auth();
  const userId = getSessionUserId(session);
  if (!userId) {
    return {
      ok: false,
      code: 'AUTH_REQUIRED',
      message: '登录状态已失效，请重新登录',
    };
  }

  try {
    const result = await restartBook({ ...input, userId });
    if (result.ok) revalidateLearningPages(input.bookId);
    return result;
  } catch (error) {
    logDatabaseError('restart', error);
    return {
      ok: false,
      code: 'DATABASE_ERROR',
      message: '重置进度失败，请检查网络后重试',
    };
  }
}

function revalidateLearningPages(bookId: string) {
  revalidatePath('/');
  revalidatePath('/mine');
  revalidatePath(`/learn/${bookId}`);
}

function logDatabaseError(operation: string, error: unknown) {
  const details =
    error instanceof Error
      ? { name: error.name, message: error.message }
      : { name: 'UnknownError' };
  console.error(`[learning:${operation}] database operation failed`, details);
}
