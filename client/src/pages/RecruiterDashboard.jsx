import React, { lazy, Suspense } from 'react';
import { Briefcase, Users, PlusCircle, Target, Sparkles, TrendingUp, Clock, AlertCircle, Calendar, CheckCircle2, RefreshCw, BarChart3, Shield, AlertTriangle, CheckCircle, Timer, Video, Link2, Activity, Bot, Bell, Network, MessageSquare, FileCheck, Brain, UserCheck, Lightbulb, ShieldAlert } from 'lucide-react';
import DashboardShell from '../components/DashboardShell';
import JobList from '../components/Jobs/JobList';
import JobModal from '../components/Jobs/JobModal';
import CandidateMatches from '../components/Jobs/CandidateMatches';
// ApplicationPipeline imports CandidateProfileModal which is also imported
// by TalentPool (lazy-loaded below). Loading it eagerly forces Vite to bundle
// CandidateProfileModal into the RecruiterDashboard chunk, creating a
// circular chunk reference. Lazy-loading ApplicationPipeline breaks the cycle.
const ApplicationPipeline = lazy(() => import('../components/Jobs/ApplicationPipeline'));
import API_BASE from '../apiConfig';
import axios from 'axios';
import { useToast } from '../components/ui/Toast';
import { useConfirm } from '../components/ui/ConfirmDialog';

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
 <div style={{ fontSize: '0.75rem', fontFamily: 'system-ui' }}>Loading…</div>
 <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
 </div>
 </div>
);

