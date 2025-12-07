const { query, connectDB } = require('./db');

async function checkProcedures() {
    await connectDB();
    try {
        // Check if sp_GenerateLearningPath exists
        const procs = await query(`
            SELECT ROUTINE_NAME, ROUTINE_DEFINITION 
            FROM INFORMATION_SCHEMA.ROUTINES 
            WHERE ROUTINE_TYPE = 'PROCEDURE' 
            AND ROUTINE_NAME LIKE '%LearningPath%'
        `);
        console.log("\n=== Learning Path Procedures ===");
        console.log(procs);

        // Check PersonalizedLearningPaths table
        const tables = await query(`
            SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_NAME = 'PersonalizedLearningPaths'
        `);
        console.log("\n=== PersonalizedLearningPaths Table ===");
        console.log(tables);

        // Check LearningResources table
        const resources = await query(`
            SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_NAME = 'LearningResources'
        `);
        console.log("\n=== LearningResources Table ===");
        console.log(resources);

        // Check all procedures
        const allProcs = await query(`
            SELECT ROUTINE_NAME FROM INFORMATION_SCHEMA.ROUTINES 
            WHERE ROUTINE_TYPE = 'PROCEDURE'
            ORDER BY ROUTINE_NAME
        `);
        console.log("\n=== All Procedures ===");
        console.log(allProcs.map(p => p.ROUTINE_NAME));

    } catch (e) {
        console.error("Error:", e.message);
    }
    process.exit(0);
}

checkProcedures();
