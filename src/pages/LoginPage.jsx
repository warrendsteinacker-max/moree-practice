import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/posts', { replace: true }); 
        }
    }, [isAuthenticated, navigate]); 
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const success = await login(username, password);
        
        if (success) {
            navigate('/posts');
        } else {
            setError('Login failed. Check username and password.');
        }
    };

    // --- NEW STYLES ---
    const inputStyle = { 
        width: '100%', 
        padding: '12px', 
        margin: '8px 0', 
        border: '1px solid #ced4da', 
        borderRadius: '6px',
        boxSizing: 'border-box'
    };
    
    const primaryButtonStyle = { 
        width: '100%', 
        padding: '12px', 
        background: '#007bff', // Primary Blue
        color: 'white', 
        border: 'none', 
        borderRadius: '6px', 
        cursor: 'pointer', 
        marginTop: '15px',
        fontWeight: 'bold',
        transition: 'background-color 0.3s'
    };
    
    const secondaryButtonStyle = { 
        ...primaryButtonStyle, 
        background: '#28a745', // Secondary Green
        marginTop: '10px'
    };
    // ------------------

    if (isAuthenticated) {
        return <div style={{textAlign: 'center', marginTop: '100px'}}>Redirecting...</div>;
    }

    return (
        // --- UPDATED CENTERING STYLE ---
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: '#f4f6f9' // Matches body background
        }}>
            <div style={{ 
                maxWidth: '400px', 
                width: '90%', 
                padding: '30px', 
                border: '1px solid #e9ecef', 
                borderRadius: '8px', 
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                backgroundColor: 'white' // White background for the form box
            }}>
                <h2 style={{ textAlign: 'center', color: '#007bff', marginBottom: '25px' }}>Welcome Back</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Username (e.g., admin)"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        style={inputStyle}
                    />
                    <input
                        type="password"
                        placeholder="Password (e.g., admin123)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={inputStyle}
                    />
                    {error && <p style={{ color: '#dc3545', textAlign: 'center', marginTop: '10px' }}>{error}</p>}
                    <button type="submit" style={primaryButtonStyle}>
                        Log In
                    </button>
                </form>
                
                <div style={{ marginTop: '30px', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                    <p style={{ margin: '0 0 10px 0', color: '#6c757d' }}>Don't have an account?</p>
                    <Link to="/create-account" style={{ textDecoration: 'none' }}>
                        <button style={secondaryButtonStyle}>
                            Create a New Account
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;