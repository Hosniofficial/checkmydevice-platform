/**
 * prerender.mjs
 * ─────────────────────────────────────────────────────────────────
 * Post-build script: serves dist/ with a local static server,
 * visits every public route with Puppeteer, waits for React to
 * hydrate, then writes the rendered HTML back to dist/<route>/index.html
 *
 * Run:  node prerender.mjs
 * (automatically called by `npm run build` via the `postbuild` hook)
 */

import puppeteer       from 'puppeteer';
import { createServer } from 'http';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const DIST      = resolve(__dirname, 'dist');
const PORT      = 4173;

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

// ── Minimal static file server ─────────────────────────────────
function getMimeType(filePath) {
  if (filePath.endsWith('.js'))   return 'application/javascript';
  if (filePath.endsWith('.css'))  return 'text/css';
  if (filePath.endsWith('.png'))  return 'image/png';
  if (filePath.endsWith('.ico'))  return 'image/x-icon';
  if (filePath.endsWith('.svg'))  return 'image/svg+xml';
  if (filePath.endsWith('.webmanifest')) return 'application/manifest+json';
  if (filePath.endsWith('.xml'))  return 'application/xml';
  if (filePath.endsWith('.txt'))  return 'text/plain';
  return 'text/html';
}

function startServer() {
  return new Promise((resolvePromise, reject) => {
    const server = createServer((req, res) => {
      let filePath = join(DIST, req.url === '/' ? 'index.html' : req.url);

      // Strip query strings
      filePath = filePath.split('?')[0];

      // SPA fallback — serve index.html for unknown paths
      if (!existsSync(filePath) || filePath.endsWith('/')) {
        filePath = join(DIST, 'index.html');
      }

      try {
        const content  = readFileSync(filePath);
        const mimeType = getMimeType(filePath);
        res.writeHead(200, { 'Content-Type': mimeType });
        res.end(content);
      } catch {
        const html = readFileSync(join(DIST, 'index.html'));
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
      }
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`[Prerender] Port ${PORT} in use, trying ${PORT + 1}`);
        server.listen(PORT + 1);
      } else {
        reject(err);
      }
    });

    server.listen(PORT, () => {
      console.log(`[Prerender] Static server running at http://localhost:${PORT}`);
      resolvePromise(server);
    });
  });
}

// ── Main ────────────────────────────────────────────────────────
async function main() {
  console.log('[Prerender] Starting prerender process...');
  console.log(`[Prerender] Routes to process: ${ROUTES.length}`);

  const server  = await startServer();
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  let succeeded = 0;
  let failed    = 0;

  for (const route of ROUTES) {
    try {
      const page = await browser.newPage();

      // Block unnecessary resources to speed up rendering
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const type = req.resourceType();
        if (['image', 'font', 'media'].includes(type)) {
          req.abort();
        } else {
          req.continue();
        }
      });

      // Pages that load data from API need special handling —
      // they show a spinner while fetching, so we grab the HTML
      // with correct <head> meta even if body content is spinner
      const apiPages = ['/plans'];

      if (apiPages.includes(route)) {
        await page.goto(`http://localhost:${PORT}${route}`, {
          waitUntil: 'domcontentloaded',
          timeout: 20000,
        });
        // Short delay for React to mount and inject helmet meta tags
        await new Promise(r => setTimeout(r, 1500));
      } else {
        await page.goto(`http://localhost:${PORT}${route}`, {
          waitUntil: 'networkidle0',
          timeout: 20000,
        });
        // Wait for React to finish rendering
        await page.waitForFunction(
          () => document.querySelector('#root') && document.querySelector('#root').innerHTML.length > 100,
          { timeout: 10000 }
        );
      }

      const html = await page.content();

      // Write to correct location
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
  // Don't fail the build if some pages couldn't be prerendered
  // (e.g. /plans needs live API — it still works at runtime)
  if (failed === ROUTES.length) process.exit(1);
}

main().catch((err) => {
  console.error('[Prerender] Fatal error:', err);
  process.exit(1);
});
