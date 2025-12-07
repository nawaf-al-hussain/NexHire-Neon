CREATE PROCEDURE sp_GenerateMarketAlerts
    @RecruiterID INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @RecruiterLocation VARCHAR(100);
    DECLARE @RelevantSkills TABLE (SkillName VARCHAR(100) PRIMARY KEY);

    SELECT @RecruiterLocation = r.Department FROM Recruiters r WHERE r.RecruiterID = @RecruiterID;

    INSERT INTO @RelevantSkills (SkillName)
    SELECT DISTINCT s.SkillName
    FROM JobPostings  j
    JOIN JobSkills    js ON j.JobID  = js.JobID
    JOIN Skills       s  ON js.SkillID = s.SkillID
    WHERE j.CreatedBy  = @RecruiterID
      AND j.IsActive   = 1
      AND j.IsDeleted  = 0;

    -- FIX-09: Table variable instead of #temp table (parallelism-safe)
    DECLARE @Alerts TABLE (
        AlertType       VARCHAR(50),
        SkillID         INT          NULL,
        SkillName       VARCHAR(200),
        Location        VARCHAR(100),
        DemandScore     INT          NULL,
        SupplyScore     INT          NULL,
        ImbalanceScore  INT          NULL,
        SalaryTrend     VARCHAR(20)  NULL,
        AvgSalary       DECIMAL(10,2) NULL,
        Description     NVARCHAR(MAX),
        Severity        INT,
        TriggeredAt     DATETIME     DEFAULT GETDATE(),
        ExpiresAt       DATETIME
    );

    INSERT INTO @Alerts (AlertType, SkillID, SkillName, Location, DemandScore, SupplyScore,
                         ImbalanceScore, SalaryTrend, AvgSalary, Description, Severity, ExpiresAt)
    SELECT
        CASE WHEN mi.SalaryTrend IN ('Rising','Falling') THEN 'Salary Alert' ELSE 'Demand Alert' END,
        mi.SkillID, s.SkillName, mi.Location, mi.DemandScore, mi.SupplyScore,
        mi.DemandScore - mi.SupplyScore, mi.SalaryTrend, mi.AvgSalary,
        CONCAT('Alert for ', s.SkillName, ' in ', mi.Location, ': Trend is ', mi.SalaryTrend,
               '. Avg: ', FORMAT(mi.AvgSalary,'N2'), '. Imbalance: ', (mi.DemandScore - mi.SupplyScore)),
        CASE
            WHEN (mi.DemandScore - mi.SupplyScore) > 30 THEN 5
            WHEN (mi.DemandScore - mi.SupplyScore) > 15 THEN 3
            ELSE 2
        END,
        DATEADD(DAY, 30, GETDATE())
    FROM MarketIntelligence mi
    JOIN Skills s ON mi.SkillID = s.SkillID
    JOIN @RelevantSkills rs ON s.SkillName = rs.SkillName
    WHERE mi.Location   = @RecruiterLocation
      AND mi.LastUpdated > DATEADD(DAY, -14, GETDATE());

    INSERT INTO @Alerts (AlertType, SkillName, Location, AvgSalary, Description, Severity, ExpiresAt)
    SELECT
        'Competitor Alert', ca.JobTitle, ca.Location, ca.ListedSalary,
        CONCAT('Competitor ', ca.CompetitorName, ' hiring for ', ca.JobTitle,
               ' at ', FORMAT(ca.ListedSalary,'N2')),
        3, DATEADD(DAY, 60, GETDATE())
    FROM CompetitorAnalysis ca
    WHERE ca.Location    = @RecruiterLocation
      AND ca.AnalysisDate > DATEADD(DAY, -30, GETDATE())
      AND EXISTS (
          SELECT 1 FROM JobPostings jp
          WHERE jp.CreatedBy = @RecruiterID
            AND ca.JobTitle LIKE '%' + jp.JobTitle + '%'
      );

    SELECT * FROM @Alerts ORDER BY Severity DESC, TriggeredAt DESC;
END;