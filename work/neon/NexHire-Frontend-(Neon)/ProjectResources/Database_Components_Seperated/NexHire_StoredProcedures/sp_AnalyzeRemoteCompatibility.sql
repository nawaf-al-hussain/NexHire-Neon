CREATE PROCEDURE sp_AnalyzeRemoteCompatibility
    @CandidateID INT,
    @JobID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @CandidateScore DECIMAL(3,2), @CompanyScore INT;
    DECLARE @TimezoneOverlap DECIMAL(4,2), @OptimalOverlap DECIMAL(4,2);
    DECLARE @CandidateLocation VARCHAR(100), @CompanyLocation VARCHAR(100);
    DECLARE @WorkspaceQuality INT, @SelfMotivation INT;
    
    SELECT @CandidateScore = rc.OverallRemoteScore,
           @WorkspaceQuality = rc.WorkspaceQuality,
           @SelfMotivation = rc.SelfMotivationScore,
           @CandidateLocation = c.Location
    FROM RemoteCompatibility rc
    JOIN Candidates c ON rc.CandidateID = c.CandidateID
    WHERE rc.CandidateID = @CandidateID;
    
    SELECT @CompanyLocation = j.Location
    FROM JobPostings j
    WHERE j.JobID = @JobID;
    
    SELECT @CompanyScore = crp.RemoteOnboardingScore
    FROM CompanyRemotePolicy crp
    JOIN JobPostings j ON crp.RecruiterID = j.CreatedBy
    WHERE j.JobID = @JobID;
    
    SET @TimezoneOverlap = CASE 
        WHEN @CandidateLocation = @CompanyLocation THEN 8.0
        WHEN @CandidateLocation LIKE '%Dhaka%' AND @CompanyLocation LIKE '%Dhaka%' THEN 8.0
        WHEN @CandidateLocation LIKE '%Chittagong%' AND @CompanyLocation LIKE '%Dhaka%' THEN 8.0
        ELSE 2.0
    END;
    
    SET @OptimalOverlap = 4.0;
    
    DECLARE @CompatibilityScore DECIMAL(5,2);
    SET @CompatibilityScore = (
        ISNULL(@CandidateScore, 5.0) * 0.4 +
        ISNULL(@CompanyScore, 5.0) * 0.3 +
        CASE 
            WHEN @TimezoneOverlap >= @OptimalOverlap THEN 9.0
            WHEN @TimezoneOverlap >= @OptimalOverlap * 0.5 THEN 6.0
            ELSE 3.0
        END * 0.2 +
        CASE 
            WHEN @WorkspaceQuality >= 4 THEN 8.0
            WHEN @WorkspaceQuality >= 3 THEN 5.0
            ELSE 2.0
        END * 0.1
    );
    
    SELECT 
        @CompatibilityScore AS RemoteCompatibilityScore,
        ISNULL(@CandidateScore, 5.0) AS CandidateRemoteReadiness,
        ISNULL(@CompanyScore, 5.0) AS CompanyRemoteMaturity,
        @TimezoneOverlap AS TimezoneOverlapHours,
        @OptimalOverlap AS OptimalOverlapHours,
        ISNULL(@WorkspaceQuality, 3) AS WorkspaceQualityScore,
        ISNULL(@SelfMotivation, 5) AS SelfMotivationScore,
        CASE 
            WHEN @CompatibilityScore >= 7.5 THEN 'Excellent remote fit'
            WHEN @CompatibilityScore >= 6.0 THEN 'Good remote fit'
            WHEN @CompatibilityScore >= 4.5 THEN 'Moderate remote fit'
            ELSE 'Poor remote fit - needs support'
        END AS CompatibilityAssessment,
        CASE 
            WHEN @TimezoneOverlap < @OptimalOverlap THEN 'Consider flexible hours or async work arrangements'
            WHEN @WorkspaceQuality < 3 THEN 'Recommend home office stipend or co-working space'
            WHEN @CompanyScore IS NULL OR @CompanyScore < 5 THEN 'Company may need to improve remote onboarding'
            ELSE 'No major concerns detected'
        END AS Recommendations,
        CASE 
            WHEN @CompatibilityScore >= 7.5 THEN 'High probability of remote success (>80%)'
            WHEN @CompatibilityScore >= 6.0 THEN 'Good probability of remote success (60-80%)'
            WHEN @CompatibilityScore >= 4.5 THEN 'Moderate probability (40-60%)'
            ELSE 'High risk of remote failure (<40%)'
        END AS SuccessPrediction;
END;