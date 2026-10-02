import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'

const BASE = 'https://github.com/sheldonrocks2022-cmyk/ESNSMP/releases/download/latest-main'
const JAR_URL = BASE + '/ESNSMP.jar'
const META_URL = BASE + '/ESNSMP-build.json'

async function fetchRequired(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'ESN-Website-Plugin-Sync' },
    redirect: 'follow'
  })
  if (!response.ok) throw new Error(`Download failed with HTTP ${response.status}: ${url}`)
  return response
}

async function main() {
  const [jarResponse, metaResponse] = await Promise.all([
    fetchRequired(JAR_URL),
    fetchRequired(META_URL)
  ])

  const jar = Buffer.from(await jarResponse.arrayBuffer())
  const sourceMeta = await metaResponse.json()
  const sha256 = createHash('sha256').update(jar).digest('hex')

  if (sourceMeta.sha256 && sourceMeta.sha256 !== sha256) {
    throw new Error(`SHA-256 mismatch: release metadata says ${sourceMeta.sha256}, downloaded JAR is ${sha256}`)
  }

  if (sourceMeta.sizeBytes && Number(sourceMeta.sizeBytes) !== jar.length) {
    throw new Error(`Size mismatch: release metadata says ${sourceMeta.sizeBytes}, downloaded JAR is ${jar.length}`)
  }

  const meta = {
    ...sourceMeta,
    filename: 'ESNSMP.jar',
    sizeBytes: jar.length,
    sha256,
    source: 'github-release-latest-main',
    downloadUrl: JAR_URL,
    syncedAt: new Date().toISOString()
  }

  await mkdir('public/downloads', { recursive: true })
  await writeFile('public/downloads/ESNSMP.jar', jar)
  await writeFile('public/esnsmp-build.json', JSON.stringify(meta, null, 2) + '\n')

  console.log(
    `Synced ESNSMP.jar from latest-main build #${meta.runNumber ?? '?'} (${String(meta.commit ?? '').slice(0, 7) || 'unknown'}) — ${jar.length} bytes — sha256:${sha256}`
  )
}

main().catch(error => {
  console.error('[ESNSMP sync]', error)
  process.exitCode = 1
})
