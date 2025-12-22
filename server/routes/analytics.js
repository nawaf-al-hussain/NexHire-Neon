const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { protect, authorize } = require('../middleware/rbac');

/**
 * @route   GET /api/analytics/stats
 * @desc    Global recruitment statistics for Hero Cards
 * @access  Private (Recruiter/Admin)
 */
router.get('/stats', protect, authorize([1, 2]), async (req, res) => {
    try {
        const results = await Promise.allSettled([
            query("SELECT COUNT(*) as total FROM candidates"),
            query("SELECT COUNT(*) as total FROM vw_candidatematchscore WHERE totalmatchscore > 80"),
            query("SELECT COUNT(*) as total FROM jobpostings WHERE isactive = true AND isdeleted = false")
        ]);

        const stats = {
            totalPool: results[0].status === 'fulfilled' ? results[0].value[0].total : 0,
            topMatches: results[1].status === 'fulfilled' ? results[1].value[0].total : 0,
            openRoles: results[2].status === 'fulfilled' ? results[2].value[0].total : 0
        };

        res.json(stats);
    } catch (err) {
        console.error("Stats Analytics Error:", err.message);
        res.status(500).json({ error: "Failed to fetch dashboard statistics." });
    }
});

/**
 * @route   GET /api/analytics/funnel
 * @desc    Get application funnel conversion data
 * @access  Public (for demo)
 */
router.get('/funnel', protect, authorize([1, 2]), async (req, res) => {
    try {
        const funnel = await query("SELECT * FROM vw_applicationfunnel");
        res.json(funnel);
    } catch (err) {
        console.error("Funnel Analytics Error:", err.message);
        res.status(500).json({ error: "Failed to fetch funnel data." });
    }
});

/**
 * @route   GET /api/analytics/utilization
 * @desc    Get vacancy utilization metrics
 * @access  Public (for demo)
 */
router.get('/utilization', protect, authorize([1, 2]), async (req, res) => {
    try {
        const utilization = await query("SELECT * FROM vw_vacancyutilization");
        res.json(utilization);
    } catch (err) {
        console.error("Utilization Analytics Error:", err.message);
        res.status(500).json({ error: "Failed to fetch vacancy utilization." });
    }
});

/**
 * @route   GET /api/analytics/per-job
 * @desc    Get hire rates per job
 * @access  Private (Recruiter/Admin)
 */
router.get('/per-job', protect, authorize([1, 2]), async (req, res) => {
    try {
        const data = await query("SELECT * FROM vw_hirerateperjob");
        res.json(data);
    } catch (err) {
        console.error("Per-Job Analytics Error:", err.message);
        res.status(500).json({ error: "Failed to fetch job hire rates." });
    }
});

/**
 * @route   GET /api/analytics/bottlenecks
 * @desc    Get hiring bottleneck metrics
 * @access  Public (for demo)
 */
router.get('/bottlenecks', protect, authorize([1, 2]), async (req, res) => {
    try {
        const data = await query("SELECT * FROM vw_hiringbottlenecks");
        res.json(data);
    } catch (err) {
        console.error("Bottleneck Analytics Error:", err.message);
        res.status(500).json({ error: "Failed to fetch hiring bottlenecks." });
    }
});

/**
 * @route   GET /api/analytics/diversity
 * @desc    Get diversity analytics funnel (by Ethnicity)
 * @access  Public (for Admin Dashboard)
 */
router.get('/diversity', protect, authorize([1, 2]), async (req, res) => {
    try {
        const data = await query("SELECT * FROM vw_diversityanalyticsfunnel");
        res.json(data);
    } catch (err) {
        console.error("Diversity Analytics Error:", err.message);
        res.status(500).json({ error: "Failed to fetch diversity data." });
    }
});

/**
 * @route   GET /api/analytics/diversity-gender
 * @desc    Get diversity by Gender
 * @access  Public (for Admin Dashboard)
 */
router.get('/diversity-gender', protect, authorize(1), async (req, res) => {
    try {
        const data = await query("SELECT * FROM vw_diversitybygender");
        res.json(data);
    } catch (err) {
        console.error("Diversity Gender Error:", err.message);
        res.status(500).json({ error: "Failed to fetch gender diversity data." });
    }
});

/**
 * @route   GET /api/analytics/diversity-disability
 * @desc    Get diversity by Disability status
 * @access  Public (for Admin Dashboard)
 */
router.get('/diversity-disability', protect, authorize(1), async (req, res) => {
    try {
        const data = await query("SELECT * FROM vw_diversitybydisability");
        res.json(data);
    } catch (err) {
        console.error("Diversity Disability Error:", err.message);
        res.status(500).json({ error: "Failed to fetch disability diversity data." });
    }
});

/**
 * @route   GET /api/analytics/diversity-veteran
 * @desc    Get diversity by Veteran status
 * @access  Public (for Admin Dashboard)
 */
router.get('/diversity-veteran', protect, authorize(1), async (req, res) => {
    try {
        const data = await query("SELECT * FROM vw_diversitybyveteran");
        res.json(data);
    } catch (err) {
        console.error("Diversity Veteran Error:", err.message);
        res.status(500).json({ error: "Failed to fetch veteran diversity data." });
    }
});

/**
 * @route   GET /api/analytics/market
 * @desc    Get market intelligence dashboard data
 * @access  Public (for Admin Dashboard)
 */
router.get('/market', protect, authorize([1, 2]), async (req, res) => {
    try {
        const data = await query("SELECT * FROM vw_marketintelligencedashboard");
        res.json(data);
    } catch (err) {
        console.error("Market Analytics Error:", err.message);
        res.status(500).json({ error: "Failed to fetch market intelligence." });
    }
});

/**
 * @route   GET /api/analytics/salary-transparency
 * @desc    Get salary transparency analytics
 * @access  Public (for Admin Dashboard)
 */
router.get('/salary-transparency', protect, authorize([1, 2]), async (req, res) => {
    try {
        const data = await query("SELECT * FROM vw_salarytransparency");
        res.json(data);
    } catch (err) {
        console.error("Salary Transparency Error:", err.message);
        res.status(500).json({ error: "Failed to fetch salary transparency data." });
    }
});

