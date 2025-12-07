# PostgreSQL Migration Notes

## Overview

The NexHire application has been migrated from SQL Server to **Neon PostgreSQL**. This document tracks the changes and important differences developers need to know.

---

## 1. Database Connection

### SQL Server (Old)
```
DB_CONNECTION_STRING=Driver={SQL Server Native Client 11.0};Server=LAPTOP-XXXX\SQLEXPRESS;Database=RecruitmentDB;Trusted_Connection=Yes;
```

### PostgreSQL (New - Neon)
```
DB_CONNECTION_STRING=postgresql://neondb_owner:password@ep-xxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

---

## 2. Parameter Placeholders

### SQL Server (Old)
```js
await query(`INSERT INTO Table (Col1, Col2) VALUES (?, ?)`, [val1, val2]);
```

### PostgreSQL (New)
```js
await query(`INSERT INTO table (col1, col2) VALUES ($1, $2)`, [val1, val2]);
```

> **Note:** The `db.js` query function automatically converts `?` to `$1, $2, ...` for backward compatibility.

---

## 3. Stored Procedures → Functions

### SQL Server (Old)
```js
await query(`EXEC sp_MyProcedure @param1 = ?, @param2 = ?`, [val1, val2]);
```

### PostgreSQL (New)
```js
await query(`SELECT * FROM my_procedure($1, $2)`, [val1, val2]);
```

---

## 4. Trigger Syntax

### SQL Server (Old)
```sql
CREATE TRIGGER trg_Example ON Table AFTER INSERT AS
BEGIN
    INSERT INTO OtherTable (...) SELECT * FROM inserted
END
```

### PostgreSQL (New)
```sql
CREATE OR REPLACE FUNCTION trg_example()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    INSERT INTO othertable (...) VALUES (NEW.column1);
    RETURN NEW;
END;
$function$

CREATE TRIGGER trg_example
AFTER INSERT ON table
FOR EACH ROW EXECUTE FUNCTION trg_example();
```

---

## 5. Column Name Case Sensitivity

### SQL Server
- Case insensitive
- Returns: `UserID`, `FullName`, `RoleID`

### PostgreSQL
- Returns lowercase: `userid`, `fullname`, `roleid`

**Solution:** The `db.js` includes alias mappings to convert lowercase to uppercase.

---

## 6. Fixed Triggers

The following triggers were fixed during migration:

| Trigger | Issue | Fix |
|---------|-------|-----|
| `trg_sendinterviewemail` | Used `inserted` | Changed to `NEW` |
| `trg_applicationstatuschanged_notification` | Used `inserted` | Changed to `NEW` |

---

## 7. Database Project

- **Project ID:** `long-resonance-68796325` (NexHire2)
- **Database:** `neondb`
- **Region:** ap-southeast-1

---

## 8. Driver Changes

| Aspect | SQL Server | PostgreSQL |
|--------|------------|------------|
| Driver | `msnodesqlv8` | `pg` |
| Auth | Windows Auth | Password-based |
| SSL | No | Required |

---

## 9. Missing Functions

The following stored procedures from the routes DO NOT exist in the Neon database and need to be created:

### Missing Functions List

| Function Name | Called In | Status |
|--------------|-----------|--------|
| `sp_generatemarketalerts` | recruiters.js | ❌ MISSING |
| `sp_suggestreferrals` | recruiters.js | ❌ MISSING |
| `sp_savecandidateranking` | recruiters.js | ❌ MISSING |
| `sp_archiveolddata` | maintenance.js | ❌ MISSING |
| `sp_anonymizearchivedcandidates` | maintenance.js | ❌ MISSING |
| `sp_checkconsentexpiry` | maintenance.js | ❌ MISSING |
| `sp_scheduleinterviewwithtimezone` | interviews.js | ❌ MISSING |
| `sp_generateinterviewquestions` | interviews.js | ❌ MISSING |
| `sp_confirminterview` | candidates.js | ❌ MISSING |
| `sp_awardgamificationpoints` | candidates.js | ❌ MISSING |
| `sp_withdrawapplication` | candidates.js | ❌ MISSING |
| `sp_generatelearningpath` | candidates.js | ❌ MISSING |
| `sp_generatenegotiationstrategy` | candidates.js | ❌ MISSING |
| `sp_analyzecandidatesentiment` | candidates.js | ❌ MISSING |
| `sp_updateapplicationstatus` | applications.js | ❌ MISSING |
| `sp_hirecandidate` | applications.js | ❌ MISSING |
| `sp_autorejectunqualified` | applications.js | ❌ MISSING |

### Existing Functions (Working)

These functions exist in the database and should work:

| Function Name | Called In | Status |
|--------------|-----------|--------|
| `sp_advancedcandidatematchingenhanced` | jobs.js | ✅ EXISTS |
| `sp_autoscreenapplicationenhanced` | recruiters.js | ✅ EXISTS |
| `sp_fuzzysearchcandidates` | recruiters.js | ✅ EXISTS |
| `sp_generateinterviewprep` | candidates.js | ✅ EXISTS |
| `sp_optimizeinterviewrounds` | interviews.js | ✅ EXISTS |
| `sp_predictcareerpath` | candidates.js | ✅ EXISTS |
| `sp_predictghostingrisk` | - | ✅ EXISTS |
| `sp_predicthiresuccess` | analytics.js | ✅ EXISTS |
| `sp_predictonboardingsuccess` | analytics.js | ✅ EXISTS |
