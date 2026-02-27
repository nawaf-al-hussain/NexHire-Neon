const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { protect, authorize } = require('../middleware/rbac');

/**
 * @route   POST /api/maintenance/archive
 * @desc    Run the data archiving stored procedure
 * @access  Private (Admin Only)
 */
router.post('/archive', protect, authorize([1]), async (req, res) => {
    try {
        // PostgreSQL function call
        await query("CALL sp_archiveolddata()");
        res.json({ message: "Archival process completed successfully." });
    } catch (err) {
        console.error("Archiving Error:", err.message);
        res.status(500).json({ error: "Failed to run archival process: " + err.message });
    }
});

/**
 * @route   POST /api/maintenance/anonymize
 * @desc    Run the PII anonymization stored procedure
 * @access  Private (Admin Only)
 */
router.post('/anonymize', protect, authorize([1]), async (req, res) => {
    try {
        await query("CALL sp_anonymizearchivedcandidates()");
        res.json({ message: "PII anonymization completed successfully." });
    } catch (err) {
        console.error("Anonymization Error:", err.message);
        res.status(500).json({ error: "Failed to run anonymization process." });
    }
});

/**
 * @route   POST /api/maintenance/consent-check
 * @desc    Run the GDPR consent expiry stored procedure
 * @access  Private (Admin Only)
 */
router.post('/consent-check', protect, authorize([1]), async (req, res) => {
    try {
        await query("CALL sp_checkconsentexpiry()");
        res.json({ message: "Consent expiry check completed successfully." });
    } catch (err) {
        console.error("Consent Check Error:", err.message);
        res.status(500).json({ error: "Failed to run consent check." });
    }
});

/**
 * @route   GET /api/maintenance/archive-stats
 * @desc    Get counts from archive tables
 * @access  Private (Admin Only)
 */
router.get('/archive-stats', protect, authorize([1]), async (req, res) => {
    try {
        // Check if tables exist first
        const tablesExist = await query(`
            SELECT table_name FROM information_schema.tables 
            WHERE table_name IN ('jobpostingsarchive', 'applicationsarchive')
        `);

        const tableNames = tablesExist.map(t => t.table_name);
        const hasJobsArchive = tableNames.includes('jobpostingsarchive');
        const hasAppsArchive = tableNames.includes('applicationsarchive');

        let archivedJobs = 0;
        let archivedApplications = 0;

        if (hasJobsArchive) {
            const jobsResult = await query("SELECT COUNT(*) as total FROM jobpostingsarchive");
            archivedJobs = jobsResult[0].total;
        }

        if (hasAppsArchive) {
            const appsResult = await query("SELECT COUNT(*) as total FROM applicationsarchive");
            archivedApplications = appsResult[0].total;
        }

        res.json({
            archivedJobs,
            archivedApplications,
            hasJobsArchive,
            hasAppsArchive,
            lastUpdated: new Date()
        });
    } catch (err) {
        console.error("Archive Stats Error:", err.message);
        res.status(500).json({ error: "Failed to fetch archive statistics: " + err.message });
    }
});

/**
 * @route   GET /api/maintenance/archive-jobs
 * @desc    Get data from JobPostingsArchive
 * @access  Private (Admin Only)
 */
router.get('/archive-jobs', protect, authorize([1]), async (req, res) => {
    try {
        // Check if table exists
        const tableCheck = await query(`
            SELECT 1 FROM information_schema.tables WHERE table_name = 'jobpostingsarchive'
        `);

        if (tableCheck.length === 0) {
            return res.json([]); // Return empty array if table doesn't exist
        }

        const archivedJobs = await query("SELECT * FROM jobpostingsarchive ORDER BY archivedat DESC LIMIT 50");
        res.json(archivedJobs);
    } catch (err) {
        console.error("Archive Jobs Fetch Error:", err.message);
        res.status(500).json({ error: "Failed to fetch archived jobs: " + err.message });
    }
});

/**
 * @route   GET /api/maintenance/archive-applications
 * @desc    Get data from ApplicationsArchive with candidate and job details
 * @access  Private (Admin Only)
 * 
 * NOTE: The ApplicationsArchive table stores: ApplicationID, CandidateID, JobID, StatusID, AppliedDate, ArchivedAt
 * Candidate info (FullName, Email, LinkedInURL) comes from LEFT JOIN to Candidates table.
 * If sp_AnonymizeArchivedCandidates was run, candidate data will be NULL.
 */
