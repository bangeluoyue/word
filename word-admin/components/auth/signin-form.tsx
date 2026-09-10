"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEFAULT_ADMINS, type AdminUser } from "@/lib/mock-data";
import { getSession, setSession, USERS_KEY } from "@/lib/storage";

export function SigninForm() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@wordflow.cn");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (getSession()) router.replace("/books"); }, [router]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!email.trim() || !password) return setError("请输入邮箱和密码");
    setLoading(true);
    window.setTimeout(() => {
      let users = DEFAULT_ADMINS;
      try {
        const stored = window.localStorage.getItem(USERS_KEY);
        if (stored) users = JSON.parse(stored) as AdminUser[];
        else window.localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_ADMINS));
      } catch { users = DEFAULT_ADMINS; }
      const user = users.find((item) => item.email.toLowerCase() === email.trim().toLowerCase());
      if (!user || user.password !== password) { setLoading(false); setError("邮箱或密码不正确，请检查后重试"); return; }
      if (user.status === "disabled") { setLoading(false); setError("该账号已停用，请联系超级管理员"); return; }
      setSession({ name: user.name, email: user.email });
      if (!remember) window.sessionStorage.setItem("wordflow-temporary", "1");
      router.replace("/books");
    }, 450);
  }

  return (
    <div>
      <div className="mb-9"><p className="mb-2 text-sm font-medium text-primary">欢迎回来</p><h2 className="text-[30px] font-semibold tracking-tight text-slate-900">登录管理后台</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">请输入你的管理员账号信息以继续</p></div>
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {error && <div className="flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700" role="alert"><AlertCircle className="mt-0.5 size-4 shrink-0" /><span>{error}</span></div>}
        <div className="space-y-2"><Label htmlFor="email">邮箱</Label><Input id="email" name="email" type="email" autoComplete="email" placeholder="name@example.com" value={email} onChange={(event) => setEmail(event.target.value)} className="h-11 bg-white" /></div>
        <div className="space-y-2">
          <div className="flex items-center justify-between"><Label htmlFor="password">密码</Label><button type="button" className="cursor-pointer text-xs font-medium text-primary hover:underline">忘记密码？</button></div>
          <div className="relative"><Input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="请输入密码" value={password} onChange={(event) => setPassword(event.target.value)} className="h-11 bg-white pr-10" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground" aria-label={showPassword ? "隐藏密码" : "显示密码"}>{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div>
        </div>
        <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} className="size-4 rounded border-slate-300 accent-primary" />保持登录状态</label>
        <Button type="submit" size="lg" className="mt-2 w-full" disabled={loading}>{loading ? <LoaderCircle className="size-4 animate-spin" /> : <>登录 <ArrowRight className="size-4" /></>}</Button>
      </form>
      <div className="mt-8 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/60 p-4 text-xs leading-5 text-slate-600"><span className="font-semibold text-slate-800">演示账号</span><span className="ml-2">admin@wordflow.cn</span><span className="mx-2 text-slate-300">/</span><span>admin123</span></div>
    </div>
  );
}
