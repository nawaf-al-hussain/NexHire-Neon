const { query } = require('./server/db');

async function debugMatches(jobId) {
    try {
        const topN = 10;
        console.log(`Fetching matches for job ${jobId}...`);
        const matches = await query('SELECT * FROM sp_advancedcandidatematchingenhanced($1, $2)', [jobId, topN]);
        console.log(`Raw matches count: ${matches.length}`);
        
        const formattedMatches = matches.map(m => ({
            CandidateID: m.candidateid,
            FullName: m.fullname,
            YearsOfExperience: m.yearsofexperience,
            CandidateLocation: m.candidatelocation,
            TechnicalScore: parseFloat(m.technicalscore || 0),
            ExperienceScore: parseFloat(m.experiencescore || 0),
            BehavioralScore: parseFloat(m.behavioralscore || 0),
            EngagementScore: parseFloat(m.engagementscore || 0),
            LocationScore: parseFloat(m.locationscore || 0),
            TotalMatchScore: parseFloat(m.totalmatchscore || 0),
            Rank: parseInt(m.rank),
            HasApplied: m.hasapplied,
            MatchCategory: m.matchcategory,
            RecommendedAction: m.recommendedaction,
            SkillSummary: m.skillsummary
        }));
        
        console.log('Formatted first match:', JSON.stringify(formattedMatches[0], null, 2));
    } catch (err) {
        console.error('DEBUG ERROR:', err);
    }
}

debugMatches(1);
