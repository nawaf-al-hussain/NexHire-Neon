-- Additional diversity analytics views

-- Gender diversity view
IF OBJECT_ID('vw_DiversityByGender', 'V') IS NOT NULL
    DROP VIEW vw_DiversityByGender;
GO

CREATE VIEW vw_DiversityByGender AS
SELECT 
    dm.Gender AS Demographic,
    CAST(COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM DiversityMetrics), 0) AS DECIMAL(5,2)) AS Percentage,
    COUNT(*) AS Count
FROM DiversityMetrics dm
WHERE dm.Gender IS NOT NULL
GROUP BY dm.Gender;
GO

-- Disability diversity view
IF OBJECT_ID('vw_DiversityByDisability', 'V') IS NOT NULL
    DROP VIEW vw_DiversityByDisability;
GO

CREATE VIEW vw_DiversityByDisability AS
SELECT 
    CASE WHEN dm.DisabilityStatus = 1 THEN 'With Disability' ELSE 'Without Disability' END AS Demographic,
    CAST(COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM DiversityMetrics), 0) AS DECIMAL(5,2)) AS Percentage,
    COUNT(*) AS Count
FROM DiversityMetrics dm
GROUP BY dm.DisabilityStatus;
GO

-- Veteran diversity view
IF OBJECT_ID('vw_DiversityByVeteran', 'V') IS NOT NULL
    DROP VIEW vw_DiversityByVeteran;
GO

CREATE VIEW vw_DiversityByVeteran AS
SELECT 
    CASE WHEN dm.VeteranStatus = 1 THEN 'Veteran' ELSE 'Non-Veteran' END AS Demographic,
    CAST(COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM DiversityMetrics), 0) AS DECIMAL(5,2)) AS Percentage,
    COUNT(*) AS Count
FROM DiversityMetrics dm
GROUP BY dm.VeteranStatus;
GO

PRINT 'Additional diversity views created!';
