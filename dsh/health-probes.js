import { constants as fsConstants } from 'node:fs'
import { access, stat } from 'node:fs/promises'
import path from 'node:path'

function condition(type, status, reason, message, observedAt, remedy = null, evidenceRefs = []) {
  return { type, status, reason, message, observedAt, evidenceRefs, remedy }
}

async function exists(candidate, mode = fsConstants.F_OK) {
  try {
    await access(candidate, mode)
    return true
  } catch {
    return false
  }
}

async function nonEmptyFile(candidate) {
  try {
    return (await stat(candidate)).isFile() && (await stat(candidate)).size > 0
  } catch {
    return false
  }
}

export function createStoreProbe(root) {
  return async ({ observedAt }) => {
    const writable = await exists(root, fsConstants.R_OK | fsConstants.W_OK)
    return {
      state: writable ? 'ready' : 'blocked',
      summary: writable ? '事实存储可读写。' : '事实存储不可读写。',
      observedAt,
      conditions: [condition(
        'StoreWritable',
        writable ? 'true' : 'false',
        writable ? 'AccessGranted' : 'AccessDenied',
        writable ? '运行时状态根可读写。' : '运行时状态根不存在或权限不足。',
        observedAt,
        writable ? null : '检查工作台 root 配置与目录权限。',
      )],
    }
  }
}

export function createStaticProbe({ state = 'ready', summary, conditions = [] }) {
  return async ({ observedAt }) => ({
    state,
    summary,
    observedAt,
    conditions: conditions.map(item => ({ ...item, observedAt, evidenceRefs: item.evidenceRefs ?? [], remedy: item.remedy ?? null })),
  })
}

export function createXiaohongshuProbe({
  baseUrl = 'http://127.0.0.1:18060',
  token = process.env.DSH_SOCIAL_XHS_TOKEN,
  fetchImpl = fetch,
  healthTimeoutMs = 3_000,
  loginTimeoutMs = 30_000,
} = {}) {
  const headers = token ? { authorization: `Bearer ${token}` } : {}
  const request = async (pathname, timeoutMs) => {
    const response = await fetchImpl(new URL(pathname, baseUrl), {
      headers,
      signal: AbortSignal.timeout(timeoutMs),
    })
    let body = null
    try { body = await response.json() } catch {}
    return { ok: response.ok, status: response.status, body }
  }
  return async ({ observedAt }) => {
    try {
      const health = await request('/health', healthTimeoutMs)
      if (!health.ok) throw new Error(`sidecar health returned HTTP ${health.status}`)
    } catch (error) {
      return {
        state: 'blocked',
        summary: '小红书 sidecar 当前不可达。',
        observedAt,
        conditions: [condition('SidecarReachable', 'false', 'ConnectionFailed', error instanceof Error ? error.message : String(error), observedAt, '以可见模式启动本机 xiaohongshu-mcp sidecar。')],
      }
    }

    let login
    try {
      login = await request('/api/v1/login/status', loginTimeoutMs)
    } catch (error) {
      return {
        state: 'unknown',
        summary: 'sidecar 可达，但登录态探测未完成。',
        observedAt,
        conditions: [
          condition('SidecarReachable', 'true', 'HealthPassed', 'sidecar 健康接口可达。', observedAt),
          condition('LoginValid', 'unknown', 'LoginProbeFailed', error instanceof Error ? error.message : String(error), observedAt, '检查本机 sidecar token、可见浏览器窗口和 sidecar 日志后刷新。'),
        ],
      }
    }
    if (!login.ok) {
      const authRequired = login.status === 401
      return {
        state: 'unknown',
        summary: authRequired ? 'sidecar 可达，但工作台没有获准读取登录状态。' : 'sidecar 可达，但登录态接口异常。',
        observedAt,
        conditions: [
          condition('SidecarReachable', 'true', 'HealthPassed', 'sidecar 健康接口可达。', observedAt),
          condition('LoginValid', 'unknown', authRequired ? 'SidecarTokenRequired' : 'LoginProbeFailed', `登录态接口返回 HTTP ${login.status}。`, observedAt, authRequired ? '通过本机 Credentials 或环境变量向 Host 提供 sidecar token。' : '查看 sidecar 日志后刷新。'),
        ],
      }
    }
    const loggedIn = Boolean(login.body?.data?.is_logged_in)
    return {
      state: loggedIn ? 'degraded' : 'blocked',
      summary: loggedIn ? '登录有效；本人主页 verifier 需要可见浏览器模式。' : 'sidecar 可达，但账号尚未登录。',
      observedAt,
      conditions: [
        condition('SidecarReachable', 'true', 'HealthPassed', 'sidecar 健康接口可达。', observedAt),
        condition('LoginValid', loggedIn ? 'true' : 'false', loggedIn ? 'Authenticated' : 'LoginRequired', loggedIn ? '本机登录态有效。' : '没有有效的小红书登录态。', observedAt, loggedIn ? null : '运行可见登录工具并由用户扫码。'),
        condition('HeadlessCompatible', 'false', 'VisibleBrowserRequired', '固定 sidecar 在本机无头模式下无法稳定读取本人主页基线。', observedAt, '发布闭环使用 -headless=false；不要跳过基线和反查。', ['docs/DUAL_PLATFORM_RUNBOOK.md#10-本次实测证据']),
      ],
    }
  }
}

