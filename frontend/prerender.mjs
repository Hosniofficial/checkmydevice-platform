/**
 * prerender.mjs
 * ─────────────────────────────────────────────────────────────────
 * Post-build script: serves dist/ with a local static server,
 * visits every public route with Puppeteer, waits for React to
 * render, then writes the full HTML to dist/<route>/index.html.
 *
 * Works in two environments:
 *  - Local dev:   uses full `puppeteer` package (Chrome downloaded automatically)
 *  - Vercel/CI:   uses `puppeteer-core` + `@sparticuz/chromium` (lightweight binary)
 *
 * Called automatically via `postbuild` in package.json.
 */

import { createServer }                           from 'http';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { existsSync }                             from 'fs';
import { join, resolve }                          from 'path';
import { fileURLToPath }                          from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const DIST      = resolve(__dirname, 'dist');
const BASE_PORT = 4173;

// ── Public routes to prerender ─────────────────────────────────
const ROUTES = [
  '/',
  '/search',
  '/plans',
  '/about',
  '/contact',
  '/faq',
  '/privacy',
  '/terms',
  '/blog',
  '/blog/free-imei-check',
  '/blog/how-to-check-stolen-phone',
  '/blog/what-to-do-if-phone-stolen',
  '/blog/what-to-do-if-phone-lost',
  '/blog/how-to-report-stolen-phone',
];

// Required meta tags — use regex to handle both single and double quotes
const REQUIRED_META = [
  /<meta[^>]+name=["']description["']/,
  /<meta[^>]+property=["']og:title["']/,
  /<meta[^>]+property=["']og:description["']/,
  /<link[^>]+rel=["']canonical["']/,
];

// ── Resolve Puppeteer (local vs Vercel/CI) ────────────────────
async function getBrowser() {
  const isCI = process.env.CI === 'true' || process.env.VERCEL === '1';

  if (isCI) {
    // Vercel / CI: use lightweight Chromium binary
    try {
      const chromium       = (await import('@sparticuz/chromium')).default;
      const puppeteerCore  = (await import('puppeteer-core')).default;
      return puppeteerCore.launch({
        args:            chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath:  await chromium.executablePath(),
        headless:        chromium.headless,
      });
    } catch (err) {
      throw new Error(`@sparticuz/chromium not available: ${err.message}. Make sure it is in dependencies (not devDependencies).`);
    }
  } else {
    // Local: use full Puppeteer with bundled Chromium
    const puppeteer = (await import('puppeteer')).default;
    return puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
  }
}

// ── Minimal static file server ─────────────────────────────────
function getMimeType(filePath) {
  if (filePath.endsWith('.js'))          return 'application/javascript';
  if (filePath.endsWith('.css'))         return 'text/css';
  if (filePath.endsWith('.png'))         return 'image/png';
  if (filePath.endsWith('.ico'))         return 'image/x-icon';
  if (filePath.endsWith('.svg'))         return 'image/svg+xml';
  if (filePath.endsWith('.webmanifest')) return 'application/manifest+json';
  if (filePath.endsWith('.xml'))         return 'application/xml';
  if (filePath.endsWith('.txt'))         return 'text/plain';
  return 'text/html';
}

function startServer() {
  return new Promise((resolvePromise, reject) => {
    let serverPort = BASE_PORT;

    const server = createServer((req, res) => {
      let filePath = join(DIST, req.url === '/' ? 'index.html' : req.url);
      filePath = filePath.split('?')[0]; // strip query strings

      if (!existsSync(filePath) || filePath.endsWith('/')) {
        filePath = join(DIST, 'index.html');
      }

      try {
        const content  = readFileSync(filePath);
        res.writeHead(200, { 'Content-Type': getMimeType(filePath) });
        res.end(content);
      } catch {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(readFileSync(join(DIST, 'index.html')));
      }
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        serverPort = BASE_PORT + 1;
        console.warn(`[Prerender] Port ${BASE_PORT} in use, trying ${serverPort}`);
        server.listen(serverPort);
      } else {
        reject(err);
      }
    });

    // Single source of truth — resolvePromise called only here
    server.on('listening', () => {
      const addr = server.address();
      serverPort = addr.port;
      console.log(`[Prerender] Static server at http://localhost:${serverPort}`);
      resolvePromise({ server, port: serverPort });
    });

    server.listen(BASE_PORT);
  });
}

// ── Verify required SEO meta tags ─────────────────────────────
function checkMeta(html, route) {
  const missing = REQUIRED_META.filter(regex => !regex.test(html));
  if (missing.length > 0) {
    console.warn(`[SEO] ⚠️  ${route} — missing ${missing.length} required tag(s)`);
  }
}

// ── Main ────────────────────────────────────────────────────────
async function main() {
  console.log('[Prerender] Starting prerender process...');
  console.log(`[Prerender] Environment: ${process.env.VERCEL === '1' ? 'Vercel' : process.env.CI === 'true' ? 'CI' : 'Local'}`);
  console.log(`[Prerender] Routes: ${ROUTES.length}`);

  const { server, port } = await startServer();
  const browser          = await getBrowser();

  let succeeded = 0;
  let failed    = 0;

  for (const route of ROUTES) {
    try {
      const page = await browser.newPage();

      // Pages that call external APIs during build can't reach networkidle
      // or have meaningful DOM content — handle them separately
      const apiPages = ['/plans'];

      await page.goto(`http://localhost:${port}${route}`, {
        waitUntil: 'load',
        timeout:   30000,
      });

      if (apiPages.includes(route)) {
        // Wait for the API abort timeout (3s) + React re-render
        await new Promise(r => setTimeout(r, 4000));
      } else {
        // Wait for network to be idle (tolerates analytics pings)
        try {
          await page.waitForNetworkIdle({ idleTime: 1000, timeout: 8000 });
        } catch {
          // Acceptable — some pages never fully idle
        }

        // Ensure #root has meaningful content
        await page.waitForFunction(
          () => {
            const root = document.querySelector('#root');
            return root && root.innerHTML.length > 200;
          },
          { timeout: 8000 }
        );
      }

      const html = await page.content();

      // Validate required SEO tags
      checkMeta(html, route);

      // Write output
      if (route === '/') {
        writeFileSync(join(DIST, 'index.html'), html, 'utf8');
      } else {
        const dir = join(DIST, route);
        mkdirSync(dir, { recursive: true });
        writeFileSync(join(dir, 'index.html'), html, 'utf8');
      }

      console.log(`[Prerender] ✅  ${route}`);
      succeeded++;
      await page.close();
    } catch (err) {
      console.warn(`[Prerender] ⚠️  ${route} — ${err.message}`);
      failed++;
    }
  }

  await browser.close();
  server.close();

  console.log(`\n[Prerender] Done — ${succeeded} succeeded, ${failed} failed`);
  if (failed === ROUTES.length) process.exit(1);
}

main().catch((err) => {
  console.error('[Prerender] Fatal error:', err);
  process.exit(1);
});
