const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Allow overriding the database path (useful for tests)
const dbPath = process.env.DB_PATH || path.join(__dirname, 'expense_matcher.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Create tables
const initDatabase = () => {
  // Transactions table
  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_date DATE NOT NULL,
      description TEXT NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      card_last_four TEXT,
      category TEXT,
      chase_transaction_id TEXT UNIQUE,
      external_transaction_id TEXT,
      sales_tax DECIMAL(10,2),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating transactions table:', err.message);
    } else {
      // Add new columns if they don't exist (for existing databases)
      db.run(`ALTER TABLE transactions ADD COLUMN external_transaction_id TEXT`, (err) => {
        // Ignore error if column already exists
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding external_transaction_id column:', err.message);
        }
      });
      
      db.run(`ALTER TABLE transactions ADD COLUMN sales_tax DECIMAL(10,2)`, (err) => {
        // Ignore error if column already exists
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding sales_tax column:', err.message);
        }
      });
    }
  });

  // Receipts table
  db.run(`
    CREATE TABLE IF NOT EXISTS receipts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      original_filename TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER,
      upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      ocr_text TEXT,
      extracted_amount DECIMAL(10,2),
      extracted_date DATE,
      extracted_merchant TEXT,
      processing_status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Matches table (links receipts to transactions)
  db.run(`
    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_id INTEGER NOT NULL,
      receipt_id INTEGER NOT NULL,
      match_confidence DECIMAL(5,2),
      match_status TEXT DEFAULT 'pending',
      user_confirmed BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (transaction_id) REFERENCES transactions(id),
      FOREIGN KEY (receipt_id) REFERENCES receipts(id),
      UNIQUE(transaction_id, receipt_id)
    )
  `);

  console.log('Database tables created/verified');
};

// Initialize database on module load
initDatabase();

module.exports = db; 