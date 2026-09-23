import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] items-center justify-center bg-paper px-6 text-center">
      <div>
        <p className="font-serif text-7xl font-black text-sun">404</p>
        <h1 className="mt-4 text-xl font-black text-ink">这一页走丢了</h1>
        <p className="mt-2 text-sm leading-6 text-ink/45">单词或单词书可能不存在，回首页重新选择吧。</p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-12 items-center rounded-2xl bg-forest px-6 text-sm font-bold text-white shadow-button"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}

