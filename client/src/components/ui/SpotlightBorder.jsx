import React, { useRef } from 'react';

/**
 * SpotlightBorder — wraps a card; on mousemove, sets --mx/--my CSS
 * custom props that the parent .spotlight-card::before uses to render
 * a soft indigo radial glow that follows the cursor.
 *
 * The actual visual is defined via the .spotlight-card class in index.css.
 * This component just wires up the mouse tracking.
 *
 * Props:
 *  - children: ReactNode
 *  - className: string (additional classes — should include "spotlight-card")
 *  - as: element type (default 'div')
 */
const SpotlightBorder = ({ children, className = '', as: Tag = 'div' }) => {
    const ref = useRef(null);

    const handleMouseMove = (e) => {
        const node = ref.current;
        if (!node) return;
        const rect = node.getBoundingClientRect();
        node.style.setProperty('--mx', `${e.clientX - rect.left}px`);
        node.style.setProperty('--my', `${e.clientY - rect.top}px`);
    };

    return (
        <Tag
            ref={ref}
            onMouseMove={handleMouseMove}
            className={`spotlight-card ${className}`}
        >
            {children}
        </Tag>
    );
};

export default SpotlightBorder;
