import React from 'react';
import {
 MapPin, Users, Clock, Globe, AlertTriangle, CheckCircle, TrendingUp,
 Monitor, MessageCircle, Zap
} from 'lucide-react';
import RemoteWorkChart from '../Charts/RemoteWorkChart';

const RemoteWorkAnalytics = ({ data, loading }) => {
 // Calculate summary statistics
 const stats = React.useMemo(() => {
 if (!data || data.length === 0) return null;

 const avgScore = data.reduce((sum, d) => sum + (d.RemoteScore || d.OverallRemoteScore || d.overallremotescore || 0), 0) / data.length;
 const excellentMatches = data.filter(d => d.CompatibilityAssessment === 'Excellent Match').length;
 const goodMatches = data.filter(d => d.CompatibilityAssessment === 'Good Match').length;
 const moderateMatches = data.filter(d => d.CompatibilityAssessment === 'Moderate Match').length;
 const poorMatches = data.filter(d => d.CompatibilityAssessment === 'Poor Match').length;

 const avgWorkspace = data.reduce((sum, d) => sum + (d.WorkspaceQuality || 0), 0) / data.length;
 const avgTimezone = data.reduce((sum, d) => sum + (d.TimezoneAlignment || 0), 0) / data.length;
 const avgCommunication = data.reduce((sum, d) => sum + (d.CommunicationPreference || 0), 0) / data.length;
 const avgDistraction = data.reduce((sum, d) => sum + (d.DistractionResistance || 0), 0) / data.length;
 const avgMotivation = data.reduce((sum, d) => sum + (d.SelfMotivationScore || 0), 0) / data.length;
 const avgOverlap = data.reduce((sum, d) => sum + (d.OverlapHours || 0), 0) / data.length;

 return {
 avgScore: Number(avgScore || 0).toFixed(1),
 excellentMatches,
 goodMatches,
 moderateMatches,
 poorMatches,
 totalCandidates: data.length,
 avgWorkspace: Number(avgWorkspace || 0).toFixed(1),
 avgTimezone: Number(avgTimezone || 0).toFixed(1),
 avgCommunication: Number(avgCommunication || 0).toFixed(1),
 avgDistraction: Number(avgDistraction || 0).toFixed(1),
 avgMotivation: Number(avgMotivation || 0).toFixed(1),
 avgOverlap: Number(avgOverlap || 0).toFixed(1)
 };
 }, [data]);

 // Factor data for radar chart visualization
 const factorData = React.useMemo(() => {
 if (!stats) return [];
 return [
 { factor: 'Workspace', score: parseFloat(stats.avgWorkspace) * 10, fullMark: 100 },
 { factor: 'Timezone', score: parseFloat(stats.avgTimezone) * 10, fullMark: 100 },
 { factor: 'Communication', score: parseFloat(stats.avgCommunication) * 10, fullMark: 100 },
 { factor: 'Distraction', score: parseFloat(stats.avgDistraction) * 10, fullMark: 100 },
 { factor: 'Motivation', score: parseFloat(stats.avgMotivation) * 10, fullMark: 100 }
 ];
 }, [stats]);

 const getAssessmentColor = (assessment) => {
 switch (assessment) {
 case 'Excellent Match': return 'text-[var(--success)] bg-[var(--success)]/10 border-emerald-500/30';
 case 'Good Match': return 'text-[var(--accent)] bg-[var(--accent)]/10 border-blue-500/30';
 case 'Moderate Match': return 'text-[var(--warning)] bg-[var(--warning)]/10 border-amber-500/30';
 case 'Poor Match': return 'text-[var(--danger)] bg-[var(--danger)]/10 border-rose-500/30';
 default: return 'text-[var(--text-muted)] bg-[var(--bg-tertiary)] border-slate-500/30';
 }
 };

 const getScoreColor = (score) => {
 if (score >= 70) return 'text-[var(--success)]';
 if (score >= 40) return 'text-[var(--warning)]';
 return 'text-[var(--danger)]';
 };

 if (loading) {
 return (
 <div className="flex items-center justify-center py-20">
 <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3"></div>
 <span className="text-sm font-medium text-[var(--text-muted)]">Loading Remote Data...</span>
 </div>
 );
 }

 if (!data || data.length === 0) {
 return (
 <div className="glass-card p-8 rounded-[var(--radius-xl)]">
 <div className="flex items-center gap-3 mb-6">
 <MapPin className="w-5 h-5 text-[var(--accent)]" />
 <h3 className="text-sm font-medium">Remote Work Compatibility</h3>
 </div>
 <div className="text-center py-10 text-xs font-semibold text-[var(--text-muted)] opacity-50">
 No remote compatibility data. Connect to database or seed RemoteCompatibility table.
 </div>
 </div>
 );
 }

 return (
 <div className="space-y-5 sm:space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
 {/* Gradient Header */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8 border border-[var(--accent)]/20">
 <div className="flex items-center gap-4">
 <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
 <Globe size={28} />
 </div>
 <div>
 <h2 className="text-lg sm:text-xl font-medium">Remote Work Analytics</h2>
 <p className="text-[11px] font-medium text-[var(--text-muted)]">Remote work compatibility and timezone insights</p>
 </div>
 </div>
 </div>

 {/* Summary Stats Cards */}
 <div className="grid grid-cols-2 md:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 <div className="glass-card rounded-2xl p-6 border border-[var(--accent)]/20">
 <div className="flex items-center gap-2 mb-2">
 <Globe className="w-4 h-4 text-[var(--accent)]" />
 <span className="text-[11px] font-medium text-[var(--accent)]">Avg Remote Score</span>
 </div>
 <div className={`text-2xl sm:text-3xl font-semibold ${getScoreColor(stats.avgScore)}`}>
 {stats.avgScore}%
 </div>
 </div>
 <div className="glass-card rounded-2xl p-6 border border-emerald-500/20">
 <div className="flex items-center gap-2 mb-2">
 <CheckCircle className="w-4 h-4 text-[var(--success)]" />
 <span className="text-[11px] font-medium text-[var(--success)]">Excellent Matches</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold text-[var(--success)]">
 {stats.excellentMatches}
 </div>
 </div>
 <div className="glass-card rounded-2xl p-6 border border-amber-500/20">
 <div className="flex items-center gap-2 mb-2">
 <AlertTriangle className="w-4 h-4 text-[var(--warning)]" />
 <span className="text-[11px] font-medium text-[var(--warning)]">Poor Matches</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold text-[var(--warning)]">
 {stats.poorMatches}
 </div>
 </div>
 <div className="glass-card rounded-2xl p-6 border border-[var(--accent)]/20">
 <div className="flex items-center gap-2 mb-2">
 <Clock className="w-4 h-4 text-[var(--accent)]" />
 <span className="text-[11px] font-medium text-[var(--accent)]">Avg Overlap Hours</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold text-[var(--accent)]">
 {stats.avgOverlap}h
 </div>
 </div>
 </div>

 {/* Role Compatibility Chart */}
 <div className="glass-card p-8 rounded-[var(--radius-xl)]">
 <div className="flex items-center gap-3 mb-6">
 <TrendingUp className="w-5 h-5 text-[var(--accent)]" />
 <h3 className="text-sm font-medium">Role Remote Compatibility</h3>
 </div>
 <RemoteWorkChart data={data} />
 </div>

 {/* Factor Breakdown */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
 {/* Candidate Factors */}
 <div className="glass-card p-8 rounded-[var(--radius-xl)]">
 <div className="flex items-center gap-3 mb-6">
 <Users className="w-5 h-5 text-[var(--accent)]" />
 <h3 className="text-sm font-medium">Candidate Factor Averages</h3>
 </div>
 <div className="space-y-4">
 {[
 { label: 'Workspace Quality', value: stats.avgWorkspace, max: 10 },
 { label: 'Timezone Alignment', value: stats.avgTimezone, max: 10 },
 { label: 'Communication', value: stats.avgCommunication, max: 10 },
 { label: 'Distraction Resistance', value: stats.avgDistraction, max: 10 },
 { label: 'Self Motivation', value: stats.avgMotivation, max: 10 }
 ].map((factor, i) => (
 <div key={i} className="space-y-2">
 <div className="flex justify-between text-xs">
 <span className="font-bold">{factor.label}</span>
 <span className={`font-semibold ${getScoreColor(factor.value * 10)}`}>
 {factor.value}/{factor.max}
 </span>
 </div>
 <div className="h-2 bg-[var(--bg-accent)] rounded-full overflow-hidden">
 <div
 className={`h-full rounded-full ${factor.value >= 7 ? 'bg-[var(--success)]' :
 factor.value >= 4 ? 'bg-[var(--warning)]' : 'bg-[var(--danger)]'
 }`}
 style={{ width: `${(factor.value / factor.max) * 100}%` }}
 />
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Match Distribution */}
 <div className="glass-card p-8 rounded-[var(--radius-xl)]">
 <div className="flex items-center gap-3 mb-6">
 <MapPin className="w-5 h-5 text-[var(--accent)]" />
 <h3 className="text-sm font-medium">Match Distribution</h3>
 </div>
 <div className="space-y-4">
 {[
 { label: 'Excellent Match', count: stats.excellentMatches, color: 'emerald', percent: (stats.excellentMatches / stats.totalCandidates * 100).toFixed(0) },
 { label: 'Good Match', count: stats.goodMatches, color: 'blue', percent: (stats.goodMatches / stats.totalCandidates * 100).toFixed(0) },
 { label: 'Moderate Match', count: stats.moderateMatches, color: 'amber', percent: (stats.moderateMatches / stats.totalCandidates * 100).toFixed(0) },
 { label: 'Poor Match', count: stats.poorMatches, color: 'rose', percent: (stats.poorMatches / stats.totalCandidates * 100).toFixed(0) }
 ].map((match, i) => (
 <div key={i} className="flex items-center gap-4">
 <div className="flex-1">
 <div className="flex justify-between text-xs mb-1">
 <span className="font-bold">{match.label}</span>
 <span className="font-semibold">{match.count} ({match.percent}%)</span>
 </div>
 <div className="h-3 bg-[var(--bg-accent)] rounded-full overflow-hidden">
 <div
 className={`h-full rounded-full bg-${match.color}-500`}
 style={{ width: `${match.percent}%` }}
 />
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>

 {/* Compatibility Assessment Table */}
 <div className="glass-card p-8 rounded-[var(--radius-xl)]">
 <div className="flex items-center gap-3 mb-6">
 <Users className="w-5 h-5 text-[var(--warning)]" />
 <h3 className="text-sm font-medium">Detailed Compatibility Assessment</h3>
 </div>
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="border-b border-[var(--border-primary)]">
 <th scope="col" className="text-left py-3 px-4 text-[11px] font-medium text-[var(--text-muted)]">Candidate</th>
 <th scope="col" className="text-left py-3 px-4 text-[11px] font-medium text-[var(--text-muted)]">Role</th>
 <th scope="col" className="text-center py-3 px-4 text-[11px] font-medium text-[var(--text-muted)]">Score</th>
 <th scope="col" className="text-center py-3 px-4 text-[11px] font-medium text-[var(--text-muted)]">Assessment</th>
 <th scope="col" className="text-center py-3 px-4 text-[11px] font-medium text-[var(--text-muted)]">Timezone Overlap</th>
 </tr>
 </thead>
 <tbody>
 {data.slice(0, 10).map((row, i) => (
 <tr key={i} className="border-b border-[var(--border-primary)] hover:bg-[var(--bg-accent)] transition-colors">
 <td className="py-4 px-4">
 <div className="text-sm font-semibold">{row.FullName || 'N/A'}</div>
 <div className="text-[11px] text-[var(--text-muted)]">{row.CandidateLocation || 'Unknown'}</div>
 </td>
 <td className="py-4 px-4">
 <div className="text-sm font-bold">{row.Role || row.JobTitle || 'N/A'}</div>
 <div className="text-[11px] text-[var(--text-muted)]">{row.JobLocation || 'Unknown'}</div>
 </td>
 <td className="py-4 px-4 text-center">
 <span className={`text-lg font-semibold ${getScoreColor(row.RemoteScore || row.OverallRemoteScore || row.overallremotescore || 0)}`}>
 {row.RemoteScore || row.OverallRemoteScore || row.overallremotescore || 0}%
 </span>
 </td>
 <td className="py-4 px-4 text-center">
 <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold border ${getAssessmentColor(row.CompatibilityAssessment)}`}>
 {row.CompatibilityAssessment || 'N/A'}
 </span>
 </td>
 <td className="py-4 px-4 text-center">
 <div className="text-sm font-bold">{row.OverlapHours || 0}h</div>
 <div className="text-[11px] text-[var(--text-muted)]">Score: {row.OverlapScore || 0}</div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 {data.length > 10 && (
 <div className="text-center py-4 text-[11px] font-bold text-[var(--text-muted)]">
 Showing 10 of {data.length} candidates
 </div>
 )}
 </div>
 </div>
 );
};

export default RemoteWorkAnalytics;