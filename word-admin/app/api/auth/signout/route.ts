import { NextResponse } from "next/server";
import { deleteCurrentAdminSession } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST() {
  await deleteCurrentAdminSession();
  return NextResponse.json({ ok: true });
}
