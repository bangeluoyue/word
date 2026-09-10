"use client";

import { FormEvent, useMemo, useState, useSyncExternalStore } from "react";
import { BookOpen, CheckCircle2, LibraryBig, Pencil, Plus, Search, Trash2, Type } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BOOK_COLORS, DEFAULT_BOOKS, type BookStatus, type WordBook } from "@/lib/mock-data";
import { BOOKS_KEY } from "@/lib/storage";

const BOOKS_EVENT = "wordflow:books-updated";
const DEFAULT_BOOKS_JSON = JSON.stringify(DEFAULT_BOOKS);
const emptyForm = { name: "", description: "", category: "雅思", wordCount: "", status: "draft" as BookStatus };

function subscribeBooks(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(BOOKS_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(BOOKS_EVENT, callback);
  };
}

function getBooksSnapshot() {
  return window.localStorage.getItem(BOOKS_KEY) ?? DEFAULT_BOOKS_JSON;
}

function saveBooks(books: WordBook[]) {
  window.localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
  window.dispatchEvent(new Event(BOOKS_EVENT));
}

function formatDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${year}年${Number(month)}月${Number(day)}日`;
}

const statusMap = {
  published: { label: "已发布", variant: "success" as const },
  draft: { label: "草稿", variant: "warning" as const },
  archived: { label: "已归档", variant: "neutral" as const },
};

export function BooksPage() {
  const rawBooks = useSyncExternalStore(subscribeBooks, getBooksSnapshot, () => DEFAULT_BOOKS_JSON);
  const books = useMemo(() => {
    try { return JSON.parse(rawBooks) as WordBook[]; } catch { return DEFAULT_BOOKS; }
  }, [rawBooks]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<WordBook | null>(null);
  const [deleting, setDeleting] = useState<WordBook | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState("");

  const filtered = books.filter((book) => {
    const keyword = search.trim().toLowerCase();
    const matchesSearch = !keyword || book.name.toLowerCase().includes(keyword) || book.category.toLowerCase().includes(keyword);
    return matchesSearch && (status === "all" || book.status === status);
  });
  const totalWords = books.reduce((sum, book) => sum + book.wordCount, 0);
  const published = books.filter((book) => book.status === "published").length;

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

  function openEdit(book: WordBook) {
    setEditing(book);
    setForm({ name: book.name, description: book.description, category: book.category, wordCount: String(book.wordCount), status: book.status });
    setFormError("");
    setEditorOpen(true);
  }

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submitBook(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim()) return setFormError("请输入单词书名称");
    if (!form.description.trim()) return setFormError("请输入一句内容简介");
    if (!form.wordCount || Number(form.wordCount) < 1) return setFormError("词汇数量必须大于 0");

    if (editing) {
      saveBooks(books.map((book) => book.id === editing.id ? { ...book, ...form, name: form.name.trim(), description: form.description.trim(), wordCount: Number(form.wordCount), updatedAt: new Date().toISOString().slice(0, 10) } : book));
      notify("单词书已更新");
    } else {
      const newBook: WordBook = { id: `book-${Date.now()}`, name: form.name.trim(), description: form.description.trim(), category: form.category, wordCount: Number(form.wordCount), status: form.status, updatedAt: new Date().toISOString().slice(0, 10), color: BOOK_COLORS[books.length % BOOK_COLORS.length] };
      saveBooks([newBook, ...books]);
      notify("单词书已创建");
    }
    setEditorOpen(false);
  }

  function deleteBook() {
    if (!deleting) return;
    saveBooks(books.filter((book) => book.id !== deleting.id));
    setDeleting(null);
    notify("单词书已删除");
  }

  return (
    <div className="mx-auto w-full max-w-[1500px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9 xl:px-10">
      <header className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400"><span>管理工作台</span><span>/</span><span className="text-slate-600">单词书管理</span></div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[28px]">单词书管理</h1>
          <p className="mt-2 text-sm text-muted-foreground">管理、维护和发布平台内的全部单词书</p>
        </div>
        <Button onClick={openCreate} className="w-fit"><Plus className="size-4" />新建单词书</Button>
      </header>

      <section className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard icon={LibraryBig} label="单词书总数" value={String(books.length)} detail="覆盖 5 个学习场景" color="indigo" />
        <StatCard icon={Type} label="收录词汇" value={totalWords.toLocaleString("zh-CN")} detail="较上月新增 8.2%" color="teal" />
        <StatCard icon={CheckCircle2} label="已发布" value={String(published)} detail={`${Math.round((published / Math.max(books.length, 1)) * 100)}% 的内容已上线`} color="orange" />
      </section>

      <Card className="overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="relative w-full sm:max-w-[310px]">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索单词书名称或分类" className="bg-slate-50/80 pl-9" />
          </div>
          <Select value={status} onChange={(event) => setStatus(event.target.value)} className="w-full bg-white sm:w-[138px]" aria-label="按状态筛选">
            <option value="all">全部状态</option><option value="published">已发布</option><option value="draft">草稿</option><option value="archived">已归档</option>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table className="min-w-[850px]">
            <TableHeader><TableRow className="bg-slate-50/70 hover:bg-slate-50/70"><TableHead className="w-[38%]">单词书</TableHead><TableHead>分类</TableHead><TableHead>词汇数量</TableHead><TableHead>状态</TableHead><TableHead>最后更新</TableHead><TableHead className="w-24 text-right">操作</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.map((book) => (
                <TableRow key={book.id}>
                  <TableCell>
                    <div className="flex items-center gap-3.5">
                      <span className="relative flex h-12 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md text-white shadow-sm" style={{ backgroundColor: book.color }}>
                        <span className="absolute inset-y-0 left-0 w-1 bg-black/10" /><BookOpen className="size-[18px]" strokeWidth={1.8} />
                      </span>
                      <div className="min-w-0"><p className="truncate font-medium text-slate-800">{book.name}</p><p className="mt-1 max-w-[330px] truncate text-xs text-muted-foreground">{book.description}</p></div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline" className="text-slate-600">{book.category}</Badge></TableCell>
                  <TableCell className="font-medium text-slate-700">{book.wordCount.toLocaleString("zh-CN")}</TableCell>
                  <TableCell><Badge variant={statusMap[book.status].variant}><span className="mr-1.5 size-1.5 rounded-full bg-current" />{statusMap[book.status].label}</Badge></TableCell>
                  <TableCell className="text-slate-500">{formatDate(book.updatedAt)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1"><Button variant="ghost" size="icon" onClick={() => openEdit(book)} className="size-8 text-slate-500" aria-label={`编辑${book.name}`}><Pencil className="size-4" /></Button><Button variant="ghost" size="icon" onClick={() => setDeleting(book)} className="size-8 text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label={`删除${book.name}`}><Trash2 className="size-4" /></Button></div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={6} className="h-40 text-center"><div className="flex flex-col items-center gap-2 text-muted-foreground"><Search className="size-6 text-slate-300" /><p className="text-sm">没有找到匹配的单词书</p></div></TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between border-t border-border px-5 py-4 text-xs text-muted-foreground"><span>共 {filtered.length} 条记录</span><div className="flex items-center gap-2"><Button variant="outline" size="sm" disabled>上一页</Button><span className="flex size-8 items-center justify-center rounded-md bg-primary text-white">1</span><Button variant="outline" size="sm" disabled>下一页</Button></div></div>
      </Card>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "编辑单词书" : "新建单词书"}</DialogTitle><DialogDescription>{editing ? "更新单词书的基本信息和发布状态。" : "填写基本信息，创建一本新的单词书。"}</DialogDescription></DialogHeader>
          <form onSubmit={submitBook} className="space-y-4">
            {formError && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{formError}</p>}
            <div className="space-y-2"><Label htmlFor="book-name">单词书名称</Label><Input id="book-name" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="例如：托福高频词汇" autoFocus /></div>
            <div className="space-y-2"><Label htmlFor="book-description">内容简介</Label><Input id="book-description" value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="一句话介绍这本单词书" /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="book-category">分类</Label><Select id="book-category" value={form.category} onChange={(e) => update("category", e.target.value)}><option>雅思</option><option>考研</option><option>商务</option><option>四六级</option><option>日常</option><option>托福</option></Select></div>
              <div className="space-y-2"><Label htmlFor="book-count">词汇数量</Label><Input id="book-count" type="number" min="1" value={form.wordCount} onChange={(e) => update("wordCount", e.target.value)} placeholder="0" /></div>
            </div>
            <div className="space-y-2"><Label htmlFor="book-status">状态</Label><Select id="book-status" value={form.status} onChange={(e) => update("status", e.target.value)}><option value="draft">草稿</option><option value="published">已发布</option><option value="archived">已归档</option></Select></div>
            <DialogFooter className="pt-2"><DialogClose asChild><Button variant="outline">取消</Button></DialogClose><Button type="submit">{editing ? "保存更改" : "创建单词书"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>删除单词书</DialogTitle><DialogDescription>确定要删除「{deleting?.name}」吗？此操作无法撤销。</DialogDescription></DialogHeader><DialogFooter><DialogClose asChild><Button variant="outline">取消</Button></DialogClose><Button variant="destructive" onClick={deleteBook}>确认删除</Button></DialogFooter></DialogContent>
      </Dialog>

      {toast && <div className="fixed right-5 bottom-5 z-[60] flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl"><CheckCircle2 className="size-4 text-emerald-400" />{toast}</div>}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, detail, color }: { icon: typeof LibraryBig; label: string; value: string; detail: string; color: "indigo" | "teal" | "orange" }) {
  const colors = { indigo: "bg-indigo-50 text-indigo-600", teal: "bg-teal-50 text-teal-600", orange: "bg-orange-50 text-orange-600" };
  return <Card className="flex items-center gap-4 p-5"><span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${colors[color]}`}><Icon className="size-5" /></span><div><p className="text-xs font-medium text-muted-foreground">{label}</p><div className="mt-1 flex items-baseline gap-2"><p className="text-2xl font-semibold tracking-tight text-slate-900">{value}</p><span className="hidden text-[11px] text-slate-400 xl:inline">{detail}</span></div></div></Card>;
}

