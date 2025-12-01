-- Stored Procedure: sp_GetCandidateSentimentHistory
-- Purpose: Retrieve sentiment history for a candidate with aggregated summary

USE RecruitmentDB;
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_GetCandidateSentimentHistory]') AND type in (N'P', N'PC'))
DROP PROCEDURE [dbo].[sp_GetCandidateSentimentHistory];
GO

CREATE PROCEDURE sp_GetCandidateSentimentHistory
    @CandidateID INT,
    @Limit INT = 50,
    @InteractionType VARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Get sentiment history
    SELECT 
        SentimentID,
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
        AnalysisDate
    FROM CandidateSentiment
    WHERE CandidateID = @CandidateID
      AND (@InteractionType IS NULL OR InteractionType = @InteractionType)
    ORDER BY InteractionDate DESC
    OFFSET 0 ROWS FETCH NEXT @Limit ROWS ONLY;
    
    -- Return summary statistics
    SELECT 
        COUNT(*) AS TotalInteractions,
        AVG(SentimentScore) AS AvgSentimentScore,
        AVG(Confidence) AS AvgConfidence,
        SUM(RedFlagsDetected) AS TotalRedFlags,
        SUM(PositiveIndicators) AS TotalPositiveIndicators,
        MAX(SentimentScore) AS HighestScore,
        MIN(SentimentScore) AS LowestScore,
        -- Most common communication style
        (SELECT TOP 1 CommunicationStyle 
         FROM CandidateSentiment 
         WHERE CandidateID = @CandidateID 
         GROUP BY CommunicationStyle 
         ORDER BY COUNT(*) DESC) AS DominantCommunicationStyle,
        -- Sentiment trend (last 5 vs previous 5)
        (SELECT AVG(SentimentScore) FROM (
            SELECT TOP 5 SentimentScore, ROW_NUMBER() OVER (ORDER BY InteractionDate DESC) AS rn
            FROM CandidateSentiment WHERE CandidateID = @CandidateID
        ) recent WHERE rn <= 5) AS RecentAvgSentiment,
        -- Interaction type breakdown
        (SELECT COUNT(*) FROM CandidateSentiment WHERE CandidateID = @CandidateID AND InteractionType = 'Email') AS EmailCount,
        (SELECT COUNT(*) FROM CandidateSentiment WHERE CandidateID = @CandidateID AND InteractionType = 'Interview') AS InterviewCount,
        (SELECT COUNT(*) FROM CandidateSentiment WHERE CandidateID = @CandidateID AND InteractionType = 'Call') AS CallCount,
        (SELECT COUNT(*) FROM CandidateSentiment WHERE CandidateID = @CandidateID AND InteractionType = 'Chat') AS ChatCount
    FROM CandidateSentiment
    WHERE CandidateID = @CandidateID;
END;
GO
