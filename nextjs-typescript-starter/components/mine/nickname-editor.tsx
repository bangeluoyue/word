'use client';

import { FormEvent, useEffect, useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';

import { updateNicknameAction } from 'app/actions/profile-actions';

export function NicknameEditor({ nickname }: { nickname: string | null }) {
  const router = useRouter();
  const titleId = useId();
  const inputId = useId();
  const errorId = useId();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(nickname ?? '');
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !pending) setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, pending]);

  function showEditor() {
    setValue(nickname ?? '');
    setErrorMessage(undefined);
    setOpen(true);
  }

  async function saveNickname(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    setPending(true);
    setErrorMessage(undefined);
    try {
      const result = await updateNicknameAction(value);
      if (!result.ok) {
        setErrorMessage(result.message);
        return;
      }

      setOpen(false);
      router.refresh();
    } catch {
      setErrorMessage('网络连接失败，请稍后重试');
    } finally {
      setPending(false);
    }
  }

  const characterCount = Array.from(value.trim()).length;

  return (
    <>
      <button
        type="button"
        onClick={showEditor}
        className="min-h-11 rounded-full border border-white/15 px-4 text-xs font-bold text-white/75 transition hover:bg-white/10 hover:text-white"
      >
        {nickname ? '修改昵称' : '设置昵称'}
      </button>

      {open && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 backdrop-blur-[3px] sm:items-center sm:px-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !pending) setOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="animate-sheet-in w-full max-w-[440px] rounded-t-[32px] bg-paper px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-4 text-ink shadow-sheet sm:rounded-[32px] sm:p-6"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-ink/10 sm:hidden" />
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-forest/45">
                  Your profile
                </p>
                <h2 id={titleId} className="mt-1 text-xl font-black text-ink">
                  {nickname ? '修改昵称' : '设置昵称'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={pending}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-xl text-ink/40 disabled:cursor-wait"
                aria-label="关闭"
              >
                ×
              </button>
            </div>

            <form onSubmit={saveNickname} className="mt-6">
              <label htmlFor={inputId} className="block text-xs font-bold text-ink/60">
                昵称
              </label>
              <input
                id={inputId}
                name="nickname"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                autoComplete="nickname"
                autoFocus
                required
                aria-invalid={Boolean(errorMessage)}
                aria-describedby={errorMessage ? errorId : `${inputId}-hint`}
                placeholder="输入 2–24 个字符"
                className={`mt-2 min-h-[52px] w-full rounded-2xl border bg-white px-4 py-3.5 text-sm font-semibold text-ink outline-none placeholder:font-normal placeholder:text-ink/25 ${
                  errorMessage
                    ? 'border-coral'
                    : 'border-ink/10 focus:border-forest/25'
                }`}
              />
              <div
                id={`${inputId}-hint`}
                className="mt-2 flex items-center justify-between gap-3 text-[11px] text-ink/40"
              >
                <span>去除首尾空格后保存，昵称不可重复</span>
                <span className={characterCount > 24 ? 'font-bold text-coral-dark' : ''}>
                  {characterCount}/24
                </span>
              </div>

              {errorMessage && (
                <p
                  id={errorId}
                  className="mt-3 rounded-xl bg-coral/10 px-3.5 py-3 text-xs font-semibold text-coral-dark"
                  role="alert"
                >
                  {errorMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={pending}
                className="mt-5 flex min-h-12 w-full items-center justify-center rounded-2xl bg-forest px-5 text-sm font-bold text-white shadow-button disabled:cursor-wait disabled:opacity-70"
              >
                {pending ? '正在保存…' : '保存昵称'}
              </button>
            </form>
          </section>
        </div>,
        document.body,
      )}
    </>
  );
}
