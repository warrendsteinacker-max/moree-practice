// server/index.js

// 1. Import necessary packages
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Lowdb setup
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const path = require('path');

// 2. Configuration
const PORT = 5000;
const app = express();

// Set up Lowdb to use a JSON file in the 'data' directory
const file = path.join(__dirname, 'data', 'db.json');
const adapter = new JSONFile(file);
const db = new Low(adapter, { todos: [] }); // <-- FIX 1: Provide default data directly

// 3. Middleware
// Enable CORS for frontend communication
app.use(cors());

// Parse incoming request bodies as JSON
app.use(bodyParser.json());

// 4. Initialize Database (Crucial step for Lowdb)
async function initializeDb() {
    // Read data from db.json file
    await db.read();

    // Check if data is null/undefined (first run or empty file)
    // The default data is now passed in the Low constructor (Fix 1), 
    // so this check may be redundant but is safe to keep for explicit logging.
    if (!db.data || db.data.todos === undefined) { 
        db.data = { todos: [] }; // Ensures the todos array exists
        await db.write(); // Write the default structure to the file
        console.log('Lowdb initialized with default data structure.');
    }
}

// 5. Define API Routes

// GET /api/todos - Fetch all items
app.get('/api/todos', async (req, res) => {
    // Ensuring db.read() is inside the route handler is good practice
    // for keeping the data fresh, but adds overhead. If the database 
    // is large, you should only read it once in initializeDb. 
    // For now, keep it simple:
    await db.read(); 
    res.json(db.data.todos);
});

// POST /api/todos - Add a new item
app.post('/api/todos', async (req, res) => {
    await db.read();
    
    // Get the new item details from the request body
    const newItem = {
        id: Date.now().toString(), // Simple unique ID
        text: req.body.text,
        completed: false
    };

    // Add the new item to the 'todos' array
    db.data.todos.push(newItem);

    // Save changes back to the db.json file
    await db.write();

    // Respond with the newly created item
    res.status(201).json(newItem);
});


// 6. Start the Server
initializeDb().then(() => {
    app.listen(PORT, () => {
        console.log(`\n🎉 Server is running on http://localhost:${PORT}`);
        console.log(`API endpoint: http://localhost:${PORT}/api/todos`);
    });
}).catch(err => {
    console.error('Error initializing Lowdb:', err);
});