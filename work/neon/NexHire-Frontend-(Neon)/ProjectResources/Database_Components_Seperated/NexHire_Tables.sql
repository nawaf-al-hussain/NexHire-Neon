-- RECRUITMENT DATABASE - COMPLETE TABLES CREATION SCRIPT
-- ============================================================

-- 1. Roles Table
CREATE TABLE Roles (
    RoleID INT IDENTITY(1,1) PRIMARY KEY,
    RoleName VARCHAR(50) UNIQUE NOT NULL
);

-- 2. Application Status Table
CREATE TABLE ApplicationStatus (
    StatusID INT IDENTITY(1,1) PRIMARY KEY,
    StatusName VARCHAR(30) UNIQUE NOT NULL
);

-- 3. Status Transitions Table (State Machine)
CREATE TABLE ApplicationStatusTransitions (
    FromStatusID INT,
    ToStatusID INT,
    PRIMARY KEY (FromStatusID, ToStatusID),
    FOREIGN KEY (FromStatusID) REFERENCES ApplicationStatus(StatusID),
    FOREIGN KEY (ToStatusID) REFERENCES ApplicationStatus(StatusID)
);

-- 4. Users Table
CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    Username VARCHAR(50) UNIQUE NOT NULL,
    Email NVARCHAR(200) UNIQUE NOT NULL,
    PasswordHash NVARCHAR(500) NOT NULL,
    SessionToken NVARCHAR(300) NULL,
    LastLogin DATETIME NULL,
    RoleID INT NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    IsActive BIT DEFAULT 1,
    FOREIGN KEY (RoleID) REFERENCES Roles(RoleID),
    CONSTRAINT CHK_Email_Format CHECK (Email LIKE '%_@_%._%')
);

-- 5. Candidates Table
CREATE TABLE Candidates (
    CandidateID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT UNIQUE NOT NULL,
    FullName VARCHAR(100) NOT NULL,
    Location VARCHAR(100),
    YearsOfExperience INT CHECK (YearsOfExperience >= 0) DEFAULT 0,
    PreferredLocations NVARCHAR(500) NULL,
    ResumeFile VARBINARY(MAX) NULL,
    ResumeFileName NVARCHAR(255) NULL,
    ResumeText NVARCHAR(MAX) NULL,
    ExtractedSkills NVARCHAR(MAX) NULL,
    LinkedInURL NVARCHAR(500) NULL,
    Timezone NVARCHAR(100) NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    CONSTRAINT CHK_FullName_NotEmpty CHECK (LEN(TRIM(FullName)) > 0)
);

-- 6. Recruiters Table
CREATE TABLE Recruiters (
    RecruiterID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT UNIQUE NOT NULL,
    Department VARCHAR(100),
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);

-- 7. Candidate Documents Table
CREATE TABLE CandidateDocuments (
    DocumentID INT IDENTITY(1,1) PRIMARY KEY,
    CandidateID INT NOT NULL,
    DocumentType VARCHAR(50) CHECK (DocumentType IN ('Resume', 'CoverLetter', 'Certificate')),
    FilePath NVARCHAR(500),
    UploadedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (CandidateID) REFERENCES Candidates(CandidateID) ON DELETE CASCADE
);

-- 8. Skills Table
CREATE TABLE Skills (
    SkillID INT IDENTITY(1,1) PRIMARY KEY,
    SkillName VARCHAR(100) UNIQUE NOT NULL
);

-- 9. Candidate Skills (with proficiency)
CREATE TABLE CandidateSkills (
    CandidateID INT,
    SkillID INT,
    ProficiencyLevel INT CHECK (ProficiencyLevel BETWEEN 1 AND 10),
    PRIMARY KEY (CandidateID, SkillID),
    FOREIGN KEY (CandidateID) REFERENCES Candidates(CandidateID) ON DELETE CASCADE,
    FOREIGN KEY (SkillID) REFERENCES Skills(SkillID)
);

-- 10. Job Postings Table
CREATE TABLE JobPostings (
    JobID INT IDENTITY(1,1) PRIMARY KEY,
    JobTitle VARCHAR(150) NOT NULL,
    Description NVARCHAR(MAX),
    Location VARCHAR(100),
    MinExperience INT CHECK (MinExperience >= 0) DEFAULT 0,
    Vacancies INT CHECK (Vacancies >= 0),
    CreatedAt DATETIME DEFAULT GETDATE(),
    IsActive BIT DEFAULT 1,
    IsDeleted BIT DEFAULT 0,
    CreatedBy INT,
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID)
);

-- 11. Job Skills Requirements
CREATE TABLE JobSkills (
    JobID INT,
    SkillID INT,
    IsMandatory BIT DEFAULT 0,
    MinProficiency INT CHECK (MinProficiency BETWEEN 1 AND 10),
    PRIMARY KEY (JobID, SkillID),
    FOREIGN KEY (JobID) REFERENCES JobPostings(JobID) ON DELETE CASCADE,
    FOREIGN KEY (SkillID) REFERENCES Skills(SkillID)
);

-- 12. Applications Table
CREATE TABLE Applications (
    ApplicationID INT IDENTITY(1,1) PRIMARY KEY,
    CandidateID INT NOT NULL,
    JobID INT NOT NULL,
    StatusID INT NOT NULL,
    AppliedDate DATETIME DEFAULT GETDATE(),
    StatusChangedAt DATETIME DEFAULT GETDATE(),
    WithdrawnAt DATETIME NULL,
    WithdrawalReason NVARCHAR(500) NULL,
    RejectionReason NVARCHAR(200) NULL,
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (CandidateID) REFERENCES Candidates(CandidateID) ON DELETE CASCADE,
    FOREIGN KEY (JobID) REFERENCES JobPostings(JobID),
    FOREIGN KEY (StatusID) REFERENCES ApplicationStatus(StatusID),
    CONSTRAINT UQ_Application UNIQUE (CandidateID, JobID)
);

-- 13. Application Status History Table
CREATE TABLE ApplicationStatusHistory (
    HistoryID INT IDENTITY(1,1) PRIMARY KEY,
    ApplicationID INT NOT NULL,
    FromStatusID INT,
    ToStatusID INT NOT NULL,
    ChangedBy INT NOT NULL,
    ChangedAt DATETIME DEFAULT GETDATE(),
    Notes NVARCHAR(500),
    FOREIGN KEY (ApplicationID) REFERENCES Applications(ApplicationID) ON DELETE CASCADE,
    FOREIGN KEY (FromStatusID) REFERENCES ApplicationStatus(StatusID),
    FOREIGN KEY (ToStatusID) REFERENCES ApplicationStatus(StatusID),
    FOREIGN KEY (ChangedBy) REFERENCES Users(UserID)
);

