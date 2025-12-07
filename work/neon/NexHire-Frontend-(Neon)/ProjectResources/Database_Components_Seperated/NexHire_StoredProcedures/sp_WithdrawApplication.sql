CREATE PROCEDURE sp_WithdrawApplication
    @ApplicationID INT,
    @CandidateID INT,
    @Reason NVARCHAR(500)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @CurrentStatusID INT, @WithdrawnStatusID INT, @UserID INT;

    SELECT @WithdrawnStatusID = StatusID FROM ApplicationStatus WHERE StatusName = 'Withdrawn';
    
    -- Get both the Status AND the UserID for the history log
    SELECT @CurrentStatusID = a.StatusID, @UserID = c.UserID
    FROM Applications a
    JOIN Candidates c ON a.CandidateID = c.CandidateID
    WHERE a.ApplicationID = @ApplicationID AND a.CandidateID = @CandidateID;

    IF @CurrentStatusID IS NULL
    BEGIN
        RAISERROR ('Application not found or does not belong to candidate.', 16, 1);
        RETURN;
    END

    -- Cannot withdraw if already hired or rejected
    IF @CurrentStatusID IN (4, 5)
    BEGIN
        RAISERROR ('Cannot withdraw application in final state.', 16, 1);
        RETURN;
    END

    -- Update application
    UPDATE Applications
    SET StatusID = @WithdrawnStatusID,
        WithdrawnAt = GETDATE(),
        WithdrawalReason = @Reason,
        StatusChangedAt = GETDATE()
    WHERE ApplicationID = @ApplicationID;

    -- Record in history
    INSERT INTO ApplicationStatusHistory (ApplicationID, FromStatusID, ToStatusID, ChangedBy, Notes)
    VALUES (@ApplicationID, @CurrentStatusID, @WithdrawnStatusID, @UserID, 'Withdrawn: ' + @Reason);
END;