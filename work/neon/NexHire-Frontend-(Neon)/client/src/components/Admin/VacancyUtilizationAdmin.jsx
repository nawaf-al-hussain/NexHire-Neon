import React from 'react';
import { Briefcase, Users, TrendingUp, RefreshCw } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../../apiConfig';
import VacancyUtilizationChart from '../Charts/VacancyUtilizationChart';

const VacancyUtilizationAdmin = () => {
 const [vacancyData, setVacancyData] = React.useState([]);
 const [loading, setLoading] = React.useState(true);

 React.useEffect(() => {
 const fetchData = async () => {
 setLoading(true);
 try {
 // Fetch from the same endpoint as Core Analytics
 const res = await axios.get(`${API_BASE}/analytics/utilization`);
 if (res.data && Array.isArray(res.data)) {
 setVacancyData(res.data);
 }
 } catch (err) {
 console.error("Vacancy Utilization Fetch Error:", err);
 // Fallback to sample data if API fails
 setVacancyData([
 { JobTitle: 'Senior Developer', Vacancies: 5, FilledPositions: 4, ApplicationCount: 45 },
 { JobTitle: 'UX Designer', Vacancies: 3, FilledPositions: 2, ApplicationCount: 32 },
 { JobTitle: 'Product Manager', Vacancies: 2, FilledPositions: 1, ApplicationCount: 28 },
 { JobTitle: 'Data Analyst', Vacancies: 4, FilledPositions: 1, ApplicationCount: 18 },
 { JobTitle: 'DevOps Engineer', Vacancies: 3, FilledPositions: 3, ApplicationCount: 52 }
 ]);
 } finally {
 setLoading(false);
 }
 };
 fetchData();
 }, []);

 // Calculate summary stats
 const totalVacancies = vacancyData.reduce((sum, j) => sum + (j.Vacancies || 0), 0);
 const totalFilled = vacancyData.reduce((sum, j) => sum + (j.FilledPositions || 0), 0);
 const totalApplications = vacancyData.reduce((sum, j) => sum + (j.ApplicationCount || 0), 0);
 const overallUtilization = totalVacancies > 0 ? Math.round((totalFilled / totalVacancies) * 100) : 0;

 if (loading) {
 return (
 <div className="flex items-center justify-center py-20">
 <RefreshCw className="w-8 h-8 text-[var(--accent)] animate-spin" />
 <span className="ml-3 text-sm font-medium text-[var(--text-muted)]">Loading Vacancy Data...</span>
 </div>
 );
 }

 return (
 <div className="space-y-6 sm:space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
 {/* Header */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8 border border-[var(--accent)]/20">
 <div className="flex items-center gap-4">
 <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
 <Briefcase size={28} />
 </div>
 <div>
 <h2 className="text-lg sm:text-xl font-medium">Vacancy Utilization</h2>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Job posting effectiveness overview</p>
 </div>
 </div>
 </div>

 {/* Summary Stats */}
 <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-[var(--accent)]">
 <div className="flex items-center gap-3 mb-2">
 <Briefcase size={18} className="text-[var(--accent)]" />
 <span className="text-[11px] font-medium text-[var(--accent)]">Total Jobs</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">{vacancyData.length}</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Active Postings</p>
 </div>
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-[var(--accent)]/20">
 <div className="flex items-center gap-3 mb-2">
 <Users size={18} className="text-[var(--accent)]" />
 <span className="text-[11px] font-medium text-[var(--accent)]">Vacancies</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">{totalVacancies}</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Total Positions</p>
 </div>
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-emerald-500/20">
 <div className="flex items-center gap-3 mb-2">
 <TrendingUp size={18} className="text-[var(--success)]" />
 <span className="text-[11px] font-medium text-[var(--success)]">Filled</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">{totalFilled}</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Positions</p>
 </div>
 <div className="glass-card rounded-[var(--radius-xl)] p-6 border border-cyan-500/20">
 <div className="flex items-center gap-3 mb-2">
 <TrendingUp size={18} className="text-[var(--accent)]" />
 <span className="text-[11px] font-medium text-[var(--accent)]">Utilization</span>
 </div>
 <div className="text-2xl sm:text-3xl font-semibold">{overallUtilization}%</div>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">Fill Rate</p>
 </div>
 </div>

 {/* Progress Bar Chart */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8">
 <div className="flex items-center gap-3 mb-6">
 <TrendingUp className="w-5 h-5 text-[var(--success)]" />
 <h3 className="text-sm font-medium">Utilization by Job</h3>
 </div>
 <VacancyUtilizationChart data={vacancyData} />
 </div>

 {/* Detailed Table */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8">
 <h3 className="text-lg font-medium mb-6">Job Vacancy Breakdown</h3>
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="text-[11px] font-medium text-[var(--text-muted)] border-b border-[var(--border-primary)]">
 <th scope="col" className="text-left pb-4 pr-4">Job Title</th>
 <th scope="col" className="text-left pb-4 pr-4">Location</th>
 <th scope="col" className="text-left pb-4 pr-4">Applications</th>
 <th scope="col" className="text-left pb-4 pr-4">Filled</th>
 <th scope="col" className="text-left pb-4 pr-4">Remaining</th>
 <th scope="col" className="text-left pb-4">Utilization</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-[var(--border-primary)]">
 {vacancyData.map((job, i) => {
 const remaining = (job.Vacancies || 0) - (job.FilledPositions || 0);
 const utilization = (job.Vacancies || 0) > 0 ? Math.round((job.FilledPositions || 0) / job.Vacancies * 100) : 0;
 const getUtilizationColor = (p) => {
 if (p >= 80) return 'text-[var(--success)]';
 if (p >= 50) return 'text-[var(--warning)]';
 return 'text-[var(--danger)]';
 };
 const getUtilizationBg = (p) => {
 if (p >= 80) return 'bg-[var(--success)]';
 if (p >= 50) return 'bg-[var(--warning)]';
 return 'bg-[var(--danger)]';
 };
 return (
 <tr key={i} className="group hover:bg-[var(--bg-accent)] transition-colors">
 <td className="py-4 pr-4">
 <span className="text-sm font-semibold">{job.JobTitle || 'Unknown'}</span>
 </td>
 <td className="py-4 pr-4">
 <span className="text-xs font-bold text-[var(--text-secondary)]">{job.Location || 'N/A'}</span>
 </td>
 <td className="py-4 pr-4">
 <span className="text-sm font-semibold text-[var(--accent)]">{job.ApplicationCount || 0}</span>
 </td>
 <td className="py-4 pr-4">
 <span className="text-sm font-semibold text-[var(--success)]">{job.FilledPositions || 0}</span>
 </td>
 <td className="py-4 pr-4">
 <span className={`text-sm font-semibold ${remaining > 0 ? 'text-[var(--danger)]' : 'text-[var(--success)]'}`}>
 {remaining}
 </span>
 </td>
 <td className="py-4">
 <div className="flex items-center gap-2">
 <div className="w-24 h-2 bg-[var(--bg-accent)] rounded-full overflow-hidden">
 <div
 className={`h-full ${getUtilizationBg(utilization)} rounded-full`}
 style={{ width: `${utilization}%` }}
 ></div>
 </div>
 <span className={`text-xs font-semibold ${getUtilizationColor(utilization)}`}>
 {utilization}%
 </span>
 </div>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 );
};

export default VacancyUtilizationAdmin;
