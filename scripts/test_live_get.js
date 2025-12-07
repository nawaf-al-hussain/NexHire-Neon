/**
 * Test all GET endpoints against the LIVE Vercel deployment.
 * Differs from local testing in:
 *  - Real cold-start latency
 *  - Real Vercel env vars
 *  - Real Neon connection (potentially different data)
 */
const http = require('http');
const https = require('https');

const BASE = 'https://nex-hire-neon.vercel.app';

const TESTS = [
    // No-auth
    { role: null, method: 'GET', path: '/api/status' },

    // Admin
    { role: 1, uid: 1, method: 'GET', path: '/api/users' },
    { role: 1, uid: 1, method: 'GET', path: '/api/users/profile/1' },
    { role: 1, uid: 1, method: 'GET', path: '/api/maintenance/archive-stats' },
    { role: 1, uid: 1, method: 'GET', path: '/api/maintenance/sql-views' },
    { role: 1, uid: 1, method: 'GET', path: '/api/maintenance/email-queue' },
    { role: 1, uid: 1, method: 'GET', path: '/api/maintenance/archive-jobs' },
    { role: 1, uid: 1, method: 'GET', path: '/api/maintenance/archive-applications' },

    // Recruiter
    { role: 2, uid: 2, method: 'GET', path: '/api/jobs' },
    { role: 2, uid: 2, method: 'GET', path: '/api/jobs/1' },
    { role: 2, uid: 2, method: 'GET', path: '/api/skills' },
    { role: 2, uid: 2, method: 'GET', path: '/api/interviews' },
    { role: 2, uid: 2, method: 'GET', path: '/api/interviews/feedback/1' },
    { role: 2, uid: 2, method: 'GET', path: '/api/interviews/transcription/1' },
    { role: 2, uid: 2, method: 'GET', path: '/api/interviews/generated-questions/1' },
    { role: 2, uid: 2, method: 'GET', path: '/api/analytics/recruiter-performance' },
    { role: 2, uid: 2, method: 'GET', path: '/api/analytics/time-to-hire' },
    { role: 2, uid: 2, method: 'GET', path: '/api/analytics/skill-gap' },
    { role: 2, uid: 2, method: 'GET', path: '/api/analytics/diversity' },
    { role: 2, uid: 2, method: 'GET', path: '/api/analytics/bias-logs' },
    { role: 2, uid: 2, method: 'GET', path: '/api/analytics/salary-transparency' },
    { role: 2, uid: 2, method: 'GET', path: '/api/analytics/applications-for-prediction' },
    { role: 2, uid: 2, method: 'GET', path: '/api/analytics/funnel' },
    { role: 2, uid: 2, method: 'GET', path: '/api/analytics/remote-compatibility' },
    { role: 1, uid: 1, method: 'GET', path: '/api/analytics/vacancy-overview' },
    { role: 2, uid: 2, method: 'GET', path: '/api/recruiters/talent-pool' },
    { role: 2, uid: 2, method: 'GET', path: '/api/recruiters/market-alerts' },
    { role: 2, uid: 2, method: 'GET', path: '/api/recruiters/candidate-profile/4' },
    { role: 2, uid: 2, method: 'GET', path: '/api/recruiters/engagement' },
    { role: 2, uid: 2, method: 'GET', path: '/api/recruiters/platform-sync' },
    { role: 2, uid: 2, method: 'GET', path: '/api/recruiters/screening/decisions' },
    { role: 2, uid: 2, method: 'GET', path: '/api/recruiters/background-checks-dashboard' },
    { role: 2, uid: 2, method: 'GET', path: '/api/recruiters/blockchain-dashboard' },
    { role: 2, uid: 2, method: 'GET', path: '/api/recruiters/referral-intelligence' },
    { role: 2, uid: 2, method: 'GET', path: '/api/recruiters/ranking-history/job/1' },

    // Candidate
    { role: 3, uid: 4, method: 'GET', path: '/api/candidates/debug-test' },
    { role: 3, uid: 4, method: 'GET', path: '/api/candidates/matches' },
    { role: 3, uid: 4, method: 'GET', path: '/api/candidates/discover' },
    { role: 3, uid: 4, method: 'GET', path: '/api/candidates/applications' },
    { role: 3, uid: 4, method: 'GET', path: '/api/candidates/skills' },
    { role: 3, uid: 4, method: 'GET', path: '/api/candidates/interviews' },
    { role: 3, uid: 4, method: 'GET', path: '/api/candidates/assessments' },
    { role: 3, uid: 4, method: 'GET', path: '/api/candidates/profile' },
    { role: 3, uid: 4, method: 'GET', path: '/api/candidates/profile/skills' },
    { role: 3, uid: 4, method: 'GET', path: '/api/candidates/career-path' },
    { role: 3, uid: 4, method: 'GET', path: '/api/candidates/career-path/roles' },
    { role: 3, uid: 4, method: 'GET', path: '/api/candidates/learning-path' },
    { role: 3, uid: 4, method: 'GET', path: '/api/candidates/leaderboard' },
    { role: 3, uid: 4, method: 'GET', path: '/api/candidates/leaderboard/global' },
    { role: 3, uid: 4, method: 'GET', path: '/api/candidates/interview-prep' },
    { role: 3, uid: 4, method: 'GET', path: '/api/candidates/salary-coach' },
    { role: 3, uid: 4, method: 'GET', path: '/api/candidates/location-preferences' },
    { role: 3, uid: 4, method: 'GET', path: '/api/candidates/resume-score' },
    { role: 3, uid: 4, method: 'GET', path: '/api/candidates/invitations' },
    { role: 3, uid: 4, method: 'GET', path: '/api/candidates/notifications' },
    { role: 3, uid: 4, method: 'GET', path: '/api/candidates/skill-gap-analysis' },
    { role: 3, uid: 4, method: 'GET', path: '/api/candidates/skills-demand' },
    { role: 3, uid: 4, method: 'GET', path: '/api/candidates/documents' },
    { role: 3, uid: 4, method: 'GET', path: '/api/candidates/profile/extracted-skills' },
];

