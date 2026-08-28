# Owned Sales Decisions Channel Pack 设计

状态：`researched` 组合设计；成员 Pack 均未发布、未调用  
核验日期：2026-08-26  
Channel Pack ref：`owned-sales-decisions-demand/v0-design`

## 1. 为什么这是新的信号类型

公开讨论说明“有人表达问题”，搜索说明“有人主动寻找”，客服说明“已有用户遇到问题”；一方 CRM Opportunity/Deal 则记录“一个目标组织或买方进入了商业决策流程，以及内部如何记录结果”。它能补充预算、替代方案、采购时机、反对理由和 no-decision/won/lost，但证据通常由销售人员录入，且只覆盖进入 CRM 的样本。

因此本 Channel 的目标不是自动挖 leads 或预测收入，而是从受权销售事实中提取可追溯的购买决策证据，并显式保留 seller-entered、provider-generated 和 customer-authored 的强度差异。closed won 不是 payment；closed lost reason 不是未经核验的客户原话；raw pipeline amount 不是市场规模。

```text
Salesforce Sales Cloud ─┐
                        ├─> Owned Sales Decisions Channel
HubSpot CRM Deals ──────┘      ├─ org/account + pipeline roster
                               ├─ commercial-decision projection
                               ├─ taxonomy/history bindings
                               ├─ attribution/data policy
                               ├─ coverage + sales-process bias
                               └─ read-only skills
```

CRM 写入不是 Probe。创建/修改机会、移动 stage、添加 loss reason、发邮件或加入 sequence 会改变真实 forecast、销售工作和后续证据。若未来做 sales-assisted validation，必须另建 consent、truthful outreach、approval、outbox、receipt、unsubscribe 和 owner responsibility 的工作流。

## 2. 成员 Pack

| Member | 原生 surface | 当前状态 | 关键 coverage 边界 |
| --- | --- | --- | --- |
| [Salesforce Sales Cloud](SALESFORCE_SALES_CLOUD_PLATFORM_PACK_DESIGN.md) | owned org；REST v67 Opportunity/Stage/History/QueryAll，CDC/MCP deferred | `researched` design | field permissions、history enablement/retention、recycle bin、eventual consistency 与 optional 72h CDC |
| [HubSpot CRM Deals](HUBSPOT_CRM_DEALS_PLATFORM_PACK_DESIGN.md) | owned account；2026-03 Deal/Search/Pipeline/Properties/Archived | `researched` design | Search 10K/query + delay、archived separate、property-history unknown、MCP tool/scope drift |

共同 capability proposal：

- `commercial.read.owned-opportunity/v1`
- `commercial.observe.owned-opportunity-changes/v1`
- `commercial.observe.owned-opportunity-deletions/v1`
- `taxonomy.list.owned-sales-pipelines/v1`
- `taxonomy.list.owned-sales-fields/v1`

成员原生 REST/Search/QueryAll/history/archive/webhook/CDC/MCP capability 保持独立。Contacts/Leads/Owners/activities、email/call/note 正文、sensitive fields、opportunity/deal writes 和 outreach 不进入共同 allowlist。

## 3. Org/Account 与 Pipeline Roster

每个 research program 固定 `ChannelRosterRevision`：

| 字段 | 作用 |
| --- | --- |
| product/offering subject ref | 用户确认 pipeline 对应哪个产品、方案或业务；不从 deal name/域名猜 |
| member Platform Pack ref | 固定 Salesforce v67 或 HubSpot 2026-03 Pack revision |
| platform surface | exact Salesforce org/sandbox 或 HubSpot account/Hub ID |
| ownership/authorization evidence | 证明组织有权研究该 tenant 与 sales population |
| included pipeline/stage surface | 明确纳入 new business/renewal/partner 等哪条 pipeline，不默认全 org |
| field profile | exact standard/custom property allowlist、sensitivity 与 attribution defaults |
| amount/currency policy | native/display/base currency、conversion source/date 与可比较条件 |
| exclusions | HR/legal/security/VIP/strategic accounts、contacts、activities、attachments、敏感字段 |
| valid window | pipeline rename/restructure、CRM migration、API version 或产品映射变化时追加 revision |

一家公司可能同时有多个业务线、currency、record type 或 pipeline；同一个客户也可能有多个独立机会。只有用户确认的 migration map 或平台原生 exact reference 能跨 member 关联；名称、域名、邮箱和相似金额不能用于模糊身份合并。

## 4. `owned-sales-decision` Projection

