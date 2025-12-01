-- RECRUITMENT DATABASE - COMPLETE VIEWS CREATION SCRIPT
-- ============================================================

-- 1. vw_CandidateMatchScore - Weighted Candidate Matching Score
CREATE VIEW vw_CandidateMatchScore AS
SELECT
    a.ApplicationID,
    c.CandidateID,
    c.FullName,
    j.JobID,
    j.JobTitle,
    SUM(cs.ProficiencyLevel) AS SkillScore,
    c.YearsOfExperience * 2 AS ExperienceScore,
    CASE WHEN c.Location = j.Location THEN 10 ELSE 0 END AS LocationBonus,
    SUM(cs.ProficiencyLevel) + (c.YearsOfExperience * 2) + 
    CASE WHEN c.Location = j.Location THEN 10 ELSE 0 END AS TotalMatchScore
FROM Candidates c
JOIN Applications a ON c.CandidateID = a.CandidateID
JOIN JobPostings j ON a.JobID = j.JobID
JOIN CandidateSkills cs ON c.CandidateID = cs.CandidateID
JOIN JobSkills js ON cs.SkillID = js.SkillID AND js.JobID = j.JobID
WHERE cs.ProficiencyLevel >= js.MinProficiency
  AND a.IsDeleted = 0
GROUP BY a.ApplicationID, c.CandidateID, c.FullName, c.YearsOfExperience, c.Location, j.JobID, j.JobTitle, j.Location
HAVING
    COUNT(CASE WHEN js.IsMandatory = 1 THEN 1 END) = 
    (SELECT COUNT(*) FROM JobSkills WHERE JobID = j.JobID AND IsMandatory = 1);

-- 2. vw_CandidateInterviews - Candidate Interviews
CREATE VIEW vw_CandidateInterviews AS
SELECT 
    c.UserID,
    i.ScheduleID,
    j.JobTitle,
    j.Location AS JobLocation,
    u.Username AS RecruiterName,
    i.InterviewStart,
    i.InterviewEnd,
    i.CandidateConfirmed,
    CASE 
        WHEN i.InterviewStart < GETDATE() THEN 'Past'
        ELSE 'Upcoming'
    END AS TimeStatus
FROM InterviewSchedules i
JOIN Applications a ON i.ApplicationID = a.ApplicationID
JOIN JobPostings j ON a.JobID = j.JobID
JOIN Candidates c ON a.CandidateID = c.CandidateID
JOIN Recruiters r ON i.RecruiterID = r.RecruiterID
JOIN Users u ON r.UserID = u.UserID
WHERE a.IsDeleted = 0;

-- 3. vw_TimeToHire - Time to Hire
CREATE VIEW vw_TimeToHire AS
SELECT
    a.ApplicationID,
    c.FullName AS CandidateName,
    j.JobTitle,
    a.AppliedDate,
    h.ChangedAt AS HiredDate,
    DATEDIFF(DAY, a.AppliedDate, h.ChangedAt) AS DaysToHire,
    'Hired' AS ApplicationStatus,
    'Direct' AS Source
FROM Applications a
JOIN Candidates c ON a.CandidateID = c.CandidateID
JOIN JobPostings j ON a.JobID = j.JobID
JOIN ApplicationStatusHistory h ON a.ApplicationID = h.ApplicationID
WHERE h.ToStatusID = (SELECT StatusID FROM ApplicationStatus WHERE StatusName = 'Hired');

-- 4. vw_AverageTimeToHire - Average Time to Hire
CREATE VIEW vw_AverageTimeToHire AS
SELECT AVG(CAST(DaysToHire AS FLOAT)) AS AvgDaysToHire
FROM vw_TimeToHire;

-- 5. vw_HireRatePerJob - Hire Rate Per Job
CREATE VIEW vw_HireRatePerJob AS
SELECT
    j.JobID,
    j.JobTitle,
    COUNT(a.ApplicationID) AS TotalApplications,
    SUM(CASE WHEN s.StatusName = 'Hired' THEN 1 ELSE 0 END) AS Hires,
    CAST(SUM(CASE WHEN s.StatusName = 'Hired' THEN 1 ELSE 0 END) * 100.0 / 
         NULLIF(COUNT(a.ApplicationID), 0) AS DECIMAL(5,2)) AS HireRatePercent
