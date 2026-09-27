# ESN Website Migration Status

This repository is the replacement build for the current ES Network website. The production site at https://esnoffical.com remains intentionally untouched while the replacement is tested at https://ep1cservices.shop.

## Migrated and working

- Unified ESN Experience System 4.0 across the entire site
- One global header and footer on every route, including all six Arcade games
- Active navigation states, premium mobile navigation, network-status UI, upgraded page heroes, bento-style content hierarchy, and responsive game switcher

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
- 35 verified customer reviews migrated from the official site (12 Fortnite Coaching, 12 Editing, 11 Discord Server Setup)
- Interactive ES Tools:
  - Fortnite / creator challenge generator
  - focus timer
  - prompt generator
  - random picker
  - coin flip / D6 utility
  - website estimate utility
- Arcade rebuilt from the owner's official-site screen recording:
  - ES Clicker — tap loop, live stats, 110-upgrade Power Forge
  - ES Factory — 53 zones, production floors, 112-machine catalog
  - ES Mines — 5×5 board, original wager/mine choices, multiplier/cash-out flow
  - ES MOTO — side-view bike, touch controls, 1,000-track selection, checkpoints/best times
  - ES Tower — 122-floor reward ladder, three-door progression, wager/cash-out flow
  - ES Tower Defense — 200 rounds, original route-map layout and 10-tower roster/costs
- Current SMP host and port used by the rebuild
- Riftwalker Bundle price restored to $0.50 from the official ESN SMP Store
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

## Arcade source and upgrade rule

The owner supplied a 209-second recording of all six official Arcade games on esnoffical.com. The replacement Arcade is now rebuilt from that recording plus previously verified mechanic counts.

Upgrades may improve responsiveness, persistence, animation smoothness, accessibility, and mobile behavior, but the original game identities, core mechanics, controls, progression models, visual language, routes, and ES Coin concepts must remain recognizable.

## Content intentionally not fabricated

The following items are still blocked by missing exact source data. They remain protected instead of being guessed:

- Exact verified customer testimonial text
- Exact Stripe Payment Link for the $0.50 Void Warrior Bundle
- Any Service Showcase package price/detail that was not recoverable from previous scans
- Any leadership/team change beyond the latest verified roster and role labels

## Source recovery notes

The old Alf diagnostics confirmed the old homepage structure and route targets, but the original complete website source was not found in the accessible GitHub repositories. Public automated access to the current esnoffical.com site is also unavailable from the migration tooling, so missing exact text cannot be copied safely.

Mobile Coaching is discontinued and must not be restored.

## Launch rule

Do not point esnoffical.com at this repository until the test domain has been fully reviewed and every remaining exact-content item is either recovered, corrected by the owner, or deliberately omitted.
