CREATE PROCEDURE sp_CheckConsentExpiry
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE ConsentManagement
    SET ExpiryDate = DATEADD(DAY, 30, GETDATE())
    WHERE GivenAt < DATEADD(YEAR, -1, GETDATE())
      AND ExpiryDate IS NULL
      AND RevokedAt IS NULL;
    
    UPDATE ConsentManagement
    SET RevokedAt = GETDATE()
    WHERE ExpiryDate < GETDATE()
      AND RevokedAt IS NULL;
    
    PRINT 'Consent expiry check completed.';
END