const axios = require('axios');

async function testEndpoints() {
    const baseUrl = 'http://localhost:5001/api';
    const token = 'YOUR_TOKEN_HERE'; // I need a token. I'll try to get one or use a mock.
    
    // Actually, I can just bypass the auth if I'm running on the server? 
    // No, I'll need a real token for the route.
    
    // I'll try to get a token by logging in.
    try {
        console.log('Logging in...');
        const loginRes = await axios.post(`${baseUrl}/auth/login`, {
            username: 'recruiter1',
            password: ''
        });
        const token = loginRes.data.token;
        console.log('Login successful.');

        const endpoints = [
            '/jobs/25/matches',
            '/recruiters/background-checks-dashboard'
        ];

        for (const endpoint of endpoints) {
            console.log(`Testing ${endpoint}...`);
            try {
                const res = await axios.get(`${baseUrl}${endpoint}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log(`SUCCESS: ${endpoint}`);
            } catch (err) {
                console.error(`FAILURE: ${endpoint}`);
                if (err.response) {
                    console.error('Status:', err.response.status);
                    console.error('Data:', JSON.stringify(err.response.data, null, 2));
                } else {
                    console.error('Message:', err.message);
                }
            }
        }
    } catch (err) {
        console.error('Initial Login/Setup Error:', err.message);
    }
}

testEndpoints();
