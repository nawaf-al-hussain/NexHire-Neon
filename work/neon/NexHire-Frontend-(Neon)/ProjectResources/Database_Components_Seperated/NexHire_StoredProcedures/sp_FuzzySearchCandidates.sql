CREATE PROCEDURE sp_FuzzySearchCandidates
    @SearchName NVARCHAR(100),
    @Threshold FLOAT = 0.85
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        CandidateID,
        FullName,
        CAST(dbo.JaroWinklerSimilarity(FullName, @SearchName) AS DECIMAL(5,3)) AS JWScore,
        dbo.LevenshteinDistance(FullName, @SearchName) AS LevenDistance
    FROM Candidates
    WHERE dbo.JaroWinklerSimilarity(FullName, @SearchName) >= @Threshold
    ORDER BY JWScore DESC, LevenDistance ASC;
END;