/**
 * @route   GET /api/analytics/remote-compatibility
 * @desc    Get remote work compatibility analytics
 * @access  Public (for Admin Dashboard)
 */
router.get('/remote-compatibility', protect, authorize([1, 2]), async (req, res) => {
    try {
        const data = await query("SELECT * FROM vw_remotecompatibilitymatrix");
        // Map column names for frontend chart compatibility
        // Chart expects: { Role, RemoteScore }
        // View returns: { jobtitle, overallremotescore }
        const mapped = data.map(row => ({
            ...row,
            Role: row.jobtitle,
            RemoteScore: row.overallremotescore
        }));
        res.json(mapped);
    } catch (err) {
        console.error("Remote Compatibility Error:", err.message);
        res.status(500).json({ error: "Failed to fetch remote compatibility data." });
    }
});

/**
 * @route   GET /api/analytics/career-path
 * @desc    Get career path insights (individual candidate data)
 * @access  Public (for Admin Dashboard)
 */
router.get('/career-path', protect, authorize([1, 2]), async (req, res) => {
    try {
        const data = await query("SELECT * FROM vw_careerpathinsights");
        res.json(data);
    } catch (err) {
        console.error("Career Path Error:", err.message);
        res.status(500).json({ error: "Failed to fetch career path data." });
    }
});

/**
 * @route   GET /api/analytics/organizational-career
 * @desc    Get aggregated organizational career insights for Admin Dashboard
 * @access  Public (for Admin Dashboard)
 */
router.get('/organizational-career', protect, authorize([1, 2]), async (req, res) => {
    try {
        const data = await query("SELECT * FROM vw_organizationalcareerinsights");
        res.json(data);
    } catch (err) {
        console.error("Organizational Career Insights Error:", err.message);
        res.status(500).json({ error: "Failed to fetch organizational career data." });
    }
});

/**
 * @route   GET /api/analytics/referral-intelligence
 * @desc    Get referral intelligence analytics
 * @access  Public (for Admin Dashboard)
 */
router.get('/referral-intelligence', protect, authorize([1, 2]), async (req, res) => {
    try {
        const data = await query("SELECT * FROM vw_referralintelligence");
        res.json(data);
    } catch (err) {
        console.error("Referral Intelligence Error:", err.message);
        res.status(500).json({ error: "Failed to fetch referral intelligence data." });
    }
});

/**
 * @route   GET /api/analytics/risk-alerts
 * @desc    Get silent rejections and ghosting risk alerts
 * @access  Public (for demo)
 */
router.get('/risk-alerts', protect, authorize([1, 2]), async (req, res) => {
    try {
        const [silent, ghosting] = await Promise.all([
            query("SELECT * FROM vw_silentrejections ORDER BY daysinactive DESC LIMIT 5"),
            query("SELECT * FROM vw_ghostingriskdashboard WHERE overallrisklevel = 'High' LIMIT 5")
        ]);

        res.json({
            silentRejections: silent,
            ghostingRisk: ghosting
        });
    } catch (err) {
        console.error("Risk Alerts Analytics Error:", err.message);
        res.status(500).json({ error: "Failed to fetch risk intelligence." });
    }
});

/**
 * @route   GET /api/analytics/system-stats
 * @desc    Get real-time recruitment statistics
 * @access  Private (Admin)
 */
router.get('/system-stats', protect, authorize(1), async (req, res) => {
    try {
        // Get recruitment stats
        const stats = await query(`
            SELECT 
                (SELECT COUNT(*) FROM candidates) AS candidatecount,
                (SELECT COUNT(*) FROM users) AS usercount,
                (SELECT COUNT(*) FROM jobpostings WHERE isdeleted = false AND isactive = true) AS activejobcount,
                (SELECT COUNT(*) FROM applications WHERE isdeleted = false) AS totalapplications,
                (SELECT COUNT(*) FROM interviewschedules) AS scheduledinterviews,
                (SELECT COUNT(*) FROM applications WHERE isdeleted = false AND statusid = 4) AS hiredcandidates
        `);

        res.json({
            candidates: stats[0]?.candidatecount || 0,
            users: stats[0]?.usercount || 0,
            activeJobs: stats[0]?.activejobcount || 0,
            totalApplications: stats[0]?.totalapplications || 0,
            scheduledInterviews: stats[0]?.scheduledinterviews || 0,
            hiredCandidates: stats[0]?.hiredcandidates || 0
        });
    } catch (err) {
        console.error("System Stats Error:", err.message);
        res.json({
            candidates: 0,
            users: 0,
            activeJobs: 0,
            totalApplications: 0,
            scheduledInterviews: 0,
            hiredCandidates: 0
        });
    }
});

/**
 * @route   GET /api/analytics/all-users
 * @desc    Get all users with their roles
 * @access  Private (Admin)
 */
router.get('/all-users', protect, authorize(1), async (req, res) => {
    try {
        const users = await query(`
            SELECT u.userid, u.username, u.email, u.roleid, u.isactive, r.rolename
            FROM users u
            LEFT JOIN roles r ON u.roleid = r.roleid
            ORDER BY u.userid
        `);
        res.json(users);
    } catch (err) {
        console.error("All Users Error:", err.message);
        res.status(500).json({ error: "Failed to fetch users." });
    }
});

/**
 * @route   GET /api/analytics/audit-logs
 * @desc    Get system audit logs
 * @access  Private (Admin)
 */
router.get('/audit-logs', protect, authorize(1), async (req, res) => {
    try {
        const logs = await query(`
            SELECT a.auditid, a.tablename, a.recordid, a.operation, a.oldvalue, a.newvalue, a.changedat, u.username as changedby
            FROM auditlog a
            LEFT JOIN users u ON a.changedby = u.userid
            ORDER BY a.changedat DESC
        `);
        res.json(logs);
    } catch (err) {
        console.error("Audit Logs Error:", err.message);
        res.status(500).json({ error: "Failed to fetch audit logs." });
    }
});

/**
 * @route   GET /api/analytics/bias-detection
 * @desc    Get bias detection analytics by location and experience
 * @access  Public (for demo)
 */
router.get('/bias-detection', protect, authorize([1, 2]), async (req, res) => {
    try {
        const [location, experience] = await Promise.all([
            query("SELECT * FROM vw_bias_location"),
            query("SELECT * FROM vw_bias_experience")
        ]);
        res.json({ location, experience });
    } catch (err) {
        console.error("Bias Detection Error:", err.message);
        res.status(500).json({ error: "Failed to fetch bias detection data." });
    }
});

