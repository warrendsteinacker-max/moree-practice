import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const PostsPage = () => {
    const { isAuthenticated, isAdmin, api } = useAuth();
    const [posts, setPosts] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchPosts = useCallback(async () => {
        try {
            const response = await api.get('/posts'); 
            setPosts(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch posts:', error);
            setLoading(false);
        }
    }, [api]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handleAddPost = async (e) => {
        e.preventDefault();
        try {
            await api.post('/posts', { title, content });
            fetchPosts(); 
            setTitle('');
            setContent('');
        } catch (error) {
            alert(error.response?.data || 'Failed to add post. Please ensure you are logged in.');
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm('Are you sure you want the Admin to delete this post?')) {
            return;
        }
        try {
            await api.delete(`/posts/${postId}`);
            setPosts(posts.filter(post => post.id !== postId));
        } catch (error) {
            alert(error.response?.data || 'Failed to delete post. Only administrators can delete posts.');
        }
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading Blog Posts...</div>;

    // --- NEW/UPDATED STYLES ---
    const postContainerStyle = { 
        border: '1px solid #e9ecef', 
        padding: '20px', 
        marginBottom: '20px', 
        borderRadius: '8px',
        background: '#ffffff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        transition: 'transform 0.2s',
        // Optional: Hover effect for a touch of polish
        ':hover': { transform: 'translateY(-2px)' } 
    };
    
    const postFormStyle = { 
        border: '1px solid #007bff', 
        padding: '30px', 
        marginBottom: '30px', 
        borderRadius: '10px', 
        background: '#e9f7ff' // Light blue background
    };

    const formButtonStyle = { 
        padding: '10px 20px', 
        background: '#007bff', 
        color: 'white', 
        border: 'none', 
        borderRadius: '6px', 
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'background-color 0.3s'
    };
    // --------------------------

    return (
        // --- UPDATED MAIN LAYOUT STYLE ---
        <div style={{
            maxWidth: '900px', // Increased width slightly for content
            margin: '0 auto',   
            padding: '20px',
            minHeight: '100vh', 
            backgroundColor: '#f4f6f9' // Ensure background fills space if content is short
        }}>
            {/* Conditional Rendering: Show Add Post form */}
            {isAuthenticated && (
                <div style={postFormStyle}>
                    <h3 style={{ marginTop: '0', color: '#007bff' }}>🙏 Share Your Thoughts</h3>
                    <form onSubmit={handleAddPost}>
                        <input
                            type="text"
                            placeholder="Post Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ced4da', borderRadius: '4px' }}
                        />
                        <textarea
                            placeholder="What message would you like to share?"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                            style={{ width: '100%', padding: '10px', marginBottom: '15px', minHeight: '100px', border: '1px solid #ced4da', borderRadius: '4px' }}
                        />
                        <button type="submit" style={formButtonStyle}>
                            Post Article
                        </button>
                    </form>
                </div>
            )}
            
            {/* Posts List */}
            <h2 style={{ color: '#333', borderBottom: '2px solid #007bff', paddingBottom: '10px', marginBottom: '25px' }}>Latest Posts</h2>
            <div>
                {posts.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#6c757d' }}>No posts found. Be the first to add one!</p>
                ) : (
                    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(post => (
                        <div key={post.id} style={postContainerStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{post.title}</h3>
                                {/* Conditional Rendering: Show Delete Button ONLY if the user is an Admin */}
                                {isAdmin && (
                                    <button 
                                        onClick={() => handleDeletePost(post.id)}
                                        style={{ background: '#dc3545', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        ❌ Admin Delete
                                    </button>
                                )}
                            </div>
                            <p style={{ lineHeight: '1.6', color: '#495057' }}>{post.content}</p>
                            <small style={{ display: 'block', marginTop: '10px', color: '#adb5bd', fontSize: '0.85em' }}>
                                Posted by Author ID: {post.authorId} on {new Date(post.createdAt).toLocaleDateString()}
                            </small>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default PostsPage;