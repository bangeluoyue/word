import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { findAdminForSignin, getAdminCount } from "@/lib/auth/admins";
import { jsonError } from "@/lib/auth/http";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createAdminSession } from "@/lib/auth/session";
import { EMAIL_PATTERN, normalizeEmail } from "@/lib/auth/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if ((await getAdminCount()) === 0) {
    return jsonError("请先注册首个系统管理员", 409, "bootstrap_required");
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return jsonError("请求内容格式不正确", 400);
  }

  const email = typeof body.email === "string" ? normalizeEmail(body.email) : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!EMAIL_PATTERN.test(email) || !password) return jsonError("请输入有效的邮箱和密码", 400);

  const admin = await findAdminForSignin(email);
  let passwordMatches = false;
  if (admin) passwordMatches = await verifyPassword(password, admin.passwordHash);
  else await hashPassword(password);

  if (!admin || !passwordMatches) return jsonError("邮箱或密码不正确", 401);
  if (!admin.isActive) return jsonError("该账号已停用，请联系系统管理员", 403);

  const now = new Date();
  await db.update(adminUsers).set({ lastLoginAt: now, updatedAt: now }).where(eq(adminUsers.id, admin.id));
  await createAdminSession(admin.id);

  return NextResponse.json({
    admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
  });
}
