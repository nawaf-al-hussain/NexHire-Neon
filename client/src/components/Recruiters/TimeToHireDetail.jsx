import React from 'react';
import { Clock, Users, Calendar, TrendingUp, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../../apiConfig';

const TimeToHireDetail = () => {
 const [timeData, setTimeData] = React.useState([]);
 const [loading, setLoading] = React.useState(true);
 const [error, setError] = React.useState(null);

 React.useEffect(() => {
 const fetchData = async () => {
 setLoading(true);
 setError(null);
 try {
 const res = await axios.get(`${API_BASE}/analytics/time-to-hire-detail`);
 if (res.data && Array.isArray(res.data)) {
 setTimeData(res.data);
 }
 } catch (err) {
 console.error("Time to Hire Detail Fetch Error:", err);
 setError(err.response?.data?.error || "Failed to load time-to-hire data");
 } finally {
 setLoading(false);
 }
 };
 fetchData();
 }, []);

 const getDurationColor = (days) => {
 if (days <= 14) return 'text-[var(--success)]';
 if (days <= 30) return 'text-[var(--warning)]';
 return 'text-[var(--danger)]';
 };

 const getDurationBg = (days) => {
 if (days <= 14) return 'bg-[var(--success)]/10 border-emerald-500/20';
 if (days <= 30) return 'bg-[var(--warning)]/10 border-amber-500/20';
 return 'bg-[var(--danger)]/10 border-[var(--danger)]/20';
 };

 const hired = timeData.filter(d => d.ApplicationStatus === 'Hired');
 const avgDays = hired.length > 0 ? Math.round(hired.reduce((sum, d) => sum + (d.DaysToHire || 0), 0) / hired.length) : 0;
 const fastHires = hired.filter(d => d.DaysToHire <= 14).length;
 const slowHires = hired.filter(d => d.DaysToHire > 30).length;

 if (loading) {
 return (
 <div className="flex flex-col items-center justify-center py-20">
 <Loader2 className="w-12 h-12 text-[var(--accent)] animate-spin mb-4" />
 <p className="text-[11px] font-semibold text-[var(--text-muted)]">Loading Time-to-Hire Data...</p>
 </div>
 );
 }

 if (error) {
 return (
 <div className="glass-card p-8 rounded-[var(--radius-xl)] text-center">
 <AlertTriangle className="w-12 h-12 text-[var(--danger)] mx-auto mb-4" />
 <h3 className="text-sm font-medium mb-2">Error Loading Data</h3>
 <p className="text-xs font-semibold text-[var(--text-muted)] mb-4">{error}</p>
 <button
 onClick={() => window.location.reload()}
 className="px-6 py-3 bg-[var(--accent)] text-white rounded-xl text-xs font-medium hover:bg-[var(--accent-hover)] transition-all"
 >
 Try Again
 </button>
 </div>
 );
 }

 return (
 <div className="space-y-6 sm:space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
 <div className="glass-card rounded-[var(--radius-xl)] p-8 border border-[var(--accent)]/20">
 <div className="flex items-center gap-4">
 <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
 <Clock size={28} />
 </div>
 <div>
 <h2 className="text-lg sm:text-xl font-medium">Time-to-Hire Details</h2>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Individual candidate hiring timelines</p>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-[var(--accent)]/20">
 <div className="flex items-center gap-3 mb-2">
 <Users size={18} className="text-[var(--accent)]" />
 <span className="text-[11px] font-medium text-[var(--accent)]">Total Hired</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">{hired.length}</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Candidates</p>
 </div>
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-[var(--accent)]">
 <div className="flex items-center gap-3 mb-2">
 <TrendingUp size={18} className="text-[var(--accent)]" />
 <span className="text-[11px] font-medium text-[var(--accent)]">Average Days</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">{avgDays}</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">To Hire</p>
 </div>
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-emerald-500/20">
 <div className="flex items-center gap-3 mb-2">
 <CheckCircle size={18} className="text-[var(--success)]" />
 <span className="text-[11px] font-medium text-[var(--success)]">Fast Hire</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">{fastHires}</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">14 Days or Less</p>
 </div>
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-[var(--danger)]/20">
 <div className="flex items-center gap-3 mb-2">
 <AlertCircle size={18} className="text-[var(--danger)]" />
 <span className="text-[11px] font-medium text-[var(--danger)]">Slow Hire</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">{slowHires}</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Over 30 Days</p>
 </div>
 </div>

 <div className="glass-card rounded-[var(--radius-xl)] p-8">
 <h3 className="text-lg font-medium mb-6">Candidate Hiring Timelines</h3>
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="text-[11px] font-medium text-[var(--text-muted)] border-b border-[var(--border-primary)]">
 <th scope="col" className="text-left pb-4 pr-4">Candidate</th>
 <th scope="col" className="text-left pb-4 pr-4">Position</th>
 <th scope="col" className="text-left pb-4 pr-4">Applied</th>
 <th scope="col" className="text-left pb-4 pr-4">Hired</th>
 <th scope="col" className="text-left pb-4 pr-4">Days</th>
 <th scope="col" className="text-left pb-4 pr-4">Source</th>
 <th scope="col" className="text-left pb-4">Status</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-[var(--border-primary)]">
 {timeData.length === 0 ? (
 <tr>
 <td colSpan="7" className="py-12 text-center">
 <Clock className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4 opacity-50" />
 <p className="text-[var(--text-muted)]">No hiring data available yet.</p>
 <p className="text-xs text-[var(--text-muted)] mt-1">Hired candidates will appear here with their time-to-hire metrics.</p>
 </td>
 </tr>
 ) : (
 timeData.slice(0, 15).map((item, i) => (
 <tr key={i} className="group hover:bg-[var(--bg-accent)] transition-colors">
 <td className="py-4 pr-4">
 <span className="text-sm font-semibold">{item.CandidateName || 'Unknown'}</span>
 </td>
 <td className="py-4 pr-4">
 <span className="text-xs font-bold text-[var(--text-secondary)]">{item.JobTitle || 'N/A'}</span>
 </td>
 <td className="py-4 pr-4">
 <span className="text-xs font-bold text-[var(--text-muted)]">
 {item.AppliedDate ? new Date(item.AppliedDate).toLocaleDateString() : '-'}
 </span>
 </td>
 <td className="py-4 pr-4">
 <span className="text-xs font-bold text-[var(--text-muted)]">
 {item.HiredDate ? new Date(item.HiredDate).toLocaleDateString() : '-'}
 </span>
 </td>
 <td className="py-4 pr-4">
 {item.DaysToHire ? (
 <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold ${getDurationBg(item.DaysToHire)}`}>
 {item.DaysToHire} days
 </span>
 ) : (
 <span className="text-xs font-bold text-[var(--text-muted)]">-</span>
 )}
 </td>
 <td className="py-4 pr-4">
 <span className="text-xs font-bold text-[var(--text-secondary)]">{item.Source || 'N/A'}</span>
 </td>
 <td className="py-4">
 <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium ${item.ApplicationStatus === 'Hired'
 ? 'bg-[var(--success)]/10 text-[var(--success)] border border-emerald-500/20'
 : 'bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20'
 }`}>
 {item.ApplicationStatus || 'Unknown'}
 </span>
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 );
};

export default TimeToHireDetail;
