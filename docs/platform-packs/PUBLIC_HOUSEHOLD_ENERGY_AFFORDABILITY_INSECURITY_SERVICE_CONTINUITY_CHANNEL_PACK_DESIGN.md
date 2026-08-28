# Public Household Energy Affordability, Insecurity & Service Continuity Channel Pack

## 1. 契约

比较键固定：`member × programme/release × authority × population/statistical-unit/denominator × geography/jurisdiction × energy-service × instrument/indicator/revision × condition/event × amount-role/measure/unit × reference/collection/reporting time × weighting/model × breakdown/quality × rights-purpose`。

本Channel只回答aggregate household-energy friction。它不是个人能源贫困分类器、客户hardship名单、信贷/福利/住房/保险/医疗决策输入、住宅安全检查、能源建议或Probe surface。

Dolt/Git snapshot保存programme/lifecycle、population/denominator、energy service、instrument/indicator、event/condition、amount role、method/quality、release/rights、fixed OSS/Skill decision与lineage；不保存respondent/customer/account identity、address、meter/interval/bill/medical/family-violence/life-support record、microdata或download。未来分析库只接approved aggregate cells。

## 2. 不变量与动态物化视图

动态视图至少隔离：

- `price-vs-billed-expenditure-vs-required-bill-vs-debt-vs-gap`；
- `self-reported-vs-modelled-vs-retailer-reported-vs-regulator-published`；
- `household-vs-housing-unit-vs-person-vs-customer-account-vs-hardship-account denominator`；
- `food-medicine-tradeoff-vs-unsafe-temperature-vs-equipment-unavailable-vs-unable-warm`；
- `arrears-vs-debt-vs-payment-plan-vs-hardship-vs-concession`；
- `notice-vs-disconnection-vs-reconnection-vs-outage-vs-equipment-failure`；
- `electricity-vs-gas-vs-bulk-fuel-vs-heating-vs-cooling-vs-all-energy`；
- `LILEE-vs-affordability-threshold-vs-EU-SILC-item-vs-AER-schedule`；
- `final-preliminary-provisional-projected-corrected-regulatory-reported`；
- `zero-missing-not-applicable-suppressed-unreliable`；
- `national-region-local-jurisdiction-retailer coverage`；
- `questionnaire-result-route-rights-lifecycle`与`sensitive-aggregate-only`。

任一question、indicator、model、guideline、template、geography、jurisdiction、denominator、quality或rights漂移只失效对应partition，不回退到microdata、HTML scraping、generic MCP、product-price API或其他成员。

## 3. Evidence 与验证

`Evidence*HouseholdEnergy*`只能由source-authorised aggregate span形成。Synthetic必须拒绝：低支出→低需求、energy insecurity→verified poverty、unsafe temperature→measured temperature/health harm、LILEE→EU/Australia/US通用定义、debt→arrears/default、notice→disconnection、disconnection→grid outage、reconnection→resolution、hardship enrolment→vulnerability truth、account→household/person，以及generic parser/MCP success→domain readiness。

Telemetry按完整比较键发布requested/returned/retained/dropped/quarantined/suppressed cells、unknown population/service/indicator/event/denominator/amount/time/method/quality/release、question/model/guideline/jurisdiction drift、preliminary/final/projected conflict、sensitive-breakdown rejection、route fallback rejection与zero effects。成员health和成熟度独立。

## 4. Capability 与 Probe

- `programme/indicator/question/method/dataset/table/schema metadata read`：knowledge/fixture-only；
- `aggregate observation/file read`：本轮未授权；以后逐member、dataset/table、window和retention批准；
- `respondent/customer/account/microdata/bill/meter/interval read`：policy-blocked；
- `MCP/Skill/OSS install or execute`：本轮blocked；
- `assistance application、payment、switch、contact、complaint、disconnection/reconnection、retailer submission、dashboard share、write`：恒为独立高影响能力，不是本Channel Probe。

真实产品验证应另建truthful landing/manual-package、访谈或自有产品实验；不得向能源服务商、监管机构或困难客户制造虚假事件。
