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
        // 1. Fetch all application IDs FIRST (before deleting, so if fetch
        //    fails we haven't lost data)
        const apps = await query(`
            SELECT a.applicationid
            FROM applications a
            WHERE a.isdeleted = false
            ORDER BY a.applicationid
        `);

        if (apps.length === 0) {
            return res.json({ message: 'No applications found.', inserted: 0 });
        }

        // 2. Clear existing data
        await query('DELETE FROM diversitymetrics');

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

/**
 * @route   POST /api/maintenance/seed-career-goals
 * @desc    Populate candidatecareergoals + careerpaths with realistic data
 * @access  Private (Admin Only)
 */
router.post('/seed-career-goals', protect, authorize(1), async (req, res) => {
    try {
        // 1. Clear existing
        await query('DELETE FROM candidatecareergoals');

        // 2. Fetch all candidates with their current job interests
        const candidates = await query(`
            SELECT c.candidateid, c.yearsofexperience,
                   STRING_AGG(DISTINCT s.skillname, ', ') as skills
            FROM candidates c
            LEFT JOIN candidateskills cs ON c.candidateid = cs.candidateid
            LEFT JOIN skills s ON cs.skillid = s.skillid
            GROUP BY c.candidateid, c.yearsofexperience
            ORDER BY c.candidateid
        `);

        if (candidates.length === 0) {
            return res.json({ message: 'No candidates found.', inserted: 0 });
        }

        // 3. Define career targets based on skills
        const careerTargets = [
            { skills: ['React', 'JavaScript', 'TypeScript'], target: 'Senior Frontend Engineer', readiness: 75, prob: 0.8 },
            { skills: ['Node.js', 'Python', 'Java'], target: 'Senior Backend Engineer', readiness: 70, prob: 0.75 },
            { skills: ['AWS', 'Docker', 'Kubernetes'], target: 'DevOps Architect', readiness: 65, prob: 0.7 },
            { skills: ['SQL', 'MongoDB', 'PostgreSQL'], target: 'Database Administrator', readiness: 80, prob: 0.85 },
            { skills: ['Python', 'Machine Learning', 'Data Analytics'], target: 'ML Engineer', readiness: 60, prob: 0.65 },
            { skills: ['Java', 'Spring', 'Microservices'], target: 'Software Architect', readiness: 55, prob: 0.6 },
            { skills: ['Project Management', 'Agile', 'Scrum'], target: 'Engineering Manager', readiness: 50, prob: 0.55 },
        ];

        const defaultTarget = { target: 'Senior Software Engineer', readiness: 65, prob: 0.7 };

        let inserted = 0;
        for (const c of candidates) {
            // Match career target based on skills
            const skills = (c.skills || '').toLowerCase();
            let matched = defaultTarget;
            for (const ct of careerTargets) {
                if (ct.skills.some(s => skills.includes(s.toLowerCase()))) {
                    matched = ct;
                    break;
                }
            }

            // Add some variation
            const readiness = Math.min(100, Math.max(20, matched.readiness + Math.floor(Math.random() * 20 - 10)));
            const probability = Math.min(0.95, Math.max(0.3, matched.prob + (Math.random() * 0.2 - 0.1)));

            await query(`
                INSERT INTO candidatecareergoals
                    (candidateid, targetrole, currentreadinessscore, progresspercentage,
                     targettimelinemonths, isactive, createdat)
                VALUES (?, ?, ?, ?, ?, true, NOW())
                ON CONFLICT DO NOTHING
            `, [
                c.candidateid,
                matched.target,
                readiness,
                probability.toFixed(2),
                Math.floor(Math.random() * 24 + 12) // 12-36 months
            ]);
            inserted++;
        }

        res.json({
            message: 'Career goals populated successfully.',
            inserted,
            stats: { totalCandidates: candidates.length }
        });
    } catch (err) {
        console.error('Seed Career Goals Error:', err.message);
        res.status(500).json({ error: 'Failed to seed career goals: ' + err.message });
    }
});

/**
 * @route   POST /api/maintenance/seed-candidate-names
 * @desc    Replace Candidate_* placeholder names with realistic real names
 * @access  Private (Admin Only)
 */
