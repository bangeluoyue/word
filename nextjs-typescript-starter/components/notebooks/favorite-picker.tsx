'use client';

import { useEffect, useId, useState } from 'react';

import { saveFavoriteAction } from 'app/actions/notebook-actions';
import { CheckIcon, NotebookIcon, StarIcon } from 'components/ui/icons';
import type { NotebookListItem } from 'lib/notebooks/types';

export type FavoriteTarget = {
  id: string;
  headWord: string;
};

export function FavoritePicker({
  target,
  notebooks,
  selectedNotebookIds,
  onClose,
  onSaved,
}: {
  target: FavoriteTarget | null;
  notebooks: NotebookListItem[];
  selectedNotebookIds: string[];
  onClose: () => void;
  onSaved: (notebookIds: string[]) => void;
}) {
  const titleId = useId();
  const [selected, setSelected] = useState<string[]>(selectedNotebookIds);
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  useEffect(() => {
    setSelected(selectedNotebookIds);
    setErrorMessage(undefined);
  }, [selectedNotebookIds, target?.id]);

  useEffect(() => {
    if (!target) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !pending) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose, pending, target]);

  if (!target) return null;

  function toggle(notebookId: string) {
    if (pending) return;
    setSelected((current) =>
      current.includes(notebookId)
        ? current.filter((id) => id !== notebookId)
        : [...current, notebookId],
    );
  }

  async function save() {
    if (!target || pending) return;
    setPending(true);
    setErrorMessage(undefined);
    try {
      const result = await saveFavoriteAction({
        wordRowId: target.id,
        notebookIds: selected,
      });
      if (!result.ok) {
        setErrorMessage(result.message);
        return;
      }
      onSaved(result.selectedNotebookIds);
    } catch {
      setErrorMessage('网络连接失败，请稍后重试');
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 backdrop-blur-[3px] sm:items-center sm:px-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !pending) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="animate-sheet-in w-full max-w-[440px] rounded-t-[32px] bg-paper px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-4 shadow-sheet sm:rounded-[32px] sm:p-6"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-ink/10 sm:hidden" />
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-forest/45">Save word</p>
            <h2 id={titleId} className="mt-1 text-xl font-black text-ink">选择笔记本</h2>
            <p className="mt-1 truncate font-serif text-sm font-bold text-forest">{target.headWord}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-xl text-ink/40"
            aria-label="关闭"
          >
            ×
          </button>
        </div>

        <div className="mt-5 max-h-[42dvh] space-y-2 overflow-y-auto">
          {notebooks.map((notebook) => {
            const checked = selected.includes(notebook.id);
            return (
              <button
                key={notebook.id}
                type="button"
                onClick={() => toggle(notebook.id)}
                disabled={pending}
                className={`flex min-h-[62px] w-full items-center gap-3 rounded-2xl border px-3.5 text-left transition ${
                  checked
                    ? 'border-forest/25 bg-mint/70'
                    : 'border-ink/[0.06] bg-white'
                }`}
              >
                <NotebookIcon className="h-5 w-5 shrink-0 text-forest" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-ink">{notebook.name}</span>
                  <span className="mt-0.5 block text-[10px] text-ink/35">已有 {notebook.wordCount} 个单词</span>
                </span>
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                    checked ? 'border-forest bg-forest text-white' : 'border-ink/15 text-transparent'
                  }`}
                  aria-hidden="true"
                >
                  <CheckIcon className="h-4 w-4" />
                </span>
              </button>
            );
          })}
        </div>

        {errorMessage && (
          <p className="mt-3 rounded-xl bg-coral/10 px-3.5 py-3 text-xs font-semibold text-coral-dark" role="alert">
            {errorMessage}
          </p>
        )}

        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-forest px-5 text-sm font-bold text-white shadow-button disabled:cursor-wait disabled:opacity-70"
        >
          {pending ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <StarIcon className="h-4 w-4" filled={selected.length > 0} />
          )}
          {pending ? '正在保存…' : selected.length > 0 ? `保存到 ${selected.length} 个笔记本` : '取消收藏'}
        </button>
      </section>
    </div>
  );
}
