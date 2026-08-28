# Microsoft Teams Conversation Platform Pack 设计

状态：researched / documentation-conflict design；未发布、未注册 Entra app、未调用 Graph  
核验日期：2026-08-26  
Pack ref：microsoft-teams-owned-conversation/v0-design

## 1. 定位与权威

本 Pack 只覆盖组织拥有并明确授权的 Microsoft 365 tenant 中，calendar-backed Teams online meeting 的 transcript/recording manifest；ad-hoc call、private chat/channel/private-channel meeting、tenant-wide与 app-installed surfaces 分别建模。Teams/Graph 是 onlineMeeting、callTranscript、callRecording、content correlation、tenant policy 与 OneDrive/SharePoint storage state 的权威；它不是 speaker 业务角色、研究同意充分性或需求结论的权威。

onlineMeeting、calendar event、meeting occurrence、ad-hoc call、callRecord diagnostics、callTranscript、callRecording、OneDrive/SharePoint file 不是一个对象。callRecord 只提供通话质量/使用诊断，生成后可更新且通常仅可访问 30 天；它不能替代 transcript 或 recording identity。

## 2. 版本与 surface 冲突

2026-08-26 的 Graph v1.0 callTranscript/callRecording 页面描述 scheduled onlineMeeting 与 ad-hoc call，并列出对应权限；Teams platform overview 同时仍写明 private chat meeting、channel meeting 与 ad-hoc call 只在 beta 支持。beta 页面还提示：同一 channel post thread 下安排多个 meeting 时可能无法返回 transcript，private channel meeting 不支持。

因此 Pack 不把“Graph v1.0”当单一成熟度：

| Surface | 当前 adoption |
| --- | --- |
| calendar-backed scheduled onlineMeeting、exact user path | eligible-design，但需 fixture + live 证明 |
| meeting-specific RSC private chat meeting | modeled；仅 Read.Chat，非 channel meeting |
| channel/private-channel meeting | documentation-conflict / blocked |
| ad-hoc PSTN/1:1/group call | documentation-conflict / blocked |
| tenant/user/app-scoped getAll/delta | modeled；高覆盖权限与 subscription timing 单独验证 |
| create onlineMeeting API 但未关联 calendar event | rejected as transcript source；官方明确不支持 |
| live events | unsupported |