router.post('/seed-candidate-names', protect, authorize(1), async (req, res) => {
    try {
        // 1. Fetch all candidates with Candidate_* names
        const candidates = await query(`
            SELECT candidateid, fullname
            FROM candidates
            WHERE fullname LIKE 'Candidate_%'
            ORDER BY candidateid
        `);

        if (candidates.length === 0) {
            return res.json({ message: 'No Candidate_* names found.', updated: 0 });
        }

        // 2. Pool of realistic names (mix of South Asian + international, matching the project context)
        const firstNames = [
            'Aarav', 'Adnan', 'Aisha', 'Anika', 'Arif', 'Arnav', 'Ayesha', 'Farhan',
            'Fatima', 'Faisal', 'Hafsa', 'Hamza', 'Hassan', 'Hiba', 'Ibrahim', 'Inaya',
            'Irfan', 'Jannat', 'Kabir', 'Laila', 'Mahir', 'Mehreen', 'Nadia', 'Naufal',
            'Omar', 'Priya', 'Rabia', 'Rafi', 'Sadia', 'Sahil', 'Sana', 'Shadman',
            'Shahid', 'Sumaiya', 'Tahir', 'Tania', 'Usman', 'Wahid', 'Yasin', 'Zara',
            'Zayan', 'Zoha', 'Abrar', 'Afifa', 'Ahnaf', 'Anjum', 'Asif', 'Durjoy',
            'Emran', 'Farzana', 'Galib', 'Hasib', 'Iqbal', 'Junaid', 'Khadija', 'Marjan',
            'Mehedi', 'Nayeem', 'Nilima', 'Parvez', 'Rakib', 'Sabrina', 'Tahmid', 'Wasim'
        ];

        const lastNames = [
            'Rahman', 'Islam', 'Khan', 'Ahmed', 'Hossain', 'Akter', 'Chowdhury', 'Alam',
            'Siddiqui', 'Karim', 'Mahmud', 'Sharma', 'Das', 'Bose', 'Haider', 'Rashid',
            'Sarker', 'Talukder', 'Miah', 'Begum', 'Sheikh', 'Choudhury', 'Farooqi', 'Aziz',
            'Noor', 'Haque', 'Mallick', 'Banik', 'Roy', 'Dey', 'Saha', 'Quadir',
            'Tasnim', 'Laskar', 'Barua', 'Adnan', 'Rifa', 'Tahsin', 'Munshi', 'Chy'
        ];

        // 3. Generate unique name combinations
        const usedNames = new Set();
        // Get existing real names to avoid duplicates
        const existing = await query(`SELECT DISTINCT fullname FROM candidates WHERE fullname NOT LIKE 'Candidate_%'`);
        existing.forEach(r => usedNames.add(r.fullname.toLowerCase()));

        let updated = 0;
        for (const c of candidates) {
            let fullName;
            let attempts = 0;
            do {
                const first = firstNames[Math.floor(Math.random() * firstNames.length)];
                const last = lastNames[Math.floor(Math.random() * lastNames.length)];
                fullName = `${first} ${last}`;
                attempts++;
            } while (usedNames.has(fullName.toLowerCase()) && attempts < 50);

            usedNames.add(fullName.toLowerCase());

            await query(
                `UPDATE candidates SET fullname = ? WHERE candidateid = ?`,
                [fullName, c.candidateid]
            );
            updated++;
        }

        // 4. Return summary
        const sample = await query(`
            SELECT candidateid, fullname FROM candidates
            WHERE fullname NOT LIKE 'Candidate_%'
            ORDER BY candidateid
            LIMIT 10
        `);

        res.json({
            message: 'Candidate names updated successfully.',
            updated,
            sample: sample.map(r => r.fullname)
        });

    } catch (err) {
        console.error('Seed Candidate Names Error:', err.message);
        res.status(500).json({ error: 'Failed to update candidate names: ' + err.message });
    }
});

/**
 * @route   POST /api/maintenance/seed-gamification
 * @desc    Populate candidategamification with realistic points, levels, badges, ranks
 * @access  Private (Admin Only)
 */
