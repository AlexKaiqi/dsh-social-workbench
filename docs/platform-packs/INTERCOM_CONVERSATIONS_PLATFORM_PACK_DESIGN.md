# Intercom Conversations Platform Pack 设计

状态：`researched` 设计候选；未发布、未调用 API、未读取任何 conversation  
核验日期：2026-08-26  
Pack ref：`intercom-owned-support-demand/v0-design`

## 1. 定位与边界

本 Pack 只覆盖用户组织拥有并明确授权的 Intercom workspace 中的 Conversations。它研究用户发起/回复的 support conversation、conversation parts、状态、优先级、分配、SLA/统计、rating、删除和 redaction，用于发现已发生的产品痛点与处理摩擦。

本设计固定 `Intercom-Version: 2.16`。2.16 对 conversation population、priority enum、attribute endpoint、deleted conversation 和字段类型存在版本化变化，不能依赖 app 默认版本或旧 SDK schema：[2.16 changelog](https://developers.intercom.com/docs/references/changelog)。它不覆盖任意第三方 workspace、Contacts 营销画像、Outbound campaigns、Fin content、Sales leads 或写入动作。

```text
platform             intercom
surface              owned workspace Conversations API v2.16
state                researched
verified level       evidence-review design only
callable routes      none
external effects     none
```

## 2. Platform Concepts

| Concept ID | Kind | 身份候选 | 关键语义 |
| --- | --- | --- | --- |
| `intercom.workspace/v1` | entity/surface | authorized workspace + API region | private app token 或 OAuth installation 只属于一个 workspace context |
| `intercom.conversation/v2.16` | mutable entity | workspace + conversation id | source、contacts、state、assignees、tags、priority、statistics、rating 等当前视图 |
| `intercom.conversation-source/v2.16` | value/entity | conversation + source id | 初始 message 与 delivered/channel semantics；可能含 email headers/history |
| `intercom.conversation-part/v2.16` | event/entity | conversation + part id | comment、note、assignment、open/close、rating change 等开放 union |
| `intercom.conversation-state/v2.16` | lifecycle enumeration | provider enum | open/closed/snoozed 等；state 与 read/waiting/priority 分开 |
| `intercom.conversation-channel/v2.16` | enumeration/value | initial/current channel | messenger/email/WhatsApp 等来源；2.16 新字段，不能由 source.type 猜齐 |
| `intercom.conversation-rating/v2.16` | feedback value/entity | conversation + rating | 客服体验评价，不等于产品功能评分 |
| `intercom.conversation-statistics/v2.16` | metric set | conversation + observed revision | response/assignment/close 等时间；provider 版本改变时间序列化 |
| `intercom.conversation-attribute/v2.16` | taxonomy/schema | workspace + attribute id | 2.16 使用 dedicated attributes API；值需 allowlist |
| `intercom.deleted-conversation/v2.16` | lifecycle/tombstone | conversation id + deleted_at | 2.16 deleted list 提供 ID/删除时间；必须传播下游移除 |
| `intercom.redacted-part/v2.16` | correction event/state | conversation + part/source id | webhook/model `redacted` 表明正文不可继续使用 |
| `intercom.contact-ref/v1` | restricted relation | workspace + contact id | 只作 platform-local relation；不是跨平台 customer identity |

### 2.1 原生语义必须保留

- List/Search 返回 conversation list item，不返回完整 `conversation_parts`；必须逐个 Retrieve 才得到 parts。
- Retrieve Conversation 最多返回最近 500 parts。即使 page/search 完成，长会话的 message history 仍是 `partial/truncated`：[Conversations API](https://developers.intercom.com/docs/references/rest-api/api.intercom.io/conversations/retrieveconversation)。
- Search cursor 是无状态 context；官方明确指出两页之间记录被更新会产生 duplicate 或 miss：[Pagination](https://developers.intercom.com/docs/build-an-integration/learn-more/rest-apis/pagination)。cursor 耗尽不是稳定 snapshot。
- source、conversation part、internal note、assignment/lifecycle event 和 rating 是不同对象/事件；不能把 agent note 当用户原话。
- API regions（US/EU/AU）、workspace、version header 和 OAuth installation 共同定义 surface；不能跨 region 重试同一 token。
- 2.16 的 priority、assignee sentinel/type、attributes 和 reporting population 与旧版不同；旧 SDK/connector fixture 不可直接证明当前 contract。

## 3. Capability 与 adoption decision

| Capability | Subject → Result | Access | Adoption | 说明 |
| --- | --- | --- | --- | --- |
| `feedback.search.owned-support-conversations/v1` | owned workspace + updated window → conversation list items | owned official API | `eligible-with-policy` | Search + stable fence/overlap；stateless cursor 有 duplicate/miss 风险 |
| `feedback.read.owned-support-conversation/v1` | workspace + conversation id → source + current parts | owned official API | `eligible` | parts hard cap 500；coverage 单独记录 |
| `feedback.observe.owned-support-conversation-deletions/v1` | workspace deletion listing/webhook → tombstones | owned official API | `eligible-with-policy` | v2.16 deleted list 为强制 reconciliation stream |
| `taxonomy.list.owned-support-conversation-attributes/v1` | workspace → attribute definitions | owned official API | `eligible` | 只解释 allowlisted custom attributes |
| `feedback.receive.owned-support-conversation-events/v1` | webhook topics → changed/deleted/redacted observations | delegated push | `deferred` | 需签名、delivery dedupe/retry/ordering 的独立 verification |
| `analytics.read.owned-support-conversation-statistics/v1` | conversation population → support metrics | owned official API | `eligible-with-policy` | provider fields保留，跨平台不直接比较 |
| `identity.read.support-contacts/v1` | contact ids → contact profiles | owned official API | `rejected` by default | 需求研究不需要邮箱、电话、位置、公司画像 |
| `engagement.reply.owned-support-thread/v1` | conversation + reply/action → message/state | authorized platform write | `rejected` in this Pack | 真实客服动作，不是 Probe |
| `feedback.delete-or-redact.support-thread/v1` | conversation/part → irreversible removal | destructive platform write | `rejected` from acquisition | 数据主体治理需独立授权流程，采集 Skill 不持有删除权 |

## 4. Access Methods

### 4.1 `intercom-conversations-read-v2.16`

- mode：`official-api`；access class：`owned`；effect：`none/local-write`；
- auth：自有 workspace 可用 private app Access Token；多客户产品必须 OAuth，禁止要求用户交付 access token：[Authentication](https://developers.intercom.com/docs/build-an-integration/learn-more/authentication)；
- minimum permission：`Read conversations`；只有确需 taxonomy 时再加 `Read tags`，不申请 write/delete/contact scopes：[OAuth scopes](https://developers.intercom.com/docs/build-an-integration/learn-more/authentication/oauth-scopes)；
- version/region：每次请求固定 `Intercom-Version: 2.16` 与 installation region endpoint；响应/fixture 保存 version；
- search：`POST /conversations/search` 按 `updated_at` 的有界 `[start,end)` query、ascending sort 和 cursor page；POST 是 read effect，不按 HTTP verb 推断写入；
- consistency：在 run 开始冻结 upper fence；窗口切片、重叠回读、`conversation id + updated_at + payload hash` 去重，并对上一高水位重新读取。仍需将 stateless-mutation risk 写入 CoverageAssessment；
- retrieve：对每个 list item `GET /conversations/{id}?display_as=plaintext`；默认不启用 email history、translations、monitors 或 scorecards；parts returned/total count 明确记录；
- rate：官方页面当前声称 private/public app 默认均有 10,000/min app limit 与 25,000/min workspace cap，同时以 10 秒窗口平摊，但页面仍含旧 1,000/min 示例。运行时以 response headers 为准，Pack 不硬编码更高配额：[Rate limiting](https://developers.intercom.com/docs/references/rest-api/errors/rate-limiting)。

### 4.2 `intercom-deleted-conversations-read-v2.16`

- endpoint：`GET /conversations/deleted`，page/per_page（最大 60）和 order；返回 conversation ID 与 deletion timestamp；
- 这是 page-based reconciliation，不是 Search cursor。按 bounded deletion window/descending scan + persisted watermark/overlap 设计；page 移动时新增删除仍可能扰动，fixture 必须覆盖；
- tombstone 只有在 durable 后才推进 deletion watermark；删除后 reporting metrics 可能因 `retain_metrics` 行为仍存在，不能以 reporting row 复活已删除正文；
- `conversation.deleted` 与 `conversation_part.redacted` webhook 可作为补充 drift/latency 信号，但不替代定期 deletion reconciliation：[Webhook topics](https://developers.intercom.com/docs/references/webhooks/webhook-models)。

### 4.3 `intercom-conversations-manual-export/v1`

- mode：`manual-import`/`authorized-export`；本轮为 `manual-only` fallback；
- 用户选择的 CSV/report 固定 dataset/version/filter/timezone/export time；2.16 Reporting Data Export 扩大到 no-reply conversations，旧版 population 不同；
- report metrics 不含完整 conversation parts 时不得作为正文事实，也不能与 REST current snapshots 按行相加。

## 5. Platform Skills

### `intercom-support-pack-research/v1`

- purpose：`research/curate`；核验 current/stable API version、changelog、OAuth scopes、region endpoints、conversation/part schemas、deleted list、webhooks、rate limits 和 developer terms；
- 只输出 evidence-bound proposal；禁止创建 app、请求 token、调用 API、注册 webhook 或运行 SDK/connector。

### `intercom-owned-support-demand/v1`

- purpose：`acquire`；输入固定 Pack/snapshot、workspace roster、region/version、window fence、field allowlist、data-handling profile 和 budget；
- allowlist：conversation search/read、deleted listing、conversation attribute definitions，以及用户选择的 manual export；
- 输出：native Observations、source/part lineage、stateless-page/500-part CoverageAssessment、tombstones 和最小化 projection；
- 禁止：reply/assign/open/close/snooze/delete/redact、Contacts/Companies/profile join、email history、附件 bytes 和跨 workspace identity resolution。

### `intercom-support-conformance/v1`

- purpose：`verify/diagnose`；fixture 默认无网络；
- 验证 2.16 version pin、search fence/overlap、stateless mutation、parts cap、part union、deleted pages、redaction、rate header、403 scope 和 PII minimization；
- sandbox 需用户另行授权最小 read-only development workspace，不注册 webhook、不写入。

本 Pack 不定义 Probe Skill。真实 reply、rating solicitation、assignment/state change 会改变用户体验和运营事实，不属于需求发现 Connector。

## 6. 数据治理

- raw conversation/source/parts 默认 restricted、tenant/region 隔离、短 retention；Contact、Admin、Team 原生 ID 不进入跨平台身份层。
- 默认删除姓名、邮箱、电话、精确位置、IP、email headers/history、recipient、attachment URL、admin identity；必要的 repeated-contact 只允许 tenant-scoped pseudonym，并记录 purpose/retention。
- `note`、side conversation、QA scorecard 和 workflow/AI collected data 默认排除；它们可能包含内部决策、员工评价或额外个人信息，不能因 API 可读就进入痛点索引。
- source/part body 需经过敏感检测和 field policy；unknown custom attributes quarantine。plaintext 只是表现转换，不是自动脱敏。
- `redacted=true`、deleted list 或 deletion webhook 触发 source/canonical correction、EvidenceSpan 撤销和 index removal。已保留的 aggregate metrics 必须与 deleted content lineage 分离。
- Intercom Developer Terms 要求获得 end-user authorization、遵守数据保护并禁止未经同意使用联系信息；Pack 的 owned grant 不替代组织自身的合法处理基础：[Developer Terms](https://developers.intercom.com/docs/publish-to-the-app-store/intercom-developer-terms)。

## 7. 开源 Artifact 候选

以下 revision 于 2026-08-26 通过只读 `git ls-remote <repo> HEAD` 固定；未 clone、安装或执行：

| Artifact / revision | Ownership / License | 价值 | 决策 |
| --- | --- | --- | --- |
| [intercom/intercom-node](https://github.com/intercom/intercom-node/tree/d8a05dee0314b74d6d0bbd49caccdd680a635c1a) `d8a05dee0314b74d6d0bbd49caccdd680a635c1a` | Intercom 官方；Apache-2.0 | generated types、pagination/retry/raw response 参考 | `official-reference`；README 仍声明 API 2.11，不能证明 2.16 concepts/deletions |
| [airbytehq/airbyte Intercom source](https://github.com/airbytehq/airbyte/tree/1339a9ecca6f8fb547ffb7b19665d6980c069026/airbyte-integrations/connectors/source-intercom) `1339a9ecca6f8fb547ffb7b19665d6980c069026` | Airbyte；repo/connector 许可需路径级复核 | search window/lookback、substream state、rate budget、schema/bug history | `discovery-only`；当前文档仍 pin 2.11，且历史多次修复 pagination/sub-daily state，不能直接采用 |
| [singer-io/tap-intercom](https://github.com/singer-io/tap-intercom/tree/1c5e4cfbcbcfb6b481859047e5a9f38e24419b89) `1c5e4cfbcbcfb6b481859047e5a9f38e24419b89` | community；AGPL-3.0 | 旧 Singer state/conversation-parts 分流样本 | `stale-reference/reject-reuse`；README 混用 API 2.5/1.4，未覆盖 2.16 删除与 contract |

## 8. Verification Plan

### evidence-review / static-contract

- workspace/region/version 三元组固定；2.11 SDK/connector evidence 不冒充 2.16 support；
- list/search item 与 retrieved full conversation/part concepts 分开；
- Search POST 被声明为 read effect，write/delete scopes 和 ports 不进入 route；
- stateless cursor、500-part cap、deleted list coverage 都是强制 output；
- raw/PII/internal note 默认 restricted，data-handling profile 和 deletion propagation 必填。

### fixture-conformance

| Fixture | 必须证明 |
| --- | --- |
| bounded updated_at search | upper fence、ascending sort、cursor 与 overlap 保持同一 query semantics |
| record moves between pages | duplicate 去重且 miss 在下一 overlap run 补回；本 run coverage 不谎报 complete |
| same-second updates | inclusive operator ambiguity不丢数据，native id/hash 去重 |
| list item then retrieve | source/parts 分层，不把 list missing parts 当 empty |
| 501 parts | 只见最近 500，history 标 truncated，不声称完整会话 |
| comment/note/assignment/AI parts | user text、internal note、lifecycle event 不混淆 |
| v2.15 vs v2.16 payload | priority/assignee/attribute/version drift fail fast 或显式 mapper |
| paged deleted list with concurrent deletion | overlap reconciliation、幂等 tombstone、watermark 不跳过 |
| redacted part/source | 旧正文从 canonical/evidence/index 移除 |
| 401/403/429 | scope/authorization/rate 正确分类，以 headers 退避 |
| reply/delete fixture | policy/static gate 拒绝，零 platform-write |

### sandbox-live / operational-canary

需用户另行授权后，才可在 development/低敏 workspace 对一个窄窗口做 read-only search + retrieve + deleted-page sandbox。若没有长会话/删除，只证明授权与 schema，不证明对应边界。canary 监测 API version/changelog、scope、region、search mutation duplicates、parts truncation、deleted lag、rate headers 和 unknown part/attribute types。

## 9. 晋级缺口

进入 `modeled` 需要 accepted 2.16 knowledge snapshot、conversation/part/deleted schemas、workspace roster、field/minimization/deletion policy；进入 `verified` 需要 fixture report，并经用户授权完成最小 read-only sandbox。webhook、reply、delete/redact 都未获授权或实现。