| 字段 | 来源与规则 |
| --- | --- |
| member/pack/surface/representation | 必填；保留 provider、tenant、API/date version 和 snapshot/history/manual surface |
| native opportunity/deal ref | platform-local；Salesforce ID 与 HubSpot deal ID 永不共用 |
| product/offering subject | roster 给出；不从 company/deal name 或 line item 文本猜 |
| pipeline/stage ref + taxonomy revision | 原生 IDs + exact taxonomy Observation；normalized revision 将其列入 `DerivedFrom` |
| lifecycle state | open/won/lost/unknown；依据当时 stage metadata/reviewed mapper，不按 label substring |
| created/updated/expected-close/resolved/observed times | 分开；expected close 不能自动视为实际决定时间 |
| amount/currency/amount-kind | 原生字段 + currency；pipeline value、expected amount、contract value 不混写 |
| need/problem/desired outcome | 只从获批字段或 EvidenceSpan 派生；缺失不补写 |
| commercial friction | loss/no-decision reason、competitor、procurement/timing/security objection 等 allowlisted categorical/text evidence |
| decision evidence | won/lost/no-decision + basis；标 `purchase-decision`，不自动标 payment/budget/switching |
| evidence attribution | subject-authored、counterparty-authored、provider-generated、derived、unknown；不保存个人身份 |
| history coverage | snapshot、stage history、field/property history、deletion 分开；tracking/retention/10K gap 明示 |
| data handling | field dispositions、pseudonym scope、restricted spans、retention 与 deletion propagation |
| bias/context | pipeline inclusion、CRM hygiene、sales team/process、currency/segment denominator 和 missing-field rates |

### 4.1 Stage、history 与 outcome

- 当前 snapshot 只回答“观测时是什么”；stage history 回答 provider 暴露的变化；field/property history 只回答被跟踪/请求的属性；三者不能互相冒充完整 revision。
- outcome mapping 是 `taxonomy observation + mapping version + source record` 的派生事实。pipeline 配置变化必须重新 materialize 受影响 projection，但不重写历史 native facts。
- closed won 是组织声明的购买决策结果，只有后续 invoice/order/payment 证据才能升级为 `EvidencePayment`。
- closed lost 可能包含竞品、预算、时机、功能、安全、采购流程或 no-decision；分类必须绑定原字段和 authorship，模型只能提案。
- stage probability 是 CRM/团队配置或用户估计，不是模型置信度，也不能跨 pipeline 直接平均。

### 4.2 去重与迁移

- canonical source key 只在 tenant/member 内定义；同平台重复 snapshot 形成 revision，不原地覆盖；
- Salesforce → HubSpot 或相反迁移只有用户确认 ID map/export relation 才建立 `same-commercial-process` candidate；
- company/contact identities默认 drop/pseudonymize；跨 tenant 的相同 pseudonym 也不得关联；
- duplicate opportunities、split/merge、renewal/new-business、multi-product deals 需原生 relation 或人工 review；金额/标题相似只产生候选，不自动合并。

## 5. 证据归属与数据最小化

### 5.1 `EvidenceAttribution`

| Authorship | 例子 | 可支持的主张 |
| --- | --- | --- |
| `subject-authored` | 经授权的客户原始 quote、问卷或邮件精确 span | 客户确实这样表达；不证明陈述为真或身份已核验 |
| `counterparty-authored` | 销售人员录入的 loss reason、next step、note 摘要 | 销售组织这样记录；不能写成客户逐字原话 |
| `provider-generated` | IsWon、stage probability、calculated property、archive event | 平台按其配置产生状态/计算；不证明购买动机 |
| `derived` | mapper/模型归类出的 objection/theme | 可审阅推断；必须引用输入 spans 与版本 |
| `unknown` | 无来源元数据的 legacy/custom field | 默认不能生成 direct customer claim |

Attribution 只描述作者关系与判断依据，不保存姓名、邮箱、owner ID 或联系人身份。它不能代替 Rights、DataHandling 或事实核验。

### 5.2 默认处理

- raw CRM payload：`restricted`、tenant partition、短 retention、purpose-bound access；
- person/contact/owner/account names、email、phone、domain、exact address、活动正文、attachments：默认 `drop` 或 tenant-scoped `pseudonymize`；
- deal/opportunity name、description、next step、loss reason、自定义 fields：先按 schema selector review；unknown/sensitive quarantine；
- amount/currency 可保留用于商业强度，但小 cohort、单客户金额和合同细节只在 restricted analytics；对外 projection 用 bucket/threshold；
- seller/owner performance、win-rate ranking 与 employee monitoring 不属于本 Channel；
- delete/archive/merge/privacy correction 传播到 canonical、EvidenceSpan、index/materialization 和 derived signal review，只留最小 receipt。

## 6. Coverage 与偏差

