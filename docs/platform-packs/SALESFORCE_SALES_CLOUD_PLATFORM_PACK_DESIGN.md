# Salesforce Sales Cloud Platform Pack 设计

状态：`researched` 设计候选；未发布、未调用 API、未读取任何 CRM 数据  
核验日期：2026-08-26  
Pack ref：`salesforce-owned-sales-decisions/v0-design`

## 1. 定位与边界

本 Pack 只覆盖用户组织拥有并明确授权的 Salesforce org 中，与购买决策研究直接有关的 Opportunity、销售阶段、机会历史和获批自定义字段。它用于发现已进入销售流程的目标、预算迹象、阻力、替代方案、输单/赢单结果和流程摩擦，不用于建立联系人营销画像、销售人员绩效监控或自动外联。

本设计固定 Salesforce Summer ’26 API `v67.0`；Salesforce 每个 release 都可能新增或改变对象/字段，不能依赖“latest”隐式解释历史 payload：[Summer ’26 developer guide](https://developer.salesforce.com/blogs/2026/06/the-salesforce-developers-guide-to-the-summer-26-release)。REST Query、Bulk 2.0、Change Data Capture 与 Hosted MCP 是不同 access method，拥有不同 checkpoint、coverage、权限和执行语义。

```text
platform             salesforce-sales-cloud
surface              owned Salesforce org / Sales Cloud Opportunity
api baseline         REST API v67.0
state                researched
verified level       evidence-review design only
callable routes      none
external effects     none
```

## 2. Platform Concepts

| Concept ID | Kind | 身份候选 | 关键语义 |
| --- | --- | --- | --- |
| `salesforce.org/v1` | entity/surface | exact org identity + instance/domain | 一个授权 tenant；sandbox refresh、org migration 与 production 不能凭域名猜成同一 surface |
| `salesforce.opportunity/v67` | mutable entity | org + Opportunity `Id` | 销售机会当前快照；不是客户原话、订单、发票或已收款事实 |
| `salesforce.opportunity-stage/v67` | taxonomy/entity | org + stage API identity/name | tenant 配置的 stage、sort order、closed/won 与 forecast category；不能按 label 猜 won/lost |
| `salesforce.opportunity-history/v67` | append history entity | org + OpportunityHistory `Id` | Amount、Probability、Stage、Close Date 变化的原生 stage history；与可配置 field history 分开 |
| `salesforce.opportunity-field-history/v67` | conditional history entity | org + history row `Id` | 只有管理员启用的 tracked field 才有 old/new value；启用前历史不存在且 retention 有界 |
| `salesforce.opportunity-change-event/v67` | event | org + channel/replay delivery + record/change header | CDC create/update/delete/undelete；事件 schema 与 REST snapshot 不同 |
| `salesforce.opportunity-deletion/v67` | lifecycle/correction | org + Opportunity `Id` + deletion observation | soft delete 可由 QueryAll 看见；purged/hard delete 需要额外事件或有界 reconciliation |
| `salesforce.opportunity-field-definition/v67` | taxonomy/schema | org + field API name + describe snapshot | standard/custom/formula/sensitive 字段定义；存在不代表获准采值 |
| `salesforce.opportunity-line-item/v67` | related commercial entity | org + line item `Id` | 产品、数量与价格关系；本轮 deferred，不能自动展开产品/报价/订单面 |

### 2.1 原生语义必须保留

- Opportunity current snapshot、OpportunityHistory、OpportunityFieldHistory 与 CDC change event 是四种 representation；缺一个不能由另一个补写。
- Salesforce Opportunity Stage History 会在 Amount、Probability、Stage 或 Close Date 变化时新增记录，并且不会像普通 field history 那样自动删除：[Opportunity History](https://help.salesforce.com/s/articleView?id=sales.opp_history.htm&language=en_US&type=5)。它仍不是每个字段的完整 revision log。
- Field History 只有启用后才开始记录；标准配置通常仅保证 18 个月、API 最多可见约 24 个月，且同秒更新顺序不保证：[Field History Tracking](https://help.salesforce.com/s/articleView?id=tracking_field_history.htm&language=en_US)。
- `StageName`、`IsClosed`、`IsWon`、Amount、Probability 和 CloseDate 是销售组织维护的 CRM 事实。closed-won 不是 payment，open amount 不是客户确认预算，lost reason 也通常是销售方转述。
- formula/calculated field 可能在公式变更后改变值，却不触发该 Opportunity 的普通更新时间。公式 schema revision 与 record observation 必须分开，coverage 不能冒充完整重算历史。
- Account、Contact、Lead、Owner、Email、Task、Event、Quote、Order 和 File 都是独立对象；Opportunity 上出现 relation ID 不授权读取其身份或正文。

## 3. Capability 与 adoption decision

| Capability | Subject → Result | Access | Adoption | 说明 |
| --- | --- | --- | --- | --- |
| `commercial.list.owned-opportunity-snapshots/v1` | owned org + bounded SOQL → Opportunity snapshots | REST/QueryAll v67 | `eligible-with-policy` | exact field allowlist、SystemModstamp window、soft-delete reconciliation |
| `commercial.list.owned-opportunity-history/v1` | opportunity/window → OpportunityHistory rows | REST SOQL v67 | `eligible` | 原生四字段 stage history；history coverage 单列 |
| `commercial.list.owned-opportunity-field-history/v1` | tracked fields/window → history rows | REST/QueryAll v67 | `eligible-with-policy` | 仅获批字段；配置/retention/同秒 ordering 限制必须输出 |
| `taxonomy.list.owned-sales-pipelines/v1` | org → OpportunityStage taxonomy | REST SOQL/describe v67 | `eligible` | taxonomy snapshot 必须进入 normalized record 的 `DerivedFrom` |
| `taxonomy.list.owned-sales-fields/v1` | org + Opportunity describe → field definitions | REST describe v67 | `eligible` | 只生成 allowlist proposal，不自动读取所有 custom fields |
| `commercial.observe.owned-opportunity-deletions/v1` | QueryAll/CDC deletion → correction/tombstone | official API | `eligible-with-policy` | recycle-bin/72h event retention 造成有界覆盖 |
| `commercial.receive.owned-opportunity-changes/v1` | `/data/OpportunityChangeEvent` → change observations | Pub/Sub CDC | `deferred` | edition/config/schema/72h replay 与 Avro bitmap conformance 未验证 |
| `commercial.query.owned-opportunities.agent/v1` | authenticated user prompt/tool → ad hoc records | Hosted MCP sObject Reads | `deferred` | 适合受控人工研究；不是确定性 replication/checkpoint baseline |
| `identity.read.sales-contacts-or-owners/v1` | relation IDs → people profiles | owned API | `rejected` by default | 需求研究不需要姓名、邮箱、电话、职位或员工绩效画像 |
| `commercial.write.owned-opportunity/v1` | fields → create/update/delete Opportunity | REST/MCP write | `rejected` in this Pack | 改变真实 pipeline、forecast 和运营责任 |
| `engagement.send.sales-outreach/v1` | prospect → email/call/sequence | Sales Cloud/adjacent tools | `rejected` | 不是只读需求研究，也不是自动 Probe |

## 4. Access Methods

### 4.1 `salesforce-rest-opportunity-query-v67/v1`

- mode：`official-api`；access class：`owned`；effect：`none/local-write`；
- auth：External Client App + OAuth；只申请 API/refresh 所需 scope，绑定 dedicated integration user 与最小 Opportunity/OpportunityHistory/OpportunityStage 字段权限，不申请 `full`；凭据只保留 ref。2026 ECA/Connected App 安全控制要求关注 PKCE、refresh-token rotation、TTL 与 IP binding：[OAuth settings](https://help.salesforce.com/s/articleView?id=sf.configure_external_client_app_oauth_settings.htm&language=en_US)、[2026 security enforcement](https://help.salesforce.com/s/articleView?id=005388177&language=en_US&type=1)；
- version：路径固定 `/services/data/v67.0/`；sandbox 与 production 分 connection/surface；
- discovery：先 describe Opportunity 与可查询 fields，和人工批准的 field profile 求交集；未知/新字段 quarantine；
- page：SOQL Query 最多返回一批约 2,000 rows，后续使用 provider query locator；locator 只短期有效，不能作为长期 checkpoint：[Object data APIs](https://developer.salesforce.com/blogs/2024/04/accessing-object-data-with-salesforce-platform-apis)；
- checkpoint：固定 `[start,end]` upper fence，按 `SystemModstamp, Id` 有序窗口拉取，持久化后推进 `(timestamp,id)`；下一 run 使用 lookback overlap + id/hash dedupe，防 eventual-consistency miss；
- deletion：QueryAll 包含 recycle bin 中 soft-deleted rows，但已 purge 的记录不可查询。删除 coverage 必须声明 recycle-bin/event window，不得标全历史 complete；
- quota：读取 `/limits`/响应错误和 org 当前 allocation，按 connection budget 退避；不能写死一个跨 edition 数值，也不能换用户绕过 org limit。

### 4.2 `salesforce-opportunity-history-query-v67/v1`

- OpportunityHistory 与 OpportunityFieldHistory 分 stream、schema 和 checkpoint；
- stage history 记录四个标准商业字段变化；field history 只包含已追踪字段，启用前为 structurally missing；
- history row 的 CreatedDate、record ID 与 old/new values 不能推导同秒绝对 commit order；
- `SourceHistoryCoverage` 按 stream 标 `complete/latest-only/partial/unknown`，并记录 tracking enabled-at、retention 或 Field Audit Trail status；
- FieldHistoryArchive 是单独付费/retention surface，本 Pack 不自动启用或查询。

### 4.3 `salesforce-pubsub-opportunity-cdc-v67/v1`

- Pub/Sub API 使用 gRPC/HTTP2 + Avro，订阅 `/data/OpportunityChangeEvent`；仅在 org edition、CDC selection、permission 和 event schema 均被验证后候选；
- event bus 保留约 72 小时，Replay ID 是 opaque、非连续且不能自行计算；org maintenance 还可能重置 retained stream：[Event durability](https://developer.salesforce.com/docs/platform/pub-sub-api/guide/event-message-durability.html)；
- `changedFields/diffFields/nulledFields` 是 bitmap，empty field 不能当源值为空；必须经过 schema-bound expansion：[Deserialization considerations](https://developer.salesforce.com/docs/platform/pub-sub-api/guide/event-deserialization-considerations.html)；
- CDC 只作为低延迟 change/deletion signal；定期 REST reconciliation 仍是完整性底线。

### 4.4 `salesforce-hosted-sobject-reads-mcp/v1`

- Salesforce Hosted MCP Servers 已 GA，官方建议从 read-only `platform/sobject-reads` 开始；每个 session 绑定真实用户、CRUD/FLS/sharing，并使用 `mcp_api` OAuth scope：[Hosted MCP GA](https://developer.salesforce.com/blogs/2026/04/salesforce-hosted-mcp-servers-are-now-generally-available)；
- `soqlQuery`、schema 和 related-record tools 可用于人工 sandbox/diagnose，但任意 SOQL 的数据面宽于本 Pack allowlist；
- 本轮不把 MCP 当 background Connector：需要先固定 tool inventory/schema、禁写 server、Opportunity-only permission set、query template、response coverage 和审计映射；
- `platform/sobject-all`、custom actions、Flow/Apex writes 均拒绝。

### 4.5 `salesforce-opportunity-manual-export/v1`

- mode：`manual-import`/`authorized-export`；正式 degraded path；
- 用户选择 report/CSV 后固定 org、report/filter、columns、currency、timezone、exportedAt 与 omissions；
- report/trending projection 不是 native object history，必须标 `provider-projection/manual-extract`，不能宣称 API population complete。

## 5. Platform Skills

### `salesforce-sales-pack-research/v1`

- purpose：`research/curate`；核验 API release、Opportunity/Stage/History schemas、OAuth/ECA、limits、CDC、MCP toolset、terms 和开源 artifact drift；
- 只生成 evidence-bound proposal；禁止创建 app、索取 token、调用 org、启用 CDC/field tracking 或运行第三方代码。

### `salesforce-owned-sales-decisions/v1`

- purpose：`acquire`；输入固定 Pack/snapshot、org roster、v67、字段 allowlist、data-handling profile、窗口/预算和 taxonomy snapshot；
- allowlist：Opportunity snapshot、OpportunityStage、OpportunityHistory、批准的 OpportunityFieldHistory、QueryAll deletion 与用户选择的 manual export；
- 输出：native Observations、history relations、CoverageAssessment、DataHandling、corrections/tombstones 和最小化 commercial-decision projection；
- 禁止：Account/Contact/Lead/User/Email/Activity/File 展开、任意 record write、outreach、forecast mutation、把 seller note 当 customer quote。

### `salesforce-sales-conformance/v1`

- purpose：`verify/diagnose`；默认仅 synthetic fixtures；
- 验证 describe/field allowlist、SystemModstamp overlap、same-timestamp ordering、query locator、QueryAll deletion、formula drift、stage/field histories、CDC bitmap/replay expiry、429/limits 和 evidence attribution；
- sandbox 需用户另行授权 Developer/sandbox org、dedicated minimum-access user，只读一个 synthetic Opportunity population。

本 Pack 不定义 Probe Skill。创建或修改 Opportunity、添加活动、发邮件、改 Stage/Amount/CloseDate 都会改变 forecast、销售人员工作和未来 evidence，必须由独立 Sales Operations 工作流管理。

## 6. 数据治理与证据强度

- raw payload 默认 `restricted`、org partition、purpose-bound、短 retention；日志/fixture/report 不含真实公司名、联系人、owner 或 note。
- Opportunity Name、Description、NextStep、自定义 loss reason、competitor、security/legal fields 先由 schema selector allowlist；未知 custom field quarantine。
- AccountId、ContactRole、OwnerId 等只保留 tenant-scoped pseudonymous relation，默认不读取 related profile；小 cohort 输出需阈值抑制。
- seller-entered field/note 标 `counterparty-authored`；客户逐字引语只有存在受权原始 call/email/interview span 时才可标 `subject-authored`。系统 `IsWon`/stage mapping 标 `provider-generated`。
- Amount 保留 currency、source field 和 amount kind；open pipeline amount 不等于 budget，closed won 不等于 invoice/payment，probability 不等于统计置信度。
- soft delete、undelete、merge 或 corrected field value 生成 canonical revision/tombstone，移除或 supersede 受影响的 EvidenceSpan/index/signal；FieldHistoryArchive 的独立保留不能被采集端静默忽略。
- 使用 API 还受 2026-07-20 更新的 [Salesforce API Terms](https://www.salesforce.com/company/legal/sfdc-api-terms-of-service/) 与客户 agreement 约束；Pack 只记录证据和待 review 条件，不作普遍法律结论。

## 7. 开源 Artifact 候选

以下 revision 于 2026-08-26 通过只读 `git ls-remote <repo> HEAD` 固定；仅读取 README/LICENSE，未 clone、安装或执行：

| Artifact / revision | Ownership / License | 价值 | 决策 |
| --- | --- | --- | --- |
| [forcedotcom/pub-sub-api](https://github.com/forcedotcom/pub-sub-api/tree/20fb138250aa603394a670733bb41930095e0e85) `20fb138250aa603394a670733bb41930095e0e85` | Salesforce 官方；CC0-1.0 | proto、Avro/bitmap、replay 和多语言 sample fixture | `official-reference`；README 明确 sample 非 production，不能当 Connector |
| [jsforce/jsforce](https://github.com/jsforce/jsforce/tree/bf620c38dfa88a312379590ad0624a0cd4eee599) `bf620c38dfa88a312379590ad0624a0cd4eee599` | community；MIT | REST/SOQL/describe/Bulk/Streaming client 行为与 mock seam | `reference-only`；API 面含 metadata/write/SOAP login，不能整体授权 Agent |
| [airbytehq/airbyte Salesforce source](https://github.com/airbytehq/airbyte/tree/1339a9ecca6f8fb547ffb7b19665d6980c069026/airbyte-integrations/connectors/source-salesforce) `1339a9ecca6f8fb547ffb7b19665d6980c069026` | Airbyte；repo/path/license 待逐层复核 | dynamic schema、Bulk/REST、lookback、deleted records、formula/CSV edge cases | `discovery-only`；文档记录 eventual-consistency miss 与 `NA` 被误解析为 null，可转 negative fixtures，不执行 |
| [MeltanoLabs/tap-salesforce](https://github.com/MeltanoLabs/tap-salesforce/tree/9915ca2683860f8810d8067792719b9b76e9995c) `9915ca2683860f8810d8067792719b9b76e9995c` | community fork；AGPL-3.0 | Singer catalog/state、QueryAll、REST/Bulk2 mapping | `rejected-reuse`；还支持 username/password/security-token 与全对象 discovery，权限/许可边界不合适 |

## 8. Verification Plan

### evidence-review / static-contract

- v67、org/sandbox surface、Opportunity/Stage/History/FieldHistory/CDC identities 分开；
- read route 只有 exact object/field allowlist，不包含 Account/Contact/User 或 write/MCP-all tools；
- taxonomy Observation 是 normalized opportunity 的 `DerivedFrom`，不按 label 推断 outcome；
- `EvidenceAttribution` 明确 subject/counterparty/provider/derived，closed-won 只能是 purchase-decision evidence，不能自动写入 payment；
- history/deletion/field coverage 与 Page.Complete 分开。

### fixture-conformance

| Fixture | 必须证明 |
| --- | --- |
| describe adds custom PII field | unknown field quarantine；schema drift 不扩大 select list |
| same SystemModstamp for many IDs | `(timestamp,id)` + overlap 不丢不重；checkpoint 事务后推进 |
| record visible after cursor passed | lookback run 补回 eventual-consistency miss |
| formula definition changes without row update | schema/formula drift 触发 re-evaluation，不伪装 record history complete |
| stage label renamed/reordered | taxonomy revision保留；历史 outcome 按当时 stage config 解释 |
| OpportunityHistory + FieldHistory | 两 stream 不重复充当完整 revision；retention/enablement 显示 |
| two changes in same second | 不声称绝对 commit order |
| soft delete then purge | QueryAll tombstone 传播；purged gap 明确 unknown |
| CDC changed/nulled bitmap | schema expansion正确；empty unchanged value不覆盖 snapshot |
| expired/non-contiguous Replay ID | 不计算 replay；降级 REST reconciliation并标 coverage gap |
| seller loss note vs customer quote | 前者 counterparty-authored，不能输出 subject quote |
| closed won with Amount | purchase-decision 可用；payment/budget 自动推断被拒绝 |
| 401/403/limit exhausted | 分类正确、尊重 org budget，不换用户规避 |
| attempted create/update/delete/outreach | static/policy gate 拒绝，零 platform-write |

### sandbox-live / operational-canary

用户另行授权后，才可在 Developer/sandbox org 建 synthetic Opportunity、stage change 和 soft delete，由独立测试管理员准备数据；Connector 只读。canary 监测 API release/ECA security、describe/field-policy drift、SystemModstamp lag、query locator、org limits、history retention、CDC replay age、deletion backlog、attribution unknown rate 和 formula changes。

## 9. 晋级缺口

进入 `modeled` 需要 accepted v67 concepts/capabilities/access snapshots、org roster、Opportunity/Stage/History schemas、field/data-handling/attribution policy；进入 `verified` 需要 fixture report，并经用户授权完成 minimum-access sandbox。当前没有 Connector、credential、live data、MCP connection 或 callable route。
