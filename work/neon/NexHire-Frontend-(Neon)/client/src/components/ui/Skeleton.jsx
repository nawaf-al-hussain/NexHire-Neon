import React from 'react';

/**
 * Skeleton loader primitives — shimmer-based, theme-aware.
 * Used for in-page loading states (not for chunk-load FOUC; use TabLoader for that).
 *
 * Respects prefers-reduced-motion: animation pauses when reduced motion is requested.
 */
const baseShimmer = {
    backgroundColor: 'var(--bg-tertiary)',
    animation: 'skeleton-pulse 1.5s ease-in-out infinite alternate',
};

export const Skeleton = ({ className = '', width, height, rounded = 'var(--radius-md)', style = {} }) => (
    <div
        aria-hidden="true"
        className={className}
        style={{
            ...baseShimmer,
            width: width || '100%',
            height: height || '1rem',
            borderRadius: rounded,
            ...style,
        }}
    />
);

export const SkeletonText = ({ lines = 3, className = '', lineClassName = '' }) => (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }} aria-hidden="true">
        {Array.from({ length: lines }).map((_, i) => (
            <Skeleton
                key={i}
                className={lineClassName}
                height="0.75rem"
                width={i === lines - 1 ? '60%' : '100%'}
            />
        ))}
    </div>
);

export const SkeletonCard = ({ className = '', lines = 3 }) => (
    <div
        className={className}
        style={{
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.875rem',
        }}
        aria-hidden="true"
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Skeleton width="2.5rem" height="2.5rem" rounded="var(--radius-md)" />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <Skeleton height="0.875rem" width="60%" />
                <Skeleton height="0.625rem" width="40%" />
            </div>
        </div>
        <SkeletonText lines={lines} />
    </div>
);

export default Skeleton;
