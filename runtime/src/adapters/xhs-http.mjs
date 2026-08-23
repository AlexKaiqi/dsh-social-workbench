const PRIVATE_VISIBILITY = '仅自己可见'

function joinUrl(baseUrl, pathname) {
  return new URL(pathname, baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`).toString()
}

function unwrapData(value) {
  let current = value
  for (let index = 0; index < 4; index += 1) {
    if (!current || typeof current !== 'object' || Array.isArray(current) || !('data' in current)) break
    current = current.data
  }
  return current
}

function findFeeds(value) {
  if (!value || typeof value !== 'object') return []
  if (Array.isArray(value.feeds)) return value.feeds
  for (const child of Object.values(value)) {
    if (child && typeof child === 'object') {
      const found = findFeeds(child)
      if (found.length > 0) return found
    }
  }
  return []
}

function feedTitle(feed) {
  return feed?.noteCard?.displayTitle ?? feed?.note_card?.display_title ?? ''
}

function mediaCount(detail) {
  const note = unwrapData(detail)?.note ?? unwrapData(detail)?.data?.note ?? unwrapData(detail)
  if (Array.isArray(note?.imageList)) return note.imageList.length
  if (Array.isArray(note?.image_list)) return note.image_list.length
  return note?.video ? 1 : 0
}

function noteBody(detail) {
  const note = unwrapData(detail)?.note ?? unwrapData(detail)?.data?.note ?? unwrapData(detail)
  return note?.desc ?? note?.content ?? ''
}

export class XiaohongshuHttpAdapter {
  constructor({ baseUrl = 'http://127.0.0.1:18060', token, fetchImpl = fetch, timeoutMs = 60_000 } = {}) {
    this.baseUrl = baseUrl
    this.token = token
    this.fetchImpl = fetchImpl
    this.timeoutMs = timeoutMs
  }

  async request(pathname, { method = 'GET', body, timeoutMs = this.timeoutMs } = {}) {
    const headers = { accept: 'application/json' }
    if (body !== undefined) headers['content-type'] = 'application/json'
    if (this.token) headers.authorization = `Bearer ${this.token}`
    const response = await this.fetchImpl(joinUrl(this.baseUrl, pathname), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    })
    const text = await response.text()
    let parsed
    try { parsed = JSON.parse(text) } catch { parsed = { raw: text } }
    if (!response.ok || parsed?.success === false) {
      throw new Error(`xiaohongshu sidecar ${method} ${pathname} failed (${response.status}): ${parsed?.code ?? parsed?.error ?? 'unknown'}`)
    }
    return parsed
  }

  async doctor({ liveLoginCheck = false } = {}) {
    const health = await this.request('/health', { timeoutMs: 5_000 })
    if (!liveLoginCheck) return { ready: true, health: unwrapData(health), login: 'not_checked' }
    const login = unwrapData(await this.request('/api/v1/login/status'))
    return { ready: login?.is_logged_in === true, health: unwrapData(health), login }
  }

  async baseline() {
    const response = await this.request('/api/v1/user/me?tab=note')
    const feeds = findFeeds(response)
    return {
      feedIds: feeds.map((feed) => feed.id).filter(Boolean),
      observedAt: new Date().toISOString(),
    }
  }

  async submit(revision, { baseline }) {
    if (revision.visibility !== 'private') throw new Error('XHS browser adapter currently permits private visibility only')
    const content = revision.content
    const isVideo = content.media.length === 1 && content.media[0]?.kind === 'video'
    const endpoint = isVideo ? '/api/v1/publish_video' : '/api/v1/publish'
    const common = {
      title: content.title,
      content: content.body,
      tags: content.topics ?? [],
      visibility: PRIVATE_VISIBILITY,
    }
    const payload = isVideo
      ? { ...common, video: content.media[0].path }
      : { ...common, images: content.media.map((item) => item.path) }
    const response = await this.request(endpoint, { method: 'POST', body: payload, timeoutMs: 10 * 60_000 })
    return {
      submitted: true,
      baseline,
      raw: unwrapData(response),
      evidenceRefs: [],
    }
  }

  async verify(revision, submission, { timeoutMs = 90_000, pollMs = 3_000 } = {}) {
    const baselineIds = new Set(submission.baseline?.feedIds ?? [])
    const deadline = Date.now() + timeoutMs
    const checks = []
    while (Date.now() < deadline) {
      const profile = await this.request('/api/v1/user/me?tab=note')
      const candidate = findFeeds(profile).find((feed) => !baselineIds.has(feed.id) && feedTitle(feed) === revision.content.title)
      if (candidate?.id && candidate?.xsecToken) {
        const detail = await this.request('/api/v1/feeds/detail', {
          method: 'POST',
          body: { feed_id: candidate.id, xsec_token: candidate.xsecToken, load_all_comments: false },
        })
        const expectedCount = revision.content.media.length
        const actualCount = mediaCount(detail)
        const expectedMarker = revision.content.verifyMarker ?? ''
        const actualBody = noteBody(detail)
        checks.push(
          { name: 'new_creator_record', result: 'pass' },
          { name: 'exact_title', result: 'pass' },
          { name: 'media_count', result: actualCount === expectedCount ? 'pass' : 'fail', expected: expectedCount, actual: actualCount },
          { name: 'body_marker', result: !expectedMarker || actualBody.includes(expectedMarker) ? 'pass' : 'fail' },
        )
        const confirmed = checks.every((check) => check.result === 'pass')
        return {
          confirmed,
          checks,
          platformObject: confirmed ? {
            id: candidate.id,
            url: `https://www.xiaohongshu.com/explore/${candidate.id}?xsec_token=${encodeURIComponent(candidate.xsecToken)}`,
          } : null,
        }
      }
      await new Promise((resolve) => setTimeout(resolve, pollMs))
    }
    return {
      confirmed: false,
      checks: [{ name: 'new_creator_record', result: 'unknown', detail: 'no exact new feed before timeout' }],
      platformObject: null,
    }
  }
}

export const xhsInternals = { findFeeds, feedTitle, mediaCount, noteBody, unwrapData }
