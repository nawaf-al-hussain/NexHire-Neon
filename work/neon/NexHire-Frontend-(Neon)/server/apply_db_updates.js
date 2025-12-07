const { query } = require('./db');
require('dotenv').config();

async function applyUpdates() {
    try {
        console.log("Checking if 'Invited' status exists...");
        const existingStatus = await query("SELECT * FROM ApplicationStatus WHERE StatusName = 'Invited'");

        if (existingStatus.length === 0) {
            console.log("Adding 'Invited' status...");
            // Use DBCC CHECKIDENT to ensure we know the ID or just let it auto-increment
            // For consistency with my implementation which assumed ID 7, I'll check the current max
            await query("INSERT INTO ApplicationStatus (StatusName) VALUES ('Invited')");
            console.log("✅ 'Invited' status added.");
        } else {
            console.log("ℹ️ 'Invited' status already exists.");
        }

        const statuses = await query("SELECT * FROM ApplicationStatus");
        const invitedStatus = statuses.find(s => s.StatusName === 'Invited');
        const appliedStatus = statuses.find(s => s.StatusName === 'Applied');
        const withdrawnStatus = statuses.find(s => s.StatusName === 'Withdrawn');

        if (!invitedStatus) throw new Error("Could not find 'Invited' status after insert.");

        const invitedID = invitedStatus.StatusID;
        const appliedID = appliedStatus.StatusID;
        const withdrawnID = withdrawnStatus.StatusID;

        console.log(`Invited ID: ${invitedID}, Applied ID: ${appliedID}, Withdrawn ID: ${withdrawnID}`);

        console.log("Checking transitions...");
        const transitions = [
            { from: invitedID, to: appliedID },
            { from: invitedID, to: withdrawnID }
        ];

        for (const t of transitions) {
            const exists = await query(
                "SELECT 1 FROM ApplicationStatusTransitions WHERE FromStatusID = ? AND ToStatusID = ?",
                [t.from, t.to]
            );
            if (exists.length === 0) {
                console.log(`Adding transition ${t.from} -> ${t.to}...`);
                await query("INSERT INTO ApplicationStatusTransitions (FromStatusID, ToStatusID) VALUES (?, ?)", [t.from, t.to]);
            }
        }
        console.log("✅ Transitions verified/added.");

    } catch (err) {
        console.error("❌ Failed to apply database updates:", err);
    } finally {
        process.exit();
    }
}

applyUpdates();
