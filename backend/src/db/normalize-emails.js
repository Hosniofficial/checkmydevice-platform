/**
 * One-time migration: normalize all emails to lowercase
 * Usage: node src/db/normalize-emails.js
 */
import pool from './pool.js';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const client = await pool.connect();
  try {
    const { rowCount } = await client.query(
      "UPDATE users SET email = LOWER(TRIM(email)), updated_at = NOW() WHERE email != LOWER(TRIM(email))"
    );
    console.log(`✅ Normalized ${rowCount} email(s) to lowercase`);

    const check = await client.query(
      "SELECT COUNT(*) as cnt FROM users WHERE email != LOWER(email)"
    );
    console.log(`✅ Remaining non-lowercase: ${check.rows[0].cnt}`);
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(err => { console.error(err.message); process.exit(1); });
