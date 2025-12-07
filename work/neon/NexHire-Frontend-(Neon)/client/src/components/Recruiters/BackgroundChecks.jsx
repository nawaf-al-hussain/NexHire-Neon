import { useState, useEffect } from 'react';
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
 AlertTriangle,
 FileText,
 RefreshCw,
 Filter,
 Download,
 Eye,
 Loader2,
 X
} from 'lucide-react';

const BackgroundChecks = () => {
 const { user } = useAuth();
 const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' or 'candidate'
 const [dashboardData, setDashboardData] = useState(null);
 const [candidateChecks, setCandidateChecks] = useState([]);
 const [selectedCandidate, setSelectedCandidate] = useState(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);

 // Filters
 const [checkTypeFilter, setCheckTypeFilter] = useState('');
 const [statusFilter, setStatusFilter] = useState('');
 const [searchName, setSearchName] = useState('');

 // Modal states
 const [showInitiateModal, setShowInitiateModal] = useState(false);
 const [showDetailsModal, setShowDetailsModal] = useState(false);
 const [selectedCheck, setSelectedCheck] = useState(null);
 const [candidates, setCandidates] = useState([]);

 // Form state for initiating new check
 const [newCheck, setNewCheck] = useState({
 candidateId: '',
 checkType: 'Criminal',
 vendor: '',
 notes: ''
 });

 const checkTypes = ['Criminal', 'Education', 'Employment', 'Credit', 'Reference', 'Drug'];
 const statuses = ['Requested', 'InProgress', 'Completed', 'Failed', 'Cleared', 'Adverse'];
 const resultOptions = ['Clear', 'Consider', 'Adverse', 'Inconclusive'];

 useEffect(() => {
 fetchDashboardData();
 fetchCandidates();
 }, []);

 const fetchDashboardData = async () => {
 try {
 setLoading(true);
 const res = await axios.get(`${API_BASE}/recruiters/background-checks-dashboard`);
 setDashboardData(res.data);
 } catch (err) {
 console.error("Dashboard fetch error:", err.message);
 setError("Failed to load dashboard data");
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

 const fetchCandidateChecks = async (candidateId) => {
 try {
 setLoading(true);
 const params = new URLSearchParams();
 if (checkTypeFilter) params.append('checkType', checkTypeFilter);
 if (statusFilter) params.append('status', statusFilter);

 const res = await axios.get(
 `${API_BASE}/recruiters/background-checks/${candidateId}?${params}`);
 setCandidateChecks(res.data);
 setSelectedCandidate(candidates.find(c => c.CandidateID === parseInt(candidateId)));
 setActiveView('candidate');
 } catch (err) {
 console.error("Checks fetch error:", err.message);
 setError("Failed to load candidate checks");
 } finally {
 setLoading(false);
 }
 };

 const initiateCheck = async (e) => {
 e.preventDefault();
 try {
 setLoading(true);
 await axios.post(
 `${API_BASE}/recruiters/background-checks`,
 newCheck);
 setShowInitiateModal(false);
 setNewCheck({ candidateId: '', checkType: 'Criminal', vendor: '', notes: '' });
 fetchDashboardData();
 if (selectedCandidate) {
 fetchCandidateChecks(selectedCandidate.CandidateID);
 }
 } catch (err) {
 console.error("Initiate error:", err.message);
 setError(err.response?.data?.error || "Failed to initiate background check");
 } finally {
 setLoading(false);
 }
 };

 const updateCheckStatus = async (checkId, updateData) => {
 try {
 setLoading(true);
 await axios.put(
 `${API_BASE}/recruiters/background-checks/${checkId}`,
 updateData);
 setShowDetailsModal(false);
 fetchDashboardData();
 if (selectedCandidate) {
 fetchCandidateChecks(selectedCandidate.CandidateID);
 }
 } catch (err) {
 console.error("Update error:", err.message);
 setError("Failed to update background check");
 } finally {
 setLoading(false);
 }
 };

 const getStatusColor = (status) => {
 switch (status) {
 case 'Cleared':
 case 'Clear':
 return 'text-[var(--success)] bg-[var(--success)]/10 border-emerald-500/20';
 case 'Completed':
 case 'completed':
 return 'text-[var(--accent)] bg-[var(--accent)]/10 border-[var(--accent)]/20';
 case 'InProgress':
 return 'text-[var(--warning)] bg-[var(--warning)]/10 border-amber-500/20';
 case 'Requested':
 return 'text-[var(--text-muted)] bg-gray-500/10 border-gray-500/20';
 case 'Failed':
 case 'Adverse':
 return 'text-[var(--danger)] bg-[var(--danger)]/10 border-[var(--danger)]/20';
 default:
 return 'text-[var(--text-muted)] bg-gray-500/10 border-gray-500/20';
 }
 };

 const getStatusIcon = (status) => {
 switch (status) {
 case 'Cleared':
 case 'Clear':
 return <CheckCircle className="w-4 h-4 text-[var(--success)]" />;
 case 'Failed':
 case 'Adverse':
 return <XCircle className="w-4 h-4 text-[var(--danger)]" />;
 case 'InProgress':
 return <Clock className="w-4 h-4 text-[var(--warning)]" />;
 default:
 return <Clock className="w-4 h-4 text-[var(--text-muted)]" />;
 }
 };

 const getRiskBadge = (level) => {
 if (!level) return null;
 const colors = {
 1: 'bg-green-900 text-green-300',
 2: 'bg-yellow-900 text-yellow-300',
 3: 'bg-orange-900 text-orange-300',
 4: 'bg-red-900 text-red-300',
 5: 'bg-red-950 text-red-200 border border-red-500'
 };
 return (
 <span className={`px-2 py-0.5 rounded text-xs font-bold ${colors[level] || colors[1]}`}>
 Risk: {level}/5
 </span>
 );
 };

 if (loading && !dashboardData) {
 return (
 <div className="flex items-center justify-center py-20">
 <RefreshCw className="w-8 h-8 text-[var(--accent)] animate-spin" />
 <span className="ml-3 text-sm font-medium text-[var(--text-muted)]">Loading Background Checks...</span>
 </div>
 );
 }

 return (
 <div className="space-y-6 sm:space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
 {/* Header */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8 border border-[var(--accent)]/20">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-4">
 <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
 <Shield size={28} />
 </div>
 <div>
 <h2 className="text-lg sm:text-xl font-medium">Background Checks</h2>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Manage candidate background verification</p>
 </div>
 </div>
 <button
 onClick={() => setShowInitiateModal(true)}
 className="px-8 py-4 bg-[var(--accent)] text-white rounded-2xl font-semibold text-xs hover:bg-[var(--accent-hover)] transition-all flex items-center gap-2"
 >
 <Plus size={16} />
 Initiate Check
 </button>
 </div>
 </div>

 {error && (
 <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-[var(--danger)]">
 {error}
 </div>
 )}

 {/* Dashboard View */}
 {activeView === 'dashboard' && dashboardData && (
 <div className="space-y-6">
 {/* Summary Cards - Gold Standard */}
 <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-[var(--accent)]/20">
 <div className="flex items-center gap-3 mb-2">
 <Shield size={18} className="text-[var(--accent)]" />
 <span className="text-[11px] font-medium text-[var(--accent)]">Total Checks</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">{dashboardData.summary?.TotalChecks || 0}</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">All time</p>
 </div>

 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-amber-500/20">
 <div className="flex items-center gap-3 mb-2">
 <Clock size={18} className="text-[var(--warning)]" />
 <span className="text-[11px] font-medium text-[var(--warning)]">Pending</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold text-[var(--warning)]">{(dashboardData.summary?.Pending || 0) + (dashboardData.summary?.InProgress || 0)}</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">In progress</p>
 </div>

 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-emerald-500/20">
 <div className="flex items-center gap-3 mb-2">
 <CheckCircle size={18} className="text-[var(--success)]" />
 <span className="text-[11px] font-medium text-[var(--success)]">Cleared</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold text-[var(--success)]">{dashboardData.summary?.Cleared || 0}</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Successfully cleared</p>
 </div>

 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-[var(--accent)]/20">
 <div className="flex items-center gap-3 mb-2">
 <FileText size={18} className="text-[var(--accent)]" />
 <span className="text-[11px] font-medium text-[var(--accent)]">Total Cost</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">${Number(dashboardData.summary?.TotalCost || 0).toFixed(0)}</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Verification expenses</p>
 </div>
 </div>

 {/* Stats by Type */}
 <div className="glass-card rounded-[var(--radius-xl)] p-10">
 <div className="flex items-center gap-3 mb-8">
 <Shield className="w-5 h-5 text-[var(--accent)]" />
 <h3 className="text-lg font-medium">Checks by Type</h3>
 </div>
 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
 {dashboardData.byType?.map((type) => (
 <div key={type.CheckType} className="text-center p-4 bg-[var(--bg-secondary)] rounded-xl hover:bg-[var(--accent)]/5 transition-colors">
 <p className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">{type.Count}</p>
 <p className="text-xs text-[var(--text-muted)] uppercase">{type.CheckType}</p>
 <p className="text-xs text-[var(--success)]">{type.Completed} completed</p>
 </div>
 ))}
 </div>
 </div>

 {/* Recent Checks Table */}
 <div className="glass-card rounded-[var(--radius-xl)] p-10">
 <div className="flex items-center justify-between mb-8">
 <div className="flex items-center gap-3">
 <Shield className="w-5 h-5 text-[var(--accent)]" />
 <h3 className="text-lg font-medium">Recent Checks</h3>
 </div>
 <div className="flex gap-2">
 <div className="relative">
 <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
 <input
 type="text"
 placeholder="Search candidate..."
 value={searchName}
 onChange={(e) => setSearchName(e.target.value)}
 className="pl-9 pr-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)]"
 />
 </div>
 </div>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="text-[11px] font-medium text-[var(--text-muted)] border-b border-[var(--border-primary)]">
 <th scope="col" className="text-left pb-4 pr-4">Candidate</th>
 <th scope="col" className="text-left pb-4 pr-4">Type</th>
 <th scope="col" className="text-left pb-4 pr-4">Status</th>
 <th scope="col" className="text-left pb-4 pr-4">Result</th>
 <th scope="col" className="text-left pb-4 pr-4">Risk</th>
 <th scope="col" className="text-left pb-4 pr-4">Initiated</th>
 <th scope="col" className="text-left pb-4">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-[var(--border-primary)]">
 {dashboardData.recent
 ?.filter(c => !searchName || c.FullName?.toLowerCase().includes(searchName.toLowerCase()))
 .map((check) => (
 <tr key={check.CheckID} className="group hover:bg-[var(--bg-accent)] transition-colors">
 <td className="py-4 pr-4">
 <button
 onClick={() => fetchCandidateChecks(check.CandidateID)}
 className="text-sm font-semibold hover:text-[var(--accent)] transition-colors"
 >
 {check.FullName}
 </button>
 </td>
 <td className="py-4 pr-4 text-xs font-bold text-[var(--text-secondary)]">{check.CheckType}</td>
 <td className="py-4 pr-4">
 <span className={`px-4 py-2 rounded-xl text-[11px] font-medium border ${getStatusColor(check.Status)}`}>
 {check.Status}
 </span>
 </td>
 <td className="py-4 pr-4">
 {check.Result ? (
 <span className={`px-3 py-1 rounded-lg text-[11px] font-semibold ${check.Result === 'Clear' ? 'bg-[var(--success)]/10 text-[var(--success)]' :
 check.Result === 'Adverse' ? 'bg-[var(--danger)]/10 text-[var(--danger)]' :
 'bg-[var(--warning)]/10 text-[var(--warning)]'
 }`}>
 {check.Result}
 </span>
 ) : <span className="text-[var(--text-muted)]">—</span>}
 </td>
 <td className="py-4 pr-4">{getRiskBadge(check.RiskLevel)}</td>
 <td className="py-4 pr-4 text-xs font-bold text-[var(--text-muted)]">
 {check.InitiatedAt ? new Date(check.InitiatedAt).toLocaleDateString() : '—'}
 </td>
 <td className="py-4">
 <button
 onClick={() => {
 setSelectedCheck(check);
 setShowDetailsModal(true);
 }}
 className="w-10 h-10 rounded-xl bg-[var(--bg-accent)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all"
 >
 <Eye size={18} />
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 )}

 {/* Candidate Detail View */}
 {activeView === 'candidate' && selectedCandidate && (
 <div className="space-y-6">
 <div className="flex items-center gap-4">
 <button
 onClick={() => setActiveView('dashboard')}
 className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg"
 >
 <RefreshCw className="w-5 h-5 text-[var(--text-muted)] rotate-180" />
 </button>
 <div>
 <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">{selectedCandidate.FullName}</h3>
 <p className="text-sm text-[var(--text-muted)]">Background Check History</p>
 </div>
 </div>

 {/* Filters */}
 <div className="flex gap-4 flex-wrap">
 <select
 value={checkTypeFilter}
 onChange={(e) => {
 setCheckTypeFilter(e.target.value);
 fetchCandidateChecks(selectedCandidate.CandidateID);
 }}
 className="px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)]"
 >
 <option value="">All Types</option>
 {checkTypes.map(t => <option key={t} value={t}>{t}</option>)}
 </select>
 <select
 value={statusFilter}
 onChange={(e) => {
 setStatusFilter(e.target.value);
 fetchCandidateChecks(selectedCandidate.CandidateID);
 }}
 className="px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)]"
 >
 <option value="">All Statuses</option>
 {statuses.map(s => <option key={s} value={s}>{s}</option>)}
 </select>
 </div>

 {/* Candidate Checks List */}
 <div className="space-y-4">
 {candidateChecks.length === 0 ? (
 <div className="glass-card rounded-2xl p-8 text-center">
 <Shield className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
 <p className="text-[var(--text-muted)]">No background checks found for this candidate.</p>
 <button
 onClick={() => {
 setNewCheck({ ...newCheck, candidateId: selectedCandidate.CandidateID });
 setShowInitiateModal(true);
 }}
 className="mt-4 text-[var(--accent)] hover:text-blue-300"
 >
 Initiate a new check →
 </button>
 </div>
 ) : (
 candidateChecks.map((check) => (
 <div key={check.CheckID} className="glass-card rounded-2xl p-6">
 <div className="flex items-start justify-between">
 <div className="flex items-start gap-4">
 <div className="p-3 bg-[var(--bg-secondary)] rounded-xl">
 {getStatusIcon(check.Status)}
 </div>
 <div>
 <div className="flex items-center gap-3">
 <h4 className="text-lg font-bold text-[var(--text-primary)]">{check.CheckType} Check</h4>
 <span className={getStatusColor(check.Status)}>{check.Status}</span>
 </div>
 <div className="flex items-center gap-4 mt-2 text-sm text-[var(--text-muted)]">
 <span>Vendor: {check.Vendor}</span>
 <span>•</span>
 <span>ID: {check.RequestID}</span>
 <span>•</span>
 <span>Initiated: {check.InitiatedAt ? new Date(check.InitiatedAt).toLocaleDateString() : '—'}</span>
 </div>
 </div>
 </div>
 <div className="flex items-center gap-4">
 {check.Result && (
 <div className="text-right">
 <p className="text-xs text-[var(--text-muted)] uppercase">Result</p>
 <p className={`font-bold ${check.Result === 'Clear' ? 'text-[var(--success)]' : check.Result === 'Adverse' ? 'text-[var(--danger)]' : 'text-yellow-400'}`}>
 {check.Result}
 </p>
 </div>
 )}
 {getRiskBadge(check.RiskLevel)}
 <button
 onClick={() => {
 setSelectedCheck(check);
 setShowDetailsModal(true);
 }}
 className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg"
 >
 <Eye className="w-5 h-5 text-[var(--text-muted)]" />
 </button>
 </div>
 </div>

 {check.Findings && (
 <div className="mt-4 p-4 bg-[var(--bg-secondary)] rounded-xl">
 <p className="text-xs font-medium text-[var(--text-muted)] mb-2">Findings</p>
 <p className="text-sm text-[var(--text-secondary)]">{check.Findings}</p>
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
 <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center">
 <Shield className="text-[var(--accent)]" size={24} />
 </div>
 <div>
 <h2 className="text-lg sm:text-xl font-semibold tracking-tight">Initiate Background Check</h2>
 <p className="text-[11px] font-semibold text-[var(--text-muted)] mt-1 italic">Select candidate and check type</p>
 </div>
 </div>
 <button onClick={() => setShowInitiateModal(false)} className="w-10 h-10 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
 <X size={20} />
 </button>
 </div>

 <form onSubmit={initiateCheck} className="flex-1 overflow-y-auto p-10 space-y-5 sm:space-y-8">
 <div>
 <label className="block text-[11px] font-semibold text-[var(--text-muted)] ml-1 mb-2">
 Candidate
 </label>
 <select
 value={newCheck.candidateId}
 onChange={(e) => setNewCheck({ ...newCheck, candidateId: e.target.value })}
 required
 className="w-full bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl py-4 px-6 text-sm text-[var(--text-primary)] outline-none transition-all font-bold"
 >
 <option value="">Select candidate...</option>
 {candidates.map(c => (
 <option key={c.CandidateID} value={c.CandidateID}>{c.FullName}</option>
 ))}
 </select>
 </div>

 <div>
 <label className="block text-[11px] font-semibold text-[var(--text-muted)] ml-1 mb-2">
 Check Type
 </label>
 <select
 value={newCheck.checkType}
 onChange={(e) => setNewCheck({ ...newCheck, checkType: e.target.value })}
 className="w-full bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl py-4 px-6 text-sm text-[var(--text-primary)] outline-none transition-all font-bold"
 >
 {checkTypes.map(t => (
 <option key={t} value={t}>{t}</option>
 ))}
 </select>
 </div>

 <div>
 <label className="block text-[11px] font-semibold text-[var(--text-muted)] ml-1 mb-2">
 Vendor (optional)
 </label>
 <input
 type="text"
 value={newCheck.vendor}
 onChange={(e) => setNewCheck({ ...newCheck, vendor: e.target.value })}
 placeholder="e.g., Checkr, HireRight, Internal"
 className="w-full bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl py-4 px-6 text-sm text-[var(--text-primary)] outline-none transition-all placeholder:text-[var(--text-muted)] font-bold"
 />
 </div>

 <div>
 <label className="block text-[11px] font-semibold text-[var(--text-muted)] ml-1 mb-2">
 Notes
 </label>
 <textarea
 value={newCheck.notes}
 onChange={(e) => setNewCheck({ ...newCheck, notes: e.target.value })}
 rows={3}
 className="w-full bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl py-4 px-6 text-sm text-[var(--text-primary)] outline-none transition-all placeholder:text-[var(--text-muted)] font-bold"
 />
 </div>

 <div className="flex gap-4 pt-4">
 <button
 type="button"
 onClick={() => setShowInitiateModal(false)}
 className="flex-1 px-4 py-4 border border-[var(--border-primary)] text-[var(--text-secondary)] rounded-2xl font-semibold text-xs hover:bg-[var(--bg-accent)] transition-colors"
 >
 Cancel
 </button>
 <button
 type="submit"
 disabled={loading}
 className="flex-1 px-4 py-4 bg-[var(--accent)] hover:bg-blue-700 text-white rounded-2xl font-semibold text-xs disabled:opacity-50 transition-colors"
 >
 {loading ? 'Initiating...' : 'Initiate Check'}
 </button>
 </div>
 </form>
 </div>
 </div>
 )}

 {/* Details Modal */}
 {showDetailsModal && selectedCheck && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300">
 <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDetailsModal(false)}></div>

 <div className="relative bg-[var(--bg-primary)] border border-[var(--border-primary)] w-full max-w-lg max-h-[90vh] overflow-hidden rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] flex flex-col text-[var(--text-primary)]">
 {/* Header */}
 <div className="p-8 border-b border-[var(--border-primary)] flex items-center justify-between bg-[var(--bg-accent)]/20">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center">
 <Shield className="text-[var(--accent)]" size={24} />
 </div>
 <div>
 <h2 className="text-lg sm:text-xl font-semibold tracking-tight">{selectedCheck.CheckType} Check Details</h2>
 <p className="text-[11px] font-semibold text-[var(--text-muted)] mt-1 italic">View verification results</p>
 </div>
 </div>
 <button onClick={() => setShowDetailsModal(false)} className="w-10 h-10 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
 <X size={20} />
 </button>
 </div>

 <div className="flex-1 overflow-y-auto p-10 space-y-5 sm:space-y-8">
 <div className="grid grid-cols-2 gap-4 sm:gap-6">
 <div>
 <p className="text-[11px] font-medium text-[var(--text-muted)]">Status</p>
 <p className={`font-bold mt-1 ${selectedCheck.Status === 'Cleared' ? 'text-[var(--success)]' : selectedCheck.Status === 'InProgress' ? 'text-[var(--warning)]' : selectedCheck.Status === 'Failed' || selectedCheck.Status === 'Adverse' ? 'text-[var(--danger)]' : 'text-[var(--accent)]'}`}>{selectedCheck.Status}</p>
 </div>
 <div>
 <p className="text-[11px] font-medium text-[var(--text-muted)]">Result</p>
 <p className={`font-bold mt-1 ${selectedCheck.Result === 'Clear' ? 'text-[var(--success)]' : selectedCheck.Result === 'Adverse' ? 'text-[var(--danger)]' : 'text-yellow-400'}`}>
 {selectedCheck.Result || 'Pending'}
 </p>
 </div>
 <div>
 <p className="text-[11px] font-medium text-[var(--text-muted)]">Vendor</p>
 <p className="text-[var(--text-primary)] font-bold mt-1">{selectedCheck.Vendor}</p>
 </div>
 <div>
 <p className="text-[11px] font-medium text-[var(--text-muted)]">Request ID</p>
 <p className="text-[var(--text-primary)] font-mono text-sm font-bold mt-1">{selectedCheck.RequestID}</p>
 </div>
 <div>
 <p className="text-[11px] font-medium text-[var(--text-muted)]">Initiated</p>
 <p className="text-[var(--text-primary)] font-bold mt-1">{selectedCheck.InitiatedAt ? new Date(selectedCheck.InitiatedAt).toLocaleString() : '—'}</p>
 </div>
 <div>
 <p className="text-[11px] font-medium text-[var(--text-muted)]">Completed</p>
 <p className="text-[var(--text-primary)] font-bold mt-1">{selectedCheck.CompletedAt ? new Date(selectedCheck.CompletedAt).toLocaleString() : '—'}</p>
 </div>
 {selectedCheck.Cost && (
 <div>
 <p className="text-[11px] font-medium text-[var(--text-muted)]">Cost</p>
 <p className="text-[var(--text-primary)] font-bold mt-1">${selectedCheck.Cost}</p>
 </div>
 )}
 {selectedCheck.TurnaroundDays && (
 <div>
 <p className="text-[11px] font-medium text-[var(--text-muted)]">Turnaround</p>
 <p className="text-[var(--text-primary)] font-bold mt-1">{selectedCheck.TurnaroundDays} days</p>
 </div>
 )}
 </div>

 {selectedCheck.Findings && (
 <div>
 <p className="text-[11px] font-medium text-[var(--text-muted)] mb-2">Findings</p>
 <p className="text-sm text-[var(--text-secondary)] bg-[var(--bg-accent)] p-4 rounded-2xl font-bold">
 {selectedCheck.Findings}
 </p>
 </div>
 )}

 {selectedCheck.Notes && (
 <div>
 <p className="text-[11px] font-medium text-[var(--text-muted)] mb-2">Notes</p>
 <p className="text-sm text-[var(--text-secondary)] bg-[var(--bg-accent)] p-4 rounded-2xl font-bold">
 {selectedCheck.Notes}
 </p>
 </div>
 )}

 {/* Update Status Form */}
 <div className="border-t border-[var(--border-primary)] pt-6">
 <p className="text-[11px] font-medium text-[var(--text-muted)] mb-3">Update Status</p>
 <div className="flex gap-2 flex-wrap">
 {['InProgress', 'Completed'].map(status => (
 <button
 key={status}
 onClick={() => updateCheckStatus(selectedCheck.CheckID, { status })}
 disabled={selectedCheck.Status === status}
 className="px-4 py-2 text-sm bg-[var(--bg-accent)] hover:bg-[var(--accent-hover)] hover:text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
 >
 {status}
 </button>
 ))}
 {['Clear'].map(result => (
 <button
 key={result}
 onClick={() => updateCheckStatus(selectedCheck.CheckID, { status: 'Completed', result })}
 disabled={selectedCheck.Result === result}
 className="px-4 py-2 text-sm bg-[var(--success)]/10 text-[var(--success)] border border-emerald-500/20 hover:bg-[var(--success)] hover:text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
 >
 {result}
 </button>
 ))}
 <button
 onClick={() => updateCheckStatus(selectedCheck.CheckID, { status: 'Adverse', result: 'Adverse' })}
 className="px-4 py-2 text-sm bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/20 hover:bg-[var(--danger)] hover:text-white rounded-xl font-bold transition-colors"
 >
 Adverse
 </button>
 </div>
 </div>
 </div>

 <div className="p-6 border-t border-[var(--border-primary)]">
 <button
 onClick={() => setShowDetailsModal(false)}
 className="w-full px-4 py-4 border border-[var(--border-primary)] text-[var(--text-secondary)] rounded-2xl font-semibold text-xs hover:bg-[var(--bg-accent)] transition-colors"
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

export default BackgroundChecks;
