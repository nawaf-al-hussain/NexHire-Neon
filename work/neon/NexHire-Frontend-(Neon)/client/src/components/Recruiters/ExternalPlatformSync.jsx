import React from 'react';
import { Link2, RefreshCw, CheckCircle, XCircle, AlertCircle, ExternalLink, Loader2, Users, TrendingUp, Clock, BarChart3 } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../../apiConfig';

const ExternalPlatformSync = () => {
 const [syncData, setSyncData] = React.useState([]);
 const [loading, setLoading] = React.useState(true);
 const [error, setError] = React.useState(null);
 const [syncing, setSyncing] = React.useState(false);
 const [syncStats, setSyncStats] = React.useState({
 linkedinJobs: 0,
 indeedJobs: 0,
 glassdoorJobs: 0,
 lastSync: 'Never'
 });

 React.useEffect(() => {
 fetchSyncData();
 }, []);

 const fetchSyncData = async () => {
 setLoading(true);
 setError(null);
 try {
 const res = await axios.get(`${API_BASE}/recruiters/platform-sync`);
 setSyncData(res.data || []);

 // Calculate stats from sync data
 const linkedinJobs = res.data.filter(s => s.Platform === 'LinkedIn').length;
 const indeedJobs = res.data.filter(s => s.Platform === 'Indeed').length;
 const glassdoorJobs = res.data.filter(s => s.Platform === 'Glassdoor').length;

 // Find most recent sync
 const sorted = res.data.sort((a, b) => new Date(b.LastSyncedAt) - new Date(a.LastSyncedAt));
 const lastSync = sorted.length > 0 && sorted[0].LastSyncedAt
 ? new Date(sorted[0].LastSyncedAt).toLocaleDateString()
 : 'Never';

 setSyncStats({
 linkedinJobs,
 indeedJobs,
 glassdoorJobs,
 lastSync
 });
 } catch (err) {
 console.error("Platform Sync Fetch Error:", err);
 setError(err.response?.data?.error || "Failed to load platform sync data");
 } finally {
 setLoading(false);
 }
 };

 const handleSync = async (platform) => {
 try {
 setSyncing(true);
 await axios.post(`${API_BASE}/recruiters/platform-sync`, {
 platform: platform,
 syncDirection: 'Export'
 });
 await fetchSyncData();
 } catch (err) {
 console.error("Sync Error:", err);
 } finally {
 setSyncing(false);
 }
 };

 const getStatusIcon = (status) => {
 switch (status) {
 case 'Success': return <CheckCircle className="w-4 h-4 text-[var(--success)]" />;
 case 'Failed': return <XCircle className="w-4 h-4 text-[var(--danger)]" />;
 case 'Pending': return <RefreshCw className="w-4 h-4 text-[var(--warning)] animate-spin" />;
 default: return <AlertCircle className="w-4 h-4 text-[var(--text-muted)]" />;
 }
 };

 const getPlatformColor = (platform) => {
 switch (platform) {
 case 'LinkedIn': return 'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20';
 case 'Indeed': return 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]';
 case 'Glassdoor': return 'bg-[var(--success)]/10 text-[var(--success)] border-emerald-500/20';
 default: return 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] border-slate-500/20';
 }
 };

 const getPlatformIcon = (platform) => {
 switch (platform) {
 case 'LinkedIn': return <Link2 className="w-5 h-5 text-[var(--accent)]" />;
 case 'Indeed': return <Users className="w-5 h-5 text-[var(--accent)]" />;
 case 'Glassdoor': return <ExternalLink className="w-5 h-5 text-[var(--success)]" />;
 default: return <Link2 className="w-5 h-5 text-[var(--text-muted)]" />;
 }
 };

 if (loading && syncData.length === 0) {
 return (
 <div className="flex flex-col items-center justify-center py-20">
 <Loader2 className="w-12 h-12 text-[var(--accent)] animate-spin mb-4" />
 <p className="text-[11px] font-semibold text-[var(--text-muted)]">Loading Platform Sync...</p>
 </div>
 );
 }

 if (error) {
 return (
 <div className="glass-card p-8 rounded-[var(--radius-xl)] text-center">
 <AlertCircle className="w-12 h-12 text-[var(--danger)] mx-auto mb-4" />
 <h3 className="text-sm font-medium mb-2">Error Loading Data</h3>
 <p className="text-xs font-semibold text-[var(--text-muted)] mb-4">{error}</p>
 <button
 onClick={fetchSyncData}
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
 <Link2 size={28} />
 </div>
 <div>
 <h2 className="text-lg sm:text-xl font-medium">Platform Sync</h2>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Sync jobs to external platforms and track performance</p>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-[var(--accent)]/20">
 <div className="flex items-center gap-3 mb-2">
 <Link2 size={18} className="text-[var(--accent)]" />
 <span className="text-[11px] font-medium text-[var(--accent)]">LinkedIn Jobs</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">{syncStats.linkedinJobs}</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Active listings</p>
 </div>
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-[var(--accent)]">
 <div className="flex items-center gap-3 mb-2">
 <Users size={18} className="text-[var(--accent)]" />
 <span className="text-[11px] font-medium text-[var(--accent)]">Indeed Jobs</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">{syncStats.indeedJobs}</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Active listings</p>
 </div>
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-emerald-500/20">
 <div className="flex items-center gap-3 mb-2">
 <ExternalLink size={18} className="text-[var(--success)]" />
 <span className="text-[11px] font-medium text-[var(--success)]">Glassdoor Jobs</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">{syncStats.glassdoorJobs}</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Active listings</p>
 </div>
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-amber-500/20">
 <div className="flex items-center gap-3 mb-2">
 <Clock size={18} className="text-[var(--warning)]" />
 <span className="text-[11px] font-medium text-[var(--warning)]">Last Sync</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">{syncStats.lastSync}</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Most recent</p>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
 {/* Sync Actions */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8">
 <h3 className="text-lg font-medium mb-6">Sync Actions</h3>

 <div className="space-y-4">
 {[
 { name: 'LinkedIn', color: 'blue', icon: <Link2 size={20} /> },
 { name: 'Indeed', color: 'indigo', icon: <Users size={20} /> },
 { name: 'Glassdoor', color: 'emerald', icon: <ExternalLink size={20} /> }
 ].map((platform) => (
 <div key={platform.name} className="p-6 bg-[var(--bg-accent)] rounded-xl border border-[var(--border-primary)]">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-4">
 <div className={`w-12 h-12 rounded-xl bg-${platform.color}-500/10 flex items-center justify-center text-${platform.color}-500`}>
 {platform.icon}
 </div>
 <div>
 <div className="text-sm font-semibold">{platform.name}</div>
 <div className="text-xs text-[var(--text-muted)]">Job syndication platform</div>
 </div>
 </div>
 <button
 onClick={() => handleSync(platform.name)}
 disabled={syncing}
 className={`px-6 py-3 rounded-xl text-xs font-medium transition-all ${syncing
 ? 'bg-[var(--bg-accent)] text-[var(--text-muted)] cursor-not-allowed'
 : `bg-${platform.color}-600 hover:bg-${platform.color}-500 text-white`
 }`}
 >
 <div className="flex items-center gap-2">
 <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
 {syncing ? 'Syncing...' : 'Sync Jobs'}
 </div>
 </button>
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Recent Activity */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8">
 <div className="flex items-center justify-between mb-6">
 <h3 className="text-lg font-medium">Recent Sync Activity</h3>
 <button
 onClick={fetchSyncData}
 className="p-2 hover:bg-[var(--bg-accent)] rounded-xl transition-colors"
 title="Refresh"
 >
 <RefreshCw className="w-5 h-5 text-[var(--text-muted)]" />
 </button>
 </div>

 {syncData.length > 0 ? (
 <div className="space-y-4">
 {syncData.slice(0, 6).map((sync, idx) => (
 <div key={idx} className="p-4 bg-[var(--bg-accent)] rounded-xl border border-[var(--border-primary)] hover:bg-[var(--bg-accent)]/50 transition-colors">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-4">
 <div className={`w-10 h-10 rounded-lg ${getPlatformColor(sync.Platform)}`}>
 {getPlatformIcon(sync.Platform)}
 </div>
 <div>
 <div className="font-semibold text-sm">{sync.Platform}</div>
 <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
 <span className="flex items-center gap-1">
 <BarChart3 size={12} /> {sync.SyncDirection || 'Export'}
 </span>
 <span className="flex items-center gap-1">
 <Clock size={12} /> {sync.SyncStatus || 'Unknown'}
 </span>
 </div>
 </div>
 </div>
 <div className="flex items-center gap-4">
 <span className={`text-[11px] font-semibold px-2 py-1 rounded-lg border ${getPlatformColor(sync.Platform)}`}>
 {sync.SyncStatus || 'Unknown'}
 </span>
 {sync.ProfileURL && (
 <a
 href={sync.ProfileURL}
 target="_blank"
 rel="noopener noreferrer"
 className="p-2 hover:bg-[var(--bg-primary)] rounded-lg transition-colors"
 >
 <ExternalLink size={16} className="text-[var(--text-muted)]" />
 </a>
 )}
 </div>
 </div>
 <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-muted)]">
 <span className="flex items-center gap-1">
 <Clock size={12} />
 {sync.LastSyncedAt
 ? new Date(sync.LastSyncedAt).toLocaleString()
 : 'Never'}
 </span>
 <span className="font-semibold text-[var(--text-secondary)]">
 {sync.JobsSynced || 0} jobs
 </span>
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="text-center py-12 text-[var(--text-muted)]">
 <Link2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
 <p>No sync activity yet.</p>
 <p className="text-xs mt-1">Click "Sync Jobs" to start syncing to external platforms.</p>
 </div>
 )}
 </div>
 </div>

 {/* Sync Overview */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8">
 <h3 className="text-lg font-medium mb-6">Sync Overview</h3>

 {syncData.length > 0 ? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
 {/* Success Rate */}
 <div className="p-6 bg-[var(--bg-accent)] rounded-xl border border-[var(--border-primary)]">
 <h4 className="text-sm font-medium text-[var(--success)] mb-4 flex items-center gap-2">
 <CheckCircle size={16} /> Success Rate
 </h4>
 <div className="space-y-3">
 {['LinkedIn', 'Indeed', 'Glassdoor'].map((platform) => {
 const platformData = syncData.filter(s => s.Platform === platform);
 const successCount = platformData.filter(s => s.SyncStatus === 'Success').length;
 const totalCount = platformData.length;
 const rate = totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 0;

 return (
 <div key={platform} className="flex items-center justify-between">
 <span className="text-sm font-semibold">{platform}</span>
 <span className="text-sm font-semibold text-[var(--success)]">{rate}%</span>
 </div>
 );
 })}
 </div>
 </div>

 {/* Platform Distribution */}
 <div className="p-6 bg-[var(--bg-accent)] rounded-xl border border-[var(--border-primary)]">
 <h4 className="text-sm font-medium text-[var(--accent)] mb-4 flex items-center gap-2">
 <BarChart3 size={16} /> Platform Distribution
 </h4>
 <div className="space-y-3">
 {['LinkedIn', 'Indeed', 'Glassdoor'].map((platform) => {
 const count = syncData.filter(s => s.Platform === platform).length;
 return (
 <div key={platform} className="flex items-center justify-between">
 <span className="text-sm font-semibold">{platform}</span>
 <span className="text-sm font-semibold text-[var(--accent)]">{count}</span>
 </div>
 );
 })}
 </div>
 </div>

 {/* Recent Issues */}
 <div className="p-6 bg-[var(--bg-accent)] rounded-xl border border-[var(--border-primary)]">
 <h4 className="text-sm font-medium text-[var(--danger)] mb-4 flex items-center gap-2">
 <XCircle size={16} /> Recent Issues
 </h4>
 <div className="space-y-3">
 {syncData.filter(s => s.SyncStatus === 'Failed').slice(0, 3).map((sync, i) => (
 <div key={i} className="flex items-center justify-between text-xs">
 <span className="font-semibold">{sync.Platform}</span>
 <span className="text-[var(--danger)] font-semibold">Failed</span>
 </div>
 ))}
 {syncData.filter(s => s.SyncStatus === 'Failed').length === 0 && (
 <div className="text-center text-[var(--success)] font-semibold">No issues found</div>
 )}
 </div>
 </div>
 </div>
 ) : (
 <div className="text-center py-8 text-[var(--text-muted)]">
 <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
 <p>No sync data available yet.</p>
 <p className="text-xs mt-1">Start syncing jobs to external platforms to see performance metrics.</p>
 </div>
 )}
 </div>

 {/* Empty State */}
 {(!syncData || syncData.length === 0) && !loading && (
 <div className="glass-card rounded-[var(--radius-xl)] p-8 text-center">
 <Link2 className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4 opacity-50" />
 <p className="text-[var(--text-muted)]">No platform sync data available yet.</p>
 <p className="text-xs text-[var(--text-muted)] mt-1">Start syncing jobs to external platforms to see detailed analytics.</p>
 </div>
 )}
 </div>
 );
};

export default ExternalPlatformSync;