# NexHire Developer Guide

Welcome to the NexHire development documentation. This guide is split into modular sections to help you navigate the codebase efficiently.

## Navigation

- [Project Architecture Overview](#project-architecture-overview)
- [🏁 Getting Started](./Getting_Started.md) - How to run the project.
- [🗄️ Database Guide](./Database_Guide.md) - Schema, Views, Stored Procs, and CLR reference.
- [⚙️ Backend Development](./Backend_Development.md) - API creation, Auth, and RBAC.
- [🎨 Frontend Development](./Frontend_Development.md) - Components, Styling, and Feature addition.
- [📋 Rules & Checklists](./Best_Practices_and_Rules.md) - Mandatory steps for every feature.
- [🚀 Features Inventory](./Features_Inventory.md) - Full list of implemented functionality.
- [🐘 PostgreSQL Migration](./PostgreSQL_Migration.md) - SQL Server to Neon PostgreSQL migration notes.

---

## Recent Additions

### PostgreSQL Migration
- **Database:** Migrated from SQL Server to Neon PostgreSQL
- **Project:** NexHire2 (ID: long-resonance-68796325)
- **Notes:** See [PostgreSQL Migration](./PostgreSQL_Migration.md) for detailed differences

### Navigation Updates (Candidate Dashboard)
- **Profile Access:** Profile tab removed from sidebar navigation, now accessible via clicking the user card at the bottom of the sidebar
- **Notifications:** Notifications tab removed from sidebar, now accessible via Bell icon in header
- **Component:** `components/DashboardShell.jsx` - Added `onProfileClick` handler for user card

### Salary Visibility Feature (Job Roles)
- **Location:** Recruiter Dashboard → Job Roles tab → Create/Edit Job
- **Backend:** `/api/jobs` endpoints (GET, POST, PUT) now handle salary ranges
- **Frontend:** `components/Jobs/JobEditModal.jsx` - Added salary section with:
  - Min/Max salary input fields
  - "Make salary visible to candidates" checkbox (IsTransparent toggle)
  - Collapsible salary section
- **Table:** `JobSalaryRanges` (RangeID, JobID, MinSalary, MaxSalary, IsTransparent)
- **Candidate View:** `/api/candidates/discover` returns SalaryMin/SalaryMax when IsTransparent=1
- **Display:** Candidates see salary in emerald green box when viewing job details in Discover Jobs

### Auto Rejection Button (Recruiter Dashboard)
- **Location:** Recruiter Dashboard → Job Roles tab (as button in header)
- **Previous Location:** Was a separate sidebar tab
- **Frontend:** `pages/RecruiterDashboard.jsx` - Button in header area
- **Component:** `components/Recruiters/AutoRejectionLog.jsx` - Added `onGoBack` prop and back button
- **Features:** Rose-colored button, batch run functionality, auto-rejected candidates list
- **Note:** Hero stats (Total Pool, Top Matches, Open Roles) removed from all recruiter tabs

### Applied Jobs Behavior (Candidate Dashboard)
- **Location:** Candidate Dashboard → Discover Jobs tab
- **Previous Behavior:** Job card disappeared after applying
- **New Behavior:** Applied jobs stay visible with greyed-out appearance
- **Changes:**
  - Job card has `opacity-60` and grey styling when applied
  - Job title turns grey
  - Status badge shows "Applied" instead of "Active"
  - Button shows "Applied" in grey

### Screening Bot Back Button Update
- **Location:** Recruiter Dashboard → Screening Bot tab
- **Changes:** Back button moved to top of component, styled consistently with AutoRejectionLog
- **Component:** `components/Recruiters/ScreeningBot.jsx`

### Profile Management (Candidate Dashboard)
- **Location:** Candidate Dashboard → "Profile" tab
- **Backend:** `GET/PUT /api/candidates/profile`, `PUT /api/candidates/profile/consent`
- **Frontend:** `components/Candidate/ProfileManagement.jsx`
- **Features:** Basic profile editing (FullName, Location, YearsOfExperience, LinkedInURL, Timezone), Privacy & Consent management (DataProcessing, Marketing, Retention, ThirdPartySharing), Account info display

### Admin Consent Management (Admin Dashboard)
- **Location:** Admin Dashboard → "Consent" tab
- **Backend:** `GET /api/analytics/consent-status`
- **Frontend:** `components/Admin/ConsentManagement.jsx`
- **Table:** `ConsentManagement`
- **Features:** GDPR consent tracking with 3 statuses (Active, Expired, Revoked), candidate name join, consent type and expiry display

### Predictive Hiring Success (Recruiter Dashboard)
- **Location:** Recruiter Dashboard → "Hire Predictor" tab
- **Backend:** `POST /api/analytics/predict-hire-success`
- **Frontend:** `components/Recruiters/HireSuccessPredictor.jsx`
- **Stored Procedure:** `sp_PredictHireSuccess`
- **Features:** Rules-Based AI predicting success probability with factor breakdown (Skill Match 30%, Interview Score 30%, Experience 25%, Engagement 15%, Historical adjustment)

### Salary Transparency Analytics (Admin Dashboard)
- **Location:** Admin Dashboard → "Salary Transp" tab
- **Backend:** `GET /api/analytics/salary-transparency`
- **Frontend:** `components/Admin/SalaryTransparencyAnalytics.jsx`
- **View:** `vw_SalaryTransparency`
- **Features:** Pie chart distribution, bar chart comparison, impact percentage calculation, detailed job-level breakdown

### Career Path Simulator (Candidate Dashboard)
- **Location:** Candidate Dashboard → "Career Path" tab → "Simulate New Path" button
- **Backend:** `POST /api/candidates/career-path/simulate`
- **Frontend:** `components/Candidate/CareerPathSimulator.jsx`
- **Parent Component:** `components/Candidate/CareerPath.jsx`
- **Stored Procedure:** `sp_PredictCareerPath`
- **Features:** Role selection, timeline slider (6-60 months), probability display, salary increase projection, development plan
- **Design System:** Redesigned to follow NexHire Design System Guide - uses glass-card patterns, solid indigo-600 buttons, proper border radius and typography

### Referral Intelligence Dashboard
- **Location:** Recruiter Dashboard → "Referral Intel" tab
- **Backend:** `GET /api/recruiters/referral-intelligence`
- **Frontend:** `components/Recruiters/ReferralIntelligence.jsx`
- **Tables:** `ReferralNetwork`, `NetworkStrength`, `ReferralPerformance`
- **Seed Script:** `server/sql/seed_referral_data.sql`
- **Features:** 5 tabs - Overview (summary stats, outcome breakdown), Top Referrers (leaderboard), Recent Referrals (table), Network Analysis (connection strength), AI Suggestions (job-specific referral recommendations using sp_SuggestReferrals stored procedure)

### Referral AI Suggestions (NEW)
- **Location:** Referral Intelligence Dashboard → "AI Suggestions" tab
- **Backend:** `GET /api/recruiters/referral-suggestions/:jobId`
- **Frontend:** `components/Recruiters/ReferralIntelligence.jsx` (AI Suggestions tab)
- **Stored Procedure:** `sp_SuggestReferrals`
- **Features:** Job dropdown selector, AI-powered referral suggestions with quality scores, estimated success probability, potential referrals with fit scores and connection strengths

### Candidate Profile Modal
- **Location:** Talent Pool → "View Profile" button
- **Backend:** `GET /api/recruiters/candidate-profile/:candidateId`
- **Frontend:** `components/Recruiters/CandidateProfileModal.jsx`
- **Features:** 4 tabs (Overview, Skills, AI Insights, History), aggregates 12 data sources

### Candidate Ranking History
- **Location:** Candidate Profile Modal → "History" tab
- **Backend:** `GET /api/recruiters/ranking-history/:candidateId`, `POST /api/recruiters/ranking-history`
- **Frontend:** `components/Recruiters/RankingHistory.jsx`
- **Table:** `CandidateRankingHistory`
- **Stored Procedure:** `sp_SaveCandidateRanking`
- **Features:** Timeline view, line/bar charts, trend analysis (improving/declining/stable), score statistics

### Remote Work Analytics (Admin Dashboard)
- **Location:** Admin Dashboard → "Remote Work" tab
- **Backend:** `GET /api/analytics/remote-compatibility`
- **Frontend:** `components/Admin/RemoteWorkAnalytics.jsx`
- **View:** `vw_RemoteCompatibilityMatrix`
- **Features:** Summary stats (avg score, excellent/poor matches, overlap hours), role compatibility chart, candidate factor averages (workspace quality, timezone alignment, communication, distraction resistance, self motivation), match distribution, detailed assessment table

### Email Queue Manager (Admin Dashboard)
- **Location:** Admin Dashboard → "Email Queue" tab
- **Backend:** `GET/PUT/DELETE /api/maintenance/email-queue`, `POST /api/maintenance/email-queue/send-test`
- **Frontend:** `components/Admin/EmailQueueManager.jsx`
- **Table:** `EmailQueue`
- **Features:** Email notification queue management with stats (total, sent, pending), filters (status, type), data table with recipient, type, subject, status, created date, action buttons (retry, delete), and send test email functionality

### Vacancy Utilization Fix (Job Roles)
- **Location:** Recruiter Dashboard → Job Roles tab
- **Backend:** `GET /api/jobs` now uses `vw_VacancyUtilization` view for accurate application counts
- **View:** `vw_VacancyUtilization` (FilledVacancies, TotalVacancies, UtilizationRate)
- **Fix:** Previously used incorrect column; now correctly shows filled vs total vacancies per active job

### Gradient Design Headers (Admin Dashboard)
- **Location:** Admin Dashboard → All tabs
- **Frontend:** All admin tab components now use consistent gradient design headers
- **Pattern:** `glass-card rounded-[3rem] p-8 bg-gradient-to-r from-[color]-500/5 to-[color]-500/5 border border-[color]-500/20`
- **Components Updated:** DiversityGoals, ConsentManagement, BiasLogs, RemoteWorkAnalytics, SalaryTransparencyAnalytics, VacancyUtilizationAdmin, RecruiterPerformanceAdmin, EmailQueueManager

### Gradient Design Headers (Recruiter Dashboard)
- **Location:** Recruiter Dashboard → Talent Pool, Job Roles tabs
- **Frontend:** `components/Recruiters/TalentPool.jsx`, `components/Jobs/JobList.jsx`
- **Pattern:** Glass-card with gradient header, proper typography (labels: 10px uppercase tracking-widest)
- **Features:** Consistent styling across recruiter tabs

### Job Roles Restructuring (Recruiter Dashboard)
- **Location:** Recruiter Dashboard → Job Roles tab
- **Frontend:** `components/Jobs/JobList.jsx`, `pages/RecruiterDashboard.jsx`
- **Changes:**
  - Post Job button moved inside gradient header (indigo-600)
  - Auto Rejection and Screening Bot buttons moved to right of search bar as minimal icon-only buttons
  - New Archives button added as minimal icon near filter button
  - Buttons restructured for cleaner layout
- **Components:** `pages/RecruiterDashboard.jsx` passes `onOpenJobModal`, `onOpenScreeningBot`, `onOpenAutoRejection` props to JobList

### Resume Analysis Fixes (Talent Pool & Candidate Dashboard)
- **Location:** Recruiter Dashboard → Talent Pool, Candidate Dashboard → Resume Score
- **Backend:** `GET /api/recruiters/talent-pool` returns `YearsOfExperience` (not `YearsExperience`)
- **Frontend:**
  - `components/Recruiters/TalentPool.jsx` - Fixed field name, shows "N/A" for resume score when no data
  - `components/Candidate/ResumeScore.jsx` - Removed fake 72% placeholder, shows empty state "No Resume Data Available" when no resume uploaded
- **Table:** `ResumeInsights` stores resume quality scores (ResumeQualityScore, ProcessingStatus)
- **Behavior:** Shows "N/A" when candidate has no resume uploaded or processed

### SQL Views Tab (Admin Dashboard)
- **Location:** Admin Dashboard → "SQL Views" tab
- **Backend:** `GET /api/maintenance/sql-views`, `GET /api/maintenance/sql-views/:viewName`
- **Frontend:** `components/Admin/SQLViews.jsx`
- **Features:** Browse 27 database views organized by category (Analytics, Performance, Bias & Compliance, Candidate, Career & Referral, Market, Interview), click any view to execute SELECT * and display results in data table, export to CSV, search/filter views

---

## Project Architecture Overview

```
NexHire-Frontend/
├── client/                     ← React 18 + Vite frontend
│   └── src/
│       ├── apiConfig.js        ← Single source for API_BASE URL
│       ├── context/
│       │   ├── AuthContext.jsx ← Global user/session state
│       │   └── ThemeContext.jsx← Dark/light mode
│       ├── pages/
│       │   ├── LandingPage.jsx
│       │   ├── LoginPage.jsx
│       │   ├── AdminDashboard.jsx
│       │   ├── RecruiterDashboard.jsx
│       │   └── CandidateDashboard.jsx
│       └── components/
│           ├── DashboardShell.jsx       ← Shared layout (sidebar, theme, logout)
│           ├── Jobs/
│           │   ├── JobList.jsx
│           │   ├── JobModal.jsx
│           │   ├── CandidateMatches.jsx
│           │   ├── ApplicationPipeline.jsx
│           │   ├── ScheduleInterviewModal.jsx
│           │   ├── JobMatchingView.jsx
│           │   ├── SkillMatrix.jsx
│           │   └── JobMatchingView.jsx
│           └── Candidate/
│               ├── CandidateApplications.jsx
│               ├── CandidateInterviews.jsx
│               ├── CandidateSkillsVerification.jsx
│               └── AssessmentTestingEngine.jsx
├── server/                     ← Node.js + Express backend
│   ├── index.js                ← App entry: registers all routes
│   ├── db.js                   ← msnodesqlv8 SQL Server connection
│   ├── .env                    ← DB_CONNECTION_STRING (Windows Auth)
│   ├── middleware/
│   │   └── rbac.js             ← protect(), authorize(roleID) middleware
│   └── routes/
│       ├── auth.js             ← /api/auth
│       ├── users.js            ← /api/users
│       ├── jobs.js             ← /api/jobs
│       ├── skills.js           ← /api/skills
│       ├── applications.js     ← /api/applications
│       ├── candidates.js       ← /api/candidates
│       ├── analytics.js        ← /api/analytics
│       ├── maintenance.js      ← /api/maintenance
│       ├── interviews.js       ← /api/interviews
│       ├── assessments.js     ← /api/candidates/assessments
│       └── recruiters.js       ← /api/recruiters
└── ProjectResources/
    ├── RecruitmentDB_MasterScript.sql       ← Full DB creation script
    └── NexHire Features Dictionary - FeaturesList.tsv  ← All features, tables, procs & views
```

> **DB Engine:** SQL Server (RecruitmentDB) via Windows Authentication  
> **ORM:** None — raw T-SQL via `msnodesqlv8`  
> **Frontend framework:** React 18, Vite, Tailwind CSS, Axios, Lucide React icons
