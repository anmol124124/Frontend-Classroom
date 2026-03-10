import React from 'react';
// React Router
import { Navigate, useLocation } from 'react-router-dom';
// Custom hook to access authentication data
import { useAuth } from '../context/AuthContext';

// ProtectedRoute: Component that wraps routes to enforce access control
// It checks if user is logged in and has the correct role
const ProtectedRoute = ({ children, roles }) => {
    // Get authentication state from context
    const { user, loading, isAuthenticated, authError } = useAuth();
    // Get current page location (used for redirecting back after login)
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const isEmbedded = queryParams.get('embedded') === 'true';

    // While checking if user is authenticated, show loading message
    if (loading) {
        return <div className="loading" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', color: 'white' }}>Loading...</div>;
    }

    // CRITICAL: Handle authentication errors in embedded mode
    if (authError && isEmbedded) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', color: 'white', padding: '20px', textAlign: 'center' }}>
                <div style={{ padding: '40px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '16px', maxWidth: '400px' }}>
                    <h2 style={{ color: '#ef4444', marginBottom: '16px' }}>Authentication Error</h2>
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>{authError}</p>
                    <p style={{ marginTop: '24px', fontSize: '0.9rem', color: '#64748b' }}>Please ensure you are accessing the meeting from an authorized platform.</p>
                </div>
            </div>
        );
    }

    // If user is not logged in, redirect to login page
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If this route requires specific roles and user doesn't have them
    if (roles && !roles.includes(user.role)) {
        // Redirect user to their role-specific dashboard
        const dashboardPath = user.role === 'admin' ? '/admin' : user.role === 'tutor' ? '/tutor' : '/student-dashboard';
        return <Navigate to={dashboardPath} replace />;
    }

    // User is logged in and has correct role - show the protected page
    return children;
};

export default ProtectedRoute;
