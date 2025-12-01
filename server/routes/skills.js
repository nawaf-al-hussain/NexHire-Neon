const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { protect } = require('../middleware/rbac');

/**
 * @route   GET /api/skills
 * @desc    Get all available skills
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
    try {
        const skills = await query("SELECT * FROM skills ORDER BY skillname ASC");
        res.json(skills);
    } catch (err) {
        console.error("Fetch Skills Error:", err.message);
        res.status(500).json({ error: "Failed to fetch skills." });
    }
});

module.exports = router;
