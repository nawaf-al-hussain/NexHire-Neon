const { query } = require('./db.js');

async function run() {
    try {
        const res = await query(`
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = 'MicroAssessments';
        `);
        console.log("=== MicroAssessments Table ===");
        console.table(res);

        const res2 = await query(`
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = 'AssessmentAttempts';
        `);
        console.log("\n=== AssessmentAttempts Table ===");
        console.table(res2);
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}
run();
