const { query, connectDB } = require('./db');
const fs = require('fs');
const path = require('path');

async function updateSP() {
    await connectDB();

    const spSql = fs.readFileSync(path.join(__dirname, 'sql/sp_AnalyzeCandidateSentiment.sql'), 'utf8');

    // Split by GO and execute each batch
    const batches = spSql.split(/GO\s*\n/i);

    for (const batch of batches) {
        if (batch.trim()) {
            try {
                await query(batch);
                console.log('Batch executed successfully');
            } catch (err) {
                console.error('Error executing batch:', err.message);
            }
        }
    }

    console.log('Stored procedure updated!');
    process.exit();
}

updateSP();
