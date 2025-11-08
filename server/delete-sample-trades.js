import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'trades.db');
const db = new Database(dbPath);

try {
  console.log('Deleting sample trades...');

  // Get count of trades before deletion
  const beforeCount = db.prepare('SELECT COUNT(*) as count FROM trades').get();
  console.log(`Trades before deletion: ${beforeCount.count}`);

  // Delete the sample trades we just added (AAPL, TSLA, MSFT, GOOGL, AMZN, META, NVDA, NFLX)
  const sampleTickers = ['AAPL', 'TSLA', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'NFLX'];
  
  sampleTickers.forEach((ticker) => {
    const trades = db.prepare('SELECT id FROM trades WHERE ticker = ?').all(ticker);
    trades.forEach((trade) => {
      // Delete transactions first (due to foreign key)
      db.prepare('DELETE FROM transactions WHERE trade_id = ?').run(trade.id);
      // Delete the trade
      db.prepare('DELETE FROM trades WHERE id = ?').run(trade.id);
      console.log(`✓ Deleted ${ticker}`);
    });
  });

  const afterCount = db.prepare('SELECT COUNT(*) as count FROM trades').get();
  console.log(`Trades after deletion: ${afterCount.count}`);
  console.log('\n✅ All sample trades deleted successfully!');
} catch (error) {
  console.error('Error deleting sample trades:', error.message);
} finally {
  db.close();
}
