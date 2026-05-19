const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('./db');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_change_in_production';

const corsOptions = {
  origin: process.env.CORS_ORIGIN 
    ? (process.env.CORS_ORIGIN.includes(',') ? process.env.CORS_ORIGIN.split(',') : process.env.CORS_ORIGIN)
    : /^http:\/\/localhost:\d+$/,
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

// Middleware verify JWT
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

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Auth ──────────────────────────────────────────────────────────────────────
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'username, email và password là bắt buộc' });
  }
  const db = getDb();
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.run(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );
    res.status(201).json({ message: 'Đăng ký thành công' });
  } catch (error) {
    if (error.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Email hoặc username đã tồn tại' });
    }
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email và password là bắt buộc' });
  }
  const db = getDb();
  try {
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
    }
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token, username: user.username });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Transactions (Protected) ──────────────────────────────────────────────────
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
  if (!description || !amount || !type) {
    return res.status(400).json({ error: 'description, amount và type là bắt buộc' });
  }
  const db = getDb();
  try {
    const result = await db.run(
      'INSERT INTO transactions (user_id, description, amount, type, category) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, description, amount, type, category || 'Khác']
    );
    const newRow = await db.get('SELECT * FROM transactions WHERE id = ?', [result.lastID]);
    res.status(201).json(newRow);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/transactions/bulk', authenticateToken, async (req, res) => {
  const { transactions } = req.body;
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
  }
  const db = getDb();
  try {
    await db.run('BEGIN TRANSACTION');
    for (const t of transactions) {
      await db.run(
        'INSERT INTO transactions (user_id, description, amount, type, category) VALUES (?, ?, ?, ?, ?)',
        [req.user.id, t.description, t.amount, t.type, t.category || 'Khác']
      );
    }
    await db.run('COMMIT');
    res.status(201).json({ message: `Đã nhập thành công ${transactions.length} giao dịch` });
  } catch (error) {
    await db.run('ROLLBACK');
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/transactions/:id', authenticateToken, async (req, res) => {
  const db = getDb();
  try {
    const result = await db.run(
      'DELETE FROM transactions WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Không tìm thấy giao dịch' });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;
