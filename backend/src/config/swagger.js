/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║                  SWAGGER / OPENAPI CONFIG                   ║
 * ║  Available at: http://localhost:5000/api-docs               ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import swaggerJsdoc  from 'swagger-jsdoc';
import swaggerUi     from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title:       'CheckMyDevice API',
      version:     '1.0.0',
      description: 'منصة فحص الأجهزة المحمولة في الوطن العربي — توثيق API كامل',
      contact: {
        name:  'CheckMyDevice Support',
        email: 'support@checkmydevice.com',
      },
    },
    servers: [
      { url: 'http://localhost:5000',          description: 'Development' },
      { url: 'https://api.checkmydevice.com',  description: 'Production' },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type:         'http',
          scheme:       'bearer',
          bearerFormat: 'JWT',
          description:  'JWT Access Token — يُحصل عليه من /auth/login',
        },
        ApiKeyAuth: {
          type: 'apiKey',
          in:   'header',
          name: 'x-api-key',
          description: 'API Key للتجار — يُدار من لوحة تحكم التاجر',
        },
      },
      schemas: {
        // ── Success Envelope ──────────────────────────────────
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data:    { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code:       { type: 'string', example: 'VALIDATION_ERROR' },
                message_ar: { type: 'string', example: 'بيانات غير صحيحة' },
                message_en: { type: 'string', example: 'Invalid data' },
              },
            },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            total:       { type: 'integer', example: 150 },
            page:        { type: 'integer', example: 1 },
            limit:       { type: 'integer', example: 20 },
            total_pages: { type: 'integer', example: 8 },
            has_next:    { type: 'boolean', example: true },
            has_prev:    { type: 'boolean', example: false },
          },
        },
        // ── Auth ──────────────────────────────────────────────
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email:     { type: 'string', format: 'email', example: 'user@example.com' },
            password:  { type: 'string', minLength: 8,   example: 'MyPass@123' },
            full_name: { type: 'string', example: 'محمد أحمد' },
            phone:     { type: 'string', example: '+201001234567' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email:    { type: 'string', format: 'email', example: 'admin@checkmydevice.com' },
            password: { type: 'string', example: 'Admin@123456' },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            access_token:  { type: 'string' },
            refresh_token: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id:             { type: 'string', format: 'uuid' },
                email:          { type: 'string' },
                full_name:      { type: 'string' },
                role:           { type: 'string', enum: ['user','merchant','admin','super_admin'] },
                email_verified: { type: 'boolean' },
              },
            },
          },
        },
        // ── Search ────────────────────────────────────────────
        SearchRequest: {
          type: 'object',
          required: ['query'],
          properties: {
            query:      { type: 'string', example: '358240051111110', description: 'IMEI أو الرقم التسلسلي' },
            query_type: { type: 'string', enum: ['imei','serial'], default: 'imei' },
          },
        },
        SearchResponse: {
          type: 'object',
          properties: {
            status:       { type: 'string', enum: ['clean','stolen','lost'], example: 'clean' },
            query:        { type: 'string', example: '***********1110' },
            query_type:   { type: 'string', example: 'imei' },
            checked_at:   { type: 'string', format: 'date-time' },
            cache_hit:    { type: 'boolean', description: 'true = نتيجة من Redis Cache' },
            message_ar:   { type: 'string', example: '✅ هذا الجهاز لم يُبلَّغ عنه في قاعدة بياناتنا' },
            device_info: {
              type: 'object',
              properties: {
                brand:       { type: 'string', example: 'Apple' },
                model:       { type: 'string', example: 'iPhone 14' },
                device_type: { type: 'string', example: 'phone' },
                storage:     { type: 'string', example: '128GB' },
                network:     { type: 'string', example: '5G' },
              },
            },
            quota: {
              type: 'object',
              properties: {
                limit:     { type: 'integer', example: 20 },
                used:      { type: 'integer', example: 3 },
                remaining: { type: 'integer', example: 17 },
              },
            },
            disclaimer_ar: { type: 'string' },
          },
        },
        // ── Report ────────────────────────────────────────────
        ReportStatus: {
          type: 'string',
          enum: ['pending','under_review','approved','rejected','cancelled'],
        },
        Report: {
          type: 'object',
          properties: {
            id:           { type: 'string', format: 'uuid' },
            imei:         { type: 'string', example: '358240051111110' },
            brand:        { type: 'string', example: 'Apple' },
            model:        { type: 'string', example: 'iPhone 14' },
            device_type:  { type: 'string', enum: ['phone','laptop','tablet'] },
            report_type:  { type: 'string', enum: ['stolen','lost'] },
            status:       { $ref: '#/components/schemas/ReportStatus' },
            country_code: { type: 'string', example: 'EG' },
            created_at:   { type: 'string', format: 'date-time' },
          },
        },
        CreateReportRequest: {
          type: 'object',
          required: ['imei','brand','model','device_type','report_type','country_code'],
          properties: {
            imei:             { type: 'string', example: '358240051111110' },
            serial_number:    { type: 'string', example: 'C39XXXXXXXXXX' },
            device_type:      { type: 'string', enum: ['phone','laptop','tablet'] },
            brand:            { type: 'string', example: 'Apple' },
            model:            { type: 'string', example: 'iPhone 14' },
            color:            { type: 'string', example: 'أسود' },
            storage:          { type: 'string', example: '128GB' },
            report_type:      { type: 'string', enum: ['stolen','lost'] },
            country_code:     { type: 'string', example: 'EG' },
            city:             { type: 'string', example: 'القاهرة' },
            incident_date:    { type: 'string', format: 'date', example: '2026-06-01' },
            description:      { type: 'string' },
            contact_whatsapp: { type: 'string', example: '+201001234567' },
            contact_email:    { type: 'string', format: 'email' },
            documents:        { type: 'array', items: { type: 'string', format: 'binary' } },
          },
        },
      },
    },
    // ── Tags ────────────────────────────────────────────────────
    tags: [
      { name: 'Auth',          description: 'المصادقة وإدارة الحسابات' },
      { name: 'Search',        description: 'البحث عن الأجهزة' },
      { name: 'Reports',       description: 'إدارة بلاغات الأجهزة المسروقة' },
      { name: 'Admin',         description: 'لوحة الإدارة (Admin فقط)' },
      { name: 'Notifications', description: 'إدارة الإشعارات' },
      { name: 'Plans',         description: 'خطط الاشتراك' },
      { name: 'System',        description: 'صحة النظام والإحصائيات' },
    ],
    // ── Paths ────────────────────────────────────────────────────
    paths: {
      // ── Health ──────────────────────────────────────────────
      '/health': {
        get: {
          tags: ['System'],
          summary: 'فحص صحة الخادم',
          responses: {
            200: {
              description: 'الخادم يعمل',
              content: { 'application/json': { schema: { type: 'object',
                properties: { status: { type: 'string', example: 'ok' }, time: { type: 'string', format: 'date-time' } }
              }}}
            }
          }
        }
      },
      '/api/system/status': {
        get: {
          tags: ['System'],
          summary: 'حالة جميع الخدمات (DB + Redis)',
          security: [{ BearerAuth: [] }],
          responses: { 200: { description: 'حالة الخدمات' } }
        }
      },
      // ── Auth ────────────────────────────────────────────────
      '/api/auth/register': {
        post: {
          tags: ['Auth'], summary: 'إنشاء حساب جديد',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } } },
          responses: {
            201: { description: 'تم إنشاء الحساب بنجاح' },
            400: { description: 'البريد الإلكتروني مستخدم بالفعل', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/auth/login': {
        post: {
          tags: ['Auth'], summary: 'تسجيل الدخول',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } } },
          responses: {
            200: { description: 'تم تسجيل الدخول', content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginResponse' } } } },
            401: { description: 'بيانات خاطئة' },
          },
        },
      },
      '/api/auth/refresh': {
        post: {
          tags: ['Auth'], summary: 'تجديد Access Token',
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { refresh_token: { type: 'string' } } } } } },
          responses: { 200: { description: 'تم التجديد' } },
        },
      },
      '/api/auth/me': {
        get: {
          tags: ['Auth'], summary: 'بيانات المستخدم الحالي',
          security: [{ BearerAuth: [] }],
          responses: { 200: { description: 'بيانات المستخدم' }, 401: { description: 'غير مصادق' } },
        },
        patch: {
          tags: ['Auth'], summary: 'تحديث الملف الشخصي',
          security: [{ BearerAuth: [] }],
          requestBody: { content: { 'application/json': { schema: { type: 'object', properties: {
            full_name: { type: 'string' }, phone: { type: 'string' }, whatsapp: { type: 'string' }
          }}}}},
          responses: { 200: { description: 'تم التحديث' } },
        },
      },
      // ── Search ──────────────────────────────────────────────
      '/api/search': {
        post: {
          tags: ['Search'], summary: 'البحث عن IMEI أو الرقم التسلسلي',
          description: '**بدون تسجيل:** 5 عمليات/يوم/IP\n**مسجل مجاني:** 20 عملية/يوم\n**النتيجة تُخزَّن في Redis لمدة ساعة**',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/SearchRequest' } } } },
          responses: {
            200: { description: 'نتيجة البحث', content: { 'application/json': { schema: { $ref: '#/components/schemas/SearchResponse' } } } },
            429: { description: 'تجاوز حد البحث اليومي' },
          },
        },
      },
      '/api/search/history': {
        get: {
          tags: ['Search'], summary: 'سجل البحث الخاص بالمستخدم',
          security: [{ BearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'page',  schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 } },
          ],
          responses: { 200: { description: 'سجل البحث مع pagination' } },
        },
      },
      '/api/search/quota': {
        get: {
          tags: ['Search'], summary: 'الحصة المتبقية من البحث اليومي',
          responses: { 200: { description: 'الحصة الحالية', content: { 'application/json': { schema: {
            type: 'object', properties: { limit: { type: 'integer' }, used: { type: 'integer' }, remaining: { type: 'integer' } }
          }}}}}
        },
      },
      // ── Reports ─────────────────────────────────────────────
      '/api/reports': {
        get: {
          tags: ['Reports'], summary: 'قائمة بلاغاتي',
          security: [{ BearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'page',  schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
          ],
          responses: { 200: { description: 'قائمة البلاغات' } },
        },
        post: {
          tags: ['Reports'], summary: 'رفع بلاغ جديد عن جهاز مسروق/مفقود',
          security: [{ BearerAuth: [] }],
          requestBody: { required: true, content: { 'multipart/form-data': { schema: { $ref: '#/components/schemas/CreateReportRequest' } } } },
          responses: { 201: { description: 'تم استلام البلاغ للمراجعة' }, 400: { description: 'بيانات ناقصة أو IMEI مبلَّغ عنه بالفعل' } },
        },
      },
      '/api/reports/{id}': {
        get: {
          tags: ['Reports'], summary: 'تفاصيل بلاغ',
          security: [{ BearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { 200: { description: 'تفاصيل البلاغ' }, 403: { description: 'لا تملك صلاحية الوصول' } },
        },
      },
      '/api/reports/{id}/cancel': {
        patch: {
          tags: ['Reports'], summary: 'إلغاء البلاغ (عند استرداد الجهاز)',
          security: [{ BearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { reason: { type: 'string' } } } } } },
          responses: { 200: { description: 'تم الإلغاء' } },
        },
      },
      // ── Admin ───────────────────────────────────────────────
      '/api/admin/stats/dashboard': {
        get: {
          tags: ['Admin'], summary: 'إحصائيات لوحة التحكم (مخزنة في Redis 15 دقيقة)',
          security: [{ BearerAuth: [] }],
          responses: { 200: { description: 'الإحصائيات الشاملة' }, 403: { description: 'Admin فقط' } },
        },
      },
      '/api/admin/reports': {
        get: {
          tags: ['Admin'], summary: 'قائمة جميع البلاغات مع فلترة',
          security: [{ BearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'status',      schema: { type: 'string', enum: ['pending','under_review','approved','rejected','cancelled'] } },
            { in: 'query', name: 'country',     schema: { type: 'string', example: 'EG' } },
            { in: 'query', name: 'device_type', schema: { type: 'string', enum: ['phone','laptop','tablet'] } },
            { in: 'query', name: 'q',           schema: { type: 'string', description: 'بحث بـ IMEI أو الماركة' } },
            { in: 'query', name: 'page',        schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit',       schema: { type: 'integer', default: 15 } },
          ],
          responses: { 200: { description: 'قائمة البلاغات' } },
        },
      },
      '/api/admin/reports/{id}/approve': {
        patch: {
          tags: ['Admin'], summary: 'قبول البلاغ — يضيف الجهاز للقاعدة ويُبلغ المالك',
          security: [{ BearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { admin_note: { type: 'string' } } } } } },
          responses: { 200: { description: 'تم القبول' } },
        },
      },
      '/api/admin/reports/{id}/reject': {
        patch: {
          tags: ['Admin'], summary: 'رفض البلاغ مع سبب إلزامي',
          security: [{ BearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['admin_note'], properties: { admin_note: { type: 'string', description: 'سبب الرفض (إلزامي)' } } } } } },
          responses: { 200: { description: 'تم الرفض' } },
        },
      },
      '/api/plans': {
        get: {
          tags: ['Plans'], summary: 'خطط الاشتراك المتاحة',
          responses: { 200: { description: 'قائمة الخطط' } },
        },
      },
    },
  },
  apis: [], // inline docs above — no file scanning needed
};

export const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app) {
  // Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'CheckMyDevice API Docs',
    customCss: `
      .swagger-ui .topbar { background: #1B4F9B; }
      .swagger-ui .topbar-wrapper img { content: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M12 2L4 7v10l8 5 8-5V7z"/></svg>'); height: 30px; }
      .swagger-ui .info .title { color: #1B4F9B; }
      body { direction: ltr; }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      tryItOutEnabled: true,
    },
  }));

  // Raw JSON spec
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log('📚 Swagger Docs: http://localhost:5000/api-docs');
}
