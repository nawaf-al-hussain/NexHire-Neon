-- =====================================================================
-- Fix 6: Correct schema mismatches in sp_analyzecandidatesentiment,
-- sp_generatenegotiationstrategy, and update sp_predictonboardingsuccess
-- route to use SELECT * FROM ().
--
-- Bug 1: sp_analyzecandidatesentiment inserted TEXT into INTEGER columns
--   (RedFlagsDetected, PositiveIndicators), inserted values 0-100 into a
--   DECIMAL(3,2) column with CHECK (-1 to 1), and inserted invalid
--   CommunicationStyle values (CHECK only allows Formal/Casual/Technical/
--   Enthusiastic/Reserved, not Positive/Concerned/Neutral/Negative).
--
-- Bug 2: sp_generatenegotiationstrategy inserted v_OfferPercentile (0-100)
--   into negotiationhistory.SuccessScore which has CHECK (1 to 10).
--
-- Bug 3: sp_predictonboardingsuccess is now a FUNCTION returning TABLE,
--   but the route uses `SELECT sp_predictonboardingsuccess($1, $2)` which
--   returns a single composite column. Need to use
--   `SELECT * FROM sp_predictonboardingsuccess($1, $2)` to unpack it.
--   Also: route expects `predictedretentionmonths` column but our function
--   returns `expecteddaystofullproductivity`. Rename for compatibility.
-- =====================================================================

