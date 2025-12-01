-- =====================================================================
-- Fix long-decimal outputs from stored procedures and functions
--
-- PostgreSQL NUMERIC type preserves full precision (e.g., 0.880000000000000000000)
-- whereas SQL Server's DECIMAL type rounds on output. This migration
-- adds ROUND() to the RETURN QUERY of functions that return NUMERIC
-- values to the application layer.
-- =====================================================================

-- Fix 1: sp_predictonboardingsuccess — round successprobability to 2 decimals
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

    -- Round to 2 decimal places for clean display
    v_SuccessProbability := ROUND(v_SuccessProbability, 2);

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

-- Fix 2: sp_suggestreferrals — round skillsmatchpercent and historicalconversionrate
CREATE OR REPLACE FUNCTION public.sp_suggestreferrals(p_jobid INTEGER)
RETURNS TABLE(
    referrerid INTEGER,
    referrername VARCHAR,
    historicalconversionrate NUMERIC,
    skillsmatchpercent NUMERIC,
    potentialreferrals TEXT,
    referrerqualityscore NUMERIC,
    estimatedsuccessprobability TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_location VARCHAR(100);
    v_minexperience INT;
BEGIN
    SELECT j.location, j.minexperience INTO v_location, v_minexperience
    FROM jobpostings j
    WHERE j.jobid = p_jobid;

    IF v_location IS NULL THEN
        RETURN;
    END IF;

    RETURN QUERY
    WITH potentialreferrers AS (
        SELECT
            c.candidateid,
            c.fullname,
            c.yearsofexperience,
            c.location,
            (
                SELECT COUNT(*)
                FROM networkstrength ns
                WHERE ns.candidateid = c.candidateid
                  AND ns.connectionstrength >= 7
            ) AS strongconnectionscount,
            COALESCE(rp.conversionrate, 0) AS historicalconversionrate,
            (
                SELECT COUNT(*)
                FROM candidateskills cs
                JOIN jobskills js ON cs.skillid = js.skillid
                WHERE cs.candidateid = c.candidateid
                  AND js.jobid = p_jobid
                  AND js.ismandatory
            ) * 100.0 / NULLIF((
                SELECT COUNT(*)
                FROM jobskills
                WHERE jobid = p_jobid AND ismandatory
            ), 0) AS skillsmatchpercent
        FROM candidates c
        LEFT JOIN referralperformance rp ON rp.referrerid = c.candidateid
        WHERE c.yearsofexperience >= v_minexperience * 0.8
    ),
    networkanalysis AS (
        SELECT
            pr.candidateid AS referrerid,
            pr.fullname AS referrername,
            pr.historicalconversionrate,
            pr.skillsmatchpercent,
            (
                SELECT COALESCE(jsonb_agg(jsonb_build_object(
                    'CandidateID', sub.candidateid,
                    'FullName', sub.fullname,
                    'YearsOfExperience', sub.yearsofexperience,
                    'Location', sub.location,
                    'ConnectionStrength', sub.connectionstrength,
                    'TrustLevel', sub.trustlevel,
                    'MatchingSkillsCount', sub.matchingskillscount,
                    'FitScore', sub.fitscore
                )), '[]'::jsonb)
                FROM (
                    SELECT
                        c2.candidateid,
                        c2.fullname,
                        c2.yearsofexperience,
                        c2.location,
                        ns.connectionstrength,
                        ns.trustlevel,
                        (
                            SELECT COUNT(*)
                            FROM candidateskills cs
                            JOIN jobskills js ON cs.skillid = js.skillid
                            WHERE cs.candidateid = c2.candidateid
                              AND js.jobid = p_jobid
                              AND js.ismandatory
                        ) AS matchingskillscount,
                        (
                            CASE WHEN c2.yearsofexperience >= v_minexperience THEN 20 ELSE 10 END +
                            CASE WHEN c2.location = v_location THEN 15 ELSE 5 END +
                            ns.connectionstrength * 5 +
                            ns.trustlevel * 4 +
                            (
                                SELECT COUNT(*)
                                FROM candidateskills cs
                                JOIN jobskills js ON cs.skillid = js.skillid
                                WHERE cs.candidateid = c2.candidateid
                                  AND js.jobid = p_jobid
                                  AND js.ismandatory
                            ) * 10
                        ) AS fitscore
                    FROM networkstrength ns
                    JOIN candidates c2 ON ns.connectionid = c2.candidateid
                    WHERE ns.candidateid = pr.candidateid
                      AND c2.candidateid NOT IN (
                          SELECT candidateid FROM applications WHERE jobid = p_jobid
                      )
                      AND ns.connectionstrength >= 5
                    ORDER BY fitscore DESC
                    LIMIT 5
                ) sub
            ) AS potentialreferrals
        FROM potentialreferrers pr
        WHERE pr.strongconnectionscount >= 3
          AND pr.skillsmatchpercent >= 50
    )
    SELECT
        na.referrerid,
        na.referrername,
        ROUND(na.historicalconversionrate, 2) AS historicalconversionrate,
        ROUND(na.skillsmatchpercent, 2) AS skillsmatchpercent,
        na.potentialreferrals::TEXT,
        ROUND((na.historicalconversionrate * 0.6 + na.skillsmatchpercent * 0.4), 2) AS referrerqualityscore,
        CASE
            WHEN na.historicalconversionrate >= 70 THEN 'High (>70%)'
            WHEN na.historicalconversionrate >= 50 THEN 'Medium (50-70%)'
            WHEN na.historicalconversionrate >= 30 THEN 'Low (30-50%)'
            ELSE 'Very Low (<30%)'
        END AS estimatedsuccessprobability
    FROM networkanalysis na
    WHERE na.potentialreferrals IS NOT NULL
      AND na.potentialreferrals::TEXT != '[]'
    ORDER BY referrerqualityscore DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.sp_suggestreferrals(INTEGER) TO PUBLIC;

-- Fix 3: sp_predictcareerpath — round successprobability and salaryincrease
CREATE OR REPLACE FUNCTION public.sp_predictcareerpath(
    p_candidateid integer,
    p_targetrole character varying,
    p_years integer DEFAULT 5
)
RETURNS TABLE(
    currentrole character varying,
    targetrole character varying,
    successprobability numeric,
    estimatedtimelinemonths integer,
    expectedsalaryincreasepercent numeric,
    yearsofexperience integer,
    educationlevel character varying,
    feasibilityassessment text,
    developmentplan text,
    alternativepaths text
)
LANGUAGE plpgsql
AS $function$
DECLARE
    v_CurrentRole VARCHAR(150);
    v_CurrentSkills TEXT;
    v_CurrentExp INT;
    v_EducationLevel VARCHAR(50);
    v_PathProbability DECIMAL(3,2);
    v_TransitionMonths INT;
    v_SkillsGap TEXT;
    v_SalaryIncrease DECIMAL(5,2);
    v_AdjustedProbability DECIMAL(3,2);
    v_TimelineMonths INT;
    v_DevelopmentPlan TEXT;
BEGIN
    SELECT c.YearsOfExperience, dm.EducationLevel,
           (SELECT j2.JobTitle FROM Applications a2 JOIN JobPostings j2 ON a2.JobID = j2.JobID WHERE a2.CandidateID = p_CandidateID ORDER BY a2.AppliedDate DESC LIMIT 1)
    INTO v_CurrentExp, v_EducationLevel, v_CurrentRole
    FROM Candidates c
    LEFT JOIN DiversityMetrics dm ON dm.ApplicationID IN (
        SELECT ApplicationID FROM Applications WHERE CandidateID = p_CandidateID ORDER BY AppliedDate DESC LIMIT 1
    )
    WHERE c.CandidateID = p_CandidateID;

    SELECT string_agg(s.SkillName, ', ') INTO v_CurrentSkills
    FROM CandidateSkills cs
    JOIN Skills s ON cs.SkillID = s.SkillID
    WHERE cs.CandidateID = p_CandidateID;

    SELECT cp.Probability, cp.AvgTransitionMonths, cp.RequiredSkillsGap, cp.SalaryIncreaseAvg
    INTO v_PathProbability, v_TransitionMonths, v_SkillsGap, v_SalaryIncrease
    FROM CareerPaths cp
    WHERE cp.FromRole LIKE '%' || COALESCE(v_CurrentRole, 'Software Engineer') || '%'
        AND cp.ToRole LIKE '%' || p_TargetRole || '%'
    ORDER BY cp.Probability DESC, cp.SampleSize DESC
    LIMIT 1;

    v_AdjustedProbability := COALESCE(v_PathProbability, 0.5);

    IF v_CurrentExp >= 10 THEN v_AdjustedProbability := v_AdjustedProbability * 1.2;
    ELSIF v_CurrentExp >= 5 THEN v_AdjustedProbability := v_AdjustedProbability * 1.1;
    ELSIF v_CurrentExp >= 2 THEN v_AdjustedProbability := v_AdjustedProbability * 0.9;
    ELSE v_AdjustedProbability := v_AdjustedProbability * 0.7;
    END IF;

    IF v_AdjustedProbability > 0.95 THEN v_AdjustedProbability := 0.95; END IF;

    v_TimelineMonths := COALESCE(v_TransitionMonths, 36);
    IF p_Years * 12 < v_TimelineMonths THEN v_TimelineMonths := p_Years * 12; END IF;

    v_DevelopmentPlan := 'Based on your current skills in ' || COALESCE(v_CurrentSkills, 'general programming') ||
        ', you need to develop: ' || COALESCE(v_SkillsGap, 'advanced skills in your target domain') ||
        '. Recommended learning path: 1) Online courses (3-6 months), 2) Practical projects (6-12 months), 3) Mentorship.';

    RETURN QUERY SELECT
        COALESCE(v_CurrentRole, 'Not specified')::VARCHAR(150),
        p_TargetRole::VARCHAR(150),
        ROUND(v_AdjustedProbability, 2),
        v_TimelineMonths,
        ROUND(COALESCE(v_SalaryIncrease, 30.0), 1),
        COALESCE(v_CurrentExp, 0),
        COALESCE(v_EducationLevel, 'Not specified')::VARCHAR(50),
        CASE
            WHEN v_AdjustedProbability >= 0.8 THEN 'Highly achievable'::TEXT
            WHEN v_AdjustedProbability >= 0.6 THEN 'Achievable with effort'::TEXT
            WHEN v_AdjustedProbability >= 0.4 THEN 'Challenging but possible'::TEXT
            ELSE 'Very difficult - consider alternative paths'::TEXT
        END,
        v_DevelopmentPlan,
        COALESCE(
            (
                SELECT jsonb_agg(jsonb_build_object(
                    'AlternativeRole', sub.ToRole,
                    'Probability', sub.Probability,
                    'TimelineMonths', sub.AvgTransitionMonths
                ))
                FROM (
                    SELECT cp.ToRole, ROUND(cp.Probability, 2) AS Probability, cp.AvgTransitionMonths
                    FROM CareerPaths cp
                    WHERE cp.FromRole LIKE '%' || COALESCE(v_CurrentRole, 'Software Engineer') || '%'
                        AND cp.ToRole <> p_TargetRole
                        AND cp.Probability >= 0.6
                    ORDER BY cp.Probability DESC
                    LIMIT 3
                ) sub
            )::TEXT,
            '[]'
        );
END;
$function$;

GRANT EXECUTE ON FUNCTION public.sp_predictcareerpath(integer, character varying, integer) TO PUBLIC;
