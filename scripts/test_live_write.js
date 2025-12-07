/**
 * Test POST/PUT/DELETE endpoints against the LIVE Vercel deployment.
 */
const https = require('https');
const BASE = 'https://nex-hire-neon.vercel.app';

const REAL = {
    candidateUserId: 4, candidateId: 1, recruiterUserId: 2, recruiterId: 1,
    jobId: 1, applicationId: 1, skillId: 1, scheduleId: 1,
    notificationId: 1, emailQueueId: 1, backgroundCheckId: 1,
};

const TESTS = [
    // USERS (admin) - using camelCase field names that the routes expect
    { role: 1, uid: 1, method: 'PUT',  path: `/api/users/${REAL.candidateUserId}/role`,
      body: { roleId: 3 }, desc: 'Change user role' },
    { role: 1, uid: 1, method: 'PUT',  path: `/api/users/${REAL.candidateUserId}/status`,
      body: { isActive: true }, desc: 'Toggle user status' },
    { role: 1, uid: 1, method: 'POST', path: '/api/users/candidate',
      body: { username: 'test_live_user_'+Date.now(), email: 'testlive@example.com', password: 'TestPass123',
              fullName: 'Test Live User', location: 'Dhaka', yearsOfExperience: 2 },
      desc: 'Create candidate user' },

    // JOBS (recruiter)
    { role: 2, uid: REAL.recruiterUserId, method: 'POST', path: '/api/jobs',
      body: { jobTitle: 'Test Job (audit live)', description: 'temporary', location: 'Dhaka',
              minExperience: 1, vacancies: 1, salaryMin: 30000, salaryMax: 50000,
              skills: [{ skillId: 1, isMandatory: true, minProficiency: 5 }] },
      desc: 'Create job posting' },
    { role: 2, uid: REAL.recruiterUserId, method: 'PUT',  path: `/api/jobs/${REAL.jobId}`,
      body: { jobTitle: 'Updated Title Live', description: 'updated', location: 'Dhaka',
              minExperience: 1, vacancies: 2 }, desc: 'Update job posting' },

    // INTERVIEWS
    { role: 2, uid: REAL.recruiterUserId, method: 'POST', path: '/api/interviews/feedback',
      body: { applicationId: REAL.applicationId, recruiterId: REAL.recruiterId,
              technicalScore: 7, communicationScore: 8, culturalFitScore: 7,
              feedbackText: 'Test feedback live', recommendation: 'Hire' },
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
      body: { deviceToken: 'live-token-abc-'+Date.now(), platform: 'web' },
      desc: 'Register push device' },
    { role: 3, uid: REAL.candidateUserId, method: 'POST', path: '/api/candidates/career-path/simulate',
      body: { targetRole: 'Senior Developer', years: 3 },
      desc: 'Simulate career path' },
    { role: 3, uid: REAL.candidateUserId, method: 'POST', path: '/api/candidates/location-preferences',
      body: { preferredLocations: ['Dhaka', 'Chittagong'] },
      desc: 'Set location preferences' },
    { role: 3, uid: REAL.candidateUserId, method: 'PUT', path: '/api/candidates/profile/consent',
      body: { dataRetentionConsent: true, marketingConsent: false, anonymizeAfterDeletion: false },
      desc: 'Update consent' },

    // RECRUITERS
    { role: 2, uid: REAL.recruiterUserId, method: 'POST', path: '/api/recruiters/search',
      body: { searchName: 'react', location: 'Dhaka' }, desc: 'Search candidates' },
    { role: 2, uid: REAL.recruiterUserId, method: 'POST', path: '/api/recruiters/screening/run',
      body: { jobId: REAL.jobId, threshold: 70 }, desc: 'Run screening' },
    { role: 2, uid: REAL.recruiterUserId, method: 'POST', path: '/api/recruiters/send-reminder',
      body: { candidateId: REAL.candidateId, message: 'Test reminder live' },
      desc: 'Send candidate reminder' },

    // MAINTENANCE
    { role: 1, uid: 1, method: 'POST', path: '/api/maintenance/consent-check',
      body: {}, desc: 'Run consent expiry check' },
    { role: 1, uid: 1, method: 'POST', path: '/api/maintenance/email-queue/send-test',
      body: { candidateId: REAL.candidateId, emailType: 'Test', subject: 'Test Live', body: 'Test body live' },
      desc: 'Send test email' },

    // CHATBOT
    { role: 3, uid: REAL.candidateUserId, method: 'POST', path: '/api/chatbot/message',
      body: { message: 'hello' }, desc: 'Send chatbot message' },

    // AUTH
    { role: null, uid: null, method: 'POST', path: '/api/auth/login',
      body: { username: 'admin1' }, desc: 'Login as admin1 (dev bypass)' },
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

        const req = https.request(`${BASE}${urlPath}`, { method, headers, timeout: 45000 }, (res) => {
            let chunks = [];
            res.on('data', c => chunks.push(c));
            res.on('end', () => {
                const respBody = Buffer.concat(chunks).toString('utf8');
                let parsed = null;
                try { parsed = JSON.parse(respBody); } catch (_) {}
                resolve({ method, path: urlPath, role, status: res.statusCode, body: parsed ?? respBody.slice(0, 800) });
            });
        });
        req.on('error', e => resolve({ method, path: urlPath, role, status: 'ERR', error: e.message }));
        req.on('timeout', () => { req.destroy(); resolve({ method, path: urlPath, role, status: 'TIMEOUT' }); });
        if (data) req.write(data);
        req.end();
    });
}

