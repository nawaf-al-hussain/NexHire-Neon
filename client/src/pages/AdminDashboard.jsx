import React, { lazy, Suspense } from 'react';
import axios from 'axios';
import API_BASE from '../apiConfig';
import { formatScore, formatNumber, formatPercent } from '../utils/format';
import {
 LayoutDashboard, BarChart3, ShieldAlert, FileText, Database, Activity,
 RefreshCw, Layers, HardDrive, Trash2, UserX, Users, CheckCircle, XCircle,
 Briefcase, Shield, Award, ChevronRight, AlertCircle, AlertTriangle, Check, Target, Zap, TrendingUp,
 Globe, PieChart, DollarSign, MapPin, GitBranch, UsersRound, Mail, UserPlus, X
} from 'lucide-react';
import DashboardShell from '../components/DashboardShell';
import { useToast } from '../components/ui/Toast';
import { useConfirm } from '../components/ui/ConfirmDialog';
const RecruiterPerformanceAdmin = lazy(() => import('../components/Admin/RecruiterPerformanceAdmin'));
const ConsentManagement = lazy(() => import('../components/Admin/ConsentManagement'));
const VacancyUtilizationAdmin = lazy(() => import('../components/Admin/VacancyUtilizationAdmin'));
const SalaryTransparencyAnalytics = lazy(() => import('../components/Admin/SalaryTransparencyAnalytics'));
const InterviewerPerformanceChart = lazy(() => import('../components/Charts/InterviewerPerformanceChart'));
const HiringFunnelChart = lazy(() => import('../components/Charts/HiringFunnelChart'));
const RejectionAnalysisChart = lazy(() => import('../components/Charts/RejectionAnalysisChart'));
const EngagementTrendChart = lazy(() => import('../components/Charts/EngagementTrendChart'));
const BiasAnalysisChart = lazy(() => import('../components/Charts/BiasAnalysisChart'));
const SkillGapChart = lazy(() => import('../components/Charts/SkillGapChart'));
const RecruiterLeaderboardChart = lazy(() => import('../components/Charts/RecruiterLeaderboardChart'));
const VacancyUtilizationChart = lazy(() => import('../components/Charts/VacancyUtilizationChart'));
const HireRatePerJobChart = lazy(() => import('../components/Charts/HireRatePerJobChart'));
const DiversityChart = lazy(() => import('../components/Charts/DiversityChart'));
const SalaryRangeChart = lazy(() => import('../components/Charts/SalaryRangeChart'));
const RemoteWorkChart = lazy(() => import('../components/Charts/RemoteWorkChart'));
const MarketIntelligenceChart = lazy(() => import('../components/Charts/MarketIntelligenceChart'));
const RemoteWorkAnalytics = lazy(() => import('../components/Admin/RemoteWorkAnalytics'));
const ReferralIntelligence = lazy(() => import('../components/Recruiters/ReferralIntelligence'));
const DiversityGoals = lazy(() => import('../components/Admin/DiversityGoals'));
const BiasLogs = lazy(() => import('../components/Admin/BiasLogs'));
const EmailQueueManager = lazy(() => import('../components/Admin/EmailQueueManager'));
const SQLViews = lazy(() => import('../components/Admin/SQLViews'));

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

