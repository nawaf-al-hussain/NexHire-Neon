CREATE PROCEDURE sp_GenerateLearningPath
    @CandidateID INT,
    @TargetJobID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- First, check if a learning path already exists for this candidate/job
    DECLARE @ExistingPathID INT;
    SELECT @ExistingPathID = PathID 
    FROM PersonalizedLearningPaths 
    WHERE CandidateID = @CandidateID AND GoalJobID = @TargetJobID AND IsActive = 1;
    
    -- Calculate readiness score based on skill match
    DECLARE @TotalRequiredSkills INT;
    DECLARE @MatchedSkills INT;
    DECLARE @ReadinessScore INT;
    
    SELECT @TotalRequiredSkills = COUNT(*)
    FROM JobSkills 
    WHERE JobID = @TargetJobID;
    
    SELECT @MatchedSkills = COUNT(DISTINCT js.SkillID)
    FROM JobSkills js
    INNER JOIN CandidateSkills cs ON js.SkillID = cs.SkillID 
        AND cs.CandidateID = @CandidateID
        AND cs.ProficiencyLevel >= js.MinProficiency
    WHERE js.JobID = @TargetJobID;
    
    IF @TotalRequiredSkills > 0
        SET @ReadinessScore = CAST((@MatchedSkills * 100.0 / @TotalRequiredSkills) AS INT);
    ELSE
        SET @ReadinessScore = 0;
    
    -- Build skills gap analysis as JSON
    DECLARE @SkillsGap NVARCHAR(MAX);
    SET @SkillsGap = (
        SELECT 
            s.SkillID,
            s.SkillName,
            js.MinProficiency AS RequiredLevel,
            ISNULL(cs.ProficiencyLevel, 0) AS CurrentLevel,
            js.MinProficiency - ISNULL(cs.ProficiencyLevel, 0) AS Gap,
            CASE 
                WHEN js.IsMandatory = 1 AND ISNULL(cs.ProficiencyLevel, 0) < js.MinProficiency THEN 'High'
                WHEN js.IsMandatory = 1 THEN 'Medium'
                ELSE 'Low'
            END AS Priority
        FROM JobSkills js
        INNER JOIN Skills s ON js.SkillID = s.SkillID
        LEFT JOIN CandidateSkills cs ON js.SkillID = cs.SkillID 
            AND cs.CandidateID = @CandidateID
        WHERE js.JobID = @TargetJobID
            AND (cs.SkillID IS NULL OR cs.ProficiencyLevel < js.MinProficiency)
        ORDER BY 
            CASE WHEN js.IsMandatory = 1 THEN 0 ELSE 1 END,
            (js.MinProficiency - ISNULL(cs.ProficiencyLevel, 0)) DESC
        FOR JSON PATH
    );
    
    -- If no gaps, set to empty array
    IF @SkillsGap IS NULL
        SET @SkillsGap = '[]';
    
    -- Build recommended resources
    DECLARE @RecommendedResources NVARCHAR(MAX);
    SET @RecommendedResources = (
        SELECT 
            s.SkillName,
            'Online Course' AS ResourceType,
            'https://coursera.org' AS URL,
            js.MinProficiency * 10 AS EstimatedHours
        FROM JobSkills js
        INNER JOIN Skills s ON js.SkillID = s.SkillID
        LEFT JOIN CandidateSkills cs ON js.SkillID = cs.SkillID 
            AND cs.CandidateID = @CandidateID
        WHERE js.JobID = @TargetJobID
            AND (cs.SkillID IS NULL OR cs.ProficiencyLevel < js.MinProficiency)
        FOR JSON PATH
    );
    
    IF @RecommendedResources IS NULL
        SET @RecommendedResources = '[]';
    
    -- Update or Insert the learning path
    IF @ExistingPathID IS NOT NULL
    BEGIN
        UPDATE PersonalizedLearningPaths
        SET 
            CurrentReadinessScore = @ReadinessScore,
            SkillsGapAnalysis = @SkillsGap,
            RecommendedResources = @RecommendedResources,
            ProgressPercentage = @ReadinessScore,
            UpdatedAt = GETDATE()
        WHERE PathID = @ExistingPathID;
        
        PRINT 'Learning path updated successfully.';
    END
    ELSE
    BEGIN
        INSERT INTO PersonalizedLearningPaths 
        (CandidateID, GoalJobID, CurrentReadinessScore, TargetReadinessScore, 
         SkillsGapAnalysis, RecommendedResources, ProgressPercentage, IsActive, CreatedAt)
        VALUES 
        (@CandidateID, @TargetJobID, @ReadinessScore, 85, @SkillsGap, @RecommendedResources, 
         @ReadinessScore, 1, GETDATE());
        
        PRINT 'Learning path created successfully.';
    END
    
    -- Return the generated learning path
    SELECT 
        @ReadinessScore AS CurrentReadinessScore,
        85 AS TargetReadinessScore,
        @SkillsGap AS SkillsGapAnalysis,
        @RecommendedResources AS RecommendedResources,
        CASE 
            WHEN @ReadinessScore >= 80 THEN 'Ready for interview!'
            WHEN @ReadinessScore >= 60 THEN 'Almost there - keep learning!'
            WHEN @ReadinessScore >= 40 THEN 'Good progress - continue studying!'
            ELSE 'Just getting started - lets go!'
        END AS Message;
END
