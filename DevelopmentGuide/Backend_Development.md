# Backend Development

## 1. How to Create a New API Endpoint

### Step 1 — Create or find the route file
All route files are in `server/routes/`.

### Step 2 — Add the endpoint
```js
// GET endpoint
router.get('/', protect, async (req, res) => {
    try {
        const rows = await query(`SELECT * FROM YourTable`);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch data." });
    }
});

// POST endpoint (use ? placeholders)
router.post('/', protect, authorize(2), async (req, res) => {
    const { val1, val2 } = req.body;
    try {
        await query(`INSERT INTO YourTable (Col1, Col2) VALUES (?, ?)`, [val1, val2]);
        res.status(201).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Failed to create." });
    }
});
```

> ⚠️ **ALWAYS use `?` placeholders** — never string-interpolate user input into SQL.

### Step 3 — Register in index.js
```js
const newRoutes = require('./routes/newfeature');
app.use('/api/newfeature', newRoutes);
```

---

## 2. Authentication & RBAC System

### How it works
- `AuthContext.jsx` reads `nexhire_user` from `localStorage`.
- Sets Axios headers: `x-user-id` and `x-user-role`.
- Backend `protect` middleware populates `req.user`.

### Role IDs
| RoleID | Role | Access |
|---|---|---|
| 1 | Admin | Full access, reporting |
| 2 | Recruiter | Jobs, candidates, feedback |
| 3 | Candidate | Applications, profile, assessments |

### Protecting routes
```js
router.get('/route', protect, handler); // Auth required
router.get('/admin', protect, authorize(1), handler); // Admin only
router.post('/shared', protect, authorize([1, 2]), handler); // Admin or Recruiter
```

---

## 3. Registered API Endpoints

