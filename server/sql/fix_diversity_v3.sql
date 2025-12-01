-- Fix Diversity Analytics - Make view compatible with frontend chart
-- Chart expects: { Demographic, Percentage, Count }

IF OBJECT_ID('vw_DiversityAnalyticsFunnel', 'V') IS NOT NULL
    DROP VIEW vw_DiversityAnalyticsFunnel;
GO

CREATE VIEW vw_DiversityAnalyticsFunnel AS
SELECT 
    dm.Ethnicity AS Demographic,
    CAST(COUNT(*) * 100.0 / NULLIF(SUM(COUNT(*)) OVER(), 0) AS DECIMAL(5,2)) AS Percentage,
    COUNT(*) AS Count,
    COUNT(DISTINCT a.ApplicationID) AS TotalApplications,
    SUM(CASE WHEN a.StatusID >= 2 THEN 1 ELSE 0 END) AS Screened,
    SUM(CASE WHEN a.StatusID >= 3 THEN 1 ELSE 0 END) AS Interviewed,
    SUM(CASE WHEN a.StatusID = 4 THEN 1 ELSE 0 END) AS Hired,
    SUM(CASE WHEN a.StatusID = 5 THEN 1 ELSE 0 END) AS Rejected,
    CAST(SUM(CASE WHEN a.StatusID = 4 THEN 1 ELSE 0 END) * 100.0 / 
         NULLIF(COUNT(DISTINCT a.ApplicationID), 0) AS DECIMAL(5,2)) AS HireRate
FROM Applications a
LEFT JOIN DiversityMetrics dm ON a.ApplicationID = dm.ApplicationID
WHERE a.IsDeleted = 0
AND dm.Ethnicity IS NOT NULL
GROUP BY dm.Ethnicity;
GO

PRINT 'Diversity view updated with correct column names for frontend!';
