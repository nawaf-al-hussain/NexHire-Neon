const { query } = require('./server/db');

async function checkTalentPool() {
    try {
        console.log("Checking Talent Pool query...");
        const sql = `
            SELECT 
                c.CandidateID, 
                c.FullName, 
                c.Location, 
                c.YearsExperience,
                c.ReferralSource,
                ri.QualityScore as ResumeScore,
                gr.OverallRiskLevel as GhostingRisk,
                (SELECT STRING_AGG(s.SkillName, ', ') 
                 FROM CandidateSkills cs 
                 JOIN Skills s ON cs.SkillID = s.SkillID 
                 WHERE cs.CandidateID = c.CandidateID) as Skills
            FROM Candidates c
            LEFT JOIN ResumeInsights ri ON c.CandidateID = ri.CandidateID
            LEFT JOIN vw_GhostingRiskDashboard gr ON c.CandidateID = gr.CandidateID
            WHERE c.IsDeleted = 0
            ORDER BY c.FullName ASC
        `;
        const results = await query(sql);
        console.log("Results count:", results.length);
        if (results.length > 0) console.log("First row keys:", Object.keys(results[0]));
    } catch (err) {
        console.error("TALENT POOL ERROR:", err.message);
        console.error("SQL:", err.sql);
    }
}

checkTalentPool();
