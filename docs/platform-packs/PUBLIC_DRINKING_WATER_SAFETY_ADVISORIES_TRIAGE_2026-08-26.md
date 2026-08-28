# 公共饮用水质量、违规与公众警报平台分流（2026-08-26）

状态：`researched / architecture-only / no-connector`  
核验日期：2026-08-26

## 1. 第一性原理结论

这条Channel回答：`谁在什么法律与program下运营或登记哪一个供水system → source、treatment works、distribution network、storage、zone、service area和sampling point如何关联 → 什么sample/result采用何种stage、method、unit、statistic、period和qualifier → 哪版standard/requirement是否适用且可比 → comparison、monitoring/reporting/treatment/quality violation分别由谁认定 → 哪个quality/sufficiency/treatment/distribution event影响什么scope → 谁发布何种consumer advisory、何时更新或解除 → corrective action、confirmation result、return-to-compliance、lift recommendation与actual rescission如何演进`。

以下事实不可互相升级：登记≠当前运行、potability或compliance；一个sample/result≠整个system/zone状态；detection≠可与standard比较；exceedance/test failure≠legal violation；monitoring/reporting violation≠contaminated water；“health-based violation”是source taxonomy，不是实际exposure/illness；event notification≠unsafe water reached consumers；boil/do-not-drink/do-not-use notice是protective instruction，不是伤害证明；action/project complete≠water acceptable；infrastructure capable≠operator ready；lift recommendation≠chief/council/supplier actual lift；resolved/archived≠所有风险消失；population served、connections、homes、buildings、systems、tests和advisories不是同一个分母。

## 2. 首批成员与成熟度

| Member | 互补价值 | 当前成熟度 |
| --- | --- | --- |
| US EPA SDWIS / ECHO SDWA | 全国PWS quarterly snapshots、facilities、requirements、violations、enforcement、events和return-to-compliance语义 | concept + exact official bulk/schema fixture + selected/manual |
| England & Wales DWI | public/private supply population、stage-specific tests、annual compliance aggregates、event classification、inspection/enforcement | concept + exact official report/schema fixture + selected/manual |
| Canada ISC First Nations Advisories | short/long-term、boil/do-not-consume/do-not-use、community/EPHO/ISC authority与lift流程 | concept + official selected/map-download candidate + manual |
| New Zealand Taumata Arowai / Hinekōrako | official supply register、registration gaps/withholding、supplier-reported regulation XLSX、consumer advisory taxonomy | concept + exact official XLSX fixture + public-register/manual |

requested=4、concept-fixture=4、exact official machine/bulk route-fixture=2、official report/schema fixture=4、selected/manual=4、callable=0、durable-approved=0。官方公开页面、public register或Crown/government material不自动批准精确service area、critical infrastructure、sampling point、vulnerable facility、household/person、document或raw-value长期索引。

本轮只读取官方说明、report/dataset metadata、固定Git revision和静态文本；没有请求PWS/supply、sample、result、violation、event或advisory数据行，没有安装/执行第三方项目，也没有报告水质问题、发布警报、联系supplier或产生平台副作用。

## 3. 官方资料与平台边界

### US EPA SDWIS / ECHO

