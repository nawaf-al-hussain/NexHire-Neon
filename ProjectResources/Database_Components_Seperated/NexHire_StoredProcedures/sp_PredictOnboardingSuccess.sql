CREATE PROCEDURE sp_PredictOnboardingSuccess
    @CandidateID INT,
    @JobID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @RemoteScore DECIMAL(3,2), @SocialSkills INT;
    DECLARE @PreviousRemoteMonths INT, @CareerGaps INT;
    DECLARE @CompanyOnboardingScore INT;
    DECLARE @SimilarSuccessRate DECIMAL(5,2);
    
    SELECT @RemoteScore = rc.OverallRemoteScore,
           @PreviousRemoteMonths = rc.PreviousRemoteExperienceMonths,
           @SocialSkills = osf.SocialIntegrationScore
    FROM RemoteCompatibility rc
    LEFT JOIN OnboardingSuccessFactors osf ON osf.HiredCandidateID = rc.CandidateID
    WHERE rc.CandidateID = @CandidateID;
    
    SELECT @CareerGaps = ISNULL(dm.CareerGapMonths, 0)
    FROM DiversityMetrics dm
    WHERE dm.ApplicationID IN (
        SELECT ApplicationID FROM Applications 
        WHERE CandidateID = @CandidateID AND JobID = @JobID
    );
    
    SELECT @CompanyOnboardingScore = crp.RemoteOnboardingScore
    FROM CompanyRemotePolicy crp
    JOIN JobPostings j ON crp.RecruiterID = j.CreatedBy
    WHERE j.JobID = @JobID;
    
    SELECT @SimilarSuccessRate = AVG(
        CASE osf.SuccessCategory
            WHEN 'High' THEN 0.9
            WHEN 'Medium' THEN 0.7
            WHEN 'Low' THEN 0.4
            ELSE 0.5
        END
    )
    FROM OnboardingSuccessFactors osf
    JOIN Applications a ON osf.HiredCandidateID = a.CandidateID
    WHERE a.JobID = @JobID
        AND osf.HiredCandidateID <> @CandidateID;
    
    DECLARE @SuccessProbability DECIMAL(5,2);
    SET @SuccessProbability = 0.5;
    
    IF @RemoteScore IS NOT NULL
        SET @SuccessProbability = @SuccessProbability + (@RemoteScore / 10 * 0.2);
    
    IF @CompanyOnboardingScore IS NOT NULL
        SET @SuccessProbability = @SuccessProbability + (@CompanyOnboardingScore / 10 * 0.2);
    
    IF @SimilarSuccessRate IS NOT NULL
        SET @SuccessProbability = @SuccessProbability + (@SimilarSuccessRate * 0.3);
    
    IF @CareerGaps > 12 
        SET @SuccessProbability = @SuccessProbability * 0.8;
    
    IF @PreviousRemoteMonths = 0 
        SET @SuccessProbability = @SuccessProbability * 0.9;
    
    IF @SocialSkills < 5 
        SET @SuccessProbability = @SuccessProbability * 0.85;
    
    IF @SuccessProbability > 0.95 SET @SuccessProbability = 0.95;
    IF @SuccessProbability < 0.1 SET @SuccessProbability = 0.1;
    
    DECLARE @RiskFactors NVARCHAR(MAX);
    SET @RiskFactors = '';
    
    IF @CareerGaps > 12 
        SET @RiskFactors = @RiskFactors + 'Significant career gap (' + CAST(@CareerGaps AS VARCHAR) + ' months). ';
    
    IF @PreviousRemoteMonths = 0 
        SET @RiskFactors = @RiskFactors + 'No previous remote work experience. ';
    
    IF @SocialSkills < 5 
        SET @RiskFactors = @RiskFactors + 'Below average social integration score. ';
    
    IF @CompanyOnboardingScore IS NULL OR @CompanyOnboardingScore < 5
        SET @RiskFactors = @RiskFactors + 'Company remote onboarding may need improvement. ';
    
    DECLARE @Recommendations NVARCHAR(MAX);
    SET @Recommendations = CASE 
        WHEN @SuccessProbability < 0.6 THEN 
            'High-risk onboarding. Recommendations: 1) Assign dedicated mentor, 2) 30-60-90 day plan, 3) Weekly check-ins, 4) Early performance indicators'
        WHEN @SuccessProbability < 0.8 THEN 
            'Moderate risk. Recommendations: 1) Bi-weekly mentor meetings, 2) Clear first project, 3) Social integration activities'
        ELSE 
            'Low risk. Standard onboarding process should be sufficient.'
    END;
    
    SELECT 
        @SuccessProbability AS SuccessProbability,
        @RiskFactors AS RiskFactors,
        @Recommendations AS Recommendations,
        CASE 
            WHEN @SuccessProbability >= 0.8 THEN 'Low Risk'
            WHEN @SuccessProbability >= 0.6 THEN 'Medium Risk'
            ELSE 'High Risk'
        END AS RiskLevel,
        CASE 
            WHEN @SuccessProbability >= 0.8 THEN 24
            WHEN @SuccessProbability >= 0.6 THEN 18
            WHEN @SuccessProbability >= 0.4 THEN 12
            ELSE 6
        END AS PredictedRetentionMonths;
END;