import React, { useState, useEffect } from 'react';
import { X, Search, Sparkles, Sliders, Check } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../../apiConfig';
import { useToast } from '../../components/ui/Toast';

const SkillManagementModal = ({ isOpen, onClose, onRefresh, currentSkills = [] }) => {
    const { toast } = useToast();
 const [allSkills, setAllSkills] = useState([]);
 const [search, setSearch] = useState('');
 const [selectedSkill, setSelectedSkill] = useState(null);
 const [proficiency, setProficiency] = useState(5);
 const [saving, setSaving] = useState(false);

 useEffect(() => {
 if (isOpen) {
 fetchSkills();
 }
 }, [isOpen]);

 const fetchSkills = async () => {
 try {
 const res = await axios.get(`${API_BASE}/skills`);
 setAllSkills(res.data);
 } catch (err) {
 console.error("Fetch Skills Error:", err);
 }
 };

 const handleSave = async () => {
 if (!selectedSkill) return;
 setSaving(true);
 try {
 await axios.post(`${API_BASE}/candidates/skills`, {
 skillID: selectedSkill.SkillID,
 proficiencyLevel: proficiency
 });
 onRefresh();
 onClose();
 setSelectedSkill(null);
 setSearch('');
 } catch (err) {
 console.error("Save Skill Error:", err);
 toast("Failed to update skill.");
 } finally {
 setSaving(false);
 }
 };

 if (!isOpen) return null;

 const filteredSkills = allSkills.filter(s =>
 s.SkillName.toLowerCase().includes(search.toLowerCase()) &&
 !currentSkills.some(cs => cs.SkillID === s.SkillID)
 );

 return (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-sm bg-black/60 animate-in fade-in duration-300">
 <div className="bg-[var(--bg-secondary)] w-full max-w-xl rounded-[var(--radius-xl)] border border-[var(--border-primary)] shadow-[var(--shadow-lg)] relative overflow-hidden flex flex-col max-h-[85vh]">
 <div className="absolute top-0 right-0 p-8">
 <button onClick={onClose} className="p-3 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl hover:bg-[var(--surface-hover)] transition-colors">
 <X className="w-5 h-5" />
 </button>
 </div>

 <div className="p-10 pb-6">
 <div className="flex items-center gap-4 mb-2">
 <Sparkles className="w-5 h-5 text-[var(--accent)]" />
 <h2 className="text-xl sm:text-2xl font-medium">Skill Inventory</h2>
 </div>
 <p className="text-xs text-[var(--text-muted)] font-bold opacity-60">Expand your technical profile to unlock matches</p>
 </div>

 <div className="px-10 flex-1 overflow-y-auto pb-10 custom-scrollbar">
 {!selectedSkill ? (
 <>
 <div className="relative mb-8 pt-4">
 <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-5 h-5" />
 <input
 type="text"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 placeholder="Search 500+ skills..."
 className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-3xl py-5 pl-14 pr-6 text-sm font-bold focus:border-[var(--accent)] outline-none transition-all placeholder:opacity-30"
 />
 </div>

 <div className="space-y-2">
 {filteredSkills.slice(0, 10).map(skill => (
 <button
 key={skill.SkillID}
 onClick={() => setSelectedSkill(skill)}
 className="w-full p-6 text-left bg-[var(--bg-accent)]/30 border border-[var(--border-primary)] rounded-3xl hover:bg-[var(--accent)]/5 hover:border-[var(--accent)] transition-all flex items-center justify-between group"
 >
 <span className="font-bold text-sm tracking-tight">{skill.SkillName}</span>
 <div className="w-8 h-8 rounded-full border border-[var(--accent)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
 <Check className="w-4 h-4 text-[var(--accent)]" />
 </div>
 </button>
 ))}
 {filteredSkills.length === 0 && search && (
 <p className="text-center py-10 text-[var(--text-muted)] text-xs font-bold opacity-40">No matching skills found.</p>
 )}
 </div>
 </>
 ) : (
 <div className="animate-in slide-in-from-right duration-300">
 <div className="bg-[var(--accent)]/5 border border-[var(--accent)] p-8 rounded-[var(--radius-xl)] mb-8">
 <h3 className="text-lg font-medium text-[var(--accent)] mb-1">{selectedSkill.SkillName}</h3>
 <p className="text-[11px] font-medium opacity-60">Define your technical maturity</p>
 </div>

 <div className="p-8 bg-[var(--bg-accent)]/30 border border-[var(--border-primary)] rounded-[var(--radius-xl)]">
 <div className="flex items-center justify-between mb-8">
 <div className="flex items-center gap-2">
 <Sliders className="w-4 h-4 text-[var(--accent)]" />
 <span className="text-[11px] font-medium">Proficiency (1-10)</span>
 </div>
 <span className="text-xl sm:text-2xl font-semibold text-[var(--accent)]">{proficiency}</span>
 </div>

 <input
 type="range"
 min="1"
 max="10"
 value={proficiency}
 onChange={(e) => setProficiency(parseInt(e.target.value))}
 className="w-full h-2 bg-[var(--bg-primary)] rounded-lg appearance-none cursor-pointer accent-indigo-500 mb-4"
 />

 <div className="flex justify-between text-[11px] font-medium text-[var(--text-muted)] opacity-40">
 <span>Novice</span>
 <span>Intermediate</span>
 <span>Expert</span>
 </div>
 </div>

 <div className="flex gap-4 mt-8">
 <button
 onClick={() => setSelectedSkill(null)}
 className="flex-1 py-5 border border-[var(--border-primary)] rounded-[var(--radius-xl)] font-semibold text-[11px] hover:bg-[var(--surface-hover)] transition-all"
 >
 Back to List
 </button>
 <button
 onClick={handleSave}
 disabled={saving}
 className="flex-3 py-5 bg-[var(--accent)] rounded-[var(--radius-xl)] font-semibold text-[11px] hover:bg-[var(--accent-hover)] transition-all flex items-center justify-center gap-2"
 >
 {saving ? 'Syncing...' : 'Add to Profile'}
 </button>
 </div>
 </div>
 )}
 </div>
 </div>
 </div>
 );
};

export default SkillManagementModal;
