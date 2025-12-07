-- Seed Sample Data for Referral Intelligence
-- Run this script in SSMS to populate referral-related tables with test data

-- First, clear existing data (optional - comment out if you want to keep existing data)
DELETE FROM ReferralPerformance;
DELETE FROM ReferralNetwork;
DELETE FROM NetworkStrength;
PRINT 'Cleared existing referral data';

-- Use a temp table to get candidate IDs
DECLARE @CandidateIDs TABLE (RowNum INT, CandidateID INT);
INSERT INTO @CandidateIDs
SELECT ROW_NUMBER() OVER (ORDER BY CandidateID ASC) AS RowNum, CandidateID
FROM Candidates;

-- Get candidate IDs by row number
DECLARE @C1 INT, @C2 INT, @C3 INT, @C4 INT, @C5 INT, @C6 INT, @C7 INT, @C8 INT, @C9 INT, @C10 INT;
DECLARE @CandidateCount INT;

SELECT @CandidateCount = COUNT(*) FROM @CandidateIDs;

SELECT @C1 = CandidateID FROM @CandidateIDs WHERE RowNum = 1;
SELECT @C2 = CandidateID FROM @CandidateIDs WHERE RowNum = 2;
SELECT @C3 = CandidateID FROM @CandidateIDs WHERE RowNum = 3;
SELECT @C4 = CandidateID FROM @CandidateIDs WHERE RowNum = 4;
SELECT @C5 = CandidateID FROM @CandidateIDs WHERE RowNum = 5;
SELECT @C6 = CandidateID FROM @CandidateIDs WHERE RowNum = 6;
SELECT @C7 = CandidateID FROM @CandidateIDs WHERE RowNum = 7;
SELECT @C8 = CandidateID FROM @CandidateIDs WHERE RowNum = 8;
SELECT @C9 = CandidateID FROM @CandidateIDs WHERE RowNum = 9;
SELECT @C10 = CandidateID FROM @CandidateIDs WHERE RowNum = 10;

PRINT CONCAT('Found ', @CandidateCount, ' candidates');

-- Insert sample NetworkStrength data
-- NetworkStrength columns: ConnectionStrength(1-10), TrustLevel(1-5)
IF @CandidateCount >= 5
BEGIN
    -- C1's network
    IF NOT EXISTS (SELECT 1 FROM NetworkStrength WHERE CandidateID = @C1)
    BEGIN
        INSERT INTO NetworkStrength (CandidateID, ConnectionID, ConnectionType, ConnectionStrength, LastInteraction, InteractionFrequency, TrustLevel)
        VALUES 
            (@C1, @C2, 'Colleague', 9, DATEADD(DAY, -5, GETDATE()), 'Weekly', 4),
            (@C1, @C3, 'Friend', 7, DATEADD(DAY, -15, GETDATE()), 'Monthly', 3),
            (@C1, @C4, 'Colleague', 10, DATEADD(DAY, -2, GETDATE()), 'Daily', 5),
            (@C1, @C5, 'Industry', 6, DATEADD(DAY, -30, GETDATE()), 'Yearly', 2);
    END
    
    -- C2's network
    IF NOT EXISTS (SELECT 1 FROM NetworkStrength WHERE CandidateID = @C2)
    BEGIN
        INSERT INTO NetworkStrength (CandidateID, ConnectionID, ConnectionType, ConnectionStrength, LastInteraction, InteractionFrequency, TrustLevel)
        VALUES 
            (@C2, @C1, 'Colleague', 9, DATEADD(DAY, -5, GETDATE()), 'Weekly', 4),
            (@C2, @C6, 'Colleague', 8, DATEADD(DAY, -7, GETDATE()), 'Weekly', 4),
            (@C2, @C7, 'Industry', 5, DATEADD(DAY, -20, GETDATE()), 'Monthly', 2);
    END
    
    -- C3's network
    IF NOT EXISTS (SELECT 1 FROM NetworkStrength WHERE CandidateID = @C3)
    BEGIN
        INSERT INTO NetworkStrength (CandidateID, ConnectionID, ConnectionType, ConnectionStrength, LastInteraction, InteractionFrequency, TrustLevel)
        VALUES 
            (@C3, @C1, 'Friend', 7, DATEADD(DAY, -15, GETDATE()), 'Monthly', 3),
            (@C3, @C8, 'Colleague', 9, DATEADD(DAY, -3, GETDATE()), 'Weekly', 5),
            (@C3, @C9, 'Classmate', 6, DATEADD(DAY, -25, GETDATE()), 'Yearly', 3);
    END
    
    -- C4's network
    IF NOT EXISTS (SELECT 1 FROM NetworkStrength WHERE CandidateID = @C4)
    BEGIN
        INSERT INTO NetworkStrength (CandidateID, ConnectionID, ConnectionType, ConnectionStrength, LastInteraction, InteractionFrequency, TrustLevel)
        VALUES 
            (@C4, @C1, 'Colleague', 10, DATEADD(DAY, -2, GETDATE()), 'Daily', 5),
            (@C4, @C10, 'Colleague', 8, DATEADD(DAY, -10, GETDATE()), 'Weekly', 4);
    END
    
    PRINT 'NetworkStrength data inserted successfully';
