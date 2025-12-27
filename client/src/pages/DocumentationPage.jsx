import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowLeft, BookOpen, Database, Code2, Table, Eye, Zap, Shield,
    Layers, Server, Cpu, Search, ChevronDown, ChevronRight,
    Boxes, GitBranch, FileText, Users, Lock, TrendingUp,
    ArrowRight, CheckCircle, X
} from 'lucide-react';
import { docData } from '../data/docData';

const DocumentationPage = () => {
    const [activeSection, setActiveSection] = useState('overview');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCards, setExpandedCards] = useState({});

    const toggleCard = (id) => {
        setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const stats = docData.stats;

    // Filter features based on search
    const filteredFeatures = useMemo(() => {
        if (!searchQuery.trim()) return docData.featuresByCategory;
        const q = searchQuery.toLowerCase();
        const result = {};
        Object.entries(docData.featuresByCategory).forEach(([cat, items]) => {
            const matched = items.filter(f =>
                f.feature.toLowerCase().includes(q) ||
                f.problem.toLowerCase().includes(q) ||
                f.solution.toLowerCase().includes(q) ||
                f.implementation.toLowerCase().includes(q)
            );
            if (matched.length > 0) result[cat] = matched;
        });
        return result;
    }, [searchQuery]);

    const navSections = [
        { id: 'overview', label: 'Overview', icon: BookOpen },
        { id: 'architecture', label: 'Architecture', icon: Layers },
        { id: 'roles', label: 'User Roles', icon: Users },
        { id: 'features', label: 'Features', icon: Zap },
        { id: 'tables', label: 'Database Tables', icon: Table },
        { id: 'views', label: 'Views', icon: Eye },
        { id: 'procedures', label: 'Stored Procedures', icon: Code2 },
        { id: 'triggers', label: 'Triggers', icon: GitBranch },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'deployment', label: 'Deployment', icon: Server },
    ];

    return (
        <div className="min-h-[100dvh]" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            {/* Top Nav */}
            <nav className="sticky top-0 z-40 mx-auto max-w-7xl mt-3 sm:mt-4 px-3 sm:px-4">
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
                    <div className="flex items-center gap-2">
                        <BookOpen size={16} className="text-[var(--accent)]" />
                        <span className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
                            Documentation
                        </span>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-6 pb-16">
                <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
                    {/* Sidebar */}
                    <aside className="lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto">
                        <div
                            className="p-4 border border-[var(--border-primary)]"
                            style={{
                                backgroundColor: 'var(--bg-elevated)',
                                borderRadius: 'var(--radius-xl)',
                            }}
                        >
                            <div className="eyebrow mb-3">Contents</div>
                            <nav className="space-y-1">
                                {navSections.map(section => (
                                    <button
                                        key={section.id}
                                        onClick={() => {
                                            setActiveSection(section.id);
                                            document.getElementById(`section-${section.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                        }}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm rounded-lg transition-colors ${
                                            activeSection === section.id
                                                ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-semibold'
                                                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-accent)] hover:text-[var(--text-primary)]'
                                        }`}
                                    >
                                        <section.icon size={15} strokeWidth={1.75} />
                                        {section.label}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main id="main-content" className="min-w-0 space-y-12">
                        {/* Hero */}
                        <div>
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
                                <BookOpen size={11} strokeWidth={2.5} />
                                System Documentation
                            </div>
                            <h1
                                className="mb-4"
                                style={{
                                    fontFamily: 'var(--font-display)',
                                    fontSize: 'clamp(2rem, 4vw, 3rem)',
                                    fontWeight: 700,
                                    lineHeight: 1.1,
                                    letterSpacing: '-0.02em',
                                }}
                            >
                                NexHire Documentation
                            </h1>
                            <p
                                className="max-w-2xl"
                                style={{
                                    fontSize: '1.05rem',
                                    color: 'var(--text-secondary)',
                                    lineHeight: 1.6,
                                }}
                            >
                                A professional-grade recruitment platform built on PostgreSQL.
                                Real-time matching, automated workflows, and deep analytics —
                                powered by 25+ stored procedures, 28 views, and 96 features.
                            </p>
                        </div>

                        {/* Stats Grid */}
                        <div id="section-overview" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 scroll-mt-20">
                            {[
                                { label: 'Features', value: stats.features, icon: Zap, color: 'var(--accent)' },
                                { label: 'Tables', value: stats.tables, icon: Table, color: 'var(--success)' },
                                { label: 'Views', value: stats.views, icon: Eye, color: 'var(--warning)' },
                                { label: 'Procedures', value: stats.procedures, icon: Code2, color: 'var(--accent)' },
                                { label: 'Triggers', value: stats.triggers, icon: GitBranch, color: 'var(--danger)' },
                                { label: 'Categories', value: stats.categories, icon: Boxes, color: 'var(--success)' },
                            ].map((s, i) => (
                                <div
                                    key={i}
                                    className="p-4 border border-[var(--border-primary)]"
                                    style={{
                                        backgroundColor: 'var(--bg-elevated)',
                                        borderRadius: 'var(--radius-xl)',
                                    }}
                                >
                                    <s.icon size={18} strokeWidth={1.75} style={{ color: s.color }} />
                                    <div className="text-2xl font-bold mt-2 tabular-nums">{s.value}</div>
                                    <div className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wide">{s.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Overview Section */}
                        <section id="section-overview" className="scroll-mt-20">
                            <SectionHeader icon={BookOpen} title="Overview" subtitle="What NexHire is and why it exists" />
                            <div className="space-y-4">
                                <Card>
                                    <p style={{ fontSize: '0.95rem', lineHeight: 1.65, color: 'var(--text-secondary)' }}>
                                        <strong style={{ color: 'var(--text-primary)' }}>NexHire</strong> is a comprehensive recruitment
                                        management platform that streamlines the entire hiring process — from job posting and candidate
                                        discovery, through screening and interviews, to hiring and onboarding. It serves three distinct
                                        user roles: Administrators, Recruiters, and Candidates, each with their own dashboard and
                                        specialized toolset.
                                    </p>
                                    <p style={{ fontSize: '0.95rem', lineHeight: 1.65, color: 'var(--text-secondary)', marginTop: '1rem' }}>
                                        The platform is built on a modern DBMS architecture that leverages PostgreSQL's advanced
                                        features: stored procedures for business logic, views for computed analytics, triggers for
                                        automated actions, and CLR integration for .NET-powered functions like sentiment analysis,
                                        fuzzy string matching, and timezone conversion.
                                    </p>
                                </Card>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {[
                                        { icon: Zap, title: 'Intelligent Matching', desc: 'AI-powered candidate-job matching using weighted skill, experience, and location scoring.' },
                                        { icon: Shield, title: 'Bias Detection', desc: 'Built-in diversity analytics and bias detection to ensure fair hiring practices.' },
                                        { icon: TrendingUp, title: 'Deep Analytics', desc: 'Real-time metrics for hiring performance, market intelligence, and pipeline bottlenecks.' },
                                    ].map((item, i) => (
                                        <div
                                            key={i}
                                            className="p-5 border border-[var(--border-primary)]"
                                            style={{ backgroundColor: 'var(--bg-elevated)', borderRadius: 'var(--radius-xl)' }}
                                        >
                                            <div
                                                className="w-9 h-9 flex items-center justify-center mb-3"
                                                style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)', borderRadius: 'var(--radius-md)' }}
                                            >
                                                <item.icon size={16} strokeWidth={1.75} />
                                            </div>
                                            <h4 className="text-sm font-semibold mb-1">{item.title}</h4>
                                            <p className="text-xs text-[var(--text-muted)]" style={{ lineHeight: 1.5 }}>{item.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Architecture Section */}
                        <section id="section-architecture" className="scroll-mt-20">
                            <SectionHeader icon={Layers} title="Architecture" subtitle="Technology stack and system design" />
                            <Card>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                            <Server size={15} className="text-[var(--accent)]" /> Backend
                                        </h4>
                                        <ul className="space-y-2 text-xs" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                            <li><strong style={{ color: 'var(--text-primary)' }}>Runtime:</strong> Node.js + Express.js</li>
                                            <li><strong style={{ color: 'var(--text-primary)' }}>Database:</strong> PostgreSQL (Neon cloud hosting)</li>
                                            <li><strong style={{ color: 'var(--text-primary)' }}>Authentication:</strong> Role-based access control (RBAC)</li>
                                            <li><strong style={{ color: 'var(--text-primary)' }}>API:</strong> RESTful JSON endpoints under /api</li>
                                            <li><strong style={{ color: 'var(--text-primary)' }}>Deployment:</strong> Vercel serverless functions</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                            <Cpu size={15} className="text-[var(--accent)]" /> Frontend
                                        </h4>
                                        <ul className="space-y-2 text-xs" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                            <li><strong style={{ color: 'var(--text-primary)' }}>Framework:</strong> React 19 + Vite</li>
                                            <li><strong style={{ color: 'var(--text-primary)' }}>Routing:</strong> React Router 7</li>
                                            <li><strong style={{ color: 'var(--text-primary)' }}>Styling:</strong> Tailwind CSS 4 + CSS custom properties</li>
                                            <li><strong style={{ color: 'var(--text-primary)' }}>Charts:</strong> Recharts</li>
                                            <li><strong style={{ color: 'var(--text-primary)' }}>Icons:</strong> Lucide React</li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="mt-6 pt-6 border-t border-[var(--border-primary)]">
                                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                        <Database size={15} className="text-[var(--accent)]" /> Database Layer
                                    </h4>
                                    <p className="text-xs" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                        The database is the heart of NexHire. Business logic lives in {stats.procedures} stored procedures,
                                        computed analytics in {stats.views} views, and automated actions in {stats.triggers} triggers.
                                        The DB layer auto-maps lowercase PostgreSQL column names to PascalCase for frontend compatibility,
                                        and rounds long-decimal NUMERIC values for clean UI display.
                                    </p>
                                </div>
                            </Card>
                        </section>

                        {/* User Roles Section */}
                        <section id="section-roles" className="scroll-mt-20">
                            <SectionHeader icon={Users} title="User Roles" subtitle="Three distinct user types with specialized dashboards" />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    {
                                        role: 'Administrator',
                                        roleId: 1,
                                        color: 'var(--accent)',
                                        icon: Shield,
                                        desc: 'Full system access, analytics, compliance, and platform management.',
                                        features: ['Core Analytics Dashboard', 'Bias Detection & Logs', 'Diversity Goals', 'Market Intelligence', 'Salary Transparency', 'Remote Work Analytics', 'Consent Management', 'Email Queue Manager', 'Security Logs', 'SQL Views Explorer', 'System Maintenance']
                                    },
                                    {
                                        role: 'Recruiter',
                                        roleId: 2,
                                        color: 'var(--success)',
                                        icon: Users,
                                        desc: 'Job posting management, candidate sourcing, screening, and hiring workflows.',
                                        features: ['Job Roles & Postings', 'Talent Pool', 'Interview Scheduling', 'Video Interviews', 'Skill Verification', 'Background Checks', 'Candidate Engagement', 'Hire Analytics', 'Ghosting Risk Analysis', 'AI Question Generator', 'Hire Success Predictor', 'Onboarding Predictor', 'Blockchain Verifications', 'Referral Intelligence', 'Market Alerts']
                                    },
                                    {
                                        role: 'Candidate',
                                        roleId: 3,
                                        color: 'var(--warning)',
                                        icon: BookOpen,
                                        desc: 'Job discovery, applications, skill assessments, and career development tools.',
                                        features: ['Job Discovery & Matching', 'Application Pipeline', 'Interview Schedule', 'Interview Prep', 'Skills Profile', 'Skill Gap Analysis', 'Learning Paths', 'Career Path Simulator', 'Resume Score', 'Salary Coach', 'Achievements & Leaderboard', 'Location Preferences']
                                    },
                                ].map(r => (
                                    <Card key={r.roleId}>
                                        <div
                                            className="w-11 h-11 flex items-center justify-center mb-4"
                                            style={{ backgroundColor: `color-mix(in srgb, ${r.color} 12%, transparent)`, color: r.color, borderRadius: 'var(--radius-md)' }}
                                        >
                                            <r.icon size={20} strokeWidth={1.75} />
                                        </div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <h4 className="text-base font-semibold">{r.role}</h4>
                                            <span
                                                className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                                                style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}
                                            >
                                                RoleID {r.roleId}
                                            </span>
                                        </div>
                                        <p className="text-xs text-[var(--text-muted)] mb-4" style={{ lineHeight: 1.5 }}>{r.desc}</p>
                                        <div className="space-y-1.5">
                                            {r.features.map((f, i) => (
                                                <div key={i} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                                                    <CheckCircle size={12} style={{ color: r.color, flexShrink: 0 }} />
                                                    {f}
                                                </div>
                                            ))}
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </section>

                        {/* Features Section */}
                        <section id="section-features" className="scroll-mt-20">
                            <SectionHeader icon={Zap} title="Features" subtitle={`${stats.features} features across ${stats.categories} categories`} />
                            <div className="mb-4">
                                <div
                                    className="flex items-center gap-2 px-4 py-2.5 border border-[var(--border-primary)]"
                                    style={{ backgroundColor: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}
                                >
                                    <Search size={15} className="text-[var(--text-muted)]" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search features..."
                                        className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--text-muted)]"
                                    />
                                    {searchQuery && (
                                        <button onClick={() => setSearchQuery('')} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-4">
                                {Object.entries(filteredFeatures).map(([category, items]) => (
                                    <div key={category}>
                                        <h4 className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)] mb-2 px-1">
                                            {category} <span className="text-[var(--text-muted)] opacity-60">({items.length})</span>
                                        </h4>
                                        <div className="space-y-2">
                                            {items.map((f, i) => {
                                                const cardId = `feature-${category}-${i}`;
                                                const isExpanded = expandedCards[cardId];
                                                return (
                                                    <div
                                                        key={cardId}
                                                        className="border border-[var(--border-primary)] overflow-hidden"
                                                        style={{ backgroundColor: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}
                                                    >
                                                        <button
                                                            onClick={() => toggleCard(cardId)}
                                                            className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-[var(--bg-accent)] transition-colors"
                                                        >
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="text-sm font-semibold">{f.feature}</span>
                                                                    {f.clrEnhanced === 'Yes' && (
                                                                        <span
                                                                            className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase"
                                                                            style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}
                                                                        >
                                                                            CLR
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-xs text-[var(--text-muted)] truncate">{f.problem}</p>
                                                            </div>
                                                            {isExpanded ? <ChevronDown size={16} className="text-[var(--text-muted)] shrink-0" /> : <ChevronRight size={16} className="text-[var(--text-muted)] shrink-0" />}
                                                        </button>
                                                        {isExpanded && (
                                                            <div className="px-4 pb-4 space-y-3 border-t border-[var(--border-primary)] pt-3">
                                                                <div>
                                                                    <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)] mb-1">Problem</div>
                                                                    <p className="text-xs" style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{f.problem}</p>
                                                                </div>
                                                                <div>
                                                                    <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)] mb-1">Solution</div>
                                                                    <p className="text-xs" style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{f.solution}</p>
                                                                </div>
                                                                <div>
                                                                    <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)] mb-1">Implementation</div>
                                                                    <p className="text-xs" style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{f.implementation}</p>
                                                                </div>
                                                                {(f.tables || f.procedures || f.views) && (
                                                                    <div className="flex flex-wrap gap-2 pt-1">
                                                                        {f.tables && <Tag label="Tables" value={f.tables} />}
                                                                        {f.procedures && <Tag label="Procedures" value={f.procedures} />}
                                                                        {f.views && <Tag label="Views" value={f.views} />}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                                {Object.keys(filteredFeatures).length === 0 && (
                                    <div className="text-center py-12 text-[var(--text-muted)]">
                                        <Search size={32} className="mx-auto mb-3 opacity-30" />
                                        <p className="text-sm">No features match "{searchQuery}"</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Tables Section */}
                        <section id="section-tables" className="scroll-mt-20">
                            <SectionHeader icon={Table} title="Database Tables" subtitle={`${stats.tables} tables organized by functional group`} />
                            <div className="space-y-4">
                                {Object.entries(docData.tableGroups).map(([group, items]) => (
                                    <div key={group}>
                                        <h4 className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)] mb-2 px-1">
                                            {group} <span className="opacity-60">({items.length})</span>
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {items.map((t, i) => (
                                                <div
                                                    key={i}
                                                    className="p-3 border border-[var(--border-primary)]"
                                                    style={{ backgroundColor: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}
                                                >
                                                    <div className="flex items-center justify-between mb-1">
                                                        <code className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>{t.name}</code>
                                                        <span className="text-[10px] text-[var(--text-muted)] tabular-nums">{t.columnCount} cols</span>
                                                    </div>
                                                    <p className="text-xs text-[var(--text-muted)]" style={{ lineHeight: 1.4 }}>{t.description}</p>
                                                    {t.primaryKey && t.primaryKey !== 'None' && (
                                                        <div className="mt-2 text-[10px] text-[var(--text-muted)]">
                                                            <strong>PK:</strong> <code>{t.primaryKey}</code>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Views Section */}
                        <section id="section-views" className="scroll-mt-20">
                            <SectionHeader icon={Eye} title="Views" subtitle={`${stats.views} views for computed analytics and reporting`} />
                            <div className="space-y-4">
                                {Object.entries(docData.viewGroups).map(([group, items]) => (
                                    <div key={group}>
                                        <h4 className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)] mb-2 px-1">
                                            {group} <span className="opacity-60">({items.length})</span>
                                        </h4>
                                        <div className="space-y-2">
                                            {items.map((v, i) => (
                                                <div
                                                    key={i}
                                                    className="p-4 border border-[var(--border-primary)]"
                                                    style={{ backgroundColor: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}
                                                >
                                                    <code className="text-sm font-semibold block mb-1" style={{ color: 'var(--accent)' }}>{v.name}</code>
                                                    <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{v.description}</p>
                                                    {v.dataSources && (
                                                        <div className="text-[10px] text-[var(--text-muted)]">
                                                            <strong>Sources:</strong> {v.dataSources}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Procedures Section */}
                        <section id="section-procedures" className="scroll-mt-20">
                            <SectionHeader icon={Code2} title="Stored Procedures" subtitle={`${stats.procedures} procedures handling business logic at the data layer`} />
                            <div className="space-y-4">
                                {Object.entries(docData.procedureGroups).map(([group, items]) => (
                                    <div key={group}>
                                        <h4 className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)] mb-2 px-1">
                                            {group} <span className="opacity-60">({items.length})</span>
                                        </h4>
                                        <div className="space-y-2">
                                            {items.map((p, i) => (
                                                <div
                                                    key={i}
                                                    className="p-4 border border-[var(--border-primary)]"
                                                    style={{ backgroundColor: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <code className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>{p.name}</code>
                                                        {p.returnType && (
                                                            <span className="text-[10px] text-[var(--text-muted)] font-mono">{p.returnType}</span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{p.description}</p>
                                                    {p.parameters && (
                                                        <div className="mt-2 p-2 rounded font-mono text-[11px] overflow-x-auto" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                                                            <span className="text-[var(--text-muted)]">params: </span>{p.parameters}
                                                        </div>
                                                    )}
                                                    {p.tablesAffected && (
                                                        <div className="mt-2 text-[10px] text-[var(--text-muted)]">
                                                            <strong>Affects:</strong> {p.tablesAffected}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Triggers Section */}
                        <section id="section-triggers" className="scroll-mt-20">
                            <SectionHeader icon={GitBranch} title="Triggers" subtitle={`${stats.triggers} triggers for automated database actions`} />
                            <div className="space-y-2">
                                {docData.triggers.map((t, i) => (
                                    <div
                                        key={i}
                                        className="p-4 border border-[var(--border-primary)]"
                                        style={{ backgroundColor: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <code className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>{t.name}</code>
                                            {t.table && (
                                                <span className="text-[10px] text-[var(--text-muted)] font-mono">on {t.table}</span>
                                            )}
                                        </div>
                                        {t.description && (
                                            <p className="text-xs" style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{t.description}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Security Section */}
                        <section id="section-security" className="scroll-mt-20">
                            <SectionHeader icon={Lock} title="Security" subtitle="Authentication, authorization, and data protection" />
                            <Card>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                            <Lock size={14} className="text-[var(--accent)]" /> Role-Based Access Control (RBAC)
                                        </h4>
                                        <p className="text-xs" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                            Every API endpoint is protected by the <code style={{ color: 'var(--accent)' }}>protect</code> middleware,
                                            which checks for user identity via headers. The <code style={{ color: 'var(--accent)' }}>authorize</code> middleware
                                            restricts endpoints to specific role IDs (1=Admin, 2=Recruiter, 3=Candidate). Unauthorized requests
                                            receive 401/403 responses.
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                            <Shield size={14} className="text-[var(--accent)]" /> Password Verification
                                        </h4>
                                        <p className="text-xs" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                            Passwords are stored as hashes and verified via PostgreSQL's <code style={{ color: 'var(--accent)' }}>verifypassword()</code> function.
                                            A development bypass allows empty passwords for demo accounts.
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                            <FileText size={14} className="text-[var(--accent)]" /> GDPR & Consent Management
                                        </h4>
                                        <p className="text-xs" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                            Built-in consent tracking with expiry checks, PII anonymization for archived candidates,
                                            and comprehensive audit logging of all data mutations.
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                            <Cpu size={14} className="text-[var(--accent)]" /> CLR Integration
                                        </h4>
                                        <p className="text-xs" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                            .NET CLR functions handle email validation, disposable email detection, sentiment analysis,
                                            and fuzzy string matching — pushing computationally expensive operations to the database layer.
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </section>

                        {/* Deployment Section */}
                        <section id="section-deployment" className="scroll-mt-20">
                            <SectionHeader icon={Server} title="Deployment" subtitle="How NexHire is built and deployed" />
                            <Card>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-semibold mb-2">Vercel Serverless</h4>
                                        <p className="text-xs" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                            The frontend is built with Vite and served as static assets. The Express backend runs as
                                            a Vercel serverless function under <code style={{ color: 'var(--accent)' }}>/api</code>, with
                                            a 60-second timeout and 1024MB memory limit.
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold mb-2">Neon PostgreSQL</h4>
                                        <p className="text-xs" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                            The database is hosted on Neon (serverless PostgreSQL) with SSL-enabled connection pooling.
                                            Connection strings are configured via the <code style={{ color: 'var(--accent)' }}>DB_CONNECTION_STRING</code> environment variable.
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold mb-2">Demo Accounts</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                                            {[
                                                { user: 'admin1', role: 'Administrator', id: 1 },
                                                { user: 'recruiter1', role: 'Recruiter', id: 2 },
                                                { user: 'candidate1', role: 'Candidate', id: 3 },
                                            ].map(a => (
                                                <div
                                                    key={a.id}
                                                    className="p-3 border border-[var(--border-primary)]"
                                                    style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}
                                                >
                                                    <code className="text-xs font-semibold block" style={{ color: 'var(--accent)' }}>{a.user}</code>
                                                    <span className="text-[10px] text-[var(--text-muted)]">{a.role}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-[11px] text-[var(--text-muted)] mt-2">
                                            Password field can be left empty for demo accounts (dev bypass).
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </section>

                        {/* CTA */}
                        <div
                            className="p-8 border border-[var(--accent)]/20 text-center"
                            style={{ backgroundColor: 'var(--accent-soft)', borderRadius: 'var(--radius-xl)' }}
                        >
                            <h3 className="text-lg font-semibold mb-2">Ready to explore?</h3>
                            <p className="text-sm text-[var(--text-secondary)] mb-4">
                                Access the live demo system with all three role dashboards.
                            </p>
                            <Link
                                to="/login"
                                className="btn-primary inline-flex items-center gap-2"
                                style={{ textDecoration: 'none', padding: '0.75rem 1.5rem', fontSize: '14px' }}
                            >
                                Access Demo System <ArrowRight size={15} strokeWidth={2} />
                            </Link>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

// Helper components
const SectionHeader = ({ icon: Icon, title, subtitle }) => (
    <div className="mb-5">
        <div className="flex items-center gap-3 mb-1">
            <div
                className="w-9 h-9 flex items-center justify-center"
                style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)', borderRadius: 'var(--radius-md)' }}
            >
                <Icon size={18} strokeWidth={1.75} />
            </div>
            <h2
                style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    letterSpacing: '-0.01em',
                }}
            >
                {title}
            </h2>
        </div>
        <p className="text-sm text-[var(--text-muted)] ml-12">{subtitle}</p>
    </div>
);

const Card = ({ children }) => (
    <div
        className="p-6 border border-[var(--border-primary)]"
        style={{ backgroundColor: 'var(--bg-elevated)', borderRadius: 'var(--radius-xl)' }}
    >
        {children}
    </div>
);

const Tag = ({ label, value }) => (
    <div
        className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px]"
        style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
    >
        <strong style={{ color: 'var(--text-muted)' }}>{label}:</strong>
        <span className="font-mono">{value}</span>
    </div>
);

export default DocumentationPage;
