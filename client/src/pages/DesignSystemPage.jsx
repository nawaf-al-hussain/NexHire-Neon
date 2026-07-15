import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowLeft, Palette, Type, Box, Grid, Sun, Moon, Copy, Check, Search,
    Layout, BarChart3, MessageSquare, ChevronRight, ChevronDown,
    Bell, User, Zap, X, Loader2, AlertTriangle, CheckCircle, Info,
    Layers, Component, Sparkles, MousePointer, Keyboard, Smartphone,
    Code2, Eye, RotateCw
} from 'lucide-react';
import { useToast } from '../components/ui/Toast';
import ConfirmDialog from '../components/ui/ConfirmDialog';

/* ============================================================
   TOKEN DATA — pulled from index.css @theme block
   ============================================================ */
const colorTokens = [
    { name: '--bg-primary', light: '#ffffff', dark: '#0c0d10', desc: 'Page background' },
    { name: '--bg-secondary', light: '#fafafa', dark: '#0f0f10', desc: 'Subtle background' },
    { name: '--bg-tertiary', light: '#f4f4f5', dark: '#1a1a1d', desc: 'Tinted surface' },
    { name: '--bg-elevated', light: '#ffffff', dark: '#161618', desc: 'Raised card surface' },
    { name: '--surface-hover', light: '#f4f4f5', dark: '#1f1f23', desc: 'Hover state' },
    { name: '--text-primary', light: '#0a0a0a', dark: '#fafafa', desc: 'Primary text' },
    { name: '--text-secondary', light: '#525252', dark: '#a3a3a3', desc: 'Secondary text' },
    { name: '--text-muted', light: '#a3a3a3', dark: '#737373', desc: 'Muted text' },
    { name: '--border-primary', light: 'rgba(15,23,42,0.06)', dark: 'rgba(255,255,255,0.06)', desc: 'Default border' },
    { name: '--border-strong', light: 'rgba(15,23,42,0.10)', dark: 'rgba(255,255,255,0.10)', desc: 'Emphasized border' },
    { name: '--accent', light: '#4f46e5', dark: '#6366f1', desc: 'Indigo accent' },
    { name: '--accent-hover', light: '#4338ca', dark: '#818cf8', desc: 'Accent hover' },
    { name: '--accent-soft', light: '#eef2ff', dark: 'rgba(99,102,241,0.10)', desc: 'Soft accent background' },
    { name: '--accent-ring', light: 'rgba(79,70,229,0.45)', dark: 'rgba(99,102,241,0.50)', desc: 'Focus ring' },
    { name: '--success', light: '#059669', dark: '#10b981', desc: 'Success state' },
    { name: '--warning', light: '#d97706', dark: '#f59e0b', desc: 'Warning state' },
    { name: '--danger', light: '#dc2626', dark: '#ef4444', desc: 'Danger state' },
    { name: '--glass-bg', light: 'rgba(255,255,255,0.72)', dark: 'rgba(20,20,22,0.72)', desc: 'Glass card background' },
];

const radiusTokens = [
    { name: '--radius-sm', value: '6px', desc: 'Small (badges, tags)' },
    { name: '--radius-md', value: '10px', desc: 'Medium (inputs, buttons)' },
    { name: '--radius-lg', value: '14px', desc: 'Large (cards)' },
    { name: '--radius-xl', value: '20px', desc: 'Extra large (panels)' },
    { name: '--radius-2xl', value: '28px', desc: '2XL (modals, heroes)' },
];

const shadowTokens = [
    { name: '--shadow-sm', value: '0 1px 2px 0 rgba(15,23,42,0.04)', desc: 'Subtle lift' },
    { name: '--shadow-md', value: '0 4px 12px -2px rgba(15,23,42,0.06), 0 2px 4px -2px rgba(15,23,42,0.04)', desc: 'Default card' },
    { name: '--shadow-lg', value: '0 12px 32px -8px rgba(15,23,42,0.10), 0 4px 8px -4px rgba(15,23,42,0.06)', desc: 'Elevated / modal' },
    { name: '--shadow-focus', value: '0 0 0 3px var(--accent-ring)', desc: 'Keyboard focus' },
];

const motionTokens = [
    { name: '--dur-fast', value: '150ms', desc: 'Quick feedback' },
    { name: '--dur-base', value: '220ms', desc: 'Standard transition' },
    { name: '--dur-slow', value: '360ms', desc: 'Deliberate motion' },
    { name: '--dur-reveal', value: '600ms', desc: 'Entry animation' },
    { name: '--ease-spring', value: 'cubic-bezier(0.16, 1, 0.3, 1)', desc: 'Spring (entries)' },
    { name: '--ease-out-soft', value: 'cubic-bezier(0.33, 1, 0.68, 1)', desc: 'Soft ease-out' },
    { name: '--ease-in-out', value: 'cubic-bezier(0.65, 0, 0.35, 1)', desc: 'Balanced' },
];

const typographyScale = [
    { token: 'Display', className: 'text-5xl font-semibold', sample: 'Aa', desc: 'clamp(2.5rem, 6vw, 4rem) · Outfit 700 · -0.03em', code: 'fontFamily: var(--font-display)' },
    { token: 'H1', className: 'text-3xl font-semibold', sample: 'Aa', desc: '1.875rem · Outfit 600 · -0.02em', code: 'fontSize: 1.875rem' },
    { token: 'H2', className: 'text-xl font-medium', sample: 'Aa', desc: '1.25rem · Outfit 500 · -0.01em', code: 'fontSize: 1.25rem' },
    { token: 'H3', className: 'text-lg font-medium', sample: 'Aa', desc: '1.125rem · Outfit 500', code: 'fontSize: 1.125rem' },
    { token: 'Body', className: 'text-sm', sample: 'Aa', desc: '0.875rem · Inter 400 · 1.6 line-height', code: 'fontSize: 0.875rem' },
    { token: 'Body Small', className: 'text-xs', sample: 'Aa', desc: '0.75rem · Inter 400', code: 'fontSize: 0.75rem' },
    { token: 'Eyebrow', className: 'eyebrow', sample: 'Eyebrow', desc: '11px · Inter 500 · uppercase · 0.18em', code: 'className: eyebrow' },
    { token: 'Label', className: 'text-[11px] font-medium', sample: 'Label', desc: '0.6875rem · Inter 500', code: 'fontSize: 0.6875rem' },
    { token: 'Stat', className: 'text-5xl font-semibold tabular-nums', sample: '99+', desc: '3rem · Outfit 600 · tabular-nums', code: 'fontVariantNumeric: tabular-nums' },
];

/* ============================================================
   COMPONENT
   ============================================================ */
