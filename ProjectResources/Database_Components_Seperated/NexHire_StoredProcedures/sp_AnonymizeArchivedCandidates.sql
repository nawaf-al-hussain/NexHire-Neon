CREATE PROCEDURE sp_AnonymizeArchivedCandidates
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Candidates
    SET FullName = CONCAT('Candidate_', CandidateID),
        Location = 'Anonymized'
    WHERE CandidateID IN (
        SELECT DISTINCT CandidateID
        FROM ApplicationsArchive
    );

    UPDATE Users
    SET Email = CONCAT('anonymized_', UserID, '@archived.local')
    WHERE UserID IN (
        SELECT DISTINCT c.UserID
        FROM Candidates c
        WHERE c.CandidateID IN (
            SELECT DISTINCT CandidateID
            FROM ApplicationsArchive
        )
    );
END;