```text
page/query completion
        ↓
authorized object + field population
        ↓
snapshot/history/deletion coverage
        ↓
pipeline roster + product mapping
        ↓
CRM-entry + seller-recording bias
        ↓
commercial-decision claim strength
```

- Salesforce REST complete：固定 SOQL/fields/window/permissions 的 Query/QueryAll pages 耗尽；eventual consistency 需 overlap，purged deletes 与未追踪 field history仍是 gap；
- Salesforce history complete：OpportunityHistory 可覆盖其四个标准字段的 exposed history；OpportunityFieldHistory 受 enabled-at/retention 限制；CDC 只覆盖 72h retained event bus；
- HubSpot Search complete：单 partition <10K、pages 耗尽且 overlap reconciliation 通过；不可分的 10K timestamp bucket 必须走 full-list reconciliation 或标 truncated，Archived、property history 与其他 pipelines另算；
- HubSpot archived complete：`archived=true` pages 在当前 recycle-bin population 内耗尽；超过可恢复/保留窗口的删除未知；
- roster complete 只代表用户列出的 org/account/pipeline，不代表企业全部销售、市场全部买方或所有未进入 CRM 的需求；
- CRM 数据受 lead qualification、销售激励、字段必填、阶段清理、重复记录、渠道/地区、deal size、销售周期和赢单后更新习惯影响；跨团队 raw win/loss rate 不可直接比较。

## 7. Channel Skills

### `owned-sales-roster-curation/v1`

- purpose：`research/curate`；
- 输入：用户确认 product/offering、member surfaces、pipeline/record type、ownership evidence、currency/field/exclusion policy 和现有 roster；
- 输出：新增、迁移、停用、API/taxonomy/field policy proposal；
- 禁止：发现凭据、枚举陌生 tenant、按公司/邮箱创建 lead list 或调用 CRM。

### `owned-sales-decision-research/v1`

- purpose：`acquire`；
- 输入：固定 Channel/member snapshots、roster revision、窗口、问题、field/DataHandling/attribution profile、cost/retention；
- allowlist：成员 Opportunity/Deal snapshot/history/taxonomy/deletion 和用户选择的 manual import；
- 输出：native Observations、member CoverageAssessment、taxonomy bindings、attributed spans、corrections/tombstones、共同 projection，以及 budget/switching/purchase-decision candidates；
- 禁止：Contacts/Leads/Owners/activities/attachments、任意 write/outreach、个人/员工画像、把 won 当 payment、把 seller text 当 customer quote。

### `owned-sales-channel-conformance/v1`

- purpose：`verify/diagnose`；
- 先引用成员 fixture reports，再验证 roster、taxonomy binding、currency/amount semantics、attribution、coverage、identity isolation、correction/deletion cascade 和 partial degradation；
- Channel report 不替代成员 API/version/scope verification。

没有 Channel Probe Skill。销售访谈、报价、landing lead capture 或外联测试都应由独立 Probe workflow 绑定真实 offering、consent、audience、one-time approval、receipt、response attribution 和退订。

## 8. 开源生态快照

