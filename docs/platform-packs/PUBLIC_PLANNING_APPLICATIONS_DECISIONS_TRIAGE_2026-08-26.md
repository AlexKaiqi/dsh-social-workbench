# 公共规划申请、公众意见与主管机关决定平台分流（2026-08-26）

状态：`researched / architecture-only / no-connector`
核验日期：2026-08-26

## 1. 第一性原理结论

这条Channel的价值不是“哪里有很多反对”，而是可追溯地回答：`申请人请求改变什么土地/建筑状态 → 哪个正式公众参与窗口适用 → 谁以什么程序角色发表何种意见 → 申请人/机构如何回应或修改 → officer/advisory body如何评估或建议 → 哪个competent authority在何阶段作出什么决定/条件 → 是否发生appeal/review → 后续是否另有implementation/occupation evidence`。

application、representation、applicant response、officer assessment、advisory recommendation、competent decision、appeal outcome和physical implementation分别建模。申请不证明需求、事实、可行或应获批准；support/object/comment数量不证明unique people、代表性意见或正确性；批准不证明已建成、合规、入住、有效或成功；公开地址、自然人姓名、submission body和attachment也不自动适合普通索引。

## 2. 首批成员与成熟度

| Member | 互补价值 | 当前成熟度 |
| --- | --- | --- |
| England Planning Data | 全国数据标准与API正在演进，可验证draft schema、synthetic/derived origin、authority coverage与数据漂移 | concept + exact route fixture + selected/manual |
| NSW Planning Portal | application→exhibition→submission→applicant response/amendment→assessment/decision流程清晰，隐私与政治捐赠声明边界强 | concept + catalogue/schema fixture + selected/manual |
| NYC Zoning Application Portal + NYC Open Data | ULURP的Community Board、Borough President、CPC、Council、Mayor多authority chain，可验证advisory与competent decision分离 | concept + exact Socrata dataset fixture + selected/manual |
| Ireland National Planning Applications | 全国聚合参与local authority register，ArcGIS空间表面与重复catalogue元数据漂移明显 | concept + exact ArcGIS route fixture with catalogue drift + selected/manual |

requested=4、concept-fixture=4、exact-member route-fixture=3、catalogue/schema fixture=4、selected/manual=4、callable=0、durable-approved=0。route fixture只证明路径和合同候选，不证明已获准调用、完整population、最新schema或可持久化字段。

本轮只读官方文档、公开dataset landing、固定GitHub revision和静态源码；没有请求任何application/feature/submission row，没有下载规划文档或公众意见，没有安装/执行第三方项目，也没有触发申请、意见、捐赠声明、付款、修改、appeal、contact或subscription。

## 3. 共同事实与敏感数据边界

- approved exact applicant/authority description最多形成`EvidencePublishedPlanningApplication`；背景claim和benefit statement不是verified fact；
- approved exact public/organisation/agency span最多形成`EvidencePublishedPlanningRepresentation`，必须绑定support/object/comment posture、role、window、publication rule和population；
- exact applicant response、agency advice、officer report或advisory recommendation最多形成`EvidenceReportedPlanningAssessment`，必须保留author authority与posture；
- exact competent-authority、appeal body或court record最多形成`EvidenceReportedPlanningDecision`；advisory recommendation、waiver、no action和final decision不互换；
- application lifecycle和decision posture正交；`completed`、`public status`、`determined`不能自动映射approval；
- amendment、renotification、representation、assessment与decision必须指向exact application revision；later revision不能覆盖earlier evidence；
- local/national dataset roster和participating authorities决定denominator；公开聚合库不是所有法定申请的完整集合；
- exact address、coordinate、parcel/lot/BBL/UPRN、applicant/agent/representor姓名、email、phone、postal address、IP、signature、donation declaration、submission body与attachment默认restricted/drop/quarantine；
- public visibility只是必要条件；rights、third-party copyright、privacy、purpose、retention和deletion必须逐surface固定。

## 4. 官方资料与平台风险

### England

