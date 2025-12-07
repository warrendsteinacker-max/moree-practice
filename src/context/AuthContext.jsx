import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Base URL for the backend API
const API_URL = 'http://localhost:5000/api';

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    // Initialize state from local storage (for persistence across page refreshes)
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [role, setRole] = useState(localStorage.getItem('role'));

    // Custom Axios instance that automatically attaches the JWT token
    const api = axios.create({
        baseURL: API_URL,
    });
    
    api.interceptors.request.use(
        config => {
            const currentToken = localStorage.getItem('token');
            if (currentToken) {
                config.headers.Authorization = `Bearer ${currentToken}`;
            }
            return config;
        },
        error => Promise.reject(error)
    );

    const login = async (username, password) => {
        try {
            const response = await axios.post(`${API_URL}/login`, { username, password });
            
            const { accessToken, role } = response.data;
            
            // Store data in state and local storage
            localStorage.setItem('token', accessToken);
            localStorage.setItem('role', role);
            setToken(accessToken);
            setRole(role);
            
            return true;
        } catch (error) {
            console.error('Login failed:', error);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setToken(null);
        setRole(null);
    };

    const isAdmin = role === 'admin';
    const isAuthenticated = !!token;

    return (
        <AuthContext.Provider value={{ isAuthenticated, isAdmin, role, login, logout, api }}>
            {children}
        </AuthContext.Provider>
    );
};