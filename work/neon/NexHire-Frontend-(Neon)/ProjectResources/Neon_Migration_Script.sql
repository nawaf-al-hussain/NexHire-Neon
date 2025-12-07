-- =====================================================
-- PostgreSQL Migration Script for RecruitmentDB
-- Generated from SQL Server source
-- Compatible with PostgreSQL 15+ and Neon
-- =====================================================

-- Enable required extensions (install if not present)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "fuzzystrmatch";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================
-- STUB FUNCTIONS (replace with actual implementations)
-- =====================================================

-- DocumentParser functions (external tools needed)
CREATE OR REPLACE FUNCTION ExtractTextFromPDF(pdf_bytes BYTEA)
RETURNS TEXT LANGUAGE plpgsql AS $$
BEGIN
    RAISE WARNING 'ExtractTextFromPDF not implemented';
    RETURN '';
END;
$$;

CREATE OR REPLACE FUNCTION ExtractTextFromDocx(docx_bytes BYTEA)
RETURNS TEXT LANGUAGE plpgsql AS $$
BEGIN
    RAISE WARNING 'ExtractTextFromDocx not implemented';
    RETURN '';
END;
$$;

CREATE OR REPLACE FUNCTION ExtractYearsOfExperience(resume_text TEXT)
RETURNS INTEGER LANGUAGE plpgsql AS $$
BEGIN
    RAISE WARNING 'ExtractYearsOfExperience not implemented';
    RETURN 0;
END;
$$;

CREATE OR REPLACE FUNCTION ExtractSkills(resume_text TEXT)
RETURNS TEXT LANGUAGE plpgsql AS $$
BEGIN
    RAISE WARNING 'ExtractSkills not implemented';
    RETURN '';
END;
$$;

CREATE OR REPLACE FUNCTION CalculateSentiment(input_text TEXT)
RETURNS DOUBLE PRECISION LANGUAGE plpgsql AS $$
BEGIN
    RAISE WARNING 'CalculateSentiment not implemented';
    RETURN 0.0;
END;
$$;

CREATE OR REPLACE FUNCTION CosineSimilarity(text1 TEXT, text2 TEXT)
RETURNS DOUBLE PRECISION LANGUAGE plpgsql AS $$
BEGIN
    RAISE WARNING 'CosineSimilarity not implemented, using pg_trgm similarity';
    RETURN similarity(text1, text2);
END;
$$;

CREATE OR REPLACE FUNCTION JaroWinklerSimilarity(s1 TEXT, s2 TEXT)
RETURNS DOUBLE PRECISION LANGUAGE plpgsql AS $$
BEGIN
    RETURN jarowinkler(s1, s2);
END;
$$;

CREATE OR REPLACE FUNCTION LevenshteinDistance(s1 TEXT, s2 TEXT)
RETURNS INTEGER LANGUAGE plpgsql AS $$
BEGIN
    RETURN levenshtein(s1, s2);
END;
$$;

CREATE OR REPLACE FUNCTION StandardDeviation(values_str TEXT)
RETURNS DOUBLE PRECISION LANGUAGE plpgsql AS $$
DECLARE
    vals DOUBLE PRECISION[];
    avg_val DOUBLE PRECISION;
    sum_sq DOUBLE PRECISION;
    n INTEGER;
    v DOUBLE PRECISION;
BEGIN
    SELECT ARRAY(SELECT unnest(string_to_array(values_str, ','))::DOUBLE PRECISION) INTO vals;
    n := array_length(vals, 1);
    IF n IS NULL OR n = 0 THEN RETURN NULL; END IF;
    SELECT avg(val) INTO avg_val FROM unnest(vals) val;
    sum_sq := 0;
    FOREACH v IN ARRAY vals LOOP
        sum_sq := sum_sq + (v - avg_val)^2;
    END LOOP;
    RETURN sqrt(sum_sq / n);
END;
$$;

CREATE OR REPLACE FUNCTION Percentile(values_str TEXT, percentile_val DOUBLE PRECISION)
RETURNS DOUBLE PRECISION LANGUAGE plpgsql AS $$
DECLARE
    vals DOUBLE PRECISION[];
    sorted DOUBLE PRECISION[];
    idx INTEGER;
BEGIN
    SELECT ARRAY(SELECT unnest(string_to_array(values_str, ','))::DOUBLE PRECISION ORDER BY 1) INTO sorted;
    IF array_length(sorted, 1) IS NULL THEN RETURN NULL; END IF;
    idx := ceil(percentile_val * array_length(sorted, 1));
    RETURN sorted[idx];
END;
$$;

CREATE OR REPLACE FUNCTION CorrelationCoefficient(values1_str TEXT, values2_str TEXT)
RETURNS DOUBLE PRECISION LANGUAGE plpgsql AS $$
DECLARE
    vals1 DOUBLE PRECISION[];
    vals2 DOUBLE PRECISION[];
    n INTEGER;
    sum1 DOUBLE PRECISION := 0;
    sum2 DOUBLE PRECISION := 0;
    sum1sq DOUBLE PRECISION := 0;
    sum2sq DOUBLE PRECISION := 0;
    psum DOUBLE PRECISION := 0;
    i INTEGER;
BEGIN
    SELECT ARRAY(SELECT unnest(string_to_array(values1_str, ','))::DOUBLE PRECISION) INTO vals1;
    SELECT ARRAY(SELECT unnest(string_to_array(values2_str, ','))::DOUBLE PRECISION) INTO vals2;
    n := array_length(vals1, 1);
    IF n IS NULL OR n = 0 OR n != array_length(vals2, 1) THEN RETURN NULL; END IF;
    FOR i IN 1..n LOOP
        sum1 := sum1 + vals1[i];
        sum2 := sum2 + vals2[i];
        sum1sq := sum1sq + vals1[i]^2;
        sum2sq := sum2sq + vals2[i]^2;
        psum := psum + vals1[i] * vals2[i];
    END LOOP;
    RETURN (n * psum - sum1 * sum2) / 
           sqrt((n * sum1sq - sum1^2) * (n * sum2sq - sum2^2));
END;
$$;

CREATE OR REPLACE FUNCTION HashPassword(password TEXT)
RETURNS TEXT LANGUAGE plpgsql AS $$
BEGIN
    RETURN crypt(password, gen_salt('bf'));
END;
$$;

