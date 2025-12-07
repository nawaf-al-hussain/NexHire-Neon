-- Fixed Conversion script: Procedure to Function for PostgreSQL Compatibility
-- These procedures were previously defined as PROCEDURE but need to be FUNCTION returning TABLE
-- to be compatible with Node.js SELECT/CALL result retrieval.

-- 1. sp_PredictHireSuccess
DROP PROCEDURE IF EXISTS sp_PredictHireSuccess(INT);
CREATE OR REPLACE FUNCTION sp_PredictHireSuccess(
    p_ApplicationID INT
)
RETURNS TABLE (
    SuccessProbabilityPercent DECIMAL(5,2),
    SuccessProbabilityDecimal DECIMAL(3,2),
    ConfidenceLevel TEXT,
    SkillMatchPercent DECIMAL(5,2),
    ExperienceMatchPercent DECIMAL(5,2),
    InterviewScorePercent DECIMAL(5,2),
    ResponseEngagementPercent DECIMAL(5,2),
    HistoricalSuccessRate DECIMAL(5,2)
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
            WHEN c2.YearsOfExperience >= j2.MinExperience THEN 100
            ELSE (c2.YearsOfExperience * 100.0 / NULLIF(j2.MinExperience, 0))
        END INTO v_ExperienceMatch
    FROM Candidates c2
    CROSS JOIN JobPostings j2
    WHERE c2.CandidateID = v_CandidateID AND j2.JobID = v_JobID;

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

    -- Store the prediction
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

    RETURN QUERY SELECT 
        v_FinalProbability,
        (v_FinalProbability / 100.0)::DECIMAL(3,2),
        CASE 
            WHEN v_FinalProbability >= 80 THEN 'High'::TEXT
            WHEN v_FinalProbability >= 60 THEN 'Medium'::TEXT
            ELSE 'Low'::TEXT
        END,
        COALESCE(v_SkillMatch, 0),
        COALESCE(v_ExperienceMatch, 0),
        COALESCE(v_InterviewScore, 0),
        COALESCE(v_ResponseEngagement, 0),
        COALESCE(v_HistoricalSuccess, 0);
END;
$$;

-- 2. sp_PredictOnboardingSuccess
DROP PROCEDURE IF EXISTS sp_PredictOnboardingSuccess(INT, INT);
CREATE OR REPLACE FUNCTION sp_PredictOnboardingSuccess(
    p_CandidateID INT,
    p_JobID INT
)
RETURNS TABLE (
    SuccessProbability DECIMAL(5,2),
    RiskFactors TEXT,
    Recommendations TEXT,
    RiskLevel TEXT,
    PredictedRetentionMonths INT
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

    -- Store the prediction
    INSERT INTO OnboardingPredictions (CandidateID, JobID, SuccessProbability, RiskLevel, RiskFactors, Recommendations, PredictedRetentionMonths)
    VALUES (p_CandidateID, p_JobID, v_SuccessProbability, 
            CASE 
                WHEN v_SuccessProbability >= 0.8 THEN 'Low Risk'
                WHEN v_SuccessProbability >= 0.6 THEN 'Medium Risk'
                ELSE 'High Risk'
            END, v_RiskFactors, v_Recommendations, 
            CASE 
                WHEN v_SuccessProbability >= 0.8 THEN 24
                WHEN v_SuccessProbability >= 0.6 THEN 18
                WHEN v_SuccessProbability >= 0.4 THEN 12
                ELSE 6
            END);

    RETURN QUERY SELECT 
        v_SuccessProbability,
        v_RiskFactors,
        v_Recommendations,
        CASE 
            WHEN v_SuccessProbability >= 0.8 THEN 'Low Risk'::TEXT
            WHEN v_SuccessProbability >= 0.6 THEN 'Medium Risk'::TEXT
            ELSE 'High Risk'::TEXT
        END,
        CASE 
            WHEN v_SuccessProbability >= 0.8 THEN 24
            WHEN v_SuccessProbability >= 0.6 THEN 18
            WHEN v_SuccessProbability >= 0.4 THEN 12
            ELSE 6
        END;
END;
$$;

-- 3. sp_PredictGhostingRisk
DROP PROCEDURE IF EXISTS sp_PredictGhostingRisk(INT);
CREATE OR REPLACE FUNCTION sp_PredictGhostingRisk(
    p_ApplicationID INT
)
RETURNS TABLE (
    GhostingRiskScore DECIMAL(3,2),
    CandidateGhostingHistory DECIMAL(3,2),
    RecruiterGhostingHistory DECIMAL(3,2),
    AvgResponseTimeHours DECIMAL(10,2),
    TotalCommunications INT,
    RiskLevel TEXT,
    RecommendedAction TEXT
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

    RETURN QUERY SELECT 
        v_RiskScore,
        COALESCE(v_CandidateScore, 0)::DECIMAL(3,2),
        COALESCE(v_RecruiterScore, 0)::DECIMAL(3,2),
        COALESCE(v_ResponseTimeAvg, 0)::DECIMAL(10,2),
        COALESCE(v_CommunicationCount, 0)::INT,
        CASE 
            WHEN v_RiskScore >= 7.0 THEN 'High Risk'::TEXT
            WHEN v_RiskScore >= 4.0 THEN 'Medium Risk'::TEXT
            ELSE 'Low Risk'::TEXT
        END,
        CASE 
            WHEN v_RiskScore >= 7.0 THEN 'Send escalation reminders, schedule follow-up call'::TEXT
            WHEN v_RiskScore >= 4.0 THEN 'Increase communication frequency'::TEXT
            ELSE 'Normal monitoring'::TEXT
        END;
END;
$$;

-- 4. sp_AdvancedCandidateMatchingEnhanced
DROP PROCEDURE IF EXISTS sp_AdvancedCandidateMatchingEnhanced(INT, INT);
CREATE OR REPLACE FUNCTION sp_AdvancedCandidateMatchingEnhanced(
    p_JobID INT,
    p_TopN INT DEFAULT 10
)
RETURNS TABLE (
    CandidateID INT,
    FullName VARCHAR(150),
    YearsOfExperience INT,
    CandidateLocation VARCHAR(150),
    TechnicalScore DECIMAL(5,2),
    ExperienceScore DECIMAL(5,2),
    BehavioralScore DECIMAL(5,2),
    EngagementScore DECIMAL(5,2),
    LocationScore DECIMAL(5,2),
    TotalMatchScore DECIMAL(5,2),
    Rank BIGINT,
    HasApplied BOOLEAN,
    MatchCategory TEXT,
    RecommendedAction TEXT,
    SkillSummary TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY 
    WITH Scores AS (
        SELECT 
            c.CandidateID,
            c.FullName,
            c.YearsOfExperience,
            c.Location AS CandidateLocation,
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
                END AS DECIMAL(5,2)) AS LocationScore,
            EXISTS (
                SELECT 1 FROM Applications a 
                WHERE a.CandidateID = c.CandidateID 
                AND a.JobID = p_JobID 
                AND a.IsDeleted = FALSE
            ) AS HasApplied
        FROM Candidates c
        CROSS JOIN (SELECT Location, MinExperience FROM JobPostings WHERE JobID = p_JobID) j
        WHERE EXISTS (
            SELECT 1 FROM CandidateSkills cs
            WHERE cs.CandidateID = c.CandidateID
              AND cs.SkillID IN (SELECT SkillID FROM JobSkills WHERE JobID = p_JobID AND IsMandatory)
        )
    ),
    FinalScores AS (
        SELECT 
            *,
            (TechnicalScore + ExperienceScore + BehavioralScore + EngagementScore + LocationScore) AS TotalMatchScore,
            ROW_NUMBER() OVER (ORDER BY (TechnicalScore + ExperienceScore + BehavioralScore + EngagementScore + LocationScore) DESC) AS MatchRank
        FROM Scores
    )
    SELECT 
        fs.CandidateID,
        fs.FullName,
        fs.YearsOfExperience,
        fs.CandidateLocation,
        fs.TechnicalScore,
        fs.ExperienceScore,
        fs.BehavioralScore,
        fs.EngagementScore,
        fs.LocationScore,
        fs.TotalMatchScore,
        fs.MatchRank,
        fs.HasApplied,
        CASE 
            WHEN fs.TotalMatchScore >= 85 THEN 'Excellent Match'::TEXT
            WHEN fs.TotalMatchScore >= 70 THEN 'Good Match'::TEXT
            WHEN fs.TotalMatchScore >= 55 THEN 'Moderate Match'::TEXT
            ELSE 'Basic Match'::TEXT
        END,
        CASE 
            WHEN fs.TotalMatchScore >= 85 THEN 'Strong candidate - prioritize for interview'::TEXT
            WHEN fs.TotalMatchScore >= 70 THEN 'Good candidate - schedule interview'::TEXT
            WHEN fs.TotalMatchScore >= 55 THEN 'Consider for screening'::TEXT
            ELSE 'Review for specific strengths'::TEXT
        END,
        (
            SELECT string_agg(s.SkillName || ' (Lvl ' || cs.ProficiencyLevel::TEXT || ')', ', ')
            FROM CandidateSkills cs
            JOIN Skills s ON cs.SkillID = s.SkillID
            WHERE cs.CandidateID = fs.CandidateID
              AND cs.SkillID IN (SELECT SkillID FROM JobSkills WHERE JobID = p_JobID)
        ) AS SkillSummary
    FROM FinalScores fs
    ORDER BY fs.TotalMatchScore DESC
    LIMIT p_TopN;
END;
$$;

-- 5. sp_OptimizeInterviewRounds
DROP PROCEDURE IF EXISTS sp_OptimizeInterviewRounds(INT, INT);
CREATE OR REPLACE FUNCTION sp_OptimizeInterviewRounds(
    p_CandidateID INT,
    p_JobID INT
)
RETURNS TABLE (
    RecommendedInterviewRounds INT,
    AlreadyAssessedSkills TEXT,
    SkillsToAssess TEXT,
    RedundantQuestionsDetected INT,
    RedundancyAssessment TEXT,
    SuggestedStructure TEXT,
    EstimatedMinutes INT,
    TimeSavedMinutes INT
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

    RETURN QUERY SELECT 
        v_RecommendedRounds,
        COALESCE(v_AlreadyAssessedSkills, 'None')::TEXT,
        COALESCE(v_SkillsToAssess, 'All skills need assessment')::TEXT,
        COALESCE(v_RedundantQuestionsCount, 0)::INT,
        CASE 
            WHEN v_RedundantQuestionsCount > 3 THEN 'High redundancy detected. Consider question rotation.'::TEXT
            ELSE 'Question redundancy at acceptable levels.'::TEXT
        END,
        CASE v_RecommendedRounds
            WHEN 2 THEN 'Round 1: Technical assessment | Round 2: Behavioral & Culture fit'::TEXT
            WHEN 3 THEN 'Round 1: Screening | Round 2: Technical deep dive | Round 3: Leadership & Culture'::TEXT
            ELSE 'Custom structure based on skills gap'::TEXT
        END,
        (v_RecommendedRounds * 60),
        (4 * 60) - (v_RecommendedRounds * 60);
END;
$$;

-- 6. sp_PredictCareerPath
DROP PROCEDURE IF EXISTS sp_PredictCareerPath(INT, VARCHAR, INT);
CREATE OR REPLACE FUNCTION sp_PredictCareerPath(
    p_CandidateID INT,
    p_TargetRole VARCHAR(150),
    p_Years INT DEFAULT 5
)
RETURNS TABLE (
    CurrentRole VARCHAR(150),
    TargetRole VARCHAR(150),
    SuccessProbability DECIMAL(3,2),
    EstimatedTimelineMonths INT,
    ExpectedSalaryIncreasePercent DECIMAL(5,2),
    YearsOfExperience INT,
    EducationLevel VARCHAR(50),
    FeasibilityAssessment TEXT,
    DevelopmentPlan TEXT,
    AlternativePaths TEXT
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
           (SELECT j2.JobTitle FROM Applications a2 JOIN JobPostings j2 ON a2.JobID = j2.JobID WHERE a2.CandidateID = p_CandidateID ORDER BY a2.AppliedDate DESC LIMIT 1)
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

    RETURN QUERY SELECT 
        COALESCE(v_CurrentRole, 'Not specified')::VARCHAR(150),
        p_TargetRole::VARCHAR(150),
        v_AdjustedProbability,
        v_TimelineMonths,
        COALESCE(v_SalaryIncrease, 30.0),
        COALESCE(v_CurrentExp, 0),
        COALESCE(v_EducationLevel, 'Not specified')::VARCHAR(50),
        CASE 
            WHEN v_AdjustedProbability >= 0.8 THEN 'Highly achievable'::TEXT
            WHEN v_AdjustedProbability >= 0.6 THEN 'Achievable with effort'::TEXT
            WHEN v_AdjustedProbability >= 0.4 THEN 'Challenging but possible'::TEXT
            ELSE 'Very difficult - consider alternative paths'::TEXT
        END,
        v_DevelopmentPlan,
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
        )::TEXT;
END;
$$;

-- 7. sp_FuzzySearchCandidates
DROP PROCEDURE IF EXISTS sp_FuzzySearchCandidates(TEXT, FLOAT);
CREATE OR REPLACE FUNCTION sp_FuzzySearchCandidates(
    p_SearchName TEXT,
    p_Threshold FLOAT DEFAULT 0.85
)
RETURNS TABLE (
    CandidateID INT,
    FullName VARCHAR(150),
    JWScore FLOAT,
    LevenDistance INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        c.CandidateID,
        c.FullName,
        JaroWinklerSimilarity(c.FullName, p_SearchName),
        LevenshteinDistance(c.FullName, p_SearchName)
    FROM Candidates c
    WHERE JaroWinklerSimilarity(c.FullName, p_SearchName) >= p_Threshold
    ORDER BY JaroWinklerSimilarity(c.FullName, p_SearchName) DESC, 
             LevenshteinDistance(c.FullName, p_SearchName) ASC;
END;
$$;

-- 8. sp_GenerateInterviewPrep
DROP PROCEDURE IF EXISTS sp_GenerateInterviewPrep(INT, INT);
CREATE OR REPLACE FUNCTION sp_GenerateInterviewPrep(
    p_JobID INT,
    p_CandidateID INT DEFAULT NULL
)
RETURNS TABLE (
    JobTitle VARCHAR(150),
    Location VARCHAR(100),
    PrepMaterials TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_JobTitle VARCHAR(150);
    v_Location VARCHAR(100);
    v_PrepMaterials JSONB;
BEGIN
    SELECT j.JobTitle, j.Location INTO v_JobTitle, v_Location
    FROM JobPostings j WHERE j.JobID = p_JobID;

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

    v_PrepMaterials := COALESCE(v_PrepMaterials, '[]'::jsonb) || jsonb_build_object(
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
        'ResourceType', 'Company Website & News',
        'FocusArea', 'Recent company news and market position',
        'ExpectedDepth', 'High Level',
        'RecommendedTime', '30 minutes'
    );

    RETURN QUERY SELECT 
        v_JobTitle, 
        v_Location, 
        v_PrepMaterials::TEXT;
END;
$$;

-- 9. sp_AutoScreenApplicationEnhanced
DROP PROCEDURE IF EXISTS sp_AutoScreenApplicationEnhanced(INT);
CREATE OR REPLACE FUNCTION sp_AutoScreenApplicationEnhanced(
    p_ApplicationID INT
)
RETURNS TABLE (
    Decision VARCHAR(20),
    Confidence DECIMAL(3,2),
    Score DECIMAL(5,2),
    MaxScore DECIMAL(5,2),
    CriteriaEvaluated TEXT,
    DecisionExplanation TEXT
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

    RETURN QUERY SELECT 
        v_Decision,
        v_Confidence,
        v_Score,
        v_MaxScore,
        v_Criteria::TEXT,
        CASE v_Decision
            WHEN 'Pass' THEN 'Candidate meets most requirements'::TEXT
            WHEN 'Maybe' THEN 'Candidate meets some requirements, review recommended'::TEXT
            WHEN 'ManualReview' THEN 'Requires human evaluation'::TEXT
            ELSE 'Candidate does not meet minimum requirements'::TEXT
        END;
END;
$$;
