# RecruitmentDB + CLR Functions — Complete Project Context

> **Read this first.** This document gives any AI assistant everything needed to understand, extend, debug, or work with this project without needing prior conversation history.

---

## 1. What This Project Is

A **SQL Server 2022 recruitment management database** called `RecruitmentDB`, extended with a **C# CLR (Common Language Runtime) assembly** called `RecruitmentCLR`. The assembly compiles to a `.dll` file that SQL Server loads, making **29 advanced scalar functions** available in T-SQL that would be impossible or impractical in pure SQL — things like PBKDF2 password hashing, fuzzy name matching, resume parsing, timezone conversion, and live HTTP calls.

Every function is called like a normal built-in SQL function:
```sql
SELECT dbo.ValidateEmail('user@example.com')            -- returns 1 (valid)
SELECT dbo.HashPassword('SecurePass123!')                -- returns PBKDF2 hash string
SELECT dbo.JaroWinklerSimilarity('Jon', 'John')          -- returns 0.975
SELECT dbo.ExtractSkills('Java Spring Docker developer') -- returns 'java:30,spring:20,docker:10'
SELECT dbo.ConvertTimezone(GETDATE(), 'Bangladesh Standard Time', 'Eastern Standard Time')
```

---

## 2. Technology Stack

| Item | Value |
|------|-------|
| **Database server** | SQL Server 2022 |
| **Client / IDE** | SSMS 22 (SQL Server Management Studio) |
| **Database name** | `RecruitmentDB` |
| **CLR language** | C# targeting .NET Framework 4.8 |
| **Build tool** | `dotnet build` via VS Code terminal |
| **Assembly name** | `RecruitmentCLR` |
| **DLL path on server** | `C:\CLR\RecruitmentCLR.dll` |
| **Assembly permission** | `EXTERNAL_ACCESS` |
| **Total CLR functions** | 29 scalar functions across 9 C# classes |

---

## 3. File Structure

```
C:\RecruitmentCLR\                     ← VS Code project root (build here)
├── RecruitmentCLR.cs                  ← C# source: Email, Security, Similarity, DateTime, Statistics
├── DocumentParser.cs                  ← C# source: PDF/DOCX parsing, Years of Experience, NLP
├── ApiIntegration.cs                  ← C# source: REST API calls, LinkedIn, Geocoding, Timezone
├── RecruitmentCLR.csproj              ← .NET project config (net48, x64 platform, SAFE unsafe blocks)
│
├── Deploy_RecruitmentCLR.sql          ← MASTER deployment script — run this in SSMS to deploy all 29 functions
├── TestSuite_Complete.sql             ← Full test suite covering all 29 functions with PASS/FAIL results
└── CLR_Functions_Documentation.docx  ← Complete Word document reference (all algorithms, examples, tables)

C:\CLR\
└── RecruitmentCLR.dll                 ← Compiled output — SQL Server loads this file
```

### Build Commands (run inside VS Code terminal at `C:\RecruitmentCLR\`)
```cmd
dotnet restore
dotnet build --configuration Release
mkdir C:\CLR
copy bin\Release\net48\RecruitmentCLR.dll C:\CLR\
```

---

## 4. Database Schema

The recruitment database has the following core tables. CLR functions are used across all of them.

### Core Tables

| Table | Primary Key | Purpose |
|-------|-------------|---------|
| `Users` | `UserID` | System users (recruiters, admins, hiring managers) |
| `Roles` | `RoleID` | User role definitions |
| `Candidates` | `CandidateID` | Job applicant profiles |
| `Jobs` | `JobID` | Open job postings |
| `Applications` | `ApplicationID` | Links candidates to jobs |
| `InterviewFeedback` | `FeedbackID` | Interview scores and comments |
| `ApplicationStatuses` | `StatusID` | Status lookup (Applied, Screening, Interview, Hired, Rejected) |

### Key Columns Relevant to CLR Functions

**`Users` table:**
- `Email NVARCHAR(255)` — validated by `dbo.ValidateEmail()` and `dbo.IsDisposableEmail()`
- `PasswordHash NVARCHAR(500)` — populated by `dbo.HashPassword()`, verified by `dbo.VerifyPassword()`
- `SessionToken NVARCHAR(300)` — populated by `dbo.GenerateSecureToken(64)`

**`Candidates` table:**
- `Email NVARCHAR(255)` — validated on insert
- `FullName NVARCHAR(200)` — fuzzy-matched with `dbo.JaroWinklerSimilarity()`
- `ResumeFile VARBINARY(MAX)` — raw PDF/DOCX bytes
- `ResumeFileName NVARCHAR(255)` — e.g. `'resume.pdf'` or `'cv.docx'`
- `ResumeText NVARCHAR(MAX)` — extracted by `dbo.ExtractTextFromPDF()` / `dbo.ExtractTextFromDocx()`
- `ExtractedSkills NVARCHAR(MAX)` — populated by `dbo.ExtractSkills()`, stored as `'java:30,python:20'`
- `YearsExperience INT` — populated by `dbo.ExtractYearsOfExperience()`
- `LinkedInURL NVARCHAR(500)` — verified by `dbo.VerifyLinkedInProfile()`
- `Timezone NVARCHAR(100)` — Windows timezone ID string (e.g. `'Bangladesh Standard Time'`)

**`Applications` table:**
- `AppliedDate DATETIME` — used with `dbo.CalculateBusinessDays()` and `dbo.GetRelativeTime()`
- `StatusChangedAt DATETIME` — end date for time-to-hire calculations
- `StatusID INT` — FK to `ApplicationStatuses`
- `IsDeleted BIT` — soft delete flag

