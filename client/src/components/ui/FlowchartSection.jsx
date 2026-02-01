import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Loader2, AlertCircle, GitBranch } from 'lucide-react';
import { flowchartMermaid, flowchartLegend } from '../../data/flowchartData';

// Singleton promise to ensure mermaid.js is loaded only once across all instances
let mermaidLoadPromise = null;

const loadMermaid = () => {
    if (window.mermaid) return Promise.resolve(window.mermaid);
    if (mermaidLoadPromise) return mermaidLoadPromise;

    mermaidLoadPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js';
        script.async = true;
        script.onload = () => {
            if (window.mermaid) {
                window.mermaid.initialize({
                    startOnLoad: false,
                    theme: 'base',
                    securityLevel: 'loose',
                    flowchart: {
                        useMaxWidth: false,
                        htmlLabels: true,
                        curve: 'basis',
                        padding: 20,
                    },
                    themeVariables: {
                        fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                        fontSize: '14px',
                        primaryColor: '#eef2ff',
                        primaryTextColor: '#0a0a0a',
                        primaryBorderColor: '#4f46e5',
                        lineColor: '#a3a3a3',
                        secondaryColor: '#f4f4f5',
                        tertiaryColor: '#fafafa',
                    },
                });
                resolve(window.mermaid);
            } else {
                reject(new Error('Mermaid failed to load'));
            }
        };
        script.onerror = () => reject(new Error('Failed to load Mermaid from CDN'));
        document.head.appendChild(script);
    });

    return mermaidLoadPromise;
};

