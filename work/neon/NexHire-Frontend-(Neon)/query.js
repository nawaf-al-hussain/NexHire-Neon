const { query, connectDB } = require('./server/db');

async function checkDB() {
    await connectDB();
    try {
        const tableName = 'InterviewSchedules';
        const columns = await query(`SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${tableName}'`);
        console.log(`\nColumns in ${tableName}:`, columns);

        console.log("\nSample data:");
        const data = await query(`SELECT TOP 2 * FROM ${tableName}`);
        console.log(data);
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

checkDB();
