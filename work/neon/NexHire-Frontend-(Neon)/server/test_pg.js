const { query, connectDB, pool } = require("./db");

async function testConnection() {
    try {
        console.log("--- Neon PostgreSQL Connectivity Test ---");
        await connectDB();
        
        console.log("\n1. Testing basic query...");
        const now = await query("SELECT NOW() as current_time");
        console.log("Current Database Time:", now[0].current_time);

        console.log("\n2. Listing tables in 'public' schema...");
        const tables = await query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);
        
        if (tables.length === 0) {
            console.log("No tables found in 'public' schema.");
        } else {
            console.log(`Found ${tables.length} tables:`);
            tables.forEach(t => console.log(` - ${t.table_name}`));
        }

        console.log("\n3. Testing parameter conversion (SQL Server '?' style)...");
        // Our db.js handles '?' to '$n' conversion
        const paramTest = await query("SELECT ? as val1, ? as val2", ['Hello', 123]);
        console.log("Parameter Test Result:", paramTest[0]);

        console.log("\n✅ Connectivity test completed successfully!");
    } catch (err) {
        console.error("\n❌ Connectivity test failed!");
        console.error(err);
    } finally {
        await pool.end();
    }
}

testConnection();
