async function test() {
    try {
        const loginRes = await fetch('http://localhost:5001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'jalal.uddin@example.com', password: 'Cand@123' })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('Logged in');

        let attemptId = null;
        try {
            const startRes = await fetch('http://localhost:5001/api/candidates/assessments/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ assessmentId: 1 })
            });
            const startData = await startRes.json();
            console.log('Started attempt:', startData);
            attemptId = startData.attemptId;
        } catch (e) {
            console.error('Error starting:', e);
        }

        if (attemptId) {
            const submitRes = await fetch('http://localhost:5001/api/candidates/assessments/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ attemptId, score: 90, timeSpentSeconds: 30, details: 'test' })
            });
            const submitData = await submitRes.json();
            console.log('Submit res status:', submitRes.status);
            console.log('Submit success:', submitData);
        }
    } catch (e) {
        console.error('Error:', e);
    }
}
test();
