import React from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react';

const SkillMatrix = ({ requiredSkills, candidateSkills }) => {
 // candidateSkills is expected to be an array of skill names or objects
 const candidateSkillSet = new Set(
 (candidateSkills || []).map(s => typeof s === 'string' ? s.toLowerCase() : s.SkillName.toLowerCase())
 );

 return (
 <div className="mt-6 space-y-4">
 <div className="flex items-center justify-between mb-4">
 <h5 className="text-[11px] font-medium text-[var(--text-muted)]">Technical Proficiency Matrix</h5>
 <div className="flex gap-4">
 <div className="flex items-center gap-1.5">
 <div className="w-2 h-2 rounded-full bg-[var(--success)]"></div>
 <span className="text-[11px] font-bold opacity-60">Match</span>
 </div>
 <div className="flex items-center gap-1.5">
 <div className="w-2 h-2 rounded-full bg-[var(--danger)]"></div>
 <span className="text-[11px] font-bold opacity-60">Gap</span>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-3">
 {requiredSkills.map((skill, idx) => {
 const hasSkill = candidateSkillSet.has(skill.SkillName.toLowerCase());
 return (
 <div
 key={idx}
 className={`flex items-center justify-between p-3 rounded-xl border transition-all ${hasSkill
 ? 'bg-[var(--success)]/5 border-emerald-500/20'
 : 'bg-[var(--danger)]/5 border-[var(--danger)]/20 opacity-80'
 }`}
 >
 <div className="flex items-center gap-3">
 {hasSkill ? (
 <CheckCircle2 size={14} className="text-[var(--success)]" />
 ) : (
 <XCircle size={14} className="text-[var(--danger)]" />
 )}
 <span className="text-[11px] font-bold uppercase">{skill.SkillName}</span>
 </div>

 {skill.IsMandatory ? (
 <div className="px-2 py-0.5 rounded-md bg-[var(--accent)]/10 border border-[var(--accent)]">
 <span className="text-[7px] font-semibold text-[var(--accent)]">Required</span>
 </div>
 ) : (
 <span className="text-[7px] font-bold text-[var(--text-muted)] opacity-40">Preferred</span>
 )}
 </div>
 );
 })}
 </div>

 {requiredSkills.filter(s => s.IsMandatory && !candidateSkillSet.has(s.SkillName.toLowerCase())).length > 0 && (
 <div className="mt-4 p-4 rounded-2xl bg-[var(--warning)]/5 border border-amber-500/10 flex items-start gap-3">
 <AlertCircle size={14} className="text-[var(--warning)] shrink-0 mt-0.5" />
 <p className="text-[11px] font-bold text-[var(--warning)] leading-relaxed">
 Missing mandatory skills identified. Candidate may require supplemental training or technical screening.
 </p>
 </div>
 )}
 </div>
 );
};

export default SkillMatrix;