### Auth — `/api/auth`
| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/login` | Public | Login → returns user object |
| POST | `/register` | Public | Register candidate |

### Recruiters — `/api/recruiters`
| Method | Path | Access | Description |
|---|---|---|---|---
| GET | `/talent-pool` | Recruiter (2) | All candidates with integrated insights (supports ?search, ?location, ?minExperience filters) |
| POST | `/talent-pool/invite` | Recruiter (2) | Invite multiple candidates to a job |
| POST | `/search` | Recruiter (2) | Search candidates by name (useFuzzy=true for fuzzy search, threshold optional default 0.6) |
| POST | `/initiate-pipeline` | Recruiter (2) | Invite candidate to job pipeline (creates status 7-Invited) |
| GET | `/engagement` | Recruiter (2) | Candidate engagement scoring via vw_CandidateEngagement |
| GET | `/platform-sync` | Recruiter (2) | External platform sync status (LinkedIn, Indeed, Glassdoor) |
| POST | `/platform-sync` | Recruiter (2) | Trigger sync to external platform |
| POST | `/screening/run` | Recruiter (2) | Run automated screening for job applications (uses sp_AutoScreenApplicationEnhanced or inline logic) |
| GET | `/screening/decisions` | Recruiter (2) | Get screening decisions for jobs |
| POST | `/screening/override` | Recruiter (2) | Override a screening decision (human override) |
| POST | `/screening/advance` | Recruiter (2) | Advance selected candidates to Screening or Interview stage |
| POST | `/screening/reject` | Recruiter (2) | Reject selected candidates directly from screening |
| GET | `/market-alerts` | Recruiter (2) | Personalized market alerts based on recruiter's department/location (uses sp_GenerateMarketAlerts with fallback queries) |
| GET | `/candidate-profile/:candidateId` | Recruiter (2) | Comprehensive candidate profile with 12 data sources: basic info, skills, applications, interviews, assessments, gamification, career goals, resume insights, remote compatibility, AI predictions, skill verifications, blockchain credentials |
| GET | `/referral-intelligence` | Recruiter (2) | Referral network analytics: summary stats, top referrers leaderboard, recent referrals, network analysis with connection strengths |
| GET | `/referral-suggestions/:jobId` | Recruiter (2) | Get AI-powered referral suggestions for a job using sp_SuggestReferrals stored procedure - analyzes job requirements, candidate network connections, and historical referral performance |
| GET | `/ranking-history/:candidateId` | Recruiter (2) | Get ranking history for a candidate with stats (avg score, trend analysis) |
| POST | `/ranking-history` | Recruiter (2) | Save a candidate ranking (calls sp_SaveCandidateRanking) |
| GET | `/ranking-history/job/:jobId` | Recruiter (2) | Get ranking history for all candidates for a specific job |

### Jobs — `/api/jobs`
| Method | Path | Access | Description |
|---|---|---|---
| GET | `/` | Recruiter (2) | All active jobs |
| POST | `/` | Recruiter (2) | Create job |
| GET | `/:id` | Recruiter (2) | Get single job details |
| PUT | `/:id` | Recruiter (2) | Update job posting |
| DELETE | `/:id` | Recruiter (2) | Soft-delete job posting |
| GET | `/:id/matches` | Recruiter (2) | Matched candidates via matching engine |

### Candidates — `/api/candidates`
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/discover` | Candidate (3) | Discover all active jobs with skill matching (returns RequiredSkills with MeetsRequirement flag). Also returns SalaryMin and SalaryMax when job has transparent salary (IsTransparent=1) |
| GET | `/matches` | Candidate (3) | Get matched jobs with match scores |
| GET | `/applications` | Candidate (3) | Own applications |
| GET | `/skills` | Candidate (3) | Get candidate's skills with proficiency levels |
| GET | `/interviews` | Candidate (3) | Get scheduled interviews |
| POST | `/confirm-interview` | Candidate (3) | Confirm an interview slot |
| GET | `/assessments` | Candidate (3) | Available skill assessments |
| POST | `/apply` | Candidate (3) | Apply for a job |
| POST | `/withdraw` | Candidate (3) | Withdraw an application |
| POST | `/skills` | Candidate (3) | Add or update a skill |
| GET | `/career-path` | Candidate (3) | Career path insights |
| POST | `/career-path/simulate` | Candidate (3) | Simulate career transition (uses sp_PredictCareerPath with TargetRole, TimelineMonths) |
| POST | `/learning-path` | Candidate (3) | Generate personalized learning path |
| GET | `/learning-path` | Candidate (3) | Get existing learning path |
| GET | `/leaderboard` | Candidate (3) | Get personal gamification data |
| GET | `/leaderboard/global` | Candidate (3) | Get global leaderboard rankings |
| POST | `/gamification/daily-login` | Candidate (3) | Record daily login and award streak points |
| POST | `/gamification/profile-complete` | Candidate (3) | Award points for completing profile |
| POST | `/gamification/skill-verified` | Candidate (3) | Award points when skill is verified |
| GET | `/interview-prep` | Candidate (3) | Get interview prep materials |
| POST | `/interview-prep/generate` | Candidate (3) | Generate personalized interview prep |
| GET | `/salary-coach` | Candidate (3) | Get salary benchmarks |
| POST | `/salary-coach/negotiate` | Candidate (3) | Generate salary negotiation strategy |
| GET | `/location-preferences` | Candidate (3) | Get location preferences |
| POST | `/location-preferences` | Candidate (3) | Save location preferences |
| GET | `/resume-score` | Candidate (3) | Get resume quality score |
| GET | `/invitations` | Candidate (3) | Get pending invitations |
| POST | `/invitations/:id/respond` | Candidate (3) | Accept or decline invitation |
| GET | `/notifications` | Candidate (3) | Get push notifications |
| POST | `/notifications/register-device` | Candidate (3) | Register device for push notifications |
| POST | `/notifications/mark-read` | Candidate (3) | Mark notifications as read |
| GET | `/skill-gap-analysis` | Candidate (3) | Get personalized skill gap analysis |
| GET | `/skills-demand` | Candidate (3) | Get market skill demand data |
| GET | `/profile/skills` | Candidate (3) | Get skill verification status |
| GET | `/profile` | Candidate (3) | Get full candidate profile (basic info, consents, notifications) |
| PUT | `/profile` | Candidate (3) | Update candidate profile (FullName, Location, YearsOfExperience, etc.) |
| PUT | `/profile/consent` | Candidate (3) | Update consent preferences (DataProcessing, Marketing, Retention, ThirdPartySharing) |
| GET | `/:id/sentiment` | Recruiter/Admin (1,2) | Get sentiment history for a candidate |
| POST | `/:id/sentiment` | Recruiter/Admin (1,2) | Add a new sentiment analysis for a candidate |
| GET | `/:id/sentiment/summary` | Recruiter/Admin (1,2) | Get aggregated sentiment summary for a candidate |
| GET | `/career-path/roles` | Candidate (3) | Get available career roles for simulation |