-- =====================================================================
-- Fix 1: sp_analyzecandidatesentiment - align with actual table schema
-- =====================================================================
CREATE OR REPLACE PROCEDURE public.sp_analyzecandidatesentiment(
    IN p_candidateid INTEGER,
    IN p_interactiontype VARCHAR,
    IN p_rawtext TEXT,
    IN p_interactiondate TIMESTAMP DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_SentimentScore NUMERIC;  -- must be in [-1, 1] per CHECK
    v_Confidence NUMERIC;       -- must be in [0, 1] per CHECK
    v_CommunicationStyle VARCHAR(50);  -- must be in CHECK list
    v_RedFlagsCount INTEGER := 0;       -- INTEGER per schema
    v_PositiveIndicatorsCount INTEGER := 0;  -- INTEGER per schema
BEGIN
    -- Validate interaction type against CHECK constraint
    IF p_interactiontype NOT IN ('Email', 'Interview', 'Call', 'Chat', 'Application') THEN
        RAISE EXCEPTION 'Invalid InteractionType: %. Must be one of Email, Interview, Call, Chat, Application', p_interactiontype;
    END IF;

    -- Keyword-based sentiment analysis. Score range [-1.0, 1.0].
    IF p_rawtext ILIKE '%excellent%' OR p_rawtext ILIKE '%outstanding%' OR p_rawtext ILIKE '%amazing%' THEN
        v_SentimentScore := 0.9;
        v_CommunicationStyle := 'Enthusiastic';
        v_PositiveIndicatorsCount := 2;
    ELSIF p_rawtext ILIKE '%good%' OR p_rawtext ILIKE '%great%' OR p_rawtext ILIKE '%satisfied%' OR p_rawtext ILIKE '%happy%' THEN
        v_SentimentScore := 0.6;
        v_CommunicationStyle := 'Enthusiastic';
        v_PositiveIndicatorsCount := 1;
    ELSIF p_rawtext ILIKE '%concerned%' OR p_rawtext ILIKE '%worried%' OR p_rawtext ILIKE '%disappointed%' THEN
        v_SentimentScore := -0.4;
        v_CommunicationStyle := 'Reserved';
        v_RedFlagsCount := 1;
    ELSIF p_rawtext ILIKE '%angry%' OR p_rawtext ILIKE '%unhappy%' OR p_rawtext ILIKE '%terrible%' OR p_rawtext ILIKE '%frustrated%' THEN
        v_SentimentScore := -0.8;
        v_CommunicationStyle := 'Reserved';
        v_RedFlagsCount := 2;
    ELSE
        v_SentimentScore := 0.0;
        v_CommunicationStyle := 'Formal';
    END IF;

    v_Confidence := 0.7;

    INSERT INTO candidatesentiment (
        candidateid, interactiontype, interactiondate,
        sentimentscore, confidence, communicationstyle,
        redflagsdetected, positiveindicators, analysismethod,
        rawtext, analysisdate
    ) VALUES (
        p_candidateid, p_interactiontype, COALESCE(p_interactiondate, NOW()),
        v_SentimentScore, v_Confidence, v_CommunicationStyle,
        v_RedFlagsCount, v_PositiveIndicatorsCount, 'Keyword-based v3',
        p_rawtext, NOW()
    );
END;
$$;

-- =====================================================================
-- Fix 2: sp_generatenegotiationstrategy - scale SuccessScore to 1-10
-- =====================================================================
CREATE OR REPLACE PROCEDURE public.sp_generatenegotiationstrategy(
    IN p_candidateid INTEGER,
    IN p_jobid INTEGER,
    IN p_initialoffer NUMERIC
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_MarketAvg NUMERIC := 0;
    v_Market25 NUMERIC := 0;
    v_Market75 NUMERIC := 0;
    v_OfferPercentile NUMERIC := 50;  -- 0-100 (for internal calc)
    v_RecommendedCounter NUMERIC := 0;
    v_NegotiationRoom NUMERIC := 0;
    v_FinalRecommendation TEXT;
    v_Rounds INTEGER := 1;
    v_SuccessScore INTEGER;  -- must be 1-10 per CHECK
BEGIN
    -- Pull market data from salarybenchmarks
    SELECT AVG(avgsalary) INTO v_MarketAvg
    FROM salarybenchmarks
    WHERE jobtitle = (SELECT jobtitle FROM jobpostings WHERE jobid = p_jobid);

    v_Market25 := COALESCE(v_MarketAvg * 0.85, p_initialoffer * 0.8);
    v_Market75 := COALESCE(v_MarketAvg * 1.15, p_initialoffer * 1.2);
    v_MarketAvg := COALESCE(v_MarketAvg, p_initialoffer);

    IF p_initialoffer < v_Market25 THEN v_OfferPercentile := 15;
    ELSIF p_initialoffer < v_MarketAvg THEN v_OfferPercentile := 35;
    ELSIF p_initialoffer < v_Market75 THEN v_OfferPercentile := 65;
    ELSE v_OfferPercentile := 85;
    END IF;

    v_RecommendedCounter := GREATEST(p_initialoffer, v_MarketAvg) * 1.10;
    v_NegotiationRoom := v_RecommendedCounter - p_initialoffer;

    IF v_OfferPercentile < 25 THEN
        v_FinalRecommendation := 'Strongly under market - counter aggressively';
    ELSIF v_OfferPercentile < 50 THEN
        v_FinalRecommendation := 'Below market - moderate counter';
    ELSIF v_OfferPercentile < 75 THEN
        v_FinalRecommendation := 'At market - small counter for sign-on';
    ELSE
        v_FinalRecommendation := 'Above market - accept with minor asks';
    END IF;

    v_Rounds := CASE WHEN v_NegotiationRoom > 10000 THEN 3
                     WHEN v_NegotiationRoom > 5000 THEN 2
                     ELSE 1 END;

    -- Scale 0-100 percentile to 1-10 for the SuccessScore CHECK constraint
    v_SuccessScore := GREATEST(1, LEAST(10, ROUND(v_OfferPercentile / 10)));

    INSERT INTO negotiationhistory (
        candidateid, jobid, initialoffer, counteroffer, finaloffer,
        negotiationrounds, negotiationtacticsused, successscore,
        learnedlessons, durationdays, startedat, endedat
    ) VALUES (
        p_candidateid, p_jobid, p_initialoffer, v_RecommendedCounter,
        v_RecommendedCounter, v_Rounds, v_FinalRecommendation,
        v_SuccessScore, NULL, 0, NOW(), NOW()
    );
END;
$$;

-- =====================================================================
-- Fix 3: sp_predictonboardingsuccess - rename column for route compat
-- Route expects `predictedretentionmonths` (analytics.js L857).
-- Our function returned `expecteddaystofullproductivity`. Rename it
-- and add `predictedretentionmonths` derived from it.
-- =====================================================================
DROP FUNCTION IF EXISTS public.sp_predictonboardingsuccess(INTEGER, INTEGER);

CREATE OR REPLACE FUNCTION public.sp_predictonboardingsuccess(
    p_candidateid INTEGER,
    p_jobid INTEGER
)
RETURNS TABLE(
    successprobability NUMERIC,
    riskfactors TEXT,
    recommendations TEXT,
    risklevel TEXT,
    predictedretentionmonths INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_ExperienceMatch NUMERIC := 0.5;
    v_SkillsMatch NUMERIC := 0.5;
    v_SuccessProbability NUMERIC;
    v_RiskFactors TEXT;
    v_Recommendations TEXT;
    v_RiskLevel TEXT;
    v_PredictedRetentionMonths INTEGER := 24;
    v_CandidateExp INTEGER := 0;
    v_JobMinExp INTEGER := 0;
    v_MatchedSkills INTEGER := 0;
    v_RequiredSkills INTEGER := 0;
BEGIN
    SELECT yearsofexperience INTO v_CandidateExp
    FROM candidates WHERE candidateid = p_candidateid;

    SELECT minexperience INTO v_JobMinExp
    FROM jobpostings WHERE jobid = p_jobid;

    SELECT COUNT(*) INTO v_MatchedSkills
    FROM candidateskills cs
    JOIN jobskills js ON cs.skillid = js.skillid
    WHERE cs.candidateid = p_candidateid AND js.jobid = p_jobid;

    SELECT COUNT(*) INTO v_RequiredSkills
    FROM jobskills WHERE jobid = p_jobid AND ismandatory = TRUE;

    IF v_CandidateExp >= v_JobMinExp THEN
        v_ExperienceMatch := LEAST(1.0, 0.6 + (v_CandidateExp - v_JobMinExp) * 0.05);
    ELSE
        v_ExperienceMatch := GREATEST(0.2, 0.6 - (v_JobMinExp - v_CandidateExp) * 0.1);
    END IF;

    IF v_RequiredSkills > 0 THEN
        v_SkillsMatch := v_MatchedSkills::NUMERIC / v_RequiredSkills;
    END IF;

    v_SuccessProbability := (v_ExperienceMatch * 0.4 + v_SkillsMatch * 0.6);
    v_SuccessProbability := LEAST(0.95, GREATEST(0.05, v_SuccessProbability));

    IF v_SuccessProbability >= 0.8 THEN
        v_RiskLevel := 'Low Risk';
        v_RiskFactors := 'None significant';
        v_Recommendations := 'Standard onboarding plan';
        v_PredictedRetentionMonths := 36;
    ELSIF v_SuccessProbability >= 0.6 THEN
        v_RiskLevel := 'Medium Risk';
        v_RiskFactors := COALESCE(
            CASE WHEN v_ExperienceMatch < 0.5 THEN 'Insufficient experience; ' END,
            '') || COALESCE(
            CASE WHEN v_SkillsMatch < 0.5 THEN 'Skills gap; ' END, '');
        v_Recommendations := 'Extended onboarding with mentorship';
        v_PredictedRetentionMonths := 24;
    ELSE
        v_RiskLevel := 'High Risk';
        v_RiskFactors := 'Significant experience/skills gap';
        v_Recommendations := 'Intensive onboarding with training plan';
        v_PredictedRetentionMonths := 12;
    END IF;

    RETURN QUERY SELECT
        v_SuccessProbability,
        v_RiskFactors,
        v_Recommendations,
        v_RiskLevel,
        v_PredictedRetentionMonths;
END;
$$;

GRANT EXECUTE ON FUNCTION public.sp_predictonboardingsuccess(INTEGER, INTEGER) TO PUBLIC;
