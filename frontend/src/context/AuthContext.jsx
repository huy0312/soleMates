import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/users/me');
            setUser(response.data);
        } catch (error) {
            console.error("Failed to fetch profile", error);
            // logout(); // Optional: logout if token invalid
        }
    };

    useEffect(() => {
        const initializeAuth = async () => {
            if (token) {
                await fetchProfile();
            }
            setLoading(false);
        };
        initializeAuth();
    }, [token]);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/authenticate', { email, password });
            const { token } = response.data;
            setToken(token);
            localStorage.setItem('token', token);

            // Fetch profile immediately to get role for redirect
            const userResponse = await api.get('/users/me');
            setUser(userResponse.data);

            return { success: true, user: userResponse.data };
        } catch (error) {
            console.error("Login failed", error);
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    };

    const register = async (fullName, email, password) => {
        try {
            await api.post('/auth/register', { fullName, email, password });
            return { success: true };
        } catch (error) {
            console.error("Registration failed", error);
            return { success: false, message: error.response?.data?.message || 'Registration failed' };
        }
    };

    const updateProfile = async (data) => {
        try {
            const response = await api.put('/users/me', data);
            setUser(response.data);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Update failed' };
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, updateProfile, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