-- 14. Interview Schedules Table
CREATE TABLE InterviewSchedules (
    ScheduleID INT IDENTITY(1,1) PRIMARY KEY,
    ApplicationID INT NOT NULL,
    RecruiterID INT NOT NULL,
    InterviewStart DATETIME NOT NULL,
    InterviewEnd DATETIME NOT NULL,
    CandidateConfirmed BIT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (ApplicationID) REFERENCES Applications(ApplicationID) ON DELETE CASCADE,
    FOREIGN KEY (RecruiterID) REFERENCES Recruiters(RecruiterID)
);

-- 15. Interview Feedback Table
CREATE TABLE InterviewFeedback (
    FeedbackID INT IDENTITY(1,1) PRIMARY KEY,
    ApplicationID INT NOT NULL,
    InterviewerID INT NOT NULL,
    TechnicalScore INT CHECK (TechnicalScore BETWEEN 0 AND 10),
    CommunicationScore INT CHECK (CommunicationScore BETWEEN 0 AND 10),
    CultureFitScore INT CHECK (CultureFitScore BETWEEN 0 AND 10),
    Recommendation VARCHAR(20) CHECK (Recommendation IN ('Hire', 'Hold', 'Reject')),
    Comments NVARCHAR(500),
    SentimentScore FLOAT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (ApplicationID) REFERENCES Applications(ApplicationID) ON DELETE CASCADE,
    FOREIGN KEY (InterviewerID) REFERENCES Users(UserID)
);

-- 16. Audit Log Table
CREATE TABLE AuditLog (
    AuditID INT IDENTITY(1,1) PRIMARY KEY,
    TableName VARCHAR(100),
    RecordID INT,
    Operation VARCHAR(20),
    OldValue NVARCHAR(MAX),
    NewValue NVARCHAR(MAX),
    ChangedBy INT NULL,
    ChangedAt DATETIME DEFAULT GETDATE()
);

-- 17. Email Queue Table
CREATE TABLE EmailQueue (
    EmailID INT IDENTITY(1,1) PRIMARY KEY,
    CandidateID INT NOT NULL,
    EmailType NVARCHAR(50) CHECK (EmailType IN ('InterviewInvite', 'StatusUpdate', 'Rejection', 'Offer')),
    Subject NVARCHAR(200),
    Body NVARCHAR(MAX),
    IsSent BIT DEFAULT 0,
    SentAt DATETIME NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (CandidateID) REFERENCES Candidates(CandidateID)
);

-- 18. Job Postings Archive
CREATE TABLE JobPostingsArchive (
    JobID INT,
    JobTitle NVARCHAR(100),
    Description NVARCHAR(MAX),
    Location NVARCHAR(50),
    Vacancies INT,
    CreatedAt DATETIME,
    ArchivedAt DATETIME DEFAULT GETDATE()
);

-- 19. Applications Archive
CREATE TABLE ApplicationsArchive (
    ApplicationID INT,
    CandidateID INT,
    JobID INT,
    StatusID INT,
    AppliedDate DATETIME,
    ArchivedAt DATETIME DEFAULT GETDATE()
);

-- 20. Candidate Ranking History
CREATE TABLE CandidateRankingHistory (
    HistoryID INT IDENTITY(1,1) PRIMARY KEY,
    CandidateID INT,
    JobID INT,
    MatchScore DECIMAL(5,2),
    CalculatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (CandidateID) REFERENCES Candidates(CandidateID),
    FOREIGN KEY (JobID) REFERENCES JobPostings(JobID)
);

-- 21. GhostingPatterns (Anti-Ghosting Prediction System)
CREATE TABLE GhostingPatterns (
    PatternID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    UserType VARCHAR(20) CHECK (UserType IN ('Candidate', 'Recruiter')),
    Action VARCHAR(50) CHECK (Action IN ('NoResponse', 'NoShowInterview', 'LateResponse', 'GhostedAfterInterview', 'GhostedAfterOffer')),
    Frequency INT DEFAULT 1,
    LastIncident DATETIME DEFAULT GETDATE(),
    GhostingScore DECIMAL(3,2) CHECK (GhostingScore BETWEEN 0 AND 10) DEFAULT 0,
    IsActive BIT DEFAULT 1,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);

-- 22. CommunicationLogs
CREATE TABLE CommunicationLogs (
    LogID INT IDENTITY(1,1) PRIMARY KEY,
    ApplicationID INT NOT NULL,
    SenderID INT NOT NULL,
    ReceiverID INT NOT NULL,
    MessageType VARCHAR(50) CHECK (MessageType IN ('Email', 'InApp', 'SMS', 'Reminder')),
    SentAt DATETIME DEFAULT GETDATE(),
    ReadAt DATETIME NULL,
    RespondedAt DATETIME NULL,
    IsGhostingRisk BIT DEFAULT 0,
    FOREIGN KEY (ApplicationID) REFERENCES Applications(ApplicationID),
    FOREIGN KEY (SenderID) REFERENCES Users(UserID),
    FOREIGN KEY (ReceiverID) REFERENCES Users(UserID)
);

-- 23. MicroAssessments (Skill Verification)
CREATE TABLE MicroAssessments (
    AssessmentID INT IDENTITY(1,1) PRIMARY KEY,
    SkillID INT NOT NULL,
    AssessmentType VARCHAR(30) CHECK (AssessmentType IN ('5minQuiz', 'CodeChallenge', 'Scenario', 'PeerReview')),
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX),
    TimeLimit INT,
    PassingScore INT CHECK (PassingScore BETWEEN 0 AND 100),
    QuestionsCount INT DEFAULT 5,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (SkillID) REFERENCES Skills(SkillID)
);

-- 24. SkillVerifications
CREATE TABLE SkillVerifications (
    VerificationID INT IDENTITY(1,1) PRIMARY KEY,
    CandidateID INT NOT NULL,
    SkillID INT NOT NULL,
    AssessmentID INT NULL,
    VerificationMethod VARCHAR(50) CHECK (VerificationMethod IN ('CodeTest', 'PeerReview', 'Certification', 'Portfolio', 'WorkSample')),
    VerificationScore INT CHECK (VerificationScore BETWEEN 0 AND 100),
    VerifiedBy INT NULL,
    VerifiedAt DATETIME DEFAULT GETDATE(),
    ExpiryDate DATETIME,
    ProofURL NVARCHAR(500),
    IsVerified BIT DEFAULT 0,
    ConfidenceLevel INT CHECK (ConfidenceLevel BETWEEN 1 AND 5) DEFAULT 3,
    FOREIGN KEY (CandidateID) REFERENCES Candidates(CandidateID) ON DELETE CASCADE,
    FOREIGN KEY (SkillID) REFERENCES Skills(SkillID),
    FOREIGN KEY (AssessmentID) REFERENCES MicroAssessments(AssessmentID),
    FOREIGN KEY (VerifiedBy) REFERENCES Users(UserID)
);

