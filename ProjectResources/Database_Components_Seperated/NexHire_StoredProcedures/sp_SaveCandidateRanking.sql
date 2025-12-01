CREATE PROCEDURE sp_SaveCandidateRanking
    @CandidateID INT,
    @JobID INT,
    @MatchScore DECIMAL(5,2)
AS
BEGIN
    INSERT INTO CandidateRankingHistory (CandidateID, JobID, MatchScore)
    VALUES (@CandidateID, @JobID, @MatchScore);
END;