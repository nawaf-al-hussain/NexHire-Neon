import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API_BASE from '../../apiConfig';
import axios from 'axios';
import {
 Shield,
 Search,
 Plus,
 CheckCircle,
 XCircle,
 Clock,
 FileText,
 RefreshCw,
 Eye,
 Hash,
 Link2,
 Award,
 GraduationCap,
 Briefcase,
 User,
 X,
 Globe,
 Lock,
 TrendingUp,
 DollarSign,
 AlertTriangle,
 Users
} from 'lucide-react';

const BlockchainVerifications = () => {
 const { user } = useAuth();
 const [activeView, setActiveView] = useState('dashboard');
 const [dashboardData, setDashboardData] = useState(null);
 const [candidateVerifications, setCandidateVerifications] = useState([]);
 const [selectedCandidate, setSelectedCandidate] = useState(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);

 // Filters
 const [credentialTypeFilter, setCredentialTypeFilter] = useState('');
 const [statusFilter, setStatusFilter] = useState('');
 const [searchName, setSearchName] = useState('');

 // Modal states
 const [showInitiateModal, setShowInitiateModal] = useState(false);
 const [showDetailsModal, setShowDetailsModal] = useState(false);
 const [selectedVerification, setSelectedVerification] = useState(null);
 const [candidates, setCandidates] = useState([]);

 // Form state for initiating new verification
 const [newVerification, setNewVerification] = useState({
 candidateId: '',
 credentialType: 'Degree',
 issuingAuthority: '',
 metadata: ''
 });

 const credentialTypes = ['Degree', 'Certificate', 'Employment', 'Identity'];
 const statuses = ['Pending', 'Verified', 'Failed', 'Expired'];useEffect(() => {
 fetchDashboardData();
 fetchCandidates();
 }, []);

 const fetchDashboardData = async () => {
 try {
 setLoading(true);
 const res = await axios.get(`${API_BASE}/recruiters/blockchain-dashboard`);
 setDashboardData(res.data);
 } catch (err) {
 console.error("Dashboard fetch error:", err.message);
 // Set empty data gracefully instead of showing error
 setDashboardData({
 summary: {
 TotalVerifications: 0,
 Pending: 0,
 Verified: 0,
 Failed: 0,
 Degrees: 0,
 Certificates: 0,
 Employment: 0,
 Identity: 0,
 TotalCost: 0,
 AvgCost: 0
 },
 byType: [],
 recent: []
 });
 setError(null); // Clear any error message since we're handling gracefully
 } finally {
 setLoading(false);
 }
 };

 const fetchCandidates = async () => {
 try {
 const res = await axios.get(`${API_BASE}/recruiters/talent-pool`);
 setCandidates(res.data);
 } catch (err) {
 console.error("Candidates fetch error:", err.message);
 }
 };

 const fetchCandidateVerifications = async (candidateId) => {
 try {
 setLoading(true);
 const params = new URLSearchParams();
 if (credentialTypeFilter) params.append('credentialType', credentialTypeFilter);
 if (statusFilter) params.append('status', statusFilter);

 const res = await axios.get(
 `${API_BASE}/recruiters/blockchain-verifications/${candidateId}?${params}`);
 setCandidateVerifications(res.data);
 setSelectedCandidate(candidates.find(c => c.CandidateID === parseInt(candidateId)));
 setActiveView('candidate');
 } catch (err) {
 console.error("Verifications fetch error:", err.message);
 setError("Failed to load candidate verifications");
 } finally {
 setLoading(false);
 }
 };

 const initiateVerification = async (e) => {
 e.preventDefault();
 try {
 setLoading(true);
 await axios.post(
 `${API_BASE}/recruiters/blockchain-verifications`,
 newVerification);
 setShowInitiateModal(false);
 setNewVerification({ candidateId: '', credentialType: 'Degree', issuingAuthority: '', metadata: '' });
 fetchDashboardData();
 if (selectedCandidate) {
 fetchCandidateVerifications(selectedCandidate.CandidateID);
 }
 } catch (err) {
 console.error("Initiate error:", err.message);
 setError(err.response?.data?.error || "Failed to initiate blockchain verification");
 } finally {
 setLoading(false);
 }
 };

 const updateVerificationStatus = async (verificationId, updateData) => {
 // Guard against undefined / null / non-numeric verificationId.
 // Previously, if the API returned the field under a different case
 // (e.g. verificationid instead of VerificationID), this would PUT to
 // /blockchain-verifications/undefined and 500.
 if (!verificationId || (typeof verificationId !== 'number' && isNaN(Number(verificationId)))) {
 console.error("updateVerificationStatus: invalid verificationId", verificationId);
 setError("Cannot update: verification ID is missing. Try refreshing the page.");
 return;
 }
 try {
 setLoading(true);
 await axios.put(
 `${API_BASE}/recruiters/blockchain-verifications/${verificationId}`,
 updateData);
 setShowDetailsModal(false);
 fetchDashboardData();
 if (selectedCandidate) {
 fetchCandidateVerifications(selectedCandidate.CandidateID);
 }
 } catch (err) {
 console.error("Update error:", err.message);
 setError(err?.response?.data?.error || "Failed to update blockchain verification");
 } finally {
 setLoading(false);
 }
 };

 const getStatusColor = (status) => {
 switch (status) {
 case 'Verified': return 'text-[var(--success)]';
 case 'Pending': return 'text-[var(--warning)]';
 case 'Failed': return 'text-[var(--danger)]';
 case 'Expired': return 'text-[var(--warning)]';
 default: return 'text-[var(--text-muted)]';
 }
 };

 const getStatusBg = (status) => {
 switch (status) {
 case 'Verified': return 'bg-[var(--success)]/10 border-green-500/20';
 case 'Pending': return 'bg-[var(--warning)]/10 border-amber-500/20';
 case 'Failed': return 'bg-[var(--danger)]/10 border-[var(--danger)]/20';
 case 'Expired': return 'bg-orange-500/10 border-orange-500/20';
 default: return 'bg-[var(--bg-accent)] border-[var(--border-primary)]';
 }
 };

 const getStatusIcon = (status) => {
 switch (status) {
 case 'Verified':
 return <CheckCircle className="w-4 h-4 text-[var(--success)]" />;
 case 'Failed':
 return <XCircle className="w-4 h-4 text-[var(--danger)]" />;
 case 'Pending':
 return <Clock className="w-4 h-4 text-[var(--warning)]" />;
 default:
 return <Clock className="w-4 h-4 text-[var(--text-muted)]" />;
 }
 };

 const getCredentialIcon = (type) => {
 switch (type) {
 case 'Degree':
 return <GraduationCap className="w-5 h-5" />;
 case 'Certificate':
 return <Award className="w-5 h-5" />;
 case 'Employment':
 return <Briefcase className="w-5 h-5" />;
 case 'Identity':
 return <User className="w-5 h-5" />;
 default:
 return <FileText className="w-5 h-5" />;
 }
 };

 if (loading && !dashboardData) {
 return (
 <div className="flex flex-col items-center justify-center py-20">
 <RefreshCw className="w-12 h-12 text-[var(--accent)] animate-spin mb-4" />
 <p className="text-[11px] font-semibold text-[var(--text-muted)]">Loading Blockchain Verifications...</p>
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
 <div className="glass-card rounded-[var(--radius-xl)] p-8 border border-[var(--accent)]/20">
 <div className="flex items-center gap-4">
 <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
 <Shield size={28} />
 </div>
 <div>
 <h2 className="text-lg sm:text-xl font-medium">Blockchain Credentials</h2>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Verify candidate credentials on blockchain with SHA-256 hashing</p>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-[var(--accent)]/20">
 <div className="flex items-center gap-3 mb-2">
 <Users size={18} className="text-[var(--accent)]" />
 <span className="text-[11px] font-medium text-[var(--accent)]">Total Verifications</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">{dashboardData?.summary?.TotalVerifications || 0}</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">All time</p>
 </div>
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-amber-500/20">
 <div className="flex items-center gap-3 mb-2">
 <Clock size={18} className="text-[var(--warning)]" />
 <span className="text-[11px] font-medium text-[var(--warning)]">Pending</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">{dashboardData?.summary?.Pending || 0}</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Awaiting verification</p>
 </div>
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-green-500/20">
 <div className="flex items-center gap-3 mb-2">
 <CheckCircle size={18} className="text-[var(--success)]" />
 <span className="text-[11px] font-medium text-[var(--success)]">Verified</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">{dashboardData?.summary?.Verified || 0}</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Successfully verified</p>
 </div>
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-[var(--accent)]/20">
 <div className="flex items-center gap-3 mb-2">
 <DollarSign size={18} className="text-[var(--accent)]" />
 <span className="text-[11px] font-medium text-[var(--accent)]">Total Cost</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">${Number(dashboardData?.summary?.TotalCost || 0).toFixed(0)}</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Avg: ${Number(dashboardData?.summary?.AvgCost || 0).toFixed(2)}</p>
 </div>
 </div>

 <div className="glass-card rounded-[var(--radius-xl)] p-8">
 <div className="flex items-center justify-between mb-6">
 <h3 className="text-lg font-medium">Recent Verifications</h3>
 <div className="flex gap-2">
 <button
 onClick={fetchDashboardData}
 className="p-2 hover:bg-[var(--bg-accent)] rounded-xl transition-colors"
 title="Refresh"
 >
 <RefreshCw className="w-5 h-5 text-[var(--text-muted)]" />
 </button>
 <button
 onClick={() => setShowInitiateModal(true)}
 className="flex items-center gap-2 px-4 py-3 bg-[var(--accent)] hover:bg-purple-700 text-white rounded-xl text-xs font-medium transition-all"
 >
 <Plus className="w-4 h-4" />
 Submit Credential
 </button>
 </div>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="text-[11px] font-medium text-[var(--text-muted)] border-b border-[var(--border-primary)]">
 <th scope="col" className="text-left pb-4 pr-4">Candidate</th>
 <th scope="col" className="text-left pb-4 pr-4">Credential</th>
 <th scope="col" className="text-left pb-4 pr-4">Issuing Authority</th>
 <th scope="col" className="text-left pb-4 pr-4">Network</th>
 <th scope="col" className="text-left pb-4 pr-4">Status</th>
 <th scope="col" className="text-left pb-4 pr-4">Verified</th>
 <th scope="col" className="text-left pb-4 pr-4">Transaction</th>
 <th scope="col" className="text-left pb-4">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-[var(--border-primary)]">
 {dashboardData?.recent?.length === 0 ? (
 <tr>
 <td colSpan="8" className="py-12 text-center">
 <Shield className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4 opacity-50" />
 <p className="text-[var(--text-muted)]">No blockchain verifications found yet.</p>
 <p className="text-xs text-[var(--text-muted)] mt-1">Submit credentials to see them appear here.</p>
 </td>
 </tr>
 ) : (
 dashboardData?.recent
 ?.filter(c => !searchName || c.FullName?.toLowerCase().includes(searchName.toLowerCase()))
 .map((verif) => (
 <tr key={verif.VerificationID} className="group hover:bg-[var(--bg-accent)] transition-colors">
 <td className="py-4 pr-4">
 <button
 onClick={() => fetchCandidateVerifications(verif.CandidateID)}
 className="text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
 >
 {verif.FullName}
 </button>
 </td>
 <td className="py-4 pr-4">
 <div className="flex items-center gap-2">
 <span className="text-[var(--accent)]">{getCredentialIcon(verif.CredentialType)}</span>
 <span className="text-xs font-bold text-[var(--text-secondary)]">{verif.CredentialType}</span>
 </div>
 </td>
 <td className="py-4 pr-4">
 <span className="text-xs font-bold text-[var(--text-secondary)]">{verif.IssuingAuthority}</span>
 </td>
 <td className="py-4 pr-4">
 <span className="flex items-center gap-1 text-xs font-bold text-[var(--text-muted)]">
 <Globe className="w-3 h-3" />
 {verif.Network || 'Ethereum'}
 </span>
 </td>
 <td className="py-4 pr-4">
 <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium ${getStatusBg(verif.VerificationStatus)}`}>
 {getStatusIcon(verif.VerificationStatus)}
 {verif.VerificationStatus}
 </span>
 </td>
 <td className="py-4 pr-4">
 <span className="text-xs font-bold text-[var(--text-muted)]">
 {verif.VerifiedAt ? new Date(verif.VerifiedAt).toLocaleDateString() : '-'}
 </span>
 </td>
 <td className="py-4 pr-4">
 <span className="text-xs font-mono text-[var(--text-muted)]">
 {verif.BlockchainTransactionID ? verif.BlockchainTransactionID.substring(0, 12) + '...' : '-'}
 </span>
 </td>
 <td className="py-4">
 <button
 onClick={() => {
 setSelectedVerification(verif);
 setShowDetailsModal(true);
 }}
 className="p-2 hover:bg-[var(--bg-accent)] rounded-xl transition-colors"
 >
 <Eye className="w-4 h-4 text-[var(--text-muted)]" />
 </button>
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </div>

 {/* Candidate Detail View */}
 {activeView === 'candidate' && selectedCandidate && (
 <div className="space-y-6">
 <div className="flex items-center gap-4">
 <button
 onClick={() => setActiveView('dashboard')}
 className="p-2 hover:bg-[var(--bg-accent)] rounded-xl transition-colors"
 >
 <RefreshCw className="w-5 h-5 text-[var(--text-muted)] rotate-180" />
 </button>
 <div>
 <h3 className="text-lg sm:text-xl font-medium">{selectedCandidate.FullName}</h3>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Blockchain Credential History</p>
 </div>
 </div>

 {/* Filters */}
 <div className="flex gap-4 flex-wrap">
 <select
 value={credentialTypeFilter}
 onChange={(e) => {
 setCredentialTypeFilter(e.target.value);
 fetchCandidateVerifications(selectedCandidate.CandidateID);
 }}
 className="px-4 py-3 bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-xl text-sm font-bold"
 >
 <option value="">All Types</option>
 {credentialTypes.map(t => <option key={t} value={t}>{t}</option>)}
 </select>
 <select
 value={statusFilter}
 onChange={(e) => {
 setStatusFilter(e.target.value);
 fetchCandidateVerifications(selectedCandidate.CandidateID);
 }}
 className="px-4 py-3 bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-xl text-sm font-bold"
 >
 <option value="">All Statuses</option>
 {statuses.map(s => <option key={s} value={s}>{s}</option>)}
 </select>
 </div>

 {/* Candidate Verifications List */}
 <div className="space-y-4">
 {candidateVerifications.length === 0 ? (
 <div className="glass-card rounded-[var(--radius-xl)] p-8 text-center">
 <Shield className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
 <p className="text-[var(--text-muted)]">No blockchain verifications found for this candidate.</p>
 <button
 onClick={() => {
 setNewVerification({ ...newVerification, candidateId: selectedCandidate.CandidateID });
 setShowInitiateModal(true);
 }}
 className="mt-4 text-[var(--accent)] hover:text-[var(--accent)] font-semibold text-xs"
 >
 Submit a new credential →
 </button>
 </div>
 ) : (
 candidateVerifications.map((verif) => (
 <div key={verif.VerificationID} className="glass-card rounded-[var(--radius-xl)] p-6">
 <div className="flex items-start justify-between">
 <div className="flex items-start gap-4">
 <div className="p-3 bg-[var(--bg-accent)] rounded-xl text-[var(--accent)]">
 {getCredentialIcon(verif.CredentialType)}
 </div>
 <div>
 <div className="flex items-center gap-3">
 <h4 className="text-lg font-semibold text-[var(--text-primary)]">{verif.CredentialType}</h4>
 <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium ${getStatusBg(verif.VerificationStatus)}`}>
 {getStatusIcon(verif.VerificationStatus)}
 {verif.VerificationStatus}
 </span>
 {verif.IsImmutable === 1 && (
 <span className="flex items-center gap-1 text-xs text-[var(--success)] font-medium">
 <Lock className="w-3 h-3" />
 Immutable
 </span>
 )}
 </div>
 <div className="flex items-center gap-4 mt-2 text-sm font-bold text-[var(--text-muted)]">
 <span>Issuer: {verif.IssuingAuthority}</span>
 <span>•</span>
 <span className="flex items-center gap-1">
 <Globe className="w-3 h-3" />
 {verif.Network || 'Ethereum'}
 </span>
 <span>•</span>
 <span>Submitted: {verif.LastChecked ? new Date(verif.LastChecked).toLocaleDateString() : '-'}</span>
 </div>
 </div>
 </div>
 <div className="flex items-center gap-4">
 {verif.VerifiedAt && (
 <div className="text-right">
 <p className="text-xs font-semibold text-[var(--text-muted)]">Verified</p>
 <p className="text-[var(--success)]">{new Date(verif.VerifiedAt).toLocaleDateString()}</p>
 </div>
 )}
 <button
 onClick={() => {
 setSelectedVerification(verif);
 setShowDetailsModal(true);
 }}
 className="p-2 hover:bg-[var(--bg-accent)] rounded-xl transition-colors"
 >
 <Eye className="w-5 h-5 text-[var(--text-muted)]" />
 </button>
 </div>
 </div>

 {verif.CredentialHash && (
 <div className="mt-4 p-3 bg-[var(--bg-accent)] rounded-xl">
 <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)]">
 <Hash className="w-4 h-4" />
 <span className="font-mono">{verif.CredentialHash}</span>
 </div>
 </div>
 )}
 </div>
 ))
 )}
 </div>
 </div>
 )}

 {/* Initiate Modal */}
 {showInitiateModal && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300">
 <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowInitiateModal(false)}></div>

 <div className="relative bg-[var(--bg-primary)] border border-[var(--border-primary)] w-full max-w-md max-h-[90vh] overflow-hidden rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] flex flex-col text-[var(--text-primary)]">
 {/* Header */}
 <div className="p-8 border-b border-[var(--border-primary)] flex items-center justify-between bg-[var(--bg-accent)]/20">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)]">
 <Shield size={24} />
 </div>
 <div>
 <h2 className="text-lg sm:text-xl font-medium">Submit Credential</h2>
 <p className="text-[11px] font-semibold text-[var(--text-muted)] mt-1 italic">Submit credential for blockchain verification</p>
 </div>
 </div>
 <button onClick={() => setShowInitiateModal(false)} className="w-10 h-10 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
 <X size={20} />
 </button>
 </div>

 {/* Content */}
 <div className="p-8 overflow-y-auto">
 <form onSubmit={initiateVerification} className="space-y-6">
 <div>
 <label className="block text-[11px] font-semibold text-[var(--text-muted)] ml-1 mb-2">
 Candidate
 </label>
 <select
 value={newVerification.candidateId}
 onChange={(e) => setNewVerification({ ...newVerification, candidateId: e.target.value })}
 required
 className="w-full bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-xl py-4 px-6 text-sm font-bold"
 >
 <option value="">Select candidate...</option>
 {candidates.map(c => (
 <option key={c.CandidateID} value={c.CandidateID}>{c.FullName}</option>
 ))}
 </select>
 </div>

 <div>
 <label className="block text-[11px] font-semibold text-[var(--text-muted)] ml-1 mb-2">
 Credential Type
 </label>
 <select
 value={newVerification.credentialType}
 onChange={(e) => setNewVerification({ ...newVerification, credentialType: e.target.value })}
 className="w-full bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-xl py-4 px-6 text-sm font-bold"
 >
 {credentialTypes.map(t => (
 <option key={t} value={t}>{t}</option>
 ))}
 </select>
 </div>

 <div>
 <label className="block text-[11px] font-semibold text-[var(--text-muted)] ml-1 mb-2">
 Issuing Authority
 </label>
 <input
 type="text"
 value={newVerification.issuingAuthority}
 onChange={(e) => setNewVerification({ ...newVerification, issuingAuthority: e.target.value })}
 placeholder="e.g., Stanford University, Google, Government of USA"
 required
 className="w-full bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-xl py-4 px-6 text-sm font-bold placeholder:text-[var(--text-muted)]"
 />
 </div>

 <div>
 <label className="block text-[11px] font-semibold text-[var(--text-muted)] ml-1 mb-2">
 Additional Metadata (optional)
 </label>
 <textarea
 value={newVerification.metadata}
 onChange={(e) => setNewVerification({ ...newVerification, metadata: e.target.value })}
 rows={3}
 placeholder="Credential ID, issue date, expiry date, etc."
 className="w-full bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-xl py-4 px-6 text-sm font-bold placeholder:text-[var(--text-muted)]"
 />
 </div>

 <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-xl">
 <p className="text-xs font-bold text-[var(--accent)]">
 A SHA-256 hash will be generated and stored on the blockchain for immutable verification.
 </p>
 </div>

 <div className="flex gap-4 pt-4">
 <button
 type="button"
 onClick={() => setShowInitiateModal(false)}
 className="flex-1 px-4 py-4 border border-[var(--border-primary)] text-[var(--text-secondary)] rounded-xl font-semibold text-xs hover:bg-[var(--bg-accent)]"
 >
 Cancel
 </button>
 <button
 type="submit"
 disabled={loading}
 className="flex-1 px-4 py-4 bg-[var(--accent)] hover:bg-purple-700 text-white rounded-xl font-semibold text-xs disabled:opacity-50"
 >
 {loading ? 'Submitting...' : 'Submit for Verification'}
 </button>
 </div>
 </form>
 </div>
 </div>
 </div>
 )}

 {/* Details Modal */}
 {showDetailsModal && selectedVerification && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300">
 <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDetailsModal(false)}></div>

 <div className="relative bg-[var(--bg-primary)] border border-[var(--border-primary)] w-full max-w-lg max-h-[90vh] overflow-hidden rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] flex flex-col text-[var(--text-primary)]">
 {/* Header */}
 <div className="p-8 border-b border-[var(--border-primary)] flex items-center justify-between bg-[var(--bg-accent)]/20">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)]">
 <Shield size={24} />
 </div>
 <div>
 <h2 className="text-lg sm:text-xl font-medium">{selectedVerification.CredentialType} Verification Details</h2>
 <p className="text-[11px] font-semibold text-[var(--text-muted)] mt-1 italic">View blockchain verification results</p>
 </div>
 </div>
 <button onClick={() => setShowDetailsModal(false)} className="w-10 h-10 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
 <X size={20} />
 </button>
 </div>

 {/* Content */}
 <div className="p-8 overflow-y-auto">
 <div className="space-y-6">
 <div className="grid grid-cols-2 gap-4 sm:gap-6">
 <div>
 <p className="text-xs font-medium text-[var(--text-muted)]">Status</p>
 <div className="flex items-center gap-2 mt-1">
 {getStatusIcon(selectedVerification.VerificationStatus)}
 <p className={getStatusColor(selectedVerification.VerificationStatus)}>{selectedVerification.VerificationStatus}</p>
 </div>
 </div>
 <div>
 <p className="text-xs font-medium text-[var(--text-muted)]">Network</p>
 <p className="text-[var(--text-primary)] mt-1 flex items-center gap-1">
 <Globe className="w-3 h-3 text-[var(--accent)]" />
 {selectedVerification.Network || 'Ethereum'}
 </p>
 </div>
 <div>
 <p className="text-xs font-medium text-[var(--text-muted)]">Credential Type</p>
 <p className="text-[var(--text-primary)] mt-1">{selectedVerification.CredentialType}</p>
 </div>
 <div>
 <p className="text-xs font-medium text-[var(--text-muted)]">Issuing Authority</p>
 <p className="text-[var(--text-primary)] mt-1">{selectedVerification.IssuingAuthority}</p>
 </div>
 <div>
 <p className="text-xs font-medium text-[var(--text-muted)]">Submitted</p>
 <p className="text-[var(--text-primary)] mt-1">{selectedVerification.LastChecked ? new Date(selectedVerification.LastChecked).toLocaleString() : '-'}</p>
 </div>
 <div>
 <p className="text-xs font-medium text-[var(--text-muted)]">Verified</p>
 <p className="text-[var(--text-primary)] mt-1">{selectedVerification.VerifiedAt ? new Date(selectedVerification.VerifiedAt).toLocaleString() : '-'}</p>
 </div>
 </div>

 {selectedVerification.CredentialHash && (
 <div>
 <p className="text-xs font-medium text-[var(--text-muted)] mb-2">Credential Hash (SHA-256)</p>
 <p className="text-xs font-mono bg-[var(--bg-accent)] p-3 rounded-xl text-[var(--text-secondary)] break-all">
 {selectedVerification.CredentialHash}
 </p>
 </div>
 )}

 {selectedVerification.BlockchainTransactionID && (
 <div>
 <p className="text-xs font-medium text-[var(--text-muted)] mb-2">
 <Link2 className="w-3 h-3 inline mr-1" />
 Blockchain Transaction
 </p>
 <p className="text-xs font-mono bg-[var(--bg-accent)] p-3 rounded-xl text-[var(--text-secondary)] break-all">
 {selectedVerification.BlockchainTransactionID}
 </p>
 </div>
 )}

 {selectedVerification.BlockNumber && (
 <div>
 <p className="text-xs font-medium text-[var(--text-muted)]">Block Number</p>
 <p className="text-[var(--text-primary)]">{selectedVerification.BlockNumber}</p>
 </div>
 )}

 {selectedVerification.IsImmutable && (
 <div className="flex items-center gap-2 text-[var(--success)] font-semibold text-xs">
 <Lock className="w-4 h-4" />
 <span>Immutable Record</span>
 </div>
 )}

 {/* Update Status Form */}
 <div className="border-t border-[var(--border-primary)] pt-6 mt-6">
 <p className="text-xs font-medium text-[var(--text-muted)] mb-3">Update Status</p>
 <div className="flex gap-2 flex-wrap">
 {['Verified', 'Failed'].map(status => (
 <button
 key={status}
 onClick={() => updateVerificationStatus(
 // Be defensive: support multiple possible field names from the API
 selectedVerification.VerificationID || selectedVerification.verificationid || selectedVerification.id,
 { verificationStatus: status }
 )}
 disabled={selectedVerification.VerificationStatus === selectedVerification.verificationstatus || selectedVerification.VerificationStatus === status}
 className={`px-4 py-2 text-sm rounded-xl transition-colors font-semibold ${status === 'Verified'
 ? 'bg-green-900/30 text-[var(--success)] border border-green-500/20 hover:bg-green-600 hover:text-white'
 : 'bg-rose-900/30 text-[var(--danger)] border border-[var(--danger)]/20 hover:bg-[var(--danger)] hover:text-white'
 } disabled:opacity-50 disabled:cursor-not-allowed`}
 >
 {status}
 </button>
 ))}
 </div>
 </div>
 </div>

 <button
 onClick={() => setShowDetailsModal(false)}
 className="w-full mt-6 px-4 py-4 border border-[var(--border-primary)] text-[var(--text-secondary)] rounded-xl font-semibold text-xs hover:bg-[var(--bg-accent)]"
 >
 Close
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
};

export default BlockchainVerifications;