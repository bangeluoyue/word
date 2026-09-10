"use client";

import { FormEvent, useMemo, useState, useSyncExternalStore } from "react";
import { Activity, CheckCircle2, Pencil, Plus, Search, ShieldCheck, Trash2, UserRoundCheck, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AVATAR_COLORS, DEFAULT_ADMINS, type AdminRole, type AdminStatus, type AdminUser } from "@/lib/mock-data";
import { getSession, USERS_KEY } from "@/lib/storage";

const USERS_EVENT = "wordflow:users-updated";
const DEFAULT_USERS_JSON = JSON.stringify(DEFAULT_ADMINS);

type AdminForm = { name: string; email: string; role: AdminRole; status: AdminStatus; password: string };
const emptyForm: AdminForm = { name: "", email: "", role: "内容管理员", status: "active", password: "" };

function subscribeUsers(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(USERS_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(USERS_EVENT, callback);
  };
}

function getUsersSnapshot() {
  return window.localStorage.getItem(USERS_KEY) ?? DEFAULT_USERS_JSON;
}

function saveUsers(users: AdminUser[]) {
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
  window.dispatchEvent(new Event(USERS_EVENT));
}

function formatDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${year}.${month}.${day}`;
}

export function AdminUsersPage() {
  const rawUsers = useSyncExternalStore(subscribeUsers, getUsersSnapshot, () => DEFAULT_USERS_JSON);
  const users = useMemo(() => {
    try { return JSON.parse(rawUsers) as AdminUser[]; } catch { return DEFAULT_ADMINS; }
  }, [rawUsers]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState<AdminUser | null>(null);
  const [form, setForm] = useState<AdminForm>(emptyForm);
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState("");

  const filtered = users.filter((user) => {
    const keyword = search.trim().toLowerCase();
    const matchesSearch = !keyword || user.name.toLowerCase().includes(keyword) || user.email.toLowerCase().includes(keyword);
    return matchesSearch && (role === "all" || user.role === role);
  });
  const activeUsers = users.filter((user) => user.status === "active").length;
  const superAdmins = users.filter((user) => user.role === "超级管理员").length;

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

  function openEdit(user: AdminUser) {
    setEditing(user);
    setForm({ name: user.name, email: user.email, role: user.role, status: user.status, password: "" });
    setFormError("");
    setEditorOpen(true);
  }

  function update<K extends keyof AdminForm>(field: K, value: AdminForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submitUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (form.name.trim().length < 2) return setFormError("姓名至少需要 2 个字符");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setFormError("请输入有效的邮箱地址");
    if (!editing && form.password.length < 8) return setFormError("初始密码至少需要 8 个字符");
    if (users.some((user) => user.id !== editing?.id && user.email.toLowerCase() === form.email.trim().toLowerCase())) return setFormError("该邮箱已被其他管理员使用");

    if (editing) {
      saveUsers(users.map((user) => user.id === editing.id ? { ...user, name: form.name.trim(), email: form.email.trim().toLowerCase(), role: form.role, status: form.status, password: form.password || user.password } : user));
      notify("管理员信息已更新");
    } else {
      const newUser: AdminUser = { id: `admin-${Date.now()}`, name: form.name.trim(), email: form.email.trim().toLowerCase(), password: form.password, role: form.role, status: form.status, lastLogin: "尚未登录", createdAt: new Date().toISOString().slice(0, 10), color: AVATAR_COLORS[users.length % AVATAR_COLORS.length] };
      saveUsers([...users, newUser]);
      notify("管理员已添加");
    }
    setEditorOpen(false);
  }

  function toggleStatus(user: AdminUser) {
    const current = getSession();
    if (current?.email === user.email) { notify("不能停用当前登录账号"); return; }
    const nextStatus: AdminStatus = user.status === "active" ? "disabled" : "active";
    saveUsers(users.map((item) => item.id === user.id ? { ...item, status: nextStatus } : item));
    notify(nextStatus === "active" ? "管理员已启用" : "管理员已停用");
  }

  function deleteUser() {
    if (!deleting) return;
    if (getSession()?.email === deleting.email) { setDeleting(null); notify("不能删除当前登录账号"); return; }
    saveUsers(users.filter((user) => user.id !== deleting.id));
    setDeleting(null);
    notify("管理员已删除");
  }

  return (
    <div className="mx-auto w-full max-w-[1500px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9 xl:px-10">
      <header className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400"><span>管理工作台</span><span>/</span><span className="text-slate-600">管理员管理</span></div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[28px]">管理员管理</h1>
          <p className="mt-2 text-sm text-muted-foreground">管理后台成员、角色权限与账号状态</p>
        </div>
        <Button onClick={openCreate} className="w-fit"><Plus className="size-4" />添加管理员</Button>
      </header>

      <section className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard icon={UsersRound} label="管理员总数" value={String(users.length)} detail="当前团队成员" color="indigo" />
        <StatCard icon={UserRoundCheck} label="正常账号" value={String(activeUsers)} detail={`${users.length - activeUsers} 个账号已停用`} color="teal" />
        <StatCard icon={ShieldCheck} label="超级管理员" value={String(superAdmins)} detail="拥有全部管理权限" color="orange" />
      </section>

      <Card className="overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="relative w-full sm:max-w-[310px]">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索姓名或邮箱" className="bg-slate-50/80 pl-9" />
          </div>
          <Select value={role} onChange={(event) => setRole(event.target.value)} className="w-full bg-white sm:w-[156px]" aria-label="按角色筛选">
            <option value="all">全部角色</option><option>超级管理员</option><option>管理员</option><option>内容管理员</option>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table className="min-w-[900px]">
            <TableHeader><TableRow className="bg-slate-50/70 hover:bg-slate-50/70"><TableHead className="w-[32%]">管理员</TableHead><TableHead>角色</TableHead><TableHead>账号状态</TableHead><TableHead>最近登录</TableHead><TableHead>加入日期</TableHead><TableHead className="w-[132px] text-right">操作</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3.5">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white shadow-sm" style={{ backgroundColor: user.color }}>{user.name.slice(0, 1)}</span>
                      <div className="min-w-0"><p className="flex items-center gap-2 truncate font-medium text-slate-800">{user.name}{user.email === getSession()?.email && <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-primary">当前账号</span>}</p><p className="mt-1 truncate text-xs text-muted-foreground">{user.email}</p></div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant={user.role === "超级管理员" ? "default" : user.role === "管理员" ? "outline" : "neutral"}>{user.role}</Badge></TableCell>
                  <TableCell><button type="button" onClick={() => toggleStatus(user)} className="group inline-flex cursor-pointer items-center gap-2" title={user.status === "active" ? "点击停用账号" : "点击启用账号"}><span className={`relative h-5 w-9 rounded-full transition-colors ${user.status === "active" ? "bg-emerald-500" : "bg-slate-300"}`}><span className={`absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition-all ${user.status === "active" ? "left-[18px]" : "left-0.5"}`} /></span><span className={`text-xs font-medium ${user.status === "active" ? "text-emerald-700" : "text-slate-500"}`}>{user.status === "active" ? "正常" : "已停用"}</span></button></TableCell>
                  <TableCell className="text-slate-600">{user.lastLogin}</TableCell>
                  <TableCell className="text-slate-500">{formatDate(user.createdAt)}</TableCell>
                  <TableCell><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" onClick={() => openEdit(user)} className="size-8 text-slate-500" aria-label={`编辑${user.name}`}><Pencil className="size-4" /></Button><Button variant="ghost" size="icon" onClick={() => setDeleting(user)} className="size-8 text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label={`删除${user.name}`}><Trash2 className="size-4" /></Button></div></TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={6} className="h-40 text-center"><div className="flex flex-col items-center gap-2 text-muted-foreground"><Search className="size-6 text-slate-300" /><p className="text-sm">没有找到匹配的管理员</p></div></TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between border-t border-border px-5 py-4 text-xs text-muted-foreground"><span>共 {filtered.length} 条记录</span><div className="flex items-center gap-2"><Button variant="outline" size="sm" disabled>上一页</Button><span className="flex size-8 items-center justify-center rounded-md bg-primary text-white">1</span><Button variant="outline" size="sm" disabled>下一页</Button></div></div>
      </Card>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "编辑管理员" : "添加管理员"}</DialogTitle><DialogDescription>{editing ? "修改成员资料、角色权限或账号状态。" : "创建新的后台成员，并设置对应权限。"}</DialogDescription></DialogHeader>
          <form onSubmit={submitUser} className="space-y-4">
            {formError && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{formError}</p>}
            <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="admin-name">姓名</Label><Input id="admin-name" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="请输入姓名" autoFocus /></div><div className="space-y-2"><Label htmlFor="admin-email">邮箱</Label><Input id="admin-email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="name@example.com" /></div></div>
            <div className="space-y-2"><Label htmlFor="admin-password">{editing ? "重置密码（选填）" : "初始密码"}</Label><Input id="admin-password" type="password" autoComplete="new-password" value={form.password} onChange={(e) => update("password", e.target.value)} placeholder={editing ? "留空则保持原密码" : "至少 8 个字符"} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="admin-role">角色权限</Label><Select id="admin-role" value={form.role} onChange={(e) => update("role", e.target.value as AdminRole)}><option>超级管理员</option><option>管理员</option><option>内容管理员</option></Select></div>
              <div className="space-y-2"><Label htmlFor="admin-status">账号状态</Label><Select id="admin-status" value={form.status} onChange={(e) => update("status", e.target.value as AdminStatus)}><option value="active">正常</option><option value="disabled">停用</option></Select></div>
            </div>
            <DialogFooter className="pt-2"><DialogClose asChild><Button variant="outline">取消</Button></DialogClose><Button type="submit">{editing ? "保存更改" : "添加管理员"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>删除管理员</DialogTitle><DialogDescription>确定要删除管理员「{deleting?.name}」吗？该账号将无法再登录后台。</DialogDescription></DialogHeader><DialogFooter><DialogClose asChild><Button variant="outline">取消</Button></DialogClose><Button variant="destructive" onClick={deleteUser}>确认删除</Button></DialogFooter></DialogContent>
      </Dialog>

      {toast && <div className="fixed right-5 bottom-5 z-[60] flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl"><CheckCircle2 className="size-4 text-emerald-400" />{toast}</div>}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, detail, color }: { icon: typeof Activity; label: string; value: string; detail: string; color: "indigo" | "teal" | "orange" }) {
  const colors = { indigo: "bg-indigo-50 text-indigo-600", teal: "bg-teal-50 text-teal-600", orange: "bg-orange-50 text-orange-600" };
  return <Card className="flex items-center gap-4 p-5"><span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${colors[color]}`}><Icon className="size-5" /></span><div><p className="text-xs font-medium text-muted-foreground">{label}</p><div className="mt-1 flex items-baseline gap-2"><p className="text-2xl font-semibold tracking-tight text-slate-900">{value}</p><span className="hidden text-[11px] text-slate-400 xl:inline">{detail}</span></div></div></Card>;
}

