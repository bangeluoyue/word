import type { Session } from 'next-auth';

/** Session 中的用户 ID 必须是 PostgreSQL int4 可接受的正整数。 */
export function getSessionUserId(session: Session | null): number | null {
  const value = session?.user?.id;
  if (!value || !/^\d+$/.test(value)) return null;

  const userId = Number(value);
  return Number.isSafeInteger(userId) && userId > 0 && userId <= 2_147_483_647
    ? userId
    : null;
}
