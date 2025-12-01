import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, Briefcase, BarChart3, Settings, LogOut, X,
  Search, Clock, ShieldAlert, ChevronRight, CheckCircle, Trash2, UserCircle, Plus, Star, FileText, Calendar, BriefcaseBusiness, AlertCircle, UserPlus, Check, Sparkles, LayoutDashboard, Database,
  Home, Bell, MessageSquare, Folder, Shield, LineChart, PieChart, Target, Award, Zap, TrendingUp, Cpu, Server, Lock, Globe, Network, FileCode2, Menu, X as XIcon
} from 'lucide-react';
import { 
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import Presentation from './Presentation';

const API_BASE = "http://localhost:5000/api";

// --- Sidebar Component ---
const Sidebar = ({ activeView, setActiveView, userRole }) => {
  const [collapsed, setCollapsed] = useState(false);
  
  // Common navigation items for all roles
  const commonNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, color: 'text-indigo-600' },
    { id: 'notifications', label: 'Notifications', icon: Bell, color: 'text-amber-600' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, color: 'text-emerald-600' },
  ];
  
  // Role-specific navigation items
  const roleNavItems = {
    1: [ // Admin
      { id: 'users', label: 'User Management', icon: Users, color: 'text-blue-600' },
      { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'text-purple-600' },
      { id: 'reports', label: 'Reports', icon: FileCode2, color: 'text-rose-600' },
      { id: 'compliance', label: 'Compliance', icon: Shield, color: 'text-emerald-600' },
      { id: 'settings', label: 'System Settings', icon: Settings, color: 'text-slate-600' },
    ],
    2: [ // Recruiter
      { id: 'jobs', label: 'My Jobs', icon: Briefcase, color: 'text-blue-600' },
      { id: 'candidates', label: 'Candidates', icon: Users, color: 'text-emerald-600' },
      { id: 'interviews', label: 'Interviews', icon: Calendar, color: 'text-amber-600' },
      { id: 'analytics', label: 'Analytics', icon: LineChart, color: 'text-purple-600' },
      { id: 'performance', label: 'Performance', icon: TrendingUp, color: 'text-rose-600' },
    ],
    3: [ // Candidate
      { id: 'profile', label: 'My Profile', icon: UserCircle, color: 'text-blue-600' },
      { id: 'applications', label: 'Applications', icon: FileText, color: 'text-emerald-600' },
      { id: 'interviews', label: 'Interviews', icon: Calendar, color: 'text-amber-600' },
      { id: 'skills', label: 'Skills', icon: Award, color: 'text-purple-600' },
      { id: 'recommendations', label: 'Recommendations', icon: Target, color: 'text-rose-600' },
    ]
  };

  const currentRoleItems = roleNavItems[userRole] || [];

  return (
    <>
      {/* Mobile Sidebar Toggle */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-slate-200"
      >
        {collapsed ? <XIcon size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed lg:relative top-0 left-0 h-screen bg-white border-r border-slate-100
        shadow-xl lg:shadow-none z-40 transition-all duration-300
        ${collapsed ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        w-64 flex-shrink-0
      `}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-black text-xl tracking-tight text-slate-900">
                Nex<span className="text-indigo-600">Hire</span>
              </h2>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                {userRole === 1 ? 'Admin Portal' : userRole === 2 ? 'Recruiter Hub' : 'Talent Portal'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-200px)]">
          {/* Common Items */}
          {commonNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveView(item.id);
                if (window.innerWidth < 1024) setCollapsed(false);
              }}
              className={`
                w-full flex items-center gap-3 p-3 rounded-xl transition-all
                ${activeView === item.id 
                  ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }
              `}
            >
              <item.icon size={20} className={item.color} />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}

          <div className="h-px bg-slate-100 my-3"></div>

          {/* Role-specific Items */}
          {currentRoleItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveView(item.id);
                if (window.innerWidth < 1024) setCollapsed(false);
              }}
              className={`
                w-full flex items-center gap-3 p-3 rounded-xl transition-all
                ${activeView === item.id 
                  ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }
              `}
            >
              <item.icon size={20} className={item.color} />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Quick Stats Section */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-100 bg-white">
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-indigo-600">System Status</span>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">All systems operational</p>
            </div>
            
            <button 
              onClick={() => {}}
              className="w-full flex items-center justify-center gap-2 p-3 bg-slate-900 text-white rounded-xl hover:bg-indigo-600 transition-all"
            >
              <LogOut size={16} />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {collapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setCollapsed(false)}
        />
      )}
    </>
  );
};

export default function App() {
  const [user, setUser] = useState(null); 
  const [usernameInput, setUsernameInput] = useState("");
  const [currentView, setCurrentView] = useState('login');
  const [sidebarActiveView, setSidebarActiveView] = useState('dashboard');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/login`, { username: usernameInput });
      setUser(res.data);
      setSidebarActiveView('dashboard');
    } catch (err) { alert("Login Failed."); }
  };

  if (currentView === 'presentation') {
    return <Presentation onClose={() => setCurrentView('login')} />;
  }

  // STYLED LOGIN GATEWAY
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 font-sans selection:bg-indigo-500/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950"></div>
        <form onSubmit={handleLogin} className="relative bg-white/5 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/10 shadow-2xl w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-extrabold text-white tracking-tighter">Nex<span className="text-indigo-500">Hire</span></h1>
            <p className="text-slate-400 text-xs font-black uppercase tracking-[0.3em]">The Next Evolution in Hiring</p>
          </div>
          <div className="space-y-4">
            <div className="relative group">
              <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={20} />
              <input 
                type="text" 
                required 
                placeholder="Username" 
                className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-800 rounded-2xl text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium" 
                value={usernameInput} 
                onChange={(e) => setUsernameInput(e.target.value)} 
              />
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98]">Sign In</button>
          </div>
          <p className="text-center text-[10px] text-slate-500 font-bold uppercase tracking-widest pt-4 border-t border-white/5">
            Crafted by <span className="text-indigo-400">Nawaf Al Hussain Khondokar</span>
          </p>
          <button 
            type="button"
            onClick={() => setCurrentView('presentation')}
            className="w-full mt-6 group flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-indigo-600 hover:text-white transition-all duration-300"
          >
            <Sparkles size={14} className="text-indigo-500 group-hover:text-white group-hover:rotate-12 transition-all" />
            View Project Presentation
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans selection:bg-indigo-100">
      {/* Sidebar */}
      <Sidebar 
        activeView={sidebarActiveView}
        setActiveView={setSidebarActiveView}
        userRole={user.RoleID}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* NEXHIRE TOP NAVIGATION */}
        <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-5 flex justify-between items-center sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-xl shadow-slate-200">
              <Sparkles size={20} fill="currentColor"/>
            </div>
            <span className="font-black text-2xl tracking-tighter text-slate-900">Nex<span className="text-indigo-600">Hire</span></span>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-slate-900 tracking-tight">{user.Username}</p>
              <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest">
                {user.RoleID === 1 ? 'Administrator' : user.RoleID === 2 ? 'Recruiter' : 'Talent Partner'}
              </p>
            </div>
            <div className="h-8 w-[1px] bg-slate-100 mx-2"></div>
            <button onClick={() => setUser(null)} className="group p-2.5 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition-all">
              <LogOut size={20} className="group-active:scale-90 transition-transform" />
            </button>
          </div>
        </nav>

        <main className="flex-1 p-8 overflow-x-hidden">
          {user.RoleID === 1 && <AdminDashboard />}
          {user.RoleID === 2 && <RecruiterDashboard user={user} />}
          {user.RoleID === 3 && <CandidateDashboard user={user} />}
        </main>
        
        {/* SIGNATURE FOOTER */}
        <footer className="py-10 border-t border-slate-100 flex flex-col items-center gap-3">
          <div className="flex items-center gap-0 text-slate-900 font-black text-lg tracking-tighter">
             Nex<span className="text-indigo-600">Hire</span>
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
            Platform architect: <span className="text-indigo-600">Nawaf Al Hussain Khondokar</span>
          </p>
        </footer>
      </div>
    </div>
  );
}

const BiasAnalysis = ({ data, title, subtitle, xKey }) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:shadow-slate-200/50 group">
    <div className="mb-8">
      <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
        <span className="w-1.5 h-4 bg-indigo-600 rounded-full group-hover:h-6 transition-all"></span> {title}
      </h3>
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 ml-3.5">{subtitle}</p>
    </div>
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey={xKey} fontSize={10} fontWeight="900" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
          <YAxis yAxisId="left" orientation="left" stroke="#cbd5e1" fontSize={10} axisLine={false} tickLine={false} />
          <YAxis yAxisId="right" orientation="right" stroke="#4f46e5" fontSize={10} axisLine={false} tickLine={false} />
          <Tooltip 
            cursor={{fill: '#f8fafc'}}
            contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '15px' }} 
          />
          <Bar yAxisId="left" dataKey="TotalApplicants" fill="#e2e8f0" name="Applicants" radius={[8, 8, 0, 0]} barSize={40} />
          <Line yAxisId="right" type="monotone" dataKey="HireRatePercent" stroke="#4f46e5" strokeWidth={4} dot={{ r: 6, fill: '#4f46e5', strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 8 }} name="Hire Rate %" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  </div>
);

