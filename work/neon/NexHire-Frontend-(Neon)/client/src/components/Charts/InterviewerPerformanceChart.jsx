import React from 'react';
import {
 ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const InterviewerPerformanceChart = ({ data }) => {
 // Expected data: { InterviewerName, InterviewsTaken, AvgScoreGiven, ScoreVariance }

 return (
 <div className="h-[350px] w-full">
 <ResponsiveContainer width="100%" height="100%">
 <ComposedChart
 data={data}
 margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
 >
 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-primary)" />
 <XAxis
 dataKey="InterviewerName"
 axisLine={false}
 tickLine={false}
 tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 500 }}
 dy={10}
 />
 <YAxis
 yAxisId="left"
 axisLine={false}
 tickLine={false}
 tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 500 }}
 width={30}
 />
 <YAxis
 yAxisId="right"
 orientation="right"
 axisLine={false}
 tickLine={false}
 tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 500 }}
 width={30}
 />
 <Tooltip
 contentStyle={{
 backgroundColor: 'var(--bg-secondary)',
 border: '1px solid var(--border-primary)',
 borderRadius: '1rem',
 fontSize: '11px',
 fontWeight: 500,
 boxShadow: 'var(--shadow-lg)'
 }}
 cursor={{ fill: 'rgba(255,255,255,0.02)' }}
 />
 <Legend
 verticalAlign="top"
 align="right"
 iconType="circle"
 wrapperStyle={{ paddingBottom: '20px', fontSize: '10px', fontWeight: 500, letterSpacing: '1px' }}
 />
 <Bar
 yAxisId="left"
 dataKey="AvgScoreGiven"
 name="Avg Score"
 fill="url(#colorScore)"
 radius={[6, 6, 0, 0]}
 barSize={30}
 />
 <Line
 yAxisId="right"
 type="monotone"
 dataKey="ScoreVariance"
 name="Variance"
 stroke="var(--danger)"
 strokeWidth={3}
 dot={{ r: 4, strokeWidth: 2, fill: 'var(--danger)' }}
 activeDot={{ r: 6, strokeWidth: 0 }}
 />
 <defs>
 <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stopColor="var(--accent)" stopOpacity={1} />
 <stop offset="100%" stopColor="#8b5cf6" stopOpacity={1} />
 </linearGradient>
 </defs>
 </ComposedChart>
 </ResponsiveContainer>
 </div>
 );
};

export default InterviewerPerformanceChart;
