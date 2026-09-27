import fs from 'node:fs'
import path from 'node:path'

const routes = [
  '/',
  '/home',
  '/serviceshowcase',
  '/storesmp',
  '/store',
  '/store/smp',
  '/smpconnection',
  '/smpconsole',
  '/smpplugin',
  '/estools',
  '/tools',
  '/arcade',
  '/esclicker',
  '/esfactory',
  '/esmines',
  '/esmoto',
  '/estower',
  '/estowerdefense',
  '/about',
  '/leadership',
  '/testimonials',
  '/faq',
]

const failures = []

for (const route of routes) {
  const file = route === '/'
    ? path.join('dist', 'index.html')
    : path.join('dist', route.slice(1), 'index.html')

  if (!fs.existsSync(file)) {
    failures.push(`Missing built route file: ${file}`)
    continue
  }

  const html = fs.readFileSync(file, 'utf8')
  if (!html.includes('<title>')) failures.push(`Missing title in ${file}`)
  if (!html.includes('rel="canonical"')) failures.push(`Missing canonical tag in ${file}`)
  if (!html.includes('name="description"')) failures.push(`Missing description in ${file}`)
}

const notFoundFile = path.join('dist', '404.html')
if (!fs.existsSync(notFoundFile)) {
  failures.push('Missing built 404.html')
}

if (failures.length) {
  console.error('Built route validation failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log(`Built route validation passed for ${routes.length} routes.`)
