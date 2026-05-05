import React from 'react';

/**
 * Skeleton loading placeholder.
 * Uses CSS animation for a shimmer effect.
 */
const Skeleton = ({ width = '100%', height = '20px', rounded = true, className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-[var(--bg-tertiary)] ${rounded ? 'rounded-lg' : ''} ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
};

/**
 * Card skeleton for loading states.
 */
export const CardSkeleton = () => (
  <div className="glass-card p-6 rounded-[var(--radius-xl)]">
    <Skeleton width="40%" height="16px" className="mb-4" />
    <Skeleton width="100%" height="12px" className="mb-2" />
    <Skeleton width="80%" height="12px" className="mb-2" />
    <Skeleton width="60%" height="12px" />
  </div>
);

/**
 * Table row skeleton.
 */
export const TableRowSkeleton = ({ cols = 5 }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="py-4 pr-4">
        <Skeleton width="80%" height="14px" />
      </td>
    ))}
  </tr>
);

export default Skeleton;
