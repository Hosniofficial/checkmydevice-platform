import { Router } from 'express';
import { query } from '../../db/pool.js';
import { ok } from '../../utils/response.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

// GET /plans
router.get('/', async (req, res) => {
  const result = await query(
    'SELECT id,name_ar,name_en,plan_type,price_monthly,price_yearly,currency,daily_search_limit,monthly_search_limit,bulk_search_enabled,api_access,features FROM plans WHERE is_active=TRUE ORDER BY price_monthly ASC'
  );
  ok(res, result.rows);
});

// GET /plans/current
router.get('/current', authenticate, async (req, res) => {
  const result = await query(
    `SELECT s.*, p.name_ar, p.name_en, p.plan_type, p.daily_search_limit, p.features
     FROM subscriptions s JOIN plans p ON s.plan_id=p.id
     WHERE s.user_id=$1 AND s.status IN ('active','trial') AND s.expires_at > NOW()
     ORDER BY s.created_at DESC LIMIT 1`,
    [req.user.id]
  );
  ok(res, result.rows[0] || null);
});

export default router;
