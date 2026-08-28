# USAspending.gov Award & Transaction Platform Pack 设计

状态：`researched / concept+official-route-fixture / no-local-binding`  
核验日期：2026-08-26  
Pack ref：`usaspending-award-transaction/v0-design`

## 1. 平台概念与价值

[USAspending API tutorial](https://api.usaspending.gov/docs/intro-tutorial)说明API向公众提供结构化联邦spending data，并列出`/api/v2/search/spending_by_award/`等搜索面；[endpoint index](https://api.usaspending.gov/docs/endpoints)另公开award detail、transactions、subawards、agency/funding与download routes。它能证明来源报告的federal award/financial action，而不能证明采购需求仍开放、合同已经履约、供应商已实际收款或产品成功。

| Native concept | `PublicProcurement*` | 关键边界 |
| --- | --- | --- |
| prime award / IDV | prime-award/award | award summary是roll-up，不是不可变transaction |
| transaction | financial-action | obligation/deobligation等action保留revision与amount role |
| subaward | subaward relation | 不是prime transaction，reporting population另存 |
| awarding/funding agency | authority roles | awarding与funding不互换 |
| recipient | organization role | natural-person recipient与identity字段默认drop |
| NAICS/PSC/place of performance | classification/scope | 不生成market share、delivery proof或location profile |
| obligation/outlay/current/potential value | typed amount | obligation不是outlay，outlay也不自动证明supplier receipt |

`EvidenceReportedProcurementCommitment`只可来自exact award/transaction revision和typed amount；`EvidenceReportedProcurementExecutionEvent`可表达exact reported outlay等source event，但不表达交付、接受或绩效。

## 2. Capability 与 route fixture

concept capabilities包括award/transaction/subaward search、known-ID detail、agency/reference discovery和bulk-job discovery。route fixture固定API v2、GET-vs-read-semantics POST、filter/field/sort/order/pagination、award type codes、response schema/error、last-updated与coverage。`POST /search/*`是read query而不是平台write，但仍是network effect；bulk/download job会产生provider computation，必须单独批准，不能混入metadata canary。

route只允许documented `api.usaspending.gov` endpoint；网页、Elasticsearch、database snapshot、community client、local source deployment和cross-member fallback拒绝。search award、transaction和subaward coverage分别报告；summary count不证明record corpus完整。

## 3. Rights、OSS、Skill与验证

官方source `fedspendingtransparency/usaspending-api@ee4a5bd`固定为CC0-1.0，静态用于endpoint/schema/ETL drift；不安装其Docker/Postgres/Elasticsearch栈。source code licence不自动决定每个linked document或identity字段用途。

`usaspending-source-contract-research/v1`只读官方docs与固定source revision，输出Pack/drift proposal；`usaspending-procurement-conformance/v1`只运行synthetic fixtures。当前没有acquire Skill binding。

fixtures覆盖one award/many transactions、positive obligation/deobligation/outlay、current vs potential value、IDV child award、subaward separate population、awarding vs funding agency、late/corrected transaction、search/grouped/detail common-origin、POST-read effect classification、bulk job excluded、natural-person/recipient identity drop、route unavailable/no fallback和zero writes。

Telemetry按`award type × agency role × award/transaction/subaward × amount role × fiscal/action window × schema/source revision`记录returned/retained/dropped、identity/history conflict、coverage、late correction、amount misuse、privacy drop、rights block和zero mutations。metadata-only canary、bulk、downloads和durable materialization均需用户另批。

