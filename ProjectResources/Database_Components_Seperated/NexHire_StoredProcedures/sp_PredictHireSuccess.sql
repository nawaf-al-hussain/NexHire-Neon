CREATE PROCEDURE sp_PredictHireSuccess
    @ApplicationID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @CandidateID INT, @JobID INT;
    DECLARE @SkillMatch DECIMAL(5,2), @ExperienceMatch DECIMAL(5,2);
    DECLARE @InterviewScore DECIMAL(5,2), @ResponseEngagement DECIMAL(5,2);
    DECLARE @HistoricalSuccess DECIMAL(5,2);
    
    SELECT @CandidateID = a.CandidateID, @JobID = a.JobID
    FROM Applications a WHERE a.ApplicationID = @ApplicationID;
    
    SELECT @SkillMatch = 
        CAST(COUNT(CASE WHEN cs.ProficiencyLevel >= js.MinProficiency THEN 1 END) * 100.0 / 
             NULLIF(COUNT(*), 0) AS DECIMAL(5,2))
    FROM JobSkills js
    LEFT JOIN CandidateSkills cs ON js.SkillID = cs.SkillID AND cs.CandidateID = @CandidateID
    WHERE js.JobID = @JobID;
    
    SELECT @ExperienceMatch = 
        CASE 
            WHEN c.YearsOfExperience >= j.MinExperience THEN 100
            ELSE (c.YearsOfExperience * 100.0 / NULLIF(j.MinExperience, 0))
        END
    FROM Candidates c
    CROSS JOIN JobPostings j
    WHERE c.CandidateID = @CandidateID AND j.JobID = @JobID;
    
    SELECT @InterviewScore = ISNULL(AVG(
        (CAST(TechnicalScore AS DECIMAL) + CommunicationScore + CultureFitScore) / 30.0 * 100
    ), 50)
    FROM InterviewFeedback f
    WHERE f.ApplicationID = @ApplicationID;
    
    SELECT @ResponseEngagement = 
        CASE 
            WHEN EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'CommunicationLogs')
            THEN ISNULL((
                SELECT CASE 
                    WHEN AVG(DATEDIFF(HOUR, SentAt, RespondedAt)) < 24 THEN 100
                    WHEN AVG(DATEDIFF(HOUR, SentAt, RespondedAt)) < 48 THEN 75
                    ELSE 50
                END
                FROM CommunicationLogs cl
                WHERE cl.ApplicationID = @ApplicationID AND RespondedAt IS NOT NULL
            ), 60)
            ELSE 70
        END;
    
    SELECT @HistoricalSuccess = ISNULL(
        CAST(SUM(CASE WHEN a2.StatusID = 4 THEN 1 ELSE 0 END) * 100.0 / 
             COUNT(*) AS DECIMAL(5,2)), 
        65
    )
    FROM Applications a2
    WHERE a2.JobID = @JobID 
        AND a2.CandidateID <> @CandidateID
        AND a2.StatusID IN (4, 5);
    
    DECLARE @FinalProbability DECIMAL(5,2);
    SET @FinalProbability = (
        ISNULL(@SkillMatch, 0) * 0.3 +
        ISNULL(@ExperienceMatch, 0) * 0.25 +
        ISNULL(@InterviewScore, 0) * 0.3 +
        ISNULL(@ResponseEngagement, 0) * 0.15
    );
    
    SET @FinalProbability = (@FinalProbability * 0.7 + @HistoricalSuccess * 0.3);
    
    SET @FinalProbability = CASE 
        WHEN @FinalProbability > 100 THEN 100
        WHEN @FinalProbability < 0 THEN 0
        ELSE @FinalProbability
    END;
    
    INSERT INTO AI_Predictions (CandidateID, JobID, ApplicationID, SuccessProbability, KeyFactors)
    VALUES (
        @CandidateID,
        @JobID,
        @ApplicationID,
        @FinalProbability / 100.0,
        JSON_QUERY('{
            "skillMatch": ' + CAST(ISNULL(@SkillMatch, 0) AS VARCHAR) + ',
            "experienceMatch": ' + CAST(ISNULL(@ExperienceMatch, 0) AS VARCHAR) + ',
            "interviewScore": ' + CAST(ISNULL(@InterviewScore, 0) AS VARCHAR) + ',
            "responseEngagement": ' + CAST(ISNULL(@ResponseEngagement, 0) AS VARCHAR) + ',
            "historicalSuccess": ' + CAST(ISNULL(@HistoricalSuccess, 0) AS VARCHAR) + '
        }')
    );
    
    SELECT 
        @FinalProbability AS SuccessProbabilityPercent,
        @FinalProbability / 100.0 AS SuccessProbabilityDecimal,
        CASE 
            WHEN @FinalProbability >= 80 THEN 'High'
            WHEN @FinalProbability >= 60 THEN 'Medium'
            ELSE 'Low'
        END AS ConfidenceLevel,
        ISNULL(@SkillMatch, 0) AS SkillMatchPercent,
        ISNULL(@ExperienceMatch, 0) AS ExperienceMatchPercent,
        ISNULL(@InterviewScore, 0) AS InterviewScorePercent,
        ISNULL(@ResponseEngagement, 0) AS ResponseEngagementPercent,
        ISNULL(@HistoricalSuccess, 0) AS HistoricalSuccessRate;
END