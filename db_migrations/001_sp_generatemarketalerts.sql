-- =====================================================================
-- sp_generatemarketalerts - PostgreSQL port of SSMS stored procedure
-- =====================================================================
-- Original: SQL Server T-SQL using @RelevantSkills and @Alerts table vars.
-- Port:     plpgsql PROCEDURE that INSERTs into marketalerts.
--           Called via: CALL sp_generatemarketalerts($1);
--
-- The recruiter route in recruiters.js L727-729 does:
--     await query("CALL sp_generatemarketalerts($1)", [recruiterId]);
--     const spResult = await query("SELECT * FROM marketalerts ORDER BY triggeredat DESC LIMIT 20", ...);
-- So this proc just needs to populate marketalerts; no return value needed.
--
-- Logic:
--   1. Look up the recruiter's department (used as location filter).
--   2. Collect distinct skill names from the recruiter's active job postings.
--   3. For each MarketIntelligence row in their location updated in the
--      last 14 days matching one of their skills, INSERT a Salary/Demand alert.
--   4. For each CompetitorAnalysis row in their location from the last
--      30 days matching one of their job titles, INSERT a Competitor Alert.
-- =====================================================================

CREATE OR REPLACE PROCEDURE sp_generatemarketalerts(IN p_recruiterid INTEGER)
LANGUAGE plpgsql
AS $$
DECLARE
    v_recruiter_location VARCHAR(100);
    v_relevant_skills TEXT[];
BEGIN
    -- 1. Look up the recruiter's department (used as location)
    SELECT r.department INTO v_recruiter_location
    FROM recruiters r
    WHERE r.recruiterid = p_recruiterid;

    IF v_recruiter_location IS NULL THEN
        -- Recruiter not found or no department set; nothing to do
        RETURN;
    END IF;

    -- 2. Collect distinct skill names from the recruiter's active, non-deleted jobs
    SELECT COALESCE(array_agg(DISTINCT s.skillname), ARRAY[]::TEXT[]) INTO v_relevant_skills
    FROM jobpostings j
    JOIN jobskills js ON j.jobid = js.jobid
    JOIN skills s ON js.skillid = s.skillid
    WHERE j.createdby = p_recruiterid
      AND j.isactive = TRUE
      AND j.isdeleted = FALSE;

    -- 3. Insert Market Intelligence alerts (only if recruiter has tracked skills)
    IF array_length(v_relevant_skills, 1) IS NOT NULL THEN
        INSERT INTO marketalerts (
            alerttype, skillid, location, severity, title, description,
            triggeredat, expiresat, isactive
        )
        SELECT
            CASE
                WHEN mi.salarytrend IN ('Rising', 'Falling') THEN 'Salary Alert'
                ELSE 'Demand Alert'
            END,
            mi.skillid,
            mi.location,
            CASE
                WHEN (mi.demandscore - mi.supplyscore) > 30 THEN 5
                WHEN (mi.demandscore - mi.supplyscore) > 15 THEN 3
                ELSE 2
            END,
            s.skillname || ' alert in ' || mi.location,
            'Alert for ' || s.skillname || ' in ' || mi.location
                || ': Trend is ' || COALESCE(mi.salarytrend, 'unknown')
                || '. Avg: ' || COALESCE(TO_CHAR(mi.avgsalary, 'FM999,999,990.00'), 'N/A')
                || '. Imbalance: ' || (mi.demandscore - mi.supplyscore)::TEXT,
            NOW(),
            NOW() + INTERVAL '30 days',
            TRUE
        FROM marketintelligence mi
        JOIN skills s ON mi.skillid = s.skillid
        WHERE mi.location = v_recruiter_location
          AND mi.lastupdated > NOW() - INTERVAL '14 days'
          AND s.skillname = ANY(v_relevant_skills);
    END IF;

    -- 4. Insert Competitor alerts
    INSERT INTO marketalerts (
        alerttype, skillid, location, severity, title, description,
        triggeredat, expiresat, isactive
    )
    SELECT
        'Competitor Alert',
        NULL,
        ca.location,
        3,
        'Competitor ' || ca.competitorname || ' hiring ' || ca.jobtitle,
        'Competitor ' || ca.competitorname
            || ' hiring for ' || ca.jobtitle
            || ' at ' || COALESCE(TO_CHAR(ca.listedsalary, 'FM999,999,990.00'), 'N/A'),
        NOW(),
        NOW() + INTERVAL '60 days',
        TRUE
    FROM competitoranalysis ca
    WHERE ca.location = v_recruiter_location
      AND ca.analysisdate > NOW() - INTERVAL '30 days'
      AND EXISTS (
          SELECT 1
          FROM jobpostings jp
          WHERE jp.createdby = p_recruiterid
            AND ca.jobtitle ILIKE '%' || jp.jobtitle || '%'
      );
END;
$$;

GRANT EXECUTE ON PROCEDURE sp_generatemarketalerts(INTEGER) TO PUBLIC;
