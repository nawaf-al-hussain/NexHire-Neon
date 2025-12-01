CREATE PROCEDURE sp_GenerateInterviewPrep
    @JobID INT,
    @CandidateID INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @PrepMaterials NVARCHAR(MAX);
    
    DECLARE @JobTitle VARCHAR(150), @Location VARCHAR(100);
    SELECT @JobTitle = JobTitle, @Location = Location FROM JobPostings WHERE JobID = @JobID;
    
    SELECT @PrepMaterials = (
        SELECT 
            'Technical Preparation' AS Category,
            s.SkillName,
            'Study Resources' AS ResourceType,
            'Focus on: ' + s.SkillName + ' concepts and practical applications' AS FocusArea,
            'Expected Depth: Level ' + CAST(js.MinProficiency AS VARCHAR) + '/10' AS ExpectedDepth,
            'Study Time: ' + CAST(js.MinProficiency * 30 AS VARCHAR) + ' minutes' AS RecommendedTime
        FROM JobSkills js
        JOIN Skills s ON js.SkillID = s.SkillID
        WHERE js.JobID = @JobID AND js.IsMandatory = 1
        ORDER BY js.IsMandatory DESC, js.MinProficiency DESC
        FOR JSON PATH
    );
    
    SET @PrepMaterials = JSON_MODIFY(@PrepMaterials, 'append $', 
        JSON_QUERY('{
            "Category": "Behavioral Preparation",
            "SkillName": "Communication",
            "ResourceType": "Mock Interviews",
            "FocusArea": "Common behavioral questions and STAR method responses",
            "ExpectedDepth": "Comprehensive",
            "RecommendedTime": "60 minutes"
        }')
    );
    
    SET @PrepMaterials = JSON_MODIFY(@PrepMaterials, 'append $', 
        JSON_QUERY('{
            "Category": "Company Research",
            "SkillName": "Industry Knowledge",
            "ResourceType": "Company Info",
            "FocusArea": "Company culture, recent news, products/services",
            "ExpectedDepth": "Basic Understanding",
            "RecommendedTime": "45 minutes"
        }')
    );
    
    IF @CandidateID IS NOT NULL
    BEGIN
        DECLARE @CandidateSkills NVARCHAR(MAX);
        SELECT @CandidateSkills = STRING_AGG(s.SkillName, ', ')
        FROM CandidateSkills cs
        JOIN Skills s ON cs.SkillID = s.SkillID
        WHERE cs.CandidateID = @CandidateID AND cs.ProficiencyLevel >= 7;
        
        IF @CandidateSkills IS NOT NULL
        BEGIN
            SET @PrepMaterials = JSON_MODIFY(@PrepMaterials, 'append $', 
                JSON_QUERY('{
                    "Category": "Personalized Tips",
                    "SkillName": "Your Strengths",
                    "ResourceType": "Leverage Points",
                    "FocusArea": "Highlight your expertise in: ' + @CandidateSkills + '",
                    "ExpectedDepth": "Confident Presentation",
                    "RecommendedTime": "30 minutes"
                }')
            );
        END
    END
    
    SELECT 
        @JobTitle AS JobTitle,
        @Location AS Location,
        @PrepMaterials AS InterviewPreparation,
        'Total estimated preparation time: 3-4 hours over 1-2 days' AS OverallGuidance,
        'Day 1: Technical review | Day 2: Behavioral practice & company research' AS SuggestedSchedule;
END