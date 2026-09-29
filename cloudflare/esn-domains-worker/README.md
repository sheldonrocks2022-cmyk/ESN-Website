# ESN Domains Cloudflare backend

This Worker is the control plane and reverse-proxy origin for ESN Domains.

## What it does

- Checks whether `name.esnoffical.com` is reserved.
- Stores rental requests in Cloudflare D1.
- Keeps DNS changes disabled until `ALLOW_DNS_MUTATIONS=true`.
- Requires server-side staff authentication before activation/suspension/renewal.
- Attaches exact `*.esnoffical.com` customer hostnames to the Worker through Cloudflare Workers Domains when staff approves a request.
- Creates Cloudflare for SaaS Custom Hostnames for customer-owned domains.
- Stores expiration timestamps and marks expired rentals.
- Proxies an active hostname only to its approved public HTTPS destination.

## Cloudflare setup

1. Add `esnoffical.com` to Cloudflare.
2. Create a D1 database named `esn-domains`.
3. Run `schema.sql` against it.
4. Copy `wrangler.toml.example` to `wrangler.toml` and add the D1 database id.
5. Create an API token with only the permissions needed for Worker Domains and Cloudflare for SaaS hostname management.
6. Set secrets with Wrangler. Never commit token values.
7. Deploy the Worker.
8. Attach `domains-api.esnoffical.com` as the API Worker Custom Domain.
9. Enable Cloudflare for SaaS and configure its fallback origin to the ESN Domains Worker/origin.
10. Set the website build variable `VITE_ESN_DOMAINS_API=https://domains-api.esnoffical.com`.
11. Verify requests while `ALLOW_DNS_MUTATIONS=false`.
12. Set prices/payment links, then enable DNS mutations only after verification.

## Staff-code note

The existing six-digit website staff code is acceptable as a lightweight UI gate, but DNS mutations are higher risk. The Worker rate-limits login attempts and keeps the comparison server-side. ESN should move domain administration to a longer unique admin secret before taking paid customers.
