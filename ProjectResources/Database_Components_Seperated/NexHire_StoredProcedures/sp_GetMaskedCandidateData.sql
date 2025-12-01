CREATE PROCEDURE sp_GetMaskedCandidateData
    @UserRole VARCHAR(50),
    @CandidateID INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    IF @UserRole = 'Admin'
    BEGIN
        SELECT 
            c.CandidateID,
            c.FullName,
            u.Email,
            c.Location,
            c.YearsOfExperience,
            c.CreatedAt
        FROM Candidates c
        JOIN Users u ON c.UserID = u.UserID
        WHERE (@CandidateID IS NULL OR c.CandidateID = @CandidateID);
    END
    ELSE IF @UserRole = 'Recruiter'
    BEGIN
        SELECT 
            c.CandidateID,
            c.FullName,
            MaskedEmail = LEFT(u.Email, 3) + '***@' + 
                         SUBSTRING(u.Email, CHARINDEX('@', u.Email) + 1, LEN(u.Email)),
            c.Location,
            c.YearsOfExperience,
            c.CreatedAt
        FROM Candidates c
        JOIN Users u ON c.UserID = u.UserID
        WHERE (@CandidateID IS NULL OR c.CandidateID = @CandidateID);
    END
    ELSE IF @UserRole = 'Analyst'
    BEGIN
        SELECT 
            AnonymizedID = 'CAND_' + CAST(c.CandidateID AS VARCHAR),
            ExperienceGroup = CASE 
                WHEN c.YearsOfExperience < 2 THEN 'Junior'
                WHEN c.YearsOfExperience < 5 THEN 'Mid'
                ELSE 'Senior'
            END,
            LocationGroup = LEFT(c.Location, 3) + '***',
            ApplicationCount = (SELECT COUNT(*) FROM Applications a WHERE a.CandidateID = c.CandidateID),
            AvgInterviewScore = ISNULL((
                SELECT AVG((f.TechnicalScore + f.CommunicationScore + f.CultureFitScore) / 3.0)
                FROM InterviewFeedback f
                JOIN Applications a ON f.ApplicationID = a.ApplicationID
                WHERE a.CandidateID = c.CandidateID
            ), 0)
        FROM Candidates c
        WHERE (@CandidateID IS NULL OR c.CandidateID = @CandidateID);
    END
    ELSE
    BEGIN
        RAISERROR('Invalid user role specified.', 16, 1);
    END
END