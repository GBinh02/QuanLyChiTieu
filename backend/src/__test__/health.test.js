const request = require('supertest');
const { initDb } = require('../db');
const app = require('../app');

// Khởi tạo DB in-memory trước khi chạy test
beforeAll(async () => {
  await initDb();
});

// ── Health ────────────────────────────────────────────────────────────────────
describe('GET /api/health', () => {
  it('should return 200 with status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });
});

// ── Auth ──────────────────────────────────────────────────────────────────────
describe('POST /api/register', () => {
  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ username: 'testuser', email: 'test@example.com', password: 'password123' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message');
  });

  it('should return 400 if fields are missing', async () => {
    const res = await request(app).post('/api/register').send({});
    expect(res.statusCode).toBe(400);
  });

  it('should return 409 if email already exists', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ username: 'other', email: 'test@example.com', password: '123' });
    expect(res.statusCode).toBe(409);
  });
});

describe('POST /api/login', () => {
  it('should login successfully and return token', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'test@example.com', password: 'password123' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('username', 'testuser');
  });

  it('should return 401 with wrong password', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'test@example.com', password: 'wrongpassword' });
    expect(res.statusCode).toBe(401);
  });
});

// ── Transactions (Protected) ──────────────────────────────────────────────────
describe('GET /api/transactions', () => {
  it('should return 401 without token', async () => {
    const res = await request(app).get('/api/transactions');
    expect(res.statusCode).toBe(401);
  });
});

describe('POST /api/transactions', () => {
  it('should return 401 without token', async () => {
    const res = await request(app).post('/api/transactions').send({});
    expect(res.statusCode).toBe(401);
  });
});

// ── Full flow: login → add transaction ────────────────────────────────────────
describe('Authenticated transaction flow', () => {
  let token;

  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/api/login')
      .send({ email: 'test@example.com', password: 'password123' });
    token = loginRes.body.token;
  });

  it('should get empty transactions after login', async () => {
    const res = await request(app)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should add a new transaction', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({ description: 'Mua cà phê', amount: 50000, type: 'expense', category: 'Thực phẩm' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.description).toBe('Mua cà phê');
  });

  it('should return 400 if fields missing', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.statusCode).toBe(400);
  });
});
