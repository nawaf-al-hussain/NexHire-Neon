import React from 'react';
import {
 BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const RemoteWorkChart = ({ data }) => {
 // Expected data: [{ Role, RemoteScore }]

 // Sort by RemoteScore
 const chartData = [...data].sort((a, b) => b.RemoteScore - a.RemoteScore).slice(0, 8);

 const getBarColor = (score) => {
 if (score >= 70) return 'var(--success)'; // Emerald
 if (score >= 40) return 'var(--warning)'; // Amber
 return 'var(--danger)'; // Rose
 };

 return (
 <div className="h-[350px] w-full mt-4">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart
 data={chartData}
 layout="vertical"
 margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
 >
 <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-primary)" />
 <XAxis type="number" domain={[0, 100]} hide />
 <YAxis
 dataKey="Role"
 type="category"
 axisLine={false}
 tickLine={false}
 tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 500, }}
 width={120}
 />
 <Tooltip
 contentStyle={{
 backgroundColor: 'var(--bg-secondary)',
 border: '1px solid var(--border-primary)',
 borderRadius: '1rem',
 fontSize: '11px',
 fontWeight: 500
 }}
 formatter={(value) => [`${value}%`, 'Remote Score']}
 />
 <Bar
 dataKey="RemoteScore"
 radius={[0, 10, 10, 0]}
 barSize={24}
 >
 {chartData.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={getBarColor(entry.RemoteScore)} />
 ))}
 </Bar>
 </BarChart>
 </ResponsiveContainer>
 </div>
 );
};

export default RemoteWorkChart;
