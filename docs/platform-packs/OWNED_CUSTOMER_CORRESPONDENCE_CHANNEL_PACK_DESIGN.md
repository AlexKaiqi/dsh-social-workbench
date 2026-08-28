# Owned Customer Correspondence Channel Pack 设计

状态：researched 组合设计；成员未发布、未读取真实邮箱  
核验日期：2026-08-26  
Channel Pack ref：owned-customer-correspondence-demand/v0-design

## 1. 目标与第一性边界

邮件的价值不在“拥有大量文本”，而在一个已发生业务关系中的异步陈述、追问、反对、替代方案、承诺与结果。要成为需求证据，系统必须证明：这是哪个授权mailbox中的哪一份message revision、哪段是本次新写、谁的业务角色有何证据、上下文是否完整、是否允许用于此研究目的。

Gmail与Outlook不是统一email API。成员：[Gmail Correspondence](GMAIL_CORRESPONDENCE_PLATFORM_PACK_DESIGN.md) 与 [Microsoft Graph Mail Correspondence](MICROSOFT_GRAPH_MAIL_CORRESPONDENCE_PLATFORM_PACK_DESIGN.md)。Channel只统一研究策略，不合并message/thread identity、credential、scope、checkpoint或成熟度。

    authorized mailbox/folder-or-label roster + purpose
      -> metadata-only inventory and coverage
      -> policy-selected message body
      -> MIME/body representation and quote/forward segmentation
      -> participant/business-role review
      -> minimum exact evidence span
      -> demand signal with counter-evidence
      -> revision/deletion/retention/index propagation

## 2. Roster、identity 与 authority

| 字段 | 必须固定 |
| --- | --- |
| owner | exact tenant/account/mailbox、personal/shared/delegated、region/cloud |
| scope | allowed labels/folders、query/time window、excluded queues/categories |
| access | exact member Pack/API/scope/credential partition；metadata与body分开 |
| message identity | mailbox copy + member-native immutable ID/revision |
| relation | provider thread/conversation、transformed RFC references或reviewed migration ledger |
| participants | scope-local opaque refs、header roles、internal/external/unknown与business role evidence |
| content | MIME/body format、authored/quoted/forward/signature/notice/disclaimer/attachment role |
| lifecycle | draft/received/sent/trash/spam/delete、label/folder/move、retention/hold |
| sync | Gmail history/watch或Graph folder delta/subscription definition、watermark/reset/gap |
| handling | allowed fields/spans、sensitivity、retention、withdrawal/deletion/index invalidation |
| coverage | metadata vs body population、excluded folders/labels、sync gaps、parse/role unknown |

同一SMTP message在sender/recipient/shared/archive mailbox可产生多份mailbox copy；即使RFC Message-ID相同也不折叠原生records。它只允许same-message-as relation。Gmail threadId与Graph conversationId/index不跨平台对应；subject、timestamp、addresses、domain、body hash相似都不能自动thread/dedupe。

## 3. Evidence 与推断规则

| Source fact | 可形成的evidence | 禁止自动推断 |
| --- | --- | --- |
| reviewed authored-body + subject role mapping | subject-authored statement in exactmail context | 陈述为真、代表市场或授权外联 |
| quoted history | prior message corroboration candidate | 本message作者重新说了一次、额外计数 |
| forwarded content | forwarding party提供的第三方内容 | 原作者身份/同意、forwarder认可全部内容 |
| signature/disclaimer | document structure/policy context | 用户需求或正文 |
| automated notification/receipt | system/provider event | 人工意图、阅读或满意 |
| From/Sender/domain/folder | routing/header fact | customer/internal/company identity |
| no reply | response absence under known delivery/window | 没需求、拒绝或已解决 |
| thread/conversation grouping | provider relation | 完整业务case或跨平台同一thread |
| deletion/move/label change | lifecycle fact | 内容从所有副本/holds消失 |

EvidenceSpan必须绑定message ref/revision、MIME part、content role、extraction ref、author ref、Rights/DataHandling。quoted history若已由原message span收录，当前copy只建立relation，不再次增加频次。reply/forward parser有不确定性时保持content-role unknown并进入review。

## 4. 共同 capabilities 与 Skills

- correspondence.list.owned-message-metadata/v1
- correspondence.read.owned-message-body/v1
- correspondence.list.owned-message-changes/v1
- correspondence.receive.owned-mailbox-change/v1
- correspondence.read.owned-attachment-manifest/v1
- correspondence.observe.owned-message-deletion/v1

