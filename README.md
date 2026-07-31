# DST Revenue OS v0.1

A private, local-first lead, offer, and quote workspace for Developer Studio Tampa LLC. It is designed for a solo photography practice validating one repeatable offer—not for high-volume outreach. No account, server, paid API, or OpenAI key is required.

## Install and run

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open the URL Vite prints (normally `http://localhost:5173`). For a production check, use `npm run build` and `npm run preview`.

## Tests

```bash
npm test
npm run build
```

Tests cover funnel conversions, queue priority, quote totals, and backup validation/round trips.

## Data, demo records, and backups

All data is stored in this browser's `localStorage` under `dst-revenue-os-v1`. It is not synchronized or transmitted by the app. Three clearly labeled fictional demo leads appear on first launch. Delete them individually from **Pipeline**, or clear the site data in browser settings.

Use **Pipeline → Backup** regularly to download a full JSON snapshot. Keep that file somewhere private. Use **Restore** and select a previously downloaded JSON file to replace the current workspace after schema validation. **CSV** exports lead fields for spreadsheet use; JSON is the complete backup format (including offers, activities, and quotes). Browser storage can be lost when site data is cleared, so it is not a substitute for backups.

Use **Import CSV** to append rows in the same header format produced by the CSV export. Quoted commas, quotes, and multiline notes are supported; invalid statuses fall back to New. CSV does not include activity history, offers, or quotes, so continue to use JSON for complete backups.

## Suggested daily use (20 minutes)

1. Open **Daily queue** and review the explanation behind each prioritized item.
2. Respond to genuine replies first; then follow up on due quotes without manufactured urgency.
3. Research one specific prospect and paste only verified facts into **Prospect workbench**.
4. Review and edit any draft before copying it to the channel yourself. The app never sends messages.
5. Update statuses and follow-up dates. Use **Dashboard** to watch the active offer's 30-day evidence.
6. When scope is clear, create a quote, save a revision, and use the browser's **Print / Save PDF** dialog.

## Architecture

- `src/types.ts` defines the persisted domain model.
- `src/logic.ts` contains pure business logic and clean `PrioritizationProvider`, `SuggestionProvider`, and `NextActionProvider` interfaces.
- `localRules` and `localSuggestion` are deterministic, transparent, free providers.
- `src/App.tsx` contains the approval-first UI and persistence boundary.

### Optional future OpenAI provider

Implement `SuggestionProvider` in a separate server-side adapter (never put an API key in this browser app). Send only user-approved, minimally necessary facts; return a draft plus the facts used; display it in the same review UI; and require a separate manual copy/send action. The local provider must remain available as a fallback. An AI provider must never scrape, send, update a record, or invent missing context autonomously.

## Privacy and limitations

- This is a single-browser tool with no login, collaboration, cloud sync, invoice delivery, e-signature, or payment collection.
- Quote numbers are unique inside the current local dataset; restoring older snapshots can roll the sequence back.
- Printing depends on the browser's PDF support.
- Do not store credentials, sensitive personal information, card/bank data, or data you do not have a reason to retain.
- Google Fonts may be fetched by the browser when online; system fonts are used if unavailable. Application features remain local.