FROM JobPostings j
LEFT JOIN Applications a ON j.JobID = a.JobID
LEFT JOIN ApplicationStatus s ON a.StatusID = s.StatusID
GROUP BY j.JobID, j.JobTitle;

-- 6. vw_RecruiterPerformance - Recruiter Performance
CREATE VIEW vw_RecruiterPerformance AS
SELECT
    r.RecruiterID,
    u.Username AS RecruiterName,
    COUNT(DISTINCT i.ScheduleID) AS InterviewsConducted,
    SUM(CASE WHEN s.StatusName = 'Hired' THEN 1 ELSE 0 END) AS SuccessfulHires
FROM Recruiters r
JOIN Users u ON r.UserID = u.UserID
LEFT JOIN InterviewSchedules i ON r.RecruiterID = i.RecruiterID
LEFT JOIN Applications a ON i.ApplicationID = a.ApplicationID
LEFT JOIN ApplicationStatus s ON a.StatusID = s.StatusID
GROUP BY r.RecruiterID, u.Username;

-- 7. vw_ApplicationFunnel - Application Funnel Analysis
CREATE VIEW vw_ApplicationFunnel AS
SELECT
    s.StatusName,
    COUNT(a.ApplicationID) AS ApplicationCount
FROM ApplicationStatus s
LEFT JOIN Applications a ON s.StatusID = a.StatusID
WHERE a.IsDeleted = 0 OR a.ApplicationID IS NULL
GROUP BY s.StatusName;

-- 8. vw_Bias_Location - Bias Detection: Location
CREATE VIEW vw_Bias_Location AS
SELECT
    c.Location,
    COUNT(a.ApplicationID) AS TotalApplicants,
    SUM(CASE WHEN s.StatusName = 'Hired' THEN 1 ELSE 0 END) AS HiredCount,
    CAST(SUM(CASE WHEN s.StatusName = 'Hired' THEN 1 ELSE 0 END) * 100.0 / 
         NULLIF(COUNT(a.ApplicationID), 0) AS DECIMAL(5,2)) AS HireRatePercent
FROM Applications a
JOIN Candidates c ON a.CandidateID = c.CandidateID
JOIN ApplicationStatus s ON a.StatusID = s.StatusID
WHERE a.IsDeleted = 0
GROUP BY c.Location;

-- 9. vw_Bias_Experience - Bias Detection: Experience
CREATE VIEW vw_Bias_Experience AS
SELECT
    CASE
        WHEN c.YearsOfExperience < 2 THEN 'Junior'
        WHEN c.YearsOfExperience BETWEEN 2 AND 5 THEN 'Mid'
        ELSE 'Senior'
    END AS ExperienceGroup,
    COUNT(*) AS TotalApplicants,
    SUM(CASE WHEN s.StatusName = 'Hired' THEN 1 ELSE 0 END) AS HiredCount,
    CAST(SUM(CASE WHEN s.StatusName = 'Hired' THEN 1 ELSE 0 END) * 100.0 / 
         NULLIF(COUNT(*), 0) AS DECIMAL(5,2)) AS HireRatePercent
FROM Applications a
JOIN Candidates c ON a.CandidateID = c.CandidateID
JOIN ApplicationStatus s ON a.StatusID = s.StatusID
WHERE a.IsDeleted = 0
GROUP BY CASE
    WHEN c.YearsOfExperience < 2 THEN 'Junior'
    WHEN c.YearsOfExperience BETWEEN 2 AND 5 THEN 'Mid'
    ELSE 'Senior'
END;

-- 10. vw_InterviewScoreVsDecision - Interview Score vs Final Decision
CREATE VIEW vw_InterviewScoreVsDecision AS
SELECT
    f.ApplicationID,
    c.FullName,
    AVG((f.TechnicalScore + f.CommunicationScore + f.CultureFitScore) / 3.0) AS AvgInterviewScore,
    s.StatusName AS FinalStatus