router.get('/archive-applications', protect, authorize([1]), async (req, res) => {
    try {
        // Simple query without joins first - just check if table exists and has data
        let archivedApps;

        try {
            archivedApps = await query(`
                SELECT 
                    aa.applicationid,
                    aa.candidateid,
                    aa.jobid,
                    aa.statusid,
                    aa.applieddate,
                    aa.archivedat
                FROM applicationsarchive aa
                ORDER BY aa.archivedat DESC
                LIMIT 50
            `);
        } catch (tableErr) {
            // Table doesn't exist or other error
            console.log("Archive table query error:", tableErr.message);
            return res.json([]);
        }

        if (archivedApps.length === 0) {
            return res.json([]);
        }

        // Now try to enrich with job and status info
        try {
            const jobIds = archivedApps.map(a => a.jobid).filter(id => id);
            const statusIds = archivedApps.map(a => a.statusid).filter(id => id);
            const candidateIds = archivedApps.map(a => a.candidateid).filter(id => id);

            let jobMap = {};
            let statusMap = {};
            let candidateMap = {};

            if (jobIds.length > 0) {
                const jobs = await query(`
                    SELECT jobid, jobtitle FROM jobpostings 
                    WHERE jobid IN (${jobIds.join(',')})
                `);
                jobs.forEach(j => { jobMap[j.jobid] = j.jobtitle; });
            }

            if (statusIds.length > 0) {
                const statuses = await query(`
                    SELECT statusid, statusname FROM applicationstatus 
                    WHERE statusid IN (${statusIds.join(',')})
                `);
                statuses.forEach(s => { statusMap[s.statusid] = s.statusname; });
            }

            if (candidateIds.length > 0) {
                const candidates = await query(`
                    SELECT c.candidateid, c.fullname, c.linkedinurl, u.email 
                    FROM candidates c
                    INNER JOIN users u ON c.userid = u.userid
                    WHERE c.candidateid IN (${candidateIds.join(',')})
                `);
                candidates.forEach(c => {
                    candidateMap[c.candidateid] = {
                        fullname: c.fullname,
                        email: c.email,
                        linkedinurl: c.linkedinurl
                    };
                });
            }

            // Add job title, status name, and candidate info to results
            archivedApps = archivedApps.map(app => ({
                ...app,
                FullName: candidateMap[app.candidateid]?.fullname || null,
                Email: candidateMap[app.candidateid]?.email || null,
                LinkedInURL: candidateMap[app.candidateid]?.linkedinurl || null,
                JobTitle: jobMap[app.jobid] || null,
                StatusName: statusMap[app.statusid] || null
            }));
        } catch (enrichErr) {
            console.log("Enrichment error:", enrichErr.message);
            // Continue with basic data
        }

        res.json(archivedApps);
    } catch (err) {
        console.error("Archive Apps Fetch Error:", err.message);
        res.json([]); // Return empty instead of 500 to prevent UI errors
    }
});

/**
 * @route   GET /api/maintenance/email-queue
 * @desc    Get email queue with filters
 * @access  Private (Admin Only)
 * 
 * EmailQueue columns: EmailID, CandidateID, EmailType, Subject, Body, IsSent
 */
