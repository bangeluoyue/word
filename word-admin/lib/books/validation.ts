import type { BookInput } from "./types";

type ValidationResult =
  | { data: BookInput; error?: never }
  | { data?: never; error: string };

function isValidCoverUrl(value: string) {
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

export function validateBookInput(body: Record<string, unknown>): ValidationResult {
  const bookId = typeof body.bookId === "string" ? body.bookId.trim() : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const coverUrl = typeof body.coverUrl === "string" ? body.coverUrl.trim() : "";
  const wordCount = body.wordCount;
  const rawTags = Array.isArray(body.tags) ? body.tags : [];

  if (!title) return { error: "请输入单词书标题" };
  if (title.length > 200) return { error: "标题不能超过 200 个字符" };
  if (!bookId) return { error: "请输入 bookId" };
  if (bookId.length > 100 || !/^[\p{L}\p{N}._-]+$/u.test(bookId)) {
    return { error: "bookId 仅支持字母、数字、点、下划线和短横线，且不能超过 100 个字符" };
  }
  if (typeof wordCount !== "number" || !Number.isInteger(wordCount) || wordCount < 0 || wordCount > 2147483647) {
    return { error: "单词数量必须是 0 到 2147483647 之间的整数" };
  }
  if (!coverUrl) return { error: "请输入封面 URL" };
  if (coverUrl.length > 2048 || !isValidCoverUrl(coverUrl)) {
    return { error: "请输入有效的 http(s) 或站内封面 URL" };
  }
  if (!rawTags.every((tag) => typeof tag === "string")) return { error: "标签格式不正确" };

  const tags = [...new Set(rawTags.map((tag) => (tag as string).trim()).filter(Boolean))];
  if (tags.length > 20) return { error: "标签不能超过 20 个" };
  if (tags.some((tag) => tag.length > 50)) return { error: "每个标签不能超过 50 个字符" };

  return { data: { bookId, title, wordCount, coverUrl, tags } };
}
