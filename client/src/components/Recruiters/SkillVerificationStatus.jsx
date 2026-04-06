import React from 'react';
import { Shield, CheckCircle, XCircle, Clock, Award, AlertTriangle, RefreshCw, User, FileText, Star, X } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../../apiConfig';

const SkillVerificationStatus = () => {
 const [skillData, setSkillData] = React.useState([]);
 const [loading, setLoading] = React.useState(true);
 const [verificationModal, setVerificationModal] = React.useState(false);
 const [selectedSkill, setSelectedSkill] = React.useState(null);
 const [verificationLevel, setVerificationLevel] = React.useState('');
 const [verificationNotes, setVerificationNotes] = React.useState('');
 const [submitting, setSubmitting] = React.useState(false);
 const [verificationError, setVerificationError] = React.useState(null);

 React.useEffect(() => {
 const fetchData = async () => {
 setLoading(true);
 try {
 const res = await axios.get(`${API_BASE}/analytics/skill-verification`);
 if (res.data && Array.isArray(res.data)) {
 // Map backend data to frontend expected format
 const mappedData = res.data.map(item => {
 let mappedStatus = 'Pending';
 if (item.VerificationStatus?.includes('Verified')) mappedStatus = 'Verified';
 if (item.VerificationStatus === 'Verification Failed') mappedStatus = 'Failed';
 if (item.VerificationStatus === 'Not Verified') mappedStatus = 'Pending';

 let mappedClaimedLevel = item.ClaimedLevel;
 if (mappedClaimedLevel && !isNaN(mappedClaimedLevel)) {
 const levelNum = parseInt(mappedClaimedLevel);
 if (levelNum >= 9) mappedClaimedLevel = 'Expert';
 else if (levelNum >= 7) mappedClaimedLevel = 'Advanced';
 else if (levelNum >= 4) mappedClaimedLevel = 'Intermediate';
 else mappedClaimedLevel = 'Beginner';
 }

 return {
 CandidateID: item.CandidateID,
 CandidateName: item.FullName,
 SkillName: item.SkillName,
 ClaimedLevel: mappedClaimedLevel,
 VerifiedLevel: item.VerificationScore ? `${item.VerificationScore}%` : '-',
 Status: mappedStatus,
 VerificationDate: item.VerifiedAt,
 ExpiryDate: item.ExpiryDate
 };
 });
 setSkillData(mappedData);
 }
 } catch (err) {
 console.error("Skill Verification Fetch Error:", err);
 } finally {
 setLoading(false);
 }
 };
 fetchData();
 }, []);

 const getStatusIcon = (status) => {
 if (status === 'Verified') return <CheckCircle size={14} className="text-[var(--success)]" />;
 if (status === 'Pending') return <Clock size={14} className="text-[var(--warning)]" />;
 return <XCircle size={14} className="text-[var(--danger)]" />;
 };

 const getStatusColor = (status) => {
 if (status === 'Verified') return 'text-[var(--success)]';
 if (status === 'Pending') return 'text-[var(--warning)]';
 return 'text-[var(--danger)]';
 };

 const getStatusBg = (status) => {
 if (status === 'Verified') return 'bg-[var(--success)]/10 border-emerald-500/20';
 if (status === 'Pending') return 'bg-[var(--warning)]/10 border-amber-500/20';
 return 'bg-[var(--danger)]/10 border-[var(--danger)]/20';
 };

 const openVerificationModal = (item) => {
 setSelectedSkill(item);
 setVerificationLevel(item.ClaimedLevel || '');
 setVerificationNotes('');
 setVerificationError(null);
 setVerificationModal(true);
 };

 const handleVerify = async (approved) => {
 if (!selectedSkill) return;
 setSubmitting(true);
 setVerificationError(null);
 try {
 await axios.post(`${API_BASE}/analytics/verify-skill`, {
 candidateId: selectedSkill.CandidateID || selectedSkill.candidateid,
 skillName: selectedSkill.SkillName || selectedSkill.skillname,
 verifiedLevel: verificationLevel,
 status: approved ? 'Verified' : 'Failed',
 notes: verificationNotes
 });

 // For now, update local state
 const updatedData = skillData.map(item => {
 if (item.CandidateName === selectedSkill.CandidateName && item.SkillName === selectedSkill.SkillName) {
 return {
 ...item,
 Status: approved ? 'Verified' : 'Failed',
 VerifiedLevel: approved ? verificationLevel : 'Failed',
 VerificationDate: new Date().toISOString().split('T')[0],
 ExpiryDate: approved ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null
 };
 }
 return item;
 });
 setSkillData(updatedData);
 setVerificationModal(false);
 setSelectedSkill(null);
 } catch (err) {
 console.error('Verification Error:', err);
 const apiError = err?.response?.data?.error || err?.message || 'Failed to verify skill.';
 setVerificationError(apiError);
 } finally {
 setSubmitting(false);
 }
 };

 const displayData = skillData;

 // Calculate stats
 const verified = displayData.filter(d => d.Status === 'Verified').length;
 const pending = displayData.filter(d => d.Status === 'Pending').length;
 const failed = displayData.filter(d => d.Status === 'Failed').length;

 if (loading) {
 return (
 <div className="flex items-center justify-center py-20">
 <RefreshCw className="w-8 h-8 text-[var(--accent)] animate-spin" />
 <span className="ml-3 text-sm font-medium text-[var(--text-muted)]">Loading Skill Verification...</span>
 </div>
 );
 }

 return (
 <div className="space-y-6 sm:space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
 {/* Header */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8 border border-cyan-500/20">
 <div className="flex items-center gap-4">
 <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
 <Shield size={28} />
 </div>
 <div>
 <h2 className="text-lg sm:text-xl font-medium">Skill Verification Status</h2>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Claimed vs verified skills tracking</p>
 </div>
 </div>
 </div>

 {/* Summary Stats */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-emerald-500/20">
 <div className="flex items-center gap-3 mb-2">
 <CheckCircle size={18} className="text-[var(--success)]" />
 <span className="text-[11px] font-medium text-[var(--success)]">Verified</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">{verified}</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Skills</p>
 </div>
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-amber-500/20">
 <div className="flex items-center gap-3 mb-2">
 <Clock size={18} className="text-[var(--warning)]" />
 <span className="text-[11px] font-medium text-[var(--warning)]">Pending</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">{pending}</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Skills</p>
 </div>
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-[var(--danger)]/20">
 <div className="flex items-center gap-3 mb-2">
 <XCircle size={18} className="text-[var(--danger)]" />
 <span className="text-[11px] font-medium text-[var(--danger)]">Failed</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">{failed}</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Skills</p>
 </div>
 </div>

 {/* Detailed List */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8">
 <h3 className="text-lg font-medium mb-6">All Skill Verifications</h3>
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="text-[11px] font-medium text-[var(--text-muted)] border-b border-[var(--border-primary)]">
 <th scope="col" className="text-left pb-4 pr-4">Candidate</th>
 <th scope="col" className="text-left pb-4 pr-4">Skill</th>
 <th scope="col" className="text-left pb-4 pr-4">Claimed</th>
 <th scope="col" className="text-left pb-4 pr-4">Verified</th>
 <th scope="col" className="text-left pb-4 pr-4">Status</th>
 <th scope="col" className="text-left pb-4 pr-4">Expiry</th>
 <th scope="col" className="text-left pb-4">Action</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-[var(--border-primary)]">
 {displayData.slice(0, 15).map((item, i) => (
 <tr key={i} className="group hover:bg-[var(--bg-accent)] transition-colors">
 <td className="py-4 pr-4">
 <span className="text-sm font-semibold">{item.CandidateName || 'Unknown'}</span>
 </td>
 <td className="py-4 pr-4">
 <span className="text-sm font-semibold">{item.SkillName || 'N/A'}</span>
 </td>
 <td className="py-4 pr-4">
 <span className="text-xs font-bold text-[var(--text-secondary)]">{item.ClaimedLevel || 'N/A'}</span>
 </td>
 <td className="py-4 pr-4">
 <span className="text-xs font-bold text-[var(--success)]">{item.VerifiedLevel || '-'}</span>
 </td>
 <td className="py-4 pr-4">
 <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium ${getStatusBg(item.Status)}`}>
 {getStatusIcon(item.Status)}
 {item.Status || 'Unknown'}
 </span>
 </td>
 <td className="py-4">
 <span className="text-xs font-bold text-[var(--text-muted)]">
 {item.ExpiryDate ? new Date(item.ExpiryDate).toLocaleDateString() : '-'}
 </span>
 </td>
 <td className="py-4">
 {item.Status === 'Pending' && (
 <button
 onClick={() => openVerificationModal(item)}
 className="px-3 py-1.5 rounded-xl text-[11px] font-medium bg-[var(--accent)] text-white hover:shadow-lg hover: transition-all"
 >
 Verify
 </button>
 )}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>

 {/* Verification Modal */}
 {verificationModal && selectedSkill && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 {/* Backdrop */}
 <div
 className="absolute inset-0 bg-black/60 backdrop-blur-sm"
 onClick={() => setVerificationModal(false)}
 />

 {/* Modal Content */}
 <div className="relative w-full max-w-lg bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-[var(--radius-xl)] p-8 shadow-[var(--shadow-lg)] animate-in zoom-in-95 duration-200">
 {/* Header */}
 <div className="flex items-center justify-between mb-6">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-2xl bg-[var(--accent-soft)] flex items-center justify-center">
 <Shield className="w-6 h-6 text-[var(--accent)]" />
 </div>
 <div>
 <h3 className="text-lg font-medium">Manual Verification</h3>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Approve or reject skill claim</p>
 </div>
 </div>
 <button
 onClick={() => setVerificationModal(false)}
 className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center hover:bg-[var(--bg-accent)] transition-colors"
 >
 <X size={18} />
 </button>
 </div>

 {/* Candidate & Skill Info */}
 <div className="mb-6 p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-primary)]">
 <div className="flex items-center gap-3 mb-3">
 <User size={16} className="text-[var(--accent)]" />
 <span className="text-sm font-semibold">{selectedSkill.CandidateName}</span>
 </div>
 <div className="flex items-center gap-3 mb-3">
 <FileText size={16} className="text-[var(--accent)]" />
 <span className="text-sm font-bold">{selectedSkill.SkillName}</span>
 </div>
 <div className="flex items-center gap-3">
 <Star size={16} className="text-[var(--warning)]" />
 <span className="text-xs font-bold text-[var(--text-muted)]">Claimed Level: </span>
 <span className="text-sm font-semibold text-[var(--warning)]">{selectedSkill.ClaimedLevel}</span>
 </div>
 </div>

 {/* Verification Form */}
 <div className="space-y-4 mb-6">
 <div>
 <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-2">
 Verified Level
 </label>
 <select
 value={verificationLevel}
 onChange={(e) => setVerificationLevel(e.target.value)}
 className="w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-sm font-bold focus:outline-none focus:border-cyan-500"
 >
 <option value="">Select level...</option>
 <option value="Beginner">Beginner</option>
 <option value="Intermediate">Intermediate</option>
 <option value="Advanced">Advanced</option>
 <option value="Expert">Expert</option>
 </select>
 </div>
 <div>
 <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-2">
 Notes (Optional)
 </label>
 <textarea
 value={verificationNotes}
 onChange={(e) => setVerificationNotes(e.target.value)}
 placeholder="Add verification notes..."
 rows={3}
 className="w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-sm font-bold focus:outline-none focus:border-cyan-500 resize-none"
 />
 </div>
 </div>

 {/* Verification Error (if any) */}
 {verificationError && (
 <div className="mb-4 p-3 rounded-xl bg-[var(--danger)]/10 border border-[var(--danger)]/30 flex items-start gap-2">
 <AlertTriangle size={16} className="text-[var(--danger)] flex-shrink-0 mt-0.5" />
 <span className="text-xs text-[var(--danger)]">{verificationError}</span>
 </div>
 )}

 {/* Action Buttons */}
 <div className="flex gap-3">
 <button
 onClick={() => handleVerify(false)}
 disabled={submitting || !verificationLevel}
 className="flex-1 px-6 py-3 rounded-xl bg-[var(--accent)] text-white text-sm font-medium hover:shadow-lg hover: transition-all disabled:opacity-50 disabled:cursor-not-allowed"
 >
 <div className="flex items-center justify-center gap-2">
 <XCircle size={18} />
 Reject
 </div>
 </button>
 <button
 onClick={() => handleVerify(true)}
 disabled={submitting || !verificationLevel}
 className="flex-1 px-6 py-3 rounded-xl bg-[var(--accent)] text-white text-sm font-medium hover:shadow-lg hover: transition-all disabled:opacity-50 disabled:cursor-not-allowed"
 >
 <div className="flex items-center justify-center gap-2">
 <CheckCircle size={18} />
 Approve
 </div>
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
};

export default SkillVerificationStatus;
