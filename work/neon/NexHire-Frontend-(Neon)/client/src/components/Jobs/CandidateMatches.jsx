import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Target, Star, BrainCircuit, ShieldCheck, ChevronRight, X, Loader2, Target as TargetIcon, Sparkles, Info, User, MapPin, Briefcase, Award, CheckCircle2 } from 'lucide-react';
import { formatScore } from '../../utils/format';
import API_BASE from '../../apiConfig';
import SkillMatrix from './SkillMatrix';
import { useToast } from '../../components/ui/Toast';

const CandidateMatches = ({ job, isOpen, onClose }) => {
    const { toast } = useToast();
 const [matches, setMatches] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState('');
 const [requiredSkills, setRequiredSkills] = useState([]);
 const [showOnlyApplicants, setShowOnlyApplicants] = useState(false);

 useEffect(() => {
 if (isOpen && job) {
 fetchMatches();
 }
 }, [isOpen, job]);

 const fetchMatches = async () => {
 setLoading(true);
 try {
 // Concurrent fetch for matches and job skills
 const [matchesRes, jobRes] = await Promise.all([
 axios.get(`${API_BASE}/jobs/${job.JobID}/matches`),
 axios.get(`${API_BASE}/jobs/${job.JobID}`)
 ]);

 setMatches(matchesRes.data);
 setRequiredSkills(jobRes.data.skills || []);
 setError('');
 } catch (err) {
 console.error("Fetch Matches Error:", err);
 setError('Failed to execute matching engine.');
 } finally {
 setLoading(false);
 }
 };

 const handleInitiatePipeline = async (candidateID) => {
 try {
 await axios.post(`${API_BASE}/recruiters/initiate-pipeline`, {
 jobID: job.JobID,
 candidateID
 });

 // Optimistic update of the local matches state
 setMatches(prev => prev.map(m =>
 m.CandidateID === candidateID ? { ...m, HasApplied: 1, isInvited: true } : m
 ));
 } catch (err) {
 console.error("Initiate Pipeline Error:", err);
 toast(err.response?.data?.error || "Failed to initiate pipeline.", { type: 'error' });
 }
 };

 const filteredMatches = showOnlyApplicants
 ? matches.filter(m => m.HasApplied)
 : matches;

 if (!isOpen) return null;

 return (
 <div className="fixed inset-0 z-[100] flex items-center justify-end transition-opacity duration-300">
 <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

 <div className="relative bg-[var(--bg-primary)] border-l border-[var(--border-primary)] w-full max-w-2xl h-full shadow-[var(--shadow-lg)] flex flex-col animate-in slide-in-from-right duration-500">
 {/* Header */}
 <div className="p-8 border-b border-[var(--border-primary)] bg-[var(--bg-accent)] flex items-center justify-between">
 <div className="flex items-center gap-5">
 <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)] flex items-center justify-center relative">
 <Target className="text-[var(--accent)]" size={28} />
 <div className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--success)] rounded-full border-2 border-[var(--bg-primary)] animate-pulse"></div>
 </div>
 <div>
 <h2 className="text-lg sm:text-xl font-semibold tracking-tight">Candidate matches</h2>
 <p className="text-[11px] font-semibold text-[var(--text-muted)] mt-1">Ranking candidates for: <span className="text-[var(--accent)]">{job?.JobTitle}</span></p>
 </div>
 </div>
 <div className="flex items-center gap-4">
 <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl mr-2">
 <label className="text-[11px] font-medium text-[var(--text-muted)] flex items-center gap-2 cursor-pointer">
 <input
 type="checkbox"
 checked={showOnlyApplicants}
 onChange={() => setShowOnlyApplicants(!showOnlyApplicants)}
 className="w-3 h-3 rounded bg-[var(--accent)]/20 border-[var(--accent)]"
 />
 Only Applicants
 </label>
 </div>
 <button onClick={onClose} className="w-10 h-10 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
 <X size={20} />
 </button>
 </div>
 </div>

 {/* Content */}
 <div className="flex-1 overflow-y-auto p-8">
 {loading ? (
 <div className="flex flex-col items-center justify-center py-40 space-y-6">
 <div className="relative">
 <Loader2 className="w-16 h-16 text-[var(--accent)] animate-spin" />
 <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[var(--accent)]/50 w-6 h-6 animate-pulse" />
 </div>
 <p className="text-[11px] font-semibold text-[var(--text-muted)] animate-pulse">Loading matches…</p>
 </div>
 ) : error ? (
 <div className="p-10 rounded-[var(--radius-xl)] bg-[var(--danger)]/5 border border-[var(--danger)]/10 text-center">
 <p className="text-[var(--danger)] font-semibold text-xs">{error}</p>
 </div>
 ) : filteredMatches.length === 0 ? (
 <div className="text-center py-20">
 <Info className="mx-auto text-[var(--text-muted)] mb-6 opacity-30" size={48} />
 <h4 className="text-lg font-semibold text-[var(--text-muted)]">
 {showOnlyApplicants ? "No Matching Applicants" : "No Compatible Matches"}
 </h4>
 <p className="text-xs text-[var(--text-muted)] font-bold mt-2 ">Try adjusting mandatory skill requirements</p>
 </div>
 ) : (
 <div className="space-y-6">
 {filteredMatches.sort((a, b) => b.TotalMatchScore - a.TotalMatchScore).map((candidate, idx) => (
 <div key={candidate.CandidateID} className="glass-card p-8 rounded-[var(--radius-xl)] hover:bg-[var(--accent)]/[0.02] transition-all group relative overflow-hidden">
 {/* Rank Badge */}
 <div className="absolute top-0 right-0 p-6 flex flex-col items-end">
 <div className="text-4xl font-semibold text-[var(--accent)] opacity-10 group-hover:opacity-30 transition-opacity">#{idx + 1}</div>
 <div className="text-[11px] font-semibold text-[var(--text-muted)]">{candidate.MatchCategory}</div>
 </div>

 <div className="flex items-start gap-6 relative z-10">
 <div className="w-20 h-20 rounded-3xl bg-[var(--bg-accent)] border border-[var(--border-primary)] flex items-center justify-center relative overflow-hidden shrink-0 group-hover:border-[var(--accent)] transition-colors">
 <User className="text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-all scale-125" size={32} />
 <div className="absolute bottom-0 inset-x-0 h-1/2 bg-[var(--accent-soft)]"></div>
 </div>

 <div className="space-y-4">
 <div>
 <div className="flex items-center gap-3">
 <h4 className="text-lg sm:text-xl font-semibold group-hover:text-[var(--accent)] transition-colors">{candidate.FullName}</h4>
 {candidate.HasApplied && (
 <span className="flex items-center gap-1 bg-[var(--success)]/10 text-[var(--success)] text-[11px] font-medium px-2 py-0.5 rounded-full border border-emerald-500/20">
 <CheckCircle2 size={10} /> Applied
 </span>
 )}
 </div>
 <div className="flex gap-4 mt-2">
 <div className="flex items-center gap-2 text-[var(--text-muted)] opacity-60">
 <MapPin size={12} className="text-[var(--accent)]/50" />
 <span className="text-[11px] font-medium">{candidate.CandidateLocation}</span>
 </div>
 <div className="flex items-center gap-2 text-[var(--text-muted)] font-bold">
 <Briefcase size={12} className="text-[var(--accent)]/50" />
 <span className="text-[11px]">{candidate.YearsOfExperience} YRS EXP</span>
 </div>
 </div>
 </div>

 <div className="flex flex-wrap gap-2">
 {(candidate.SkillSummary || '').split(', ').map((skill, sIdx) => (
 <span key={sIdx} className="bg-[var(--bg-primary)] border border-[var(--border-primary)] text-[var(--text-muted)] text-[11px] font-semibold px-3 py-1 rounded-lg">
 {skill}
 </span>
 ))}
 </div>

 <div className="pt-4 flex items-center gap-8">
 <div className="flex flex-col">
 <span className="text-[11px] font-semibold text-[var(--text-muted)] mb-1">Technical Fit</span>
 <div className="w-24 h-1.5 bg-[var(--bg-accent)] rounded-full overflow-hidden border border-[var(--border-primary)]">
 <div
 className="h-full bg-[var(--accent)] shadow-[0_0_10px_rgba(99,102,241,0.5)]"
 style={{ width: `${formatScore(candidate.TechnicalScore)}%` }}
 ></div>
 </div>
 </div>
 <div className="flex flex-col">
 <span className="text-[11px] font-semibold text-[var(--text-muted)] mb-1">Match Score</span>
 <span className="text-xl sm:text-2xl font-semibold tracking-tighter">{formatScore(candidate.TotalMatchScore)}%</span>
 </div>
 </div>

 {/* Advanced Skill Matrix Visualization */}
 <SkillMatrix
 requiredSkills={requiredSkills}
 candidateSkills={(candidate.SkillSummary || '').split(', ')}
 />
 </div>
 </div>

 <div className="mt-8 flex items-center justify-between pt-6 border-t border-[var(--border-primary)]">
 <div className="flex items-center gap-3">
 <Award size={16} className="text-[var(--warning)]" />
 <p className="text-[11px] font-bold text-[var(--text-muted)] italic">{candidate.RecommendedAction}</p>
 </div>
 <button
 onClick={() => handleInitiatePipeline(candidate.CandidateID)}
 disabled={candidate.HasApplied || candidate.isInvited}
 className={`flex items-center gap-2 text-[11px] font-medium transition-all group/btn ${candidate.HasApplied || candidate.isInvited
 ? 'text-[var(--success)] cursor-default opacity-80'
 : 'text-[var(--accent)] hover:translate-x-1 cursor-pointer'
 }`}
 >
 {candidate.HasApplied || candidate.isInvited ? (
 <>Invitation Sent <CheckCircle2 size={14} /></>
 ) : (
 <>Initiate Pipeline <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" /></>
 )}
 </button>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>

 {/* Footer */}
 <div className="p-8 border-t border-[var(--border-primary)] bg-[var(--bg-accent)]">
 <div className="glass-card bg-[var(--accent)]/5 border border-[var(--accent)] p-6 rounded-3xl flex items-center gap-5">
 <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/20 flex items-center justify-center shrink-0">
 <Sparkles className="text-[var(--accent)]" size={20} />
 </div>
 <p className="text-[11px] font-bold text-[var(--text-muted)] leading-relaxed">
 Heuristic matching utilizes <span className="text-[var(--text-primary)]">Technical Proficiency</span>, <span className="text-[var(--text-primary)]">Location Proximity</span>, and <span className="text-[var(--text-primary)]">Engagement History</span> for optimized ranking.
 </p>
 </div>
 </div>
 </div>
 </div>
 );
};

export default CandidateMatches;
