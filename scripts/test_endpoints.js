/**
 * Boot the server, hit a bunch of endpoints, capture status codes + error messages.
 * Designed to find runtime breakage that static PREPARE analysis can't catch
 * (e.g. queries with params that fail with real data, JS logic bugs, etc.)
 */
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const SERVER_DIR = '/home/z/my-project/work/neon/NexHire-Frontend-(Neon)/server';
const PORT = 5001;
const BASE = `http://localhost:${PORT}`;

// Test endpoints grouped by route file. Each entry: [method, path, body?]
// We deliberately hit GET endpoints that are pure reads (no auth needed
// beyond the JWT, which we'll fake).
const TESTS = [
    // Status (no auth)
    ['GET', '/api/status'],

    // Public-ish / auth-first
    ['GET', '/api/auth/me'],

    // Jobs (candidate-facing reads)
    ['GET', '/api/jobs'],
    ['GET', '/api/jobs/1'],
    ['GET', '/api/jobs/matches/1'],
    ['GET', '/api/jobs/skills'],

    // Skills
    ['GET', '/api/skills'],

    // Users
    ['GET', '/api/users'],
    ['GET', '/api/users/1'],

    // Applications
    ['GET', '/api/applications'],
    ['GET', '/api/applications/1'],

    // Candidates
    ['GET', '/api/candidates'],
    ['GET', '/api/candidates/1'],
    ['GET', '/api/candidates/1/matches'],
    ['GET', '/api/candidates/1/skills'],
    ['GET', '/api/candidates/1/applications'],
    ['GET', '/api/candidates/1/interviews'],
    ['GET', '/api/candidates/1/gamification'],
    ['GET', '/api/candidates/1/notifications'],

    // Analytics
    ['GET', '/api/analytics/dashboard'],
    ['GET', '/api/analytics/recruiter-performance'],
    ['GET', '/api/analytics/hiring-funnel'],
    ['GET', '/api/analytics/time-to-hire'],
    ['GET', '/api/analytics/skill-gap'],
    ['GET', '/api/analytics/diversity'],
    ['GET', '/api/analytics/bias-logs'],
    ['GET', '/api/analytics/vacancy-utilization'],
    ['GET', '/api/analytics/salary-transparency'],
    ['GET', '/api/analytics/remote-work'],
    ['GET', '/api/analytics/applications-for-prediction'],

    // Recruiters
    ['GET', '/api/recruiters'],
    ['GET', '/api/recruiters/talent-pool'],
    ['GET', '/api/recruiters/market-alerts'],
    ['GET', '/api/recruiters/candidates/1/profile'],

    // Interviews
    ['GET', '/api/interviews'],
    ['GET', '/api/interviews/1'],
    ['GET', '/api/interviews/transcription/1'],

    // Assessments
    ['GET', '/api/candidates/assessments'],
    ['GET', '/api/candidates/assessments/1'],

    // Maintenance
    ['GET', '/api/maintenance/health'],
    ['GET', '/api/maintenance/status'],

    // Chatbot
    ['POST', '/api/chatbot/message', { message: 'hello' }],
];

function request(method, urlPath, body) {
    return new Promise((resolve) => {
        const data = body ? JSON.stringify(body) : null;
        const req = http.request({
            port: PORT,
            method,
            path: urlPath,
            headers: {
                'Content-Type': 'application/json',
                // Fake JWT to bypass protect middleware if it only checks existence
                'Authorization': 'Bearer faketoken',
                ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
            },
            timeout: 8000,
        }, (res) => {
            let chunks = [];
            res.on('data', c => chunks.push(c));
            res.on('end', () => {
                const respBody = Buffer.concat(chunks).toString('utf8');
                let parsed = null;
                try { parsed = JSON.parse(respBody); } catch (_) {}
                resolve({
                    method, path: urlPath,
                    status: res.statusCode,
                    body: parsed ?? respBody.slice(0, 400),
                });
            });
        });
        req.on('error', e => resolve({ method, path: urlPath, status: 'ERR', error: e.message }));
        req.on('timeout', () => { req.destroy(); resolve({ method, path: urlPath, status: 'TIMEOUT' }); });
        if (data) req.write(data);
        req.end();
    });
}

async function main() {
    // Start server
    const server = spawn('node', ['index.js'], {
        cwd: SERVER_DIR,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, PORT: String(PORT) },
    });

    let serverLog = '';
    server.stdout.on('data', d => { serverLog += d.toString(); });
    server.stderr.on('data', d => { serverLog += d.toString(); });

    // Wait for server to be ready
    await new Promise(r => setTimeout(r, 4000));

    // Quick health check
    try {
        const health = await request('GET', '/api/status');
        if (health.status !== 200) {
            console.log('Server not ready, log:');
            console.log(serverLog.slice(-2000));
            server.kill('SIGKILL');
            process.exit(1);
        }
    } catch (e) {
        console.log('Health check failed:', e.message);
        console.log(serverLog);
        server.kill('SIGKILL');
        process.exit(1);
    }

    console.log('Server is up. Running endpoint tests...\n');
    console.log('METHOD  PATH                                              STATUS  RESULT');
    console.log('------  ------------------------------------------------  ------  ------');

    const results = [];
    for (const [method, urlPath, body] of TESTS) {
        const r = await request(method, urlPath, body);
        let summary = '';
        if (r.status === 200) summary = 'OK';
        else if (r.status === 401 || r.status === 403) summary = 'AUTH';
        else if (r.status === 404) summary = 'NOT_FOUND';
        else if (r.status === 500) {
            // Extract error message
            const msg = (typeof r.body === 'object' && r.body?.error) ? r.body.error :
                        (typeof r.body === 'object' && r.body?.message) ? r.body.message :
                        (typeof r.body === 'string') ? r.body.slice(0, 100) : '';
            summary = `SERVER_ERR: ${msg.slice(0, 100)}`;
        } else if (r.status === 'ERR') summary = `ERR: ${r.error}`;
        else if (r.status === 'TIMEOUT') summary = 'TIMEOUT';
        else summary = `OTHER_${r.status}`;
        console.log(`${method.padEnd(6)}  ${urlPath.padEnd(48)}  ${String(r.status).padEnd(6)}  ${summary}`);
        results.push({ ...r, summary });
    }

    // Summary
    const okCount = results.filter(r => r.status === 200).length;
    const authCount = results.filter(r => r.status === 401 || r.status === 403).length;
    const nfCount = results.filter(r => r.status === 404).length;
    const errCount = results.filter(r => r.status === 500 || r.status === 'ERR' || r.status === 'TIMEOUT').length;
    console.log('\n=== SUMMARY ===');
    console.log(`OK (200):       ${okCount}/${results.length}`);
    console.log(`Auth (401/403): ${authCount}/${results.length}`);
    console.log(`Not Found (404): ${nfCount}/${results.length}`);
    console.log(`Server Errors:  ${errCount}/${results.length}`);

    server.kill('SIGKILL');
    process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
