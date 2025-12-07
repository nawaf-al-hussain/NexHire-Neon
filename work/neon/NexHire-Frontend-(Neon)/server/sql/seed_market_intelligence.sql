-- Seed data for MarketIntelligence table
-- This provides sample market intelligence data for the Market Intel dashboard

-- First, check if Skills table has data, if not insert some basic skills
IF NOT EXISTS (SELECT TOP 1 FROM Skills)
BEGIN
    INSERT INTO Skills (SkillName, Category, CreatedAt)
    VALUES 
    ('JavaScript', 'Programming', GETDATE()),
    ('Python', 'Programming', GETDATE()),
    ('Java', 'Programming', GETDATE()),
    ('React', 'Frontend', GETDATE()),
    ('Angular', 'Frontend', GETDATE()),
    ('Vue.js', 'Frontend', GETDATE()),
    ('Node.js', 'Backend', GETDATE()),
    ('C#', 'Programming', GETDATE()),
    ('SQL', 'Database', GETDATE()),
    ('AWS', 'Cloud', GETDATE()),
    ('Azure', 'Cloud', GETDATE()),
    ('Google Cloud', 'Cloud', GETDATE()),
    ('Docker', 'DevOps', GETDATE()),
    ('Kubernetes', 'DevOps', GETDATE()),
    ('Machine Learning', 'Data Science', GETDATE()),
    ('Data Analysis', 'Data Science', GETDATE()),
    ('TypeScript', 'Programming', GETDATE()),
    ('Go', 'Programming', GETDATE()),
    ('Rust', 'Programming', GETDATE()),
    ('Ruby', 'Programming', GETDATE())
END

-- Insert Market Intelligence data
-- This represents real-world market conditions for various skills in different locations
INSERT INTO MarketIntelligence (SkillID, Location, DemandScore, SupplyScore, SalaryTrend, AvgSalary, Confidence, LastUpdated)
SELECT 
    s.SkillID,
    loc.Location,
    CASE 
        -- High demand skills
        WHEN s.SkillName IN ('Machine Learning', 'AWS', 'Kubernetes', 'Python') THEN 
            CASE loc.Location WHEN 'Remote' THEN 95 WHEN 'San Francisco' THEN 92 WHEN 'New York' THEN 90 ELSE 85 END
        -- Medium-high demand
        WHEN s.SkillName IN ('React', 'TypeScript', 'Node.js', 'Go', 'Rust') THEN 
            CASE loc.Location WHEN 'Remote' THEN 82 WHEN 'San Francisco' THEN 80 WHEN 'New York' THEN 78 ELSE 72 END
        -- Medium demand
        WHEN s.SkillName IN ('JavaScript', 'Java', 'C#', 'SQL', 'Docker', 'Angular') THEN 
            CASE loc.Location WHEN 'Remote' THEN 70 WHEN 'San Francisco' THEN 68 WHEN 'New York' THEN 65 ELSE 60 END
        -- Lower demand
        ELSE 50
    END AS DemandScore,
    CASE 
        -- Low supply skills (hard to find)
        WHEN s.SkillName IN ('Machine Learning', 'Rust', 'Go', 'Kubernetes', 'AWS') THEN 
            CASE loc.Location WHEN 'Remote' THEN 25 WHEN 'San Francisco' THEN 30 WHEN 'New York' THEN 28 ELSE 35 END
        -- Medium-low supply
        WHEN s.SkillName IN ('React', 'TypeScript', 'Python', 'Node.js') THEN 
            CASE loc.Location WHEN 'Remote' THEN 45 WHEN 'San Francisco' THEN 50 WHEN 'New York' THEN 48 ELSE 55 END
        -- Medium supply
        WHEN s.SkillName IN ('JavaScript', 'Java', 'SQL', 'Angular', 'Docker') THEN 
            CASE loc.Location WHEN 'Remote' THEN 60 WHEN 'San Francisco' THEN 65 WHEN 'New York' THEN 62 ELSE 70 END
        -- Higher supply
        ELSE 75
    END AS SupplyScore,
    CASE 
        WHEN s.SkillName IN ('Machine Learning', 'Kubernetes', 'AWS', 'Rust', 'Go') THEN 'Rising'
        WHEN s.SkillName IN ('Ruby', 'Angular') THEN 'Falling'
        ELSE 'Stable'
    END AS SalaryTrend,
    CASE 
        -- High paying skills
        WHEN s.SkillName IN ('Machine Learning', 'AWS', 'Kubernetes', 'Rust', 'Go') THEN 
            CASE loc.Location 
                WHEN 'San Francisco' THEN 185000
                WHEN 'New York' THEN 175000
                WHEN 'Seattle' THEN 165000
                WHEN 'Austin' THEN 145000
                WHEN 'Chicago' THEN 135000
                WHEN 'Remote' THEN 150000
                ELSE 130000
            END
        -- Medium-high paying
        WHEN s.SkillName IN ('React', 'TypeScript', 'Node.js', 'Java', 'C#', 'Python', 'Angular') THEN 
            CASE loc.Location 
                WHEN 'San Francisco' THEN 155000
                WHEN 'New York' THEN 145000
                WHEN 'Seattle' THEN 138000
                WHEN 'Austin' THEN 125000
                WHEN 'Chicago' THEN 115000
                WHEN 'Remote' THEN 120000
                ELSE 110000
            END
        -- Standard paying
        ELSE 
            CASE loc.Location 
                WHEN 'San Francisco' THEN 125000
                WHEN 'New York' THEN 115000
                WHEN 'Seattle' THEN 110000
                WHEN 'Austin' THEN 95000
                WHEN 'Chicago' THEN 90000
                WHEN 'Remote' THEN 95000
                ELSE 85000
            END
    END AS AvgSalary,
    CASE 
        WHEN s.SkillName IN ('JavaScript', 'Java', 'Python', 'SQL', 'AWS') THEN 92
        WHEN s.SkillName IN ('React', 'Node.js', 'Docker', 'Azure') THEN 85
        WHEN s.SkillName IN ('Machine Learning', 'Kubernetes', 'Go', 'Rust') THEN 78
        ELSE 70
    END AS Confidence,
    GETDATE() AS LastUpdated
FROM Skills s
CROSS JOIN (VALUES 
    ('San Francisco'), ('New York'), ('Seattle'), ('Austin'), 
    ('Chicago'), ('Boston'), ('Denver'), ('Remote')
) AS loc(Location)
WHERE s.SkillName IS NOT NULL

PRINT 'Market Intelligence seed data inserted successfully!'
SELECT COUNT(*) AS TotalRecords FROM MarketIntelligence
