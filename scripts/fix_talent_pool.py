"""Replace talent-pool route in recruiters.js with an optimized version that
uses a single SQL query with LEFT JOINs instead of N+1."""
from pathlib import Path

FILE = Path("/home/z/my-project/work/neon/NexHire-Frontend-(Neon)/server/routes/recruiters.js")
text = FILE.read_text(encoding='utf-8')

# Find the talent-pool route (lines 14 to 103, ends at the closing `});` before /search route)
# Use a marker-based search since we can't predict exact whitespace
START_MARKER = "router.get('/talent-pool', protect, authorize([1, 2]), async (req, res) => {"
END_MARKER = "\n});\n\n/**\n * @route   POST /api/recruiters/search"

start = text.find(START_MARKER)
if start == -1:
    print("NOT FOUND: talent-pool start marker")
    raise SystemExit(1)

end = text.find(END_MARKER, start)
if end == -1:
    print("NOT FOUND: talent-pool end marker")
    raise SystemExit(1)

# Extract the original block (including END_MARKER's `});\n`)
old_block = text[start:end + len("\n});\n")]

new_block = """router.get('/talent-pool', protect, authorize([1, 2]), async (req, res) => {
    const { search, location, minExperience } = req.query;

    try {
        // Single optimized query with LEFT JOINs — replaces the previous
        // N+1 pattern that made 5 separate queries per candidate
        // (250+ sequential round-trips for 50 candidates, ~37s on Neon,
        // exceeding Vercel's 60s function timeout).
        let queryStr = `
            SELECT 
                c.candidateid AS candidateid, 
                c.fullname AS fullname, 
                c.location AS location, 
                c.yearsofexperience AS yearsofexperience,
                (SELECT STRING_AGG(s.skillname, ', ') 
                 FROM candidateskills cs 
                 JOIN skills s ON cs.skillid = s.skillid 
                 WHERE cs.candidateid = c.candidateid) AS skills,
                COALESCE(ri.resumequalityscore, 0) AS resumescore,
                COALESCE(gr.overallrisklevel, 'Low') AS ghostingrisk,
                COALESCE(gm.points, 0) AS gamificationpoints,
                COALESCE(gm.level, 1) AS gamificationlevel,
                COALESCE(gm.streakdays, 0) AS streakdays,
                rp.remotepreference AS remotepreference,
                rf.relationshiptype AS referralsource
            FROM candidates c
            LEFT JOIN resumeinsights ri ON ri.candidateid = c.candidateid
            LEFT JOIN vw_ghostingriskdashboard gr ON gr.candidateid = c.candidateid
            LEFT JOIN candidategamification gm ON gm.candidateid = c.candidateid
            LEFT JOIN candidatelocationpreferences rp ON rp.candidateid = c.candidateid
            LEFT JOIN LATERAL (
                SELECT relationshiptype FROM referralnetwork
                WHERE referredcandidateid = c.candidateid LIMIT 1
            ) rf ON TRUE
            WHERE c.userid IN (SELECT userid FROM users WHERE isactive = TRUE)
        `;

        const params = [];

        if (search) {
            queryStr += ` AND c.fullname ILIKE ?`;
            params.push(`%${search}%`);
        }
        if (location) {
            queryStr += ` AND c.location ILIKE ?`;
            params.push(`%${location}%`);
        }
        if (minExperience) {
            queryStr += ` AND c.yearsofexperience >= ?`;
            params.push(parseInt(minExperience));
        }
        queryStr += ` ORDER BY c.fullname ASC`;

        const candidates = await query(queryStr, params);

        // Map to the field shape the frontend expects (PascalCase aliases
        // for the per-candidate enriched fields, matching the old route's
        // shape so TalentPool.jsx doesn't break).
        const enriched = candidates.map(c => ({
            ...c,
            ResumeScore: c.resumescore,
            GhostingRisk: c.ghostingrisk,
            GamificationPoints: c.gamificationpoints,
            GamificationLevel: c.gamificationlevel,
            StreakDays: c.streakdays,
            RemotePreference: c.remotepreference,
            ReferralSource: c.referralsource,
        }));

        res.json(enriched);
    } catch (err) {
        console.error("Talent Pool Fetch Error:", err.message);
        res.status(500).json({ error: `Failed to fetch talent pool: ${err.message}` });
    }
});
"""

# Preserve the trailing newlines that END_MARKER included
new_block_full = new_block + "\n"

text = text[:start] + new_block_full + text[end + len("\n});\n"):]

FILE.write_text(text, encoding='utf-8')
print("OK: replaced talent-pool route with optimized version")
print(f"Old block: {len(old_block)} chars")
print(f"New block: {len(new_block_full)} chars")
