# ESN Website

Official source for the live **ES Network (ESN)** website.

**Website:** https://esnoffical.com  
**Explore ESN:** https://esnoffical.com/es-network  
**Guides + News:** https://esnoffical.com/guides  
**ESN SMP:** https://esnoffical.com/minecraft-smp  
**Website Builder:** https://esnoffical.com/website-builder  
**Free ES Tools:** https://esnoffical.com/free-browser-tools  
**Official Discord:** https://discord.gg/3gxA66KZ8

ES Network brings together creator services, the ESN SMP, six original browser games, free tools, website creation, community resources, and other ESN projects in one connected platform.

> **Current status:** production website deployed through GitHub Pages at https://esnoffical.com.

## Visibility and discovery

The website includes:

- Search-focused landing pages for ESN services, Minecraft SMP, the Website Builder, and free browser tools.
- ESN Guides + News with article metadata and structured data.
- Section-specific social preview cards.
- A dedicated ES Network identity page.
- Internal related-resource links across key public pages.
- Shareable ESN SMP feature pages.
- Referral-friendly URLs such as `?ref=discord` with privacy-friendly local diagnostics.
- A real ESN Website Builder showcase sourced from published `/sites/*` entries.
- Automatic **Built with ESN Website Builder** attribution on published Builder sites.

## Stack

- React 19
- React Router
- Vite 8
- Static route metadata generation
- Route-specific prerendered metadata
- GitHub Pages
- GitHub Actions validation
- CodeQL security analysis

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

The validation layer protects important ESN routes, known Stripe Payment Links, website-builder publishing safeguards, the sitemap, and other required production systems.

## Production build

```bash
npm run build
```

The build creates route-specific HTML in `dist/` so public deep links can ship with their own titles, descriptions, canonical URLs, structured data, and social metadata. It also creates a static `404.html` and generates the production sitemap from the shared SEO route source.

## Deployment

The repository contains:

- GitHub Pages deployment workflow.
- Website CI and route validation.
- CodeQL security analysis.
- `public/_headers` for compatible static-host security headers.
- `public/robots.txt` and `public/sitemap.xml`.
- ESN Website Builder publishing automation.

The production domain is:

**https://esnoffical.com**

---

Built for **ES Network — Build • Play • Create**.
