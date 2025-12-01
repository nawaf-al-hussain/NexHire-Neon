CREATE PROCEDURE sp_AdvancedCandidateMatchingEnhanced
    @JobID INT,
    @TopN INT = 10
AS
BEGIN
    SET NOCOUNT ON;
    
    WITH CandidateScores AS (
        SELECT 
            c.CandidateID,
            c.FullName,
            c.YearsOfExperience,
            c.Location AS CandidateLocation,
            HasApplied = CASE WHEN EXISTS (SELECT 1 FROM Applications WHERE JobID = @JobID AND CandidateID = c.CandidateID AND IsDeleted = 0) THEN 1 ELSE 0 END,
            
            TechnicalScore = CAST((
                SELECT AVG(
                    CASE 
                        WHEN cs.ProficiencyLevel >= js.MinProficiency THEN 1.0
                        ELSE cs.ProficiencyLevel * 1.0 / NULLIF(js.MinProficiency, 1)
                    END
                ) * 40
                FROM JobSkills js
                LEFT JOIN CandidateSkills cs ON js.SkillID = cs.SkillID AND cs.CandidateID = c.CandidateID
                WHERE js.JobID = @JobID
            ) AS DECIMAL(5,2)),
            
            ExperienceScore = CAST(
                CASE 
                    WHEN c.YearsOfExperience >= j.MinExperience THEN 25
                    ELSE (c.YearsOfExperience * 25.0 / NULLIF(j.MinExperience, 1))
                END AS DECIMAL(5,2)),
            
            BehavioralScore = CAST(
                ISNULL((
                    SELECT AVG((CAST(f.TechnicalScore AS DECIMAL) + f.CommunicationScore + f.CultureFitScore) / 30.0 * 20)
                    FROM InterviewFeedback f
                    JOIN Applications a ON f.ApplicationID = a.ApplicationID
                    WHERE a.CandidateID = c.CandidateID
                ), 10) AS DECIMAL(5,2)),
            
            EngagementScore = CAST(
                ISNULL((
                    SELECT 
                        CASE 
                            WHEN AVG(DATEDIFF(HOUR, cl.SentAt, cl.RespondedAt)) < 24 THEN 10
                            WHEN AVG(DATEDIFF(HOUR, cl.SentAt, cl.RespondedAt)) < 48 THEN 7
                            ELSE 3
                        END
                    FROM CommunicationLogs cl
                    WHERE cl.ReceiverID = c.UserID
                ), 5) AS DECIMAL(5,2)),
            
            LocationScore = CAST(
                CASE 
                    WHEN c.Location = j.Location THEN 5
                    WHEN c.Location LIKE '%' + j.Location + '%' THEN 4
                    ELSE 2
                END AS DECIMAL(5,2))
            
        FROM Candidates c
        CROSS JOIN (SELECT Location, MinExperience FROM JobPostings WHERE JobID = @JobID) j
        WHERE EXISTS (
            SELECT 1 FROM CandidateSkills cs
            WHERE cs.CandidateID = c.CandidateID
              AND cs.SkillID IN (SELECT SkillID FROM JobSkills WHERE JobID = @JobID AND IsMandatory = 1)
        )
    ),
    RankedCandidates AS (
        SELECT 
            *,
            TotalMatchScore = TechnicalScore + ExperienceScore + BehavioralScore + EngagementScore + LocationScore,
            ROW_NUMBER() OVER (ORDER BY (TechnicalScore + ExperienceScore + BehavioralScore + EngagementScore + LocationScore) DESC) AS Rank
        FROM CandidateScores
    )
    SELECT TOP (@TopN)
        rc.CandidateID,
        rc.FullName,
        rc.YearsOfExperience,
        rc.CandidateLocation,
        rc.HasApplied,
        rc.TechnicalScore,
        rc.ExperienceScore,
        rc.BehavioralScore,
        rc.EngagementScore,
        rc.LocationScore,
        rc.TotalMatchScore,
        rc.Rank,
        MatchCategory = CASE 
            WHEN rc.TotalMatchScore >= 85 THEN 'Excellent Match'
            WHEN rc.TotalMatchScore >= 70 THEN 'Good Match'
            WHEN rc.TotalMatchScore >= 55 THEN 'Moderate Match'
            ELSE 'Basic Match'
        END,
        RecommendedAction = CASE 
            WHEN rc.TotalMatchScore >= 85 THEN 'Strong candidate - prioritize for interview'
            WHEN rc.TotalMatchScore >= 70 THEN 'Good candidate - schedule interview'
            WHEN rc.TotalMatchScore >= 55 THEN 'Consider for screening'
            ELSE 'Review for specific strengths'
        END,
        SkillSummary = (
            SELECT STRING_AGG(s.SkillName + ' (Lvl ' + CAST(cs.ProficiencyLevel AS VARCHAR) + ')', ', ')
            FROM CandidateSkills cs
            JOIN Skills s ON cs.SkillID = s.SkillID
            WHERE cs.CandidateID = rc.CandidateID
              AND cs.SkillID IN (SELECT SkillID FROM JobSkills WHERE JobID = @JobID)
        )
    FROM RankedCandidates rc
    ORDER BY rc.TotalMatchScore DESC;
END