-- 25. AssessmentAttempts
CREATE TABLE AssessmentAttempts (
    AttemptID INT IDENTITY(1,1) PRIMARY KEY,
    CandidateID INT NOT NULL,
    AssessmentID INT NOT NULL,
    StartedAt DATETIME DEFAULT GETDATE(),
    CompletedAt DATETIME NULL,
    Score INT,
    TimeSpentSeconds INT,
    IsPassed BIT DEFAULT 0,
    Details NVARCHAR(MAX),
    FOREIGN KEY (CandidateID) REFERENCES Candidates(CandidateID),
    FOREIGN KEY (AssessmentID) REFERENCES MicroAssessments(AssessmentID)
);

-- 26. SalaryBenchmarks
CREATE TABLE SalaryBenchmarks (
    BenchmarkID INT IDENTITY(1,1) PRIMARY KEY,
    JobTitle VARCHAR(150) NOT NULL,
    Location VARCHAR(100) NOT NULL,
    ExperienceRange VARCHAR(50) CHECK (ExperienceRange IN ('Entry', 'Junior', 'Mid', 'Senior', 'Lead', 'Executive')),
    SkillID INT NULL,
    Currency VARCHAR(3) DEFAULT 'USD',
    AvgSalary DECIMAL(10,2) NOT NULL,
    Percentile25 DECIMAL(10,2),
    Percentile50 DECIMAL(10,2),
    Percentile75 DECIMAL(10,2),
    SampleSize INT DEFAULT 0,
    ConfidenceRating INT CHECK (ConfidenceRating BETWEEN 1 AND 5) DEFAULT 3,
    LastUpdated DATETIME DEFAULT GETDATE(),
    Source VARCHAR(100),
    IsActive BIT DEFAULT 1,
    FOREIGN KEY (SkillID) REFERENCES Skills(SkillID)
);

-- 27. JobSalaryRanges
CREATE TABLE JobSalaryRanges (
    RangeID INT IDENTITY(1,1) PRIMARY KEY,
    JobID INT NOT NULL,
    MinSalary DECIMAL(10,2),
    MaxSalary DECIMAL(10,2),
    Currency VARCHAR(3) DEFAULT 'USD',
    BonusPotential DECIMAL(5,2),
    Equity BIT DEFAULT 0,
    BenefitsSummary NVARCHAR(500),
    IsTransparent BIT DEFAULT 0,
    LastUpdated DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (JobID) REFERENCES JobPostings(JobID) ON DELETE CASCADE
);

-- 28. NegotiationHistory
CREATE TABLE NegotiationHistory (
    NegotiationID INT IDENTITY(1,1) PRIMARY KEY,
    CandidateID INT NOT NULL,
    JobID INT NOT NULL,
    InitialOffer DECIMAL(10,2),
    CounterOffer DECIMAL(10,2),
    FinalOffer DECIMAL(10,2),
    NegotiationRounds INT DEFAULT 1,
    NegotiationTacticsUsed NVARCHAR(MAX),
    SuccessScore INT CHECK (SuccessScore BETWEEN 1 AND 10),
    LearnedLessons NVARCHAR(500),
    DurationDays INT,
    StartedAt DATETIME DEFAULT GETDATE(),
    EndedAt DATETIME,
    FOREIGN KEY (CandidateID) REFERENCES Candidates(CandidateID),
    FOREIGN KEY (JobID) REFERENCES JobPostings(JobID)
);

-- 29. NegotiationTemplates
CREATE TABLE NegotiationTemplates (
    TemplateID INT IDENTITY(1,1) PRIMARY KEY,
    Scenario VARCHAR(100) NOT NULL,
    TemplateType VARCHAR(50) CHECK (TemplateType IN ('Email', 'Script', 'CounterOffer')),
    Title NVARCHAR(200) NOT NULL,
    Content NVARCHAR(MAX) NOT NULL,
    Tips NVARCHAR(500),
    SuccessRate DECIMAL(5,2),
    UseCount INT DEFAULT 0,
    IsActive BIT DEFAULT 1
);

-- 30. InterviewSharedInsights
CREATE TABLE InterviewSharedInsights (
    InsightID INT IDENTITY(1,1) PRIMARY KEY,
    JobID INT NOT NULL,
    QuestionHash VARCHAR(64) NOT NULL,
    QuestionText NVARCHAR(500),
    QuestionCategory VARCHAR(50) CHECK (QuestionCategory IN ('Technical', 'Behavioral', 'Cultural', 'CaseStudy')),
    TimesAsked INT DEFAULT 1,
    DifficultyRating DECIMAL(3,2) CHECK (DifficultyRating BETWEEN 1 AND 5),
    AvgCandidateScore DECIMAL(3,2),
    OptimalAnswerKeywords NVARCHAR(MAX),
    LastAsked DATETIME DEFAULT GETDATE(),
    IsRedundant BIT DEFAULT 0,
    FOREIGN KEY (JobID) REFERENCES JobPostings(JobID)
);

-- 31. CandidateInterviewHistory
CREATE TABLE CandidateInterviewHistory (
    HistoryID INT IDENTITY(1,1) PRIMARY KEY,
    CandidateID INT NOT NULL,
    CompanyName VARCHAR(100),
    InterviewDate DATETIME,
    InterviewRound INT,
    QuestionsAsked NVARCHAR(MAX),
    PerformanceScore INT CHECK (PerformanceScore BETWEEN 1 AND 10),
    FeedbackReceived NVARCHAR(MAX),
    InterviewDurationMinutes INT,
    InterviewerCount INT,
    WasTechnical BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (CandidateID) REFERENCES Candidates(CandidateID)
);

-- 32. InterviewOptimizationRules
CREATE TABLE InterviewOptimizationRules (
    RuleID INT IDENTITY(1,1) PRIMARY KEY,
    RuleName VARCHAR(100) NOT NULL,
    Description NVARCHAR(500),
    ConditionSQL NVARCHAR(MAX),
    ActionSQL NVARCHAR(MAX),
    Priority INT DEFAULT 5,
    IsActive BIT DEFAULT 1
);

-- 33. RemoteCompatibility
CREATE TABLE RemoteCompatibility (
    CompatibilityID INT IDENTITY(1,1) PRIMARY KEY,
    CandidateID INT NOT NULL,
    SelfAssessmentScore INT CHECK (SelfAssessmentScore BETWEEN 1 AND 10),
    WorkspaceQuality INT CHECK (WorkspaceQuality BETWEEN 1 AND 5),
    TimezoneAlignment INT CHECK (TimezoneAlignment BETWEEN 1 AND 10),
    CommunicationPreference VARCHAR(50) CHECK (CommunicationPreference IN ('Async', 'Sync', 'Mixed')),
    DistractionResistance INT CHECK (DistractionResistance BETWEEN 1 AND 10),
    SelfMotivationScore INT CHECK (SelfMotivationScore BETWEEN 1 AND 10),
    PreviousRemoteExperienceMonths INT DEFAULT 0,
    TechSetupScore INT CHECK (TechSetupScore BETWEEN 1 AND 5),
    OverallRemoteScore DECIMAL(3,2),
    AssessmentDate DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (CandidateID) REFERENCES Candidates(CandidateID) ON DELETE CASCADE,
    CONSTRAINT UQ_RemoteCompatibility_Candidate UNIQUE (CandidateID)
);

