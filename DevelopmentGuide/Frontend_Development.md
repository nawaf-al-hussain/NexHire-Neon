# Frontend Development

## 1. How to Add a New Feature

### Step 1 — Use API_BASE
```js
import API_BASE from '../../apiConfig'; 
import axios from 'axios';
const res = await axios.get(`${API_BASE}/yourroute`);
```

### Step 2 — Use AuthContext
```js
import { useAuth } from '../../context/AuthContext';
const { user } = useAuth(); // UserID, RoleID, Username
```

### Step 3 — Adding a tab to a dashboard
Each dashboard uses an `activeTab` state and a navigation array:
1. Add the tab object to the nav array.
2. Add a `case` in `renderMainContent()`.
3. Fetch data inside a `useEffect` keyed to `activeTab`.

### Step 4 — Styling Conventions
- **Glass cards:** `className="glass-card rounded-[3rem] p-10"`
- **Theme-aware text:** `text-[var(--text-primary)]`, `text-[var(--text-muted)]`
- **Labels:** `text-[10px] font-black uppercase tracking-widest`
- **Icons:** `lucide-react` only.
- **NO inline colors** — always use CSS variables.

---

## 2. Frontend Component Inventory

| Component | File | Purpose |
|---|---|---|
| `DashboardShell` | `components/DashboardShell.jsx` | Shared layout (sidebar, header, theme) |
| `JobList` | `components/Jobs/JobList.jsx` | Recruiter's job posting grid with gradient header, Post Job button, search bar with Auto Rejection & Screening Bot icon buttons, Archives button
| `JobCard` | `components/Jobs/JobCard.jsx` | Individual job card display |
| `JobModal` | `components/Jobs/JobModal.jsx` | Job detail modal |
| `JobEditModal` | `components/Jobs/JobEditModal.jsx` | Edit job posting modal |
| `JobMatchingView` | `components/Jobs/JobMatchingView.jsx` | Candidate-job matching view |
| `CandidateMatches` | `components/Jobs/CandidateMatches.jsx` | Matched candidates list |
| `ApplicationPipeline` | `components/Jobs/ApplicationPipeline.jsx` | Kanban pipeline for applications |
| `ScheduleInterviewModal`| `components/Jobs/ScheduleInterviewModal.jsx`| Interview date/time picker |
| `SkillMatrix` | `components/Jobs/SkillMatrix.jsx` | Skills visualization matrix |
| `CandidateApplications` | `components/Candidate/CandidateApplications.jsx`| Candidate's applications |
| `CandidateInterviews` | `components/Candidate/CandidateInterviews.jsx` | Candidate's scheduled interviews |
| `CandidateSkillsVerification` | `components/Candidate/CandidateSkillsVerification.jsx` | Skill verification status |
| `AssessmentTestingEngine`| `components/Candidate/AssessmentTestingEngine.jsx`| Interactive assessment UI |
| `CareerPath` | `components/Candidate/CareerPath.jsx` | Career progression insights |
| `CareerPathSimulator` | `components/Candidate/CareerPathSimulator.jsx` | Modal for simulating career transitions with probability, salary increase, and development plan |
| `LearningPaths` | `components/Candidate/LearningPaths.jsx` | Learning recommendations |
| `Leaderboard` | `components/Candidate/Leaderboard.jsx` | Gamification & achievements (includes global rankings) |
| `InterviewPrep` | `components/Candidate/InterviewPrep.jsx` | Interview preparation materials |
| `SalaryCoach` | `components/Candidate/SalaryCoach.jsx` | Salary negotiation coaching |
| `ResumeScore` | `components/Candidate/ResumeScore.jsx` | Resume quality analysis - shows empty state "No Resume Data Available" when no resume uploaded |
| `LocationPreferences` | `components/Candidate/LocationPreferences.jsx` | Location & remote work preferences |
| `ProfileManagement` | `components/Candidate/ProfileManagement.jsx` | Candidate profile management with privacy & consent settings |
| `PushNotifications` | `components/Candidate/PushNotifications.jsx` | Push notification management |
| `SkillGapAnalysis` | `components/Candidate/SkillGapAnalysis.jsx` | Personalized skill gap analysis |
| `SkillManagementModal` | `components/Candidate/SkillManagementModal.jsx` | Add/edit skills modal |
| `AdvancedAnalytics` | `components/Recruiters/AdvancedAnalytics.jsx` | Advanced analytics dashboard |
| `BiasAnalytics` | `components/Recruiters/BiasAnalytics.jsx` | Bias detection analytics |
| `HireAnalytics` | `components/Recruiters/HireAnalytics.jsx` | Hiring metrics & analytics |
| `TalentPool` | `components/Recruiters/TalentPool.jsx` | Candidate talent pool with fuzzy search - shows YearsOfExperience and ResumeScore from ResumeInsights table (shows N/A when no data) |
| `SkillVerificationStatus` | `components/Recruiters/SkillVerificationStatus.jsx` | Skill verification management |
| `ScreeningBot` | `components/Recruiters/ScreeningBot.jsx` | Automated screening bot with run, decisions, override, advance, reject actions |
| `VideoInterviews` | `components/Recruiters/VideoInterviews.jsx` | Video interview management with feedback & transcription |
| `InterviewFeedback` | `components/Recruiters/InterviewFeedback.jsx` | Modal form for submitting interview scores (Technical, Communication, Culture Fit) |
| `InterviewTranscription` | `components/Recruiters/InterviewTranscription.jsx` | Interview transcription & AI analysis (topics, sentiment, filler words, action items) |
| `GhostingRiskDetail` | `components/Recruiters/GhostingRiskDetail.jsx` | Ghosting risk analysis |
| `TimeToHireDetail` | `components/Recruiters/TimeToHireDetail.jsx` | Time to hire metrics (shows CandidateName, JobTitle, AppliedDate, HiredDate, DaysToHire, Source) |
| `BackgroundChecks` | `components/Recruiters/BackgroundChecks.jsx` | Background check management with dashboard, initiate checks, update status, view results. Supports Criminal, Education, Employment, Credit, Reference, Drug check types with risk scoring. |
| `CandidateEngagement` | `components/Recruiters/CandidateEngagement.jsx` | Candidate engagement scoring |
| `ExternalPlatformSync` | `components/Recruiters/ExternalPlatformSync.jsx` | LinkedIn/Indeed/Glassdoor sync |
| `MarketAlerts` | `components/Recruiters/MarketAlerts.jsx` | Personalized market intelligence alerts (Salary, Demand, Competitor alerts with severity levels) |
| `CandidateProfileModal` | `components/Recruiters/CandidateProfileModal.jsx` | Multi-tab candidate profile modal (Overview, Skills, AI Insights, History) with resume score, engagement rate, ghosting risk, remote compatibility |
| `ReferralIntelligence` | `components/Recruiters/ReferralIntelligence.jsx` | Referral network analytics dashboard with 5 tabs: Overview (summary stats, outcome breakdown), Top Referrers (leaderboard), Recent Referrals (table), Network Analysis (connection strength), AI Suggestions (job-specific referral recommendations via sp_SuggestReferrals) |
| `RankingHistory` | `components/Recruiters/RankingHistory.jsx` | Candidate ranking history with timeline view, line/bar charts, trend analysis (improving/declining/stable) |
| `HireSuccessPredictor` | `components/Recruiters/HireSuccessPredictor.jsx` | Rules-Based AI for predicting candidate hiring success probability with factor breakdown |
| `ConsentManagement` | `components/Admin/ConsentManagement.jsx` | GDPR consent management |
| `RecruiterPerformanceAdmin` | `components/Admin/RecruiterPerformanceAdmin.jsx` | Recruiter performance metrics |
| `VacancyUtilizationAdmin` | `components/Admin/VacancyUtilizationAdmin.jsx` | Vacancy utilization analytics |
| `SalaryTransparencyAnalytics` | `components/Admin/SalaryTransparencyAnalytics.jsx` | Salary transparency analytics with pie/bar charts showing correlation between salary disclosure and application volume |
| `RemoteWorkAnalytics` | `components/Admin/RemoteWorkAnalytics.jsx` | Remote work compatibility analytics with summary stats, factor averages, match distribution, and detailed assessment table |
| `DiversityGoals` | `components/Admin/DiversityGoals.jsx` | Diversity goal management with create, view, progress tracking |
| `BiasLogs` | `components/Admin/BiasLogs.jsx` | Bias detection logs with severity levels, resolve functionality |
| `AutoRejectionLog` | `components/Recruiters/AutoRejectionLog.jsx` | Instant auto-rejection management with batch run, view auto-rejected candidates |
| `EmailQueueManager` | `components/Admin/EmailQueueManager.jsx` | Email notification queue management with stats, filters, and actions (retry, delete) |
| `SentimentTracker` | `components/Candidate/SentimentTracker.jsx` | Candidate sentiment tracking with history, trends, and at-risk indicators |
| `OnboardingSuccessPredictor` | `components/Recruiters/OnboardingSuccessPredictor.jsx` | Onboarding success prediction with risk factors and recommendations |
| `InterviewQuestionsGenerator` | `components/Recruiters/InterviewQuestionsGenerator.jsx` | AI interview question generator with skill-based questions and difficulty levels |
| `InterviewFatigueReducer` | `components/Recruiters/InterviewFatigueReducer.jsx` | Interview round optimizer to reduce redundancy and candidate fatigue |
| `RejectionReasonModal` | `components/Jobs/RejectionReasonModal.jsx` | Modal for providing rejection reasons to candidates |
| `SQLViews` | `components/Admin/SQLViews.jsx` | SQL database view explorer with data query and CSV export |