router.get('/email-queue', protect, authorize(1), async (req, res) => {
    const { status, type, limit } = req.query;

    try {
        let queryStr = `
            SELECT e.emailid, e.candidateid, c.fullname as candidatename, 
                   e.emailtype, e.subject, e.body, e.issent, e.createdat, e.sentat
            FROM emailqueue e
            LEFT JOIN candidates c ON e.candidateid = c.candidateid
            WHERE 1=1
        `;
        const params = [];

        if (status === 'sent') {
            queryStr += ` AND e.issent = TRUE`;
        } else if (status === 'pending') {
            queryStr += ` AND e.issent = FALSE`;
        }

        if (type) {
            queryStr += ` AND e.emailtype = ?`;
            params.push(type);
        }

        queryStr += ` ORDER BY e.createdat DESC`;

        if (limit) {
            queryStr += ` LIMIT ${parseInt(limit)}`;
        }

        const emails = await query(queryStr, params);

        // Get stats
        const stats = await query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN issent = TRUE THEN 1 ELSE 0 END) as sent,
                SUM(CASE WHEN issent = FALSE THEN 1 ELSE 0 END) as pending
            FROM emailqueue
        `);

        res.json({ emails, stats: stats[0] });
    } catch (err) {
        console.error("Email Queue Fetch Error:", err.message);
        res.status(500).json({ error: "Failed to fetch email queue." });
    }
});

/**
 * @route   PUT /api/maintenance/email-queue/:id/retry
 * @desc    Retry sending a failed email
 * @access  Private (Admin Only)
 */
router.put('/email-queue/:id/retry', protect, authorize(1), async (req, res) => {
    const { id } = req.params;

    try {
        // Reset IsSent to 0 to allow retry
        await query(`
            UPDATE emailqueue 
            SET issent = FALSE, createdat = NOW()
            WHERE emailid = ? AND issent = FALSE
        `, [id]);

        res.json({ message: "Email queued for retry." });
    } catch (err) {
        console.error("Email Retry Error:", err.message);
        res.status(500).json({ error: "Failed to retry email." });
    }
});

/**
 * @route   DELETE /api/maintenance/email-queue/:id
 * @desc    Delete an email from queue
 * @access  Private (Admin Only)
 */
router.delete('/email-queue/:id', protect, authorize(1), async (req, res) => {
    const { id } = req.params;

    try {
        await query(`DELETE FROM emailqueue WHERE emailid = ?`, [id]);
        res.json({ message: "Email deleted from queue." });
    } catch (err) {
        console.error("Email Delete Error:", err.message);
        res.status(500).json({ error: "Failed to delete email." });
    }
});

/**
 * @route   POST /api/maintenance/email-queue/send-test
 * @desc    Send a test email (for debugging)
 * @access  Private (Admin Only)
 */
router.post('/email-queue/send-test', protect, authorize(1), async (req, res) => {
    const { candidateId, emailType, subject, body } = req.body;

    try {
        // Insert into queue for processing
        await query(`
            INSERT INTO emailqueue (candidateid, emailtype, subject, body, issent)
            VALUES (?, ?, ?, ?, FALSE)
        `, [candidateId, emailType || 'Test', subject || 'Test Email', body || 'This is a test email.']);

        res.json({ message: "Test email added to queue." });
    } catch (err) {
        console.error("Test Email Error:", err.message);
        res.status(500).json({ error: "Failed to queue test email." });
    }
});

// Get all SQL Views list
router.get('/sql-views', async (req, res) => {
    try {
        const views = await query(`
            SELECT 
                table_name as viewname,
                'SELECT * FROM ' || table_name as query
            FROM information_schema.views 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        res.json(views);
    } catch (err) {
        console.error('SQL Views List Error:', err.message);
        res.status(500).json({ error: 'Failed to get SQL views: ' + err.message });
    }
});

// Execute a SQL View query and return results
router.get('/sql-views/:viewName', async (req, res) => {
    try {
        const { viewName } = req.params;

        // Validate view name to prevent SQL injection
        const validViewPattern = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
        if (!validViewPattern.test(viewName)) {
            return res.status(400).json({ error: 'Invalid view name' });
        }

        // Execute query - same pattern as analytics.js
        const result = await query(`SELECT * FROM ${viewName}`);
        res.json(result);
    } catch (err) {
        console.error('SQL View Query Error:', err.message);
        res.status(500).json({ error: 'Failed to execute view query: ' + err.message });
    }
});

// Get SQL View definition
router.get('/view-definition/:viewName', protect, authorize(1), async (req, res) => {
    try {
        const { viewName } = req.params;
        // Validate view name to prevent SQL injection
        const validViewPattern = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
        if (!validViewPattern.test(viewName)) {
            return res.status(400).json({ error: 'Invalid view name' });
        }

        const result = await query(`
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = ? AND table_schema = 'public'
            ORDER BY ordinal_position
        `, [viewName]);

        res.json(result);
    } catch (err) {
        console.error('View Definition Error:', err.message);
        res.status(500).json({ error: 'Failed to get view definition: ' + err.message });
    }
});

/**
 * @route   POST /api/maintenance/seed-diversity-metrics
 * @desc    Populate the diversitymetrics table with realistic demographic data
 *          for all existing applications. Idempotent — clears existing rows first.
 * @access  Private (Admin Only)
 */
