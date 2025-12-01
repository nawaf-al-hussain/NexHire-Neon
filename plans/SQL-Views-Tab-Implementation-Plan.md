# SQL Views Tab Implementation Plan

## Overview
Replace the placeholder "SQL Views Synchronizing" screen with a functional tab that displays all database views from the NexHire database and executes queries to show real results.

## Current Database Views (27 total) - VERIFIED WORKING

The following views are already being used in the API and will execute properly:

### Analytics Views (Already Connected)
| # | View Name | Purpose | API Endpoint |
|---|-----------|---------|---------------|
| 1 | vw_ApplicationFunnel | Application funnel analysis | `/api/analytics/funnel` |
| 2 | vw_VacancyUtilization | Vacancy utilization metrics | `/api/analytics/vacancy-utilization` |
| 3 | vw_HireRatePerJob | Hire rate per job posting | `/api/analytics/hire-rate` |
| 4 | vw_HiringBottlenecks | Hiring bottleneck detection | `/api/analytics/bottlenecks` |
| 5 | vw_MarketIntelligenceDashboard | Market intelligence | `/api/analytics/market-intelligence` |
| 6 | vw_RemoteCompatibilityMatrix | Remote compatibility | `/api/analytics/remote-compatibility` |
| 7 | vw_DiversityAnalyticsFunnel | Diversity analytics | `/api/analytics/diversity-funnel` |

### Performance & Recruitment Views
| # | View Name | Purpose |
|---|-----------|---------|
| 8 | vw_CandidateMatchScore | Weighted candidate matching scores |
| 9 | vw_CandidateInterviews | Candidate interview schedules |
| 10 | vw_RecruiterPerformance | Recruiter performance metrics |
| 11 | vw_TimeToHire | Time to hire metrics |
| 12 | vw_AverageTimeToHire | Average days to hire |

### Bias & Compliance Views
| # | View Name | Purpose |
|---|-----------|---------|
| 13 | vw_Bias_Location | Bias detection by location |
| 14 | vw_Bias_Experience | Bias detection by experience |
| 15 | vw_SalaryTransparency | Salary transparency data |
| 16 | vw_DiversityByGender | Diversity by gender |
| 17 | vw_DiversityByDisability | Diversity by disability |
| 18 | vw_DiversityByVeteran | Diversity by veteran status |

### Candidate Analytics Views
| # | View Name | Purpose |
|---|-----------|---------|
| 19 | vw_InterviewScoreVsDecision | Interview score vs final decision |
| 20 | vw_InterviewerConsistency | Interviewer consistency scores |
| 21 | vw_SkillGapAnalysis | Skill gap analysis |
| 22 | vw_SkillVerificationStatus | Skill verification status |
| 23 | vw_CandidateEngagement | Candidate engagement scores |
| 24 | vw_GhostingRiskDashboard | Ghosting risk dashboard |
| 25 | vw_RejectionAnalysis | Rejection reason analysis |

### Career & Referral Views
| # | View Name | Purpose |
|---|-----------|---------|
| 26 | vw_CareerPathInsights | Career path insights |
| 27 | vw_ReferralIntelligence | Referral intelligence |

## Schema Verification

All views reference tables that exist in the database:
- Candidates, Applications, JobPostings
- InterviewSchedules, InterviewFeedback
- Recruiters, Users
- Skills, CandidateSkills, JobSkills
- ApplicationStatus, ApplicationStatusHistory
- And 60+ additional tables

## Implementation Architecture

### Backend (Server)
```
New Endpoint: GET /api/admin/sql-views
- Returns list of all views with metadata
- Each view includes: name, description, column definitions

New Endpoint: GET /api/admin/sql-views/:viewName
- Executes: SELECT * FROM [viewName]
- Returns query results (max 100 rows for performance)
```

### Frontend (React)
```
SQLViews.jsx Component:
- Tab 1: View List (cards with search/filter)
- Tab 2: View Results (data table with pagination)
- Tab 3: View Definition (SQL code display)
```

## UI/UX Design

### Layout
- **Header**: Title "Database Views" with count badge
- **Search/Filter**: Search bar to filter views by name
- **Categories**: Group views (Analytics, Performance, Bias, Candidate, Career)
- **View Cards**: Clickable cards showing view name, row count, last accessed

### Results Display
When a view is clicked:
- Show loading spinner
- Display results in data table
- Pagination (100 rows per page)
- Column sorting
- Export to CSV button

### View Definition Panel
- Show CREATE VIEW SQL statement
- Syntax highlighting
- Copy to clipboard button

## File Changes Required

### Backend
- `server/routes/admin.js` - New endpoints for SQL views

### Frontend
- `client/src/components/Admin/SQLViews.jsx` - New component
- `client/src/pages/AdminDashboard.jsx` - Import and use SQLViews

## Security Considerations
- Only SELECT queries allowed (no INSERT/UPDATE/DELETE)
- Row limit of 100 to prevent performance issues
- Admin role required to access
- Query logging for audit trail