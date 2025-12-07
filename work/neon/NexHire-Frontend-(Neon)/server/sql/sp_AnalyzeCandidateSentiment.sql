-- Stored Procedure: sp_AnalyzeCandidateSentiment
-- Purpose: Analyze text sentiment for a candidate interaction and store results
-- Uses CLR function dbo.CalculateSentiment for sentiment scoring

USE RecruitmentDB;
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_AnalyzeCandidateSentiment]') AND type in (N'P', N'PC'))
DROP PROCEDURE [dbo].[sp_AnalyzeCandidateSentiment];
GO

CREATE PROCEDURE sp_AnalyzeCandidateSentiment
    @CandidateID INT,
    @InteractionType VARCHAR(50),
    @RawText NVARCHAR(MAX),
    @InteractionDate DATETIME = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @SentimentScore DECIMAL(3,2) = 0;
    DECLARE @Confidence DECIMAL(3,2) = 0.5;
    DECLARE @CommunicationStyle VARCHAR(50) = 'Casual';  -- Default to Casual (allowed values: Formal, Casual, Technical, Enthusiastic, Reserved)
    DECLARE @RedFlagsDetected INT = 0;
    DECLARE @PositiveIndicators INT = 0;
    DECLARE @KeyTopics NVARCHAR(MAX) = NULL;
    DECLARE @EmotionBreakdown NVARCHAR(MAX) = NULL;
    
    -- Validate InteractionType
    IF @InteractionType NOT IN ('Email', 'Interview', 'Call', 'Chat', 'Application')
    BEGIN
        RAISERROR ('Invalid InteractionType. Must be: Email, Interview, Call, Chat, or Application.', 16, 1);
        RETURN;
    END
    
    -- Validate CandidateID exists
    IF NOT EXISTS (SELECT 1 FROM Candidates WHERE CandidateID = @CandidateID)
    BEGIN
        RAISERROR ('Candidate not found.', 16, 1);
        RETURN;
    END
    
    -- Calculate sentiment using CLR function (if available)
    BEGIN TRY
        SELECT @SentimentScore = CAST(dbo.CalculateSentiment(@RawText) AS DECIMAL(3,2));
        
        -- Set confidence based on text length
        IF LEN(@RawText) > 100
            SET @Confidence = 0.8;
        ELSE IF LEN(@RawText) > 50
            SET @Confidence = 0.6;
        ELSE
            SET @Confidence = 0.4;
    END TRY
    BEGIN CATCH
        -- CLR function not available, use rules-based fallback
        SET @SentimentScore = 0;
        SET @Confidence = 0.3;
    END CATCH
    
    -- Detect communication style (rules-based)
    IF @RawText LIKE '%sir%' OR @RawText LIKE '%madam%' OR @RawText LIKE '%respectfully%' OR @RawText LIKE '%sincerely%'
        SET @CommunicationStyle = 'Formal';
    ELSE IF @RawText LIKE '%hey%' OR @RawText LIKE '%thanks%' OR @RawText LIKE '%cheers%' OR @RawText LIKE '%cool%'
        SET @CommunicationStyle = 'Casual';
    ELSE IF @RawText LIKE '%implementation%' OR @RawText LIKE '%architecture%' OR @RawText LIKE '%algorithm%' OR @RawText LIKE '%framework%'
        SET @CommunicationStyle = 'Technical';
    ELSE IF @RawText LIKE '%excited%' OR @RawText LIKE '%amazing%' OR @RawText LIKE '%love%' OR @RawText LIKE '%fantastic%'
        SET @CommunicationStyle = 'Enthusiastic';
    ELSE IF @RawText LIKE '%perhaps%' OR @RawText LIKE '%maybe%' OR @RawText LIKE '%might%' OR @RawText LIKE '%consider%'
        SET @CommunicationStyle = 'Reserved';
    
    -- Count red flags (negative indicators)
    SELECT @RedFlagsDetected = 
        (CASE WHEN @RawText LIKE '%unhappy%' OR @RawText LIKE '%disappointed%' OR @RawText LIKE '%frustrated%' THEN 1 ELSE 0 END) +
        (CASE WHEN @RawText LIKE '%complaint%' OR @RawText LIKE '%issue%' OR @RawText LIKE '%problem%' THEN 1 ELSE 0 END) +
        (CASE WHEN @RawText LIKE '%leave%' OR @RawText LIKE '%quit%' OR @RawText LIKE '%resign%' THEN 1 ELSE 0 END) +
        (CASE WHEN @RawText LIKE '%unfair%' OR @RawText LIKE '%wrong%' OR @RawText LIKE '%terrible%' THEN 1 ELSE 0 END);
    
    -- Count positive indicators
    SELECT @PositiveIndicators = 
        (CASE WHEN @RawText LIKE '%excited%' OR @RawText LIKE '%happy%' OR @RawText LIKE '%thrilled%' THEN 1 ELSE 0 END) +
        (CASE WHEN @RawText LIKE '%opportunity%' OR @RawText LIKE '%growth%' OR @RawText LIKE '%learn%' THEN 1 ELSE 0 END) +
        (CASE WHEN @RawText LIKE '%team%' OR @RawText LIKE '%collaborate%' OR @RawText LIKE '%contribute%' THEN 1 ELSE 0 END) +
        (CASE WHEN @RawText LIKE '%thank%' OR @RawText LIKE '%appreciate%' OR @RawText LIKE '%grateful%' THEN 1 ELSE 0 END);
    
    -- Build emotion breakdown JSON (simplified rules-based)
    SET @EmotionBreakdown = '{"joy":' + CAST(CASE WHEN @SentimentScore > 0.3 THEN 0.6 ELSE 0.2 END AS VARCHAR(10)) + 
        ',"neutral":' + CAST(CASE WHEN @SentimentScore BETWEEN -0.2 AND 0.2 THEN 0.7 ELSE 0.3 END AS VARCHAR(10)) + 
        ',"frustration":' + CAST(CASE WHEN @SentimentScore < -0.3 THEN 0.5 ELSE 0.1 END AS VARCHAR(10)) + 
        ',"enthusiasm":' + CAST(CASE WHEN @SentimentScore > 0.5 THEN 0.7 ELSE 0.2 END AS VARCHAR(10)) + '}';
    
    -- Set interaction date if not provided
    IF @InteractionDate IS NULL
        SET @InteractionDate = GETDATE();
    
    -- Insert sentiment record
    INSERT INTO CandidateSentiment (
        CandidateID,
        InteractionType,
        InteractionDate,
        SentimentScore,
        Confidence,
        KeyTopics,
        EmotionBreakdown,
        CommunicationStyle,
        RedFlagsDetected,
        PositiveIndicators,
        AnalysisMethod,
        RawText,
        AnalysisDate
    )
    VALUES (
        @CandidateID,
        @InteractionType,
        @InteractionDate,
        @SentimentScore,
        @Confidence,
        @KeyTopics,
        @EmotionBreakdown,
        @CommunicationStyle,
        @RedFlagsDetected,
        @PositiveIndicators,
        'RulesBased',
        @RawText,
        GETDATE()
    );
    
    -- Return the inserted record
    SELECT 
        SentimentID,
        CandidateID,
        InteractionType,
        InteractionDate,
        SentimentScore,
        Confidence,
        CommunicationStyle,
        RedFlagsDetected,
        PositiveIndicators,
        AnalysisMethod
    FROM CandidateSentiment
    WHERE SentimentID = SCOPE_IDENTITY();
END;
GO
