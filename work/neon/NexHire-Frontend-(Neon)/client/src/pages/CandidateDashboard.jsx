import React, { lazy, Suspense } from 'react';
import { Search, MapPin, Bookmark, Compass, Star, Zap, Target, Bell, TrendingUp, BookOpen, Trophy, FileText, DollarSign, BarChart3, BellRing, ChevronRight, Briefcase, User } from 'lucide-react';
import DashboardShell from '../components/DashboardShell';
import axios from 'axios';
import API_BASE from '../apiConfig';
import { useToast } from '../components/ui/Toast';

// Import New Components
const CandidateApplications = lazy(() => import('../components/Candidate/CandidateApplications'));
const CandidateInterviews = lazy(() => import('../components/Candidate/CandidateInterviews'));
const CandidateSkillsVerification = lazy(() => import('../components/Candidate/CandidateSkillsVerification'));
const SkillManagementModal = lazy(() => import('../components/Candidate/SkillManagementModal'));
const PushNotifications = lazy(() => import('../components/Candidate/PushNotifications'));
const CareerPath = lazy(() => import('../components/Candidate/CareerPath'));
const LearningPaths = lazy(() => import('../components/Candidate/LearningPaths'));
const Leaderboard = lazy(() => import('../components/Candidate/Leaderboard'));
const InterviewPrep = lazy(() => import('../components/Candidate/InterviewPrep'));
const SalaryCoach = lazy(() => import('../components/Candidate/SalaryCoach'));
const ResumeScore = lazy(() => import('../components/Candidate/ResumeScore'));
const LocationPreferences = lazy(() => import('../components/Candidate/LocationPreferences'));
const SkillGapAnalysis = lazy(() => import('../components/Candidate/SkillGapAnalysis'));
const ProfileManagement = lazy(() => import('../components/Candidate/ProfileManagement'));


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

