import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    if (isAuthenticated) {
        navigate('/posts');
        return null; 
    }

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

    const inputStyle = { width: '100%', padding: '12px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' };
    const buttonStyle = { width: '100%', padding: '12px', background: '#3b5998', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <h2 style={{ textAlign: 'center', color: '#1a5632' }}>Welcome Back</h2>
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
                {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
                <button type="submit" style={buttonStyle}>
                    Log In
                </button>
            </form>
            
            <div style={{ marginTop: '30px', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                <p>Don't have an account?</p>
                <Link to="/create-account" style={{ textDecoration: 'none' }}>
                    <button style={{ ...buttonStyle, background: '#1a5632' }}>
                        Create a New Account
                    </button>
                </Link>
            </div>
        </div>
    );
};

export default LoginPage;