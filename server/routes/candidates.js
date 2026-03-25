const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { protect, authorize } = require('../middleware/rbac');
const multer = require('multer');
const { processCandidateResume } = require('../pdfHelper');

/**
 * @route   GET /api/candidates/matches
 * @desc    Get matched jobs for the logged-in candidate (applied jobs with scores)
 * @access  Private (Candidate)
 */
router.get('/matches', protect, authorize(3), async (req, res) => {
    const userID = req.user.userid;
    try {
        const matches = await query(
            "SELECT v.*, j.location, j.minexperience, j.vacancies " +
            "FROM vw_candidatematchscore v " +
            "JOIN candidates c ON v.candidateid = c.candidateid " +
            "JOIN jobpostings j ON v.jobid = j.jobid " +
            "WHERE c.userid = ? AND j.isactive = true AND j.isdeleted = false " +
            "ORDER BY v.totalmatchscore DESC",
            [userID]
        );
        res.json(matches);
    } catch (err) {
        console.error("Fetch Candidate Matches Error:", err.message);
        res.status(500).json({ error: "Failed to fetch matched opportunities." });
    }
});

/**
 * @route   GET /api/candidates/discover
 * @desc    Get all active jobs with basic matching and required skills
 * @access  Private (Candidate)
 * 
 * JobSkills columns: JobID, SkillID, IsMandatory (BIT), MinProficiency
 * Skills columns: SkillID, SkillName
 */
router.get('/discover', protect, authorize(3), async (req, res) => {
    const userID = req.user.userid;
    try {
        // Get candidate's location preferences for filtering
        let locationPrefs = null;
        try {
            const prefs = await query(
                `SELECT preferredlocations, remotepreference, willingtorelocate 
                 FROM candidatelocationpreferences 
                 WHERE candidateid = (SELECT candidateid FROM candidates WHERE userid = ?)`,
                [userID]
            );
            if (prefs && prefs.length > 0) {
                locationPrefs = prefs[0];
                console.log("Location prefs found:", locationPrefs);
            } else {
                console.log("No location preferences found for user", userID);
            }
        } catch (prefErr) {
            console.log("Error fetching location preferences:", prefErr.message);
        }

        // Build location-based filtering conditions
        let locationFilter = '';
        let queryParams = [userID, userID];

        if (locationPrefs) {
            const preferredLocs = locationPrefs.preferredlocations ? locationPrefs.preferredlocations.split(',').map(l => l.trim().toLowerCase()).filter(Boolean) : [];
            const remotePref = locationPrefs.remotepreference; // 'Full', 'Hybrid', 'None'
            const willingToRelocate = locationPrefs.willingtorelocate;

            console.log("Filtering with:", { preferredLocs, remotePref, willingToRelocate });

            // If candidate is willing to relocate, don't filter by location at all
            if (willingToRelocate === 1 || willingToRelocate === true) {
                console.log("Willing to relocate - no filtering");
            } else if (preferredLocs.length > 0) {
                // Build SQL condition for location matching
                // Show jobs where location matches ANY of the preferred locations
                const locConditions = preferredLocs.map(loc => `LOWER(j.location) LIKE '%' || ? || '%'`);
                locationFilter = ' AND (' + locConditions.join(' OR ') + ')';
                queryParams = [...queryParams, ...preferredLocs];
                console.log("Location filter applied:", locationFilter);
            } else if (remotePref === 'Full') {
                // If candidate prefers remote only, show remote jobs
                locationFilter = " AND (LOWER(j.Location) LIKE '%remote%' OR LOWER(j.Location) LIKE '%work from home%' OR LOWER(j.Location) LIKE '%wfh%' OR LOWER(j.Location) LIKE '%anywhere%' OR LOWER(j.Location) LIKE '%worldwide%')";
                console.log("Remote filter applied");
            }
        }

        // Build the query with location filtering
        let queryStr = `SELECT j.*, 
            (SELECT COUNT(*) FROM jobskills js JOIN candidateskills cs ON js.skillid = cs.skillid 
             WHERE js.jobid = j.jobid AND cs.candidateid = (SELECT candidateid FROM candidates WHERE userid = ?)) as matchedskillscount,
            CASE WHEN sr.istransparent = true THEN sr.minsalary ELSE NULL END AS salarymin,
            CASE WHEN sr.istransparent = true THEN sr.maxsalary ELSE NULL END AS salarymax
            FROM jobpostings j 
            LEFT JOIN jobsalaryranges sr ON j.jobid = sr.jobid 
            WHERE j.isactive = true AND j.isdeleted = false 
            AND j.jobid NOT IN (SELECT jobid FROM applications WHERE candidateid = (SELECT candidateid FROM candidates WHERE userid = ?))`;

        // Add location filter if applicable
        queryStr += locationFilter;
        queryStr += ' ORDER BY j.createdat DESC';

        console.log("Final query:", queryStr);
        console.log("Query params:", queryParams);

        const jobs = await query(queryStr, queryParams);

        // Try to get skills, but don't fail if it errors
        let skillsByJob = {};
        try {
            // Get candidate's skills with proficiency level for matching display
            const candidateSkills = await query(
                "SELECT cs.skillid, s.skillname, cs.proficiencylevel FROM candidateskills cs " +
                "JOIN skills s ON cs.skillid = s.skillid " +
                "WHERE cs.candidateid = (SELECT candidateid FROM candidates WHERE userid = ?)",
                [userID]
            );
            // Create a map of skillID -> proficiency level
            const candidateSkillProficiency = {};
            candidateSkills.forEach(s => {
                candidateSkillProficiency[s.skillid] = s.proficiencylevel;
            });
            const candidateSkillIds = new Set(candidateSkills.map(s => s.skillid));

            // Fetch required skills for all jobs
            const jobIds = jobs.map(j => j.jobid);

            if (jobIds.length > 0) {
                const placeholders = jobIds.map(() => '?').join(',');
                const jobSkills = await query(
                    `SELECT js.jobid as JobID, js.skillid as SkillID, s.skillname as SkillName, js.ismandatory as IsMandatory, js.minproficiency as MinProficiency 
                    FROM jobskills js 
                    JOIN skills s ON js.skillid = s.skillid 
                    WHERE js.jobid IN(${placeholders})`,
                    jobIds
                );

                // Group skills by job ID
                for (const skill of jobSkills) {
                    if (!skillsByJob[skill.JobID]) {
                        skillsByJob[skill.JobID] = { mandatory: [], optional: [] };
                    }
                    const candidateProficiency = candidateSkillProficiency[skill.SkillID] || 0;
                    const meetsRequirement = candidateProficiency >= skill.minproficiency;
                    const skillInfo = {
                        SkillName: skill.skillname,
                        MinProficiency: skill.minproficiency,
                        HasSkill: candidateSkillIds.has(skill.skillid),
                        CandidateProficiencyLevel: candidateProficiency,
                        MeetsRequirement: meetsRequirement
                    };
                    if (skill.ismandatory) {
                        skillsByJob[skill.jobid].mandatory.push(skillInfo);
                    } else {
                        skillsByJob[skill.jobid].optional.push(skillInfo);
                    }
                }
            }
        } catch (skillErr) {
            console.error("Skills fetch error (non-fatal):", skillErr.message);
            // Continue without skills data
        }

        // Attach skills to each job
        const jobsWithSkills = jobs.map(job => ({
            ...job,
            RequiredSkills: skillsByJob[job.JobID || job.jobid] || { mandatory: [], optional: [] }
        }));

        res.json(jobsWithSkills);
    } catch (err) {
        console.error("Discover Jobs Error:", err.message);
        res.status(500).json({ error: "Failed to discover opportunities." });
    }
});

/**
 * @route   GET /api/candidates/applications
 * @desc    Get all applications for the logged-in candidate
 * @access  Private (Candidate)
 */
router.get('/applications', protect, authorize(3), async (req, res) => {
    const userID = req.user.userid;
    try {
        const apps = await query(
            "SELECT a.applicationid, a.jobid, a.applieddate, s.statusname, " +
            "j.jobtitle, j.location, j.description, j.minexperience, j.vacancies, " +
            "a.rejectionreason, a.withdrawalreason " +
            "FROM applications a " +
            "JOIN candidates c ON a.candidateid = c.candidateid " +
            "JOIN jobpostings j ON a.jobid = j.jobid " +
            "JOIN applicationstatus s ON a.statusid = s.statusid " +
            "WHERE c.userid = ? AND a.isdeleted = false " +
            "ORDER BY a.applieddate DESC",
            [userID]
        );
        res.json(apps);
    } catch (err) {
        console.error("Fetch Candidate Applications Error:", err.message);
        res.status(500).json({ error: "Failed to fetch applications." });
    }
});

/**
 * @route   GET /api/candidates/skills
 * @desc    Get the candidate's existing skills with proficiency levels
 * @access  Private (Candidate)
 */
router.get('/skills', protect, authorize(3), async (req, res) => {
    const userID = req.user.userid;
    try {
        const skills = await query(
            "SELECT cs.skillid, s.skillname, cs.proficiencylevel " +
            "FROM candidateskills cs " +
            "JOIN skills s ON cs.skillid = s.skillid " +
            "WHERE cs.candidateid = (SELECT candidateid FROM candidates WHERE userid = ?) " +
            "ORDER BY cs.proficiencylevel DESC",
            [userID]
        );
        res.json(skills);
    } catch (err) {
        console.error("Fetch Candidate Skills Error:", err.message);
        res.status(500).json({ error: "Failed to fetch skills." });
    }
});

/**
 * @route   GET /api/candidates/interviews
 * @desc    Get interviews for the logged-in candidate
 * @access  Private (Candidate)
 */
