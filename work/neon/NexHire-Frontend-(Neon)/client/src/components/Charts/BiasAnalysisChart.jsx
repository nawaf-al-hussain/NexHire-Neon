import React from 'react';
import {
 ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
 Tooltip, ResponsiveContainer
} from 'recharts';

const BiasAnalysisChart = ({ data, dataKey, categoryKey, title, subtitle }) => {
 // Expected data: Array of objects with categoryKey, TotalApplicants, and HireRatePercent
 // Example: [{ Location: 'New York', TotalApplicants: 150, HireRatePercent: 45.2 }]

 return (
 <div className="h-[300px] w-full mt-4">
 <ResponsiveContainer width="100%" height="100%">
 <ComposedChart
 data={data}
 margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
 >
 <CartesianGrid
 strokeDasharray="3 3"
 vertical={false}
 stroke="var(--border-primary)"
 />
 <XAxis
 dataKey={categoryKey}
 fontSize={10}
 fontWeight="900"
 axisLine={false}
 tickLine={false}
 tick={{ fill: 'var(--text-muted)' }}
 interval={0}
 angle={-20}
 textAnchor="end"
 height={60}
 />
 <YAxis
 yAxisId="left"
 orientation="left"
 stroke="var(--text-muted)"
 fontSize={10}
 axisLine={false}
 tickLine={false}
 tickFormatter={(value) => `${value}`}
 tick={{ fill: 'var(--text-muted)' }}
 />
 <YAxis
 yAxisId="right"
 orientation="right"
 stroke="var(--accent)"
 fontSize={10}
 axisLine={false}
 tickLine={false}
 domain={[0, 100]}
 tickFormatter={(value) => `${value}%`}
 tick={{ fill: 'var(--accent)' }}
 />
 <Tooltip
 cursor={{ fill: 'var(--bg-accent)' }}
 contentStyle={{
 backgroundColor: 'var(--bg-secondary)',
 border: '1px solid var(--border-primary)',
 borderRadius: '1rem',
 boxShadow: 'var(--shadow-lg)',
 padding: '15px'
 }}
 formatter={(value, name) => {
 if (name === 'TotalApplicants') return [value, 'Applicants'];
 if (name === 'HireRatePercent') {
 const numValue = typeof value === 'number' ? value : parseFloat(value);
 return [`${Number(numValue || 0).toFixed(1)}%`, 'Hire Rate %'];
 }
 return [value, name];
 }}
 />
 <Bar
 yAxisId="left"
 dataKey="TotalApplicants"
 fill="var(--text-muted)"
 name="Applicants"
 radius={[8, 8, 0, 0]}
 barSize={30}
 opacity={0.3}
 />
 <Line
 yAxisId="right"
 type="monotone"
 dataKey="HireRatePercent"
 stroke="var(--accent)"
 strokeWidth={4}
 dot={{ r: 6, fill: 'var(--accent)', strokeWidth: 3, stroke: 'var(--bg-secondary)' }}
 activeDot={{ r: 8 }}
 name="Hire Rate %"
 />
 </ComposedChart>
 </ResponsiveContainer>
 </div>
 );
};

export default BiasAnalysisChart;
