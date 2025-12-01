import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

/**
 * Toast notification system — replaces native toast().
 * Usage:
 *   const { toast } = useToast();
 *   toast('Profile updated.');
 *   toast('Connection failed.', { type: 'error' });
 */
const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const dismiss = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const toast = useCallback((message, options = {}) => {
        const id = Date.now() + Math.random();
        const { type = 'info', duration = 4000 } = options;
        setToasts(prev => [...prev, { id, message, type, duration }]);

        if (duration > 0) {
            setTimeout(() => dismiss(id), duration);
        }
        return id;
    }, [dismiss]);

    return (
        <ToastContext.Provider value={{ toast, dismiss }}>
            {children}
            <ToastContainer toasts={toasts} onDismiss={dismiss} />
        </ToastContext.Provider>
    );
};

const ToastContainer = ({ toasts, onDismiss }) => {
    if (toasts.length === 0) return null;

    const colors = {
        success: { bg: 'var(--success)', icon: '✓' },
        error: { bg: 'var(--danger)', icon: '✕' },
        warning: { bg: 'var(--warning)', icon: '!' },
        info: { bg: 'var(--accent)', icon: 'i' },
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            maxWidth: 'calc(100vw - 40px)',
            pointerEvents: 'none',
        }}>
            {toasts.map(t => {
                const c = colors[t.type] || colors.info;
                return (
                    <div
                        key={t.id}
                        role="alert"
                        aria-live="assertive"
                        onClick={() => onDismiss(t.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '12px 16px',
                            backgroundColor: 'var(--bg-elevated)',
                            border: '1px solid var(--border-primary)',
                            borderLeft: `3px solid ${c.bg}`,
                            borderRadius: 'var(--radius-md)',
                            boxShadow: 'var(--shadow-lg)',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '14px',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            pointerEvents: 'auto',
                            animation: 'fadeIn 200ms ease-out backwards',
                            maxWidth: '380px',
                        }}
                    >
                        <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            backgroundColor: c.bg,
                            color: '#fff',
                            fontSize: '12px',
                            fontWeight: 600,
                            flexShrink: 0,
                        }}>{c.icon}</span>
                        <span>{t.message}</span>
                    </div>
                );
            })}
        </div>
    );
};

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        // Fallback for components not wrapped in ToastProvider
        return {
            toast: (msg) => console.log('[toast]', msg),
            dismiss: () => {},
        };
    }
    return ctx;
};

export default ToastProvider;