const AdminDashboard = () => {
    const { toast } = useToast();
    const { confirm } = useConfirm();
 const [activeView, setActiveView] = React.useState('Core Analytics');
 const [marketIntelKey, setMarketIntelKey] = React.useState(0);

 // Reset animation key when switching to Market Intel tab
 React.useEffect(() => {
 if (activeView === 'Market Intel') {
 setMarketIntelKey(prev => prev + 1);
 }
 }, [activeView]);
 const [archiveStats, setArchiveStats] = React.useState({ archivedJobs: 0, archivedApplications: 0, lastUpdated: null });
 const [archivedJobsData, setArchivedJobsData] = React.useState([]);
 const [archivedAppsData, setArchivedAppsData] = React.useState([]);
 const [isProcessing, setIsProcessing] = React.useState(null);
 const [users, setUsers] = React.useState([]);
 const [usersLoading, setUsersLoading] = React.useState(false);
 const [auditLogs, setAuditLogs] = React.useState([]);
 const [auditLogsLoading, setAuditLogsLoading] = React.useState(false);
 const [systemStats, setSystemStats] = React.useState(null);
 const [systemStatsLoading, setSystemStatsLoading] = React.useState(false);

 // Create Candidate Modal state
 const [showCreateCandidateModal, setShowCreateCandidateModal] = React.useState(false);
 const [isCreatingCandidate, setIsCreatingCandidate] = React.useState(false);
 const [newCandidate, setNewCandidate] = React.useState({
 username: '',
 email: '',
 password: '',
 fullName: '',
 location: '',
 yearsOfExperience: ''
 });

 // Analytics state variables
 const [analyticsLoading, setAnalyticsLoading] = React.useState(false);
 const [biasData, setBiasData] = React.useState({ location: [], experience: [] });
 const [skillGapData, setSkillGapData] = React.useState([]);
 const [recruiterPerf, setRecruiterPerf] = React.useState([]);
 const [vacancyData, setVacancyData] = React.useState([]);
 const [bottlenecks, setBottlenecks] = React.useState([]);
 const [riskAlerts, setRiskAlerts] = React.useState({ silentRejections: [], ghostingRisk: [] });
 const [funnelData, setFunnelData] = React.useState([]);

 // Advanced Analytics state variables
 const [marketData, setMarketData] = React.useState([]);
 const [diversityData, setDiversityData] = React.useState([]);
 const [salaryData, setSalaryData] = React.useState([]);
 const [remoteData, setRemoteData] = React.useState([]);
 const [careerPathData, setCareerPathData] = React.useState([]);
 const [referralData, setReferralData] = React.useState([]);

 // Phase 1 Analytics state variables
 const [interviewerConsistency, setInterviewerConsistency] = React.useState([]);
 const [interviewScoreDecision, setInterviewScoreDecision] = React.useState([]);
 const [rejectionAnalysis, setRejectionAnalysis] = React.useState([]);
 const [candidateEngagement, setCandidateEngagement] = React.useState([]);
 const [hireRatePerJob, setHireRatePerJob] = React.useState([]);
 const [timeToHireIndividual, setTimeToHireIndividual] = React.useState([]);

 // Demo data for when API is not available
 // Fetch analytics data
 const fetchAnalytics = async () => {
 setAnalyticsLoading(true);
 try {
 const responses = await Promise.allSettled([
 axios.get(`${API_BASE}/analytics/bias-detection`),
 axios.get(`${API_BASE}/analytics/skill-gap`),
 axios.get(`${API_BASE}/analytics/recruiter-performance`),
 axios.get(`${API_BASE}/analytics/utilization`),
 axios.get(`${API_BASE}/analytics/bottlenecks`),
 axios.get(`${API_BASE}/analytics/risk-alerts`),
 axios.get(`${API_BASE}/analytics/funnel`)
 ]);

 // Use real data if API succeeded, otherwise use demo data
 if (responses[0].status === 'fulfilled') {
 setBiasData(responses[0].value.data);
 } else {
 setBiasData({ location: [], experience: [] });
 }

 if (responses[1].status === 'fulfilled') {
 setSkillGapData(responses[1].value.data);
 } else {
 setSkillGapData([]);
 }

 if (responses[2].status === 'fulfilled') {
 setRecruiterPerf(responses[2].value.data);
 } else {
 setRecruiterPerf([]);
 }

 if (responses[3].status === 'fulfilled') {
 setVacancyData(responses[3].value.data);
 } else {
 setVacancyData([]);
 }

 if (responses[4].status === 'fulfilled') {
 setBottlenecks(responses[4].value.data);
 } else {
 setBottlenecks([]);
 }

 if (responses[5].status === 'fulfilled') {
 setRiskAlerts(responses[5].value.data);
 } else {
 setRiskAlerts({ silentRejections: [], ghostingRisk: [] });
 }

 if (responses[6].status === 'fulfilled') {
 setFunnelData(responses[6].value.data);
 } else {
 setFunnelData([]);
 }

 // Log which APIs failed for debugging
 const failedAPIs = responses
 .map((r, i) => r.status !== 'fulfilled' ? ['bias-detection', 'skill-gap', 'recruiter-performance', 'utilization', 'bottlenecks', 'risk-alerts', 'funnel'][i] : null)
 .filter(Boolean);
 if (failedAPIs.length > 0) {
 }
 } catch (err) {
 console.error("Failed to fetch analytics:", err);
 // Fall back to demo data
 setBiasData({ location: [], experience: [] });
 setSkillGapData([]);
 setRecruiterPerf([]);
 setVacancyData([]);
 setBottlenecks([]);
 setRiskAlerts({ silentRejections: [], ghostingRisk: [] });
 setFunnelData([]);
 } finally {
 setAnalyticsLoading(false);
 }
 };

 // Fetch advanced analytics data
 const fetchAdvancedAnalytics = async () => {
 setAnalyticsLoading(true);
 try {
 const responses = await Promise.allSettled([
 axios.get(`${API_BASE}/analytics/market`),
 axios.get(`${API_BASE}/analytics/diversity`),
 axios.get(`${API_BASE}/analytics/salary-transparency`),
 axios.get(`${API_BASE}/analytics/remote-compatibility`),
 axios.get(`${API_BASE}/analytics/organizational-career`),
 axios.get(`${API_BASE}/analytics/referral-intelligence`)
 ]);

 if (responses[0].status === 'fulfilled') setMarketData(responses[0].value.data);
 if (responses[1].status === 'fulfilled') setDiversityData(responses[1].value.data);
 if (responses[2].status === 'fulfilled') setSalaryData(responses[2].value.data);
 if (responses[3].status === 'fulfilled') setRemoteData(responses[3].value.data);
 if (responses[4].status === 'fulfilled') setCareerPathData(responses[4].value.data);
 if (responses[5].status === 'fulfilled') {
 setReferralData(responses[5].value.data);
 } else {
 setReferralData([]);
 }
 } catch (err) {
 console.error("Failed to fetch advanced analytics:", err);
 setReferralData([]);
 } finally {
 setAnalyticsLoading(false);
 }
 };

 // Fetch Phase 1 analytics data
 const fetchPhase1Analytics = async () => {
 try {
 const responses = await Promise.allSettled([
 axios.get(`${API_BASE}/analytics/interviewer-consistency`),
 axios.get(`${API_BASE}/analytics/interview-score-decision`),
 axios.get(`${API_BASE}/analytics/rejection-analysis`),
 axios.get(`${API_BASE}/analytics/candidate-engagement`),
 axios.get(`${API_BASE}/analytics/hire-rate-per-job`),
 axios.get(`${API_BASE}/analytics/time-to-hire-individual`)
 ]);

 if (responses[0].status === 'fulfilled') setInterviewerConsistency(responses[0].value.data);
 if (responses[1].status === 'fulfilled') setInterviewScoreDecision(responses[1].value.data);
 if (responses[2].status === 'fulfilled') setRejectionAnalysis(responses[2].value.data);
 if (responses[3].status === 'fulfilled') setCandidateEngagement(responses[3].value.data);
 if (responses[4].status === 'fulfilled') setHireRatePerJob(responses[4].value.data);
 if (responses[5].status === 'fulfilled') setTimeToHireIndividual(responses[5].value.data);
 } catch (err) {
 console.error("Failed to fetch Phase 1 analytics:", err);
 }
 };

 const fetchArchiveStats = async () => {
 try {
 const res = await axios.get(`${API_BASE}/maintenance/archive-stats`);
 setArchiveStats(res.data);
 } catch (err) {
 console.error("Failed to fetch archive stats:", err);
 }
 };

 const fetchArchiveTables = async () => {
 try {
 const [jobsRes, appsRes] = await Promise.all([
 axios.get(`${API_BASE}/maintenance/archive-jobs`),
 axios.get(`${API_BASE}/maintenance/archive-applications`)
 ]);
 setArchivedJobsData(jobsRes.data);
 setArchivedAppsData(appsRes.data);
 } catch (err) {
 console.error("Failed to fetch archive tables:", err);
 }
 };

 const fetchUsers = async () => {
 setUsersLoading(true);
 try {
 const res = await axios.get(`${API_BASE}/users`);
 setUsers(res.data);
 } catch (err) {
 console.error("Failed to fetch users:", err);
 } finally {
 setUsersLoading(false);
 }
 };

 const fetchAuditLogs = async () => {
 setAuditLogsLoading(true);
 try {
 const res = await axios.get(`${API_BASE}/analytics/audit-logs`);
 setAuditLogs(res.data);
 } catch (err) {
 console.error("Failed to fetch audit logs:", err);
 } finally {
 setAuditLogsLoading(false);
 }
 };

 const fetchSystemStats = async () => {
 setSystemStatsLoading(true);
 try {
 const res = await axios.get(`${API_BASE}/analytics/system-stats`);
 setSystemStats(res.data);
 } catch (err) {
 console.error("Failed to fetch system stats:", err);
 } finally {
 setSystemStatsLoading(false);
 }
 };

 React.useEffect(() => {
 if (activeView === 'Maintenance') {
 fetchArchiveStats();
 fetchArchiveTables();
 } else if (activeView === 'User Management') {
 fetchUsers();
 } else if (activeView === 'System Reports') {
 fetchSystemStats();
 fetchUsers();
 fetchAuditLogs();
 } else if (activeView === 'Security Logs') {
 fetchAuditLogs();
 } else if (activeView === 'Core Analytics') {
 fetchAnalytics();
 fetchPhase1Analytics();
 } else if (['Market Intel', 'Salary Transp', 'Remote Work', 'Career Path', 'Referral Intelligence'].includes(activeView)) {
 fetchAdvancedAnalytics();
 }
 }, [activeView]);

 const runMaintenance = async (type, endpoint) => {
 if (!await confirm(`Initiate ${type} procedure? This action is irreversible.`)) return;

 setIsProcessing(type);
 try {
 await axios.post(`${API_BASE}/maintenance/${endpoint}`);
 await Promise.all([fetchArchiveStats(), fetchArchiveTables()]);
 toast(`${type} completed successfully.`);
 } catch (err) {
 toast(`Failed to execute ${type}: ` + (err.response?.data?.error || err.message));
 } finally {
 setIsProcessing(null);
 }
 };

 const updateUserRole = async (userId, newRoleId) => {
 try {
 await axios.put(`${API_BASE}/users/${userId}/role`, { roleID: newRoleId });
 fetchUsers();
 } catch (err) {
 toast("Failed to update user role.");
 }
 };

 const toggleUserStatus = async (userId, newStatus) => {
 try {
 await axios.put(`${API_BASE}/users/${userId}/status`, { isActive: newStatus });
 fetchUsers();
 } catch (err) {
 toast("Failed to toggle user status.");
 }
 };

 // Create candidate handler
 const handleCreateCandidate = async (e) => {
 e.preventDefault();
 if (!newCandidate.username || !newCandidate.email || !newCandidate.password || !newCandidate.fullName) {
 toast("Please fill in all required fields (username, email, password, full name).");
 return;
 }

 setIsCreatingCandidate(true);
 try {
 const response = await axios.post(`${API_BASE}/users/candidate`, {
 username: newCandidate.username,
 email: newCandidate.email,
 password: newCandidate.password,
 fullName: newCandidate.fullName,
 location: newCandidate.location || null,
 yearsOfExperience: newCandidate.yearsOfExperience ? parseInt(newCandidate.yearsOfExperience) : null
 });

 toast("Candidate created successfully!");
 setShowCreateCandidateModal(false);
 setNewCandidate({
 username: '',
 email: '',
 password: '',
 fullName: '',
 location: '',
 yearsOfExperience: ''
 });
 fetchUsers();
 fetchSystemStats();
 } catch (err) {
 console.error("Create candidate error:", err.response?.data || err.message);
 toast("Failed to create candidate: " + (err.response?.data?.error || err.message));
 } finally {
 setIsCreatingCandidate(false);
 }
 };

 const adminNav = [
 // Tier 1 - Analytics & Insights
 { icon: LayoutDashboard, label: 'Core Analytics', active: activeView === 'Core Analytics', onClick: () => setActiveView('Core Analytics') },
 { icon: Globe, label: 'Market Intel', active: activeView === 'Market Intel', onClick: () => setActiveView('Market Intel') },
 { icon: DollarSign, label: 'Salary Transp', active: activeView === 'Salary Transp', onClick: () => setActiveView('Salary Transp') },
 { icon: MapPin, label: 'Remote Work', active: activeView === 'Remote Work', onClick: () => setActiveView('Remote Work') },
 { icon: GitBranch, label: 'Career Path', active: activeView === 'Career Path', onClick: () => setActiveView('Career Path') },

 // Tier 2 - People & Performance
 { icon: Award, label: 'Recruiter Perf', active: activeView === 'Recruiter Perf', onClick: () => setActiveView('Recruiter Perf') },
 { icon: Users, label: 'Referral Intelligence', active: activeView === 'Referral Intelligence', onClick: () => setActiveView('Referral Intelligence') },
 { icon: Target, label: 'Diversity Goals', active: activeView === 'Diversity Goals', onClick: () => setActiveView('Diversity Goals') },
 { icon: AlertTriangle, label: 'Bias Logs', active: activeView === 'Bias Logs', onClick: () => setActiveView('Bias Logs') },

 // Tier 3 - System & Compliance
 { icon: BarChart3, label: 'System Reports', active: activeView === 'System Reports', onClick: () => setActiveView('System Reports') },
 { icon: ShieldAlert, label: 'Security Logs', active: activeView === 'Security Logs', onClick: () => setActiveView('Security Logs') },
 { icon: Shield, label: 'Consent Mgmt', active: activeView === 'Consent Mgmt', onClick: () => setActiveView('Consent Mgmt') },

 // Tier 4 - Operations & Maintenance
 { icon: Briefcase, label: 'Vacancy Util', active: activeView === 'Vacancy Util', onClick: () => setActiveView('Vacancy Util') },
 { icon: Mail, label: 'Email Queue', active: activeView === 'Email Queue', onClick: () => setActiveView('Email Queue') },
 { icon: Database, label: 'Maintenance', active: activeView === 'Maintenance', onClick: () => setActiveView('Maintenance') },
 { icon: Layers, label: 'SQL Views', active: activeView === 'SQL Views', onClick: () => setActiveView('SQL Views') },
 ];

 const renderAdminContent = () => {
 switch (activeView) {
 case 'Core Analytics':
 return (
 <div className="space-y-5 sm:space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
 {/* Gradient Header */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8 border border-[var(--accent)]/20">
 <div className="flex items-center gap-4">
 <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
 <BarChart3 size={28} />
 </div>
 <div>
 <h2 className="text-lg sm:text-xl font-medium">Core Analytics</h2>
 <p className="text-[11px] font-medium text-[var(--text-muted)]">Recruitment performance insights</p>
 </div>
 </div>
 </div>

 {analyticsLoading && (
 <div className="flex items-center justify-center py-20">
 <RefreshCw className="w-8 h-8 text-[var(--accent)] animate-spin" />
 <span className="ml-3 text-sm font-medium text-[var(--text-muted)]">Loading Analytics...</span>
 </div>
 )}

 {/* === BIAS ANALYTICS SECTION === */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
 {/* Geographic Bias */}
 <div className="glass-card p-8 rounded-[var(--radius-xl)]">
 <div className="flex items-center gap-3 mb-6">
 <Target className="w-5 h-5 text-[var(--accent)]" />
 <h3 className="text-sm font-medium">Geographic Bias Analysis</h3>
 </div>
 <div className="space-y-4">
 {biasData.location?.length > 0 ? (
 <BiasAnalysisChart
 data={biasData.location}
 dataKey="HireRatePercent"
 categoryKey="Location"
 />
 ) : (
 <div className="text-center py-8 text-xs font-semibold text-[var(--text-muted)] opacity-50">No location data</div>
 )}
 </div>
 </div>

 {/* Experience Bias */}
 <div className="glass-card p-8 rounded-[var(--radius-xl)]">
 <div className="flex items-center gap-3 mb-6">
 <Zap className="w-5 h-5 text-[var(--warning)]" />
 <h3 className="text-sm font-medium">Experience Bias Analysis</h3>
 </div>
 <div className="space-y-4">
 {biasData.experience?.length > 0 ? (
 <BiasAnalysisChart
 data={biasData.experience}
 dataKey="HireRatePercent"
 categoryKey="ExperienceGroup"
 />
 ) : (
 <div className="text-center py-8 text-xs font-semibold text-[var(--text-muted)] opacity-50">No experience data</div>
 )}
 </div>
 </div>
 </div>

 {/* === SKILL GAP RADAR & RECRUITER LEADERBOARD === */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
 {/* Skill Gap Analysis */}
 <div className="glass-card p-8 rounded-[var(--radius-xl)]">
 <div className="flex items-center gap-3 mb-6">
 <Award className="w-5 h-5 text-[var(--accent)]" />
 <h3 className="text-sm font-medium">Skill Gap Analysis</h3>
 </div>
 <div className="mt-4" style={{ height: '350px' }}>
 <SkillGapChart data={skillGapData} />
 </div>
 </div>

 {/* Recruiter Leaderboard */}
 <div className="glass-card p-8 rounded-[var(--radius-xl)]">
 <div className="flex items-center gap-3 mb-6">
 <TrendingUp className="w-5 h-5 text-[var(--success)]" />
 <h3 className="text-sm font-medium">Top Recruiters</h3>
 </div>
 <div className="mt-4">
 {recruiterPerf.length > 0 ? (
 <RecruiterLeaderboardChart data={recruiterPerf} />
 ) : (
 <div className="text-center py-8 text-xs font-semibold text-[var(--text-muted)] opacity-50">No recruiter data</div>
 )}
 </div>
 </div>
 </div>

 {/* === BOTTLENECK ALERTS & GHOSTING === */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
 {/* Bottleneck Alerts */}
 <div className="glass-card p-8 rounded-[var(--radius-xl)]">
 <div className="flex items-center justify-between mb-6">
 <div className="flex items-center gap-3">
 <AlertCircle className="w-5 h-5 text-[var(--danger)]" />
 <h3 className="text-sm font-medium">Pipeline Bottlenecks</h3>
 </div>
 <span className="text-[11px] font-semibold text-[var(--danger)] bg-[var(--danger)]/10 px-2 py-1 rounded">Exceeding 7 days</span>
 </div>
 <div className="space-y-3">
 {bottlenecks.filter(b => b.AvgDaysInStage > 7).length > 0 ? bottlenecks.filter(b => b.AvgDaysInStage > 7).map((item, idx) => (
 <div key={idx} className="flex items-center justify-between p-4 bg-[var(--danger)]/5 border border-[var(--danger)]/20 rounded-2xl">
 <div className="flex items-center gap-4">
 <div className="w-10 h-10 bg-[var(--danger)]/10 rounded-xl flex items-center justify-center text-[var(--danger)] font-semibold text-xs">
 {item.AvgDaysInStage}d
 </div>
 <div>
 <p className="text-xs font-semibold uppercase">{item.StatusName}</p>
 <p className="text-[11px] text-[var(--text-muted)]">{item.ApplicationsInStage} Candidates Stuck</p>
 </div>
 </div>
 <ChevronRight className="w-4 h-4 text-[var(--danger)]" />
 </div>
 )) : bottlenecks.length > 0 ? (
 <div className="flex items-center justify-center gap-3 p-8 bg-[var(--success)]/5 border border-emerald-500/20 rounded-2xl">
 <Check className="w-5 h-5 text-[var(--success)]" />
 <span className="text-xs font-semibold text-[var(--success)]">No bottlenecks</span>
 </div>
 ) : (
 <div className="text-center py-8 text-xs font-semibold text-[var(--text-muted)] opacity-50">No bottleneck data</div>
 )}
 </div>
 </div>

 {/* Ghosting Alerts */}
 <div className="glass-card p-8 rounded-[var(--radius-xl)]">
 <div className="flex items-center justify-between mb-6">
 <div className="flex items-center gap-3">
 <ShieldAlert className="w-5 h-5 text-[var(--warning)]" />
 <h3 className="text-sm font-medium">Ghosting Alerts</h3>
 </div>
 <span className="text-[11px] font-semibold text-[var(--warning)] bg-orange-500/10 px-2 py-1 rounded">No contact {'>'} 14 days</span>
 </div>
 <div className="space-y-3">
 {riskAlerts.ghostingRisk?.length > 0 ? riskAlerts.ghostingRisk.slice(0, 5).map((candidate, idx) => (
 <div key={idx} className="flex items-center justify-between p-4 bg-orange-500/5 border border-orange-500/20 rounded-2xl">
 <div>
 <p className="text-xs font-semibold uppercase">{candidate.CandidateName || candidate.FullName || 'Unknown'}</p>
 <p className="text-[11px] text-[var(--text-muted)]">{candidate.JobTitle}</p>
 </div>
 <div className="text-right">
 <p className="text-xs font-semibold text-[var(--warning)]">{Number(candidate.DaysSinceLastContact || candidate.DaysSinceApplication || 0)}d</p>
 <p className="text-[11px] text-[var(--warning)] uppercase">No Response</p>
 </div>
 </div>
 )) : riskAlerts.silentRejections?.length > 0 ? riskAlerts.silentRejections.slice(0, 5).map((candidate, idx) => (
 <div key={idx} className="flex items-center justify-between p-4 bg-orange-500/5 border border-orange-500/20 rounded-2xl">
 <div>
 <p className="text-xs font-semibold uppercase">{candidate.CandidateName || candidate.FullName || 'Unknown'}</p>
 <p className="text-[11px] text-[var(--text-muted)]">{candidate.JobTitle}</p>
 </div>
 <div className="text-right">
 <p className="text-xs font-semibold text-[var(--warning)]">{Number(candidate.DaysInactive || 0)}d</p>
 <p className="text-[11px] text-[var(--warning)] uppercase">Inactive</p>
 </div>
 </div>
 )) : (
 <div className="flex items-center justify-center gap-3 p-8 bg-[var(--success)]/5 border border-emerald-500/20 rounded-2xl">
 <Check className="w-5 h-5 text-[var(--success)]" />
 <span className="text-xs font-semibold text-[var(--success)]">No ghosting alerts</span>
 </div>
 )}
 </div>
 </div>
 </div>

 {/* === APPLICATION FUNNEL === */}
 <div className="glass-card p-8 rounded-[var(--radius-xl)]">
 <div className="flex items-center gap-3 mb-6">
 <Activity className="w-5 h-5 text-[var(--accent)]" />
 <h3 className="text-sm font-medium">Application Funnel</h3>
 </div>
 <div className="mt-8">
 <HiringFunnelChart data={funnelData} />
 </div>
 </div>

 {/* === PHASE 1 ANALYTICS SECTIONS === */}

 {/* Interviewer Consistency */}
 <div className="glass-card p-8 rounded-[var(--radius-xl)]">
 <div className="flex items-center gap-3 mb-6">
 <Users className="w-5 h-5 text-[var(--accent)]" />
 <h3 className="text-sm font-medium">Interviewer Consistency</h3>
 </div>
 <p className="text-[11px] font-medium text-[var(--text-muted)] mb-4">
 High variance indicates inconsistent scoring patterns
 </p>
 <div className="mt-4">
 <InterviewerPerformanceChart data={interviewerConsistency} />
 </div>
 </div>

 {/* Interview Score vs Decision */}
 <div className="glass-card p-8 rounded-[var(--radius-xl)]">
 <div className="flex items-center gap-3 mb-6">
 <Target className="w-5 h-5 text-[var(--accent)]" />
 <h3 className="text-sm font-medium">Interview Score vs Decision</h3>
 </div>
 <p className="text-[11px] font-medium text-[var(--text-muted)] mb-4">
 Correlation between interview scores and hiring outcomes
 </p>
 <div className="overflow-x-auto max-h-80">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="border-b border-[var(--border-primary)]">
 <th scope="col" className="py-3 text-[11px] font-medium text-[var(--text-muted)]">Candidate</th>
 <th scope="col" className="py-3 text-[11px] font-medium text-[var(--text-muted)]">Avg Score</th>
 <th scope="col" className="py-3 text-[11px] font-medium text-[var(--text-muted)]">Status</th>
 </tr>
 </thead>
 <tbody>
 {interviewScoreDecision.length > 0 ? (interviewScoreDecision || []).map((item, idx) => (
 <tr key={idx} className="border-b border-[var(--border-primary)]/30 hover:bg-[var(--surface-hover)] transition-colors">
 <td className="py-3 font-bold text-sm">{item.FullName}</td>
 <td className="py-3 text-xs font-bold text-[var(--accent)]">{Number(item.AvgInterviewScore || 0).toFixed(1) || '-'}</td>
 <td className="py-3">
 <span className={`text-[11px] font-semibold px-2 py-1 rounded ${item.FinalStatus === 'Hired' ? 'bg-[var(--success)]/10 text-[var(--success)]' : 'bg-[var(--danger)]/10 text-[var(--danger)]'}`}>
 {item.FinalStatus || 'Pending'}
 </span>
 </td>
 </tr>
 )) : (
 <tr>
 <td colSpan="3" className="py-8 text-center text-xs font-semibold text-[var(--text-muted)] opacity-50">No score decision data</td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>

 {/* Rejection Analysis */}
 <div className="glass-card p-8 rounded-[var(--radius-xl)]">
 <div className="flex items-center gap-3 mb-6">
 <XCircle className="w-5 h-5 text-[var(--danger)]" />
 <h3 className="text-sm font-medium">Rejection Analysis</h3>
 </div>
 <div className="mt-4">
 <RejectionAnalysisChart data={rejectionAnalysis} />
 </div>
 </div>

 {/* Candidate Engagement */}
 <div className="glass-card p-8 rounded-[var(--radius-xl)]">
 <div className="flex items-center gap-3 mb-6">
 <Activity className="w-5 h-5 text-[var(--success)]" />
 <h3 className="text-sm font-medium">Candidate Engagement</h3>
 </div>
 <p className="text-[11px] font-medium text-[var(--text-muted)] mb-4">
 Candidate responsiveness to interview scheduling
 </p>
 <div className="mt-4">
 <EngagementTrendChart data={candidateEngagement} />
 </div>
 </div>

 {/* Hire Rate Per Job */}
 <div className="glass-card p-8 rounded-[var(--radius-xl)]">
 <div className="flex items-center gap-3 mb-6">
 <Briefcase className="w-5 h-5 text-[var(--accent)]" />
 <h3 className="text-sm font-medium">Hire Rate Per Job</h3>
 </div>
 <div className="mt-4">
 {hireRatePerJob.length > 0 ? (
 <HireRatePerJobChart data={hireRatePerJob} />
 ) : (
 <div className="col-span-3 text-center py-8 text-xs font-semibold text-[var(--text-muted)] opacity-50">No hire rate data</div>
 )}
 </div>
 </div>

 {/* Time-to-Hire Individual */}
 <div className="glass-card p-8 rounded-[var(--radius-xl)]">
 <div className="flex items-center gap-3 mb-6">
 <Zap className="w-5 h-5 text-[var(--warning)]" />
 <h3 className="text-sm font-medium">Time-to-Hire Individual</h3>
 </div>
 <p className="text-[11px] font-medium text-[var(--text-muted)] mb-4">
 Days from application to hire per candidate
 </p>
 <div className="overflow-x-auto max-h-80">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="border-b border-[var(--border-primary)]">
 <th scope="col" className="py-3 text-[11px] font-medium text-[var(--text-muted)]">Candidate</th>
 <th scope="col" className="py-3 text-[11px] font-medium text-[var(--text-muted)]">Days to Hire</th>
 <th scope="col" className="py-3 text-[11px] font-medium text-[var(--text-muted)]">Status</th>
 </tr>
 </thead>
 <tbody>
 {timeToHireIndividual.length > 0 ? (timeToHireIndividual || []).map((item, idx) => (
 <tr key={idx} className="border-b border-[var(--border-primary)]/30 hover:bg-[var(--surface-hover)] transition-colors">
 <td className="py-3 font-bold text-sm">{item.FullName}</td>
 <td className="py-3">
 <span className={`text-xs font-semibold ${item.DaysToHire <= 14 ? 'text-[var(--success)]' : item.DaysToHire <= 30 ? 'text-[var(--warning)]' : 'text-[var(--danger)]'}`}>
 {item.DaysToHire} days
 </span>
 </td>
 <td className="py-3">
 <div className="w-20 h-2 bg-[var(--bg-accent)] rounded-full overflow-hidden">
 <div
 className={`h-full rounded-full ${item.DaysToHire <= 14 ? 'bg-[var(--success)]' : item.DaysToHire <= 30 ? 'bg-[var(--warning)]' : 'bg-[var(--danger)]'}`}
 style={{ width: `${Math.min((item.DaysToHire / 60) * 100, 100)}%` }}
 />
 </div>
 </td>
 </tr>
 )) : (
 <tr>
 <td colSpan="3" className="py-8 text-center text-xs font-semibold text-[var(--text-muted)] opacity-50">No time-to-hire data</td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 );
 case 'Maintenance':
 return (
 <div className="space-y-5 sm:space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
 {/* Gradient Header */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8 border border-amber-500/20">
 <div className="flex items-center gap-4">
 <div className="w-14 h-14 rounded-2xl bg-[var(--warning)]/10 flex items-center justify-center text-[var(--warning)]">
 <HardDrive size={28} />
 </div>
 <div>
 <h2 className="text-lg sm:text-xl font-medium">Maintenance</h2>
 <p className="text-[11px] font-medium text-[var(--text-muted)]">System configuration and archive management</p>
 </div>
 </div>
 </div>

 {/* Archive Engine Meta */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
 <div className="glass-card p-10 rounded-[var(--radius-xl)] relative overflow-hidden group">
 <div className="flex items-center gap-6 mb-4">
 <div className="p-4 bg-[var(--accent)]/10 rounded-2xl">
 <HardDrive className="text-[var(--accent)]" size={24} />
 </div>
 <div>
 <h3 className="text-[11px] font-medium text-[var(--text-muted)]">Archived Jobs</h3>
 <div className="text-4xl font-semibold mt-1">{archiveStats.archivedJobs}</div>
 </div>
 </div>
 <p className="text-[11px] font-bold text-[var(--text-muted)] opacity-60">
 Records relocated from production clusters
 </p>
 </div>

 <div className="glass-card p-10 rounded-[var(--radius-xl)] relative overflow-hidden group">
 <div className="flex items-center gap-6 mb-4">
 <div className="p-4 bg-[var(--success)]/10 rounded-2xl">
 <FileText className="text-[var(--success)]" size={24} />
 </div>
 <div>
 <h3 className="text-[11px] font-medium text-[var(--text-muted)]">Archived Apps</h3>
 <div className="text-4xl font-semibold mt-1">{archiveStats.archivedApplications}</div>
 </div>
 </div>
 <p className="text-[11px] font-bold text-[var(--text-muted)] opacity-60">
 Applications stored in cold storage nodes
 </p>
 </div>
 </div>

 {/* Control Center */}
 <div className="glass-card rounded-[var(--radius-xl)] p-12 relative overflow-hidden">
 <div className="absolute top-0 left-0 w-full h-1 bg-[var(--accent)] opacity-20"></div>
 <div className="flex items-center justify-between mb-12">
 <div>
 <h3 className="text-lg sm:text-xl font-medium">Maintenance Control Center</h3>
 <p className="text-xs text-[var(--text-muted)] mt-2 font-bold opacity-60">
 Last Synced: {archiveStats.lastUpdated ? new Date(archiveStats.lastUpdated).toLocaleTimeString() : 'Never'}
 </p>
 </div>
 <button
 onClick={() => { fetchArchiveStats(); fetchArchiveTables(); }}
 className="p-4 bg-[var(--bg-accent)] rounded-2xl hover:bg-[var(--border-primary)] transition-all"
 >
 <RefreshCw size={20} className={isProcessing ? 'animate-spin' : ''} />
 </button>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
 {[
 { label: 'Data Archiving', desc: 'Relocate inactive records (>6 months) to cold storage.', icon: Trash2, color: 'indigo', endpoint: 'archive' },
 { label: 'PII Anonymization', desc: 'GDPR-compliant anonymization of personally identifiable information.', icon: UserX, color: 'rose', endpoint: 'anonymize' },
 { label: 'Consent Expiry', desc: 'Validate and revoke expired or stale candidate permissions.', icon: ShieldAlert, color: 'emerald', endpoint: 'consent-check' }
 ].map((tool, i) => (
 <div key={i} className="flex flex-col h-full bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-[var(--radius-xl)] p-8 transition-all hover:border-[var(--accent)]/30 group">
 <div className={`w-14 h-14 rounded-2xl bg-${tool.color}-500/10 flex items-center justify-center mb-6`}>
 <tool.icon className={`text-${tool.color}-500`} size={24} />
 </div>
 <h4 className="text-sm font-medium mb-4 group-hover:text-[var(--accent)] transition-colors">{tool.label}</h4>
 <p className="text-[11px] text-[var(--text-muted)] leading-relaxed mb-8 flex-1 font-medium font-italic">{tool.desc}</p>
 <button
 disabled={isProcessing}
 onClick={() => runMaintenance(tool.label, tool.endpoint)}
 className={`w-full py-4 rounded-2xl font-semibold uppercase text-[11px] tracking-[0.15em] transition-all ${isProcessing === tool.label ? 'bg-slate-700 opacity-50 cursor-not-allowed' : `bg-${tool.color}-600 text-white hover:shadow-lg hover:shadow-${tool.color}-500/20`}`}
 >
 {isProcessing === tool.label ? 'Processing...' : `Initialize sp_${tool.endpoint}`}
 </button>
 </div>
 ))}
 </div>
 </div>

 {/* Archive Data Tables */}
 <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:gap-8">
 <div className="glass-card rounded-[var(--radius-xl)] p-10 relative overflow-hidden">
 <h3 className="text-lg sm:text-xl font-medium mb-8">Archived Job Postings</h3>
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="border-b border-[var(--border-primary)]">
 <th scope="col" className="py-4 text-[11px] font-medium text-[var(--text-muted)]">Job ID</th>
 <th scope="col" className="py-4 text-[11px] font-medium text-[var(--text-muted)]">Title</th>
 <th scope="col" className="py-4 text-[11px] font-medium text-[var(--text-muted)]">Location</th>
 <th scope="col" className="py-4 text-[11px] font-medium text-[var(--text-muted)]">Archived At</th>
 </tr>
 </thead>
 <tbody>
 {archivedJobsData.length > 0 ? (archivedJobsData || []).map((job, i) => (
 <tr key={i} className="border-b border-[var(--border-primary)]/30 hover:bg-[var(--surface-hover)] transition-colors">
 <td className="py-4 font-mono text-xs">{job.JobID}</td>
 <td className="py-4 font-bold text-sm">{job.JobTitle}</td>
 <td className="py-4 text-xs font-medium">{job.Location}</td>
 <td className="py-4 text-[11px] font-bold opacity-60">{new Date(job.ArchivedAt).toLocaleDateString()}</td>
 </tr>
 )) : (
 <tr>
 <td colSpan="4" className="py-20 text-center font-medium text-[11px]">No archived jobs found</td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>

 <div className="glass-card rounded-[var(--radius-xl)] p-10 relative overflow-hidden">
 <h3 className="text-lg sm:text-xl font-medium mb-8">Archived Applications</h3>
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="border-b border-[var(--border-primary)]">
 <th scope="col" className="py-4 text-[11px] font-medium text-[var(--text-muted)]">App ID</th>
 <th scope="col" className="py-4 text-[11px] font-medium text-[var(--text-muted)]">Candidate Name</th>
 <th scope="col" className="py-4 text-[11px] font-medium text-[var(--text-muted)]">Email</th>
 <th scope="col" className="py-4 text-[11px] font-medium text-[var(--text-muted)]">LinkedIn URL</th>
 <th scope="col" className="py-4 text-[11px] font-medium text-[var(--text-muted)]">Job Title</th>
 <th scope="col" className="py-4 text-[11px] font-medium text-[var(--text-muted)]">Status</th>
 <th scope="col" className="py-4 text-[11px] font-medium text-[var(--text-muted)]">Archived At</th>
 </tr>
 </thead>
 <tbody>
 {archivedAppsData.length > 0 ? (archivedAppsData || []).map((app, i) => (
 <tr key={i} className="border-b border-[var(--border-primary)]/30 hover:bg-[var(--surface-hover)] transition-colors">
 <td className="py-4 font-mono text-xs">{app.ApplicationID}</td>
 <td className="py-4 font-bold text-sm">{app.FullName || 'N/A'}</td>
 <td className="py-4 text-xs font-medium">{app.Email || 'N/A'}</td>
 <td className="py-4 text-xs">
 {app.LinkedInURL ? (
 <a
 href={app.LinkedInURL}
 target="_blank"
 rel="noopener noreferrer"
 className="text-[var(--accent)] hover:text-[var(--accent)] underline"
 >
 View Profile
 </a>
 ) : 'N/A'}
 </td>
 <td className="py-4 text-xs font-medium">{app.JobTitle || 'N/A'}</td>
 <td className="py-4 text-xs font-medium">{app.StatusName || app.StatusID || 'N/A'}</td>
 <td className="py-4 text-[11px] font-bold opacity-60">{new Date(app.ArchivedAt).toLocaleDateString()}</td>
 </tr>
 )) : (
 <tr>
 <td colSpan="7" className="py-20 text-center font-medium text-[11px]">No archived applications found</td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 </div>

 <div className="text-center pb-8 border-t border-[var(--border-primary)] pt-8 mt-8">
 <p className="text-[var(--text-muted)] font-bold text-[11px] opacity-40">
 Warning: All maintenance procedures are logged in the Security Audit Trail.
 </p>
 </div>
 </div>
 );
 case 'User Management':
 return (
 <div className="glass-card rounded-[var(--radius-xl)] p-10 relative overflow-hidden">
 <div className="flex items-center justify-between mb-8">
 <h3 className="text-lg sm:text-xl font-medium flex items-center gap-3">
 <Users size={24} className="text-[var(--accent)]" /> User Access Control
 </h3>
 <button onClick={fetchUsers} className="p-3 bg-[var(--bg-accent)] rounded-xl hover:bg-[var(--border-primary)] transition-all">
 <RefreshCw size={16} className={usersLoading ? 'animate-spin' : ''} />
 </button>
 </div>
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="border-b border-[var(--border-primary)]">
 <th scope="col" className="py-4 text-[11px] font-medium text-[var(--text-muted)]">User ID</th>
 <th scope="col" className="py-4 text-[11px] font-medium text-[var(--text-muted)]">Credentials</th>
 <th scope="col" className="py-4 text-[11px] font-medium text-[var(--text-muted)]">Role Mapping</th>
 <th scope="col" className="py-4 text-[11px] font-medium text-[var(--text-muted)] flex justify-end">System Status</th>
 </tr>
 </thead>
 <tbody>
 {users.length > 0 ? users.map((user) => (
 <tr key={user.UserID} className="border-b border-[var(--border-primary)]/30 hover:bg-[var(--surface-hover)] transition-colors">
 <td className="py-4 font-mono text-xs">{user.UserID}</td>
 <td className="py-4">
 <div className="font-bold text-sm tracking-tight">{user.Username}</div>
 <div className="text-[11px] text-[var(--text-muted)] mt-1">{user.Email}</div>
 </td>
 <td className="py-4">
 <select
 value={user.RoleID}
 onChange={(e) => updateUserRole(user.UserID, parseInt(e.target.value))}
 className="bg-[var(--bg-accent)] border border-[var(--border-primary)] text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-[var(--accent)]"
 >
 <option value={1}>Administrator</option>
 <option value={2}>Recruiter</option>
 <option value={3}>Candidate</option>
 </select>
 </td>
 <td className="py-4 flex justify-end">
 <button
 onClick={() => toggleUserStatus(user.UserID, !user.IsActive)}
 className={`px-4 py-2 flex items-center gap-2 rounded-xl text-[11px] font-medium border transition-all ${user.IsActive ? 'bg-[var(--success)]/10 border-emerald-500/30 text-[var(--success)] hover:bg-[var(--success)]/20' : 'bg-[var(--danger)]/10 border-rose-500/30 text-[var(--danger)] hover:bg-[var(--danger)]/20'}`}
 >
 {user.IsActive ? <><CheckCircle size={14} /> Active</> : <><XCircle size={14} /> Disabled</>}
 </button>
 </td>
 </tr>
 )) : (
 <tr>
 <td colSpan="4" className="py-20 text-center font-medium text-[11px]">No users indexed</td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 );
 case 'System Reports':
 return (
 <div className="space-y-5 sm:space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
 {/* Gradient Header */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8 border border-slate-500/20">
 <div className="flex items-center gap-4">
 <div className="w-14 h-14 rounded-2xl bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-muted)]">
 <BarChart3 size={28} />
 </div>
 <div>
 <h2 className="text-lg sm:text-xl font-medium">System Reports</h2>
 <p className="text-[11px] font-medium text-[var(--text-muted)]">Platform performance and user analytics</p>
 </div>
 </div>
 </div>

 {/* Recruitment Stats */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
 <div className="glass-card p-8 rounded-[var(--radius-xl)]">
 <div className="flex items-center gap-3 mb-4">
 <Users size={20} className="text-[var(--accent)]" />
 <span className="text-[11px] font-medium text-[var(--accent)]">Candidates</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">{systemStats?.candidates || 0}</div>
 <div className="text-[11px] font-bold text-[var(--text-muted)] mt-2">In talent pool</div>
 </div>
 <div className="glass-card p-8 rounded-[var(--radius-xl)]">
 <div className="flex items-center gap-3 mb-4">
 <Briefcase size={20} className="text-[var(--success)]" />
 <span className="text-[11px] font-medium text-[var(--success)]">Active Jobs</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">{systemStats?.activeJobs || 0}</div>
 <div className="text-[11px] font-bold text-[var(--text-muted)] mt-2">Open positions</div>
 </div>
 <div className="glass-card p-8 rounded-[var(--radius-xl)]">
 <div className="flex items-center gap-3 mb-4">
 <FileText size={20} className="text-[var(--accent)]" />
 <span className="text-[11px] font-medium text-[var(--accent)]">Applications</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">{systemStats?.totalApplications || 0}</div>
 <div className="text-[11px] font-bold text-[var(--text-muted)] mt-2">Total received</div>
 </div>
 </div>

 {/* Additional Stats */}
 <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 <div className="glass-card p-6 rounded-2xl border border-[var(--accent)]/20">
 <div className="text-[11px] font-medium text-[var(--text-muted)] mb-2">Users</div>
 <div className="text-xl sm:text-2xl font-semibold text-[var(--accent)]">{systemStats?.users || 0}</div>
 </div>
 <div className="glass-card p-6 rounded-2xl border border-emerald-500/20">
 <div className="text-[11px] font-medium text-[var(--text-muted)] mb-2">Interviews</div>
 <div className="text-xl sm:text-2xl font-semibold text-[var(--success)]">{systemStats?.scheduledInterviews || 0}</div>
 </div>
 <div className="glass-card p-6 rounded-2xl border border-[var(--accent)]/20">
 <div className="text-[11px] font-medium text-[var(--text-muted)] mb-2">Hired</div>
 <div className="text-xl sm:text-2xl font-semibold text-[var(--accent)]">{systemStats?.hiredCandidates || 0}</div>
 </div>
 <div className="glass-card p-6 rounded-2xl border border-amber-500/20">
 <div className="text-[11px] font-medium text-[var(--text-muted)] mb-2">Conversion</div>
 <div className="text-xl sm:text-2xl font-semibold text-[var(--warning)]">
 {systemStats?.totalApplications > 0
 ? Math.round((systemStats?.hiredCandidates / systemStats?.totalApplications) * 100)
 : 0}%
 </div>
 </div>
 </div>

 {/* Users Table */}
 <div className="glass-card rounded-[var(--radius-xl)] p-10">
 <div className="flex items-center justify-between mb-8">
 <h3 className="text-lg sm:text-xl font-medium flex items-center gap-3">
 <Users size={24} className="text-[var(--accent)]" /> User Directory
 </h3>
 <div className="flex items-center gap-2">
 <button
 onClick={() => setShowCreateCandidateModal(true)}
 className="p-3 bg-[var(--accent)] text-white rounded-xl hover:bg-[var(--accent-hover)] transition-all flex items-center gap-2"
 >
 <UserPlus size={16} />
 <span className="text-[11px] font-medium">Create Candidate</span>
 </button>
 <button onClick={() => { fetchSystemStats(); fetchUsers(); }} className="p-3 bg-[var(--bg-accent)] rounded-xl hover:bg-[var(--border-primary)] transition-all">
 <RefreshCw size={16} className={systemStatsLoading ? 'animate-spin' : ''} />
 </button>
 </div>
 </div>
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="border-b border-[var(--border-primary)]">
 <th scope="col" className="py-4 text-[11px] font-medium text-[var(--text-muted)]">User ID</th>
 <th scope="col" className="py-4 text-[11px] font-medium text-[var(--text-muted)]">Username</th>
 <th scope="col" className="py-4 text-[11px] font-medium text-[var(--text-muted)]">Email</th>
 <th scope="col" className="py-4 text-[11px] font-medium text-[var(--text-muted)]">Role</th>
 <th scope="col" className="py-4 text-[11px] font-medium text-[var(--text-muted)]">Status</th>
 </tr>
 </thead>
 <tbody>
 {users.length > 0 ? users.slice(0, 15).map((user) => (
 <tr key={user.UserID} className="border-b border-[var(--border-primary)]/30 hover:bg-[var(--surface-hover)] transition-colors">
 <td className="py-4 font-mono text-xs">{user.UserID}</td>
 <td className="py-4 font-bold text-sm">{user.Username}</td>
 <td className="py-4 text-xs text-[var(--text-muted)]">{user.Email}</td>
 <td className="py-4">
 <span className={`text-[11px] font-semibold px-3 py-1 rounded-full ${user.RoleID === 1 ? 'bg-[var(--accent)]/10 text-[var(--accent)]' :
 user.RoleID === 2 ? 'bg-[var(--accent)]/10 text-[var(--accent)]' :
 'bg-[var(--success)]/10 text-[var(--success)]'
 }`}>
 {user.RoleName || (user.RoleID === 1 ? 'Admin' : user.RoleID === 2 ? 'Recruiter' : 'Candidate')}
 </span>
 </td>
 <td className="py-4">
 <span className={`text-[11px] font-semibold px-3 py-1 rounded-full ${user.IsActive ? 'bg-[var(--success)]/10 text-[var(--success)]' : 'bg-[var(--danger)]/10 text-[var(--danger)]'
 }`}>
 {user.IsActive ? 'Active' : 'Inactive'}
 </span>
 </td>
 </tr>
 )) : (
 <tr>
 <td colSpan={5} className="py-10 text-center font-medium text-[11px]">Loading users...</td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 );
 case 'Security Logs':
 return (
 <div className="space-y-5 sm:space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
 {/* Gradient Header */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8 border border-[var(--danger)]/20">
 <div className="flex items-center gap-4">
 <div className="w-14 h-14 rounded-2xl bg-[var(--danger)]/10 flex items-center justify-center text-[var(--danger)]">
 <ShieldAlert size={28} />
 </div>
 <div>
 <h2 className="text-lg sm:text-xl font-medium">Security Logs</h2>
 <p className="text-[11px] font-medium text-[var(--text-muted)]">Platform audit trail and security events</p>
 </div>
 </div>
 </div>

 <div className="glass-card rounded-[var(--radius-xl)] p-10 relative overflow-hidden">
 <div className="flex items-center justify-between mb-8">
 <h3 className="text-lg sm:text-xl font-medium flex items-center gap-3">
 <ShieldAlert size={24} className="text-[var(--warning)]" /> Security Audit Trail
 </h3>
 <button onClick={fetchAuditLogs} className="p-3 bg-[var(--bg-accent)] rounded-xl hover:bg-[var(--border-primary)] transition-all">
 <RefreshCw size={16} className={auditLogsLoading ? 'animate-spin' : ''} />
 </button>
 </div>
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="border-b border-[var(--border-primary)]">
 <th scope="col" className="py-4 text-[11px] font-medium text-[var(--text-muted)]">Time</th>
 <th scope="col" className="py-4 text-[11px] font-medium text-[var(--text-muted)]">Event Details</th>
 <th scope="col" className="py-4 text-[11px] font-medium text-[var(--text-muted)]">Target</th>
 <th scope="col" className="py-4 text-[11px] font-medium text-[var(--text-muted)] flex justify-end">Executed By</th>
 </tr>
 </thead>
 <tbody>
 {auditLogs.length > 0 ? (auditLogs || []).map((log) => (
 <tr key={log.AuditID} className="border-b border-[var(--border-primary)]/30 hover:bg-[var(--surface-hover)] transition-colors">
 <td className="py-4 text-xs font-mono opacity-60">
 {new Date(log.ChangedAt).toLocaleString()}
 </td>
 <td className="py-4">
 <div className="flex items-center gap-2">
 <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${log.Operation === 'UPDATE' ? 'bg-orange-500/10 text-[var(--warning)]' : log.Operation === 'INSERT' ? 'bg-[var(--success)]/10 text-[var(--success)]' : 'bg-[var(--danger)]/10 text-[var(--danger)]'}`}>{log.Operation}</span>
 </div>
 <div className="text-[11px] font-mono opacity-60 mt-2 truncate max-w-xs">{log.OldValue} → {log.NewValue}</div>
 </td>
 <td className="py-4 text-xs font-bold">
 {log.TableName} <span className="text-[var(--text-muted)]">#{log.RecordID}</span>
 </td>
 <td className="py-4 flex justify-end font-mono text-xs text-[var(--accent)]">
 @{log.ChangedBy || 'SYSTEM_CLR'}
 </td>
 </tr>
 )) : (
 <tr>
 <td colSpan={4} className="py-20 text-center font-medium text-[11px]">No audit footprint detected</td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 );
 case 'SQL Views':
 return <Suspense fallback={<TabLoader />}><SQLViews /></Suspense>;
 case 'Recruiter Perf':
 return <Suspense fallback={<TabLoader />}><RecruiterPerformanceAdmin /></Suspense>;
 case 'Consent Mgmt':
 return <Suspense fallback={<TabLoader />}><ConsentManagement /></Suspense>;
 case 'Vacancy Util':
 return <Suspense fallback={<TabLoader />}><VacancyUtilizationAdmin /></Suspense>;
 case 'Market Intel':
 // Calculate summary stats
 const totalSkills = marketData.length;
 const avgSalary = totalSkills > 0 ? Math.round(marketData.reduce((sum, item) => sum + (item.AvgSalary || 0), 0) / totalSkills) : 0;
 const shortageCount = marketData.filter(item => (item.DemandScore || 0) - (item.SupplyScore || 0) > 20).length;
 const oversupplyCount = marketData.filter(item => (item.SupplyScore || 0) - (item.DemandScore || 0) > 20).length;
 const risingSkills = marketData.filter(item => item.SalaryTrend === 'Rising').length;

 return (
 <div key={`market-intel-${marketIntelKey}`} className="space-y-6 sm:space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
 <div className="glass-card rounded-[var(--radius-xl)] p-8 border border-[var(--accent)]/20">
 <div className="flex items-center gap-4">
 <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
 <Globe size={28} />
 </div>
 <div>
 <h2 className="text-lg sm:text-xl font-medium">Market Intelligence</h2>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Analyze market trends and skill demand patterns</p>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-[var(--accent)]/20">
 <div className="flex items-center gap-3 mb-2">
 <Globe size={18} className="text-[var(--accent)]" />
 <span className="text-[11px] font-medium text-[var(--accent)]">Skills Tracked</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">{totalSkills}</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Market intelligence</p>
 </div>
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-emerald-500/20">
 <div className="flex items-center gap-3 mb-2">
 <DollarSign size={18} className="text-[var(--success)]" />
 <span className="text-[11px] font-medium text-[var(--success)]">Avg Salary</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">${(avgSalary / 1000).toFixed(0)}k</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Market rate</p>
 </div>
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-[var(--danger)]/20">
 <div className="flex items-center gap-3 mb-2">
 <TrendingUp size={18} className="text-[var(--danger)]" />
 <span className="text-[11px] font-medium text-[var(--danger)]">Critical Shortage</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold text-[var(--danger)]">{shortageCount}</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">High demand skills</p>
 </div>
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-amber-500/20">
 <div className="flex items-center gap-3 mb-2">
 <Zap size={18} className="text-[var(--warning)]" />
 <span className="text-[11px] font-medium text-[var(--warning)]">Rising Salaries</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold text-[var(--warning)]">{risingSkills}</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Increasing pay</p>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
 {/* Market Overview */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8">
 <h3 className="text-lg font-medium mb-6">Market Overview</h3>

 {marketData.length > 0 ? (
 <div className="space-y-6">
 {/* Market Conditions Summary */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="p-6 bg-[var(--bg-accent)] rounded-xl border border-[var(--border-primary)]">
 <h4 className="text-sm font-medium text-[var(--danger)] mb-4 flex items-center gap-2">
 <AlertCircle size={16} /> Critical Shortages
 </h4>
 <div className="space-y-3">
 {marketData.filter(item => item.MarketCondition === 'Critical Shortage').slice(0, 4).map((item, i) => (
 <div key={i} className="flex items-center justify-between">
 <span className="text-sm font-semibold">{item.SkillName}</span>
 <span className="text-sm font-semibold text-[var(--danger)]">{formatScore(item.DemandScore)}</span>
 </div>
 ))}
 {marketData.filter(item => item.MarketCondition === 'Critical Shortage').length === 0 && (
 <div className="text-center text-[var(--success)] font-semibold">No critical shortages</div>
 )}
 </div>
 </div>

 <div className="p-6 bg-[var(--bg-accent)] rounded-xl border border-[var(--border-primary)]">
 <h4 className="text-sm font-medium text-[var(--success)] mb-4 flex items-center gap-2">
 <TrendingUp size={16} /> Oversupply
 </h4>
 <div className="space-y-3">
 {marketData.filter(item => item.MarketCondition === 'Oversupply').slice(0, 4).map((item, i) => (
 <div key={i} className="flex items-center justify-between">
 <span className="text-sm font-semibold">{item.SkillName}</span>
 <span className="text-sm font-semibold text-[var(--success)]">{formatScore(item.SupplyScore)}</span>
 </div>
 ))}
 {marketData.filter(item => item.MarketCondition === 'Oversupply').length === 0 && (
 <div className="text-center text-[var(--success)] font-semibold">No oversupply detected</div>
 )}
 </div>
 </div>
 </div>

 {/* Top Skills by Demand */}
 <div className="p-6 bg-[var(--bg-accent)] rounded-xl border border-[var(--border-primary)]">
 <h4 className="text-sm font-medium text-[var(--accent)] mb-4 flex items-center gap-2">
 <TrendingUp size={16} /> Top Skills by Demand
 </h4>
 <div className="space-y-3">
 {marketData.sort((a, b) => (b.DemandScore || 0) - (a.DemandScore || 0)).slice(0, 5).map((item, i) => (
 <div key={i} className="flex items-center justify-between">
 <span className="text-sm font-semibold">{item.SkillName}</span>
 <div className="flex items-center gap-2">
 <span className="text-sm font-semibold text-[var(--accent)]">{formatScore(item.DemandScore)}</span>
 <div className="w-20 h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
 <div className="h-full bg-[var(--accent)] rounded-full" style={{ width: `${Math.min((item.DemandScore / 100) * 100, 100)}%` }} />
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 ) : (
 <div className="text-center py-12 text-[var(--text-muted)]">
 <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
 <p>No market data available yet.</p>
 <p className="text-xs mt-1">Connect to database to see market intelligence insights.</p>
 </div>
 )}
 </div>

 {/* Market Analysis */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8">
 <div className="flex items-center justify-between mb-6">
 <h3 className="text-lg font-medium">Market Analysis</h3>
 <button
 onClick={() => { /* Refresh market data */ }}
 className="p-2 hover:bg-[var(--bg-accent)] rounded-xl transition-colors"
 title="Refresh"
 >
 <RefreshCw className="w-5 h-5 text-[var(--text-muted)]" />
 </button>
 </div>

 {marketData.length > 0 ? (
 <div className="space-y-6">
 {/* Demand vs Supply Chart */}
 <div className="p-6 bg-[var(--bg-accent)] rounded-xl border border-[var(--border-primary)]">
 <div className="flex items-center gap-3 mb-4">
 <TrendingUp size={20} className="text-[var(--danger)]" />
 <h4 className="text-sm font-medium">Demand vs Supply</h4>
 </div>
 <div className="mt-4">
 <MarketIntelligenceChart data={marketData} type="demand-supply" />
 </div>
 </div>

 {/* Market Conditions Chart */}
 <div className="p-6 bg-[var(--bg-accent)] rounded-xl border border-[var(--border-primary)]">
 <div className="flex items-center gap-3 mb-4">
 <PieChart size={20} className="text-[var(--accent)]" />
 <h4 className="text-sm font-medium">Market Conditions</h4>
 </div>
 <div className="mt-4">
 <MarketIntelligenceChart data={marketData} type="conditions" />
 </div>
 </div>
 </div>
 ) : (
 <div className="text-center py-12 text-[var(--text-muted)]">
 <PieChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
 <p>No market analysis data available.</p>
 <p className="text-xs mt-1">Connect to database to see market trends.</p>
 </div>
 )}
 </div>
 </div>

 {/* Skill Details */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8">
 <div className="flex items-center justify-between mb-6">
 <h3 className="text-lg font-medium">Skill Details</h3>
 <span className="text-[11px] font-semibold text-[var(--text-muted)]">
 {marketData.length} skills tracked
 </span>
 </div>

 {marketData.length > 0 ? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
 {marketData.map((item, idx) => (
 <div key={idx} className="p-6 bg-[var(--bg-accent)] rounded-xl border border-[var(--border-primary)] hover:bg-[var(--bg-accent)]/50 transition-colors">
 <div className="flex items-center justify-between mb-4">
 <div className="text-sm font-semibold">{item.SkillName || 'Unknown Skill'}</div>
 <div className={`text-[11px] font-semibold px-2 py-1 rounded-lg border ${item.MarketCondition === 'Critical Shortage' ? 'bg-[var(--danger)]/10 text-[var(--danger)] border-red-500/20' :
 item.MarketCondition === 'High Demand' ? 'bg-orange-500/10 text-[var(--warning)] border-orange-500/20' :
 item.MarketCondition === 'Oversupply' ? 'bg-[var(--success)]/10 text-[var(--success)] border-emerald-500/20' :
 'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20'
 }`}>
 {item.MarketCondition || 'Balanced'}
 </div>
 </div>
 <div className="text-[11px] text-[var(--text-muted)] mb-4">{item.Location || 'Global'}</div>

 <div className="space-y-3 mb-4">
 <div className="flex items-center justify-between">
 <span className="text-[11px] font-medium text-[var(--text-muted)]">Demand</span>
 <span className="text-sm font-semibold text-[var(--danger)]">{item.DemandScore ?? '-'}</span>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-[11px] font-medium text-[var(--text-muted)]">Supply</span>
 <span className="text-sm font-semibold text-[var(--success)]">{item.SupplyScore ?? '-'}</span>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-[11px] font-medium text-[var(--text-muted)]">Gap</span>
 <span className={`text-sm font-semibold ${(item.ImbalanceScore ?? 0) > 0 ? 'text-[var(--warning)]' : 'text-[var(--accent)]'}`}>
 {item.ImbalanceScore ?? '-'}
 </span>
 </div>
 </div>

 <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] pt-3 border-t border-[var(--border-primary)]">
 <span className={`flex items-center gap-1 ${item.SalaryTrend === 'Rising' ? 'text-[var(--success)]' :
 item.SalaryTrend === 'Falling' ? 'text-[var(--danger)]' :
 'text-[var(--text-muted)]'
 }`}>
 <TrendingUp size={12} />
 {item.SalaryTrend || 'Stable'}
 </span>
 <span className="text-[11px] font-semibold">Fill: {item.TimeToFillDays ? `${item.TimeToFillDays}d` : '-'}</span>
 <span className={`text-[11px] font-semibold ${item.HiringDifficulty === 'Very Difficult' ? 'text-[var(--danger)]' :
 item.HiringDifficulty === 'Difficult' ? 'text-[var(--warning)]' :
 'text-[var(--success)]'
 }`}>
 {item.HiringDifficulty || 'N/A'}
 </span>
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="text-center py-12 text-[var(--text-muted)]">
 <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
 <p>No skill data available yet.</p>
 <p className="text-xs mt-1">Connect to database to see detailed skill analysis.</p>
 </div>
 )}
 </div>

 {/* Empty State */}
 {(!marketData || marketData.length === 0) && !analyticsLoading && (
 <div className="glass-card rounded-[var(--radius-xl)] p-8 text-center">
 <Globe className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4 opacity-50" />
 <p className="text-[var(--text-muted)]">No market intelligence data available yet.</p>
 <p className="text-xs text-[var(--text-muted)] mt-1">Connect to database to see market trends and insights.</p>
 </div>
 )}
 </div>
 );
 case 'Salary Transp':
 return <Suspense fallback={<TabLoader />}><SalaryTransparencyAnalytics /></Suspense>;
 case 'Remote Work':
 return (
 <RemoteWorkAnalytics
 data={remoteData}
 loading={analyticsLoading}
 />
 );
 case 'Career Path':
 return (
 <div className="space-y-5 sm:space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
 {/* Gradient Header */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8 border border-[var(--accent)]/20">
 <div className="flex items-center gap-4">
 <div className="w-14 h-14 rounded-2xl bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent)]">
 <GitBranch size={28} />
 </div>
 <div>
 <h2 className="text-lg sm:text-xl font-medium">Career Path</h2>
 <p className="text-[11px] font-medium text-[var(--text-muted)]">Career transition analytics and growth metrics</p>
 </div>
 </div>
 </div>

 {analyticsLoading && (
 <div className="flex items-center justify-center py-20">
 <RefreshCw className="w-8 h-8 text-[var(--accent)] animate-spin" />
 <span className="ml-3 text-sm font-medium text-[var(--text-muted)]">Loading Career Data...</span>
 </div>
 )}

 {/* Summary Stats */}
 <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
 <div className="glass-card p-6 rounded-[var(--radius-xl)] border border-[var(--accent)]/20">
 <div className="flex items-center gap-2 mb-2">
 <GitBranch className="w-4 h-4 text-[var(--accent)]" />
 <span className="text-[11px] font-medium text-[var(--accent)]">Career Tracks</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">{careerPathData.length}</div>
 <p className="text-[11px] text-[var(--text-muted)]">Unique transitions</p>
 </div>
 <div className="glass-card p-6 rounded-[var(--radius-xl)] border border-emerald-500/20">
 <div className="flex items-center gap-2 mb-2">
 <TrendingUp className="w-4 h-4 text-[var(--success)]" />
 <span className="text-[11px] font-medium text-[var(--success)]">Avg Success</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">
 {careerPathData.length > 0
 ? `${Math.round(careerPathData.reduce((sum, item) => sum + (item.AvgProbability || 0), 0) / careerPathData.length)}%`
 : '0%'}
 </div>
 <p className="text-[11px] text-[var(--text-muted)]">Transition success rate</p>
 </div>
 <div className="glass-card p-6 rounded-[var(--radius-xl)] border border-[var(--accent)]/20">
 <div className="flex items-center gap-2 mb-2">
 <Zap className="w-4 h-4 text-[var(--accent)]" />
 <span className="text-[11px] font-medium text-[var(--accent)]">Avg Timeline</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">
 {careerPathData.length > 0
 ? Math.round(careerPathData.reduce((sum, item) => sum + (item.AvgMonthsToPromote || item.AvgTransitionMonths || 0), 0) / careerPathData.length)
 : 0}
 </div>
 <p className="text-[11px] text-[var(--text-muted)]">Months to promote</p>
 </div>
 <div className="glass-card p-6 rounded-[var(--radius-xl)] border border-amber-500/20">
 <div className="flex items-center gap-2 mb-2">
 <DollarSign className="w-4 h-4 text-[var(--warning)]" />
 <span className="text-[11px] font-medium text-[var(--warning)]">Avg Salary Growth</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">
 {careerPathData.length > 0
 ? `${Math.round(careerPathData.reduce((sum, item) => sum + (item.AvgSalaryIncreasePct || item.AvgSalaryIncrease || 0), 0) / careerPathData.length)}%`
 : '0%'}
 </div>
 <p className="text-[11px] text-[var(--text-muted)]">Salary increase</p>
 </div>
 </div>

 {/* Career Transition Cards */}
 <div className="glass-card p-8 rounded-[var(--radius-xl)]">
 <div className="flex items-center gap-3 mb-6">
 <GitBranch className="w-5 h-5 text-[var(--accent)]" />
 <h3 className="text-sm font-medium">Organizational Career Transitions</h3>
 </div>
 <div className="space-y-4">
 {careerPathData.length > 0 ? careerPathData.slice(0, 8).map((item, idx) => (
 <div key={idx} className="p-6 bg-[var(--bg-accent)] rounded-2xl border border-[var(--border-primary)]">
 <div className="flex items-center justify-between mb-3">
 <div className="flex items-center gap-2">
 <div className="text-xs font-semibold">{item.CurrentRole || item.FromRole || 'Current Role'}</div>
 <ChevronRight className="w-4 h-4 text-violet-400" />
 <div className="text-sm font-semibold text-[var(--accent)]">{item.NextRole || item.ToRole || 'Next Role'}</div>
 </div>
 <span className="text-[11px] font-semibold px-3 py-1 bg-[var(--accent-soft)] text-[var(--accent)] rounded-full">
 {item.TransitionCount || 0} candidates
 </span>
 </div>
 <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-[var(--border-primary)]">
 <div>
 <div className="text-[11px] text-[var(--text-muted)] uppercase">Success Rate</div>
 <div className="text-sm font-semibold text-[var(--success)]">{Math.round(item.AvgProbability || 0)}%</div>
 </div>
 <div>
 <div className="text-[11px] text-[var(--text-muted)] uppercase">Timeline</div>
 <div className="text-sm font-semibold text-[var(--accent)]">{Math.round(item.AvgMonthsToPromote || item.AvgTransitionMonths || 0)} mo</div>
 </div>
 <div>
 <div className="text-[11px] text-[var(--text-muted)] uppercase">Salary Growth</div>
 <div className="text-sm font-semibold text-[var(--warning)]">+{Math.round(item.AvgSalaryIncreasePct || item.AvgSalaryIncrease || 0)}%</div>
 </div>
 </div>
 </div>
 )) : (
 <div className="text-center py-10 text-xs font-semibold text-[var(--text-muted)] opacity-50">
 No career path data available. Connect to database.
 </div>
 )}
 </div>
 </div>
 </div>
 );
 case 'Referral Intelligence':
 return <Suspense fallback={<TabLoader />}><ReferralIntelligence /></Suspense>;
 case 'Diversity Goals':
 return <Suspense fallback={<TabLoader />}><DiversityGoals /></Suspense>;
 case 'Bias Logs':
 return <Suspense fallback={<TabLoader />}><BiasLogs /></Suspense>;
 case 'Email Queue':
 return <Suspense fallback={<TabLoader />}><EmailQueueManager /></Suspense>;
 default:
 return null;
 }
 };

 // Render Create Candidate Modal
 const renderCreateCandidateModal = () => {
 if (!showCreateCandidateModal) return null;

 return (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300">
 {/* Backdrop */}
 <div
 className="absolute inset-0 bg-black/60 backdrop-blur-sm"
 onClick={() => setShowCreateCandidateModal(false)}
 />

 {/* Modal */}
 <div className="relative bg-[var(--bg-primary)] border border-[var(--border-primary)] w-full max-w-lg overflow-hidden rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] flex flex-col text-[var(--text-primary)]">
 {/* Header */}
 <div className="p-8 border-b border-[var(--border-primary)] flex items-center justify-between bg-[var(--bg-accent)]/20">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center">
 <UserPlus className="text-[var(--accent)]" size={24} />
 </div>
 <div>
 <h3 className="text-lg sm:text-xl font-semibold tracking-tight">Create Candidate</h3>
 <p className="text-[11px] font-semibold text-[var(--text-muted)] mt-1 italic">Add new candidate to the system</p>
 </div>
 </div>
 <button
 onClick={() => setShowCreateCandidateModal(false)}
 className="p-2 hover:bg-[var(--bg-tertiary)] rounded-xl transition-all"
 >
 <X size={20} className="text-[var(--text-muted)]" />
 </button>
 </div>

 {/* Form */}
 <div className="p-8">
 <form onSubmit={handleCreateCandidate} className="space-y-6">
 {/* Username */}
 <div>
 <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-3">
 Username <span className="text-[var(--danger)]">*</span>
 </label>
 <input
 type="text"
 value={newCandidate.username}
 onChange={(e) => setNewCandidate({ ...newCandidate, username: e.target.value })}
 className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)]/30 focus:border-[var(--accent)]/50 transition-all"
 placeholder="Enter username"
 required
 />
 </div>

 {/* Email */}
 <div>
 <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-3">
 Email <span className="text-[var(--danger)]">*</span>
 </label>
 <input
 type="email"
 value={newCandidate.email}
 onChange={(e) => setNewCandidate({ ...newCandidate, email: e.target.value })}
 className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)]/30 focus:border-[var(--accent)]/50 transition-all"
 placeholder="Enter email"
 required
 />
 </div>

 {/* Password */}
 <div>
 <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-3">
 Password <span className="text-[var(--danger)]">*</span>
 </label>
 <input
 type="password"
 value={newCandidate.password}
 onChange={(e) => setNewCandidate({ ...newCandidate, password: e.target.value })}
 className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)]/30 focus:border-[var(--accent)]/50 transition-all"
 placeholder="Enter password"
 required
 />
 </div>

 {/* Full Name */}
 <div>
 <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-3">
 Full Name <span className="text-[var(--danger)]">*</span>
 </label>
 <input
 type="text"
 value={newCandidate.fullName}
 onChange={(e) => setNewCandidate({ ...newCandidate, fullName: e.target.value })}
 className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)]/30 focus:border-[var(--accent)]/50 transition-all"
 placeholder="Enter full name"
 required
 />
 </div>

 {/* Location */}
 <div>
 <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-3">
 Location
 </label>
 <input
 type="text"
 value={newCandidate.location}
 onChange={(e) => setNewCandidate({ ...newCandidate, location: e.target.value })}
 className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)]/30 focus:border-[var(--accent)]/50 transition-all"
 placeholder="Enter location (optional)"
 />
 </div>

 {/* Years of Experience */}
 <div>
 <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-3">
 Years of Experience
 </label>
 <input
 type="number"
 value={newCandidate.yearsOfExperience}
 onChange={(e) => setNewCandidate({ ...newCandidate, yearsOfExperience: e.target.value })}
 className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)]/30 focus:border-[var(--accent)]/50 transition-all"
 placeholder="Enter years of experience (optional)"
 min="0"
 />
 </div>

 {/* Buttons */}
 <div className="flex gap-3 pt-2">
 <button
 type="button"
 onClick={() => setShowCreateCandidateModal(false)}
 className="flex-1 px-6 py-4 rounded-2xl border border-[var(--border-primary)] text-[var(--text-secondary)] font-semibold text-xs hover:bg-[var(--bg-accent)] transition-all"
 >
 Cancel
 </button>
 <button
 type="submit"
 disabled={isCreatingCandidate}
 className="flex-1 px-6 py-4 rounded-2xl bg-[var(--accent)] text-white font-semibold text-xs shadow-lg shadow-[var(--shadow-md)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
 >
 {isCreatingCandidate ? (
 <>
 <RefreshCw size={16} className="animate-spin" />
 Creating...
 </>
 ) : (
 <>
 <CheckCircle size={16} />
 Create Candidate
 </>
 )}
 </button>
 </div>
 </form>
 </div>
 </div>
 </div>
 );
 };

 return (
 <DashboardShell
 title="Database Intelligence"
 subtitle="Administration"
 navigation={adminNav}
 onProfileClick={() => { }}
 >
 <div key={activeView} className="reveal-up">
 {renderAdminContent()}
 </div>
 {renderCreateCandidateModal()}
 </DashboardShell>
 );
};

export default AdminDashboard;