END
ELSE
BEGIN
    PRINT 'Not enough candidates to create network. Need at least 5 candidates.';
END

-- Insert sample ReferralNetwork data
-- ReferralStrength(1-10), QualityScore(1-10)
DECLARE @JobCount INT;
SELECT @JobCount = COUNT(*) FROM JobPostings WHERE IsActive = 1;

IF @JobCount >= 1 AND @CandidateCount >= 5
BEGIN
    -- Get a job ID for referrals
    DECLARE @JobID INT;
    SELECT TOP 1 @JobID = JobID FROM JobPostings WHERE IsActive = 1;
    
    -- Insert referral records
    IF NOT EXISTS (SELECT 1 FROM ReferralNetwork)
    BEGIN
        -- Successful referrals (HireResult = 1)
        INSERT INTO ReferralNetwork (ReferrerID, ReferredCandidateID, JobID, ReferralStrength, RelationshipType, ReferralDate, BonusAmount, HireResult, QualityScore)
        VALUES 
            (@C1, @C2, @JobID, 9, 'FormerColleague', DATEADD(DAY, -60, GETDATE()), 500.00, 1, 9),
            (@C1, @C3, @JobID, 7, 'Friend', DATEADD(DAY, -45, GETDATE()), 500.00, 1, 8),
            (@C4, @C5, @JobID, 10, 'FormerColleague', DATEADD(DAY, -30, GETDATE()), 500.00, 1, 10);
        
        -- Pending referrals (HireResult = NULL)
        INSERT INTO ReferralNetwork (ReferrerID, ReferredCandidateID, JobID, ReferralStrength, RelationshipType, ReferralDate, BonusAmount, HireResult, QualityScore)
        VALUES 
            (@C2, @C6, @JobID, 8, 'Classmate', DATEADD(DAY, -10, GETDATE()), NULL, NULL, 7),
            (@C3, @C7, @JobID, 9, 'Mentor', DATEADD(DAY, -5, GETDATE()), NULL, NULL, 8);
        
        -- Unsuccessful referrals (HireResult = 0)
        INSERT INTO ReferralNetwork (ReferrerID, ReferredCandidateID, JobID, ReferralStrength, RelationshipType, ReferralDate, BonusAmount, HireResult, QualityScore)
        VALUES 
            (@C1, @C8, @JobID, 6, 'Other', DATEADD(DAY, -90, GETDATE()), 0, 0, 4);
        
        PRINT 'ReferralNetwork data inserted successfully';
    END
END
ELSE
BEGIN
    PRINT 'Not enough jobs or candidates to create referrals.';
END

-- Insert sample ReferralPerformance data
-- ConversionRate is DECIMAL(5,2) - max 999.99
-- AvgQualityScore is DECIMAL(3,2) - max 9.99
IF @CandidateCount >= 5
BEGIN
    IF NOT EXISTS (SELECT 1 FROM ReferralPerformance)
    BEGIN
        INSERT INTO ReferralPerformance (ReferrerID, TotalReferrals, SuccessfulReferrals, ConversionRate, AvgQualityScore, TotalBonusEarned, LastReferralDate)
        VALUES 
            (@C1, 3, 2, 66.67, 7.33, 1000.00, DATEADD(DAY, -45, GETDATE())),
            (@C2, 1, 0, 0.00, 7.00, 0.00, DATEADD(DAY, -10, GETDATE())),
            (@C3, 1, 0, 0.00, 8.00, 0.00, DATEADD(DAY, -5, GETDATE())),
            (@C4, 1, 1, 100.00, 9.50, 500.00, DATEADD(DAY, -30, GETDATE()));
        
        PRINT 'ReferralPerformance data inserted successfully';
    END
END

-- Verify the data
SELECT 'NetworkStrength' AS TableName, COUNT(*) AS RecordCount FROM NetworkStrength
UNION ALL
SELECT 'ReferralNetwork', COUNT(*) FROM ReferralNetwork
UNION ALL
SELECT 'ReferralPerformance', COUNT(*) FROM ReferralPerformance;

PRINT 'Sample referral data seeding complete!';
