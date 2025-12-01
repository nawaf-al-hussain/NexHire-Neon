CREATE PROCEDURE sp_AutoScreenApplicationEnhanced
    @ApplicationID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Score DECIMAL(5,2) = 0;
    DECLARE @MaxScore DECIMAL(5,2) = 100;
    DECLARE @Criteria NVARCHAR(MAX) = '{}';
    DECLARE @CandidateID INT, @JobID INT;
    
    SELECT @CandidateID = a.CandidateID, @JobID = a.JobID
    FROM Applications a WHERE a.ApplicationID = @ApplicationID;
    
    DECLARE @ExperienceScore DECIMAL(5,2);
    SELECT @ExperienceScore = 
        CASE 
            WHEN c.YearsOfExperience >= j.MinExperience THEN 25
            WHEN c.YearsOfExperience >= j.MinExperience * 0.7 THEN 20
            WHEN c.YearsOfExperience >= j.MinExperience * 0.5 THEN 15
            ELSE 10
        END
    FROM Applications a
    JOIN Candidates c ON a.CandidateID = c.CandidateID
    JOIN JobPostings j ON a.JobID = j.JobID
    WHERE a.ApplicationID = @ApplicationID;
    
    SET @Score += @ExperienceScore;
    SET @Criteria = JSON_MODIFY(@Criteria, '$.experienceScore', @ExperienceScore);
    
    DECLARE @SkillsScore DECIMAL(5,2);
    SELECT @SkillsScore = 
        CAST(COUNT(CASE WHEN cs.ProficiencyLevel >= js.MinProficiency THEN 1 END) * 40.0 / 
             NULLIF(SUM(CASE WHEN js.IsMandatory = 1 THEN 1 ELSE 0 END), 0) AS DECIMAL(5,2))
    FROM JobSkills js
    LEFT JOIN CandidateSkills cs ON js.SkillID = cs.SkillID AND cs.CandidateID = @CandidateID
    WHERE js.JobID = @JobID AND js.IsMandatory = 1;
    
    SET @Score += ISNULL(@SkillsScore, 0);
    SET @Criteria = JSON_MODIFY(@Criteria, '$.skillsScore', ISNULL(@SkillsScore, 0));
    
    DECLARE @LocationScore DECIMAL(5,2);
    SELECT @LocationScore = 
        CASE 
            WHEN c.Location = j.Location THEN 20
            WHEN c.Location LIKE '%' + j.Location + '%' THEN 15
            ELSE 10
        END
    FROM Applications a
    JOIN Candidates c ON a.CandidateID = c.CandidateID
    JOIN JobPostings j ON a.JobID = j.JobID
    WHERE a.ApplicationID = @ApplicationID;
    
    SET @Score += @LocationScore;
    SET @Criteria = JSON_MODIFY(@Criteria, '$.locationScore', @LocationScore);
    
    DECLARE @ResumeScore DECIMAL(5,2) = 10;
    IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'ResumeInsights')
    BEGIN
        SELECT @ResumeScore = 
            CASE 
                WHEN ri.ResumeQualityScore >= 80 THEN 15
                WHEN ri.ResumeQualityScore >= 60 THEN 12
                ELSE 8
            END
        FROM ResumeInsights ri
        WHERE ri.CandidateID = @CandidateID
            AND ri.ProcessingStatus = 'Completed';
    END
    
    SET @Score += @ResumeScore;
    SET @Criteria = JSON_MODIFY(@Criteria, '$.resumeScore', @ResumeScore);
    
    DECLARE @Decision VARCHAR(20);
    DECLARE @Confidence DECIMAL(3,2);
    
    SET @Confidence = @Score / @MaxScore;
    SET @Decision = CASE 
        WHEN @Score >= 70 THEN 'Pass'
        WHEN @Score >= 50 THEN 'Maybe'
        WHEN @Score >= 30 THEN 'ManualReview'
        ELSE 'Fail'
    END;
    
    INSERT INTO ScreeningBotDecisions (ApplicationID, Decision, Confidence, Score, CriteriaEvaluated)
    VALUES (@ApplicationID, @Decision, @Confidence, @Score, @Criteria);
    
    SELECT 
        @Decision AS Decision,
        @Confidence AS Confidence,
        @Score AS Score,
        @MaxScore AS MaxScore,
        @Criteria AS CriteriaEvaluated,
        CASE @Decision
            WHEN 'Pass' THEN 'Candidate meets most requirements'
            WHEN 'Maybe' THEN 'Candidate meets some requirements, review recommended'
            WHEN 'ManualReview' THEN 'Requires human evaluation'
            ELSE 'Candidate does not meet minimum requirements'
        END AS DecisionExplanation;
END