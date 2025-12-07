import React, { useState, useEffect } from 'react';
import { useToast } from '../../components/ui/Toast';
import {
useAuth } from '../../context/AuthContext';
import axios from 'axios';
import API_BASE from '../../apiConfig';
import {
 MessageSquare,
 Users,
 TrendingUp,
 Clock,
 CheckCircle,
 AlertTriangle,
 Loader2,
 Plus,
 Save,
 Eye,
 RefreshCw,
 X
} from 'lucide-react';

const InterviewQuestionsGenerator = () => {
    const { toast } = useToast();
 const { user } = useAuth();
 const [jobs, setJobs] = useState([]);
 const [selectedJob, setSelectedJob] = useState('');
 const [questionCount, setQuestionCount] = useState(10);
 const [difficultyLevel, setDifficultyLevel] = useState(5);
 const [questions, setQuestions] = useState([]);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');
 const [generatedQuestions, setGeneratedQuestions] = useState([]);
 const [savedQuestions, setSavedQuestions] = useState([]);
 const [activeTab, setActiveTab] = useState('generate');

 // Fetch jobs for dropdown
 useEffect(() => {
 const fetchJobs = async () => {
 try {
 const response = await axios.get(`${API_BASE}/jobs`);
 if (response.data) {
 setJobs(response.data.filter(job => job.IsActive));
 }
 } catch (err) {
 console.error('Error fetching jobs:', err);
 }
 };
 fetchJobs();
 }, []);

 // Fetch saved questions when job is selected
 useEffect(() => {
 const fetchSavedQuestions = async () => {
 if (!selectedJob) return;
 try {
 const response = await axios.get(`${API_BASE}/interviews/generated-questions/${selectedJob}`);
 if (response.data) {
 setSavedQuestions(response.data);
 }
 } catch (err) {
 console.error('Error fetching saved questions:', err);
 }
 };
 fetchSavedQuestions();
 }, [selectedJob]);

 const generateQuestions = async () => {
 if (!selectedJob) {
 setError('Please select a job first.');
 return;
 }

 setLoading(true);
 setError('');

 try {
 const response = await axios.post(`${API_BASE}/interviews/generate-questions`, {
 jobId: parseInt(selectedJob),
 questionCount,
 difficultyLevel
 });

 if (response.data) {
 setGeneratedQuestions(response.data.questions);
 setQuestions(response.data.questions);
 }
 } catch (err) {
 setError(err.response?.data?.error || 'Failed to generate questions.');
 console.error('Generate questions error:', err);
 } finally {
 setLoading(false);
 }
 };

 const saveQuestion = async (question) => {
 try {
 const response = await axios.post(`${API_BASE}/interviews/save-question`, {
 jobId: parseInt(selectedJob),
 questionType: question.questionType,
 questionText: question.questionText,
 difficultyLevel: question.difficultyLevel,
 expectedKeywords: question.expectedKeywords,
 scoringRubric: question.scoringGuide
 });

 if (response.status === 201) {
 toast('Question saved successfully!');
 // Refresh saved questions
 const savedResponse = await axios.get(`${API_BASE}/interviews/generated-questions/${selectedJob}`);
 if (savedResponse.data) {
 setSavedQuestions(savedResponse.data);
 }
 }
 } catch (err) {
 console.error('Error saving question:', err);
 }
 };

 const getDifficultyLabel = (level) => {
 if (level <= 3) return 'Beginner';
 if (level <= 6) return 'Intermediate';
 return 'Advanced';
 };

 const getQuestionTypeColor = (type) => {
 switch (type) {
 case 'Technical': return 'text-[var(--accent)]';
 case 'Behavioral': return 'text-[var(--accent)]';
 case 'Cultural': return 'text-[var(--success)]';
 case 'Scenario': return 'text-[var(--warning)]';
 default: return 'text-[var(--text-muted)]';
 }
 };

 const getQuestionTypeBg = (type) => {
 switch (type) {
 case 'Technical': return 'bg-[var(--accent)]/10 border-[var(--accent)]/20';
 case 'Behavioral': return 'bg-[var(--accent)]/10 border-[var(--accent)]/20';
 case 'Cultural': return 'bg-[var(--success)]/10 border-green-500/20';
 case 'Scenario': return 'bg-orange-500/10 border-orange-500/20';
 default: return 'bg-[var(--bg-accent)] border-[var(--border-primary)]';
 }
 };

 if (user?.RoleID !== 2) {
 return (
 <div className="glass-card p-8 rounded-[var(--radius-xl)] text-center">
 <p className="text-[var(--text-muted)]">Access denied. This feature is for recruiters only.</p>
 </div>
 );
 }

 if (loading && !jobs.length) {
 return (
 <div className="flex flex-col items-center justify-center py-20">
 <Loader2 className="w-12 h-12 text-[var(--accent)] animate-spin mb-4" />
 <p className="text-[11px] font-semibold text-[var(--text-muted)]">Loading AI Questions Generator...</p>
 </div>
 );
 }

 if (error) {
 return (
 <div className="glass-card p-8 rounded-[var(--radius-xl)] text-center">
 <AlertTriangle className="w-12 h-12 text-[var(--danger)] mx-auto mb-4" />
 <h3 className="text-sm font-medium mb-2">Error Loading Data</h3>
 <p className="text-xs font-semibold text-[var(--text-muted)] mb-4">{error}</p>
 <button
 onClick={() => window.location.reload()}
 className="px-6 py-3 bg-[var(--accent)] text-white rounded-xl text-xs font-medium hover:bg-[var(--accent-hover)] transition-all"
 >
 Try Again
 </button>
 </div>
 );
 }

 return (
 <div className="space-y-6 sm:space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
 <div className="glass-card rounded-[var(--radius-xl)] p-8 border border-[var(--accent)]">
 <div className="flex items-center gap-4">
 <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
 <MessageSquare size={28} />
 </div>
 <div>
 <h2 className="text-lg sm:text-xl font-medium">AI Interview Question Generator</h2>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Generate intelligent interview questions based on job requirements</p>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-[var(--accent)]">
 <div className="flex items-center gap-3 mb-2">
 <Users size={18} className="text-[var(--accent)]" />
 <span className="text-[11px] font-medium text-[var(--accent)]">Available Jobs</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">{jobs.length}</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Job postings</p>
 </div>
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-[var(--accent)]/20">
 <div className="flex items-center gap-3 mb-2">
 <TrendingUp size={18} className="text-[var(--accent)]" />
 <span className="text-[11px] font-medium text-[var(--accent)]">Questions Generated</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">{generatedQuestions.length}</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">This session</p>
 </div>
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-amber-500/20">
 <div className="flex items-center gap-3 mb-2">
 <Clock size={18} className="text-[var(--warning)]" />
 <span className="text-[11px] font-medium text-[var(--warning)]">Difficulty Level</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">{difficultyLevel}</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">{getDifficultyLabel(difficultyLevel)}</p>
 </div>
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-green-500/20">
 <div className="flex items-center gap-3 mb-2">
 <CheckCircle size={18} className="text-[var(--success)]" />
 <span className="text-[11px] font-medium text-[var(--success)]">Saved Questions</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">{savedQuestions.length}</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">In library</p>
 </div>
 </div>

 <div className="glass-card rounded-[var(--radius-xl)] p-8">
 <div className="flex items-center justify-between mb-6">
 <h3 className="text-lg font-medium">Generate Questions</h3>
 <div className="flex gap-2">
 <button
 onClick={generateQuestions}
 disabled={loading || !selectedJob}
 className={`flex items-center gap-2 px-4 py-3 ${loading || !selectedJob ? 'bg-[var(--bg-accent)] text-[var(--text-muted)] cursor-not-allowed' : 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white'} rounded-xl text-xs font-medium transition-all`}
 >
 <Plus className="w-4 h-4" />
 {loading ? 'Generating...' : 'Generate Questions'}
 </button>
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
 <div>
 <label className="block text-[11px] font-semibold text-[var(--text-muted)] ml-1 mb-2">
 Select Job
 </label>
 <select
 value={selectedJob}
 onChange={(e) => setSelectedJob(e.target.value)}
 className="w-full bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-xl py-4 px-6 text-sm font-bold"
 >
 <option value="">Select a job...</option>
 {jobs.map(job => (
 <option key={job.JobID} value={job.JobID}>
 {job.JobTitle} - {job.Location}
 </option>
 ))}
 </select>
 </div>

 <div>
 <label className="block text-[11px] font-semibold text-[var(--text-muted)] ml-1 mb-2">
 Number of Questions: {questionCount}
 </label>
 <input
 type="range"
 min="5"
 max="20"
 value={questionCount}
 onChange={(e) => setQuestionCount(parseInt(e.target.value))}
 className="w-full"
 />
 <div className="flex justify-between text-xs font-bold text-[var(--text-muted)] mt-1">
 <span>5</span>
 <span>20</span>
 </div>
 </div>

 <div>
 <label className="block text-[11px] font-semibold text-[var(--text-muted)] ml-1 mb-2">
 Difficulty Level: {difficultyLevel} ({getDifficultyLabel(difficultyLevel)})
 </label>
 <input
 type="range"
 min="1"
 max="10"
 value={difficultyLevel}
 onChange={(e) => setDifficultyLevel(parseInt(e.target.value))}
 className="w-full"
 />
 <div className="flex justify-between text-xs font-bold text-[var(--text-muted)] mt-1">
 <span>Beginner</span>
 <span>Advanced</span>
 </div>
 </div>
 </div>

 {error && (
 <div className="p-4 bg-rose-900/20 border border-rose-500/30 rounded-xl mb-6">
 <p className="text-xs font-semibold text-[var(--danger)]">{error}</p>
 </div>
 )}

 {questions.length > 0 && (
 <div className="space-y-4">
 <h4 className="text-lg font-medium mb-4">Generated Questions</h4>
 <div className="space-y-4">
 {questions.map((q, index) => (
 <div key={index} className="glass-card rounded-[var(--radius-xl)] p-6">
 <div className="flex items-start justify-between">
 <div className="flex items-start gap-4">
 <div className="p-3 bg-[var(--bg-accent)] rounded-xl text-[var(--accent)]">
 <MessageSquare size={20} />
 </div>
 <div>
 <div className="flex items-center gap-3 mb-2">
 <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium ${getQuestionTypeBg(q.questionType)}`}>
 {q.questionType}
 </span>
 {q.skillName && (
 <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium bg-[var(--bg-accent)] border border-[var(--border-primary)]">
 {q.skillName}
 </span>
 )}
 {q.priority === 'High Priority' && (
 <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/20">
 High Priority
 </span>
 )}
 </div>
 <p className="text-sm font-semibold text-[var(--text-primary)] mb-3">{q.questionText}</p>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-[var(--text-muted)]">
 <div>
 <span className="font-medium">Difficulty:</span> {q.difficultyLevel}/10 ({getDifficultyLabel(q.difficultyLevel)})
 </div>
 <div>
 <span className="font-medium">Expected Keywords:</span> {q.expectedKeywords?.join(', ') || 'N/A'}
 </div>
 <div className="md:col-span-2">
 <span className="font-medium">Scoring Guide:</span> {q.scoringGuide}
 </div>
 </div>
 </div>
 </div>
 <div className="flex items-center gap-4">
 <button
 onClick={() => saveQuestion(q)}
 className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-xs font-medium transition-all"
 >
 <Save className="w-4 h-4" />
 Save Question
 </button>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}
 </div>

 {/* Saved Questions Section */}
 {savedQuestions.length > 0 && (
 <div className="glass-card rounded-[var(--radius-xl)] p-8">
 <div className="flex items-center justify-between mb-6">
 <h3 className="text-lg font-medium">Saved Questions ({savedQuestions.length})</h3>
 <button
 onClick={() => setActiveTab(activeTab === 'saved' ? 'generate' : 'saved')}
 className="flex items-center gap-2 px-4 py-3 bg-[var(--accent)] hover:bg-purple-700 text-white rounded-xl text-xs font-medium transition-all"
 >
 <Eye className="w-4 h-4" />
 {activeTab === 'saved' ? 'Hide' : 'View'} Saved Questions
 </button>
 </div>

 {activeTab === 'saved' && (
 <div className="space-y-4">
 {savedQuestions.map((q) => (
 <div key={q.QuestionID} className="glass-card rounded-[var(--radius-xl)] p-6">
 <div className="flex items-start justify-between">
 <div className="flex items-start gap-4">
 <div className="p-3 bg-[var(--bg-accent)] rounded-xl text-[var(--accent)]">
 <MessageSquare size={20} />
 </div>
 <div>
 <div className="flex items-center gap-3 mb-2">
 <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium ${getQuestionTypeBg(q.QuestionType)}`}>
 {q.QuestionType}
 </span>
 <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium bg-[var(--bg-accent)] border border-[var(--border-primary)]">
 Used: {q.UsedCount} times
 </span>
 {q.SuccessRate && (
 <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium bg-[var(--success)]/10 text-[var(--success)] border border-green-500/20">
 Success Rate: {q.SuccessRate}%
 </span>
 )}
 </div>
 <p className="text-sm font-semibold text-[var(--text-primary)] mb-3">{q.QuestionText}</p>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-[var(--text-muted)]">
 <div>
 <span className="font-medium">Difficulty:</span> {q.DifficultyLevel}/10
 </div>
 {q.ExpectedAnswerKeywords && (
 <div>
 <span className="font-medium">Expected Keywords:</span> {JSON.parse(q.ExpectedAnswerKeywords).join(', ')}
 </div>
 )}
 {q.ScoringRubric && (
 <div className="md:col-span-2">
 <span className="font-medium">Scoring:</span> {q.ScoringRubric}
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 )}

 {/* Empty State */}
 {savedQuestions.length === 0 && questions.length === 0 && (
 <div className="glass-card rounded-[var(--radius-xl)] p-8 text-center">
 <MessageSquare className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4 opacity-50" />
 <p className="text-[var(--text-muted)]">No questions generated yet. Configure your settings above and generate your first AI-powered interview questions!</p>
 <p className="text-xs text-[var(--text-muted)] mt-1">Save your favorite questions to build a personalized question library.</p>
 </div>
 )}
 </div>
 );
};

export default InterviewQuestionsGenerator;