const { query, connectDB } = require('./server/db');

async function test() {
    await connectDB();
    const discoverRes = await query("SELECT j.*, (SELECT COUNT(*) FROM jobskills js JOIN candidateskills cs ON js.skillid = cs.skillid WHERE js.jobid = j.jobid AND cs.candidateid = (SELECT candidateid FROM candidates WHERE userid = 1)) as matchedskillscount, CASE WHEN sr.istransparent = true THEN sr.minsalary ELSE NULL END AS salarymin, CASE WHEN sr.istransparent = true THEN sr.maxsalary ELSE NULL END AS salarymax FROM jobpostings j LEFT JOIN jobsalaryranges sr ON j.jobid = sr.jobid WHERE j.isactive = true AND j.isdeleted = false AND j.jobid NOT IN (SELECT jobid FROM applications WHERE candidateid = (SELECT candidateid FROM candidates WHERE userid = 1)) LIMIT 1", [1, 1]);
    console.log("Discover Jobs:", discoverRes);
    
    const appsRes = await query("SELECT a.applicationid, a.jobid, a.applieddate, s.statusname, j.jobtitle, j.location, j.description, j.minexperience, j.vacancies, a.rejectionreason, a.withdrawalreason FROM applications a JOIN candidates c ON a.candidateid = c.candidateid JOIN jobpostings j ON a.jobid = j.jobid JOIN applicationstatus s ON a.statusid = s.statusid WHERE c.userid = 1 AND a.isdeleted = false ORDER BY a.applieddate DESC LIMIT 1", [1]);
    console.log("Applications:", appsRes);
    process.exit(0);
}

test();
