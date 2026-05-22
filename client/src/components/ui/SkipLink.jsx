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

/*
 * SkipLink: the first focusable element on every page. Hidden off-screen
 * until focused via keyboard (Tab), then appears in the top-left corner.
 * Lets keyboard users jump straight to #main-content, bypassing navigation.
 * Required by WCAG 2.1 Success Criterion 2.4.1 (Bypass Blocks).
 */

