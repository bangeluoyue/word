import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { ADMIN_ROLES, adminSessions, adminUsers, type AdminRole } from "@/db/schema";
import { isUniqueViolation, jsonError, requireSystemAdmin } from "@/lib/auth/http";
import { hashPassword } from "@/lib/auth/password";
import { normalizeEmail, validateAdminInput } from "@/lib/auth/validation";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

const selection = {
  id: adminUsers.id,
  name: adminUsers.name,
  email: adminUsers.email,
  role: adminUsers.role,
  isActive: adminUsers.isActive,
  lastLoginAt: adminUsers.lastLoginAt,
  createdAt: adminUsers.createdAt,
};

function serializeAdmin(admin: {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
}) {
  return {
    ...admin,
    lastLoginAt: admin.lastLoginAt?.toISOString() ?? null,
    createdAt: admin.createdAt.toISOString(),
  };
}

export async function PATCH(request: Request, context: RouteContext) {
  const authorization = await requireSystemAdmin();
  if ("response" in authorization) return authorization.response;

  const { id } = await context.params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return jsonError("请求内容格式不正确", 400);
  }

  const validationError = validateAdminInput({ name: body.name, email: body.email, password: body.password });
  if (validationError) return jsonError(validationError, 400);
  if (typeof body.role !== "string" || !ADMIN_ROLES.includes(body.role as AdminRole)) {
    return jsonError("管理员角色不正确", 400);
  }
  if (typeof body.isActive !== "boolean") return jsonError("管理员状态不正确", 400);

  if (id === authorization.admin.id
    && (body.role !== authorization.admin.role || body.isActive === false)) {
    return jsonError("不能修改当前登录账号的角色或停用当前账号", 400);
  }

  const password = typeof body.password === "string" ? body.password : "";
  const now = new Date();

  try {
    const [admin] = await db
      .update(adminUsers)
      .set({
        name: (body.name as string).trim(),
        email: normalizeEmail(body.email as string),
        role: body.role as AdminRole,
        isActive: body.isActive,
        ...(password ? { passwordHash: await hashPassword(password) } : {}),
        updatedAt: now,
      })
      .where(eq(adminUsers.id, id))
      .returning(selection);

    if (!admin) return jsonError("管理员不存在", 404);
    if (!admin.isActive) await db.delete(adminSessions).where(eq(adminSessions.userId, admin.id));
    return NextResponse.json({ admin: serializeAdmin(admin) });
  } catch (error) {
    if (isUniqueViolation(error)) return jsonError("该邮箱已被其他管理员使用", 409);
    console.error("Failed to update admin", error);
    return jsonError("管理员更新失败，请稍后重试", 500);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const authorization = await requireSystemAdmin();
  if ("response" in authorization) return authorization.response;

  const { id } = await context.params;
  if (id === authorization.admin.id) return jsonError("不能删除当前登录账号", 400);

  const [deleted] = await db.delete(adminUsers).where(eq(adminUsers.id, id)).returning({ id: adminUsers.id });
  if (!deleted) return jsonError("管理员不存在", 404);
  return NextResponse.json({ ok: true });
}
