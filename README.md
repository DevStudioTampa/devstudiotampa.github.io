# Developer Studio Tampa — Public Website v0.1

Static-first portfolio for `devstudiotampa.com`. This repository is intentionally separate from the private Revenue OS application.

## Local development

```sh
npm run check
npm run build
python3 -m http.server 4173 --directory dist
```

Vercel reads `vercel.json`, runs the configured project build command (`npm run build`), and serves `dist`. There are no runtime dependencies, forms, trackers, credentials, or private application integrations.

## Photography

The initial release contains clearly marked image slots because the supplied iCloud album was inaccessible from the build environment. See [`docs/IMAGE_PLACEMENT.md`](docs/IMAGE_PLACEMENT.md) before adding approved photography.
