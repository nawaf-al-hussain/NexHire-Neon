import React from 'react';
import { Target, Plus, CheckCircle, TrendingUp, Calendar, RefreshCw, UsersRound, Heart, Shield, X } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../../apiConfig';
import DiversityChart from '../Charts/DiversityChart';

const DiversityGoals = () => {
 const [goals, setGoals] = React.useState([]);
 const [ethnicityData, setEthnicityData] = React.useState([]);
 const [genderData, setGenderData] = React.useState([]);
 const [disabilityData, setDisabilityData] = React.useState([]);
 const [veteranData, setVeteranData] = React.useState([]);
 const [loading, setLoading] = React.useState(true);
 const [showModal, setShowModal] = React.useState(false);
 const [newGoal, setNewGoal] = React.useState({
 metricType: 'Gender',
 targetPercentage: 30,
 startDate: new Date().toISOString().split('T')[0],
 endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
 });

 React.useEffect(() => {
 fetchData();
 }, []);

 const fetchData = async () => {
 setLoading(true);
 try {
 const [goalsRes, ethnicityRes, genderRes, disabilityRes, veteranRes] = await Promise.all([
 axios.get(`${API_BASE}/analytics/diversity-goals`),
 axios.get(`${API_BASE}/analytics/diversity`),
 axios.get(`${API_BASE}/analytics/diversity-gender`),
 axios.get(`${API_BASE}/analytics/diversity-disability`),
 axios.get(`${API_BASE}/analytics/diversity-veteran`)
 ]);
 setGoals(goalsRes.data || []);
 setEthnicityData(ethnicityRes.data || []);
 setGenderData(genderRes.data || []);
 setDisabilityData(disabilityRes.data || []);
 setVeteranData(veteranRes.data || []);
 } catch (err) {
 console.error("Fetch error:", err);
 // Still try to fetch goals if diversity fails
 try {
 const goalsRes = await axios.get(`${API_BASE}/analytics/diversity-goals`);
 setGoals(goalsRes.data || []);
 } catch (e) {
 console.error("Fetch goals error:", e);
 }
 } finally {
 setLoading(false);
 }
 };

 const createGoal = async (e) => {
 e.preventDefault();
 try {
 await axios.post(`${API_BASE}/analytics/diversity-goals`, newGoal);
 setShowModal(false);
 fetchData();
 setNewGoal({
 metricType: 'Gender',
 targetPercentage: 30,
 startDate: new Date().toISOString().split('T')[0],
 endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
 });
 } catch (err) {
 console.error("Create goal error:", err);
 }
 };

 const getProgressColor = (current, target) => {
 const percentage = (Number(current) / Number(target)) * 100;
 if (isNaN(percentage)) return 'text-[var(--danger)]';
 if (percentage >= 100) return 'text-[var(--success)]';
 if (percentage >= 70) return 'text-[var(--warning)]';
 return 'text-[var(--danger)]';
 };

 const getStatusBadge = (goal) => {
 if (!goal.IsActive) {
 return <span className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-gray-500/10 text-[var(--text-muted)]">Inactive</span>;
 }
 const progress = (Number(goal.CurrentPercentage) / Number(goal.TargetPercentage)) * 100;
 if (isNaN(progress)) {
 return <span className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-[var(--warning)]/10 text-[var(--warning)]">In Progress</span>;
 }
 if (progress >= 100) {
 return <span className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-[var(--success)]/10 text-[var(--success)]">Achieved</span>;
 }
 return <span className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-[var(--warning)]/10 text-[var(--warning)]">In Progress</span>;
 };

 if (loading) {
 return (
 <div className="flex items-center justify-center py-20">
 <RefreshCw className="w-8 h-8 text-[var(--accent)] animate-spin" />
 <span className="ml-3 text-sm font-medium text-[var(--text-muted)]">Loading Goals...</span>
 </div>
 );
 }

 return (
 <div className="space-y-5 sm:space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
 {/* Gradient Header */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8 border border-emerald-500/20">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-4">
 <div className="w-14 h-14 rounded-2xl bg-[var(--success)]/10 flex items-center justify-center text-[var(--success)]">
 <Target size={28} />
 </div>
 <div>
 <h2 className="text-lg sm:text-xl font-medium">Diversity Goals</h2>
 <p className="text-[11px] font-medium text-[var(--text-muted)]">Set and track diversity hiring targets</p>
 </div>
 </div>
 <button
 onClick={() => setShowModal(true)}
 className="bg-[var(--success)] text-white px-6 py-3 rounded-xl font-semibold text-xs flex items-center gap-2 hover:bg-[var(--success)] transition-all"
 >
 <Plus size={18} />
 New Goal
 </button>
 </div>
 </div>

 {/* Diversity Analytics Charts - 3 Column Grid */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
 {/* Hiring Funnel by Stage (uses diversity funnel data) */}
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-[var(--border-primary)]">
 <div className="flex items-center gap-3 mb-4">
 <UsersRound className="w-5 h-5 text-[var(--success)]" />
 <h3 className="text-sm font-medium">Hiring Funnel by Stage</h3>
 </div>
 {ethnicityData.length > 0 ? (
 <DiversityChart
 data={ethnicityData.map(item => ({
 Demographic: item.StatusName || item.statusname,
 Count: Number(item.ApplicationCount || item.applicationcount) || 0,
 Percentage: ethnicityData.length > 0
 ? Math.round((Number(item.ApplicationCount || item.applicationcount) || 0) /
 ethnicityData.reduce((sum, d) => sum + (Number(d.ApplicationCount || d.applicationcount) || 0), 0) * 100)
 : 0
 }))}
 />
 ) : (
 <div className="h-[250px] flex items-center justify-center text-xs font-semibold text-[var(--text-muted)] opacity-50">
 No data
 </div>
 )}
 </div>

 {/* Gender Chart */}
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-[var(--border-primary)]">
 <div className="flex items-center gap-3 mb-4">
 <Heart className="w-5 h-5 text-[var(--danger)]" />
 <h3 className="text-sm font-medium">By Gender</h3>
 </div>
 {genderData.length > 0 ? (
 <DiversityChart
 data={genderData.map(item => ({
 Demographic: item.Gender || item.gender || 'Unknown',
 Count: Number(item.Count || item.count) || 0,
 Percentage: Number(item.Percentage || item.percentage) || 0
 }))}
 />
 ) : (
 <div className="h-[250px] flex items-center justify-center text-xs font-semibold text-[var(--text-muted)] opacity-50">
 No demographic data seeded
 </div>
 )}
 </div>

 {/* Disability & Veteran Combined Chart */}
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-[var(--border-primary)]">
 <div className="flex items-center gap-3 mb-4">
 <Shield className="w-5 h-5 text-[var(--accent)]" />
 <h3 className="text-sm font-medium">By Disability & Veteran</h3>
 </div>
 {disabilityData.length > 0 || veteranData.length > 0 ? (
 <DiversityChart
 data={[
 ...disabilityData.map(item => ({
 Demographic: 'Disability: ' + (item.DisabilityStatus || item.disabilitystatus || 'Unknown'),
 Count: Number(item.Count || item.count) || 0,
 Percentage: Number(item.Percentage || item.percentage) || 0
 })),
 ...veteranData.map(item => ({
 Demographic: 'Veteran: ' + (item.VeteranStatus || item.veteranstatus || 'Unknown'),
 Count: Number(item.Count || item.count) || 0,
 Percentage: Number(item.Percentage || item.percentage) || 0
 }))
 ]}
 />
 ) : (
 <div className="h-[250px] flex items-center justify-center text-xs font-semibold text-[var(--text-muted)] opacity-50">
 No demographic data seeded
 </div>
 )}
 </div>
 </div>

 {/* Stats Summary */}
 <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 <div className="glass-card rounded-2xl p-5 border border-[var(--border-primary)]">
 <div className="flex items-center gap-2 mb-2">
 <Target size={14} className="text-[var(--accent)]" />
 <span className="text-[11px] font-medium text-[var(--text-muted)]">Total Goals</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold text-[var(--accent)]">{goals.length}</div>
 </div>

 <div className="glass-card rounded-2xl p-5 border border-[var(--border-primary)]">
 <div className="flex items-center gap-2 mb-2">
 <CheckCircle size={14} className="text-[var(--success)]" />
 <span className="text-[11px] font-medium text-[var(--text-muted)]">Achieved</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold text-[var(--success)]">
 {goals.filter(g => (Number(g.CurrentPercentage) / Number(g.TargetPercentage)) * 100 >= 100).length}
 </div>
 </div>

 <div className="glass-card rounded-2xl p-5 border border-[var(--border-primary)]">
 <div className="flex items-center gap-2 mb-2">
 <TrendingUp size={14} className="text-[var(--warning)]" />
 <span className="text-[11px] font-medium text-[var(--text-muted)]">In Progress</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold text-[var(--warning)]">
 {goals.filter(g => g.IsActive && (Number(g.CurrentPercentage) / Number(g.TargetPercentage)) * 100 < 100).length}
 </div>
 </div>

 <div className="glass-card rounded-2xl p-5 border border-[var(--border-primary)]">
 <div className="flex items-center gap-2 mb-2">
 <Calendar size={14} className="text-[var(--accent)]" />
 <span className="text-[11px] font-medium text-[var(--text-muted)]">Active</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold text-[var(--accent)]">
 {goals.filter(g => g.IsActive).length}
 </div>
 </div>
 </div>

 {/* Goals List */}
 {goals.length === 0 ? (
 <div className="glass-card rounded-[var(--radius-xl)] p-12 text-center border-2 border-dashed border-[var(--border-primary)]">
 <Target size={48} className="mx-auto text-[var(--accent)]/30 mb-4" />
 <p className="text-[var(--text-muted)] font-bold">No diversity goals set yet</p>
 <p className="text-xs text-[var(--text-muted)] mt-2">Create your first goal to start tracking DEI metrics</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
 {goals.map((goal) => {
 const progress = Math.min(100, (Number(goal.CurrentPercentage) / Number(goal.TargetPercentage)) * 100);
 const safeProgress = isNaN(progress) ? 0 : progress;
 return (
 <div key={goal.GoalID} className="glass-card rounded-[var(--radius-xl)] p-6 border border-[var(--border-primary)]">
 <div className="flex items-center justify-between mb-4">
 <span className="px-3 py-1 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-semibold">
 {goal.MetricType}
 </span>
 {getStatusBadge(goal)}
 </div>

 <div className="mb-4">
 <div className="flex justify-between text-xs font-medium mb-2">
 <span className="text-[var(--text-muted)]">Progress</span>
 <span className={getProgressColor(goal.CurrentPercentage, goal.TargetPercentage)}>
 {goal.CurrentPercentage}% / {goal.TargetPercentage}%
 </span>
 </div>
 <div className="w-full h-3 bg-[var(--bg-accent)] rounded-full overflow-hidden">
 <div
 className={`h-full rounded-full transition-all ${safeProgress >= 100 ? 'bg-[var(--success)]' : safeProgress >= 70 ? 'bg-[var(--warning)]' : 'bg-[var(--danger)]'}`}
 style={{ width: `${safeProgress}%` }}
 ></div>
 </div>
 </div>

 <div className="flex justify-between text-[11px] font-medium text-[var(--text-muted)]">
 <span>Start: {goal.StartDate ? new Date(goal.StartDate).toLocaleDateString() : 'N/A'}</span>
 <span>End: {goal.EndDate ? new Date(goal.EndDate).toLocaleDateString() : 'N/A'}</span>
 </div>

 {goal.RecruiterName && (
 <p className="text-[11px] text-[var(--text-muted)] mt-3 pt-3 border-t border-[var(--border-primary)]">
 Created by: {goal.RecruiterName}
 </p>
 )}
 </div>
 );
 })}
 </div>
 )}

 {/* Modal */}
 {showModal && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300">
 <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>

 <div className="relative bg-[var(--bg-primary)] border border-[var(--border-primary)] w-full max-w-md overflow-hidden rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] flex flex-col text-[var(--text-primary)]">
 {/* Header */}
 <div className="p-8 border-b border-[var(--border-primary)] flex items-center justify-between">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-2xl bg-[var(--success)]/10 border border-emerald-500/20 flex items-center justify-center">
 <Target className="text-[var(--success)]" size={24} />
 </div>
 <div>
 <h3 className="text-lg sm:text-xl font-semibold tracking-tight">Create Diversity Goal</h3>
 <p className="text-[11px] font-semibold text-[var(--text-muted)] mt-1 italic">Set measurable diversity targets</p>
 </div>
 </div>
 <button
 onClick={() => setShowModal(false)}
 className="p-2 hover:bg-[var(--bg-tertiary)] rounded-xl transition-all"
 >
 <X size={20} className="text-[var(--text-muted)]" />
 </button>
 </div>

 <div className="p-8">
 <form onSubmit={createGoal} className="space-y-6">
 <div>
 <label className="text-[11px] font-medium text-[var(--text-muted)] mb-3 block">
 Metric Type
 </label>
 <select
 value={newGoal.metricType}
 onChange={(e) => setNewGoal({ ...newGoal, metricType: e.target.value })}
 className="w-full px-4 py-4 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[var(--text-primary)] font-bold focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 outline-none transition-all"
 >
 <option value="Gender">Gender</option>
 <option value="Ethnicity">Ethnicity</option>
 <option value="Disability">Disability</option>
 <option value="Veteran">Veteran</option>
 </select>
 </div>

 <div>
 <label className="text-[11px] font-medium text-[var(--text-muted)] mb-3 block">
 Target Percentage (%)
 </label>
 <input
 type="number"
 min="1"
 max="100"
 value={newGoal.targetPercentage}
 onChange={(e) => setNewGoal({ ...newGoal, targetPercentage: parseInt(e.target.value) })}
 className="w-full px-4 py-4 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[var(--text-primary)] font-bold focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 outline-none transition-all"
 />
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="text-[11px] font-medium text-[var(--text-muted)] mb-3 block">
 Start Date
 </label>
 <input
 type="date"
 value={newGoal.startDate}
 onChange={(e) => setNewGoal({ ...newGoal, startDate: e.target.value })}
 className="w-full px-4 py-4 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[var(--text-primary)] font-bold focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 outline-none transition-all"
 />
 </div>
 <div>
 <label className="text-[11px] font-medium text-[var(--text-muted)] mb-3 block">
 End Date
 </label>
 <input
 type="date"
 value={newGoal.endDate}
 onChange={(e) => setNewGoal({ ...newGoal, endDate: e.target.value })}
 className="w-full px-4 py-4 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[var(--text-primary)] font-bold focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 outline-none transition-all"
 />
 </div>
 </div>

 <div className="flex gap-3 pt-2">
 <button
 type="button"
 onClick={() => setShowModal(false)}
 className="flex-1 px-6 py-4 rounded-2xl border border-[var(--border-primary)] text-[var(--text-secondary)] font-semibold text-xs hover:bg-[var(--bg-accent)] transition-all"
 >
 Cancel
 </button>
 <button
 type="submit"
 className="flex-1 px-6 py-4 rounded-2xl bg-[var(--accent)] text-white font-semibold text-xs shadow-lg transition-all"
 >
 Create Goal
 </button>
 </div>
 </form>
 </div>
 </div>
 </div>
 )}
 </div>
 );
};

export default DiversityGoals;
