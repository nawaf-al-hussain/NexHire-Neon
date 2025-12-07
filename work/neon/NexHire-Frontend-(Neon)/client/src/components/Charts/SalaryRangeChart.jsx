import React from 'react';
import {
 BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const SalaryRangeChart = ({ data }) => {
 // Expected data: [{ Role, SalaryMin, SalaryMax, Level }]

 // Sort by Avg Salary for better visualization
 const chartData = data.map(item => ({
 ...item,
 AvgSalary: (item.SalaryMin + item.SalaryMax) / 2
 })).sort((a, b) => b.AvgSalary - a.AvgSalary).slice(0, 8);

 // Premium Soft palette: indigo accent + neutral grays (no rainbow)
 const COLORS = ['var(--accent)', 'var(--text-muted)', 'var(--text-secondary)', 'var(--success)', 'var(--warning)'];

 return (
 <div className="h-[400px] w-full mt-4">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart
 data={chartData}
 layout="vertical"
 margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
 >
 <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-primary)" />
 <XAxis type="number" hide />
 <YAxis
 dataKey="Role"
 type="category"
 axisLine={false}
 tickLine={false}
 tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 500 , }}
 width={120}
 />
 <Tooltip
 contentStyle={{
 backgroundColor: 'var(--bg-secondary)',
 border: '1px solid var(--border-primary)',
 borderRadius: 'var(--radius-md)' ,
 fontSize: '11px',
 fontWeight: '500' }}
 formatter={(value, name, props) => {
 if (name === 'Range') return [`$${props.payload.SalaryMin.toLocaleString()} - $${props.payload.SalaryMax.toLocaleString()}`, 'Salary Range'];
 return [value, name];
 }}
 />
 <Bar
 dataKey="AvgSalary"
 name="Range"
 radius={[0, 10, 10, 0]}
 barSize={30}
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

export default SalaryRangeChart;
