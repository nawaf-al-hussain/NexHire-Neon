// Auto-generated from ProjectResources TSV files.
// Do not edit by hand — regenerate from /tmp/gen_doc_data.py

export const docData = {
  "featuresByCategory": {
    "Core Database": [
      {
        "feature": "Application State Machine",
        "problem": "Invalid status transitions break hiring workflow",
        "solution": "ApplicationStatuses table with 8 defined states. Stored procedures enforce valid transitions.",
        "implementation": "ApplicationStatuses, sp_UpdateApplicationStatus with validation",
        "clrEnhanced": "No",
        "tables": "ApplicationStatuses, Applications",
        "procedures": "sp_UpdateApplicationStatus, sp_HireCandidate, sp_RejectCandidate",
        "views": ""
      },
      {
        "feature": "Candidate Interview Confirmation",
        "problem": "No way to confirm interview attendance",
        "solution": "Allows candidates to confirm with ownership validation",
        "implementation": "sp_ConfirmInterview",
        "clrEnhanced": "No",
        "tables": "InterviewSchedules, Applications",
        "procedures": "sp_ConfirmInterview",
        "views": ""
      },
      {
        "feature": "Concurrency-Safe Hiring",
        "problem": "Race conditions when multiple recruiters hire simultaneously",
        "solution": "UPDLOCK, HOLDLOCK hints in transaction for atomic vacancy updates",
        "implementation": "sp_HireCandidate with locking hints, terminal state guard (FIX-04)",
        "clrEnhanced": "No",
        "tables": "Applications, Jobs",
        "procedures": "sp_HireCandidate",
        "views": ""
      },
      {
        "feature": "Email Notification Queue",
        "problem": "No automatic notifications for candidates",
        "solution": "EmailQueue table populated by triggers. Backend service processes asynchronously.",
        "implementation": "trg_SendInterviewEmail populates EmailQueue",
        "clrEnhanced": "Yes - ValidateEmail, IsDisposableEmail for validation (FIX-06)",
        "tables": "EmailQueue",
        "procedures": "",
        "views": ""
      },
      {
        "feature": "Interview Feedback System",
        "problem": "Subjective hiring decisions without structured evaluation",
        "solution": "Technical, communication, culture scores with interviewer consistency analytics",
        "implementation": "InterviewFeedback with TechnicalScore, CommunicationScore, CultureFitScore",
        "clrEnhanced": "Yes - CalculateSentiment for comments, StandardDeviation for consistency",
        "tables": "InterviewFeedback",
        "procedures": "",
        "views": "vw_InterviewerConsistency, vw_InterviewerPerformance"
      },
      {
        "feature": "Recruiter Authorization Check",
        "problem": "Non-recruiters can schedule interviews",
        "solution": "Validates UserID is registered as Recruiter before scheduling",
        "implementation": "sp_ScheduleInterviewWithRecruiter",
        "clrEnhanced": "No",
        "tables": "InterviewSchedules, Recruiters",
        "procedures": "sp_ScheduleInterviewWithRecruiter",
        "views": ""
      },
      {
        "feature": "Role-Based Access Control (RBAC)",
        "problem": "Unauthorized users could access/modify sensitive data",
        "solution": "Roles table with Admin, Recruiter, Candidate, Hiring Manager roles. Users table links to roles.",
        "implementation": "Roles, Users tables with RoleID FK",
        "clrEnhanced": "No",
        "tables": "Roles, Users",
        "procedures": "",
        "views": ""
      },
      {
        "feature": "Smart Interview Scheduling",
        "problem": "Double-booking recruiters for interviews",
        "solution": "Trigger checks overlapping time slots before insert. Unique constraint enforces uniqueness.",
        "implementation": "trg_PreventDoubleBooking, UQ_InterviewSlot unique constraint",
        "clrEnhanced": "Yes - ConvertTimezone for global scheduling",
        "tables": "InterviewSchedules",
        "procedures": "sp_ScheduleInterviewWithTimezone (CLR-enhanced)",
        "views": ""
      },
      {
        "feature": "Weighted Candidate Matching",
        "problem": "Finding best candidates manually is time-consuming",
        "solution": "Skill proficiency + experience + location scoring with mandatory skill filtering",
        "implementation": "CandidateSkills with ProficiencyLevel, YearsExperience weighting",
        "clrEnhanced": "Yes - CosineSimilarity for skill text matching",
        "tables": "CandidateSkills, JobSkills, Skills",
        "procedures": "sp_AdvancedCandidateMatching",
        "views": "vw_CandidateMatchScore"
      },
      {
        "feature": "Candidate Ranking History",
        "problem": "Can't explain historical ranking decisions",
        "solution": "CandidateRankingHistory stores match scores with timestamps",
        "implementation": "CandidateRankingHistory table, sp_SaveCandidateRanking",
        "clrEnhanced": "No",
        "tables": "CandidateRankingHistory",
        "procedures": "sp_SaveCandidateRanking",
        "views": ""
      },
      {
        "feature": "Data Archiving & GDPR Compliance",
        "problem": "Old data slows performance, GDPR requires PII anonymization",
        "solution": "Archive procedures move old records and anonymize PII (email, name, resume)",
        "implementation": "sp_ArchiveOldData, sp_AnonymizeArchivedCandidates, JobPostingsArchive",
        "clrEnhanced": "No",
        "tables": "ApplicationsArchive, JobPostingsArchive",
        "procedures": "sp_ArchiveOldData, sp_AnonymizeArchivedCandidates",
        "views": ""
      },
      {
        "feature": "Soft Delete Pattern",
        "problem": "Hard deletes lose referential integrity and audit trail",
        "solution": "IsDeleted flag on all major tables. Archive procedures mark as deleted.",
        "implementation": "IsDeleted BIT column on Applications, Jobs, Candidates, etc.",
        "clrEnhanced": "No",
        "tables": "All major tables",
        "procedures": "sp_ArchiveOldData",
        "views": ""
      },
      {
        "feature": "Application Withdrawal",
        "problem": "Candidates need way to withdraw with reason tracking",
        "solution": "sp_WithdrawApplication with reason tracking and status history",
        "implementation": "sp_WithdrawApplication, WithdrawnAt, WithdrawalReason fields",
        "clrEnhanced": "No",
        "tables": "Applications",
        "procedures": "sp_WithdrawApplication",
        "views": ""
      },
      {
        "feature": "Automatic Audit Logging",
        "problem": "No trail of who changed what for compliance",
        "solution": "Triggers on all major tables log changes to AuditLog with fn_GetCurrentUserID() (FIX-03)",
        "implementation": "AuditLog table, audit triggers on 10+ tables",
        "clrEnhanced": "No",
        "tables": "AuditLog",
        "procedures": "",
        "views": ""
      },
      {
        "feature": "Instant Auto-Rejection",
        "problem": "Manual screening of unqualified candidates wastes time",
        "solution": "Trigger auto-rejects on insert if experience < minimum. SP handles batch sweep (FIX-07)",
        "implementation": "trg_InstantAutoReject on Applications, sp_AutoRejectUnqualified for batch",
        "clrEnhanced": "No",
        "tables": "Applications, Jobs",
        "procedures": "sp_AutoRejectUnqualified",
        "views": ""
      }
    ],
    "Advanced Features": [
      {
        "feature": "Anti-Ghosting Risk Prediction",
        "problem": "50% ghosting rate by candidates or recruiters",
        "solution": "Analyzes ghosting history, response times, communication frequency",
        "implementation": "sp_PredictGhostingRisk",
        "clrEnhanced": "No",
        "tables": "GhostingPatterns, CommunicationLogs",
        "procedures": "sp_PredictGhostingRisk",
        "views": "vw_GhostingRiskDashboard"
      },
      {
        "feature": "Automated Screening Bot",
        "problem": "Initial screening time-consuming",
        "solution": "Rules-based auto-screening with confidence scoring",
        "implementation": "ScreeningBotDecisions with Decision, Confidence, AutoRejectReason",
        "clrEnhanced": "Yes - Multiple CLR functions",
        "tables": "ScreeningBotDecisions",
        "procedures": "sp_AutoScreenApplicationEnhanced",
        "views": ""
      },
      {
        "feature": "Enhanced Diversity Analytics",
        "problem": "DEI efforts performative without impact",
        "solution": "Anonymized funnel, bias detection, diversity goals tracking",
        "implementation": "DiversityMetrics, DiversityGoals, BiasDetectionLogs",
        "clrEnhanced": "No",
        "tables": "DiversityMetrics, DiversityGoals, BiasDetectionLogs",
        "procedures": "",
        "views": "vw_DiversityAnalyticsFunnel"
      },
      {
        "feature": "External Platform Sync",
        "problem": "Manual job posting to multiple platforms",
        "solution": "Auto-sync with LinkedIn, Indeed, Glassdoor with error retry",
        "implementation": "ExternalPlatformSync with bidirectional sync",
        "clrEnhanced": "Yes - CallRESTApi",
        "tables": "ExternalPlatformSync",
        "procedures": "",
        "views": ""
      },
      {
        "feature": "GDPR Consent Management",
        "problem": "No tracking of data processing consent",
        "solution": "Consent versioning, expiry tracking, revocation support",
        "implementation": "ConsentManagement with ConsentType, ConsentVersion, ExpiryDate",
        "clrEnhanced": "No",
        "tables": "ConsentManagement",
        "procedures": "sp_CheckConsentExpiry",
        "views": ""
      },
      {
        "feature": "Interview Fatigue Reducer",
        "problem": "Candidates repeat same questions across rounds",
        "solution": "Tracks questions asked, detects redundancy, optimizes rounds",
        "implementation": "InterviewSharedInsights, sp_OptimizeInterviewRounds",
        "clrEnhanced": "No",
        "tables": "InterviewSharedInsights, CandidateInterviewHistory",
        "procedures": "sp_OptimizeInterviewRounds",
        "views": ""
      },
      {
        "feature": "Predictive Hiring Success (Rules-Based AI)",
        "problem": "Hiring decisions based on gut feeling",
        "solution": "Rules-based scoring: skill match + experience + interview scores + culture fit",
        "implementation": "AI_Predictions table with SuccessProbability, KeyFactors",
        "clrEnhanced": "Yes - Multiple CLR functions in scoring",
        "tables": "AI_Predictions",
        "procedures": "sp_PredictHireSuccess",
        "views": ""
      },
      {
        "feature": "Push Notification System",
        "problem": "Email-only notifications insufficient for mobile",
        "solution": "Multi-platform push notification delivery tracking",
        "implementation": "PushNotifications with Platform, DeviceToken, DeliveryStatus",
        "clrEnhanced": "No",
        "tables": "PushNotifications",
        "procedures": "",
        "views": ""
      },
      {
        "feature": "Remote Work Compatibility Scorecard",
        "problem": "Remote mismatches cause turnover; not everyone thrives remotely",
        "solution": "Assessment of workspace, timezone, communication style, self-motivation",
        "implementation": "RemoteCompatibility, CompanyRemotePolicy, TimezoneOverlapAnalysis tables",
        "clrEnhanced": "Yes - CalculateTimezoneOverlap",
        "tables": "RemoteCompatibility, CompanyRemotePolicy, TimezoneOverlapAnalysis",
        "procedures": "",
        "views": "vw_RemoteCompatibilityMatrix (FIX-08 optimized)"
      },
      {
        "feature": "Resume Quality Scoring",
        "problem": "Manual resume screening time-consuming",
        "solution": "NLP extracts education, certs, tech, leadership, quality score",
        "implementation": "ResumeInsights with quality scoring",
        "clrEnhanced": "Yes - ExtractSkills, ExtractYearsOfExperience, Sentiment",
        "tables": "ResumeInsights, CandidateDocuments",
        "procedures": "",
        "views": ""
      },
      {
        "feature": "Salary Transparency & Negotiation Coach",
        "problem": "Opaque ranges, lack negotiation guidance",
        "solution": "Market benchmarks + AI negotiation strategy with scripts",
        "implementation": "SalaryBenchmarks, NegotiationHistory, sp_GenerateNegotiationStrategy",
        "clrEnhanced": "No",
        "tables": "SalaryBenchmarks, JobSalaryRanges, NegotiationHistory, NegotiationTemplates",
        "procedures": "sp_GenerateNegotiationStrategy",
        "views": "vw_SalaryTransparency"
      },
      {
        "feature": "Skill Verification & Assessments",
        "problem": "30% resume fraud, skills decay",
        "solution": "Live assessments with expiration dates, multiple verification methods",
        "implementation": "MicroAssessments, SkillVerifications, AssessmentAttempts",
        "clrEnhanced": "No",
        "tables": "MicroAssessments, SkillVerifications, AssessmentAttempts",
        "procedures": "",
        "views": "vw_SkillVerificationStatus"
      },
      {
        "feature": "Blockchain Credential Verification",
        "problem": "Fake degrees/certificates, credential fraud",
        "solution": "SHA-256 hashing with blockchain transaction tracking",
        "implementation": "BlockchainVerifications with CredentialHash, TransactionID, Network",
        "clrEnhanced": "No",
        "tables": "BlockchainVerifications",
        "procedures": "",
        "views": ""
      },
      {
        "feature": "Interview Transcription & Analysis",
        "problem": "No record of interview discussions",
        "solution": "Audio/video transcription with keyword extraction",
        "implementation": "InterviewTranscriptions with FullText, filler word detection, KeyTopics, ActionItems",
        "clrEnhanced": "Yes - CalculateSentiment",
        "tables": "InterviewTranscriptions",
        "procedures": "",
        "views": ""
      },
      {
        "feature": "AI Interview Question Generator",
        "problem": "Unprepared interviewers, inconsistent questions",
        "solution": "Rules-based question generation by skill, role, difficulty level",
        "implementation": "AI_GeneratedQuestions with QuestionType, DifficultyLevel, ScoringRubric",
        "clrEnhanced": "No",
        "tables": "AI_GeneratedQuestions",
        "procedures": "sp_GenerateInterviewQuestions",
        "views": ""
      },
      {
        "feature": "Background Check Integration",
        "problem": "Manual background check tracking",
        "solution": "Multi-type checks (Criminal, Education, Employment, Credit, etc) with vendor integration",
        "implementation": "BackgroundChecks with risk scoring",
        "clrEnhanced": "Yes - CallRESTApi for vendors",
        "tables": "BackgroundChecks",
        "procedures": "",
        "views": ""
      },
      {
        "feature": "Candidate Sentiment Tracking",
        "problem": "Can't measure candidate satisfaction through process",
        "solution": "Sentiment analysis on emails, interviews, chats with emotion breakdown",
        "implementation": "CandidateSentiment with SentimentScore, EmotionBreakdown, RedFlags",
        "clrEnhanced": "Yes - CalculateSentiment",
        "tables": "CandidateSentiment",
        "procedures": "",
        "views": ""
      },
      {
        "feature": "Career Path Simulator",
        "problem": "Unclear career growth trajectories",
        "solution": "Predicts paths with probabilities, skill gaps, salary increases",
        "implementation": "CareerPaths, RoleArchetypes, sp_PredictCareerPath",
        "clrEnhanced": "No",
        "tables": "CareerPaths, RoleArchetypes, CandidateCareerGoals, LearningResources",
        "procedures": "sp_PredictCareerPath",
        "views": "vw_CareerPathInsights"
      },
      {
        "feature": "Chatbot Interactions",
        "problem": "24/7 candidate support unavailable",
        "solution": "FAQ chatbot with interaction logging and satisfaction tracking",
        "implementation": "ChatbotInteractions with Intent, Response, SatisfactionRating",
        "clrEnhanced": "No",
        "tables": "ChatbotInteractions",
        "procedures": "",
        "views": ""
      },
      {
        "feature": "Chatbot Support System",
        "problem": "24/7 candidate support unavailable",
        "solution": "Intent recognition, entity extraction, human escalation",
        "implementation": "ChatbotInteractions with confidence scoring",
        "clrEnhanced": "No",
        "tables": "ChatbotInteractions",
        "procedures": "",
        "views": ""
      },
      {
        "feature": "Gamification System",
        "problem": "Low candidate engagement",
        "solution": "Points, levels, badges, streaks for profile completion, applications, etc.",
        "implementation": "CandidateGamification, GamificationActions tables",
        "clrEnhanced": "No",
        "tables": "CandidateGamification, GamificationActions",
        "procedures": "sp_AwardGamificationPoints",
        "views": "Leaderboard (Points DESC, Level DESC index)"
      },
      {
        "feature": "Interview Preparation Materials",
        "problem": "Candidates unprepared for interviews",
        "solution": "Job-specific prep materials with difficulty levels",
        "implementation": "InterviewPrepMaterials with ContentType, DifficultyLevel",
        "clrEnhanced": "No",
        "tables": "InterviewPrepMaterials",
        "procedures": "sp_GenerateInterviewPrep",
        "views": ""
      },
      {
        "feature": "Interview Preparation System",
        "problem": "Candidates unprepared for interviews",
        "solution": "Job-specific prep materials with confidence tracking",
        "implementation": "InterviewPrepMaterials, sp_GenerateInterviewPrep",
        "clrEnhanced": "No",
        "tables": "InterviewPrepMaterials, CandidatePrepProgress",
        "procedures": "sp_GenerateInterviewPrep",
        "views": ""
      },
      {
        "feature": "Location Preferences & Flexibility",
        "problem": "No tracking of location flexibility",
        "solution": "Preferred locations, relocation, remote preference, commute limits",
        "implementation": "CandidateLocationPreferences",
        "clrEnhanced": "No",
        "tables": "CandidateLocationPreferences",
        "procedures": "",
        "views": ""
      },
      {
        "feature": "Onboarding Success Predictor",
        "problem": "20% leave within 45 days",
        "solution": "Predicts failure risk, creates personalized checklists",
        "implementation": "OnboardingSuccessFactors, sp_PredictOnboardingSuccess",
        "clrEnhanced": "No",
        "tables": "OnboardingSuccessFactors, OnboardingChecklists, OnboardingPredictions",
        "procedures": "sp_PredictOnboardingSuccess",
        "views": ""
      },
      {
        "feature": "Personalized Learning Paths",
        "problem": "Candidates lack skill development guidance",
        "solution": "Skill gap identification with resource recommendations",
        "implementation": "PersonalizedLearningPaths, sp_GenerateLearningPath",
        "clrEnhanced": "No",
        "tables": "PersonalizedLearningPaths, LearningResources",
        "procedures": "sp_GenerateLearningPath",
        "views": ""
      },
      {
        "feature": "Referral Intelligence Engine",
        "problem": "Employee referrals underutilized",
        "solution": "Maps social networks, suggests high-probability referrals",
        "implementation": "ReferralNetwork, NetworkStrength, sp_SuggestReferrals",
        "clrEnhanced": "No",
        "tables": "ReferralNetwork, NetworkStrength, ReferralPerformance, NetworkAnalysis",
        "procedures": "sp_SuggestReferrals",
        "views": "vw_ReferralIntelligence"
      },
      {
        "feature": "Role-Based Data Masking",
        "problem": "Different roles need different data access",
        "solution": "Returns masked/anonymized data by user role (Admin/Recruiter/Analyst)",
        "implementation": "sp_GetMaskedCandidateData",
        "clrEnhanced": "No",
        "tables": "Candidates, Users",
        "procedures": "sp_GetMaskedCandidateData",
        "views": ""
      },
      {
        "feature": "Video Interview Integration",
        "problem": "External video platform coordination",
        "solution": "Tracks Zoom/Teams/Meet/HireVue with recording consent and AI analysis",
        "implementation": "VideoInterviews with platform tracking",
        "clrEnhanced": "No",
        "tables": "VideoInterviews",
        "procedures": "",
        "views": ""
      },
      {
        "feature": "Video Interview Platform",
        "problem": "External video platform integrations",
        "solution": "Video interview tracking with recording storage",
        "implementation": "VideoInterviews with VideoURL, Duration, QualityScore",
        "clrEnhanced": "No",
        "tables": "VideoInterviews",
        "procedures": "",
        "views": ""
      }
    ],
    "Analytics": [
      {
        "feature": "Application Funnel",
        "problem": "Can't see conversion rates through hiring stages",
        "solution": "Count of applications in each status",
        "implementation": "vw_ApplicationFunnel",
        "clrEnhanced": "No",
        "tables": "ApplicationStatus, Applications",
        "procedures": "",
        "views": "vw_ApplicationFunnel"
      },
      {
        "feature": "Average Time-to-Hire",
        "problem": "Need overall hiring speed metric",
        "solution": "Single aggregate showing average days to hire",
        "implementation": "vw_AverageTimeToHire",
        "clrEnhanced": "No",
        "tables": "Applications",
        "procedures": "",
        "views": "vw_AverageTimeToHire"
      },
      {
        "feature": "Bias Detection Analytics",
        "problem": "Unconscious bias can't be detected manually",
        "solution": "Views show hiring rates by location, experience, demographics",
        "implementation": "vw_Bias_Location, vw_Bias_Experience with demographic funnel analysis",
        "clrEnhanced": "No",
        "tables": "Applications, Candidates",
        "procedures": "",
        "views": "vw_Bias_Location, vw_Bias_Experience"
      },
      {
        "feature": "Candidate Interview Schedule View",
        "problem": "No unified view of candidate interviews with job details",
        "solution": "View showing interviews with job title, recruiter, time status",
        "implementation": "vw_CandidateInterviews",
        "clrEnhanced": "No",
        "tables": "InterviewSchedules, Applications, Jobs",
        "procedures": "",
        "views": "vw_CandidateInterviews"
      },
      {
        "feature": "Diversity Funnel Analytics",
        "problem": "Can't measure DEI impact through stages",
        "solution": "Anonymized demographics through application to hire",
        "implementation": "vw_DiversityAnalyticsFunnel",
        "clrEnhanced": "No",
        "tables": "DiversityMetrics, Applications",
        "procedures": "",
        "views": "vw_DiversityAnalyticsFunnel"
      },
      {
        "feature": "Ghosting Risk Dashboard",
        "problem": "No early warning for ghosting",
        "solution": "Real-time monitoring with candidate/recruiter scores",
        "implementation": "vw_GhostingRiskDashboard",
        "clrEnhanced": "No",
        "tables": "GhostingPatterns, CommunicationLogs",
        "procedures": "",
        "views": "vw_GhostingRiskDashboard"
      },
      {
        "feature": "Hire Rate Per Job",
        "problem": "Can't measure job posting effectiveness",
        "solution": "Applications vs hires ratio with percentage per job",
        "implementation": "vw_HireRatePerJob",
        "clrEnhanced": "No",
        "tables": "JobPostings, Applications",
        "procedures": "",
        "views": "vw_HireRatePerJob"
      },
      {
        "feature": "Hiring Bottleneck Detection",
        "problem": "Can't identify which stage slows hiring",
        "solution": "Average days applications spend in each status",
        "implementation": "vw_HiringBottlenecks with stage duration tracking",
        "clrEnhanced": "Yes - CalculateBusinessDays for accurate metrics",
        "tables": "Applications, ApplicationStatusHistory",
        "procedures": "",
        "views": "vw_HiringBottlenecks"
      },
      {
        "feature": "Market Intelligence Dashboard",
        "problem": "No real-time market demand visibility",
        "solution": "Skill demand vs supply, salary trends, hiring difficulty",
        "implementation": "MarketIntelligence table with DemandScore, SupplyScore, TrendDirection",
        "clrEnhanced": "No",
        "tables": "MarketIntelligence, Skills",
        "procedures": "sp_GenerateMarketAlerts (FIX-09 table variable)",
        "views": "vw_MarketIntelligenceDashboard"
      },
      {
        "feature": "Recruiter Performance",
        "problem": "No visibility into recruiter productivity",
        "solution": "Interviews conducted and successful hires per recruiter",
        "implementation": "vw_RecruiterPerformance",
        "clrEnhanced": "No",
        "tables": "Recruiters, InterviewSchedules",
        "procedures": "",
        "views": "vw_RecruiterPerformance"
      },
      {
        "feature": "Salary Transparency Analytics",
        "problem": "Unknown impact of salary disclosure",
        "solution": "Correlates transparency with application volume",
        "implementation": "vw_SalaryTransparency",
        "clrEnhanced": "No",
        "tables": "JobSalaryRanges, SalaryBenchmarks",
        "procedures": "",
        "views": "vw_SalaryTransparency"
      },
      {
        "feature": "Silent Rejection Detector",
        "problem": "Candidates left in limbo damage employer brand",
        "solution": "Flags applications inactive >30 days without updates",
        "implementation": "vw_SilentRejections with inactivity threshold alerts",
        "clrEnhanced": "Yes - GetRelativeTime for human-readable display",
        "tables": "Applications",
        "procedures": "",
        "views": "vw_SilentRejections"
      },
      {
        "feature": "Vacancy Utilization Analytics",
        "problem": "Can't track filled positions vs total applications",
        "solution": "Shows remaining vacancies vs applications vs hires per job",
        "implementation": "vw_VacancyUtilization with filled positions calculation",
        "clrEnhanced": "No",
        "tables": "Jobs, Applications",
        "procedures": "",
        "views": "vw_VacancyUtilization"
      },
      {
        "feature": "Candidate Engagement Scoring",
        "problem": "Can't measure candidate responsiveness",
        "solution": "Interview confirmations vs scheduled, engagement rate",
        "implementation": "vw_CandidateEngagement",
        "clrEnhanced": "No",
        "tables": "Candidates, InterviewSchedules",
        "procedures": "",
        "views": "vw_CandidateEngagement"
      },
      {
        "feature": "Career Path Insights",
        "problem": "No visibility into career progression",
        "solution": "Shows target roles, transition probability, skills",
        "implementation": "vw_CareerPathInsights",
        "clrEnhanced": "No",
        "tables": "CandidateCareerGoals, CareerPaths",
        "procedures": "",
        "views": "vw_CareerPathInsights"
      },
      {
        "feature": "Interview Score vs Decision",
        "problem": "Unknown relationship between scores and outcomes",
        "solution": "Average interview scores with final decision",
        "implementation": "vw_InterviewScoreVsDecision",
        "clrEnhanced": "Yes - CorrelationCoefficient",
        "tables": "InterviewFeedback, Applications",
        "procedures": "",
        "views": "vw_InterviewScoreVsDecision"
      },
      {
        "feature": "Interviewer Consistency Monitoring",
        "problem": "Interviewers with extreme scoring patterns skew results",
        "solution": "Shows average scores and variance per interviewer",
        "implementation": "vw_InterviewerConsistency with score variance tracking",
        "clrEnhanced": "Yes - StandardDeviation, Percentile for statistical analysis",
        "tables": "InterviewFeedback, Users",
        "procedures": "",
        "views": "vw_InterviewerConsistency, vw_InterviewerPerformance"
      },
      {
        "feature": "Referral Intelligence Dashboard",
        "problem": "Can't analyze referral effectiveness",
        "solution": "Tracks referrer quality, outcomes, network strength",
        "implementation": "vw_ReferralIntelligence",
        "clrEnhanced": "No",
        "tables": "ReferralNetwork, NetworkStrength",
        "procedures": "",
        "views": "vw_ReferralIntelligence"
      },
      {
        "feature": "Rejection Reason Analysis",
        "problem": "No insights into why candidates are rejected",
        "solution": "Aggregates rejection reasons with counts and percentages",
        "implementation": "vw_RejectionAnalysis",
        "clrEnhanced": "No",
        "tables": "Applications",
        "procedures": "",
        "views": "vw_RejectionAnalysis"
      },
      {
        "feature": "Skill Gap Analysis",
        "problem": "Can't identify high-demand skills lacking in pool",
        "solution": "Shows difference between job requirements vs candidate skills",
        "implementation": "vw_SkillGapAnalysis, demand-supply calculation",
        "clrEnhanced": "No",
        "tables": "Skills, JobSkills, CandidateSkills",
        "procedures": "",
        "views": "vw_SkillGapAnalysis"
      },
      {
        "feature": "Skill Verification Status",
        "problem": "No visibility into verified vs claimed skills",
        "solution": "Shows claimed vs verified levels with expiry",
        "implementation": "vw_SkillVerificationStatus",
        "clrEnhanced": "No",
        "tables": "CandidateSkills, SkillVerifications",
        "procedures": "",
        "views": "vw_SkillVerificationStatus"
      },
      {
        "feature": "Time-to-Hire Individual Metrics",
        "problem": "Can't track hiring timeline per candidate",
        "solution": "Days from application to hire for each candidate",
        "implementation": "vw_TimeToHire",
        "clrEnhanced": "Yes - CalculateBusinessDays",
        "tables": "Applications, ApplicationStatusHistory",
        "procedures": "",
        "views": "vw_TimeToHire"
      }
    ],
    "CLR - API": [
      {
        "feature": "CallRESTApi",
        "problem": "Manual API integration for external services",
        "solution": "Generic HTTP client wrapper (GET/POST/PUT/DELETE)",
        "implementation": "ApiIntegration.CallRESTApi() - Returns NVARCHAR(MAX) JSON",
        "clrEnhanced": "Yes - Core CLR (Requires EXTERNAL_ACCESS)",
        "tables": "",
        "procedures": "",
        "views": ""
      },
      {
        "feature": "GeocodeAddress",
        "problem": "Text addresses unusable for location-based matching",
        "solution": "OpenStreetMap Nominatim (free) or Google Maps geocoding",
        "implementation": "ApiIntegration.GeocodeAddress() - Returns NVARCHAR(MAX) JSON",
        "clrEnhanced": "Yes - Core CLR (Requires EXTERNAL_ACCESS)",
        "tables": "",
        "procedures": "",
        "views": "Location-based matching"
      },
      {
        "feature": "VerifyLinkedInProfile",
        "problem": "Manual LinkedIn profile verification",
        "solution": "HEAD request to check URL existence (handles 999 bot-protection)",
        "implementation": "ApiIntegration.VerifyLinkedInProfile() - Returns NVARCHAR(MAX) JSON",
        "clrEnhanced": "Yes - Core CLR (Requires EXTERNAL_ACCESS)",
        "tables": "Candidates.LinkedInURL",
        "procedures": "",
        "views": ""
      }
    ],
    "CLR - Date/Time": [
      {
        "feature": "CalculateBusinessDays",
        "problem": "Calendar days inaccurate for SLA calculations",
        "solution": "Business day counting excluding weekends (Mon-Fri only)",
        "implementation": "DateTimeFunctions.CalculateBusinessDays() - Returns INT",
        "clrEnhanced": "Yes - Core CLR",
        "tables": "",
        "procedures": "",
        "views": "vw_HiringBottlenecks, time-to-hire metrics"
      },
      {
        "feature": "GetRelativeTime",
        "problem": "Inhuman date display (2024-01-15 14:30)",
        "solution": "Human-readable timestamps (2 hours ago, 3 days ago)",
        "implementation": "DateTimeFunctions.GetRelativeTime() - Returns NVARCHAR(100)",
        "clrEnhanced": "Yes - Core CLR",
        "tables": "",
        "procedures": "",
        "views": "vw_SilentRejections, activity feeds"
      },
      {
        "feature": "AddBusinessDays",
        "problem": "Incorrect scheduling across weekends",
        "solution": "Business-aware date arithmetic skipping weekends",
        "implementation": "DateTimeFunctions.AddBusinessDays() - Returns DATETIME",
        "clrEnhanced": "Yes - Core CLR",
        "tables": "",
        "procedures": "SLA deadline calculations",
        "views": ""
      },
      {
        "feature": "IsWithinWorkingHours",
        "problem": "Interviews scheduled outside business hours",
        "solution": "Working hours validation (weekdays 9-5 default)",
        "implementation": "DateTimeFunctions.IsWithinWorkingHours() - Returns BIT",
        "clrEnhanced": "Yes - Core CLR",
        "tables": "",
        "procedures": "Interview scheduling validation",
        "views": ""
      }
    ],
    "CLR - Document": [
      {
        "feature": "ExtractTextFromDocx",
        "problem": "Word document resumes unreadable by database",
        "solution": "OpenXML ZIP parsing to extract text from document.xml",
        "implementation": "DocumentParser.ExtractTextFromDocx() - Returns NVARCHAR(MAX)",
        "clrEnhanced": "Yes - Core CLR",
        "tables": "Candidates.ResumeFile (VARBINARY) \u2192 ResumeText",
        "procedures": "",
        "views": ""
      },
      {
        "feature": "ExtractTextFromPDF",
        "problem": "Manual reading of PDF resumes",
        "solution": "Regex-based text extraction from PDF binary (no external library)",
        "implementation": "DocumentParser.ExtractTextFromPDF() - Returns NVARCHAR(MAX)",
        "clrEnhanced": "Yes - Core CLR",
        "tables": "Candidates.ResumeFile (VARBINARY) \u2192 ResumeText",
        "procedures": "",
        "views": ""
      },
      {
        "feature": "ExtractYearsOfExperience",
        "problem": "Manual experience extraction from resumes",
        "solution": "Pattern matching for '5 years', '3+ years', '2-4 years', etc.",
        "implementation": "DocumentParser.ExtractYearsOfExperience() - Returns INT",
        "clrEnhanced": "Yes - Core CLR",
        "tables": "Candidates.YearsExperience",
        "procedures": "",
        "views": ""
      }
    ],
    "CLR - Email": [
      {
        "feature": "IsDisposableEmail",
        "problem": "Temporary/fake email registration",
        "solution": "Domain blacklist check against 50+ disposable providers",
        "implementation": "EmailValidator.IsDisposableEmail() - Returns BIT",
        "clrEnhanced": "Yes - Core CLR",
        "tables": "Used in registration validation",
        "procedures": "",
        "views": ""
      },
      {
        "feature": "ValidateEmail",
        "problem": "Basic LIKE pattern insufficient for email validation",
        "solution": "RFC-5322 regex validation with proper format checking",
        "implementation": "EmailValidator.ValidateEmail() - Returns BIT (1=valid, 0=invalid)",
        "clrEnhanced": "Yes - Core CLR",
        "tables": "Used in Users, Candidates triggers",
        "procedures": "",
        "views": ""
      },
      {
        "feature": "ExtractEmailDomain",
        "problem": "Domain-based analytics impossible",
        "solution": "Extracts domain portion from email for analytics",
        "implementation": "EmailValidator.ExtractEmailDomain() - Returns NVARCHAR(255)",
        "clrEnhanced": "Yes - Core CLR",
        "tables": "Used in analytics queries",
        "procedures": "",
        "views": ""
      }
    ],
    "CLR - NLP": [
      {
        "feature": "ExtractSkills",
        "problem": "Manual skill identification from resume text",
        "solution": "Dictionary-based NLP with 100+ skills, returns scored list",
        "implementation": "NLPProcessor.ExtractSkills() - Returns 'skill:score,skill:score'",
        "clrEnhanced": "Yes - Core CLR",
        "tables": "Candidates.ExtractedSkills",
        "procedures": "",
        "views": ""
      },
      {
        "feature": "CalculateSentiment",
        "problem": "Unmeasurable candidate tone in communications",
        "solution": "Lexicon-based sentiment analysis (-1 to +1 score)",
        "implementation": "NLPProcessor.CalculateSentiment() - Returns FLOAT",
        "clrEnhanced": "Yes - Core CLR",
        "tables": "InterviewFeedback.SentimentScore",
        "procedures": "",
        "views": ""
      }
    ],
    "CLR - Security": [
      {
        "feature": "GenerateSecureToken",
        "problem": "Weak random tokens for password resets",
        "solution": "Cryptographically secure random token via RNGCryptoServiceProvider",
        "implementation": "SecurityFunctions.GenerateSecureToken() - Returns NVARCHAR(256)",
        "clrEnhanced": "Yes - Core CLR",
        "tables": "Users.SessionToken",
        "procedures": "",
        "views": ""
      },
      {
        "feature": "HashPassword (PBKDF2)",
        "problem": "Plain text password storage is security risk",
        "solution": "PBKDF2-SHA256 with 100K iterations, 16-byte salt (OWASP 2024)",
        "implementation": "SecurityFunctions.HashPassword() - Returns NVARCHAR(500)",
        "clrEnhanced": "Yes - Core CLR",
        "tables": "Users.PasswordHash (FIX-05)",
        "procedures": "Used in user registration",
        "views": ""
      },
      {
        "feature": "VerifyPassword",
        "problem": "Password verification without secure comparison",
        "solution": "Timing-attack resistant password verification",
        "implementation": "SecurityFunctions.VerifyPassword() - Returns BIT",
        "clrEnhanced": "Yes - Core CLR",
        "tables": "",
        "procedures": "Used in login authentication",
        "views": ""
      },
      {
        "feature": "EncryptSensitiveData",
        "problem": "Unencrypted sensitive candidate data (SSN, salary)",
        "solution": "AES-256 encryption for PII at rest",
        "implementation": "SecurityFunctions.EncryptSensitiveData() - Returns NVARCHAR(MAX)",
        "clrEnhanced": "Yes - Core CLR",
        "tables": "Can be used for any sensitive fields",
        "procedures": "",
        "views": ""
      }
    ],
    "CLR - Statistics": [
      {
        "feature": "CorrelationCoefficient",
        "problem": "Unknown relationships between interview metrics",
        "solution": "Pearson correlation between two sets of values",
        "implementation": "StatisticalFunctions.CorrelationCoefficient() - Returns FLOAT (-1 to 1)",
        "clrEnhanced": "Yes - Core CLR",
        "tables": "",
        "procedures": "",
        "views": "Metric relationship analysis"
      },
      {
        "feature": "Percentile",
        "problem": "No percentile ranking for candidate scores",
        "solution": "Percentile calculation with linear interpolation",
        "implementation": "StatisticalFunctions.Percentile() - Returns FLOAT",
        "clrEnhanced": "Yes - Core CLR",
        "tables": "",
        "procedures": "",
        "views": "Score distribution analysis"
      },
      {
        "feature": "ZScore",
        "problem": "Difficulty comparing scores across different scales",
        "solution": "Standardized score normalization (mean=0, std=1)",
        "implementation": "StatisticalFunctions.ZScore() - Returns FLOAT",
        "clrEnhanced": "Yes - Core CLR",
        "tables": "",
        "procedures": "",
        "views": "Cross-metric comparisons"
      },
      {
        "feature": "StandardDeviation",
        "problem": "Manual statistical analysis for interview scores",
        "solution": "Population standard deviation from comma-separated values",
        "implementation": "StatisticalFunctions.StandardDeviation() - Returns FLOAT",
        "clrEnhanced": "Yes - Core CLR",
        "tables": "",
        "procedures": "",
        "views": "vw_InterviewerConsistency (interviewer bias detection)"
      }
    ],
    "CLR - String Similarity": [
      {
        "feature": "CosineSimilarity",
        "problem": "Text similarity beyond simple keyword matching",
        "solution": "Vector space model for resume/job description semantic similarity",
        "implementation": "StringSimilarity.CosineSimilarity() - Returns FLOAT (0-1)",
        "clrEnhanced": "Yes - Core CLR",
        "tables": "",
        "procedures": "",
        "views": "Used in candidate matching"
      },
      {
        "feature": "JaroWinklerSimilarity",
        "problem": "Poor similarity detection for short strings (names)",
        "solution": "Optimized for names with prefix bonus, returns 0-1 score",
        "implementation": "StringSimilarity.JaroWinklerSimilarity() - Returns FLOAT",
        "clrEnhanced": "Yes - Core CLR",
        "tables": "",
        "procedures": "sp_FuzzySearchCandidates",
        "views": "Duplicate candidate detection"
      },
      {
        "feature": "LevenshteinDistance",
        "problem": "Exact matching misses typos and variations",
        "solution": "Edit distance algorithm for fuzzy name/skill matching",
        "implementation": "StringSimilarity.LevenshteinDistance() - Returns INT (edit distance)",
        "clrEnhanced": "Yes - Core CLR",
        "tables": "",
        "procedures": "sp_FuzzySearchCandidates",
        "views": ""
      }
    ],
    "CLR - Timezone": [
      {
        "feature": "ConvertTimezone",
        "problem": "Timezone confusion for global interviews",
        "solution": "Accurate timezone conversion using TimeZoneInfo with DST support",
        "implementation": "TimezoneFunctions.ConvertTimezone() - Returns DATETIME",
        "clrEnhanced": "Yes - Core CLR",
        "tables": "Candidates.Timezone",
        "procedures": "sp_ScheduleInterviewWithTimezone",
        "views": ""
      },
      {
        "feature": "GetTimezoneOffset",
        "problem": "Unknown UTC offset for timezone",
        "solution": "Returns formatted offset string (UTC+06:00)",
        "implementation": "TimezoneFunctions.GetTimezoneOffset() - Returns NVARCHAR(50)",
        "clrEnhanced": "Yes - Core CLR",
        "tables": "",
        "procedures": "",
        "views": "Timezone displays"
      },
      {
        "feature": "CalculateTimezoneOverlap",
        "problem": "Unknown overlapping working hours between zones",
        "solution": "Calculates hours of overlap between two timezones in working hours",
        "implementation": "TimezoneFunctions.CalculateTimezoneOverlap() - Returns INT (hours)",
        "clrEnhanced": "Yes - Core CLR",
        "tables": "",
        "procedures": "",
        "views": "vw_RemoteCompatibilityMatrix (FIX-08)"
      }
    ]
  },
  "procedureGroups": {
    "Application Workflow": [
      {
        "name": "sp_UpdateApplicationStatus",
        "parameters": "@ApplicationID INT, @NewStatusID INT, @ChangedBy INT, @Notes NVARCHAR(500) = NULL",
        "returnType": "None (Raises errors)",
        "description": "Updates application status with validation against transition rules and records in history",
        "tablesAffected": "Applications, ApplicationStatusHistory"
      },
      {
        "name": "sp_WithdrawApplication",
        "parameters": "@ApplicationID INT, @CandidateID INT, @Reason NVARCHAR(500)",
        "returnType": "None (Raises errors)",
        "description": "Allows candidate to withdraw application with reason tracking",
        "tablesAffected": "Applications, ApplicationStatusHistory, ApplicationStatus"
      },
      {
        "name": "sp_HireCandidate",
        "parameters": "@ApplicationID INT, @RecruiterID INT",
        "returnType": "None (Uses TRANSACTION)",
        "description": "Concurrency-safe hiring process with vacancy decrement and status update",
        "tablesAffected": "Applications, ApplicationStatusHistory, JobPostings"
      },
      {
        "name": "sp_AutoRejectUnqualified",
        "parameters": "None",
        "returnType": "None",
        "description": "Batch procedure to auto-reject applications where candidate experience < job minimum",
        "tablesAffected": "Applications"
      }
    ],
    "Archiving": [
      {
        "name": "sp_ArchiveOldData",
        "parameters": "None",
        "returnType": "None",
        "description": "Archives old job postings and applications, performs soft deletes",
        "tablesAffected": "JobPostingsArchive, ApplicationsArchive, JobPostings, Applications"
      },
      {
        "name": "sp_AnonymizeArchivedCandidates",
        "parameters": "None",
        "returnType": "None",
        "description": "Anonymizes personal data of archived candidates for privacy compliance",
        "tablesAffected": "Candidates, Users"
      }
    ],
    "Analytics": [
      {
        "name": "sp_SaveCandidateRanking",
        "parameters": "@CandidateID INT, @JobID INT, @MatchScore DECIMAL(5,2)",
        "returnType": "None",
        "description": "Saves candidate match score to history table for audit trail",
        "tablesAffected": "CandidateRankingHistory"
      }
    ],
    "Interview Management": [
      {
        "name": "sp_ScheduleInterviewWithRecruiter",
        "parameters": "@ApplicationID INT, @RecruiterUserID INT, @StartTime DATETIME, @EndTime DATETIME",
        "returnType": "None (Raises errors)",
        "description": "Schedules interview after verifying user is a recruiter",
        "tablesAffected": "InterviewSchedules"
      },
      {
        "name": "sp_ConfirmInterview",
        "parameters": "@ScheduleID INT, @UserID INT",
        "returnType": "SELECT with Status/Message",
        "description": "Allows candidate to confirm interview attendance",
        "tablesAffected": "InterviewSchedules"
      }
    ],
    "Innovative (Anti-Ghosting)": [
      {
        "name": "sp_PredictGhostingRisk",
        "parameters": "@ApplicationID INT",
        "returnType": "SELECT with risk metrics",
        "description": "Calculates ghosting risk score based on historical patterns and communication logs",
        "tablesAffected": "None (Read-only)"
      }
    ],
    "Innovative (Salary)": [
      {
        "name": "sp_GenerateNegotiationStrategy",
        "parameters": "@CandidateID INT, @JobID INT, @InitialOffer DECIMAL(10,2)",
        "returnType": "SELECT with strategy",
        "description": "Generates personalized salary negotiation strategy and script",
        "tablesAffected": "None (Read-only)"
      }
    ],
    "Innovative (Interview)": [
      {
        "name": "sp_OptimizeInterviewRounds",
        "parameters": "@CandidateID INT, @JobID INT",
        "returnType": "SELECT with recommendations",
        "description": "Analyzes candidate history to optimize interview rounds and reduce redundancy",
        "tablesAffected": "None (Read-only)"
      }
    ],
    "Innovative (Remote Work)": [
      {
        "name": "sp_AnalyzeRemoteCompatibility",
        "parameters": "@CandidateID INT, @JobID INT",
        "returnType": "SELECT with analysis",
        "description": "Calculates remote work compatibility score between candidate and job",
        "tablesAffected": "None (Read-only)"
      }
    ],
    "Innovative (Career)": [
      {
        "name": "sp_PredictCareerPath",
        "parameters": "@CandidateID INT, @TargetRole VARCHAR(150), @Years INT = 5",
        "returnType": "SELECT with prediction",
        "description": "Predicts probability of achieving target career role with development plan",
        "tablesAffected": "None (Read-only)"
      }
    ],
    "Innovative (Onboarding)": [
      {
        "name": "sp_PredictOnboardingSuccess",
        "parameters": "@CandidateID INT, @JobID INT",
        "returnType": "SELECT with prediction",
        "description": "Predicts onboarding success probability and risk factors",
        "tablesAffected": "None (Read-only)"
      }
    ],
    "Innovative (Referral)": [
      {
        "name": "sp_SuggestReferrals",
        "parameters": "@JobID INT",
        "returnType": "SELECT with referrals",
        "description": "Suggests potential referrers and their network connections for a job",
        "tablesAffected": "None (Read-only)"
      }
    ],
    "Innovative (Market)": [
      {
        "name": "sp_GenerateMarketAlerts",
        "parameters": "@RecruiterID INT",
        "returnType": "SELECT with alerts",
        "description": "Generates market intelligence alerts for a recruiter based on their jobs",
        "tablesAffected": "MarketAlerts (reads, inserts alerts in proc logic)"
      }
    ],
    "Advanced (AI/ML)": [
      {
        "name": "sp_PredictHireSuccess",
        "parameters": "@ApplicationID INT",
        "returnType": "SELECT with probability",
        "description": "Calculates comprehensive hire success probability using multiple factors",
        "tablesAffected": "AI_Predictions (inserts)"
      },
      {
        "name": "sp_GenerateInterviewQuestions",
        "parameters": "@JobID INT, @QuestionCount INT = 10, @DifficultyLevel INT = 5",
        "returnType": "SELECT with questions",
        "description": "Generates tailored interview questions based on job requirements",
        "tablesAffected": "None (Read-only)"
      }
    ],
    "Advanced (Compliance)": [
      {
        "name": "sp_CheckConsentExpiry",
        "parameters": "None",
        "returnType": "None",
        "description": "Updates consent records based on expiry dates",
        "tablesAffected": "ConsentManagement"
      }
    ],
    "Advanced (Security)": [
      {
        "name": "sp_GetMaskedCandidateData",
        "parameters": "@UserRole VARCHAR(50), @CandidateID INT = NULL",
        "returnType": "SELECT with masked data",
        "description": "Returns candidate data with masking based on user role",
        "tablesAffected": "None (Read-only)"
      }
    ],
    "Advanced (Automation)": [
      {
        "name": "sp_AutoScreenApplicationEnhanced",
        "parameters": "@ApplicationID INT",
        "returnType": "SELECT with decision",
        "description": "Automated screening bot that evaluates applications against multiple criteria",
        "tablesAffected": "ScreeningBotDecisions (inserts)"
      }
    ],
    "Advanced (Career)": [
      {
        "name": "sp_GenerateLearningPath",
        "parameters": "@CandidateID INT, @TargetJobID INT",
        "returnType": "SELECT with learning path",
        "description": "Generates personalized learning path based on skills gap analysis",
        "tablesAffected": "PersonalizedLearningPaths (inserts/updates)"
      },
      {
        "name": "sp_GenerateInterviewPrep",
        "parameters": "@JobID INT, @CandidateID INT = NULL",
        "returnType": "SELECT with prep materials",
        "description": "Generates interview preparation materials tailored to job and candidate",
        "tablesAffected": "None (Read-only)"
      }
    ],
    "Advanced (Gamification)": [
      {
        "name": "sp_AwardGamificationPoints",
        "parameters": "@CandidateID INT, @ActionType VARCHAR(50)",
        "returnType": "SELECT with updated gamification",
        "description": "Awards points to candidate for completing gamification actions",
        "tablesAffected": "CandidateGamification"
      }
    ],
    "Advanced (Matching)": [
      {
        "name": "sp_AdvancedCandidateMatchingEnhanced",
        "parameters": "@JobID INT, @TopN INT = 10",
        "returnType": "SELECT with ranked candidates",
        "description": "Advanced candidate matching with technical, experience, behavioral scores",
        "tablesAffected": "None (Read-only)"
      }
    ],
    "CLR Integration": [
      {
        "name": "sp_FuzzySearchCandidates",
        "parameters": "@SearchName NVARCHAR(100), @Threshold FLOAT = 0.85",
        "returnType": "SELECT with similarity scores",
        "description": "Fuzzy name search using Jaro-Winkler and Levenshtein algorithms",
        "tablesAffected": "None (Read-only)"
      },
      {
        "name": "sp_ScheduleInterviewWithTimezone",
        "parameters": "@ApplicationID INT, @RecruiterID INT, @StartTimeUTC DATETIME, @EndTimeUTC DATETIME, @CandidateTimezone NVARCHAR(100) = NULL",
        "returnType": "SELECT with timezone conversion",
        "description": "Schedules interview with automatic timezone conversion for candidate",
        "tablesAffected": "InterviewSchedules (inserts)"
      },
      {
        "name": "sp_TimeToHireReport",
        "parameters": "None",
        "returnType": "SELECT with business days",
        "description": "Calculates time to hire using business days (excluding weekends)",
        "tablesAffected": "None (Read-only)"
      },
      {
        "name": "sp_InterviewerConsistencyCLR",
        "parameters": "None",
        "returnType": "SELECT with statistics",
        "description": "Analyzes interviewer scoring consistency using statistical functions",
        "tablesAffected": "None (Read-only)"
      },
      {
        "name": "sp_AuditCandidateEmails",
        "parameters": "None",
        "returnType": "SELECT with validation",
        "description": "Validates candidate emails for format and disposable domains",
        "tablesAffected": "None (Read-only)"
      },
      {
        "name": "sp_ProcessCandidateResume",
        "parameters": "@CandidateID INT",
        "returnType": "SELECT with extraction results",
        "description": "Extracts text and skills from resume using CLR parsing",
        "tablesAffected": "Candidates (updates ResumeText, ExtractedSkills)"
      }
    ],
    "Function (Inline TVF)": [
      {
        "name": "fn_LocationMatch",
        "parameters": "@CandidateLocation VARCHAR(100), @JobLocation VARCHAR(100), @CandidatePreferences NVARCHAR(MAX) = NULL",
        "returnType": "TABLE (MatchScore)",
        "description": "Calculates location match score for candidate-job pairing",
        "tablesAffected": "None (Read-only)"
      }
    ]
  },
  "viewGroups": {
    "Candidate Matching & Scoring": [
      {
        "name": "vw_CandidateMatchScore",
        "description": "Calculates weighted match scores for candidates against job requirements based on skills, experience, and location",
        "dataSources": "Candidates, Applications, JobPostings, CandidateSkills, JobSkills"
      },
      {
        "name": "vw_SkillGapAnalysis",
        "description": "Identifies skills in high demand but low supply by comparing job requirements vs. candidate qualifications",
        "dataSources": "Skills, JobSkills, CandidateSkills"
      },
      {
        "name": "vw_SkillVerificationStatus",
        "description": "Shows verification status of candidate skills including claimed vs. verified proficiency levels",
        "dataSources": "Candidates, CandidateSkills, Skills, SkillVerifications"
      }
    ],
    "Interview Management": [
      {
        "name": "vw_CandidateInterviews",
        "description": "Provides a comprehensive view of all scheduled interviews with time status (Past/Upcoming)",
        "dataSources": "InterviewSchedules, Applications, JobPostings, Candidates, Recruiters, Users"
      },
      {
        "name": "vw_InterviewScoreVsDecision",
        "description": "Correlates average interview scores with final hiring decisions to assess scoring effectiveness",
        "dataSources": "InterviewFeedback, Applications, Candidates, ApplicationStatus"
      },
      {
        "name": "vw_InterviewerConsistency",
        "description": "Measures interviewer scoring patterns, averages, and variance to identify calibration needs",
        "dataSources": "InterviewFeedback, Users"
      }
    ],
    "Analytics & Reporting": [
      {
        "name": "vw_TimeToHire",
        "description": "Calculates the number of days from application to hire for each successful candidate",
        "dataSources": "Applications, Candidates, ApplicationStatusHistory"
      },
      {
        "name": "vw_AverageTimeToHire",
        "description": "Provides the organization-wide average days-to-hire metric",
        "dataSources": "vw_TimeToHire"
      },
      {
        "name": "vw_HireRatePerJob",
        "description": "Shows application volume, hire count, and conversion rate percentage for each job posting",
        "dataSources": "JobPostings, Applications, ApplicationStatus"
      },
      {
        "name": "vw_RecruiterPerformance",
        "description": "Tracks recruiter effectiveness through interviews conducted and successful hires",
        "dataSources": "Recruiters, Users, InterviewSchedules, Applications, ApplicationStatus"
      },
      {
        "name": "vw_ApplicationFunnel",
        "description": "Provides a pipeline view showing candidate counts at each application status stage",
        "dataSources": "ApplicationStatus, Applications"
      },
      {
        "name": "vw_HiringBottlenecks",
        "description": "Identifies stages where applications stall by measuring time spent in each status",
        "dataSources": "ApplicationStatus, Applications"
      },
      {
        "name": "vw_RejectionAnalysis",
        "description": "Categorizes and quantifies reasons for candidate rejection to identify patterns",
        "dataSources": "Applications"
      },
      {
        "name": "vw_VacancyUtilization",
        "description": "Shows remaining vacancies alongside application volume and filled positions",
        "dataSources": "JobPostings, Applications, ApplicationStatus"
      },
      {
        "name": "vw_SilentRejections",
        "description": "Detects applications stuck in non-terminal states for over 30 days with no updates",
        "dataSources": "Applications, Candidates, ApplicationStatus, JobPostings"
      }
    ],
    "DEI & Bias Detection": [
      {
        "name": "vw_Bias_Location",
        "description": "Analyzes hire rates by candidate location to detect potential geographic bias",
        "dataSources": "Applications, Candidates, ApplicationStatus"
      },
      {
        "name": "vw_Bias_Experience",
        "description": "Analyzes hire rates by experience level (Junior, Mid, Senior) to detect experience-based bias",
        "dataSources": "Applications, Candidates, ApplicationStatus"
      },
      {
        "name": "vw_DiversityAnalyticsFunnel",
        "description": "Tracks diversity metrics through the hiring pipeline from application to hire",
        "dataSources": "DiversityMetrics, Applications"
      }
    ],
    "Ghosting Risk": [
      {
        "name": "vw_GhostingRiskDashboard",
        "description": "Consolidates ghosting risk factors including historical patterns, response times, and communication volume",
        "dataSources": "Applications, Candidates, JobPostings, Users, GhostingPatterns, CommunicationLogs, ApplicationStatus"
      }
    ],
    "Salary & Compensation": [
      {
        "name": "vw_SalaryTransparency",
        "description": "Compares job salary ranges against market benchmarks and tracks transparency levels",
        "dataSources": "JobPostings, JobSalaryRanges, SalaryBenchmarks, Applications"
      }
    ],
    "Remote Work": [
      {
        "name": "vw_RemoteCompatibilityMatrix",
        "description": "Provides a comprehensive view of candidate vs. company remote work compatibility",
        "dataSources": "Candidates, RemoteCompatibility, Applications, JobPostings, CompanyRemotePolicy, TimezoneOverlapAnalysis"
      }
    ],
    "Career Development": [
      {
        "name": "vw_CareerPathInsights",
        "description": "Shows candidate career goals, transition probabilities, and available learning resources",
        "dataSources": "Candidates, CandidateCareerGoals, CareerPaths, CandidateSkills, LearningResources"
      }
    ],
    "Referral Intelligence": [
      {
        "name": "vw_ReferralIntelligence",
        "description": "Tracks referral performance, relationship strength, and outcome analysis",
        "dataSources": "ReferralNetwork, Candidates, JobPostings, NetworkStrength, ReferralPerformance"
      }
    ],
    "Market Intelligence": [
      {
        "name": "vw_MarketIntelligenceDashboard",
        "description": "Provides supply/demand metrics, salary trends, and hiring difficulty by skill and location",
        "dataSources": "MarketIntelligence, Skills"
      }
    ],
    "Candidate Engagement": [
      {
        "name": "vw_CandidateEngagement",
        "description": "Measures candidate responsiveness through interview confirmation rates",
        "dataSources": "Candidates, Applications, InterviewSchedules"
      }
    ],
    "Onboarding": [
      {
        "name": "vw_OnboardingPredictions",
        "description": "(Inferred) Would show onboarding success predictions - referenced in sp_PredictOnboardingSuccess",
        "dataSources": "(Derived from multiple onboarding tables)"
      }
    ],
    "Advanced Analytics": [
      {
        "name": "vw_AI_Predictions",
        "description": "(Inferred) Would show AI-generated success predictions - based on AI_Predictions table",
        "dataSources": "AI_Predictions, Candidates, JobPostings"
      },
      {
        "name": "vw_ResumeInsights",
        "description": "(Inferred) Would show NLP-extracted resume insights - based on ResumeInsights table",
        "dataSources": "ResumeInsights, Candidates"
      }
    ]
  },
  "tableGroups": {
    "Core Identity & Security": [
      {
        "name": "Roles",
        "columnCount": "2",
        "primaryKey": "RoleID",
        "foreignKeys": "None",
        "description": "Defines user roles (Admin, Recruiter, Candidate)."
      },
      {
        "name": "Users",
        "columnCount": "9",
        "primaryKey": "UserID",
        "foreignKeys": "RoleID",
        "description": "Stores login credentials and basic info for all system users."
      },
      {
        "name": "Recruiters",
        "columnCount": "3",
        "primaryKey": "RecruiterID",
        "foreignKeys": "UserID",
        "description": "Stores profile information for recruiters."
      },
      {
        "name": "Candidates",
        "columnCount": "13",
        "primaryKey": "CandidateID",
        "foreignKeys": "UserID",
        "description": "Stores detailed profile information for job candidates."
      },
      {
        "name": "ConsentManagement",
        "columnCount": "9",
        "primaryKey": "ConsentID",
        "foreignKeys": "CandidateID",
        "description": "Manages candidate consent for data processing."
      },
      {
        "name": "AuditLog",
        "columnCount": "7",
        "primaryKey": "AuditID",
        "foreignKeys": "None",
        "description": "A generic audit log for tracking changes across tables."
      },
      {
        "name": "PushNotifications",
        "columnCount": "12",
        "primaryKey": "NotificationID",
        "foreignKeys": "UserID",
        "description": "Manages push notifications sent to users' devices."
      },
      {
        "name": "BlockchainVerifications",
        "columnCount": "11",
        "primaryKey": "VerificationID",
        "foreignKeys": "CandidateID",
        "description": "Tracks verification of credentials on a blockchain."
      },
      {
        "name": "BackgroundChecks",
        "columnCount": "14",
        "primaryKey": "CheckID",
        "foreignKeys": "CandidateID",
        "description": "Manages the process and results of background checks."
      },
      {
        "name": "GhostingPatterns",
        "columnCount": "7",
        "primaryKey": "PatternID",
        "foreignKeys": "UserID",
        "description": "Tracks patterns of non-response to predict ghosting risk."
      }
    ],
    "Job & Skills Management": [
      {
        "name": "JobPostings",
        "columnCount": "9",
        "primaryKey": "JobID",
        "foreignKeys": "CreatedBy",
        "description": "Stores details about job vacancies."
      },
      {
        "name": "JobPostingsArchive",
        "columnCount": "6",
        "primaryKey": "None (Archival)",
        "foreignKeys": "None",
        "description": "An archival table for old or deleted job postings."
      },
      {
        "name": "JobSalaryRanges",
        "columnCount": "9",
        "primaryKey": "RangeID",
        "foreignKeys": "JobID",
        "description": "Stores the salary range offered for a specific job posting."
      },
      {
        "name": "Skills",
        "columnCount": "2",
        "primaryKey": "SkillID",
        "foreignKeys": "None",
        "description": "A master list of all skills (e.g., \"SQL\", \"Java\")."
      },
      {
        "name": "JobSkills",
        "columnCount": "4",
        "primaryKey": "(JobID, SkillID)",
        "foreignKeys": "JobID, SkillID",
        "description": "Defines skills required for a job, including if they are mandatory."
      },
      {
        "name": "CandidateSkills",
        "columnCount": "3",
        "primaryKey": "(CandidateID, SkillID)",
        "foreignKeys": "CandidateID, SkillID",
        "description": "Links candidates to skills and stores their proficiency level."
      },
      {
        "name": "SalaryBenchmarks",
        "columnCount": "13",
        "primaryKey": "BenchmarkID",
        "foreignKeys": "SkillID",
        "description": "Stores market salary data for roles, locations, and experience."
      },
      {
        "name": "MarketIntelligence",
        "columnCount": "14",
        "primaryKey": "IntelID",
        "foreignKeys": "SkillID",
        "description": "Stores external market data on skills, salaries, and demand."
      },
      {
        "name": "MarketAlerts",
        "columnCount": "11",
        "primaryKey": "AlertID",
        "foreignKeys": "SkillID",
        "description": "Generates alerts based on changes in market intelligence."
      },
      {
        "name": "CompetitorAnalysis",
        "columnCount": "11",
        "primaryKey": "AnalysisID",
        "foreignKeys": "None",
        "description": "Tracks hiring activities of competitors."
      },
      {
        "name": "RoleArchetypes",
        "columnCount": "7",
        "primaryKey": "ArchetypeID",
        "foreignKeys": "None",
        "description": "Categorizes roles by archetype (Manager, Specialist, etc.)."
      }
    ],
    "Application & Workflow": [
      {
        "name": "Applications",
        "columnCount": "9",
        "primaryKey": "ApplicationID",
        "foreignKeys": "CandidateID, JobID, StatusID",
        "description": "The core table linking a candidate to a job application."
      },
      {
        "name": "ApplicationsArchive",
        "columnCount": "6",
        "primaryKey": "None (Archival)",
        "foreignKeys": "None",
        "description": "An archival table for old applications."
      },
      {
        "name": "ApplicationStatus",
        "columnCount": "2",
        "primaryKey": "StatusID",
        "foreignKeys": "None",
        "description": "Defines possible states of a job application (Applied, Hired, etc.)."
      },
      {
        "name": "ApplicationStatusTransitions",
        "columnCount": "2",
        "primaryKey": "(FromStatusID, ToStatusID)",
        "foreignKeys": "FromStatusID, ToStatusID",
        "description": "Defines the state machine for valid application status changes."
      },
      {
        "name": "ApplicationStatusHistory",
        "columnCount": "6",
        "primaryKey": "HistoryID",
        "foreignKeys": "ApplicationID, FromStatusID, ToStatusID, ChangedBy",
        "description": "An audit trail of every status change for an application."
      },
      {
        "name": "CandidateRankingHistory",
        "columnCount": "5",
        "primaryKey": "HistoryID",
        "foreignKeys": "CandidateID, JobID",
        "description": "Stores historical match scores for candidates against jobs."
      },
      {
        "name": "ScreeningBotDecisions",
        "columnCount": "10",
        "primaryKey": "DecisionID",
        "foreignKeys": "ApplicationID",
        "description": "Logs decisions made by an automated screening bot."
      },
      {
        "name": "AI_Predictions",
        "columnCount": "8",
        "primaryKey": "PredictionID",
        "foreignKeys": "CandidateID, JobID, ApplicationID",
        "description": "Stores AI-generated predictions for hiring success."
      },
      {
        "name": "OnboardingPredictions",
        "columnCount": "8",
        "primaryKey": "PredictionID",
        "foreignKeys": "CandidateID, JobID",
        "description": "Stores predictions about a candidate's onboarding success."
      },
      {
        "name": "CandidateGamification",
        "columnCount": "9",
        "primaryKey": "GameID",
        "foreignKeys": "CandidateID",
        "description": "Tracks points, levels, and badges for candidate engagement."
      }
    ],
    "Interview Management": [
      {
        "name": "InterviewSchedules",
        "columnCount": "6",
        "primaryKey": "ScheduleID",
        "foreignKeys": "ApplicationID, RecruiterID",
        "description": "Stores scheduled interviews."
      },
      {
        "name": "InterviewFeedback",
        "columnCount": "9",
        "primaryKey": "FeedbackID",
        "foreignKeys": "ApplicationID, InterviewerID",
        "description": "Stores feedback scores and comments from an interviewer."
      },
      {
        "name": "InterviewSharedInsights",
        "columnCount": "10",
        "primaryKey": "InsightID",
        "foreignKeys": "JobID",
        "description": "Tracks questions asked across interviews to identify redundancy."
      },
      {
        "name": "InterviewOptimizationRules",
        "columnCount": "6",
        "primaryKey": "RuleID",
        "foreignKeys": "None",
        "description": "Stores rules for optimizing the interview process."
      },
      {
        "name": "InterviewTranscriptions",
        "columnCount": "12",
        "primaryKey": "TranscriptionID",
        "foreignKeys": "ScheduleID, InterviewID",
        "description": "Stores transcriptions and analysis of interviews."
      },
      {
        "name": "VideoInterviews",
        "columnCount": "12",
        "primaryKey": "VideoInterviewID",
        "foreignKeys": "ApplicationID, ScheduleID",
        "description": "Manages links and metadata for video interviews."
      },
      {
        "name": "AI_GeneratedQuestions",
        "columnCount": "11",
        "primaryKey": "QuestionID",
        "foreignKeys": "JobID, SkillID",
        "description": "Stores AI-generated interview questions."
      },
      {
        "name": "InterviewPrepMaterials",
        "columnCount": "10",
        "primaryKey": "MaterialID",
        "foreignKeys": "JobID, CreatedBy",
        "description": "Stores materials to help candidates prepare for interviews."
      },
      {
        "name": "CandidateInterviewHistory",
        "columnCount": "11",
        "primaryKey": "HistoryID",
        "foreignKeys": "CandidateID",
        "description": "Stores a candidate's personal history of interviews."
      },
      {
        "name": "CandidatePrepProgress",
        "columnCount": "8",
        "primaryKey": "ProgressID",
        "foreignKeys": "CandidateID, MaterialID",
        "description": "Tracks a candidate's progress through prep materials."
      },
      {
        "name": "MicroAssessments",
        "columnCount": "9",
        "primaryKey": "AssessmentID",
        "foreignKeys": "SkillID",
        "description": "Defines short assessments/quizzes for skill verification."
      },
      {
        "name": "SkillVerifications",
        "columnCount": "12",
        "primaryKey": "VerificationID",
        "foreignKeys": "CandidateID, SkillID, AssessmentID, VerifiedBy",
        "description": "Records attempts and results of skill verifications."
      },
      {
        "name": "AssessmentAttempts",
        "columnCount": "8",
        "primaryKey": "AttemptID",
        "foreignKeys": "CandidateID, AssessmentID",
        "description": "Tracks a candidate's attempt at a specific micro-assessment."
      },
      {
        "name": "NegotiationHistory",
        "columnCount": "12",
        "primaryKey": "NegotiationID",
        "foreignKeys": "CandidateID, JobID",
        "description": "Tracks the history of salary negotiations."
      },
      {
        "name": "NegotiationTemplates",
        "columnCount": "8",
        "primaryKey": "TemplateID",
        "foreignKeys": "None",
        "description": "Stores pre-written templates for salary negotiations."
      },
      {
        "name": "OnboardingChecklists",
        "columnCount": "9",
        "primaryKey": "ChecklistID",
        "foreignKeys": "JobID",
        "description": "Defines onboarding tasks for specific job types."
      }
    ],
    "Documents & Communication": [
      {
        "name": "CandidateDocuments",
        "columnCount": "5",
        "primaryKey": "DocumentID",
        "foreignKeys": "CandidateID",
        "description": "Stores metadata for candidate-uploaded documents (resumes, etc.)."
      },
      {
        "name": "ResumeInsights",
        "columnCount": "13",
        "primaryKey": "InsightID",
        "foreignKeys": "CandidateID, DocumentID",
        "description": "Stores insights extracted from resumes via NLP."
      },
      {
        "name": "EmailQueue",
        "columnCount": "7",
        "primaryKey": "EmailID",
        "foreignKeys": "CandidateID",
        "description": "A queue for sending asynchronous emails to candidates."
      },
      {
        "name": "CommunicationLogs",
        "columnCount": "9",
        "primaryKey": "LogID",
        "foreignKeys": "ApplicationID, SenderID, ReceiverID",
        "description": "Logs all communications between users."
      },
      {
        "name": "ChatbotInteractions",
        "columnCount": "13",
        "primaryKey": "InteractionID",
        "foreignKeys": "CandidateID",
        "description": "Logs interactions with a recruitment chatbot."
      },
      {
        "name": "CandidateSentiment",
        "columnCount": "12",
        "primaryKey": "SentimentID",
        "foreignKeys": "CandidateID",
        "description": "Tracks candidate sentiment from interactions."
      },
      {
        "name": "ExternalPlatformSync",
        "columnCount": "12",
        "primaryKey": "SyncID",
        "foreignKeys": "CandidateID, JobID",
        "description": "Tracks data synchronization with external job platforms."
      },
      {
        "name": "PersonalizedLearningPaths",
        "columnCount": "11",
        "primaryKey": "PathID",
        "foreignKeys": "CandidateID, GoalJobID",
        "description": "Creates a personalized learning path for a candidate's goal."
      }
    ],
    "Remote Work & Location Intelligence": [
      {
        "name": "RemoteCompatibility",
        "columnCount": "12",
        "primaryKey": "CompatibilityID",
        "foreignKeys": "CandidateID",
        "description": "Stores a candidate's self-assessed remote work readiness."
      },
      {
        "name": "CompanyRemotePolicy",
        "columnCount": "10",
        "primaryKey": "PolicyID",
        "foreignKeys": "RecruiterID",
        "description": "Stores a company's/recruiter's remote work policies."
      },
      {
        "name": "TimezoneOverlapAnalysis",
        "columnCount": "8",
        "primaryKey": "AnalysisID",
        "foreignKeys": "CandidateID, JobID",
        "description": "Analyzes timezone overlap between a candidate and a job."
      },
      {
        "name": "CandidateLocationPreferences",
        "columnCount": "6",
        "primaryKey": "PreferenceID",
        "foreignKeys": "CandidateID",
        "description": "Stores detailed location and relocation preferences."
      },
      {
        "name": "OnboardingSuccessFactors",
        "columnCount": "13",
        "primaryKey": "FactorID",
        "foreignKeys": "HiredCandidateID",
        "description": "Tracks data points for candidates post-hire to predict success."
      },
      {
        "name": "DiversityMetrics",
        "columnCount": "12",
        "primaryKey": "MetricID",
        "foreignKeys": "ApplicationID",
        "description": "Stores anonymized diversity data for applicants."
      },
      {
        "name": "DiversityGoals",
        "columnCount": "7",
        "primaryKey": "GoalID",
        "foreignKeys": "RecruiterID",
        "description": "Tracks diversity hiring goals for recruiters."
      },
      {
        "name": "BiasDetectionLogs",
        "columnCount": "8",
        "primaryKey": "DetectionID",
        "foreignKeys": "RecruiterID",
        "description": "Logs potential bias detected in the hiring process."
      }
    ],
    "Career Development & Referrals": [
      {
        "name": "CareerPaths",
        "columnCount": "10",
        "primaryKey": "PathID",
        "foreignKeys": "None",
        "description": "Defines common career transitions and their statistics."
      },
      {
        "name": "CandidateCareerGoals",
        "columnCount": "8",
        "primaryKey": "GoalID",
        "foreignKeys": "CandidateID",
        "description": "Stores a candidate's career goals."
      },
      {
        "name": "LearningResources",
        "columnCount": "9",
        "primaryKey": "ResourceID",
        "foreignKeys": "SkillID",
        "description": "A catalog of learning resources for specific skills."
      },
      {
        "name": "ReferralNetwork",
        "columnCount": "12",
        "primaryKey": "ReferralID",
        "foreignKeys": "ReferrerID, ReferredCandidateID, JobID",
        "description": "Tracks candidate referrals and their outcomes."
      },
      {
        "name": "NetworkStrength",
        "columnCount": "10",
        "primaryKey": "StrengthID",
        "foreignKeys": "CandidateID, ConnectionID",
        "description": "Analyzes the strength of connections between candidates."
      },
      {
        "name": "ReferralPerformance",
        "columnCount": "8",
        "primaryKey": "PerformanceID",
        "foreignKeys": "ReferrerID",
        "description": "Summarizes the performance of a referrer."
      },
      {
        "name": "GamificationActions",
        "columnCount": "7",
        "primaryKey": "ActionID",
        "foreignKeys": "None",
        "description": "Defines actions that award gamification points."
      }
    ]
  },
  "triggers": [
    {
      "name": "trg_Audit_ApplicationStatusChange",
      "table": "Applications",
      "event": "UPDATE",
      "description": "Audits status changes on applications by capturing old/new values"
    },
    {
      "name": "trg_PreventDoubleBooking",
      "table": "InterviewSchedules",
      "event": "INSERT",
      "description": "Prevents recruiters from being double-booked for interviews"
    },
    {
      "name": "trg_SendInterviewEmail",
      "table": "InterviewSchedules",
      "event": "INSERT",
      "description": "Automatically queues email notifications when interviews are scheduled"
    },
    {
      "name": "trg_InstantAutoReject",
      "table": "Applications",
      "event": "INSERT",
      "description": "Auto-rejects applications where candidate lacks minimum experience"
    },
    {
      "name": "trg_ValidateEmail_OnInsert",
      "table": "Users",
      "event": "INSERT",
      "description": "Validates email format and checks for disposable email domains (CLR)"
    },
    {
      "name": "trg_ScoreSentiment_OnFeedbackInsert",
      "table": "InterviewFeedback",
      "event": "INSERT, UPDATE",
      "description": "Calculates sentiment score from interview comments (CLR)"
    },
    {
      "name": "trg_ValidateEmail_OnInsert",
      "table": "Users",
      "event": "INSERT",
      "description": "(Duplicate entry in script - same as #5)"
    }
  ],
  "stats": {
    "features": 96,
    "procedures": 33,
    "views": 28,
    "tables": 70,
    "triggers": 7,
    "categories": 12
  }
};
