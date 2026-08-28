# European Court of Auditors Reports & Open Data Platform Pack 设计

状态：`researched / concept+official-route-fixture / no-local-binding`  
核验日期：2026-08-26  
Pack ref：`eu-eca-audit-reports-open-data/v0-design`

## 1. 概念与价值

[ECA reports](https://eca.europa.eu/en/multiple-reports)包含annual reports、special reports、reviews和opinions；special reports覆盖performance/compliance audit。report family、audit subject、EU language rendition、scope、finding、conclusion和recommendation均需保留，不能跨报告类型统一assurance。

[ECA recommendations methodology](https://methodology.eca.europa.eu/aware/GAP/Pages/Recommendations.aspx)要求recommendation针对问题成因并可建设性实施，且ECA会follow up；[report drafting guide](https://methodology.eca.europa.eu/aware/GAP/Pages/Report-drafting.aspx)同时明确发布报告不是audit files中所有findings的记录。公开finding因此只证明报告选择和范围内的审计结论。

## 2. 开放数据路由与限制

[Reports open data](https://eca.europa.eu/en/reports-open-data)仅为selected reports发布相关dataset、sources、methods和calculations，并链接ECA在data.europa.eu的catalogue。route fixture使用官方[data.europa.eu APIs](https://data.europa.eu/en/which-apis-are-available-and-where-can-i-find-information-about-them)的read-only Search/DCAT/SPARQL契约，限定exact ECA publisher/catalogue与字段allowlist；不调用API。

| Native concept | 抽象 | 约束 |
| --- | --- | --- |
| annual/special/review/opinion | report taxonomy | 类型不等价 |
| observation/conclusion | finding/conclusion | 固定scope/method/report revision |
| recommendation | recommendation | 不等于Commission接受或实施 |
| annual follow-up | auditor follow-up | 通常最迟约3年仍不代表持续效果 |
| open-data dataset/distribution | dataset representation + relation | selected subset，不等于全部报告/发现 |

data.europa.eu同时存在写接口并不授予write；route policy只允许公开read endpoint和ECA catalogue，任何registry write、catalogue mutation或扩大publisher都在网络前拒绝。`dataeuropa/hub/repo@9cd40dc…`仅作Apache-2.0 schema/API漂移参考，不执行、不成为Connector。

## 3. 物化与验证

Dolt保存Pack、report/recommendation/follow-up taxonomy、DCAT/API/method/licence digest、dataset→report relation review和lineage。分析库存放最小report/finding/recommendation/dataset metadata，不复制全文或个人信息。fixtures覆盖selected dataset缺失不代表无report、EU语言rendition去重、dataset supports而非proves finding、follow-up selected subset、auditee claim与ECA assessment分离、write endpoint拒绝和zero effects。
