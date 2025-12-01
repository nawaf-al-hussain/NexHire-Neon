import React from 'react';
import { Bot, Play, CheckCircle, XCircle, HelpCircle, AlertTriangle, Search, ArrowRight, UserPlus, Trash2, CheckSquare, Square, Briefcase, Loader2, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../../apiConfig';
import { useToast } from '../../components/ui/Toast';

const ScreeningBot = ({ loading, onRefresh, onGoBack }) => {
    const { toast } = useToast();
 const [decisions, setDecisions] = React.useState([]);
 const [jobs, setJobs] = React.useState([]);
 const [selectedJob, setSelectedJob] = React.useState('');
 const [threshold, setThreshold] = React.useState(70);
 const [loadingData, setLoadingData] = React.useState(true);
 const [running, setRunning] = React.useState(false);
 const [overrideModal, setOverrideModal] = React.useState(null);
 const [selectedCandidates, setSelectedCandidates] = React.useState([]);
 const [rejectModal, setRejectModal] = React.useState(null);
 const [advancing, setAdvancing] = React.useState(false);
 const [rejecting, setRejecting] = React.useState(false);

 React.useEffect(() => {
 fetchJobs();
 fetchDecisions();
 }, []);

 const fetchJobs = async () => {
 try {
 const res = await axios.get(`${API_BASE}/jobs`);
 setJobs(res.data);
 } catch (err) {
 console.error("Fetch Jobs Error:", err);
 }
 };

 const fetchDecisions = async () => {
 try {
 setLoadingData(true);
 const res = await axios.get(`${API_BASE}/recruiters/screening/decisions${selectedJob ? `?jobID=${selectedJob}` : ''}`);
 setDecisions(res.data);
 } catch (err) {
 console.error("Fetch Decisions Error:", err);
 } finally {
 setLoadingData(false);
 }
 };

 const handleRunScreening = async () => {
 if (!selectedJob) {
 toast("Please select a job first.");
 return;
 }
 try {
 setRunning(true);
 await axios.post(`${API_BASE}/recruiters/screening/run`, { jobID: parseInt(selectedJob), threshold });
 await fetchDecisions();
 toast("Screening completed.");
 } catch (err) {
 console.error("Run Screening Error:", err);
 toast("Screening failed: " + (err.response?.data?.error || err.message));
 } finally {
 setRunning(false);
 }
 };

 const handleOverride = async (decisionID, finalDecision) => {
 try {
 await axios.post(`${API_BASE}/recruiters/screening/override`, {
 decisionID,
 finalDecision,
 overrideReason: overrideModal?.reason || ''
 });
 setOverrideModal(null);
 fetchDecisions();
 } catch (err) {
 console.error("Override Error:", err);
 toast("Failed to override decision.");
 }
 };

 const getDecisionIcon = (decision) => {
 switch (decision) {
 case 'Pass': return <CheckCircle size={18} className="text-[var(--success)]" />;
 case 'Fail': return <XCircle size={18} className="text-[var(--danger)]" />;
 case 'Maybe':
 case 'ManualReview': return <HelpCircle size={18} className="text-[var(--warning)]" />;
 default: return <AlertTriangle size={18} className="text-[var(--text-muted)]" />;
 }
 };

 const getDecisionBadge = (decision) => {
 switch (decision) {
 case 'Pass': return 'bg-[var(--success)]/10 text-[var(--success)] border border-emerald-500/20';
 case 'Fail': return 'bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/20';
 case 'Maybe': return 'bg-[var(--warning)]/10 text-[var(--warning)] border border-amber-500/20';
 case 'ManualReview': return 'bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20';
 default: return 'bg-gray-500/10 text-[var(--text-muted)] border border-gray-500/20';
 }
 };

 const toggleSelection = (applicationID) => {
 setSelectedCandidates(prev =>
 prev.includes(applicationID)
 ? prev.filter(id => id !== applicationID)
 : [...prev, applicationID]
 );
 };

 const handleAdvance = async (targetStage) => {
 if (selectedCandidates.length === 0) {
 toast("Please select candidates to advance.");
 return;
 }
 try {
 setAdvancing(true);
 const res = await axios.post(`${API_BASE}/recruiters/screening/advance`, {
 applicationIDs: selectedCandidates,
 targetStage
 });
 toast(res.data.message);
 setSelectedCandidates([]);
 fetchDecisions();
 } catch (err) {
 console.error("Advance Error:", err);
 toast("Failed to advance: " + (err.response?.data?.error || err.message));
 } finally {
 setAdvancing(false);
 }
 };

 const handleReject = async () => {
 if (selectedCandidates.length === 0) {
 toast("Please select candidates to reject.");
 return;
 }
 try {
 setRejecting(true);
 const res = await axios.post(`${API_BASE}/recruiters/screening/reject`, {
 applicationIDs: selectedCandidates,
 reason: rejectModal?.reason || 'Rejected from Screening Bot'
 });
 toast(res.data.message);
 setRejectModal(null);
 setSelectedCandidates([]);
 fetchDecisions();
 } catch (err) {
 console.error("Reject Error:", err);
 toast("Failed to reject: " + (err.response?.data?.error || err.message));
 } finally {
 setRejecting(false);
 }
 };

 const passedCount = decisions.filter(d => d.Decision === 'Pass').length;
 const failedCount = decisions.filter(d => d.Decision === 'Fail').length;

 return (
 <div className="space-y-5 sm:space-y-8">
 {/* Back Button */}
 {onGoBack && (
 <button
 onClick={onGoBack}
 className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
 >
 <ArrowLeft size={18} />
 <span className="text-sm font-bold">Back to Job Roles</span>
 </button>
 )}

 {/* Gradient Header */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8 border border-[var(--accent)]">
 <div className="flex items-center gap-4">
 <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
 <Bot size={28} />
 </div>
 <div>
 <h2 className="text-lg sm:text-xl font-medium">Screening Bot</h2>
 <p className="text-[11px] font-medium text-[var(--text-muted)]">Automate candidate screening with AI</p>
 </div>
 </div>
 </div>

 {/* Controls */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8">
 <div className="flex items-center justify-between mb-6">
 <div className="flex items-center gap-3">
 <Bot className="w-5 h-5 text-[var(--accent)]" />
 <h3 className="text-sm font-medium">Automated Screening Bot</h3>
 </div>
 </div>

 <div className="flex flex-wrap gap-4 items-end">
 <div className="flex-1 min-w-[200px]">
 <label className="text-[11px] font-medium text-[var(--text-muted)] block mb-2">Select Job</label>
 <select
 value={selectedJob}
 onChange={(e) => setSelectedJob(e.target.value)}
 className="w-full bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-[var(--accent)]"
 >
 <option value="">All Jobs</option>
 {jobs.map(job => (
 <option key={job.JobID} value={job.JobID}>{job.JobTitle}</option>
 ))}
 </select>
 </div>

 <div className="w-32">
 <label className="text-[11px] font-medium text-[var(--text-muted)] block mb-2">Threshold %</label>
 <input
 type="number"
 value={threshold}
 onChange={(e) => setThreshold(e.target.value)}
 min="0" max="100"
 className="w-full bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-[var(--accent)]"
 />
 </div>

 <button
 onClick={handleRunScreening}
 disabled={running || !selectedJob}
 className="px-8 py-4 bg-[var(--accent)] text-white rounded-2xl font-semibold text-xs hover:bg-[var(--accent-hover)] transition-all disabled:opacity-50 flex items-center gap-2"
 >
 <Play size={16} />
 {running ? 'Running...' : 'Run Screening'}
 </button>

 <button
 onClick={fetchDecisions}
 className="w-12 h-12 rounded-2xl bg-[var(--bg-accent)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all"
 >
 <Search size={18} />
 </button>
 </div>
 </div>

 {/* Results Summary */}
 <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-[var(--accent)]">
 <div className="flex items-center gap-3 mb-2">
 <Bot size={18} className="text-[var(--accent)]" />
 <span className="text-[11px] font-medium text-[var(--accent)]">Total Screened</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">{decisions.length}</div>
 </div>
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-emerald-500/20">
 <div className="flex items-center gap-3 mb-2">
 <Bot size={18} className="text-[var(--success)]" />
 <span className="text-[11px] font-medium text-[var(--success)]">Passed</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold text-[var(--success)]">{decisions.filter(d => d.Decision === 'Pass').length}</div>
 </div>
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-[var(--danger)]/20">
 <div className="flex items-center gap-3 mb-2">
 <Bot size={18} className="text-[var(--danger)]" />
 <span className="text-[11px] font-medium text-[var(--danger)]">Failed</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold text-[var(--danger)]">{decisions.filter(d => d.Decision === 'Fail').length}</div>
 </div>
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-amber-500/20">
 <div className="flex items-center gap-3 mb-2">
 <Bot size={18} className="text-[var(--warning)]" />
 <span className="text-[11px] font-medium text-[var(--warning)]">Review Needed</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold text-[var(--warning)]">{decisions.filter(d => d.Decision === 'Maybe' || d.Decision === 'ManualReview').length}</div>
 </div>
 </div>

 {/* Decisions Table */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8">
 <h3 className="text-lg font-medium mb-6">Screening Decisions</h3>
 {decisions.length > 0 && (
 <div className="flex flex-wrap gap-3 mb-6">
 <button
 onClick={() => handleAdvance('Screening')}
 disabled={advancing || selectedCandidates.length === 0}
 className="px-4 py-2 bg-[var(--success)] text-white rounded-2xl font-semibold text-xs hover:bg-[var(--success)] transition-all disabled:opacity-50 flex items-center gap-2"
 >
 <ArrowRight size={16} />
 {advancing ? 'Advancing...' : `Advance to Screening (${selectedCandidates.length})`}
 </button>
 <button
 onClick={() => handleAdvance('Interview')}
 disabled={advancing || selectedCandidates.length === 0}
 className="px-4 py-2 bg-[var(--accent)] text-white rounded-2xl font-semibold text-xs hover:bg-[var(--accent-hover)] transition-all disabled:opacity-50 flex items-center gap-2"
 >
 <UserPlus size={16} />
 {advancing ? 'Advancing...' : `Advance to Interview (${selectedCandidates.length})`}
 </button>
 <button
 onClick={() => setRejectModal({ reason: '' })}
 disabled={rejecting || selectedCandidates.length === 0}
 className="px-4 py-2 bg-[var(--danger)] text-white rounded-2xl font-semibold text-xs hover:bg-[var(--danger)] transition-all disabled:opacity-50 flex items-center gap-2"
 >
 <Trash2 size={16} />
 {rejecting ? 'Rejecting...' : `Reject (${selectedCandidates.length})`}
 </button>
 </div>
 )}

 {loadingData ? (
 <div className="flex flex-col items-center justify-center py-20">
 <Loader2 className="w-12 h-12 text-[var(--accent)] animate-spin mb-4" />
 <p className="text-[11px] font-semibold text-[var(--text-muted)]">Loading...</p>
 </div>
 ) : decisions.length === 0 ? (
 <div className="p-12 border-2 border-dashed border-[var(--border-primary)] rounded-[var(--radius-xl)] text-center bg-[var(--bg-accent)]/5">
 <Bot className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-6 opacity-20" />
 <p className="text-xs font-semibold text-[var(--text-muted)] mb-4">No data available.</p>
 <p className="text-[11px] text-[var(--text-muted)] opacity-60">Run screening for a job to see results</p>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="border-b border-[var(--border-primary)]">
 <th scope="col" className="text-left p-4 text-[11px] font-medium text-[var(--text-muted)]">
 <button
 onClick={() => {
 if (selectedCandidates.length === decisions.length) {
 setSelectedCandidates([]);
 } else {
 setSelectedCandidates(decisions.map(d => d.ApplicationID));
 }
 }}
 className="p-1 hover:bg-[var(--bg-primary)] rounded"
 >
 {selectedCandidates.length === decisions.length && decisions.length > 0 ? (
 <CheckSquare className="w-4 h-4 text-[var(--accent)]" />
 ) : (
 <Square className="w-4 h-4 text-[var(--text-muted)]" />
 )}
 </button>
 </th>
 <th scope="col" className="text-left p-4 text-[11px] font-medium text-[var(--text-muted)]">Candidate</th>
 <th scope="col" className="text-left p-4 text-[11px] font-medium text-[var(--text-muted)]">Job</th>
 <th scope="col" className="text-left p-4 text-[11px] font-medium text-[var(--text-muted)]">Decision</th>
 <th scope="col" className="text-left p-4 text-[11px] font-medium text-[var(--text-muted)]">Confidence</th>
 <th scope="col" className="text-left p-4 text-[11px] font-medium text-[var(--text-muted)]">Score</th>
 <th scope="col" className="text-left p-4 text-[11px] font-medium text-[var(--text-muted)]">Status</th>
 <th scope="col" className="text-left p-4 text-[11px] font-medium text-[var(--text-muted)]">Actions</th>
 </tr>
 </thead>
 <tbody>
 {decisions.map((d, idx) => (
 <tr key={idx} className="border-b border-[var(--border-primary)] hover:bg-[var(--bg-primary)]/50">
 <td className="p-4">
 <button
 onClick={() => toggleSelection(d.ApplicationID)}
 className="p-1 hover:bg-[var(--bg-primary)] rounded"
 >
 {selectedCandidates.includes(d.ApplicationID) ? (
 <CheckSquare className="w-4 h-4 text-[var(--accent)]" />
 ) : (
 <Square className="w-4 h-4 text-[var(--text-muted)]" />
 )}
 </button>
 </td>
 <td className="p-4">
 <p className="font-semibold">{d.FullName}</p>
 <p className="text-[11px] text-[var(--text-muted)]">ID: {d.CandidateID}</p>
 </td>
 <td className="p-4">
 <p className="text-sm font-bold">{d.JobTitle}</p>
 </td>
 <td className="p-4">
 <div className="flex items-center gap-2">
 {getDecisionIcon(d.Decision)}
 <span className={`px-3 py-1 rounded-lg text-[11px] font-semibold border ${getDecisionBadge(d.Decision)}`}>
 {d.Decision}
 </span>
 </div>
 </td>
 <td className="p-4">
 <div className="flex items-center gap-2">
 <div className="w-16 h-2 bg-[var(--bg-primary)] rounded-full overflow-hidden">
 <div
 className={`h-full ${d.Confidence >= 0.8 ? 'bg-[var(--success)]' : d.Confidence >= 0.5 ? 'bg-[var(--warning)]' : 'bg-[var(--danger)]'}`}
 style={{ width: `${(d.Confidence || 0) * 100}%` }}
 ></div>
 </div>
 <span className="text-xs font-semibold">{Math.round((d.Confidence || 0) * 100)}%</span>
 </div>
 </td>
 <td className="p-4">
 <span className="px-3 py-1 bg-[var(--bg-primary)] rounded-lg text-[11px] font-semibold">
 {d.Score || 0}
 </span>
 </td>
 <td className="p-4">
 <span className={`text-[11px] font-semibold ${d.HumanOverride ? 'text-[var(--warning)]' : 'text-[var(--text-muted)]'}`}>
 {d.HumanOverride ? 'Manual Override' : 'Automated'}
 </span>
 </td>
 <td className="p-4">
 <div className="flex gap-2">
 {(d.Decision === 'Fail' || d.Decision === 'Maybe') && !d.HumanOverride && (
 <>
 <button
 onClick={() => setOverrideModal({ id: d.DecisionID, reason: '', decision: 'Pass' })}
 className="px-2 py-1 bg-[var(--success)]/10 text-[var(--success)] rounded text-[11px] font-semibold hover:bg-[var(--success)]/20"
 >
 Pass
 </button>
 <button
 onClick={() => setOverrideModal({ id: d.DecisionID, reason: '', decision: 'Fail' })}
 className="px-2 py-1 bg-[var(--danger)]/10 text-[var(--danger)] rounded text-[11px] font-semibold hover:bg-[var(--danger)]/20"
 >
 Fail
 </button>
 </>
 )}
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </div>

 {/* Override Modal */}
 {
 overrideModal && (
 <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
 <div className="bg-[var(--bg-secondary)] rounded-[var(--radius-xl)] p-8 w-full max-w-md border border-[var(--border-primary)]">
 <h3 className="text-lg font-medium mb-2">Override Decision</h3>
 <p className="text-xs font-bold text-[var(--text-muted)] mb-6">
 Setting decision to: <span className="font-semibold text-[var(--accent)]">{overrideModal.decision}</span>
 </p>
 <textarea
 value={overrideModal.reason}
 onChange={(e) => setOverrideModal({ ...overrideModal, reason: e.target.value })}
 placeholder="Reason for override (optional)"
 className="w-full bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl px-6 py-4 text-sm font-bold mb-6 focus:outline-none focus:border-[var(--accent)]"
 rows={3}
 />
 <div className="flex gap-3">
 <button
 onClick={() => setOverrideModal(null)}
 className="flex-1 px-4 py-3 bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl font-semibold text-xs hover:bg-[var(--accent)]/10 transition-all"
 >
 Cancel
 </button>
 <button
 onClick={() => handleOverride(overrideModal.id, overrideModal.decision)}
 className="flex-1 px-4 py-3 bg-[var(--accent)] text-white rounded-2xl font-semibold text-xs hover:bg-[var(--accent-hover)] transition-all"
 >
 Confirm
 </button>
 </div>
 </div>
 </div>
 )
 }

 {/* Reject Modal */}
 {
 rejectModal && (
 <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
 <div className="bg-[var(--bg-secondary)] rounded-2xl p-6 w-full max-w-md border border-[var(--border-primary)]">
 <h3 className="text-lg font-semibold mb-4 text-[var(--danger)]">Reject Candidates</h3>
 <p className="text-sm text-[var(--text-muted)] mb-4">
 Rejecting {selectedCandidates.length} candidate(s). This action cannot be undone.
 </p>
 <textarea
 value={rejectModal.reason}
 onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
 placeholder="Reason for rejection (optional)"
 className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl text-sm mb-4"
 rows={3}
 />
 <div className="flex gap-3">
 <button
 onClick={() => setRejectModal(null)}
 className="flex-1 px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl font-semibold text-sm"
 >
 Cancel
 </button>
 <button
 onClick={handleReject}
 className="flex-1 px-4 py-3 bg-[var(--danger)] text-white rounded-xl font-semibold text-sm"
 >
 Confirm Reject
 </button>
 </div>
 </div>
 </div>
 )
 }
 </div >
 );
};

export default ScreeningBot;
