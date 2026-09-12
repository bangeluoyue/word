import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { ADMIN_ROLES, adminUsers, type AdminRole } from "@/db/schema";
import { isUniqueViolation, jsonError, requireSystemAdmin } from "@/lib/auth/http";
import { hashPassword } from "@/lib/auth/password";
import { normalizeEmail, validateAdminInput } from "@/lib/auth/validation";

export const runtime = "nodejs";

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

const selection = {
  id: adminUsers.id,
  name: adminUsers.name,
  email: adminUsers.email,
  role: adminUsers.role,
  isActive: adminUsers.isActive,
  lastLoginAt: adminUsers.lastLoginAt,
  createdAt: adminUsers.createdAt,
};

export async function GET() {
  const authorization = await requireSystemAdmin();
  if ("response" in authorization) return authorization.response;

  const admins = await db.select(selection).from(adminUsers).orderBy(desc(adminUsers.createdAt));
  return NextResponse.json({ admins: admins.map(serializeAdmin) });
}

export async function POST(request: Request) {
  const authorization = await requireSystemAdmin();
  if ("response" in authorization) return authorization.response;

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
  if (typeof body.role !== "string" || !ADMIN_ROLES.includes(body.role as AdminRole)) {
    return jsonError("管理员角色不正确", 400);
  }

  try {
    const [admin] = await db
      .insert(adminUsers)
      .values({
        name: (body.name as string).trim(),
        email: normalizeEmail(body.email as string),
        passwordHash: await hashPassword(body.password as string),
        role: body.role as AdminRole,
        isActive: body.isActive !== false,
      })
      .returning(selection);

    if (!admin) return jsonError("管理员创建失败，请稍后重试", 500);
    return NextResponse.json({ admin: serializeAdmin(admin) }, { status: 201 });
  } catch (error) {
    if (isUniqueViolation(error)) return jsonError("该邮箱已被其他管理员使用", 409);
    console.error("Failed to create admin", error);
    return jsonError("管理员创建失败，请稍后重试", 500);
  }
}
