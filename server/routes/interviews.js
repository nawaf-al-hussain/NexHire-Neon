const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { protect, authorize } = require('../middleware/rbac');

/**
 * @route   POST /api/interviews/schedule
 * @desc    Schedule a new interview for a candidate application
 * @access  Private (Recruiter)
 */
router.post('/schedule', protect, authorize(2), async (req, res) => {
    const { applicationId, interviewStart, interviewEnd } = req.body;
    const userID = req.user.userid;

    if (!applicationId || !interviewStart || !interviewEnd) {
        return res.status(400).json({ error: "Missing required fields: applicationId, interviewStart, interviewEnd." });
    }

    try {
        // 1. Fetch matching recruiterid from userid
        const recruiterCheck = await query("SELECT recruiterid FROM recruiters WHERE userid = ?", [userID]);
        if (recruiterCheck.length === 0) {
            return res.status(403).json({ error: "Unauthorized. Profile not registered as a valid Recruiter." });
        }

        const recruiterId = recruiterCheck[0].recruiterid;

        // 2. Validate applicationid belongs to a Job posted by this Recruiter/Company
        // Optional strictly enforcing security, but we'll assume the Recruiter ID is good for demo insertion
        const appCheck = await query("SELECT applicationid FROM applications WHERE applicationid = ?", [applicationId]);
        if (appCheck.length === 0) {
            return res.status(404).json({ error: "Application not found." });
        }

        // 3. Use the integrated stored procedure for scheduling
        // This handles timezone conversion and safely returns the identity
        await query(
            "CALL sp_scheduleinterviewwithtimezone($1, $2, $3, $4)",
            [applicationId, recruiterId, interviewStart, interviewEnd]
        );

        // Fetch the most recently created schedule for this application
        const result = await query(
            "SELECT scheduleid FROM interviewschedules WHERE applicationid = $1 ORDER BY scheduleid DESC LIMIT 1",
            [applicationId]
        );

        res.status(201).json({
            success: true,
            message: "Interview scheduled successfully.",
            scheduleId: result[0]?.scheduleid
        });
    } catch (err) {
        console.error("Schedule Interview Error:", err.message);
        res.status(500).json({ error: "Failed to schedule interview." });
    }
});

/**
 * @route   GET /api/interviews
 * @desc    Get all scheduled interviews for the current recruiter
 * @access  Private (Recruiter)
 */
router.get('/', protect, authorize(2), async (req, res) => {
    const userID = req.user.userid;

    try {
        const recruiterCheck = await query("SELECT recruiterid FROM recruiters WHERE userid = ?", [userID]);
        if (recruiterCheck.length === 0) {
            return res.status(403).json({ error: "Unauthorized. Profile not registered as a valid Recruiter." });
        }

        const recruiterId = recruiterCheck[0].recruiterid;

        const interviews = await query(`
            SELECT i.scheduleid, i.interviewstart, i.interviewend, i.candidateconfirmed, 
                   c.fullname as candidatename, j.jobtitle, a.applicationid,
                   CASE WHEN i.interviewstart > NOW() THEN 'Upcoming' ELSE 'Completed' END AS status,
                   EXTRACT(EPOCH FROM (i.interviewend - i.interviewstart))/60 AS duration,
                   'Video Call' AS platform
            FROM interviewschedules i
            JOIN applications a ON i.applicationid = a.applicationid
            JOIN candidates c ON a.candidateid = c.candidateid
            JOIN jobpostings j ON a.jobid = j.jobid
            WHERE i.recruiterid = ?
            ORDER BY i.interviewstart ASC
        `, [recruiterId]);

        res.json(interviews);
    } catch (err) {
        console.error("Fetch Interviews Error:", err.message);
        res.status(500).json({ error: "Failed to fetch interviews." });
    }
});

