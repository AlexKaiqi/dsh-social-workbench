# Public Rulemaking & Consultation Pressure 候选分诊（2026-08-26）

状态：`researched`；requested=5，concept-fixture-eligible=5，route-fixture-eligible=3，callable=0，durable-approved=0  
目标 Channel：`public-rulemaking-consultation/v0-design`

## 1. 覆盖缺口与第一性原理结论

现有系统能看到个人问题、组织投入、采购、资助、交易和监管投诉，但缺少“主管机构正在考虑改变什么规则”和“受影响主体通过正式程序提交了什么负担、反对、证据或替代方案”。这些事实比普通社媒发言更接近政策与合规变化，却仍不是已生效法律、法律意见或市场需求。

共同最小事实是：jurisdiction/authority、initiative/docket/document、proposal/consultation/final/outcome、comment window、stakeholder submission、authority、representation、official status、duplicate/campaign coverage、rights、revision与exact lineage。拟议规则只证明可能的变化压力；正式提交只证明一份来源可识别的意见被发布，不证明其真实、独立、代表性或被采纳。

## 2. 候选与当前判定

| 候选 | 信号增量 | 官方表面 | 当前判定 |
| --- | --- | --- | --- |
| Regulations.gov | 美国联邦docket、proposed/final/supporting documents、public comments与comment window | [API v4](https://open.gsa.gov/api/regulationsgov/)；API key；GET与POST comment并存 | concept/route fixture eligible；staging read canary候选；Comment API全部拒绝 |
| FederalRegister.gov | 正式发布流程中的Rule/Proposed Rule/Notice、agency、RIN、docket、CFR与日期 | [API v1](https://www.federalregister.gov/developers/documentation/api/v1)；GET无需key | concept/route fixture eligible；public read canary候选；HTML/XML不是official legal edition |
| EU Have Your Say | initiative、call for evidence、public consultation、feedback、position paper与synopsis | [Better Regulation](https://commission.europa.eu/law/law-making-process/better-regulation_en)、[portal](https://ec.europa.eu/info/law/better-regulation/) | concept fixture eligible；未发现官方API/schema，route/manual-only；身份与内容权利待审 |
| GOV.UK Consultations | consultation/call for evidence、open/closed、response/outcome与applicable nation | [Content API](https://content-api.publishing.service.gov.uk/)、[consultation guidance](https://guidance.publishing.service.gov.uk/publish-update-retire-content/standard-content-types/consultations/) | concept/route fixture eligible；known-path read canary候选；Search API unsupported |
| 中国司法部立法意见征集 | 中央立法草案、征求意见通知、期限与提交方式 | [立法意见征集](https://www.moj.gov.cn/pub/sfbgwapp/lfyjzjapp/) | concept fixture eligible；无官方API/schema/export，manual-only；不采集提交者或未公开意见 |

`concept-fixture`验证共同ontology与推断边界；`route-fixture`还要求可固定的官方机器schema。EU和中国成员不能因为网页可见或社区代码存在而计入route-fixture。

## 3. Skills、MCP 与固定开源候选

| Artifact | 固定revision / license | 结论 |
| --- | --- | --- |
| [GSA-TTS/mcp-server-regulations-gov](https://github.com/GSA-TTS/mcp-server-regulations-gov/tree/e45f05c09ee3648d61d59c312915e8aca1f79e19) | `e45f05c…` / root license未发现 | 官方GSA MCP；6个document/comment/docket read tools；`.agents/skills`只有generic `mcp-builder`/`mcp-eval`；不安装、运行或晋级 |
| [usnationalarchives/federalregister-api-core](https://github.com/usnationalarchives/federalregister-api-core/tree/e9c64236b385c04c7383eef167e6c29d03cfe467) | `e9c6423…` / AGPL-3.0-or-later | 官方运行实现与schema drift evidence；不vendoring或执行 |
| [usnationalarchives/federal_register](https://github.com/usnationalarchives/federal_register/tree/67a73989ca03f51c91f67263eb2f4f29cf1b5665) | `67a7398…` / CC0 | 官方Ruby API client；只作endpoint/identity mapping参考 |
| [alphagov/publishing-api content schemas](https://github.com/alphagov/publishing-api/tree/5494a03a6e474a673a287ae029fa3367277f66dc/content_schemas) | `5494a03…` / schema subtree README标MIT | 官方consultation/call-for-evidence frontend/notification/publisher schema证据；不运行生成器 |
| [ghxm/haveyoursay](https://github.com/ghxm/haveyoursay/tree/256005e97ffe9c3f05626009eb00dc379c9133ff) | `256005e…` / MIT | community collector；使用未文档化接口、SQLite与attachment下载，并暴露mass-campaign count差异；`rejected-runtime / schema-risk-evidence` |
| [cyanheads/federal-regulations-mcp-server](https://github.com/cyanheads/federal-regulations-mcp-server/tree/d23f76fbf91ab50f48c4dbddb21f5bbae40e5c07) | `d23f76f…` / Apache-2.0 | community MCP同时访问Federal Register、Regulations.gov、eCFR并维护本地mirror；边界过宽，只作source-overlap/telemetry风险证据 |

未发现Federal Register、EU、GOV.UK或中国成员的官方领域Agent Skill。GSA仓库中的builder/eval skills是MCP开发资产，不是经过验证的rulemaking research Skill；官方组织归属也不能替代license、运行安全、数据权利或Connector conformance。

## 4. 选择与下一门槛

五个成员进入同一概念Channel，但逐产品独立晋级。下一步以synthetic fixtures验证proposal/final、docket/document/submission/outcome identity、official-vs-informational representation、comment window、campaign/duplicate、PII drop、source overlap和zero submit/write。只有用户另行授权后，Regulations.gov staging GET、Federal Register production GET与GOV.UK known-path Content API GET才可设计最小canary；EU与中国成员等待官方机器合同，不使用HTML、browser、内部endpoint或community collector补位。
