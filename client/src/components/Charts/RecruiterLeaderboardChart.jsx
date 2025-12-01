import React from 'react';
import {
 ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const RecruiterLeaderboardChart = ({ data }) => {
 // Expected data: [{ RecruiterName, InterviewsConducted, SuccessfulHires }]

 // Sort by hires to show leaderboard effect
 const sortedData = [...data].sort((a, b) => b.SuccessfulHires - a.SuccessfulHires).slice(0, 8);

 return (
 <div className="h-[350px] w-full mt-4">
 <ResponsiveContainer width="100%" height="100%">
 <ComposedChart
 layout="vertical"
 data={sortedData}
 margin={{ top: 20, right: 20, bottom: 20, left: 40 }}
 >
 <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-primary)" />
 <XAxis type="number" hide />
 <YAxis
 dataKey="RecruiterName"
 type="category"
 scale="band"
 axisLine={false}
 tickLine={false}
 tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 500, }}
 width={100}
 />
 <Tooltip
 contentStyle={{
 backgroundColor: 'var(--bg-secondary)',
 border: '1px solid var(--border-primary)',
 borderRadius: '1rem',
 fontSize: '11px',
 fontWeight: 500
 }}
 />
 <Legend
 wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 500, }}
 />
 <Bar
 name="Interviews"
 dataKey="InterviewsConducted"
 barSize={20}
 fill="var(--accent)"
 radius={[0, 4, 4, 0]}
 opacity={0.3}
 />
 <Bar
 name="Success Hires"
 dataKey="SuccessfulHires"
 barSize={12}
 fill="var(--success)"
 radius={[0, 4, 4, 0]}
 />
 </ComposedChart>
 </ResponsiveContainer>
 </div>
 );
};

export default RecruiterLeaderboardChart;
