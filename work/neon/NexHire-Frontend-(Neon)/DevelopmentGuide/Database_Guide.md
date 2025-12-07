# Database Guide

## 1. SQL Server Schema Reference

### Core Tables

| Table | Purpose | Key Columns |
|---|---|---|
| `Users` | All system users | `UserID`, `Username`, `Email`, `PasswordHash`, `RoleID`, `IsActive` |
| `Roles` | Role definitions | `RoleID` (1=Admin, 2=Recruiter, 3=Candidate), `RoleName` |
| `Candidates` | Candidate profiles | `CandidateID`, `UserID`, `FullName`, `Location`, `YearsOfExperience`, `ResumeText`, `ExtractedSkills` |
| `Recruiters` | Recruiter profiles | `RecruiterID`, `UserID`, `Department` |
| `JobPostings` | Job listings | `JobID`, `JobTitle`, `Description`, `Location`, `MinExperience`, `Vacancies`, `IsActive`, `IsDeleted`, `CreatedBy` |
| `Skills` | Master skill list | `SkillID`, `SkillName` |
| `CandidateSkills` | Skills per candidate | `CandidateID`, `SkillID`, `ProficiencyLevel` |
| `JobSkills` | Skills required per job | `JobID`, `SkillID`, `IsMandatory`, `MinProficiency` |
| `Applications` | Job applications | `ApplicationID`, `CandidateID`, `JobID`, `StatusID`, `AppliedDate`, `StatusChangedAt`, `WithdrawnAt`, `WithdrawalReason`, `RejectionReason`, `IsDeleted` |
| `ApplicationStatus` | Status lookup | `StatusID` (1=Applied, 2=Screening, 3=Interview, 4=Hired, 5=Rejected, 6=Withdrawn, 7=Invited) |
| `InterviewSchedules` | Scheduled interviews | `ScheduleID`, `ApplicationID`, `RecruiterID`, `InterviewStart`, `InterviewEnd`, `CandidateConfirmed` |
| `InterviewFeedback` | Interviewer scores | `FeedbackID`, `ApplicationID`, `InterviewerID` (FK to Users.UserID), `TechnicalScore`, `CommunicationScore`, `CultureFitScore`, `SentimentScore` (CLR-calculated), `Comments` |
| `AuditLog` | Change history | `AuditID`, `TableName`, `RecordID`, `Operation`, `OldValue`, `NewValue`, `ChangedBy`, `ChangedAt` |
| `EmailQueue` | Outbound notifications | `EmailID`, `CandidateID`, `EmailType`, `Subject`, `Body`, `IsSent`, `SentAt`, `CreatedAt`, `RetryCount`, `ErrorMessage` |
| `MicroAssessments` | Skill verification tests | `AssessmentID`, `SkillID`, `Title`, `Description`, `AssessmentType`, `TimeLimit`, `PassingScore`, `QuestionsCount`, `IsActive` |
| `AssessmentAttempts` | Test attempt records | `AttemptID`, `CandidateID`, `AssessmentID`, `StartedAt`, `CompletedAt`, `Score`, `TimeSpentSeconds`, `IsPassed`, `Details` |
| `SkillVerifications` | Verified skills | `VerificationID`, `CandidateID`, `SkillID`, `AssessmentID`, `VerificationMethod`, `VerificationScore`, `VerifiedAt`, `IsVerified` |
| `SalaryBenchmarks` | Market salary data | `BenchmarkID`, `JobTitle`, `Location`, `ExperienceRange`, `SkillID`, `AvgSalary` |
| **`JobSalaryRanges`** | **Job-specific pay (transparent)** | **`RangeID`, `JobID`, `MinSalary`, `MaxSalary`, `IsTransparent`** |
| `CandidateGamification` | Gamification data | `GameID`, `CandidateID`, `Points`, `Level`, `Badges`, `StreakDays`, `LeaderboardRank`, `EngagementScore` |
| `GamificationActions` | Points actions | `ActionID`, `ActionType`, `PointsAwarded`, `BadgeEligible`, `CooldownHours`, `IsActive` |
| `PersonalizedLearningPaths` | Learning paths | `PathID`, `CandidateID`, `GoalJobID`, `SkillsGapAnalysis`, `ProgressPercentage`, `CurrentPhase` |
| `CandidateLocationPreferences` | Location prefs | `PreferenceID`, `CandidateID`, `PreferredLocations`, `RemotePreference`, `CommuteTimeMax` |
| `ConsentManagement` | GDPR consent | `ConsentID`, `CandidateID`, `ConsentType` (DataProcessing/Marketing/Retention/ThirdPartySharing), `ConsentVersion`, `IsActive`, `GivenAt`, `RevokedAt`, `ExpiryDate` |
| `PushNotifications` | Push notifications | `NotificationID`, `UserID`, `DeviceToken`, `Platform`, `Title`, `Body`, `NotificationType`, `SentAt`, `ReadAt` |
| `ExternalPlatformSync` | Platform sync | `SyncID`, `Platform`, `CandidateID`, `JobID`, `SyncDirection`, `SyncStatus`, `LastSyncedAt`, `ProfileURL`, `JobURL`, `PlatformReputationScore` |
| `GhostingPatterns` | Ghosting data | `PatternID`, `UserID`, `UserType`, `Action`, `Frequency`, `GhostingScore`, `IsActive` |
| `CommunicationLogs` | Communication tracking | `LogID`, `ApplicationID`, `SenderID`, `ReceiverID`, `MessageType`, `SentAt`, `RespondedAt`, `IsGhostingRisk` |
| `CareerPaths` | Career trajectories | `PathID`, `FromRole`, `ToRole`, `AvgTransitionMonths`, `Probability`, `RequiredSkillsGap`, `DemandTrend`, `FutureProofScore` |
| `RoleArchetypes` | Role categories | `ArchetypeID`, `RoleTitle`, `Archetype`, `GrowthPotential`, `AutomationRisk`, `FutureDemand`, `StressLevel` |
| `ReferralNetwork` | Referral tracking | `ReferralID`, `ReferrerID`, `ReferredCandidateID`, `JobID`, `ReferralStrength` (1-10), `RelationshipType`, `ReferralDate`, `BonusAmount`, `HireResult`, `QualityScore` (1-10) |
| `NetworkStrength` | Connection strength | `NetworkID`, `CandidateID`, `ConnectionID`, `ConnectionType`, `ConnectionStrength` (1-10), `LastInteraction`, `InteractionFrequency`, `TrustLevel` (1-5) |
| `ReferralPerformance` | Referrer metrics | `PerformanceID`, `ReferrerID`, `TotalReferrals`, `SuccessfulReferrals`, `ConversionRate`, `AvgQualityScore` (DECIMAL 3,2), `TotalBonusEarned`, `LastReferralDate` |
| `ChatbotInteractions` | Chatbot conversations | `InteractionID`, `CandidateID`, `SessionID`, `UserQuery`, `BotResponse`, `IntentRecognized`, `ConfidenceScore`, `EntitiesRecognized`, `WasHelpful`, `ResolutionTimeSeconds`, `Platform`, `CreatedAt` |
| `CandidateSentiment` | Sentiment tracking | `SentimentID`, `CandidateID`, `InteractionType`, `SentimentScore`, `Confidence`, `RedFlagsDetected`, `PositiveIndicators`, `CommunicationStyle`, `Keywords`, `InteractionDate`, `Notes` |
| `DiversityGoals` | DEI goals | `GoalID`, `RecruiterID`, `MetricType`, `TargetPercentage`, `CurrentPercentage`, `StartDate`, `EndDate`, `IsActive`, `CreatedAt` |
| `BiasDetectionLogs` | Bias events | `DetectionID`, `RecruiterID`, `DetectionType`, `Severity`, `Details`, `SuggestedActions`, `DetectedAt`, `ResolvedAt`, `IsResolved` |
| `OnboardingPredictions` | Onboarding predictions | `PredictionID`, `CandidateID`, `JobID`, `SuccessProbability`, `RiskLevel`, `RiskFactors`, `Recommendations`, `PredictedRetentionMonths`, `PredictedAt` |
| `BlockchainVerifications` | Credential verifications | `VerificationID`, `CandidateID`, `CredentialType`, `IssuingAuthority`, `CredentialHash`, `BlockchainTransactionID`, `BlockNumber`, `Network`, `VerifiedAt`, `IsImmutable`, `VerificationCost`, `VerificationStatus`, `LastChecked`, `Metadata` |
| `BackgroundChecks` | Background checks | `CheckID`, `CandidateID`, `CheckType`, `Vendor`, `RequestID`, `Status`, `Result`, `Findings`, `RiskLevel`, `InitiatedAt`, `CompletedAt`, `ReportURL`, `Cost`, `TurnaroundDays`, `Notes`, `ComplianceVerified` |
| `ResumeInsights` | Resume analysis | `InsightID`, `CandidateID`, `ResumeQualityScore`, `EducationInstitutions`, `Certifications`, `TechnologiesMentioned`, `YearsExperienceExtracted`, `LeadershipTermsCount`, `AchievementDensity`, `ReadabilityScore`, `KeywordsMatched`, `ExtractedSkills`, `ProcessingStatus`, `NLPProcessedAt`, `ConfidenceScore` |
| `RemoteCompatibility` | Remote work scores | `RCID`, `CandidateID`, `OverallRemoteScore`, `TimezoneAlignment`, `WorkspaceQuality`, `CommunicationPreference`, `DistractionResistance`, `SelfMotivationScore`, `OverlapHours`, `CompatibilityAssessment`, `AnalyzedAt` |
| `InterviewTranscriptions` | Interview transcripts | `TranscriptionID`, `ScheduleID`, `InterviewID`, `AudioFileURL`, `VideoFileURL`, `TranscriptionText`, `SpeakerDiarization`, `SentimentBySegment`, `ConfidenceScore`, `ProcessingStatus`, `ProcessedAt`, `CreatedAt` |
| `AI_GeneratedQuestions` | Interview questions | `QuestionID`, `JobID`, `SkillID`, `QuestionType`, `DifficultyLevel`, `QuestionText`, `ExpectedAnswerKeywords`, `ScoringRubric`, `UsedCount`, `SuccessRate`, `LastUsed`, `IsActive`, `CreatedAt` |
| `ScreeningBotDecisions` | Screening decisions | `DecisionID`, `ApplicationID`, `Decision`, `Confidence`, `CriteriaEvaluated`, `Score`, `ThresholdUsed`, `ModelVersion`, `DecisionDate`, `HumanOverride`, `OverrideReason`, `FinalDecision` |
| `CandidateRankingHistory` | Ranking audit | `HistoryID`, `CandidateID`, `JobID`, `MatchScore`, `CalculatedAt` |
| `ApplicationStatusHistory` | Status transitions | `HistoryID`, `ApplicationID`, `FromStatusID`, `ToStatusID`, `ChangedBy`, `ChangedAt`, `Notes` |
| `AI_Predictions` | AI predictions | `PredictionID`, `CandidateID`, `JobID`, `ApplicationID`, `SuccessProbability`, `KeyFactors`, `PredictionDate` |

