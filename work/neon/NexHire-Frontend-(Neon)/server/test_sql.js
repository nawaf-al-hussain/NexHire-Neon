const { query } = require('./db');
async function test() {
    try {
        const res = await query(`SELECT name, type_desc, is_unique FROM sys.indexes WHERE object_id = OBJECT_ID('SkillVerifications')`);
        console.log('indexes:', res);

        // Also let's try to simulate the same insert again just in case there's a unique constraint violation that threw earlier.
        // I'll try inserting CandidateID 47 and SkillID 1 again, which I already inserted.
        try {
            await query(`INSERT INTO SkillVerifications (CandidateID, SkillID, AssessmentID, VerificationMethod, VerificationScore, VerifiedAt, IsVerified) OUTPUT inserted.VerificationID VALUES (47, 1, 1, 'CodeTest', 74, GETDATE(), 1)`);
            console.log("Second insert passed!");
        } catch (e) {
            console.log("Second insert failed:", e.message);
        }
    } catch (e) {
        console.error('SQL Error:', e);
    }
    process.exit();
}
test();
