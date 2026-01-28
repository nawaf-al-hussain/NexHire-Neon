// Full system flowchart from the NexHire documentation.
// Rendered client-side via Mermaid.js (loaded from CDN on demand).
// Source: NexHire Documentation For Collaboration (main.tex, Section 7)
//         + expanded to cover all recruiter/candidate/admin feature pages.
//
// Layout: LR (left-to-right) with SUBGRAPH clusters.
// Each role branch is a subgraph, and within each role, feature pages
// are grouped into category subgraphs. Mermaid renders subgraphs as
// nested boxes, which physically groups sibling nodes into compact
// clusters instead of fanning them all out at the same level.

export const flowchartMermaid = `flowchart LR
    Start(["User Visits System"]) --> Login{"Login / Signup"}
    Login -- New User --> Signup["Sign Up Form"]
    Login -- Existing User --> Auth["Authentication"]
    Auth --> ValidateCreds{"Validate<br>Credentials"}
    ValidateCreds -- Invalid --> LoginFail["Login Failed"]
    ValidateCreds -- Valid --> CheckRole{"Check Role"}
    LoginFail --> Login
    CheckRole -- "RoleID = 1" --> AdminDash["ADMIN DASHBOARD"]
    CheckRole -- "RoleID = 2" --> RecruiterDash["RECRUITER DASHBOARD"]
    CheckRole -- "RoleID = 3" --> CandidateDash["CANDIDATE DASHBOARD"]

    %% ============ ADMIN BRANCH ============
    subgraph AdminBranch["Admin Branch"]
        direction TB
        AdminDash --> AdminMenu{"Admin Actions"}

        subgraph AdminCat1["User & System Management"]
            direction TB
            ManageUsers["View/Edit/Deactivate Users<br>Assign Roles"]
            SystemConfig["Archive Old Data<br>Anonymize Candidates<br>System Settings"]
            Maintenance["System Maintenance<br>Rebuild indexes<br>Statistics update"]
            SecurityLogs["Security & Audit Logs<br>Failed login attempts<br>Permission changes"]
            RunArchive["sp_ArchiveOldData<br>sp_AnonymizeArchivedCandidates<br>sp_CheckConsentExpiry"]
            RunMarketAlerts["sp_GenerateMarketAlerts"]
            SystemConfig --> RunArchive --> RunMarketAlerts
        end

        subgraph AdminCat2["Analytics & Reports"]
            direction TB
            AdminAnalytics["System-Wide Analytics<br>All Hiring Metrics<br>Audit Logs<br>AI Predictions<br>Blockchain Verifications"]
            AdminReports["Bias Detection<br>Skill Gap Analysis<br>Recruiter Performance Reports"]
            CoreViews["Core Analytical Views<br>vw_SkillGapAnalysis<br>vw_SilentRejections<br>vw_Bias_Location / vw_Bias_Experience<br>vw_HiringBottlenecks<br>vw_RecruiterPerformance<br>vw_ApplicationFunnel<br>vw_TimeToHire / vw_AverageTimeToHire<br>vw_HireRatePerJob<br>vw_InterviewerConsistency<br>vw_CandidateEngagement<br>vw_RejectionAnalysis"]
            EnhancedViews["Enhanced Views<br>vw_DiversityAnalyticsFunnel<br>vw_MarketIntelligenceDashboard<br>vw_GhostingRiskDashboard<br>vw_SalaryTransparency<br>vw_RemoteCompatibilityMatrix<br>vw_CareerPathInsights<br>vw_ReferralIntelligence<br>vw_SkillVerificationStatus<br>vw_TalentPipelineHealthEnhanced<br>vw_CostPerHireEnhanced"]
            ViewAuditLog["View Complete Audit Trail<br>All Status Changes<br>All User Actions"]
            CoreViews --> EnhancedViews
            AdminAnalytics --> ViewAuditLog
        end

        subgraph AdminCat3["Compliance & Audit"]
            direction TB
            ConsentMgmt["Consent Management<br>Track candidate consents<br>GDPR expiry checks"]
            DiversityGoals["Diversity Goals<br>Track hiring targets<br>Progress vs Target"]
            BiasLogs["Bias Detection Logs<br>Automated bias alerts<br>Recruiter-specific patterns"]
            EmailQueueAdmin["Email Queue Manager<br>View queued/sent/failed<br>Retry failed sends"]
            DiversityGoals --> BiasLogs
        end

        subgraph AdminCat4["AI & Data Tools"]
            direction TB
            AIModels["Manage AI Models<br>Question Generator<br>Prediction Algorithms"]
            ManageAI["Configure AI Settings<br>Question Generation Rules"]
            MonitorPerformance["Monitor AI Accuracy<br>Model Performance"]
            SqlViews["SQL Views Explorer<br>Browse all 28 views<br>Run ad-hoc queries"]
            VacancyUtil["Vacancy Utilization<br>Track filled vs open<br>Cost per hire analysis"]
            AIModels --> ManageAI --> MonitorPerformance
        end

        AdminMenu -- User & System Mgmt --> AdminCat1
        AdminMenu -- Analytics & Reports --> AdminCat2
        AdminMenu -- Compliance & Audit --> AdminCat3
        AdminMenu -- AI & Data Tools --> AdminCat4
    end

    %% ============ RECRUITER BRANCH ============
    subgraph RecruiterBranch["Recruiter Branch"]
        direction TB
        RecruiterDash --> RecruiterMenu{"Recruiter Actions"}

        subgraph RCat1["Job Management"]
            direction TB
            PostJob["Create Job Posting<br>Title, Location, Experience<br>Vacancies, Description"]
            DefineSkills["Define Required Skills<br>Mandatory vs Optional<br>Min Proficiency Levels"]
            GenerateQuestions["Generate Interview Questions<br>sp_GenerateInterviewQuestions"]
            SalaryOption{"Add Salary Range?"}
            AddSalary["Set Min/Max Salary<br>Benefits Summary<br>Mark as Transparent"]
            SkipSalary["Skip Salary"]
            SaveJob["INSERT INTO JobPostings<br>INSERT INTO JobSkills<br>Save AI Questions"]
            PostJob --> DefineSkills --> GenerateQuestions --> SalaryOption
            SalaryOption -- Yes --> AddSalary --> SaveJob
            SalaryOption -- No --> SkipSalary --> SaveJob
        end

        subgraph RCat2["Candidate Review"]
            direction TB
            ReviewCand["View Candidate Matching<br>Weighted Scores<br>Skills Match<br>AI Predictions"]
            ViewMatchScore["vw_CandidateMatchScore<br>Ranked by Algorithm<br>sp_AdvancedCandidateMatchingEnhanced"]
            CheckMandatory{"Meets Mandatory<br>Skills?"}
            NotQualified["Filtered Out<br>sp_AutoRejectUnqualified<br>Auto Screening Bot"]
            SkillVerification{"Skills Verified?"}
            ShowVerified["Verified Badge<br>Blockchain Verified"]
            ShowUnverified["Flag for Assessment<br>Micro-Certifications"]
            ShowRanked["Show with Score<br>Skill + Experience + Location"]
            AI_Prediction["AI Success Prediction<br>sp_PredictHireSuccess<br>Probability Score"]
            ResumeScore["Resume Quality Score<br>NLP Extracted Skills<br>Readability Analysis"]
            TalentPool["Talent Pool<br>Browse all candidates<br>Filter by skills/location<br>Resume score ranking"]
            ReviewCand --> ViewMatchScore --> CheckMandatory
            CheckMandatory -- No --> NotQualified
            CheckMandatory -- Yes --> SkillVerification
            SkillVerification -- Yes --> ShowVerified --> ShowRanked
            SkillVerification -- No --> ShowUnverified --> ShowRanked
            ShowRanked --> AI_Prediction --> ResumeScore
        end

        subgraph RCat3["Interview Pipeline"]
            direction TB
            ScheduleInt["Schedule Interviews<br>Conflict Detection"]
            InterviewOptimize["Optimize Rounds<br>sp_OptimizeInterviewRounds"]
            CheckConflict["trg_PreventDoubleBooking<br>Check Temporal Overlap"]
            BlockSchedule["Scheduling Blocked<br>Recruiter Already Booked"]
            CreateInterview["INSERT INTO InterviewSchedules<br>trg_SendInterviewEmail"]
            VideoOption{"Video Interview?"}
            ScheduleVideo["Schedule Video Platform<br>Zoom/Teams Integration<br>Recording Consent"]
            EmailQueue["Email Added to Queue"]
            Transcription["Automatic Transcription<br>Speech-to-Text<br>Sentiment Analysis"]
            InterviewFatigue["Interview Fatigue Reducer<br>Detect redundant questions<br>Optimize interview rounds"]
            ScheduleInt --> InterviewOptimize --> CheckConflict
            CheckConflict -- Conflict --> BlockSchedule
            CheckConflict -- No Conflict --> CreateInterview --> VideoOption
            VideoOption -- Yes --> ScheduleVideo --> Transcription
            VideoOption -- No --> EmailQueue
        end

        subgraph RCat4["Hiring & Status"]
            direction TB
            UpdateStatusNode["Move Applications<br>Through Workflow"]
            CallSP1["sp_UpdateApplicationStatus<br>@ApplicationID, @NewStatusID"]
            ValidateTransition{"Valid State<br>Transition?"}
            BlockTransition["Invalid Transition<br>State Machine Prevents"]
            AllowTransition["Update Applications<br>Record in History<br>Trigger Audit Log"]
            HireCand["Execute Hire<br>Concurrency Safe"]
            CallSP2["sp_HireCandidate<br>@ApplicationID, @RecruiterID"]
            LockRecords["BEGIN TRANSACTION<br>UPDLOCK, HOLDLOCK"]
            CheckStage{"In Interview<br>Stage?"}
            RollbackHire["ROLLBACK<br>Not in Interview Stage"]
            CheckVacancy{"Vacancies<br>Available?"}
            RollbackFull["ROLLBACK<br>No Vacancies Remaining"]
            PredictOnboarding["Predict Onboarding Success<br>sp_PredictOnboardingSuccess"]
            BackgroundCheck{"Background Check?"}
            InitiateCheck["Start Background Check<br>Criminal/Education/Employment<br>Vendor Integration"]
            WaitVerification["Wait for Verification<br>Risk Assessment<br>Compliance Check"]
            ExecuteHire["Update to Hired<br>Decrement Vacancies<br>Record History<br>COMMIT TRANSACTION"]
            UpdateStatusNode --> CallSP1 --> ValidateTransition
            ValidateTransition -- No --> BlockTransition
            ValidateTransition -- Yes --> AllowTransition
            HireCand --> CallSP2 --> LockRecords --> CheckStage
            CheckStage -- No --> RollbackHire
            CheckStage -- Yes --> CheckVacancy
            CheckVacancy -- No --> RollbackFull
            CheckVacancy -- Yes --> PredictOnboarding --> BackgroundCheck
            BackgroundCheck -- Yes --> InitiateCheck --> WaitVerification --> ExecuteHire
            BackgroundCheck -- No --> ExecuteHire
        end

        subgraph RCat5["Analytics & Intelligence"]
            direction TB
            HireAnalytics["Hire Analytics Dashboard<br>Avg time to hire<br>Rejection analysis<br>Stage bottlenecks"]
            TimeToHire["Time-to-Hire Detail<br>Per-candidate timelines<br>Stage-by-stage breakdown"]
            HirePredictor["Hire Success Predictor<br>Run predictions per application<br>Factor breakdown"]
            OnboardingPage["Onboarding Success Predictor<br>Predict retention probability<br>Risk factor analysis"]
            GhostingRisk["Ghosting Risk Detail<br>Per-candidate risk scores<br>Send reminders<br>Schedule follow-ups"]
            ReferralIntel["Referral Intelligence<br>Track referral sources<br>Referrer performance<br>Network strength analysis"]
            MarketAlerts["Market Alerts<br>Salary trend alerts<br>Demand/supply imbalance<br>Competitor hiring activity"]
            Engagement["Candidate Engagement<br>Track response times<br>Communication frequency<br>Engagement scores"]
        end

        subgraph RCat6["Verification & Compliance"]
            direction TB
            SkillVerifyPage["Skill Verification Status<br>Review claimed vs verified<br>Approve/reject skills"]
            BackgroundChecks["Background Check Management<br>Initiate checks<br>View vendor results<br>Risk assessment"]
            BlockchainPage["Blockchain Verifications<br>Submit credentials on-chain<br>Verify credential hashes"]
            ScreeningBot["Screening Bot Configuration<br>Configure screening rules<br>Confidence thresholds<br>sp_AutoScreenApplicationEnhanced"]
            AutoRejection["Auto Rejection Log<br>View auto-rejected applications<br>Screening bot decisions"]
            AIQuestions["AI Question Generator<br>Generate per-job questions<br>Difficulty calibration"]
            PlatformSync["External Platform Sync<br>Sync jobs to LinkedIn/Indeed<br>Track application sources"]
        end

        RecruiterMenu -- Job Management --> RCat1
        RecruiterMenu -- Candidate Review --> RCat2
        RecruiterMenu -- Interview Pipeline --> RCat3
        RecruiterMenu -- Hiring & Status --> RCat4
        RecruiterMenu -- Analytics & Intelligence --> RCat5
        RecruiterMenu -- Verification & Compliance --> RCat6
    end

    %% ============ CANDIDATE BRANCH ============
    subgraph CandidateBranch["Candidate Branch"]
        direction TB
        CandidateDash --> CandidateMenu{"Candidate Actions"}

        subgraph CCat1["Job Discovery"]
            direction TB
            BrowseJobs["View Active Job Postings<br>Filter by Location/Skills"]
            ShowJobs["SELECT FROM JobPostings<br>WHERE IsActive = 1"]
            ShowSalary{"Salary Shown?"}
            DisplayRange["Show Salary Range<br>Compare to Market<br>Benchmark Analysis"]
            NoSalary["Salary Not Disclosed<br>Market Data Available"]
            BrowseJobs --> ShowJobs --> ShowSalary
            ShowSalary -- Yes --> DisplayRange
            ShowSalary -- No --> NoSalary
        end

        subgraph CCat2["Applications"]
            direction TB
            ApplyJob["Select Job & Apply"]
            CheckDuplicate{"Already<br>Applied?"}
            DuplicateBlock["Duplicate Prevented<br>UNIQUE Constraint"]
            NegotiationPrep["Salary Negotiation Prep<br>sp_GenerateNegotiationStrategy"]
            RemoteAnalysis["Remote Compatibility Analysis<br>sp_AnalyzeRemoteCompatibility"]
            CreateApplication["INSERT INTO Applications<br>StatusID = 1 Applied"]
            AutoScreenBot["Auto Screening Bot<br>sp_AutoScreenApplicationEnhanced<br>Confidence Score"]
            AutoMatch["System Calculates Match Score<br>vw_CandidateMatchScore"]
            CheckQualified{"Meets Mandatory<br>Requirements?"}
            AutoReject["Flagged for Auto-Rejection"]
            RemoteCheck["Remote Compatibility<br>sp_AnalyzeRemoteCompatibility"]
            VisibleToRecruiters["Visible to Recruiters<br>With Match Score"]
            ViewMyApps["View My Applications<br>Current Status<br>Sentiment History"]
            DisplayApps["SELECT Applications<br>WHERE CandidateID = @CurrentUser"]
            ShowStatus["Show Current Status<br>Applied/Screening/Interview<br>Hired/Rejected"]
            GhostMonitor["Ghosting Monitor<br>Track Response Times<br>Risk Alerts"]
            WithdrawApp["Withdraw Application"]
            CallSP3["sp_WithdrawApplication<br>@ApplicationID, @CandidateID, @Reason"]
            ValidateOwner{"Owns<br>Application?"}
            BlockWithdraw["Block Withdrawal<br>Not Your Application"]
            CheckFinal{"Already<br>Hired/Rejected?"}
            BlockFinal["Cannot Withdraw<br>Terminal State"]
            AllowWithdraw["UPDATE to Withdrawn<br>Record Reason & History"]
            ApplyJob --> CheckDuplicate
            CheckDuplicate -- Yes --> DuplicateBlock
            CheckDuplicate -- No --> NegotiationPrep --> RemoteAnalysis --> CreateApplication --> AutoScreenBot --> AutoMatch --> CheckQualified
            CheckQualified -- No --> AutoReject
            CheckQualified -- Yes --> RemoteCheck --> VisibleToRecruiters
            ViewMyApps --> DisplayApps --> ShowStatus --> GhostMonitor
            WithdrawApp --> CallSP3 --> ValidateOwner
            ValidateOwner -- No --> BlockWithdraw
            ValidateOwner -- Yes --> CheckFinal
            CheckFinal -- Yes --> BlockFinal
            CheckFinal -- No --> AllowWithdraw
        end

        subgraph CCat3["Profile & Skills"]
            direction TB
            ManageProfile["Update Skills<br>Update Experience<br>Upload Documents"]
            UpdateSkills2["UPDATE CandidateSkills<br>Set Proficiency Levels"]
            RemoteAssess["Remote Assessment<br>Workspace Quality<br>Timezone Alignment"]
            UploadDocs["INSERT INTO CandidateDocuments<br>Resume/Certificates"]
            ResumeProcessing["Resume NLP Processing<br>Automatic Skill Extraction<br>Quality Scoring"]
            SkillGaps["Skill Gap Analysis<br>Compare my skills to job reqs<br>Priority gaps highlighted"]
            ResumeScorePage["Resume Quality Score<br>NLP analysis<br>Skill extraction confidence<br>Readability metrics"]
            ManageProfile --> UpdateSkills2 --> RemoteAssess --> UploadDocs --> ResumeProcessing
        end

        subgraph CCat4["Career Development"]
            direction TB
            LearningPaths["Learning Paths<br>Personalized roadmap<br>Resource recommendations<br>sp_GenerateLearningPath"]
            CareerPath["Career Path Simulator<br>Simulate role transitions<br>Transition probability<br>sp_PredictCareerPath"]
            SalaryCoach["Salary Coach<br>Generate negotiation strategy<br>Counter-offer recommendations<br>sp_GenerateNegotiationStrategy"]
            Achievements["Achievements & Leaderboard<br>Points & levels<br>Badges & streaks<br>Global rank<br>sp_AwardGamificationPoints"]
        end

        subgraph CCat5["Interviews & Preferences"]
            direction TB
            ViewInterviews["View Scheduled Interviews<br>Confirm Attendance"]
            GetSchedules["SELECT FROM InterviewSchedules<br>WHERE ApplicationID IN MyApps"]
            FatigueCheck["Interview Fatigue Check<br>Repeated Questions<br>Optimization"]
            ConfirmInt["UPDATE CandidateConfirmed = 1"]
            LocationPrefs["Location Preferences<br>Set preferred work locations<br>Remote/onsite/hybrid<br>Relocation willingness"]
            InterviewPrep["Interview Prep Materials<br>Study resources per job<br>Track prep progress<br>CandidatePrepProgress"]
            ViewInterviews --> GetSchedules --> FatigueCheck --> ConfirmInt
        end

        CandidateMenu -- Job Discovery --> CCat1
        CandidateMenu -- Applications --> CCat2
        CandidateMenu -- Profile & Skills --> CCat3
        CandidateMenu -- Career Development --> CCat4
        CandidateMenu -- Interviews & Prefs --> CCat5
    end

    %% ============ PLATFORM FEATURES (cross-cutting) ============
    subgraph Platform["Platform Features — all roles"]
        direction TB
        Chatbot["AI Chatbot Assistant<br>Floating help widget<br>FAQ + context awareness"]
        Notifications["Push Notifications<br>In-app alerts<br>Interview reminders<br>Status change alerts"]
        ThemeToggle["Theme Toggle<br>Light/Dark mode<br>CSS variable switch"]
    end

    AdminDash -.-> Chatbot
    RecruiterDash -.-> Chatbot
    CandidateDash -.-> Chatbot
    AdminDash -.-> Notifications
    RecruiterDash -.-> Notifications
    CandidateDash -.-> Notifications

    %% ============ STYLING ============
    class Auth,ValidateCreds,CheckRole securityClass
    class AdminDash,AdminMenu,ManageUsers,AdminAnalytics,AdminReports,SystemConfig,AIModels,ViewAuditLog,CoreViews,EnhancedViews,RunArchive,RunMarketAlerts,ManageAI,MonitorPerformance,DiversityGoals,BiasLogs,ConsentMgmt,EmailQueueAdmin,SecurityLogs,SqlViews,VacancyUtil,Maintenance adminClass
    class RecruiterDash,RecruiterMenu,PostJob,ReviewCand,ScheduleInt,UpdateStatusNode,HireCand,DefineSkills,GenerateQuestions,SalaryOption,AddSalary,SkipSalary,SaveJob,ViewMatchScore,CheckMandatory,NotQualified,SkillVerification,ShowVerified,ShowUnverified,ShowRanked,AI_Prediction,ResumeScore,InterviewOptimize,VideoOption,ScheduleVideo,Transcription,PredictOnboarding,BackgroundCheck,InitiateCheck,WaitVerification,TalentPool,SkillVerifyPage,BackgroundChecks,Engagement,PlatformSync,HireAnalytics,TimeToHire,ReferralIntel,MarketAlerts,GhostingRisk,AIQuestions,HirePredictor,OnboardingPage,InterviewFatigue,BlockchainPage,AutoRejection,ScreeningBot recruiterClass
    class CandidateDash,CandidateMenu,BrowseJobs,ApplyJob,ViewMyApps,ManageProfile,ViewInterviews,WithdrawApp,ShowJobs,ShowSalary,DisplayRange,NoSalary,DuplicateBlock,NegotiationPrep,RemoteAnalysis,CreateApplication,AutoScreenBot,AutoMatch,AutoReject,RemoteCheck,VisibleToRecruiters,DisplayApps,ShowStatus,GhostMonitor,UpdateSkills2,RemoteAssess,UploadDocs,ResumeProcessing,GetSchedules,FatigueCheck,ConfirmInt,BlockWithdraw,BlockFinal,SkillGaps,LearningPaths,CareerPath,ResumeScorePage,SalaryCoach,Achievements,LocationPrefs,InterviewPrep candidateClass
    class CheckConflict,BlockSchedule,CreateInterview,EmailQueue,CallSP1,ValidateTransition,BlockTransition,AllowTransition,CallSP2,LockRecords,CheckStage,RollbackHire,CheckVacancy,RollbackFull,ExecuteHire,CallSP3,ValidateOwner,AllowWithdraw processClass
    class Chatbot,Notifications,ThemeToggle platformClass
    class Start,Login,Signup,LoginFail entryClass

    classDef adminClass fill:#ff6b6b,stroke:#c92a2a,stroke-width:2px,color:#fff
    classDef recruiterClass fill:#4dabf7,stroke:#1971c2,stroke-width:2px,color:#fff
    classDef candidateClass fill:#51cf66,stroke:#2f9e44,stroke-width:2px,color:#fff
    classDef processClass fill:#ffd43b,stroke:#f59f00,stroke-width:2px,color:#000
    classDef securityClass fill:#ff6b9d,stroke:#c2255c,stroke-width:2px,color:#fff
    classDef platformClass fill:#a78bfa,stroke:#7c3aed,stroke-width:2px,color:#fff
    classDef entryClass fill:#94a3b8,stroke:#475569,stroke-width:2px,color:#fff`;

// Legend entries matching the diagram's color classes
export const flowchartLegend = [
    { label: 'Entry / Navigation', color: '#94a3b8', desc: 'Start, login, signup' },
    { label: 'Security / Auth', color: '#ff6b9d', desc: 'Authentication and role checking' },
    { label: 'Admin Actions', color: '#ff6b6b', desc: 'Admin dashboard operations' },
    { label: 'Recruiter Actions', color: '#4dabf7', desc: 'Recruiter dashboard operations' },
    { label: 'Candidate Actions', color: '#51cf66', desc: 'Candidate dashboard operations' },
    { label: 'Database / Process', color: '#ffd43b', desc: 'Stored procedures, triggers, transactions' },
    { label: 'Platform Features', color: '#a78bfa', desc: 'Cross-cutting features (chatbot, notifications, theme)' },
];
