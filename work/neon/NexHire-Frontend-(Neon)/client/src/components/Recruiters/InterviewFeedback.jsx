import React, { useState, useEffect } from 'react';
import { Star, Send, X, User, Briefcase, MessageSquare, TrendingUp, AlertCircle } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../../apiConfig';

const InterviewFeedback = ({ applicationId, candidateName, jobTitle, onClose, onSubmitSuccess }) => {
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState(null);
 const [existingFeedback, setExistingFeedback] = useState(null);
 const [scores, setScores] = useState({
 technical: 5,
 communication: 5,
 cultureFit: 5
 });
 const [comments, setComments] = useState('');

 useEffect(() => {
 if (applicationId) {
 fetchExistingFeedback();
 }
 }, [applicationId]);

 const fetchExistingFeedback = async () => {
 try {
 const res = await axios.get(`${API_BASE}/interviews/feedback/${applicationId}`);
 if (res.data && res.data.length > 0) {
 setExistingFeedback(res.data);
 // Pre-fill with latest feedback if available
 const latest = res.data[0];
 setScores({
 technical: latest.TechnicalScore,
 communication: latest.CommunicationScore,
 cultureFit: latest.CultureFitScore
 });
 setComments(latest.Comments || '');
 }
 } catch (err) {
 console.error("Fetch feedback error:", err);
 }
 };

 const handleScoreChange = (category, value) => {
 setScores(prev => ({
 ...prev,
 [category]: value
 }));
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 setLoading(true);
 setError(null);

 try {
 const res = await axios.post(`${API_BASE}/interviews/feedback`, {
 applicationId,
 technicalScore: scores.technical,
 communicationScore: scores.communication,
 cultureFitScore: scores.cultureFit,
 comments
 });

 if (res.data.success) {
 if (onSubmitSuccess) onSubmitSuccess(res.data.feedbackId);
 if (onClose) onClose();
 }
 } catch (err) {
 setError(err.response?.data?.error || 'Failed to submit feedback. Please try again.');
 } finally {
 setLoading(false);
 }
 };

 const ScoreSlider = ({ label, category, value, color }) => (
 <div className="mb-6">
 <div className="flex justify-between items-center mb-3">
 <span className="text-xs font-medium text-[var(--text-secondary)]">
 {label}
 </span>
 <span className={`text-lg font-semibold ${color}`}>{value}/10</span>
 </div>
 <input
 type="range"
 min="1"
 max="10"
 value={value}
 onChange={(e) => handleScoreChange(category, parseInt(e.target.value))}
 className="w-full h-2 bg-[var(--bg-accent)] rounded-lg appearance-none cursor-pointer accent-purple-500"
 />
 <div className="flex justify-between mt-1">
 <span className="text-[11px] font-bold text-[var(--text-muted)]">Poor</span>
 <span className="text-[11px] font-bold text-[var(--text-muted)]">Excellent</span>
 </div>
 </div>
 );

 return (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300">
 <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

 <div className="relative bg-[var(--bg-primary)] border border-[var(--border-primary)] w-full max-w-lg max-h-[90vh] overflow-hidden rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] flex flex-col text-[var(--text-primary)]">
 {/* Header */}
 <div className="p-8 border-b border-[var(--border-primary)] flex items-center justify-between bg-[var(--bg-accent)]/20">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)]">
 <MessageSquare size={24} />
 </div>
 <div>
 <h2 className="text-lg sm:text-xl font-medium">Interview Feedback</h2>
 <p className="text-[11px] font-semibold text-[var(--text-muted)] mt-1 italic">{candidateName} • {jobTitle}</p>
 </div>
 </div>
 {onClose && (
 <button onClick={onClose} className="w-10 h-10 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
 <X size={20} />
 </button>
 )}
 </div>

 {/* Content */}
 <div className="p-8 overflow-y-auto">
 <div className="flex justify-between items-start mb-6">
 <div>
 <h2 className="text-lg sm:text-xl font-medium">Interview Feedback</h2>
 <div className="flex items-center gap-2 mt-2 text-[11px] font-bold text-[var(--text-muted)]">
 <User size={12} />
 <span>{candidateName || 'Candidate'}</span>
 <span className="text-[var(--accent)]">•</span>
 <Briefcase size={12} />
 <span>{jobTitle || 'Position'}</span>
 </div>
 </div>
 {onClose && (
 <button
 onClick={onClose}
 className="p-2 rounded-full hover:bg-[var(--bg-accent)] transition-colors"
 >
 <X size={20} />
 </button>
 )}
 </div>

 {/* Existing Feedback Summary */}
 {existingFeedback && existingFeedback.averageScores && (
 <div className="mb-6 p-4 bg-[var(--accent)]/10 rounded-2xl border border-[var(--accent)]/20">
 <div className="flex items-center gap-2 mb-3">
 <TrendingUp size={16} className="text-[var(--accent)]" />
 <span className="text-xs font-medium text-[var(--accent)]">Current Average</span>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-center">
 <div>
 <div className="text-lg font-semibold text-[var(--accent)]">{existingFeedback.averageScores.technical}</div>
 <div className="text-[11px] font-bold text-[var(--text-muted)]">TECHNICAL</div>
 </div>
 <div>
 <div className="text-lg font-semibold text-[var(--accent)]">{existingFeedback.averageScores.communication}</div>
 <div className="text-[11px] font-bold text-[var(--text-muted)]">COMM</div>
 </div>
 <div>
 <div className="text-lg font-semibold text-[var(--accent)]">{existingFeedback.averageScores.cultureFit}</div>
 <div className="text-[11px] font-bold text-[var(--text-muted)]">CULTURE</div>
 </div>
 <div>
 <div className="text-lg font-semibold text-[var(--accent)]">{existingFeedback.averageScores.overall}</div>
 <div className="text-[11px] font-bold text-[var(--text-muted)]">OVERALL</div>
 </div>
 </div>
 </div>
 )}

 {/* Error Message */}
 {error && (
 <div className="mb-4 p-3 bg-[var(--danger)]/10 rounded-xl border border-[var(--danger)]/20 flex items-center gap-2">
 <AlertCircle size={16} className="text-[var(--danger)]" />
 <span className="text-xs font-bold text-[var(--danger)]">{error}</span>
 </div>
 )}

 {/* Score Sliders */}
 <form onSubmit={handleSubmit}>
 <div className="mb-6">
 <h3 className="text-xs font-medium mb-4 text-[var(--text-muted)]">
 Score Categories
 </h3>

 <ScoreSlider
 label="Technical Skills"
 category="technical"
 value={scores.technical}
 color="text-[var(--accent)]"
 />
 <ScoreSlider
 label="Communication"
 category="communication"
 value={scores.communication}
 color="text-[var(--success)]"
 />
 <ScoreSlider
 label="Culture Fit"
 category="cultureFit"
 value={scores.cultureFit}
 color="text-[var(--accent)]"
 />
 </div>

 {/* Overall Score Display */}
 <div className="mb-6 p-4 bg-[var(--bg-accent)] rounded-2xl border border-[var(--border-primary)]">
 <div className="flex justify-between items-center">
 <span className="text-xs font-medium text-[var(--text-muted)]">
 Overall Score
 </span>
 <div className="flex items-center gap-1">
 {[1, 2, 3, 4, 5].map((star) => (
 <Star
 key={star}
 size={20}
 className={star <= Math.round((scores.technical + scores.communication + scores.cultureFit) / 3)
 ? 'fill-yellow-400 text-yellow-400'
 : 'text-[var(--text-muted)]'}
 />
 ))}
 <span className="ml-2 text-lg font-semibold text-[var(--text-primary)]">
 {((scores.technical + scores.communication + scores.cultureFit) / 3).toFixed(1)}
 </span>
 </div>
 </div>
 </div>

 {/* Comments */}
 <div className="mb-6">
 <label className="flex items-center gap-2 text-xs font-medium text-[var(--text-muted)] mb-3">
 <MessageSquare size={14} />
 Additional Comments
 </label>
 <textarea
 value={comments}
 onChange={(e) => setComments(e.target.value)}
 placeholder="Enter interviewer comments, strengths, areas for improvement..."
 className="w-full h-32 p-4 bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl text-sm focus:outline-none focus:border-purple-500 resize-none"
 />
 </div>

 {/* Submit Button */}
 <button
 type="submit"
 disabled={loading}
 className="w-full py-4 bg-[var(--accent)] text-white rounded-2xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
 >
 {loading ? (
 'Submitting...'
 ) : (
 <>
 <Send size={16} />
 Submit Feedback
 </>
 )}
 </button>
 </form>
 </div>
 </div>
 </div>
 );
};

export default InterviewFeedback;
