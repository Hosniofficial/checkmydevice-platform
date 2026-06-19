/**
 * تحديث أسعار الخطط إلى الجنيه المصري (EGP)
 * Usage: node src/db/update-plans-egp.js
 */
import pool from './pool.js';
import dotenv from 'dotenv';
dotenv.config();

const PLANS = [
  { plan_type: 'free',         price_monthly: 0,    price_yearly: 0,     currency: 'EGP' },
  { plan_type: 'basic',        price_monthly: 99,   price_yearly: 990,   currency: 'EGP' },
  { plan_type: 'professional', price_monthly: 299,  price_yearly: 2990,  currency: 'EGP' },
  { plan_type: 'enterprise',   price_monthly: 999,  price_yearly: 9990,  currency: 'EGP' },
];

async function run() {
  const client = await pool.connect();
  try {
    for (const p of PLANS) {
      const { rowCount } = await client.query(
        `UPDATE plans SET price_monthly = $1, price_yearly = $2, currency = $3
         WHERE plan_type = $4`,
        [p.price_monthly, p.price_yearly, p.currency, p.plan_type]
      );
      console.log(`✅ ${p.plan_type}: ${rowCount} row(s) updated → ${p.price_monthly} EGP/mo`);
    }
    console.log('Done.');
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