-- 34. CompanyRemotePolicy
CREATE TABLE CompanyRemotePolicy (
    PolicyID INT IDENTITY(1,1) PRIMARY KEY,
    RecruiterID INT NOT NULL,
    AsyncWorkPercentage INT CHECK (AsyncWorkPercentage BETWEEN 0 AND 100),
    CoreHours VARCHAR(50),
    MeetingCulture VARCHAR(50) CHECK (MeetingCulture IN ('MeetingLight', 'Collaborative', 'Heavy')),
    TechProvided BIT DEFAULT 0,
    RemoteOnboardingScore INT CHECK (RemoteOnboardingScore BETWEEN 1 AND 10),
    HomeOfficeStipend DECIMAL(10,2),
    TimezoneFlexibility VARCHAR(50),
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (RecruiterID) REFERENCES Recruiters(RecruiterID)
);

-- 35. TimezoneOverlapAnalysis
CREATE TABLE TimezoneOverlapAnalysis (
    AnalysisID INT IDENTITY(1,1) PRIMARY KEY,
    CandidateID INT NOT NULL,
    JobID INT NOT NULL,
    CandidateTimezone VARCHAR(50),
    CompanyTimezone VARCHAR(50),
    OverlapHours DECIMAL(4,2),
    OptimalOverlapHours DECIMAL(4,2),
    OverlapScore INT CHECK (OverlapScore BETWEEN 0 AND 100),
    AnalysisDate DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (CandidateID) REFERENCES Candidates(CandidateID),
    FOREIGN KEY (JobID) REFERENCES JobPostings(JobID)
);

-- 36. DiversityMetrics
CREATE TABLE DiversityMetrics (
    MetricID INT IDENTITY(1,1) PRIMARY KEY,
    ApplicationID INT NOT NULL,
    Gender VARCHAR(50) NULL,
    Ethnicity VARCHAR(100) NULL,
    DisabilityStatus BIT NULL,
    VeteranStatus BIT NULL,
    FirstGenerationCollege BIT NULL,
    LGBTQPlus BIT NULL,
    CareerGapMonths INT DEFAULT 0,
    NonTraditionalBackground BIT NULL,
    EducationLevel VARCHAR(50) NULL,
    AnonymizedHash VARCHAR(64) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    LastUpdated DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (ApplicationID) REFERENCES Applications(ApplicationID) ON DELETE CASCADE
);

-- 37. DiversityGoals
CREATE TABLE DiversityGoals (
    GoalID INT IDENTITY(1,1) PRIMARY KEY,
    RecruiterID INT NOT NULL,
    MetricType VARCHAR(50) CHECK (MetricType IN ('Gender', 'Ethnicity', 'Disability', 'Veteran')),
    TargetPercentage DECIMAL(5,2),
    CurrentPercentage DECIMAL(5,2),
    StartDate DATE,
    EndDate DATE,
    IsActive BIT DEFAULT 1,
    FOREIGN KEY (RecruiterID) REFERENCES Recruiters(RecruiterID)
);

-- 38. BiasDetectionLogs
CREATE TABLE BiasDetectionLogs (
    DetectionID INT IDENTITY(1,1) PRIMARY KEY,
    RecruiterID INT NOT NULL,
    DetectionType VARCHAR(50) CHECK (DetectionType IN ('FeedbackBias', 'ScreeningBias', 'InterviewBias')),
    Severity INT CHECK (Severity BETWEEN 1 AND 5),
    Details NVARCHAR(MAX),
    SuggestedActions NVARCHAR(500),
    DetectedAt DATETIME DEFAULT GETDATE(),
    ResolvedAt DATETIME NULL,
    IsResolved BIT DEFAULT 0,
    FOREIGN KEY (RecruiterID) REFERENCES Recruiters(RecruiterID)
);

-- 39. CareerPaths
CREATE TABLE CareerPaths (
    PathID INT IDENTITY(1,1) PRIMARY KEY,
    FromRole VARCHAR(150) NOT NULL,
    ToRole VARCHAR(150) NOT NULL,
    AvgTransitionMonths INT,
    Probability DECIMAL(3,2) CHECK (Probability BETWEEN 0 AND 1),
    RequiredSkillsGap NVARCHAR(MAX),
    SalaryIncreaseAvg DECIMAL(5,2),
    DemandTrend VARCHAR(20) CHECK (DemandTrend IN ('Growing', 'Stable', 'Declining')),
    FutureProofScore INT CHECK (FutureProofScore BETWEEN 1 AND 10),
    SampleSize INT,
    LastAnalyzed DATETIME DEFAULT GETDATE()
);

-- 40. RoleArchetypes
CREATE TABLE RoleArchetypes (
    ArchetypeID INT IDENTITY(1,1) PRIMARY KEY,
    RoleTitle VARCHAR(150) NOT NULL,
    Archetype VARCHAR(50) CHECK (Archetype IN ('IndividualContributor', 'Manager', 'Specialist', 'Generalist', 'Leader')),
    GrowthPotential INT CHECK (GrowthPotential BETWEEN 1 AND 5),
    AutomationRisk INT CHECK (AutomationRisk BETWEEN 1 AND 5),
    FutureDemand INT CHECK (FutureDemand BETWEEN 1 AND 5),
    StressLevel INT CHECK (StressLevel BETWEEN 1 AND 5),
    LearningOpportunity INT CHECK (LearningOpportunity BETWEEN 1 AND 5)
);

-- 41. CandidateCareerGoals
CREATE TABLE CandidateCareerGoals (
    GoalID INT IDENTITY(1,1) PRIMARY KEY,
    CandidateID INT NOT NULL,
    TargetRole VARCHAR(150) NOT NULL,
    TargetTimelineMonths INT,
    CurrentReadinessScore INT CHECK (CurrentReadinessScore BETWEEN 0 AND 100),
    SkillsToDevelop NVARCHAR(MAX),
    ProgressPercentage DECIMAL(5,2) DEFAULT 0,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (CandidateID) REFERENCES Candidates(CandidateID) ON DELETE CASCADE
);

