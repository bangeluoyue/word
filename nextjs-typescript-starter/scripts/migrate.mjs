import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import postgres from 'postgres';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const migrationsDirectory = join(projectRoot, 'lib', 'db', 'migrations');
const statusOnly = process.argv.includes('--status');
const lockName = 'word-learning-schema-migrations';

loadLocalEnvironment(join(projectRoot, '.env'));

const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
  console.error('POSTGRES_URL is not configured.');
  process.exit(1);
}

const migrationFiles = readdirSync(migrationsDirectory)
  .filter((name) => /^\d+[_-].+\.sql$/.test(name))
  .sort((left, right) => left.localeCompare(right));

if (migrationFiles.length === 0) {
  console.log('No migration files found.');
  process.exit(0);
}

const sql = postgres(connectionString, {
  connect_timeout: 20,
  idle_timeout: 5,
  max: 1,
  onnotice: () => {},
  prepare: false,
});

let connection;

try {
  connection = await sql.reserve();
  await connection`select pg_advisory_lock(hashtext(${lockName}))`;

  await connection.unsafe(`
    create table if not exists public.schema_migrations (
      name text primary key,
      checksum varchar(64) not null,
      applied_at timestamp with time zone not null default now()
    )
  `);

  const appliedRows = await connection`
    select name, checksum, applied_at
    from public.schema_migrations
    order by name
  `;
  const appliedByName = new Map(appliedRows.map((row) => [row.name, row]));
  const pendingMigrations = [];

  for (const fileName of migrationFiles) {
    const source = readFileSync(join(migrationsDirectory, fileName), 'utf8');
    const checksum = createHash('sha256').update(source).digest('hex');
    const applied = appliedByName.get(fileName);

    if (applied && applied.checksum !== checksum) {
      throw new Error(
        `Migration ${fileName} changed after it was applied. ` +
          'Create a new migration instead of editing migration history.',
      );
    }

    if (!applied) {
      pendingMigrations.push({ checksum, fileName, source });
    }
  }

  if (statusOnly) {
    for (const fileName of migrationFiles) {
      const applied = appliedByName.get(fileName);
      console.log(`${applied ? 'applied' : 'pending'}  ${fileName}`);
    }
  } else if (pendingMigrations.length === 0) {
    console.log('Database schema is up to date.');
  } else {
    for (const migration of pendingMigrations) {
      console.log(`Applying ${migration.fileName}...`);

      await connection.unsafe('begin');

      try {
        await connection.unsafe(migration.source);
        await connection`
          insert into public.schema_migrations (name, checksum)
          values (${migration.fileName}, ${migration.checksum})
        `;
        await connection.unsafe('commit');
      } catch (error) {
        await connection.unsafe('rollback');
        throw error;
      }

      console.log(`Applied ${migration.fileName}.`);
    }
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Migration failed: ${message}`);
  process.exitCode = 1;
} finally {
  if (connection) {
    try {
      await connection`select pg_advisory_unlock(hashtext(${lockName}))`;
    } finally {
      connection.release();
    }
  }

  await sql.end({ timeout: 5 });
}

function loadLocalEnvironment(filePath) {
  if (!existsSync(filePath)) return;

  for (const line of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]] !== undefined) continue;

    let value = match[2];
    const quote = value[0];

    if ((quote === '"' || quote === "'") && value.at(-1) === quote) {
      value = value.slice(1, -1);
    } else {
      value = value.replace(/\s+#.*$/, '');
    }

    process.env[match[1]] = value;
  }
}
