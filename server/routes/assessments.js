const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { protect, authorize } = require('../middleware/rbac');

// ----------------------------------------------------
// [GET] /available
// Fetch all MicroAssessments matching Candidate's unverified skills
// ----------------------------------------------------
router.get('/available', protect, authorize([3]), async (req, res) => {
    try {
        const userID = req.user.userid;

        // 1. Get CandidateID
        const candCheck = await query("SELECT candidateid as candidateid FROM candidates WHERE userid = ?", [userID]);
        if (candCheck.length === 0) return res.status(404).json({ error: "Candidate profile not found." });
        const candidateId = candCheck[0].candidateid;

        // 2. Query available assessments for claimed (but unverified) skills
        // We look for CandidateSkills that don't have a passing SkillVerifications record
        const assessments = await query(`
            SELECT 
                ma.assessmentid as assessmentid, 
                ma.skillid as skillid, 
                s.skillname as skillname,
                ma.assessmenttype as assessmenttype, 
                ma.title as title, 
                ma.description as description, 
                ma.timelimit as timelimit, 
                ma.passingscore as passingscore, 
                ma.questionscount as questionscount 
            FROM microassessments ma
            JOIN skills s ON ma.skillid = s.skillid
            JOIN candidateskills cs ON cs.skillid = ma.skillid AND cs.candidateid = ?
            LEFT JOIN skillverifications sv ON sv.candidateid = cs.candidateid AND sv.skillid = cs.skillid AND sv.verificationscore >= ma.passingscore
            WHERE ma.isactive = TRUE AND sv.verificationid IS NULL
        `, [candidateId]);

        res.json(assessments);
    } catch (err) {
        console.error("Error fetching available assessments:", err.message);
        res.status(500).json({ error: "Failed to fetch top assessments." });
    }
});

// ----------------------------------------------------
// [POST] /start
// Starts an assessment attempt, creating a row in AssessmentAttempts
// ----------------------------------------------------
router.post('/start', protect, authorize([3]), async (req, res) => {
    const { assessmentId } = req.body;
    try {
        const userID = req.user.userid;

        const candCheck = await query("SELECT candidateid as candidateid FROM candidates WHERE userid = ?", [userID]);
        if (candCheck.length === 0) return res.status(404).json({ error: "Candidate profile not found." });
        const candidateId = candCheck[0].candidateid;

        // Verify assessment exists
        const assessmentCheck = await query("SELECT * FROM microassessments WHERE assessmentid = ? AND isactive = TRUE", [assessmentId]);
        if (assessmentCheck.length === 0) return res.status(404).json({ error: "Assessment not found or inactive." });

        // Insert new attempt record
        // Using OUTPUT inserted.AttemptID to return the ID directly
        const startResult = await query(`
            INSERT INTO assessmentattempts (candidateid, assessmentid, startedat, ispassed)
            VALUES (?, ?, NOW(), FALSE)
            RETURNING attemptid as attemptid
        `, [candidateId, assessmentId]);

        const attemptId = startResult[0].attemptid;

        res.status(201).json({ success: true, attemptId, assessment: assessmentCheck[0] });
    } catch (err) {
        console.error("Error starting assessment:", err.message);
        res.status(500).json({ error: "Failed to start assessment." });
    }
});

// ----------------------------------------------------
// [POST] /submit
// Completes an attempt, calculates pass/fail, writes to SkillVerifications if passed
// ----------------------------------------------------
router.post('/submit', protect, authorize([3]), async (req, res) => {
    const { attemptId, score, timeSpentSeconds, details } = req.body;
    try {
        const userID = req.user.userid;

        const candCheck = await query("SELECT candidateid as candidateid FROM candidates WHERE userid = ?", [userID]);
        if (candCheck.length === 0) return res.status(404).json({ error: "Candidate profile not found." });
        const candidateId = candCheck[0].candidateid;

        // Ensure attempt exists and belongs to candidate
        const attemptCheck = await query(`
            SELECT a.*, m.passingscore as passingscore, m.skillid as skillid
            FROM assessmentattempts a
            JOIN microassessments m ON a.assessmentid = m.assessmentid
            WHERE a.attemptid = ? AND a.candidateid = ?
        `, [attemptId, candidateId]);

        if (attemptCheck.length === 0) {
            return res.status(404).json({ error: "Assessment attempt not found." });
        }

        const attemptInfo = attemptCheck[0];
        if (attemptInfo.completedat != null) {
            return res.status(400).json({ error: "Assessment already completed." });
        }

        const isPassed = score >= attemptInfo.passingscore;

        // 1. Update the attempts record
        await query(`
            UPDATE assessmentattempts 
            SET completedat = NOW(), score = ?, timespentseconds = ?, ispassed = ?, details = ?
            WHERE attemptid = ?
        `, [score, timeSpentSeconds, isPassed, details, attemptId]);

        // 2. If passed, store it in SkillVerifications
        let verificationId = null;
        if (isPassed) {
            // Upsert / Insert logic for verification
            const verifyInsert = await query(`
                INSERT INTO skillverifications (candidateid, skillid, assessmentid, verificationmethod, verificationscore, verifiedat, isverified)
                VALUES (?, ?, ?, 'CodeTest', ?, NOW(), TRUE)
                RETURNING verificationid as verificationid
            `, [candidateId, attemptInfo.skillid, attemptInfo.assessmentid, score]);

            verificationId = verifyInsert[0].verificationid;
        }

        res.status(200).json({ success: true, isPassed, verificationId });
    } catch (err) {
        console.error("Error submitting assessment:", err.message);
        require('fs').writeFileSync('submit_error.log', JSON.stringify({
            message: err.message,
            stack: err.stack,
            body: req.body,
            id: userID
        }, null, 2));
        res.status(500).json({ error: "Failed to submit assessment.", details: err.message });
    }
});

module.exports = router;