| Artifact | Fixed revision | 价值 | 边界 |
| --- | --- | --- | --- |
| [forcedotcom/pub-sub-api](https://github.com/forcedotcom/pub-sub-api/tree/20fb138250aa603394a670733bb41930095e0e85) | `20fb138250aa603394a670733bb41930095e0e85` | Salesforce 官方 proto/CDC sample | CC0-1.0；sample 非 production，未执行 |
| [jsforce/jsforce](https://github.com/jsforce/jsforce/tree/bf620c38dfa88a312379590ad0624a0cd4eee599) | `bf620c38dfa88a312379590ad0624a0cd4eee599` | REST/Bulk/Streaming client 与 fixture seam | MIT；社区 broad API/write surface，reference only |
| [HubSpot/hubspot-api-nodejs](https://github.com/HubSpot/hubspot-api-nodejs/tree/978abdda6b14d1734d7e1d37f088d6acd18dc524) | `978abdda6b14d1734d7e1d37f088d6acd18dc524` | 官方 Node client、OAuth/retry/models | Apache-2.0；v3/read-write broad，2026-03 conformance 未证实 |
| [airbytehq/airbyte](https://github.com/airbytehq/airbyte/tree/1339a9ecca6f8fb547ffb7b19665d6980c069026) | `1339a9ecca6f8fb547ffb7b19665d6980c069026` | 双 CRM connector 的 schema/state/lookback/deletion 与真实 data-loss edge cases | repo/path/license 待审；discovery-only，未执行 |
| [MeltanoLabs/tap-salesforce](https://github.com/MeltanoLabs/tap-salesforce/tree/9915ca2683860f8810d8067792719b9b76e9995c) | `9915ca2683860f8810d8067792719b9b76e9995c` | Singer QueryAll/Bulk2/state 参考 | AGPL-3.0 + password auth + all-object discovery；reject reuse |
| [MeltanoLabs/tap-hubspot](https://github.com/MeltanoLabs/tap-hubspot/tree/fca5b961fa059a4c92a58af979040f0c80a6a42f) | `fca5b961fa059a4c92a58af979040f0c80a6a42f` | Singer stream/state/catalog 参考 | Elastic-2.0 + legacy v1 pipeline + broad PII streams；reject reuse |

## 9. Verification Plan

### static-contract

- member refs、org/account/pipeline roster、API versions、common capability 和 projection mappings 自洽；
- provider IDs、taxonomies、histories、checkpoints 与 deletion surfaces 不合并；
- every commercial EvidenceSpan 有 Attribution；unknown/counterparty 不生成 subject-authored claim；
- `purchase-decision` 与 budget/payment/switching 分开；
- write/outreach/contact/activity capability 不在 Skills、ports 或 allowed effects；
- DataHandling、history/deletion/roster/process coverage 都是 release gate。

### fixture-conformance

| Scenario | 必须证明 |
| --- | --- |
| same offering in two CRMs | product subject 可关联；native opportunity/company/contact identity隔离 |
| pipeline label says Won but metadata open | 不按 label判断；mapping 保持 unknown/配置事实 |
| taxonomy changes after historical deal | 历史 revision引用当时 taxonomy；rebuild不改 raw facts |
| Salesforce field tracking disabled / HubSpot history gap | history partial/unknown，不补写完整 funnel |
| seller note quotes customer without source | counterparty-authored；禁止输出 direct quote |
| customer transcript exact span linked separately | 可标 subject-authored但仍保留 Rights/DataHandling |
| closed won amount, no invoice | purchase-decision，不产生 payment evidence |
| closed lost with competitor | switching candidate需原字段/span与 attribution，不把分类当事实 |
| multi-currency amounts | 无 conversion evidence不相加；bucket/FX revision可追溯 |
| Salesforce eventual miss + HubSpot 10K window | 各自 lookback/partition策略保持，不压成统一 cursor |
| soft delete/archive/restore | tombstone/correction/revision传播，旧 index不可检索 |
| migration mapping absent | 不用名称/email/amount进行跨 CRM join |
| one member auth/history failure | Channel partial/degraded；另一 member不遮蔽缺口 |
| attempted write/outreach/contact read | policy拒绝，零 platform-write |

### sandbox-live / operational-canary

必须先有成员各自的 read-only synthetic sandbox report，才能组合验证；不要求真实客户、联系人、金额或活动。canary 分 member 监测 docs/API version、OAuth/ECA/scopes、schema/taxonomy、rate/limits、lookback/10K、history/deletion/MCP drift，并额外监测 field policy coverage、attribution unknown rate、currency consistency、correction/index backlog 和 roster health。

## 10. 对现有抽象的结论

现有抽象已能复用：

- `NativeRevisionMetadata` + `SourceHistoryCoverage` 区分 snapshot、history、change event 与缺口；
- `Cursor`、`Page.Complete` 与 `CoverageAssessment` 分别表达 checkpoint、page 与 population；
- `SourceRepresentationMetadata` 区分 native API、report/export 和 manual extract；
- `DataHandlingMetadata` 处理 custom/sensitive field allowlist 与 required/applied；
- `DerivedFrom` 可绑定当时 pipeline taxonomy Observation，无需在 core 复制 stage schema；
- `Tombstone`、canonical revision 与 `Indexer.Remove` 支撑删除/restore/merge correction；
- `ChannelRosterRevision` 可版本化 org/account/pipeline/product mapping。

缺口是 `EvidenceSpan` 只定位 bytes，不说明谁在陈述。这个问题不只属于 CRM，也影响客服中的 customer message/agent note、评论中的 reviewer/developer reply。因而补平台无关的 `EvidenceAttribution`，只记录 subject/counterparty/provider/derived/unknown 与依据，不保存身份。同时新增 `EvidencePurchaseDecision`，避免把 CRM won/lost 错映成 payment。当前不新增通用 lifecycle struct：stage/outcome 仍是 schema-bound Channel projection，并通过 taxonomy observation 保持可追溯。

## 11. 晋级缺口

当前三个文件仅是 evidence-reviewed design。进入 `modeled` 需要 accepted member snapshots、共同 projection/attribution/data-handling/coverage schemas 与 org/pipeline roster；进入 `verified` 需成员 fixture reports、Channel conformance report，并经用户授权完成 read-only synthetic sandbox。CRM 写入和 sales outreach 继续拒绝，不随只读 Pack 晋级自动开放。
