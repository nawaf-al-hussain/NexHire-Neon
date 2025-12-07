async function testRoutes() {
  try {
    console.log("Logging in...");
    const loginRes = await fetch('http://localhost:5005/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'recruiter1', password: '' })
    });
    
    if (!loginRes.ok) throw new Error("Login failed with status " + loginRes.status);
    const loginData = await loginRes.json();
    console.log("Login Data:", loginData);
    
    // Auth relies on custom headers in development via rbac.js
    const config = {
      headers: { 
        'x-user-id': loginData.userid,
        'x-user-role': loginData.roleid
      }
    };
    
    console.log("\n--- Testing Jobs Matches ---");
    try {
      const res = await fetch('http://localhost:5005/api/jobs/25/matches', config);
      const data = await res.json();
      if (data.error) {
          console.log("Jobs Match Result:", data.error, data.details);
          if (data.stack) console.log(data.stack);
      } else {
          console.log("Jobs Match Result SUCCESS:", Object.keys(data).length > 0 ? "Data returned" : data);
          console.log(data);
      }
    } catch (e) {
      console.log("Jobs Match Error:", e.stack || e.message);
    }

    console.log("\n--- Testing Background Checks Dashboard ---");
    try {
      const res = await fetch('http://localhost:5005/api/recruiters/background-checks-dashboard', config);
      const data = await res.json();
      if (data.error) {
          console.log("BG Checks Result:", data.error, data.details);
          if (data.stack) console.log(data.stack);
      } else {
          console.log("BG Checks Result SUCCESS:", Object.keys(data));
      }
    } catch (e) {
      console.log("BG Checks Error:", e.stack || e.message);
    }
  } catch(e) {
    console.error("Test failed:", e.message);
  }
}

testRoutes();
