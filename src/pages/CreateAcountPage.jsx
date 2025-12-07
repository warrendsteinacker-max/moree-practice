import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const CreateAccountPage = () => {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        
        try {
            await axios.post(`${API_URL}/register`, { name, username, password });
            setMessage('Account created successfully! Redirecting to login...');
            setTimeout(() => navigate('/'), 2000); 
        } catch (error) {
            const errorMessage = error.response?.data || 'Registration failed. Please try a different username.';
            setMessage(errorMessage);
        }
    };

    const inputStyle = { width: '100%', padding: '12px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' };
    const buttonStyle = { width: '100%', padding: '12px', background: '#1a5632', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <h2 style={{ textAlign: 'center', color: '#1a5632' }}>Join Our Community</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={inputStyle}
                />
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    style={inputStyle}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={inputStyle}
                />
                {message && <p style={{ color: message.startsWith('Account created') ? 'green' : 'red', textAlign: 'center' }}>{message}</p>}
                <button type="submit" style={buttonStyle}>
                    Create Account
                </button>
            </form>
            
            <div style={{ marginTop: '30px', textAlign: 'center' }}>
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <button style={{ ...buttonStyle, background: 'gray' }}>
                        Back to Login
                    </button>
                </Link>
            </div>
        </div>
    );
};

export default CreateAccountPage;