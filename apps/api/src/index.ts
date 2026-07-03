import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { PrismaClient } from '@prisma/client';
import { Hono } from 'hono';
import { buildCatalog } from './catalog.ts';

const prisma = new PrismaClient();
const app = new Hono();

app.get('/api/health', (c) => c.json({ ok: true }));

app.get('/api/catalog', async (c) => {
  const catalog = await buildCatalog(prisma);
  return c.json(catalog);
});

// เสิร์ฟ SPA ที่ build แล้วจาก origin เดียวกัน (ADR 0004) — ถ้ายังไม่ build ให้ข้าม (โหมด dev ใช้ Vite proxy)
const here = path.dirname(fileURLToPath(import.meta.url));
const webDist = process.env.WEB_DIST ?? path.resolve(here, '../../web/dist');
if (existsSync(webDist)) {
  const root = path.relative(process.cwd(), webDist);
  app.use('/*', serveStatic({ root }));
  app.get('*', serveStatic({ root, rewriteRequestPath: () => '/index.html' }));
}

const port = Number(process.env.PORT ?? 3000);
serve({ fetch: app.fetch, port }, (info) => {
  console.log(`FridgeChef API พร้อมที่ http://localhost:${info.port}`);
});
