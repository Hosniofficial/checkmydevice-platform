import pool from './pool.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

async function seed() {
  const client = await pool.connect();
  try {
    console.log('🌱 Seeding database...');

    // ── Plans ──────────────────────────────────────────────────
    await client.query(`
      INSERT INTO plans (name_ar, name_en, plan_type, price_monthly, price_yearly, currency,
        daily_search_limit, monthly_search_limit, bulk_search_enabled, api_access, features)
      VALUES
        ('مجاني','Free','free', 0, 0,'EGP', 5, 150, FALSE, FALSE,
          '{"searches":5,"reports":true,"notifications":true}'),
        ('أساسي','Basic','basic', 99, 990,'EGP', 50, 1500, FALSE, FALSE,
          '{"searches":50,"reports":true,"notifications":true,"history":true}'),
        ('احترافي','Professional','professional', 299, 2990,'EGP', 500, 15000, TRUE, TRUE,
          '{"searches":500,"reports":true,"bulk":true,"api":true,"support":"priority"}'),
        ('مؤسسي','Enterprise','enterprise', 999, 9990,'EGP', 9999, 300000, TRUE, TRUE,
          '{"searches":"unlimited","reports":true,"bulk":true,"api":true,"support":"dedicated"}')
      ON CONFLICT DO NOTHING;
    `);

    // ── Super Admin ────────────────────────────────────────────
    const email = process.env.ADMIN_EMAIL || 'admin@checkmydevice.online';
    const password = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const hash = await bcrypt.hash(password, 12);

    const result = await client.query(`
      INSERT INTO users (email, password_hash, full_name, role, status, email_verified)
      VALUES ($1, $2, 'Super Admin', 'super_admin', 'active', TRUE)
      ON CONFLICT (email) DO NOTHING
      RETURNING id;
    `, [email, hash]);

    if (result.rows.length > 0) {
      console.log(`✅ Admin created: ${email}`);
    } else {
      console.log(`ℹ️  Admin already exists: ${email}`);
    }

    console.log('✅ Seed complete');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
