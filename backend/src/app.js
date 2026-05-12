<<<<<<< HEAD
const express = require("express");
const app = express();

app.use(express.json());

// API 1: health test
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// API 2: transactions (fake data)
app.get("/api/transactions", (req, res) => {
  res.status(200).json([]);
});

// API 3: validation POST
app.post("/api/transactions", (req, res) => {
  const { amount } = req.body;

  if (!amount) {
    return res.status(400).json({ error: "amount is required" });
  }

  res.status(201).json({ message: "created" });
});

module.exports = app;
=======
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('./db');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

app.use(cors({
    origin: /^http:\/\/localhost:\d+$/,
    credentials: true
}));
app.use(express.json());

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
    const { username, email, password } = req.body;
    const db = getDb();
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.run(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const db = getDb();
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
    const db = getDb();
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
    const db = getDb();
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

    const db = getDb();
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
    const db = getDb();
    try {
        await db.run('DELETE FROM transactions WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = app;
>>>>>>> origin/feature/ui-auth
