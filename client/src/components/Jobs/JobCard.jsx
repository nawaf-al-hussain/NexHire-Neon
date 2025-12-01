import React, { useState, useEffect } from 'react';
import { MapPin, Users, Calendar, Trash2, ExternalLink, ShieldCheck, Target, Pencil, ChevronDown, ChevronUp, Star, Code, ArchiveRestore } from 'lucide-react';
import JobEditModal from './JobEditModal';
import API_BASE from '../../apiConfig';
import axios from 'axios';

const JobCard = ({ job, onDelete, onFindMatches, onOpenPipeline, onUpdateJob, matches = [], isArchived = false }) => {
 const [isExpanded, setIsExpanded] = useState(false);
 const [showOnlyApplicants, setShowOnlyApplicants] = useState(false);
 const [showEditModal, setShowEditModal] = useState(false);
 const [jobSkills, setJobSkills] = useState([]);
 const [loadingSkills, setLoadingSkills] = useState(false);

 const filteredMatches = showOnlyApplicants
 ? matches.filter(m => m.HasApplied)
 : matches;

 // Fetch job skills when expanded
 useEffect(() => {
 if (isExpanded && jobSkills.length === 0) {
 fetchJobSkills();
 }
 }, [isExpanded]);

 const fetchJobSkills = async () => {
 setLoadingSkills(true);
 try {
 const token = localStorage.getItem('nexhire_token');
 const res = await axios.get(`${API_BASE}/jobs/${job.JobID}`, {
 headers: { Authorization: `Bearer ${token}` }
 });
 setJobSkills(res.data.skills || []);
 } catch (err) {
 console.error('Error fetching job skills:', err);
 } finally {
 setLoadingSkills(false);
 }
 };

 const handleSaveJob = (updatedJob) => {
 if (onUpdateJob) {
 onUpdateJob(updatedJob);
 }
 };

 return (
 <>
 <div className={`glass-card p-8 rounded-[var(--radius-xl)] hover:bg-[var(--accent)]/[0.02] transition-all group relative overflow-hidden ${isArchived ? 'border-amber-500/20 bg-[var(--warning)]/5' : ''}`}>
 {/* Background Glow */}
 <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
 <div className="flex gap-6 flex-1">
 <div className="w-16 h-16 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-primary)] flex items-center justify-center font-semibold text-lg sm:text-xl text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors shrink-0">
 {(job.JobTitle || "??").substring(0, 2).toUpperCase()}
 </div>
 <div className="flex-1">
 <div className="flex items-center gap-3 flex-wrap">
 <h4 className="text-lg sm:text-xl font-semibold group-hover:text-[var(--accent)] transition-colors">{job.JobTitle}</h4>
 {job.IsActive ? (
 <span className="flex items-center gap-1 bg-[var(--success)]/10 text-[var(--success)] text-[11px] font-medium px-2 py-0.5 rounded-full border border-emerald-500/20">
 <ShieldCheck size={10} /> Active
 </span>
 ) : (
 <span className="flex items-center gap-1 bg-[var(--warning)]/10 text-[var(--warning)] text-[11px] font-medium px-2 py-0.5 rounded-full border border-amber-500/20">
 <ShieldCheck size={10} /> Inactive
 </span>
 )}
 </div>

 <div className="flex flex-wrap gap-4 mt-3">
 <div className="flex items-center gap-2 text-[var(--text-muted)]">
 <MapPin size={14} className="text-[var(--accent)]/50" />
 <span className="text-[11px] font-bold">{job.Location}</span>
 </div>
 <div className="flex items-center gap-2 text-[var(--text-muted)]">
 <Users size={14} className="text-[var(--accent)]/50" />
 <span className="text-[11px] font-bold">{job.Vacancies} Vacancies</span>
 </div>
 <div className="flex items-center gap-2 text-[var(--text-muted)]">
 <Calendar size={14} className="text-[var(--accent)]/50" />
 <span className="text-[11px] font-bold">EXP: {job.MinExperience}+ YRS</span>
 </div>
 </div>

 <p className="text-xs text-[var(--text-secondary)] font-medium mt-4 leading-relaxed line-clamp-2 max-w-xl opacity-70">
 {job.Description}
 </p>

 {/* Expand/Collapse Button */}
 <button
 onClick={() => setIsExpanded(!isExpanded)}
 className="flex items-center gap-2 mt-4 text-[11px] font-medium text-[var(--accent)] hover:text-[var(--accent)] transition-colors"
 >
 {isExpanded ? (
 <>
 <ChevronUp size={14} />
 Less Info
 </>
 ) : (
 <>
 <ChevronDown size={14} />
 More Info
 </>
 )}
 </button>

 {/* Expanded Content - Skills */}
 {isExpanded && (
 <div className="mt-6 pt-6 border-t border-[var(--border-primary)] animate-in fade-in slide-in-from-top-2 duration-200">
 {loadingSkills ? (
 <div className="flex items-center gap-2 text-[var(--text-muted)]">
 <div className="w-4 h-4 border-2 border-[var(--accent)] border-t-indigo-500 rounded-full animate-spin"></div>
 <span className="text-[11px] font-medium">Loading Skills...</span>
 </div>
 ) : jobSkills.length > 0 ? (
 <div>
 <div className="flex items-center gap-2 mb-4">
 <Code size={14} className="text-[var(--accent)]" />
 <span className="text-[11px] font-medium text-[var(--text-muted)]">Required Skills</span>
 </div>
 <div className="flex flex-wrap gap-2">
 {jobSkills.map((skill, index) => (
 <div
 key={index}
 className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-medium ${skill.IsMandatory
 ? 'bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]'
 : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] border border-slate-500/20'
 }`}
 >
 {skill.IsMandatory ? (
 <Star size={10} className="fill-current" />
 ) : (
 <Code size={10} />
 )}
 <span>{skill.SkillName}</span>
 <span className="opacity-60">L{skill.MinProficiency}</span>
 {skill.IsMandatory && (
 <span className="text-[11px] opacity-80">M</span>
 )}
 </div>
 ))}
 </div>
 </div>
 ) : (
 <p className="text-[11px] font-semibold text-[var(--text-muted)] opacity-40">
 No skills required
 </p>
 )}
 </div>
 )}
 </div>
 </div>

 <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-4 shrink-0">
 <div className="text-right">
 <div className="text-xl sm:text-2xl font-semibold text-[var(--accent)]">{job.ApplicationCount || 0}</div>
 <div className="text-[11px] font-semibold text-[var(--text-muted)]">Applicants</div>
 </div>

 <div className="flex items-center gap-2">
 {isArchived ? (
 <>
 <button
 onClick={() => onDelete(job.JobID)}
 className="p-3 bg-[var(--warning)]/10 border border-amber-500/30 hover:bg-[var(--warning)]/20 text-[var(--warning)] transition-all rounded-xl flex items-center gap-2"
 title="Restore Job"
 >
 <ArchiveRestore size={16} />
 <span className="text-[11px] font-medium pr-1">Restore</span>
 </button>
 </>
 ) : (
 <>
 <button
 onClick={() => setShowEditModal(true)}
 className="p-3 bg-[var(--bg-accent)] border border-[var(--border-primary)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/10 text-[var(--text-muted)] hover:text-[var(--accent)] transition-all rounded-xl"
 title="Edit Job"
 >
 <Pencil size={16} />
 </button>
 <button
 onClick={() => onDelete(job.JobID)}
 className="p-3 bg-[var(--bg-accent)] border border-[var(--border-primary)] hover:border-rose-500/30 hover:bg-[var(--danger)]/10 text-[var(--text-muted)] hover:text-[var(--danger)] transition-all rounded-xl"
 title="Archive Job"
 >
 <Trash2 size={16} />
 </button>
 </>
 )}
 <button
 onClick={onOpenPipeline}
 className={`p-3 bg-[var(--bg-accent)] border border-[var(--border-primary)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/10 text-[var(--text-muted)] hover:text-[var(--accent)] transition-all rounded-xl flex items-center gap-2 group/pipe ${isArchived ? 'opacity-50 cursor-not-allowed' : ''}`}
 title={isArchived ? "Pipeline unavailable for archived jobs" : "View Active Pipeline"}
 disabled={isArchived}
 >
 <ExternalLink size={16} className="group-hover/pipe:scale-110 transition-transform" />
 <span className="text-[11px] font-medium pr-1">Pipeline</span>
 </button>
 <button
 onClick={onFindMatches}
 className={`p-3 bg-[var(--accent)] border border-[var(--accent)] hover:bg-[var(--accent-hover)] text-white transition-all rounded-xl shadow-lg shadow-[var(--shadow-md)] flex items-center gap-2 group/match ${isArchived ? 'opacity-50 cursor-not-allowed' : ''}`}
 title={isArchived ? "Matching unavailable for archived jobs" : "Find Best Matches"}
 disabled={isArchived}
 >
 <Target size={16} className="group-hover/match:scale-110 transition-transform" />
 <span className="text-[11px] font-medium pr-1">Match Talent</span>
 </button>
 </div>
 </div>
 </div>
 </div>

 {/* Edit Modal */}
 <JobEditModal
 job={job}
 isOpen={showEditModal}
 onClose={() => setShowEditModal(false)}
 onSave={handleSaveJob}
 />
 </>
 );
};

export default JobCard;
