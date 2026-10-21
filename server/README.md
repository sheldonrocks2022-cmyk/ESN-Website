# ESN Business API — private VPS deployment

This is a **real server-side API implementation** for the ESN Business Hub. It is not part of GitHub Pages and must not be run inside the static website build.

It implements a persistent SQLite database, Discord authorization-code OAuth2 + PKCE, HttpOnly host-only secure sessions, CSRF/Origin checks, a server-maintained Discord staff allowlist, actual shared settings, customer requests, a verified order register, optional Stripe recurring Checkout Sessions, signed idempotent Stripe webhooks, and staff-confirmed Pterodactyl server provisioning.

**Nothing is live until a private VPS service, HTTPS/DNS, and provider credentials have been configured.** GitHub Actions only runs tests and deploys the static frontend. The frontend deliberately displays "Not connected" until you activate it.

## 1. Set up the ESN VPS privately

Node 24+ and HTTPS are required.

1. Use a dedicated, low-privilege Linux service user (for example \`esnbusiness\`). Copy the repository into \`/opt/esn-website\` with the API available at \`/opt/esn-website/server/app.mjs\`.
2. Give that service user write access to \`/var/lib/esn-business\`. Keep database backups encrypted and readable only by administrators.
3. Copy \`server/.env.example\` to \`server/.env\`. Fill it on the VPS using your terminal; **do not commit/upload or paste secrets into Discord or GitHub**. Set permission \`chmod 600\` and owner to the service user.
4. Configure a Spaceship DNS A record for \`api.esnoffical.com\` pointing to the **API VPS**. This is separate from the public website and need not reveal your private Pterodactyl node inventory.
5. Install the provided systemd example and nginx reverse proxy. Issue a Let's Encrypt HTTPS certificate with your nginx/certbot setup. The API must bind to \`127.0.0.1:8787\` and only nginx should be publicly reachable.
6. Test \`node server/app.mjs\` locally and \`curl https://api.esnoffical.com/health\` publicly. Verify \`/v1/public\` returns only plan allocations, non-sensitive program settings and integration readiness.
7. Ensure SQLite database durability, regular backups and restoration exercises. Keep OS/firewall updates current. Do not add an open admin panel without RBAC.

## 2. Configure Discord login

Create an application in Discord Developer Portal and register **exactly** \`https://api.esnoffical.com/v1/auth/discord/callback\` as its OAuth2 redirect URL. Set \`DISCORD_CLIENT_ID\`, \`DISCORD_CLIENT_SECRET\`, \`DISCORD_REDIRECT_URI\`.

Set \`STAFF_DISCORD_IDS\` to a comma-separated, privately controlled allowlist of the actual ESN CEO/admin Discord user IDs. The backend checks this allowlist on every staff request. The old website-local staff access code never grants API permission.

## 3. Activate actual recurring Stripe billing

Create **11 monthly recurring Stripe Prices** with the same amounts as the published catalog. Map the exact Stripe \`price_...\` IDs to names in \`STRIPE_PRICE_IDS_JSON\`, for example \`{"Nano":"price_REAL...","Starter":"price_REAL..."}\`. All eleven approved plans must have real recurring Price IDs or Checkout stays unavailable.

Set the private Stripe secret key in \`STRIPE_SECRET_KEY\`. In Stripe Dashboard add a webhook endpoint at:

\`https://api.esnoffical.com/v1/stripe/webhook\`

Subscribe to \`checkout.session.completed\`, \`invoice.paid\`, \`invoice.payment_failed\`, and \`customer.subscription.deleted\`. Store the signing secret in \`STRIPE_WEBHOOK_SECRET\` privately. Check event deliveries in Stripe Dashboard and run real provider test-mode end-to-end tests before enabling live prices. Never treat the Stripe success redirect as payment confirmation.

**Note:** Paid subscriptions are recorded from authenticated Stripe events. Unpaid/canceled cases are recorded for staff; customers' files aren't deleted automatically. Stripe may change invoice schemas; validate webhook event versions against your live account before charging real customers.

## 4. Connect Pterodactyl privately

Set the \`PTERODACTYL_URL\` to your HTTPS panel and store an **Application API key** server-side only. Configure the egg ID, a compatible Docker image, startup command, fixed environment variables, and a **dedicated, free** allocation ID. The server will create a Pterodactyl customer/user and server only for an order marked paid by Stripe's signed webhook and confirmed by an authorized staff member. The remote server gets the exact plan limits from the backend, not from customer-submitted resource quantities.

The supplied starter adapter uses **one configured allocation** and deliberately blocks another provision until capacity is reviewed. It is not a full multi-node allocator. Before large-scale sales, extend it with atomic allocation reservations, remote reconciliation, idempotent retries, billing/account lifecycle checks, and a proper queuing worker. This protects existing customers and prevents accidental overselling.

Customers need a verified email from Discord OAuth. ESN staff should direct new customers through the official panel password-reset flow. Do not send passwords in Discord DMs.

## 5. Enable the website-to-API connection

Once \`/health\` succeeds and the OAuth redirect works, in GitHub repository **Settings → Secrets and variables → Actions → Variables** create:

\`ESN_BUSINESS_API_URL = https://api.esnoffical.com\`

This is a PUBLIC endpoint origin and is safe to include in the site build. Run the **Deploy GitHub Pages** workflow on main. The React customer workspace and the secure staff queue will then use \`credentials: include\` and CSRF headers. CORS is restricted to \`https://esnoffical.com\`. If your actual browser origin is different (for example \`www.\`), update \`PUBLIC_SITE_ORIGIN\` to match exactly and retest.

## Backend endpoints

| Route | Purpose |
| --- | --- |
| \`GET /health\` | Basic API health |
| \`GET /v1/public\` | Safe public settings and approved plan allocations |
| \`GET /v1/auth/discord/start\` | Redirect to Discord OAuth2 + PKCE |
| \`GET /v1/auth/discord/callback\` | Verify state and create server-side session |
| \`GET /v1/me\` | Current authenticated profile |
| \`GET /v1/session/csrf\` | Rotate anti-CSRF token for a new write |
| \`POST /v1/auth/logout\` | Invalidate signed-in session |
| \`GET/POST /v1/requests\` | Private customer requests and submit |
| \`GET /v1/orders\` | Private customer orders |
| \`POST /v1/checkout\` | Create subscription Checkout only if all monthly Stripe Prices configured |
| \`POST /v1/stripe/webhook\` | Raw-body HMAC signature and timestamp verification, idempotent provider event processing |
| \`GET /v1/staff/overview\` | Staff-authorized cross-device request/order queue and audit |
| \`PATCH /v1/staff/settings\` | Authorized persistent global settings |
| \`PATCH /v1/staff/requests/:id\` | Staff review/approve/reject/complete |
| \`POST /v1/staff/orders/:id/provision\` | Manually provision verified paid order (guarded) |

No route returns node hardware specifications or provider credentials. Do not expose the \`server/.env\` file through a web server.

## Current limits before full automation

The integration still requires VPS deployment, your private provider connection data, webhook testing, database backups, a scalable allocation pool, recurring subscription customer portal, and proper operational monitoring. It is **not** a claim that Stripe or Pterodactyl has been connected just because the code has been merged. The previous browser-only staff editor remains a clearly labeled local preview; real controls are in the separate "Authenticated ESN staff dashboard" section.
