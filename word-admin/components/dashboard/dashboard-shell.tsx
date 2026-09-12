"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpenCheck, LibraryBig, LoaderCircle, LogOut, Menu, ShieldCheck, X } from "lucide-react";
import type { CurrentAdmin } from "@/lib/auth/types";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/books", label: "单词书管理", icon: LibraryBig, systemOnly: false },
  { href: "/admin-users", label: "管理员管理", icon: ShieldCheck, systemOnly: true },
];

export function DashboardShell({ children, session }: { children: React.ReactNode; session: CurrentAdmin }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const visibleNavigation = navigation.filter((item) => !item.systemOnly || session.role === "system");

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/signout", { method: "POST" });
    } finally {
      router.replace("/signin");
      router.refresh();
    }
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-white">
      <div className="flex h-[74px] items-center gap-3 border-b border-slate-100 px-6">
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-indigo-200/60"><BookOpenCheck className="size-[18px]" strokeWidth={2.2} /></span>
        <span className="text-lg font-semibold tracking-tight text-slate-900">WordFlow</span>
      </div>
      <div className="flex-1 px-3 py-6">
        <p className="mb-3 px-3 text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">管理工作台</p>
        <nav className="space-y-1" aria-label="主导航">
          {visibleNavigation.map((item) => {
            const active = pathname === item.href;
            return <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={cn("group flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors", active ? "bg-primary/10 text-primary" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900")}><item.icon className={cn("size-[18px]", active ? "text-primary" : "text-slate-400 group-hover:text-slate-600")} />{item.label}</Link>;
          })}
        </nav>
      </div>
      <div className="border-t border-slate-100 p-3">
        <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#edf0ff] text-sm font-semibold text-primary">{session.name.slice(0, 1)}</span>
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-slate-800">{session.name}</p><p className="truncate text-[11px] text-slate-500" title={session.email}>{session.email}</p></div>
          <button type="button" onClick={logout} disabled={loggingOut} className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none disabled:cursor-wait" aria-label="退出登录" title="退出登录">{loggingOut ? <LoaderCircle className="size-4 animate-spin" /> : <LogOut className="size-4" />}</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f7f8fb] lg:pl-[248px]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] border-r border-border lg:block">{sidebar}</aside>
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-white/90 px-4 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-2.5"><span className="flex size-8 items-center justify-center rounded-lg bg-primary text-white"><BookOpenCheck className="size-4" /></span><span className="font-semibold tracking-tight">WordFlow</span></div>
        <button type="button" onClick={() => setMobileOpen(true)} className="flex size-9 cursor-pointer items-center justify-center rounded-lg border border-border text-slate-600" aria-label="打开菜单"><Menu className="size-5" /></button>
      </header>
      {mobileOpen && <div className="fixed inset-0 z-50 lg:hidden"><button type="button" className="absolute inset-0 cursor-default bg-slate-950/35 backdrop-blur-[1px]" onClick={() => setMobileOpen(false)} aria-label="关闭菜单" /><aside className="absolute inset-y-0 left-0 w-[280px] border-r border-border bg-white shadow-2xl">{sidebar}<button type="button" onClick={() => setMobileOpen(false)} className="absolute top-5 right-4 flex size-8 cursor-pointer items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="关闭菜单"><X className="size-4" /></button></aside></div>}
      <main className="min-h-screen">{children}</main>
    </div>
  );
}
