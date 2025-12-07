import React, { useState } from 'react';
import { FileText, CheckCircle, AlertCircle, Loader2, TrendingUp } from 'lucide-react';

const ResumeScore = ({ resumeData, loading }) => {
 const [analyzing, setAnalyzing] = useState(false);

 if (loading || analyzing) {
 return (
 <div className="flex flex-col items-center justify-center py-20">
 <Loader2 className="w-12 h-12 text-[var(--accent)] animate-spin mb-4" />
 <p className="text-[11px] font-semibold text-[var(--text-muted)]">
 {analyzing ? 'Analyzing Resume...' : 'Loading Resume Analysis...'}
 </p>
 </div>
 );
 }

 // Use actual data if available, otherwise show N/A
 const hasData = resumeData && resumeData.overallScore > 0;
 const data = hasData ? resumeData : null;

 const getScoreColor = (score) => {
 if (score >= 80) return 'text-[var(--success)]';
 if (score >= 60) return 'text-[var(--warning)]';
 return 'text-[var(--danger)]';
 };

 // If no data, show empty state
 if (!data) {
 return (
 <div className="space-y-5 sm:space-y-8">
 <div className="flex items-center gap-3 mb-6">
 <FileText className="w-5 h-5 text-[var(--accent)]" />
 <h2 className="text-lg font-medium">Resume Score</h2>
 </div>
 <div className="glass-card p-12 rounded-[var(--radius-xl)] text-center">
 <FileText className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-6 opacity-20" />
 <p className="text-sm font-semibold text-[var(--text-muted)] mb-2">No Resume Data Available</p>
 <p className="text-xs text-[var(--text-muted)] opacity-60">Upload your resume to get an AI-powered analysis</p>
 </div>
 </div>
 );
 }

 return (
 <div className="space-y-5 sm:space-y-8">
 <div className="flex items-center gap-3 mb-6">
 <FileText className="w-5 h-5 text-[var(--accent)]" />
 <h2 className="text-lg font-medium">Resume Score</h2>
 </div>

 {/* Overall Score */}
 <div className="glass-card p-8 rounded-[var(--radius-xl)]">
 <div className="flex items-center justify-between mb-6">
 <h3 className="text-sm font-medium">Overall Quality Score</h3>
 <span className={`text-4xl font-semibold ${getScoreColor(data.overallScore)}`}>
 {data.overallScore}/100
 </span>
 </div>

 {/* Progress Bar */}
 <div className="w-full h-6 bg-[var(--bg-accent)] rounded-full overflow-hidden mb-6">
 <div
 className={`h-full transition-all duration-1000 ${data.overallScore >= 80 ? 'bg-[var(--success)]' :
 data.overallScore >= 60 ? 'bg-[var(--warning)]' : 'bg-[var(--danger)]'
 }`}
 style={{ width: `${data.overallScore}%` }}
 ></div>
 </div>

 <p className="text-xs text-[var(--text-muted)] text-center">
 {data.overallScore >= 80 ? 'Excellent resume! You\'re ready to apply.' :
 data.overallScore >= 60 ? 'Good resume. Consider improving the factors below.' :
 'Needs improvement. Update your resume to increase your chances.'}
 </p>
 </div>

 {/* Factors */}
 <div className="glass-card p-8 rounded-[var(--radius-xl)]">
 <h3 className="text-sm font-medium mb-6">Score Factors</h3>

 <div className="space-y-4">
 {data.factors && data.factors.map((factor, index) => (
 <div key={index} className="flex items-center justify-between p-4 bg-[var(--bg-accent)] rounded-2xl border border-[var(--border-primary)]">
 <div className="flex items-center gap-3">
 {factor.points > 0 ? (
 <CheckCircle className="w-5 h-5 text-[var(--success)]" />
 ) : (
 <AlertCircle className="w-5 h-5 text-[var(--danger)]" />
 )}
 <span className="text-xs font-semibold">{factor.factor}</span>
 </div>
 <span className={`text-xs font-semibold ${factor.points > 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
 +{factor.points} pts
 </span>
 </div>
 ))}
 </div>
 </div>

 {/* Tips */}
 <div className="bg-[var(--bg-accent)] rounded-[var(--radius-xl)] p-8 border border-[var(--border-primary)]">
 <div className="flex items-center gap-3 mb-4">
 <TrendingUp className="w-5 h-5 text-[var(--warning)]" />
 <h3 className="text-sm font-medium">How to Improve</h3>
 </div>
 <ul className="space-y-3">
 <li className="flex items-start gap-3 text-xs font-medium text-[var(--text-muted)]">
 <span className="w-2 h-2 rounded-full bg-[var(--accent)] mt-1.5 shrink-0"></span>
 Add a compelling professional summary at the top
 </li>
 <li className="flex items-start gap-3 text-xs font-medium text-[var(--text-muted)]">
 <span className="w-2 h-2 rounded-full bg-[var(--accent)] mt-1.5 shrink-0"></span>
 Include quantifiable achievements (e.g., "increased sales by 25%")
 </li>
 <li className="flex items-start gap-3 text-xs font-medium text-[var(--text-muted)]">
 <span className="w-2 h-2 rounded-full bg-[var(--accent)] mt-1.5 shrink-0"></span>
 Tailor your skills section to match job requirements
 </li>
 <li className="flex items-start gap-3 text-xs font-medium text-[var(--text-muted)]">
 <span className="w-2 h-2 rounded-full bg-[var(--accent)] mt-1.5 shrink-0"></span>
 Keep it to 1-2 pages maximum
 </li>
 </ul>
 </div>
 </div>
 );
};

export default ResumeScore;
