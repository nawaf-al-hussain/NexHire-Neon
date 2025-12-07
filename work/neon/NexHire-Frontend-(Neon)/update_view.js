const { query } = require('./server/db');

const sql = `
CREATE OR ALTER VIEW vw_GhostingRiskDashboard AS
SELECT 
    a.ApplicationID,
    a.CandidateID,
    c.FullName AS CandidateName,
    j.JobTitle,
    u.Username AS RecruiterName,
    ISNULL(gp_c.GhostingScore, 0) AS CandidateGhostingScore,
    ISNULL(gp_r.GhostingScore, 0) AS RecruiterGhostingScore,
    (ISNULL(gp_c.GhostingScore, 0) + ISNULL(gp_r.GhostingScore, 0)) / 2.0 AS OverallRiskScore,
    ISNULL(cl.AvgResponseTime, 0) AS AvgResponseTime,
    ISNULL(cl.TotalCommunications, 0) AS TotalCommunications,
    CASE 
        WHEN ISNULL(gp_c.GhostingScore, 0) >= 7 OR ISNULL(gp_r.GhostingScore, 0) >= 7 THEN 'High'
        WHEN ISNULL(gp_c.GhostingScore, 0) >= 5 OR ISNULL(gp_r.GhostingScore, 0) >= 5 THEN 'Medium'
        ELSE 'Low'
    END AS OverallRiskLevel,
    a.StatusID,
    s.StatusName,
    DATEDIFF(DAY, a.AppliedDate, GETDATE()) AS DaysSinceApplication
FROM Applications a
JOIN Candidates c ON a.CandidateID = c.CandidateID
JOIN JobPostings j ON a.JobID = j.JobID
JOIN Users u ON j.CreatedBy = u.UserID
JOIN ApplicationStatus s ON a.StatusID = s.StatusID
LEFT JOIN (
    SELECT UserID, AVG(GhostingScore) AS GhostingScore
    FROM GhostingPatterns 
    WHERE UserType = 'Candidate'
    GROUP BY UserID
) gp_c ON c.UserID = gp_c.UserID
LEFT JOIN (
    SELECT UserID, AVG(GhostingScore) AS GhostingScore
    FROM GhostingPatterns 
    WHERE UserType = 'Recruiter'
    GROUP BY UserID
) gp_r ON j.CreatedBy = gp_r.UserID
LEFT JOIN (
    SELECT 
        ApplicationID,
        AVG(DATEDIFF(HOUR, SentAt, RespondedAt)) AS AvgResponseTime,
        COUNT(*) AS TotalCommunications
    FROM CommunicationLogs
    WHERE RespondedAt IS NOT NULL
    GROUP BY ApplicationID
) cl ON a.ApplicationID = cl.ApplicationID
WHERE a.IsDeleted = 0;
`;

async function updateView() {
    try {
        await query(sql);
        console.log("Successfully updated vw_GhostingRiskDashboard in DB.");
        process.exit(0);
    } catch (err) {
        console.error("VIEW UPDATE ERROR:", err.message);
        process.exit(1);
    }
}

updateView();