**`InterviewFeedback` table:**
- `TechnicalScore INT` — used with `dbo.StandardDeviation()`, `dbo.Percentile()`, `dbo.ZScore()`
- `Comments NVARCHAR(MAX)` — analysed with `dbo.CalculateSentiment()`
- `InterviewerID INT` — FK to `Users`

---

## 5. SQL Server Setup (One-Time)

These commands must be run once per SQL Server installation by a `sysadmin`:

```sql
-- Enable CLR
EXEC sp_configure 'show advanced options', 1; RECONFIGURE;
EXEC sp_configure 'clr enabled', 1;           RECONFIGURE;
EXEC sp_configure 'clr strict security', 0;   RECONFIGURE;

-- Allow EXTERNAL_ACCESS permission
ALTER DATABASE RecruitmentDB SET TRUSTWORTHY ON;
```

Then load the compiled DLL as an assembly:
```sql
USE RecruitmentDB;
GO
CREATE ASSEMBLY RecruitmentCLR
FROM 'C:\CLR\RecruitmentCLR.dll'
WITH PERMISSION_SET = EXTERNAL_ACCESS;
GO
```

To redeploy after code changes, run `Deploy_RecruitmentCLR.sql` — it safely drops and recreates everything.

---

## 6. C# Class → SQL Function Mapping

This is critical for writing `EXTERNAL NAME` clauses in deployment scripts.

**Syntax:** `EXTERNAL NAME [AssemblyName].[ClassName].MethodName`

| C# Class | SQL Functions It Contains |
|----------|--------------------------|
| `EmailValidator` | `ValidateEmail`, `IsDisposableEmail`, `ExtractEmailDomain` |
| `SecurityFunctions` | `HashPassword`, `VerifyPassword`, `GenerateSecureToken`, `EncryptSensitiveData` |
| `StringSimilarity` | `LevenshteinDistance`, `JaroWinklerSimilarity`, `CosineSimilarity` |
| `DateTimeFunctions` | `CalculateBusinessDays`, `AddBusinessDays`, `IsWithinWorkingHours`, `GetRelativeTime` |
| `TimezoneFunctions` | `ConvertTimezone`, `GetTimezoneOffset`, `CalculateTimezoneOverlap` |
| `StatisticalFunctions` | `StandardDeviation`, `Percentile`, `ZScore`, `CorrelationCoefficient` |
| `DocumentParser` | `ExtractTextFromPDF`, `ExtractTextFromDocx`, `ExtractYearsOfExperience` |
| `NLPProcessor` | `ExtractSkills`, `CalculateSentiment` |
| `ApiIntegration` | `CallRESTApi`, `VerifyLinkedInProfile`, `GeocodeAddress` |

**Example deployment clause:**
```sql
CREATE FUNCTION dbo.HashPassword(@password NVARCHAR(500))
RETURNS NVARCHAR(500)
AS EXTERNAL NAME RecruitmentCLR.[SecurityFunctions].HashPassword;
```

---

## 7. All 29 Functions — Complete Reference

### 7.1 Email Validation (`EmailValidator` class)

---

#### `dbo.ValidateEmail(@email NVARCHAR(200)) → BIT`

Validates email format using RFC-5322-style regex.

| | |
|--|--|
| **Returns** | `1` = valid format, `0` = invalid or NULL |
| **Algorithm** | Regex: `^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$` |
| **Important** | Validates **format only** — does not check if mailbox exists |

```sql
SELECT dbo.ValidateEmail('john@example.com') -- 1
SELECT dbo.ValidateEmail('bad-email')        -- 0
SELECT dbo.ValidateEmail(NULL)               -- 0
```

---

#### `dbo.IsDisposableEmail(@email NVARCHAR(200)) → BIT`

Detects throwaway/temporary email addresses by checking the domain against a hardcoded list.

| | |
|--|--|
| **Returns** | `1` = disposable provider, `0` = not disposable |
| **Checked domains** | `tempmail.com`, `mailinator.com`, `guerrillamail.com`, `10minutemail.com`, `throwaway.email`, `trashmail.com`, `fakeinbox.com`, `yopmail.com`, `temp-mail.org`, `sharklasers.com`, `spam4.me`, `maildrop.cc`, and others |
| **Limitation** | Static list — new disposable services not in the list will pass |

```sql
SELECT dbo.IsDisposableEmail('user@tempmail.com') -- 1
SELECT dbo.IsDisposableEmail('user@gmail.com')    -- 0
```

---

#### `dbo.ExtractEmailDomain(@email NVARCHAR(200)) → NVARCHAR(200)`

Returns everything after the `@` symbol.

| | |
|--|--|
| **Returns** | Domain string e.g. `'gmail.com'`, or `NULL` if no valid `@` found |

```sql
SELECT dbo.ExtractEmailDomain('admin@company.org') -- 'company.org'
```

---

### 7.2 Security (`SecurityFunctions` class)

---

#### `dbo.HashPassword(@password NVARCHAR(500)) → NVARCHAR(500)`

Industry-standard password hashing using PBKDF2.

| | |
|--|--|
| **Algorithm** | PBKDF2 with HMAC-SHA256, 100,000 iterations, 32-byte random salt |
| **Output** | Base64 string of 88 characters (64 raw bytes: 32 salt + 32 hash) |
| **Salt** | Fresh random salt every call — same password produces **different** hash each time |
| **Speed** | Intentionally slow (~100ms). **Do not call in loops or large batches** |

```sql
DECLARE @h NVARCHAR(500) = dbo.HashPassword('MyPassword!');
-- Store @h in Users.PasswordHash; never compare hashes directly
```

---

#### `dbo.VerifyPassword(@password NVARCHAR(500), @storedHash NVARCHAR(500)) → BIT`

Verifies a plain-text password against a stored PBKDF2 hash.

