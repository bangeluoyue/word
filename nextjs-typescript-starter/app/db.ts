import { sql } from 'drizzle-orm';
import { genSaltSync, hashSync } from 'bcrypt-ts';

import { db } from 'lib/db/client';
import { users } from 'lib/db/schema';

export async function getUser(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  return db
    .select()
    .from(users)
    .where(sql`lower(${users.email}) = ${normalizedEmail}`)
    .limit(1);
}

export async function createUser(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const salt = genSaltSync(10);
  const passwordHash = hashSync(password, salt);

  return db
    .insert(users)
    .values({ email: normalizedEmail, password: passwordHash })
    .returning({ id: users.id, email: users.email });
}
