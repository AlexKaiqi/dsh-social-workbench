# Microsoft Graph Mail Correspondence Platform Pack 设计

状态：researched design；未发布、未注册 Entra app、未读取 mailbox  
核验日期：2026-08-26  
Pack ref：microsoft-graph-mail-owned-correspondence/v0-design

## 1. 定位与权威

本 Pack 只覆盖用户组织拥有并明确授权的 Microsoft 365/Outlook mailbox、mailFolder 与时间窗口。Graph/Exchange 是 mailbox copy、message/changeKey、folder、conversation grouping、delta和subscription state的权威；它不是客户身份、业务角色、邮件主张真伪或研究目的的权威。

message、mailFolder、conversationId、internetMessageId、attachment、delta state与change notification是不同概念。默认Graph message ID在移动folder时会改变；只有每次读取、delta与subscription都显式使用 Prefer: IdType=ImmutableId，才获得同一mailbox内移动稳定的ID。archive mailbox或export/reimport仍会改变immutable ID。

## 2. 稳定概念与 representation

| Concept | identity/revision | 关键语义 |
| --- | --- | --- |
| graph.mailbox/v1 | tenant + authorized user/mailbox | personal/shared/delegated与application access分开 |
| graph.mail-folder/v1 | mailbox + folder ID | delta checkpoint按folder独立；folder ID本身稳定 |
| graph.mail-message/v1 | mailbox + immutable message ID | changeKey/lastModified为可变state revision |
| graph.mail-conversation/v1 | mailbox + conversationId/index | provider grouping/order，不是跨平台thread |
| graph.internet-message/v1 | transformed RFC Message-ID | exact relation evidence；raw header默认restricted |
| graph.message-body/v1 | message revision + body representation | body/bodyPreview/uniqueBody语义分开 |
| graph.mail-attachment/v1 | mailbox + immutable attachment ID | descriptor默认；bytes与item/reference attachment分开 |
| graph.mail-delta/v1 | mailbox + folder + opaque deltaLink | 每folder一轮nextLink/deltaLink；移动/删除需reconcile |
| graph.mail-subscription/v1 | app+tenant+resource+revision | created/updated/deleted wake-up；会过期/被移除/漏通知 |

body可为HTML或text；uniqueBody是provider提取的本message独有部分，不是不可质疑的authorship truth。internetMessageHeaders需显式select，可能含network/custom app data，默认不采集。webLink与recipient/address也不进入canonical或telemetry。