/**
 * @route   POST /api/interviews/feedback
 * @desc    Submit interview feedback with scores and comments
 * @access  Private (Recruiter)
 * 
 * InterviewFeedback table columns:
 * - FeedbackID (INT, identity)
 * - ApplicationID (INT, FK)
 * - InterviewerID (INT, FK from Users)
 * - TechnicalScore (INT, 1-10)
 * - CommunicationScore (INT, 1-10)
 * - CultureFitScore (INT, 1-10)
 * - Comments (NVARCHAR, optional)
 * - SentimentScore (FLOAT, calculated by trigger)
 * - CreatedAt (DATETIME, default NOW())
 */
router.post('/feedback', protect, authorize(2), async (req, res) => {
    const { applicationId, technicalScore, communicationScore, cultureFitScore, comments } = req.body;
    const userID = req.user.userid;

    // Validate required fields
    // Use explicit null/undefined check rather than !x so a score of 0
    // (not in 1-10 range but still a number) doesn't trigger the missing-field path
    if (applicationId === undefined || applicationId === null ||
        technicalScore === undefined || technicalScore === null ||
        communicationScore === undefined || communicationScore === null ||
        cultureFitScore === undefined || cultureFitScore === null) {
        return res.status(400).json({ error: "Missing required fields: applicationId, technicalScore, communicationScore, cultureFitScore." });
    }

    // Coerce scores to numbers — frontend slider uses parseInt() so they're
    // already numbers, but PostgreSQL / JSON could deliver strings. Number()
    // handles both safely.
    const tScore = Number(technicalScore);
    const cScore = Number(communicationScore);
    const fScore = Number(cultureFitScore);

    // Validate score ranges (1-10) — use Number.isInteger on the coerced value
    const scores = [tScore, cScore, fScore];
    if (scores.some(s => isNaN(s) || s < 1 || s > 10 || !Number.isInteger(s))) {
        return res.status(400).json({
            error: `Scores must be integers between 1 and 10. Received: technical=${technicalScore}, communication=${communicationScore}, cultureFit=${cultureFitScore}.`
        });
    }

    try {
        // Get recruiterid from userid
        const recruiterCheck = await query("SELECT recruiterid, userid FROM recruiters WHERE userid = ?", [userID]);
        if (recruiterCheck.length === 0) {
            console.error("Feedback Error: User not registered as recruiter. UserID:", userID);
            return res.status(403).json({ error: "Unauthorized. Profile not registered as a valid Recruiter." });
        }

        // InterviewerID should be the UserID (not RecruiterID) per the FK constraint
        const interviewerId = recruiterCheck[0].userid;  // Use UserID for InterviewerID FK
        // Feedback submission logged

        // Verify application exists.
        // NOTE: We intentionally do NOT gate on application status here.
        // The VideoInterviews page lists completed interviews (interviewstart < NOW())
        // and lets recruiters submit feedback for them. But the application's
        // statusid may still be 'Screening' (2) because nothing automatically
        // advances it to 'Interview' (3) when an interview is scheduled.
        // Gating on statusid used to 400 these legitimate feedback submissions.
        // If the recruiter conducted an interview and wants to log feedback,
        // we should accept it regardless of what the application status says.
        const appCheck = await query(`
            SELECT a.applicationid, a.statusid, s.statusname
            FROM applications a
            JOIN applicationstatus s ON a.statusid = s.statusid
            WHERE a.applicationid = ?
        `, [applicationId]);

        if (appCheck.length === 0) {
            return res.status(404).json({ error: "Application not found." });
        }

        // Insert feedback - use RETURNING instead of SCOPE_IDENTITY()
        const feedbackResult = await query(`
            INSERT INTO interviewfeedback (applicationid, interviewerid, technicalscore, communicationscore, culturefitscore, comments)
            VALUES (?, ?, ?, ?, ?, ?)
            RETURNING feedbackid
        `, [applicationId, interviewerId, tScore, cScore, fScore, comments || null]);

        const feedbackId = feedbackResult[0].feedbackid;

        console.log("Feedback submitted successfully. FeedbackID:", feedbackId);

        res.status(201).json({
            success: true,
            message: "Interview feedback submitted successfully.",
            feedbackId: feedbackId
        });
    } catch (err) {
        console.error("Submit Feedback Error:", err.message);
        res.status(500).json({ error: "Failed to submit interview feedback." });
    }
});

