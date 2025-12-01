const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { protect, authorize } = require('../middleware/rbac');

/**
 * @route   GET /api/users
 * @desc    Get all users for Admin management
 * @access  Private (Admin)
 */
router.get('/', protect, authorize(1), async (req, res) => {
    try {
        const users = await query(`
            SELECT u.userid, u.username, u.email, u.roleid, u.isactive, u.createdat, r.rolename
            FROM users u
            LEFT JOIN roles r ON u.roleid = r.roleid
            ORDER BY u.createdat DESC
        `);
        res.json(users);
    } catch (err) {
        console.error("Fetch Users Error:", err.message);
        res.status(500).json({ error: "Failed to fetch users." });
    }
});

/**
 * @route   PUT /api/users/:id/role
 * @desc    Update user role
 * @access  Private (Admin)
 */
router.put('/:id/role', protect, authorize(1), async (req, res) => {
    const { id } = req.params;
    const { roleID } = req.body;

    if (!roleID) return res.status(400).json({ error: "Role ID is required." });

    try {
        await query("UPDATE users SET roleid = ? WHERE userid = ?", [roleID, id]);
        res.json({ message: "User role updated successfully." });
    } catch (err) {
        console.error("Update Role Error:", err.message);
        res.status(500).json({ error: "Failed to update user role." });
    }
});

/**
 * @route   PUT /api/users/:id/status
 * @desc    Toggle user active status
 * @access  Private (Admin)
 */
router.put('/:id/status', protect, authorize(1), async (req, res) => {
    const { id } = req.params;
    const { isActive } = req.body;

    if (isActive === undefined) return res.status(400).json({ error: "IsActive status is required." });

    try {
        await query("UPDATE users SET isactive = ? WHERE userid = ?", [isActive ? true : false, id]);
        res.json({ message: "User status updated successfully." });
    } catch (err) {
        console.error("Update Status Error:", err.message);
        res.status(500).json({ error: "Failed to update user status." });
    }
});

/**
 * @route   POST /api/users/candidate
 * @desc    Create a new candidate user and profile
 * @access  Admin/Public (Modified for Phase 1 registration)
 */
router.post('/candidate', async (req, res) => {
    const { username, email, password, fullName, location, yearsOfExperience } = req.body;

    if (!username || !email || !password || !fullName) {
        return res.status(400).json({ error: "Required fields: username, email, password, fullName" });
    }

    try {
        // 1. Hash the password using the PostgreSQL function
        const hashResult = await query("SELECT hashpassword($1) AS hash", [password]);
        const passwordHash = hashResult[0].hash;

        // 2. Insert into users table (roleid 3 = Candidate)
        await query(`
            INSERT INTO users (username, email, passwordhash, roleid, isactive)
            VALUES (?, ?, ?, 3, true)`,
            [username, email, passwordHash]
        );

        // Get the newly created userid
        const userResult = await query(`
            SELECT userid FROM users 
            WHERE username = ? AND email = ? 
            ORDER BY userid DESC
            LIMIT 1`,
            [username, email]
        );

        if (userResult.length === 0) {
            throw new Error("Failed to retrieve new user ID");
        }

        const newUserId = userResult[0].userid;

        // 3. Create the Candidate Profile linking to the new userid
        await query(`
            INSERT INTO candidates (userid, fullname, location, yearsofexperience)
            VALUES (?, ?, ?, ?)`,
            [newUserId, fullName, location || 'N/A', yearsOfExperience || 0]
        );

        res.status(201).json({
            success: true,
            message: "Candidate profile created successfully.",
            userId: newUserId
        });
    } catch (err) {
        console.error("User Creation Error:", err.message);
        // Handle unique constraint violations (username/email)
        if (err.message.includes('unique') || err.message.includes('duplicate')) {
            return res.status(400).json({ error: "Username or email already exists." });
        }
        res.status(500).json({ error: "Failed to create candidate profile." });
    }
});

/**
 * @route   GET /api/users/profile/:userId
 * @desc    Get user profile (multi-role)
 * @access  Private
 */
router.get('/profile/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const users = await query(
            "SELECT userid, username, email, roleid FROM users WHERE userid = ?",
            [userId]
        );

        if (users.length === 0) return res.status(404).json({ error: "User not found." });

        const user = users[0];
        let profile = {};

        // Fetch role-specific profile data
        if (user.roleid === 3) { // Candidate
            const cand = await query("SELECT * FROM candidates WHERE userid = ?", [userId]);
            profile = cand[0] || {};
        } else if (user.roleid === 2) { // Recruiter
            const rec = await query("SELECT * FROM recruiters WHERE userid = ?", [userId]);
            profile = rec[0] || {};
        }

        res.json({ ...user, profile });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
