import React from 'react';
import { Shield, AlertTriangle, CheckCircle, RefreshCw, Search, Filter, AlertCircle, Zap, TrendingUp, Users, Loader2, MessageSquare, ClipboardList, Target } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../../apiConfig';

const BiasLogs = () => {
 const [logs, setLogs] = React.useState([]);
 const [loading, setLoading] = React.useState(true);
 const [filter, setFilter] = React.useState('all');

 React.useEffect(() => {
 fetchLogs();
 }, []);

 const fetchLogs = async () => {
 setLoading(true);
 try {
 const res = await axios.get(`${API_BASE}/analytics/bias-logs`);
 setLogs(res.data || []);
 } catch (err) {
 console.error("Fetch logs error:", err);
 } finally {
 setLoading(false);
 }
 };

 const resolveLog = async (id) => {
 try {
 await axios.put(`${API_BASE}/analytics/bias-logs/${id}/resolve`);
 fetchLogs();
 } catch (err) {
 console.error("Resolve error:", err);
 }
 };

 const getSeverityColor = (severity) => {
 if (severity >= 4) return 'text-[var(--danger)]';
 if (severity >= 2) return 'text-[var(--warning)]';
 return 'text-[var(--accent)]';
 };

 const getSeverityBg = (severity) => {
 if (severity >= 4) return 'bg-[var(--danger)]/10 border-[var(--danger)]/20';
 if (severity >= 2) return 'bg-[var(--warning)]/10 border-amber-500/20';
 return 'bg-[var(--accent)]/10 border-[var(--accent)]/20';
 };

 const getTypeIcon = (type) => {
 if (type === 'FeedbackBias') return <MessageSquare size={14} />;
 if (type === 'ScreeningBias') return <ClipboardList size={14} />;
 if (type === 'InterviewBias') return <Target size={14} />;
 return <AlertTriangle size={14} />;
 };

 const filteredLogs = logs.filter(log => {
 if (filter === 'all') return true;
 if (filter === 'resolved') return log.IsResolved;
 if (filter === 'unresolved') return !log.IsResolved;
 return true;
 });

 const stats = {
 total: logs.length,
 resolved: logs.filter(l => l.IsResolved).length,
 unresolved: logs.filter(l => !l.IsResolved).length,
 highSeverity: logs.filter(l => l.Severity >= 4 && !l.IsResolved).length
 };

 if (loading) {
 return (
 <div className="flex flex-col items-center justify-center py-20">
 <Loader2 className="w-12 h-12 text-[var(--accent)] animate-spin mb-4" />
 <p className="text-[11px] font-semibold text-[var(--text-muted)]">Loading Bias Logs...</p>
 </div>
 );
 }

 return (
 <div className="space-y-6 sm:space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
 <div className="glass-card rounded-[var(--radius-xl)] p-8 border border-[var(--accent)]/20">
 <div className="flex items-center gap-4">
 <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
 <Shield size={28} />
 </div>
 <div>
 <h2 className="text-lg sm:text-xl font-medium">Bias Detection Logs</h2>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Track and resolve bias incidents in the hiring process</p>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-[var(--accent)]">
 <div className="flex items-center gap-3 mb-2">
 <Shield size={18} className="text-[var(--accent)]" />
 <span className="text-[11px] font-medium text-[var(--accent)]">Total Logs</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">{stats.total}</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">All incidents</p>
 </div>
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-[var(--danger)]/20">
 <div className="flex items-center gap-3 mb-2">
 <AlertTriangle size={18} className="text-[var(--danger)]" />
 <span className="text-[11px] font-medium text-[var(--danger)]">High Severity</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold text-[var(--danger)]">{stats.highSeverity}</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Critical incidents</p>
 </div>
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-emerald-500/20">
 <div className="flex items-center gap-3 mb-2">
 <CheckCircle size={18} className="text-[var(--success)]" />
 <span className="text-[11px] font-medium text-[var(--success)]">Resolved</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold text-[var(--success)]">{stats.resolved}</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Incidents resolved</p>
 </div>
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-amber-500/20">
 <div className="flex items-center gap-3 mb-2">
 <Zap size={18} className="text-[var(--warning)]" />
 <span className="text-[11px] font-medium text-[var(--warning)]">Unresolved</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold text-[var(--warning)]">{stats.unresolved}</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Require attention</p>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
 {/* Bias Overview */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8">
 <h3 className="text-lg font-medium mb-6">Bias Detection Overview</h3>

 {logs.length > 0 ? (
 <div className="space-y-6">
 {/* Severity Distribution */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="p-6 bg-[var(--bg-accent)] rounded-xl border border-[var(--border-primary)]">
 <h4 className="text-sm font-medium text-[var(--danger)] mb-4 flex items-center gap-2">
 <AlertTriangle size={16} /> Critical Incidents
 </h4>
 <div className="space-y-3">
 {logs.filter(log => log.Severity >= 4).slice(0, 4).map((log, i) => (
 <div key={i} className="flex items-center justify-between">
 <span className="text-sm font-semibold">{log.DetectionType}</span>
 <span className="text-sm font-semibold text-[var(--danger)]">Severity {log.Severity}</span>
 </div>
 ))}
 {logs.filter(log => log.Severity >= 4).length === 0 && (
 <div className="text-center text-[var(--success)] font-semibold">No critical incidents</div>
 )}
 </div>
 </div>

 <div className="p-6 bg-[var(--bg-accent)] rounded-xl border border-[var(--border-primary)]">
 <h4 className="text-sm font-medium text-[var(--warning)] mb-4 flex items-center gap-2">
 <Zap size={16} /> Unresolved Cases
 </h4>
 <div className="space-y-3">
 {logs.filter(log => !log.IsResolved).slice(0, 4).map((log, i) => (
 <div key={i} className="flex items-center justify-between">
 <span className="text-sm font-semibold">{log.DetectionType}</span>
 <span className="text-sm font-semibold text-[var(--warning)]">Pending</span>
 </div>
 ))}
 {logs.filter(log => !log.IsResolved).length === 0 && (
 <div className="text-center text-[var(--success)] font-semibold">All incidents resolved</div>
 )}
 </div>
 </div>
 </div>

 {/* Detection Types */}
 <div className="p-6 bg-[var(--bg-accent)] rounded-xl border border-[var(--border-primary)]">
 <h4 className="text-sm font-medium text-[var(--accent)] mb-4 flex items-center gap-2">
 <TrendingUp size={16} /> Detection Types
 </h4>
 <div className="space-y-3">
 {['FeedbackBias', 'ScreeningBias', 'InterviewBias'].map((type, i) => {
 const count = logs.filter(log => log.DetectionType === type).length;
 const unresolved = logs.filter(log => log.DetectionType === type && !log.IsResolved).length;
 return (
 <div key={i} className="flex items-center justify-between">
 <span className="text-sm font-semibold">{type}</span>
 <div className="flex items-center gap-2">
 <span className="text-sm font-semibold text-[var(--accent)]">{count}</span>
 {unresolved > 0 && (
 <span className="text-xs font-semibold text-[var(--warning)]">({unresolved} unresolved)</span>
 )}
 </div>
 </div>
 );
 })}
 </div>
 </div>
 </div>
 ) : (
 <div className="text-center py-12 text-[var(--text-muted)]">
 <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
 <p>No bias logs available yet.</p>
 <p className="text-xs mt-1">Bias detection is active and monitoring the hiring process.</p>
 </div>
 )}
 </div>

 {/* Filter Controls */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8">
 <div className="flex items-center justify-between mb-6">
 <h3 className="text-lg font-medium">Filter Controls</h3>
 <button
 onClick={fetchLogs}
 className="p-2 hover:bg-[var(--bg-accent)] rounded-xl transition-colors"
 title="Refresh"
 >
 <RefreshCw className="w-5 h-5 text-[var(--text-muted)]" />
 </button>
 </div>

 {/* Filter Buttons */}
 <div className="space-y-4">
 <div className="flex gap-2">
 {[
 { key: 'all', label: 'All Logs', icon: <Shield size={16} /> },
 { key: 'unresolved', label: 'Unresolved', icon: <AlertTriangle size={16} /> },
 { key: 'resolved', label: 'Resolved', icon: <CheckCircle size={16} /> }
 ].map(f => (
 <button
 key={f.key}
 onClick={() => setFilter(f.key)}
 className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border transition-all ${filter === f.key
 ? 'bg-[var(--accent)] text-white'
 : 'bg-[var(--bg-accent)] border-[var(--border-primary)] hover:bg-[var(--bg-accent)]/50'
 }`}
 >
 {f.icon}
 {f.label}
 </button>
 ))}
 </div>

 {/* Filter Summary */}
 <div className="p-6 bg-[var(--bg-accent)] rounded-xl border border-[var(--border-primary)]">
 <h4 className="text-sm font-medium text-[var(--text-muted)] mb-3">Filter Summary</h4>
 <div className="grid grid-cols-2 gap-4 text-sm">
 <div className="flex items-center justify-between">
 <span className="text-[var(--text-muted)]">Showing:</span>
 <span className="font-semibold">{filter}</span>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-[var(--text-muted)]">Results:</span>
 <span className="font-semibold">{filteredLogs.length}</span>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-[var(--text-muted)]">Total Logs:</span>
 <span className="font-semibold">{logs.length}</span>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-[var(--text-muted)]">Resolution Rate:</span>
 <span className="font-semibold text-[var(--success)]">
 {logs.length > 0 ? Math.round((stats.resolved / logs.length) * 100) : 0}%
 </span>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Logs List */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8">
 <div className="flex items-center justify-between mb-6">
 <h3 className="text-lg font-medium">Bias Detection Logs</h3>
 <span className="text-[11px] font-semibold text-[var(--text-muted)]">
 {filteredLogs.length} logs found
 </span>
 </div>

 {filteredLogs.length > 0 ? (
 <div className="space-y-6">
 {filteredLogs.map((log) => (
 <div
 key={log.DetectionID}
 className={`p-6 bg-[var(--bg-accent)] rounded-xl border ${log.IsResolved ? 'border-emerald-500/20 opacity-60' : getSeverityBg(log.Severity)} hover:bg-[var(--bg-accent)]/50 transition-colors`}
 >
 <div className="flex items-start justify-between">
 <div className="flex items-start gap-4">
 <div className="text-xl sm:text-2xl">{getTypeIcon(log.DetectionType)}</div>
 <div>
 <div className="flex items-center gap-2 mb-2">
 <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${log.DetectionType === 'FeedbackBias' ? 'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20' :
 log.DetectionType === 'ScreeningBias' ? 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]' :
 'bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/20'
 }`}>
 {log.DetectionType}
 </span>
 <span className={`text-xs font-semibold ${getSeverityColor(log.Severity)}`}>
 Severity: {log.Severity}/5
 </span>
 {log.IsResolved && (
 <span className="px-2 py-1 rounded-lg bg-[var(--success)]/10 text-[var(--success)] text-xs font-semibold border-emerald-500/20">
 Resolved
 </span>
 )}
 </div>
 <p className="text-sm font-bold mb-2">{log.Details}</p>
 {log.SuggestedActions && (
 <p className="text-xs text-[var(--text-muted)] mb-2">
 <strong>Suggested Action:</strong> {log.SuggestedActions}
 </p>
 )}
 <div className="flex gap-4 text-[11px] text-[var(--text-muted)] font-medium">
 <span>Detected: {new Date(log.DetectedAt).toLocaleString()}</span>
 {log.RecruiterName && <span>By: {log.RecruiterName}</span>}
 {log.ResolvedAt && <span>Resolved: {new Date(log.ResolvedAt).toLocaleString()}</span>}
 </div>
 </div>
 </div>
 {!log.IsResolved && (
 <button
 onClick={() => resolveLog(log.DetectionID)}
 className="px-4 py-2 bg-[var(--success)]/10 text-[var(--success)] rounded-lg text-xs font-semibold hover:bg-[var(--success)]/20 transition-all border border-emerald-500/20 flex items-center gap-2"
 >
 <CheckCircle size={14} />
 Resolve
 </button>
 )}
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="text-center py-12 text-[var(--text-muted)]">
 <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
 <p>No bias logs found with current filter.</p>
 <p className="text-xs mt-1">Try adjusting the filter settings above.</p>
 </div>
 )}
 </div>

 {/* Empty State */}
 {logs.length === 0 && !loading && (
 <div className="glass-card rounded-[var(--radius-xl)] p-8 text-center">
 <Shield className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4 opacity-50" />
 <p className="text-[var(--text-muted)]">No bias detection logs available yet.</p>
 <p className="text-xs text-[var(--text-muted)] mt-1">Bias detection is active and will log incidents as they are detected.</p>
 </div>
 )}
 </div>
 );
};

export default BiasLogs;