/**
 * @route   GET /api/analytics/time-to-hire
 * @desc    Get average time-to-hire metrics
 * @access  Private (Recruiter/Admin)
 */
router.get('/time-to-hire', protect, authorize([1, 2]), async (req, res) => {
    try {
        const data = await query("SELECT * FROM vw_averagetimetohire");
        res.json(data);
    } catch (err) {
        console.error("Time-to-Hire Error:", err.message);
        res.status(500).json({ error: "Failed to fetch time-to-hire metrics." });
    }
});

/**
 * @route   GET /api/analytics/interview-scores
 * @desc    Get interview score vs decision analysis
 * @access  Private (Recruiter/Admin)
 */
router.get('/interview-scores', protect, authorize([1, 2]), async (req, res) => {
    try {
        const data = await query("SELECT * FROM vw_interviewscorevsdecision");
        res.json(data);
    } catch (err) {
        console.error("Interview Scores Error:", err.message);
        res.status(500).json({ error: "Failed to fetch interview score data." });
    }
});

/* ==========================================================================
 * ADMIN DASHBOARD ANALYTICS - Phase 1 Enhancement Endpoints
 * ==========================================================================
 * Database Views and Their Columns:
 * 
 * 1. vw_InterviewerConsistency
 *    - InterviewerID, InterviewerName, InterviewsTaken, AvgScoreGiven, ScoreVariance
 *    Purpose: Detect scoring bias/consistency issues among interviewers
 * 
 * 2. vw_InterviewScoreVsDecision
 *    - ApplicationID, FullName, AvgInterviewScore, FinalStatus
 *    Purpose: Correlate interview scores with hiring decisions
 * 
 * 3. vw_RejectionAnalysis
 *    - RejectionReason, RejectionCount, RejectionPercent
 *    Purpose: Analyze rejection patterns and reasons
 * 
 * 4. vw_CandidateEngagement
 *    - CandidateID, FullName, InterviewsScheduled, ConfirmedInterviews, EngagementRate
 *    Purpose: Track candidate responsiveness and engagement
 * 
 * 5. vw_HireRatePerJob
 *    - JobID, JobTitle, TotalApplications, Hires, HireRatePercent
 *    Purpose: Application-to-hire conversion per job posting
 * 
 * 6. vw_TimeToHire
 *    - ApplicationID, FullName, DaysToHire
 *    Purpose: Individual candidate hiring timeline metrics
 * ==========================================================================
 */

/**
 * @route   GET /api/analytics/interviewer-consistency
 * @desc    Get interviewer consistency metrics for bias detection
 * @access  Private (Admin only)
 */
router.get('/interviewer-consistency', protect, authorize(1), async (req, res) => {
    try {
        const data = await query("SELECT * FROM vw_interviewerconsistency");
        res.json(data);
    } catch (err) {
        console.error("Interviewer Consistency Error:", err.message);
        res.status(500).json({ error: "Failed to fetch interviewer consistency data." });
    }
});

/**
 * @route   GET /api/analytics/interview-score-decision
 * @desc    Get interview score vs decision correlation data
 * @access  Private (Admin only)
 */
router.get('/interview-score-decision', protect, authorize(1), async (req, res) => {
    try {
        const data = await query("SELECT * FROM vw_interviewscorevsdecision");
        res.json(data);
    } catch (err) {
        console.error("Interview Score vs Decision Error:", err.message);
        res.status(500).json({ error: "Failed to fetch interview score vs decision data." });
    }
});

/**
 * @route   GET /api/analytics/rejection-analysis
 * @desc    Get rejection reason analysis breakdown
 * @access  Private (Admin/Recruiter)
 */
router.get('/rejection-analysis', protect, authorize([1, 2]), async (req, res) => {
    try {
        const data = await query("SELECT * FROM vw_rejectionanalysis");
        res.json(data);
    } catch (err) {
        console.error("Rejection Analysis Error:", err.message);
        res.status(500).json({ error: "Failed to fetch rejection analysis." });
    }
});

/**
 * @route   GET /api/analytics/skill-gap
 * @desc    Get skill gap analysis
 * @access  Public (for demo)
 */
router.get('/skill-gap', protect, authorize([1, 2]), async (req, res) => {
    try {
        const data = await query("SELECT * FROM vw_skillgapanalysis");

        // Transform data to match frontend expectations
        // Frontend expects: { SkillName, DemandScore, SupplyScore }
        // View returns: { SkillName, JobsRequiringSkill, CandidatesWithSkill, SkillGap }

        if (data && data.length > 0) {
            // Calculate max values for normalization to get percentages
            const maxJobs = Math.max(...data.map(item => item.jobsrequiringskill || 0));
            const maxCandidates = Math.max(...data.map(item => item.candidateswithskill || 0));

            // Create a rank map for demand
            const demandRankMap = {};
            [...data].sort((a, b) => (b.jobsrequiringskill || 0) - (a.jobsrequiringskill || 0)).forEach((item, index) => {
                demandRankMap[item.skillname] = index + 1;
            });

            // Transform the data
            const transformedData = data.map(item => {
                const jobsReq = item.jobsrequiringskill || 0;
                const candidates = item.candidateswithskill || 0;

                // Calculate DemandScore as percentage (0-100)
                const demandScore = maxJobs > 0 ? Math.round((jobsReq / maxJobs) * 100) : 0;

                // Calculate SupplyScore as percentage (0-100)
                const supplyScore = maxCandidates > 0 ? Math.round((candidates / maxCandidates) * 100) : 0;

                // Calculate GapScore
                let gapScore;
                if (candidates > 0) {
                    gapScore = Math.min(100, Math.round((jobsReq / candidates) * 50));
                } else if (jobsReq > 0) {
                    gapScore = 100;
                } else {
                    gapScore = 0;
                }

                return {
                    SkillName: item.skillname,
                    DemandScore: demandScore,
                    SupplyScore: supplyScore,
                    GapScore: gapScore,
                    DemandRank: demandRankMap[item.skillname] || 0,
                    JobsRequiringSkill: jobsReq,
                    CandidatesWithSkill: candidates,
                    SkillGap: item.skillgap
                };
            });

            // Sort by GapScore descending
            transformedData.sort((a, b) => b.GapScore - a.GapScore);

            res.json(transformedData);
        } else {
            res.json(data);
        }
    } catch (err) {
        console.error("Skill Gap Error:", err.message);
        res.status(500).json({ error: "Failed to fetch skill gap analysis." });
    }
});

