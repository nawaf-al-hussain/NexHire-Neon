-- =====================================================================
-- Fix sp_suggestreferrals - port was broken in 2 ways:
--
-- 1. PROCEDURE with SELECT at end - in PostgreSQL, procedures can't return
--    query results to the caller. They can only INOUT params. Need to
--    convert to a FUNCTION with RETURNS TABLE.
--
-- 2. ORDER BY FitScore DESC inside jsonb_agg subquery - same bug as
--    sp_predictcareerpath. Aggregate collapses rows so FitScore is not
--    in scope. Need to wrap in inner subquery with LIMIT.
--
-- 3. The route in recruiters.js L1265 does:
--       CALL sp_suggestreferrals($1)
--       SELECT * FROM referralnetwork WHERE ...
--    But the original proc never INSERTs into referralnetwork! It just
--    returns a result set. So even if we fix the proc, the route won't
--    find anything in referralnetwork.
--
--    Two options:
--    (A) Make the proc INSERT its suggestions into referralnetwork
--        (matches what the route expects).
--    (B) Change the route to read the function's return value directly.
--
--    Option B is cleaner. The route should call:
--        SELECT * FROM sp_suggestreferrals($1)
--    and get the suggestions back as rows. We update both the proc
--    (convert to FUNCTION) and the route.
-- =====================================================================

-- Drop the broken procedure
DROP PROCEDURE IF EXISTS public.sp_suggestreferrals(INTEGER);

-- Create a working function that returns the suggestions as a table
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
        RETURN;  -- job not found
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
                -- FIX: aggregate over an inner subquery that has its own
                -- ORDER BY + LIMIT (was invalid SQL before).
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
        na.historicalconversionrate,
        na.skillsmatchpercent,
        na.potentialreferrals::TEXT,
        (na.historicalconversionrate * 0.6 + na.skillsmatchpercent * 0.4) AS referrerqualityscore,
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
