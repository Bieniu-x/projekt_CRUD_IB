import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";
import { pool } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json({ type: ['application/json', 'application/json; charset=utf-8', 'text/plain'] }));
app.use(express.urlencoded({ extended: true }));



// ── ścieżki
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Static: serwujemy z katalogu głównego (tu leży index.html)
const STATIC_DIR = path.join(__dirname, "public");
console.log("📂 Static dir:", STATIC_DIR);
app.use(express.static(STATIC_DIR));

// ── MIGRACJA: próba wykonania schema.sql (bez blokowania startu)
async function ensureSchema() {
  try {
    const sql = readFileSync(path.join(__dirname, "schema.sql"), "utf8");
    await pool.query(sql);
    console.log("✅ Tabela products gotowa (schema.sql wykonane).");
  } catch (e) {
    console.warn("⚠️  Migracja pominięta / błąd DB:", e.message);
  }
}

// ── health
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// ── PRODUCTS CRUD
app.get("/api/products", async (_req, res, next) => {
  try {
    const { rows } = await pool.query("SELECT * FROM products ORDER BY id DESC");
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

app.get("/api/products/:id", async (req, res, next) => {
  try {
    const { rows } = await pool.query("SELECT * FROM products WHERE id = $1", [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (e) {
    next(e);
  }
});

app.post("/api/products", async (req, res, next) => {
  try {
    // Fallback dla body jako string
    if (typeof req.body === 'string') {
      try { req.body = JSON.parse(req.body || '{}'); } catch (_) { req.body = {}; }
    }

    const errors = [];
    if (!req.body.name) errors.push("name: wymagane");
    if (req.body.price != null && isNaN(Number(req.body.price))) errors.push("price: liczba");
    if (req.body.stock != null) {
      const n = Number(req.body.stock);
      if (!Number.isInteger(n) || n < 1 || n > 10) errors.push("rating: 1–10 (integer)");
    }
    if (errors.length) return res.status(400).json({ errors });

    const { name, sku, price, category, stock } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO products (name, sku, price, category, stock)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [
        name,
        sku || null,
        price != null ? Number(price) : null,
        category || null,
        stock != null ? Number(stock) : null,
      ]
    );
    res.status(201).json(rows[0]);
  } catch (e) { next(e); }
});


app.put("/api/products/:id", async (req, res, next) => {
  try {
    if (typeof req.body === 'string') {
      try { req.body = JSON.parse(req.body || '{}'); } catch (_) { req.body = {}; }
    }

    const errors = [];
    if (!req.body.name) errors.push("name: wymagane");
    if (req.body.price != null && isNaN(Number(req.body.price))) errors.push("price: liczba");
    if (req.body.stock != null) {
      const n = Number(req.body.stock);
      if (!Number.isInteger(n) || n < 1 || n > 10) errors.push("rating: 1–10 (integer)");
    }
    if (errors.length) return res.status(400).json({ errors });

    const { name, sku, price, category, stock } = req.body;
    const { rows } = await pool.query(
      `UPDATE products
       SET name=$1, sku=$2, price=$3, category=$4, stock=$5
       WHERE id=$6
       RETURNING *`,
      [
        name,
        sku || null,
        price != null ? Number(price) : null,
        category || null,
        stock != null ? Number(stock) : null,
        req.params.id,
      ]
    );
    if (!rows[0]) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (e) { next(e); }
});

app.delete("/api/products/:id", async (req, res, next) => {
  try {
    const r = await pool.query("DELETE FROM products WHERE id = $1", [req.params.id]);
    if (r.rowCount === 0) return res.status(404).json({ error: "Not found" });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

// ── index.html na "/" oraz jako fallback
app.get("/", (_req, res) => {
  res.sendFile(path.join(STATIC_DIR, "index.html"));
});
app.get("*", (_req, res) => {
  res.sendFile(path.join(STATIC_DIR, "index.html"));
});

// ── błędy
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

// ── start
const PORT = process.env.PORT || 3000;
ensureSchema().finally(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server listening on http://localhost:${PORT}`);
  });
});