/**
 * @route   GET /api/analytics/candidate-engagement
 * @desc    Get candidate engagement and responsiveness metrics
 * @access  Private (Admin/Recruiter)
 */
router.get('/candidate-engagement', protect, authorize([1, 2]), async (req, res) => {
    try {
        const data = await query("SELECT * FROM vw_candidateengagement");
        res.json(data);
    } catch (err) {
        console.error("Candidate Engagement Error:", err.message);
        res.status(500).json({ error: "Failed to fetch candidate engagement data." });
    }
});

/**
 * @route   GET /api/analytics/hire-rate-per-job
 * @desc    Get application-to-hire conversion rate per job posting
 * @access  Private (Admin only)
 */
router.get('/hire-rate-per-job', protect, authorize(1), async (req, res) => {
    try {
        const data = await query("SELECT * FROM vw_hirerateperjob");
        res.json(data);
    } catch (err) {
        console.error("Hire Rate Per Job Error:", err.message);
        res.status(500).json({ error: "Failed to fetch hire rate per job data." });
    }
});

/**
 * @route   GET /api/analytics/time-to-hire-individual
 * @desc    Get individual candidate time-to-hire metrics
 * @access  Private (Admin only)
 */
router.get('/time-to-hire-individual', protect, authorize(1), async (req, res) => {
    try {
        const data = await query("SELECT * FROM vw_timetohire ORDER BY daystohire DESC");
        res.json(data);
    } catch (err) {
        console.error("Time-to-Hire Individual Error:", err.message);
        res.status(500).json({ error: "Failed to fetch individual time-to-hire data." });
    }
});

/**
 * @route   GET /api/analytics/ghosting-detail
 * @desc    Get detailed ghosting risk data
 * @access  Private (Recruiter/Admin)
 */
router.get('/ghosting-detail', protect, authorize([1, 2]), async (req, res) => {
    try {
        const data = await query("SELECT * FROM vw_ghostingriskdashboard ORDER BY overallriskscore DESC");
        res.json(data);
    } catch (err) {
        console.error("Ghosting Detail Error:", err.message);
        res.status(500).json({ error: "Failed to fetch ghosting data." });
    }
});

/**
 * @route   GET /api/analytics/skill-verification
 * @desc    Get skill verification status
 * @access  Private (Recruiter/Admin)
 */
router.get('/skill-verification', protect, authorize([1, 2]), async (req, res) => {
    try {
        const data = await query("SELECT * FROM vw_skillverificationstatus");
        res.json(data);
    } catch (err) {
        console.error("Skill Verification Error:", err.message);
        res.status(500).json({ error: "Failed to fetch skill verification data." });
    }
});

/**
 * @route   GET /api/analytics/time-to-hire-detail
 * @desc    Get individual time-to-hire metrics
 * @access  Private (Recruiter/Admin)
 */
router.get('/time-to-hire-detail', protect, authorize([1, 2]), async (req, res) => {
    try {
        // Query with all required fields for the frontend
        // Using simpler Source detection to avoid potential table issues
        const data = await query(`
            SELECT 
                a.applicationid,
                c.fullname AS candidatename,
                j.jobtitle,
                a.applieddate,
                h.changedat AS hireddate,
                (h.changedat::date - a.applieddate::date) AS daystohire,
                'Hired' AS applicationstatus,
                'Direct' AS source
            FROM applications a
            JOIN candidates c ON a.candidateid = c.candidateid
            JOIN jobpostings j ON a.jobid = j.jobid
            JOIN applicationstatushistory h ON a.applicationid = h.applicationid
            WHERE h.tostatusid = (SELECT statusid FROM applicationstatus WHERE statusname = 'Hired')
            ORDER BY daystohire DESC
        `);
        res.json(data);
    } catch (err) {
        console.error("Time-to-Hire Detail Error:", err.message);
        res.status(500).json({ error: "Failed to fetch time-to-hire data." });
    }
});

/**
 * @route   GET /api/analytics/recruiter-performance
 * @desc    Get recruiter performance metrics
 * @access  Public (for demo)
 */
router.get('/recruiter-performance', protect, authorize([1, 2]), async (req, res) => {
    try {
        const data = await query("SELECT * FROM vw_recruiterperformance");
        res.json(data);
    } catch (err) {
        console.error("Recruiter Performance Error:", err.message);
        res.status(500).json({ error: "Failed to fetch recruiter performance data." });
    }
});

/**
 * @route   GET /api/analytics/consent-status
 * @desc    Get GDPR consent status with candidate names
 * @access  Private (Admin)
 */
router.get('/consent-status', protect, authorize(1), async (req, res) => {
    try {
        const data = await query(`
            SELECT 
                cm.consentid,
                cm.candidateid,
                c.fullname AS candidatename,
                cm.consenttype,
                cm.consentversion,
                cm.isactive,
                cm.givenat,
                cm.expirydate,
                cm.revokedat,
                CASE 
                    WHEN cm.revokedat IS NOT NULL THEN 'Revoked'
                    WHEN cm.expirydate < NOW() THEN 'Expired'
                    WHEN cm.isactive = true THEN 'Active'
                    ELSE 'Revoked'
                END AS status
            FROM consentmanagement cm
            JOIN candidates c ON cm.candidateid = c.candidateid
            ORDER BY cm.givenat DESC
        `);
        res.json(data);
    } catch (err) {
        console.error("Consent Status Error:", err.message);
        res.status(500).json({ error: "Failed to fetch consent data." });
    }
});

/**
 * @route   GET /api/analytics/vacancy-overview
 * @desc    Get vacancy utilization overview for admin
 * @access  Private (Admin)
 */
router.get('/vacancy-overview', protect, authorize(1), async (req, res) => {
    try {
        const data = await query("SELECT * FROM vw_vacancyutilization");
        res.json(data);
    } catch (err) {
        console.error("Vacancy Overview Error:", err.message);
        res.status(500).json({ error: "Failed to fetch vacancy data." });
    }
});

