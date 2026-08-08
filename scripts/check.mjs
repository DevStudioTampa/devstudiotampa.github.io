import { readFile, access } from 'node:fs/promises';
const html = await readFile('public/index.html', 'utf8');
const required = ['<title>', '<main', 'id="work"', 'id="services"', 'id="studio"', 'id="contact"', 'id="inquiry-form"', 'action="/api/inquiry"', '__TURNSTILE_SITE_KEY__', 'mailto:devstudiotampa@gmail.com', 'application/ld+json', 'data-hero-image', 'loading="lazy"'];
for (const token of required) if (!html.includes(token)) throw new Error(`Missing required markup: ${token}`);
if (html.includes('IMAGE PENDING') || html.includes('image placement pending')) throw new Error('Placeholder copy remains in the public site');
const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
if (new Set(ids).size !== ids.length) throw new Error('Duplicate HTML id found');
for (const file of ['public/styles.css','public/script.js','public/robots.txt','public/sitemap.xml','api/inquiry.mjs','supabase/migrations/20260808_public_inquiries.sql','vercel.json','public/images/hero-drift-2200.webp','public/images/automotive-corvette-1440.webp','public/images/event-drift-1440.webp','public/images/commercial-showroom-1440.webp','public/images/dst-og.jpg']) await access(file);
console.log(`Checked ${required.length} content requirements, ${ids.length} unique IDs, and static assets.`);
