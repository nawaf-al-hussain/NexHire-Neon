/**
 * Job Postings Routes
 * Manages CRUD operations for job postings, skill matching,
 * and vacancy utilization analytics.
 * All routes require authentication (protect) and recruiter/admin access (authorize).
 */
const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { protect, authorize } = require('../middleware/rbac');

/**
 * @route   GET /api/jobs
 * @desc    Get all job postings (active and inactive) for recruiters
 * @access  Private (Recruiter)
 */
router.get('/', protect, authorize(2), async (req, res) => {
    try {
        // Get ALL jobs including inactive ones for archive functionality
        // Using vw_VacancyUtilization to include ApplicationCount and FilledPositions
        const { isActive } = req.query;

        let queryStr = "SELECT * FROM vw_vacancyutilization WHERE 1=1";
        const params = [];

        // Filter by isActive if provided (for archive toggle)
        if (isActive !== undefined) {
            queryStr += " AND isactive = ?";
            params.push(isActive === 'true' ? true : false);
        }

        queryStr += " ORDER BY jobid DESC";

        const jobs = await query(queryStr, params);
        res.json(jobs);
    } catch (err) {
        console.error("Fetch Jobs Error:", err.message);
        res.status(500).json({ error: "Failed to fetch job postings." });
    }
});

/**
 * @route   POST /api/jobs
 * @desc    Create a new job posting with skills
 * @access  Private (Recruiter)
 */
router.post('/', protect, authorize(2), async (req, res) => {
    const { title, description, location, minExperience, vacancies, skills, minSalary, maxSalary, salaryTransparent } = req.body;
    const recruiterUserID = req.user.userid;

    if (!title || !vacancies) {
        return res.status(400).json({ error: "Title and vacancies are required." });
    }

    try {
        // Use RETURNING JobID for PostgreSQL
        const result = await query(
            "INSERT INTO jobpostings (jobtitle, description, location, minexperience, vacancies, createdby) " +
            "VALUES (?, ?, ?, ?, ?, ?) " +
            "RETURNING jobid as id",
            [title, description, location, minExperience || 0, vacancies, recruiterUserID]
        );

        if (!result || result.length === 0) {
            throw new Error("Failed to retrieve new Job ID after insertion.");
        }

        const jobID = result[0].id;

        // Insert Skills if provided
        if (skills && Array.isArray(skills)) {
            for (const skill of skills) {
                // skill: { id: 1, isMandatory: 1, minProficiency: 5 }
                await query(
                    "INSERT INTO jobskills (jobid, skillid, ismandatory, minproficiency) VALUES (?, ?, ?, ?)",
                    [jobID, skill.id, !!skill.isMandatory, skill.minProficiency || 1]
                );
            }
        }

        // Insert Salary Range if provided
        if (minSalary || maxSalary) {
            await query(
                "INSERT INTO jobsalaryranges (jobid, minsalary, maxsalary, istransparent) VALUES (?, ?, ?, ?)",
                [jobID, minSalary || null, maxSalary || null, !!salaryTransparent]
            );
        }

        res.status(201).json({ message: "Job posting created successfully.", jobID });
    } catch (err) {
        console.error("Create Job Error:", err.message);
        console.error("Stack Trace:", err.stack);
        res.status(500).json({ error: `Database Error: ${err.message}` });
    }
});

/**
 * @route   GET /api/jobs/:id
 * @desc    Get job details and required skills
 * @access  Private
 */
router.get('/:id', protect, async (req, res) => {
    try {
        const job = await query("SELECT * FROM jobpostings WHERE jobid = ?", [req.params.id]);

        if (job.length === 0) {
            return res.status(404).json({ error: "Job not found." });
        }

        const skills = await query(
            "SELECT js.*, s.skillname FROM jobskills js JOIN skills s ON js.skillid = s.skillid WHERE js.jobid = ?",
            [req.params.id]
        );

        // Get salary ranges
        const salaryRanges = await query(
            "SELECT * FROM jobsalaryranges WHERE jobid = ?",
            [req.params.id]
        );

        const jobData = { ...job[0], skills };

        if (salaryRanges.length > 0) {
            jobData.minSalary = salaryRanges[0].minsalary;
            jobData.maxSalary = salaryRanges[0].maxsalary;
            jobData.salaryTransparent = salaryRanges[0].istransparent;
        }

        res.json(jobData);
    } catch (err) {
        console.error("Get Job Detail Error:", err.message);
        res.status(500).json({ error: "Server error fetching job details." });
    }
});

/**
 * @route   PUT /api/jobs/:id
 * @desc    Update a job posting
 * @access  Private (Recruiter)
 */
