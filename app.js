const path = require('path');
const express = require('express');
const app = express();

// parsowanie JSON w body
app.use(express.json());

// serwuj pliki statyczne z /public (frontend)
app.use(express.static(path.join(__dirname, 'public')));

// API dla gier
const gamesRoutes = require('./entities/games/routes');
app.use('/api/games', gamesRoutes);

// prosty healthcheck
app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// fallback: na / zwróć index.html (frontend)
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// prosty „globalny” handler błędów (żeby zawsze dostać JSON)
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

module.exports = app;
