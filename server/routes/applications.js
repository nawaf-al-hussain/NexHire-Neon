const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { protect, authorize } = require('../middleware/rbac');

/**
 * @route   PUT /api/applications/:id/status
 * @desc    Update application status (Screening, Interview, Rejected, etc.)
 * @access  Private (Recruiter)
 */
router.put('/:id/status', protect, authorize(2), async (req, res) => {
    const { statusID, notes, rejectionReason } = req.body;
    const recruiterUserID = req.user.userid;

    if (!statusID) {
        return res.status(400).json({ error: "New Status ID is required." });
    }

    try {
        await query(
            "CALL sp_updateapplicationstatus($1, $2, $3, $4, $5)",
            [req.params.id, statusID, recruiterUserID, notes || 'Status updated via recruiter panel', rejectionReason || null]
        );
        res.json({ message: "Application status updated successfully." });
    } catch (err) {
        console.error("Update Status Error:", err.message);
        res.status(500).json({ error: err.message || "Failed to update application status." });
    }
});

/**
 * @route   POST /api/applications/:id/hire
 * @desc    Hire a candidate (concurrency-safe)
 * @access  Private (Recruiter)
 */
router.post('/:id/hire', protect, authorize(2), async (req, res) => {
    const recruiterUserID = req.user.userid;

    try {
        // Need to find the RecruiterID from UserID
        const recruiter = await query("SELECT recruiterid FROM recruiters WHERE userid = ?", [recruiterUserID]);

        if (recruiter.length === 0) {
            return res.status(403).json({ error: "Unauthorized: Not a registered recruiter." });
        }

        const recruiterID = recruiter[0].recruiterid;

        await query(
            "CALL sp_hirecandidate($1, $2)",
            [req.params.id, recruiterID]
        );
        res.json({ message: "Candidate hired successfully! Vacancy count adjusted." });
    } catch (err) {
        console.error("Hire Candidate Error:", err.message);
        res.status(500).json({ error: err.message || "Failed to finalize hire." });
    }
});

/**
 * @route   GET /api/applications/:id/history
 * @desc    Get status transition history for an application
 * @access  Private
 */
router.get('/:id/history', protect, async (req, res) => {
    try {
        const history = await query(
            "SELECT h.*, s1.statusname as fromstatus, s2.statusname as tostatus, u.username as changedbylabel " +
            "FROM applicationstatushistory h " +
            "JOIN applicationstatus s1 ON h.fromstatusid = s1.statusid " +
            "JOIN applicationstatus s2 ON h.tostatusid = s2.statusid " +
            "JOIN users u ON h.changedby = u.userid " +
            "WHERE h.applicationid = ? " +
            "ORDER BY h.changedat DESC",
            [req.params.id]
        );
        res.json(history);
    } catch (err) {
        console.error("Fetch History Error:", err.message);
        res.status(500).json({ error: "Failed to fetch application history." });
    }
});

/**
 * @route   POST /api/applications/auto-reject
 * @desc    Run auto-reject batch process for unqualified candidates
 * @access  Private (Recruiter)
 */
router.post('/auto-reject', protect, authorize(2), async (req, res) => {
    try {
        const result = await query("CALL sp_autorejectunqualified()");
        res.json({
            success: true,
            message: "Auto-reject batch completed.",
            result: result
        });
    } catch (err) {
        console.error("Auto-Reject Error:", err.message);
        res.status(500).json({ error: "Failed to run auto-reject process." });
    }
});

/**
 * @route   GET /api/applications/auto-rejected
 * @desc    Get list of auto-rejected applications
 * @access  Private (Recruiter)
 */
router.get('/auto-rejected', protect, authorize(2), async (req, res) => {
    try {
        const data = await query(`
            SELECT 
                a.applicationid as applicationid,
                a.applieddate as applieddate,
                a.rejectionreason as rejectionreason,
                c.fullname AS candidatename,
                c.yearsofexperience AS candidateexperience,
                j.jobtitle as jobtitle,
                j.minexperience AS requiredexperience
            FROM applications a
            JOIN candidates c ON a.candidateid = c.candidateid
            JOIN jobpostings j ON a.jobid = j.jobid
            JOIN applicationstatus s ON a.statusid = s.statusid
            WHERE s.statusname = 'Rejected' 
            AND a.rejectionreason LIKE '%Auto-Rejected%'
            AND a.isdeleted = FALSE
            ORDER BY a.applieddate DESC
        `);
        res.json(data);
    } catch (err) {
        console.error("Auto-Rejected List Error:", err.message);
        res.status(500).json({ error: "Failed to fetch auto-rejected applications." });
    }
});

module.exports = router;
