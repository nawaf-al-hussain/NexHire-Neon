"""Patch RecruiterDashboard.jsx and CandidateDashboard.jsx and AdminDashboard.jsx
to lazy-load tab-specific components. CRLF-safe.
"""
from pathlib import Path
import re

PAGES_DIR = Path("/home/z/my-project/work/neon/NexHire-Frontend-(Neon)/client/src/pages")

# === RecruiterDashboard.jsx ===
file = PAGES_DIR / "RecruiterDashboard.jsx"
text = file.read_text(encoding='utf-8')

# Find the import block (lines 1-27) and replace it
old_imports = """import React from 'react';
import { Briefcase, Users, PlusCircle, Target, Sparkles, TrendingUp, Clock, AlertCircle, Calendar, CheckCircle2, RefreshCw, BarChart3, Shield, AlertTriangle, CheckCircle, Timer, Video, Link2, Activity, Bot, Bell, Network, MessageSquare, FileCheck, Brain, UserCheck, Lightbulb, ShieldAlert } from 'lucide-react';
import DashboardShell from '../components/DashboardShell';
import JobList from '../components/Jobs/JobList';
import JobModal from '../components/Jobs/JobModal';
import CandidateMatches from '../components/Jobs/CandidateMatches';
import ApplicationPipeline from '../components/Jobs/ApplicationPipeline';
import TalentPool from '../components/Recruiters/TalentPool';
import HireAnalytics from '../components/Recruiters/HireAnalytics';
import GhostingRiskDetail from '../components/Recruiters/GhostingRiskDetail';
import SkillVerificationStatus from '../components/Recruiters/SkillVerificationStatus';
import TimeToHireDetail from '../components/Recruiters/TimeToHireDetail';
import VideoInterviews from '../components/Recruiters/VideoInterviews';
import CandidateEngagement from '../components/Recruiters/CandidateEngagement';
import ExternalPlatformSync from '../components/Recruiters/ExternalPlatformSync';
import ScreeningBot from '../components/Recruiters/ScreeningBot';
import MarketAlerts from '../components/Recruiters/MarketAlerts';
import ReferralIntelligence from '../components/Recruiters/ReferralIntelligence';
import InterviewQuestionsGenerator from '../components/Recruiters/InterviewQuestionsGenerator';
import BackgroundChecks from '../components/Recruiters/BackgroundChecks';
import BlockchainVerifications from '../components/Recruiters/BlockchainVerifications';
import HireSuccessPredictor from '../components/Recruiters/HireSuccessPredictor';
import OnboardingSuccessPredictor from '../components/Recruiters/OnboardingSuccessPredictor';
import InterviewFatigueReducer from '../components/Recruiters/InterviewFatigueReducer';
import AutoRejectionLog from '../components/Recruiters/AutoRejectionLog';
import API_BASE from '../apiConfig';
import axios from 'axios';"""

new_imports = """import React, { lazy, Suspense } from 'react';
import { Briefcase, Users, PlusCircle, Target, Sparkles, TrendingUp, Clock, AlertCircle, Calendar, CheckCircle2, RefreshCw, BarChart3, Shield, AlertTriangle, CheckCircle, Timer, Video, Link2, Activity, Bot, Bell, Network, MessageSquare, FileCheck, Brain, UserCheck, Lightbulb, ShieldAlert } from 'lucide-react';
import DashboardShell from '../components/DashboardShell';
import JobList from '../components/Jobs/JobList';
import JobModal from '../components/Jobs/JobModal';
import CandidateMatches from '../components/Jobs/CandidateMatches';
import ApplicationPipeline from '../components/Jobs/ApplicationPipeline';
import API_BASE from '../apiConfig';
import axios from 'axios';

// Lazy-load all tab-specific components. Each becomes its own chunk that
// only loads when the recruiter clicks that tab. The default 'Job Roles'
// tab is the only one that loads eagerly (via JobList above).
const TalentPool = lazy(() => import('../components/Recruiters/TalentPool'));
const HireAnalytics = lazy(() => import('../components/Recruiters/HireAnalytics'));
const GhostingRiskDetail = lazy(() => import('../components/Recruiters/GhostingRiskDetail'));
const SkillVerificationStatus = lazy(() => import('../components/Recruiters/SkillVerificationStatus'));
const TimeToHireDetail = lazy(() => import('../components/Recruiters/TimeToHireDetail'));
const VideoInterviews = lazy(() => import('../components/Recruiters/VideoInterviews'));
const CandidateEngagement = lazy(() => import('../components/Recruiters/CandidateEngagement'));
const ExternalPlatformSync = lazy(() => import('../components/Recruiters/ExternalPlatformSync'));
const ScreeningBot = lazy(() => import('../components/Recruiters/ScreeningBot'));
const MarketAlerts = lazy(() => import('../components/Recruiters/MarketAlerts'));
const ReferralIntelligence = lazy(() => import('../components/Recruiters/ReferralIntelligence'));
const InterviewQuestionsGenerator = lazy(() => import('../components/Recruiters/InterviewQuestionsGenerator'));
const BackgroundChecks = lazy(() => import('../components/Recruiters/BackgroundChecks'));
const BlockchainVerifications = lazy(() => import('../components/Recruiters/BlockchainVerifications'));
const HireSuccessPredictor = lazy(() => import('../components/Recruiters/HireSuccessPredictor'));
const OnboardingSuccessPredictor = lazy(() => import('../components/Recruiters/OnboardingSuccessPredictor'));
const InterviewFatigueReducer = lazy(() => import('../components/Recruiters/InterviewFatigueReducer'));
const AutoRejectionLog = lazy(() => import('../components/Recruiters/AutoRejectionLog'));

// Lightweight fallback for lazy-loaded tab content.
const TabLoader = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem', color: '#6b7280' }}>
        <div style={{ textAlign: 'center' }}>
            <div style={{
                width: '24px', height: '24px',
                border: '2px solid #e5e7eb', borderTopColor: '#3b82f6',
                borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                margin: '0 auto 8px',
            }} />
            <div style={{ fontSize: '0.75rem', fontFamily: 'system-ui' }}>Loading\u2026</div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    </div>
);"""

