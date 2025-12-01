CREATE PROCEDURE sp_PredictGhostingRisk
    @ApplicationID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @CandidateID INT, @RecruiterID INT, @JobID INT;
    DECLARE @CandidateScore DECIMAL(3,2), @RecruiterScore DECIMAL(3,2);
    DECLARE @ResponseTimeAvg DECIMAL(10,2), @CommunicationCount INT;
    
    SELECT @CandidateID = a.CandidateID, 
           @JobID = a.JobID,
           @RecruiterID = j.CreatedBy
    FROM Applications a
    JOIN JobPostings j ON a.JobID = j.JobID
    WHERE a.ApplicationID = @ApplicationID;
    
    SELECT @CandidateScore = ISNULL(AVG(GhostingScore), 0)
    FROM GhostingPatterns 
    WHERE UserID = @CandidateID AND UserType = 'Candidate' AND IsActive = 1;
    
    SELECT @RecruiterScore = ISNULL(AVG(GhostingScore), 0)
    FROM GhostingPatterns 
    WHERE UserID = @RecruiterID AND UserType = 'Recruiter' AND IsActive = 1;
    
    SELECT @ResponseTimeAvg = AVG(DATEDIFF(HOUR, SentAt, RespondedAt)),
           @CommunicationCount = COUNT(*)
    FROM CommunicationLogs
    WHERE ApplicationID = @ApplicationID AND RespondedAt IS NOT NULL;
    
    DECLARE @RiskScore DECIMAL(3,2);
    SET @RiskScore = (
        ISNULL(@CandidateScore, 0) * 0.4 + 
        ISNULL(@RecruiterScore, 0) * 0.3 + 
        CASE 
            WHEN @ResponseTimeAvg > 48 THEN 8.0
            WHEN @ResponseTimeAvg > 24 THEN 5.0
            WHEN @ResponseTimeAvg > 12 THEN 3.0
            ELSE 1.0 
        END * 0.2 +
        CASE 
            WHEN @CommunicationCount = 0 THEN 7.0
            WHEN @CommunicationCount < 3 THEN 4.0
            ELSE 1.0
        END * 0.1
    );
    
    SELECT 
        @RiskScore AS GhostingRiskScore,
        ISNULL(@CandidateScore, 0) AS CandidateGhostingHistory,
        ISNULL(@RecruiterScore, 0) AS RecruiterGhostingHistory,
        ISNULL(@ResponseTimeAvg, 0) AS AvgResponseTimeHours,
        ISNULL(@CommunicationCount, 0) AS TotalCommunications,
        CASE 
            WHEN @RiskScore >= 7.0 THEN 'High Risk'
            WHEN @RiskScore >= 4.0 THEN 'Medium Risk'
            ELSE 'Low Risk'
        END AS RiskLevel,
        CASE 
            WHEN @RiskScore >= 7.0 THEN 'Send escalation reminders, schedule follow-up call'
            WHEN @RiskScore >= 4.0 THEN 'Increase communication frequency'
            ELSE 'Normal monitoring'
        END AS RecommendedAction;
END;