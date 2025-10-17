import dotenv from "dotenv";
import pkg from "pg";
dotenv.config();

const { Pool } = pkg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // na Railway w prod czasem wymagane SSL; lokalnie zwykle nie
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});