function request(method, urlPath, role, uid) {
    return new Promise((resolve) => {
        const headers = { 'Content-Type': 'application/json' };
        if (role !== null) {
            headers['x-user-id'] = String(uid);
            headers['x-user-role'] = String(role);
        }
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
        req.end();
    });
}

async function main() {
    console.log(`Testing ${TESTS.length} GET endpoints against ${BASE}\n`);
    console.log('ROLE  METHOD  PATH                                                       STATUS  TIME   RESULT');
    console.log('----  ------  ----------------------------------------------------------  ------  ------ ------');

    const results = [];
    for (const t of TESTS) {
        const t0 = Date.now();
        const r = await request(t.method, t.path, t.role, t.uid);
        const elapsed = Date.now() - t0;
        let summary = '';
        if (r.status === 200) summary = 'OK';
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
            summary = `500: ${String(msg).slice(0, 90)}`;
        }
        else if (r.status === 'ERR') summary = `ERR: ${r.error}`;
        else if (r.status === 'TIMEOUT') summary = 'TIMEOUT';
        else summary = `OTHER_${r.status}`;
        const roleLabel = t.role === null ? '-' : `R${t.role}`;
        console.log(`${roleLabel.padEnd(4)}  ${t.method.padEnd(6)}  ${t.path.padEnd(58)}  ${String(r.status).padEnd(6)}  ${String(elapsed+'ms').padEnd(6)} ${summary}`);
        results.push({ ...t, ...r, summary, elapsed });
    }

    const okCount = results.filter(r => r.status === 200).length;
    const valCount = results.filter(r => r.status === 400).length;
    const authCount = results.filter(r => r.status === 401 || r.status === 403).length;
    const nfCount = results.filter(r => r.status === 404).length;
    const errCount = results.filter(r => r.status === 500 || r.status === 'ERR' || r.status === 'TIMEOUT').length;
    console.log('\n=== SUMMARY ===');
    console.log(`Total:          ${results.length}`);
    console.log(`OK (200):       ${okCount}`);
    console.log(`Validation 400: ${valCount}`);
    console.log(`Auth 401/403:   ${authCount}`);
    console.log(`Not Found 404:  ${nfCount}`);
    console.log(`Server Errors:  ${errCount}`);

    const errs = results.filter(r => r.status === 500 || r.status === 'ERR' || r.status === 'TIMEOUT');
    if (errs.length > 0) {
        console.log('\n=== SERVER ERRORS (detailed) ===');
        for (const r of errs) {
            console.log(`\n[R${r.role}] ${r.method} ${r.path}  (${r.elapsed}ms)`);
            console.log('  Status:', r.status);
            console.log('  Body:', typeof r.body === 'string' ? r.body.slice(0, 500) : JSON.stringify(r.body).slice(0, 500));
        }
    }
}

main().catch(e => { console.error(e); process.exit(1); });
