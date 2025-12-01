import React, { useState } from 'react';
import { X, AlertTriangle, MessageSquare } from 'lucide-react';
import { useToast } from '../../components/ui/Toast';

const REJECTION_REASONS = [
 'Insufficient Experience',
 'Skills Mismatch',
 'Culture Fit',
 'Salary Expectations',
 'Location Mismatch',
 'Failed Background Check',
 'No-show for Interview',
 'Poor Communication Skills',
 'Overqualified',
 'Position Filled by Another Candidate',
 'Other'
];

const RejectionReasonModal = ({ isOpen, onClose, onConfirm, candidateName }) => {
    const { toast } = useToast();
 const [selectedReason, setSelectedReason] = useState('');
 const [customReason, setCustomReason] = useState('');
 const [loading, setLoading] = useState(false);

 if (!isOpen) return null;

 const handleConfirm = async () => {
 const reason = selectedReason === 'Other' ? customReason : selectedReason;
 if (!reason.trim()) {
 toast('Please select or enter a rejection reason.');
 return;
 }
 setLoading(true);
 try {
 await onConfirm(reason);
 setSelectedReason('');
 setCustomReason('');
 onClose();
 } catch (err) {
 toast('Failed to reject application. Please try again.');
 } finally {
 setLoading(false);
 }
 };

 const handleClose = () => {
 setSelectedReason('');
 setCustomReason('');
 onClose();
 };

 return (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300">
 <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose}></div>

 <div className="relative bg-[var(--bg-secondary)] border border-[var(--border-primary)] w-full max-w-lg rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] overflow-hidden animate-in zoom-in duration-300 text-[var(--text-primary)]">
 {/* Header */}
 <div className="p-8 border-b border-[var(--border-primary)] bg-[var(--danger)]/5">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-2xl bg-[var(--danger)]/10 border border-[var(--danger)]/20 flex items-center justify-center">
 <AlertTriangle className="text-[var(--danger)]" size={24} />
 </div>
 <div>
 <h2 className="text-lg font-semibold tracking-tight">Reject Application</h2>
 <p className="text-[11px] font-bold text-[var(--text-muted)] mt-1">
 {candidateName || 'Candidate'}
 </p>
 </div>
 </div>
 <button
 onClick={handleClose}
 className="w-10 h-10 rounded-xl bg-[var(--bg-accent)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors"
 >
 <X size={20} />
 </button>
 </div>
 </div>

 {/* Content */}
 <div className="p-8 space-y-6">
 <div>
 <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-3">
 Select Rejection Reason
 </label>
 <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
 {REJECTION_REASONS.map((reason) => (
 <button
 key={reason}
 onClick={() => setSelectedReason(reason)}
 className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${selectedReason === reason
 ? 'bg-[var(--danger)]/10 border-rose-500/30 text-[var(--danger)]'
 : 'bg-[var(--bg-accent)] border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-[var(--danger)]/20'
 }`}
 >
 <span className="text-xs font-bold">{reason}</span>
 </button>
 ))}
 </div>
 </div>

 {selectedReason === 'Other' && (
 <div className="animate-in slide-in-from-top-4 duration-200">
 <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-3">
 <MessageSquare size={12} className="inline mr-2" />
 Enter Custom Reason
 </label>
 <textarea
 value={customReason}
 onChange={(e) => setCustomReason(e.target.value)}
 placeholder="Please provide a specific reason for rejection..."
 className="w-full h-24 px-4 py-3 bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-xl text-sm font-medium text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-rose-500/50 resize-none"
 />
 </div>
 )}
 </div>

 {/* Footer */}
 <div className="p-8 border-t border-[var(--border-primary)] bg-[var(--bg-accent)]/20 flex items-center justify-end gap-4">
 <button
 onClick={handleClose}
 className="px-6 py-3 bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-xl text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
 >
 Cancel
 </button>
 <button
 onClick={handleConfirm}
 disabled={loading || !selectedReason || (selectedReason === 'Other' && !customReason.trim())}
 className="px-6 py-3 bg-[var(--danger)] text-white rounded-xl text-xs font-medium hover:bg-[var(--danger)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
 >
 {loading ? 'Processing...' : 'Confirm Rejection'}
 </button>
 </div>
 </div>
 </div>
 );
};

export default RejectionReasonModal;
