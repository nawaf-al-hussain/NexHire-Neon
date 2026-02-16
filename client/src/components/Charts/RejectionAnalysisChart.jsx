import React from 'react';
import {
 PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const RejectionAnalysisChart = ({ data }) => {
 // Expected data: { RejectionReason, RejectionCount, RejectionPercent }
 // Coerce string values to numbers — PostgreSQL COUNT() returns strings
 // via the NUMERIC type, and Recharts can't plot strings.
 const chartData = (data || []).map(d => ({
 ...d,
 RejectionCount: Number(d.RejectionCount) || 0,
 RejectionPercent: Number(d.RejectionPercent) || 0,
 }));

 // Premium Soft palette: danger red + neutral tints
 const COLORS = ['var(--danger)', 'var(--text-muted)', 'var(--text-secondary)', 'var(--warning)'];

 const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
 const RADIAN = Math.PI / 180;
 const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
 const x = cx + radius * Math.cos(-midAngle * RADIAN);
 const y = cy + radius * Math.sin(-midAngle * RADIAN);

 return (
 <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={10} fontWeight={900}>
 {`${(percent * 100).toFixed(0)}%`}
 </text>
 );
 };

 if (chartData.length === 0) {
 return (
 <div className="h-[350px] w-full flex flex-col items-center justify-center">
 <p className="text-sm font-medium text-[var(--text-muted)]">No rejection data</p>
 <p className="text-xs text-[var(--text-muted)] opacity-70 mt-1">Rejections will appear here once applications are rejected</p>
 </div>
 );
 }

 return (
 <div className="h-[350px] w-full">
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie
 data={chartData}
 cx="50%"
 cy="50%"
 labelLine={false}
 label={renderCustomizedLabel}
 outerRadius={100}
 innerRadius={60}
 fill="var(--accent)"
 dataKey="RejectionCount"
 nameKey="RejectionReason"
 paddingAngle={5}
 >
 {chartData.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.2)" />
 ))}
 </Pie>
 <Tooltip
 contentStyle={{
 backgroundColor: 'var(--bg-secondary)',
 border: '1px solid var(--border-primary)',
 borderRadius: 'var(--radius-md)' ,
 fontSize: '11px',
 fontWeight: '500' ,
 boxShadow: 'var(--shadow-lg)' }}
 />
 <Legend
 layout="vertical"
 verticalAlign="middle"
 align="right"
 iconType="circle"
 wrapperStyle={{ fontSize: '10px', fontWeight: 500, letterSpacing: '1px' }}
 />
 </PieChart>
 </ResponsiveContainer>
 </div>
 );
};

export default RejectionAnalysisChart;