export function createDouyinProbe({ sidecarRoot, account = 'default' }) {
  return async ({ observedAt }) => {
    const python = path.join(sidecarRoot, 'broadcast-kit-venv', 'bin', 'python')
    const source = path.join(sidecarRoot, 'src', 'broadcast-kit', 'broadcast_kit', 'publishers', 'douyin', 'cli.py')
    const auth = path.join(sidecarRoot, 'state', 'douyin', account, 'auth.json')
    const [pythonReady, sourceReady, authPresent] = await Promise.all([
      exists(python, fsConstants.X_OK),
      exists(source, fsConstants.R_OK),
      nonEmptyFile(auth),
    ])
    const installed = pythonReady && sourceReady
    if (!installed) {
      return {
        state: 'blocked',
        summary: '抖音 sidecar 组件尚未完整安装。',
        observedAt,
        conditions: [condition('RuntimeInstalled', 'false', 'RuntimeMissing', 'Python 环境或固定 broadcast-kit 源码缺失。', observedAt, '运行 npm run bootstrap:sidecars。')],
      }
    }
    return {
      state: authPresent ? 'unknown' : 'blocked',
      summary: authPresent ? '运行时和登录文件存在；需要 live doctor 验证时效。' : '运行时已安装，但抖音账号尚未登录。',
      observedAt,
      conditions: [
        condition('RuntimeInstalled', 'true', 'RuntimeReady', '固定 broadcast-kit 与隔离 Python 环境已安装。', observedAt),
        condition('AuthStatePresent', authPresent ? 'true' : 'false', authPresent ? 'AuthFilePresent' : 'LoginRequired', authPresent ? '本机账号状态文件存在，但未读取其内容。' : '没有发现账号状态文件。', observedAt, authPresent ? '在用户侧运行 live doctor 验证登录有效期。' : '运行可见登录流程并由用户扫码或验证。'),
        condition('LoginValid', 'unknown', 'LiveProbeRequired', 'Host 被动探测不会执行浏览器登录验证。', observedAt, '在用户边界运行 doctor douyin --live-login-check。'),
      ],
    }
  }
}

export function createDouyinResearchProbe({ sidecarRoot, account = 'default' }) {
  return async ({ observedAt }) => {
    const source = path.join(sidecarRoot, 'src', 'MediaCrawler')
    const python = path.join(source, '.venv', 'bin', 'python')
    const entry = path.join(source, 'main.py')
    const profile = path.join(sidecarRoot, 'state', 'douyin-research', 'browser-profiles', account, 'dy_user_data_dir')
    const [pythonReady, sourceReady, profilePresent] = await Promise.all([
      exists(python, fsConstants.X_OK),
      exists(entry, fsConstants.R_OK),
      exists(profile, fsConstants.R_OK),
    ])
    const installed = pythonReady && sourceReady
    if (!installed) {
      return {
        state: 'blocked',
        summary: '抖音研究 sidecar 尚未显式安装。',
        observedAt,
        conditions: [condition('RuntimeInstalled', 'false', 'OptionalRuntimeMissing', '固定 MediaCrawler 源码或隔离 Python 环境缺失。', observedAt, '审阅受限许可证后运行 npm run bootstrap:douyin-research -- --accept-mediacrawler-license。')],
      }
    }
    return {
      state: profilePresent ? 'degraded' : 'blocked',
      summary: profilePresent ? '研究运行时和独立登录目录存在；登录有效性需由用户侧搜索验证。' : '研究运行时已安装，尚未建立独立登录态。',
      observedAt,
      conditions: [
        condition('RuntimeInstalled', 'true', 'PinnedRuntimeReady', '固定 MediaCrawler 与隔离 Python 环境已安装。', observedAt),
        condition('BrowserProfileIsolated', 'true', 'DedicatedProfile', '研究登录态使用独立 Playwright profile，不连接日常 Chrome。', observedAt),
        condition('LoginValid', profilePresent ? 'unknown' : 'false', profilePresent ? 'LiveProbeRequired' : 'LoginRequired', profilePresent ? '登录目录存在，但 Host 不读取 Cookie，也不执行平台请求。' : '没有发现研究账号的浏览器 profile。', observedAt, profilePresent ? '用户侧运行 research douyin search；失效时会重新显示二维码。' : '用户侧运行 research douyin login 并扫码。'),
        condition('OfficialApi', 'false', 'UnofficialPrivateApi', '搜索和评论来自登录浏览器上下文中的非官方接口，不得标记为官方或完整样本。', observedAt),
      ],
    }
  }
}
