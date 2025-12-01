import React, { useState } from 'react';
import axios from 'axios';
import { Calendar, Clock, X, Loader2 } from 'lucide-react';
import API_BASE from '../../apiConfig';

const ScheduleInterviewModal = ({ isOpen, onClose, application, onScheduled }) => {
 const [date, setDate] = useState('');
 const [time, setTime] = useState('');
 const [duration, setDuration] = useState('60'); // Minutes
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');

 if (!isOpen || !application) return null;

 const handleSubmit = async (e) => {
 e.preventDefault();
 setError('');

 if (!date || !time) {
 setError("Date and time are required.");
 return;
 }

 setLoading(true);

 try {
 // Combine date and time
 const startDateTime = new Date(`${date}T${time}`);
 const endDateTime = new Date(startDateTime.getTime() + parseInt(duration) * 60000);

 await axios.post(`${API_BASE}/interviews/schedule`, {
 applicationId: application.ApplicationID,
 interviewStart: startDateTime.toISOString(),
 interviewEnd: endDateTime.toISOString()
 });

 onScheduled();
 onClose();
 } catch (err) {
 console.error("Schedule Error:", err);
 setError(err.response?.data?.error || "Failed to schedule interview.");
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
 <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

 <div className="relative bg-[var(--bg-secondary)] border border-[var(--border-primary)] w-full max-w-md rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] p-8 isolate overflow-hidden animate-in zoom-in duration-300">
 <div className="flex items-center justify-between mb-8">
 <h2 className="text-lg sm:text-xl font-medium flex items-center gap-3">
 <Calendar className="text-[var(--warning)]" size={24} />
 Schedule Interview
 </h2>
 <button onClick={onClose} className="p-2 text-[var(--text-muted)] hover:text-[var(--danger)] bg-[var(--bg-accent)] rounded-xl transition-colors">
 <X size={20} />
 </button>
 </div>

 <div className="mb-6 p-4 bg-[var(--bg-accent)] rounded-2xl border border-[var(--border-primary)]/50">
 <p className="text-[11px] uppercase font-semibold tracking-[0.15em] text-[var(--text-muted)] mt-1">Candidate Pipeline</p>
 <h3 className="text-sm font-bold mt-1">{application.FullName}</h3>
 <p className="text-xs opacity-60 mt-1">{application.CandidateLocation}</p>
 </div>

 {error && (
 <div className="mb-6 p-4 bg-[var(--danger)]/10 border border-rose-500/30 text-[var(--danger)] text-xs font-bold rounded-xl text-center">
 {error}
 </div>
 )}

 <form onSubmit={handleSubmit} className="space-y-6">
 <div className="space-y-4">
 <div>
 <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-2">Interview Date</label>
 <input
 type="date"
 value={date}
 onChange={(e) => setDate(e.target.value)}
 className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-sm focus:border-[var(--accent)] outline-none transition-colors"
 required
 />
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-2">Start Time</label>
 <input
 type="time"
 value={time}
 onChange={(e) => setTime(e.target.value)}
 className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-sm focus:border-[var(--accent)] outline-none transition-colors"
 required
 />
 </div>
 <div>
 <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-2">Duration</label>
 <select
 value={duration}
 onChange={(e) => setDuration(e.target.value)}
 className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-sm focus:border-[var(--accent)] outline-none transition-colors appearance-none"
 >
 <option value="30">30 Minutes</option>
 <option value="45">45 Minutes</option>
 <option value="60">1 Hour</option>
 <option value="90">1.5 Hours</option>
 </select>
 </div>
 </div>
 </div>

 <button
 type="submit"
 disabled={loading}
 className="w-full py-4 rounded-xl bg-[var(--warning)] text-white font-semibold text-xs hover:bg-amber-400 transition-all shadow-lg flex justify-center items-center gap-2 group disabled:opacity-50"
 >
 {loading ? <Loader2 className="animate-spin" size={16} /> : <><Clock size={16} /> Confirm Timeslot</>}
 </button>
 </form>
 </div>
 </div>
 );
};

export default ScheduleInterviewModal;
