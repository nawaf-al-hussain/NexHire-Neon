CREATE PROCEDURE sp_AutoRejectUnqualified
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @RejectedStatusID INT;

    SELECT @RejectedStatusID = StatusID 
    FROM ApplicationStatus 
    WHERE StatusName = 'Rejected';

    -- Update applications where candidate doesn't meet minimum experience
    UPDATE Applications
    SET StatusID = @RejectedStatusID,
        RejectionReason = 'Does not meet minimum experience requirement',
        StatusChangedAt = GETDATE()
    WHERE ApplicationID IN (
        SELECT a.ApplicationID
        FROM Applications a
        JOIN Candidates c ON a.CandidateID = c.CandidateID
        JOIN JobPostings j ON a.JobID = j.JobID
        WHERE c.YearsOfExperience < j.MinExperience
          AND a.StatusID = 1
    );
END;