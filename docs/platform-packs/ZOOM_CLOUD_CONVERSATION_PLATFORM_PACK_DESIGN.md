# Zoom Cloud Conversation Platform Pack 设计

状态：researched design；未发布、未连接、未调用 Zoom API  
核验日期：2026-08-26  
Pack ref：zoom-owned-cloud-conversation/v0-design

## 1. 定位与事实权威

本 Pack 只覆盖用户组织拥有并明确授权的 Zoom account 中，已经发生且已进入 Cloud Recording 流程的 meeting/webinar 产物：meeting instance、recording file、audio transcript、participant/consent report、chat 与 Smart Recording 派生物。Zoom 是其原生 meeting/recording/transcript revision、处理状态、共享限制和账号策略的权威；它不是研究目的、说话人业务角色、法律同意充分性或用户痛点结论的权威。

scheduled meeting、实际 occurrence、recurring meeting 的 instance、meeting UUID、recording、recording file、transcript 与 smart recording 不是一个对象。meeting ID 可重用；past instance/UUID 与 account scope 必须进入 identity。禁止按标题、日历时间或参会者相似度合并会议。

## 2. 稳定概念与版本边界

| Concept | identity / revision | 关键语义 |
| --- | --- | --- |
| zoom.meeting/v1 | account + meeting ID | 可变的 scheduled definition；不是一次实际通话 |
| zoom.meeting-instance/v1 | account + occurrence UUID | 一次实际 occurrence；scheduled 与 actual window 分开 |
| zoom.cloud-recording/v1 | occurrence UUID + recording set | 处理中的 recording 集合，不保证 transcript 同时 ready |
| zoom.recording-file/v1 | recording file ID | audio/video/chat/transcript 等各自 media/type/status |
| zoom.audio-transcript/v1 | transcript file ID + observed revision | VTT，可被编辑、换语言或重新生成；current view 不是 immutable original |
| zoom.participant-report/v1 | occurrence + report revision | 参会/身份映射证据；不等于转写 speaker 必然正确 |
| zoom.recording-consent-report/v1 | occurrence + report revision | 平台记录的 notice/acceptance 证据；不是法律结论 |
| zoom.smart-recording-artifact/v1 | occurrence + artifact type + revision | summary/highlight/chapter/action item/coach metric；provider-derived 且可编辑 |
| zoom.recording-sharing-policy/v1 | recording + observed policy revision | can_download、authentication、viewer transcript/chat visibility 等；不是采集授权 |

Zoom 自动转写处理可能晚于 recording completed；编辑 transcript、切换语言重新生成、trim recording、恢复 original、auto-delete 与 retention/WORM 均会改变可见 representation。每次读取必须固定 artifact ID、revision evidence、processing state、language、edited/redaction state 和 coverage，不能只存 moving download URL。

