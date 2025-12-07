import React, { useState, useCallback, createContext, useContext } from 'react';

/**
 * Confirmation dialog — replaces native await confirm().
 * Usage:
 *   const { confirm } = useConfirm();
 *   const ok = await confirm('Delete this job?', { confirmText: 'Delete', danger: true });
 *   if (ok) { ... }
 */
const ConfirmContext = createContext(null);

export const ConfirmProvider = ({ children }) => {
    const [state, setState] = useState({ open: false });

    const confirm = useCallback((message, options = {}) => {
        return new Promise((resolve) => {
            setState({
                open: true,
                message,
                title: options.title || 'Confirm',
                confirmText: options.confirmText || 'Confirm',
                cancelText: options.cancelText || 'Cancel',
                danger: options.danger || false,
                resolve,
            });
        });
    }, []);

    const handleConfirm = () => {
        state.resolve?.(true);
        setState({ open: false });
    };

    const handleCancel = () => {
        state.resolve?.(false);
        setState({ open: false });
    };

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            {state.open && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 100,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(4px)',
                        WebkitBackdropFilter: 'blur(4px)',
                        padding: '1rem',
                    }}
                    onClick={handleCancel}
                >
                    <div
                        role="alertdialog"
                        aria-modal="true"
                        aria-label={state.title}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            backgroundColor: 'var(--bg-elevated)',
                            border: '1px solid var(--border-primary)',
                            borderRadius: 'var(--radius-xl)',
                            boxShadow: 'var(--shadow-lg)',
                            maxWidth: '400px',
                            width: '100%',
                            padding: '24px',
                            fontFamily: 'var(--font-sans)',
                        }}
                    >
                        <h3 style={{
                            fontSize: '16px',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            margin: '0 0 8px 0',
                        }}>{state.title}</h3>
                        <p style={{
                            fontSize: '14px',
                            color: 'var(--text-secondary)',
                            lineHeight: 1.5,
                            margin: '0 0 24px 0',
                        }}>{state.message}</p>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={handleCancel}
                                style={{
                                    padding: '8px 16px',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    backgroundColor: 'var(--bg-tertiary)',
                                    color: 'var(--text-primary)',
                                    border: '1px solid var(--border-primary)',
                                    borderRadius: 'var(--radius-md)',
                                    cursor: 'pointer',
                                }}
                            >{state.cancelText}</button>
                            <button
                                onClick={handleConfirm}
                                style={{
                                    padding: '8px 16px',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    backgroundColor: state.danger ? 'var(--danger)' : 'var(--accent)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 'var(--radius-md)',
                                    cursor: 'pointer',
                                }}
                            >{state.confirmText}</button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
};

export const useConfirm = () => {
    const ctx = useContext(ConfirmContext);
    if (!ctx) {
        return { confirm: async () => await confirm('') };
    }
    return ctx;
};

export default ConfirmProvider;
