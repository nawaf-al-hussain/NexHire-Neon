-- New view for Organizational Career Analytics
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