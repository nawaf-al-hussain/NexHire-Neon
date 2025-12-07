# Features Inventory

## ✅ Advanced AI & Matching
- **Weighted Matching** — Skill proficiency + experience + location scoring.
- **Semantic Similarity** — CLR `CosineSimilarity` for resume matching.
- **Fuzzy Search** — JaroWinkler/Levenshtein candidate name search.
- **Auto-Screening** — Rules-based confidence scoring for applications.
- **Instant Auto-Rejection** — Automatic rejection of candidates who don't meet minimum experience requirements. Uses `trg_InstantAutoReject` trigger on INSERT to Applications table and `sp_AutoRejectUnqualified` stored procedure for batch processing. Recruiter UI shows statistics and list of auto-rejected candidates.
- **Skill-Level Matching** — Compares candidate proficiency levels vs job requirements (green=meets, amber=partial, red=missing).
- **AI Interview Question Generator** — Generates tailored interview questions based on job skills, difficulty levels, and question types (Technical, Behavioral, Cultural). Questions can be saved to database for reuse and tracked for usage statistics.
- **Candidate Ranking History** — Stores match scores with timestamps for audit trail. Shows score evolution over time with trend analysis (improving/declining/stable). Integrated into Candidate Profile Modal's History tab.
- **Predictive Hiring Success** — Rules-Based AI that predicts candidate success probability using weighted factors: Skill Match (30%), Interview Score (30%), Experience Match (25%), Response Engagement (15%), with Historical Success adjustment. Uses `sp_PredictHireSuccess` stored procedure.

## ✅ Analytics & Market Intelligence
- **Market Intel Dashboard** — Real-time skill demand/supply and salary trends.
- **Market Alerts** — Personalized market intelligence for recruiters (Salary, Demand, Competitor alerts with severity levels).
- **DEI Funnel** — Anonymized diversity analytics for all hiring stages.
- **Bias Detection** — Statistical identification of location/experience bias.
- **Ghosting Risk Dashboard** — Enhanced dashboard with filter by risk level, search by name, sort options, trend chart, send reminder to candidates, auto-refresh, and CSV export. Uses vw_GhostingRiskDashboard view and sp_PredictGhostingRisk procedure.
- **Anti-Ghosting Risk Prediction** — Predictive scoring per application based on historical ghosting patterns, response times, and communication frequency.
- **Salary Transparency** — Correlates transparency with volume.
- **Candidate Engagement** — Interview confirmations vs scheduled rates.
- **External Platform Sync** — LinkedIn, Indeed, Glassdoor job syndication.
- **Time to Hire Analytics** — Individual candidate hiring timelines with average days, fast/slow hire breakdown.
- **Referral Intelligence** — Comprehensive referral network analytics with 5 tabs: Overview (summary stats, outcome breakdown by relationship type), Top Referrers (leaderboard with conversion rates), Recent Referrals (detailed table), Network Analysis (connection strength visualization), and AI Suggestions (job-specific referral recommendations using sp_SuggestReferrals stored procedure - analyzes job requirements, candidate network connections, historical referral performance, and provides ranked list of potential referrers with fit scores).
- **Send Reminder** — Recruiters can send follow-up reminders to candidates directly from Ghosting Risk Dashboard. Creates PushNotifications using the same schema as notification triggers (UserID, Title, Body, NotificationType, DataPayload).
- **Background Check Integration** — Multi-type checks (Criminal, Education, Employment, Credit, Reference, Drug) with vendor integration, risk scoring, status tracking, and compliance verification. Dashboard shows summary stats, checks by type, and recent checks with search/filter.
- **Remote Work Analytics** — Comprehensive remote work compatibility analytics with summary stats (avg score, excellent/poor matches, timezone overlap), candidate factor averages (workspace quality, timezone alignment, communication, distraction resistance, self motivation), match distribution visualization, and detailed assessment table. Uses vw_RemoteCompatibilityMatrix view.

## ✅ Candidate Experience & Gamification
- **Personalized Learning** — Skill gap identification with resource mapping.
- **Career Path Simulator** — Interactive modal for simulating career transitions. Shows probability, expected salary increase, required skills gap, and development plan. Uses `sp_PredictCareerPath` stored procedure with timeline slider (6-60 months).
- **Gamification Hub** — Points, levels, badges, and streaks (daily login, profile completion, skill verification). Includes global leaderboard rankings.
- **Negotiation Coach** — AI-generated salary benchmarks and negotiation scripts. Visual redesign with color-coded assessment cards, salary comparison bar, and copy-to-clipboard scripts. Uses `sp_GenerateNegotiationStrategy` (3 params: CandidateID, JobID, InitialOffer).
- **Push Notifications** — Multi-platform notification delivery tracking.
- **Skill Gap Analysis** — Personalized analysis of skills needed for target roles.
- **Resume Score** — AI-powered resume quality analysis and improvement suggestions.
- **Interview Prep** — Personalized interview preparation materials by job.
- **Location Preferences** — Remote/hybrid work preferences management.
- **Candidate Profile Modal** — Multi-tab comprehensive profile view for recruiters with Overview (resume score, engagement rate, ghosting risk, remote compatibility), Skills (verified vs claimed), AI Insights (predictions, career goals), and History (applications, interviews).

