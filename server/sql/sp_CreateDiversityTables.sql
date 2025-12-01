-- Diversity Goals and Bias Detection Tables
-- Run this script to create required tables

-- Drop existing tables if they have wrong schema
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'DiversityGoals')
    DROP TABLE DiversityGoals;
GO

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'BiasDetectionLogs')
    DROP TABLE BiasDetectionLogs;
GO

-- DiversityGoals Table
CREATE TABLE DiversityGoals (
    GoalID INT IDENTITY(1,1) PRIMARY KEY,
    RecruiterID INT NULL,
    MetricType NVARCHAR(50) NOT NULL,
    TargetPercentage DECIMAL(5,2) NOT NULL,
    CurrentPercentage DECIMAL(5,2) DEFAULT 0,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE()
);
GO

-- BiasDetectionLogs Table
CREATE TABLE BiasDetectionLogs (
    DetectionID INT IDENTITY(1,1) PRIMARY KEY,
    RecruiterID INT NULL,
    DetectionType NVARCHAR(100) NOT NULL,
    Severity NVARCHAR(20) NOT NULL,
    Details NVARCHAR(MAX) NOT NULL,
    SuggestedActions NVARCHAR(MAX) NULL,
    IsResolved BIT DEFAULT 0,
    DetectedAt DATETIME DEFAULT GETDATE(),
    ResolvedAt DATETIME NULL
);
GO

-- Insert sample data for DiversityGoals
INSERT INTO DiversityGoals (MetricType, TargetPercentage, CurrentPercentage, StartDate, EndDate, IsActive)
VALUES 
    ('Gender', 40.00, 35.50, '2025-01-01', '2025-12-31', 1),
    ('Ethnicity', 30.00, 22.00, '2025-01-01', '2025-12-31', 1),
    ('Disability', 10.00, 8.50, '2025-01-01', '2025-12-31', 1),
    ('Veteran', 15.00, 12.00, '2025-01-01', '2025-12-31', 1);
GO

-- Insert sample data for BiasDetectionLogs
INSERT INTO BiasDetectionLogs (DetectionType, Severity, Details, SuggestedActions, IsResolved, DetectedAt)
VALUES 
    ('Geographic', 'Medium', 'Hiring rate for candidates from New York is 45% vs 62% for other locations', 'Review job posting locations and recruitment sources', 0, DATEADD(day, -5, GETDATE())),
    ('Experience', 'High', 'Candidates with 0-2 years experience have 22% hire rate vs 68% for 6-10 years', 'Implement blind resume screening', 0, DATEADD(day, -3, GETDATE())),
    ('Gender', 'Low', 'Slight variance in interview scores between genders (3%)', 'Monitor ongoing', 1, DATEADD(day, -10, GETDATE())),
    ('Age', 'Medium', 'Candidates over 50 have 15% lower callback rate', 'Include age-diverse candidate panels', 0, DATEADD(day, -1, GETDATE()));
GO

PRINT 'Diversity tables created and populated successfully!';
GO