| | |
|--|--|
| **Returns** | `1` = correct password, `0` = wrong password or error |
| **Algorithm** | Extracts embedded 32-byte salt from stored hash, re-derives, compares in **constant time** (timing-attack resistant) |

```sql
SELECT dbo.VerifyPassword('MyPassword!', @storedHash) -- 1
SELECT dbo.VerifyPassword('WrongPass',   @storedHash) -- 0
```

---

#### `dbo.GenerateSecureToken(@length INT) → NVARCHAR(300)`

Cryptographically random URL-safe token.

| | |
|--|--|
| **Returns** | Alphanumeric token of exactly `@length` characters |
| **Source** | `RandomNumberGenerator` (CSPRNG) — not `System.Random` |
| **URL-safe** | No `+`, `/`, or `=` characters |
| **Minimum** | 8 characters; defaults to 32 if NULL passed |

```sql
SELECT dbo.GenerateSecureToken(64) -- use for password-reset links
SELECT dbo.GenerateSecureToken(32) -- use for session tokens
```

---

#### `dbo.EncryptSensitiveData(@plainText NVARCHAR(MAX), @key NVARCHAR(200)) → NVARCHAR(MAX)`

AES-256 symmetric encryption.

| | |
|--|--|
| **Algorithm** | AES-256 CBC; key derived via SHA-256; fresh random 16-byte IV per call |
| **Output** | Base64 string: IV prepended to ciphertext |
| **Warning** | Key appears in SQL query logs — use SQL Server Always Encrypted or Key Vault in production |

```sql
SELECT dbo.EncryptSensitiveData('SSN: 123-45-6789', 'MyVaultKey')
```

---

### 7.3 String Similarity (`StringSimilarity` class)

---

#### `dbo.LevenshteinDistance(@s1 NVARCHAR(MAX), @s2 NVARCHAR(MAX)) → INT`

Minimum single-character edits (insert, delete, substitute) to transform s1 into s2.

| | |
|--|--|
| **Returns** | `0` = identical; higher = more different |
| **Algorithm** | Wagner-Fischer dynamic programming — O(m×n) time and space |
| **Best for** | Typo detection in short strings |

```sql
SELECT dbo.LevenshteinDistance('kitten', 'sitting') -- 3
SELECT dbo.LevenshteinDistance('hello',  'hello')   -- 0
```

---

#### `dbo.JaroWinklerSimilarity(@s1 NVARCHAR(MAX), @s2 NVARCHAR(MAX)) → FLOAT`

Name-matching similarity score.

| | |
|--|--|
| **Returns** | `0.0` (no match) to `1.0` (identical) |
| **Algorithm** | Jaro score + Winkler prefix bonus (up to 4 chars, scale factor 0.1) |
| **Best for** | **Name matching** — handles transpositions and similar spellings well |
| **Recommended threshold** | `> 0.85` for name matching |

```sql
SELECT dbo.JaroWinklerSimilarity('Martha', 'Marhta')        -- ~0.961
SELECT dbo.JaroWinklerSimilarity('John Smith', 'Jon Smith') -- ~0.970
```

---

#### `dbo.CosineSimilarity(@text1 NVARCHAR(MAX), @text2 NVARCHAR(MAX)) → FLOAT`

Word-frequency document similarity.

| | |
|--|--|
| **Returns** | `0.0` (no shared words) to `1.0` (identical word distribution) |
| **Algorithm** | Tokenizes on whitespace/punctuation, builds TF vectors, computes dot product / (|v1| × |v2|) |
| **Order-independent** | `'apple orange'` vs `'orange apple'` = `1.0` |
| **Best for** | Skill/topic matching between documents |

```sql
SELECT dbo.CosineSimilarity('java developer', 'java engineer')      -- ~0.5
SELECT dbo.CosineSimilarity('apple orange',   'orange apple')       -- 1.0
```

---

### 7.4 Date & Time (`DateTimeFunctions` class)

---

#### `dbo.CalculateBusinessDays(@start DATETIME, @end DATETIME) → INT`

Counts weekdays (Mon–Fri) between two dates, inclusive of both endpoints.

| | |
|--|--|
| **Returns** | Count of business days |
| **Note** | Does NOT exclude public holidays. Swaps dates automatically if start > end |

```sql
SELECT dbo.CalculateBusinessDays('2024-01-01', '2024-01-05') -- 5 (Mon–Fri)
SELECT dbo.CalculateBusinessDays('2024-01-06', '2024-01-07') -- 0 (Sat–Sun)
```

---

#### `dbo.AddBusinessDays(@startDate DATETIME, @days INT) → DATETIME`

Adds N business days to a date, skipping weekends.

| | |
|--|--|
| **Returns** | Resulting `DATETIME` at midnight (00:00:00) |
| **Supports** | Negative values (subtract business days) |

```sql
SELECT dbo.AddBusinessDays('2024-01-01', 5)  -- 2024-01-08 00:00:00
SELECT dbo.AddBusinessDays('2024-01-05', -3) -- 2024-01-02 00:00:00
```

---

#### `dbo.IsWithinWorkingHours(@dt DATETIME, @startHour INT, @endHour INT) → BIT`

Returns 1 if the datetime is a weekday AND within the specified hour range.

| | |
|--|--|
| **Returns** | `1` = weekday and within hours, `0` = weekend or outside range |
| **Note** | `@endHour` is **exclusive** — `17` means up to but not including `17:00` |

```sql
SELECT dbo.IsWithinWorkingHours('2024-06-10 10:30', 9, 17) -- 1 (Mon, 10:30am)
SELECT dbo.IsWithinWorkingHours('2024-06-10 20:00', 9, 17) -- 0 (after hours)
SELECT dbo.IsWithinWorkingHours('2024-06-08 10:00', 9, 17) -- 0 (Saturday)
```

