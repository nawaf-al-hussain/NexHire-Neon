const { query } = require('./server/db');

const sql = `
            SELECT 
                c.CandidateID, 
                c.FullName, 
                c.Location, 
                c.YearsOfExperience,
                ri.ResumeQualityScore as ResumeScore,
                gr.OverallRiskLevel as GhostingRisk,
                (SELECT STRING_AGG(s.SkillName, ', ') 
                 FROM CandidateSkills cs 
                 JOIN Skills s ON cs.SkillID = s.SkillID 
                 WHERE cs.CandidateID = c.CandidateID) as Skills
            FROM Candidates c
            LEFT JOIN ResumeInsights ri ON c.CandidateID = ri.CandidateID
            LEFT JOIN vw_GhostingRiskDashboard gr ON c.CandidateID = gr.CandidateID
            WHERE c.UserID IN (SELECT UserID FROM Users WHERE IsActive = 1)
            ORDER BY c.FullName ASC
`;

async function check() {
    try {
        const results = await query(sql);
        console.log("SUCCESS. Row count:", results.length);
    } catch (err) {
        console.error("FINAL ERROR:", err.message);
    }
}

check();
