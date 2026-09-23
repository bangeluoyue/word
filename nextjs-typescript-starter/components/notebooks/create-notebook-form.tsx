'use client';

import { useFormState, useFormStatus } from 'react-dom';

import {
  createNotebookAction,
  type CreateNotebookActionState,
} from 'app/actions/notebook-actions';
import { NotebookIcon, PlusIcon } from 'components/ui/icons';

const initialState: CreateNotebookActionState = { ok: false };

export function CreateNotebookForm({
  wordRowId,
  returnTo,
}: {
  wordRowId?: string;
  returnTo: string;
}) {
  const [state, formAction] = useFormState(createNotebookAction, initialState);

  return (
    <form action={formAction} className="mt-7">
      <input type="hidden" name="wordRowId" value={wordRowId ?? ''} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <label htmlFor="notebook-name" className="block text-xs font-bold text-ink/60">
        笔记本名称
      </label>
      <div className={`mt-2 flex min-h-[52px] items-center gap-3 rounded-2xl border bg-white px-4 ${state.fieldError ? 'border-coral' : 'border-ink/10 focus-within:border-forest/25'}`}>
        <NotebookIcon className="h-5 w-5 shrink-0 text-forest/45" />
        <input
          id="notebook-name"
          name="name"
          required
          minLength={1}
          maxLength={50}
          autoFocus
          placeholder="例如：重点复习"
          className="min-w-0 flex-1 bg-transparent py-3.5 text-sm font-semibold text-ink outline-none placeholder:font-normal placeholder:text-ink/25"
          aria-invalid={Boolean(state.fieldError)}
          aria-describedby={state.fieldError ? 'notebook-name-error' : undefined}
        />
      </div>
      {state.fieldError && (
        <p id="notebook-name-error" className="mt-2 text-xs font-semibold text-coral-dark" role="alert">
          {state.fieldError}
        </p>
      )}
      {state.message && (
        <p className="mt-3 rounded-xl bg-coral/10 px-3.5 py-3 text-xs font-semibold text-coral-dark" role="alert">
          {state.message}
        </p>
      )}
      <CreateButton includesWord={Boolean(wordRowId)} />
    </form>
  );
}

function CreateButton({ includesWord }: { includesWord: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-forest px-5 text-sm font-bold text-white shadow-button disabled:cursor-wait disabled:opacity-70"
    >
      {pending ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      ) : (
        <PlusIcon className="h-5 w-5" />
      )}
      {pending ? '正在创建…' : includesWord ? '创建并收藏' : '创建笔记本'}
    </button>
  );
}
