import assert from 'node:assert/strict';
import { createServer } from 'vite';
import puppeteer from 'puppeteer';

async function launchBrowser() {
  if (process.env.CI === 'true' || process.env.VERCEL === '1') {
    const chromium = (await import('@sparticuz/chromium')).default;
    const puppeteerCore = (await import('puppeteer-core')).default;
    return puppeteerCore.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
  }

  return puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
}

async function replaceInput(page, selector, value) {
  await page.click(selector);
  await page.keyboard.down('Control');
  await page.keyboard.press('A');
  await page.keyboard.up('Control');
  await page.type(selector, value);
}

const plans = [
  {
    id: 'free',
    name_ar: 'مجاني',
    plan_type: 'free',
    price_monthly: 0,
    price_yearly: 0,
    currency: 'EGP',
    daily_search_limit: 20,
    features: { searches: 20 },
  },
  {
    id: 'basic',
    name_ar: 'أساسي',
    plan_type: 'basic',
    price_monthly: 99,
    price_yearly: 990,
    currency: 'EGP',
    daily_search_limit: 50,
    features: { searches: 50 },
  },
];

const cleanResultDisclaimer = 'نتيجة "نظيف" لا تعني 100% أن الجهاز غير مسروق — بل تعني أنه غير مُبلَّغ عنه في قاعدة بياناتنا. استخدمها كمرجع إضافي.';

const searchResult = {
  status: 'clean',
  query: '***********1110',
  query_type: 'imei',
  checked_at: '2026-01-01T00:00:00.000Z',
  device_info: {
    brand: 'Apple',
    model: 'iPhone 14',
    model_code: 'iPhone 14',
    device_type: 'phone',
    storage: '128GB',
  },
  quota: { limit: 5, used: 1, remaining: 4 },
  cache_hit: false,
  disclaimer_ar: cleanResultDisclaimer,
};

const report = {
  id: 'report-e2e',
  status: 'pending',
  report_type: 'stolen',
  device_type: 'phone',
  brand: 'Apple',
  model: 'iPhone 14',
  imei: '356938035643809',
  full_name: 'مستخدم تجريبي',
  email: 'user@example.test',
  owner_name: 'مستخدم تجريبي',
  owner_email: 'user@example.test',
  phone: '+201001234567',
  country_code: 'EG',
  city: 'القاهرة',
  incident_date: '2026-01-01',
  created_at: '2026-01-01T00:00:00.000Z',
  description: 'بلاغ تجريبي لاختبار الواجهة.',
};

const adminUser = {
  id: 'user-e2e',
  full_name: 'مستخدم تجريبي',
  email: 'user@example.test',
  role: 'user',
  status: 'active',
  country_code: 'EG',
  last_login_at: '2026-01-01T00:00:00.000Z',
};

const auditEvent = {
  id: 'audit-e2e',
  user_email: 'admin@example.test',
  action: 'report.created',
  entity_type: 'report',
  created_at: '2026-01-01T00:00:00.000Z',
  ip_address: '127.0.0.1',
  new_data: { report_id: 'report-e2e' },
};

const adminSearchResult = {
  imei: '358240051111110',
  device_info: {
    brand: 'Apple',
    model: 'iPhone 14',
    model_code: 'iPhone 14',
    device_type: 'phone',
    storage: '128GB',
  },
  lookup_source: 'db_cache',
  reports: [{
    id: 'report-search-e2e',
    report_type: 'stolen',
    status: 'approved',
    created_at: '2026-01-01T00:00:00.000Z',
    owner_name: 'مستخدم تجريبي',
    owner_email: 'user@example.test',
    country_code: 'EG',
    city: 'القاهرة',
  }],
};

let server;
let browser;

