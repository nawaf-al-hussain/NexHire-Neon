import React from 'react';
import {
 PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from 'recharts';

const DiversityChart = ({ data }) => {
 // Expected data: [{ Demographic, Percentage, Count }]

 // Premium Soft palette: semantic colors (success/accent/warning)
 const COLORS = ['var(--accent)', 'var(--success)', 'var(--warning)', 'var(--text-muted)', 'var(--text-secondary)'];

 return (
 <div className="h-[350px] w-full mt-4">
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie
 data={data}
 cx="50%"
 cy="50%"
 innerRadius={60}
 outerRadius={100}
 paddingAngle={5}
 dataKey="Percentage"
 nameKey="Demographic"
 >
 {data.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.1)" />
 ))}
 </Pie>
 <Tooltip
 contentStyle={{
 backgroundColor: 'var(--bg-secondary)',
 border: '1px solid var(--border-primary)',
 borderRadius: 'var(--radius-md)' ,
 fontSize: '11px',
 fontWeight: '500' }}
 formatter={(value) => [`${value}%`, 'Composition']}
 />
 <Legend
 layout="vertical"
 align="right"
 verticalAlign="middle"
 wrapperStyle={{ fontSize: '10px', fontWeight: '500' , }}
 />
 </PieChart>
 </ResponsiveContainer>
 </div>
 );
};

export default DiversityChart;
