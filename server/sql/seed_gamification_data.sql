-- Seed Sample Data for Gamification
-- Run this script in SSMS to populate CandidateGamification with test data

-- First, check current state
SELECT 'Current Gamification Data:' AS Info;
SELECT cg.CandidateID, c.FullName, cg.Points, cg.Level, cg.StreakDays, cg.EngagementScore
FROM CandidateGamification cg
JOIN Candidates c ON cg.CandidateID = c.CandidateID;

-- Update existing gamification records with sample points
PRINT 'Updating gamification data with sample points...';

-- Update all candidates with random points between 100 and 5000
UPDATE CandidateGamification
SET 
    Points = ABS(CHECKSUM(NEWID())) % 4900 + 100,
    Level = CASE 
        WHEN Points < 500 THEN 1
        WHEN Points < 1000 THEN 2
        WHEN Points < 2000 THEN 3
        WHEN Points < 3500 THEN 4
        ELSE 5
    END,
    StreakDays = ABS(CHECKSUM(NEWID())) % 30 + 1,
    EngagementScore = ABS(CHECKSUM(NEWID())) % 50 + 50,
    Badges = CASE 
        WHEN Points > 4000 THEN '["Gold Champion","Top Performer","Early Adopter"]'
        WHEN Points > 2500 THEN '["Silver Star","Rising Talent"]'
        WHEN Points > 1000 THEN '["Bronze Achiever"]'
        ELSE '[]'
    END;

-- Verify the update
SELECT 'Updated Gamification Data:' AS Info;
SELECT TOP 20 
    cg.CandidateID, 
    c.FullName, 
    cg.Points, 
    cg.Level, 
    cg.StreakDays,
    cg.EngagementScore,
    cg.Badges
FROM CandidateGamification cg
JOIN Candidates c ON cg.CandidateID = c.CandidateID
ORDER BY cg.Points DESC;

-- Show statistics
SELECT 'Statistics:' AS Info;
SELECT 
    COUNT(*) AS TotalCandidates,
    SUM(CASE WHEN Points > 0 THEN 1 ELSE 0 END) AS CandidatesWithPoints,
    AVG(Points) AS AvgPoints,
    MAX(Points) AS MaxPoints,
    MIN(Points) AS MinPoints
FROM CandidateGamification;

PRINT 'Gamification data seeding complete!';
