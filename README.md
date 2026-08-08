# Developer Studio Tampa — Public Website

Static-first portfolio for `devstudiotampa.com`. This repository is intentionally separate from the private Revenue OS application.

## Local development

```sh
npm run check
npm run build
python3 -m http.server 4173 --directory dist
```

Vercel reads `vercel.json`, runs `npm run build`, serves the static site from `dist`, and runs the inquiry endpoint from `api/inquiry.mjs`.

## Inquiry flow

The public form:

1. Validates a short project brief in the browser and again on the server.
2. Verifies Cloudflare Turnstile on the server.
3. Calls the restricted Supabase `ingest_website_inquiry` function.
4. Saves an inquiry record and creates a `New` lead in the owner's Revenue OS workspace.
5. Uses Resend to notify the studio and acknowledge the prospective client.

Run `supabase/migrations/20260808_public_inquiries.sql` once against the Revenue OS Supabase project before enabling the form.

## Vercel configuration

Set these values in Vercel. Never place the Supabase secret key or Resend key in public HTML or a `VITE_*` variable.

| Variable | Purpose |
| --- | --- |
| `TURNSTILE_SITE_KEY` | Public Cloudflare Turnstile widget key used at build time |
| `TURNSTILE_SECRET_KEY` | Private Turnstile server-verification key |
| `TURNSTILE_ALLOWED_HOSTNAMES` | Comma-separated approved hosts, such as `devstudiotampa.com,www.devstudiotampa.com` |
| `SUPABASE_URL` | Revenue OS Supabase project URL |
| `SUPABASE_SECRET_KEY` | Preferred server-only `sb_secret_...` key |
| `DST_OWNER_USER_ID` | Supabase Auth user ID for the Revenue OS owner |
| `RESEND_API_KEY` | Private Resend API key |
| `INQUIRY_FROM_EMAIL` | Verified sender, such as `Developer Studio Tampa <inquiries@send.devstudiotampa.com>` |
| `INQUIRY_NOTIFICATION_EMAIL` | Destination for new inquiries; defaults to `devstudiotampa@gmail.com` |
| `PUBLIC_SITE_ORIGIN` | Optional extra allowed origin; production already permits `https://devstudiotampa.com` |

For local and Preview-only testing, the build falls back to Cloudflare's documented always-pass test site key. Production builds require a real `TURNSTILE_SITE_KEY`; the server endpoint also fails closed when required private configuration is absent.
