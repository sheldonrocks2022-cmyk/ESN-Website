# ESN Website Migration Status

This repository is the replacement build for the current ES Network website. The production site at https://esnoffical.com remains intentionally untouched while the replacement is tested at https://ep1cservices.shop.

## Migrated and working

- Responsive ES Network design system
- Homepage and preserved homepage section anchors
- Service Showcase and known service categories
- Website Creation estimator values previously surfaced in ES Tools ($180 starter / $320 multi-page)
- SMP Store
- SMP Connection page
- Dedicated console connection guide
- About / Why ES Network content
- Leadership separated from Administration
- Landon Founder & CEO responsibility list
- FAQ
- Testimonials route with verified-content-only policy
- Interactive ES Tools:
  - Fortnite / creator challenge generator
  - focus timer
  - prompt generator
  - random picker
  - coin flip / D6 utility
  - website estimate utility
- Rebuilt ESN Arcade 2.0 with a shared local ES Coin profile:
  - ES Clicker: Overdrive
  - ES Factory: Neon Grid
  - ES Mines: Riftfield
  - ES MOTO: Hyperlane with 1,000 generated tracks
  - ES Tower: Skyline
  - ES Tower Defense: Rift Siege
- Current SMP host and port used by the rebuild
- Four verified Stripe Payment Links
- Exact Minecraft username / leading-period delivery warning
- SEO metadata, canonical tags, sitemap, robots.txt, structured data
- Route-specific static HTML generation
- Static 404 output
- GitHub Pages deployment
- Test domain: https://ep1cservices.shop
- Test-domain noindex protection while canonicals continue to target https://esnoffical.com
- Security headers, npm audit, secret-pattern scan, and CodeQL
- Accessibility focus states, skip link, and reduced-motion support
- CI checks for routes, payment links, removed Mobile Coaching content, migrated modules, production build, and built route files

## Content intentionally not fabricated

The following items are still blocked by missing exact source data. They remain protected instead of being guessed:

- Exact verified customer testimonial text
- Exact current price for the Riftwalker Bundle
- Exact Stripe Payment Link for the $0.50 Void Warrior Bundle
- Any Service Showcase package price/detail that was not recoverable from previous scans
- Any leadership/team change beyond the latest verified roster and role labels

## Source recovery notes

The old Alf diagnostics confirmed the old homepage structure and route targets, but the original complete website source was not found in the accessible GitHub repositories. Public automated access to the current esnoffical.com site is also unavailable from the migration tooling, so missing exact text cannot be copied safely.

Mobile Coaching is discontinued and must not be restored.

## Launch rule

Do not point esnoffical.com at this repository until the test domain has been fully reviewed and every remaining exact-content item is either recovered, corrected by the owner, or deliberately omitted.