-- 42. LearningResources
CREATE TABLE LearningResources (
    ResourceID INT IDENTITY(1,1) PRIMARY KEY,
    SkillID INT NOT NULL,
    ResourceType VARCHAR(50) CHECK (ResourceType IN ('Course', 'Book', 'Tutorial', 'Certification', 'Project')),
    Title NVARCHAR(200) NOT NULL,
    URL NVARCHAR(500),
    EstimatedHours INT,
    Difficulty VARCHAR(20) CHECK (Difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
    Cost DECIMAL(10,2) DEFAULT 0,
    Rating DECIMAL(3,2),
    IsActive BIT DEFAULT 1,
    FOREIGN KEY (SkillID) REFERENCES Skills(SkillID)
);

-- 43. OnboardingSuccessFactors
CREATE TABLE OnboardingSuccessFactors (
    FactorID INT IDENTITY(1,1) PRIMARY KEY,
    HiredCandidateID INT NOT NULL,
    PreStartEngagementScore INT CHECK (PreStartEngagementScore BETWEEN 1 AND 10),
    FirstWeekScore INT CHECK (FirstWeekScore BETWEEN 1 AND 10),
    MentorAssigned BIT DEFAULT 0,
    FirstProjectClarity INT CHECK (FirstProjectClarity BETWEEN 1 AND 5),
    SocialIntegrationScore INT CHECK (SocialIntegrationScore BETWEEN 1 AND 10),
    Day30Retention BIT,
    Day90ProductivityScore INT CHECK (Day90ProductivityScore BETWEEN 1 AND 10),
    Day180Retention BIT,
    OnboardingDurationDays INT,
    SuccessCategory VARCHAR(50) CHECK (SuccessCategory IN ('High', 'Medium', 'Low')),
    Notes NVARCHAR(MAX),
    FOREIGN KEY (HiredCandidateID) REFERENCES Candidates(CandidateID)
);

-- 44. OnboardingChecklists
CREATE TABLE OnboardingChecklists (
    ChecklistID INT IDENTITY(1,1) PRIMARY KEY,
    JobID INT NOT NULL,
    Phase VARCHAR(50) CHECK (Phase IN ('PreStart', 'Week1', 'Month1', 'Month3', 'Month6')),
    TaskDescription NVARCHAR(500) NOT NULL,
    ResponsibleRole VARCHAR(50) CHECK (ResponsibleRole IN ('Recruiter', 'Manager', 'HR', 'Mentor', 'Candidate')),
    DueDaysOffset INT,
    IsCritical BIT DEFAULT 0,
    CompletionRate DECIMAL(5,2),
    AvgCompletionDays INT,
    FOREIGN KEY (JobID) REFERENCES JobPostings(JobID)
);

-- 45. OnboardingPredictions
CREATE TABLE OnboardingPredictions (
    PredictionID INT IDENTITY(1,1) PRIMARY KEY,
    CandidateID INT NOT NULL,
    JobID INT NOT NULL,
    SuccessProbability DECIMAL(5,2) CHECK (SuccessProbability BETWEEN 0 AND 1),
    RiskFactors NVARCHAR(MAX),
    Recommendations NVARCHAR(MAX),
    PredictedRetentionMonths INT,
    ConfidenceLevel INT CHECK (ConfidenceLevel BETWEEN 1 AND 5),
    PredictionDate DATETIME DEFAULT GETDATE(),
    ActualOutcome VARCHAR(50) NULL,
    FOREIGN KEY (CandidateID) REFERENCES Candidates(CandidateID),
    FOREIGN KEY (JobID) REFERENCES JobPostings(JobID)
);

-- 46. ReferralNetwork
CREATE TABLE ReferralNetwork (
    ReferralID INT IDENTITY(1,1) PRIMARY KEY,
    ReferrerID INT NOT NULL,
    ReferredCandidateID INT NOT NULL,
    JobID INT NOT NULL,
    ReferralStrength INT CHECK (ReferralStrength BETWEEN 1 AND 10),
    RelationshipType VARCHAR(50) CHECK (RelationshipType IN ('FormerColleague', 'Classmate', 'Friend', 'Family', 'Mentor', 'Other')),
    ReferralDate DATETIME DEFAULT GETDATE(),
    BonusAmount DECIMAL(10,2),
    BonusPaid BIT DEFAULT 0,
    PaidDate DATETIME NULL,
    HireResult BIT NULL,
    QualityScore INT CHECK (QualityScore BETWEEN 1 AND 10) NULL,
    FOREIGN KEY (ReferrerID) REFERENCES Candidates(CandidateID),
    FOREIGN KEY (ReferredCandidateID) REFERENCES Candidates(CandidateID),
    FOREIGN KEY (JobID) REFERENCES JobPostings(JobID)
);

-- 47. NetworkStrength
CREATE TABLE NetworkStrength (
    StrengthID INT IDENTITY(1,1) PRIMARY KEY,
    CandidateID INT NOT NULL,
    ConnectionID INT NOT NULL,
    ConnectionType VARCHAR(50) CHECK (ConnectionType IN ('Colleague', 'Classmate', 'Industry', 'Friend')),
    ConnectionStrength INT CHECK (ConnectionStrength BETWEEN 1 AND 10),
    LastInteraction DATETIME,
    InteractionFrequency VARCHAR(20) CHECK (InteractionFrequency IN ('Daily', 'Weekly', 'Monthly', 'Yearly', 'Rare')),
    SharedSkillsCount INT DEFAULT 0,
    MutualConnectionsCount INT DEFAULT 0,
    TrustLevel INT CHECK (TrustLevel BETWEEN 1 AND 5),
    FOREIGN KEY (CandidateID) REFERENCES Candidates(CandidateID),
    FOREIGN KEY (ConnectionID) REFERENCES Candidates(CandidateID),
    CONSTRAINT CHK_NetworkStrength_SelfRefer CHECK (CandidateID <> ConnectionID)
);

-- 48. ReferralPerformance
CREATE TABLE ReferralPerformance (
    PerformanceID INT IDENTITY(1,1) PRIMARY KEY,
    ReferrerID INT NOT NULL,
    TotalReferrals INT DEFAULT 0,
    SuccessfulReferrals INT DEFAULT 0,
    ConversionRate DECIMAL(5,2),
    TotalBonusEarned DECIMAL(10,2),
    AvgQualityScore DECIMAL(3,2),
    LastReferralDate DATETIME,
    TopReferralSkill VARCHAR(100),
    FOREIGN KEY (ReferrerID) REFERENCES Candidates(CandidateID)
);

-- 49. MarketIntelligence
CREATE TABLE MarketIntelligence (
    IntelID INT IDENTITY(1,1) PRIMARY KEY,
    SkillID INT NOT NULL,
    Location VARCHAR(100) NOT NULL,
    DemandScore INT CHECK (DemandScore BETWEEN 1 AND 100),
    SupplyScore INT CHECK (SupplyScore BETWEEN 1 AND 100),
    SalaryTrend VARCHAR(20) CHECK (SalaryTrend IN ('Rising', 'Stable', 'Falling')),
    AvgSalary DECIMAL(10,2),
    CompetitorHiringActivity INT CHECK (CompetitorHiringActivity BETWEEN 1 AND 5),
    JobPostingsCount INT DEFAULT 0,
    CandidateApplicationsCount INT DEFAULT 0,
    TimeToFillDays INT,
    LastUpdated DATETIME DEFAULT GETDATE(),
    Source VARCHAR(100),
    Confidence INT CHECK (Confidence BETWEEN 1 AND 5),
    FOREIGN KEY (SkillID) REFERENCES Skills(SkillID)
);

-- 50. CompetitorAnalysis
CREATE TABLE CompetitorAnalysis (
    AnalysisID INT IDENTITY(1,1) PRIMARY KEY,
    CompetitorName VARCHAR(100) NOT NULL,
    JobTitle VARCHAR(150) NOT NULL,
    Location VARCHAR(100),
    ListedSalary DECIMAL(10,2),
    SalaryCurrency VARCHAR(3) DEFAULT 'USD',
    Benefits NVARCHAR(MAX),
    TimeToHireDays INT,
    HiringVolume INT,
    ApplicationRequirements NVARCHAR(MAX),
    TechnologyStack NVARCHAR(500),
    AnalysisDate DATETIME DEFAULT GETDATE(),
    SourceURL NVARCHAR(500)
);

-- 51. MarketAlerts
CREATE TABLE MarketAlerts (
    AlertID INT IDENTITY(1,1) PRIMARY KEY,
    AlertType VARCHAR(50) CHECK (AlertType IN ('Salary', 'Demand', 'Competitor', 'Supply')),
    SkillID INT NULL,
    Location VARCHAR(100) NULL,
    Severity INT CHECK (Severity BETWEEN 1 AND 5),
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX),
    ImpactAnalysis NVARCHAR(500),
    RecommendedAction NVARCHAR(500),
    TriggeredAt DATETIME DEFAULT GETDATE(),
    ExpiresAt DATETIME,
    IsActive BIT DEFAULT 1,
    FOREIGN KEY (SkillID) REFERENCES Skills(SkillID)
);