const RecruiterDashboard = () => {
    const { toast } = useToast();
    const { confirm } = useConfirm();
 const [isJobModalOpen, setIsJobModalOpen] = React.useState(false);
 const [selectedJobForMatches, setSelectedJobForMatches] = React.useState(null);
 const [selectedJobForPipeline, setSelectedJobForPipeline] = React.useState(null);
 const [refreshJobs, setRefreshJobs] = React.useState(0);
 const [stats, setStats] = React.useState({ totalPool: '...', topMatches: '...', openRoles: '...' });
 const [riskAlerts, setRiskAlerts] = React.useState({ silentRejections: [], ghostingRisk: [] });
 const [funnel, setFunnel] = React.useState([]);
 const [activeTab, setActiveTab] = React.useState('Job Roles');
 const [interviews, setInterviews] = React.useState([]);
 const [interviewsLoading, setInterviewsLoading] = React.useState(false);

 React.useEffect(() => {
 const fetchAnalytics = async () => {
 // Fetch each independently so a failure in one doesn't block the others
 try {
 const statsRes = await axios.get(`${API_BASE}/analytics/stats`);
 setStats(statsRes.data);
 } catch (err) {
 console.error("Stats Fetch Error:", err);
 setStats({ totalPool: '-', topMatches: '-', openRoles: '-' });
 }

 try {
 const riskRes = await axios.get(`${API_BASE}/analytics/risk-alerts`);
 setRiskAlerts(riskRes.data);
 } catch (err) {
 console.error("Risk Alerts Fetch Error:", err);
 setRiskAlerts({ silentRejections: [], ghostingRisk: [] });
 }

 try {
 const funnelRes = await axios.get(`${API_BASE}/analytics/funnel`);
 setFunnel(funnelRes.data);
 } catch (err) {
 console.error("Funnel Fetch Error:", err);
 setFunnel([]);
 }
 };
 fetchAnalytics();
 }, [refreshJobs]);

 const fetchInterviews = React.useCallback(async () => {
 setInterviewsLoading(true);
 try {
 const res = await axios.get(`${API_BASE}/interviews`);
 setInterviews(res.data);
 } catch (err) {
 console.error('Interviews fetch error:', err);
 } finally {
 setInterviewsLoading(false);
 }
 }, []);

 React.useEffect(() => {
 if (activeTab === 'Interview Schedule') fetchInterviews();
 }, [activeTab, fetchInterviews]);

 const recruiterNav = [
 // Core Daily Tasks (most frequent)
 { icon: Briefcase, label: 'Job Roles', active: activeTab === 'Job Roles', onClick: () => setActiveTab('Job Roles') },
 { icon: Users, label: 'Talent Pool', active: activeTab === 'Talent Pool', onClick: () => setActiveTab('Talent Pool') },
 { icon: Clock, label: 'Interview Schedule', active: activeTab === 'Interview Schedule', onClick: () => setActiveTab('Interview Schedule') },
 { icon: Video, label: 'Video Interviews', active: activeTab === 'Video Interviews', onClick: () => setActiveTab('Video Interviews') },
 // Candidate Management
 { icon: CheckCircle, label: 'Skill Verify', active: activeTab === 'Skill Verify', onClick: () => setActiveTab('Skill Verify') },
 { icon: FileCheck, label: 'Background Checks', active: activeTab === 'Background Checks', onClick: () => setActiveTab('Background Checks') },
 { icon: Activity, label: 'Engagement', active: activeTab === 'Engagement', onClick: () => setActiveTab('Engagement') },
 { icon: Link2, label: 'Platform Sync', active: activeTab === 'Platform Sync', onClick: () => setActiveTab('Platform Sync') },
 // Analytics & Intelligence
 { icon: TrendingUp, label: 'Hire Analytics', active: activeTab === 'Hire Analytics', onClick: () => setActiveTab('Hire Analytics') },
 { icon: Timer, label: 'Time to Hire', active: activeTab === 'Time to Hire', onClick: () => setActiveTab('Time to Hire') },
 { icon: Network, label: 'Referral Intel', active: activeTab === 'Referral Intel', onClick: () => setActiveTab('Referral Intel') },
 { icon: Bell, label: 'Market Alerts', active: activeTab === 'Market Alerts', onClick: () => setActiveTab('Market Alerts') },
 // Risk & Compliance
 { icon: AlertTriangle, label: 'Ghosting Risk', active: activeTab === 'Ghosting Risk', onClick: () => setActiveTab('Ghosting Risk') },
 // AI & Predictions
 { icon: MessageSquare, label: 'AI Questions', active: activeTab === 'AI Questions', onClick: () => setActiveTab('AI Questions') },
 { icon: Brain, label: 'Hire Predictor', active: activeTab === 'Hire Predictor', onClick: () => setActiveTab('Hire Predictor') },
 { icon: UserCheck, label: 'Onboarding', active: activeTab === 'Onboarding', onClick: () => setActiveTab('Onboarding') },
 { icon: Lightbulb, label: 'Interview Fatigue', active: activeTab === 'Interview Fatigue', onClick: () => setActiveTab('Interview Fatigue') },
 { icon: Shield, label: 'Blockchain Verif', active: activeTab === 'Blockchain Verif', onClick: () => setActiveTab('Blockchain Verif') },
 ];

 const renderMainContent = () => {
 switch (activeTab) {
 case 'Job Roles':
 return (
 <div className="grid grid-cols-1 sm:grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
 <div className="lg:col-span-3 space-y-6">
 <JobList
 refreshTrigger={refreshJobs}
 onFindMatches={(job) => setSelectedJobForMatches(job)}
 onOpenPipeline={(job) => setSelectedJobForPipeline(job)}
 onDeleteJob={async (id) => {
 if (await confirm("Archive this job posting?")) {
 try {
 await axios.put(`${API_BASE}/jobs/${id}`, { isActive: false });
 setRefreshJobs(prev => prev + 1);
 } catch (err) {
 toast("Failed to archive job.");
 }
 }
 }}
 onUpdateJob={() => {
 setRefreshJobs(prev => prev + 1);
 }}
 onOpenJobModal={() => setIsJobModalOpen(true)}
 onOpenScreeningBot={() => setActiveTab('Screening Bot')}
 onOpenAutoRejection={() => setActiveTab('Auto Rejection')}
 />
 </div>

 <div className="space-y-5">
 {/* Hiring Funnel Analytics — calm .card-soft aesthetic */}
 <div
 className="p-6"
 style={{
 backgroundColor: 'var(--bg-elevated)',
 border: '1px solid var(--border-primary)',
 borderRadius: 'var(--radius-xl)',
 boxShadow: 'var(--shadow-sm)',
 }}
 >
 <div className="flex items-center gap-2 mb-5">
 <TrendingUp size={14} strokeWidth={1.75} className="text-[var(--accent)]" />
 <h3 className="eyebrow">Hiring Funnel</h3>
 </div>
 <div className="space-y-4">
 {funnel.length === 0 ? (
 <div
 style={{
 padding: '0.875rem',
 backgroundColor: 'var(--bg-tertiary)',
 borderRadius: 'var(--radius-md)',
 textAlign: 'center',
 }}
 >
 <p className="text-xs text-[var(--text-muted)]">No applications yet</p>
 </div>
 ) : (funnel || []).map((stage, i) => (
 <div key={i} className="space-y-1.5">
 <div className="flex justify-between items-center text-xs">
 <span className="text-[var(--text-secondary)]">{stage.StatusName}</span>
 <span className="font-medium tabular-nums text-[var(--text-primary)]">{stage.ApplicationCount}</span>
 </div>
 <div
 className="w-full h-1 overflow-hidden"
 style={{
 backgroundColor: 'var(--bg-tertiary)',
 borderRadius: '999px',
 }}
 >
 <div
 style={{
 height: '100%',
 width: `${Math.min(100, (stage.ApplicationCount / (stats.totalPool || 1)) * 500)}%`,
 backgroundColor: 'var(--accent)',
 borderRadius: '999px',
 transition: 'width 800ms var(--ease-spring)',
 }}
 />
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Risk Intelligence — neutral border, semantic dots */}
 <div
 className="p-6"
 style={{
 backgroundColor: 'var(--bg-elevated)',
 border: '1px solid var(--border-primary)',
 borderRadius: 'var(--radius-xl)',
 boxShadow: 'var(--shadow-sm)',
 }}
 >
 <div className="flex items-center gap-2 mb-5">
 <span
 aria-hidden="true"
 style={{
 width: 6, height: 6, borderRadius: '999px',
 backgroundColor: (riskAlerts?.ghostingRisk?.length || 0) > 0 ? 'var(--danger)' : 'var(--success)',
 }}
 />
 <h3 className="eyebrow">Risk Intelligence</h3>
 </div>

 <div className="space-y-3">
 {(riskAlerts?.ghostingRisk?.length || 0) > 0 ? (
 (riskAlerts?.ghostingRisk || []).map((risk, i) => (
 <div
 key={i}
 className="flex gap-3 items-start p-3"
 style={{
 backgroundColor: 'color-mix(in srgb, var(--danger) 6%, transparent)',
 border: '1px solid color-mix(in srgb, var(--danger) 18%, transparent)',
 borderRadius: 'var(--radius-md)',
 }}
 >
 <Clock size={13} strokeWidth={1.75} className="text-[var(--danger)] mt-0.5 shrink-0" />
 <div className="min-w-0">
 <p className="text-xs font-medium truncate">{risk.CandidateName || risk.FullName || 'Unknown'}</p>
 <p className="text-[11px] text-[var(--danger)] mt-0.5">High ghosting risk</p>
 </div>
 </div>
 ))
 ) : (
 <div
 style={{
 padding: '0.875rem',
 backgroundColor: 'color-mix(in srgb, var(--success) 6%, transparent)',
 border: '1px solid color-mix(in srgb, var(--success) 18%, transparent)',
 borderRadius: 'var(--radius-md)',
 textAlign: 'center',
 }}
 >
 <p className="text-xs text-[var(--success)] font-medium">No critical risks</p>
 </div>
 )}

 {(riskAlerts?.silentRejections || []).map((rejection, i) => (
 <div
 key={i}
 className="flex gap-3 items-start p-3"
 style={{
 backgroundColor: 'var(--bg-tertiary)',
 border: '1px solid var(--border-primary)',
 borderRadius: 'var(--radius-md)',
 }}
 >
 <AlertCircle size={13} strokeWidth={1.75} className="text-[var(--warning)] mt-0.5 shrink-0" />
 <div className="min-w-0">
 <p className="text-xs font-medium truncate">{rejection.FullName || rejection.CandidateName || 'Unknown'}</p>
 <p className="text-[11px] text-[var(--warning)] mt-0.5">Stale application: {Number(rejection.DaysInactive || 0)}d</p>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 );

 case 'Talent Pool':
 return <Suspense fallback={<TabLoader />}><TalentPool /></Suspense>;
 case 'Hire Analytics':
 return <Suspense fallback={<TabLoader />}><HireAnalytics /></Suspense>;
 case 'Ghosting Risk':
 return <Suspense fallback={<TabLoader />}><GhostingRiskDetail /></Suspense>;
 case 'Skill Verify':
 return <Suspense fallback={<TabLoader />}><SkillVerificationStatus /></Suspense>;
 case 'Background Checks':
 return <Suspense fallback={<TabLoader />}><BackgroundChecks /></Suspense>;
 case 'Time to Hire':
 return <Suspense fallback={<TabLoader />}><TimeToHireDetail /></Suspense>;
 case 'Interview Schedule': {
 const now = new Date();
 const upcoming = interviews.filter(i => new Date(i.InterviewStart) >= now);
 const past = interviews.filter(i => new Date(i.InterviewStart) < now);
 return (
 <div className="space-y-5 sm:space-y-8">
 <div
 className="p-6 flex items-center justify-between"
 style={{
 backgroundColor: 'var(--bg-elevated)',
 border: '1px solid var(--border-primary)',
 borderRadius: 'var(--radius-xl)',
 boxShadow: 'var(--shadow-sm)',
 }}
 >
 <div className="flex items-center gap-3">
 <div
 className="w-10 h-10 flex items-center justify-center"
 style={{
 backgroundColor: 'color-mix(in srgb, var(--warning) 12%, transparent)',
 color: 'var(--warning)',
 borderRadius: 'var(--radius-md)',
 }}
 >
 <Calendar size={18} strokeWidth={1.75} />
 </div>
 <div>
 <h2
 className="text-base font-semibold"
 style={{ fontFamily: 'var(--font-display)' }}
 >
 Interview Schedule
 </h2>
 <p className="text-xs text-[var(--text-muted)] mt-0.5">Manage your interviews</p>
 </div>
 </div>
 <button
 onClick={fetchInterviews}
 className="focus-ring"
 style={{
 padding: '0.5rem',
 backgroundColor: 'var(--bg-tertiary)',
 border: '1px solid var(--border-primary)',
 borderRadius: 'var(--radius-md)',
 transition: 'background-color var(--dur-base) var(--ease-out-soft)',
 }}
 aria-label="Refresh interviews"
 >
 <RefreshCw
 size={14}
 strokeWidth={1.75}
 className={interviewsLoading ? 'animate-spin text-[var(--warning)]' : 'text-[var(--text-muted)]'}
 />
 </button>
 </div>
 <div>
 <div className="flex items-center gap-2 mb-3">
 <span
 aria-hidden="true"
 style={{ width: 6, height: 6, borderRadius: '999px', backgroundColor: 'var(--warning)' }}
 />
 <p className="eyebrow">Upcoming · {upcoming.length}</p>
 </div>
 {upcoming.length === 0 ? (
 <div
 style={{
 padding: '2.5rem 1.5rem',
 backgroundColor: 'var(--bg-elevated)',
 border: '1px dashed var(--border-strong)',
 borderRadius: 'var(--radius-lg)',
 textAlign: 'center',
 }}
 >
 <p className="text-sm text-[var(--text-muted)]">No upcoming interviews scheduled</p>
 <p className="text-xs text-[var(--text-muted)] mt-1 opacity-70">Schedule one from the Job Roles tab.</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {upcoming.map(iv => (
 <div
 key={iv.ScheduleID}
 className="p-5"
 style={{
 backgroundColor: 'var(--bg-elevated)',
 border: '1px solid var(--border-primary)',
 borderRadius: 'var(--radius-lg)',
 boxShadow: 'var(--shadow-sm)',
 transition: 'border-color var(--dur-base) var(--ease-out-soft)',
 }}
 >
 <div className="flex items-start justify-between mb-4">
 <div className="min-w-0">
 <h3 className="text-sm font-medium truncate">{iv.CandidateName}</h3>
 <p className="text-[11px] text-[var(--text-muted)] mt-0.5 italic truncate">{iv.JobTitle}</p>
 </div>
 <span
 style={{
 padding: '2px 8px',
 fontSize: 10,
 fontWeight: 500,
 borderRadius: 'var(--radius-sm)',
 backgroundColor: iv.CandidateConfirmed
 ? 'color-mix(in srgb, var(--success) 12%, transparent)'
 : 'color-mix(in srgb, var(--warning) 12%, transparent)',
 color: iv.CandidateConfirmed ? 'var(--success)' : 'var(--warning)',
 }}
 >
 {iv.CandidateConfirmed ? 'Confirmed' : 'Pending'}
 </span>
 </div>
 <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]" style={{ fontVariantNumeric: 'tabular-nums' }}>
 <Clock size={12} strokeWidth={1.75} className="text-[var(--warning)]" />
 {new Date(iv.InterviewStart).toLocaleString()} → {new Date(iv.InterviewEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 {past.length > 0 && (
 <div>
 <div className="flex items-center gap-2 mb-3">
 <span
 aria-hidden="true"
 style={{ width: 6, height: 6, borderRadius: '999px', backgroundColor: 'var(--text-muted)' }}
 />
 <p className="eyebrow">Past · {past.length}</p>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 {past.map(iv => (
 <div
 key={iv.ScheduleID}
 className="p-4"
 style={{
 backgroundColor: 'var(--bg-elevated)',
 border: '1px solid var(--border-primary)',
 borderRadius: 'var(--radius-md)',
 opacity: 0.6,
 transition: 'opacity var(--dur-base) var(--ease-out-soft)',
 }}
 >
 <div className="flex items-start justify-between mb-2">
 <div>
 <h3 className="text-xs font-semibold">{iv.CandidateName}</h3>
 <p className="text-[11px] font-bold text-[var(--text-muted)] mt-0.5 italic">{iv.JobTitle}</p>
 </div>
 <CheckCircle2 size={16} className="text-[var(--text-muted)]" />
 </div>
 <p className="text-[11px] font-mono text-[var(--text-muted)]">{new Date(iv.InterviewStart).toLocaleString()}</p>
 </div>
 ))}
 </div>
 </div>
 )}
 </div>
 );
 }
 case 'Video Interviews':
 return <Suspense fallback={<TabLoader />}><VideoInterviews /></Suspense>;
 case 'Engagement':
 return <Suspense fallback={<TabLoader />}><CandidateEngagement /></Suspense>;
 case 'Platform Sync':
 return <Suspense fallback={<TabLoader />}><ExternalPlatformSync /></Suspense>;
 case 'Screening Bot':
 return <Suspense fallback={<TabLoader />}><ScreeningBot onGoBack={() => setActiveTab('Job Roles')} /></Suspense>;
 case 'Market Alerts':
 return <Suspense fallback={<TabLoader />}><MarketAlerts /></Suspense>;
 case 'Referral Intel':
 return <Suspense fallback={<TabLoader />}><ReferralIntelligence /></Suspense>;
 case 'AI Questions':
 return <Suspense fallback={<TabLoader />}><InterviewQuestionsGenerator /></Suspense>;
 case 'Hire Predictor':
 return <Suspense fallback={<TabLoader />}><HireSuccessPredictor /></Suspense>;
 case 'Onboarding':
 return <Suspense fallback={<TabLoader />}><OnboardingSuccessPredictor /></Suspense>;
 case 'Blockchain Verif':
 return <Suspense fallback={<TabLoader />}><BlockchainVerifications /></Suspense>;
 case 'Interview Fatigue':
 return <Suspense fallback={<TabLoader />}><InterviewFatigueReducer /></Suspense>;
 case 'Auto Rejection':
 return <Suspense fallback={<TabLoader />}><AutoRejectionLog onGoBack={() => setActiveTab('Job Roles')} /></Suspense>;
 default:
 return null;
 }
 };

 // Show header (action buttons) only for tabs that need it - removed as buttons are now inline in each component

 return (
 <DashboardShell
 title="Recruitment Pipeline"
 subtitle="Recruitment operations"
 navigation={recruiterNav}
 onProfileClick={() => { }}
 >
 <div key={activeTab} className="reveal-up">
 {renderMainContent()}
 </div>

 <JobModal
 isOpen={isJobModalOpen}
 onClose={() => setIsJobModalOpen(false)}
 onJobCreated={() => setRefreshJobs(prev => prev + 1)}
 />

 <CandidateMatches
 job={selectedJobForMatches}
 isOpen={!!selectedJobForMatches}
 onClose={() => setSelectedJobForMatches(null)}
 />

 <Suspense fallback={<TabLoader />}>
 <ApplicationPipeline
 job={selectedJobForPipeline}
 isOpen={!!selectedJobForPipeline}
 onClose={() => setSelectedJobForPipeline(null)}
 />
 </Suspense>
 </DashboardShell>
 );
};

export default RecruiterDashboard;
