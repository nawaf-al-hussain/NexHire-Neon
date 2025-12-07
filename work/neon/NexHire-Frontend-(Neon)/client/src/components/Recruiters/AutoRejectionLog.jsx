import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE from '../../apiConfig';
import { useToast } from '../../components/ui/Toast';
import { useConfirm } from '../../components/ui/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import {
 ShieldAlert, RefreshCw, Search, AlertTriangle,
 User, Briefcase, Calendar, CheckCircle, XCircle, ArrowLeft
} from 'lucide-react';

const AutoRejectionLog = ({ onGoBack }) => {
    const { toast } = useToast();
    const { confirm } = useConfirm();
 const { user } = useAuth();
 const [autoRejected, setAutoRejected] = useState([]);
 const [loading, setLoading] = useState(true);
 const [running, setRunning] = useState(false);
 const [searchTerm, setSearchTerm] = useState('');

 useEffect(() => {
 fetchAutoRejected();
 }, []);

 const fetchAutoRejected = async () => {
 setLoading(true);
 try {
 const res = await axios.get(`${API_BASE}/applications/auto-rejected`);
 setAutoRejected(res.data);
 } catch (err) {
 console.error("Fetch auto-rejected error:", err);
 } finally {
 setLoading(false);
 }
 };

 const runAutoReject = async () => {
 if (!await confirm("Run auto-reject batch? This will reject all candidates who don't meet minimum experience requirements.")) {
 return;
 }

 setRunning(true);
 try {
 await axios.post(`${API_BASE}/applications/auto-reject`);
 toast("Screening batch completed.");
 fetchAutoRejected();
 } catch (err) {
 console.error("Run auto-reject error:", err);
 toast("Failed to run auto-reject: " + (err.response?.data?.error || err.message));
 } finally {
 setRunning(false);
 }
 };

 const filteredData = autoRejected.filter(item =>
 item.CandidateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
 item.JobTitle?.toLowerCase().includes(searchTerm.toLowerCase())
 );

 const stats = {
 total: autoRejected.length,
 thisMonth: autoRejected.filter(item => {
 const appliedDate = new Date(item.AppliedDate);
 const now = new Date();
 return appliedDate.getMonth() === now.getMonth() &&
 appliedDate.getFullYear() === now.getFullYear();
 }).length
 };

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

 {/* Header Card */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8 border border-[var(--danger)]/20">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-4">
 <div className="w-14 h-14 rounded-2xl bg-[var(--danger)]/10 flex items-center justify-center text-[var(--danger)]">
 <ShieldAlert size={28} />
 </div>
 <div>
 <h2 className="text-lg sm:text-xl font-medium">Experience-Based Screening</h2>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">
 Automatic screening based on experience requirements
 </p>
 </div>
 </div>
 <button
 onClick={runAutoReject}
 disabled={running}
 className="px-6 py-3 bg-[var(--danger)] text-white rounded-2xl font-semibold text-xs hover:bg-[var(--danger)] transition-all disabled:opacity-50 flex items-center gap-2"
 >
 {running ? (
 <>
 <RefreshCw size={16} className="animate-spin" />
 Running...
 </>
 ) : (
 <>
 <AlertTriangle size={16} />
 Run Batch Now
 </>
 )}
 </button>
 </div>
 </div>

 {/* Stats Cards */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-[var(--danger)]/20">
 <div className="flex items-center gap-3 mb-2">
 <XCircle size={18} className="text-[var(--danger)]" />
 <span className="text-[11px] font-medium text-[var(--danger)]">Total Auto-Rejected</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">{stats.total}</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Candidates filtered out</p>
 </div>
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-orange-500/20">
 <div className="flex items-center gap-3 mb-2">
 <Calendar size={18} className="text-[var(--warning)]" />
 <span className="text-[11px] font-medium text-[var(--warning)]">This Month</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">{stats.thisMonth}</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Auto-rejected applications</p>
 </div>
 </div>

 {/* Search and Table */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8">
 <div className="flex items-center justify-between mb-6">
 <div className="flex items-center gap-3">
 <Search className="w-5 h-5 text-[var(--accent)]" />
 <h3 className="text-sm font-medium">Auto-Rejected Applications</h3>
 </div>
 <input
 type="text"
 placeholder="Search by candidate or job..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-xl px-4 py-2 text-xs font-bold focus:outline-none focus:border-[var(--accent)] w-64"
 />
 </div>

 {loading ? (
 <div className="flex items-center justify-center py-20">
 <RefreshCw className="w-8 h-8 text-[var(--accent)] animate-spin" />
 <span className="ml-3 text-sm font-medium text-[var(--text-muted)]">Loading...</span>
 </div>
 ) : filteredData.length === 0 ? (
 <div className="p-12 border-2 border-dashed border-[var(--border-primary)] rounded-[var(--radius-xl)] text-center bg-[var(--bg-accent)]/5">
 <CheckCircle className="w-16 h-16 text-[var(--success)] mx-auto mb-6 opacity-50" />
 <p className="text-xs font-semibold text-[var(--text-muted)] mb-4">
 No auto-rejected applications
 </p>
 <p className="text-[11px] text-[var(--text-muted)] opacity-60">
 Candidates who don't meet experience requirements will appear here
 </p>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="text-[11px] font-medium text-[var(--text-muted)] border-b border-[var(--border-primary)]">
 <th scope="col" className="text-left pb-4 pr-4">Candidate</th>
 <th scope="col" className="text-left pb-4 pr-4">Job Title</th>
 <th scope="col" className="text-left pb-4 pr-4">Experience</th>
 <th scope="col" className="text-left pb-4 pr-4">Required</th>
 <th scope="col" className="text-left pb-4">Applied Date</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-[var(--border-primary)]">
 {filteredData.map((item, idx) => (
 <tr key={idx} className="group hover:bg-[var(--bg-accent)] transition-colors">
 <td className="py-4 pr-4">
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-xl bg-[var(--danger)]/10 flex items-center justify-center">
 <User size={14} className="text-[var(--danger)]" />
 </div>
 <span className="text-sm font-semibold">{item.CandidateName}</span>
 </div>
 </td>
 <td className="py-4 pr-4">
 <div className="flex items-center gap-3">
 <Briefcase size={14} className="text-[var(--text-muted)]" />
 <span className="text-xs font-bold text-[var(--text-secondary)]">{item.JobTitle}</span>
 </div>
 </td>
 <td className="py-4 pr-4">
 <span className="text-xs font-semibold text-[var(--danger)]">{item.CandidateExperience} yrs</span>
 </td>
 <td className="py-4 pr-4">
 <span className="text-xs font-bold text-[var(--text-muted)]">{item.RequiredExperience} yrs</span>
 </td>
 <td className="py-4">
 <span className="text-[11px] font-bold text-[var(--text-muted)]">
 {new Date(item.AppliedDate).toLocaleDateString()}
 </span>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </div>
 </div>
 );
};

export default AutoRejectionLog;
