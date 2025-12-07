import { useState, useEffect } from 'react';
import { Mail, RefreshCw, Trash2, Send, Filter, Loader2 } from 'lucide-react';
import API_BASE from '../../apiConfig';
import axios from 'axios';
import { useConfirm } from '../../components/ui/ConfirmDialog';

const EmailQueueManager = () => {
    const { confirm } = useConfirm();
 const [emails, setEmails] = useState([]);
 const [stats, setStats] = useState({ Total: 0, Sent: 0, Pending: 0 });
 const [loading, setLoading] = useState(true);
 const [filter, setFilter] = useState({ status: '', type: '' });
 const [sending, setSending] = useState(false);

 useEffect(() => {
 fetchEmails();
 }, [filter]);

 const fetchEmails = async () => {
 try {
 setLoading(true);
 const params = new URLSearchParams();
 if (filter.status) params.append('status', filter.status);
 if (filter.type) params.append('type', filter.type);
 params.append('limit', '50');

 const res = await axios.get(`${API_BASE}/maintenance/email-queue?${params}`);
 setEmails(res.data.emails || []);
 setStats(res.data.stats || { Total: 0, Sent: 0, Pending: 0 });
 } catch (err) {
 console.error('Fetch error:', err);
 } finally {
 setLoading(false);
 }
 };

 const handleRetry = async (id) => {
 try {
 await axios.put(`${API_BASE}/maintenance/email-queue/${id}/retry`);
 fetchEmails();
 } catch (err) {
 console.error('Retry error:', err);
 }
 };

 const handleDelete = async (id) => {
 if (!await confirm('Delete this email from queue?')) return;
 try {
 await axios.delete(`${API_BASE}/maintenance/email-queue/${id}`);
 fetchEmails();
 } catch (err) {
 console.error('Delete error:', err);
 }
 };

 const handleTestEmail = async () => {
 setSending(true);
 try {
 await axios.post(`${API_BASE}/maintenance/email-queue/send-test`, {
 candidateId: 1,
 emailType: 'Test',
 subject: 'Test Email from NexHire',
 body: 'This is a test email to verify the queue is working.'
 });
 fetchEmails();
 } catch (err) {
 console.error('Test email error:', err);
 } finally {
 setSending(false);
 }
 };

 const getStatusBadge = (isSent) => {
 if (isSent) {
 return <span className="px-3 py-1 rounded-full text-[11px] font-medium border bg-[var(--success)]/10 border-emerald-500/20 text-[var(--success)]">Sent</span>;
 }
 return <span className="px-3 py-1 rounded-full text-[11px] font-medium border bg-[var(--warning)]/10 border-amber-500/20 text-[var(--warning)]">Pending</span>;
 };

 return (
 <div className="space-y-5 sm:space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
 {/* Header */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8 border border-[var(--accent)]/20">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-4">
 <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
 <Mail size={28} />
 </div>
 <div>
 <h2 className="text-lg sm:text-xl font-medium">Email Notification Queue</h2>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">
 Manage queued email notifications
 </p>
 </div>
 </div>
 <button
 onClick={handleTestEmail}
 disabled={sending}
 className="px-6 py-3 bg-[var(--accent)] text-white rounded-2xl font-semibold text-xs hover:bg-[var(--accent-hover)] transition-all disabled:opacity-50 flex items-center gap-2"
 >
 {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
 Send Test
 </button>
 </div>
 </div>

 {/* Stats Cards */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-[var(--accent)]">
 <div className="flex items-center gap-3 mb-2">
 <Mail size={18} className="text-[var(--accent)]" />
 <span className="text-[11px] font-medium text-[var(--accent)]">Total</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">{stats.Total}</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Emails in Queue</p>
 </div>
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-emerald-500/20">
 <div className="flex items-center gap-3 mb-2">
 <Mail size={18} className="text-[var(--success)]" />
 <span className="text-[11px] font-medium text-[var(--success)]">Sent</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold text-[var(--success)]">{stats.Sent}</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Successfully Sent</p>
 </div>
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-amber-500/20">
 <div className="flex items-center gap-3 mb-2">
 <Mail size={18} className="text-[var(--warning)]" />
 <span className="text-[11px] font-medium text-[var(--warning)]">Pending</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold text-[var(--warning)]">{stats.Pending}</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Awaiting Send</p>
 </div>
 </div>

 {/* Filters */}
 <div className="glass-card rounded-[var(--radius-xl)] p-6">
 <div className="flex items-center gap-4">
 <Filter size={18} className="text-[var(--text-muted)]" />
 <select
 value={filter.status}
 onChange={(e) => setFilter({ ...filter, status: e.target.value })}
 className="flex-1 bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-[var(--accent)]"
 >
 <option value="">All Status</option>
 <option value="pending">Pending</option>
 <option value="sent">Sent</option>
 </select>
 <button
 onClick={fetchEmails}
 className="px-4 py-2 bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-xl text-[11px] font-medium hover:bg-[var(--accent)]/10 transition-all"
 >
 Refresh
 </button>
 </div>
 </div>

 {/* Email Table */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8">
 <h3 className="text-lg font-medium mb-6">Email Queue</h3>

 {loading ? (
 <div className="flex flex-col items-center justify-center py-20">
 <Loader2 className="w-12 h-12 text-[var(--accent)] animate-spin mb-4" />
 <p className="text-[11px] font-semibold text-[var(--text-muted)]">Loading...</p>
 </div>
 ) : emails.length === 0 ? (
 <div className="p-12 border-2 border-dashed border-[var(--border-primary)] rounded-[var(--radius-xl)] text-center bg-[var(--bg-accent)]/5">
 <Mail className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-6 opacity-20" />
 <p className="text-xs font-semibold text-[var(--text-muted)] mb-4">No emails in queue</p>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="text-[11px] font-medium text-[var(--text-muted)] border-b border-[var(--border-primary)]">
 <th scope="col" className="text-left pb-4 pr-4">Recipient</th>
 <th scope="col" className="text-left pb-4 pr-4">Type</th>
 <th scope="col" className="text-left pb-4 pr-4">Subject</th>
 <th scope="col" className="text-left pb-4 pr-4">Status</th>
 <th scope="col" className="text-left pb-4 pr-4">Created</th>
 <th scope="col" className="text-left pb-4">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-[var(--border-primary)]">
 {emails.map((email) => (
 <tr key={email.EmailID} className="group hover:bg-[var(--bg-accent)] transition-colors">
 <td className="py-4 pr-4">
 <span className="text-sm font-semibold">{email.CandidateName || 'Unknown'}</span>
 {email.CandidateID && <span className="text-xs text-[var(--text-muted)] block">ID: {email.CandidateID}</span>}
 </td>
 <td className="py-4 pr-4">
 <span className="text-xs font-bold text-[var(--accent)]">{email.EmailType}</span>
 </td>
 <td className="py-4 pr-4">
 <span className="text-sm font-bold">{email.Subject}</span>
 </td>
 <td className="py-4 pr-4">
 {getStatusBadge(email.IsSent)}
 </td>
 <td className="py-4 pr-4">
 <span className="text-xs font-bold text-[var(--text-muted)]">
 {email.CreatedAt ? new Date(email.CreatedAt).toLocaleString() : 'N/A'}
 </span>
 </td>
 <td className="py-4">
 <div className="flex items-center gap-2">
 {!email.IsSent && (
 <button
 onClick={() => handleRetry(email.EmailID)}
 className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] hover:bg-[var(--accent-hover)] hover:text-white transition-all"
 title="Retry"
 >
 <RefreshCw size={14} />
 </button>
 )}
 <button
 onClick={() => handleDelete(email.EmailID)}
 className="w-8 h-8 rounded-lg bg-[var(--danger)]/10 flex items-center justify-center text-[var(--danger)] hover:bg-[var(--danger)] hover:text-white transition-all"
 title="Delete"
 >
 <Trash2 size={14} />
 </button>
 </div>
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

export default EmailQueueManager;