官方依据：[Meeting APIs](https://developers.zoom.us/docs/api/meetings/)、[Webhooks](https://developers.zoom.us/docs/api/webhooks/)、[granular OAuth scopes](https://developers.zoom.us/docs/integrations/oauth-scopes-granular/)、[Audio transcription](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0064927)、[recording consent](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0068402)、[recording disclaimer](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0068228)。

## 3. Capability proposal

| Capability | effect | 当前资格 |
| --- | --- | --- |
| conversation.list.owned-meetings/v1 | none/local fact | eligible-design；account + actual window + past instance identity |
| conversation.read.owned-transcript/v1 | none/local fact | eligible-design；cloud_recording:read:meeting_transcript 或 exact admin variant；VTT revision/lag/coverage |
| conversation.read.owned-recording-manifest/v1 | none/local descriptor | eligible-design；只取 file descriptors/status/restrictions，默认不下载 media bytes |
| conversation.read.owned-participant-report/v1 | restricted local fact | eligible-with-policy；scope-local opaque participant refs，最小字段 |
| conversation.read.owned-consent-report/v1 | restricted policy evidence | eligible-with-policy；只用于 consent record，不能推导法律充分性 |
| conversation.read.owned-derived-summary/v1 | provider-derived fact | modeled；summary/chapter/action item/coach metric 与 transcript 分开 |
| conversation.receive.owned-artifact-ready/v1 | local durable write | modeled；recording.completed 只是 wake-up，pull 后确认每个 artifact ready |
| conversation.download.owned-recording-media/v1 | sensitive byte acquisition | deferred；逐 artifact approval、短 retention、media security 与删除传播 |
| meeting.create-or-update/v1 | platform scheduling write | rejected from acquisition Pack |
| recording.start-or-bot-join/v1 | participant-visible recording effect | rejected；不是 Connector/read 测试手段 |
| recording.share-delete/v1 | visibility/destructive write | rejected；独立治理流程 |

默认 connection 只申请 transcript 与必要的 meeting/recording metadata read scope。user-level 与 admin-level scopes 不可互换；不得因 admin token 可用就枚举全账号。OAuth access token 只放 Authorization header；credential、download token、signed URL 不进入日志、知识快照或 canonical URL。

Webhook subscription 的创建/修改是独立平台写；本 Pack 仅建模既有 subscription 的 receiver。delivery 必须验签、以 delivery/event identity 去重、durable-before-ack，并在 3 秒内返回成功响应；事件不携带完整 artifact truth，必须由最小 pull route 对账。

## 4. Transcript、speaker 与同意边界

- VTT cue 是 time-coded provider ASR representation；speaker label 需单独记录 provider-account、participant report、channel separation、diarization、human-reviewed 或 unknown attribution method。
- subject/customer/internal/external 是研究映射，不由 display name、email domain、host/guest 或 Zoom user status 自动推断。无法证实时必须保持 unknown。
- participant notification、audio prompt、consent report 与 disclaimer setting 是平台事实。组织的数据处理目的、合法基础、地域要求、录音后 AI 分析与长期保留仍需独立 policy review。
- transcript edit/regeneration 产生新 revision；旧 EvidenceSpan 继续绑定旧 artifact revision，不能让 current transcript 静默改写引用。
- recording ready、transcript ready、smart summary ready 是不同 watermark。缺 transcript、trimmed media、processing failure、语言切换和 cue gaps 都进入 ResultCoverage。
- Smart Recording summary/highlights/action items/coach metrics 为 provider-generated/derived；即使与原文一致，也不能标成 subject-authored quote。

## 5. DataHandling、retention 与 deletion

默认保留 manifest + reviewed transcript spans；原始 audio/video、完整 chat、participant names/emails、IP/device、registration、phone details 和 download URLs 默认 restrict/drop。只有与研究问题直接相关且经授权的 transcript selectors 才进入 restricted payload，canonical evidence 优先保存最小 span，而非整场复制。

auto-delete、trash grace、account retention/WORM、host 删除、trim/restore 和 sharing policy 都是不同状态。删除/撤回发生时，tombstone 必须传播到 transcript bytes、EvidenceSpan、signal、projection、materialized index 和导出；“当前 API 404”不能自动判定永久删除，需结合 policy/event/reconciliation evidence。

## 6. OSS、官方 MCP 与 Skills 审计

| Artifact | 固定版本 | 许可/用途 | 结论 |
| --- | --- | --- | --- |
| [zoom/skills](https://github.com/zoom/skills/tree/1858eadc17d9bd0d1279ce7f66304362a774e3b4) | commit 1858ead… | MIT；REST/webhook/MCP/Meeting SDK Bot 等官方 Skills | research/schema methodology only；surface 过宽且含 bot/write，不安装、不执行 |
| [zoom/mcp-registry](https://github.com/zoom/mcp-registry/tree/25347a5f3d2246fc443ddb19bbd1c10371a96872) | commit 25347a… | MIT registry；官方 Meetings MCP | hosted MCP 可检索 meeting/recording/transcript/summary 等，但授权面与返回语义需独立验证；不能替代 deterministic least-privilege route |
| [airbytehq/airbyte/source-zoom](https://github.com/airbytehq/airbyte/tree/1339a9ecca6f8fb547ffb7b19665d6980c069026/airbyte-integrations/connectors/source-zoom) | commit 1339a9e…，metadata 1.2.61 | ELv2 declarative source；meeting/webinar/report 等广面复制 | pagination/state/negative fixture reference；未证明本 Pack 的 transcript/revision/consent contract，拒绝直接复用 |

官方 Zoom MCP 与 Skills 是能力研究输入，不是 Pack executor。任何 natural-language tool 都不得绕过 connection scope、field allowlist、artifact revision、consent、download、retention 或 deletion policy。以上项目均未安装、构建或执行。

## 7. Verification Plan

static/fixture 必须覆盖：meeting ID 重用、recurring occurrence UUID、scheduled/actual mismatch、recording completed 但 transcript pending、webhook duplicate/out-of-order/invalid signature、VTT overlap/gap/unknown speaker、多语言、transcript edit/regeneration、trim/restore、smart summary 与原文冲突、participant mapping unknown、consent accepted/declined/unknown、internal disclaimer disabled、user/admin scope confusion、download URL/token leakage、retention/WORM/trash、delete propagation、429/retry 和 broad MCP policy refusal。

sandbox-live 仅在用户授权的 synthetic account/meeting 中读取预先人工产生的 recording/transcript；不自动创建会议、启动录音、加入 bot、修改 subscription、sharing 或 retention。Operational canary 监测 API/scope、artifact processing lag、revision/language drift、webhook delivery、speaker unknown rate、coverage gap、PII quarantine、download bytes 为零、retention/deletion backlog 与零未授权平台写。

## 8. 晋级缺口

从 researched 进入 modeled 需要接受 exact account/edition/API/host snapshot、meeting/instance/artifact schemas、least-privilege scopes、consent/field/deletion profiles 与 immutable fixtures。进入 verified 还需用户授权的 read-only synthetic sandbox、webhook/pull reconcile、transcript revision drill 与 deletion drill。media download、bot/recording、schedule/share/delete 始终不随 read Pack 自动晋级。
