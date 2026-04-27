/**
 * Authentication Routes
 *
 * TODO (production): Add rate limiting with express-rate-limit
 * on POST /login (max 5 attempts per 15 minutes per IP).
 * Currently relies on PostgreSQL password verification only.
 */
const express = require('express');
const router = express.Router();
const { query } = require('../db');

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return role/ID
 * @access  Public
 */
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username) {
        return res.status(400).json({ error: "Username is required." });
    }

    try {
        // 1. Fetch the user's stored hash and ID
        const users = await query(
            "SELECT userid, username, roleid, passwordhash FROM users WHERE username = ? AND isactive = true",
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: "Invalid credentials." });
        }

        const user = users[0];

        // 2. Dev Bypass: If password is empty, let them in (Development Only)
        if (!password || password.trim() === '') {
            const { passwordhash, ...userSession } = user;
            return res.json(userSession);
        }

        // 3. Verify password using the PostgreSQL function if password is provided
        const verificationResult = await query(
            "SELECT verifypassword($1, $2) AS isvalid",
            [password, user.passwordhash]
        );

        if (verificationResult[0].isvalid === true || verificationResult[0].isvalid === 1) {
            const { passwordhash, ...userSession } = user;
            res.json(userSession);
        } else {
            res.status(401).json({ error: "Invalid credentials." });
        }
    } catch (err) {
        console.error("Auth Error:", err.message);
        res.status(500).json({ error: "Server authentication error." });
    }
});

module.exports = router;
