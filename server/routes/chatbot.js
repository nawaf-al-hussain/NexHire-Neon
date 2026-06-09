/**
 * Chatbot Routes
 * Provides FAQ-based AI assistant for candidates.
 * Matches user queries against a knowledge base and returns
 * contextual responses about jobs, applications, and interviews.
 */
const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { protect } = require('../middleware/rbac');

/**
 * @route   POST /api/chatbot/message
 * @desc    Send a message to the chatbot and get a response
 * @access  Private (Authenticated users)
 */
router.post('/message', protect, async (req, res) => {
    const startTime = Date.now();
    const { message, sessionId } = req.body;
    const userId = req.user.userid;
    const roleId = req.user.roleid;

    if (!message || !message.trim()) {
        return res.status(400).json({ error: "Message is required." });
    }

    try {
        // Generate session ID if not provided
        const chatSessionId = sessionId || `session_${userId}_${Date.now()}`;

        // Process the message and get response
        const { response, intent, confidence, entities } = await processMessage(message, userId, roleId);

        // Calculate resolution time
        const resolutionTimeSeconds = Math.round((Date.now() - startTime) / 1000);

        // Get CandidateID if user is a candidate (RoleID = 3)
        let candidateId = null;
        if (roleId === 3) {
            const candidateResult = await query(`
                SELECT candidateid FROM candidates WHERE userid = ?
            `, [userId]);
            if (candidateResult.length > 0) {
                candidateId = candidateResult[0].candidateid;
            }
        }

        // Save interaction to database
        await query(`
            INSERT INTO chatbotinteractions 
            (candidateid, sessionid, userquery, botresponse, intentrecognized, 
             confidencescore, entitiesrecognized, resolutiontimeseconds, platform)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Web')
        `, [
            candidateId,
            chatSessionId,
            message,
            response,
            intent,
            confidence,
            entities ? JSON.stringify(entities) : null,
            resolutionTimeSeconds
        ]);

        res.json({
            success: true,
            response,
            intent,
            confidence,
            sessionId: chatSessionId
        });
    } catch (err) {
        console.error("Chatbot Error:", err.message);
        res.status(500).json({ error: "Failed to process message." });
    }
});

/**
 * @route   POST /api/chatbot/feedback
 * @desc    Submit feedback for a chatbot interaction
 * @access  Private (Authenticated users)
 */
router.post('/feedback', protect, async (req, res) => {
    const { interactionId, wasHelpful } = req.body;

    if (!interactionId) {
        return res.status(400).json({ error: "Interaction ID is required." });
    }

    try {
        await query(`
            UPDATE chatbotinteractions 
            SET washelpful = ? 
            WHERE interactionid = ?
        `, [wasHelpful, interactionId]);

        res.json({ success: true });
    } catch (err) {
        console.error("Chatbot Feedback Error:", err.message);
        res.status(500).json({ error: "Failed to submit feedback." });
    }
});

/**
 * @route   GET /api/chatbot/history
 * @desc    Get chat history for the current user
 * @access  Private (Authenticated users)
 */
router.get('/history', protect, async (req, res) => {
    const userId = req.user.userid;
    const roleId = req.user.roleid;

    try {
        // Get CandidateID if user is a candidate
        let whereClause = { sql: 'WHERE 1=0', params: [] }; // Default to no results

        if (roleId === 3) {
            const candidateResult = await query(`
                SELECT candidateid FROM candidates WHERE userid = ?
            `, [userId]);
            if (candidateResult.length > 0) {
                whereClause = { 
                    sql: 'WHERE ci.candidateid = ?', 
                    params: [candidateResult[0].candidateid] 
                };
            }
        }

        const history = await query(`
            SELECT 
                ci.interactionid,
                ci.sessionid,
                ci.userquery,
                ci.botresponse,
                ci.intentrecognized,
                ci.washelpful,
                ci.createdat
            FROM chatbotinteractions ci
            ${whereClause.sql}
            ORDER BY ci.createdat DESC
        `, whereClause.params);

        // Convert the history keys to what frontend might expect if needed
        // But better to normalize frontend too. For now, let's keep it lowercase.
        res.json(history);
    } catch (err) {
        console.error("Chatbot History Error:", err.message);
        res.status(500).json({ error: "Failed to fetch chat history." });
    }
});

/**
 * @route   GET /api/chatbot/faq
 * @desc    Get FAQ list for quick replies
 * @access  Public
 */
