"use client";

import { FormEvent, useMemo, useState } from "react";
import { BookImage, CheckCircle2, Hash, ImageOff, LibraryBig, LoaderCircle, Pencil, Plus, Search, Tags, Trash2, Type } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { BookListItem } from "@/lib/books/types";

type BookForm = { title: string; wordCount: string; coverUrl: string; bookId: string; tags: string };
type ApiResponse = { book?: BookListItem; error?: string };

const emptyForm: BookForm = { title: "", wordCount: "", coverUrl: "", bookId: "", tags: "" };

function parseTags(value: string) {
  return [...new Set(value.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean))];
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value));
}

export function BooksPage({ initialBooks }: { initialBooks: BookListItem[] }) {
  const [books, setBooks] = useState(initialBooks);
  const [search, setSearch] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<BookListItem | null>(null);
  const [deleting, setDeleting] = useState<BookListItem | null>(null);
  const [form, setForm] = useState<BookForm>(emptyForm);
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState("");
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const filtered = useMemo(() => books.filter((book) => {
    const keyword = search.trim().toLowerCase();
    return !keyword
      || book.title.toLowerCase().includes(keyword)
      || book.bookId.toLowerCase().includes(keyword)
      || book.tags.some((tag) => tag.toLowerCase().includes(keyword));
  }), [books, search]);
  const totalWords = books.reduce((sum, book) => sum + book.wordCount, 0);
  const tagCount = new Set(books.flatMap((book) => book.tags)).size;

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

  function openEdit(book: BookListItem) {
    setEditing(book);
    setForm({
      title: book.title,
      wordCount: String(book.wordCount),
      coverUrl: book.coverUrl,
      bookId: book.bookId,
      tags: book.tags.join(", "),
    });
    setFormError("");
    setEditorOpen(true);
  }

  function update(field: keyof BookForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submitBook(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    const count = Number(form.wordCount);
    if (!form.title.trim()) return setFormError("请输入单词书标题");
    if (!form.bookId.trim()) return setFormError("请输入 bookId");
    if (!/^[\p{L}\p{N}._-]+$/u.test(form.bookId.trim())) return setFormError("bookId 仅支持字母、数字、点、下划线和短横线");
    if (form.wordCount === "" || !Number.isInteger(count) || count < 0 || count > 2147483647) return setFormError("单词数量必须是 0 到 2147483647 之间的整数");
    if (!form.coverUrl.trim()) return setFormError("请输入封面 URL");

    setPendingAction("save");
    try {
      const response = await fetch(editing ? `/api/books/${encodeURIComponent(editing.bookId)}` : "/api/books", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          wordCount: count,
          coverUrl: form.coverUrl.trim(),
          bookId: form.bookId.trim(),
          tags: parseTags(form.tags),
        }),
      });
      const result = (await response.json()) as ApiResponse;
      if (!response.ok || !result.book) {
        setFormError(result.error ?? "保存失败，请稍后重试");
        return;
      }
      setBooks((current) => editing
        ? current.map((book) => book.bookId === editing.bookId ? result.book as BookListItem : book)
        : [result.book as BookListItem, ...current]);
      setEditorOpen(false);
      notify(editing ? "单词书已更新" : "单词书已创建");
    } catch {
      setFormError("暂时无法连接服务器，请稍后重试");
    } finally {
      setPendingAction(null);
    }
  }

  async function deleteBook() {
    if (!deleting) return;
    setPendingAction(`delete-${deleting.bookId}`);
    try {
      const response = await fetch(`/api/books/${encodeURIComponent(deleting.bookId)}`, { method: "DELETE" });
      const result = (await response.json()) as ApiResponse;
      if (!response.ok) return notify(result.error ?? "删除失败，请稍后重试");
      setBooks((current) => current.filter((book) => book.bookId !== deleting.bookId));
      setDeleting(null);
      notify("单词书及其关联单词已删除");
    } catch {
      notify("暂时无法连接服务器");
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1500px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9 xl:px-10">
      <header className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400"><span>管理工作台</span><span>/</span><span className="text-slate-600">单词书管理</span></div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[28px]">单词书管理</h1>
          <p className="mt-2 text-sm text-muted-foreground">录入和维护单词书，并通过 bookId 关联词汇数据</p>
        </div>
        <Button onClick={openCreate} className="w-fit"><Plus className="size-4" />新增单词书</Button>
      </header>

      <section className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard icon={LibraryBig} label="单词书总数" value={String(books.length)} detail="当前已录入" color="indigo" />
        <StatCard icon={Type} label="收录词汇" value={totalWords.toLocaleString("zh-CN")} detail="按录入数量统计" color="teal" />
        <StatCard icon={Tags} label="标签数量" value={String(tagCount)} detail="去重后统计" color="orange" />
      </section>

      <Card className="overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
        <div className="border-b border-border p-4 sm:px-5">
          <div className="relative w-full sm:max-w-[360px]">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索标题、bookId 或标签" className="bg-slate-50/80 pl-9" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table className="min-w-[820px]">
            <TableHeader><TableRow className="bg-slate-50/70 hover:bg-slate-50/70"><TableHead className="w-24">封面</TableHead><TableHead className="w-[28%]">标题</TableHead><TableHead>bookId</TableHead><TableHead>单词数量</TableHead><TableHead>标签</TableHead><TableHead>更新时间</TableHead><TableHead className="w-24 text-right">操作</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.map((book) => (
                <TableRow key={book.bookId}>
                  <TableCell><BookCover key={book.coverUrl} src={book.coverUrl} title={book.title} /></TableCell>
                  <TableCell><p className="max-w-[260px] truncate font-medium text-slate-800" title={book.title}>{book.title}</p></TableCell>
                  <TableCell><span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-600"><Hash className="size-3" />{book.bookId}</span></TableCell>
                  <TableCell className="font-medium text-slate-700">{book.wordCount.toLocaleString("zh-CN")}</TableCell>
                  <TableCell><div className="flex max-w-[260px] flex-wrap gap-1.5">{book.tags.length ? book.tags.map((tag) => <Badge key={tag} variant="outline" className="text-slate-600">{tag}</Badge>) : <span className="text-xs text-slate-400">暂无标签</span>}</div></TableCell>
                  <TableCell className="text-slate-500">{formatDate(book.updatedAt)}</TableCell>
                  <TableCell><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" onClick={() => openEdit(book)} className="size-8 text-slate-500" aria-label={`编辑${book.title}`}><Pencil className="size-4" /></Button><Button variant="ghost" size="icon" onClick={() => setDeleting(book)} className="size-8 text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label={`删除${book.title}`}><Trash2 className="size-4" /></Button></div></TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={7} className="h-40 text-center"><div className="flex flex-col items-center gap-2 text-muted-foreground"><Search className="size-6 text-slate-300" /><p className="text-sm">没有找到匹配的单词书</p></div></TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between border-t border-border px-5 py-4 text-xs text-muted-foreground"><span>共 {filtered.length} 条记录</span><div className="flex items-center gap-2"><Button variant="outline" size="sm" disabled>上一页</Button><span className="flex size-8 items-center justify-center rounded-md bg-primary text-white">1</span><Button variant="outline" size="sm" disabled>下一页</Button></div></div>
      </Card>

      <Dialog open={editorOpen} onOpenChange={(open) => !pendingAction && setEditorOpen(open)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "编辑单词书" : "新增单词书"}</DialogTitle><DialogDescription>{editing ? "修改单词书信息；变更 bookId 时，关联单词会自动同步。" : "填写完整信息后创建一本新的单词书。"}</DialogDescription></DialogHeader>
          <form onSubmit={submitBook} className="space-y-4">
            {formError && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">{formError}</p>}
            <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="book-title">标题</Label><Input id="book-title" value={form.title} onChange={(event) => update("title", event.target.value)} placeholder="例如：人教版小学三年级词汇" maxLength={200} autoFocus /></div><div className="space-y-2"><Label htmlFor="book-id">bookId</Label><Input id="book-id" value={form.bookId} onChange={(event) => update("bookId", event.target.value)} placeholder="例如：PEPXiaoXue3_1" maxLength={100} /></div></div>
            <div className="space-y-2"><Label htmlFor="book-cover">封面 URL</Label><Input id="book-cover" type="text" inputMode="url" value={form.coverUrl} onChange={(event) => update("coverUrl", event.target.value)} placeholder="https://example.com/cover.jpg" /></div>
            <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="book-count">单词数量</Label><Input id="book-count" type="number" min="0" max="2147483647" step="1" value={form.wordCount} onChange={(event) => update("wordCount", event.target.value)} placeholder="0" /></div><div className="space-y-2"><Label htmlFor="book-tags">标签</Label><Input id="book-tags" value={form.tags} onChange={(event) => update("tags", event.target.value)} placeholder="小学, 人教版, 英语" /><p className="text-xs text-muted-foreground">多个标签请使用逗号分隔</p></div></div>
            <DialogFooter className="pt-2"><DialogClose asChild><Button type="button" variant="outline" disabled={Boolean(pendingAction)}>取消</Button></DialogClose><Button type="submit" disabled={Boolean(pendingAction)}>{pendingAction === "save" && <LoaderCircle className="size-4 animate-spin" />}{editing ? "保存更改" : "创建单词书"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleting)} onOpenChange={(open) => !open && !pendingAction && setDeleting(null)}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>删除单词书</DialogTitle><DialogDescription>确定要删除「{deleting?.title}」吗？该单词书以及 words 表中 bookId 相同的全部单词都会被永久删除，此操作无法撤销。</DialogDescription></DialogHeader><DialogFooter><DialogClose asChild><Button type="button" variant="outline" disabled={Boolean(pendingAction)}>取消</Button></DialogClose><Button variant="destructive" onClick={deleteBook} disabled={Boolean(pendingAction)}>{pendingAction?.startsWith("delete-") && <LoaderCircle className="size-4 animate-spin" />}确认删除</Button></DialogFooter></DialogContent>
      </Dialog>

      {toast && <div className="fixed right-5 bottom-5 z-[60] flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl"><CheckCircle2 className="size-4 text-emerald-400" />{toast}</div>}
    </div>
  );
}

function BookCover({ src, title }: { src: string; title: string }) {
  const [failed, setFailed] = useState(!src);
  return (
    <span className="flex h-14 w-11 shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-slate-100 text-slate-400 shadow-sm">
      {failed ? <ImageOff className="size-4" /> : (
        // 封面域名由用户录入，使用浏览器直连可避免开放服务端图片代理。
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={`${title}封面`} className="h-full w-full object-cover" referrerPolicy="no-referrer" onError={() => setFailed(true)} />
      )}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, detail, color }: { icon: typeof BookImage; label: string; value: string; detail: string; color: "indigo" | "teal" | "orange" }) {
  const colors = { indigo: "bg-indigo-50 text-indigo-600", teal: "bg-teal-50 text-teal-600", orange: "bg-orange-50 text-orange-600" };
  return <Card className="flex items-center gap-4 p-5"><span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${colors[color]}`}><Icon className="size-5" /></span><div><p className="text-xs font-medium text-muted-foreground">{label}</p><div className="mt-1 flex items-baseline gap-2"><p className="text-2xl font-semibold tracking-tight text-slate-900">{value}</p><span className="hidden text-[11px] text-slate-400 xl:inline">{detail}</span></div></div></Card>;
}
