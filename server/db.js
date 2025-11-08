import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create database connection
const dbPath = path.join(__dirname, '..', 'trades.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS trades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticker TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'closed')),
    trade_rating INTEGER CHECK(trade_rating >= 0 AND trade_rating <= 5),
    trade_type TEXT CHECK(trade_type IN ('Breakout', 'Short Pivot', 'Parabolic Long', 'Day Trade', 'EP', 'UnR')),
    ncfd REAL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trade_id INTEGER NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('buy', 'sell_partial', 'sell_all')),
    price REAL NOT NULL,
    quantity REAL NOT NULL,
    transaction_date TEXT NOT NULL,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trade_id) REFERENCES trades(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_trade_id ON transactions(trade_id);
  CREATE INDEX IF NOT EXISTS idx_ticker ON trades(ticker);
`);

export default db;
