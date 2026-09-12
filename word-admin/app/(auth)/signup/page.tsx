import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";
import { getAdminCount } from "@/lib/auth/admins";
import { getCurrentAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "注册系统管理员" };
export const dynamic = "force-dynamic";

export default async function SignupPage() {
  if (await getCurrentAdmin()) redirect("/books");
  if ((await getAdminCount()) > 0) redirect("/signin");
  return <AuthShell><SignupForm /></AuthShell>;
}
