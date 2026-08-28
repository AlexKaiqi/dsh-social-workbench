# Public Digital Access, Skills & Online Participation Triage — 2026-08-26

## 1. 选择结论

本轮选择“公共数字接入、技能与线上参与”。现有体系能观察企业数字采用，却没有独立回答个人/家庭是否能接入、为何不使用、使用何种设备、能否完成线上活动、需要什么帮助，以及对隐私、安全和线上伤害的报告。它是产品机会的aggregate hypothesis source，不是“数字弱势人群名单”。

入选成员：

1. U.S. NTIA Internet Use Survey / Census CPS Computer and Internet Use Supplement；
2. Ofcom Adults’ Media Literacy Tracker / Adults’ Media Use and Attitudes；
3. Eurostat ICT usage in households and by individuals（`isoc_i`）；
4. Statistics Canada Canadian Internet Use Survey（CIUS，survey 4432）。

四者统一到`PublicDigitalAccessParticipation*`，但programme、household/person population、respondent/proxy、question route、reference window、representation、weight、quality、release和rights不合并。

## 2. 第一性边界

- household access、individual use、internet-user routed question、device ownership与device use分别建模；
- “家中可以使用互联网”不等于网络可铺设、订阅、可靠、足速、可负担或每个人能独立使用；
- self-reported skill activity或confidence不等于tested proficiency、qualification或employability；
- performed activity不等于successful completion、benefit、satisfaction或service quality；
- online purchase、banking或government interaction不等于payment/fulfilment、entitlement/application outcome；
- privacy/security concern不等于incident；incident/harm response不等于verified breach、legal finding、root cause或provider fault；
- non-use/barrier不等于cause、severity、WTP、vulnerability、product request或lead；
- age、sex、education、income、disability、region等只允许approved aggregate breakdown；不得反推个人或用作consequential targeting；
- current、past 3 months、past 12 months、survey year和collection period不可互换；
- composite必须保留component set、eligibility和algorithm；问卷变化不能静默续series；
- official survey response/submission不是Probe，本系统不代填、不招募、不联系受访者。

## 3. 成员增量与生命周期

| 成员 | 独特增量 | Population / time | 官方表面 | 当前状态 |
| --- | --- | --- | --- | --- |
| NTIA/Census | internet/device、smartphone-only、home non-use reasons、online activities、replicate-weight方法 | CPS household/person；periodic supplement | NTIA Data Explorer/analyze table + public-use files；Census tech docs | latest published results 2023；2025 instrument consultation不是results |
| Ofcom | media literacy、confidence/understanding、platform/media activities与态度 | UK adults 16+；2025 tracker fieldwork | 2026 report；2025 questionnaire/technical report/tables/respondent CSV | current annual report；本Channel不采用respondent-level CSV |
| Eurostat `isoc_i` | harmonised access/use/e-government/e-commerce/e-skills/privacy与country quality | household + individuals 16–74；annual | Eurobase/Statistics API/SDMX + comprehensive database | active annual；question/modules change by year |
| StatsCan CIUS | access/device/use、social connection、government/e-commerce、privacy/security、skills、online work | persons 15+ in ten provinces；occasional | survey 4432 questionnaire + tables/WDS/SDMX + PUMF | latest confirmed cycle 2022；PUMF not adopted |

## 4. Agent Skill、MCP、SDK与OSS

| 候选 | 固定版本 | 决策 |
| --- | --- | --- |
| [NTIADC/ntia-internet-use-survey](https://github.com/NTIADC/ntia-internet-use-survey/tree/1410bad7099be1b82ccc5570b69d3fe4323da5e1) | `1410bad7099be1b82ccc5570b69d3fe4323da5e1` | authority-org；import/table/sample/tech-doc witness；未见license文件，`static-reference-only` |
| [stevegoossens/ofcom](https://github.com/stevegoossens/ofcom/tree/efcded323a6a2f6ce1067fd75f8f2d093c7300c1) | `efcded323a6a2f6ce1067fd75f8f2d093c7300c1` / MIT | postcode broadband/mobile API client，与Media Literacy Tracker不同domain，`rejected-for-this-pack` |
| [eurostat/restatapi](https://github.com/eurostat/restatapi/tree/a0bce063c60aef1033ea696d91d26e1158c2c4b0) | `a0bce063c60aef1033ea696d91d26e1158c2c4b0` / EUPL | authority-org SDMX/TSV transport；不含question/population/composite semantics，`reference-only` |
| [Aryan-Jhaveri/mcp-statcan](https://github.com/Aryan-Jhaveri/mcp-statcan/tree/ff34ecd7462000ac4e23b7b2f1076d93e22b3f33) | `ff34ecd7462000ac4e23b7b2f1076d93e22b3f33` / MIT | WDS/SDMX/MCP广表面，hosted processor与download/SQLite越界，`fixture-reference-only` |
| [warint/statcanR](https://github.com/warint/statcanR/tree/d21b8bf905f32e4ccb8a7d604e24a2e92c184fef) | `d21b8bf905f32e4ccb8a7d604e24a2e92c184fef` / MIT | table discovery/full download与optional LLM search；不拥有CIUS口径，`reference-only` |

未发现由四个programme权威维护、承担本Channel语义的Agent Skill。检索到generic open-data Skill也不能替代programme/question/domain contract。本轮没有clone、install、execute或调用任何候选。

## 5. 晋级与成熟度

evidence review → static contract → synthetic conformance → route/schema fixture → approved aggregate-only sandbox live → operational canary → callable → durable。微数据、respondent identity、rare cells、free text、contact和survey submission始终在独立高风险门外。

成熟度：`requested=4 / concept-fixture=4 / programme-fixture=4 / questionnaire-fixture=4 / latest-published-result-fixture=4 / official-aggregate-route-fixture=3 / official-file-route-fixture=4 / household-access=3 / individual-use=4 / device=4 / non-use-barrier=4 / affordability=4 / reported-quality=3 / skill=4 / communication=4 / commerce=4 / government=4 / health=2 / work-learning=3 / privacy-security=4 / online-harm=2 / assistance-accessibility=3 / composite=3 / quality=4 / lifecycle=4 / selected-manual=4 / callable=0 / durable=0`。
