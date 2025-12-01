import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
 ArrowLeft, Palette, Type, Box, Layers, Grid,
 CheckCircle, Sun, Moon, Copy, Check, Search,
 Layout, BarChart3, MessageSquare, FormInput, ChevronRight,
 Bell, User, Home, Settings, Users, FileText, Zap,
 X, ChevronLeft, ChevronLast, Sliders, Loader2
} from 'lucide-react';

const DesignSystemPage = () => {
 const [activeSection, setActiveSection] = useState('colors');
 const [searchQuery, setSearchQuery] = useState('');
 const [darkMode, setDarkMode] = useState(false);
 const [copiedCode, setCopiedCode] = useState('');
 const [toggleOn, setToggleOn] = useState(false);
 const [activeTab, setActiveTab] = useState('tab1');
 const [modalOpen, setModalOpen] = useState(false);

 const sections = [
 { id: 'colors', label: 'Colors', icon: Palette },
 { id: 'typography', label: 'Typography', icon: Type },
 { id: 'components', label: 'Components', icon: Grid },
 { id: 'dashboard', label: 'Dashboard', icon: Layout },
 { id: 'charts', label: 'Charts', icon: BarChart3 },
 { id: 'modals', label: 'Modals', icon: MessageSquare },
 ];

 const filteredSections = sections.filter(s =>
 s.label.toLowerCase().includes(searchQuery.toLowerCase())
 );

 const copyToClipboard = (code, id) => {
 navigator.clipboard.writeText(code);
 setCopiedCode(id);
 setTimeout(() => setCopiedCode(''), 2000);
 };

 return (
 <div className={`min-h-[100dvh] ${darkMode ? 'bg-gray-900' : 'bg-[var(--bg-primary)]'} p-8 transition-colors duration-300`}>
 {/* Header */}
 <div className="max-w-7xl mx-auto mb-8">
 <div className="flex items-center justify-between mb-6">
 <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--text-muted)] hover:text-[var(--accent)]">
 <ArrowLeft size={16} /> Back to Landing
 </Link>
 <button onClick={() => setDarkMode(!darkMode)} className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-xl text-sm font-bold">
 {darkMode ? <Sun size={16} className="text-[var(--warning)]" /> : <Moon size={16} className="text-[var(--accent)]" />}
 {darkMode ? 'Light' : 'Dark'}
 </button>
 </div>
 <div className="glass-card rounded-[var(--radius-xl)] p-8 border border-[var(--accent)]/20">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-4">
 <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
 <Palette size={28} />
 </div>
 <div>
 <h1 className="text-xl sm:text-2xl font-medium">NexHire Design System</h1>
 <p className="text-xs font-bold text-[var(--text-muted)]">Live Component Library</p>
 </div>
 </div>
 <div className="relative">
 <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
 <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 pr-4 py-3 bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-xl text-sm font-bold w-64" />
 </div>
 </div>
 </div>
 </div>

 {/* Navigation */}
 <div className="max-w-7xl mx-auto mb-8">
 <div className="flex gap-2 flex-wrap">
 {(searchQuery ? filteredSections : sections).map(section => (
 <button key={section.id} onClick={() => { setActiveSection(section.id); setSearchQuery(''); }}
 className={`px-6 py-3 text-sm font-bold rounded-xl flex items-center gap-2 ${activeSection === section.id ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-accent)] text-[var(--text-muted)] border border-[var(--border-primary)]'}`}>
 <section.icon size={16} /> {section.label}
 </button>
 ))}
 </div>
 </div>

 <div className="max-w-7xl mx-auto space-y-5 sm:space-y-8">

 {/* COLORS */}
 {activeSection === 'colors' && (
 <div className="space-y-5 sm:space-y-8">
 {/* Primary Colors - Visual */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8">
 <h2 className="text-lg font-medium text-[var(--accent)] mb-6 flex items-center gap-3"><Palette size={20} /> Primary Colors</h2>
 <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
 {[
 { name: 'Indigo 400', class: 'bg-indigo-400', code: 'indigo-400' },
 { name: 'Indigo 500', class: 'bg-[var(--accent)]', code: 'indigo-500' },
 { name: 'Indigo 600', class: 'bg-[var(--accent)]', code: 'indigo-600' },
 { name: 'Emerald 500', class: 'bg-[var(--success)]', code: 'emerald-500' },
 { name: 'Amber 500', class: 'bg-[var(--warning)]', code: 'amber-500' },
 { name: 'Rose 500', class: 'bg-[var(--danger)]', code: 'rose-500' },
 ].map((c, i) => (
 <div key={i} className="space-y-2">
 <div className={`h-20 ${c.class} rounded-2xl shadow-lg`}></div>
 <div className="flex items-center justify-between">
 <span className="text-xs font-bold">{c.name}</span>
 <button onClick={() => copyToClipboard(c.code, `c-${i}`)} className="p-1">
 {copiedCode === `c-${i}` ? <Check size={12} className="text-[var(--success)]" /> : <Copy size={12} className="text-[var(--text-muted)]" />}
 </button>
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Glass Cards - Visual */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8">
 <h2 className="text-lg font-medium text-[var(--accent)] mb-6">Glass Card Variants</h2>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
 <div className="glass-card rounded-2xl p-6 border border-[var(--border-primary)]">
 <p className="text-xs font-semibold text-[var(--accent)] uppercase">Standard</p>
 <p className="text-sm mt-2">Glass card with border</p>
 </div>
 <div className="glass-card rounded-[var(--radius-xl)] p-8 border border-[var(--accent)]/20 bg-[var(--accent)]/5">
 <p className="text-xs font-semibold text-[var(--accent)] uppercase">Accent</p>
 <p className="text-sm mt-2">With gradient background</p>
 </div>
 <div className="glass-card rounded-xl p-4 bg-[var(--bg-accent)] border border-[var(--border-primary)]">
 <p className="text-xs font-semibold text-[var(--success)] uppercase">Compact</p>
 <p className="text-sm mt-2">Small variant</p>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* TYPOGRAPHY */}
 {activeSection === 'typography' && (
 <div className="space-y-5 sm:space-y-8">
 <div className="glass-card rounded-[var(--radius-xl)] p-8">
 <h2 className="text-lg font-medium text-[var(--accent)] mb-6 flex items-center gap-3"><Type size={20} /> Typography Scale</h2>
 <div className="space-y-6">
 <div className="flex items-center gap-8">
 <div className="w-32 shrink-0"><p className="text-[11px] text-[var(--text-muted)]">Page Title</p></div>
 <p className="text-xl sm:text-2xl font-semibold">Page Title - 2xl</p>
 </div>
 <div className="flex items-center gap-8">
 <div className="w-32 shrink-0"><p className="text-[11px] text-[var(--text-muted)]">Section</p></div>
 <p className="text-lg font-medium">Section Header</p>
 </div>
 <div className="flex items-center gap-8">
 <div className="w-32 shrink-0"><p className="text-[11px] text-[var(--text-muted)]">Label</p></div>
 <p className="text-[11px] font-medium">Label Text</p>
 </div>
 <div className="flex items-center gap-8">
 <div className="w-32 shrink-0"><p className="text-[11px] text-[var(--text-muted)]">Stat</p></div>
 <p className="text-5xl font-semibold text-[var(--accent)]">99+</p>
 </div>
 <div className="flex items-center gap-8">
 <div className="w-32 shrink-0"><p className="text-[11px] text-[var(--text-muted)]">Body</p></div>
 <p className="text-sm font-bold">Body text example with bold</p>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* COMPONENTS - LIVE */}
 {activeSection === 'components' && (
 <div className="space-y-5 sm:space-y-8">
 {/* Buttons - LIVE */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8">
 <h2 className="text-lg font-medium text-[var(--accent)] mb-6">Buttons</h2>
 <div className="flex flex-wrap gap-4 mb-8">
 <button className="px-8 py-4 bg-[var(--accent)] text-white rounded-2xl font-semibold text-xs hover:bg-[var(--accent-hover)] transition-all">Primary</button>
 <button className="px-6 py-3 bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-xl text-[11px] font-semibold hover:bg-[var(--accent)]/10">Secondary</button>
 <button className="px-4 py-2 bg-[var(--danger)]/10 border border-[var(--danger)]/20 rounded-xl text-[11px] font-semibold text-[var(--danger)] hover:bg-[var(--danger)] hover:text-white">Danger</button>
 <button className="w-12 h-12 bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-xl flex items-center justify-center hover:text-[var(--accent)]"><Search size={18} /></button>
 </div>
 {/* Icon Buttons Row */}
 <div className="flex flex-wrap gap-4">
 {['sm', 'md', 'lg'].map(size => (
 <button key={size} className={`bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-xl flex items-center justify-center hover:text-[var(--accent)] ${size === 'sm' ? 'w-8 h-8' : size === 'md' ? 'w-10 h-10' : 'w-14 h-14'}`}>
 <Zap size={size === 'sm' ? 12 : size === 'md' ? 16 : 20} />
 </button>
 ))}
 </div>
 </div>

 {/* Badges - LIVE */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8">
 <h2 className="text-lg font-medium text-[var(--success)] mb-6">Status Badges</h2>
 <div className="flex flex-wrap gap-4 mb-8">
 <span className="px-4 py-2 rounded-full text-[11px] font-semibold border bg-[var(--success)]/10 text-[var(--success)] border-emerald-500/20">Active</span>
 <span className="px-4 py-2 rounded-full text-[11px] font-semibold border bg-[var(--warning)]/10 text-[var(--warning)] border-amber-500/20">Pending</span>
 <span className="px-4 py-2 rounded-full text-[11px] font-semibold border bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/20">Rejected</span>
 <span className="px-4 py-2 rounded-full text-[11px] font-semibold border bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20">Info</span>
 </div>
 {/* Pill Badges */}
 <div className="flex flex-wrap gap-4">
 <span className="px-3 py-1 bg-[var(--accent)] text-white text-[11px] font-semibold rounded-full">5</span>
 <span className="px-3 py-1 bg-[var(--accent)] text-white text-[11px] font-semibold rounded-full">99+</span>
 <span className="px-2 py-0.5 bg-[var(--danger)] text-white text-[11px] font-semibold rounded-full">!</span>
 </div>
 </div>

 {/* Inputs - LIVE */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8">
 <h2 className="text-lg font-medium text-[var(--accent)] mb-6">Form Inputs</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
 <input type="text" placeholder="Text input..." className="bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl px-6 py-4 text-sm font-normal focus:outline-none focus:border-[var(--accent)]" />
 <input type="email" placeholder="Email input..." className="bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl px-6 py-4 text-sm font-normal focus:outline-none focus:border-[var(--accent)]" />
 <select className="bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl px-6 py-4 text-sm font-normal"><option>Select option...</option></select>
 <div className="flex items-center gap-4">
 <button onClick={() => setToggleOn(!toggleOn)} className={`w-14 h-7 rounded-full transition-colors ${toggleOn ? 'bg-[var(--accent)]' : 'bg-[var(--bg-accent)]'}`}>
 <div className={`w-6 h-6 bg-white rounded-full shadow transform transition-transform ${toggleOn ? 'translate-x-7' : 'translate-x-0.5'}`} />
 </button>
 <span className="text-sm font-bold">Toggle {toggleOn ? 'ON' : 'OFF'}</span>
 </div>
 </div>
 {/* Range Slider */}
 <div className="space-y-2">
 <input type="range" min="0" max="10" defaultValue="5" className="w-full h-2 bg-[var(--bg-accent)] rounded-lg appearance-none cursor-pointer accent-indigo-500" />
 <div className="flex justify-between text-xs text-[var(--text-muted)]"><span>0</span><span>5</span><span>10</span></div>
 </div>
 </div>

 {/* Tabs - LIVE */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8">
 <h2 className="text-lg font-medium text-[var(--accent)] mb-6">Tabs</h2>
 <div className="flex gap-2 mb-6 border-b border-[var(--border-primary)] pb-4">
 {['tab1', 'tab2', 'tab3'].map(tab => (
 <button key={tab} onClick={() => setActiveTab(tab)}
 className={`px-6 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === tab ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-accent)] text-[var(--text-muted)]'}`}>
 {tab.toUpperCase()}
 </button>
 ))}
 </div>
 <p className="text-sm">Active tab: <span className="font-semibold text-[var(--accent)]">{activeTab}</span></p>
 </div>

 {/* Loading - LIVE */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8">
 <h2 className="text-lg font-medium text-[var(--danger)] mb-6">Loading States</h2>
 <div className="grid grid-cols-2 md:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
 <div className="text-center">
 <div className="w-12 h-12 border-4 border-[var(--accent)]/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-2"></div>
 <p className="text-[11px] font-semibold">Spinner</p>
 </div>
 <div className="text-center">
 <div className="h-12 bg-[var(--bg-accent)] rounded-xl animate-pulse"></div>
 <p className="text-[11px] font-semibold mt-2">Skeleton</p>
 </div>
 <div className="text-center">
 <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin mx-auto" />
 <p className="text-[11px] font-semibold mt-2">Loader2</p>
 </div>
 <div className="text-center">
 <div className="flex justify-center gap-1">
 {[0, 1, 2].map(i => (
 <div key={i} className="w-2 h-2 bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}></div>
 ))}
 </div>
 <p className="text-[11px] font-semibold mt-2">Dots</p>
 </div>
 </div>
 </div>

 {/* Avatar & Progress - LIVE */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8">
 <h2 className="text-lg font-medium text-[var(--accent)] mb-6">UI Elements</h2>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
 {/* Avatar */}
 <div className="space-y-2">
 <div className="flex items-center gap-3">
 <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]"><User size={24} /></div>
 <div className="w-12 h-12 rounded-full bg-[var(--success)]/10 flex items-center justify-center text-[var(--success)]"><User size={24} /></div>
 <div className="w-10 h-10 rounded-xl bg-[var(--warning)]/10 flex items-center justify-center text-[var(--warning)]"><User size={20} /></div>
 </div>
 <p className="text-[11px] font-semibold">Avatars</p>
 </div>
 {/* Progress */}
 <div className="space-y-3">
 {['25%', '50%', '75%', '100%'].map(p => (
 <div key={p} className="space-y-1">
 <div className="h-2 bg-[var(--bg-accent)] rounded-full overflow-hidden">
 <div className="h-full bg-[var(--accent)] rounded-full transition-all" style={{ width: p }}></div>
 </div>
 </div>
 ))}
 <p className="text-[11px] font-semibold">Progress Bars</p>
 </div>
 {/* Notifications */}
 <div className="space-y-4">
 <div className="flex items-center gap-3">
 <div className="relative">
 <Bell size={24} />
 <span className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--accent)] rounded-full border-2 border-[var(--bg-primary)]"></span>
 </div>
 <Bell size={20} className="text-[var(--text-muted)]" />
 <Bell size={16} className="text-[var(--text-muted)]" />
 </div>
 <p className="text-[11px] font-semibold">Notifications</p>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* DASHBOARD - VISUAL PREVIEW */}
 {activeSection === 'dashboard' && (
 <div className="space-y-5 sm:space-y-8">
 <div className="glass-card rounded-[var(--radius-xl)] p-8">
 <h2 className="text-lg font-medium text-[var(--accent)] mb-6 flex items-center gap-3"><Layout size={20} /> Dashboard Layout Preview</h2>

 {/* Live Dashboard Preview */}
 <div className="flex h-96 rounded-2xl overflow-hidden border border-[var(--border-primary)]">
 {/* Sidebar */}
 <div className="w-48 bg-[var(--sidebar-bg)] border-r border-[var(--border-primary)] p-4 flex flex-col">
 <div className="flex items-center gap-2 mb-6">
 <div className="w-6 h-6 bg-[var(--accent)] rounded-lg"></div>
 <span className="text-xs font-semibold">NexHire</span>
 </div>
 <div className="space-y-1 flex-1">
 {['Dashboard', 'Jobs', 'Candidates', 'Analytics', 'Settings'].map((item, i) => (
 <div key={item} className={`flex items-center gap-2 p-2 rounded-lg text-xs ${i === 0 ? 'bg-[var(--accent)]/10 text-[var(--accent)] font-bold' : 'text-[var(--text-muted)]'}`}>
 <div className="w-4 h-4 rounded bg-current/20"></div>
 {item}
 </div>
 ))}
 </div>
 <div className="p-2 rounded-xl bg-[var(--bg-accent)] flex items-center gap-2">
 <div className="w-6 h-6 rounded-lg bg-[var(--accent)]/20"></div>
 <div className="flex-1"><div className="h-2 w-12 bg-[var(--text-muted)]/30 rounded"></div></div>
 </div>
 </div>
 {/* Main */}
 <div className="flex-1 flex flex-col">
 {/* Header */}
 <div className="h-14 border-b border-[var(--border-primary)] flex items-center justify-between px-4 bg-[var(--header-bg)]">
 <div className="text-sm font-semibold">Dashboard</div>
 <div className="flex items-center gap-2">
 <div className="w-8 h-8 rounded-xl bg-[var(--bg-accent)]"></div>
 <div className="w-8 h-8 rounded-xl bg-[var(--bg-accent)] relative">
 <span className="absolute -top-1 -right-1 w-2 h-2 bg-[var(--accent)] rounded-full"></span>
 </div>
 </div>
 </div>
 {/* Content */}
 <div className="flex-1 p-4 bg-[var(--bg-primary)] overflow-hidden">
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
 {[1, 2, 3, 4].map(i => (
 <div key={i} className="h-20 bg-[var(--bg-accent)] rounded-2xl p-3">
 <div className="h-2 w-8 bg-[var(--text-muted)]/20 rounded mb-2"></div>
 <div className="h-6 w-12 bg-[var(--text-muted)]/30 rounded"></div>
 </div>
 ))}
 </div>
 <div className="h-32 bg-[var(--bg-accent)] rounded-2xl p-3">
 <div className="h-2 w-20 bg-[var(--text-muted)]/20 rounded mb-2"></div>
 <div className="flex items-end gap-1 h-20">
 {[40, 60, 45, 80, 55, 70, 90].map((h, i) => (
 <div key={i} className="flex-1 bg-[var(--accent)]/30 rounded-t" style={{ height: `${h}%` }}></div>
 ))}
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Sidebar Nav Items */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8">
 <h2 className="text-lg font-medium text-[var(--accent)] mb-6">Navigation Items</h2>
 <div className="space-y-3">
 {[
 { label: 'Active', icon: Home, active: true },
 { label: 'Hover', icon: Users, active: false },
 { label: 'Default', icon: FileText, active: false },
 ].map((item, i) => (
 <div key={i} className={`flex items-center justify-between p-4 rounded-2xl border ${item.active ? 'bg-[var(--accent)]/10 border-[var(--accent)]/20' : 'bg-[var(--bg-accent)] border-[var(--border-primary)]'}`}>
 <div className="flex items-center gap-3">
 <item.icon size={20} className={item.active ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'} />
 <span className={`text-sm font-bold ${item.active ? 'text-[var(--accent)]' : ''}`}>{item.label}</span>
 </div>
 {item.active && <ChevronRight size={16} className="text-[var(--accent)]" />}
 </div>
 ))}
 </div>
 </div>
 </div>
 )}

 {/* CHARTS - VISUAL */}
 {activeSection === 'charts' && (
 <div className="space-y-5 sm:space-y-8">
 <div className="glass-card rounded-[var(--radius-xl)] p-8">
 <h2 className="text-lg font-medium text-[var(--success)] mb-6 flex items-center gap-3"><BarChart3 size={20} /> Chart Container</h2>
 {/* Mock Chart */}
 <div className="h-64 bg-[var(--bg-accent)] rounded-2xl p-6 border border-[var(--border-primary)]">
 <div className="flex items-end justify-between h-full gap-4">
 {[
 { label: 'Jan', value: 65 },
 { label: 'Feb', value: 45 },
 { label: 'Mar', value: 80 },
 { label: 'Apr', value: 55 },
 { label: 'May', value: 90 },
 { label: 'Jun', value: 70 },
 ].map((item, i) => (
 <div key={i} className="flex-1 flex flex-col items-center">
 <div className="w-full bg-[var(--accent)]/60 rounded-t-lg transition-all hover:bg-[var(--accent-hover)]" style={{ height: `${item.value}%` }}></div>
 <span className="text-[11px] font-semibold mt-2 text-[var(--text-muted)]">{item.label}</span>
 </div>
 ))}
 </div>
 </div>
 </div>

 {/* Pie Chart Visual */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8">
 <h2 className="text-lg font-medium text-[var(--accent)] mb-6">Chart Colors</h2>
 <div className="flex flex-wrap gap-6">
 {/* Donut */}
 <div className="relative w-40 h-40">
 <svg viewBox="0 0 100 100" className="rotate-90">
 <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="20" strokeDasharray="75 251" />
 <circle cx="50" cy="50" r="40" fill="none" stroke="#6366f1" strokeWidth="20" strokeDasharray="50 251" strokeDashoffset="-75" />
 <circle cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" strokeWidth="20" strokeDasharray="63 251" strokeDashoffset="-125" />
 <circle cx="50" cy="50" r="40" fill="none" stroke="#ec4899" strokeWidth="20" strokeDasharray="63 251" strokeDashoffset="-188" />
 </svg>
 </div>
 {/* Color Swatches */}
 <div className="flex-1 grid grid-cols-3 gap-4">
 {[
 { name: 'Success', color: '#10b981' },
 { name: 'Primary', color: '#6366f1' },
 { name: 'Warning', color: '#f59e0b' },
 { name: 'Error', color: '#ec4899' },
 { name: 'Special', color: '#8b5cf6' },
 { name: 'Info', color: '#06b6d4' },
 ].map((c, i) => (
 <div key={i} className="flex items-center gap-2">
 <div className="w-6 h-6 rounded-lg shadow" style={{ backgroundColor: c.color }}></div>
 <span className="text-xs font-bold">{c.name}</span>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 )}

 {/* MODALS - LIVE PREVIEW */}
 {activeSection === 'modals' && (
 <div className="space-y-5 sm:space-y-8">
 <div className="glass-card rounded-[var(--radius-xl)] p-8">
 <h2 className="text-lg font-medium text-[var(--accent)] mb-6 flex items-center gap-3"><MessageSquare size={20} /> Modal Preview</h2>

 <div className="flex gap-4 mb-6">
 <button onClick={() => setModalOpen(true)} className="px-6 py-3 bg-[var(--accent)] text-white rounded-2xl font-semibold text-xs">Open Modal</button>
 </div>

 {/* Modal Overlay */}
 {modalOpen && (
 <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
 <div className="bg-[var(--bg-secondary)] rounded-[var(--radius-xl)] w-full max-w-md border border-[var(--border-primary)] animate-in zoom-in-95 duration-300">
 <div className="p-6 border-b border-[var(--border-primary)] flex items-center justify-between">
 <h3 className="text-lg font-semibold">Modal Title</h3>
 <button onClick={() => setModalOpen(false)} className="p-2 rounded-xl bg-[var(--bg-accent)] hover:bg-[var(--danger)]/10 hover:text-[var(--danger)]">
 <X size={18} />
 </button>
 </div>
 <div className="p-6">
 <p className="text-sm mb-4">This is a modal example with glass card styling.</p>
 <div className="h-24 bg-[var(--bg-accent)] rounded-xl mb-4"></div>
 </div>
 <div className="p-6 border-t border-[var(--border-primary)] flex justify-end gap-3">
 <button onClick={() => setModalOpen(false)} className="px-4 py-2 bg-[var(--bg-accent)] rounded-xl text-xs font-semibold">Cancel</button>
 <button onClick={() => setModalOpen(false)} className="px-4 py-2 bg-[var(--accent)] text-white rounded-xl text-xs font-semibold">Confirm</button>
 </div>
 </div>
 </div>
 )}
 </div>

 {/* Breadcrumbs & Pagination */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8">
 <h2 className="text-lg font-medium text-[var(--accent)] mb-6">Breadcrumbs & Pagination</h2>

 {/* Breadcrumbs */}
 <div className="flex items-center gap-2 text-sm mb-8">
 <a href="#" className="text-[var(--text-muted)] hover:text-[var(--accent)]">Home</a>
 <ChevronRight size={14} className="text-[var(--text-muted)]" />
 <a href="#" className="text-[var(--text-muted)] hover:text-[var(--accent)]">Jobs</a>
 <ChevronRight size={14} className="text-[var(--text-muted)]" />
 <span className="text-[var(--accent)] font-bold">Details</span>
 </div>

 {/* Pagination */}
 <div className="flex items-center justify-between">
 <button className="px-4 py-2 bg-[var(--bg-accent)] rounded-xl text-xs font-bold flex items-center gap-1">
 <ChevronLeft size={14} /> Prev
 </button>
 <div className="flex gap-2">
 {[1, 2, 3, 4, 5].map(p => (
 <button key={p} className={`w-10 h-10 rounded-xl text-xs font-bold ${p === 1 ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-accent)]'}`}>{p}</button>
 ))}
 </div>
 <button className="px-4 py-2 bg-[var(--bg-accent)] rounded-xl text-xs font-bold flex items-center gap-1">
 Next <ChevronRight size={14} />
 </button>
 </div>
 </div>
 </div>
 )}

 </div>

 {/* Footer */}
 <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-[var(--border-primary)]">
 <div className="text-center">
 <p className="text-xs text-[var(--text-muted)]">NexHire Design System • {sections.length} Sections • Live Components</p>
 </div>
 </div>
 </div>
 );
};

export default DesignSystemPage;
