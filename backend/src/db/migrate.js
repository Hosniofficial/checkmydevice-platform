import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const SQL = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── USERS ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           VARCHAR(255) UNIQUE NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  full_name       VARCHAR(255),
  phone           VARCHAR(20),
  whatsapp        VARCHAR(20),
  role            VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user','merchant','admin','super_admin')),
  status          VARCHAR(20) DEFAULT 'pending_verify' CHECK (status IN ('active','suspended','pending_verify')),
  email_verified  BOOLEAN DEFAULT FALSE,
  country_code    CHAR(2),
  preferred_lang  CHAR(2) DEFAULT 'ar',
  last_login_at   TIMESTAMP,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW(),
  deleted_at      TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_users_email  ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role   ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- ─── DEVICES_REPORTS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS devices_reports (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id),
  imei             VARCHAR(16) NOT NULL,
  imei2            VARCHAR(16),
  serial_number    VARCHAR(50),
  device_type      VARCHAR(10) CHECK (device_type IN ('phone','laptop','tablet')),
  brand            VARCHAR(100) NOT NULL,
  model            VARCHAR(100) NOT NULL,
  color            VARCHAR(50),
  storage          VARCHAR(20),
  report_type      VARCHAR(10) NOT NULL CHECK (report_type IN ('stolen','lost')),
  status           VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','under_review','approved','rejected','cancelled')),
  country_code     CHAR(2) NOT NULL,
  city             VARCHAR(100),
  incident_date    DATE,
  description      TEXT,
  contact_phone    VARCHAR(20),
  contact_whatsapp VARCHAR(20),
  contact_email    VARCHAR(255),
  reward_offered   BOOLEAN DEFAULT FALSE,
  reward_amount    DECIMAL(10,2),
  reward_currency  CHAR(3),
  admin_id         UUID REFERENCES users(id),
  admin_note       TEXT,
  reviewed_at      TIMESTAMP,
  approved_at      TIMESTAMP,
  cancelled_at     TIMESTAMP,
  cancel_reason    TEXT,
  created_at       TIMESTAMP DEFAULT NOW(),
  updated_at       TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reports_imei        ON devices_reports(imei);
CREATE INDEX IF NOT EXISTS idx_reports_imei_status ON devices_reports(imei, status);
CREATE INDEX IF NOT EXISTS idx_reports_serial      ON devices_reports(serial_number);
CREATE INDEX IF NOT EXISTS idx_reports_user        ON devices_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status      ON devices_reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_country     ON devices_reports(country_code);

-- ─── REPORT_DOCUMENTS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS report_documents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id   UUID NOT NULL REFERENCES devices_reports(id) ON DELETE CASCADE,
  doc_type    VARCHAR(20) DEFAULT 'other' CHECK (doc_type IN ('box_image','receipt','id_with_device','other')),
  file_url    VARCHAR(500) NOT NULL,
  file_size   INTEGER,
  mime_type   VARCHAR(50),
  created_at  TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_docs_report ON report_documents(report_id);

-- ─── DEVICE_CACHE (Device Lookup Service cache) ───────────────────
CREATE TABLE IF NOT EXISTS device_cache (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imei         VARCHAR(16) UNIQUE NOT NULL,
  brand        VARCHAR(100),
  model        VARCHAR(100),        -- marketing name: Moto G22
  model_code   VARCHAR(100),        -- technical code: XT2231-5
  device_type  VARCHAR(20),
  storage      VARCHAR(50),
  color        VARCHAR(50),
  network      VARCHAR(50),
  released     VARCHAR(20),
  raw_response JSONB,
  source       VARCHAR(50) DEFAULT 'api',
  created_at   TIMESTAMP DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW()
);
-- Ensure model_code column exists (idempotent migration)
ALTER TABLE IF EXISTS device_cache ADD COLUMN IF NOT EXISTS model_code VARCHAR(100);
CREATE INDEX IF NOT EXISTS idx_device_cache_imei ON device_cache(imei);

