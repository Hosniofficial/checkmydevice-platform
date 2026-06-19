export const ok      = (res, data, status = 200) => res.status(status).json({ success: true, data });
export const created = (res, data)               => res.status(201).json({ success: true, data });
export const err     = (res, code, msg_ar, msg_en = '', status = 400) =>
  res.status(status).json({ success: false, error: { code, message_ar: msg_ar, message_en: msg_en } });

export function paginate(rows, total, page, limit) {
  return {
    items: rows,
    meta: {
      total:       parseInt(total),
      page:        parseInt(page),
      limit:       parseInt(limit),
      total_pages: Math.ceil(parseInt(total) / parseInt(limit)),
      has_next:    parseInt(page) * parseInt(limit) < parseInt(total),
      has_prev:    parseInt(page) > 1,
    },
  };
}

export function getPagination(query) {
  const page  = Math.max(1, parseInt(query.page)  || 1);
  const limit = Math.min(100, parseInt(query.limit) || 20);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

export function maskIMEI(imei) {
  if (!imei) return '';
  return imei.slice(0, -4).replace(/./g, '*') + imei.slice(-4);
}
