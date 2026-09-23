'use client';

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] items-center justify-center bg-paper px-6 text-center">
      <div className="w-full rounded-[30px] bg-white px-6 py-10 shadow-card">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-coral/10 text-2xl text-coral-dark">
          !
        </div>
        <h1 className="mt-5 text-xl font-black text-ink">加载遇到一点问题</h1>
        <p className="mt-2 text-sm leading-6 text-ink/45">请检查网络后重试，你的学习进度不会丢失。</p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 min-h-12 w-full rounded-2xl bg-forest px-6 text-sm font-bold text-white shadow-button"
        >
          重新加载
        </button>
      </div>
    </div>
  );
}
