const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { protect, authorize } = require('../middleware/rbac');
const { callRestApi, geocodeAddress, calculateDistance, verifyLinkedInProfile } = require('../externalApi');

/**
 * @route   GET /api/recruiters/talent-pool
 * @desc    Get all candidates with integrated insights
 * @access  Private (Recruiter/Admin)
 * 
 * Returns: CandidateID, FullName, Location, YearsOfExperience, ResumeScore, GhostingRisk,
 *          Skills, GamificationPoints, GamificationLevel, StreakDays, RemotePreference, ReferralSource
 */
router.get('/talent-pool', protect, authorize([1, 2]), async (req, res) => {
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


/**
 * @route   POST /api/recruiters/talent-pool/invite
 * @desc    Invite one or more candidates from the talent pool to apply for a job
 * @access  Private (Recruiter/Admin)
 */
router.post('/talent-pool/invite', protect, authorize([1, 2]), async (req, res) => {
    const { candidateIDs, jobID } = req.body;

    if (!candidateIDs || !Array.isArray(candidateIDs) || candidateIDs.length === 0) {
        return res.status(400).json({ error: "candidateIDs array is required." });
    }
    if (!jobID) {
        return res.status(400).json({ error: "jobID is required." });
    }

    try {
        // Verify the job exists and is active
        const jobCheck = await query("SELECT jobid FROM jobpostings WHERE jobid = ? AND isactive = true AND isdeleted = false", [jobID]);
        if (jobCheck.length === 0) {
            return res.status(404).json({ error: "Job not found or inactive." });
        }

        // For each candidate, create an application if one doesn't already exist
        let invited = 0;
        let skipped = 0;
        const userID = req.user.userid;

        for (const candidateID of candidateIDs) {
            // Check if application already exists for this candidate + job
            const existing = await query(
                "SELECT applicationid FROM applications WHERE candidateid = ? AND jobid = ? AND isdeleted = false",
                [candidateID, jobID]
            );

            if (existing.length > 0) {
                skipped++;
                continue;
            }

            // Create new application with status "Invited" (statusid = 7)
            await query(
                `INSERT INTO applications (candidateid, jobid, statusid, applieddate, isdeleted)
                 VALUES (?, ?, 7, NOW(), false)`,
                [candidateID, jobID]
            );

            // Record in status history
            const appResult = await query(
                "SELECT applicationid FROM applications WHERE candidateid = ? AND jobid = ? ORDER BY applicationid DESC LIMIT 1",
                [candidateID, jobID]
            );
            if (appResult.length > 0) {
                await query(
                    `INSERT INTO applicationstatushistory (applicationid, fromstatusid, tostatusid, changedby, changedat, notes)
                     VALUES (?, NULL, 7, ?, NOW(), 'Invited from talent pool')`,
                    [appResult[0].applicationid, userID]
                );
            }

            invited++;
        }

        res.json({
            message: `Invited ${invited} candidate(s) to job #${jobID}.`,
            invited,
            skipped,
            total: candidateIDs.length
        });
    } catch (err) {
        console.error("Talent Pool Invite Error:", err.message);
        res.status(500).json({ error: "Failed to invite candidates: " + err.message });
    }
});


/**
 * @route   POST /api/recruiters/search
 * @desc    Search candidates by name - returns full candidate data
 * @access  Private (Recruiter/Admin)
 */
router.post('/search', protect, authorize([1, 2]), async (req, res) => {
    const { name, useFuzzy, threshold } = req.body;
    if (!name) return res.status(400).json({ error: "Search name is required." });

    try {
        let candidateIDs = [];

        if (useFuzzy) {
            // Try fuzzy search with stored procedure
            try {
                console.log("Running fuzzy search:", name, "threshold:", threshold || 0.6);
                const fuzzyResults = await query("SELECT * FROM sp_fuzzysearchcandidates($1, $2)", [name, parseFloat(threshold) || 0.85]);
                console.log("Fuzzy results:", fuzzyResults);
                candidateIDs = fuzzyResults.map(r => r.candidateid); // PostgreSQL returns lowercase column names
            } catch (fuzzyErr) {
                // Fallback to LIKE
                const likeResults = await query(`
                    SELECT candidateid as candidateid FROM candidates WHERE fullname ILIKE ?
                `, [`%${name}%`]);
                candidateIDs = likeResults.map(r => r.candidateid);
            }
        } else {
            // Regular LIKE search
            const likeResults = await query(`
                SELECT candidateid as candidateid FROM candidates WHERE fullname ILIKE ?
            `, [`%${name}%`]);
            candidateIDs = likeResults.map(r => r.candidateid);
        }

        if (candidateIDs.length === 0) {
            return res.json([]);
        }

        // Get full candidate data for matched IDs
        const placeholders = candidateIDs.map(() => '?').join(',');
        const candidates = await query(`
            SELECT 
                c.candidateid, 
                c.fullname, 
                c.location, 
                c.yearsofexperience,
                (SELECT STRING_AGG(s.skillname, ', ') 
                 FROM candidateskills cs 
                 JOIN skills s ON cs.skillid = s.skillid 
                 WHERE cs.candidateid = c.candidateid) as skills
            FROM candidates c
            WHERE c.candidateid IN (${placeholders})
        `, candidateIDs);

        // Get additional data for each candidate
        for (let i = 0; i < candidates.length; i++) {
            const c = candidates[i];
            try {
                const rs = await query(`SELECT resumequalityscore FROM resumeinsights WHERE candidateid = ? LIMIT 1`, [c.candidateid]);
                c.ResumeScore = rs[0]?.resumequalityscore || 0;
            } catch { c.ResumeScore = 0; }
            try {
                const gr = await query(`SELECT overallrisklevel FROM vw_ghostingriskdashboard WHERE candidateid = ? LIMIT 1`, [c.candidateid]);
                c.GhostingRisk = gr[0]?.overallrisklevel || 'Low';
            } catch { c.GhostingRisk = 'Low'; }
            try {
                const gm = await query(`SELECT points, level, streakdays FROM candidategamification WHERE candidateid = ? LIMIT 1`, [c.candidateid]);
                c.GamificationPoints = gm[0]?.points || 0;
                c.GamificationLevel = gm[0]?.level || 1;
                c.StreakDays = gm[0]?.streakdays || 0;
            } catch {
                c.GamificationPoints = 0;
                c.GamificationLevel = 1;
                c.StreakDays = 0;
            }
            try {
                const rp = await query(`SELECT remotepreference FROM candidatelocationpreferences WHERE candidateid = ? LIMIT 1`, [c.candidateid]);
                c.RemotePreference = rp[0]?.remotepreference || null;
            } catch { c.RemotePreference = null; }
            try {
                const rf = await query(`SELECT relationshiptype FROM referralnetwork WHERE referredcandidateid = ? LIMIT 1`, [c.candidateid]);
                c.ReferralSource = rf[0]?.relationshiptype || null;
            } catch { c.ReferralSource = null; }
        }

        console.log("Search found:", candidates.length, "candidates");
        res.json(candidates);
    } catch (err) {
        console.error("Search Error:", err.message);
        res.status(500).json({ error: "Search failed: " + err.message });
    }
});

/**
 * @route   POST /api/recruiters/initiate-pipeline
 * @desc    Invite a candidate to join a job's pipeline (creates application in 'Invited' state)
 * @access  Private (Recruiter)
 */
router.post('/initiate-pipeline', protect, authorize(2), async (req, res) => {
    const { jobID, candidateID } = req.body;

    if (!jobID || !candidateID) {
        return res.status(400).json({ error: "Job ID and Candidate ID are required." });
    }

    try {
        // 1. Check if application already exists
        const existing = await query(
            "SELECT statusid FROM applications WHERE jobid = ? AND candidateid = ? AND isdeleted = FALSE",
            [jobID, candidateID]
        );

        if (existing.length > 0) {
            const status = existing[0].statusid; // PostgreSQL column names are lowercase
            // If already applied (1), screening (2), interview (3), or hired (4), return error
            if ([1, 2, 3, 4].includes(status)) {
                return res.status(400).json({ error: "Candidate is already in the pipeline for this job." });
            }
            // If invited (7), screening (2), interview (3), or hired (4), return error
            if (status === 7) {
                return res.status(400).json({ error: "Candidate has already been invited to this job." });
            }
            // If rejected (5) or withdrawn (6), we allow "Re-inviting" by updating the record
            await query(
                "UPDATE applications SET statusid = 7, applieddate = NOW() WHERE jobid = ? AND candidateid = ?",
                [jobID, candidateID]
            );
        } else {
            // 2. Create new application in 'Invited' (ID 7) state
            await query(
                "INSERT INTO applications (jobid, candidateid, statusid) VALUES (?, ?, 7)",
                [jobID, candidateID]
            );
        }

        res.status(201).json({ message: "Invitation sent successfully. Candidate notified." });
    } catch (err) {
        console.error("Initiate Pipeline Error:", err.message);
        res.status(500).json({ error: `Failed to initiate pipeline: ${err.message}` });
    }
});

/**
 * @route   GET /api/recruiters/engagement
 * @desc    Get candidate engagement scoring - interview confirmations vs scheduled, engagement rate
 * @access  Private (Recruiter/Admin)
 * 
 * Uses vw_CandidateEngagement view
 */
router.get('/engagement', protect, authorize([1, 2]), async (req, res) => {
    try {
        // vw_candidateengagement returns null EngagementRate for candidates
        // with 0 interviews. Compute directly with 0 fallback.
        const engagement = await query(`
            SELECT
                c.candidateid,
                c.fullname,
                COUNT(DISTINCT i.scheduleid) AS interviewsscheduled,
                COUNT(DISTINCT CASE WHEN i.candidateconfirmed = true THEN i.scheduleid END) AS confirmedinterviews,
                CASE
                    WHEN COUNT(DISTINCT i.scheduleid) = 0 THEN 0
                    ELSE ROUND(
                        COUNT(DISTINCT CASE WHEN i.candidateconfirmed = true THEN i.scheduleid END) * 100.0
                        / COUNT(DISTINCT i.scheduleid),
                        2
                    )
                END AS engagementrate
            FROM candidates c
            LEFT JOIN applications a ON c.candidateid = a.candidateid
            LEFT JOIN interviewschedules i ON a.applicationid = i.applicationid
            GROUP BY c.candidateid, c.fullname
            ORDER BY engagementrate DESC, interviewsscheduled DESC
        `);
        res.json(engagement);
    } catch (err) {
        console.error("Fetch Engagement Error:", err.message);
        res.status(500).json({ error: "Failed to fetch engagement data." });
    }
});

/**
 * @route   GET /api/recruiters/platform-sync
 * @desc    Get external platform sync status
 * @access  Private (Recruiter/Admin)
 * 
 * ExternalPlatformSync columns: SyncID, Platform, CandidateID, JobID, ProfileURL, JobURL,
 * LastSyncedAt, SyncStatus, DataRetrieved, EndorsementCount, ConnectionCount, PlatformReputationScore
 */
router.get('/platform-sync', protect, authorize([1, 2]), async (req, res) => {
    try {
        const platformSync = await query(`
            SELECT 
                eps.syncid,
                eps.platform,
                eps.candidateid,
                c.fullname,
                eps.jobid,
                j.jobtitle,
                eps.profileurl,
                eps.joburl,
                eps.lastsyncedat,
                eps.syncstatus,
                eps.endorsementcount,
                eps.connectioncount,
                eps.platformreputationscore,
                eps.errormessage
            FROM externalplatformsync eps
            LEFT JOIN candidates c ON eps.candidateid = c.candidateid
            LEFT JOIN jobpostings j ON eps.jobid = j.jobid
            ORDER BY eps.lastsyncedat DESC
        `);
        res.json(platformSync);
    } catch (err) {
        console.error("Fetch Platform Sync Error:", err.message);
        res.status(500).json({ error: "Failed to fetch platform sync data." });
    }
});

/**
 * @route   POST /api/recruiters/platform-sync
 * @desc    Trigger sync to external platform (LinkedIn, Indeed, Glassdoor)
 * @access  Private (Recruiter/Admin)
 */
router.post('/platform-sync', protect, authorize([1, 2]), async (req, res) => {
    const { platform, candidateID, jobID, syncDirection } = req.body;

    if (!platform || !syncDirection) {
        return res.status(400).json({ error: "Platform and syncDirection are required." });
    }

    // Normalize syncDirection to match DB CHECK constraint ('Import', 'Export', 'Both')
    const validDirections = { 'import': 'Import', 'export': 'Export', 'both': 'Both',
                              'push': 'Export', 'pull': 'Import' };
    const normalizedDirection = validDirections[syncDirection.toLowerCase()];
    if (!normalizedDirection) {
        return res.status(400).json({ error: "syncDirection must be one of: Import, Export, Both (push/pull also accepted)" });
    }

    // Validate platform against DB CHECK constraint
    const validPlatforms = ['LinkedIn', 'Indeed', 'Glassdoor', 'Naukri', 'Monster'];
    if (!validPlatforms.includes(platform)) {
        return res.status(400).json({ error: `Platform must be one of: ${validPlatforms.join(', ')}` });
    }

    try {
        // Insert sync request
        const result = await query(`
            INSERT INTO externalplatformsync
            (platform, candidateid, jobid, syncdirection, syncstatus, nextsyncattempt)
            VALUES (?, ?, ?, ?, 'Pending', NOW() + INTERVAL '5 minutes')
            RETURNING syncid
        `, [platform, candidateID || null, jobID || null, normalizedDirection]);

        const syncId = result[0]?.syncid;

        // ── CallRESTApi integration ──
        const platformApis = {
            'LinkedIn': process.env.LINKEDIN_JOBS_API_URL,
            'Indeed': process.env.INDEED_API_URL,
            'Glassdoor': process.env.GLASSDOOR_API_URL,
            'Naukri': process.env.NAUKRI_API_URL,
            'Monster': process.env.MONSTER_API_URL,
        };
        const apiUrl = platformApis[platform];

        if (apiUrl && syncId) {
            let syncData = { platform, syncDirection: normalizedDirection, timestamp: new Date().toISOString() };

            if (jobID) {
                const jobInfo = await query(
                    'SELECT jobtitle, description, location, minexperience, vacancies FROM jobpostings WHERE jobid = ?',
                    [jobID]
                );
                syncData.job = jobInfo[0] || null;
            }
            if (candidateID) {
                const candidateInfo = await query(
                    'SELECT fullname, location, yearsofexperience, extractedskills FROM candidates WHERE candidateid = ?',
                    [candidateID]
                );
                syncData.candidate = candidateInfo[0] || null;
            }

            const apiResult = await callRestApi(
                apiUrl, 'POST', JSON.stringify(syncData),
                { 'Content-Type': 'application/json',
                  'Authorization': `Bearer ${process.env.PLATFORM_API_KEY || ''}` }
            );

            // Update sync status using syncid (no ORDER BY needed)
            if (apiResult.success) {
                await query(
                    `UPDATE externalplatformsync SET syncstatus = 'Success', lastsyncedat = NOW(),
                     dataretrieved = ? WHERE syncid = ?`,
                    [JSON.stringify(apiResult.data), syncId]
                );
            } else {
                await query(
                    `UPDATE externalplatformsync SET syncstatus = 'Failed', errormessage = ? WHERE syncid = ?`,
                    [JSON.stringify({ error: apiResult.error }), syncId]
                );
            }
        }

        res.status(201).json({
            message: `Sync to ${platform} queued successfully.`,
            syncStatus: apiUrl ? "Success" : "Pending",
            externalApiCalled: !!apiUrl,
            syncId,
        });
    } catch (err) {
        console.error("Platform Sync Error:", err.message);
        res.status(500).json({ error: "Failed to initiate platform sync: " + err.message });
    }
});

/**
 * @route   POST /api/recruiters/screening/run
 * @desc    Run automated screening for applications to a job
 * @access  Private (Recruiter/Admin)
 * 
 * ScreeningBotDecisions columns: DecisionID, ApplicationID, Decision, Confidence, CriteriaEvaluated, 
 * Score, ThresholdUsed, ModelVersion, DecisionDate, HumanOverride, OverrideReason, FinalDecision
 */
router.post('/screening/run', protect, authorize([1, 2]), async (req, res) => {
    const { jobID, threshold } = req.body;

    if (!jobID) {
        return res.status(400).json({ error: "JobID is required." });
    }

    const thresholdVal = threshold || 70;

    try {
        // Get all applications for the job with status Applied (1)
        const applications = await query(`
            SELECT 
                a.applicationid as applicationid, a.candidateid as candidateid, a.jobid as jobid, 
                c.fullname as fullname, c.yearsofexperience as yearsofexperience, 
                j.minexperience as minexperience
            FROM applications a
            JOIN candidates c ON a.candidateid = c.candidateid
            JOIN jobpostings j ON a.jobid = j.jobid
            WHERE a.jobid = ? AND a.statusid = 1 AND a.isdeleted = FALSE
        `, [jobID]);


        const results = [];

        for (const app of applications) {
            try {
                // Try stored procedure first
                try {
                    // PostgreSQL function call
                    await query("SELECT * FROM sp_autoscreenapplicationenhanced($1)", [app.applicationid]);
                } catch (procErr) {
                    console.log(`SP failed for app ${app.applicationid}, using inline logic:`, procErr.message);

                    // Fallback: inline screening logic
                    const criteria = [];
                    const candidateSkills = await query(`
                        SELECT cs.skillid as skillid, cs.proficiencylevel as proficiencylevel, 
                                js.minproficiency as minproficiency, js.ismandatory as ismandatory
                        FROM jobskills js
                        LEFT JOIN candidateskills cs ON js.skillid = cs.skillid AND cs.candidateid = ?
                        WHERE js.jobid = ? AND js.ismandatory = TRUE
                    `, [app.candidateid, app.jobid]);

                    let totalScore = 0;
                    let mandatoryMet = true;
                    let mandatoryTotal = 0;

                    // Get mandatory skills count
                    const mandatorySkillsCount = await query(`
                        SELECT COUNT(*) as cnt FROM jobskills WHERE jobid = ? AND ismandatory = TRUE
                    `, [app.jobid]);
                    mandatoryTotal = parseInt(mandatorySkillsCount[0]?.cnt || 0);

                    candidateSkills.forEach(s => {
                        if (s.ismandatory) {
                            if ((s.proficiencylevel || 0) >= (s.minproficiency || 0)) {
                                totalScore += 20;
                                criteria.push(`${s.skillid}: meets requirement`);
                            } else {
                                mandatoryMet = false;
                                criteria.push(`${s.skillid}: below requirement`);
                            }
                        }
                    });

                    // Simple scoring for demo
                    const expMet = (app.yearsofexperience || 0) >= (app.minexperience || 0);
                    const experienceScore = expMet ? 40 : 20;
                    criteria.push(`Experience: ${expMet ? 'meets' : 'below'} requirement`);

                    const finalScore = (totalScore / (mandatoryTotal * 20 || 1) * 60) + experienceScore;
                    const decision = mandatoryMet && finalScore >= thresholdVal ? 'Pass' : (finalScore >= thresholdVal * 0.7 ? 'Maybe' : 'Fail');

                    try {
                        await query(`
                            INSERT INTO screeningbotdecisions 
                            (applicationid, decision, confidence, criteriaevaluated, score, modelversion, decisiondate)
                            VALUES (?, ?, ?, ?, ?, 'InlineV1', NOW())
                        `, [app.applicationid, decision, finalScore / 100, JSON.stringify(criteria), finalScore]);
                    } catch (insertErr) {
                        console.log("Failed to insert screening decision:", insertErr.message);
                    }
                }

                // Get the final screening decision
                const decisionResult = await query(`
                    SELECT * FROM screeningbotdecisions 
                    WHERE applicationid = ? ORDER BY decisiondate DESC LIMIT 1
                `, [app.applicationid]);

                const dec = decisionResult[0];
                console.log(`Screening result for app ${app.applicationid}:`, dec);

                results.push({
                    applicationID: app.applicationid,
                    candidateName: app.fullname,
                    yearsExperience: app.yearsofexperience,
                    screeningResult: dec ? {
                        decisionID: dec.decisionid,
                        decision: dec.decision,
                        confidence: dec.confidence,
                        score: dec.score
                    } : null
                });
            } catch (screenErr) {
                console.error("Screening Error for app:", app.applicationid, screenErr.message);
                results.push({
                    applicationID: app.applicationid,
                    candidateName: app.fullname,
                    error: screenErr.message
                });
            }
        }

        res.json({
            message: `Screening completed for ${results.length} applications.`,
            results: results
        });
    } catch (err) {
        console.error("Run Screening Error:", err.message);
        res.status(500).json({ error: "Failed to run screening: " + err.message });
    }
});

/**
 * @route   GET /api/recruiters/screening/decisions
 * @desc    Get screening decisions for a job
 * @access  Private (Recruiter/Admin)
 */
router.get('/screening/decisions', protect, authorize([1, 2]), async (req, res) => {
    const { jobID } = req.query;

    try {
        let queryStr = `
            SELECT 
                sbd.*,
                a.applicationid,
                c.candidateid,
                c.fullname,
                j.jobid,
                j.jobtitle,
                s.statusname AS currentstatus
            FROM screeningbotdecisions sbd
            JOIN applications a ON sbd.applicationid = a.applicationid
            JOIN candidates c ON a.candidateid = c.candidateid
            JOIN jobpostings j ON a.jobid = j.jobid
            JOIN applicationstatus s ON a.statusid = s.statusid
        `;

        let params = [];
        if (jobID) {
            queryStr += ` WHERE j.jobid = ?`;
            params.push(jobID);
        }

        queryStr += ` ORDER BY sbd.decisiondate DESC`;

        const decisions = await query(queryStr, params);
        res.json(decisions);
    } catch (err) {
        console.error("Fetch Screening Decisions Error:", err.message);
        res.status(500).json({ error: "Failed to fetch screening decisions." });
    }
});

/**
 * @route   POST /api/recruiters/screening/override
 * @desc    Override a screening decision (human override)
 * @access  Private (Recruiter/Admin)
 */
router.post('/screening/override', protect, authorize([1, 2]), async (req, res) => {
    const { decisionID, overrideReason, finalDecision } = req.body;

    if (!decisionID || !finalDecision) {
        return res.status(400).json({ error: "DecisionID and FinalDecision are required." });
    }

    try {
        await query(`
            UPDATE screeningbotdecisions 
            SET humanoverride = TRUE, overridereason = ?, finaldecision = ?
            WHERE decisionid = ?
        `, [overrideReason || 'Manual override', finalDecision, decisionID]);

        // Also update the application status based on final decision
        let newStatusID = 1; // Default to Applied
        if (finalDecision === 'Pass') newStatusID = 2; // Screening
        else if (finalDecision === 'Fail') newStatusID = 5; // Rejected
        else if (finalDecision === 'ManualReview') newStatusID = 1; // Stay in Applied

        await query(`
            UPDATE applications 
            SET statusid = ?, rejectionreason = 'screening override: ' || ?
            WHERE applicationid = (
                SELECT applicationid FROM screeningbotdecisions WHERE decisionid = ?
            )
        `, [newStatusID, overrideReason || 'No reason provided', decisionID]);

        res.json({ message: "Screening decision overridden successfully." });
    } catch (err) {
        console.error("Override Screening Error:", err.message);
        res.status(500).json({ error: "Failed to override screening decision." });
    }
});

/**
 * @route   POST /api/recruiters/screening/advance
 * @desc    Advance passed candidates to next stage (Screening or Interview)
 * @access  Private (Recruiter/Admin)
 */
router.post('/screening/advance', protect, authorize([1, 2]), async (req, res) => {
    const { applicationIDs, targetStage } = req.body; // targetStage: 'Screening' or 'Interview'

    if (!applicationIDs || !Array.isArray(applicationIDs) || applicationIDs.length === 0) {
        return res.status(400).json({ error: "ApplicationIDs array is required." });
    }

    if (!targetStage || !['Screening', 'Interview'].includes(targetStage)) {
        return res.status(400).json({ error: "Target stage must be 'Screening' or 'Interview'." });
    }

    const newStatusID = targetStage === 'Screening' ? 2 : 3;

    try {
        const results = [];

        for (const applicationID of applicationIDs) {
            // Get current status
            const current = await query(`
                SELECT a.statusid, s.statusname FROM applications a
                JOIN applicationstatus s ON a.statusid = s.statusid
                WHERE a.applicationid = ?
            `, [applicationID]);

            if (current.length === 0) {
                results.push({ applicationID, success: false, error: "Application not found" });
                continue;
            }

            const currentStatusID = current[0].statusid;

            // Can only advance from Applied(1) or Screening(2)
            if (currentStatusID !== 1 && currentStatusID !== 2) {
                results.push({
                    applicationID,
                    success: false,
                    error: `Cannot advance from ${current[0].statusname} status`
                });
                continue;
            }

            // Check if already at or past target stage
            if (targetStage === 'Screening' && currentStatusID >= 2) {
                results.push({ applicationID, success: false, error: "Already at Screening stage" });
                continue;
            }
            if (targetStage === 'Interview' && currentStatusID >= 3) {
                results.push({ applicationID, success: false, error: "Already at Interview stage" });
                continue;
            }

            // Update status
            await query(`
                UPDATE applications 
                SET statusid = ?, statuschangedat = NOW()
                WHERE applicationid = ?
            `, [newStatusID, applicationID]);

            // Record in history
            await query(`
                INSERT INTO applicationstatushistory (applicationid, fromstatusid, tostatusid, changedby, changedat, notes)
                VALUES (?, ?, ?, ?, NOW(), 'Advanced from Screening Bot')
            `, [applicationID, currentStatusID, newStatusID, req.user.userid]);

            results.push({
                applicationID,
                success: true,
                message: `Advanced to ${targetStage}`
            });
        }

        const successCount = results.filter(r => r.success).length;
        res.json({
            message: `Advanced ${successCount} of ${applicationIDs.length} candidates to ${targetStage}.`,
            results: results
        });
    } catch (err) {
        console.error("Advance Screening Error:", err.message);
        res.status(500).json({ error: "Failed to advance candidates: " + err.message });
    }
});

/**
 * @route   POST /api/recruiters/screening/reject
 * @desc    Reject candidates directly from screening results
 * @access  Private (Recruiter/Admin)
 */
router.post('/screening/reject', protect, authorize([1, 2]), async (req, res) => {
    const { applicationIDs, reason } = req.body;

    if (!applicationIDs || !Array.isArray(applicationIDs) || applicationIDs.length === 0) {
        return res.status(400).json({ error: "ApplicationIDs array is required." });
    }

    try {
        const results = [];

        for (const applicationID of applicationIDs) {
            // Get current status
            const current = await query(`
                SELECT a.statusid, s.statusname FROM applications a
                JOIN applicationstatus s ON a.statusid = s.statusid
                WHERE a.applicationid = ?
            `, [applicationID]);

            if (current.length === 0) {
                results.push({ applicationID, success: false, error: "Application not found" });
                continue;
            }

            const currentStatusID = current[0].statusid;

            // Can only reject from Applied(1), Screening(2), or Interview(3)
            if (currentStatusID > 3) {
                results.push({
                    applicationID,
                    success: false,
                    error: `Cannot reject from ${current[0].statusname} status`
                });
                continue;
            }

            // Update status to Rejected(5)
            await query(`
                UPDATE applications 
                SET statusid = 5, statuschangedat = NOW(), rejectionreason = ?
                WHERE applicationid = ?
            `, [reason || 'Rejected from Screening Bot', applicationID]);

            // Record in history
            await query(`
                INSERT INTO applicationstatushistory (applicationid, fromstatusid, tostatusid, changedby, changedat, notes)
                VALUES (?, ?, 5, ?, NOW(), 'Rejected from Screening Bot')
            `, [applicationID, currentStatusID, req.user.userid]);

            results.push({
                applicationID,
                success: true,
                message: "Rejected"
            });
        }

        const successCount = results.filter(r => r.success).length;
        res.json({
            message: `Rejected ${successCount} of ${applicationIDs.length} candidates.`,
            results: results
        });
    } catch (err) {
        console.error("Reject Screening Error:", err.message);
        res.status(500).json({ error: "Failed to reject candidates: " + err.message });
    }
});

// =========================================
// MARKET ALERTS - Personalized for Recruiter
// =========================================
router.get('/market-alerts', protect, authorize(2), async (req, res) => {
    const userID = req.user.userid;

    try {
        // Get RecruiterID from UserID
        const recruiterCheck = await query("SELECT recruiterid, department FROM recruiters WHERE userid = ?", [userID]);
        if (recruiterCheck.length === 0) {
            return res.status(403).json({ error: "Not a recruiter." });
        }
        const recruiterId = recruiterCheck[0].recruiterid;
        const recruiterLocation = recruiterCheck[0].department;

        // Try stored procedure first
        try {
            // PostgreSQL function call
            await query("CALL sp_generatemarketalerts($1)", [parseInt(recruiterId)]);
            // Fetch alerts generated by the procedure
            const spResult = await query("SELECT * FROM marketalerts ORDER BY triggeredat DESC LIMIT 20", [parseInt(recruiterId)]);
            if (spResult && spResult.length > 0) {
                return res.json(spResult);
            }
        } catch (spErr) {
            console.log("SP failed, using fallback query:", spErr.message);

        // Fallback: Query MarketIntelligence directly for recruiter's location
        let alerts = [];

        if (recruiterLocation) {
            alerts = await query(`
                SELECT
                    CASE WHEN mi.salarytrend IN ('Rising','Falling') THEN 'Salary Alert' ELSE 'Demand Alert' END AS alerttype,
                    mi.skillid as skillid,
                    s.skillname as skillname,
                    mi.location as location,
                    mi.demandscore as demandscore,
                    mi.supplyscore as supplyscore,
                    mi.demandscore - mi.supplyscore AS imbalancescore,
                    mi.salarytrend as salarytrend,
                    mi.avgsalary as avgsalary,
                    CONCAT('Alert for ', s.skillname, ' in ', mi.location, ': Trend is ', mi.salarytrend,
                           '. Avg: ', mi.avgsalary, '. Imbalance: ', (mi.demandscore - mi.supplyscore)) AS description,
                    CASE
                        WHEN (mi.demandscore - mi.supplyscore) > 30 THEN 5
                        WHEN (mi.demandscore - mi.supplyscore) > 15 THEN 3
                        ELSE 2
                    END AS severity,
                    COALESCE(mi.lastupdated, NOW()) AS triggeredat,
                    NOW() + INTERVAL '30 days' AS expiresat
                FROM marketintelligence mi
                JOIN skills s ON mi.skillid = s.skillid
                WHERE mi.location = ?
                ORDER BY severity DESC
            `, [recruiterLocation]);
        }

        // If still no alerts, get general market data.
        // NOTE: previously filtered mi.lastupdated > NOW() - INTERVAL '14 days',
        // but the seeded marketintelligence rows have stale lastupdated values
        // (older than 14 days), so this filter made the page always return [].
        // Removed the date filter so the alerts page always shows real data.
        // The frontend already orders by demandscore/severity, so even "stale"
        // intelligence is useful as a starting point.
        if (alerts.length === 0) {
            alerts = await query(`
                SELECT
                    CASE WHEN mi.salarytrend IN ('Rising','Falling') THEN 'Salary Alert' ELSE 'Demand Alert' END AS alerttype,
                    mi.skillid as skillid,
                    s.skillname as skillname,
                    mi.location as location,
                    mi.demandscore as demandscore,
                    mi.supplyscore as supplyscore,
                    mi.demandscore - mi.supplyscore AS imbalancescore,
                    mi.salarytrend as salarytrend,
                    mi.avgsalary as avgsalary,
                    CONCAT('Market Alert for ', s.skillname, ' in ', mi.location, ': Trend is ', mi.salarytrend,
                           '. Avg: ', mi.avgsalary) AS description,
                    CASE
                        WHEN (mi.demandscore - mi.supplyscore) > 30 THEN 5
                        WHEN (mi.demandscore - mi.supplyscore) > 15 THEN 3
                        ELSE 2
                    END AS severity,
                    COALESCE(mi.lastupdated, NOW()) AS triggeredat,
                    NOW() + INTERVAL '30 days' AS expiresat
                FROM marketintelligence mi
                JOIN skills s ON mi.skillid = s.skillid
                ORDER BY demandscore DESC, severity DESC
                LIMIT 20
            `);
        }

        res.json(alerts);
    } catch (err) {
        console.error("Market Alerts Error:", err.message);
        res.status(500).json({ error: "Failed to fetch market alerts: " + err.message });
    }
});

/**
 * @route   GET /api/recruiters/candidate-profile/:candidateId
 * @desc    Get comprehensive candidate profile data for modal
 * @access  Private (Recruiter/Admin)
 * 
 * Aggregates data from multiple sources:
 * - Basic info (Candidates table)
 * - Resume Insights (ResumeInsights table)
 * - Skill Verification Status (vw_SkillVerificationStatus view)
 * - Engagement Metrics (vw_CandidateEngagement view)
 * - Ghosting Risk (vw_GhostingRiskDashboard view)
 * - Remote Compatibility (vw_RemoteCompatibilityMatrix view)
 * - Career Path Insights (vw_CareerPathInsights view)
 * - Gamification (CandidateGamification table)
 * - Predictions (AI_Predictions table)
 * - Blockchain Verifications (BlockchainVerifications table)
 */
router.get('/candidate-profile/:candidateId', protect, authorize([1, 2]), async (req, res) => {
    const { candidateId } = req.params;

    if (!candidateId) {
        return res.status(400).json({ error: "Candidate ID is required." });
    }

    try {
        const profile = {
            basicInfo: null,
            resumeInsights: null,
            skillVerification: [],
            engagement: null,
            ghostingRisk: null,
            remoteCompatibility: null,
            careerPath: null,
            gamification: null,
            predictions: [],
            blockchainVerifications: [],
            applications: [],
            interviews: []
        };

        // Run all 12 queries in parallel using Promise.allSettled.
        // Previously these were sequential (12 round-trips × ~100ms = ~1.2s).
        // Now they run concurrently (~100ms total).
        const [
            basicRes, resumeRes, skillsRes, engagementRes, ghostingRes,
            remoteRes, careerRes, gamificationRes, predictionsRes,
            blockchainRes, applicationsRes, interviewsRes
        ] = await Promise.allSettled([
            // 1. Basic Info
            query(`SELECT c.candidateid, c.fullname, c.location, c.yearsofexperience,
                          c.resumetext, c.extractedskills, c.createdat,
                          u.email, u.username
                   FROM candidates c LEFT JOIN users u ON c.userid = u.userid
                   WHERE c.candidateid = ?`, [candidateId]),
            // 2. Resume Insights
            query(`SELECT resumequalityscore, educationinstitutions, certifications,
                          technologiesmentioned AS techstack,
                          leadershiptermscount AS leadershipexperience,
                          nlpprocessedat AS lastanalyzedat
                   FROM resumeinsights WHERE candidateid = ?`, [candidateId]),
            // 3. Skill Verification
            query(`SELECT skillname, claimedlevel, verificationscore, verificationmethod,
                          verifiedat, expirydate, verificationstatus, validitystatus
                   FROM vw_skillverificationstatus WHERE candidateid = ?`, [candidateId]),
            // 4. Engagement Metrics
            query(`SELECT COUNT(DISTINCT i.scheduleid) AS interviewsscheduled,
                          COUNT(DISTINCT CASE WHEN i.candidateconfirmed = true THEN i.scheduleid END) AS confirmedinterviews,
                          CASE WHEN COUNT(DISTINCT i.scheduleid) = 0 THEN 0
                               ELSE ROUND(COUNT(DISTINCT CASE WHEN i.candidateconfirmed = true THEN i.scheduleid END) * 100.0
                                   / COUNT(DISTINCT i.scheduleid), 2) END AS engagementrate
                   FROM candidates c
                   LEFT JOIN applications a ON c.candidateid = a.candidateid
                   LEFT JOIN interviewschedules i ON a.applicationid = i.applicationid
                   WHERE c.candidateid = ? GROUP BY c.candidateid`, [candidateId]),
            // 5. Ghosting Risk
            query(`SELECT candidateghostingscore, overallriskscore, overallrisklevel,
                          avgresponsetime, totalcommunications
                   FROM vw_ghostingriskdashboard WHERE candidateid = ? LIMIT 1`, [candidateId]),
            // 6. Remote Compatibility
            query(`SELECT overallremotescore, timezonealignment,
                          workspacequality AS workspacescore,
                          communicationpreference AS communicationscore,
                          selfmotivationscore
                   FROM vw_remotecompatibilitymatrix WHERE candidateid = ? LIMIT 1`, [candidateId]),
            // 7. Career Path
            query(`SELECT targetrole, transitionprobability, topskills AS skillsneeded,
                          avgtransitionmonths AS estimatedmonths, currentreadinessscore
                   FROM vw_careerpathinsights WHERE candidateid = ? LIMIT 1`, [candidateId]),
            // 8. Gamification
            query(`SELECT points, level, badges, streakdays, engagementscore
                   FROM candidategamification WHERE candidateid = ?`, [candidateId]),
            // 9. AI Predictions
            query(`SELECT p.jobid, j.jobtitle, p.successprobability, p.keyfactors,
                          p.predictiondate AS predictedat
                   FROM ai_predictions p LEFT JOIN jobpostings j ON p.jobid = j.jobid
                   WHERE p.candidateid = ?`, [candidateId]),
            // 10. Blockchain Verifications
            query(`SELECT credentialtype, credentialhash,
                          blockchaintransactionid AS transactionid,
                          network, verifiedat,
                          CASE WHEN verificationstatus = 'Verified' THEN TRUE ELSE FALSE END AS isverified
                   FROM blockchainverifications WHERE candidateid = ?
                   ORDER BY verifiedat DESC`, [candidateId]),
            // 11. Recent Applications
            query(`SELECT a.applicationid, j.jobtitle, j.location AS joblocation,
                          s.statusname, a.applieddate, NULL AS matchscore
                   FROM applications a JOIN jobpostings j ON a.jobid = j.jobid
                   JOIN applicationstatus s ON a.statusid = s.statusid
                   WHERE a.candidateid = ? AND a.isdeleted = FALSE
                   ORDER BY a.applieddate DESC LIMIT 10`, [candidateId]),
            // 12. Interviews
            query(`SELECT i.scheduleid, j.jobtitle, u.username AS recruitername,
                          i.interviewstart, i.interviewend, i.candidateconfirmed,
                          CASE WHEN i.interviewstart < NOW() THEN 'Past' ELSE 'Upcoming' END AS timestatus
                   FROM interviewschedules i
                   JOIN applications a ON i.applicationid = a.applicationid
                   JOIN jobpostings j ON a.jobid = j.jobid
                   JOIN recruiters r ON i.recruiterid = r.recruiterid
                   JOIN users u ON r.userid = u.userid
                   WHERE a.candidateid = ? ORDER BY i.interviewstart DESC`, [candidateId]),
        ]);

        // Assign results (each is {status: 'fulfilled', value: [...]} or {status: 'rejected', reason: ...})
        profile.basicInfo = basicRes.status === 'fulfilled' ? (basicRes.value[0] || null) : null;
        profile.resumeInsights = resumeRes.status === 'fulfilled' ? (resumeRes.value[0] || null) : null;
        profile.skillVerification = skillsRes.status === 'fulfilled' ? (skillsRes.value || []) : [];
        profile.engagement = engagementRes.status === 'fulfilled' ? (engagementRes.value[0] || null) : null;
        profile.ghostingRisk = ghostingRes.status === 'fulfilled' ? (ghostingRes.value[0] || null) : null;
        profile.remoteCompatibility = remoteRes.status === 'fulfilled' ? (remoteRes.value[0] || null) : null;
        profile.careerPath = careerRes.status === 'fulfilled' ? (careerRes.value[0] || null) : null;
        profile.gamification = gamificationRes.status === 'fulfilled' ? (gamificationRes.value[0] || null) : null;
        profile.predictions = predictionsRes.status === 'fulfilled' ? (predictionsRes.value || []) : [];
        profile.blockchainVerifications = blockchainRes.status === 'fulfilled' ? (blockchainRes.value || []) : [];
        profile.applications = applicationsRes.status === 'fulfilled' ? (applicationsRes.value || []) : [];
        profile.interviews = interviewsRes.status === 'fulfilled' ? (interviewsRes.value || []) : [];

        res.json(profile);
    } catch (err) {
        console.error("Candidate Profile Error:", err.message);
        res.status(500).json({ error: "Failed to fetch candidate profile: " + err.message });
    }
});

/**
 * @route   GET /api/recruiters/referral-intelligence
 * @desc    Get comprehensive referral intelligence dashboard data
 * @access  Private (Recruiter/Admin)
 * 
 * Returns:
 * - Summary stats (total referrals, success rate, pending, etc.)
 * - Top referrers leaderboard
 * - Recent referrals with outcomes
 * - Referral suggestions (candidates who can refer others)
 * - Network strength analysis
 */
router.get('/referral-intelligence', protect, authorize([1, 2]), async (req, res) => {
    try {
        const data = {
            summary: null,
            topReferrers: [],
            recentReferrals: [],
            referralSuggestions: [],
            networkAnalysis: [],
            outcomeBreakdown: []
        };

        // 1. Summary Stats
        try {
            const summary = await query(`
                SELECT 
                    COUNT(*) AS totalreferrals,
                    SUM(CASE WHEN hireresult = TRUE THEN 1 ELSE 0 END) AS successfulhires,
                    SUM(CASE WHEN hireresult IS NULL THEN 1 ELSE 0 END) AS pendingreferrals,
                    CAST(SUM(CASE WHEN hireresult = TRUE THEN 1 ELSE 0 END) * 100.0 / 
                         NULLIF(COUNT(CASE WHEN hireresult IS NOT NULL THEN 1 END), 0) AS DECIMAL(5,2)) AS successrate,
                    AVG(CAST(qualityscore AS FLOAT)) AS avgqualityscore,
                    SUM(CASE WHEN bonusamount IS NOT NULL THEN bonusamount ELSE 0 END) AS totalbonuspaid,
                    COUNT(DISTINCT referrerid) AS activereferrers
                FROM referralnetwork
            `);
            data.summary = summary[0] || null;
        } catch (err) {
            console.log("Summary error:", err.message);
        }

        // 2. Top Referrers Leaderboard
        try {
            const topReferrers = await query(`
                SELECT 
                    c.candidateid AS referrerid,
                    c.fullname AS referrername,
                    rp.totalreferrals as totalreferrals,
                    rp.successfulreferrals as successfulreferrals,
                    rp.conversionrate as conversionrate,
                    rp.avgqualityscore as avgqualityscore,
                    rp.totalbonusearned as totalbonusearned
                FROM referralperformance rp
                JOIN candidates c ON rp.referrerid = c.candidateid
                ORDER BY rp.successfulreferrals DESC, rp.totalreferrals DESC
                LIMIT 10
            `);
            data.topReferrers = topReferrers || [];
        } catch (err) {
            console.log("Top referrers error:", err.message);
        }

        // 3. Recent Referrals with Outcomes
        try {
            const recentReferrals = await query(`
                SELECT 
                    r.referralid as referralid,
                    c1.fullname AS referrername,
                    c2.fullname AS referredcandidatename,
                    j.jobtitle as jobtitle,
                    r.relationshiptype as relationshiptype,
                    r.referralstrength as referralstrength,
                    r.referraldate as referraldate,
                    r.hireresult as hireresult,
                    r.qualityscore as qualityscore,
                    r.bonusamount as bonusamount,
                    CASE 
                        WHEN r.hireresult = TRUE THEN 'Successful'
                        WHEN r.hireresult = FALSE THEN 'Unsuccessful'
                        ELSE 'Pending'
                    END AS outcome,
                    ns.connectionstrength as connectionstrength,
                    ns.trustlevel as trustlevel
                FROM referralnetwork r
                JOIN candidates c1 ON r.referrerid = c1.candidateid
                JOIN candidates c2 ON r.referredcandidateid = c2.candidateid
                JOIN jobpostings j ON r.jobid = j.jobid
                LEFT JOIN networkstrength ns ON r.referrerid = ns.candidateid 
                    AND r.referredcandidateid = ns.connectionid
                ORDER BY r.referraldate DESC
                LIMIT 20
            `);
            data.recentReferrals = recentReferrals || [];
        } catch (err) {
            console.log("Recent referrals error:", err.message);
        }

        // 4. Referral Suggestions (using sp_SuggestReferrals)
        try {
            const suggestions = await query(`
                SELECT 
                    c.candidateid, 
                    c.fullname, 
                    c.location, 
                    c.yearsofexperience,
                    (SELECT STRING_AGG(s.skillname, ', ') 
                     FROM candidateskills cs 
                     JOIN skills s ON cs.skillid = s.skillid 
                     WHERE cs.candidateid = c.candidateid) as skills
                FROM candidates c
                WHERE c.userid IN (SELECT userid FROM users WHERE isactive = TRUE)
                ORDER BY c.yearsofexperience DESC
                LIMIT 10
            `);
            data.referralSuggestions = suggestions || [];
        } catch (err) {
            console.log("Referral suggestions error:", err.message);
        }

        // 5. Network Strength Analysis
        try {
            const networkAnalysis = await query(`
                SELECT 
                    c.candidateid as candidateid,
                    c.fullname as fullname,
                    COUNT(ns.connectionid) AS totalconnections,
                    AVG(CAST(ns.connectionstrength AS FLOAT)) AS avgconnectionstrength,
                    SUM(CASE WHEN ns.connectionstrength >= 8 THEN 1 ELSE 0 END) AS hightrustconnections,
                    MAX(ns.lastinteraction) AS lastnetworkinteraction
                FROM candidates c
                JOIN networkstrength ns ON c.candidateid = ns.candidateid
                GROUP BY c.candidateid, c.fullname
                HAVING COUNT(ns.connectionid) >= 1
                ORDER BY totalconnections DESC
            `);
            data.networkAnalysis = networkAnalysis || [];
        } catch (err) {
            console.log("Network analysis error:", err.message);
        }

        // 6. Outcome Breakdown by Relationship Type
        try {
            const outcomeBreakdown = await query(`
                SELECT 
                    relationshiptype as relationshiptype,
                    COUNT(*) AS totalreferrals,
                    SUM(CASE WHEN hireresult = TRUE THEN 1 ELSE 0 END) AS successful,
                    SUM(CASE WHEN hireresult = FALSE THEN 1 ELSE 0 END) AS unsuccessful,
                    SUM(CASE WHEN hireresult IS NULL THEN 1 ELSE 0 END) AS pending,
                    AVG(CAST(qualityscore AS FLOAT)) AS avgqualityscore
                FROM referralnetwork
                GROUP BY relationshiptype
                ORDER BY totalreferrals DESC
            `);
            data.outcomeBreakdown = outcomeBreakdown || [];
        } catch (err) {
            console.log("Outcome breakdown error:", err.message);
        }

        res.json(data);
    } catch (err) {
        console.error("Referral Intelligence Error:", err.message);
        res.status(500).json({ error: "Failed to fetch referral intelligence: " + err.message });
    }
});

/**
 * @route   GET /api/recruiters/referral-suggestions/:jobId
 * @desc    Get referral suggestions for a specific job using sp_SuggestReferrals stored procedure
 * @access  Private (Recruiter/Admin)
 */
router.get('/referral-suggestions/:jobId', protect, authorize([1, 2]), async (req, res) => {
    const { jobId } = req.params;

    if (!jobId) {
        return res.status(400).json({ error: "Job ID is required." });
    }

    try {
        // sp_suggestreferrals was converted from a PROCEDURE to a FUNCTION
        // (procedures in PostgreSQL can't return query results). It now
        // RETURNS TABLE(...) directly — call via SELECT, not CALL.
        const suggestions = await query("SELECT * FROM sp_suggestreferrals($1)", [parseInt(jobId)]);

        const processedSuggestions = suggestions.map(s => ({
            ...s,
            potentialreferrals: s.potentialreferrals ? (typeof s.potentialreferrals === 'string' ? JSON.parse(s.potentialreferrals) : s.potentialreferrals) : []
        }));

        res.json(processedSuggestions);
    } catch (err) {
        console.error("Referral Suggestions Error:", err.message);
        res.status(500).json({ error: "Failed to fetch referral suggestions: " + err.message });
    }
});

/**
 * @route   POST /api/recruiters/send-reminder
 * @desc    Send a reminder to a candidate
 */
router.post('/send-reminder', protect, authorize([1, 2]), async (req, res) => {
    const { candidateId, jobId, message } = req.body;

    if (!candidateId || !message) {
        return res.status(400).json({ error: "Candidate ID and message are required." });
    }

    try {
        const candidateResult = await query(
            "SELECT candidateid as candidateid, userid as userid, fullname as fullname FROM candidates WHERE candidateid = ?",
            [candidateId]
        );

        if (!candidateResult || candidateResult.length === 0) {
            return res.status(404).json({ error: "Candidate not found." });
        }

        const candidate = candidateResult[0];
        const candidateUserId = candidate.userid;
        const candidateName = candidate.fullname;

        if (!candidateUserId) {
            return res.status(400).json({ error: "Candidate does not have a linked user account." });
        }

        const dataPayload = jobId ? JSON.stringify({ applicationId: jobId }) : null;

        await query(`
            INSERT INTO pushnotifications (userid, title, body, notificationtype, sentat, datapayload)
            VALUES (?, 'Follow-up Reminder', ?, 'Reminder', NOW(), ?)
        `, [candidateUserId, message, dataPayload]);

        res.status(201).json({
            message: "Reminder sent successfully!",
            candidateName: candidateName
        });
    } catch (err) {
        console.error("Send Reminder Error:", err.message);
        res.status(500).json({ error: "Failed to send reminder: " + err.message });
    }
});

/**
 * @route   GET /api/recruiters/background-checks/:candidateId
 */
router.get('/background-checks/:candidateId', protect, authorize([1, 2]), async (req, res) => {
    const { candidateId } = req.params;
    const { checkType, status } = req.query;

    try {
        let queryStr = `
            SELECT 
                bc.checkid as checkid, bc.candidateid as candidateid, c.fullname as fullname,
                bc.checktype as checktype, bc.vendor as vendor, bc.requestid as requestid,
                bc.status as status, bc.result as result, bc.findings as findings,
                bc.risklevel as risklevel, bc.initiatedat as initiatedat, bc.completedat as completedat,
                bc.reporturl as reporturl, bc.cost as cost, bc.turnarounddays as turnarounddays,
                bc.notes as notes, bc.complianceverified as complianceverified
            FROM backgroundchecks bc
            JOIN candidates c ON bc.candidateid = c.candidateid
            WHERE bc.candidateid = ?
        `;
        const params = [candidateId];
        if (checkType) { queryStr += ` AND bc.checktype = ?`; params.push(checkType); }
        if (status) { queryStr += ` AND bc.status = ?`; params.push(status); }
        queryStr += ` ORDER BY bc.initiatedat DESC`;

        const checks = await query(queryStr, params);
        res.json(checks);
    } catch (err) {
        console.error("Background Checks Fetch Error:", err.message);
        res.status(500).json({ error: "Failed to fetch background checks." });
    }
});

/**
 * @route   POST /api/recruiters/background-checks
 */
router.post('/background-checks', protect, authorize([1, 2]), async (req, res) => {
    const { candidateId, checkType, vendor, notes } = req.body;

    if (!candidateId || !checkType) {
        return res.status(400).json({ error: "Candidate ID and Check Type are required." });
    }

    // Validate check type
    const validTypes = ['Criminal', 'Education', 'Employment', 'Credit', 'Reference', 'Drug'];
    if (!validTypes.includes(checkType)) {
        return res.status(400).json({ error: `Invalid check type. Must be one of: ${validTypes.join(', ')}` });
    }

    try {
        // Generate a unique request ID
        const requestID = `BC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const result = await query(`
            INSERT INTO backgroundchecks (candidateid, checktype, vendor, requestid, status, notes)
            VALUES (?, ?, ?, ?, 'Requested', ?)
            RETURNING checkid
        `, [candidateId, checkType, vendor || 'Internal', requestID, notes]);

        const checkId = result[0].checkid;

        // ── CallRESTApi integration ──
        // If a vendor API endpoint is configured, call it to initiate the background check.
        // This replaces the SQL Server CLR CallRESTApi function.
        const vendorApiUrl = process.env.BACKGROUND_CHECK_API_URL;
        if (vendorApiUrl) {
            // Fetch candidate info for the vendor
            const candidateInfo = await query(
                'SELECT fullname, location FROM candidates WHERE candidateid = ?',
                [candidateId]
            );
            const candidate = candidateInfo[0] || {};

            const apiResult = await callRestApi(
                vendorApiUrl,
                'POST',
                JSON.stringify({
                    requestId: requestID,
                    checkType,
                    vendor: vendor || 'Internal',
                    candidate: {
                        id: candidateId,
                        name: candidate.fullname,
                        location: candidate.location,
                    },
                    notes: notes || '',
                    callbackUrl: `${process.env.VERCEL_URL || 'https://nex-hire-neon.vercel.app'}/api/recruiters/background-checks/${checkId}`,
                }),
                {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.BACKGROUND_CHECK_API_KEY || ''}`,
                }
            );

            // Update the check record with the vendor's response
            if (apiResult.success) {
                await query(
                    `UPDATE backgroundchecks SET status = 'In Progress', initiatedat = NOW(),
                     findings = ? WHERE checkid = ?`,
                    [JSON.stringify({ vendorResponse: apiResult.data }), checkId]
                );
            } else {
                console.log('Vendor API call failed:', apiResult.error);
                // Don't fail the whole request — the check is still queued locally
            }
        }

        res.status(201).json({
            message: "Background check initiated successfully.",
            checkId,
            requestId: requestID,
            status: vendorApiUrl ? "In Progress" : "Requested",
            vendorApiCalled: !!vendorApiUrl,
        });
    } catch (err) {
        console.error("Initiate Background Check Error:", err.message);
        res.status(500).json({ error: "Failed to initiate background check: " + err.message });
    }
});

