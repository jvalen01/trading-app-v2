import express from 'express';
import db from '../db.js';

const router = express.Router();

// Helper function to get all trades ordered by entry date
function getAllTradesOrdered() {
  const trades = db.prepare('SELECT * FROM trades ORDER BY created_at ASC').all();
  return trades.map(trade => {
    const metrics = calculateTradeMetrics(trade.id);
    return {
      ...metrics,
      entryDate: metrics.transactions.length > 0 ? metrics.transactions[0].transaction_date : null,
    };
  });
}

// Helper function to calculate account value at a specific trade
function calculateAccountValueAtTrade(tradeId, startingCapital = 10000) {
  const allTrades = getAllTradesOrdered();
  let accountValue = startingCapital;

  for (const trade of allTrades) {
    if (trade.id === tradeId) {
      // Return account value BEFORE this trade
      return accountValue;
    }

    // If trade is closed, add its P&L to account value
    if (trade.status === 'closed') {
      const totalSellCost = trade.transactions
        .filter(t => t.type === 'sell_partial' || t.type === 'sell_all')
        .reduce((sum, t) => sum + (t.price * t.quantity), 0);
      const totalBuyCost = trade.transactions
        .filter(t => t.type === 'buy')
        .reduce((sum, t) => sum + (t.price * t.quantity), 0);
      accountValue += (totalSellCost - totalBuyCost);
    }
  }

  return accountValue;
}

// Helper function to calculate R-multiple for a trade
function calculateRMultiple(tradeId, startingCapital = 10000) {
  const metrics = calculateTradeMetrics(tradeId);
  
  if (metrics.status !== 'closed') {
    return null; // Only calculate for closed trades
  }

  const accountValueAtEntry = calculateAccountValueAtTrade(tradeId, startingCapital);
  
  const totalSellCost = metrics.transactions
    .filter(t => t.type === 'sell_partial' || t.type === 'sell_all')
    .reduce((sum, t) => sum + (t.price * t.quantity), 0);
  const totalBuyCost = metrics.transactions
    .filter(t => t.type === 'buy')
    .reduce((sum, t) => sum + (t.price * t.quantity), 0);
  
  const pnl = totalSellCost - totalBuyCost;
  const rMultiple = accountValueAtEntry > 0 ? pnl / accountValueAtEntry : 0;

  return rMultiple;
}

// Helper function to calculate trade metrics
function calculateTradeMetrics(tradeId) {
  const trade = db.prepare('SELECT * FROM trades WHERE id = ?').get(tradeId);
  if (!trade) return null;

  const transactions = db.prepare('SELECT * FROM transactions WHERE trade_id = ? ORDER BY transaction_date ASC').all(tradeId);
  
  let totalBought = 0;
  let totalBuyCost = 0;
  let totalSold = 0;
  let totalSellCost = 0;

  transactions.forEach(t => {
    if (t.type === 'buy') {
      totalBought += t.quantity;
      totalBuyCost += t.price * t.quantity;
    } else if (t.type === 'sell_partial' || t.type === 'sell_all') {
      totalSold += t.quantity;
      totalSellCost += t.price * t.quantity;
    }
  });

  const currentQuantity = totalBought - totalSold;
  const averageBuyPrice = totalBought > 0 ? totalBuyCost / totalBought : 0;
  const totalCost = currentQuantity * averageBuyPrice;

  return {
    ...trade,
    currentQuantity,
    averageBuyPrice,
    totalCost,
    totalBought,
    totalSold,
    transactions,
  };
}