router.post('/seed-gamification', protect, authorize(1), async (req, res) => {
    try {
        // 1. Fetch all candidates
        const candidates = await query(`
            SELECT c.candidateid
            FROM candidates c
            ORDER BY c.candidateid
        `);

        if (candidates.length === 0) {
            return res.json({ message: 'No candidates found.', updated: 0 });
        }

        // 2. Badge pool
        const badgePool = [
            'ProfileComplete', 'FirstApplication', 'InterviewMaster',
            'SkillVerified', 'QuickResponder', 'Streak7', 'Streak30',
            'TopPerformer', 'CareerExplorer', 'AssessmentPro',
            'EarlyBird', 'Consistent', 'ResumeStar', 'MatchChampion'
        ];

        // 3. Generate gamification data for each candidate
        let updated = 0;
        const gamificationData = [];

        for (const c of candidates) {
            // Random points between 50 and 2500
            const points = Math.floor(Math.random() * 2450) + 50;
            // Level 1-5 based on points
            const level = points >= 2000 ? 5 : points >= 1000 ? 4 : points >= 500 ? 3 : points >= 200 ? 2 : 1;
            // 2-5 random badges
            const badgeCount = Math.floor(Math.random() * 4) + (level >= 3 ? 2 : 1);
            const shuffled = [...badgePool].sort(() => Math.random() - 0.5);
            const badges = JSON.stringify(shuffled.slice(0, Math.min(badgeCount, badgePool.length)));
            // Streak 1-30 days
            const streakDays = Math.floor(Math.random() * 30) + 1;
            // Engagement score 30-95
            const engagementScore = Math.floor(Math.random() * 65) + 30;

            gamificationData.push({
                candidateid: c.candidateid,
                points,
                level,
                badges,
                streakDays,
                engagementScore
            });
        }

        // 4. Sort by points to compute leaderboard ranks
        gamificationData.sort((a, b) => b.points - a.points);
        gamificationData.forEach((g, i) => {
            g.leaderboardRank = i + 1;
        });

        // 5. Upsert into candidategamification
        for (const g of gamificationData) {
            await query(`
                INSERT INTO candidategamification
                    (candidateid, points, level, badges, streakdays,
                     leaderboardrank, engagementscore, lastactivitydate)
                VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
                ON CONFLICT (candidateid) DO UPDATE SET
                    points = EXCLUDED.points,
                    level = EXCLUDED.level,
                    badges = EXCLUDED.badges,
                    streakdays = EXCLUDED.streakdays,
                    leaderboardrank = EXCLUDED.leaderboardrank,
                    engagementscore = EXCLUDED.engagementscore,
                    lastactivitydate = NOW()
            `, [
                g.candidateid, g.points, g.level, g.badges,
                g.streakDays, g.leaderboardRank, g.engagementScore
            ]);
            updated++;
        }

        // 6. Return summary
        const stats = await query(`
            SELECT
                COUNT(*) AS total,
                AVG(points) AS avgpoints,
                MAX(points) AS maxpoints,
                COUNT(CASE WHEN level >= 4 THEN 1 END) AS highlevel,
                AVG(engagementscore) AS avgengagement
            FROM candidategamification
        `);

        res.json({
            message: 'Gamification data populated successfully.',
            updated,
            stats: stats[0]
        });

    } catch (err) {
        console.error('Seed Gamification Error:', err.message);
        res.status(500).json({ error: 'Failed to seed gamification data: ' + err.message });
    }
});

/**
 * @route   POST /api/maintenance/seed-predictions
 * @desc    Auto-generate hire-success and onboarding predictions for all
 *          eligible candidates. Replaces the previous auto-gen logic that
 *          was inside GET handlers (violated REST semantics + race conditions).
 * @access  Private (Admin Only)
 */
router.post('/seed-predictions', protect, authorize(1), async (req, res) => {
    try {
        let hireGenerated = 0;
        let onboardingGenerated = 0;

        // 1. Generate hire-success predictions for applications at Interview stage or later
        const apps = await query(`
            SELECT applicationid FROM applications
            WHERE statusid >= 3 AND isdeleted = false
            ORDER BY applicationid LIMIT 30
        `);

        for (const app of apps) {
            try {
                await query(`SELECT * FROM sp_predicthiresuccess($1)`, [app.applicationid]);
                hireGenerated++;
            } catch (e) {
                // Skip individual failures
            }
        }

        // 2. Generate onboarding predictions for all hired candidates
        const hiredCandidates = await query(`
            SELECT a.candidateid, a.jobid
            FROM applications a
            WHERE a.statusid = 4 AND a.isdeleted = false
            ORDER BY a.applicationid
        `);

        for (const hc of hiredCandidates) {
            try {
                const predResult = await query(
                    `SELECT * FROM sp_predictonboardingsuccess($1, $2)`,
                    [hc.candidateid, hc.jobid]
                );
                if (predResult && predResult.length > 0) {
                    const p = predResult[0];
                    await query(`
                        INSERT INTO onboardingpredictions
                            (candidateid, jobid, successprobability,
                             riskfactors, recommendations, predictedretentionmonths,
                             predictiondate)
                        VALUES ($1, $2, $3, $4, $5, $6, NOW())
                        ON CONFLICT DO NOTHING
                    `, [
                        hc.candidateid, hc.jobid,
                        p.successprobability, p.riskfactors,
                        p.recommendations, p.predictedretentionmonths
                    ]);
                    onboardingGenerated++;
                }
            } catch (e) {
                // Skip individual failures
            }
        }

        res.json({
            message: 'Predictions generated successfully.',
            hireSuccessPredictions: hireGenerated,
            onboardingPredictions: onboardingGenerated
        });

    } catch (err) {
        console.error('Seed Predictions Error:', err.message);
        res.status(500).json({ error: 'Failed to seed predictions: ' + err.message });
    }
});

module.exports = router;
