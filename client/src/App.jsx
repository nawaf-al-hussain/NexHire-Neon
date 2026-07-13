import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import SkipLink from './components/ui/SkipLink'
import ToastProvider from './components/ui/Toast'
import ConfirmProvider from './components/ui/ConfirmDialog'

// Pages — eagerly loaded (small, needed for first paint)
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import DesignSystemPage from './pages/DesignSystemPage'
import DocumentationPage from './pages/DocumentationPage'
import NotFoundPage from './pages/NotFoundPage'

// Pages — lazy loaded (large dashboards, only needed for authenticated users
// in their specific role). Each becomes a separate chunk that loads on
// demand when the user navigates to that route.
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const RecruiterDashboard = lazy(() => import('./pages/RecruiterDashboard'))
const CandidateDashboard = lazy(() => import('./pages/CandidateDashboard'))

import './App.css'

// Minimal loading fallback — keeps the SPA feel during route transitions.
// Inline styles so this file doesn't pull in CSS that the user hasn't
// fetched yet (avoids FOUC during chunk download).
const RouteLoader = () => (
 <div style={{
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 minHeight: '100vh',
 fontFamily: 'system-ui, -apple-system, sans-serif',
 color: '#6b7280',
 }}>
 <div style={{ textAlign: 'center' }}>
 <div style={{
 width: '32px',
 height: '32px',
 border: '3px solid #e5e7eb',
 borderTopColor: '#3b82f6',
 borderRadius: '50%',
 animation: 'spin 0.8s linear infinite',
 margin: '0 auto 12px',
 }} />
 <div>Loading dashboard…</div>
 <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
 </div>
 </div>
)

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
 const { user, loading } = useAuth();

 if (loading) return null;
 if (!user) return <Navigate to="/login" />;
 if (allowedRoles.length > 0 && !allowedRoles.includes(user.RoleID)) {
 return <Navigate to="/" />;
 }

 return children;
};

function App() {
 return (
 <AuthProvider>
 <ThemeProvider>
 <ToastProvider>
 <ConfirmProvider>
 <Router>
 {/* SkipLink must be the first focusable element on every page */}
 <SkipLink />
 {/* Suspense boundary wraps ALL routes so lazy chunks can load
 without unmounting the entire app. */}
 <Suspense fallback={<RouteLoader />}>
 <Routes>
 <Route path="/" element={<LandingPage />} />
 <Route path="/design-system" element={<DesignSystemPage />} />
 <Route path="/documentation" element={<DocumentationPage />} />
 <Route path="/login" element={<LoginPage />} />

 <Route path="/admin" element={
 <ProtectedRoute allowedRoles={[1]}>
 <AdminDashboard />
 </ProtectedRoute>
 } />

 <Route path="/recruiter" element={
 <ProtectedRoute allowedRoles={[2]}>
 <RecruiterDashboard />
 </ProtectedRoute>
 } />

 <Route path="/candidate" element={
 <ProtectedRoute allowedRoles={[3]}>
 <CandidateDashboard />
 </ProtectedRoute>
 } />

 {/* Catch-all 404 — must be LAST or it shadows other routes */}
 <Route path="*" element={<NotFoundPage />} />
 </Routes>
 </Suspense>
 </Router>
 </ConfirmProvider>
 </ToastProvider>
 </ThemeProvider>
 </AuthProvider>
 )
}

export default App

/*
 * ProtectedRoute: wraps dashboard routes to enforce authentication.
 * Reads user from AuthContext. If not logged in, redirects to /login.
 * If user's RoleID doesn't match allowedRoles, redirects to /.
 * Usage: <ProtectedRoute allowedRoles={[1]}><AdminDashboard /></ProtectedRoute>
 */

