import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { inflateRawSync } from 'node:zlib'

const OWNER = 'sheldonrocks2022-cmyk'
const REPO = 'ESNSMP'
const WORKFLOW = 'build.yml'
const ARTIFACT_NAME = 'ESNSMP'
const VERSION = 'v2.10.4'
const API = 'https://api.github.com'
const USER_AGENT = 'ESN-Website-Plugin-Sync'

async function githubJson(path) {
  const response = await fetch(API + path, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': USER_AGENT,
      'X-GitHub-Api-Version': '2026-03-10'
    }
  })
  if (!response.ok) {
    throw new Error(`GitHub API ${response.status} for ${path}`)
  }
  return response.json()
}

function extractJar(zipBytes) {
  const zip = Buffer.from(zipBytes)

  for (let offset = 0; offset <= zip.length - 46;) {
    if (zip.readUInt32LE(offset) !== 0x02014b50) {
      offset++
      continue
    }

    const compressionMethod = zip.readUInt16LE(offset + 10)
    const compressedSize = zip.readUInt32LE(offset + 20)
    const filenameLength = zip.readUInt16LE(offset + 28)
    const extraLength = zip.readUInt16LE(offset + 30)
    const commentLength = zip.readUInt16LE(offset + 32)
    const localHeaderOffset = zip.readUInt32LE(offset + 42)
    const filename = zip.subarray(offset + 46, offset + 46 + filenameLength).toString('utf8')

    if (filename.toLowerCase().endsWith('.jar')) {
      if (zip.readUInt32LE(localHeaderOffset) !== 0x04034b50) {
        throw new Error('Invalid ZIP local header for ESNSMP.jar')
      }

      const localFilenameLength = zip.readUInt16LE(localHeaderOffset + 26)
      const localExtraLength = zip.readUInt16LE(localHeaderOffset + 28)
      const dataStart = localHeaderOffset + 30 + localFilenameLength + localExtraLength
      const compressed = zip.subarray(dataStart, dataStart + compressedSize)

      if (compressionMethod === 0) return Buffer.from(compressed)
      if (compressionMethod === 8) return inflateRawSync(compressed)
      throw new Error(`Unsupported ZIP compression method ${compressionMethod}`)
    }

    offset += 46 + filenameLength + extraLength + commentLength
  }

  throw new Error('ESNSMP.jar was not found inside the GitHub Actions artifact')
}

async function latestArtifact() {
  const runs = await githubJson(
    `/repos/${OWNER}/${REPO}/actions/workflows/${WORKFLOW}/runs?branch=main&per_page=20`
  )

  for (const run of runs.workflow_runs ?? []) {
    if (run.status !== 'completed' || run.conclusion !== 'success') continue

    const artifactList = await githubJson(
      `/repos/${OWNER}/${REPO}/actions/runs/${run.id}/artifacts?per_page=100`
    )
    const artifact = (artifactList.artifacts ?? []).find(
      item => item.name === ARTIFACT_NAME && !item.expired
    )
    if (artifact) return { run, artifact }
  }

  throw new Error('No non-expired successful ESNSMP main-branch artifact was found')
}

async function main() {
  const { run, artifact } = await latestArtifact()
  const response = await fetch(artifact.archive_download_url, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': USER_AGENT,
      'X-GitHub-Api-Version': '2026-03-10'
    },
    redirect: 'follow'
  })

  if (!response.ok) {
    throw new Error(`Artifact download failed with HTTP ${response.status}`)
  }

  const jar = extractJar(await response.arrayBuffer())
  const sha256 = createHash('sha256').update(jar).digest('hex')

  await mkdir('public/downloads', { recursive: true })
  await writeFile('public/downloads/ESNSMP.jar', jar)
  await writeFile(
    'public/esnsmp-build.json',
    JSON.stringify({
      version: VERSION,
      filename: 'ESNSMP.jar',
      sizeBytes: jar.length,
      sha256,
      source: 'github-actions-main',
      commit: run.head_sha,
      runId: run.id,
      runNumber: run.run_number,
      buildUrl: run.html_url,
      builtAt: run.updated_at,
      syncedAt: new Date().toISOString()
    }, null, 2) + '\n'
  )

  console.log(
    `Synced ESNSMP.jar from main build #${run.run_number} (${run.head_sha.slice(0, 7)}) — ${jar.length} bytes — sha256:${sha256}`
  )
}

main().catch(error => {
  console.error('[ESNSMP sync]', error)
  process.exitCode = 1
})
