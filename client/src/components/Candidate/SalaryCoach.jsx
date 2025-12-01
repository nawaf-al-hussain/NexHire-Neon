import React, { useState } from 'react';
import {
 DollarSign, TrendingUp, Target, Sparkles, Loader2, Calculator,
 CheckCircle, AlertCircle, Clock, MessageSquare, Lightbulb,
 ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react';
import axios from 'axios';
import API_BASE from '../../apiConfig';
import { useToast } from '../../components/ui/Toast';

const SalaryCoach = ({ salaryData, loading, applications }) => {
    const { toast } = useToast();
 const [generating, setGenerating] = useState(false);
 const [negotiationResult, setNegotiationResult] = useState(null);
 const [selectedJob, setSelectedJob] = useState('');
 const [currentSalary, setCurrentSalary] = useState('');
 const [targetSalary, setTargetSalary] = useState('');

 const handleGenerateStrategy = async () => {
 if (!selectedJob) {
 toast('Please select a job first.');
 return;
 }
 setGenerating(true);
 try {
 const res = await axios.post(`${API_BASE}/candidates/salary-coach/negotiate`, {
 jobID: selectedJob,
 currentSalary: parseInt(currentSalary) || 0,
 targetSalary: parseInt(targetSalary) || 0
 });
 setNegotiationResult(res.data);
 } catch (err) {
 console.error('Generate Strategy Error:', err);
 toast(err.response?.data?.error || 'Failed to generate negotiation strategy.', { type: 'error' });
 } finally {
 setGenerating(false);
 }
 };

 const getAssessmentColor = (assessment) => {
 if (!assessment) return 'text-[var(--text-muted)]';
 if (assessment.includes('Strongly Under')) return 'text-[var(--danger)]';
 if (assessment.includes('Below')) return 'text-[var(--warning)]';
 if (assessment.includes('Competitive')) return 'text-[var(--accent)]';
 return 'text-[var(--success)]';
 };

 const getAssessmentBg = (assessment) => {
 if (!assessment) return 'bg-gray-500/10 border-gray-500/20';
 if (assessment.includes('Strongly Under')) return 'bg-[var(--danger)]/10 border-[var(--danger)]/20';
 if (assessment.includes('Below')) return 'bg-[var(--warning)]/10 border-amber-500/20';
 if (assessment.includes('Competitive')) return 'bg-[var(--accent)]/10 border-[var(--accent)]/20';
 return 'bg-[var(--success)]/10 border-emerald-500/20';
 };

 const getAssessmentIcon = (assessment) => {
 if (!assessment) return <Minus className="w-5 h-5" />;
 if (assessment.includes('Strongly Under')) return <ArrowDownRight className="w-5 h-5" />;
 if (assessment.includes('Below')) return <ArrowDownRight className="w-5 h-5" />;
 if (assessment.includes('Competitive')) return <Minus className="w-5 h-5" />;
 return <ArrowUpRight className="w-5 h-5" />;
 };

 const formatCurrency = (amount) => {
 return new Intl.NumberFormat('en-US', {
 style: 'currency',
 currency: 'USD',
 minimumFractionDigits: 0,
 maximumFractionDigits: 0
 }).format(amount || 0);
 };

 if (loading) {
 return (
 <div className="flex flex-col items-center justify-center py-20">
 <Loader2 className="w-12 h-12 text-[var(--accent)] animate-spin mb-4" />
 <p className="text-[11px] font-semibold text-[var(--text-muted)]">Loading Salary Insights...</p>
 </div>
 );
 }

 // Sample market data
 const sampleData = salaryData && salaryData.length > 0 ? salaryData : [
 { SkillName: 'JavaScript', DemandScore: 95, AverageSalary: 95000, TrendDirection: 'Up' },
 { SkillName: 'React', DemandScore: 92, AverageSalary: 105000, TrendDirection: 'Up' },
 { SkillName: 'Node.js', DemandScore: 88, AverageSalary: 100000, TrendDirection: 'Stable' },
 { SkillName: 'SQL', DemandScore: 85, AverageSalary: 92000, TrendDirection: 'Up' },
 { SkillName: 'AWS', DemandScore: 90, AverageSalary: 115000, TrendDirection: 'Up' }
 ];

 return (
 <div className="space-y-5 sm:space-y-8">
 <div className="flex items-center gap-3 mb-6">
 <DollarSign className="w-5 h-5 text-[var(--success)]" />
 <h2 className="text-lg font-medium">Salary Coach</h2>
 </div>

 {/* Market Insights */}
 <div className="glass-card p-8 rounded-[var(--radius-xl)]">
 <div className="flex items-center gap-3 mb-6">
 <TrendingUp className="w-5 h-5 text-[var(--warning)]" />
 <h3 className="text-sm font-medium">Market Demand Insights</h3>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {sampleData.slice(0, 6).map((skill, index) => (
 <div key={index} className="flex items-center justify-between p-4 bg-[var(--bg-accent)] rounded-2xl border border-[var(--border-primary)]">
 <div>
 <p className="text-xs font-semibold">{skill.SkillName}</p>
 <p className="text-[11px] text-[var(--text-muted)]">Avg: {formatCurrency(skill.AverageSalary || 90000)}</p>
 </div>
 <div className="text-right">
 <span className={`text-xs font-semibold ${(skill.TrendDirection || 'Up') === 'Up' ? 'text-[var(--success)]' : 'text-[var(--warning)]'}`}>
 {(skill.TrendDirection || 'Up') === 'Up' ? '↑' : '→'} {(skill.DemandScore || 85)}%
 </span>
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Negotiation Strategy */}
 <div className="glass-card p-8 rounded-[var(--radius-xl)]">
 <div className="flex items-center gap-3 mb-6">
 <Sparkles className="w-5 h-5 text-[var(--warning)]" />
 <h3 className="text-sm font-medium">Negotiation Strategy Generator</h3>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
 <select
 value={selectedJob}
 onChange={(e) => setSelectedJob(e.target.value)}
 className="bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-[var(--accent)]"
 >
 <option value="">Select a job...</option>
 {applications && applications.map((app) => (
 <option key={app.ApplicationID} value={app.JobID}>
 {app.JobTitle} - {app.StatusName}
 </option>
 ))}
 </select>

 <input
 type="number"
 placeholder="Current/Offered Salary"
 value={currentSalary}
 onChange={(e) => setCurrentSalary(e.target.value)}
 className="bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-[var(--accent)]"
 />

 <input
 type="number"
 placeholder="Target Salary (Optional)"
 value={targetSalary}
 onChange={(e) => setTargetSalary(e.target.value)}
 className="bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-[var(--accent)]"
 />
 </div>

 <button
 onClick={handleGenerateStrategy}
 disabled={generating}
 className="w-full py-4 bg-[var(--accent)] text-white rounded-2xl font-semibold text-xs hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
 >
 {generating ? (
 <>
 <Loader2 className="w-4 h-4 animate-spin" />
 Analyzing Market Data...
 </>
 ) : (
 <>
 <Calculator size={16} />
 Generate Strategy
 </>
 )}
 </button>
 </div>

 {/* Results - Visually Enhanced */}
 {negotiationResult && (
 <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
 {/* Offer Assessment Card */}
 <div className={`p-8 rounded-[var(--radius-xl)] border ${getAssessmentBg(negotiationResult.OfferAssessment)}`}>
 <div className="flex items-center justify-between mb-6">
 <div className="flex items-center gap-4">
 <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${getAssessmentBg(negotiationResult.OfferAssessment)}`}>
 {getAssessmentIcon(negotiationResult.OfferAssessment)}
 </div>
 <div>
 <h3 className="text-xl sm:text-2xl font-semibold">Offer Assessment</h3>
 <p className={`text-sm font-bold ${getAssessmentColor(negotiationResult.OfferAssessment)}`}>
 {negotiationResult.OfferAssessment || 'Analyzing...'}
 </p>
 </div>
 </div>
 <div className="text-right">
 <div className="text-4xl font-semibold text-[var(--success)]">
 {formatCurrency(negotiationResult.RecommendedCounterOffer)}
 </div>
 <p className="text-[11px] font-semibold text-[var(--text-muted)]">Recommended Counter</p>
 </div>
 </div>

 {/* Salary Comparison Bar */}
 <div className="mb-6">
 <div className="flex justify-between text-[11px] font-medium text-[var(--text-muted)] mb-2">
 <span>25th Percentile</span>
 <span>Market Average</span>
 <span>75th Percentile</span>
 </div>
 <div className="relative h-4 bg-[var(--bg-accent)] rounded-full overflow-hidden">
 <div className="absolute inset-0 flex">
 <div className="w-1/4 bg-[var(--danger)]/30"></div>
 <div className="w-1/4 bg-[var(--warning)]/30"></div>
 <div className="w-1/4 bg-[var(--accent)]/30"></div>
 <div className="w-1/4 bg-[var(--success)]/30"></div>
 </div>
 {/* Offer marker */}
 <div
 className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
 style={{
 left: `${Math.min(100, Math.max(0, negotiationResult.OfferPercentile || 50))}%`
 }}
 ></div>
 </div>
 <div className="flex justify-between mt-2">
 <span className="text-xs font-bold text-[var(--danger)]">{formatCurrency(negotiationResult.Market25thPercentile)}</span>
 <span className="text-xs font-bold text-[var(--accent)]">{formatCurrency(negotiationResult.MarketAverage)}</span>
 <span className="text-xs font-bold text-[var(--success)]">{formatCurrency(negotiationResult.Market75thPercentile)}</span>
 </div>
 </div>

 {/* Stats Grid */}
 <div className="grid grid-cols-2 md:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 <div className="p-4 rounded-2xl bg-[var(--bg-primary)]/50 text-center">
 <DollarSign className="w-5 h-5 text-[var(--accent)] mx-auto mb-2" />
 <div className="text-lg font-semibold">{formatCurrency(negotiationResult.InitialOffer)}</div>
 <div className="text-[11px] font-semibold text-[var(--text-muted)]">Initial Offer</div>
 </div>
 <div className="p-4 rounded-2xl bg-[var(--bg-primary)]/50 text-center">
 <TrendingUp className="w-5 h-5 text-[var(--success)] mx-auto mb-2" />
 <div className="text-lg font-semibold text-[var(--success)]">+{formatCurrency(negotiationResult.NegotiationRoom)}</div>
 <div className="text-[11px] font-semibold text-[var(--text-muted)]">Negotiation Room</div>
 </div>
 <div className="p-4 rounded-2xl bg-[var(--bg-primary)]/50 text-center">
 <Target className="w-5 h-5 text-[var(--accent)] mx-auto mb-2" />
 <div className="text-lg font-semibold">{negotiationResult.OfferPercentile}th</div>
 <div className="text-[11px] font-semibold text-[var(--text-muted)]">Percentile</div>
 </div>
 {negotiationResult.TargetSalary && (
 <div className="p-4 rounded-2xl bg-[var(--bg-primary)]/50 text-center">
 <ArrowUpRight className="w-5 h-5 text-[var(--warning)] mx-auto mb-2" />
 <div className="text-lg font-semibold">{formatCurrency(negotiationResult.TargetSalary)}</div>
 <div className="text-[11px] font-semibold text-[var(--text-muted)]">Your Target</div>
 </div>
 )}
 </div>
 </div>

 {/* Negotiation Script */}
 <div className="glass-card p-8 rounded-[var(--radius-xl)]">
 <div className="flex items-center gap-3 mb-4">
 <MessageSquare className="w-5 h-5 text-[var(--accent)]" />
 <h3 className="text-sm font-medium">Suggested Response Script</h3>
 </div>
 <div className="p-6 rounded-2xl bg-[var(--accent)]/5 border border-[var(--accent)]">
 <p className="text-sm text-[var(--text-primary)] leading-relaxed italic">
 "{negotiationResult.NegotiationScript}"
 </p>
 </div>
 <button
 onClick={() => navigator.clipboard.writeText(negotiationResult.NegotiationScript)}
 className="mt-4 px-6 py-2 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)] text-[var(--accent)] text-xs font-medium hover:bg-[var(--accent)]/20 transition-colors"
 >
 Copy to Clipboard
 </button>
 </div>

 {/* Timing & Strategy */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
 <div className="glass-card p-6 rounded-[var(--radius-xl)]">
 <div className="flex items-center gap-3 mb-4">
 <Clock className="w-5 h-5 text-[var(--warning)]" />
 <h3 className="text-sm font-medium">Timing Strategy</h3>
 </div>
 <p className="text-sm text-[var(--text-muted)]">
 {negotiationResult.TimingRecommendation}
 </p>
 </div>

 <div className="glass-card p-6 rounded-[var(--radius-xl)]">
 <div className="flex items-center gap-3 mb-4">
 <Lightbulb className="w-5 h-5 text-[var(--warning)]" />
 <h3 className="text-sm font-medium">Fallback Options</h3>
 </div>
 <p className="text-sm text-[var(--text-muted)]">
 {negotiationResult.FallbackOptions}
 </p>
 </div>
 </div>

 {/* Gap to Target */}
 {negotiationResult.TargetSalary && negotiationResult.GapToTarget !== undefined && (
 <div className={`p-6 rounded-[var(--radius-xl)] border ${negotiationResult.GapToTarget > 0 ? 'bg-[var(--warning)]/10 border-amber-500/20' : 'bg-[var(--success)]/10 border-emerald-500/20'}`}>
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 {negotiationResult.GapToTarget > 0 ? (
 <AlertCircle className="w-5 h-5 text-[var(--warning)]" />
 ) : (
 <CheckCircle className="w-5 h-5 text-[var(--success)]" />
 )}
 <span className="text-sm font-bold">
 {negotiationResult.GapToTarget > 0
 ? 'Gap to your target salary'
 : 'Your target is achievable!'}
 </span>
 </div>
 <span className={`text-lg font-semibold ${negotiationResult.GapToTarget > 0 ? 'text-[var(--warning)]' : 'text-[var(--success)]'}`}>
 {negotiationResult.GapToTarget > 0 ? '+' : ''}{formatCurrency(Math.abs(negotiationResult.GapToTarget))}
 </span>
 </div>
 </div>
 )}
 </div>
 )}

 {/* Tips */}
 <div className="bg-[var(--bg-accent)] rounded-[var(--radius-xl)] p-8 border border-[var(--border-primary)]">
 <div className="flex items-center gap-3 mb-4">
 <Target className="w-5 h-5 text-[var(--warning)]" />
 <h3 className="text-sm font-medium">Negotiation Tips</h3>
 </div>
 <ul className="space-y-3">
 <li className="flex items-start gap-3 text-xs font-medium text-[var(--text-muted)]">
 <span className="w-2 h-2 rounded-full bg-[var(--success)] mt-1.5 shrink-0"></span>
 Research market rates before negotiating
 </li>
 <li className="flex items-start gap-3 text-xs font-medium text-[var(--text-muted)]">
 <span className="w-2 h-2 rounded-full bg-[var(--success)] mt-1.5 shrink-0"></span>
 Highlight your unique value proposition
 </li>
 <li className="flex items-start gap-3 text-xs font-medium text-[var(--text-muted)]">
 <span className="w-2 h-2 rounded-full bg-[var(--success)] mt-1.5 shrink-0"></span>
 Practice your pitch with confidence
 </li>
 <li className="flex items-start gap-3 text-xs font-medium text-[var(--text-muted)]">
 <span className="w-2 h-2 rounded-full bg-[var(--success)] mt-1.5 shrink-0"></span>
 Consider the total package (equity, benefits, growth opportunities)
 </li>
 </ul>
 </div>
 </div>
 );
};

export default SalaryCoach;
