CREATE PROCEDURE sp_ScheduleInterviewWithTimezone
    @ApplicationID INT,
    @RecruiterID INT,
    @StartTimeUTC DATETIME,
    @EndTimeUTC DATETIME,
    @CandidateTimezone NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @CandidateID INT;
    SELECT @CandidateID = CandidateID FROM Applications WHERE ApplicationID = @ApplicationID;
    
    IF @CandidateTimezone IS NULL
        SELECT @CandidateTimezone = Timezone FROM Candidates WHERE CandidateID = @CandidateID;
    
    IF @CandidateTimezone IS NULL
        SET @CandidateTimezone = 'UTC';
    
    DECLARE @CandidateLocalStart DATETIME = dbo.ConvertTimezone(@StartTimeUTC, 'UTC', @CandidateTimezone);
    DECLARE @CandidateLocalEnd DATETIME = dbo.ConvertTimezone(@EndTimeUTC, 'UTC', @CandidateTimezone);
    
    INSERT INTO InterviewSchedules (ApplicationID, RecruiterID, InterviewStart, InterviewEnd)
    VALUES (@ApplicationID, @RecruiterID, @StartTimeUTC, @EndTimeUTC);
    
    SELECT 
        @@IDENTITY AS ScheduleID,
        @StartTimeUTC AS InterviewStartUTC,
        @EndTimeUTC AS InterviewEndUTC,
        @CandidateLocalStart AS CandidateLocalStart,
        @CandidateLocalEnd AS CandidateLocalEnd,
        @CandidateTimezone AS CandidateTimezone,
        'Interview scheduled. Candidate will see: ' + 
        CONVERT(VARCHAR, @CandidateLocalStart, 100) + ' to ' + 
        CONVERT(VARCHAR, @CandidateLocalEnd, 100) + ' ' + @CandidateTimezone AS Message;
END;