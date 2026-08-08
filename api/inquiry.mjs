import { randomUUID } from 'node:crypto';

const PROJECT_TYPES = new Set(['automotive', 'events', 'commercial', 'partnership', 'other']);
const CADENCES = new Set(['one-time', 'recurring', 'not-sure']);
const BUDGET_RANGES = new Set(['', 'under-500', '500-999', '1000-2499', '2500-4999', '5000-plus']);
const PROJECT_LABELS = {
  automotive: 'Automotive portraits + private spaces',
  events: 'Events + venues',
  commercial: 'Commercial content library',
  partnership: 'Ongoing partnership',
  other: 'Other / not sure yet'
};
const CADENCE_LABELS = {
  'one-time': 'One-time project',
  recurring: 'Ongoing / recurring',
  'not-sure': 'Not sure yet'
};
const BUDGET_LABELS = {
  '': 'Not specified',
  'under-500': 'Under $500',
  '500-999': '$500–$999',
  '1000-2499': '$1,000–$2,499',
  '2500-4999': '$2,500–$4,999',
  '5000-plus': '$5,000+'
};

function cleanText(value, maximum) {
  return typeof value === 'string'
    ? value.replace(/\u0000/g, '').replace(/\r\n?/g, '\n').trim().slice(0, maximum)
    : '';
}

export function validateInquiry(input) {
  const inquiry = {
    submissionId: cleanText(input?.submissionId, 100),
    name: cleanText(input?.name, 100),
    email: cleanText(input?.email, 254).toLowerCase(),
    phone: cleanText(input?.phone, 30),
    company: cleanText(input?.company, 120),
    projectType: cleanText(input?.projectType, 40),
    cadence: cleanText(input?.cadence, 40),
    projectDate: cleanText(input?.projectDate, 10),
    location: cleanText(input?.location, 120),
    budgetRange: cleanText(input?.budgetRange, 40),
    description: cleanText(input?.description, 2000),
    website: cleanText(input?.website, 200),
    turnstileToken: cleanText(input?.['cf-turnstile-response'], 4096)
  };
  const errors = {};

  if (!/^[0-9a-f-]{36}$/i.test(inquiry.submissionId)) errors.submissionId = 'Refresh the page and try again.';
  if (inquiry.name.length < 2) errors.name = 'Enter your full name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inquiry.email)) errors.email = 'Enter a valid email address.';
  if (!PROJECT_TYPES.has(inquiry.projectType)) errors.projectType = 'Choose a project type.';
  if (!CADENCES.has(inquiry.cadence)) errors.cadence = 'Choose how often you may need the work.';
  if (!BUDGET_RANGES.has(inquiry.budgetRange)) errors.budgetRange = 'Choose a listed budget range.';
  if (inquiry.projectDate && !/^\d{4}-\d{2}-\d{2}$/.test(inquiry.projectDate)) errors.projectDate = 'Enter a valid date.';
  if (inquiry.description.length < 10) errors.description = 'Share at least a few details about the project.';
  if (!inquiry.turnstileToken) errors.turnstile = 'Complete the security check.';

  return { inquiry, errors, valid: Object.keys(errors).length === 0 };
}

function parseBody(request) {
  const body = request.body;
  const size = Buffer.byteLength(typeof body === 'string' ? body : JSON.stringify(body || {}));
  if (size > 20_000) throw new Error('REQUEST_TOO_LARGE');
  if (typeof body === 'string') return JSON.parse(body);
  if (Buffer.isBuffer(body)) return JSON.parse(body.toString('utf8'));
  return body && typeof body === 'object' ? body : {};
}

function allowedOrigin(origin) {
  if (!origin) return false;
  const configured = (process.env.PUBLIC_SITE_ORIGIN || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  const deploymentUrls = [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL]
    .filter(Boolean)
    .map((value) => 'https://' + value);
  const allowed = new Set([
    'https://devstudiotampa.com',
    'https://www.devstudiotampa.com',
    ...configured,
    ...deploymentUrls
  ]);
  if (process.env.NODE_ENV !== 'production') {
    allowed.add('http://localhost:4173');
    allowed.add('http://127.0.0.1:4173');
  }
  return allowed.has(origin);
}

async function verifyTurnstile(token, remoteIp) {
  const form = new URLSearchParams({
    secret: process.env.TURNSTILE_SECRET_KEY,
    response: token,
    idempotency_key: randomUUID()
  });
  if (remoteIp) form.set('remoteip', remoteIp);

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: form
  });
  if (!response.ok) return false;
  const result = await response.json();
  if (!result.success) return false;

  const isTestSecret = process.env.TURNSTILE_SECRET_KEY === '1x0000000000000000000000000000000AA';
  const allowedHostnames = (process.env.TURNSTILE_ALLOWED_HOSTNAMES || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  return isTestSecret || allowedHostnames.length === 0 || allowedHostnames.includes(result.hostname);
}

function supabaseHeaders(key) {
  const headers = { apikey: key, 'Content-Type': 'application/json' };
  if (key.startsWith('eyJ')) headers.Authorization = 'Bearer ' + key;
  return headers;
}

