# Owned Customer Conversation Channel Pack 设计

状态：researched 组合设计；成员 Pack 均未发布、未调用  
核验日期：2026-08-26  
Channel Pack ref：owned-customer-conversation-demand/v0-design

## 1. 目标与边界

经授权的访谈、销售通话、可用性测试、客服电话和研究会话能提供最接近上下文的 subject statement：谁在什么任务/决策中遇到什么困难、用了哪些替代方案、为什么重要。但会议不是天然可靠的“用户原话库”：录音同意、样本选择、提问诱导、speaker mapping、ASR/diarization、剪辑、平台派生摘要和删除策略都会改变证据含义。

    research question + authorized purpose
      -> exact owned conversation roster + consent/handling policy
      -> member-native meeting/call/artifact revisions
      -> speaker mapping + transcript completeness/redaction
      -> minimum exact spans (not whole-meeting copy)
      -> authorship review + counter-evidence
      -> signal/problem synthesis
      -> deletion/withdrawal/revision propagation

首批成员：[Zoom Cloud Conversation](ZOOM_CLOUD_CONVERSATION_PLATFORM_PACK_DESIGN.md) 与 [Gong Conversation Intelligence](GONG_CONVERSATION_INTELLIGENCE_PLATFORM_PACK_DESIGN.md)。Microsoft Teams 保留为 next member：Microsoft Graph 的 transcript/recording 与 meeting-specific RSC 有价值，但 private chat/channel/ad-hoc call 等 surface 仍混有 beta、tenant transcription setting 403 和 subscription timing 约束；未完成 exact v1/beta/account policy review 前不继承本 Pack 成熟度。

## 2. Channel Roster 与 representation identity

成员是一份 conversation representation，而不是一个人、一家公司或模糊的 meeting title。

| 字段 | 必须固定 |
| --- | --- |
| owner/surface | exact tenant/account/workspace/region/edition 与授权 purpose |
| occurrence | member-native meeting UUID/call ID、scheduled/actual window、time zone |
| relation | imported-from/same-occurrence-as 的 exact native external ref 或用户确认 ledger；禁止 fuzzy title/time/participants dedupe |
| artifacts | audio/video/transcript/chat/summary/topics/trackers/scorecard/action items 各自 ref、role、revision、status |
| transcript | origin、language、ASR/model、edited/human reviewed、timestamp basis、coverage/gaps/redaction |
| speaker | call-local speaker ref、participant ref、attribution method/evidence；身份值不进入共享层 |
| participant role | subject/interviewer/customer/vendor/moderator/observer/unknown 与 internal/external/unknown 分开 |
| consent | notice/consent report/purpose/withdrawal evidence；法律充分性单独 review |
| handling | allowed spans、raw media/participant/CRM/chat field policy、retention/deletion propagation |
| coverage | recording/transcript readiness、partial/trimmed/missing、speaker unknown、excluded private/restricted population |

同一 Zoom meeting 被 Gong 导入后，两个 member 可关联但不得折叠：Zoom transcript 可能是 Zoom ASR/current edited VTT；Gong transcript 可能是 Gong ASR/diarization/redaction/enrichment。两者对同一句话的 wording、speaker 和 timestamp 发生分歧时，保留两份 representation、差异与 evidence，不选一个“全局真相”。

## 3. Evidence 与推断规则

| Source fact | 可形成的 evidence | 禁止自动推断 |
| --- | --- | --- |
| exact transcript span + reviewed subject mapping | subject-authored statement under conversation context | 陈述为客观真相、普遍需求或愿付价格 |
| unknown/diarized speaker span | unattributed statement / review queue | customer quote、identity、internal/external role |
| interviewer/salesperson paraphrase | counterparty-authored note/question | 用户原话或确认 |
| silence、overlap、gap、trim | coverage/quality fact | 同意、反对、无痛点或“没说过” |
| platform topic/tracker hit | provider-derived match under exact definition | 语义正确、意向、痛点严重度 |
| summary/action item/AI score | derived proposal under model/revision | direct quote、用户承诺或事实 |
| human scorecard/note | counterparty assessment | subject-authored evidence |
| recording/consent report | platform policy/participant action evidence | downstream research/AI use 法律充分性 |
| no accessible private/restricted transcript | excluded/unknown coverage | conversation 不存在或没有信号 |

