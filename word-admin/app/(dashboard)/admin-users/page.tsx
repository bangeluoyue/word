import type { Metadata } from "next";
import { AdminUsersPage } from "@/components/dashboard/admin-users-page";

export const metadata: Metadata = { title: "管理员管理" };

export default function Page() {
  return <AdminUsersPage />;
}

