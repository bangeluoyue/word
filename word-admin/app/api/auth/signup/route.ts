import { NextResponse } from "next/server";
import {
  BootstrapRegistrationClosedError,
  createInitialSystemAdmin,
} from "@/lib/auth/admins";
import { isUniqueViolation, jsonError } from "@/lib/auth/http";
import { hashPassword } from "@/lib/auth/password";
import { createAdminSession } from "@/lib/auth/session";
import { normalizeEmail, validateAdminInput } from "@/lib/auth/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return jsonError("请求内容格式不正确", 400);
  }

  const validationError = validateAdminInput({
    name: body.name,
    email: body.email,
    password: body.password,
    passwordRequired: true,
  });
  if (validationError) return jsonError(validationError, 400);
  if (body.password !== body.confirmPassword) return jsonError("两次输入的密码不一致", 400);

  const name = (body.name as string).trim();
  const email = normalizeEmail(body.email as string);
  const passwordHash = await hashPassword(body.password as string);

  try {
    const admin = await createInitialSystemAdmin({ name, email, passwordHash });
    if (!admin) return jsonError("系统管理员创建失败，请稍后重试", 500);
    await createAdminSession(admin.id);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (error instanceof BootstrapRegistrationClosedError) {
      return jsonError("系统已经完成初始化，请直接登录", 409, "registration_closed");
    }
    if (isUniqueViolation(error)) return jsonError("该邮箱已被使用", 409);
    console.error("Failed to create initial system admin", error);
    return jsonError("系统管理员创建失败，请稍后重试", 500);
  }
}
