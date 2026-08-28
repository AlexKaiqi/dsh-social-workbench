# Public Product Recalls & Corrective Actions 候选分诊（2026-08-26）

状态：`researched`；requested=5，concept-fixture-eligible=5，route-fixture-eligible=4，callable=0，durable-approved=0  
目标 Channel：`public-product-recalls/v0-design`

## 1. Coverage 缺口与选择

现有监管投诉Channel观察“有人报告了什么”，但没有稳定表达“主管机构或责任主体已经要求、宣布或实施什么纠正，哪些产品、型号或批次受影响，风险和处置范围是什么”。本轮选择recall/corrective-action而不是泛化司法案件：前者有更清晰的official product/event/action identity、较少当事人隐私和法律解释空间，也不与采购/资助重复。

共同最小事实是publisher/jurisdiction/product population、event/report/campaign/product/range identity、native status、regulator/operator authority、defect/noncompliance/hazard/risk classification、voluntary/requested/ordered basis、remedy/measure、incident assertion、revision/history/coverage、rights与exact lineage。recall不是complaint，campaign不是单个product row，risk classification不是实际伤害证明，terminated/completed也不等于每件产品已回收或修复。

## 2. 候选与当前判定

| 候选 | 独特价值 | 官方表面 | 当前判定 |
| --- | --- | --- | --- |
| FDA openFDA Enforcement Reports | 食品、药品和器械召回事件、hazard class、firm strategy与状态 | [API overview](https://open.fda.gov/apis/)、[food enforcement](https://open.fda.gov/apis/food/enforcement/)、[authentication](https://open.fda.gov/apis/authentication/) | concept+native-route fixture；各endpoint population分开；不是医疗决策或完整lifecycle feed |
| NHTSA Recalls | vehicle/tire/child-seat/equipment campaign、defect/noncompliance、consequence与remedy | [official datasets/APIs](https://www.nhtsa.gov/nhtsa-datasets-and-apis) | concept+native-route fixture；API与bulk独立representation；不得收集VIN |
| CPSC Recalls | 消费品recall、product/hazard/remedy、manufacturer/retailer关系 | [official API page](https://www.cpsc.gov/Recalls/CPSC-Recalls-Application-Program-Interface-API-Information)、[programmer guide](https://www.cpsc.gov/s3fs-public/RecallRetrievalWebServicesProgrammersGuide20180917.pdf) | concept+native-route fixture；Recall REST与SaferProducts incident report严格分离 |
| EU Safety Gate | 非食品危险产品alert、风险、强制/自愿措施与跨国follow-up | [Safety Gate](https://ec.europa.eu/safety-gate/)、[2024 report](https://op.europa.eu/en/publication-detail/-/publication/225ab30f-0a4c-11f0-b1a3-01aa75ed71a1) | concept+manual-export fixture；未发现版本化public API contract，页面中的`/api/`路径不计route |
| Canada Recalls and Safety Alerts | food/consumer/health/device/cannabis/vehicle跨域recall与alert，英法双语 | [official open data](https://open.canada.ca/data/dataset/d38de914-c94c-429b-8ab1-8776c31643e3)、[public site](https://recalls-rappels.canada.ca/en) | concept+official-feed route fixture；JSON/CSV与active/archive、record type、language分别标记 |

route-fixture只计算FDA、NHTSA、CPSC和Canada四个正式machine surface。Safety Gate允许手写或用户提供的export fixture，但不能把未文档化endpoint、浏览器Network观察或community scraper升级成API合同。

## 3. Skills、MCP 与固定开源候选

以下仅完成静态源码、HEAD和根许可证审计；未安装、执行、连接或复制第三方代码：

| Artifact | 固定revision / license | 结论 |
| --- | --- | --- |
| [FDA/openfda](https://github.com/FDA/openfda/tree/fdbe54327901a0c1e30130d1d6a2bbe67b79b77c) | `fdbe543…` / root license未发现 | FDA官方pipeline/API source；只作field transformation、schema和endpoint witness，无license不vendoring |
| [synthetic-sciences/openscience FDA Skill](https://github.com/synthetic-sciences/openscience/tree/95be136c06386eb18546ce94d134d2c7e66976ac/backend/cli/skills/databases/fda-database) | `95be136…` / Apache-2.0 | 社区Agent Skill，包含openFDA query helper；不得从Skill存在性推断official、safe、approved或durable route |
| [writelinez/NHTSA-VehicleData](https://github.com/writelinez/NHTSA-VehicleData/tree/7d063eb1fe30d7cabe472a535ec825df017d26c3) | `7d063eb…` / MIT | 老旧社区.NET wrapper；只作request-shape witness，不作coverage、current schema或生产client |
| [nhtsa-recall-monitor-docs](https://github.com/the-ai-entrepreneur-ai-hub/nhtsa-recall-monitor-docs/tree/a94e5d3f89f96e203d12c0c184e38d51b42dc7e2) | `a94e5d3…` / MIT | 社区Apify wrapper；混合recall/complaint/VIN且需第三方token，不进入official route |
| [api-evangelist/consumer-product-safety-commission](https://github.com/api-evangelist/consumer-product-safety-commission/tree/1b57a04afcc1a31e401e8e57e4de94e075149901) | `1b57a04…` / root license未发现 | 明示第三方API profile；OpenAPI/schema只能用于差异研究，无license不复制，不替代CPSC guide |

未发现主管机构官方发布、专门用于本Channel研究的MCP或Agent Skill。FDA社区Skill、Apify actor和API profile最多是工具/描述候选，不能继承官方authority、数据权利或callable成熟度。

## 4. 选择与下一门槛

五个成员进入共同概念Channel，逐产品独立晋级。下一步只用手写synthetic fixtures验证event/campaign/product/range/action边界、native status、authority、hazard/class/incident assertion、voluntary/requested/ordered、alternate language、amend/correct/withdraw/follow-up、API-vs-bulk/export common-origin、PII drop和zero effects。任何真实API/feed/export/网页、MCP/Skill、recall corpus、VIN/身份、长期materialization、contact/report/submit/write另行授权。
