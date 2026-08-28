# Public Business Insolvency, Liquidation & Restructuring Statistics Channel Pack

## 1. 目的与不可合并事实

本Channel用于发现formal financial-distress procedures在行业、地区、时间和business population中的变化，帮助识别融资、现金流、合规、重组、清算与专业服务压力。它统一`PublicBusinessInsolvency*` projection，但不统一program、legislation、population、statistical unit、procedure、commencement event、outcome、rate denominator、index base、adjustment、quality、release或rights。

可比较partition至少固定：

```text
member + jurisdiction + legislation + program + population + statistical unit
+ proceeding + event + authority + measure + numerator/denominator/scale
+ count/rate/index/amount + reference window + SA/NSA/base/weight/matching
+ industry/geography + quality + release/vintage + rights/access
```

`PublicBusinessDemography*`的death/exit与`PublicBusinessInsolvency*`的formal procedure只能形成aggregate relation candidate。procedure不回填enterprise death，death也不推断bankruptcy。`PublicCorporateDisclosure*`和case/docket/company records不进入本Channel identity graph。

## 2. 成员与能力矩阵

| 成员 | Filing/commencement | Liquidation | Reorganisation/rescue | Receivership/moratorium | Case flow/outcome | Rate | Financial aggregate | Exact official access |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| U.S. Courts | business/nonbusiness filed by chapter | Chapter 7 procedure | Chapter 11/12/13 procedure | no | filed/terminated/pending；无business outcome fixture | no | no | PDF/XLSX tables；无developer API |
| UK Insolvency Service | registered company entering procedure | compulsory/CVL | administration/CVA/restructuring plan | receivership/moratorium | procedure starts；无商业outcome | company + business per 10,000 | no | versioned XLSX/ODS/CSV |
| Eurostat | court declaration started | generic bankruptcy declaration only | no | no | no outcome | index，不是rate | no | Statistics API/SDMX `sts_rb_q` |
| Canada OSB | BIA filing/assignment/order；CCAA filing | BIA bankruptcy | BIA proposal/CCAA | receivership | selected recently-closed CCAA representation | business per 1,000 | declared assets/liabilities | HTML + Open Data XLS/XLSX |

成熟度：`requested=4 / concept-fixture=4 / exact official machine route-fixture=1 / official table-or-bulk route-fixture=4 / filing-or-commencement fixture=4 / liquidation fixture=3 / reorganization-or-rescue fixture=3 / receivership-or-moratorium fixture=2 / case-flow fixture=1 / outcome fixture=1 / rate fixture=2 / financial-aggregate fixture=1 / estimate-quality fixture=4 / selected-manual=4 / callable=0 / durable=0`。case search、MCP connected、PDF parser或generic statistics API不会提高domain maturity。

## 3. Snapshot、分析库与动态物化

Dolt/Git snapshot保存Platform/Channel Pack、program/legislation/population/unit/procedure/event、table/dataset/resource/series/DSD/workbook、measure/denominator/base/weight/adjustment/classification、quality/release/revision/rights、fixed OSS/Skill revision、decision、verification、lineage与tombstone；不保存account/token、未授权data rows/files、PACER/RECAP docket、debtor/company/person identity、case documents或individual financial fields。

未来获得durable授权后，分析数据库只接field-approved aggregates。动态物化视图至少包括：

- `distress-filing-order-declaration-commencement-isolation`；
- `case-proceeding-filing-debtor-company-business-enterprise-legal-unit-person-grain`；
- `business-nonbusiness-consumer-individual-business-classification`；
- `chapter-liquidation-administration-proposal-reorganisation-receivership-moratorium-native-procedure`；
- `voluntary-involuntary-cvl-compulsory-and-initiating-authority`；
- `filed-terminated-pending-flow-stock`；
- `proposed-confirmed-dismissed-discharged-closed-formal-outcome`；
- `formal-procedure-vs-business-death-exit-dissolution-candidate-gap`；
- `monthly-quarterly-annual-one-three-twelve-month-window`；
- `count-rate-index-share-percent-change-and-amount`；
- `numerator-denominator-scale-effective-register-active-business-population`；
- `index-base-country-weight-sa-nsa-calendar-adjustment`；
- `declared-assets-liabilities-claims-recovery-payment-isolation`；
- `sic-naics-nace-geography-size-age-turnover-revision`；
- `matching-unknown-deduplication-migration-suppression-debtor-reported-quality`；
- `preliminary-provisional-current-revised-corrected-final-superseded-lineage`；
- `member-population-procedure-quality-rights-and-comparability-gate`。

跨成员pressure view只消费通过population、unit、procedure、event、window、measure、denominator、adjustment、classification、quality和rights gate的partition，默认发布member-native trend而不是跨国rank。物化按snapshot/release revision可重建；index缺失时回退canonical scan，不回退case search、company register、另一个member或community MCP。

## 4. 可观测性

每次request/fixture/canary记录：

```text
member × publisher/jurisdiction/legislation × program/population/statistical-unit
× publication/dataset/table/resource/series/DSD/workbook × release/vintage
× proceeding/event/authority × measure/numerator/denominator/scale
× count/rate/index/amount × reference window × base/weight/SA/NSA
× match/dedup/migration/confidentiality × industry/geography/classification
× quality/status/rights/access
```

Counters与gauges至少包括：