官方依据：[Teams transcript/recording overview](https://learn.microsoft.com/en-us/microsoftteams/platform/graph-api/meeting-transcripts/overview-transcripts)、[Get callTranscript v1.0](https://learn.microsoft.com/en-us/graph/api/calltranscript-get?view=graph-rest-1.0)、[callTranscript resource](https://learn.microsoft.com/en-us/graph/api/resources/calltranscript?view=graph-rest-1.0)、[Get callRecording](https://learn.microsoft.com/en-us/graph/api/callrecording-get?view=graph-rest-1.0)、[callRecording resource](https://learn.microsoft.com/en-us/graph/api/resources/callrecording?view=graph-rest-1.0)。

## 3. 概念与 capability

| Concept | identity/revision | 语义 |
| --- | --- | --- |
| teams.online-meeting/v1 | tenant + organizer user + onlineMeeting ID | calendar-backed scheduled definition/occurrence context |
| teams.ad-hoc-call/v1 | tenant + call ID | 无 meeting ID 的 spontaneous call；当前 blocked |
| teams.call-transcript/v1 | meeting/call + transcript ID + observed revision | metadata、VTT或unattributed timestamped text |
| teams.call-recording/v1 | meeting/call + recording ID + observed revision | metadata/MP4 bytes；bytes默认不获取 |
| teams.content-correlation/v1 | contentCorrelationId | transcript 与 recording 的平台 exact relation |
| teams.call-record/v1 | call ID + version | 诊断 record；结束后生成、可更新、30-day access |
| teams.storage-artifact/v1 | OneDrive/SharePoint item + revision | recording/transcript retention、permissions、move/copy影响 |
| teams.tenant-transcript-policy/v1 | tenant + observed policy revision | Graph transcript access 与 speaker attribution 两个独立开关 |

| Capability | 当前资格 |
| --- | --- |
| conversation.list.owned-meeting-transcripts/v1 | eligible-design：calendar-backed、user/organizer bounded、delta/getAll token原样保存 |
| conversation.read.owned-transcript/v1 | eligible-design：metadata + exact Accept format；attributed失败时可显式降级unattributed |
| conversation.read.owned-recording-manifest/v1 | modeled：metadata only；metering、national cloud、meeting expiry记录 |
| conversation.receive.owned-artifact-ready/v1 | modeled：既有subscription receiver；notification不是完整truth |
| conversation.read.owned-call-diagnostics/v1 | deferred：CallRecords.Read.All广权限且不是需求正文 |
| conversation.download.owned-recording-media/v1 | deferred：metered sensitive bytes、storage rights与retention |
| meeting/chat/channel/bot/write/delete capabilities | rejected from acquisition Pack |

## 4. 权限、tenant controls 与 notification

online meeting transcript 最小 delegated permission 为 OnlineMeetingTranscript.Read.All；application 可用同名权限，meeting-specific private chat RSC 为 OnlineMeetingTranscript.Read.Chat，不能用于 channel meeting。application path 还需要 tenant admin 的 application access policy 并绑定具体 user path。recording 使用独立 OnlineMeetingRecording permissions；ad-hoc call 使用独立 CallTranscripts/CallRecordings permissions，不得共享成 generic Teams token。

tenant admin 有两个独立控制：Graph transcript access 关闭时 metadata、metadataContent、content 全部返回 403 / GraphAccessToTranscriptsDisabled；speaker attribution 关闭时 text/vtt 返回 403 / SpeakerAttributionNotAllowed，但 application/vnd.microsoft.graph.transcript+text 可返回无 speaker 的时间戳文本。Connector 必须按 innerError.code 分支，不能解析易变 message，也不能把 unattributed fallback 升级为 customer quote。

change notification 有以下非直觉约束：

- meeting-specific transcript subscription 必须在 transcription 开始前创建，否则该 transcript 不会发通知；
- expiration 超过一小时必须有 lifecycleNotificationUrl；transcript/recording subscription 最大生命周期与 rich notification 生命周期不同；
- includeResourceData 需 encryption certificate；否则 notification 只给 resource identity，再 pull；
- subscription create/renew/delete 是平台基础设施写，receiver 本身只是本地写；
- push 不能替代 organizer delta/getAll backfill；subscription late/expired/reauthorized 必须显式 coverage gap。

官方依据：[Transcript/recording change notifications](https://learn.microsoft.com/en-us/graph/teams-changenotifications-callrecording-and-calltranscript)、[call record notifications](https://learn.microsoft.com/en-us/graph/changenotifications-for-callrecords)、[call records](https://learn.microsoft.com/en-us/graph/cloud-communications-callrecords)。

## 5. Transcript、storage 与 DataHandling

默认 text/vtt 含时间戳与 voice speaker tags；unattributed media type 只含时间戳文本。speaker tag 是 provider attribution，不是 identity/business role。metadataContent、organizer identity、participant data、join URLs、content URLs 与 OneDrive/SharePoint IDs 默认 restricted；共享层只保存 scope-local opaque refs。

recording/transcript 文件位于 organizer OneDrive 或 channel SharePoint，并继承对应文件权限；move/copy 可能影响 captions/关联。Teams auto-expiration、OneDrive/SharePoint deletion、Purview retention/hold 与 Graph meeting expiry是不同 lifecycle。删除一个 API-visible artifact 不证明合规副本已消失；反之 hold 保留也不授权继续用于需求分析。[Storage and permissions](https://learn.microsoft.com/en-us/MicrosoftTeams/tmr-meeting-recording-change)、[Recording policies](https://learn.microsoft.com/en-us/microsoftteams/meeting-recording)。

## 6. OSS、MCP 与 Skills

| Artifact | 固定版本 | 结论 |
| --- | --- | --- |
| [microsoftgraph/msgraph-sdk-go](https://github.com/microsoftgraph/msgraph-sdk-go/tree/f5879658dcd13022a994b6839484469213f57fb5) | v1.99.0，commit f587965…，MIT | official generated client/schema reference；完整 Graph 面过宽，不直接嵌入 |
| [microsoftgraph/microsoft-graph-docs-contrib](https://github.com/microsoftgraph/microsoft-graph-docs-contrib/tree/47f65201686d5808169e2460de88b85011bea5e6) | commit 47f6520… | official docs source；固定 v1/beta diff 与 fixtures，文档许可需按 path review |
| [microsoft/mcp](https://github.com/microsoft/mcp/tree/2c6a6cd9ed5599cd00c23074d6d60fae199122f7) | commit 2c6a6cd…，MIT catalog | 官方 Teams/Work IQ 等 remote MCP目录；broad delegated tools，不证明 transcript raw contract |
| [airbyte source-microsoft-teams](https://github.com/airbytehq/airbyte/tree/1339a9ecca6f8fb547ffb7b19665d6980c069026/airbyte-integrations/connectors/source-microsoft-teams) | 1.2.28，alpha/community，ELv2 | general Teams replication/state 负样本；未证明 transcript/RSC/tenant-control契约，拒绝直接复用 |

本轮未确认 Microsoft 维护的 repo-owned meeting-transcript Agent Skill。官方 Teams MCP/Agent 365 remote surface 与 Graph transcript API 是不同产品面；不得用自然语言 tools 绕过 exact meeting/user scope、RSC、speaker policy、artifact revision或field handling。候选均未安装或执行。

## 7. Verification 与晋级

fixtures 必须覆盖：calendar-backed vs standalone onlineMeeting、meeting/user path identity、v1/beta schema conflict、private/channel/private-channel/ad-hoc matrix、classic vs RSC permissions、application access policy absent、GraphAccessToTranscriptsDisabled、SpeakerAttributionNotAllowed→unattributed fallback、VTT/metadataContent、contentCorrelationId、subscription-before-transcription、late/missed/expired/reauthorized subscription、lifecycle notification、encrypted resource data、delta nextLink/deltaLink、callRecord version/30-day expiry、meeting expiry、national cloud、metering、OneDrive/SharePoint move/delete/retention/hold和 media/MCP/write拒绝。

进入 modeled 需要 accepted exact v1/beta/tenant/cloud snapshot、schemas、permission/policy matrix 与 immutable fixtures；进入 verified 需要用户授权的 synthetic tenant、calendar-backed meeting、read-only transcript test和 late-subscription/backfill drill。文档冲突未消除前，channel/private-channel/ad-hoc保持 blocked；recording bytes、bots、calls/chat/channel writes、subscription configuration和deletion均需另行授权。