/**
 * @route   POST /api/analytics/predict-hire-success
 * @desc    Predict hiring success probability for an application using Rules-Based AI
 * @access  Private (Recruiter/Admin)
 * @params  { applicationId: number }
 */
router.post('/predict-hire-success', protect, authorize([1, 2]), async (req, res) => {
    try {
        const { applicationId } = req.body;

        if (!applicationId) {
            return res.status(400).json({ error: "Application ID is required." });
        }

        // Call the function for Rules-Based AI prediction
        const result = await query(`SELECT * FROM sp_predicthiresuccess($1)`, [applicationId]);

        if (result && result.length > 0) {
            res.json({
                success: true,
                prediction: {
                    successProbability: result[0].successprobabilitypercent,
                    confidence: result[0].confidencelevel,
                    breakdown: {
                        skills: result[0].skillmatchpercent,
                        experience: result[0].experiencematchpercent,
                        interview: result[0].interviewscorepercent,
                        engagement: result[0].responseengagementpercent,
                        history: result[0].historicalsuccessrate
                    }
                }
            });
        } else {
            res.status(404).json({ error: "Could not generate prediction for this application." });
        }
    } catch (err) {
        console.error("Predict Hire Success Error:", err.message);
        res.status(500).json({ error: "Failed to predict hire success." });
    }
});

/**
 * @route   GET /api/analytics/applications-for-prediction
 * @desc    Get list of applications eligible for success prediction
 * @access  Private (Recruiter/Admin)
 */
router.get('/applications-for-prediction', protect, authorize([1, 2]), async (req, res) => {
    try {
        // MatchScore is from vw_CandidateMatchScore, not Applications table
        const data = await query(`
            SELECT 
                a.applicationid,
                a.candidateid,
                c.fullname AS candidatename,
                j.jobtitle,
                s.statusname,
                a.applieddate,
                h.changedat AS laststatusdate,
                (h.changedat::date - a.applieddate::date) AS daysinstatus,
                COALESCE(avg_time.avgdays, 0) AS avgdaysinstage
            FROM applications a
            JOIN candidates c ON a.candidateid = c.candidateid
            JOIN jobpostings j ON a.jobid = j.jobid
            JOIN applicationstatus s ON a.statusid = s.statusid
            JOIN applicationstatushistory h ON a.applicationid = h.applicationid
            LEFT JOIN (
                SELECT tostatusid, AVG(daysinstatus) AS avgdays
                FROM (
                    SELECT tostatusid, (changedat::date - lag(changedat::date) OVER (PARTITION BY applicationid ORDER BY changedat)) AS daysinstatus
                    FROM applicationstatushistory
                ) sub
                GROUP BY tostatusid
            ) avg_time ON a.statusid = avg_time.tostatusid
            WHERE h.tostatusid = a.statusid
              AND (
                SELECT MAX(changedat) 
                FROM applicationstatushistory 
                WHERE applicationid = a.applicationid
              ) = h.changedat
            ORDER BY daysinstatus DESC
        `);
        res.json(data);
    } catch (err) {
        console.error("Applications for Prediction Error:", err.message);
        console.error("Full error:", err);
        res.status(500).json({ error: "Failed to fetch applications.", details: err.message });
    }
});

/**
 * @route   GET /api/analytics/hire-success-predictions
 * @desc    Get all stored hire success predictions
 * @access  Private (Recruiter/Admin)
 */
router.get('/hire-success-predictions', protect, authorize([1, 2]), async (req, res) => {
    try {
        let data = await query(`
            SELECT p.*, c.fullname as candidatename, j.jobtitle,
                   s.statusname, c.yearsofexperience
            FROM ai_predictions p
            LEFT JOIN candidates c ON p.candidateid = c.candidateid
            LEFT JOIN jobpostings j ON p.jobid = j.jobid
            LEFT JOIN applications a ON p.applicationid = a.applicationid
            LEFT JOIN applicationstatus s ON a.statusid = s.statusid
            ORDER BY p.predictiondate DESC LIMIT 50
        `);

        // If the table is empty, auto-generate predictions for all applications
        // at Interview stage (3) or later, so the page shows real history on
        // first visit instead of being empty.
        if (!data || data.length === 0) {
            try {
                const apps = await query(`
                    SELECT applicationid FROM applications
                    WHERE statusid >= 3 AND isdeleted = false
                    ORDER BY applicationid LIMIT 30
                `);
                for (const app of apps) {
                    try {
                        await query(`SELECT * FROM sp_predicthiresuccess($1)`, [app.applicationid]);
                    } catch (predErr) {
                        console.log("Auto hire-success prediction failed for application", app.applicationid, ":", predErr.message);
                    }
                }
                // Re-fetch
                data = await query(`
                    SELECT p.*, c.fullname as candidatename, j.jobtitle,
                           s.statusname, c.yearsofexperience
                    FROM ai_predictions p
                    LEFT JOIN candidates c ON p.candidateid = c.candidateid
                    LEFT JOIN jobpostings j ON p.jobid = j.jobid
                    LEFT JOIN applications a ON p.applicationid = a.applicationid
                    LEFT JOIN applicationstatus s ON a.statusid = s.statusid
                    ORDER BY p.predictiondate DESC LIMIT 50
                `);
            } catch (autoGenErr) {
                console.error("Auto-generation of hire success predictions failed:", autoGenErr.message);
            }
        }

        // Transform to PascalCase for frontend
        const formattedData = data.map(p => ({
            PredictionID: p.predictionid,
            CandidateID: p.candidateid,
            CandidateName: p.candidatename,
            JobTitle: p.jobtitle,
            SuccessProbability: p.successprobability,
            KeyFactors: p.keyfactors,
            YearsOfExperience: p.yearsofexperience,
            StatusID: p.statusid,
            StatusName: p.statusname,
            ConfidenceLevel: p.confidencelevel
        }));
        res.json(formattedData);
    } catch (err) {
        console.error("Hire Success Predictions Error:", err.message);
        res.status(500).json({ error: "Failed to fetch predictions." });
    }
});

