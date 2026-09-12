"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ErrorResponse = { error?: string; code?: string };

export function SigninForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!email.trim() || !password) return setError("请输入邮箱和密码");

    setLoading(true);
    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = (await response.json()) as ErrorResponse;
      if (result.code === "bootstrap_required") {
        router.replace("/signup");
        router.refresh();
        return;
      }
      if (!response.ok) {
        setError(result.error ?? "登录失败，请稍后重试");
        return;
      }
      router.replace("/books");
      router.refresh();
    } catch {
      setError("暂时无法连接服务器，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-9">
        <p className="mb-2 text-sm font-medium text-primary">欢迎回来</p>
        <h2 className="text-[30px] font-semibold tracking-tight text-slate-900">登录管理后台</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">请输入你的管理员账号信息以继续</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {error && (
          <div className="flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700" role="alert">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">邮箱</Label>
          <Input id="email" name="email" type="email" autoComplete="email" placeholder="name@example.com" value={email} onChange={(event) => setEmail(event.target.value)} className="h-11 bg-white" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">密码</Label>
          <div className="relative">
            <Input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="请输入密码" value={password} onChange={(event) => setPassword(event.target.value)} className="h-11 bg-white pr-10" required />
            <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground" aria-label={showPassword ? "隐藏密码" : "显示密码"}>
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>
        <p className="text-xs leading-5 text-muted-foreground">登录状态将在此设备上保留 7 天。</p>
        <Button type="submit" size="lg" className="mt-2 w-full" disabled={loading}>
          {loading ? <LoaderCircle className="size-4 animate-spin" /> : <>登录 <ArrowRight className="size-4" /></>}
        </Button>
      </form>
    </div>
  );
}
