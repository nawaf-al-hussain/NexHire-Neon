# NexHire - Comprehensive System Documentation

> **Version:** 1.0.0  
> **Platform Architect:** Nawaf Al Hussain Khondokar  
> **Last Updated:** March 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Full Repository Structure](#3-full-repository-structure)
4. [System Architecture](#4-system-architecture)
5. [Database Schema](#5-database-schema)
6. [API Documentation](#6-api-documentation)
7. [Frontend Components](#7-frontend-components)
8. [Business Logic & Workflows](#8-business-logic--workflows)
9. [Configuration & Environment Variables](#9-configuration--environment-variables)
10. [Authentication & Authorization](#10-authentication--authorization)
11. [Security Considerations](#11-security-considerations)
12. [Build & Deployment](#12-build--deployment)
13. [Testing](#13-testing)
14. [Extension Guide](#14-extension-guide)
15. [Features Inventory](#15-features-inventory)

---

## 1. Project Overview

### 1.1 What is NexHire?

NexHire is a comprehensive recruitment management platform designed to streamline the entire hiring process. It serves three distinct user roles:

| Role | RoleID | Description |
|------|--------|-------------|
| **Administrator** | 1 | Full system access, analytics, compliance, and platform management |
| **Recruiter** | 2 | Job posting management, candidate sourcing, screening, and hiring workflows |
| **Candidate** | 3 | Job discovery, applications, skill assessments, and career development tools |

### 1.2 Core Problem Solved

NexHire addresses the complexities of modern recruitment by providing:

- **Intelligent Candidate Matching**: AI-powered matching between job requirements and candidate profiles
- **Automated Screening**: Rules-based and AI-enhanced candidate screening
- **Bias Detection & Diversity Analytics**: Tools to ensure fair hiring practices
- **Comprehensive Analytics**: Real-time metrics for hiring performance and market intelligence
- **Career Development**: Gamified learning paths and career simulation for candidates

### 1.3 Key System Capabilities

```
┌─────────────────────────────────────────────────────────────────────┐
│                        NEXHIRE CAPABILITIES                        │
├─────────────────────────────────────────────────────────────────────┤
│  ✓ Job Posting & Management                                        │
│  ✓ Candidate Discovery & Matching                                  │
│  ✓ Application Pipeline (Kanban)                                   │
│  ✓ Automated Screening Bot                                          │
│  ✓ Interview Scheduling & Feedback                                  │
│  ✓ Skill Assessments & Verification                                │
│  ✓ Background Checks & Blockchain Verification                     │
│  ✓ Diversity & Inclusion Analytics                                 │
│  ✓ Salary Transparency                                             │
│  ✓ Remote Work Compatibility Scoring                               │
│  ✓ Referral Intelligence                                           │
│  ✓ Predictive Hiring Success                                       │
│  ✓ Onboarding Success Prediction                                   │
│  ✓ Career Path Simulation                                          │
│  ✓ Learning Paths & Skill Gap Analysis                            │
│  ✓ Gamification & Leaderboards                                     │
│  ✓ Chatbot Assistant                                              │
│  ✓ Email Queue Management                                          │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.4 High-Level Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           NEXHIRE WORKFLOW                                 │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌──────────┐     ┌──────────────┐     ┌─────────────┐     ┌───────────┐
  │ Candidate│     │  Application │     │  Screening  │     │ Interview │
  │ Applies  │────▶│    Stage     │────▶│    Stage    │────▶│   Stage   │
  └──────────┘     └──────────────┘     └─────────────┘     └───────────┘
                                                                      │
       ┌──────────────────────────────────────────────────────────────┘
       │
       ▼
  ┌───────────┐     ┌─────────────┐     ┌─────────────────┐
  │   Hired   │     │ Onboarding  │     │ Success         │
  │  Stage    │────▶│ Prediction  │────▶│ Prediction      │
  └───────────┘     └─────────────┘     └─────────────────┘

  ===========================================================================
  PARALLEL TRACKS:
  ===========================================================================
  • Recruiter Dashboard: Talent Pool, Job Roles, Analytics, Screening
  • Admin Dashboard: Diversity Goals, Bias Detection, Performance Metrics
  • Candidate Dashboard: Discover Jobs, My Applications, Career Path
```

---

## 2. Technology Stack

### 2.1 Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.0 | UI Framework |
| **Vite** | 7.3.1 | Build tool and dev server |
| **Tailwind CSS** | 4.2.0 | Utility-first CSS framework |
| **Axios** | 1.13.5 | HTTP client |
| **React Router DOM** | 7.13.0 | Client-side routing |
| **Recharts** | 2.15.0 | Data visualization charts |
| **Lucide React** | 0.575.0 | Icon library |
| **React Theme Switch Animation** | 1.0.0 | Theme transition animations |

### 2.2 Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | Latest | JavaScript runtime |
| **Express** | 5.2.1 | Web framework |
| **msnodesqlv8** | 5.1.5 | SQL Server driver |
| **MSSQL** | 12.2.0 | SQL Server client |
| **Multer** | 2.0.2 | File upload middleware |
| **PDF-Parse** | 2.4.5 | PDF text extraction |
| **Cors** | 2.8.6 | CORS middleware |
| **Dotenv** | 17.3.1 | Environment variables |

### 2.3 Database

| Component | Technology | Description |
|-----------|------------|-------------|
| **Database Engine** | SQL Server | Primary data store |
| **ORM** | None | Raw T-SQL via msnodesqlv8 |
| **CLR Functions** | C# | Password hashing, NLP, string similarity |

### 2.4 Development Tools

| Tool | Purpose |
|------|---------|
| **ESLint** | Code linting |
| **PostCSS** | CSS processing |
| **Autoprefixer** | Vendor prefixing |
| **Concurrently** | Run multiple commands |
| **Nodemon** | Auto-restart dev server |

---

## 3. Full Repository Structure

```
NexHire-Frontend/
│
├── .gitignore                          # Git ignore rules
├── package.json                        # Root package (concurrently)
├── PROJECT_RULES.md                    # GSD canonical rules
├── GSD-STYLE.md                        # Style conventions
│
├── client/                             # React Frontend
│   ├── package.json
│   ├── vite.config.js                  # Vite configuration
│   ├── tailwind.config.js              # Tailwind configuration
│   ├── postcss.config.js               # PostCSS configuration
│   ├── eslint.config.js                # ESLint configuration
│   ├── index.html                      # Entry HTML
│   ├── README.md
│   │
│   ├── public/
│   │   └── vite.svg                    # Vite logo
│   │
│   └── src/
│       ├── main.jsx                    # React entry point
│       ├── App.jsx                     # Main app component
│       ├── App.css
│       ├── index.css                    # Global styles + CSS variables
│       ├── apiConfig.js                # API base URL configuration
│       │
│       ├── assets/
│       │   ├── nexhire_logo.png
│       │   ├── nexhire_logo.svg
│       │   └── react.svg
│       │
│       ├── context/
│       │   ├── AuthContext.jsx         # Authentication state management
│       │   └── ThemeContext.jsx         # Dark/light theme management
│       │
│       ├── pages/
│       │   ├── LandingPage.jsx         # Public landing page
│       │   ├── LoginPage.jsx           # Authentication page
│       │   ├── AdminDashboard.jsx      # Administrator dashboard
│       │   ├── RecruiterDashboard.jsx  # Recruiter dashboard
│       │   ├── CandidateDashboard.jsx  # Candidate dashboard
│       │   └── DesignSystemPage.jsx    # UI component showcase
│       │
│       ├── components/
│       │   ├── DashboardShell.jsx      # Shared layout (sidebar, header)
│       │   │
│       │   ├── Admin/                  # Admin-specific components
│       │   │   ├── BiasLogs.jsx
│       │   │   ├── ConsentManagement.jsx
│       │   │   ├── DiversityGoals.jsx
│       │   │   ├── EmailQueueManager.jsx
│       │   │   ├── RecruiterPerformanceAdmin.jsx
│       │   │   ├── RemoteWorkAnalytics.jsx
│       │   │   ├── SalaryTransparencyAnalytics.jsx
│       │   │   ├── SQLViews.jsx
│       │   │   └── VacancyUtilizationAdmin.jsx
│       │   │
│       │   ├── Candidate/              # Candidate-specific components
│       │   │   ├── AssessmentTestingEngine.jsx
│       │   │   ├── CandidateApplications.jsx
│       │   │   ├── CandidateInterviews.jsx
│       │   │   ├── CandidateSkillsVerification.jsx
│       │   │   ├── CareerPath.jsx
│       │   │   ├── CareerPathSimulator.jsx
│       │   │   ├── InterviewPrep.jsx
│       │   │   ├── Leaderboard.jsx
│       │   │   ├── LearningPaths.jsx
│       │   │   ├── LocationPreferences.jsx
│       │   │   ├── ProfileManagement.jsx
│       │   │   ├── PushNotifications.jsx
│       │   │   ├── ResumeScore.jsx
│       │   │   ├── SalaryCoach.jsx
│       │   │   ├── SentimentTracker.jsx
│       │   │   ├── SkillGapAnalysis.jsx
│       │   │   └── SkillManagementModal.jsx
│       │   │
│       │   ├── Jobs/                    # Job management components
│       │   │   ├── ApplicationPipeline.jsx
│       │   │   ├── CandidateMatches.jsx
│       │   │   ├── JobCard.jsx
│       │   │   ├── JobEditModal.jsx
│       │   │   ├── JobList.jsx
│       │   │   ├── JobMatchingView.jsx
│       │   │   ├── JobModal.jsx
│       │   │   ├── RejectionReasonModal.jsx
│       │   │   ├── ScheduleInterviewModal.jsx
│       │   │   └── SkillMatrix.jsx
│       │   │
│       │   ├── Recruiters/              # Recruiter-specific components
│       │   │   ├── AdvancedAnalytics.jsx
│       │   │   ├── AutoRejectionLog.jsx
│       │   │   ├── BackgroundChecks.jsx
│       │   │   ├── BiasAnalytics.jsx
│       │   │   ├── CandidateEngagement.jsx
│       │   │   ├── CandidateProfileModal.jsx
│       │   │   ├── ExternalPlatformSync.jsx
│       │   │   ├── GhostingRiskDetail.jsx
│       │   │   ├── HireAnalytics.jsx
│       │   │   ├── HireSuccessPredictor.jsx
│       │   │   ├── InterviewFatigueReducer.jsx
│       │   │   ├── InterviewFeedback.jsx
│       │   │   ├── InterviewQuestionsGenerator.jsx
│       │   │   ├── InterviewTranscription.jsx
│       │   │   ├── MarketAlerts.jsx
│       │   │   ├── OnboardingSuccessPredictor.jsx
│       │   │   ├── RankingHistory.jsx
│       │   │   ├── ReferralIntelligence.jsx
│       │   │   ├── ScreeningBot.jsx
│       │   │   ├── SkillVerificationStatus.jsx
│       │   │   ├── TalentPool.jsx
│       │   │   ├── TimeToHireDetail.jsx
│       │   │   └── VideoInterviews.jsx
│       │   │
│       │   ├── Charts/                  # Visualization components
│       │   │   ├── BiasAnalysisChart.jsx
│       │   │   ├── DiversityChart.jsx
│       │   │   ├── EngagementTrendChart.jsx
│       │   │   ├── HireRatePerJobChart.jsx
│       │   │   ├── HiringFunnelChart.jsx
│       │   │   ├── InterviewerPerformanceChart.jsx
│       │   │   ├── MarketIntelligenceChart.jsx
│       │   │   ├── RecruiterLeaderboardChart.jsx
│       │   │   ├── ReferralIntelChart.jsx
│       │   │   ├── RejectionAnalysisChart.jsx
│       │   │   ├── RemoteWorkChart.jsx
│       │   │   ├── SalaryRangeChart.jsx
│       │   │   ├── SentimentChart.jsx
│       │   │   ├── SkillGapChart.jsx
│       │   │   └── VacancyUtilizationChart.jsx
│       │   │
│       │   └── shared/
│       │       └── ChatbotWidget.jsx    # AI chatbot assistant
│
├── server/                             # Node.js Backend
│   ├── package.json
│   ├── index.js                        # Express app entry point
│   ├── db.js                          # SQL Server connection
│   ├── pdfHelper.js                   # PDF parsing utilities
│   ├── .env                          # Environment configuration
│   ├── .env.example                  # Environment template
│   │
│   ├── middleware/
│   │   └── rbac.js                   # Role-based access control
│   │
│   ├── routes/                        # API route handlers
│   │   ├── auth.js                   # /api/auth
│   │   ├── users.js                  # /api/users
│   │   ├── jobs.js                   # /api/jobs
│   │   ├── skills.js                 # /api/skills
│   │   ├── applications.js           # /api/applications
│   │   ├── candidates.js             # /api/candidates
│   │   ├── analytics.js              # /api/analytics
│   │   ├── maintenance.js            # /api/maintenance
│   │   ├── interviews.js             # /api/interviews
│   │   ├── assessments.js            # /api/candidates/assessments
│   │   ├── recruiters.js             # /api/recruiters
│   │   └── chatbot.js                # /api/chatbot
│   │
│   └── sql/                          # SQL scripts
│       ├── create_email_queue.sql
│       ├── seed_gamification_data.sql
│       ├── seed_market_intelligence.sql
│       ├── seed_referral_data.sql
│       └── [Various fix/seed scripts]
│
├── DevelopmentGuide/                   # Developer documentation
│   ├── README.md
│   ├── Getting_Started.md
│   ├── Backend_Development.md
│   ├── Frontend_Development.md
│   ├── Database_Guide.md
│   ├── Best_Practices_and_Rules.md
│   └── Features_Inventory.md
│
├── ProjectResources/                  # Database & resources
│   ├── RecruitmentDB_MasterScript.sql # Full database creation
│   ├── NexHire Features Dictionary/
│   │   ├── Tables.tsv
│   │   ├── StoredProcedures.tsv
│   │   ├── Views.tsv
│   │   ├── CLRFunctions.tsv
│   │   └── FeaturesList.tsv
│   │
│   └── Database_Components_Seperated/
│       ├── NexHire_Tables.sql
│       ├── NexHire_Views.sql
│       ├── NexHire_Triggers.sql
│       └── NexHire_StoredProcedures/
│
├── docs/                              # Additional documentation
│   ├── model-selection-playbook.md
│   ├── runbook.md
│   └── token-optimization-guide.md
│
├── plans/                             # Implementation plans
│   ├── Document-Upload-Implementation-Plan.md
│   ├── NexHire-Design-System-Guide.md
│   ├── NexHire-Refactoring-Strategy.md
│   ├── Pipeline-Redesign-Specification.md
│   └── SQL-Views-Tab-Implementation-Plan.md
│
└── scripts/                           # Utility scripts
    ├── check_broken_view.js
    ├── check_procs.js
    ├── check_talent_pool.js
    ├── get_test_ids.js
    ├── get_view_def.js
    ├── query.js
    ├── update_view.js
    └── [Various diagnostic scripts]
```

---

## 4. System Architecture

### 4.1 Application Layers

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        NEXHIRE ARCHITECTURE                            │
└─────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────────┐
  │                      PRESENTATION LAYER                              │
  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
  │  │ Admin        │  │ Recruiter    │  │ Candidate    │              │
  │  │ Dashboard    │  │ Dashboard    │  │ Dashboard    │              │
  │  └──────────────┘  └──────────────┘  └──────────────┘              │
  │                                                                      │
  │  • React 19 + Vite                                                   │
  │  • Tailwind CSS 4 (Dark/Light Theme)                                 │
  │  • Recharts for visualizations                                      │
  │  • Lucide React Icons                                                │
  └─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
  ┌─────────────────────────────────────────────────────────────────────┐
  │                      API GATEWAY LAYER                               │
  │                                                                      │
  │  Express.js Server (Port 5000)                                      │
  │  • Route registration                                               │
  │  • CORS handling                                                    │
  │  • Request logging                                                  │
  │  • Error handling                                                   │
  │                                                                      │
  │  Endpoints:                                                         │
  │  /api/auth, /api/users, /api/jobs, /api/skills                      │
  │  /api/applications, /api/candidates, /api/analytics                 │
  │  /api/interviews, /api/recruiters, /api/chatbot                     │
  └─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
  ┌─────────────────────────────────────────────────────────────────────┐
  │                      BUSINESS LOGIC LAYER                            │
  │                                                                      │
  │  Route Handlers (server/routes/)                                    │
  │  • Authentication & Authorization                                     │
  │  • CRUD Operations                                                 │
  │  • Data Validation                                                 │
  │  • Business Rules                                                  │
  │                                                                      │
  │  Middleware (server/middleware/)                                    │
  │  • protect() - Authentication verification                          │
  │  • authorize(roles) - Role-based access control                     │
  └─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
  ┌─────────────────────────────────────────────────────────────────────┐
  │                      DATA ACCESS LAYER                               │
  │                                                                      │
  │  db.js - SQL Server Connection                                      │
  │  • msnodesqlv8 driver                                               │
  │  • Parameterized queries (SQL injection prevention)                │
  │                                                                      │
  │  Database Components:                                               │
  │  • Tables (55+)                                                     │
  │  • Views (27+)                                                      │
  │  • Stored Procedures (40+)                                         │
  │  • CLR Functions (15+)                                              │
  │  • Triggers                                                         │
  └─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
  ┌─────────────────────────────────────────────────────────────────────┐
  │                      DATABASE LAYER                                 │
  │                                                                      │
  │  SQL Server (RecruitmentDB)                                         │
  │  • Windows Authentication                                           │
  │  • CLR Assembly for:                                               │
  │    - Password Hashing (PBKDF2-SHA256)                               │
  │    - NLP (Skill Extraction, Sentiment Analysis)                     │
  │    - String Similarity (Cosine, Jaro-Winkler, Levenshtein)         │
  │    - Date Calculations (Business Days, Timezone Conversion)        │
  │    - Email Validation                                               │
  │    - PDF Text Extraction                                            │
  └─────────────────────────────────────────────────────────────────────┘
```

### 4.2 Request Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        REQUEST LIFECYCLE                                │
└─────────────────────────────────────────────────────────────────────────┘

  1. USER ACTION
     │
     ▼
  2. REACT COMPONENT
     │  - Uses useAuth() for user context
     │  - Calls API via Axios
     │  - Sets x-user-id, x-user-role headers
     ▼
  3. EXPRESS SERVER (server/index.js)
     │  - CORS validation
     │  - JSON parsing
     │  - Request logging
     ▼
  4. ROUTE HANDLER (server/routes/*.js)
     │  - Route matching
     │  - Parameter extraction
     ▼
  5. MIDDLEWARE (server/middleware/rbac.js)
     │  - protect() - Verifies authentication
     │  - authorize(roleIds) - Verifies permissions
     ▼
  6. BUSINESS LOGIC
     │  - Data validation
     │  - Stored procedure calls
     │  - Query execution
     ▼
  7. DATABASE (SQL Server)
     │  - Query parsing
     │  - Execution plan
     │  - Returns rows
     ▼
  8. RESPONSE
     - JSON serialization
     - Status code
     - Back to React component
     ▼
  9. UI UPDATE
     - State update
     - Re-render
```

### 4.3 Component Interactions

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     COMPONENT INTERACTIONS                             │
└─────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────────┐
  │                       App.jsx (Router)                               │
  │   • ProtectedRoute wrapper                                          │
  │   • Route: /login, /admin, /recruiter, /candidate                  │
  └─────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌─────────────────────────────────────────────────────────────────────┐
  │                    AuthContext.jsx                                  │
  │   • Manages user session state                                      │
  │   • Stores user in localStorage                                     │
  │   • Sets Axios default headers                                      │
  └─────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌─────────────────────────────────────────────────────────────────────┐
  │                    ThemeContext.jsx                                  │
  │   • Manages dark/light theme                                         │
  │   • Persists preference in localStorage                             │
  │   • Provides CSS variables                                          │
  └─────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌─────────────────────────────────────────────────────────────────────┐
  │              DashboardShell.jsx (Layout)                             │
  │   • Sidebar navigation                                              │
  │   • Header with theme toggle                                        │
  │   • Notification bell                                               │
  │   • User profile card                                               │
  │   • Chatbot widget                                                 │
  └─────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌─────────────────────────────────────────────────────────────────────┐
  │                    Page Components                                   │
  │   • AdminDashboard.jsx                                              │
  │   • RecruiterDashboard.jsx                                          │
  │   • CandidateDashboard.jsx                                          │
  │   │                                                                  │
  │   │  Each page:                                                     │
  │   │  • Defines navigation tabs                                      │
  │   │  • Manages activeTab state                                      │
  │   │  • Renders content based on activeTab                          │
  │   │  • Fetches data via useEffect                                   │
  └─────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌─────────────────────────────────────────────────────────────────────┐
  │                    Feature Components                               │
  │   • Jobs/*, Candidate/*, Recruiters/*, Admin/*                     │
  │   • Charts/*                                                        │
  │   • Shared/ChatbotWidget                                            │
  └─────────────────────────────────────────────────────────────────────┘
```

---

## 5. Database Schema

### 5.1 Core Tables

| Table | Purpose | Primary Key | Foreign Keys |
|-------|---------|-------------|--------------|
| `Users` | All system users | `UserID` | `RoleID → Roles` |
| `Roles` | Role definitions | `RoleID` | - |
| `Candidates` | Candidate profiles | `CandidateID` | `UserID → Users` |
| `Recruiters` | Recruiter profiles | `RecruiterID` | `UserID → Users` |
| `JobPostings` | Job listings | `JobID` | `CreatedBy → Users` |
| `Skills` | Master skill list | `SkillID` | - |
| `CandidateSkills` | Skills per candidate | `CandidateID, SkillID` | - |
| `JobSkills` | Skills required per job | `JobID, SkillID` | - |
| `Applications` | Job applications | `ApplicationID` | `JobID, CandidateID, StatusID` |
| `ApplicationStatus` | Status lookup | `StatusID` | - |
| `InterviewSchedules` | Scheduled interviews | `ScheduleID` | `ApplicationID` |
| `InterviewFeedback` | Interviewer scores | `FeedbackID` | `ApplicationID`, `InterviewerID → Users` |

### 5.2 Application Status State Machine

```
Applied(1) ──▶ Screening(2) ──▶ Interview(3) ──▶ Hired(4)
    │              │                │
    │              ▼                ▼
    │          Rejected(5)    Rejected(5)
    │
    └──────────▶ Withdrawn(6)
    
Also: Applied(1,2,3) ──▶ Invited(7)
```

### 5.3 Key Feature Tables

| Table | Purpose |
|-------|---------|
| `JobSalaryRanges` | Transparent salary ranges per job |
| `EmailQueue` | Outbound notification queue |
| `MicroAssessments` | Skill verification tests |
| `AssessmentAttempts` | Test attempt records |
| `SkillVerifications` | Verified skills |
| `SalaryBenchmarks` | Market salary data |
| `CandidateGamification` | Points, badges, leaderboards |
| `GamificationActions` | Points action definitions |
| `PersonalizedLearningPaths` | Learning recommendations |
| `CandidateLocationPreferences` | Location & remote preferences |
| `ConsentManagement` | GDPR consent tracking |
| `PushNotifications` | Push notification management |
| `ExternalPlatformSync` | LinkedIn/Indeed/Glassdoor sync |
| `GhostingPatterns` | Anti-ghosting risk tracking |
| `CommunicationLogs` | Communication tracking |
| `CareerPaths` | Career trajectory data |
| `RoleArchetypes` | Role categories |
| `ReferralNetwork` | Referral tracking |
| `NetworkStrength` | Connection strength |
| `ReferralPerformance` | Referrer metrics |
| `ChatbotInteractions` | Chatbot conversations |
| `CandidateSentiment` | Sentiment tracking |
| `DiversityGoals` | DEI goals |
| `BiasDetectionLogs` | Bias detection events |
| `OnboardingPredictions` | Onboarding success predictions |
| `BlockchainVerifications` | Credential verifications |
| `BackgroundChecks` | Background check records |
| `ResumeInsights` | Resume analysis |
| `RemoteCompatibility` | Remote work scores |
| `InterviewTranscriptions` | Interview transcripts |
| `AI_GeneratedQuestions` | Interview questions |
| `ScreeningBotDecisions` | Screening decisions |
| `CandidateRankingHistory` | Ranking audit trail |
| `ApplicationStatusHistory` | Status transitions |
| `AI_Predictions` | AI predictions storage |

### 5.4 Database Views (27+)

| View | Purpose |
|------|---------|
| `vw_ApplicationFunnel` | Funnel analysis by status |
| `vw_VacancyUtilization` | Filled vs total vacancies |
| `vw_SilentRejections` | Inactive applications |
| `vw_GhostingRiskDashboard` | Ghosting risk scores |
| `vw_CandidateInterviews` | Candidate's interviews |
| `vw_SkillVerificationStatus` | Skill verification status |
| `vw_CandidateMatchScore` | Match score breakdown |
| `vw_TimeToHire` | Hiring timeline |
| `vw_AverageTimeToHire` | Global average time-to-hire |
| `vw_RecruiterPerformance` | Recruiter metrics |
| `vw_Bias_Location` | Bias by location |
| `vw_Bias_Experience` | Bias by experience |
| `vw_SkillGapAnalysis` | Skills gap analysis |
| `vw_CandidateEngagement` | Engagement metrics |
| `vw_HiringBottlenecks` | Stage duration |
| `vw_RejectionAnalysis` | Rejection reasons |
| `vw_MarketIntelligenceDashboard` | Market data |
| `vw_DiversityAnalyticsFunnel` | DEI funnel |
| `vw_DiversityByGender` | Gender diversity |
| `vw_DiversityByDisability` | Disability diversity |
| `vw_DiversityByVeteran` | Veteran diversity |
| `vw_SalaryTransparency` | Salary transparency |
| `vw_CareerPathInsights` | Career insights |
| `vw_ReferralIntelligence` | Referral analytics |
| `vw_RemoteCompatibilityMatrix` | Remote compatibility |

### 5.5 Stored Procedures (40+)

| Procedure | Purpose |
|-----------|---------|
| `sp_UpdateApplicationStatus` | Move through status machine |
| `sp_HireCandidate` | Atomic hire with concurrency |
| `sp_RejectCandidate` | Reject with reason |
| `sp_WithdrawApplication` | Candidate withdrawal |
| `sp_AdvancedCandidateMatchingEnhanced` | Skill + experience matching |
| `sp_AutoScreenApplicationEnhanced` | Automated screening |
| `sp_AutoRejectUnqualified` | Batch auto-reject |
| `sp_ScheduleInterviewWithTimezone` | Timezone-aware scheduling |
| `sp_ConfirmInterview` | Interview confirmation |
| `sp_AwardGamificationPoints` | Points/badges award |
| `sp_GenerateLearningPath` | Personalized learning |
| `sp_GenerateInterviewPrep` | Interview prep materials |
| `sp_GenerateNegotiationStrategy` | Salary negotiation |
| `sp_PredictGhostingRisk` | Ghosting prediction |
| `sp_PredictHireSuccess` | Hiring success prediction |
| `sp_FuzzySearchCandidates` | Fuzzy name search |
| `sp_GetMaskedCandidateData` | PII masking |
| `sp_ArchiveOldData` | Data archival |
| `sp_TimeToHireReport` | Hiring metrics |
| `sp_GenerateMarketAlerts` | Market alerts |
| `sp_SuggestReferrals` | Referral suggestions |
| `sp_SaveCandidateRanking` | Ranking history |
| `sp_PredictCareerPath` | Career trajectory |
| `sp_AnalyzeCandidateSentiment` | Sentiment analysis |
| `sp_GenerateInterviewQuestions` | AI questions |
| `sp_OptimizeInterviewRounds` | Round optimization |
| `sp_PredictOnboardingSuccess` | Onboarding prediction |

### 5.6 CLR Functions (15+)

| Category | Function | Purpose |
|----------|----------|---------|
| **Security** | `HashPassword` | PBKDF2-SHA256 hashing |
| **Security** | `VerifyPassword` | Password verification |
| **Security** | `GenerateSecureToken` | Session tokens |
| **Security** | `EncryptSensitiveData` | AES-256 encryption |
| **NLP** | `ExtractSkills` | Skill extraction from resume |
| **NLP** | `ExtractYearsOfExperience` | Experience extraction |
| **NLP** | `CalculateSentiment` | Sentiment scoring |
| **String** | `CosineSimilarity` | Semantic matching |
| **String** | `JaroWinklerSimilarity` | Fuzzy matching |
| **String** | `LevenshteinDistance` | Edit distance |
| **Date** | `CalculateBusinessDays` | Business day calculation |
| **Date** | `ConvertTimezone` | DST-aware conversion |
| **Email** | `ValidateEmail` | RFC-5322 validation |
| **Doc** | `ExtractTextFromPDF` | PDF text extraction |
| **Stats** | `CorrelationCoefficient` | Pearson correlation |

---

## 6. API Documentation

### 6.1 Authentication (`/api/auth`)

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/login` | Public | Authenticate user, returns user object |
| POST | `/register` | Public | Register new candidate |

### 6.2 Users (`/api/users`)

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/` | Admin | Get all users |
| GET | `/:id` | Private | Get user by ID |
| POST | `/` | Public | Create user |
| PUT | `/:id` | Private | Update user |
| DELETE | `/:id` | Admin | Deactivate user |

### 6.3 Jobs (`/api/jobs`)

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/` | Recruiter | Get all active jobs |
| POST | `/` | Recruiter | Create job posting |
| GET | `/:id` | Recruiter | Get job details |
| PUT | `/:id` | Recruiter | Update job |
| DELETE | `/:id` | Recruiter | Soft-delete job |
| GET | `/:id/matches` | Recruiter | Get matched candidates |

### 6.4 Applications (`/api/applications`)

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/` | Private | Get applications |
| PUT | `/:id/status` | Recruiter | Update status |
| POST | `/:id/hire` | Recruiter | Hire candidate |
| GET | `/:id/history` | Private | Status history |
| POST | `/auto-reject` | Recruiter | Run auto-reject |
| GET | `/auto-rejected` | Recruiter | List auto-rejected |

### 6.5 Candidates (`/api/candidates`)

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/discover` | Candidate | Discover jobs |
| GET | `/matches` | Candidate | Matched jobs |
| GET | `/applications` | Candidate | Own applications |
| GET | `/skills` | Candidate | Own skills |
| GET | `/interviews` | Candidate | Scheduled interviews |
| POST | `/apply` | Candidate | Apply for job |
| POST | `/withdraw` | Candidate | Withdraw application |
| POST | `/skills` | Candidate | Add skill |
| GET | `/career-path` | Candidate | Career insights |
| POST | `/career-path/simulate` | Candidate | Simulate career |
| POST | `/learning-path` | Candidate | Generate learning path |
| GET | `/leaderboard` | Candidate | Gamification data |
| POST | `/gamification/daily-login` | Candidate | Daily login |
| GET | `/interview-prep` | Candidate | Interview prep |
| POST | `/interview-prep/generate` | Candidate | Generate prep |
| GET | `/salary-coach` | Candidate | Salary benchmarks |
| POST | `/salary-coach/negotiate` | Candidate | Negotiation strategy |
| GET | `/location-preferences` | Candidate | Location prefs |
| POST | `/location-preferences` | Candidate | Save prefs |
| GET | `/resume-score` | Candidate | Resume quality |
| GET | `/invitations` | Candidate | Pending invites |
| POST | `/invitations/:id/respond` | Candidate | Respond to invite |
| GET | `/notifications` | Candidate | Notifications |
| POST | `/notifications/register-device` | Candidate | Register device |
| GET | `/skill-gap-analysis` | Candidate | Skill gaps |
| GET | `/profile` | Candidate | Get profile |
| PUT | `/profile` | Candidate | Update profile |
| PUT | `/profile/consent` | Candidate | Update consent |

### 6.6 Recruiters (`/api/recruiters`)

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/talent-pool` | Recruiter | All candidates |
| POST | `/talent-pool/invite` | Recruiter | Invite candidates |
| POST | `/search` | Recruiter | Search candidates |
| POST | `/initiate-pipeline` | Recruiter | Invite to pipeline |
| GET | `/engagement` | Recruiter | Engagement scoring |
| GET | `/platform-sync` | Recruiter | Platform sync status |
| POST | `/screening/run` | Recruiter | Run screening |
| GET | `/screening/decisions` | Recruiter | Get decisions |
| POST | `/screening/override` | Recruiter | Override decision |
| GET | `/market-alerts` | Recruiter | Market alerts |
| GET | `/candidate-profile/:id` | Recruiter | Full profile |
| GET | `/referral-intelligence` | Recruiter | Referral analytics |
| GET | `/referral-suggestions/:jobId` | Recruiter | AI suggestions |
| GET | `/ranking-history/:candidateId` | Recruiter | Ranking history |
| POST | `/ranking-history` | Recruiter | Save ranking |
| POST | `/send-reminder` | Recruiter | Send reminder |
| GET | `/background-checks/:candidateId` | Recruiter | Background checks |
| POST | `/background-checks` | Recruiter | Initiate check |
| GET | `/blockchain-verifications/:candidateId` | Recruiter | Blockchain vrfy |
| POST | `/blockchain-verifications` | Recruiter | Submit for vrfy |

### 6.7 Interviews (`/api/interviews`)

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/schedule` | Recruiter | Schedule interview |
| GET | `/` | Recruiter | Get interviews |
| POST | `/feedback` | Recruiter | Submit feedback |
| GET | `/feedback/:applicationId` | Recruiter | Get feedback |
| POST | `/transcription` | Recruiter | Create transcription |
| GET | `/transcription/:scheduleId` | Recruiter | Get transcription |
| POST | `/generate-questions` | Recruiter | Generate questions |
| GET | `/generated-questions/:jobId` | Recruiter | Get questions |
| POST | `/optimize-rounds` | Recruiter | Optimize rounds |

### 6.8 Analytics (`/api/analytics`)

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/stats` | Recruiter | Hero stats |
| GET | `/funnel` | Recruiter | Application funnel |
| GET | `/diversity` | Public | Diversity by ethnicity |
| GET | `/diversity-gender` | Public | Diversity by gender |
| GET | `/diversity-disability` | Public | Diversity by disability |
| GET | `/diversity-veteran` | Public | Diversity by veteran |
| GET | `/market` | Public | Market intelligence |
| GET | `/salary-transparency` | Public | Salary transparency |
| GET | `/time-to-hire-detail` | Recruiter | Hiring timeline |
| POST | `/predict-hire-success` | Recruiter | Predict success |
| GET | `/remote-compatibility` | Admin | Remote compatibility |
| GET | `/interviewer-consistency` | Admin | Interviewer bias |
| GET | `/sentiment-trends` | Recruiter | Sentiment trends |
| GET | `/diversity-goals` | Recruiter | DEI goals |
| POST | `/diversity-goals` | Recruiter | Create goal |
| GET | `/bias-logs` | Recruiter | Bias detection |
| PUT | `/bias-logs/:id/resolve` | Admin | Resolve bias |
| POST | `/predict-onboarding-success` | Recruiter | Predict onboarding |
| GET | `/consent-status` | Admin | GDPR consent |
| GET | `/ghosting-detail` | Recruiter | Ghosting risk |

### 6.9 Maintenance (`/api/maintenance`)

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/email-queue` | Admin | Email queue |
| PUT | `/email-queue/:id/retry` | Admin | Retry email |
| DELETE | `/email-queue/:id` | Admin | Delete email |
| POST | `/email-queue/send-test` | Admin | Send test |
| GET | `/sql-views` | Public | List views |
| GET | `/sql-views/:viewName` | Public | Query view |

### 6.10 Chatbot (`/api/chatbot`)

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/message` | Private | Send message |
| POST | `/feedback` | Private | Submit feedback |
| GET | `/history` | Private | Get history |
| GET | `/faq` | Public | Get FAQs |

---

## 7. Frontend Components

### 7.1 Page Components

| Component | File | Description |
|-----------|------|-------------|
| LandingPage | `pages/LandingPage.jsx` | Public marketing page |
| LoginPage | `pages/LoginPage.jsx` | Authentication with role-based redirect |
| AdminDashboard | `pages/AdminDashboard.jsx` | Full admin control panel |
| RecruiterDashboard | `pages/RecruiterDashboard.jsx` | Recruiter workspace |
| CandidateDashboard | `pages/CandidateDashboard.jsx` | Candidate portal |
| DesignSystemPage | `pages/DesignSystemPage.jsx` | UI component showcase |

### 7.2 Shared Components

| Component | File | Description |
|-----------|------|-------------|
| DashboardShell | `components/DashboardShell.jsx` | Layout wrapper with sidebar, header |
| ChatbotWidget | `components/shared/ChatbotWidget.jsx` | AI assistant |

### 7.3 Context Providers

| Context | File | Purpose |
|---------|------|---------|
| AuthContext | `context/AuthContext.jsx` | User session, login/logout |
| ThemeContext | `context/ThemeContext.jsx` | Dark/light mode toggle |

### 7.4 Admin Components

| Component | Description |
|-----------|-------------|
| BiasLogs | Bias detection event logs |
| ConsentManagement | GDPR consent tracking |
| DiversityGoals | DEI goal management |
| EmailQueueManager | Email notification queue |
| RecruiterPerformanceAdmin | Recruiter metrics |
| RemoteWorkAnalytics | Remote compatibility data |
| SalaryTransparencyAnalytics | Compensation analysis |
| SQLViews | Database view explorer |
| VacancyUtilizationAdmin | Vacancy fill rates |

### 7.5 Candidate Components

| Component | Description |
|-----------|-------------|
| AssessmentTestingEngine | Interactive skill tests |
| CandidateApplications | Application management |
| CandidateInterviews | Interview schedules |
| CandidateSkillsVerification | Skill verification status |
| CareerPath | Career progression insights |
| CareerPathSimulator | Career transition simulation |
| InterviewPrep | Interview preparation |
| Leaderboard | Gamification rankings |
| LearningPaths | Personalized learning |
| LocationPreferences | Location settings |
| ProfileManagement | Profile editing & consent |
| PushNotifications | Notification management |
| ResumeScore | Resume quality analysis |
| SalaryCoach | Salary negotiation |
| SentimentTracker | Communication sentiment |
| SkillGapAnalysis | Skills gap identification |
| SkillManagementModal | Skill CRUD |

### 7.6 Job Components

| Component | Description |
|-----------|-------------|
| ApplicationPipeline | Kanban board |
| CandidateMatches | Matched candidates list |
| JobCard | Job posting card |
| JobEditModal | Edit job form |
| JobList | Job grid with search |
| JobMatchingView | Matching interface |
| JobModal | Job detail modal |
| RejectionReasonModal | Rejection reason form |
| ScheduleInterviewModal | Interview scheduler |
| SkillMatrix | Skills visualization |

### 7.7 Recruiter Components

| Component | Description |
|-----------|-------------|
| AdvancedAnalytics | Analytics dashboard |
| AutoRejectionLog | Auto-reject management |
| BackgroundChecks | Background verification |
| BiasAnalytics | Bias detection |
| CandidateEngagement | Engagement scoring |
| CandidateProfileModal | Full candidate profile |
| ExternalPlatformSync | LinkedIn sync |
| GhostingRiskDetail | Ghosting analysis |
| HireAnalytics | Hiring metrics |
| HireSuccessPredictor | Success prediction |
| InterviewFatigueReducer | Round optimization |
| InterviewFeedback | Score submission |
| InterviewQuestionsGenerator | AI question generation |
| InterviewTranscription | Transcript analysis |
| MarketAlerts | Market intelligence |
| OnboardingSuccessPredictor | Onboarding prediction |
| RankingHistory | Score tracking |
| ReferralIntelligence | Referral network |
| ScreeningBot | Automated screening |
| SkillVerificationStatus | Skill verification |
| TalentPool | Candidate pool |
| TimeToHireDetail | Timeline metrics |
| VideoInterviews | Video interview management |

### 7.8 Chart Components

| Component | Description |
|-----------|-------------|
| BiasAnalysisChart | Bias visualization |
| DiversityChart | DEI funnel |
| EngagementTrendChart | Engagement over time |
| HireRatePerJobChart | Conversion rates |
| HiringFunnelChart | Application funnel |
| InterviewerPerformanceChart | Scoring consistency |
| MarketIntelligenceChart | Market trends |
| RecruiterLeaderboardChart | Performance rankings |
| ReferralIntelChart | Referral metrics |
| RejectionAnalysisChart | Rejection reasons |
| RemoteWorkChart | Remote compatibility |
| SalaryRangeChart | Salary benchmarks |
| SentimentChart | Sentiment trends |
| SkillGapChart | Skills gap |
| VacancyUtilizationChart | Fill rates |

---

## 8. Business Logic & Workflows

### 8.1 User Authentication Flow

```
1. User enters credentials on LoginPage
2. axios.post(`${API_BASE}/auth/login`, { username, password })
3. Server validates:
   a. User exists and is active
   b. Password hash verification (or dev bypass)
4. Returns user object: { UserID, Username, RoleID }
5. AuthContext stores in localStorage as 'nexhire_user'
6. Axios headers set: x-user-id, x-user-role
7. Redirect based on RoleID:
   - 1 → /admin
   - 2 → /recruiter
   - 3 → /candidate
```

### 8.2 Application Status Workflow

```
1. Candidate applies (POST /api/candidates/apply)
   └─ Creates Application with StatusID = 1 (Applied)

2. Recruiter screens (POST /api/applications/:id/status)
   └─ StatusID → 2 (Screening)
   
3. Auto-screening runs (POST /api/recruiters/screening/run)
   └─ ScreeningBotDecisions created
   └─ Can advance to Interview or reject

4. Interview scheduled (POST /api/interviews/schedule)
   └─ InterviewSchedules created
   
5. Interview feedback (POST /api/interviews/feedback)
   └─ InterviewFeedback created
   
6. Final decision:
   └─ Hire: POST /api/applications/:id/hire → StatusID = 4
   └─ Reject: PUT /api/applications/:id/status → StatusID = 5
```

### 8.3 Candidate Matching Algorithm

```
1. Job required skills fetched (JobSkills)
2. Candidate skills fetched (CandidateSkills)
3. For each job skill:
   - Check if candidate has skill
   - Compare proficiency levels
   - Calculate match score
4. Additional factors:
   - Experience years match
   - Location preference alignment
5. Final score = weighted average
   - Skill match: 50%
   - Experience: 30%
   - Location: 20%
```

### 8.4 Gamification System

```
Points Awarded For:
├── Daily login: +10 points
├── Profile completion: +50 points
├── Skill verified: +30 points
├── Application submitted: +20 points
├── Interview completed: +40 points
└── Hired: +100 points

Badges:
├── "Rising Star" - 100 points
├── "Skill Master" - Verified 5 skills
├── "Interview Pro" - 10 interviews
└── "Hired!" - First hire
```

### 8.5 Bias Detection

```
Detection Types:
├── Bias_Location - Geographic bias
├── Bias_Experience - Experience level bias
├── Bias_Gender - Gender bias
├── Bias_Age - Age bias
└── Bias_Education - Education bias

Metrics:
├── Hiring rate by demographic
├── Interview-to-offer ratio
├── Rejection reason analysis
└── Score variance by recruiter
```

---

## 9. Configuration & Environment Variables

### 9.1 Server Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 5000 | Server port |
| `NODE_ENV` | development | Environment |
| `DB_CONNECTION_STRING` | - | SQL Server connection |

### 9.2 Database Connection String Format

```
Driver={SQL Server Native Client 11.0};Server=SERVER_NAME;Database=RecruitmentDB;Trusted_Connection=Yes;
```

Or with SQL authentication:
```
Driver={SQL Server Native Client 11.0};Server=SERVER_NAME;Database=RecruitmentDB;User Id=USERNAME;Password=PASSWORD;
```

### 9.3 Client Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `API_BASE` | http://localhost:5001/api | Backend URL |

---

## 10. Authentication & Authorization

### 10.1 Authentication System

```
Authentication Methods:
1. Development Mode: Empty password bypass
2. Production: Password hash verification via CLR

Session Management:
- localStorage: 'nexhire_user' (UserID, Username, RoleID)
- Axios Headers: x-user-id, x-user-role
- Backend: populate req.user from headers
```

### 10.2 Role-Based Access Control (RBAC)

```
Middleware: server/middleware/rbac.js

protect(req, res, next)
├── Verifies x-user-id header exists
└── Populates req.user object

authorize(allowedRoles)
├── Checks user.RoleID in allowedRoles
├── Returns 403 if not authorized
└── Allows access if role matches
```

### 10.3 Role Permissions

| Permission | Admin (1) | Recruiter (2) | Candidate (3) |
|------------|-----------|---------------|---------------|
| View all jobs | ✓ | Own only | All active |
| Create jobs | ✓ | ✓ | ✗ |
| Edit jobs | ✓ | Own only | ✗ |
| Delete jobs | ✓ | ✗ | ✗ |
| View candidates | ✓ | ✓ | Self only |
| Screen candidates | ✓ | ✓ | ✗ |
| Schedule interviews | ✓ | ✓ | ✗ |
| Submit feedback | ✓ | ✓ | ✗ |
| Hire candidates | ✓ | ✓ | ✗ |
| View analytics | ✓ | Limited | Limited |
| Manage users | ✓ | ✗ | ✗ |
| View all data | ✓ | ✗ | ✗ |

---

## 11. Security Considerations

### 11.1 Password Security

- **Hashing**: PBKDF2-SHA256 via CLR function `HashPassword`
- **Verification**: CLR function `VerifyPassword`
- **Dev Bypass**: Empty password allowed in development only

### 11.2 SQL Injection Prevention

- All queries use parameterized queries with `?` placeholders
- No string interpolation of user input into SQL

### 11.3 Data Masking

- `sp_GetMaskedCandidateData` returns PII-masked data based on role
- GDPR compliance via ConsentManagement table

### 11.4 Input Validation

- Required field validation on all endpoints
- Data type validation
- Length limits

---

## 12. Build & Deployment

### 12.1 Installation

```bash
# Clone repository
git clone <repo-url>
cd NexHire-Frontend

# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 12.2 Running Development

```bash
# Run both server and client concurrently
npm run dev

# Or run separately:
# Terminal 1 - Backend
cd server
npm run dev  # or: node index.js

# Terminal 2 - Frontend
cd client
npm run dev  # Runs on http://localhost:5173
```

### 12.3 Production Build

```bash
# Build client
npm run build

# Start server
npm start
```

### 12.4 Database Setup

1. Install SQL Server
2. Run `ProjectResources/RecruitmentDB_MasterScript.sql`
3. Configure connection string in `server/.env`

---

## 13. Testing

### 13.1 Available Test Scripts

| Script | Purpose |
|--------|---------|
| `check_broken_view.js` | Verify database views |
| `check_procs.js` | Verify stored procedures |
| `check_talent_pool.js` | Test talent pool endpoint |
| `get_test_ids.js` | Get test data IDs |
| `get_view_def.js` | View definition lookup |
| `query.js` | Ad-hoc SQL queries |
| `update_view.js` | Update view data |

### 13.2 Health Check

```bash
GET http://localhost:5000/api/status
```

Response:
```json
{
  "status": "online",
  "database": "connected",
  "serverTime": "2026-03-10T00:00:00.000Z",
  "environment": "development"
}
```

---

## 14. Extension Guide

### 14.1 Adding a New API Endpoint

**Step 1**: Create or find route file in `server/routes/`

**Step 2**: Add endpoint:
```javascript
router.get('/new-feature', protect, async (req, res) => {
    try {
        const rows = await query(`SELECT * FROM YourTable`);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch." });
    }
});
```

**Step 3**: Register in `server/index.js`:
```javascript
const newRoutes = require('./routes/newfeature');
app.use('/api/newfeature', newRoutes);
```

### 14.2 Adding a New Dashboard Tab

**Step 1**: Add navigation item to page:
```javascript
const navigation = [
    { label: 'New Tab', icon: NewIcon, id: 'newTab' },
    // ...
];
```

**Step 2**: Add case in render:
```javascript
case 'newTab':
    return <NewFeatureComponent />;
```

**Step 3**: Add useEffect for data fetching:
```javascript
useEffect(() => {
    if (activeTab === 'newTab') {
        fetchData();
    }
}, [activeTab]);
```

### 14.3 Adding a New Database Table

**Step 1**: Create table in SQL:
```sql
CREATE TABLE NewFeature (
    ID INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE()
);
```

**Step 2**: Add to MasterScript or create migration

**Step 3**: Add corresponding route handlers

### 14.4 Styling Conventions

```
Glass Cards:
className="glass-card rounded-[3rem] p-10"

Theme Colors:
text-[var(--text-primary)]
text-[var(--text-muted)]
bg-[var(--bg-accent)]

Labels:
text-[10px] font-black uppercase tracking-widest
```

---

## 15. Features Inventory

### 15.1 Core Features

| Feature | Status | Implementation |
|---------|--------|----------------|
| User Authentication | ✓ | auth.js + AuthContext |
| Role-Based Access | ✓ | rbac.js middleware |
| Job CRUD | ✓ | jobs.js routes |
| Application Management | ✓ | applications.js routes |
| Interview Scheduling | ✓ | interviews.js routes |
| Candidate Profiles | ✓ | candidates.js routes |

### 15.2 Advanced Features

| Feature | Status | Implementation |
|---------|--------|----------------|
| AI Screening Bot | ✓ | ScreeningBot component |
| Candidate Matching | ✓ | sp_AdvancedCandidateMatching |
| Diversity Analytics | ✓ | vw_Diversity* views |
| Bias Detection | ✓ | BiasLogs + Analytics |
| Salary Transparency | ✓ | JobSalaryRanges table |
| Remote Work Scoring | ✓ | RemoteCompatibility |
| Referral Intelligence | ✓ | ReferralNetwork + sp_SuggestReferrals |
| Hiring Prediction | ✓ | sp_PredictHireSuccess |
| Onboarding Prediction | ✓ | sp_PredictOnboardingSuccess |
| Career Path Simulation | ✓ | sp_PredictCareerPath |
| Gamification | ✓ | CandidateGamification |
| Skill Gap Analysis | ✓ | vw_SkillGapAnalysis |
| Chatbot Assistant | ✓ | ChatbotWidget + chatbot.js |
| Background Checks | ✓ | BackgroundChecks component |
| Blockchain Verification | ✓ | BlockchainVerifications |
| Email Queue | ✓ | EmailQueue + EmailQueueManager |

### 15.3 Analytics & Reporting

| Feature | Status | Implementation |
|---------|--------|----------------|
| Hiring Funnel | ✓ | vw_ApplicationFunnel |
| Time to Hire | ✓ | vw_TimeToHire |
| Recruiter Performance | ✓ | vw_RecruiterPerformance |
| Market Intelligence | ✓ | vw_MarketIntelligenceDashboard |
| Engagement Trends | ✓ | vw_CandidateEngagement |
| Rejection Analysis | ✓ | vw_RejectionAnalysis |
| Sentiment Tracking | ✓ | CandidateSentiment |

---

## Appendix: Known Pitfalls

| Table | Common Mistake | Correct Column |
|-------|----------------|----------------|
| PushNotifications | Using CandidateID | UserID |
| PushNotifications | Using Message | Body |
| PushNotifications | Using IsRead | ReadAt |
| Applications | Using UserID | CandidateID |
| InterviewFeedback | InterviewerID = RecruiterID | InterviewerID = UserID |

---

*End of Documentation*
