// Auto-generated enriched documentation content from the LaTeX source.
// Source: NexHire Documentation For Collaboration (main.tex)

export const enrichedDocs = {
  "erGroups": [
    {
      "group": 1,
      "title": "Core Identity & Security",
      "subtitle": "User Authentication & Profile Security",
      "description": "This module covers how users are authenticated, how roles and permissions are enforced (RBAC), and how sensitive candidate data is secured through consent management, blockchain credential verification, background checks, and audit logging.",
      "image": "er-group1-core-identity.png",
      "tables": [
        "Roles",
        "Users",
        "Recruiters",
        "Candidates",
        "ConsentManagement",
        "AuditLog",
        "PushNotifications",
        "BlockchainVerifications",
        "BackgroundChecks",
        "GhostingPatterns"
      ]
    },
    {
      "group": 2,
      "title": "Job & Skills Management",
      "subtitle": "Job Postings, Skills & Market Intelligence",
      "description": "This module defines how job vacancies are created and archived, how required and candidate skills are structured, and how real-time salary benchmarks, market intelligence, and competitor hiring data inform smarter job offers.",
      "image": "er-group2-job-skills.png",
      "tables": [
        "JobPostings",
        "JobPostingsArchive",
        "JobSalaryRanges",
        "Skills",
        "JobSkills",
        "CandidateSkills",
        "SalaryBenchmarks",
        "MarketIntelligence",
        "MarketAlerts",
        "CompetitorAnalysis",
        "RoleArchetypes"
      ]
    },
    {
      "group": 3,
      "title": "Application & Workflow",
      "subtitle": "Application Lifecycle & AI-Driven Screening",
      "description": "This module manages the full lifecycle of a job application \u2014 from submission through a state-machine-enforced status flow to archival \u2014 including automated bot screening, AI hiring predictions, onboarding forecasts, and candidate gamification to drive engagement.",
      "image": "er-group3-application-workflow.png",
      "tables": [
        "Applications",
        "ApplicationsArchive",
        "ApplicationStatus",
        "AppStatusTransitions",
        "AppStatusHistory",
        "CandidateRankingHistory",
        "ScreeningBotDecisions",
        "AI_Predictions",
        "OnboardingPredictions",
        "CandidateGamification"
      ]
    },
    {
      "group": 4,
      "title": "Interview Management",
      "subtitle": "Scheduling, Assessments & Negotiation",
      "description": "This module covers the entire interview pipeline \u2014 from conflict-free scheduling and video interviews to AI-generated questions, skill micro-assessments, feedback scoring, transcript analysis, candidate prep progress, and salary negotiation tracking \u2014 through to onboarding task checklists.",
      "image": "er-group4-interview-management.png",
      "tables": [
        "InterviewSchedules",
        "InterviewFeedback",
        "InterviewSharedInsights",
        "InterviewOptimizationRules",
        "InterviewTranscriptions",
        "VideoInterviews",
        "AI_GeneratedQuestions",
        "InterviewPrepMaterials",
        "CandidateInterviewHistory",
        "CandidatePrepProgress",
        "MicroAssessments",
        "SkillVerifications",
        "AssessmentAttempts",
        "NegotiationHistory",
        "NegotiationTemplates",
        "OnboardingChecklists"
      ]
    },
    {
      "group": 5,
      "title": "Documents & Communication",
      "subtitle": "Resumes, Messaging & Candidate Engagement",
      "description": "This module handles all document storage and NLP-driven resume analysis, asynchronous email queuing, multi-channel communication logs, chatbot interaction history, candidate sentiment tracking, external platform synchronization, and AI-personalized learning path generation.",
      "image": "er-group5-documents-communication.png",
      "tables": [
        "CandidateDocuments",
        "ResumeInsights",
        "EmailQueue",
        "CommunicationLogs",
        "ChatbotInteractions",
        "CandidateSentiment",
        "ExternalPlatformSync",
        "PersonalizedLearningPaths"
      ]
    },
    {
      "group": 6,
      "title": "Remote Work & Location Intelligence",
      "subtitle": "Remote Readiness, Diversity & Bias Detection",
      "description": "This module assesses candidates' remote work compatibility and timezone overlap, records company remote policies, tracks location and relocation preferences, measures post-hire onboarding success factors, and enforces fair hiring through diversity metrics, goal tracking, and automated bias detection logs.",
      "image": "er-group6-remote-work.png",
      "tables": [
        "RemoteCompatibility",
        "CompanyRemotePolicy",
        "TimezoneOverlapAnalysis",
        "CandidateLocationPreferences",
        "OnboardingSuccessFactors",
        "DiversityMetrics",
        "DiversityGoals",
        "BiasDetectionLogs"
      ]
    },
    {
      "group": 7,
      "title": "Career Development & Referrals",
      "subtitle": "Career Paths, Learning Resources & Referral Intelligence",
      "description": "This module maps common career transitions and candidate goals, catalogs skill-specific learning resources, and powers the referral intelligence engine \u2014 tracking social network strength, referral outcomes, referrer performance, and gamification action definitions that reward candidate engagement across the platform.",
      "image": "er-group7-career-development.png",
      "tables": [
        "CareerPaths",
        "CandidateCareerGoals",
        "LearningResources",
        "ReferralNetwork",
        "NetworkStrength",
        "ReferralPerformance",
        "GamificationActions"
      ]
    }
  ],
  "coreFeatures": [
    {
      "id": "state-machine",
      "title": "State Machine Workflow",
      "problem": "Applications need to move through a controlled hiring pipeline (Applied to Screening to Interview to Hired/Rejected). Without validation, invalid transitions (e.g., jumping directly from Applied to Hired) would corrupt the workflow.",
      "solution": "A data-driven state machine enforces valid status transitions via the ApplicationStatusTransitions table. Recruiters update application status, and the database validates the move against allowed transitions. Because rules are stored as data, administrators can extend the workflow (e.g., add \"Background Check\") without rewriting application code.",
      "implementation": "ApplicationStatusTransitions table stores (FromStatusID, ToStatusID) pairs. sp_UpdateApplicationStatus validates each transition before applying it and logs to AppStatusHistory for a complete audit trail.",
      "statusTable": [
        {
          "id": 1,
          "name": "Applied",
          "terminal": false,
          "next": "Screening, Withdrawn"
        },
        {
          "id": 2,
          "name": "Screening",
          "terminal": false,
          "next": "Interview, Rejected, Withdrawn"
        },
        {
          "id": 3,
          "name": "Interview",
          "terminal": false,
          "next": "Hired, Rejected, Withdrawn"
        },
        {
          "id": 4,
          "name": "Hired",
          "terminal": true,
          "next": "None (terminal)"
        },
        {
          "id": 5,
          "name": "Rejected",
          "terminal": true,
          "next": "None (terminal)"
        },
        {
          "id": 6,
          "name": "Withdrawn",
          "terminal": true,
          "next": "None (terminal)"
        }
      ]
    },
    {
      "id": "concurrency-safe-hiring",
      "title": "Concurrency-Safe Hiring",
      "problem": "When multiple recruiters attempt to hire candidates for the same job simultaneously, race conditions can overbook the vacancy count \u2014 hiring more candidates than positions available.",
      "solution": "An explicit database transaction with pessimistic locking (UPDLOCK + HOLDLOCK) treats the application row and job posting as a single atomic unit. The procedure re-checks remaining vacancies before updating, preventing overbooking.",
      "implementation": "sp_HireCandidate locks the application and job posting records, verifies vacancies > 0, then atomically updates application status to Hired and decrements the vacancy counter in the same transaction."
    },
    {
      "id": "smart-interview-scheduling",
      "title": "Smart Interview Scheduling",
      "problem": "Interviewers can be double-booked if scheduling conflicts aren't detected, leading to wasted time and candidate frustration.",
      "solution": "A trigger (trg_PreventDoubleBooking) intercepts new schedule inserts and checks for time-window overlap. If a collision is detected, the insert is blocked. This keeps the hiring pipeline reliable during peak usage.",
      "implementation": "INSTEAD OF INSERT trigger on InterviewSchedules compares new slots against existing ones for the same recruiter. Validations include time overlap detection, future-only scheduling, duration limits (30 min to 4 hr), and candidate availability tracking."
    },
    {
      "id": "trigger-email",
      "title": "Trigger-Based Email Notification",
      "problem": "Candidates need timely notification when interviews are scheduled, but relying on recruiters to send manual follow-ups is unreliable.",
      "solution": "A trigger (trg_SendInterviewEmail) automatically inserts a message into EmailQueue whenever a new interview slot is created. A background service processes the queue, sends emails, and marks them as sent for auditability.",
      "implementation": "AFTER INSERT trigger on InterviewSchedules joins with Applications and Candidates to compose a formatted email with interview time window, then inserts into EmailQueue. This design keeps notifications consistent and provides a traceable record."
    },
    {
      "id": "document-management",
      "title": "Document Management",
      "problem": "Recruiters need reliable access to candidate resumes, cover letters, certificates, and portfolio attachments from a single structured location.",
      "solution": "The CandidateDocuments table centralizes file handling with metadata tracking (upload timestamps, versions, expiry dates) and secure retrieval tied to candidate profiles. Allowed types and size constraints are enforced.",
      "implementation": "Candidates upload documents through the application workflow. The system stores metadata in CandidateDocuments while enforcing constraints. Recruiters review the latest approved versions during screening; the audit trail ensures changes are traceable for compliance."
    },
    {
      "id": "audit-trail",
      "title": "Complete Audit Trail",
      "problem": "Sensitive recruitment actions (status updates, interview modifications, vacancy adjustments, feedback edits) need end-to-end traceability for governance, investigation, and regulatory compliance.",
      "solution": "An AuditLog table records who changed what, when, and (when applicable) from/to values. Audit entries are written automatically via triggers whenever protected tables are modified.",
      "implementation": "AuditLog captures TableName, RecordID, Operation (INSERT/UPDATE/DELETE), OldValue, NewValue, ChangedBy, and ChangedAt. Audited tables include Applications (status changes), InterviewSchedules, InterviewFeedback, and JobPostings (vacancy changes)."
    }
  ],
  "advancedFeatures": [
    {
      "id": "ghosting-prediction",
      "title": "Anti-Ghosting Risk Prediction",
      "problem": "Roughly 50% of hiring processes suffer from ghosting \u2014 candidates going silent after interviews, or recruiters failing to follow up. There is no visibility into communication reliability. Recruiters cannot know a candidate's no-show history, and candidates cannot know whether a recruiter typically goes dark after final rounds.",
      "solution": "A weighted risk score (0-10) is calculated per application by combining historical ghosting patterns for both parties, average response times, and communication frequency. Each application is classified as Low, Medium, or High risk with a recommended action.",
      "implementation": "GhostingPatterns and CommunicationLogs feed sp_PredictGhostingRisk, which applies a weighted formula: 40% candidate ghosting score + 30% recruiter score + 20% response time + 10% communication frequency. The view vw_GhostingRiskDashboard surfaces real-time risk across all active applications.",
      "formula": "0.4 x CandidateScore + 0.3 x RecruiterScore + 0.2 x ResponseTimeScore + 0.1 x CommFrequencyScore",
      "riskLevels": [
        {
          "range": "0.0 - 3.9",
          "level": "Low Risk",
          "action": "Standard monitoring"
        },
        {
          "range": "4.0 - 6.9",
          "level": "Medium Risk",
          "action": "Increase communication frequency"
        },
        {
          "range": "7.0 - 10.0",
          "level": "High Risk",
          "action": "Escalation reminders + follow-up call"
        }
      ]
    },
    {
      "id": "predictive-hiring",
      "title": "Predictive Hiring Success (Rules-Based AI)",
      "problem": "Hiring decisions based on gut feeling lead to costly mis-hires. Recruiters rely on incomplete signals \u2014 a strong interview can mask a weak skill fit, and promising candidates may be overlooked due to bias.",
      "solution": "Five quantifiable factors \u2014 skill match, experience match, interview scores, communication engagement, and historical hire success \u2014 are combined into a single probability value (0-1), stored in AI_Predictions with a full JSON breakdown for auditability.",
      "implementation": "sp_PredictHireSuccess calculates each dimension via joins against JobSkills, CandidateSkills, InterviewFeedback, and CommunicationLogs, then blends them using a weighted average. The result is blended with historical success rate (70/30 split) and persisted for model accuracy tracking.",
      "formula": "FinalScore = 0.30 x SkillMatch + 0.25 x ExperienceMatch + 0.30 x InterviewScore + 0.15 x ResponseEngagement\nFinalProbability = 0.7 x FinalScore + 0.3 x HistoricalSuccess"
    },
    {
      "id": "blockchain-verification",
      "title": "Blockchain Credential Verification",
      "problem": "Resume fraud \u2014 fake degrees, fabricated certifications \u2014 cannot be reliably caught by keyword scanning or manual review. Manual background checks are slow and inconsistent. Hiring on fraudulent credentials is costly and reputationally damaging.",
      "solution": "Each credential is SHA-256 hashed and the hash is anchored on-chain (default: Ethereum). The transaction ID and block number are stored in BlockchainVerifications. Any future check simply re-hashes the document and compares \u2014 a mismatch signals tampering.",
      "implementation": "The CLR function dbo.HashCredential() generates the SHA-256 hash inside SQL Server. Records track credential type (Degree, Certificate, Employment, Identity), issuing authority, network, verification status, and optional gas cost. The IsImmutable flag marks on-chain records as unalterable."
    },
    {
      "id": "skill-verification",
      "title": "Skill Verification & Assessments",
      "problem": "Roughly 30% of candidates misrepresent skills on their resumes. Self-reported proficiency levels are unreliable, and skills learned years ago may no longer be current. Recruiters have no way to distinguish genuinely skilled candidates from those who simply list buzzwords.",
      "solution": "Candidates complete micro-assessments (quiz, code challenge, scenario, or peer review) tied to specific skills. Each verification records the score, method, confidence level, and an expiry date. The view vw_SkillVerificationStatus surfaces verified vs. unverified skills across all candidates at a glance.",
      "implementation": "MicroAssessments defines the test catalog per skill. SkillVerifications stores each candidate's result, and AssessmentAttempts logs every attempt for audit. Filtered indexes on ExpiryDate keep expiry lookups fast without scanning inactive records.",
      "images": [
        "skill-verification-1.png",
        "skill-verification-2.png",
        "skill-verification-3.png"
      ]
    },
    {
      "id": "gamification",
      "title": "Gamification System",
      "problem": "Candidate drop-off during lengthy application processes is a major recruiter pain point. Passive candidates often abandon applications midway because the process feels tedious. There is no feedback loop that makes progress feel rewarding.",
      "solution": "Every meaningful action \u2014 completing a profile, submitting an application, attending interviews, responding quickly \u2014 earns points. Points unlock levels (1-5), trigger badge awards, and build daily streaks. A leaderboard ranks candidates by points and level.",
      "implementation": "CandidateGamification holds the per-candidate state (Points, Level 1-5, Badges as JSON array, StreakDays, LeaderboardRank, EngagementScore). GamificationActions defines each action's point value, badge, and daily cap. sp_AwardGamificationPoints handles point addition, level promotion, streak tracking, and badge assignment atomically inside a transaction."
    },
    {
      "id": "learning-paths",
      "title": "Personalized Learning Paths",
      "problem": "Candidates who are not yet fully qualified for a target role often leave the platform rather than upskill. Generic career advice is not actionable. Candidates lose motivation without a measurable readiness goal tied to a specific role.",
      "solution": "The system compares current skill proficiencies against job requirements, calculates a readiness score (0-100), and outputs a prioritized JSON skills gap list with mandatory gaps flagged as High Priority. Resources and an estimated completion timeline are attached.",
      "implementation": "PersonalizedLearningPaths stores readiness scores, gap analysis, and progress state per candidate-job pair. sp_GenerateLearningPath builds the gap list using FOR JSON PATH and upserts the result, so repeated calls update progress rather than creating duplicates."
    },
    {
      "id": "resume-quality",
      "title": "Resume Quality Scoring",
      "problem": "Recruiters spend significant time manually reviewing resumes of varying quality. Without a standardized scoring metric, screening decisions are inconsistent and subjective.",
      "solution": "The system automatically scores resume quality based on multiple NLP-extracted signals \u2014 skills count, experience years, education keywords, contact completeness, and formatting \u2014 producing a 0-100 score stored in ResumeInsights.",
      "implementation": "sp_ProcessCandidateResume orchestrates the pipeline: extract text (via CLR functions for PDF/DOCX), run ExtractSkills and ExtractYearsOfExperience, then compute a composite quality score. Results are upserted into ResumeInsights with the breakdown for recruiter review."
    },
    {
      "id": "document-extraction",
      "title": "Document Text Extraction (PDF & DOCX)",
      "problem": "Resumes arrive in PDF and DOCX formats that cannot be directly queried. Manual transcription is slow and error-prone, making automated matching impossible.",
      "solution": "CLR functions (ExtractTextFromPDF, ExtractTextFromDocx) parse binary document content into plain text inside SQL Server, enabling NLP analysis and skill extraction directly within the database.",
      "implementation": "The CLR functions use iTextSharp (PDF) and DocumentFormat.OpenXml (DOCX) libraries to extract text. The extracted text is stored in CandidateDocuments and processed by sp_ProcessCandidateResume to populate ResumeInsights with skills, experience, and quality scores."
    }
  ],
  "clrFunctions": [
    {
      "category": "Email Validation",
      "functions": [
        {
          "name": "ValidateEmail",
          "desc": "Validates email format using regex. Returns 1 (valid) or 0 (invalid)."
        },
        {
          "name": "IsDisposableEmail",
          "desc": "Checks if email domain is in a disposable email blacklist. Prevents fake signups."
        },
        {
          "name": "ExtractEmailDomain",
          "desc": "Extracts the domain portion of an email address for analysis."
        }
      ]
    },
    {
      "category": "Security",
      "functions": [
        {
          "name": "HashPassword (PBKDF2)",
          "desc": "Hashes passwords using PBKDF2 with salt (12 rounds). Returns a base64 hash string."
        },
        {
          "name": "VerifyPassword",
          "desc": "Verifies a plaintext password against a stored PBKDF2 hash."
        },
        {
          "name": "GenerateSecureToken",
          "desc": "Generates a cryptographically secure random token (e.g., for password resets)."
        },
        {
          "name": "EncryptSensitiveData",
          "desc": "Encrypts sensitive data (SSN, salary) using AES-256."
        }
      ]
    },
    {
      "category": "String Similarity",
      "functions": [
        {
          "name": "LevenshteinDistance",
          "desc": "Computes edit distance between two strings. Catches typos in candidate name search."
        },
        {
          "name": "JaroWinklerSimilarity",
          "desc": "Computes Jaro-Winkler similarity (0-1). Better for short strings like names."
        },
        {
          "name": "CosineSimilarity",
          "desc": "Computes cosine similarity between text vectors. Used for skill matching."
        }
      ]
    },
    {
      "category": "Date & Time",
      "functions": [
        {
          "name": "CalculateBusinessDays",
          "desc": "Calculates business days between two dates (excludes weekends)."
        },
        {
          "name": "AddBusinessDays",
          "desc": "Adds N business days to a date."
        },
        {
          "name": "IsWithinWorkingHours",
          "desc": "Checks if a datetime falls within standard working hours."
        },
        {
          "name": "GetRelativeTime",
          "desc": "Returns human-readable relative time (e.g., \"3 hours ago\")."
        }
      ]
    },
    {
      "category": "Timezone",
      "functions": [
        {
          "name": "ConvertTimezone",
          "desc": "Converts a datetime from one timezone to another. Used for global interview scheduling."
        },
        {
          "name": "GetTimezoneOffset",
          "desc": "Returns the UTC offset for a timezone."
        },
        {
          "name": "CalculateTimezoneOverlap",
          "desc": "Calculates working-hours overlap between two timezones for remote teams."
        }
      ]
    },
    {
      "category": "Statistics",
      "functions": [
        {
          "name": "StandardDeviation",
          "desc": "Computes standard deviation. Used for interviewer consistency scoring."
        },
        {
          "name": "Percentile",
          "desc": "Computes percentile of a dataset. Used for salary benchmarks."
        },
        {
          "name": "ZScore",
          "desc": "Computes z-score for outlier detection in hiring metrics."
        },
        {
          "name": "CorrelationCoefficient",
          "desc": "Computes Pearson correlation. Used for predictive model validation."
        }
      ]
    },
    {
      "category": "Document Parsing",
      "functions": [
        {
          "name": "ExtractTextFromPDF",
          "desc": "Extracts plain text from PDF binary using iTextSharp."
        },
        {
          "name": "ExtractTextFromDocx",
          "desc": "Extracts plain text from DOCX binary using OpenXml."
        },
        {
          "name": "ExtractYearsOfExperience",
          "desc": "Heuristic NLP function that scans resume text for experience indicators (e.g., \"5 years\", \"since 2018\")."
        }
      ]
    },
    {
      "category": "NLP",
      "functions": [
        {
          "name": "ExtractSkills",
          "desc": "Scans text for 40+ skills with aliases. Returns skill:confidence pairs sorted by confidence."
        },
        {
          "name": "CalculateSentiment",
          "desc": "Analyzes text tone using positive (36-word) and negative (32-word) lexicons. Returns score in [-1.0, +1.0]."
        }
      ]
    },
    {
      "category": "API Integration",
      "functions": [
        {
          "name": "CallRESTApi",
          "desc": "Makes HTTP REST API calls from within SQL Server. Used for LinkedIn verification, geocoding, etc."
        },
        {
          "name": "VerifyLinkedInProfile",
          "desc": "Validates a LinkedIn profile URL via the LinkedIn API."
        },
        {
          "name": "GeocodeAddress",
          "desc": "Converts a text address to lat/long coordinates for location-based matching."
        }
      ]
    }
  ],
  "architecturalDecisions": [
    {
      "decision": "Unified User Model",
      "rationale": "Single authentication layer for all user types (Admin, Recruiter, Candidate)"
    },
    {
      "decision": "Data-Driven State Machine",
      "rationale": "Workflow rules stored as data, not hardcoded logic"
    },
    {
      "decision": "Skill Proficiency Matrix",
      "rationale": "Granular skill assessment (1-10 scale) for precise matching"
    },
    {
      "decision": "Audit-First Design",
      "rationale": "Every critical change automatically logged for compliance"
    },
    {
      "decision": "GDPR-Ready Architecture",
      "rationale": "Built-in anonymization and data retention policies"
    }
  ],
  "systemScope": [
    {
      "title": "User Management",
      "desc": "Role-based access control for three user types (Admin, Recruiter, Candidate), secure authentication, profile separation, and permission boundaries."
    },
    {
      "title": "Candidate Processing",
      "desc": "End-to-end application lifecycle including profile creation, skill capture, document uploads, application submission, and controlled status movement with complete history tracking."
    },
    {
      "title": "Job Management",
      "desc": "Creation and maintenance of job postings with structured requirements (mandatory vs optional skills, minimum proficiency), vacancy tracking, and job-specific evaluation rules."
    },
    {
      "title": "Interview Coordination",
      "desc": "Conflict-free interview scheduling with database-level validation, automated notifications, candidate confirmation tracking, and structured feedback capture."
    },
    {
      "title": "Advanced Analytics",
      "desc": "Real-time views and dashboards measuring funnel conversion, time-to-hire, bottlenecks, recruiter performance, skill-gap trends, and bias indicators."
    },
    {
      "title": "Compliance",
      "desc": "Full audit logging, retention and archiving policies, anonymization support for privacy requirements (GDPR), and traceability of all critical actions."
    }
  ]
};