// GET /api/trades/active - Get all active trades
router.get('/active', (req, res) => {
  try {
    const trades = db.prepare('SELECT * FROM trades WHERE status = ? ORDER BY updated_at DESC').all('active');
    const enrichedTrades = trades.map(trade => calculateTradeMetrics(trade.id));
    res.json(enrichedTrades);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/trades/closed - Get all closed trades
router.get('/closed', (req, res) => {
  try {
    const trades = db.prepare('SELECT * FROM trades WHERE status = ? ORDER BY updated_at DESC').all('closed');
    
    const enrichedTrades = trades.map(trade => {
      const metrics = calculateTradeMetrics(trade.id);
      const totalSellCost = metrics.transactions
        .filter(t => t.type === 'sell_partial' || t.type === 'sell_all')
        .reduce((sum, t) => sum + (t.price * t.quantity), 0);
      
      const totalSoldQty = metrics.transactions
        .filter(t => t.type === 'sell_partial' || t.type === 'sell_all')
        .reduce((sum, t) => sum + t.quantity, 0);

      const averageExitPrice = totalSoldQty > 0 ? totalSellCost / totalSoldQty : 0;
      const realizedPL = totalSellCost - (metrics.totalBought * metrics.averageBuyPrice);
      const returnPercentage = metrics.totalBought > 0 ? (realizedPL / (metrics.totalBought * metrics.averageBuyPrice)) * 100 : 0;

      const entryDate = metrics.transactions.length > 0 ? metrics.transactions[0].transaction_date : null;
      const exitDate = metrics.transactions.length > 0 ? metrics.transactions[metrics.transactions.length - 1].transaction_date : null;

      return {
        ...metrics,
        averageExitPrice,
        realizedPL,
        returnPercentage,
        entryDate,
        exitDate,
      };
    });

    res.json(enrichedTrades);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/trades/with-rmetrics - Get all closed trades with R-multiple and account value metrics
router.get('/with-rmetrics', (req, res) => {
  try {
    const { startingCapital = 10000 } = req.query;
    const parsedCapital = parseFloat(startingCapital);

    const trades = db.prepare('SELECT * FROM trades WHERE status = ? ORDER BY created_at ASC').all('closed');
    
    const enrichedTrades = trades.map(trade => {
      const metrics = calculateTradeMetrics(trade.id);
      const totalSellCost = metrics.transactions
        .filter(t => t.type === 'sell_partial' || t.type === 'sell_all')
        .reduce((sum, t) => sum + (t.price * t.quantity), 0);
      
      const totalSoldQty = metrics.transactions
        .filter(t => t.type === 'sell_partial' || t.type === 'sell_all')
        .reduce((sum, t) => sum + t.quantity, 0);

      const averageExitPrice = totalSoldQty > 0 ? totalSellCost / totalSoldQty : 0;
      const realizedPL = totalSellCost - (metrics.totalBought * metrics.averageBuyPrice);
      const pnlPercentage = metrics.totalBought > 0 ? (realizedPL / (metrics.totalBought * metrics.averageBuyPrice)) * 100 : 0;

      const entryDate = metrics.transactions.length > 0 ? metrics.transactions[0].transaction_date : null;
      const exitDate = metrics.transactions.length > 0 ? metrics.transactions[metrics.transactions.length - 1].transaction_date : null;

      // Calculate account value at entry and R-multiple
      const accountValueAtEntry = calculateAccountValueAtTrade(trade.id, parsedCapital);
      const rMultiple = accountValueAtEntry > 0 ? realizedPL / accountValueAtEntry : 0;

      return {
        ...metrics,
        averageExitPrice,
        realizedPL,
        pnlPercentage,
        entryDate,
        exitDate,
        accountValueAtEntry,
        rMultiple,
      };
    });

    res.json(enrichedTrades);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/trades/:tradeId/transactions
router.get('/:tradeId/transactions', (req, res) => {
  try {
    const { tradeId } = req.params;
    const transactions = db.prepare('SELECT * FROM transactions WHERE trade_id = ? ORDER BY transaction_date ASC').all(tradeId);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/trades/buy - Create new trade or add to existing
router.post('/buy', (req, res) => {
  try {
    const { ticker, price, quantity, date, notes, trade_rating, trade_type, ncfd, time_of_entry } = req.body;

    // Validate inputs
    if (!ticker || !price || !quantity || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (price <= 0 || quantity <= 0) {
      return res.status(400).json({ error: 'Price and quantity must be greater than 0' });
    }

    const upperTicker = ticker.toUpperCase();

    // Check if active trade exists for this ticker
    let trade = db.prepare('SELECT * FROM trades WHERE ticker = ? AND status = ?').get(upperTicker, 'active');

    if (!trade) {
      // Create new trade with optional fields
      const stmt = db.prepare(`
        INSERT INTO trades (ticker, status, trade_rating, trade_type, ncfd, time_of_entry, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `);
      const result = stmt.run(upperTicker, 'active', trade_rating || null, trade_type || null, ncfd || null, time_of_entry || null);
      trade = { id: result.lastInsertRowid };
    }

    // Add transaction
    db.prepare(`
      INSERT INTO transactions (trade_id, type, price, quantity, transaction_date, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(trade.id, 'buy', price, quantity, date, notes || null);

    // Update trade's updated_at
    db.prepare('UPDATE trades SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(trade.id);

    const metrics = calculateTradeMetrics(trade.id);
    res.status(201).json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/trades/:tradeId/sell-partial
router.post('/:tradeId/sell-partial', (req, res) => {
  try {
    const { tradeId } = req.params;
    const { quantity, price, date, notes } = req.body;

    if (!quantity || !price || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const trade = db.prepare('SELECT * FROM trades WHERE id = ?').get(tradeId);
    if (!trade) {
      return res.status(404).json({ error: 'Trade not found' });
    }

    const metrics = calculateTradeMetrics(tradeId);
    if (quantity > metrics.currentQuantity) {
      return res.status(400).json({ error: 'Sell quantity exceeds current position' });
    }

    // Add sell transaction
    db.prepare(`
      INSERT INTO transactions (trade_id, type, price, quantity, transaction_date, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(tradeId, 'sell_partial', price, quantity, date, notes || null);

    // Update trade's updated_at
    db.prepare('UPDATE trades SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(tradeId);

    const updatedMetrics = calculateTradeMetrics(tradeId);
    res.status(201).json(updatedMetrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/trades/:tradeId/sell-all
router.post('/:tradeId/sell-all', (req, res) => {
  try {
    const { tradeId } = req.params;
    const { price, date, notes } = req.body;

    if (!price || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const trade = db.prepare('SELECT * FROM trades WHERE id = ?').get(tradeId);
    if (!trade) {
      return res.status(404).json({ error: 'Trade not found' });
    }

    const metrics = calculateTradeMetrics(tradeId);

    // Add sell transaction for entire position
    db.prepare(`
      INSERT INTO transactions (trade_id, type, price, quantity, transaction_date, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(tradeId, 'sell_all', price, metrics.currentQuantity, date, notes || null);

    // Close the trade
    db.prepare('UPDATE trades SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run('closed', tradeId);

    const updatedMetrics = calculateTradeMetrics(tradeId);
    res.status(201).json(updatedMetrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/transactions/:transactionId
router.put('/transaction/:transactionId', (req, res) => {
  try {
    const { transactionId } = req.params;
    const { price, quantity, date, notes } = req.body;

    if (!price || !quantity || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const transaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(transactionId);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    db.prepare(`
      UPDATE transactions
      SET price = ?, quantity = ?, transaction_date = ?, notes = ?
      WHERE id = ?
    `).run(price, quantity, date, notes || null, transactionId);

    // Update trade's updated_at
    db.prepare('UPDATE trades SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(transaction.trade_id);

    const metrics = calculateTradeMetrics(transaction.trade_id);
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/transactions/:transactionId
router.delete('/transaction/:transactionId', (req, res) => {
  try {
    const { transactionId } = req.params;

    const transaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(transactionId);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const tradeId = transaction.trade_id;

    // Delete transaction
    db.prepare('DELETE FROM transactions WHERE id = ?').run(transactionId);

    // Check if trade has any remaining transactions
    const remainingTxns = db.prepare('SELECT COUNT(*) as count FROM transactions WHERE trade_id = ?').get(tradeId);
    
    if (remainingTxns.count === 0) {
      // Delete trade if no transactions remain
      db.prepare('DELETE FROM trades WHERE id = ?').run(tradeId);
      res.json({ message: 'Transaction deleted and trade removed' });
    } else {
      // Update trade's updated_at
      db.prepare('UPDATE trades SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(tradeId);
      const metrics = calculateTradeMetrics(tradeId);
      res.json(metrics);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/trades/:tradeId - Delete a trade and all its transactions
router.delete('/:tradeId', (req, res) => {
  try {
    const tradeId = parseInt(req.params.tradeId);
    
    // Check if trade exists
    const trade = db.prepare('SELECT * FROM trades WHERE id = ?').get(tradeId);
    if (!trade) {
      return res.status(404).json({ error: 'Trade not found' });
    }

    // Delete all transactions for this trade
    db.prepare('DELETE FROM transactions WHERE trade_id = ?').run(tradeId);
    
    // Delete the trade
    db.prepare('DELETE FROM trades WHERE id = ?').run(tradeId);
    
    res.json({ message: 'Trade and all associated transactions deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
