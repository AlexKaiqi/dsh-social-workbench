# Statistics Canada SDTIU Platform Pack

## 1. 定位

Survey of Digital Technology and Internet Use（SDTIU，record 4225）是Statistics Canada的mandatory biennial business survey，研究数字技术对Canadian enterprises的采用和影响。2023 questionnaire同时提供细粒度technology use、non-use reasons、external implementation、next-12-month plans、financing intent、cloud spend、AI、data/security与skills概念。

本Pack只处理public questionnaire、method/release/table/PID/cube知识与未来approved aggregates；不接survey response、identified enterprise或microdata。

## 2. 官方知识与路由

- [SDTIU participant page](https://www.statcan.gc.ca/en/survey/business/4225)：purpose、mandatory/biennial status与contact boundary。
- [2023 questionnaire](https://www23.statcan.gc.ca/imdb/p3Instr.pl?Function=assembleInstr&Item_Id=1524812&lang=en)：internet、presence、e-commerce、ICT、external implementation、financing、cloud、IoT、AI、analytics/security和skills definitions。
- [2023 release](https://www150.statcan.gc.ca/n1/daily-quotidien/240917/dq240917c-eng.htm)：2024-09-17 published result context。
- [release table list](https://www150.statcan.gc.ca/n1/daily-quotidien/240917/dq240917c-cansim-eng.htm)：official PIDs。
- [Web Data Service](https://www.statcan.gc.ca/en/developers/wds)与[WDS guide](https://www.statcan.gc.ca/en/developers/wds/user-guide)：PID/product/cube metadata and data routes。
- [Open Licence](https://www.statcan.gc.ca/en/terms-conditions/open-licence)：attribution、no endorsement与anti-reidentification。

Selected PID fixture包括`22-10-0116-01` internet access、`0117` ICT used、`0119` internet non-use reason、`0120` web presence、`0121` no-presence reason、`0123` online orders/purchases、`0124` gross online sales以及相关regional/share tables。PID必须绑定questionnaire/release/cube；本轮不调用WDS observation route。

## 3. Population与语义

2023 sample来自Business Register，覆盖大多数industry、1+ employee并应用industry revenue thresholds/exclusions；样本约10,000、response约61%、weighted。release headline为可比性使用5+ employees，而tables含1–4 micro categories；两种population不能互相覆盖。

| SDTIU concept | Canonical binding | 拒绝推断 |
| --- | --- | --- |
| online order/commitment | e-commerce order | online payment或fulfilment |
| current external implementation | expertise source | contract amount、vendor identity或qualified lead |
| next-12-month external party | planned support | procurement/solicitation/commitment |
| seek ICT financing | financing intent | application、approval、funding或purchase |
| cloud types/spend/non-use | use/spend/barrier | verified configuration、budget或vendor revenue |
| AI types/non-use | taxonomy/use/barrier | stable genAI series跨revision |
| data/security methods | security control | effectiveness/compliance/absence of breach |
| ICT specialist/training/employment | skill-workforce | identified employee fact |

2023 generative-AI taxonomy是新问题；具体AI type跨期比较必须有taxonomy/question gate。Programme可标`active`到已有证据的2023 cycle，未来cycle为unknown，不能自行推定2025/2026 collection。

## 4. Connector、OSS与Skill

未来capability：survey/questionnaire/release discovery、PID/cube metadata fixture、approved WDS small-cell read、table revision reconciliation、quality/licence drift。无survey submission、business lookup、respondent contact、microdata、download-all或Probe。

[statistics-canada](https://github.com/pbouill/statistics-canada/tree/bbfb5946ec07f5ebf61ea5e4327a8efdee6e7423)固定于`bbfb5946ec07f5ebf61ea5e4327a8efdee6e7423`，community、GPL-3.0，是generic async WDS client并暴露大量endpoint/retry/cache行为；没有SDTIU questionnaire、technology taxonomy、population或PID-release semantics。未install/execute。

未发现Statistics Canada权威维护的SDTIU Agent Skill。generic WDS client/Skill与domain connector仍是不同层。

## 5. Snapshot、可观测性与验证

Snapshot保存record/survey code、questionnaire/release、population/threshold/exclusions、technology/question/stage、PID/cube/route、estimator/quality、taxonomy/revision/rights与fixed OSS decision；不保存credential、response、file/cell、identity或restricted data。

Drift至少覆盖：survey cadence/future cycle、question wording/routing/options、AI taxonomy、release headline/table population、PID/product/cube/schema、unit/denominator/weight、revision/suppression/reliability、licence/no-endorsement/anti-identification和zero effects。

Fixture至少证明：online order不等于payment；5+ headline不覆盖1–4 table；external provider/financing plans不成为lead/procurement；new genAI category不回填旧AI series；WDS client成功不升级question/denominator maturity；route失败不回退third-party或HTML scraping。

当前`selected-manual`，`callable=0 / durable=0`。
