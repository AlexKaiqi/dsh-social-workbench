# PostHog Product Analytics Platform Pack 设计

状态：`researched` 设计候选；未发布、未调用 API、未读取任何 PostHog 数据  
核验日期：2026-08-26  
Pack ref：`posthog-owned-product-usage/v0-design`

## 1. 定位与边界

本 Pack 只研究组织拥有并明确授权的 PostHog project 中，经过版本化埋点定义和最小字段投影后的产品使用聚合。它回答“哪些已定义行为被观察到、用户/组如何经过 funnel、是否在固定口径下返回”，不回答“用户是否满意、为何流失、是否感到痛、产品是否产生因果价值”。

默认路线是 bounded aggregate query；raw event/person/session replay、URL/IP/ad identifier、LLM trace、survey response、feature flag 与 experiment mutation、CDP destination 和任意 SQL/MCP 操作均不在默认 allowlist。

```text
platform             PostHog Product Analytics
surface              owned project; region and project are exact boundaries
state                researched
verified level       evidence-review design only
callable routes      none
external effects     none
```

## 2. Platform Concepts

| Concept ID | Kind | 身份候选 | 必须保留的语义 |
| --- | --- | --- | --- |
| `posthog.project/v1` | tenant/surface | region + project ID | US/EU/private host、organization/project 和授权范围不可混用 |
| `posthog.event/v1` | observed behavior | project + event UUID/native tuple | event、properties、distinct ID、client timestamp、server `created_at` 分开 |
| `posthog.event-definition/v1` | taxonomy | project + event name/definition ID | visible/verified/hidden 是管理状态；hidden 不代表数据已删除 |
| `posthog.person/v1` | mutable identity profile | project + person/distinct IDs | anonymous/identified、alias/merge、duplicate profile 和 property history影响人数 |
| `posthog.group/v1` | group identity | project + group type + key | organization/account 等 group unit 与 person unit不能替换 |
| `posthog.action/v1` | retroactive behavior definition | project + action ID + revision | 多个 event/URL/selector/filter 组成；修改后可重解释历史 |
| `posthog.insight-query/v1` | analysis definition/result | project + query/insight + definition revision | event/filters/unit/window/timezone/query kind 和 result state一起固定 |
| `posthog.funnel/v1` | behavioral analysis | insight definition revision | sequential/strict/any-order、step filters、overall/previous-step denominator |
| `posthog.retention/v1` | behavioral analysis | insight definition revision | first-time/first-ever/recurring、period 0/reference、weighted/simple、current-period completeness |
| `posthog.batch-export/v1` | configured export route | project + export ID | destination/config/schedule/status；创建或改变它是写操作 |
| `posthog.deletion/v1` | privacy lifecycle | project + deletion scope/job | person、events、recordings的删除范围和异步完成状态 |

### 2.1 不能压平的语义

