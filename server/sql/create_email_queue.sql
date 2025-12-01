-- EmailQueue Table for NexHire Email Notification System
-- Creates the EmailQueue table to track email notifications

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'EmailQueue')
BEGIN
    CREATE TABLE EmailQueue (
        EmailID INT IDENTITY(1,1) PRIMARY KEY,
        CandidateID INT NULL,
        EmailType NVARCHAR(50) NOT NULL,
        Subject NVARCHAR(255) NOT NULL,
        Body NVARCHAR(MAX) NULL,
        IsSent BIT DEFAULT 0,
        SentAt DATETIME2 NULL,
        CreatedAt DATETIME2 DEFAULT GETDATE(),
        RetryCount INT DEFAULT 0,
        ErrorMessage NVARCHAR(MAX) NULL,
        
        -- Foreign key to Candidates table (allows NULL for system emails)
        CONSTRAINT FK_EmailQueue_Candidates 
            FOREIGN KEY (CandidateID) REFERENCES Candidates(CandidateID)
            ON DELETE SET NULL
    );

    -- Create index for faster queries
    CREATE INDEX IX_EmailQueue_IsSent ON EmailQueue(IsSent);
    CREATE INDEX IX_EmailQueue_CreatedAt ON EmailQueue(CreatedAt);
    CREATE INDEX IX_EmailQueue_CandidateID ON EmailQueue(CandidateID);

    PRINT 'EmailQueue table created successfully.';
END
ELSE
BEGIN
    PRINT 'EmailQueue table already exists.';
END
GO
