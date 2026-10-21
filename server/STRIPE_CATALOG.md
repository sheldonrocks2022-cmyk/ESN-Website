# ESN Hosting — verified live Stripe subscription catalog

The live ESN Stripe account contains all 11 new, active, monthly USD Price IDs listed in `stripe-live-price-ids.json`, verified October 20, 2026. The prices are public identifiers, not API credentials. They correspond to the published ESN customer allocations, **not private physical node hardware**.

| Plan | USD/month | Price ID |
| --- | ---: | --- |
| Nano | $.50 | `price_1USnX2ISwShswuKddNYc1agT` |
| Starter | $.75 | `price_1USnXFISwShswuKduRu7GdTP` |
| Basic | $.99 | `price_1USnXHISwShswuKdUuEfqZR7` |
| Plus | $1.49 | `price_1USnXJISwShswuKdaGbILHQZ` |
| Advanced | $1.99 | `price_1USnXKISwShswuKdzfgoUTAG` |
| Pro | $2.99 | `price_1USnXMISwShswuKdYd1X7FZ3` |
| Elite | $4.99 | `price_1USnXOISwShswuKdxKED79eI` |
| Ultra | $7.99 | `price_1USnXPISwShswuKdVzHMmdwP` |
| Extreme | $8.99 | `price_1USnXRISwShswuKd2AGLcpSi` |
| Titan | $12.99 | `price_1USnXTISwShswuKdtisptupn` |
| Gift | $16.99 | `price_1USnXVISwShswuKdSLQme6hW` |

To configure Node 3, set `STRIPE_PRICE_IDS_JSON` in its **private** `server/.env` to the single-line JSON in the mapping file. Never commit or expose `STRIPE_SECRET_KEY` or `STRIPE_WEBHOOK_SECRET`. No existing Stripe products or subscriptions have been modified. Creating prices does not create customer subscriptions or bill anybody.

Checkout remains disabled until the HTTPS business API is deployed, webhook signature secret is installed, Discord OAuth is configured, billing test-mode checks pass, and all required provider configuration is verified. This catalog file does **not** automatically activate charging.
