CREATE PROCEDURE sp_AuditCandidateEmails
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT
        c.CandidateID,
        c.FullName,
        u.Email,
        dbo.ValidateEmail(u.Email) AS IsValidFormat,
        dbo.IsDisposableEmail(u.Email) AS IsDisposable,
        dbo.ExtractEmailDomain(u.Email) AS Domain,
        CASE 
            WHEN dbo.ValidateEmail(u.Email) = 0 THEN 'Invalid Format'
            WHEN dbo.IsDisposableEmail(u.Email) = 1 THEN 'Disposable Provider'
            ELSE 'OK'
        END AS Status
    FROM Candidates c
    JOIN Users u ON c.UserID = u.UserID
    WHERE dbo.ValidateEmail(u.Email) = 0 OR dbo.IsDisposableEmail(u.Email) = 1
    ORDER BY IsValidFormat ASC, IsDisposable DESC;
END;