// Full system flowchart from the NexHire documentation.
// Rendered client-side via Mermaid.js (loaded from CDN on demand).
// Source: NexHire Documentation For Collaboration (main.tex, Section 7)
//         + expanded to cover all recruiter/candidate/admin feature pages.
//
// Layout: TD (top-down) with category groupings to keep the tree
// deep rather than wide. Each role menu branches to ~5 category nodes
// instead of 20+ feature pages directly.

export const flowchartMermaid = `flowchart TD
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
    AdminDash --> AdminMenu{"Admin Actions"}
    AdminMenu -- User & System Mgmt --> AdminCat1["User & System Management"]
    AdminMenu -- Analytics & Reports --> AdminCat2["Analytics & Reports"]
    AdminMenu -- Compliance & Audit --> AdminCat3["Compliance & Audit"]
    AdminMenu -- AI & Data Tools --> AdminCat4["AI & Data Tools"]

    AdminCat1 --> ManageUsers["View/Edit/Deactivate Users<br>Assign Roles"]
    AdminCat1 --> SystemConfig["Archive Old Data<br>Anonymize Candidates<br>System Settings"]
    AdminCat1 --> Maintenance["System Maintenance<br>Rebuild indexes<br>Statistics update"]
    AdminCat1 --> SecurityLogs["Security & Audit Logs<br>Failed login attempts<br>Permission changes"]
    SystemConfig --> RunArchive["sp_ArchiveOldData<br>sp_AnonymizeArchivedCandidates<br>sp_CheckConsentExpiry"]
    RunArchive --> RunMarketAlerts["sp_GenerateMarketAlerts"]

    AdminCat2 --> AdminAnalytics["System-Wide Analytics<br>All Hiring Metrics<br>Audit Logs<br>AI Predictions<br>Blockchain Verifications"]
    AdminCat2 --> AdminReports["Bias Detection<br>Skill Gap Analysis<br>Recruiter Performance Reports"]
    AdminCat2 --> CoreViews["Core Analytical Views<br>vw_SkillGapAnalysis<br>vw_SilentRejections<br>vw_Bias_Location<br>vw_Bias_Experience<br>vw_HiringBottlenecks<br>vw_RecruiterPerformance<br>vw_ApplicationFunnel<br>vw_TimeToHire<br>vw_HireRatePerJob<br>vw_InterviewerConsistency<br>vw_CandidateEngagement<br>vw_RejectionAnalysis"]
    CoreViews --> EnhancedViews["Enhanced Views<br>vw_DiversityAnalyticsFunnel<br>vw_MarketIntelligenceDashboard<br>vw_GhostingRiskDashboard<br>vw_SalaryTransparency<br>vw_RemoteCompatibilityMatrix<br>vw_CareerPathInsights<br>vw_ReferralIntelligence<br>vw_SkillVerificationStatus<br>vw_TalentPipelineHealthEnhanced<br>vw_CostPerHireEnhanced"]
    AdminAnalytics --> ViewAuditLog["View Complete Audit Trail<br>All Status Changes<br>All User Actions"]

    AdminCat3 --> ConsentMgmt["Consent Management<br>Track candidate consents<br>GDPR expiry checks"]
    AdminCat3 --> DiversityGoals["Diversity Goals<br>Track hiring targets<br>Progress vs Target"]
    DiversityGoals --> BiasLogs["Bias Detection Logs<br>Automated bias alerts<br>Recruiter-specific patterns"]
    AdminCat3 --> EmailQueueAdmin["Email Queue Manager<br>View queued/sent/failed<br>Retry failed sends"]

    AdminCat4 --> AIModels["Manage AI Models<br>Question Generator<br>Prediction Algorithms"]
    AIModels --> ManageAI["Configure AI Settings<br>Question Generation Rules"]
    ManageAI --> MonitorPerformance["Monitor AI Accuracy<br>Model Performance"]
    AdminCat4 --> SqlViews["SQL Views Explorer<br>Browse all 28 views<br>Run ad-hoc queries"]
    AdminCat4 --> VacancyUtil["Vacancy Utilization<br>Track filled vs open<br>Cost per hire analysis"]

    %% ============ RECRUITER BRANCH ============
    RecruiterDash --> RecruiterMenu{"Recruiter Actions"}
    RecruiterMenu -- Job Management --> RCat1["Job Management"]
    RecruiterMenu -- Candidate Review --> RCat2["Candidate Review"]
    RecruiterMenu -- Interview Pipeline --> RCat3["Interview Pipeline"]
    RecruiterMenu -- Hiring & Status --> RCat4["Hiring & Status"]
    RecruiterMenu -- Analytics & Intelligence --> RCat5["Analytics & Intelligence"]
    RecruiterMenu -- Verification & Compliance --> RCat6["Verification & Compliance"]

    %% Job Management flow
    RCat1 --> PostJob["Create Job Posting<br>Title, Location, Experience<br>Vacancies, Description"]
    PostJob --> DefineSkills["Define Required Skills<br>Mandatory vs Optional<br>Min Proficiency Levels"]
    DefineSkills --> GenerateQuestions["Generate Interview Questions<br>sp_GenerateInterviewQuestions"]
    GenerateQuestions --> SalaryOption{"Add Salary Range?"}
    SalaryOption -- Yes --> AddSalary["Set Min/Max Salary<br>Benefits Summary<br>Mark as Transparent"]
    SalaryOption -- No --> SkipSalary["Skip Salary"]
    AddSalary --> SaveJob["INSERT INTO JobPostings<br>INSERT INTO JobSkills<br>Save AI Questions"]
    SkipSalary --> SaveJob

    %% Candidate Review flow
    RCat2 --> ReviewCand["View Candidate Matching<br>Weighted Scores<br>Skills Match<br>AI Predictions"]
    ReviewCand --> ViewMatchScore["vw_CandidateMatchScore<br>Ranked by Algorithm<br>sp_AdvancedCandidateMatchingEnhanced"]
    ViewMatchScore --> CheckMandatory{"Meets Mandatory<br>Skills?"}
    CheckMandatory -- No --> NotQualified["Filtered Out<br>sp_AutoRejectUnqualified<br>Auto Screening Bot"]
    CheckMandatory -- Yes --> SkillVerification{"Skills Verified?"}
    SkillVerification -- Yes --> ShowVerified["Verified Badge<br>Blockchain Verified"]
    SkillVerification -- No --> ShowUnverified["Flag for Assessment<br>Micro-Certifications"]
    ShowVerified --> ShowRanked["Show with Score<br>Skill + Experience + Location"]
    ShowUnverified --> ShowRanked
    ShowRanked --> AI_Prediction["AI Success Prediction<br>sp_PredictHireSuccess<br>Probability Score"]
    AI_Prediction --> ResumeScore["Resume Quality Score<br>NLP Extracted Skills<br>Readability Analysis"]
    RCat2 --> TalentPool["Talent Pool<br>Browse all candidates<br>Filter by skills/location<br>Resume score ranking"]

    %% Interview Pipeline flow
    RCat3 --> ScheduleInt["Schedule Interviews<br>Conflict Detection"]
    ScheduleInt --> InterviewOptimize["Optimize Rounds<br>sp_OptimizeInterviewRounds"]
    InterviewOptimize --> CheckConflict["trg_PreventDoubleBooking<br>Check Temporal Overlap"]
    CheckConflict -- Conflict --> BlockSchedule["Scheduling Blocked<br>Recruiter Already Booked"]
    CheckConflict -- No Conflict --> CreateInterview["INSERT INTO InterviewSchedules<br>trg_SendInterviewEmail"]
    CreateInterview --> VideoOption{"Video Interview?"}
    VideoOption -- Yes --> ScheduleVideo["Schedule Video Platform<br>Zoom/Teams Integration<br>Recording Consent"]
    VideoOption -- No --> EmailQueue["Email Added to Queue"]
    ScheduleVideo --> Transcription["Automatic Transcription<br>Speech-to-Text<br>Sentiment Analysis"]
    RCat3 --> InterviewFatigue["Interview Fatigue Reducer<br>Detect redundant questions<br>Optimize interview rounds"]

    %% Hiring & Status flow
    RCat4 --> UpdateStatusNode["Move Applications<br>Through Workflow"]
    UpdateStatusNode --> CallSP1["sp_UpdateApplicationStatus<br>@ApplicationID, @NewStatusID"]
    CallSP1 --> ValidateTransition{"Valid State<br>Transition?"}
    ValidateTransition -- No --> BlockTransition["Invalid Transition<br>State Machine Prevents"]
    ValidateTransition -- Yes --> AllowTransition["Update Applications<br>Record in History<br>Trigger Audit Log"]
    BlockTransition --> UpdateStatusNode
    RCat4 --> HireCand["Execute Hire<br>Concurrency Safe"]
    HireCand --> CallSP2["sp_HireCandidate<br>@ApplicationID, @RecruiterID"]
    CallSP2 --> LockRecords["BEGIN TRANSACTION<br>UPDLOCK, HOLDLOCK"]
    LockRecords --> CheckStage{"In Interview<br>Stage?"}
    CheckStage -- No --> RollbackHire["ROLLBACK<br>Not in Interview Stage"]
    CheckStage -- Yes --> CheckVacancy{"Vacancies<br>Available?"}
    CheckVacancy -- No --> RollbackFull["ROLLBACK<br>No Vacancies Remaining"]
    CheckVacancy -- Yes --> PredictOnboarding["Predict Onboarding Success<br>sp_PredictOnboardingSuccess"]
    PredictOnboarding --> BackgroundCheck{"Background Check?"}
    BackgroundCheck -- Yes --> InitiateCheck["Start Background Check<br>Criminal/Education/Employment<br>Vendor Integration"]
    BackgroundCheck -- No --> ExecuteHire["Update to Hired<br>Decrement Vacancies<br>Record History<br>COMMIT TRANSACTION"]
    InitiateCheck --> WaitVerification["Wait for Verification<br>Risk Assessment<br>Compliance Check"]
    WaitVerification --> ExecuteHire

    %% Analytics & Intelligence
    RCat5 --> HireAnalytics["Hire Analytics Dashboard<br>Avg time to hire<br>Rejection analysis<br>Stage bottlenecks"]
    RCat5 --> TimeToHire["Time-to-Hire Detail<br>Per-candidate timelines<br>Stage-by-stage breakdown"]
    RCat5 --> HirePredictor["Hire Success Predictor<br>Run predictions per application<br>Factor breakdown"]
    RCat5 --> OnboardingPage["Onboarding Success Predictor<br>Predict retention probability<br>Risk factor analysis"]
    RCat5 --> GhostingRisk["Ghosting Risk Detail<br>Per-candidate risk scores<br>Send reminders<br>Schedule follow-ups"]
    RCat5 --> ReferralIntel["Referral Intelligence<br>Track referral sources<br>Referrer performance<br>Network strength analysis"]
    RCat5 --> MarketAlerts["Market Alerts<br>Salary trend alerts<br>Demand/supply imbalance<br>Competitor hiring activity"]
    RCat5 --> Engagement["Candidate Engagement<br>Track response times<br>Communication frequency<br>Engagement scores"]

    %% Verification & Compliance
    RCat6 --> SkillVerifyPage["Skill Verification Status<br>Review claimed vs verified<br>Approve/reject skills"]
    RCat6 --> BackgroundChecks["Background Check Management<br>Initiate checks<br>View vendor results<br>Risk assessment"]
    RCat6 --> BlockchainPage["Blockchain Verifications<br>Submit credentials on-chain<br>Verify credential hashes"]
    RCat6 --> ScreeningBot["Screening Bot Configuration<br>Configure screening rules<br>Confidence thresholds<br>sp_AutoScreenApplicationEnhanced"]
    RCat6 --> AutoRejection["Auto Rejection Log<br>View auto-rejected applications<br>Screening bot decisions"]
    RCat6 --> AIQuestions["AI Question Generator<br>Generate per-job questions<br>Difficulty calibration"]
    RCat6 --> PlatformSync["External Platform Sync<br>Sync jobs to LinkedIn/Indeed<br>Track application sources"]

    %% ============ CANDIDATE BRANCH ============
    CandidateDash --> CandidateMenu{"Candidate Actions"}
    CandidateMenu -- Job Discovery --> CCat1["Job Discovery"]
    CandidateMenu -- Applications --> CCat2["Applications"]
    CandidateMenu -- Profile & Skills --> CCat3["Profile & Skills"]
    CandidateMenu -- Career Development --> CCat4["Career Development"]
    CandidateMenu -- Interviews & Prefs --> CCat5["Interviews & Preferences"]

    %% Job Discovery flow
    CCat1 --> BrowseJobs["View Active Job Postings<br>Filter by Location/Skills"]
    BrowseJobs --> ShowJobs["SELECT FROM JobPostings<br>WHERE IsActive = 1"]
    ShowJobs --> ShowSalary{"Salary Shown?"}
    ShowSalary -- Yes --> DisplayRange["Show Salary Range<br>Compare to Market<br>Benchmark Analysis"]
    ShowSalary -- No --> NoSalary["Salary Not Disclosed<br>Market Data Available"]

    %% Applications flow
    CCat2 --> ApplyJob["Select Job & Apply"]
    ApplyJob --> CheckDuplicate{"Already<br>Applied?"}
    CheckDuplicate -- Yes --> DuplicateBlock["Duplicate Prevented<br>UNIQUE Constraint"]
    CheckDuplicate -- No --> NegotiationPrep["Salary Negotiation Prep<br>sp_GenerateNegotiationStrategy"]
    NegotiationPrep --> RemoteAnalysis["Remote Compatibility Analysis<br>sp_AnalyzeRemoteCompatibility"]
    RemoteAnalysis --> CreateApplication["INSERT INTO Applications<br>StatusID = 1 Applied"]
    CreateApplication --> AutoScreenBot["Auto Screening Bot<br>sp_AutoScreenApplicationEnhanced<br>Confidence Score"]
    AutoScreenBot --> AutoMatch["System Calculates Match Score<br>vw_CandidateMatchScore"]
    AutoMatch --> CheckQualified{"Meets Mandatory<br>Requirements?"}
    CheckQualified -- No --> AutoReject["Flagged for Auto-Rejection"]
    CheckQualified -- Yes --> RemoteCheck["Remote Compatibility<br>sp_AnalyzeRemoteCompatibility"]
    RemoteCheck --> VisibleToRecruiters["Visible to Recruiters<br>With Match Score"]
    CCat2 --> ViewMyApps["View My Applications<br>Current Status<br>Sentiment History"]
    ViewMyApps --> DisplayApps["SELECT Applications<br>WHERE CandidateID = @CurrentUser"]
    DisplayApps --> ShowStatus["Show Current Status<br>Applied/Screening/Interview<br>Hired/Rejected"]
    ShowStatus --> GhostMonitor["Ghosting Monitor<br>Track Response Times<br>Risk Alerts"]
    CCat2 --> WithdrawApp["Withdraw Application"]
    WithdrawApp --> CallSP3["sp_WithdrawApplication<br>@ApplicationID, @CandidateID, @Reason"]
    CallSP3 --> ValidateOwner{"Owns<br>Application?"}
    ValidateOwner -- No --> BlockWithdraw["Block Withdrawal<br>Not Your Application"]
    ValidateOwner -- Yes --> CheckFinal{"Already<br>Hired/Rejected?"}
    CheckFinal -- Yes --> BlockFinal["Cannot Withdraw<br>Terminal State"]
    CheckFinal -- No --> AllowWithdraw["UPDATE to Withdrawn<br>Record Reason & History"]

    %% Profile & Skills flow
    CCat3 --> ManageProfile["Update Skills<br>Update Experience<br>Upload Documents"]
    ManageProfile --> UpdateSkills2["UPDATE CandidateSkills<br>Set Proficiency Levels"]
    UpdateSkills2 --> RemoteAssess["Remote Assessment<br>Workspace Quality<br>Timezone Alignment"]
    RemoteAssess --> UploadDocs["INSERT INTO CandidateDocuments<br>Resume/Certificates"]
    UploadDocs --> ResumeProcessing["Resume NLP Processing<br>Automatic Skill Extraction<br>Quality Scoring"]
    CCat3 --> SkillGaps["Skill Gap Analysis<br>Compare my skills to job reqs<br>Priority gaps highlighted"]
    CCat3 --> ResumeScorePage["Resume Quality Score<br>NLP analysis<br>Skill extraction confidence<br>Readability metrics"]

    %% Career Development
    CCat4 --> LearningPaths["Learning Paths<br>Personalized roadmap<br>Resource recommendations<br>sp_GenerateLearningPath"]
    CCat4 --> CareerPath["Career Path Simulator<br>Simulate role transitions<br>Transition probability<br>sp_PredictCareerPath"]
    CCat4 --> SalaryCoach["Salary Coach<br>Generate negotiation strategy<br>Counter-offer recommendations<br>sp_GenerateNegotiationStrategy"]
    CCat4 --> Achievements["Achievements & Leaderboard<br>Points & levels<br>Badges & streaks<br>Global rank<br>sp_AwardGamificationPoints"]

    %% Interviews & Preferences
    CCat5 --> ViewInterviews["View Scheduled Interviews<br>Confirm Attendance"]
    ViewInterviews --> GetSchedules["SELECT FROM InterviewSchedules<br>WHERE ApplicationID IN MyApps"]
    GetSchedules --> FatigueCheck["Interview Fatigue Check<br>Repeated Questions<br>Optimization"]
    FatigueCheck --> ConfirmInt["UPDATE CandidateConfirmed = 1"]
    CCat5 --> LocationPrefs["Location Preferences<br>Set preferred work locations<br>Remote/onsite/hybrid<br>Relocation willingness"]
    CCat5 --> InterviewPrep["Interview Prep Materials<br>Study resources per job<br>Track prep progress<br>CandidatePrepProgress"]

    %% ============ PLATFORM FEATURES (cross-cutting) ============
    subgraph Platform["Platform Features — all roles"]
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
    class AdminDash,AdminMenu,AdminCat1,AdminCat2,AdminCat3,AdminCat4,ManageUsers,AdminAnalytics,AdminReports,SystemConfig,AIModels,ViewAuditLog,CoreViews,EnhancedViews,RunArchive,RunMarketAlerts,ManageAI,MonitorPerformance,DiversityGoals,BiasLogs,ConsentMgmt,EmailQueueAdmin,SecurityLogs,SqlViews,VacancyUtil,Maintenance adminClass
    class RecruiterDash,RecruiterMenu,RCat1,RCat2,RCat3,RCat4,RCat5,RCat6,PostJob,ReviewCand,ScheduleInt,UpdateStatusNode,HireCand,DefineSkills,GenerateQuestions,SalaryOption,AddSalary,SkipSalary,SaveJob,ViewMatchScore,CheckMandatory,NotQualified,SkillVerification,ShowVerified,ShowUnverified,ShowRanked,AI_Prediction,ResumeScore,InterviewOptimize,VideoOption,ScheduleVideo,Transcription,PredictOnboarding,BackgroundCheck,InitiateCheck,WaitVerification,TalentPool,SkillVerifyPage,BackgroundChecks,Engagement,PlatformSync,HireAnalytics,TimeToHire,ReferralIntel,MarketAlerts,GhostingRisk,AIQuestions,HirePredictor,OnboardingPage,InterviewFatigue,BlockchainPage,AutoRejection,ScreeningBot recruiterClass
    class CandidateDash,CandidateMenu,CCat1,CCat2,CCat3,CCat4,CCat5,BrowseJobs,ApplyJob,ViewMyApps,ManageProfile,ViewInterviews,WithdrawApp,ShowJobs,ShowSalary,DisplayRange,NoSalary,DuplicateBlock,NegotiationPrep,RemoteAnalysis,CreateApplication,AutoScreenBot,AutoMatch,AutoReject,RemoteCheck,VisibleToRecruiters,DisplayApps,ShowStatus,GhostMonitor,UpdateSkills2,RemoteAssess,UploadDocs,ResumeProcessing,GetSchedules,FatigueCheck,ConfirmInt,BlockWithdraw,BlockFinal,SkillGaps,LearningPaths,CareerPath,ResumeScorePage,SalaryCoach,Achievements,LocationPrefs,InterviewPrep candidateClass
    class CheckConflict,BlockSchedule,CreateInterview,EmailQueue,CallSP1,ValidateTransition,BlockTransition,AllowTransition,CallSP2,LockRecords,CheckStage,RollbackHire,CheckVacancy,RollbackFull,ExecuteHire,CallSP3,ValidateOwner,AllowWithdraw processClass
    class Chatbot,Notifications,ThemeToggle,Platform platformClass
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
