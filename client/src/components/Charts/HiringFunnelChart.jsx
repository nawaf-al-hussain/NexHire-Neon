import React from 'react';
import {
 BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList
} from 'recharts';

/**
 * HiringFunnelChart — Premium Soft refresh.
 * Uses a 2-color palette (accent + neutral) instead of the rainbow AI tell.
 * Token-based colors so it works in both light and dark themes.
 */
const HiringFunnelChart = ({ data }) => {
 // 2-color palette: active series indigo, comparison series neutral gray.
 // Replaces the rainbow COLORS array (the most common AI design fingerprint).
 const ACCENT = 'var(--accent)';
 const NEUTRAL = 'var(--text-muted)';

 return (
 <div
 className="h-[350px] w-full"
 role="img"
 aria-label="Hiring funnel chart showing application count by status"
 >
 <ResponsiveContainer width="100%" height="100%">
 <BarChart
 layout="vertical"
 data={data}
 margin={{ top: 16, right: 60, left: 40, bottom: 16 }}
 >
 <CartesianGrid
 strokeDasharray="3 3"
 horizontal={false}
 stroke="var(--border-primary)"
 />
 <XAxis type="number" hide />
 <YAxis
 dataKey="StatusName"
 type="category"
 axisLine={false}
 tickLine={false}
 tick={{
 fill: 'var(--text-secondary)',
 fontSize: 11,
 fontWeight: 500,
 }}
 width={80}
 />
 <Tooltip
 contentStyle={{
 backgroundColor: 'var(--bg-elevated)',
 border: '1px solid var(--border-primary)',
 borderRadius: 'var(--radius-md)',
 fontSize: '12px',
 fontWeight: 500,
 color: 'var(--text-primary)',
 boxShadow: 'var(--shadow-lg)',
 }}
 labelStyle={{ color: 'var(--text-muted)', fontSize: 11 }}
 cursor={{ fill: 'var(--surface-hover)' }}
 />
 <Bar
 dataKey="ApplicationCount"
 radius={[4, 4, 0, 0]}
 barSize={24}
 >
 {data.map((entry, index) => (
 <Cell
 key={`cell-${index}`}
 fill={index === 0 ? ACCENT : NEUTRAL}
 fillOpacity={index === 0 ? 1 : 0.5}
 />
 ))}
 <LabelList
 dataKey="ApplicationCount"
 position="right"
 style={{
 fill: 'var(--text-primary)',
 fontSize: 11,
 fontWeight: 600,
 }}
 />
 </Bar>
 </BarChart>
 </ResponsiveContainer>
 </div>
 );
};

export default HiringFunnelChart;