try {
  server = await createServer({
    server: { host: '127.0.0.1', port: 0, strictPort: true },
  });
  await server.listen();

  const address = server.httpServer.address();
  assert(address && typeof address !== 'string', 'Vite did not open an HTTP port');
  const baseUrl = `http://127.0.0.1:${address.port}`;

  browser = await launchBrowser();
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  let searchRequests = 0;
  const searchPayloads = [];
  let adminSearchRequests = 0;
  let loginRequests = 0;
  let verificationResends = 0;
  let registerRequests = 0;
  let forgotPasswordRequests = 0;
  let plansRequests = 0;
  let plansRequestsFail = false;
  let plansResponseMalformed = false;
  let profileUpdates = 0;
  let passwordChanges = 0;
  let sessionUser = null;
  await page.setRequestInterception(true);

  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.origin !== baseUrl) {
      request.abort();
      return;
    }

    if (!url.pathname.startsWith('/api/')) {
      request.continue();
      return;
    }

    let status = 200;
    let data = { success: true, data: null };
    if (url.pathname === '/api/auth/me' && request.method() === 'GET') {
      data.data = sessionUser;
    } else if (url.pathname === '/api/auth/login' && request.method() === 'POST') {
      loginRequests++;
      const credentials = JSON.parse(request.postData() || '{}');
      if (credentials.email === 'wrong@example.test') {
        status = 401;
        data = { success: false, error: { message_ar: 'بيانات الدخول غير صحيحة' } };
      } else {
        sessionUser = {
          id: 'login-user',
          full_name: 'حساب تجريبي',
          email: credentials.email,
          role: 'user',
          email_verified: false,
          country_code: 'EG',
        };
        data.data = {
          access_token: `e30.${Buffer.from(JSON.stringify({ exp: 2000000000 })).toString('base64url')}.eA`,
          refresh_token: 'e2e-login-refresh-token',
          user: sessionUser,
        };
      }
    } else if (url.pathname === '/api/auth/resend-verification' && request.method() === 'POST') {
      verificationResends++;
      data.data = { message_ar: 'تم إرسال رابط التفعيل إلى بريدك الإلكتروني.' };
    } else if (url.pathname === '/api/auth/register' && request.method() === 'POST') {
      registerRequests++;
      data.data = { message_ar: 'تم إنشاء الحساب التجريبي' };
    } else if (url.pathname === '/api/auth/forgot-password' && request.method() === 'POST') {
      forgotPasswordRequests++;
      status = 503;
      data = { success: false, error: { message_ar: 'تعذر إرسال البريد التجريبي' } };
    } else if (url.pathname === '/api/auth/me' && request.method() === 'PATCH') {
      profileUpdates++;
      sessionUser = { ...sessionUser, ...JSON.parse(request.postData() || '{}') };
      data.data = sessionUser;
    } else if (url.pathname === '/api/auth/me/password' && request.method() === 'PATCH') {
      passwordChanges++;
      data.data = { message_ar: 'تم تغيير كلمة المرور التجريبي' };
    } else if (url.pathname === '/api/search/quota') {
      data.data = { limit: 5, used: searchRequests, remaining: 5 - searchRequests };
    } else if (url.pathname === '/api/search' && request.method() === 'POST') {
      searchRequests++;
      searchPayloads.push(JSON.parse(request.postData() || '{}'));
      data.data = searchResult;
    } else if (url.pathname === '/api/plans') {
      plansRequests++;
      if (plansRequestsFail) {
        status = 503;
        data = { success: false, error: { message_ar: 'تعذر تحميل الخطط التجريبي' } };
      } else if (plansResponseMalformed) {
        data.data = {};
      } else {
        data.data = plans;
      }
    } else if (url.pathname === '/api/reports' && request.method() === 'GET') {
      const pageNumber = Number(url.searchParams.get('page') || 1);
      data.data = {
        items: [],
        meta: { page: pageNumber, limit: 10, total: 0, total_pages: 1, has_prev: false, has_next: false },
      };
    } else if (url.pathname === '/api/admin/stats/dashboard') {
      data.data = {
        reports: { pending: 1, approved: 3, rejected: 1 },
        searches: { today: 25, total: 100 },
        users: { total: 10, today: 2, merchants: 1 },
        device_cache: { total: 12 },
      };
    } else if (url.pathname === '/api/admin/reports') {
      data.data = {
        items: [report],
        meta: { page: 1, limit: 15, total: 1, total_pages: 1, has_prev: false, has_next: false },
      };
    } else if (url.pathname === '/api/admin/plans') {
      data.data = plans;
    } else if (url.pathname === '/api/admin/users') {
      const pageNumber = Number(url.searchParams.get('page') || 1);
      data.data = {
        items: [adminUser],
        meta: { page: pageNumber, limit: 15, total: 1, total_pages: 1, has_prev: false, has_next: false },
      };
    } else if (url.pathname === '/api/admin/audit-logs') {
      const pageNumber = Number(url.searchParams.get('page') || 1);
      data.data = {
        items: [auditEvent],
        meta: { page: pageNumber, limit: 20, total: 1, total_pages: 1, has_prev: false, has_next: false },
      };
    } else if (url.pathname === '/api/admin/reports/report-e2e' || url.pathname === '/api/reports/report-e2e') {
      data.data = report;
    } else if (url.pathname.startsWith('/api/admin/search/')) {
      adminSearchRequests++;
      data.data = adminSearchResult;
    }

    request.respond({
      status,
      contentType: 'application/json',
      body: JSON.stringify(data),
    });
  });

  await page.goto(baseUrl, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => document.getElementById('home-imei'));
  await page.waitForFunction(() => document.querySelector('#root img[src="/home-imei-check.webp"]')?.naturalWidth === 960);
  assert(
    (await page.$eval('#root', (root) => root.innerText)).includes('افحص بوعي… واشتري بثقة'),
    'Homepage should use the updated confidence tagline',
  );
  const heroBackgroundAlpha = await page.$eval('#root img[src="/home-imei-check.webp"]', (image) => {
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0);
    return context.getImageData(0, 0, 1, 1).data[3];
  });
  assert.equal(heroBackgroundAlpha, 0, 'Previous homepage image should retain its transparent background');
  assert.equal(
    await page.$eval('img[src="/Logo.png"]', (image) => image.naturalWidth),
    192,
    'Homepage should load the updated site mark',
  );
  const brandAssets = await page.evaluate(async () => {
    const paths = [
      '/favicon.ico',
      '/favicon-16x16.png',
      '/favicon-32x32.png',
      '/favicon-48x48.png',
      '/favicon-96x96.png',
      '/apple-touch-icon.png',
      '/android-chrome-192x192.png',
      '/android-chrome-512x512.png',
    ];
    const responses = await Promise.all(paths.map((path) => fetch(path).then((response) => response.ok)));
    const manifest = await fetch('/site.webmanifest?v=20261120').then((response) => response.json());
    return { responses, manifest };
  });
  assert(brandAssets.responses.every(Boolean), 'All new favicon and app icon assets should load');
  assert.equal(brandAssets.manifest.name, 'CheckMyDevice', 'The app name should match the supplied logo');
  const iconVersions = await page.$$eval('link[rel*="icon"]', (links) => (
    links.map((link) => new URL(link.href).searchParams.get('v'))
  ));
  assert(iconVersions.every((version) => version === '20261120'), 'Favicon URLs should invalidate the previous browser cache');
  assert(
    brandAssets.manifest.icons.every((icon) => icon.src.includes('?v=20261120')),
    'PWA icon URLs should invalidate the previous browser cache',
  );
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth),
    false,
    'Homepage should not overflow horizontally on a mobile viewport',
  );

  await page.type('#home-imei', '358240051111111');
  await page.click('button[type="submit"]');
  await page.waitForFunction(() => document.querySelector('[role="alert"]')?.textContent.includes('رقم IMEI'));
  assert.equal(searchRequests, 0, 'Invalid IMEI must not be sent to the API');
  assert.equal(new URL(page.url()).pathname, '/', 'Invalid home search should stay on the homepage');
  console.log('PASS home page rejects invalid IMEI before making an API request');

  await page.setViewport({ width: 1280, height: 844 });
  await page.goto(baseUrl, { waitUntil: 'networkidle0' });
  await page.waitForSelector('#home-imei');
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth),
    false,
    'Homepage should not overflow horizontally on a desktop viewport',
  );
  await page.setViewport({ width: 390, height: 844 });
  await page.goto(baseUrl, { waitUntil: 'networkidle0' });
  await page.type('#home-imei', '358240051111110');
  await page.click('#root button[type="submit"]');
  await page.waitForFunction(() => new URL(location.href).pathname === '/search' && document.body.innerText.includes('لا توجد بلاغات مسجلة'));
  assert.equal(searchRequests, 1, 'Valid homepage search should run once through the mocked API');
  assert.equal(searchPayloads[0].query, '358240051111110');
  console.log('PASS homepage valid IMEI navigates to its result and uses the mocked search API');

  await page.goto(`${baseUrl}/search?q=123`, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => document.querySelector('[role="alert"]')?.textContent.includes('رقم IMEI'));
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth),
    false,
    'Search page should not overflow horizontally on a mobile viewport',
  );
  assert.equal(searchRequests, 1, 'Invalid search URL must not be sent to the API');
  console.log('PASS search route validates query-string IMEIs');

  await page.goto(`${baseUrl}/search?q=358240051111110`, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => document.body.innerText.includes('لا توجد بلاغات مسجلة'));
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth),
    false,
    'Search result should not overflow horizontally on a mobile viewport',
  );
  assert.equal(searchRequests, 2, 'Valid IMEI URL should make one additional search request');
  const resultText = await page.$eval('#root', (root) => root.innerText);
  assert(!resultText.includes('جهاز نظيف'), 'No-report result must not claim the device is clean');
  assert.equal(resultText.split('لا توجد بلاغات مسجلة').length - 1, 1, 'No-report status should appear once');
  assert(resultText.includes('معلومات الجهاز'), 'Search result should present device details in a labeled section');
  assert(resultText.includes('نتيجة فحص Apple'), 'Search result should identify the checked device');
  assert(await page.$('[aria-label="حالة الجهاز"]'), 'Search result should expose a distinct device status panel');
  assert(
    resultText.includes(cleanResultDisclaimer),
    'Search results should show the same caution as the free IMEI article',
  );
  assert(!resultText.includes('الكود التقني'), 'Duplicate model code should be hidden');
  await page.setViewport({ width: 1280, height: 844 });
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth),
    false,
    'Search result should not overflow horizontally on a desktop viewport',
  );
  await page.setViewport({ width: 390, height: 844 });
  console.log('PASS search results use cautious wording and omit duplicate model codes');

  await page.goto(`${baseUrl}/search`, { waitUntil: 'networkidle0' });
  await page.click('#root button[aria-pressed="false"]');
  await page.type('#search-query', 'SN-TEST-123');
  await page.click('#root button[type="submit"]');
  await page.waitForFunction(() => document.body.innerText.includes('لا توجد بلاغات مسجلة'));
  assert.equal(searchPayloads[2].query_type, 'serial', 'Serial searches should send the selected query type');
  assert.equal(searchRequests, 3);
  console.log('PASS search page supports serial-number queries');

  await page.goto(`${baseUrl}/plans`, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => document.body.innerText.includes('أساسي'));
  await page.evaluate(() => {
    [...document.querySelectorAll('button')]
      .find((button) => button.textContent.includes('سنوي'))
      ?.click();
  });
  await page.waitForFunction(() => document.body.innerText.includes('990 ج.م'));
  console.log('PASS plans page loads API data and switches to annual prices');

  plansRequestsFail = true;
  await page.goto(`${baseUrl}/plans`, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => document.body.innerText.includes('تعذر تحميل الخطط التجريبي'));
  plansRequestsFail = false;
  await page.click('#root button[type="button"]');
  await page.waitForFunction(() => document.body.innerText.includes('أساسي'));
  assert.equal(plansRequests, 3, 'Plans retry should make a new API request after a failure');
  plansResponseMalformed = true;
  await page.goto(`${baseUrl}/plans`, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => document.body.innerText.includes('تعذر تحميل الخطط والأسعار'));
  plansResponseMalformed = false;
  await page.click('#root button[type="button"]');
  await page.waitForFunction(() => document.body.innerText.includes('أساسي'));
  assert.equal(plansRequests, 5, 'Malformed plans data should show an error and retry successfully');
  console.log('PASS plans page reports API errors and retries successfully');

  await page.goto(`${baseUrl}/forgot-password`, { waitUntil: 'networkidle0' });
  await page.type('#forgot-password-email', 'not-an-email');
  await page.click('#root button[type="submit"]');
  await page.waitForFunction(() => document.body.innerText.includes('صيغة البريد الإلكتروني غير صحيحة'));
  assert.equal(forgotPasswordRequests, 0, 'Invalid password reset email must not reach the API');
  await replaceInput(page, '#forgot-password-email', 'reset.user@example.test');
  await page.click('#root button[type="submit"]');
  await page.waitForFunction(() => document.body.innerText.includes('تحقق من بريدك الإلكتروني'));
  assert.equal(forgotPasswordRequests, 1, 'Password reset should send a valid email to the API');
  assert(
    !(await page.$eval('#root', (root) => root.innerText)).includes('تعذر إرسال البريد التجريبي'),
    'Password reset errors must not reveal whether an email is registered',
  );
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth),
    false,
    'Forgot-password confirmation should not overflow on a mobile viewport',
  );
  console.log('PASS forgot-password form validates input and preserves non-enumerating confirmation');

  const publicRoutes = [
    '/about',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/privacy',
    '/terms',
    '/contact',
    '/faq',
    '/blog',
    '/blog/free-imei-check',
    '/blog/how-to-check-stolen-phone',
    '/blog/what-to-do-if-phone-stolen',
    '/blog/what-to-do-if-phone-lost',
    '/blog/how-to-report-stolen-phone',
  ];

  for (const path of publicRoutes) {
    for (const width of [390, 1280]) {
      await page.setViewport({ width, height: 844 });
      await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle0' });
      await page.waitForSelector('main');
      const layout = await page.evaluate(() => ({
        overflows: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        mainBackground: getComputedStyle(document.querySelector('main')).backgroundColor,
        footerBackground: getComputedStyle(document.querySelector('footer')).backgroundColor,
      }));

      assert.equal(layout.overflows, false, `${path} should not overflow at ${width}px`);
      assert.equal(layout.mainBackground, 'rgb(247, 246, 242)', `${path} should use the shared page background`);
      assert.equal(layout.footerBackground, 'rgb(240, 238, 231)', `${path} should use the shared footer background`);
      if (path.startsWith('/blog/')) {
        assert(await page.$('nav[aria-label="مسار التنقل"] [aria-current="page"]'), `${path} should expose its current breadcrumb`);
        assert(await page.$('article[aria-labelledby="article-title"]'), `${path} should use the shared article surface`);
        assert(await page.$('section[aria-labelledby="article-search-cta-title"] a[href="/search"]'), `${path} should provide the device search action`);
        assert.equal(
          await page.$$eval('section[aria-labelledby="related-articles-title"] a', (links) => links.length),
          3,
          `${path} should show its related articles`,
        );
        if (path === '/blog/free-imei-check') {
          const articleText = await page.$eval('article', (article) => article.innerText);
          assert(articleText.includes(cleanResultDisclaimer), 'The free IMEI article and search result should use the same disclaimer');
        }
      }
      if (path === '/register' && width === 1280) {
        assert((await page.$eval('#root', (root) => root.innerText)).includes('خطوات بسيطة'), 'Registration should show the account setup panel');
      }
    }
  }
  console.log(`PASS ${publicRoutes.length} public routes share the design shell on mobile and desktop`);

  await page.setViewport({ width: 390, height: 844 });
  await page.goto(`${baseUrl}/blog/free-imei-check`, { waitUntil: 'networkidle0' });
  await page.click('section[aria-labelledby="related-articles-title"] a[href="/blog/how-to-check-stolen-phone"]');
  await page.waitForFunction(() => location.pathname === '/blog/how-to-check-stolen-phone');
  await page.waitForFunction(() => document.querySelector('h1')?.textContent.includes('كيف أعرف أن الهاتف مسروق'));
  await page.click('section[aria-labelledby="article-search-cta-title"] a[href="/search"]');
  await page.waitForFunction(() => location.pathname === '/search');
  console.log('PASS blog articles navigate through related guides and the search CTA');

  await page.setViewport({ width: 390, height: 844 });
  await page.goto(`${baseUrl}/faq`, { waitUntil: 'networkidle0' });
  await page.type('input[aria-label="ابحث في الأسئلة الشائعة"]', 'IMEI');
  await page.waitForFunction(() => document.body.innerText.includes('كيف أعرف رقم IMEI'));
  await page.click('#root button[aria-controls^="faq-answer-"]');
  await page.waitForFunction(() => document.querySelector('#root button[aria-controls^="faq-answer-"]')?.getAttribute('aria-expanded') === 'true');

  await page.goto(`${baseUrl}/privacy`, { waitUntil: 'networkidle0' });
  assert.equal(await page.$$eval('nav[aria-label="أقسام سياسة الخصوصية"] a', (links) => links.length), 10);
  await page.click('nav[aria-label="أقسام سياسة الخصوصية"] a[href="#privacy-data"]');
  await page.waitForFunction(() => location.hash === '#privacy-data');

  await page.goto(`${baseUrl}/terms`, { waitUntil: 'networkidle0' });
  assert.equal(await page.$$eval('nav[aria-label="أقسام شروط الاستخدام"] a', (links) => links.length), 10);
  await page.click('nav[aria-label="أقسام شروط الاستخدام"] a[href="#terms-disclaimer"]');
  await page.waitForFunction(() => location.hash === '#terms-disclaimer');

  await page.goto(`${baseUrl}/blog`, { waitUntil: 'networkidle0' });
  assert.equal(await page.$$eval('main a[href="/blog/free-imei-check"]', (links) => links.length), 1, 'Featured article should not be duplicated in the article list');

  await page.goto(`${baseUrl}/contact`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('form');
  assert(await page.$('input[placeholder="اسمك الكامل"]'), 'Contact form should remain available');
  assert(await page.$('textarea'), 'Contact message field should remain available');
  console.log('PASS FAQ search, legal navigation, blog feature, and contact form remain usable');

  await page.setViewport({ width: 390, height: 844 });
  await page.goto(baseUrl, { waitUntil: 'networkidle0' });
  await page.click('button[aria-label="فتح القائمة"]');
  await page.waitForSelector('#mobile-navigation');
  await page.click('#mobile-navigation a[href="/about"]');
  await page.waitForFunction(() => new URL(location.href).pathname === '/about');
  assert.equal(await page.$('#mobile-navigation'), null, 'Public mobile navigation should close after selecting a route');
  console.log('PASS public mobile navigation opens and closes after route selection');

  sessionUser = { id: 'test-user', full_name: 'مستخدم تجريبي', email: 'user@example.test', role: 'user' };
  await page.evaluate(() => {
    localStorage.setItem('access_token', `e30.${btoa(JSON.stringify({ exp: 2000000000 }))}.eA`);
    localStorage.setItem('refresh_token', 'e2e-refresh-token');
  });
  for (const path of ['/dashboard', '/reports', '/reports/new']) {
    for (const width of [390, 1280]) {
      await page.setViewport({ width, height: 844 });
      await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle0' });
      await page.waitForSelector('main');
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth),
        false,
        `${path} should not overflow at ${width}px`,
      );
      if (path === '/dashboard') {
        const reportButton = await page.$eval('main a[href="/reports/new"]', (button) => ({
          text: button.innerText.trim(),
          textColor: getComputedStyle(button).color,
          backgroundColor: getComputedStyle(button).backgroundColor,
          height: button.getBoundingClientRect().height,
        }));
        assert.equal(reportButton.text, 'تسجيل بلاغ جديد');
        assert.equal(reportButton.textColor, 'rgb(27, 79, 155)', 'Report action text should use the visible brand color');
        assert.equal(reportButton.backgroundColor, 'rgb(255, 255, 255)', 'Report action should retain its white background');
        assert(reportButton.height >= 44, 'Report action should retain a comfortable touch target');
      }
    }
  }
  console.log('PASS dashboard, reports, and report submission render on mobile and desktop');

  for (const [path, heading] of [
    ['/profile', 'إعدادات الحساب'],
    ['/reports/report-e2e', 'iPhone 14'],
  ]) {
    for (const width of [390, 1280]) {
      await page.setViewport({ width, height: 844 });
      await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle0' });
      await page.waitForFunction((text) => document.body.innerText.includes(text), {}, heading);
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth),
        false,
        `${path} should not overflow at ${width}px`,
      );
    }
  }
  console.log('PASS profile and report detail render on mobile and desktop');

  sessionUser = { id: 'test-admin', full_name: 'مدير تجريبي', email: 'admin@example.test', role: 'super_admin' };
  for (const [path, heading] of [
    ['/admin/reports', 'إدارة البلاغات'],
    ['/admin/users', 'إدارة المستخدمين'],
    ['/admin/search', 'بحث IMEI'],
    ['/admin/audit-logs', 'سجل الأحداث'],
    ['/admin/reports/report-e2e', 'بيانات الجهاز'],
  ]) {
    for (const width of [390, 1280, 1600]) {
      await page.setViewport({ width, height: 844 });
      await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle0' });
      await page.waitForFunction((text) => document.body.innerText.includes(text), {}, heading);
      if (path === '/admin/search') {
        await page.waitForFunction(() => document.body.innerText.includes('ابدأ بالبحث عن جهاز'));
      }
      if (path === '/admin/reports') {
        await page.waitForFunction(() => document.body.innerText.includes('iPhone 14'));
      } else if (path === '/admin/users') {
        await page.waitForFunction(() => document.body.innerText.includes('user@example.test'));
      } else if (path === '/admin/audit-logs') {
        await page.waitForFunction(() => document.body.innerText.includes('بلاغ جديد'));
      }
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth),
        false,
        `${path} should not overflow at ${width}px`,
      );
    }
  }
  assert.equal(adminSearchRequests, 0, 'Admin search visual checks must not submit an IMEI');
  await page.setViewport({ width: 390, height: 844 });
  await page.goto(`${baseUrl}/admin/search`, { waitUntil: 'networkidle0' });
  await page.type('input[aria-label="رقم IMEI للبحث"]', adminSearchResult.imei);
  await page.click('#root section button');
  await page.waitForFunction(() => document.body.innerText.includes('نتيجة الاستعلام'));
  assert.equal(adminSearchRequests, 1, 'Admin search should use the mocked API for its result view');
  assert((await page.$eval('#root', (root) => root.innerText)).includes('البلاغات (1)'), 'Admin search should show mocked report details');
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth),
    false,
    'Admin search results should not overflow on a mobile viewport',
  );
  await page.setViewport({ width: 390, height: 844 });
  await page.goto(`${baseUrl}/admin/audit-logs`, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => document.body.innerText.includes('بلاغ جديد'));
  await page.click('#root article button[aria-expanded="false"]');
  await page.waitForFunction(() => document.body.innerText.includes('report_id'));
  console.log('PASS remaining admin pages render without overflow and without submitting searches');

  await page.setViewport({ width: 390, height: 844 });
  await page.goto(`${baseUrl}/admin`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('#admin-sidebar');
  assert((await page.$eval('#root', (root) => root.innerText)).includes('iPhone 14'), 'Admin dashboard should render its pending report row');
  assert.equal(
    await page.$eval('#admin-sidebar a[href="/admin"]', (link) => link.getAttribute('aria-current')),
    'page',
    'Admin sidebar should mark the current route',
  );
  assert.equal(
    await page.$eval('#admin-sidebar', (sidebar) => getComputedStyle(sidebar).backgroundColor),
    'rgb(252, 251, 248)',
    'Admin sidebar should use the shared warm surface',
  );
  await page.click('button[aria-label="فتح القائمة الجانبية"]');
  await page.waitForFunction(() => {
    const sidebar = document.getElementById('admin-sidebar');
    const bounds = sidebar.getBoundingClientRect();
    return getComputedStyle(sidebar).visibility === 'visible'
      && bounds.left >= 0
      && bounds.right <= document.documentElement.clientWidth;
  });
  await page.click('#admin-sidebar a[href="/admin/reports"]');
  await page.waitForFunction(() => new URL(location.href).pathname === '/admin/reports');
  await page.waitForFunction(() => getComputedStyle(document.getElementById('admin-sidebar')).visibility === 'hidden');
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth),
    false,
    'Admin reports should not overflow on a mobile viewport',
  );

  await page.setViewport({ width: 1280, height: 844 });
  await page.goto(`${baseUrl}/admin`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('#admin-sidebar');
  const adminSidebarWidth = await page.$eval('#admin-sidebar', (sidebar) => sidebar.getBoundingClientRect().width);
  assert.equal(adminSidebarWidth, 256, 'Admin sidebar should retain its desktop width');
  await page.click('button[aria-label="طي القائمة"]');
  await page.waitForFunction(() => document.getElementById('admin-sidebar').getBoundingClientRect().width === 64);
  assert.equal(
    await page.$eval('#admin-sidebar a[href="/admin/reports"]', (link) => link.getAttribute('aria-label')),
    'البلاغات',
    'Collapsed admin navigation should keep accessible labels',
  );
  await page.click('button[aria-label="توسيع القائمة"]');
  await page.waitForFunction(() => document.getElementById('admin-sidebar').getBoundingClientRect().width === 256);
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth),
    false,
    'Admin dashboard should not overflow on a desktop viewport',
  );
  console.log('PASS admin sidebar drawer and dashboard remain usable across viewports');

  sessionUser = null;
  await page.evaluate(() => localStorage.clear());
  await page.setViewport({ width: 390, height: 844 });
  await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle0' });
  await page.type('input[type="email"]', 'not-an-email');
  await page.click('#root button[type="submit"]');
  await page.waitForFunction(() => document.body.innerText.includes('صيغة البريد الإلكتروني غير صحيحة'));
  assert.equal(loginRequests, 0, 'Invalid login data must be rejected before the API request');

  await replaceInput(page, 'input[type="email"]', 'wrong@example.test');
  await page.type('input[name="password"]', 'WrongPass123');
  await page.click('#root button[type="submit"]');
  await page.waitForFunction(() => document.body.innerText.includes('بيانات الدخول غير صحيحة'));
  assert.equal(loginRequests, 1, 'Rejected credentials should be sent only to the mocked API');

  await replaceInput(page, 'input[type="email"]', 'test.user@example.test');
  await replaceInput(page, 'input[name="password"]', 'TestPass123');
  await page.click('#root button[type="submit"]');
  await page.waitForFunction(() => location.pathname === '/dashboard' && document.body.innerText.includes('حساب تجريبي'));
  assert.equal(loginRequests, 2, 'Successful login should use the mocked API once');
  await page.waitForFunction(() => document.body.innerText.includes('حسابك يعمل، لكن بريدك الإلكتروني لم يُفعّل بعد.'));
  assert.equal(await page.$eval('[role="status"] button', (button) => button.textContent.trim()), 'إعادة إرسال رابط التفعيل');
  await page.click('[role="status"] button');
  await page.waitForFunction(() => document.body.innerText.includes('تم إرسال رابط التفعيل إلى بريدك الإلكتروني.'));
  assert.equal(verificationResends, 1, 'Unverified users should be able to request a new verification email');

  await page.goto(`${baseUrl}/profile`, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => document.querySelector('input[name="full_name"]'));
  await replaceInput(page, 'input[name="full_name"]', 'حساب تجريبي');
  await page.click('#profile-panel-profile button[type="submit"]');
  await page.waitForFunction(() => document.querySelector('#profile-panel-profile button[type="submit"]')?.innerText.includes('تم الحفظ!'), { timeout: 5000 });
  assert.equal(profileUpdates, 1, 'Profile save should call the mocked profile endpoint once');

  await page.click('#profile-tab-password');
  await page.waitForFunction(() => document.querySelector('#profile-tab-password')?.getAttribute('aria-pressed') === 'true', { timeout: 5000 });
  await page.waitForSelector('input[name="current_password"]');
  await page.type('input[name="current_password"]', 'CurrentPass123');
  await page.type('input[name="new_password"]', 'NewPass123');
  await page.type('input[name="confirm_password"]', 'DifferentPass123');
  assert.deepEqual(
    await page.$$eval('input[name]', (inputs) => Object.fromEntries(inputs.map((input) => [input.name, input.value]))),
    {
      current_password: 'CurrentPass123',
      new_password: 'NewPass123',
      confirm_password: 'DifferentPass123',
    },
    'Password test values should be entered into the intended fields',
  );
  await page.click('#root button[type="submit"]');
  await page.waitForFunction(() => document.body.innerText.includes('كلمتا المرور غير متطابقتين'));
  assert.equal(passwordChanges, 0, 'Mismatched password confirmation must not reach the API');
  await replaceInput(page, 'input[name="confirm_password"]', 'NewPass123');
  await page.click('#profile-panel-password button[type="submit"]');
  await page.waitForFunction(() => document.body.innerText.includes('تم تغيير كلمة المرور بنجاح'));
  assert.equal(passwordChanges, 1, 'Valid password change should call the mocked endpoint once');
  console.log('PASS login validation, mocked authentication, profile save, and password change');

  sessionUser = null;
  await page.evaluate(() => localStorage.clear());
  await page.goto(`${baseUrl}/register`, { waitUntil: 'networkidle0' });
  await page.type('input[name="full_name"]', 'E2E Test User');
  await page.type('input[type="email"]', 'new.user@example.test');
  await page.type('input[name="password"]', 'StrongPass123');
  await page.type('input[name="confirm_password"]', 'DifferentPass123');
  await page.click('#root button[type="submit"]');
  await page.waitForFunction(() => document.body.innerText.includes('كلمتا المرور غير متطابقتين'));
  assert.equal(registerRequests, 0, 'Invalid registration data must not reach the API');
  await replaceInput(page, 'input[name="confirm_password"]', 'StrongPass123');
  await page.click('#root button[type="submit"]');
  await page.waitForFunction(() => document.body.innerText.includes('تحقق من بريدك الإلكتروني'));
  assert.equal(registerRequests, 1, 'Valid registration should use the mocked API once');
  assert.deepEqual(
    await page.evaluate(() => [localStorage.getItem('access_token'), localStorage.getItem('refresh_token')]),
    [null, null],
    'Registration should not create an authenticated session before email verification',
  );
  console.log('PASS registration validation and confirmation use only the mocked API');
} finally {
  if (browser) await browser.close();
  if (server) await server.close();
}
