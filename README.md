# ESN Website

Official GitHub source for the ES Network website rebuild.

> **Status:** active migration. The existing live site at https://esnoffical.com remains untouched until this replacement is fully tested.

## Stack

- React 19
- React Router
- Vite 8
- Static route metadata generation
- GitHub Actions validation

## Local development

```bash
npm install
npm run dev
```

## Validation

```bash
npm run validate
npm run build
npm run validate:dist
```

The validation layer protects important ESN routes, known Stripe Payment Links, the sitemap, and the removal of discontinued Mobile Coaching content.

## Production build

```bash
npm run build
```

The production build creates route-specific HTML files in `dist/` so deep links such as `/about`, `/storesmp`, and `/esclicker` can be deployed safely with route-specific metadata.

## Deployment

The repository includes:

- `vercel.json` for Vercel SPA/deep-link handling and baseline headers.
- `public/_redirects` for compatible static hosts such as Netlify.
- `public/_headers` for compatible static-host security headers.
- `public/robots.txt` and `public/sitemap.xml`.

The custom domain is **not** connected yet.

## Migration status

See [MIGRATION_STATUS.md](./MIGRATION_STATUS.md) before any production cutover.