const CandidateDashboard = () => {
    const { toast } = useToast();
 const [discoverJobs, setDiscoverJobs] = React.useState([]);
 const [applications, setApplications] = React.useState([]);
 const [interviews, setInterviews] = React.useState([]);
 const [assessments, setAssessments] = React.useState([]);
 const [profileSkills, setProfileSkills] = React.useState([]);
 const [careerPath, setCareerPath] = React.useState([]);
 const [learningPath, setLearningPath] = React.useState([]);
 const [leaderboardData, setLeaderboardData] = React.useState([]);
 const [globalLeaderboardData, setGlobalLeaderboardData] = React.useState(null);
 const [userRank, setUserRank] = React.useState(null);
 const [prepMaterials, setPrepMaterials] = React.useState([]);
 const [salaryData, setSalaryData] = React.useState([]);
 const [resumeData, setResumeData] = React.useState([]);
 const [loading, setLoading] = React.useState(true);
 const [activeTab, setActiveTab] = React.useState('Discover Jobs');
 const [isSkillModalOpen, setIsSkillModalOpen] = React.useState(false);
 const [skillToLearn, setSkillToLearn] = React.useState(null);
 const [showNotifications, setShowNotifications] = React.useState(false);
 const [appliedJobIds, setAppliedJobIds] = React.useState(new Set());
 const [expandedJobId, setExpandedJobId] = React.useState(null);

 // Search state
 const [searchQuery, setSearchQuery] = React.useState('');
 const [locationFilter, setLocationFilter] = React.useState('');
 const [filteredJobs, setFilteredJobs] = React.useState([]);

 // Record daily login on component mount
 React.useEffect(() => {
 const recordDailyLogin = async () => {
 try {
 const res = await axios.post(`${API_BASE}/candidates/gamification/daily-login`);
 if (res.data.isNewDay) {
 }
 } catch (err) {
 // Silently fail - not critical
 }
 };
 recordDailyLogin();
 }, []);

 const pendingInvitationsCount = applications.filter(app => app.StatusName === 'Invited').length;

 // Filter jobs based on search query and location
 const handleSearch = () => {
 let filtered = [...discoverJobs];

 // Filter by search query (job title, skills, description)
 if (searchQuery.trim()) {
 const query = searchQuery.toLowerCase().trim();
 filtered = filtered.filter(job => {
 const titleMatch = job.JobTitle?.toLowerCase().includes(query);
 const descMatch = job.Description?.toLowerCase().includes(query);
 // Handle RequiredSkills as array or string
 let skillsMatch = false;
 if (job.RequiredSkills) {
 if (Array.isArray(job.RequiredSkills)) {
 skillsMatch = job.RequiredSkills.some(skill =>
 (skill.SkillName || skill)?.toLowerCase().includes(query)
 );
 } else if (typeof job.RequiredSkills === 'string') {
 skillsMatch = job.RequiredSkills.toLowerCase().includes(query);
 }
 }
 return titleMatch || descMatch || skillsMatch;
 });
 }

 // Filter by location
 if (locationFilter.trim()) {
 const loc = locationFilter.toLowerCase().trim();
 filtered = filtered.filter(job => {
 const locationMatch = job.Location?.toLowerCase().includes(loc);
 const remoteMatch = loc.includes('remote') && job.Location?.toLowerCase().includes('remote');
 return locationMatch || remoteMatch;
 });
 }

 setFilteredJobs(filtered);
 };

 // Reset filtered jobs when discoverJobs changes
 React.useEffect(() => {
 setFilteredJobs(discoverJobs);
 }, [discoverJobs]);

 // Handle Enter key in search inputs
 const handleSearchKeyDown = (e) => {
 if (e.key === 'Enter') {
 handleSearch();
 }
 };

 const candidateNav = [
 // Job Search Flow
 { icon: Compass, label: 'Discover Jobs', active: activeTab === 'Discover Jobs', onClick: () => setActiveTab('Discover Jobs') },
 {
 icon: Bookmark,
 label: 'Applications',
 active: activeTab === 'Applications',
 onClick: () => setActiveTab('Applications'),
 badge: pendingInvitationsCount > 0 ? pendingInvitationsCount : null
 },
 { icon: Target, label: 'Interviews', active: activeTab === 'Interviews', onClick: () => setActiveTab('Interviews') },
 { icon: FileText, label: 'Interview Prep', active: activeTab === 'Interview Prep', onClick: () => setActiveTab('Interview Prep') },

 // Career Development
 { icon: Star, label: 'Skills', active: activeTab === 'Skills', onClick: () => setActiveTab('Skills') },
 { icon: BarChart3, label: 'Skill Gaps', active: activeTab === 'Skill Gaps', onClick: () => setActiveTab('Skill Gaps') },
 { icon: BookOpen, label: 'Learning', active: activeTab === 'Learning', onClick: () => setActiveTab('Learning') },
 { icon: TrendingUp, label: 'Career Path', active: activeTab === 'Career Path', onClick: () => setActiveTab('Career Path') },

 // Application Tools
 { icon: FileText, label: 'Resume Score', active: activeTab === 'Resume Score', onClick: () => setActiveTab('Resume Score') },
 { icon: DollarSign, label: 'Salary Coach', active: activeTab === 'Salary Coach', onClick: () => setActiveTab('Salary Coach') },

 // Engagement
 { icon: Trophy, label: 'Achievements', active: activeTab === 'Achievements', onClick: () => setActiveTab('Achievements') },

 // Preferences
 { icon: MapPin, label: 'Location Prefs', active: activeTab === 'Location Prefs', onClick: () => setActiveTab('Location Prefs') },
 ];


 const handleApply = async (jobID) => {
 // Prevent duplicate applications
 if (applications.some(app => app.JobID === jobID) || appliedJobIds.has(jobID)) {
 return;
 }
 try {
 await axios.post(`${API_BASE}/candidates/apply`, { jobID });
 // Add to appliedJobIds immediately so UI shows "Applied" button
 setAppliedJobIds(prev => new Set([...prev, jobID]));
 toast("Application submitted.");
 // Don't call fetchData() - job stays visible with grey button until page refresh
 } catch (err) {
 console.error("Apply Error:", err.response?.data?.error || err.message);
 toast(err.response?.data?.error || "Failed to submit application.", { type: 'error' });
 }
 };

 const fetchData = async () => {
 setLoading(true);

 // Each fetch is INDEPENDENT — one failure never blocks the others
 const [discoverRes, appsRes, interviewsRes, assessmentsRes, profileSkillsRes] = await Promise.allSettled([
 axios.get(`${API_BASE}/candidates/discover`),
 axios.get(`${API_BASE}/candidates/applications`),
 axios.get(`${API_BASE}/candidates/interviews`),
 axios.get(`${API_BASE}/candidates/assessments/available`),
 axios.get(`${API_BASE}/candidates/profile/skills`)
 ]);

 if (discoverRes.status === 'fulfilled') setDiscoverJobs(discoverRes.value.data);
 else console.error("Discover Jobs Error:", discoverRes.reason?.message);

 if (appsRes.status === 'fulfilled') setApplications(appsRes.value.data);
 else console.error("Applications Error:", appsRes.reason?.message);

 if (interviewsRes.status === 'fulfilled') setInterviews(interviewsRes.value.data);
 else console.error("Interviews Error:", interviewsRes.reason?.message);

 if (assessmentsRes.status === 'fulfilled') setAssessments(assessmentsRes.value.data);
 else console.error("Assessments Error:", assessmentsRes.reason?.message);

 if (profileSkillsRes.status === 'fulfilled') setProfileSkills(profileSkillsRes.value.data);
 else console.error("Profile Skills Error:", profileSkillsRes.reason?.message);

 setLoading(false);
 };

 React.useEffect(() => {
 fetchData();
 }, []);

 // Fetch career path, learning path, leaderboard, and prep data when tabs are selected
 React.useEffect(() => {
 if (activeTab === 'Career Path') {
 axios.get(`${API_BASE}/candidates/career-path`)
 .then(res => setCareerPath(res.data))
 .catch(err => console.error("Career Path Error:", err));
 }
 if (activeTab === 'Learning') {
 axios.get(`${API_BASE}/candidates/learning-path`)
 .then(res => setLearningPath(res.data))
 .catch(err => console.error("Learning Path Error:", err));
 }
 if (activeTab === 'Achievements') {
 // Fetch personal leaderboard data
 axios.get(`${API_BASE}/candidates/leaderboard`)
 .then(res => setLeaderboardData(res.data))
 .catch(err => console.error("Leaderboard Error:", err));
 // Fetch global leaderboard data
 axios.get(`${API_BASE}/candidates/leaderboard/global`)
 .then(res => {
 setGlobalLeaderboardData(res.data);
 setUserRank(res.data.userRank);
 })
 .catch(err => console.error("Global Leaderboard Error:", err));
 }
 if (activeTab === 'Interview Prep') {
 axios.get(`${API_BASE}/candidates/interview-prep`)
 .then(res => setPrepMaterials(res.data))
 .catch(err => console.error("Interview Prep Error:", err));
 }
 if (activeTab === 'Salary Coach') {
 axios.get(`${API_BASE}/candidates/salary-coach`)
 .then(res => setSalaryData(res.data))
 .catch(err => console.error("Salary Coach Error:", err));
 }
 if (activeTab === 'Resume Score') {
 axios.get(`${API_BASE}/candidates/resume-score`)
 .then(res => setResumeData(res.data))
 .catch(err => console.error("Resume Score Error:", err));
 }
 }, [activeTab]);

 const handleGenerateLearningPath = async () => {
 // Placeholder - actual generation happens in LearningPaths component
 };

 const handleNavigateToLearning = (skillName) => {
 setSkillToLearn(skillName);
 setActiveTab('Learning');
 };

 // Clear skillToLearn after navigating to Learning tab (after component mounts)
 React.useEffect(() => {
 if (activeTab === 'Learning' && skillToLearn) {
 const timer = setTimeout(() => setSkillToLearn(null), 100);
 return () => clearTimeout(timer);
 }
 }, [activeTab, skillToLearn]);

 const renderMainContent = () => {
 switch (activeTab) {
 case 'Applications':
 return <Suspense fallback={<TabLoader />}><CandidateApplications applications={applications} loading={loading} onRefresh={fetchData} /></Suspense>;
 case 'Interviews':
 return <Suspense fallback={<TabLoader />}><CandidateInterviews interviews={interviews} loading={loading} onConfirm={fetchData} /></Suspense>;
 case 'Skills':
 return <CandidateSkillsVerification assessments={assessments} profileSkills={profileSkills} loading={loading} onRefresh={fetchData} onAddSkill={() => setIsSkillModalOpen(true)} />;
 case 'Career Path':
 return <Suspense fallback={<TabLoader />}><CareerPath careerPath={careerPath} loading={loading} onRefresh={fetchData} /></Suspense>;
 case 'Learning':
 return <Suspense fallback={<TabLoader />}><LearningPaths learningPath={learningPath} loading={loading} onGenerate={handleGenerateLearningPath} onRefresh={fetchData} initialTargetRole={skillToLearn} /></Suspense>;
 case 'Skill Gaps':
 return <Suspense fallback={<TabLoader />}><SkillGapAnalysis loading={loading} onRefresh={fetchData} onNavigateToLearning={handleNavigateToLearning} /></Suspense>;
 case 'Achievements':
 return <Suspense fallback={<TabLoader />}><Leaderboard leaderboardData={leaderboardData} loading={loading} globalData={globalLeaderboardData} userRank={userRank} /></Suspense>;
 case 'Interview Prep':
 return <Suspense fallback={<TabLoader />}><InterviewPrep prepMaterials={prepMaterials} loading={loading} applications={applications} onGenerate={handleGenerateLearningPath} /></Suspense>;
 case 'Salary Coach':
 return <Suspense fallback={<TabLoader />}><SalaryCoach salaryData={salaryData} loading={loading} applications={applications} /></Suspense>;
 case 'Resume Score':
 return <Suspense fallback={<TabLoader />}><ResumeScore resumeData={resumeData} loading={loading} /></Suspense>;
 case 'Location Prefs':
 return <Suspense fallback={<TabLoader />}><LocationPreferences /></Suspense>;
 case 'Profile':
 return <Suspense fallback={<TabLoader />}><ProfileManagement onRefresh={fetchData} /></Suspense>;
 default:
 // Use filteredJobs if search is active, otherwise use discoverJobs
 const jobsToDisplay = (searchQuery || locationFilter) ? filteredJobs : discoverJobs;

 return (
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
 <div className="lg:col-span-2">
 <div className="flex items-center justify-between mb-8">
 <div className="flex items-center gap-3">
 <Target className="w-5 h-5 text-[var(--accent)]" />
 <h2 className="text-lg font-medium">
 {(searchQuery || locationFilter) ? 'Search Results' : `Matches Found for You (${jobsToDisplay.length})`}
 </h2>
 </div>
 </div>

 <div className="space-y-6">
 {loading ? (
 <div className="flex flex-col items-center justify-center py-20 opacity-50">
 <Zap className="w-12 h-12 text-[var(--accent)] animate-pulse mb-4" />
 <p className="text-[11px] font-semibold text-[var(--text-muted)]">Loading…</p>
 </div>
 ) : jobsToDisplay.length === 0 ? (
 <div className="p-12 border-2 border-dashed border-[var(--border-primary)] rounded-[var(--radius-xl)] text-center bg-[var(--bg-accent)]/5">
 <p className="text-xs font-semibold text-[var(--text-muted)] ">
 {(searchQuery || locationFilter)
 ? 'No jobs match your search criteria. Try different keywords.'
 : 'No precision matches found. Expand your skill profile.'}
 </p>
 </div>
 ) : (
 jobsToDisplay.map((job) => {
 const isExpanded = expandedJobId === job.JobID;
 const isApplied = applications.some(app => app.JobID === job.JobID) || appliedJobIds.has(job.JobID);
 return (
 <div key={job.JobID}
 className={`rounded-[var(--radius-xl)] border transition-all cursor-pointer relative overflow-hidden ${isApplied ? 'opacity-60 border-gray-500/20 bg-gray-500/5' : isExpanded ? 'border-[var(--accent)]/30 bg-[var(--accent)]/[0.02]' : 'border-[var(--border-primary)] bg-[var(--bg-accent)] hover:bg-[var(--accent)]/[0.02]'}`}
 onClick={() => setExpandedJobId(isExpanded ? null : job.JobID)}
 >
 <div className={`absolute top-0 right-0 w-1 h-full ${isApplied ? 'bg-gray-400' : 'bg-[var(--accent)]'} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8">
 <div className="flex gap-6">
 <div className="w-16 h-16 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-primary)] flex items-center justify-center font-semibold text-lg text-[var(--text-muted)] group-hover:text-[var(--accent)] shrink-0">
 {(job.JobTitle || job.jobtitle || '??').substring(0, 2).toUpperCase()}
 </div>
 <div>
 <h4 className={`text-lg sm:text-xl font-semibold group-hover:text-[var(--accent)] transition-colors leading-tight ${isApplied ? 'text-[var(--text-muted)]' : ''}`}>{job.JobTitle}</h4>
 <div className="flex items-center gap-3 mt-1 flex-wrap">
 <p className="text-[11px] font-bold text-[var(--accent)]">{job.Location}</p>
 <span className="text-[11px] text-[var(--text-muted)] font-medium opacity-60">• {job.MinExperience}+ Yrs Exp</span>
 </div>
 </div>
 </div>
 <div className="flex items-center gap-8 shrink-0">
 <div className="flex gap-2">
 {job.MatchedSkillsCount > 0 && (
 <span className="px-3 py-1 bg-[var(--success)]/10 border border-emerald-500/20 rounded-lg text-[11px] font-semibold text-[var(--success)]">
 {job.MatchedSkillsCount} Skill Matches
 </span>
 )}
 <span className={`px-3 py-1 rounded-lg text-[11px] font-medium ${isApplied ? 'bg-gray-500/10 border border-gray-500/20 text-[var(--text-muted)]' : 'bg-[var(--bg-primary)] border border-[var(--border-primary)] text-[var(--text-muted)]'}`}>{isApplied ? 'Applied' : 'Active'}</span>
 </div>
 <div className="text-right flex flex-col items-end gap-3">
 <div className="flex flex-col items-end">
 <div className="flex items-center gap-2">
 <span className="text-xl sm:text-2xl font-semibold">
 {job.MatchedSkillsCount > 0 ? Math.min(100, Math.round((job.MatchedSkillsCount / 3) * 100)) : '0'}%
 </span>
 </div>
 <div className="text-[11px] font-semibold text-[var(--text-muted)] opacity-40">Precision</div>
 </div>
 {isApplied ? (
 <button
 disabled
 className="px-6 py-2 bg-gray-400 text-white rounded-xl font-semibold text-[11px] cursor-not-allowed"
 >
 Applied
 </button>
 ) : (
 <button
 onClick={(e) => {
 e.stopPropagation();
 handleApply(job.JobID);
 }}
 className="px-6 py-2 bg-[var(--accent)] text-white rounded-xl font-semibold text-[11px] hover:bg-[var(--accent-hover)] transition-all shadow-lg shadow-[var(--shadow-md)]"
 >
 Apply Now
 </button>
 )}
 </div>
 <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[var(--text-muted)] transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>
 <ChevronRight size={16} />
 </div>
 </div>
 </div>

 {/* Expanded Job Detail Panel */}
 {isExpanded && (
 <div className="px-8 pb-8 space-y-6 border-t border-[var(--accent)]/10 pt-6 animate-in slide-in-from-top-2 duration-200">
 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
 {job.MinExperience !== undefined && (
 <div className="p-4 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-primary)]">
 <p className="text-[11px] font-medium text-[var(--text-muted)] mb-1">Min. Experience</p>
 <p className="text-sm font-semibold">{job.MinExperience} yr{job.MinExperience !== 1 ? 's' : ''}</p>
 </div>
 )}
 {job.Vacancies !== undefined && (
 <div className="p-4 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-primary)]">
 <p className="text-[11px] font-medium text-[var(--text-muted)] mb-1">Openings</p>
 <p className="text-sm font-semibold">{job.Vacancies}</p>
 </div>
 )}
 {(job.SalaryMin || job.SalaryMax) && (
 <div className="p-4 bg-[var(--success)]/5 rounded-2xl border border-emerald-500/10">
 <p className="text-[11px] font-medium text-[var(--success)] mb-1">Salary Range</p>
 <p className="text-sm font-semibold text-[var(--success)]">
 ${job.SalaryMin ? job.SalaryMin.toLocaleString() : '?'} - ${job.SalaryMax ? job.SalaryMax.toLocaleString() : '?'}
 </p>
 </div>
 )}
 </div>

 {/* Required Skills Section */}
 {job.RequiredSkills && (job.RequiredSkills.mandatory.length > 0 || job.RequiredSkills.optional.length > 0) && (
 <div className="space-y-4">
 <p className="text-[11px] font-medium text-[var(--text-muted)]">Required Skills</p>

 {/* Mandatory Skills */}
 {job.RequiredSkills.mandatory.length > 0 && (
 <div>
 <p className="text-[11px] font-semibold text-[var(--danger)] mb-2">Mandatory</p>
 <div className="flex flex-wrap gap-2">
 {(job?.RequiredSkills?.mandatory || []).map((skill, idx) => (
 <span
 key={`mandatory-${idx}`}
 className={`px-3 py-1.5 rounded-lg text-[11px] font-medium flex items-center gap-1.5 ${skill.MeetsRequirement
 ? 'bg-[var(--success)]/10 text-[var(--success)] border border-emerald-500/20'
 : skill.HasSkill
 ? 'bg-[var(--warning)]/10 text-[var(--warning)] border border-amber-500/20'
 : 'bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/20'
 }`}
 >
 {skill.MeetsRequirement && <span className="text-[11px]">✓</span>}
 {skill.HasSkill && !skill.MeetsRequirement && <span className="text-[11px]">⚠</span>}
 {skill.SkillName}
 <span className="text-[11px] opacity-60">
 {skill.HasSkill ? `L${skill.CandidateProficiencyLevel}` : `L${skill.MinProficiency}`}
 </span>
 </span>
 ))}
 </div>
 </div>
 )}

 {/* Optional Skills */}
 {job.RequiredSkills.optional.length > 0 && (
 <div>
 <p className="text-[11px] font-semibold text-[var(--warning)] mb-2">Preferred</p>
 <div className="flex flex-wrap gap-2">
 {(job?.RequiredSkills?.optional || []).map((skill, idx) => (
 <span
 key={`optional-${idx}`}
 className={`px-3 py-1.5 rounded-lg text-[11px] font-medium flex items-center gap-1.5 ${skill.MeetsRequirement
 ? 'bg-[var(--success)]/10 text-[var(--success)] border border-emerald-500/20'
 : skill.HasSkill
 ? 'bg-[var(--warning)]/10 text-[var(--warning)] border border-amber-500/20'
 : 'bg-[var(--warning)]/10 text-[var(--warning)] border border-amber-500/20'
 }`}
 >
 {skill.MeetsRequirement && <span className="text-[11px]">✓</span>}
 {skill.HasSkill && !skill.MeetsRequirement && <span className="text-[11px]">⚠</span>}
 {skill.SkillName}
 <span className="text-[11px] opacity-60">
 {skill.HasSkill ? `L${skill.CandidateProficiencyLevel}` : `L${skill.MinProficiency}`}
 </span>
 </span>
 ))}
 </div>
 </div>
 )}
 </div>
 )}

 {job.Description && (
 <div className="p-5 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-primary)]">
 <p className="text-[11px] font-medium text-[var(--text-muted)] mb-3">Job Description</p>
 <p className="text-xs leading-relaxed text-[var(--text-secondary)] line-clamp-6">{job.Description}</p>
 </div>
 )}
 </div>
 )}
 </div>
 );
 })
 )}
 </div>
 </div>

 <div className="space-y-5 sm:space-y-8">
 <div className="glass-card rounded-[var(--radius-xl)] p-10 relative isolate overflow-hidden">
 <div className="flex items-center justify-between mb-10">
 <h3 className="text-[11px] font-medium uppercase tracking-[0.25em] text-[var(--text-muted)]">Profile Pulse</h3>
 <Zap className="w-4 h-4 text-[var(--accent)] fill-current" />
 </div>

 <div className="relative w-36 h-36 mx-auto mb-10">
 <svg className="w-full h-full rotate-[-90deg]">
 <circle cx="72" cy="72" r="64" className="stroke-[var(--bg-accent)] fill-none stroke-[10]" />
 <circle cx="72" cy="72" r="64" className="stroke-indigo-600 fill-none stroke-[10] transition-all" style={{ strokeDasharray: '402', strokeDashoffset: '100' }} />
 </svg>
 <div className="absolute inset-0 flex flex-col items-center justify-center">
 <span className="text-2xl sm:text-3xl font-semibold">75%</span>
 <span className="text-[11px] text-[var(--text-muted)] uppercase font-semibold tracking-[0.15em] opacity-60">Score</span>
 </div>
 </div>

 <p className="text-center text-[var(--text-muted)] text-xs font-medium leading-relaxed mb-8 px-4 opacity-70">
 Your SQL Schema knowledge is trending. Update your profile to hit 90%.
 </p>

 <button
 onClick={() => setIsSkillModalOpen(true)}
 className="w-full py-4 bg-[var(--accent)] text-white rounded-2xl font-semibold text-[11px] hover:bg-[var(--accent-hover)] transition-all"
 >
 Manage Skills
 </button>
 </div>

 <div className="bg-[var(--bg-accent)] rounded-[var(--radius-xl)] p-10 border border-[var(--border-primary)] relative overflow-hidden group transition-colors">
 <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
 <Star className="w-24 h-24" />
 </div>
 <h3 className="text-[11px] font-semibold text-[var(--text-muted)] mb-6">Expert Tips</h3>
 <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-bold italic opacity-80">
 "Candidates with T-SQL experience are seeing 40% higher match rates today."
 </p>
 </div>
 </div>
 </div>
 );
 }
 };

 return (
 <DashboardShell
 title={activeTab === 'Discover Jobs' ? "Algorithmically Matched" : activeTab}
 subtitle="Candidate portal"
 navigation={candidateNav}
 onNotificationClick={() => setShowNotifications(true)}
 onProfileClick={() => setActiveTab('Profile')}
 >
 {activeTab === 'Discover Jobs' && (
 <div className="space-y-5 sm:space-y-8">
 {/* Header */}
 <div className="flex items-center gap-3">
 <Briefcase className="w-5 h-5 text-[var(--accent)]" />
 <h2 className="text-lg font-medium">Discover Jobs</h2>
 </div>

 {/* Search Bar */}
 <div className="relative isolate p-8 rounded-[var(--radius-xl)] bg-[var(--bg-secondary)] border border-[var(--border-primary)] overflow-hidden shadow-3xl">
 <div className="flex flex-col lg:flex-row gap-4 p-3 bg-[var(--bg-primary)]/50 backdrop-blur-xl border border-[var(--border-primary)] rounded-[var(--radius-xl)]">
 <div className="flex-1 relative group">
 <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-5 h-5" />
 <input
 type="text"
 placeholder="Project Architect, SQL dev, or skills..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 onKeyDown={handleSearchKeyDown}
 className="w-full bg-[var(--bg-accent)] border-transparent text-[var(--text-primary)] rounded-2xl py-4 pl-14 pr-4 focus:bg-[var(--surface-hover)] focus:bg-[var(--surface-hover)] outline-none transition-all placeholder:text-[var(--text-muted)] font-bold text-sm"
 />
 </div>
 <div className="lg:w-64 relative group">
 <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-5 h-5" />
 <input
 type="text"
 placeholder="US / Remote"
 value={locationFilter}
 onChange={(e) => setLocationFilter(e.target.value)}
 onKeyDown={handleSearchKeyDown}
 className="w-full bg-[var(--bg-accent)] border-transparent text-[var(--text-primary)] rounded-2xl py-4 pl-14 pr-4 focus:bg-[var(--surface-hover)] focus:bg-[var(--surface-hover)] outline-none transition-all placeholder:text-[var(--text-muted)] font-bold text-sm"
 />
 </div>
 <button
 onClick={handleSearch}
 className="bg-[var(--accent)] text-white px-10 py-4 rounded-2xl font-semibold text-xs hover:bg-[var(--accent-hover)] transition-all flex items-center justify-center gap-2"
 >
 <Search size={16} />
 Query Jobs
 </button>
 {(searchQuery || locationFilter) && (
 <button
 onClick={() => {
 setSearchQuery('');
 setLocationFilter('');
 setFilteredJobs(discoverJobs);
 }}
 className="px-6 py-4 rounded-2xl font-semibold text-xs border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-accent)] transition-all"
 >
 Clear
 </button>
 )}
 </div>

 {/* Search Results Count */}
 {(searchQuery || locationFilter) && (
 <div className="mt-4 text-sm text-[var(--text-muted)]">
 Showing {filteredJobs.length} of {discoverJobs.length} jobs
 {searchQuery && <span className="ml-2">for "<span className="text-[var(--accent)] font-bold">{searchQuery}</span>"</span>}
 {locationFilter && <span className="ml-2">in "<span className="text-[var(--accent)] font-bold">{locationFilter}</span>"</span>}
 </div>
 )}
 </div>
 </div>
 )}

 <div key={activeTab} className="reveal-up">
 {renderMainContent()}
 </div>

 <SkillManagementModal
 isOpen={isSkillModalOpen}
 onClose={() => setIsSkillModalOpen(false)}
 onRefresh={fetchData}
 currentSkills={profileSkills}
 />

 {/* Notifications Modal */}
 {showNotifications && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
 <div
 className="absolute inset-0 bg-black/60 backdrop-blur-sm"
 onClick={() => setShowNotifications(false)}
 />
 <div className="relative w-full max-w-lg max-h-[80vh] overflow-hidden bg-[var(--bg-primary)] rounded-[var(--radius-xl)] border border-[var(--border-primary)] shadow-[var(--shadow-lg)] animate-in zoom-in-95 duration-200">
 <div className="flex items-center justify-between p-6 border-b border-[var(--border-primary)]">
 <h2 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)]">Notifications</h2>
 <button
 onClick={() => setShowNotifications(false)}
 className="w-12 h-12 rounded-xl bg-[var(--bg-accent)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
 >
 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
 </svg>
 </button>
 </div>
 <div className="overflow-y-auto max-h-[calc(80vh-80px)]">
 <PushNotifications
 loading={loading}
 onRefresh={fetchData}
 showHeader={false}
 />
 </div>
 </div>
 </div>
 )}
 </DashboardShell>
 );
};

export default CandidateDashboard;