CREATE OR REPLACE FUNCTION VerifyPassword(password TEXT, hashed_password TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql AS $$
BEGIN
    RETURN password = crypt(password, hashed_password);
END;
$$;

CREATE OR REPLACE FUNCTION EncryptSensitiveData(plain_text TEXT, encryption_key TEXT)
RETURNS TEXT LANGUAGE plpgsql AS $$
BEGIN
    RAISE WARNING 'EncryptSensitiveData not implemented, returning plain text';
    RETURN plain_text;
END;
$$;

CREATE OR REPLACE FUNCTION GenerateSecureToken(token_length INTEGER)
RETURNS TEXT LANGUAGE plpgsql AS $$
BEGIN
    RETURN encode(gen_random_bytes(token_length), 'hex');
END;
$$;

CREATE OR REPLACE FUNCTION ValidateEmail(email TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql AS $$
BEGIN
    RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$;

CREATE OR REPLACE FUNCTION IsDisposableEmail(email TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql AS $$
DECLARE
    domain TEXT;
    disposable_domains TEXT[] := ARRAY['tempmail.com', 'throwaway.com', 'mailinator.com'];
BEGIN
    domain := substring(email from '@(.*)$');
    RETURN domain = ANY(disposable_domains);
END;
$$;

CREATE OR REPLACE FUNCTION ExtractEmailDomain(email TEXT)
RETURNS TEXT LANGUAGE plpgsql AS $$
BEGIN
    RETURN substring(email from '@(.*)$');
END;
$$;

CREATE OR REPLACE FUNCTION GetRelativeTime(dt TIMESTAMP)
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
    diff INTERVAL;
BEGIN
    diff := NOW() - dt;
    IF diff < INTERVAL '1 minute' THEN
        RETURN 'just now';
    ELSIF diff < INTERVAL '1 hour' THEN
        RETURN extract(minute from diff)::INT || ' minutes ago';
    ELSIF diff < INTERVAL '1 day' THEN
        RETURN extract(hour from diff)::INT || ' hours ago';
    ELSIF diff < INTERVAL '1 week' THEN
        RETURN extract(day from diff)::INT || ' days ago';
    ELSE
        RETURN to_char(dt, 'YYYY-MM-DD');
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION IsWithinWorkingHours(dt TIMESTAMP, start_hour INT, end_hour INT)
RETURNS BOOLEAN LANGUAGE plpgsql AS $$
BEGIN
    RETURN extract(hour from dt) BETWEEN start_hour AND end_hour - 1;
END;
$$;

CREATE OR REPLACE FUNCTION AddBusinessDays(start_date TIMESTAMP, days_to_add INT)
RETURNS TIMESTAMP LANGUAGE plpgsql AS $$
DECLARE
    result TIMESTAMP := start_date;
    added INT := 0;
BEGIN
    WHILE added < days_to_add LOOP
        result := result + INTERVAL '1 day';
        IF extract(dow from result) NOT IN (0,6) THEN  -- 0=Sunday,6=Saturday
            added := added + 1;
        END IF;
    END LOOP;
    RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION CalculateBusinessDays(start_date TIMESTAMP, end_date TIMESTAMP)
RETURNS INTEGER LANGUAGE plpgsql AS $$
DECLARE
    days INT := 0;
    cur DATE;
BEGIN
    cur := start_date::DATE;
    WHILE cur <= end_date::DATE LOOP
        IF extract(dow from cur) NOT IN (0,6) THEN
            days := days + 1;
        END IF;
        cur := cur + 1;
    END LOOP;
    RETURN days;
END;
$$;

CREATE OR REPLACE FUNCTION ConvertTimezone(dt TIMESTAMP, from_tz TEXT, to_tz TEXT)
RETURNS TIMESTAMP LANGUAGE plpgsql AS $$
BEGIN
    RETURN dt AT TIME ZONE from_tz AT TIME ZONE to_tz;
END;
$$;

CREATE OR REPLACE FUNCTION GetTimezoneOffset(tz_name TEXT)
RETURNS TEXT LANGUAGE plpgsql AS $$
BEGIN
    RETURN extract(timezone from now() AT TIME ZONE tz_name)::TEXT;
END;
$$;

CREATE OR REPLACE FUNCTION CalculateTimezoneOverlap(tz1 TEXT, tz2 TEXT, start_hour INT, end_hour INT)
RETURNS INTEGER LANGUAGE plpgsql AS $$
DECLARE
    offset1 INTERVAL;
    offset2 INTERVAL;
    overlap_start INT;
    overlap_end INT;
BEGIN
    offset1 := make_interval(hours := extract(timezone from now() AT TIME ZONE tz1)::INT);
    offset2 := make_interval(hours := extract(timezone from now() AT TIME ZONE tz2)::INT);
    -- Simplified: assume both days same, return overlap hours
    overlap_start := greatest(start_hour - extract(hour from offset1 - offset2), 0);
    overlap_end := least(end_hour - extract(hour from offset1 - offset2), 24);
    RETURN greatest(overlap_end - overlap_start, 0);
END;
$$;

CREATE OR REPLACE FUNCTION CallRESTApi(url TEXT, method TEXT, body TEXT, headers TEXT)
RETURNS TEXT LANGUAGE plpgsql AS $$
BEGIN
    RAISE WARNING 'CallRESTApi not implemented';
    RETURN '{}';
END;
$$;

CREATE OR REPLACE FUNCTION GeocodeAddress(address TEXT, api_key TEXT)
RETURNS TEXT LANGUAGE plpgsql AS $$
BEGIN
    RAISE WARNING 'GeocodeAddress not implemented';
    RETURN '{}';
END;
$$;

CREATE OR REPLACE FUNCTION VerifyLinkedInProfile(profile_url TEXT, access_token TEXT)
RETURNS TEXT LANGUAGE plpgsql AS $$
BEGIN
    RAISE WARNING 'VerifyLinkedInProfile not implemented';
    RETURN '{"verified": false}';
END;
$$;

-- Statistical functions (simple wrappers)
CREATE OR REPLACE FUNCTION ZScore(value DOUBLE PRECISION, mean_val DOUBLE PRECISION, stddev_val DOUBLE PRECISION)
RETURNS DOUBLE PRECISION LANGUAGE plpgsql AS $$
BEGIN
    IF stddev_val = 0 THEN RETURN 0; END IF;
    RETURN (value - mean_val) / stddev_val;
END;
$$;

-- =====================================================
-- TABLES CREATION (reordered by dependencies)
-- =====================================================

-- ApplicationStatus (parent for Applications, etc.)
CREATE TABLE ApplicationStatus (
    StatusID SERIAL PRIMARY KEY,
    StatusName VARCHAR(30) NOT NULL UNIQUE
);

-- Roles (parent for Users)
CREATE TABLE Roles (
    RoleID SERIAL PRIMARY KEY,
    RoleName VARCHAR(50) NOT NULL UNIQUE
);

-- Users (parent for Candidates, Recruiters, etc.)
CREATE TABLE Users (
    UserID SERIAL PRIMARY KEY,
    Username VARCHAR(50) NOT NULL UNIQUE,
    Email VARCHAR(200) NOT NULL UNIQUE,
    PasswordHash VARCHAR(500) NOT NULL,
    SessionToken VARCHAR(300),
    LastLogin TIMESTAMP,
    RoleID INTEGER NOT NULL REFERENCES Roles(RoleID),
    CreatedAt TIMESTAMP DEFAULT NOW(),
    IsActive BOOLEAN DEFAULT TRUE,
    CONSTRAINT CHK_Email_Format CHECK (Email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Candidates (depends on Users)
CREATE TABLE Candidates (
    CandidateID SERIAL PRIMARY KEY,
    UserID INTEGER NOT NULL UNIQUE REFERENCES Users(UserID) ON DELETE CASCADE,
    FullName VARCHAR(100) NOT NULL,
    Location VARCHAR(100),
    YearsOfExperience INTEGER DEFAULT 0 CHECK (YearsOfExperience >= 0),
    PreferredLocations TEXT,
    ResumeFile BYTEA,
    ResumeFileName VARCHAR(255),
    ResumeText TEXT,
    ExtractedSkills TEXT,
    LinkedInURL VARCHAR(500),
    Timezone VARCHAR(100),
    CreatedAt TIMESTAMP DEFAULT NOW(),
    CONSTRAINT CHK_FullName_NotEmpty CHECK (length(trim(FullName)) > 0)
);

-- JobPostings (depends on Users for CreatedBy)
CREATE TABLE JobPostings (
    JobID SERIAL PRIMARY KEY,
    JobTitle VARCHAR(150) NOT NULL,
    Description TEXT,
    Location VARCHAR(100),
    MinExperience INTEGER DEFAULT 0 CHECK (MinExperience >= 0),
    Vacancies INTEGER DEFAULT NULL CHECK (Vacancies >= 0),
    CreatedAt TIMESTAMP DEFAULT NOW(),
    IsActive BOOLEAN DEFAULT TRUE,
    IsDeleted BOOLEAN DEFAULT FALSE,
    CreatedBy INTEGER REFERENCES Users(UserID)
);

-- Skills (parent for many)
CREATE TABLE Skills (
    SkillID SERIAL PRIMARY KEY,
    SkillName VARCHAR(100) NOT NULL UNIQUE
);

-- CandidateSkills (depends on Candidates, Skills)
CREATE TABLE CandidateSkills (
    CandidateID INTEGER NOT NULL REFERENCES Candidates(CandidateID) ON DELETE CASCADE,
    SkillID INTEGER NOT NULL REFERENCES Skills(SkillID),
    ProficiencyLevel INTEGER CHECK (ProficiencyLevel >= 1 AND ProficiencyLevel <= 10),
    PRIMARY KEY (CandidateID, SkillID)
);

-- JobSkills (depends on JobPostings, Skills)
CREATE TABLE JobSkills (
    JobID INTEGER NOT NULL REFERENCES JobPostings(JobID) ON DELETE CASCADE,
    SkillID INTEGER NOT NULL REFERENCES Skills(SkillID),
    IsMandatory BOOLEAN DEFAULT FALSE,
    MinProficiency INTEGER CHECK (MinProficiency >= 1 AND MinProficiency <= 10),
    PRIMARY KEY (JobID, SkillID)
);

-- Applications (depends on Candidates, JobPostings, ApplicationStatus)
CREATE TABLE Applications (
    ApplicationID SERIAL PRIMARY KEY,
    CandidateID INTEGER NOT NULL REFERENCES Candidates(CandidateID) ON DELETE CASCADE,
    JobID INTEGER NOT NULL REFERENCES JobPostings(JobID),
    StatusID INTEGER NOT NULL REFERENCES ApplicationStatus(StatusID),
    AppliedDate TIMESTAMP DEFAULT NOW(),
    StatusChangedAt TIMESTAMP DEFAULT NOW(),
    WithdrawnAt TIMESTAMP,
    WithdrawalReason VARCHAR(500),
    RejectionReason VARCHAR(200),
    IsDeleted BOOLEAN DEFAULT FALSE,
    UNIQUE (CandidateID, JobID)
);

-- Recruiters (depends on Users)
CREATE TABLE Recruiters (
    RecruiterID SERIAL PRIMARY KEY,
    UserID INTEGER NOT NULL UNIQUE REFERENCES Users(UserID) ON DELETE CASCADE,
    Department VARCHAR(100)
);

-- InterviewSchedules (depends on Applications, Recruiters)
CREATE TABLE InterviewSchedules (
    ScheduleID SERIAL PRIMARY KEY,
    ApplicationID INTEGER NOT NULL REFERENCES Applications(ApplicationID) ON DELETE CASCADE,
    RecruiterID INTEGER NOT NULL REFERENCES Recruiters(RecruiterID),
    InterviewStart TIMESTAMP NOT NULL,
    InterviewEnd TIMESTAMP NOT NULL,
    CandidateConfirmed BOOLEAN DEFAULT FALSE,
    CreatedAt TIMESTAMP DEFAULT NOW()
);

-- CommunicationLogs (depends on Applications, Users)
CREATE TABLE CommunicationLogs (
    LogID SERIAL PRIMARY KEY,
    ApplicationID INTEGER NOT NULL REFERENCES Applications(ApplicationID),
    SenderID INTEGER NOT NULL REFERENCES Users(UserID),
    ReceiverID INTEGER NOT NULL REFERENCES Users(UserID),
    MessageType VARCHAR(50) CHECK (MessageType IN ('Email', 'SMS', 'InApp', 'Reminder')),
    SentAt TIMESTAMP DEFAULT NOW(),
    ReadAt TIMESTAMP,
    RespondedAt TIMESTAMP,
    IsGhostingRisk BOOLEAN DEFAULT FALSE
);

-- GhostingPatterns (depends on Users)
CREATE TABLE GhostingPatterns (
    PatternID SERIAL PRIMARY KEY,
    UserID INTEGER NOT NULL REFERENCES Users(UserID) ON DELETE CASCADE,
    UserType VARCHAR(20) CHECK (UserType IN ('Candidate', 'Recruiter')),
    Action VARCHAR(50) CHECK (Action IN ('NoResponse', 'NoShowInterview', 'LateResponse', 'GhostedAfterInterview', 'GhostedAfterOffer')),
    Frequency INTEGER DEFAULT 1,
    LastIncident TIMESTAMP DEFAULT NOW(),
    GhostingScore DECIMAL(3,2) DEFAULT 0 CHECK (GhostingScore >= 0 AND GhostingScore <= 10),
    IsActive BOOLEAN DEFAULT TRUE
);

-- SalaryBenchmarks (depends on Skills)
CREATE TABLE SalaryBenchmarks (
    BenchmarkID SERIAL PRIMARY KEY,
    JobTitle VARCHAR(150) NOT NULL,
    Location VARCHAR(100) NOT NULL,
    ExperienceRange VARCHAR(50) CHECK (ExperienceRange IN ('Entry', 'Junior', 'Mid', 'Senior', 'Lead', 'Executive')),
    SkillID INTEGER REFERENCES Skills(SkillID),
    Currency VARCHAR(3) DEFAULT 'USD',
    AvgSalary DECIMAL(10,2) NOT NULL,
    Percentile25 DECIMAL(10,2),
    Percentile50 DECIMAL(10,2),
    Percentile75 DECIMAL(10,2),
    SampleSize INTEGER DEFAULT 0,
    ConfidenceRating INTEGER DEFAULT 3 CHECK (ConfidenceRating >= 1 AND ConfidenceRating <= 5),
    LastUpdated TIMESTAMP DEFAULT NOW(),
    Source VARCHAR(100),
    IsActive BOOLEAN DEFAULT TRUE
);

-- JobSalaryRanges (depends on JobPostings)
CREATE TABLE JobSalaryRanges (
    RangeID SERIAL PRIMARY KEY,
    JobID INTEGER NOT NULL REFERENCES JobPostings(JobID) ON DELETE CASCADE,
    MinSalary DECIMAL(10,2),
    MaxSalary DECIMAL(10,2),
    Currency VARCHAR(3) DEFAULT 'USD',
    BonusPotential DECIMAL(5,2),
    Equity BOOLEAN DEFAULT FALSE,
    BenefitsSummary TEXT,
    IsTransparent BOOLEAN DEFAULT FALSE,
    LastUpdated TIMESTAMP DEFAULT NOW()
);

-- SkillVerifications (depends on Candidates, Skills, Users)
CREATE TABLE SkillVerifications (
    VerificationID SERIAL PRIMARY KEY,
    CandidateID INTEGER NOT NULL REFERENCES Candidates(CandidateID) ON DELETE CASCADE,
    SkillID INTEGER NOT NULL REFERENCES Skills(SkillID),
    AssessmentID INTEGER, -- will reference MicroAssessments later
    VerificationMethod VARCHAR(50) CHECK (VerificationMethod IN ('CodeTest', 'PeerReview', 'Certification', 'Portfolio', 'WorkSample')),
    VerificationScore INTEGER CHECK (VerificationScore >= 0 AND VerificationScore <= 100),
    VerifiedBy INTEGER REFERENCES Users(UserID),
    VerifiedAt TIMESTAMP DEFAULT NOW(),
    ExpiryDate TIMESTAMP,
    ProofURL VARCHAR(500),
    IsVerified BOOLEAN DEFAULT FALSE,
    ConfidenceLevel INTEGER DEFAULT 3 CHECK (ConfidenceLevel >= 1 AND ConfidenceLevel <= 5)
);

-- RemoteCompatibility (depends on Candidates)
CREATE TABLE RemoteCompatibility (
    CompatibilityID SERIAL PRIMARY KEY,
    CandidateID INTEGER NOT NULL UNIQUE REFERENCES Candidates(CandidateID) ON DELETE CASCADE,
    SelfAssessmentScore INTEGER CHECK (SelfAssessmentScore >= 1 AND SelfAssessmentScore <= 10),
    WorkspaceQuality INTEGER CHECK (WorkspaceQuality >= 1 AND WorkspaceQuality <= 5),
    TimezoneAlignment INTEGER CHECK (TimezoneAlignment >= 1 AND TimezoneAlignment <= 10),
    CommunicationPreference VARCHAR(50) CHECK (CommunicationPreference IN ('Async', 'Sync', 'Mixed')),
    DistractionResistance INTEGER CHECK (DistractionResistance >= 1 AND DistractionResistance <= 10),
    SelfMotivationScore INTEGER CHECK (SelfMotivationScore >= 1 AND SelfMotivationScore <= 10),
    PreviousRemoteExperienceMonths INTEGER DEFAULT 0,
    TechSetupScore INTEGER CHECK (TechSetupScore >= 1 AND TechSetupScore <= 5),
    OverallRemoteScore DECIMAL(3,2),
    AssessmentDate TIMESTAMP DEFAULT NOW()
);

-- CompanyRemotePolicy (depends on Recruiters)
CREATE TABLE CompanyRemotePolicy (
    PolicyID SERIAL PRIMARY KEY,
    RecruiterID INTEGER NOT NULL REFERENCES Recruiters(RecruiterID),
    AsyncWorkPercentage INTEGER CHECK (AsyncWorkPercentage >= 0 AND AsyncWorkPercentage <= 100),
    CoreHours VARCHAR(50),
    MeetingCulture VARCHAR(50) CHECK (MeetingCulture IN ('MeetingLight', 'Collaborative', 'Heavy')),
    TechProvided BOOLEAN DEFAULT FALSE,
    RemoteOnboardingScore INTEGER CHECK (RemoteOnboardingScore >= 1 AND RemoteOnboardingScore <= 10),
    HomeOfficeStipend DECIMAL(10,2),
    TimezoneFlexibility VARCHAR(50),
    CreatedAt TIMESTAMP DEFAULT NOW()
);

-- TimezoneOverlapAnalysis (depends on Candidates, JobPostings)
CREATE TABLE TimezoneOverlapAnalysis (
    AnalysisID SERIAL PRIMARY KEY,
    CandidateID INTEGER NOT NULL REFERENCES Candidates(CandidateID),
    JobID INTEGER NOT NULL REFERENCES JobPostings(JobID),
    CandidateTimezone VARCHAR(50),
    CompanyTimezone VARCHAR(50),
    OverlapHours DECIMAL(4,2),
    OptimalOverlapHours DECIMAL(4,2),
    OverlapScore INTEGER CHECK (OverlapScore >= 0 AND OverlapScore <= 100),
    AnalysisDate TIMESTAMP DEFAULT NOW()
);

-- CareerPaths
CREATE TABLE CareerPaths (
    PathID SERIAL PRIMARY KEY,
    FromRole VARCHAR(150) NOT NULL,
    ToRole VARCHAR(150) NOT NULL,
    AvgTransitionMonths INTEGER,
    Probability DECIMAL(3,2) CHECK (Probability >= 0 AND Probability <= 1),
    RequiredSkillsGap TEXT,
    SalaryIncreaseAvg DECIMAL(5,2),
    DemandTrend VARCHAR(20) CHECK (DemandTrend IN ('Growing', 'Stable', 'Declining')),
    FutureProofScore INTEGER CHECK (FutureProofScore >= 1 AND FutureProofScore <= 10),
    SampleSize INTEGER,
    LastAnalyzed TIMESTAMP DEFAULT NOW()
);

-- CandidateCareerGoals (depends on Candidates)
CREATE TABLE CandidateCareerGoals (
    GoalID SERIAL PRIMARY KEY,
    CandidateID INTEGER NOT NULL REFERENCES Candidates(CandidateID) ON DELETE CASCADE,
    TargetRole VARCHAR(150) NOT NULL,
    TargetTimelineMonths INTEGER,
    CurrentReadinessScore INTEGER CHECK (CurrentReadinessScore >= 0 AND CurrentReadinessScore <= 100),
    SkillsToDevelop TEXT,
    ProgressPercentage DECIMAL(5,2) DEFAULT 0,
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedAt TIMESTAMP DEFAULT NOW(),
    UpdatedAt TIMESTAMP DEFAULT NOW()
);

-- LearningResources (depends on Skills)
CREATE TABLE LearningResources (
    ResourceID SERIAL PRIMARY KEY,
    SkillID INTEGER NOT NULL REFERENCES Skills(SkillID),
    ResourceType VARCHAR(50) CHECK (ResourceType IN ('Course', 'Book', 'Tutorial', 'Certification', 'Project')),
    Title VARCHAR(200) NOT NULL,
    URL VARCHAR(500),
    EstimatedHours INTEGER,
    Difficulty VARCHAR(20) CHECK (Difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
    Cost DECIMAL(10,2) DEFAULT 0,
    Rating DECIMAL(3,2),
    IsActive BOOLEAN DEFAULT TRUE
);

-- ReferralNetwork (depends on Candidates, JobPostings)
CREATE TABLE ReferralNetwork (
    ReferralID SERIAL PRIMARY KEY,
    ReferrerID INTEGER NOT NULL REFERENCES Candidates(CandidateID),
    ReferredCandidateID INTEGER NOT NULL REFERENCES Candidates(CandidateID),
    JobID INTEGER NOT NULL REFERENCES JobPostings(JobID),
    ReferralStrength INTEGER CHECK (ReferralStrength >= 1 AND ReferralStrength <= 10),
    RelationshipType VARCHAR(50) CHECK (RelationshipType IN ('FormerColleague', 'Classmate', 'Friend', 'Family', 'Mentor', 'Other')),
    ReferralDate TIMESTAMP DEFAULT NOW(),
    BonusAmount DECIMAL(10,2),
    BonusPaid BOOLEAN DEFAULT FALSE,
    PaidDate TIMESTAMP,
    HireResult BOOLEAN,
    QualityScore INTEGER CHECK (QualityScore >= 1 AND QualityScore <= 10)
);

-- NetworkStrength (depends on Candidates)
CREATE TABLE NetworkStrength (
    StrengthID SERIAL PRIMARY KEY,
    CandidateID INTEGER NOT NULL REFERENCES Candidates(CandidateID),
    ConnectionID INTEGER NOT NULL REFERENCES Candidates(CandidateID),
    ConnectionType VARCHAR(50) CHECK (ConnectionType IN ('Colleague', 'Classmate', 'Industry', 'Friend')),
    ConnectionStrength INTEGER CHECK (ConnectionStrength >= 1 AND ConnectionStrength <= 10),
    LastInteraction TIMESTAMP,
    InteractionFrequency VARCHAR(20) CHECK (InteractionFrequency IN ('Daily', 'Weekly', 'Monthly', 'Yearly', 'Rare')),
    SharedSkillsCount INTEGER DEFAULT 0,
    MutualConnectionsCount INTEGER DEFAULT 0,
    TrustLevel INTEGER CHECK (TrustLevel >= 1 AND TrustLevel <= 5),
    CONSTRAINT CHK_NetworkStrength_SelfRefer CHECK (CandidateID <> ConnectionID)
);

-- ReferralPerformance (depends on Candidates)
CREATE TABLE ReferralPerformance (
    PerformanceID SERIAL PRIMARY KEY,
    ReferrerID INTEGER NOT NULL REFERENCES Candidates(CandidateID),
    TotalReferrals INTEGER DEFAULT 0,
    SuccessfulReferrals INTEGER DEFAULT 0,
    ConversionRate DECIMAL(5,2),
    TotalBonusEarned DECIMAL(10,2),
    AvgQualityScore DECIMAL(3,2),
    LastReferralDate TIMESTAMP,
    TopReferralSkill VARCHAR(100)
);

-- InterviewFeedback (depends on Applications, Users)
CREATE TABLE InterviewFeedback (
    FeedbackID SERIAL PRIMARY KEY,
    ApplicationID INTEGER NOT NULL REFERENCES Applications(ApplicationID) ON DELETE CASCADE,
    InterviewerID INTEGER NOT NULL REFERENCES Users(UserID),
    TechnicalScore INTEGER CHECK (TechnicalScore >= 0 AND TechnicalScore <= 10),
    CommunicationScore INTEGER CHECK (CommunicationScore >= 0 AND CommunicationScore <= 10),
    CultureFitScore INTEGER CHECK (CultureFitScore >= 0 AND CultureFitScore <= 10),
    Recommendation VARCHAR(20) CHECK (Recommendation IN ('Hire', 'Hold', 'Reject')),
    Comments TEXT,
    SentimentScore DOUBLE PRECISION,
    CreatedAt TIMESTAMP DEFAULT NOW()
);

-- ApplicationStatusHistory (depends on Applications, Users)
CREATE TABLE ApplicationStatusHistory (
    HistoryID SERIAL PRIMARY KEY,
    ApplicationID INTEGER NOT NULL REFERENCES Applications(ApplicationID) ON DELETE CASCADE,
    FromStatusID INTEGER REFERENCES ApplicationStatus(StatusID),
    ToStatusID INTEGER NOT NULL REFERENCES ApplicationStatus(StatusID),
    ChangedBy INTEGER NOT NULL REFERENCES Users(UserID),
    ChangedAt TIMESTAMP DEFAULT NOW(),
    Notes VARCHAR(500)
);

-- ApplicationStatusTransitions (depends on ApplicationStatus)
CREATE TABLE ApplicationStatusTransitions (
    FromStatusID INTEGER NOT NULL REFERENCES ApplicationStatus(StatusID),
    ToStatusID INTEGER NOT NULL REFERENCES ApplicationStatus(StatusID),
    PRIMARY KEY (FromStatusID, ToStatusID)
);

-- DiversityMetrics (depends on Applications)
CREATE TABLE DiversityMetrics (
    MetricID SERIAL PRIMARY KEY,
    ApplicationID INTEGER NOT NULL REFERENCES Applications(ApplicationID) ON DELETE CASCADE,
    Gender VARCHAR(50),
    Ethnicity VARCHAR(100),
    DisabilityStatus BOOLEAN,
    VeteranStatus BOOLEAN,
    FirstGenerationCollege BOOLEAN,
    LGBTQPlus BOOLEAN,
    CareerGapMonths INTEGER DEFAULT 0,
    NonTraditionalBackground BOOLEAN,
    EducationLevel VARCHAR(50),
    AnonymizedHash VARCHAR(64) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT NOW(),
    LastUpdated TIMESTAMP DEFAULT NOW()
);

-- AI_GeneratedQuestions (depends on JobPostings, Skills)
CREATE TABLE AI_GeneratedQuestions (
    QuestionID SERIAL PRIMARY KEY,
    JobID INTEGER NOT NULL REFERENCES JobPostings(JobID),
    SkillID INTEGER REFERENCES Skills(SkillID),
    QuestionType VARCHAR(50) CHECK (QuestionType IN ('Technical', 'Behavioral', 'Scenario', 'Cultural')),
    DifficultyLevel INTEGER CHECK (DifficultyLevel >= 1 AND DifficultyLevel <= 10),
    QuestionText VARCHAR(1000) NOT NULL,
    ExpectedAnswerKeywords TEXT,
    ScoringRubric TEXT,
    GeneratedByModel VARCHAR(50) DEFAULT 'RuleBasedV1',
    UsedCount INTEGER DEFAULT 0,
    SuccessRate DECIMAL(5,2),
    LastUsed TIMESTAMP,
    IsActive BOOLEAN DEFAULT TRUE
);

-- AI_Predictions (depends on Candidates, JobPostings, Applications)
CREATE TABLE AI_Predictions (
    PredictionID SERIAL PRIMARY KEY,
    CandidateID INTEGER NOT NULL REFERENCES Candidates(CandidateID) ON DELETE CASCADE,
    JobID INTEGER NOT NULL REFERENCES JobPostings(JobID),
    ApplicationID INTEGER REFERENCES Applications(ApplicationID),
    SuccessProbability DECIMAL(5,2) CHECK (SuccessProbability >= 0 AND SuccessProbability <= 1),
    KeyFactors TEXT,
    ModelVersion VARCHAR(50) DEFAULT 'RulesBasedV1',
    PredictionDate TIMESTAMP DEFAULT NOW(),
    ActualOutcome BOOLEAN,
    Accuracy DECIMAL(5,2)
);

-- MicroAssessments (depends on Skills)
CREATE TABLE MicroAssessments (
    AssessmentID SERIAL PRIMARY KEY,
    SkillID INTEGER NOT NULL REFERENCES Skills(SkillID),
    AssessmentType VARCHAR(30) CHECK (AssessmentType IN ('5minQuiz', 'CodeChallenge', 'Scenario', 'PeerReview')),
    Title VARCHAR(200) NOT NULL,
    Description TEXT,
    TimeLimit INTEGER,
    PassingScore INTEGER CHECK (PassingScore >= 0 AND PassingScore <= 100),
    QuestionsCount INTEGER DEFAULT 5,
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedAt TIMESTAMP DEFAULT NOW()
);

-- AssessmentAttempts (depends on Candidates, MicroAssessments)
CREATE TABLE AssessmentAttempts (
    AttemptID SERIAL PRIMARY KEY,
    CandidateID INTEGER NOT NULL REFERENCES Candidates(CandidateID),
    AssessmentID INTEGER NOT NULL REFERENCES MicroAssessments(AssessmentID),
    StartedAt TIMESTAMP DEFAULT NOW(),
    CompletedAt TIMESTAMP,
    Score INTEGER,
    TimeSpentSeconds INTEGER,
    IsPassed BOOLEAN DEFAULT FALSE,
    Details TEXT
);

-- AuditLog (depends on Users)
CREATE TABLE AuditLog (
    AuditID SERIAL PRIMARY KEY,
    TableName VARCHAR(100),
    RecordID INTEGER,
    Operation VARCHAR(20),
    OldValue TEXT,
    NewValue TEXT,
    ChangedBy INTEGER REFERENCES Users(UserID),
    ChangedAt TIMESTAMP DEFAULT NOW()
);

-- BackgroundChecks (depends on Candidates)
CREATE TABLE BackgroundChecks (
    CheckID SERIAL PRIMARY KEY,
    CandidateID INTEGER NOT NULL REFERENCES Candidates(CandidateID) ON DELETE CASCADE,
    CheckType VARCHAR(50) CHECK (CheckType IN ('Criminal', 'Education', 'Employment', 'Credit', 'Reference', 'Drug')),
    Vendor VARCHAR(100),
    RequestID VARCHAR(100),
    InitiatedAt TIMESTAMP DEFAULT NOW(),
    CompletedAt TIMESTAMP,
    Status VARCHAR(20) CHECK (Status IN ('Requested', 'InProgress', 'Completed', 'Failed', 'Cleared', 'Adverse')),
    Result VARCHAR(20) CHECK (Result IN ('Clear', 'Consider', 'Adverse', 'Inconclusive')),
    Findings TEXT,
    RiskLevel INTEGER CHECK (RiskLevel >= 1 AND RiskLevel <= 5),
    ComplianceVerified BOOLEAN DEFAULT FALSE,
    ReportURL VARCHAR(500),
    Cost DECIMAL(10,2),
    TurnaroundDays INTEGER,
    Notes TEXT
);

-- BiasDetectionLogs (depends on Recruiters)
CREATE TABLE BiasDetectionLogs (
    DetectionID SERIAL PRIMARY KEY,
    RecruiterID INTEGER REFERENCES Recruiters(RecruiterID),
    DetectionType VARCHAR(100) NOT NULL,
    Severity VARCHAR(20) NOT NULL,
    Details TEXT NOT NULL,
    SuggestedActions TEXT,
    IsResolved BOOLEAN DEFAULT FALSE,
    DetectedAt TIMESTAMP DEFAULT NOW(),
    ResolvedAt TIMESTAMP
);

-- BlockchainVerifications (depends on Candidates)
CREATE TABLE BlockchainVerifications (
    VerificationID SERIAL PRIMARY KEY,
    CandidateID INTEGER NOT NULL REFERENCES Candidates(CandidateID) ON DELETE CASCADE,
    CredentialType VARCHAR(50) CHECK (CredentialType IN ('Degree', 'Certificate', 'Employment', 'Identity')),
    IssuingAuthority VARCHAR(200),
    CredentialHash CHAR(64) NOT NULL,
    BlockchainTransactionID VARCHAR(100),
    BlockNumber INTEGER,
    Network VARCHAR(50) DEFAULT 'Ethereum',
    VerifiedAt TIMESTAMP,
    IsImmutable BOOLEAN DEFAULT TRUE,
    VerificationCost DECIMAL(10,5),
    VerificationStatus VARCHAR(20) DEFAULT 'Pending',
    LastChecked TIMESTAMP DEFAULT NOW(),
    Metadata TEXT
);

-- CandidateDocuments (depends on Candidates)
CREATE TABLE CandidateDocuments (
    DocumentID SERIAL PRIMARY KEY,
    CandidateID INTEGER NOT NULL REFERENCES Candidates(CandidateID) ON DELETE CASCADE,
    DocumentType VARCHAR(50) CHECK (DocumentType IN ('Resume', 'CoverLetter', 'Certificate')),
    FilePath VARCHAR(500),
    UploadedAt TIMESTAMP DEFAULT NOW()
);

-- CandidateGamification (depends on Candidates)
CREATE TABLE CandidateGamification (
    GameID SERIAL PRIMARY KEY,
    CandidateID INTEGER NOT NULL UNIQUE REFERENCES Candidates(CandidateID) ON DELETE CASCADE,
    Points INTEGER DEFAULT 0,
    Level INTEGER DEFAULT 1,
    Badges TEXT DEFAULT '[]',
    StreakDays INTEGER DEFAULT 0,
    LastActivityDate TIMESTAMP DEFAULT NOW(),
    LeaderboardRank INTEGER,
    RewardsRedeemed TEXT,
    EngagementScore INTEGER DEFAULT 50 CHECK (EngagementScore >= 0 AND EngagementScore <= 100),
    CreatedAt TIMESTAMP DEFAULT NOW(),
    UpdatedAt TIMESTAMP DEFAULT NOW()
);

-- CandidateInterviewHistory (depends on Candidates)
CREATE TABLE CandidateInterviewHistory (
    HistoryID SERIAL PRIMARY KEY,
    CandidateID INTEGER NOT NULL REFERENCES Candidates(CandidateID),
    CompanyName VARCHAR(100),
    InterviewDate TIMESTAMP,
    InterviewRound INTEGER,
    QuestionsAsked TEXT,
    PerformanceScore INTEGER CHECK (PerformanceScore >= 1 AND PerformanceScore <= 10),
    FeedbackReceived TEXT,
    InterviewDurationMinutes INTEGER,
    InterviewerCount INTEGER,
    WasTechnical BOOLEAN DEFAULT TRUE,
    CreatedAt TIMESTAMP DEFAULT NOW()
);

-- CandidateLocationPreferences (depends on Candidates)
CREATE TABLE CandidateLocationPreferences (
    PreferenceID SERIAL PRIMARY KEY,
    CandidateID INTEGER NOT NULL UNIQUE REFERENCES Candidates(CandidateID) ON DELETE CASCADE,
    PreferredLocations TEXT,
    WillingToRelocate BOOLEAN DEFAULT FALSE,
    RemotePreference VARCHAR(20) DEFAULT 'Hybrid' CHECK (RemotePreference IN ('Full', 'Hybrid', 'None')),
    CommuteTimeMax INTEGER DEFAULT 60,
    LocationPriority INTEGER DEFAULT 5 CHECK (LocationPriority >= 1 AND LocationPriority <= 10),
    LastUpdated TIMESTAMP DEFAULT NOW()
);

-- CandidatePrepProgress (depends on Candidates, InterviewPrepMaterials)
CREATE TABLE CandidatePrepProgress (
    ProgressID SERIAL PRIMARY KEY,
    CandidateID INTEGER NOT NULL REFERENCES Candidates(CandidateID) ON DELETE CASCADE,
    MaterialID INTEGER NOT NULL, -- will reference InterviewPrepMaterials later
    StartedAt TIMESTAMP DEFAULT NOW(),
    CompletedAt TIMESTAMP,
    TimeSpentMinutes INTEGER,
    ConfidenceBefore INTEGER CHECK (ConfidenceBefore >= 1 AND ConfidenceBefore <= 10),
    ConfidenceAfter INTEGER CHECK (ConfidenceAfter >= 1 AND ConfidenceAfter <= 10),
    Notes VARCHAR(500),
    Rating INTEGER CHECK (Rating >= 1 AND Rating <= 5)
);

-- CandidateRankingHistory (depends on Candidates, JobPostings)
CREATE TABLE CandidateRankingHistory (
    HistoryID SERIAL PRIMARY KEY,
    CandidateID INTEGER REFERENCES Candidates(CandidateID),
    JobID INTEGER REFERENCES JobPostings(JobID),
    MatchScore DECIMAL(5,2),
    CalculatedAt TIMESTAMP DEFAULT NOW()
);

-- CandidateSentiment (depends on Candidates)
CREATE TABLE CandidateSentiment (
    SentimentID SERIAL PRIMARY KEY,
    CandidateID INTEGER NOT NULL REFERENCES Candidates(CandidateID) ON DELETE CASCADE,
    InteractionType VARCHAR(50) CHECK (InteractionType IN ('Email', 'Interview', 'Call', 'Chat', 'Application')),
    InteractionDate TIMESTAMP DEFAULT NOW(),
    SentimentScore DECIMAL(3,2) CHECK (SentimentScore >= -1 AND SentimentScore <= 1),
    Confidence DECIMAL(3,2) CHECK (Confidence >= 0 AND Confidence <= 1),
    KeyTopics TEXT,
    EmotionBreakdown TEXT,
    CommunicationStyle VARCHAR(50) CHECK (CommunicationStyle IN ('Formal', 'Casual', 'Technical', 'Enthusiastic', 'Reserved')),
    RedFlagsDetected INTEGER DEFAULT 0,
    PositiveIndicators INTEGER DEFAULT 0,
    AnalysisMethod VARCHAR(50) DEFAULT 'RulesBased',
    RawText TEXT,
    AnalysisDate TIMESTAMP DEFAULT NOW()
);

-- ChatbotInteractions (depends on Candidates)
CREATE TABLE ChatbotInteractions (
    InteractionID SERIAL PRIMARY KEY,
    CandidateID INTEGER REFERENCES Candidates(CandidateID),
    SessionID VARCHAR(100) NOT NULL,
    UserQuery VARCHAR(1000) NOT NULL,
    BotResponse TEXT,
    IntentRecognized VARCHAR(100),
    ConfidenceScore DECIMAL(3,2) CHECK (ConfidenceScore >= 0 AND ConfidenceScore <= 1),
    EntitiesRecognized TEXT,
    WasHelpful BOOLEAN,
    EscalatedToHuman BOOLEAN DEFAULT FALSE,
    ResolutionTimeSeconds INTEGER,
    ConversationPath TEXT,
    Platform VARCHAR(50) DEFAULT 'Web',
    UserIP VARCHAR(45),
    UserAgent VARCHAR(500),
    CreatedAt TIMESTAMP DEFAULT NOW()
);

-- CompetitorAnalysis
CREATE TABLE CompetitorAnalysis (
    AnalysisID SERIAL PRIMARY KEY,
    CompetitorName VARCHAR(100) NOT NULL,
    JobTitle VARCHAR(150) NOT NULL,
    Location VARCHAR(100),
    ListedSalary DECIMAL(10,2),
    SalaryCurrency VARCHAR(3) DEFAULT 'USD',
    Benefits TEXT,
    TimeToHireDays INTEGER,
    HiringVolume INTEGER,
    ApplicationRequirements TEXT,
    TechnologyStack VARCHAR(500),
    AnalysisDate TIMESTAMP DEFAULT NOW(),
    SourceURL VARCHAR(500)
);

-- ConsentManagement (depends on Candidates)
CREATE TABLE ConsentManagement (
    ConsentID SERIAL PRIMARY KEY,
    CandidateID INTEGER NOT NULL REFERENCES Candidates(CandidateID) ON DELETE CASCADE,
    ConsentType VARCHAR(50) CHECK (ConsentType IN ('DataProcessing', 'Marketing', 'Retention', 'ThirdPartySharing')),
    ConsentVersion VARCHAR(20) NOT NULL,
    GivenAt TIMESTAMP NOT NULL DEFAULT NOW(),
    RevokedAt TIMESTAMP,
    ExpiryDate TIMESTAMP,
    LegalBasis VARCHAR(100),
    ConsentText TEXT,
    IPAddress VARCHAR(45),
    UserAgent VARCHAR(500),
    IsActive BOOLEAN DEFAULT TRUE
);

-- DiversityGoals (depends on Recruiters)
CREATE TABLE DiversityGoals (
    GoalID SERIAL PRIMARY KEY,
    RecruiterID INTEGER REFERENCES Recruiters(RecruiterID),
    MetricType VARCHAR(50) NOT NULL,
    TargetPercentage DECIMAL(5,2) NOT NULL,
    CurrentPercentage DECIMAL(5,2) DEFAULT 0,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedAt TIMESTAMP DEFAULT NOW()
);

-- EmailQueue (depends on Candidates)
CREATE TABLE EmailQueue (
    EmailID SERIAL PRIMARY KEY,
    CandidateID INTEGER NOT NULL REFERENCES Candidates(CandidateID),
    EmailType VARCHAR(50) CHECK (EmailType IN ('InterviewInvite', 'StatusUpdate', 'Rejection', 'Offer')),
    Subject VARCHAR(200),
    Body TEXT,
    IsSent BOOLEAN DEFAULT FALSE,
    SentAt TIMESTAMP,
    CreatedAt TIMESTAMP DEFAULT NOW()
);

-- ExternalPlatformSync (depends on Candidates, JobPostings)
CREATE TABLE ExternalPlatformSync (
    SyncID SERIAL PRIMARY KEY,
    Platform VARCHAR(50) CHECK (Platform IN ('LinkedIn', 'Indeed', 'Glassdoor', 'Naukri', 'Monster')),
    CandidateID INTEGER REFERENCES Candidates(CandidateID),
    JobID INTEGER REFERENCES JobPostings(JobID),
    ProfileURL VARCHAR(500),
    JobURL VARCHAR(500),
    LastSyncedAt TIMESTAMP DEFAULT NOW(),
    SyncStatus VARCHAR(20) CHECK (SyncStatus IN ('Success', 'Failed', 'Pending', 'Partial')),
    DataRetrieved TEXT,
    RecommendationsFromPlatform TEXT,
    EndorsementCount INTEGER,
    ConnectionCount INTEGER,
    PlatformReputationScore DECIMAL(5,2),
    SyncDirection VARCHAR(20) CHECK (SyncDirection IN ('Import', 'Export', 'Both')),
    ErrorMessage TEXT,
    NextSyncAttempt TIMESTAMP
);

-- GamificationActions
CREATE TABLE GamificationActions (
    ActionID SERIAL PRIMARY KEY,
    ActionType VARCHAR(50) NOT NULL UNIQUE,
    PointsAwarded INTEGER NOT NULL,
    BadgeEligible VARCHAR(100),
    CooldownHours INTEGER DEFAULT 0,
    MaxDaily INTEGER,
    Description VARCHAR(500),
    IsActive BOOLEAN DEFAULT TRUE
);

-- InterviewOptimizationRules
CREATE TABLE InterviewOptimizationRules (
    RuleID SERIAL PRIMARY KEY,
    RuleName VARCHAR(100) NOT NULL,
    Description VARCHAR(500),
    ConditionSQL TEXT,
    ActionSQL TEXT,
    Priority INTEGER DEFAULT 5,
    IsActive BOOLEAN DEFAULT TRUE
);

-- InterviewPrepMaterials (depends on JobPostings, Users)
CREATE TABLE InterviewPrepMaterials (
    MaterialID SERIAL PRIMARY KEY,
    JobID INTEGER NOT NULL REFERENCES JobPostings(JobID),
    MaterialType VARCHAR(50) CHECK (MaterialType IN ('StudyGuide', 'MockInterview', 'CompanyInfo', 'IndustryInsights', 'CommonQuestions')),
    Title VARCHAR(200) NOT NULL,
    Content TEXT,
    EstimatedPrepTime INTEGER,
    DifficultyLevel INTEGER CHECK (DifficultyLevel >= 1 AND DifficultyLevel <= 5),
    SuccessRate DECIMAL(5,2),
    Tags VARCHAR(500),
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedBy INTEGER REFERENCES Users(UserID),
    CreatedAt TIMESTAMP DEFAULT NOW(),
    LastUpdated TIMESTAMP DEFAULT NOW()
);

-- InterviewSharedInsights (depends on JobPostings)
CREATE TABLE InterviewSharedInsights (
    InsightID SERIAL PRIMARY KEY,
    JobID INTEGER NOT NULL REFERENCES JobPostings(JobID),
    QuestionHash VARCHAR(64) NOT NULL,
    QuestionText VARCHAR(500),
    QuestionCategory VARCHAR(50) CHECK (QuestionCategory IN ('Technical', 'Behavioral', 'Cultural', 'CaseStudy')),
    TimesAsked INTEGER DEFAULT 1,
    DifficultyRating DECIMAL(3,2) CHECK (DifficultyRating >= 1 AND DifficultyRating <= 5),
    AvgCandidateScore DECIMAL(3,2),
    OptimalAnswerKeywords TEXT,
    LastAsked TIMESTAMP DEFAULT NOW(),
    IsRedundant BOOLEAN DEFAULT FALSE
);

-- InterviewTranscriptions (depends on InterviewFeedback, InterviewSchedules)
CREATE TABLE InterviewTranscriptions (
    TranscriptionID SERIAL PRIMARY KEY,
    InterviewID INTEGER REFERENCES InterviewFeedback(FeedbackID),
    ScheduleID INTEGER REFERENCES InterviewSchedules(ScheduleID),
    AudioFileURL VARCHAR(500),
    VideoFileURL VARCHAR(500),
    TranscriptionText TEXT,
    SpeakerDiarization TEXT,
    KeyMoments TEXT,
    TalkingTimeRatio DECIMAL(5,2),
    QuestionResponseLatencyAvg DECIMAL(5,2),
    FillerWordCount INTEGER,
    SentimentBySegment TEXT,
    KeywordFrequency TEXT,
    TechnicalTermCount INTEGER,
    ConfidenceScore DECIMAL(3,2),
    ProcessingStatus VARCHAR(20) DEFAULT 'Pending',
    ProcessedAt TIMESTAMP,
    AnalysisVersion VARCHAR(50)
);

-- JobPostingsArchive (archive table)
CREATE TABLE JobPostingsArchive (
    JobID INTEGER,
    JobTitle VARCHAR(100),
    Description TEXT,
    Location VARCHAR(50),
    Vacancies INTEGER,
    CreatedAt TIMESTAMP,
    ArchivedAt TIMESTAMP DEFAULT NOW()
);

-- ApplicationsArchive (archive table)
CREATE TABLE ApplicationsArchive (
    ApplicationID INTEGER,
    CandidateID INTEGER,
    JobID INTEGER,
    StatusID INTEGER,
    AppliedDate TIMESTAMP,
    ArchivedAt TIMESTAMP DEFAULT NOW()
);

-- MarketAlerts (depends on Skills)
CREATE TABLE MarketAlerts (
    AlertID SERIAL PRIMARY KEY,
    AlertType VARCHAR(50) CHECK (AlertType IN ('Demand', 'Supply', 'Salary', 'Competitor')),
    SkillID INTEGER REFERENCES Skills(SkillID),
    Location VARCHAR(100),
    Severity INTEGER CHECK (Severity >= 1 AND Severity <= 5),
    Title VARCHAR(200) NOT NULL,
    Description TEXT,
    ImpactAnalysis VARCHAR(500),
    RecommendedAction VARCHAR(500),
    TriggeredAt TIMESTAMP DEFAULT NOW(),
    ExpiresAt TIMESTAMP,
    IsActive BOOLEAN DEFAULT TRUE
);

-- MarketIntelligence (depends on Skills)
CREATE TABLE MarketIntelligence (
    IntelID SERIAL PRIMARY KEY,
    SkillID INTEGER NOT NULL REFERENCES Skills(SkillID),
    Location VARCHAR(100) NOT NULL,
    DemandScore INTEGER CHECK (DemandScore >= 1 AND DemandScore <= 100),
    SupplyScore INTEGER CHECK (SupplyScore >= 1 AND SupplyScore <= 100),
    SalaryTrend VARCHAR(20) CHECK (SalaryTrend IN ('Rising', 'Stable', 'Falling')),
    AvgSalary DECIMAL(10,2),
    CompetitorHiringActivity INTEGER CHECK (CompetitorHiringActivity >= 1 AND CompetitorHiringActivity <= 5),
    JobPostingsCount INTEGER DEFAULT 0,
    CandidateApplicationsCount INTEGER DEFAULT 0,
    TimeToFillDays INTEGER,
    LastUpdated TIMESTAMP DEFAULT NOW(),
    Source VARCHAR(100),
    Confidence INTEGER CHECK (Confidence >= 1 AND Confidence <= 5)
);

-- NegotiationHistory (depends on Candidates, JobPostings)
CREATE TABLE NegotiationHistory (
    NegotiationID SERIAL PRIMARY KEY,
    CandidateID INTEGER NOT NULL REFERENCES Candidates(CandidateID),
    JobID INTEGER NOT NULL REFERENCES JobPostings(JobID),
    InitialOffer DECIMAL(10,2),
    CounterOffer DECIMAL(10,2),
    FinalOffer DECIMAL(10,2),
    NegotiationRounds INTEGER DEFAULT 1,
    NegotiationTacticsUsed TEXT,
    SuccessScore INTEGER CHECK (SuccessScore >= 1 AND SuccessScore <= 10),
    LearnedLessons VARCHAR(500),
    DurationDays INTEGER,
    StartedAt TIMESTAMP DEFAULT NOW(),
    EndedAt TIMESTAMP
);

-- NegotiationTemplates
CREATE TABLE NegotiationTemplates (
    TemplateID SERIAL PRIMARY KEY,
    Scenario VARCHAR(100) NOT NULL,
    TemplateType VARCHAR(50) CHECK (TemplateType IN ('Email', 'Script', 'CounterOffer')),
    Title VARCHAR(200) NOT NULL,
    Content TEXT NOT NULL,
    Tips VARCHAR(500),
    SuccessRate DECIMAL(5,2),
    UseCount INTEGER DEFAULT 0,
    IsActive BOOLEAN DEFAULT TRUE
);

-- OnboardingChecklists (depends on JobPostings)
CREATE TABLE OnboardingChecklists (
    ChecklistID SERIAL PRIMARY KEY,
    JobID INTEGER NOT NULL REFERENCES JobPostings(JobID),
    Phase VARCHAR(50) CHECK (Phase IN ('PreStart', 'Week1', 'Month1', 'Month3', 'Month6')),
    TaskDescription VARCHAR(500) NOT NULL,
    ResponsibleRole VARCHAR(50) CHECK (ResponsibleRole IN ('Recruiter', 'HR', 'Manager', 'Mentor', 'Candidate')),
    DueDaysOffset INTEGER,
    IsCritical BOOLEAN DEFAULT FALSE,
    CompletionRate DECIMAL(5,2),
    AvgCompletionDays INTEGER
);

-- OnboardingPredictions (depends on Candidates, JobPostings)
CREATE TABLE OnboardingPredictions (
    PredictionID SERIAL PRIMARY KEY,
    CandidateID INTEGER NOT NULL REFERENCES Candidates(CandidateID),
    JobID INTEGER NOT NULL REFERENCES JobPostings(JobID),
    SuccessProbability DECIMAL(5,2) CHECK (SuccessProbability >= 0 AND SuccessProbability <= 1),
    RiskFactors TEXT,
    Recommendations TEXT,
    PredictedRetentionMonths INTEGER,
    ConfidenceLevel INTEGER CHECK (ConfidenceLevel >= 1 AND ConfidenceLevel <= 5),
    PredictionDate TIMESTAMP DEFAULT NOW(),
    ActualOutcome VARCHAR(50)
);

-- OnboardingSuccessFactors (depends on Candidates)
CREATE TABLE OnboardingSuccessFactors (
    FactorID SERIAL PRIMARY KEY,
    HiredCandidateID INTEGER NOT NULL REFERENCES Candidates(CandidateID),
    PreStartEngagementScore INTEGER CHECK (PreStartEngagementScore >= 1 AND PreStartEngagementScore <= 10),
    FirstWeekScore INTEGER CHECK (FirstWeekScore >= 1 AND FirstWeekScore <= 10),
    MentorAssigned BOOLEAN DEFAULT FALSE,
    FirstProjectClarity INTEGER CHECK (FirstProjectClarity >= 1 AND FirstProjectClarity <= 5),
    SocialIntegrationScore INTEGER CHECK (SocialIntegrationScore >= 1 AND SocialIntegrationScore <= 10),
    Day30Retention BOOLEAN,
    Day90ProductivityScore INTEGER CHECK (Day90ProductivityScore >= 1 AND Day90ProductivityScore <= 10),
    Day180Retention BOOLEAN,
    OnboardingDurationDays INTEGER,
    SuccessCategory VARCHAR(50) CHECK (SuccessCategory IN ('Low', 'Medium', 'High')),
    Notes TEXT
);

-- PersonalizedLearningPaths (depends on Candidates, JobPostings)
CREATE TABLE PersonalizedLearningPaths (
    PathID SERIAL PRIMARY KEY,
    CandidateID INTEGER NOT NULL REFERENCES Candidates(CandidateID) ON DELETE CASCADE,
    GoalJobID INTEGER NOT NULL REFERENCES JobPostings(JobID),
    CurrentReadinessScore INTEGER CHECK (CurrentReadinessScore >= 0 AND CurrentReadinessScore <= 100),
    TargetReadinessScore INTEGER CHECK (TargetReadinessScore >= 0 AND TargetReadinessScore <= 100),
    SkillsGapAnalysis TEXT,
    RecommendedResources TEXT,
    EstimatedCompletionWeeks INTEGER,
    WeeklyStudyHours INTEGER DEFAULT 10,
    ProgressPercentage DECIMAL(5,2) DEFAULT 0,
    CurrentPhase VARCHAR(50) DEFAULT 'NotStarted',
    StartedAt TIMESTAMP,
    CompletedAt TIMESTAMP,
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedAt TIMESTAMP DEFAULT NOW(),
    UpdatedAt TIMESTAMP DEFAULT NOW()
);

-- PushNotifications (depends on Users)
CREATE TABLE PushNotifications (
    NotificationID SERIAL PRIMARY KEY,
    UserID INTEGER NOT NULL REFERENCES Users(UserID),
    DeviceToken VARCHAR(500),
    Platform VARCHAR(20) CHECK (Platform IN ('iOS', 'Android', 'Web')),
    Title VARCHAR(200) NOT NULL,
    Body VARCHAR(500) NOT NULL,
    NotificationType VARCHAR(50) CHECK (NotificationType IN ('Interview', 'Reminder', 'StatusUpdate', 'Offer', 'Message')),
    DataPayload TEXT,
    SentAt TIMESTAMP DEFAULT NOW(),
    DeliveredAt TIMESTAMP,
    ReadAt TIMESTAMP,
    ClickedAt TIMESTAMP,
    CampaignID INTEGER,
    IsSilent BOOLEAN DEFAULT FALSE,
    Priority INTEGER DEFAULT 3 CHECK (Priority >= 1 AND Priority <= 5),
    ExpiresAt TIMESTAMP
);

-- ResumeInsights (depends on Candidates, CandidateDocuments)
CREATE TABLE ResumeInsights (
    InsightID SERIAL PRIMARY KEY,
    CandidateID INTEGER NOT NULL REFERENCES Candidates(CandidateID) ON DELETE CASCADE,
    DocumentID INTEGER REFERENCES CandidateDocuments(DocumentID),
    EducationInstitutions TEXT,
    Certifications TEXT,
    TechnologiesMentioned TEXT,
    YearsExperienceExtracted INTEGER,
    LeadershipTermsCount INTEGER DEFAULT 0,
    AchievementDensity DECIMAL(5,2),
    ReadabilityScore DECIMAL(5,2),
    KeywordsMatched INTEGER DEFAULT 0,
    ResumeQualityScore INTEGER CHECK (ResumeQualityScore >= 1 AND ResumeQualityScore <= 100),
    ExtractedSkills TEXT,
    ProcessingStatus VARCHAR(20) DEFAULT 'Pending',
    NLPProcessedAt TIMESTAMP,
    ConfidenceScore DECIMAL(3,2) CHECK (ConfidenceScore >= 0 AND ConfidenceScore <= 1)
);

-- RoleArchetypes
CREATE TABLE RoleArchetypes (
    ArchetypeID SERIAL PRIMARY KEY,
    RoleTitle VARCHAR(150) NOT NULL,
    Archetype VARCHAR(50) CHECK (Archetype IN ('IndividualContributor', 'Manager', 'Specialist', 'Generalist', 'Leader')),
    GrowthPotential INTEGER CHECK (GrowthPotential >= 1 AND GrowthPotential <= 5),
    AutomationRisk INTEGER CHECK (AutomationRisk >= 1 AND AutomationRisk <= 5),
    FutureDemand INTEGER CHECK (FutureDemand >= 1 AND FutureDemand <= 5),
    StressLevel INTEGER CHECK (StressLevel >= 1 AND StressLevel <= 5),
    LearningOpportunity INTEGER CHECK (LearningOpportunity >= 1 AND LearningOpportunity <= 5)
);

-- ScreeningBotDecisions (depends on Applications)
CREATE TABLE ScreeningBotDecisions (
    DecisionID SERIAL PRIMARY KEY,
    ApplicationID INTEGER NOT NULL REFERENCES Applications(ApplicationID),
    Decision VARCHAR(20) CHECK (Decision IN ('Pass', 'Maybe', 'ManualReview', 'Fail')),
    Confidence DECIMAL(3,2) CHECK (Confidence >= 0 AND Confidence <= 1),
    Score INTEGER CHECK (Score >= 0 AND Score <= 100),
    CriteriaEvaluated TEXT,
    ModelVersion VARCHAR(50) DEFAULT 'RulesBasedV1',
    DecisionDate TIMESTAMP DEFAULT NOW(),
    HumanOverride BOOLEAN DEFAULT FALSE,
    OverrideReason VARCHAR(500),
    FinalDecision VARCHAR(20)
);

-- VideoInterviews (depends on Applications, InterviewSchedules)
CREATE TABLE VideoInterviews (
    VideoInterviewID SERIAL PRIMARY KEY,
    ApplicationID INTEGER NOT NULL REFERENCES Applications(ApplicationID),
    ScheduleID INTEGER REFERENCES InterviewSchedules(ScheduleID),
    Platform VARCHAR(50) CHECK (Platform IN ('Zoom', 'Teams', 'GoogleMeet', 'HireVue', 'SparkHire')),
    InterviewLink VARCHAR(500),
    MeetingID VARCHAR(100),
    Passcode VARCHAR(50),
    RecordingURL VARCHAR(500),
    DurationMinutes INTEGER,
    ParticipantCount INTEGER,
    TechnicalIssues BOOLEAN DEFAULT FALSE,
    RecordingConsent BOOLEAN DEFAULT FALSE,
    AIAnalysisPerformed BOOLEAN DEFAULT FALSE,
    AnalysisResults TEXT,
    InterviewDate TIMESTAMP,
    CreatedAt TIMESTAMP DEFAULT NOW(),
    Status VARCHAR(20) DEFAULT 'Scheduled'
);

-- Now add foreign key for SkillVerifications.AssessmentID to MicroAssessments
ALTER TABLE SkillVerifications ADD CONSTRAINT fk_skillverifications_assessmentid FOREIGN KEY (AssessmentID) REFERENCES MicroAssessments(AssessmentID);

-- Add foreign key for CandidatePrepProgress.MaterialID to InterviewPrepMaterials
ALTER TABLE CandidatePrepProgress ADD CONSTRAINT fk_candidateprepprogress_materialid FOREIGN KEY (MaterialID) REFERENCES InterviewPrepMaterials(MaterialID);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IDX_AI_Questions_ActiveJob ON AI_GeneratedQuestions(JobID, IsActive);
CREATE INDEX IDX_AI_Predictions_JobCandidate ON AI_Predictions(JobID, CandidateID);
CREATE INDEX IDX_AI_Predictions_Probability ON AI_Predictions(SuccessProbability DESC);
CREATE INDEX IDX_Application_AppliedDate ON Applications(AppliedDate);
CREATE INDEX IDX_Application_Candidate ON Applications(CandidateID);
CREATE INDEX IDX_Application_Job ON Applications(JobID);
CREATE INDEX IDX_Application_Status ON Applications(StatusID);
CREATE INDEX IDX_StatusHistory_Application ON ApplicationStatusHistory(ApplicationID, ChangedAt);
CREATE INDEX IDX_AuditLog_TableRecordDate ON AuditLog(TableName, RecordID, ChangedAt);
CREATE INDEX IDX_BackgroundChecks_StatusRisk ON BackgroundChecks(Status, RiskLevel) WHERE Status = 'Completed';
CREATE INDEX IDX_Blockchain_StatusDate ON BlockchainVerifications(VerificationStatus, LastChecked);
CREATE INDEX IDX_Gamification_Leaderboard ON CandidateGamification(Points DESC, Level DESC);
CREATE INDEX IDX_Sentiment_DateScore ON CandidateSentiment(InteractionDate DESC, SentimentScore);
CREATE INDEX IDX_CandidateSkill_Skill ON CandidateSkills(SkillID);
CREATE INDEX IDX_CareerPaths_FromTo ON CareerPaths(FromRole, ToRole);
CREATE INDEX IDX_CareerPaths_Probability ON CareerPaths(Probability DESC);
CREATE INDEX IDX_DiversityMetrics_Anonymized ON DiversityMetrics(AnonymizedHash, ApplicationID);
CREATE INDEX IDX_EmailQueue_IsSent ON EmailQueue(IsSent, CreatedAt);
CREATE INDEX IDX_ExternalSync_StatusNext ON ExternalPlatformSync(SyncStatus, NextSyncAttempt) WHERE SyncStatus = 'Failed';
CREATE INDEX IDX_GhostingPatterns_Score ON GhostingPatterns(GhostingScore, IsActive);
CREATE INDEX IDX_GhostingPatterns_Type ON GhostingPatterns(UserType, LastIncident);
CREATE INDEX IDX_PrepMaterials_ActiveJob ON InterviewPrepMaterials(JobID, IsActive, DifficultyLevel);
CREATE INDEX IDX_Interview_Recruiter_Time ON InterviewSchedules(RecruiterID, InterviewStart, InterviewEnd);
CREATE UNIQUE INDEX UQ_InterviewSlot ON InterviewSchedules(RecruiterID, InterviewStart, InterviewEnd);
CREATE INDEX IDX_Transcriptions_StatusDate ON InterviewTranscriptions(ProcessingStatus, ProcessedAt DESC);
CREATE INDEX IDX_JobSkill_Skill ON JobSkills(SkillID);
CREATE INDEX IDX_JobSkills_JobID_IsMandatory ON JobSkills(JobID, IsMandatory) INCLUDE (SkillID, MinProficiency);
CREATE INDEX IDX_MarketIntelligence_DemandSupply ON MarketIntelligence(DemandScore, SupplyScore, Location, SkillID);
CREATE INDEX IDX_MarketIntelligence_LocationSkill ON MarketIntelligence(Location, SkillID);
CREATE INDEX IDX_LearningPaths_ActiveProgress ON PersonalizedLearningPaths(IsActive, ProgressPercentage DESC) WHERE IsActive = TRUE;
CREATE INDEX IDX_PushNotifications_UserStatus ON PushNotifications(UserID, DeliveredAt) WHERE DeliveredAt IS NULL;
CREATE INDEX IDX_ReferralNetwork_Outcome ON ReferralNetwork(HireResult, QualityScore);
CREATE INDEX IDX_ReferralNetwork_Referrer ON ReferralNetwork(ReferrerID, ReferralDate DESC);
CREATE INDEX IDX_ResumeInsights_QualityDate ON ResumeInsights(ResumeQualityScore DESC, NLPProcessedAt DESC);
CREATE INDEX IDX_SalaryBenchmarks_JobLocation ON SalaryBenchmarks(JobTitle, Location, ExperienceRange);
CREATE INDEX IDX_SalaryBenchmarks_Recency ON SalaryBenchmarks(LastUpdated DESC);
CREATE INDEX IDX_Screening_ConfidenceDate ON ScreeningBotDecisions(Confidence DESC, DecisionDate DESC);
CREATE INDEX IDX_SkillVerifications_ExpiryActive ON SkillVerifications(ExpiryDate) WHERE ExpiryDate IS NOT NULL;
CREATE INDEX IDX_SkillVerifications_Score ON SkillVerifications(VerificationScore, IsVerified);
CREATE INDEX IDX_VideoInterviews_StatusDate ON VideoInterviews(Status, InterviewDate DESC);

-- =====================================================
-- VIEWS
-- =====================================================

CREATE VIEW vw_GhostingRiskDashboard AS
SELECT 
    a.ApplicationID,
    a.CandidateID,
    c.FullName AS CandidateName,
    j.JobTitle,
    u.Username AS RecruiterName,
    COALESCE(gp_c.GhostingScore, 0) AS CandidateGhostingScore,
    COALESCE(gp_r.GhostingScore, 0) AS RecruiterGhostingScore,
    (COALESCE(gp_c.GhostingScore, 0) + COALESCE(gp_r.GhostingScore, 0)) / 2.0 AS OverallRiskScore,
    COALESCE(cl.AvgResponseTime, 0) AS AvgResponseTime,
    COALESCE(cl.TotalCommunications, 0) AS TotalCommunications,
    CASE 
        WHEN COALESCE(gp_c.GhostingScore, 0) >= 7 OR COALESCE(gp_r.GhostingScore, 0) >= 7 THEN 'High'
        WHEN COALESCE(gp_c.GhostingScore, 0) >= 5 OR COALESCE(gp_r.GhostingScore, 0) >= 5 THEN 'Medium'
        ELSE 'Low'
    END AS OverallRiskLevel,
    a.StatusID,
    s.StatusName,
    EXTRACT(DAY FROM NOW() - a.AppliedDate) AS DaysSinceApplication
FROM Applications a
JOIN Candidates c ON a.CandidateID = c.CandidateID
JOIN JobPostings j ON a.JobID = j.JobID
JOIN Users u ON j.CreatedBy = u.UserID
JOIN ApplicationStatus s ON a.StatusID = s.StatusID
LEFT JOIN (
    SELECT UserID, AVG(GhostingScore) AS GhostingScore
    FROM GhostingPatterns 
    WHERE UserType = 'Candidate'
    GROUP BY UserID
) gp_c ON c.UserID = gp_c.UserID
LEFT JOIN (
    SELECT UserID, AVG(GhostingScore) AS GhostingScore
    FROM GhostingPatterns 
    WHERE UserType = 'Recruiter'
    GROUP BY UserID
) gp_r ON j.CreatedBy = gp_r.UserID
LEFT JOIN (
    SELECT 
        ApplicationID,
        AVG(EXTRACT(EPOCH FROM (RespondedAt - SentAt))/3600) AS AvgResponseTime,
        COUNT(*) AS TotalCommunications
    FROM CommunicationLogs
    WHERE RespondedAt IS NOT NULL
    GROUP BY ApplicationID
) cl ON a.ApplicationID = cl.ApplicationID
WHERE a.IsDeleted = FALSE;

CREATE VIEW vw_SalaryTransparency AS
SELECT 
    j.JobID,
    j.JobTitle,
    j.Location,
    j.MinExperience,
    jsr.MinSalary,
    jsr.MaxSalary,
    jsr.Currency,
    jsr.IsTransparent,
    sb.AvgSalary AS MarketAverage,
    sb.Percentile25 AS Market25th,
    sb.Percentile75 AS Market75th,
    CASE 
        WHEN jsr.MinSalary IS NULL THEN 'Not Disclosed'
        WHEN jsr.MaxSalary IS NULL THEN 'Range Not Complete'
        WHEN jsr.IsTransparent THEN 'Fully Transparent'
        ELSE 'Partially Transparent'
    END AS TransparencyLevel,
    COUNT(a.ApplicationID)::DECIMAL / NULLIF(j.Vacancies, 0) AS ApplicationsPerVacancy,
    AVG(EXTRACT(DAY FROM NOW() - a.AppliedDate)) AS AvgDaysOpen
FROM JobPostings j
LEFT JOIN JobSalaryRanges jsr ON j.JobID = jsr.JobID
LEFT JOIN SalaryBenchmarks sb ON sb.JobTitle = j.JobTitle 
    AND sb.Location = j.Location
    AND sb.ExperienceRange = CASE 
        WHEN j.MinExperience < 2 THEN 'Entry'
        WHEN j.MinExperience < 5 THEN 'Junior'
        WHEN j.MinExperience < 10 THEN 'Mid'
        ELSE 'Senior'
    END
LEFT JOIN Applications a ON j.JobID = a.JobID AND a.IsDeleted = FALSE
WHERE j.IsActive AND NOT j.IsDeleted
GROUP BY j.JobID, j.JobTitle, j.Location, j.MinExperience, j.Vacancies,
         jsr.MinSalary, jsr.MaxSalary, jsr.Currency, jsr.IsTransparent,
         sb.AvgSalary, sb.Percentile25, sb.Percentile75;

CREATE VIEW vw_SkillVerificationStatus AS
SELECT 
    c.CandidateID,
    c.FullName,
    s.SkillName,
    cs.ProficiencyLevel AS ClaimedLevel,
    sv.VerificationScore,
    sv.VerificationMethod,
    sv.VerifiedAt,
    sv.ExpiryDate,
    sv.ConfidenceLevel,
    CASE 
        WHEN sv.VerificationScore >= 80 THEN 'Verified (High)'
        WHEN sv.VerificationScore >= 60 THEN 'Verified (Medium)'
        WHEN sv.VerificationScore IS NULL THEN 'Not Verified'
        ELSE 'Verification Failed'
    END AS VerificationStatus,
    EXTRACT(MONTH FROM age(NOW(), sv.VerifiedAt)) AS MonthsSinceVerification,
    CASE 
        WHEN sv.ExpiryDate IS NULL OR sv.ExpiryDate > NOW() THEN 'Valid'
        ELSE 'Expired'
    END AS ValidityStatus
FROM Candidates c
JOIN CandidateSkills cs ON c.CandidateID = cs.CandidateID
JOIN Skills s ON cs.SkillID = s.SkillID
LEFT JOIN SkillVerifications sv ON c.CandidateID = sv.CandidateID 
    AND cs.SkillID = sv.SkillID;

CREATE VIEW vw_RemoteCompatibilityMatrix AS
SELECT 
    c.CandidateID,
    c.FullName,
    c.Location AS CandidateLocation,
    rc.OverallRemoteScore,
    rc.WorkspaceQuality,
    rc.TimezoneAlignment,
    rc.CommunicationPreference,
    rc.DistractionResistance,
    rc.SelfMotivationScore,
    rc.PreviousRemoteExperienceMonths,
    j.JobID,
    j.JobTitle,
    j.Location AS JobLocation,
    crp.RemoteOnboardingScore AS CompanyRemoteScore,
    crp.AsyncWorkPercentage,
    crp.MeetingCulture,
    crp.TechProvided,
    toa.OverlapHours,
    toa.OverlapScore,
    CASE 
        WHEN rc.OverallRemoteScore >= 8 AND crp.RemoteOnboardingScore >= 7 THEN 'Excellent Match'
        WHEN rc.OverallRemoteScore >= 6 AND crp.RemoteOnboardingScore >= 5 THEN 'Good Match'
        WHEN rc.OverallRemoteScore >= 4 AND crp.RemoteOnboardingScore >= 3 THEN 'Moderate Match'
        ELSE 'Poor Match'
    END AS CompatibilityAssessment
FROM Candidates c
JOIN RemoteCompatibility rc ON c.CandidateID = rc.CandidateID
JOIN Applications a ON c.CandidateID = a.CandidateID
JOIN JobPostings j ON a.JobID = j.JobID
LEFT JOIN CompanyRemotePolicy crp ON j.CreatedBy = crp.RecruiterID
LEFT JOIN TimezoneOverlapAnalysis toa ON c.CandidateID = toa.CandidateID 
    AND j.JobID = toa.JobID
WHERE j.IsActive AND NOT j.IsDeleted
    AND rc.OverallRemoteScore IS NOT NULL;

CREATE VIEW vw_CareerPathInsights AS
SELECT 
    c.CandidateID,
    c.FullName,
    c.YearsOfExperience,
    cg.TargetRole,
    cg.CurrentReadinessScore,
    cg.ProgressPercentage,
    cp.FromRole AS CurrentRoleArchetype,
    cp.ToRole AS TargetRoleArchetype,
    cp.Probability AS TransitionProbability,
    cp.AvgTransitionMonths,
    cp.SalaryIncreaseAvg,
    cp.FutureProofScore,
    (
        SELECT string_agg(s.SkillName, ', ') 
        FROM (
            SELECT s.SkillName
            FROM CandidateSkills cs
            JOIN Skills s ON cs.SkillID = s.SkillID
            WHERE cs.CandidateID = c.CandidateID
            ORDER BY cs.ProficiencyLevel DESC
            LIMIT 5
        ) s
    ) AS TopSkills,
    (
        SELECT COUNT(*) 
        FROM LearningResources lr
        WHERE lr.SkillID IN (
            SELECT SkillID FROM CandidateSkills WHERE CandidateID = c.CandidateID
        )
        AND lr.IsActive
    ) AS AvailableLearningResources
FROM Candidates c
LEFT JOIN CandidateCareerGoals cg ON c.CandidateID = cg.CandidateID AND cg.IsActive
LEFT JOIN CareerPaths cp ON cp.FromRole LIKE '%' || COALESCE((
    SELECT JobTitle 
    FROM Applications a 
    JOIN JobPostings j ON a.JobID = j.JobID 
    WHERE a.CandidateID = c.CandidateID 
    ORDER BY a.AppliedDate DESC
    LIMIT 1
), '') || '%'
    AND cp.ToRole LIKE '%' || COALESCE(cg.TargetRole, '') || '%'
WHERE c.CandidateID IS NOT NULL
GROUP BY c.CandidateID, c.FullName, c.YearsOfExperience, cg.TargetRole, 
         cg.CurrentReadinessScore, cg.ProgressPercentage,
         cp.FromRole, cp.ToRole, cp.Probability, cp.AvgTransitionMonths,
         cp.SalaryIncreaseAvg, cp.FutureProofScore;

CREATE VIEW vw_CandidateMatchScore AS
SELECT
    a.ApplicationID,
    c.CandidateID,
    c.FullName,
    j.JobID,
    j.JobTitle,
    SUM(cs.ProficiencyLevel) AS SkillScore,
    c.YearsOfExperience * 2 AS ExperienceScore,
    CASE WHEN c.Location = j.Location THEN 10 ELSE 0 END AS LocationBonus,
    SUM(cs.ProficiencyLevel) + (c.YearsOfExperience * 2) + 
    CASE WHEN c.Location = j.Location THEN 10 ELSE 0 END AS TotalMatchScore
FROM Candidates c
JOIN Applications a ON c.CandidateID = a.CandidateID
JOIN JobPostings j ON a.JobID = j.JobID
JOIN CandidateSkills cs ON c.CandidateID = cs.CandidateID
JOIN JobSkills js ON cs.SkillID = js.SkillID AND js.JobID = j.JobID
WHERE cs.ProficiencyLevel >= js.MinProficiency
  AND a.IsDeleted = FALSE
GROUP BY a.ApplicationID, c.CandidateID, c.FullName, c.YearsOfExperience, c.Location, j.JobID, j.JobTitle, j.Location
HAVING
    COUNT(CASE WHEN js.IsMandatory THEN 1 END) = 
    (SELECT COUNT(*) FROM JobSkills WHERE JobID = j.JobID AND IsMandatory);

CREATE VIEW vw_ReferralIntelligence AS
SELECT 
    r.ReferrerID,
    c1.FullName AS ReferrerName,
    r.ReferredCandidateID,
    c2.FullName AS ReferredCandidateName,
    r.JobID,
    j.JobTitle,
    r.ReferralStrength,
    r.RelationshipType,
    r.ReferralDate,
    r.BonusAmount,
    r.HireResult,
    r.QualityScore,
    ns.ConnectionStrength,
    ns.TrustLevel,
    ns.LastInteraction,
    rp.ConversionRate AS ReferrerHistoricalRate,
    rp.TotalReferrals,
    rp.SuccessfulReferrals,
    CASE 
        WHEN r.HireResult THEN 'Successful'
        WHEN NOT r.HireResult THEN 'Unsuccessful'
        ELSE 'Pending'
    END AS ReferralOutcome,
    EXTRACT(DAY FROM NOW() - r.ReferralDate) AS DaysSinceReferral
FROM ReferralNetwork r
JOIN Candidates c1 ON r.ReferrerID = c1.CandidateID
JOIN Candidates c2 ON r.ReferredCandidateID = c2.CandidateID
JOIN JobPostings j ON r.JobID = j.JobID
LEFT JOIN NetworkStrength ns ON r.ReferrerID = ns.CandidateID 
    AND r.ReferredCandidateID = ns.ConnectionID
LEFT JOIN ReferralPerformance rp ON r.ReferrerID = rp.ReferrerID;

CREATE VIEW vw_CandidateInterviews AS
SELECT 
    c.UserID,
    i.ScheduleID,
    j.JobTitle,
    j.Location AS JobLocation,
    u.Username AS RecruiterName,
    i.InterviewStart,
    i.InterviewEnd,
    i.CandidateConfirmed,
    CASE 
        WHEN i.InterviewStart < NOW() THEN 'Past'
        ELSE 'Upcoming'
    END AS TimeStatus
FROM InterviewSchedules i
JOIN Applications a ON i.ApplicationID = a.ApplicationID
JOIN JobPostings j ON a.JobID = j.JobID
JOIN Candidates c ON a.CandidateID = c.CandidateID
JOIN Recruiters r ON i.RecruiterID = r.RecruiterID
JOIN Users u ON r.UserID = u.UserID
WHERE a.IsDeleted = FALSE;

CREATE VIEW vw_MarketIntelligenceDashboard AS
SELECT 
    mi.SkillID,
    s.SkillName,
    mi.Location,
    mi.DemandScore,
    mi.SupplyScore,
    mi.DemandScore - mi.SupplyScore AS ImbalanceScore,
    mi.SalaryTrend,
    mi.AvgSalary,
    mi.CompetitorHiringActivity,
    mi.JobPostingsCount,
    mi.CandidateApplicationsCount,
    mi.TimeToFillDays,
    mi.LastUpdated,
    mi.Confidence,
    CASE 
        WHEN mi.DemandScore > 80 AND mi.SupplyScore < 30 THEN 'Critical Shortage'
        WHEN mi.DemandScore > mi.SupplyScore + 20 THEN 'High Demand'
        WHEN ABS(mi.DemandScore - mi.SupplyScore) < 10 THEN 'Balanced'
        WHEN mi.SupplyScore > mi.DemandScore + 20 THEN 'Oversupply'
        ELSE 'Moderate Imbalance'
    END AS MarketCondition,
    CASE 
        WHEN mi.SalaryTrend = 'Rising' AND (mi.DemandScore - mi.SupplyScore) > 15 THEN 'Salary Pressure'
        WHEN mi.SalaryTrend = 'Stable' AND ABS(mi.DemandScore - mi.SupplyScore) < 10 THEN 'Stable Market'
        WHEN mi.SalaryTrend = 'Falling' AND (mi.DemandScore - mi.SupplyScore) < -10 THEN 'Buyer''s Market'
        ELSE 'Normal Conditions'
    END AS SalaryOutlook,
    CASE 
        WHEN mi.TimeToFillDays > 60 THEN 'Very Difficult'
        WHEN mi.TimeToFillDays > 45 THEN 'Difficult'
        WHEN mi.TimeToFillDays > 30 THEN 'Moderate'
        ELSE 'Easy'
    END AS HiringDifficulty
FROM MarketIntelligence mi
JOIN Skills s ON mi.SkillID = s.SkillID
WHERE mi.LastUpdated > NOW() - INTERVAL '3 months';

CREATE VIEW vw_TimeToHire AS
SELECT
    a.ApplicationID,
    c.FullName,
    EXTRACT(DAY FROM h.ChangedAt - a.AppliedDate) AS DaysToHire
FROM Applications a
JOIN Candidates c ON a.CandidateID = c.CandidateID
JOIN ApplicationStatusHistory h ON a.ApplicationID = h.ApplicationID
WHERE h.ToStatusID = (SELECT StatusID FROM ApplicationStatus WHERE StatusName = 'Hired');

CREATE VIEW vw_AverageTimeToHire AS
SELECT AVG(DaysToHire) AS AvgDaysToHire FROM vw_TimeToHire;

CREATE VIEW vw_HireRatePerJob AS
SELECT
    j.JobID,
    j.JobTitle,
    COUNT(a.ApplicationID) AS TotalApplications,
    SUM(CASE WHEN s.StatusName = 'Hired' THEN 1 ELSE 0 END) AS Hires,
    CAST(SUM(CASE WHEN s.StatusName = 'Hired' THEN 1 ELSE 0 END) * 100.0 / 
         NULLIF(COUNT(a.ApplicationID), 0) AS DECIMAL(5,2)) AS HireRatePercent
FROM JobPostings j
LEFT JOIN Applications a ON j.JobID = a.JobID
LEFT JOIN ApplicationStatus s ON a.StatusID = s.StatusID
GROUP BY j.JobID, j.JobTitle;

CREATE VIEW vw_RecruiterPerformance AS
SELECT
    r.RecruiterID,
    u.Username AS RecruiterName,
    COUNT(DISTINCT i.ScheduleID) AS InterviewsConducted,
    SUM(CASE WHEN s.StatusName = 'Hired' THEN 1 ELSE 0 END) AS SuccessfulHires
FROM Recruiters r
JOIN Users u ON r.UserID = u.UserID
LEFT JOIN InterviewSchedules i ON r.RecruiterID = i.RecruiterID
LEFT JOIN Applications a ON i.ApplicationID = a.ApplicationID
LEFT JOIN ApplicationStatus s ON a.StatusID = s.StatusID
GROUP BY r.RecruiterID, u.Username;

CREATE VIEW vw_ApplicationFunnel AS
SELECT
    s.StatusName,
    COUNT(a.ApplicationID) AS ApplicationCount
FROM ApplicationStatus s
LEFT JOIN Applications a ON s.StatusID = a.StatusID
WHERE a.IsDeleted = FALSE OR a.ApplicationID IS NULL
GROUP BY s.StatusName;

CREATE VIEW vw_Bias_Location AS
SELECT
    c.Location,
    COUNT(a.ApplicationID) AS TotalApplicants,
    SUM(CASE WHEN s.StatusName = 'Hired' THEN 1 ELSE 0 END) AS HiredCount,
    CAST(SUM(CASE WHEN s.StatusName = 'Hired' THEN 1 ELSE 0 END) * 100.0 / 
         NULLIF(COUNT(a.ApplicationID), 0) AS DECIMAL(5,2)) AS HireRatePercent
FROM Applications a
JOIN Candidates c ON a.CandidateID = c.CandidateID
JOIN ApplicationStatus s ON a.StatusID = s.StatusID
WHERE a.IsDeleted = FALSE
GROUP BY c.Location;

CREATE VIEW vw_Bias_Experience AS
SELECT
    CASE
        WHEN c.YearsOfExperience < 2 THEN 'Junior'
        WHEN c.YearsOfExperience BETWEEN 2 AND 5 THEN 'Mid'
        ELSE 'Senior'
    END AS ExperienceGroup,
    COUNT(*) AS TotalApplicants,
    SUM(CASE WHEN s.StatusName = 'Hired' THEN 1 ELSE 0 END) AS HiredCount,
    CAST(SUM(CASE WHEN s.StatusName = 'Hired' THEN 1 ELSE 0 END) * 100.0 / 
         NULLIF(COUNT(*), 0) AS DECIMAL(5,2)) AS HireRatePercent
FROM Applications a
JOIN Candidates c ON a.CandidateID = c.CandidateID
JOIN ApplicationStatus s ON a.StatusID = s.StatusID
WHERE a.IsDeleted = FALSE
GROUP BY ExperienceGroup;

CREATE VIEW vw_InterviewScoreVsDecision AS
SELECT
    f.ApplicationID,
    c.FullName,
    AVG((f.TechnicalScore + f.CommunicationScore + f.CultureFitScore) / 3.0) AS AvgInterviewScore,
    s.StatusName AS FinalStatus
FROM InterviewFeedback f
JOIN Applications a ON f.ApplicationID = a.ApplicationID
JOIN Candidates c ON a.CandidateID = c.CandidateID
JOIN ApplicationStatus s ON a.StatusID = s.StatusID
GROUP BY f.ApplicationID, c.FullName, s.StatusName;

CREATE VIEW vw_InterviewerConsistency AS
SELECT
    f.InterviewerID,
    u.Username AS InterviewerName,
    COUNT(*) AS InterviewsTaken,
    AVG((f.TechnicalScore + f.CommunicationScore + f.CultureFitScore) / 3.0) AS AvgScoreGiven,
    STDDEV((f.TechnicalScore + f.CommunicationScore + f.CultureFitScore) / 3.0) AS ScoreVariance
FROM InterviewFeedback f
JOIN Users u ON f.InterviewerID = u.UserID
GROUP BY f.InterviewerID, u.Username;

CREATE VIEW vw_SkillGapAnalysis AS
SELECT
    s.SkillName,
    COUNT(DISTINCT js.JobID) AS JobsRequiringSkill,
    COUNT(DISTINCT cs.CandidateID) AS CandidatesWithSkill,
    COUNT(DISTINCT js.JobID) - COUNT(DISTINCT cs.CandidateID) AS SkillGap
FROM Skills s
LEFT JOIN JobSkills js ON s.SkillID = js.SkillID
LEFT JOIN CandidateSkills cs ON s.SkillID = cs.SkillID
GROUP BY s.SkillName;

CREATE VIEW vw_CandidateEngagement AS
SELECT
    c.CandidateID,
    c.FullName,
    COUNT(i.ScheduleID) AS InterviewsScheduled,
    SUM(CASE WHEN i.CandidateConfirmed THEN 1 ELSE 0 END) AS ConfirmedInterviews,
    CAST(SUM(CASE WHEN i.CandidateConfirmed THEN 1 ELSE 0 END) * 100.0 / 
         NULLIF(COUNT(i.ScheduleID), 0) AS DECIMAL(5,2)) AS EngagementRate
FROM Candidates c
LEFT JOIN Applications a ON c.CandidateID = a.CandidateID
LEFT JOIN InterviewSchedules i ON a.ApplicationID = i.ApplicationID
GROUP BY c.CandidateID, c.FullName;

CREATE VIEW vw_HiringBottlenecks AS
SELECT
    s.StatusName,
    COUNT(a.ApplicationID) AS ApplicationsInStage,
    AVG(EXTRACT(DAY FROM COALESCE(a.StatusChangedAt, NOW()) - a.AppliedDate)) AS AvgDaysInStage
FROM ApplicationStatus s
LEFT JOIN Applications a ON s.StatusID = a.StatusID
WHERE a.IsDeleted = FALSE OR a.ApplicationID IS NULL
GROUP BY s.StatusName;

CREATE VIEW vw_RejectionAnalysis AS
SELECT
    a.RejectionReason,
    COUNT(*) AS RejectionCount,
    CAST(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM Applications WHERE StatusID = 5) AS DECIMAL(5,2)) AS RejectionPercent
FROM Applications a
WHERE a.StatusID = 5
  AND a.RejectionReason IS NOT NULL
  AND a.IsDeleted = FALSE
GROUP BY a.RejectionReason;

CREATE VIEW vw_VacancyUtilization AS
SELECT
    j.JobID,
    j.JobTitle,
    j.Description,
    j.Location,
    j.MinExperience,
    j.Vacancies,
    j.IsActive,
    j.CreatedAt,
    COUNT(a.ApplicationID) AS ApplicationCount,
    SUM(CASE WHEN s.StatusName = 'Hired' THEN 1 ELSE 0 END) AS FilledPositions
FROM JobPostings j
LEFT JOIN Applications a ON j.JobID = a.JobID AND a.IsDeleted = FALSE
LEFT JOIN ApplicationStatus s ON a.StatusID = s.StatusID
WHERE j.IsDeleted = FALSE
GROUP BY j.JobID, j.JobTitle, j.Description, j.Location, j.MinExperience, j.Vacancies, j.IsActive, j.CreatedAt;

CREATE VIEW vw_SilentRejections AS
SELECT
    a.ApplicationID,
    c.FullName,
    s.StatusName,
    EXTRACT(DAY FROM NOW() - a.AppliedDate) AS DaysInactive,
    j.JobTitle
FROM Applications a
JOIN Candidates c ON a.CandidateID = c.CandidateID
JOIN ApplicationStatus s ON a.StatusID = s.StatusID
JOIN JobPostings j ON a.JobID = j.JobID
WHERE s.StatusName NOT IN ('Hired', 'Rejected', 'Withdrawn')
  AND EXTRACT(DAY FROM NOW() - a.AppliedDate) > 30
  AND a.IsDeleted = FALSE;

CREATE VIEW vw_OrganizationalCareerInsights AS
SELECT 
    cp.FromRole AS CurrentRole,
    cp.ToRole AS NextRole,
    COUNT(*) AS TransitionCount,
    AVG(cp.Probability) AS AvgProbability,
    AVG(cp.AvgTransitionMonths) AS AvgMonthsToPromote,
    AVG(cp.SalaryIncreaseAvg) AS AvgSalaryIncreasePct,
    MAX(cp.FutureProofScore) AS MaxFutureProofScore
FROM CareerPaths cp
GROUP BY cp.FromRole, cp.ToRole;

CREATE VIEW vw_DiversityAnalyticsFunnel AS
SELECT 
    dm.Ethnicity AS Demographic,
    CAST(COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM DiversityMetrics), 0) AS DECIMAL(5,2)) AS Percentage,
    COUNT(*) AS Count,
    COUNT(DISTINCT a.ApplicationID) AS TotalApplications,
    SUM(CASE WHEN a.StatusID >= 2 THEN 1 ELSE 0 END) AS Screened,
    SUM(CASE WHEN a.StatusID >= 3 THEN 1 ELSE 0 END) AS Interviewed,
    SUM(CASE WHEN a.StatusID = 4 THEN 1 ELSE 0 END) AS Hired,
    SUM(CASE WHEN a.StatusID = 5 THEN 1 ELSE 0 END) AS Rejected,
    CAST(SUM(CASE WHEN a.StatusID = 4 THEN 1 ELSE 0 END) * 100.0 / 
         NULLIF(COUNT(DISTINCT a.ApplicationID), 0) AS DECIMAL(5,2)) AS HireRate
FROM Applications a
INNER JOIN DiversityMetrics dm ON a.ApplicationID = dm.ApplicationID
WHERE a.IsDeleted = FALSE
GROUP BY dm.Ethnicity;

CREATE VIEW vw_DiversityByGender AS
SELECT 
    dm.Gender AS Demographic,
    CAST(COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM DiversityMetrics), 0) AS DECIMAL(5,2)) AS Percentage,
    COUNT(*) AS Count
FROM DiversityMetrics dm
WHERE dm.Gender IS NOT NULL
GROUP BY dm.Gender;

CREATE VIEW vw_DiversityByDisability AS
SELECT 
    CASE WHEN dm.DisabilityStatus THEN 'With Disability' ELSE 'Without Disability' END AS Demographic,
    CAST(COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM DiversityMetrics), 0) AS DECIMAL(5,2)) AS Percentage,
    COUNT(*) AS Count
