const { query } = require('./server/db');

async function getView() {
    try {
        const sql = "SELECT definition FROM sys.sql_modules WHERE object_id = OBJECT_ID('vw_GhostingRiskDashboard')";
        const results = await query(sql);
        if (results.length > 0) {
            console.log(results[0].definition);
        } else {
            console.log("View not found in sys.sql_modules.");
        }
    } catch (err) {
        console.error("ERROR:", err.message);
    }
}

getView();
