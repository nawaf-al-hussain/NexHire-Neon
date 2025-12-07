const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DB_CONNECTION_STRING
});

async function seedRemaining() {
    const client = await pool.connect();
    try {
        // Get users with role 2 (Recruiter)
        let recruiters = await client.query('SELECT r.recruiterid, r.userid FROM recruiters r');
        console.log('Found ' + recruiters.rows.length + ' recruiters');

        // If no recruiters, create some from users with role 2
        if (recruiters.rows.length === 0) {
            console.log('No recruiters found, creating from users with role 2...');
            const users = await client.query("SELECT userid, username FROM users WHERE roleid = 2");
            
            for (let i = 0; i < users.rows.length; i++) {
                const user = users.rows[i];
                await client.query(
                    'INSERT INTO recruiters (userid, department) VALUES ($1, $2)',
                    [user.userid, 'HR']
                );
            }
            
            recruiters = await client.query('SELECT recruiterid, userid FROM recruiters');
            console.log('Created ' + recruiters.rows.length + ' recruiters');
        }

        // Get hired applications
        const hiredAppsResult = await client.query(`
            SELECT a.applicationid, a.candidateid, a.jobid, a.applieddate 
            FROM applications a 
            WHERE a.statusid = 4 AND a.isdeleted = false
        `);
        const hiredApps = hiredAppsResult.rows;
        console.log('Found ' + hiredApps.length + ' hired applications');

        // Get candidates in interview/screening stages
        const activeAppsResult = await client.query(`
            SELECT a.applicationid, a.candidateid, a.jobid, a.applieddate 
            FROM applications a 
            WHERE a.statusid IN (2, 3) AND a.isdeleted = false
        `);
        const activeApps = activeAppsResult.rows;
        console.log('Found ' + activeApps.length + ' active applications');

        // Seed InterviewSchedules
        console.log('\n=== Seeding InterviewSchedules ===');
        let interviewCount = 0;
        
        const existingSchedules = await client.query('SELECT applicationid FROM interviewschedules');
        const existingScheduleApps = new Set(existingSchedules.rows.map(function(r) { return r.applicationid; }));

        for (let i = 0; i < activeApps.length; i++) {
            const app = activeApps[i];
            if (existingScheduleApps.has(app.applicationid)) continue;
            
            const numInterviews = Math.floor(Math.random() * 2) + 1;
            
            for (let j = 0; j < numInterviews; j++) {
                const recruiter = recruiters.rows[Math.floor(Math.random() * recruiters.rows.length)];
                
                const daysAgo = Math.floor(Math.random() * 30);
                const interviewDate = new Date();
                interviewDate.setDate(interviewDate.getDate() - daysAgo);
                interviewDate.setHours(10 + Math.floor(Math.random() * 8));
                
                const interviewStart = interviewDate.toISOString();
                const endDate = new Date(interviewDate);
                endDate.setHours(endDate.getHours() + 1);
                const interviewEnd = endDate.toISOString();
                
                try {
                    await client.query(
                        'INSERT INTO interviewschedules (applicationid, recruiterid, interviewstart, interviewend, candidatconfirmed) VALUES ($1, $2, $3, $4, $5)',
                        [app.applicationid, recruiter.recruiterid, interviewStart, interviewEnd, true]
                    );
                    interviewCount++;
                } catch (e) {
                    console.log('Schedule error: ' + e.message);
                }
            }
        }
        console.log('Inserted ' + interviewCount + ' interview schedules');

        // Seed InterviewFeedback
        console.log('\n=== Seeding InterviewFeedback ===');
        const schedules = await client.query('SELECT scheduleid, applicationid, recruiterid FROM interviewschedules');
        console.log('Found ' + schedules.rows.length + ' schedules');
        
        let feedbackCount = 0;
        const existingFeedback = await client.query('SELECT scheduleid FROM interviewfeedback');
        const existingFeedbackSchedules = new Set(existingFeedback.rows.map(function(r) { return r.scheduleid; }));

        const comments = ['Great candidate!', 'Strong technical skills', 'Good communication', 'Would recommend', 'Excellent fit'];

        for (let i = 0; i < schedules.rows.length; i++) {
            const schedule = schedules.rows[i];
            if (existingFeedbackSchedules.has(schedule.scheduleid)) continue;
            
            const technicalScore = Math.floor(Math.random() * 30) + 70;
            const communicationScore = Math.floor(Math.random() * 30) + 70;
            const cultureFitScore = Math.floor(Math.random() * 30) + 70;
            const sentimentScore = (Math.random() * 0.6) + 0.4;
            const comment = comments[Math.floor(Math.random() * comments.length)];
            
            try {
                await client.query(
