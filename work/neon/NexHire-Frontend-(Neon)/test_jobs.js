const axios = require('axios');

async function test() {
    try {
        const res = await axios.post('http://localhost:5001/api/auth/login', {
            username: 'recruiter_alex',
            password: 'password123'
        });
        
        console.log("Logged in:", res.data);
        const headers = {
            'x-user-id': res.data.userid || res.data.UserID,
            'x-user-role': res.data.roleid || res.data.RoleID
        };
        
        const jobs = await axios.get('http://localhost:5001/api/jobs', { headers });
        console.log("Jobs returned:");
        console.log(JSON.stringify(jobs.data[0], null, 2));
    } catch (e) {
        console.error(e.response ? e.response.data : e.message);
    }
}
test();
