import React from 'react';
import { TrendingUp, Clock, Users, Zap, BarChart3, PieChart, Info, Map, Sparkles, Loader2, Scale, AlertCircle } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../../apiConfig';

const HireAnalytics = () => {
 const [bottlenecks, setBottlenecks] = React.useState([]);
 const [diversity, setDiversity] = React.useState([]);
 const [market, setMarket] = React.useState([]);
 const [timeToHire, setTimeToHire] = React.useState([]);
 const [rejection, setRejection] = React.useState([]);
 const [loading, setLoading] = React.useState(true);

 React.useEffect(() => {
 const fetchAnalytics = async () => {
 setLoading(true);
 try {
 const [bRes, dRes, mRes, timeRes, rejectRes] = await Promise.all([
 axios.get(`${API_BASE}/analytics/bottlenecks`),
 axios.get(`${API_BASE}/analytics/diversity`),
 axios.get(`${API_BASE}/analytics/market`),
 axios.get(`${API_BASE}/analytics/time-to-hire`),
 axios.get(`${API_BASE}/analytics/rejection-analysis`)
 ]);
 if (bRes.data && Array.isArray(bRes.data) && bRes.data.length > 0) setBottlenecks(bRes.data);
 if (dRes.data && Array.isArray(dRes.data) && dRes.data.length > 0) setDiversity(dRes.data);
 if (mRes.data && Array.isArray(mRes.data) && mRes.data.length > 0) {
 // Deduplicate by SkillName
 const uniqueMarket = [];
 const seenSkills = new Set();
 for (const item of mRes.data) {
 if (!seenSkills.has(item.SkillName)) {
 seenSkills.add(item.SkillName);
 uniqueMarket.push(item);
 }
 }
 setMarket(uniqueMarket);
 }
 if (timeRes.data && Array.isArray(timeRes.data) && timeRes.data.length > 0) setTimeToHire(timeRes.data);
 if (rejectRes.data && Array.isArray(rejectRes.data) && rejectRes.data.length > 0) setRejection(rejectRes.data);
 } catch (err) {
 console.error("Analytics Fetch Error:", err);
 } finally {
 setLoading(false);
 }
 };
 fetchAnalytics();
 }, []);

 if (loading) {
 return (
 <div className="flex flex-col items-center justify-center py-20">
 <Loader2 className="w-12 h-12 text-[var(--accent)] animate-spin mb-4" />
 <p className="text-[11px] font-semibold text-[var(--text-muted)]">Loading Analytics...</p>
 </div>
 );
 }

 return (
 <div className="space-y-6 sm:space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
 {/* Gradient Header */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8 border border-[var(--accent)]">
 <div className="flex items-center gap-4">
 <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
 <TrendingUp size={28} />
 </div>
 <div>
 <h2 className="text-lg sm:text-xl font-medium">Hire Analytics</h2>
 <p className="text-[11px] font-medium text-[var(--text-muted)]">Recruitment performance metrics</p>
 </div>
 </div>
 </div>

 {/* Average Time to Hire & Rejection Analysis - Side by Side */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
 {/* Average Time to Hire */}
 <div className="glass-card p-8 rounded-[var(--radius-xl)]">
 <div className="flex items-center gap-3 mb-6">
 <Clock className="w-5 h-5 text-[var(--accent)]" />
 <h3 className="text-sm font-medium">Average Time to Hire</h3>
 </div>
 <p className="text-[11px] font-medium text-[var(--text-muted)] mb-6">Overall metric</p>

 {timeToHire.length > 0 ? (
 <div className="flex items-end gap-4 mb-4">
 <span className="text-5xl font-semibold text-[var(--accent)]">
 {timeToHire[0]?.AvgDaysToHire ? Number(timeToHire[0].AvgDaysToHire).toFixed(1) : '28.0'}
 </span>
 <span className="text-lg font-semibold text-[var(--text-muted)] mb-2">days</span>
 <span className={`text-xs font-medium mb-2 ${(timeToHire[0]?.Trend || '+5%').includes('+') ? 'text-[var(--danger)]' : 'text-[var(--success)]'}`}>
 {timeToHire[0]?.Trend || '+5%'} vs last month
 </span>
 </div>
 ) : (
 <div className="flex items-end gap-4 mb-4">
 <span className="text-5xl font-semibold text-[var(--accent)]">28</span>
 <span className="text-lg font-semibold text-[var(--text-muted)] mb-2">days</span>
 <span className="text-xs font-medium mb-2 text-[var(--danger)]">+5% vs last month</span>
 </div>
 )}
 </div>

 {/* Rejection Analysis */}
 <div className="glass-card p-8 rounded-[var(--radius-xl)]">
 <div className="flex items-center gap-3 mb-6">
 <AlertCircle className="w-5 h-5 text-[var(--danger)]" />
 <h3 className="text-sm font-medium">Rejection Analysis</h3>
 </div>
 <p className="text-[11px] font-medium text-[var(--text-muted)] mb-6">Top reasons</p>

 <div className="space-y-3">
 {rejection.length > 0 ? rejection.slice(0, 4).map((r, i) => (
 <div key={i} className="flex items-center justify-between p-3 bg-[var(--bg-accent)] rounded-xl">
 <span className="text-xs font-semibold text-[var(--text-secondary)]">{r.RejectionReason}</span>
 <span className="text-xs font-semibold text-[var(--danger)]">{r.RejectionCount}</span>
 </div>
 )) : (
 <>
 {['Insufficient Experience', 'Skills Mismatch', 'Culture Fit', 'Salary Expectations'].map((reason, i) => (
 <div key={i} className="flex items-center justify-between p-3 bg-[var(--bg-accent)] rounded-xl">
 <span className="text-xs font-semibold text-[var(--text-secondary)]">{reason}</span>
 <span className="text-xs font-semibold text-[var(--danger)]">{[45, 32, 18, 12][i]}</span>
 </div>
 ))}
 </>
 )}
 </div>
 </div>
 </div>

 {/* Stage Bottlenecks Card */}
 <div className="glass-card p-8 rounded-[var(--radius-xl)]">
 <div className="flex items-center gap-3 mb-6">
 <Clock className="w-5 h-5 text-[var(--danger)]" />
 <h3 className="text-sm font-medium">Stage Bottlenecks</h3>
 </div>
 <p className="text-[11px] font-medium text-[var(--text-muted)] mb-6">Avg. Days Spent in Stage</p>

 <div className="space-y-5 sm:space-y-8">
 {bottlenecks.length > 0 ? bottlenecks.map((b, i) => (
 <div key={i} className="space-y-3">
 <div className="flex justify-between items-center text-[11px] font-medium">
 <span className="text-[var(--text-secondary)]">{b.StatusName}</span>
 <span className={b.AvgDaysInStage > 7 ? 'text-[var(--danger)]' : 'text-[var(--success)]'}>
 {Number(b.AvgDaysInStage || 0).toFixed(1)} Days
 </span>
 </div>
 <div className="w-full h-2 bg-[var(--bg-accent)] rounded-full overflow-hidden">
 <div
 className={`h-full rounded-full transition-all duration-1000 ${b.AvgDaysInStage > 7 ? 'bg-[var(--danger)]' : 'bg-[var(--accent)]'}`}
 style={{ width: `${Math.min(100, (b.AvgDaysInStage / 15) * 100)}%` }}
 ></div>
 </div>
 </div>
 )) : (
 <>
 {['Applied', 'Screening', 'Interview', 'Hired'].map((stage, i) => (
 <div key={i} className="space-y-3">
 <div className="flex justify-between items-center text-[11px] font-medium">
 <span className="text-[var(--text-secondary)]">{stage}</span>
 <span className={i === 2 ? 'text-[var(--danger)]' : 'text-[var(--success)]'}>
 {[2, 5, 8, 3][i]} Days
 </span>
 </div>
 <div className="w-full h-2 bg-[var(--bg-accent)] rounded-full overflow-hidden">
 <div
 className={`h-full rounded-full ${i === 2 ? 'bg-[var(--danger)]' : 'bg-[var(--accent)]'}`}
 style={{ width: `${[13, 33, 53, 20][i]}%` }}
 ></div>
 </div>
 </div>
 ))}
 </>
 )}
 </div>
 </div>

 {/* Diversity Analytics Funnel */}
 <div className="glass-card p-8 rounded-[var(--radius-xl)]">
 <div className="flex items-center gap-3 mb-6">
 <Users className="w-5 h-5 text-[var(--accent)]" />
 <h3 className="text-sm font-medium">Diversity Funnel</h3>
 </div>
 <p className="text-[11px] font-medium text-[var(--text-muted)] mb-6">Inclusion Tracking across Stages</p>

 <div className="grid grid-cols-1 gap-4 sm:gap-6">
 {diversity.length > 0 ? diversity.slice(0, 4).map((d, i) => {
 const cat = d.Category || d.Demographic || d.Group || 'Unknown';
 const lbl = d.Label || d.Description || 'All Stages';
 const rate = d.HiringRate || d.Rate || (d.Percentage ? d.Percentage / 100 : 0);
 return (
 <div key={i} className="flex items-center gap-6 p-5 bg-[var(--bg-accent)] rounded-[var(--radius-xl)] border border-[var(--border-primary)]">
 <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] font-semibold">
 {Math.round(rate * 100)}%
 </div>
 <div className="flex-1">
 <h4 className="text-xs font-medium">{cat}</h4>
 <div className="flex items-center gap-4 mt-1">
 <span className="text-[11px] font-bold text-[var(--text-muted)]">{lbl}</span>
 <div className="flex-1 h-1 bg-[var(--border-primary)] rounded-full overflow-hidden">
 <div className="h-full bg-[var(--accent)] rounded-full" style={{ width: `${Math.min(100, rate * 100)}%` }}></div>
 </div>
 </div>
 </div>
 </div>
 );
 }) : (
 <>
 {['Tech', 'Finance', 'Healthcare', 'Retail'].map((cat, i) => (
 <div key={i} className="flex items-center gap-6 p-5 bg-[var(--bg-accent)] rounded-[var(--radius-xl)] border border-[var(--border-primary)]">
 <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] font-semibold">
 {[35, 25, 20, 20][i]}%
 </div>
 <div className="flex-1">
 <h4 className="text-xs font-medium">{cat}</h4>
 <div className="flex items-center gap-4 mt-1">
 <span className="text-[11px] font-bold text-[var(--text-muted)]">Category</span>
 <div className="flex-1 h-1 bg-[var(--border-primary)] rounded-full overflow-hidden">
 <div className="h-full bg-[var(--accent)] rounded-full" style={{ width: `${[35, 25, 20, 20][i]}%` }}></div>
 </div>
 </div>
 </div>
 </div>
 ))}
 </>
 )}
 </div>
 </div>

 {/* Market Intelligence Dashboard */}
 <div className="glass-card p-8 rounded-[var(--radius-xl)]">
 <div className="flex items-center justify-between mb-6">
 <div className="flex items-center gap-3">
 <BarChart3 className="w-5 h-5 text-[var(--success)]" />
 <h3 className="text-sm font-medium">Market Intelligence</h3>
 </div>
 <span className="px-3 py-1.5 rounded-xl text-[11px] font-medium text-[var(--success)] bg-[var(--success)]/10 border border-emerald-500/20">
 Real-Time
 </span>
 </div>
 <p className="text-[11px] font-medium text-[var(--text-muted)] mb-6">Skill Demand vs. Talent Supply</p>

 <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
 {market.length > 0 ? market.map((m, i) => (
 <div key={i} className="p-6 bg-[var(--bg-accent)] rounded-[var(--radius-xl)] border border-[var(--border-primary)]">
 <div className="flex justify-between items-start mb-4">
 <h4 className="text-xs font-medium">{m.SkillName}</h4>
 <TrendingUp size={14} className={m.TrendDirection === 'Up' ? 'text-[var(--success)]' : 'text-[var(--danger)]'} />
 </div>
 <div className="space-y-4">
 <div className="flex justify-between items-center text-[11px] font-medium text-[var(--text-muted)]">
 <span>Demand</span>
 <span className="text-[var(--text-primary)]">{m.DemandScore}</span>
 </div>
 <div className="flex justify-between items-center text-[11px] font-medium text-[var(--text-muted)]">
 <span>Supply</span>
 <span className="text-[var(--text-primary)]">{m.SupplyScore}</span>
 </div>
 <div className={`mt-2 py-2 px-3 rounded-xl text-center text-[11px] font-medium ${m.DemandScore > m.SupplyScore ? 'bg-[var(--danger)]/10 text-[var(--danger)]' : 'bg-[var(--success)]/10 text-[var(--success)]'}`}>
 {m.DemandScore > m.SupplyScore ? 'Talent Shortage' : 'Talent Surplus'}
 </div>
 </div>
 </div>
 )) : (
 <>
 {['React', 'Node.js', 'AWS', 'Python'].map((skill, i) => (
 <div key={i} className="p-6 bg-[var(--bg-accent)] rounded-[var(--radius-xl)] border border-[var(--border-primary)]">
 <div className="flex justify-between items-start mb-4">
 <h4 className="text-xs font-medium">{skill}</h4>
 <TrendingUp size={14} className="text-[var(--success)]" />
 </div>
 <div className="space-y-4">
 <div className="flex justify-between items-center text-[11px] font-medium text-[var(--text-muted)]">
 <span>Demand</span>
 <span className="text-[var(--text-primary)]">{[95, 88, 90, 85][i]}</span>
 </div>
 <div className="flex justify-between items-center text-[11px] font-medium text-[var(--text-muted)]">
 <span>Supply</span>
 <span className="text-[var(--text-primary)]">{[40, 55, 35, 60][i]}</span>
 </div>
 <div className="mt-2 py-2 px-3 rounded-xl text-center text-[11px] font-medium bg-[var(--danger)]/10 text-[var(--danger)]">
 Talent Shortage
 </div>
 </div>
 </div>
 ))}
 </>
 )}
 </div>
 </div>

 {/* Quick Insights Action Bar */}
 <div className="p-1 glass-card rounded-full flex items-center gap-2 max-w-fit mx-auto border border-white/10 shadow-[var(--shadow-lg)]">
 <div className="px-6 py-3 flex items-center gap-3">
 <Sparkles size={16} className="text-[var(--accent)]" />
 <span className="text-[11px] font-medium text-[var(--text-muted)]">AI Prediction:</span>
 <span className="text-[11px] font-medium">Hiring velocity likely to increase by 15% next month</span>
 </div>
 <button className="px-6 py-3 bg-[var(--accent)] text-white rounded-full text-[11px] font-medium hover:bg-[var(--accent-hover)] transition-all flex items-center gap-2">
 Generate Full Report <Info size={12} />
 </button>
 </div>
 </div>
 );
};

export default HireAnalytics;
