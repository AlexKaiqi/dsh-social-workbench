# 公共建筑许可、检查、证书与执法平台分流（2026-08-26）

状态：`researched / architecture-only / no-connector`
核验日期：2026-08-26

## 1. 第一性原理结论

这条Channel要回答的是：`什么建筑工作被提出 → 哪个机关在什么规则和有效期下授权 → 哪一项工作/专业/阶段接受了什么检查 → 哪个投诉、现场观察、违法、命令或裁决形成了什么程序事实 → 哪种整改被报告或接受 → 哪种局部、临时或最终证书被签发`。

application、permit authorization、inspection、complaint、violation/order/adjudication、correction/compliance和certificate是独立事实。permit issued不证明开工或完工；一次inspection passed不证明整个项目或持续合规；complaint不证明违法，violation不证明liability或仍未整改；certificate of occupancy不证明当前安全、实际入住或商业成功。Building Information Certificate、Construction Certificate与Occupation Certificate也不能仅因都叫certificate而合并。

## 2. 首批成员与成熟度

| Member | 互补价值 | 当前成熟度 |
| --- | --- | --- |
| NYC DOB NOW / NYC Open Data | application、legacy/current permit、legacy/current CO与多套violation population；适合验证系统迁移、重叠和证书lineage | concept + exact Socrata dataset fixtures + selected/manual |
| Chicago Building Permits / Violations | currently-valid issued permit population、fee validity，以及inspection→multiple violations关系和liability/current-condition限制 | concept + exact Socrata dataset fixtures + selected/manual |
| Toronto Building Permits | 明确Application→Review→Issue→Inspection→Close流程，active与cleared分母分离，并暴露CKAN package/resource revision | concept + exact CKAN metadata/resource fixtures + selected/manual |
| NSW Planning Portal Post-Consent Certificates | CC、OC、BIC、critical-stage inspection、Written Direction Notice及certifier/council权责清晰 | concept + restricted integration API/schema fixture + selected/manual；public exact record route missing |

requested=4、concept-fixture=4、exact-member route-fixture=3、restricted-provider/API-schema fixture=1、selected/manual=4、callable=0、durable-approved=0。机器route、resource ID或OpenAPI只证明合同候选，不证明公开可读、字段获准、population完整或允许持久化。

本轮只读取官方文档、dataset/package metadata、固定GitHub revision与静态文本；没有请求任何permit、inspection、violation、certificate或property数据行，没有下载文档或附件，没有安装或执行第三方项目，也没有触发申请、续期、预约检查、投诉、整改、证书、付款或状态修改。

## 3. 共同事实、身份与敏感数据边界

- approved exact filing/work-description span最多形成`EvidencePublishedBuildingWorkApplication`，不是需求、事实、批准或施工证据；
- exact authority permit record最多形成`EvidenceReportedBuildingPermitAuthorization`，必须绑定authority、work item、status、issue/effective/expiry和fee-validity规则；
- exact inspection record最多形成`EvidenceReportedBuildingInspectionResult`，必须保留stage、discipline、partial/waived/no-entry、reinspection与authority；
- complaint、observation、violation、citation、order、liable/not-liable、appeal/stay、correction与complied分别建模，最多形成`EvidenceReportedBuildingCodeFinding`；
- exact CC/OC/TCO/partial CO/final CO/LOC/completion/BIC记录最多形成`EvidenceReportedBuildingCertificate`，必须绑定certificate type/status/scope/certifier；
- application/permit/work item/building/property/parcel/inspection/complaint/violation/order/adjudication/correction/certificate identity分别保存；只有source-declared exact relation可连接，地址或文本相似只形成candidate；
- exact address、unit、coordinate、parcel/PIN/BBL/BIN/GeoID，以及owner/applicant/contractor/permittee/certifier/inspector姓名、电话、email、地址、license number默认restricted/drop；
- complaint narrative、inspector comments、plans、photos、attachments和certificate documents默认不进入普通索引；public visibility只是必要条件，不能替代purpose、rights、privacy、retention和deletion。

## 4. 官方资料与平台风险

### NYC

