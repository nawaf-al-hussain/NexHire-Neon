async function debug() {
    const baseUrl = 'http://localhost:5001/api';
    try {
        const loginRes = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'recruiter1', password: '' })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;
        
        console.log('Testing /jobs/25/matches...');
        const res = await fetch(`${baseUrl}/jobs/25/matches`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Status:', res.status);
        const data = await res.json();
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Error:', err);
    }
}
debug();
