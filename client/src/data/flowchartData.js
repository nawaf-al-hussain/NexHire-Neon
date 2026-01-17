// Full system flowchart from the NexHire documentation.
// Rendered client-side via Mermaid.js (loaded from CDN on demand).
// Source: NexHire Documentation For Collaboration (main.tex, Section 7)
//         + expanded to cover all recruiter/candidate/admin feature pages.
//
// Layout: TD (top-down) — better aspect ratio for 115+ nodes than LR.

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
    AdminMenu -- Manage Users --> ManageUsers["View/Edit/Deactivate Users<br>Assign Roles"]
    AdminMenu -- View Analytics --> AdminAnalytics["System-Wide Analytics<br>All Hiring Metrics<br>Audit Logs<br>AI Predictions<br>Blockchain Verifications"]
    AdminMenu -- Run Reports --> AdminReports["Bias Detection<br>Skill Gap Analysis<br>Recruiter Performance Reports"]
    AdminMenu -- System Config --> SystemConfig["Archive Old Data<br>Anonymize Candidates<br>System Settings<br>Consent Management"]
    AdminMenu -- AI Models --> AIModels["Manage AI Models<br>Question Generator<br>Prediction Algorithms"]

    AdminAnalytics --> ViewAuditLog["View Complete Audit Trail<br>All Status Changes<br>All User Actions"]
    AdminReports --> CoreViews["Core Analytical Views<br>vw_SkillGapAnalysis<br>vw_SilentRejections<br>vw_Bias_Location<br>vw_Bias_Experience<br>vw_HiringBottlenecks<br>vw_RecruiterPerformance<br>vw_ApplicationFunnel<br>vw_TimeToHire / vw_AverageTimeToHire<br>vw_HireRatePerJob<br>vw_InterviewerConsistency<br>vw_InterviewScoreVsDecision<br>vw_CandidateEngagement<br>vw_RejectionAnalysis"]
    CoreViews --> EnhancedViews["Enhanced Views<br>vw_DiversityAnalyticsFunnel<br>vw_MarketIntelligenceDashboard<br>vw_GhostingRiskDashboard<br>vw_SalaryTransparency<br>vw_RemoteCompatibilityMatrix<br>vw_CareerPathInsights<br>vw_ReferralIntelligence<br>vw_SkillVerificationStatus<br>vw_TalentPipelineHealthEnhanced<br>vw_CostPerHireEnhanced<br>vw_BiasStatisticalAnalysisEnhanced"]

    SystemConfig --> RunArchive["Execute sp_ArchiveOldData<br>sp_AnonymizeArchivedCandidates<br>sp_CheckConsentExpiry"]
    RunArchive --> RunMarketAlerts["Execute sp_GenerateMarketAlerts"]
    AIModels --> ManageAI["Configure AI Settings<br>Question Generation Rules<br>Prediction Algorithms"]
    ManageAI --> MonitorPerformance["Monitor AI Accuracy<br>Model Performance<br>Update Models"]

    %% NEW ADMIN PAGES
    AdminMenu -- Diversity & Bias --> DiversityGoals["Diversity Goals<br>Track hiring targets by demographic<br>Progress vs Target Percentage"]
    DiversityGoals --> BiasLogs["Bias Detection Logs<br>Automated bias alerts<br>Recruiter-specific patterns"]
    AdminMenu -- Consent Mgmt --> ConsentMgmt["Consent Management<br>Track candidate consents<br>GDPR expiry checks<br>sp_CheckConsentExpiry"]
    AdminMenu -- Email Queue --> EmailQueueAdmin["Email Queue Manager<br>View queued/sent/failed<br>Retry failed sends<br>Template management"]
    AdminMenu -- Security Logs --> SecurityLogs["Security & Audit Logs<br>Failed login attempts<br>Permission changes<br>Data access audit"]
    AdminMenu -- SQL Views --> SqlViews["SQL Views Explorer<br>Browse all 28 views<br>Run ad-hoc queries<br>Export results"]
    AdminMenu -- Vacancy Util --> VacancyUtil["Vacancy Utilization<br>Track filled vs open<br>Cost per hire analysis"]
    AdminMenu -- Maintenance --> Maintenance["System Maintenance<br>Archive old data<br>Anonymize PII<br>Rebuild indexes<br>Statistics update"]

    %% ============ RECRUITER BRANCH ============
    RecruiterDash --> RecruiterMenu{"Recruiter Actions"}
    RecruiterMenu -- Post Jobs --> PostJob["Create Job Posting<br>Title, Location, Experience<br>Vacancies, Description"]
    RecruiterMenu -- Review Candidates --> ReviewCand["View Candidate Matching<br>Weighted Scores<br>Skills Match<br>AI Predictions"]
    RecruiterMenu -- Schedule Interviews --> ScheduleInt["Schedule Interviews<br>Conflict Detection"]
    RecruiterMenu -- Update Status --> UpdateStatusNode["Move Applications<br>Through Workflow"]
    RecruiterMenu -- Hire Candidates --> HireCand["Execute Hire<br>Concurrency Safe"]

    %% Post Job flow
    PostJob --> DefineSkills["Define Required Skills<br>Mandatory vs Optional<br>Min Proficiency Levels"]
    DefineSkills --> GenerateQuestions["Generate Interview Questions<br>sp_GenerateInterviewQuestions"]
    GenerateQuestions --> SalaryOption{"Add Salary Range?"}
    SalaryOption -- Yes --> AddSalary["Set Min/Max Salary<br>Benefits Summary<br>Mark as Transparent"]
    SalaryOption -- No --> SkipSalary["Skip Salary"]
    AddSalary --> SaveJob["INSERT INTO JobPostings<br>INSERT INTO JobSkills<br>Save AI Questions"]
    SkipSalary --> SaveJob

    %% Review Candidates flow
    ReviewCand --> ViewMatchScore["View vw_CandidateMatchScore<br>Ranked by Algorithm<br>sp_AdvancedCandidateMatchingEnhanced"]
    ViewMatchScore --> CheckMandatory{"Meets Mandatory<br>Skills?"}
    CheckMandatory -- No --> NotQualified["Filtered Out<br>sp_AutoRejectUnqualified<br>Auto Screening Bot"]
    CheckMandatory -- Yes --> SkillVerification{"Skills Verified?"}
    SkillVerification -- Yes --> ShowVerified["Show with Verified Badge<br>Blockchain Verified"]
    SkillVerification -- No --> ShowUnverified["Flag for Assessment<br>Micro-Certifications"]
    ShowVerified --> ShowRanked["Show with Score<br>Skill + Experience + Location"]
    ShowUnverified --> ShowRanked
    ShowRanked --> AI_Prediction["AI Success Prediction<br>sp_PredictHireSuccess<br>Probability Score"]
    AI_Prediction --> ResumeScore["Resume Quality Score<br>NLP Extracted Skills<br>Readability Analysis"]

    %% Schedule Interview flow
    ScheduleInt --> InterviewOptimize["Optimize Rounds<br>sp_OptimizeInterviewRounds"]
    InterviewOptimize --> CheckConflict["trg_PreventDoubleBooking<br>Check Temporal Overlap"]
    CheckConflict -- Conflict --> BlockSchedule["Scheduling Blocked<br>Recruiter Already Booked"]
    CheckConflict -- No Conflict --> CreateInterview["INSERT INTO InterviewSchedules<br>trg_SendInterviewEmail"]
    CreateInterview --> VideoOption{"Video Interview?"}
    VideoOption -- Yes --> ScheduleVideo["Schedule Video Platform<br>Zoom/Teams Integration<br>Recording Consent"]
    VideoOption -- No --> EmailQueue["Email Added to Queue"]
    ScheduleVideo --> Transcription["Automatic Transcription<br>Speech-to-Text<br>Sentiment Analysis"]

    %% Update Status flow
    UpdateStatusNode --> CallSP1["sp_UpdateApplicationStatus<br>@ApplicationID, @NewStatusID"]
    CallSP1 --> ValidateTransition{"Valid State<br>Transition?"}
    ValidateTransition -- No --> BlockTransition["Invalid Transition<br>State Machine Prevents"]
    ValidateTransition -- Yes --> AllowTransition["Update Applications<br>Record in History<br>Trigger Audit Log"]
    BlockTransition --> UpdateStatusNode

    %% Hire flow
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

    %% NEW RECRUITER PAGES
    RecruiterMenu -- Talent Pool --> TalentPool["Talent Pool<br>Browse all candidates<br>Filter by skills/location<br>Resume score ranking"]
    RecruiterMenu -- Skill Verify --> SkillVerifyPage["Skill Verification Status<br>Review claimed vs verified<br>Approve/reject skills<br>sp_verify-skill"]
    RecruiterMenu -- Background Checks --> BackgroundChecks["Background Check Management<br>Initiate checks<br>View vendor results<br>Risk assessment"]
    RecruiterMenu -- Engagement --> Engagement["Candidate Engagement<br>Track response times<br>Communication frequency<br>Engagement scores"]
    RecruiterMenu -- Platform Sync --> PlatformSync["External Platform Sync<br>Sync jobs to LinkedIn/Indeed<br>Track application sources<br>Sync status monitoring"]
    RecruiterMenu -- Hire Analytics --> HireAnalytics["Hire Analytics Dashboard<br>Avg time to hire<br>Rejection analysis<br>Stage bottlenecks<br>Diversity funnel"]
    RecruiterMenu -- Time to Hire --> TimeToHire["Time-to-Hire Detail<br>Individual candidate timelines<br>Stage-by-stage breakdown<br>Bottleneck identification"]
    RecruiterMenu -- Referral Intel --> ReferralIntel["Referral Intelligence<br>Track referral sources<br>Referrer performance<br>Network strength analysis<br>sp_SuggestReferrals"]
    RecruiterMenu -- Market Alerts --> MarketAlerts["Market Alerts<br>Salary trend alerts<br>Demand/supply imbalance<br>Competitor hiring activity<br>sp_GenerateMarketAlerts"]
    RecruiterMenu -- Ghosting Risk --> GhostingRisk["Ghosting Risk Detail<br>Per-candidate risk scores<br>Send reminders<br>Schedule follow-ups<br>sp_PredictGhostingRisk"]
    RecruiterMenu -- AI Questions --> AIQuestions["AI Question Generator<br>Generate per-job questions<br>Difficulty calibration<br>sp_GenerateInterviewQuestions"]
    RecruiterMenu -- Hire Predictor --> HirePredictor["Hire Success Predictor<br>Run predictions per application<br>Factor breakdown<br>sp_PredictHireSuccess"]
    RecruiterMenu -- Onboarding --> OnboardingPage["Onboarding Success Predictor<br>Predict retention probability<br>Risk factor analysis<br>sp_PredictOnboardingSuccess"]
    RecruiterMenu -- Interview Fatigue --> InterviewFatigue["Interview Fatigue Reducer<br>Detect redundant questions<br>Optimize interview rounds<br>sp_OptimizeInterviewRounds"]
    RecruiterMenu -- Blockchain Verif --> BlockchainPage["Blockchain Verifications<br>Submit credentials on-chain<br>Verify credential hashes<br>Track verification status"]
    RecruiterMenu -- Auto Rejection --> AutoRejection["Auto Rejection Log<br>View auto-rejected applications<br>Screening bot decisions<br>sp_AutoRejectUnqualified"]
    RecruiterMenu -- Screening Bot --> ScreeningBot["Screening Bot Configuration<br>Configure screening rules<br>Confidence thresholds<br>sp_AutoScreenApplicationEnhanced"]

    %% ============ CANDIDATE BRANCH ============
    CandidateDash --> CandidateMenu{"Candidate Actions"}
    CandidateMenu -- Browse Jobs --> BrowseJobs["View Active Job Postings<br>Filter by Location/Skills"]
    CandidateMenu -- Apply to Jobs --> ApplyJob["Select Job & Apply"]
    CandidateMenu -- View Applications --> ViewMyApps["View My Applications<br>Current Status<br>Sentiment History"]
    CandidateMenu -- Manage Profile --> ManageProfile["Update Skills<br>Update Experience<br>Upload Documents"]
    CandidateMenu -- View Interviews --> ViewInterviews["View Scheduled Interviews<br>Confirm Attendance"]
    CandidateMenu -- Withdraw --> WithdrawApp["Withdraw Application"]

    %% Browse Jobs flow
    BrowseJobs --> ShowJobs["SELECT FROM JobPostings<br>WHERE IsActive = 1"]
    ShowJobs --> ShowSalary{"Salary Shown?"}
    ShowSalary -- Yes --> DisplayRange["Show Salary Range<br>Compare to Market<br>Benchmark Analysis"]
    ShowSalary -- No --> NoSalary["Salary Not Disclosed<br>Market Data Available"]

    %% Apply flow
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

    %% View Applications flow
    ViewMyApps --> DisplayApps["SELECT Applications<br>WHERE CandidateID = @CurrentUser"]
    DisplayApps --> ShowStatus["Show Current Status<br>Applied/Screening/Interview<br>Hired/Rejected"]
    ShowStatus --> GhostMonitor["Ghosting Monitor<br>Track Response Times<br>Risk Alerts"]

    %% Manage Profile flow
    ManageProfile --> UpdateSkills2["UPDATE CandidateSkills<br>Set Proficiency Levels"]
    UpdateSkills2 --> RemoteAssess["Remote Assessment<br>Workspace Quality<br>Timezone Alignment"]
    RemoteAssess --> UploadDocs["INSERT INTO CandidateDocuments<br>Resume/Certificates"]
    UploadDocs --> ResumeProcessing["Resume NLP Processing<br>Automatic Skill Extraction<br>Quality Scoring"]

    %% View Interviews flow
    ViewInterviews --> GetSchedules["SELECT FROM InterviewSchedules<br>WHERE ApplicationID IN MyApps"]
    GetSchedules --> FatigueCheck["Interview Fatigue Check<br>Repeated Questions<br>Optimization"]
    FatigueCheck --> ConfirmInt["UPDATE CandidateConfirmed = 1"]

    %% Withdraw flow
    WithdrawApp --> CallSP3["sp_WithdrawApplication<br>@ApplicationID, @CandidateID, @Reason"]
    CallSP3 --> ValidateOwner{"Owns<br>Application?"}
    ValidateOwner -- No --> BlockWithdraw["Block Withdrawal<br>Not Your Application"]
    ValidateOwner -- Yes --> CheckFinal{"Already<br>Hired/Rejected?"}
    CheckFinal -- Yes --> BlockFinal["Cannot Withdraw<br>Terminal State"]
    CheckFinal -- No --> AllowWithdraw["UPDATE to Withdrawn<br>Record Reason & History"]

    %% NEW CANDIDATE PAGES
    CandidateMenu -- Skill Gaps --> SkillGaps["Skill Gap Analysis<br>Compare my skills to job reqs<br>Priority gaps highlighted<br>Demand vs supply scores"]
    CandidateMenu -- Learning --> LearningPaths["Learning Paths<br>Personalized roadmap<br>Resource recommendations<br>sp_GenerateLearningPath"]
    CandidateMenu -- Career Path --> CareerPath["Career Path Simulator<br>Simulate role transitions<br>Transition probability<br>sp_PredictCareerPath"]
    CandidateMenu -- Resume Score --> ResumeScorePage["Resume Quality Score<br>NLP analysis<br>Skill extraction confidence<br>Readability metrics"]
    CandidateMenu -- Salary Coach --> SalaryCoach["Salary Coach<br>Generate negotiation strategy<br>Counter-offer recommendations<br>sp_GenerateNegotiationStrategy"]
    CandidateMenu -- Achievements --> Achievements["Achievements & Leaderboard<br>Points & levels<br>Badges & streaks<br>Global rank<br>sp_AwardGamificationPoints"]
    CandidateMenu -- Location Prefs --> LocationPrefs["Location Preferences<br>Set preferred work locations<br>Remote/onsite/hybrid<br>Relocation willingness"]
    CandidateMenu -- Interview Prep --> InterviewPrep["Interview Prep Materials<br>Study resources per job<br>Track prep progress<br>CandidatePrepProgress"]

    %% ============ PLATFORM FEATURES (cross-cutting) ============
    subgraph Platform["Platform Features (all roles)"]
        Chatbot["AI Chatbot Assistant<br>Floating help widget<br>FAQ + context awareness<br>sp_GenerateChatbotResponse"]
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
