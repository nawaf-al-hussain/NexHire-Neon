import React from 'react';
import {
 Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip
} from 'recharts';

const SkillGapChart = ({ data }) => {
 // Expected data: [{ SkillName, GapScore, SkillGap }] - uses SkillGap for the radar

 // Handle undefined or empty data
 if (!data || !Array.isArray(data) || data.length === 0) {
 return (
 <div className="h-full flex items-center justify-center">
 <div className="text-center text-[var(--text-muted)]">
 <p className="text-xs font-medium">No skill data</p>
 </div>
 </div>
 );
 }

 // Ensure all data points have valid numeric values (max 10 items)
 const chartData = data.slice(0, 10).map(item => ({
 ...item,
 SkillName: item.SkillName || 'Unknown',
 // Use SkillGap if available, otherwise normalize GapScore to 0-10 scale
 SkillGap: item.SkillGap !== undefined ? Number(item.SkillGap) : Math.min(10, Number(item.GapScore) / 10)
 }));

 return (
 <div className="h-full min-h-[280px]">
 <ResponsiveContainer width="100%" height="100%">
 <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
 <PolarGrid stroke="var(--border-primary)" />
 <PolarAngleAxis
 dataKey="SkillName"
 tick={{ fontSize: 9, fontWeight: 500, fill: 'var(--text-muted)', letterSpacing: '0.05em' }}
 />
 <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
 <Radar
 name="Proficiency"
 dataKey="SkillGap"
 stroke="var(--accent)"
 strokeWidth={3}
 fill="var(--accent)"
 fillOpacity={0.15}
 />
 <Tooltip
 contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: 'var(--shadow-lg)', padding: '12px' }}
 />
 </RadarChart>
 </ResponsiveContainer>
 </div>
 );
};

export default SkillGapChart;
