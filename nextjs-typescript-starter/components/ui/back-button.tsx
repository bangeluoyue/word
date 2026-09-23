'use client';

import { useRouter } from 'next/navigation';

import { ArrowLeftIcon } from './icons';

export function BackButton({ fallback = '/' }: { fallback?: string }) {
  const router = useRouter();

  function goBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallback);
    }
  }

  return (
    <button
      type="button"
      onClick={goBack}
      className="-ml-2 inline-flex min-h-11 items-center gap-1 rounded-full px-2 text-sm font-semibold text-ink transition hover:bg-black/5"
      aria-label="返回上一页"
    >
      <ArrowLeftIcon className="h-5 w-5" />
      返回
    </button>
  );
}

