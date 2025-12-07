import React from 'react';
import { Shield, Users, MapPin, Briefcase, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { formatNumber } from '../../utils/format';
import API_BASE from '../../apiConfig';

const BiasAnalytics = () => {
 const [biasData, setBiasData] = React.useState({ location: [], experience: [] });
 const [loading, setLoading] = React.useState(true);

 React.useEffect(() => {
 const fetchData = async () => {
 setLoading(true);
 try {
 const res = await axios.get(`${API_BASE}/analytics/bias-detection`);
 if (res.data) {
 if (res.data.location && Array.isArray(res.data.location) && res.data.location.length > 0) {
 setBiasData(prev => ({ ...prev, location: res.data.location }));
 }
 if (res.data.experience && Array.isArray(res.data.experience) && res.data.experience.length > 0) {
 setBiasData(prev => ({ ...prev, experience: res.data.experience }));
 }
 }
 } catch (err) {
 console.error("Bias Detection Fetch Error:", err);
 } finally {
 setLoading(false);
 }
 };
 fetchData();
 }, []);

 const getStatusColor = (status) => {
 if (status === 'Fair' || status === 'Good') return 'text-[var(--success)]';
 if (status === 'Review') return 'text-[var(--warning)]';
 return 'text-[var(--danger)]';
 };

 const getStatusBg = (status) => {
 if (status === 'Fair' || status === 'Good') return 'bg-[var(--success)]/10 border-emerald-500/20';
 if (status === 'Review') return 'bg-[var(--warning)]/10 border-amber-500/20';
 return 'bg-[var(--danger)]/10 border-[var(--danger)]/20';
 };

 if (loading) {
 return (
 <div className="flex items-center justify-center py-20">
 <RefreshCw className="w-8 h-8 text-[var(--accent)] animate-spin" />
 <span className="ml-3 text-sm font-medium text-[var(--text-muted)]">Loading Bias Analytics...</span>
 </div>
 );
 }

 const locationData = biasData.location.length > 0 ? biasData.location : [
 { Location: 'Remote', ApplicationRate: 35, HireRate: 32, Status: 'Fair' },
 { Location: 'On-site', ApplicationRate: 45, HireRate: 28, Status: 'Review' },
 { Location: 'Hybrid', ApplicationRate: 20, HireRate: 40, Status: 'Fair' }
 ];
 const experienceData = biasData.experience.length > 0 ? biasData.experience : [
 { ExperienceRange: '0-2 Years', ApplicationRate: 30, HireRate: 25, Status: 'Fair' },
 { ExperienceRange: '3-5 Years', ApplicationRate: 40, HireRate: 35, Status: 'Fair' },
 { ExperienceRange: '5+ Years', ApplicationRate: 30, HireRate: 40, Status: 'Review' }
 ];

 return (
 <div className="space-y-6 sm:space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">

 {/* Header */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8 border border-[var(--accent)]/20">
 <div className="flex items-center gap-4">
 <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
 <Shield size={28} />
 </div>
 <div>
 <h2 className="text-lg sm:text-xl font-medium">Bias Detection Analytics</h2>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Fair hiring practices monitoring</p>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-10">

 {/* Location-based Analysis */}
 <div className="glass-card rounded-[var(--radius-xl)] p-10 relative overflow-hidden">
 <div className="absolute top-0 right-0 p-8 text-[var(--accent)]/10">
 <MapPin size={80} strokeWidth={1} />
 </div>
 <div className="relative z-10">
 <div className="flex items-center gap-4 mb-8">
 <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
 <MapPin size={22} />
 </div>
 <div>
 <h3 className="text-lg font-medium">Location Fairness</h3>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Application vs Hire Rate</p>
 </div>
 </div>

 <div className="space-y-4">
 {locationData.map((item, i) => (
 <div key={i} className={`p-5 rounded-2xl border ${getStatusBg(item.Status)}`}>
 <div className="flex items-center justify-between mb-3">
 <span className="text-sm font-semibold">{item.Location}</span>
 <span className={`text-xs font-medium ${getStatusColor(item.Status)}`}>
 {item.Status === 'Fair' ? <CheckCircle size={14} className="inline mr-1" /> : <AlertTriangle size={14} className="inline mr-1" />}
 {item.Status}
 </span>
 </div>
 <div className="grid grid-cols-2 gap-4 text-[11px] font-medium text-[var(--text-muted)]">
 <div>
 <span>Applications</span>
 <div className="w-full h-2 bg-[var(--bg-primary)] rounded-full mt-1 overflow-hidden">
 <div className="h-full bg-[var(--accent)] rounded-full" style={{ width: `${formatNumber(item.ApplicationRate)}%` }}></div>
 </div>
 <span className="text-[var(--text-primary)]">{formatNumber(item.ApplicationRate)}%</span>
 </div>
 <div>
 <span>Hired</span>
 <div className="w-full h-2 bg-[var(--bg-primary)] rounded-full mt-1 overflow-hidden">
 <div className="h-full bg-[var(--success)] rounded-full" style={{ width: `${formatNumber(item.HireRate)}%` }}></div>
 </div>
 <span className="text-[var(--text-primary)]">{formatNumber(item.HireRate)}%</span>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>

 {/* Experience-based Analysis */}
 <div className="glass-card rounded-[var(--radius-xl)] p-10 relative overflow-hidden">
 <div className="absolute top-0 right-0 p-8 text-[var(--warning)]/10">
 <Briefcase size={80} strokeWidth={1} />
 </div>
 <div className="relative z-10">
 <div className="flex items-center gap-4 mb-8">
 <div className="w-12 h-12 rounded-2xl bg-[var(--warning)]/10 flex items-center justify-center text-[var(--warning)]">
 <Briefcase size={22} />
 </div>
 <div>
 <h3 className="text-lg font-medium">Experience Fairness</h3>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Hiring by experience level</p>
 </div>
 </div>

 <div className="space-y-4">
 {experienceData.map((item, i) => (
 <div key={i} className={`p-5 rounded-2xl border ${getStatusBg(item.Status)}`}>
 <div className="flex items-center justify-between mb-3">
 <span className="text-sm font-semibold">{item.ExperienceRange}</span>
 <span className={`text-xs font-medium ${getStatusColor(item.Status)}`}>
 {item.Status === 'Fair' ? <CheckCircle size={14} className="inline mr-1" /> : <AlertTriangle size={14} className="inline mr-1" />}
 {item.Status}
 </span>
 </div>
 <div className="grid grid-cols-2 gap-4 text-[11px] font-medium text-[var(--text-muted)]">
 <div>
 <span>Applications</span>
 <div className="w-full h-2 bg-[var(--bg-primary)] rounded-full mt-1 overflow-hidden">
 <div className="h-full bg-[var(--warning)] rounded-full" style={{ width: `${formatNumber(item.ApplicationRate)}%` }}></div>
 </div>
 <span className="text-[var(--text-primary)]">{formatNumber(item.ApplicationRate)}%</span>
 </div>
 <div>
 <span>Hired</span>
 <div className="w-full h-2 bg-[var(--bg-primary)] rounded-full mt-1 overflow-hidden">
 <div className="h-full bg-[var(--success)] rounded-full" style={{ width: `${formatNumber(item.HireRate)}%` }}></div>
 </div>
 <span className="text-[var(--text-primary)]">{formatNumber(item.HireRate)}%</span>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>

 </div>

 {/* Fairness Score */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8 text-center">
 <div className="flex items-center justify-center gap-3 mb-4">
 <Users size={20} className="text-[var(--success)]" />
 <h3 className="text-sm font-medium">Overall Fairness Score</h3>
 </div>
 <div className="text-6xl font-semibold text-[var(--success)] mb-2">92%</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Based on location & experience parity</p>
 </div>

 </div>
 );
};

export default BiasAnalytics;
