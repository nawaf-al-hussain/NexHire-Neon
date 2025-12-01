import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE from '../../apiConfig';
import { Database, Search, Table, Code, RefreshCw, Download, ChevronRight, X } from 'lucide-react';

const SQLViews = () => {
 const [views, setViews] = useState([]);
 const [loading, setLoading] = useState(true);
 const [selectedView, setSelectedView] = useState(null);
 const [viewData, setViewData] = useState([]);
 const [viewLoading, setViewLoading] = useState(false);
 const [searchTerm, setSearchTerm] = useState('');
 const [showDefinition, setShowDefinition] = useState(false);
 

 // View categories
 const categories = {
 'Analytics': ['vw_ApplicationFunnel', 'vw_VacancyUtilization', 'vw_HireRatePerJob', 'vw_HiringBottlenecks'],
 'Performance': ['vw_RecruiterPerformance', 'vw_TimeToHire', 'vw_AverageTimeToHire', 'vw_CandidateMatchScore'],
 'Bias & Compliance': ['vw_Bias_Location', 'vw_Bias_Experience', 'vw_SalaryTransparency', 'vw_DiversityAnalyticsFunnel'],
 'Candidate': ['vw_CandidateInterviews', 'vw_SkillGapAnalysis', 'vw_SkillVerificationStatus', 'vw_CandidateEngagement', 'vw_GhostingRiskDashboard', 'vw_RejectionAnalysis'],
 'Career & Referral': ['vw_CareerPathInsights', 'vw_ReferralIntelligence'],
 'Market': ['vw_MarketIntelligenceDashboard', 'vw_RemoteCompatibilityMatrix'],
 'Interview': ['vw_InterviewScoreVsDecision', 'vw_InterviewerConsistency']
 };

 useEffect(() => {
 fetchViews();
 }, []);

 const fetchViews = async () => {
 try {
 setLoading(true);
 const response = await axios.get(`${API_BASE}/maintenance/sql-views`);
 setViews(response.data);
 } catch (err) {
 console.error('Error fetching views:', err);
 } finally {
 setLoading(false);
 }
 };

 const fetchViewData = async (viewName) => {
 try {
 setViewLoading(true);
 const response = await axios.get(`${API_BASE}/maintenance/sql-views/${viewName}`);
 setViewData(response.data);

 // Get column definitions - temporarily disabled due to SQL driver issue 
 } catch (err) {
 console.error('Error fetching view data:', err);
 setViewData([]);
 
 } finally {
 setViewLoading(false);
 }
 };

 const handleViewClick = (viewName) => {
 setSelectedView(viewName);
 setShowDefinition(false);
 fetchViewData(viewName);
 };

 const filteredViews = views.filter(v =>
 (v.viewName || v.viewname || '').toLowerCase().includes(searchTerm.toLowerCase())
 );

 const getCategoryForView = (viewName) => {
 for (const [category, viewList] of Object.entries(categories)) {
 if (viewList.includes(viewName)) return category;
 }
 return 'Other';
 };

 const exportToCSV = () => {
 if (!viewData.length) return;

 const headers = Object.keys(viewData[0]);
 const csvContent = [
 headers.join(','),
 ...viewData.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(','))
 ].join('\n');

 const blob = new Blob([csvContent], { type: 'text/csv' });
 const url = window.URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = `${selectedView}.csv`;
 a.click();
 };

 if (loading) {
 return (
 <div className="flex items-center justify-center min-h-[400px]">
 <div className="text-center">
 <RefreshCw className="w-8 h-8 animate-spin text-[var(--accent)] mx-auto mb-4" />
 <p className="text-[var(--text-muted)]">Loading database views...</p>
 </div>
 </div>
 );
 }

 return (
 <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
 {/* Header */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8 border border-[var(--accent)]">
 <div className="flex items-center gap-4">
 <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
 <Database size={28} />
 </div>
 <div className="flex-1">
 <h2 className="text-lg sm:text-xl font-medium">Database Views</h2>
 <p className="text-[11px] font-bold text-[var(--text-muted)]">
 {views.length} views available • Click to execute queries
 </p>
 </div>
 <div className="relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
 <input
 type="text"
 placeholder="Search views..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="pl-10 pr-4 py-2 rounded-xl bg-[var(--bg-accent)] border border-[var(--border-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)]"
 />
 </div>
 </div>
 </div>

 {/* Main Content */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
 {/* Views List */}
 <div className="lg:col-span-1 space-y-4">
 <h3 className="text-sm font-medium text-[var(--text-muted)]">Available Views</h3>
 <div className="glass-card rounded-[var(--radius-xl)] p-4 max-h-[600px] overflow-y-auto space-y-2">
 {Object.entries(categories).map(([category, viewList]) => {
 const filtered = viewList.filter(v => v.toLowerCase().includes(searchTerm.toLowerCase()));
 if (!filtered.length) return null;

 return (
 <div key={category} className="mb-4">
 <h4 className="text-xs font-bold text-[var(--accent)] mb-2 px-2">{category}</h4>
 {filtered.map(viewName => (
 <button
 key={viewName}
 onClick={() => handleViewClick(viewName)}
 className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all ${selectedView === viewName
 ? 'bg-[var(--accent)] text-white'
 : 'hover:bg-[var(--bg-accent)] text-[var(--text-primary)]'
 }`}
 >
 {viewName}
 </button>
 ))}
 </div>
 );
 })}
 </div>
 </div>

 {/* Results Panel */}
 <div className="lg:col-span-2">
 {selectedView ? (
 <div className="glass-card rounded-[var(--radius-xl)] p-6">
 {/* View Header */}
 <div className="flex items-center justify-between mb-4">
 <div className="flex items-center gap-3">
 <Table className="text-[var(--accent)]" size={20} />
 <h3 className="text-lg font-semibold uppercase">{selectedView}</h3>
 <span className="px-2 py-1 bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-bold rounded-lg">
 {getCategoryForView(selectedView)}
 </span>
 </div>
 <div className="flex items-center gap-2">
 <button
 onClick={() => setShowDefinition(!showDefinition)}
 className={`p-2 rounded-xl transition-colors ${showDefinition ? 'bg-[var(--accent)] text-white' : 'hover:bg-[var(--bg-accent)]'
 }`}
 title="View Definition"
 >
 <Code size={18} />
 </button>
 <button
 onClick={exportToCSV}
 className="p-2 hover:bg-[var(--bg-accent)] rounded-xl transition-colors"
 title="Export CSV"
 disabled={!viewData.length}
 >
 <Download size={18} />
 </button>
 <button
 onClick={() => fetchViewData(selectedView)}
 className="p-2 hover:bg-[var(--bg-accent)] rounded-xl transition-colors"
 title="Refresh"
 >
 <RefreshCw size={18} className={viewLoading ? 'animate-spin' : ''} />
 </button>
 </div>
 </div>

 {/* View Definition */}
 {showDefinition && viewColumns.length > 0 && (
 <div className="mb-4 p-4 bg-[var(--bg-tertiary)] rounded-xl">
 <h4 className="text-xs font-semibold uppercase text-[var(--text-muted)] mb-2">Column Definitions</h4>
 <div className="flex flex-wrap gap-2">
 {viewColumns.map((col, idx) => (
 <span key={idx} className="px-2 py-1 bg-[var(--bg-accent)] rounded-lg text-xs font-mono">
 {col.COLUMN_NAME} <span className="text-[var(--text-muted)]">({col.DATA_TYPE})</span>
 </span>
 ))}
 </div>
 </div>
 )}

 {/* Data Table */}
 {viewLoading ? (
 <div className="flex items-center justify-center py-12">
 <RefreshCw className="w-6 h-6 animate-spin text-[var(--accent)]" />
 </div>
 ) : viewData.length > 0 ? (
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-[var(--border-primary)]">
 {Object.keys(viewData[0]).map(key => (
 <th scope="col" key={key} className="text-left py-3 px-2 font-semibold text-xs text-[var(--text-muted)]">
 {key}
 </th>
 ))}
 </tr>
 </thead>
 <tbody>
 {viewData.map((row, idx) => (
 <tr key={idx} className="border-b border-[var(--border-primary)] hover:bg-[var(--bg-accent)]">
 {Object.values(row).map((val, i) => (
 <td key={i} className="py-3 px-2 font-medium truncate max-w-[200px]">
 {val !== null ? String(val) : <span className="text-[var(--text-muted)]">NULL</span>}
 </td>
 ))}
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 ) : (
 <div className="text-center py-12 text-[var(--text-muted)]">
 <Table className="w-12 h-12 mx-auto mb-4 opacity-50" />
 <p>No data returned from this view.</p>
 <p className="text-xs mt-1">The view may be empty or require data in the database.</p>
 </div>
 )}

 {/* Row Count */}
 {viewData.length > 0 && (
 <div className="mt-4 text-xs text-[var(--text-muted)] text-center">
 Showing {viewData.length} rows
 </div>
 )}
 </div>
 ) : (
 <div className="glass-card rounded-[var(--radius-xl)] p-12 text-center min-h-[400px] flex flex-col items-center justify-center">
 <Database className="w-16 h-16 text-[var(--accent)]/30 mb-4" />
 <h3 className="text-lg font-semibold uppercase mb-2">Select a View</h3>
 <p className="text-[var(--text-muted)] text-sm">Click on any view from the list to execute a query and see results</p>
 </div>
 )}
 </div>
 </div>
 </div>
 );
};

export default SQLViews;