router.get('/interviews', protect, authorize(3), async (req, res) => {
    const userID = req.user.userid;
    try {
        // The view vw_candidateinterviews may return 0 rows due to stale JOINs.
        // Query the tables directly to get the candidate's interviews.
        const interviews = await query(`
            SELECT
                i.scheduleid,
                i.applicationid,
                i.interviewstart,
                i.interviewend,
                i.candidateconfirmed,
                j.jobtitle,
                c.fullname AS candidatename,
                u.username AS recruitername,
                CASE WHEN i.interviewstart > NOW() THEN 'Upcoming' ELSE 'Completed' END AS status,
                EXTRACT(EPOCH FROM (i.interviewend - i.interviewstart))/60 AS duration,
                'Video Call' AS platform
            FROM interviewschedules i
            JOIN applications a ON i.applicationid = a.applicationid
            JOIN candidates c ON a.candidateid = c.candidateid
            JOIN jobpostings j ON a.jobid = j.jobid
            LEFT JOIN recruiters r ON i.recruiterid = r.recruiterid
            LEFT JOIN users u ON r.userid = u.userid
            WHERE c.userid = ?
            ORDER BY i.interviewstart ASC
        `, [userID]);
        res.json(interviews);
    } catch (err) {
        console.error("Fetch Candidate Interviews Error:", err.message);
        res.status(500).json({ error: "Failed to fetch interview schedule." });
    }
});

/**
 * @route   POST /api/candidates/confirm-interview
 * @desc    Confirm an interview slot
 * @access  Private (Candidate)
 */
router.post('/confirm-interview', protect, authorize(3), async (req, res) => {
    const { scheduleID } = req.body;
    const userID = req.user.userid;
    try {
        await query("CALL sp_confirminterview($1, $2)", [scheduleID, userID]);
        res.json({ message: "Interview confirmed successfully." });
    } catch (err) {
        console.error("Confirm Interview Error:", err.message);
        res.status(500).json({ error: err.message || "Failed to confirm interview." });
    }
});

/**
 * @route   GET /api/candidates/assessments
 * @desc    Get available skill assessments for the candidate
 * @access  Private (Candidate)
 */
router.get('/assessments', protect, authorize(3), async (req, res) => {
    try {
        const assessments = await query(
            "SELECT m.*, s.skillname " +
            "FROM microassessments m " +
            "JOIN skills s ON m.skillid = s.skillid " +
            "WHERE m.isactive = true"
        );
        res.json(assessments);
    } catch (err) {
        console.error("Fetch Assessments Error:", err.message);
        res.status(500).json({ error: "Failed to fetch assessments." });
    }
});

/**
 * @route   POST /api/candidates/apply
 * @desc    Apply for a job
 * @access  Private (Candidate)
 */
router.get('/profile/skills', protect, authorize(3), async (req, res) => {
    const userID = req.user.userid;
    try {
        const skills = await query(
            "SELECT * FROM vw_skillverificationstatus WHERE candidateid = (SELECT candidateid FROM candidates WHERE userid = ?)",
            [userID]
        );
        res.json(skills);
    } catch (err) {
        console.error("Fetch Profile Skills Error:", err.message);
        res.status(500).json({ error: "Failed to fetch skills profile." });
    }
});

router.post('/apply', protect, authorize(3), async (req, res) => {
    const { jobID } = req.body;
    const userID = req.user.userid;

    try {
        const candidate = await query("SELECT candidateid FROM candidates WHERE userid = ?", [userID]);
        if (candidate.length === 0) return res.status(404).json({ error: "Candidate profile not found." });
        const candidateID = candidate[0].candidateid;

        // Insert application — ON CONFLICT handles the TOCTOU race:
        // if two parallel requests both pass the "already applied" check,
        // the UNIQUE constraint on (candidateid, jobid) prevents the
        // duplicate, and ON CONFLICT DO NOTHING returns 0 rows affected.
        const result = await query(
            `INSERT INTO applications (candidateid, jobid, statusid)
             VALUES (?, ?, (SELECT statusid FROM applicationstatus WHERE statusname = 'Applied'))
             ON CONFLICT (candidateid, jobid) DO NOTHING`,
            [candidateID, jobID]
        );

        // Check if the insert was skipped (duplicate)
        if (result && result.length === 0) {
            // ON CONFLICT DO NOTHING doesn't return row count via pg, so
            // check if the application already exists
            const existing = await query(
                "SELECT applicationid FROM applications WHERE candidateid = ? AND jobid = ?",
                [candidateID, jobID]
            );
            if (existing.length > 0) {
                return res.status(400).json({ error: "Already applied for this job." });
            }
        }

        // Award gamification points
        try {
            await query("CALL sp_awardgamificationpoints($1, $2)", [candidateID, 'Application']);
        } catch (gErr) {
            // Non-fatal — application was still created
        }

        res.json({ message: "Application submitted successfully." });
    } catch (err) {
        console.error("Apply Job Error:", err.message);
        res.status(500).json({ error: "Failed to submit application." });
    }
});

/**
 * @route   POST /api/candidates/withdraw
 * @desc    Withdraw an application
 * @access  Private (Candidate)
 */
router.post('/withdraw', protect, authorize(3), async (req, res) => {
    const { applicationID, reason } = req.body;
    const userID = req.user.userid;

    try {
        const candidate = await query("SELECT candidateid FROM candidates WHERE userid = ?", [userID]);
        const candidateID = candidate[0].candidateid;

        await query("CALL sp_withdrawapplication($1, $2, $3)", [applicationID, candidateID, reason]);
        res.json({ message: "Application withdrawn successfully." });
    } catch (err) {
        console.error("Withdraw Error:", err.message);
        res.status(500).json({ error: err.message || "Failed to withdraw application." });
    }
});

/**
 * @route   POST /api/candidates/skills
 * @desc    Add or update a skill
 * @access  Private (Candidate)
 */
router.post('/skills', protect, authorize(3), async (req, res) => {
    const { skillID, proficiencyLevel } = req.body;
    const userID = req.user.userid;

    try {
        const candidate = await query("SELECT candidateid FROM candidates WHERE userid = ?", [userID]);
        const candidateID = candidate[0].candidateid;

        // Check if skill already exists
        const existing = await query("SELECT * FROM candidateskills WHERE candidateid = ? AND skillid = ?", [candidateID, skillID]);

        if (existing.length > 0) {
            await query("UPDATE candidateskills SET proficiencylevel = ? WHERE candidateid = ? AND skillid = ?", [proficiencyLevel, candidateID, skillID]);
        } else {
            await query("INSERT INTO candidateskills (candidateid, skillid, proficiencylevel) VALUES (?, ?, ?)", [candidateID, skillID, proficiencyLevel]);
        }

        res.json({ message: "Skill updated successfully." });
    } catch (err) {
        console.error("Skill Update Error:", err.message);
        res.status(500).json({ error: "Failed to update skill." });
    }
});

/**
 * @route   GET /api/candidates/career-path
 * @desc    Get career path insights for the logged-in candidate
 * @access  Private (Candidate)
 */
router.get('/career-path', protect, authorize(3), async (req, res) => {
    const userID = req.user.userid;
    try {
        const careerPath = await query(
            "SELECT * FROM vw_careerpathinsights WHERE candidateid = (SELECT candidateid FROM candidates WHERE userid = ?)",
            [userID]
        );
        res.json(careerPath);
    } catch (err) {
        console.error("Fetch Career Path Error:", err.message);
        res.status(500).json({ error: "Failed to fetch career path insights." });
    }
});

/**
 * @route   POST /api/candidates/career-path/simulate
 * @desc    Simulate career path prediction for a target role
 * @access  Private (Candidate)
 */
router.post('/career-path/simulate', protect, authorize(3), async (req, res) => {
    const userID = req.user.userid;
    const { targetRole, years = 5 } = req.body;

    if (!targetRole) {
        return res.status(400).json({ error: "Target role is required." });
    }

    try {
        // Get candidateid from userid
        const candidate = await query("SELECT candidateid FROM candidates WHERE userid = ?", [userID]);
        if (candidate.length === 0) {
            return res.status(404).json({ error: "Candidate profile not found." });
        }
        const candidateID = candidate[0].candidateid;

        // Call the stored procedure for career path prediction
        const result = await query(
            "SELECT * FROM sp_predictcareerpath($1, $2, $3)",
            [candidateID, targetRole, years]
        );

        res.json(result[0] || result);
    } catch (err) {
        console.error("Career Path Simulation Error:", err.message);
        res.status(500).json({ error: "Failed to simulate career path." });
    }
});

/**
 * @route   GET /api/candidates/career-path/roles
 * @desc    Get available career roles for simulation
 * @access  Private (Candidate)
 */
router.get('/career-path/roles', protect, authorize(3), async (req, res) => {
    try {
        // Get distinct roles from careerpaths table
        const roles = await query(`
            SELECT DISTINCT torole AS rolename
            FROM careerpaths
            WHERE torole IS NOT NULL
        UNION
            SELECT DISTINCT jobtitle AS rolename
            FROM jobpostings
            WHERE isactive = true AND isdeleted = false
            ORDER BY rolename
        `);
        res.json(roles.map(r => r.rolename));
    } catch (err) {
        console.error("Fetch Career Roles Error:", err.message);
        res.status(500).json({ error: "Failed to fetch career roles." });
    }
});

/**
 * @route   POST /api/candidates/learning-path
 * @desc    Generate personalized learning path for the candidate
 * @access  Private (Candidate)
 */
