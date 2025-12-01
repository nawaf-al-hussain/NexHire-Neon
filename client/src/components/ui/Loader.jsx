import React from 'react';

/**
 * Shared loading spinner — uses design tokens (not hardcoded colors).
 * Replaces the 4 duplicated TabLoader/RouteLoader components.
 */
const Loader = ({ size = 32, label = 'Loading…' }) => (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: size >= 32 ? '100vh' : 'auto',
        padding: size >= 32 ? '2rem' : '1rem',
        fontFamily: 'var(--font-sans)',
        color: 'var(--text-muted)',
    }}>
        <div style={{ textAlign: 'center' }}>
            <div style={{
                width: `${size}px`,
                height: `${size}px`,
                border: `${Math.max(2, size / 12)}px solid var(--bg-tertiary)`,
                borderTopColor: 'var(--accent)',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto 12px',
            }} />
            {label && <div style={{ fontSize: '14px' }}>{label}</div>}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    </div>
);

export default Loader;
