-- Fix Diversity Analytics - Corrected column names
-- The DiversityMetrics table has: Gender, Ethnicity, DisabilityStatus, VeteranStatus, etc.

-- Add sample diversity metrics data (use correct column names)
INSERT INTO DiversityMetrics (ApplicationID, Gender, Ethnicity, DisabilityStatus, VeteranStatus, AnonymizedHash)
SELECT 
    a.ApplicationID,
    CASE (a.ApplicationID % 3) 
        WHEN 0 THEN 'Female' 
        WHEN 1 THEN 'Male' 
        ELSE 'Non-Binary' 
    END,
    CASE (a.ApplicationID % 5)
        WHEN 0 THEN 'Asian'
        WHEN 1 THEN 'Black'
        WHEN 2 THEN 'Hispanic'
        WHEN 3 THEN 'White'
        ELSE 'Other'
    END,
    0,  -- DisabilityStatus (BIT)
    0,   -- VeteranStatus (BIT)
    CONCAT('ANON_', a.ApplicationID)
FROM Applications a
WHERE a.IsDeleted = 0
AND a.ApplicationID NOT IN (SELECT ISNULL(ApplicationID, 0) FROM DiversityMetrics WHERE ApplicationID IS NOT NULL);

-- Create working view that groups by Ethnicity
IF OBJECT_ID('vw_DiversityAnalyticsFunnel', 'V') IS NOT NULL
    DROP VIEW vw_DiversityAnalyticsFunnel;
GO

CREATE VIEW vw_DiversityAnalyticsFunnel AS
SELECT 
    dm.Ethnicity AS DiversityCategory,
    COUNT(DISTINCT a.ApplicationID) AS TotalApplications,
    SUM(CASE WHEN a.StatusID >= 2 THEN 1 ELSE 0 END) AS Screened,
    SUM(CASE WHEN a.StatusID >= 3 THEN 1 ELSE 0 END) AS Interviewed,
    SUM(CASE WHEN a.StatusID = 4 THEN 1 ELSE 0 END) AS Hired,
    SUM(CASE WHEN a.StatusID = 5 THEN 1 ELSE 0 END) AS Rejected,
    CAST(SUM(CASE WHEN a.StatusID = 4 THEN 1 ELSE 0 END) * 100.0 / 
         NULLIF(COUNT(DISTINCT a.ApplicationID), 0) AS DECIMAL(5,2)) AS HireRate,
    AVG(CASE WHEN a.StatusID = 4 THEN DATEDIFF(DAY, a.AppliedDate, a.StatusChangedAt) 
        ELSE DATEDIFF(DAY, a.AppliedDate, GETDATE()) END) AS AvgDaysInProcess
FROM Applications a
LEFT JOIN DiversityMetrics dm ON a.ApplicationID = dm.ApplicationID
WHERE a.IsDeleted = 0
GROUP BY dm.Ethnicity;
GO

PRINT 'Diversity analytics fixed!';
