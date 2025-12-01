CREATE PROCEDURE sp_ScheduleInterviewWithRecruiter
    @ApplicationID INT,
    @RecruiterUserID INT,
    @StartTime DATETIME,
    @EndTime DATETIME
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @RecruiterID INT;

    SELECT @RecruiterID = RecruiterID FROM Recruiters WHERE UserID = @RecruiterUserID;

    IF @RecruiterID IS NULL
    BEGIN
        RAISERROR ('Unauthorized: User is not registered as a Recruiter.', 16, 1);
        RETURN;
    END

    INSERT INTO InterviewSchedules (ApplicationID, RecruiterID, InterviewStart, InterviewEnd)
    VALUES (@ApplicationID, @RecruiterID, @StartTime, @EndTime);
END;