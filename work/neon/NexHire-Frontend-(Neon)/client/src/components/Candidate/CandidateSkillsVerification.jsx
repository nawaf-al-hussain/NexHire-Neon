import React, { useState } from 'react';
import { Star, ShieldCheck, Zap, Award, Target, ChevronRight, Lock, Code2, Cpu, Plus } from 'lucide-react';
import AssessmentTestingEngine from './AssessmentTestingEngine';

const CandidateSkillsVerification = ({ assessments, profileSkills = [], loading, onRefresh, onAddSkill }) => {
 const [selectedAssessment, setSelectedAssessment] = useState(null);
 if (loading) {
 return (
 <div className="flex flex-col items-center justify-center py-20 opacity-50">
 <div className="w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin mb-4"></div>
 <p className="text-[11px] font-semibold text-[var(--text-muted)]">Loading Assessments...</p>
 </div>
 );
 }

 return (
 <div className="space-y-6 sm:space-y-12">

 {/* Header */}
 <div className="flex items-center gap-3 mb-6">
 <Cpu className="w-5 h-5 text-[var(--accent)]" />
 <h2 className="text-lg font-medium">My Skills Profile</h2>
 {profileSkills.length > 0 && (
 <span className="px-3 py-1 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] text-[11px] font-medium">{profileSkills.length} Skills</span>
 )}
 </div>

 {/* ── MY SKILLS (existing skills with proficiency) ── */}
 <div className="glass-card rounded-[var(--radius-xl)] p-10">
 <div className="flex justify-end mb-8">
 {onAddSkill && (
 <button
 onClick={onAddSkill}
 className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-xl font-semibold text-[11px] hover:bg-[var(--accent-hover)] transition-all"
 >
 <Plus size={14} /> Add Skill
 </button>
 )}
 </div>

 {profileSkills.length === 0 ? (
 <div className="p-10 border-2 border-dashed border-[var(--border-primary)] rounded-[var(--radius-xl)] text-center">
 <Code2 className="w-10 h-10 text-[var(--accent)]/20 mx-auto mb-3" />
 <p className="text-[11px] font-semibold text-[var(--text-muted)] opacity-40 mb-4">No skills on file yet. Click the Add Skill button above to build your profile.</p>
 {onAddSkill && (
 <button
 onClick={onAddSkill}
 className="px-6 py-3 bg-[var(--accent)] text-white rounded-xl font-semibold text-[11px] hover:bg-[var(--accent-hover)] transition-all inline-flex items-center gap-2"
 >
 <Plus size={14} /> Add Your First Skill
 </button>
 )}
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {profileSkills.map((skill, idx) => {
 const level = skill.ClaimedLevel ?? skill.ProficiencyLevel ?? 0;
 const isVerified = skill.VerificationStatus &&
 skill.VerificationStatus.toLowerCase().includes('verified') &&
 !skill.VerificationStatus.toLowerCase().includes('not');
 return (
 <div key={idx} className="flex items-center gap-4 p-5 bg-[var(--bg-accent)] rounded-2xl border border-[var(--border-primary)] hover:border-[var(--accent)] transition-all group">
 <div className="w-10 h-10 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] flex items-center justify-center shrink-0">
 {isVerified ? <Award size={16} className="text-[var(--success)]" /> : <Zap size={16} className="text-[var(--accent)]/50" />}
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-center justify-between mb-2">
 <h5 className="font-semibold text-xs truncate">{skill.SkillName}</h5>
 <span className={`ml-2 text-[11px] font-medium shrink-0 ${isVerified ? 'text-[var(--success)]' : 'text-[var(--text-muted)] opacity-50'}`}>
 {isVerified ? '✓ Verified' : 'Claimed'}
 </span>
 </div>
 <div className="w-full h-1.5 bg-[var(--bg-primary)] rounded-full overflow-hidden">
 <div
 className={`h-full rounded-full transition-all duration-1000 ${isVerified ? 'bg-[var(--success)]' : 'bg-[var(--accent)]/40'}`}
 style={{ width: `${level * 10}%` }}
 />
 </div>
 <div className="flex justify-between mt-1">
 <span className="text-[11px] font-semibold text-[var(--text-muted)]">Proficiency</span>
 <span className="text-[11px] font-semibold text-[var(--text-muted)]">{level}/10</span>
 </div>
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>

 {/* ── VERIFICATION HUB ── */}
 <div className="relative isolate p-12 rounded-[3.5rem] bg-[var(--accent-soft)] border border-[var(--accent)] overflow-hidden">
 <div className="max-w-2xl">
 <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--accent)]/20 border border-[var(--accent)] text-[11px] font-semibold text-[var(--accent)] mb-6">
 <Award size={12} /> Verification Hub
 </div>
 <h2 className="text-4xl font-semibold tracking-tighter mb-4 leading-tight">
 Proof Your Skills. <br />
 <span className="text-transparent bg-clip-text bg-[var(--accent)]">Multiply Your Matches.</span>
 </h2>
 <p className="text-[var(--text-secondary)] text-sm font-bold leading-relaxed opacity-80 mb-8">
 Complete micro-assessments verified by NexHire's AI to earn trust badges. Verified candidates see a 40% higher response rate from top-tier recruiters.
 </p>
 </div>
 </div>

 {/* ── ASSESSMENTS GRID ── */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
 {assessments.map((assessment) => (
 <div key={assessment.AssessmentID} className="group bg-[var(--bg-accent)] p-8 rounded-[var(--radius-xl)] border border-[var(--border-primary)] hover:border-[var(--accent)] transition-all relative overflow-hidden flex flex-col">
 <div className="flex items-center justify-between mb-6">
 <div className="w-12 h-12 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] flex items-center justify-center font-semibold text-xs text-[var(--accent)] group-hover:scale-110 transition-transform">
 <Zap size={20} className="fill-current" />
 </div>
 <div className="text-right">
 <div className="text-[11px] font-semibold text-[var(--text-muted)]">Type</div>
 <div className="text-[11px] font-bold text-[var(--accent)] uppercase">{assessment.AssessmentType}</div>
 </div>
 </div>
 <h4 className="text-lg font-semibold mb-2 leading-tight">{assessment.Title}</h4>
 <p className="text-xs text-[var(--text-muted)] font-bold mb-8 flex-1 opacity-70">
 {assessment.Description || `Test your ${assessment.SkillName} proficiency with NexHire's specialized assessment.`}
 </p>
 <div className="space-y-4 pt-6 border-t border-[var(--border-primary)]">
 <div className="flex items-center justify-between">
 <span className="text-[11px] font-semibold text-[var(--text-muted)]">Time Limit</span>
 <span className="text-[11px] font-bold">{assessment.TimeLimit} Minutes</span>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-[11px] font-semibold text-[var(--text-muted)]">Pass Score</span>
 <span className="text-[11px] font-bold text-[var(--success)]">{assessment.PassingScore}%</span>
 </div>
 <button
 onClick={() => setSelectedAssessment(assessment)}
 className="w-full py-4 bg-[var(--accent)] text-white rounded-2xl font-semibold text-[11px] hover:bg-[var(--accent-hover)] transition-all mt-4 flex items-center justify-center gap-2 group/btn"
 >
 Start Session <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
 </button>
 </div>
 </div>
 ))}

 {/* Locked Assessment placeholder */}
 <div className="bg-[var(--bg-accent)]/30 p-8 rounded-[var(--radius-xl)] border border-[var(--border-primary)] border-dashed opacity-50 relative overflow-hidden flex flex-col">
 <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-primary)]/20 backdrop-blur-[2px] z-10">
 <div className="flex flex-col items-center gap-2">
 <Lock size={20} className="text-[var(--text-muted)]" />
 <span className="text-[11px] font-medium">Unlock via Profile</span>
 </div>
 </div>
 <div className="w-12 h-12 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] flex items-center justify-center mb-6">
 <Award size={20} className="text-[var(--text-muted)]" />
 </div>
 <h4 className="text-lg font-semibold mb-2 opacity-30 leading-tight">Elite SQL Patterns</h4>
 <p className="text-xs text-[var(--text-muted)] font-bold opacity-20">Advanced query optimization and indexing strategies.</p>
 </div>
 </div>

 <AssessmentTestingEngine
 isOpen={!!selectedAssessment}
 onClose={() => setSelectedAssessment(null)}
 assessment={selectedAssessment}
 onComplete={() => {
 setSelectedAssessment(null);
 onRefresh();
 }}
 />
 </div >
 );
};

export default CandidateSkillsVerification;
