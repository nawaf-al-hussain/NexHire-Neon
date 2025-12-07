const { query } = require('./db');
require('dotenv').config();

async function checkStatus() {
    try {
        const statuses = await query("SELECT * FROM ApplicationStatus");
        console.log("Current Application Statuses:");
        console.table(statuses);

        const transitions = await query("SELECT * FROM ApplicationStatusTransitions");
        console.log("Current Application Status Transitions:");
        console.table(transitions);
    } catch (err) {
        console.error("Error checking status:", err);
    } finally {
        process.exit();
    }
}

checkStatus();
