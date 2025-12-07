import React from 'react';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Smile, Frown, Meh } from 'lucide-react';

/**
 * SentimentChart - Visualizes candidate sentiment data
 * @param {Object} summary - Sentiment summary with AvgSentimentScore, TotalInteractions, etc.
 * @param {Array} history - Array of sentiment records over time
 */
const SentimentChart = ({ summary = {}, history = [], compact = false }) => {
 const avgScore = summary.AvgSentimentScore || 0;
 const totalInteractions = summary.TotalInteractions || 0;
 const redFlags = summary.TotalRedFlags || 0;
 const positiveIndicators = summary.TotalPositiveIndicators || 0;

 // Determine sentiment category
 const getSentimentCategory = (score) => {
 if (score >= 0.5) return { label: 'Very Positive', color: 'text-[var(--success)]', bg: 'bg-[var(--success)]' };
 if (score >= 0.2) return { label: 'Positive', color: 'text-[var(--success)]', bg: 'bg-[var(--success)]' };
 if (score >= -0.2) return { label: 'Neutral', color: 'text-[var(--warning)]', bg: 'bg-[var(--warning)]' };
 if (score >= -0.5) return { label: 'Negative', color: 'text-[var(--warning)]', bg: 'bg-orange-500' };
 return { label: 'Very Negative', color: 'text-[var(--danger)]', bg: 'bg-[var(--danger)]' };
 };

 const sentiment = getSentimentCategory(avgScore);

 // Get sentiment icon
 const getSentimentIcon = (score) => {
 if (score >= 0.3) return <Smile className="text-[var(--success)]" size={24} />;
 if (score <= -0.3) return <Frown className="text-[var(--danger)]" size={24} />;
 return <Meh className="text-[var(--warning)]" size={24} />;
 };

 // Get trend indicator
 const getTrendIndicator = () => {
 // Ensure history is an array
 const historyArray = Array.isArray(history) ? history : [];
 if (historyArray.length < 2) return null;

 const recent = historyArray.slice(0, Math.min(5, historyArray.length));
 const older = historyArray.slice(Math.min(5, historyArray.length), Math.min(10, historyArray.length));

 if (older.length === 0) return null;

 const recentAvg = recent.reduce((sum, r) => sum + (r.SentimentScore || 0), 0) / recent.length;
 const olderAvg = older.reduce((sum, r) => sum + (r.SentimentScore || 0), 0) / older.length;

 const diff = recentAvg - olderAvg;

 if (diff > 0.1) return { icon: TrendingUp, text: 'Improving', color: 'text-[var(--success)]' };
 if (diff < -0.1) return { icon: TrendingDown, text: 'Declining', color: 'text-[var(--danger)]' };
 return { icon: Minus, text: 'Stable', color: 'text-[var(--warning)]' };
 };

 const trend = getTrendIndicator();

 // Mini bar chart for history
 const renderMiniChart = () => {
 const historyArray = Array.isArray(history) ? history : [];
 if (!historyArray || historyArray.length === 0) {
 return (
 <div className="flex items-center justify-center h-16 text-[var(--text-muted)]">
 <p className="text-[11px] font-bold">No sentiment data yet</p>
 </div>
 );
 }

 const maxBars = 20;
 const bars = historyArray.slice(0, maxBars).reverse();

 return (
 <div className="flex items-end gap-1 h-16">
 {bars.map((item, i) => {
 const score = item.SentimentScore || 0;
 const height = Math.abs(score) * 100;
 const category = getSentimentCategory(score);

 return (
 <div
 key={i}
 className="flex-1 flex flex-col justify-end h-full"
 title={`${item.InteractionType}: ${Number(score || 0).toFixed(2)}`}
 >
 <div
 className={`w-full rounded-t-sm ${category.bg} opacity-80`}
 style={{ height: `${Math.max(height, 10)}%` }}
 />
 </div>
 );
 })}
 </div>
 );
 };

 // Compact view for cards
 if (compact) {
 return (
 <div className="flex items-center gap-4">
 <div className="flex items-center gap-2">
 {getSentimentIcon(avgScore)}
 <span className={`text-sm font-semibold ${sentiment.color}`}>
 {Number(avgScore || 0).toFixed(2)}
 </span>
 </div>
 {trend && (
 <div className={`flex items-center gap-1 ${trend.color}`}>
 <trend.icon size={14} />
 <span className="text-[11px] font-bold uppercase">{trend.text}</span>
 </div>
 )}
 {redFlags > 0 && (
 <div className="flex items-center gap-1 text-[var(--danger)]">
 <AlertTriangle size={14} />
 <span className="text-[11px] font-bold">{redFlags}</span>
 </div>
 )}
 </div>
 );
 }

 return (
 <div className="space-y-6">
 {/* Main Score Display */}
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-4">
 {getSentimentIcon(avgScore)}
 <div>
 <div className="flex items-center gap-2">
 <span className={`text-2xl sm:text-3xl font-semibold ${sentiment.color}`}>
 {Number(avgScore || 0).toFixed(2)}
 </span>
 <span className="text-xs font-bold text-[var(--text-muted)]">/ 1.0</span>
 </div>
 <p className={`text-[11px] font-medium ${sentiment.color}`}>
 {sentiment.label}
 </p>
 </div>
 </div>

 {trend && (
 <div className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--bg-accent)] ${trend.color}`}>
 <trend.icon size={16} />
 <span className="text-[11px] font-medium">{trend.text}</span>
 </div>
 )}
 </div>

 {/* Sentiment Gauge */}
 <div className="relative">
 <div className="h-3 rounded-full bg-[var(--text-muted)] opacity-30" />
 <div
 className="absolute top-0 w-4 h-4 rounded-full bg-white border-2 shadow-lg transform -translate-x-1/2"
 style={{ left: `${((avgScore + 1) / 2) * 100}%` }}
 />
 <div className="flex justify-between mt-2">
 <span className="text-[11px] font-semibold text-[var(--danger)]">-1.0</span>
 <span className="text-[11px] font-semibold text-[var(--warning)]">0</span>
 <span className="text-[11px] font-semibold text-[var(--success)]">+1.0</span>
 </div>
 </div>

 {/* Stats Grid */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 <div className="text-center p-3 bg-[var(--bg-accent)] rounded-xl">
 <p className="text-lg font-semibold text-[var(--text-primary)]">{totalInteractions}</p>
 <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase">Interactions</p>
 </div>
 <div className="text-center p-3 bg-[var(--bg-accent)] rounded-xl">
 <p className="text-lg font-semibold text-[var(--success)]">{positiveIndicators}</p>
 <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase">Positive</p>
 </div>
 <div className="text-center p-3 bg-[var(--bg-accent)] rounded-xl">
 <p className="text-lg font-semibold text-[var(--danger)]">{redFlags}</p>
 <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase">Red Flags</p>
 </div>
 <div className="text-center p-3 bg-[var(--bg-accent)] rounded-xl">
 <p className="text-lg font-semibold text-[var(--text-primary)]">
 {summary.DominantCommunicationStyle || 'N/A'}
 </p>
 <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase">Style</p>
 </div>
 </div>

 {/* Mini Chart */}
 <div>
 <p className="text-[11px] font-semibold text-[var(--text-muted)] mb-3">
 Sentiment History (Last {Math.min(history.length, 20)} Interactions)
 </p>
 {renderMiniChart()}
 </div>

 {/* Interaction Type Breakdown */}
 {(summary.EmailCount > 0 || summary.InterviewCount > 0 || summary.CallCount > 0 || summary.ChatCount > 0) && (
 <div className="flex flex-wrap gap-2">
 {summary.EmailCount > 0 && (
 <span className="px-3 py-1 bg-[var(--accent-soft)] text-[var(--accent)] rounded-full text-[11px] font-bold">
 {summary.EmailCount} Emails
 </span>
 )}
 {summary.InterviewCount > 0 && (
 <span className="px-3 py-1 bg-[var(--warning)]/10 text-[var(--warning)] rounded-full text-[11px] font-bold">
 {summary.InterviewCount} Interviews
 </span>
 )}
 {summary.CallCount > 0 && (
 <span className="px-3 py-1 bg-[var(--success)]/10 text-[var(--success)] rounded-full text-[11px] font-bold">
 {summary.CallCount} Calls
 </span>
 )}
 {summary.ChatCount > 0 && (
 <span className="px-3 py-1 bg-[var(--danger)]/10 text-[var(--danger)] rounded-full text-[11px] font-bold">
 {summary.ChatCount} Chats
 </span>
 )}
 </div>
 )}
 </div>
 );
};

export default SentimentChart;
