import React from 'react';
import { AlertTriangle, Users, Clock, MessageSquare, TrendingDown, Shield, Search, Filter, SortAsc, Download, RefreshCw, Bell, Calendar, X } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../../apiConfig';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useToast } from '../../components/ui/Toast';

const GhostingRiskDetail = () => {
    const { toast } = useToast();
 const [ghostingData, setGhostingData] = React.useState([]);
 const [loading, setLoading] = React.useState(true);
 const [searchTerm, setSearchTerm] = React.useState('');
 const [riskFilter, setRiskFilter] = React.useState('All');
 const [sortBy, setSortBy] = React.useState('risk');
 const [autoRefresh, setAutoRefresh] = React.useState(true);
 const [refreshInterval, setRefreshInterval] = React.useState(null);
 const [showReminderModal, setShowReminderModal] = React.useState(false);
 const [selectedCandidate, setSelectedCandidate] = React.useState(null);

 const fetchData = async () => {
 setLoading(true);
 try {
 const res = await axios.get(`${API_BASE}/analytics/ghosting-detail`);
 if (res.data && Array.isArray(res.data)) {
 setGhostingData(res.data);
 }
 } catch (err) {
 console.error("Ghosting Detail Fetch Error:", err);
 } finally {
 setLoading(false);
 }
 };

 React.useEffect(() => {
 fetchData();
 }, []);

 // Auto-refresh every 30 seconds
 React.useEffect(() => {
 if (autoRefresh) {
 const interval = setInterval(() => {
 fetchData();
 }, 30000);
 setRefreshInterval(interval);
 return () => clearInterval(interval);
 } else if (refreshInterval) {
 clearInterval(refreshInterval);
 }
 }, [autoRefresh]);

 const handleSendReminder = async () => {
 if (!selectedCandidate) return;
 try {
 const message = `Reminder: Please respond regarding your application for ${selectedCandidate.JobTitle}`;
 await axios.post(`${API_BASE}/recruiters/send-reminder`, {
 candidateId: selectedCandidate.CandidateID,
 jobId: selectedCandidate.JobID || selectedCandidate.jobid || null,
 message: message
 });
 toast('Reminder sent.');
 setShowReminderModal(false);
 setSelectedCandidate(null);
 } catch (err) {
 console.error('Error sending reminder:', err);
 toast('Failed to send reminder');
 }
 };

 const exportToCSV = () => {
 const headers = ['Candidate Name', 'Job Title', 'Risk Score', 'Risk Level', 'Response Time (h)', 'Communication Frequency', 'Days Since Contact'];
 const csvContent = [
 headers.join(','),
 ...filteredData.map(c => [
 c.CandidateName || '',
 c.JobTitle || '',
 c.OverallRiskScore || 0,
 c.OverallRiskLevel || '',
 c.ResponseTimeHours || c.AvgResponseTime || 0,
 c.CommunicationFrequency || (Number(c.TotalCommunications) > 5 ? 'High' : Number(c.TotalCommunications) > 2 ? 'Medium' : 'Low'),
 c.DaysSinceLastContact || c.DaysSinceApplication || 0
 ].join(','))
 ].join('\n');

 const blob = new Blob([csvContent], { type: 'text/csv' });
 const url = window.URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = `ghosting-risk-${new Date().toISOString().split('T')[0]}.csv`;
 a.click();
 window.URL.revokeObjectURL(url);
 };

 const getRiskColor = (level) => {
 if (level === 'High') return 'text-[var(--danger)]';
 if (level === 'Medium') return 'text-[var(--warning)]';
 return 'text-[var(--success)]';
 };

 const getRiskBg = (level) => {
 if (level === 'High') return 'bg-[var(--danger)]/10 border-[var(--danger)]/20';
 if (level === 'Medium') return 'bg-[var(--warning)]/10 border-amber-500/20';
 return 'bg-[var(--success)]/10 border-emerald-500/20';
 };

 const displayData = ghostingData;

 // Filter by search term
 const searchFiltered = displayData.filter(c =>
 (c.CandidateName || '').toLowerCase().includes(searchTerm.toLowerCase())
 );

 // Filter by risk level
 const filteredData = riskFilter === 'All'
 ? searchFiltered
 : searchFiltered.filter(c => c.OverallRiskLevel === riskFilter);

 // Sort data
 const sortedData = [...filteredData].sort((a, b) => {
 switch (sortBy) {
 case 'risk':
 return (b.OverallRiskScore || 0) - (a.OverallRiskScore || 0);
 case 'response':
 return (b.ResponseTimeHours || b.AvgResponseTime || 0) - (a.ResponseTimeHours || a.AvgResponseTime || 0);
 case 'days':
 return (b.DaysSinceLastContact || b.DaysSinceApplication || 0) - (a.DaysSinceLastContact || a.DaysSinceApplication || 0);
 default:
 return 0;
 }
 });

 // Generate trend data for chart (simulated based on current data)
 const trendData = [
 { date: 'Feb 15', high: 3, medium: 4, low: 8 },
 { date: 'Feb 16', high: 4, medium: 3, low: 7 },
 { date: 'Feb 17', high: 2, medium: 5, low: 9 },
 { date: 'Feb 18', high: 5, medium: 2, low: 6 },
 { date: 'Feb 19', high: 3, medium: 4, low: 8 },
 { date: 'Feb 20', high: 2, medium: 3, low: 10 }
 ];

 if (loading) {
 return (
 <div className="flex items-center justify-center py-20">
 <RefreshCw className="w-8 h-8 text-[var(--accent)] animate-spin" />
 <span className="ml-3 text-sm font-medium text-[var(--text-muted)]">Loading Ghosting Risk Data...</span>
 </div>
 );
 }

 return (
 <div className="space-y-6 sm:space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
 {/* Header */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8 border border-[var(--danger)]/20">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-4">
 <div className="w-14 h-14 rounded-2xl bg-[var(--danger)]/10 flex items-center justify-center text-[var(--danger)]">
 <Shield size={28} />
 </div>
 <div>
 <h2 className="text-lg sm:text-xl font-medium">Ghosting Risk Analysis</h2>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Detailed candidate ghosting prediction</p>
 </div>
 </div>
 <div className="flex items-center gap-3">
 <button
 onClick={() => setAutoRefresh(!autoRefresh)}
 className={`p-3 rounded-xl border transition-all ${autoRefresh ? 'bg-[var(--danger)]/20 border-rose-500/30 text-[var(--danger)]' : 'dark:bg-[var(--bg-tertiary)] bg-slate-200 border-slate-300 dark:border-slate-500/20 dark:text-[var(--text-muted)] text-slate-600'}`}
 title={autoRefresh ? 'Auto-refresh ON (30s)' : 'Auto-refresh OFF'}
 >
 <RefreshCw size={18} className={autoRefresh ? 'animate-spin' : ''} />
 </button>
 <button
 onClick={exportToCSV}
 className="p-3 rounded-xl border dark:bg-[var(--bg-tertiary)] bg-slate-200 border-slate-300 dark:border-slate-500/20 dark:text-[var(--text-muted)] text-slate-600 hover:dark:bg-slate-500/20 hover:bg-slate-300 transition-all"
 title="Export to CSV"
 >
 <Download size={18} />
 </button>
 </div>
 </div>
 </div>

 {/* Filters & Search Bar */}
 <div className="glass-card rounded-[var(--radius-xl)] p-6">
 <div className="flex flex-wrap items-center gap-4">
 {/* Search */}
 <div className="relative flex-1 min-w-[200px]">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 dark:text-[var(--text-muted)] text-[var(--text-muted)]" size={16} />
 <input
 type="text"
 placeholder="Search candidates..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="w-full dark:bg-slate-800/50 bg-white border dark:border-slate-700 border-slate-300 rounded-xl pl-10 pr-4 py-3 text-xs font-bold dark:placeholder:text-[var(--text-muted)] placeholder:text-[var(--text-muted)] dark:text-slate-200 text-slate-700 focus:ring-2 focus:ring-rose-500/30 outline-none transition-all"
 />
 </div>

 {/* Risk Level Filter */}
 <div className="flex items-center gap-2">
 <Filter size={16} className="dark:text-[var(--text-muted)] text-[var(--text-muted)]" />
 <div className="flex rounded-xl border dark:border-slate-700 border-slate-300 overflow-hidden">
 {['All', 'High', 'Medium', 'Low'].map(level => (
 <button
 key={level}
 onClick={() => setRiskFilter(level)}
 className={`px-4 py-2 text-[11px] font-medium transition-all ${riskFilter === level
 ? level === 'High' ? 'bg-[var(--danger)] text-white'
 : level === 'Medium' ? 'bg-[var(--warning)] text-white'
 : level === 'Low' ? 'bg-[var(--success)] text-white'
 : 'bg-slate-500 text-white'
 : 'dark:bg-slate-800 dark:text-[var(--text-muted)] bg-white text-slate-600 border border-slate-200 dark:hover:bg-slate-700 hover:bg-slate-100'
 }`}
 >
 {level}
 </button>
 ))}
 </div>
 </div>

 {/* Sort */}
 <div className="flex items-center gap-2">
 <SortAsc size={16} className="dark:text-[var(--text-muted)] text-[var(--text-muted)]" />
 <select
 value={sortBy}
 onChange={(e) => setSortBy(e.target.value)}
 className="dark:bg-slate-800/50 bg-white border dark:border-slate-700 border-slate-300 rounded-xl px-4 py-3 text-xs font-bold dark:text-[var(--text-muted)] text-slate-600 focus:ring-2 focus:ring-rose-500/30 outline-none cursor-pointer"
 >
 <option value="risk">Sort by Risk</option>
 <option value="response">Sort by Response</option>
 <option value="days">Sort by Days</option>
 </select>
 </div>
 </div>
 </div>

 {/* Risk Summary */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-[var(--danger)]/20">
 <div className="flex items-center gap-3 mb-2">
 <AlertTriangle size={18} className="text-[var(--danger)]" />
 <span className="text-[11px] font-medium text-[var(--danger)]">High Risk</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">{displayData.filter(d => d.OverallRiskLevel === 'High').length}</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Candidates</p>
 </div>
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-amber-500/20">
 <div className="flex items-center gap-3 mb-2">
 <TrendingDown size={18} className="text-[var(--warning)]" />
 <span className="text-[11px] font-medium text-[var(--warning)]">Medium Risk</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">{displayData.filter(d => d.OverallRiskLevel === 'Medium').length}</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Candidates</p>
 </div>
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-emerald-500/20">
 <div className="flex items-center gap-3 mb-2">
 <Users size={18} className="text-[var(--success)]" />
 <span className="text-[11px] font-medium text-[var(--success)]">Low Risk</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">{displayData.filter(d => d.OverallRiskLevel === 'Low').length}</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Candidates</p>
 </div>
 </div>

 {/* Risk Trend Chart */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8">
 <h3 className="text-lg font-medium mb-6">Risk Trend Over Time</h3>
 <div className="h-64">
 <ResponsiveContainer width="100%" height="100%">
 <LineChart data={trendData}>
 <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
 <XAxis dataKey="date" stroke="#9CA3AF" fontSize={10} />
 <YAxis stroke="#9CA3AF" fontSize={10} />
 <Tooltip
 contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
 labelStyle={{ color: '#F9FAFB' }}
 />
 <Line type="monotone" dataKey="high" stroke="#F43F5E" strokeWidth={2} name="High Risk" dot={{ r: 4 }} />
 <Line type="monotone" dataKey="medium" stroke="#F59E0B" strokeWidth={2} name="Medium Risk" dot={{ r: 4 }} />
 <Line type="monotone" dataKey="low" stroke="#10B981" strokeWidth={2} name="Low Risk" dot={{ r: 4 }} />
 </LineChart>
 </ResponsiveContainer>
 </div>
 </div>

 {/* Detailed List */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8">
 <h3 className="text-lg font-medium mb-6">
 All Candidates Risk Assessment
 <span className="text-[var(--text-muted)] text-sm font-normal ml-2">({sortedData.length} results)</span>
 </h3>
 <div className="space-y-4">
 {sortedData.map((candidate, i) => (
 <div key={i} className={`p-5 rounded-2xl border ${getRiskBg(candidate.OverallRiskLevel)}`}>
 <div className="flex items-center justify-between mb-4">
 <div>
 <h4 className="text-sm font-semibold">{candidate.CandidateName || 'Unknown'}</h4>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">{candidate.JobTitle || 'N/A'}</p>
 </div>
 <div className="text-right flex items-center gap-4">
 <div>
 <div className={`text-lg font-semibold ${getRiskColor(candidate.OverallRiskLevel)}`}>
 {candidate.OverallRiskScore || 0}%
 </div>
 <span className={`text-[11px] font-medium ${getRiskColor(candidate.OverallRiskLevel)}`}>
 {candidate.OverallRiskLevel || 'Low'} Risk
 </span>
 </div>
 <div className="flex gap-2">
 <button
 onClick={() => { setSelectedCandidate(candidate); setShowReminderModal(true); }}
 className="p-2 rounded-lg bg-[var(--danger)]/20 text-[var(--danger)] hover:bg-[var(--danger)]/30 transition-all"
 title="Send Reminder"
 >
 <Bell size={16} />
 </button>
 <button
 className="p-2 rounded-lg bg-[var(--warning)]/20 text-[var(--warning)] hover:bg-[var(--warning)]/30 transition-all"
 title="Schedule Follow-up"
 >
 <Calendar size={16} />
 </button>
 </div>
 </div>
 </div>
 <div className="grid grid-cols-3 gap-4 text-[11px] font-medium">
 <div className="flex items-center gap-2">
 <Clock size={12} className="text-[var(--text-muted)]" />
 <span className="text-[var(--text-muted)]">Response:</span>
 <span>{candidate.ResponseTimeHours || candidate.AvgResponseTime || 0}h</span>
 </div>
 <div className="flex items-center gap-2">
 <MessageSquare size={12} className="text-[var(--text-muted)]" />
 <span className="text-[var(--text-muted)]">Frequency:</span>
 <span>{candidate.CommunicationFrequency || (Number(candidate.TotalCommunications) > 5 ? 'High' : Number(candidate.TotalCommunications) > 2 ? 'Medium' : 'Low')}</span>
 </div>
 <div className="flex items-center gap-2">
 <Users size={12} className="text-[var(--text-muted)]" />
 <span className="text-[var(--text-muted)]">Last Contact:</span>
 <span>{candidate.DaysSinceLastContact || candidate.DaysSinceApplication || 0}d ago</span>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Reminder Modal */}
 {showReminderModal && selectedCandidate && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300">
 <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowReminderModal(false)}></div>

 <div className="relative bg-[var(--bg-primary)] border border-[var(--border-primary)] w-full max-w-lg overflow-hidden rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] flex flex-col text-[var(--text-primary)]">
 {/* Header */}
 <div className="p-8 border-b border-[var(--border-primary)] flex items-center justify-between bg-[var(--bg-accent)]/20">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-2xl bg-[var(--danger)]/10 border border-[var(--danger)]/20 flex items-center justify-center">
 <Bell className="text-[var(--danger)]" size={24} />
 </div>
 <div>
 <h3 className="text-lg sm:text-xl font-semibold tracking-tight">Send Reminder</h3>
 <p className="text-[11px] font-semibold text-[var(--text-muted)] mt-1 italic">Reach out to candidate</p>
 </div>
 </div>
 <button
 onClick={() => setShowReminderModal(false)}
 className="p-2 hover:bg-[var(--bg-tertiary)] rounded-xl transition-all"
 >
 <X size={20} className="text-[var(--text-muted)]" />
 </button>
 </div>

 {/* Content */}
 <div className="p-8 space-y-6">
 {/* Candidate Info */}
 <div className="grid grid-cols-2 gap-4">
 <div className="p-4 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)]">
 <p className="text-[11px] font-semibold text-[var(--text-muted)] mb-1">Candidate</p>
 <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{selectedCandidate.CandidateName}</p>
 </div>
 <div className="p-4 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)]">
 <p className="text-[11px] font-semibold text-[var(--text-muted)] mb-1">Job</p>
 <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{selectedCandidate.JobTitle}</p>
 </div>
 </div>

 {/* Message */}
 <div>
 <p className="text-[11px] font-semibold text-[var(--text-muted)] mb-2">Message</p>
 <textarea
 className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-2xl p-4 text-sm font-normal text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500/50 outline-none resize-none transition-all"
 rows={4}
 defaultValue={`Hi ${selectedCandidate.CandidateName?.split(' ')[0] || 'there'}, just following up on your application for ${selectedCandidate.JobTitle}. Please let us know if you're still interested!`}
 />
 </div>

 {/* Actions */}
 <div className="flex gap-3 pt-2">
 <button
 onClick={() => setShowReminderModal(false)}
 className="flex-1 px-6 py-4 rounded-2xl border border-[var(--border-primary)] text-[var(--text-secondary)] font-semibold text-xs hover:bg-[var(--bg-accent)] transition-all"
 >
 Cancel
 </button>
 <button
 onClick={handleSendReminder}
 className="flex-1 px-6 py-4 rounded-2xl bg-[var(--accent)] text-white font-semibold text-xs shadow-lg transition-all"
 >
 Send Reminder
 </button>
 </div>
 </div>
 </div>
 </div>
 )}
 </div>
 );
};

export default GhostingRiskDetail;