/**
 * @route   GET /api/interviews/feedback/:applicationId
 * @desc    Get all feedback for a specific application
 * @access  Private (Recruiter)
 */
router.get('/feedback/:applicationId', protect, authorize(2), async (req, res) => {
    const { applicationId } = req.params;

    try {
        const feedback = await query(`
            SELECT f.feedbackid, f.technicalscore, f.communicationscore, f.culturefitscore, 
                   f.comments, f.sentimentscore, f.createdat,
                   u.username as interviewername,
                   c.fullname as candidatename,
                   j.jobtitle
            FROM interviewfeedback f
            JOIN users u ON f.interviewerid = u.userid
            JOIN applications a ON f.applicationid = a.applicationid
            JOIN candidates c ON a.candidateid = c.candidateid
            JOIN jobpostings j ON a.jobid = j.jobid
            WHERE f.applicationid = ?
            ORDER BY f.createdat DESC
        `, [applicationId]);

        // Calculate average scores
        if (feedback.length > 0) {
            const avgScores = feedback.reduce((acc, f) => {
                acc.technical += f.technicalscore;
                acc.communication += f.communicationscore;
                acc.culture += f.culturefitscore;
                return acc;
            }, { technical: 0, communication: 0, culture: 0 });

            const count = feedback.length;
            feedback.averageScores = {
                technical: (avgScores.technical / count).toFixed(1),
                communication: (avgScores.communication / count).toFixed(1),
                cultureFit: (avgScores.culture / count).toFixed(1),
                overall: ((avgScores.technical + avgScores.communication + avgScores.culture) / (count * 3)).toFixed(1)
            };
        }

        res.json(feedback);
    } catch (err) {
        console.error("Fetch Feedback Error:", err.message);
        res.status(500).json({ error: "Failed to fetch interview feedback." });
    }
});

/**
 * @route   POST /api/interviews/transcription
 * @desc    Create a new transcription record for an interview
 * @access  Private (Recruiter)
 * 
 * InterviewTranscriptions table columns (actual):
 * - TranscriptionID (INT, identity)
 * - ScheduleID (INT, FK)
 * - InterviewID (INT, nullable)
 * - AudioFileURL (NVARCHAR)
 * - VideoFileURL (NVARCHAR)
 * - TranscriptionText (NVARCHAR)
 * - SpeakerDiarization (NVARCHAR)
 * - SentimentBySegment (NVARCHAR)
 * - ConfidenceScore (DECIMAL)
 * - ProcessingStatus (VARCHAR)
 * - ProcessedAt (DATETIME)
 * - CreatedAt (DATETIME)
 */
router.post('/transcription', protect, authorize(2), async (req, res) => {
    const { scheduleId, videoFileUrl } = req.body;
    const userID = req.user.userid;

    if (!scheduleId) {
        return res.status(400).json({ error: "Missing required field: scheduleId." });
    }

    try {
        // Verify recruiter
        const recruiterCheck = await query("SELECT recruiterid FROM recruiters WHERE userid = ?", [userID]);
        if (recruiterCheck.length === 0) {
            return res.status(403).json({ error: "Unauthorized. Profile not registered as a valid Recruiter." });
        }

        const recruiterId = recruiterCheck[0].recruiterid;

        // Verify schedule exists
        const scheduleCheck = await query(`
            SELECT i.scheduleid, i.applicationid, c.fullname as candidatename, j.jobtitle
            FROM interviewschedules i
            JOIN applications a ON i.applicationid = a.applicationid
            JOIN candidates c ON a.candidateid = c.candidateid
            JOIN jobpostings j ON a.jobid = j.jobid
            WHERE i.scheduleid = ?
        `, [scheduleId]);

        if (scheduleCheck.length === 0) {
            return res.status(404).json({ error: "Interview schedule not found." });
        }

        // Insert transcription record
        const result = await query(`
            INSERT INTO interviewtranscriptions (scheduleid, audiofileurl, processingstatus)
            VALUES (?, ?, 'Pending')
            RETURNING transcriptionid
        `, [scheduleId, videoFileUrl || null]);

        res.status(201).json({
            success: true,
            message: "Transcription record created. Upload video to process.",
            transcriptionId: result[0].transcriptionid,
            candidateName: scheduleCheck[0].candidatename,
            jobTitle: scheduleCheck[0].jobtitle
        });
    } catch (err) {
        console.error("Create Transcription Error:", err.message);
        res.status(500).json({ error: "Failed to create transcription record." });
    }
});

