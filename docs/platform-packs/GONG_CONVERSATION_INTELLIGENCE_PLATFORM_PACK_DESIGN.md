# Gong Conversation Intelligence Platform Pack 设计

状态：researched design；未发布、未连接、未调用 Gong API/MCP  
核验日期：2026-08-26  
Pack ref：gong-owned-conversation-intelligence/v0-design

## 1. 定位与事实权威

本 Pack 只覆盖用户组织拥有并明确授权的 Gong workspace 中已采集的 calls。Gong 的稳定概念包括 workspace、call、participant、speaker、transcript segment/sentence、media、topic、keyword/smart/AI tracker、scorecard、call spotlight/summary、comment、library 与 privacy/retention state。Gong 是这些 provider-native objects、definitions、processing results 和可见性的权威；它不是原始会议平台 recording 的唯一真相，也不是说话人业务角色、用户意图或需求结论的权威。

一场 Zoom/Teams/电话会议被导入 Gong 后，会形成新的 Gong call representation；Gong transcript 可能经过独立 ASR、diarization、redaction、编辑或后续 enrichment。原始 meeting transcript 与 Gong transcript 必须并存，只有 external/native ID 或人工确认的 integration ledger 才能声明 imported-from / same-occurrence-as。

## 2. 稳定概念与 API 面

| Concept | identity / definition | 关键语义 |
| --- | --- | --- |
| gong.call/v2 | workspace + call ID | scheduled 与 actual start/end 分开；web conference 时间语义需按字段固定 |
| gong.participant/v2 | call-local participant/speaker IDs | internal/external 是 provider/workspace relation，不等于 subject/counterparty authorship |
| gong.transcript/v2 | call + observed response revision | speaker segments → timestamped sentences；分页/coverage 单独记录 |
| gong.topic/v2 | workspace + topic definition/version | provider/workspace model 输出；不是原话 |
| gong.tracker/v2 | workspace + tracker definition/version | keyword/smart/AI tracker 的规则、语言、scope 与 occurrence；命中为 derived evidence |
| gong.scorecard/v2 | workspace + scorecard/revision | human rating、AI suggestion/automatic score 需分 authorship |
| gong.call-spotlight/v2 | call + artifact/revision | summary/key points/action items 等 provider-derived representation |
| gong.media/v2 | call + media descriptor/revision | media URL 需额外 scope；默认不请求、不持久化 URL/bytes |
| gong.privacy-state/v1 | call + observed policy revision | private、restricted、redacted、deleted、retention/library exception 分开 |

GET /v2/calls 使用 inclusive fromDateTime、exclusive toDateTime、workspace/filter 与 cursor；POST /v2/calls/transcript 是 read effect，返回 call transcript speaker segments/sentences；POST /v2/calls/extensive 可返回 participants、topics、trackers、scorecards、media 等广面数据。HTTP method 不决定 effect，但 endpoint scope 与 selected fields 必须固定。