[SDWA Data Download Summary](https://echo.epa.gov/tools/data-downloads/sdwa-download-summary)说明SDWIS包含PWSS program的public water systems、monitoring、violations和enforcement；quarterly ZIP由多张CSV通过`SUBMISSIONYEARQUARTER + PWSID`等key关联。MCL/MRDL/treatment-technique、monitoring/reporting与public-notification violations必须分开；`Resolved`还可能表示rule no longer applicable或no further action needed。[Dashboard Help](https://echo.epa.gov/help/drinking-water-qlik-dashboard-help)明确national dashboard有季度更新和约三个月lag，不应查询特定violation的实时状态；primacy data可能更及时、更详细，但各辖区覆盖不同。

### England & Wales DWI

[Drinking Water 2025](https://www.dwi.gov.uk/what-we-do/annual-report/drinking-water-2025/)分别发布public/private supply、company performance与annual reports；[water supplies and testing](https://www.dwi.gov.uk/what-we-do/annual-report/drinking-water-2025/drinking-water-2025-summary-of-the-chief-inspectors-report-for-drinking-water-in-england/water-supplies-and-testing/)固定company、population、works、reservoir、zone与test population。[quality events](https://www.dwi.gov.uk/what-we-do/annual-report/drinking-water-2025/drinking-water-2025-summary-of-the-chief-inspectors-report-for-drinking-water-in-england/drinking-water-quality-events/)是company-notified event，经DWI investigation/classification后才形成监管判断；事件可能发生在source至consumer tap任一环节，也可能来自consumer distribution system。内部company submission file specification证明schema，但不是public read route。

### Canada ISC First Nations Advisories

[About advisories](https://www.sac-isc.gc.ca/eng/1538160229321/1538160276874)把short-term（不足一年）与long-term（超过一年）、boil/do-not-consume/do-not-use、受影响building/part/whole community分开；多数地区由EPHO建议、First Nation chief and council或delegate实际issue/rescind，BC责任面又不同。[Steps to lifting](https://www.sac-isc.gc.ca/eng/1614386700861/1614386717841)依次区分root-cause investigation、infrastructure/operations/training、confirmation testing、EPHO recommendation与community actual lift。[short-term list](https://www.sac-isc.gc.ca/eng/1562856509704/1562856530304)和[long-term map](https://www.sac-isc.gc.ca/eng/1620925418298/1620925434679)各有不同population、财政支持与地域缺口，不能合并成全国全部advisories。

### New Zealand Taumata Arowai

[Public registers](https://www.taumataarowai.govt.nz/for-the-public/public-registers)说明部分supplies到2028前可尚未登记；lapsed记录可能过期，特殊情况下信息可withhold。[Hinekōrako register](https://hinekorako.taumataarowai.govt.nz/publicregister/supplies/)是官方登记面，但公开UI不是稳定API。[performance reports](https://www.taumataarowai.govt.nz/about-us/reports-and-publications/water-services-insights-and-performance)提供supplier-reported Drinking Water Regulation Report及部分XLSX；[notice types](https://www.waterservicesauthority.govt.nz/for-the-public/drinking-water-in-an-emergency/drinking-water-notices)把informational、boil、do-not-drink与do-not-use分开，并要求actual supplier lift后才结束instruction。

## 4. OSS、Agent Skill与MCP静态审计

| Artifact | fixed revision / licence | 可借鉴 | 结论 |
| --- | --- | --- | --- |
| [USEPA PHP SDWIS sample](https://github.com/USEPA/PHP-SDWIS-SAMPLE-Envirofacts-API/tree/1ea2b1b100830696ea6dd0c57992909432de8097) | `1ea2b1b…` / no explicit code licence / official USEPA org | water-system/violation REST示例与state-reported authority | 很旧且README称EPA已放弃对代码完整性/可用性的控制；无current bulk schema、rights/drop/lag；不执行 |
| [cyanheads/epa-mcp-server](https://github.com/cyanheads/epa-mcp-server/tree/2cb57664319e77994604453e690834ddee3a1063) | `2cb5766…` / Apache-2.0 / community | typed tool、partial failure、OTel | `epa_search_water_systems`只做宽泛system search，并把多个EPA program聚合；缺result-standard comparability、violation origin/finality、advisory和field gates；拒绝安装/调用 |
| [thecolab-ai drinking-water-register-nz Skill](https://github.com/thecolab-ai/.skills/tree/a9bc79239ce64cad1f710c94ce5ebb373830fb05/skills/drinking-water-register-nz) | `a9bc792…` / MIT / community | registration≠safety声明、bounded result、stable failure、deterministic fixtures | HTML/Power Pages wrapper，自报`degraded`并包含supplier/document discovery；不是operator-published API，rights/security/notice/compliance coverage不足；拒绝安装/执行 |
| [chaosnhatred epa-envirofacts-api](https://github.com/chaosnhatred/epa-envirofacts-api/tree/3e7f25a6368620a97a32b1203fe4e9b2749a5dad) | `3e7f25a…` / GPL-3.0 / community | old SDWIS water-system/violation model | 逐州多请求并写CSV，示例运行可超过一小时；缺quarter/schema/authority/comparison/rights gate；拒绝执行 |

未发现四个平台运营方正式发布、同时满足exact deployment/program/population、measurement-standard-compliance-advisory分层、privacy/security/rights、field-drop与zero-effects的Agent Skill或MCP；结论为`discovery-incomplete`。

## 5. Probe结论

本Channel没有平台Probe。sample/incident/noncompliance notification、consumer advisory issue/lift、public notice、supplier/contact/complaint/subscribe、service interruption、enforcement response与admin/write都可能触发公共卫生、监管、关键基础设施、通知或资源副作用。主动需求测试只能走系统自有landing page、问卷或实验Channel。
