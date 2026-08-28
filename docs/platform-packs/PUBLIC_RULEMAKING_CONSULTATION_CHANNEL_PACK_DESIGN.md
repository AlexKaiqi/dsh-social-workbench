# Public Rulemaking & Consultation Pressure Channel Pack 设计

状态：`researched`；5个concept-fixture成员，3个route-fixture成员，0个callable成员，0个durable-approved成员  
核验日期：2026-08-26  
Channel Pack ref：`public-rulemaking-consultation/v0-design`

## 1. 目标、成员和分母

本Channel用于发现主管机构公开考虑的规则/政策变化，以及正式咨询中stakeholders声明的实施负担、反对、证据与替代方案。它统一`PublicRulemaking*` projection，但不统一jurisdiction、legal status、authority、comment population、language、rights或adoption semantics。

| Member | Pack | 当前coverage |
| --- | --- | --- |
| Regulations.gov | [Pack](REGULATIONS_GOV_PUBLIC_RULEMAKING_PLATFORM_PACK_DESIGN.md) | concept+route fixture；staging GET canary candidate；no binding |
| FederalRegister.gov | [Pack](FEDERAL_REGISTER_RULEMAKING_PUBLICATION_PLATFORM_PACK_DESIGN.md) | concept+route fixture；public GET canary candidate；no binding |
| EU Have Your Say | [Pack](EU_HAVE_YOUR_SAY_CONSULTATION_PLATFORM_PACK_DESIGN.md) | concept fixture；official machine contract missing |
| GOV.UK Consultations | [Pack](GOV_UK_CONSULTATIONS_PLATFORM_PACK_DESIGN.md) | concept+route fixture；approved known-path GET candidate |
| 中国司法部立法意见征集 | [Pack](CHINA_MOJ_LEGISLATIVE_CONSULTATION_PLATFORM_PACK_DESIGN.md) | concept fixture；manual-only/no machine route |

requested=5、concept-fixture-eligible=5、route-fixture-eligible=3、callable=0、durable-approved=0。concept和route分母不得合并；公开网页、community code或官方MCP仓库存在都不等于本机binding。

## 2. 共同契约与不可比较边界

共同projection固定jurisdiction/authority/surface/API/schema、initiative/docket/document/submission/outcome identity、record/representation、lifecycle/schedule、official status、respondent/campaign/duplicate counting、relation、history/coverage、rights/retention和evidence。

必须保留：

- proposal/draft/call for evidence/consultation只产生`regulatory-change-pressure`候选，不是已生效法律、合规结论或必然未来规则；
- published stakeholder response最多产生`formal-stakeholder-response`；只有reviewed exact authored span才能按内容另派生complaint、workaround、urgency或alternative；
- comment/feedback count不是unique persons、independent opinions、support rate或representative sample；mass campaign与duplicate关系必须保留；
- stakeholder claim、issuing authority proposal、authority response、outcome synopsis、official legal edition与portal/provider summary各有authority；
- Regulations.gov和Federal Register共享FR number/docket/RIN时是common-origin，不增加独立证据；
- FederalRegister.gov HTML/XML不是official legal edition，public inspection不是published/effective；
- EU informal translation不替代原文，GOV.UK same-page lifecycle不生成多个虚假consultation，中国结果汇总不补成individual responses；
- public API、MCP或code license不生成comment/attachment的AI、storage、index或reuse rights；
- 姓名、地址、email、phone、signature、free-text PII和attachment默认drop/restrict。

## 3. 动态物化视图

- `open-regulatory-change-windows-by-jurisdiction-authority-and-topic`：只显示明确open window和proposal authority；
- `proposed-obligations-and-implementation-questions`：issuer-authored requirement/question，固定stage与official status；
- `formal-stakeholder-frictions-and-alternatives`：仅reviewed authored spans，按campaign/duplicate与respondent class覆盖，不算支持率；
- `proposal-to-final-and-consultation-outcome-lineage`：只用exact native/official relation；文本相似保留candidate；
- `common-origin-register-docket-publication-graph`：Federal Register↔Regulations.gov去重但不互补字段；
- `rulemaking-rights-schema-identity-and-coverage-drift`：跟踪schema、field visibility、official-machine-contract、license、PII/deletion和missing members。

Dolt保存Pack、definition、schema/terms/license/privacy digest、mapping、view definition、review decision、lineage和tombstone；获准高体量documents/comments未来才进入分析库。所有视图固定member/representation/definition revision、jurisdiction/topic/window、authority、rights purpose与watermark；withdrawal、correction、anonymization、license/schema变化触发partition invalidation/rebuild。

## 4. Channel Skills 与 Probe

`public-rulemaking-source-contract-research/v1`只读官方docs/privacy/schema/fixed repos，输出Pack与drift proposal；不安装/执行、不申请key、不调用API/MCP、不抓网页、不下载attachments。

`public-rulemaking-conformance/v1`使用synthetic fixtures验证identity/lifecycle/authority/official status、proposal→final、submission/campaign/duplicate、coverage、PII drop、source overlap和zero writes。

未来`approved-public-rulemaking-read/v1`只调度用户批准的exact member/product/path/query/field/budget binding；当前返回`no-authorized-public-rulemaking-binding`。不得fallback到HTML、browser、internal endpoint、unsupported search、community MCP/scraper或其他成员。

本Channel没有政策意见Probe。向真实咨询提交虚假、批量或AI生成comment会消耗公共资源、影响公共记录并涉及身份/法律责任；真实响应只能进入独立、用户主导、真实立场、完整人工审阅和submission receipt流程，绝不用于轻量需求测试。

## 5. Fixture、可观测性和晋级

| 场景 | 必须结果 |
| --- | --- |
| proposed rule有future effective date | possible change only；不标effective/legal advice |
| 10万comments含mass campaign | coverage+campaign context；不标10万独立persons |
| Federal Register和Regulations共享FR number | common-origin lineage；authority不双计 |
| EU totalFeedback远大于published items | provider population gap；不标抓取失败或完整corpus |
| GOV.UK closed page尚无response | under-review/unknown outcome；不标rejected |
| 中国通知无公开comments | comment population unavailable；不标zero feedback |
| identity/attachment出现 | pre-persistence drop/restrict/quarantine |
| comment/respond/upload/publish请求 | policy拒绝；zero external effect |

Telemetry按`Channel × member/product × jurisdiction/authority × representation × schema/terms/privacy revision × topic/window`记录requested/concept-fixture/route-fixture/callable/succeeded/blocked/degraded/quarantined、returned/retained/dropped、identity conflicts、proposal/final/submission/outcome coverage、official-status completeness、campaign/duplicate、PII drop、API/MCP/source overlap、refresh/rate/license drift和zero writes。至少一个route-fixture成员在用户批准后完成staging/production read canary，Channel才可`modeled-partial`；durable materialization逐member/field/content authority另审。
