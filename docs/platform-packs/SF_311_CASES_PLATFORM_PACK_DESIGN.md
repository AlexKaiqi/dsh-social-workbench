# San Francisco 311 Cases Platform Pack 设计

状态：`researched / concept+route-fixture / no-local-binding`  
核验日期：2026-08-26  
Pack ref：`sf-311-cases/v0-design`

## 1. 概念与coverage

[311 Cases catalogue](https://catalog.data.gov/dataset/311-cases)固定origin dataset `vw6y-z8j6`、JSON/XML/CSV distributions、PDDL-1.0，以及2008-07-01以来带location的SF311 cases。[DataSF官方explainer](https://sfdigitalservices.gitbook.io/dataset-explainers/311-cases)进一步限定：主要包含与place/thing相关的cases；用户自身税务、permit等needs一般不包含；2008-07-01前因data structure变化排除。

explainer列出public、customer-service-representative和agency-internal等origin，并明确一件incident可产生多条request、一人也可重复提交、问题解决后可再次发生。因此每条row只形成`published-civic-service-request`，任何unique incident/person或recurrence结论都需独立relation/evidence。

## 2. 状态、位置与representation

| Native concept | 抽象 | 约束 |
| --- | --- | --- |
| case/category/request type/detail | request + classification | app category与dataset form可能不一一对应 |
| responsible agency | assignment | addressing不等于解决 |
| status/status notes | state + disposition content | 只证明source-declared workflow |
| source | origin/channel | Integrated Agency不是resident demand |
| latitude/longitude/address | source precision | 缺坐标不等于无location；ordinary projection drop/coarsen |
| description/photo/contact | restricted source content | official explainer说明不在open dataset关联/发布 |

catalogue称nightly约06:00 Pacific加新数据，explainer称每日约10:00刷新；这是`refresh-contract-conflict` fixture，不能擅自选一个。2022 redistricting还重写historical supervisory district，并新增旧boundary字段，证明地理classification会retroactive change。

## 3. Open311、物化与验证

SF说明Open311可供app提交request，open-data portal另提供read-only API。共同标准不合并能力：本Pack只保留`vw6y-z8j6` read route fixture；Open311 POST/report、media和requester workflow明确拒绝。

Dolt保存Pack、dataset/schema/taxonomy/privacy/licence/refresh conflict、redistricting lineage和common-origin review。分析库只接获准的service/category/agency/status/coarse geography metadata；不接description、photo、contact、address或coordinates。fixtures覆盖四request多种incident解释、agency-internal source、app category/form mismatch、missing coordinates、status note privacy、historical ward rewrite、refresh conflict、page/API duplicate和zero POST。
