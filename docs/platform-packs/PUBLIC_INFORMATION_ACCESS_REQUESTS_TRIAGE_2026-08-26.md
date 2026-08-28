# 公共信息公开请求、机关回应与披露结果平台分流（2026-08-26）

状态：`researched / architecture-only / no-connector`
核验日期：2026-08-26

## 1. 第一性原理结论

这条Channel的增量不是“政府承认了某问题”，而是`requester正式索取哪些尚未充分公开的records/data → 平台如何送达并公开通信 → public body报告何种处理/拒绝/披露 → 是否发生review/appeal`。它比普通搜索更接近明确的信息缺口，也比请愿更聚焦“要哪些既有记录”，但不是民调、举报、法律裁决或机关绩效排名。

请求公开只证明信息需求被表达；机关回信只证明平台按一种delivery/authentication定义将消息归于该机关；successful/completed/refused/not-held等状态必须保留请求者、平台、机关或review body的分类authority。released attachment只证明一个artifact被公开，不证明完整、当前、无遗漏、可任意复用或其中事实已经核验。

## 2. 首批成员与成熟度

| Member | Provider / 官方表面 | 信号增量 | 当前成熟度 |
| --- | --- | --- | --- |
| WhatDoTheyKnow | mySociety / Alaveteli，UK FOI/EIR及扩展authority roster | request、routed correspondence、user/platform classification、internal review | concept + Alaveteli provider-schema candidate + selected/manual |
| MuckRock | MuckRock Foundation自有Django平台，US federal/state/local public-records laws | email/fax/postal/portal、fee、appeal/litigation、embargo与distinct terminal status | concept + fixed official-source schema candidate + selected/manual |
| FragDenStaat | Open Knowledge Foundation Germany / Froide，官方OpenAPI | law-aware request、authority、message、cost、resolution、visibility与OAuth scopes | concept + exact-member route fixture + selected/manual |
| AskTheEU | Access Info Europe / Alaveteli，EU access-to-documents process | EU institution correspondence、confirmatory application、temporary Pro embargo | concept + Alaveteli provider-schema candidate + selected/manual |

requested=4、concept-fixture=4、exact-member route-fixture=1、provider/source-schema candidate=3、selected/manual=4、callable=0、durable-approved=0。FYI.org.nz是有价值的New Zealand OIA/LGOIMA后续成员，但与首批Alaveteli部署重复度较高，先保留为扩展候选；不能用它补齐WhatDoTheyKnow或AskTheEU的部署证据。

本轮只读运营方网页、API文档、固定官方源码与公开GitHub元数据；没有请求平台data row、调用search/detail/API/feed、安装或执行项目，也没有创建请求、follow-up、分类、appeal、comment、follow或下载released corpus。

## 3. 共同事实边界

- approved exact records/data/documents-sought span最多形成`EvidencePublishedInformationAccessRequest`；请求中的背景、指控或动机不升级为事实；
- `EvidenceAttributedPublicBodyCorrespondence`必须固定delivery/authentication与sender attribution；platform-routed email、postal upload和用户转录的authority强度不同；
- `EvidenceReportedInformationAccessDisposition`必须携带classifier authority、native status、revision和basis；successful/done不自动表示full/legal compliance/requester satisfaction；
- `EvidencePublishedInformationAccessRelease`只覆盖rights/privacy reviewed artifact metadata或approved span；源码license、网页公开、Crown/public-sector origin都不能自动授权所有附件全文索引；
- public body directory entry不证明该组织受某法律约束；legal regime与platform campaign roster分开；
- request count不是unique people、independent needs、representative opinion或eligible-population rate；prewritten/bulk/campaign requests需common-origin/duplicate coverage；
- response、acknowledgement、extension、clarification、transfer、fee、refusal、not held、partial/full release、review与appeal分别保存；
- due/overdue必须绑定jurisdiction、law、working-day calendar、clock start/reset/pause和extension；
- public/embargo/private/hidden/off-platform是不同visibility/history；private或仍embargoed内容不进入公共read候选；
- requester、公务员和第三方的姓名、email、phone、address、signature、ID、IP与附件内personal/sensitive data默认drop/quarantine。

## 4. OSS、Agent Skill与MCP审计

| Artifact | fixed revision / license | 可借鉴 | 结论 |
| --- | --- | --- | --- |
| [mysociety/alaveteli](https://github.com/mysociety/alaveteli/tree/1c505a65635164af3907899f1d2cc5580346a466) | `1c505a6…` / AGPL-3.0-or-later | InfoRequest/Event、JSON/Atom read、experimental write API、可定制state/law | official provider source；不安装/执行，不证明成员部署version/config |
| [MuckRock/muckrock](https://github.com/MuckRock/muckrock/tree/b9d836ffbae6aefd9f146e6eec2223dec6f02edc) | `b9d836f…` / AGPL-3.0 | request、communication、agency/jurisdiction、fee/appeal/embargo/status | official source candidate；不安装/执行，不证明production等于HEAD |
| [okfde/froide](https://github.com/okfde/froide/tree/ddcee29d47571e65ab9b24b3ad17d03df556d4d3) | `ddcee29…` / MIT | request/message、status/resolution/visibility/cost与OpenAPI | official provider source；FragDenStaat仍需exact deployment schema |
| [morisy/muckrock-mcp](https://github.com/morisy/muckrock-mcp/tree/56e6b078c4ec19fc2c6f3ca67d77e3ad4bfea49b) | `56e6b07…` / community | search/detail vocabulary | 明示experimental，收用户名/密码并含file-request write；拒绝安装/执行/接入 |
| [edithatogo/fyi-cli](https://github.com/edithatogo/fyi-cli/tree/2adfa97c85b68dc75725a902b0568ed6e669fd29) | `2adfa97…` / MIT / community | local archive、MCP/CLI vocabulary | broad submit/archive/write；且把Froide的FragDenStaat误列为Alaveteli，拒绝作为provider truth |
| [jamditis FOIA skill](https://github.com/jamditis/claude-skills-journalism/tree/bc681b79a3eaba846a494582368501e0b4d75b1b) | `bc681b7…` / community skill repo | drafting/checklist ideas | US法律内容会漂移且不提供platform contract；只作research hint，不安装/采纳 |

未发现由四个平台运营方正式发布、可证明只读且deployment-aware的Agent Skill或MCP；结论是`discovery-incomplete`。个人/社区作者与MuckRock创始人关联不等于MuckRock Foundation正式维护或适合本系统。

规划Skill：`public-information-access-source-contract-research/v1`只产生versioned knowledge proposal；`public-information-access-conformance/v1`只运行synthetic fixtures；未来`approved-public-information-access-read/v1`必须绑定exact member/deployment/jurisdiction/law/public-body roster/visibility/status authority/fields/window/purpose/retention/deletion。

## 5. Probe结论

本Channel没有Probe。draft/send/request、bulk/prewritten campaign、follow-up/reminder/clarification、fee payment、internal review/appeal/complaint/litigation、annotation、status classification、follow/subscribe、upload/redact/embargo change都会产生法律、行政、财务、通知或公开记录副作用。真实信息公开请求只能进入由本人发起、逐动作展示与确认的manual legal/civic workflow。