FROM InterviewFeedback f
JOIN Applications a ON f.ApplicationID = a.ApplicationID
JOIN Candidates c ON a.CandidateID = c.CandidateID
JOIN ApplicationStatus s ON a.StatusID = s.StatusID
GROUP BY f.ApplicationID, c.FullName, s.StatusName;

-- 11. vw_InterviewerConsistency - Interviewer Consistency Score
CREATE VIEW vw_InterviewerConsistency AS
SELECT
    f.InterviewerID,
    u.Username AS InterviewerName,
    COUNT(*) AS InterviewsTaken,
    AVG((f.TechnicalScore + f.CommunicationScore + f.CultureFitScore) / 3.0) AS AvgScoreGiven,
    STDEV((f.TechnicalScore + f.CommunicationScore + f.CultureFitScore) / 3.0) AS ScoreVariance
FROM InterviewFeedback f
JOIN Users u ON f.InterviewerID = u.UserID
GROUP BY f.InterviewerID, u.Username;

-- 12. vw_SkillGapAnalysis - Skill Gap Analysis
CREATE VIEW vw_SkillGapAnalysis AS
SELECT
    s.SkillName,
    COUNT(DISTINCT js.JobID) AS JobsRequiringSkill,
    COUNT(DISTINCT cs.CandidateID) AS CandidatesWithSkill,
    COUNT(DISTINCT js.JobID) - COUNT(DISTINCT cs.CandidateID) AS SkillGap
FROM Skills s
LEFT JOIN JobSkills js ON s.SkillID = js.SkillID
LEFT JOIN CandidateSkills cs ON s.SkillID = cs.SkillID
GROUP BY s.SkillName;

-- 13. vw_CandidateEngagement - Candidate Engagement Score
CREATE VIEW vw_CandidateEngagement AS
SELECT
    c.CandidateID,
    c.FullName,
    COUNT(i.ScheduleID) AS InterviewsScheduled,
    SUM(CASE WHEN i.CandidateConfirmed = 1 THEN 1 ELSE 0 END) AS ConfirmedInterviews,
    CAST(SUM(CASE WHEN i.CandidateConfirmed = 1 THEN 1 ELSE 0 END) * 100.0 / 
         NULLIF(COUNT(i.ScheduleID), 0) AS DECIMAL(5,2)) AS EngagementRate
FROM Candidates c
LEFT JOIN Applications a ON c.CandidateID = a.CandidateID
LEFT JOIN InterviewSchedules i ON a.ApplicationID = i.ApplicationID
GROUP BY c.CandidateID, c.FullName;

-- 14. vw_HiringBottlenecks - Hiring Bottleneck Detection
CREATE VIEW vw_HiringBottlenecks AS
SELECT
    s.StatusName,
    COUNT(a.ApplicationID) AS ApplicationsInStage,
    AVG(DATEDIFF(DAY, a.AppliedDate, ISNULL(a.StatusChangedAt, GETDATE()))) AS AvgDaysInStage
FROM ApplicationStatus s
LEFT JOIN Applications a ON s.StatusID = a.StatusID
WHERE a.IsDeleted = 0 OR a.ApplicationID IS NULL
GROUP BY s.StatusName;

-- 15. vw_RejectionAnalysis - Rejection Reason Analysis
CREATE VIEW vw_RejectionAnalysis AS
SELECT
    a.RejectionReason,
    COUNT(*) AS RejectionCount,
    CAST(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM Applications WHERE StatusID = 5) AS DECIMAL(5,2)) AS RejectionPercent
FROM Applications a
WHERE a.StatusID = 5
  AND a.RejectionReason IS NOT NULL
  AND a.IsDeleted = 0
GROUP BY a.RejectionReason;

-- 16. vw_VacancyUtilization - Vacancy Utilization
CREATE VIEW vw_VacancyUtilization AS
SELECT
    j.JobID,
    j.JobTitle,
    j.Description,
    j.Location,
    j.MinExperience,
    j.Vacancies,
    j.IsActive,
    j.CreatedAt,
    COUNT(a.ApplicationID) AS ApplicationCount,
    SUM(CASE WHEN s.StatusName = 'Hired' THEN 1 ELSE 0 END) AS FilledPositions
