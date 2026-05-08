require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

app.use(cors({
    origin: /^http:\/\/localhost:\d+$/,
    credentials: true
}));
app.use(express.json());

let db;

async function initDb() {
    try {
        db = await open({
            filename: './database.sqlite',
            driver: sqlite3.Database
        });

        // Create tables if they don't exist
        await db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                email TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                description TEXT NOT NULL,
                amount REAL NOT NULL,
                type TEXT NOT NULL,
                category TEXT,
                date DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `);
        console.log('Connected to SQLite Database');
    } catch (error) {
        console.error('Database Connection Error:', error.message);
        process.exit(1);
    }
}

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Health Check
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Auth Routes
app.post('/api/register', async (req, res) => {
    console.log('Registration attempt:', req.body);
    const { username, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.run(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error details:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, username: user.username });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Transaction Routes (Protected)
app.get('/api/transactions', authenticateToken, async (req, res) => {
    try {
        const rows = await db.all(
            'SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC',
            [req.user.id]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/transactions', authenticateToken, async (req, res) => {
    const { description, amount, type, category } = req.body;
    try {
        const result = await db.run(
            'INSERT INTO transactions (user_id, description, amount, type, category) VALUES (?, ?, ?, ?, ?)',
            [req.user.id, description, amount, type, category]
        );
        const newRow = await db.get('SELECT * FROM transactions WHERE id = ?', [result.lastID]);
        res.status(201).json(newRow);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/transactions/bulk', authenticateToken, async (req, res) => {
    const { transactions } = req.body;
    if (!Array.isArray(transactions)) return res.status(400).json({ error: 'Invalid data format' });

    try {
        await db.run('BEGIN TRANSACTION');
        for (const t of transactions) {
            await db.run(
                'INSERT INTO transactions (user_id, description, amount, type, category) VALUES (?, ?, ?, ?, ?)',
                [req.user.id, t.description, t.amount, t.type, t.category]
            );
        }
        await db.run('COMMIT');
        res.status(201).json({ message: `Successfully imported ${transactions.length} transactions` });
    } catch (error) {
        await db.run('ROLLBACK');
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/transactions/:id', authenticateToken, async (req, res) => {
    try {
        await db.run('DELETE FROM transactions WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

initDb().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