router.post('/learning-path', protect, authorize(3), async (req, res) => {
    const userID = req.user.userid;
    const { targetJobID } = req.body;

    try {
        const candidate = await query("SELECT candidateid FROM candidates WHERE userid = ?", [userID]);
        if (candidate.length === 0) return res.status(404).json({ error: "Candidate profile not found." });
        const candidateID = candidate[0].candidateid;

        // Use targetJobID directly if provided
        let jobID = targetJobID;

        // Fallback: pick any job if no jobID provided
        if (!jobID) {
            const anyJob = await query("SELECT jobid FROM jobpostings ORDER BY createdat DESC LIMIT 1");
            if (anyJob.length > 0) {
                jobID = anyJob[0].jobid;
            }
        }

        if (!jobID) {
            // No jobs exist - create a demo learning path directly
            const demoPath = [
                { SkillName: 'Java Fundamentals', Priority: 1, EstimatedHours: 20 },
                { SkillName: 'SQL Database Design', Priority: 2, EstimatedHours: 15 },
                { SkillName: 'Spring Boot Framework', Priority: 3, EstimatedHours: 25 },
                { SkillName: 'REST API Development', Priority: 4, EstimatedHours: 18 },
                { SkillName: 'Git Version Control', Priority: 5, EstimatedHours: 8 }
            ];
            return res.json(demoPath);
        }

        console.log("Generating learning path for CandidateID:", candidateID, "JobID:", jobID);

        // First, try to call the stored procedure
        try {
            await query("CALL sp_generatelearningpath($1, $2)", [candidateID, jobID]);
        } catch (spErr) {
            console.error("Stored Procedure Error:", spErr.message);
            // Continue - we'll generate manually if needed
        }

        // Fetch the newly created learning path
        let learningPath = await query(
            "SELECT * FROM personalizedlearningpaths WHERE candidateid = ? ORDER BY createdat DESC",
            [candidateID]
        );

        // If no learning path was created, generate one manually
        if (learningPath.length === 0) {
            // Get job requirements
            const jobSkills = await query(
                `SELECT s.skillname, js.minproficiency, js.ismandatory
                 FROM jobskills js
                 JOIN skills s ON js.skillid = s.skillid
                 WHERE js.jobid = ? `,
                [jobID]
            );

            // Get candidate's current skills
            const candidateSkills = await query(
                `SELECT skillid, proficiencylevel FROM candidateskills WHERE candidateid = ? `,
                [candidateID]
            );

            // Create skill gap analysis
            const skillGaps = [];
            let priority = 1;

            for (const jobSkill of jobSkills) {
                const candSkill = candidateSkills.find(cs => cs.SkillID === jobSkill.SkillID);
                const currentLevel = candSkill ? candSkill.ProficiencyLevel : 0;
                const gap = jobSkill.MinProficiency - currentLevel;

                if (gap > 0) {
                    skillGaps.push({
                        SkillName: jobSkill.SkillName,
                        Priority: priority++,
                        EstimatedHours: gap * 4,
                        GapScore: gap,
                        CurrentLevel: currentLevel,
                        RequiredLevel: jobSkill.MinProficiency
                    });
                }
            }

            // If no gaps found, add some default skills
            if (skillGaps.length === 0) {
                skillGaps.push(
                    { SkillName: 'Advanced Java', Priority: 1, EstimatedHours: 20 },
                    { SkillName: 'System Design', Priority: 2, EstimatedHours: 15 },
                    { SkillName: 'Microservices', Priority: 3, EstimatedHours: 25 }
                );
            }

            learningPath = skillGaps;
        } else if (learningPath[0].SkillsGapAnalysis) {
            // Parse the SkillsGapAnalysis JSON
            try {
                const skillsGap = JSON.parse(learningPath[0].SkillsGapAnalysis);
                learningPath = skillsGap.map((skill, index) => ({
                    SkillName: skill.SkillName,
                    Priority: skill.Priority === 'High' ? 1 : (skill.Priority === 'Medium' ? 2 : 3),
                    EstimatedHours: skill.Gap ? skill.Gap * 4 : 8,
                    GapScore: skill.Gap,
                    CurrentLevel: skill.CurrentLevel,
                    RequiredLevel: skill.RequiredLevel
                }));
            } catch (e) {
                // Return as is if parsing fails
            }
        }

        res.json(learningPath);
    } catch (err) {
        console.error("Generate Learning Path Error:", err.message);
        // Return demo data on error
        const demoPath = [
            { SkillName: 'Java Fundamentals', Priority: 1, EstimatedHours: 20 },
            { SkillName: 'SQL Database Design', Priority: 2, EstimatedHours: 15 },
            { SkillName: 'Spring Boot Framework', Priority: 3, EstimatedHours: 25 }
        ];
        res.json(demoPath);
    }
});


/**
 * @route   GET /api/candidates/learning-path
 * @desc    Get existing learning path for the candidate
 * @access  Private (Candidate)
 */
router.get('/learning-path', protect, authorize(3), async (req, res) => {
    const userID = req.user.userid;
    try {
        const learningPath = await query(
            "SELECT * FROM personalizedlearningpaths WHERE candidateid = (SELECT candidateid FROM candidates WHERE userid = ?) ORDER BY createdat DESC",
            [userID]
        );

        // Parse the SkillsGapAnalysis JSON into skill items for frontend
        if (learningPath.length > 0 && learningPath[0].SkillsGapAnalysis) {
            try {
                const skillsGap = JSON.parse(learningPath[0].SkillsGapAnalysis);
                // Transform into frontend format
                const skillItems = skillsGap.map((skill, index) => ({
                    SkillName: skill.SkillName,
                    Priority: skill.Priority === 'High' ? 1 : (skill.Priority === 'Medium' ? 2 : 3),
                    EstimatedHours: skill.Gap * 4, // Estimate 4 hours per proficiency level gap
                    GapScore: skill.Gap,
                    CurrentLevel: skill.CurrentLevel,
                    RequiredLevel: skill.RequiredLevel
                }));
                return res.json(skillItems);
            } catch (parseErr) {
                console.error("Parse SkillsGap Error:", parseErr.message);
                // Return original data if parsing fails
                return res.json(learningPath);
            }
        }

        res.json(learningPath);
    } catch (err) {
        console.error("Fetch Learning Path Error:", err.message);
        res.status(500).json({ error: "Failed to fetch learning path." });
    }
});

/**
 * @route   GET /api/candidates/leaderboard
 * @desc    Get gamification leaderboard - points, levels, badges
 * @access  Private (Candidate)
 */
router.get('/leaderboard', protect, authorize(3), async (req, res) => {
    const userID = req.user.userid;
    try {
        const leaderboard = await query(
            "SELECT * FROM candidategamification WHERE candidateid = (SELECT candidateid FROM candidates WHERE userid = ?)",
            [userID]
        );
        res.json(leaderboard);
    } catch (err) {
        console.error("Fetch Leaderboard Error:", err.message);
        res.status(500).json({ error: "Failed to fetch leaderboard data." });
    }
});

/**
 * @route   GET /api/candidates/leaderboard/global
 * @desc    Get global leaderboard with rankings for all candidates
 * @access  Private (Candidate)
 */
router.get('/leaderboard/global', protect, authorize(3), async (req, res) => {
    const userID = req.user.userid;
    try {
        // Get global leaderboard - using points column
        const globalLeaderboard = await query(
            "SELECT cg.gameid, cg.candidateid, cg.points, cg.level, cg.badges, " +
            "cg.streakdays, cg.leaderboardrank, cg.engagementscore, " +
            "c.fullname, c.location, " +
            "ROW_NUMBER() OVER (ORDER BY cg.points DESC) AS globalrank " +
            "FROM candidategamification cg " +
            "JOIN candidates c ON cg.candidateid = c.candidateid " +
            "WHERE cg.points > 0 " +
            "ORDER BY cg.points DESC " +
            "LIMIT 50"
        );

        // Get current user's rank
        const userRank = await query(
            "SELECT COUNT(*) + 1 AS userrank FROM candidategamification " +
            "WHERE points > (SELECT COALESCE(points, 0) FROM candidategamification " +
            "WHERE candidateid = (SELECT candidateid FROM candidates WHERE userid = ?))",
            [userID]
        );

        res.json({
            globalRanking: globalLeaderboard,
            userRank: parseInt(userRank[0]?.userrank) || 0
        });
    } catch (err) {
        console.error("Fetch Global Leaderboard Error:", err.message);
        res.status(500).json({ error: "Failed to fetch global leaderboard." });
    }
});

/**
 * @route   POST /api/candidates/gamification/daily-login
 * @desc    Record daily login and award streak points
 * @access  Private (Candidate)
 */
