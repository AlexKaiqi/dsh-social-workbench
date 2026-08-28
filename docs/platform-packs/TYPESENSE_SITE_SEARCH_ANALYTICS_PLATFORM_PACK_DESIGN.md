# Typesense Site Search Analytics Platform Pack 设计

状态：`researched` 设计候选；精确基线 `v30.2`；未连接集群、未执行代码  
核验日期：2026-08-26  
Pack ref：`typesense-owned-site-search-analytics/v0-design`

## 1. 定位与边界

本 Pack 读取用户自有 Typesense 集群中已经配置好的 analytics rule 和 destination collection，以发现热门查询、零结果查询及既有 interaction aggregate。它不创建 analytics rule，不发送 event，不更改 source/destination collection，也不把 counter 改写当作只读分析。

Typesense v30 的 analytics、synonym 和 curation surface 有 breaking changes，因此 Pack 必须固定 server/API 版本。官方 v30.2 文档将 `popular_queries`、`nohits_queries`、`counter`、`log` 作为不同 rule type；前两者把 aggregate 写入普通 destination collection，`counter` 会改写 document 字段，`log` 才支持读取 raw events。[Analytics v30.2](https://typesense.org/docs/30.2/api/analytics-query-suggestions.html)

```text
platform             typesense
surface              owned cluster analytics rules/destination collections
server baseline      30.2
state                researched
verified level       evidence-review + static-contract only
callable routes      none
external effects     none
```

## 2. Platform Concepts

| Concept ID | Kind | 身份候选 | 稳定语义 |
| --- | --- | --- | --- |
| `typesense.cluster/v1` | entity | exact endpoint/cluster ref + version | self-hosted/cloud、analytics enablement 与 flush policy 边界 |
| `typesense.collection/v1` | entity/schema | cluster + exact collection | source 与 destination 都是普通 collection，role 必须另存 |
| `typesense.analytics-rule/v30` | configuration entity | cluster + exact rule name + revision | type/event/collection/params 决定 capture 与写入语义 |
| `typesense.popular-query/v30` | aggregate cell | destination + `q`/meta grain | 只聚合有结果 query；`q`、`count` 是目标 schema 必需字段 |
| `typesense.nohits-query/v30` | aggregate cell | destination + `q`/meta grain | 只聚合无 hit query；不等于缺少产品能力 |
| `typesense.analytics-event/v30` | event | rule + event type + provider data | search/click/conversion/visit；API send 是平台写入 |
| `typesense.counter-rule/v30` | write-side projection | rule + destination field | event 会增加 document counter，并可影响后续 ranking |
| `typesense.log-rule/v30` | raw event store | rule + user + event order | 仅此 type 支持 retrieval；高隐私、非本 Pack 默认 route |
| `typesense.query-expansion/v30` | capture policy | rule `expand_query` | false 保存实际 prefix；true 可聚合 expanded query |
| `typesense.analytics-flush/v30` | latency policy | cluster config/cloud policy | destination 更新延迟；缺 row 在 flush 前不是零 |
| `typesense.user-id/v30` | correlation input | header/parameter policy | 未提供时可能以 client IP 聚合；不能当稳定用户身份 |

### 2.1 原生语义必须保留

- `popular_queries` 只追踪有结果 query；若要零结果必须有单独 `nohits_queries` rule/destination。
- typeahead query 只有至少 4 秒停顿才被聚合；`f → fo → foo → pause` 只登记 `foo`。这不是客户端总请求数。
- `expand_query=false` 保存实际 prefix；true 保存 provider expanded 版本。两种 representation 不可直接合并。
- `capture_search_requests=false` 表示只聚合显式送入 Events API 的 search event；默认 capture 与 API-only capture 是不同 population。
- self-hosted flush 默认 3600 秒、最小 60 秒；Cloud 文档当前为 300 秒。flush 前 missing 是 late/unknown，不是 zero。[Server configuration](https://typesense.org/docs/30.2/api/server-configuration.html)
- `enable_analytics=false` 可按请求排除测试；internal/bot/test 排除策略必须成为 definition revision。
- v29 到 v30 的自动 migration 不证明客户语义不变；accepted Pack 必须保留 rule schema/version evidence。

## 3. Capability 与 adoption decision

| Capability | Subject → Result | Access/effect | Adoption |
| --- | --- | --- | --- |
| `taxonomy.read.typesense-analytics-rules/v30` | cluster → rule roster | owned API / none | `eligible` |
| `analytics.read.typesense-popular-queries/v30` | destination collection → aggregates | collection search/read / none | `eligible` |
| `analytics.read.typesense-nohits-queries/v30` | destination collection → aggregates | collection search/read / none | `eligible` |
| `schema.read.typesense-collections/v30` | approved collections → schemas | owned API / none | `eligible` for conformance |
| `analytics.read.typesense-log-events/v30` | log rule + user → raw events | sensitive owned API / none | `rejected-default/deferred` |
| `analytics.manage.typesense-rules/v30` | rule → changed capture | platform write | `rejected` |
| `analytics.send.typesense-events/v30` | event → analytics mutation | platform write | `rejected` |
| `analytics.apply.typesense-counter/v30` | event → document counter change | platform write/ranking effect | `rejected` |
| `collection.manage.typesense-schema-documents/v30` | collection → changed data | platform write | `rejected` |

## 4. Access Methods

### 4.1 `typesense-v30-destination-read/v1`

- 先读取/导入用户确认的 rule + schema snapshot，确定 source/destination、rule type、event type、capture、expand、meta fields 和 flush policy；
- 只对 allowlisted destination collections 使用最小 `documents:search`/必要 schema read actions；API key actions 和 collections 可精确 scope。[API Keys](https://typesense.org/docs/30.2/api/api-keys.html)
- bootstrap/admin key 永不进入 Connector；Connection 只保存 credential ref 与 endpoint allowlist；
- query aggregate 保留 `q`、count、filter/analytics tag 等已声明 meta fields；未知字段作为 schema-bound extension，不自动升级为核心字段；
- cursor/page complete 只证明 destination 当前可见 rows 耗尽；还必须报告 pause、flush、excluded queries、rule limit 与 source coverage；
- raw log retrieval 不属于默认 access；它要求 user_id，可能含逐用户事件，需独立 purpose/privacy/retention approval。

### 4.2 没有已确认的官方 MCP / Agent Skill route

截至核验日，官方 Typesense 文档与组织仓库中未确认一个由 Typesense 发布、专用于 analytics acquisition 的 MCP 或 Agent Skill。Pack 不把社区搜索结果、通用 REST MCP 或模型生成 wrapper 冒充官方能力。未来发现候选时先进入 `discovered`，固定 source/license/tool/authority，再做 negative-write review。

## 5. Platform Skills

### `typesense-pack-research/v1`

- 核验 v30.2 analytics/rule/API-key/server config 与迁移语义；
- 固定 server、Go client、OpenAPI revision 和许可；
- 只生成 proposal，不连接 endpoint、不执行二进制或 SDK。

### `typesense-site-search-intent-acquire/v1`

- 输入：accepted Pack、cluster/collection/rule roster、window/flush/privacy policy；
- 输出：native aggregates、definition/dataset metadata、coverage 和 late-data status；
- allowlist：rule/schema read 与 destination search/read；
- 禁止：create/update/delete rule、send event、counter、log event retrieval、document/schema write。

### `typesense-site-search-conformance/v1`

- fixture 覆盖 v29/v30、popular/nohits、4 秒 pause、expand、capture mode、flush、meta fields 和 key scope；
- sandbox 需用户另行授权，使用一个隔离的、只读 destination key；
- 无 Probe Skill。主动测试搜索或发送 analytics event 会改变 source/destination analytics，必须进入独立 Probe 设计与显式批准。

## 6. 数据治理与解释边界

- query 与 meta fields 可含 PII、tenant ID 或敏感 filter；默认 aggregate-first、阈值、redaction/quarantine。
- 不保留 `x-typesense-user-id` 或 IP-derived identity；逐用户 log route 默认拒绝。
- nohits 可能来自 filter、typo、locale、synonym、schema、index lag、库存或 rule；只有排除这些替代解释后才形成“能力缺口”假设。
- popular query count 是经过 pause/capture/expand/rule limit 的 provider aggregate，不是 UI request 总量。
- counter 是会改变 document 和潜在 ranking 的 feedback loop，绝不能作为 read-only metric route 复用。

## 7. 开源 Artifact 快照

以下 revision 于 2026-08-26 只读固定，未 clone、安装或执行：

| Artifact / revision | Ownership / License | 价值 | 决策 |
| --- | --- | --- | --- |
| [typesense/typesense v30.2](https://github.com/typesense/typesense/tree/d45d46baf3996d1de8bf96a87f375cfb43691560) `d45d46b…` | Typesense official；GPL-3.0 | server analytics/rule/capture 实际语义参考 | `official-reference`；不嵌入、不执行 |
| [typesense/typesense-go](https://github.com/typesense/typesense-go/tree/f55adb37bbbbf3d1307c4ab2e18a649f416f8a23) `f55adb3…` | Typesense official；Apache-2.0 | Go API model/retry/error reference | `official-reference/fixed-HEAD`；v4 tag 仍 alpha，非 stable release claim |
| [typesense/typesense-api-spec](https://github.com/typesense/typesense-api-spec/tree/cbdcaf9f3f6b94cfcaa15d53310f7bbbbb4b5cb2) `cbdcaf9…` | Typesense official；仓库根未发现 license file | v30 OpenAPI schema/diff source | `schema-evidence-only`；无许可证不复制/生成/分发衍生代码 |

## 8. Verification Plan

| 层级 | 必须证明 |
| --- | --- |
| evidence/static | server/API 30.2、rule/destination roles、API key allowlist、raw log/write routes 被隔离 |
| fixture: popular/nohits | 同 query 在不同 outcome/rule 中不互相覆盖；popular 只含有 hit population |
| fixture: typeahead | 4 秒前不登记，pause 后只登记最终 query；不能声称 request-complete |
| fixture: representation | `expand_query` false/true 分 submitted/expanded；cluster 不静默合并 |
| fixture: capture | auto request、API-only event、`enable_analytics=false` 分 population |
| fixture: flush | destination missing 在 watermark 前为 late/unknown；flush 后 revision 追加 |
| fixture: v29/v30 | rule schema migration 需显式 mapper；旧 action/synonym route 不冒充 v30 |
| fixture: authority | bootstrap/admin、analytics create/delete、event send、counter/document write 全部拒绝 |
| sandbox/canary | 用户授权后验证最小 collection/rule/schema、lag 和 key scope；监测 docs/schema/version/license/latency drift |

## 9. 晋级缺口

进入 `modeled` 需要接受 v30.2 snapshot、rule/collection roster、SearchIntent schema、privacy 与 least-privilege policy；进入 `verified` 需要 fixture report 和只读 destination sandbox。任何 raw log、event send、rule/counter 管理都需要独立 Pack revision 和显式授权，不能随 acquisition 晋级。
