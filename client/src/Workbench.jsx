import React, { useEffect, useMemo, useState } from 'react'

const STATE_ZH = { ready: '正常', degraded: '受限', blocked: '阻塞', unknown: '未知', 'not-applicable': '未实现' }
const LIFE_ZH = { available: '已具备', partial: '部分具备', planned: '规划中' }

function callOrThrow(rpcCall, endpoint) {
  return rpcCall(endpoint, {}).then(response => {
    if (!response?.ok) throw new Error(response?.error?.message ?? 'RPC failed')
    return response.value
  })
}

function StateBadge({ state, children }) {
  return <span className="sw-state" data-state={state}>{children ?? STATE_ZH[state] ?? state}</span>
}

function countOf(counts, key) {
  return Number.isFinite(counts?.[key]) ? counts[key] : 0
}

function pipelineStages(snapshot) {
  const counts = snapshot.activity.counts
  const sourceCount = countOf(counts, 'sources')
  const briefCount = countOf(counts, 'briefs')
  const packageCount = countOf(counts, 'packages')
  const revisionCount = countOf(counts, 'revisions')
  const receiptCount = countOf(counts, 'receipts')
  return [
    { id: 'sources', index: '01', title: 'Sources', subtitle: '证据与授权素材', value: sourceCount, state: sourceCount > 0 ? 'active' : 'empty' },
    { id: 'signals', index: '02', title: 'Signals', subtitle: '需求假设与反证', value: null, state: 'planned' },
    { id: 'content', index: '03', title: 'Content', subtitle: 'Brief、平台包与冻结版本', value: briefCount + packageCount + revisionCount, detail: `${briefCount} brief · ${packageCount} package · ${revisionCount} revision`, state: revisionCount > 0 ? 'active' : packageCount > 0 ? 'partial' : 'empty' },
    { id: 'publishing', index: '04', title: 'Publishing', subtitle: '批准、执行与回执', value: receiptCount, state: receiptCount > 0 ? 'active' : 'waiting' },
    { id: 'learning', index: '05', title: 'Learning', subtitle: '指标、结论与下一轮', value: null, state: 'planned' },
  ]
}

function deriveNextStep(snapshot) {
  const counts = snapshot.activity.counts
  if (countOf(counts, 'sources') === 0) return { eyebrow: 'NEXT · INGRESS', title: '添加一条有授权说明的真实来源', detail: '先建立证据与权利边界，再开始分析和生产。' }
  if (countOf(counts, 'briefs') === 0) return { eyebrow: 'NEXT · UNDERSTAND', title: '把来源整理成证据化 Brief', detail: '明确需求假设、支持证据和反证，而不是直接生成内容。' }
  if (countOf(counts, 'packages') === 0) return { eyebrow: 'NEXT · PRODUCE', title: '生成小红书与抖音独立内容包', detail: '平台变体共享证据，但不共享发布格式。' }
  if (countOf(counts, 'revisions') === 0) return { eyebrow: 'NEXT · FREEZE', title: '冻结待审核 revision', detail: '发布批准必须绑定不可变内容与媒体指纹。' }
  if (countOf(counts, 'receipts') === 0) return { eyebrow: 'NEXT · VERIFY', title: '完成双平台私密闭环验证', detail: '在 Browser Use 中登录与观察；提交前仍逐个平台确认。' }
  return { eyebrow: 'NEXT · LEARN', title: '读取表现数据并复盘假设', detail: '把结果回流为下一轮可证伪的需求判断。' }
}

function actionableItems(snapshot) {
  const rows = []
  for (const capability of snapshot.capabilities) {
    if (capability.lifecycle === 'planned') continue
    for (const condition of capability.health.conditions) {
      if (condition.status === 'true') continue
      rows.push({ id: `${capability.id}:${condition.type}`, title: capability.title.zh, message: condition.message, remedy: condition.remedy, state: capability.health.state })
    }
  }
  return rows.slice(0, 4)
}

