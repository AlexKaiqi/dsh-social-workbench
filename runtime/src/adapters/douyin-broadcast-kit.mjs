import { spawn } from 'node:child_process'

function run(command, args, { cwd, env, timeoutMs = 15 * 60_000 } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, ...env },
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let stdout = ''
    let stderr = ''
    const timer = setTimeout(() => {
      child.kill('SIGTERM')
      reject(new Error(`command timed out after ${timeoutMs}ms`))
    }, timeoutMs)
    child.stdout.on('data', (chunk) => { stdout += chunk })
    child.stderr.on('data', (chunk) => { stderr += chunk })
    child.on('error', (error) => { clearTimeout(timer); reject(error) })
    child.on('close', (code, signal) => {
      clearTimeout(timer)
      resolve({ code, signal, stdout, stderr })
    })
  })
}

export function parseDouyinReport(output) {
  const judgement = output.match(/JUDGEMENT:\s*([^\s]+)/i)?.[1]?.toLowerCase() ?? null
  const coverText = output.match(/COVER_VERIFY:\s*([^\s]+)/i)?.[1]?.toLowerCase() ?? null
  const queueText = output.match(/QUEUE_VERIFY:\s*([^\s]+)/i)?.[1]?.toLowerCase() ?? null
  const visibilityText = output.match(/VISIBILITY_VERIFY:\s*([^\s]+)/i)?.[1]?.toLowerCase() ?? null
  const evidenceRefs = [...output.matchAll(/file:\/\/\S+/g)].map((match) => match[0])
  return {
    judgement,
    coverVerified: coverText === 'true',
    queueVerified: queueText === 'true',
    visibilityVerified: visibilityText === 'true',
    evidenceRefs,
  }
}

export class DouyinBroadcastKitAdapter {
  constructor({ python = 'python3', cwd, stateDir, binaryDir, account = 'default', allowLivePrivate = false, runImpl = run } = {}) {
    this.python = python
    this.cwd = cwd
    this.stateDir = stateDir
    this.binaryDir = binaryDir
    this.account = account
    this.allowLivePrivate = allowLivePrivate
    this.runImpl = runImpl
  }

  environment() {
    const environment = this.stateDir ? { BROADCAST_KIT_STATE_DIR: this.stateDir } : {}
    if (this.binaryDir) environment.PATH = `${this.binaryDir}:${process.env.PATH ?? ''}`
    return environment
  }

  async doctor({ liveLoginCheck = false } = {}) {
    const args = ['-m', 'broadcast_kit.cli', 'doctor', '--account', this.account]
    if (liveLoginCheck) args.push('--live-login-check')
    const result = await this.runImpl(this.python, args, { cwd: this.cwd, env: this.environment(), timeoutMs: 120_000 })
    const output = `${result.stdout}\n${result.stderr}`.trim()
    let report = null
    try { report = JSON.parse(result.stdout) } catch {}
    const capabilityReady = report?.summary?.ok_for_douyin_existing_media === true
    const loginReady = liveLoginCheck ? report?.state?.douyin_login?.ok === true : null
    return {
      ready: result.code === 0 && capabilityReady && (!liveLoginCheck || loginReady),
      capabilityReady,
      loginReady,
      code: result.code,
      report,
      output: report ? undefined : output,
    }
  }

  async baseline() {
    return { observedAt: new Date().toISOString(), verifier: 'broadcast-kit.creator-queue' }
  }

  async submit(revision, { dryRun = false } = {}) {
    if (revision.visibility !== 'private') throw new Error('Douyin browser adapter currently permits private visibility only')
    if (!dryRun && !this.allowLivePrivate) {
      throw new Error('live Douyin publish is blocked until the pinned sidecar proves explicit private visibility selection')
    }
    const manifest = revision.execution?.manifest?.path
    const scheduleAt = revision.execution?.schedulePublishAt
    if (!manifest) throw new Error('Douyin revision requires a fingerprinted execution manifest')
    const args = [
      '-m', 'broadcast_kit.publishers.douyin.cli', 'publish',
      '--manifest', manifest,
      '--account', this.account,
      '--visibility', 'private',
      dryRun ? '--dry-run' : '--submit-publish',
    ]
    if (scheduleAt) args.push('--schedule-publish-at', scheduleAt)
    const result = await this.runImpl(this.python, args, { cwd: this.cwd, env: this.environment() })
    const report = parseDouyinReport(`${result.stdout}\n${result.stderr}`)
    return {
      submitted: !dryRun && report.judgement === 'success',
      dryRun,
      commandExitCode: result.code,
      report,
      evidenceRefs: report.evidenceRefs,
    }
  }

  async verify(_revision, submission) {
    const report = submission.report
    const checks = [
      { name: 'submit_judgement', result: report.judgement === 'success' ? 'pass' : 'fail', actual: report.judgement },
      { name: 'cover_verified', result: report.coverVerified ? 'pass' : 'fail' },
      { name: 'private_visibility_verified', result: report.visibilityVerified ? 'pass' : 'fail' },
      { name: 'creator_queue_verified', result: report.queueVerified ? 'pass' : 'fail' },
    ]
    const confirmed = submission.commandExitCode === 0 && checks.every((check) => check.result === 'pass')
    const queueEvidence = report.evidenceRefs.find((item) => /queue/i.test(item)) ?? report.evidenceRefs[0] ?? null
    return {
      confirmed,
      checks,
      platformObject: null,
      confirmationEvidence: report.evidenceRefs,
      confirmationBasis: confirmed && queueEvidence ? { kind: 'creator_queue_match', evidenceRef: queueEvidence } : null,
    }
  }
}
