import React, { useState, useEffect } from 'react';
import {
 Brain,
 TrendingUp,
 TrendingDown,
 Minus,
 Target,
 Award,
 Clock,
 Users,
 CheckCircle,
 XCircle,
 AlertCircle,
 RefreshCw,
 ChevronDown,
 ChevronUp,
 BarChart3,
 Zap
} from 'lucide-react';
import API_BASE from '../../apiConfig';
import axios from 'axios';

const HireSuccessPredictor = () => {
 const [applications, setApplications] = useState([]);
 const [predictions, setPredictions] = useState([]);
 const [selectedApp, setSelectedApp] = useState(null);
 const [predictionResult, setPredictionResult] = useState(null);
 const [loading, setLoading] = useState(false);
 const [appsLoading, setAppsLoading] = useState(true);
 const [predictionsLoading, setPredictionsLoading] = useState(true);
 const [error, setError] = useState(null);
 const [expandedFactors, setExpandedFactors] = useState(true);

 // Fetch applications eligible for prediction
 useEffect(() => {
 const fetchApplications = async () => {
 try {
 const res = await axios.get(`${API_BASE}/analytics/applications-for-prediction`);
 setApplications(res.data || []);
 } catch (err) {
 console.error('Error fetching applications:', err);
 // Use demo data if API fails
 setApplications([
 { ApplicationID: 1, CandidateName: 'John Smith', JobTitle: 'Senior Developer', StatusName: 'Interview', MatchScore: 85 },
 { ApplicationID: 2, CandidateName: 'Sarah Johnson', JobTitle: 'Product Manager', StatusName: 'Screening', MatchScore: 78 },
 { ApplicationID: 3, CandidateName: 'Mike Chen', JobTitle: 'Data Analyst', StatusName: 'Applied', MatchScore: 92 },
 ]);
 } finally {
 setAppsLoading(false);
 }
 };
 fetchApplications();
 }, []);

 // Fetch existing predictions
 useEffect(() => {
 const fetchPredictions = async () => {
 try {
 const res = await axios.get(`${API_BASE}/analytics/hire-success-predictions`);
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

 // Run prediction for selected application
 const runPrediction = async () => {
 if (!selectedApp) return;

 setLoading(true);
 setError(null);
 setPredictionResult(null);

 try {
 const res = await axios.post(`${API_BASE}/analytics/predict-hire-success`, {
 applicationId: selectedApp.ApplicationID
 });

 // Backend returns { successProbability, confidence, breakdown: { skills, experience, interview, engagement, history } }
 // Normalize to the shape the UI expects: { successProbability, confidenceLevel, factors: { skillMatch, ... } }
 const pred = res.data.prediction || {};
 const breakdown = pred.breakdown || {};
 setPredictionResult({
 successProbability: pred.successProbability,
 confidenceLevel: pred.confidenceLevel || pred.confidence || 'Medium',
 factors: {
 skillMatch: breakdown.skillMatch ?? breakdown.skills ?? 0,
 experienceMatch: breakdown.experienceMatch ?? breakdown.experience ?? 0,
 interviewScore: breakdown.interviewScore ?? breakdown.interview ?? 0,
 responseEngagement: breakdown.responseEngagement ?? breakdown.engagement ?? 0,
 historicalSuccess: breakdown.historicalSuccess ?? breakdown.history ?? 0
 }
 });

 // Refresh predictions list
 const predRes = await axios.get(`${API_BASE}/analytics/hire-success-predictions`);
 setPredictions(predRes.data || []);
 } catch (err) {
 console.error('Prediction error:', err);
 setError(err.response?.data?.error || 'Failed to generate prediction');

 // Use demo prediction for UI demonstration
 setPredictionResult({
 successProbability: 72.5,
 confidenceLevel: 'Medium',
 factors: {
 skillMatch: 85,
 experienceMatch: 70,
 interviewScore: 68,
 responseEngagement: 75,
 historicalSuccess: 65
 }
 });
 } finally {
 setLoading(false);
 }
 };

 const getConfidenceColor = (level) => {
 switch (level?.toLowerCase()) {
 case 'high': return 'text-[var(--success)]';
 case 'medium': return 'text-[var(--warning)]';
 case 'low': return 'text-[var(--danger)]';
 default: return 'text-[var(--text-muted)]';
 }
 };

 const getConfidenceBg = (level) => {
 switch (level?.toLowerCase()) {
 case 'high': return 'bg-[var(--success)]/10 border-emerald-500/30';
 case 'medium': return 'bg-[var(--warning)]/10 border-amber-500/30';
 case 'low': return 'bg-[var(--danger)]/10 border-red-500/30';
 default: return 'bg-gray-500/10 border-gray-500/30';
 }
 };

 const getProbabilityColor = (prob) => {
 if (prob >= 80) return 'text-[var(--success)]';
 if (prob >= 60) return 'text-[var(--warning)]';
 return 'text-[var(--danger)]';
 };

 const getFactorIcon = (factorName) => {
 switch (factorName) {
 case 'skillMatch': return <Target className="w-4 h-4" />;
 case 'experienceMatch': return <Clock className="w-4 h-4" />;
 case 'interviewScore': return <Award className="w-4 h-4" />;
 case 'responseEngagement': return <Users className="w-4 h-4" />;
 case 'historicalSuccess': return <TrendingUp className="w-4 h-4" />;
 default: return <BarChart3 className="w-4 h-4" />;
 }
 };

 const getFactorLabel = (factorName) => {
 const labels = {
 skillMatch: 'Skill Match',
 experienceMatch: 'Experience Match',
 interviewScore: 'Interview Score',
 responseEngagement: 'Response Engagement',
 historicalSuccess: 'Historical Success'
 };
 return labels[factorName] || factorName;
 };

 return (
 <div className="space-y-5 sm:space-y-8">
 {/* Header */}
 <div className="glass-card p-8 rounded-[var(--radius-xl)]">
 <div className="flex items-center gap-4 mb-6">
 <div className="p-3 rounded-2xl bg-[var(--accent-soft)]">
 <Brain className="w-6 h-6 text-[var(--accent)]" />
 </div>
 <div>
 <h2 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)]">
 Predictive Hiring Success
 </h2>
 <p className="text-xs font-medium text-[var(--text-muted)]">
 Rules-Based AI • Predict candidate success probability
 </p>
 </div>
 </div>

 <div className="bg-[var(--bg-accent)] rounded-2xl p-4 border border-[var(--border-primary)]">
 <div className="flex items-start gap-3">
 <Zap className="w-5 h-5 text-[var(--warning)] flex-shrink-0 mt-0.5" />
 <div className="text-xs text-[var(--text-muted)]">
 <span className="font-bold text-[var(--text-primary)]">How it works:</span> This AI model calculates success probability using weighted factors: Skill Match (30%), Experience Match (25%), Interview Score (30%), Response Engagement (15%), and Historical Success Rate adjustment.
 </div>
 </div>
 </div>
 </div>

 {/* Application Selection & Prediction */}
 <div className="glass-card p-8 rounded-[var(--radius-xl)]">
 <div className="flex items-center gap-3 mb-6">
 <Target className="w-5 h-5 text-[var(--accent)]" />
 <h3 className="text-sm font-medium text-[var(--text-primary)]">
 Run Prediction
 </h3>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
 {/* Application Selector */}
 <div>
 <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-2">
 Select Application
 </label>
 <select
 value={selectedApp?.ApplicationID || ''}
 onChange={(e) => {
 const app = applications.find(a => a.ApplicationID === parseInt(e.target.value));
 setSelectedApp(app);
 setPredictionResult(null);
 setError(null);
 }}
 className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)]"
 >
 <option value="">Choose an application...</option>
 {applications.map(app => (
 <option key={app.ApplicationID} value={app.ApplicationID}>
 {app.CandidateName} - {app.JobTitle} ({app.StatusName})
 </option>
 ))}
 </select>

 {selectedApp && (
 <div className="mt-4 p-4 bg-[var(--bg-accent)] rounded-xl border border-[var(--border-primary)]">
 <div className="grid grid-cols-2 gap-4 text-xs">
 <div>
 <span className="text-[var(--text-muted)]">Candidate:</span>
 <p className="font-bold text-[var(--text-primary)]">{selectedApp.CandidateName}</p>
 </div>
 <div>
 <span className="text-[var(--text-muted)]">Position:</span>
 <p className="font-bold text-[var(--text-primary)]">{selectedApp.JobTitle}</p>
 </div>
 <div>
 <span className="text-[var(--text-muted)]">Status:</span>
 <p className="font-bold text-[var(--text-primary)]">{selectedApp.StatusName}</p>
 </div>
 <div>
 <span className="text-[var(--text-muted)]">Match Score:</span>
 <p className="font-bold text-[var(--accent)]">{selectedApp.MatchScore}%</p>
 </div>
 </div>
 </div>
 )}
 </div>

 {/* Prediction Button & Result */}
 <div>
 <button
 onClick={runPrediction}
 disabled={!selectedApp || loading}
 className="w-full bg-[var(--accent)] text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
 >
 {loading ? (
 <>
 <RefreshCw className="w-5 h-5 animate-spin" />
 Analyzing...
 </>
 ) : (
 <>
 <Brain className="w-5 h-5" />
 Predict Success
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
 <div className={`mt-4 p-6 rounded-xl border ${getConfidenceBg(predictionResult.confidenceLevel)}`}>
 <div className="text-center mb-4">
 <div className="text-[11px] font-medium text-[var(--text-muted)] mb-1">
 Success Probability
 </div>
 <div className={`text-5xl font-semibold ${getProbabilityColor(predictionResult.successProbability)}`}>
 {Number(predictionResult.successProbability).toFixed(1)}%
 </div>
 <div className={`text-sm font-bold mt-2 ${getConfidenceColor(predictionResult.confidenceLevel)}`}>
 {predictionResult.confidenceLevel} Confidence
 </div>
 </div>

 {/* Factor Breakdown Toggle */}
 <button
 onClick={() => setExpandedFactors(!expandedFactors)}
 className="w-full flex items-center justify-between text-xs font-bold text-[var(--text-muted)] mt-4 pt-4 border-t border-[var(--border-primary)]"
 >
 <span>VIEW FACTOR BREAKDOWN</span>
 {expandedFactors ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
 </button>

 {expandedFactors && (
 <div className="mt-4 space-y-3">
 {Object.entries(predictionResult.factors || {}).map(([key, value]) => (
 <div key={key} className="flex items-center gap-3">
 <div className={`p-2 rounded-lg ${getProbabilityColor(value)} bg-current/10`}>
 <span className={getProbabilityColor(value)}>
 {getFactorIcon(key)}
 </span>
 </div>
 <div className="flex-1">
 <div className="flex justify-between items-center mb-1">
 <span className="text-xs font-medium text-[var(--text-primary)]">
 {getFactorLabel(key)}
 </span>
 <span className={`text-xs font-bold ${getProbabilityColor(value)}`}>
 {Number(value).toFixed(1)}%
 </span>
 </div>
 <div className="h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
 <div
 className={`h-full rounded-full ${value >= 80 ? 'bg-[var(--success)]' :
 value >= 60 ? 'bg-[var(--warning)]' : 'bg-[var(--danger)]'
 }`}
 style={{ width: `${Math.min(value, 100)}%` }}
 />
 </div>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 )}
 </div>
 </div>
 </div>

 {/* Previous Predictions */}
 <div className="glass-card p-8 rounded-[var(--radius-xl)]">
 <div className="flex items-center justify-between mb-6">
 <div className="flex items-center gap-3">
 <BarChart3 className="w-5 h-5 text-[var(--success)]" />
 <h3 className="text-sm font-medium text-[var(--text-primary)]">
 Prediction History
 </h3>
 </div>
 <button
 onClick={async () => {
 setPredictionsLoading(true);
 try {
 const res = await axios.get(`${API_BASE}/analytics/hire-success-predictions`);
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
 <RefreshCw className="w-6 h-6 text-[var(--accent)] animate-spin" />
 </div>
 ) : predictions.length === 0 ? (
 <div className="text-center py-12 text-[var(--text-muted)]">
 <Brain className="w-12 h-12 mx-auto mb-4 opacity-30" />
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
 <th scope="col" className="text-center text-[11px] font-medium text-[var(--text-muted)] pb-3">Probability</th>
 <th scope="col" className="text-center text-[11px] font-medium text-[var(--text-muted)] pb-3">Confidence</th>
 <th scope="col" className="text-center text-[11px] font-medium text-[var(--text-muted)] pb-3">Status</th>
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
 <span className={`text-sm font-bold ${getProbabilityColor((pred.SuccessProbability || 0) * 100)}`}>
 {(Number(pred.SuccessProbability || 0) * 100).toFixed(1)}%
 </span>
 </td>
 <td className="py-4 text-center">
 <span className={`text-xs font-bold px-2 py-1 rounded-full ${getConfidenceColor(pred.ConfidenceLevel)} bg-current/10`}>
 {pred.ConfidenceLevel}
 </span>
 </td>
 <td className="py-4 text-center">
 <span className="text-xs text-[var(--text-muted)]">
 {pred.StatusName || 'N/A'}
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
 <Zap className="w-4 h-4 text-[var(--warning)]" />
 <h4 className="text-xs font-medium text-[var(--text-primary)]">
 Model Weights
 </h4>
 </div>
 <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
 {[
 { label: 'Skill Match', weight: '30%', color: 'text-[var(--accent)]' },
 { label: 'Interview Score', weight: '30%', color: 'text-[var(--accent)]' },
 { label: 'Experience', weight: '25%', color: 'text-[var(--accent)]' },
 { label: 'Engagement', weight: '15%', color: 'text-cyan-400' },
 { label: 'Historical', weight: '±30%', color: 'text-[var(--success)]' }
 ].map((item, idx) => (
 <div key={idx} className="text-center p-3 bg-[var(--bg-accent)] rounded-xl">
 <div className={`text-lg font-semibold ${item.color}`}>{item.weight}</div>
 <div className="text-[11px] font-medium text-[var(--text-muted)]">{item.label}</div>
 </div>
 ))}
 </div>
 </div>
 </div>
 );
};

export default HireSuccessPredictor;
