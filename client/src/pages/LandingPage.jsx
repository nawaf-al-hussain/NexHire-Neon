import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Briefcase, ShieldCheck, Users, Zap, Globe, Cpu, Palette } from 'lucide-react';
import NexHireLogo from '../assets/nexhire_logo.svg';
import ScrollReveal from '../components/ui/ScrollReveal';

const LandingPage = () => {
 return (
 <div className="min-h-[100dvh] relative" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
 {/* Background — subtle neutral grid (Linear-style), no AI gradient orbs */}
 <div
 aria-hidden="true"
 className="fixed inset-0 -z-10"
 style={{
 backgroundColor: 'var(--bg-primary)',
 backgroundImage:
 'linear-gradient(var(--border-primary) 1px, transparent 1px), linear-gradient(90deg, var(--border-primary) 1px, transparent 1px)',
 backgroundSize: '56px 56px',
 maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 80%)',
 WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 80%)',
 }}
 />

 {/* Navigation */}
 <nav
 className="sticky top-0 z-40 mx-auto max-w-6xl mt-3 sm:mt-4 px-3 sm:px-4"
 >
 <div
 className="flex items-center justify-between px-5 py-3 border border-[var(--border-primary)]"
 style={{
 backgroundColor: 'var(--glass-bg)',
 backdropFilter: 'blur(12px)',
 WebkitBackdropFilter: 'blur(12px)',
 borderRadius: 'var(--radius-xl)',
 boxShadow: 'var(--shadow-sm)',
 }}
 >
 <div className="flex items-center gap-2.5">
 <div
 className="w-8 h-8 overflow-hidden bg-[var(--accent)]"
 style={{ borderRadius: 'var(--radius-md)' }}
 >
 <img src={NexHireLogo} alt="NexHire Logo" className="w-full h-full object-contain" />
 </div>
 <span
 className="text-base font-semibold tracking-tight"
 style={{ fontFamily: 'var(--font-display)' }}
 >
 NexHire
 </span>
 </div>

 <div className="hidden md:flex items-center gap-7 text-sm text-[var(--text-secondary)]">
 <a href="#features" className="hover:text-[var(--text-primary)] focus-ring" style={{ transition: 'color var(--dur-base) var(--ease-out-soft)', borderRadius: 'var(--radius-sm)', padding: '4px 6px' }}>Features</a>
 <a href="#features" className="hover:text-[var(--text-primary)] focus-ring" style={{ transition: 'color var(--dur-base) var(--ease-out-soft)', borderRadius: 'var(--radius-sm)', padding: '4px 6px' }}>Views</a>
 <a href="#features" className="hover:text-[var(--text-primary)] focus-ring" style={{ transition: 'color var(--dur-base) var(--ease-out-soft)', borderRadius: 'var(--radius-sm)', padding: '4px 6px' }}>Procs</a>
 <Link to="/design-system" className="flex items-center gap-1.5 hover:text-[var(--text-primary)] focus-ring" style={{ transition: 'color var(--dur-base) var(--ease-out-soft)', borderRadius: 'var(--radius-sm)', padding: '4px 6px' }}>
 <Palette size={14} strokeWidth={1.75} /> Design System
 </Link>
 </div>

 <Link
 to="/login"
 className="btn-primary"
 style={{ textDecoration: 'none' }}
 >
 Get Started <ArrowRight size={14} strokeWidth={2} />
 </Link>
 </div>
 </nav>

 {/* Hero */}
 <main id="main-content" className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-16 sm:pb-24">
 <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-10 sm:gap-12 lg:gap-16 items-center">
 <div>
 <div
 className="inline-flex items-center gap-2 px-3 py-1 mb-6"
 style={{
 backgroundColor: 'var(--accent-soft)',
 color: 'var(--accent)',
 borderRadius: 'var(--radius-sm)',
 fontSize: '11px',
 fontWeight: 500,
 letterSpacing: '0.08em',
 textTransform: 'uppercase',
 }}
 >
 <Zap size={11} strokeWidth={2.5} className="fill-current" />
 Modern DBMS Architecture
 </div>

 <h1
 className="mb-6"
 style={{
 fontFamily: 'var(--font-display)',
 fontSize: 'clamp(2.5rem, 6vw, 4rem)',
 fontWeight: 700,
 lineHeight: 1.05,
 letterSpacing: '-0.03em',
 color: 'var(--text-primary)',
 }}
 >
 Hiring,<br />
 start to finish.
 </h1>

 <p
 className="mb-8 max-w-md"
 style={{
 fontSize: '1.05rem',
 color: 'var(--text-secondary)',
 lineHeight: 1.6,
 }}
 >
 A professional-grade recruitment platform built on PostgreSQL.
 Real-time matching, automated workflows, and deep analytics —
 without the bloat.
 </p>

 <div className="flex flex-wrap gap-3 items-center">
 <Link
 to="/login"
 className="btn-primary"
 style={{ textDecoration: 'none', padding: '0.75rem 1.25rem', fontSize: '15px' }}
 >
 Access demo system <ArrowRight size={15} strokeWidth={2} />
 </Link>

 <div
 className="flex items-center gap-3 px-4 py-2.5"
 style={{
 backgroundColor: 'var(--bg-tertiary)',
 border: '1px solid var(--border-primary)',
 borderRadius: 'var(--radius-md)',
 }}
 >
 <div className="flex -space-x-2">
 {[1, 2, 3].map(i => (
 <div
 key={i}
 className="w-6 h-6 border-2"
 style={{
 backgroundColor: 'var(--bg-elevated)',
 borderColor: 'var(--bg-tertiary)',
 borderRadius: '999px',
 }}
 />
 ))}
 </div>
 <span className="text-xs text-[var(--text-secondary)]"></span>
 </div>
 </div>
 </div>

 {/* Right-side preview card — minimal, not flashy */}
 <div className="relative">
 <div
 className="p-5"
 style={{
 backgroundColor: 'var(--bg-elevated)',
 border: '1px solid var(--border-primary)',
 borderRadius: 'var(--radius-xl)',
 boxShadow: 'var(--shadow-lg)',
 }}
 >
 <div
 className="flex items-center justify-between mb-5 pb-4"
 style={{ borderBottom: '1px solid var(--border-primary)' }}
 >
 <div className="eyebrow">Pipeline overview</div>
 <div
 className="flex gap-1.5"
 aria-hidden="true"
 >
 <div style={{ width: 8, height: 8, borderRadius: '999px', backgroundColor: 'var(--text-muted)', opacity: 0.4 }} />
 <div style={{ width: 8, height: 8, borderRadius: '999px', backgroundColor: 'var(--text-muted)', opacity: 0.4 }} />
 <div style={{ width: 8, height: 8, borderRadius: '999px', backgroundColor: 'var(--accent)' }} />
 </div>
 </div>
 <div className="space-y-2.5">
 {[
 { name: 'Araan Rahman', role: 'Senior Backend Eng.', score: 92, status: 'Interview' },
 { name: 'Priya Sharma', role: 'Frontend Eng.', score: 87, status: 'Screening' },
 { name: 'Marcus Chen', role: 'DevOps', score: 81, status: 'Applied' },
 { name: 'Leila Hossain', role: 'Data Analyst', score: 76, status: 'Applied' },
 ].map((c, i) => (
 <div
 key={i}
 className="flex items-center gap-3 p-3"
 style={{
 backgroundColor: 'var(--bg-tertiary)',
 borderRadius: 'var(--radius-md)',
 }}
 >
 <div
 className="w-9 h-9 flex items-center justify-center text-xs font-semibold shrink-0"
 style={{
 backgroundColor: 'var(--accent-soft)',
 color: 'var(--accent)',
 borderRadius: 'var(--radius-md)',
 }}
 >
 {(c.name || "").split(' ').map(n => n[0]).join('')}
 </div>
 <div className="flex-1 min-w-0">
 <div className="text-xs font-medium truncate">{c.name}</div>
 <div className="text-[11px] text-[var(--text-muted)] truncate">{c.role}</div>
 </div>
 <div className="text-right shrink-0">
 <div
 className="text-sm font-semibold tabular-nums"
 style={{ color: 'var(--accent)' }}
 >
 {c.score}
 </div>
 <div className="text-[11px] text-[var(--text-muted)]">{c.status}</div>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>

 {/* Feature Grid — 3 cards with spotlight border + staggered reveal */}
 <div id="features" className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 mt-16 sm:mt-28 scroll-mt-24">
 {[
 {
 icon: ShieldCheck,
 title: "Enterprise security",
 desc: "Transactional integrity enforced by database triggers and constraints. Row-level audit logging on every mutation."
 },
 {
 icon: Globe,
 title: "Global search",
 desc: "Fuzzy name matching via Levenshtein + Jaro-Winkler. Full-text search across candidate skills, locations, and roles."
 },
 {
 icon: Cpu,
 title: "Stored procedure logic",
 desc: "25+ PostgreSQL functions handle complex matching, screening, and predictive scoring at the data layer."
 }
 ].map((feature, i) => (
 <ScrollReveal key={i} delay={i * 80}>
 <div className="h-full">
 <div
 className="h-full p-6"
 style={{
 backgroundColor: 'var(--bg-elevated)',
 border: '1px solid var(--border-primary)',
 borderRadius: 'var(--radius-xl)',
 transition: 'border-color var(--dur-base) var(--ease-out-soft)',
 }}
 >
 <div
 className="w-10 h-10 flex items-center justify-center mb-5"
 style={{
 backgroundColor: 'var(--accent-soft)',
 color: 'var(--accent)',
 borderRadius: 'var(--radius-md)',
 }}
 >
 <feature.icon size={18} strokeWidth={1.75} />
 </div>
 <h3
 className="mb-2"
 style={{
 fontSize: '1.05rem',
 fontWeight: 600,
 color: 'var(--text-primary)',
 letterSpacing: '-0.01em',
 }}
 >
 {feature.title}
 </h3>
 <p
 style={{
 fontSize: '0.875rem',
 color: 'var(--text-secondary)',
 lineHeight: 1.55,
 }}
 >
 {feature.desc}
 </p>
 </div>
 </div>
 </ScrollReveal>
 ))}
 </div>
 </main>

 {/* Footer */}
 <footer
 className="border-t py-6 sm:py-8 px-4 sm:px-6"
 style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-secondary)' }}
 >
 <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
 <div className="flex items-center gap-2.5">
 <div
 className="w-7 h-7 overflow-hidden bg-[var(--accent)]"
 style={{ borderRadius: 'var(--radius-sm)' }}
 >
 <img src={NexHireLogo} alt="NexHire Logo" className="w-full h-full object-contain" />
 </div>
 <span className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
 NexHire
 </span>
 </div>
 <div className="eyebrow">
 Built for DBMS Advanced Concepts · 2026
 </div>
 </div>
 </footer>
 </div>
 );
};

export default LandingPage;