const FlowchartSection = () => {
    const [status, setStatus] = useState('idle'); // idle | loading | rendered | error
    const [errorMsg, setErrorMsg] = useState('');
    const [zoom, setZoom] = useState(0.75);
    const [svgDims, setSvgDims] = useState({ w: 0, h: 0 });
    const containerRef = useRef(null);
    const renderId = useRef(0);

    const renderDiagram = useCallback(async () => {
        const myRenderId = ++renderId.current;
        setStatus('loading');
        setErrorMsg('');

        try {
            const mermaid = await loadMermaid();
            if (myRenderId !== renderId.current) return; // stale

            // Generate unique ID for this render
            const diagramId = `flowchart-diagram-${Date.now()}`;

            // Use mermaid.render() which returns an SVG string
            const { svg } = await mermaid.render(diagramId, flowchartMermaid);

            if (myRenderId !== renderId.current) return; // stale

            if (containerRef.current) {
                containerRef.current.innerHTML = svg;
                // Make the SVG responsive
                const svgEl = containerRef.current.querySelector('svg');
                if (svgEl) {
                    svgEl.style.maxWidth = 'none';
                    svgEl.style.height = 'auto';
                    // Apply zoom transform to the SVG itself (not the container)
                    // so the container's layout size matches the visual size
                    svgEl.style.transformOrigin = 'top left';
                    svgEl.style.transition = 'transform 0.2s ease-out';
                    // Capture dimensions for sizing the scrollable container
                    const w = parseFloat(svgEl.getAttribute('width')) || 0;
                    const h = parseFloat(svgEl.getAttribute('height')) || 0;
                    setSvgDims({ w, h });
                }
            }
            setStatus('rendered');
        } catch (err) {
            if (myRenderId !== renderId.current) return;
            console.error('Mermaid render error:', err);
            setErrorMsg(err.message || 'Unknown error');
            setStatus('error');
        }
    }, []);

    // Apply zoom transform to the SVG element directly (not the container)
    // so the container's layout size matches the visual size exactly
    useEffect(() => {
        if (containerRef.current && status === 'rendered') {
            const svgEl = containerRef.current.querySelector('svg');
            if (svgEl) {
                svgEl.style.transform = `scale(${zoom})`;
            }
        }
    }, [zoom, status, svgDims]);

    // Render when section becomes visible (via IntersectionObserver)
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && status === 'idle') {
                    renderDiagram();
                }
            },
            { rootMargin: '200px' }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, [status, renderDiagram]);

    const handleZoomIn = () => setZoom(z => Math.min(z + 0.15, 2));
    const handleZoomOut = () => setZoom(z => Math.max(z - 0.15, 0.3));
    const handleReset = () => setZoom(0.75);

    return (
        <section id="section-flowchart" className="scroll-mt-20">
            {/* Section Header */}
            <div className="mb-5">
                <div className="flex items-center gap-3 mb-1">
                    <div
                        className="w-9 h-9 flex items-center justify-center"
                        style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)', borderRadius: 'var(--radius-md)' }}
                    >
                        <GitBranch size={18} strokeWidth={1.75} />
                    </div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
                        System Flowchart
                    </h2>
                </div>
                <p className="text-sm text-[var(--text-muted)] ml-12">
                    Complete action flow across all 3 user roles — Admin, Recruiter, and Candidate
                </p>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mb-4 p-4 border border-[var(--border-primary)]" style={{ backgroundColor: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                {flowchartLegend.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color, border: '2px solid rgba(0,0,0,0.1)' }} />
                        <div>
                            <span className="text-xs font-semibold">{item.label}</span>
                            <span className="text-[10px] text-[var(--text-muted)] ml-1.5 hidden sm:inline">{item.desc}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-[var(--text-muted)]">
                    💡 Scroll vertically and horizontally to explore the full diagram. Use zoom controls to adjust. Dotted lines connect platform features (chatbot, notifications, theme) to all dashboards.
                </p>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleZoomOut}
                        disabled={zoom <= 0.3}
                        className="p-2 border border-[var(--border-primary)] rounded-lg hover:bg-[var(--surface-hover)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Zoom out"
                    >
                        <ZoomOut size={16} />
                    </button>
                    <span className="text-xs font-medium tabular-nums w-12 text-center">{Math.round(zoom * 100)}%</span>
                    <button
                        onClick={handleZoomIn}
                        disabled={zoom >= 2}
                        className="p-2 border border-[var(--border-primary)] rounded-lg hover:bg-[var(--surface-hover)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Zoom in"
                    >
                        <ZoomIn size={16} />
                    </button>
                    <button
                        onClick={handleReset}
                        className="p-2 border border-[var(--border-primary)] rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
                        title="Reset zoom"
                    >
                        <Maximize2 size={16} />
                    </button>
                </div>
            </div>

            {/* Diagram Container — scrollable with zoom */}
            <div
                className="border border-[var(--border-primary)] overflow-auto"
                style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-xl)',
                    height: '75vh',
                    position: 'relative',
                }}
            >
                {status === 'idle' && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-6 h-6 text-[var(--accent)] animate-spin" />
                        <span className="ml-3 text-sm text-[var(--text-muted)]">Preparing diagram...</span>
                    </div>
                )}
                {status === 'loading' && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-6 h-6 text-[var(--accent)] animate-spin" />
                        <span className="ml-3 text-sm text-[var(--text-muted)]">Rendering flowchart (this may take a few seconds)...</span>
                    </div>
                )}
                {status === 'error' && (
                    <div className="flex flex-col items-center justify-center py-20 px-4">
                        <AlertCircle className="w-10 h-10 text-[var(--danger)] mb-3" />
                        <p className="text-sm font-semibold text-[var(--danger)] mb-1">Failed to render flowchart</p>
                        <p className="text-xs text-[var(--text-muted)] mb-4 text-center max-w-md">{errorMsg}</p>
                        <button
                            onClick={() => { setStatus('idle'); renderDiagram(); }}
                            className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-xs font-medium hover:bg-[var(--accent-hover)] transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                )}
                <div
                    ref={containerRef}
                    style={{
                        display: status === 'rendered' ? 'inline-block' : 'block',
                        padding: '1rem',
                        margin: 0,
                        opacity: status === 'rendered' ? 1 : 0,
                        // Container layout size = scaled SVG dims + padding
                        // This makes the scrollbar match the visual content
                        width: status === 'rendered' && svgDims.w ? `${svgDims.w * zoom + 32}px` : 'auto',
                        height: status === 'rendered' && svgDims.h ? `${svgDims.h * zoom + 32}px` : 'auto',
                    }}
                />
            </div>

            {/* Stats below diagram */}
            {status === 'rendered' && (
                <div className="mt-3 grid grid-cols-2 md:grid-cols-7 gap-2 text-center">
                    {[
                        { label: 'Entry', count: 5, color: '#94a3b8' },
                        { label: 'Security', count: 3, color: '#ff6b9d' },
                        { label: 'Admin', count: 24, color: '#ff6b6b' },
                        { label: 'Recruiter', count: 44, color: '#4dabf7' },
                        { label: 'Candidate', count: 33, color: '#51cf66' },
                        { label: 'Process', count: 18, color: '#ffd43b' },
                        { label: 'Platform', count: 3, color: '#a78bfa' },
                    ].map((s, i) => (
                        <div key={i} className="p-2 border border-[var(--border-primary)]" style={{ backgroundColor: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)' }}>
                            <div className="w-2 h-2 rounded-full mx-auto mb-1" style={{ backgroundColor: s.color }} />
                            <div className="text-sm font-bold tabular-nums">{s.count}</div>
                            <div className="text-[10px] text-[var(--text-muted)]">{s.label}</div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
};

export default FlowchartSection;
