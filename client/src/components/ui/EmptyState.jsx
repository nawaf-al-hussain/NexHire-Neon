import React from 'react';

/**
 * EmptyState — designed "no data yet" panel.
 * Replaces ad-hoc "No X Yet" border-dashed panels across the app.
 *
 * Props:
 *  - icon: Lucide component (optional)
 *  - title: string (required)
 *  - description: string (optional)
 *  - action: ReactNode (optional — usually a button)
 */
const EmptyState = ({
    icon: Icon,
    title,
    description,
    action,
}) => (
    <div
        role="status"
        style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '3rem 1.5rem',
            maxWidth: '480px',
            margin: '0 auto',
        }}
    >
        {Icon && (
            <div
                style={{
                    width: '3rem',
                    height: '3rem',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                }}
            >
                <Icon size={22} strokeWidth={1.5} />
            </div>
        )}
        <h3
            style={{
                fontSize: '15px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                margin: 0,
                marginBottom: '0.375rem',
            }}
        >
            {title}
        </h3>
        {description && (
            <p
                style={{
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    margin: 0,
                    lineHeight: 1.5,
                    maxWidth: '380px',
                }}
            >
                {description}
            </p>
        )}
        {action && (
            <div style={{ marginTop: '1.25rem' }}>
                {action}
            </div>
        )}
    </div>
);

export default EmptyState;
