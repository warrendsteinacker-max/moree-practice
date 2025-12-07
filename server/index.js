// server/index.js - FINAL VERSION WITH USERS ALLOWED TO POST
require('dotenv').config({ path: '../.env' }); 
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 

const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');

const PORT = 5000;
const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_must_change'; 

const file = path.join(__dirname, 'data', 'db.json');
const adapter = new JSONFile(file);
const db = new Low(adapter, { users: [], posts: [] }); 

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
    db.data = db.data || { users: [], posts: [] };

    if (db.data.users.length === 0) {
        const adminUsername = process.env.ADMIN_USERNAME;
        const adminPassword = process.env.ADMIN_PASSWORD;
        
        if (!adminUsername || !adminPassword) {
            console.error('\nFATAL ERROR: ADMIN_USERNAME or ADMIN_PASSWORD not set in .env file!');
            return; 
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt); 
        
        const adminUser = {
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

// POST /api/register - Create a new user account
app.post('/api/register', async (req, res) => {
    await db.read();
    const { name, username, password } = req.body;

    if (db.data.users.find(u => u.username === username)) {
        return res.status(400).send('Username already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
        id: Date.now().toString(),
        name: name,
        username: username,
        password: hashedPassword,
        role: 'user' 
    };

    db.data.users.push(newUser);
    await db.write();
    res.status(201).send('Account created successfully. Please log in.');
});


// POST /api/login - Generate JWT token
app.post('/api/login', async (req, res) => {
    await db.read();
    const { username, password } = req.body;
    const user = db.data.users.find(u => u.username === username);

    if (!user) {
        return res.status(400).send('Cannot find user.');
    }

    if (await bcrypt.compare(password, user.password)) {
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


// GET /api/posts - View ALL posts (Public - No Token Required)
app.get('/api/posts', async (req, res) => {
    await db.read();
    res.json(db.data.posts);
});

// POST /api/posts - Add a new post (All Authenticated Users)
app.post('/api/posts', authenticateToken, async (req, res) => {
    await db.read();
    
    // **LOGIC CHANGE HERE:** REMOVED THE IF STATEMENT. 
    // The authenticateToken middleware ensures the user is logged in.
    
    const newPost = {
        id: Date.now().toString(),
        title: req.body.title,
        content: req.body.content,
        authorId: req.user.id, // Records the user who created it
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

    // Authorization: Admin check REMAINS on the DELETE route.
    if (req.user.role !== 'admin') {
         return res.status(403).send('Only administrators can delete posts.');
    }

    const initialLength = db.data.posts.length;
    db.data.posts = db.data.posts.filter(p => p.id !== postId);

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
        console.log(`Admin can ADD and DELETE. Standard user can ADD.`);
        console.log(`======================================================`);
    });
}).catch(err => {
    console.error('Error initializing Lowdb:', err);
});