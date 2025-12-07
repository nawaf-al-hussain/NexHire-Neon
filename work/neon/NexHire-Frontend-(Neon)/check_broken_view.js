const { query } = require('./server/db');

async function checkView() {
    try {
        console.log("Checking vw_GhostingRiskDashboard...");
        const results = await query('SELECT TOP 1 * FROM vw_GhostingRiskDashboard');
        if (results.length > 0) {
            console.log("Columns:", Object.keys(results[0]));
            console.log("Sample Row:", results[0]);
        } else {
            console.log("View is empty.");
        }
    } catch (err) {
        console.error("VIEW ERROR:", err.message);
    }
}

checkView();
