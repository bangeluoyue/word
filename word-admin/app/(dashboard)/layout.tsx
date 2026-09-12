import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getAdminCount } from "@/lib/auth/admins";
import { getCurrentAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect((await getAdminCount()) === 0 ? "/signup" : "/signin");
  return <DashboardShell session={admin}>{children}</DashboardShell>;
}