---

#### `dbo.GetRelativeTime(@dt DATETIME) → NVARCHAR(100)`

Human-readable relative time string.

| | |
|--|--|
| **Returns** | e.g. `'just now'`, `'30 minutes ago'`, `'3 hours ago'`, `'2 days ago'`, `'1 week ago'`, `'3 months ago'`, `'2 years ago'` |
| **Non-deterministic** | Compares against `DateTime.Now` at runtime — result changes each call |

```sql
SELECT dbo.GetRelativeTime(DATEADD(HOUR, -3, GETDATE())) -- '3 hours ago'
```

---

### 7.5 Timezone (`TimezoneFunctions` class)

> **Critical:** Uses **Windows Timezone IDs** via `TimeZoneInfo.FindSystemTimeZoneById()`. The exact ID string must exist on the SQL Server's Windows installation. Returns `NULL` if the ID is not found. Run `tzutil /l` in Command Prompt on the SQL Server machine to list all valid IDs.

---

#### `dbo.ConvertTimezone(@dt DATETIME, @fromTz NVARCHAR(100), @toTz NVARCHAR(100)) → DATETIME`

Converts a datetime from one timezone to another. Handles DST automatically.

| | |
|--|--|
| **Returns** | Converted `DATETIME`, or `NULL` if either timezone ID is not on the server |
| **Safe test** | `dbo.ConvertTimezone(GETUTCDATE(), 'UTC', 'UTC')` must equal `GETUTCDATE()` |

```sql
-- Bangladesh (UTC+6) → US Eastern (UTC-5) in January = 11-hour difference
SELECT dbo.ConvertTimezone('2024-01-30 14:00', 'Bangladesh Standard Time', 'Eastern Standard Time')
-- Returns: 2024-01-30 03:00:00

-- Safe diagnostic test
SELECT dbo.ConvertTimezone(GETUTCDATE(), 'UTC', 'UTC') -- must equal GETUTCDATE()
```

**Known issue:** If this returns NULL, the timezone ID is not installed. Fix: run Windows Update on the SQL Server machine to refresh timezone data.

---

#### `dbo.GetTimezoneOffset(@timezoneName NVARCHAR(100)) → NVARCHAR(20)`

Returns the current UTC offset of a timezone as a formatted string.

| | |
|--|--|
| **Returns** | String like `'UTC+06:00'` or `'UTC-05:00'`, or `NULL` if ID not found |
| **DST-aware** | Returns the **current** offset (changes between summer/winter) |

```sql
SELECT dbo.GetTimezoneOffset('Bangladesh Standard Time') -- 'UTC+06:00'
SELECT dbo.GetTimezoneOffset('UTC')                      -- 'UTC+00:00'
```

---

#### `dbo.CalculateTimezoneOverlap(@tz1, @tz2 NVARCHAR(100), @startHour INT, @endHour INT) → INT`

Calculates hours of overlapping working time between two timezones.

| | |
|--|--|
| **Returns** | Number of overlapping hours (0 if none; up to `@endHour - @startHour` for same timezone) |

```sql
-- Same timezone: full 8-hour overlap
SELECT dbo.CalculateTimezoneOverlap('Bangladesh Standard Time', 'Bangladesh Standard Time', 9, 17) -- 8

-- Dhaka vs New York: no overlap during standard working hours (11-hour gap)
SELECT dbo.CalculateTimezoneOverlap('Bangladesh Standard Time', 'Eastern Standard Time', 9, 17) -- 0
```

---

### 7.6 Statistics (`StatisticalFunctions` class)

> **Input format for all stat functions:** A **comma-separated string of numbers**: `'10,20,30,40,50'`
> Build from a column using: `STRING_AGG(CAST(col AS VARCHAR), ',')`

---

#### `dbo.StandardDeviation(@values NVARCHAR(MAX)) → FLOAT`

Population standard deviation.

| | |
|--|--|
| **Formula** | `SQRT(SUM((x - mean)²) / N)` — **population** formula (divides by N, not N-1) |

```sql
SELECT dbo.StandardDeviation('10,20,30,40,50') -- ~14.14
SELECT dbo.StandardDeviation('5,5,5,5,5')      -- 0 (no variance)
```

---

#### `dbo.Percentile(@values NVARCHAR(MAX), @percentile FLOAT) → FLOAT`

Nth percentile with linear interpolation.

| | |
|--|--|
| **@percentile** | 0–100 (50 = median, 25 = Q1, 75 = Q3) |
| **Algorithm** | Sorts values; computes fractional index; linearly interpolates |

```sql
SELECT dbo.Percentile('10,20,30,40,50,60,70,80,90,100', 50) -- 55 (median)
SELECT dbo.Percentile('10,20,30,40,50,60,70,80,90,100', 25) -- 32.5 (Q1)
SELECT dbo.Percentile('10,20,30,40,50,60,70,80,90,100', 75) -- 77.5 (Q3)
```

---

#### `dbo.ZScore(@value FLOAT, @mean FLOAT, @stdDev FLOAT) → FLOAT`

Standard deviations from the mean.

| | |
|--|--|
| **Formula** | `(value - mean) / stdDev` |
| **Returns** | Positive = above mean, negative = below mean, `NULL` if stdDev = 0 |

```sql
SELECT dbo.ZScore(75, 50, 15)  -- 1.667 (75 is 1.67 std devs above mean 50)
SELECT dbo.ZScore(50, 50, 15)  -- 0 (at the mean)
SELECT dbo.ZScore(20, 50, 15)  -- -2.0 (2 std devs below mean)
```

---

#### `dbo.CorrelationCoefficient(@vals1 NVARCHAR(MAX), @vals2 NVARCHAR(MAX)) → FLOAT`