/**
 * @route   POST /api/analytics/predict-onboarding-success
 * @desc    Predict onboarding success for a hired candidate using sp_PredictOnboardingSuccess
 * @access  Private (Recruiter/Admin)
 * @params  { candidateId: number, jobId: number }
 */
router.post('/predict-onboarding-success', protect, authorize([1, 2]), async (req, res) => {
    try {
        const { candidateId, jobId } = req.body;

        if (!candidateId || !jobId) {
            return res.status(400).json({ error: "Candidate ID and Job ID are required." });
        }

        // Call the function for onboarding success prediction
        const result = await query(`SELECT * FROM sp_predictonboardingsuccess($1, $2)`, [candidateId, jobId]);

        if (result && result.length > 0) {
            // Persist the prediction so it appears in the prediction history.
            // The SP in this DB does NOT insert into onboardingpredictions,
            // so we have to do it ourselves.
            // NOTE: the table does NOT have a risklevel column.
            try {
                await query(`
                    INSERT INTO onboardingpredictions
                        (candidateid, jobid, successprobability,
                         riskfactors, recommendations, predictedretentionmonths,
                         predictiondate)
                    VALUES ($1, $2, $3, $4, $5, $6, NOW())
                    ON CONFLICT DO NOTHING
                `, [
                    candidateId,
                    jobId,
                    result[0].successprobability,
                    result[0].riskfactors,
                    result[0].recommendations,
                    result[0].predictedretentionmonths
                ]);
            } catch (insertErr) {
                // Don't fail the request if the insert fails — still return the prediction
                console.log("Failed to persist onboarding prediction:", insertErr.message);
            }

            res.json({
                success: true,
                prediction: {
                    successProbability: result[0].successprobability,
                    riskLevel: result[0].risklevel,
                    riskFactors: result[0].riskfactors,
                    recommendations: result[0].recommendations,
                    predictedRetentionMonths: result[0].predictedretentionmonths
                }
            });
        } else {
            res.status(404).json({ error: "Could not generate onboarding prediction." });
        }
    } catch (err) {
        console.error("Predict Onboarding Success Error:", err.message);
        res.status(500).json({ error: "Failed to predict onboarding success." });
    }
});

/**
 * @route   GET /api/analytics/hired-candidates
 * @desc    Get list of hired candidates eligible for onboarding prediction
 * @access  Private (Recruiter/Admin)
 */
router.get('/hired-candidates', protect, authorize([1, 2]), async (req, res) => {
    try {
        const data = await query(`
            SELECT 
                a.applicationid,
                a.candidateid,
                c.fullname AS candidatename,
                j.jobid,
                j.jobtitle,
                a.statusid,
                s.statusname,
                h.changedat AS hireddate,
                (NOW()::date - h.changedat::date) AS dayssincehired,
                c.yearsofexperience,
                rc.overallremotescore
            FROM applications a
            JOIN candidates c ON a.candidateid = c.candidateid
            JOIN jobpostings j ON a.jobid = j.jobid
            JOIN applicationstatus s ON a.statusid = s.statusid
            JOIN applicationstatushistory h ON a.applicationid = h.applicationid
            LEFT JOIN remotecompatibility rc ON c.candidateid = rc.candidateid
            WHERE a.statusid = 4
                AND h.tostatusid = 4
                AND a.isdeleted = false
            ORDER BY h.changedat DESC
        `);
        res.json(data);
    } catch (err) {
        console.error("Hired Candidates Error:", err.message);
        res.status(500).json({ error: "Failed to fetch hired candidates." });
    }
});

/**
 * @route   GET /api/analytics/onboarding-predictions
 * @desc    Get all stored onboarding predictions
 * @access  Private (Recruiter/Admin)
 */
router.get('/onboarding-predictions', protect, authorize([1, 2]), async (req, res) => {
    try {
        let data = await query(`
            SELECT p.*, c.fullname as candidatename, j.jobtitle,
                   p.predictiondate as predictedat
            FROM onboardingpredictions p
            LEFT JOIN candidates c ON p.candidateid = c.candidateid
            LEFT JOIN jobpostings j ON p.jobid = j.jobid
            ORDER BY p.predictiondate DESC LIMIT 50
        `);

        // If the table is empty, auto-generate predictions for all hired
        // candidates so the page shows real history on first visit (instead
        // of being empty until a recruiter manually runs each prediction).
        if (!data || data.length === 0) {
            try {
                // Get all hired candidates (statusid = 4)
                const hiredCandidates = await query(`
                    SELECT a.candidateid, a.jobid
                    FROM applications a
                    WHERE a.statusid = 4 AND a.isdeleted = false
                    ORDER BY a.applicationid
                `);

                // Run prediction for each one. The SP returns the prediction
                // but (in this DB) does NOT insert into onboardingpredictions,
                // so we have to do the INSERT ourselves.
                // NOTE: the table does NOT have a risklevel column — RiskLevel
                // is derived from SuccessProbability at query time.
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
                                hc.candidateid,
                                hc.jobid,
                                p.successprobability,
                                p.riskfactors,
                                p.recommendations,
                                p.predictedretentionmonths
                            ]);
                        }
                    } catch (predErr) {
                        // Skip individual failures — keep generating for others
                        console.log("Auto-prediction failed for candidate", hc.candidateid, ":", predErr.message);
                    }
                }

                // Re-fetch predictions now that they should be populated
                data = await query(`
                    SELECT p.*, c.fullname as candidatename, j.jobtitle,
                           p.predictiondate as predictedat
                    FROM onboardingpredictions p
                    LEFT JOIN candidates c ON p.candidateid = c.candidateid
                    LEFT JOIN jobpostings j ON p.jobid = j.jobid
                    ORDER BY p.predictiondate DESC LIMIT 50
                `);
            } catch (autoGenErr) {
                console.error("Auto-generation of onboarding predictions failed:", autoGenErr.message);
                // Continue with empty data — frontend will show empty state
            }
        }

        // Transform to PascalCase for frontend
        const formattedData = data.map(p => ({
            PredictionID: p.predictionid,
            CandidateID: p.candidateid,
            CandidateName: p.candidatename,
            JobTitle: p.jobtitle,
            SuccessProbability: p.successprobability,
            RiskLevel: p.successprobability >= 0.8 ? "Low Risk" : p.successprobability >= 0.6 ? "Medium Risk" : "High Risk",
            RiskFactors: p.riskfactors,
            Recommendations: p.recommendations,
            PredictedRetentionMonths: p.predictedretentionmonths,
            PredictedAt: p.predictedat
        }));
        res.json(formattedData);
    } catch (err) {
        console.error("Onboarding Predictions Error:", err.message);
        // Table might not exist yet, return empty array
        res.json([]);
    }
});