### Application Status State Machine

```
Applied(1) → Screening(2) → Interview(3) → Hired(4)
                    ↓               ↓
                Rejected(5)    Rejected(5)
Applied(1,2,3) → Withdrawn(6)
```

---

## 2. Stored Procedures

All stored procedures in the DB can be called via `EXEC`:

| Procedure | Purpose |
|---|---|
| `sp_UpdateApplicationStatus` | Move application through state machine (validates transitions) |
| `sp_HireCandidate` | Hire candidate — atomic with UPDLOCK, decrements vacancies |
| `sp_RejectCandidate` | Reject application with reason |
| `sp_WithdrawApplication` | Candidate withdraws an application with reason |
| `sp_AdvancedCandidateMatchingEnhanced` | Match candidates to a job (skill + experience scoring) |
| `sp_AutoScreenApplicationEnhanced` | Rules-based automated screening with confidence score |
| `sp_AutoRejectUnqualified` | Batch auto-reject under-experienced applicants |
| `sp_ScheduleInterviewWithTimezone` | CLR-enhanced timezone-aware interview scheduling |
| `sp_ConfirmInterview` | Candidate confirms interview attendance |
| `sp_AwardGamificationPoints` | Award points/badges to candidate for actions |
| `sp_GenerateLearningPath` | Personalized learning path for identified skill gaps |
| `sp_GenerateInterviewPrep` | Personalized interview preparation materials |
| `sp_GenerateNegotiationStrategy` | Salary negotiation coaching and scripts |
| `sp_PredictGhostingRisk` | Anti-ghosting risk prediction for a candidate |
| `sp_PredictHireSuccess` | Predict hiring success probability (Rules-based AI) |
| `sp_FuzzySearchCandidates` | Levenshtein/JaroWinkler fuzzy name search |
| `sp_GetMaskedCandidateData` | Returns PII-masked data based on caller role |
| `sp_ArchiveOldData` | Archive jobs/applications older than threshold |
| `sp_AnonymizeArchivedCandidates` | GDPR anonymization on archived candidates |
| `sp_TimeToHireReport` | Generates report for hiring speed metrics |
| `sp_GenerateMarketAlerts` | Generates personalized market alerts for recruiter based on their job postings and location (Salary, Demand, Competitor alerts) |
| `sp_SuggestReferrals` | Suggests candidates from employee networks for job referrals |
| `sp_SaveCandidateRanking` | Saves candidate ranking to history for tracking score evolution |
| `sp_PredictCareerPath` | Predicts career trajectory with probability, salary increase, and required skills gap |
| `sp_AnalyzeCandidateSentiment` | Analyzes candidate communication sentiment using NLP |
| `sp_GetCandidateSentimentHistory` | Retrieves sentiment history for a candidate |
| `sp_GenerateInterviewQuestions` | Generates AI interview questions based on job skills and difficulty |
| `sp_OptimizeInterviewRounds` | Optimizes interview rounds by reducing redundancy |
| `sp_PredictOnboardingSuccess` | Predicts onboarding success probability for hired candidates |

