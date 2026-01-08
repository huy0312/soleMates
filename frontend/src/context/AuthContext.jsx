import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            // Decode token or fetch user profile if endpoint exists.
            // For now, we'll just set a dummy user or wait for a /me endpoint implementation.
            // Or we can just assume logged in if token exists for MVP.
            // Let's rely on stored user info if available, or just the presence of token.

            // Ideally: api.get('/auth/me').then(...)
            setLoading(false);
        } else {
            setLoading(false);
        }
    }, [token]);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/authenticate', { email, password });
            const { token } = response.data;
            setToken(token);
            localStorage.setItem('token', token);

            // Simple user object for now, replace with actual user data from response or /me
            setUser({ email });
            return { success: true };
        } catch (error) {
            console.error("Login failed", error);
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
