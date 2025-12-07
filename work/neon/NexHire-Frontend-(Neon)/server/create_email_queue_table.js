require('dotenv').config();

const msnodesql = require("msnodesqlv8");
// Use the exact connection string from .env
const connectionString = "Driver={ODBC Driver 17 for SQL Server};Server=DESKTOP-OJ944NP\\SQLEXPRESS;Database=RecruitmentDB;Trusted_Connection=yes;";

const query = (sqlQuery, params = []) => {
    return new Promise((resolve, reject) => {
        msnodesql.query(connectionString, sqlQuery, params, (err, rows) => {
            if (err) {
                console.error("Database Query Error:", err.message);
                console.error("SQL:", sqlQuery);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

async function createEmailQueueTable() {
    try {
        console.log("Creating EmailQueue table if not exists...");

        // Check if table exists
        const tableExists = await query(`
            SELECT * FROM sys.tables WHERE name = 'EmailQueue'
        `);

        if (tableExists.length === 0) {
            // Create the table
            await query(`
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
                    ErrorMessage NVARCHAR(MAX) NULL
                )
            `);
            console.log("✅ EmailQueue table created successfully.");

            // Create indexes
            await query(`CREATE INDEX IX_EmailQueue_IsSent ON EmailQueue(IsSent)`);
            await query(`CREATE INDEX IX_EmailQueue_CreatedAt ON EmailQueue(CreatedAt)`);
            await query(`CREATE INDEX IX_EmailQueue_CandidateID ON EmailQueue(CandidateID)`);
            console.log("✅ Indexes created successfully.");
        } else {
            console.log("ℹ️  EmailQueue table already exists.");
        }

        // Insert some sample data for testing
        const sampleData = await query("SELECT TOP 1 CandidateID FROM Candidates");
        if (sampleData.length > 0) {
            const candidateId = sampleData[0].CandidateID;

            // Check if we already have test data
            const existingEmails = await query("SELECT COUNT(*) as cnt FROM EmailQueue WHERE EmailType = 'Test'");
            if (existingEmails[0].cnt === 0) {
                await query(`
                    INSERT INTO EmailQueue (CandidateID, EmailType, Subject, Body, IsSent)
                    VALUES 
                        (?, 'Interview Invitation', 'Interview Scheduled', 'Your interview has been scheduled for tomorrow.', 1),
                        (?, 'Application Received', 'Application Under Review', 'We have received your application and are reviewing it.', 1),
                        (?, 'Job Alert', 'New Job Matching Your Profile', 'A new job matching your skills is now available.', 0)
                `, [candidateId, candidateId, candidateId]);
                console.log("✅ Sample email data inserted.");
            } else {
                console.log("ℹ️  Sample email data already exists.");
            }
        }

        console.log("✅ EmailQueue setup complete!");

    } catch (err) {
        console.error("❌ Failed to create EmailQueue table:", err.message);
    } finally {
        process.exit();
    }
}

createEmailQueueTable();
