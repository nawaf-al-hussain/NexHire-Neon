-- ============================================================================
-- Push Notification Triggers for NexHire
-- This script creates triggers to automatically generate notifications
-- when important events occur in the recruitment process
-- ============================================================================

-- ============================================================================
-- Trigger: trg_InterviewScheduled_Notification
-- Creates notification when a new interview is scheduled
-- ============================================================================
IF OBJECT_ID('trg_InterviewScheduled_Notification', 'TR') IS NOT NULL
    DROP TRIGGER trg_InterviewScheduled_Notification;
GO

CREATE TRIGGER trg_InterviewScheduled_Notification
ON InterviewSchedules
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO PushNotifications (UserID, Title, Body, NotificationType, SentAt, DataPayload)
    SELECT 
        c.UserID,
        'Interview Scheduled',
        'Your interview for ' + j.JobTitle + ' has been scheduled for ' 
            + FORMAT(i.InterviewStart, 'MMMM dd, yyyy at h:mm tt'),
        'Interview',
        GETDATE(),
        '{"applicationId": ' + CAST(i.ApplicationID AS VARCHAR) + '}'
    FROM inserted i
    JOIN Applications a ON i.ApplicationID = a.ApplicationID
    JOIN Candidates c ON a.CandidateID = c.CandidateID
    JOIN JobPostings j ON a.JobID = j.JobID;
END;
GO

-- ============================================================================
-- Trigger: trg_ApplicationStatusChanged_Notification
-- Creates notification when application status changes
-- ============================================================================
IF OBJECT_ID('trg_ApplicationStatusChanged_Notification', 'TR') IS NOT NULL
    DROP TRIGGER trg_ApplicationStatusChanged_Notification;
GO

CREATE TRIGGER trg_ApplicationStatusChanged_Notification
ON ApplicationStatusHistory
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO PushNotifications (UserID, Title, Body, NotificationType, SentAt, DataPayload)
    SELECT 
        c.UserID,
        CASE 
            WHEN s.StatusName = 'Interview' THEN 'Interview Invitation'
            WHEN s.StatusName = 'Hired' THEN 'Congratulations! You''re Hired!'
            WHEN s.StatusName = 'Rejected' THEN 'Application Update'
            WHEN s.StatusName = 'Screening' THEN 'Application Under Review'
            ELSE 'Application Update'
        END,
        CASE 
            WHEN s.StatusName = 'Interview' THEN 'Great news! Your application for ' + j.JobTitle + ' has been moved to Interview stage.'
            WHEN s.StatusName = 'Hired' THEN 'Congratulations! You have been hired for ' + j.JobTitle + '!'
            WHEN s.StatusName = 'Rejected' THEN 'Your application for ' + j.JobTitle + ' was not selected this time. Keep applying!'
            WHEN s.StatusName = 'Screening' THEN 'Your application for ' + j.JobTitle + ' is now under review.'
            ELSE 'Your application status for ' + j.JobTitle + ' has been updated to ' + s.StatusName + '.'
        END,
        'StatusUpdate',
        GETDATE(),
        '{"applicationId": ' + CAST(i.ApplicationID AS VARCHAR) + '}'
    FROM inserted i
    JOIN ApplicationStatus s ON i.ToStatusID = s.StatusID
    JOIN Applications a ON i.ApplicationID = a.ApplicationID
    JOIN Candidates c ON a.CandidateID = c.CandidateID
    JOIN JobPostings j ON a.JobID = j.JobID
    WHERE i.ToStatusID IN (2, 3, 4, 5);  -- Screening, Interview, Hired, Rejected
END;
GO

-- ============================================================================
-- Trigger: trg_SkillVerified_Notification
-- Creates notification when a skill is verified
-- ============================================================================
IF OBJECT_ID('trg_SkillVerified_Notification', 'TR') IS NOT NULL
    DROP TRIGGER trg_SkillVerified_Notification;
GO

CREATE TRIGGER trg_SkillVerified_Notification
ON SkillVerifications
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO PushNotifications (UserID, Title, Body, NotificationType, SentAt)
    SELECT 
        c.UserID,
        'Skill Verified!',
        'Your skill "' + s.SkillName + '" has been verified. Your profile just got stronger!',
        'StatusUpdate',
        GETDATE()
    FROM inserted sv
    JOIN Candidates c ON sv.CandidateID = c.CandidateID
    JOIN Skills s ON sv.SkillID = s.SkillID
    WHERE sv.IsVerified = 1;
END;
GO

-- ============================================================================
-- Procedure: sp_NotifyNewJobMatches
-- Creates notification when a new job matches candidate's skills
-- Call this procedure manually or via a scheduled job
-- ============================================================================
IF OBJECT_ID('sp_NotifyNewJobMatches', 'P') IS NOT NULL
    DROP PROCEDURE sp_NotifyNewJobMatches;
GO

CREATE PROCEDURE sp_NotifyNewJobMatches
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Find candidates whose skills match newly posted jobs (last 7 days)
    INSERT INTO PushNotifications (UserID, Title, Body, NotificationType, SentAt, DataPayload)
    SELECT DISTINCT
        c.UserID,
        'New Job Match!',
        'A new job "' + j.JobTitle + '" in ' + j.Location + ' matches your skills. Apply now!',
        'Reminder',
        GETDATE(),
        '{"jobId": ' + CAST(j.JobID AS VARCHAR) + '}'
    FROM JobPostings j
    CROSS APPLY (
        SELECT cs.CandidateID
        FROM CandidateSkills cs
        WHERE cs.ProficiencyLevel >= 5
        AND EXISTS (
            SELECT 1 FROM JobSkills js 
            WHERE js.JobID = j.JobID 
            AND js.SkillID = cs.SkillID
            AND js.IsMandatory = 1
        )
    ) cs_match
    JOIN Candidates c ON cs_match.CandidateID = c.CandidateID
    WHERE j.IsActive = 1 
    AND j.IsDeleted = 0
    AND j.CreatedAt >= DATEADD(DAY, -7, GETDATE())
    AND c.UserID IS NOT NULL
    AND NOT EXISTS (
        SELECT 1 FROM Applications a 
        WHERE a.CandidateID = cs_match.CandidateID 
        AND a.JobID = j.JobID
    );
    
    PRINT 'Job match notifications sent.';
END;
GO

-- ============================================================================
-- Sample data for testing
-- ============================================================================
-- Insert a test notification for a candidate (use actual UserID from your database)
-- INSERT INTO PushNotifications (UserID, Title, Body, NotificationType, SentAt)
-- VALUES (3, 'Welcome to NexHire!', 'Your profile is ready. Start applying for jobs!', 'Message', GETDATE());
GO

PRINT 'Push notification triggers created successfully!';


