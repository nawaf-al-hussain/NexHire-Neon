const { query } = require('./db');

async function test() {
    try {
        const jobs = await query("SELECT jobid, jobtitle FROM jobpostings LIMIT 1");
        console.log("jobpostings output:");
        console.log(JSON.stringify(jobs, null, 2));

        const vw_jobs = await query("SELECT jobid, jobtitle FROM vw_vacancyutilization LIMIT 1");
        console.log("vw_vacancyutilization output:");
        console.log(JSON.stringify(vw_jobs, null, 2));

    } catch (e) {
        console.error("Error:", e);
    }
    process.exit(0);
}

test();