官方依据：[API introduction](https://help.gong.io/apidocs/introduction-2)、[Retrieve calls](https://help.gong.io/apidocs/retrieve-call-data-by-date-range-v2calls-2)、[Retrieve transcripts](https://help.gong.io/apidocs/retrieve-transcripts-of-calls-by-date-or-callids-v2callstranscript-2)、[Retrieve extensive call data](https://help.gong.io/apidocs/retrieve-detailed-call-data-by-various-filters-v2callsextensive-2)、[recording and consent settings](https://help.gong.io/docs/call-recording-and-consent-settings)。

## 3. Capability proposal

| Capability | required surface | 当前资格 |
| --- | --- | --- |
| conversation.list.owned-calls/v1 | api:calls:read:basic；bounded [from,to) + cursor | eligible-design |
| conversation.read.owned-transcript/v1 | api:calls:read:transcript；call IDs/date cursor | eligible-design；raw transcript representation |
| conversation.read.owned-derived-analysis/v1 | selected extensive fields + exact definitions | modeled；topics/trackers/summary/scorecards 分 artifact/authorship |
| conversation.read.owned-artifact-manifest/v1 | selected extensive metadata | modeled；不申请 media URL 时不得产生可下载引用 |
| conversation.download.owned-media/v1 | api:calls:read:media-url + byte fetch | deferred；独立 approval/retention/security |
| conversation.read.owned-private-or-restricted/v1 | exact workspace permissions | deferred；默认排除 private/restricted calls |
| gong.upload-or-update-call/v1 | platform write | rejected；改变真实 Gong call/processing |
| gong.configure-tracker-scorecard/v1 | model/config write | rejected；改变后续分析与 credits |
| gong.comment-crm-write/v1 | collaboration/CRM write | rejected |
| gong.data-privacy-delete/v1 | irreversible/background write | rejected from acquisition；独立 data-subject workflow |

Basic、transcript、extensive 与 media-url scopes 不可捆绑成 generic Gong credential。默认只读 basic + transcript；derived-analysis 若获准，则只选择定义已固定的 allowlisted fields。API 默认 3 requests/second、10,000/day，429 Retry-After、cursor expiry/duplication 和 daily budget 进入 connector health/cost telemetry。

## 4. 原文与派生分析

- transcript sentence 可作为 subject-authored 证据的前提是：exact artifact revision + time span + speaker label + participant/business-role mapping 有证据；否则保持 authorship unknown。
- internal/external、host、primary user、email domain 或 CRM association 不自动等于 vendor/customer，更不自动等于需求主体。
- topic/tracker occurrence、summary、action item、coach metric、AI score 是 provider-generated/derived。必须保存 definition/model/revision、source span relation与反例；不得当直接 quote。
- keyword tracker 命中证明配置规则与 transcript 的匹配，不证明语义、痛点或竞品意向；stemmings、side/time/topic filters 与 language 都是 definition revision。
- scorecard 需区分 human-authored rating、AI suggestion 和 automatic score。人工 reviewer 也属于 counterparty assessment，不是客户陈述。
- /calls/extensive occurrence data 的历史覆盖存在产品时点限制；Pack 不把 2023-01-01 前缺失推断为“未发生”，support backfill 也需单独 evidence。

## 5. Privacy、private、redaction 与 deletion

Gong consent profiles 可配置 pre-call email、consent page 或 audio prompt；平台执行记录是 policy evidence，不证明地域/用途的法律充分性。calendar 中 private 可阻止录制，而 Gong 中把 call 设 private 是“已录制但限制访问”；private call 仍可能计入指标且其存在可见。任何统计必须声明 private/restricted population 与 numerator/denominator，不以无法读取正文推断其不存在。

数字/PHI redaction 可永久改写新 call 的 transcript/media，文本以 REDACTED 标记、音频静音；它是 provider-applied treatment，不允许逆向恢复。删除 call 会影响 transcript、media、comments、stats/tasks；standard retention、customer term、company library exception 与自定义 policy 分开。Data Privacy API 为不可逆后台作业且 CRM 可能重新同步，绝不属于采集 Connector。

默认 drop/restrict participant names/emails/phones、CRM IDs、meeting URLs、media URLs、public/internal comments 与完整 raw payload；只保留 scope-local opaque speaker/participant refs 和必要 spans。删除/withdrawal/redaction 必须传播 evidence、signals、index、materialized view 与 exports，并保留无正文 tombstone/audit proof。

## 6. 官方 MCP、OSS 与 Skills 审计

Gong 目前提供官方 hosted MCP：https://mcp.gong.io/mcp，OAuth integration 由 Tech admin 配置。官方说明其 server 返回 account/deal 的 AI-generated insights，不返回 raw call transcripts、message bodies 或 activity lists；因此它只能是 derived-insight candidate，不能实现本 Pack 的 deterministic transcript capability。[About Gong MCP server](https://help.gong.io/docs/about-gong-mcp-server)、[Create an MCP integration](https://help.gong.io/docs/create-an-integration-to-connect-to-the-mcp-server)。

| Artifact | 固定版本 | 许可/用途 | 结论 |
| --- | --- | --- | --- |
| [airbytehq/airbyte/source-gong](https://github.com/airbytehq/airbyte/tree/1339a9ecca6f8fb547ffb7b19665d6980c069026/airbyte-integrations/connectors/source-gong) | commit 1339a9e…，metadata 1.3.5 | ELv2；calls/users/extensive/scorecards/stats/transcript 等广面 source | state/pagination/schema/negative fixture；权限面过宽，拒绝直接复用 |
| [JustinBeckwith/gongio-mcp](https://github.com/JustinBeckwith/gongio-mcp/tree/fe77637fe5bed02c79992b56bb56bb45ba89cd2a) | 2.0.0，commit fe77637… | community MIT；calls/transcripts/users/trackers/search MCP | community candidate only；含本地 OpenAPI snapshot 与广面自然语言 tools，需独立 schema/security review，不安装/执行 |
| [cedricziel/gong-mcp](https://github.com/cedricziel/gong-mcp/tree/5bc6ba416eeb892a267bee317e7ebacd5cc5f606) | commit 5bc6ba4… | community Apache-2.0；Rust read MCP | minimal fixture/reference candidate；非 Gong 官方，凭据与资源授权仍需独立审计 |

本轮未确认 Gong 维护的公开 repo-owned SDK 或 Agent Skill；官方 Public API 文档与 hosted MCP 是不同 surface。社区 SDK/MCP 名称中的 “Gong” 不构成官方背书。所有候选均未安装、构建、运行或获得 credential。

## 7. Verification Plan

static/fixture 覆盖：inclusive/exclusive time window、scheduled/actual mismatch、cursor pagination/retry、duplicate/update、transcript speaker segment/sentence 边界、overlap/gap、unknown speaker、two languages、redaction marker、partial transcript、extensive 2023 cutoff、topic/tracker definition drift、human vs AI scorecard、derived summary 与原文冲突、private call still in metrics、restricted 正文不可读、media-url scope refusal、429/daily budget、delete/retention/library exception、CRM resync risk、official MCP raw transcript refusal与 community MCP broad-tool refusal。

sandbox-live 仅在用户授权的 synthetic workspace/calls 上以 basic + transcript read scopes 运行；先证明无 media URL、无 private/restricted、无 write。Operational canary 监测 API/schema/scope、cursor/lag/coverage、speaker unknown/diarization drift、definition/model changes、redaction/delete lag、private denominator、PII quarantine、rate/cost、MCP route isolation 与零未授权 platform effect。

## 8. 晋级缺口

进入 modeled 需要固定 workspace/API/schema snapshot、exact scopes、call/transcript/derived schemas、field/consent/private/retention/deletion profiles 与 fixtures。进入 verified 需要用户授权的 read-only synthetic sandbox，证明 transcript paging、revision/derived separation、redaction/delete propagation 和 operational limits。media、private/restricted、hosted/community MCP、uploads/config/comments/CRM/delete 均不随 basic transcript read 自动晋级。
