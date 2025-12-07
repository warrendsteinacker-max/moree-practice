// server/index.js

// 1. Import necessary packages and dotenv
// FIX: Set path to look one level up (in the project root) for .env
require('dotenv').config({ path: '../.env' }); 
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 

// Lowdb setup
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');

// 2. Configuration
const PORT = 5000;
const app = express();
// USE ENVIRONMENT VARIABLE FOR SECRET
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_must_change'; 

// Set up Lowdb
const file = path.join(__dirname, 'data', 'db.json');
const adapter = new JSONFile(file);
const db = new Low(adapter, { users: [], posts: [] }); 

// 3. Middleware
app.use(cors());
app.use(bodyParser.json());

// --- Authentication Middleware ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// --- Initialization Logic ---
async function initializeDb() {
    await db.read();

    // Ensure data structure is set
    db.data = db.data || { users: [], posts: [] };

    // Set default admin if no users exist
    if (db.data.users.length === 0) {
        
        // Access credentials from process.env
        const adminUsername = process.env.ADMIN_USERNAME;
        const adminPassword = process.env.ADMIN_PASSWORD;
        
        if (!adminUsername || !adminPassword) {
            console.error('\nFATAL ERROR: ADMIN_USERNAME or ADMIN_PASSWORD not set in .env file!');
            return; 
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt); 
        
        const adminUser = {
            // All values pulled from environment variables
            id: process.env.ADMIN_ID || 'admin-001',
            name: process.env.ADMIN_NAME || 'Admin User',
            username: adminUsername,
            password: hashedPassword,
            role: 'admin'
        };
        db.data.users.push(adminUser);
        await db.write();
        console.log(`\nDefault admin user created successfully from .env: username="${adminUsername}"`);
    }
}

// 5. Define API Routes
// ----------------------------------------------------

// POST /api/login - Generate JWT token
app.post('/api/login', async (req, res) => {
    await db.read();
    const { username, password } = req.body;
    const user = db.data.users.find(u => u.username === username);

    if (!user) {
        return res.status(400).send('Cannot find user.');
    }

    if (await bcrypt.compare(password, user.password)) {
        // Successful login, create and send token
        const accessToken = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '1h' }
        );
        res.json({ accessToken: accessToken, role: user.role });
    } else {
        res.status(401).send('Invalid Credentials.');
    }
});


// GET /api/posts - View ALL posts (Public)
app.get('/api/posts', async (req, res) => {
    await db.read();
    res.json(db.data.posts);
});

// POST /api/posts - Add a new post (Admin Only)
app.post('/api/posts', authenticateToken, async (req, res) => {
    await db.read();
    
    // Authorization: Only allow Admin to add posts
    if (req.user.role !== 'admin') {
         return res.status(403).send('Only administrators can add new posts.');
    }
    
    const newPost = {
        id: Date.now().toString(),
        title: req.body.title,
        content: req.body.content,
        authorId: req.user.id,
        createdAt: new Date().toISOString()
    };

    db.data.posts.push(newPost);
    await db.write();
    res.status(201).json(newPost);
});

// DELETE /api/posts/:id - Delete a post (Admin Only)
app.delete('/api/posts/:id', authenticateToken, async (req, res) => {
    await db.read();
    const postId = req.params.id;

    // Authorization: Only allow admin role to delete posts
    if (req.user.role !== 'admin') {
         return res.status(403).send('Only administrators can delete posts.');
    }

    const initialLength = db.data.posts.length;
    db.data.posts = db.data.posts.posts.filter(p => p.id !== postId); // Corrected filter line

    if (db.data.posts.length === initialLength) {
        return res.status(404).send('Post not found.');
    }

    await db.write();
    res.status(200).send('Post deleted successfully.');
});


// 6. Start the Server
initializeDb().then(() => {
    app.listen(PORT, () => {
        console.log(`\n======================================================`);
        console.log(`🎉 Server is running on http://localhost:${PORT}`);
        console.log(`API Docs: /api/login, /api/posts`);
        console.log(`======================================================`);
    });
}).catch(err => {
    console.error('Error initializing Lowdb:', err);
});