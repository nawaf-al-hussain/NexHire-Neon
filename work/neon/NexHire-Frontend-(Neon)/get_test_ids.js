const { query } = require('./server/db');

async function getIds() {
    try {
        const jobs = await query('SELECT TOP 1 JobID FROM JobPostings WHERE IsDeleted = 0');
        const apps = await query('SELECT TOP 1 ApplicationID FROM Applications WHERE IsDeleted = 0');
        const user = await query('SELECT TOP 1 u.UserID, r.RecruiterID FROM Users u JOIN Recruiters r ON u.UserID = r.UserID WHERE u.RoleID = 2');
        console.log(JSON.stringify({
            jobId: jobs[0]?.JobID,
            appId: apps[0]?.ApplicationID,
            userId: user[0]?.UserID,
            recruiterId: user[0]?.RecruiterID
        }));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

getIds();
