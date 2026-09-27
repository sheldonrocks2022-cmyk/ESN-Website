# ESN Website Migration Status

This repository is the replacement build for the current ES Network website. The live site at https://esnoffical.com is intentionally untouched during migration.

## Migrated and working in the repo

- Responsive ES Network design system
- Homepage and preserved homepage section anchors
- Service Showcase
- SMP Store
- SMP Connection page
- About
- Leadership
- FAQ
- Testimonials route
- ES Tools route
- Arcade hub
- Protected routes for:
  - ES Clicker
  - ES Factory
  - ES Mines
  - ES MOTO
  - ES Tower
  - ES Tower Defense
- Current official Discord link
- Current SMP IP and port
- Verified ESN leadership list
- Four verified Stripe Payment Links
- Exact Minecraft username / leading-period delivery warning
- SEO metadata, canonical tags, sitemap, robots.txt, structured data
- Route-specific static HTML generation
- SPA fallbacks for Vercel and compatible static hosts
- Baseline security headers
- Accessibility focus states, skip link, and reduced-motion support
- CI checks for protected routes, payment links, removed Mobile Coaching content, production build, and built route files

## Protected migrations not yet complete

These existing systems must be migrated from their original source instead of being recreated approximately:

- ES Clicker gameplay, saves, ES Coins, statistics, and upgrade system
- ES Factory gameplay, shared ES Coins, zones, machines, upgrades, and boosts
- ES Mines gameplay
- ES MOTO gameplay, tracks, checkpoints, touch controls, times, and challenges
- ES Tower gameplay
- ES Tower Defense gameplay
- Original ES Tools utilities

## Exact content still needed before production cutover

- Exact verified customer testimonial text
- Exact current package pricing/details for every Service Showcase package
- Exact Stripe Payment Link for the $0.50 Void Warrior Bundle

## Launch rule

Do not point esnoffical.com at this repository until every protected migration and required exact-content item above is either completed or intentionally removed by the site owner.
