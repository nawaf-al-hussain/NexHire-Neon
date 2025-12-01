import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
 X, ArrowRight, CheckCircle2, XCircle, Clock, User, Briefcase,
 ShieldCheck, Loader2, Calendar, ChevronLeft, Search,
 LayoutGrid, TrendingUp, MoreHorizontal, List, ArrowUp, ArrowDown,
 MapPin, Users
} from 'lucide-react';
import { formatNumber } from '../../utils/format';
import API_BASE from '../../apiConfig';
import ScheduleInterviewModal from './ScheduleInterviewModal';
import RejectionReasonModal from './RejectionReasonModal';
import CandidateProfileModal from '../Recruiters/CandidateProfileModal';
import { useToast } from '../../components/ui/Toast';

const ApplicationPipeline = ({ job, isOpen, onClose }) => {
    const { toast } = useToast();
 const [applications, setApplications] = useState([]);
 const [loading, setLoading] = useState(true);
 const [actionLoading, setActionLoading] = useState(null);
 const [schedulingApp, setSchedulingApp] = useState(null);
 const [rejectingApp, setRejectingApp] = useState(null);
 const [viewingProfile, setViewingProfile] = useState(null);
 const [searchQuery, setSearchQuery] = useState('');
 const [viewMode, setViewMode] = useState('kanban');
 const [sortBy, setSortBy] = useState('matchScore');
 const [sortOrder, setSortOrder] = useState('desc');

 // Kanban stages (without Rejected - shown separately below)
 const stages = [
 { id: 1, name: 'Applied', icon: Clock, color: 'text-[var(--text-muted)]', bgColor: 'bg-[var(--bg-tertiary)]' },
 { id: 2, name: 'Screening', icon: Briefcase, color: 'text-[var(--accent)]', bgColor: 'bg-[var(--accent)]/10' },
 { id: 3, name: 'Interview', icon: User, color: 'text-[var(--warning)]', bgColor: 'bg-[var(--warning)]/10' },
 { id: 4, name: 'Hired', icon: CheckCircle2, color: 'text-[var(--success)]', bgColor: 'bg-[var(--success)]/10' }
 ];

 useEffect(() => {
 if (isOpen && job) {
 fetchApplications();
 }
 }, [isOpen, job]);

 const fetchApplications = async () => {
 setLoading(true);
 try {
 const res = await axios.get(`${API_BASE}/jobs/${job.JobID}/applications`);
 setApplications(res.data);
 } catch (err) {
 console.error("Fetch Applications Error:", err);
 } finally {
 setLoading(false);
 }
 };

 const handleUpdateStatus = async (applicationID, newStatusID, rejectionReason = null) => {
 setActionLoading(applicationID);
 try {
 if (newStatusID === 4) {
 await axios.post(`${API_BASE}/applications/${applicationID}/hire`);
 } else {
 await axios.put(`${API_BASE}/applications/${applicationID}/status`, {
 statusID: newStatusID,
 rejectionReason: rejectionReason
 });
 }
 await fetchApplications();
 } catch (err) {
 toast(err.response?.data?.error || "Status update failed.", { type: 'error' });
 } finally {
 setActionLoading(null);
 }
 };

 const handleReject = async (reason) => {
 if (!rejectingApp) return;
 await handleUpdateStatus(rejectingApp.ApplicationID, 5, reason);
 setRejectingApp(null);
 };

 const stats = useMemo(() => {
 const total = applications.length;
 const byStage = stages.reduce((acc, stage) => {
 acc[stage.id] = applications.filter(app => app.StatusID === stage.id).length;
 return acc;
 }, {});
 // Add rejected count
 byStage[5] = applications.filter(app => app.StatusID === 5).length;

 const applied = byStage[1] || 0;
 const screening = byStage[2] || 0;
 const interview = byStage[3] || 0;
 const hired = byStage[4] || 0;

 const screeningRate = applied > 0 ? Math.round((screening / applied) * 100) : 0;
 const interviewRate = screening > 0 ? Math.round((interview / screening) * 100) : 0;
 const hireRate = interview > 0 ? Math.round((hired / interview) * 100) : 0;
 const overallRate = applied > 0 ? Math.round((hired / applied) * 100) : 0;

 return { total, byStage, screeningRate, interviewRate, hireRate, overallRate };
 }, [applications]);

 const filteredApplications = useMemo(() => {
 let result = applications;

 if (searchQuery.trim()) {
 const query = searchQuery.toLowerCase();
 result = result.filter(app =>
 app.FullName?.toLowerCase().includes(query) ||
 app.CandidateLocation?.toLowerCase().includes(query)
 );
 }

 result = [...result].sort((a, b) => {
 let aVal, bVal;
 switch (sortBy) {
 case 'name':
 aVal = (a.FullName || '').toLowerCase();
 bVal = (b.FullName || '').toLowerCase();
 return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
 case 'matchScore':
 aVal = a.MatchScore || 0;
 bVal = b.MatchScore || 0;
 return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
 case 'appliedDate':
 aVal = new Date(a.AppliedDate || 0).getTime();
 bVal = new Date(b.AppliedDate || 0).getTime();
 return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
 default:
 return 0;
 }
 });

 return result;
 }, [applications, searchQuery, sortBy, sortOrder]);

 const getMatchScoreDisplay = (score) => {
 if (!score && score !== 0) return { text: 'N/A', color: 'text-[var(--text-muted)] bg-[var(--bg-tertiary)] border-slate-500/20', percent: 0 };
 if (score >= 80) return { text: `${score}%`, color: 'text-[var(--success)] bg-[var(--success)]/10 border-emerald-500/20', percent: score };
 if (score >= 60) return { text: `${score}%`, color: 'text-[var(--warning)] bg-[var(--warning)]/10 border-amber-500/20', percent: score };
 return { text: `${score}%`, color: 'text-[var(--danger)] bg-[var(--danger)]/10 border-[var(--danger)]/20', percent: score };
 };

 const toggleSort = (field) => {
 if (sortBy === field) {
 setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
 } else {
 setSortBy(field);
 setSortOrder('desc');
 }
 };

 const getStageName = (statusId) => {
 const stage = stages.find(s => s.id === statusId);
 if (statusId === 5) return 'Rejected';
 return stage ? stage.name : 'Unknown';
 };

 const getStatusBadgeColor = (statusId) => {
 switch (statusId) {
 case 1: return 'text-[var(--text-muted)] bg-[var(--bg-tertiary)] border-slate-500/20';
 case 2: return 'text-[var(--accent)] bg-[var(--accent)]/10 border-[var(--accent)]';
 case 3: return 'text-[var(--warning)] bg-[var(--warning)]/10 border-amber-500/20';
 case 4: return 'text-[var(--success)] bg-[var(--success)]/10 border-emerald-500/20';
 case 5: return 'text-[var(--danger)] bg-[var(--danger)]/10 border-[var(--danger)]/20';
 default: return 'text-[var(--text-muted)] bg-[var(--bg-tertiary)] border-slate-500/20';
 }
 };

 if (!isOpen) return null;

 const rejectedApps = filteredApplications.filter(app => app.StatusID === 5);

 return (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300">
 <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

 <div className="relative bg-[var(--bg-secondary)] border border-[var(--border-primary)] w-full max-w-[1600px] h-[90vh] rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] flex flex-col overflow-hidden animate-in zoom-in duration-300 text-[var(--text-primary)]">

 <div className="h-16 flex items-center justify-between px-6 bg-[var(--bg-accent)] border-b border-[var(--border-primary)]">
 <div className="flex items-center gap-4">
 <button onClick={onClose} className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all">
 <ChevronLeft size={20} />
 </button>
 <div>
 <h2 className="text-lg font-medium">{job?.JobTitle}</h2>
 <div className="flex flex-wrap items-center gap-4 mt-2">
 <div className="flex items-center gap-2 text-[var(--text-muted)]">
 <MapPin size={14} className="text-[var(--accent)]/50" />
 <span className="text-[11px] font-bold">{job?.Location}</span>
 </div>
 <div className="flex items-center gap-2 text-[var(--text-muted)]">
 <Users size={14} className="text-[var(--accent)]/50" />
 <span className="text-[11px] font-bold">{job?.Vacancies || 0} Openings</span>
 </div>
 <div className="flex items-center gap-2 text-[var(--text-muted)]">
 <Calendar size={14} className="text-[var(--accent)]/50" />
 <span className="text-[11px] font-bold">EXP: {job?.MinExperience || 0}+ YRS</span>
 </div>
 </div>
 </div>
 </div>

 <div className="flex-1 max-w-md mx-8">
 <div className="relative">
 <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
 <input type="text" placeholder="Search candidates..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl pl-10 pr-4 py-2.5 text-sm font-bold focus:outline-none focus:border-[var(--accent)] placeholder:text-[var(--text-muted)]" />
 </div>
 </div>

 <div className="flex items-center gap-3">
 <div className="flex items-center gap-1 px-4 py-2 bg-[var(--success)]/10 border border-emerald-500/20 rounded-xl">
 <ShieldCheck size={14} className="text-[var(--success)]" />
 <span className="text-[11px] font-medium text-[var(--success)]">{job?.Vacancies || 0} Open</span>
 </div>

 <div className="flex items-center gap-1 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-1">
 <button onClick={() => setViewMode('kanban')} className={`p-2 rounded-lg transition-all ${viewMode === 'kanban' ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-muted)] hover:text-[var(--accent)]'}`} title="Kanban View">
 <LayoutGrid size={16} />
 </button>
 <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-muted)] hover:text-[var(--accent)]'}`} title="List View">
 <List size={16} />
 </button>
 </div>
 </div>
 </div>

 <div className="flex-1 flex overflow-hidden">
 {viewMode === 'kanban' && (
 <div className="w-[280px] bg-[var(--bg-accent)] border-r border-[var(--border-primary)] p-4 flex flex-col gap-4 overflow-y-auto">
 <div className="glass-card rounded-[var(--radius-xl)] p-5 border border-[var(--accent)]">
 <div className="flex items-center gap-2 mb-3">
 <TrendingUp size={16} className="text-[var(--accent)]" />
 <span className="text-[11px] font-medium text-[var(--accent)]">Pipeline Health</span>
 </div>
 <div className="flex items-center justify-between">
 <div>
 <p className="text-2xl sm:text-3xl font-semibold">{formatNumber(stats.overallRate)}%</p>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Overall Conversion</p>
 </div>
 <div className="w-12 h-12 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center">
 <TrendingUp className="text-[var(--accent)]" size={24} />
 </div>
 </div>
 </div>

 <div className="glass-card rounded-[var(--radius-xl)] p-5">
 <h3 className="text-[11px] font-medium text-[var(--text-muted)] mb-4">By Stage</h3>
 <div className="space-y-2">
 {stages.map(stage => (
 <div key={stage.id} className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-xl hover:bg-[var(--accent)]/5 transition-colors cursor-pointer">
 <div className="flex items-center gap-3">
 <div className={`w-2 h-2 rounded-full ${stage.color.replace('text-', 'bg-')}`} />
 <span className="text-xs font-bold">{stage.name}</span>
 </div>
 <span className="text-[11px] font-semibold bg-[var(--bg-accent)] px-3 py-1 rounded-full">{stats.byStage[stage.id] || 0}</span>
 </div>
 ))}
 {/* Rejected in sidebar */}
 <div className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-xl hover:bg-[var(--danger)]/5 transition-colors cursor-pointer">
 <div className="flex items-center gap-3">
 <div className="w-2 h-2 rounded-full bg-[var(--danger)]" />
 <span className="text-xs font-bold text-[var(--danger)]">Rejected</span>
 </div>
 <span className="text-[11px] font-semibold bg-[var(--bg-accent)] px-3 py-1 rounded-full">{stats.byStage[5] || 0}</span>
 </div>
 </div>
 </div>

 <div className="glass-card rounded-[var(--radius-xl)] p-5">
 <h3 className="text-[11px] font-medium text-[var(--text-muted)] mb-4">Quick Filters</h3>
 <div className="flex flex-wrap gap-2">
 <button className="px-3 py-1.5 rounded-full text-[11px] font-medium bg-[var(--accent)] text-white">High Match (80%+)</button>
 <button className="px-3 py-1.5 rounded-full text-[11px] font-medium bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-[var(--accent)] transition-all">New Today</button>
 </div>
 </div>

 <div className="mt-auto pt-4 border-t border-[var(--border-primary)]">
 <div className="flex items-center justify-between">
 <span className="text-[11px] font-bold text-[var(--text-muted)]">Total Candidates</span>
 <span className="text-lg font-semibold text-[var(--accent)]">{stats.total}</span>
 </div>
 </div>
 </div>
 )}

 <div className="flex-1 overflow-hidden flex flex-col">
 {viewMode === 'kanban' ? (
 <div className="flex-1 flex gap-4 p-4 overflow-x-auto bg-[var(--bg-secondary)]">
 {stages.map(stage => {
 const stageApps = filteredApplications.filter(app => app.StatusID === stage.id);
 return (
 <div key={stage.id} className="min-w-[280px] max-w-[320px] flex flex-col">
 <div className="flex items-center justify-between p-4 bg-[var(--bg-accent)] rounded-t-2xl border-x border-t border-[var(--border-primary)]">
 <div className="flex items-center gap-3">
 <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stage.bgColor}`}>
 <stage.icon size={18} className={stage.color} />
 </div>
 <div>
 <h3 className="text-sm font-medium">{stage.name}</h3>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">{stageApps.length} candidates</p>
 </div>
 </div>
 <button className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--accent)] transition-all">
 <MoreHorizontal size={16} />
 </button>
 </div>

 <div className="flex-1 p-3 bg-[var(--bg-secondary)] border-x border-b border-[var(--border-primary)] rounded-b-2xl overflow-y-auto min-h-[400px]">
 {loading ? (
 <div className="flex flex-col items-center justify-center py-20">
 <Loader2 className="w-10 h-10 text-[var(--accent)] animate-spin mb-3" />
 <p className="text-[11px] font-semibold text-[var(--text-muted)]">Loading...</p>
 </div>
 ) : stageApps.length === 0 ? (
 <div className="p-8 border-2 border-dashed border-[var(--border-primary)] rounded-[var(--radius-xl)] text-center bg-[var(--bg-accent)]/5">
 <Briefcase className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3 opacity-20" />
 <p className="text-[11px] font-semibold text-[var(--text-muted)] opacity-40">Empty Stage</p>
 </div>
 ) : (
 stageApps.map(app => (
 <div key={app.ApplicationID} className="glass-card rounded-[var(--radius-xl)] p-5 mb-3 hover:border-[var(--accent)] transition-all group cursor-pointer" onClick={() => setViewingProfile({ candidateId: app.CandidateID, name: app.FullName })}>
 <div className="flex items-start justify-between mb-4">
 <div className="flex items-center gap-3">
 <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] shadow-lg shadow-[var(--shadow-md)]">
 <User size={24} />
 </div>
 <div>
 <h4 className="text-sm font-semibold">{app.FullName}</h4>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">{app.ExperienceLabel || 'Mid-Level'} • {app.CandidateLocation}</p>
 </div>
 </div>
 </div>

 <div className="mb-4">
 <div className="flex items-center justify-between mb-1">
 <span className="text-[11px] font-bold text-[var(--text-muted)]">Match Score</span>
 <span className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold border ${getMatchScoreDisplay(app.MatchScore).color}`}>{getMatchScoreDisplay(app.MatchScore).text}</span>
 </div>
 <div className="h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
 <div className="h-full bg-[var(--accent)] rounded-full transition-all" style={{ width: `${getMatchScoreDisplay(app.MatchScore).percent}%` }} />
 </div>
 </div>

 <div className="flex items-center justify-between pt-3 border-t border-[var(--border-primary)]">
 <div className="text-[11px] font-bold text-[var(--text-muted)]">Applied {new Date(app.AppliedDate).toLocaleDateString()}</div>

 {actionLoading === app.ApplicationID ? (
 <Loader2 size={14} className="text-[var(--accent)] animate-spin" />
 ) : (
 <div className="flex items-center gap-2">
 {stage.id < 4 && (
 <button onClick={(e) => { e.stopPropagation(); handleUpdateStatus(app.ApplicationID, stage.id + 1); }} className="w-8 h-8 rounded-xl bg-[var(--accent)] flex items-center justify-center text-white hover:bg-[var(--accent-hover)] transition-all shadow-lg shadow-[var(--shadow-md)]" title="Advance to Next Stage">
 <ArrowRight size={14} />
 </button>
 )}
 {stage.id === 3 && (
 <>
 <button onClick={(e) => { e.stopPropagation(); setSchedulingApp(app); }} className="w-8 h-8 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--warning)] hover:bg-[var(--warning)]/10 transition-all" title="Schedule Interview">
 <Calendar size={14} />
 </button>
 <button onClick={(e) => { e.stopPropagation(); handleUpdateStatus(app.ApplicationID, 4); }} className="px-3 py-1.5 bg-[var(--success)] text-white text-[11px] font-medium rounded-xl hover:bg-[var(--success)] transition-all shadow-lg">Hire</button>
 </>
 )}
 {stage.id < 4 && (
 <button onClick={(e) => { e.stopPropagation(); setRejectingApp(app); }} className="w-8 h-8 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-all" title="Reject">
 <XCircle size={14} />
 </button>
 )}
 </div>
 )}
 </div>
 </div>
 ))
 )}
 </div>
 </div>
 );
 })}
 </div>
 ) : (
 <div className="flex-1 p-4 overflow-auto bg-[var(--bg-secondary)]">
 <div className="glass-card rounded-[var(--radius-xl)] overflow-hidden">
 <div className="grid grid-cols-12 gap-4 p-4 bg-[var(--bg-accent)] border-b border-[var(--border-primary)] text-[11px] font-medium text-[var(--text-muted)]">
 <div className="col-span-3 cursor-pointer hover:text-[var(--accent)]" onClick={() => toggleSort('name')}>
 <div className="flex items-center gap-1">Candidate {sortBy === 'name' && (sortOrder === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}</div>
 </div>
 <div className="col-span-2">Status</div>
 <div className="col-span-2 cursor-pointer hover:text-[var(--accent)]" onClick={() => toggleSort('matchScore')}>
 <div className="flex items-center gap-1">Match Score {sortBy === 'matchScore' && (sortOrder === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}</div>
 </div>
 <div className="col-span-2">Location</div>
 <div className="col-span-2 cursor-pointer hover:text-[var(--accent)]" onClick={() => toggleSort('appliedDate')}>
 <div className="flex items-center gap-1">Applied {sortBy === 'appliedDate' && (sortOrder === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}</div>
 </div>
 <div className="col-span-1 text-right">Actions</div>
 </div>

 <div className="divide-y divide-[var(--border-primary)]">
 {loading ? (
 <div className="flex items-center justify-center py-20">
 <Loader2 className="w-10 h-10 text-[var(--accent)] animate-spin" />
 </div>
 ) : filteredApplications.length === 0 ? (
 <div className="p-12 text-center">
 <List className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3 opacity-20" />
 <p className="text-[11px] font-semibold text-[var(--text-muted)] opacity-40">No candidates found</p>
 </div>
 ) : (
 filteredApplications.map(app => (
 <div key={app.ApplicationID} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-[var(--accent)]/5 transition-colors">
 <div className="col-span-3 flex items-center gap-3 cursor-pointer" onClick={() => setViewingProfile({ candidateId: app.CandidateID, name: app.FullName })}>
 <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
 <User size={18} />
 </div>
 <div>
 <p className="text-sm font-semibold">{app.FullName}</p>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">{app.ExperienceLabel || 'Mid-Level'}</p>
 </div>
 </div>
 <div className="col-span-2">
 <span className={`px-3 py-1 rounded-full text-[11px] font-semibold border ${getStatusBadgeColor(app.StatusID)}`}>{getStageName(app.StatusID)}</span>
 </div>
 <div className="col-span-2">
 <div className="flex items-center gap-2">
 <div className="flex-1 h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
 <div className="h-full bg-[var(--accent)] rounded-full" style={{ width: `${getMatchScoreDisplay(app.MatchScore).percent}%` }} />
 </div>
 <span className={`text-[11px] font-semibold ${getMatchScoreDisplay(app.MatchScore).percent >= 80 ? 'text-[var(--success)]' : getMatchScoreDisplay(app.MatchScore).percent >= 60 ? 'text-[var(--warning)]' : 'text-[var(--danger)]'}`}>{getMatchScoreDisplay(app.MatchScore).text}</span>
 </div>
 </div>
 <div className="col-span-2 text-sm font-bold text-[var(--text-secondary)]">{app.CandidateLocation || 'N/A'}</div>
 <div className="col-span-2 text-[11px] font-bold text-[var(--text-muted)]">{new Date(app.AppliedDate).toLocaleDateString()}</div>
 <div className="col-span-1 flex items-center justify-end">
 {actionLoading === app.ApplicationID ? (
 <Loader2 size={14} className="text-[var(--accent)] animate-spin" />
 ) : app.StatusID < 4 ? (
 <button
 onClick={(e) => { e.stopPropagation(); app.StatusID === 3 ? setSchedulingApp(app) : handleUpdateStatus(app.ApplicationID, app.StatusID + 1); }}
 className="px-4 py-2 bg-[var(--accent)] text-white text-xs font-semibold rounded-xl hover:bg-[var(--accent-hover)] transition-all"
 >
 {app.StatusID === 3 ? 'Schedule' : 'Advance →'}
 </button>
 ) : (
 <span className="text-xs font-semibold text-[var(--text-muted)]">{app.StatusID === 4 ? 'Hired' : 'Rejected'}</span>
 )}
 </div>
 </div>
 ))
 )}
 </div>
 </div>
 </div>
 )}
 </div>
 </div>

 <div className="h-12 bg-[var(--bg-accent)] border-t border-[var(--border-primary)] px-6 flex items-center justify-between">
 <div className="flex items-center gap-6">
 <div className="flex items-center gap-2">
 <span className="text-[11px] font-semibold uppercase text-[var(--text-muted)]">Applied → Screening</span>
 <span className="text-sm font-bold text-[var(--accent)]">{formatNumber(stats.screeningRate)}%</span>
 </div>
 <div className="flex items-center gap-2">
 <span className="text-[11px] font-semibold uppercase text-[var(--text-muted)]">Screening → Interview</span>
 <span className="text-sm font-bold text-[var(--accent)]">{formatNumber(stats.interviewRate)}%</span>
 </div>
 <div className="flex items-center gap-2">
 <span className="text-[11px] font-semibold uppercase text-[var(--text-muted)]">Interview → Hired</span>
 <span className="text-sm font-bold text-[var(--success)]">{formatNumber(stats.hireRate)}%</span>
 </div>
 </div>
 <div className="text-[11px] font-semibold text-[var(--text-muted)] opacity-30">NexHire Pipeline v2.0</div>
 </div>
 </div>

 {schedulingApp && (
 <ScheduleInterviewModal isOpen={!!schedulingApp} onClose={() => setSchedulingApp(null)} application={schedulingApp} onScheduled={() => fetchApplications()} />
 )}

 {rejectingApp && (
 <RejectionReasonModal isOpen={!!rejectingApp} onClose={() => setRejectingApp(null)} onConfirm={handleReject} candidateName={rejectingApp.FullName} />
 )}

 {viewingProfile && (
 <CandidateProfileModal
 isOpen={!!viewingProfile}
 onClose={() => setViewingProfile(null)}
 candidateId={viewingProfile.candidateId}
 candidateName={viewingProfile.name}
 />
 )}
 </div>
 );
};

export default ApplicationPipeline;
