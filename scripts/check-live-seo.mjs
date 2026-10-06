import fs from 'node:fs'
import dns from 'node:dns/promises'

const base = 'https://esnoffical.com'
const issues = []
const results = []
const GH_PAGES_A = new Set(['185.199.108.153','185.199.109.153','185.199.110.153','185.199.111.153'])

try {
  const ips = await dns.resolve4('esnoffical.com')
  results.push('A records: ' + ips.join(', '))
  if (!ips.some(ip => GH_PAGES_A.has(ip))) {
    issues.push('A records do not match GitHub Pages; verify current host and Spaceship DNS.')
  }
} catch (error) {
  issues.push('Domain A-record lookup failed: ' + error.message)
}

async function inspect(route, check) {
  let response
  try {
    response = await fetch(base + route, {
      redirect: 'follow',
      signal: AbortSignal.timeout(15000),
      headers: { 'User-Agent': 'ESN-public-SEO-deploy-check' },
    })
    results.push(route + ': HTTP ' + response.status)
    if (!response.ok) throw new Error('HTTP ' + response.status)
    const value = await response.text()
    if (check && !check(value)) issues.push('Missing or invalid metadata at ' + route)
  } catch (error) {
    issues.push('Could not inspect ' + route + ': ' + error.message)
  }
}

await inspect('/', html => [
  '<title>ES Network (ESN)',
  'name="description"',
  'property="og:image"',
  'property="og:image:type" content="image/png"',
  'rel="canonical" href="https://esnoffical.com/"',
  'name="robots" content="index, follow',
].every(tag => html.includes(tag)))
await inspect('/robots.txt', text =>
  text.includes('User-agent: *') && text.includes('Sitemap: https://esnoffical.com/sitemap.xml'))
await inspect('/sitemap.xml', text =>
  text.includes('<urlset') && text.includes('<loc>https://esnoffical.com/</loc>'))
await inspect('/favicon-32.png')
await inspect('/apple-touch-icon.png')
await inspect('/social/esn-network.png')

const summary = [
  '## ESN public-domain SEO audit',
  ...results.map(v => '- ' + v),
  issues.length ? '\n### Unresolved problems' : '\n### Result',
  ...(issues.length ? issues.map(v => '- ' + v) : ['- Public metadata and assets are reachable.']),
].join('\n') + '\n'
console.log(summary)
if (process.env.GITHUB_STEP_SUMMARY) {
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary)
}
if (issues.length) process.exitCode = 1