---

## 3. Database Views

| View | Purpose |
|---|---|
| `vw_ApplicationFunnel` | Count per application status for funnel analysis |
| `vw_VacancyUtilization` | Filled vs total vacancies per active job |
| `vw_SilentRejections` | Applications inactive > 30 days (red flags) |
| `vw_GhostingRiskDashboard` | Candidates/Recruiters with high ghosting risk scores |
| `vw_CandidateInterviews` | Candidate's view of scheduled interviews and status |
| `vw_SkillVerificationStatus` | Claimed vs verified skills with confidence levels |
| `vw_CandidateMatchScore` | Match score breakdown per candidate per job |
| `vw_TimeToHire` | Individual candidate hiring timeline with CandidateName, JobTitle, AppliedDate, HiredDate, DaysToHire, ApplicationStatus, Source |
| `vw_AverageTimeToHire` | Global average time-to-hire metric |
| `vw_RecruiterPerformance` | Interviews conducted and hires per recruiter |
| `vw_Bias_Location` | Hiring rates filtered by candidate location |
| `vw_Bias_Experience` | Hiring rates filtered by experience groups |
| `vw_SkillGapAnalysis` | Required skills in jobs vs availability in pool |
| `vw_CandidateEngagement` | Candidate responsiveness and confirmation rates |
| `vw_HiringBottlenecks` | Average days spent in each hiring stage |
| `vw_RejectionAnalysis` | Breakdown of top rejection reasons |
| `vw_MarketIntelligenceDashboard` | Skill demand vs supply and salary trends |
| `vw_DiversityAnalyticsFunnel` | Anonymized DEI funnel by Ethnicity |
| `vw_DiversityByGender` | Diversity breakdown by Gender |
| `vw_DiversityByDisability` | Diversity breakdown by Disability status |
| `vw_DiversityByVeteran` | Diversity breakdown by Veteran status |
| `vw_SalaryTransparency` | Compensation benchmarks vs application volume |
| `vw_CareerPathInsights` | Career progression, readiness, and learning resources |
| `vw_ReferralIntelligence` | Referral quality, bonus tracking, and outcomes |
| `vw_RemoteCompatibilityMatrix` | Remote work compatibility with WorkspaceQuality, TimezoneAlignment, CommunicationPreference, DistractionResistance, SelfMotivationScore, OverlapHours, CompatibilityAssessment |

