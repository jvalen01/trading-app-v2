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
    time_of_entry TEXT CHECK(time_of_entry IN ('ORB1', 'ORB5', 'ORB15', 'ORB30', 'ORB60', 'EOD', 'Other')),
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
    commission REAL DEFAULT 1,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trade_id) REFERENCES trades(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS capital_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_name TEXT UNIQUE NOT NULL,
    setting_value REAL NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS capital_adjustments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    adjustment_amount REAL NOT NULL,
    reason TEXT,
    adjusted_at TEXT DEFAULT CURRENT_TIMESTAMP,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_trade_id ON transactions(trade_id);
  CREATE INDEX IF NOT EXISTS idx_ticker ON trades(ticker);
`);

// Add time_of_entry column if it doesn't exist (for existing databases)
try {
  db.exec(`
    ALTER TABLE trades ADD COLUMN time_of_entry TEXT CHECK(time_of_entry IN ('ORB1', 'ORB5', 'ORB15', 'ORB30', 'ORB60', 'EOD', 'Other'));
  `);
} catch (error) {
  // Column might already exist, ignore error
}

// Add commission column if it doesn't exist (for existing databases)
try {
  db.exec(`
    ALTER TABLE transactions ADD COLUMN commission REAL DEFAULT 1;
  `);
} catch (error) {
  // Column might already exist, ignore error
}

export default db;
