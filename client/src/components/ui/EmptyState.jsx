import React from 'react';

/**
 * Reusable empty state component.
 * Shows when a list or data section has no items.
 */
const EmptyState = ({ icon: Icon, title = 'No data', message, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {Icon && <Icon size={32} className="text-[var(--text-muted)] opacity-40 mb-4" />}
      <p className="text-sm font-medium text-[var(--text-muted)]">{title}</p>
      {message && <p className="text-xs text-[var(--text-muted)] opacity-70 mt-1 text-center max-w-sm">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

export default EmptyState;
