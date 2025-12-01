-- Fix Diversity Analytics - Works with frontend chart
-- Frontend expects: { Demographic, Percentage, Count }

-- Insert diversity metrics if not exists
IF NOT EXISTS (SELECT 1 FROM DiversityMetrics)
BEGIN
    INSERT INTO DiversityMetrics (ApplicationID, Gender, Ethnicity, DisabilityStatus, VeteranStatus, AnonymizedHash)
    SELECT TOP 20
        a.ApplicationID,
        CASE (a.ApplicationID % 3) WHEN 0 THEN 'Female' WHEN 1 THEN 'Male' ELSE 'Non-Binary' END,
        CASE (a.ApplicationID % 5) WHEN 0 THEN 'Asian' WHEN 1 THEN 'Black' WHEN 2 THEN 'Hispanic' WHEN 3 THEN 'White' ELSE 'Other' END,
        0, 0,
        CONCAT('ANON_', a.ApplicationID)
    FROM Applications a
    WHERE a.IsDeleted = 0;
    
    PRINT 'Sample diversity data inserted!';
END

-- Drop and recreate view
IF OBJECT_ID('vw_DiversityAnalyticsFunnel', 'V') IS NOT NULL
    DROP VIEW vw_DiversityAnalyticsFunnel;
GO

CREATE VIEW vw_DiversityAnalyticsFunnel AS
SELECT 
    dm.Ethnicity AS Demographic,
    CAST(COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM DiversityMetrics), 0) AS DECIMAL(5,2)) AS Percentage,
    COUNT(*) AS Count,
    COUNT(DISTINCT a.ApplicationID) AS TotalApplications,
    SUM(CASE WHEN a.StatusID >= 2 THEN 1 ELSE 0 END) AS Screened,
    SUM(CASE WHEN a.StatusID >= 3 THEN 1 ELSE 0 END) AS Interviewed,
    SUM(CASE WHEN a.StatusID = 4 THEN 1 ELSE 0 END) AS Hired,
    SUM(CASE WHEN a.StatusID = 5 THEN 1 ELSE 0 END) AS Rejected,
    CAST(SUM(CASE WHEN a.StatusID = 4 THEN 1 ELSE 0 END) * 100.0 / 
         NULLIF(COUNT(DISTINCT a.ApplicationID), 0) AS DECIMAL(5,2)) AS HireRate
FROM Applications a
INNER JOIN DiversityMetrics dm ON a.ApplicationID = dm.ApplicationID
WHERE a.IsDeleted = 0
GROUP BY dm.Ethnicity;
GO

PRINT 'Diversity view fixed! Run this in SSMS.';