## ✅ Security & Compliance
- **GDPR Consent** — Versioned tracking, expiry, and revocation support.
- **PII Anonymization** — `sp_AnonymizeArchivedCandidates` for GDPR.
- **PBKDF2 Hashing** — OWASP-compliant password security via CLR.
- **Role Masking** — Dynamic data masking based on recruiter/analyst role.
- **Blockchain Verification** — Credential hashing for fraud prevention.

## ✅ AI Assistant & Chatbot
- **AI Chatbot** — Rule-based conversational assistant with intent recognition for candidates, recruiters, and admins. Supports 40+ intents covering applications, interviews, skills, profile, salary, career, gamification, and more.
- **Role-Specific Responses** — Chatbot adapts responses based on user role (Candidate, Recruiter, Admin).
- **FAQ System** — Quick reply functionality with categorized FAQs.
- **Chat History** — Stores and retrieves conversation history per user session.
- **Feedback Collection** — Allows users to rate chatbot helpfulness for continuous improvement.

## ✅ Candidate Sentiment Tracking
- **Sentiment Analysis** — Analyzes candidate communication (emails, interviews, calls, chats) using NLP.
- **Trend Tracking** — Monitors sentiment over time to identify improving or declining engagement.
- **At-Risk Detection** — Identifies candidates with declining sentiment who may disengage.
- **Communication Styles** — Classifies candidate communication patterns.
- **Red Flag Detection** — Automatically flags negative sentiment indicators.
- **Overall Stats** — Aggregated metrics across all candidate interactions.

## ✅ Interview Intelligence
- **AI Question Generator** — Generates tailored interview questions based on job skills, difficulty levels, and question types (Technical, Behavioral, Cultural). Questions can be saved to database for reuse.
- **Question Usage Tracking** — Tracks usage statistics and success rates of generated questions.
- **Interview Round Optimizer** — Reduces redundant interviews by analyzing candidate's interview history and job requirements. Uses `sp_OptimizeInterviewRounds`.
- **Transcription Analysis** — Extracts topics, sentiment, filler words, and action items from interview transcripts.

## ✅ Onboarding Success Prediction
- **Predictive Analytics** — Rules-based AI predicting candidate onboarding success probability after being hired.
- **Risk Factors** — Identifies specific factors that may impact onboarding success.
- **Recommendations** — Provides actionable recommendations to improve onboarding outcomes.
- **Retention Prediction** — Predicts expected retention months for new hires.

## ✅ Diversity, Equity & Inclusion
- **Diversity Goals** — Create and track DEI goals with target percentages and progress monitoring.
- **Goal Management** — Set goals by metric type with start/end dates and recruiter assignment.
- **Progress Tracking** — Compare current percentage against target goals.

## ✅ Bias Detection & Management
- **Bias Detection Logs** — Automated detection and logging of potential bias patterns in hiring decisions.
- **Severity Levels** — Classify detected biases by severity (Low, Medium, High, Critical).
- **Resolution Workflow** — Mark bias issues as resolved with timestamp tracking.
- **Action Suggestions** — Provides suggested actions to address detected biases.

## ✅ Background Checks
- **Multi-Type Checks** — Supports Criminal, Education, Employment, Credit, Reference, and Drug check types.
- **Vendor Integration** — Request and track checks through external vendors.
- **Risk Scoring** — Automated risk assessment based on check results.
- **Status Tracking** — Full lifecycle tracking (Requested, InProgress, Completed, Failed, Cleared, Adverse).
- **Compliance Verification** — Track compliance status for each check type.
- **Dashboard** — Summary statistics, checks by type, and recent activity.

## ✅ Blockchain Credentials
- **Credential Verification** — Submit and verify credentials (Degree, Certificate, Employment, Identity) on blockchain.
- **Multiple Networks** — Support for Ethereum and other blockchain networks.
- **Immutable Records** — Tam-proof credential storage with transaction tracking.
- **Verification Status** — Track verification status (Pending, Verified, Failed, Expired).
- **Dashboard** — Summary of all verifications with status breakdown.
