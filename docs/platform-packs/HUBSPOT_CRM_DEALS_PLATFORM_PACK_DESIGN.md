# HubSpot CRM Deals Platform Pack 设计

状态：`researched` 设计候选；未发布、未调用 API、未读取任何 CRM 数据  
核验日期：2026-08-26  
Pack ref：`hubspot-owned-sales-decisions/v0-design`

## 1. 定位与边界

本 Pack 只覆盖用户组织拥有并明确授权的 HubSpot account 中 Deal、deal pipeline/stage、获批 deal properties/property history 与 archive/delete/restore 信号。它用于研究已进入销售流程的需求、商业阻力、预算迹象、赢单/输单和 stage friction，不覆盖 Contacts 营销画像、活动正文、Sequences、自动销售外联或任意 CRM 写入。

HubSpot 在 2026-03 引入 date-versioned API path，替代旧 `/crm/v3` 数字路径；本设计固定 `2026-03`，不依赖 legacy SDK 默认：[2026-03 API reference](https://developers.hubspot.com/docs/reference/api/overview?gdm=GetApp)。CRM Objects、Search、Pipelines、Webhooks 与 remote MCP 是不同 surface，不能把它们压成一个通用“HubSpot connector”。

```text
platform             hubspot-crm
surface              owned HubSpot account / Deal object 0-3
api baseline         2026-03
state                researched
verified level       evidence-review design only
callable routes      none
external effects     none
```

## 2. Platform Concepts

| Concept ID | Kind | 身份候选 | 关键语义 |
| --- | --- | --- | --- |
| `hubspot.account/v1` | entity/surface | exact Hub ID/account identity | 一个授权 tenant；portal/account migration 必须显式 roster revision |
| `hubspot.deal/v2026-03` | mutable entity | account + object type `0-3` + deal `id` | ongoing transaction/opportunity 当前快照；不是支付、订单或客户原话 |
| `hubspot.deal-pipeline/v2026-03` | taxonomy/entity | account + pipeline `id` | 可有多条 sales/renewal pipeline；label/displayOrder 会变化 |
| `hubspot.deal-stage/v2026-03` | taxonomy/entity | account + pipeline + stage `id` | probability、displayOrder 与 closed semantics；使用 internal ID，不按 label join |
| `hubspot.pipeline-audit/v2026-03` | taxonomy revision/event | pipeline/stage + audit identity/timestamp | pipeline/stage 配置变化；reverse chronological provider audit |
| `hubspot.deal-property-definition/v2026-03` | taxonomy/schema | account + property internal name | standard/custom/calculated/sensitive property 定义；定义存在不授权读取值 |
| `hubspot.deal-property-value-history/v2026-03` | embedded history value | deal + property + value timestamp/source | `propertiesWithHistory` 暴露的 property changes；history completeness/retention 未由当前文档统一保证 |
| `hubspot.deal-archive/v2026-03` | lifecycle/correction | account + deal id + `archivedAt` | archived records 不出现在 Search；list `archived=true` 单独读取 |
| `hubspot.deal-webhook-event/v2026-03` | delivery/event | app subscription + event identity/object ID | create/propertyChange/deletion/restore/merge；payload 不是完整 Deal snapshot |
| `hubspot.deal-association/v2026-03` | relationship | from/to object IDs + association type | Contact/Company/LineItem relation；本轮只保留获批 pseudonymous relation，不自动展开对象 |

### 2.1 原生语义必须保留

- Deal list/search item、single/batch object response、`propertiesWithHistory`、pipeline audit 与 webhook event 是不同事实层。
- Search 最多返回某一 query 的 10,000 results、200/page，且新建/更新记录可能延迟出现；`paging.after` 耗尽只证明当前 query page 完成：[CRM Search limits](https://developers.hubspot.com/docs/api-reference/latest/crm/search-the-crm)。
- archived records 完全不出现在 Search；Objects List 的 `archived=true` 是独立 population，删除、restore、merge 还可由 webhook 观察：[Deals List](https://developers.hubspot.com/docs/api-reference/latest/crm/objects/deals/get-deals)。
- Deal Stage 的 probability `0.0`/`1.0` 可表达 closed lost/won，但 tenant 配置和 pipeline audit 才是解释依据；label 文本不是稳定 outcome。
- property history 的 source/timestamp 说明 provider 暴露的变化，不证明启用前、删除后或所有计算变化都完整。
- owner、contact、company、email、meeting、call、note、quote、line item 与 product 是独立 object/scopes；association ID 不授权展开其内容。

## 3. Capability 与 adoption decision

| Capability | Subject → Result | Access | Adoption | 说明 |
| --- | --- | --- | --- | --- |
| `commercial.list.owned-opportunity-snapshots/v1` | owned account + bounded search/list → Deal snapshots | CRM 2026-03 API | `eligible-with-policy` | search window + adaptive partition + overlap；exact property allowlist |
| `commercial.list.owned-opportunity-history/v1` | deal IDs + propertiesWithHistory → field histories | CRM 2026-03 API | `eligible-with-policy` | 仅批准 properties；history coverage 默认 unknown/partial |
| `taxonomy.list.owned-sales-pipelines/v1` | account + deals object → pipelines/stages/audits | Pipelines 2026-03 | `eligible` | taxonomy revision 是 outcome mapping 的依赖 |
| `taxonomy.list.owned-sales-fields/v1` | account + deal object → property definitions | Properties 2026-03 | `eligible` | sensitive/highly-sensitive scopes 默认拒绝 |
| `commercial.observe.owned-opportunity-deletions/v1` | archived list/webhook → correction/tombstone | official API | `eligible-with-policy` | search 不含 archived；90-day recycle-bin window 与 webhook gap 明示 |
| `commercial.receive.owned-opportunity-changes/v1` | app webhook → create/change/delete/restore/merge observations | Webhooks 2026-03 | `deferred` | app-level subscription、签名、delivery/retry/order conformance 未验证 |
| `commercial.query.owned-opportunities.agent/v1` | user prompt/MCP → CRM records | HubSpot remote MCP | `deferred` | GA 但自动 scopes、tool drift、read/write 同面，不作 deterministic ingress baseline |
| `identity.read.sales-contacts-or-owners/v1` | relations → Contacts/Owners profiles | CRM API | `rejected` by default | 不读取 email/name/phone/user/team 或构建个人画像 |
| `commercial.write.owned-opportunity/v1` | fields → create/update/archive/merge Deal | CRM/MCP write | `rejected` in this Pack | 改变 pipeline、forecast、自动化和运营事实 |
| `engagement.send.sales-outreach/v1` | contact → sequence/email/call | adjacent HubSpot APIs | `rejected` | 不是需求采集或无副作用 Probe |

## 4. Access Methods

### 4.1 `hubspot-deal-search-2026-03/v1`

- mode：`official-api`；access class：`owned`；effect：`none/local-write`；
- auth：多 account 分发使用 OAuth；单 account 可用 static auth，但 credential 只以 ref 保存。最小 scope 为 `oauth` + `crm.objects.deals.read`，不申请 deals write、contacts、activities、sensitive/highly-sensitive scopes：[Authentication](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/authentication/overview)、[Scopes](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/authentication/scopes)；
- security boundary：OAuth token 的 CRM scope 可能覆盖 account 内全部 Deals，而不是授权用户 UI 中仅 owned records；因此 roster/filter/field policy 仍是本系统的二次最小化边界：[OAuth quickstart](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/authentication/oauth/oauth-quickstart-guide)；
- endpoint：`POST /crm/objects/2026-03/deals/search`；按 `hs_lastmodifieddate` 固定 `[start,end)`、ascending single sort、`after` page；
- 10K 防线：窗口先按时间切分；若任一 partition 的 reported total 接近/超过 10,000，必须递归缩窗。若不可再分的同毫秒 bucket 仍达到上限，Search route 返回 `CoverageTruncated`，并要求 Objects List 全量 reconciliation 或用户导出；未经官方证明不能把 record ID 发明成第二 search cursor；
- eventual consistency：固定 upper fence 后，下一 run 回读 configurable lookback；`after` 是该 query 的 page token，不是跨 run checkpoint；
- quota：Search 独立 5 req/s/account；其他 OAuth apps 通常 110 req/10s/account，实际以 response/error/headers 和 account plan 为准：[Usage limits](https://developers.hubspot.com/docs/developer-tooling/platform/usage-guidelines)。

### 4.2 `hubspot-deal-object-history-2026-03/v1`

- Search 先返回候选 IDs；Object GET/list/batch 只请求获批 `properties` 与 `propertiesWithHistory`；batch 与 associations 分开；
- `propertiesWithHistory` 会降低单请求可读取数量，page/batch budget 必须由真实 response profile 验证；
- property definition snapshot 先于值映射，记录 internal name、type、options、calculated/sensitive flags 和 updatedAt；
- calculated property timestamp 可能反映最新 sync，而非用户变更。它不能直接推进全局 history cursor；Airbyte 已记录因此跳过 records 的现实失败模式；
- history 未提供统一 completeness/retention 承诺时标 `HistoryUnknown/Partial`，不能用“返回了数组”推断全生命周期。

### 4.3 `hubspot-deal-pipeline-2026-03/v1`

- `GET /crm/pipelines/2026-03/deals` 及具体 pipeline/stage/audit endpoints；只读；
- 每次 normalized Deal 必须通过 `DerivedFrom` 绑定当时用于解释 pipeline/stage 的 taxonomy Observation；
- stage mapping 使用 metadata probability/closed semantics + reviewed mapping；label rename、reorder、archive 和 audit 都产生 taxonomy revision；
- pipeline/stage create/update/delete endpoints 不进入 route：[Pipelines](https://developers.hubspot.com/docs/api-reference/latest/crm/pipelines/guide)。

### 4.4 `hubspot-deal-archived-list-2026-03/v1`

- `GET /crm/objects/2026-03/deals?archived=true` 分页读取 archived population；Search 永远不返回 archived；
- archived record 可在 HubSpot recycle bin 中恢复，官方通用 object guide说明恢复窗口可达 90 天：[Object APIs](https://developers.hubspot.com/docs/api-reference/latest/crm/using-object-apis)；
- archive/restore/merge 是不同 lifecycle；删除后的旧 evidence/index 先撤销，restore 再生成新 canonical revision，不能复活旧 projection 而忽略期间 corrections；
- 定期 active + archived Objects List reconciliation 与可选 webhooks 并用；它也是 Search 出现不可分 10K bucket 时的完整扫描 fallback。超过 retention/window 的 hard gap 标 unknown。

### 4.5 `hubspot-deal-webhooks-2026-03/v1`

- app-level subscriptions 可观察 `deal.creation`、`deal.propertyChange`、`deal.deletion`、`deal.restore`、`deal.merge` 等：[Webhooks](https://developers.hubspot.com/docs/api-reference/latest/webhooks/guide)；
- webhook 只给 object/property change facts，不替代 read-back snapshot；签名版本、batch/delivery dedupe、retry/order、subscription drift 和 app-wide tenant effect 需单独验证；
- 本轮 deferred，不创建 subscription 或 endpoint。

### 4.6 `hubspot-remote-mcp/v1`

- remote MCP 于 2026 年 GA，使用 OAuth 2.1 + PKCE，并可读/写 Deals、Contacts、activities 等广泛 CRM surface；app 不显式定义 scopes，available scopes 随 server tools 与用户安装选择变化：[Remote MCP](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/integrate-with-the-remote-hubspot-mcp-server)；
- 因 tool/scope 会漂移且同一 server 有 CRM write，本 Pack 仅记录为人工 diagnose 候选；不得成为 acquire Skill 的自动 fallback；
- 若未来采用，必须固定 tool inventory、deny writes、Deal-only schema filter、response coverage、user-permission evidence 与 reinstall drift canary。

### 4.7 `hubspot-deal-manual-export/v1`

- mode：`manual-import`/`authorized-export`；正式 fallback；
- 用户选择 export/report 后固定 account、pipeline/filter、columns、currency、timezone、exportedAt 和 omissions；
- export 不继承 Search/property history/archive coverage，也不能与 API snapshots 重复计数。

## 5. Platform Skills

### `hubspot-sales-pack-research/v1`

- purpose：`research/curate`；核验 date-versioned API、Deals/Search/Pipeline/Properties/Webhooks/MCP、OAuth scopes、limits、terms 和开源 artifact；
- 只生成 evidence-bound proposal；禁止创建 app/private token、调用 account、订阅 webhook 或执行 SDK/tap。

### `hubspot-owned-sales-decisions/v1`

- purpose：`acquire`；输入固定 Pack/snapshot、account/pipeline roster、2026-03、字段 allowlist、DataHandling、窗口/lookback/预算；
- allowlist：Deal search/object/history、pipeline/stage/audit、property definitions、archived list 和用户选择的 manual export；
- 输出：native Observations、taxonomy/history relations、CoverageAssessment、corrections/tombstones 与最小化 commercial-decision projection；
- 禁止：Contacts/Owners/activities/content 展开、sensitive properties、associations 自动 join、任何 Deal write/MCP write/outreach、把 seller-entered loss reason 当 customer-authored quote。

### `hubspot-sales-conformance/v1`

- purpose：`verify/diagnose`；fixture 默认无网络；
- 验证 2026-03 path、10K adaptive split、search delay/lookback、same-millisecond rows、property history/calculated timestamps、pipeline revisions、archived/restore/merge、webhook dedupe、rate/scopes 和 attribution；
- sandbox 需用户另行授权 test account + minimum OAuth scopes，只读 synthetic Deal population。

本 Pack 不定义 Probe Skill。Deal 创建、stage/amount/loss reason 更新、sequence enrollment 和外联会改变销售事实或触达真实对象，必须由独立 Sales Operations/Experiment workflow 管理。

## 6. 数据治理与证据强度

- raw CRM payload 默认 `restricted`、account partition、purpose-bound、短 retention；日志/fixture/report 不含真实公司、联系人、owner、email、活动或 note。
- 只读 `crm.objects.deals.read`；`crm.objects.deals.sensitive.read` 与 `highly_sensitive.read` 默认禁止：[Sensitive Data](https://developers.hubspot.com/docs/api-reference/latest/crm/properties/sensitive-data)。
- Deal name/description、owner、loss reason、competitor、自定义字段逐 selector allowlist；unknown field quarantine。Contacts/Companies association 默认只留 tenant-scoped pseudonymous ID，不读取 profile。
- seller-entered field/note 为 `counterparty-authored`；provider stage/calculated field 为 `provider-generated`；只有另有授权原始 customer span 才可标 `subject-authored`。
- Amount + currency 是 CRM 声明；open amount 不是预算，closed won 不是 payment，probability 不是统计置信度，closed lost 也可能是 no-decision/数据清理。
- archive/delete/restore/merge 传播到 canonical、EvidenceSpan、index 和 derived signal review；最小 receipt 可保留，旧正文/identity 不继续可检索。
- API/MCP 使用受 2026-05-04 更新的 [HubSpot Developer Terms](https://legal.hubspot.com/hs-developer-terms) 和用户 agreement 约束；本设计只记录待审证据，不替代法律审查。

## 7. 开源 Artifact 候选

以下 revision 于 2026-08-26 通过只读 `git ls-remote <repo> HEAD` 固定；仅读取 README/LICENSE，未 clone、安装或执行：

| Artifact / revision | Ownership / License | 价值 | 决策 |
| --- | --- | --- | --- |
| [HubSpot/hubspot-api-nodejs](https://github.com/HubSpot/hubspot-api-nodejs/tree/978abdda6b14d1734d7e1d37f088d6acd18dc524) `978abdda6b14d1734d7e1d37f088d6acd18dc524` | HubSpot 官方；Apache-2.0 | OAuth/retry/rate limiter、generated models、mock seam | `official-reference`；README 仍称 v3 且示例/limit 可落后 2026-03，需 schema conformance，广泛 write methods 不授权 |
| [airbytehq/airbyte HubSpot source](https://github.com/airbytehq/airbyte/tree/1339a9ecca6f8fb547ffb7b19665d6980c069026/airbyte-integrations/connectors/source-hubspot) `1339a9ecca6f8fb547ffb7b19665d6980c069026` | Airbyte；repo/path/license 待逐层复核 | Search lookback、archived stream、property history、association/state regression evidence | `discovery-only`；文档记录 calculated timestamp 和 Search irregularity 会漏 records，是 negative fixture 来源，不执行 |
| [MeltanoLabs/tap-hubspot](https://github.com/MeltanoLabs/tap-hubspot/tree/fca5b961fa059a4c92a58af979040f0c80a6a42f) `fca5b961fa059a4c92a58af979040f0c80a6a42f` | community；Elastic-2.0 | Singer state/stream inheritance 与 stream catalog | `rejected-reuse`；仍混用 legacy v1 pipeline、默认含 Contacts/activities/users，许可/版本/最小化均不合适 |

## 8. Verification Plan

### evidence-review / static-contract

- account/object/pipeline/stage/property/history/archive/webhook identities 与 2026-03 version 固定；
- read route 只含 deals/pipelines/properties allowlist，不含 Contacts/activities/sensitive/write/MCP-write；
- Deal normalization 引用 exact pipeline taxonomy observation，不按 label 猜 outcome；
- attribution 区分 customer/seller/provider/derived；closed won 不能写入 payment；
- Search/list/archive/history/webhook coverage 分开。

### fixture-conformance

| Fixture | 必须证明 |
| --- | --- |
| 9,999 / 10,000 / 10,001 results window | 接近上限主动缩窗；超过上限不伪装 complete |
| 10,001 records at one timestamp | 不发明 ID cursor；转 full-list reconciliation 或 `CoverageTruncated` |
| delayed record after first search | overlap run 补回；after cursor 不作跨 run checkpoint |
| many rows same millisecond | ID/hash 去重，不丢记录 |
| archived record absent from Search | active/archived populations 分开；删除 tombstone 传播 |
| delete then restore/merge | correction/revision 幂等；旧 projection 不直接复活 |
| pipeline label rename/stage reorder | taxonomy revision保持；历史 mapping按当时 snapshot |
| custom sensitive property appears | scope/field policy拒绝或 quarantine，不自动采值 |
| calculated property timestamp jumps | 不推进 history cursor越过未读 records |
| property history has gaps | HistoryUnknown/Partial，不从数组存在推断 complete |
| seller loss reason vs customer quote | counterparty-authored 与 subject-authored 分离 |
| closed won amount | purchase-decision evidence可用；payment/budget inference拒绝 |
| webhook duplicate/out-of-order | delivery幂等、read-back、event time/observed time分开 |
| MCP gains new write tool | route remains deferred/blocked，allowed effects不扩张 |
| 401/403/429/search 5 rps | 错误分类和退避正确，不换 token 绕过 |
| attempted write/outreach/contact read | static/policy gate 拒绝，零 platform-write |

### sandbox-live / operational-canary

用户另行授权后，才可在 test account 建 synthetic pipeline/Deals，由独立测试管理员准备 stage changes、archive/restore；Connector 只读。canary 监测 API date version、OAuth scopes、property schema/sensitivity、Search delay/10K split、pipeline audit、archive lag、webhook subscription/signature、MCP tool drift、rate headers、attribution unknown rate 和 correction backlog。

## 9. 晋级缺口

进入 `modeled` 需要 accepted 2026-03 concepts/capabilities/access snapshots、account/pipeline roster、Deal/Pipeline/Property schemas、field/data-handling/attribution policy；进入 `verified` 需要 fixture report，并经用户授权完成 minimum-scope test-account sandbox。当前没有 Connector、credential、live data、webhook/MCP app 或 callable route。
