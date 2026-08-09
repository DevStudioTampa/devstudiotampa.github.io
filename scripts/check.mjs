import { readFile, access } from 'node:fs/promises';
const html = await readFile('public/index.html', 'utf8');
const required = ['<title>', '<main', 'id="work"', 'id="services"', 'id="studio"', 'id="contact"', 'id="inquiry-form"', 'action="/api/inquiry"', '__TURNSTILE_SITE_KEY__', 'mailto:devstudiotampa@gmail.com', 'application/ld+json', 'data-hero-image', 'loading="lazy"'];
for (const token of required) if (!html.includes(token)) throw new Error(`Missing required markup: ${token}`);
if (!html.includes('href="/automotive"')) throw new Error('Automotive project link is missing');
if (html.includes('IMAGE PENDING') || html.includes('image placement pending')) throw new Error('Placeholder copy remains in the public site');
const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
if (new Set(ids).size !== ids.length) throw new Error('Duplicate HTML id found');

const automotiveHtml = await readFile('public/automotive.html', 'utf8');
const automotiveRequired = ['<title>', '<main', 'id="portfolio-title"', '>PORTRAITS</h2>', '>SPACES</h2>', 'data-collection', 'data-photo-set', 'class="set-gallery"', '<footer>'];
for (const token of automotiveRequired) if (!automotiveHtml.includes(token)) throw new Error(`Missing automotive markup: ${token}`);
const automotiveIds = [...automotiveHtml.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
if (new Set(automotiveIds).size !== automotiveIds.length) throw new Error('Duplicate automotive HTML id found');
const photoSets = [...automotiveHtml.matchAll(/<article class="photo-set"[^>]*data-photo-set[^>]*>([\s\S]*?)<\/article>/g)];
if (photoSets.length !== 2) throw new Error(`Expected 2 automotive photo sets, found ${photoSets.length}`);
for (const [, photoSet] of photoSets) {
  const imageCount = (photoSet.match(/<figure\b/g) || []).length;
  if (imageCount !== 5) throw new Error(`Automotive photo set must show exactly 5 images: ${imageCount}`);
}
if ((automotiveHtml.match(/<figure\b/g) || []).length !== 10) throw new Error('Automotive collection must show exactly 10 images');

const automotiveStems = [
  'portrait-porsche-front',
  'portrait-porsche-headlight',
  'portrait-porsche-profile',
  'portrait-ferrari-wheels',
  'portrait-ferrari-pair',
  'space-private-collection',
  'space-exotic-showroom',
  'space-tampa-night',
  'space-architecture',
  'space-stadium'
];
const staticFiles = ['public/styles.css','public/script.js','public/robots.txt','public/sitemap.xml','public/automotive.html','api/inquiry.mjs','supabase/migrations/20260808_public_inquiries.sql','vercel.json','public/images/hero-drift-2200.webp','public/images/automotive-corvette-1440.webp','public/images/event-drift-1440.webp','public/images/commercial-showroom-1440.webp','public/images/dst-og.jpg'];
for (const stem of automotiveStems) staticFiles.push(`public/images/automotive/${stem}-1440.jpg`);
for (const file of staticFiles) await access(file);
console.log(`Checked ${required.length + automotiveRequired.length} content requirements, ${ids.length + automotiveIds.length} unique IDs, 2 automotive sets, 10 collection images, and static assets.`);