FROM JobPostings j
LEFT JOIN Applications a ON j.JobID = a.JobID AND a.IsDeleted = 0
LEFT JOIN ApplicationStatus s ON a.StatusID = s.StatusID
WHERE j.IsDeleted = 0
GROUP BY j.JobID, j.JobTitle, j.Description, j.Location, j.MinExperience, j.Vacancies, j.IsActive, j.CreatedAt;

-- 17. vw_SilentRejections - Silent Rejection Detector
CREATE VIEW vw_SilentRejections AS
SELECT
    a.ApplicationID,
    c.FullName,
    s.StatusName,
    DATEDIFF(DAY, a.AppliedDate, GETDATE()) AS DaysInactive,
    j.JobTitle
FROM Applications a
JOIN Candidates c ON a.CandidateID = c.CandidateID
JOIN ApplicationStatus s ON a.StatusID = s.StatusID
JOIN JobPostings j ON a.JobID = j.JobID
WHERE s.StatusName NOT IN ('Hired', 'Rejected', 'Withdrawn')
  AND DATEDIFF(DAY, a.AppliedDate, GETDATE()) > 30
  AND a.IsDeleted = 0;

-- 18. vw_GhostingRiskDashboard - Ghosting Risk Dashboard
CREATE VIEW vw_GhostingRiskDashboard AS
SELECT 
    a.ApplicationID,
    a.CandidateID,
    c.FullName AS CandidateName,
    j.JobTitle,
    u.Username AS RecruiterName,
    ISNULL(gp_c.GhostingScore, 0) AS CandidateGhostingScore,
    ISNULL(gp_r.GhostingScore, 0) AS RecruiterGhostingScore,
    (ISNULL(gp_c.GhostingScore, 0) + ISNULL(gp_r.GhostingScore, 0)) / 2.0 AS OverallRiskScore,
    ISNULL(cl.AvgResponseTime, 0) AS AvgResponseTime,
    ISNULL(cl.TotalCommunications, 0) AS TotalCommunications,
    CASE 
        WHEN ISNULL(gp_c.GhostingScore, 0) >= 7 OR ISNULL(gp_r.GhostingScore, 0) >= 7 THEN 'High'
        WHEN ISNULL(gp_c.GhostingScore, 0) >= 5 OR ISNULL(gp_r.GhostingScore, 0) >= 5 THEN 'Medium'
        ELSE 'Low'
    END AS OverallRiskLevel,
    a.StatusID,
    s.StatusName,
    DATEDIFF(DAY, a.AppliedDate, GETDATE()) AS DaysSinceApplication
FROM Applications a
JOIN Candidates c ON a.CandidateID = c.CandidateID
JOIN JobPostings j ON a.JobID = j.JobID
JOIN Users u ON j.CreatedBy = u.UserID
JOIN ApplicationStatus s ON a.StatusID = s.StatusID
LEFT JOIN (
    SELECT UserID, AVG(GhostingScore) AS GhostingScore
    FROM GhostingPatterns 
    WHERE UserType = 'Candidate'
    GROUP BY UserID
) gp_c ON c.UserID = gp_c.UserID
LEFT JOIN (
    SELECT UserID, AVG(GhostingScore) AS GhostingScore
    FROM GhostingPatterns 
    WHERE UserType = 'Recruiter'
    GROUP BY UserID
) gp_r ON j.CreatedBy = gp_r.UserID
LEFT JOIN (
    SELECT 
        ApplicationID,
        AVG(DATEDIFF(HOUR, SentAt, RespondedAt)) AS AvgResponseTime,
        COUNT(*) AS TotalCommunications
    FROM CommunicationLogs
    WHERE RespondedAt IS NOT NULL
    GROUP BY ApplicationID
) cl ON a.ApplicationID = cl.ApplicationID
WHERE a.IsDeleted = 0;

