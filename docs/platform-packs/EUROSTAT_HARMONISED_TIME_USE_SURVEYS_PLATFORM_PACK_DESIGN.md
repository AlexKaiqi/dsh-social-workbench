# Eurostat Harmonised European Time Use Surveys Platform Pack

## 1. 稳定概念与官方事实

[HETUS information](https://ec.europa.eu/eurostat/web/time-use-surveys/information-data)定义household questionnaire、individual questionnaire和10-minute diary，并说明各国collection基于非约束性协作、round横跨多年且sample design不同。[HETUS 2020 metadata](https://ec.europa.eu/eurostat/cache/metadata/en/tus_20_esms.htm)定义weekday+weekend diaries、ACL 2018、144个10-minute slots，以及time spent、participant time、participation rate、time-of-day、simultaneous activity、location/mode等22个Eurobase tables。[microdata page](https://ec.europa.eu/eurostat/web/microdata/harmonised-european-time-use-surveys)说明HETUS 2020 collection预计2026结束，该轮microdata预计不早于2027。

## 2. 能力与采用边界

| Capability | 当前采用 | 边界 |
| --- | --- | --- |
| programme/round/ACL/guidelines/quality metadata | `fixture` | country collection year/design/coverage保持独立 |
| Eurobase `tus_00`/`tus_20` | `api-or-table-fixture` | dataset code、DSD/codelist、status flag和vintage固定 |
| scientific-use files | `not-adopted` | restricted/partly anonymised microdata，高风险门外 |

HETUS harmonised不等于identical。2020是round label，不是所有国家同一calendar year；population mean、participant time与participation rate不得互填。ACL 2018的116 activities到41 categories映射必须有版本证据；database latest-only行为要求本系统保留自己的release snapshot。

## 3. 开源、Skill与验证

[restatapi@`a0bce06`](https://github.com/eurostat/restatapi/tree/a0bce063c60aef1033ea696d91d26e1158c2c4b0)是Eurostat-org/EUPL API/bulk client，README含`tus_00age`实例，但不能执行country comparability、round、ACL或denominator gate。[statistics-coded@`ca58d8c`](https://github.com/eurostat/statistics-coded/tree/ca58d8cad5a33ed5a6e5c97dd0cb1cfb29fbede3)只作authority-org static method witness。未发现HETUS-owned Agent Skill/MCP；均未安装或执行。

Synthetic覆盖round/year、country population/design、weekday/weekend diary、144 slots、primary/secondary、ACL revision/composite、time spent/participant time/rate、time-of-day、location/mode、sample threshold flags、missing/suppressed、latest-only revision和microdata rejection。

## 4. Snapshot与可观测性

Snapshot保存round/country、guideline/ACL、dataset/DSD/codelist、indicator/denominator、collection year/mode、quality/status flag、release/vintage/rights和OSS decision。Telemetry逐`round × country × dataset/table × population × diary-role × ACL/category × indicator × day/time × quality`记录retained/dropped、country/method gap、round-year confusion、ACL drift、denominator/status conflict、latest-only overwrite risk与zero effects。
