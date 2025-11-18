const express = require('express');
const db = require('../../db');
const { authMiddleware } = require('../../middleware/auth');
const router = express.Router();

router.use(authMiddleware);



// proste pomocnicze walidacje
function validateGame(input) {
  const errors = {};

  const title = String(input.title ?? '').trim();
  const year = Number(input.year);
  const rating = Number(input.rating);
  const description = input.description == null ? null : String(input.description).trim();

  if (title.length < 3 || title.length > 100) {
    errors.title = 'Title: 3–100 znaków.';
  }
  if (!Number.isInteger(year) || year < 1970 || year > 2100) {
    errors.year = 'Year: liczba całkowita 1970–2100.';
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 10) {
    errors.rating = 'Rating: liczba całkowita 1–10.';
  }

  return {
    ok: Object.keys(errors).length === 0,
    data: { title, year, rating, description },
    errors
  };
}

// LISTA
router.get('/', (_req, res) => {
  const rows = db.prepare('SELECT * FROM games ORDER BY id DESC').all();
  res.json(rows);
});

// POJEDYNCZA
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });

  const row = db.prepare('SELECT * FROM games WHERE id = ?').get(id);
  if (!row) return res.status(404).json({ error: 'Not found' });

  res.json(row);
});

// DODAWANIE
router.post('/', (req, res) => {
  const v = validateGame(req.body);
  if (!v.ok) return res.status(400).json({ error: 'Validation error', details: v.errors });

  const stmt = db.prepare(
    'INSERT INTO games (title, year, rating, description) VALUES (?, ?, ?, ?)'
  );
  const info = stmt.run(v.data.title, v.data.year, v.data.rating, v.data.description);

  const created = db.prepare('SELECT * FROM games WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(created);
});

// EDYCJA
router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });

  const exists = db.prepare('SELECT id FROM games WHERE id = ?').get(id);
  if (!exists) return res.status(404).json({ error: 'Not found' });

  const v = validateGame(req.body);
  if (!v.ok) return res.status(400).json({ error: 'Validation error', details: v.errors });

  db.prepare(
    'UPDATE games SET title = ?, year = ?, rating = ?, description = ? WHERE id = ?'
  ).run(v.data.title, v.data.year, v.data.rating, v.data.description, id);

  const updated = db.prepare('SELECT * FROM games WHERE id = ?').get(id);
  res.json(updated);
});

// USUWANIE
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });

  const info = db.prepare('DELETE FROM games WHERE id = ?').run(id);
  if (info.changes === 0) return res.status(404).json({ error: 'Not found' });

  res.status(204).send();
});

module.exports = router;
