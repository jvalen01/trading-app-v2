import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'trades.db');
const db = new Database(dbPath);

// Sample trades with realistic data
const sampleTrades = [
  {
    ticker: 'AAPL',
    entries: [{ price: 150, quantity: 10, date: '2025-11-01' }],
    exits: [{ price: 155, quantity: 10, date: '2025-11-02' }],
    rating: 4,
    type: 'Breakout',
    ncfd: 145,
    time_of_entry: 'ORB1',
  },
  {
    ticker: 'TSLA',
    entries: [{ price: 250, quantity: 5, date: '2025-11-02' }],
    exits: [{ price: 245, quantity: 5, date: '2025-11-03' }],
    rating: 2,
    type: 'Day Trade',
    ncfd: 240,
    time_of_entry: 'ORB5',
  },
  {
    ticker: 'MSFT',
    entries: [{ price: 370, quantity: 3, date: '2025-11-03' }],
    exits: [{ price: 385, quantity: 3, date: '2025-11-05' }],
    rating: 5,
    type: 'Short Pivot',
    ncfd: 360,
    time_of_entry: 'ORB15',
  },
  {
    ticker: 'GOOGL',
    entries: [{ price: 140, quantity: 7, date: '2025-11-04' }],
    exits: [{ price: 135, quantity: 7, date: '2025-11-06' }],
    rating: 3,
    type: 'Day Trade',
    ncfd: 138,
    time_of_entry: 'ORB30',
  },
  {
    ticker: 'AMZN',
    entries: [{ price: 180, quantity: 4, date: '2025-11-05' }],
    exits: [{ price: 195, quantity: 4, date: '2025-11-07' }],
    rating: 5,
    type: 'Parabolic Long',
    ncfd: 175,
    time_of_entry: 'ORB60',
  },
  {
    ticker: 'META',
    entries: [{ price: 500, quantity: 2, date: '2025-11-06' }],
    exits: [{ price: 485, quantity: 2, date: '2025-11-08' }],
    rating: 1,
    type: 'EP',
    ncfd: 495,
    time_of_entry: 'EOD',
  },
  {
    ticker: 'NVDA',
    entries: [{ price: 880, quantity: 1, date: '2025-11-07' }],
    exits: [{ price: 920, quantity: 1, date: '2025-11-09' }],
    rating: 5,
    type: 'Breakout',
    ncfd: 870,
    time_of_entry: 'Other',
  },
  {
    ticker: 'NFLX',
    entries: [{ price: 240, quantity: 3, date: '2025-11-08' }],
    exits: [{ price: 235, quantity: 3, date: '2025-11-09' }],
    rating: 2,
    type: 'Day Trade',
    ncfd: 238,
    time_of_entry: 'ORB1',
  },
];

try {
  console.log('Adding sample trades to database...');

  sampleTrades.forEach((trade, index) => {
    // Insert trade
    const tradeResult = db.prepare(`
      INSERT INTO trades (ticker, status, trade_rating, trade_type, ncfd, time_of_entry, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(trade.ticker, 'closed', trade.rating, trade.type, trade.ncfd, trade.time_of_entry);

    const tradeId = tradeResult.lastInsertRowid;

    // Insert entry transactions
    trade.entries.forEach((entry) => {
      db.prepare(`
        INSERT INTO transactions (trade_id, type, price, quantity, transaction_date, created_at)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).run(tradeId, 'buy', entry.price, entry.quantity, entry.date);
    });

    // Insert exit transactions
    trade.exits.forEach((exit) => {
      db.prepare(`
        INSERT INTO transactions (trade_id, type, price, quantity, transaction_date, created_at)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).run(tradeId, 'sell_all', exit.price, exit.quantity, exit.date);
    });

    console.log(`✓ Added trade ${index + 1}/${sampleTrades.length}: ${trade.ticker}`);
  });

  console.log('\n✅ All sample trades added successfully!');
  console.log('\nTrade Summary:');
  sampleTrades.forEach((trade) => {
    const entryValue = trade.entries.reduce((sum, e) => sum + e.price * e.quantity, 0);
    const exitValue = trade.exits.reduce((sum, e) => sum + e.price * e.quantity, 0);
    const pl = exitValue - entryValue;
    const plPercent = (pl / entryValue) * 100;
    console.log(`${trade.ticker}: ${pl > 0 ? '+' : ''}$${pl.toFixed(2)} (${plPercent > 0 ? '+' : ''}${plPercent.toFixed(2)}%)`);
  });

  // Get all trades to show what was added
  const allTrades = db.prepare('SELECT * FROM trades WHERE status = ?').all('closed');
  console.log(`\nTotal closed trades in database: ${allTrades.length}`);
} catch (error) {
  console.error('Error adding sample trades:', error.message);
} finally {
  db.close();
}
