const API_BASE = 'http://localhost:5001/api';

// Derived from frontend analysis & get_test_ids.js results
const TEST_JOB_ID = 1;
const TEST_APP_ID = 1;
const TEST_USER_ID = 2; // Recruiter Role (2)
const TEST_USER_ROLE = 2;

const endpoints = [
    // ANALYTICS
    { method: 'GET', url: '/analytics/stats', name: 'Dashboard Stats' },
    { method: 'GET', url: '/analytics/funnel', name: 'Hiring Funnel' },
    { method: 'GET', url: '/analytics/risk-alerts', name: 'Risk Alerts' },
    { method: 'GET', url: '/analytics/bottlenecks', name: 'Hiring Bottlenecks' },
    { method: 'GET', url: '/analytics/diversity', name: 'Diversity Funnel' },
    { method: 'GET', url: '/analytics/market', name: 'Market Intelligence' },
    { method: 'GET', url: '/analytics/ghosting-detail', name: 'Ghosting Risk Detail' },
    { method: 'GET', url: '/analytics/skill-verification', name: 'Skill Verification Status' },
    { method: 'GET', url: '/analytics/time-to-hire', name: 'Avg Time to Hire' },
    { method: 'GET', url: '/analytics/rejection-analysis', name: 'Rejection Analysis' },
    { method: 'GET', url: '/analytics/skill-gap', name: 'Skill Gap Analysis' },
    { method: 'GET', url: '/analytics/candidate-engagement', name: 'Candidate Engagement' },
    { method: 'GET', url: '/analytics/bias-detection', name: 'Bias Detection' },
    { method: 'GET', url: '/analytics/time-to-hire-detail', name: 'Time to Hire Detail' },
    { method: 'GET', url: '/analytics/recruiter-performance', name: 'Recruiter Performance' },

    // JOBS
    { method: 'GET', url: '/jobs', name: 'List All Jobs' },
    { method: 'GET', url: `/jobs/${TEST_JOB_ID}`, name: 'Get Single Job' },
    { method: 'GET', url: `/jobs/${TEST_JOB_ID}/matches`, name: 'Get Job Matches' },
    { method: 'GET', url: `/jobs/${TEST_JOB_ID}/applications`, name: 'Get Job Applications' },

    // RECRUITERS
    { method: 'GET', url: '/recruiters/talent-pool', name: 'Talent Pool' },
    { method: 'POST', url: '/recruiters/search', data: { name: 'John', threshold: 0.5 }, name: 'Fuzzy Search Candidates' },

    // APPLICATIONS
    { method: 'GET', url: `/applications/${TEST_APP_ID}/history`, name: 'Application Status History' },
    { method: 'PUT', url: `/applications/${TEST_APP_ID}/status`, data: { statusID: 3, notes: 'Verified via audit' }, name: 'Update Application Status' },

    // INTERVIEWS
    { method: 'GET', url: '/interviews', name: 'Get Scheduled Interviews' },

    // SKILLS
    { method: 'GET', url: '/skills', name: 'Get Skills Catalog' }
];

async function testEndpoint(endpoint) {
    try {
        const options = {
            method: endpoint.method,
            headers: {
                'Content-Type': 'application/json',
                'x-user-id': TEST_USER_ID,
                'x-user-role': TEST_USER_ROLE
            }
        };

        if (endpoint.data) {
            options.body = JSON.stringify(endpoint.data);
        }

        const response = await fetch(`${API_BASE}${endpoint.url}`, options);
        const data = await response.json();

        if (response.ok) {
            console.log(`[PASS] ${endpoint.name}(${endpoint.method} ${endpoint.url}) - Status: ${response.status}`);
            return true;
        } else {
            console.error(`[FAIL] ${endpoint.name}(${endpoint.method} ${endpoint.url}) - Status: ${response.status} - Message: ${data.error || 'Unknown Error'}`);
            return false;
        }
    } catch (error) {
        console.error(`[ERROR] ${endpoint.name}(${endpoint.method} ${endpoint.url}) - Message: ${error.message}`);
        return false;
    }
}

async function runAudit() {
    console.log('--- RECRUITER DASHBOARD API AUDIT ---');
    console.log(`Testing with UserID: ${TEST_USER_ID}, Role: ${TEST_USER_ROLE} \n`);

    let passed = 0;
    let failed = 0;

    for (const endpoint of endpoints) {
        const success = await testEndpoint(endpoint);
        if (success) passed++; else failed++;
    }

    console.log('\n--- AUDIT SUMMARY ---');
    console.log(`Total: ${endpoints.length} `);
    console.log(`Passed: ${passed} `);
    console.log(`Failed: ${failed} `);

    if (failed === 0) {
        console.log('\n✅ All Recruiter Dashboard APIs are functional.');
    } else {
        console.log(`\n⚠️ ${failed} endpoints failed.Please investigation required.`);
    }
}

runAudit();
