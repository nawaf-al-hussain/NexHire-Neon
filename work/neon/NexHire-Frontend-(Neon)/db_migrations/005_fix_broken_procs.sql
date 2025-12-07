-- =====================================================================
-- Fix 3 more broken stored procedures (same root cause as sp_suggestreferrals)
--
-- All three have a trailing SELECT in a PROCEDURE body, which PostgreSQL
-- rejects with "query has no destination for result data". In SQL Server,
-- a trailing SELECT in a PROCEDURE returns a result set to the client.
-- In PostgreSQL, PROCEDUREs can only return via INOUT params or by
-- INSERTing into a table the caller reads from. FUNCTIONS with RETURNS
-- TABLE(...) are the idiomatic PG equivalent of SQL Server's
-- "PROCEDURE that ends in SELECT".
--
-- Strategy per proc:
-- 1. sp_analyzecandidatesentiment - the route CALLs it then SELECTs from
--    candidatesentiment. The proc already INSERTs into candidatesentiment.
--    Fix: just drop the trailing SELECT (it's dead code in PG).
--
-- 2. sp_generatenegotiationstrategy - the route CALLs it then SELECTs
--    from negotiationhistory. The proc already INSERTs into negotiationhistory.
--    Fix: drop the trailing SELECT (dead code in PG).
--
-- 3. sp_predictonboardingsuccess - the route does
--    `SELECT sp_predictonboardingsuccess($1, $2)` expecting a single
--    composite value back. Fix: convert to FUNCTION returning the
--    composite type as a single value (the route unpacks it).
-- =====================================================================

-- =====================================================================
-- Fix 1: sp_analyzecandidatesentiment - remove trailing SELECT
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
    v_SentimentScore NUMERIC := 0;
    v_Confidence NUMERIC := 0.5;
    v_CommunicationStyle VARCHAR(50) := 'Neutral';
    v_RedFlags TEXT[] := ARRAY[]::TEXT[];
    v_PositiveIndicators TEXT[] := ARRAY[]::TEXT[];
    v_RedFlagsStr TEXT;
    v_PositiveIndicatorsStr TEXT;
BEGIN
    -- Simple keyword-based sentiment analysis (replaces SQL Server CLR)
    -- Looks for positive/negative words and computes a score 0-100
    IF p_rawtext ILIKE '%excellent%' OR p_rawtext ILIKE '%great%' OR p_rawtext ILIKE '%outstanding%' THEN
        v_SentimentScore := 90;
        v_CommunicationStyle := 'Positive';
        v_PositiveIndicators := v_PositiveIndicators || ARRAY['enthusiasm', 'achievement'];
    ELSIF p_rawtext ILIKE '%good%' OR p_rawtext ILIKE '%satisfied%' OR p_rawtext ILIKE '%happy%' THEN
        v_SentimentScore := 75;
        v_CommunicationStyle := 'Positive';
    ELSIF p_rawtext ILIKE '%concerned%' OR p_rawtext ILIKE '%worried%' OR p_rawtext ILIKE '%disappointed%' THEN
        v_SentimentScore := 30;
        v_CommunicationStyle := 'Concerned';
        v_RedFlags := v_RedFlags || ARRAY['negative_sentiment'];
    ELSIF p_rawtext ILIKE '%angry%' OR p_rawtext ILIKE '%unhappy%' OR p_rawtext ILIKE '%terrible%' THEN
        v_SentimentScore := 15;
        v_CommunicationStyle := 'Negative';
        v_RedFlags := v_RedFlags || ARRAY['negative_sentiment', 'potential_churn'];
    ELSE
        v_SentimentScore := 50;
        v_CommunicationStyle := 'Neutral';
    END IF;

    v_Confidence := 0.7;
    v_RedFlagsStr := CASE WHEN array_length(v_RedFlags, 1) IS NOT NULL
                          THEN array_to_string(v_RedFlags, '; ')
                          ELSE NULL END;
    v_PositiveIndicatorsStr := CASE WHEN array_length(v_PositiveIndicators, 1) IS NOT NULL
                                     THEN array_to_string(v_PositiveIndicators, '; ')
                                     ELSE NULL END;

    INSERT INTO candidatesentiment (
        candidateid, interactiontype, interactiondate,
        sentimentscore, confidence, communicationstyle,
        redflagsdetected, positiveindicators, analysismethod
    ) VALUES (
        p_candidateid, p_interactiontype, COALESCE(p_interactiondate, NOW()),
        v_SentimentScore, v_Confidence, v_CommunicationStyle,
        v_RedFlagsStr, v_PositiveIndicatorsStr, 'Keyword-based v2'
    );
    -- Removed trailing SELECT (was returning result set in SQL Server;
    -- the route reads from candidatesentiment after CALL anyway).
END;
$$;

-- =====================================================================
-- Fix 2: sp_generatenegotiationstrategy - remove trailing SELECT
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
    v_OfferPercentile NUMERIC := 50;
    v_RecommendedCounter NUMERIC := 0;
    v_NegotiationRoom NUMERIC := 0;
    v_FinalRecommendation TEXT;
    v_Rounds INTEGER := 1;
BEGIN
    -- Pull market data from salarybenchmarks (same job title/location)
    SELECT
        AVG(avgsalary) INTO v_MarketAvg
    FROM salarybenchmarks
    WHERE jobtitle = (SELECT jobtitle FROM jobpostings WHERE jobid = p_jobid);

    v_Market25 := COALESCE(v_MarketAvg * 0.85, p_initialoffer * 0.8);
    v_Market75 := COALESCE(v_MarketAvg * 1.15, p_initialoffer * 1.2);
    v_MarketAvg := COALESCE(v_MarketAvg, p_initialoffer);

    -- Compute percentile
    IF p_initialoffer < v_Market25 THEN v_OfferPercentile := 15;
    ELSIF p_initialoffer < v_MarketAvg THEN v_OfferPercentile := 35;
    ELSIF p_initialoffer < v_Market75 THEN v_OfferPercentile := 65;
    ELSE v_OfferPercentile := 85;
    END IF;

    -- Recommended counter-offer
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

    INSERT INTO negotiationhistory (
        candidateid, jobid, initialoffer, counteroffer, finaloffer,
        negotiationrounds, negotiationtacticsused, successscore,
        learnedlessons, durationdays, startedat, endedat
    ) VALUES (
        p_candidateid, p_jobid, p_initialoffer, v_RecommendedCounter,
        v_RecommendedCounter, v_Rounds, v_FinalRecommendation,
        v_OfferPercentile, NULL, 0, NOW(), NOW()
    );
    -- Removed trailing SELECT (was returning result set in SQL Server;
    -- the route reads from negotiationhistory after CALL).
END;
$$;

-- =====================================================================
-- Fix 3: sp_predictonboardingsuccess - convert PROCEDURE to FUNCTION
-- (route does `SELECT sp_predictonboardingsuccess($1, $2)` expecting a
-- composite value back, so we need a FUNCTION that RETURNS a single
-- composite value)
-- =====================================================================
DROP PROCEDURE IF EXISTS public.sp_predictonboardingsuccess(INTEGER, INTEGER);

CREATE OR REPLACE FUNCTION public.sp_predictonboardingsuccess(
    p_candidateid INTEGER,
    p_jobid INTEGER
)
RETURNS TABLE(
    successprobability NUMERIC,
    riskfactors TEXT,
    recommendations TEXT,
    risklevel TEXT,
    expecteddaystofullproductivity INTEGER
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
    v_DaysToProductivity INTEGER := 90;
    v_CandidateExp INTEGER := 0;
    v_JobMinExp INTEGER := 0;
    v_MatchedSkills INTEGER := 0;
    v_RequiredSkills INTEGER := 0;
BEGIN
    -- Get candidate experience
    SELECT yearsofexperience INTO v_CandidateExp
    FROM candidates WHERE candidateid = p_candidateid;

    -- Get job min experience
    SELECT minexperience INTO v_JobMinExp
    FROM jobpostings WHERE jobid = p_jobid;

    -- Count matched skills
    SELECT COUNT(*) INTO v_MatchedSkills
    FROM candidateskills cs
    JOIN jobskills js ON cs.skillid = js.skillid
    WHERE cs.candidateid = p_candidateid AND js.jobid = p_jobid;

    SELECT COUNT(*) INTO v_RequiredSkills
    FROM jobskills WHERE jobid = p_jobid AND ismandatory = TRUE;

    -- Compute subscores (0.0 to 1.0)
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
        v_DaysToProductivity := 45;
    ELSIF v_SuccessProbability >= 0.6 THEN
        v_RiskLevel := 'Medium Risk';
        v_RiskFactors := COALESCE(
            CASE WHEN v_ExperienceMatch < 0.5 THEN 'Insufficient experience; ' END,
            '') || COALESCE(
            CASE WHEN v_SkillsMatch < 0.5 THEN 'Skills gap; ' END, '');
        v_Recommendations := 'Extended onboarding with mentorship';
        v_DaysToProductivity := 75;
    ELSE
        v_RiskLevel := 'High Risk';
        v_RiskFactors := 'Significant experience/skills gap';
        v_Recommendations := 'Intensive onboarding with training plan';
        v_DaysToProductivity := 120;
    END IF;

    RETURN QUERY SELECT
        v_SuccessProbability,
        v_RiskFactors,
        v_Recommendations,
        v_RiskLevel,
        v_DaysToProductivity;
END;
$$;

GRANT EXECUTE ON FUNCTION public.sp_predictonboardingsuccess(INTEGER, INTEGER) TO PUBLIC;
