CREATE PROCEDURE sp_GenerateInterviewQuestions
    @JobID INT,
    @QuestionCount INT = 10,
    @DifficultyLevel INT = 5
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @JobSkills TABLE (SkillID INT, SkillName VARCHAR(100), IsMandatory BIT);
    
    INSERT INTO @JobSkills
    SELECT js.SkillID, s.SkillName, js.IsMandatory
    FROM JobSkills js
    JOIN Skills s ON js.SkillID = s.SkillID
    WHERE js.JobID = @JobID;
    
    SELECT TOP (@QuestionCount)
        'Technical' AS QuestionType,
        s.SkillName,
        'Explain your experience with ' + s.SkillName + ' and provide an example project.' AS QuestionText,
        JSON_QUERY('["experience", "project", "implementation", "challenge"]') AS ExpectedKeywords,
        'Assess depth of knowledge, practical application, problem-solving' AS ScoringGuide,
        @DifficultyLevel AS DifficultyLevel,
        CASE WHEN js.IsMandatory = 1 THEN 'High Priority' ELSE 'Medium Priority' END AS Priority
    FROM @JobSkills js
    JOIN Skills s ON js.SkillID = s.SkillID
    WHERE js.IsMandatory = 1
    ORDER BY NEWID();
    
    SELECT 
        'Behavioral' AS QuestionType,
        'General' AS SkillName,
        'Tell me about a time you faced a significant challenge at work and how you overcame it.' AS QuestionText,
        JSON_QUERY('["challenge", "action", "result", "learning"]') AS ExpectedKeywords,
        'Assess problem-solving, resilience, learning ability' AS ScoringGuide,
        @DifficultyLevel AS DifficultyLevel,
        'Standard' AS Priority;
    
    SELECT 
        'Cultural' AS QuestionType,
        'Teamwork' AS SkillName,
        'Describe your ideal work environment and team dynamics.' AS QuestionText,
        JSON_QUERY('["collaboration", "communication", "values", "environment"]') AS ExpectedKeywords,
        'Assess cultural fit, team compatibility, work preferences' AS ScoringGuide,
        @DifficultyLevel AS DifficultyLevel,
        'Standard' AS Priority;
END