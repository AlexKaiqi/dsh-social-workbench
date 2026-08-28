# EU Have Your Say Consultation Platform Pack 设计

状态：`researched / concept-fixture-eligible / official-machine-contract-missing / manual-only`  
核验日期：2026-08-26  
Pack ref：`eu-have-your-say-consultation/v0-design`

## 1. 稳定概念与流程

[European Commission Better Regulation](https://commission.europa.eu/law/law-making-process/better-regulation_en)说明：stakeholders可对新政策、legal acts、现行法律evaluation/fitness check提供意见；call for evidence原则上开放4周，legislative public consultation原则上开放12周，反馈可使用24种官方语言，自动翻译只是informal translation。

本Pack表达initiative、publication/draft、call for evidence、public consultation、questionnaire、feedback/comment、position paper、synopsis/authority response和later proposal/adopted act。它不把portal initiative等同于EU law，也不把consultation deadline当effective date。

## 2. Population、身份和coverage

| Native concept | `PublicRulemaking*` | 约束 |
| --- | --- | --- |
| initiative | initiative record | 可含多个publication/feedback mechanism |
| call for evidence/public consultation/draft feedback | consultation/call/document | 不同window与questionnaire，不能合并 |
| feedback/contribution | stakeholder submission | authored claim；不证明代表性或采纳 |
| position paper/attachment | restricted attachment | 默认不下载或提取 |
| synopsis/report | authority outcome summary | agency summary，不等于完整response corpus |
| total feedback / published items | aggregate与coverage | mass campaign可能造成巨大差异，不能把缺口视为抓取失败或独立人数 |
| machine/informal translation | separate representation | 不替代原语言，不用于exact quote authority |

[specific privacy statement](https://ec.europa.eu/info/law/better-regulation/specific-privacy-statement_en)说明respondent type、country及组织信息等可能公开，free text/attachments可能含自愿提供的个人数据；反馈关闭后仍可申请移除在线个人详情。姓名、组织成员身份、country与Transparency Register信息默认drop/restrict，删除/匿名化必须传播到span和index。

## 3. 接入、Skills 与开源候选

当前未发现Have Your Say官方、版本化、面向第三方的API/OpenAPI、bulk contract、MCP或Agent Skill。portal可见和“feedback instantly published”不等于允许内部endpoint采集、长期仓储、AI分析或attachment下载。

community [ghxm/haveyoursay `256005e…`](https://github.com/ghxm/haveyoursay/tree/256005e97ffe9c3f05626009eb00dc379c9133ff)为MIT工具，但会调用未文档化接口、建SQLite、下载attachments与生成datasets。它还记录`totalFeedback`与可枚举published feedback在mass campaign中可能相差百万量级，证明representation/coverage风险；该项目只作静态schema-risk evidence，禁止安装、执行或当作官方route。

## 4. Fixture、观测与晋级

只有`eu-have-your-say-concept-fixture/v1`：手写initiative→publication→consultation→feedback/position-paper→synopsis对象，验证4/12周window、language/original-vs-machine translation、identity drop、mass campaign、published-vs-total gap、attachment quarantine、anonymization/deletion和zero submit/report-feedback。

Telemetry只观测官方docs/privacy/page/schema evidence revision、concept coverage和missing-machine-contract；route、callable、durable始终为0。除非官方发布明确机器接口和用途/retention合同，否则不得fallback到HTML、browser、internal endpoint、EU Survey session、community collector或search cache。