router.get('/faq', async (req, res) => {
    try {
        const faqs = [
            // Applications
            { id: 1, question: "How do I apply for a job?", category: "Applications" },
            { id: 2, question: "What is my application status?", category: "Applications" },
            { id: 3, question: "How do I withdraw an application?", category: "Applications" },
            { id: 4, question: "What do application statuses mean?", category: "Applications" },
            { id: 5, question: "Tips for a strong application?", category: "Applications" },
            // Profile
            { id: 6, question: "How do I update my skills?", category: "Profile" },
            { id: 7, question: "How do I update my profile?", category: "Profile" },
            { id: 8, question: "How do I upload my resume?", category: "Profile" },
            { id: 9, question: "How do I upload documents?", category: "Profile" },
            { id: 10, question: "What is resume score?", category: "Profile" },
            { id: 11, question: "How do I control profile visibility?", category: "Profile" },
            // Interviews
            { id: 12, question: "How do I prepare for an interview?", category: "Interviews" },
            { id: 13, question: "What types of interviews are there?", category: "Interviews" },
            { id: 14, question: "How do video interviews work?", category: "Interviews" },
            { id: 15, question: "Common interview questions?", category: "Interviews" },
            { id: 16, question: "How do I reschedule an interview?", category: "Interviews" },
            // Skills & Assessments
            { id: 17, question: "What are skill assessments?", category: "Skills" },
            { id: 18, question: "How do I verify my skills?", category: "Skills" },
            { id: 19, question: "What is skill gap analysis?", category: "Skills" },
            // Job Search
            { id: 20, question: "How do I filter job searches?", category: "Job Search" },
            { id: 21, question: "How do I find remote jobs?", category: "Job Search" },
            { id: 22, question: "How do I set job alerts?", category: "Job Search" },
            { id: 23, question: "How do I save jobs for later?", category: "Job Search" },
            // Salary & Offers
            { id: 24, question: "How do I negotiate salary?", category: "Salary" },
            { id: 25, question: "What is the average salary for my role?", category: "Salary" },
            { id: 26, question: "Salary negotiation tips?", category: "Salary" },
            { id: 27, question: "How do I handle a job offer?", category: "Offers" },
            // Career & Learning
            { id: 28, question: "What is my career path?", category: "Career" },
            { id: 29, question: "How do I access learning paths?", category: "Career" },
            { id: 30, question: "I need career advice", category: "Career" },
            // Company Research
            { id: 31, question: "How do I research companies?", category: "Research" },
            { id: 32, question: "Where can I see company reviews?", category: "Research" },
            // Account & Settings
            { id: 33, question: "How do I manage notifications?", category: "Settings" },
            { id: 34, question: "How do I update location preferences?", category: "Settings" },
            { id: 35, question: "How do I reset my password?", category: "Account" },
            { id: 36, question: "How do I delete my account?", category: "Account" },
            // References
            { id: 37, question: "How do I request a recommendation?", category: "References" },
            // Gamification
            { id: 38, question: "What is the leaderboard?", category: "Gamification" },
            { id: 39, question: "How do I earn points?", category: "Gamification" },
            // Support
            { id: 40, question: "I have a technical issue", category: "Support" },
            { id: 41, question: "How do I contact support?", category: "Support" }
        ];
        res.json(faqs);
    } catch (err) {
        console.error("FAQ Error:", err.message);
        res.status(500).json({ error: "Failed to fetch FAQs." });
    }
});

/**
 * Process a user message and return a response
 * Rules-based intent recognition and response generation
 */
