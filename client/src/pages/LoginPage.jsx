import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserCircle, Lock, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import NexHireLogo from '../assets/nexhire_logo.svg';

const LoginPage = () => {
 const { login } = useAuth();
 const navigate = useNavigate();
 const [username, setUsername] = useState('');
 const [password, setPassword] = useState('');
 const [error, setError] = useState('');
 const [isLoggingIn, setIsLoggingIn] = useState(false);

 const handleLogin = async (e) => {
 e.preventDefault();
 setError('');
 setIsLoggingIn(true);

 try {
 const user = await login(username, password);
 // Redirect based on RoleID — preserve exact case (auth flow is load-bearing)
 if (user.RoleID === 1) navigate('/admin');
 else if (user.RoleID === 2) navigate('/recruiter');
 else if (user.RoleID === 3) navigate('/candidate');
 else navigate('/');
 } catch (err) {
 setError(err.message);
 } finally {
 setIsLoggingIn(false);
 }
 };

 return (
 <div
 id="main-content"
 className="min-h-[100dvh] grid lg:grid-cols-2"
 style={{
 backgroundColor: 'var(--bg-primary)',
 color: 'var(--text-primary)',
 fontFamily: 'var(--font-sans)',
 }}
 >
 {/* Left brand panel (hidden on mobile) */}
 <aside
 className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden"
 style={{
 backgroundColor: 'var(--bg-secondary)',
 borderRight: '1px solid var(--border-primary)',
 }}
 >
 {/* Subtle grid background */}
 <div
 aria-hidden="true"
 className="absolute inset-0"
 style={{
 backgroundImage:
 'linear-gradient(var(--border-primary) 1px, transparent 1px), linear-gradient(90deg, var(--border-primary) 1px, transparent 1px)',
 backgroundSize: '48px 48px',
 maskImage: 'radial-gradient(ellipse at top left, black 30%, transparent 70%)',
 WebkitMaskImage: 'radial-gradient(ellipse at top left, black 30%, transparent 70%)',
 opacity: 0.6,
 }}
 />

 <div className="relative flex items-center gap-2.5">
 <div
 className="w-9 h-9 overflow-hidden bg-[var(--accent)]"
 style={{ borderRadius: 'var(--radius-md)' }}
 >
 <img src={NexHireLogo} alt="NexHire Logo" className="w-full h-full object-contain" />
 </div>
 <span
 className="text-lg font-semibold tracking-tight"
 style={{ fontFamily: 'var(--font-display)' }}
 >
 NexHire
 </span>
 </div>

 <div className="relative">
 <div className="eyebrow mb-4">Recruitment operations</div>
 <h2
 className="mb-6"
 style={{
 fontFamily: 'var(--font-display)',
 fontSize: '2.5rem',
 fontWeight: 700,
 lineHeight: 1.1,
 letterSpacing: '-0.02em',
 color: 'var(--text-primary)',
 }}
 >
 Recruit smarter,<br />
 not harder.
 </h2>
 <p
 className="mb-10 max-w-sm"
 style={{
 fontSize: '1rem',
 color: 'var(--text-secondary)',
 lineHeight: 1.6,
 }}
 >
 AI-powered matching, automated screening, and predictive
 analytics — built on a transactional PostgreSQL core.
 </p>

 <ul className="space-y-3 max-w-sm">
 {[
 'Real-time candidate matching with skill-gap analysis',
 'Automated screening with explainable decisions',
 'Predictive onboarding and ghosting-risk scoring',
 ].map((line, i) => (
 <li
 key={i}
 className="flex items-start gap-3 text-sm"
 style={{ color: 'var(--text-secondary)' }}
 >
 <span
 aria-hidden="true"
 style={{
 flexShrink: 0,
 width: 18,
 height: 18,
 marginTop: 2,
 borderRadius: 'var(--radius-sm)',
 backgroundColor: 'var(--accent-soft)',
 color: 'var(--accent)',
 display: 'inline-flex',
 alignItems: 'center',
 justifyContent: 'center',
 fontSize: 11,
 fontWeight: 600,
 }}
 >
 ✓
 </span>
 {line}
 </li>
 ))}
 </ul>
 </div>

 <div className="relative eyebrow">
 Platform architect · Nawaf Al Hussain Khondokar
 </div>
 </aside>

 {/* Right form panel */}
 <main className="flex items-center justify-center p-6 lg:p-12">
 <div className="w-full max-w-sm">
 {/* Mobile-only logo */}
 <div className="lg:hidden flex items-center gap-2.5 mb-10 justify-center">
 <div
 className="w-9 h-9 overflow-hidden bg-[var(--accent)]"
 style={{ borderRadius: 'var(--radius-md)' }}
 >
 <img src={NexHireLogo} alt="NexHire Logo" className="w-full h-full object-contain" />
 </div>
 <span
 className="text-lg font-semibold tracking-tight"
 style={{ fontFamily: 'var(--font-display)' }}
 >
 NexHire
 </span>
 </div>

 <div className="eyebrow mb-2">Sign in</div>
 <h1
 className="mb-8"
 style={{
 fontFamily: 'var(--font-display)',
 fontSize: '1.875rem',
 fontWeight: 600,
 letterSpacing: '-0.02em',
 color: 'var(--text-primary)',
 }}
 >
 Welcome back
 </h1>

 <form onSubmit={handleLogin} className="space-y-4">
 {error && (
 <div
 role="alert"
 aria-live="assertive"
 className="flex items-start gap-2.5 p-3"
 style={{
 backgroundColor: 'color-mix(in srgb, var(--danger) 8%, transparent)',
 border: '1px solid color-mix(in srgb, var(--danger) 25%, transparent)',
 color: 'var(--danger)',
 borderRadius: 'var(--radius-md)',
 fontSize: '0.8125rem',
 fontWeight: 500,
 }}
 >
 <AlertCircle size={15} strokeWidth={2} className="mt-0.5 shrink-0" />
 <span>{error}</span>
 </div>
 )}

 <div className="space-y-1.5">
 <label
 htmlFor="username"
 className="eyebrow block"
 >
 Username
 </label>
 <div className="relative">
 <UserCircle
 size={16}
 strokeWidth={1.75}
 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
 />
 <input
 id="username"
 type="text"
 required
 autoComplete="username"
 placeholder="jdoe_admin"
 className="input-soft w-full pl-10 pr-3 py-2.5 text-sm focus-ring"
 style={{ fontWeight: 400 }}
 value={username}
 onChange={(e) => setUsername(e.target.value)}
 aria-describedby={error ? 'login-error' : undefined}
 />
 </div>
 </div>

 <div className="space-y-1.5">
 <label
 htmlFor="password"
 className="eyebrow block"
 >
 Password
 </label>
 <div className="relative">
 <Lock
 size={16}
 strokeWidth={1.75}
 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
 />
 <input
 id="password"
 type="password"
 autoComplete="current-password"
 placeholder="••••••••"
 className="input-soft w-full pl-10 pr-3 py-2.5 text-sm focus-ring"
 style={{ fontWeight: 400 }}
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 aria-describedby={error ? 'login-error' : undefined}
 />
 </div>
 </div>

 <button
 type="submit"
 disabled={isLoggingIn}
 className="btn-primary w-full"
 style={{ padding: '0.75rem 1rem', fontSize: '15px', marginTop: '0.5rem' }}
 >
 {isLoggingIn ? (
 <>
 <Loader2 size={15} className="animate-spin" strokeWidth={2} />
 Signing in…
 </>
 ) : (
 <>
 Sign in <ArrowRight size={14} strokeWidth={2} />
 </>
 )}
 </button>
 </form>

                    {import.meta.env.DEV && (
                    <p
                        className="mt-8 text-xs text-center"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        Demo logins: <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>admin1</span>,{' '}
                        <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>recruiter1</span>,{' '}
                        <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>candidate1</span>
                        <br />
                        <span className="opacity-70">leave password blank for dev bypass</span>
                    </p>
                    )}
 </div>
 </main>
 </div>
 );
};

export default LoginPage;
