# Zendesk Support Platform Pack 设计

状态：`researched` 设计候选；未发布、未调用 API、未读取任何客服数据  
核验日期：2026-08-26  
Pack ref：`zendesk-owned-support-demand/v0-design`

## 1. 定位与边界

本 Pack 只覆盖用户组织拥有并明确授权的 Zendesk Support instance。它把 ticket 当前快照、ticket update/audit event、comment、field taxonomy、删除/涂黑信号分开建模，用于发现已经发生的产品阻塞、重复联系、严重度、解决摩擦和满意度问题。

Zendesk Incremental Export 官方提供“自上次读取后创建或变化”的 ticket/event 流；ticket cursor export 与 ticket-event time export 是两个不同 checkpoint 协议：[Incremental Exports](https://developer.zendesk.com/api-reference/ticketing/ticket-management/incremental_exports/)。本 Pack 不覆盖 Zendesk Sell、Chat、Guide community、任意第三方 Zendesk instance，也不把客服回复或创建虚假工单当作 Probe。

```text
platform             zendesk-support
surface              owned Support instance / tenant
state                researched
verified level       evidence-review design only
callable routes      none
external effects     none
```

## 2. Platform Concepts

| Concept ID | Kind | 身份候选 | 关键语义 |
| --- | --- | --- | --- |
| `zendesk.support-instance/v1` | entity/surface | exact subdomain + account identity | 一个授权 tenant；同名 brand 或 organization 不等于同一 instance |
| `zendesk.ticket/v1` | mutable entity | instance + ticket `id` | 当前 ticket 快照；`generated_timestamp` 与 `updated_at` 含义不同 |
| `zendesk.ticket-type/v1` | enumeration/relation | provider enum | question、incident、problem、task；problem/incident relation 不压成普通标签 |
| `zendesk.ticket-status/v1` | lifecycle enumeration | provider enum | new/open/pending/hold/solved/closed/deleted 等状态；删除不是普通 closed |
| `zendesk.ticket-audit/v1` | event transaction | instance + audit/update id | 一次 ticket update，包含多个 child events；不等于 ticket revision body |
| `zendesk.ticket-event/v1` | event | audit + event id/type | Create、Change、Comment、redaction、privacy change 等开放事件 union |
| `zendesk.ticket-comment/v1` | append/correctable entity | ticket + comment event id | public/private 必须保留；redaction 后旧正文不得继续进入索引 |
| `zendesk.ticket-field/v1` | taxonomy/schema | instance + field id | 系统/自定义字段定义；值只有经 allowlist 才进入需求 projection |
| `zendesk.ticket-metric/v1` | metric/entity | ticket + metric set/event id | first reply、wait、resolution 等服务过程指标；不直接证明产品严重度 |
| `zendesk.satisfaction-rating/v1` | feedback value/entity | ticket + rating/survey id | good/bad、reason/comment 及 plan-dependent survey detail |
| `zendesk.ticket-deletion/v1` | lifecycle/correction event | ticket id + deletion observation | deleted records 默认仍可出现在 incremental stream，内容随后被 scrub |

### 2.1 原生语义必须保留

- ticket cursor export 按 provider cursor 前进；time-based ticket events 按 `end_time/start_time` 前进，两者不能共享 checkpoint。
- `updated_at` 只反映会产生定义事件的更新，`generated_timestamp` 还包含系统更新。只用 `updated_at` 会漏掉自动化、macro 或系统驱动变化。
- ticket snapshot、audit transaction、child event 和 comment 是不同事实层；同一 update 中的多个 field changes 不能伪装成多张 ticket。
- event union 是开放集合。官方明确要求忽略未知 event type，而不是因 enum 新值让整批失败：[Ticket audit events](https://developer.zendesk.com/documentation/ticketing/reference-guides/ticket-audit-events-reference/)。未知事件仍保留 type/raw restricted evidence。
- private comment、internal note、附件、recipient、requester/submitter/assignee 和 audit metadata 可能包含客户身份、IP、位置或安全信息；`owned` 不等于可进入宽分析索引。
- ticket 被删除后，Zendesk 会 scrub user-provided content，并只保留有限删除记录。旧原文必须按删除/涂黑信号传播 correction，而不是以“历史真实性”为由永久保留。

## 3. Capability 与 adoption decision

| Capability | Subject → Result | Access | Adoption | 说明 |
| --- | --- | --- | --- | --- |
| `feedback.list.owned-support-ticket-snapshots/v1` | owned instance + cursor/window → changed ticket snapshots | owned official API | `eligible` | cursor export；管理员权限；默认保留删除记录 |
| `feedback.list.owned-support-ticket-events/v1` | owned instance + time watermark → audit/update events | owned official API | `eligible-with-policy` | time-based、可能重复或返回更早 event；comment sideload 单独批准 |
| `taxonomy.list.owned-support-ticket-fields/v1` | owned instance → field definitions | owned official API | `eligible` | 仅用于解释 custom field；不自动批准每个值 |
| `analytics.read.owned-support-ticket-metrics/v1` | owned ticket population → service metrics | owned official API | `deferred` | 先证明 metric 定义、plan coverage 与 rollup，再进入共同 projection |
| `feedback.observe.owned-support-ticket-deletions/v1` | changed/deleted ticket + redaction event → correction/tombstone | owned official API | `eligible` | acquisition 的强制组成，不是可选清理任务 |
| `identity.read.support-users/v1` | user ids → profiles/identities | owned official API | `rejected` by default | 需求研究不需要邮箱、电话、社交身份或完整客户画像 |
| `engagement.reply.owned-support-thread/v1` | ticket + reply → public/private comment | authorized platform write | `rejected` in this Pack | 真实客服动作，不是 Probe；另建服务工作流 |
| `feedback.create.support-ticket/v1` | requester payload → ticket | authorized platform write | `rejected` | 不制造测试工单污染运营队列和客服指标 |

## 4. Access Methods

### 4.1 `zendesk-incremental-ticket-cursor-read/v1`

- mode：`official-api`；access class：`owned`；effect：`none/local-write`；
- auth：服务器端 OAuth，首选 `tickets:read`；多租户分发必须使用 global OAuth，禁止要求客户交出 API token。Zendesk 已启动 API token 退役流程：[Security and authentication](https://developer.zendesk.com/api-reference/introduction/security-and-auth/)、[Zendesk changelog](https://developer.zendesk.com/api-reference/changelog/changelog/)；
- endpoint：首次 `GET /api/v2/incremental/tickets/cursor?start_time=...`，之后只使用 `after_cursor`；官方建议 cursor-based export；
- page：默认/最大 1,000；`end_of_stream` 才表示追至 provider 当前 watermark；最近一分钟不会返回；
- identity/dedupe：ticket id + provider revision timestamps/hash；同一 ticket 多次出现生成 observed snapshot，不覆盖旧 observation；
- deletions：不得设置 `exclude_deleted=true`；status/deleted/scrubbed 记录转为 correction/tombstone；
- quota：incremental export 独立全局限制通常 10/min，高容量 add-on 30/min；同时尊重 account headers 和 `Retry-After`：[Rate limits](https://developer.zendesk.com/api-reference/introduction/rate-limits/)。

### 4.2 `zendesk-incremental-ticket-events-read/v1`

- endpoint：`GET /api/v2/incremental/ticket_events?start_time=...`；只有 time watermark，无 cursor；
- `include=comment_events` 才返回完整 comment body；默认只给 comment presence/public flags。本 Pack 的 field/data policy 必须在请求前批准正文与附件描述符；
- time pagination 允许边界重复，按 native event identity 去重；不能用 page count 判 complete；
- archive/delete 可能让多年以前发生的 event 在当前批次重新出现。事件时间、provider generated ordering 和 observedAt 必须分开；
- recently-created minute 被延迟；checkpoint 只在整个 page batch 和 corrections 持久化后推进。

### 4.3 `zendesk-support-manual-export/v1`

- mode：`manual-import`/`authorized-export`；本轮为 `manual-only` fallback；
- 用户可选择 view CSV/JSON export，导入时固定 instance、view/filter、export time、column schema 和已知 omissions；
- manual export 不能声称拥有 audit history、删除覆盖或 cursor completeness，也不能与 API snapshot 按行相加。

## 5. Platform Skills

### `zendesk-support-pack-research/v1`

- purpose：`research/curate`；跟踪 incremental/export、OAuth scope/token EOL、ticket/audit schemas、rate limits、plan gates、deletion/scrub 和 developer terms；
- 只生成 evidence-bound proposal；禁止创建 OAuth client、索取 token、调用 API 或运行外部 tap。

### `zendesk-owned-support-demand/v1`

- purpose：`acquire`；输入固定 Pack/snapshot、用户确认 instance roster、窗口、字段 allowlist、data-handling profile 和 retention；
- allowlist：ticket cursor snapshots、ticket events、ticket fields，以及用户选择的 manual export；
- 输出：原生 Observations、分层 native lineage、CoverageAssessment、deletion corrections、最小化 support-demand projection；
- 禁止：reply/create/update/delete、user identity stream、附件下载、凭 ticket email 构建客户画像、把 private notes 默认送入模型。

### `zendesk-support-conformance/v1`

- purpose：`verify/diagnose`；fixture 默认无网络；
- 验证 cursor/time checkpoint、generated/updated timestamps、duplicates、unknown events、comment privacy、redaction/deletion、scrub、429/403 和 field allowlist；
- sandbox 必须由用户另行授权最小 `tickets:read` admin connection，只读一个低敏测试 instance/window。

本 Pack 不定义 Probe Skill。客服回复、状态修改和建单都会影响真实用户、队列、SLA 和后续 evidence，应属于独立 customer-support operations，而非需求实验。

## 6. 数据治理

- raw ticket/event/comment payload 默认 `restricted`、短 retention、按 tenant 隔离；日志、fixture 和验证报告不含真实正文或身份。
- 默认 projection 删除姓名、邮箱、电话、IP、精确位置、recipient、signature、user identity、附件 URL/token；platform-local requester ref 只有在“重复联系”目的获批时才 tenant-scoped pseudonymize，永不跨平台解析身份。
- private/internal comment 默认不进入文本挖掘；只有经明确 purpose、allowlist 和 access policy 才以 restricted EvidenceSpan 使用。
- attachment 只保存 descriptor/count/type；不下载 bytes，不把 filename 当无害文本。
- custom fields 先读取 definition，再由 field ID + schema version allowlist。未知字段和值 quarantine，不因名称像 `product` 就自动公开。
- redaction、privacy change、deleted/scrubbed ticket 触发 canonical correction、EvidenceSpan 撤销和 projection/index removal；审计只保留最小 native ID、时间、原因和处理 receipt。

## 7. 开源 Artifact 候选

以下 revision 于 2026-08-26 通过只读 `git ls-remote <repo> HEAD` 固定；未 clone、安装或执行：

| Artifact / revision | Ownership / License | 价值 | 决策 |
| --- | --- | --- | --- |
| [zendesk/zendesk_api_client_rb](https://github.com/zendesk/zendesk_api_client_rb/tree/7a24f1c88753d546d9bebf1f35af974627e94ef9) `7a24f1c88753d546d9bebf1f35af974627e94ef9` | Zendesk 官方；Apache-2.0 | REST resource、OAuth/retry/cursor 行为参考 | `official-reference`；广泛暴露 create/update/delete，不能整体授予 Agent |
| [MeltanoLabs/tap-zendesk](https://github.com/MeltanoLabs/tap-zendesk/tree/432213465f5211111d40492263bb78090a62dc96) `432213465f5211111d40492263bb78090a62dc96` | community；Apache-2.0 | Singer catalog/state、incremental streams 和 schema fixture 候选 | `reference-only`；README 以 `updated_at` 描述 ticket replication，必须与官方 `generated_timestamp` 语义做 code/fixture 审计 |
| [airbytehq/airbyte Zendesk Support source](https://github.com/airbytehq/airbyte/tree/1339a9ecca6f8fb547ffb7b19665d6980c069026/airbyte-integrations/connectors/source-zendesk-support) `1339a9ecca6f8fb547ffb7b19665d6980c069026` | Airbyte；repo/connector 许可需路径级复核 | streams、state migration、deleted records、rate-budget 与历史失败样本 | `discovery-only`；2026 年曾因改用 search/updated_at 静默漏系统更新，正好作为负向 fixture 证据，不执行 |

## 8. Verification Plan

### evidence-review / static-contract

- ticket/audit/event/comment/field identities 和 lifecycle 分开；
- cursor ticket 与 time event checkpoints 不共用；最近一分钟 watermark 明示；
- `tickets:read` route 不包含 user identities 或任何 write port；
- raw/private/PII fields 默认 restricted，field handling profile 必填；
- deleted/redacted/scrubbed signal 必须映射 correction/tombstone，不能只追加“删除事件”而保留可检索旧正文。

### fixture-conformance

| Fixture | 必须证明 |
| --- | --- |
| multi-page cursor + end_of_stream | 事务后推进 opaque cursor；complete 只到 provider watermark |
| same ticket system update | `generated_timestamp` 变化被采集，即使 `updated_at` 未变 |
| time boundary duplicates | event native key 去重，不丢同秒记录 |
| archived/deleted old events | event time 与 observed/generated ordering 分开，不倒退 checkpoint |
| public + private comments | visibility 保留；private 默认不产出宽 EvidenceSpan |
| unknown child event | raw restricted 保存、mapper forward-compatible、批次不中断 |
| comment/attachment redaction | 旧 evidence/index 被移除并留下最小 receipt |
| deleted then scrubbed ticket | canonical revision/tombstone 传播，不永久保留原文 |
| unknown custom field | quarantine，未获 allowlist 不进入 projection |
| 401/403/429/timeout | 正确分类、尊重 Retry-After、不切换 token 绕过限流 |
| reply/create fixture | policy/static gate 拒绝，零 platform-write |

### sandbox-live / operational-canary

需用户另行授权后，才可在测试/低敏 instance 做只读 sandbox：先检查 scope/role，再读取一个窄时间窗的 ticket snapshot 和 event page，不下载附件、不读取 users。canary 监测 OAuth/token EOL、scope、incremental schema、unknown event rate、one-minute lag、quota、deletion backlog 和 field-policy drift。

## 9. 晋级缺口

进入 `modeled` 需要 accepted concepts/capabilities/access snapshots、ticket/event/field schemas、instance roster、data-handling/deletion policy；进入 `verified` 需要 fixture report，并经用户授权完成最小 read-only sandbox。当前没有 Connector、credential、live data 或 callable route。
