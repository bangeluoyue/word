"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, CheckCircle2, LoaderCircle, Pencil, Plus, Search, ShieldCheck, Trash2, UserRoundCheck, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AdminListItem, AdminRole } from "@/lib/auth/types";

type AdminForm = { name: string; email: string; role: AdminRole; isActive: boolean; password: string };
type ApiResponse = { admin?: AdminListItem; error?: string };

const emptyForm: AdminForm = { name: "", email: "", role: "admin", isActive: true, password: "" };
const AVATAR_COLORS = ["#6476f3", "#27ad9e", "#ed8f42", "#8c68dc", "#e6687b", "#3e9bd8"];
const roleLabels: Record<AdminRole, string> = { system: "系统管理员", admin: "普通管理员" };

function avatarColor(id: string) {
  let hash = 0;
  for (const character of id) hash = (hash * 31 + character.charCodeAt(0)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatDate(value: string | null, fallback = "尚未登录") {
  if (!value) return fallback;
  return new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export function AdminUsersPage({ initialUsers, currentAdminId }: { initialUsers: AdminListItem[]; currentAdminId: string }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<"all" | AdminRole>("all");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<AdminListItem | null>(null);
  const [deleting, setDeleting] = useState<AdminListItem | null>(null);
  const [form, setForm] = useState<AdminForm>(emptyForm);
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState("");
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const filtered = useMemo(() => users.filter((user) => {
    const keyword = search.trim().toLowerCase();
    const matchesSearch = !keyword || user.name.toLowerCase().includes(keyword) || user.email.toLowerCase().includes(keyword);
    return matchesSearch && (role === "all" || user.role === role);
  }), [role, search, users]);
  const activeUsers = users.filter((user) => user.isActive).length;
  const systemAdmins = users.filter((user) => user.role === "system").length;

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormError("");
    setEditorOpen(true);
  }

  function openEdit(user: AdminListItem) {
    setEditing(user);
    setForm({ name: user.name, email: user.email, role: user.role, isActive: user.isActive, password: "" });
    setFormError("");
    setEditorOpen(true);
  }

  function update<K extends keyof AdminForm>(field: K, value: AdminForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submitUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    if (form.name.trim().length < 2) return setFormError("姓名至少需要 2 个字符");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setFormError("请输入有效的邮箱地址");
    if (!editing && form.password.length < 8) return setFormError("初始密码至少需要 8 个字符");
    if (form.password && form.password.length < 8) return setFormError("新密码至少需要 8 个字符");

    setPendingAction("save");
    try {
      const response = await fetch(editing ? `/api/admin-users/${editing.id}` : "/api/admin-users", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = (await response.json()) as ApiResponse;
      if (!response.ok || !result.admin) {
        setFormError(result.error ?? "保存失败，请稍后重试");
        return;
      }
      setUsers((current) => editing
        ? current.map((user) => user.id === result.admin?.id ? result.admin : user)
        : [result.admin as AdminListItem, ...current]);
      setEditorOpen(false);
      notify(editing ? "管理员信息已更新" : "管理员已添加");
      if (editing?.id === currentAdminId) router.refresh();
    } catch {
      setFormError("暂时无法连接服务器，请稍后重试");
    } finally {
      setPendingAction(null);
    }
  }

  async function toggleStatus(user: AdminListItem) {
    if (user.id === currentAdminId) return notify("不能停用当前登录账号");
    setPendingAction(`status-${user.id}`);
    try {
      const response = await fetch(`/api/admin-users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: user.name, email: user.email, role: user.role, isActive: !user.isActive, password: "" }),
      });
      const result = (await response.json()) as ApiResponse;
      if (!response.ok || !result.admin) return notify(result.error ?? "状态更新失败");
      setUsers((current) => current.map((item) => item.id === result.admin?.id ? result.admin : item));
      notify(result.admin.isActive ? "管理员已启用" : "管理员已停用");
    } catch {
      notify("暂时无法连接服务器");
    } finally {
      setPendingAction(null);
    }
  }

  async function deleteUser() {
    if (!deleting) return;
    if (deleting.id === currentAdminId) {
      setDeleting(null);
      return notify("不能删除当前登录账号");
    }
    setPendingAction(`delete-${deleting.id}`);
    try {
      const response = await fetch(`/api/admin-users/${deleting.id}`, { method: "DELETE" });
      const result = (await response.json()) as ApiResponse;
      if (!response.ok) return notify(result.error ?? "删除失败，请稍后重试");
      setUsers((current) => current.filter((user) => user.id !== deleting.id));
      setDeleting(null);
      notify("管理员已删除");
    } catch {
      notify("暂时无法连接服务器");
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1500px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9 xl:px-10">
      <header className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400"><span>管理工作台</span><span>/</span><span className="text-slate-600">管理员管理</span></div><h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[28px]">管理员管理</h1><p className="mt-2 text-sm text-muted-foreground">管理后台成员、角色权限与账号状态</p></div>
        <Button onClick={openCreate} className="w-fit"><Plus className="size-4" />添加管理员</Button>
      </header>

      <section className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard icon={UsersRound} label="管理员总数" value={String(users.length)} detail="当前团队成员" color="indigo" />
        <StatCard icon={UserRoundCheck} label="正常账号" value={String(activeUsers)} detail={`${users.length - activeUsers} 个账号已停用`} color="teal" />
        <StatCard icon={ShieldCheck} label="系统管理员" value={String(systemAdmins)} detail="拥有全部管理权限" color="orange" />
      </section>

      <Card className="overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="relative w-full sm:max-w-[310px]"><Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索姓名或邮箱" className="bg-slate-50/80 pl-9" /></div>
          <Select value={role} onChange={(event) => setRole(event.target.value as "all" | AdminRole)} className="w-full bg-white sm:w-[156px]" aria-label="按角色筛选"><option value="all">全部角色</option><option value="system">系统管理员</option><option value="admin">普通管理员</option></Select>
        </div>

        <div className="overflow-x-auto">
          <Table className="min-w-[900px]">
            <TableHeader><TableRow className="bg-slate-50/70 hover:bg-slate-50/70"><TableHead className="w-[32%]">管理员</TableHead><TableHead>角色</TableHead><TableHead>账号状态</TableHead><TableHead>最近登录</TableHead><TableHead>加入日期</TableHead><TableHead className="w-[132px] text-right">操作</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.map((user) => {
                const isCurrent = user.id === currentAdminId;
                const statusPending = pendingAction === `status-${user.id}`;
                return (
                  <TableRow key={user.id}>
                    <TableCell><div className="flex items-center gap-3.5"><span className="flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white shadow-sm" style={{ backgroundColor: avatarColor(user.id) }}>{user.name.slice(0, 1)}</span><div className="min-w-0"><p className="flex items-center gap-2 truncate font-medium text-slate-800">{user.name}{isCurrent && <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-primary">当前账号</span>}</p><p className="mt-1 truncate text-xs text-muted-foreground">{user.email}</p></div></div></TableCell>
                    <TableCell><Badge variant={user.role === "system" ? "default" : "outline"}>{roleLabels[user.role]}</Badge></TableCell>
                    <TableCell><button type="button" onClick={() => toggleStatus(user)} disabled={isCurrent || statusPending} className="group inline-flex cursor-pointer items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60" title={isCurrent ? "不能停用当前账号" : user.isActive ? "点击停用账号" : "点击启用账号"}><span className={`relative h-5 w-9 rounded-full transition-colors ${user.isActive ? "bg-emerald-500" : "bg-slate-300"}`}><span className={`absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition-all ${user.isActive ? "left-[18px]" : "left-0.5"}`} /></span><span className={`text-xs font-medium ${user.isActive ? "text-emerald-700" : "text-slate-500"}`}>{statusPending ? "更新中" : user.isActive ? "正常" : "已停用"}</span></button></TableCell>
                    <TableCell className="text-slate-600">{formatDate(user.lastLoginAt)}</TableCell>
                    <TableCell className="text-slate-500">{formatDate(user.createdAt, "-")}</TableCell>
                    <TableCell><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" onClick={() => openEdit(user)} className="size-8 text-slate-500" aria-label={`编辑${user.name}`}><Pencil className="size-4" /></Button><Button variant="ghost" size="icon" onClick={() => setDeleting(user)} disabled={isCurrent} className="size-8 text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label={`删除${user.name}`} title={isCurrent ? "不能删除当前账号" : "删除管理员"}><Trash2 className="size-4" /></Button></div></TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && <TableRow><TableCell colSpan={6} className="h-40 text-center"><div className="flex flex-col items-center gap-2 text-muted-foreground"><Search className="size-6 text-slate-300" /><p className="text-sm">没有找到匹配的管理员</p></div></TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between border-t border-border px-5 py-4 text-xs text-muted-foreground"><span>共 {filtered.length} 条记录</span><div className="flex items-center gap-2"><Button variant="outline" size="sm" disabled>上一页</Button><span className="flex size-8 items-center justify-center rounded-md bg-primary text-white">1</span><Button variant="outline" size="sm" disabled>下一页</Button></div></div>
      </Card>

      <Dialog open={editorOpen} onOpenChange={(open) => !pendingAction && setEditorOpen(open)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "编辑管理员" : "添加管理员"}</DialogTitle><DialogDescription>{editing ? "修改成员资料、角色权限、密码或账号状态。" : "创建新的后台成员，并设置对应权限。"}</DialogDescription></DialogHeader>
          <form onSubmit={submitUser} className="space-y-4">
            {formError && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">{formError}</p>}
            <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="admin-name">姓名</Label><Input id="admin-name" value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="请输入姓名" autoFocus /></div><div className="space-y-2"><Label htmlFor="admin-email">邮箱</Label><Input id="admin-email" type="email" value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="name@example.com" /></div></div>
            <div className="space-y-2"><Label htmlFor="admin-password">{editing ? "重置密码（选填）" : "初始密码"}</Label><Input id="admin-password" type="password" autoComplete="new-password" value={form.password} onChange={(event) => update("password", event.target.value)} placeholder={editing ? "留空则保持原密码" : "至少 8 个字符"} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="admin-role">角色权限</Label><Select id="admin-role" value={form.role} onChange={(event) => update("role", event.target.value as AdminRole)} disabled={editing?.id === currentAdminId}><option value="system">系统管理员</option><option value="admin">普通管理员</option></Select></div>
              <div className="space-y-2"><Label htmlFor="admin-status">账号状态</Label><Select id="admin-status" value={form.isActive ? "active" : "disabled"} onChange={(event) => update("isActive", event.target.value === "active")} disabled={editing?.id === currentAdminId}><option value="active">正常</option><option value="disabled">停用</option></Select></div>
            </div>
            {editing?.id === currentAdminId && <p className="text-xs text-muted-foreground">当前登录账号不可修改自身角色或停用。</p>}
            <DialogFooter className="pt-2"><DialogClose asChild><Button type="button" variant="outline" disabled={Boolean(pendingAction)}>取消</Button></DialogClose><Button type="submit" disabled={Boolean(pendingAction)}>{pendingAction === "save" && <LoaderCircle className="size-4 animate-spin" />}{editing ? "保存更改" : "添加管理员"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleting)} onOpenChange={(open) => !open && !pendingAction && setDeleting(null)}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>删除管理员</DialogTitle><DialogDescription>确定要删除管理员「{deleting?.name}」吗？该账号的所有登录会话也会失效。</DialogDescription></DialogHeader><DialogFooter><DialogClose asChild><Button type="button" variant="outline" disabled={Boolean(pendingAction)}>取消</Button></DialogClose><Button variant="destructive" onClick={deleteUser} disabled={Boolean(pendingAction)}>{pendingAction?.startsWith("delete-") && <LoaderCircle className="size-4 animate-spin" />}确认删除</Button></DialogFooter></DialogContent>
      </Dialog>

      {toast && <div className="fixed right-5 bottom-5 z-[60] flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl"><CheckCircle2 className="size-4 text-emerald-400" />{toast}</div>}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, detail, color }: { icon: typeof Activity; label: string; value: string; detail: string; color: "indigo" | "teal" | "orange" }) {
  const colors = { indigo: "bg-indigo-50 text-indigo-600", teal: "bg-teal-50 text-teal-600", orange: "bg-orange-50 text-orange-600" };
  return <Card className="flex items-center gap-4 p-5"><span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${colors[color]}`}><Icon className="size-5" /></span><div><p className="text-xs font-medium text-muted-foreground">{label}</p><div className="mt-1 flex items-baseline gap-2"><p className="text-2xl font-semibold tracking-tight text-slate-900">{value}</p><span className="hidden text-[11px] text-slate-400 xl:inline">{detail}</span></div></div></Card>;
}
