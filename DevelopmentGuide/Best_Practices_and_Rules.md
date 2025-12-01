# Best Practices, Rules & Checklists

## 1. mandatory Checklist for New Features

> **CRITICAL:** Do not write code against assumed column names.

### Step 0 — Verify Schema
Run these queries in SSMS or via a Node script before coding:
```sql
SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'YourTable';
SELECT TOP 5 * FROM YourTable;
```

### Step 1 — Backend
1. **Verified Columns:** Use exact names from Step 0.
2. **Parameterized Queries:** Use `?` placeholders.
3. **RBAC:** Add `protect` and `authorize(RoleID)`.
4. **Document Schema:** Add a comment block describing columns at the top of the route file.

### Step 2 — Frontend
1. **API_BASE:** Use it for all calls.
2. **Context:** Use `useAuth` for user state.
3. **Theming:** Use CSS variables (`var(--text-primary)`).

---

## 2. Critical Rules & Gotchas

### ⚠️ Security
- **NEVER** use string interpolation for SQL queries.
- **SQL Driver:** `msnodesqlv8` uses `?` positional params, NOT `@params`.

### ⚠️ Naming
- Use `FullName` (not `Name`) when joining `Candidates`.
- `JobPostings` uses `IsDeleted` and `IsActive` — always filter for `IsDeleted = 0 AND IsActive = 1`.

### ⚠️ IDs & Roles
- **RoleIDs:** 1=Admin, 2=Recruiter, 3=Candidate.
- **Applications:** Stores `CandidateID`, not `UserID`. Must join to get `UserID`.

### ⚠️ Modals
- All modals must have `z-index` > 100 to clear the sidebar/header.
- Use `animate-in zoom-in` for consistency.

### ⚠️ SQL Synthesis
- `INSERT ... OUTPUT inserted.ID VALUES (?)` — `OUTPUT` must come **before** `VALUES`.
- **SQL Server Trigger Limitation:** Tables with enabled triggers cannot use `OUTPUT` clause directly. Use `SCOPE_IDENTITY()` instead:
  ```js
  // ❌ Won't work if table has triggers
  INSERT INTO Table (...) OUTPUT inserted.ID VALUES (?);
  
  // ✅ Works with triggers
  INSERT INTO Table (...) VALUES (?);
  SELECT SCOPE_IDENTITY() AS ID;
  ```

### ⚠️ Foreign Key Mismatches
- **InterviewFeedback.InterviewerID** — References `Users(UserID)`, NOT `Recruiters(RecruiterID)`. Always use `UserID` for this column.
- **PushNotifications.UserID** — Uses `UserID` directly, not `CandidateID`.

### ⚠️ Virtual Columns & Computed Values
- **Applications.MatchScore** — Does NOT exist as a column. Match scores are calculated in `vw_CandidateMatchScore` view. To get match score for an application:
  ```sql
  -- ❌ Wrong - column doesn't exist
  SELECT a.MatchScore FROM Applications a
  
  -- ✅ Correct - join to the view
  SELECT ISNULL(m.TotalMatchScore, 0) AS MatchScore
  FROM Applications a
  LEFT JOIN vw_CandidateMatchScore m 
      ON a.CandidateID = m.CandidateID AND a.JobID = m.JobID
  ```

### ⚠️ Referral Tables Constraints
- `ReferralNetwork.ReferralStrength` — INT CHECK (1-10), NOT percentage.
- `ReferralNetwork.QualityScore` — INT CHECK (1-10), NOT percentage.
- `NetworkStrength.ConnectionStrength` — INT CHECK (1-10).
- `NetworkStrength.TrustLevel` — INT CHECK (1-5).
- `ReferralPerformance.AvgQualityScore` — DECIMAL(3,2), max value 9.99.
- `ReferralPerformance.ConversionRate` — DECIMAL(5,2), max value 999.99.
