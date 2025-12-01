import React from 'react';
import {
 AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

/**
 * EngagementTrendChart — Premium Soft refresh.
 * Uses --accent (indigo) instead of hardcoded emerald. Thinner stroke.
 * Token-based colors so it works in both light and dark themes.
 */
const EngagementTrendChart = ({ data }) => {
 return (
 <div
 className="h-[350px] w-full"
 role="img"
 aria-label="Engagement trend chart showing candidate engagement rate over time"
 >
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart
 data={data}
 margin={{ top: 16, right: 30, left: 10, bottom: 20 }}
 >
 <defs>
 <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.25} />
 <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
 </linearGradient>
 </defs>
 <CartesianGrid
 strokeDasharray="3 3"
 vertical={false}
 stroke="var(--border-primary)"
 />
 <XAxis
 dataKey="FullName"
 axisLine={false}
 tickLine={false}
 tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 500 }}
 interval={0}
 angle={-45}
 textAnchor="end"
 height={60}
 />
 <YAxis
 axisLine={false}
 tickLine={false}
 tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 500 }}
 width={30}
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
 />
 <Area
 type="monotone"
 dataKey="EngagementRate"
 name="Engagement %"
 stroke="var(--accent)"
 strokeWidth={2}
 fillOpacity={1}
 fill="url(#colorRate)"
 dot={{ r: 3, strokeWidth: 2, fill: 'var(--accent)' }}
 activeDot={{ r: 5, strokeWidth: 2, fill: 'var(--accent)' }}
 />
 </AreaChart>
 </ResponsiveContainer>
 </div>
 );
};

export default EngagementTrendChart;