Pearson correlation between two equal-length series.

| | |
|--|--|
| **Returns** | `-1.0` (perfect negative) to `+1.0` (perfect positive), `NULL` if lengths differ |

```sql
SELECT dbo.CorrelationCoefficient('1,2,3,4,5', '2,4,6,8,10') -- 1.0 (perfect positive)
SELECT dbo.CorrelationCoefficient('1,2,3,4,5', '5,4,3,2,1')  -- -1.0 (perfect negative)
```

---

### 7.7 Document Parsing (`DocumentParser` class)

---

#### `dbo.ExtractTextFromPDF(@pdfBytes VARBINARY(MAX)) → NVARCHAR(MAX)`

Extracts readable text from a PDF stored as binary.

| | |
|--|--|
| **Works on** | PDFs with an embedded **text layer** (electronically created PDFs) |
| **Does NOT work on** | Scanned/image PDFs — returns `'[PDF parsed – text layer may be image-based]'` (not an error) |
| **Algorithm** | Decodes raw bytes as Latin-1; finds `(text) Tj` and `<hex> Tj` PDF operators |
| **No third-party libs** | Pure regex/byte parsing — no iTextSharp or pdfium dependency |

```sql
UPDATE Candidates
SET ResumeText = dbo.ExtractTextFromPDF(ResumeFile)
WHERE ResumeFileName LIKE '%.pdf' AND ResumeText IS NULL;
```

---

#### `dbo.ExtractTextFromDocx(@docxBytes VARBINARY(MAX)) → NVARCHAR(MAX)`

Extracts readable text from a DOCX file stored as binary.

| | |
|--|--|
| **Algorithm** | Searches for `<w:t>...</w:t>` XML elements in the raw bytes (OOXML body text) |
| **Limitation** | Only reads main body. Headers, footers, and text boxes may be missed |

```sql
UPDATE Candidates
SET ResumeText = dbo.ExtractTextFromDocx(ResumeFile)
WHERE ResumeFileName LIKE '%.docx' AND ResumeText IS NULL;
```

---

#### `dbo.ExtractYearsOfExperience(@resumeText NVARCHAR(MAX)) → INT`

Parses a resume text string and returns the maximum years of experience found.

| | |
|--|--|
| **Returns** | Maximum years found across all patterns, or `NULL` if nothing matched |
| **Strategy A** | Explicit: `"5 years of experience"`, `"10+ years experience"` |
| **Strategy B** | Labelled: `"Experience: 5 years"` |
| **Strategy C** | Date ranges: `"2018 – 2023"` or `"2019 – present/current/now"` |
| **Warning** | Heuristic — review output before making decisions |

```sql
SELECT dbo.ExtractYearsOfExperience('5 years of experience in Java')  -- 5
SELECT dbo.ExtractYearsOfExperience('Worked from 2018 to 2023')       -- 5
SELECT dbo.ExtractYearsOfExperience('Joined 2019, currently here')    -- ~5 (approx to current year)
```

---

### 7.8 NLP (`NLPProcessor` class)

---

#### `dbo.ExtractSkills(@resumeText NVARCHAR(MAX)) → NVARCHAR(MAX)`

Detects technology skills via keyword matching. Returns confidence-scored results.

| | |
|--|--|
| **Returns** | Comma-separated `'skill:confidence'` pairs sorted by confidence desc, e.g. `'java:40,python:20,docker:10'` |
| **Confidence** | `min(occurrences × 10, 100)` — a score of 40 means the skill appeared 4 times |
| **Returns NULL** | If no skills found |

**Full skill dictionary (40+ technologies):**
```
Languages:   java, python, javascript, typescript, csharp, cpp, php, ruby, go, swift, kotlin, rust
Frontend:    react, angular, vue, nodejs
Backend FW:  spring, django, flask, dotnet, laravel
Databases:   sql, mysql, postgresql, mongodb, redis, oracle, mssql
Cloud/DevOps:aws, azure, gcp, docker, kubernetes, jenkins, git, terraform, linux
Concepts:    rest, microservices, agile, cicd, kafka, elasticsearch
```

```sql
SELECT dbo.ExtractSkills('Java Spring Boot developer with Docker and AWS experience')
-- Returns: 'java:30,spring:30,aws:10,docker:10'

-- Find candidates who know both Python and AWS
SELECT * FROM Candidates
WHERE ExtractedSkills LIKE '%python%' AND ExtractedSkills LIKE '%aws%';
```

---

#### `dbo.CalculateSentiment(@text NVARCHAR(MAX)) → FLOAT`

Lexicon-based sentiment analysis.

| | |
|--|--|
| **Returns** | `-1.0` (very negative) to `+1.0` (very positive); `0.0` for neutral or empty |
| **Formula** | `(positive_count - negative_count) / total_words × 20`, clamped to `[-1.0, 1.0]` |
| **Warning** | Does **not** understand negation — "not excellent" still scores positive |

**Positive words (36):** excellent, great, good, amazing, wonderful, fantastic, outstanding, exceptional, superb, impressive, talented, skilled, proficient, competent, capable, qualified, experienced, expert, professional, motivated, enthusiastic, dedicated, passionate, innovative, creative, successful, accomplished, strong, effective, efficient, reliable, trustworthy, positive, recommend, pleasure, brilliant

**Negative words (32):** poor, bad, terrible, awful, horrible, weak, inadequate, insufficient, lacking, deficient, unprofessional, inexperienced, unqualified, incompetent, unreliable, negative, problem, concern, difficulty, struggle, fail, failure, disappointing, dissatisfied, unhappy, frustrated, arrogant, dishonest, unclear, uncertain, confused, issue

