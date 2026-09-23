'use server';

import { revalidatePath } from 'next/cache';

import { auth } from 'app/auth';
import { getSessionUserId } from 'lib/auth/session';
import {
  updateNickname,
  type UpdateNicknameResult,
} from 'lib/services/profile-service';

export type UpdateNicknameActionResult =
  | UpdateNicknameResult
  | {
      ok: false;
      code: 'AUTH_REQUIRED' | 'DUPLICATE' | 'DATABASE_ERROR';
      message: string;
    };

export async function updateNicknameAction(
  value: string,
): Promise<UpdateNicknameActionResult> {
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
    const result = await updateNickname({
      userId,
      nickname: typeof value === 'string' ? value : '',
    });
    if (result.ok) revalidatePath('/mine');
    return result;
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        ok: false,
        code: 'DUPLICATE',
        message: '该昵称已被使用',
      };
    }

    logProfileError(error);
    return {
      ok: false,
      code: 'DATABASE_ERROR',
      message: '昵称保存失败，请稍后重试',
    };
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

function logProfileError(error: unknown) {
  const details =
    error instanceof Error
      ? { name: error.name, message: error.message }
      : { name: 'UnknownError' };
  console.error('[profile:update-nickname] database operation failed', details);
}