### Context Providers
| Component | File | Purpose |
|---|---|---|
| `AuthContext` | `context/AuthContext.jsx` | Authentication state |
| `ThemeContext` | `context/ThemeContext.jsx` | Theme (Dark/Light) toggle |

### Shared Components
| Component | File | Purpose |
|---|---|---|
| `ChatbotWidget` | `components/shared/ChatbotWidget.jsx` | AI-powered chatbot assistant with role-specific responses |

### Chart Components
| Component | File | Purpose |
|---|---|---|
| `BiasAnalysisChart` | `components/Charts/BiasAnalysisChart.jsx` | Bias detection visualization by location/experience |
| `DiversityChart` | `components/Charts/DiversityChart.jsx` | Diversity analytics funnel visualization |
| `EngagementTrendChart` | `components/Charts/EngagementTrendChart.jsx` | Candidate engagement trends over time |
| `HireRatePerJobChart` | `components/Charts/HireRatePerJobChart.jsx` | Application-to-hire conversion by job |
| `HiringFunnelChart` | `components/Charts/HiringFunnelChart.jsx` | Application funnel conversion stages |
| `InterviewerPerformanceChart` | `components/Charts/InterviewerPerformanceChart.jsx` | Interviewer scoring consistency metrics |
| `RecruiterLeaderboardChart` | `components/Charts/RecruiterLeaderboardChart.jsx` | Recruiter performance leaderboard |
| `ReferralIntelChart` | `components/Charts/ReferralIntelChart.jsx` | Referral network visualization |
| `RejectionAnalysisChart` | `components/Charts/RejectionAnalysisChart.jsx` | Rejection reason breakdown |
| `RemoteWorkChart` | `components/Charts/RemoteWorkChart.jsx` | Remote compatibility distribution |
| `SalaryRangeChart` | `components/Charts/SalaryRangeChart.jsx` | Salary range comparison |
| `SentimentChart` | `components/Charts/SentimentChart.jsx` | Sentiment trends visualization |
| `SkillGapChart` | `components/Charts/SkillGapChart.jsx` | Skill gap analysis visualization |
| `VacancyUtilizationChart` | `components/Charts/VacancyUtilizationChart.jsx` | Vacancy fill rate by job |

---

## 3. Skill Matching Feature (Discover Jobs)

The Discover Jobs tab in the Candidate Dashboard shows jobs with required skills. Each skill displays:

- **Green (✓)**: Candidate's proficiency level >= job's required level (MeetsRequirement = true)
- **Amber (⚠)**: Candidate has the skill but level is below requirement
- **Red**: Candidate doesn't have the skill

The skill data is returned from `/api/candidates/discover` endpoint with this structure:
```js
{
  SkillName: "Java",
  MinProficiency: 5,        // Job's required level
  HasSkill: true,           // Does candidate have this skill?
  CandidateProficiencyLevel: 7,  // Candidate's actual level
  MeetsRequirement: true     // level >= MinProficiency
}
```
