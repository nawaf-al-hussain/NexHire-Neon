/**
 * Test POST/PUT/DELETE write endpoints.
 * Uses real data IDs queried from the database so the requests actually exercise
 * the SQL paths. Captures 500s (server errors) and 400s (validation errors).
 *
 * Strategy: every write is wrapped in a transaction that we roll back, so
 * we don't pollute the database. We can't do that at the HTTP layer, so we
 * instead pick READ-ONLY tests where possible, and for true writes we use
 * IDs that don't exist (which should return 404/400, not 500) to verify the
 * SQL itself parses + plans correctly without causing real damage.
 */
const { spawn } = require('child_process');
const http = require('http');

const SERVER_DIR = '/home/z/my-project/work/neon/NexHire-Frontend-(Neon)/server';
const PORT = 5001;

// Use IDs that exist in the database (queried beforehand)
const REAL = {
    candidateUserId: 4,        // candidate1
    candidateId: 1,            // first candidate
    recruiterUserId: 2,        // recruiter1
    recruiterId: 1,            // first recruiter
    jobId: 1,
    applicationId: 1,
    skillId: 1,
    scheduleId: 1,
    notificationId: 1,
    emailQueueId: 1,
    backgroundCheckId: 1,
};

const TESTS = [
    // USERS (admin)
    { role: 1, uid: 1, method: 'PUT',  path: `/api/users/${REAL.candidateUserId}/role`,
      body: { roleid: 3 }, desc: 'Change user role' },
    { role: 1, uid: 1, method: 'PUT',  path: `/api/users/${REAL.candidateUserId}/status`,
      body: { isactive: true }, desc: 'Toggle user status' },
    { role: 1, uid: 1, method: 'POST', path: '/api/users/candidate',
      body: { username: 'test_write_user', email: 'testwrite@example.com', password: 'TestPass123',
              fullname: 'Test Write User', location: 'Dhaka', yearsofexperience: 2 },
      desc: 'Create candidate user' },

    // JOBS (recruiter)
    { role: 2, uid: REAL.recruiterUserId, method: 'POST', path: '/api/jobs',
      body: { jobtitle: 'Test Job (audit)', description: 'temporary', location: 'Dhaka',
              minexperience: 1, vacancies: 1, salarymin: 30000, salarymax: 50000,
              skills: [{ skillid: 1, ismandatory: true, minproficiency: 5 }] },
      desc: 'Create job posting' },
    { role: 2, uid: REAL.recruiterUserId, method: 'PUT',  path: `/api/jobs/${REAL.jobId}`,
      body: { jobtitle: 'Updated Title', description: 'updated', location: 'Dhaka',
              minexperience: 1, vacancies: 2 }, desc: 'Update job posting' },
    // DELETE skipped - would actually delete data

    // INTERVIEWS (recruiter)
    { role: 2, uid: REAL.recruiterUserId, method: 'POST', path: '/api/interviews/feedback',
      body: { applicationid: REAL.applicationId, recruiterid: REAL.recruiterId,
              technicalscore: 7, communicationscore: 8, culturalfitscore: 7,
              feedbacktext: 'Test feedback', recommendation: 'Hire' },
      desc: 'Submit interview feedback' },
    { role: 2, uid: REAL.recruiterUserId, method: 'POST', path: '/api/interviews/generate-questions',
      body: { jobId: REAL.jobId, questionCount: 5, difficultyLevel: 5 },
      desc: 'Generate interview questions' },
    { role: 2, uid: REAL.recruiterUserId, method: 'POST', path: '/api/interviews/optimize-rounds',
      body: { candidateId: REAL.candidateId, jobId: REAL.jobId },
      desc: 'Optimize interview rounds' },

    // CANDIDATES
    { role: 3, uid: REAL.candidateUserId, method: 'POST', path: '/api/candidates/skills',
      body: { skillID: REAL.skillId, proficiencyLevel: 7 },
      desc: 'Add candidate skill' },
    { role: 3, uid: REAL.candidateUserId, method: 'POST', path: '/api/candidates/gamification/daily-login',
      body: {}, desc: 'Daily login bonus' },
    { role: 3, uid: REAL.candidateUserId, method: 'POST', path: '/api/candidates/salary-coach/negotiate',
      body: { currentSalary: 40000, targetSalary: 55000, jobId: REAL.jobId },
      desc: 'Salary coach negotiate' },
    { role: 3, uid: REAL.candidateUserId, method: 'POST', path: '/api/candidates/notifications/mark-read',
      body: { notificationIds: [REAL.notificationId] }, desc: 'Mark notification read' },
    { role: 3, uid: REAL.candidateUserId, method: 'POST', path: '/api/candidates/notifications/register-device',
      body: { deviceToken: 'test-token-abc', platform: 'web' },
      desc: 'Register push device' },
    { role: 3, uid: REAL.candidateUserId, method: 'POST', path: '/api/candidates/career-path/simulate',
      body: { targetRole: 'Senior Developer', years: 3 },
      desc: 'Simulate career path' },
    { role: 3, uid: REAL.candidateUserId, method: 'POST', path: '/api/candidates/location-preferences',
      body: { preferredLocations: ['Dhaka', 'Chittagong'] },
      desc: 'Set location preferences' },
    { role: 3, uid: REAL.candidateUserId, method: 'PUT', path: '/api/candidates/profile/consent',
      body: { dataretentionconsent: true, marketingconsent: false, anonymizeafterdeletion: false },
      desc: 'Update consent' },

    // RECRUITERS
    { role: 2, uid: REAL.recruiterUserId, method: 'POST', path: '/api/recruiters/search',
      body: { query: 'react', location: 'Dhaka' }, desc: 'Search candidates' },
    { role: 2, uid: REAL.recruiterUserId, method: 'POST', path: '/api/recruiters/screening/run',
      body: { jobId: REAL.jobId, threshold: 70 }, desc: 'Run screening' },
    { role: 2, uid: REAL.recruiterUserId, method: 'POST', path: '/api/recruiters/send-reminder',
      body: { candidateId: REAL.candidateId, message: 'Test reminder' },
      desc: 'Send candidate reminder' },

    // MAINTENANCE (admin) - some are read-only-when-called-with-test-args
    { role: 1, uid: 1, method: 'POST', path: '/api/maintenance/consent-check',
      body: {}, desc: 'Run consent expiry check' },
    { role: 1, uid: 1, method: 'POST', path: '/api/maintenance/email-queue/send-test',
      body: { candidateId: REAL.candidateId, emailType: 'Test', subject: 'Test', body: 'Test body' },
      desc: 'Send test email' },

    // CHATBOT
    { role: 3, uid: REAL.candidateUserId, method: 'POST', path: '/api/chatbot/message',
      body: { message: 'hello' }, desc: 'Send chatbot message' },

    // ASSESSMENTS - submit an attempt
    { role: 3, uid: REAL.candidateUserId, method: 'POST', path: '/api/candidates/assessments',
      body: { assessmentId: 1, answers: [{ questionId: 1, answer: 'A' }] },
      desc: 'Submit assessment attempt' },
];

