# CPSC Recalls Platform Pack 设计

状态：`researched / concept+native-route-fixture / no-local-binding`  
核验日期：2026-08-26  
Pack ref：`cpsc-recalls/v0-design`

## 1. 产品与population

CPSC的[Recalls API page](https://www.cpsc.gov/Recalls/CPSC-Recalls-Application-Program-Interface-API-Information)与[programmer guide](https://www.cpsc.gov/s3fs-public/RecallRetrievalWebServicesProgrammersGuide20180917.pdf)描述公开Recall REST，返回JSON或XML。它是recall publication表面，不是SaferProducts.gov incident-report OData，也不是Report an Unsafe Product写入口。

核心对象包括RecallID/number/date/title/description、Products、Hazards、Remedies、Manufacturers/Retailers等机构、Images、Countries和可选incident/injury陈述。数组项必须保留一对多关系，不能把一个recall flatten成多个独立recall，也不能把incident count当完整分母。

## 2. 映射、安全边界与降级

Recall映射event/notice，Products映射affected product，Hazards映射source-attributed risk，Remedies映射corrective measure，manufacturer/importer/distributor/retailer只作organization/operator refs。consumer contact是处置说明的一部分时仅保留非身份化instruction；电话、地址、人员姓名、email等默认drop。

- recall不是incident report，hazard不是confirmed injury cause；
- published notice不证明所有单位、零售商、国家或消费者已触达；
- image和外链不自动获取；正文和第三方作品分别做content/right gate；
- API失败不得fallback到HTML search、browser、OData incident API或community mirror；
- Recall REST只读；report、contact、订阅和全部write/effect不属于本binding。

## 3. 开源、Fixture 与晋级

[api-evangelist CPSC profile@1b57a04](https://github.com/api-evangelist/consumer-product-safety-commission/tree/1b57a04afcc1a31e401e8e57e4de94e075149901)明示为第三方文本/API profile而非CPSC实现，且根license未发现；只能作官方guide的差异线索，不能复制schema或替代官方authority。未发现CPSC官方Agent Skill、MCP或维护中的官方客户端。

synthetic fixture覆盖one recall→multiple products/hazards/remedies、JSON/XML common-origin、incident assertion、机构authority、missing/null array、amendment/withdrawal、contact drop、image quarantine、incident API confusion和zero report/write。Telemetry按`format × recall × product × hazard × remedy × schema revision`记录coverage、array completeness、relation conflict、PII/content rights和zero effects。真实API、网页、图片、incident corpus或长期materialization另行授权。
