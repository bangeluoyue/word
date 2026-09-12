import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { books } from "@/db/schema";
import { bookSelection, serializeBook } from "@/lib/books/data";
import { validateBookInput } from "@/lib/books/validation";
import { isUniqueViolation, jsonError, requireAdmin } from "@/lib/auth/http";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ bookId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const authorization = await requireAdmin();
  if ("response" in authorization) return authorization.response;

  const { bookId } = await context.params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return jsonError("请求内容格式不正确", 400);
  }

  const result = validateBookInput(body);
  if (!result.data) return jsonError(result.error, 400);

  try {
    const [book] = await db
      .update(books)
      .set({ ...result.data, updatedAt: new Date() })
      .where(eq(books.bookId, bookId))
      .returning(bookSelection);

    if (!book) return jsonError("单词书不存在", 404);
    return NextResponse.json({ book: serializeBook(book) });
  } catch (error) {
    if (isUniqueViolation(error)) return jsonError("该 bookId 已存在", 409);
    console.error("Failed to update book", error);
    return jsonError("单词书更新失败，请稍后重试", 500);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const authorization = await requireAdmin();
  if ("response" in authorization) return authorization.response;

  const { bookId } = await context.params;
  try {
    const [deleted] = await db.delete(books).where(eq(books.bookId, bookId)).returning({ bookId: books.bookId });
    if (!deleted) return jsonError("单词书不存在", 404);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete book", error);
    return jsonError("单词书删除失败，请稍后重试", 500);
  }
}
