import React, { useState, useEffect } from 'react';
import {
 UserCheck,
 TrendingUp,
 AlertTriangle,
 CheckCircle,
 Clock,
 Calendar,
 Target,
 RefreshCw,
 ChevronDown,
 ChevronUp,
 BarChart3,
 Zap,
 AlertCircle,
 Lightbulb,
 Heart,
 Briefcase
} from 'lucide-react';
import API_BASE from '../../apiConfig';
import axios from 'axios';

const OnboardingSuccessPredictor = () => {
 const [hiredCandidates, setHiredCandidates] = useState([]);
 const [predictions, setPredictions] = useState([]);
 const [selectedCandidate, setSelectedCandidate] = useState(null);
 const [predictionResult, setPredictionResult] = useState(null);
 const [loading, setLoading] = useState(false);
 const [candidatesLoading, setCandidatesLoading] = useState(true);
 const [predictionsLoading, setPredictionsLoading] = useState(true);
 const [error, setError] = useState(null);
 const [expandedRisk, setExpandedRisk] = useState(true);
 const [expandedRecommendations, setExpandedRecommendations] = useState(true);

 // Fetch hired candidates
 useEffect(() => {
 const fetchCandidates = async () => {
 try {
 const res = await axios.get(`${API_BASE}/analytics/hired-candidates`);
 setHiredCandidates(res.data || []);
 } catch (err) {
 console.error('Error fetching hired candidates:', err);
 } finally {
 setCandidatesLoading(false);
 }
 };
 fetchCandidates();
 }, []);

 // Fetch existing predictions
 useEffect(() => {
 const fetchPredictions = async () => {
 try {
 const res = await axios.get(`${API_BASE}/analytics/onboarding-predictions`);
 setPredictions(res.data || []);
 } catch (err) {
 console.error('Error fetching predictions:', err);
 setPredictions([]);
 } finally {
 setPredictionsLoading(false);
 }
 };
 fetchPredictions();
 }, []);

 // Run prediction
 const runPrediction = async () => {
 if (!selectedCandidate) return;

 setLoading(true);
 setError(null);
 setPredictionResult(null);

 try {
 const res = await axios.post(`${API_BASE}/analytics/predict-onboarding-success`, {
 candidateId: selectedCandidate.CandidateID,
 jobId: selectedCandidate.JobID
 });

 setPredictionResult(res.data.prediction);

 // Refresh predictions list
 const predRes = await axios.get(`${API_BASE}/analytics/onboarding-predictions`);
 setPredictions(predRes.data || []);
 } catch (err) {
 console.error('Prediction error:', err);
 setError(err.response?.data?.error || 'Failed to generate prediction');
 } finally {
 setLoading(false);
 }
 };

 const getRiskColor = (level) => {
 switch (level?.toLowerCase()) {
 case 'low risk': return 'text-[var(--success)]';
 case 'medium risk': return 'text-[var(--warning)]';
 case 'high risk': return 'text-[var(--danger)]';
 default: return 'text-[var(--text-muted)]';
 }
 };

 const getRiskBg = (level) => {
 switch (level?.toLowerCase()) {
 case 'low risk': return 'bg-[var(--success)]/10 border-emerald-500/30';
 case 'medium risk': return 'bg-[var(--warning)]/10 border-amber-500/30';
 case 'high risk': return 'bg-[var(--danger)]/10 border-red-500/30';
 default: return 'bg-gray-500/10 border-gray-500/30';
 }
 };

 const getProbabilityColor = (prob) => {
 if (prob >= 0.8) return 'text-[var(--success)]';
 if (prob >= 0.6) return 'text-[var(--warning)]';
 return 'text-[var(--danger)]';
 };

 return (
 <div className="space-y-5 sm:space-y-8">
 {/* Header */}
 <div className="glass-card p-8 rounded-[var(--radius-xl)]">
 <div className="flex items-center gap-4 mb-6">
 <div className="p-3 rounded-2xl bg-[var(--accent-soft)]">
 <UserCheck className="w-6 h-6 text-[var(--success)]" />
 </div>
 <div>
 <h2 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)]">
 Onboarding Success Predictor
 </h2>
 <p className="text-xs font-medium text-[var(--text-muted)]">
 Predict retention risk and create personalized onboarding plans
 </p>
 </div>
 </div>

 <div className="bg-[var(--bg-accent)] rounded-2xl p-4 border border-[var(--border-primary)]">
 <div className="flex items-start gap-3">
 <Zap className="w-5 h-5 text-[var(--warning)] flex-shrink-0 mt-0.5" />
 <div className="text-xs text-[var(--text-muted)]">
 <span className="font-bold text-[var(--text-primary)]">Why it matters:</span> 20% of new hires leave within 45 days. This predictor analyzes remote compatibility, career gaps, social integration, and company onboarding quality to predict success and recommend interventions.
 </div>
 </div>
 </div>
 </div>

 {/* Candidate Selection & Prediction */}
 <div className="glass-card p-8 rounded-[var(--radius-xl)]">
 <div className="flex items-center gap-3 mb-6">
 <Target className="w-5 h-5 text-teal-400" />
 <h3 className="text-sm font-medium text-[var(--text-primary)]">
 Run Prediction
 </h3>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
 {/* Candidate Selector */}
 <div>
 <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-2">
 Select Hired Candidate
 </label>
 <select
 value={selectedCandidate?.CandidateID || ''}
 onChange={(e) => {
 const cand = hiredCandidates.find(c => c.CandidateID === parseInt(e.target.value));
 setSelectedCandidate(cand);
 setPredictionResult(null);
 setError(null);
 }}
 className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-teal-500/50"
 >
 <option value="">Choose a hired candidate...</option>
 {hiredCandidates.map(cand => (
 <option key={`${cand.CandidateID}-${cand.JobID}`} value={cand.CandidateID}>
 {cand.CandidateName} - {cand.JobTitle} (Hired {cand.DaysSinceHired} days ago)
 </option>
 ))}
 </select>

 {selectedCandidate && (
 <div className="mt-4 p-4 bg-[var(--bg-accent)] rounded-xl border border-[var(--border-primary)]">
 <div className="grid grid-cols-2 gap-4 text-xs">
 <div>
 <span className="text-[var(--text-muted)]">Candidate:</span>
 <p className="font-bold text-[var(--text-primary)]">{selectedCandidate.CandidateName}</p>
 </div>
 <div>
 <span className="text-[var(--text-muted)]">Position:</span>
 <p className="font-bold text-[var(--text-primary)]">{selectedCandidate.JobTitle}</p>
 </div>
 <div>
 <span className="text-[var(--text-muted)]">Days Since Hired:</span>
 <p className="font-bold text-teal-400">{selectedCandidate.DaysSinceHired}</p>
 </div>
 <div>
 <span className="text-[var(--text-muted)]">Remote Score:</span>
 <p className="font-bold text-[var(--accent)]">{selectedCandidate.OverallRemoteScore || 'N/A'}</p>
 </div>
 </div>
 </div>
 )}
 </div>

 {/* Prediction Button & Result */}
 <div>
 <button
 onClick={runPrediction}
 disabled={!selectedCandidate || loading}
 className="w-full bg-[var(--accent)] text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
 >
 {loading ? (
 <>
 <RefreshCw className="w-5 h-5 animate-spin" />
 Analyzing...
 </>
 ) : (
 <>
 <UserCheck className="w-5 h-5" />
 Predict Onboarding Success
 </>
 )}
 </button>

 {error && (
 <div className="mt-4 p-4 bg-[var(--danger)]/10 border border-red-500/30 rounded-xl flex items-center gap-3">
 <AlertCircle className="w-5 h-5 text-[var(--danger)]" />
 <span className="text-sm text-[var(--danger)]">{error}</span>
 </div>
 )}

 {predictionResult && (
 <div className={`mt-4 p-6 rounded-xl border ${getRiskBg(predictionResult.riskLevel)}`}>
 {/* Success Probability */}
 <div className="text-center mb-6">
 <div className="text-[11px] font-medium text-[var(--text-muted)] mb-1">
 Success Probability
 </div>
 <div className={`text-5xl font-semibold ${getProbabilityColor(predictionResult.successProbability)}`}>
 {(Number(predictionResult.successProbability) * 100).toFixed(0)}%
 </div>
 <div className={`text-sm font-bold mt-2 ${getRiskColor(predictionResult.riskLevel)}`}>
 {predictionResult.riskLevel}
 </div>
 </div>

 {/* Predicted Retention */}
 <div className="flex items-center justify-center gap-4 mb-6 p-3 bg-[var(--bg-accent)] rounded-xl">
 <Calendar className="w-5 h-5 text-[var(--accent)]" />
 <div className="text-center">
 <div className="text-[11px] font-medium text-[var(--text-muted)]">Predicted Retention</div>
 <div className="text-lg font-bold text-[var(--text-primary)]">
 {predictionResult.predictedRetentionMonths}+ months
 </div>
 </div>
 </div>

 {/* Risk Factors */}
 <button
 onClick={() => setExpandedRisk(!expandedRisk)}
 className="w-full flex items-center justify-between text-xs font-bold text-[var(--text-muted)] py-2 border-t border-[var(--border-primary)]"
 >
 <span className="flex items-center gap-2">
 <AlertTriangle className="w-4 h-4" />
 RISK FACTORS
 </span>
 {expandedRisk ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
 </button>

 {expandedRisk && predictionResult.riskFactors && (
 <div className="mt-3 p-4 bg-[var(--bg-accent)] rounded-xl">
 <p className="text-sm text-[var(--text-primary)]">{predictionResult.riskFactors}</p>
 </div>
 )}

 {/* Recommendations */}
 <button
 onClick={() => setExpandedRecommendations(!expandedRecommendations)}
 className="w-full flex items-center justify-between text-xs font-bold text-[var(--text-muted)] py-2 border-t border-[var(--border-primary)] mt-2"
 >
 <span className="flex items-center gap-2">
 <Lightbulb className="w-4 h-4" />
 RECOMMENDATIONS
 </span>
 {expandedRecommendations ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
 </button>

 {expandedRecommendations && predictionResult.recommendations && (
 <div className="mt-3 p-4 bg-[var(--success)]/10 rounded-xl border border-emerald-500/20">
 <p className="text-sm text-[var(--text-primary)]">{predictionResult.recommendations}</p>
 </div>
 )}
 </div>
 )}
 </div>
 </div>
 </div>

 {/* Prediction History */}
 <div className="glass-card p-8 rounded-[var(--radius-xl)]">
 <div className="flex items-center justify-between mb-6">
 <div className="flex items-center gap-3">
 <BarChart3 className="w-5 h-5 text-teal-400" />
 <h3 className="text-sm font-medium text-[var(--text-primary)]">
 Prediction History
 </h3>
 </div>
 <button
 onClick={async () => {
 setPredictionsLoading(true);
 try {
 const res = await axios.get(`${API_BASE}/analytics/onboarding-predictions`);
 setPredictions(res.data || []);
 } catch (err) {
 console.error('Refresh error:', err);
 } finally {
 setPredictionsLoading(false);
 }
 }}
 className="p-2 rounded-lg hover:bg-[var(--bg-accent)] transition-colors"
 >
 <RefreshCw className={`w-4 h-4 text-[var(--text-muted)] ${predictionsLoading ? 'animate-spin' : ''}`} />
 </button>
 </div>

 {predictionsLoading ? (
 <div className="flex items-center justify-center py-12">
 <RefreshCw className="w-6 h-6 text-[var(--success)] animate-spin" />
 </div>
 ) : predictions.length === 0 ? (
 <div className="text-center py-12 text-[var(--text-muted)]">
 <UserCheck className="w-12 h-12 mx-auto mb-4 opacity-30" />
 <p className="text-sm font-medium">No predictions yet</p>
 <p className="text-xs mt-1">Run a prediction to see results here</p>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="border-b border-[var(--border-primary)]">
 <th scope="col" className="text-left text-[11px] font-medium text-[var(--text-muted)] pb-3">Candidate</th>
 <th scope="col" className="text-left text-[11px] font-medium text-[var(--text-muted)] pb-3">Position</th>
 <th scope="col" className="text-center text-[11px] font-medium text-[var(--text-muted)] pb-3">Success</th>
 <th scope="col" className="text-center text-[11px] font-medium text-[var(--text-muted)] pb-3">Risk Level</th>
 <th scope="col" className="text-center text-[11px] font-medium text-[var(--text-muted)] pb-3">Retention</th>
 </tr>
 </thead>
 <tbody>
 {predictions.map((pred, idx) => (
 <tr key={pred.PredictionID || idx} className="border-b border-[var(--border-primary)]/50 hover:bg-[var(--bg-accent)]/50">
 <td className="py-4">
 <span className="text-sm font-medium text-[var(--text-primary)]">
 {pred.CandidateName}
 </span>
 </td>
 <td className="py-4">
 <span className="text-sm text-[var(--text-muted)]">
 {pred.JobTitle}
 </span>
 </td>
 <td className="py-4 text-center">
 <span className={`text-sm font-bold ${getProbabilityColor(pred.SuccessProbability)}`}>
 {(Number(pred.SuccessProbability) * 100).toFixed(0)}%
 </span>
 </td>
 <td className="py-4 text-center">
 <span className={`text-xs font-bold px-2 py-1 rounded-full ${getRiskColor(pred.RiskLevel)} bg-current/10`}>
 {pred.RiskLevel}
 </span>
 </td>
 <td className="py-4 text-center">
 <span className="text-xs text-[var(--text-muted)]">
 {pred.PredictedRetentionMonths}+ mo
 </span>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </div>

 {/* Model Information */}
 <div className="glass-card p-6 rounded-[var(--radius-xl)]">
 <div className="flex items-center gap-3 mb-4">
 <Heart className="w-4 h-4 text-[var(--danger)]" />
 <h4 className="text-xs font-medium text-[var(--text-primary)]">
 Factors Analyzed
 </h4>
 </div>
 <div className="grid grid-cols-2 md:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 {[
 { label: 'Remote Score', weight: '20%', color: 'text-[var(--accent)]', icon: Target },
 { label: 'Company Onboarding', weight: '20%', color: 'text-[var(--accent)]', icon: Briefcase },
 { label: 'Similar Success', weight: '30%', color: 'text-[var(--accent)]', icon: TrendingUp },
 { label: 'Risk Adjustments', weight: '±30%', color: 'text-[var(--danger)]', icon: AlertTriangle }
 ].map((item, idx) => (
 <div key={idx} className="text-center p-3 bg-[var(--bg-accent)] rounded-xl">
 <item.icon className={`w-5 h-5 mx-auto mb-2 ${item.color}`} />
 <div className={`text-lg font-semibold ${item.color}`}>{item.weight}</div>
 <div className="text-[11px] font-medium text-[var(--text-muted)]">{item.label}</div>
 </div>
 ))}
 </div>
 </div>
 </div>
 );
};

export default OnboardingSuccessPredictor;