const API_BASE = 'http://localhost:5001/api';

async function runTests() {
    console.log("Starting Admin User Management API Tests...");

    const headers = {
        'Content-Type': 'application/json',
        'x-user-id': '99', // Mock Admin ID
        'x-user-role': '1' // Admin Role
    };

    try {
        // 1. Fetch Users
        console.log("\n1. Fetching users...");
        let res = await fetch(`${API_BASE}/users`, { headers });
        let data = await res.json();

        if (!res.ok) throw new Error(data.error);
        console.log(`Successfully fetched ${data.length} users.`);

        if (data.length === 0) {
            console.log("No users to test status toggling. Exiting.");
            return;
        }

        const testUser = data[0];
        console.log(`Using UserID ${testUser.UserID} (${testUser.Username}) for update tests.`);

        // 2. Toggle Status
        const newStatus = !testUser.IsActive;
        console.log(`\n2. Toggling status to ${newStatus}...`);
        res = await fetch(`${API_BASE}/users/${testUser.UserID}/status`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ isActive: newStatus })
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.error);
        console.log("Response:", data.message);

        // 3. Revert Status
        console.log(`\n3. Reverting status to ${testUser.IsActive}...`);
        res = await fetch(`${API_BASE}/users/${testUser.UserID}/status`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ isActive: testUser.IsActive })
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.error);
        console.log("Response:", data.message);

        // 4. Change Role
        const newRole = testUser.RoleID === 1 ? 2 : 1;
        console.log(`\n4. Changing role to ${newRole}...`);
        res = await fetch(`${API_BASE}/users/${testUser.UserID}/role`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ roleID: newRole })
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.error);
        console.log("Response:", data.message);

        // 5. Revert Role
        console.log(`\n5. Reverting role to ${testUser.RoleID}...`);
        res = await fetch(`${API_BASE}/users/${testUser.UserID}/role`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ roleID: testUser.RoleID })
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.error);
        console.log("Response:", data.message);

        console.log("\n✅ All Admin API Integration Tests passed!");
    } catch (err) {
        console.error("\n❌ Test Failed:", err.message);
    }
}

runTests();