/**
 * @route   GET /api/analytics/sentiment-trends
 * @desc    Get sentiment trends across all candidates
 * @access  Private (Recruiter/Admin)
 */
router.get('/sentiment-trends', protect, authorize([1, 2]), async (req, res) => {
    try {
        // Get overall sentiment statistics
        const overallStats = await query(`
            SELECT 
                COUNT(*) AS totalinteractions,
                COALESCE(AVG(sentimentscore), 0) AS avgsentimentscore,
                COALESCE(AVG(confidence), 0) AS avgconfidence,
                COALESCE(SUM(redflagsdetected), 0) AS totalredflags,
                COALESCE(SUM(positiveindicators), 0) AS totalpositiveindicators
            FROM candidatesentiment
        `);

        // Get sentiment by interaction type
        const byType = await query(`
            SELECT 
                interactiontype,
                COUNT(*) AS count,
                AVG(sentimentscore) AS avgsentiment,
                AVG(confidence) AS avgconfidence
            FROM candidatesentiment
            GROUP BY interactiontype
            ORDER BY count DESC
        `);

        // Get sentiment trend over time (last 30 days)
        const trend = await query(`
            SELECT 
                CAST(interactiondate AS DATE) AS date,
                COUNT(*) AS interactioncount,
                AVG(sentimentscore) AS avgsentiment
            FROM candidatesentiment
            WHERE interactiondate >= NOW() - INTERVAL '30 days'
            GROUP BY CAST(interactiondate AS DATE)
            ORDER BY date DESC
        `);

        // Get candidates with declining sentiment (at-risk)
        const atRisk = await query(`
            SELECT 
                c.candidateid,
                c.fullname,
                AVG(cs.sentimentscore) AS avgsentiment,
                SUM(cs.redflagsdetected) AS redflags,
                MAX(cs.interactiondate) AS lastinteraction
            FROM candidatesentiment cs
            JOIN candidates c ON cs.candidateid = c.candidateid
            WHERE cs.interactiondate >= NOW() - INTERVAL '14 days'
            GROUP BY c.candidateid, c.fullname
            HAVING AVG(cs.sentimentscore) < 0
            ORDER BY avgsentiment ASC
            LIMIT 10
        `);

        // Get communication style distribution
        const styleDistribution = await query(`
            SELECT 
                communicationstyle,
                COUNT(*) AS count,
                AVG(sentimentscore) AS avgsentiment
            FROM candidatesentiment
            WHERE communicationstyle IS NOT NULL
            GROUP BY communicationstyle
            ORDER BY count DESC
        `);

        res.json({
            overall: overallStats[0],
            byType,
            trend,
            atRisk,
            styleDistribution
        });
    } catch (err) {
        console.error("Sentiment Trends Error:", err.message);
        res.status(500).json({ error: "Failed to fetch sentiment trends." });
    }
});

/**
 * @route   GET /api/analytics/sentiment-at-risk
 * @desc    Get candidates with declining sentiment (at-risk for disengagement)
 * @access  Private (Recruiter/Admin)
 */
router.get('/sentiment-at-risk', protect, authorize([1, 2]), async (req, res) => {
    try {
        const atRiskCandidates = await query(`
            SELECT 
                c.candidateid,
                c.fullname,
                c.location,
                c.yearsofexperience,
                COUNT(cs.sentimentid) AS totalinteractions,
                AVG(cs.sentimentscore) AS avgsentimentscore,
                SUM(cs.redflagsdetected) AS totalredflags,
                SUM(cs.positiveindicators) AS totalpositiveindicators,
                MAX(cs.interactiondate) AS lastinteraction,
                MIN(cs.sentimentscore) AS lowestscore,
                MAX(cs.sentimentscore) AS highestscore,
                -- Calculate sentiment trend (recent vs older)
                CASE 
                    WHEN AVG(CASE WHEN cs.interactiondate >= NOW() - INTERVAL '7 days' THEN cs.sentimentscore ELSE NULL END) <
                         AVG(CASE WHEN cs.interactiondate < NOW() - INTERVAL '7 days' THEN cs.sentimentscore ELSE NULL END)
                    THEN 'Declining'
                    ELSE 'Stable'
                END AS trend
            FROM candidatesentiment cs
            JOIN candidates c ON cs.candidateid = c.candidateid
            GROUP BY c.candidateid, c.fullname, c.location, c.yearsofexperience
            HAVING AVG(cs.sentimentscore) < 0.2 OR SUM(cs.redflagsdetected) > 2
            ORDER BY avgsentimentscore ASC
        `);

        res.json(atRiskCandidates);
    } catch (err) {
        console.error("At-Risk Candidates Error:", err.message);
        res.status(500).json({ error: "Failed to fetch at-risk candidates." });
    }
});

/**
 * @route   GET /api/analytics/diversity-goals
 * @desc    Get all diversity goals
 * @access  Private (Admin/Recruiter)
 */
router.get('/diversity-goals', protect, authorize([1, 2]), async (req, res) => {
    try {
        const data = await query(`
            SELECT dg.goalid, dg.metrictype, dg.targetpercentage, dg.currentpercentage, 
                   dg.startdate, dg.enddate, dg.isactive, u.username as recruitername
            FROM diversitygoals dg
            LEFT JOIN recruiters r ON dg.recruiterid = r.recruiterid
            LEFT JOIN users u ON r.userid = u.userid
            ORDER BY dg.startdate DESC
        `);
        res.json(data);
    } catch (err) {
        console.error("Diversity Goals Error:", err.message);
        res.status(500).json({ error: "Failed to fetch diversity goals." });
    }
});

/**
 * @route   POST /api/analytics/diversity-goals
 * @desc    Create a new diversity goal
 * @access  Private (Admin/Recruiter)
 */