router.post('/seed-diversity-metrics', protect, authorize(1), async (req, res) => {
    const crypto = require('crypto');
    try {
        // 1. Clear existing data
        await query('DELETE FROM diversitymetrics');

        // 2. Fetch all application IDs
        const apps = await query(`
            SELECT a.applicationid
            FROM applications a
            WHERE a.isdeleted = false
            ORDER BY a.applicationid
        `);

        if (apps.length === 0) {
            return res.json({ message: 'No applications found.', inserted: 0 });
        }

        // 3. Demographic distributions (realistic tech-industry weights)
        const GENDERS = [
            { v: 'Male', w: 55 }, { v: 'Female', w: 40 },
            { v: 'Non-Binary', w: 3 }, { v: 'Prefer not to say', w: 2 }
        ];
        const ETHNICITIES = [
            { v: 'Asian', w: 35 }, { v: 'White', w: 30 },
            { v: 'Hispanic or Latino', w: 15 }, { v: 'Black or African American', w: 12 },
            { v: 'Middle Eastern', w: 4 }, { v: 'Two or More Races', w: 3 },
            { v: 'Prefer not to say', w: 1 }
        ];
        const EDUCATION = [
            { v: 'High School', w: 10 }, { v: 'Associate Degree', w: 15 },
            { v: 'Bachelor Degree', w: 45 }, { v: 'Master Degree', w: 20 },
            { v: 'PhD', w: 5 }, { v: 'Bootcamp', w: 5 }
        ];

        const pick = (items) => {
            const total = items.reduce((s, i) => s + i.w, 0);
            let r = Math.random() * total;
            for (const item of items) { r -= item.w; if (r <= 0) return item.v; }
            return items[0].v;
        };
        const maybe = (p) => Math.random() < p;

        // 4. Generate and insert in batches
        let inserted = 0;
        const batchSize = 25;

        for (let i = 0; i < apps.length; i += batchSize) {
            const batch = apps.slice(i, i + batchSize);
            const values = [];
            const params = [];
            let pi = 1;

            for (const app of batch) {
                const gender = pick(GENDERS);
                const ethnicity = pick(ETHNICITIES);
                const educationLevel = pick(EDUCATION);
                const hash = crypto.createHash('sha256').update(`app-${app.applicationid}-${Date.now()}-${Math.random()}`).digest('hex');

                values.push(`($${pi}, $${pi+1}, $${pi+2}, $${pi+3}, $${pi+4}, $${pi+5}, $${pi+6}, $${pi+7}, $${pi+8}, $${pi+9}, $${pi+10})`);
                params.push(
                    app.applicationid, gender, ethnicity,
                    maybe(0.08),  // disability
                    maybe(0.05),  // veteran
                    maybe(0.30),  // first-gen college
                    maybe(0.12),  // LGBTQ+
                    maybe(0.25) ? Math.floor(Math.random() * 24) : 0,  // career gap
                    maybe(0.15),  // non-traditional
                    educationLevel,
                    hash
                );
                pi += 11;
            }

            await query(`
                INSERT INTO diversitymetrics
                    (applicationid, gender, ethnicity, disabilitystatus, veteranstatus,
                     firstgenerationcollege, lgbtqplus, careergapmonths, nontraditionalbackground,
                     educationlevel, anonymizedhash)
                VALUES ${values.join(', ')}
                ON CONFLICT DO NOTHING
            `, params);
            inserted += batch.length;
        }

        // 5. Return summary
        const stats = await query(`
            SELECT
                COUNT(*) AS total,
                COUNT(CASE WHEN gender = 'Male' THEN 1 END) AS male,
                COUNT(CASE WHEN gender = 'Female' THEN 1 END) AS female,
                COUNT(CASE WHEN disabilitystatus = true THEN 1 END) AS with_disability,
                COUNT(CASE WHEN veteranstatus = true THEN 1 END) AS veterans,
                COUNT(CASE WHEN lgbtqplus = true THEN 1 END) AS lgbtq
            FROM diversitymetrics
        `);

        res.json({
            message: 'Diversity metrics populated successfully.',
            inserted,
            stats: stats[0]
        });

    } catch (err) {
        console.error('Seed Diversity Metrics Error:', err.message);
        res.status(500).json({ error: 'Failed to seed diversity metrics: ' + err.message });
    }
});

module.exports = router;
