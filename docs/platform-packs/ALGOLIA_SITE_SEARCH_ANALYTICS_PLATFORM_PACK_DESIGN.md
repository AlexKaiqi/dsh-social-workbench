# Algolia Site Search Analytics Platform Pack 设计

状态：`researched` 设计候选；未连接账号、未调用 API、未安装 Skill/MCP  
核验日期：2026-08-26  
Pack ref：`algolia-owned-site-search-analytics/v0-design`

## 1. 定位与边界

本 Pack 只读取用户有权访问的 Algolia application/index 的搜索分析：热门搜索、零结果、点击位置、点击率、转化和可选收入指标。它用于发现“用户在自有产品或站点内主动寻找什么”，不是外部搜索曝光、全市场关键词量、逐用户行为画像或搜索配置管理。

Algolia 的 top searches 中，`count` 是全部被 analytics 记录的搜索；只有启用 `clickAnalytics` 的请求才进入 tracked searches，并能通过 `queryID` 关联 click/conversion。[Top searches](https://www.algolia.com/doc/libraries/sdk/methods/analytics/get-top-searches) 还明确区分：无 query 时 rate 为 `null`，有 query 但没有事件时为 `0%`。这两个状态不得合并。

```text
platform             algolia
surface              owned application/index analytics
state                researched
verified level       evidence-review + static-contract only
callable routes      none
external effects     none
```

## 2. Platform Concepts

| Concept ID | Kind | 身份候选 | 稳定语义 |
| --- | --- | --- | --- |
| `algolia.application/v1` | entity | exact application ID + region | 权限、计费和 index 的管理边界；不可仅按名字合并 |
| `algolia.index/v1` | entity | application + exact index name | 搜索、analytics 与设置作用面；replica 不自动等同 primary |
| `algolia.search-request/v1` | event/aggregate input | index + provider query population | `analytics=false` 的请求不进入报告；空 query 可表示 browse/filter 页面 |
| `algolia.search-query/v1` | sensitive aggregate dimension | index + normalized provider query | query 原文可能含 PII、账号、秘密或健康文本 |
| `algolia.query-id/v1` | correlation token | provider `queryID` | 关联 search 与 click/conversion；不是用户身份 |
| `algolia.user-token/v1` | pseudonymous correlation | instrumentation policy | 影响 unique users 与事件关联；官方要求不得含 PII |
| `algolia.top-search/v1` | aggregate cell | index + window + query | `count`、average hits；可另取 tracked/click/conversion/revenue 指标 |
| `algolia.no-result-search/v1` | aggregate cell | index + window + query/filter profile | provider 判定的零结果；可能是 catalog gap，也可能是 relevance/config/filter 问题 |
| `algolia.click-event/v1` | interaction | event name + queryID + object/position | 只有埋点语义、query 关联和窗口都成立时可解释 CTR |
| `algolia.conversion-event/v1` | interaction | event name + attribution basis | explicit queryID 与 provider inference 必须区分 |
| `algolia.search-configuration-revision/v1` | knowledge snapshot | index settings/rules/synonyms/ranking refs | 配置变化会改变 hit/no-hit 与排序，不由 analytics route 修改 |

### 2.1 原生语义必须保留

- `analytics` 默认开启，但请求可显式排除；“没有报告”不能直接解释成“没有搜索”。[analytics parameter](https://www.algolia.com/doc/api-reference/api-parameters/analytics)
- total searches 与 tracked searches 是不同分母；CTR/CR 只能在相应 tracked population 内解释。
- `queryID` 仅在相应搜索启用 click analytics 时返回；没有它，Algolia 不能把事件关联回原搜索。[Click and conversion events](https://www.algolia.com/doc/guides/sending-events)
- 空 query + filters 可表示 category/browse surface；必须由 capture policy 显式标识，不能混入文字需求排行榜。
- zero results 是 search system outcome，不是产品需求事实。index freshness、filter、rule、synonym、locale、库存和 typo 都是替代解释。
- `0%` 与 `null`、query count 与 event count、explicit query attribution 与 inferred attribution必须分别保存。

## 3. Capability 与 adoption decision

| Capability | Subject → Result | Access/effect | Adoption |
| --- | --- | --- | --- |
| `analytics.read.site-search-top-queries/v1` | index + window → query aggregates | owned official API / none | `eligible` |
| `analytics.read.site-search-no-results/v1` | index + window → no-result aggregates | owned official API / none | `eligible` |
| `analytics.read.site-search-interactions/v1` | index + window → click/conversion/revenue aggregates | owned official API / none | `eligible-if-instrumented` |
| `taxonomy.read.search-index-roster/v1` | approved app → index refs | owned official API / none | `manual-or-readonly` |
| `diagnostics.read.search-configuration/v1` | index → settings/rules/synonyms refs | owned API / none | `deferred`; 独立权限与 schema |
| `search.execute.index-query/v1` | query → hits | owned search API / none | `deferred`; 不是 analytics acquisition |
| `analytics.send.search-event/v1` | event → platform analytics mutation | platform write | `rejected` |
| `index.manage.records-or-settings/v1` | index → changed index | platform write | `rejected` |
| `index.manage-rules-synonyms/v1` | index → changed relevance | platform write | `rejected` |

## 4. Access Methods

### 4.1 `algolia-analytics-api-v2-read/v1`

- route：Analytics API v2；application、index、region 与 window 必须来自固定 Connection/Profile 和 roster；
- least privilege：只接受带 `analytics` ACL 的 key/ref，不接受 Admin API key；secret 只存在 credential store；
- request：冻结 index、start/end、limit/page、click/revenue analytics 开关和 filter profile；分页只证明 provider result page exhausted；
- response：保存 provider query、count、average hits、tracked count、click/conversion/revenue fields 的 schema revision；
- completion：对指定 endpoint/window/index 标记 route complete，不声称未记录请求、未上报事件或全体用户 complete；
- rate、retention、region 与 plan availability 由 sandbox 时重新取证，不能从当前文档外推所有账号。

### 4.2 `algolia-productivity-mcp-read/v1`

Algolia 官方 Productivity MCP 是 user-scoped、只读的内部分析入口，提供 top searches、no-results、filters、click positions 等 analytics tools；账号内用户可访问的 application/index 都可能可见。[Productivity MCP](https://www.algolia.com/doc/guides/model-context-protocol/productivity-mcp)

它适合人工探索与 schema discovery，但不作为确定性批量 Connector 的默认 route：OAuth audience 较宽、tool surface 与返回 schema 可漂移、LLM 编排不可替代 cursor/coverage/receipt。采用状态为 `manual-assisted/discovery-only`；本轮不注册、不授权、不调用。

## 5. Platform Skills

### `algolia-pack-research/v1`

- 只研究官方 docs、analytics schema、ACL、instrumentation 和固定版本 artifact；
- 产出 Concept/Capability/Access KnowledgeProposal；禁止账号连接、MCP 安装或 index 查询。

### `algolia-site-search-intent-acquire/v1`

- 输入：accepted Pack、app/index roster、window、metric profile、privacy/coverage policy；
- 输出：native aggregate Observation + `SearchIntentDefinitionMetadata` + `SearchIntentDatasetMetadata`；
- allowlist：analytics read routes；
- 禁止：发送 events、搜索业务 records、修改 settings/rules/synonyms、把 `null` 转零或补造 attribution。

### `algolia-site-search-conformance/v1`

- fixture 验证 total/tracked、zero/null、empty query、filter、queryID、event attribution 和 config revision；
- sandbox 仅在用户另行授权后，以 analytics-only credential 对单一低敏 index 做最小读取；
- 无 Probe Skill。任何 event 注入、搜索页面改动或 relevance 配置属于独立实验和平台写入。

## 6. 数据治理与解释边界

- query 原文默认 restricted；宽 audience 只看达到阈值、敏感检测后的 cluster/count。
- 不保存 userToken、queryID、objectID 为长期知识；如为 conformance 必须保留，使用短期隔离 blob 和删除策略。
- 事件名不是业务转化定义。每个 click/conversion/purchase 必须绑定 instrumentation revision、计数单位与 attribution window。
- 热门 query 反映已部署搜索入口的使用 population；入口不可见、登录墙、语言、设备和产品导航都会造成 sampling bias。
- no-result、低 CTR、高平均点击位置都只能形成假设，需与 catalog/index/config revision、support/survey/usage 等证据交叉验证。

## 7. 开源与 Agent Artifact 快照

以下 revision 于 2026-08-26 只读固定，未 clone、安装或执行：

| Artifact / revision | Ownership / License | 价值 | 决策 |
| --- | --- | --- | --- |
| [algolia/algoliasearch-client-go v4.40.0](https://github.com/algolia/algoliasearch-client-go/tree/c5737382ac9bea00e9c4facba985d6b309da4e92) `c573738…` | Algolia official；MIT | Analytics client/schema/error reference | `official-reference`；SDK 不是 domain Connector |
| [algolia/skills](https://github.com/algolia/skills/tree/ded7ff387b1099edc6218e002a7d5fda13390d26) `ded7ff3…` | Algolia official；MIT | `algolia-mcp`、CLI、InstantSearch Agent Skill patterns | `discovery-only`；skills 含 read/write 工作流，不整体采用 |
| [Algolia Productivity MCP](https://www.algolia.com/doc/guides/model-context-protocol) | Algolia managed service | 官方只读、user-scoped analytics 探索 | `manual-assisted`；非固定源码 artifact |

## 8. Verification Plan

| 层级 | 必须证明 |
| --- | --- |
| evidence/static | exact app/index/region；analytics ACL；read/write route 分离；schema 与 privacy refs 完整 |
| fixture: total vs tracked | `count != trackedSearchCount` 不被覆盖；CTR 只用正确分母 |
| fixture: zero vs null | 无 query 为 null；有 query 无 event 为 0%；序列化不丢状态 |
| fixture: empty/filter | browse 空 query 与文字 query 分 population；filter revision 可追溯 |
| fixture: no results | hit count 为零但 banner/rule 存在仍标 no-record outcome；不直接产出 demand fact |
| fixture: attribution | missing queryID、inferred vs explicit、过期 window 均降级/拒绝关联 |
| fixture: config drift | settings/rule/synonym/ranking revision 变化创建新 definition revision |
| sandbox/canary | 用户授权后验证最小 index、真实 null/zero/schema、retention/lag/quota；监测 docs/API/ACL/tool drift |

## 9. 晋级缺口

进入 `modeled` 需要接受 Concept/Capability/Access、SearchIntent schema、index roster 与 privacy policy；进入 `verified` 需要 fixture report 和用户授权后的 analytics-only sandbox。MCP/Skills 保持 discovery/manual-assisted，除非另行完成 tool-level authority、schema、receipt 与 negative-write 验证。