FROM DiversityMetrics dm
GROUP BY dm.DisabilityStatus;

CREATE VIEW vw_DiversityByVeteran AS
SELECT 
    CASE WHEN dm.VeteranStatus THEN 'Veteran' ELSE 'Non-Veteran' END AS Demographic,
    CAST(COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM DiversityMetrics), 0) AS DECIMAL(5,2)) AS Percentage,
    COUNT(*) AS Count
FROM DiversityMetrics dm
GROUP BY dm.VeteranStatus;

-- =====================================================
-- FUNCTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION fn_LocationMatch(
    CandidateLocation VARCHAR(100),
    JobLocation VARCHAR(100),
    CandidatePreferences TEXT DEFAULT NULL
)
RETURNS TABLE (MatchScore DOUBLE PRECISION) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE
            WHEN CandidateLocation = JobLocation THEN 1.0
            WHEN CandidateLocation LIKE '%' || JobLocation || '%' 
              OR JobLocation LIKE '%' || CandidateLocation || '%' THEN 0.7
            WHEN CandidatePreferences IS NOT NULL 
             AND position(JobLocation in CandidatePreferences) > 0 THEN 0.8
            WHEN JobLocation = 'Remote' THEN 0.9
            ELSE 0.3
        END;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- STORED PROCEDURES
