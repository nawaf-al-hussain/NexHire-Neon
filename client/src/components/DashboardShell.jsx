import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ThemeAnimationType, useModeAnimation } from 'react-theme-switch-animation';
import {
 LayoutDashboard, Database, LogOut, User,
 Sparkles, Bell, Sun, Moon, Menu, X
} from 'lucide-react';
import ChatbotWidget from './shared/ChatbotWidget';
import nexhireLogo from '../assets/nexhire_logo.svg';

const DashboardShell = ({ children, title, subtitle, navigation = [], onNotificationClick, onProfileClick, notificationCount = 0 }) => {
 const { user, logout } = useAuth();
 const { theme, toggleTheme } = useTheme();
 const navigate = useNavigate();
 const [sidebarOpen, setSidebarOpen] = React.useState(false);

 // Initialize theme switch animation — DO NOT TOUCH (tied to vite dedupe)
 const { ref: themeButtonRef, toggleSwitchTheme, isDarkMode } = useModeAnimation({
 animationType: ThemeAnimationType.CIRCLE,
 duration: 750,
 isDarkMode: theme === 'dark',
 onDarkModeChange: (isDark) => {
 if ((isDark && theme !== 'dark') || (!isDark && theme !== 'light')) {
 toggleTheme();
 }
 }
 });

 const handleLogout = () => {
 logout();
 navigate('/login');
 };

 const handleNavClick = (item) => {
 if (item.onClick) item.onClick();
 if (item.path) navigate(item.path);
 if (window.innerWidth < 1024) {
 setSidebarOpen(false);
 }
 };

 return (
 <div
 className="flex h-[100dvh] overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans no-pull-refresh"
 style={{ transition: 'background-color var(--dur-base) var(--ease-out-soft), color var(--dur-base) var(--ease-out-soft)' }}
 >
 {/* Mobile Overlay */}
 {sidebarOpen && (
 <div
 className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
 onClick={() => setSidebarOpen(false)}
 />
 )}

 {/* Sidebar — responsive width: full-width drawer on mobile (max 320px), 288px on desktop */}
 <aside
 className={`fixed lg:static inset-y-0 left-0 z-50 w-[85vw] max-w-[320px] lg:w-72 h-[100dvh] bg-[var(--sidebar-bg)] border-r border-[var(--border-primary)] p-5 lg:p-6 flex flex-col transform overflow-hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
 style={{ transition: 'transform var(--dur-slow) var(--ease-spring)' }}
 >
 {/* Logo block — smaller, no glow */}
 <div className="flex items-center justify-between mb-10 px-1">
 <div className="flex items-center gap-3">
 <div
 className="w-9 h-9 overflow-hidden bg-[var(--accent)]"
 style={{ borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}
 >
 <img
 src={nexhireLogo}
 alt="NexHire Logo"
 className="w-full h-full object-contain"
 />
 </div>
 <span
 className="font-semibold text-lg tracking-tight"
 style={{ fontFamily: 'var(--font-display)' }}
 >
 NexHire
 </span>
 </div>
 <button
 onClick={() => setSidebarOpen(false)}
 className="lg:hidden w-9 h-9 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus-ring"
 style={{ borderRadius: 'var(--radius-md)' }}
 aria-label="Close sidebar"
 >
 <X size={16} />
 </button>
 </div>

 {/* Navigation */}
 <nav className="space-y-1 flex-1 overflow-y-auto custom-scrollbar">
 <div className="eyebrow mb-3 px-3">Main Menu</div>
 {navigation.map((item, i) => (
 <button
 key={i}
 onClick={() => handleNavClick(item)}
 className={`relative flex items-center justify-between w-full px-3 py-2.5 group focus-ring ${item.active ? '' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'}`}
 style={{
 borderRadius: 'var(--radius-lg)',
 transition: 'background-color var(--dur-base) var(--ease-out-soft), color var(--dur-base) var(--ease-out-soft)',
 ...(item.active ? {
 backgroundColor: 'var(--accent-soft)',
 color: 'var(--accent)',
 fontWeight: 500,
 } : {}),
 }}
 >
 {/* 3px left accent bar for active state */}
 {item.active && (
 <span
 aria-hidden="true"
 style={{
 position: 'absolute',
 left: 0,
 top: '50%',
 transform: 'translateY(-50%)',
 width: 3,
 height: 18,
 backgroundColor: 'var(--accent)',
 borderRadius: 2,
 }}
 />
 )}
 <div className="flex items-center gap-3">
 <item.icon
 size={18}
 strokeWidth={1.75}
 className={item.active ? 'text-[var(--accent)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-primary)]'}
 style={{ transition: 'color var(--dur-base) var(--ease-out-soft)' }}
 />
 <span className="text-sm">{item.label}</span>
 </div>
 {item.badge && (
 <span
 style={{
 backgroundColor: 'var(--accent)',
 color: '#ffffff',
 fontSize: 10,
 fontWeight: 600,
 padding: '2px 6px',
 borderRadius: 'var(--radius-sm)',
 minWidth: 20,
 textAlign: 'center',
 lineHeight: 1.4,
 }}
 >
 {item.badge > 99 ? '99+' : item.badge}
 </span>
 )}
 </button>
 ))}
 </nav>

 {/* User profile footer */}
 <div className="mt-auto pt-4">
 <div
 onClick={onProfileClick}
 className="w-full p-3 border border-[var(--border-primary)] bg-[var(--bg-tertiary)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)] cursor-pointer text-left flex items-center gap-3 focus-ring"
 style={{
 borderRadius: 'var(--radius-lg)',
 transition: 'border-color var(--dur-base) var(--ease-out-soft), background-color var(--dur-base) var(--ease-out-soft)',
 }}
 role="button"
 tabIndex={0}
 
 >
 <div
 className="w-9 h-9 bg-[var(--bg-elevated)] border border-[var(--border-primary)] flex items-center justify-center shrink-0"
 style={{ borderRadius: 'var(--radius-md)' }}
 >
 <User size={16} className="text-[var(--accent)]" strokeWidth={1.75} />
 </div>
 <div className="flex-1 min-w-0">
 <div className="text-xs font-medium truncate max-w-[120px]">{user?.Username}</div>
 <div className="text-[11px] text-[var(--text-muted)]" style={{ letterSpacing: '0.04em' }}>
 {user?.RoleID === 1 ? 'Administrator' : user?.RoleID === 2 ? 'Recruiter' : 'Candidate'}
 </div>
 </div>
 <button
 onClick={(e) => { e.stopPropagation(); handleLogout(); }}
 className="p-2 hover:bg-[var(--danger)]/10 text-[var(--danger)] focus-ring"
 style={{ borderRadius: 'var(--radius-md)', transition: 'background-color var(--dur-base) var(--ease-out-soft), color var(--dur-base) var(--ease-out-soft)' }}
 title="Logout"
 aria-label="Logout"
 >
 <LogOut size={16} strokeWidth={1.75} />
 </button>
 </div>
 </div>
 </aside>

 {/* Main Content Area */}
 <main className="flex-1 flex flex-col relative min-w-0" id="main-content" tabIndex={-1}>
 {/* Header — 64px tall (was 96px), tighter. Responsive padding. */}
 <header
 className="h-16 border-b border-[var(--border-primary)] flex items-center justify-between px-4 sm:px-6 lg:px-10 bg-[var(--header-bg)] backdrop-blur-sm sticky top-0 z-40"
 style={{ transition: 'background-color var(--dur-base) var(--ease-out-soft)' }}
 >
 <div className="flex items-center gap-3">
 <button
 onClick={() => setSidebarOpen(true)}
 className="lg:hidden w-9 h-9 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus-ring"
 style={{ borderRadius: 'var(--radius-md)' }}
 aria-label="Open sidebar"
 >
 <Menu size={16} />
 </button>
 <div>
 {subtitle && (
 <div className="eyebrow mb-0.5">{subtitle}</div>
 )}
 <h1
 className="text-lg lg:text-xl font-semibold tracking-tight truncate max-w-[200px] lg:max-w-none"
 style={{ fontFamily: 'var(--font-display)' }}
 >
 {title}
 </h1>
 </div>
 </div>

 <div className="flex items-center gap-2">
 <button
 ref={themeButtonRef}
 onClick={toggleSwitchTheme}
 className="w-9 h-9 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus-ring"
 style={{
 borderRadius: 'var(--radius-md)',
 transition: 'background-color var(--dur-base) var(--ease-out-soft), color var(--dur-base) var(--ease-out-soft)'
 }}
 aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
 >
 {theme === 'dark' ? <Sun size={16} strokeWidth={1.75} /> : <Moon size={16} strokeWidth={1.75} />}
 </button>

 <button
 onClick={onNotificationClick}
 className="relative w-9 h-9 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus-ring"
 style={{
 borderRadius: 'var(--radius-md)',
 transition: 'background-color var(--dur-base) var(--ease-out-soft), color var(--dur-base) var(--ease-out-soft)'
 }}
 aria-label="Notifications"
 >
 <Bell size={16} strokeWidth={1.75} />
 {notificationCount > 0 && <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[var(--accent)] rounded-full" aria-hidden="true" />}
 </button>
 </div>
 </header>

 {/* Content Container — responsive padding (smaller on mobile) */}
 <div
 className="flex-1 overflow-y-auto custom-scrollbar bg-[var(--bg-secondary)] p-4 sm:p-6 lg:p-10"
 style={{ transition: 'background-color var(--dur-base) var(--ease-out-soft)' }}
 >
 {children}
 </div>
 </main>

 {/* Chatbot Widget */}
 <ChatbotWidget />
 </div>
 );
};

export default DashboardShell;
