# 公共环境许可、监测、排放与合规平台分流（2026-08-26）

状态：`researched / architecture-only / no-connector`  
核验日期：2026-08-26

## 1. 第一性原理结论

这条 Channel 回答的是：`哪个主体在何地从事何种受监管活动 → 哪项申请产生哪版许可、条件与限值 → 哪个点位产生哪类物理量、采用何种方法/单位/统计口径/期间/推导方式、由谁报告 → 该值能否与哪版限值比较 → 超限、系统生成违规、持证者自报不合规和主管机关认定如何区分 → 检查、执法、整改和恢复如何演进`。

site、facility、installation、activity、source、outfall、monitoring point、application、permit、condition、limit、requirement、measurement、aggregate、release inventory、comparison、violation、enforcement和remediation是独立事实。permit不证明实际运行或持续合规；measurement不自动可与limit比较；exceedance不自动成为法律违规；self-report不等于authority finding；annual release/transfer inventory不是瞬时排放、暴露、损害或permit compliance。

## 2. 首批成员与成熟度

| Member | 互补价值 | 当前成熟度 |
| --- | --- | --- |
| US EPA ECHO / ICIS-NPDES | 许可/限值、DMR自报值、non-receipt、系统生成违规、检查和执法的细粒度水排放链 | concept + exact official service/download fixture + selected/manual |
| England Environment Agency Public Registers | 申请、许可条件、监测、breach、CAR、执法及年度compliance rating；逐dataset权利差异显著 | concept + exact API/dataset fixture + conditional-rights fixture + selected/manual |
| EU/EEA Industrial Emissions Portal | EU Registry身份与年度E-PRTR/LCP排放、转移、能耗；2028起facility→installation迁移 | concept + exact bulk dataset fixture + selected/manual；不是permit-compliance source |
| NSW EPA POEO Public Register | 许可申请/变更、annual return或近实时不合规、notice、penalty、audit、PRP及licensee-published monitoring | concept + public-register/manual fixture；正处制度与门户迁移 |

requested=4、concept-fixture=4、exact official machine/bulk route-fixture=3、selected/manual=4、callable=0、durable-approved=0。公开可读、官方API或CC-BY dataset都不自动批准精确位置、敏感设施、自然人、联系人、投诉文本、文档或长期需求画像。

本轮只读取官方说明、dataset metadata、固定GitHub revision和静态文本；没有请求平台数据行、许可号、点位、测量值、设施记录或文档，没有安装或执行第三方项目，没有申请许可、提交报告、申报不合规、联系机构或产生任何平台副作用。

## 3. 共同证据边界

- 许可申请只形成`EvidencePublishedEnvironmentalPermitApplication`，不证明issue、投资、运行或需求；
- exact authority permit/condition/limit只形成`EvidenceReportedEnvironmentalAuthorization`；
- exact parameter/measurement-kind/method/unit/statistic/period/derivation/reporting-basis/qualifier只形成`EvidenceReportedEnvironmentalMeasurement`；
- 周期性release/transfer/load inventory只形成`EvidenceReportedEnvironmentalReleaseTransfer`；
- 只有单位、方法、统计口径、期间和permit revision可比时，source-reported或derived comparison才形成`EvidenceReportedEnvironmentalThresholdComparison`；derived仍是candidate；
- inspection/audit/CAR/rating只形成`EvidenceReportedEnvironmentalInspection`；
- system-generated、licensee-self-reported与authority-determined violation分别形成`EvidenceReportedEnvironmentalComplianceFinding`并保留finality；
- notice/order/penalty/proceeding/conviction形成`EvidenceReportedEnvironmentalEnforcementAction`；
- completion-reported与authority-verified return-to-compliance分别形成`EvidenceReportedEnvironmentalRemediation`，不抹除历史事实。

## 4. 官方资料与平台风险

### US EPA ECHO / ICIS-NPDES

