// Vercel serverless entry point — wraps the existing Express app.
//
// IMPORTANT: Vercel serverless functions are stateless and short-lived.
// Each request may run in a fresh container. The pg Pool in server/db.js
// is created once per cold-start and reused across warm invocations.
//
// DEBUGGING: If you see FUNCTION_INVOCATION_FAILED on Vercel, check the
// Vercel dashboard → your project → Logs tab. Any error thrown during
// module load (top-level require) will crash the function silently.

// Load .env (Vercel injects env vars automatically, but for local dev)
try { require('dotenv').config(); } catch (e) { /* dotenv optional on Vercel */ }

// Catch any module-load errors and surface them with a 500 response
// instead of FUNCTION_INVOCATION_FAILED (which gives no info).
let app;
let loadError = null;

try {
    const express = require('express');
    const cors = require('cors');

    const { query, connectDB, pool } = require('../server/db');

    const authRoutes = require('../server/routes/auth');
    const userRoutes = require('../server/routes/users');
    const jobRoutes = require('../server/routes/jobs');
    const skillRoutes = require('../server/routes/skills');
    const applicationRoutes = require('../server/routes/applications');
    const candidateRoutes = require('../server/routes/candidates');
    const analyticsRoutes = require('../server/routes/analytics');
    const maintenanceRoutes = require('../server/routes/maintenance');
    const interviewRoutes = require('../server/routes/interviews');
    const assessmentRoutes = require('../server/routes/assessments');
    const recruiterRoutes = require('../server/routes/recruiters');
    const chatbotRoutes = require('../server/routes/chatbot');

    app = express();

    // Middleware (mirrors server/index.js)
    app.use(cors({
        origin: process.env.CORS_ORIGIN
            ? process.env.CORS_ORIGIN.split(',')
            : ['http://localhost:5173', 'http://localhost:5174'],
        credentials: true,
    }));
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Health check at /api/status — also reports DB connection state.
    // Vercel will hit this for cold-starts; use it to verify env vars.
    app.get('/api/status', async (req, res) => {
        const dbConn = process.env.DB_CONNECTION_STRING;
        if (!dbConn) {
            return res.status(500).json({
                status: 'online',
                database: 'misconfigured',
                error: 'DB_CONNECTION_STRING environment variable is not set. Add it in Vercel dashboard → Settings → Environment Variables.',
                environment: process.env.VERCEL_ENV || 'development',
                region: process.env.VERCEL_REGION || 'local',
            });
        }
        try {
            await query("SELECT 1");
            res.json({
                status: 'online',
                database: 'connected',
                serverTime: new Date(),
                environment: process.env.VERCEL_ENV || 'development',
                region: process.env.VERCEL_REGION || 'local',
            });
        } catch (err) {
            res.status(500).json({
                status: 'online',
                database: 'disconnected',
                error: err.message,
                hint: 'Check that DB_CONNECTION_STRING is correct and that your Neon database allows connections from Vercel (it should by default — Neon accepts all IPs unless you set IP allowlisting).',
            });
        }
    });

    // Register all routes
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/jobs', jobRoutes);
    app.use('/api/skills', skillRoutes);
    app.use('/api/applications', applicationRoutes);
    app.use('/api/candidates/assessments', assessmentRoutes);
    app.use('/api/candidates', candidateRoutes);
    app.use('/api/analytics', analyticsRoutes);
    app.use('/api/maintenance', maintenanceRoutes);
    app.use('/api/interviews', interviewRoutes);
    app.use('/api/recruiters', recruiterRoutes);
    app.use('/api/chatbot', chatbotRoutes);

    // 404 fallback for unknown /api/* routes
    app.use('/api', (req, res) => {
        res.status(404).json({ error: `API endpoint not found: ${req.method} ${req.originalUrl}` });
    });

    // Eagerly connect on cold start (non-blocking, fire-and-forget)
    if (process.env.VERCEL) {
        connectDB().catch(err => {
            console.error('Initial DB connection failed on cold start:', err.message);
        });
    }

    // Global error handler — catches uncaught async errors so they return
    // a clean 500 JSON instead of hanging until Vercel's 60s timeout.
    app.use((err, req, res, next) => {
        console.error('Unhandled error:', err.message);
        res.status(500).json({ error: 'Internal server error.' });
    });

    // Export the pool too (some Vercel tooling expects it)
    module.exports = app;
    module.exports.pool = pool;

} catch (err) {
    // Module-load failed. Create a fallback Express app that returns the
    // error message for every request — much easier to debug than
    // FUNCTION_INVOCATION_FAILED.
    loadError = err;
    console.error('FATAL: api/index.js module load failed:', err);

    const express = require('express');
    app = express();
    app.use(express.json());

    app.use('/api', (req, res) => {
        res.status(500).json({
            error: 'Serverless function failed to initialize',
            message: err.message,
            stack: process.env.VERCEL_ENV !== 'production' ? err.stack : undefined,
            hint: 'Check Vercel Logs for the full stack trace. Most common causes: (1) missing env var, (2) require() of file outside /api without includeFiles config, (3) native module not supported in serverless.',
        });
    });

    module.exports = app;
}