async function processMessage(message, userId, roleId) {
    const lowerMessage = message.toLowerCase().trim();
    let intent = 'unknown';
    let confidence = 0.5;
    let entities = {};
    let response = '';

    // Intent recognition patterns
    const intents = {
        greeting: {
            patterns: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy', 'greetings'],
            response: "Hello! I'm your NexHire assistant. How can I help you today? You can ask me about job applications, interviews, skills, or your profile."
        },
        goodbye: {
            patterns: ['bye', 'goodbye', 'see you', 'later', 'take care', 'have a good day', 'good night'],
            response: "Goodbye! Feel free to come back anytime you need help with your job search or career questions. Good luck! 🍀"
        },
        application_status: {
            patterns: ['application status', 'status of my application', 'my applications', 'where is my application', 'check my application', 'application update'],
            response: "To check your application status, go to the 'My Applications' tab in your dashboard. You'll see all your applications with their current status (Applied, Screening, Interview, etc.). Would you like me to explain what each status means?"
        },
        application_statuses: {
            patterns: ['what does applied mean', 'what does screening mean', 'application status meanings', 'status meanings'],
            response: "Application statuses explained:\n• **Applied** - Your application was submitted\n• **Screening** - Recruiter is reviewing your profile\n• **Interview** - You've been selected for an interview\n• **Offer** - You've received a job offer\n• **Rejected** - Application was declined\n• **Withdrawn** - You cancelled the application"
        },
        apply_job: {
            patterns: ['how do i apply', 'apply for a job', 'how to apply', 'submit application', 'applying for jobs'],
            response: "To apply for a job: 1) Go to the 'Discover Jobs' tab, 2) Browse available positions, 3) Click on a job to view details, 4) Click 'Apply' if you meet the requirements. Your profile information will be automatically included."
        },
        update_skills: {
            patterns: ['update my skills', 'add skills', 'how to add skills', 'edit skills', 'my skills', 'change skills'],
            response: "To update your skills: 1) Go to your Profile, 2) Click on the Skills section, 3) Click 'Add Skill' to add new skills, 4) Set your proficiency level (1-10). Verified skills through assessments get higher visibility with recruiters!"
        },
        matching: {
            patterns: ['how does matching work', 'match score', 'how am i matched', 'matching algorithm', 'compatibility score'],
            response: "Our matching algorithm considers: 1) Skill proficiency (40%) - How well your skills match job requirements, 2) Experience (30%) - Years of experience vs. job requirements, 3) Location (20%) - Proximity to job location, 4) Other factors like remote compatibility. Higher match scores mean better fit!"
        },
        interview_prep: {
            patterns: ['interview preparation', 'prepare for interview', 'interview tips', 'interview help', 'how to prepare for interview'],
            response: "For interview preparation: 1) Go to the 'Interview Prep' tab, 2) Select the job you're interviewing for, 3) Review generated questions and tips, 4) Practice with our AI-generated questions. We'll provide personalized prep materials based on the job requirements!"
        },
        interview_types: {
            patterns: ['types of interviews', 'video interview', 'phone interview', 'technical interview', 'what kind of interview'],
            response: "Common interview types on NexHire:\n• **Video Interview** - Live video call with recruiter\n• **Phone Screen** - Initial phone conversation\n• **Technical Assessment** - Coding or skill tests\n• **Panel Interview** - Multiple interviewers\n• **Final Interview** - Meeting with hiring manager\n\nCheck your 'Interviews' tab for scheduled interviews."
        },
        leaderboard: {
            patterns: ['leaderboard', 'points', 'gamification', 'badges', 'how to earn points', 'ranking'],
            response: "The leaderboard shows top candidates by points. Earn points by: 1) Daily login (+10 pts), 2) Completing profile (+50 pts), 3) Verifying skills (+100 pts), 4) Getting hired (+500 pts). Level up to unlock badges and increase visibility with recruiters!"
        },
        withdraw: {
            patterns: ['withdraw application', 'cancel application', 'how to withdraw', 'remove application'],
            response: "To withdraw an application: 1) Go to 'My Applications', 2) Find the application you want to withdraw, 3) Click 'Withdraw', 4) Provide a reason (optional). This won't affect your future applications."
        },
        assessments: {
            patterns: ['skill assessment', 'take assessment', 'verify skills', 'skill test', 'skill verification'],
            response: "Skill assessments verify your claimed skills: 1) Go to 'Skills Verification' tab, 2) Choose a skill to assess, 3) Complete the timed assessment, 4) Score 70%+ to get verified. Verified skills appear with a badge and boost your match scores!"
        },
        salary: {
            patterns: ['salary', 'negotiate salary', 'salary range', 'how much', 'pay scale', 'compensation'],
            response: "For salary guidance: 1) Check the 'Salary Coach' tab, 2) View market benchmarks for your role, 3) Get AI-generated negotiation scripts. We'll help you negotiate confidently based on market data!"
        },
        remote_work: {
            patterns: ['remote work', 'work from home', 'remote job', 'hybrid', 'wfh', 'telecommute'],
            response: "For remote work opportunities: 1) Set your location preferences to include 'Remote', 2) Check job listings for remote-friendly positions, 3) Your Remote Compatibility Score helps match you with suitable roles. Update your preferences in the 'Location Preferences' tab."
        },
        help: {
            patterns: ['help', 'what can you do', 'features', 'how can you help', 'assist me'],
            response: "I can help you with: 1) Job applications and status, 2) Interview preparation, 3) Skill assessments, 4) Profile updates, 5) Salary negotiation, 6) Understanding match scores, 7) Gamification and points. Just ask your question!"
        },
        thanks: {
            patterns: ['thank you', 'thanks', 'thx', 'appreciate it', 'thankful', 'cheers'],
            response: "You're welcome! Is there anything else I can help you with? Feel free to ask about jobs, applications, interviews, or any other NexHire features."
        },
        profile: {
            patterns: ['my profile', 'update profile', 'edit profile', 'complete profile', 'profile completion'],
            response: "To update your profile: 1) Click on your avatar/name in the sidebar, 2) Select 'Profile', 3) Edit your personal info, experience, education, and skills. A complete profile increases your visibility to recruiters by up to 80%!"
        },
        resume: {
            patterns: ['resume', 'cv', 'upload resume', 'my resume', 'download resume'],
            response: "To manage your resume: 1) Go to your Profile, 2) Look for the Resume section, 3) Upload a new resume (PDF recommended) or download your current one. Your resume score shows how well it matches job requirements!"
        },
        resume_score: {
            patterns: ['resume score', 'improve resume', 'resume tips', 'better resume'],
            response: "Your Resume Score is calculated based on: 1) Completeness of information, 2) Keywords matching job requirements, 3) Formatting and readability, 4) Experience descriptions. Check the 'Resume Score' tab for detailed feedback and improvement suggestions!"
        },
        notifications: {
            patterns: ['notifications', 'alerts', 'push notifications', 'email notifications', 'notification settings'],
            response: "To manage notifications: 1) Go to 'Push Notifications' tab, 2) Toggle notification types on/off, 3) Set your preferred delivery method (in-app, email, push). You'll receive alerts for application updates, interview invites, and new job matches!"
        },
        career_path: {
            patterns: ['career path', 'career growth', 'career progression', 'future career', 'career advice'],
            response: "Explore your career options: 1) Go to 'Career Path' tab, 2) View AI-generated career trajectories based on your skills, 3) See required skills for advancement, 4) Get personalized learning recommendations. Plan your next career move with data-driven insights!"
        },
        learning_paths: {
            patterns: ['learning path', 'courses', 'training', 'upskill', 'learn new skills', 'skill development'],
            response: "Access learning resources: 1) Go to 'Learning Paths' tab, 2) Browse recommended courses based on your skill gaps, 3) Track your progress, 4) Earn certificates to boost your profile. Continuous learning increases your market value!"
        },
        location_preferences: {
            patterns: ['location preferences', 'relocate', 'willing to move', 'job location', 'preferred location'],
            response: "Set your location preferences: 1) Go to 'Location Preferences' tab, 2) Add preferred cities/regions, 3) Indicate willingness to relocate, 4) Set maximum commute distance. This helps match you with jobs in your desired areas!"
        },
        video_interview: {
            patterns: ['video interview', 'online interview', 'virtual interview', 'zoom interview', 'video call'],
            response: "For video interviews: 1) Check your 'Interviews' tab for scheduled sessions, 2) Test your camera and microphone beforehand, 3) Join 5 minutes early, 4) Ensure stable internet and good lighting. The platform supports built-in video calling - no external apps needed!"
        },
        skill_gap: {
            patterns: ['skill gap', 'missing skills', 'skills i need', 'skill improvement', 'skill analysis'],
            response: "Analyze your skill gaps: 1) Go to 'Skill Gap Analysis' tab, 2) Select a target job or career goal, 3) View skills you have vs. skills needed, 4) Get personalized learning recommendations. Close the gap to become a stronger candidate!"
        },
        referral: {
            patterns: ['referral', 'refer a friend', 'referral bonus', 'referral program'],
            response: "Our referral program: 1) Refer friends for open positions, 2) If they get hired, you earn bonus points, 3) Referred candidates get priority screening. Check the 'Referrals' section to invite friends via email or social media!"
        },
        company_info: {
            patterns: ['company info', 'about company', 'employer information', 'who is hiring', 'company details'],
            response: "To learn about companies: 1) Click on any job listing, 2) View the company profile, 3) See company size, industry, benefits, and culture, 4) Read employee reviews. Research companies before applying to ensure they're a good fit!"
        },
        job_alerts: {
            patterns: ['job alerts', 'new jobs', 'job notifications', 'daily jobs', 'job recommendations'],
            response: "Set up job alerts: 1) Go to 'Push Notifications' tab, 2) Enable 'New Job Matches', 3) Set your criteria (skills, location, job type), 4) Receive daily or weekly alerts. Never miss a perfect opportunity!"
        },
        account_settings: {
            patterns: ['account settings', 'change password', 'update email', 'privacy settings', 'account security'],
            response: "To manage your account: 1) Click your avatar in the sidebar, 2) Select 'Settings', 3) Update password, email, or privacy preferences. You can also delete your account from this section if needed."
        },
        privacy: {
            patterns: ['privacy', 'data protection', 'gdpr', 'my data', 'personal information'],
            response: "Your privacy matters: 1) We never share your data without consent, 2) You control what recruiters see, 3) Request data export or deletion anytime, 4) View our Privacy Policy in the footer. Your information is encrypted and secure!"
        },
        technical_issues: {
            patterns: ['not working', 'bug', 'error', 'technical issue', 'broken', 'problem', 'issue'],
            response: "For technical issues: 1) Try refreshing the page, 2) Clear your browser cache, 3) Use a supported browser (Chrome, Firefox, Edge), 4) If the problem persists, contact support with details about the issue. We're here to help!"
        },
        contact_support: {
            patterns: ['contact support', 'customer service', 'help desk', 'support team', 'talk to human'],
            response: "To reach our support team: 1) Email support@nexhire.com, 2) Use the 'Contact Us' form in the footer, 3) Live chat available Mon-Fri 9AM-6PM. For urgent issues, mention 'URGENT' in your subject line!"
        },
        // Recruiter-specific intents
        talent_pool: {
            patterns: ['talent pool', 'candidate database', 'find candidates', 'search talent'],
            response: "As a recruiter, access the Talent Pool: 1) Go to 'Talent Pool' tab, 2) Use filters to find candidates (skills, experience, location), 3) View candidate profiles and match scores, 4) Shortlist or contact candidates directly. Build your talent pipeline!",
            roles: [2]  // Recruiter only
        },
        screening: {
            patterns: ['screening bot', 'auto screening', 'candidate screening', 'automated screening'],
            response: "Use the Screening Bot: 1) Go to 'Screening Bot' tab, 2) Set screening criteria for jobs, 3) AI automatically screens incoming applications, 4) Review flagged candidates. Save time on initial screening!",
            roles: [2]
        },
        analytics: {
            patterns: ['hiring analytics', 'recruitment metrics', 'hire analytics', 'time to hire'],
            response: "Access recruitment analytics: 1) Go to 'Hire Analytics' tab, 2) View time-to-hire, cost-per-hire, source effectiveness, 3) Track funnel conversion rates, 4) Export reports for stakeholders. Data-driven hiring decisions!",
            roles: [2]
        },
        interview_scheduling: {
            patterns: ['schedule interview', 'book interview', 'interview scheduling', 'set up interview'],
            response: "To schedule interviews: 1) Go to candidate's profile, 2) Click 'Schedule Interview', 3) Select date/time and interview type, 4) Send automated invites. Candidates receive calendar invites and reminders automatically!",
            roles: [2]
        },
        offer_management: {
            patterns: ['make offer', 'job offer', 'extend offer', 'offer letter'],
            response: "To extend a job offer: 1) Go to the candidate's application, 2) Click 'Make Offer', 3) Fill in salary, start date, and terms, 4) Send for candidate review. Track offer status in the application pipeline!",
            roles: [2]
        },
        // Admin-specific intents
        admin_dashboard: {
            patterns: ['admin dashboard', 'admin panel', 'system settings', 'platform management'],
            response: "Admin features include: 1) User management and roles, 2) Platform analytics, 3) System configuration, 4) Audit logs. Access these from the Admin Dashboard in your navigation!",
            roles: [1]  // Admin only
        },
        // ===== NEW INTENTS - Phase 2 Enhancement =====
        // Job Search & Filters
        job_search_filters: {
            patterns: ['job search filter', 'filter jobs', 'search jobs by', 'job search criteria', 'advanced search', 'refine search', 'narrow down jobs'],
            response: "Use job search filters to find perfect matches:\n\n**Available Filters:**\n1) **Skills** - Jobs requiring your skills\n2) **Location** - City, region, or remote\n3) **Experience Level** - Entry, mid, senior\n4) **Salary Range** - Min/max compensation\n5) **Job Type** - Full-time, part-time, contract\n6) **Industry** - Tech, healthcare, finance, etc.\n\nGo to 'Discover Jobs' and click the filter icon to apply multiple filters at once!\n\n*Tip: Save your filter presets for quick access later.*"
        },
        salary_inquiry: {
            patterns: ['average salary', 'market salary', 'what is the salary', 'salary for', 'how much does a', 'typical salary', 'salary benchmark', 'salary comparison'],
            response: "Check salary benchmarks:\n\n1) Go to 'Salary Coach' tab\n2) Enter your role and location\n3) View market data:\n   - **25th percentile** - Entry level\n   - **50th percentile** - Market average\n   - **75th percentile** - Senior/experienced\n\nYou'll also see:\n- Total compensation (base + benefits)\n- Regional variations\n- Industry comparisons\n\n*Want personalized negotiation tips? Ask about 'salary negotiation'!*"
        },
        salary_negotiation_tips: {
            patterns: ['salary negotiation tips', 'how to negotiate offer', 'negotiate higher salary', 'ask for raise', 'counter offer', 'negotiation strategy'],
            response: "Salary negotiation strategies:\n\n**Before the offer:**\n1) Research market rates (Salary Coach tab)\n2) Know your minimum acceptable\n3) Practice your pitch\n\n**During negotiation:**\n1) Let them make the first offer\n2) Use specific data, not emotions\n3) Consider total compensation\n4) Be confident but professional\n\n**Leverage points:**\n- Competing offers\n- Unique skills/certifications\n- Experience level\n\n*Check 'Salary Coach' for AI-generated scripts tailored to your situation!*"
        },
        interview_scheduling_candidate: {
            patterns: ['reschedule interview', 'change interview time', 'interview time conflict', 'cancel interview', 'interview availability', 'when is my interview'],
            response: "Manage your interview schedule:\n\n**To view scheduled interviews:**\n1) Go to 'My Interviews' tab\n2) See all upcoming sessions\n\n**To reschedule:**\n1) Click on the interview\n2) Select 'Request Reschedule'\n3) Propose new times\n4) Wait for recruiter confirmation\n\n**To cancel:**\n1) Click 'Cancel Interview'\n2) Provide reason (required)\n3) Submit at least 24 hours before\n\n*Tip: Good communication with recruiters maintains positive relationships!*"
        },
        document_upload: {
            patterns: ['upload document', 'upload certificate', 'upload portfolio', 'add attachment', 'document upload', 'supporting documents', 'certificates'],
            response: "Upload supporting documents:\n\n**Accepted file types:**\n- PDF, DOC, DOCX, JPG, PNG\n- Max size: 5MB per file\n\n**To upload:**\n1) Go to your Profile\n2) Scroll to 'Documents' section\n3) Click 'Upload Document'\n4) Select file type:\n   - Certificates\n   - Portfolio\n   - Recommendation letters\n   - Other credentials\n\n**Benefits:**\n- Verified credentials boost credibility\n- Recruiters can view your achievements\n- Higher match scores for verified skills\n\n*Tip: Name your files clearly (e.g., 'AWS_Certificate.pdf')*"
        },
        notification_preferences: {
            patterns: ['notification preferences', 'email preferences', 'alert settings', 'turn off notifications', 'notification frequency', 'quiet hours'],
            response: "Customize your notification preferences:\n\n**Notification types:**\n1) **Application updates** - Status changes\n2) **Interview reminders** - 24hr and 1hr alerts\n3) **Job matches** - New matching jobs\n4) **Messages** - Recruiter communications\n5) **System** - Platform updates\n\n**Delivery methods:**\n- In-app notifications\n- Email alerts\n- Push notifications (mobile)\n\n**To configure:**\n1) Go to 'Push Notifications' tab\n2) Toggle each type on/off\n3) Set quiet hours (no disturbances)\n4) Choose email frequency (instant/daily/weekly)\n\n*Tip: Keep application updates enabled to never miss an opportunity!*"
        },
        account_deletion: {
            patterns: ['delete account', 'close account', 'remove account', 'permanently delete', 'account removal', 'deactivate account'],
            response: "Account deletion process:\n\n**Before deleting:**\n1) Download your data (Settings > Export Data)\n2) Withdraw active applications\n3) Save any important documents\n\n**To delete your account:**\n1) Go to Settings > Account\n2) Click 'Delete Account'\n3) Enter your password\n4) Confirm deletion\n\n**What happens:**\n- Profile removed from talent pool\n- Applications withdrawn\n- Data deleted within 30 days\n- Cannot be undone\n\n*Warning: This action is permanent. Consider deactivating instead if you might return.*"
        },
        password_reset: {
            patterns: ['forgot password', 'reset password', 'change password', 'password recovery', 'cant login', 'locked out', 'new password'],
            response: "Password reset options:\n\n**If you can still login:**\n1) Go to Settings > Security\n2) Click 'Change Password'\n3) Enter current and new password\n4) Save changes\n\n**If you can't login:**\n1) Click 'Forgot Password' on login page\n2) Enter your registered email\n3) Check inbox for reset link\n4) Link expires in 1 hour\n\n**Password requirements:**\n- Minimum 8 characters\n- At least 1 uppercase letter\n- At least 1 number\n- At least 1 special character\n\n*Tip: Use a password manager for security!*"
        },
        company_reviews: {
            patterns: ['company reviews', 'employer reviews', 'company rating', 'work culture', 'employee reviews', 'company reputation', 'glassdoor'],
            response: "Research company reviews:\n\n**To view reviews:**\n1) Go to any job listing\n2) Click 'Company Profile'\n3) Scroll to 'Reviews' section\n\n**What you'll find:**\n- Overall rating (1-5 stars)\n- Work-life balance score\n- Salary satisfaction\n- Management quality\n- Interview experience\n- Written reviews from employees\n\n**To contribute:**\n- After being hired, you can leave anonymous reviews\n- Help other candidates make informed decisions\n\n*Tip: Read recent reviews for current culture insights!*"
        },
        saved_jobs: {
            patterns: ['saved jobs', 'bookmark job', 'save for later', 'shortlist jobs', 'my saved jobs', 'favorite jobs', 'saved positions'],
            response: "Manage your saved jobs:\n\n**To save a job:**\n1) Browse jobs in 'Discover Jobs'\n2) Click the bookmark icon\n3) Job added to your saved list\n\n**To view saved jobs:**\n1) Go to 'My Applications' tab\n2) Click 'Saved Jobs' subtab\n3) See all bookmarked positions\n\n**Actions available:**\n- Apply to saved jobs\n- Remove from saved\n- Set reminders for deadlines\n- Compare saved jobs side-by-side\n\n*Tip: Saved jobs expire after 30 days if the position is closed. Apply promptly!*"
        },
        offer_negotiation: {
            patterns: ['job offer negotiation', 'accept offer', 'decline offer', 'offer deadline', 'multiple offers', 'offer terms', 'offer decision'],
            response: "Handling job offers:\n\n**When you receive an offer:**\n1) Check 'My Applications' for offer details\n2) Review salary, benefits, start date\n3) You have 3-7 days to respond typically\n\n**To accept:**\n1) Click 'Accept Offer'\n2) Confirm start date\n3) Complete any pre-employment forms\n\n**To negotiate:**\n1) Click 'Request Changes'\n2) Specify what you want adjusted\n3) Provide justification\n4) Wait for response\n\n**To decline:**\n1) Click 'Decline Offer'\n2) Provide reason (optional but appreciated)\n3) Remain professional\n\n*Tip: Even if declining, maintain good relations - the company may have future opportunities!*"
        },
        profile_visibility: {
            patterns: ['profile visibility', 'who can see my profile', 'hide profile', 'profile privacy', 'visible to recruiters', 'anonymous profile', 'profile exposure'],
            response: "Control your profile visibility:\n\n**Visibility levels:**\n1) **Public** - All recruiters can find you\n2) **Limited** - Only recruiters with jobs you applied to\n3) **Private** - Hidden from search\n\n**To change visibility:**\n1) Go to Settings > Privacy\n2) Select visibility level\n3) Choose what information to show:\n   - Name (or anonymous)\n   - Current employer\n   - Salary expectations\n   - Contact info\n\n**Anonymous mode:**\n- Recruiters see skills and experience\n- Your name is hidden\n- You reveal identity when applying\n\n*Tip: Public visibility increases your chances of being headhunted!*"
        },
        recommendation_request: {
            patterns: ['recommendation letter', 'request recommendation', 'reference request', 'get recommendation', 'need reference', 'professional reference'],
            response: "Request recommendations:\n\n**Who to ask:**\n- Former managers\n- Colleagues/team members\n- Academic advisors\n- Clients (for freelancers)\n\n**How to request:**\n1) Go to Profile > Recommendations\n2) Click 'Request Recommendation'\n3) Enter recommender's email\n4) Add a personal message\n5) They'll receive a link to write one\n\n**Best practices:**\n- Ask people who know your work well\n- Give them context (job you're applying for)\n- Offer to reciprocate\n- Thank them afterward\n\n*Tip: Recommendations appear on your profile and boost credibility with recruiters!*"
        },
        career_advice: {
            patterns: ['career advice', 'career tips', 'career guidance', 'professional development', 'career change', 'switch career', 'career transition'],
            response: "Get personalized career advice:\n\n**Career exploration:**\n1) Go to 'Career Path' tab\n2) View AI-suggested trajectories\n3) See skills needed for advancement\n\n**For career changers:**\n1) Identify transferable skills\n2) Use 'Skill Gap Analysis' to find missing skills\n3) Take recommended courses\n4) Get certifications in new field\n\n**Career growth tips:**\n- Build a strong LinkedIn presence\n- Network actively in your industry\n- Seek mentorship opportunities\n- Stay updated on industry trends\n\n**Resources available:**\n- Career Path Simulator\n- Learning Paths\n- Salary Coach\n- Interview Prep\n\n*Tip: Set career goals in your profile to get tailored recommendations!*"
        },
        interview_questions: {
            patterns: ['common interview questions', 'interview questions and answers', 'what questions to expect', 'practice interview', 'interview q&a', 'behavioral questions'],
            response: "Prepare for interview questions:\n\n**Question categories:**\n\n**Behavioral:**\n- 'Tell me about yourself'\n- 'Why do you want this job?'\n- 'Greatest strength/weakness'\n\n**Technical:**\n- Role-specific skills\n- Problem-solving scenarios\n- Case studies\n\n**Situational:**\n- 'How would you handle...'\n- Conflict resolution\n- Team collaboration\n\n**To practice:**\n1) Go to 'Interview Prep' tab\n2) Select target job\n3) Get AI-generated questions\n4) Practice with sample answers\n5) Record yourself (optional)\n\n*Tip: Use the STAR method (Situation, Task, Action, Result) for behavioral questions!*"
        },
        application_tips: {
            patterns: ['application tips', 'how to write cover letter', 'application advice', 'improve application', 'stand out application', 'application best practices'],
            response: "Make your application stand out:\n\n**Before applying:**\n1) Tailor your resume to the job\n2) Write a customized cover letter\n3) Highlight relevant skills first\n4) Quantify achievements\n\n**Cover letter tips:**\n- Address the hiring manager by name\n- Show you researched the company\n- Connect your skills to job requirements\n- Keep it to one page\n\n**Application checklist:**\n- Profile 100% complete\n- Resume updated\n- Skills verified\n- Portfolio attached (if applicable)\n\n**After applying:**\n- Follow up after 1 week\n- Keep applying to other jobs\n- Prepare for interviews\n\n*Tip: Applications with verified skills get 3x more responses!*"
        },
        // Recruiter-specific new intents
        candidate_search: {
            patterns: ['search candidates', 'find talent', 'candidate search', 'look for candidates', 'search resumes', 'candidate lookup'],
            response: "Search for candidates:\n\n**Search methods:**\n1) **Talent Pool** - Browse all candidates\n2) **Skill Search** - Find by specific skills\n3) **Job Match** - View matched candidates for a job\n\n**To search:**\n1) Go to 'Talent Pool' tab\n2) Use filters:\n   - Skills (required/optional)\n   - Experience years\n   - Location\n   - Availability\n   - Salary expectations\n3) Sort by match score\n4) Save search alerts\n\n**Actions:**\n- View full profile\n- Shortlist for job\n- Send message\n- Schedule interview\n\n*Tip: Save frequent searches for quick access!*",
            roles: [2]
        },
        job_posting: {
            patterns: ['post a job', 'create job listing', 'new job posting', 'add job', 'job posting tips', 'create position'],
            response: "Create a job posting:\n\n**To post a job:**\n1) Go to 'Jobs' tab\n2) Click 'Create New Job'\n3) Fill in details:\n   - Job title\n   - Department\n   - Required skills\n   - Experience level\n   - Salary range\n   - Location/remote options\n\n**Best practices:**\n- Write clear job descriptions\n- List must-have vs nice-to-have skills\n- Include company benefits\n- Set realistic experience requirements\n\n**After posting:**\n- Review matched candidates\n- Set up screening criteria\n- Enable auto-screening\n\n*Tip: Jobs with salary ranges get 30% more applications!*",
            roles: [2]
        },
        candidate_outreach: {
            patterns: ['contact candidate', 'message candidate', 'reach out to candidate', 'candidate communication', 'send message to talent'],
            response: "Reach out to candidates:\n\n**To message a candidate:**\n1) Go to their profile\n2) Click 'Send Message'\n3) Write personalized message\n4) They'll receive notification + email\n\n**Message tips:**\n- Mention the specific job\n- Highlight why they're a good match\n- Include next steps\n- Keep it professional but warm\n\n**Response tracking:**\n- View sent messages in 'Messages' tab\n- See read/delivered status\n- Set follow-up reminders\n\n*Tip: Personalized messages get 40% higher response rates!*",
            roles: [2]
        },
        // Admin-specific new intents
        user_management: {
            patterns: ['manage users', 'user accounts', 'user administration', 'edit user', 'suspend user', 'user roles'],
            response: "User management (Admin):\n\n**User actions:**\n1) **View all users** - List with filters\n2) **Edit roles** - Change Admin/Recruiter/Candidate\n3) **Suspend accounts** - Temporary disable\n4) **Delete users** - Permanent removal\n\n**To manage users:**\n1) Go to Admin Dashboard\n2) Click 'User Management'\n3) Search or filter users\n4) Select action\n\n**Audit trail:**\n- All admin actions are logged\n- View in 'Audit Logs' tab\n\n*Warning: Role changes take effect immediately!*",
            roles: [1]
        },
        platform_analytics: {
            patterns: ['platform statistics', 'system analytics', 'overall metrics', 'platform performance', 'site analytics', 'global statistics'],
            response: "Platform analytics (Admin):\n\n**Key metrics:**\n- Total users by role\n- Active users (daily/monthly)\n- Job postings count\n- Applications submitted\n- Successful hires\n\n**To view:**\n1) Go to Admin Dashboard\n2) Click 'Platform Analytics'\n3) Select date range\n4) Export reports\n\n**Trends tracked:**\n- User growth\n- Application volume\n- Time-to-hire averages\n- Platform engagement\n\n*Tip: Schedule weekly reports to your email!*",
            roles: [1]
        }
    };

    // Find matching intent
    let bestMatch = null;
    let bestScore = 0;

    for (const [intentName, intentData] of Object.entries(intents)) {
        // Check if intent is role-restricted and if user has permission
        if (intentData.roles && !intentData.roles.includes(roleId)) {
            continue; // Skip this intent if user doesn't have the required role
        }

        for (const pattern of intentData.patterns) {
            if (lowerMessage.includes(pattern)) {
                const score = pattern.length / lowerMessage.length;
                if (score > bestScore) {
                    bestScore = score;
                    bestMatch = { name: intentName, data: intentData };
                }
            }
        }
    }

    if (bestMatch) {
        intent = bestMatch.name;
        confidence = Math.min(0.95, 0.6 + bestScore);
        response = bestMatch.data.response;
    } else {
        // Default response for unrecognized intents - role-aware
        if (roleId === 1) {
            // Admin
            response = "I'm not sure I understand. As an admin, you can ask me about:\n• User management\n• Platform analytics\n• System configuration\n• Audit logs\n• Or type 'help' for more options";
        } else if (roleId === 2) {
            // Recruiter
            response = "I'm not sure I understand. As a recruiter, you can ask me about:\n• Talent pool and candidate search\n• Screening and interview scheduling\n• Hiring analytics\n• Job postings\n• Or type 'help' for more options";
        } else {
            // Candidate
            response = "I'm not sure I understand. You can ask me about:\n• Job applications and status\n• Interview preparation\n• Skills and assessments\n• Salary negotiation\n• Match scores\n• Or type 'help' for more options";
        }
        confidence = 0.3;
    }

    return { response, intent, confidence, entities };
}

module.exports = router;