/**
 * @route   GET /api/interviews/transcription/:scheduleId
 * @desc    Get transcription for a specific interview schedule
 * @access  Private (Recruiter)
 */
router.get('/transcription/:scheduleId', protect, authorize(2), async (req, res) => {
    const { scheduleId } = req.params;

    try {
        const transcription = await query(`
            SELECT t.transcriptionid, t.scheduleid, t.audiofileurl, t.transcriptiontext, 
                   t.speakerdiarization, t.sentimentbysegment, t.confidencescore, t.processingstatus, t.processedat,
                   c.fullname as candidatename, j.jobtitle
            FROM interviewtranscriptions t
            JOIN interviewschedules i ON t.scheduleid = i.scheduleid
            JOIN applications a ON i.applicationid = a.applicationid
            JOIN candidates c ON a.candidateid = c.candidateid
            JOIN jobpostings j ON a.jobid = j.jobid
            WHERE t.scheduleid = ?
            ORDER BY t.processedat DESC
        `, [scheduleId]);

        res.json(transcription);
    } catch (err) {
        console.error("Fetch Transcription Error:", err.message);
        res.status(500).json({ error: "Failed to fetch transcription." });
    }
});

/**
 * @route   POST /api/interviews/transcription/:transcriptionId/process
 * @desc    Process transcription - extract topics, sentiment, filler words (simulated AI)
 * @access  Private (Recruiter)
 */