-- 19. vw_SalaryTransparency - Salary Transparency
CREATE VIEW vw_SalaryTransparency AS
SELECT 
    j.JobID,
    j.JobTitle,
    j.Location,
    j.MinExperience,
    jsr.MinSalary,
    jsr.MaxSalary,
    jsr.Currency,
    jsr.IsTransparent,
    sb.AvgSalary AS MarketAverage,
    sb.Percentile25 AS Market25th,
    sb.Percentile75 AS Market75th,
    CASE 
        WHEN jsr.MinSalary IS NULL THEN 'Not Disclosed'
        WHEN jsr.MaxSalary IS NULL THEN 'Range Not Complete'
        WHEN jsr.IsTransparent = 1 THEN 'Fully Transparent'
        ELSE 'Partially Transparent'
    END AS TransparencyLevel,
    CAST(COUNT(a.ApplicationID) AS DECIMAL) / NULLIF(j.Vacancies, 0) AS ApplicationsPerVacancy,
    AVG(DATEDIFF(DAY, a.AppliedDate, GETDATE())) AS AvgDaysOpen
FROM JobPostings j
LEFT JOIN JobSalaryRanges jsr ON j.JobID = jsr.JobID
LEFT JOIN SalaryBenchmarks sb ON sb.JobTitle = j.JobTitle 
    AND sb.Location = j.Location
    AND sb.ExperienceRange = CASE 
        WHEN j.MinExperience < 2 THEN 'Entry'
        WHEN j.MinExperience < 5 THEN 'Junior'
        WHEN j.MinExperience < 10 THEN 'Mid'
        ELSE 'Senior'
    END
LEFT JOIN Applications a ON j.JobID = a.JobID AND a.IsDeleted = 0
WHERE j.IsActive = 1 AND j.IsDeleted = 0
GROUP BY j.JobID, j.JobTitle, j.Location, j.MinExperience, j.Vacancies,
         jsr.MinSalary, jsr.MaxSalary, jsr.Currency, jsr.IsTransparent,
         sb.AvgSalary, sb.Percentile25, sb.Percentile75;

-- 20. vw_SkillVerificationStatus - Skill Verification Status
CREATE VIEW vw_SkillVerificationStatus AS
SELECT 
    c.CandidateID,
    c.FullName,
    s.SkillName,
    cs.ProficiencyLevel AS ClaimedLevel,
    sv.VerificationScore,
    sv.VerificationMethod,
    sv.VerifiedAt,
    sv.ExpiryDate,
    sv.ConfidenceLevel,
    CASE 
        WHEN sv.VerificationScore >= 80 THEN 'Verified (High)'
        WHEN sv.VerificationScore >= 60 THEN 'Verified (Medium)'
        WHEN sv.VerificationScore IS NULL THEN 'Not Verified'
        ELSE 'Verification Failed'
    END AS VerificationStatus,
    DATEDIFF(MONTH, sv.VerifiedAt, GETDATE()) AS MonthsSinceVerification,
    CASE 
        WHEN sv.ExpiryDate IS NULL OR sv.ExpiryDate > GETDATE() THEN 'Valid'
        ELSE 'Expired'
    END AS ValidityStatus
FROM Candidates c
JOIN CandidateSkills cs ON c.CandidateID = cs.CandidateID
JOIN Skills s ON cs.SkillID = s.SkillID
LEFT JOIN SkillVerifications sv ON c.CandidateID = sv.CandidateID 
    AND cs.SkillID = sv.SkillID;

-- 21. vw_DiversityAnalyticsFunnel - Diversity Analytics Funnel
CREATE VIEW vw_DiversityAnalyticsFunnel AS
SELECT 
    dm.Gender,
    dm.Ethnicity,
    dm.EducationLevel,
    dm.CareerGapMonths,
    COUNT(DISTINCT a.ApplicationID) AS TotalApplications,
    SUM(CASE WHEN a.StatusID >= 2 THEN 1 ELSE 0 END) AS Screened,
    SUM(CASE WHEN a.StatusID >= 3 THEN 1 ELSE 0 END) AS Interviewed,
    SUM(CASE WHEN a.StatusID = 4 THEN 1 ELSE 0 END) AS Hired,
    SUM(CASE WHEN a.StatusID = 5 THEN 1 ELSE 0 END) AS Rejected,
    CAST(SUM(CASE WHEN a.StatusID = 4 THEN 1 ELSE 0 END) * 100.0 / 
         NULLIF(COUNT(DISTINCT a.ApplicationID), 0) AS DECIMAL(5,2)) AS HireRate,
    AVG(DATEDIFF(DAY, a.AppliedDate, 
        CASE WHEN a.StatusID = 4 THEN a.StatusChangedAt ELSE GETDATE() END)) AS AvgDaysInProcess