/**
 * @route   PUT /api/recruiters/background-checks/:checkId
 * @desc    Update background check status (for vendor webhook or manual update)
 * @access  Private (Recruiter/Admin)
 */
router.put('/background-checks/:checkId', protect, authorize([1, 2]), async (req, res) => {
    const { checkId } = req.params;
    const { status, result, findings, riskLevel, reportURL, cost, turnaroundDays, notes } = req.body;

    if (!status) {
        return res.status(400).json({ error: "Status is required." });
    }

    // Validate status
    const validStatuses = ['Requested', 'InProgress', 'Completed', 'Failed', 'Cleared', 'Adverse'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    try {
        const updateFields = [];
        const updateParams = [];

        if (status) {
            updateFields.push('status = ?');
            updateParams.push(status);
        }
        if (result) {
            updateFields.push('result = ?');
            updateParams.push(result);
        }
        if (findings !== undefined) {
            updateFields.push('findings = ?');
            updateParams.push(findings);
        }
        if (riskLevel) {
            updateFields.push('risklevel = ?');
            updateParams.push(riskLevel);
        }
        if (reportURL) {
            updateFields.push('reporturl = ?');
            updateParams.push(reportURL);
        }
        if (cost) {
            updateFields.push('cost = ?');
            updateParams.push(cost);
        }
        if (turnaroundDays) {
            updateFields.push('turnarounddays = ?');
            updateParams.push(turnaroundDays);
        }
        if (notes) {
            updateFields.push('notes = ?');
            updateParams.push(notes);
        }
        if (status === 'Completed' || status === 'Cleared' || status === 'Adverse') {
            updateFields.push('completedat = NOW()');
        }

        updateParams.push(checkId); // Add checkId to params for WHERE clause

        await query(`
            UPDATE backgroundchecks 
            SET ${updateFields.join(', ')}
            WHERE checkid = ?
        `, updateParams);

        res.json({
            message: "Background check updated successfully.",
            checkid: parseInt(checkId),
            status: status
        });
    } catch (err) {
        console.error("Update Background Check Error:", err.message);
        res.status(500).json({ error: "Failed to update background check: " + err.message });
    }
});

/**
 * @route   GET /api/recruiters/background-checks-dashboard
 * @desc    Get background check dashboard with summary stats
 * @access  Private (Recruiter/Admin)
 */
router.get('/background-checks-dashboard', protect, authorize([1, 2]), async (req, res) => {
    try {
        // Summary stats
        const summary = await query(`
            SELECT 
                COUNT(*) AS totalchecks,
                SUM(CASE WHEN status = 'Requested' THEN 1 ELSE 0 END) AS pending,
                SUM(CASE WHEN status = 'InProgress' THEN 1 ELSE 0 END) AS inprogress,
                SUM(CASE WHEN status = 'Completed' OR status = 'Cleared' THEN 1 ELSE 0 END) AS completed,
                SUM(CASE WHEN status = 'Failed' OR status = 'Adverse' THEN 1 ELSE 0 END) AS failed,
                SUM(CASE WHEN result = 'Clear' THEN 1 ELSE 0 END) AS cleared,
                SUM(CASE WHEN result = 'Adverse' THEN 1 ELSE 0 END) AS adverse,
                SUM(CASE WHEN result = 'Consider' THEN 1 ELSE 0 END) AS consider,
                AVG(CAST(cost AS FLOAT)) AS avgcost,
                AVG(CAST(turnarounddays AS FLOAT)) AS avgturnarounddays,
                SUM(CAST(cost AS FLOAT)) AS totalcost
            FROM backgroundchecks
        `);

        // Transform summary to PascalCase
        const formattedSummary = {
            TotalChecks: summary[0].totalchecks || 0,
            Pending: summary[0].pending || 0,
            InProgress: summary[0].inprogress || 0,
            Completed: summary[0].completed || 0,
            Failed: summary[0].failed || 0,
            Cleared: summary[0].cleared || 0,
            Adverse: summary[0].adverse || 0,
            Consider: summary[0].consider || 0,
            AvgCost: summary[0].avgcost || 0,
            AvgTurnaroundDays: summary[0].avgturnarounddays || 0,
            TotalCost: summary[0].totalcost || 0
        };

        // Checks by type
        const byType = await query(`
            SELECT 
                checktype, 
                COUNT(*) AS count,
                SUM(CASE WHEN status = 'Completed' OR status = 'Cleared' THEN 1 ELSE 0 END) AS completed
            FROM backgroundchecks
            GROUP BY checktype
        `);

        // Transform byType to PascalCase
        const formattedByType = byType.map(t => ({
            CheckType: t.checktype,
            Count: t.count,
            Completed: t.completed
        }));

        // Recent checks
        const recent = await query(`
            SELECT 
                bc.checkid as checkid,
                bc.candidateid as candidateid,
                c.fullname as fullname,
                bc.checktype as checktype,
                bc.status as status,
                bc.result as result,
                bc.initiatedat as initiatedat,
                bc.completedat as completedat
            FROM backgroundchecks bc
            JOIN candidates c ON bc.candidateid = c.candidateid
            ORDER BY bc.initiatedat DESC
            LIMIT 10
        `);

        // Transform recent to PascalCase
        const formattedRecent = recent.map(r => ({
            CheckID: r.checkid,
            CandidateID: r.candidateid,
            FullName: r.fullname,
            CheckType: r.checktype,
            Status: r.status,
            Result: r.result,
            InitiatedAt: r.initiatedat,
            CompletedAt: r.completedat
        }));

        res.json({
            summary: formattedSummary,
            byType: formattedByType,
            recent: formattedRecent
        });
    } catch (err) {
        console.error("Background Checks Dashboard Error:", err);
        res.status(500).json({ error: "Failed to fetch background checks dashboard", details: err.message, stack: err.stack });
    }
});

/**
 * @route   GET /api/recruiters/blockchain-verifications/:candidateId
 * @desc    Get blockchain verifications for a candidate
 * @access  Private (Recruiter/Admin)
 */
router.get('/blockchain-verifications/:candidateId', protect, authorize([1, 2]), async (req, res) => {
    const { candidateId } = req.params;
    const { credentialType, status } = req.query;

    try {
        let queryStr = `
            SELECT
                bv.verificationid as verificationid,
                bv.candidateid as candidateid,
                c.fullname as fullname,
                bv.credentialtype as credentialtype,
                bv.issuingauthority as issuingauthority,
                bv.credentialhash as credentialhash,
                bv.blockchaintransactionid as blockchaintransactionid,
                bv.blocknumber as blocknumber,
                bv.network as network,
                bv.verifiedat as verifiedat,
                bv.isimmutable as isimmutable,
                bv.verificationcost as verificationcost,
                bv.verificationstatus as verificationstatus,
                bv.metadata as metadata,
                bv.lastchecked as lastchecked
            FROM blockchainverifications bv
            JOIN candidates c ON bv.candidateid = c.candidateid
            WHERE bv.candidateid = ?
        `;

        const params = [candidateId];

        if (credentialType) {
            queryStr += ` AND bv.credentialtype = ?`;
            params.push(credentialType);
        }

        if (status) {
            queryStr += ` AND bv.verificationstatus = ?`;
            params.push(status);
        }

        queryStr += ` ORDER BY bv.lastchecked DESC`;

        const verifications = await query(queryStr, params);
        res.json(verifications);
    } catch (err) {
        console.error("Blockchain Verifications Fetch Error:", err.message);
        res.status(500).json({ error: "Failed to fetch blockchain verifications: " + err.message });
    }
});

/**
 * @route   POST /api/recruiters/blockchain-verifications
 * @desc    Submit a new credential for blockchain verification
 * @access  Private (Recruiter/Admin)
 */
router.post('/blockchain-verifications', protect, authorize([1, 2]), async (req, res) => {
    const { candidateId, credentialType, issuingAuthority, metadata } = req.body;

    if (!candidateId || !credentialType || !issuingAuthority) {
        return res.status(400).json({ error: "Candidate ID, Credential Type, and Issuing Authority are required." });
    }

    // Validate credential type
    const validTypes = ['Degree', 'Certificate', 'Employment', 'Identity'];
    if (!validTypes.includes(credentialType)) {
        return res.status(400).json({ error: `Invalid credential type. Must be one of: ${validTypes.join(', ')}` });
    }

    try {
        // Generate SHA-256 hash of the credential (simulated)
        const credentialData = `${candidateId}-${credentialType}-${issuingAuthority}-${Date.now()}`;
        const crypto = require('crypto');
        const credentialHash = crypto.createHash('sha256').update(credentialData).digest('hex');

        // Generate a mock blockchain transaction ID
        const transactionID = `0x${credentialHash.substring(0, 16)}...${credentialHash.substring(credentialHash.length - 8)}`;

        const result = await query(`
            INSERT INTO blockchainverifications 
            (candidateid, credentialtype, issuingauthority, credentialhash, blockchaintransactionid, network, verificationstatus, metadata)
            VALUES (?, ?, ?, ?, ?, 'Ethereum', 'Pending', ?)
            RETURNING verificationid as verificationid
        `, [candidateId, credentialType, issuingAuthority, credentialHash, transactionID, metadata || null]);

        res.status(201).json({
            message: "Credential submitted for blockchain verification.",
            verificationid: result[0].verificationid,
            credentialHash: credentialHash,
            transactionId: transactionID,
            status: "Pending"
        });
    } catch (err) {
        console.error("Submit Blockchain Verification Error:", err.message);
        res.status(500).json({ error: "Failed to submit blockchain verification: " + err.message });
    }
});

/**
 * @route   PUT /api/recruiters/blockchain-verifications/:verificationId
 * @desc    Update blockchain verification status (for webhook or manual update)
 * @access  Private (Recruiter/Admin)
 */
router.put('/blockchain-verifications/:verificationId', protect, authorize([1, 2]), async (req, res) => {
    const { verificationId } = req.params;
    const { verificationStatus, blockchainTransactionID, blockNumber, metadata } = req.body;

    if (!verificationStatus) {
        return res.status(400).json({ error: "Verification status is required." });
    }

    // Validate status
    const validStatuses = ['Pending', 'Verified', 'Failed', 'Expired'];
    if (!validStatuses.includes(verificationStatus)) {
        return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    try {
        const updateFields = [];
        const updateParams = [];

        if (verificationStatus) {
            updateFields.push('verificationstatus = ?');
            updateParams.push(verificationStatus);
        }
        if (blockchainTransactionID) {
            updateFields.push('blockchaintransactionid = ?');
            updateParams.push(blockchainTransactionID);
        }
        if (blockNumber) {
            updateFields.push('blocknumber = ?');
            updateParams.push(blockNumber);
        }
        if (metadata) {
            updateFields.push('metadata = ?');
            updateParams.push(metadata);
        }
        if (verificationStatus === 'Verified') {
            updateFields.push('verifiedat = NOW()');
            updateFields.push('isimmutable = TRUE');
        }

        updateFields.push('lastchecked = NOW()');
        updateParams.push(verificationId); // Add verificationId to params for WHERE clause

        await query(`
            UPDATE blockchainverifications 
            SET ${updateFields.join(', ')}
            WHERE verificationid = ?
        `, updateParams);

        res.json({
            message: "Blockchain verification updated successfully.",
            verificationid: parseInt(verificationId),
            status: verificationStatus
        });
    } catch (err) {
        console.error("Update Blockchain Verification Error:", err.message);
        res.status(500).json({ error: "Failed to update blockchain verification: " + err.message });
    }
});

/**
 * @route   GET /api/recruiters/blockchain-dashboard
 * @desc    Get blockchain verification dashboard with summary stats
 * @access  Private (Recruiter/Admin)
 */
router.get('/blockchain-dashboard', protect, authorize([1, 2]), async (req, res) => {
    try {
        // Check if table exists
        let tableExists = false;
        try {
            await query("SELECT 1 FROM blockchainverifications WHERE 1=0");
            tableExists = true;
        } catch (tableErr) {
            tableExists = false;
        }

        if (!tableExists) {
            return res.json({
                summary: {
                    totalverifications: 0,
                    pending: 0,
                    verified: 0,
                    failed: 0,
                    degrees: 0,
                    certificates: 0,
                    employment: 0,
                    identity: 0,
                    totalcost: 0,
                    avgcost: 0
                },
                byType: [],
                recent: []
            });
        }

        // Summary stats
        const summary = await query(`
            SELECT 
                COUNT(*) AS totalverifications,
                SUM(CASE WHEN verificationstatus = 'Pending' THEN 1 ELSE 0 END) AS pending,
                SUM(CASE WHEN verificationstatus = 'Verified' THEN 1 ELSE 0 END) AS verified,
                SUM(CASE WHEN verificationstatus = 'Failed' THEN 1 ELSE 0 END) AS failed,
                SUM(CASE WHEN credentialtype = 'Degree' THEN 1 ELSE 0 END) AS degrees,
                SUM(CASE WHEN credentialtype = 'Certificate' THEN 1 ELSE 0 END) AS certificates,
                SUM(CASE WHEN credentialtype = 'Employment' THEN 1 ELSE 0 END) AS employment,
                SUM(CASE WHEN credentialtype = 'Identity' THEN 1 ELSE 0 END) AS identity,
                SUM(CAST(verificationcost AS FLOAT)) AS totalcost,
                AVG(CAST(verificationcost AS FLOAT)) AS avgcost
            FROM blockchainverifications
        `);

        // Verifications by type
        const byType = await query(`
            SELECT 
                credentialtype as credentialtype,
                COUNT(*) AS count,
                SUM(CASE WHEN verificationstatus = 'Verified' THEN 1 ELSE 0 END) AS verified
            FROM blockchainverifications
            GROUP BY credentialtype
            ORDER BY count DESC
        `);

        // Recent verifications
        const recent = await query(`
            SELECT 
                bv.verificationid as verificationid,
                bv.candidateid as candidateid,
                c.fullname as fullname,
                bv.credentialtype as credentialtype,
                bv.verificationstatus as verificationstatus,
                bv.blockchaintransactionid as blockchaintransactionid,
                bv.network as network
            FROM blockchainverifications bv
            JOIN candidates c ON bv.candidateid = c.candidateid
            ORDER BY bv.lastchecked DESC
            LIMIT 10
        `);

        res.json({
            summary: summary[0] || {},
            byType: byType || [],
            recent: recent || []
        });
    } catch (err) {
        console.error("Blockchain Dashboard Error:", err.message);
        res.json({
            summary: {
                totalverifications: 0,
                pending: 0,
                verified: 0,
                failed: 0,
                degrees: 0,
                certificates: 0,
                employment: 0,
                identity: 0,
                totalcost: 0,
                avgcost: 0
            },
            byType: [],
            recent: []
        });
    }
});

/**
 * @route   GET /api/recruiters/ranking-history/:candidateId
 * @desc    Get ranking history for a candidate across all jobs
 * @access  Private (Recruiter/Admin)
 * 
 * Returns: HistoryID, JobID, JobTitle, MatchScore, CalculatedAt
 */
router.get('/ranking-history/:candidateId', protect, authorize([1, 2]), async (req, res) => {
    const { candidateId } = req.params;
    const { jobId } = req.query;

    try {
        let queryStr = `
            SELECT 
                crh.historyid as historyid,
                crh.candidateid as candidateid,
                crh.jobid as jobid,
                jp.jobtitle as jobtitle,
                crh.matchscore as matchscore,
                crh.calculatedat as calculatedat
            FROM candidaterankinghistory crh
            LEFT JOIN jobpostings jp ON crh.jobid = jp.jobid
            WHERE crh.candidateid = ?
        `;
        const params = [parseInt(candidateId)];

        // Optionally filter by specific job
        if (jobId) {
            queryStr += ` AND crh.jobid = ?`;
            params.push(parseInt(jobId));
        }

        queryStr += ` ORDER BY crh.calculatedat DESC`;

        const history = await query(queryStr, params);

        // Calculate statistics
        let stats = {
            totalRankings: history.length,
            avgScore: 0,
            highestScore: 0,
            lowestScore: 100,
            scoreTrend: 'stable' // 'improving', 'declining', 'stable'
        };

        if (history.length > 0) {
            const scores = history.map(h => h.matchscore || 0);
            stats.avgScore = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2);
            stats.highestScore = Math.max(...scores);
            stats.lowestScore = Math.min(...scores);

            // Calculate trend (compare recent 3 to previous 3)
            if (history.length >= 6) {
                const recent = history.slice(0, 3);
                const previous = history.slice(3, 6);
                const recentAvg = recent.reduce((a, b) => a + (b.matchscore || 0), 0) / 3;
                const previousAvg = previous.reduce((a, b) => a + (b.matchscore || 0), 0) / 3;

                if (recentAvg > previousAvg + 5) {
                    stats.scoreTrend = 'improving';
                } else if (recentAvg < previousAvg - 5) {
                    stats.scoreTrend = 'declining';
                }
            }
        }

        res.json({
            history,
            stats
        });
    } catch (err) {
        console.error("Ranking History Fetch Error:", err.message);
        res.status(500).json({ error: `Failed to fetch ranking history: ${err.message}` });
    }
});

/**
 * @route   POST /api/recruiters/ranking-history
 * @desc    Save a candidate ranking (call sp_SaveCandidateRanking)
 * @access  Private (Recruiter/Admin)
 * 
 * Body: { candidateId, jobId, matchScore }
 */
router.post('/ranking-history', protect, authorize([1, 2]), async (req, res) => {
    const { candidateId, jobId, matchScore } = req.body;

    if (!candidateId || !jobId || matchScore === undefined) {
        return res.status(400).json({ error: "candidateId, jobId, and matchScore are required." });
    }

    try {
        await query(
            "CALL sp_savecandidateranking($1, $2, $3)",
            [parseInt(candidateId), parseInt(jobId), parseFloat(matchScore)]
        );

        res.status(201).json({
            success: true,
            message: "Ranking saved successfully.",
            data: { candidateId, jobId, matchScore }
        });
    } catch (err) {
        console.error("Save Ranking Error:", err.message);
        res.status(500).json({ error: `Failed to save ranking: ${err.message}` });
    }
});

/**
 * @route   GET /api/recruiters/ranking-history/job/:jobId
 * @desc    Get ranking history for all candidates for a specific job
 * @access  Private (Recruiter/Admin)
 * 
 * Returns: HistoryID, CandidateID, FullName, MatchScore, CalculatedAt
 */
router.get('/ranking-history/job/:jobId', protect, authorize([1, 2]), async (req, res) => {
    const { jobId } = req.params;

    try {
        const history = await query(`
            SELECT 
                crh.historyid as historyid,
                crh.candidateid as candidateid,
                c.fullname as fullname,
                crh.jobid as jobid,
                jp.jobtitle as jobtitle,
                crh.matchscore as matchscore,
                crh.calculatedat as calculatedat
            FROM candidaterankinghistory crh
            LEFT JOIN candidates c ON crh.candidateid = c.candidateid
            LEFT JOIN jobpostings jp ON crh.jobid = jp.jobid
            WHERE crh.jobid = ?
            ORDER BY crh.matchscore DESC, crh.calculatedat DESC
        `, [parseInt(jobId)]);

        res.json(history);
    } catch (err) {
        console.error("Job Ranking History Fetch Error:", err.message);
        res.status(500).json({ error: `Failed to fetch job ranking history: ${err.message}` });
    }
});

// ─────────────────────────────────────────────────────────────────────
// GeocodeAddress — External API Integration
// Replaces: SQL Server CLR dbo.GeocodeAddress(@address, @apiKey)
// Uses: OpenStreetMap Nominatim API (free, no API key required)
// ─────────────────────────────────────────────────────────────────────

/**
 * @route   GET /api/recruiters/geocode?address=Dhaka
 * @desc    Geocode an address to lat/lng coordinates
 * @access  Private (Recruiter/Admin)
 */
router.get('/geocode', protect, authorize([1, 2]), async (req, res) => {
    const { address } = req.query;

    if (!address) {
        return res.status(400).json({ error: 'Address query parameter is required.' });
    }

    try {
        const result = await geocodeAddress(address);
        if (result.success) {
            res.json(result);
        } else {
            res.status(404).json(result);
        }
    } catch (err) {
        console.error('Geocode Error:', err.message);
        res.status(500).json({ error: 'Geocoding failed: ' + err.message });
    }
});

/**
 * @route   GET /api/recruiters/distance?address1=Dhaka&address2=Chittagong
 * @desc    Calculate distance between two addresses
 * @access  Private (Recruiter/Admin)
 */
router.get('/distance', protect, authorize([1, 2]), async (req, res) => {
    const { address1, address2 } = req.query;

    if (!address1 || !address2) {
        return res.status(400).json({ error: 'Both address1 and address2 are required.' });
    }

    try {
        const result = await calculateDistance(address1, address2);
        if (result.success) {
            res.json(result);
        } else {
            res.status(404).json(result);
        }
    } catch (err) {
        console.error('Distance Error:', err.message);
        res.status(500).json({ error: 'Distance calculation failed: ' + err.message });
    }
});

/**
 * @route   POST /api/recruiters/verify-linkedin
 * @desc    Verify a candidate's LinkedIn profile URL
 * @access  Private (Recruiter/Admin)
 */
router.post('/verify-linkedin', protect, authorize([1, 2]), async (req, res) => {
    const { profileUrl, candidateId } = req.body;

    if (!profileUrl) {
        // If candidateId is provided, fetch their LinkedIn URL from DB
        if (candidateId) {
            const candidate = await query(
                'SELECT linkedinurl FROM candidates WHERE candidateid = ?',
                [candidateId]
            );
            if (candidate.length === 0 || !candidate[0].linkedinurl) {
                return res.status(404).json({ error: 'Candidate has no LinkedIn URL on file.' });
            }
            const url = candidate[0].linkedinurl;
            const result = await verifyLinkedInProfile(url);
            res.json({ candidateId, linkedinUrl: url, ...result });
        } else {
            return res.status(400).json({ error: 'Profile URL or Candidate ID is required.' });
        }
    } else {
        const result = await verifyLinkedInProfile(profileUrl);
        res.json({ linkedinUrl: profileUrl, ...result });
    }
});

module.exports = router;
