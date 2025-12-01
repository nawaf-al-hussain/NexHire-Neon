import React from 'react';
import { Users, Search, Filter, UserPlus, Sparkles as FuzzyIcon, User } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../../apiConfig';
import CandidateProfileModal from './CandidateProfileModal';
import Skeleton from '../ui/Skeleton';
import EmptyState from '../ui/EmptyState';
import { useToast } from '../../components/ui/Toast';

const TalentPool = () => {
    const { toast } = useToast();
 const [candidates, setCandidates] = React.useState([]);
 const [loading, setLoading] = React.useState(true);
 const [searchQuery, setSearchQuery] = React.useState('');
 const [isSearching, setIsSearching] = React.useState(false);
 const [useFuzzySearch, setUseFuzzySearch] = React.useState(false);
 const [selectedCandidates, setSelectedCandidates] = React.useState([]);
 const [inviteModal, setInviteModal] = React.useState(null);
 const [jobs, setJobs] = React.useState([]);
 const [inviting, setInviting] = React.useState(false);
 const [profileModal, setProfileModal] = React.useState({ isOpen: false, candidateId: null, candidateName: '' });

 const fetchPool = React.useCallback(async () => {
 setLoading(true);
 try {
 const res = await axios.get(`${API_BASE}/recruiters/talent-pool`);
 setCandidates(res.data);
 } catch (err) {
 console.error("Talent Pool Error:", err);
 } finally {
 setLoading(false);
 }
 }, []);

 React.useEffect(() => {
 fetchPool();
 }, [fetchPool]);

 const handleSearch = async (e) => {
 const val = e.target.value;
 setSearchQuery(val);

 // Clear search if empty
 if (val.length === 0) {
 fetchPool();
 return;
 }

 // Wait for at least 2 characters
 if (val.length < 2) {
 return;
 }

 setIsSearching(true);
 try {
 const res = await axios.post(`${API_BASE}/recruiters/search`, {
 name: val,
 useFuzzy: useFuzzySearch
 });
 setCandidates(res.data || []);
 } catch (err) {
 console.error("Search Error:", err);
 // On error, fall back to showing all candidates
 fetchPool();
 } finally {
 setIsSearching(false);
 }
 };

 const handleFuzzyToggle = async () => {
 const newFuzzyState = !useFuzzySearch;
 setUseFuzzySearch(newFuzzyState);

 // Re-run search if there's a search query
 if (searchQuery.length >= 2) {
 setIsSearching(true);
 try {
 const res = await axios.post(`${API_BASE}/recruiters/search`, {
 name: searchQuery,
 useFuzzy: newFuzzyState
 });
 setCandidates(res.data || []);
 } catch (err) {
 console.error("Search Error:", err);
 fetchPool();
 } finally {
 setIsSearching(false);
 }
 }
 };

 const getRiskColor = (risk) => {
 switch (risk) {
 case 'High': return 'text-[var(--danger)] bg-[var(--danger)]/10 border-[var(--danger)]/20';
 case 'Medium': return 'text-[var(--warning)] bg-[var(--warning)]/10 border-amber-500/20';
 default: return 'text-[var(--success)] bg-[var(--success)]/10 border-emerald-500/20';
 }
 };

 const toggleSelection = (candidateID) => {
 setSelectedCandidates(prev =>
 prev.includes(candidateID)
 ? prev.filter(id => id !== candidateID)
 : [...prev, candidateID]
 );
 };

 const fetchJobs = async () => {
 try {
 const res = await axios.get(`${API_BASE}/jobs`);
 setJobs(res.data);
 } catch (err) {
 console.error("Fetch Jobs Error:", err);
 }
 };

 const openInviteModal = () => {
 if (selectedCandidates.length === 0) {
 toast("Please select candidates to invite.");
 return;
 }
 fetchJobs();
 setInviteModal({ jobID: '' });
 };

 const handleInvite = async () => {
 if (!inviteModal?.jobID) {
 toast("Please select a job.");
 return;
 }
 try {
 setInviting(true);
 const res = await axios.post(`${API_BASE}/recruiters/talent-pool/invite`, {
 candidateIDs: selectedCandidates,
 jobID: parseInt(inviteModal.jobID)
 });
 toast(res.data.message);
 setInviteModal(null);
 setSelectedCandidates([]);
 } catch (err) {
 console.error("Invite Error:", err);
 toast("Failed to invite: " + (err.response?.data?.error || err.message));
 } finally {
 setInviting(false);
 }
 };

 return (
 <div className="space-y-5 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
 {/* Gradient Header */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8 border border-[var(--accent)]/20">
 <div className="flex items-center gap-4">
 <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
 <Users size={28} />
 </div>
 <div>
 <h2 className="text-lg sm:text-xl font-medium">Talent Pool</h2>
 <p className="text-[11px] font-medium text-[var(--text-muted)]">Browse and manage candidate profiles</p>
 </div>
 </div>
 </div>

 {/* Invite Button */}
 {selectedCandidates.length > 0 && (
 <div className="flex items-center justify-between p-4 bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-2xl">
 <span className="text-xs font-semibold">{selectedCandidates.length} candidate(s) selected</span>
 <button
 onClick={openInviteModal}
 className="px-6 py-3 bg-[var(--accent)] text-white rounded-2xl font-semibold text-xs flex items-center gap-2 hover:bg-[var(--accent-hover)] transition-all"
 >
 <UserPlus size={16} /> Invite to Job
 </button>
 </div>
 )}

 {/* Search & Filters */}
 <div className="flex flex-col md:flex-row gap-6 items-center">
 <div className="relative flex-1 group w-full">
 <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" size={20} />
 <input
 type="text"
 placeholder={useFuzzySearch ? "Fuzzy Search (e.g. 'Jhon' finds 'John')..." : "Search candidates..."}
 value={searchQuery}
 onChange={handleSearch}
 className="w-full bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl px-6 py-4 text-sm font-normal focus:outline-none focus:border-[var(--accent)] transition-all"
 />
 {isSearching && (
 <div className="absolute right-6 top-1/2 -translate-y-1/2">
 <Loader2 className="w-5 h-5 text-[var(--accent)] animate-spin" />
 </div>
 )}
 </div>
 <button
 onClick={handleFuzzyToggle}
 className={`p-4 border rounded-2xl transition-all flex items-center gap-2 ${useFuzzySearch ? 'bg-[var(--accent)]/10 border-purple-500/50 text-[var(--accent)]' : 'bg-[var(--bg-accent)] border-[var(--border-primary)] hover:border-[var(--accent)]/50'}`}
 title={useFuzzySearch ? "Fuzzy search ON - Click for regular search" : "Click for Fuzzy search"}
 >
 <FuzzyIcon size={18} />
 </button>
 <button className="p-4 bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl hover:border-[var(--accent)]/50 transition-all">
 <Filter size={18} className="text-[var(--text-muted)]" />
 </button>
 </div>

 {/* Talent Table */}
 {loading ? (
 <div
 style={{
 backgroundColor: 'var(--bg-elevated)',
 border: '1px solid var(--border-primary)',
 borderRadius: 'var(--radius-xl)',
 padding: '1.5rem',
 boxShadow: 'var(--shadow-sm)',
 }}
 >
 <Skeleton height="2rem" width="33%" className="mb-6" />
 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
 {[1, 2, 3, 4, 5].map(i => (
 <Skeleton key={i} height="4rem" rounded="var(--radius-md)" />
 ))}
 </div>
 </div>
 ) : candidates.length === 0 ? (
 <div
 style={{
 backgroundColor: 'var(--bg-elevated)',
 border: '1px solid var(--border-primary)',
 borderRadius: 'var(--radius-xl)',
 padding: '2rem',
 boxShadow: 'var(--shadow-sm)',
 }}
 >
 <EmptyState
 icon={Users}
 title={searchQuery || locationFilter ? 'No candidates match your search' : 'No candidates yet'}
 description={searchQuery || locationFilter
 ? 'Try different keywords or clear your filters.'
 : 'Active candidates will appear here once they sign up.'}
 />
 </div>
 ) : (
 <div
 style={{
 backgroundColor: 'var(--bg-elevated)',
 border: '1px solid var(--border-primary)',
 borderRadius: 'var(--radius-xl)',
 padding: '1.5rem',
 boxShadow: 'var(--shadow-sm)',
 }}
 >
 <h3 className="text-lg font-medium mb-6">Talent Pool ({candidates.length} candidates)</h3>
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="text-[11px] font-medium text-[var(--text-muted)] border-b border-[var(--border-primary)]">
 <th scope="col" className="text-left pb-4 pr-4 w-12">
 <input type="checkbox" className="w-4 h-4 accent-indigo-500" />
 </th>
 <th scope="col" className="text-left pb-4 pr-4">Candidate</th>
 <th scope="col" className="text-left pb-4 pr-4">Location</th>
 <th scope="col" className="text-left pb-4 pr-4">Experience</th>
 <th scope="col" className="text-left pb-4 pr-4">Skills</th>
 <th scope="col" className="text-left pb-4 pr-4">Resume</th>
 <th scope="col" className="text-left pb-4 pr-4">Risk</th>
 <th scope="col" className="text-left pb-4">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-[var(--border-primary)]">
 {candidates.map((candidate) => (
 <tr key={candidate.CandidateID} className="group hover:bg-[var(--bg-accent)] transition-colors cursor-pointer" onClick={() => setProfileModal({ isOpen: true, candidateId: candidate.CandidateID, candidateName: candidate.FullName })}>
 <td className="py-4 pr-4" onClick={(e) => e.stopPropagation()}>
 <input
 type="checkbox"
 checked={selectedCandidates.includes(candidate.CandidateID)}
 onChange={() => toggleSelection(candidate.CandidateID)}
 className="w-4 h-4 accent-indigo-500"
 />
 </td>
 <td className="py-4 pr-4">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
 <User size={20} />
 </div>
 <span className="text-sm font-semibold group-hover:text-[var(--accent)] transition-colors">{candidate.FullName}</span>
 </div>
 </td>
 <td className="py-4 pr-4">
 <span className="text-xs font-bold text-[var(--text-secondary)]">{candidate.Location || 'Remote'}</span>
 </td>
 <td className="py-4 pr-4">
 <span className="text-xs font-bold text-[var(--text-secondary)]">{candidate.YearsOfExperience || 0} years</span>
 </td>
 <td className="py-4 pr-4">
 <div className="flex flex-wrap gap-1">
 {candidate.Skills ? (candidate.Skills || "").split(', ').slice(0, 3).map((skill, i) => (
 <span key={i} className="px-2 py-1 bg-[var(--accent)]/10 text-[var(--accent)] rounded-lg text-[11px] font-medium">
 {skill.trim()}
 </span>
 )) : (
 <span className="text-[11px] text-[var(--text-muted)]">-</span>
 )}
 {candidate.Skills && (candidate.Skills || "").split(', ').length > 3 && (
 <span className="px-2 py-1 text-[11px] font-bold text-[var(--accent)]">+{(candidate.Skills || "").split(', ').length - 3}</span>
 )}
 </div>
 </td>
 <td className="py-4 pr-4">
 <div className="flex items-center gap-2">
 <div className="w-16 h-2 bg-[var(--bg-accent)] rounded-full overflow-hidden">
 <div
 className="h-full bg-[var(--accent)] rounded-full"
 style={{ width: `${candidate.ResumeScore ? candidate.ResumeScore : 0}%` }}
 ></div>
 </div>
 <span className="text-[11px] font-semibold text-[var(--accent)]">{candidate.ResumeScore ? candidate.ResumeScore + '%' : 'N/A'}</span>
 </div>
 </td>
 <td className="py-4 pr-4">
 <span className={`px-3 py-1 rounded-full text-[11px] font-medium border ${getRiskColor(candidate.GhostingRisk)}`}>
 {candidate.GhostingRisk || 'Low'}
 </span>
 </td>
 <td className="py-4" onClick={(e) => e.stopPropagation()}>
 <button className="px-4 py-2 bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-xl text-[11px] font-medium hover:bg-[var(--accent-hover)] hover:border-[var(--accent)] hover:text-white transition-all">
 View
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 )}

 {/* Invite Modal */}
 {inviteModal && (
 <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
 <div className="bg-[var(--bg-secondary)] rounded-[var(--radius-xl)] p-8 w-full max-w-md border border-[var(--border-primary)]">
 <h3 className="text-lg font-medium mb-2">Invite Candidates</h3>
 <p className="text-xs font-bold text-[var(--text-muted)] mb-6">
 {selectedCandidates.length} candidate(s) selected
 </p>
 <div className="mb-6">
 <label className="text-[11px] font-medium text-[var(--text-muted)] block mb-2">Select Job</label>
 <select
 value={inviteModal.jobID}
 onChange={(e) => setInviteModal({ ...inviteModal, jobID: e.target.value })}
 className="w-full bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-[var(--accent)]"
 >
 <option value="">Select a job...</option>
 {jobs.map(job => (
 <option key={job.JobID} value={job.JobID}>{job.JobTitle}</option>
 ))}
 </select>
 </div>
 <div className="flex gap-3">
 <button
 onClick={() => setInviteModal(null)}
 className="flex-1 px-4 py-3 bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl font-semibold text-xs hover:bg-[var(--accent)]/10 transition-all"
 >
 Cancel
 </button>
 <button
 onClick={handleInvite}
 disabled={inviting}
 className="flex-1 px-4 py-3 bg-[var(--accent)] text-white rounded-2xl font-semibold text-xs hover:bg-[var(--accent-hover)] transition-all disabled:opacity-50"
 >
 {inviting ? 'Inviting...' : 'Send Invites'}
 </button>
 </div>
 </div>
 </div>
 )}

 {/* Candidate Profile Modal */}
 <CandidateProfileModal
 isOpen={profileModal.isOpen}
 onClose={() => setProfileModal({ isOpen: false, candidateId: null, candidateName: '' })}
 candidateId={profileModal.candidateId}
 candidateName={profileModal.candidateName}
 />
 </div>
 );
};

export default TalentPool;
