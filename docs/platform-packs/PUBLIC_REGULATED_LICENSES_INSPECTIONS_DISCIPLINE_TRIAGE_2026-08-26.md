# 公共职业/经营许可、检查与纪律处分平台分流（2026-08-26）

状态：`researched / architecture-only / no-connector`  
核验日期：2026-08-26

## 1. 第一性原理结论

这条 Channel 回答的是：`谁或哪个经营场所申请从事什么受监管活动 → 哪个机关在什么制度下授予何种许可/注册及范围 → 是否发生特定检查 → 投诉、调查、指控、认定和处分如何演进 → 申诉、限制移除、整改或恢复如何改变后续状态`。

subject、establishment、application、license/registration、endorsement/specialty、inspection、complaint、investigation、charge/accusation、finding、sanction、appeal/stay、remediation/reinstatement是独立事实。active/current不证明能力、信誉、实际执业或无违规；expired不等于revoked；complaint/charge不等于finding；condition不必然是纪律处分；reinstatement不抹除历史认定。项目级building/planning permit继续属于`PublicBuildingRegulation*`/`PublicPlanningApplication*`，不能因为都叫license/permit而合并。

## 2. 首批成员与成熟度

| Member | 互补价值 | 当前成熟度 |
| --- | --- | --- |
| NYC DCWP | 经营许可、逐次检查、inspection/investigation产生的charges，共享business ID但保持三套population | concept + exact Socrata dataset fixtures + selected/manual |
| Chicago BACP | 2002年以来issue/renew/change-location/change-capacity/change-activity及cancelled/revoked/revocation-appealed状态历史 | concept + exact Socrata dataset fixture + selected/manual |
| California DCA | 150+专业许可类型、按Agency分文件的月度公开名册，以及跨board但不完全统一的公开处分入口 | concept + exact public-file layout fixture + selected/manual；逐board discipline route不统一 |
| Ahpra National Register | 15个National Boards的自然人专业注册、endorsement/specialty、condition/undertaking/reprimand/suspension与公开决定；批量/API受合同和purpose约束 | concept + public-register/manual + restricted API/extract contract fixture |

requested=4、concept-fixture=4、exact public machine/bulk route-fixture=3、restricted contract/API-schema fixture=1、selected/manual=4、callable=0、durable-approved=0。公开搜索、下载链接或provider API存在都不等于适合“需求发现”用途，也不自动授予批量留存、自然人画像、营销或衍生索引权利。

本轮只读取官方说明、dataset metadata、固定GitHub revision和静态文本；没有请求任何平台数据行、姓名、license number、检查/处分记录或文档，没有安装或执行第三方项目，没有申请、续期、投诉、检查、付款、申诉或修改状态。

## 3. 共同事实与隐私边界

- approved application span最多形成`EvidencePublishedRegulatedLicenseApplication`，不代表批准、需求或能力；
- exact licensing-authority record最多形成`EvidenceReportedRegulatedLicenseAuthorization`，必须绑定authority/board、subject kind、category/scope、standing、issue/effective/expiry与revision；
- exact inspection record最多形成`EvidenceReportedRegulatedActivityInspection`，education-only、no-entry、out-of-business、pass/no-violation-issued和violation-issued分别保留；
- complaint、notification、investigation、charge、accusation或citation最多形成`EvidencePublishedRegulatedLicenseAllegation`，不能升级成finding；
- sustained/dismissed/consent/vacated finding最多形成`EvidenceReportedRegulatedLicenseFinding`，并保留authority与finality；
- sanction、condition、undertaking、probation、suspension、revocation、surrender、prohibition最多形成`EvidenceReportedRegulatedLicenseSanction`；non-disciplinary condition必须显式标注；
- reported completion、authority-verified compliance、variation/removal和reinstatement最多形成`EvidenceReportedRegulatedLicenseRemediation`；
- natural-person identity、license number、address of record、exact establishment address、contact、complaint narrative、health restriction、documents默认restricted/drop；公开可见只满足visibility，不能替代purpose、rights、retention、deletion和correction review。

## 4. 官方资料与平台风险

### NYC DCWP