- requested/returned/retained/dropped/quarantined/suppressed cells、series、tables与files；
- unknown program/table/resource/series/procedure/event/unit/population/status/classification；
- petition-as-order、filing-as-declaration、declaration-as-cessation、procedure-as-death拒绝；
- case/proceeding/filing/debtor/company/business/legal-unit/person mismatch；
- business/nonbusiness、business/consumer、individual-business classification conflict；
- chapter/procedure crosswalk candidate与unapproved cross-jurisdiction equivalence rejection；
- liquidation-as-complete、reorganisation-as-success、terminated-as-discharge/payment rejection；
- filed/terminated/pending flow-stock、monthly/quarterly/annual/rolling-window mismatch；
- count/rate/index/percent-change/amount、numerator/denominator/scale/base missing；
- effective-register/active-business/legal-unit/business-population denominator conflict；
- SA/NSA/base/weight/matching/dedup/migration/suppression mismatch；
- declared-assets/liabilities-as-verified/recovery/payment rejection；
- provisional/late-data/unmatched/classification/method/seasonal/correction revision count；
- schema/DSD/catalogue/workbook/resource digest drift、route/account/fee/quota/rate failure；
- identity/PII drop、licence/attribution/non-endorsement/retention drift与zero effects。

Health分别发布`concept-fixture`、`route-fixture`、`schema-fixture`、`selected-manual`、`sandbox-live`、`operational-canary`、`callable`和`durable`。HTTP 200、current file、official MCP或case lookup不能替代domain readiness。

## 5. 合成 conformance

Synthetic fixtures至少证明：

1. economic distress或inability-to-pay claim不自动升级为formal insolvency；
2. petition/application不当assignment、order、declaration或registered proceeding；
3. filing/commencement不当business cessation、death、dissolution或failure cause；
4. case、proceeding、filing、debtor、company、business、enterprise、legal unit、person分开；
5. source-defined business/nonbusiness不从company form或chapter自行推断；
6. Canada individual business按liability rule保留，不并入consumer或person profile；
7. one IDBR business with multiple constituent companies不重复解释为多个business insolvencies；
8. bankruptcy/liquidation/administration/CVA/proposal/CCAA/receivership/moratorium不互换；
9. Chapter 7不当liquidation complete、assets realised或entity dissolved；
10. Chapter 11/administration/CVA/proposal/CCAA不当plan confirmed或business saved；
11. CVL不与compulsory liquidation合并；voluntary不当creditor/court initiated；
12. receivership不当bankruptcy；moratorium不当restructuring plan或outcome；
13. filed/terminated flow不与pending stock相加；
14. terminated/closed不当discharged、paid、successful、death或zero pending liability；
15. plan proposed不当confirmed；dismissed不当debts resolved；
16. one/three/twelve-month ending windows不按相同end date去重或相加；
17. monthly、quarterly、annual与calendar/fiscal periods不按label直接join；
18. count、rate、index、share、percent change、amount保持不同measure；
19. index point不当case count/rate，base/weight变更不当real-world shock；
20. SA不与NSA merge，seasonal re-estimation形成新revision；
21. rate必须绑定numerator、denominator、scale、population、window和vintage；
22. effective company register、active business、legal-unit与per-thousand business denominator不互换；
23. unmatched/Unknown/excluded population保留coverage gap，不补入total或zero；
24. SIC/NAICS/NACE、geography、size、age与turnover不跨revision按label join；
25. preliminary/provisional/current/revised/corrected/migrated/final不覆盖历史；
26. declared assets/liabilities不当verified valuation、allowed claim、recovery或payment；
27. missing/suppressed/debtor-not-reported不当zero；
28. aggregate不得回填debtor/company/case identity或与corporate register fuzzy link；
29. generic API/client/MCP/Skill/PDF parser成功不升级domain maturity或cross-member comparability；
30. route失败不得回退PACER、CourtListener、Bankruptcy Observer、HTML scraping、another member或写操作。

## 6. 隐私、权利与安全

- 默认只保留published aggregates及semantic metadata；debtor/company/person、case number、SSN/TIN/EIN、address、creditor、attorney、trustee/practitioner、docket/document/free text和individual financial values均在pre-gate drop。
- public court record、RECAP availability、Open Data licence与aggregate publication不能互相替代rights；no-identification、personal-information exclusion、third-party rights、attribution和non-endorsement进入policy。
- account/token/credential/fee authorization只以Host credential ref存在，不进入snapshot/chat/log/fixture/Git。
- fixed commercial/community MCP不是trusted processor；purchase、alert/subscription、generic endpoint、hosted logs、retention、bulk download和DB surface逐项隔离。
- 不提供legal/financial advice，不输出identified bankruptcy lead list，不联系debtor/creditor，不用formal distress进行歧视性或骚扰性profiling。

## 7. Probe与副作用边界

本Channel没有平台Probe。petition、assignment、bankruptcy application、claim、proposal、vote、plan、case filing、PACER search/document purchase、alert/subscription、commercial plan purchase、API account/key request、agency/debtor/creditor/practitioner contact、full-history download、local mirror或任何admin/write均保持zero effect。虚假financial distress、虚假filing或联系困境企业测试需求不属于Probe；主动验证只能走自有landing page、问卷、访谈或真实且获批的销售/产品实验。

## 8. 晋级顺序

1. evidence review：固定四成员program/legislation/population/unit/procedure/event/method/route/rights与fixed source；
2. static contract：编译`PublicBusinessInsolvency*`，验证EvidenceSpan/Observation/SourceItemCandidate承载；
3. synthetic fixture conformance：先证明30项拒绝边界；
4. route/schema fixture：只验证static catalogue/table envelope/DSD/workbook/resource metadata，不取observation或case record；
5. sandbox live：逐成员approved tiny aggregate query/file，固定row/cell/byte/TTL/no-fallback；
6. operational canary：监控legislation/definition/schema/base/classification/revision/licence drift并可自动降级；
7. 用户另行授权后，才可能发布`callable`和`durable`成员revision。
