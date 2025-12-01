# Database Migrations

Apply these scripts to your Neon database **after** the initial schema is loaded
(via `ProjectResources/Database_Components_Seperated/NexHire_Tables.sql`,
`NexHire_Views.sql`, `NexHire_StoredProcedures/`, and `NexHire_Triggers.sql`).

These scripts fix runtime bugs found during the SSMS → Neon migration audit.
They are idempotent (safe to run multiple times).

## Order

1. `001_sp_generatemarketalerts.sql` — ports the missing `sp_GenerateMarketAlerts`
   stored procedure from T-SQL to plpgsql.
2. `002_fix_sp_predictcareerpath_and_check_constraints.sql` — fixes a GROUP BY
   bug in `sp_predictcareerpath` and relaxes the `pushnotifications.notificationtype`
   CHECK constraint to allow `'DeviceRegistration'`.
3. `003_relax_check_constraints.sql` — relaxes `pushnotifications.platform`
   CHECK to be case-insensitive, and adds `'Test'` to `emailqueue.emailtype`
   allowed values.

## How to apply

### Via Neon Console (web UI)
1. Open your Neon project dashboard.
2. Click "SQL Editor" in the left sidebar.
3. Copy-paste each migration script in order, click "Run".

### Via psql
```bash
# Get your connection string from Neon dashboard → Connection Details
psql "postgresql://USER:PASSWORD@ep-HOST-pooler.REGION.aws.neon.tech/DBNAME?sslmode=require" \
    -f 001_sp_generatemarketalerts.sql
psql "postgresql://USER:PASSWORD@ep-HOST-pooler.REGION.aws.neon.tech/DBNAME?sslmode=require" \
    -f 002_fix_sp_predictcareerpath_and_check_constraints.sql
psql "postgresql://USER:PASSWORD@ep-HOST-pooler.REGION.aws.neon.tech/DBNAME?sslmode=require" \
    -f 003_relax_check_constraints.sql
```