[DOB NOW Build Job Application Filings](https://data.cityofnewyork.us/Housing-Development/DOB-NOW-Build-Job-Application-Filings/w9ak-ipjd)、[DOB NOW Build Approved Permits](https://data.cityofnewyork.us/Housing-Development/DOB-NOW-Build-Approved-Permits/rbx6-tga4)和legacy [DOB Permit Issuance](https://data.cityofnewyork.us/Housing-Development/DOB-Permit-Issuance/ipu4-2q9a)分别覆盖filing、DOB NOW issued permit与BIS permit lifecycle；Electrical、Elevator、LAA等另有population，不能把主dataset当全量。[DOB NOW Certificate of Occupancy](https://data.cityofnewyork.us/Housing-Development/DOB-NOW-Certificate-of-Occupancy/pkdm-hqz6)从2021年3月后的DOB NOW模块接续legacy [Certificate of Occupancy](https://data.cityofnewyork.us/Housing-Development/DOB-Certificate-Of-Occupancy/bs8b-p36w)。

[DOB Safety Violations](https://data.cityofnewyork.us/Housing-Development/DOB-Safety-Violations/855j-jady)明确与older [DOB Violations](https://data.cityofnewyork.us/Housing-Development/DOB-Violations/3h2n-5cm9)可能重复，OATH/ECB summons另在[DOB ECB Violations](https://data.cityofnewyork.us/Housing-Development/DOB-ECB-Violations/6bgk-3dad)。本轮未找到可固定的一般建筑检查event/result公共dataset，故inspection coverage为missing，不能由violation或CO倒推。

[NYC Open Data overview/terms](https://opendata.cityofnewyork.us/overview/)说明提交agency是authoritative source、数据可随时更新且不保证完整准确；这要求schema/history watermark和agency attribution，且不能使用community-created filtered view代替官方dataset ID。

### Chicago

[Building Permits](https://data.cityofchicago.org/Buildings/Building-Permits/ydr8-5enu)只含2006年以来currently-valid issued permits；building/zoning fee未付时permit不有效，并排除voided/revoked及若干permit类别，因此不是申请或全部结果历史。[2024 change notice](https://data.cityofchicago.org/stories/s/Change-Notice-Building-Permits-5-1-2024/2mfe-wq8d/)与[2025 change notice](https://data.cityofchicago.org/stories/s/Change-Notice-Building-Permits-10-15-2025/2gan-mdca/)证明字段持续变化，status、milestone、work type、fees、PIN list和permit condition需绑定schema revision。

[Building Violations](https://data.cityofchicago.org/Buildings/Building-Violations/22u3-xenr)从2006年起，每条violation关联inspection且一次inspection可有多条violation；数据同时包含liable和not liable，`Open/Complied/No Entry`也不是统一的法律或当前物理状态。官方说明它是历史/信息用途，房地产交易应另核验。所有community filtered view或map只作发现线索，不作authority。

### Toronto

官方[Cleared Building Permits data story](https://open.toronto.ca/exploring-cleared-building-permits/)定义Application→Review→Issue→Inspection→Close，指出active与cleared是两个dataset、一个项目可有多个机械/管道等permit、2005前后分类不可直接比较，且postal code因Canada Post权利只开放FSA。

CKAN metadata-only核验固定`building-permits-active-permits` package ID `108c2bd1-6945-46f6-af92-02f5658ee7f7`、datastore resource `6d0229af-bc54-46de-9c2b-26759b01dd05`；`building-permits-cleared-permits` package ID `9e42a85b-180f-4dc5-b0d7-d46661a6c0ec`、2017+ datastore resource `a96c0ba4-3026-402b-b09d-5b1268b8f810`及2000–2016 archive resource `c647bdae-0127-425e-86e6-2d88ff0e2adf`。两个package均日更，但package `license_id`为`notspecified`；[Open Government Licence – Toronto](https://open.toronto.ca/open-data-licence/)允许广泛使用但排除personal information和未获授权third-party rights。许可metadata不一致必须阻止durable晋级，不能静默用portal默认覆盖。

### NSW

[Post Consent Certificates](https://www.planningportal.nsw.gov.au/development-and-assessment/post-consent-certificates)区分CC、OC、partial OC和BIC：CC通常在开工前证明计划/规格符合要求；OC允许使用/入住全部或部分建筑；BIC主要在七年内限制council采取某些监管行动并可处理既有违法建造，不等于DA或CC。

[Certification data reporting](https://www.planningportal.nsw.gov.au/news/clarification-certification-data-reporting)说明registered certifier依据Schedule 8经Portal/Common APIs报告CC/OC、Written Direction Notice与Critical Stage Inspection，API名包括`CSIPerformed`、`CSIMissed`、`CreateWDN`和`UpdateWDN`。[Online BIC API](https://www.planningportal.nsw.gov.au/online-bic-application-service-api)是Portal与council IT之间的双向集成，覆盖assessment、inspection、additional information与determination；它不能被当作公共read route。[privacy policy](https://www.planning.nsw.gov.au/privacy)明确姓名、地址、电话、email等可识别信息受保护。当前结论是concept/API-schema可固定，公共逐记录路由缺失。

## 5. OSS、Agent Skill与MCP静态审计

| Artifact | fixed revision / license | 可借鉴 | 结论 |
| --- | --- | --- | --- |
| [cyanheads/socrata-mcp-server](https://github.com/cyanheads/socrata-mcp-server/tree/a21e6856bcb61f81490c591c651e14d3a3a27174) | `a21e685…` / Apache-2.0 / community | portal发现、dataset/schema-first SoQL、DuckDB spill | 任意portal/query范围过宽，无member/dataset/process/public-field/location/privacy/population binding；拒绝安装/接入 |
| [Toronto-inc/toronto-mcp](https://github.com/Toronto-inc/toronto-mcp/tree/755eeae868ec035415db4f6d9576681254ced369) | `755eeae…` / README称MIT，但revision无LICENSE且package未声明license / community | CKAN metadata、resource选择、update/schema分析 | 远程host、500+ datasets、record/sample读取和ranking均超出exact pack；license未被文件证实，拒绝安装/调用 |
| [ondata/ckan-mcp-server](https://github.com/ondata/ckan-mcp-server/tree/e6cf3dacef46c17d0f7f724febe132c9e20c6c30) | `e6cf3da…` / MIT / community | CKAN Action API、source-vs-harvester、untrusted metadata防护 | bundled `ckan-mcp` Skill主动发现约950 portals、可探测source host并查询/下载数据，缺少building-regulation与rights binding；拒绝安装/调用 |
| [open-data-toronto/ckan-customization-open-data-toronto](https://github.com/open-data-toronto/ckan-customization-open-data-toronto/tree/104109c624f897b4f739d1b46b1dc61ef1fa92dc) | `104109c…` / MIT / official open-data org | Toronto custom schema、download/quality/cache endpoints | 官方provider/schema source；包含authorized cache/reindex writes，不是building permit Connector或当前resource合同 |
| [socrata/data-studio-connector](https://github.com/socrata/data-studio-connector/tree/ce75c101e0fb0864332eae19f9ec6f5230db4a43) | `ce75c10…` / revision无license file / official Socrata org | domain+dataset-ID配置 | 旧Google Data Studio connector，private dataset模式要求username/password，不满足credential-ref和field policy；不复用 |
| [Accela V4 API](https://developer.accela.com/docs/api_reference/api-index.html) | official provider docs / deployment-specific auth | record、permit、inspection、condition、history vocabulary | 同时暴露schedule/result/update/delete/document等write，且provider API不证明某city公开route；只作provider concept参考 |
| [OpenCityPipeline paper](https://openreview.net/pdf?id=kD8kGUEO1l) | NeurIPS 2025 workshop paper / 本轮未发现可核验code repo | Socrata/ArcGIS/CKAN跨城schema harmonization研究 | 可借鉴provenance和schema drift问题；不构成可复用代码、官方语义或许可证据 |

未发现由四个平台运营方正式发布、同时满足deployment-aware、building-regulation-aware、public-only、field/location/privacy-bound的Agent Skill或MCP。结论为`discovery-incomplete`。

本Channel仅设计`public-building-regulation-source-contract-research/v1`与`public-building-regulation-conformance/v1`；未来`approved-public-building-regulation-read/v1`必须逐member固定deployment/jurisdiction/code/process、exact dataset/package/resource、public-only route/fields/location precision、purpose、retention和deletion。

## 6. Probe结论

本Channel没有平台Probe。permit application/renewal、inspection request/schedule/result、complaint/referral、correction filing、certificate application、document upload、payment、contact/subscription及任何status/admin/write都可能产生法律、行政、执法、财务、通知或公开记录副作用，全部保持zero effect。主动需求测试只能在系统自有landing page、问卷或产品实验Channel中进行。
