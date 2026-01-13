// Full system flowchart from the NexHire documentation.
// Rendered client-side via Mermaid.js (loaded from CDN on demand).
// Source: NexHire Documentation For Collaboration (main.tex, Section 7)

// The ---config--- frontmatter is converted to mermaid.initialize() options
// in the component. The diagram body below is passed directly to mermaid.run().

export const flowchartMermaid = `flowchart LR
    Start(["User Visits System"]) --> Login{"Login/Signup"}
    Login -- New User --> Signup["Sign Up Form"]
    Login -- Existing User --> Auth["Authentication"]
    Auth --> ValidateCreds{"Validate<br>Credentials"}
    ValidateCreds -- Invalid --> LoginFail["Login Failed"]
    ValidateCreds -- Valid --> CheckRole{"Check Role"}
    LoginFail --> Login
    CheckRole -- "RoleID = 1" --> AdminDash["ADMIN DASHBOARD"]
    CheckRole -- "RoleID = 2" --> RecruiterDash["RECRUITER DASHBOARD"]
    CheckRole -- "RoleID = 3" --> CandidateDash["CANDIDATE DASHBOARD"]

    AdminDash --> AdminMenu{"Admin Actions"}
    AdminMenu -- Manage Users --> ManageUsers["View/Edit/Deactivate Users<br>Assign Roles"]
    AdminMenu -- View Analytics --> AdminAnalytics["System-Wide Analytics<br>All Hiring Metrics<br>Audit Logs<br>AI Predictions<br>Blockchain Verifications"]
    AdminMenu -- Run Reports --> AdminReports["Bias Detection<br>Skill Gap Analysis<br>Recruiter Performance Reports"]
    AdminMenu -- System Config --> SystemConfig["Archive Old Data<br>Anonymize Candidates<br>System Settings<br>Consent Management"]
    AdminMenu -- NEW: AI Models --> AIModels["Manage AI Models<br>Question Generator<br>Prediction Models"]

    AdminAnalytics --> ViewAuditLog["View Complete Audit Trail<br>All Status Changes<br>All User Actions"]
    AdminReports --> n1["View<br>vw_SkillGapAnalysis<br>vw_SilentRejections<br>vw_Bias_Location<br>vw_Bias_Experience<br>vw_HiringBottlenecks<br>vw_RecruiterPerformance<br>vw_ApplicationFunnel<br>vw_TimeToHire<br>vw_AverageTimeToHire<br>vw_HireRatePerJob<br>vw_InterviewerConsistency<br>vw_InterviewScoreVsDecision<br>vw_CandidateEngagement<br>vw_RejectionAnalysis"]
    n1 --> n2["ENHANCED VIEWS:<br>vw_DiversityAnalyticsFunnel<br>vw_MarketIntelligenceDashboard<br>vw_GhostingRiskDashboard<br>vw_SalaryTransparency<br>vw_RemoteCompatibilityMatrix<br>vw_CareerPathInsights<br>vw_ReferralIntelligence<br>vw_SkillVerificationStatus<br>vw_TalentPipelineHealthEnhanced<br>vw_CostPerHireEnhanced<br>vw_BiasStatisticalAnalysisEnhanced"]
    SystemConfig --> RunArchive["Execute sp_ArchiveOldData<br>Execute sp_AnonymizeArchivedCandidates<br>sp_CheckConsentExpiry"]
    RunArchive --> RunMarketAlerts["Execute sp_GenerateMarketAlerts"]
    AIModels --> ManageAI["Configure AI Settings<br>Question Generation Rules<br>Prediction Algorithms"]
    ManageAI --> MonitorPerformance["Monitor AI Accuracy<br>Model Performance<br>Update Models"]

    RecruiterDash --> RecruiterMenu{"Recruiter Actions"}
    RecruiterMenu -- Post Jobs --> PostJob["Create Job Posting<br>Title, Location, Experience<br>Vacancies, Description"]
    RecruiterMenu -- Review Candidates --> ReviewCand["View Candidate Matching<br>Weighted Scores<br>Skills Match<br>AI Predictions"]
    RecruiterMenu -- Schedule Interviews --> ScheduleInt["Schedule Interviews<br>Conflict Detection"]
    RecruiterMenu -- Update Status --> UpdateStatusNode["Move Applications<br>Through Workflow"]
    RecruiterMenu -- Hire Candidates --> HireCand["Execute Hire<br>Concurrency Safe"]

    PostJob --> DefineSkills["Define Required Skills<br>Mandatory vs Optional<br>Min Proficiency Levels"]
    DefineSkills --> GenerateQuestions["NEW: Generate Interview Questions<br>sp_GenerateInterviewQuestions"]
    GenerateQuestions --> SalaryOption{"Add Salary Range?"}
    SalaryOption -- Yes --> AddSalary["Set Min/Max Salary<br>Benefits Summary<br>Mark as Transparent"]
    SalaryOption -- No --> SkipSalary["Skip Salary"]
    AddSalary --> SaveJob["INSERT INTO JobPostings<br>INSERT INTO JobSkills<br>Save AI Questions"]
    SkipSalary --> SaveJob

    ReviewCand --> ViewMatchScore["View vw_CandidateMatchScore<br>Ranked by Algorithm<br>Enhanced: sp_AdvancedCandidateMatchingEnhanced"]
    ViewMatchScore --> CheckMandatory{"Meets Mandatory<br>Skills?"}
    CheckMandatory -- No --> NotQualified["Not Shown<br>Filtered Out<br>sp_AutoRejectUnqualified<br>Auto Screening Bot"]
    CheckMandatory -- Yes --> SkillVerification{"Skills Verified?"}
    SkillVerification -- Yes --> ShowVerified["Show with Verified Badge<br>Blockchain Verified"]
    SkillVerification -- No --> ShowUnverified["Flag for Assessment<br>Micro-Certifications"]
    ShowVerified --> ShowRanked["Show with Score<br>Skill + Experience + Location"]
    ShowUnverified --> ShowRanked
    ShowRanked --> AI_Prediction["NEW: AI Success Prediction<br>sp_PredictHireSuccess<br>Probability Score"]
    AI_Prediction --> ResumeScore["NEW: Resume Quality Score<br>NLP Extracted Skills<br>Readability Analysis"]

    ScheduleInt --> InterviewOptimize["Optimize Rounds<br>sp_OptimizeInterviewRounds"]
    InterviewOptimize --> CheckConflict["trg_PreventDoubleBooking<br>Check Temporal Overlap"]
    CheckConflict -- Conflict --> BlockSchedule["Scheduling Blocked<br>Recruiter Already Booked"]
    CheckConflict -- No Conflict --> CreateInterview["INSERT INTO InterviewSchedules<br>trg_SendInterviewEmail"]
    CreateInterview --> VideoOption{"NEW: Video Interview?"}
    VideoOption -- Yes --> ScheduleVideo["Schedule Video Platform<br>Zoom/Teams Integration<br>Recording Consent"]
    VideoOption -- No --> EmailQueue["Email Added to Queue"]
    ScheduleVideo --> Transcription["NEW: Automatic Transcription<br>Speech-to-Text<br>Sentiment Analysis"]

    UpdateStatusNode --> CallSP1["sp_UpdateApplicationStatus<br>@ApplicationID, @NewStatusID"]
    CallSP1 --> ValidateTransition{"Valid State<br>Transition?"}
    ValidateTransition -- No --> BlockTransition["Invalid Transition<br>State Machine Prevents"]
    ValidateTransition -- Yes --> AllowTransition["Update Applications<br>Record in History<br>Trigger Audit Log"]
    BlockTransition --> UpdateStatusNode

    HireCand --> CallSP2["sp_HireCandidate<br>@ApplicationID, @RecruiterID"]
    CallSP2 --> LockRecords["BEGIN TRANSACTION<br>UPDLOCK, HOLDLOCK"]
    LockRecords --> CheckStage{"In Interview<br>Stage?"}
    CheckStage -- No --> RollbackHire["ROLLBACK<br>Not in Interview Stage"]
    CheckStage -- Yes --> CheckVacancy{"Vacancies<br>Available?"}
    CheckVacancy -- No --> RollbackFull["ROLLBACK<br>No Vacancies Remaining"]
    CheckVacancy -- Yes --> PredictOnboarding["Predict Onboarding Success<br>sp_PredictOnboardingSuccess"]
    PredictOnboarding --> BackgroundCheck{"NEW: Background Check?"}
    BackgroundCheck -- Yes --> InitiateCheck["Start Background Check<br>Criminal/Education/Employment<br>Vendor Integration"]
    BackgroundCheck -- No --> ExecuteHire["Update to Hired<br>Decrement Vacancies<br>Record History<br>COMMIT TRANSACTION"]
    InitiateCheck --> WaitVerification["Wait for Verification<br>Risk Assessment<br>Compliance Check"]
    WaitVerification --> ExecuteHire

    CandidateDash --> CandidateMenu{"Candidate Actions"}
    CandidateMenu -- Browse Jobs --> BrowseJobs["View Active Job Postings<br>Filter by Location/Skills"]
    CandidateMenu -- Apply to Jobs --> ApplyJob["Select Job & Apply"]
    CandidateMenu -- View Applications --> ViewMyApps["View My Applications<br>Current Status<br>Sentiment History"]
    CandidateMenu -- Manage Profile --> ManageProfile["Update Skills<br>Update Experience<br>Upload Documents"]
    CandidateMenu -- View Interviews --> ViewInterviews["View Scheduled Interviews<br>Confirm Attendance"]
    CandidateMenu -- Withdraw --> WithdrawApp["Withdraw Application"]

    BrowseJobs --> ShowJobs["SELECT FROM JobPostings<br>WHERE IsActive = 1"]
    ShowJobs --> ShowSalary{"Salary Shown?"}
    ShowSalary -- Yes --> DisplayRange["Show Salary Range<br>Compare to Market<br>Benchmark Analysis"]
    ShowSalary -- No --> NoSalary["Salary Not Disclosed<br>Market Data Available"]

    ApplyJob --> CheckDuplicate{"Already<br>Applied?"}
    CheckDuplicate -- Yes --> DuplicateBlock["Duplicate Prevented<br>UNIQUE Constraint"]
    CheckDuplicate -- No --> NegotiationPrep["Salary Negotiation Prep<br>sp_GenerateNegotiationStrategy"]
    NegotiationPrep --> RemoteAnalysis["Remote Compatibility Analysis<br>sp_AnalyzeRemoteCompatibility"]
    RemoteAnalysis --> CreateApplication["INSERT INTO Applications<br>StatusID = 1 Applied"]
    CreateApplication --> AutoScreenBot["NEW: Auto Screening Bot<br>sp_AutoScreenApplicationEnhanced<br>Confidence Score"]
    AutoScreenBot --> AutoMatch["System Calculates<br>Match Score<br>vw_CandidateMatchScore"]
    AutoMatch --> CheckQualified{"Meets Mandatory<br>Requirements?"}
    CheckQualified -- No --> AutoReject["Flagged for<br>Auto-Rejection"]
    CheckQualified -- Yes --> RemoteCheck["Remote Compatibility<br>sp_AnalyzeRemoteCompatibility"]
    RemoteCheck --> VisibleToRecruiters["Visible to Recruiters<br>With Match Score"]

    ViewMyApps --> DisplayApps["SELECT Applications<br>WHERE CandidateID = @CurrentUser"]
    DisplayApps --> ShowStatus["Show Current Status<br>Applied/Screening/Interview<br>Hired/Rejected"]
    ShowStatus --> GhostMonitor["Ghosting Monitor<br>Track Response Times<br>Risk Alerts"]

    ManageProfile --> UpdateSkills2["UPDATE CandidateSkills<br>Set Proficiency Levels"]
    UpdateSkills2 --> RemoteAssess["Remote Assessment<br>Workspace Quality<br>Timezone Alignment"]
    RemoteAssess --> UploadDocs["INSERT INTO CandidateDocuments<br>Resume/Certificates"]
    UploadDocs --> ResumeProcessing["NEW: Resume NLP Processing<br>Automatic Skill Extraction<br>Quality Scoring"]

    ViewInterviews --> GetSchedules["SELECT FROM InterviewSchedules<br>WHERE ApplicationID IN MyApps"]
    GetSchedules --> FatigueCheck["Interview Fatigue Check<br>Repeated Questions<br>Optimization"]
    FatigueCheck --> ConfirmInt["UPDATE CandidateConfirmed<br>= 1"]

    WithdrawApp --> CallSP3["sp_WithdrawApplication<br>@ApplicationID, @CandidateID, @Reason"]
    CallSP3 --> ValidateOwner{"Owns<br>Application?"}
    ValidateOwner -- No --> BlockWithdraw["Block Withdrawal<br>Not Your Application"]
    ValidateOwner -- Yes --> CheckFinal{"Already<br>Hired/Rejected?"}
    CheckFinal -- Yes --> BlockFinal["Cannot Withdraw<br>Terminal State"]
    CheckFinal -- No --> AllowWithdraw["UPDATE to Withdrawn<br>Record Reason & History"]

    class Auth,ValidateCreds,CheckRole securityClass
    class AdminDash,AdminMenu,ManageUsers,AdminAnalytics,AdminReports,SystemConfig,AIModels,ViewAuditLog,n1,n2,RunArchive,RunMarketAlerts,ManageAI,MonitorPerformance adminClass
    class RecruiterDash,RecruiterMenu,PostJob,ReviewCand,ScheduleInt,UpdateStatusNode,HireCand,DefineSkills,GenerateQuestions,SalaryOption,AddSalary,SkipSalary,SaveJob,ViewMatchScore,CheckMandatory,NotQualified,SkillVerification,ShowVerified,ShowUnverified,ShowRanked,AI_Prediction,ResumeScore,InterviewOptimize,VideoOption,ScheduleVideo,Transcription,PredictOnboarding,BackgroundCheck,InitiateCheck,WaitVerification recruiterClass
    class CandidateDash,CandidateMenu,BrowseJobs,ApplyJob,ViewMyApps,ManageProfile,ViewInterviews,WithdrawApp,ShowJobs,ShowSalary,DisplayRange,NoSalary,DuplicateBlock,NegotiationPrep,RemoteAnalysis,CreateApplication,AutoScreenBot,AutoMatch,AutoReject,RemoteCheck,VisibleToRecruiters,DisplayApps,ShowStatus,GhostMonitor,UpdateSkills2,RemoteAssess,UploadDocs,ResumeProcessing,GetSchedules,FatigueCheck,ConfirmInt,BlockWithdraw,BlockFinal candidateClass
    class CheckConflict,BlockSchedule,CreateInterview,EmailQueue,CallSP1,ValidateTransition,BlockTransition,AllowTransition,CallSP2,LockRecords,CheckStage,RollbackHire,CheckVacancy,RollbackFull,ExecuteHire,CallSP3,ValidateOwner,AllowWithdraw processClass

    classDef adminClass fill:#ff6b6b,stroke:#c92a2a,stroke-width:2px,color:#fff
    classDef recruiterClass fill:#4dabf7,stroke:#1971c2,stroke-width:2px,color:#fff
    classDef candidateClass fill:#51cf66,stroke:#2f9e44,stroke-width:2px,color:#fff
    classDef processClass fill:#ffd43b,stroke:#f59f00,stroke-width:2px,color:#000
    classDef securityClass fill:#ff6b9d,stroke:#c2255c,stroke-width:2px,color:#fff`;

// Legend entries matching the diagram's color classes
export const flowchartLegend = [
    { label: 'Security / Auth', color: '#ff6b9d', desc: 'Authentication and role checking' },
    { label: 'Admin Actions', color: '#ff6b6b', desc: 'Admin dashboard operations' },
    { label: 'Recruiter Actions', color: '#4dabf7', desc: 'Recruiter dashboard operations' },
    { label: 'Candidate Actions', color: '#51cf66', desc: 'Candidate dashboard operations' },
    { label: 'Database / Process', color: '#ffd43b', desc: 'Stored procedures, triggers, transactions' },
];
