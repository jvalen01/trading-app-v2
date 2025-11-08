import express from 'express';
import cors from 'cors';
import tradesRouter from './routes/trades.js';
import capitalRouter from './routes/capital.js';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/trades', tradesRouter);
app.use('/api/capital', capitalRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Trading dashboard server running on http://localhost:${PORT}`);
});
