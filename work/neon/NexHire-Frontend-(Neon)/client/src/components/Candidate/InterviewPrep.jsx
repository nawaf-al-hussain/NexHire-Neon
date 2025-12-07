import React, { useState } from 'react';
import { FileText, Video, CheckCircle, Clock, Sparkles, Loader2, Play } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../../apiConfig';
import { useToast } from '../../components/ui/Toast';

const InterviewPrep = ({ prepMaterials, loading, onGenerate, applications }) => {
    const { toast } = useToast();
 const [generating, setGenerating] = React.useState(false);
 const [selectedJob, setSelectedJob] = React.useState('');

 const handleGenerate = async () => {
 if (!selectedJob) {
 toast('Please select a job first.');
 return;
 }
 setGenerating(true);
 try {
 await axios.post(`${API_BASE}/candidates/interview-prep/generate`, { jobID: selectedJob });
 toast('Interview prep generated.');
 } catch (err) {
 console.error('Generate Interview Prep Error:', err);
 toast('Failed to generate interview prep. Please try again.');
 } finally {
 setGenerating(false);
 }
 };

 if (loading || generating) {
 return (
 <div className="flex flex-col items-center justify-center py-20">
 <Loader2 className="w-12 h-12 text-[var(--accent)] animate-spin mb-4" />
 <p className="text-[11px] font-semibold text-[var(--text-muted)]">
 {generating ? 'Generating Interview Prep...' : 'Loading Interview Materials...'}
 </p>
 </div>
 );
 }

 // Sample prep data
 const displayData = (prepMaterials && prepMaterials.length > 0) ? prepMaterials : [];

 return (
 <div className="space-y-5 sm:space-y-8">
 <div className="flex items-center justify-between mb-6">
 <div className="flex items-center gap-3">
 <FileText className="w-5 h-5 text-[var(--accent)]" />
 <h2 className="text-lg font-medium">Interview Preparation</h2>
 </div>
 </div>

 {/* Generate New Prep */}
 <div className="glass-card p-8 rounded-[var(--radius-xl)]">
 <div className="flex items-center gap-3 mb-6">
 <Sparkles className="w-5 h-5 text-[var(--warning)]" />
 <h3 className="text-sm font-medium">Generate Personalized Prep</h3>
 </div>

 <div className="flex flex-col md:flex-row gap-4">
 <select
 value={selectedJob}
 onChange={(e) => setSelectedJob(e.target.value)}
 className="flex-1 bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-[var(--accent)]"
 >
 <option value="">Select a job you've applied for...</option>
 {applications && applications.map((app) => (
 <option key={app.ApplicationID} value={app.JobID}>
 {app.JobTitle} - {app.StatusName}
 </option>
 ))}
 </select>

 <button
 onClick={handleGenerate}
 disabled={generating}
 className="px-8 py-4 bg-[var(--accent)] text-white rounded-2xl font-semibold text-xs hover:bg-[var(--accent-hover)] transition-all disabled:opacity-50 flex items-center gap-2"
 >
 <Sparkles size={16} />
 Generate Prep
 </button>
 </div>
 </div>

 {/* Prep Materials */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
 {displayData.map((prep, index) => (
 <div
 key={index}
 className="glass-card p-8 rounded-[var(--radius-xl)] hover:border-[var(--accent)] transition-all group"
 >
 <div className="flex items-start justify-between mb-4">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)] flex items-center justify-center">
 {prep.type === 'Video' ? (
 <Video className="w-6 h-6 text-[var(--accent)]" />
 ) : prep.type === 'Article' ? (
 <FileText className="w-6 h-6 text-[var(--warning)]" />
 ) : (
 <Play className="w-6 h-6 text-[var(--danger)]" />
 )}
 </div>
 <div>
 <h3 className="text-lg sm:text-xl font-semibold">{prep.title || 'Interview Question Patterns'}</h3>
 <p className="text-[11px] font-bold text-[var(--text-muted)] mt-1">
 {prep.type || 'Video'} • {prep.duration || '30 min'}
 </p>
 </div>
 </div>
 <span className={`px-4 py-2 rounded-xl text-[11px] font-medium ${(prep.difficulty || 'Intermediate') === 'Advanced'
 ? 'bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/20'
 : (prep.difficulty || 'Intermediate') === 'Beginner'
 ? 'bg-[var(--success)]/10 text-[var(--success)] border border-emerald-500/20'
 : 'bg-[var(--warning)]/10 text-[var(--warning)] border border-amber-500/20'
 }`}>
 {prep.difficulty || 'Intermediate'}
 </span>
 </div>

 <p className="text-xs text-[var(--text-muted)] mb-6 line-clamp-2">
 Master common interview patterns and questions for {prep.difficulty || 'all levels'} candidates.
 Includes detailed explanations and sample answers.
 </p>

 <div className="flex items-center justify-between pt-4 border-t border-[var(--border-primary)]">
 <div className="flex items-center gap-2 text-[11px] font-semibold text-[var(--text-muted)]">
 <Clock size={14} />
 {prep.duration || '30 min'} remaining
 </div>
 <button className="flex items-center gap-2 px-6 py-3 bg-[var(--accent)] text-white rounded-xl font-semibold text-xs hover:bg-[var(--accent-hover)] transition-all">
 <Play size={14} />
 Start
 </button>
 </div>
 </div>
 ))}
 </div>

 {/* Tips */}
 <div className="bg-[var(--bg-accent)] rounded-[var(--radius-xl)] p-8 border border-[var(--border-primary)]">
 <div className="flex items-center gap-3 mb-4">
 <Sparkles className="w-5 h-5 text-[var(--warning)]" />
 <h3 className="text-sm font-medium">Interview Success Tips</h3>
 </div>
 <ul className="space-y-3">
 <li className="flex items-start gap-3 text-xs font-medium text-[var(--text-muted)]">
 <span className="w-2 h-2 rounded-full bg-[var(--accent)] mt-1.5 shrink-0"></span>
 Practice the STAR method for behavioral questions
 </li>
 <li className="flex items-start gap-3 text-xs font-medium text-[var(--text-muted)]">
 <span className="w-2 h-2 rounded-full bg-[var(--accent)] mt-1.5 shrink-0"></span>
 Review the job description for key skills to highlight
 </li>
 <li className="flex items-start gap-3 text-xs font-medium text-[var(--text-muted)]">
 <span className="w-2 h-2 rounded-full bg-[var(--accent)] mt-1.5 shrink-0"></span>
 Prepare your own questions for the interviewer
 </li>
 </ul>
 </div>
 </div>
 );
};

export default InterviewPrep;