router.post('/gamification/daily-login', protect, authorize(3), async (req, res) => {
    const userID = req.user.userid;

    // Retry logic for deadlock handling
    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
        try {
            const candidate = await query("SELECT candidateid FROM candidates WHERE userid = ?", [userID]);
            if (candidate.length === 0) return res.status(404).json({ error: "Candidate profile not found." });
            const candidateID = candidate[0].candidateid;

            // Check if already logged in today
            const today = new Date().toISOString().split('T')[0];
            const lastLogin = await query(
                "SELECT lastactivitydate FROM candidategamification WHERE candidateid = ?",
                [candidateID]
            );

            let streakBonus = 0;
            let isNewDay = true;

            if (lastLogin.length > 0 && lastLogin[0].lastactivitydate) {
                const lastLoginDate = new Date(lastLogin[0].lastactivitydate).toISOString().split('T')[0];
                if (lastLoginDate === today) {
                    isNewDay = false;
                }
            }

            // Only process if it's a new day
            if (isNewDay) {
                // Calculate streak bonus in a single atomic update
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];

                const lastLoginDate = lastLogin.length > 0 && lastLogin[0].lastactivitydate
                    ? new Date(lastLogin[0].lastactivitydate).toISOString().split('T')[0]
                    : null;

                if (lastLoginDate === yesterdayStr) {
                    // Consecutive day - increment streak
                    await query(`
                        UPDATE candidategamification 
                        SET streakdays = streakdays + 1,
            lastactivitydate = NOW(),
            points = points + 10
                        WHERE candidateid = ?
            `, [candidateID]);
                    streakBonus = 5;
                } else if (lastLoginDate !== today) {
                    // Streak broken or first login - reset to 1
                    await query(`
                        UPDATE candidategamification 
                        SET streakdays = 1,
            lastactivitydate = NOW(),
            points = points + 10
                        WHERE candidateid = ?
            `, [candidateID]);
                }
            }

            // Get updated gamification data
            const updatedData = await query(
                "SELECT * FROM candidategamification WHERE candidateid = ?",
                [candidateID]
            );

            return res.json({
                message: isNewDay ? "Daily login recorded!" : "Already logged in today",
                streakBonus: streakBonus,
                isNewDay: isNewDay,
                gamification: updatedData[0]
            });
        } catch (err) {
            // Check if it's a deadlock error (error number 1205)
            if (err.code === '1205' || err.message.includes('deadlock')) {
                retryCount++;
                console.log(`Deadlock detected, retry ${retryCount}/${maxRetries}`);
                if (retryCount < maxRetries) {
                    // Wait a bit before retrying
                    await new Promise(resolve => setTimeout(resolve, 100 * retryCount));
                    continue;
                }
            }
            console.error("Daily Login Error:", err.message);
            return res.status(500).json({ error: "Failed to record daily login." });
        }
    }

    res.status(500).json({ error: "Failed to record daily login after retries." });
}
);

/**
 * @route   POST /api/candidates/gamification/profile-complete
 * @desc    Award points for completing profile
 * @access  Private (Candidate)
 */
router.post('/gamification/profile-complete', protect, authorize(3), async (req, res) => {
    const userID = req.user.userid;
    try {
        const candidate = await query("SELECT candidateid FROM candidates WHERE userid = ?", [userID]);
        if (candidate.length === 0) return res.status(404).json({ error: "Candidate profile not found." });
        const candidateID = candidate[0].candidateid;

        // Award points for profile completion
        try {
            await query("CALL sp_awardgamificationpoints($1, $2)", [candidateID, 'ProfileComplete']);
        } catch (gErr) {
            console.error("Gamification Error:", gErr.message);
        }

        res.json({ message: "Profile completion points awarded!" });
    } catch (err) {
        console.error("Profile Complete Error:", err.message);
        res.status(500).json({ error: "Failed to award profile points." });
    }
});

/**
 * @route   POST /api/candidates/gamification/skill-verified
 * @desc    Award points when a skill is verified
 * @access  Private (Candidate)
 */
router.post('/gamification/skill-verified', protect, authorize(3), async (req, res) => {
    const userID = req.user.userid;
    try {
        const candidate = await query("SELECT candidateid FROM candidates WHERE userid = ?", [userID]);
        if (candidate.length === 0) return res.status(404).json({ error: "Candidate profile not found." });
        const candidateID = candidate[0].candidateid;

        // Award points for skill verification
        try {
            await query("CALL sp_awardgamificationpoints($1, $2)", [candidateID, 'SkillVerified']);
        } catch (gErr) {
            console.error("Gamification Error:", gErr.message);
        }

        res.json({ message: "Skill verification points awarded!" });
    } catch (err) {
        console.error("Skill Verified Error:", err.message);
        res.status(500).json({ error: "Failed to award skill verification points." });
    }
});

/**
 * @route   GET /api/candidates/interview-prep
 * @desc    Get interview preparation materials for candidate's applications
 * @access  Private (Candidate)
 */
router.get('/interview-prep', protect, authorize(3), async (req, res) => {
    const userID = req.user.userid;
    try {
        const prepMaterials = await query(
            "SELECT * FROM interviewprepmaterials WHERE isactive = true ORDER BY difficultylevel ASC"
        );
        res.json(prepMaterials);
    } catch (err) {
        console.error("Fetch Interview Prep Error:", err.message);
        res.status(500).json({ error: "Failed to fetch interview prep materials." });
    }
});

/**
 * @route   POST /api/candidates/interview-prep/generate
 * @desc    Generate personalized interview prep for a specific job
 * @access  Private (Candidate)
 */
router.post('/interview-prep/generate', protect, authorize(3), async (req, res) => {
    const userID = req.user.userid;
    const { jobID, applicationID } = req.body;

    try {
        const candidate = await query("SELECT candidateid FROM candidates WHERE userid = ?", [userID]);
        if (candidate.length === 0) return res.status(404).json({ error: "Candidate profile not found." });
        const candidateID = candidate[0].candidateid;

        // Get job details for generating prep
        const job = await query("SELECT jobtitle, description FROM jobpostings WHERE jobid = ?", [jobID]);
        if (job.length === 0) return res.status(404).json({ error: "Job not found." });

        // Call stored procedure to generate prep
        const result = await query("SELECT * FROM sp_generateinterviewprep($1, $2)", [candidateID, jobID]);
        res.json(result);
    } catch (err) {
        console.error("Generate Interview Prep Error:", err.message);
        res.status(500).json({ error: "Failed to generate interview prep." });
    }
});

/**
 * @route   GET /api/candidates/salary-coach
 * @desc    Get salary negotiation coaching for candidate
 * @access  Private (Candidate)
 */
router.get('/salary-coach', protect, authorize(3), async (req, res) => {
    const userID = req.user.userid;
    try {
        const salaryData = await query(
            "SELECT * FROM salarybenchmarks WHERE isactive = true ORDER BY avgsalary DESC"
        );
        res.json(salaryData);
    } catch (err) {
        console.error("Fetch Salary Coach Error:", err.message);
        res.status(500).json({ error: "Failed to fetch salary data." });
    }
});

/**
 * @route   POST /api/candidates/salary-coach/negotiate
 * @desc    Generate salary negotiation strategy
 * @access  Private (Candidate)
 */
router.post('/salary-coach/negotiate', protect, authorize(3), async (req, res) => {
    const userID = req.user.userid;
    let { jobID, currentSalary, targetSalary } = req.body;

    // Parse jobID if it's a string (could be "JobID - Status" format from frontend)
    if (typeof jobID === 'string' && jobID.includes(' - ')) {
        jobID = jobID.split(' - ')[0];
    }
    jobID = parseInt(jobID);

    if (!jobID || isNaN(jobID)) {
        return res.status(400).json({ error: "Valid Job ID is required." });
    }

    try {
        const candidate = await query("SELECT candidateid FROM candidates WHERE userid = ?", [userID]);
        if (candidate.length === 0) return res.status(404).json({ error: "Candidate profile not found." });
        const candidateID = candidate[0].candidateid;

        // Get job info - salary ranges are in jobsalaryranges table
        const jobInfo = await query(`
            SELECT j.jobid, j.jobtitle, j.location, 
                   jsr.minsalary, jsr.maxsalary
            FROM jobpostings j
            LEFT JOIN jobsalaryranges jsr ON j.jobid = jsr.jobid
            WHERE j.jobid = ?
        `, [jobID]);

        if (jobInfo.length === 0) {
            return res.status(404).json({ error: "Job not found." });
        }

        // Call stored procedure for negotiation strategy
        const initialOffer = parseFloat(currentSalary) || 0;
        await query("CALL sp_generatenegotiationstrategy($1, $2, $3)",
            [candidateID, jobID, initialOffer]);

        // Fetch the result from negotiationhistory after procedure runs
        const negResult = await query("SELECT * FROM negotiationhistory WHERE candidateid = ? AND jobid = ? ORDER BY startedat DESC LIMIT 1", [candidateID, jobID]);

        const response = negResult[0] || {};
        if (targetSalary && response) {
            response.targetsalary = targetSalary;
            response.gaptotarget = targetSalary - (response.recommendedcounteroffer || initialOffer);
        }

        res.json(response);
    } catch (err) {
        console.error("Generate Negotiation Strategy Error:", err.message);
        res.status(500).json({ error: "Failed to generate negotiation strategy: " + err.message });
    }
});

/**
 * @route   GET /api/candidates/location-preferences
 * @desc    Get candidate's location preferences
 * @access  Private (Candidate)
 */
router.get('/location-preferences', protect, authorize(3), async (req, res) => {
    const userID = req.user.userid;
    try {
        const prefs = await query(
            `SELECT 
                preferenceid, candidateid, 
                preferredlocations, 
                willingtorelocate, 
                remotepreference, 
                commutetimemax, 
                locationpriority, 
                lastupdated
            FROM candidatelocationpreferences WHERE candidateid = (SELECT candidateid FROM candidates WHERE userid = ?)`,
            [userID]
        );
        if (prefs.length === 0) {
            // Return default preferences if none set
            return res.json([{
                remotepreference: 'Hybrid',
                willingtorelocate: false,
                commutetimemax: 60,
                preferredlocations: '',
                locationpriority: 5
            }]);
        }
        res.json(prefs);
    } catch (err) {
        console.error("Fetch Location Preferences Error:", err.message);
        res.status(500).json({ error: "Failed to fetch location preferences." });
    }
});

/**
 * @route   POST /api/candidates/location-preferences
 * @desc    Save candidate's location preferences
 * @access  Private (Candidate)
 */
