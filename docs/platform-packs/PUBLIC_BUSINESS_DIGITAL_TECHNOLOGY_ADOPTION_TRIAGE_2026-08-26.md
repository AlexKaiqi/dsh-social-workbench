# Public Business Digital Technology Adoption Triage — 2026-08-26

## 1. 决策

本轮选择“公共企业数字技术采用、能力与障碍”，而不是再增加一个宏观信心、泛创新或社媒热度来源。现有Channel已经能回答企业是否成立、退出、招聘、融资和承受经营压力，却不能稳定回答企业使用哪些数字技术、处于什么采用阶段、为何不用、由谁实施、缺什么技能或安全能力，以及是否计划寻求外部支持。

入选成员：

1. U.S. Census Bureau / NSF NCSES Annual Business Survey（ABS）技术模块；
2. UK ONS Digital Economy Survey / E-commerce and ICT activity；
3. Eurostat ICT Usage and E-commerce in Enterprises；
4. Statistics Canada Survey of Digital Technology and Internet Use（SDTIU）。

四者统一到`PublicBusinessDigitalAdoption*`投影，但不统一programme、population、statistical unit、technology taxonomy、question、stage、time role、representation、weighting、quality、release或lifecycle。

## 2. 第一性边界

- respondent-reported use不等于installed inventory、entitlement、verified configuration、successful deployment或value realised；
- internet、web presence、e-commerce、software、cloud、AI、analytics、IoT、automation、cybersecurity和skills是不同technology；AI不自动等于generative AI；
- not applicable、applicable-not-tested、tested-not-used、current use、intensity和planned use不合并；
- online order不等于online payment、fulfilment、end-customer demand或transaction truth；
- external provider used/planned不等于contract、procurement或qualified lead；financing intention不等于application或approval；
- source-declared barrier是带question与denominator的证据，不是cause、severity、loss或willingness to pay；
- security control不等于有效性；reported incident不等于verified breach、vulnerability、legal finding或root cause；
- business share、employee share、turnover share、monetary value、count和composite不可互换；
- collection year、survey year、reference year、prior calendar year、multi-year window和planned horizon不可互换；
- questionnaire published、results published、machine route current与programme active是四个独立状态；
- mandatory official survey不属于Probe；本系统不得提交问卷或制造统计信号。

## 3. 价值与互补性

| 成员 | 独特价值 | 关键限制 | 当前 standing |
| --- | --- | --- | --- |
| Census/NCSES ABS | 历史technology adoption stage；当前emerging technology/AI workforce/expertise问卷 | module轮换；当前问卷不等于已发布估计；API key | active / transitioning |
| UK ONS Digital Economy Survey | internet、presence、e-commerce、software、cloud、安全控制与监管困难 | 2023暂停；结果档案陈旧；无domain API | paused / archived results |
| Eurostat ICT Enterprises | 跨国harmonised taxonomy、AI/cloud/e-commerce/skills/security与DII | 10+主population；country deviation；topic cadence与DII components变化 | active |
| Statistics Canada SDTIU | 细粒度non-use reasons、external implementation、financing、cloud spend、AI与skills | biennial/occasional；release population与table micro coverage需分开 | active/next cycle unknown |

## 4. 研究与接入结论

只固定官方知识和机器路由，不取observation：

- ABS：官方programme、method、questionnaire、data/API目录；历史`/data/2022/absmcb` variables/group fixture；真实query需要API key。
- ONS：programme/status、questionnaire、QMI、historical workbook landing；无本领域公开API。
- Eurostat：ESMS/DII metadata、Statistics API dataset code、SDMX structure/codelist与bulk distribution fixture。
- SDTIU：record 4225、questionnaire、Daily release/PIDs、WDS PID/cube fixture。

generic client成功不提升domain maturity；必须绑定program + question + taxonomy + estimator + release。

## 5. Agent Skill、MCP、SDK与OSS审计

| 候选 | 固定版本 | 结论 |
| --- | --- | --- |
| [US Census Data API MCP](https://github.com/uscensusbureau/us-census-bureau-data-api-mcp/tree/5dcaa637871b9ded5dab415118f9008c06d13f2a) | `5dcaa637871b9ded5dab415118f9008c06d13f2a` | authority-org/CC0；generic Census API + key + Docker/Postgres seed；不含ABS technology domain semantics |
| [ONS dp-dataset-api](https://github.com/ONSdigital/dp-dataset-api/tree/8ae5bbf09e2e086c09bcbbbb4992bafcdbaa50d6) | `8ae5bbf09e2e086c09bcbbbb4992bafcdbaa50d6` | authority-org/MIT；内部publication service，含MongoDB/Neo4j/Kafka与write lifecycle；不是公开调查client |
| [Eurostat restatapi](https://github.com/eurostat/restatapi/tree/a0bce063c60aef1033ea696d91d26e1158c2c4b0) | `a0bce063c60aef1033ea696d91d26e1158c2c4b0` | authority-org/EUPL；R transport client、SDMX/TSV/codelist/cache；没有本Channel语义 |
| [statistics-canada](https://github.com/pbouill/statistics-canada/tree/bbfb5946ec07f5ebf61ea5e4327a8efdee6e7423) | `bbfb5946ec07f5ebf61ea5e4327a8efdee6e7423` | community/GPL-3.0；generic WDS async client；没有SDTIU question/taxonomy/denominator语义 |

未发现由四个统计programme权威维护、可直接承担本领域语义的Agent Skill。官方页面、机器路由、固定OSS、Agent Skill、installed、callable与durable必须分别记录。本轮未clone、install或execute候选。

## 6. 晋级与退出

晋级顺序：evidence review → static contract → synthetic conformance → route/schema fixture → sandbox live → operational canary → callable → durable。任一步不得由上一层“看起来可用”跳级。

暂停或降级条件：programme/route/license无法确认、question与result无法绑定、taxonomy/denominator漂移未解释、只能靠网页抓取、需要未知第三方代码或平台副作用、可能保存respondent identity/microdata、或generic client被误当domain connector。

本轮成熟度：`requested=4 / concept-fixture=4 / current-questionnaire fixture=3 / historical-questionnaire fixture=4 / exact official machine route-fixture=3 / official table-or-bulk route-fixture=4 / internet-or-connectivity fixture=3 / digital-presence fixture=3 / e-commerce fixture=3 / cloud fixture=4 / AI fixture=3 / data-analytics fixture=2 / IoT-or-automation fixture=3 / cybersecurity-control fixture=4 / reported-security-incident fixture=2 / digital-skills-workforce fixture=3 / adoption-purpose-or-source fixture=3 / explicit-adoption-barrier fixture=3 / technology-spend fixture=3 / workforce-or-business-impact fixture=1 / planned-adoption-or-support fixture=1 / composite-digital-intensity fixture=1 / estimate-quality fixture=4 / programme-lifecycle fixture=4 / selected-manual=4 / callable=0 / durable=0`。
