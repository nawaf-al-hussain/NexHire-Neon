import React from 'react';
import {
 BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const HireRatePerJobChart = ({ data }) => {
 // Expected data: [{ JobTitle, HireRatePercent, TotalApplications, Hires }]

 // Premium Soft palette: indigo accent + neutral grays (no rainbow)
 const COLORS = ['var(--accent)', 'var(--text-muted)', 'var(--text-secondary)', 'var(--success)', 'var(--warning)'];

 return (
 <div className="h-[350px] w-full mt-4">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart
 data={data}
 margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
 >
 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-primary)" />
 <XAxis
 dataKey="JobTitle"
 tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 500 }}
 axisLine={false}
 tickLine={false}
 />
 <YAxis
 tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
 axisLine={false}
 tickLine={false}
 domain={[0, 100]}
 />
 <Tooltip
 contentStyle={{
 backgroundColor: 'var(--bg-secondary)',
 border: '1px solid var(--border-primary)',
 borderRadius: 'var(--radius-md)' ,
 fontSize: '11px',
 fontWeight: '500' }}
 formatter={(value) => [typeof value === 'number' ? `${value.toFixed(1)}%` : `${parseFloat(value).toFixed(1)}%`, 'Hire Rate']}
 />
 <Bar
 dataKey="HireRatePercent"
 radius={[10, 10, 0, 0]}
 barSize={40}
 >
 {data.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
 ))}
 </Bar>
 </BarChart>
 </ResponsiveContainer>
 </div>
 );
};

export default HireRatePerJobChart;
