-- Fix 1: Relax pushnotifications CHECK constraint to allow 'DeviceRegistration' type
-- The route POST /api/candidates/notifications/register-device uses 'DeviceRegistration'
-- as the notificationtype when logging device registration. The original CHECK
-- constraint didn't include this value, causing 500 errors.

-- First, find and drop the existing CHECK constraint
ALTER TABLE public.pushnotifications
    DROP CONSTRAINT IF EXISTS pushnotifications_notificationtype_check;

-- Recreate it with 'DeviceRegistration' added
ALTER TABLE public.pushnotifications
    ADD CONSTRAINT pushnotifications_notificationtype_check
    CHECK (notificationtype IN (
        'Interview', 'Reminder', 'StatusUpdate', 'Offer', 'Message',
        'DeviceRegistration', 'System', 'Other'
    ));

-- ============================================================================
-- Fix 2: sp_predictcareerpath - fix subquery with ORDER BY + LIMIT inside aggregate
-- Original code had:
--   SELECT jsonb_agg(jsonb_build_object(...))
--   FROM CareerPaths cp
--   WHERE ...
--   ORDER BY cp.Probability DESC  -- invalid: aggregate already collapses rows
--   LIMIT 3
-- PostgreSQL requires the LIMIT to be in an inner subquery, then aggregate.

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
        v_AdjustedProbability,
        v_TimelineMonths,
        COALESCE(v_SalaryIncrease, 30.0),
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
                -- FIX: wrap the limited SELECT in a subquery, then aggregate
                SELECT jsonb_agg(jsonb_build_object(
                    'AlternativeRole', sub.ToRole,
                    'Probability', sub.Probability,
                    'TimelineMonths', sub.AvgTransitionMonths
                ))
                FROM (
                    SELECT cp.ToRole, cp.Probability, cp.AvgTransitionMonths
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
