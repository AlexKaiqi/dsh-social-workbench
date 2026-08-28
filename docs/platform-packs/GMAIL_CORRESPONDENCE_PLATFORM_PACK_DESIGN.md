# Gmail Correspondence Platform Pack 设计

状态：researched design；未发布、未授权 OAuth、未读取邮箱  
核验日期：2026-08-26  
Pack ref：gmail-owned-correspondence/v0-design

## 1. 定位与事实权威

本 Pack 只覆盖用户明确选择且拥有/获授权的 Gmail 或 Google Workspace mailbox、labels 和时间窗口，用于研究已有客户通信中的问题、替代方案、阻塞与结果。Gmail 是 mailbox copy、message/thread/label/history/watch 与 MIME representation 的权威；它不是客户身份、组织归属、同意充分性、正文中主张真伪或需求普遍性的权威。

稳定概念包括 mailbox、message、thread、system/user label、history record、watch、MIME part、attachment、draft 与 classification label。message 内容创建后不可变且 message ID immutable；label/thread state 与 history watermark 会变化。thread 是 Gmail grouping，不是 RFC thread 或跨平台 canonical conversation。

## 2. 概念、identity 与 representation

| Concept | identity/revision | 关键语义 |
| --- | --- | --- |
| gmail.mailbox/v1 | connection + mailbox scope | me 只是当前授权用户，不得成为全局 identity |
| gmail.message/v1 | mailbox + immutable message ID | 每个 mailbox copy独立；threadId、labels、historyId与读取时点同行 |
| gmail.thread/v1 | mailbox + thread ID | provider grouping；同主题不足以跨平台等价 |
| gmail.label/v1 | mailbox + label ID + observed definition | system/user labels分开；message与thread label集合可能不同 |
| gmail.history/v1 | mailbox + history ID | mailbox change log；保留窗口可短于预期，404要求full resync |
| gmail.watch/v1 | mailbox + watch revision/expiration | Pub/Sub wake-up；不含完整message truth |
| gmail.mime-part/v1 | message + immutable part ID/path | multipart tree、body、filename与attachment descriptor |
| gmail.classification-label/v1 | Workspace + definition/revision | 与 inbox label不同；默认只作policy evidence |

Message 的 internalDate 决定 inbox ordering；正常 SMTP mail 表示 Google 接受时间，API migration 可按 Date header设置。因此 Date、internalDate、observedAt不可互换。raw RFC 2822、parsed full payload、metadata/minimal response是不同 representation，必须记录format与known losses。

