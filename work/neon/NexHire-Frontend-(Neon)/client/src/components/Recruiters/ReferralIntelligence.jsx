import React from 'react';
import {
 Network, Users, TrendingUp, Award, Clock, CheckCircle, AlertCircle,
 Loader2, RefreshCw, ChevronRight, UserPlus, BarChart3, DollarSign,
 Star, Lightbulb, Zap, User, Briefcase, MapPin, Calendar, Filter,
 XCircle
} from 'lucide-react';
import axios from 'axios';
import API_BASE from '../../apiConfig';

const ReferralIntelligence = () => {
 const [data, setData] = React.useState(null);
 const [loading, setLoading] = React.useState(true);
 const [error, setError] = React.useState(null);

 // Job-specific referral suggestions state
 const [jobs, setJobs] = React.useState([]);
 const [selectedJobId, setSelectedJobId] = React.useState('');
 const [jobSuggestions, setJobSuggestions] = React.useState([]);
 const [suggestionsLoading, setSuggestionsLoading] = React.useState(false);
 const [suggestionsError, setSuggestionsError] = React.useState(null);
 const [showSuggestions, setShowSuggestions] = React.useState(false);

 // Fetch jobs list for the dropdown
 const fetchJobs = React.useCallback(async () => {
 try {
 const res = await axios.get(`${API_BASE}/jobs`);
 if (res.data && Array.isArray(res.data)) {
 setJobs(res.data);
 }
 } catch (err) {
 console.error("Failed to fetch jobs:", err);
 }
 }, []);

 // Fetch job-specific referral suggestions
 const fetchJobSuggestions = React.useCallback(async (jobId) => {
 if (!jobId) {
 setJobSuggestions([]);
 return;
 }

 setSuggestionsLoading(true);
 setSuggestionsError(null);

 try {
 const res = await axios.get(`${API_BASE}/recruiters/referral-suggestions/${jobId}`);
 setJobSuggestions(res.data || []);
 } catch (err) {
 console.error("Job Suggestions Error:", err);
 setSuggestionsError(err.response?.data?.error || "Failed to load job suggestions");
 } finally {
 setSuggestionsLoading(false);
 }
 }, []);

 React.useEffect(() => {
 fetchJobs();
 }, [fetchJobs]);

 const fetchData = React.useCallback(async () => {
 setLoading(true);
 setError(null);
 try {
 const res = await axios.get(`${API_BASE}/recruiters/referral-intelligence`);
 setData(res.data);
 } catch (err) {
 console.error("Referral Intelligence Error:", err);
 setError(err.response?.data?.error || "Failed to load referral intelligence");
 } finally {
 setLoading(false);
 }
 }, []);

 React.useEffect(() => {
 fetchData();
 }, [fetchData]);

 const getOutcomeBadge = (outcome) => {
 switch (outcome) {
 case 'Successful':
 return 'bg-[var(--success)]/10 text-[var(--success)] border-emerald-500/20';
 case 'Unsuccessful':
 return 'bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/20';
 default:
 return 'bg-[var(--warning)]/10 text-[var(--warning)] border-amber-500/20';
 }
 };

 const getStrengthColor = (strength) => {
 // ConnectionStrength is 1-10, convert to percentage for display
 const pct = strength * 10;
 if (pct >= 80) return 'text-[var(--success)]';
 if (pct >= 50) return 'text-[var(--warning)]';
 return 'text-[var(--danger)]';
 };

 const getTrustBadge = (trust) => {
 switch (trust) {
 case 'High':
 return 'bg-[var(--success)]/10 text-[var(--success)]';
 case 'Medium':
 return 'bg-[var(--warning)]/10 text-[var(--warning)]';
 default:
 return 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]';
 }
 };

 if (loading && !data) {
 return (
 <div className="flex flex-col items-center justify-center py-20">
 <Loader2 className="w-12 h-12 text-[var(--accent)] animate-spin mb-4" />
 <p className="text-[11px] font-semibold text-[var(--text-muted)]">Loading Referral Intelligence...</p>
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
 onClick={fetchData}
 className="px-6 py-3 bg-[var(--accent)] text-white rounded-xl text-xs font-medium hover:bg-[var(--accent-hover)] transition-all"
 >
 Try Again
 </button>
 </div>
 );
 }

 const summary = data?.summary || {};
 const topReferrers = data?.topReferrers || [];
 const recentReferrals = data?.recentReferrals || [];
 const networkAnalysis = data?.networkAnalysis || [];
 const outcomeBreakdown = data?.outcomeBreakdown || [];

 return (
 <div className="space-y-6 sm:space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
 <div className="glass-card rounded-[var(--radius-xl)] p-8 border border-[var(--accent)]">
 <div className="flex items-center gap-4">
 <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
 <Network size={28} />
 </div>
 <div>
 <h2 className="text-lg sm:text-xl font-medium">Referral Intelligence</h2>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Track referral performance and optimize your referral pipeline</p>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-[var(--accent)]">
 <div className="flex items-center gap-3 mb-2">
 <Users size={18} className="text-[var(--accent)]" />
 <span className="text-[11px] font-medium text-[var(--accent)]">Total Referrals</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">{summary.TotalReferrals || 0}</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">All time</p>
 </div>
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-emerald-500/20">
 <div className="flex items-center gap-3 mb-2">
 <CheckCircle size={18} className="text-[var(--success)]" />
 <span className="text-[11px] font-medium text-[var(--success)]">Successful Hires</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">{summary.SuccessfulHires || 0}</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Converted referrals</p>
 </div>
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-amber-500/20">
 <div className="flex items-center gap-3 mb-2">
 <Clock size={18} className="text-[var(--warning)]" />
 <span className="text-[11px] font-medium text-[var(--warning)]">Pending</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">{summary.PendingReferrals || 0}</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Awaiting outcome</p>
 </div>
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-[var(--accent)]/20">
 <div className="flex items-center gap-3 mb-2">
 <TrendingUp size={18} className="text-[var(--accent)]" />
 <span className="text-[11px] font-medium text-[var(--accent)]">Success Rate</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">{summary.SuccessRate || 0}%</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Conversion rate</p>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
 {/* Key Metrics */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8">
 <h3 className="text-lg font-medium mb-6">Referral Performance</h3>

 {/* Top Referrer */}
 {topReferrers.length > 0 && (
 <div className="mb-6 p-6 bg-[var(--bg-accent)] rounded-xl border border-[var(--border-primary)]">
 <h4 className="text-sm font-medium text-[var(--accent)] mb-4 flex items-center gap-2">
 <Award size={16} /> Top Referrer
 </h4>
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
 <User size={20} />
 </div>
 <div>
 <div className="text-sm font-semibold">{topReferrers[0].ReferrerName}</div>
 <div className="text-xs text-[var(--text-muted)]">
 {topReferrers[0].TotalReferrals} referrals • {topReferrers[0].SuccessfulReferrals} hired
 </div>
 </div>
 </div>
 <div className="text-right">
 <div className="text-xl sm:text-2xl font-semibold text-[var(--success)]">${topReferrers[0].TotalBonusEarned || 0}</div>
 <div className="text-[11px] font-semibold text-[var(--text-muted)]">Bonus Earned</div>
 </div>
 </div>
 </div>
 )}

 {/* Outcome Breakdown */}
 {outcomeBreakdown.length > 0 && (
 <div>
 <h4 className="text-sm font-medium text-[var(--accent)] mb-4 flex items-center gap-2">
 <BarChart3 size={16} /> Outcome by Relationship
 </h4>
 <div className="space-y-4">
 {outcomeBreakdown.map((item, i) => (
 <div key={i} className="p-4 bg-[var(--bg-accent)] rounded-xl border border-[var(--border-primary)]">
 <div className="flex items-center justify-between mb-2">
 <span className="font-semibold text-sm">{item.RelationshipType || 'Unknown'}</span>
 <span className="text-xs text-[var(--text-muted)]">{item.TotalReferrals} referrals</span>
 </div>
 <div className="flex items-center gap-4 text-xs font-bold text-[var(--text-muted)]">
 <span className="flex items-center gap-1 text-[var(--success)]">
 <CheckCircle size={12} /> {item.Successful} hired
 </span>
 <span className="flex items-center gap-1 text-[var(--danger)]">
 <XCircle size={12} /> {item.Unsuccessful} failed
 </span>
 <span className="flex items-center gap-1 text-[var(--warning)]">
 <Clock size={12} /> {item.Pending} pending
 </span>
 </div>
 <div className="mt-3 flex h-2 rounded-full overflow-hidden bg-[var(--bg-primary)]">
 {item.Successful > 0 && (
 <div
 className="bg-[var(--success)]"
 style={{ width: `${(item.Successful / item.TotalReferrals) * 100}%` }}
 />
 )}
 {item.Unsuccessful > 0 && (
 <div
 className="bg-[var(--danger)]"
 style={{ width: `${(item.Unsuccessful / item.TotalReferrals) * 100}%` }}
 />
 )}
 {item.Pending > 0 && (
 <div
 className="bg-[var(--warning)]"
 style={{ width: `${(item.Pending / item.TotalReferrals) * 100}%` }}
 />
 )}
 </div>
 </div>
 ))}
 </div>
 </div>
 )}
 </div>

 {/* Recent Activity */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8">
 <div className="flex items-center justify-between mb-6">
 <h3 className="text-lg font-medium">Recent Referrals</h3>
 <button
 onClick={fetchData}
 className="p-2 hover:bg-[var(--bg-accent)] rounded-xl transition-colors"
 title="Refresh"
 >
 <RefreshCw className="w-5 h-5 text-[var(--text-muted)]" />
 </button>
 </div>

 {recentReferrals.length > 0 ? (
 <div className="space-y-4">
 {recentReferrals.slice(0, 6).map((ref, i) => (
 <div key={i} className="p-4 bg-[var(--bg-accent)] rounded-xl border border-[var(--border-primary)] hover:bg-[var(--bg-accent)]/50 transition-colors">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-4">
 <div className="w-10 h-10 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
 <User size={16} />
 </div>
 <div>
 <div className="font-semibold text-sm">{ref.ReferrerName} → {ref.ReferredCandidateName}</div>
 <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
 <span className="flex items-center gap-1">
 <Briefcase size={12} /> {ref.JobTitle}
 </span>
 <span className="flex items-center gap-1">
 <MapPin size={12} /> {ref.RelationshipType || 'N/A'}
 </span>
 </div>
 </div>
 </div>
 <div className="flex items-center gap-4">
 <div className="text-right">
 <div className="text-xs font-semibold text-[var(--text-muted)]">Strength</div>
 <div className={`font-semibold ${getStrengthColor(ref.ReferralStrength)}`}>
 {ref.ReferralStrength || 0}%
 </div>
 </div>
 <span className={`text-[11px] font-semibold px-2 py-1 rounded-lg border ${getOutcomeBadge(ref.Outcome)}`}>
 {ref.Outcome}
 </span>
 </div>
 </div>
 <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-muted)]">
 <span className="flex items-center gap-1">
 <Calendar size={12} />
 {ref.ReferralDate ? new Date(ref.ReferralDate).toLocaleDateString() : 'N/A'}
 </span>
 <span className="font-semibold text-[var(--success)]">${ref.BonusAmount || 0}</span>
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="text-center py-12 text-[var(--text-muted)]">
 <UserPlus className="w-12 h-12 mx-auto mb-4 opacity-50" />
 <p>No recent referrals yet.</p>
 <p className="text-xs mt-1">Referrals will appear here as they are submitted.</p>
 </div>
 )}
 </div>
 </div>

 {/* AI Suggestions Section */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8">
 <div className="flex items-center justify-between mb-6">
 <h3 className="text-lg font-medium">AI Referral Suggestions</h3>
 <button
 onClick={() => setShowSuggestions(!showSuggestions)}
 className={`flex items-center gap-2 px-4 py-3 ${showSuggestions ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-accent)] text-[var(--text-muted)]'} rounded-xl text-xs font-medium transition-all`}
 >
 <Lightbulb size={16} />
 {showSuggestions ? 'Hide Suggestions' : 'Get Suggestions'}
 </button>
 </div>

 {showSuggestions && (
 <div className="space-y-6">
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
 <div>
 <label className="block text-[11px] font-semibold text-[var(--text-muted)] ml-1 mb-2">
 Select Job
 </label>
 <select
 value={selectedJobId}
 onChange={(e) => {
 setSelectedJobId(e.target.value);
 if (e.target.value) {
 fetchJobSuggestions(e.target.value);
 } else {
 setJobSuggestions([]);
 }
 }}
 className="w-full bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-xl py-4 px-6 text-sm font-bold"
 >
 <option value="">Select a job...</option>
 {jobs.map(job => (
 <option key={job.JobID} value={job.JobID}>
 {job.JobTitle} - {job.Location}
 </option>
 ))}
 </select>
 </div>

 <div className="md:col-span-2 flex items-end">
 <button
 onClick={() => selectedJobId && fetchJobSuggestions(selectedJobId)}
 disabled={!selectedJobId || suggestionsLoading}
 className={`flex items-center gap-2 px-4 py-3 ${suggestionsLoading || !selectedJobId ? 'bg-[var(--bg-accent)] text-[var(--text-muted)] cursor-not-allowed' : 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white'} rounded-xl text-xs font-medium transition-all`}
 >
 <Zap size={16} />
 {suggestionsLoading ? 'Analyzing...' : 'Get Suggestions'}
 </button>
 </div>
 </div>

 {suggestionsError && (
 <div className="p-4 bg-rose-900/20 border border-rose-500/30 rounded-xl">
 <p className="text-xs font-semibold text-[var(--danger)]">{suggestionsError}</p>
 </div>
 )}

 {suggestionsLoading && (
 <div className="flex items-center justify-center py-8">
 <Loader2 className="w-8 h-8 text-[var(--warning)] animate-spin mr-4" />
 <p className="text-[11px] font-semibold text-[var(--text-muted)]">Analyzing Networks...</p>
 </div>
 )}

 {!suggestionsLoading && jobSuggestions.length > 0 && (
 <div className="space-y-4">
 {jobSuggestions.map((suggestion, i) => (
 <div key={i} className="glass-card rounded-[var(--radius-xl)] p-6">
 <div className="flex items-start justify-between">
 <div className="flex items-start gap-4">
 <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-semibold text-lg ${i === 0 ? 'bg-[var(--warning)]/10 text-[var(--warning)]' : 'bg-[var(--accent-soft)] text-[var(--accent)]'}`}>
 #{i + 1}
 </div>
 <div>
 <div className="font-semibold text-lg">{suggestion.ReferrerName}</div>
 <div className="text-xs text-[var(--text-muted)]">
 Historical Conversion: {suggestion.HistoricalConversionRate}% • Skills Match: {Number(suggestion.SkillsMatchPercent || 0).toFixed(1)}%
 </div>
 </div>
 </div>
 <div className="text-right">
 <div className="text-xl sm:text-2xl font-semibold text-[var(--warning)]">{Number(suggestion.ReferrerQualityScore || 0).toFixed(1) || 0}</div>
 <div className="text-[11px] font-semibold text-[var(--text-muted)]">Quality Score</div>
 </div>
 </div>

 <div className="mt-4 flex items-center gap-2">
 <span className={`text-xs font-semibold px-3 py-1 rounded-lg ${suggestion.EstimatedSuccessProbability?.includes('High') ? 'bg-[var(--success)]/10 text-[var(--success)] border border-emerald-500/20' :
 suggestion.EstimatedSuccessProbability?.includes('Medium') ? 'bg-[var(--warning)]/10 text-[var(--warning)] border border-amber-500/20' :
 'bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/20'
 }`}>
 {suggestion.EstimatedSuccessProbability}
 </span>
 </div>

 {/* Potential Referrals */}
 {suggestion.PotentialReferrals && suggestion.PotentialReferrals.length > 0 && (
 <div className="mt-6 pt-6 border-t border-[var(--border-primary)]">
 <div className="text-xs font-medium text-[var(--text-muted)] mb-4">
 Potential Referrals ({suggestion.PotentialReferrals.length})
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {suggestion.PotentialReferrals.slice(0, 3).map((ref, j) => (
 <div key={j} className="p-4 bg-[var(--bg-accent)] rounded-xl border border-[var(--border-primary)]">
 <div className="font-semibold text-sm">{ref.FullName}</div>
 <div className="text-xs text-[var(--text-muted)] mt-1">
 {ref.YearsOfExperience} years exp • {ref.MatchingSkillsCount} matching skills
 </div>
 <div className="flex items-center justify-between mt-3">
 <span className="text-xs text-[var(--text-muted)]">Fit Score: {ref.FitScore}</span>
 <span className={`text-xs font-semibold ${getStrengthColor(ref.ConnectionStrength)}`}>
 {ref.ConnectionStrength * 10}% strength
 </span>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}
 </div>
 ))}
 </div>
 )}

 {!suggestionsLoading && selectedJobId && jobSuggestions.length === 0 && !suggestionsError && (
 <div className="text-center py-8 text-[var(--text-muted)]">
 <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
 <p>No referral suggestions found for this job.</p>
 <p className="text-xs mt-1">Try selecting a different job or ensure you have candidates with network connections in the system.</p>
 </div>
 )}

 {!selectedJobId && !suggestionsLoading && (
 <div className="text-center py-8 text-[var(--text-muted)]">
 <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
 <p>Select a job above to get AI-powered referral suggestions</p>
 </div>
 )}
 </div>
 )}
 </div>

 {/* Empty State */}
 {(!data || (Object.keys(data).length === 0 && data.constructor === Object)) && !loading && (
 <div className="glass-card rounded-[var(--radius-xl)] p-8 text-center">
 <Network className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4 opacity-50" />
 <p className="text-[var(--text-muted)]">No referral data available yet.</p>
 <p className="text-xs text-[var(--text-muted)] mt-1">As referrals are submitted and processed, they will appear here with detailed analytics.</p>
 </div>
 )}
 </div>
 );
};

export default ReferralIntelligence;