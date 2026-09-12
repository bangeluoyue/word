import type { AdminRole } from "@/db/schema";

export type { AdminRole };

export type CurrentAdmin = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
};

export type AdminListItem = CurrentAdmin & {
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};

