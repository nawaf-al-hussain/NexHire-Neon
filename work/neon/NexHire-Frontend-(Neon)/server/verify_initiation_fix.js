const { query } = require('./db');
require('dotenv').config();

async function verifyInitiation() {
    try {
        // Find a candidate and a job to test with
        const candidates = await query("SELECT TOP 1 CandidateID FROM Candidates");
        const jobs = await query("SELECT TOP 1 JobID FROM JobPostings WHERE IsActive = 1 AND IsDeleted = 0");

        if (candidates.length === 0 || jobs.length === 0) {
            console.log("No candidates or jobs found to test with.");
            return;
        }

        const candidateID = candidates[0].CandidateID;
        const jobID = jobs[0].JobID;

        console.log(`Testing with JobID: ${jobID}, CandidateID: ${candidateID}`);

        // Check if an application already exists
        const existing = await query("SELECT ApplicationID, StatusID FROM Applications WHERE JobID = ? AND CandidateID = ?", [jobID, candidateID]);

        if (existing.length > 0) {
            console.log(`Application already exists with StatusID: ${existing[0].StatusID}. Deleting it for clean test...`);
            await query("DELETE FROM Applications WHERE ApplicationID = ?", [existing[0].ApplicationID]);
        }

        // Simulate the INSERT that failed
        console.log("Attempting to insert application with StatusID 7 (Invited)...");
        await query("INSERT INTO Applications (JobID, CandidateID, StatusID) VALUES (?, ?, 7)", [jobID, candidateID]);
        console.log("✅ Insert successful! Foreign Key constraint issue resolved.");

        // Cleanup
        await query("DELETE FROM Applications WHERE JobID = ? AND CandidateID = ?", [jobID, candidateID]);
        console.log("Cleaned up test data.");

    } catch (err) {
        console.error("❌ Verification failed:", err.message);
    } finally {
        process.exit();
    }
}

verifyInitiation();