[Planning Data API文档](https://www.planning.data.gov.uk/docs)公开`/entity.json`、OpenAPI及CSV/JSON/GeoJSON/Parquet bulk；[planning-application dataset](https://www.planning.data.gov.uk/dataset/planning-application)当前仅少量provider且明确为MHCLG创建、未来将由authoritative sources替换。[About](https://www.planning.data.gov.uk/about/)说明coverage不完整、标准仍在演进；[roadmap](https://www.planning.data.gov.uk/about/roadmap)和[planning application specification project](https://design.planning.data.gov.uk/project/planning-applications)继续更新decision/application模型。该route可做exact fixture，但当前population、origin和schema均不能冒充全国authoritative register。

### NSW

[Online DA Data API catalogue](https://www.planningportal.nsw.gov.au/opendata/dataset/online-da-data-api)称包含2019年以来在线DA、2021年起council强制使用并日更，但公开页面当前只明确提供catalogue、[data dictionary](https://www.planningportal.nsw.gov.au/opendata/dataset/online-da-data-api/resource/95279ab6-b115-4300-bb21-30461dae3985)和broker联系，不足以固定exact API route。[DA exhibitions](https://www.planningportal.nsw.gov.au/daexhibitions)、[exhibition process](https://www.planningportal.nsw.gov.au/major-projects/assessment/state-significant-development/ssd-process/exhibit-da)和[responding to submissions](https://www.planningportal.nsw.gov.au/major-projects/assessment/state-significant-development/ssd-process/respond-submissions)证明submission与applicant response/amendment流程；[privacy policy](https://www.planning.nsw.gov.au/privacy)说明姓名、地址、email、IP、政治捐赠和submission可能被处理/发布/转交。`name withheld`不等于submission body安全。

### NYC

[ZAP Project Data](https://data.cityofnewyork.us/w/hgx4-8ukb/25te-f2tw)固定Socrata dataset ID `hgx4-8ukb`。官方ULURP资料说明DCP certification、Community Board/Borough President建议、CPC hearing/decision、Council/Mayor review是不同authority stage；流程日期必须绑定当期规则，不把历史时限硬编码成永久合同。公开dataset来自ZAP/LUCATS迁移与public subset，变化随milestone更新；BBL companion也含精确property identity，默认不能进入普通projection。

### Ireland

[National Planning Applications catalogue](https://data.gov.ie/dataset/national-planning-applications)给出CC BY 4.0及exact [ArcGIS FeatureServer](https://services.arcgis.com/NzlPQPKn5QF9v2US/arcgis/rest/services/IrishPlanningApplications/FeatureServer)；2026年更新的[重复catalogue项](https://data.gov.ie/dataset/irishplanningapplications1)说明数据来自participating local authorities且覆盖说明与旧项不同。catalogue duplication、2010/2012起始差异、旧resource更新时间与新landing必须形成drift record。公开planning register的[用户指南](https://planning.localgov.ie/sites/default/files/content-page/attachments/LGMA_User_Guide.pdf)证明存在observation/submission写面，但不能在没有exact bridge时推定它与NPAD feature一一对应。

## 5. OSS、Agent Skill与MCP静态审计

| Artifact | fixed revision / license | 可借鉴 | 结论 |
| --- | --- | --- | --- |
| [digital-land/planning-application-data-specification](https://github.com/digital-land/planning-application-data-specification/tree/8c7eee9ffc7ef1e0063d4112931cb12e2ba4e714) | `8c7eee9…` / pinned revision未发现license file | application/decision/timeline/condition、public-register-status、decision-maker taxonomy | 官方标准source；可作schema authority，不假定代码复用权或production completeness |
| [digital-land/digital-land.info](https://github.com/digital-land/digital-land.info/tree/040a17192ceb95b1972674727a48b7f534873992) | `040a171…` / MIT | Planning Data网站/API实现 | exact API/schema reference，不是默认Connector |
| [NYCPlanning/data-engineering](https://github.com/NYCPlanning/data-engineering/tree/03cb07f413017bf023a01705dc6127372edad1c1) | `03cb07f…` / MIT | 官方data-product lifecycle | 官方source reference，不证明ZAP dataset当前字段合同 |
| [NYCPlanning/db-zap-opendata](https://github.com/NYCPlanning/db-zap-opendata/tree/5ad207dc21c41d33af1e858f46f7d255837c7636) | `5ad207d…` / archived / pinned revision未发现license file | CRM→public subset、visibility filtering、BBL lineage | 只作历史lineage；私有CRM client/secret不得接入，public visibility仍需current official dataset验证 |
| [Esri/arcgis-rest-js](https://github.com/Esri/arcgis-rest-js/tree/6b32d2da8302c79837c94361548466f1bd4406f9) | `6b32d2d…` / Apache-2.0 | Feature Service query/schema client | 通用provider参考；edit/admin能力拒绝，代码license不覆盖Irish dataset rights |
| [openaustralia/planningalerts](https://github.com/openaustralia/planningalerts/tree/4d6e415d8ef603b226935983ce0b6c36a4cb0f42) | `4d6e415…` / GPL-2.0 | authority/application/version/comment relation、history/error lessons | scraped federation、exact address/geocode与send-comment write，不作platform truth或Connector |
| [cyanheads/socrata-mcp-server](https://github.com/cyanheads/socrata-mcp-server/tree/a21e6856bcb61f81490c591c651e14d3a3a27174) | `a21e685…` / Apache-2.0 / community | portal discovery、schema-first SoQL、truncation与telemetry | arbitrary cross-portal/query范围过宽，无member/process/privacy/field/population binding；拒绝安装/接入 |
| [daraobeirnecode/esri-mcp](https://github.com/daraobeirnecode/esri-mcp/tree/789122916e85aa4cc75ec3922eca73cc5ed5e435) | `7891229…` / MIT / community | read-only layer discovery/query、pagination、source URL | arbitrary host/layer、exact geocoding与宽credential modes；无planning semantics/rights/privacy binding，拒绝安装/接入 |

Esri官方Location Services MCP当前覆盖地理编码、路径等位置服务，不证明对Ireland NPAD FeatureServer的规划语义查询能力，并可能引入精确位置和计费。未发现由四个平台运营方正式发布、同时满足deployment-aware、planning-aware、public-only和field/privacy-bound的Agent Skill或MCP；结论为`discovery-incomplete`。

规划Skill只保留：`public-planning-source-contract-research/v1`产生versioned knowledge proposal，`public-planning-conformance/v1`只运行synthetic fixtures。未来`approved-public-planning-read/v1`必须逐member固定deployment/jurisdiction/process revision/authority roster/public-only route/fields/window/site precision/purpose/retention/deletion。

## 6. Probe结论

本Channel没有Probe。application、objection/support/comment、political donation declaration、document upload、amendment、payment、appeal/review、status/admin mutation、contact和subscription都可能产生法律、行政、财务、通知或公开记录副作用，全部保持zero effect。主动测试只能在系统自有landing page、问卷或产品实验Channel中进行，不能冒充法定规划参与。
