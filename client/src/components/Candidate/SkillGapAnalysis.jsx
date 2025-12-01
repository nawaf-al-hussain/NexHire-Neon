import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, BookOpen, Target, AlertTriangle, CheckCircle, Zap, BarChart3, Loader2, ArrowRight } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../../apiConfig';

const SkillGapAnalysis = ({ skillGaps: initialSkillGaps, loading: initialLoading, onRefresh, onNavigateToLearning }) => {
 const [skillGaps, setSkillGaps] = useState([]);
 const [skillsDemand, setSkillsDemand] = useState([]);
 const [loading, setLoading] = useState(true);
 const [activeTab, setActiveTab] = useState('gaps');

 useEffect(() => {
 if (initialSkillGaps) {
 setSkillGaps(initialSkillGaps);
 setLoading(initialLoading || false);
 } else {
 fetchSkillGapData();
 }
 fetchSkillsDemand();
 }, [initialSkillGaps, initialLoading]);

 const fetchSkillGapData = async () => {
 try {
 setLoading(true);
 const res = await axios.get(`${API_BASE}/candidates/skill-gap-analysis`);
 setSkillGaps(res.data);
 } catch (err) {
 console.error("Fetch Skill Gap Error:", err);
 } finally {
 setLoading(false);
 }
 };

 const fetchSkillsDemand = async () => {
 try {
 const res = await axios.get(`${API_BASE}/candidates/skills-demand`);
 setSkillsDemand(res.data);
 } catch (err) {
 console.error("Fetch Skills Demand Error:", err);
 }
 };

 const getGapCategoryStyle = (category) => {
 switch (category) {
 case 'Critical Gap':
 return 'bg-[var(--danger)]/10 border-[var(--danger)]/20 text-[var(--danger)]';
 case 'Learning Opportunity':
 return 'bg-[var(--warning)]/10 border-amber-500/20 text-[var(--warning)]';
 case 'Adequate':
 return 'bg-[var(--success)]/10 border-emerald-500/20 text-[var(--success)]';
 default:
 return 'bg-gray-500/10 border-gray-500/20 text-[var(--text-muted)]';
 }
 };

 const getTrendIcon = (direction) => {
 switch (direction) {
 case 'Up':
 case 'Rising':
 return <TrendingUp className="w-4 h-4 text-[var(--success)]" />;
 case 'Down':
 case 'Falling':
 return <TrendingDown className="w-4 h-4 text-[var(--danger)]" />;
 default:
 return <Minus className="w-4 h-4 text-[var(--text-muted)]" />;
 }
 };

 const getDemandLevelBars = (level) => {
 return Array.from({ length: 5 }, (_, i) => (
 <div
 key={i}
 className={`w-2 h-6 rounded-sm ${i < level ? 'bg-[var(--accent)]' : 'bg-[var(--bg-accent)]'}`}
 ></div>
 ));
 };

 const getProficiencyBars = (level) => {
 return Array.from({ length: 5 }, (_, i) => (
 <div
 key={i}
 className={`w-2 h-6 rounded-sm ${i < level ? 'bg-[var(--success)]' : 'bg-[var(--bg-accent)]'}`}
 ></div>
 ));
 };

 const criticalGaps = skillGaps.filter(s => s.GapCategory === 'Critical Gap' || s.GapScore > 2);
 const learningOpportunities = skillGaps.filter(s => s.GapCategory === 'Learning Opportunity');
 const adequateSkills = skillGaps.filter(s => s.GapCategory === 'Adequate');

 if (loading) {
 return (
 <div className="flex flex-col items-center justify-center py-20">
 <Loader2 className="w-12 h-12 text-[var(--accent)] animate-spin mb-4" />
 <p className="text-[11px] font-semibold text-[var(--text-muted)]">Loading…</p>
 </div>
 );
 }

 return (
 <div className="space-y-5 sm:space-y-8">
 {/* Header */}
 <div className="flex items-center gap-3 mb-6">
 <BarChart3 className="w-5 h-5 text-[var(--accent)]" />
 <h2 className="text-lg font-medium">Skill Gap Analysis</h2>
 </div>

 {/* Tab Buttons */}
 <div className="flex items-center gap-2 mb-6">
 <button
 onClick={() => setActiveTab('gaps')}
 className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${activeTab === 'gaps'
 ? 'bg-[var(--accent)] text-white'
 : 'bg-[var(--bg-accent)] border border-[var(--border-primary)] text-[var(--text-muted)]'
 }`}
 >
 My Gaps
 </button>
 <button
 onClick={() => setActiveTab('market')}
 className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${activeTab === 'market'
 ? 'bg-[var(--accent)] text-white'
 : 'bg-[var(--bg-accent)] border border-[var(--border-primary)] text-[var(--text-muted)]'
 }`}
 >
 Market Demand
 </button>
 </div>

 {activeTab === 'gaps' ? (
 <>
 {/* Summary Cards */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-[var(--danger)]/20">
 <div className="flex items-center gap-3 mb-2">
 <AlertTriangle size={18} className="text-[var(--danger)]" />
 <span className="text-[11px] font-medium text-[var(--danger)]">Critical Gaps</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">{criticalGaps.length}</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Need Attention</p>
 </div>
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-amber-500/20">
 <div className="flex items-center gap-3 mb-2">
 <BookOpen size={18} className="text-[var(--warning)]" />
 <span className="text-[11px] font-medium text-[var(--warning)]">Learning Ops</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">{learningOpportunities.length}</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Available</p>
 </div>
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-emerald-500/20">
 <div className="flex items-center gap-3 mb-2">
 <CheckCircle size={18} className="text-[var(--success)]" />
 <span className="text-[11px] font-medium text-[var(--success)]">Adequate</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">{adequateSkills.length}</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Skills Strong</p>
 </div>
 </div>

 {/* Skill Gaps List */}
 {skillGaps.length === 0 ? (
 <div className="p-12 border-2 border-dashed border-[var(--border-primary)] rounded-[var(--radius-xl)] text-center bg-[var(--bg-accent)]/5">
 <BarChart3 className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-6 opacity-20" />
 <p className="text-xs font-semibold text-[var(--text-muted)] mb-4">
 No skill gap data available yet.
 </p>
 <p className="text-[11px] text-[var(--text-muted)] opacity-60">
 Add skills to your profile to see gap analysis.
 </p>
 </div>
 ) : (
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
 {skillGaps.map((skill, index) => (
 <div
 key={`${skill.SkillID}-${index}`}
 className="glass-card p-8 rounded-[var(--radius-xl)] hover:border-[var(--accent)] transition-all group"
 >
 <div className="flex items-start justify-between mb-6">
 <div className="flex items-center gap-4">
 <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)] flex items-center justify-center">
 <Target className="w-6 h-6 text-[var(--accent)]" />
 </div>
 <div>
 <h3 className="text-lg sm:text-xl font-semibold">{skill.SkillName}</h3>
 <p className="text-[11px] font-bold text-[var(--text-muted)] mt-1">
 {skill.GapCategory || 'Gap'}
 </p>
 </div>
 </div>
 <div className="text-right">
 <div className="text-2xl sm:text-3xl font-semibold text-[var(--danger)]">
 {skill.GapScore || 0}
 </div>
 <p className="text-[11px] font-semibold text-[var(--text-muted)]">Gap Score</p>
 </div>
 </div>

 {/* Skills Gap */}
 <div className="mb-6">
 <h4 className="text-[11px] font-medium text-[var(--text-muted)] mb-4">
 Your Proficiency vs Market Demand
 </h4>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <div className="flex items-center justify-between mb-2">
 <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase">Your Level</span>
 <span className="text-xs font-semibold">{skill.ProficiencyLevel || 0}/5</span>
 </div>
 <div className="flex items-center gap-1">
 {getProficiencyBars(skill.ProficiencyLevel || 0)}
 </div>
 </div>
 <div>
 <div className="flex items-center justify-between mb-2">
 <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase">Market Demand</span>
 <span className="text-xs font-semibold">{skill.DemandLevel || 0}/5</span>
 </div>
 <div className="flex items-center gap-1">
 {getDemandLevelBars(skill.DemandLevel || 0)}
 </div>
 </div>
 </div>
 </div>

 {/* Action */}
 {skill.GapCategory === 'Critical Gap' && (
 <div className="flex items-center justify-between pt-4 border-t border-[var(--border-primary)]">
 <span className={`px-3 py-1 rounded-lg text-[11px] font-semibold border ${getGapCategoryStyle(skill.GapCategory)}`}>
 {skill.GapCategory}
 </span>
 <button
 onClick={() => onNavigateToLearning && onNavigateToLearning(skill.SkillName)}
 className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-xl text-xs font-bold hover:bg-[var(--accent-hover)] transition-colors"
 >
 Start Learning
 <ArrowRight className="w-4 h-4" />
 </button>
 </div>
 )}

 </div>
 ))}
 </div>
 )}
 </>
 ) : (
 <>
 {/* Market Demand View */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-[var(--accent)]">
 <div className="flex items-center gap-3 mb-2">
 <TrendingUp size={18} className="text-[var(--accent)]" />
 <span className="text-[11px] font-medium text-[var(--accent)]">Highest Demand</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">
 {skillsDemand.length > 0 ? skillsDemand[0]?.SkillName : 'N/A'}
 </div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">In Market</p>
 </div>
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-emerald-500/20">
 <div className="flex items-center gap-3 mb-2">
 <BarChart3 size={18} className="text-[var(--success)]" />
 <span className="text-[11px] font-medium text-[var(--success)]">Skills Tracked</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">{skillsDemand.length}</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Market Data</p>
 </div>
 </div>

 {/* Skills Demand List */}
 {skillsDemand.length === 0 ? (
 <div className="p-12 border-2 border-dashed border-[var(--border-primary)] rounded-[var(--radius-xl)] text-center bg-[var(--bg-accent)]/5">
 <BarChart3 className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-6 opacity-20" />
 <p className="text-xs font-semibold text-[var(--text-muted)] mb-4">
 No market data available yet.
 </p>
 <p className="text-[11px] text-[var(--text-muted)] opacity-60">
 Market intelligence data is being collected.
 </p>
 </div>
 ) : (
 <div className="space-y-4">
 {skillsDemand.map((skill, index) => (
 <div
 key={`skill-${skill.SkillID}-${index}`}
 className="glass-card p-6 rounded-[var(--radius-xl)] hover:border-[var(--accent)] transition-all"
 >
 <div className="flex items-center justify-between mb-4">
 <div className="flex items-center gap-4">
 <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)] flex items-center justify-center">
 <span className="text-sm font-semibold text-[var(--accent)]">{index + 1}</span>
 </div>
 <div>
 <h4 className="text-lg font-semibold">{skill.SkillName}</h4>
 <div className="flex items-center gap-2 mt-1">
 {getTrendIcon(skill.TrendDirection)}
 <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase">
 {skill.TrendDirection || 'Stable'}
 </span>
 </div>
 </div>
 </div>
 {skill.AvgSalary && (
 <span className="text-lg font-semibold text-[var(--success)]">
 ${skill.AvgSalary.toLocaleString()}
 </span>
 )}
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <div className="flex items-center justify-between mb-1">
 <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase">Demand</span>
 <span className="text-[11px] font-semibold">{skill.DemandScore || 0}%</span>
 </div>
 <div className="h-2 bg-[var(--bg-accent)] rounded-full overflow-hidden">
 <div
 className="h-full bg-[var(--accent)] rounded-full"
 style={{ width: `${skill.DemandScore || 0}%` }}
 ></div>
 </div>
 </div>
 <div>
 <div className="flex items-center justify-between mb-1">
 <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase">Supply</span>
 <span className="text-[11px] font-semibold">{skill.SupplyScore || 0}%</span>
 </div>
 <div className="h-2 bg-[var(--bg-accent)] rounded-full overflow-hidden">
 <div
 className="h-full bg-[var(--success)] rounded-full"
 style={{ width: `${skill.SupplyScore || 0}%` }}
 ></div>
 </div>
 </div>
 </div>
 </div>
 ))}
 </div>
 )}
 </>
 )}

 {/* Pro Tips */}
 <div className="bg-[var(--bg-accent)] rounded-[var(--radius-xl)] p-8 border border-[var(--border-primary)]">
 <div className="flex items-center gap-3 mb-4">
 <Zap className="w-5 h-5 text-[var(--warning)]" />
 <h3 className="text-sm font-medium">Pro Tips</h3>
 </div>
 <ul className="space-y-3">
 <li className="flex items-start gap-3 text-xs font-medium text-[var(--text-muted)]">
 <span className="w-2 h-2 rounded-full bg-[var(--accent)] mt-1.5 shrink-0"></span>
 Focus on skills with high demand but low supply for better job prospects
 </li>
 <li className="flex items-start gap-3 text-xs font-medium text-[var(--text-muted)]">
 <span className="w-2 h-2 rounded-full bg-[var(--accent)] mt-1.5 shrink-0"></span>
 Prioritize critical gaps to improve your application success rate
 </li>
 <li className="flex items-start gap-3 text-xs font-medium text-[var(--text-muted)]">
 <span className="w-2 h-2 rounded-full bg-[var(--accent)] mt-1.5 shrink-0"></span>
 Use the Learning Paths tab to generate personalized training plans
 </li>
 </ul>
 </div>
 </div>
 );
};

export default SkillGapAnalysis;
