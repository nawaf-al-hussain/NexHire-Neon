async function test() {
    try {
        // Login as recruiter
        const loginRes = await fetch('http://localhost:5001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'recruiter1', password: '' })
        });
        const loginData = await loginRes.json();

        if (!loginData.UserID) {
            console.error('Login Failed:', loginData);
            process.exit(1);
        }

        console.log('Logged in as Recruiter:', loginData.Username);

        const headers = {
            'Content-Type': 'application/json',
            'x-user-id': loginData.UserID.toString(),
            'x-user-role': loginData.RoleID.toString()
        };

        // Test risk-alerts
        const riskRes = await fetch('http://localhost:5001/api/analytics/risk-alerts', { headers });
        console.log('Risk Alerts Status:', riskRes.status);
        if (riskRes.status !== 200) {
            console.log('Risk Alerts Error:', await riskRes.json());
        } else {
            const data = await riskRes.json();
            console.log('Risk Alerts Data Received:', Object.keys(data));
        }

        // Test interviews
        const intRes = await fetch('http://localhost:5001/api/interviews', { headers });
        console.log('Interviews Status:', intRes.status);
        if (intRes.status !== 200) {
            console.log('Interviews Error:', await intRes.json());
        } else {
            const data = await intRes.json();
            console.log('Interviews Data Received:', data.length, 'records');
        }

        // Test schedule (POST) - with valid ApplicationID 1
        console.log('Testing Schedule (POST)...');
        const schedRes = await fetch('http://localhost:5001/api/interviews/schedule', {
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                applicationId: 1,
                interviewStart: new Date(Date.now() + 86400000).toISOString(),
                interviewEnd: new Date(Date.now() + 90000000).toISOString()
            })
        });
        console.log('Schedule Status:', schedRes.status);
        const schedData = await schedRes.json();
        if (schedRes.status !== 201 && schedRes.status !== 200) {
            console.log('Schedule Error:', schedData);
        } else {
            console.log('Schedule Success:', schedData);
        }

    } catch (e) {
        console.error('Test Error:', e);
    }
    process.exit();
}
test();