---

## 4. CLR Functions Reference

| Category | Function | SQL Usage |
|---|---|---|
| **Security** | `HashPassword(pwd, salt)` | Used in login/registration procs (PBKDF2-SHA256) |
| **Security** | `VerifyPassword(pwd, hash)` | Returns BIT — used in authentication |
| **Security** | `GenerateSecureToken()` | Returns NVARCHAR — for session/reset tokens |
| **Security** | `EncryptSensitiveData(text)` | AES-256 for PII fields at rest |
| **NLP** | `ExtractSkills(resumeText)` | Returns `'skill:score,skill:score'` string |
| **NLP** | `ExtractYearsOfExperience(text)` | Extracts INT years from resume text patterns |
| **NLP** | `CalculateSentiment(text)` | Returns FLOAT (-1 to +1) for interview feedback |
| **String** | `CosineSimilarity(a, b)` | Returns FLOAT (0–1) for semantic matching |
| **String** | `JaroWinklerSimilarity(a, b)` | Fuzzy name match (0-1 score) |
| **String** | `LevenshteinDistance(a, b)` | Edit distance for typo correction |
| **Date** | `CalculateBusinessDays(start, end)` | Returns INT (Mon–Fri only, skips weekends) |
| **Timezone** | `ConvertTimezone(dt, from, to)` | Accurate conversion with DST support |
| **Email** | `ValidateEmail(email)` | Returns BIT (RFC-5322 regex validation) |
| **Doc** | `ExtractTextFromPDF(bytes)` | Returns text extracted from PDF binary |
| **Stats** | `CorrelationCoefficient(v1, v2)` | Pearson correlation for metrics relationship |

