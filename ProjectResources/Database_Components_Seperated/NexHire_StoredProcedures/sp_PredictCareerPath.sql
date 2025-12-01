CREATE PROCEDURE sp_PredictCareerPath
    @CandidateID INT,
    @TargetRole VARCHAR(150),
    @Years INT = 5
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @CurrentRole VARCHAR(150), @CurrentSkills NVARCHAR(MAX);
    DECLARE @CurrentExp INT, @EducationLevel VARCHAR(50);
    DECLARE @PathProbability DECIMAL(3,2), @TransitionMonths INT;
    DECLARE @SkillsGap NVARCHAR(MAX), @SalaryIncrease DECIMAL(5,2);
    
    SELECT @CurrentExp = c.YearsOfExperience,
           @EducationLevel = ISNULL(dm.EducationLevel, 'Not Specified'),
           @CurrentRole = (
               SELECT TOP 1 JobTitle 
               FROM Applications a 
               JOIN JobPostings j ON a.JobID = j.JobID 
               WHERE a.CandidateID = @CandidateID 
               ORDER BY a.AppliedDate DESC
           )
    FROM Candidates c
    LEFT JOIN DiversityMetrics dm ON dm.ApplicationID IN (
        SELECT TOP 1 ApplicationID FROM Applications WHERE CandidateID = @CandidateID ORDER BY AppliedDate DESC
    )
    WHERE c.CandidateID = @CandidateID;
    
    SELECT @CurrentSkills = COALESCE(@CurrentSkills + ', ', '') + s.SkillName
    FROM CandidateSkills cs
    JOIN Skills s ON cs.SkillID = s.SkillID
    WHERE cs.CandidateID = @CandidateID;
    
    SELECT TOP 1 
        @PathProbability = cp.Probability,
        @TransitionMonths = cp.AvgTransitionMonths,
        @SkillsGap = cp.RequiredSkillsGap,
        @SalaryIncrease = cp.SalaryIncreaseAvg
    FROM CareerPaths cp
    WHERE cp.FromRole LIKE '%' + ISNULL(@CurrentRole, 'Software Engineer') + '%'
        AND cp.ToRole LIKE '%' + @TargetRole + '%'
    ORDER BY cp.Probability DESC, cp.SampleSize DESC;
    
    DECLARE @AdjustedProbability DECIMAL(3,2);
    SET @AdjustedProbability = ISNULL(@PathProbability, 0.5);
    
    IF @CurrentExp >= 10 SET @AdjustedProbability = @AdjustedProbability * 1.2;
    ELSE IF @CurrentExp >= 5 SET @AdjustedProbability = @AdjustedProbability * 1.1;
    ELSE IF @CurrentExp >= 2 SET @AdjustedProbability = @AdjustedProbability * 0.9;
    ELSE SET @AdjustedProbability = @AdjustedProbability * 0.7;
    
    IF @AdjustedProbability > 0.95 SET @AdjustedProbability = 0.95;
    
    DECLARE @TimelineMonths INT;
    SET @TimelineMonths = ISNULL(@TransitionMonths, 36);
    
    IF @Years * 12 < @TimelineMonths 
        SET @TimelineMonths = @Years * 12;
    
    DECLARE @DevelopmentPlan NVARCHAR(MAX);
    SET @DevelopmentPlan = 'Based on your current skills in ' + ISNULL(@CurrentSkills, 'general programming') + 
        ', you need to develop: ' + ISNULL(@SkillsGap, 'advanced skills in your target domain') + 
        '. Recommended learning path: 1) Online courses (3-6 months), 2) Practical projects (6-12 months), 3) Mentorship.';
    
    SELECT 
        ISNULL(@CurrentRole, 'Not specified') AS CurrentRole,
        @TargetRole AS TargetRole,
        @AdjustedProbability AS SuccessProbability,
        @TimelineMonths AS EstimatedTimelineMonths,
        ISNULL(@SalaryIncrease, 30.0) AS ExpectedSalaryIncreasePercent,
        ISNULL(@CurrentExp, 0) AS YearsOfExperience,
        ISNULL(@EducationLevel, 'Not specified') AS EducationLevel,
        CASE 
            WHEN @AdjustedProbability >= 0.8 THEN 'Highly achievable'
            WHEN @AdjustedProbability >= 0.6 THEN 'Achievable with effort'
            WHEN @AdjustedProbability >= 0.4 THEN 'Challenging but possible'
            ELSE 'Very difficult - consider alternative paths'
        END AS FeasibilityAssessment,
        @DevelopmentPlan AS DevelopmentPlan,
        (
            SELECT TOP 3 
                cp.ToRole AS AlternativeRole,
                cp.Probability,
                cp.AvgTransitionMonths AS TimelineMonths
            FROM CareerPaths cp
            WHERE cp.FromRole LIKE '%' + ISNULL(@CurrentRole, 'Software Engineer') + '%'
                AND cp.ToRole <> @TargetRole
                AND cp.Probability >= 0.6
            ORDER BY cp.Probability DESC
            FOR JSON PATH
        ) AS AlternativePaths;
END;