EvidenceSpan 必须绑定 conversation ref、artifact ref/revision、time locator、speaker ref、attribution method、transcript origin/language、Rights/DataHandling。引用文本变化时新 span revision/supersession，不让 current transcript 覆盖旧证据。只有 exact participant-role evidence 才能把 authorship 设为 subject；internal/external 或账号映射不足时保持 unknown。

## 4. 共同 capabilities 与 Skills

共同 read proposal：

- conversation.list.owned-occurrences/v1
- conversation.read.owned-transcript/v1
- conversation.read.owned-artifact-manifest/v1
- conversation.read.owned-derived-analysis/v1
- conversation.receive.owned-artifact-ready/v1
- conversation.observe.owned-deletion-and-revision/v1

共同默认不含 raw media download、bot join/record、schedule、share、comment、tracker/scorecard config、CRM write、private/restricted access 或 delete。

### owned-customer-conversation-research/v1

研究官方 ontology/API/auth/scope/webhook/export/retention/consent、固定 OSS/MCP/Skill；生成 Pack/roster/fixture proposal。不得安装、连接、创建 app/subscription、加入会议或读取真实 transcript。

### owned-customer-conversation-acquire/v1

按 member resolve deterministic least-privilege read route；先取 occurrence/artifact manifest，再按 policy 读取 transcript；只输出 native observation + ConversationDatasetMetadata + field handling/coverage。禁止自然语言 MCP fallback、raw media 自动下载、identity enrichment 和跨平台 fuzzy join。

### owned-customer-conversation-curate/v1

proposal-only：对 transcript revision 做 cue normalization、speaker-role review、最小 span selection、question/context linkage、authorship 与 counter-evidence 评估；derived summary/topic/tracker/scorecard 只能生成带 source links 的候选，不能覆盖原文或自动发布需求结论。

### owned-customer-conversation-conformance/v1

默认 fixture-only、无网络：验证 representation relation、artifact revision、speaker/role、ASR gaps、derived separation、consent/handling、deletion/withdrawal 和零平台副作用。sandbox-live 需用户另行授权，且只读 synthetic conversations。

## 5. 数据、隐私与生命周期

- 默认不获取 audio/video；仅保存 descriptor 与最小 transcript spans。完整 transcript 也属于 restricted payload，不自动进知识快照或全文搜索。
- speaker/participant refs 只在 scope + conversation/member 中稳定；姓名、邮箱、电话、voiceprint、CRM/contact ID、meeting URL/token 全部留在 restricted payload 或 drop。
- consent for recording、research analysis、model training、recontact 和跨系统 join 是不同目的；notice-only/unknown 不升级为 granted。
- participant withdrawal、provider redaction、artifact edit/regeneration、retention expiration 与 delete 需级联到 canonical item、EvidenceSpan、Signal、Opportunity、index/materialization 和 export；仅保留无正文审计/tombstone。
- 全文/embedding index 只对 authorized minimal spans 动态物化，view definition 固定 allowed purposes、artifact revisions 和 retention filter；撤回/删除触发增量 invalidation，而不是等下一次重建。
- 聚合 topic/need count 必须报告 meeting population、accessible transcript population、excluded private/restricted、speaker unknown、coverage gaps 与抽样来源；不能把销售团队录了多少电话当市场规模。

## 6. 跨成员映射

