import React, { useState, useEffect } from 'react';
import { X, Search, Monitor, ClipboardList, Target, AlertCircle, PlusCircle, CheckCircle2, ChevronRight, Hash, Star, Plus, Trash2, CheckCircle, Info, Sparkles, DollarSign } from 'lucide-react';
import API_BASE from '../../apiConfig';
import axios from 'axios';

const JobModal = ({ isOpen, onClose, onJobCreated }) => {
 const [title, setTitle] = useState('');
 const [description, setDescription] = useState('');
 const [location, setLocation] = useState('');
 const [minExperience, setMinExperience] = useState(0);
 const [vacancies, setVacancies] = useState(1);
 const [minSalary, setMinSalary] = useState('');
 const [maxSalary, setMaxSalary] = useState('');
 const [salaryTransparent, setSalaryTransparent] = useState(false);
 const [availableSkills, setAvailableSkills] = useState([]);
 const [selectedSkills, setSelectedSkills] = useState([]); // [{id, name, isMandatory, minProficiency}]
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');

 useEffect(() => {
 if (isOpen) {
 fetchSkills();
 }
 }, [isOpen]);

 const fetchSkills = async () => {
 try {
 const res = await axios.get(`${API_BASE}/skills`);
 setAvailableSkills(res.data);
 } catch (err) {
 console.error("Fetch Skills Error:", err);
 }
 };

 const handleAddSkill = (skill) => {
 if (selectedSkills.find(s => s.id === skill.SkillID)) return;
 setSelectedSkills([...selectedSkills, {
 id: skill.SkillID,
 name: skill.SkillName,
 isMandatory: true,
 minProficiency: 5
 }]);
 };

 const handleRemoveSkill = (skillId) => {
 setSelectedSkills(selectedSkills.filter(s => s.id !== skillId));
 };

 const handleSkillChange = (id, field, value) => {
 setSelectedSkills(selectedSkills.map(s =>
 s.id === id ? { ...s, [field]: value } : s
 ));
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 setLoading(true);
 setLoading(true);
 setError('');

 try {
 await axios.post(`${API_BASE}/jobs`, {
 title,
 description,
 location,
 minExperience,
 vacancies,
 skills: selectedSkills,
 minSalary: minSalary ? parseInt(minSalary) : null,
 maxSalary: maxSalary ? parseInt(maxSalary) : null,
 salaryTransparent
 });
 onJobCreated();
 onClose();
 // Reset form
 setTitle('');
 setDescription('');
 setLocation('');
 setMinExperience(0);
 setVacancies(1);
 setSelectedSkills([]);
 setMinSalary('');
 setMaxSalary('');
 setSalaryTransparent(false);
 } catch (err) {
 setError(err.response?.data?.error || 'Failed to create job posting.');
 } finally {
 setLoading(false);
 }
 };

 if (!isOpen) return null;

 return (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300">
 <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

 <div className="relative bg-[var(--bg-primary)] border border-[var(--border-primary)] w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] flex flex-col text-[var(--text-primary)]">
 {/* Header */}
 <div className="p-8 border-b border-[var(--border-primary)] flex items-center justify-between bg-[var(--bg-accent)]/20">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)] flex items-center justify-center">
 <Plus className="text-[var(--accent)]" size={24} />
 </div>
 <div>
 <h2 className="text-lg sm:text-xl font-semibold tracking-tight">Post New Opportunity</h2>
 <p className="text-[11px] font-semibold text-[var(--text-muted)] mt-1 italic">Define specialized requirements & core skills</p>
 </div>
 </div>
 <button onClick={onClose} className="w-10 h-10 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
 <X size={20} />
 </button>
 </div>

 <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-6 sm:space-y-12">
 {/* Basic Info */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-10">
 <div className="space-y-6">
 <div className="space-y-2">
 <label className="text-[11px] font-semibold text-[var(--text-muted)] ml-1">Job Title</label>
 <input
 type="text"
 required
 value={title}
 onChange={(e) => setTitle(e.target.value)}
 placeholder="e.g. Senior Cloud Architect"
 className="w-full bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl py-4 px-6 text-sm text-[var(--text-primary)] focus:bg-[var(--surface-hover)] focus:bg-[var(--surface-hover)] outline-none transition-all placeholder:text-[var(--text-muted)] font-bold"
 />
 </div>
 <div className="space-y-2">
 <label className="text-[11px] font-semibold text-[var(--text-muted)] ml-1">Location</label>
 <input
 type="text"
 required
 value={location}
 onChange={(e) => setLocation(e.target.value)}
 placeholder="e.g. Remote / New York"
 className="w-full bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl py-4 px-6 text-sm text-[var(--text-primary)] focus:bg-[var(--surface-hover)] focus:bg-[var(--surface-hover)] outline-none transition-all placeholder:text-[var(--text-muted)] font-bold"
 />
 </div>
 </div>
 <div className="grid grid-cols-2 gap-4 sm:gap-6">
 <div className="space-y-2">
 <label className="text-[11px] font-semibold text-[var(--text-muted)] ml-1">Min Experience (Years)</label>
 <input
 type="number"
 min="0"
 value={minExperience}
 onChange={(e) => setMinExperience(parseInt(e.target.value))}
 className="w-full bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl py-4 px-6 text-sm text-[var(--text-primary)] focus:bg-[var(--surface-hover)] focus:bg-[var(--surface-hover)] outline-none transition-all font-semibold text-center"
 />
 </div>
 <div className="space-y-2">
 <label className="text-[11px] font-semibold text-[var(--text-muted)] ml-1">Vacancies</label>
 <input
 type="number"
 min="1"
 value={vacancies}
 onChange={(e) => setVacancies(parseInt(e.target.value))}
 className="w-full bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl py-4 px-6 text-sm text-[var(--text-primary)] focus:bg-[var(--surface-hover)] focus:bg-[var(--surface-hover)] outline-none transition-all font-semibold text-center"
 />
 </div>
 </div>
 </div>

 {/* Salary Range */}
 <div className="space-y-6 p-6 rounded-3xl bg-[var(--bg-accent)]/10 border border-[var(--border-primary)]">
 <div className="flex items-center justify-between pb-4 border-b border-[var(--border-primary)]">
 <div className="flex items-center gap-3">
 <DollarSign size={18} className="text-[var(--success)]" />
 <h3 className="text-xs font-medium">Salary Range</h3>
 </div>
 <div className="flex items-center gap-3">
 <input
 type="checkbox"
 id="salaryTransparent"
 checked={salaryTransparent}
 onChange={(e) => setSalaryTransparent(e.target.checked)}
 className="w-5 h-5 rounded border-[var(--border-primary)] bg-[var(--bg-accent)] text-[var(--accent)] focus:ring-[var(--accent-ring)]"
 />
 <label htmlFor="salaryTransparent" className="text-[11px] font-semibold text-[var(--text-muted)] cursor-pointer">
 Make salary visible to candidates
 </label>
 </div>
 </div>
 <div className="grid grid-cols-2 gap-4 sm:gap-6">
 <div className="space-y-2">
 <label className="text-[11px] font-semibold text-[var(--text-muted)] ml-1">Min Salary (USD)</label>
 <input
 type="number"
 min="0"
 value={minSalary}
 onChange={(e) => setMinSalary(e.target.value)}
 placeholder="e.g. 80000"
 className="w-full bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl py-4 px-6 text-sm text-[var(--text-primary)] focus:bg-[var(--surface-hover)] focus:bg-[var(--surface-hover)] outline-none transition-all placeholder:text-[var(--text-muted)] font-bold"
 />
 </div>
 <div className="space-y-2">
 <label className="text-[11px] font-semibold text-[var(--text-muted)] ml-1">Max Salary (USD)</label>
 <input
 type="number"
 min="0"
 value={maxSalary}
 onChange={(e) => setMaxSalary(e.target.value)}
 placeholder="e.g. 120000"
 className="w-full bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl py-4 px-6 text-sm text-[var(--text-primary)] focus:bg-[var(--surface-hover)] focus:bg-[var(--surface-hover)] outline-none transition-all placeholder:text-[var(--text-muted)] font-bold"
 />
 </div>
 </div>
 </div>

 <div className="space-y-2">
 <label className="text-[11px] font-semibold text-[var(--text-muted)] ml-1">Job Description</label>
 <textarea
 rows="4"
 value={description}
 onChange={(e) => setDescription(e.target.value)}
 placeholder="Detail the core responsibilities and expectations..."
 className="w-full bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-3xl py-6 px-8 text-sm text-[var(--text-primary)] focus:bg-[var(--surface-hover)] focus:bg-[var(--surface-hover)] outline-none transition-all placeholder:text-[var(--text-muted)] font-medium leading-relaxed resize-none"
 ></textarea>
 </div>

 {/* Skill Selection */}
 <div className="space-y-5 sm:space-y-8 p-1">
 <div className="flex items-center justify-between pb-4 border-b border-[var(--border-primary)]">
 <div className="flex items-center gap-3">
 <Sparkles size={18} className="text-[var(--warning)]" />
 <h3 className="text-xs font-medium">Skill Intelligence</h3>
 </div>
 <p className="text-[11px] font-bold text-[var(--text-muted)] italic">Define technical depth requirements</p>
 </div>

 <div className="flex flex-wrap gap-2">
 {availableSkills.map(skill => (
 <button
 key={skill.SkillID}
 type="button"
 onClick={() => handleAddSkill(skill)}
 className={`px-4 py-2 rounded-xl text-[11px] font-medium border transition-all ${selectedSkills.find(s => s.id === skill.SkillID)
 ? 'bg-[var(--accent)]/20 border-[var(--accent)] text-[var(--accent)]'
 : 'bg-[var(--bg-accent)] border-[var(--border-primary)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
 }`}
 >
 {skill.SkillName}
 </button>
 ))}
 </div>

 {selectedSkills.length > 0 && (
 <div className="space-y-4 pt-4">
 {selectedSkills.map(skill => (
 <div key={skill.id} className="glass-card p-6 rounded-3xl flex items-center justify-between bg-[var(--bg-accent)]/10">
 <div className="flex items-center gap-6">
 <div className="w-10 h-10 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] flex items-center justify-center font-semibold text-[11px] text-[var(--text-muted)]">
 {skill.name.substring(0, 2).toUpperCase()}
 </div>
 <div>
 <h4 className="text-sm font-semibold">{skill.name}</h4>
 <div className="flex items-center gap-4 mt-1">
 <label className="flex items-center gap-2 cursor-pointer group">
 <input
 type="checkbox"
 checked={skill.isMandatory}
 onChange={(e) => handleSkillChange(skill.id, 'isMandatory', e.target.checked)}
 className="sr-only"
 />
 <div className={`w-3 h-3 rounded-full border transition-all ${skill.isMandatory ? 'bg-[var(--success)] border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'border-[var(--border-primary)]'}`}></div>
 <span className={`text-[11px] font-medium ${skill.isMandatory ? 'text-[var(--success)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]'}`}>Mandatory</span>
 </label>
 </div>
 </div>
 </div>

 <div className="flex items-center gap-8">
 <div className="flex items-center gap-4">
 <span className="text-[11px] font-semibold text-[var(--text-muted)]">Min. Lvl</span>
 <input
 type="range"
 min="1"
 max="10"
 value={skill.minProficiency}
 onChange={(e) => handleSkillChange(skill.id, 'minProficiency', parseInt(e.target.value))}
 className="w-24 h-1 bg-[var(--bg-accent)] rounded-full appearance-none cursor-pointer accent-indigo-500"
 />
 <span className="w-6 text-center font-semibold text-[var(--accent)] text-xs">{skill.minProficiency}</span>
 </div>
 <button
 type="button"
 onClick={() => handleRemoveSkill(skill.id)}
 className="text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors"
 >
 <Trash2 size={16} />
 </button>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </form>

 {error && (
 <div className="px-10 py-4 bg-[var(--danger)]/10 border-y border-[var(--danger)]/20 text-[var(--danger)] text-[11px] font-medium text-center flex items-center justify-center gap-2">
 <Info size={14} /> {error}
 </div>
 )}

 {/* Footer */}
 <div className="p-8 border-t border-[var(--border-primary)] bg-[var(--bg-accent)]/20 flex items-center justify-end gap-6">
 <button
 type="button"
 onClick={onClose}
 className="text-[11px] font-semibold text-[var(--text-muted)] hover:text-[var(--accent)] transition-all"
 >
 Discard
 </button>
 <button
 onClick={handleSubmit}
 disabled={loading}
 className="bg-[var(--accent)] text-white px-10 py-4 rounded-2xl font-semibold text-xs flex items-center gap-3 hover:bg-[var(--accent-hover)] transition-all shadow-[var(--shadow-md)] shadow-[var(--shadow-md)] disabled:opacity-50 disabled:cursor-not-allowed group"
 >
 {loading ? 'Processing...' : (
 <>
 <CheckCircle size={18} className="group-hover:scale-110 transition-transform" />
 Finalize Posting
 </>
 )}
 </button>
 </div>
 </div>
 </div>
 );
};

export default JobModal;