router.post('/transcription/:transcriptionId/process', protect, authorize(2), async (req, res) => {
    const { transcriptionId } = req.params;
    const { transcriptionText } = req.body;

    if (!transcriptionText) {
        return res.status(400).json({ error: "Missing required field: transcriptionText." });
    }

    try {
        // Simulate AI processing
        const fillerWords = ['um', 'uh', 'like', 'you know', 'basically', 'actually', 'literally'];
        const words = transcriptionText.toLowerCase().split(/\s+/);
        let fillerCount = 0;

        words.forEach(word => {
            if (fillerWords.some(fw => word.includes(fw))) {
                fillerCount++;
            }
        });

        // Extract key topics (simple keyword extraction) - store in SpeakerDiarization
        const jobKeywords = ['javascript', 'react', 'node', 'python', 'sql', 'aws', 'docker', 'kubernetes', 'agile', 'scrum', 'leadership', 'team', 'project', 'management', 'design', 'testing', 'debugging'];
        const foundTopics = jobKeywords.filter(topic => transcriptionText.toLowerCase().includes(topic));
        const keyTopics = foundTopics.length > 0 ? foundTopics.join(', ') : 'General Discussion';

        // Generate action items based on common patterns - we'll add to transcription as notes
        const actionItems = [];
        if (transcriptionText.toLowerCase().includes('follow up')) actionItems.push('Follow up with candidate');
        if (transcriptionText.toLowerCase().includes('schedule')) actionItems.push('Schedule next round');
        if (transcriptionText.toLowerCase().includes('reference')) actionItems.push('Check references');
        if (transcriptionText.toLowerCase().includes('offer')) actionItems.push('Prepare offer');
        if (actionItems.length === 0) actionItems.push('Review candidate fit');

        // Calculate sentiment (simplified)
        const positiveWords = ['great', 'excellent', 'good', 'strong', 'impressive', 'qualified', 'experience', 'skill'];
        const negativeWords = ['concern', 'weak', 'lack', 'problem', 'issue', 'struggle', 'difficult'];

        let sentimentScore = 0;
        positiveWords.forEach(w => { if (transcriptionText.toLowerCase().includes(w)) sentimentScore += 0.1; });
        negativeWords.forEach(w => { if (transcriptionText.toLowerCase().includes(w)) sentimentScore -= 0.1; });
        sentimentScore = Math.max(-1, Math.min(1, sentimentScore));

        // Determine sentiment label
        let sentimentLabel = 'Neutral';
        if (sentimentScore >= 0.5) sentimentLabel = 'Very Positive';
        else if (sentimentScore >= 0.2) sentimentLabel = 'Positive';
        else if (sentimentScore >= -0.2) sentimentLabel = 'Neutral';
        else if (sentimentScore >= -0.5) sentimentLabel = 'Negative';
        else sentimentLabel = 'Very Negative';

        // Build speaker diarization with key topics and action items
        const speakerDiarization = JSON.stringify({
            keyTopics: keyTopics,
            actionItems: actionItems.join('; '),
            fillerWordCount: fillerCount,
            sentiment: sentimentLabel
        });

        // Update transcription record - only use columns that exist in DB
        await query(`
            UPDATE interviewtranscriptions 
            SET transcriptiontext = ?, 
                speakerdiarization = ?,
                sentimentbysegment = ?,
                confidencescore = ?,
                processingstatus = 'Completed',
                processedat = NOW()
            WHERE transcriptionid = ?
        `, [transcriptionText, speakerDiarization, sentimentLabel, parseFloat(sentimentScore.toFixed(2)), transcriptionId]);

        res.json({
            success: true,
            message: "Transcription processed successfully.",
            analysis: {
                keyTopics,
                actionItems: actionItems.join('; '),
                fillerWordCount: fillerCount,
                sentimentScore: sentimentScore.toFixed(2)
            }
        });
    } catch (err) {
        console.error("Process Transcription Error:", err.message);
        res.status(500).json({ error: "Failed to process transcription." });
    }
});

/**
 * @route   POST /api/interviews/generate-questions
 * @desc    Generate interview questions based on job requirements
 * @access  Private (Recruiter)
 */
