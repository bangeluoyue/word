"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ErrorResponse = { error?: string; code?: string };

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (name.trim().length < 2) return setError("姓名至少需要 2 个字符");
    if (password.length < 8) return setError("密码至少需要 8 个字符");
    if (password !== confirmPassword) return setError("两次输入的密码不一致");

    setLoading(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, confirmPassword }),
      });
      const result = (await response.json()) as ErrorResponse;
      if (result.code === "registration_closed") {
        router.replace("/signin");
        router.refresh();
        return;
      }
      if (!response.ok) {
        setError(result.error ?? "注册失败，请稍后重试");
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
      <div className="mb-8">
        <p className="mb-2 text-sm font-medium text-primary">初始化系统</p>
        <h2 className="text-[30px] font-semibold tracking-tight text-slate-900">注册系统管理员</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">创建首个拥有全部管理权限的账号。完成后将关闭注册入口。</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && (
          <div className="flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700" role="alert">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <div className="space-y-2"><Label htmlFor="name">姓名</Label><Input id="name" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="请输入姓名" className="h-11 bg-white" required /></div>
        <div className="space-y-2"><Label htmlFor="email">邮箱</Label><Input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" className="h-11 bg-white" required /></div>
        <PasswordField id="password" label="密码" value={password} onChange={setPassword} visible={showPassword} onToggle={() => setShowPassword((value) => !value)} placeholder="至少 8 个字符" />
        <PasswordField id="confirm-password" label="确认密码" value={confirmPassword} onChange={setConfirmPassword} visible={showPassword} onToggle={() => setShowPassword((value) => !value)} placeholder="再次输入密码" />
        <Button type="submit" size="lg" className="mt-3 w-full" disabled={loading}>
          {loading ? <LoaderCircle className="size-4 animate-spin" /> : <>创建系统管理员 <ArrowRight className="size-4" /></>}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">已有管理员账号？ <Link href="/signin" className="font-medium text-primary hover:underline">返回登录</Link></p>
    </div>
  );
}

function PasswordField({ id, label, value, onChange, visible, onToggle, placeholder }: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input id={id} type={visible ? "text" : "password"} autoComplete="new-password" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-11 bg-white pr-10" required />
        <button type="button" onClick={onToggle} className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground" aria-label={visible ? "隐藏密码" : "显示密码"}>
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </div>
  );
}
