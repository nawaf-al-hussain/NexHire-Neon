import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Loader2, Briefcase } from 'lucide-react';
import API_BASE from '../../apiConfig';
import axios from 'axios';

const JobEditModal = ({ job, isOpen, onClose, onSave }) => {
 const [formData, setFormData] = useState({
 title: '',
 description: '',
 location: '',
 minExperience: 0,
 vacancies: 1,
 isActive: true,
 skills: [],
 minSalary: '',
 maxSalary: '',
 salaryTransparent: false
 });
 const [availableSkills, setAvailableSkills] = useState([]);
 const [loading, setLoading] = useState(false);
 const [saving, setSaving] = useState(false);
 const [error, setError] = useState('');
 const [showSalarySection, setShowSalarySection] = useState(false);

 // Fetch available skills when modal opens
 useEffect(() => {
 if (isOpen) {
 fetchSkills();
 if (job) {
 fetchJobDetails();
 } else {
 // Reset form for new job
 setShowSalarySection(false);
 }
 }
 }, [isOpen, job]);

 const fetchSkills = async () => {
 try {
 const token = localStorage.getItem('nexhire_token');
 const res = await axios.get(`${API_BASE}/skills`, {
 headers: { Authorization: `Bearer ${token}` }
 });
 setAvailableSkills(res.data || []);
 } catch (err) {
 console.error('Error fetching skills:', err);
 }
 };

 const fetchJobDetails = async () => {
 try {
 setLoading(true);
 const token = localStorage.getItem('nexhire_token');
 const res = await axios.get(`${API_BASE}/jobs/${job.JobID}`, {
 headers: { Authorization: `Bearer ${token}` }
 });
 const jobData = res.data;
 setFormData({
 title: jobData.JobTitle || '',
 description: jobData.Description || '',
 location: jobData.Location || '',
 minExperience: jobData.MinExperience || 0,
 vacancies: jobData.Vacancies || 1,
 isActive: jobData.IsActive,
 skills: (jobData.skills || []).map(s => ({
 id: s.SkillID,
 name: s.SkillName,
 isMandatory: s.IsMandatory,
 minProficiency: s.MinProficiency
 })),
 minSalary: jobData.minSalary || '',
 maxSalary: jobData.maxSalary || '',
 salaryTransparent: jobData.salaryTransparent || false
 });

 // Show salary section if job has salary data
 if (jobData.minSalary || jobData.maxSalary) {
 setShowSalarySection(true);
 }
 } catch (err) {
 console.error('Error fetching job details:', err);
 setError('Failed to load job details');
 } finally {
 setLoading(false);
 }
 };

 const handleChange = (e) => {
 const { name, value, type, checked } = e.target;
 setFormData(prev => ({
 ...prev,
 [name]: type === 'checkbox' ? checked : value
 }));
 };

 const addSkill = () => {
 if (availableSkills.length > 0) {
 setFormData(prev => ({
 ...prev,
 skills: [...prev.skills, {
 id: availableSkills[0].SkillID,
 name: availableSkills[0].SkillName,
 isMandatory: false,
 minProficiency: 1
 }]
 }));
 }
 };

 const updateSkill = (index, field, value) => {
 setFormData(prev => {
 const newSkills = [...prev.skills];
 if (field === 'id') {
 const skill = availableSkills.find(s => s.SkillID === parseInt(value));
 newSkills[index] = { ...newSkills[index], id: parseInt(value), name: skill?.SkillName || '' };
 } else {
 newSkills[index] = { ...newSkills[index], [field]: value };
 }
 return { ...prev, skills: newSkills };
 });
 };

 const removeSkill = (index) => {
 setFormData(prev => ({
 ...prev,
 skills: prev.skills.filter((_, i) => i !== index)
 }));
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 setError('');
 setSaving(true);

 try {
 const token = localStorage.getItem('nexhire_token');
 const payload = {
 title: formData.title,
 description: formData.description,
 location: formData.location,
 minExperience: parseInt(formData.minExperience) || 0,
 vacancies: parseInt(formData.vacancies) || 1,
 isActive: formData.isActive,
 skills: formData.skills.map(s => ({
 id: s.id,
 isMandatory: s.isMandatory,
 minProficiency: parseInt(s.minProficiency) || 1
 })),
 minSalary: formData.minSalary ? parseInt(formData.minSalary) : null,
 maxSalary: formData.maxSalary ? parseInt(formData.maxSalary) : null,
 salaryTransparent: formData.salaryTransparent
 };

 await axios.put(`${API_BASE}/jobs/${job.JobID}`, payload, {
 headers: { Authorization: `Bearer ${token}` }
 });

 onSave({ ...job, ...payload });
 onClose();
 } catch (err) {
 console.error('Error saving job:', err);
 setError(err.response?.data?.error || 'Failed to save job');
 } finally {
 setSaving(false);
 }
 };

 if (!isOpen) return null;

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 {/* Backdrop */}
 <div
 className="absolute inset-0 bg-black/60 backdrop-blur-sm"
 onClick={onClose}
 ></div>

 {/* Modal */}
 <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] animate-in zoom-in-95 duration-200">
 {/* Header */}
 <div className="sticky top-0 z-10 flex items-center gap-4 p-8 border-b border-[var(--border-primary)] bg-[var(--bg-primary)]">
 <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
 <Briefcase size={28} />
 </div>
 <div className="flex-1">
 <h2 className="text-lg sm:text-xl font-medium">Edit Job Post</h2>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">
 Update job details and required skills
 </p>
 </div>
 <button
 onClick={onClose}
 className="w-10 h-10 rounded-xl bg-[var(--bg-accent)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all"
 >
 <X size={18} />
 </button>
 </div>

 {loading ? (
 <div className="flex flex-col items-center justify-center py-20">
 <Loader2 className="w-12 h-12 text-[var(--accent)] animate-spin mb-4" />
 <p className="text-[11px] font-semibold text-[var(--text-muted)]">
 Loading Details...
 </p>
 </div>
 ) : (
 <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
 {error && (
 <div className="p-4 bg-[var(--danger)]/10 border border-[var(--danger)]/20 rounded-2xl">
 <p className="text-xs font-semibold text-[var(--danger)]">{error}</p>
 </div>
 )}

 {/* Title */}
 <div>
 <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-2">
 Job Title *
 </label>
 <input
 type="text"
 name="title"
 value={formData.title}
 onChange={handleChange}
 required
 className="w-full bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl px-6 py-4 text-sm font-normal focus:outline-none focus:border-[var(--accent)] transition-colors text-[var(--text-primary)]"
 placeholder="e.g., Senior React Developer"
 />
 </div>

 {/* Description */}
 <div>
 <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-2">
 Description
 </label>
 <textarea
 name="description"
 value={formData.description}
 onChange={handleChange}
 rows={4}
 className="w-full bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl px-6 py-4 text-sm font-normal focus:outline-none focus:border-[var(--accent)] transition-colors resize-none text-[var(--text-primary)]"
 placeholder="Job description..."
 />
 </div>

 {/* Location & Experience */}
 <div className="grid grid-cols-2 gap-4 sm:gap-6">
 <div>
 <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-2">
 Location
 </label>
 <input
 type="text"
 name="location"
 value={formData.location}
 onChange={handleChange}
 className="w-full bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl px-6 py-4 text-sm font-normal focus:outline-none focus:border-[var(--accent)] transition-colors text-[var(--text-primary)]"
 placeholder="e.g., New York, NY"
 />
 </div>
 <div>
 <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-2">
 Min Experience (Years)
 </label>
 <input
 type="number"
 name="minExperience"
 value={formData.minExperience}
 onChange={handleChange}
 min="0"
 className="w-full bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl px-6 py-4 text-sm font-normal focus:outline-none focus:border-[var(--accent)] transition-colors text-[var(--text-primary)]"
 />
 </div>
 </div>

 {/* Vacancies & Active */}
 <div className="grid grid-cols-2 gap-4 sm:gap-6">
 <div>
 <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-2">
 Vacancies *
 </label>
 <input
 type="number"
 name="vacancies"
 value={formData.vacancies}
 onChange={handleChange}
 required
 min="1"
 className="w-full bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl px-6 py-4 text-sm font-normal focus:outline-none focus:border-[var(--accent)] transition-colors text-[var(--text-primary)]"
 />
 </div>
 <div className="flex items-center pt-4">
 <label className="flex items-center gap-3 cursor-pointer">
 <input
 type="checkbox"
 name="isActive"
 checked={formData.isActive}
 onChange={handleChange}
 className="w-5 h-5 rounded-xl border-[var(--border-primary)] bg-[var(--bg-accent)] text-[var(--accent)] focus:ring-[var(--accent-ring)] focus:ring-offset-0"
 />
 <span className="text-sm font-semibold text-[var(--text-primary)]">Active Job</span>
 </label>
 </div>
 </div>

 {/* Salary Range Section */}
 <div className="glass-card rounded-2xl p-6 border border-[var(--accent)]">
 <button
 type="button"
 onClick={() => setShowSalarySection(!showSalarySection)}
 className="flex items-center justify-between w-full"
 >
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-[var(--success)]/10 flex items-center justify-center">
 <span className="text-[var(--success)] font-semibold text-sm">$</span>
 </div>
 <div className="text-left">
 <h4 className="text-sm font-semibold text-[var(--text-primary)]">Salary Range</h4>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">
 {formData.minSalary || formData.maxSalary
 ? `${formData.minSalary || '0'} - ${formData.maxSalary || '0'}`
 : 'Set salary range for this job'}
 </p>
 </div>
 </div>
 <input
 type="checkbox"
 checked={showSalarySection}
 onChange={() => setShowSalarySection(!showSalarySection)}
 className="w-5 h-5 rounded-xl border-[var(--border-primary)] bg-[var(--bg-accent)] text-[var(--accent)] focus:ring-[var(--accent-ring)] focus:ring-offset-0"
 />
 </button>

 {showSalarySection && (
 <div className="mt-6 grid grid-cols-2 gap-4">
 <div>
 <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-2">
 Min Salary ($)
 </label>
 <input
 type="number"
 name="minSalary"
 value={formData.minSalary}
 onChange={handleChange}
 placeholder="e.g., 50000"
 className="w-full bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl px-6 py-4 text-sm font-normal focus:outline-none focus:border-[var(--accent)] transition-colors text-[var(--text-primary)]"
 />
 </div>
 <div>
 <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-2">
 Max Salary ($)
 </label>
 <input
 type="number"
 name="maxSalary"
 value={formData.maxSalary}
 onChange={handleChange}
 placeholder="e.g., 80000"
 className="w-full bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl px-6 py-4 text-sm font-normal focus:outline-none focus:border-[var(--accent)] transition-colors text-[var(--text-primary)]"
 />
 </div>
 <div className="col-span-2 flex items-center gap-3 pt-2">
 <input
 type="checkbox"
 name="salaryTransparent"
 checked={formData.salaryTransparent}
 onChange={handleChange}
 className="w-5 h-5 rounded-xl border-[var(--border-primary)] bg-[var(--bg-accent)] text-[var(--accent)] focus:ring-[var(--accent-ring)] focus:ring-offset-0"
 />
 <label className="text-sm font-semibold text-[var(--text-primary)]">
 Make salary visible to candidates
 </label>
 </div>
 </div>
 )}
 </div>

 {/* Skills */}
 <div>
 <div className="flex items-center justify-between mb-2">
 <label className="text-[11px] font-medium text-[(--text-muted)]">
 Required Skills
 </label>
 <button
 type="button"
 onClick={addSkill}
 className="flex items-center gap-1 text-[11px] font-medium text-[var(--accent)] hover:text-[var(--accent)] transition-colors"
 >
 <Plus size={14} /> Add Skill
 </button>
 </div>
 <div className="space-y-3 max-h-48 overflow-y-auto">
 {formData.skills.map((skill, index) => (
 <div key={index} className="flex items-center gap-3 p-4 bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl">
 <select
 value={skill.id}
 onChange={(e) => updateSkill(index, 'id', e.target.value)}
 className="flex-1 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)]"
 >
 {availableSkills.map(s => (
 <option key={s.SkillID} value={s.SkillID}>{s.SkillName}</option>
 ))}
 </select>
 <label className="flex items-center gap-2 text-[11px] font-medium text-[var(--text-muted)]">
 <input
 type="checkbox"
 checked={skill.isMandatory}
 onChange={(e) => updateSkill(index, 'isMandatory', e.target.checked)}
 className="w-4 h-4 rounded-lg"
 />
 Mandatory
 </label>
 <select
 value={skill.minProficiency}
 onChange={(e) => updateSkill(index, 'minProficiency', e.target.value)}
 className="w-20 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl px-3 py-3 text-sm font-bold focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)]"
 >
 {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(l => (
 <option key={l} value={l}>L{l}</option>
 ))}
 </select>
 <button
 type="button"
 onClick={() => removeSkill(index)}
 className="w-10 h-10 rounded-xl bg-[var(--danger)]/10 border border-[var(--danger)]/20 flex items-center justify-center text-[var(--danger)] hover:bg-[var(--danger)] hover:text-white transition-all"
 >
 <Trash2 size={16} />
 </button>
 </div>
 ))}
 {formData.skills.length === 0 && (
 <div className="p-8 border-2 border-dashed border-[var(--border-primary)] rounded-2xl text-center bg-[var(--bg-accent)]/5">
 <p className="text-[11px] font-semibold text-[var(--text-muted)] ">
 No skills added yet
 </p>
 </div>
 )}
 </div>
 </div>

 {/* Actions */}
 <div className="flex items-center justify-end gap-4 pt-6 border-t border-[var(--border-primary)]">
 <button
 type="button"
 onClick={onClose}
 className="px-6 py-4 text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
 >
 Cancel
 </button>
 <button
 type="submit"
 disabled={saving}
 className="px-8 py-4 bg-[var(--accent)] text-white rounded-2xl font-semibold text-xs hover:bg-[var(--accent-hover)] transition-all disabled:opacity-50 flex items-center gap-2"
 >
 {saving ? (
 <>
 <Loader2 size={16} className="animate-spin" />
 Saving...
 </>
 ) : (
 'Save Changes'
 )}
 </button>
 </div>
 </form>
 )}
 </div>
 </div>
 );
};

export default JobEditModal;
