import { Router } from 'express';
import { query } from '../../db/pool.js';
import { ok, getPagination, paginate } from '../../utils/response.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

// GET /notifications
router.get('/', authenticate, async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const [rows, count] = await Promise.all([
    query(
      `SELECT id,type,title_ar,title_en,body_ar,body_en,is_read,created_at
       FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    ),
    query('SELECT COUNT(*) as cnt FROM notifications WHERE user_id=$1', [req.user.id]),
  ]);
  const unread = await query('SELECT COUNT(*) as cnt FROM notifications WHERE user_id=$1 AND is_read=FALSE', [req.user.id]);
  ok(res, { ...paginate(rows.rows, count.rows[0].cnt, page, limit), unread_count: parseInt(unread.rows[0].cnt) });
});

// PATCH /notifications/:id/read
router.patch('/:id/read', authenticate, async (req, res) => {
  await query(
    'UPDATE notifications SET is_read=TRUE, read_at=NOW() WHERE id=$1 AND user_id=$2',
    [req.params.id, req.user.id]
  );
  ok(res, { message_ar: 'تم تعليم الإشعار كمقروء' });
});

// PATCH /notifications/read-all
router.patch('/read-all', authenticate, async (req, res) => {
  const result = await query(
    'UPDATE notifications SET is_read=TRUE, read_at=NOW() WHERE user_id=$1 AND is_read=FALSE',
    [req.user.id]
  );
  ok(res, { updated: result.rowCount });
});

export default router;
