import React from 'react';
import { Users, Calendar, CheckCircle, TrendingUp, Award, User, RefreshCw } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../../apiConfig';

const RecruiterPerformanceAdmin = () => {
 const [performanceData, setPerformanceData] = React.useState([]);
 const [loading, setLoading] = React.useState(true);

 React.useEffect(() => {
 const fetchData = async () => {
 setLoading(true);
 try {
 const res = await axios.get(`${API_BASE}/analytics/recruiter-performance`);
 if (res.data && Array.isArray(res.data)) {
 setPerformanceData(res.data);
 }
 } catch (err) {
 console.error("Recruiter Performance Fetch Error:", err);
 } finally {
 setLoading(false);
 }
 };
 fetchData();
 }, []);

 const displayData = performanceData.length > 0 ? performanceData : [];

 if (loading) {
 return (
 <div className="flex items-center justify-center py-20">
 <RefreshCw className="w-8 h-8 text-[var(--accent)] animate-spin" />
 <span className="ml-3 text-sm font-medium text-[var(--text-muted)]">Loading Performance Data...</span>
 </div>
 );
 }

 return (
 <div className="space-y-6 sm:space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
 {/* Header */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8 border border-[var(--accent)]">
 <div className="flex items-center gap-4">
 <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
 <Users size={28} />
 </div>
 <div>
 <h2 className="text-lg sm:text-xl font-medium">Recruiter Performance</h2>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Interview and hire metrics per recruiter</p>
 </div>
 </div>
 </div>

 {/* Summary Stats */}
 <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-[var(--accent)]">
 <div className="flex items-center gap-3 mb-2">
 <Users size={18} className="text-[var(--accent)]" />
 <span className="text-[11px] font-medium text-[var(--accent)]">Total Recruiters</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">{displayData.length}</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Active</p>
 </div>
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-cyan-500/20">
 <div className="flex items-center gap-3 mb-2">
 <Calendar size={18} className="text-[var(--accent)]" />
 <span className="text-[11px] font-medium text-[var(--accent)]">Interviews</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">{displayData.reduce((sum, r) => sum + (r.InterviewsConducted || 0), 0)}</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Total Conducted</p>
 </div>
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-emerald-500/20">
 <div className="flex items-center gap-3 mb-2">
 <CheckCircle size={18} className="text-[var(--success)]" />
 <span className="text-[11px] font-medium text-[var(--success)]">Hires</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">{displayData.reduce((sum, r) => sum + (r.Hires || 0), 0)}</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Successful</p>
 </div>
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-amber-500/20">
 <div className="flex items-center gap-3 mb-2">
 <TrendingUp size={18} className="text-[var(--warning)]" />
 <span className="text-[11px] font-medium text-[var(--warning)]">Avg Success</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">
 {displayData.length > 0 ? Math.round(displayData.reduce((sum, r) => sum + (r.SuccessRate || 0), 0) / displayData.length) : 0}%
 </div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Rate</p>
 </div>
 </div>

 {/* Detailed List */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8">
 <h3 className="text-lg font-medium mb-6">Recruiter Metrics Breakdown</h3>
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="text-[11px] font-medium text-[var(--text-muted)] border-b border-[var(--border-primary)]">
 <th scope="col" className="text-left pb-4 pr-4">Recruiter</th>
 <th scope="col" className="text-left pb-4 pr-4">Department</th>
 <th scope="col" className="text-left pb-4 pr-4">Interviews</th>
 <th scope="col" className="text-left pb-4 pr-4">Hires</th>
 <th scope="col" className="text-left pb-4">Success Rate</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-[var(--border-primary)]">
 {displayData.map((recruiter, i) => (
 <tr key={i} className="group hover:bg-[var(--bg-accent)] transition-colors">
 <td className="py-4 pr-4">
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
 <User size={14} />
 </div>
 <span className="text-sm font-semibold">{recruiter.RecruiterName || 'Unknown'}</span>
 </div>
 </td>
 <td className="py-4 pr-4">
 <span className="text-xs font-bold text-[var(--text-secondary)]">{recruiter.Department || 'N/A'}</span>
 </td>
 <td className="py-4 pr-4">
 <span className="text-sm font-semibold text-[var(--accent)]">{recruiter.InterviewsConducted || 0}</span>
 </td>
 <td className="py-4 pr-4">
 <span className="text-sm font-semibold text-[var(--success)]">{recruiter.Hires || 0}</span>
 </td>
 <td className="py-4">
 <div className="flex items-center gap-2">
 <div className="w-16 h-2 bg-[var(--bg-accent)] rounded-full overflow-hidden">
 <div
 className="h-full bg-[var(--warning)] rounded-full"
 style={{ width: `${recruiter.SuccessRate || 0}%` }}
 ></div>
 </div>
 <span className="text-xs font-semibold text-[var(--warning)]">{recruiter.SuccessRate || 0}%</span>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 );
};

export default RecruiterPerformanceAdmin;
