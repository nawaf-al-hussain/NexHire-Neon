import React from 'react';

/**
 * SkipLink — accessibility affordance for keyboard users.
 * Renders an off-screen link that becomes visible when focused,
 * letting keyboard users jump straight to #main-content.
 *
 * Place as the FIRST focusable element on every page.
 * Target element must have id="main-content".
 */
const SkipLink = () => (
    <a href="#main-content" className="skip-link">
        Skip to content
    </a>
);

export default SkipLink;
