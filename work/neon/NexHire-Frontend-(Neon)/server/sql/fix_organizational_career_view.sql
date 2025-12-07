-- Drop existing view if it exists
IF OBJECT_ID('vw_OrganizationalCareerInsights', 'V') IS NOT NULL
    DROP VIEW vw_OrganizationalCareerInsights;
GO

-- Create simplified view without problematic LEFT JOIN
CREATE VIEW vw_OrganizationalCareerInsights AS
SELECT 
    cp.FromRole AS CurrentRole,
    cp.ToRole AS NextRole,
    COUNT(*) AS TransitionCount,
    AVG(cp.Probability) AS AvgProbability,
    AVG(cp.AvgTransitionMonths) AS AvgMonthsToPromote,
    AVG(cp.SalaryIncreaseAvg) AS AvgSalaryIncreasePct,
    MAX(cp.FutureProofScore) AS MaxFutureProofScore
FROM CareerPaths cp
GROUP BY cp.FromRole, cp.ToRole;
GO

-- Insert more career path data for variety
INSERT INTO CareerPaths (FromRole, ToRole, AvgTransitionMonths, Probability, SalaryIncreaseAvg, FutureProofScore)
VALUES 
('Junior Frontend Engineer', 'Senior Frontend Engineer', 36, 0.75, 45.0, 85),
('Senior Frontend Engineer', 'Tech Lead', 24, 0.65, 35.0, 80),
('Junior Data Scientist', 'Senior Data Scientist', 30, 0.72, 50.0, 90),
('Senior Data Scientist', 'Lead Data Scientist', 24, 0.60, 40.0, 85),
('Junior DevOps Engineer', 'Senior DevOps Engineer', 30, 0.70, 42.0, 88),
('Senior DevOps Engineer', 'Platform Architect', 24, 0.55, 38.0, 82),
('Junior Product Designer', 'Senior Product Designer', 36, 0.68, 38.0, 78),
('Senior Product Designer', 'Design Manager', 30, 0.58, 32.0, 75),
('Junior QA Engineer', 'Senior QA Engineer', 30, 0.72, 40.0, 80),
('Senior QA Engineer', 'QA Lead', 24, 0.62, 35.0, 77),
('Junior Full Stack Engineer', 'Senior Full Stack Engineer', 36, 0.73, 42.0, 86),
('Senior Full Stack Engineer', 'Principal Engineer', 24, 0.58, 45.0, 88);
GO

PRINT 'View updated and additional career paths inserted successfully!';
