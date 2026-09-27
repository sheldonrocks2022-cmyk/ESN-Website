import fs from 'node:fs'
import path from 'node:path'

const ignored = new Set(['.git', 'node_modules', 'dist'])
const textExtensions = new Set(['.js', '.jsx', '.mjs', '.cjs', '.json', '.html', '.css', '.md', '.txt', '.yml', '.yaml', '.env', '.svg'])
const patterns = [
  ['Stripe secret key', /\bsk_(?:live|test)_[A-Za-z0-9]{16,}\b/g],
  ['GitHub personal access token', /\bghp_[A-Za-z0-9]{20,}\b/g],
  ['GitHub fine-grained token', /\bgithub_pat_[A-Za-z0-9_]{20,}\b/g],
  ['Slack bot token', /\bxoxb-[A-Za-z0-9-]{20,}\b/g],
  ['Private key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g],
  ['Discord token assignment', /\b(?:DISCORD_TOKEN|BOT_TOKEN)\s*=\s*[^\s#]{20,}/gi],
]

const findings = []

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(full)
      continue
    }
    const ext = path.extname(entry.name).toLowerCase()
    if (!textExtensions.has(ext) && !entry.name.startsWith('.env')) continue

    let content
    try {
      content = fs.readFileSync(full, 'utf8')
    } catch {
      continue
    }

    for (const [label, regex] of patterns) {
      regex.lastIndex = 0
      let match
      while ((match = regex.exec(content))) {
        const line = content.slice(0, match.index).split('\n').length
        findings.push(`${label}: ${full}:${line}`)
      }
    }
  }
}

walk('.')

if (findings.length) {
  console.error('Potential secrets detected:')
  for (const finding of findings) console.error(`- ${finding}`)
  process.exit(1)
}

console.log('Secret-pattern scan passed.')
