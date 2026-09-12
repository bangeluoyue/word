import { NextResponse } from "next/server";
import { getCurrentAdmin } from "./session";

export function jsonError(message: string, status: number, code?: string) {
  return NextResponse.json({ error: message, ...(code ? { code } : {}) }, { status });
}

export function isUniqueViolation(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error
    && (error as { code?: string }).code === "23505";
}

export async function requireSystemAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) return { response: jsonError("请先登录", 401) } as const;
  if (admin.role !== "system") {
    return { response: jsonError("当前账号没有管理员管理权限", 403) } as const;
  }
  return { admin } as const;
}