-- 52. AI_Predictions
CREATE TABLE AI_Predictions (
    PredictionID INT IDENTITY(1,1) PRIMARY KEY,
    CandidateID INT NOT NULL,
    JobID INT NOT NULL,
    ApplicationID INT NULL,
    SuccessProbability DECIMAL(5,2) CHECK (SuccessProbability BETWEEN 0 AND 1),
    KeyFactors NVARCHAR(MAX),
    ModelVersion VARCHAR(50) DEFAULT 'RulesBasedV1',
    PredictionDate DATETIME DEFAULT GETDATE(),
    ActualOutcome BIT NULL,
    Accuracy DECIMAL(5,2) NULL,
    FOREIGN KEY (CandidateID) REFERENCES Candidates(CandidateID) ON DELETE CASCADE,
    FOREIGN KEY (JobID) REFERENCES JobPostings(JobID),
    FOREIGN KEY (ApplicationID) REFERENCES Applications(ApplicationID)
);

-- 53. ResumeInsights
CREATE TABLE ResumeInsights (
    InsightID INT IDENTITY(1,1) PRIMARY KEY,
    CandidateID INT NOT NULL,
    DocumentID INT NULL,
    EducationInstitutions NVARCHAR(MAX),
    Certifications NVARCHAR(MAX),
    TechnologiesMentioned NVARCHAR(MAX),
    YearsExperienceExtracted INT,
    LeadershipTermsCount INT DEFAULT 0,
    AchievementDensity DECIMAL(5,2),
    ReadabilityScore DECIMAL(5,2),
    KeywordsMatched INT DEFAULT 0,
    ResumeQualityScore INT CHECK (ResumeQualityScore BETWEEN 1 AND 100),
    ExtractedSkills NVARCHAR(MAX),
    ProcessingStatus VARCHAR(20) DEFAULT 'Pending',
    NLPProcessedAt DATETIME NULL,
    ConfidenceScore DECIMAL(3,2) CHECK (ConfidenceScore BETWEEN 0 AND 1),
    FOREIGN KEY (CandidateID) REFERENCES Candidates(CandidateID) ON DELETE CASCADE,
    FOREIGN KEY (DocumentID) REFERENCES CandidateDocuments(DocumentID)
);

-- 54. AI_GeneratedQuestions
CREATE TABLE AI_GeneratedQuestions (
    QuestionID INT IDENTITY(1,1) PRIMARY KEY,
    JobID INT NOT NULL,
    SkillID INT NULL,
    QuestionType VARCHAR(50) CHECK (QuestionType IN ('Technical', 'Behavioral', 'Scenario', 'Cultural')),
    DifficultyLevel INT CHECK (DifficultyLevel BETWEEN 1 AND 10),
    QuestionText NVARCHAR(1000) NOT NULL,
    ExpectedAnswerKeywords NVARCHAR(MAX),
    ScoringRubric NVARCHAR(MAX),
    GeneratedByModel VARCHAR(50) DEFAULT 'RuleBasedV1',
    UsedCount INT DEFAULT 0,
    SuccessRate DECIMAL(5,2),
    LastUsed DATETIME NULL,
    IsActive BIT DEFAULT 1,
    FOREIGN KEY (JobID) REFERENCES JobPostings(JobID),
    FOREIGN KEY (SkillID) REFERENCES Skills(SkillID)
);

-- 55. BlockchainVerifications
CREATE TABLE BlockchainVerifications (
    VerificationID INT IDENTITY(1,1) PRIMARY KEY,
    CandidateID INT NOT NULL,
    CredentialType VARCHAR(50) CHECK (CredentialType IN ('Degree', 'Certificate', 'Employment', 'Identity')),
    IssuingAuthority VARCHAR(200),
    CredentialHash CHAR(64) NOT NULL,
    BlockchainTransactionID VARCHAR(100),
    BlockNumber INT,
    Network VARCHAR(50) DEFAULT 'Ethereum',
    VerifiedAt DATETIME,
    IsImmutable BIT DEFAULT 1,
    VerificationCost DECIMAL(10,5),
    VerificationStatus VARCHAR(20) DEFAULT 'Pending',
    LastChecked DATETIME DEFAULT GETDATE(),
    Metadata NVARCHAR(MAX),
    FOREIGN KEY (CandidateID) REFERENCES Candidates(CandidateID) ON DELETE CASCADE
);

-- 56. ConsentManagement
CREATE TABLE ConsentManagement (
    ConsentID INT IDENTITY(1,1) PRIMARY KEY,
    CandidateID INT NOT NULL,
    ConsentType VARCHAR(50) CHECK (ConsentType IN ('DataProcessing', 'Marketing', 'Retention', 'ThirdPartySharing')),
    ConsentVersion VARCHAR(20) NOT NULL,
    GivenAt DATETIME NOT NULL DEFAULT GETDATE(),
    RevokedAt DATETIME NULL,
    ExpiryDate DATETIME,
    LegalBasis VARCHAR(100),
    ConsentText NVARCHAR(MAX),
    IPAddress VARCHAR(45),
    UserAgent NVARCHAR(500),
    IsActive BIT DEFAULT 1,
    FOREIGN KEY (CandidateID) REFERENCES Candidates(CandidateID) ON DELETE CASCADE
);

