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
            // The request hits the backend route with the new duplicate password check
            await axios.post(`${API_URL}/register`, { name, username, password });
            setMessage('Account created successfully! Redirecting to login...');
            setTimeout(() => navigate('/'), 2000); 
        } catch (error) {
            // Display the specific error message from the backend (e.g., 'Username already exists.' 
            // or 'This password has already been used by another account.')
            const errorMessage = error.response?.data || 'Registration failed. Please try again.';
            setMessage(errorMessage);
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
        background: '#28a745', // Primary Green for sign-up
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
        background: '#6c757d', // Gray for back button
        marginTop: '10px'
    };
    // ------------------

    return (
        // --- UPDATED CENTERING STYLE (Matches LoginPage) ---
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh', // Full viewport height
            backgroundColor: '#f4f6f9' 
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
                <h2 style={{ textAlign: 'center', color: '#28a745', marginBottom: '25px' }}>Join Our Community</h2>
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
                    {message && (
                        <p style={{ 
                            color: message.startsWith('Account created') ? '#28a745' : '#dc3545', 
                            textAlign: 'center',
                            marginTop: '10px'
                        }}>
                            {message}
                        </p>
                    )}
                    <button type="submit" style={primaryButtonStyle}>
                        Create Account
                    </button>
                </form>
                
                <div style={{ marginTop: '30px', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                    <Link to="/" style={{ textDecoration: 'none' }}>
                        <button style={secondaryButtonStyle}>
                            Back to Login
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CreateAccountPage;