默认不含attachment bytes、contacts/directory、calendar、mailbox settings/delegates、draft/send/reply/forward、label/folder modify、move/delete、MCP broad tools或domain-wide/tenant-wide access。

### owned-correspondence-research/v1

研究官方ontology/API/auth/scope/sync/push/retention/terms、固定SDK/OSS/MCP/Skill；只生成Pack/roster/fixture proposal，不连接邮箱、创建watch/subscription或执行tool。

### owned-correspondence-acquire/v1

metadata-first；按member完成history/delta round，再对policy选中的message读取body。输出native Observation + CorrespondenceMessageMetadata + field/coverage；禁止natural-language MCP fallback、全邮箱body dump与participant enrichment。

### owned-correspondence-curate/v1

proposal-only：解析MIME、选择text representation、分离authored/quoted/forward/signature/disclaimer/automated，绑定exact author/context并提出最小EvidenceSpan。不得自动回复、修改mail或把未知sender升级为customer。

### owned-correspondence-conformance/v1

fixture-only、无网络验证identity/sync/content/authorship/privacy/deletion与零external effect；sandbox-live只在用户另行授权的synthetic mailbox。

## 5. DataHandling 与动态索引

- 全邮箱raw/full-text、地址簿、headers、URLs、tracking pixels、attachments、签名电话/职位、内部抄送与敏感标签默认不进入模型或索引。
- 先索引metadata-safe candidate，再由policy对最小authored spans建立purpose-bound全文/embedding materialization；view definition固定mailbox roster、message revisions、content roles、retention与allowed audience。
- 联系人地址/姓名/domain、RFC Message-ID和目录ID保持restricted或scope-local transformation；不建立跨平台person/company graph。
- HR/legal/security/finance/health、personal mailbox、private executive threads、spam/trash与broad shared mailbox默认exclude/quarantine，除非另有专门合法合规设计。
- move/relabel不是删除；delete/retention/withdrawal需级联blob、span、signal、opportunity、projection、embedding和export，并保留无正文审计receipt。
- email样本只代表进入selected mailbox且被保留/可读的通信；volume受客户规模、渠道偏好、automation、forward/quote重复、retention和员工习惯影响，不能当市场规模。

## 6. Verification Plan

| Fixture | 必须证明 |
| --- | --- |
| same subject/time/participants | 不自动thread或duplicate |
| same transformed RFC Message-ID across mailbox copies | 建relation但不折叠native records/rights |
| Gmail thread vs Graph conversation | member grouping保留，不跨平台等价 |
| new reply containing full quoted chain | authored span一次；quoted旧文不重复计数 |
| nested forward/signature/disclaimer/auto notice | content role分离；unknown fail closed |
| From differs Sender/Reply-To | participant roles分开，不猜作者/客户 |
| Gmail history 404 | full resync + coverage gap，不当no changes |
| Gmail watch duplicate/expire | notification hint + history reconcile |
| Graph default ID move | fixture暴露identity断裂 |
| Graph ImmutableId + folder move | same message relation，source/destination delta状态正确 |
| Graph delta/subscription missed/removed | complete round/repair后才推进coverage |
| metadata scope attempts body | policy/permission拒绝 |
| attachment/tracking/encrypted body | descriptor/quarantine，不取bytes/不绕过 |
| trash/delete/hold/other mailbox copy | lifecycle分别传播，不声称全局消失 |
| broad official Skill/MCP | read/write能力按policy拒绝，零external effect |

## 7. Go 抽象与晋级门

本轮只增加平台无关的direction、lifecycle、participant role/party、content role、message relation、CorrespondenceMessageMetadata和CorrespondenceSpanMetadata；Observation/SourceItemCandidate/EvidenceSpan可引用。正文、地址与附件仍在restricted schema-bound payload，没有mail client、credential或真实Connector。

两成员与Channel均为researched design。晋级需要accepted knowledge snapshots、mailbox roster、least-privilege metadata/body partitions、schemas、quote/forward extraction fixtures、sync reset/repair、field/retention/deletion profiles和fixture report。verified还需用户授权的synthetic Gmail/Outlook mailboxes；真实mail、server-side restricted data、domain/tenant-wide、watch/subscription配置、attachments、MCP或任何write均需另行明确授权。
