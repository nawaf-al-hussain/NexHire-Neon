-- Updated stored procedure with RejectionReason parameter
-- Run this in SSMS to update the existing procedure

USE RecruitmentDB;
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_UpdateApplicationStatus]') AND type in (N'P', N'PC'))
DROP PROCEDURE [dbo].[sp_UpdateApplicationStatus];
GO

CREATE PROCEDURE sp_UpdateApplicationStatus
    @ApplicationID INT,
    @NewStatusID INT,
    @ChangedBy INT,
    @Notes NVARCHAR(500) = NULL,
    @RejectionReason NVARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @CurrentStatusID INT;

    -- Get current status
    SELECT @CurrentStatusID = StatusID
    FROM Applications
    WHERE ApplicationID = @ApplicationID;

    IF @CurrentStatusID IS NULL
    BEGIN
        RAISERROR ('Application not found.', 16, 1);
        RETURN;
    END

    -- Prevent changes after terminal states
    IF @CurrentStatusID IN (4, 5)
    BEGIN
        RAISERROR ('Cannot modify a terminal application state.', 16, 1);
        RETURN;
    END

    -- Validate transition
    IF NOT EXISTS (
        SELECT 1
        FROM ApplicationStatusTransitions
        WHERE FromStatusID = @CurrentStatusID
          AND ToStatusID = @NewStatusID
    )
    BEGIN
        RAISERROR ('Invalid application status transition.', 16, 1);
        RETURN;
    END

    -- Perform update (include RejectionReason if status is Rejected)
    IF @NewStatusID = 5 AND @RejectionReason IS NOT NULL
    BEGIN
        UPDATE Applications
        SET StatusID = @NewStatusID,
            StatusChangedAt = GETDATE(),
            RejectionReason = @RejectionReason
        WHERE ApplicationID = @ApplicationID;
    END
    ELSE
    BEGIN
        UPDATE Applications
        SET StatusID = @NewStatusID,
            StatusChangedAt = GETDATE()
        WHERE ApplicationID = @ApplicationID;
    END

    -- Record in status history
    INSERT INTO ApplicationStatusHistory (ApplicationID, FromStatusID, ToStatusID, ChangedBy, Notes)
    VALUES (@ApplicationID, @CurrentStatusID, @NewStatusID, @ChangedBy, @Notes);
END;
GO
