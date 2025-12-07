CREATE PROCEDURE sp_ConfirmInterview
    @ScheduleID INT,
    @UserID INT
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1 
        FROM InterviewSchedules i
        JOIN Applications a ON i.ApplicationID = a.ApplicationID
        JOIN Candidates c ON a.CandidateID = c.CandidateID
        WHERE i.ScheduleID = @ScheduleID AND c.UserID = @UserID
    )
    BEGIN
        UPDATE InterviewSchedules
        SET CandidateConfirmed = 1
        WHERE ScheduleID = @ScheduleID;

        SELECT 'Success' AS Status, 'Interview confirmed.' AS Message;
    END
    ELSE
    BEGIN
        RAISERROR('Unauthorized: This interview does not belong to your account.', 16, 1);
    END
END;