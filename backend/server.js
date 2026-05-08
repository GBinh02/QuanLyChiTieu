require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
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

let pool;

async function initDb() {
    try {
        pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10
        });
        console.log('Connected to MySQL');
    } catch (error) {
        console.error('MySQL Connection Error:', error.message);
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
        await pool.query(
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
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = users[0];
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
        const [rows] = await pool.query(
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
        const [result] = await pool.query(
            'INSERT INTO transactions (user_id, description, amount, type, category) VALUES (?, ?, ?, ?, ?)',
            [req.user.id, description, amount, type, category]
        );
        const [newRows] = await pool.query('SELECT * FROM transactions WHERE id = ?', [result.insertId]);
        res.status(201).json(newRows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/transactions/:id', authenticateToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM transactions WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

initDb().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
