import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create a configured Axios instance
const api = axios.create({
    baseURL: API_URL,
});

// CRITICAL FIX: Interceptor to attach the JWT token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            // Attach the token as a Bearer token in the Authorization header
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [user, setUser] = useState(null);

    // Check localStorage on initial load
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('role');
        const userName = localStorage.getItem('name');
        
        if (token && userRole && userName) {
            setIsAuthenticated(true);
            setIsAdmin(userRole === 'admin');
            setUser({ role: userRole, name: userName });
        }
    }, []);

    const login = async (username, password) => {
        try {
            const response = await axios.post(`${API_URL}/login`, { username, password });
            
            const { accessToken, role, name } = response.data;

            // Save token and user info upon successful login
            localStorage.setItem('token', accessToken);
            localStorage.setItem('role', role);
            localStorage.setItem('name', name);
            
            setIsAuthenticated(true);
            setIsAdmin(role === 'admin');
            setUser({ role, name });
            return true;
        } catch (error) {
            console.error('Login failed:', error.response?.data || error.message);
            return false;
        }
    };

    // FIXED LOGIC: The complete logout function
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('name');
        setIsAuthenticated(false);
        setIsAdmin(false);
        setUser(null);
    };

    const value = useMemo(() => ({
        isAuthenticated,
        isAdmin,
        user,
        login,
        logout,
        api, // EXPOSE THE CONFIGUED AXIOS INSTANCE
    }), [isAuthenticated, isAdmin, user]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    return useContext(AuthContext);
};