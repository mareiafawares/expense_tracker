require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection Setup
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

// التصنيفات المسموحة
const ALLOWED_CATEGORIES = ['Food', 'Transport', 'Bills', 'Entertainment', 'Other'];

// 1. GET /api/expenses - جلب جميع المصاريف
app.get('/api/expenses', async (req, res) => {
  try {
    // تحويل التاريخ لـ YYYY-MM-DD والمبلغ لـ FLOAT
    const result = await pool.query(
      `SELECT id, title, amount::float, category, TO_CHAR(date, 'YYYY-MM-DD') AS date FROM expenses ORDER BY date DESC, id DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 2. POST /api/expenses - إضافة مصروف جديد
app.post('/api/expenses', async (req, res) => {
  const { title, amount, category, date } = req.body;

  // Validation
  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'Title is required' });
  }
  if (amount === undefined || isNaN(amount) || Number(amount) <= 0) {
    return res.status(400).json({ message: 'Amount must be a number greater than zero' });
  }
  if (!category || !ALLOWED_CATEGORIES.includes(category)) {
    return res.status(400).json({ message: `Category must be one of: ${ALLOWED_CATEGORIES.join(', ')}` });
  }
  if (!date) {
    return res.status(400).json({ message: 'Date is required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO expenses (title, amount, category, date) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, title, amount::float, category, TO_CHAR(date, 'YYYY-MM-DD') AS date`,
      [title.trim(), Number(amount), category, date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
// 3. GET /api/expenses/:id - جلب مصروف واحد بـ ID
app.get('/api/expenses/:id', async (req, res) => {
  const { id } = req.params;

  if (isNaN(id)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  try {
    const result = await pool.query(
      `SELECT id, title, amount::float, category, TO_CHAR(date, 'YYYY-MM-DD') AS date FROM expenses WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 4. PUT /api/expenses/:id - تعديل مصروف
app.put('/api/expenses/:id', async (req, res) => {
  const { id } = req.params;
  const { title, amount, category, date } = req.body;

  if (isNaN(id)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  // Validation
  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'Title is required' });
  }
  if (amount === undefined || isNaN(amount) || Number(amount) <= 0) {
    return res.status(400).json({ message: 'Amount must be a number greater than zero' });
  }
  if (!category || !ALLOWED_CATEGORIES.includes(category)) {
    return res.status(400).json({ message: `Category must be one of: ${ALLOWED_CATEGORIES.join(', ')}` });
  }
  if (!date) {
    return res.status(400).json({ message: 'Date is required' });
  }

  try {
    const result = await pool.query(
      `UPDATE expenses 
       SET title = $1, amount = $2, category = $3, date = $4 
       WHERE id = $5 
       RETURNING id, title, amount::float, category, TO_CHAR(date, 'YYYY-MM-DD') AS date`,
      [title.trim(), Number(amount), category, date, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 5. DELETE /api/expenses/:id - حذف مصروف
app.delete('/api/expenses/:id', async (req, res) => {
  const { id } = req.params;

  if (isNaN(id)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  try {
    const result = await pool.query(`DELETE FROM expenses WHERE id = $1 RETURNING id`, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});