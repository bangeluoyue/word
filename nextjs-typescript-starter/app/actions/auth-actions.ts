'use server';

import { AuthError } from 'next-auth';

import { signIn, signOut } from 'app/auth';
import { createUser, getUser } from 'app/db';
import { getSafeReturnTo } from 'lib/auth-redirect';

export type AuthActionState = {
  ok: boolean;
  message?: string;
  redirectTo?: string;
  fieldErrors?: {
    email?: string;
    password?: string;
    confirmPassword?: string;
  };
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = normalizeEmail(formData);
  const password = String(formData.get('password') ?? '');
  const redirectTo = getSafeReturnTo(
    String(formData.get('returnTo') ?? '').trim(),
  );
  const fieldErrors: AuthActionState['fieldErrors'] = {};

  if (!emailPattern.test(email) || email.length > 254) {
    fieldErrors.email = '请输入有效的邮箱地址';
  }
  if (!password) {
    fieldErrors.password = '请输入密码';
  }
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  try {
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    return { ok: true, redirectTo };
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, message: '邮箱或密码错误，请重新输入' };
    }
    throw error;
  }
}

export async function registerAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = normalizeEmail(formData);
  const password = String(formData.get('password') ?? '');
  const confirmPassword = String(formData.get('confirmPassword') ?? '');
  const redirectTo = getSafeReturnTo(
    String(formData.get('returnTo') ?? '').trim(),
  );
  const fieldErrors: AuthActionState['fieldErrors'] = {};

  if (!emailPattern.test(email) || email.length > 254) {
    fieldErrors.email = '请输入有效的邮箱地址';
  }
  if (password.length < 8 || password.length > 64) {
    fieldErrors.password = '密码需要为 8–64 个字符';
  }
  if (confirmPassword !== password) {
    fieldErrors.confirmPassword = '两次输入的密码不一致';
  }
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  if ((await getUser(email)).length > 0) {
    return { ok: false, message: '该邮箱已注册，请直接登录' };
  }

  try {
    await createUser(email, password);
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { ok: false, message: '该邮箱已注册，请直接登录' };
    }
    throw error;
  }

  try {
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    return { ok: true, redirectTo };
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, message: '账号已创建，请切换到登录后继续' };
    }
    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: '/mine' });
}

function normalizeEmail(formData: FormData) {
  return String(formData.get('email') ?? '').trim().toLowerCase();
}

function isUniqueViolation(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === '23505'
  );
}
