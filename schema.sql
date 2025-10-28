CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT,
  price NUMERIC(10,2),
  category TEXT,
  stock INT,
  created_at TIMESTAMPTZ DEFAULT now()
);