function PlatformRow({ capability }) {
  if (!capability) return null
  const positive = capability.health.conditions.filter(item => item.status === 'true').length
  const total = capability.health.conditions.length
  const blocker = capability.health.conditions.find(item => item.status !== 'true')
  return (
    <article className="sw-platform" data-state={capability.health.state}>
      <div className="sw-platform-mark">{capability.id.endsWith('xiaohongshu') ? 'RED' : 'DY'}</div>
      <div className="sw-platform-copy">
        <div><b>{capability.title.zh}</b><StateBadge state={capability.health.state} /></div>
        <p>{capability.health.summary}</p>
        {blocker?.remedy && <small>{blocker.remedy}</small>}
      </div>
      <div className="sw-platform-score"><b>{positive}/{total || '–'}</b><span>conditions</span></div>
    </article>
  )
}

function Overview({ snapshot }) {
  const stages = pipelineStages(snapshot)
  const next = deriveNextStep(snapshot)
  const actions = actionableItems(snapshot)
  const xhs = snapshot.capabilities.find(item => item.id === 'publication.xiaohongshu')
  const douyin = snapshot.capabilities.find(item => item.id === 'publication.douyin')
  const counts = snapshot.activity.counts
  return (
    <>
      <section className="sw-focus-grid">
        <article className="sw-mission">
          <span className="sw-eyebrow">CURRENT LOOP · PRIVATE VALIDATION</span>
          <h2>打通小红书 / 抖音闭环</h2>
          <p>从一条真实来源出发，形成冻结内容版本，分别在两个平台完成私密执行和平台侧反查。</p>
          <div className="sw-mission-meta"><span>范围 · 双平台</span><span>模式 · 人机协作</span><span>提交 · 逐次确认</span></div>
        </article>
        <article className="sw-next">
          <span className="sw-eyebrow">{next.eyebrow}</span>
          <h3>{next.title}</h3>
          <p>{next.detail}</p>
          <div className="sw-browser-note"><i />浏览器在右侧 Browser Use 面板，与当前 Session 共享</div>
        </article>
      </section>

      <section className="sw-section">
        <header className="sw-section-head"><div><span>FLOW</span><h3>从证据到学习</h3></div><small>阶段是业务语义，不等同于某个脚本或 adapter</small></header>
        <div className="sw-pipeline">{stages.map((stage, index) => (
          <React.Fragment key={stage.id}>
            <article className="sw-stage" data-state={stage.state}>
              <header><span>{stage.index}</span><i /></header>
              <h4>{stage.title}</h4><p>{stage.subtitle}</p>
              {stage.value === null ? <b className="sw-stage-plan">NEXT</b> : <b className="sw-stage-value">{stage.value}</b>}
              {stage.detail && <small>{stage.detail}</small>}
            </article>
            {index < stages.length - 1 && <div className="sw-stage-arrow" aria-hidden="true">→</div>}
          </React.Fragment>
        ))}</div>
      </section>

      <section className="sw-lower-grid">
        <div className="sw-panel">
          <header className="sw-panel-head"><div><span>EXECUTION</span><h3>平台执行</h3></div><small>浏览器 / adapter / 回执</small></header>
          <div className="sw-platforms"><PlatformRow capability={xhs} /><PlatformRow capability={douyin} /></div>
        </div>
        <div className="sw-panel">
          <header className="sw-panel-head"><div><span>ATTENTION</span><h3>待处理</h3></div><b>{actions.length}</b></header>
          {actions.length === 0 ? <p className="sw-empty">当前没有需要处理的运行时异常。</p> : <ol className="sw-actions">{actions.map((item, index) => (
            <li key={item.id}><span>{String(index + 1).padStart(2, '0')}</span><div><b>{item.title}</b><p>{item.message}</p>{item.remedy && <small>{item.remedy}</small>}</div></li>
          ))}</ol>}
        </div>
      </section>

      <section className="sw-facts">
        <div><span>sources</span><b>{countOf(counts, 'sources')}</b></div>
        <div><span>briefs</span><b>{countOf(counts, 'briefs')}</b></div>
        <div><span>packages</span><b>{countOf(counts, 'packages')}</b></div>
        <div><span>revisions</span><b>{countOf(counts, 'revisions')}</b></div>
        <div><span>receipts</span><b>{countOf(counts, 'receipts')}</b></div>
        <p>这些是 canonical objects，不是“完成度”百分比。</p>
      </section>
    </>
  )
}

