# ESN Business Platform — safe launch and activation guide

## What's live in the static website

- `/business` — human-friendly customer entry point with all 15 business features discoverable.
- `/business/plans` — the approved 11 ESN monthly plans, a basic sizing recommendation, comparison, and Discord ticket message builder.
- `/business/dashboard` — **device-local draft workspace only**. Not an authenticated account, order history, invoice portal, or subscription database.
- `/business/partners` — staff-reviewed partnership and referral enquiries. It does **not** attribute, pay, or count referrals.
- `/business/rewards` — staff-approved loyalty/rewards policy information, no redeemable balances.
- `/business/support` — existing support, diagnostics, status, and reviews pages.
- `/business/setup` — Python/Node.js setup checklist with safe token handling guidance.
- `/staff` — business toggles and copy controls **in a browser-only preview**, after the existing local staff gate. Drafts and activity on this device only.

All customer and staff drafts are localStorage preview data. An exported JSON configuration is **not** automatically published, and there is no cross-device synchronization. These pages should never request passwords, Discord tokens, API secrets, payment cards, or Pterodactyl keys.

## Read this before enabling real automation

The current deployed domain is a **static GitHub Pages site**. A client-side access-code/hash is not secure server authentication. It is **not appropriate** to authorize billing, credit grants, trial provisioning, server management, personal customer records, or staff privileges.

**Required for production (none is connected by this change):**

1. Deploy a separate HTTPS backend (for example, an ESN-owned service or supported serverless runtime) with private environment settings. Choose a persistent SQL database and a session store.
2. Add **Discord OAuth2 authorization code + PKCE**. Verify `state`, signed server-side sessions, CSRF protection, cookie `Secure/HttpOnly/SameSite`, expiry and revoke. Map staff permissions against a server-maintained allowlist/Discord server roles *on the server*, never by trusting localStorage, a UI field, or a hashed code in JavaScript.
3. Implement **Stripe Billing** with server-created monthly Checkout Sessions and customer portal sessions. Resolve products/prices to staff-approved server-side IDs; do not accept client-submitted price, amount, or resource quantities. Verify Stripe webhook signatures on the exact raw request body, deduplicate event IDs, track subscription payment/delinquency/cancellation, and persist invoices/renewal dates only from Stripe.
4. Integrate the **Pterodactyl** administration API on the server with a narrowly scoped key stored as a secret. Provision only after an authenticated order and verified Stripe payment. Validate account ownership, supported eggs, plan resource limits and node allocations. Do not expose node IPs/hardware/provider/identifiers in public responses. Make provisioning idempotent and retryable, and record audit logs.
5. Add an approval workflow for **free trials**, with abuse prevention, one-trial-per-eligible-customer rules, TTL/expiry, resource caps, and staff visibility. Never provision trials merely because a user changes a toggle in the browser.
6. Add server-generated referral codes tied to customers with validated conversion attribution. Qualifying paid invoices and anti-fraud rules must be checked before any reward, hosting credit, or loyalty status is awarded.
7. Store reviews only after order verification (with moderation and consent). Do not count draft reviews as verified. Store milestone totals only from trusted authoritative sources rather than visitors or page localStorage.
8. Serve a staff-only API with role-based access, request validation, rate limiting, immutable audit trails, and scoped actions for: product catalog, partner review, requests, trial approvals, renewal status, service notices, rewards policy, loyalty policy, support articles, verified reviews, and server upgrade requests.
9. Build reliable monitoring for the public status page using only aggregate service health and incident data. Maintain separate private node inventory for authenticated staff, not public JSON.
10. Load published public configuration from the backend (cacheable with versioning) and staff mutations through authenticated API writes. Keep the browser-preview controls separate until then.

## Staff dashboard controls (current)

- Show/hide preview features: plan finder, plan comparison, local workspace, trial enquiries, partner applications, referral enquiries, rewards/loyalty information, community milestone display.
- Change featured hosting plan, trial plan, duration, business headline and copy, support message and business notices.
- Maintain staff-verified milestone numbers manually in the preview. Display attribution as "staff-supplied"; don't imply a live count.
- Review, copy, or delete *local* request drafts. Never label these as approved, paid, or provisioned.
- Export JSON for manual review in GitHub. This is intentionally not wired to publication from an untrusted browser.
- Inspect integration readiness (always marked "NOT CONNECTED" until a backend is actually wired).

## Production integration API contract (planning only)

| Action | Required authorization | Trusted confirmation |
|---|---|---|
| `GET /api/me` | Signed Discord OAuth session | Server-loaded identity |
| `GET /api/customer/orders` | Customer session | Database ownership checks |
| `POST /api/checkout` | Customer session | Server-controlled Stripe price ID |
| `POST /api/stripe/webhook` | Signed Stripe webhook | Raw-body signature validation |
| `POST /api/customer/upgrade` | Customer session | Owner check + approved quote |
| `POST /api/customer/trial` | Customer session | Eligibility + staff approval |
| `POST /api/customer/referral` | Customer session | Validated referral attribution |
| `GET /api/staff/queue` | Signed, role-checked staff session | Private records only |
| `PATCH /api/staff/settings` | Owner/admin permission | Validated shared settings write + audit |
| `POST /api/staff/provision` | Granular staff role | Verified payment/trial + idempotency |
| `POST /api/staff/review` | Staff reviewer | Order proof + consent + moderation |
| `GET /api/public/status` | Public | Aggregate service status only |

**Never deploy placeholder endpoints that mutate bills, access, credits, or nodes based on client localStorage or browser-only staff codes.**

## Regression and acceptance tests before production

- All 11 approved hosting tiers show correct prices/RAM/CPU/storage. Server-side quantities must match exactly.
- No internal node RAM/cores/provider/IP/name/capacity details in public website source or API JSON.
- The site remains usable with JavaScript storage disabled (links must still point to official support and status).
- Distinguish browser-only drafts from submitted verified orders visually and in copy.
- Test desktop width and Android "Desktop site" mode. The Arcade games and customer-created `/sites/*` pages must remain untouched.
- Verify payment webhook retries, duplicate events, insufficient/failed renewals, canceled subscriptions, trial expiry, partial provisioning failures, staff RBAC, CSRF, customer account ownership, and refund/chargeback cases.

## No credential or billing changes included

No Stripe products, recurring payment agreements, payment links, Discord OAuth secrets, VPS control credentials, Pterodactyl allocations, or GitHub Pages infrastructure are modified by this feature.
