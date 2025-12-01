import React from 'react';
import { Video, Calendar, Clock, Play, FileText, CheckCircle, ExternalLink, MessageSquarePlus, RefreshCw } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../../apiConfig';
import InterviewFeedback from './InterviewFeedback';
import InterviewTranscription from './InterviewTranscription';

const VideoInterviews = () => {
 const [interviews, setInterviews] = React.useState([]);
 const [loading, setLoading] = React.useState(true);
 const [feedbackModal, setFeedbackModal] = React.useState(null);
 const [transcriptionModal, setTranscriptionModal] = React.useState(null);

 React.useEffect(() => {
 const fetchData = async () => {
 setLoading(true);
 try {
 const res = await axios.get(`${API_BASE}/interviews`);
 if (res.data && Array.isArray(res.data)) {
 setInterviews(res.data);
 }
 } catch (err) {
 console.error("Video Interviews Fetch Error:", err);
 } finally {
 setLoading(false);
 }
 };
 fetchData();
 }, []);

 // Sample data for demo purposes when no interviews exist
 // Use real data from API, fallback to sample data
 const displayData = interviews.length > 0 ? interviews : [];
 const upcoming = displayData.filter(i => i.Status === 'Upcoming' || i.Status === 'Scheduled');
 const completed = displayData.filter(i => i.Status === 'Completed');

 const getPlatformColor = (platform) => {
 if (platform === 'Zoom') return 'bg-[var(--accent)]/10 border-blue-500/30 text-[var(--accent)]';
 if (platform === 'Microsoft Teams') return 'bg-[var(--accent)]/10 border-purple-500/30 text-[var(--accent)]';
 if (platform === 'Google Meet') return 'bg-[var(--success)]/10 border-emerald-500/30 text-[var(--success)]';
 return 'bg-[var(--bg-tertiary)] border-slate-500/30 text-[var(--text-muted)]';
 };

 if (loading) {
 return (
 <div className="flex items-center justify-center py-20">
 <RefreshCw className="w-8 h-8 text-[var(--accent)] animate-spin" />
 <span className="ml-3 text-sm font-medium text-[var(--text-muted)]">Loading Video Interviews...</span>
 </div>
 );
 }

 return (
 <div className="space-y-6 sm:space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
 <div className="glass-card rounded-[var(--radius-xl)] p-8 border border-[var(--accent)]/20">
 <div className="flex items-center gap-4">
 <div className="w-14 h-14 rounded-2xl bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent)]">
 <Video size={28} />
 </div>
 <div>
 <h2 className="text-lg sm:text-xl font-medium">Video Interviews</h2>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Manage video interview scheduling</p>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-[var(--accent)]/20">
 <div className="flex items-center gap-3 mb-2">
 <Calendar size={18} className="text-[var(--accent)]" />
 <span className="text-[11px] font-medium text-[var(--accent)]">Upcoming</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">{upcoming.length}</div>
 </div>
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-emerald-500/20">
 <div className="flex items-center gap-3 mb-2">
 <CheckCircle size={18} className="text-[var(--success)]" />
 <span className="text-[11px] font-medium text-[var(--success)]">Completed</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">{completed.length}</div>
 </div>
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-[var(--accent)]/20">
 <div className="flex items-center gap-3 mb-2">
 <Clock size={18} className="text-[var(--accent)]" />
 <span className="text-[11px] font-medium text-[var(--accent)]">Total Hours</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">{displayData.reduce((sum, i) => sum + (i.Duration || 0), 0)}</div>
 </div>
 </div>

 {/* Upcoming Interviews Section */}
 {upcoming.length > 0 && (
 <div className="glass-card rounded-[var(--radius-xl)] p-10">
 <h3 className="text-lg font-medium mb-8">Upcoming Video Interviews</h3>
 <div className="space-y-4">
 {upcoming.map((interview, i) => (
 <div key={i} className="p-6 bg-[var(--bg-accent)] rounded-2xl border border-[var(--border-primary)] hover:border-violet-500/30 transition-all">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-6">
 <div className="w-12 h-12 rounded-2xl bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent)]">
 <Video size={20} />
 </div>
 <div>
 <h4 className="text-sm font-semibold">{interview.CandidateName}</h4>
 <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase">{interview.JobTitle}</p>
 <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold border mt-2 ${getPlatformColor(interview.Platform)}`}>
 {interview.Platform || 'Video Call'}
 </span>
 </div>
 </div>
 <div className="flex items-center gap-4">
 <div className="text-right">
 <div className="text-xs font-semibold">{interview.InterviewStart ? new Date(interview.InterviewStart).toLocaleDateString() : 'N/A'}</div>
 <div className="text-[11px] font-bold text-[var(--accent)]">{interview.InterviewStart ? new Date(interview.InterviewStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</div>
 </div>
 <button className="px-6 py-3 bg-violet-600 text-white rounded-xl text-[11px] font-semibold flex items-center gap-2 hover:bg-violet-500">
 <ExternalLink size={14} /> Join
 </button>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Past Interviews with Feedback Option */}
 <div className="glass-card rounded-[var(--radius-xl)] p-10">
 <h3 className="text-lg font-medium mb-8">Past Video Interviews</h3>
 <div className="space-y-4">
 {completed.map((interview, i) => (
 <div key={i} className="p-6 bg-[var(--bg-accent)] rounded-2xl border border-[var(--border-primary)] hover:border-emerald-500/30 transition-all">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-6">
 <div className="w-12 h-12 rounded-2xl bg-[var(--success)]/10 flex items-center justify-center text-[var(--success)]">
 <Video size={20} />
 </div>
 <div>
 <h4 className="text-sm font-semibold">{interview.CandidateName}</h4>
 <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase">{interview.JobTitle}</p>
 </div>
 </div>
 <div className="flex items-center gap-4">
 <div className="text-right">
 <div className="text-xs font-semibold">{interview.InterviewStart ? new Date(interview.InterviewStart).toLocaleDateString() : 'N/A'}</div>
 </div>
 {/* Feedback Button - only if ApplicationID is available */}
 {interview.ApplicationID && (
 <>
 <button
 onClick={() => setTranscriptionModal({
 scheduleId: interview.ScheduleID,
 candidateName: interview.CandidateName,
 jobTitle: interview.JobTitle
 })}
 className="px-6 py-3 bg-violet-600 text-white rounded-xl text-[11px] font-semibold flex items-center gap-2 hover:bg-violet-500"
 >
 <FileText size={14} /> Transcription
 </button>
 <button
 onClick={() => setFeedbackModal({
 applicationId: interview.ApplicationID,
 candidateName: interview.CandidateName,
 jobTitle: interview.JobTitle
 })}
 className="px-6 py-3 bg-[var(--accent)] text-white rounded-xl text-[11px] font-semibold flex items-center gap-2 hover:bg-[var(--accent-hover)]"
 >
 <MessageSquarePlus size={14} /> Feedback
 </button>
 </>
 )}
 </div>
 </div>
 </div>
 ))}
 {completed.length === 0 && <div className="text-center py-10 text-[11px] font-bold text-[var(--text-muted)]">No past video interviews</div>}
 </div>
 </div>

 {/* Feedback Modal */}
 {feedbackModal && (
 <InterviewFeedback
 applicationId={feedbackModal.applicationId}
 candidateName={feedbackModal.candidateName}
 jobTitle={feedbackModal.jobTitle}
 onClose={() => setFeedbackModal(null)}
 onSubmitSuccess={() => {
 // Optionally refresh data
 }}
 />
 )}

 {/* Transcription Modal */}
 {transcriptionModal && (
 <InterviewTranscription
 scheduleId={transcriptionModal.scheduleId}
 candidateName={transcriptionModal.candidateName}
 jobTitle={transcriptionModal.jobTitle}
 onClose={() => setTranscriptionModal(null)}
 />
 )}
 </div>
 );
};

export default VideoInterviews;
