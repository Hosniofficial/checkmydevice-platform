import { query } from '../db/pool.js';

export async function auditLog({ userId, action, entityType, entityId, oldData, newData, ip, userAgent }) {
  try {
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_data, new_data, ip_address, user_agent)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        userId    || null,
        action,
        entityType || null,
        entityId  || null,
        oldData   ? JSON.stringify(oldData)  : null,
        newData   ? JSON.stringify(newData)  : null,
        ip        || null,
        userAgent || null,
      ]
    );
  } catch (err) {
    console.error('[AuditLog] Failed to write audit log:', err.message);
  }
}