router.post('/generate-questions', protect, authorize(2), async (req, res) => {
    const { jobId, questionCount, difficultyLevel } = req.body;

    if (!jobId) {
        return res.status(400).json({ error: "Missing required field: jobId." });
    }

    try {
        // Verify recruiter
        const recruiterCheck = await query("SELECT recruiterid FROM recruiters WHERE userid = ?", [req.user.userid]);
        if (recruiterCheck.length === 0) {
            return res.status(403).json({ error: "Unauthorized. Profile not registered as a valid Recruiter." });
        }

        // Verify job exists
        const jobCheck = await query("SELECT jobid, jobtitle, location FROM jobpostings WHERE jobid = ?", [jobId]);
        if (jobCheck.length === 0) {
            return res.status(404).json({ error: "Job not found." });
        }

        const job = jobCheck[0];
        const count = questionCount || 10;
        const difficulty = difficultyLevel || 5;

        // Call the stored procedure with positional parameters
        let questions;
        try {
            questions = await query(
                "CALL sp_generateinterviewquestions($1, $2, $3)",
                [jobId, count, difficulty]
            );
            // After calling the procedure, fetch questions from the table
            const stored = await query('SELECT * FROM ai_generatedquestions WHERE jobid = ? ORDER BY lastused DESC NULLS LAST LIMIT ?', [jobId, count]);
            if (stored.length > 0) questions = stored;
        } catch (spError) {
            console.error("Stored Procedure Error:", spError.message);
            // If stored procedure fails, generate questions dynamically
            const jobSkills = await query(
                "SELECT js.skillid, s.skillname, js.ismandatory FROM jobskills js JOIN skills s ON js.skillid = s.skillid WHERE js.jobid = ? AND js.ismandatory = TRUE",
                [jobId]
            );

            questions = [];

            // Generate technical questions based on job skills
            jobSkills.forEach(skill => {
                questions.push({
                    QuestionType: 'Technical',
                    SkillName: skill.skillname,
                    QuestionText: `Explain your experience with ${skill.skillname} and provide an example project.`,
                    ExpectedKeywords: JSON.stringify(["experience", "project", "implementation", "challenge"]),
                    ScoringGuide: "Assess depth of knowledge, practical application, problem-solving",
                    DifficultyLevel: difficulty,
                    Priority: skill.ismandatory ? 'High Priority' : 'Medium Priority'
                });
            });

            // Add behavioral question
            questions.push({
                QuestionType: 'Behavioral',
                SkillName: 'General',
                QuestionText: "Tell me about a time you faced a significant challenge at work and how you overcame it.",
                ExpectedKeywords: JSON.stringify(["challenge", "action", "result", "learning"]),
                ScoringGuide: "Assess problem-solving, resilience, learning ability",
                DifficultyLevel: difficulty,
                Priority: 'Standard'
            });

            // Add cultural question
            questions.push({
                QuestionType: 'Cultural',
                SkillName: 'Teamwork',
                QuestionText: "Describe your ideal work environment and team dynamics.",
                ExpectedKeywords: JSON.stringify(["collaboration", "communication", "values", "environment"]),
                ScoringGuide: "Assess cultural fit, team compatibility, work preferences",
                DifficultyLevel: difficulty,
                Priority: 'Standard'
            });
        }

        // Handle multiple result sets or single result
        if (!questions || questions.length === 0 || !Array.isArray(questions)) {
            questions = [];
        }

        // Format response
        const formattedQuestions = questions.map(q => ({
            questionType: q.QuestionType,
            skillName: q.SkillName,
            questionText: q.QuestionText,
            expectedKeywords: q.ExpectedKeywords ? (typeof q.ExpectedKeywords === 'string' ? JSON.parse(q.ExpectedKeywords) : q.ExpectedKeywords) : [],
            scoringGuide: q.ScoringGuide,
            difficultyLevel: q.DifficultyLevel,
            priority: q.Priority
        }));

        res.json({
            success: true,
            job: {
                jobId: job.jobid,
                jobTitle: job.jobtitle,
                location: job.location
            },
            questions: formattedQuestions,
            totalQuestions: formattedQuestions.length
        });
    } catch (err) {
        console.error("Generate Questions Error:", err.message);
        res.status(500).json({ error: "Failed to generate interview questions." });
    }
});

/**
 * @route   GET /api/interviews/generated-questions/:jobId
 * @desc    Get previously generated questions for a job
 * @access  Private (Recruiter)
 */
router.get('/generated-questions/:jobId', protect, authorize(2), async (req, res) => {
    const { jobId } = req.params;

    try {
        const questions = await query(`
            SELECT questionid, questiontype, skillid, difficultylevel, questiontext, 
                   expectedanswerkeywords, scoringrubric, usedcount, successrate, 
                   lastused, isactive
            FROM ai_generatedquestions 
            WHERE jobid = ? AND isactive = TRUE
            ORDER BY usedcount DESC, questionid
        `, [jobId]);

        res.json(questions);
    } catch (err) {
        console.error("Fetch Generated Questions Error:", err.message);
        res.status(500).json({ error: "Failed to fetch generated questions." });
    }
});

/**
 * @route   POST /api/interviews/save-question
 * @desc    Save a generated question to the database for reuse
 * @access  Private (Recruiter)
 */
