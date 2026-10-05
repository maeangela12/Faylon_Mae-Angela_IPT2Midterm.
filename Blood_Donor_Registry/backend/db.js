// DATABASE: connects to PostgreSQL and makes sure the donors table exists.
require('dotenv').config();
const { Pool, types } = require('pg');

// Return DATE columns as plain "YYYY-MM-DD" strings (avoids timezone shifting).
types.setTypeParser(1082, (value) => value);

// Connection settings are read from the .env file (never written directly in the code).
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Creates the table automatically the first time the server starts.
async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS donors (
      id SERIAL PRIMARY KEY,
      full_name VARCHAR(100) NOT NULL,
      age INTEGER NOT NULL CHECK (age BETWEEN 16 AND 65),
      blood_type VARCHAR(3) NOT NULL
        CHECK (blood_type IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
      contact_number VARCHAR(20) NOT NULL,
      address VARCHAR(200) NOT NULL DEFAULT '',
      last_donation_date DATE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
}

module.exports = { pool, initDb };