-- =====================================================

-- sp_AdvancedCandidateMatchingEnhanced
CREATE OR REPLACE PROCEDURE sp_AdvancedCandidateMatchingEnhanced(
    p_JobID INT,
    p_TopN INT DEFAULT 10
)
LANGUAGE plpgsql
AS $$
BEGIN
    CREATE TEMP TABLE CandidateScores AS
    WITH CandidateScores AS (
        SELECT 
            c.CandidateID,
            c.FullName,
            c.YearsOfExperience,
            c.Location AS CandidateLocation,
            EXISTS (
                SELECT 1 FROM Applications a 
                WHERE a.CandidateID = c.CandidateID 
                AND a.JobID = p_JobID 
                AND a.IsDeleted = FALSE
            ) AS HasApplied,
            CAST((
                SELECT AVG(
                    CASE 
                        WHEN cs.ProficiencyLevel >= js.MinProficiency THEN 1.0
                        ELSE cs.ProficiencyLevel::float / NULLIF(js.MinProficiency, 1)
                    END
                ) * 40
                FROM JobSkills js
                LEFT JOIN CandidateSkills cs ON js.SkillID = cs.SkillID AND cs.CandidateID = c.CandidateID
                WHERE js.JobID = p_JobID
            ) AS DECIMAL(5,2)) AS TechnicalScore,
            CAST(
                CASE 
                    WHEN c.YearsOfExperience >= j.MinExperience THEN 25
                    ELSE (c.YearsOfExperience * 25.0 / NULLIF(j.MinExperience, 1))
                END AS DECIMAL(5,2)) AS ExperienceScore,
            CAST(
                COALESCE((
                    SELECT AVG((f.TechnicalScore + f.CommunicationScore + f.CultureFitScore) / 30.0 * 20)
                    FROM InterviewFeedback f
                    JOIN Applications a ON f.ApplicationID = a.ApplicationID
                    WHERE a.CandidateID = c.CandidateID
                ), 10) AS DECIMAL(5,2)) AS BehavioralScore,
            CAST(
                COALESCE((
                    SELECT 
                        CASE 
                            WHEN AVG(EXTRACT(EPOCH FROM (cl.RespondedAt - cl.SentAt))/3600) < 24 THEN 10
                            WHEN AVG(EXTRACT(EPOCH FROM (cl.RespondedAt - cl.SentAt))/3600) < 48 THEN 7
                            ELSE 3
                        END
                    FROM CommunicationLogs cl
                    WHERE cl.ReceiverID = c.UserID
                ), 5) AS DECIMAL(5,2)) AS EngagementScore,
            CAST(
                CASE 
                    WHEN c.Location = j.Location THEN 5
                    WHEN c.Location LIKE '%' || j.Location || '%' THEN 4
                    ELSE 2
                END AS DECIMAL(5,2)) AS LocationScore
        FROM Candidates c
        CROSS JOIN (SELECT Location, MinExperience FROM JobPostings WHERE JobID = p_JobID) j
        WHERE EXISTS (
            SELECT 1 FROM CandidateSkills cs
            WHERE cs.CandidateID = c.CandidateID
              AND cs.SkillID IN (SELECT SkillID FROM JobSkills WHERE JobID = p_JobID AND IsMandatory)
        )
    )
    SELECT 
        *,
        TechnicalScore + ExperienceScore + BehavioralScore + EngagementScore + LocationScore AS TotalMatchScore,
        ROW_NUMBER() OVER (ORDER BY TechnicalScore + ExperienceScore + BehavioralScore + EngagementScore + LocationScore DESC) AS Rank
    FROM CandidateScores;

    SELECT 
        rc.CandidateID,
        rc.FullName,
        rc.YearsOfExperience,
        rc.CandidateLocation,
        rc.TechnicalScore,
        rc.ExperienceScore,
        rc.BehavioralScore,
        rc.EngagementScore,
        rc.LocationScore,
        rc.TotalMatchScore,
        rc.Rank,
        rc.HasApplied,
        CASE 
            WHEN rc.TotalMatchScore >= 85 THEN 'Excellent Match'
            WHEN rc.TotalMatchScore >= 70 THEN 'Good Match'
            WHEN rc.TotalMatchScore >= 55 THEN 'Moderate Match'
            ELSE 'Basic Match'
        END AS MatchCategory,
        CASE 
            WHEN rc.TotalMatchScore >= 85 THEN 'Strong candidate - prioritize for interview'
            WHEN rc.TotalMatchScore >= 70 THEN 'Good candidate - schedule interview'
            WHEN rc.TotalMatchScore >= 55 THEN 'Consider for screening'
            ELSE 'Review for specific strengths'
        END AS RecommendedAction,
        (
            SELECT string_agg(s.SkillName || ' (Lvl ' || cs.ProficiencyLevel::TEXT || ')', ', ')
            FROM CandidateSkills cs
            JOIN Skills s ON cs.SkillID = s.SkillID
            WHERE cs.CandidateID = rc.CandidateID
              AND cs.SkillID IN (SELECT SkillID FROM JobSkills WHERE JobID = p_JobID)
        ) AS SkillSummary
    FROM CandidateScores rc
    ORDER BY rc.TotalMatchScore DESC
    LIMIT p_TopN;

    DROP TABLE CandidateScores;
