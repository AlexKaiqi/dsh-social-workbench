# Slack Customer Community Platform Pack 设计

状态：`researched / internal-only-or-policy-blocked` 设计候选；未连接 workspace、未调用 API、未安装 Skill/MCP  
核验日期：2026-08-26  
Pack ref：`slack-authorized-customer-community/v0-design`

## 1. 定位与权利边界

本 Pack 面向组织明确批准的 Slack workspace 与频道 roster，研究客户问题、复现上下文、变通方案和团队回应。它不把 Slack 当作可自由导出的语料库，不默认读取 private channel、Slack Connect、DM/MPIM、成员 profile、files/canvases，也不发送消息、reaction、邀请、join、创建频道或修改任何平台状态。

Slack API Terms 对部署类别有实质不同约束：对外提供的应用必须取得安装组织的明确授权并最小化处理；不得用 API Data 训练 LLM、不得批量导出消息/文件（除另有协议），也不得让一个组织的数据直接惠及另一组织。Data Access/Real-time Search API 还禁止与用户查询无关的后台采集，并限制第三方长期副本、归档和索引。[Slack API Terms](https://slack.com/terms-of-service/api) 因此“管理员安装成功”只证明技术授权，不证明本系统可以把内容写入长期数仓。

```text
platform             slack
surface              authorized customer workspace channels
state                researched / internal-only-or-policy-blocked
verified level       evidence-review + static-contract only
callable routes      none
external effects     none
```

## 2. Platform Concepts

| Concept ID | Kind | 身份候选 | 原生语义 |
| --- | --- | --- | --- |
| `slack-workspace/v1` | space/authority | enterprise/team + installation | OAuth、事件和rate-limit边界；不是全企业所有workspace的隐式集合 |
| `slack-conversation/v1` | channel-like container | workspace-local conversation ID + observed revision | public/private/DM/MPIM/shared channel统一API表面，但scope与privacy不同 |
| `slack-shared-conversation/v1` | cross-org representation | host/workspace-local channel refs | Slack Connect两侧可有不同privacy；unshare时ID可能变化 |
| `slack-message/v1` | mutable content | workspace + conversation + `ts` | `ts`只在conversation内唯一；text可不是全部内容 |
| `slack-thread/v1` | message relation/set | conversation + root `ts` | root与replies由`thread_ts`/replies route关联；无reply的普通消息也可能被replies route返回 |
| `slack-message-subtype/v1` | provider message kind | message revision + subtype | bot/system/channel-change/edit/delete等不能冒充成员新陈述 |
| `slack-message-edit/v1` | revision event | channel + message `ts` + edited `ts` | `message_changed.message`是更新后的representation；自动语言检测也可能触发change |
| `slack-message-delete/v1` | tombstone event | channel + `deleted_ts` | 原消息不再从history返回；delete事件不等于保留原文的授权 |
| `slack-reaction/v1` | lightweight relation/aggregate | message + reaction name + actor/count snapshot | reaction不是独立需求、严重度或身份稳定证明 |
| `slack-file-or-canvas/v1` | linked artifact | artifact ID/revision | 单独rights与retention；默认只留descriptor，不下载正文 |

Slack Conversations API覆盖public/private/DM/MPIM/shared等channel-like对象，scope会过滤可见对象；分页即使返回零项也可能仍有`next_cursor`。[Conversations API](https://docs.slack.dev/apis/web-api/using-the-conversations-api/) Slack Connect不能按ID前缀判断privacy，且同一shared channel在两侧可见性不同。[Slack Connect](https://docs.slack.dev/apis/slack-connect/)

## 3. Capability 与 adoption decision

| Capability | Subject → Result | Access/effect | Adoption |
| --- | --- | --- | --- |
| `community.list.slack-channel-roster/v1` | approved workspace → conversation descriptors | bot Web API / none | `conditional-internal`；只列批准类型 |
| `community.read.slack-message-history/v1` | approved channel + window → message revisions | bot Web API / none | `conditional-internal`；对外分发默认`policy-blocked` |
| `community.read.slack-thread/v1` | approved root → root/replies | bot Web API / none | `conditional-internal`；独立cursor/rate budget |
| `community.receive.slack-message-event/v1` | signed event → wake-up/revision/tombstone | Events API / local write | `deferred`；需签名、dedupe、replay与pull reconcile |
| `community.read.slack-reactions/v1` | selected message → aggregate/relation | extra scope / none | `conditional`；aggregate-first，actor identity默认拒绝 |
| `community.search.slack-real-time/v1` | user query → transient results | RTS/MCP / none | `interactive-only`；不得转成后台长期采集/索引 |
| `community.read.slack-dm-or-mpim/v1` | direct conversations → messages | sensitive scope / none | `rejected-by-default` |
| `community.read.slack-members-files-canvases/v1` | workspace/content → sensitive objects | additional scopes / none | `rejected-by-default` |
| `community.manage.slack-*` | any object → platform mutation | platform write | `rejected` |

## 4. Access Methods

### 4.1 `slack-bot-membership-read/v1`

- bot token只能访问其scope和membership允许的conversation；user token可扩大到用户可见的private/DM面，默认不采用；
- public/private/DM/MPIM分别使用`channels:history`、`groups:history`、`im:history`、`mpim:history`；Pack默认只接受approved public/private channel roster；
- `conversations.history`与`conversations.replies`分别分页，thread root用`ts`固定；编辑和删除追加revision/tombstone；
- 非Marketplace商业分发应用当前history/replies为每分钟1次、每页最多/默认15；internal customer-built app不受该降级，文档给出50+次/分钟与最多1000项。部署类别必须进入rate policy，不能写死一个全局值。[Slack rate-limit change](https://docs.slack.dev/changelog/2025/05/29/rate-limit-changes-for-non-marketplace-apps/)
- 不调用`conversations.join`。任何候选Connector的auto-join即平台写入并改变成员体验，必须在静态与sandbox负向测试中拒绝；
- message text、blocks、attachments、bot/system subtype分别建role；空text不能自动解释为无内容。

### 4.2 `slack-signed-event-wakeup/v1`

Events API可用HTTP或Socket Mode，事件可见范围仍由OAuth scope和bot/user authority决定。HTTP必须对raw body、`X-Slack-Request-Timestamp`和`X-Slack-Signature`做HMAC-SHA256验证与replay窗检查；旧verification token已弃用。[Request verification](https://docs.slack.dev/authentication/verifying-requests-from-slack/)

Slack要求3秒内ack；失败会立即、1分钟、5分钟重试，并携带retry headers。事件每workspace/app/60分钟最多30,000，严重失败会暂时禁用订阅；默认best-effort且通常不投递超过2小时的延迟事件。[Events API](https://docs.slack.dev/apis/events-api/) 因此push只是低延迟wakeup，必须持久dedupe后用history/replies回补，并把disabled/rate-limited/late window暴露为coverage gap。

`message_changed`以同channel和`message.ts`替换当前representation，但仍保留旧revision；它也可能由自动语言检测触发。[message_changed](https://docs.slack.dev/reference/events/message/message_changed/) `message_deleted.deleted_ts`建立tombstone，且原消息不再出现在history。[message_deleted](https://docs.slack.dev/reference/events/message/message_deleted/)

### 4.3 `slack-hosted-mcp-interactive/v1`

Slack官方Hosted MCP可搜索public/private内容、读thread并同时提供send/schedule/reaction/canvas等写工具；官方`slack-search` Skill对public与public+private搜索有不同工具，private需要用户consent。[Slack MCP](https://docs.slack.dev/ai/slack-mcp-server/) [Slack MCP and Skills Plugin](https://docs.slack.dev/ai/slack-skills-plugin/)

它适合人工查询、概念发现和开发辅助，不是确定性、只读、可重放的后台Connector：tool surface过宽、结果与交互用户authority绑定，且RTS长期持久化受API Terms限制。本设计只将其列为`discovery/manual-assistance`，不安装、不接入采集链路。

## 5. Platform Skills

### `slack-pack-research/v1`

- 固定官方对象、scope、rate、Terms、事件与OSS revision；
- 输出knowledge proposal，不读取workspace、不安装Skill/MCP。

### `slack-community-acquire/v1`

- 输入：accepted Pack、`internal-customer-built`或经审查的deployment、明确channel roster、purpose/data-use/retention policy与window；
- 输出：native Observations、`CommunityDefinitionMetadata`、`CommunityMessageMetadata`、thread/edit/delete lineage和coverage；
- 默认拒绝DM/MPIM、user token、private/shared expansion、members/files/canvases、auto-join和所有write。

### `slack-community-conformance/v1`

- fixture验证conversation types、workspace-local IDs、thread root/replies、bot/system subtype、empty/omitted、edit/delete、reaction、cursor与event retry；
- sandbox必须是用户另行批准的synthetic/internal workspace与专用bot，只读approved channels；
- 无Probe Skill。post/reply/reaction/join/invite均会改变平台状态和通知真实成员，需独立Probe计划、批准、receipt与reconcile。

## 6. 数据治理与推断边界

- `CommunityDefinitionMetadata.Deployment`、`DataUseBasisRef`和channel roster共同决定是否允许持久化；技术scope不能覆盖Terms、组织政策或成员合理预期。
- member-authored、bot、app/webhook、system、forward/embed、attachment extract分别保留role；只有相应span再被审查为complaint/workaround等，才进入需求证据。
- reaction、reply count、thread length、emoji和mentions不是独立用户需求或严重度；actor identity默认scope-local pseudonym，member profile/email不进入宽索引。
- Slack Connect两侧privacy和organization不同；外部共享成员与内容默认restricted，不能自动用于跨组织聚合。
- retention配置可按workspace/channel/DM变化并自动删除消息、files、canvases与lists；本地retention/deletion投影必须随definition revision和tombstone传播。[Slack retention](https://slack.com/help/articles/203457187-Customize-data-retention-in-Slack)
- Slack第三方API Data不得跨客户混用；Channel materialization必须scope隔离，不能训练共享模型或生成跨客户benchmark。

## 7. 开源与 Agent Artifact 快照

以下revision于2026-08-26只读固定，未clone、安装或执行：

| Artifact / revision | Ownership / License | 价值 | 决策 |
| --- | --- | --- | --- |
| [Slack MCP and Skills Plugin](https://github.com/slackapi/slack-skills-plugin/tree/9f982fb8c3389008f9d9eaca99bcb1ead738375b) `9f982fb…` | Slack官方；MIT | 官方Skill分类、Hosted MCP工具与consent模型 | `discovery-only`；读写混合、交互authority |
| [Bolt for JavaScript v5.0.0](https://github.com/slackapi/bolt-js/tree/e2b90aa003e5a1de256b31c37b29d032566585ab) `e2b90aa…` | Slack官方；MIT | Events/Socket/signature/lifecycle reference | `preferred-sdk-reference`；未执行 |
| [Node Slack SDK Web API 8.0.0](https://github.com/slackapi/node-slack-sdk/tree/70e15b8442745d215f9ae259a2c970b306aff51a) `70e15b8…` | Slack官方；MIT | typed Web API与rate/error reference | `preferred-sdk-reference`；未执行 |
| [Airbyte source-slack](https://github.com/airbytehq/airbyte/tree/1339a9ecca6f8fb547ffb7b19665d6980c069026/airbyte-integrations/connectors/source-slack) `1339a9e…`; image `3.2.19`; manifest `6.60.5` | Airbyte certified；ELv2；GA | users/channels/members/messages/threads schema与cursor fixture | `reference-only`；默认`join_channels: true`会写平台，scope/streams过宽 |

官方Skill是开发/交互artifact，不等于本系统的采集Skill；所有runtime adoption仍需独立fixture、许可、Terms和sandbox审查。

## 8. Verification Plan

| 场景 | 必须证明 |
| --- | --- |
| public/private/shared/DM | roster只纳入批准类型；ID前缀不推断privacy；DM/MPIM默认拒绝 |
| bot membership + scopes | provider可见范围、批准roster与实际coverage分别报告 |
| root + replies | exact `thread_ts` relation；history与replies cursor/rate各自checkpoint |
| empty/block/attachment | authored empty与permission/provider omitted不混合 |
| bot/system/subtype | span role正确，不计作客户新陈述 |
| edit/language update | append revision；自动metadata change不制造新需求 |
| delete/retention | tombstone传播；已删除原文不在宽索引继续可见 |
| event retry/gap | signature、replay、duplicate、rate-limit、disabled、late window与pull reconcile |
| deployment class | internal与external/Marketplace policy、rate和storage条件不可互换 |
| candidate auto-join/write | join/post/reply/reaction/invite/create/update/delete在transport与policy层全部拒绝 |

operational canary监测API Terms/changelog、scope与conversation object、history/replies rate、channel roster/privacy/shared状态、event lag/retry/disabled、edit/delete/retention、credential age、data-use basis与OSS许可维护漂移。

## 9. 晋级缺口

进入`modeled`需要接受concepts、deployment/data-use/roster definition、message/span schemas与retention policy。进入`verified`还需fixture report和用户另行授权的internal synthetic workspace sandbox。对外分发、Marketplace、Hosted MCP/RTS或任何跨组织长期存储路线，在独立Terms/Marketplace/书面授权审查通过前持续`policy-blocked`，不能被技术成功的read请求自动晋级。
