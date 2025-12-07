const { query, connectDB } = require('./db');

async function check() {
    await connectDB();
    try {
        const r = await query("SELECT ROUTINE_NAME FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_TYPE = 'PROCEDURE' AND ROUTINE_NAME LIKE '%Sentiment%'");
        console.log('Sentiment Stored Procedures:', r);

        const t = await query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'CandidateSentiment'");
        console.log('CandidateSentiment Table:', t);
    } catch (e) {
        console.log('Error:', e.message);
    }
    process.exit();
}

check();
