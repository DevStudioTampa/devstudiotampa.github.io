import { readFile, access } from 'node:fs/promises';
const html = await readFile('public/index.html', 'utf8');
const styles = await readFile('public/styles.css', 'utf8');
const required = ['<title>', '<main', 'id="work"', 'id="services"', 'id="studio"', 'id="contact"', 'id="inquiry-form"', 'action="/api/inquiry"', '__TURNSTILE_SITE_KEY__', 'mailto:devstudiotampa@gmail.com', 'application/ld+json', 'data-hero-image', 'loading="lazy"'];
for (const token of required) if (!html.includes(token)) throw new Error(`Missing required markup: ${token}`);
if (!html.includes('href="/automotive"')) throw new Error('Automotive project link is missing');
if (!html.includes('href="/commercial"')) throw new Error('Commercial project link is missing');
if (html.includes('IMAGE PENDING') || html.includes('image placement pending')) throw new Error('Placeholder copy remains in the public site');
const mobileHeroRequired = [
  '<span class="hero__mobile-copy">MAKE<br>SIGNIFICANCE<br></span><em>VISIBLE.</em>',
  '<span class="hero__mobile-copy">TAMPA, FLORIDA<br>PARTNERSHIPS + ONE-TIME PROJECTS</span>'
];
for (const token of mobileHeroRequired) if (!html.includes(token)) throw new Error(`Missing mobile hero markup: ${token}`);
if (html.includes('<span class="hero__mobile-copy">CARS, GARAGES, EVENTS + BRANDS</span>')) throw new Error('Removed mobile services label is still present');
const mobilePartnershipLabel = '<span class="hero__mobile-copy">TAMPA, FLORIDA<br>PARTNERSHIPS + ONE-TIME PROJECTS</span>';
const heroTitleMarkup = html.match(/<div class="hero__title">([\s\S]*?)<div class="hero__footer">/)?.[1] ?? '';
const heroFooterMarkup = html.match(/<p class="location">([\s\S]*?)<\/p>/)?.[1] ?? '';
if (heroTitleMarkup.includes(mobilePartnershipLabel)) throw new Error('Mobile partnership label must sit below the hero description');
if (!heroFooterMarkup.includes(mobilePartnershipLabel)) throw new Error('Mobile partnership label is missing below the hero description');
for (const token of ['left:0;right:0', 'bottom:-.82em', 'font-size:clamp(2.75rem,14vw,4rem)', '.hero__frame p{display:none}', '.hero__title>p{display:none}', '.hero__desktop-copy{display:none}', '.hero__mobile-copy{display:inline}', '.hero__footer .location{font-weight:500;letter-spacing:.11em}']) {
  if (!styles.includes(token)) throw new Error(`Missing mobile hero layout rule: ${token}`);
}
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

const commercialHtml = await readFile('public/commercial.html', 'utf8');
const commercialRequired = ['<title>', '<main', 'id="portfolio-title"', '>FERRARI CHARLOTTE</h2>', 'data-collection', 'data-photo-set', 'class="set-gallery"', '<footer>'];
for (const token of commercialRequired) if (!commercialHtml.includes(token)) throw new Error(`Missing commercial markup: ${token}`);
const commercialIds = [...commercialHtml.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
if (new Set(commercialIds).size !== commercialIds.length) throw new Error('Duplicate commercial HTML id found');
const commercialSets = [...commercialHtml.matchAll(/<article class="photo-set"[^>]*data-photo-set[^>]*>([\s\S]*?)<\/article>/g)];
if (commercialSets.length !== 1) throw new Error(`Expected 1 commercial photo set, found ${commercialSets.length}`);
const commercialImageCount = (commercialSets[0][1].match(/<figure\b/g) || []).length;
if (commercialImageCount < 1 || commercialImageCount > 10) throw new Error(`Commercial photo set must show 1 to 10 images: ${commercialImageCount}`);

const shopUrl = 'https://fineartamerica.com/profiles/theodore-castro';
for (const [pageName, pageHtml] of [['home', html], ['automotive', automotiveHtml], ['commercial', commercialHtml]]) {
  const nav = pageHtml.match(/<nav id="site-nav"[\s\S]*?<\/nav>/)?.[0] ?? '';
  const servicesPosition = nav.indexOf('>Services</a>');
  const shopPosition = nav.indexOf(`href="${shopUrl}"`);
  const aboutPosition = nav.indexOf('>About</a>');
  if (shopPosition < 0) throw new Error(`Shop link is missing from ${pageName} navigation`);
  if (!(servicesPosition < shopPosition && shopPosition < aboutPosition)) throw new Error(`Shop link must sit between Services and About on ${pageName}`);
}

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
const commercialStems = [
  'ferrari-race-front',
  'ferrari-race-rear',
  'ferrari-race-detail',
  'ferrari-red-front',
  'ferrari-showroom-lineup',
  'ferrari-showroom-pair',
  'ferrari-showroom-depth'
];
if (commercialImageCount !== commercialStems.length) throw new Error(`Commercial collection is missing an image: expected ${commercialStems.length}, found ${commercialImageCount}`);
const staticFiles = ['public/styles.css','public/script.js','public/robots.txt','public/sitemap.xml','public/automotive.html','public/commercial.html','api/inquiry.mjs','supabase/migrations/20260808_public_inquiries.sql','vercel.json','public/images/hero-drift-2200.webp','public/images/automotive-corvette-1440.webp','public/images/event-drift-1440.webp','public/images/commercial-showroom-1440.webp','public/images/dst-og.jpg'];
for (const stem of automotiveStems) staticFiles.push(`public/images/automotive/${stem}-1440.jpg`);
for (const stem of commercialStems) staticFiles.push(`public/images/commercial/${stem}-1440.jpg`);
for (const file of staticFiles) await access(file);
console.log(`Checked ${required.length + automotiveRequired.length + commercialRequired.length} content requirements, ${ids.length + automotiveIds.length + commercialIds.length} unique IDs, 2 automotive sets, 1 commercial set, 17 collection images, and static assets.`);