router.put('/:id', protect, authorize(2), async (req, res) => {
    const { title, description, location, minExperience, vacancies, isActive, skills, minSalary, maxSalary, salaryTransparent } = req.body;
    const jobId = req.params.id;

    // Allow partial updates (e.g., just updating IsActive for archiving)
    if (!title && !vacancies && isActive === undefined) {
        return res.status(400).json({ error: "At least one field to update is required." });
    }

    try {
        // Build dynamic query for partial updates
        const updates = [];
        const params = [];

        if (title !== undefined) {
            updates.push("jobtitle = ?");
            params.push(title);
        }
        if (description !== undefined) {
            updates.push("description = ?");
            params.push(description);
        }
        if (location !== undefined) {
            updates.push("location = ?");
            params.push(location);
        }
        if (minExperience !== undefined) {
            updates.push("minexperience = ?");
            params.push(minExperience);
        }
        if (vacancies !== undefined) {
            updates.push("vacancies = ?");
            params.push(vacancies);
        }
        if (isActive !== undefined) {
            updates.push("isactive = ?");
            params.push(!!isActive);
        }

        if (updates.length > 0) {
            params.push(jobId);
            await query(
                `UPDATE jobpostings SET ${updates.join(', ')} WHERE jobid = ?`,
                params
            );
        }

        // Update skills - delete existing and insert new ones
        if (skills && Array.isArray(skills)) {
            // Delete existing skills
            await query("DELETE FROM jobskills WHERE jobid = ?", [jobId]);

            // Insert new skills
            for (const skill of skills) {
                await query(
                    "INSERT INTO jobskills (jobid, skillid, ismandatory, minproficiency) VALUES (?, ?, ?, ?)",
                    [jobId, skill.id, !!skill.isMandatory, skill.minProficiency || 1]
                );
            }
        }

        // Update salary ranges
        if (minSalary !== undefined || maxSalary !== undefined || salaryTransparent !== undefined) {
            // Check if salary range exists
            const existingRange = await query("SELECT rangeid FROM jobsalaryranges WHERE jobid = ?", [jobId]);

            if (existingRange.length > 0) {
                // Update existing
                await query(
                    "UPDATE jobsalaryranges SET minsalary = ?, maxsalary = ?, istransparent = ? WHERE jobid = ?",
                    [minSalary || null, maxSalary || null, !!salaryTransparent, jobId]
                );
            } else if (minSalary || maxSalary) {
                // Insert new
                await query(
                    "INSERT INTO jobsalaryranges (jobid, minsalary, maxsalary, istransparent) VALUES (?, ?, ?, ?)",
                    [jobId, minSalary || null, maxSalary || null, !!salaryTransparent]
                );
            }
        }

        res.json({ message: "Job posting updated successfully.", jobID: jobId });
    } catch (err) {
        console.error("Update Job Error:", err.message);
        res.status(500).json({ error: `Database Error: ${err.message}` });
    }
});

/**
 * @route   DELETE /api/jobs/:id
 * @desc    Soft delete a job posting
 * @access  Private (Recruiter)
 */
router.delete('/:id', protect, authorize(2), async (req, res) => {
    try {
        await query("UPDATE jobpostings SET isdeleted = true, isactive = false WHERE jobid = ?", [req.params.id]);
        res.json({ message: "Job posting deleted (archived)." });
    } catch (err) {
        console.error("Delete Job Error:", err.message);
        res.status(500).json({ error: "Failed to delete job posting." });
    }
});

/**
 * @route   GET /api/jobs/:id/matches
 * @desc    Get ranked candidate matches for a job using the advanced matching engine
 * @access  Private (Recruiter)
 */
router.get('/:id/matches', protect, authorize(2), async (req, res) => {
    try {
        const topN = req.query.topN || 10;

        // Execute the advanced matching stored procedure
        const matches = await query('SELECT * FROM sp_advancedcandidatematchingenhanced($1, $2)', [req.params.id, topN]);

        // Transform matches to PascalCase for frontend
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

        res.json(formattedMatches);
    } catch (err) {
        console.error("Matching Engine Error:", err);
        res.status(500).json({ error: "Matching engine execution failed", details: err.message });
    }
});

/**
 * @route   GET /api/jobs/:id/applications
 * @desc    Get all applications for a specific job posting
 * @access  Private (Recruiter)
 */
router.get('/:id/applications', protect, authorize(2), async (req, res) => {
    try {
        const applications = await query(
            `SELECT a.*, c.fullname, c.location as candidatelocation, 
            s.statusname, 
            CAST(
                ROUND(
                    (COALESCE(
                        (SELECT SUM(cs2.proficiencylevel) 
                         FROM candidateskills cs2 
                         JOIN jobskills js2 ON cs2.skillid = js2.skillid 
                         WHERE cs2.candidateid = c.candidateid AND js2.jobid = a.jobid
                        ), 0
                    ) + (c.yearsofexperience * 2) + 
                    CASE WHEN c.location = j.location THEN 10 ELSE 0 END
                ) * 100.0 / NULLIF(
                    (SELECT SUM(minproficiency) FROM jobskills WHERE jobid = a.jobid) + 20, 
                    0
                ),
                0
                ) AS INT
            ) AS matchscore
            FROM applications a
            JOIN candidates c ON a.candidateid = c.candidateid
            JOIN applicationstatus s ON a.statusid = s.statusid
            JOIN jobpostings j ON a.jobid = j.jobid
            WHERE a.jobid = ? AND a.isdeleted = false
            ORDER BY a.applieddate DESC`,
            [req.params.id]
        );
        res.json(applications);
    } catch (err) {
        console.error("Fetch Job Applications Error:", err.message);
        res.status(500).json({ error: "Failed to fetch job applications." });
    }
});

module.exports = router;