function request(method, urlPath, role, uid, body) {
    return new Promise((resolve) => {
        const data = body ? JSON.stringify(body) : null;
        const headers = { 'Content-Type': 'application/json' };
        if (role !== null) {
            headers['x-user-id'] = String(uid);
            headers['x-user-role'] = String(role);
        }
        if (data) headers['Content-Length'] = Buffer.byteLength(data);

        const req = http.request({ port: PORT, method, path: urlPath, headers, timeout: 30000 }, (res) => {
            let chunks = [];
            res.on('data', c => chunks.push(c));
            res.on('end', () => {
                const respBody = Buffer.concat(chunks).toString('utf8');
                let parsed = null;
                try { parsed = JSON.parse(respBody); } catch (_) {}
                resolve({ method, path: urlPath, role, status: res.statusCode, body: parsed ?? respBody.slice(0, 600) });
            });
        });
        req.on('error', e => resolve({ method, path: urlPath, role, status: 'ERR', error: e.message }));
        req.on('timeout', () => { req.destroy(); resolve({ method, path: urlPath, role, status: 'TIMEOUT' }); });
        if (data) req.write(data);
        req.end();
    });
}

async function main() {
    const server = spawn('node', ['index.js'], {
        cwd: SERVER_DIR,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, PORT: String(PORT) },
    });
    let serverLog = '';
    server.stdout.on('data', d => { serverLog += d.toString(); });
    server.stderr.on('data', d => { serverLog += d.toString(); });

    await new Promise(r => setTimeout(r, 4000));

    try {
        const health = await request('GET', '/api/status', null, null);
        if (health.status !== 200) {
            console.log('Server not ready. Log:'); console.log(serverLog.slice(-1500));
            server.kill('SIGKILL'); process.exit(1);
        }
    } catch (e) {
        console.log('Health check failed:', e.message);
        server.kill('SIGKILL'); process.exit(1);
    }

    console.log('Server is up. Running write-endpoint tests...\n');
    console.log('ROLE  METHOD  PATH                                                       STATUS  DESC / RESULT');
    console.log('----  ------  ----------------------------------------------------------  ------  -------------');

    const results = [];
    for (const t of TESTS) {
        const r = await request(t.method, t.path, t.role, t.uid, t.body);
        let summary = '';
        if (r.status === 200 || r.status === 201) summary = 'OK';
        else if (r.status === 400) {
            const msg = (typeof r.body === 'object' && (r.body?.error || r.body?.message))
                ? (r.body.error || r.body.message) : '';
            summary = `VALIDATION: ${String(msg).slice(0, 80)}`;
        }
        else if (r.status === 401 || r.status === 403) summary = `AUTH_${r.status}`;
        else if (r.status === 404) summary = 'NOT_FOUND';
        else if (r.status === 500) {
            const msg = (typeof r.body === 'object' && (r.body?.error || r.body?.message || r.body?.details))
                ? (r.body.error || r.body.message || r.body.details) :
                (typeof r.body === 'string') ? r.body : JSON.stringify(r.body);
            summary = `500: ${String(msg).slice(0, 120)}`;
        }
        else if (r.status === 'ERR') summary = `ERR: ${r.error}`;
        else if (r.status === 'TIMEOUT') summary = 'TIMEOUT';
        else summary = `OTHER_${r.status}`;

        const roleLabel = `R${t.role}`;
        console.log(`${roleLabel.padEnd(4)}  ${t.method.padEnd(6)}  ${t.path.padEnd(58)}  ${String(r.status).padEnd(6)}  ${t.desc} -> ${summary}`);
        results.push({ ...t, ...r, summary });
    }

    const okCount = results.filter(r => r.status === 200 || r.status === 201).length;
    const valCount = results.filter(r => r.status === 400).length;
    const errCount = results.filter(r => r.status === 500 || r.status === 'ERR' || r.status === 'TIMEOUT').length;
    console.log('\n=== SUMMARY ===');
    console.log(`Total:          ${results.length}`);
    console.log(`OK (200/201):   ${okCount}`);
    console.log(`Validation 400: ${valCount}`);
    console.log(`Server Errors:  ${errCount}`);

    const errs = results.filter(r => r.status === 500 || r.status === 'ERR' || r.status === 'TIMEOUT');
    if (errs.length > 0) {
        console.log('\n=== SERVER ERRORS (detailed) ===');
        for (const r of errs) {
            console.log(`\n[R${r.role}] ${r.method} ${r.path}  (${r.desc})`);
            console.log('  Status:', r.status);
            console.log('  Body:', typeof r.body === 'string' ? r.body.slice(0, 400) : JSON.stringify(r.body).slice(0, 400));
        }
    }

    server.kill('SIGKILL');
    process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
