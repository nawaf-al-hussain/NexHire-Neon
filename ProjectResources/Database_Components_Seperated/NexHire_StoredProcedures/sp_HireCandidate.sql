CREATE PROCEDURE sp_HireCandidate
    @ApplicationID INT,
    @RecruiterID INT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @JobID INT;
    DECLARE @Vacancies INT;
    DECLARE @CurrentStatusID INT;
    DECLARE @HiredStatusID INT;

    SELECT @HiredStatusID = StatusID FROM ApplicationStatus WHERE StatusName = 'Hired';

    BEGIN TRANSACTION;

    BEGIN TRY
        -- Lock both application and job posting rows
        SELECT 
            @JobID = a.JobID,
            @CurrentStatusID = a.StatusID
        FROM Applications a WITH (UPDLOCK, HOLDLOCK)
        WHERE a.ApplicationID = @ApplicationID;

        SELECT @Vacancies = Vacancies
        FROM JobPostings WITH (UPDLOCK, HOLDLOCK)
        WHERE JobID = @JobID;

        -- FIX-04: Check terminal states before lock
        IF @CurrentStatusID IN (4, 5)  -- Hired=4, Rejected=5
        BEGIN
            RAISERROR('Cannot hire candidate already in terminal state (Hired/Rejected).', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- Validate candidate is in Interview stage
        IF @CurrentStatusID <> 3
        BEGIN
            RAISERROR('Candidate not in Interview stage.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- Check remaining vacancies
        IF @Vacancies <= 0
        BEGIN
            RAISERROR('No vacancies remaining for this job.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- Update application to Hired
        UPDATE Applications
        SET StatusID = @HiredStatusID,
            StatusChangedAt = GETDATE()
        WHERE ApplicationID = @ApplicationID;

        -- Record in history
        INSERT INTO ApplicationStatusHistory (ApplicationID, FromStatusID, ToStatusID, ChangedBy, Notes)
        VALUES (@ApplicationID, @CurrentStatusID, @HiredStatusID, @RecruiterID, 'Hired by recruiter');

        -- Decrement vacancies
        UPDATE JobPostings
        SET Vacancies = Vacancies - 1
        WHERE JobID = @JobID;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;