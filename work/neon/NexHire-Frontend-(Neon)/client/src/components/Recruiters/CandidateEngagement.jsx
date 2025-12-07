import React from 'react';
import { Users, TrendingUp, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../../apiConfig';

const CandidateEngagement = ({ loading, onRefresh }) => {
 const [engagementData, setEngagementData] = React.useState([]);
 const [loadingData, setLoadingData] = React.useState(true);

 React.useEffect(() => {
 fetchEngagement();
 }, []);

 const fetchEngagement = async () => {
 try {
 setLoadingData(true);
 const res = await axios.get(`${API_BASE}/recruiters/engagement`);
 setEngagementData(res.data);
 } catch (err) {
 console.error("Engagement Fetch Error:", err);
 } finally {
 setLoadingData(false);
 }
 };

 const getEngagementColor = (rate) => {
 if (rate >= 80) return 'text-[var(--success)]';
 if (rate >= 50) return 'text-[var(--warning)]';
 return 'text-[var(--danger)]';
 };

 const getEngagementBadge = (rate) => {
 if (rate >= 80) return { bg: 'bg-[var(--success)]/10', border: 'border-emerald-500/20', label: 'High' };
 if (rate >= 50) return { bg: 'bg-[var(--warning)]/10', border: 'border-amber-500/20', label: 'Medium' };
 return { bg: 'bg-[var(--danger)]/10', border: 'border-[var(--danger)]/20', label: 'Low' };
 };

 if (loadingData) {
 return (
 <div className="flex flex-col items-center justify-center py-20">
 <Loader2 className="w-12 h-12 text-[var(--accent)] animate-spin mb-4" />
 <p className="text-[11px] font-semibold text-[var(--text-muted)]">Loading Engagement Data...</p>
 </div>
 );
 }

 return (
 <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
 {/* Gradient Header */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8 border border-emerald-500/20">
 <div className="flex items-center gap-4">
 <div className="w-14 h-14 rounded-2xl bg-[var(--success)]/10 flex items-center justify-center text-[var(--success)]">
 <Users size={28} />
 </div>
 <div>
 <h2 className="text-lg sm:text-xl font-medium">Candidate Engagement</h2>
 <p className="text-[11px] font-medium text-[var(--text-muted)]">Track candidate interactions</p>
 </div>
 </div>
 </div>

 {/* Summary Cards */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-[var(--accent)]">
 <div className="flex items-center gap-3 mb-2">
 <Users size={18} className="text-[var(--accent)]" />
 <span className="text-[11px] font-medium text-[var(--accent)]">Total Candidates</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">{engagementData.length}</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Tracked</p>
 </div>

 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-emerald-500/20">
 <div className="flex items-center gap-3 mb-2">
 <CheckCircle size={18} className="text-[var(--success)]" />
 <span className="text-[11px] font-medium text-[var(--success)]">Avg Engagement</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">
 {engagementData.length > 0
 ? Math.round(engagementData.reduce((sum, e) => sum + (e.EngagementRate || 0), 0) / engagementData.length)
 : 0}%
 </div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Response Rate</p>
 </div>

 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-[var(--danger)]/20">
 <div className="flex items-center gap-3 mb-2">
 <AlertCircle size={18} className="text-[var(--danger)]" />
 <span className="text-[11px] font-medium text-[var(--danger)]">Low Engagement</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold text-[var(--danger)]">
 {engagementData.filter(e => (e.EngagementRate || 0) < 50).length}
 </div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Needs Follow-up</p>
 </div>
 </div>

 {/* Engagement Table */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8">
 <div className="flex items-center gap-3 mb-6">
 <Users className="w-5 h-5 text-[var(--accent)]" />
 <h3 className="text-sm font-medium">Candidate Engagement</h3>
 </div>
 <p className="text-[11px] font-medium text-[var(--text-muted)] mb-6">Interview confirmations vs scheduled</p>

 {engagementData.length === 0 ? (
 <div className="p-12 text-center">
 <p className="text-[11px] font-semibold text-[var(--text-muted)]">No engagement data available</p>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="border-b border-[var(--border-primary)]">
 <th scope="col" className="text-left p-4 text-[11px] font-medium text-[var(--text-muted)]">Candidate</th>
 <th scope="col" className="text-left p-4 text-[11px] font-medium text-[var(--text-muted)]">Interviews</th>
 <th scope="col" className="text-left p-4 text-[11px] font-medium text-[var(--text-muted)]">Confirmed</th>
 <th scope="col" className="text-left p-4 text-[11px] font-medium text-[var(--text-muted)]">Engagement Rate</th>
 </tr>
 </thead>
 <tbody>
 {engagementData.map((candidate, idx) => {
 const badge = getEngagementBadge(candidate.EngagementRate);
 return (
 <tr key={idx} className="border-b border-[var(--border-primary)] hover:bg-[var(--bg-primary)]/50">
 <td className="p-4">
 <p className="font-semibold">{candidate.FullName || 'Unknown'}</p>
 <p className="text-[11px] text-[var(--text-muted)]">ID: {candidate.CandidateID}</p>
 </td>
 <td className="p-4">
 <span className="px-3 py-1 bg-[var(--bg-primary)] rounded-lg text-[11px] font-semibold">
 {candidate.InterviewsScheduled || 0}
 </span>
 </td>
 <td className="p-4">
 <span className="px-3 py-1 bg-[var(--success)]/10 text-[var(--success)] rounded-lg text-[11px] font-semibold">
 {candidate.ConfirmedInterviews || 0}
 </span>
 </td>
 <td className="p-4">
 <div className="flex items-center gap-2">
 <div className="flex-1 h-2 bg-[var(--bg-primary)] rounded-full overflow-hidden">
 <div
 className={`h-full ${candidate.EngagementRate >= 80 ? 'bg-[var(--success)]' : candidate.EngagementRate >= 50 ? 'bg-[var(--warning)]' : 'bg-[var(--danger)]'}`}
 style={{ width: `${candidate.EngagementRate || 0}%` }}
 ></div>
 </div>
 <span className={`text-sm font-semibold ${getEngagementColor(candidate.EngagementRate)}`}>
 {Math.round(candidate.EngagementRate || 0)}%
 </span>
 <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${badge.bg} ${badge.border} border`}>
 {badge.label}
 </span>
 </div>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 )}
 </div>
 </div>
 );
};

export default CandidateEngagement;
