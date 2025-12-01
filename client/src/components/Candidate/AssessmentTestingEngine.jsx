import React, { useState, useEffect } from 'react';
import { X, Clock, HelpCircle, CheckCircle, XCircle, Award, Target } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../../apiConfig';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';

const AssessmentTestingEngine = ({ isOpen, onClose, assessment, onComplete }) => {
    const { toast } = useToast();
 const { user } = useAuth();
 const [step, setStep] = useState('intro'); // intro, test, result
 const [attemptId, setAttemptId] = useState(null);
 const [timeLeft, setTimeLeft] = useState(0);
 const [score, setScore] = useState(0);
 const [isPassed, setIsPassed] = useState(false);
 const [submitting, setSubmitting] = useState(false);
 const [verificationId, setVerificationId] = useState(null);

 // Mock questions for demo purposes
 const questions = [
 `What is the primary best practice for optimizing performance in ${assessment?.SkillName || 'this technology'}?`,
 `Describe a scenario where you would avoid using ${assessment?.SkillName || 'this standard pattern'}.`,
 `How does ${assessment?.SkillName || 'this technology'} handle concurrent state mutations?`,
 `Identify the security implications of exposing endpoints related to ${assessment?.SkillName || 'this domain'}.`,
 `Which architectural pattern best complements ${assessment?.SkillName || 'this stack'} for high-availability systems?`
 ];

 useEffect(() => {
 let timer;
 if (step === 'test' && timeLeft > 0) {
 timer = setInterval(() => {
 setTimeLeft(prev => prev - 1);
 }, 1000);
 } else if (step === 'test' && timeLeft === 0) {
 handleSubmitMock(); // Auto-submit when time runs out
 }
 return () => clearInterval(timer);
 }, [step, timeLeft]);

 const handleStart = async () => {
 try {
 const res = await axios.post(`${API_BASE}/candidates/assessments/start`, {
 assessmentId: assessment.AssessmentID
 });
 setAttemptId(res.data.attemptId);
 setTimeLeft(assessment.TimeLimit * 60); // Convert minutes to seconds
 setStep('test');
 } catch (err) {
 console.error(err);
 toast("Could not start assessment.");
 }
 };

 const handleSubmitMock = async () => {
 if (submitting) return;
 setSubmitting(true);
 try {
 // For the demo, if they submit early, we guarantee a passing score.
 // If time runs out (timeLeft === 0), they get a random score that might fail.
 const passTarget = assessment.PassingScore || 80;
 const mockScore = timeLeft > 0
 ? Math.floor(Math.random() * (101 - passTarget)) + passTarget // Force pass
 : Math.floor(Math.random() * 51) + 40; // Random, might fail
 const timeSpent = (assessment.TimeLimit * 60) - timeLeft;

 const res = await axios.post(`${API_BASE}/candidates/assessments/submit`, {
 attemptId,
 score: mockScore,
 timeSpentSeconds: timeSpent,
 details: "Submitted via React testing engine demo."
 });

 setScore(mockScore);
 setIsPassed(res.data.isPassed);
 if (res.data.verificationId) setVerificationId(res.data.verificationId);
 setStep('result');

 // Notify parent to refresh verification status lists
 if (res.data.isPassed) {
 onComplete();
 }
 } catch (err) {
 console.error(err);
 const msg = err.response?.data?.error || err.response?.data?.details || err.message;
 toast("Submission failed: " + msg);
 } finally {
 setSubmitting(false);
 }
 };

 const formatTime = (seconds) => {
 const m = Math.floor(seconds / 60);
 const s = seconds % 60;
 return `${m}:${s < 10 ? '0' : ''}${s}`;
 };

 if (!isOpen || !assessment) return null;

 return (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
 <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => step === 'intro' ? onClose() : null}></div>

 <div className="relative w-full max-w-2xl bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] overflow-hidden flex flex-col animate-in zoom-in duration-200" style={{ maxHeight: '90vh' }}>

 {step === 'intro' && (
 <div className="p-10 text-center flex flex-col items-center">
 <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-[var(--bg-accent)] transition-colors">
 <X className="w-5 h-5 text-[var(--text-muted)]" />
 </button>

 <div className="w-20 h-20 bg-[var(--accent)]/10 rounded-3xl flex items-center justify-center mb-6 border border-[var(--accent)]">
 <Target className="w-10 h-10 text-[var(--accent)]" />
 </div>

 <h2 className="text-2xl sm:text-3xl font-semibold mb-2">{assessment.Title}</h2>
 <h3 className="text-sm font-bold text-[var(--accent)] mb-6">{assessment.AssessmentType}</h3>

 <p className="text-[var(--text-secondary)] mb-8 px-6">
 {assessment.Description || `This assessment will verify your expertise in ${assessment.SkillName}. Plagiarism or switching tabs may result in instant failure.`}
 </p>

 <div className="grid grid-cols-2 gap-4 w-full mb-10">
 <div className="bg-[var(--bg-accent)] p-4 rounded-2xl border border-[var(--border-primary)] text-center">
 <Clock className="w-6 h-6 text-[var(--text-muted)] mx-auto mb-2" />
 <div className="text-[11px] font-medium text-[var(--text-muted)]">Time Limit</div>
 <div className="text-lg sm:text-xl font-semibold">{assessment.TimeLimit} Mins</div>
 </div>
 <div className="bg-[var(--bg-accent)] p-4 rounded-2xl border border-[var(--border-primary)] text-center">
 <Award className="w-6 h-6 text-[var(--text-muted)] mx-auto mb-2" />
 <div className="text-[11px] font-medium text-[var(--text-muted)]">Pass Score</div>
 <div className="text-lg sm:text-xl font-semibold text-[var(--success)]">{assessment.PassingScore}%</div>
 </div>
 </div>

 <button
 onClick={handleStart}
 className="bg-[var(--accent)] w-full py-4 rounded-2xl text-white font-medium hover:bg-[var(--accent-hover)] transition-colors"
 >
 Begin Assessment
 </button>
 </div>
 )}

 {step === 'test' && (
 <div className="flex flex-col h-[80vh]">
 <div className="p-6 border-b border-[var(--border-primary)] flex items-center justify-between bg-[var(--bg-accent)] shrink-0">
 <div>
 <h3 className="font-semibold text-sm text-[var(--accent)]">{assessment.SkillName}</h3>
 <p className="text-xs text-[var(--text-muted)] mt-1">Assessment id: #{attemptId}</p>
 </div>
 <div className={`px-4 py-2 rounded-xl font-semibold text-lg flex items-center gap-2 border ${timeLeft < 60 ? 'bg-[var(--danger)]/10 text-[var(--danger)] border-red-500/20 animate-pulse' : 'bg-[var(--bg-primary)] border-[var(--border-primary)]'}`}>
 <Clock className="w-5 h-5" />
 {formatTime(timeLeft)}
 </div>
 </div>

 <div className="p-8 overflow-y-auto flex-1">
 {questions.map((q, idx) => (
 <div key={idx} className="mb-8 last:mb-0">
 <h4 className="font-bold text-sm mb-3 flex gap-3">
 <span className="text-[var(--accent)] font-semibold">{idx + 1}.</span>
 {q}
 </h4>
 <textarea
 className="w-full h-24 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl p-4 text-sm focus:outline-none focus:border-[var(--accent)] resize-none font-mono"
 placeholder="Write your technical answer or pseudo-code here..."
 ></textarea>
 </div>
 ))}
 </div>

 <div className="p-6 border-t border-[var(--border-primary)] bg-[var(--bg-accent)] shrink-0">
 <button
 onClick={handleSubmitMock}
 disabled={submitting}
 className="bg-[var(--accent)] w-full py-4 rounded-2xl text-white font-medium hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
 >
 {submitting ? 'Scoring Assessment...' : 'Submit Answers for AI Review'}
 </button>
 </div>
 </div>
 )}

 {step === 'result' && (
 <div className="p-12 text-center flex flex-col items-center">
 <div className={`w-24 h-24 rounded-[var(--radius-xl)] flex items-center justify-center mb-6 animate-in zoom-in ${isPassed ? 'bg-[var(--success)]/10 text-[var(--success)] border border-emerald-500/20' : 'bg-[var(--danger)]/10 text-[var(--danger)] border border-red-500/20'}`}>
 {isPassed ? <CheckCircle size={48} /> : <XCircle size={48} />}
 </div>

 <h2 className="text-4xl font-semibold mb-2">{isPassed ? 'Verification Passed!' : 'Assessment Failed'}</h2>
 <p className="text-[var(--text-secondary)] mb-8">
 {isPassed
 ? `You scored ${score}% and successfully verified your ${assessment.SkillName} proficiency. A cryptographic badge has been attached to your profile.`
 : `You scored ${score}%, which is below the ${assessment.PassingScore}% requirement. You can retry this assessment in 48 hours.`}
 </p>

 <div className="bg-[var(--bg-accent)] w-full p-6 rounded-3xl border border-[var(--border-primary)] flex justify-between items-center mb-8">
 <div className="text-left">
 <div className="text-[11px] font-medium text-[var(--text-muted)] mb-1">Final Score</div>
 <div className="text-2xl sm:text-3xl font-semibold">{score}<span className="text-sm opacity-50">/100</span></div>
 </div>
 <div className="h-12 w-px bg-[var(--border-primary)]"></div>
 <div className="text-right">
 <div className="text-[11px] font-medium text-[var(--text-muted)] mb-1">Pass Requirement</div>
 <div className="text-xl sm:text-2xl font-semibold text-[var(--text-muted)]">{assessment.PassingScore}<span className="text-sm opacity-50">/100</span></div>
 </div>
 </div>

 <button
 onClick={onClose}
 className="bg-[var(--bg-primary)] border border-[var(--border-primary)] w-full py-4 rounded-2xl font-medium hover:bg-[var(--bg-accent)] transition-colors"
 >
 Return to Dashboard
 </button>
 </div>
 )}

 </div>
 </div>
 );
};

export default AssessmentTestingEngine;
