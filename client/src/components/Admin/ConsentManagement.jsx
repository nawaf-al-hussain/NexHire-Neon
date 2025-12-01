import React from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../../apiConfig';

const ConsentManagement = () => {
 const [consentData, setConsentData] = React.useState([]);
 const [loading, setLoading] = React.useState(true);

 const fetchData = async () => {
 setLoading(true);
 try {
 const res = await axios.get(`${API_BASE}/analytics/consent-status`);
 if (res.data && Array.isArray(res.data)) {
 setConsentData(res.data);
 }
 } catch (err) {
 console.error("Consent Status Fetch Error:", err);
 } finally {
 setLoading(false);
 }
 };

 React.useEffect(() => {
 fetchData();
 }, []);

 const getStatusIcon = (status) => {
 if (status === 'Active' || status === 'Granted') return <CheckCircle size={14} className="text-[var(--success)]" />;
 if (status === 'Expired' || status === 'Revoked') return <XCircle size={14} className="text-[var(--danger)]" />;
 if (status === 'Inactive') return <Clock size={14} className="text-[var(--warning)]" />;
 return <Clock size={14} className="text-[var(--warning)]" />;
 };

 const getStatusColor = (status) => {
 if (status === 'Active' || status === 'Granted') return 'text-[var(--success)]';
 if (status === 'Expired' || status === 'Revoked') return 'text-[var(--danger)]';
 return 'text-[var(--warning)]';
 };

 const getStatusBg = (status) => {
 if (status === 'Active' || status === 'Granted') return 'bg-[var(--success)]/10 border-emerald-500/20';
 if (status === 'Expired' || status === 'Revoked') return 'bg-[var(--danger)]/10 border-[var(--danger)]/20';
 return 'bg-[var(--warning)]/10 border-amber-500/20';
 };

 const displayData = consentData.length > 0 ? consentData : [];

 const active = displayData.filter(d => d.Status === 'Active' || d.Status === 'Granted').length;
 const expired = displayData.filter(d => d.Status === 'Expired').length;
 const revoked = displayData.filter(d => d.Status === 'Revoked' || d.Status === 'Inactive').length;

 if (loading) {
 return (
 <div className="flex items-center justify-center py-20">
 <RefreshCw className="w-8 h-8 text-[var(--accent)] animate-spin" />
 <span className="ml-3 text-sm font-medium text-[var(--text-muted)]">Loading Consent Data...</span>
 </div>
 );
 }

 return (
 <div className="space-y-6 sm:space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
 {/* Header */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8 border border-emerald-500/20">
 <div className="flex items-center gap-4">
 <div className="w-14 h-14 rounded-2xl bg-[var(--success)]/10 flex items-center justify-center text-[var(--success)]">
 <Shield size={28} />
 </div>
 <div>
 <h2 className="text-lg sm:text-xl font-medium">GDPR Consent Management</h2>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Candidate consent tracking & expiry</p>
 </div>
 </div>
 </div>

 {/* Summary Stats */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-emerald-500/20">
 <div className="flex items-center gap-3 mb-2">
 <CheckCircle size={18} className="text-[var(--success)]" />
 <span className="text-[11px] font-medium text-[var(--success)]">Active</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">{active}</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Consents</p>
 </div>
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-[var(--danger)]/20">
 <div className="flex items-center gap-3 mb-2">
 <AlertTriangle size={18} className="text-[var(--danger)]" />
 <span className="text-[11px] font-medium text-[var(--danger)]">Expired</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">{expired}</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Consents</p>
 </div>
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-amber-500/20">
 <div className="flex items-center gap-3 mb-2">
 <XCircle size={18} className="text-[var(--warning)]" />
 <span className="text-[11px] font-medium text-[var(--warning)]">Revoked</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">{revoked}</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Consents</p>
 </div>
 </div>

 {/* Detailed List */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8">
 <div className="flex items-center justify-between mb-6">
 <h3 className="text-lg font-medium">Consent Records</h3>
 <button
 onClick={fetchData}
 className="px-4 py-2 bg-[var(--accent)] text-white rounded-xl text-[11px] font-medium flex items-center gap-2 hover:bg-[var(--accent-hover)]">
 <RefreshCw size={12} /> Run Consent Check
 </button>
 </div>
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="text-[11px] font-medium text-[var(--text-muted)] border-b border-[var(--border-primary)]">
 <th scope="col" className="text-left pb-4 pr-4">Candidate</th>
 <th scope="col" className="text-left pb-4 pr-4">Consent Type</th>
 <th scope="col" className="text-left pb-4 pr-4">Version</th>
 <th scope="col" className="text-left pb-4 pr-4">Granted</th>
 <th scope="col" className="text-left pb-4 pr-4">Expires</th>
 <th scope="col" className="text-left pb-4">Status</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-[var(--border-primary)]">
 {displayData.slice(0, 10).map((item, i) => (
 <tr key={i} className="group hover:bg-[var(--bg-accent)] transition-colors">
 <td className="py-4 pr-4">
 <span className="text-sm font-semibold">{item.CandidateName || 'Unknown'}</span>
 </td>
 <td className="py-4 pr-4">
 <span className="text-xs font-bold text-[var(--text-secondary)]">
 {item.ConsentType ? item.ConsentType.replace(/([A-Z])/g, ' $1').trim() : 'N/A'}
 </span>
 </td>
 <td className="py-4 pr-4">
 <span className="text-xs font-mono text-[var(--text-muted)]">v{item.ConsentVersion || '1.0'}</span>
 </td>
 <td className="py-4 pr-4">
 <span className="text-xs font-bold text-[var(--text-muted)]">
 {item.GivenAt ? new Date(item.GivenAt).toLocaleDateString() : item.GrantedAt ? new Date(item.GrantedAt).toLocaleDateString() : '-'}
 </span>
 </td>
 <td className="py-4 pr-4">
 <span className="text-xs font-bold text-[var(--text-muted)]">
 {item.ExpiryDate ? new Date(item.ExpiryDate).toLocaleDateString() : '-'}
 </span>
 </td>
 <td className="py-4">
 <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium ${getStatusBg(item.Status)}`}>
 {getStatusIcon(item.Status)}
 {item.Status || 'Unknown'}
 </span>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 );
};

export default ConsentManagement;
