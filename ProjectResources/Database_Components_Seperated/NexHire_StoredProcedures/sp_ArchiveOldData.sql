CREATE PROCEDURE sp_ArchiveOldData
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. ARCHIVE JOB POSTINGS
    INSERT INTO JobPostingsArchive (JobID, JobTitle, Description, Location, Vacancies, CreatedAt)
    SELECT JobID, JobTitle, Description, Location, Vacancies, CreatedAt
    FROM JobPostings
    WHERE (CreatedAt < DATEADD(MONTH, -6, GETDATE()) OR IsDeleted = 1)
      AND JobID NOT IN (SELECT JobID FROM JobPostingsArchive);

    -- 2. ARCHIVE APPLICATIONS ATTACHED TO ARCHIVED JOBS
    INSERT INTO ApplicationsArchive (ApplicationID, CandidateID, JobID, StatusID, AppliedDate)
    SELECT ApplicationID, CandidateID, JobID, StatusID, AppliedDate
    FROM Applications
    WHERE JobID IN (SELECT JobID FROM JobPostingsArchive)
      AND ApplicationID NOT IN (SELECT ApplicationID FROM ApplicationsArchive);

    -- 3. ARCHIVE OLD REJECTED APPLICATIONS
    INSERT INTO ApplicationsArchive (ApplicationID, CandidateID, JobID, StatusID, AppliedDate)
    SELECT ApplicationID, CandidateID, JobID, StatusID, AppliedDate
    FROM Applications
    WHERE StatusID = 5
      AND AppliedDate < DATEADD(YEAR, -1, GETDATE())
      AND ApplicationID NOT IN (SELECT ApplicationID FROM ApplicationsArchive);

    -- 4. CLEAN UP / SOFT DELETE
    UPDATE JobPostings
    SET IsDeleted = 1, IsActive = 0
    WHERE JobID IN (SELECT JobID FROM JobPostingsArchive);

    UPDATE Applications
    SET IsDeleted = 1
    WHERE ApplicationID IN (SELECT ApplicationID FROM ApplicationsArchive);

    PRINT 'Archival process completed successfully.';
END;