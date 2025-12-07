const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DB_CONNECTION_STRING
});

async function seedApplications() {
    const client = await pool.connect();
    try {
        // Get existing candidates and jobs
        const candidates = await client.query('SELECT candidateid FROM candidates ORDER BY candidateid');
        const jobs = await client.query('SELECT jobid FROM jobpostings ORDER BY jobid');

        // Check existing applications
        const existingApps = await client.query('SELECT candidateid, jobid FROM applications');
        const existingPairs = new Set(existingApps.rows.map(r => `${r.candidateid}-${r.jobid}`));

        console.log(`Found ${candidates.rows.length} candidates, ${jobs.rows.length} jobs, ${existingApps.rows.length} existing applications`);

        // Create applications - spread across different statuses
        const applications = [];

        // For each job, create applications from multiple candidates
        for (const job of jobs.rows) {
            // Get 5-8 random candidates per job
            const numApps = Math.floor(Math.random() * 4) + 5;
            const shuffledCandidates = [...candidates.rows].sort(() => 0.5 - Math.random());
            const selectedCandidates = shuffledCandidates.slice(0, numApps);

            for (let i = 0; i < selectedCandidates.length; i++) {
                const candidate = selectedCandidates[i];
                const key = `${candidate.candidateid}-${job.jobid}`;

                // Skip if already exists
                if (existingPairs.has(key)) {
                    continue;
                }

                // More candidates in early stages, fewer in later stages
                let status;
                if (i < 2) status = 1; // Applied
                else if (i < 3) status = 7; // Invited
                else if (i < 4) status = 2; // Screening
                else if (i < 5) status = 3; // Interview
                else if (i < 6) status = 4; // Hired
                else if (i < 7) status = 5; // Rejected
                else status = 6; // Withdrawn

                // Random applied date within last 60 days
                const daysAgo = Math.floor(Math.random() * 60);
                const appliedDate = new Date();
                appliedDate.setDate(appliedDate.getDate() - daysAgo);

                // Status changed date (after applied date)
                const statusChangedDate = new Date(appliedDate);
                statusChangedDate.setDate(statusChangedDate.getDate() + Math.floor(Math.random() * 10));

                applications.push({
                    candidateid: candidate.candidateid,
                    jobid: job.jobid,
                    statusid: status,
                    applieddate: appliedDate,
                    statuschangedat: statusChangedDate,
                    isdeleted: false
                });
            }
        }

        console.log(`Generated ${applications.length} new applications to insert`);

        // Insert applications
        let inserted = 0;
        for (const app of applications) {
            try {
                await client.query(
                    `INSERT INTO applications (candidateid, jobid, statusid, applieddate, statuschangedat, isdeleted)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [app.candidateid, app.jobid, app.statusid, app.applieddate, app.statuschangedat, app.isdeleted]
                );
                inserted++;
            } catch (e) {
                console.log(`Skipped: ${e.message}`);
            }
        }

        console.log(`✅ Inserted ${inserted} new applications!`);

        // Verify the data
        const count = await client.query('SELECT COUNT(*) FROM applications');
        console.log(`Total applications in database: ${count.rows[0].count}`);

        // Check status breakdown
        const statusBreakdown = await client.query(`
            SELECT s.statusname, COUNT(a.applicationid) as count
            FROM applications a
            JOIN applicationstatus s ON a.statusid = s.statusid
            GROUP BY s.statusname
            ORDER BY count DESC
        `);
        console.log('\nStatus breakdown:');
        statusBreakdown.rows.forEach(r => console.log(`  ${r.statusname}: ${r.count}`));

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

seedApplications();
