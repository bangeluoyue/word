import { redirect } from "next/navigation";
import { getAdminCount } from "@/lib/auth/admins";
import { getCurrentAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const admin = await getCurrentAdmin();
  if (admin) redirect("/books");
  redirect((await getAdminCount()) === 0 ? "/signup" : "/signin");
}
