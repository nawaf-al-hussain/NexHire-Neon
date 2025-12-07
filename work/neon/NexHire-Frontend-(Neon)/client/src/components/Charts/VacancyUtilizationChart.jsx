import React from 'react';
import { Briefcase } from 'lucide-react';

const VacancyUtilizationChart = ({ data }) => {
 // Data from vw_VacancyUtilization: [{ JobTitle, Vacancies, FilledPositions, ApplicationCount }]
 // Calculate RemainingVacancies = Vacancies - FilledPositions

 const displayData = data.slice(0, 5).map(job => ({
 ...job,
 RemainingVacancies: (job.Vacancies || 0) - (job.FilledPositions || 0),
 TotalApplications: job.ApplicationCount || 0
 }));

 return (
 <div className="space-y-6">
 {displayData.map((job, idx) => {
 const total = job.Vacancies || 0;
 const filled = job.FilledPositions || 0;
 const percent = total > 0 ? (filled / total) * 100 : 0;
 const isCritical = percent < 25;

 return (
 <div key={idx} className="space-y-2">
 <div className="flex justify-between items-center">
 <p className="text-[11px] font-semibold uppercase text-[var(--text-primary)] truncate max-w-[140px] tracking-tighter">
 {job.JobTitle}
 </p>
 <span className={`text-[11px] font-semibold px-2 py-1 rounded-lg tracking-tighter ${isCritical
 ? 'bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/20'
 : 'bg-[var(--success)]/10 text-[var(--success)] border border-emerald-500/20'
 }`}>
 {filled} / {total} Filled
 </span>
 </div>
 <div className="w-full h-3 rounded-xl overflow-hidden p-0.5 border border-[var(--border-primary)]/50">
 <div
 className={`h-full rounded-lg transition-all duration-1000 ${isCritical ? 'bg-[var(--danger)]' : 'bg-[var(--success)]'
 }`}
 style={{ width: `${percent}%` }}
 />
 </div>
 <div className="flex justify-between text-[11px] font-semibold text-[var(--text-muted)]">
 <span>{job.TotalApplications} Applied</span>
 <span>{job.RemainingVacancies} Left</span>
 </div>
 </div>
 );
 })}

 {displayData.length === 0 && (
 <div className="text-center py-8">
 <p className="text-[11px] font-semibold text-[var(--text-muted)] opacity-50">
 No vacancy data available
 </p>
 </div>
 )}
 </div>
 );
};

// Standalone component with header for direct usage
// Data from vw_VacancyUtilization: [{ JobTitle, Vacancies, FilledPositions, ApplicationCount }]
export const VacancyUtilizationCard = ({ data }) => {
 const displayData = data.slice(0, 5).map(job => ({
 JobTitle: job.JobTitle,
 FilledPositions: job.FilledPositions || 0,
 RemainingVacancies: (job.Vacancies || 0) - (job.FilledPositions || 0),
 TotalApplications: job.ApplicationCount || 0
 }));

 return (
 <div className="bg-white p-8 rounded-[var(--radius-xl)] border border-slate-100 shadow-sm h-full">
 <div className="mb-8">
 <h3 className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2">
 <span className="w-1.5 h-4 bg-[var(--success)] rounded-full"></span>
 Vacancy <span className="text-[var(--success)] ml-1">Utilization</span>
 </h3>
 <p className="text-[11px] text-[var(--text-muted)] font-bold mt-1 ml-3.5">Fulfillment Analytics</p>
 </div>
 <div className="space-y-6">
 {displayData.map((job, idx) => {
 const total = job.FilledPositions + job.RemainingVacancies;
 const percent = total > 0 ? (job.FilledPositions / total) * 100 : 0;
 const isCritical = percent < 25;

 return (
 <div key={idx} className="space-y-2">
 <div className="flex justify-between items-center">
 <p className="text-[11px] font-semibold uppercase text-[var(--text-primary)] truncate max-w-[140px] tracking-tighter">
 {job.JobTitle}
 </p>
 <span className={`text-[11px] font-semibold px-2 py-1 rounded-lg tracking-tighter ${isCritical
 ? 'bg-red-50 text-red-600 border border-red-100'
 : 'bg-emerald-50 text-[var(--success)] border border-emerald-100'
 }`}>
 {job.FilledPositions} / {total} Filled
 </span>
 </div>
 <div className="w-full bg-slate-100 h-3 rounded-xl overflow-hidden p-0.5 border border-slate-200/50">
 <div
 className={`h-full rounded-lg transition-all duration-1000 ${isCritical ? 'bg-[var(--danger)]' : 'bg-[var(--success)]'
 }`}
 style={{ width: `${percent}%` }}
 />
 </div>
 <div className="flex justify-between text-[11px] font-semibold text-[var(--text-muted)]">
 <span>{job.TotalApplications} Applied</span>
 <span>{job.RemainingVacancies} Left</span>
 </div>
 </div>
 );
 })}

 {displayData.length === 0 && (
 <div className="text-center py-8">
 <p className="text-[11px] font-semibold text-[var(--text-muted)] opacity-50">
 No vacancy data available
 </p>
 </div>
 )}
 </div>
 </div>
 );
};

export default VacancyUtilizationChart;
