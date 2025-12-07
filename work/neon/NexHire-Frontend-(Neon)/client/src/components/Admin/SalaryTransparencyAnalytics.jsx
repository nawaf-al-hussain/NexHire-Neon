import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE from '../../apiConfig';
import {
 DollarSign, TrendingUp, TrendingDown, Eye, EyeOff, BarChart3,
 Briefcase, Users, CheckCircle, XCircle, Minus, ArrowUpRight, ArrowDownRight,
 RefreshCw, Info
} from 'lucide-react';
import {
 BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
 PieChart, Pie, Cell, Legend, LineChart, Line, ComposedChart, Area
} from 'recharts';

const SalaryTransparencyAnalytics = () => {
 const [loading, setLoading] = useState(true);
 const [data, setData] = useState([]);
 const [summaryStats, setSummaryStats] = useState({
 totalJobs: 0,
 transparentJobs: 0,
 hiddenJobs: 0,
 avgAppsTransparent: 0,
 avgAppsHidden: 0,
 transparencyRate: 0
 });

 useEffect(() => {
 fetchData();
 }, []);

 const fetchData = async () => {
 setLoading(true);
 try {
 const res = await axios.get(`${API_BASE}/analytics/salary-transparency`);
 const rawData = res.data || [];
 setData(rawData);

 // Calculate summary stats
 if (rawData.length > 0) {
 const transparent = rawData.filter(d => d.IsTransparent === true || d.IsTransparent === 1);
 const hidden = rawData.filter(d => d.IsTransparent === false || d.IsTransparent === 0);

 const avgTransApps = transparent.length > 0
 ? transparent.reduce((sum, d) => sum + (d.ApplicationCount || d.TotalApplications || 0), 0) / transparent.length
 : 0;

 const avgHiddenApps = hidden.length > 0
 ? hidden.reduce((sum, d) => sum + (d.ApplicationCount || d.TotalApplications || 0), 0) / hidden.length
 : 0;

 setSummaryStats({
 totalJobs: rawData.length,
 transparentJobs: transparent.length,
 hiddenJobs: hidden.length,
 avgAppsTransparent: Math.round(avgTransApps),
 avgAppsHidden: Math.round(avgHiddenApps),
 transparencyRate: rawData.length > 0 ? Math.round((transparent.length / rawData.length) * 100) : 0
 });
 }
 } catch (err) {
 console.error("Failed to fetch salary transparency data:", err);
 // Use demo data
 const data = jobs || [];
 setData([]);
 
 } finally {
 setLoading(false);
 }
 };

 // Force demo data on first load if API fails
 const calculateDemoStats = (data) => {
 const transparent = data.filter(d => d.IsTransparent);
 const hidden = data.filter(d => !d.IsTransparent);

 setSummaryStats({
 totalJobs: data.length,
 transparentJobs: transparent.length,
 hiddenJobs: hidden.length,
 avgAppsTransparent: Math.round(transparent.reduce((s, d) => s + d.ApplicationCount, 0) / transparent.length),
 avgAppsHidden: Math.round(hidden.reduce((s, d) => s + d.ApplicationCount, 0) / hidden.length),
 transparencyRate: Math.round((transparent.length / data.length) * 100)
 });
 };

 const formatCurrency = (value) => {
 return new Intl.NumberFormat('en-US', {
 style: 'currency',
 currency: 'USD',
 minimumFractionDigits: 0,
 maximumFractionDigits: 0
 }).format(value);
 };

 // Prepare chart data
 const transparencyComparisonData = [
 { name: 'Transparent', applications: summaryStats.avgAppsTransparent, color: '#10b981' },
 { name: 'Hidden', applications: summaryStats.avgAppsHidden, color: '#f59e0b' }
 ];

 const pieData = [
 { name: 'Transparent', value: summaryStats.transparentJobs, color: '#10b981' },
 { name: 'Hidden', value: summaryStats.hiddenJobs, color: '#f59e0b' }
 ];

 const COLORS = ['#10b981', '#f59e0b', '#6366f1', '#8b5cf6'];

 // Application volume by job (top 10)
 const applicationVolumeData = [...data]
 .sort((a, b) => (b.ApplicationCount || 0) - (a.ApplicationCount || 0))
 .slice(0, 10)
 .map(item => ({
 name: item.JobTitle?.substring(0, 15) || 'Unknown',
 applications: item.ApplicationCount || 0,
 transparent: item.IsTransparent ? 'Yes' : 'No',
 fill: item.IsTransparent ? '#10b981' : '#f59e0b'
 }));

 const impactPercentage = summaryStats.avgAppsHidden > 0
 ? Math.round(((summaryStats.avgAppsTransparent - summaryStats.avgAppsHidden) / summaryStats.avgAppsHidden) * 100)
 : 0;

 if (loading) {
 return (
 <div className="flex flex-col items-center justify-center py-20">
 <RefreshCw className="w-12 h-12 text-[var(--accent)] animate-spin mb-4" />
 <p className="text-[11px] font-semibold text-[var(--text-muted)]">Loading Salary Transparency Analytics...</p>
 </div>
 );
 }

 return (
 <div className="space-y-5 sm:space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
 {/* Gradient Header */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8 border border-green-500/20">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-4">
 <div className="w-14 h-14 rounded-2xl bg-[var(--success)]/10 flex items-center justify-center text-[var(--success)]">
 <DollarSign size={28} />
 </div>
 <div>
 <h2 className="text-lg sm:text-xl font-medium">Salary Transparency Analytics</h2>
 <p className="text-[11px] font-medium text-[var(--text-muted)]">Compensation insights and transparency metrics</p>
 </div>
 </div>
 <button
 onClick={fetchData}
 className="p-3 rounded-xl hover:bg-[var(--bg-accent)] transition-colors"
 >
 <RefreshCw className="w-5 h-5 text-[var(--text-muted)]" />
 </button>
 </div>
 </div>

 {/* Summary Stats Cards */}
 <div className="grid grid-cols-2 md:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 <div className="glass-card p-6 rounded-[var(--radius-xl)]">
 <div className="flex items-center gap-3 mb-2">
 <Briefcase className="w-4 h-4 text-[var(--accent)]" />
 <span className="text-[11px] font-medium text-[var(--text-muted)]">Total Jobs</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">{summaryStats.totalJobs}</div>
 </div>

 <div className="glass-card p-6 rounded-[var(--radius-xl)]">
 <div className="flex items-center gap-3 mb-2">
 <Eye className="w-4 h-4 text-[var(--success)]" />
 <span className="text-[11px] font-medium text-[var(--text-muted)]">Transparent</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold text-[var(--success)]">{summaryStats.transparentJobs}</div>
 <div className="text-[11px] text-[var(--text-muted)] mt-1">{summaryStats.transparencyRate}% of total</div>
 </div>

 <div className="glass-card p-6 rounded-[var(--radius-xl)]">
 <div className="flex items-center gap-3 mb-2">
 <EyeOff className="w-4 h-4 text-[var(--warning)]" />
 <span className="text-[11px] font-medium text-[var(--text-muted)]">Hidden</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold text-[var(--warning)]">{summaryStats.hiddenJobs}</div>
 </div>

 <div className="glass-card p-6 rounded-[var(--radius-xl)]">
 <div className="flex items-center gap-3 mb-2">
 {impactPercentage >= 0 ? (
 <ArrowUpRight className="w-4 h-4 text-[var(--success)]" />
 ) : (
 <ArrowDownRight className="w-4 h-4 text-[var(--danger)]" />
 )}
 <span className="text-[11px] font-medium text-[var(--text-muted)]">Impact</span>
 </div>
 <div className={`text-2xl sm:text-3xl font-semibold ${impactPercentage >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
 {impactPercentage >= 0 ? '+' : ''}{impactPercentage}%
 </div>
 <div className="text-[11px] text-[var(--text-muted)] mt-1">more applications</div>
 </div>
 </div>

 {/* Key Insight Banner */}
 <div className={`p-6 rounded-[var(--radius-xl)] border ${impactPercentage >= 0 ? 'bg-[var(--success)]/10 border-emerald-500/20' : 'bg-[var(--warning)]/10 border-amber-500/20'}`}>
 <div className="flex items-start gap-4">
 <Info className={`w-5 h-5 shrink-0 ${impactPercentage >= 0 ? 'text-[var(--success)]' : 'text-[var(--warning)]'}`} />
 <div>
 <h3 className="text-sm font-semibold mb-1">Key Insight</h3>
 <p className="text-xs text-[var(--text-muted)]">
 Jobs with transparent salary ranges receive an average of <span className="font-semibold text-[var(--success)]">{summaryStats.avgAppsTransparent} applications</span>,
 compared to <span className="font-semibold text-[var(--warning)]">{summaryStats.avgAppsHidden} applications</span> for jobs with hidden salaries.
 {impactPercentage >= 0 && ` That's a ${impactPercentage}% increase in application volume.`}
 </p>
 </div>
 </div>
 </div>

 {/* Charts Grid */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
 {/* Transparency Distribution Pie Chart */}
 <div className="glass-card p-8 rounded-[var(--radius-xl)]">
 <div className="flex items-center gap-3 mb-6">
 <PieChart className="w-5 h-5 text-[var(--accent)]" />
 <h3 className="text-sm font-medium">Transparency Distribution</h3>
 </div>
 <div className="h-[300px]">
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie
 data={pieData}
 cx="50%"
 cy="50%"
 innerRadius={60}
 outerRadius={100}
 paddingAngle={5}
 dataKey="value"
 >
 {pieData.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={entry.color} />
 ))}
 </Pie>
 <Tooltip
 contentStyle={{
 backgroundColor: 'var(--bg-secondary)',
 border: '1px solid var(--border-primary)',
 borderRadius: '1rem',
 fontSize: '11px',
 fontWeight: 'bold'
 }}
 />
 <Legend
 formatter={(value) => <span className="text-xs font-bold">{value}</span>}
 />
 </PieChart>
 </ResponsiveContainer>
 </div>
 </div>

 {/* Application Volume Comparison */}
 <div className="glass-card p-8 rounded-[var(--radius-xl)]">
 <div className="flex items-center gap-3 mb-6">
 <BarChart3 className="w-5 h-5 text-[var(--accent)]" />
 <h3 className="text-sm font-medium">Avg Applications by Transparency</h3>
 </div>
 <div className="h-[300px]">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart
 data={transparencyComparisonData}
 layout="vertical"
 margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
 >
 <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
 <XAxis type="number" hide />
 <YAxis
 dataKey="name"
 type="category"
 axisLine={false}
 tickLine={false}
 tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 900 }}
 width={100}
 />
 <Tooltip
 contentStyle={{
 backgroundColor: 'var(--bg-secondary)',
 border: '1px solid var(--border-primary)',
 borderRadius: '1rem',
 fontSize: '11px',
 fontWeight: 'bold'
 }}
 formatter={(value) => [`${value} avg applications`, 'Volume']}
 />
 <Bar dataKey="applications" radius={[0, 10, 10, 0]} barSize={40}>
 {transparencyComparisonData.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={entry.color} />
 ))}
 </Bar>
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>
 </div>

 {/* Application Volume by Job */}
 <div className="glass-card p-8 rounded-[var(--radius-xl)]">
 <div className="flex items-center gap-3 mb-6">
 <TrendingUp className="w-5 h-5 text-[var(--accent)]" />
 <h3 className="text-sm font-medium">Application Volume by Job (Top 10)</h3>
 </div>
 <div className="h-[350px]">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart
 data={applicationVolumeData}
 margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
 >
 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
 <XAxis
 dataKey="name"
 axisLine={false}
 tickLine={false}
 tick={{ fill: 'var(--text-muted)', fontSize: 9, fontWeight: 900, angle: -45, textAnchor: 'end' }}
 height={60}
 />
 <YAxis
 axisLine={false}
 tickLine={false}
 tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 900 }}
 />
 <Tooltip
 contentStyle={{
 backgroundColor: 'var(--bg-secondary)',
 border: '1px solid var(--border-primary)',
 borderRadius: '1rem',
 fontSize: '11px',
 fontWeight: 'bold'
 }}
 formatter={(value, name, props) => [
 `${value} applications`,
 `Transparent: ${props.payload.transparent}`
 ]}
 />
 <Bar dataKey="applications" radius={[8, 8, 0, 0]} barSize={30}>
 {applicationVolumeData.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={entry.fill} />
 ))}
 </Bar>
 </BarChart>
 </ResponsiveContainer>
 </div>
 <div className="flex items-center justify-center gap-6 mt-4">
 <div className="flex items-center gap-2">
 <div className="w-3 h-3 rounded-full bg-[var(--success)]"></div>
 <span className="text-[11px] font-medium text-[var(--text-muted)]">Transparent</span>
 </div>
 <div className="flex items-center gap-2">
 <div className="w-3 h-3 rounded-full bg-[var(--warning)]"></div>
 <span className="text-[11px] font-medium text-[var(--text-muted)]">Hidden</span>
 </div>
 </div>
 </div>

 {/* Detailed Table */}
 <div className="glass-card p-8 rounded-[var(--radius-xl)]">
 <div className="flex items-center gap-3 mb-6">
 <Users className="w-5 h-5 text-[var(--accent)]" />
 <h3 className="text-sm font-medium">Job Salary Details</h3>
 </div>
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="border-b border-[var(--border-primary)]">
 <th scope="col" className="text-left py-3 px-4 text-[11px] font-medium text-[var(--text-muted)]">Job Title</th>
 <th scope="col" className="text-left py-3 px-4 text-[11px] font-medium text-[var(--text-muted)]">Salary Range</th>
 <th scope="col" className="text-center py-3 px-4 text-[11px] font-medium text-[var(--text-muted)]">Transparent</th>
 <th scope="col" className="text-center py-3 px-4 text-[11px] font-medium text-[var(--text-muted)]">Applications</th>
 <th scope="col" className="text-center py-3 px-4 text-[11px] font-medium text-[var(--text-muted)]">Hires</th>
 </tr>
 </thead>
 <tbody>
 {data.slice(0, 10).map((item, index) => (
 <tr key={index} className="border-b border-[var(--border-primary)]/50 hover:bg-[var(--bg-accent)]/50 transition-colors">
 <td className="py-3 px-4 text-sm font-bold">{item.JobTitle || 'Unknown'}</td>
 <td className="py-3 px-4 text-sm text-[var(--text-muted)]">
 {item.MinSalary && item.MaxSalary
 ? `${formatCurrency(item.MinSalary)} - ${formatCurrency(item.MaxSalary)}`
 : 'Not disclosed'}
 </td>
 <td className="py-3 px-4 text-center">
 {item.IsTransparent ? (
 <CheckCircle className="w-5 h-5 text-[var(--success)] mx-auto" />
 ) : (
 <XCircle className="w-5 h-5 text-[var(--warning)] mx-auto" />
 )}
 </td>
 <td className="py-3 px-4 text-center text-sm font-bold">{item.ApplicationCount || 0}</td>
 <td className="py-3 px-4 text-center text-sm font-bold text-[var(--success)]">{item.HireCount || 0}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 );
};

export default SalaryTransparencyAnalytics;
