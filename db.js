const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

// plik bazy leży w katalogu projektu
const DB_PATH = path.join(__dirname, 'games.db');
const db = new Database(DB_PATH);

// uruchom wszystkie migracje *.sql po kolei
function runMigrations() {
  const migrationsDir = path.join(__dirname, 'migrations');
  if (!fs.existsSync(migrationsDir)) return;

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort(); // 001_, 002_ ...

  db.exec('PRAGMA foreign_keys = ON;');

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    db.exec(sql);
  }
}

runMigrations();

module.exports = db;
