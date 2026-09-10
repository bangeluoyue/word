import Link from "next/link";
import { BookOpenCheck, Check } from "lucide-react";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[minmax(390px,0.9fr)_minmax(560px,1.1fr)]">
      <section className="relative hidden overflow-hidden bg-[#16213e] px-12 py-10 text-white lg:flex lg:flex-col xl:px-16 xl:py-12">
        <div className="absolute -top-24 -right-28 size-96 rounded-full bg-[#5f72ff]/20 blur-3xl" />
        <div className="absolute right-16 bottom-20 size-60 rounded-full bg-[#40d6c4]/10 blur-3xl" />
        <div className="absolute top-[26%] -left-24 size-72 rounded-full border border-white/5" />
        <Link href="/" className="relative flex w-fit items-center gap-3" aria-label="WordFlow 首页">
          <span className="flex size-10 items-center justify-center rounded-xl bg-[#6576ff] shadow-lg shadow-indigo-950/30"><BookOpenCheck className="size-5" strokeWidth={2.2} /></span>
          <span className="text-xl font-semibold tracking-tight">WordFlow</span>
        </Link>
        <div className="relative my-auto max-w-md pb-12">
          <span className="mb-7 inline-flex items-center rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium tracking-wide text-indigo-100">专注词汇内容管理</span>
          <h1 className="text-4xl leading-[1.2] font-semibold tracking-tight xl:text-[44px]">让每一本单词书，<span className="text-[#90a0ff]">都更有价值。</span></h1>
          <p className="mt-6 max-w-sm text-[15px] leading-7 text-slate-300">从内容编排到管理员协作，用简洁高效的工作台管理你的词汇产品。</p>
          <div className="mt-10 grid gap-4 text-sm text-slate-200">
            {["清晰管理多套词汇内容", "灵活分配后台管理权限", "关键数据一目了然"].map((item) => (
              <div key={item} className="flex items-center gap-3"><span className="flex size-5 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300"><Check className="size-3.5" strokeWidth={2.5} /></span>{item}</div>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-slate-500">© 2026 WordFlow. 保留所有权利。</p>
      </section>
      <section className="flex min-h-screen flex-col bg-[#fbfcfe]">
        <div className="flex items-center px-6 pt-6 lg:hidden">
          <Link href="/" className="flex items-center gap-2.5 text-[#172033]"><span className="flex size-9 items-center justify-center rounded-xl bg-primary text-white"><BookOpenCheck className="size-[18px]" /></span><span className="text-lg font-semibold">WordFlow</span></Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10"><div className="w-full max-w-[420px]">{children}</div></div>
      </section>
    </main>
  );
}

