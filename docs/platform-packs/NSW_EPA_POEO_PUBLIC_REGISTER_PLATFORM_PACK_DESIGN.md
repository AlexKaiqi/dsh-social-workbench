# NSW EPA POEO Public Register Platform Pack 设计

状态：`concept-fixture + public-register/manual fixture / architecture-only`  
核验日期：2026-08-26  
Platform Pack ref：`nsw-epa-poeo-public-register/v0-design`

## 1. 稳定概念与官方证据

[POEO Public Register说明](https://www.epa.nsw.gov.au/Licensing-and-Regulation/Public-registers/about-prpoeo)覆盖licence/application、notice、penalty、conviction、review、exemption、approval、pollution study/reduction program和audit；[详细范围](https://www.epa.nsw.gov.au/Licensing-and-Regulation/Public-registers/about-prpoeo/whats-in-public-register)区分申请决定、licence review、clean-up/prevention/prohibition notice、penalty/conviction/civil proceeding和audit。

[许可监测数据发布要求](https://www.epa.nsw.gov.au/Licensing-and-Regulation/Licensing/Environment-protection-licences/Licensing-under-POEO-Act-1997/publishing-and-providing-pollution-monitoring-data)要求持证者公开按licence condition取得的数据。EPA不是所有原始监测值的统一发布者；PDF、summary、graph或continuous feed以及licensee website都可能是representation。

## 2. 制度迁移与事实边界

[2026 reforms](https://www.epa.nsw.gov.au/Licensing-and-Regulation/Licensing/licensing-reforms/licensing-reforms-information-environment)把大多数年度不合规申报改为获知后21日内申报；load-based licence保留简化annual return，短期另报max/min/mean年度监测汇总，未来近实时提交与公开平台仍在探索。

因此必须分开：

- historical annual-return self-declared non-compliance；
- new near-real-time licensee self-report；
- licensee-published monitoring measurement；
- EPA inspection/notice/penalty/conviction；
- pollution study/reduction program与reported/verified completion。

旧门户与新register迁移、effective date、未收到annual return和新申报coverage都进入definition；不能把制度切换解释为不合规骤增/骤降。

## 3. 期望能力与边界

仅设计`definition/process.read`、`register-schema.read`、`selected-public-record.metadata.read`和`licensee-monitoring-representation.conformance`。当前无固定、获准的machine route，所以public read保持manual fixture；不能跨licensee网站crawl，不能用HTML表格或文档格式猜统一schema。

申请/变更/转移/注销、eConnect annual return/non-compliance/monitoring upload、incident/complaint、contact/subscribe/payment及所有write拒绝。exact site、outfall、联系人、自然人、complaint prose和documents先drop/quarantine。

## 4. Synthetic fixtures与可观测性

Synthetic覆盖application pending/approved/refused、licence variation、monitoring condition→licensee value、no-discharge/below-detection explanatory gap、annual max/min/mean不冒充samples、old annual return yes/no/nonreceipt、new 21-day self-report、EPA authority finding、notice/penalty、PRP→reported completion与verified distinction，以及portal/process cutover。

Telemetry逐`register/process revision × licence/program/media × representation publisher × parameter/unit/statistic/period × self-report/regulator authority × compliance/finality/remediation × coverage`记录missing/nonreceipt、returned/retained/dropped/quarantined、cutover break、fallback rejection和zero effects。本轮没有读取许可或监测记录。