官方依据：[Gmail API overview](https://developers.google.com/workspace/gmail/api/guides)、[Message resource](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages)、[List messages](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages/list)、[Synchronize clients](https://developers.google.com/workspace/gmail/api/guides/sync)、[Push notifications](https://developers.google.com/workspace/gmail/api/guides/push)。

## 3. Capability proposal

| Capability | 当前资格 |
| --- | --- |
| correspondence.list.owned-message-metadata/v1 | eligible-design；gmail.metadata，label/time roster，正文不可见且 q 不可用 |
| correspondence.read.owned-message-body/v1 | eligible-with-policy；gmail.readonly restricted scope，逐message allowlist |
| correspondence.read.owned-thread/v1 | modeled；仅provider grouping，每个message独立revision/coverage |
| correspondence.list.owned-mailbox-history/v1 | eligible-design；startHistoryId、page与404 reset显式 |
| correspondence.receive.owned-mailbox-change/v1 | modeled；已有watch/PubSub receiver，通知后history pull |
| correspondence.read.owned-attachment-manifest/v1 | modeled；descriptor only，默认不取bytes |
| correspondence.download.owned-attachment/v1 | deferred；逐attachment approval、malware/parser、rights与retention |
| gmail.watch.configure/v1 | infrastructure write，deferred；topic IAM、label filter与expiration需独立审批 |
| gmail.draft/send/reply/forward/modify/delete/v1 | rejected from acquisition Pack |

gmail.metadata 与 gmail.readonly 都属于 restricted scopes；正文读取还可能触发 OAuth verification，若受限数据在服务器存储/传输则需安全评估。mail.google.com、modify、compose、send、settings/delegates等宽scope不进入默认 connection。Google Workspace 用户数据政策中的 approved use case、limited use、数据最小化与禁止用途是 adoption gate，不因技术可读就自动通过。[Gmail scopes](https://developers.google.com/workspace/gmail/api/auth/scopes)、[Workspace API user data policy](https://developers.google.com/workspace/workspace-api-user-data-developer-policy)。

## 4. 同步、watch 与 coverage

首次连接或 history 不可用时做有界 full sync；之后 history.list 从已持久化的 recent startHistoryId 做partial sync。history records 通常至少一周、常更久，但可能显著更短或偶发不可用；404不是“没有变化”，而是checkpoint失效，必须重新full sync并报告coverage gap。只有完整page round durable后才推进history watermark。

watch返回当前historyId与expiration，并立即发送一次notification；至少每7天续订，官方建议每日。Pub/Sub delivery只携mailbox/history watermark，可能重复/延迟；receiver先durable/ack，再用history pull确认message/label变化。watch创建、renew、stop和Cloud Pub/Sub topic/IAM不是read capability。

## 5. Evidence、正文分段与隐私

- Subject、snippet、body、quoted history、forward、signature、disclaimer和automated notice不可当同一正文；只有reviewed extraction后的authored-body span可候选subject-authored。
- From、Sender、Reply-To、To/Cc/Bcc、display name、domain与alias不证明个人/公司/客户角色。共享层只保存scope-local opaque participant ref。
- RFC Message-ID、References、In-Reply-To可形成经过转换的exact relation evidence，但原始header、地址与network path保持restricted；Subject/time/body similarity不得建thread或duplicate。
- draft、sent、inbox、trash、spam是不同lifecycle/label state；同一message可有多个labels，thread label不能套给每条message。
- raw/full payload、headers、HTML、tracking pixels、URLs、attachments、classification labels与加密内容默认restrict/quarantine。默认只索引最小text span，不渲染远程内容。
- trash、permanent delete、label removal、retention/admin vault是不同事实；删除/撤权必须传播blob、span、signal、projection和index。

## 6. OSS、SDK、MCP 与 Skills

| Artifact | 固定版本 | 结论 |
| --- | --- | --- |
| [googleworkspace/cli](https://github.com/googleworkspace/cli/tree/a3768d0e82ad83cca2da97724e46bea4ff0e6dbd) | 0.22.5，commit a3768d0…，Apache-2.0 | Google官方CLI与gws-gmail Skill；涵盖read/watch/send/reply/forward/manage，权限过宽，只作schema/skill/negative fixture |
| [googleapis/google-api-go-client](https://github.com/googleapis/google-api-go-client/tree/0e513f755761be9adb93856a3fff5daae65c468d) | commit 0e513f7…，BSD-3-Clause | 官方generated Gmail v1 discovery/client reference；不直接嵌入完整读写面 |
| [airbyte source-gmail](https://github.com/airbytehq/airbyte/tree/1339a9ecca6f8fb547ffb7b19665d6980c069026/airbyte-integrations/connectors/source-gmail) | 0.1.13，alpha/community，ELv2 | broad replication/state参考；未证明restricted-scope、quoted-body、deletion与最小字段契约，拒绝直接复用 |

Google Workspace Developer MCP只提供官方开发文档/片段，不是mailbox数据route；gws-gmail Skill则含真实send/manage动作。两者均不能替代deterministic read、policy或approval。所有候选均未安装、构建、执行或取得credential。

## 7. Verification 与晋级

fixtures覆盖：metadata scope q拒绝、list只返ID/threadID、full→history sync、expired history 404 reset、watch immediate/duplicate/late/renewal、message immutable但labels/history变化、thread/message label差异、internalDate vs Date/migration、multipart/alternative、nested forward、quoted reply/signature/disclaimer、automated mail、RFC relation、same subject false thread、draft/sent/trash/spam/delete、attachment manifest/bytes拒绝、tracking URL quarantine、restricted scope/policy gate和全部write拒绝。

进入modeled需要accepted API/scope/policy snapshot、mailbox/label roster、message/MIME/history schemas、body extraction/field/deletion profiles与fixtures。verified需要用户授权的synthetic mailbox，证明metadata-first、人工样本body read、history reset与watch/pull reconcile；真实客户邮箱、domain-wide delegation、attachment bytes、send/modify/delete均需另行明确授权。