router.post('/location-preferences', protect, authorize(3), async (req, res) => {
    const userID = req.user.userid;
    const { workType, locations, openToRelocate, maxCommute, locationPriority } = req.body;

    try {
        const candidate = await query("SELECT candidateid FROM candidates WHERE userid = ?", [userID]);
        if (candidate.length === 0) return res.status(404).json({ error: "Candidate profile not found." });
        const candidateID = candidate[0].candidateid;

        const locationsStr = Array.isArray(locations) ? locations.join(', ') : (locations || '');

        // Map frontend workType to database remotepreference values
        let remotePreference = 'Hybrid';
        if (workType === 'remote') remotePreference = 'Full';
        else if (workType === 'onsite') remotePreference = 'None';
        else remotePreference = 'Hybrid';

        // Check if preferences exist
        const existing = await query("SELECT * FROM candidatelocationpreferences WHERE candidateid = ?", [candidateID]);

        if (existing.length > 0) {
            await query(
                `UPDATE candidatelocationpreferences 
                SET remotepreference = ?, preferredlocations = ?, willingtorelocate = ?, commutetimemax = ?, locationpriority = ?, lastupdated = NOW()
                WHERE candidateid = ?`,
                [remotePreference, locationsStr, !!openToRelocate, maxCommute || 60, locationPriority || 5, candidateID]
            );
        } else {
            await query(
                `INSERT INTO candidatelocationpreferences (candidateid, remotepreference, preferredlocations, willingtorelocate, commutetimemax, locationpriority)
                VALUES (?, ?, ?, ?, ?, ?)`,
                [candidateID, remotePreference, locationsStr, !!openToRelocate, maxCommute || 60, locationPriority || 5]
            );
        }

        res.json({ message: "Location preferences saved successfully." });
    } catch (err) {
        console.error("Save Location Preferences Error:", err.message);
        res.status(500).json({ error: "Failed to save location preferences." });
    }
});

/**
 * @route   GET /api/candidates/resume-score
 * @desc    Get resume quality score and insights from ResumeInsights table
 * @access  Private (Candidate)
 */
router.get('/resume-score', protect, authorize(3), async (req, res) => {
    const userID = req.user.userid;
    try {
        // Query resumeinsights table for stored score and factors
        const result = await query(`
            SELECT 
                ri.insightid,
                ri.resumequalityscore,
                ri.educationinstitutions,
                ri.certifications,
                ri.technologiesmentioned,
                ri.yearsexperienceextracted,
                ri.leadershiptermscount,
                ri.achievementdensity,
                ri.readabilityscore,
                ri.keywordsmatched,
                ri.extractedskills AS riextractedskills,
                ri.processingstatus,
                ri.nlpprocessedat,
                ri.confidencescore,
                c.resumetext,
                c.extractedskills,
                c.yearsofexperience
            FROM candidates c
            LEFT JOIN resumeinsights ri ON c.candidateid = ri.candidateid
            WHERE c.userid = ?
        `, [userID]);

        if (result.length === 0) {
            return res.status(404).json({ error: "Candidate not found." });
        }

        const row = result[0];
        const resumeText = row.resumetext || '';
        const extractedSkills = row.extractedskills || '';

        // If resumeinsights has data, use it
        if (row.insightid && row.resumequalityscore !== null) {
            const factors = [];

            // Build factors from resumeinsights data
            if (row.readabilityscore && row.readabilityscore >= 60) {
                factors.push({ factor: 'Good readability', points: Math.round(row.readabilityscore * 0.25) });
            } else {
                factors.push({ factor: 'Improve resume readability', points: 0 });
            }

            if (row.leadershiptermscount && row.leadershiptermscount > 0) {
                factors.push({ factor: 'Leadership terms detected', points: Math.min(20, row.leadershiptermscount * 5) });
            } else {
                factors.push({ factor: 'Add leadership achievements', points: 0 });
            }

            if (row.achievementdensity && row.achievementdensity >= 0.3) {
                factors.push({ factor: 'Strong achievement focus', points: Math.round(row.achievementdensity * 50) });
            } else {
                factors.push({ factor: 'Add quantifiable achievements', points: 0 });
            }

            if (row.keywordsmatched && row.keywordsmatched >= 5) {
                factors.push({ factor: 'Good keyword optimization', points: Math.min(25, row.keywordsmatched * 2) });
            } else {
                factors.push({ factor: 'Include more industry keywords', points: 0 });
            }

            res.json({
                overallScore: row.resumequalityscore,
                factors: factors,
                resumeText: resumeText.substring(0, 200) + (resumeText.length > 200 ? '...' : ''),
                extractedSkills: extractedSkills,
                technologiesMentioned: row.technologiesmentioned,
                certifications: row.certifications,
                processingStatus: row.processingstatus,
                lastAnalyzed: row.nlpprocessedat,
                confidenceScore: row.confidencescore
            });
        } else {
            // Fallback: Calculate simple score based on resume content
            let score = 0;
            const factors = [];

            // Length check
            if (resumeText.length > 500) { score += 20; factors.push({ factor: 'Good length', points: 20 }); }
            else { factors.push({ factor: 'Too short - add more details', points: 0 }); }

            // Skills check
            if (extractedSkills && extractedSkills.split(',').length > 3) { score += 30; factors.push({ factor: 'Skills section complete', points: 30 }); }
            else { factors.push({ factor: 'Add more technical skills', points: 0 }); }

            // Experience check
            if (row.yearsofexperience > 2) { score += 25; factors.push({ factor: 'Strong experience', points: 25 }); }
            else { factors.push({ factor: 'Highlight your experience', points: 0 }); }

            // Format check
            if (resumeText.includes('Summary') || resumeText.includes('Objective')) { score += 25; factors.push({ factor: 'Professional format', points: 25 }); }
            else { factors.push({ factor: 'Add a professional summary', points: 0 }); }

            res.json({
                overallScore: Math.min(100, score),
                factors: factors,
                resumeText: resumeText.substring(0, 200) + (resumeText.length > 200 ? '...' : ''),
                extractedSkills: extractedSkills,
                processingStatus: 'Pending',
                lastAnalyzed: null
            });
        }
    } catch (err) {
        console.error("Fetch Resume Score Error:", err.message);
        res.status(500).json({ error: "Failed to analyze resume." });
    }
});

/**
 * @route   GET /api/candidates/invitations
 * @desc    Get all pending invitations for the candidate
 * @access  Private (Candidate)
 */
router.get('/invitations', protect, authorize(3), async (req, res) => {
    const userID = req.user.userid;
    try {
        const invitations = await query(
            "SELECT a.applicationid, a.applieddate, j.jobtitle, j.location, j.description, j.jobid " +
            "FROM applications a " +
            "JOIN candidates c ON a.candidateid = c.candidateid " +
            "JOIN jobpostings j ON a.jobid = j.jobid " +
            "WHERE c.userid = ? AND a.statusid = 7 AND a.isdeleted = false " +
            "ORDER BY a.applieddate DESC",
            [userID]
        );
        res.json(invitations);
    } catch (err) {
        console.error("Fetch Invitations Error:", err.message);
        res.status(500).json({ error: "Failed to fetch invitations." });
    }
});

/**
 * @route   POST /api/candidates/invitations/:id/respond
 * @desc    Accept or decline an interview/pipeline invitation
 * @access  Private (Candidate)
 */
router.post('/invitations/:id/respond', protect, authorize(3), async (req, res) => {
    const { action } = req.body; // 'accept' or 'decline'
    const applicationID = req.params.id;
    const userID = req.user.userid;

    if (!['accept', 'decline'].includes(action)) {
        return res.status(400).json({ error: "Invalid action. Must be 'accept' or 'decline'." });
    }

    try {
        const candidate = await query("SELECT candidateid FROM candidates WHERE userid = ?", [userID]);
        const candidateID = candidate[0].candidateid;

        // Verify the application belongs to the candidate and is in 'Invited' state
        const app = await query(
            "SELECT statusid FROM applications WHERE applicationid = ? AND candidateid = ?",
            [applicationID, candidateID]
        );

        if (app.length === 0) return res.status(404).json({ error: "Invitation not found." });
        if (app[0].statusid !== 7) return res.status(400).json({ error: "This application is not in 'Invited' state." });

        const newStatus = action === 'accept' ? 1 : 6; // 1 = Applied, 6 = Withdrawn

        await query(
            "UPDATE applications SET statusid = ?, applieddate = NOW() WHERE applicationid = ?",
            [newStatus, applicationID]
        );

        res.json({ message: `Invitation ${action}ed successfully.` });
    } catch (err) {
        console.error("Invitation Respond Error:", err.message);
        res.status(500).json({ error: "Failed to respond to invitation." });
    }
});

/**
 * @route   GET /api/candidates/notifications
 * @desc    Get push notifications for the logged-in candidate
 * @access  Private (Candidate)
 * 
 * Actual PushNotifications columns: NotificationID, UserID, DeviceToken, Platform,
 * Title, Body, NotificationType, DataPayload, SentAt, DeliveredAt, ReadAt,
 * ClickedAt, CampaignID, IsSilent, Priority, ExpiresAt
 */
router.get('/notifications', protect, authorize(3), async (req, res) => {
    const userID = req.user.userid;
    try {
        const notifications = await query(
            `SELECT 
                pn.notificationid,
                pn.title,
                pn.body AS message,
                pn.notificationtype,
                pn.sentat AS createdat,
                pn.readat,
                CASE WHEN pn.readat IS NOT NULL THEN true ELSE false END AS isread,
                pn.priority
            FROM pushnotifications pn
            WHERE pn.userid = ?
            ORDER BY pn.sentat DESC`,
            [userID]
        );
        res.json(notifications);
    } catch (err) {
        console.error("Fetch Notifications Error:", err.message);
        res.status(500).json({ error: "Failed to fetch notifications." });
    }
});