[ECHO Web Services](https://echo.epa.gov/tools/web-services)提供只读GET式XML/JSON服务，并明确大批量应使用Data Downloads、不得机器人查询ECHO UI。[ICIS-NPDES DMR Summary](https://echo.epa.gov/tools/data-downloads/icis-npdes-dmr-summary)说明DMR是permit holder、州或EPA提交的数据，包含permit condition/limit、reported actual value及是否超限；[ICIS-NPDES Download Summary](https://echo.epa.gov/tools/data-downloads/icis-npdes-download-summary)又区分系统生成的D80/D90 non-receipt、E90 exceedance和人工录入single-event violation。

[About the Data](https://echo.epa.gov/resources/echo-data/about-the-data)说明更新通常按周但可滞后一周至三个月，小设施覆盖可能不存在或不完整；[Known Data Problems](https://echo.epa.gov/resources/echo-data/known-data-problems)在本次核验时还列出California DMR传输问题，可能制造错误的missing/noncompliant/unknown。known-data-alert revision必须先触发quarantine，不能事后作为脚注。

### England Environment Agency

[Public Registers API目录](https://www.api.gov.uk/ea/public-registers-for-environmental-information/)列出申请、许可条件、监测、breach、enforcement及多种EPR/discharge register；[Public Registers Online](https://environment.data.gov.uk/public-register/view/index)把许可、exemption、CAR与enforcement入口分开。

[Consented Discharges with Conditions](https://www.data.gov.uk/dataset/55b8eaa8-60df-48a8-929a-060891b7a109/consented-discharges-to-controlled-waters-with-conditions1)有site/general、effluent amount/time和determinand numerical limit三层，但季度extract排除文本条件且弱于日更register；[Compliance Ratings](https://www.data.gov.uk/dataset/1b268e32-d399-4e1c-87a0-00a17a11fce6/compliance-ratings-waste-and-installations)是整张permit年度breach points/rating，不是单次测量或一般环境表现。两者均标注Environment Agency Conditional Licence，包含purpose、不得再发布和一年期限等限制，所以durable=0，除非另行批准精确用途、期限和删除策略。

### EU/EEA Industrial Emissions Portal

[Dataset页面](https://industry.eea.europa.eu/industrial-emissions/dataset)把EU Registry行政/位置数据与E-PRTR/LCP年度release、transfer、energy和emission报告结合；[Datahub记录](https://www.eea.europa.eu/en/datahub/datahubitem-view/9405f714-8015-4b5b-a63c-280b82861b3d/folder_contents)提供2007–2024版本化CSV/XLS与metadata。设施向主管机关年度报告，主管机关汇编和质量检查，但这仍不等于permit finding。

[About](https://industry.eea.europa.eu/industrial-emissions/about)说明activity capacity与pollutant/waste thresholds共同限定reporting population，并列出国家/年份缺口、土地排放稀疏、历史模型映射和UK Brexit变化；2024/1244又计划从2028起以installation替代facility。schema、reporting unit、threshold和confidentiality必须版本化，不能把年度清单用作超限或危害代理。

### NSW EPA POEO Public Register

[Public Register说明](https://www.epa.nsw.gov.au/Licensing-and-Regulation/Public-registers/about-prpoeo)覆盖licence/application、notice、penalty、conviction、review、audit、pollution study/reduction program；[monitoring publication要求](https://www.epa.nsw.gov.au/Licensing-and-Regulation/Licensing/Environment-protection-licences/Licensing-under-POEO-Act-1997/publishing-and-providing-pollution-monitoring-data)则要求持证者及时公开由许可条件要求取得的监测数据。数据可能是PDF、summary或continuous feed，且某些no-discharge/below-detection值只需解释而不必发布，因此缺值不能直接当未监测。

[2026 licensing reforms](https://www.epa.nsw.gov.au/Licensing-and-Regulation/Licensing/licensing-reforms/licensing-reforms-information-environment)把大多数回溯annual return改为获知后21日内申报不合规，load-based licence仍保留简化annual return，并在短期要求maximum/minimum/mean年度监测汇总；近实时监测提交与新公开平台仍在探索。旧annual-return、new non-compliance report、licensee website measurement和EPA enforcement必须分开，并记录cutover与current-register迁移覆盖。

## 5. OSS、Agent Skill与MCP静态审计

| Artifact | fixed revision / license | 可借鉴 | 结论 |
| --- | --- | --- | --- |
| [eea/industry-frontend](https://github.com/eea/industry-frontend/tree/24c4ac0ae40fccc6d9b442c33c7b019815b23336) | `24c4ac0…` / package MIT / official EEA org / archived | portal的公开组件与前后端分层 | 是已归档门户前端，不是稳定dataset contract、Connector或Skill；不安装/运行 |
| [EDGI ECHO-Pipeline](https://github.com/edgi-govdata-archiving/ECHO-Pipeline/tree/d0d881d1841d048bb3b9bf55e20084713b15ba71) | `d0d881d…` / GPL-3.0 / community | ECHO bulk archive、schema抓取、Delta Lake与API分层 | 价值在可追溯bulk架构；会下载/抓取/运行Docker与PySpark，未固定本项目rights/drop/known-alert规则；拒绝执行 |
| [mps9506/echor](https://github.com/mps9506/echor/tree/f1a13ebad9b6fe897c764a122c5acaeca23c3858) | `f1a13eb…` / MIT / community | ECHO metadata、facility/DMR查询和字段选择 | 通用R client，不保存exact program revision、permit-limit comparability、authority posture或zero-effect policy；仅作静态参考 |
| [cyanheads/epa-mcp-server](https://github.com/cyanheads/epa-mcp-server/tree/2cb57664319e77994604453e690834ddee3a1063) | `2cb5766…` / Apache-2.0 / community | typed tool、partial failure、OTel、cross-source join key | 把ECHO/TRI/AirNow及community-rehosted EJScreen聚合为宽工具，并使用“non-compliant/top polluters”等丢失定义的表面；无exact definition/rights/field-drop gate，拒绝安装/调用 |

未发现四个平台运营方正式发布、同时满足exact deployment/program/resource、许可—监测—比较—认定分层、purpose/rights、敏感位置与身份最小化、known-data alert和zero effects的Agent Skill或MCP，结论为`discovery-incomplete`。

## 6. Probe结论

本Channel没有平台Probe。申请/变更/转移/注销许可、提交DMR/annual return/non-compliance、上传监测数据、报告incident、投诉、联系设施/监管机构、订阅通知、申诉、缴款或任何admin write都可能产生法律、监管、公开记录或通知副作用，全部保持zero effect。主动需求测试只能走系统自有landing page、问卷或实验Channel。