-- 57. CandidateSentiment
CREATE TABLE CandidateSentiment (
    SentimentID INT IDENTITY(1,1) PRIMARY KEY,
    CandidateID INT NOT NULL,
    InteractionType VARCHAR(50) CHECK (InteractionType IN ('Email', 'Interview', 'Call', 'Chat', 'Application')),
    InteractionDate DATETIME DEFAULT GETDATE(),
    SentimentScore DECIMAL(3,2) CHECK (SentimentScore BETWEEN -1 AND 1),
    Confidence DECIMAL(3,2) CHECK (Confidence BETWEEN 0 AND 1),
    KeyTopics NVARCHAR(MAX),
    EmotionBreakdown NVARCHAR(MAX),
    CommunicationStyle VARCHAR(50) CHECK (CommunicationStyle IN ('Formal', 'Casual', 'Technical', 'Enthusiastic', 'Reserved')),
    RedFlagsDetected INT DEFAULT 0,
    PositiveIndicators INT DEFAULT 0,
    AnalysisMethod VARCHAR(50) DEFAULT 'RulesBased',
    RawText NVARCHAR(MAX),
    AnalysisDate DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (CandidateID) REFERENCES Candidates(CandidateID) ON DELETE CASCADE
);

-- 58. ChatbotInteractions
CREATE TABLE ChatbotInteractions (
    InteractionID INT IDENTITY(1,1) PRIMARY KEY,
    CandidateID INT NULL,
    SessionID VARCHAR(100) NOT NULL,
    UserQuery NVARCHAR(1000) NOT NULL,
    BotResponse NVARCHAR(MAX),
    IntentRecognized VARCHAR(100),
    ConfidenceScore DECIMAL(3,2) CHECK (ConfidenceScore BETWEEN 0 AND 1),
    EntitiesRecognized NVARCHAR(MAX),
    WasHelpful BIT NULL,
    EscalatedToHuman BIT DEFAULT 0,
    ResolutionTimeSeconds INT,
    ConversationPath NVARCHAR(MAX),
    Platform VARCHAR(50) DEFAULT 'Web',
    UserIP VARCHAR(45),
    UserAgent NVARCHAR(500),
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (CandidateID) REFERENCES Candidates(CandidateID)
);

-- 59. ScreeningBotDecisions
CREATE TABLE ScreeningBotDecisions (
    DecisionID INT IDENTITY(1,1) PRIMARY KEY,
    ApplicationID INT NOT NULL,
    Decision VARCHAR(20) CHECK (Decision IN ('Pass', 'Fail', 'Maybe', 'ManualReview')),
    Confidence DECIMAL(3,2) CHECK (Confidence BETWEEN 0 AND 1),
    CriteriaEvaluated NVARCHAR(MAX),
    Score INT CHECK (Score BETWEEN 0 AND 100),
    ThresholdUsed INT,
    ModelVersion VARCHAR(50) DEFAULT 'RulesBasedV1',
    DecisionDate DATETIME DEFAULT GETDATE(),
    HumanOverride BIT DEFAULT 0,
    OverrideReason NVARCHAR(500),
    FinalDecision VARCHAR(20),
    FOREIGN KEY (ApplicationID) REFERENCES Applications(ApplicationID)
);

-- 60. InterviewTranscriptions
CREATE TABLE InterviewTranscriptions (
    TranscriptionID INT IDENTITY(1,1) PRIMARY KEY,
    InterviewID INT NULL,
    ScheduleID INT NULL,
    AudioFileURL NVARCHAR(500),
    VideoFileURL NVARCHAR(500),
    TranscriptionText NVARCHAR(MAX),
    SpeakerDiarization NVARCHAR(MAX),
    KeyMoments NVARCHAR(MAX),
    TalkingTimeRatio DECIMAL(5,2),
    QuestionResponseLatencyAvg DECIMAL(5,2),
    FillerWordCount INT,
    SentimentBySegment NVARCHAR(MAX),
    KeywordFrequency NVARCHAR(MAX),
    TechnicalTermCount INT,
    ConfidenceScore DECIMAL(3,2),
    ProcessingStatus VARCHAR(20) DEFAULT 'Pending',
    ProcessedAt DATETIME NULL,
    AnalysisVersion VARCHAR(50),
    FOREIGN KEY (ScheduleID) REFERENCES InterviewSchedules(ScheduleID),
    FOREIGN KEY (InterviewID) REFERENCES InterviewFeedback(FeedbackID)
);

-- 61. ExternalPlatformSync
CREATE TABLE ExternalPlatformSync (
    SyncID INT IDENTITY(1,1) PRIMARY KEY,
    Platform VARCHAR(50) CHECK (Platform IN ('LinkedIn', 'Indeed', 'Glassdoor', 'Naukri', 'Monster')),
    CandidateID INT NULL,
    JobID INT NULL,
    ProfileURL NVARCHAR(500),
    JobURL NVARCHAR(500),
    LastSyncedAt DATETIME DEFAULT GETDATE(),
    SyncStatus VARCHAR(20) CHECK (SyncStatus IN ('Success', 'Failed', 'Pending', 'Partial')),
    DataRetrieved NVARCHAR(MAX),
    RecommendationsFromPlatform NVARCHAR(MAX),
    EndorsementCount INT,
    ConnectionCount INT,
    PlatformReputationScore DECIMAL(5,2),
    SyncDirection VARCHAR(20) CHECK (SyncDirection IN ('Import', 'Export', 'Both')),
    ErrorMessage NVARCHAR(MAX),
    NextSyncAttempt DATETIME,
    FOREIGN KEY (CandidateID) REFERENCES Candidates(CandidateID),
    FOREIGN KEY (JobID) REFERENCES JobPostings(JobID)
);

-- 62. VideoInterviews
CREATE TABLE VideoInterviews (
    VideoInterviewID INT IDENTITY(1,1) PRIMARY KEY,
    ApplicationID INT NOT NULL,
    ScheduleID INT NULL,
    Platform VARCHAR(50) CHECK (Platform IN ('Zoom', 'Teams', 'GoogleMeet', 'HireVue', 'SparkHire')),
    InterviewLink NVARCHAR(500),
    MeetingID VARCHAR(100),
    Passcode VARCHAR(50),
    RecordingURL NVARCHAR(500),
    DurationMinutes INT,
    ParticipantCount INT,
    TechnicalIssues BIT DEFAULT 0,
    RecordingConsent BIT DEFAULT 0,
    AIAnalysisPerformed BIT DEFAULT 0,
    AnalysisResults NVARCHAR(MAX),
    InterviewDate DATETIME,
    CreatedAt DATETIME DEFAULT GETDATE(),
    Status VARCHAR(20) DEFAULT 'Scheduled',
    FOREIGN KEY (ApplicationID) REFERENCES Applications(ApplicationID),
    FOREIGN KEY (ScheduleID) REFERENCES InterviewSchedules(ScheduleID)
);

