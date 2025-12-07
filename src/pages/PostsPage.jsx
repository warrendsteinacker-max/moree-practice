import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const PostsPage = () => {
    const { isAuthenticated, isAdmin, api } = useAuth();
    const [posts, setPosts] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchPosts = async () => {
        try {
            const response = await api.get('/posts'); 
            setPosts(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch posts:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleAddPost = async (e) => {
        e.preventDefault();
        try {
            // All authenticated users can post
            await api.post('/posts', { title, content });
            
            // Re-fetch posts to include the new one
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
            // Only admin role can delete (backend enforces this)
            await api.delete(`/posts/${postId}`);
            
            // Remove the post from the local state
            setPosts(posts.filter(post => post.id !== postId));
        } catch (error) {
            alert(error.response?.data || 'Failed to delete post. Only administrators can delete posts.');
        }
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading Blog Posts...</div>;

    const postContainerStyle = { 
        border: '1px solid #ddd', 
        padding: '15px', 
        marginBottom: '15px', 
        borderRadius: '6px',
        background: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    };
    
    const postFormStyle = { 
        border: '2px solid #1a5632', 
        padding: '25px', 
        marginBottom: '30px', 
        borderRadius: '8px', 
        background: '#f8fdf8' 
    };

    return (
        <div>
            {/* Conditional Rendering: Show Add Post form to ALL authenticated users */}
            {isAuthenticated && (
                <div style={postFormStyle}>
                    <h3>🙏 Share Your Thoughts</h3>
                    <form onSubmit={handleAddPost}>
                        <input
                            type="text"
                            placeholder="Post Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc' }}
                        />
                        <textarea
                            placeholder="What message would you like to share?"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                            style={{ width: '100%', padding: '10px', marginBottom: '10px', minHeight: '100px', border: '1px solid #ccc' }}
                        />
                        <button type="submit" style={{ padding: '10px 20px', background: '#3b5998', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            Post Article
                        </button>
                    </form>
                </div>
            )}
            
            {/* Posts List */}
            <h2 style={{ color: '#1a5632', borderBottom: '2px solid #1a5632', paddingBottom: '10px', marginBottom: '20px' }}>Latest Posts</h2>
            <div>
                {posts.length === 0 ? (
                    <p>No posts found. Be the first to add one!</p>
                ) : (
                    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(post => (
                        <div key={post.id} style={postContainerStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <h3 style={{ margin: '0 0 10px 0', color: '#000' }}>{post.title}</h3>
                                {/* Conditional Rendering: Show Delete Button ONLY if the user is an Admin */}
                                {isAdmin && (
                                    <button 
                                        onClick={() => handleDeletePost(post.id)}
                                        style={{ background: 'red', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                        ❌ Admin Delete
                                    </button>
                                )}
                            </div>
                            <p style={{ lineHeight: '1.6', color: '#555' }}>{post.content}</p>
                            <small style={{ display: 'block', marginTop: '10px', color: '#999' }}>
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