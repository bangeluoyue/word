'use client';

import { useCallback, useEffect, useId, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';

import {
  loginAction,
  registerAction,
  type AuthActionState,
} from 'app/actions/auth-actions';
import { LockIcon, MailIcon, SparkleIcon } from 'components/ui/icons';

const emptyState: AuthActionState = { ok: false };

export function AuthPopup({
  initialOpen = false,
  initialMode = 'login',
  returnTo = '/mine',
  showTrigger = true,
}: {
  initialOpen?: boolean;
  initialMode?: 'login' | 'register';
  returnTo?: string;
  showTrigger?: boolean;
}) {
  const router = useRouter();
  const titleId = useId();
  const [open, setOpen] = useState(initialOpen);
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [pending, setPending] = useState(false);
  const [loginState, loginFormAction] = useFormState(loginAction, emptyState);
  const [registerState, registerFormAction] = useFormState(registerAction, emptyState);
  const state = mode === 'login' ? loginState : registerState;

  useEffect(() => {
    if (!state.ok || !state.redirectTo) return;

    setOpen(false);
    router.replace(state.redirectTo);
    router.refresh();
  }, [router, state]);

  const closePopup = useCallback(() => {
    if (pending) return;
    setOpen(false);
    if (initialOpen) router.replace('/mine', { scroll: false });
  }, [initialOpen, pending, router]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !pending) closePopup();
    }

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [closePopup, open, pending]);

  function switchMode(nextMode: 'login' | 'register') {
    if (pending) return;
    setMode(nextMode);
  }

  return (
    <>
      {showTrigger && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-forest px-5 text-sm font-bold text-white shadow-button transition hover:-translate-y-0.5 hover:bg-forest-light"
        >
          登录 / 注册
          <span aria-hidden="true">→</span>
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 px-0 backdrop-blur-[3px] sm:items-center sm:px-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closePopup();
          }}
          role="presentation"
        >
          <section
            className="animate-sheet-in max-h-[92dvh] w-full max-w-[440px] overflow-y-auto rounded-t-[32px] bg-paper px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-4 shadow-sheet sm:rounded-[32px] sm:p-7"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-ink/10 sm:hidden" />
            <div className="flex items-start justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-sun/25 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-forest">
                  <SparkleIcon className="h-3 w-3" /> Word flow
                </div>
                <h2 id={titleId} className="text-2xl font-black tracking-tight text-ink">
                  {mode === 'login' ? '欢迎回来' : '创建学习账号'}
                </h2>
                <p className="mt-1 text-sm text-ink/50">
                  {mode === 'login'
                    ? '登录后，继续上一次的学习进度。'
                    : '只需要邮箱和密码，即刻开始学习。'}
                </p>
              </div>
              <button
                type="button"
                onClick={closePopup}
                disabled={pending}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-xl text-ink/45 shadow-sm transition hover:text-ink disabled:opacity-40"
                aria-label="关闭登录弹窗"
              >
                ×
              </button>
            </div>

            <div className="mt-6 grid grid-cols-2 rounded-2xl bg-ink/[0.055] p-1">
              <ModeButton active={mode === 'login'} onClick={() => switchMode('login')}>
                登录
              </ModeButton>
              <ModeButton active={mode === 'register'} onClick={() => switchMode('register')}>
                注册
              </ModeButton>
            </div>

            <form
              action={mode === 'login' ? loginFormAction : registerFormAction}
              className="mt-5 space-y-4"
            >
              <input type="hidden" name="returnTo" value={returnTo} />
              <PendingObserver onChange={setPending} />

              <Field
                id="auth-email"
                name="email"
                type="email"
                label="邮箱"
                placeholder="name@example.com"
                autoComplete="email"
                icon={<MailIcon className="h-5 w-5" />}
                error={state.fieldErrors?.email}
              />
              <Field
                id="auth-password"
                name="password"
                type="password"
                label="密码"
                placeholder={mode === 'register' ? '至少 8 个字符' : '输入你的密码'}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                minLength={mode === 'register' ? 8 : undefined}
                maxLength={64}
                icon={<LockIcon className="h-5 w-5" />}
                error={state.fieldErrors?.password}
              />

              {mode === 'register' && (
                <Field
                  id="auth-confirm-password"
                  name="confirmPassword"
                  type="password"
                  label="确认密码"
                  placeholder="再次输入密码"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={64}
                  icon={<LockIcon className="h-5 w-5" />}
                  error={state.fieldErrors?.confirmPassword}
                />
              )}

              {state.message && (
                <p
                  className="rounded-xl bg-coral/10 px-3.5 py-3 text-sm font-medium text-coral-dark"
                  role="alert"
                  aria-live="polite"
                >
                  {state.message}
                </p>
              )}

              <button
                type="submit"
                disabled={pending}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-forest px-5 text-sm font-bold text-white shadow-button transition hover:bg-forest-light disabled:cursor-wait disabled:opacity-70"
              >
                {pending && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                )}
                {pending
                  ? mode === 'login'
                    ? '正在登录…'
                    : '正在创建…'
                  : mode === 'login'
                    ? '登录并继续学习'
                    : '创建账号'}
              </button>
            </form>

            <p className="mt-5 text-center text-xs text-ink/40">
              {mode === 'login' ? '还没有账号？' : '已经有账号？'}{' '}
              <button
                type="button"
                disabled={pending}
                onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                className="font-bold text-forest underline decoration-sun decoration-2 underline-offset-4"
              >
                {mode === 'login' ? '免费注册' : '直接登录'}
              </button>
            </p>
          </section>
        </div>
      )}
    </>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-10 rounded-[13px] text-sm font-bold transition ${
        active ? 'bg-white text-ink shadow-sm' : 'text-ink/40 hover:text-ink/70'
      }`}
    >
      {children}
    </button>
  );
}

function Field({
  id,
  label,
  icon,
  error,
  ...inputProps
}: React.InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  icon: React.ReactNode;
  error?: string;
}) {
  const errorId = `${id}-error`;
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1.5 block text-xs font-bold text-ink/65">{label}</span>
      <span
        className={`flex min-h-12 items-center gap-3 rounded-2xl border bg-white px-3.5 transition focus-within:ring-2 focus-within:ring-sun/45 ${
          error ? 'border-coral' : 'border-ink/10 focus-within:border-forest/30'
        }`}
      >
        <span className="text-ink/30">{icon}</span>
        <input
          {...inputProps}
          id={id}
          required
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className="min-w-0 flex-1 bg-transparent py-3 text-sm text-ink outline-none placeholder:text-ink/25"
        />
      </span>
      {error && (
        <span id={errorId} className="mt-1.5 block text-xs font-medium text-coral-dark">
          {error}
        </span>
      )}
    </label>
  );
}

function PendingObserver({ onChange }: { onChange: (pending: boolean) => void }) {
  const { pending } = useFormStatus();

  useEffect(() => {
    onChange(pending);
  }, [onChange, pending]);

  return null;
}
