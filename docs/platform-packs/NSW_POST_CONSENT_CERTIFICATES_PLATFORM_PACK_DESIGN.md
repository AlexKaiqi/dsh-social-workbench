# NSW Post-Consent Certificates Platform Pack 设计

状态：`concept-fixture + restricted integration API/schema fixture / architecture-only`
核验日期：2026-08-26
Platform Pack ref：`nsw-post-consent-certificates/v0-design`

## 1. 稳定概念与官方证据

[Post Consent Certificates](https://www.planningportal.nsw.gov.au/development-and-assessment/post-consent-certificates)区分多种法律对象：Construction Certificate通常在建筑/施工工作开始前取得并确认plans/specifications符合Building Code和council要求；Occupation Certificate允许新建筑、建筑部分或用途变更投入使用，staged works可有partial OC；Building Information Certificate可在七年内限制council对全部/部分building采取某些regulatory action，并可能用于既有违法建造的regularisation，但不等于development consent或CC。

[Certification data reporting clarification](https://www.planningportal.nsw.gov.au/news/clarification-certification-data-reporting)说明registered certifier依Schedule 8报告certification work，2025-07-01起统一到Planning Portal；流程包括CDC/CC/OC、Written Direction Notice与Critical Stage Inspection，Common API名包括`CSIPerformed`、`CSIMissed`、`CreateWDN`和`UpdateWDN`。

[Online BIC Application Service API](https://www.planningportal.nsw.gov.au/online-bic-application-service-api)是Portal与council IT之间的双向集成：outbound发送application，inbound回传assessment、inspection、additional-information和determination。它证明integration capability与schema evolution，但不是面向公众的exact read route。

## 2. 概念映射

| Native | `PublicBuildingRegulation*` |
| --- | --- |
| Construction Certificate | construction certificate type + authority/status/scope |
| Occupation Certificate / partial OC | occupation certificate + partial/final scope；非实际入住事实 |
| Building Information Certificate | distinct BIC type/regulatory-effect rule；绝不映射OC/CC |
| registered/principal certifier / council | separate authority roles and exact attribution |
| Critical Stage Inspection performed/missed | inspection stage + result/posture；missed不自动failed |
| Written Direction Notice | order/correction lineage；create/update为write |
| BIC assessment/inspection/determination | separate application, inspection and certificate decision records |
| Portal/Common API/council IT | deployment and integration origin；不代表public access |

## 3. 期望能力与公共路由缺口

`definition.read`、`official-process.read`、`integration-api-schema.read`、`selected-public-certificate-document.metadata.read`与synthetic `critical-stage-inspection/wdn.conformance`仅为knowledge/fixture capability。没有exact public record route时不得用Portal login、browser、council/private-certifier API、Online DA/CDC sibling dataset、provider SDK、community scraper或HTML search结果补齐。

未来若出现public route，必须固定jurisdiction/process/code revision、certificate type/status、certifier/council authority、critical stage、WDN/correction relation、public population、field/location/document allowlist、privacy/rights/purpose/retention/deletion。Portal/API能够写并不授权application、inspection、WDN、certificate、additional information、payment或status mutation；全部zero effect。

## 4. Synthetic fixtures与可观测性

Synthetic覆盖CC before work但exemption存在、CC issued≠work commenced、partial OC≠whole building final、OC issued≠actual/current occupancy、BIC≠DA/CC/OC、registered certifier与council authority不同、CSI missed≠failed inspection、WDN create→update→compliance lineage、BIC inspection/determination分离、API schema change以及public route missing时所有fallback拒绝。

Telemetry逐`service/API/schema release × jurisdiction/process/code revision × certificate type/status/partial scope × certifier/council role × CSI/WDN stage × public-route/access/privacy/rights policy`记录concept/schema/manual/public-route/callable coverage、missing route、authority conflict、schema drift、restricted fallback rejection和zero writes。本轮没有调用Portal/Common API或任何certificate/inspection记录。
