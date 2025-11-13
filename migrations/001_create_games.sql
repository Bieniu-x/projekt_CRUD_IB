-- tworzy tabelę gier (jeśli nie istnieje)
CREATE TABLE IF NOT EXISTS games (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  year INTEGER NOT NULL CHECK (year BETWEEN 1970 AND 2100),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 10),
  description TEXT
);