```sql
SELECT dbo.CalculateSentiment('Excellent candidate with outstanding skills!') -- ~+0.2
SELECT dbo.CalculateSentiment('Poor communication and terrible attitude.')    -- ~-0.2
SELECT dbo.CalculateSentiment('Candidate submitted the assessment.')           -- ~0.0
```

---

### 7.9 API Integration (`ApiIntegration` class)

> ⚠️ These functions make **outbound HTTP calls** from the SQL Server machine. They require `PERMISSION_SET = EXTERNAL_ACCESS` and `TRUSTWORTHY ON`. They will fail if SQL Server has no internet access. Timeout is 30 seconds.

---

#### `dbo.CallRESTApi(@url, @method, @body, @headers NVARCHAR) → NVARCHAR(MAX)`

General-purpose HTTP client.

| Parameter | Type | Notes |
|-----------|------|-------|
| `@url` | `NVARCHAR(1000)` | Full URL including `https://` |
| `@method` | `NVARCHAR(10)` | `GET`, `POST`, `PUT`, `PATCH`, `DELETE` |
| `@body` | `NVARCHAR(MAX)` | Request body for POST/PUT/PATCH. Pass `NULL` for GET |
| `@headers` | `NVARCHAR(500)` | Pipe-separated: `'Key1:Value1\|Key2:Value2'`. Pass `NULL` for none |

| | |
|--|--|
| **Success response** | `'{"statusCode":200,"body":{...}}'` |
| **Error response** | `'{"error":true,"message":"..."}'` |

```sql
-- GET
SELECT dbo.CallRESTApi('https://api.example.com/data', 'GET', NULL, NULL)

-- POST with JSON body and auth header
SELECT dbo.CallRESTApi(
    'https://api.example.com/candidates',
    'POST',
    '{"name":"Alice","role":"Engineer"}',
    'Content-Type:application/json|Authorization:Bearer mytoken123'
)
```

---

#### `dbo.VerifyLinkedInProfile(@profileUrl NVARCHAR(500), @accessToken NVARCHAR(500)) → NVARCHAR(MAX)`

Verifies a LinkedIn profile URL is reachable.

| | |
|--|--|
| **Returns** | `'{"verified":true/false,"url":"...","statusCode":200}'` |
| **HTTP 999/403** | Treated as valid (LinkedIn bot-protection — URL exists but is access-blocked) |
| **@accessToken** | Pass `NULL` for a simple URL reachability check |

```sql
SELECT dbo.VerifyLinkedInProfile('https://www.linkedin.com/in/username', NULL)
-- Returns: {"verified":true,"url":"...","statusCode":999}
```

---

#### `dbo.GeocodeAddress(@address NVARCHAR(500), @apiKey NVARCHAR(200)) → NVARCHAR(MAX)`

Geocodes a plain-text address to coordinates.

| | |
|--|--|
| **NULL @apiKey** | Uses **OpenStreetMap Nominatim** (free, no key needed) |
| **Non-NULL @apiKey** | Uses **Google Maps Geocoding API** |
| **OSM lat path** | `$[0].lat` |
| **Google lat path** | `$.results[0].geometry.location.lat` |

```sql
-- Free geocoding
SELECT dbo.GeocodeAddress('Dhaka, Bangladesh', NULL)

-- Extract latitude
SELECT JSON_VALUE(dbo.GeocodeAddress('Dhaka, Bangladesh', NULL), '$[0].lat') AS Latitude
```

---

## 8. Common Windows Timezone IDs

Use these exact strings as parameters to timezone functions.

| ID String | UTC Offset | Region |
|-----------|-----------|--------|
| `UTC` | +00:00 | Universal |
| `Bangladesh Standard Time` | +06:00 | Dhaka |
| `India Standard Time` | +05:30 | New Delhi, Mumbai |
| `Pakistan Standard Time` | +05:00 | Karachi |
| `SE Asia Standard Time` | +07:00 | Bangkok, Jakarta |
| `Singapore Standard Time` | +08:00 | Singapore |
| `Tokyo Standard Time` | +09:00 | Japan |
| `AUS Eastern Standard Time` | +10:00 | Sydney |
| `GMT Standard Time` | +00:00 | London |
| `W. Europe Standard Time` | +01:00 | Berlin, Paris, Rome |
| `Eastern Standard Time` | -05:00 | New York, Toronto |
| `Central Standard Time` | -06:00 | Chicago, Dallas |
| `Mountain Standard Time` | -07:00 | Denver |
| `Pacific Standard Time` | -08:00 | Los Angeles |
| `Arab Standard Time` | +03:00 | Riyadh, Kuwait |

> To list **all** IDs on your server: open Command Prompt on the SQL Server machine and run `tzutil /l`

---

## 9. Performance Reference

| Function Group | Speed | Safe in WHERE? | Safe in Large JOIN? |
|---------------|-------|---------------|-------------------|
| Email Validation | Very Fast | ✅ Yes | ✅ Yes |
| `HashPassword` | Slow (~100ms) | ❌ Never in loops | ❌ Cache results |
| `VerifyPassword`, `GenerateSecureToken`, `EncryptSensitiveData` | Fast | ✅ Yes | ✅ Yes |
| String Similarity | Fast–Medium | ✅ Yes | ⚠️ Caution on millions of rows |
| Date / Time | Very Fast | ✅ Yes | ✅ Yes |
| Timezone | Fast | ✅ Yes | ✅ Yes |
| Statistics | Medium | ✅ Yes | ⚠️ Cache for repeated calls |
| `ExtractTextFromPDF/Docx` | Medium–Slow | ✅ Yes | ⚠️ Batch in off-peak jobs |
| `ExtractSkills`, `ExtractYearsOfExperience` | Medium | ✅ Yes | ⚠️ Batch in off-peak jobs |
| `CalculateSentiment` | Fast | ✅ Yes | ✅ Yes |
| API Integration (all three) | Slow (network) | ❌ No | ❌ Async only |