FROM DiversityMetrics dm
JOIN Applications a ON dm.ApplicationID = a.ApplicationID
WHERE dm.AnonymizedHash IS NOT NULL
    AND a.IsDeleted = 0
GROUP BY dm.Gender, dm.Ethnicity, dm.EducationLevel, dm.CareerGapMonths
HAVING COUNT(DISTINCT a.ApplicationID) >= 3;

-- 22. vw_RemoteCompatibilityMatrix - Remote Compatibility Matrix
CREATE VIEW vw_RemoteCompatibilityMatrix AS
SELECT 
    c.CandidateID,
    c.FullName,
    c.Location AS CandidateLocation,
    rc.OverallRemoteScore,
    rc.WorkspaceQuality,
    rc.TimezoneAlignment,
    rc.CommunicationPreference,
    rc.DistractionResistance,
    rc.SelfMotivationScore,
    rc.PreviousRemoteExperienceMonths,
    j.JobID,
    j.JobTitle,
    j.Location AS JobLocation,
    crp.RemoteOnboardingScore AS CompanyRemoteScore,
    crp.AsyncWorkPercentage,
    crp.MeetingCulture,
    crp.TechProvided,
    toa.OverlapHours,
    toa.OverlapScore,
    CASE 
        WHEN rc.OverallRemoteScore >= 8 AND crp.RemoteOnboardingScore >= 7 THEN 'Excellent Match'
        WHEN rc.OverallRemoteScore >= 6 AND crp.RemoteOnboardingScore >= 5 THEN 'Good Match'
        WHEN rc.OverallRemoteScore >= 4 AND crp.RemoteOnboardingScore >= 3 THEN 'Moderate Match'
        ELSE 'Poor Match'
    END AS CompatibilityAssessment
FROM Candidates c
JOIN RemoteCompatibility rc ON c.CandidateID = rc.CandidateID
JOIN Applications a ON c.CandidateID = a.CandidateID
JOIN JobPostings j ON a.JobID = j.JobID
LEFT JOIN CompanyRemotePolicy crp ON j.CreatedBy = crp.RecruiterID
LEFT JOIN TimezoneOverlapAnalysis toa ON c.CandidateID = toa.CandidateID 
    AND j.JobID = toa.JobID
WHERE j.IsActive = 1 AND j.IsDeleted = 0
    AND rc.OverallRemoteScore IS NOT NULL;

-- 23. vw_CareerPathInsights - Career Path Insights
CREATE VIEW vw_CareerPathInsights AS
SELECT 
    c.CandidateID,
    c.FullName,
    c.YearsOfExperience,
    cg.TargetRole,
    cg.CurrentReadinessScore,
    cg.ProgressPercentage,
    cp.FromRole AS CurrentRoleArchetype,
    cp.ToRole AS TargetRoleArchetype,
    cp.Probability AS TransitionProbability,
    cp.AvgTransitionMonths,
    cp.SalaryIncreaseAvg,
    cp.FutureProofScore,
    (
        SELECT STRING_AGG(s.SkillName, ', ') 
        FROM (
            SELECT TOP 5 s.SkillName
            FROM CandidateSkills cs
            JOIN Skills s ON cs.SkillID = s.SkillID
            WHERE cs.CandidateID = c.CandidateID
            ORDER BY cs.ProficiencyLevel DESC
        ) s
    ) AS TopSkills,
    (
        SELECT COUNT(*) 
        FROM LearningResources lr
        WHERE lr.SkillID IN (
            SELECT SkillID FROM CandidateSkills WHERE CandidateID = c.CandidateID
        )
        AND lr.IsActive = 1
    ) AS AvailableLearningResources
