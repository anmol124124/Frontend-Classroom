import React, { createContext, useContext, useState, useEffect } from 'react';
// jwtDecode: Library to decode JWT tokens and extract data (email, role, expiration)
import { jwtDecode } from 'jwt-decode';
// API: Axios instance for making HTTP requests to backend
import api from '../api/api';

// Create context object - This holds authentication data shared across all components
const AuthContext = createContext();

// AuthProvider component - Provides authentication functionality to entire app
export const AuthProvider = ({ children }) => {
    // State to store logged-in user info (email, role)
    const [user, setUser] = useState(null);
    // State to track if we're still loading authentication info on startup
    const [loading, setLoading] = useState(true);
    // State to store authentication errors (e.g. invalid embedded token)
    const [authError, setAuthError] = useState(null);

    // useEffect: Runs when component mounts - Check if user is already logged in
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken = urlParams.get('token');
        const isEmbedded = urlParams.get('embedded') === 'true';

        if (urlToken && isEmbedded) {
            console.log('Embedded session detected, initializing...');

            try {
                const decoded = jwtDecode(urlToken);

                // CRITICAL: Check for token expiration
                if (decoded.exp * 1000 < Date.now()) {
                    console.error('Embedded token expired');
                    setAuthError('Authentication Failed: Token Expired');
                    setLoading(false);
                    return;
                }

                const email = decoded.sub;
                localStorage.setItem('token', urlToken);

                // Ensure a username exists in localStorage for signaling
                if (!localStorage.getItem('username')) {
                    const extractedUsername = email.split('@')[0];
                    localStorage.setItem('username', extractedUsername);
                }

                setUser({
                    email: email,
                    role: decoded.role || 'student'
                });
                setAuthError(null);
                setLoading(false);
                return; // Direct return to avoid double-processing
            } catch (error) {
                console.error('Failed to decode embedded token:', error);
                setAuthError('Authentication Failed: Invalid Token');
                setLoading(false);
                return;
            }
        }

        // Standard login flow
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                if (decoded.exp * 1000 < Date.now()) {
                    localStorage.removeItem('token');
                    setUser(null);
                } else {
                    const email = decoded.sub;
                    // Restore username if missing
                    if (!localStorage.getItem('username') && email) {
                        localStorage.setItem('username', email.split('@')[0]);
                    }
                    setUser({
                        email: email,
                        role: decoded.role
                    });
                }
            } catch (error) {
                console.error('Failed to decode token:', error);
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    // Function to handle user login
    const login = async (email, password) => {
        // Create form data (backend expects URL-encoded format, not JSON)
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        try {
            // Send login request to backend
            const response = await api.post('/auth/login', formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            // Extract JWT token from response
            const { access_token } = response.data;
            // Save token to local storage so it persists across page refreshes
            localStorage.setItem('token', access_token);

            // Decode token to get user info
            const decoded = jwtDecode(access_token);
            const userData = {
                email: decoded.sub,
                role: decoded.role
            };

            // Update user state
            setUser(userData);

            // Ensure username is in localStorage
            if (!localStorage.getItem('username')) {
                localStorage.setItem('username', userData.email.split('@')[0]);
            }

            return userData;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    // Function to handle user signup (includes immediate login from token)
    const signup = async (username, email, password, role) => {
        try {
            const response = await api.post('/auth/signup', {
                username,
                email,
                password,
                role
            });

            const { access_token, user: userInfo } = response.data;

            // If token is returned, sign them in immediately
            if (access_token) {
                localStorage.setItem('token', access_token);
                // Also store username for meeting room UI
                localStorage.setItem('username', userInfo.username);

                const decoded = jwtDecode(access_token);
                const userData = {
                    email: decoded.sub,
                    role: decoded.role
                };
                setUser(userData);
                return userData;
            }
            return response.data;
        } catch (error) {
            console.error('Signup failed:', error);
            throw error;
        }
    };

    // Function to handle user logout
    const logout = () => {
        // Remove token from storage
        localStorage.removeItem('token');
        // Clear username
        localStorage.removeItem('username');
        // Clear user state
        setUser(null);
    };

    // Return context provider that passes auth data to all child components
    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading, authError, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to access authentication context
// This makes it easy for any component to get auth data with: const { user, login, logout } = useAuth();
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
