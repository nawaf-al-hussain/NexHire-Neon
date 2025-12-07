/**
 * Boot the server, hit endpoints with proper auth headers, capture results.
 */
const { spawn } = require('child_process');
const http = require('http');

const SERVER_DIR = '/home/z/my-project/work/neon/NexHire-Frontend-(Neon)/server';
const PORT = 5001;

// Test endpoints grouped by role. Use IDs we know exist.
// Roles: 1=admin, 2=recruiter, 3=candidate
const TESTS = [
    // No-auth
    { role: null, method: 'GET', path: '/api/status' },

    // Admin (userid=1, role=1)
    { role: 1, uid: 1, method: 'GET', path: '/api/users' },
    { role: 1, uid: 1, method: 'GET', path: '/api/users/profile/1' },
    { role: 1, uid: 1, method: 'GET', path: '/api/maintenance/archive-stats' },
    { role: 1, uid: 1, method: 'GET', path: '/api/maintenance/sql-views' },
    { role: 1, uid: 1, method: 'GET', path: '/api/maintenance/email-queue' },
    { role: 1, uid: 1, method: 'GET', path: '/api/maintenance/archive-jobs' },
    { role: 1, uid: 1, method: 'GET', path: '/api/maintenance/archive-applications' },

    // Recruiter (userid=2, role=2)
    { role: 2, uid: 2, method: 'GET', path: '/api/jobs' },
    { role: 2, uid: 2, method: 'GET', path: '/api/jobs/1' },
    { role: 2, uid: 2, method: 'GET', path: '/api/skills' },
    { role: 2, uid: 2, method: 'GET', path: '/api/interviews' },
    { role: 2, uid: 2, method: 'GET', path: '/api/interviews/feedback/1' },
    { role: 2, uid: 2, method: 'GET', path: '/api/interviews/transcription/1' },
    { role: 2, uid: 2, method: 'GET', path: '/api/interviews/generated-questions/1' },
    { role: 2, uid: 2, method: 'GET', path: '/api/analytics/recruiter-performance' },
    { role: 2, uid: 2, method: 'GET', path: '/api/analytics/hiring-funnel' },
    { role: 2, uid: 2, method: 'GET', path: '/api/analytics/time-to-hire' },
    { role: 2, uid: 2, method: 'GET', path: '/api/analytics/skill-gap' },
    { role: 2, uid: 2, method: 'GET', path: '/api/analytics/diversity' },
    { role: 2, uid: 2, method: 'GET', path: '/api/analytics/bias-logs' },
    { role: 2, uid: 2, method: 'GET', path: '/api/analytics/vacancy-utilization' },
    { role: 2, uid: 2, method: 'GET', path: '/api/analytics/salary-transparency' },
    { role: 2, uid: 2, method: 'GET', path: '/api/analytics/remote-work' },
    { role: 2, uid: 2, method: 'GET', path: '/api/analytics/applications-for-prediction' },
    { role: 2, uid: 2, method: 'GET', path: '/api/recruiters/talent-pool' },
    { role: 2, uid: 2, method: 'GET', path: '/api/recruiters/market-alerts' },
    { role: 2, uid: 2, method: 'GET', path: '/api/recruiters/candidates/4/profile' },

    // Candidate (userid=4, role=3)
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
    { role: 3, uid: 4, method: 'GET', path: '/api/candidates/learning-path' },
    { role: 3, uid: 4, method: 'GET', path: '/api/candidates/leaderboard' },
    { role: 3, uid: 4, method: 'GET', path: '/api/candidates/interview-prep' },
    { role: 3, uid: 4, method: 'GET', path: '/api/candidates/salary-coach' },
    { role: 3, uid: 4, method: 'GET', path: '/api/candidates/location-preferences' },
    { role: 3, uid: 4, method: 'GET', path: '/api/candidates/resume-score' },
    { role: 3, uid: 4, method: 'GET', path: '/api/candidates/invitations' },
    { role: 3, uid: 4, method: 'GET', path: '/api/candidates/notifications' },
    { role: 3, uid: 4, method: 'GET', path: '/api/candidates/skill-gap-analysis' },
    { role: 3, uid: 4, method: 'GET', path: '/api/candidates/skills-demand' },
    { role: 3, uid: 4, method: 'GET', path: '/api/candidates/documents' },
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

    // Wait for ready
    await new Promise(r => setTimeout(r, 4000));

    try {
        const health = await request('GET', '/api/status', null, null);
        if (health.status !== 200) {
            console.log('Server not ready. Log:');
            console.log(serverLog.slice(-1500));
            server.kill('SIGKILL');
            process.exit(1);
        }
    } catch (e) {
        console.log('Health check failed:', e.message);
        console.log(serverLog);
        server.kill('SIGKILL');
        process.exit(1);
    }

    console.log('Server is up. Running tests...\n');
    console.log('ROLE  METHOD  PATH                                                       STATUS  RESULT');
    console.log('----  ------  ----------------------------------------------------------  ------  ------');

    const results = [];
    for (const t of TESTS) {
        const r = await request(t.method, t.path, t.role, t.uid, t.body);
        let summary = '';
        if (r.status === 200) summary = 'OK';
        else if (r.status === 401 || r.status === 403) summary = `AUTH_${r.status}`;
        else if (r.status === 404) summary = 'NOT_FOUND';
        else if (r.status === 500) {
            const msg = (typeof r.body === 'object' && (r.body?.error || r.body?.message))
                ? (r.body.error || r.body.message) : (typeof r.body === 'string') ? r.body : JSON.stringify(r.body);
            summary = `500: ${String(msg).slice(0, 120)}`;
        } else if (r.status === 'ERR') summary = `ERR: ${r.error}`;
        else if (r.status === 'TIMEOUT') summary = 'TIMEOUT';
        else summary = `OTHER_${r.status}`;
        const roleLabel = t.role === null ? '-' : `R${t.role}`;
        console.log(`${roleLabel.padEnd(4)}  ${t.method.padEnd(6)}  ${t.path.padEnd(58)}  ${String(r.status).padEnd(6)}  ${summary}`);
        results.push({ ...t, ...r, summary });
    }

    const okCount = results.filter(r => r.status === 200).length;
    const authCount = results.filter(r => r.status === 401 || r.status === 403).length;
    const nfCount = results.filter(r => r.status === 404).length;
    const errCount = results.filter(r => r.status === 500 || r.status === 'ERR' || r.status === 'TIMEOUT').length;
    console.log('\n=== SUMMARY ===');
    console.log(`Total:          ${results.length}`);
    console.log(`OK (200):       ${okCount}`);
    console.log(`Auth (401/403): ${authCount}`);
    console.log(`Not Found (404): ${nfCount}`);
    console.log(`Server Errors:  ${errCount}`);

    // List server errors in detail
    const errs = results.filter(r => r.status === 500 || r.status === 'ERR' || r.status === 'TIMEOUT');
    if (errs.length > 0) {
        console.log('\n=== SERVER ERRORS (detailed) ===');
        for (const r of errs) {
            console.log(`\n[R${r.role}] ${r.method} ${r.path}`);
            console.log('  Status:', r.status);
            console.log('  Body:', typeof r.body === 'string' ? r.body.slice(0, 400) : JSON.stringify(r.body).slice(0, 400));
        }
    }

    server.kill('SIGKILL');
    process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