FROM Candidates c
LEFT JOIN CandidateCareerGoals cg ON c.CandidateID = cg.CandidateID AND cg.IsActive = 1
LEFT JOIN CareerPaths cp ON cp.FromRole LIKE '%' + ISNULL((
    SELECT TOP 1 JobTitle 
    FROM Applications a 
    JOIN JobPostings j ON a.JobID = j.JobID 
    WHERE a.CandidateID = c.CandidateID 
    ORDER BY a.AppliedDate DESC
), '') + '%'
    AND cp.ToRole LIKE '%' + ISNULL(cg.TargetRole, '') + '%'
WHERE c.CandidateID IS NOT NULL
GROUP BY c.CandidateID, c.FullName, c.YearsOfExperience, cg.TargetRole, 
         cg.CurrentReadinessScore, cg.ProgressPercentage,
         cp.FromRole, cp.ToRole, cp.Probability, cp.AvgTransitionMonths,
         cp.SalaryIncreaseAvg, cp.FutureProofScore;

-- 24. vw_ReferralIntelligence - Referral Intelligence
CREATE VIEW vw_ReferralIntelligence AS
SELECT 
    r.ReferrerID,
    c1.FullName AS ReferrerName,
    r.ReferredCandidateID,
    c2.FullName AS ReferredCandidateName,
    r.JobID,
    j.JobTitle,
    r.ReferralStrength,
    r.RelationshipType,
    r.ReferralDate,
    r.BonusAmount,
    r.HireResult,
    r.QualityScore,
    ns.ConnectionStrength,
    ns.TrustLevel,
    ns.LastInteraction,
    rp.ConversionRate AS ReferrerHistoricalRate,
    rp.TotalReferrals,
    rp.SuccessfulReferrals,
    CASE 
        WHEN r.HireResult = 1 THEN 'Successful'
        WHEN r.HireResult = 0 THEN 'Unsuccessful'
        ELSE 'Pending'
    END AS ReferralOutcome,
    DATEDIFF(DAY, r.ReferralDate, GETDATE()) AS DaysSinceReferral
FROM ReferralNetwork r
JOIN Candidates c1 ON r.ReferrerID = c1.CandidateID
JOIN Candidates c2 ON r.ReferredCandidateID = c2.CandidateID
JOIN JobPostings j ON r.JobID = j.JobID
LEFT JOIN NetworkStrength ns ON r.ReferrerID = ns.CandidateID 
    AND r.ReferredCandidateID = ns.ConnectionID
LEFT JOIN ReferralPerformance rp ON r.ReferrerID = rp.ReferrerID;

-- 25. vw_MarketIntelligenceDashboard - Market Intelligence Dashboard
CREATE VIEW vw_MarketIntelligenceDashboard AS
SELECT 
    mi.SkillID,
    s.SkillName,
    mi.Location,
    mi.DemandScore,
    mi.SupplyScore,
    mi.DemandScore - mi.SupplyScore AS ImbalanceScore,
    mi.SalaryTrend,
    mi.AvgSalary,
    mi.CompetitorHiringActivity,
    mi.JobPostingsCount,
    mi.CandidateApplicationsCount,
    mi.TimeToFillDays,
    mi.LastUpdated,
    mi.Confidence,
    CASE 
        WHEN mi.DemandScore > 80 AND mi.SupplyScore < 30 THEN 'Critical Shortage'
        WHEN mi.DemandScore > mi.SupplyScore + 20 THEN 'High Demand'
        WHEN ABS(mi.DemandScore - mi.SupplyScore) < 10 THEN 'Balanced'
        WHEN mi.SupplyScore > mi.DemandScore + 20 THEN 'Oversupply'
        ELSE 'Moderate Imbalance'
    END AS MarketCondition,
    CASE 
        WHEN mi.SalaryTrend = 'Rising' AND (mi.DemandScore - mi.SupplyScore) > 15 THEN 'Salary Pressure'
        WHEN mi.SalaryTrend = 'Stable' AND ABS(mi.DemandScore - mi.SupplyScore) < 10 THEN 'Stable Market'
        WHEN mi.SalaryTrend = 'Falling' AND (mi.DemandScore - mi.SupplyScore) < -10 THEN 'Buyer''s Market'
        ELSE 'Normal Conditions'
    END AS SalaryOutlook,
    CASE 
        WHEN mi.TimeToFillDays > 60 THEN 'Very Difficult'
        WHEN mi.TimeToFillDays > 45 THEN 'Difficult'
        WHEN mi.TimeToFillDays > 30 THEN 'Moderate'
        ELSE 'Easy'
    END AS HiringDifficulty
