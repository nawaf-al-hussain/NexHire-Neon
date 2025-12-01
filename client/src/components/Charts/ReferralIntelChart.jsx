import React from 'react';
import {
 BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const ReferralIntelChart = ({ data }) => {
 // Expected data: [{ Referrer, ReferralCount, Department }]

 const chartData = [...data].sort((a, b) => b.ReferralCount - a.ReferralCount).slice(0, 8);
 // Premium Soft palette: warning amber + neutral tints
 const COLORS = ['var(--warning)', 'var(--accent)', 'var(--text-muted)', 'var(--text-secondary)'];

 return (
 <div className="h-[350px] w-full mt-4">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart
 data={chartData}
 margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
 >
 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-primary)" />
 <XAxis
 dataKey="Referrer"
 tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 500 }}
 axisLine={false}
 tickLine={false}
 />
 <YAxis
 tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
 axisLine={false}
 tickLine={false}
 />
 <Tooltip
 contentStyle={{
 backgroundColor: 'var(--bg-secondary)',
 border: '1px solid var(--border-primary)',
 borderRadius: 'var(--radius-md)' ,
 fontSize: '11px',
 fontWeight: '500' }}
 />
 <Bar
 dataKey="ReferralCount"
 radius={[10, 10, 0, 0]}
 barSize={40}
 >
 {chartData.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
 ))}
 </Bar>
 </BarChart>
 </ResponsiveContainer>
 </div>
 );
};

export default ReferralIntelChart;