### Recruiters (Additional) — `/api/recruiters`
| Method | Path | Access | Description |
|---|---|---|---
| POST | `/send-reminder` | Recruiter (2) | Send a reminder to a candidate - creates a notification |
| GET | `/background-checks/:candidateId` | Recruiter (2) | Get background checks for a candidate |
| POST | `/background-checks` | Recruiter (2) | Initiate a new background check |
| PUT | `/background-checks/:checkId` | Recruiter (2) | Update background check status |
| GET | `/background-checks-dashboard` | Recruiter (2) | Get background check dashboard with summary stats |
| GET | `/blockchain-verifications/:candidateId` | Recruiter (2) | Get blockchain verifications for a candidate |
| POST | `/blockchain-verifications` | Recruiter (2) | Submit a new credential for blockchain verification |
| PUT | `/blockchain-verifications/:verificationId` | Recruiter (2) | Update blockchain verification status |
| GET | `/blockchain-dashboard` | Recruiter (2) | Get blockchain verification dashboard |

### Interviews — `/api/interviews`
| Method | Path | Access | Description |
|---|---|---|---
| POST | `/schedule` | Recruiter (2) | Schedule a new interview |
| GET | `/` | Recruiter (2) | Get all scheduled interviews |
| POST | `/feedback` | Recruiter (2) | Submit interview feedback (TechnicalScore, CommunicationScore, CultureFitScore, Comments). Uses `SCOPE_IDENTITY()` due to CLR trigger on table. |
| GET | `/feedback/:applicationId` | Recruiter (2) | Get all feedback for an application |
| POST | `/transcription` | Recruiter (2) | Create transcription record for interview |
| GET | `/transcription/:scheduleId` | Recruiter (2) | Get transcription for schedule |
| POST | `/transcription/:transcriptionId/process` | Recruiter (2) | Process transcription (extract topics, sentiment, filler words) |
| POST | `/generate-questions` | Recruiter (2) | Generate interview questions based on job requirements using sp_GenerateInterviewQuestions |
| GET | `/generated-questions/:jobId` | Recruiter (2) | Get previously generated questions for a job |
| POST | `/save-question` | Recruiter (2) | Save a generated question to the database for reuse |
| POST | `/optimize-rounds` | Recruiter (2) | Optimize interview rounds for a candidate-job pair using sp_OptimizeInterviewRounds |

### Applications — `/api/applications`
| Method | Path | Access | Description |
|---|---|---|---
| PUT | `/:id/status` | Recruiter (2) | Update application status (Screening, Interview, Rejected, etc.) |
| POST | `/:id/hire` | Recruiter (2) | Hire a candidate (concurrency-safe, calls sp_HireCandidate) |
| GET | `/:id/history` | Private | Get status transition history for an application |
| POST | `/auto-reject` | Recruiter (2) | Run auto-reject batch process (calls sp_AutoRejectUnqualified) |
| GET | `/auto-rejected` | Recruiter (2) | Get list of auto-rejected applications |

