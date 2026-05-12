const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

let db;

async function initDb() {
    try {
        db = await open({
            filename: path.join(__dirname, '../database.sqlite'),
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
        return db;
    } catch (error) {
        console.error('Database Connection Error:', error.message);
        throw error;
    }
}

function getDb() {
    if (!db) {
        throw new Error('Database not initialized. Call initDb first.');
    }
    return db;
}

module.exports = { initDb, getDb };