async function storeInquiry(inquiry) {
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const response = await fetch(process.env.SUPABASE_URL + '/rest/v1/rpc/ingest_website_inquiry', {
    method: 'POST',
    headers: supabaseHeaders(key),
    body: JSON.stringify({
      p_submission_id: inquiry.submissionId,
      p_owner_user_id: process.env.DST_OWNER_USER_ID,
      p_name: inquiry.name,
      p_email: inquiry.email,
      p_phone: inquiry.phone || null,
      p_company: inquiry.company || null,
      p_project_type: PROJECT_LABELS[inquiry.projectType],
      p_cadence: CADENCE_LABELS[inquiry.cadence],
      p_project_date: inquiry.projectDate || null,
      p_location: inquiry.location || null,
      p_budget_range: BUDGET_LABELS[inquiry.budgetRange],
      p_description: inquiry.description
    })
  });
  if (!response.ok) throw new Error('INQUIRY_STORAGE_FAILED');
  const result = await response.json();
  return typeof result === 'string' ? result : String(result);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function sendEmail(message, idempotencyKey) {
  return fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + process.env.RESEND_API_KEY,
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey
    },
    body: JSON.stringify(message)
  });
}

async function sendInquiryEmails(inquiry, inquiryId) {
  const from = process.env.INQUIRY_FROM_EMAIL;
  const notificationEmail = process.env.INQUIRY_NOTIFICATION_EMAIL || 'devstudiotampa@gmail.com';
  const project = PROJECT_LABELS[inquiry.projectType];
  const cadence = CADENCE_LABELS[inquiry.cadence];
  const budget = BUDGET_LABELS[inquiry.budgetRange];
  const details = [
    'Name: ' + inquiry.name,
    'Email: ' + inquiry.email,
    'Phone: ' + (inquiry.phone || 'Not provided'),
    'Company: ' + (inquiry.company || 'Not provided'),
    'Project: ' + project,
    'Cadence: ' + cadence,
    'Preferred date: ' + (inquiry.projectDate || 'Not provided'),
    'Location: ' + (inquiry.location || 'Not provided'),
    'Budget: ' + budget,
    '',
    inquiry.description
  ].join('\n');
  const detailsHtml = escapeHtml(details).replaceAll('\n', '<br>');

  const messages = [
    sendEmail({
      from,
      to: [notificationEmail],
      reply_to: inquiry.email,
      subject: 'New DST inquiry: ' + project + ' from ' + inquiry.name,
      text: details,
      html: '<h1>New project inquiry</h1><p>' + detailsHtml + '</p>'
    }, 'dst-inquiry-' + inquiryId + '-owner'),
    sendEmail({
      from,
      to: [inquiry.email],
      reply_to: notificationEmail,
      subject: 'Developer Studio Tampa received your inquiry',
      text: 'Hi ' + inquiry.name + ',\n\nYour inquiry is in. I will review the details and reply personally.\n\nProject: ' + project + '\nTiming: ' + cadence + '\n\nTheodore Castro\nDeveloper Studio Tampa',
      html: '<p>Hi ' + escapeHtml(inquiry.name) + ',</p><p>Your inquiry is in. I will review the details and reply personally.</p><p><strong>Project:</strong> ' + escapeHtml(project) + '<br><strong>Timing:</strong> ' + escapeHtml(cadence) + '</p><p>Theodore Castro<br>Developer Studio Tampa</p>'
    }, 'dst-inquiry-' + inquiryId + '-client')
  ];
  const results = await Promise.allSettled(messages);
  return results.every((result) => result.status === 'fulfilled' && result.value.ok);
}

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ ok: false, message: 'Method not allowed.' });
  }
  if (!allowedOrigin(request.headers.origin)) {
    return response.status(403).json({ ok: false, message: 'This submission could not be verified.' });
  }

  const requiredConfig = [
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
    process.env.DST_OWNER_USER_ID,
    process.env.TURNSTILE_SECRET_KEY,
    process.env.RESEND_API_KEY,
    process.env.INQUIRY_FROM_EMAIL
  ];
  if (requiredConfig.some((value) => !value)) {
    return response.status(503).json({ ok: false, message: 'The inquiry form is being configured. Please email devstudiotampa@gmail.com.' });
  }

  try {
    const body = parseBody(request);
    if (cleanText(body.website, 200)) return response.status(200).json({ ok: true });

    const { inquiry, errors, valid } = validateInquiry(body);
    if (!valid) {
      return response.status(400).json({ ok: false, message: 'Check the highlighted details and try again.', errors });
    }

    const forwarded = cleanText(request.headers['x-forwarded-for'], 100);
    const remoteIp = forwarded.split(',')[0].trim();
    if (!(await verifyTurnstile(inquiry.turnstileToken, remoteIp))) {
      return response.status(400).json({ ok: false, message: 'The security check expired. Complete it again and resubmit.' });
    }

    const inquiryId = await storeInquiry(inquiry);
    const emailSent = await sendInquiryEmails(inquiry, inquiryId);
    if (!emailSent) console.error('One or more inquiry emails were not accepted by the email provider.');
    return response.status(201).json({ ok: true, emailSent });
  } catch (error) {
    const tooLarge = error instanceof Error && error.message === 'REQUEST_TOO_LARGE';
    if (!tooLarge) console.error('Inquiry intake failed:', error instanceof Error ? error.message : 'unknown error');
    return response.status(tooLarge ? 413 : 500).json({
      ok: false,
      message: tooLarge
        ? 'That submission is too large.'
        : 'Something interrupted the form. Try again, or email devstudiotampa@gmail.com.'
    });
  }
}
