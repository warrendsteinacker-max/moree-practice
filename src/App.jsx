import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';

import LoginPage from './pages/LoginPage.jsx';
import CreateAccountPage from './pages/CreateAccountPage.jsx';
import PostsPage from './pages/PostsPage.jsx';

// Component to protect routes (Redirects unauthenticated users to the login page)
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }
    return children;
};

// Component for the top navigation bar
const Header = () => {
    const { isAuthenticated, logout } = useAuth();

    return (
        <header style={{ 
            padding: '15px 30px', 
            background: '#1a5632', 
            color: 'white', 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
            <h1 style={{ margin: 0, fontSize: '24px' }}>
                🕊️ Church Community Blog
            </h1>
            {isAuthenticated && (
                <button 
                    onClick={logout} 
                    style={{ 
                        background: '#e04f4f', 
                        color: 'white', 
                        border: 'none', 
                        padding: '8px 15px', 
                        cursor: 'pointer',
                        borderRadius: '4px'
                    }}
                >
                    Logout
                </button>
            )}
        </header>
    );
};

const App = () => {
    return (
        <Router>
            <AuthProvider>
                <Header />
                <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
                    <Routes>
                        {/* The root path is the login page */}
                        <Route path="/" element={<LoginPage />} />
                        <Route path="/login" element={<Navigate to="/" replace />} />
                        
                        <Route path="/create-account" element={<CreateAccountPage />} />
                        
                        {/* The /posts page is protected */}
                        <Route path="/posts" element={
                            <ProtectedRoute>
                                <PostsPage />
                            </ProtectedRoute>
                        } />

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </div>
            </AuthProvider>
        </Router>
    );
};

export default App;