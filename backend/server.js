const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Import database
const db = require('./database/init');

// Import routes
const transactionRoutes = require('./routes/transactions');
const receiptRoutes = require('./routes/receipts');
const matchRoutes = require('./routes/matches');

const app = express();
const PORT = process.env.PORT || 6533;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files (uploaded receipts)
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/transactions', transactionRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/matches', matchRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Expense Matcher API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found` 
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
}

module.exports = app;
