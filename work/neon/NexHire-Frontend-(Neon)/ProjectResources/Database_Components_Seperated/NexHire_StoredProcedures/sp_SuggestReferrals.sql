CREATE PROCEDURE sp_SuggestReferrals
    @JobID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @RequiredSkills NVARCHAR(MAX);
    DECLARE @Location VARCHAR(100);
    DECLARE @MinExperience INT;
    
    SELECT @Location = j.Location,
           @MinExperience = j.MinExperience
    FROM JobPostings j
    WHERE j.JobID = @JobID;
    
    SELECT @RequiredSkills = STRING_AGG(s.SkillName, ',')
    FROM JobSkills js
    JOIN Skills s ON js.SkillID = s.SkillID
    WHERE js.JobID = @JobID AND js.IsMandatory = 1;
    
    WITH PotentialReferrers AS (
        SELECT 
            c.CandidateID,
            c.FullName,
            c.YearsOfExperience,
            c.Location,
            (
                SELECT COUNT(*) 
                FROM NetworkStrength ns 
                WHERE ns.CandidateID = c.CandidateID 
                AND ns.ConnectionStrength >= 7
            ) AS StrongConnectionsCount,
            ISNULL(rp.ConversionRate, 0) AS HistoricalConversionRate,
            (
                SELECT COUNT(*) 
                FROM CandidateSkills cs
                JOIN JobSkills js ON cs.SkillID = js.SkillID
                WHERE cs.CandidateID = c.CandidateID
                AND js.JobID = @JobID
                AND js.IsMandatory = 1
            ) * 100.0 / NULLIF((
                SELECT COUNT(*) 
                FROM JobSkills 
                WHERE JobID = @JobID AND IsMandatory = 1
            ), 0) AS SkillsMatchPercent
        FROM Candidates c
        LEFT JOIN ReferralPerformance rp ON rp.ReferrerID = c.CandidateID
        WHERE c.YearsOfExperience >= @MinExperience * 0.8
    ),
    NetworkAnalysis AS (
        SELECT 
            pr.CandidateID AS ReferrerID,
            pr.FullName AS ReferrerName,
            pr.HistoricalConversionRate,
            pr.SkillsMatchPercent,
            (
                SELECT TOP 5
                    c2.CandidateID,
                    c2.FullName,
                    c2.YearsOfExperience,
                    c2.Location,
                    ns.ConnectionStrength,
                    ns.TrustLevel,
                    (
                        SELECT COUNT(*) 
                        FROM CandidateSkills cs
                        JOIN JobSkills js ON cs.SkillID = js.SkillID
                        WHERE cs.CandidateID = c2.CandidateID
                        AND js.JobID = @JobID
                        AND js.IsMandatory = 1
                    ) AS MatchingSkillsCount,
                    (
                        CASE WHEN c2.YearsOfExperience >= @MinExperience THEN 20 ELSE 10 END +
                        CASE WHEN c2.Location = @Location THEN 15 ELSE 5 END +
                        ns.ConnectionStrength * 5 +
                        ns.TrustLevel * 4 +
                        (
                            SELECT COUNT(*) 
                            FROM CandidateSkills cs
                            JOIN JobSkills js ON cs.SkillID = js.SkillID
                            WHERE cs.CandidateID = c2.CandidateID
                            AND js.JobID = @JobID
                            AND js.IsMandatory = 1
                        ) * 10
                    ) AS FitScore
                FROM NetworkStrength ns
                JOIN Candidates c2 ON ns.ConnectionID = c2.CandidateID
                WHERE ns.CandidateID = pr.CandidateID
                    AND c2.CandidateID NOT IN (
                        SELECT CandidateID FROM Applications WHERE JobID = @JobID
                    )
                    AND ns.ConnectionStrength >= 5
                ORDER BY FitScore DESC
                FOR JSON PATH
            ) AS PotentialReferrals
        FROM PotentialReferrers pr
        WHERE pr.StrongConnectionsCount >= 3
            AND pr.SkillsMatchPercent >= 50
    )
    SELECT 
        ReferrerID,
        ReferrerName,
        HistoricalConversionRate,
        SkillsMatchPercent,
        PotentialReferrals,
        (HistoricalConversionRate * 0.6 + SkillsMatchPercent * 0.4) AS ReferrerQualityScore,
        CASE 
            WHEN HistoricalConversionRate >= 70 THEN 'High (>70%)'
            WHEN HistoricalConversionRate >= 50 THEN 'Medium (50-70%)'
            WHEN HistoricalConversionRate >= 30 THEN 'Low (30-50%)'
            ELSE 'Very Low (<30%)'
        END AS EstimatedSuccessProbability
    FROM NetworkAnalysis
    WHERE PotentialReferrals IS NOT NULL
    ORDER BY ReferrerQualityScore DESC;
END;