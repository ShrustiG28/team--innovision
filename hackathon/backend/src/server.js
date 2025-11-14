import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import didRoutes from './routes/didRoutes.js';
import vcRoutes from './routes/vcRoutes.js';
import verifyRoutes from './routes/verifyRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`\n📨 [${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api', didRoutes);
app.use('/api', vcRoutes);
app.use('/api', verifyRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('\n❌ Error:', err.message);
  res.status(500).json({
    error: err.message,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║  🔐 Decentralized Identity Vault Backend    ║
║  Server running on http://localhost:${PORT}  ║
╚════════════════════════════════════════════╝
  `);
});

export default app;
