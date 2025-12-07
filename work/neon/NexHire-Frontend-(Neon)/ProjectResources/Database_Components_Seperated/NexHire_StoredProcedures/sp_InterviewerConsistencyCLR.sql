CREATE PROCEDURE sp_InterviewerConsistencyCLR
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT
        f.InterviewerID,
        u.Username AS InterviewerName,
        COUNT(*) AS InterviewCount,
        AVG((f.TechnicalScore + f.CommunicationScore + f.CultureFitScore) / 3.0) AS AvgScore,
        dbo.StandardDeviation(
            (SELECT STRING_AGG(CAST((TechnicalScore + CommunicationScore + CultureFitScore) / 3.0 AS VARCHAR), ',')
             FROM InterviewFeedback WHERE InterviewerID = f.InterviewerID)
        ) AS ScoreStdDev,
        CASE 
            WHEN dbo.StandardDeviation(
                (SELECT STRING_AGG(CAST((TechnicalScore + CommunicationScore + CultureFitScore) / 3.0 AS VARCHAR), ',')
                 FROM InterviewFeedback WHERE InterviewerID = f.InterviewerID)
            ) > 2.5 THEN 'Inconsistent - review scoring calibration'
            ELSE 'Consistent'
        END AS ConsistencyAssessment
    FROM InterviewFeedback f
    JOIN Users u ON f.InterviewerID = u.UserID
    GROUP BY f.InterviewerID, u.Username
    HAVING COUNT(*) >= 3
    ORDER BY ScoreStdDev DESC;
END;