- event `timestamp` 是应用声明的发生时间，`created_at` 是 PostHog 接收/处理时间；迟到、离线和错误客户端时钟必须保留：[Events](https://posthog.com/docs/data/events)。
- 去重依赖相同 UUID、event、timestamp、distinct ID，且最终执行；一次 query 未见重复不证明 ingest 唯一。
- anonymous → identified、alias/merge 与错误 distinct ID 会产生重复 person，进而抬高 cohort、unique user 和 funnel 分母：[Persons](https://posthog.com/docs/data/persons)。
- Action 会把多个底层事件按规则 retroactive 组合；definition revision 变化后，同一历史时间窗可得到不同结果：[Actions](https://posthog.com/docs/data/actions)。
- Retention 只表示定义的 return event 被再次观察到，不表示使用频率、付费延续或满意；当前周期可能尚未完整：[Retention](https://posthog.com/docs/product-analytics/retention)。
- capture 返回 HTTP 200 只表示请求被接受处理，不证明每个 event 有效、未超 quota 或最终可查询：[API overview](https://posthog.com/docs/api)。

## 3. Capability 与 adoption decision

| Capability | Subject → Result | Access | Adoption | 说明 |
| --- | --- | --- | --- | --- |
| `taxonomy.list.owned-product-events/v1` | project → reviewed event/action taxonomy | REST | `eligible-with-policy` | 只读定义、状态、revision；不展开 person/property values |
| `analytics.query.owned-behavior-aggregate/v1` | fixed definition + bounded window → aggregate cells | REST `/query` | `eligible-with-policy` | 适合交互/有界分析；不是 export，固定 50k 上限和 completeness |
| `analytics.read.owned-saved-insight/v1` | approved insight refs → definition/result | REST | `eligible-with-policy` | 必须读取实际 query definition，不能只信 chart title |
| `analytics.read.preconfigured-batch-export/v1` | existing export ref → status/authorized destination facts | REST/manual warehouse | `deferred` | 只消费已存在且另行授权的 export；本 Pack 不创建 destination |
| `analytics.export.raw-events-persons/v1` | project/window → raw events/persons | query/export | `rejected-default` | 过度身份化，且 `/query` 明确不是 bulk export surface |
| `analytics.read.session-replay-llm-trace/v1` | person/session → replay/trace | REST/MCP | `rejected` | 高隐私、可能含输入内容/secret，聚合需求研究无必要 |
| `analytics.query.agent-posthog/v1` | prompt → arbitrary query/tool result | hosted MCP | `deferred` | beta 且广泛 read/write；不能替代确定性 Connector contract |
| `analytics.write.flags-surveys-actions-cdp/v1` | instruction → platform mutation | API/MCP | `rejected` | 会改变实验、采集、用户体验或外部 destination |

本 Pack 不定义 Probe Skill。产品实验、flag rollout、survey 发布与通知工作流应属于独立的实验/主动研究系统，并有 assignment、exposure、consent、approval、stop rule 和真实副作用边界。

## 4. Access Methods

### 4.1 `posthog-analytics-rest/v1`

- mode：`official-api`；access class：`owned`；effect：`none/local-write`；
- host：US、EU 或 private instance 必须随 surface 固定，不能从一个 region fallback 到另一个；
- auth：优先 project-scoped、最小 read scope personal key/OAuth grant；project secret key仍处于受限/演进状态，不作为 baseline。credential 只存 ref：[Personal API keys](https://posthog.com/docs/api/personal-api-keys)、[OAuth](https://posthog.com/docs/api/oauth)；
- query：仅执行 schema-fixed、field-minimized、bounded query；默认 100 rows、最大 50,000。`/query` 的 2,400/hour 单独预算，analytics endpoints 240/min、1,200/hour，响应/错误用于退避而非换 key 绕过；
- pagination/export：官方明确 `/query` 不是 supported export path，OFFSET 不支持 programmatic pagination。批量/周期导出必须使用预先配置的 Batch Export 或受授权 warehouse，并把 destination coverage 另建模：[Queries](https://posthog.com/docs/api/queries)、[Batch exports](https://posthog.com/docs/api/batch-exports)；
- expensive recurring aggregate：可引用由数据团队预先批准的 materialized view；Connector 不创建 view、SQL definition 或 persistent insight。

### 4.2 `posthog-authorized-export/v1`

只有用户已经配置并单独授权的 Batch Export、warehouse view 或 manual export 可进入候选。Receipt 必须包含 project/region、export/view revision、destination、schedule、time field、watermark、schema、filters、omissions、rights 和 deletion policy。本 Pack 不创建、暂停、更新 destination，也不把 destination 成功等同于源数据完整。

### 4.3 `posthog-mcp/v1`

官方 hosted MCP 仍为 beta，tool surface 包括查询、SQL、flags、surveys、CDP 和其他读写能力；即使 `tools` query parameter 可以过滤工具，仍需验证实际 OAuth scope、tool inventory、字段最小化、分页/coverage、prompt injection 和 drift：[MCP](https://posthog.com/docs/model-context-protocol)、[MCP tools](https://posthog.com/docs/model-context-protocol/tools)。当前仅保留为 discovery/diagnose 候选，不成为 callable route。

## 5. Platform Skills

### `posthog-product-analytics-pack-research/v1`

- purpose：`research/curate`；核验 ontology、query/export/auth/limits/privacy/terms、MCP、官方方法论 skill 和固定开源 artifacts；
- 只生成 evidence-bound proposal；禁止创建 key、query/view/action、batch export、flag、survey、workflow 或 MCP connection。

### `posthog-owned-product-usage/v1`

- purpose：`acquire`；输入固定 Pack/snapshot、project/region roster、approved definition refs、window、taxonomy/instrumentation/identity/DataHandling/coverage policy；
- allowlist：event/action taxonomy、approved saved insight definition、bounded aggregate query；
- 输出 aggregate Observation、`BehavioralDatasetMetadata`、CoverageAssessment、instrumentation health evidence 和最小 projection；
- 禁止 raw event/person/replay/URL/IP/property expansion、任意 SQL、创建 materialized view、MCP fallback 或 platform write。

### `posthog-product-analytics-conformance/v1`

- purpose：`verify/diagnose`；fixture 默认无网络；
- 验证 event/created time、dedupe、identity merge、action revision、funnel/retention definition、incomplete period、query limits、field minimization、coverage 和 forbidden tools；
- sandbox live 只在用户另行授权的 synthetic project、read-only credential、固定 event schema 下执行。

本 Pack 不复用会创建 LLM eval、Slack workflow、flag、survey、dashboard、view 或其他 persistent object 的操作型 Skill。

## 6. Projection、数据治理与证据强度

`owned-product-usage-analysis` projection 必须包含：project/region/Pack revision、analysis kind、definition/taxonomy/instrumentation refs、event/action criteria、property filter ref、person/group counting unit、identity policy、sequence order、window/interval/time basis/timezone、numerator/denominator、cohort/completeness rule、aggregate state、coverage 和 lineage。

- 默认只保留聚合 cell；distinct ID/person ID、email/name、URL/path/query、referrer、IP、geo、UTM/ad IDs、session replay、survey free text、LLM trace、arbitrary properties均 drop/restrict/quarantine。PostHog 默认采集字段很多，需按 reviewed schema allowlist，而不是 denylist：[Data storage and privacy](https://posthog.com/docs/privacy/data-storage)。
- `observed-usage` 仅表示在固定埋点/identity/analysis definition 下观察到行为。Funnel drop-off 是“未在窗口内观察到下一事件”，不是 complaint；retention 是 repeat event，不是 billing `retention-outcome`；activation 是需经留存相关性和业务 review 的派生候选，不是原始事实。
- “没有事件”可能来自未使用，也可能来自 SDK/网络/ingest/SDK sampling/quota/hidden event/identity split/timezone/late data/filter/TTL/部分周期；instrumentation health不达标时只输出 unknown/coverage degradation。
- 删除、alias/merge correction、action/taxonomy revision和 source TTL变化必须撤销或 supersede derived projection/index；不能用旧 chart snapshot继续声称当前定义。
- 用户必须拥有 Customer Data 的权利、告知与同意，并遵守当期服务条款；Pack 只记录待审依据，不替代法律意见：[PostHog Terms](https://posthog.com/terms)。

## 7. 开源与 Agent Artifact 候选

以下 revision 于 2026-08-26 通过只读固定；未 clone、安装或执行：

| Artifact / revision | Ownership / License | 价值 | 决策 |
| --- | --- | --- | --- |
| [PostHog/posthog](https://github.com/PostHog/posthog/tree/1a153a4c331d07c1204b48dc34d2a03bd9ed53fb) `1a153a4...` | PostHog 官方；root MIT/Expat，`ee/` 独立许可 | 当前 API/query/MCP/schema实现和 regression evidence | `official-reference`；复用前按 exact path 审计 license，不能把 monorepo当 Connector |
| [PostHog/mcp](https://github.com/PostHog/mcp/tree/13aaf2c6e5317e01e61d3af24e7b0744f527ed3e) `13aaf2c...` | PostHog 官方；MIT；2026-01-19 archived | 旧 MCP tool/transport历史 | `negative-fixture/stale`；已迁入 monorepo，不作为 current server |
| [PostHog/ai-plugin](https://github.com/PostHog/ai-plugin/tree/b708fd5c82e37fc12ed4b80045407119dafe8aaa) `b708fd5...` | PostHog 官方；README 声称 MIT，但固定 revision 无 LICENSE/COPYING 文件 | usage/activation metric 方法论、semantic layer checks | `methodology-only/license-blocked`；不安装，操作型 skills含SQL/view/flag/workflow写入 |
| [Airbyte PostHog source](https://github.com/airbytehq/airbyte/tree/1339a9ecca6f8fb547ffb7b19665d6980c069026/airbyte-integrations/connectors/source-posthog) `1339a9e...` / 1.1.25 | Airbyte；ELv2 path；community beta | persons/events/cohorts/flags streams与旧 pagination assumptions | `negative-fixture/reference-only`；旧 host、offset/raw-person路线与当前官方 query/export边界不符 |

`modeling-product-usage-metrics` 与 `modeling-activation-metrics` 提供有价值的方法论：固定事件、unit、interval、first/recurring、用留存验证 activation。但这些建议只能转写为版本化定义与 fixture，不能携带其 SQL/view creation 副作用。`feature-usage-feed` 会读取 replay/trace并创建外部 workflow，明确拒绝。

## 8. Verification Plan

### evidence-review / static-contract

- region/project、concept identity、definition/taxonomy/instrumentation/identity refs和 schema fixed；
- `/query`、saved insight、Batch Export、warehouse、MCP表示法互不冒充；
- aggregate-first、field allowlist、read-only scopes、50k/query/rate budget和 coverage固定；
- person/raw/replay/SQL/view/flag/survey/CDP/write capability静态拒绝；
- `observed-usage` 与 activation/value/pain/billing retention保持推断隔离。

### fixture-conformance

| Fixture | 必须证明 |
| --- | --- |
| client timestamp late vs `created_at` | event/server time分开；checkpoint与analysis basis明确 |
| duplicate UUID/event tuple | eventual dedupe不制造exactly-once claim；重跑幂等 |
| anonymous then identified / split IDs | identity revision影响unique count；旧result不可无声比较 |
| action definition changes | 新definition ref；历史结果不覆盖旧revision |
| sequential/strict/any-order funnel | order和denominator固定，不能同名chart混用 |
| first-time/first-ever/recurring retention | occurrence/reference/period 0固定；不映射billing retention |
| current interval incomplete | provisional/incomplete和denominator规则显式 |
| tracking SDK outage/no event | 降级为unknown coverage，不标non-use或pain |
| capture 200 but quota limited/invalid | 不把HTTP接受当ingested proof |
| 50k result / OFFSET attempt | 标truncated或拒绝；不把`/query`循环成export |
| URL/IP/ad/person property appears | drop/quarantine；不进入model/index/log fixture |
| hidden event/action | hidden不是删除；definition仍有lineage和policy |
| TTL/deletion/identity correction | 派生结果撤销/supersede，保留最小receipt |
| MCP/tool attempts write or arbitrary SQL | static/policy gate拒绝，零platform-write |

### sandbox-live / operational-canary

经用户另行授权后，只在 synthetic project 发送由独立测试管理员准备的固定 events，Connector 只读。Canary 监测 API/tool/schema drift、query latency/rate/row cap、event-to-created lag、duplicate/identity-split ratio、event/action definition drift、instrumentation health、partial-period exposure、Batch Export lag、PII quarantine、deletion propagation、correction backlog 和零平台写入不变量。

## 9. 晋级缺口

进入 `modeled` 需要 accepted concepts/capabilities/access/adoption snapshots、project roster、analysis-definition registry、native schemas、DataHandling/Behavioral/Coverage policy；进入 `verified` 需要 fixture report，并经用户授权完成 synthetic read-only sandbox report。当前没有 Connector、credential、MCP、Batch Export、live data、persistent PostHog object 或 callable route。
