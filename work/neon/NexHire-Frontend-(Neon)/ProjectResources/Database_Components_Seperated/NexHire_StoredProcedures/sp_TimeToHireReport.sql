CREATE PROCEDURE sp_TimeToHireReport
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT
        j.JobID,
        j.JobTitle,
        COUNT(a.ApplicationID) AS TotalHires,
        AVG(dbo.CalculateBusinessDays(a.AppliedDate, h.ChangedAt)) AS AvgBusinessDaysToHire,
        MIN(dbo.CalculateBusinessDays(a.AppliedDate, h.ChangedAt)) AS MinBusinessDaysToHire,
        MAX(dbo.CalculateBusinessDays(a.AppliedDate, h.ChangedAt)) AS MaxBusinessDaysToHire
    FROM Applications a
    JOIN JobPostings j ON a.JobID = j.JobID
    JOIN ApplicationStatusHistory h ON a.ApplicationID = h.ApplicationID
    WHERE h.ToStatusID = (SELECT StatusID FROM ApplicationStatus WHERE StatusName = 'Hired')
    GROUP BY j.JobID, j.JobTitle
    ORDER BY AvgBusinessDaysToHire DESC;
END;