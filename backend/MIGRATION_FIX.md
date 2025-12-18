# Fix Migration Error

If you're getting an error about missing migration files, it means Knex has recorded migrations in the database that no longer exist.

## Solution Steps

### Step 1: Reset Migrations Table

Run this command to clear all migration records:

```bash
npm run migrate:reset
```

### Step 2: Mark Existing Migration as Complete (if users table already exists)

If your `users` table already exists, mark the migration as complete:

```bash
npm run migrate:mark-complete
```

### Step 3: Run Migrations (if table doesn't exist)

If the users table doesn't exist yet, run:

```bash
npm run migrate
```

## Available Commands

- `npm run migrate` - Run all pending migrations
- `npm run migrate:status` - Check migration status
- `npm run migrate:reset` - Reset migrations table (clears all records)
- `npm run migrate:mark-complete` - Mark migration 001 as complete if users table exists
- `npm run migrate:rollback` - Rollback last migration

## Manual Fix (Alternative)

If the script doesn't work, you can manually reset the migrations table:

1. Open phpMyAdmin: http://localhost/phpmyadmin
2. Select the `voluntree` database
3. Go to the `knex_migrations` table
4. Delete all rows (or truncate the table)
5. Also truncate `knex_migrations_lock` table if it exists
6. Run `npm run migrate` again

Or via SQL:
```sql
USE voluntree;
DELETE FROM knex_migrations;
DELETE FROM knex_migrations_lock;
```

## Why This Happened

Knex tracks which migrations have been run in the `knex_migrations` table. When you deleted migration files 002-007, Knex still had records of them in the database, causing a mismatch.

After resetting, only migration 001 (users table) will be recorded and run.

