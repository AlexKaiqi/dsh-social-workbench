# Public Household Energy Affordability, Insecurity & Service Continuity Triage — 2026-08-26

## 1. 选择结论

本轮选择“公共家庭能源可负担性、能源不安全与服务连续性”。价格指数只说明价格变化，家庭支出只说明支出，租赁负担也不能回答家庭是否因成本减少基本需要、无法维持安全温度、欠费、进入hardship、收到断供通知或实际断供。该Channel只产生aggregate energy-friction hypothesis，不建立个人贫困/脆弱性画像，不提供能源、信贷、住房、福利或医疗资格判断。

成员为U.S. EIA Residential Energy Consumption Survey（RECS）、England DESNZ Fuel Poverty Statistics、Eurostat EU-SILC energy-poverty indicators和Australia AER Retail Performance Reporting。统一到`PublicHouseholdEnergy*`，但household/person/account population、self-reported/modelled/regulatory-reported authority、indicator、energy service、amount role、event、denominator、quality和release standing全部独立。

## 2. 第一性边界

- energy price、billed expenditure、required energy bill、debt、arrears和fuel-poverty gap不可互换；低支出可能是节省、效率、缺乏服务或rationing；
- self-reported inability/unsafe temperature不是实测室温、健康伤害、住宅缺陷、法律违规或临床事实；
- LILEE是England特定的income-after-housing-costs、required-energy-bill与FPEER双门槛模型，不是任何成员通用“能源贫困”定义；
- disconnection notice、delivery-stop notice、disconnection、reconnection、outage、equipment failure和service unavailability是不同事件；非付款断供不是电网可靠性事故；
- primary occupied housing unit、household、person living in household、residential customer account、gas/electricity account和hardship customer不是同一统计单位；一个家庭可有多个account；
- hardship programme、payment plan、concession、assistance offered、assistance accepted和reconnection不证明问题已解决、债务清偿或客户福利改善；
- final、preliminary、provisional、projected、corrected和regulatory-reported standing必须分开；跨questionnaire、metric、guideline、jurisdiction和reporting-template break默认不续series；
- income、tenure、age、disability、medical need、family violence、life-support和small-geography只允许approved aggregate breakdown；禁止个体推断、targeting或consequential decision。

## 3. 候选比较

| 成员 | 稳定概念与能力 | 官方read路线 | lifecycle/quality重点 | 决定 |
| --- | --- | --- | --- | --- |
| EIA RECS | primary occupied housing units、household survey、energy-insecurity item、heating/cooling equipment、fuel/end use | 2024 preliminary HC tables PDF/XLSX；method/questionnaire；microdata存在但不用 | 2024 household characteristics preliminary；consumption/expenditure计划2027；weighted household counts/RSE与question revision | selected-manual/fixture；callable=0 |
| England DESNZ | LILEE、FPEER、income-after-housing-costs、required energy bill、fuel-poverty gap | annual report/methodology、detailed/supplementary/trend/subregional XLSX/ODS/CSV | 2024 final、2025/2026 projection分开；2026-08-07 correction；national accredited与subregional in-development分开 | selected-manual/fixture；callable=0 |
| Eurostat EU-SILC | inability to keep warm、utility arrears、poverty status、annual population share | Statistics API/SDMX/bulk、DSD/codelist、metadata | self-reported；`ilc_mdes01`/`ilc_mdes07`/`sdg_07_60` denominator与status固定；2021 regulation break | selected-static-route；callable=0 |
| Australia AER | retailer-reported customer count、debt、payment plan、hardship、concession、disconnection/reconnection | quarterly/annual official XLSX；current guideline/template CSV | NERL jurisdiction、fuel/customer class、Schedules 2/3/4/6；2025-07-01 guideline/template break | selected-manual/fixture；callable=0 |

## 4. Agent Skill、MCP 与固定 OSS

- [hilarybg/energy-insecurity@`5653de7`](https://github.com/hilarybg/energy-insecurity/tree/5653de70ca689576bfea4046b566905d3d3a2c73)直接分析RECS energy insecurity，但未发现明确license，且面向microdata/analysis；仅作unlicensed method witness，不执行、不采用。
- [cyanheads/eia-energy-mcp-server@`533d26e`](https://github.com/cyanheads/eia-energy-mcp-server/tree/533d26e3804bdad8b290342db6b55d2c33f78f2a)为Apache-2.0 EIA API v2 MCP，需要API key并可staging数据；它不证明RECS HC file/table route或本Channel语义，保留generic transport candidate，默认不安装/调用。
- [eurostat/restatapi@`a0bce06`](https://github.com/eurostat/restatapi/tree/a0bce063c60aef1033ea696d91d26e1158c2c4b0)为Eurostat维护的EUPL R transport reference，可证明TOC/DSD/codelist/SDMX/bulk能力，不证明energy-poverty definition。
- [dcerecedo/eurostat-mcp@`984a7c7`](https://github.com/dcerecedo/eurostat-mcp/tree/984a7c70cda926bdf245d4d1314c6909f1ac4b15)暴露dataset search/dimensions/data，README声称MIT但license artifact不足；仅作community MCP schema witness，不安装/执行。
- [Artic0din/cdr-energy-research@`b5816db`](https://github.com/Artic0din/cdr-energy-research/tree/b5816dbec09a0f57d7cff374dcf975ef7483b756)研究Australia CDR product-reference plan API，不是AER retail performance数据，且未发现明确license；拒绝作为fallback。
- 当前可用Agent Skills、已安装插件和authority-owned MCP中，没有一个完整覆盖四成员的programme/indicator/denominator/quality/release语义。generic statistics或energy MCP连接成功不得提升domain maturity。

以上仅做网页、README、license和fixed revision evidence review；没有clone、install、build、import或执行未知代码。

## 5. 下一验证阶梯

1. evidence review：冻结programme、indicator、population、denominator、route、rights和revision；
2. static contract：拒绝price/expenditure/debt/gap混合、household/person/account混合、notice/disconnection/outage混合；
3. synthetic fixture conformance：覆盖preliminary/final/projected/corrected、missing/suppressed/not-applicable/zero和四成员break；
4. sandbox live：只在用户另行授权后读取最小official aggregate metadata/one table，禁止microdata、MCP install、dashboard staging和长期索引；
5. operational canary：只在durable route、rights和retention另行批准后，监控schema/question/guideline/revision drift与zero external effects。

本轮不进入第4或第5级。
