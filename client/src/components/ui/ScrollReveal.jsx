import React, { useEffect, useRef, useState } from 'react';

/**
 * ScrollReveal — wraps children and reveals them with a soft fade-up
 * when they enter the viewport. Respects prefers-reduced-motion (renders
 * children immediately without animation in that case).
 *
 * Props:
 *  - children: ReactNode
 *  - delay: number (ms) — stagger delay for sibling reveals
 *  - as: element type (default 'div')
 */
const ScrollReveal = ({ children, delay = 0, as: Tag = 'div' }) => {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;

        // Reduced motion: skip the observer, show immediately
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setVisible(true);
            return;
        }

        // If element is already in viewport on mount, show immediately
        const rect = node.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            setVisible(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    return (
        <Tag
            ref={ref}
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(8px)',
                transition: `opacity var(--dur-reveal) var(--ease-spring) ${delay}ms, transform var(--dur-reveal) var(--ease-spring) ${delay}ms`,
            }}
        >
            {children}
        </Tag>
    );
};

export default ScrollReveal;

/*
 * ScrollReveal: wraps children with an IntersectionObserver that adds
 * a 'reveal-up' CSS class when the element scrolls into view.
 * Supports staggered animation via the delay prop (in ms).
 */