FROM MarketIntelligence mi
JOIN Skills s ON mi.SkillID = s.SkillID
WHERE mi.LastUpdated > DATEADD(MONTH, -3, GETDATE());


--26. vw_InterviewerConsistencyCLR (from Phase 23 - CLR Integration)

CREATE VIEW vw_InterviewerConsistencyCLR AS
SELECT
    f.InterviewerID,
    u.Username AS InterviewerName,
    COUNT(*) AS InterviewCount,
    AVG((f.TechnicalScore + f.CommunicationScore + f.CultureFitScore) / 3.0) AS AvgScore,
    dbo.StandardDeviation(
        (SELECT STRING_AGG(CAST((TechnicalScore + CommunicationScore + CultureFitScore) / 3.0 AS VARCHAR), ',')
         FROM InterviewFeedback WHERE InterviewerID = f.InterviewerID)
    ) AS ScoreStdDev,
    CASE 
        WHEN dbo.StandardDeviation(
            (SELECT STRING_AGG(CAST((TechnicalScore + CommunicationScore + CultureFitScore) / 3.0 AS VARCHAR), ',')
             FROM InterviewFeedback WHERE InterviewerID = f.InterviewerID)
        ) > 2.5 THEN 'Inconsistent - review scoring calibration'
        ELSE 'Consistent'
    END AS ConsistencyAssessment
FROM InterviewFeedback f
JOIN Users u ON f.InterviewerID = u.UserID
GROUP BY f.InterviewerID, u.Username
HAVING COUNT(*) >= 3;


-- 27. vw_EmailAudit (from Phase 23 - CLR Integration)

CREATE VIEW vw_EmailAudit AS
SELECT
    c.CandidateID,
    c.FullName,
    u.Email,
    dbo.ValidateEmail(u.Email) AS IsValidFormat,
    dbo.IsDisposableEmail(u.Email) AS IsDisposable,
    dbo.ExtractEmailDomain(u.Email) AS Domain,
    CASE 
        WHEN dbo.ValidateEmail(u.Email) = 0 THEN 'Invalid Format'
        WHEN dbo.IsDisposableEmail(u.Email) = 1 THEN 'Disposable Provider'
        ELSE 'OK'
    END AS Status
FROM Candidates c
JOIN Users u ON c.UserID = u.UserID;


-- 28. vw_TimezoneInterviewSchedule (from Phase 23 - CLR Integration)

CREATE VIEW vw_TimezoneInterviewSchedule AS
SELECT
    i.ScheduleID,
    a.ApplicationID,
    c.CandidateID,
    c.FullName AS CandidateName,
    c.Timezone AS CandidateTimezone,
    i.InterviewStart AS InterviewStartUTC,
    i.InterviewEnd AS InterviewEndUTC,
    dbo.ConvertTimezone(i.InterviewStart, 'UTC', ISNULL(c.Timezone, 'UTC')) AS CandidateLocalStart,
    dbo.ConvertTimezone(i.InterviewEnd, 'UTC', ISNULL(c.Timezone, 'UTC')) AS CandidateLocalEnd,
    r.RecruiterID,
    u.Username AS RecruiterName,
    j.JobTitle,
    dbo.GetTimezoneOffset(ISNULL(c.Timezone, 'UTC')) AS CandidateOffset,
    CASE 
        WHEN dbo.IsWithinWorkingHours(dbo.ConvertTimezone(i.InterviewStart, 'UTC', ISNULL(c.Timezone, 'UTC'))) = 1 
        THEN 'Within Working Hours'
        ELSE 'Outside Working Hours'
    END AS CandidateLocalTimeStatus
FROM InterviewSchedules i
JOIN Applications a ON i.ApplicationID = a.ApplicationID
JOIN Candidates c ON a.CandidateID = c.CandidateID
JOIN Recruiters r ON i.RecruiterID = r.RecruiterID
JOIN Users u ON r.UserID = u.UserID
JOIN JobPostings j ON a.JobID = j.JobID;