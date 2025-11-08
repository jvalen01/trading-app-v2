import express from 'express';
import db from '../db.js';

const router = express.Router();

// GET /api/capital/settings - Get current capital settings
router.get('/settings', (req, res) => {
  try {
    const startingCapital = db.prepare('SELECT setting_value FROM capital_settings WHERE setting_name = ?').get('starting_capital');
    const lastAdjustment = db.prepare('SELECT adjustment_amount, reason, adjusted_at FROM capital_adjustments ORDER BY adjusted_at DESC LIMIT 1').get();
    
    res.json({
      startingCapital: startingCapital ? startingCapital.setting_value : 10000,
      lastAdjustment,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/capital/settings - Set or update starting capital
router.post('/settings', (req, res) => {
  try {
    const { startingCapital } = req.body;

    if (!startingCapital || startingCapital <= 0) {
      return res.status(400).json({ error: 'Starting capital must be greater than 0' });
    }

    // Check if record exists
    const existing = db.prepare('SELECT id FROM capital_settings WHERE setting_name = ?').get('starting_capital');
    
    if (existing) {
      db.prepare('UPDATE capital_settings SET setting_value = ?, updated_at = CURRENT_TIMESTAMP WHERE setting_name = ?')
        .run(startingCapital, 'starting_capital');
    } else {
      db.prepare('INSERT INTO capital_settings (setting_name, setting_value) VALUES (?, ?)')
        .run('starting_capital', startingCapital);
    }

    res.json({
      startingCapital,
      message: 'Starting capital updated successfully',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/capital/adjust - Add a capital adjustment (for manual corrections)
router.post('/adjust', (req, res) => {
  try {
    const { amount, reason } = req.body;

    if (amount === undefined || amount === null) {
      return res.status(400).json({ error: 'Adjustment amount is required' });
    }

    if (typeof amount !== 'number') {
      return res.status(400).json({ error: 'Adjustment amount must be a number' });
    }

    // Insert adjustment
    const result = db.prepare(`
      INSERT INTO capital_adjustments (adjustment_amount, reason, adjusted_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `).run(amount, reason || null);

    const adjustment = db.prepare('SELECT * FROM capital_adjustments WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      id: adjustment.id,
      amount: adjustment.adjustment_amount,
      reason: adjustment.reason,
      adjustedAt: adjustment.adjusted_at,
      message: `Capital adjustment of ${amount > 0 ? '+' : ''}${amount.toFixed(2)} recorded`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/capital/adjustments - Get all capital adjustments
router.get('/adjustments', (req, res) => {
  try {
    const adjustments = db.prepare(`
      SELECT id, adjustment_amount, reason, adjusted_at, created_at
      FROM capital_adjustments
      ORDER BY adjusted_at DESC
    `).all();

    res.json(adjustments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/capital/adjustments/:id - Delete an adjustment
router.delete('/adjustments/:id', (req, res) => {
  try {
    const { id } = req.params;

    const adjustment = db.prepare('SELECT * FROM capital_adjustments WHERE id = ?').get(id);
    if (!adjustment) {
      return res.status(404).json({ error: 'Adjustment not found' });
    }

    db.prepare('DELETE FROM capital_adjustments WHERE id = ?').run(id);

    res.json({
      message: 'Capital adjustment deleted successfully',
      deletedAmount: adjustment.adjustment_amount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/capital/summary - Get complete capital summary with all adjustments
router.get('/summary', (req, res) => {
  try {
    const { startingCapital } = req.query;
    const parsedStarting = startingCapital ? parseFloat(startingCapital) : null;

    // Get database starting capital
    const dbStarting = db.prepare('SELECT setting_value FROM capital_settings WHERE setting_name = ?').get('starting_capital');
    const currentStarting = parsedStarting || (dbStarting ? dbStarting.setting_value : 10000);

    // Get all adjustments
    const adjustments = db.prepare(`
      SELECT adjustment_amount FROM capital_adjustments
      ORDER BY adjusted_at ASC
    `).all();

    const totalAdjustments = adjustments.reduce((sum, adj) => sum + adj.adjustment_amount, 0);

    res.json({
      startingCapital: currentStarting,
      totalAdjustments,
      adjustmentCount: adjustments.length,
      currentCapitalBeforeTrades: currentStarting + totalAdjustments,
      adjustments,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