function SystemView({ snapshot }) {
  return (
    <section className="sw-system">
      <header className="sw-system-summary">
        <div><span>SYSTEM CONTROL PLANE</span><h2>能力与运行条件</h2><p>这里解释系统为什么可用或受阻；它不代表当前工作的先后顺序。</p></div>
        <div className="sw-health-counts"><b>{snapshot.summary.ready}<small>正常</small></b><b>{snapshot.summary.degraded}<small>受限</small></b><b>{snapshot.summary.blocked}<small>阻塞</small></b><b>{snapshot.summary.planned}<small>规划</small></b></div>
      </header>
      <div className="sw-capability-list">{snapshot.capabilities.map(capability => (
        <article key={capability.id} className="sw-capability-row" data-state={capability.health.state}>
          <div className="sw-capability-main"><span>{capability.area}</span><h3>{capability.title.zh}</h3><p>{capability.health.summary}</p></div>
          <div className="sw-capability-badges"><span>{LIFE_ZH[capability.lifecycle]}</span><StateBadge state={capability.health.state} /></div>
          <div className="sw-condition-list">{capability.health.conditions.length === 0 ? <small>尚无运行条件</small> : capability.health.conditions.map(condition => (
            <div key={`${capability.id}:${condition.type}`} data-status={condition.status}><i /><span><b>{condition.type}</b>{condition.message}</span></div>
          ))}</div>
        </article>
      ))}</div>
    </section>
  )
}

export function Workbench({ rpcCall, t }) {
  const [view, setView] = useState({ status: 'loading' })
  const [section, setSection] = useState('overview')
  const [refreshing, setRefreshing] = useState(false)
  const load = (endpoint = 'bootstrap') => {
    if (endpoint === 'bootstrap') setView({ status: 'loading' })
    else setRefreshing(true)
    callOrThrow(rpcCall, endpoint).then(
      snapshot => setView({ status: 'ready', snapshot }),
      error => setView(current => current.status === 'ready' ? { ...current, notice: error.message } : { status: 'error', error: error.message }),
    ).finally(() => setRefreshing(false))
  }
  useEffect(() => load(), [rpcCall])
  const generated = useMemo(() => view.status === 'ready' ? new Date(view.snapshot.generatedAt).toLocaleTimeString() : '', [view])

  if (view.status === 'loading') return <section className="sw-shell sw-centered"><p>{t('loading')}</p></section>
  if (view.status === 'error') return <section className="sw-shell sw-centered"><div className="sw-error"><p>{view.error}</p><button type="button" onClick={() => load()}>{t('retry')}</button></div></section>
  const { snapshot } = view
  return (
    <section className="sw-shell">
      <header className="sw-toolbar">
        <div className="sw-brand"><span>SW</span><div><b>{t('title')}</b><small>evidence → demand → content → publish → learn</small></div></div>
        <nav aria-label="Social Workbench views"><button type="button" data-active={section === 'overview'} onClick={() => setSection('overview')}>当前闭环</button><button type="button" data-active={section === 'system'} onClick={() => setSection('system')}>系统</button></nav>
        <div className="sw-toolbar-status"><StateBadge state={snapshot.overall}>系统 {STATE_ZH[snapshot.overall]}</StateBadge><small>{generated}</small><button type="button" disabled={refreshing} onClick={() => load('refresh-health')}>{refreshing ? t('refreshing') : t('refresh')}</button></div>
      </header>
      {view.notice && <p className="sw-notice">{view.notice}</p>}
      <main>{section === 'overview' ? <Overview snapshot={snapshot} /> : <SystemView snapshot={snapshot} />}</main>
      <footer className="sw-boundary"><b>AUTHORITY</b><span>工作台只读 · 浏览器登录由用户完成 · 上传与发布按 revision 单独确认</span><i>STAGING ONLY</i></footer>
    </section>
  )
}
