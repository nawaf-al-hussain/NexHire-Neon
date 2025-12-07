CREATE PROCEDURE sp_ProcessCandidateResume
    @CandidateID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @ResumeFile VARBINARY(MAX);
    DECLARE @ResumeFileName NVARCHAR(255);
    DECLARE @ResumeText NVARCHAR(MAX);
    DECLARE @ExtractedSkills NVARCHAR(MAX);
    DECLARE @YearsExp INT;
    
    SELECT @ResumeFile = ResumeFile, @ResumeFileName = ResumeFileName
    FROM Candidates
    WHERE CandidateID = @CandidateID;
    
    IF @ResumeFile IS NULL
    BEGIN
        RAISERROR('No resume file found for this candidate.', 16, 1);
        RETURN;
    END
    
    SET @ResumeText = CASE 
        WHEN @ResumeFileName LIKE '%.pdf' THEN dbo.ExtractTextFromPDF(@ResumeFile)
        WHEN @ResumeFileName LIKE '%.docx' THEN dbo.ExtractTextFromDocx(@ResumeFile)
        ELSE NULL
    END;
    
    IF @ResumeText IS NULL
    BEGIN
        RAISERROR('Unsupported resume format. Only PDF and DOCX supported.', 16, 1);
        RETURN;
    END
    
    SET @ExtractedSkills = dbo.ExtractSkills(@ResumeText);
    SET @YearsExp = dbo.ExtractYearsOfExperience(@ResumeText);
    
    UPDATE Candidates
    SET 
        ResumeText = @ResumeText,
        ExtractedSkills = @ExtractedSkills,
        YearsOfExperience = CASE WHEN @YearsExp > 0 THEN @YearsExp ELSE YearsOfExperience END
    WHERE CandidateID = @CandidateID;
    
    SELECT 
        @CandidateID AS CandidateID,
        LEN(@ResumeText) AS TextLength,
        @ExtractedSkills AS ExtractedSkills,
        @YearsExp AS ExtractedYearsOfExperience,
        'Resume processed successfully.' AS Message;
END;