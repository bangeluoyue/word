import { NextResponse } from "next/server";
import { db } from "@/db";
import { books } from "@/db/schema";
import { bookSelection, listBooks, serializeBook } from "@/lib/books/data";
import { validateBookInput } from "@/lib/books/validation";
import { isUniqueViolation, jsonError, requireAdmin } from "@/lib/auth/http";

export const runtime = "nodejs";

export async function GET() {
  const authorization = await requireAdmin();
  if ("response" in authorization) return authorization.response;
  return NextResponse.json({ books: await listBooks() });
}

export async function POST(request: Request) {
  const authorization = await requireAdmin();
  if ("response" in authorization) return authorization.response;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return jsonError("请求内容格式不正确", 400);
  }

  const result = validateBookInput(body);
  if (!result.data) return jsonError(result.error, 400);

  try {
    const [book] = await db.insert(books).values(result.data).returning(bookSelection);
    if (!book) return jsonError("单词书创建失败，请稍后重试", 500);
    return NextResponse.json({ book: serializeBook(book) }, { status: 201 });
  } catch (error) {
    if (isUniqueViolation(error)) return jsonError("该 bookId 已存在", 409);
    console.error("Failed to create book", error);
    return jsonError("单词书创建失败，请稍后重试", 500);
  }
}
