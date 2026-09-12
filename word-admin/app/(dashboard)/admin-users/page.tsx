import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminUsersPage } from "@/components/dashboard/admin-users-page";
import { listAdmins } from "@/lib/auth/admins";
import { getCurrentAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "管理员管理" };

export default async function Page() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/signin");
  if (admin.role !== "system") redirect("/books");
  return <AdminUsersPage initialUsers={await listAdmins()} currentAdminId={admin.id} />;
}