async function main() {
    console.log(`Testing ${TESTS.length} write endpoints against ${BASE}\n`);
    console.log('ROLE  METHOD  PATH                                                       STATUS  TIME   DESC -> RESULT');
    console.log('----  ------  ----------------------------------------------------------  ------  ------ --------------------');

    const results = [];
    for (const t of TESTS) {
        const t0 = Date.now();
        const r = await request(t.method, t.path, t.role, t.uid, t.body);
        const elapsed = Date.now() - t0;
        let summary = '';
        if (r.status === 200 || r.status === 201) summary = 'OK';
        else if (r.status === 400) {
            const msg = (typeof r.body === 'object' && (r.body?.error || r.body?.message)) ? (r.body.error || r.body.message) : '';
            summary = `VALIDATION: ${String(msg).slice(0, 70)}`;
        }
        else if (r.status === 401 || r.status === 403) summary = `AUTH_${r.status}`;
        else if (r.status === 404) summary = 'NOT_FOUND';
        else if (r.status === 500) {
            const msg = (typeof r.body === 'object' && (r.body?.error || r.body?.message || r.body?.details))
                ? (r.body.error || r.body.message || r.body.details) :
                (typeof r.body === 'string') ? r.body : JSON.stringify(r.body);
            summary = `500: ${String(msg).slice(0, 80)}`;
        }
        else if (r.status === 'ERR') summary = `ERR: ${r.error}`;
        else if (r.status === 'TIMEOUT') summary = 'TIMEOUT';
        else summary = `OTHER_${r.status}`;
        const roleLabel = t.role === null ? '-' : `R${t.role}`;
        console.log(`${roleLabel.padEnd(4)}  ${t.method.padEnd(6)}  ${t.path.padEnd(58)}  ${String(r.status).padEnd(6)}  ${String(elapsed+'ms').padEnd(6)} ${t.desc} -> ${summary}`);
        results.push({ ...t, ...r, summary, elapsed });
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
            console.log(`\n[R${r.role}] ${r.method} ${r.path}  (${r.elapsed}ms)  (${r.desc})`);
            console.log('  Status:', r.status);
            console.log('  Body:', typeof r.body === 'string' ? r.body.slice(0, 500) : JSON.stringify(r.body).slice(0, 500));
        }
    }
}

main().catch(e => { console.error(e); process.exit(1); });