router.post('/save-question', protect, authorize(2), async (req, res) => {
    const { jobId, skillId, questionType, difficultyLevel, questionText, expectedKeywords, scoringRubric } = req.body;

    if (!jobId || !questionType || !questionText) {
        return res.status(400).json({ error: "Missing required fields: jobId, questionType, questionText." });
    }

    try {
        // Verify recruiter
        const recruiterCheck = await query("SELECT recruiterid FROM recruiters WHERE userid = ?", [req.user.userid]);
        if (recruiterCheck.length === 0) {
            return res.status(403).json({ error: "Unauthorized. Profile not registered as a valid Recruiter." });
        }

        // Insert the question
        const result = await query(`
            INSERT INTO ai_generatedquestions (jobid, skillid, questiontype, difficultylevel, questiontext, expectedanswerkeywords, scoringrubric)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            RETURNING questionid
        `, [
            jobId,
            skillId || null,
            questionType,
            difficultyLevel || 5,
            questionText,
            expectedKeywords ? JSON.stringify(expectedKeywords) : null,
            scoringRubric || null
        ]);

        res.status(201).json({
            success: true,
            message: "Question saved successfully.",
            questionId: result[0].questionid
        });
    } catch (err) {
        console.error("Save Question Error:", err.message);
        res.status(500).json({ error: "Failed to save question." });
    }
});

/**
 * @route   POST /api/interviews/optimize-rounds
 * @desc    Optimize interview rounds for a candidate-job pair - reduce redundancy and fatigue
 * @access  Private (Recruiter)
 * 
 * Calls sp_OptimizeInterviewRounds to analyze:
 * - Already assessed skills from candidate's interview history
 * - Redundant questions from InterviewSharedInsights
 * - Required skills from the job
 * 
 * Returns recommendations for optimal interview rounds
 */
router.post('/optimize-rounds', protect, authorize(2), async (req, res) => {
    const { candidateId, jobId } = req.body;
    const userID = req.user.userid;

    if (!candidateId || !jobId) {
        return res.status(400).json({ error: "Missing required fields: candidateId, jobId." });
    }

    try {
        // Verify recruiter
        const recruiterCheck = await query("SELECT recruiterid FROM recruiters WHERE userid = ?", [userID]);
        if (recruiterCheck.length === 0) {
            return res.status(403).json({ error: "Unauthorized. Profile not registered as a valid Recruiter." });
        }

        // Verify candidate exists
        const candidateCheck = await query("SELECT candidateid, fullname FROM candidates WHERE candidateid = ?", [candidateId]);
        if (candidateCheck.length === 0) {
            return res.status(404).json({ error: "Candidate not found." });
        }

        // Verify job exists
        const jobCheck = await query("SELECT jobid, jobtitle FROM jobpostings WHERE jobid = ?", [jobId]);
        if (jobCheck.length === 0) {
            return res.status(404).json({ error: "Job not found." });
        }

        // Call the stored procedure
        let result;
        try {
            result = await query("SELECT * FROM sp_optimizeinterviewrounds($1, $2)", [candidateId, jobId]);
        } catch (spError) {
            console.error("Stored Procedure Error:", spError.message);
            // Return fallback response if procedure fails
            result = [{
                RecommendedInterviewRounds: 2,
                AlreadyAssessedSkills: "None",
                SkillsToAssess: "Check job requirements",
                RedundantQuestionsDetected: 0,
                RedundancyAssessment: "Unable to analyze. No interview history found.",
                SuggestedStructure: "Round 1: Technical | Round 2: Behavioral & Culture",
                EstimatedMinutes: 120,
                TimeSavedMinutes: 0
            }];
        }

        if (result && result.length > 0) {
            res.json({
                success: true,
                candidate: {
                    candidateId: candidateId,
                    candidateName: candidateCheck[0].fullname
                },
                job: {
                    jobId: jobId,
                    jobTitle: jobCheck[0].jobtitle
                },
                optimization: result[0]
            });
        } else {
            res.status(404).json({ error: "Could not generate optimization recommendations." });
        }
    } catch (err) {
        console.error("Optimize Interview Rounds Error:", err.message);
        res.status(500).json({ error: "Failed to optimize interview rounds." });
    }
});

module.exports = router;
