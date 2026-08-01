import { readFile, access } from 'node:fs/promises';
const html = await readFile('public/index.html', 'utf8');
const required = ['<title>', '<main', 'id="work"', 'id="services"', 'id="studio"', 'id="contact"', 'mailto:devstudiotampa@gmail.com', 'application/ld+json'];
for (const token of required) if (!html.includes(token)) throw new Error(`Missing required markup: ${token}`);
const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
if (new Set(ids).size !== ids.length) throw new Error('Duplicate HTML id found');
for (const file of ['public/styles.css','public/script.js','public/robots.txt','public/sitemap.xml','vercel.json']) await access(file);
console.log(`Checked ${required.length} content requirements, ${ids.length} unique IDs, and static assets.`);
