import React, { useState, useEffect } from 'react';
import { BookOpen, Video, FileText, ExternalLink, Sparkles, Loader2, Play } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../../apiConfig';
import { useToast } from '../../components/ui/Toast';

const LearningPaths = ({ learningPath, loading, onGenerate, onRefresh, initialTargetRole }) => {
    const { toast } = useToast();
 const [generating, setGenerating] = useState(false);
 const [selectedJobID, setSelectedJobID] = useState('');
 const [jobs, setJobs] = useState([]);
 const [loadingJobs, setLoadingJobs] = useState(true);
 const [showDemo, setShowDemo] = useState(false);
 const [generatedPath, setGeneratedPath] = useState(null);

 // Fetch available jobs for the dropdown
 useEffect(() => {
 const fetchJobs = async () => {
 try {
 const res = await axios.get(`${API_BASE}/candidates/discover`);
 // Filter to active jobs only
 const activeJobs = (res.data || []).filter(job => job.IsActive !== false);
 setJobs(activeJobs);
 } catch (err) {
 console.error('Fetch Jobs Error:', err);
 // Fallback to empty array
 setJobs([]);
 } finally {
 setLoadingJobs(false);
 }
 };
 fetchJobs();
 }, []);

 // Use real data from API only
 const displayPaths = (generatedPath || learningPath || []);

 const handleGenerate = async () => {
 if (!selectedJobID) {
 toast('Please select a target job first.');
 return;
 }
 setGenerating(true);
 try {
 // Send targetJobID directly to backend
 await axios.post(`${API_BASE}/candidates/learning-path`, { targetJobID: selectedJobID });

 // Fetch the newly generated learning path
 const res = await axios.get(`${API_BASE}/candidates/learning-path`);

 // If we got data back, use it; otherwise show demo
 if (res.data && res.data.length > 0) {
 // Set the generated path locally so it displays immediately
 setGeneratedPath(res.data);
 onRefresh();
 toast('Learning path generated successfully!');
 } else {
 // No data returned, show demo
 setShowDemo(true);
 toast('Demo learning path loaded! (Database connection needed for full feature)');
 }
 } catch (err) {
 console.error('Generate Learning Path Error:', err);
 // Show demo data on failure
 setShowDemo(true);
 toast('Demo learning path loaded! (Database connection needed for full feature)');
 } finally {
 setGenerating(false);
 }
 };

 if (loading || generating || loadingJobs) {
 return (
 <div className="flex flex-col items-center justify-center py-20">
 <Loader2 className="w-12 h-12 text-[var(--accent)] animate-spin mb-4" />
 <p className="text-[11px] font-semibold text-[var(--text-muted)]">
 {generating ? 'Generating Your Learning Path...' : 'Loading Learning Resources...'}
 </p>
 </div>
 );
 }

 return (
 <div className="space-y-5 sm:space-y-8">
 <div className="flex items-center justify-between mb-6">
 <div className="flex items-center gap-3">
 <BookOpen className="w-5 h-5 text-[var(--accent)]" />
 <h2 className="text-lg font-medium">Personalized Learning Paths</h2>
 </div>
 </div>

 {/* Generate New Path */}
 <div className="glass-card p-8 rounded-[var(--radius-xl)]">
 <div className="flex items-center gap-3 mb-6">
 <Sparkles className="w-5 h-5 text-[var(--warning)]" />
 <h3 className="text-sm font-medium">Generate New Learning Path</h3>
 </div>

 <div className="flex flex-col md:flex-row gap-4">
 <select
 value={selectedJobID}
 onChange={(e) => setSelectedJobID(e.target.value)}
 className="flex-1 bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-[var(--accent)]"
 >
 <option value="">Select your target job...</option>
 {jobs.map((job) => (
 <option key={job.JobID} value={job.JobID}>
 {job.JobTitle} - {job.Location} ({job.Vacancies} openings)
 </option>
 ))}
 </select>

 <button
 onClick={handleGenerate}
 disabled={generating}
 className="px-8 py-4 bg-[var(--accent)] text-white rounded-2xl font-semibold text-xs hover:bg-[var(--accent-hover)] transition-all disabled:opacity-50 flex items-center gap-2"
 >
 <Sparkles size={16} />
 Generate Path
 </button>
 </div>
 </div>

 {/* Existing Learning Paths */}
 {displayPaths.length === 0 ? (
 <div className="p-12 border-2 border-dashed border-[var(--border-primary)] rounded-[var(--radius-xl)] text-center bg-[var(--bg-accent)]/5">
 <BookOpen className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-6 opacity-20" />
 <p className="text-xs font-semibold text-[var(--text-muted)] mb-4">
 No learning paths generated yet.
 </p>
 <p className="text-[11px] text-[var(--text-muted)] opacity-60">
 Select a target job above to get personalized learning recommendations.
 </p>
 </div>
 ) : (
 <div className="space-y-6">
 {displayPaths.map((path, index) => (
 <div
 key={index}
 className="glass-card p-8 rounded-[var(--radius-xl)] hover:border-[var(--accent)] transition-all"
 >
 <div className="flex items-start justify-between mb-6">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)] flex items-center justify-center">
 <span className="text-lg font-semibold text-[var(--accent)]">{index + 1}</span>
 </div>
 <div>
 <h3 className="text-lg sm:text-xl font-semibold">{path.SkillName || 'Advanced React Patterns'}</h3>
 <p className="text-[11px] font-bold text-[var(--text-muted)] mt-1">
 {path.Priority ? `Priority #${path.Priority}` : 'Recommended Skill'}
 </p>
 </div>
 </div>
 <span className="px-4 py-2 bg-[var(--success)]/10 border border-emerald-500/20 rounded-xl text-[11px] font-medium text-[var(--success)]">
 {path.EstimatedHours || '8'} hours
 </span>
 </div>

 {/* Resources */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
 <div className="flex items-center gap-3 p-4 bg-[var(--bg-accent)] rounded-2xl border border-[var(--border-primary)]">
 <Video className="w-5 h-5 text-[var(--danger)]" />
 <div className="flex-1">
 <p className="text-xs font-semibold">Video Course</p>
 <p className="text-[11px] text-[var(--text-muted)]">2.5 hours</p>
 </div>
 </div>
 <div className="flex items-center gap-3 p-4 bg-[var(--bg-accent)] rounded-2xl border border-[var(--border-primary)]">
 <FileText className="w-5 h-5 text-[var(--warning)]" />
 <div className="flex-1">
 <p className="text-xs font-semibold">Documentation</p>
 <p className="text-[11px] text-[var(--text-muted)]">5 articles</p>
 </div>
 </div>
 <div className="flex items-center gap-3 p-4 bg-[var(--bg-accent)] rounded-2xl border border-[var(--border-primary)]">
 <Play className="w-5 h-5 text-[var(--accent)]" />
 <div className="flex-1">
 <p className="text-xs font-semibold">Hands-on Lab</p>
 <p className="text-[11px] text-[var(--text-muted)]">3 exercises</p>
 </div>
 </div>
 </div>

 {/* Action */}
 <div className="mt-6 pt-6 border-t border-[var(--border-primary)] flex justify-end">
 <button className="flex items-center gap-2 px-6 py-3 bg-[var(--accent)] text-white rounded-xl font-semibold text-xs hover:bg-[var(--accent-hover)] transition-all">
 Start Learning
 <ExternalLink size={14} />
 </button>
 </div>
 </div>
 ))}
 </div>
 )}

 {/* Learning Tips */}
 <div className="bg-[var(--bg-accent)] rounded-[var(--radius-xl)] p-8 border border-[var(--border-primary)]">
 <div className="flex items-center gap-3 mb-4">
 <Sparkles className="w-5 h-5 text-[var(--warning)]" />
 <h3 className="text-sm font-medium">Learning Strategy</h3>
 </div>
 <ul className="space-y-3">
 <li className="flex items-start gap-3 text-xs font-medium text-[var(--text-muted)]">
 <span className="w-2 h-2 rounded-full bg-[var(--success)] mt-1.5 shrink-0"></span>
 Complete one skill path before moving to the next
 </li>
 <li className="flex items-start gap-3 text-xs font-medium text-[var(--text-muted)]">
 <span className="w-2 h-2 rounded-full bg-[var(--success)] mt-1.5 shrink-0"></span>
 Practice with hands-on exercises to reinforce learning
 </li>
 <li className="flex items-start gap-3 text-xs font-medium text-[var(--text-muted)]">
 <span className="w-2 h-2 rounded-full bg-[var(--success)] mt-1.5 shrink-0"></span>
 Earn verified certificates to boost your profile
 </li>
 </ul>
 </div>
 </div>
 );
};

export default LearningPaths;