router.post('/diversity-goals', protect, authorize([1, 2]), async (req, res) => {
    try {
        const { metricType, targetPercentage, startDate, endDate } = req.body;
        const userid = req.user.userid;

        // Get recruiter ID (nullable for Admins who might not have a recruiter record)
        let recruiterID = null;
        const recruiter = await query("SELECT recruiterid FROM recruiters WHERE userid = ?", [userid]);
        if (recruiter.length > 0) {
            recruiterID = recruiter[0].recruiterid;
        }

        const result = await query(`
            INSERT INTO diversitygoals (recruiterid, metrictype, targetpercentage, currentpercentage, startdate, enddate, isactive)
            VALUES (?, ?, ?, 0, ?, ?, true)
            RETURNING goalid
        `, [recruiterID, metricType, targetPercentage, startDate, endDate]);

        res.status(201).json({
            success: true,
            goalId: result[0].goalid,
            message: "Diversity goal created successfully."
        });
    } catch (err) {
        console.error("Create Diversity Goal Error:", err.message);
        res.status(500).json({ error: "Failed to create diversity goal." });
    }
});

/**
 * @route   GET /api/analytics/bias-logs
 * @desc    Get bias detection logs
 * @access  Private (Admin/Recruiter)
 */
router.get('/bias-logs', protect, authorize([1, 2]), async (req, res) => {
    try {
        const data = await query(`
            SELECT bdl.detectionid, bdl.detectiontype, bdl.severity, bdl.details, 
                   bdl.suggestedactions, bdl.detectedat, bdl.resolvedat, bdl.isresolved,
                   u.username as recruitername
            FROM biasdetectionlogs bdl
            LEFT JOIN recruiters r ON bdl.recruiterid = r.recruiterid
            LEFT JOIN users u ON r.userid = u.userid
            ORDER BY bdl.detectedat DESC
        `);
        res.json(data);
    } catch (err) {
        console.error("Bias Logs Error:", err.message);
        res.status(500).json({ error: "Failed to fetch bias logs." });
    }
});

/**
 * @route   PUT /api/analytics/bias-logs/:id/resolve
 * @desc    Mark a bias log as resolved
 * @access  Private (Admin)
 */
router.put('/bias-logs/:id/resolve', protect, authorize(1), async (req, res) => {
    try {
        const { id } = req.params;

        await query(`
            UPDATE biasdetectionlogs 
            SET isresolved = true, resolvedat = NOW()
            WHERE detectionid = ?
        `, [id]);

        res.json({ success: true, message: "Bias log marked as resolved." });
    } catch (err) {
        console.error("Resolve Bias Log Error:", err.message);
        res.status(500).json({ error: "Failed to resolve bias log." });
    }
});

/**
 * @route   POST /api/analytics/verify-skill
 * @desc    Verify or reject a candidate's skill
 * @access  Private (Recruiter/Admin)
 */
router.post('/verify-skill', protect, authorize([1, 2]), async (req, res) => {
    const { candidateId, skillName, verifiedLevel, status, notes } = req.body;

    if (!candidateId || !skillName || !status) {
        return res.status(400).json({ error: "Candidate ID, skill name, and status are required." });
    }

    try {
        // Find the skill ID from the skill name
        const skillResult = await query(
            "SELECT skillid FROM skills WHERE skillname = ? LIMIT 1",
            [skillName]
        );

        if (skillResult.length === 0) {
            return res.status(404).json({ error: "Skill not found." });
        }

        const skillId = skillResult[0].skillid;

        // Parse verifiedLevel — frontend sends one of:
        //   - empty string (no selection → default to 5)
        //   - level name: "Beginner" | "Intermediate" | "Advanced" | "Expert"
        //   - numeric string: "85" or number: 85
        //   - already a number: 85
        // We need to normalize all of these to an integer 0-100 score.
        const LEVEL_TO_SCORE = {
            beginner: 25,
            intermediate: 50,
            advanced: 75,
            expert: 100
        };

        let score;
        if (verifiedLevel === '' || verifiedLevel === null || verifiedLevel === undefined) {
            score = 5; // default — no level selected
        } else if (typeof verifiedLevel === 'number') {
            score = verifiedLevel;
        } else if (typeof verifiedLevel === 'string') {
            const trimmed = verifiedLevel.trim();
            const asNum = Number(trimmed);
            if (!isNaN(asNum) && trimmed !== '') {
                // Numeric string ("85" or "8.5")
                score = asNum;
            } else {
                // Level name ("Beginner", etc.) — case-insensitive lookup
                score = LEVEL_TO_SCORE[trimmed.toLowerCase()];
                if (score === undefined) {
                    return res.status(400).json({
                        error: `Invalid verifiedLevel "${verifiedLevel}". Expected one of: Beginner, Intermediate, Advanced, Expert, or a number 0-100.`
                    });
                }
            }
        } else {
            return res.status(400).json({ error: 'verifiedLevel must be a string or number.' });
        }

        // Round to integer and validate range
        score = Math.round(score);
        if (isNaN(score) || score < 0 || score > 100) {
            return res.status(400).json({ error: 'Verification score must be between 0 and 100.' });
        }

        if (status === 'Verified') {
            // Update or insert skill verification
            const existing = await query(
                "SELECT verificationid FROM skillverifications WHERE candidateid = ? AND skillid = ? LIMIT 1",
                [candidateId, skillId]
            );

            if (existing.length > 0) {
                await query(
                    `UPDATE skillverifications 
                     SET verifiedat = NOW(), isverified = TRUE, verificationmethod = 'Certification',
                         verificationscore = ?
                     WHERE verificationid = ?`,
                    [score, existing[0].verificationid]
                );
            } else {
                await query(
                    `INSERT INTO skillverifications 
                     (candidateid, skillid, verificationmethod, verificationscore, verifiedat, isverified)
                     VALUES (?, ?, 'Certification', ?, NOW(), TRUE)`,
                    [candidateId, skillId, score]
                );
            }
        }

        res.status(201).json({
            message: `Skill ${status === 'Verified' ? 'verified' : 'rejected'} successfully.`,
            candidateId,
            skillName,
            status,
            verifiedLevel: status === 'Verified' ? score : null,
        });
    } catch (err) {
        console.error("Skill Verification Error:", err.message);
        res.status(500).json({ error: "Failed to verify skill: " + err.message });
    }
});

module.exports = router;