// --- SHARED COMPONENT: BOTTLENECK ALERTS ---
const BottleneckAlerts = ({ data }) => {
  const bottlenecks = data.filter(stage => stage.AvgDaysInStage > 7);
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:shadow-red-200/20 group h-full">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-red-500 rounded-full group-hover:h-6 transition-all"></span>
            Pipeline <span className="text-red-600 ml-1">Bottlenecks</span>
          </h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 ml-3.5">Exceeding 7-day target</p>
        </div>
        <div className="p-2 bg-red-50 text-red-500 rounded-xl">
          <AlertCircle size={18} />
        </div>
      </div>
      <div className="space-y-4">
        {bottlenecks.length > 0 ? bottlenecks.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between p-4 bg-red-50/30 border border-red-100/50 rounded-2xl group/item hover:bg-red-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-red-600 font-black text-xs border border-red-100">
                {item.AvgDaysInStage}d
              </div>
              <div>
                <p className="text-[11px] font-black uppercase text-slate-900 tracking-tight">{item.StatusName}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{item.ApplicationsInStage} Candidates Stuck</p>
              </div>
            </div>
            <ChevronRight size={14} className="text-red-300 group-hover/item:translate-x-1 transition-transform"/>
          </div>
        )) : (
          <div className="text-center py-10 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                <CheckCircle className="text-emerald-500" size={24} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Flow State: Healthy</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- SHARED COMPONENT: RECRUITER LEADERBOARD ---
const RecruiterLeaderboard = ({ data }) => {
  const sortedData = [...data].sort((a, b) => b.SuccessfulHires - a.SuccessfulHires).slice(0, 5);

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm h-full">
      <div className="mb-8">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
          <span className="w-1.5 h-4 bg-indigo-600 rounded-full"></span>
          Top <span className="text-indigo-600 ml-1">Recruiters</span>
        </h3>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 ml-3.5">Hiring Efficiency Intel</p>
      </div>
      <div className="space-y-6">
        {sortedData.map((recruiter, idx) => {
          const conversionRate = recruiter.InterviewsConducted > 0 
            ? ((recruiter.SuccessfulHires / recruiter.InterviewsConducted) * 100).toFixed(0) 
            : 0;

          return (
            <div key={idx} className="space-y-2 group">
              <div className="flex justify-between items-end">
                <p className="text-[11px] font-black uppercase text-slate-700 tracking-tight group-hover:text-indigo-600 transition-colors">{recruiter.RecruiterName}</p>
                <p className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{conversionRate}% Conv.</p>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-slate-900 h-full transition-all duration-1000 ease-out group-hover:bg-indigo-600" 
                  style={{ width: `${conversionRate}%` }}
                />
              </div>
              <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">
                <span>{recruiter.InterviewsConducted} Interviews</span>
                <span>{recruiter.SuccessfulHires} Hires</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- SHARED COMPONENT: VACANCY UTILIZATION ---
const VacancyUtilization = ({ data }) => {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm h-full">
      <div className="mb-8">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
          <span className="w-1.5 h-4 bg-emerald-500 rounded-full"></span>
          Vacancy <span className="text-emerald-600 ml-1">Utilization</span>
        </h3>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 ml-3.5">Fulfillment Analytics</p>
      </div>
      <div className="space-y-6">
        {data.slice(0, 5).map((job, idx) => {
          const total = job.FilledPositions + job.RemainingVacancies;
          const percent = total > 0 ? (job.FilledPositions / total) * 100 : 0;
          const isCritical = percent < 25;

          return (
            <div key={idx} className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-[11px] font-black uppercase text-slate-900 truncate max-w-[140px] tracking-tighter">
                  {job.JobTitle}
                </p>
                <span className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-tighter ${isCritical ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                  {job.FilledPositions} / {total} Filled
                </span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-xl overflow-hidden p-0.5 border border-slate-200/50">
                <div 
                  className={`h-full rounded-lg transition-all duration-1000 ${isCritical ? 'bg-red-500' : 'bg-emerald-500'}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-[0.15em]">
                <span>{job.TotalApplications} Applied</span>
                <span>{job.RemainingVacancies} Left</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- SHARED COMPONENT: SKILL GAP RADAR ---
const SkillGapRadar = ({ data }) => {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
          <span className="w-1.5 h-4 bg-violet-600 rounded-full"></span>
          Skill <span className="text-violet-600 ml-1">Gap Analysis</span>
        </h3>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 ml-3.5">Candidate Proficiency Matrix</p>
      </div>
      <div className="flex-1 min-h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data.slice(0, 6)}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="SkillName" tick={{ fontSize: 9, fontWeight: '900', fill: '#64748b', letterSpacing: '0.05em' }} />
            <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
            <Radar
              name="Proficiency"
              dataKey="SkillGap"
              stroke="#7c3aed"
              strokeWidth={3}
              fill="#7c3aed"
              fillOpacity={0.15}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px' }} 
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// --- SHARED COMPONENT: GHOSTING ALERT ---
const GhostingAlert = ({ data }) => {
  const highRisk = data.filter(c => c.DaysSinceLastContact > 14);

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm h-full flex flex-col">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-orange-600 rounded-full group-hover:h-6  flex items-center gap-2">
             <span className="w-1.5 h-4 bg-orange-500 rounded-full"></span>
             Ghosting <span className="text-slate-900 ml-1">Alerts</span>
          </h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 ml-3.5">Inactivity {'>'} 14 Days</p>
        </div>
        <div className="bg-orange-100 text-orange-600 p-2 rounded-xl border border-orange-200">
          <ShieldAlert size={18} />
        </div>
      </div>
      
      <div className="space-y-3 overflow-y-auto max-h-64 pr-2 custom-scrollbar">
        {highRisk.length > 0 ? highRisk.map((candidate, idx) => (
          <div key={idx} className="p-4 bg-orange-50/30 border border-orange-100/50 rounded-2xl flex justify-between items-center group hover:bg-orange-50 transition-colors">
            <div>
              <p className="text-[11px] font-black uppercase text-slate-800 tracking-tight">{candidate.CandidateName}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{candidate.JobTitle}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-black text-orange-600">{candidate.DaysSinceLastContact}d</p>
              <p className="text-[8px] font-black text-orange-400 uppercase tracking-widest">No Response</p>
            </div>
          </div>
        )) : (
          <div className="flex-1 flex flex-col items-center justify-center py-10 text-center bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
            <Check size={24} className="text-emerald-500 mb-2" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Queue Clean</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- SHARED COMPONENT: USER PROVISIONING MODAL ---
const UserModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({ 
    username: '', email: '', password: '', 
    fullName: '', location: '', yearsOfExperience: 0 
  });

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!formData.username || !formData.email || !formData.password) {
      alert("Required: Username, Email, Password");
      return;
    }
    onSave(formData);
  };

  const inputClass = "w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-300";
  const labelClass = "text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block ml-1";

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-[3rem] w-full max-w-xl p-10 shadow-2xl relative border border-white/20 animate-in fade-in zoom-in duration-300">
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-colors"><X size={24}/></button>
        
        <header className="mb-8">
            <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900">Provision <span className="text-indigo-600">Candidate</span></h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">New Talent Profile Activation</p>
        </header>
        
        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-1">
            <label className={labelClass}>Username</label>
            <input placeholder="jdoe_dev" className={inputClass} onChange={(e) => setFormData({...formData, username: e.target.value})} />
          </div>
          <div className="col-span-1">
            <label className={labelClass}>Email Address</label>
            <input placeholder="john@company.com" className={inputClass} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Full Legal Name</label>
            <input placeholder="John Doe" className={inputClass} onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
          </div>
          <div className="col-span-1">
            <label className={labelClass}>Location</label>
            <input placeholder="New York, NY" className={inputClass} onChange={(e) => setFormData({...formData, location: e.target.value})} />
          </div>
          <div className="col-span-1">
            <label className={labelClass}>Years of Exp</label>
            <input type="number" placeholder="5" className={inputClass} onChange={(e) => setFormData({...formData, yearsOfExperience: parseInt(e.target.value) || 0})} />
          </div>
          <div className="col-span-2 pt-4 border-t border-slate-50 mt-2">
            <label className={labelClass}>Security: Initial Password</label>
            <input type="password" placeholder="••••••••" className={`${inputClass} bg-indigo-50/30 border-indigo-100`} onChange={(e) => setFormData({...formData, password: e.target.value})} />
          </div>
        </div>

        <div className="flex gap-4 mt-10">
          <button onClick={onClose} className="flex-1 py-4 text-[11px] font-black uppercase text-slate-400 hover:text-slate-900 transition-colors tracking-widest">Abort</button>
          <button onClick={handleSubmit} className="flex-[2] py-4 bg-slate-900 text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 active:scale-[0.98]">Deploy Profile</button>
        </div>
      </div>
    </div>
  );
};

// --- SHARED COMPONENT: APPLICATION FUNNEL CARD ---
const ApplicationFunnelCard = ({ data }) => {
  const maxVal = data.length > 0 ? Math.max(...data.map(d => d.ApplicationCount)) : 0;

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col h-full group">
      <div className="mb-10">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
          <span className="w-1.5 h-4 bg-slate-900 rounded-full group-hover:bg-indigo-600 transition-colors"></span>
          Application <span className="text-indigo-600 ml-1">Funnel</span>
        </h3>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 ml-3.5">Conversion Pipeline Intel</p>
      </div>

      <div className="space-y-6 flex-1 flex flex-col justify-center">
        {data.map((stage, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black uppercase text-slate-600 tracking-tight">{stage.StatusName}</span>
              <span className="text-sm font-black text-slate-900">{stage.ApplicationCount}</span>
            </div>
            <div className="h-3 bg-slate-50 rounded-xl overflow-hidden border border-slate-100 p-0.5">
              <div 
                className="h-full bg-slate-900 rounded-lg transition-all duration-1000 ease-out group-hover:bg-indigo-600"
                style={{ width: `${maxVal > 0 ? (stage.ApplicationCount / maxVal) * 100 : 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


// --- MAIN ADMIN DASHBOARD ---
function AdminDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [locationBias, setLocationBias] = useState([]);
  const [experienceBias, setExperienceBias] = useState([]);
  const [bottlenecks, setBottlenecks] = useState([]);
  const [recruiterPerf, setRecruiterPerf] = useState([]);
  const [vacancyData, setVacancyData] = useState([]);
  const [skillGaps, setSkillGaps] = useState([]);
  const [reports, setReports] = useState({ selected: 'vw_ApplicationFunnel', data: [] });
  const [users, setUsers] = useState([]);
  const [audit, setAudit] = useState([]);
  const [silentRejections, setSilentRejections] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [funnelData, setFunnelData] = useState([]);
  const [jobList, setJobList] = useState([]);
  const [candidateList, setCandidateList] = useState([]);
  const [appDetailedList, setAppDetailedList] = useState([]);
  const [skillList, setSkillList] = useState([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [jobArchive, setJobArchive] = useState([]);
  const [appArchive, setAppArchive] = useState([]);
  const [entitySubTab, setEntitySubTab] = useState('jobs');

  // LOGIC REMAINS UNTOUCHED
  const handleSaveCandidate = async (formData) => {
    try {
      await axios.post(`${API_BASE}/admin/users/candidate`, formData);
      setIsModalOpen(false);
      fetchUsers();
      alert("Candidate user created successfully!");
    } catch (err) {
      alert("Creation failed: " + (err.response?.data?.error || err.message));
    }
  };

  const fetchArchives = async () => {
    try {
      const [jobs, apps] = await Promise.all([
        axios.get(`${API_BASE}/admin/archives/jobs`),
        axios.get(`${API_BASE}/admin/archives/applications`)
      ]);
      setJobArchive(jobs.data);
      setAppArchive(apps.data);
    } catch (err) { console.error(err); }
  };

  const reportList = [
    'vw_ApplicationFunnel', 'vw_SkillGapAnalysis', 'vw_TimeToHire', 
    'vw_RecruiterPerformance', 'vw_Bias_Location', 'vw_Bias_Experience',
    'vw_HiringBottlenecks', 'vw_SilentRejections', 'vw_VacancyUtilization'
  ];

  useEffect(() => {
    if (activeTab === 'overview') loadOverview();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'reports') loadReport(reports.selected);
    if (activeTab === 'entities') fetchEntities();
    if (activeTab === 'maintenance') fetchArchives();
  }, [activeTab]);

  const loadOverview = async () => {
    try {
      const [auditRes, locRes, expRes, bottleRes, perfRes, vacRes, skillRes, silentRes, funnelRes] = await Promise.all([
        axios.get(`${API_BASE}/admin/audit-logs`),
        axios.get(`${API_BASE}/admin/reports/vw_Bias_Location`),
        axios.get(`${API_BASE}/admin/reports/vw_Bias_Experience`),
        axios.get(`${API_BASE}/admin/reports/vw_HiringBottlenecks`),
        axios.get(`${API_BASE}/admin/reports/vw_RecruiterPerformance`),
        axios.get(`${API_BASE}/admin/reports/vw_VacancyUtilization`),
        axios.get(`${API_BASE}/admin/reports/vw_SkillGapAnalysis`),
        axios.get(`${API_BASE}/admin/reports/vw_SilentRejections`),
        axios.get(`${API_BASE}/admin/analytics/funnel`)
      ]);
      setAudit(auditRes.data);
      setLocationBias(locRes.data);
      setExperienceBias(expRes.data);
      setBottlenecks(bottleRes.data);
      setRecruiterPerf(perfRes.data);
      setVacancyData(vacRes.data);
      setSkillGaps(skillRes.data);
      setSilentRejections(silentRes.data);
      setFunnelData(funnelRes.data);
    } catch (err) { console.error(err); }
  };

  const fetchUsers = () => { axios.get(`${API_BASE}/admin/users`).then(res => setUsers(res.data)); };

  const toggleUserStatus = async (userId) => {
    try {
      await axios.put(`${API_BASE}/admin/users/${userId}/toggle`);
      fetchUsers();
    } catch (err) { alert("Update failed"); }
  };

  const loadReport = (view) => {
    axios.get(`${API_BASE}/admin/reports/${view}`).then(res => 
      setReports(prev => ({ ...prev, selected: view, data: res.data }))
    );
  };

  const fetchEntities = async () => {
    try {
      const [jobs, candidates, apps, skills] = await Promise.all([
        axios.get(`${API_BASE}/admin/jobs?t=${Date.now()}`),
        axios.get(`${API_BASE}/admin/candidates?t=${Date.now()}`),
        axios.get(`${API_BASE}/admin/applications-detailed?t=${Date.now()}`),
        axios.get(`${API_BASE}/admin/skills?t=${Date.now()}`)
      ]);
      setJobList(jobs.data);
      setCandidateList(candidates.data);
      setAppDetailedList(apps.data);
      setSkillList(skills.data || []);
    } catch (err) { console.error(err); }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/admin/skills`, { SkillName: newSkillName });
      setNewSkillName('');
      fetchEntities();
    } catch (err) { alert(err.response?.data?.error || "Error"); }
  };

  const runMaintenance = async (proc) => {
    try {
      await axios.post(`${API_BASE}/admin/maintenance`, { procedure: proc });
      alert(`${proc} success!`);
      fetchArchives();
    } catch (err) { alert(err.message); }
  };

  const filteredUsers = (users || []).filter(u => {
    const matchesSearch = u.Username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.RoleID.toString() === roleFilter.toString();
    return matchesSearch && matchesRole;
  });

  // STYLES
  const tabBtnClass = (t) => `px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-slate-900 text-white shadow-lg shadow-slate-200 scale-105' : 'text-slate-400 hover:bg-slate-50'}`;
  const subTabBtnClass = (sub) => `text-[10px] font-black uppercase px-6 py-2 rounded-full transition-all ${entitySubTab === sub ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`;

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700">
      {/* GLOBAL ADMIN HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm gap-6">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900">Admin<span className="text-indigo-600">Intelligence</span></h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">System Control & Heuristics</p>
        </div>
        <nav className="flex bg-slate-50 p-1.5 rounded-[1.5rem] border border-slate-100">
          {['overview', 'users', 'entities', 'reports', 'maintenance'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} className={tabBtnClass(t)}> {t} </button>
          ))}
        </nav>
      </header>

      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* BIAS ANALYTICS SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-[3rem] p-2 border border-slate-100 shadow-sm"><BiasAnalysis data={locationBias} title="Geographic Bias" subtitle="Regional Hire Velocity" xKey="Location" /></div>
            <div className="bg-white rounded-[3rem] p-2 border border-slate-100 shadow-sm"><BiasAnalysis data={experienceBias} title="Experience Bias" subtitle="Experience Band Performance" xKey="ExperienceGroup" /></div>
          </div>

          {/* SHARED INTEL GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             <SkillGapRadar data={skillGaps} />
             <RecruiterLeaderboard data={recruiterPerf} />
             <VacancyUtilization data={vacancyData} />
             <GhostingAlert data={silentRejections} />
             <BottleneckAlerts data={bottlenecks} />
             <ApplicationFunnelCard data={funnelData} />
          </div>

          {/* AUDIT TRAIL */}
          <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                   <span className="w-1.5 h-4 bg-slate-900 rounded-full"></span> System Logs
                </h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 ml-3.5">Real-time Transactional Audit</p>
              </div>
              <ShieldAlert size={20} className="text-slate-200" />
            </div>
            <div className="overflow-x-auto rounded-2xl border border-slate-50">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                    <th className="p-5">Object</th><th className="p-5">Op</th><th className="p-5">Change</th><th className="p-5">User</th><th className="p-5 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {audit.slice(0, 10).map(log => (
                    <tr key={log.AuditID} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-5 text-[11px] font-black text-slate-900 uppercase">{log.TableName}</td>
                      <td className="p-5 text-[10px] font-black"><span className="px-2 py-1 rounded bg-indigo-50 text-indigo-600">{log.Operation}</span></td>
                      <td className="p-5 text-[10px] font-medium text-slate-500 max-w-xs truncate">{log.OldValue} <span className="text-slate-300">→</span> {log.NewValue}</td>
                      <td className="p-5 font-mono text-[10px] text-slate-400 italic font-bold">{log.ChangedBy}</td>
                      <td className="p-5 text-[10px] text-slate-400 text-right font-bold">{new Date(log.ChangedAt).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col lg:row justify-between items-center bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-600 text-white p-3 rounded-2xl shadow-lg shadow-indigo-100"><Users size={20} /></div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">User <span className="text-indigo-600">Registry</span></h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Global Identity Access Management</p>
              </div>
            </div>

            <div className="flex flex-1 max-w-3xl gap-4 w-full">
              <div className="relative flex-1 group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={16} />
                <input 
                  type="text" placeholder="FILTER BY IDENTITY..." 
                  className="w-full bg-slate-50 border border-slate-100 rounded-[1.25rem] pl-12 pr-6 py-4 text-[11px] font-black uppercase tracking-widest focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                className="bg-slate-50 border border-slate-100 rounded-[1.25rem] px-6 py-4 text-[11px] font-black uppercase tracking-widest outline-none cursor-pointer focus:ring-4 focus:ring-indigo-500/5"
                value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="1">Admins</option>
                <option value="2">Recruiters</option>
                <option value="3">Candidates</option>
              </select>
            </div>

            <button onClick={() => setIsModalOpen(true)} className="px-8 py-4 bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest rounded-[1.25rem] hover:bg-indigo-600 transition-all flex items-center gap-3 shadow-xl shadow-slate-200">
              <UserPlus size={16} /> Create Candidate
            </button>
          </div>

          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr><th className="px-10 py-6">Username</th><th className="px-10 py-6">Role</th><th className="px-10 py-6">Status</th><th className="px-10 py-6 text-right">Operational Toggle</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.map(u => (
                  <tr key={u.UserID} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-10 py-6 font-black text-slate-900 flex items-center gap-4 text-xs uppercase tracking-tight">
                      <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white text-[11px] shadow-sm group-hover:bg-indigo-600 transition-colors">{u.Username.substring(0, 2).toUpperCase()}</div>
                      {u.Username}
                    </td>
                    <td className="px-10 py-6">
                      <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-lg ${u.RoleID === 1 ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : u.RoleID === 2 ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-slate-50 text-slate-600 border border-slate-100'}`}>
                        {u.RoleID === 1 ? 'Admin' : u.RoleID === 2 ? 'Recruiter' : 'Candidate'}
                      </span>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${u.IsActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${u.IsActive ? 'text-emerald-600' : 'text-red-600'}`}> {u.IsActive ? 'Active' : 'Offline'} </span>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <button onClick={() => toggleUserStatus(u.UserID)} className={`text-[10px] font-black uppercase px-6 py-2.5 rounded-xl transition-all ${u.IsActive ? 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white'}`}>
                        {u.IsActive ? 'Revoke Access' : 'Restore Access'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <UserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveCandidate} />
        </div>
      )}

      {activeTab === 'entities' && (
  <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-10">
    
    {/* SUB-NAVIGATION TOGGLE */}
    <div className="flex gap-4 bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm w-fit mx-auto">
      {['jobs', 'applications', 'candidates', 'skills'].map(sub => (
        <button 
          key={sub} 
          onClick={() => setEntitySubTab(sub)} 
          className={subTabBtnClass(sub)}
        > 
          {sub} 
        </button>
      ))}
    </div>

    {/* SKILL INJECTION FORM (Conditional) */}
    {entitySubTab === 'skills' && (
      <div className="bg-indigo-50/50 p-6 rounded-[2.5rem] border border-dashed border-indigo-200 flex flex-col items-center">
        <form onSubmit={handleAddSkill} className="flex gap-4 w-full max-w-3xl">
          <input 
            type="text" 
            placeholder="INJECT NEW SKILL INTO SYSTEM..." 
            className="flex-1 bg-white border border-indigo-100 rounded-2xl px-6 py-4 text-[11px] font-black uppercase outline-none shadow-sm focus:ring-4 focus:ring-indigo-500/10"
            value={newSkillName} 
            onChange={(e) => setNewSkillName(e.target.value)}
          />
          <button type="submit" className="px-10 py-4 bg-slate-900 text-white text-[11px] font-black uppercase rounded-2xl hover:bg-indigo-600 shadow-xl transition-all">
            Append Skill
          </button>
        </form>
      </div>
    )}

    {/* DATA REGISTRY TABLE */}
    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
          <tr>
            {entitySubTab === 'jobs' && (
              <>
                <th className="p-8">Title Pattern</th>
                <th className="p-8">Node</th>
                <th className="p-8">Min Tenure</th>
                <th className="p-8 text-right">Slot Count</th>
              </>
            )}
            {entitySubTab === 'applications' && (
              <>
                <th className="p-8">Subject</th>
                <th className="p-8">Application Vector</th>
                <th className="p-8">State</th>
                <th className="p-8 text-right">Origin Date</th>
              </>
            )}
            {entitySubTab === 'candidates' && (
              <>
                <th className="p-8">Name</th>
                <th className="p-8">Experience</th>
                <th className="p-8">Location</th>
                <th className="p-8 text-right">Email Path</th>
              </>
            )}
            {entitySubTab === 'skills' && (
              <>
                <th className="p-8">UID</th>
                <th className="p-8">Skill Definition</th>
                <th className="p-8 text-right">Integrity</th>
              </>
            )}
          </tr>
        </thead>
        
        <tbody className="divide-y divide-slate-50">
          {/* JOBS DATA */}
          {entitySubTab === 'jobs' && jobList.map(j => (
            <tr key={j.JobID} className="hover:bg-slate-50/50 group transition-colors">
              <td className="p-8 font-black uppercase text-xs text-slate-900 tracking-tight">{j.JobTitle}</td>
              <td className="p-8 text-[11px] font-bold text-slate-400">{j.Location}</td>
              <td className="p-8 font-mono text-[11px] font-black text-indigo-600">{j.MinExperience} YRS</td>
              <td className="p-8 text-right font-black text-slate-900">{j.Vacancies}</td>
            </tr>
          ))}

          {/* APPLICATIONS DATA */}
          {entitySubTab === 'applications' && appDetailedList.map(a => (
            <tr key={a.ApplicationID} className="hover:bg-slate-50/50 group transition-colors">
              <td className="p-8 font-black uppercase text-xs text-slate-900">{a.FullName}</td>
              <td className="p-8 text-[11px] font-bold text-slate-400">{a.JobTitle}</td>
              <td className="p-8"> 
                <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg font-black uppercase text-[10px] tracking-widest">
                  {a.StatusName}
                </span> 
              </td>
              <td className="p-8 text-right text-[10px] font-black text-slate-300">
                {new Date(a.AppliedDate).toLocaleDateString()}
              </td>
            </tr>
          ))}

          {/* CANDIDATES DATA - Corrected Variable and Properties */}
          {entitySubTab === 'candidates' && candidateList.map(c => (
            <tr key={c.CandidateID} className="hover:bg-slate-50/50 group transition-colors">
              <td className="p-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center text-[10px] font-black italic">
                    {(c.FullName || "??").substring(0, 2).toUpperCase()}
                  </div>
                  <span className="font-black uppercase text-xs text-slate-900">{c.FullName}</span>
                </div>
              </td>
              <td className="p-8 font-mono text-[11px] font-black text-indigo-600">
                {c.YearsOfExperience || 0} YRS
              </td>
              <td className="p-8 text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                {c.Location || 'NODE_UNSET'}
              </td>
              <td className="p-8 text-right text-[15px] font-black text-slate-400 italic font-mono opacity-80">
                {c.Email || 'PRIVATE@SYSTEM.INT'}
              </td>
            </tr>
          ))}

          {/* SKILLS DATA */}
          {entitySubTab === 'skills' && skillList.map(s => (
            <tr key={s.SkillID} className="hover:bg-slate-50/50 group">
              <td className="p-8 font-mono text-[12px] text-slate-500"># {s.SkillID}</td>
              <td className="p-8 font-black uppercase text-xs text-slate-800">{s.SkillName}</td>
              <td className="p-8 text-right"> 
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                  Immutable
                </span> 
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* EMPTY STATE HANDLER */}
      {((entitySubTab === 'jobs' && jobList.length === 0) || 
        (entitySubTab === 'candidates' && candidateList.length === 0)) && (
        <div className="p-20 text-center text-slate-300 italic font-bold text-xs uppercase tracking-[0.3em]">
          No data entries detected in this node.
        </div>
      )}
    </div>
  </div>
)}

      {activeTab === 'reports' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 max-w-2xl mx-auto">
            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100"><BarChart3 size={20} /></div>
            <div className="flex-1">
               <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-1">Select Heuristic Model</label>
               <select 
                className="w-full bg-transparent font-black text-sm outline-none cursor-pointer text-slate-900 uppercase tracking-tight"
                value={reports.selected} onChange={(e) => loadReport(e.target.value)}
              >
                {reportList.map(r => <option key={r} value={r}>{r.replace('vw_', '').split('_').join(' ')}</option>)}
              </select>
            </div>
          </div>
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden p-2">
            <div className="overflow-x-auto rounded-[2.5rem] border border-slate-50">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  {reports.data[0] && <tr className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                    {Object.keys(reports.data[0]).map(k => <th key={k} className="p-6">{k}</th>)}
                  </tr>}
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {reports.data.map((row, i) => (
                    <tr key={i} className="hover:bg-indigo-50/30 transition-colors">
                      {Object.values(row).map((v, j) => <td key={j} className="p-6 text-[11px] font-bold text-slate-700 tracking-tight">{v?.toString() || 'NULL'}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'maintenance' && (
        <div className="space-y-12 animate-in zoom-in-95 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="p-12 bg-white border border-slate-100 rounded-[3rem] text-center space-y-6 shadow-sm group hover:shadow-2xl transition-all">
              <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto text-slate-900 font-black text-xl border border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-all">DB</div>
              <div>
                <h4 className="font-black uppercase tracking-tight text-xl text-slate-900">Data Archival</h4>
                <p className="text-[11px] font-medium text-slate-400 leading-relaxed uppercase tracking-widest mt-2">Prune system state: Offload stale objects</p>
              </div>
              <button onClick={() => runMaintenance('sp_ArchiveOldData')} className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200">Initiate sp_ArchiveOldData</button>
            </div>

            <div className="p-12 bg-white border border-slate-100 rounded-[3rem] text-center space-y-6 shadow-sm group hover:shadow-2xl transition-all">
              <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center mx-auto text-rose-600 font-black text-xl border border-rose-100 group-hover:bg-rose-600 group-hover:text-white transition-all">RG</div>
              <div>
                <h4 className="font-black uppercase tracking-tight text-xl text-rose-600">Compliance Flush</h4>
                <p className="text-[11px] font-medium text-slate-400 leading-relaxed uppercase tracking-widest mt-2">PII Anonymization: GDPR Compliance Loop</p>
              </div>
              <button onClick={() => runMaintenance('sp_AnonymizeArchivedCandidates')} className="w-full py-5 bg-rose-600 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-100">Initiate sp_AnonymizeFlush</button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Archive Lists */}
            {[ { title: 'Job Archive Vector', data: jobArchive, color: 'slate' }, { title: 'Application Archive Vector', data: appArchive, color: 'rose' } ].map((archive, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm h-[500px] flex flex-col">
                <h3 className={`font-black uppercase text-sm mb-8 flex items-center gap-3 ${archive.color === 'rose' ? 'text-rose-600' : 'text-slate-900'}`}>
                  <span className={`w-2 h-5 rounded-full ${archive.color === 'rose' ? 'bg-rose-500' : 'bg-slate-900'}`}></span>
                  {archive.title}
                </h3>
                <div className="overflow-y-auto flex-1 custom-scrollbar pr-4">
                  <table className="w-full text-left">
                    <thead className="sticky top-0 bg-white border-b border-slate-50 uppercase font-black text-[9px] text-slate-300 tracking-[0.2em]">
                      <tr><th className="pb-4">Name</th><th className="pb-4">Job Title</th><th className="pb-4 text-right">Commit Date</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {archive.data.length > 0 ? archive.data.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-5 font-black uppercase text-[11px] text-slate-800 tracking-tight">{item.FullName || `ID: ${item.CandidateID}`}</td>
                          <td className="py-5 font-black uppercase text-[11px] text-slate-800 tracking-tight">{item.JobTitle || item.FullName || `ID: ${item.CandidateID}`}</td>
                          <td className="py-5 text-right text-[10px] font-black text-slate-400">{new Date(item.ArchivedAt).toLocaleDateString()}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan="2" className="py-20 text-center text-[10px] font-black text-slate-300 uppercase italic tracking-widest">No Archived Records Found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// --- RECRUITER DASHBOARD (RE-ENGINEERED: INTEL DESIGN ETHOS) ---
function RecruiterDashboard({ user }) {
  const [matches, setMatches] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [archivedJobs, setArchivedJobs] = useState([]);
  const [activeTab, setActiveTab] = useState('active');
  const [availableSkills, setAvailableSkills] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null); 
  
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [summary, setSummary] = useState({ ActiveJobs: 0, NewApplications: 0, InterviewsToday: 0 });

  const [schedStart, setSchedStart] = useState("");
  const [schedEnd, setSchedEnd] = useState("");

  const [newJob, setNewJob] = useState({ 
    title: '', description: '', location: '', minExp: 0, vacancies: 1, requirements: [] 
  });

  const fetchData = async () => {
    try {
      const [activeRes, archivedRes, skillsRes, summaryRes] = await Promise.all([
        axios.get(`${API_BASE}/recruiter/jobs/${user.UserID}`),
        axios.get(`${API_BASE}/recruiter/jobs/archived/${user.UserID}`),
        axios.get(`${API_BASE}/skills`),
        axios.get(`${API_BASE}/recruiter/summary/${user.UserID}`)
      ]);
      
      setMyJobs(activeRes.data);
      setArchivedJobs(archivedRes.data);
      setAvailableSkills(skillsRes.data);
      setSummary(summaryRes.data);

      if (activeRes.data.length > 0 && !selectedJob) {
        setSelectedJob(activeRes.data[0]);
      }
    } catch (err) { console.error("Data fetch error", err); }
  };

  const loadMatches = (jobId) => {
    axios.get(`${API_BASE}/recruiter/matches/${jobId}`)
      .then(res => setMatches(res.data))
      .catch(() => setMatches([]));
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (selectedJob) {
      loadMatches(selectedJob.JobID);
    }
  }, [selectedJob]);

  const handleStatusUpdate = async (applicationId, newStatusId, statusLabel) => {
    try {
        const res = await axios.put(`${API_BASE}/recruiter/applications/${applicationId}/status`, {
            newStatusId,
            userId: user.UserID,
            notes: `Candidate moved to ${statusLabel} via Dashboard.`
        });
        alert(res.data.message);
        setShowMatchModal(false);
        if (selectedJob) loadMatches(selectedJob.JobID);
        fetchData();
    } catch (err) {
        alert("Status Update Failed: " + (err.response?.data?.error || "Invalid transition."));
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    const formattedStart = schedStart.replace('T', ' ') + ":00";
    const formattedEnd = schedEnd.replace('T', ' ') + ":00";

    try {
        const response = await axios.post(`${API_BASE}/recruiter/interviews`, {
            applicationId: selectedMatch.ApplicationID,
            recruiterUserId: user.UserID,
            startTime: formattedStart,
            endTime: formattedEnd
        });
        alert(response.data.message);
        setSchedStart("");
        setSchedEnd("");
        setShowMatchModal(false);
        fetchData();
    } catch (err) {
        alert("Scheduling Error: " + (err.response?.data?.error || "Check recruiter availability."));
    }
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/recruiter/jobs`, { ...newJob, userId: user.UserID });
      setShowForm(false);
      setNewJob({ title: '', description: '', location: '', minExp: 0, vacancies: 1, requirements: [] });
      fetchData();
      alert("Job Published!");
    } catch (err) { alert("Error: " + (err.response?.data?.error || "Check database.")); }
  };

  const handleDeleteJob = async (jobId, e) => {
    e.stopPropagation();
    if (!window.confirm("Archive this job?")) return;
    try {
        await axios.delete(`${API_BASE}/recruiter/jobs/${jobId}`);
        if (selectedJob?.JobID === jobId) setSelectedJob(null);
        fetchData();
    } catch (err) { alert("Error archiving job."); }
  };

  const handleRestoreJob = async (jobId, e) => {
    e.stopPropagation();
    try {
        await axios.put(`${API_BASE}/recruiter/jobs/restore/${jobId}`);
        fetchData();
    } catch (err) { alert("Error restoring job."); }
  };

  const handleHireCandidate = async (applicationId) => {
    if(!window.confirm("Confirm hiring? This will decrement vacancies and record the status change.")) return;
    try {
      const res = await axios.post(`${API_BASE}/recruiter/hire`, {
        applicationId: applicationId,
        userId: user.UserID
      });
      alert(res.data.message);
      setShowMatchModal(false);
      fetchData(); 
      if(selectedJob) loadMatches(selectedJob.JobID); 
    } catch (err) {
      alert("Hiring Failed: " + (err.response?.data?.error || "Server Error"));
    }
  };

  const toggleSkill = (skillId) => {
    const exists = newJob.requirements.find(r => r.skillId === skillId);
    if (exists) {
      setNewJob({ ...newJob, requirements: newJob.requirements.filter(r => r.skillId !== skillId) });
    } else {
      setNewJob({ ...newJob, requirements: [...newJob.requirements, { skillId, minProficiency: 5, isMandatory: false }] });
    }
  };

  const updateSkillReq = (skillId, field, value) => {
    const updated = newJob.requirements.map(r => r.skillId === skillId ? { ...r, [field]: value } : r);
    setNewJob({ ...newJob, requirements: updated });
  };

  const openMatchBreakdown = (match) => {
    setSelectedMatch(match);
    setShowMatchModal(true);
  };

  const runAutoReject = async () => {
    const confirmed = window.confirm("Reject ALL unqualified candidates? Proceed?");
    if (!confirmed) return;
    setIsProcessing(true);
    try {
        const response = await axios.post(`${API_BASE}/recruiter/run-auto-reject`);
        alert(response.data.message);
        fetchData(); 
    } catch (err) {
        alert("Error: " + (err.response?.data?.error || "Execution failed"));
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-10 relative animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* MODAL SECTION - INTEL OVERLAY */}
      {showMatchModal && selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setShowMatchModal(false)}></div>
            <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in duration-300">
                <div className="p-8 border-b bg-slate-50 flex justify-between items-center">
                    <div>
                        <h3 className="text-2xl font-black uppercase tracking-tighter">{selectedMatch.FullName}</h3>
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mt-1">Personnel Match Report • SCORE: {selectedMatch.TotalMatchScore}</p>
                    </div>
                    <button onClick={() => setShowMatchModal(false)} className="p-3 hover:bg-slate-200 rounded-full transition"><X size={20}/></button>
                </div>
                
                <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-slate-100 p-6 rounded-3xl text-black">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Exp Index</p>
                            <p className="text-3xl font-black">+{selectedMatch.ExperienceScore}</p>
                        </div>
                        <div className="bg-indigo-600 p-6 rounded-3xl text-white">
                            <p className="text-[9px] font-black text-indigo-200 uppercase tracking-widest mb-1">Geographic Bonus</p>
                            <p className="text-3xl font-black">+{selectedMatch.LocationBonus}</p>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Skill Alignment Analysis</h4>
                        {selectedMatch.SkillsDetails?.map((s, idx) => (
                            <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex justify-between text-xs font-black uppercase mb-3">
                                    <span>{s.SkillName} {s.IsMandatory && <span className="text-red-500 font-bold ml-1">CRITICAL</span>}</span>
                                    <span className={s.CandidateLevel >= s.RequiredLevel ? "text-emerald-600" : "text-amber-600"}>
                                        LVL {s.CandidateLevel} / {s.RequiredLevel}
                                    </span>
                                </div>
                                <div className="h-1.5 bg-slate-200 rounded-full relative">
                                    <div className="absolute h-full bg-indigo-600 rounded-full transition-all duration-1000" style={{ width: `${s.CandidateLevel * 10}%` }}></div>
                                    <div className="absolute h-4 w-1 bg-indigo-500 -top-1.5 rounded-full" style={{ left: `${s.RequiredLevel * 10}%` }}></div>
                                </div>
                            </div>
                        )) || <div className="text-center py-10 text-slate-400 italic text-sm">No skill data linked.</div>}
                    </div>

                    {selectedMatch.StatusID === 3 && (
                        <div className="mt-8 p-8 bg-indigo-50 rounded-[32px] border border-indigo-100">
                            <h4 className="text-sm font-black uppercase mb-6 flex items-center gap-2 tracking-tight">
                                <Calendar size={18} className="text-indigo-600" /> Interface: Schedule Session
                            </h4>
                            <form onSubmit={handleScheduleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[9px] font-black text-slate-400 block mb-1 uppercase tracking-widest">Inception</label>
                                        <input type="datetime-local" required className="w-full p-3 bg-white border-2 border-transparent focus:border-indigo-500 rounded-2xl text-xs font-bold outline-none transition" value={schedStart} onChange={(e) => setSchedStart(e.target.value)}/>
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black text-slate-400 block mb-1 uppercase tracking-widest">Termination</label>
                                        <input type="datetime-local" required className="w-full p-3 bg-white border-2 border-transparent focus:border-indigo-500 rounded-2xl text-xs font-bold outline-none transition" value={schedEnd} onChange={(e) => setSchedEnd(e.target.value)}/>
                                    </div>
                                </div>
                                <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl text-xs font-black uppercase hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 tracking-widest">Transmit Interview Slot</button>
                            </form>
                        </div>
                    )}
                </div>

                <div className="p-8 bg-slate-100 border-t border-slate-100 flex justify-between items-center">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Current Protocol</span>
                        <span className="text-sm font-black text-indigo-400 uppercase tracking-tighter">{selectedMatch.StatusName || 'Applied'}</span>
                    </div>
                    <div className="flex gap-3">
                        {![4, 5].includes(selectedMatch.StatusID) && (
                            <button onClick={() => handleStatusUpdate(selectedMatch.ApplicationID, 5, 'Rejected')} className="px-6 py-3 text-[10px] font-black uppercase bg-red-400 text-white rounded-2xl hover:bg-red-500 hover:text-white transition-all tracking-widest">Terminate</button>
                        )}
                        {(selectedMatch.StatusID === 1 || !selectedMatch.StatusID) && (
                            <button onClick={() => handleStatusUpdate(selectedMatch.ApplicationID, 2, 'Screening')} className="px-6 py-3 text-[10px] font-black uppercase bg-indigo-600 text-white rounded-2xl shadow-lg hover:bg-indigo-700 transition-all tracking-widest">Initialize Screening</button>
                        )}
                        {selectedMatch.StatusID === 2 && (
                            <button onClick={() => handleStatusUpdate(selectedMatch.ApplicationID, 3, 'Interview')} className="px-6 py-3 text-[10px] font-black uppercase bg-amber-500 text-white rounded-2xl shadow-lg hover:bg-amber-600 transition-all tracking-widest">Progress to Interview</button>
                        )}
                        {selectedMatch.StatusID === 3 && (
                            <button onClick={() => handleHireCandidate(selectedMatch.ApplicationID)} className="px-8 py-3 text-[10px] font-black uppercase bg-emerald-600 text-white rounded-2xl shadow-lg hover:bg-emerald-700 transition-all flex items-center gap-2 tracking-widest"><UserPlus size={14}/> Execute Hire</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* HEADER SECTION - REBRANDED */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm gap-6">
        <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900">Recruiter<span className="text-indigo-600">Intelligence</span></h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Acquisition Flow & Selection Strategy</p>
        </div>
        <div className="flex gap-4">
            <button
                onClick={runAutoReject}
                disabled={isProcessing}
                className={`flex items-center gap-2 px-8 py-4 rounded-2xl text-[10px] font-black uppercase transition-all shadow-xl tracking-widest
                    ${isProcessing 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                        : 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border-2 border-red-200'
                    }`}
            >
                <ShieldAlert size={16} />
                {isProcessing ? "Purging Pipeline..." : "Auto-Purge Unqualified"}
            </button>
            <button onClick={() => setShowForm(!showForm)} className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 shadow-2xl hover:bg-indigo-600  transition-all hover:text-white tracking-widest">
                {showForm ? 'Abort Creation' : <><Plus size={18}/> Create Posting</>}
            </button>
        </div>
      </div>

      {/* --- COMMAND MODULES (SUMMARY METRICS) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[40px] border-2 border-slate-100 shadow-sm flex items-center justify-between group hover:border-indigo-500 transition-all">
            <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Active Deployments</p>
                <h3 className="text-4xl font-black text-slate-900">{summary.ActiveJobs}</h3>
            </div>
            <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-900 group-hover:bg-indigo-600 group-hover:text-white transition-all"><Briefcase size={32} /></div>
        </div>
        
        <div className="bg-white p-8 rounded-[40px] border-2 border-slate-100 shadow-sm flex items-center justify-between group hover:border-amber-500 transition-all relative">
            <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Awaiting Review</p>
                <h3 className="text-4xl font-black text-slate-900">{summary.NewApplications}</h3>
            </div>
            <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-900 group-hover:bg-amber-500 group-hover:text-white transition-all"><Users size={32} /></div>
            {summary.NewApplications > 0 && (
                <span className="absolute -top-3 -right-3 bg-amber-500 text-white text-[9px] px-3 py-1.5 rounded-full font-black animate-bounce uppercase tracking-tighter border-4 border-white">Critcal Review</span>
            )}
        </div>

        <div className="bg-white p-8 rounded-[40px] border-2 border-slate-100 shadow-sm flex items-center justify-between group hover:border-purple-500 transition-all">
            <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Interviews Today</p>
                <h3 className="text-4xl font-black text-slate-900">{summary.InterviewsToday}</h3>
            </div>
            <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-900 group-hover:bg-purple-600 group-hover:text-white transition-all"><Calendar size={32} /></div>
        </div>
      </div>

      {/* JOB POSTING CONSTRUCTOR */}
      {showForm && (
        <form onSubmit={handlePostJob} className="bg-slate-50 p-10 rounded-[48px] border-4 border-slate-900 shadow-2xl grid grid-cols-1 md:grid-cols-3 gap-10 animate-in slide-in-from-top-8 duration-500">
            <div className="md:col-span-2 space-y-6">
                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-2 tracking-widest">Job Designation</label>
                    <input placeholder="e.g. Senior Intelligence Analyst" className="w-full p-5 bg-white border-2 border-transparent focus:border-indigo-500 rounded-[24px] outline-none font-bold shadow-sm transition" required value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})}/>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-2 tracking-widest">Description</label>
                    <textarea placeholder="Outline the key objectives..." className="w-full p-5 bg-white border-2 border-transparent focus:border-indigo-500 rounded-[24px] outline-none h-40 font-bold shadow-sm transition" required value={newJob.description} onChange={e => setNewJob({...newJob, description: e.target.value})}/>
                </div>
                
                <div className="pt-4">
                    <h4 className="text-[10px] font-black uppercase text-slate-900 mb-6 tracking-[0.3em] flex items-center gap-2">
                        <Settings size={14}/> Technical Requirements
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                        {availableSkills.map(skill => {
                            const req = newJob.requirements.find(r => r.skillId === skill.SkillID);
                            return (
                                <div key={skill.SkillID} className={`p-4 rounded-2xl border-2 transition-all ${req ? 'border-indigo-600 bg-indigo-50 scale-[0.98]' : 'bg-white border-transparent'}`}>
                                    <label className="flex items-center gap-3 cursor-pointer mb-3">
                                        <input type="checkbox" checked={!!req} onChange={() => toggleSkill(skill.SkillID)} className="w-5 h-5 rounded accent-indigo-600" />
                                        <span className="text-xs font-black uppercase tracking-tight">{skill.SkillName}</span>
                                    </label>
                                    {req && (
                                        <div className="flex items-center justify-between gap-4 pt-2 border-t border-indigo-200">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-black text-indigo-400">MIN LVL:</span>
                                                <input type="number" min="1" max="10" className="w-12 p-1 text-[10px] border-2 border-indigo-200 rounded-lg font-black text-center" value={req.minProficiency} onChange={(e) => updateSkillReq(skill.SkillID, 'minProficiency', e.target.value)}/>
                                            </div>
                                            <label className="text-[9px] font-black flex items-center gap-2 text-indigo-600">
                                                <input type="checkbox" checked={req.isMandatory} onChange={(e) => updateSkillReq(skill.SkillID, 'isMandatory', e.target.checked)} className="accent-indigo-600" /> MANDATORY
                                            </label>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            <div className="space-y-6">
                <div className="bg-white p-8 rounded-[32px] shadow-sm space-y-6">
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Location</label>
                        <input placeholder="Location" className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-bold transition" required value={newJob.location} onChange={e => setNewJob({...newJob, location: e.target.value})}/>
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Experience Floor (Years)</label>
                        <input type="number" className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-black transition" value={newJob.minExp} onChange={e => setNewJob({...newJob, minExp: e.target.value})}/>
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Vacancies</label>
                        <input type="number" className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-black transition" value={newJob.vacancies} onChange={e => setNewJob({...newJob, vacancies: e.target.value})}/>
                    </div>
                    <button type="submit" className="w-full bg-slate-200 text-black py-6 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-900 hover:text-white transition-all transform active:scale-95">Publish</button>
                </div>
            </div>
        </form>
      )}

      {/* MAIN INTELLIGENCE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em] flex items-center gap-3">
                <span className="w-8 h-1 bg-indigo-600 rounded-full"></span>
                LIVE MATCH ENGINE {selectedJob && <span className="text-indigo-600">— {selectedJob.JobTitle}</span>}
            </h3>
            <div className="bg-white rounded-[40px] shadow-xl border-2 border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                <thead className="bg-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    <tr>
                        <th className="px-10 py-6">Candidate Name</th>
                        <th className="px-10 py-6 text-center">Compatibility Index</th>
                        <th className="px-10 py-6 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {matches.length > 0 ? matches.map((m, i) => (
                        <tr key={i} className="group hover:bg-slate-50 transition-all duration-300">
                            <td className="px-10 py-8">
                                <div className="font-black text-slate-900 uppercase text-sm tracking-tight">{m.FullName}</div>
                                <div className="text-[9px] font-black uppercase text-indigo-500 tracking-widest mt-1 flex items-center gap-1">
                                    <div className="w-1 h-1 bg-indigo-500 rounded-full"></div> {m.StatusName}
                                </div>
                            </td>
                            <td className="px-10 py-8 text-center">
                                <span className="text-2xl font-black text-slate-900 bg-slate-100 px-4 py-2 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all">{m.TotalMatchScore}</span>
                            </td>
                            <td className="px-10 py-8 text-right">
                                <button onClick={() => openMatchBreakdown(m)} className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase hover:bg-indigo-600 transition-all tracking-widest shadow-lg shadow-slate-200">Review & Manage</button>
                            </td>
                        </tr>
                    )) : (
                        <tr><td colSpan="3" className="px-10 py-20 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest">No matching personnel identified for this posting.</td></tr>
                    )}
                </tbody>
                </table>
            </div>
        </div>
        
        {/* SIDEBAR TABS (HARDWARE CONTROL BOARD) */}
        <div className="space-y-6">
            <div className="bg-slate-100 p-2 rounded-[28px] flex gap-2">
                <button 
                    onClick={() => setActiveTab('active')} 
                    className={`flex-1 py-4 text-[9px] font-black uppercase tracking-[0.2em] rounded-[20px] transition-all duration-300 ${activeTab === 'active' ? 'bg-slate-900 text-white shadow-xl scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Active Deployments ({myJobs.length})
                </button>
                <button 
                    onClick={() => setActiveTab('archive')} 
                    className={`flex-1 py-4 text-[9px] font-black uppercase tracking-[0.2em] rounded-[20px] transition-all duration-300 ${activeTab === 'archive' ? 'bg-slate-900 text-white shadow-xl scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Archived ({archivedJobs.length})
                </button>
            </div>

            <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                {(activeTab === 'active' ? myJobs : archivedJobs).map(job => (
                    <div key={job.JobID} onClick={() => setSelectedJob(job)} className={`p-8 rounded-[32px] border-4 cursor-pointer transition-all relative group ${selectedJob?.JobID === job.JobID ? 'border-indigo-600 bg-white shadow-2xl translate-x-2' : 'bg-white border-transparent hover:border-slate-200'}`}>
                        <div className="absolute top-6 right-6 flex gap-2">
                            {activeTab === 'active' ? (
                                <button onClick={(e) => handleDeleteJob(job.JobID, e)} className="text-slate-300 hover:text-red-500 transition-colors p-2"><Trash2 size={18}/></button>
                            ) : (
                                <button onClick={(e) => handleRestoreJob(job.JobID, e)} className="text-slate-300 hover:text-emerald-500 transition-colors p-2"><Clock size={18}/></button>
                            )}
                        </div>
                        <div className="pr-10 mb-4">
                            <h4 className={`font-black text-sm uppercase tracking-tight leading-tight ${selectedJob?.JobID === job.JobID ? 'text-indigo-600' : 'text-slate-900 group-hover:text-indigo-500'}`}>{job.JobTitle}</h4>
                            <div className="flex gap-2 mt-2">
                                <span className={`text-[8px] px-2 py-1 rounded-md font-black uppercase tracking-widest ${activeTab === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{activeTab === 'active' ? 'Online' : 'Archived'}</span>
                                <span className="text-[8px] px-2 py-1 bg-indigo-600 text-white rounded-md font-black uppercase tracking-widest">ID: {job.JobID}</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-50 pt-4 mt-4">
                            <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">{job.Location}</p>
                            <p className="text-[9px] text-slate-900 font-black uppercase bg-slate-50 px-3 py-1 rounded-full">{job.Vacancies} OPENINGS</p>
                        </div>
                    </div>
                ))}
                { (activeTab === 'active' ? myJobs : archivedJobs).length === 0 && (
                    <div className="text-center py-20 text-slate-400 text-[10px] font-black uppercase tracking-widest italic border-2 border-dashed border-slate-200 rounded-[32px]">No data strings found</div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}


// --- CANDIDATE DASHBOARD ---
function CandidateDashboard({ user }) {
  const [jobs, setJobs] = useState([]);
  const [myApps, setMyApps] = useState([]);
  const [profile, setProfile] = useState({ skills: [], docs: [] });
  const [allSkills, setAllSkills] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [newSkill, setNewSkill] = useState({ id: "", level: 5 });
  const [selectedGap, setSelectedGap] = useState(null);
  const [inspectingJobId, setInspectingJobId] = useState(null);

  const API_BASE = "http://localhost:5000/api";

  const refreshData = async () => {
    try {
      const [jobsRes, appsRes, profileRes, docsRes, skillsRes, interviewRes] = await Promise.all([
        axios.get(`${API_BASE}/candidate/recommendations/${user.UserID}`),
        axios.get(`${API_BASE}/candidate/apps/${user.UserID}`),
        axios.get(`${API_BASE}/candidate/profile/${user.UserID}`),
        axios.get(`${API_BASE}/candidate/documents/${user.UserID}`),
        axios.get(`${API_BASE}/skills`),
        axios.get(`${API_BASE}/candidate/interviews/${user.UserID}`)
      ]);
      setJobs(jobsRes.data);
      setMyApps(appsRes.data);
      setProfile({ ...profileRes.data, docs: docsRes.data });
      setAllSkills(skillsRes.data);
      setInterviews(interviewRes.data);
    } catch (err) {
      console.error("Data refresh failed", err);
    }
  };

  useEffect(() => { refreshData(); }, []);

  const handleConfirmInterview = async (scheduleId) => {
    try {
      await axios.put(`${API_BASE}/candidate/interviews/confirm`, { 
        scheduleId, 
        userId: user.UserID 
      });
      refreshData();
    } catch (err) {
      alert("Confirmation failed: " + err.response?.data?.error || err.message);
    }
  };

  const checkSkillGap = async (jobId) => {
    if (inspectingJobId === jobId) { setInspectingJobId(null); return; }
    try {
      const res = await axios.get(`${API_BASE}/candidate/skill-gap/${jobId}/${user.UserID}`);
      setSelectedGap(res.data);
      setInspectingJobId(jobId);
    } catch (err) { console.error("Failed to fetch skill gap"); }
  };

  const handleWithdraw = async (appId) => {
    if (!window.confirm("Confirm withdrawal?")) return;
    try {
      await axios.post(`${API_BASE}/withdraw`, { appId, userId: user.UserID });
      await refreshData();
    } catch (err) { console.error(err); alert("Withdrawal failed."); }
  };

  const updateProfile = async () => {
    await axios.put(`${API_BASE}/candidate/profile`, { userId: user.UserID, location: profile.Location, yearsOfExperience: profile.YearsOfExperience });
    alert("Profile Updated");
    refreshData();
  };

  const addSkill = async () => {
    if(!newSkill.id) return;
    await axios.post(`${API_BASE}/candidate/skills`, { userId: user.UserID, skillId: newSkill.id, proficiency: newSkill.level });
    setNewSkill({ id: "", level: 5 });
    refreshData();
  };

  const uploadDoc = async () => {
    const name = prompt("Enter Document Name:");
    if(name) {
        await axios.post(`${API_BASE}/candidate/documents`, { userId: user.UserID, docName: name });
        refreshData();
    }
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto p-6 pb-20">
      
      {/* HEADER SECTION */}
      <header className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm gap-6">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900">Dashboard<span className="text-indigo-600">.</span></h2>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Welcome back, {user.Username}</p>
        </div>
        <div className="flex gap-3">
            <div className="bg-white px-6 py-3 rounded-2xl shadow-sm flex items-center gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">System Active</span>
            </div>
        </div>
      </header>

      {/* SECTION 1: PROFILE & SKILLS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-1 bg-white p-8 rounded-[40px] shadow-sm space-y-8">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center text-white shadow-xl rotate-3">
              <UserCircle size={32} />
            </div>
            <div>
              <h2 className="font-black text-xl uppercase tracking-tight">Talent Profile</h2>
              <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest">Candidate ID: #{user.UserID}</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Preferred Location</label>
              <input className="w-full mt-1.5 p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none" value={profile.Location || ""} onChange={e => setProfile({...profile, Location: e.target.value})}/>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Experience (Years)</label>
              <input type="number" className="w-full mt-1.5 p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none" value={profile.YearsOfExperience || 0} onChange={e => setProfile({...profile, YearsOfExperience: e.target.value})}/>
            </div>
            <button onClick={updateProfile} className="w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase shadow-xl shadow-indigo-700/20 hover:bg-indigo-600 transition-all active:scale-[0.98]">Update Profile</button>
          </div>

          <div className="pt-6 border-t space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified Documents</h3>
            <div className="space-y-2">
              {profile.docs?.map(d => (
                <div key={d.DocumentID} className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-transparent hover:border-slate-200 transition group cursor-default">
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
                    <div className="p-2 bg-white rounded-lg shadow-sm group-hover:text-indigo-600 transition">
                        <FileText size={16}/> 
                    </div>
                    {d.DocumentName}
                  </div>
                  <CheckCircle size={14} className="text-emerald-500" />
                </div>
              ))}
            </div>
            <button onClick={uploadDoc} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all">Add New Document</button>
          </div>
        </section>

        <section className="lg:col-span-2 bg-white p-8 rounded-[40px]  shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
              <div className="w-3 h-3 bg-indigo-600 rounded-full"></div> Professional Skills Matrix
            </h3>
            <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full uppercase tracking-widest">
                {profile.skills?.length || 0} Skills Active
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 flex-1">
            <div className="space-y-8">
              {profile.skills?.map(s => (
                <div key={s.SkillID} className="group">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter mb-2">
                    <span className="group-hover:text-indigo-600 transition">{s.SkillName}</span>
                    <span className="text-slate-400">Level {s.ProficiencyLevel} / 10</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
                    <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(37,99,235,0.3)]" style={{ width: `${s.ProficiencyLevel * 10}%` }}></div>
                  </div>
                </div>
              ))}
              {profile.skills?.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-2 opacity-50 italic">
                      <BarChart3 size={40} />
                      <p className="text-xs font-bold uppercase tracking-widest">No skills added yet</p>
                  </div>
              )}
            </div>
            
            <div className="bg-slate-50 p-8 rounded-[35px] space-y-6 h-fit text-white  border hover:border-indigo-600 hover:shadow-2xl hover:-translate-y-1 shadow-indigo-900/20">
              <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Skill Acquisition</h4>
                  <p className="text-xs text-slate-400 font-bold">Add or update your expertise level to improve job matching.</p>
              </div>
              <select className="w-full p-4 bg-slate-100 hover:border-indigo-600 hover:shadow-2xl hover:-translate-y-1 border-none rounded-2xl text-sm font-bold text-black outline-none focus:ring-2 ring-indigo-500 transition-all" value={newSkill.id} onChange={e => setNewSkill({...newSkill, id: e.target.value})}>
                <option value="">Select Skill...</option>
                {allSkills.map(s => <option key={s.SkillID} value={s.SkillID} className="text-black">{s.SkillName}</option>)}
              </select>
              <div className="space-y-3">
                 <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase text-slate-400">Proficiency Level</label>
                    <span className="font-black text-xl text-indigo-400">{newSkill.level}</span>
                 </div>
                 <input type="range" min="1" max="10" className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" value={newSkill.level} onChange={e => setNewSkill({...newSkill, level: e.target.value})}/>
              </div>
              <button onClick={addSkill} className="w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase shadow-xl shadow-indigo-600/20 hover:bg-indigo-600 transition-all active:scale-[0.98]">Add Skill</button>
            </div>
          </div>
        </section>
      </div>

      {/* UPCOMING INTERVIEWS */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
            <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                <Calendar className="text-indigo-600" /> Upcoming Interviews 
            </h2>
            <div className="h-px flex-1 bg-slate-100 mx-6 hidden md:block"></div>
            <span className="bg-amber-100 text-amber-600 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
                {interviews.length} Scheduled
            </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {interviews.length > 0 ? interviews.map((meeting) => (
            <div key={meeting.ScheduleID} className="bg-white p-6 rounded-[35px] border-2 border-transparent shadow-sm hover:shadow-xl hover:border-slate-100 transition-all group relative">
              <div className="flex justify-between items-start mb-6">
                <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${meeting.TimeStatus === 'Upcoming' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                  {meeting.TimeStatus}
                </div>
                {meeting.CandidateConfirmed ? (
                  <div className="flex items-center gap-1.5 text-emerald-500 text-[9px] font-black uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> Confirmed
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-amber-500 text-[9px] font-black uppercase tracking-widest animate-pulse">
                    <AlertCircle size={14} /> Confirmation Required
                  </div>
                )}
              </div>

              <h3 className="font-black text-lg leading-tight group-hover:text-indigo-600 transition">{meeting.JobTitle}</h3>
              <p className="text-xs text-slate-400 font-bold mb-6 italic tracking-tight">Interview with {meeting.RecruiterName}</p>
              
              <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="bg-slate-50 p-3 rounded-2xl">
                  <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Date</label>
                  <div className="flex items-center gap-2 text-[11px] font-black">
                    <Calendar size={12} className="text-indigo-500" />
                    {new Date(meeting.InterviewStart).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl">
                  <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Time</label>
                  <div className="flex items-center gap-2 text-[11px] font-black">
                    <Clock size={12} className="text-indigo-500" />
                    {new Date(meeting.InterviewStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              {!meeting.CandidateConfirmed && meeting.TimeStatus === 'Upcoming' && (
                <button 
                  onClick={() => handleConfirmInterview(meeting.ScheduleID)}
                  className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-600 transition shadow-lg shadow-amber-200"
                >
                  Confirm Attendance
                </button>
              )}
            </div>
          )) : (
            <div className="col-span-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-[35px] p-16 text-center">
              <Calendar size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">No upcoming interviews scheduled</p>
            </div>
          )}
        </div>
      </section>

      {/* JOBS & TRACKING */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <section className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
              <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                <Star className="text-indigo-600" /> AI Recommendations
              </h2>
              <span className="text-[9px] font-black bg-slate-900 text-white px-3 py-1 rounded-lg uppercase tracking-widest">Engine v2.0</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.map(job => {
              const alreadyApplied = myApps.some(app => app.JobID === job.JobID);
              return (
                <div key={job.JobID} className={`bg-white p-7 rounded-[40px] border-2 transition-all relative overflow-hidden group ${alreadyApplied ? 'opacity-70 bg-slate-50 border-transparent' : 'hover:border-indigo-600 hover:shadow-2xl hover:-translate-y-1'}`}>
                  {job.TotalMatchScore && !alreadyApplied && (
                    <div className="absolute top-0 right-0 bg-indigo-600 text-white px-5 py-2.5 rounded-bl-[25px] font-black text-[10px] tracking-tighter">
                      {Math.round(job.TotalMatchScore)}% MATCH
                    </div>
                  )}
                  {alreadyApplied && (
                    <div className="absolute top-0 right-0 bg-emerald-500 text-white px-5 py-2.5 rounded-bl-[25px] font-black text-[10px] flex items-center gap-1.5 tracking-widest">
                      <Check size={12} strokeWidth={4} /> APPLIED
                    </div>
                  )}
                  
                  <div className="mb-6">
                      <h3 className="font-black text-xl leading-tight mb-1 group-hover:text-indigo-600 transition">{job.JobTitle}</h3>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                          <span>{job.Location}</span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                          <span>{job.MinExperience}yr+ Exp</span>
                      </div>
                  </div>

                  {inspectingJobId === job.JobID && selectedGap && (
                    <div className="mb-6 p-5 bg-slate-50 rounded-[25px] space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                      <p className="text-[9px] font-black uppercase text-slate-600 tracking-widest border-b border-slate-300 pb-2">Gap Analysis</p>
                      {selectedGap.map((skill, i) => (
                        <div key={i} className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between text-[10px] font-bold">
                            <span className={`${skill.Status === 'Missing' ? 'text-rose-400' : 'text-slate-500'}`}>
                              {skill.SkillName} {skill.IsMandatory ? '*' : ''}
                            </span>
                            <span className="text-slate-500">{skill.CandidateLevel}/{skill.RequiredLevel}</span>
                          </div>
                          <div className="h-1 bg-slate-300 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${skill.Status === 'Missing' ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${(skill.CandidateLevel/skill.RequiredLevel)*100}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-3">
                      <button onClick={() => checkSkillGap(job.JobID)} className="flex-1 py-4 bg-slate-50 border border-slate-200 text-slate-600 rounded-2xl font-black text-[10px] hover:bg-slate-100 transition-all uppercase tracking-widest">
                        {inspectingJobId === job.JobID ? 'Close' : 'Analysis'}
                      </button>
                      {alreadyApplied ? (
                        <button disabled className="flex-[2] py-4 bg-slate-200 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest cursor-not-allowed">Application Sent</button>
                      ) : (
                        <button onClick={() => axios.post(`${API_BASE}/apply`, { jobId: job.JobID, userId: user.UserID }).then(refreshData)} className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] hover:bg-indigo-600 transition-all uppercase tracking-widest shadow-lg shadow-indigo-200 active:scale-[0.98]">Quick Apply</button>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="lg:col-span-1 space-y-6">
          <h2 className="text-xl font-black uppercase tracking-tight">Active Tracking</h2>
          <div className="bg-white rounded-[40px] border shadow-sm overflow-hidden divide-y divide-slate-50">
            {myApps.length > 0 ? myApps.map(app => (
              <div key={app.ApplicationID} className="p-6 flex items-center justify-between group hover:bg-slate-50 transition-colors">
                <div className="min-w-0">
                  <h4 className="font-black text-sm uppercase truncate w-36 mb-1">{app.JobTitle}</h4>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                        app.StatusName === 'Rejected' ? 'bg-rose-500' : 
                        app.StatusName === 'Hired' ? 'bg-emerald-500' : 'bg-indigo-500'
                    }`}></span>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${
                        app.StatusName === 'Rejected' ? 'text-rose-500' : 
                        app.StatusName === 'Hired' ? 'text-emerald-500' : 'text-indigo-500'
                    }`}> {app.StatusName} </p>
                  </div>
                </div>
                <button onClick={() => handleWithdraw(app.ApplicationID)} className="p-3 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                  <Trash2 size={18}/>
                </button>
              </div>
            )) : (
              <div className="p-20 text-center flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                    <Briefcase size={24} />
                </div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">No Applications</p>
              </div>
            )}
          </div>
          
          <div className="bg-indigo-600 rounded-[40px] p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden group">
              <div className="relative z-10">
                <h4 className="font-black text-lg uppercase tracking-tight leading-tight mb-2">Need to polish your profile?</h4>
                <p className="text-xs font-bold text-indigo-100 mb-6">Completing your skills matrix increases your visibility to recruiters by 40%.</p>
                <div className="h-1.5 w-full bg-indigo-700 rounded-full mb-4">
                    <div className="h-full bg-white rounded-full w-2/3"></div>
                </div>
                <p className="text-[9px] font-black uppercase tracking-widest text-indigo-200">Profile Completion: 65%</p>
              </div>
              <Plus className="absolute -bottom-4 -right-4 text-indigo-500 w-32 h-32 opacity-20 group-hover:rotate-90 transition-transform duration-1000" />
          </div>
        </section>
      </div>
    </div>
  );
}