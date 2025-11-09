import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'trades.db');
const db = new Database(dbPath);

try {
  console.log('Deleting all trades from database...');

  // Get counts before deletion
  const tradesBefore = db.prepare('SELECT COUNT(*) as count FROM trades').get();
  const transactionsBefore = db.prepare('SELECT COUNT(*) as count FROM transactions').get();
  const capitalAdjustmentsBefore = db.prepare('SELECT COUNT(*) as count FROM capital_adjustments').get();

  console.log(`\nBefore deletion:`);
  console.log(`- Trades: ${tradesBefore.count}`);
  console.log(`- Transactions: ${transactionsBefore.count}`);
  console.log(`- Capital adjustments: ${capitalAdjustmentsBefore.count}`);

  // Delete all trades (transactions will be deleted automatically due to CASCADE)
  const deleteTradesResult = db.prepare('DELETE FROM trades').run();
  console.log(`\n✅ Deleted ${deleteTradesResult.changes} trades`);

  // Delete all capital adjustments to start fresh
  const deleteCapitalAdjustmentsResult = db.prepare('DELETE FROM capital_adjustments').run();
  console.log(`✅ Deleted ${deleteCapitalAdjustmentsResult.changes} capital adjustments`);

  // Get counts after deletion
  const tradesAfter = db.prepare('SELECT COUNT(*) as count FROM trades').get();
  const transactionsAfter = db.prepare('SELECT COUNT(*) as count FROM transactions').get();
  const capitalAdjustmentsAfter = db.prepare('SELECT COUNT(*) as count FROM capital_adjustments').get();

  console.log(`\nAfter deletion:`);
  console.log(`- Trades: ${tradesAfter.count}`);
  console.log(`- Transactions: ${transactionsAfter.count}`);
  console.log(`- Capital adjustments: ${capitalAdjustmentsAfter.count}`);

  console.log('\n🎉 Database cleared successfully! Ready to start fresh.');

} catch (error) {
  console.error('❌ Error deleting trades:', error.message);
} finally {
  db.close();
}