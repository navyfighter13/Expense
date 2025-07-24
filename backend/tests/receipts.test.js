const request = require('supertest');
const fs = require('fs');
const path = require('path');

let app;
let db;
const testDbPath = path.join(__dirname, 'test.db');

beforeAll(done => {
  process.env.DB_PATH = testDbPath;
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }
  app = require('../server');
  db = require('../database/init');

  db.serialize(() => {
    db.run(
      `INSERT INTO transactions (transaction_date, description, amount) VALUES (?, ?, ?)`,
      ['2023-01-01', 'Test Transaction', 10.0]
    );
    db.run(
      `INSERT INTO receipts (filename, original_filename, file_path, file_size, processing_status) VALUES (?, ?, ?, ?, ?)`,
      ['r1.jpg', 'r1.jpg', '/tmp/r1.jpg', 123, 'completed']
    );
    db.run(
      `INSERT INTO receipts (filename, original_filename, file_path, file_size, processing_status) VALUES (?, ?, ?, ?, ?)`,
      ['r2.jpg', 'r2.jpg', '/tmp/r2.jpg', 456, 'completed']
    );
    db.run(
      `INSERT INTO matches (transaction_id, receipt_id, match_confidence, user_confirmed) VALUES (1, 1, 80, 1)`,
      done
    );
  });
});

afterAll(done => {
  db.close(() => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    done();
  });
});

test('GET /api/receipts/unmatched/list returns unmatched receipts', async () => {
  const res = await request(app).get('/api/receipts/unmatched/list');
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body.length).toBe(1);
  expect(res.body[0]).toHaveProperty('filename', 'r2.jpg');
});