/**
 * @route   POST /api/candidates/notifications/register-device
 * @desc    Register a device for push notifications
 * @access  Private (Candidate)
 */
router.post('/notifications/register-device', protect, authorize(3), async (req, res) => {
    const userID = req.user.userid;
    const { deviceToken, platform } = req.body;

    try {
        // Check if device already registered
        const existing = await query(
            "SELECT * FROM pushnotifications WHERE userid = ? AND devicetoken = ?",
            [userID, deviceToken]
        );

        if (existing.length > 0) {
            // Update existing device registration
            await query(
                "UPDATE pushnotifications SET platform = ?, sentat = NOW() WHERE userid = ? AND devicetoken = ?",
                [platform || 'web', userID, deviceToken]
            );
        } else {
            // Insert new device registration
            await query(
                "INSERT INTO pushnotifications (userid, devicetoken, platform, notificationtype, title, body, sentat, priority) VALUES (?, ?, ?, 'DeviceRegistration', 'Device Registered', 'Push notifications enabled', NOW(), 1)",
                [userID, deviceToken, platform || 'web']
            );
        }

        res.json({ message: "Device registered for notifications." });
    } catch (err) {
        console.error("Register Device Error:", err.message);
        res.status(500).json({ error: "Failed to register device." });
    }
});

/**
 * @route   POST /api/candidates/notifications/mark-read
 * @desc    Mark notifications as read
 * @access  Private (Candidate)
 */
router.post('/notifications/mark-read', protect, authorize(3), async (req, res) => {
    const userID = req.user.userid;
    const { notificationIDs } = req.body;

    try {
        if (notificationIDs && notificationIDs.length > 0) {
            const ids = notificationIDs.join(',');
            await query(
                `UPDATE pushnotifications SET readat = NOW() 
                WHERE userid = ? AND notificationid IN (${ids})`,
                [userID]
            );
        } else {
            // Mark all as read
            await query(
                "UPDATE pushnotifications SET readat = NOW() WHERE userid = ? AND readat IS NULL",
                [userID]
            );
        }

        res.json({ message: "Notifications marked as read." });
    } catch (err) {
        console.error("Mark Read Error:", err.message);
        res.status(500).json({ error: "Failed to mark notifications as read." });
    }
});

/**
 * @route   GET /api/candidates/skill-gap-analysis
 * @desc    Get skill gap analysis for the logged-in candidate
 * @access  Private (Candidate)
 * 
 * JobSkills columns: JobID, SkillID, IsMandatory, MinProficiency
 * CandidateSkills columns: CandidateID, SkillID, ProficiencyLevel
 * vw_SkillGapAnalysis columns: SkillName, JobsRequiringSkill, CandidatesWithSkill, SkillGap
 */
router.get('/skill-gap-analysis', protect, authorize(3), async (req, res) => {
    const userID = req.user.userid;
    try {
        // Build personalized skill gap using actual table columns
        const skillGaps = await query(
            `SELECT DISTINCT
                s.skillid,
                s.skillname,
                js.minproficiency AS demandlevel,
                COALESCE(cs.proficiencylevel, 0) AS proficiencylevel,
                js.minproficiency - COALESCE(cs.proficiencylevel, 0) AS gapscore,
                CASE 
                    WHEN cs.proficiencylevel IS NULL THEN 'Critical Gap'
                    WHEN js.minproficiency - COALESCE(cs.proficiencylevel, 0) >= 2 THEN 'Critical Gap'
                    WHEN js.minproficiency > COALESCE(cs.proficiencylevel, 0) THEN 'Learning Opportunity'
                    ELSE 'Adequate'
                END AS gapcategory
            FROM skills s
            JOIN jobskills js ON s.skillid = js.skillid
            LEFT JOIN candidateskills cs ON s.skillid = cs.skillid 
                AND cs.candidateid = (SELECT candidateid FROM candidates WHERE userid = ?)
            WHERE js.ismandatory = true
            ORDER BY gapscore DESC`,
            [userID]
        );
        res.json(skillGaps);
    } catch (err) {
        console.error("Fetch Skill Gap Analysis Error:", err.message);
        res.status(500).json({ error: "Failed to fetch skill gap analysis." });
    }
});

/**
 * @route   GET /api/candidates/skills-demand
 * @desc    Get market skill demand data for candidate's skills
 * @access  Private (Candidate)
 * 
 * MarketIntelligence columns: IntelID, SkillID, Location, DemandScore, SupplyScore,
 * SalaryTrend, AvgSalary, CompetitorHiringActivity, JobPostingsCount,
 * CandidateApplicationsCount, TimeToFillDays, LastUpdated, Source, Confidence
 */
router.get('/skills-demand', protect, authorize(3), async (req, res) => {
    const userID = req.user.userid;
    try {
        const skillsDemand = await query(
            `SELECT 
                s.skillid,
                s.skillname,
                mi.demandscore,
                mi.supplyscore,
                mi.salarytrend AS trenddirection,
                mi.avgsalary
            FROM skills s
            JOIN marketintelligence mi ON s.skillid = mi.skillid
            ORDER BY mi.demandscore DESC`
        );
        res.json(skillsDemand);
    } catch (err) {
        console.error("Fetch Skills Demand Error:", err.message);
        res.status(500).json({ error: "Failed to fetch skills demand data." });
    }
});

// ============================================
// CANDIDATE SENTIMENT TRACKING ENDPOINTS
// ============================================

/**
 * @route   GET /api/candidates/:id/sentiment
 * @desc    Get sentiment history for a candidate
 * @access  Private (Recruiter/Admin)
 */
router.get('/:id/sentiment', protect, authorize([1, 2]), async (req, res) => {
    const { id } = req.params;
    const { limit, interactionType } = req.query;

    try {
        // Query sentiment history
        const history = await query(
            `SELECT * FROM candidatesentiment WHERE candidateid = ? ORDER BY interactiondate DESC LIMIT ?`,
            [id, parseInt(limit) || 50]
        );

        const summaryResult = await query(`
            SELECT 
                COUNT(*) AS totalinteractions,
                AVG(sentimentscore) AS avgsentimentscore,
                AVG(confidence) AS avgconfidence,
                COUNT(CASE WHEN sentimentscore < -0.5 THEN 1 END) AS totalredflags,
                COUNT(CASE WHEN sentimentscore > 0.5 THEN 1 END) AS totalpositiveindicators
            FROM candidatesentiment
            WHERE candidateid = ?
        `, [id]);

        res.json({
            history: history || [],
            summary: {
                TotalInteractions: summaryResult[0]?.totalinteractions || 0,
                AvgSentimentScore: summaryResult[0]?.avgsentimentscore || 0,
                AvgConfidence: summaryResult[0]?.avgconfidence || 0,
                TotalRedFlags: summaryResult[0]?.totalredflags || 0,
                TotalPositiveIndicators: summaryResult[0]?.totalpositiveindicators || 0
            }
        });
    } catch (err) {
        console.error("Fetch Sentiment Error:", err.message);
        res.status(500).json({ error: "Failed to fetch sentiment data." });
    }
});

/**
 * @route   POST /api/candidates/:id/sentiment
 * @desc    Add a new sentiment analysis for a candidate
 * @access  Private (Recruiter/Admin)
 */
router.post('/:id/sentiment', protect, authorize([1, 2]), async (req, res) => {
    const { id } = req.params;
    const { interactionType, rawText, interactionDate } = req.body;

    if (!interactionType || !rawText) {
        return res.status(400).json({ error: "InteractionType and rawText are required." });
    }

    try {
        await query(
            `CALL sp_analyzecandidatesentiment($1, $2, $3, $4)`,
            [id, interactionType, rawText, interactionDate || null]
        );

        // Fetch the latest sentiment record inserted
        const inserted = await query(`SELECT * FROM candidatesentiment WHERE candidateid = ? ORDER BY interactiondate DESC LIMIT 1`, [id]);

        res.status(201).json({
            message: "Sentiment analysis completed.",
            result: inserted[0]
        });
    } catch (err) {
        console.error("Sentiment Analysis Error:", err.message);
        res.status(500).json({ error: err.message || "Failed to analyze sentiment." });
    }
});

/**
 * @route   GET /api/candidates/:id/sentiment/summary
 * @desc    Get aggregated sentiment summary for a candidate
 * @access  Private (Recruiter/Admin)
 */
router.get('/:id/sentiment/summary', protect, authorize([1, 2]), async (req, res) => {
    const { id } = req.params;

    try {
        const result = await query(`
            SELECT 
                COUNT(*) AS totalinteractions,
                COALESCE(AVG(sentimentscore), 0) AS avgsentimentscore,
                COALESCE(AVG(confidence), 0) AS avgconfidence,
                COALESCE(SUM(redflagsdetected), 0) AS totalredflags,
                COALESCE(SUM(positiveindicators), 0) AS totalpositiveindicators,
                COALESCE(MAX(sentimentscore), 0) AS highestscore,
                COALESCE(MIN(sentimentscore), 0) AS lowestscore,
                (SELECT communicationstyle 
                 FROM candidatesentiment 
                 WHERE candidateid = ? 
                 GROUP BY communicationstyle 
                 ORDER BY COUNT(*) DESC
                 LIMIT 1) AS dominantcommunicationstyle,
                (SELECT COUNT(*) FROM candidatesentiment WHERE candidateid = ? AND interactiontype = 'Email') AS emailcount,
                (SELECT COUNT(*) FROM candidatesentiment WHERE candidateid = ? AND interactiontype = 'Interview') AS interviewcount,
                (SELECT COUNT(*) FROM candidatesentiment WHERE candidateid = ? AND interactiontype = 'Call') AS callcount,
                (SELECT COUNT(*) FROM candidatesentiment WHERE candidateid = ? AND interactiontype = 'Chat') AS chatcount
            FROM candidatesentiment
            WHERE candidateid = ?
        `, [id, id, id, id, id, id]);

        res.json(result[0]);
    } catch (err) {
        console.error("Fetch Sentiment Summary Error:", err.message);
        res.status(500).json({ error: "Failed to fetch sentiment summary." });
    }
});

