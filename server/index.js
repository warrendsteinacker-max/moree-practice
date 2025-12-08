// Add the 'path' module import
const path = require('path');

// Use path.resolve to reliably load the .env file from the root directory
// This fixes issues caused by running 'node index.js' from different directories.
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const PORT = 5000;
const app = express();
const dbFile = path.join(__dirname, 'data', 'db.json');
const adapter = new JSONFile(dbFile);
const db = new Low(adapter);

// Ensure JWT_SECRET is set
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development';
if (JWT_SECRET === 'fallback_secret_for_development') {
    console.warn("WARNING: Using fallback JWT_SECRET. Please set JWT_SECRET in your .env file.");
}


// --- Middleware ---
app.use(cors());
app.use(bodyParser.json());

// --- Database Initialization ---
const initializeDb = async () => {
    await db.read();
    db.data = db.data || { users: [], posts: [] };

    // Check if admin user needs to be created
    const adminExists = db.data.users.some(user => user.username === process.env.ADMIN_USERNAME);

    if (!adminExists && process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) {
        const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
        
        db.data.users.push({
            id: process.env.ADMIN_ID || 'admin-001',
            name: process.env.ADMIN_NAME || 'Default Administrator',
            username: process.env.ADMIN_USERNAME,
            password: hashedPassword,
            role: 'admin'
        });
        
        await db.write();
        console.log(`Default admin user created successfully from .env: username="${process.env.ADMIN_USERNAME}"`);
    } else if (!process.env.ADMIN_USERNAME) {
        console.warn("WARNING: ADMIN_USERNAME not found in .env. Admin user creation skipped.");
    }
};

// --- Authentication Middleware ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401); // No token provided

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Token is invalid or expired
        req.user = user;
        next();
    });
};

const authorizeAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).send('Forbidden: Only administrators can perform this action.');
    }
    next();
};

// --- Routes ---

// Public Route: User Registration
app.post('/api/register', async (req, res) => {
    await db.read();
    const { name, username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Username and password are required.');
    }

    if (db.data.users.some(user => user.username === username)) {
        return res.status(409).send('Username already exists.');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            id: Date.now().toString(),
            name: name || 'Community Member',
            username,
            password: hashedPassword,
            role: 'user' // Default role for new registrations
        };
        db.data.users.push(newUser);
        await db.write();
        res.status(201).send('Account created successfully.');
    } catch (e) {
        res.status(500).send('Registration failed.');
    }
});

// Public Route: Login
app.post('/api/login', async (req, res) => {
    await db.read();
    const { username, password } = req.body;
    const user = db.data.users.find(u => u.username === username);

    if (!user) {
        return res.status(401).send('Invalid credentials');
    }

    try {
        if (await bcrypt.compare(password, user.password)) {
            const accessToken = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
            res.json({ accessToken, role: user.role, name: user.name });
        } else {
            res.status(401).send('Invalid credentials');
        }
    } catch (e) {
        res.status(500).send('Login failed due to server error.');
    }
});

// Public Route: Get All Posts
app.get('/api/posts', async (req, res) => {
    await db.read();
    // Posts are publically visible
    res.json(db.data.posts);
});

// Authenticated Route: Add New Post (Any authenticated user)
app.post('/api/posts', authenticateToken, async (req, res) => {
    await db.read();
    const { title, content } = req.body;

    if (!title || !content) {
        return res.status(400).send('Title and content are required.');
    }

    const newPost = {
        id: Date.now().toString(),
        title,
        content,
        authorId: req.user.id,
        createdAt: new Date().toISOString()
    };
    
    db.data.posts.push(newPost);
    await db.write();
    res.status(201).json(newPost);
});

// Admin-Only Route: Delete Post
app.delete('/api/posts/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    await db.read();
    const postId = req.params.id;
    const initialLength = db.data.posts.length;

    db.data.posts = db.data.posts.filter(post => post.id !== postId);
    
    if (db.data.posts.length < initialLength) {
        await db.write();
        res.sendStatus(204); // Success, no content
    } else {
        res.status(404).send('Post not found.');
    }
});


// --- Server Start ---
initializeDb().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(e => {
    console.error("Database initialization failed:", e);
});