| Channel semantic | Zoom | Gong | 投影规则 |
| --- | --- | --- | --- |
| occurrence | meeting instance UUID | call ID | exact relation ledger 才可关联，不合并 native IDs |
| transcript | recording transcript file/VTT | speaker segments/sentences | 各自 revision/origin/coverage；差异并存 |
| speaker | VTT label + participant/consent report | speaker/participant IDs | scope-local mapping；unknown 优先于猜测 |
| raw artifact | cloud recording file | media descriptor/URL | manifest by default；bytes 独立 capability |
| derived | smart recording summary/highlights/actions | topics/trackers/summary/scorecards | provider-generated artifact，definition/model/version 固定 |
| privacy | disclaimer/consent report/sharing/retention | consent profile/private/redaction/retention | policy evidence，不做统一 legal verdict |
| deletion | recording/transcript delete/trash/retention | call delete/redaction/retention | member tombstone 分别传播，relation 不替代状态 |

## 7. Verification Plan

### static-contract / fixture-conformance

| Fixture | 必须证明 |
| --- | --- |
| same Zoom meeting imported into Gong + exact external relation | 两 representations 关联但不折叠；各自 transcript/revision 保留 |
| same title/time/participants without exact relation | 不去重、不跨平台 identity join |
| Zoom/Gong wording 或 speaker 冲突 | 保存 divergence；不任选真值、不伪造 quote |
| diarization-only/unknown speaker | authorship unknown，不能成为 customer quote |
| speaker mapping later human-reviewed | 新 attribution assessment；旧 evidence audit 可追溯 |
| transcript edit/regeneration/language change | 新 artifact revision；旧 spans 不静默改写 |
| recording ready before transcript | 独立 watermark；transcript pending，不判 missing forever |
| overlap/gap/silence/trim/partial | coverage 显式；不从缺失推断态度 |
| summary/topic/tracker/AI score contradicts source | derived artifact 降级/反例，原文不被覆盖 |
| webhook duplicate/out-of-order | durable idempotent + pull reconcile |
| consent declined/withdrawn/unknown | restrict/delete/supersede；不形成普通可用 evidence |
| Gong private still counted in metrics | denominator/exclusion 明确，不声称完整正文覆盖 |
| provider redaction + downstream copy | 不恢复，span/index/export 级联 invalidation |
| member deletion/retention expiration | tombstone 传播；cross-member representation 独立处理 |
| Teams Pack absent/deferred | roster 不自动扩面，capability resolution fail closed |
| hosted/community MCP broad query | policy 拒绝，不绕过 raw/derived、scope、field 和 revision contract |

### sandbox-live / operational-canary

经用户授权后，用无真实客户的 synthetic Zoom occurrence 与 Gong call 验证 read-only list/manifest/transcript、exact manual relation、speaker unknown/reviewed、revision 与删除传播；不启动录音、bot、media download、MCP 或配置写。Canary 监测 Pack/API/scope drift、artifact readiness、transcript revision/language、speaker unknown、ASR gap、derived definition/model、private/excluded coverage、consent/retention/delete、PII quarantine、index invalidation 与零未授权外部 effect。

## 8. Go 抽象影响与晋级缺口

本轮只新增平台无关静态契约：conversation kind、artifact role、transcript origin、processing state、speaker attribution、participant role/party、consent record、artifact/transcript metadata、cross-representation relation、dataset metadata 与 span metadata；Observation/SourceItemCandidate/EvidenceSpan 可引用它们。原始内容、身份和 provider schema 仍在 restricted schema-bound payload，没有 Zoom/Gong client、credential、SDK 或真实 Connector。

成员仍为 researched design。晋级需要 accepted member knowledge snapshots、exact read scopes、immutable schemas/fixtures、consent/field/retention/deletion profiles、cross-representation relation ledger 和 fixture report；verified 还需用户授权的 synthetic read-only sandbox、revision/redaction/delete drill 与 operational owner。任何真实客户 transcript、media、MCP、bot/recording 或平台写需另行明确授权。