END;
$$;

-- sp_AnalyzeCandidateSentiment
CREATE OR REPLACE PROCEDURE sp_AnalyzeCandidateSentiment(
    p_CandidateID INT,
    p_InteractionType VARCHAR(50),
    p_RawText TEXT,
    p_InteractionDate TIMESTAMP DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_SentimentScore DECIMAL(3,2) := 0;
    v_Confidence DECIMAL(3,2) := 0.5;
    v_CommunicationStyle VARCHAR(50) := 'Casual';
    v_RedFlagsDetected INT := 0;
    v_PositiveIndicators INT := 0;
    v_KeyTopics TEXT := NULL;
    v_EmotionBreakdown TEXT;
    v_InteractionDate TIMESTAMP;
BEGIN
    -- Validate InteractionType
    IF p_InteractionType NOT IN ('Email', 'Interview', 'Call', 'Chat', 'Application') THEN
        RAISE EXCEPTION 'Invalid InteractionType. Must be: Email, Interview, Call, Chat, or Application.';
    END IF;

    -- Validate CandidateID exists
    IF NOT EXISTS (SELECT 1 FROM Candidates WHERE CandidateID = p_CandidateID) THEN
        RAISE EXCEPTION 'Candidate not found.';
    END IF;

    -- Calculate sentiment using stub function
    BEGIN
        SELECT CalculateSentiment(p_RawText) INTO v_SentimentScore;
        IF LENGTH(p_RawText) > 100 THEN
            v_Confidence := 0.8;
        ELSIF LENGTH(p_RawText) > 50 THEN
            v_Confidence := 0.6;
        ELSE
            v_Confidence := 0.4;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        v_SentimentScore := 0;
        v_Confidence := 0.3;
    END;

    -- Detect communication style
    IF p_RawText ~* 'sir|madam|respectfully|sincerely' THEN
        v_CommunicationStyle := 'Formal';
    ELSIF p_RawText ~* 'hey|thanks|cheers|cool' THEN
        v_CommunicationStyle := 'Casual';
    ELSIF p_RawText ~* 'implementation|architecture|algorithm|framework' THEN
        v_CommunicationStyle := 'Technical';
    ELSIF p_RawText ~* 'excited|amazing|love|fantastic' THEN
        v_CommunicationStyle := 'Enthusiastic';
    ELSIF p_RawText ~* 'perhaps|maybe|might|consider' THEN
        v_CommunicationStyle := 'Reserved';
    END IF;

    -- Count red flags
    SELECT 
        (CASE WHEN p_RawText ~* 'unhappy|disappointed|frustrated' THEN 1 ELSE 0 END) +
        (CASE WHEN p_RawText ~* 'complaint|issue|problem' THEN 1 ELSE 0 END) +
        (CASE WHEN p_RawText ~* 'leave|quit|resign' THEN 1 ELSE 0 END) +
        (CASE WHEN p_RawText ~* 'unfair|wrong|terrible' THEN 1 ELSE 0 END)
    INTO v_RedFlagsDetected;

    -- Count positive indicators
    SELECT 
        (CASE WHEN p_RawText ~* 'excited|happy|thrilled' THEN 1 ELSE 0 END) +
        (CASE WHEN p_RawText ~* 'opportunity|growth|learn' THEN 1 ELSE 0 END) +
        (CASE WHEN p_RawText ~* 'team|collaborate|contribute' THEN 1 ELSE 0 END) +
        (CASE WHEN p_RawText ~* 'thank|appreciate|grateful' THEN 1 ELSE 0 END)
    INTO v_PositiveIndicators;

    -- Build emotion breakdown JSON
    v_EmotionBreakdown := format('{"joy": %s, "neutral": %s, "frustration": %s, "enthusiasm": %s}',
        CASE WHEN v_SentimentScore > 0.3 THEN 0.6 ELSE 0.2 END,
        CASE WHEN v_SentimentScore BETWEEN -0.2 AND 0.2 THEN 0.7 ELSE 0.3 END,
        CASE WHEN v_SentimentScore < -0.3 THEN 0.5 ELSE 0.1 END,
        CASE WHEN v_SentimentScore > 0.5 THEN 0.7 ELSE 0.2 END
    );

    -- Set interaction date
    v_InteractionDate := COALESCE(p_InteractionDate, NOW());

    -- Insert sentiment record
    INSERT INTO CandidateSentiment (
        CandidateID,
        InteractionType,
        InteractionDate,
        SentimentScore,
        Confidence,
        KeyTopics,
        EmotionBreakdown,
        CommunicationStyle,
        RedFlagsDetected,
        PositiveIndicators,
        AnalysisMethod,
        RawText,
        AnalysisDate
    ) VALUES (
        p_CandidateID,
        p_InteractionType,
        v_InteractionDate,
        v_SentimentScore,
        v_Confidence,
        v_KeyTopics,
        v_EmotionBreakdown,
        v_CommunicationStyle,
        v_RedFlagsDetected,
        v_PositiveIndicators,
        'RulesBased',
        p_RawText,
        NOW()
    );

    -- Return the inserted record
    SELECT 
        SentimentID,
        CandidateID,
        InteractionType,
        InteractionDate,
        SentimentScore,
        Confidence,
        CommunicationStyle,
        RedFlagsDetected,
        PositiveIndicators,
        AnalysisMethod
    FROM CandidateSentiment
    WHERE SentimentID = lastval();
END;
$$;

-- sp_AnalyzeRemoteCompatibility
CREATE OR REPLACE PROCEDURE sp_AnalyzeRemoteCompatibility(
    p_CandidateID INT,
    p_JobID INT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_CandidateScore DECIMAL(3,2);
    v_CompanyScore INT;
    v_TimezoneOverlap DECIMAL(4,2);
    v_OptimalOverlap DECIMAL(4,2) := 4.0;
    v_CandidateLocation VARCHAR(100);
    v_CompanyLocation VARCHAR(100);
    v_WorkspaceQuality INT;
    v_SelfMotivation INT;
    v_CompatibilityScore DECIMAL(5,2);
BEGIN
    SELECT rc.OverallRemoteScore, rc.WorkspaceQuality, rc.SelfMotivationScore, c.Location
    INTO v_CandidateScore, v_WorkspaceQuality, v_SelfMotivation, v_CandidateLocation
    FROM RemoteCompatibility rc
    JOIN Candidates c ON rc.CandidateID = c.CandidateID
    WHERE rc.CandidateID = p_CandidateID;

    SELECT j.Location INTO v_CompanyLocation
    FROM JobPostings j
    WHERE j.JobID = p_JobID;

    SELECT crp.RemoteOnboardingScore INTO v_CompanyScore
    FROM CompanyRemotePolicy crp
    JOIN JobPostings j ON crp.RecruiterID = j.CreatedBy
    WHERE j.JobID = p_JobID;

    v_TimezoneOverlap := CASE 
        WHEN v_CandidateLocation = v_CompanyLocation THEN 8.0
        WHEN v_CandidateLocation LIKE '%Dhaka%' AND v_CompanyLocation LIKE '%Dhaka%' THEN 8.0
        WHEN v_CandidateLocation LIKE '%Chittagong%' AND v_CompanyLocation LIKE '%Dhaka%' THEN 8.0
        ELSE 2.0
    END;

    v_CompatibilityScore := (
        COALESCE(v_CandidateScore, 5.0) * 0.4 +
        COALESCE(v_CompanyScore, 5.0) * 0.3 +
        CASE 
            WHEN v_TimezoneOverlap >= v_OptimalOverlap THEN 9.0
            WHEN v_TimezoneOverlap >= v_OptimalOverlap * 0.5 THEN 6.0
            ELSE 3.0
        END * 0.2 +
        CASE 
            WHEN v_WorkspaceQuality >= 4 THEN 8.0
            WHEN v_WorkspaceQuality >= 3 THEN 5.0
            ELSE 2.0
        END * 0.1
    );

    SELECT 
        v_CompatibilityScore AS RemoteCompatibilityScore,
        COALESCE(v_CandidateScore, 5.0) AS CandidateRemoteReadiness,
        COALESCE(v_CompanyScore, 5.0) AS CompanyRemoteMaturity,
        v_TimezoneOverlap AS TimezoneOverlapHours,
        v_OptimalOverlap AS OptimalOverlapHours,
        COALESCE(v_WorkspaceQuality, 3) AS WorkspaceQualityScore,
        COALESCE(v_SelfMotivation, 5) AS SelfMotivationScore,
        CASE 
            WHEN v_CompatibilityScore >= 7.5 THEN 'Excellent remote fit'
            WHEN v_CompatibilityScore >= 6.0 THEN 'Good remote fit'
            WHEN v_CompatibilityScore >= 4.5 THEN 'Moderate remote fit'
            ELSE 'Poor remote fit - needs support'
        END AS CompatibilityAssessment,
        CASE 
            WHEN v_TimezoneOverlap < v_OptimalOverlap THEN 'Consider flexible hours or async work arrangements'
            WHEN v_WorkspaceQuality < 3 THEN 'Recommend home office stipend or co-working space'
            WHEN v_CompanyScore IS NULL OR v_CompanyScore < 5 THEN 'Company may need to improve remote onboarding'
            ELSE 'No major concerns detected'
        END AS Recommendations,
        CASE 
            WHEN v_CompatibilityScore >= 7.5 THEN 'High probability of remote success (>80%)'
            WHEN v_CompatibilityScore >= 6.0 THEN 'Good probability of remote success (60-80%)'
            WHEN v_CompatibilityScore >= 4.5 THEN 'Moderate probability (40-60%)'
            ELSE 'High risk of remote failure (<40%)'
        END AS SuccessPrediction;
END;
$$;

-- sp_AnonymizeArchivedCandidates
CREATE OR REPLACE PROCEDURE sp_AnonymizeArchivedCandidates()
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE Candidates
    SET FullName = 'Candidate_' || CandidateID,
        Location = 'Anonymized'
    WHERE CandidateID IN (
        SELECT DISTINCT CandidateID
        FROM ApplicationsArchive
    );

    UPDATE Users
    SET Email = 'anonymized_' || UserID || '@archived.local'
    WHERE UserID IN (
        SELECT DISTINCT c.UserID
        FROM Candidates c
        WHERE c.CandidateID IN (
            SELECT DISTINCT CandidateID
            FROM ApplicationsArchive
        )
    );
END;
$$;

-- sp_ArchiveOldData
CREATE OR REPLACE PROCEDURE sp_ArchiveOldData()
LANGUAGE plpgsql
AS $$
BEGIN
    -- 1. ARCHIVE JOB POSTINGS
    INSERT INTO JobPostingsArchive (JobID, JobTitle, Description, Location, Vacancies, CreatedAt)
    SELECT JobID, JobTitle, Description, Location, Vacancies, CreatedAt
    FROM JobPostings
    WHERE (CreatedAt < NOW() - INTERVAL '6 months' OR IsDeleted)
      AND JobID NOT IN (SELECT JobID FROM JobPostingsArchive);

    -- 2. ARCHIVE APPLICATIONS ATTACHED TO ARCHIVED JOBS
    INSERT INTO ApplicationsArchive (ApplicationID, CandidateID, JobID, StatusID, AppliedDate)
    SELECT ApplicationID, CandidateID, JobID, StatusID, AppliedDate
    FROM Applications
    WHERE JobID IN (SELECT JobID FROM JobPostingsArchive)
      AND ApplicationID NOT IN (SELECT ApplicationID FROM ApplicationsArchive);

    -- 3. ARCHIVE OLD REJECTED APPLICATIONS
    INSERT INTO ApplicationsArchive (ApplicationID, CandidateID, JobID, StatusID, AppliedDate)
    SELECT ApplicationID, CandidateID, JobID, StatusID, AppliedDate
    FROM Applications
    WHERE StatusID = 5
      AND AppliedDate < NOW() - INTERVAL '1 year'
      AND ApplicationID NOT IN (SELECT ApplicationID FROM ApplicationsArchive);

    -- 4. CLEAN UP / SOFT DELETE
    UPDATE JobPostings
    SET IsDeleted = TRUE, IsActive = FALSE
    WHERE JobID IN (SELECT JobID FROM JobPostingsArchive);

    UPDATE Applications
    SET IsDeleted = TRUE
    WHERE ApplicationID IN (SELECT ApplicationID FROM ApplicationsArchive);

    RAISE NOTICE 'Archival process completed successfully.';
END;
$$;

-- sp_AuditCandidateEmails
CREATE OR REPLACE PROCEDURE sp_AuditCandidateEmails()
LANGUAGE plpgsql
AS $$
BEGIN
    SELECT
        c.CandidateID,
        c.FullName,
        u.Email,
        ValidateEmail(u.Email) AS IsValidFormat,
        IsDisposableEmail(u.Email) AS IsDisposable,
        ExtractEmailDomain(u.Email) AS Domain,
        CASE 
            WHEN NOT ValidateEmail(u.Email) THEN 'Invalid Format'
            WHEN IsDisposableEmail(u.Email) THEN 'Disposable Provider'
            ELSE 'OK'
        END AS Status
    FROM Candidates c
    JOIN Users u ON c.UserID = u.UserID
    WHERE NOT ValidateEmail(u.Email) OR IsDisposableEmail(u.Email)
    ORDER BY IsValidFormat, IsDisposable DESC;
END;
$$;

-- sp_AutoRejectUnqualified
CREATE OR REPLACE PROCEDURE sp_AutoRejectUnqualified()
LANGUAGE plpgsql
AS $$
DECLARE
    v_RejectedStatusID INT;
BEGIN
    SELECT StatusID INTO v_RejectedStatusID 
    FROM ApplicationStatus 
    WHERE StatusName = 'Rejected';

    UPDATE Applications
    SET StatusID = v_RejectedStatusID,
        RejectionReason = 'Auto-Rejected: Does not meet minimum experience requirement.',
        StatusChangedAt = NOW()
    WHERE ApplicationID IN (
        SELECT a.ApplicationID
        FROM Applications a
        JOIN Candidates c ON a.CandidateID = c.CandidateID
        JOIN JobPostings j ON a.JobID = j.JobID
        WHERE c.YearsOfExperience < j.MinExperience
          AND a.StatusID = 1
    );
END;
$$;

-- sp_AutoScreenApplicationEnhanced
CREATE OR REPLACE PROCEDURE sp_AutoScreenApplicationEnhanced(
    p_ApplicationID INT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_Score DECIMAL(5,2) := 0;
    v_MaxScore DECIMAL(5,2) := 100;
    v_Criteria JSONB := '{}';
    v_CandidateID INT;
    v_JobID INT;
    v_ExperienceScore DECIMAL(5,2);
    v_SkillsScore DECIMAL(5,2);
    v_LocationScore DECIMAL(5,2);
    v_ResumeScore DECIMAL(5,2) := 10;
    v_Decision VARCHAR(20);
    v_Confidence DECIMAL(3,2);
BEGIN
    SELECT a.CandidateID, a.JobID INTO v_CandidateID, v_JobID
    FROM Applications a WHERE a.ApplicationID = p_ApplicationID;

    SELECT 
        CASE 
            WHEN c.YearsOfExperience >= j.MinExperience THEN 25
            WHEN c.YearsOfExperience >= j.MinExperience * 0.7 THEN 20
            WHEN c.YearsOfExperience >= j.MinExperience * 0.5 THEN 15
            ELSE 10
        END INTO v_ExperienceScore
    FROM Applications a
    JOIN Candidates c ON a.CandidateID = c.CandidateID
    JOIN JobPostings j ON a.JobID = j.JobID
    WHERE a.ApplicationID = p_ApplicationID;

    v_Score := v_Score + v_ExperienceScore;
    v_Criteria := jsonb_set(v_Criteria, '{experienceScore}', to_jsonb(v_ExperienceScore));

    SELECT 
        COUNT(CASE WHEN cs.ProficiencyLevel >= js.MinProficiency THEN 1 END) * 40.0 / 
             NULLIF(SUM(CASE WHEN js.IsMandatory THEN 1 ELSE 0 END), 0) INTO v_SkillsScore
    FROM JobSkills js
    LEFT JOIN CandidateSkills cs ON js.SkillID = cs.SkillID AND cs.CandidateID = v_CandidateID
    WHERE js.JobID = v_JobID AND js.IsMandatory;

    v_Score := v_Score + COALESCE(v_SkillsScore, 0);
    v_Criteria := jsonb_set(v_Criteria, '{skillsScore}', to_jsonb(COALESCE(v_SkillsScore, 0)));

    SELECT 
        CASE 
            WHEN c.Location = j.Location THEN 20
            WHEN c.Location LIKE '%' || j.Location || '%' THEN 15
            ELSE 10
        END INTO v_LocationScore
    FROM Applications a
    JOIN Candidates c ON a.CandidateID = c.CandidateID
    JOIN JobPostings j ON a.JobID = j.JobID
    WHERE a.ApplicationID = p_ApplicationID;

    v_Score := v_Score + v_LocationScore;
    v_Criteria := jsonb_set(v_Criteria, '{locationScore}', to_jsonb(v_LocationScore));

    -- Resume score if available
    SELECT 
        CASE 
            WHEN ri.ResumeQualityScore >= 80 THEN 15
            WHEN ri.ResumeQualityScore >= 60 THEN 12
            ELSE 8
        END INTO v_ResumeScore
    FROM ResumeInsights ri
    WHERE ri.CandidateID = v_CandidateID
        AND ri.ProcessingStatus = 'Completed'
    LIMIT 1;

    v_Score := v_Score + v_ResumeScore;
    v_Criteria := jsonb_set(v_Criteria, '{resumeScore}', to_jsonb(v_ResumeScore));

    v_Confidence := v_Score / v_MaxScore;
    v_Decision := CASE 
        WHEN v_Score >= 70 THEN 'Pass'
        WHEN v_Score >= 50 THEN 'Maybe'
        WHEN v_Score >= 30 THEN 'ManualReview'
        ELSE 'Fail'
    END;

    INSERT INTO ScreeningBotDecisions (ApplicationID, Decision, Confidence, Score, CriteriaEvaluated)
    VALUES (p_ApplicationID, v_Decision, v_Confidence, v_Score, v_Criteria::TEXT);

    SELECT 
        v_Decision AS Decision,
        v_Confidence AS Confidence,
        v_Score AS Score,
        v_MaxScore AS MaxScore,
        v_Criteria::TEXT AS CriteriaEvaluated,
        CASE v_Decision
            WHEN 'Pass' THEN 'Candidate meets most requirements'
            WHEN 'Maybe' THEN 'Candidate meets some requirements, review recommended'
            WHEN 'ManualReview' THEN 'Requires human evaluation'
            ELSE 'Candidate does not meet minimum requirements'
        END AS DecisionExplanation;
END;
$$;

-- sp_AwardGamificationPoints
CREATE OR REPLACE PROCEDURE sp_AwardGamificationPoints(
    p_CandidateID INT,
    p_ActionType VARCHAR(50)
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_PointsToAdd INT;
    v_BadgeEligible VARCHAR(100);
    v_CanAward BOOLEAN := TRUE;
    v_MaxDaily INT;
BEGIN
    SELECT PointsAwarded, BadgeEligible, MaxDaily
    INTO v_PointsToAdd, v_BadgeEligible, v_MaxDaily
    FROM GamificationActions
    WHERE ActionType = p_ActionType AND IsActive;

    IF v_PointsToAdd IS NULL THEN
        RAISE EXCEPTION 'Invalid action type or action is not active.';
    END IF;

    -- Check daily limit if applicable
    IF v_MaxDaily IS NOT NULL THEN
        SELECT COUNT(*) < v_MaxDaily INTO v_CanAward
        FROM CandidateGamification
        WHERE CandidateID = p_CandidateID
          AND LastActivityDate::DATE = CURRENT_DATE;
    END IF;

    IF v_CanAward THEN
        INSERT INTO CandidateGamification (CandidateID)
        VALUES (p_CandidateID)
        ON CONFLICT (CandidateID) DO NOTHING;

        UPDATE CandidateGamification
        SET 
            Points = Points + v_PointsToAdd,
            Level = CASE 
                WHEN Points + v_PointsToAdd >= 1000 THEN 5
                WHEN Points + v_PointsToAdd >= 500 THEN 4
                WHEN Points + v_PointsToAdd >= 250 THEN 3
                WHEN Points + v_PointsToAdd >= 100 THEN 2
                ELSE 1
            END,
            LastActivityDate = NOW(),
            UpdatedAt = NOW(),
            StreakDays = CASE 
                WHEN EXTRACT(DAY FROM NOW() - LastActivityDate) <= 1 THEN StreakDays + 1
                ELSE 1
            END
        WHERE CandidateID = p_CandidateID;

        IF v_BadgeEligible IS NOT NULL THEN
            UPDATE CandidateGamification
            SET Badges = 
                CASE 
                    WHEN Badges IS NULL OR Badges = '[]' THEN to_jsonb(ARRAY[v_BadgeEligible])::TEXT
                    ELSE (Badges::jsonb || to_jsonb(ARRAY[v_BadgeEligible]))::TEXT
                END
            WHERE CandidateID = p_CandidateID
              AND NOT (Badges::jsonb ? v_BadgeEligible);
        END IF;

        UPDATE CandidateGamification
        SET EngagementScore = 
            CASE 
                WHEN Points >= 500 THEN 90
                WHEN Points >= 250 THEN 80
                WHEN Points >= 100 THEN 70
                WHEN Points >= 50 THEN 60
                ELSE 50
            END
        WHERE CandidateID = p_CandidateID;
    END IF;

    SELECT 
        Points,
        Level,
        StreakDays,
        EngagementScore,
        Badges,
        v_PointsToAdd AS PointsAwarded,
        v_BadgeEligible AS BadgeAwarded
    FROM CandidateGamification
    WHERE CandidateID = p_CandidateID;
END;
$$;

-- sp_CheckConsentExpiry
CREATE OR REPLACE PROCEDURE sp_CheckConsentExpiry()
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE ConsentManagement
    SET ExpiryDate = NOW() + INTERVAL '30 days'
    WHERE GivenAt < NOW() - INTERVAL '1 year'
      AND ExpiryDate IS NULL
      AND RevokedAt IS NULL;

    UPDATE ConsentManagement
    SET RevokedAt = NOW()
    WHERE ExpiryDate < NOW()
      AND RevokedAt IS NULL;

    RAISE NOTICE 'Consent expiry check completed.';
END;
$$;

-- sp_ConfirmInterview
CREATE OR REPLACE PROCEDURE sp_ConfirmInterview(
    p_ScheduleID INT,
    p_UserID INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM InterviewSchedules i
        JOIN Applications a ON i.ApplicationID = a.ApplicationID
        JOIN Candidates c ON a.CandidateID = c.CandidateID
        WHERE i.ScheduleID = p_ScheduleID AND c.UserID = p_UserID
    ) THEN
        UPDATE InterviewSchedules
        SET CandidateConfirmed = TRUE
        WHERE ScheduleID = p_ScheduleID;

        RAISE NOTICE 'Interview confirmed.';
    ELSE
        RAISE EXCEPTION 'Unauthorized: This interview does not belong to your account.';
    END IF;
END;
$$;

-- sp_FuzzySearchCandidates
CREATE OR REPLACE PROCEDURE sp_FuzzySearchCandidates(
    p_SearchName TEXT,
    p_Threshold FLOAT DEFAULT 0.85
)
LANGUAGE plpgsql
AS $$
BEGIN
    SELECT 
        CandidateID,
        FullName,
        JaroWinklerSimilarity(FullName, p_SearchName) AS JWScore,
        LevenshteinDistance(FullName, p_SearchName) AS LevenDistance
    FROM Candidates
    WHERE JaroWinklerSimilarity(FullName, p_SearchName) >= p_Threshold
    ORDER BY JWScore DESC, LevenDistance ASC;
END;
$$;

-- sp_GenerateInterviewPrep
CREATE OR REPLACE PROCEDURE sp_GenerateInterviewPrep(
    p_JobID INT,
    p_CandidateID INT DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_JobTitle VARCHAR(150);
    v_Location VARCHAR(100);
    v_PrepMaterials JSONB;
BEGIN
    SELECT JobTitle, Location INTO v_JobTitle, v_Location
    FROM JobPostings WHERE JobID = p_JobID;

    v_PrepMaterials := (
        SELECT jsonb_agg(jsonb_build_object(
            'Category', 'Technical Preparation',
            'SkillName', s.SkillName,
            'ResourceType', 'Study Resources',
            'FocusArea', 'Focus on: ' || s.SkillName || ' concepts and practical applications',
            'ExpectedDepth', 'Level ' || js.MinProficiency || '/10',
            'RecommendedTime', (js.MinProficiency * 30) || ' minutes'
        ))
        FROM JobSkills js
        JOIN Skills s ON js.SkillID = s.SkillID
        WHERE js.JobID = p_JobID AND js.IsMandatory
        ORDER BY js.IsMandatory DESC, js.MinProficiency DESC
    );

    v_PrepMaterials := v_PrepMaterials || jsonb_build_object(
        'Category', 'Behavioral Preparation',
        'SkillName', 'Communication',
        'ResourceType', 'Mock Interviews',
        'FocusArea', 'Common behavioral questions and STAR method responses',
        'ExpectedDepth', 'Comprehensive',
        'RecommendedTime', '60 minutes'
    );

    v_PrepMaterials := v_PrepMaterials || jsonb_build_object(
        'Category', 'Company Research',
        'SkillName', 'Industry Knowledge',
        'ResourceType', 'Company Info',
        'FocusArea', 'Company culture, recent news, products/services',
        'ExpectedDepth', 'Basic Understanding',
        'RecommendedTime', '45 minutes'
    );

    IF p_CandidateID IS NOT NULL THEN
        DECLARE
            v_CandidateSkills TEXT;
        BEGIN
            SELECT string_agg(s.SkillName, ', ')
            INTO v_CandidateSkills
            FROM CandidateSkills cs
            JOIN Skills s ON cs.SkillID = s.SkillID
            WHERE cs.CandidateID = p_CandidateID AND cs.ProficiencyLevel >= 7;

            IF v_CandidateSkills IS NOT NULL THEN
                v_PrepMaterials := v_PrepMaterials || jsonb_build_object(
                    'Category', 'Personalized Tips',
                    'SkillName', 'Your Strengths',
                    'ResourceType', 'Leverage Points',
                    'FocusArea', 'Highlight your expertise in: ' || v_CandidateSkills,
                    'ExpectedDepth', 'Confident Presentation',
                    'RecommendedTime', '30 minutes'
                );
            END IF;
        END;
    END IF;

    SELECT 
        v_JobTitle AS JobTitle,
        v_Location AS Location,
        v_PrepMaterials::TEXT AS InterviewPreparation,
        'Total estimated preparation time: 3-4 hours over 1-2 days' AS OverallGuidance,
        'Day 1: Technical review | Day 2: Behavioral practice & company research' AS SuggestedSchedule;
END;
$$;

-- sp_GenerateInterviewQuestions
CREATE OR REPLACE PROCEDURE sp_GenerateInterviewQuestions(
    p_JobID INT,
    p_QuestionCount INT DEFAULT 10,
    p_DifficultyLevel INT DEFAULT 5
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Technical questions
    SELECT 
        'Technical' AS QuestionType,
        s.SkillName,
        'Explain your experience with ' || s.SkillName || ' and provide an example project.' AS QuestionText,
        jsonb_build_array('experience', 'project', 'implementation', 'challenge')::TEXT AS ExpectedKeywords,
        'Assess depth of knowledge, practical application, problem-solving' AS ScoringGuide,
        p_DifficultyLevel AS DifficultyLevel,
        CASE WHEN js.IsMandatory THEN 'High Priority' ELSE 'Medium Priority' END AS Priority
    FROM JobSkills js
    JOIN Skills s ON js.SkillID = s.SkillID
    WHERE js.JobID = p_JobID AND js.IsMandatory
    ORDER BY random()
    LIMIT p_QuestionCount;

    -- Behavioral question
    SELECT 
        'Behavioral' AS QuestionType,
        'General' AS SkillName,
        'Tell me about a time you faced a significant challenge at work and how you overcame it.' AS QuestionText,
        jsonb_build_array('challenge', 'action', 'result', 'learning')::TEXT AS ExpectedKeywords,
        'Assess problem-solving, resilience, learning ability' AS ScoringGuide,
        p_DifficultyLevel AS DifficultyLevel,
        'Standard' AS Priority;

    -- Cultural question
    SELECT 
        'Cultural' AS QuestionType,
        'Teamwork' AS SkillName,
        'Describe your ideal work environment and team dynamics.' AS QuestionText,
        jsonb_build_array('collaboration', 'communication', 'values', 'environment')::TEXT AS ExpectedKeywords,
        'Assess cultural fit, team compatibility, work preferences' AS ScoringGuide,
        p_DifficultyLevel AS DifficultyLevel,
        'Standard' AS Priority;
END;
$$;

-- sp_GenerateLearningPath
CREATE OR REPLACE PROCEDURE sp_GenerateLearningPath(
    p_CandidateID INT,
    p_TargetJobID INT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_ExistingPathID INT;
    v_TotalRequiredSkills INT;
    v_MatchedSkills INT;
    v_ReadinessScore INT;
    v_SkillsGap JSONB;
    v_RecommendedResources JSONB;
BEGIN
    SELECT PathID INTO v_ExistingPathID 
    FROM PersonalizedLearningPaths 
    WHERE CandidateID = p_CandidateID AND GoalJobID = p_TargetJobID AND IsActive;

    SELECT COUNT(*) INTO v_TotalRequiredSkills
    FROM JobSkills 
    WHERE JobID = p_TargetJobID;

    SELECT COUNT(DISTINCT js.SkillID) INTO v_MatchedSkills
    FROM JobSkills js
    INNER JOIN CandidateSkills cs ON js.SkillID = cs.SkillID 
        AND cs.CandidateID = p_CandidateID
        AND cs.ProficiencyLevel >= js.MinProficiency
    WHERE js.JobID = p_TargetJobID;

    IF v_TotalRequiredSkills > 0 THEN
        v_ReadinessScore := CAST((v_MatchedSkills * 100.0 / v_TotalRequiredSkills) AS INT);
    ELSE
        v_ReadinessScore := 0;
    END IF;

    -- Build skills gap analysis
    SELECT jsonb_agg(jsonb_build_object(
        'SkillID', s.SkillID,
        'SkillName', s.SkillName,
        'RequiredLevel', js.MinProficiency,
        'CurrentLevel', COALESCE(cs.ProficiencyLevel, 0),
        'Gap', js.MinProficiency - COALESCE(cs.ProficiencyLevel, 0),
        'Priority', CASE 
            WHEN js.IsMandatory AND COALESCE(cs.ProficiencyLevel, 0) < js.MinProficiency THEN 'High'
            WHEN js.IsMandatory THEN 'Medium'
            ELSE 'Low'
        END
    ))
    INTO v_SkillsGap
    FROM JobSkills js
    INNER JOIN Skills s ON js.SkillID = s.SkillID
    LEFT JOIN CandidateSkills cs ON js.SkillID = cs.SkillID AND cs.CandidateID = p_CandidateID
    WHERE js.JobID = p_TargetJobID
        AND (cs.SkillID IS NULL OR cs.ProficiencyLevel < js.MinProficiency)
    ORDER BY 
        CASE WHEN js.IsMandatory THEN 0 ELSE 1 END,
        (js.MinProficiency - COALESCE(cs.ProficiencyLevel, 0)) DESC;

    IF v_SkillsGap IS NULL THEN
        v_SkillsGap := '[]'::JSONB;
    END IF;

    -- Build recommended resources
    SELECT jsonb_agg(jsonb_build_object(
        'SkillName', s.SkillName,
        'ResourceType', 'Online Course',
        'URL', 'https://coursera.org',
        'EstimatedHours', js.MinProficiency * 10
    ))
    INTO v_RecommendedResources
    FROM JobSkills js
    INNER JOIN Skills s ON js.SkillID = s.SkillID
    LEFT JOIN CandidateSkills cs ON js.SkillID = cs.SkillID AND cs.CandidateID = p_CandidateID
    WHERE js.JobID = p_TargetJobID
        AND (cs.SkillID IS NULL OR cs.ProficiencyLevel < js.MinProficiency);

    IF v_RecommendedResources IS NULL THEN
        v_RecommendedResources := '[]'::JSONB;
    END IF;

    IF v_ExistingPathID IS NOT NULL THEN
        UPDATE PersonalizedLearningPaths
        SET 
            CurrentReadinessScore = v_ReadinessScore,
            SkillsGapAnalysis = v_SkillsGap::TEXT,
            RecommendedResources = v_RecommendedResources::TEXT,
            ProgressPercentage = v_ReadinessScore,
            UpdatedAt = NOW()
        WHERE PathID = v_ExistingPathID;
        RAISE NOTICE 'Learning path updated successfully.';
    ELSE
        INSERT INTO PersonalizedLearningPaths 
        (CandidateID, GoalJobID, CurrentReadinessScore, TargetReadinessScore, 
         SkillsGapAnalysis, RecommendedResources, ProgressPercentage, IsActive, CreatedAt)
        VALUES 
        (p_CandidateID, p_TargetJobID, v_ReadinessScore, 85, v_SkillsGap::TEXT, v_RecommendedResources::TEXT, 
         v_ReadinessScore, TRUE, NOW());
        RAISE NOTICE 'Learning path created successfully.';
    END IF;

    SELECT 
        v_ReadinessScore AS CurrentReadinessScore,
        85 AS TargetReadinessScore,
        v_SkillsGap::TEXT AS SkillsGapAnalysis,
        v_RecommendedResources::TEXT AS RecommendedResources,
        CASE 
            WHEN v_ReadinessScore >= 80 THEN 'Ready for interview!'
            WHEN v_ReadinessScore >= 60 THEN 'Almost there - keep learning!'
            WHEN v_ReadinessScore >= 40 THEN 'Good progress - continue studying!'
            ELSE 'Just getting started - lets go!'
        END AS Message;
END;
$$;

-- sp_GenerateMarketAlerts
CREATE OR REPLACE PROCEDURE sp_GenerateMarketAlerts(
    p_RecruiterID INT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_RecruiterLocation VARCHAR(100);
BEGIN
    SELECT r.Department INTO v_RecruiterLocation
    FROM Recruiters r WHERE r.RecruiterID = p_RecruiterID;

    CREATE TEMP TABLE RelevantSkills ON COMMIT DROP AS
    SELECT DISTINCT s.SkillName
    FROM JobPostings j
    JOIN JobSkills js ON j.JobID = js.JobID
    JOIN Skills s ON js.SkillID = s.SkillID
    WHERE j.CreatedBy = p_RecruiterID
      AND j.IsActive
      AND NOT j.IsDeleted;

    CREATE TEMP TABLE Alerts ON COMMIT DROP AS
    SELECT
        CASE WHEN mi.SalaryTrend IN ('Rising','Falling') THEN 'Salary Alert' ELSE 'Demand Alert' END AS AlertType,
        mi.SkillID,
        s.SkillName,
        mi.Location,
        mi.DemandScore,
        mi.SupplyScore,
        mi.DemandScore - mi.SupplyScore AS ImbalanceScore,
        mi.SalaryTrend,
        mi.AvgSalary,
        CONCAT('Alert for ', s.SkillName, ' in ', mi.Location, ': Trend is ', mi.SalaryTrend,
               '. Avg: ', TO_CHAR(mi.AvgSalary,'FM999999999.00'), '. Imbalance: ', (mi.DemandScore - mi.SupplyScore)) AS Description,
        CASE
            WHEN (mi.DemandScore - mi.SupplyScore) > 30 THEN 5
            WHEN (mi.DemandScore - mi.SupplyScore) > 15 THEN 3
            ELSE 2
        END AS Severity,
        NOW() AS TriggeredAt,
        NOW() + INTERVAL '30 days' AS ExpiresAt
    FROM MarketIntelligence mi
    JOIN Skills s ON mi.SkillID = s.SkillID
    JOIN RelevantSkills rs ON s.SkillName = rs.SkillName
    WHERE mi.Location = v_RecruiterLocation
      AND mi.LastUpdated > NOW() - INTERVAL '14 days';

    INSERT INTO Alerts (AlertType, SkillName, Location, AvgSalary, Description, Severity, ExpiresAt)
    SELECT
        'Competitor Alert',
        ca.JobTitle,
        ca.Location,
        ca.ListedSalary,
        CONCAT('Competitor ', ca.CompetitorName, ' hiring for ', ca.JobTitle,
               ' at ', TO_CHAR(ca.ListedSalary,'FM999999999.00')),
        3,
        NOW() + INTERVAL '60 days'
    FROM CompetitorAnalysis ca
    WHERE ca.Location = v_RecruiterLocation
      AND ca.AnalysisDate > NOW() - INTERVAL '30 days'
      AND EXISTS (
          SELECT 1 FROM JobPostings jp
          WHERE jp.CreatedBy = p_RecruiterID
            AND ca.JobTitle LIKE '%' || jp.JobTitle || '%'
      );

    SELECT * FROM Alerts ORDER BY Severity DESC, TriggeredAt DESC;
END;
$$;

-- sp_GenerateNegotiationStrategy
CREATE OR REPLACE PROCEDURE sp_GenerateNegotiationStrategy(
    p_CandidateID INT,
    p_JobID INT,
    p_InitialOffer DECIMAL(10,2)
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_CandidateExp INT;
    v_Location VARCHAR(100);
    v_JobTitle VARCHAR(150);
    v_MarketAvg DECIMAL(10,2);
    v_Market25 DECIMAL(10,2);
    v_Market75 DECIMAL(10,2);
    v_CompanyRangeMin DECIMAL(10,2);
    v_CompanyRangeMax DECIMAL(10,2);
    v_OfferPercentile DECIMAL(5,2);
    v_RecommendedCounter DECIMAL(10,2);
    v_NegotiationRoom DECIMAL(10,2);
BEGIN
    SELECT c.YearsOfExperience, c.Location
    INTO v_CandidateExp, v_Location
    FROM Candidates c
    WHERE c.CandidateID = p_CandidateID;

    SELECT j.JobTitle, COALESCE(v_Location, j.Location)
    INTO v_JobTitle, v_Location
    FROM JobPostings j
    WHERE j.JobID = p_JobID;

    SELECT AvgSalary, Percentile25, Percentile75
    INTO v_MarketAvg, v_Market25, v_Market75
    FROM SalaryBenchmarks
    WHERE JobTitle = v_JobTitle
        AND Location = v_Location
        AND ExperienceRange = CASE 
            WHEN v_CandidateExp < 2 THEN 'Entry'
            WHEN v_CandidateExp < 5 THEN 'Junior'
            WHEN v_CandidateExp < 10 THEN 'Mid'
            ELSE 'Senior'
        END
    ORDER BY SampleSize DESC, LastUpdated DESC
    LIMIT 1;

    SELECT MinSalary, MaxSalary
    INTO v_CompanyRangeMin, v_CompanyRangeMax
    FROM JobSalaryRanges
    WHERE JobID = p_JobID;

    v_OfferPercentile := CASE 
        WHEN p_InitialOffer <= COALESCE(v_Market25, p_InitialOffer * 0.8) THEN 25
        WHEN p_InitialOffer <= COALESCE(v_MarketAvg, p_InitialOffer * 1.0) THEN 50
        WHEN p_InitialOffer <= COALESCE(v_Market75, p_InitialOffer * 1.2) THEN 75
        ELSE 90
    END;

    v_RecommendedCounter := CASE 
        WHEN v_OfferPercentile < 50 THEN COALESCE(v_MarketAvg, p_InitialOffer) * 1.1
        WHEN v_OfferPercentile < 75 THEN COALESCE(v_Market75, p_InitialOffer) * 1.05
        ELSE p_InitialOffer * 1.03
    END;

    IF v_CompanyRangeMax IS NOT NULL AND v_RecommendedCounter > v_CompanyRangeMax THEN
        v_RecommendedCounter := v_CompanyRangeMax * 0.95;
    END IF;

    v_NegotiationRoom := v_RecommendedCounter - p_InitialOffer;

    SELECT 
        p_InitialOffer AS InitialOffer,
        COALESCE(v_MarketAvg, p_InitialOffer) AS MarketAverage,
        COALESCE(v_Market25, p_InitialOffer * 0.8) AS Market25thPercentile,
        COALESCE(v_Market75, p_InitialOffer * 1.2) AS Market75thPercentile,
        v_OfferPercentile AS OfferPercentile,
        v_RecommendedCounter AS RecommendedCounterOffer,
        v_NegotiationRoom AS NegotiationRoom,
        CASE 
            WHEN v_OfferPercentile < 25 THEN 'Strongly Under Market'
            WHEN v_OfferPercentile < 50 THEN 'Below Market'
            WHEN v_OfferPercentile < 75 THEN 'Market Competitive'
            ELSE 'Above Market'
        END AS OfferAssessment,
        CASE 
            WHEN v_OfferPercentile < 25 THEN 
                'Thank you for the offer. Based on my research of similar roles in ' || COALESCE(v_Location, 'this market') || 
                ' with ' || v_CandidateExp || ' years experience, the market range is ' || 
                TO_CHAR(COALESCE(v_Market25, p_InitialOffer * 0.8), 'FM999999999.00') || ' - ' || TO_CHAR(COALESCE(v_Market75, p_InitialOffer * 1.2), 'FM999999999.00') || 
                '. Given my qualifications, I was expecting something closer to ' || TO_CHAR(v_RecommendedCounter, 'FM999999999.00') || '.'
            WHEN v_OfferPercentile < 50 THEN 
                'I appreciate the offer. While it''s a competitive package, market data shows similar roles at my experience level average ' || 
                TO_CHAR(COALESCE(v_MarketAvg, p_InitialOffer), 'FM999999999.00') || '. Could we discuss reaching ' || TO_CHAR(v_RecommendedCounter, 'FM999999999.00') || 
                ' to align with market standards?'
            WHEN v_OfferPercentile < 75 THEN 
                'Thank you for the generous offer. I''m excited about the role and believe my experience could justify an increase to ' || 
                TO_CHAR(v_RecommendedCounter, 'FM999999999.00') || '. This would put me in the top quartile for this role and reflect the value I''ll bring.'
            ELSE 
                'This is an excellent offer that I''m very excited about. While it''s already competitive, based on my unique experience, ' ||
                'I believe ' || TO_CHAR(v_RecommendedCounter, 'FM999999999.00') || ' would be appropriate.'
        END AS NegotiationScript,
        CASE 
            WHEN v_NegotiationRoom > 10000 THEN 'Wait 24 hours, then counter via email'
            WHEN v_NegotiationRoom > 5000 THEN 'Respond within 48 hours with counter'
            ELSE 'Accept within 72 hours or ask for minor adjustments'
        END AS TimingRecommendation,
        'Consider negotiating for: 1) Signing bonus, 2) Additional equity, 3) Early performance review, 4) Professional development budget' AS FallbackOptions;
END;
$$;

-- sp_GetCandidateSentimentHistory
CREATE OR REPLACE PROCEDURE sp_GetCandidateSentimentHistory(
    p_CandidateID INT,
    p_Limit INT DEFAULT 50,
    p_InteractionType VARCHAR(50) DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
    SELECT 
        SentimentID,
        CandidateID,
        InteractionType,
        InteractionDate,
        SentimentScore,
        Confidence,
        KeyTopics,
        EmotionBreakdown,
        CommunicationStyle,
        RedFlagsDetected,
        PositiveIndicators,
        AnalysisMethod,
        AnalysisDate
    FROM CandidateSentiment
    WHERE CandidateID = p_CandidateID
      AND (p_InteractionType IS NULL OR InteractionType = p_InteractionType)
    ORDER BY InteractionDate DESC
    LIMIT p_Limit;

    SELECT 
        COUNT(*) AS TotalInteractions,
        AVG(SentimentScore) AS AvgSentimentScore,
        AVG(Confidence) AS AvgConfidence,
        SUM(RedFlagsDetected) AS TotalRedFlags,
        SUM(PositiveIndicators) AS TotalPositiveIndicators,
        MAX(SentimentScore) AS HighestScore,
        MIN(SentimentScore) AS LowestScore,
        (SELECT CommunicationStyle 
         FROM CandidateSentiment 
         WHERE CandidateID = p_CandidateID 
         GROUP BY CommunicationStyle 
         ORDER BY COUNT(*) DESC 
         LIMIT 1) AS DominantCommunicationStyle,
        (SELECT AVG(SentimentScore) FROM (
            SELECT SentimentScore FROM CandidateSentiment WHERE CandidateID = p_CandidateID ORDER BY InteractionDate DESC LIMIT 5
        ) recent) AS RecentAvgSentiment,
        COUNT(CASE WHEN InteractionType = 'Email' THEN 1 END) AS EmailCount,
        COUNT(CASE WHEN InteractionType = 'Interview' THEN 1 END) AS InterviewCount,
        COUNT(CASE WHEN InteractionType = 'Call' THEN 1 END) AS CallCount,
        COUNT(CASE WHEN InteractionType = 'Chat' THEN 1 END) AS ChatCount
    FROM CandidateSentiment
    WHERE CandidateID = p_CandidateID;
END;
$$;

-- sp_GetMaskedCandidateData
CREATE OR REPLACE PROCEDURE sp_GetMaskedCandidateData(
    p_UserRole VARCHAR(50),
    p_CandidateID INT DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_UserRole = 'Admin' THEN
        SELECT 
            c.CandidateID,
            c.FullName,
            u.Email,
            c.Location,
            c.YearsOfExperience,
            c.CreatedAt
        FROM Candidates c
        JOIN Users u ON c.UserID = u.UserID
        WHERE (p_CandidateID IS NULL OR c.CandidateID = p_CandidateID);
    ELSIF p_UserRole = 'Recruiter' THEN
        SELECT 
            c.CandidateID,
            c.FullName,
            LEFT(u.Email, 3) || '***@' || 
            SUBSTRING(u.Email FROM '@(.*)$') AS MaskedEmail,
            c.Location,
            c.YearsOfExperience,
            c.CreatedAt
        FROM Candidates c
        JOIN Users u ON c.UserID = u.UserID
        WHERE (p_CandidateID IS NULL OR c.CandidateID = p_CandidateID);
    ELSIF p_UserRole = 'Analyst' THEN
        SELECT 
            'CAND_' || c.CandidateID AS AnonymizedID,
            CASE 
                WHEN c.YearsOfExperience < 2 THEN 'Junior'
                WHEN c.YearsOfExperience < 5 THEN 'Mid'
                ELSE 'Senior'
            END AS ExperienceGroup,
            LEFT(c.Location, 3) || '***' AS LocationGroup,
            (SELECT COUNT(*) FROM Applications a WHERE a.CandidateID = c.CandidateID) AS ApplicationCount,
            COALESCE((
                SELECT AVG((f.TechnicalScore + f.CommunicationScore + f.CultureFitScore) / 3.0)
                FROM InterviewFeedback f
                JOIN Applications a ON f.ApplicationID = a.ApplicationID
                WHERE a.CandidateID = c.CandidateID
            ), 0) AS AvgInterviewScore
        FROM Candidates c
        WHERE (p_CandidateID IS NULL OR c.CandidateID = p_CandidateID);
    ELSE
        RAISE EXCEPTION 'Invalid user role specified.';
    END IF;
END;
$$;

-- sp_HireCandidate (concurrency-safe)
CREATE OR REPLACE PROCEDURE sp_HireCandidate(
    p_ApplicationID INT,
    p_RecruiterID INT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_JobID INT;
    v_Vacancies INT;
    v_CurrentStatusID INT;
    v_HiredStatusID INT;
BEGIN
    SELECT StatusID INTO v_HiredStatusID FROM ApplicationStatus WHERE StatusName = 'Hired';

    -- Lock the application row
    SELECT JobID, StatusID INTO v_JobID, v_CurrentStatusID
    FROM Applications
    WHERE ApplicationID = p_ApplicationID
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Application not found.';
    END IF;

    -- Check terminal states
    IF v_CurrentStatusID IN (4, 5) THEN
        RAISE EXCEPTION 'Cannot hire candidate already in terminal state (Hired/Rejected).';
    END IF;

    -- Validate candidate is in Interview stage
    IF v_CurrentStatusID <> 3 THEN
        RAISE EXCEPTION 'Candidate not in Interview stage.';
    END IF;

    -- Lock job posting
    SELECT Vacancies INTO v_Vacancies
    FROM JobPostings
    WHERE JobID = v_JobID
    FOR UPDATE;

    IF v_Vacancies <= 0 THEN
        RAISE EXCEPTION 'No vacancies remaining for this job.';
    END IF;

    -- Update application to Hired
    UPDATE Applications
    SET StatusID = v_HiredStatusID,
        StatusChangedAt = NOW()
    WHERE ApplicationID = p_ApplicationID;

    -- Record in history
    INSERT INTO ApplicationStatusHistory (ApplicationID, FromStatusID, ToStatusID, ChangedBy, Notes)
    VALUES (p_ApplicationID, v_CurrentStatusID, v_HiredStatusID, p_RecruiterID, 'Hired by recruiter');

    -- Decrement vacancies
    UPDATE JobPostings
    SET Vacancies = Vacancies - 1
    WHERE JobID = v_JobID;

    COMMIT;
END;
$$;

-- sp_InterviewerConsistencyCLR
CREATE OR REPLACE PROCEDURE sp_InterviewerConsistencyCLR()
LANGUAGE plpgsql
AS $$
BEGIN
    SELECT
        f.InterviewerID,
        u.Username AS InterviewerName,
        COUNT(*) AS InterviewCount,
        AVG((f.TechnicalScore + f.CommunicationScore + f.CultureFitScore) / 3.0) AS AvgScore,
        StandardDeviation(
            (SELECT string_agg(((TechnicalScore + CommunicationScore + CultureFitScore) / 3.0)::TEXT, ',')
             FROM InterviewFeedback WHERE InterviewerID = f.InterviewerID)
        ) AS ScoreStdDev,
        CASE 
            WHEN StandardDeviation(
                (SELECT string_agg(((TechnicalScore + CommunicationScore + CultureFitScore) / 3.0)::TEXT, ',')
                 FROM InterviewFeedback WHERE InterviewerID = f.InterviewerID)
            ) > 2.5 THEN 'Inconsistent - review scoring calibration'
            ELSE 'Consistent'
        END AS ConsistencyAssessment
    FROM InterviewFeedback f
    JOIN Users u ON f.InterviewerID = u.UserID
    GROUP BY f.InterviewerID, u.Username
    HAVING COUNT(*) >= 3
    ORDER BY ScoreStdDev DESC;
END;
$$;

-- sp_NotifyNewJobMatches
CREATE OR REPLACE PROCEDURE sp_NotifyNewJobMatches()
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO PushNotifications (UserID, Title, Body, NotificationType, SentAt, DataPayload)
    SELECT DISTINCT
        c.UserID,
        'New Job Match!',
        'A new job "' || j.JobTitle || '" in ' || j.Location || ' matches your skills. Apply now!',
        'Reminder',
        NOW(),
        jsonb_build_object('jobId', j.JobID)::TEXT
    FROM JobPostings j
    CROSS JOIN LATERAL (
        SELECT cs.CandidateID
        FROM CandidateSkills cs
        WHERE cs.ProficiencyLevel >= 5
        AND EXISTS (
            SELECT 1 FROM JobSkills js 
            WHERE js.JobID = j.JobID 
            AND js.SkillID = cs.SkillID
            AND js.IsMandatory
        )
    ) cs_match
    JOIN Candidates c ON cs_match.CandidateID = c.CandidateID
    WHERE j.IsActive 
    AND NOT j.IsDeleted
    AND j.CreatedAt >= NOW() - INTERVAL '7 days'
    AND c.UserID IS NOT NULL
    AND NOT EXISTS (
        SELECT 1 FROM Applications a 
        WHERE a.CandidateID = cs_match.CandidateID 
        AND a.JobID = j.JobID
    );

    RAISE NOTICE 'Job match notifications sent.';
END;
$$;

-- sp_OptimizeInterviewRounds
CREATE OR REPLACE PROCEDURE sp_OptimizeInterviewRounds(
    p_CandidateID INT,
    p_JobID INT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_AlreadyAssessedSkills TEXT := '';
    v_RedundantQuestionsCount INT := 0;
    v_RecommendedRounds INT := 2;
    v_SkillsToAssess TEXT := '';
BEGIN
    SELECT string_agg(DISTINCT s.SkillName, ', ') INTO v_AlreadyAssessedSkills
    FROM CandidateInterviewHistory cih
    CROSS JOIN jsonb_array_elements(cih.QuestionsAsked::jsonb) q
    JOIN Skills s ON (q->>'skillId')::INT = s.SkillID
    WHERE cih.CandidateID = p_CandidateID
        AND cih.InterviewDate > NOW() - INTERVAL '6 months';

    SELECT COUNT(*) INTO v_RedundantQuestionsCount
    FROM InterviewSharedInsights isi
    WHERE isi.JobID = p_JobID
        AND isi.IsRedundant
        AND isi.LastAsked > NOW() - INTERVAL '1 month';

    SELECT string_agg(DISTINCT s.SkillName, ', ') INTO v_SkillsToAssess
    FROM JobSkills js
    JOIN Skills s ON js.SkillID = s.SkillID
    WHERE js.JobID = p_JobID
        AND js.IsMandatory
        AND s.SkillName NOT IN (SELECT unnest(string_to_array(COALESCE(v_AlreadyAssessedSkills, ''), ', ')));

    IF v_SkillsToAssess IS NULL OR v_SkillsToAssess = '' THEN
        v_RecommendedRounds := 2;
    ELSIF (array_length(string_to_array(v_SkillsToAssess, ', '), 1) > 5) THEN
        v_RecommendedRounds := 3;
    ELSE
        v_RecommendedRounds := 2;
    END IF;

    SELECT 
        v_RecommendedRounds AS RecommendedInterviewRounds,
        COALESCE(v_AlreadyAssessedSkills, 'None') AS AlreadyAssessedSkills,
        COALESCE(v_SkillsToAssess, 'All skills need assessment') AS SkillsToAssess,
        COALESCE(v_RedundantQuestionsCount, 0) AS RedundantQuestionsDetected,
        CASE 
            WHEN v_RedundantQuestionsCount > 3 THEN 'High redundancy detected. Consider question rotation.'
            ELSE 'Question redundancy at acceptable levels.'
        END AS RedundancyAssessment,
        CASE v_RecommendedRounds
            WHEN 2 THEN 'Round 1: Technical assessment | Round 2: Behavioral & Culture fit'
            WHEN 3 THEN 'Round 1: Screening | Round 2: Technical deep dive | Round 3: Leadership & Culture'
            ELSE 'Custom structure based on skills gap'
        END AS SuggestedStructure,
        (v_RecommendedRounds * 60) AS EstimatedMinutes,
        (4 * 60) - (v_RecommendedRounds * 60) AS TimeSavedMinutes;
END;
$$;

-- sp_PredictCareerPath
CREATE OR REPLACE PROCEDURE sp_PredictCareerPath(
    p_CandidateID INT,
    p_TargetRole VARCHAR(150),
    p_Years INT DEFAULT 5
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_CurrentRole VARCHAR(150);
    v_CurrentSkills TEXT;
    v_CurrentExp INT;
    v_EducationLevel VARCHAR(50);
    v_PathProbability DECIMAL(3,2);
    v_TransitionMonths INT;
    v_SkillsGap TEXT;
    v_SalaryIncrease DECIMAL(5,2);
    v_AdjustedProbability DECIMAL(3,2);
    v_TimelineMonths INT;
    v_DevelopmentPlan TEXT;
BEGIN
    SELECT c.YearsOfExperience, dm.EducationLevel,
           (SELECT JobTitle FROM Applications a JOIN JobPostings j ON a.JobID = j.JobID WHERE a.CandidateID = p_CandidateID ORDER BY a.AppliedDate DESC LIMIT 1) AS CurrentRole
    INTO v_CurrentExp, v_EducationLevel, v_CurrentRole
    FROM Candidates c
    LEFT JOIN DiversityMetrics dm ON dm.ApplicationID IN (
        SELECT ApplicationID FROM Applications WHERE CandidateID = p_CandidateID ORDER BY AppliedDate DESC LIMIT 1
    )
    WHERE c.CandidateID = p_CandidateID;

    SELECT string_agg(s.SkillName, ', ') INTO v_CurrentSkills
    FROM CandidateSkills cs
    JOIN Skills s ON cs.SkillID = s.SkillID
    WHERE cs.CandidateID = p_CandidateID;

    SELECT cp.Probability, cp.AvgTransitionMonths, cp.RequiredSkillsGap, cp.SalaryIncreaseAvg
    INTO v_PathProbability, v_TransitionMonths, v_SkillsGap, v_SalaryIncrease
    FROM CareerPaths cp
    WHERE cp.FromRole LIKE '%' || COALESCE(v_CurrentRole, 'Software Engineer') || '%'
        AND cp.ToRole LIKE '%' || p_TargetRole || '%'
    ORDER BY cp.Probability DESC, cp.SampleSize DESC
    LIMIT 1;

    v_AdjustedProbability := COALESCE(v_PathProbability, 0.5);

    IF v_CurrentExp >= 10 THEN v_AdjustedProbability := v_AdjustedProbability * 1.2;
    ELSIF v_CurrentExp >= 5 THEN v_AdjustedProbability := v_AdjustedProbability * 1.1;
    ELSIF v_CurrentExp >= 2 THEN v_AdjustedProbability := v_AdjustedProbability * 0.9;
    ELSE v_AdjustedProbability := v_AdjustedProbability * 0.7;
    END IF;

    IF v_AdjustedProbability > 0.95 THEN v_AdjustedProbability := 0.95; END IF;

    v_TimelineMonths := COALESCE(v_TransitionMonths, 36);
    IF p_Years * 12 < v_TimelineMonths THEN v_TimelineMonths := p_Years * 12; END IF;

    v_DevelopmentPlan := 'Based on your current skills in ' || COALESCE(v_CurrentSkills, 'general programming') || 
        ', you need to develop: ' || COALESCE(v_SkillsGap, 'advanced skills in your target domain') || 
        '. Recommended learning path: 1) Online courses (3-6 months), 2) Practical projects (6-12 months), 3) Mentorship.';

    SELECT 
        COALESCE(v_CurrentRole, 'Not specified') AS CurrentRole,
        p_TargetRole AS TargetRole,
        v_AdjustedProbability AS SuccessProbability,
        v_TimelineMonths AS EstimatedTimelineMonths,
        COALESCE(v_SalaryIncrease, 30.0) AS ExpectedSalaryIncreasePercent,
        COALESCE(v_CurrentExp, 0) AS YearsOfExperience,
        COALESCE(v_EducationLevel, 'Not specified') AS EducationLevel,
        CASE 
            WHEN v_AdjustedProbability >= 0.8 THEN 'Highly achievable'
            WHEN v_AdjustedProbability >= 0.6 THEN 'Achievable with effort'
            WHEN v_AdjustedProbability >= 0.4 THEN 'Challenging but possible'
            ELSE 'Very difficult - consider alternative paths'
        END AS FeasibilityAssessment,
        v_DevelopmentPlan AS DevelopmentPlan,
        (
            SELECT jsonb_agg(jsonb_build_object(
                'AlternativeRole', cp.ToRole,
                'Probability', cp.Probability,
                'TimelineMonths', cp.AvgTransitionMonths
            ))
            FROM CareerPaths cp
            WHERE cp.FromRole LIKE '%' || COALESCE(v_CurrentRole, 'Software Engineer') || '%'
                AND cp.ToRole <> p_TargetRole
                AND cp.Probability >= 0.6
            ORDER BY cp.Probability DESC
            LIMIT 3
        )::TEXT AS AlternativePaths;
END;
$$;

-- sp_PredictGhostingRisk
CREATE OR REPLACE PROCEDURE sp_PredictGhostingRisk(
    p_ApplicationID INT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_CandidateID INT;
    v_RecruiterID INT;
    v_JobID INT;
    v_CandidateScore DECIMAL(3,2);
    v_RecruiterScore DECIMAL(3,2);
    v_ResponseTimeAvg DECIMAL(10,2);
    v_CommunicationCount INT;
    v_RiskScore DECIMAL(3,2);
BEGIN
    SELECT a.CandidateID, a.JobID, j.CreatedBy
    INTO v_CandidateID, v_JobID, v_RecruiterID
    FROM Applications a
    JOIN JobPostings j ON a.JobID = j.JobID
    WHERE a.ApplicationID = p_ApplicationID;

    SELECT COALESCE(AVG(GhostingScore), 0) INTO v_CandidateScore
    FROM GhostingPatterns 
    WHERE UserID = v_CandidateID AND UserType = 'Candidate' AND IsActive;

    SELECT COALESCE(AVG(GhostingScore), 0) INTO v_RecruiterScore
    FROM GhostingPatterns 
    WHERE UserID = v_RecruiterID AND UserType = 'Recruiter' AND IsActive;

    SELECT AVG(EXTRACT(EPOCH FROM (RespondedAt - SentAt))/3600), COUNT(*)
    INTO v_ResponseTimeAvg, v_CommunicationCount
    FROM CommunicationLogs
    WHERE ApplicationID = p_ApplicationID AND RespondedAt IS NOT NULL;

    v_RiskScore := (
        COALESCE(v_CandidateScore, 0) * 0.4 + 
        COALESCE(v_RecruiterScore, 0) * 0.3 + 
        CASE 
            WHEN v_ResponseTimeAvg > 48 THEN 8.0
            WHEN v_ResponseTimeAvg > 24 THEN 5.0
            WHEN v_ResponseTimeAvg > 12 THEN 3.0
            ELSE 1.0 
        END * 0.2 +
        CASE 
            WHEN v_CommunicationCount = 0 THEN 7.0
            WHEN v_CommunicationCount < 3 THEN 4.0
            ELSE 1.0
        END * 0.1
    );

    SELECT 
        v_RiskScore AS GhostingRiskScore,
        COALESCE(v_CandidateScore, 0) AS CandidateGhostingHistory,
        COALESCE(v_RecruiterScore, 0) AS RecruiterGhostingHistory,
        COALESCE(v_ResponseTimeAvg, 0) AS AvgResponseTimeHours,
        COALESCE(v_CommunicationCount, 0) AS TotalCommunications,
        CASE 
            WHEN v_RiskScore >= 7.0 THEN 'High Risk'
            WHEN v_RiskScore >= 4.0 THEN 'Medium Risk'
            ELSE 'Low Risk'
        END AS RiskLevel,
        CASE 
            WHEN v_RiskScore >= 7.0 THEN 'Send escalation reminders, schedule follow-up call'
            WHEN v_RiskScore >= 4.0 THEN 'Increase communication frequency'
            ELSE 'Normal monitoring'
        END AS RecommendedAction;
END;
$$;

-- sp_PredictHireSuccess
CREATE OR REPLACE PROCEDURE sp_PredictHireSuccess(
    p_ApplicationID INT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_CandidateID INT;
    v_JobID INT;
    v_SkillMatch DECIMAL(5,2);
    v_ExperienceMatch DECIMAL(5,2);
    v_InterviewScore DECIMAL(5,2);
    v_ResponseEngagement DECIMAL(5,2) := 70;
    v_HistoricalSuccess DECIMAL(5,2) := 65;
    v_FinalProbability DECIMAL(5,2);
BEGIN
    SELECT a.CandidateID, a.JobID INTO v_CandidateID, v_JobID
    FROM Applications a WHERE a.ApplicationID = p_ApplicationID;

    SELECT 
        COUNT(CASE WHEN cs.ProficiencyLevel >= js.MinProficiency THEN 1 END) * 100.0 / 
             NULLIF(COUNT(*), 0) INTO v_SkillMatch
    FROM JobSkills js
    LEFT JOIN CandidateSkills cs ON js.SkillID = cs.SkillID AND cs.CandidateID = v_CandidateID
    WHERE js.JobID = v_JobID;

    SELECT 
        CASE 
            WHEN c.YearsOfExperience >= j.MinExperience THEN 100
            ELSE (c.YearsOfExperience * 100.0 / NULLIF(j.MinExperience, 0))
        END INTO v_ExperienceMatch
    FROM Candidates c
    CROSS JOIN JobPostings j
    WHERE c.CandidateID = v_CandidateID AND j.JobID = v_JobID;

    SELECT COALESCE(AVG(
        (TechnicalScore + CommunicationScore + CultureFitScore) / 30.0 * 100
    ), 50) INTO v_InterviewScore
    FROM InterviewFeedback f
    WHERE f.ApplicationID = p_ApplicationID;

    BEGIN
        SELECT 
            CASE 
                WHEN AVG(EXTRACT(EPOCH FROM (RespondedAt - SentAt))/3600) < 24 THEN 100
                WHEN AVG(EXTRACT(EPOCH FROM (RespondedAt - SentAt))/3600) < 48 THEN 75
                ELSE 50
            END INTO v_ResponseEngagement
        FROM CommunicationLogs cl
        WHERE cl.ApplicationID = p_ApplicationID AND RespondedAt IS NOT NULL;
    EXCEPTION WHEN OTHERS THEN
        v_ResponseEngagement := 60;
    END;

    SELECT COALESCE(
        CAST(SUM(CASE WHEN a2.StatusID = 4 THEN 1 ELSE 0 END) * 100.0 / 
             COUNT(*) AS DECIMAL(5,2)), 
        65
    ) INTO v_HistoricalSuccess
    FROM Applications a2
    WHERE a2.JobID = v_JobID 
        AND a2.CandidateID <> v_CandidateID
        AND a2.StatusID IN (4, 5);

    v_FinalProbability := (
        COALESCE(v_SkillMatch, 0) * 0.3 +
        COALESCE(v_ExperienceMatch, 0) * 0.25 +
        COALESCE(v_InterviewScore, 0) * 0.3 +
        COALESCE(v_ResponseEngagement, 0) * 0.15
    );

    v_FinalProbability := v_FinalProbability * 0.7 + v_HistoricalSuccess * 0.3;

    IF v_FinalProbability > 100 THEN v_FinalProbability := 100;
    ELSIF v_FinalProbability < 0 THEN v_FinalProbability := 0;
    END IF;

    INSERT INTO AI_Predictions (CandidateID, JobID, ApplicationID, SuccessProbability, KeyFactors)
    VALUES (
        v_CandidateID,
        v_JobID,
        p_ApplicationID,
        v_FinalProbability / 100.0,
        jsonb_build_object(
            'skillMatch', COALESCE(v_SkillMatch, 0),
            'experienceMatch', COALESCE(v_ExperienceMatch, 0),
            'interviewScore', COALESCE(v_InterviewScore, 0),
            'responseEngagement', COALESCE(v_ResponseEngagement, 0),
            'historicalSuccess', COALESCE(v_HistoricalSuccess, 0)
        )::TEXT
    );

    SELECT 
        v_FinalProbability AS SuccessProbabilityPercent,
        v_FinalProbability / 100.0 AS SuccessProbabilityDecimal,
        CASE 
            WHEN v_FinalProbability >= 80 THEN 'High'
            WHEN v_FinalProbability >= 60 THEN 'Medium'
            ELSE 'Low'
        END AS ConfidenceLevel,
        COALESCE(v_SkillMatch, 0) AS SkillMatchPercent,
        COALESCE(v_ExperienceMatch, 0) AS ExperienceMatchPercent,
        COALESCE(v_InterviewScore, 0) AS InterviewScorePercent,
        COALESCE(v_ResponseEngagement, 0) AS ResponseEngagementPercent,
        COALESCE(v_HistoricalSuccess, 0) AS HistoricalSuccessRate;
END;
$$;

-- sp_PredictOnboardingSuccess
CREATE OR REPLACE PROCEDURE sp_PredictOnboardingSuccess(
    p_CandidateID INT,
    p_JobID INT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_RemoteScore DECIMAL(3,2);
    v_SocialSkills INT;
    v_PreviousRemoteMonths INT;
    v_CareerGaps INT := 0;
    v_CompanyOnboardingScore INT;
    v_SimilarSuccessRate DECIMAL(5,2);
    v_SuccessProbability DECIMAL(5,2) := 0.5;
    v_RiskFactors TEXT := '';
    v_Recommendations TEXT;
BEGIN
    SELECT rc.OverallRemoteScore, rc.PreviousRemoteExperienceMonths, osf.SocialIntegrationScore
    INTO v_RemoteScore, v_PreviousRemoteMonths, v_SocialSkills
    FROM RemoteCompatibility rc
    LEFT JOIN OnboardingSuccessFactors osf ON osf.HiredCandidateID = rc.CandidateID
    WHERE rc.CandidateID = p_CandidateID;

    SELECT COALESCE(dm.CareerGapMonths, 0) INTO v_CareerGaps
    FROM DiversityMetrics dm
    WHERE dm.ApplicationID IN (
        SELECT ApplicationID FROM Applications 
        WHERE CandidateID = p_CandidateID AND JobID = p_JobID
    );

    SELECT crp.RemoteOnboardingScore INTO v_CompanyOnboardingScore
    FROM CompanyRemotePolicy crp
    JOIN JobPostings j ON crp.RecruiterID = j.CreatedBy
    WHERE j.JobID = p_JobID;

    SELECT AVG(
        CASE osf.SuccessCategory
            WHEN 'High' THEN 0.9
            WHEN 'Medium' THEN 0.7
            WHEN 'Low' THEN 0.4
            ELSE 0.5
        END
    ) INTO v_SimilarSuccessRate
    FROM OnboardingSuccessFactors osf
    JOIN Applications a ON osf.HiredCandidateID = a.CandidateID
    WHERE a.JobID = p_JobID
        AND osf.HiredCandidateID <> p_CandidateID;

    IF v_RemoteScore IS NOT NULL THEN
        v_SuccessProbability := v_SuccessProbability + (v_RemoteScore / 10 * 0.2);
    END IF;

    IF v_CompanyOnboardingScore IS NOT NULL THEN
        v_SuccessProbability := v_SuccessProbability + (v_CompanyOnboardingScore / 10 * 0.2);
    END IF;

    IF v_SimilarSuccessRate IS NOT NULL THEN
        v_SuccessProbability := v_SuccessProbability + (v_SimilarSuccessRate * 0.3);
    END IF;

    IF v_CareerGaps > 12 THEN
        v_SuccessProbability := v_SuccessProbability * 0.8;
        v_RiskFactors := v_RiskFactors || 'Significant career gap (' || v_CareerGaps || ' months). ';
    END IF;

    IF v_PreviousRemoteMonths = 0 THEN
        v_SuccessProbability := v_SuccessProbability * 0.9;
        v_RiskFactors := v_RiskFactors || 'No previous remote work experience. ';
    END IF;

    IF v_SocialSkills < 5 THEN
        v_SuccessProbability := v_SuccessProbability * 0.85;
        v_RiskFactors := v_RiskFactors || 'Below average social integration score. ';
    END IF;

    IF v_CompanyOnboardingScore IS NULL OR v_CompanyOnboardingScore < 5 THEN
        v_RiskFactors := v_RiskFactors || 'Company remote onboarding may need improvement. ';
    END IF;

    IF v_SuccessProbability > 0.95 THEN v_SuccessProbability := 0.95;
    ELSIF v_SuccessProbability < 0.1 THEN v_SuccessProbability := 0.1;
    END IF;

    v_Recommendations := CASE 
        WHEN v_SuccessProbability < 0.6 THEN 
            'High-risk onboarding. Recommendations: 1) Assign dedicated mentor, 2) 30-60-90 day plan, 3) Weekly check-ins, 4) Early performance indicators'
        WHEN v_SuccessProbability < 0.8 THEN 
            'Moderate risk. Recommendations: 1) Bi-weekly mentor meetings, 2) Clear first project, 3) Social integration activities'
        ELSE 
            'Low risk. Standard onboarding process should be sufficient.'
    END;

    SELECT 
        v_SuccessProbability AS SuccessProbability,
        v_RiskFactors AS RiskFactors,
        v_Recommendations AS Recommendations,
        CASE 
            WHEN v_SuccessProbability >= 0.8 THEN 'Low Risk'
            WHEN v_SuccessProbability >= 0.6 THEN 'Medium Risk'
            ELSE 'High Risk'
        END AS RiskLevel,
        CASE 
            WHEN v_SuccessProbability >= 0.8 THEN 24
            WHEN v_SuccessProbability >= 0.6 THEN 18
            WHEN v_SuccessProbability >= 0.4 THEN 12
            ELSE 6
        END AS PredictedRetentionMonths;
END;
$$;

-- sp_ProcessCandidateResume
CREATE OR REPLACE PROCEDURE sp_ProcessCandidateResume(
    p_CandidateID INT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_ResumeFile BYTEA;
    v_ResumeFileName VARCHAR(255);
    v_ResumeText TEXT;
    v_ExtractedSkills TEXT;
    v_YearsExp INT;
BEGIN
    SELECT ResumeFile, ResumeFileName INTO v_ResumeFile, v_ResumeFileName
    FROM Candidates
    WHERE CandidateID = p_CandidateID;

    IF v_ResumeFile IS NULL THEN
        RAISE EXCEPTION 'No resume file found for this candidate.';
    END IF;

    IF v_ResumeFileName LIKE '%.pdf' THEN
        v_ResumeText := ExtractTextFromPDF(v_ResumeFile);
    ELSIF v_ResumeFileName LIKE '%.docx' THEN
        v_ResumeText := ExtractTextFromDocx(v_ResumeFile);
    ELSE
        RAISE EXCEPTION 'Unsupported resume format. Only PDF and DOCX supported.';
    END IF;

    IF v_ResumeText IS NULL THEN
        RAISE EXCEPTION 'Failed to extract text from resume.';
    END IF;

    v_ExtractedSkills := ExtractSkills(v_ResumeText);
    v_YearsExp := ExtractYearsOfExperience(v_ResumeText);

    UPDATE Candidates
    SET 
        ResumeText = v_ResumeText,
        ExtractedSkills = v_ExtractedSkills,
        YearsOfExperience = CASE WHEN v_YearsExp > 0 THEN v_YearsExp ELSE YearsOfExperience END
    WHERE CandidateID = p_CandidateID;

    SELECT 
        p_CandidateID AS CandidateID,
        LENGTH(v_ResumeText) AS TextLength,
        v_ExtractedSkills AS ExtractedSkills,
        v_YearsExp AS ExtractedYearsOfExperience,
        'Resume processed successfully.' AS Message;
END;
$$;

-- sp_SaveCandidateRanking
CREATE OR REPLACE PROCEDURE sp_SaveCandidateRanking(
    p_CandidateID INT,
    p_JobID INT,
    p_MatchScore DECIMAL(5,2)
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO CandidateRankingHistory (CandidateID, JobID, MatchScore)
    VALUES (p_CandidateID, p_JobID, p_MatchScore);
END;
$$;

-- sp_ScheduleInterviewWithRecruiter
CREATE OR REPLACE PROCEDURE sp_ScheduleInterviewWithRecruiter(
    p_ApplicationID INT,
    p_RecruiterUserID INT,
    p_StartTime TIMESTAMP,
    p_EndTime TIMESTAMP
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_RecruiterID INT;
BEGIN
    SELECT RecruiterID INTO v_RecruiterID FROM Recruiters WHERE UserID = p_RecruiterUserID;

    IF v_RecruiterID IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: User is not registered as a Recruiter.';
    END IF;

    INSERT INTO InterviewSchedules (ApplicationID, RecruiterID, InterviewStart, InterviewEnd)
    VALUES (p_ApplicationID, v_RecruiterID, p_StartTime, p_EndTime);
END;
$$;

-- sp_ScheduleInterviewWithTimezone
CREATE OR REPLACE PROCEDURE sp_ScheduleInterviewWithTimezone(
    p_ApplicationID INT,
    p_RecruiterID INT,
    p_StartTimeUTC TIMESTAMP,
    p_EndTimeUTC TIMESTAMP,
    p_CandidateTimezone VARCHAR(100) DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_CandidateID INT;
    v_CandidateTimezone VARCHAR(100);
    v_CandidateLocalStart TIMESTAMP;
    v_CandidateLocalEnd TIMESTAMP;
    v_ScheduleID INT;
BEGIN
    SELECT CandidateID INTO v_CandidateID FROM Applications WHERE ApplicationID = p_ApplicationID;

    IF p_CandidateTimezone IS NULL THEN
        SELECT Timezone INTO v_CandidateTimezone FROM Candidates WHERE CandidateID = v_CandidateID;
    ELSE
        v_CandidateTimezone := p_CandidateTimezone;
    END IF;

    IF v_CandidateTimezone IS NULL THEN
        v_CandidateTimezone := 'UTC';
    END IF;

    v_CandidateLocalStart := p_StartTimeUTC AT TIME ZONE 'UTC' AT TIME ZONE v_CandidateTimezone;
    v_CandidateLocalEnd := p_EndTimeUTC AT TIME ZONE 'UTC' AT TIME ZONE v_CandidateTimezone;

    INSERT INTO InterviewSchedules (ApplicationID, RecruiterID, InterviewStart, InterviewEnd)
    VALUES (p_ApplicationID, p_RecruiterID, p_StartTimeUTC, p_EndTimeUTC)
    RETURNING ScheduleID INTO v_ScheduleID;

    SELECT 
        v_ScheduleID AS ScheduleID,
        p_StartTimeUTC AS InterviewStartUTC,
        p_EndTimeUTC AS InterviewEndUTC,
        v_CandidateLocalStart AS CandidateLocalStart,
        v_CandidateLocalEnd AS CandidateLocalEnd,
        v_CandidateTimezone AS CandidateTimezone,
        'Interview scheduled. Candidate will see: ' || 
        to_char(v_CandidateLocalStart, 'Mon DD, YYYY HH:MI AM') || ' to ' || 
        to_char(v_CandidateLocalEnd, 'HH:MI AM') || ' ' || v_CandidateTimezone AS Message;
END;
$$;

-- sp_SuggestReferrals
CREATE OR REPLACE PROCEDURE sp_SuggestReferrals(
    p_JobID INT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_RequiredSkills TEXT;
    v_Location VARCHAR(100);
    v_MinExperience INT;
BEGIN
    SELECT j.Location, j.MinExperience INTO v_Location, v_MinExperience
    FROM JobPostings j
    WHERE j.JobID = p_JobID;

    SELECT string_agg(s.SkillName, ',') INTO v_RequiredSkills
    FROM JobSkills js
    JOIN Skills s ON js.SkillID = s.SkillID
    WHERE js.JobID = p_JobID AND js.IsMandatory;

    WITH PotentialReferrers AS (
        SELECT 
            c.CandidateID,
            c.FullName,
            c.YearsOfExperience,
            c.Location,
            (
                SELECT COUNT(*) 
                FROM NetworkStrength ns 
                WHERE ns.CandidateID = c.CandidateID 
                AND ns.ConnectionStrength >= 7
            ) AS StrongConnectionsCount,
            COALESCE(rp.ConversionRate, 0) AS HistoricalConversionRate,
            (
                SELECT COUNT(*) 
                FROM CandidateSkills cs
                JOIN JobSkills js ON cs.SkillID = js.SkillID
                WHERE cs.CandidateID = c.CandidateID
                AND js.JobID = p_JobID
                AND js.IsMandatory
            ) * 100.0 / NULLIF((
                SELECT COUNT(*) 
                FROM JobSkills 
                WHERE JobID = p_JobID AND IsMandatory
            ), 0) AS SkillsMatchPercent
        FROM Candidates c
        LEFT JOIN ReferralPerformance rp ON rp.ReferrerID = c.CandidateID
        WHERE c.YearsOfExperience >= v_MinExperience * 0.8
    ),
    NetworkAnalysis AS (
        SELECT 
            pr.CandidateID AS ReferrerID,
            pr.FullName AS ReferrerName,
            pr.HistoricalConversionRate,
            pr.SkillsMatchPercent,
            (
                SELECT jsonb_agg(jsonb_build_object(
                    'CandidateID', c2.CandidateID,
                    'FullName', c2.FullName,
                    'YearsOfExperience', c2.YearsOfExperience,
                    'Location', c2.Location,
                    'ConnectionStrength', ns.ConnectionStrength,
                    'TrustLevel', ns.TrustLevel,
                    'MatchingSkillsCount', (
                        SELECT COUNT(*) 
                        FROM CandidateSkills cs
                        JOIN JobSkills js ON cs.SkillID = js.SkillID
                        WHERE cs.CandidateID = c2.CandidateID
                        AND js.JobID = p_JobID
                        AND js.IsMandatory
                    ),
                    'FitScore', (
                        CASE WHEN c2.YearsOfExperience >= v_MinExperience THEN 20 ELSE 10 END +
                        CASE WHEN c2.Location = v_Location THEN 15 ELSE 5 END +
                        ns.ConnectionStrength * 5 +
                        ns.TrustLevel * 4 +
                        (
                            SELECT COUNT(*) 
                            FROM CandidateSkills cs
                            JOIN JobSkills js ON cs.SkillID = js.SkillID
                            WHERE cs.CandidateID = c2.CandidateID
                            AND js.JobID = p_JobID
                            AND js.IsMandatory
                        ) * 10
                    )
                ))
                FROM NetworkStrength ns
                JOIN Candidates c2 ON ns.ConnectionID = c2.CandidateID
                WHERE ns.CandidateID = pr.CandidateID
                    AND c2.CandidateID NOT IN (
                        SELECT CandidateID FROM Applications WHERE JobID = p_JobID
                    )
                    AND ns.ConnectionStrength >= 5
                ORDER BY FitScore DESC
                LIMIT 5
            ) AS PotentialReferrals
        FROM PotentialReferrers pr
        WHERE pr.StrongConnectionsCount >= 3
            AND pr.SkillsMatchPercent >= 50
    )
    SELECT 
        ReferrerID,
        ReferrerName,
        HistoricalConversionRate,
        SkillsMatchPercent,
        PotentialReferrals::TEXT,
        (HistoricalConversionRate * 0.6 + SkillsMatchPercent * 0.4) AS ReferrerQualityScore,
        CASE 
            WHEN HistoricalConversionRate >= 70 THEN 'High (>70%)'
            WHEN HistoricalConversionRate >= 50 THEN 'Medium (50-70%)'
            WHEN HistoricalConversionRate >= 30 THEN 'Low (30-50%)'
            ELSE 'Very Low (<30%)'
        END AS EstimatedSuccessProbability
    FROM NetworkAnalysis
    WHERE PotentialReferrals IS NOT NULL
    ORDER BY ReferrerQualityScore DESC;
END;
$$;

-- sp_TimeToHireReport
CREATE OR REPLACE PROCEDURE sp_TimeToHireReport()
LANGUAGE plpgsql
AS $$
BEGIN
    SELECT
        j.JobID,
        j.JobTitle,
        COUNT(a.ApplicationID) AS TotalHires,
        AVG(CalculateBusinessDays(a.AppliedDate, h.ChangedAt)) AS AvgBusinessDaysToHire,
        MIN(CalculateBusinessDays(a.AppliedDate, h.ChangedAt)) AS MinBusinessDaysToHire,
        MAX(CalculateBusinessDays(a.AppliedDate, h.ChangedAt)) AS MaxBusinessDaysToHire
    FROM Applications a
    JOIN JobPostings j ON a.JobID = j.JobID
    JOIN ApplicationStatusHistory h ON a.ApplicationID = h.ApplicationID
    WHERE h.ToStatusID = (SELECT StatusID FROM ApplicationStatus WHERE StatusName = 'Hired')
    GROUP BY j.JobID, j.JobTitle
    ORDER BY AvgBusinessDaysToHire DESC;
END;
$$;

-- sp_UpdateApplicationStatus
CREATE OR REPLACE PROCEDURE sp_UpdateApplicationStatus(
    p_ApplicationID INT,
    p_NewStatusID INT,
    p_ChangedBy INT,
    p_Notes VARCHAR(500) DEFAULT NULL,
    p_RejectionReason VARCHAR(255) DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_CurrentStatusID INT;
BEGIN
    SELECT StatusID INTO v_CurrentStatusID
    FROM Applications
    WHERE ApplicationID = p_ApplicationID
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Application not found.';
    END IF;

    IF v_CurrentStatusID IN (4, 5) THEN
        RAISE EXCEPTION 'Cannot modify a terminal application state.';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM ApplicationStatusTransitions
        WHERE FromStatusID = v_CurrentStatusID
          AND ToStatusID = p_NewStatusID
    ) THEN
        RAISE EXCEPTION 'Invalid application status transition.';
    END IF;

    IF p_NewStatusID = 5 AND p_RejectionReason IS NOT NULL THEN
        UPDATE Applications
        SET StatusID = p_NewStatusID,
            StatusChangedAt = NOW(),
            RejectionReason = p_RejectionReason
        WHERE ApplicationID = p_ApplicationID;
    ELSE
        UPDATE Applications
        SET StatusID = p_NewStatusID,
            StatusChangedAt = NOW()
        WHERE ApplicationID = p_ApplicationID;
    END IF;

    INSERT INTO ApplicationStatusHistory (ApplicationID, FromStatusID, ToStatusID, ChangedBy, Notes)
    VALUES (p_ApplicationID, v_CurrentStatusID, p_NewStatusID, p_ChangedBy, p_Notes);
END;
$$;

-- sp_WithdrawApplication
CREATE OR REPLACE PROCEDURE sp_WithdrawApplication(
    p_ApplicationID INT,
    p_CandidateID INT,
    p_Reason VARCHAR(500)
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_CurrentStatusID INT;
    v_WithdrawnStatusID INT;
    v_UserID INT;
BEGIN
    SELECT StatusID INTO v_WithdrawnStatusID FROM ApplicationStatus WHERE StatusName = 'Withdrawn';

    SELECT a.StatusID, c.UserID
    INTO v_CurrentStatusID, v_UserID
    FROM Applications a
    JOIN Candidates c ON a.CandidateID = c.CandidateID
    WHERE a.ApplicationID = p_ApplicationID AND a.CandidateID = p_CandidateID;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Application not found or does not belong to candidate.';
    END IF;

    IF v_CurrentStatusID IN (4, 5) THEN
        RAISE EXCEPTION 'Cannot withdraw application in final state.';
    END IF;

    UPDATE Applications
    SET StatusID = v_WithdrawnStatusID,
        WithdrawnAt = NOW(),
        WithdrawalReason = p_Reason,
        StatusChangedAt = NOW()
    WHERE ApplicationID = p_ApplicationID;

    INSERT INTO ApplicationStatusHistory (ApplicationID, FromStatusID, ToStatusID, ChangedBy, Notes)
    VALUES (p_ApplicationID, v_CurrentStatusID, v_WithdrawnStatusID, v_UserID, 'Withdrawn: ' || p_Reason);
END;
$$;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Helper function to get current user ID (set by application)
CREATE OR REPLACE FUNCTION current_user_id() RETURNS INTEGER AS $$
BEGIN
    RETURN NULLIF(current_setting('app.current_user_id', TRUE), '')::INTEGER;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 1. trg_Audit_ApplicationStatusChange
CREATE OR REPLACE FUNCTION trg_Audit_ApplicationStatusChange()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO AuditLog (TableName, RecordID, Operation, OldValue, NewValue, ChangedBy, ChangedAt)
    VALUES (
        'Applications',
        NEW.ApplicationID,
        'UPDATE',
        'StatusID: ' || OLD.StatusID,
        'StatusID: ' || NEW.StatusID,
        current_user_id(),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_Audit_ApplicationStatusChange
AFTER UPDATE OF StatusID ON Applications
FOR EACH ROW
EXECUTE FUNCTION trg_Audit_ApplicationStatusChange();

-- 2. trg_PreventDoubleBooking
CREATE OR REPLACE FUNCTION trg_PreventDoubleBooking()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM InterviewSchedules
        WHERE RecruiterID = NEW.RecruiterID
          AND InterviewStart < NEW.InterviewEnd
          AND InterviewEnd > NEW.InterviewStart
    ) THEN
        RAISE EXCEPTION 'Scheduling conflict: Recruiter is already booked during this time.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_PreventDoubleBooking
BEFORE INSERT ON InterviewSchedules
FOR EACH ROW
EXECUTE FUNCTION trg_PreventDoubleBooking();

-- 3. trg_SendInterviewEmail
CREATE OR REPLACE FUNCTION trg_SendInterviewEmail()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO EmailQueue (CandidateID, EmailType, Subject, Body)
    SELECT
        c.CandidateID,
        'InterviewInvite',
        'Interview Scheduled',
        'Dear ' || c.FullName ||
        ', your interview is scheduled from ' ||
        to_char(NEW.InterviewStart, 'Mon DD, YYYY HH:MI AM') ||
        ' to ' || to_char(NEW.InterviewEnd, 'HH:MI AM') || '.'
    FROM inserted i
    JOIN Applications a ON i.ApplicationID = a.ApplicationID
    JOIN Candidates c ON a.CandidateID = c.CandidateID;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_SendInterviewEmail
AFTER INSERT ON InterviewSchedules
FOR EACH ROW
EXECUTE FUNCTION trg_SendInterviewEmail();

-- 4. trg_InstantAutoReject
CREATE OR REPLACE FUNCTION trg_InstantAutoReject()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE Applications
    SET StatusID = 5,
        RejectionReason = 'Auto-Rejected: Does not meet minimum experience requirement.',
        StatusChangedAt = NOW()
    WHERE ApplicationID = NEW.ApplicationID
      AND EXISTS (
          SELECT 1 FROM Candidates c
          JOIN JobPostings j ON NEW.JobID = j.JobID
          WHERE c.CandidateID = NEW.CandidateID
            AND c.YearsOfExperience < j.MinExperience
      )
      AND NEW.StatusID = 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_InstantAutoReject
AFTER INSERT ON Applications
FOR EACH ROW
EXECUTE FUNCTION trg_InstantAutoReject();

-- 5. trg_UpdateCandidateRanking (on skill change)
CREATE OR REPLACE FUNCTION trg_UpdateCandidateRanking()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE CandidateRankingHistory cr
    SET MatchScore = (
        SELECT SUM(cs.ProficiencyLevel) * 10
        FROM CandidateSkills cs
        WHERE cs.CandidateID = cr.CandidateID
    )
    WHERE cr.CandidateID IN (NEW.CandidateID, OLD.CandidateID);
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_UpdateCandidateRanking
AFTER INSERT OR UPDATE OR DELETE ON CandidateSkills
FOR EACH ROW
EXECUTE FUNCTION trg_UpdateCandidateRanking();

-- 6. trg_PreventDuplicateApplications
CREATE OR REPLACE FUNCTION trg_PreventDuplicateApplications()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM Applications
        WHERE CandidateID = NEW.CandidateID
          AND JobID = NEW.JobID
          AND IsDeleted = FALSE
    ) THEN
        RAISE EXCEPTION 'Candidate has already applied for this job.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_PreventDuplicateApplications
BEFORE INSERT ON Applications
FOR EACH ROW
EXECUTE FUNCTION trg_PreventDuplicateApplications();

-- 7. trg_UpdateJobVacancies
CREATE OR REPLACE FUNCTION trg_UpdateJobVacancies()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.StatusID = (SELECT StatusID FROM ApplicationStatus WHERE StatusName = 'Hired')
       AND OLD.StatusID <> NEW.StatusID THEN
        UPDATE JobPostings
        SET Vacancies = Vacancies - 1
        WHERE JobID = NEW.JobID AND Vacancies > 0;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_UpdateJobVacancies
AFTER UPDATE OF StatusID ON Applications
FOR EACH ROW
EXECUTE FUNCTION trg_UpdateJobVacancies();

-- 8. trg_Audit_UserChanges
CREATE OR REPLACE FUNCTION trg_Audit_UserChanges()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO AuditLog (TableName, RecordID, Operation, OldValue, NewValue, ChangedBy, ChangedAt)
        VALUES ('Users', NEW.UserID, 'INSERT', NULL,
                'Username: ' || NEW.Username || ', Email: ' || NEW.Email || ', RoleID: ' || NEW.RoleID,
                current_user_id(), NOW());
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO AuditLog (TableName, RecordID, Operation, OldValue, NewValue, ChangedBy, ChangedAt)
        VALUES ('Users', NEW.UserID, 'UPDATE',
                'Username: ' || OLD.Username || ', Email: ' || OLD.Email || ', RoleID: ' || OLD.RoleID || ', IsActive: ' || OLD.IsActive,
                'Username: ' || NEW.Username || ', Email: ' || NEW.Email || ', RoleID: ' || NEW.RoleID || ', IsActive: ' || NEW.IsActive,
                current_user_id(), NOW());
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO AuditLog (TableName, RecordID, Operation, OldValue, NewValue, ChangedBy, ChangedAt)
        VALUES ('Users', OLD.UserID, 'DELETE',
                'Username: ' || OLD.Username || ', Email: ' || OLD.Email || ', RoleID: ' || OLD.RoleID || ', IsActive: ' || OLD.IsActive,
                NULL, current_user_id(), NOW());
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_Audit_UserChanges
AFTER INSERT OR UPDATE OR DELETE ON Users
FOR EACH ROW
EXECUTE FUNCTION trg_Audit_UserChanges();

-- 9. trg_UpdateApplicationHistory
CREATE OR REPLACE FUNCTION trg_UpdateApplicationHistory()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.StatusID IS DISTINCT FROM NEW.StatusID THEN
        INSERT INTO ApplicationStatusHistory (ApplicationID, FromStatusID, ToStatusID, ChangedBy, ChangedAt, Notes)
        VALUES (NEW.ApplicationID, OLD.StatusID, NEW.StatusID, current_user_id(), NOW(), 'Status changed via application update');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_UpdateApplicationHistory
AFTER UPDATE OF StatusID ON Applications
FOR EACH ROW
EXECUTE FUNCTION trg_UpdateApplicationHistory();

-- 10. trg_UpdateCandidateExperience
CREATE OR REPLACE FUNCTION trg_UpdateCandidateExperience()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ResumeText IS DISTINCT FROM OLD.ResumeText THEN
        UPDATE Candidates
        SET YearsOfExperience = 
            CASE 
                WHEN ExtractYearsOfExperience(NEW.ResumeText) > 0 
                THEN ExtractYearsOfExperience(NEW.ResumeText)
                ELSE NEW.YearsOfExperience
            END,
            ExtractedSkills = 
            CASE 
                WHEN NEW.ResumeText IS NOT NULL 
                THEN ExtractSkills(NEW.ResumeText)
                ELSE NEW.ExtractedSkills
            END
        WHERE CandidateID = NEW.CandidateID;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_UpdateCandidateExperience
AFTER UPDATE OF ResumeText ON Candidates
FOR EACH ROW
EXECUTE FUNCTION trg_UpdateCandidateExperience();

-- 11. trg_PreventRehiring
CREATE OR REPLACE FUNCTION trg_PreventRehiring()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM Applications a
        JOIN ApplicationStatus s ON a.StatusID = s.StatusID
        WHERE a.CandidateID = NEW.CandidateID
          AND a.JobID = NEW.JobID
          AND s.StatusName = 'Hired'
    ) THEN
        RAISE EXCEPTION 'Candidate has already been hired for this job.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_PreventRehiring
BEFORE INSERT ON Applications
FOR EACH ROW
EXECUTE FUNCTION trg_PreventRehiring();

-- 12. trg_MaintainCandidateGamification
CREATE OR REPLACE FUNCTION trg_MaintainCandidateGamification()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO CandidateGamification (CandidateID, Points, Level, Badges, StreakDays, LastActivityDate, EngagementScore, CreatedAt, UpdatedAt)
    VALUES (NEW.CandidateID, 50, 1, '[]', 0, NOW(), 50, NOW(), NOW())
    ON CONFLICT (CandidateID) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_MaintainCandidateGamification
AFTER INSERT ON Candidates
FOR EACH ROW
EXECUTE FUNCTION trg_MaintainCandidateGamification();

-- 13. trg_InterviewScheduled_Notification
CREATE OR REPLACE FUNCTION trg_InterviewScheduled_Notification()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO PushNotifications (UserID, Title, Body, NotificationType, SentAt, DataPayload)
    SELECT 
        c.UserID,
        'Interview Scheduled',
        'Your interview for ' || j.JobTitle || ' has been scheduled for ' 
            || to_char(NEW.InterviewStart, 'Mon DD, YYYY at HH:MI AM'),
        'Interview',
        NOW(),
        jsonb_build_object('applicationId', NEW.ApplicationID)::TEXT
    FROM Applications a
    JOIN Candidates c ON a.CandidateID = c.CandidateID
    JOIN JobPostings j ON a.JobID = j.JobID
    WHERE a.ApplicationID = NEW.ApplicationID;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_InterviewScheduled_Notification
AFTER INSERT ON InterviewSchedules
FOR EACH ROW
EXECUTE FUNCTION trg_InterviewScheduled_Notification();

-- 14. trg_ApplicationStatusChanged_Notification
CREATE OR REPLACE FUNCTION trg_ApplicationStatusChanged_Notification()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO PushNotifications (UserID, Title, Body, NotificationType, SentAt, DataPayload)
    SELECT 
        c.UserID,
        CASE 
            WHEN s.StatusName = 'Interview' THEN 'Interview Invitation'
            WHEN s.StatusName = 'Hired' THEN 'Congratulations! You''re Hired!'
            WHEN s.StatusName = 'Rejected' THEN 'Application Update'
            WHEN s.StatusName = 'Screening' THEN 'Application Under Review'
            ELSE 'Application Update'
        END,
        CASE 
            WHEN s.StatusName = 'Interview' THEN 'Great news! Your application for ' || j.JobTitle || ' has been moved to Interview stage.'
            WHEN s.StatusName = 'Hired' THEN 'Congratulations! You have been hired for ' || j.JobTitle || '!'
            WHEN s.StatusName = 'Rejected' THEN 'Your application for ' || j.JobTitle || ' was not selected this time. Keep applying!'
            WHEN s.StatusName = 'Screening' THEN 'Your application for ' || j.JobTitle || ' is now under review.'
            ELSE 'Your application status for ' || j.JobTitle || ' has been updated to ' || s.StatusName || '.'
        END,
        'StatusUpdate',
        NOW(),
        jsonb_build_object('applicationId', NEW.ApplicationID)::TEXT
    FROM inserted i
    JOIN ApplicationStatus s ON i.ToStatusID = s.StatusID
    JOIN Applications a ON i.ApplicationID = a.ApplicationID
    JOIN Candidates c ON a.CandidateID = c.CandidateID
    JOIN JobPostings j ON a.JobID = j.JobID
    WHERE i.ToStatusID IN (2, 3, 4, 5);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ApplicationStatusChanged_Notification
AFTER INSERT ON ApplicationStatusHistory
FOR EACH ROW
EXECUTE FUNCTION trg_ApplicationStatusChanged_Notification();

-- 15. trg_SkillVerified_Notification
CREATE OR REPLACE FUNCTION trg_SkillVerified_Notification()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.IsVerified AND (OLD.IsVerified IS DISTINCT FROM NEW.IsVerified OR OLD IS NULL) THEN
        INSERT INTO PushNotifications (UserID, Title, Body, NotificationType, SentAt)
        SELECT 
            c.UserID,
            'Skill Verified!',
            'Your skill "' || s.SkillName || '" has been verified. Your profile just got stronger!',
            'StatusUpdate',
            NOW()
        FROM Candidates c
        JOIN Skills s ON s.SkillID = NEW.SkillID
        WHERE c.CandidateID = NEW.CandidateID;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_SkillVerified_Notification
AFTER INSERT OR UPDATE OF IsVerified ON SkillVerifications
FOR EACH ROW
EXECUTE FUNCTION trg_SkillVerified_Notification();

-- =====================================================
-- END OF SCRIPT
-- =====================================================