### Optimization: Persisted Computed Columns
Run CLR once at write-time, query the indexed result:
```sql
ALTER TABLE Users ADD EmailDomain AS (dbo.ExtractEmailDomain(Email)) PERSISTED;
CREATE INDEX IDX_Users_EmailDomain ON Users(EmailDomain);
-- Now this hits the index, not the CLR function:
SELECT * FROM Users WHERE EmailDomain = 'gmail.com';
```

### Optimization: Result Caching Table
```sql
CREATE TABLE CLRCache (
    CacheKey   NVARCHAR(500) PRIMARY KEY,
    CacheValue NVARCHAR(MAX),
    ComputedAt DATETIME DEFAULT GETDATE()
);
-- Write-through: compute once, read many times
```

---

## 10. Known Issues & Fixes

| Symptom | Root Cause | Fix |
|---------|-----------|-----|
| `ConvertTimezone` returns `NULL` | Windows timezone ID not installed on SQL Server | Run `tzutil /l` on server. Run Windows Update. Test with `'UTC'→'UTC'` first |
| API functions return error JSON | No internet from SQL Server machine | Check firewall port 443. Test: `dbo.CallRESTApi('https://httpbin.org/get','GET',NULL,NULL)` |
| `HashPassword` is very slow | 100,000 PBKDF2 iterations — intentional | Expected. Never call in loops. Cache after first compute |
| `ExtractTextFromPDF` returns placeholder message | PDF is a scanned image — no text layer | Expected. OCR software needed for image PDFs |
| "Assembly not authorized" error | CLR strict security or TRUSTWORTHY not set | Run the one-time setup block in Section 5 |
| "Invalid object name dbo.X" | Wrong database context | Add `USE RecruitmentDB; GO` at top of script |
| `ConvertTimezone` test shows FAIL | Test logic used `BETWEEN 10 AND 12` but result was `NULL` | Updated test suite uses `UTC→UTC` identity check as safe baseline |

---

## 11. Ready-to-Use SQL Recipes

### Secure Registration & Login
```sql
-- Register user
INSERT INTO Users (Username, Email, PasswordHash, RoleID)
VALUES ('alice', 'alice@example.com', dbo.HashPassword('StrongPass123!'), 3);

-- Login verification + session token
DECLARE @input NVARCHAR(255) = 'StrongPass123!';
IF EXISTS (SELECT 1 FROM Users WHERE Username = 'alice'
           AND dbo.VerifyPassword(@input, PasswordHash) = 1)
BEGIN
    UPDATE Users SET SessionToken = dbo.GenerateSecureToken(64), LastLogin = GETDATE()
    WHERE Username = 'alice';
    SELECT SessionToken FROM Users WHERE Username = 'alice';
END
```

### Resume Processing Pipeline
```sql
UPDATE Candidates SET
    ResumeText      = CASE
                        WHEN ResumeFileName LIKE '%.pdf'  THEN dbo.ExtractTextFromPDF(ResumeFile)
                        WHEN ResumeFileName LIKE '%.docx' THEN dbo.ExtractTextFromDocx(ResumeFile)
                      END,
    ExtractedSkills = dbo.ExtractSkills(
                        CASE
                          WHEN ResumeFileName LIKE '%.pdf'  THEN dbo.ExtractTextFromPDF(ResumeFile)
                          WHEN ResumeFileName LIKE '%.docx' THEN dbo.ExtractTextFromDocx(ResumeFile)
                        END),
    YearsExperience = dbo.ExtractYearsOfExperience(
                        CASE
                          WHEN ResumeFileName LIKE '%.pdf'  THEN dbo.ExtractTextFromPDF(ResumeFile)
                          WHEN ResumeFileName LIKE '%.docx' THEN dbo.ExtractTextFromDocx(ResumeFile)
                        END)
WHERE ResumeFile IS NOT NULL AND ResumeText IS NULL;
```

### Fuzzy Candidate Name Search
```sql
DECLARE @search NVARCHAR(100) = 'Mohammad Rahman';
SELECT CandidateID, FullName,
    CAST(dbo.JaroWinklerSimilarity(@search, FullName) AS DECIMAL(4,3)) AS Score,
    dbo.LevenshteinDistance(@search, FullName) AS EditDistance
FROM Candidates
WHERE dbo.JaroWinklerSimilarity(@search, FullName) > 0.85
ORDER BY Score DESC;
```

### Time-to-Hire Analytics
```sql
SELECT
    j.Title                                                               AS JobTitle,
    COUNT(*)                                                              AS Applications,
    AVG(dbo.CalculateBusinessDays(a.AppliedDate, a.StatusChangedAt))     AS AvgBizDaysToHire,
    dbo.Percentile(
        STRING_AGG(CAST(dbo.CalculateBusinessDays(a.AppliedDate, a.StatusChangedAt) AS VARCHAR), ','),
        50)                                                               AS MedianDaysToHire
FROM Applications a
JOIN Jobs j ON a.JobID = j.JobID
WHERE a.StatusID = 4 AND a.IsDeleted = 0
GROUP BY j.Title
ORDER BY AvgBizDaysToHire DESC;
```

### Global Interview Scheduling
```sql
SELECT
    c.FullName, c.Timezone,
    dbo.GetTimezoneOffset(c.Timezone)                                                  AS TheirOffset,
    dbo.CalculateTimezoneOverlap('Bangladesh Standard Time', c.Timezone, 9, 17)       AS OverlapHours,
    dbo.ConvertTimezone('2024-09-15 10:00', 'Bangladesh Standard Time', c.Timezone)   AS ProposedTimeForThem
FROM Candidates c
WHERE c.Timezone IS NOT NULL
  AND dbo.CalculateTimezoneOverlap('Bangladesh Standard Time', c.Timezone, 9, 17) >= 2
ORDER BY OverlapHours DESC;
```

