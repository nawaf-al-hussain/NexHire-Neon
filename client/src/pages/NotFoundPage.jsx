import React from 'react';
import { Link } from 'react-router-dom';
import { Home, LogIn, Compass } from 'lucide-react';

/**
 * NotFoundPage — branded 404 page.
 * Replaces Vercel's default "FUNCTION_INVOCATION_FAILED"/"NOT_FOUND" page.
 * Public (no auth required). Includes a subtle background grid and
 * two clear navigation options.
 */
const NotFoundPage = () => {
 return (
 <main
 style={{
 minHeight: '100dvh',
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 padding: '2rem',
 backgroundColor: 'var(--bg-primary)',
 color: 'var(--text-primary)',
 position: 'relative',
 overflow: 'hidden',
 fontFamily: 'var(--font-sans)',
 }}
 >
 {/* Subtle background grid — Linear-style */}
 <div
 aria-hidden="true"
 style={{
 position: 'absolute',
 inset: 0,
 backgroundImage:
 'linear-gradient(var(--border-primary) 1px, transparent 1px), linear-gradient(90deg, var(--border-primary) 1px, transparent 1px)',
 backgroundSize: '48px 48px',
 maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
 WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
 opacity: 0.6,
 }}
 />

 <div
 style={{
 position: 'relative',
 textAlign: 'center',
 maxWidth: '420px',
 }}
 >
 <div
 className="eyebrow"
 style={{ marginBottom: '1.5rem' }}
 >
 Error 404
 </div>

 <h1
 style={{
 fontFamily: 'var(--font-display)',
 fontSize: 'clamp(4rem, 12vw, 7rem)',
 fontWeight: 700,
 lineHeight: 1,
 letterSpacing: '-0.04em',
 color: 'var(--text-primary)',
 margin: 0,
 marginBottom: '1rem',
 }}
 >
 404
 </h1>

 <h2
 style={{
 fontSize: '1.25rem',
 fontWeight: 600,
 color: 'var(--text-primary)',
 margin: 0,
 marginBottom: '0.5rem',
 }}
 >
 Page not found
 </h2>

 <p
 style={{
 fontSize: '0.95rem',
 color: 'var(--text-secondary)',
 lineHeight: 1.5,
 margin: '0 auto 2rem',
 maxWidth: '360px',
 }}
 >
 The page you're looking for doesn't exist or has been moved.
 Let's get you back on track.
 </p>

 <div
 style={{
 display: 'flex',
 gap: '0.75rem',
 justifyContent: 'center',
 flexWrap: 'wrap',
 }}
 >
 <Link to="/" className="btn-primary" style={{ textDecoration: 'none' }}>
 <Home size={16} strokeWidth={1.75} />
 Back to home
 </Link>
 <Link to="/login" className="btn-ghost" style={{ textDecoration: 'none' }}>
 <LogIn size={16} strokeWidth={1.75} />
 Go to login
 </Link>
 </div>

 <div
 style={{
 marginTop: '3rem',
 fontSize: '0.8rem',
 color: 'var(--text-muted)',
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 gap: '0.5rem',
 }}
 >
 <Compass size={14} strokeWidth={1.5} />
 NexHire
 </div>
 </div>
 </main>
 );
};

export default NotFoundPage;
