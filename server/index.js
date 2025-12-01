const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { query, connectDB } = require('./db');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const jobRoutes = require('./routes/jobs');
const skillRoutes = require('./routes/skills');
const applicationRoutes = require('./routes/applications');
const candidateRoutes = require('./routes/candidates');
console.log('✓ Candidates router loaded');
const analyticsRoutes = require('./routes/analytics');
const maintenanceRoutes = require('./routes/maintenance');
const interviewRoutes = require('./routes/interviews');
const assessmentRoutes = require('./routes/assessments');
const recruiterRoutes = require('./routes/recruiters');
const chatbotRoutes = require('./routes/chatbot');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
    console.log(`[REQ] ${req.method} ${req.originalUrl}`);
    next();
});
// Routes
console.log('Registering routes...');
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/candidates', candidateRoutes);
console.log('✓ All routes registered');
app.use('/api/analytics', analyticsRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/candidates/assessments', assessmentRoutes);
app.use('/api/recruiters', recruiterRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Health Check
app.get('/api/status', async (req, res) => {
    try {
        await query("SELECT 1");
        res.json({
            status: 'online',
            database: 'connected',
            serverTime: new Date(),
            environment: process.env.NODE_ENV || 'development'
        });
    } catch (err) {
        res.status(500).json({
            status: 'online',
            database: 'disconnected',
            error: err.message
        });
    }
});

// Start Server
app.listen(PORT, async () => {
    console.log(`🚀 NexHire Server running on port ${PORT}`);
    try {
        await connectDB();
    } catch (err) {
        console.error('❌ Initial DB connection failed:', err.message);
    }
});