### Interview Scoring Analysis
```sql
SELECT
    u.FullName AS Interviewer,
    COUNT(*)   AS InterviewsDone,
    CAST(dbo.StandardDeviation(STRING_AGG(CAST(f.TechnicalScore AS VARCHAR), ',')) AS DECIMAL(4,2)) AS ScoreVariance,
    CAST(dbo.Percentile(STRING_AGG(CAST(f.TechnicalScore AS VARCHAR), ','), 50) AS DECIMAL(4,2))    AS MedianScore
FROM InterviewFeedback f
JOIN Users u ON f.InterviewerID = u.UserID
GROUP BY u.UserID, u.FullName
ORDER BY ScoreVariance DESC;
```

### Candidate Email Audit
```sql
SELECT
    dbo.ExtractEmailDomain(Email)                                               AS Domain,
    COUNT(*)                                                                    AS Count,
    SUM(CASE WHEN dbo.ValidateEmail(Email) = 0     THEN 1 ELSE 0 END)          AS InvalidFormat,
    SUM(CASE WHEN dbo.IsDisposableEmail(Email) = 1 THEN 1 ELSE 0 END)          AS Disposable
FROM Candidates
GROUP BY dbo.ExtractEmailDomain(Email)
ORDER BY Count DESC;
```

---

## 12. Deployment & Verification

### Deploy (SSMS)
1. Build the DLL (see Section 3)
2. Copy `RecruitmentCLR.dll` to `C:\CLR\`
3. Run one-time server setup (see Section 5) — once per SQL Server installation
4. Open `Deploy_RecruitmentCLR.sql` in SSMS, press **F5**
5. Expected output ends with: `ALL 29 CLR FUNCTIONS DEPLOYED AND TESTED`

### Verify Deployment
```sql
-- Should return exactly 29 rows
SELECT o.name AS FunctionName, a.permission_set_desc AS Permission
FROM sys.objects o
JOIN sys.assembly_modules am ON o.object_id = am.object_id
JOIN sys.assemblies a ON am.assembly_id = a.assembly_id
WHERE a.name = 'RecruitmentCLR'
ORDER BY o.name;
```

### Quick Smoke Test
```sql
USE RecruitmentDB;
SELECT
    dbo.ValidateEmail('test@example.com')              AS Email_Expect_1,
    dbo.CalculateBusinessDays('2024-01-01','2024-01-05') AS BizDays_Expect_5,
    dbo.GetRelativeTime(DATEADD(HOUR,-2,GETDATE()))    AS RelTime_Expect_2h,
    dbo.StandardDeviation('10,20,30,40,50')            AS StdDev_Expect_14,
    dbo.LevenshteinDistance('kitten','sitting')         AS Lev_Expect_3,
    dbo.ExtractYearsOfExperience('5 years of exp')     AS Years_Expect_5,
    dbo.ConvertTimezone(GETUTCDATE(),'UTC','UTC')       AS UTC_Must_Equal_GETUTCDATE;
```

### Re-deploy After Code Changes
```cmd
REM In VS Code terminal:
cd C:\RecruitmentCLR
dotnet clean
dotnet build --configuration Release
copy bin\Release\net48\RecruitmentCLR.dll C:\CLR\ /Y
```
Then re-run `Deploy_RecruitmentCLR.sql` in SSMS (it drops and recreates everything safely).

---

## 13. Project File Descriptions

| File | Language | Purpose | When to edit |
|------|----------|---------|-------------|
| `RecruitmentCLR.cs` | C# | Email, Security, String Similarity, DateTime, Statistics classes | Change hashing iterations, add email domains, tweak similarity logic |
| `DocumentParser.cs` | C# | PDF/DOCX parsing, years-of-experience detection, NLP | Add skills to dictionary, improve experience parsing patterns |
| `ApiIntegration.cs` | C# | HTTP client, LinkedIn verifier, geocoder, timezone converter | Change API endpoints, add new REST integrations |
| `RecruitmentCLR.csproj` | XML | .NET project config (net48, x64, AllowUnsafeBlocks) | Rarely — only to add NuGet packages |
| `Deploy_RecruitmentCLR.sql` | SQL | Master deployment: drops old → loads DLL → creates all 29 functions | After adding/removing functions |
| `TestSuite_Complete.sql` | SQL | 29 function tests with PASS/FAIL + summary table | After adding new functions or changing logic |
| `CLR_Functions_Documentation.docx` | Word | Complete reference with algorithms, parameter tables, examples | Reference only |

---

## 14. Project History & Decisions

| Decision | Choice Made | Reason |
|----------|------------|--------|
| CLR language | C# / .NET Framework 4.8 | Required for SQL Server CLR compatibility |
| Password hashing | PBKDF2-SHA256, 100K iterations | OWASP 2024 recommendation |
| Salt storage | Embedded in hash output | Single column, no separate salt column needed |
| Assembly permission | `EXTERNAL_ACCESS` (not `SAFE`) | Required for timezone and API functions |
| PDF parsing | Raw byte regex | No external DLL dependencies needed |
| Skill matching | Dictionary + regex counting | No ML model needed, works offline |
| Sentiment | Lexicon-based | Deterministic, no external model dependency |
| Geocoding | OSM Nominatim (free default) | No API key required for basic usage |
| Deployment script | Drop-all then recreate | Safe for re-runs and updates |
| Test suite | Inline PASS/FAIL with summary CTE | Easy to run in SSMS, shows all results at once |

---

*Version 1.0 — February 2026 — 29 CLR functions, 9 C# classes, SQL Server 2022*
