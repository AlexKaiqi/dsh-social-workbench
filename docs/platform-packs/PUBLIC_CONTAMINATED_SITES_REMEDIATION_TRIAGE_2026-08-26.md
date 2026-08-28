# 公共污染场地、责任与清理修复平台分流（2026-08-26）

状态：`researched / architecture-only / no-connector`  
核验日期：2026-08-26

## 1. 第一性原理结论

这条Channel回答：`哪个program公开了哪一类场地或事件人口 → 在哪一版site/parcel/operable-unit/source-area/medium边界上报告了什么 → notification、detection、risk assessment、statutory designation、responsibility/liability分别由谁作出 → remedy如何被选择、设计、实施和维护 → 某个milestone究竟覆盖一项action、一个phase、一个operable unit还是whole site → closure/deletion/reuse后是否仍有control、monitoring或stewardship → 金额到底是estimate、funding、obligation、expenditure、liability、recovery claim、settlement还是receipt`。

以下事实不可互相升级：事故/通知≠污染认定；潜在/疑似≠检测到≠主管机关确认≠法定重大污染；hazard≠pathway≠receptor≠risk≠actual exposure≠harm；owner/operator/custodian≠potentially responsible party≠accepted responsibility≠adjudicated liability；remedy selected≠implemented；action/phase complete≠whole-site complete；construction complete≠cleanup goals met；deletion/reuse≠无残留污染或长期控制；名录中没有记录≠没有污染。

## 2. 首批成员与成熟度

| Member | 互补价值 | 当前成熟度 |
| --- | --- | --- |
| US EPA SEMS / Superfund | 最完整的discovery→assessment→NPL→RI/FS→ROD→RD/RA→construction→post-construction→deletion/reuse与operable-unit链 | concept + exact official search/report/bulk fixture + selected/manual |
| Canada FCSI / FCSAP | 精确的federal population、十步assessment/remediation-risk-management/confirmatory/monitoring流程、custodian/accepted responsibility与成本口径 | concept + exact official XML/ZIP fixture + selected/manual |
| England Part 2A / EA Special Sites | 法律意义的contaminated land、地方机关分散public registers与全国Special Sites子集 | concept + exact official XLSX fixture + federated/manual |
| NSW EPA CLM | notification→EPA assessment→significant declaration→notice/proposal/audit/ongoing maintenance的分层 | concept + exact monthly XLSX fixture + selected/manual record |

requested=4、concept-fixture=4、exact official machine/bulk route-fixture=4、selected/manual=4、callable=0、durable-approved=0。route fixture只证明可定义资源；不代表已经下载、可长期存储或可索引精确地址、parcel、party、document和raw sample。

本轮只读取官方说明、dataset metadata、固定Git revision和静态文本；没有请求场地数据行、坐标、parcel、人员、notice或sampling value，没有安装或执行第三方项目，也没有通知污染、提交报告、联系责任方或产生平台副作用。

## 3. 官方资料与主要边界

### US EPA SEMS / Superfund