官方依据：[Message resource](https://learn.microsoft.com/en-us/graph/api/resources/message?view=graph-rest-1.0)、[Message delta](https://learn.microsoft.com/en-us/graph/api/message-delta?view=graph-rest-1.0)、[Incremental changes](https://learn.microsoft.com/en-us/graph/delta-query-messages)、[Immutable IDs](https://learn.microsoft.com/en-us/graph/outlook-immutable-id)。

## 3. Capability proposal 与权限

| Capability | 当前资格 |
| --- | --- |
| correspondence.list.owned-message-metadata/v1 | eligible-design；Mail.ReadBasic，body/preview/uniqueBody/attachments/extensions明确不可读 |
| correspondence.read.owned-message-body/v1 | eligible-with-policy；Mail.Read，逐mailbox/folder/message allowlist |
| correspondence.list.owned-folder-delta/v1 | eligible-design；每folder独立round，ImmutableId header持续 |
| correspondence.receive.owned-mailbox-change/v1 | modeled；existing subscription receiver + delta backfill |
| correspondence.read.owned-attachment-manifest/v1 | modeled；Mail.Read后的descriptor allowlist，bytes默认拒绝 |
| correspondence.download.owned-attachment/v1 | deferred；malware/parser/rights/retention逐项授权 |
| graph.mail-subscription.configure/v1 | infrastructure write，deferred |
| graph.mail-draft/send/reply/forward/update/move/delete/v1 | rejected from acquisition Pack |

Mail.ReadBasic是metadata-first route，明确不含body、bodyPreview、uniqueBody、attachments、extensions与extended properties；Mail.Read才允许正文。Mail.ReadWrite不包含send但仍可创建/修改/删除mail，Mail.Send另有真实外发效果，二者都不得进入read connection。application Mail.Read可能覆盖全tenant mailbox，必须以Exchange application access policy/受控mailbox roster收窄；shared/delegated delegated scopes可读，但不支持对应change notification，通知需application permission，不能暗中升级。

官方依据：[Permissions reference](https://learn.microsoft.com/en-us/graph/permissions-reference)、[Shared/delegated folders](https://learn.microsoft.com/en-us/graph/outlook-share-messages-folders)。

## 4. Delta、move 与 notifications

delta只跟踪指定folder中的added/deleted/updated messages。一个完整round可能有多个nextLink，最终deltaLink才是可提交checkpoint；URL/token必须opaque原样保存。folder roster、select与ID preference改变时生成新sync definition。使用ImmutableId后同mailbox folder move不改变message identity，但source/destination folder delta仍分别产生removal/addition state；archive/reimport需要新identity relation而非覆盖。

Outlook message subscription最长不足7天；rich notification不足1天。basic notification以clientState验证后pull，rich payload还需certificate解密与validation token验证。reauthorizationRequired、subscriptionRemoved和missed lifecycle event必须驱动renew/recreate + delta repair；通知成功不代表delta完整。subscription创建/更新/删除是外部基础设施写，与receiver local write分开。

官方依据：[Outlook change notifications](https://learn.microsoft.com/en-us/graph/outlook-change-notifications-overview)、[Rich resource data](https://learn.microsoft.com/en-us/graph/change-notifications-with-resource-data)、[Subscription lifetime](https://learn.microsoft.com/en-us/graph/api/resources/subscription?view=graph-rest-1.0)、[Lifecycle events](https://learn.microsoft.com/en-us/graph/change-notifications-lifecycle-events)。

## 5. Evidence 与 DataHandling

- direction只相对accepted owned-mailbox roster计算；From/Sender、recipient、domain、folder或Sent Items均不能独自证明作者、客户或internal/external。
- body、uniqueBody与本地quote parser结果是三种representation；EvidenceSpan固定message revision、part/content role、extraction ref与author mapping。
- quoted history、forward、signature、disclaimer、calendar/event message和automated notification不当作new authored customer statement。
- conversationId/index只保留provider grouping；跨mailbox/平台duplicate需scope-local transformed internetMessageId或reviewed migration ledger。
- sensitivity/retention/hold、shared mailbox、IRM/encryption、attachments、headers、addresses、webLink与extensions默认restrict/quarantine；不可解密内容不尝试绕过。
- soft delete、Deleted Items、recoverable items、retention/hold与hard deletion是不同事实；Graph delta removal需结合folder/retention evidence后再传播tombstone。

## 6. OSS、SDK、MCP 与 Skills

| Artifact | 固定版本 | 结论 |
| --- | --- | --- |
| [microsoftgraph/msgraph-sdk-go](https://github.com/microsoftgraph/msgraph-sdk-go/tree/f5879658dcd13022a994b6839484469213f57fb5) | v1.99.0，commit f587965…，MIT | official generated client/schema reference；完整Graph读写面过宽，不直接嵌入 |
| [microsoft/mcp](https://github.com/microsoft/mcp/tree/2c6a6cd9ed5599cd00c23074d6d60fae199122f7) | commit 2c6a6cd…，MIT catalog | Microsoft 365 Mail remote MCP支持create/send/reply/update/delete/search；高影响宽面，只作tool taxonomy与拒绝fixture |

固定Airbyte commit未发现source-microsoft-outlook成员，因此不借用其他Microsoft connector声称mail coverage。本轮未确认Microsoft维护的repo-owned、只读mail research Skill；官方remote MCP的自然语言search/write面不能替代Mail.ReadBasic/Mail.Read、ImmutableId、folder delta与field policy。候选均未安装、连接或执行。

## 7. Verification 与晋级

fixtures覆盖：default ID move变化、ImmutableId每请求/header/subscription/delta、archive/reimport identity change、folder-scoped delta multi-page/full round、move source delete+destination add、changeKey update、Mail.ReadBasic body/attachment拒绝、Mail.Read allowlist、uniqueBody/quoted parser分歧、conversation false merge、shared/delegated read但push不支持、application scope roster、basic/rich validation、renew/reauthorize/subscriptionRemoved/missed、soft/hard delete/recoverable/hold、HTML/tracking/attachment quarantine和MCP/write拒绝。

进入modeled需要accepted Graph/cloud/permission snapshot、mailbox/folder roster、message/delta/subscription schemas、body extraction/field/deletion policy与fixtures。verified需要用户授权的synthetic mailbox，证明metadata-first、人工body样本、folder move/delta和notification repair；真实客户mailbox、application tenant read、shared/delegated、attachment bytes、MCP与全部写入另行授权。
