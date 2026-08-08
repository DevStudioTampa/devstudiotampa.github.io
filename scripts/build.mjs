import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';

const TURNSTILE_TEST_SITE_KEY = '1x00000000000000000000AA';
const turnstileSiteKey = process.env.TURNSTILE_SITE_KEY || TURNSTILE_TEST_SITE_KEY;
if (process.env.VERCEL_ENV === 'production' && !process.env.TURNSTILE_SITE_KEY) {
  throw new Error('TURNSTILE_SITE_KEY is required for a production build.');
}

await rm('dist', { recursive: true, force: true });
await mkdir('dist');
await cp('public', 'dist', { recursive: true });
const htmlPath = 'dist/index.html';
const html = await readFile(htmlPath, 'utf8');
if (!html.includes('__TURNSTILE_SITE_KEY__')) throw new Error('Turnstile site-key placeholder is missing.');
await writeFile(htmlPath, html.replaceAll('__TURNSTILE_SITE_KEY__', turnstileSiteKey));
console.log('Built static site to dist/');