[SEMS Search User Guide](https://www.epa.gov/enviro/sems-search-user-guide)把SEMS定义为CERCLA site与non-site Superfund数据的官方repository，包含1983年以来的assessment/remediation。[Cleanup Process](https://www.epa.gov/superfund/superfund-cleanup-process)明确construction completion只表示全场地所需physical construction完成，即使最终cleanup levels尚未达到；后续仍可能多年运行处理、监测、review和institutional controls。[Post Construction Completion](https://www.epa.gov/superfund/superfund-post-construction-completion)还把O&M、long-term response、five-year review、partial/site deletion分开。SEMS/NPL status不是liability、exposure或safe-unrestricted-use证据。

### Canada FCSI / FCSAP

[Federal Contaminated Sites Inventory](https://open.canada.ca/data/en/dataset/1d42f7b9-1549-40aa-8ac6-0e0302ff2902)只覆盖联邦机关、机构、consolidated Crown corporations监管或政府接受部分财务责任的场地，明确排除私人、其他层级政府与enterprise Crown corporation控制的场地；提供daily XML/ZIP、data dictionary及Open Government Licence Canada。[FCSAP Decision-Making Framework v4.1](https://www.canada.ca/en/environment-climate-change/services/federal-contaminated-sites/publications/decision-making-framework-version-4-1.html)规定十步流程，也明确许多场地可能在1–6步评估后关闭，无需7–10步清理。classification用于本program优先级，不是普适健康损害分数。

### England Part 2A / EA Special Sites

[Statutory Guidance](https://www.gov.uk/government/publications/contaminated-land-statutory-guidance)约束地方机关如何判定法律意义的contaminated land；[住宅场景factsheet](https://www.gov.uk/government/publications/use-of-potentially-contaminated-residential-land-gardens-and-allotments/contaminated-land-in-residential-settings-factsheet)明确历史用途、潜在污染或接受调查都不等于法定认定，必须保留source-pathway-receptor linkage。[EA Special Sites dataset](https://environment.data.gov.uk/dataset/f7971865-e434-4743-ab60-51cc25714971)是截至2025-12-31由地方机关designate的Special Sites及termination子集，不是England全部潜在、调查或Part 2A场地。普通register由各local authority持有，federated coverage必须显式为missing/partial。

### NSW EPA CLM

[Notified and regulated contaminated land](https://www.epa.nsw.gov.au/Your-environment/Contaminated-land/notified-and-regulated-contaminated-land)明确notified sites虽经EPA评估为contaminated，却不一定需要CLM Act监管；[monthly notified-site list](https://www.epa.nsw.gov.au/Your-environment/Contaminated-land/notified-and-regulated-contaminated-land/list-of-notified-sites)仍是potentially contaminated且非穷尽。[Record of notices](https://www.epa.nsw.gov.au/Your-environment/Contaminated-land/notified-and-regulated-contaminated-land/record-of-notices)只收法定orders/notices、未完成approved voluntary proposals、相关site audit statements等，不包含section 60 notifications，并限制自然人owner/occupier/responsible-party信息。Lot/DP与地址是notice当时状态，后续可能改变。

## 4. OSS、Agent Skill与MCP静态审计

| Artifact | fixed revision / licence | 可借鉴 | 结论 |
| --- | --- | --- | --- |
| [digital-land/specification](https://github.com/digital-land/specification/tree/f0d747a37c0ae38fc694196a5e0a3ab81d513c30) | `f0d747a…` / MIT software、OGL content / official planning-data org | source-of-truth与generated documentation | `contaminated-land`仍为alpha geography schema，不是Part 2A active register或Connector；不执行 |
| [cyanheads/epa-mcp-server](https://github.com/cyanheads/epa-mcp-server/tree/2cb57664319e77994604453e690834ddee3a1063) | `2cb5766…` / Apache-2.0 / community | typed tools、partial failure、OpenTelemetry | 宽泛合并SEMS/ECHO/TRI等且压平cleanup status，缺exact program/phase/authority/rights/drop；拒绝安装/调用 |
| [EDGI epa-quantitative](https://github.com/edgi-govdata-archiving/epa-quantitative/tree/013fa48d9b6def1386dac7c341634fb779c4fa71) | `013fa48…` / GPL-3.0 / community / archived | 证明SEMS web crawling历史脆弱性 | notebook crawler不是稳定route contract；拒绝执行 |
| [n8n EPA contaminated-site screener](https://github.com/malonestar/n8n-nodes-epa-contaminated-site-screener/tree/030deaf11209676b0e8419ec42c65dad47666684) | `030deaf…` / MIT / community | partial coverage与human review提示 | 依赖付费Apify actor并把多库/proximity变成property screening verdict，缺authority/rights/field gates；拒绝 |

未发现四个平台运营方正式发布、同时满足exact program/population、phase/posture、privacy/rights、field-drop和zero-effects的Agent Skill或MCP；结论是`discovery-incomplete`，不是“不存在”。

## 5. Probe结论

本Channel没有平台Probe。污染通知、incident/release report、site access、sampling submission、notice/proposal更新、责任方联系、投诉、订阅、appeal、payment与任何admin/write都可能触发监管、法律、公开记录、隐私或财务副作用。主动需求测试只能走系统自有landing page、问卷或实验Channel。
