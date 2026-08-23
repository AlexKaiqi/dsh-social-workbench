import { createHash } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { realpath, stat } from 'node:fs/promises'
import path from 'node:path'

function hashFile(target) {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256')
    const stream = createReadStream(target)
    stream.on('data', (chunk) => hash.update(chunk))
    stream.on('error', reject)
    stream.on('end', () => resolve(`sha256:${hash.digest('hex')}`))
  })
}

export async function fingerprintFile(filePath, { baseDir } = {}) {
  if (typeof filePath !== 'string' || filePath === '') throw new Error('file path is required')
  const unresolved = path.isAbsolute(filePath) ? filePath : path.resolve(baseDir ?? process.cwd(), filePath)
  const canonicalPath = await realpath(unresolved)
  const metadata = await stat(canonicalPath)
  if (!metadata.isFile()) throw new Error(`path is not a regular file: ${canonicalPath}`)
  return { path: canonicalPath, size: metadata.size, contentHash: await hashFile(canonicalPath) }
}

export async function fingerprintMedia(media, { baseDir } = {}) {
  if (!Array.isArray(media) || media.length === 0) throw new Error('content.media must not be empty')
  const result = []
  for (const item of media) {
    if (!item || !['image', 'video'].includes(item.kind) || typeof item.path !== 'string') {
      throw new Error('each media item requires kind=image|video and path')
    }
    const fingerprint = await fingerprintFile(item.path, { baseDir })
    result.push({
      ...item,
      ...fingerprint,
    })
  }
  return result
}

export async function assertMediaUnchanged(revision) {
  const current = await fingerprintMedia(revision.content.media)
  for (let index = 0; index < current.length; index += 1) {
    const expected = revision.content.media[index]
    const actual = current[index]
    if (expected.path !== actual.path || expected.size !== actual.size || expected.contentHash !== actual.contentHash) {
      throw new Error(`media changed after revision was prepared: ${expected.path}`)
    }
  }
}

export async function assertExecutionArtifactsUnchanged(revision) {
  const manifest = revision.execution?.manifest
  if (!manifest) return
  const current = await fingerprintFile(manifest.path)
  if (manifest.path !== current.path || manifest.size !== current.size || manifest.contentHash !== current.contentHash) {
    throw new Error(`execution manifest changed after revision was prepared: ${manifest.path}`)
  }
}
