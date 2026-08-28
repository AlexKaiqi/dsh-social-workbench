# Regulations.gov Public Rulemaking Platform Pack 设计

状态：`researched / synthetic-route-fixture-eligible / staging-read-candidate / no-local-binding`  
核验日期：2026-08-26  
Pack ref：`regulations-gov-public-rulemaking/v0-design`

## 1. 平台产品与population

本Pack只覆盖公开rulemaking/nonrulemaking docket、documents和已发布comments，不覆盖comment creation、file upload、submission key、个人My Comments或agency后台。

[官方API v4](https://open.gsa.gov/api/regulationsgov/)要求api.data.gov key，提供：

- `GET /v4/dockets`与detail；
- `GET /v4/documents`与detail，可选attachments；document type包括Proposed Rule、Rule、Supporting & Related、Other；
- `GET /v4/comments`与detail，可选attachments；
- `POST /v4/comments`、submission key与presigned upload URL。

读写必须拆为不同产品。当前设计只保留GET知识能力，所有POST/upload/submission能力在resolution前即拒绝。

## 2. 概念与抽象映射

| Native concept | `PublicRulemaking*` | 约束 |
| --- | --- | --- |
| rulemaking/nonrulemaking docket | docket record | folder不是rule、initiative或法律状态 |
| proposed rule/rule/supporting/other document | proposal/final/notice/attachment record | provider type保留；标题不决定stage |
| public comment | stakeholder submission | comment author claim，不是agency finding |
| comment-on/object/document IDs | exact relation | 只用provider IDs连接，不按关键词或时间猜测 |
| posted/received/modified/withdrawn | schedule/state/history | withdrawn与restricted正交；current detail不证明完整历史 |
| comment count/duplicateComments | aggregate/submission counting | 不等于unique persons、independent positions或representative sample |
| agency configurable submitter fields | restricted identity context | name、city、zip等pre-persistence drop；organization/type/country按purpose另审 |

官方文档明确部分comment字段可由agency随时公开或隐藏，email/phone/address永不公开；因此field availability属于schema/policy drift，不可用missing推断anonymous。分页单一查询最多5,000结果，`lastModifiedDate`增量方案仍为beta；watermark必须含时间与ID并处理等值边界、修改和撤回。

## 3. 权利、MCP、Skills 与开源证据

公开可读不自动解决stakeholder-authored comment/attachment的copyright、AI、长期索引或再分发权。默认只允许synthetic fixture；未来binding逐field/content-role固定purpose、attribution、retention与deletion。attachment默认不下载，个人身份字段默认drop。

官方[GSA MCP `e45f05c…`](https://github.com/GSA-TTS/mcp-server-regulations-gov/tree/e45f05c09ee3648d61d59c312915e8aca1f79e19)列出6个只读search/get tools；它没有root license，仓库只有generic `mcp-builder`和`mcp-eval` Agent Skills，并非领域研究Skill。官方API本身仍含写面，MCP read-only tool list也不授予本系统调用或materialize内容的权利；当前不安装、执行或连接。

community [federal-regulations-mcp-server `d23f76f…`](https://github.com/cyanheads/federal-regulations-mcp-server/tree/d23f76fbf91ab50f48c4dbddb21f5bbae40e5c07)同时建立eCFR mirror并组合多个来源，扩大网络、存储与法律文本边界；只保留为negative architecture evidence。

## 4. Skills、fixture、观测与晋级

`regulations-gov-contract-research/v1`只读官方docs、OpenAPI和固定source；`regulations-gov-fixture/v1`使用手写synthetic docket/document/comment；未来`approved-staging-read/v1`只允许exact GET method/path/schema/key binding。

fixture覆盖：rulemaking/nonrulemaking、proposal/final/supporting document、comment-on exact relation、agency字段出现/消失、restricted/withdrawn、mass campaign/duplicate count、5,000边界、same-watermark revisions、attachment quarantine、PII drop、official MCP无license和zero POST/upload。

Telemetry按`agency × docket/document type × query/window × schema/OpenAPI revision`记录requested/returned/retained/dropped、pagination/watermark overlap、identity conflict、field availability、restricted/withdrawn、submission/attachment coverage、duplicate/campaign context、PII drop、license/right gate、MCP drift和write attempts。staging canary只证明GET协议，不证明production coverage、comment rights或durable materialization。
