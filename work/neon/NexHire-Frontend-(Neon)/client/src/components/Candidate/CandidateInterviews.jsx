import React from 'react';
import { Calendar, Clock, MapPin, User, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../../apiConfig';
import { useToast } from '../../components/ui/Toast';

const CandidateInterviews = ({ interviews, loading, onConfirm }) => {
    const { toast } = useToast();
 if (loading) {
 return (
 <div className="flex flex-col items-center justify-center py-20 opacity-50">
 <div className="w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin mb-4"></div>
 <p className="text-[11px] font-semibold text-[var(--text-muted)]">Loading…</p>
 </div>
 );
 }

 if (interviews.length === 0) {
 return (
 <div className="p-12 border-2 border-dashed border-[var(--border-primary)] rounded-[var(--radius-xl)] text-center bg-[var(--bg-accent)]/5">
 <p className="text-xs font-semibold text-[var(--text-muted)] ">No interviews scheduled yet.</p>
 </div>
 );
 }

 const handleConfirm = async (scheduleID) => {
 try {
 await axios.post(`${API_BASE}/candidates/confirm-interview`, { scheduleID });
 if (onConfirm) onConfirm();
 } catch (err) {
 console.error("Confirm Interview Error:", err);
 toast("Failed to confirm interview.");
 }
 };

 return (
 <div className="space-y-6">
 <div className="flex items-center gap-3 mb-8">
 <Calendar className="w-5 h-5 text-[var(--accent)]" />
 <h2 className="text-lg font-medium">Upcoming Interviews</h2>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
 {interviews.map((interview) => (
 <div key={interview.ScheduleID} className="group bg-[var(--bg-accent)] p-8 rounded-[var(--radius-xl)] border border-[var(--border-primary)] hover:border-[var(--accent)] transition-all relative overflow-hidden">
 <div className="flex items-start justify-between mb-6">
 <div className="p-4 bg-[var(--accent)]/10 rounded-2xl border border-[var(--accent)]">
 <Calendar className="w-6 h-6 text-[var(--accent)]" />
 </div>
 <div className={`px-3 py-1 rounded-lg text-[11px] font-medium ${interview.CandidateConfirmed ? 'bg-[var(--success)]/10 text-[var(--success)] border border-emerald-500/20' : 'bg-[var(--warning)]/10 text-[var(--warning)] border border-amber-500/20'}`}>
 {interview.CandidateConfirmed ? 'Confirmed' : 'Action Required'}
 </div>
 </div>

 <h4 className="text-lg sm:text-xl font-semibold mb-1 leading-tight">{interview.JobTitle}</h4>
 <p className="text-[11px] font-bold text-[var(--accent)] mb-6">Round: Technical Assessment</p>

 <div className="space-y-3 mb-8">
 <div className="flex items-center gap-3 text-[var(--text-secondary)]">
 <Clock size={14} className="text-[var(--accent)]" />
 <span className="text-xs font-bold">{new Date(interview.InterviewStart).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
 </div>
 <div className="flex items-center gap-3 text-[var(--text-secondary)]">
 <MapPin size={14} className="text-[var(--accent)]" />
 <span className="text-xs font-bold">{interview.JobLocation} (Remote)</span>
 </div>
 <div className="flex items-center gap-3 text-[var(--text-secondary)]">
 <User size={14} className="text-[var(--accent)]" />
 <span className="text-xs font-bold">Interviewer: {interview.RecruiterName}</span>
 </div>
 </div>

 {interview.CandidateConfirmed ? (
 <button className="w-full py-4 bg-[var(--accent-soft)] text-[var(--accent)] rounded-2xl font-semibold text-[11px] flex items-center justify-center gap-2 hover:bg-[var(--accent)]/20 transition-all">
 <ExternalLink size={14} /> Join Meeting
 </button>
 ) : (
 <button
 onClick={() => handleConfirm(interview.ScheduleID)}
 className="w-full py-4 bg-[var(--accent)] text-white rounded-2xl font-semibold text-[11px] shadow-lg shadow-[var(--shadow-md)] hover:bg-[var(--accent-hover)] transition-all"
 >
 Confirm Attendance
 </button>
 )}
 </div>
 ))}
 </div>
 </div>
 );
};

export default CandidateInterviews;