const DesignSystemPage = () => {
    const { toast } = useToast();
    const [activeSection, setActiveSection] = useState('foundations');
    const [searchQuery, setSearchQuery] = useState('');
    const [darkMode, setDarkMode] = useState(false);
    const [copiedCode, setCopiedCode] = useState('');
    const [toggleOn, setToggleOn] = useState(false);
    const [activeTab, setActiveTab] = useState('tab1');
    const [modalOpen, setModalOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [expandedCode, setExpandedCode] = useState({});

    // Apply dark mode by toggling .dark class on <html>
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    const sections = [
        { id: 'foundations', label: 'Foundations', icon: Layers },
        { id: 'colors', label: 'Color Tokens', icon: Palette },
        { id: 'typography', label: 'Typography', icon: Type },
        { id: 'spacing', label: 'Spacing & Radii', icon: Box },
        { id: 'shadows', label: 'Shadows & Motion', icon: Sparkles },
        { id: 'components', label: 'Components', icon: Grid },
        { id: 'forms', label: 'Forms', icon: Component },
        { id: 'feedback', label: 'Feedback', icon: Bell },
        { id: 'dashboard', label: 'Dashboard', icon: Layout },
        { id: 'charts', label: 'Charts', icon: BarChart3 },
        { id: 'overlays', label: 'Overlays', icon: MessageSquare },
        { id: 'accessibility', label: 'Accessibility', icon: Keyboard },
    ];

    const filteredSections = sections.filter(s =>
        s.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const copyToClipboard = (code, id) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(id);
        setTimeout(() => setCopiedCode(''), 2000);
    };

    const toggleCode = (id) => {
        setExpandedCode(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="min-h-[100dvh] p-4 sm:p-6 lg:p-8" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            {/* Top Nav */}
            <nav className="sticky top-0 z-40 mx-auto max-w-7xl mt-2 mb-6">
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
                    <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
                        <ArrowLeft size={16} /> Back to NexHire
                    </Link>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className="flex items-center gap-2 px-3 py-1.5 border border-[var(--border-primary)] rounded-lg text-xs font-medium hover:bg-[var(--surface-hover)] transition-colors"
                        >
                            {darkMode ? <Sun size={14} className="text-[var(--warning)]" /> : <Moon size={14} className="text-[var(--accent)]" />}
                            {darkMode ? 'Light' : 'Dark'}
                        </button>
                        <div className="flex items-center gap-2">
                            <Palette size={16} className="text-[var(--accent)]" />
                            <span className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)' }}>Design System</span>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto">
                {/* Hero */}
                <div className="mb-8">
                    <div
                        className="inline-flex items-center gap-2 px-3 py-1 mb-4"
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
                        <Sparkles size={11} strokeWidth={2.5} />
                        Live Component Library
                    </div>
                    <h1
                        className="mb-3"
                        style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'clamp(2rem, 4vw, 2.75rem)',
                            fontWeight: 700,
                            letterSpacing: '-0.02em',
                            lineHeight: 1.1,
                        }}
                    >
                        NexHire Design System
                    </h1>
                    <p className="max-w-2xl text-sm" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        A premium, Linear-inspired design system built on CSS custom properties.
                        Light/dark themes, 18 color tokens, 5 radii, 4 shadows, 7 motion easings,
                        and a complete component library — all theme-aware via CSS variables.
                    </p>
                </div>

                {/* Section Nav */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-3">
                        <div
                            className="flex items-center gap-2 px-3 py-2 border border-[var(--border-primary)] flex-1 max-w-xs"
                            style={{ backgroundColor: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}
                        >
                            <Search size={14} className="text-[var(--text-muted)]" />
                            <input
                                type="text"
                                placeholder="Filter sections..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--text-muted)]"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                                    <X size={12} />
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {(searchQuery ? filteredSections : sections).map(section => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`px-4 py-2 text-xs font-medium rounded-lg flex items-center gap-2 transition-all ${
                                    activeSection === section.id
                                        ? 'bg-[var(--accent)] text-white'
                                        : 'border border-[var(--border-primary)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
                                }`}
                            >
                                <section.icon size={14} /> {section.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-6">

                    {/* ============================================
                        FOUNDATIONS — overview of the token system
                        ============================================ */}
                    {activeSection === 'foundations' && (
                        <div className="space-y-6">
                            <SectionCard icon={Layers} title="Foundations" subtitle="The token system that powers theming">
                                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                    Every color, radius, shadow, and motion value in NexHire is a CSS custom property
                                    defined in <Code>index.css</Code> under the <Code>@theme</Code> block. The
                                    <Code>.dark</Code> class on <Code>&lt;html&gt;</Code> flips all tokens to dark
                                    values — no JS rebuilds, no flash of incorrect theme.
                                </p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                                    {[
                                        { label: 'Color Tokens', value: colorTokens.length, icon: Palette },
                                        { label: 'Radius Steps', value: radiusTokens.length, icon: Box },
                                        { label: 'Shadow Tokens', value: shadowTokens.length, icon: Sparkles },
                                        { label: 'Motion Easings', value: motionTokens.length, icon: Zap },
                                    ].map((s, i) => (
                                        <div key={i} className="p-4 border border-[var(--border-primary)]" style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                            <s.icon size={16} className="text-[var(--accent)] mb-2" />
                                            <div className="text-2xl font-bold tabular-nums">{s.value}</div>
                                            <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide">{s.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </SectionCard>

                            <SectionCard icon={Code2} title="Theme Architecture" subtitle="How light/dark theming works">
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)] mb-2">Default (Light)</div>
                                        <pre className="p-3 rounded-lg text-xs overflow-x-auto" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
{`@theme {
  --bg-primary: #ffffff;
  --accent: #4f46e5;
  --text-primary: #0a0a0a;
  /* ...18 more tokens */
}`}
                                        </pre>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)] mb-2">Dark override</div>
                                        <pre className="p-3 rounded-lg text-xs overflow-x-auto" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
{`@custom-variant dark (&:where(.dark, .dark *));

.dark {
  --bg-primary: #0c0d10;
  --accent: #6366f1;     /* brighter indigo */
  --text-primary: #fafafa;
  /* ...same 18 tokens overridden */
}`}
                                        </pre>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)] mb-2">Toggle in React</div>
                                        <pre className="p-3 rounded-lg text-xs overflow-x-auto" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
{`useEffect(() => {
  document.documentElement.classList.toggle('dark', isDark);
}, [isDark]);`}
                                        </pre>
                                    </div>
                                </div>
                                <p className="text-xs text-[var(--text-muted)] mt-4">
                                    💡 Try the toggle in the top-right of this page — it adds/removes the
                                    <Code>.dark</Code> class on <Code>&lt;html&gt;</Code> and every token updates instantly.
                                </p>
                            </SectionCard>

                            <SectionCard icon={Type} title="Fonts" subtitle="Two-family system: Outfit for display, Inter for body">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-5 border border-[var(--border-primary)]" style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                        <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)] mb-2">Display Font</div>
                                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 600, letterSpacing: '-0.02em' }}>Outfit</div>
                                        <p className="text-xs text-[var(--text-muted)] mt-2">Used for headings, page titles, stat numbers. Weights: 400, 500, 600, 700.</p>
                                        <code className="text-[11px] text-[var(--accent)] mt-2 block">--font-display</code>
                                    </div>
                                    <div className="p-5 border border-[var(--border-primary)]" style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                        <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)] mb-2">Body Font</div>
                                        <div style={{ fontFamily: 'var(--font-sans)', fontSize: '2rem', fontWeight: 500 }}>Inter</div>
                                        <p className="text-xs text-[var(--text-muted)] mt-2">Used for body text, labels, UI controls. Weights: 400, 450, 500, 600, 700.</p>
                                        <code className="text-[11px] text-[var(--accent)] mt-2 block">--font-sans</code>
                                    </div>
                                </div>
                            </SectionCard>
                        </div>
                    )}

                    {/* ============================================
                        COLORS — full token table with light/dark values
                        ============================================ */}
                    {activeSection === 'colors' && (
                        <div className="space-y-6">
                            <SectionCard icon={Palette} title="Color Tokens" subtitle={`${colorTokens.length} CSS variables · light + dark values`}>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-[var(--border-primary)]">
                                                <th className="text-left text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)] py-3 pr-4">Swatch</th>
                                                <th className="text-left text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)] py-3 pr-4">Token</th>
                                                <th className="text-left text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)] py-3 pr-4">Light</th>
                                                <th className="text-left text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)] py-3 pr-4">Dark</th>
                                                <th className="text-left text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)] py-3 pr-4">Usage</th>
                                                <th className="text-right text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)] py-3"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {colorTokens.map((c, i) => (
                                                <tr key={i} className="border-b border-[var(--border-primary)] hover:bg-[var(--surface-hover)]">
                                                    <td className="py-3 pr-4">
                                                        <div className="flex gap-1">
                                                            <div className="w-6 h-6 border border-[var(--border-strong)]" style={{ backgroundColor: c.light, borderRadius: 'var(--radius-sm)' }} title={`Light: ${c.light}`} />
                                                            <div className="w-6 h-6 border border-[var(--border-strong)]" style={{ backgroundColor: c.dark, borderRadius: 'var(--radius-sm)' }} title={`Dark: ${c.dark}`} />
                                                        </div>
                                                    </td>
                                                    <td className="py-3 pr-4"><code className="text-xs font-mono" style={{ color: 'var(--accent)' }}>{c.name}</code></td>
                                                    <td className="py-3 pr-4 text-xs font-mono text-[var(--text-secondary)]">{c.light}</td>
                                                    <td className="py-3 pr-4 text-xs font-mono text-[var(--text-secondary)]">{c.dark}</td>
                                                    <td className="py-3 pr-4 text-xs text-[var(--text-muted)]">{c.desc}</td>
                                                    <td className="py-3 text-right">
                                                        <button onClick={() => copyToClipboard(c.name, `color-${i}`)} className="p-1 hover:bg-[var(--bg-tertiary)] rounded">
                                                            {copiedCode === `color-${i}` ? <Check size={12} className="text-[var(--success)]" /> : <Copy size={12} className="text-[var(--text-muted)]" />}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </SectionCard>

                            <SectionCard icon={Palette} title="Semantic Color Usage" subtitle="How status colors map to UI states">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {[
                                        { label: 'Accent', color: 'var(--accent)', bg: 'var(--accent-soft)', usage: 'Primary actions, links, focus', icon: Zap },
                                        { label: 'Success', color: 'var(--success)', bg: 'color-mix(in srgb, var(--success) 10%, transparent)', usage: 'Verified, completed, active', icon: CheckCircle },
                                        { label: 'Warning', color: 'var(--warning)', bg: 'color-mix(in srgb, var(--warning) 10%, transparent)', usage: 'Pending, alerts, stale', icon: AlertTriangle },
                                        { label: 'Danger', color: 'var(--danger)', bg: 'color-mix(in srgb, var(--danger) 10%, transparent)', usage: 'Errors, rejected, delete', icon: X },
                                    ].map((s, i) => (
                                        <div key={i} className="p-4 border" style={{ backgroundColor: s.bg, borderColor: 'color-mix(in srgb, ' + s.color + ' 20%, transparent)', borderRadius: 'var(--radius-md)' }}>
                                            <s.icon size={18} style={{ color: s.color }} />
                                            <div className="text-sm font-semibold mt-2" style={{ color: s.color }}>{s.label}</div>
                                            <p className="text-[11px] mt-1" style={{ color: 'var(--text-secondary)' }}>{s.usage}</p>
                                        </div>
                                    ))}
                                </div>
                            </SectionCard>
                        </div>
                    )}

                    {/* ============================================
                        TYPOGRAPHY — full scale
                        ============================================ */}
                    {activeSection === 'typography' && (
                        <div className="space-y-6">
                            <SectionCard icon={Type} title="Typography Scale" subtitle="9 type styles used across the app">
                                <div className="space-y-1">
                                    {typographyScale.map((t, i) => (
                                        <div key={i} className="flex items-center gap-4 p-4 border-b border-[var(--border-primary)] last:border-0 hover:bg-[var(--surface-hover)]">
                                            <div className="w-24 shrink-0">
                                                <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">{t.token}</div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className={t.className} style={{ color: 'var(--text-primary)' }}>{t.sample}</span>
                                            </div>
                                            <div className="hidden md:block flex-1 text-xs text-[var(--text-muted)]">{t.desc}</div>
                                            <button onClick={() => copyToClipboard(t.code, `typo-${i}`)} className="p-1 hover:bg-[var(--bg-tertiary)] rounded shrink-0">
                                                {copiedCode === `typo-${i}` ? <Check size={12} className="text-[var(--success)]" /> : <Copy size={12} className="text-[var(--text-muted)]" />}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </SectionCard>

                            <SectionCard icon={Type} title="Eyebrow Label" subtitle="Small uppercase label above headings">
                                <div className="p-6 border border-[var(--border-primary)]" style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                    <div className="eyebrow mb-2">Section Label</div>
                                    <h3 className="text-xl font-medium" style={{ fontFamily: 'var(--font-display)' }}>Heading Under Eyebrow</h3>
                                </div>
                                <pre className="mt-3 p-3 rounded-lg text-xs overflow-x-auto" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
{`<div className="eyebrow mb-2">Section Label</div>
<h3>Heading Under Eyebrow</h3>`}
                                </pre>
                            </SectionCard>
                        </div>
                    )}

                    {/* ============================================
                        SPACING & RADII
                        ============================================ */}
                    {activeSection === 'spacing' && (
                        <div className="space-y-6">
                            <SectionCard icon={Box} title="Radius Scale" subtitle={`${radiusTokens.length} radius tokens`}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {radiusTokens.map((r, i) => (
                                        <div key={i} className="flex items-center gap-4 p-4 border border-[var(--border-primary)]" style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                            <div
                                                className="w-16 h-16 shrink-0 border-2"
                                                style={{ borderRadius: r.value, borderColor: 'var(--accent)', backgroundColor: 'var(--accent-soft)' }}
                                            />
                                            <div className="flex-1">
                                                <code className="text-sm font-mono font-semibold" style={{ color: 'var(--accent)' }}>{r.name}</code>
                                                <div className="text-xs text-[var(--text-secondary)] mt-1">{r.value}</div>
                                                <div className="text-[11px] text-[var(--text-muted)] mt-0.5">{r.desc}</div>
                                            </div>
                                            <button onClick={() => copyToClipboard(r.name, `radius-${i}`)} className="p-1 hover:bg-[var(--bg-elevated)] rounded">
                                                {copiedCode === `radius-${i}` ? <Check size={12} className="text-[var(--success)]" /> : <Copy size={12} className="text-[var(--text-muted)]" />}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </SectionCard>

                            <SectionCard icon={Box} title="Spacing Patterns" subtitle="Common spacing combinations used across components">
                                <div className="space-y-2">
                                    {[
                                        { name: 'Card padding', value: 'p-8 (2rem)', desc: 'Standard glass-card interior' },
                                        { name: 'Compact card', value: 'p-6 (1.5rem)', desc: 'Dense layouts, table rows' },
                                        { name: 'Tight padding', value: 'p-4 (1rem)', desc: 'Inline elements, tags' },
                                        { name: 'Section gap', value: 'space-y-8 (2rem)', desc: 'Between major sections' },
                                        { name: 'Component gap', value: 'gap-4 (1rem)', desc: 'Grid/flex item spacing' },
                                        { name: 'Tight gap', value: 'gap-2 (0.5rem)', desc: 'Badges, icon+text' },
                                    ].map((s, i) => (
                                        <div key={i} className="flex items-center gap-4 p-3 border border-[var(--border-primary)]" style={{ borderRadius: 'var(--radius-sm)' }}>
                                            <code className="text-xs font-mono font-semibold w-32 shrink-0" style={{ color: 'var(--accent)' }}>{s.value}</code>
                                            <div className="flex-1">
                                                <div className="text-sm font-medium">{s.name}</div>
                                                <div className="text-[11px] text-[var(--text-muted)]">{s.desc}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </SectionCard>
                        </div>
                    )}

                    {/* ============================================
                        SHADOWS & MOTION
                        ============================================ */}
                    {activeSection === 'shadows' && (
                        <div className="space-y-6">
                            <SectionCard icon={Sparkles} title="Shadow Tokens" subtitle={`${shadowTokens.length} shadow elevations`}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {shadowTokens.map((s, i) => (
                                        <div key={i} className="p-6 border border-[var(--border-primary)]" style={{ backgroundColor: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)', boxShadow: s.name === '--shadow-focus' ? undefined : s.value }}>
                                            <code className="text-sm font-mono font-semibold" style={{ color: 'var(--accent)' }}>{s.name}</code>
                                            <div className="text-xs text-[var(--text-secondary)] mt-2" style={{ wordBreak: 'break-all' }}>{s.value}</div>
                                            <div className="text-[11px] text-[var(--text-muted)] mt-1">{s.desc}</div>
                                            {s.name === '--shadow-focus' && (
                                                <button className="mt-3 px-3 py-1.5 text-xs font-medium border border-[var(--border-primary)] rounded" style={{ boxShadow: s.value }}>
                                                    Focusable button
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </SectionCard>

                            <SectionCard icon={Zap} title="Motion Tokens" subtitle={`${motionTokens.length} durations and easings`}>
                                <div className="space-y-2">
                                    {motionTokens.map((m, i) => (
                                        <div key={i} className="flex items-center gap-4 p-3 border border-[var(--border-primary)]" style={{ borderRadius: 'var(--radius-sm)' }}>
                                            <code className="text-xs font-mono font-semibold w-32 shrink-0" style={{ color: 'var(--accent)' }}>{m.name}</code>
                                            <code className="text-xs font-mono text-[var(--text-secondary)] flex-1">{m.value}</code>
                                            <div className="text-[11px] text-[var(--text-muted)] hidden md:block">{m.desc}</div>
                                        </div>
                                    ))}
                                </div>
                            </SectionCard>

                            <SectionCard icon={Sparkles} title="Entry Animations" subtitle="Used on page mounts and dashboard reveals">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {[
                                        { name: 'fade-in', desc: '0.5s ease-out-soft', cls: 'fade-in' },
                                        { name: 'slide-in-from-bottom-8', desc: '0.7s spring', cls: 'slide-in-from-bottom-8' },
                                        { name: 'reveal-up', desc: '600ms spring', cls: 'reveal-up' },
                                    ].map((a, i) => (
                                        <div key={i} className="p-4 border border-[var(--border-primary)] text-center" style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                            <div className={`text-sm font-semibold ${a.cls}`} style={{ color: 'var(--accent)' }}>Animated</div>
                                            <code className="text-[11px] text-[var(--text-muted)] mt-1 block">{a.name}</code>
                                            <div className="text-[10px] text-[var(--text-muted)] mt-0.5">{a.desc}</div>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-[var(--text-muted)] mt-3">
                                    💡 All animations respect <Code>prefers-reduced-motion: reduce</Code> —
                                    durations collapse to 0.01ms for users who opt out.
                                </p>
                            </SectionCard>
                        </div>
                    )}

                    {/* ============================================
                        COMPONENTS — utility classes
                        ============================================ */}
                    {activeSection === 'components' && (
                        <div className="space-y-6">
                            <SectionCard icon={Grid} title="Buttons" subtitle="Primary, ghost, danger, icon — all sizes">
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)] mb-2">Utility classes</div>
                                        <div className="flex flex-wrap gap-3">
                                            <button className="btn-primary">Primary <Zap size={14} /></button>
                                            <button className="btn-ghost">Ghost</button>
                                            <button className="px-4 py-2 bg-[var(--danger)]/10 border border-[var(--danger)]/20 rounded-lg text-xs font-medium text-[var(--danger)] hover:bg-[var(--danger)] hover:text-white transition-all">Danger</button>
                                            <button className="px-4 py-2 bg-[var(--success)]/10 border border-[var(--success)]/20 rounded-lg text-xs font-medium text-[var(--success)] hover:bg-[var(--success)] hover:text-white transition-all">Success</button>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)] mb-2">Sizes</div>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <button className="btn-primary" style={{ padding: '0.375rem 0.75rem', fontSize: '12px' }}>Small</button>
                                            <button className="btn-primary">Default</button>
                                            <button className="btn-primary" style={{ padding: '0.875rem 1.5rem', fontSize: '16px' }}>Large</button>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)] mb-2">Icon buttons</div>
                                        <div className="flex flex-wrap gap-3">
                                            {['sm', 'md', 'lg'].map(size => (
                                                <button key={size} className={`bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg flex items-center justify-center hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors ${size === 'sm' ? 'w-8 h-8' : size === 'md' ? 'w-10 h-10' : 'w-12 h-12'}`}>
                                                    <Search size={size === 'sm' ? 12 : size === 'md' ? 16 : 20} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)] mb-2">Disabled state</div>
                                        <button className="btn-primary" disabled>Disabled Primary</button>
                                    </div>
                                </div>
                                <CodeBlock code={`<button className="btn-primary">Primary</button>
<button className="btn-ghost">Ghost</button>`} id="btn-code" expanded={expandedCode} toggle={toggleCode} copied={copiedCode} copy={copyToClipboard} />
                            </SectionCard>

                            <SectionCard icon={Grid} title="Cards" subtitle="Glass card, soft card, bordered variants">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="glass-card p-5" style={{ borderRadius: 'var(--radius-lg)' }}>
                                        <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--accent)] mb-1">Glass Card</div>
                                        <p className="text-xs text-[var(--text-secondary)]">Translucent backdrop-blur surface. Used for nav, hero, modals.</p>
                                        <code className="text-[10px] text-[var(--text-muted)] mt-2 block">.glass-card</code>
                                    </div>
                                    <div className="card-soft p-5">
                                        <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--accent)] mb-1">Soft Card</div>
                                        <p className="text-xs text-[var(--text-secondary)]">Opaque elevated surface with shadow. Used for content panels.</p>
                                        <code className="text-[10px] text-[var(--text-muted)] mt-2 block">.card-soft</code>
                                    </div>
                                    <div className="p-5 border border-[var(--border-primary)]" style={{ backgroundColor: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)' }}>
                                        <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--accent)] mb-1">Bordered</div>
                                        <p className="text-xs text-[var(--text-secondary)]">Minimal bordered surface. Used for nested content.</p>
                                        <code className="text-[10px] text-[var(--text-muted)] mt-2 block">border + bg-elevated</code>
                                    </div>
                                </div>
                            </SectionCard>

                            <SectionCard icon={Grid} title="Badges & Pills" subtitle="Status indicators and count pills">
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)] mb-2">Status badges</div>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="px-3 py-1 rounded-full text-[11px] font-medium border bg-[var(--success)]/10 text-[var(--success)] border-emerald-500/20">Active</span>
                                            <span className="px-3 py-1 rounded-full text-[11px] font-medium border bg-[var(--warning)]/10 text-[var(--warning)] border-amber-500/20">Pending</span>
                                            <span className="px-3 py-1 rounded-full text-[11px] font-medium border bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/20">Rejected</span>
                                            <span className="px-3 py-1 rounded-full text-[11px] font-medium border bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20">Info</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)] mb-2">Count pills</div>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="px-2 py-0.5 bg-[var(--accent)] text-white text-[11px] font-semibold rounded-full">5</span>
                                            <span className="px-2 py-0.5 bg-[var(--accent)] text-white text-[11px] font-semibold rounded-full">99+</span>
                                            <span className="px-2 py-0.5 bg-[var(--danger)] text-white text-[11px] font-semibold rounded-full">!</span>
                                            <span className="px-2 py-0.5 bg-[var(--success)] text-white text-[11px] font-semibold rounded-full">✓</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)] mb-2">Eyebrow labels</div>
                                        <div className="flex flex-wrap gap-3 items-center">
                                            <span className="eyebrow">Section Label</span>
                                            <span className="eyebrow" style={{ color: 'var(--accent)' }}>Active</span>
                                        </div>
                                    </div>
                                </div>
                            </SectionCard>

                            <SectionCard icon={User} title="Avatars & Icons" subtitle="User representations and icon sizing">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)] mb-2">Avatar variants</div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent)] font-semibold">AR</div>
                                            <div className="w-12 h-12 rounded-full bg-[var(--success)]/10 flex items-center justify-center text-[var(--success)]"><User size={20} /></div>
                                            <div className="w-10 h-10 rounded-xl bg-[var(--warning)]/10 flex items-center justify-center text-[var(--warning)]"><User size={18} /></div>
                                            <div className="w-8 h-8 rounded-lg bg-[var(--danger)]/10 flex items-center justify-center text-[var(--danger)]"><User size={14} /></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)] mb-2">Icon sizes</div>
                                        <div className="flex items-center gap-4 text-[var(--accent)]">
                                            <Zap size={12} />
                                            <Zap size={16} />
                                            <Zap size={20} />
                                            <Zap size={28} />
                                            <Zap size={40} />
                                        </div>
                                        <div className="text-[11px] text-[var(--text-muted)] mt-2">12 · 16 · 20 · 28 · 40 px (Lucide React)</div>
                                    </div>
                                </div>
                            </SectionCard>
                        </div>
                    )}

                    {/* ============================================
                        FORMS
                        ============================================ */}
                    {activeSection === 'forms' && (
                        <div className="space-y-6">
                            <SectionCard icon={Component} title="Form Inputs" subtitle="Text, email, select, textarea — all themed">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-2">Text Input</label>
                                        <input type="text" placeholder="Enter name..." className="input-soft w-full px-4 py-3 text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-2">Email Input</label>
                                        <input type="email" placeholder="user@example.com" className="input-soft w-full px-4 py-3 text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-2">Select</label>
                                        <select className="input-soft w-full px-4 py-3 text-sm">
                                            <option>Choose option...</option>
                                            <option>Option A</option>
                                            <option>Option B</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-2">Textarea</label>
                                        <textarea placeholder="Enter description..." rows={3} className="input-soft w-full px-4 py-3 text-sm resize-none"></textarea>
                                    </div>
                                </div>
                                <CodeBlock code={`<input className="input-soft w-full px-4 py-3" />
<select className="input-soft w-full px-4 py-3" />`} id="form-code" expanded={expandedCode} toggle={toggleCode} copied={copiedCode} copy={copyToClipboard} />
                            </SectionCard>

                            <SectionCard icon={Component} title="Interactive Controls" subtitle="Toggle, slider, checkbox, radio">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)] mb-3">Toggle Switch</div>
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => setToggleOn(!toggleOn)} className={`w-14 h-7 rounded-full transition-colors ${toggleOn ? 'bg-[var(--accent)]' : 'bg-[var(--bg-tertiary)] border border-[var(--border-primary)]'}`}>
                                                <div className={`w-6 h-6 bg-white rounded-full shadow transform transition-transform ${toggleOn ? 'translate-x-7' : 'translate-x-0.5'}`} />
                                            </button>
                                            <span className="text-sm font-medium">Toggle is {toggleOn ? 'ON' : 'OFF'}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)] mb-3">Range Slider</div>
                                        <input type="range" min="0" max="10" defaultValue="5" className="w-full h-2 bg-[var(--bg-tertiary)] rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                                        <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1"><span>0</span><span>5</span><span>10</span></div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)] mb-3">Checkboxes</div>
                                        <div className="space-y-2">
                                            {['Option 1', 'Option 2', 'Option 3'].map((opt, i) => (
                                                <label key={i} className="flex items-center gap-2 text-sm cursor-pointer">
                                                    <input type="checkbox" defaultChecked={i === 0} className="w-4 h-4 rounded accent-[var(--accent)]" />
                                                    {opt}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)] mb-3">Radio Buttons</div>
                                        <div className="space-y-2">
                                            {['Choice A', 'Choice B', 'Choice C'].map((opt, i) => (
                                                <label key={i} className="flex items-center gap-2 text-sm cursor-pointer">
                                                    <input type="radio" name="ds-radio" defaultChecked={i === 0} className="w-4 h-4 accent-[var(--accent)]" />
                                                    {opt}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </SectionCard>

                            <SectionCard icon={Component} title="Tabs" subtitle="Pill-style tab navigation">
                                <div className="flex gap-2 mb-4 border-b border-[var(--border-primary)] pb-3">
                                    {['overview', 'details', 'history'].map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`px-4 py-2 text-xs font-medium rounded-lg transition-all capitalize ${
                                                activeTab === tab
                                                    ? 'bg-[var(--accent)] text-white'
                                                    : 'text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
                                            }`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    Active tab: <span className="font-semibold text-[var(--accent)]">{activeTab}</span>
                                </p>
                            </SectionCard>
                        </div>
                    )}

                    {/* ============================================
                        FEEDBACK — toast, alerts, skeletons, progress
                        ============================================ */}
                    {activeSection === 'feedback' && (
                        <div className="space-y-6">
                            <SectionCard icon={Bell} title="Toast Notifications" subtitle="Trigger via the useToast hook">
                                <div className="flex flex-wrap gap-3 mb-4">
                                    <button onClick={() => toast('Operation completed successfully.')} className="btn-primary">Show Toast</button>
                                </div>
                                <CodeBlock code={`import { useToast } from '../components/ui/Toast';
const { toast } = useToast();
toast('Operation completed successfully.');`} id="toast-code" expanded={expandedCode} toggle={toggleCode} copied={copiedCode} copy={copyToClipboard} />
                            </SectionCard>

                            <SectionCard icon={AlertTriangle} title="Inline Alerts" subtitle="Contextual message blocks">
                                <div className="space-y-3">
                                    {[
                                        { type: 'success', icon: CheckCircle, title: 'Success', msg: 'Profile updated successfully.' },
                                        { type: 'warning', icon: AlertTriangle, title: 'Warning', msg: 'This action cannot be undone.' },
                                        { type: 'danger', icon: X, title: 'Error', msg: 'Failed to submit form. Please try again.' },
                                        { type: 'info', icon: Info, title: 'Info', msg: 'New features are available. Check the docs.' },
                                    ].map((a, i) => {
                                        const color = a.type === 'success' ? 'var(--success)' : a.type === 'warning' ? 'var(--warning)' : a.type === 'danger' ? 'var(--danger)' : 'var(--accent)';
                                        return (
                                            <div key={i} className="flex items-start gap-3 p-4 border" style={{ backgroundColor: `color-mix(in srgb, ${color} 8%, transparent)`, borderColor: `color-mix(in srgb, ${color} 25%, transparent)`, borderRadius: 'var(--radius-md)' }}>
                                                <a.icon size={18} style={{ color, flexShrink: 0, marginTop: 2 }} />
                                                <div className="flex-1">
                                                    <div className="text-sm font-semibold" style={{ color }}>{a.title}</div>
                                                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{a.msg}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </SectionCard>

                            <SectionCard icon={Loader2} title="Loading States" subtitle="Spinner, skeleton, dots">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="text-center">
                                        <div className="w-10 h-10 border-4 rounded-full animate-spin mx-auto" style={{ borderColor: 'var(--accent-soft)', borderTopColor: 'var(--accent)' }} />
                                        <p className="text-[11px] font-medium mt-2 text-[var(--text-muted)]">Spinner</p>
                                    </div>
                                    <div className="text-center">
                                        <Loader2 className="w-10 h-10 text-[var(--accent)] animate-spin mx-auto" />
                                        <p className="text-[11px] font-medium mt-2 text-[var(--text-muted)]">Loader2 icon</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="h-10 bg-[var(--bg-tertiary)] rounded-lg animate-pulse mx-auto" />
                                        <p className="text-[11px] font-medium mt-2 text-[var(--text-muted)]">Skeleton</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="flex justify-center gap-1 h-10 items-center">
                                            {[0, 1, 2].map(i => (
                                                <div key={i} className="w-2 h-2 bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
                                            ))}
                                        </div>
                                        <p className="text-[11px] font-medium mt-2 text-[var(--text-muted)]">Dots</p>
                                    </div>
                                </div>
                            </SectionCard>

                            <SectionCard icon={BarChart3} title="Progress Bars" subtitle="Linear progress with semantic colors">
                                <div className="space-y-3">
                                    {[
                                        { pct: 25, color: 'var(--accent)' },
                                        { pct: 50, color: 'var(--success)' },
                                        { pct: 75, color: 'var(--warning)' },
                                        { pct: 100, color: 'var(--success)' },
                                    ].map((p, i) => (
                                        <div key={i}>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-[var(--text-muted)]">Progress</span>
                                                <span className="font-semibold tabular-nums">{p.pct}%</span>
                                            </div>
                                            <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                                                <div className="h-full rounded-full transition-all" style={{ width: `${p.pct}%`, backgroundColor: p.color }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </SectionCard>

                            <SectionCard icon={Info} title="Empty States" subtitle="Used when lists have no data">
                                <div className="p-8 border-2 border-dashed border-[var(--border-primary)] text-center" style={{ borderRadius: 'var(--radius-lg)' }}>
                                    <BarChart3 size={32} className="mx-auto mb-3 text-[var(--text-muted)] opacity-40" />
                                    <p className="text-sm font-medium text-[var(--text-muted)]">No data available</p>
                                    <p className="text-xs text-[var(--text-muted)] opacity-70 mt-1">Data will appear here when available</p>
                                </div>
                            </SectionCard>
                        </div>
                    )}

                    {/* ============================================
                        DASHBOARD LAYOUT
                        ============================================ */}
                    {activeSection === 'dashboard' && (
                        <div className="space-y-6">
                            <SectionCard icon={Layout} title="Dashboard Layout" subtitle="Sidebar + header + content area">
                                <div className="flex h-80 rounded-2xl overflow-hidden border border-[var(--border-primary)]">
                                    {/* Sidebar */}
                                    <div className="w-44 border-r border-[var(--border-primary)] p-3 flex flex-col" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                                        <div className="flex items-center gap-2 mb-4 px-2">
                                            <div className="w-6 h-6 bg-[var(--accent)]" style={{ borderRadius: 'var(--radius-sm)' }} />
                                            <span className="text-xs font-semibold">NexHire</span>
                                        </div>
                                        <div className="space-y-1 flex-1">
                                            {['Dashboard', 'Jobs', 'Candidates', 'Analytics', 'Settings'].map((item, i) => (
                                                <div key={item} className={`flex items-center gap-2 p-2 rounded-lg text-xs ${i === 0 ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-semibold' : 'text-[var(--text-muted)]'}`}>
                                                    <div className="w-3.5 h-3.5 rounded bg-current/20" />
                                                    {item}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="p-2 rounded-lg bg-[var(--bg-tertiary)] flex items-center gap-2">
                                            <div className="w-6 h-6 rounded bg-[var(--accent-soft)]" />
                                            <div className="flex-1"><div className="h-2 w-10 bg-[var(--text-muted)]/30 rounded" /></div>
                                        </div>
                                    </div>
                                    {/* Main */}
                                    <div className="flex-1 flex flex-col">
                                        <div className="h-12 border-b border-[var(--border-primary)] flex items-center justify-between px-4" style={{ backgroundColor: 'var(--glass-bg)', backdropFilter: 'blur(12px)' }}>
                                            <div className="text-sm font-semibold">Dashboard</div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-lg bg-[var(--bg-tertiary)]" />
                                                <div className="w-7 h-7 rounded-lg bg-[var(--bg-tertiary)] relative">
                                                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[var(--accent)] rounded-full" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex-1 p-4 overflow-hidden">
                                            <div className="grid grid-cols-4 gap-2 mb-3">
                                                {[1, 2, 3, 4].map(i => (
                                                    <div key={i} className="h-16 bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-xl p-2.5">
                                                        <div className="h-1.5 w-6 bg-[var(--text-muted)]/30 rounded mb-1.5" />
                                                        <div className="h-4 w-10 bg-[var(--text-muted)]/50 rounded" />
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="h-28 bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-xl p-3">
                                                <div className="h-1.5 w-16 bg-[var(--text-muted)]/30 rounded mb-2" />
                                                <div className="flex items-end gap-1 h-16">
                                                    {[40, 60, 45, 80, 55, 70, 90, 65, 75].map((h, i) => (
                                                        <div key={i} className="flex-1 bg-[var(--accent)]/40 rounded-t" style={{ height: `${h}%` }} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </SectionCard>

                            <SectionCard icon={Layout} title="Sidebar Navigation Items" subtitle="Active, hover, default states">
                                <div className="space-y-2">
                                    {[
                                        { label: 'Active Item', icon: Layout, active: true },
                                        { label: 'Hover State', icon: Grid, active: false },
                                        { label: 'Default Item', icon: Box, active: false },
                                    ].map((item, i) => (
                                        <div key={i} className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${item.active ? 'bg-[var(--accent-soft)] border-[var(--accent)]/20' : 'bg-[var(--bg-tertiary)] border-[var(--border-primary)] hover:bg-[var(--surface-hover)]'}`}>
                                            <div className="flex items-center gap-3">
                                                <item.icon size={16} className={item.active ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'} />
                                                <span className={`text-sm font-medium ${item.active ? 'text-[var(--accent)]' : ''}`}>{item.label}</span>
                                            </div>
                                            {item.active && <ChevronRight size={14} className="text-[var(--accent)]" />}
                                        </div>
                                    ))}
                                </div>
                            </SectionCard>

                            <SectionCard icon={Layout} title="Data Table" subtitle="Standard table styling">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-[var(--border-primary)]">
                                                <th className="text-left text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)] py-2 pr-4">Name</th>
                                                <th className="text-left text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)] py-2 pr-4">Role</th>
                                                <th className="text-right text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)] py-2 pr-4">Score</th>
                                                <th className="text-center text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)] py-2">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                { name: 'Araan Rahman', role: 'Senior Backend Eng.', score: 92, status: 'Interview', color: 'var(--success)' },
                                                { name: 'Priya Sharma', role: 'Frontend Eng.', score: 87, status: 'Screening', color: 'var(--warning)' },
                                                { name: 'Marcus Chen', role: 'DevOps', score: 81, status: 'Applied', color: 'var(--accent)' },
                                            ].map((row, i) => (
                                                <tr key={i} className="border-b border-[var(--border-primary)] hover:bg-[var(--surface-hover)]">
                                                    <td className="py-3 pr-4 font-medium">{row.name}</td>
                                                    <td className="py-3 pr-4 text-[var(--text-secondary)]">{row.role}</td>
                                                    <td className="py-3 pr-4 text-right font-semibold tabular-nums" style={{ color: 'var(--accent)' }}>{row.score}</td>
                                                    <td className="py-3 text-center">
                                                        <span className="px-2 py-1 rounded-full text-[10px] font-medium border" style={{ backgroundColor: `color-mix(in srgb, ${row.color} 10%, transparent)`, color: row.color, borderColor: `color-mix(in srgb, ${row.color} 25%, transparent)` }}>{row.status}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </SectionCard>
                        </div>
                    )}

                    {/* ============================================
                        CHARTS
                        ============================================ */}
                    {activeSection === 'charts' && (
                        <div className="space-y-6">
                            <SectionCard icon={BarChart3} title="Chart Palette" subtitle="6-color palette for data visualizations">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {[
                                        { name: 'Success', color: '#10b981', hex: '#10b981' },
                                        { name: 'Primary', color: '#6366f1', hex: '#6366f1' },
                                        { name: 'Warning', color: '#f59e0b', hex: '#f59e0b' },
                                        { name: 'Error', color: '#ec4899', hex: '#ec4899' },
                                        { name: 'Special', color: '#8b5cf6', hex: '#8b5cf6' },
                                        { name: 'Info', color: '#06b6d4', hex: '#06b6d4' },
                                    ].map((c, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 border border-[var(--border-primary)]" style={{ borderRadius: 'var(--radius-md)' }}>
                                            <div className="w-10 h-10 rounded-lg" style={{ backgroundColor: c.hex }} />
                                            <div>
                                                <div className="text-sm font-semibold">{c.name}</div>
                                                <code className="text-[11px] text-[var(--text-muted)]">{c.hex}</code>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </SectionCard>

                            <SectionCard icon={BarChart3} title="Bar Chart (mock)" subtitle="Vertical bars with hover state">
                                <div className="h-56 bg-[var(--bg-tertiary)] rounded-xl p-6 border border-[var(--border-primary)]">
                                    <div className="flex items-end justify-between h-full gap-3">
                                        {[
                                            { label: 'Jan', value: 65 },
                                            { label: 'Feb', value: 45 },
                                            { label: 'Mar', value: 80 },
                                            { label: 'Apr', value: 55 },
                                            { label: 'May', value: 90 },
                                            { label: 'Jun', value: 70 },
                                        ].map((item, i) => (
                                            <div key={i} className="flex-1 flex flex-col items-center">
                                                <div className="w-full bg-[var(--accent)]/60 rounded-t-lg transition-all hover:bg-[var(--accent)]" style={{ height: `${item.value}%` }} />
                                                <span className="text-[11px] font-medium mt-2 text-[var(--text-muted)]">{item.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </SectionCard>

                            <SectionCard icon={BarChart3} title="Donut Chart (mock)" subtitle="Proportional breakdown">
                                <div className="flex flex-wrap items-center gap-8">
                                    <div className="relative w-40 h-40">
                                        <svg viewBox="0 0 100 100" className="rotate-90">
                                            <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="14" strokeDasharray="75 251" />
                                            <circle cx="50" cy="50" r="40" fill="none" stroke="#6366f1" strokeWidth="14" strokeDasharray="50 251" strokeDashoffset="-75" />
                                            <circle cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" strokeWidth="14" strokeDasharray="63 251" strokeDashoffset="-125" />
                                            <circle cx="50" cy="50" r="40" fill="none" stroke="#ec4899" strokeWidth="14" strokeDasharray="63 251" strokeDashoffset="-188" />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold tabular-nums">251</div>
                                                <div className="text-[10px] text-[var(--text-muted)] uppercase">Total</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        {[
                                            { name: 'Hired', color: '#10b981', count: 75 },
                                            { name: 'Interview', color: '#6366f1', count: 50 },
                                            { name: 'Screening', color: '#f59e0b', count: 63 },
                                            { name: 'Rejected', color: '#ec4899', count: 63 },
                                        ].map((s, i) => (
                                            <div key={i} className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded" style={{ backgroundColor: s.color }} />
                                                    <span>{s.name}</span>
                                                </div>
                                                <span className="font-semibold tabular-nums">{s.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </SectionCard>
                        </div>
                    )}

                    {/* ============================================
                        OVERLAYS — modals, confirm dialogs, breadcrumbs
                        ============================================ */}
                    {activeSection === 'overlays' && (
                        <div className="space-y-6">
                            <SectionCard icon={MessageSquare} title="Modal Dialog" subtitle="Overlay with backdrop blur">
                                <button onClick={() => setModalOpen(true)} className="btn-primary">Open Modal</button>
                                {modalOpen && (
                                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={() => setModalOpen(false)}>
                                        <div className="bg-[var(--bg-elevated)] border border-[var(--border-primary)] w-full max-w-md" style={{ borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)' }} onClick={e => e.stopPropagation()}>
                                            <div className="p-5 border-b border-[var(--border-primary)] flex items-center justify-between">
                                                <h3 className="text-base font-semibold">Modal Title</h3>
                                                <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg hover:bg-[var(--danger)]/10 hover:text-[var(--danger)] transition-colors">
                                                    <X size={16} />
                                                </button>
                                            </div>
                                            <div className="p-5">
                                                <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>This is a modal example with glass card styling. Click outside or the X to close.</p>
                                                <div className="h-20 bg-[var(--bg-tertiary)] rounded-lg" />
                                            </div>
                                            <div className="p-5 border-t border-[var(--border-primary)] flex justify-end gap-2">
                                                <button onClick={() => setModalOpen(false)} className="btn-ghost">Cancel</button>
                                                <button onClick={() => setModalOpen(false)} className="btn-primary">Confirm</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </SectionCard>

                            <SectionCard icon={AlertTriangle} title="Confirm Dialog" subtitle="Destructive action confirmation">
                                <button onClick={() => setConfirmOpen(true)} className="px-4 py-2 bg-[var(--danger)]/10 border border-[var(--danger)]/20 rounded-lg text-xs font-medium text-[var(--danger)] hover:bg-[var(--danger)] hover:text-white transition-all">
                                    Delete Item
                                </button>
                                <ConfirmDialog
                                    isOpen={confirmOpen}
                                    onClose={() => setConfirmOpen(false)}
                                    onConfirm={() => { setConfirmOpen(false); toast('Item deleted.'); }}
                                    title="Delete Item?"
                                    message="This action cannot be undone. The item will be permanently removed."
                                    confirmText="Delete"
                                    danger
                                />
                            </SectionCard>

                            <SectionCard icon={ChevronRight} title="Breadcrumbs & Pagination" subtitle="Navigation patterns">
                                <div className="space-y-6">
                                    <div>
                                        <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)] mb-2">Breadcrumbs</div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <a href="#" className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">Home</a>
                                            <ChevronRight size={14} className="text-[var(--text-muted)]" />
                                            <a href="#" className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">Jobs</a>
                                            <ChevronRight size={14} className="text-[var(--text-muted)]" />
                                            <span className="text-[var(--accent)] font-semibold">Details</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)] mb-2">Pagination</div>
                                        <div className="flex items-center justify-between">
                                            <button className="px-3 py-1.5 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg text-xs font-medium hover:bg-[var(--surface-hover)]">Prev</button>
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map(p => (
                                                    <button key={p} className={`w-8 h-8 rounded-lg text-xs font-medium ${p === 1 ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-tertiary)] border border-[var(--border-primary)] hover:bg-[var(--surface-hover)]'}`}>{p}</button>
                                                ))}
                                            </div>
                                            <button className="px-3 py-1.5 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg text-xs font-medium hover:bg-[var(--surface-hover)]">Next</button>
                                        </div>
                                    </div>
                                </div>
                            </SectionCard>
                        </div>
                    )}

                    {/* ============================================
                        ACCESSIBILITY
                        ============================================ */}
                    {activeSection === 'accessibility' && (
                        <div className="space-y-6">
                            <SectionCard icon={Keyboard} title="Keyboard Navigation" subtitle="Visible focus rings for keyboard users">
                                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                    All interactive elements have a visible focus ring when navigated via keyboard.
                                    The <Code>--shadow-focus</Code> token creates a 3px indigo ring around the focused element.
                                    Try Tabbing through the buttons below.
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <button className="btn-primary">Focus me</button>
                                    <button className="btn-ghost">Then me</button>
                                    <button className="px-4 py-2 border border-[var(--border-primary)] rounded-lg text-xs font-medium hover:bg-[var(--surface-hover)]">And me</button>
                                    <input type="text" placeholder="Input too" className="input-soft px-4 py-2 text-sm" />
                                </div>
                                <CodeBlock code={`*:focus-visible {
  box-shadow: var(--shadow-focus);
  border-radius: var(--radius-sm);
}`}
                                id="a11y-code" expanded={expandedCode} toggle={toggleCode} copied={copiedCode} copy={copyToClipboard} />
                            </SectionCard>

                            <SectionCard icon={Keyboard} title="Skip Link" subtitle="First focusable element on every page">
                                <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                    A skip link is the first focusable element on every page. It's hidden off-screen
                                    until focused, then appears in the top-left corner — letting keyboard users jump
                                    straight to the main content.
                                </p>
                                <div className="p-4 border border-[var(--border-primary)]" style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                    <code className="text-xs">.skip-link</code>
                                    <p className="text-xs text-[var(--text-muted)] mt-1">Press Tab now to see this page's skip link appear.</p>
                                </div>
                            </SectionCard>

                            <SectionCard icon={Eye} title="Reduced Motion" subtitle="Respects user preference">
                                <p className="text-sm" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                    All animations and transitions respect the <Code>prefers-reduced-motion: reduce</Code>
                                    media query. When enabled, durations collapse to 0.01ms and smooth scroll is disabled.
                                </p>
                                <pre className="mt-3 p-3 rounded-lg text-xs overflow-x-auto" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
{`@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}`}
                                </pre>
                            </SectionCard>

                            <SectionCard icon={Smartphone} title="Responsive Breakpoints" subtitle="Mobile-first Tailwind breakpoints">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {[
                                        { prefix: 'default', width: '< 640px', desc: 'Mobile' },
                                        { prefix: 'sm:', width: '≥ 640px', desc: 'Large phone' },
                                        { prefix: 'md:', width: '≥ 768px', desc: 'Tablet' },
                                        { prefix: 'lg:', width: '≥ 1024px', desc: 'Desktop' },
                                    ].map(b => (
                                        <div key={b.prefix} className="p-3 border border-[var(--border-primary)]" style={{ borderRadius: 'var(--radius-md)' }}>
                                            <code className="text-xs font-mono font-semibold" style={{ color: 'var(--accent)' }}>{b.prefix}</code>
                                            <div className="text-xs text-[var(--text-secondary)] mt-1">{b.width}</div>
                                            <div className="text-[10px] text-[var(--text-muted)] mt-0.5">{b.desc}</div>
                                        </div>
                                    ))}
                                </div>
                            </SectionCard>
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="mt-16 pt-8 border-t border-[var(--border-primary)] text-center">
                    <p className="text-xs text-[var(--text-muted)]">
                        NexHire Design System · {sections.length} sections · {colorTokens.length} color tokens · Live components
                    </p>
                </div>
            </div>
        </div>
    );
};

/* ============================================================
   HELPER COMPONENTS
   ============================================================ */
const SectionCard = ({ icon: Icon, title, subtitle, children }) => (
    <div className="glass-card p-6 sm:p-8" style={{ borderRadius: 'var(--radius-xl)' }}>
        <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
                <div
                    className="w-9 h-9 flex items-center justify-center"
                    style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)', borderRadius: 'var(--radius-md)' }}
                >
                    <Icon size={18} strokeWidth={1.75} />
                </div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.01em' }}>
                    {title}
                </h2>
            </div>
            {subtitle && <p className="text-xs text-[var(--text-muted)] ml-12">{subtitle}</p>}
        </div>
        {children}
    </div>
);

const Code = ({ children }) => (
    <code className="px-1.5 py-0.5 rounded text-[11px] font-mono" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--accent)' }}>
        {children}
    </code>
);

const CodeBlock = ({ code, id, expanded, toggle, copied, copy }) => {
    const isExpanded = expanded[id];
    return (
        <div className="mt-4">
            <button
                onClick={() => toggle(id)}
                className="flex items-center gap-2 text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
            >
                {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                {isExpanded ? 'Hide code' : 'Show code'}
            </button>
            {isExpanded && (
                <div className="mt-2 relative">
                    <pre className="p-3 pr-10 rounded-lg text-xs overflow-x-auto" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                        {code}
                    </pre>
                    <button
                        onClick={() => copy(code, id)}
                        className="absolute top-2 right-2 p-1.5 rounded hover:bg-[var(--bg-elevated)]"
                    >
                        {copied === id ? <Check size={12} className="text-[var(--success)]" /> : <Copy size={12} className="text-[var(--text-muted)]" />}
                    </button>
                </div>
            )}
        </div>
    );
};

export default DesignSystemPage;

/*
 * DesignSystemPage: live component library at /design-system.
 * Showcases all design tokens, components, and patterns.
 * Includes: foundations, colors, typography, spacing, shadows,
 * motion, buttons, cards, forms, feedback, charts, overlays, a11y.
 * Features working dark mode toggle (applies .dark class to <html>).
 */