-- 63. BackgroundChecks
CREATE TABLE BackgroundChecks (
    CheckID INT IDENTITY(1,1) PRIMARY KEY,
    CandidateID INT NOT NULL,
    CheckType VARCHAR(50) CHECK (CheckType IN ('Criminal', 'Education', 'Employment', 'Credit', 'Reference', 'Drug')),
    Vendor VARCHAR(100),
    RequestID VARCHAR(100),
    InitiatedAt DATETIME DEFAULT GETDATE(),
    CompletedAt DATETIME NULL,
    Status VARCHAR(20) CHECK (Status IN ('Requested', 'InProgress', 'Completed', 'Failed', 'Cleared', 'Adverse')),
    Result VARCHAR(20) CHECK (Result IN ('Clear', 'Consider', 'Adverse', 'Inconclusive')),
    Findings NVARCHAR(MAX),
    RiskLevel INT CHECK (RiskLevel BETWEEN 1 AND 5),
    ComplianceVerified BIT DEFAULT 0,
    ReportURL NVARCHAR(500),
    Cost DECIMAL(10,2),
    TurnaroundDays INT,
    Notes NVARCHAR(MAX),
    FOREIGN KEY (CandidateID) REFERENCES Candidates(CandidateID) ON DELETE CASCADE
);

-- 64. PersonalizedLearningPaths
CREATE TABLE PersonalizedLearningPaths (
    PathID INT IDENTITY(1,1) PRIMARY KEY,
    CandidateID INT NOT NULL,
    GoalJobID INT NOT NULL,
    CurrentReadinessScore INT CHECK (CurrentReadinessScore BETWEEN 0 AND 100),
    TargetReadinessScore INT CHECK (TargetReadinessScore BETWEEN 0 AND 100),
    SkillsGapAnalysis NVARCHAR(MAX),
    RecommendedResources NVARCHAR(MAX),
    EstimatedCompletionWeeks INT,
    WeeklyStudyHours INT DEFAULT 10,
    ProgressPercentage DECIMAL(5,2) DEFAULT 0,
    CurrentPhase VARCHAR(50) DEFAULT 'NotStarted',
    StartedAt DATETIME NULL,
    CompletedAt DATETIME NULL,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (CandidateID) REFERENCES Candidates(CandidateID) ON DELETE CASCADE,
    FOREIGN KEY (GoalJobID) REFERENCES JobPostings(JobID)
);

-- 65. InterviewPrepMaterials
CREATE TABLE InterviewPrepMaterials (
    MaterialID INT IDENTITY(1,1) PRIMARY KEY,
    JobID INT NOT NULL,
    MaterialType VARCHAR(50) CHECK (MaterialType IN ('StudyGuide', 'MockInterview', 'CompanyInfo', 'IndustryInsights', 'CommonQuestions')),
    Title NVARCHAR(200) NOT NULL,
    Content NVARCHAR(MAX),
    EstimatedPrepTime INT,
    DifficultyLevel INT CHECK (DifficultyLevel BETWEEN 1 AND 5),
    SuccessRate DECIMAL(5,2),
    Tags NVARCHAR(500),
    IsActive BIT DEFAULT 1,
    CreatedBy INT,
    CreatedAt DATETIME DEFAULT GETDATE(),
    LastUpdated DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (JobID) REFERENCES JobPostings(JobID),
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID)
);

-- 66. CandidatePrepProgress
CREATE TABLE CandidatePrepProgress (
    ProgressID INT IDENTITY(1,1) PRIMARY KEY,
    CandidateID INT NOT NULL,
    MaterialID INT NOT NULL,
    StartedAt DATETIME DEFAULT GETDATE(),
    CompletedAt DATETIME NULL,
    TimeSpentMinutes INT,
    ConfidenceBefore INT CHECK (ConfidenceBefore BETWEEN 1 AND 10),
    ConfidenceAfter INT CHECK (ConfidenceAfter BETWEEN 1 AND 10),
    Notes NVARCHAR(500),
    Rating INT CHECK (Rating BETWEEN 1 AND 5),
    FOREIGN KEY (CandidateID) REFERENCES Candidates(CandidateID) ON DELETE CASCADE,
    FOREIGN KEY (MaterialID) REFERENCES InterviewPrepMaterials(MaterialID)
);

-- 67. PushNotifications
CREATE TABLE PushNotifications (
    NotificationID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    DeviceToken VARCHAR(500),
    Platform VARCHAR(20) CHECK (Platform IN ('iOS', 'Android', 'Web')),
    Title NVARCHAR(200) NOT NULL,
    Body NVARCHAR(500) NOT NULL,
    NotificationType VARCHAR(50) CHECK (NotificationType IN ('Interview', 'StatusUpdate', 'Reminder', 'Offer', 'Message')),
    DataPayload NVARCHAR(MAX),
    SentAt DATETIME DEFAULT GETDATE(),
    DeliveredAt DATETIME NULL,
    ReadAt DATETIME NULL,
    ClickedAt DATETIME NULL,
    CampaignID INT,
    IsSilent BIT DEFAULT 0,
    Priority INT CHECK (Priority BETWEEN 1 AND 5) DEFAULT 3,
    ExpiresAt DATETIME,
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- 68. CandidateLocationPreferences
CREATE TABLE CandidateLocationPreferences (
    PreferenceID INT IDENTITY(1,1) PRIMARY KEY,
    CandidateID INT NOT NULL UNIQUE,
    PreferredLocations NVARCHAR(MAX),
    WillingToRelocate BIT DEFAULT 0,
    RemotePreference VARCHAR(20) CHECK (RemotePreference IN ('Full', 'Hybrid', 'None')) DEFAULT 'Hybrid',
    CommuteTimeMax INT DEFAULT 60,
    LocationPriority INT CHECK (LocationPriority BETWEEN 1 AND 10) DEFAULT 5,
    LastUpdated DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (CandidateID) REFERENCES Candidates(CandidateID) ON DELETE CASCADE
);

-- 69. CandidateGamification
CREATE TABLE CandidateGamification (
    GameID INT IDENTITY(1,1) PRIMARY KEY,
    CandidateID INT NOT NULL UNIQUE,
    Points INT DEFAULT 0,
    Level INT DEFAULT 1,
    Badges NVARCHAR(MAX) DEFAULT '[]',
    StreakDays INT DEFAULT 0,
    LastActivityDate DATETIME DEFAULT GETDATE(),
    LeaderboardRank INT,
    RewardsRedeemed NVARCHAR(MAX),
    EngagementScore INT CHECK (EngagementScore BETWEEN 0 AND 100) DEFAULT 50,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (CandidateID) REFERENCES Candidates(CandidateID) ON DELETE CASCADE
);

-- 70. GamificationActions
CREATE TABLE GamificationActions (
    ActionID INT IDENTITY(1,1) PRIMARY KEY,
    ActionType VARCHAR(50) UNIQUE NOT NULL,
    PointsAwarded INT NOT NULL,
    BadgeEligible VARCHAR(100),
    CooldownHours INT DEFAULT 0,
    MaxDaily INT DEFAULT NULL,
    Description NVARCHAR(500),
    IsActive BIT DEFAULT 1
);