# Try CRLF first, then LF
if old_imports in text:
    text = text.replace(old_imports, new_imports, 1)
    print("OK: replaced imports (CRLF)")
elif old_imports.replace('\n', '\r\n') in text:
    text = text.replace(old_imports.replace('\n', '\r\n'), new_imports.replace('\n', '\r\n'), 1)
    print("OK: replaced imports (LF)")
else:
    print("NOT FOUND: import block")
    raise SystemExit(1)

# Now wrap the case statements in <Suspense fallback={<TabLoader />}>
# Find: case 'Talent Pool':\n                return <TalentPool />;
# Replace with: case 'Talent Pool':\n                return <Suspense fallback={<TabLoader />}><TalentPool /></Suspense>;
patterns = [
    ("return <TalentPool />;", "return <Suspense fallback={<TabLoader />}><TalentPool /></Suspense>;"),
    ("return <HireAnalytics />;", "return <Suspense fallback={<TabLoader />}><HireAnalytics /></Suspense>;"),
    ("return <GhostingRiskDetail />;", "return <Suspense fallback={<TabLoader />}><GhostingRiskDetail /></Suspense>;"),
    ("return <SkillVerificationStatus />;", "return <Suspense fallback={<TabLoader />}><SkillVerificationStatus /></Suspense>;"),
    ("return <BackgroundChecks />;", "return <Suspense fallback={<TabLoader />}><BackgroundChecks /></Suspense>;"),
    ("return <TimeToHireDetail />;", "return <Suspense fallback={<TabLoader />}><TimeToHireDetail /></Suspense>;"),
    ("return <VideoInterviews />;", "return <Suspense fallback={<TabLoader />}><VideoInterviews /></Suspense>;"),
    ("return <CandidateEngagement />;", "return <Suspense fallback={<TabLoader />}><CandidateEngagement /></Suspense>;"),
    ("return <ExternalPlatformSync />;", "return <Suspense fallback={<TabLoader />}><ExternalPlatformSync /></Suspense>;"),
    ("return <ScreeningBot onGoBack={() => setActiveTab('Job Roles')} />;", "return <Suspense fallback={<TabLoader />}><ScreeningBot onGoBack={() => setActiveTab('Job Roles')} /></Suspense>;"),
    ("return <MarketAlerts />;", "return <Suspense fallback={<TabLoader />}><MarketAlerts /></Suspense>;"),
    ("return <ReferralIntelligence />;", "return <Suspense fallback={<TabLoader />}><ReferralIntelligence /></Suspense>;"),
    ("return <InterviewQuestionsGenerator />;", "return <Suspense fallback={<TabLoader />}><InterviewQuestionsGenerator /></Suspense>;"),
    ("return <HireSuccessPredictor />;", "return <Suspense fallback={<TabLoader />}><HireSuccessPredictor /></Suspense>;"),
    ("return <OnboardingSuccessPredictor />;", "return <Suspense fallback={<TabLoader />}><OnboardingSuccessPredictor /></Suspense>;"),
    ("return <BlockchainVerifications />;", "return <Suspense fallback={<TabLoader />}><BlockchainVerifications /></Suspense>;"),
    ("return <InterviewFatigueReducer />;", "return <Suspense fallback={<TabLoader />}><InterviewFatigueReducer /></Suspense>;"),
    ("return <AutoRejectionLog onGoBack={() => setActiveTab('Job Roles')} />;", "return <Suspense fallback={<TabLoader />}><AutoRejectionLog onGoBack={() => setActiveTab('Job Roles')} /></Suspense>;"),
]

count = 0
for old, new in patterns:
    if old in text:
        text = text.replace(old, new, 1)
        count += 1

print(f"OK: wrapped {count} lazy components in Suspense")
file.write_text(text, encoding='utf-8')
print(f"Saved {file.name}")