### Analytics — `/api/analytics`
| Method | Path | Access | Description |
|---|---|---|---
| GET | `/stats` | Recruiter (2) | Hero stats |
| GET | `/funnel` | Recruiter (2) | Application funnel |
| GET | `/diversity` | Public | Diversity analytics funnel by Ethnicity |
| GET | `/diversity-gender` | Public | Diversity by Gender |
| GET | `/diversity-disability` | Public | Diversity by Disability status |
| GET | `/diversity-veteran` | Public | Diversity by Veteran status |
| GET | `/market` | Public | Market intelligence dashboard |
| GET | `/salary-transparency` | Public | Salary transparency analytics |
| GET | `/time-to-hire-detail` | Recruiter/Admin (1,2) | Individual candidate hiring timelines with DaysToHire, JobTitle, Source |
| POST | `/predict-hire-success` | Recruiter/Admin (1,2) | Predict hiring success probability using Rules-Based AI (sp_PredictHireSuccess) |
| GET | `/applications-for-prediction` | Recruiter/Admin (1,2) | Get applications eligible for success prediction |
| GET | `/hire-success-predictions` | Recruiter/Admin (1,2) | Get all stored hire success predictions from AI_Predictions table |
| GET | `/remote-compatibility` | Admin (1) | Remote work compatibility data from vw_RemoteCompatibilityMatrix (returns Role, RemoteScore, factor scores, assessment) |
| GET | `/interviewer-consistency` | Admin (1) | Interviewer consistency metrics - detects scoring bias patterns with variance analysis (vw_InterviewerConsistency) |
| GET | `/interview-score-decision` | Admin (1) | Interview score vs hiring decision correlation data (vw_InterviewScoreVsDecision) |
| GET | `/hire-rate-per-job` | Admin (1) | Application-to-hire conversion rate per job posting (vw_HireRatePerJob) |
| GET | `/time-to-hire-individual` | Admin (1) | Individual candidate hiring timeline with days to hire (vw_TimeToHire) |
| GET | `/candidate-engagement` | Admin/Recruiter (1,2) | Candidate responsiveness metrics - interview confirmations vs scheduled |
| GET | `/rejection-analysis` | Admin/Recruiter (1,2) | Rejection reason breakdown and patterns |
| GET | `/sentiment-trends` | Recruiter/Admin (1,2) | Sentiment trends across all candidates with overall stats, by type, trend over time |
| GET | `/sentiment-at-risk` | Recruiter/Admin (1,2) | Candidates with declining sentiment (at-risk for disengagement) |
| GET | `/diversity-goals` | Recruiter/Admin (1,2) | Get all diversity goals |
| POST | `/diversity-goals` | Recruiter/Admin (1,2) | Create a new diversity goal |
| GET | `/bias-logs` | Recruiter/Admin (1,2) | Get bias detection logs with severity levels |
| PUT | `/bias-logs/:id/resolve` | Admin (1) | Mark a bias log as resolved |
| POST | `/predict-onboarding-success` | Recruiter/Admin (1,2) | Predict onboarding success for a hired candidate using sp_PredictOnboardingSuccess |
| GET | `/hired-candidates` | Recruiter/Admin (1,2) | Get list of hired candidates eligible for onboarding prediction |
| GET | `/onboarding-predictions` | Recruiter/Admin (1,2) | Get all stored onboarding predictions |
| GET | `/consent-status` | Admin (1) | GDPR consent status - all candidates' consent records with calculated status (Active/Expired/Revoked) |
| GET | `/ghosting-detail` | Recruiter (2) | Detailed ghosting risk data with candidate names, job titles, risk scores, risk levels, response times, communication frequency, days since contact |
| GET | `/ghosting-trend` | Recruiter (2) | Ghosting risk trend over time with high/medium/low counts by date |

### Chatbot — `/api/chatbot`
| Method | Path | Access | Description |
|---|---|---|---
| POST | `/message` | Private | Send a message to the chatbot and get a response |
| POST | `/feedback` | Private | Submit feedback for a chatbot interaction |
| GET | `/history` | Private | Get chat history for the current user |
| GET | `/faq` | Public | Get FAQ list for quick replies |

### Maintenance — `/api/maintenance`
| Method | Path | Access | Description |
|---|---|---|---
| GET | `/email-queue` | Admin (1) | Get email queue with filters (status, type, limit) |
| PUT | `/email-queue/:id/retry` | Admin (1) | Retry a failed email |
| DELETE | `/email-queue/:id` | Admin (1) | Delete an email from queue |
| POST | `/email-queue/send-test` | Admin (1) | Add test email to queue |
| GET | `/sql-views` | Public | Get list of all database views organized by category |
| GET | `/sql-views/:viewName` | Public | Execute SELECT * FROM viewName and return data |