/**
 * @route   GET /api/candidates/profile/extracted-skills
 * @desc    Get skills extracted from resume
 * @access  Private (Candidate)
 */
router.get('/profile/extracted-skills', protect, authorize(3), async (req, res) => {
    const userID = req.user.userid;
    try {
        const result = await query(
            "SELECT extractedskills, resumetext, yearsofexperience FROM candidates WHERE userid = ?",
            [userID]
        );

        if (result.length === 0) {
            return res.status(404).json({ error: "Candidate not found." });
        }

        const { extractedskills, resumetext, yearsofexperience } = result[0];

        // Parse extractedskills from "Java:40,React:35,SQL:25" format
        let skills = [];
        if (extractedskills) {
            skills = extractedskills.split(',').map(s => {
                const [skillName, confidence] = s.split(':');
                return {
                    skillName: skillName?.trim(),
                    confidence: parseInt(confidence) || 0,
                    source: 'Resume'
                };
            }).filter(s => s.skillName);
        }

        res.json({
            skills,
            resumeTextLength: resumetext?.length || 0,
            extractedYearsExperience: yearsofexperience
        });
    } catch (err) {
        console.error("Fetch Extracted Skills Error:", err.message);
        res.status(500).json({ error: "Failed to fetch extracted skills." });
    }
});

/**
 * @route   GET /api/candidates/profile
 * @desc    Get full candidate profile including consent and notification preferences
 * @access  Private (Candidate)
 */
router.get('/profile', protect, authorize(3), async (req, res) => {
    const userID = req.user.userid;
    try {
        // Get candidate basic info
        const candidate = await query(
            `SELECT c.*, u.email, u.username, u.lastlogin 
             FROM candidates c 
             JOIN users u ON c.userid = u.userid 
             WHERE c.userid = ?`,
            [userID]
        );

        if (candidate.length === 0) {
            return res.status(404).json({ error: "Candidate profile not found." });
        }

        const c = candidate[0];

        // Get consent records
        let consents = [];
        try {
            const result = await query(
                `SELECT consenttype, isactive AS isgranted, expirydate FROM consentmanagement WHERE candidateid = ?`,
                [c.candidateid]
            );
            consents = result || [];
        } catch (err) {
            console.log("ConsentManagement table not available:", err.message);
        }

        // Get notification preferences
        let notifications = [];
        try {
            const result = await query(
                `SELECT notificationtype, platform FROM pushnotifications WHERE userid = ?`,
                [userID]
            );
            notifications = result || [];
        } catch (err) {
            console.log("PushNotifications table not available:", err.message);
        }

        // Calculate profile completion score
        let filledFields = 0;
        const totalFields = 8; // FullName, Location, YearsOfExperience, LinkedInURL, Timezone, PreferredLocations, ResumeText, Skills
        if (c.fullname) filledFields++;
        if (c.location) filledFields++;
        if (c.yearsofexperience > 0) filledFields++;
        if (c.linkedinurl) filledFields++;
        if (c.timezone) filledFields++;
        if (c.preferredlocations) filledFields++;
        if (c.resumetext) filledFields++;

        const profileCompletionScore = Math.round((filledFields / totalFields) * 100);

        res.json({
            candidateID: c.candidateid,
            fullName: c.fullname,
            email: c.email,
            username: c.username,
            location: c.location,
            yearsOfExperience: c.yearsofexperience,
            preferredLocations: c.preferredlocations,
            linkedInURL: c.linkedinurl,
            timezone: c.timezone,
            lastLogin: c.lastlogin,
            profileCompletionScore,
            consents: consents || [],
            notifications: notifications || []
        });
    } catch (err) {
        console.error("Fetch Profile Error:", err.message);
        res.status(500).json({ error: "Failed to fetch profile." });
    }
});

/**
 * @route   PUT /api/candidates/profile
 * @desc    Update candidate profile
 * @access  Private (Candidate)
 */
router.put('/profile', protect, authorize(3), async (req, res) => {
    const userID = req.user.userid;
    const { fullName, location, yearsOfExperience, preferredLocations, linkedInURL, timezone } = req.body;

    try {
        const candidate = await query(
            "SELECT candidateid FROM candidates WHERE userid = ?",
            [userID]
        );

        if (candidate.length === 0) {
            return res.status(404).json({ error: "Candidate profile not found." });
        }

        await query(
            `UPDATE candidates 
             SET fullname = ?, location = ?, yearsofexperience = ?, 
                 preferredlocations = ?, linkedinurl = ?, timezone = ?
             WHERE userid = ?`,
            [fullName, location, yearsOfExperience || 0, preferredLocations, linkedInURL, timezone, userID]
        );

        res.json({ success: true, message: "Profile updated successfully." });
    } catch (err) {
        console.error("Update Profile Error:", err.message);
        res.status(500).json({ error: "Failed to update profile." });
    }
});

/**
 * @route   PUT /api/candidates/profile/consent
 * @desc    Update consent preferences
 * @access  Private (Candidate)
 */
router.put('/profile/consent', protect, authorize(3), async (req, res) => {
    const userID = req.user.userid;
    const { consentType, isGranted } = req.body;

    try {
        const candidate = await query(
            "SELECT candidateid FROM candidates WHERE userid = ?",
            [userID]
        );

        if (candidate.length === 0) {
            return res.status(404).json({ error: "Candidate profile not found." });
        }

        const candidateID = candidate[0].candidateid;

        // Check if consent table exists
        try {
            // Check if consent exists
            const existing = await query(
                "SELECT consentid FROM consentmanagement WHERE candidateid = ? AND consenttype = ?",
                [candidateID, consentType]
            );

            if (existing.length > 0) {
                await query(
                    `UPDATE consentmanagement SET isactive = ?, givenat = NOW(), expirydate = NOW() + INTERVAL '1 year' 
                     WHERE candidateid = ? AND consenttype = ?`,
                    [!!isGranted, candidateID, consentType]
                );
            } else {
                await query(
                    `INSERT INTO consentmanagement (candidateid, consenttype, isactive, givenat, expirydate, consentversion) 
                     VALUES (?, ?, ?, NOW(), NOW() + INTERVAL '1 year', 1)`,
                    [candidateID, consentType, !!isGranted]
                );
            }
            res.json({ success: true, message: "Consent preferences updated." });
        } catch (tableErr) {
            console.log("consentmanagement table not available:", tableErr.message);
            res.json({ success: true, message: "Consent preferences saved (feature unavailable in current DB)." });
        }
    } catch (err) {
        console.error("Update Consent Error:", err.message);
        res.status(500).json({ error: "Failed to update consent." });
    }
});

// ============================================================================
// DOCUMENT UPLOAD ROUTES
// ============================================================================

// Configure multer for memory storage (store as buffer for VARBINARY)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Allowed: PDF, DOCX, JPG, PNG'));
        }
    }
});

/**
 * @route   POST /api/candidates/documents/upload
 * @desc    Upload a document (resume, cover letter, certificate)
 * @access  Private (Candidate)
 */
router.post('/documents/upload', protect, authorize(3), upload.single('file'), async (req, res) => {
    const userID = req.user.userid;
    const { documentType } = req.body;

    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }

    if (!documentType || !['Resume', 'CoverLetter', 'Certificate'].includes(documentType)) {
        return res.status(400).json({ error: 'Invalid document type. Must be Resume, CoverLetter, or Certificate.' });
    }

    try {
        // Get candidate ID
        const candidateResult = await query(
            "SELECT candidateid FROM candidates WHERE userid = ?",
            [userID]
        );

        if (candidateResult.length === 0) {
            return res.status(404).json({ error: 'Candidate profile not found.' });
        }

        const candidateID = candidateResult[0].candidateid;
        const fileBuffer = req.file.buffer;
        const fileName = req.file.originalname;

        let result = {
            success: true,
            documentType
        };

        // If Resume, store in candidates table and process
        if (documentType === 'Resume') {
            // Update or insert resume in candidates table
            const existingResume = await query(
                "SELECT resumefile FROM candidates WHERE candidateid = ?",
                [candidateID]
            );

            if (existingResume.length > 0 && existingResume[0].resumefile) {
                // Replace existing resume - update directly
                await query(
                    "UPDATE candidates SET resumefile = ?, resumefilename = ?, resumetext = NULL, extractedskills = NULL WHERE candidateid = ?",
                    [fileBuffer, fileName, candidateID]
                );
            } else {
                // Insert new resume
                await query(
                    "UPDATE candidates SET resumefile = ?, resumefilename = ? WHERE candidateid = ?",
                    [fileBuffer, fileName, candidateID]
                );
            }

            // Process resume with Node.js (pdf-parse)
            try {
                const processResult = await processCandidateResume(candidateID);

                if (processResult.success) {
                    result.resumeProcessed = true;
                    result.resumeTextLength = processResult.textLength;
                    result.extractedSkills = processResult.extractedSkills;
                } else {
                    console.log("Resume processing failed:", processResult.error);
                    result.resumeProcessed = false;
                }
            } catch (procErr) {
                console.log("Resume processing error:", procErr.message);
                result.resumeProcessed = false;
            }
        }

        // Insert metadata into candidatedocuments table
        try {
            // Check if document type already exists and delete
            const existingDoc = await query(
                "SELECT documentid FROM candidatedocuments WHERE candidateid = ? AND documenttype = ?",
                [candidateID, documentType]
            );

            if (existingDoc.length > 0) {
                // Delete existing document metadata
                await query(
                    "DELETE FROM candidatedocuments WHERE candidateid = ? AND documenttype = ?",
                    [candidateID, documentType]
                );
            }

            // Insert new document metadata
            await query(
                "INSERT INTO candidatedocuments (candidateid, documenttype, filepath, uploadedat) VALUES (?, ?, ?, NOW())",
                [candidateID, documentType, fileName]
            );
        } catch (docErr) {
            console.log("candidatedocuments table not available:", docErr.message);
        }

        result.message = `${documentType} uploaded successfully.`;
        res.status(201).json(result);

    } catch (err) {
        console.error("Document Upload Error:", err.message);
        res.status(500).json({ error: "Failed to upload document." });
    }
});

