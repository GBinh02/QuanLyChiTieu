const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

let db;

async function initDb() {
  try {
    // Dùng :memory: khi test để không cần file DB thật
    const filename =
      process.env.NODE_ENV === 'test'
        ? ':memory:'
        : path.join(__dirname, '../database.sqlite');

    db = await open({ filename, driver: sqlite3.Database });

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
        category TEXT DEFAULT 'Khác',
        date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    if (process.env.NODE_ENV !== 'test') {
      console.log('✅ Kết nối SQLite thành công');
    }
    return db;
  } catch (error) {
    console.error('❌ Lỗi kết nối Database:', error.message);
    throw error;
  }
}

function getDb() {
  if (!db) {
    throw new Error('Database chưa được khởi tạo. Gọi initDb() trước.');
  }
  return db;
}

module.exports = { initDb, getDb };