---

## 5. Schema Quick Reference & Constraints

### Known Pitfalls

| Table | ❌ Common Assumption | ✅ Actual Column | Fix |
|-------|---------------------|------------------|-----|
| `PushNotifications` | `CandidateID` | `UserID` | Use `UserID` from `req.user.UserID` |
| `PushNotifications` | `Message` | `Body` | Alias: `Body AS Message` |
| `PushNotifications` | `IsRead` | `ReadAt` | `CASE WHEN ReadAt IS NOT NULL THEN 1 ELSE 0 END` |
| `PushNotifications` | `CreatedAt` | `SentAt` | Alias: `SentAt AS CreatedAt` |
| `MarketIntelligence` | `TrendDirection` | `SalaryTrend` | Alias: `SalaryTrend AS TrendDirection` |
| `JobSkills` | `DemandLevel` | `MinProficiency` | Alias: `MinProficiency AS DemandLevel` |
| `Applications` | `UserID` | `CandidateID` | Must JOIN to `Candidates` |
| `InterviewFeedback` | `InterviewerID` = `RecruiterID` | `InterviewerID` = `UserID` | FK references `Users(UserID)`, not `Recruiters(RecruiterID)` |

### Key Column Summary

| Table | Primary Key | Foreign Keys |
|-------|------------|---------------|
| `Users` | `UserID` | `RoleID → Roles` |
| `Candidates` | `CandidateID` | `UserID → Users` |
| `Recruiters` | `RecruiterID` | `UserID → Users` |
| `JobPostings` | `JobID` | `CreatedBy → Users` |
| `Applications` | `ApplicationID` | `JobID`, `CandidateID`, `StatusID` |
| `PushNotifications` | `NotificationID` | `UserID → Users` |
| `InterviewSchedules` | `ScheduleID` | `ApplicationID` |
| `Candidates` | `CandidateID` | `UserID → Users` |
| `Recruiters` | `RecruiterID` | `UserID → Users` |
| `JobPostings` | `JobID` | `CreatedBy → Users` |
| `Applications` | `ApplicationID` | `JobID`, `CandidateID`, `StatusID` |
| `PushNotifications` | `NotificationID` | `UserID → Users` |
| `InterviewSchedules` | `ScheduleID` | `ApplicationID` |
