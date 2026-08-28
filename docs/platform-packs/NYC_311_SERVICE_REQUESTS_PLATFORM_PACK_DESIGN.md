# NYC 311 Service Requests Platform Pack 设计

状态：`researched / concept+route-fixture / no-local-binding`  
核验日期：2026-08-26  
Pack ref：`nyc-311-service-requests/v0-design`

## 1. 概念、人口与漂移

当前官方catalogue将原入口明确为[311 Service Requests from 2020 to Present](https://catalog.data.gov/dataset/311-service-requests-from-2010-to-present)，origin dataset ID为`erm2-nwe9`，并把2010–2019指向独立archive `76ig-c548`。catalogue显示新资源在2025-12-23发布、daily更新；这构成必须验证的temporal split，而不是把旧“2010 to Present”名称继续当事实。

官方metadata说明该dataset只表示能被directed to specific agencies的service requests；每天大量inquiry/comment/request中并非全部进入该人口。每行可含complaint type、responding agency和geographic location，但不披露requester PII；expected field values会随时间变化且列表不穷尽。

| Native concept | `PublicCivicServiceRequest*` | 约束 |
| --- | --- | --- |
| Unique Key / service request | request identity | 不等于unique person或incident |
| complaint type/descriptor | service taxonomy | mutable values，按schema revision固定 |
| agency/responding agency | assignment authority | assignment不证明action/completion |
| created/closed/updated dates | schedule/current-state | updated不证明完整event history |
| status/resolution text | native state/disposition | closed不自动客观resolved |
| geographic fields | source location precision | ordinary projection coarse/drop |

## 2. Capability与route fixture

route fixture固定两个独立Socrata resources、DCAT distribution及described-by schema reference；只合成验证JSON/CSV/GeoJSON representation、2020 boundary、identity、current-state update、query coverage和common-origin。未调用dataset query/export，也未获取任何row。

[NYC API Developers Portal](https://api-portal.nyc.gov/)存在独立订阅型API surface，但官方静态artifact不足以把exact-ID lookup、list population、rate、fields和partner create完整绑定到本Pack。community MCP的说明不能替代官方合同，因此该surface只保留candidate，不计route maturity，不接API key。

## 3. Rights、隐私与验证

catalogue当前`license=null`，技术公开与政府metadata不等于已证明的长期AI/index/redistribution rights。durable materialization保持blocked，直到NYC exact terms、attribution、retention和location用途完成review。

ordinary projection删除exact address、cross-street细节、building/unit、coordinates、media、contact和free text，仅在批准时保留ward/borough/neighbourhood级opaque ref。fixtures覆盖2019/2020 split无gap/重复、旧标题漂移、expected values新增、agency-directed population、同人/同incident多请求、closed但复发、current-state覆盖、PII/location drop、API-key candidate不fallback和POST/create zero effects。