[Issued Licenses](https://data.cityofnewyork.us/Business/Issued-Licenses/w7w3-xahh)每行是DCWP签发的一张license及当前状态，并可能同时含organization和individual、business/license ID、category、expiry、电话和精确地址。[DCWP Inspections](https://data.cityofnewyork.us/Business/DCWP-Inspections/jzhd-m6uv)每行是一项检查，明确包含Business Education、Pass、No Violation Issued、Violation Issued、Out of Business等结果；[DCWP Charges](https://data.cityofnewyork.us/Business/DCWP-Charges/5fn4-dr26)每行是inspection或General Counsel investigation产生的charge，不是最终裁决。三者可以按source-declared ID建立exact relation，但不能靠名称/地址相似强合并。

[NYC Open Data Terms](https://data.cityofnewyork.us/stories/s/Terms-of-Use/k9k7-3cje/)说明提交agency才是authoritative source，数据可被更新、覆盖且旧版本不保留，也不保证完整准确；因此必须记录schema/source watermark和自有版本快照，并在普通分析前剔除身份、联系方式和精确位置。

### Chicago BACP

[Business Licenses](https://data.cityofchicago.org/Community-Economic-Development/Business-Licenses/r5kz-chrr)固定dataset ID `r5kz-chrr`，描述issue、renew、change location/capacity/expansion/business activity及AAI/AAC/REV/REA状态；一个account、site、license number和application number不是同一身份。官方[2025-02 change notice](https://data.cityofchicago.org/stories/s/Change-Notice-Business-Licenses-2-20-2025/yu97-as3j/)及[2025-09 change notice](https://data.cityofchicago.org/stories/s/Change-Notice-Business-Licenses-9-25-2025/pnmi-a3z5/)证明schema与地址发布规则持续变化。

[Chicago Data Portal FAQ](https://data.cityofchicago.org/stories/s/Data-Portal-FAQ/iy9c-7e89/)说明dataset导出/API存在，也明确community view只是派生视图；本Pack只认base dataset ID。许可metadata为`See Terms of Use`，durable晋级前仍需固定当时有效条款。Business Owners数据含自然人姓名/职务，本Channel默认不接。

### California DCA

[Licensee Lists Overview](https://www.dca.ca.gov/consumers/public_info/index.shtml)说明DCA覆盖150+专业许可类型，每个Agency有独立文件夹、月初自动刷新，并给出Agency、license type/number、individual/organization、姓名、公开地址、issue/expiry/status的固定layout；同时列出不包含的Agencies，故该名册不是DCA全量。[DCA License Search](https://search.dca.ca.gov/)显示current/expired和suspension/revocation等disciplinary status，但若干实体使用独立系统。

[California Board of Accountancy lookup说明](https://www.dca.ca.gov/cba/consumers/about-lookup.shtml)是处分语义样本：accusation只是allegation；probation、revocation、surrender、stayed和reinstatement有不同法律效果，summary可能滞后且不能替代order，也可能被法院stay/modify。[Formal Accusations](https://www.dca.ca.gov/cba/consumers/formal_accusations.shtml)再次明确pending accusation不是wrongdoing的最终认定。逐board保留各自publication window和术语，不能把CBA规则推广给所有DCA Agency。

### Ahpra

[Register使用说明](https://www.ahpra.gov.au/registration/registers-of-practitioners/tips-for-using-the-public-register.aspx)把National Register定位为当前注册状态的权威公开入口，并发布部分adverse disciplinary decisions链接；[Register术语](https://www.ahpra.gov.au/Registration/Registers-of-Practitioners/Terms-in-the-Register)区分profession/division/type/subtype、endorsement、specialty、condition、undertaking、reprimand、suspension等。[possible outcomes](https://www.ahpra.gov.au/Notifications/How-we-manage-concerns/Possible-outcomes.aspx)明确condition可能因返岗或健康而设，并非总是disciplinary；健康条件细节通常不公开，caution通常也不进register。

[External data exchange services](https://www.ahpra.gov.au/Registration/Employer-Services/External-data-exchange-services)说明PIE API只面向approved healthcare organisations，多数服务要求批准和法律合同；整份National Register copy还需public-interest审查。[copy/extract说明](https://www.ahpra.gov.au/Registration/Employer-Services/External-data-exchange-services/National-Register-Copy-or-Extract)规定按board收费、用途绑定、整表不可转供，且不含contact/sensitive information。此成员只能固定public manual与restricted-contract能力，不能用网页搜索模拟开放API。

## 5. OSS、Agent Skill与MCP静态审计

| Artifact | fixed revision / license | 可借鉴 | 结论 |
| --- | --- | --- | --- |
| [cyanheads/socrata-mcp-server](https://github.com/cyanheads/socrata-mcp-server/tree/a21e6856bcb61f81490c591c651e14d3a3a27174) | `a21e685…` / Apache-2.0 / community | portal发现、schema-first SoQL、分页和分析spill | 任意portal/dataset/query过宽，无member/dataset/purpose/person-field binding；拒绝安装/接入 |
| [npstorey/civic-ai-tools](https://github.com/npstorey/civic-ai-tools/tree/0fde247f46d44ecfdf9d3dca8d8a66c5ed2504fb) | `0fde247…` / MIT / community | civic MCP目录、Socrata query Skill、evidence publishing思路 | 默认连接NYC 2,000+ datasets并由setup脚本装配服务，不含许可域事实、权限或字段drop；拒绝安装/调用 |
| [promisingcoder/gov_websites_collector](https://github.com/promisingcoder/gov_websites_collector/tree/92860f5d5b6356b54def7f6bda525c8c8ad9ab28) | `92860f5…` / MIT / community | 跨州source adapter与统一schema警示 | README明确Camoufox反检测、proxy rotation和绕过Cloudflare/Incapsula；违反本项目边界，明确拒绝 |
| [socrata/soda-js](https://github.com/socrata/soda-js/tree/d6d528c919b6586abe211fdc8924af439677c830) | `d6d528c…` / package声明MIT / official Socrata org | SODA客户端与query构造 | 只是通用传输库，不携带exact dataset、public-field、rights、person/privacy或zero-write policy；不直接复用为Connector |

未发现四个平台运营方正式发布、同时满足exact deployment、许可域语义、public-only、purpose/rights、natural-person最小化与zero-effects的Agent Skill或MCP，结论为`discovery-incomplete`。

本Channel仅设计`public-regulated-license-source-contract-research/v1`与`public-regulated-license-conformance/v1`。未来`approved-public-regulated-license-read/v1`必须逐member固定exact dataset/file/board/register、字段allowlist、subject population、history、purpose、rights、retention、deletion和correction机制。

## 6. Probe结论

本Channel没有平台Probe。license application/renewal/change、exam、inspection scheduling/result、complaint/notification、document/payment、appeal/review、restriction removal、reinstatement、contact/subscription与任何status/admin write都可能产生法律、监管、财务、就业、通知或公开记录副作用，全部保持zero effect。主动需求测试只能走系统自有landing page、问卷或实验Channel。
