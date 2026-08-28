# 自有产品可靠性与错误遥测候选分流（2026-08-26）

状态：`researched / design-only / no-callable-route`

## 1. 为什么是独立信号

客服、评论和监管投诉都要求人主动表达问题；产品可靠性遥测能发现用户来不及、不会或不愿报告的崩溃、ANR、异常和版本回归。它证明“被配置的遥测系统观察到某类失败”，不证明用户痛点原话、根因、业务损失、市场规模或所有真实失败。

因此不能把 error event 当普通行为事件，也不能把 provider issue 当一位用户或一个代码缺陷。首轮抽象必须分开：instrumentation definition、provider grouping、issue variant、occurrence event、release/environment、triage lifecycle、provider signal、aggregate/session denominator、sampling/filtering和restricted diagnostics。

## 2. 候选比较

| 候选 | 价值 | 官方读取面 | 主要风险 | 决策 |
| --- | --- | --- | --- | --- |
| Sentry | Web/backend/mobile 的 issue、event、release、environment、release health 和 regression | Web API v0：organization issues、issue events、releases、sessions/Explore；`event:read`/`project:read`/`org:read`按能力拆分 | issue是算法分组；默认query只取unresolved；full event含stacktrace、user、request、breadcrumb等；Explore不是full export且可能sampling/extrapolation | 首个 Platform Pack；`fixture-eligible / privacy+grouping-gated / no route` |
| Firebase Crashlytics | 移动端/Web的fatal、non-fatal、ANR、issue signals、reports、event与release/session稳定性 | `v1alpha` issue/event/report API；BigQuery batch/streaming export；官方 MCP | v1alpha；API read与issue/note mutation同表面；90天窗口/保留、BigQuery延迟/回填/费用；custom keys/logs/user ID/stacktrace高敏 | 第二成员 Pack；`fixture-eligible / alpha+privacy-gated / no route` |
| Datadog RUM/Error Tracking | 浏览器/移动 RUM error、session和后端/APM关联 | RUM v2 search/list/aggregate API | RUM event、log、APM error grouping与session replay边界更宽；本轮未固定Error Tracking独立issue合同、sampling和retention组合 | `research-backlog`；不进入首版 Channel 分母 |

首版 Channel requested=2、fixture-eligible=2、callable=0。Datadog仍是候选池，不把“有RUM API”写成已建模的error issue能力。

## 3. 第一性边界

- issue/group 是 provider grouping projection；分组算法、fingerprint和merge/split变化会改变计数，不能当稳定缺陷身份；
- occurrence/event 是被SDK、sampling、inbound filter和上报时机共同选择的观测，不是所有真实错误；
- affected users、installations、devices和sessions是不同counting unit；匿名/哈希ID仍可能是个人数据；
- resolved/muted/archived/acknowledged是triage状态，不证明代码修复、部署成功或用户恢复；
- regressed/escalating/early/repetitive是provider-derived signal，不是独立事实或严重度；
- release/version/environment必须来自exact native binding；相似字符串不跨项目/成员合并；
- crash-free rate只有在session definition、numerator、denominator、window、sampling和completeness兼容时才可解释；
- stacktrace、exception message、breadcrumbs、logs、request、locals、source context、attachments、replays、custom keys和tags默认restricted；
- 生产 synthetic crash、SDK/PII scrubber配置、issue状态、note、alert、release和数据删除都是平台/产品效果，不属于只读需求研究。

## 4. Agent Skills、MCP 与开源候选

### Sentry

- [getsentry/sentry-api-schema](https://github.com/getsentry/sentry-api-schema/tree/022cd04e649b493057f510207d4ad4690aec6bd7) 固定 `022cd04e649b493057f510207d4ad4690aec6bd7`。它是官方生成的 TypeScript client/schema，包含cursor wrapper和可选runtime validator，适合作schema/fixture参考；许可证是 FSL-1.1-Apache-2.0 Future License，不能直接假定为无条件Apache复用。
- [getsentry/sentry-for-ai](https://github.com/getsentry/sentry-for-ai/tree/c1aab39520fc1f28ba23e969a2d6b74a87088038) 固定 `c1aab39520fc1f28ba23e969a2d6b74a87088038`，MIT；是Sentry官方Skills事实源，覆盖instrument、debug issue、alert和代码修复。
- [getsentry/plugin-codex](https://github.com/getsentry/plugin-codex/tree/1f076eb1d71fa0ec2d761e7d5c9d315068b09e32) 固定 `1f076eb1d71fa0ec2d761e7d5c9d315068b09e32`，MIT；是生成的Codex分发包，并接入 hosted Sentry MCP。
- [Sentry MCP](https://mcp.sentry.dev/)通过OAuth连接，可搜索、分析、triage并管理project；即使按project scope，也没有本系统的definition revision、pre-persistence field gate、append-first snapshot和zero-write保证，故只作能力/Skill研究，不进入Connector route。

### Firebase Crashlytics

- [firebase/firebase-tools](https://github.com/firebase/firebase-tools/tree/5c167cb0c3186ab11a68bd6bda407530317f649b) 固定 `5c167cb0c3186ab11a68bd6bda407530317f649b`，package `15.28.1`、MIT；包含官方Firebase MCP。
- 官方 MCP 同时提供issue/event/report读取和create/delete note、update issue等写能力；本Channel只允许拆出的read contract。
- 官方仓库问题 [#9663](https://github.com/firebase/firebase-tools/issues/9663) 与 [#10211](https://github.com/firebase/firebase-tools/issues/10211) 分别记录大数据集tool discovery内存/延迟问题和Flutter自动发现问题；它们是operational risk evidence，不替代官方API合同，也不证明当前revision仍复现。

本轮只读取官方文档、GitHub页面、raw许可证/README并用`git ls-remote`固定revision；未clone、安装、构建、执行或连接任何SDK、MCP、CLI。

## 5. 下一步

1. 用合成 fixtures 验证 issue/group/event、release/environment、state/signal、sampling/filtering、aggregate denominator和PII gate；
2. Sentry先以issue-summary最小表面建模，full event和Explore分别治理；
3. Crashlytics分别验证v1alpha reports/API与BigQuery export，不互相声明完整；
4. 至少一个成员fixture conformance通过后，Channel才进入`modeled-partial`；
5. 任何sandbox、真实project/app、event body、MCP/Skill或production test crash需用户另行授权。