/**
 * @route   GET /api/candidates/documents
 * @desc    Get all documents for the logged-in candidate
 * @access  Private (Candidate)
 */
router.get('/documents', protect, authorize(3), async (req, res) => {
    const userID = req.user.userid;

    try {
        // Get candidate ID
        const candidateResult = await query(
            "SELECT candidateid FROM candidates WHERE userid = ?",
            [userID]
        );

        if (candidateResult.length === 0) {
            return res.status(404).json({ error: 'Candidate profile not found.' });
        }

        const candidateID = candidateResult[0].candidateid;

        // Get documents from candidatedocuments table
        let documents = [];
        try {
            documents = await query(
                "SELECT documentid, documenttype, filepath, uploadedat FROM candidatedocuments WHERE candidateid = ? ORDER BY uploadedat DESC",
                [candidateID]
            );
        } catch (docErr) {
            console.log("candidatedocuments table not available:", docErr.message);
        }

        // Also check if resume exists in candidates table
        const resumeInfo = await query(
            "SELECT resumefilename, resumetext, extractedskills FROM candidates WHERE candidateid = ?",
            [candidateID]
        );

        if (resumeInfo[0]?.resumefilename) {
            // Check if Resume already in documents list
            const hasResume = documents.some(d => d.documenttype === 'Resume');
            if (!hasResume) {
                documents.unshift({
                    DocumentType: 'Resume',
                    FilePath: resumeInfo[0].resumefilename,
                    UploadedAt: null,
                    isFromCandidates: true
                });
            }
        }

        res.json(documents);
    } catch (err) {
        console.error("Get Documents Error:", err.message);
        res.status(500).json({ error: "Failed to fetch documents." });
    }
});

/**
 * @route   GET /api/candidates/documents/resume/download
 * @desc    Download the candidate's resume
 * @access  Private (Candidate)
 */
router.get('/documents/resume/download', protect, authorize(3), async (req, res) => {
    const userID = req.user.userid;

    try {
        const candidateResult = await query(
            "SELECT candidateid, resumefile, resumefilename FROM candidates WHERE userid = ?",
            [userID]
        );

        if (candidateResult.length === 0) {
            return res.status(404).json({ error: 'Candidate profile not found.' });
        }

        const { resumefile, resumefilename } = candidateResult[0];

        if (!resumefile) {
            return res.status(404).json({ error: 'No resume found.' });
        }

        // Determine content type from filename
        let contentType = 'application/octet-stream';
        if (resumefilename?.endsWith('.pdf')) contentType = 'application/pdf';
        else if (resumefilename?.endsWith('.docx')) contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${resumefilename}"`);
        res.send(resumefile);
    } catch (err) {
        console.error("Download Resume Error:", err.message);
        res.status(500).json({ error: "Failed to download resume." });
    }
});

/**
 * @route   DELETE /api/candidates/documents/:documentType
 * @desc    Delete a document
 * @access  Private (Candidate)
 */
router.delete('/documents/:documentType', protect, authorize(3), async (req, res) => {
    const userID = req.user.userid;
    const { documentType } = req.params;

    if (!['Resume', 'CoverLetter', 'Certificate'].includes(documentType)) {
        return res.status(400).json({ error: 'Invalid document type.' });
    }

    try {
        const candidateResult = await query(
            "SELECT candidateid FROM candidates WHERE userid = ?",
            [userID]
        );

        if (candidateResult.length === 0) {
            return res.status(404).json({ error: 'Candidate profile not found.' });
        }

        const candidateID = candidateResult[0].candidateid;

        // If Resume, clear from candidates table
        if (documentType === 'Resume') {
            await query(
                "UPDATE candidates SET resumefile = NULL, resumefilename = NULL, resumetext = NULL, extractedskills = NULL WHERE candidateid = ?",
                [candidateID]
            );
        }

        // Delete from candidatedocuments table
        try {
            await query(
                "DELETE FROM candidatedocuments WHERE candidateid = ? AND documenttype = ?",
                [candidateID, documentType]
            );
        } catch (docErr) {
            console.log("candidatedocuments table not available:", docErr.message);
        }

        res.json({ success: true, message: `${documentType} deleted successfully.` });
    } catch (err) {
        console.error("Delete Document Error:", err.message);
        res.status(500).json({ error: "Failed to delete document." });
    }
});

// ============================================================================
// RECRUITER: VIEW CANDIDATE DOCUMENTS
// ============================================================================

/**
 * @route   GET /api/candidates/:candidateId/documents
 * @desc    Get documents for a specific candidate (Recruiter/Admin only)
 * @access  Private (Recruiter/Admin)
 */
router.get('/:candidateId/documents', protect, authorize([1, 2]), async (req, res) => {
    const { candidateId } = req.params;
    const userID = req.user.userid;

    try {
        // Verify recruiter exists
        const recruiterCheck = await query(
            "SELECT recruiterid FROM recruiters WHERE userid = ?",
            [userID]
        );

        // Get candidate's documents
        let documents = [];
        try {
            documents = await query(
                "SELECT documentid, documenttype, filepath, uploadedat FROM candidatedocuments WHERE candidateid = ? ORDER BY uploadedat DESC",
                [candidateId]
            );
        } catch (docErr) {
            console.log("candidatedocuments table not available:", docErr.message);
        }

        // Check if resume exists
        const resumeInfo = await query(
            "SELECT resumefilename FROM candidates WHERE candidateid = ?",
            [candidateId]
        );

        if (resumeInfo[0]?.resumefilename) {
            const hasResume = documents.some(d => d.documenttype === 'Resume');
            if (!hasResume) {
                documents.unshift({
                    DocumentType: 'Resume',
                    FilePath: resumeInfo[0].resumefilename,
                    UploadedAt: null
                });
            }
        }

        res.json(documents);
    } catch (err) {
        console.error("Get Candidate Documents Error:", err.message);
        res.status(500).json({ error: "Failed to fetch candidate documents." });
    }
});

/**
 * @route   GET /api/candidates/:candidateId/documents/resume/download
 * @desc    Download a candidate's resume (Recruiter/Admin only)
 * @access  Private (Recruiter/Admin)
 */
router.get('/:candidateId/documents/resume/download', protect, authorize([1, 2]), async (req, res) => {
    const { candidateId } = req.params;

    try {
        const resumeData = await query(
            "SELECT resumefile, resumefilename FROM candidates WHERE candidateid = ?",
            [candidateId]
        );

        if (resumeData.length === 0 || !resumeData[0].resumefile) {
            return res.status(404).json({ error: 'Resume not found.' });
        }

        const { resumefile, resumefilename } = resumeData[0];

        // Determine content type
        let contentType = 'application/octet-stream';
        if (resumefilename?.endsWith('.pdf')) contentType = 'application/pdf';
        else if (resumefilename?.endsWith('.docx')) contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${resumefilename}"`);
        res.send(resumefile);
    } catch (err) {
        console.error("Download Candidate Resume Error:", err.message);
        res.status(500).json({ error: "Failed to download resume." });
    }
});

/**
 * @route   GET /api/candidates/:candidateId/documents/resume/sentiment
 * @desc    Calculate sentiment score from candidate's resume text (Recruiter/Admin only)
 * @access  Private (Recruiter/Admin)
 */
router.get('/:candidateId/documents/resume/sentiment', protect, authorize([1, 2]), async (req, res) => {
    const { candidateId } = req.params;

    try {
        // Get resume text from candidates table
        const candidate = await query(
            "SELECT resumetext FROM candidates WHERE candidateid = ?",
            [candidateId]
        );

        if (!candidate[0]?.resumetext) {
            return res.status(404).json({ error: 'No resume text found for this candidate.' });
        }

        const resumeText = candidate[0].resumetext;

        // Use PostgreSQL function calculatesentiment
        const sentimentResult = await query(
            "SELECT calculatesentiment($1) AS sentimentscore",
            [resumeText]
        );

        const sentimentScore = sentimentResult[0]?.sentimentscore || 0;

        // Determine sentiment label
        let sentimentLabel = 'Neutral';
        if (sentimentScore > 0.1) sentimentLabel = 'Positive';
        else if (sentimentScore < -0.1) sentimentLabel = 'Negative';

        res.json({
            candidateId: parseInt(candidateId),
            resumeTextLength: resumeText.length,
            sentimentScore: parseFloat(sentimentScore.toFixed(2)),
            sentimentLabel: sentimentLabel,
            analysis: sentimentScore > 0.1
                ? 'Resume shows positive language and enthusiasm.'
                : sentimentScore < -0.1
                    ? 'Resume may contain negative language. Consider reviewing.'
                    : 'Resume language appears neutral and professional.'
        });
    } catch (err) {
        console.error("Resume Sentiment Error:", err.message);
        res.status(500).json({ error: "Failed to analyze resume sentiment." });
    }
});

module.exports = router;
