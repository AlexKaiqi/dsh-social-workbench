# Canny Product Request Platform Pack 设计

状态：`researched / broad-credential` 设计候选；未连接账号、未调用 API、未安装 MCP  
核验日期：2026-08-26  
Pack ref：`canny-owned-product-request/v0-design`

## 1. 定位与边界

本 Pack 只研究和读取用户自有 Canny workspace 中批准的 board/group、idea/post、portal comment、vote 与 status history，用于发现显式产品请求、支持语境和交付状态。它不创建、修改、合并、删除、投票、评论、通知、发布 changelog、写 Jira/Linear 或向 Autopilot enqueue 文本。

Canny 当前官方 API 同时暴露新 `idea/group/insight` 与旧 `post/board/vote` surface：idea 可有 parent/child、group、status 与 source；post 可关联 idea，并保留 board、category、vote score、status、merge history 和 delivery integrations。[Canny API reference](https://developers.canny.io/api-reference) 这两层是独立 representation，不能任选一层覆盖另一层。

```text
platform             canny
surface              owned feedback workspace
state                researched / broad-credential
verified level       evidence-review + static-contract only
callable routes      none
external effects     none
```

## 2. Platform Concepts

| Concept ID | Kind | 身份候选 | 原生语义 |
| --- | --- | --- | --- |
| `canny-workspace/v1` | entity | credential-bound company/workspace | API key 与所有 boards/data 的 authority 边界 |
| `canny-board/v1` | container | workspace + board ID | 用户创建 post/vote 的 portal surface；有 private/private-comments 状态 |
| `canny-group/v2` | taxonomy/container | workspace + group ID | Canny Ideas 的分组，可有 parent hierarchy |
| `canny-idea/v2` | curated request entity | workspace + idea ID | feature/feedback item；可有 parent/children、group、source、owner/status |
| `canny-post/v1` | authored request representation | workspace + post ID | 总与 author/board 关联；`by` 是代提交 admin；可关联 idea |
| `canny-portal-comment/v1` | content/relation | comment ID | 可公开或 internal；reply parent 与 like count 独立 |
| `canny-vote/v1` | support relation | vote ID | post + voter；`by` 可表示 admin 代投；priority 不是额外独立用户 |
| `canny-status-change/v1` | lifecycle event | status-change ID | changer、time、post、new status 与可选 change comment |
| `canny-merge/v1` | relation/event | source post → target post + observed time | source不能被目标覆盖；retrieve surface可暴露 merge history |
| `canny-changelog-entry/v1` | delivery communication | entry ID/revision | draft/scheduled/published，可关联 posts；不是产品已交付的独立证明 |
| `canny-insight/v2` | provider/curated evidence | insight ID | 可能来自 Autopilot/人工归集；不能冒充原始客户陈述 |
| `canny-opportunity/v1` | CRM-derived context | opportunity ID | Salesforce等派生商业上下文；不默认读取或当支付事实 |

### 2.1 必须保留的语义

- post `author` 与 `by` 分开：admin 代提交只证明平台代表关系，不证明客户直接操作；author 删除后可为 null。
- `score` 是 post 当前 vote 数快照；逐 vote 的 voter、admin-on-behalf、priority、import/integration来源决定是否可推导独立 recurrence。
- status 名可由团队自定义。`complete`、`closed` 或自定义名称必须绑定 status taxonomy revision；changelog/Jira link 也不能单独证明交付或用户价值。
- idea parent/child、post→idea、post merge、Jira/Linear/ClickUp 与 changelog link 是不同关系；相似标题不生成 exact relation。
- board/category/post v1 大量 list route 使用 `skip/limit`，idea/group v2 使用 cursor；同一 Connector 需按 route 分 checkpoint，不能发明全平台统一 cursor。
- list/retrieve representation 不同：merge history 等字段可能只在 retrieve 中出现；list complete 不等于 history complete。
- private board、private/internal comments、users/companies/opportunities 均可能包含比需求文本更敏感的数据，默认不随 item read 扩展。

## 3. Capability 与 adoption decision

| Capability | Subject → Result | Access/effect | Adoption |
| --- | --- | --- | --- |
| `taxonomy.list.owned-product-request-containers/v1` | workspace → boards/groups/categories/status refs | owned API / none | `eligible-with-broad-key` |
| `feedback.list.owned-product-request-items/v1` | approved container → ideas/posts | owned API / none | `eligible-with-broad-key` |
| `feedback.read.owned-product-request-item/v1` | item → exact detail/merge relations | owned API / none | `eligible-with-broad-key` |
| `feedback.list.owned-product-request-status-history/v1` | approved posts → status changes | owned API / none | `eligible-with-broad-key` |
| `feedback.list.owned-product-request-support/v1` | selected item → votes/comments | sensitive owned API / none | `conditional`; aggregate-first，逐人默认拒绝 |
| `feedback.receive.owned-product-request-event/v1` | signed delivery → wake-up/observation | webhook push / local write | `deferred`; replay/dedupe/reconcile先验证 |
| `feedback.read.canny-insights/v1` | idea → provider/curated insights | owned API / none | `deferred`; provenance与原文relation未验 |
| `feedback.manage.*` | request/support/taxonomy → changed Canny data | platform write | `rejected` |
| `feedback.enqueue.autopilot/v1` | transcript/text → provider extraction/merge mutation | paid platform write | `rejected` |

## 4. Access Methods

### 4.1 `canny-secret-key-policy-read/v1`

- 官方 API 使用 workspace secret API key，当前 reference 没有按 endpoint 的 read-only scope；同一 key 可调用 create/update/merge/delete/vote/comment/changelog/Autopilot 等写路由；
- HTTP `POST` 同时用于 read/list 和 write，effect 必须由 exact endpoint capability 定义，不能按 method 推断；
- credential bytes 不进入 config、日志、trace、fixture或Pack。API 将 key放在request body，HTTP/body logging必须默认关闭或确定性redact；
- route allowlist只包含固定 host `canny.io` 与明确 read endpoints；generic execute、任意path和redirect拒绝；
- v1 offset list冻结board/filter/sort/limit并做overlap/dedupe；v2 cursor保持同query/sort直到耗尽；mutable items追加observed revision；
- 当前官方 reference 未给出可依赖的固定 rate-limit contract，sandbox前保持unknown并用预算/退避保护。

### 4.2 `canny-signed-webhook-wakeup/v1`

Canny 对 webhook 提供 `canny-timestamp`、unique nonce 与以 team API key 对 nonce做 HMAC-SHA256/Base64 的 `canny-signature`；timestamp用于拒绝 replay，但官方示例签名仅覆盖 nonce。[Webhook signatures](https://developers.canny.io/api-reference)

因此设计必须：constant-time compare、严格时间窗、nonce replay cache、body size/schema allowlist、delivery dedupe；收到 `post/comment/vote` created/edited/deleted 或 status event 只作为 wake-up/append candidate，再通过 pull reconcile。配置 webhook 是平台写入，本 Pack 不执行。

## 5. Platform Skills

### `canny-pack-research/v1`

- 固定官方 ideas/posts/votes/comments/status/merge/webhook evidence 与 OSS revision；
- 输出 knowledge proposal，不连接 workspace、不安装 MCP/SDK。

### `canny-product-request-acquire/v1`

- 输入：accepted Pack、board/group roster、field/visibility/support policy、window；
- 输出：native Observations、`ProductRequestDefinitionMetadata`、`ProductRequestItemMetadata`、merge/status lineage 与 coverage；
- 默认只取 container/item/status aggregate；comments/votes按批准字段和最小化条件启用；
- 禁止 users/companies/opportunities/revenue/attachments/internal content 自动扩张与所有 write endpoint。

### `canny-product-request-conformance/v1`

- fixture 验证 idea/post dual representation、author/by、custom status、score/vote、merge、private/internal、v1 offset/v2 cursor与signed webhook；
- sandbox 需用户另行授权的专用key与synthetic workspace；即使凭据宽权限，policy/transport负向测试也必须证明零write；
- 无 Probe Skill。真实 post/vote/comment/status/changelog/notify 会影响客户与数据，必须另建 Probe/approval/receipt/reconcile。

## 6. 数据治理与推断边界

- title/details/portal comments 可为 subject-authored；internal comment、status message、admin-created post、provider insight 属不同 authorship，`EvidenceSpan.ProductRequest.Role` 必须保留。
- vote/support是平台关系，不是痛点严重度、支付、独立用户数或市场规模。admin-on-behalf/import/integration/merge迁移会改变计数解释。
- private comments、email/userID、company/MRR、opportunity和integration URLs默认drop/restrict；只持久化scope-local opaque refs。
- status/changelog/link 仅证明团队在平台中声明或关联，不证明工程完成、功能已部署或需求已满足。
- 删除、unvote、comment deletion、merge 与 user deletion必须追加tombstone/revision；不能让历史计数静默重写。

## 7. 开源与 Agent Artifact 快照

以下 revision 于 2026-08-26 只读固定，未 clone、安装或执行：

| Artifact / revision | Ownership / License | 价值 | 决策 |
| --- | --- | --- | --- |
| [Airbyte source-canny](https://github.com/airbytehq/airbyte/tree/1339a9ecca6f8fb547ffb7b19665d6980c069026/airbyte-integrations/connectors/source-canny) `1339a9e…`; image metadata `0.0.56`; manifest `4.6.2` | Airbyte community；ELv2；alpha | boards/categories/posts/comments/status/users/votes schema、offset fixture | `reference-only`；streams过宽，未覆盖新ideas层 |
| [opensourceops/canny-mcp-server](https://github.com/opensourceops/canny-mcp-server/tree/a991846006aa40ddadc8e97d903f001a6bbf6dc0) `a991846…` | community；Apache-2.0 | 37-tool taxonomy、readonly default与idea/post surface参考 | `discovery-only`；底层key仍宽，19 read tools也超最小面 |
| [flagpoonage/canny-js](https://github.com/flagpoonage/canny-js/tree/344425f119d8c59c9be2758aeba593989f593eba) `344425f…` | community；MIT | v1 schema/error wrapper reference | `reference-only`；同时包含大量writes |
| [mailerlite/canny-mcp-server](https://github.com/mailerlite/canny-mcp-server/tree/683eaab43e583d163edecfb1bb1399e1a51410f0) `683eaab…` | community；根目录未发现license | 小型 MCP schema样本 | `rejected-for-reuse/schema-discovery-only` |

未确认 Canny 发布的开源 API SDK、MCP 或 Agent Skill；官方 managed docs/API 与社区项目必须分开标注。

## 8. Verification Plan

| 场景 | 必须证明 |
| --- | --- |
| idea + post relation | 两个native identity保留，只按explicit idea ref关联 |
| author/by/deleted author | subject、admin-on-behalf与unknown attribution不混合 |
| list vs retrieve | merge history缺失时history partial，不用list覆盖detail |
| merge source→winner | source revision保留，relation追加；迁移score/comment不算新独立支持 |
| score + vote priority | aggregate与event分开；priority不是额外vote |
| custom status | provider ref/taxonomy revision保留，不凭名字推断交付 |
| private/internal | broad projection拒绝；role与visibility policy生效 |
| v1 offset mutation | overlap/dedupe，page complete不等于history/market complete |
| webhook replay/tamper | signature、timestamp、nonce、duplicate、unknown event负向验证 |
| broad credential | create/update/merge/delete/vote/comment/notify/autopilot全部transport/policy拒绝 |

operational canary 监测 docs/object duality、endpoint/schema、board/group/status roster、cursor/offset gap、webhook replay/signature、key age、private/internal leak、merge/status/tombstone、rate unknown 与 OSS license/maintenance drift。

## 9. 晋级缺口

进入 `modeled` 需要接受 dual-representation concepts、broad-key access、definition/item/span schemas、board/group roster和handling policy；进入 `verified` 需要fixture report和用户授权synthetic workspace的read-only policy sandbox。由于官方凭据本身不能最小化，任何live route即使验证通过也必须持续标记`broad-credential`，不能宣称least privilege。
