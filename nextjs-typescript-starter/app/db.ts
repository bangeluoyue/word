import { sql } from 'drizzle-orm';
import { genSaltSync, hashSync } from 'bcrypt-ts';

import { db } from 'lib/db/client';
import { appUsers } from 'lib/db/schema';

export async function getUser(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  return db
    .select()
    .from(appUsers)
    .where(sql`lower(${appUsers.email}) = ${normalizedEmail}`)
    .limit(1);
}

export async function createUser(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const salt = genSaltSync(10);
  const passwordHash = hashSync(password, salt);

  return db
    .insert(appUsers)
    .values({ email: normalizedEmail, password: passwordHash })
    .returning({ id: appUsers.id, email: appUsers.email });
}
