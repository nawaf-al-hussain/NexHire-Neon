const express = require('express');
const cors = require('cors');
const { query, testConnection } = require('./db');

const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

testConnection();

// --- AUTH ---
app.post('/api/login', async (req, res) => {
    const { username } = req.body;
    try {
        const users = await query(`SELECT UserID, Username, RoleID FROM Users WHERE Username = '${username}' AND IsActive = 1`);
        if (users.length > 0) res.json(users[0]);
        else res.status(401).json({ error: "Invalid credentials" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- ADMIN ---
app.get('/api/admin/analytics/funnel', async (req, res) => {
    try { res.json(await query("SELECT * FROM vw_ApplicationFunnel")); } 
    catch (err) { res.status(500).json({ error: err.message }); }
});

// Get Audit Logs (Matches AuditLog table structure)
app.get('/api/admin/audit-logs', async (req, res) => {
    try {
        const data = await query("SELECT TOP 20 * FROM AuditLog ORDER BY ChangedAt DESC");
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- NEW ADMIN ROUTES ---

// 1. Fetch all users for management
app.get('/api/admin/users', async (req, res) => {
    try {
        const users = await query("SELECT UserID, Username, RoleID, IsActive FROM Users ORDER BY RoleID ASC, Username ASC");
        res.json(users);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 2. Toggle User Active Status (Deactivate/Activate)
app.put('/api/admin/users/:userId/toggle', async (req, res) => {
    try {
        await query(`UPDATE Users SET IsActive = CASE WHEN IsActive = 1 THEN 0 ELSE 1 END WHERE UserID = ${req.params.userId}`);
        res.json({ message: "User status updated" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 3. Generic Report Route for the 14+ Views in Flowchart
app.get('/api/admin/reports/:viewName', async (req, res) => {
    const { viewName } = req.params;
    const allowed = [
        'vw_CandidateMatchScore', 'vw_TimeToHire', 'vw_AverageTimeToHire', 
        'vw_HireRatePerJob', 'vw_RecruiterPerformance', 'vw_ApplicationFunnel',
        'vw_Bias_Location', 'vw_Bias_Experience', 'vw_InterviewScoreVsDecision',
        'vw_InterviewerConsistency', 'vw_SkillGapAnalysis', 'vw_CandidateEngagement',
        'vw_HiringBottlenecks', 'vw_RejectionAnalysis', 'vw_VacancyUtilization', 'vw_SilentRejections'
    ];

    if (!allowed.includes(viewName)) return res.status(403).json({ error: "Invalid View" });

    try {
        const results = await query(`SELECT * FROM ${viewName}`);
        res.json(results);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 4. System Maintenance Actions
app.post('/api/admin/maintenance', async (req, res) => {
    const { procedure } = req.body;
    const allowedProcs = ['sp_ArchiveOldData', 'sp_AnonymizeArchivedCandidates', 'sp_AutoRejectUnqualified'];

    if (!allowedProcs.includes(procedure)) return res.status(403).json({ error: "Invalid Procedure" });

    try {
        // We add 'SET NOCOUNT ON;' to prevent the driver from crashing 
        // on "rows affected" messages.
        await query(`SET NOCOUNT ON; EXEC ${procedure}`);
        
        res.json({ 
            success: true, 
            message: `${procedure} executed successfully.` 
        });
    } catch (err) { 
        console.error(`Maintenance Error (${procedure}):`, err.message);
        res.status(500).json({ error: err.message }); 
    }
});
app.post('/api/admin/users/candidate', async (req, res) => {
    const { username, email, password, fullName, location, yearsOfExperience } = req.body;

    // 1. Sanitize inputs to prevent SQL errors from single quotes
    const sUser = username.replace(/'/g, "''");
    const sEmail = email.replace(/'/g, "''");
    const sName = fullName.replace(/'/g, "''");
    const sLoc = location ? location.replace(/'/g, "''") : 'N/A';
    const iExp = yearsOfExperience || 0;

    try {
        // Step A: Insert into Users and get the new ID
        // RoleID 3 is hardcoded for Candidate
        const userResult = await query(`
            INSERT INTO Users (Username, Email, PasswordHash, RoleID, IsActive)
            OUTPUT inserted.UserID
            VALUES ('${sUser}', '${sEmail}', '${password}', 3, 1)
        `);

        const newUserId = userResult[0].UserID;

        // Step B: Use that ID to create the Candidate Profile
        await query(`
            INSERT INTO Candidates (UserID, FullName, Location, YearsOfExperience)
            VALUES (${newUserId}, '${sName}', '${sLoc}', ${iExp})
        `);

        res.json({ success: true, message: "User and Candidate Profile created successfully." });
    } catch (err) {
        console.error("Creation Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/admin/jobs', async (req, res) => {
    try { res.json(await query("SELECT * FROM JobPostings WHERE IsDeleted = 0")); }
    catch (err) { res.status(500).json({ error: err.message }); }
});

// 2. Get all Candidates with their User info
app.get('/api/admin/candidates', async (req, res) => {
    try { res.json(await query("SELECT c.*, u.Email, u.Username FROM Candidates c JOIN Users u ON c.UserID = u.UserID")); }
    catch (err) { res.status(500).json({ error: err.message }); }
});

// 3. Get Applications with Joins (Essential for readability)
app.get('/api/admin/applications-detailed', async (req, res) => {
    const sql = `
        SELECT a.ApplicationID, c.FullName, j.JobTitle, s.StatusName, a.AppliedDate 
        FROM Applications a
        JOIN Candidates c ON a.CandidateID = c.CandidateID
        JOIN JobPostings j ON a.JobID = j.JobID
        JOIN ApplicationStatus s ON a.StatusID = s.StatusID
        WHERE a.IsDeleted = 0`;
    try { res.json(await query(sql)); }
    catch (err) { res.status(500).json({ error: err.message }); }
});

// GET: Fetch all skills
app.get('/api/admin/skills', async (req, res) => {
    // Force the browser not to cache this specific request
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    try {
        const result = await query("SELECT SkillID, SkillName FROM Skills ORDER BY SkillName ASC");
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST: Add a new skill
app.post('/api/admin/skills', async (req, res) => {
    const { SkillName } = req.body;

    if (!SkillName || typeof SkillName !== 'string') {
        return res.status(400).json({ error: "Valid Skill Name is required" });
    }

    try {
        // 1. Sanitize the input manually (Matching your other routes)
        // This prevents the "single quote" crash and basic SQL injection
        const sSkill = SkillName.trim().replace(/'/g, "''");
        
        // 2. Use a standard string instead of the '?' placeholder
        const sql = `INSERT INTO Skills (SkillName) VALUES ('${sSkill}')`; 
        
        await query(sql);
        
        res.status(201).json({ success: true, message: "Skill added" });
    } catch (err) {
        console.error("POST Skills Error:", err);
        
        // Check for the UNIQUE constraint violation (Skill already exists)
        if (err.message.includes('unique') || err.message.includes('duplicate')) {
            return res.status(400).json({ error: "This skill already exists!" });
        }
        
        res.status(500).json({ error: err.message });
    }
});

// Fetch Job Postings Archive
app.get('/api/admin/archives/jobs', async (req, res) => {
    try {
        const data = await query("SELECT * FROM JobPostingsArchive ORDER BY ArchivedAt DESC");
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Fetch Applications Archive (with Joins for readability)
app.get('/api/admin/archives/applications', async (req, res) => {
    try {
        const sql = `
            SELECT aa.*, c.FullName, j.JobTitle, s.StatusName
            FROM ApplicationsArchive aa
            LEFT JOIN Candidates c ON aa.CandidateID = c.CandidateID
            LEFT JOIN JobPostings j ON aa.JobID = j.JobID
            LEFT JOIN ApplicationStatus s ON aa.StatusID = s.StatusID
            ORDER BY aa.ArchivedAt DESC`;
        const data = await query(sql);
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- RECRUITER (Aligned with your JobPostings table) ---
app.get('/api/recruiter/jobs/:userId', async (req, res) => {
    try {
        // Only fetch jobs where IsDeleted is 0 (false)
        const results = await query(`
            SELECT * FROM JobPostings 
            WHERE IsDeleted = 0 
            ORDER BY CreatedAt DESC
        `);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/recruiter/jobs', async (req, res) => {
    const { title, description, location, minExp, vacancies, userId, requirements } = req.body;
    
    const sTitle = title.replace(/'/g, "''");
    const sDesc = description.replace(/'/g, "''");
    const sLoc = location.replace(/'/g, "''");

    try {
        // 1. Using OUTPUT inserted.JobID is much more reliable in Node.js
        const result = await query(`
            INSERT INTO JobPostings (JobTitle, Description, Location, MinExperience, Vacancies, CreatedBy)
            OUTPUT inserted.JobID
            VALUES ('${sTitle}', '${sDesc}', '${sLoc}', ${minExp}, ${vacancies}, ${userId})
        `);

        // 2. Access the JobID from the first row of the result
        const newJobId = result[0].JobID;

        if (requirements && requirements.length > 0) {
            for (const skill of requirements) {
                await query(`
                    INSERT INTO JobSkills (JobID, SkillID, IsMandatory, MinProficiency)
                    VALUES (${newJobId}, ${skill.skillId}, ${skill.isMandatory ? 1 : 0}, ${skill.minProficiency})
                `);
            }
        }

        res.json({ message: "Job and Skills Published Successfully" });
    } catch (err) { 
        console.error(err);
        res.status(500).json({ error: err.message }); 
    }
});

app.get('/api/recruiter/matches/:jobId', async (req, res) => {
    const { jobId } = req.params;

    // We join the Applications table to get the ApplicationID and current Status
    const sql = `
        SELECT 
            a.ApplicationID,
            v.CandidateID,
            v.FullName,
            v.TotalMatchScore,
            v.ExperienceScore,
            v.LocationBonus,
            ast.StatusName,
            a.StatusID,
            (
                SELECT 
                    s.SkillName,
                    js.MinProficiency AS RequiredLevel,
                    ISNULL(cs.ProficiencyLevel, 0) AS CandidateLevel,
                    js.IsMandatory
                FROM JobSkills js
                JOIN Skills s ON js.SkillID = s.SkillID
                LEFT JOIN CandidateSkills cs ON js.SkillID = cs.SkillID 
                     AND cs.CandidateID = v.CandidateID
                WHERE js.JobID = ${jobId}
                FOR JSON PATH
            ) AS SkillsDetails
        FROM vw_CandidateMatchScore v
        JOIN Applications a ON v.CandidateID = a.CandidateID AND v.JobID = a.JobID
        JOIN ApplicationStatus ast ON a.StatusID = ast.StatusID
        WHERE v.JobID = ${jobId}
        ORDER BY v.TotalMatchScore DESC
    `;

    try {
        const results = await query(sql);
        const formatted = results.map(row => ({
            ...row,
            SkillsDetails: JSON.parse(row.SkillsDetails || '[]')
        }));
        res.json(formatted);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch matches." });
    }
});
app.delete('/api/recruiter/jobs/:jobId', async (req, res) => {
    const { jobId } = req.params;
    try {
        // We don't DELETE the row, we just mark it
        await query(`
            UPDATE JobPostings 
            SET IsDeleted = 1, IsActive = 0 
            WHERE JobID = ${jobId}
        `);
        res.json({ message: "Job posting moved to trash (Soft Deleted)." });
    } catch (err) {
        res.status(500).json({ error: "Failed to soft delete: " + err.message });
    }
});

// 1. Fetch only soft-deleted jobs
app.get('/api/recruiter/jobs/archived/:userId', async (req, res) => {
    try {
        const results = await query(`SELECT * FROM JobPostings WHERE IsDeleted = 1 ORDER BY CreatedAt DESC`);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Restore a soft-deleted job
app.put('/api/recruiter/jobs/restore/:jobId', async (req, res) => {
    const { jobId } = req.params;
    try {
        await query(`UPDATE JobPostings SET IsDeleted = 0, IsActive = 1 WHERE JobID = ${jobId}`);
        res.json({ message: "Job restored successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/recruiter/hire', async (req, res) => {
    const { applicationId, userId } = req.body;

    try {
        // 1. Get the RecruiterID for the logged-in User
        const recruiterData = await query(
            `SELECT RecruiterID FROM Recruiters WHERE UserID = ${userId}`
        );

        if (recruiterData.length === 0) {
            return res.status(403).json({ error: "User is not a registered recruiter." });
        }

        const recruiterId = recruiterData[0].RecruiterID;

        // 2. Execute your Stored Procedure
        // Using string interpolation for the query, but in production use parameterized inputs
        await query(`EXEC sp_HireCandidate @ApplicationID = ${applicationId}, @RecruiterID = ${recruiterId}`);

        res.json({ success: true, message: "Candidate successfully hired! Vacancies updated." });
    } catch (err) {
        // The RAISERROR messages from your SQL (like 'No vacancies remaining') 
        // will be caught here in the 'err.message'
        console.error("Hiring Error:", err.message);
        res.status(400).json({ error: err.message });
    }
});

// --- STATE MACHINE: UPDATE APPLICATION STATUS ---
app.put('/api/recruiter/applications/:appId/status', async (req, res) => {
    const { appId } = req.params;
    const { newStatusId, userId, notes } = req.body;

    try {
        // Convert to Number to ensure we aren't passing "undefined" or strings
        const cleanAppId = Number(appId);
        const cleanStatusId = Number(newStatusId);

        if (isNaN(cleanAppId) || isNaN(cleanStatusId)) {
            return res.status(400).json({ error: "Invalid Application or Status ID." });
        }

        const recruiterData = await query(`SELECT RecruiterID FROM Recruiters WHERE UserID = ${Number(userId)}`);
        if (recruiterData.length === 0) return res.status(403).json({ error: "Not authorized." });

        const recruiterId = recruiterData[0].RecruiterID;
        const sNotes = (notes || "").replace(/'/g, "''");

        await query(`
            EXEC sp_UpdateApplicationStatus 
                @ApplicationID = ${cleanAppId}, 
                @NewStatusID = ${cleanStatusId}, 
                @ChangedBy = ${recruiterId}, 
                @Notes = '${sNotes}'
        `);

        res.json({ success: true, message: "Status updated successfully." });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.post('/api/recruiter/interviews', async (req, res) => {
    const { applicationId, recruiterUserId, startTime, endTime } = req.body;

    try {
        // We use string interpolation or parameters for the SP call
        // Note: Ensure your 'query' helper handles parameter escaping
        await query(`
            EXEC sp_ScheduleInterviewWithRecruiter 
                @ApplicationID = ${applicationId}, 
                @RecruiterUserID = ${recruiterUserId}, 
                @StartTime = '${startTime}', 
                @EndTime = '${endTime}'
        `);

        res.json({ success: true, message: "Interview scheduled! Notification queued." });
    } catch (err) {
        // err.message will contain "Scheduling conflict: Recruiter is already booked..." 
        // coming directly from your trg_PreventDoubleBooking RAISERROR
        console.error("Schedule Error:", err.message);
        res.status(400).json({ error: err.message });
    }
});

app.post('/api/recruiter/run-auto-reject', async (req, res) => {
    try {
        // This will still run the global cleanup for any existing rows
        await query("EXEC sp_AutoRejectUnqualified");
        
        res.json({ 
            success: true, 
            message: "Real-time triggers are active. Manual cleanup of existing data complete." 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/recruiter/summary/:userId', async (req, res) => {
    try {
        const stats = await query(`
            SELECT 
                (SELECT COUNT(*) FROM JobPostings WHERE CreatedBy = ${req.params.userId} AND IsDeleted = 0) as ActiveJobs,
                (SELECT COUNT(*) FROM Applications a 
                 JOIN JobPostings jp ON a.JobID = jp.JobID 
                 WHERE jp.CreatedBy = ${req.params.userId} AND a.StatusID = 1) as NewApplications,
                (SELECT COUNT(*) FROM InterviewSchedules i 
                 JOIN Recruiters r ON i.RecruiterID = r.RecruiterID
                 WHERE r.UserID = ${req.params.userId} 
                 AND CAST(i.InterviewStart AS DATE) = CAST(GETDATE() AS DATE)) as InterviewsToday
        `);
        res.json(stats[0] || { ActiveJobs: 0, NewApplications: 0, InterviewsToday: 0 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/recruiter/schedule/today/:userId', async (req, res) => {
    try {
        const schedule = await query(`
            SELECT 
                i.InterviewID,
                i.InterviewStart,
                i.InterviewEnd,
                c.FullName as CandidateName,
                jp.JobTitle,
                a.ApplicationID
            FROM InterviewSchedules i
            JOIN Recruiters r ON i.RecruiterID = r.RecruiterID
            JOIN Applications a ON i.ApplicationID = a.ApplicationID
            JOIN Candidates c ON a.CandidateID = c.CandidateID
            JOIN JobPostings jp ON a.JobID = jp.JobID
            WHERE r.UserID = ${req.params.userId}
            AND CAST(i.InterviewStart AS DATE) = CAST(GETDATE() AS DATE)
            ORDER BY i.InterviewStart ASC
        `);
        res.json(schedule);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- CANDIDATE & SHARED ---
app.get('/api/jobs', async (req, res) => {
    try { res.json(await query("SELECT * FROM JobPostings WHERE IsActive = 1 AND IsDeleted = 0")); } 
    catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/skills', async (req, res) => {
    try { res.json(await query("SELECT * FROM Skills ORDER BY SkillName")); } 
    catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/candidate/profile/:userId', async (req, res) => {
    try {
        const profile = await query(`SELECT * FROM Candidates WHERE UserID = ${req.params.userId}`);
        const skills = await query(`
            SELECT s.SkillID, s.SkillName, cs.ProficiencyLevel 
            FROM CandidateSkills cs 
            JOIN Skills s ON cs.SkillID = s.SkillID 
            WHERE cs.CandidateID = (SELECT CandidateID FROM Candidates WHERE UserID = ${req.params.userId})
        `);
        res.json({ ...profile[0], skills });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/candidate/profile', async (req, res) => {
    const { userId, location, yearsOfExperience } = req.body;
    try {
        await query(`
            UPDATE Candidates 
            SET Location = '${location}', YearsOfExperience = ${yearsOfExperience} 
            WHERE UserID = ${userId}
        `);
        res.json({ message: "Profile updated" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/candidate/skills', async (req, res) => {
    const { userId, skillId, proficiency } = req.body;
    try {
        const cand = await query(`SELECT CandidateID FROM Candidates WHERE UserID = ${userId}`);
        const cid = cand[0].CandidateID;
        // Upsert logic for skills
        await query(`DELETE FROM CandidateSkills WHERE CandidateID = ${cid} AND SkillID = ${skillId}`);
        await query(`INSERT INTO CandidateSkills (CandidateID, SkillID, ProficiencyLevel) VALUES (${cid}, ${skillId}, ${proficiency})`);
        res.json({ message: "Skill updated" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/apply', async (req, res) => {
    const { jobId, userId } = req.body;
    try {
        const cand = await query(`SELECT CandidateID FROM Candidates WHERE UserID = ${userId}`);
        await query(`INSERT INTO Applications (JobID, CandidateID, StatusID) VALUES (${jobId}, ${cand[0].CandidateID}, 1)`);
        res.json({ message: "Applied Successfully!" });
    } catch (err) { res.status(500).json({ error: "Already applied or DB error." }); }
});

app.get('/api/candidate/apps/:userId', async (req, res) => {
    try {
        const data = await query(`
            SELECT a.ApplicationID, a.JobID, j.JobTitle, s.StatusName, a.AppliedDate 
            FROM Applications a 
            JOIN JobPostings j ON a.JobID = j.JobID 
            JOIN ApplicationStatus s ON a.StatusID = s.StatusID
            WHERE a.CandidateID = (SELECT CandidateID FROM Candidates WHERE UserID = ${req.params.userId})
            AND a.IsDeleted = 0
        `);
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/withdraw', async (req, res) => {
    const { appId, userId } = req.body;
    try {
        const cand = await query(`SELECT CandidateID FROM Candidates WHERE UserID = ${userId}`);
        const cid = cand[0].CandidateID;

        // Add 'SET NOCOUNT ON' to prevent SQL from sending extra 'rows affected' messages 
        // that can confuse the Node.js driver.
        await query(`SET NOCOUNT ON; EXEC sp_WithdrawApplication @ApplicationID = ${appId}, @CandidateID = ${cid}, @Reason = 'User Withdrawn'`);
        
        res.json({ success: true, message: "Withdrawn successfully" });
    } catch (err) { 
        console.error("Withdraw error:", err.message);
        res.status(400).json({ error: err.message }); 
    }
});

// 1. Get Job Recommendations with Match Scores
app.get('/api/candidate/recommendations/:userId', async (req, res) => {
    try {
        const sql = `
            SELECT j.*, v.TotalMatchScore 
            FROM JobPostings j
            CROSS JOIN (SELECT CandidateID FROM Candidates WHERE UserID = ${req.params.userId}) c
            LEFT JOIN vw_CandidateMatchScore v ON v.JobID = j.JobID AND v.CandidateID = c.CandidateID
            WHERE j.IsActive = 1 AND j.IsDeleted = 0
            ORDER BY ISNULL(v.TotalMatchScore, 0) DESC`;
        const results = await query(sql);
        res.json(results);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 2. Manage Documents (Fetching)
app.get('/api/candidate/documents/:userId', async (req, res) => {
    try {
        const cand = await query(`SELECT CandidateID FROM Candidates WHERE UserID = ${req.params.userId}`);
        const docs = await query(`SELECT * FROM CandidateDocuments WHERE CandidateID = ${cand[0].CandidateID}`);
        res.json(docs);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/candidate/skill-gap/:jobId/:userId', async (req, res) => {
    const { jobId, userId } = req.params;
    try {
        const sql = `
            SELECT 
                s.SkillName,
                js.MinProficiency AS RequiredLevel,
                js.IsMandatory,
                ISNULL(cs.ProficiencyLevel, 0) AS CandidateLevel,
                CASE 
                    WHEN ISNULL(cs.ProficiencyLevel, 0) >= js.MinProficiency THEN 'Met'
                    WHEN ISNULL(cs.ProficiencyLevel, 0) > 0 THEN 'Improve'
                    ELSE 'Missing'
                END AS Status
            FROM JobSkills js
            JOIN Skills s ON js.SkillID = s.SkillID
            LEFT JOIN CandidateSkills cs ON js.SkillID = cs.SkillID 
                AND cs.CandidateID = (SELECT CandidateID FROM Candidates WHERE UserID = ${userId})
            WHERE js.JobID = ${jobId}
        `;
        const gapData = await query(sql);
        res.json(gapData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 1. Get all scheduled interviews for a candidate
app.get('/api/candidate/interviews/:userId', async (req, res) => {
    try {
        const sql = `
            SELECT * FROM vw_CandidateInterviews 
            WHERE UserID = ${req.params.userId} 
            ORDER BY InterviewStart ASC
        `;
        const data = await query(sql);
        res.json(data);
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// 2. Confirm an interview (BIT update)
app.put('/api/candidate/interviews/confirm', async (req, res) => {
    const { scheduleId, userId } = req.body;

    try {
        // Ensure inputs are numbers to prevent basic injection
        const sId = Number(scheduleId);
        const uId = Number(userId);

        if (!sId || !uId) {
            return res.status(400).json({ error: "Missing Schedule or User information." });
        }

        await query(`EXEC sp_ConfirmInterview @ScheduleID = ${sId}, @UserID = ${uId}`);
        
        res.json({ success: true, message: "Interview confirmed!" });
    } catch (err) {
        // This will catch the RAISERROR from SQL if the IDs don't match
        console.error("Confirmation Error:", err.message);
        res.status(403).json({ error: err.message });
    }
});

app.listen(5000, () => console.log(`🚀 Server on http://localhost:5000`));