# ESN First-Party Analytics

This Worker is the ESN-owned analytics backend for `esnoffical.com`.

## What it tracks

- Page views
- Anonymous unique visitors
- Sessions
- Pages per session and bounce rate
- Engagement time and scroll depth
- Top pages
- Referrer hosts
- Device, browser, OS and country breakdowns
- Downloads and outbound clicks
- Client-side error counts
- Live visitors and recent activity

It does **not** store raw visitor IP addresses. The Worker receives Cloudflare request metadata, hashes the browser-generated visitor ID with `ANALYTICS_SALT`, and only stores hashed visitor IDs. Login rate limiting also stores a salted IP hash rather than the raw IP.

## Deploy

1. Create a Cloudflare D1 database named `esn-analytics`.
2. Run `schema.sql` against it.
3. Copy `wrangler.toml.example` to `wrangler.toml`.
4. Put the D1 database ID into the binding.
5. Set secrets:
   - `STAFF_CODE_HASH` — SHA-256 hash of the staff analytics access code.
   - `ANALYTICS_SALT` — long random secret used only for one-way identifiers.
6. Deploy the Worker.
7. Attach `analytics-api.esnoffical.com` as the Worker custom domain, or set `VITE_ESN_ANALYTICS_API` to the deployed Worker URL.
8. Visit `/analytics` on the ESN website to view stats.

GitHub Pages cannot store global writeable analytics data by itself, which is why collection is intentionally separated into this Worker + D1 service.
