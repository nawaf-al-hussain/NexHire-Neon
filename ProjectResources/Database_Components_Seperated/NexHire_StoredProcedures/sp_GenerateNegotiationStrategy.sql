CREATE PROCEDURE sp_GenerateNegotiationStrategy
    @CandidateID INT,
    @JobID INT,
    @InitialOffer DECIMAL(10,2)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @CandidateExp INT, @Location VARCHAR(100), @JobTitle VARCHAR(150);
    DECLARE @MarketAvg DECIMAL(10,2), @Market25 DECIMAL(10,2), @Market75 DECIMAL(10,2);
    DECLARE @CompanyRangeMin DECIMAL(10,2), @CompanyRangeMax DECIMAL(10,2);
    
    SELECT @CandidateExp = c.YearsOfExperience,
           @Location = c.Location
    FROM Candidates c
    WHERE c.CandidateID = @CandidateID;
    
    SELECT @JobTitle = j.JobTitle,
           @Location = COALESCE(@Location, j.Location)
    FROM JobPostings j
    WHERE j.JobID = @JobID;
    
    SELECT TOP 1 
        @MarketAvg = AvgSalary,
        @Market25 = Percentile25,
        @Market75 = Percentile75
    FROM SalaryBenchmarks
    WHERE JobTitle = @JobTitle
        AND Location = @Location
        AND ExperienceRange = CASE 
            WHEN @CandidateExp < 2 THEN 'Entry'
            WHEN @CandidateExp < 5 THEN 'Junior'
            WHEN @CandidateExp < 10 THEN 'Mid'
            ELSE 'Senior'
        END
    ORDER BY SampleSize DESC, LastUpdated DESC;
    
    SELECT @CompanyRangeMin = MinSalary,
           @CompanyRangeMax = MaxSalary
    FROM JobSalaryRanges
    WHERE JobID = @JobID;
    
    DECLARE @OfferPercentile DECIMAL(5,2);
    DECLARE @RecommendedCounter DECIMAL(10,2);
    DECLARE @NegotiationRoom DECIMAL(10,2);
    
    SET @OfferPercentile = CASE 
        WHEN @InitialOffer <= ISNULL(@Market25, @InitialOffer * 0.8) THEN 25
        WHEN @InitialOffer <= ISNULL(@MarketAvg, @InitialOffer * 1.0) THEN 50
        WHEN @InitialOffer <= ISNULL(@Market75, @InitialOffer * 1.2) THEN 75
        ELSE 90
    END;
    
    SET @RecommendedCounter = CASE 
        WHEN @OfferPercentile < 50 THEN ISNULL(@MarketAvg, @InitialOffer) * 1.1
        WHEN @OfferPercentile < 75 THEN ISNULL(@Market75, @InitialOffer) * 1.05
        ELSE @InitialOffer * 1.03
    END;
    
    IF @CompanyRangeMax IS NOT NULL AND @RecommendedCounter > @CompanyRangeMax
        SET @RecommendedCounter = @CompanyRangeMax * 0.95;
    
    SET @NegotiationRoom = @RecommendedCounter - @InitialOffer;
    
    SELECT 
        @InitialOffer AS InitialOffer,
        ISNULL(@MarketAvg, @InitialOffer) AS MarketAverage,
        ISNULL(@Market25, @InitialOffer * 0.8) AS Market25thPercentile,
        ISNULL(@Market75, @InitialOffer * 1.2) AS Market75thPercentile,
        @OfferPercentile AS OfferPercentile,
        @RecommendedCounter AS RecommendedCounterOffer,
        @NegotiationRoom AS NegotiationRoom,
        CASE 
            WHEN @OfferPercentile < 25 THEN 'Strongly Under Market'
            WHEN @OfferPercentile < 50 THEN 'Below Market'
            WHEN @OfferPercentile < 75 THEN 'Market Competitive'
            ELSE 'Above Market'
        END AS OfferAssessment,
        CASE 
            WHEN @OfferPercentile < 25 THEN 
                'Thank you for the offer. Based on my research of similar roles in ' + ISNULL(@Location, 'this market') + 
                ' with ' + CAST(@CandidateExp AS VARCHAR) + ' years experience, the market range is ' + 
                CAST(ISNULL(@Market25, @InitialOffer * 0.8) AS VARCHAR) + ' - ' + CAST(ISNULL(@Market75, @InitialOffer * 1.2) AS VARCHAR) + 
                '. Given my qualifications, I was expecting something closer to ' + CAST(@RecommendedCounter AS VARCHAR) + '.'
            WHEN @OfferPercentile < 50 THEN 
                'I appreciate the offer. While it''s a competitive package, market data shows similar roles at my experience level average ' + 
                CAST(ISNULL(@MarketAvg, @InitialOffer) AS VARCHAR) + '. Could we discuss reaching ' + CAST(@RecommendedCounter AS VARCHAR) + 
                ' to align with market standards?'
            WHEN @OfferPercentile < 75 THEN 
                'Thank you for the generous offer. I''m excited about the role and believe my experience could justify an increase to ' + 
                CAST(@RecommendedCounter AS VARCHAR) + '. This would put me in the top quartile for this role and reflect the value I''ll bring.'
            ELSE 
                'This is an excellent offer that I''m very excited about. While it''s already competitive, based on my unique experience, ' +
                'I believe ' + CAST(@RecommendedCounter AS VARCHAR) + ' would be appropriate.'
        END AS NegotiationScript,
        CASE 
            WHEN @NegotiationRoom > 10000 THEN 'Wait 24 hours, then counter via email'
            WHEN @NegotiationRoom > 5000 THEN 'Respond within 48 hours with counter'
            ELSE 'Accept within 72 hours or ask for minor adjustments'
        END AS TimingRecommendation,
        'Consider negotiating for: 1) Signing bonus, 2) Additional equity, 3) Early performance review, 4) Professional development budget' AS FallbackOptions;
END;