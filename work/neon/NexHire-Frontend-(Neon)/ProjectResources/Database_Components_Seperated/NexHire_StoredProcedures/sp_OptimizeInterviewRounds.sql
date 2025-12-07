CREATE PROCEDURE sp_OptimizeInterviewRounds
    @CandidateID INT,
    @JobID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @AlreadyAssessedSkills NVARCHAR(MAX) = '';
    DECLARE @RedundantQuestionsCount INT = 0;
    DECLARE @RecommendedRounds INT = 2;
    DECLARE @SkillsToAssess NVARCHAR(MAX) = '';
    
    SELECT @AlreadyAssessedSkills = COALESCE(@AlreadyAssessedSkills + ', ', '') + s.SkillName
    FROM (
        SELECT DISTINCT s.SkillName
        FROM CandidateInterviewHistory cih
        CROSS APPLY OPENJSON(cih.QuestionsAsked) WITH (SkillID INT '$.skillId') q
        JOIN Skills s ON q.SkillID = s.SkillID
        WHERE cih.CandidateID = @CandidateID
            AND cih.InterviewDate > DATEADD(MONTH, -6, GETDATE())
    ) s;
    
    SELECT @RedundantQuestionsCount = COUNT(*)
    FROM InterviewSharedInsights isi
    WHERE isi.JobID = @JobID
        AND isi.IsRedundant = 1
        AND isi.LastAsked > DATEADD(MONTH, -1, GETDATE());
    
    SELECT @SkillsToAssess = COALESCE(@SkillsToAssess + ', ', '') + s.SkillName
    FROM (
        SELECT DISTINCT s.SkillName
        FROM JobSkills js
        JOIN Skills s ON js.SkillID = s.SkillID
        WHERE js.JobID = @JobID
            AND js.IsMandatory = 1
            AND s.SkillName NOT IN (
                SELECT value FROM STRING_SPLIT(ISNULL(@AlreadyAssessedSkills, ''), ',')
            )
    ) s;
    
    IF @SkillsToAssess = '' OR @SkillsToAssess IS NULL
        SET @RecommendedRounds = 2;
    ELSE IF (LEN(@SkillsToAssess) - LEN(REPLACE(@SkillsToAssess, ',', '')) + 1) > 5
        SET @RecommendedRounds = 3;
    ELSE
        SET @RecommendedRounds = 2;
    
    SELECT 
        @RecommendedRounds AS RecommendedInterviewRounds,
        ISNULL(@AlreadyAssessedSkills, 'None') AS AlreadyAssessedSkills,
        ISNULL(@SkillsToAssess, 'All skills need assessment') AS SkillsToAssess,
        ISNULL(@RedundantQuestionsCount, 0) AS RedundantQuestionsDetected,
        CASE 
            WHEN @RedundantQuestionsCount > 3 THEN 'High redundancy detected. Consider question rotation.'
            ELSE 'Question redundancy at acceptable levels.'
        END AS RedundancyAssessment,
        CASE @RecommendedRounds
            WHEN 2 THEN 'Round 1: Technical assessment | Round 2: Behavioral & Culture fit'
            WHEN 3 THEN 'Round 1: Screening | Round 2: Technical deep dive | Round 3: Leadership & Culture'
            ELSE 'Custom structure based on skills gap'
        END AS SuggestedStructure,
        (@RecommendedRounds * 60) AS EstimatedMinutes,
        (4 * 60) - (@RecommendedRounds * 60) AS TimeSavedMinutes;
END;