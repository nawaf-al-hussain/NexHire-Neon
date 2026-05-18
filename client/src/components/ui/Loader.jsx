import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Centered spinner loader for async loading states.
 */
const Loader = ({ message = 'Loading...', size = 32 }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2
        size={size}
        className="text-[var(--accent)] animate-spin mb-3"
      />
      <span className="text-sm font-medium text-[var(--text-muted)]">{message}</span>
    </div>
  );
};

export default Loader;