-- ─── SEARCH_LOGS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS search_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id),
  imei         VARCHAR(16) NOT NULL,
  ip_address   VARCHAR(45) NOT NULL,
  user_agent   VARCHAR(500),
  result       VARCHAR(20) CHECK (result IN ('clean','stolen','lost','not_found')),
  country_code CHAR(2),
  source       VARCHAR(10) DEFAULT 'web' CHECK (source IN ('web','mobile','api')),
  created_at   TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_search_ip_date   ON search_logs(ip_address, created_at);
CREATE INDEX IF NOT EXISTS idx_search_user_date ON search_logs(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_search_imei      ON search_logs(imei);
CREATE INDEX IF NOT EXISTS idx_search_date      ON search_logs(created_at);

-- ─── MERCHANTS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS merchants (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID UNIQUE NOT NULL REFERENCES users(id),
  business_name   VARCHAR(255) NOT NULL,
  business_type   VARCHAR(100),
  country_code    CHAR(2),
  website         VARCHAR(255),
  api_key         VARCHAR(64) UNIQUE NOT NULL,
  api_key_expires_at TIMESTAMP,
  daily_limit     INTEGER DEFAULT 1000,
  monthly_limit   INTEGER DEFAULT 20000,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_merchants_api_key ON merchants(api_key);
CREATE INDEX IF NOT EXISTS idx_merchants_user    ON merchants(user_id);

-- ─── PLANS ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS plans (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar              VARCHAR(100) NOT NULL,
  name_en              VARCHAR(100) NOT NULL,
  plan_type            VARCHAR(20) CHECK (plan_type IN ('free','basic','professional','enterprise')),
  price_monthly        DECIMAL(10,2),
  price_yearly         DECIMAL(10,2),
  currency             CHAR(3) DEFAULT 'USD',
  daily_search_limit   INTEGER NOT NULL DEFAULT 20,
  monthly_search_limit INTEGER,
  bulk_search_enabled  BOOLEAN DEFAULT FALSE,
  api_access           BOOLEAN DEFAULT FALSE,
  features             JSONB,
  is_active            BOOLEAN DEFAULT TRUE,
  created_at           TIMESTAMP DEFAULT NOW()
);

-- ─── SUBSCRIPTIONS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id),
  plan_id     UUID NOT NULL REFERENCES plans(id),
  status      VARCHAR(20) DEFAULT 'trial' CHECK (status IN ('active','expired','cancelled','trial')),
  starts_at   TIMESTAMP NOT NULL,
  expires_at  TIMESTAMP NOT NULL,
  auto_renew  BOOLEAN DEFAULT TRUE,
  payment_ref VARCHAR(255),
  amount_paid DECIMAL(10,2),
  currency    CHAR(3),
  created_at  TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_subs_user    ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subs_expires ON subscriptions(expires_at);
CREATE INDEX IF NOT EXISTS idx_subs_status  ON subscriptions(status);

-- ─── NOTIFICATIONS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id),
  type       VARCHAR(50) NOT NULL,
  title_ar   VARCHAR(255),
  title_en   VARCHAR(255),
  body_ar    TEXT,
  body_en    TEXT,
  data       JSONB,
  channel    VARCHAR(10) DEFAULT 'email' CHECK (channel IN ('email','push','sms')),
  is_read    BOOLEAN DEFAULT FALSE,
  sent_at    TIMESTAMP,
  read_at    TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notif_read ON notifications(user_id, is_read);

-- ─── AUDIT_LOGS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id),
  action      VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id   UUID,
  old_data    JSONB,
  new_data    JSONB,
  ip_address  VARCHAR(45),
  user_agent  VARCHAR(500),
  created_at  TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_user   ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_date   ON audit_logs(created_at);

-- ─── EMAIL_VERIFICATIONS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS email_verifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      VARCHAR(128) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at    TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_verify_token ON email_verifications(token);

-- ─── PASSWORD_RESETS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS password_resets (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      VARCHAR(128) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at    TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
`;

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('🔄 Running migrations...');
    await client.query(SQL);
    console.log('✅ All tables created successfully');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
