import "server-only";

import { count, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import type { AdminListItem } from "./types";

export class BootstrapRegistrationClosedError extends Error {}

export async function getAdminCount() {
  const [result] = await db.select({ value: count() }).from(adminUsers);
  return result?.value ?? 0;
}

export async function createInitialSystemAdmin(values: {
  name: string;
  email: string;
  passwordHash: string;
}) {
  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(2026091101)`);
    const [result] = await tx.select({ value: count() }).from(adminUsers);
    if ((result?.value ?? 0) > 0) throw new BootstrapRegistrationClosedError();

    const [admin] = await tx
      .insert(adminUsers)
      .values({ ...values, role: "system" })
      .returning({ id: adminUsers.id });
    return admin;
  });
}

export async function listAdmins(): Promise<AdminListItem[]> {
  const rows = await db
    .select({
      id: adminUsers.id,
      name: adminUsers.name,
      email: adminUsers.email,
      role: adminUsers.role,
      isActive: adminUsers.isActive,
      lastLoginAt: adminUsers.lastLoginAt,
      createdAt: adminUsers.createdAt,
    })
    .from(adminUsers)
    .orderBy(desc(adminUsers.createdAt));

  return rows.map((row) => ({
    ...row,
    lastLoginAt: row.lastLoginAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function findAdminForSignin(email: string) {
  const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
  return admin ?? null;
}

