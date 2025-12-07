import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Target, Users, Search, Sparkles, ChevronRight, BrainCircuit, Loader2 } from 'lucide-react';
import { formatScore } from '../../utils/format';
import API_BASE from '../../apiConfig';

const JobMatchingView = () => {
 const [jobs, setJobs] = useState([]);
 const [loading, setLoading] = useState(true);
 const [matchesByJob, setMatchesByJob] = useState({});
 const [loadingMatches, setLoadingMatches] = useState(false);

 useEffect(() => {
 fetchJobsAndMatches();
 }, []);

 const fetchJobsAndMatches = async () => {
 setLoading(true);
 try {
 const jobsRes = await axios.get(`${API_BASE}/jobs`);
 const activeJobs = jobsRes.data.filter(j => j.IsActive && !j.IsDeleted);
 setJobs(activeJobs);

 setLoadingMatches(true);
 const matchesData = {};
 // For a production app, we'd want a single endpoint, 
 // but for this demo, we can fetch concurrently for the top active jobs.
 const matchPromises = activeJobs.slice(0, 5).map(async (job) => {
 try {
 const res = await axios.get(`${API_BASE}/jobs/${job.JobID}/matches?topN=3`);
 return { id: job.JobID, data: res.data };
 } catch (err) {
 return { id: job.JobID, data: [] };
 }
 });

 const results = await Promise.all(matchPromises);
 results.forEach(res => {
 matchesData[res.id] = res.data;
 });
 setMatchesByJob(matchesData);
 } catch (err) {
 console.error("Fetch Global Matches Error:", err);
 } finally {
 setLoading(false);
 setLoadingMatches(false);
 }
 };

 if (loading) {
 return (
 <div className="flex flex-col items-center justify-center py-40 space-y-6">
 <Loader2 className="w-16 h-16 text-[var(--accent)] animate-spin" />
 <p className="text-[11px] font-semibold text-[var(--accent)]/60 animate-pulse">Loading matches…</p>
 </div>
 );
 }

 return (
 <div className="space-y-6 sm:space-y-12">
 <div className="flex items-center justify-between mb-8">
 <div>
 <div className="flex items-center gap-3 mb-2">
 <Sparkles className="w-5 h-5 text-[var(--accent)]" />
 <h2 className="text-lg sm:text-xl font-medium">Job matches</h2>
 </div>
 <p className="text-[11px] font-bold text-[var(--text-muted)] opacity-60">Top candidates per active role</p>
 </div>
 <div className="flex gap-4">
 <div className="px-6 py-4 bg-[var(--accent)]/5 border border-[var(--accent)] rounded-2xl flex items-center gap-3">
 <Users size={16} className="text-[var(--accent)]" />
 <span className="text-[11px] font-medium">{jobs.length} Active Streams</span>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:gap-10">
 {jobs.slice(0, 5).map(job => (
 <div key={job.JobID} className="glass-card rounded-[var(--radius-xl)] p-10 relative overflow-hidden group">
 <div className="flex flex-col lg:flex-row gap-10 relative z-10">
 {/* Job Info */}
 <div className="lg:w-1/3 space-y-6">
 <div className="p-6 bg-[var(--accent)]/10 rounded-[var(--radius-xl)] border border-[var(--accent)] w-fit">
 <Target className="text-[var(--accent)]" size={32} />
 </div>
 <div>
 <h3 className="text-xl sm:text-2xl font-semibold tracking-tight mb-2">{job.JobTitle}</h3>
 <div className="flex items-center gap-3 text-[11px] font-semibold text-[var(--text-muted)] opacity-60">
 <span>{job.Location}</span>
 <div className="w-1 h-1 rounded-full bg-[var(--text-muted)]"></div>
 <span>{job.Vacancies} Vacancies</span>
 </div>
 </div>
 <div className="pt-4">
 <button className="flex items-center gap-2 text-[11px] font-semibold text-[var(--accent)] hover:translate-x-1 transition-all group/btn">
 View Full Pipeline <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
 </button>
 </div>
 </div>

 {/* Top Matches */}
 <div className="flex-1 space-y-6">
 <div className="flex items-center justify-between">
 <h4 className="text-[11px] font-medium text-[var(--text-muted)]">Heuristic Rank Benchmarks</h4>
 {loadingMatches && <Loader2 className="w-4 h-4 text-[var(--accent)] animate-spin" />}
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
 {(matchesByJob[job.JobID] || []).map((match, idx) => (
 <div key={idx} className="bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-[var(--radius-xl)] p-6 hover:border-[var(--accent)] transition-all group/match">
 <div className="flex items-center justify-between mb-4">
 <div className={`text-xs font-semibold ${idx === 0 ? 'text-[var(--success)]' : 'text-[var(--accent)]/50'}`}>#{idx + 1}</div>
 <div className="text-[18px] font-semibold tracking-tighter">{formatScore(match.TotalMatchScore)}%</div>
 </div>
 <p className="text-[11px] font-medium mb-1 truncate">{match.FullName}</p>
 <p className="text-[11px] font-bold text-[var(--text-muted)] opacity-60 mb-4">{match.MatchCategory}</p>

 <div className="w-full h-1 bg-[var(--bg-primary)] rounded-full overflow-hidden">
 <div
 className="h-full bg-[var(--accent)] transition-all duration-1000"
 style={{ width: `${formatScore(match.TotalMatchScore)}%` }}
 ></div>
 </div>
 </div>
 ))}
 {(!matchesByJob[job.JobID] || matchesByJob[job.JobID].length === 0) && !loadingMatches && (
 <div className="col-span-3 py-10 bg-[var(--accent)]/5 rounded-[var(--radius-xl)] border border-dashed border-[var(--accent)] text-center">
 <p className="text-[11px] font-semibold text-[var(--accent)]/40">No Matches Synced Yet</p>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 );
};

export default JobMatchingView;
