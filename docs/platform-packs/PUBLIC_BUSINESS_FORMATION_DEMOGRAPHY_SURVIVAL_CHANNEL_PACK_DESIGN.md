# Public Business Formation, Demography & Survival Channel Pack

## 1. 目的与不可合并事实

本Channel用于发现新business population、employer formation、开业/关闭/退出、存续、增长和岗位动态中可能形成的新买方、服务需求与制度摩擦。它统一`PublicBusinessDemography*` projection，但不统一program、population、statistical unit、activity test、lifecycle、cohort、timing、rate denominator、estimate standing、adjustment、classification、quality或rights。

可比较partition至少固定：

```text
member + program + population + statistical unit + activity test
+ lifecycle definition + cohort/horizon + measure + numerator/denominator/scale
+ timing + actual/projected/spliced + adjustment/disclosure + classification
+ geography + reference window + release/vintage + quality standing + rights
```

`PublicCorporateDisclosure*`、identified company register record与`PublicBusinessDemography*`只能通过显式aggregate analytical comparison并置。统计aggregate不能回填company lifecycle；company incorporation/dissolution也不能改写statistical birth/death population。

## 2. 成员与能力矩阵

| 成员 | Application | Active population | Birth/formation/opening | Death/closure/exit | Reopening/temp closure | Survival | High growth | Employment dynamics | Exact official access |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| U.S. Census BFS/BDS | BA/HBA/WBA/CBA | firms/establishments with employment | actual/projected/spliced employer formation；establishment birth/firm startup | establishment closing/firm shutdown | no | age cohorts，不作为exact survival fixture | no | employment/job creation/destruction | keyed BFS/BDS Data APIs + tables |
| UK ONS | no | annual VAT/PAYE active enterprises | enterprise/employer births | enterprise/employer deaths | reactivation仅用于death adjustment | up to five years | no | limited published employment breakdown | versioned annual XLSX |
| Eurostat | no | active/employer enterprises | enterprise/employer births | preliminary/final deaths | reactivation用于death confirmation | up to five years | high-growth/young-high-growth | employees/persons employed | Statistics API/SDMX current datasets |
| StatCan MBOC | no | active/continuing employer businesses | opening/entrant | closure/exit | reopening/temporary closure | no | no | employment-transition population | WDS/SDMX/full-table PID 33100270 |

成熟度：`requested=4 / concept-fixture=4 / exact official machine route-fixture=3 / official table-or-bulk route-fixture=4 / application fixture=1 / active-population fixture=4 / birth-formation-opening fixture=4 / death-closure-exit fixture=4 / reopening-or-temporary-closure fixture=1 / survival fixture=2 / high-growth fixture=1 / employment-dynamics fixture=2 / estimate-quality fixture=4 / selected-manual=4 / callable=0 / durable=0`。generic statistics API、MCP connected、company lookup或CSV parser不会提高domain maturity。

## 3. Snapshot、分析库与动态物化

Dolt/Git snapshot保存Platform/Channel Pack、program/population/unit/activity/lifecycle/cohort、dataset/table/group/variable/series/PID/DSD/workbook、measure/denominator/timing/estimate/adjustment/classification、quality/release/revision/rights、fixed OSS/Skill revision、decision、verification、lineage与tombstone；不保存API key、未授权data rows/files、restricted register/LBD/IDBR microdata、EIN/company/person identity或business contact。

未来获得durable授权后，分析数据库只接field-approved aggregates。动态物化视图至少包括：

- `application-registration-birth-formation-opening-isolation`；
- `legal-unit-enterprise-firm-establishment-employer-job-person-grain`；
- `active-population-and-activity-test-by-reference-window`；
- `opening-entrant-reopening-and-first-employee-transition`；
- `closure-temporary-extended-death-exit-and-shutdown-transition`；
- `restructuring-merger-takeover-breakup-continuity-exclusion`；
- `actual-projected-spliced-and-four-eight-quarter-cohort`；
- `weekly-monthly-annual-point-activity-lifecycle-cohort-window`；
- `event-count-rate-percent-change-and-net-change`；
- `numerator-denominator-scale-and-population`；
- `birth-cohort-survival-age-horizon-and-censoring`；
- `high-growth-threshold-start-size-window-age-and-denominator`；
- `employment-job-creation-destruction-vs-hire-separation`；
- `SA-NSA-reactivation-exit-model-held-classification-noise-suppression`；
- `NAICS-SIC-NACE-NUTS-geography-size-legal-form-revision`；
- `preliminary-provisional-current-revised-corrected-final-superseded-lineage`；
- `member-population-quality-rights-and-comparability-gate`。

任何跨成员trend/ranking只消费通过population、unit、activity、lifecycle、cohort、timing、denominator、estimate、adjustment、classification和quality gate的partition。物化按snapshot/release revision可重建；index不存在时回退canonical scan，不回退company register、另一member或community MCP。

## 4. 可观测性

每次request/fixture/canary记录：

```text
member × publisher/jurisdiction × program/population/statistical-unit/activity-test
× dataset/product/table/group/variable/series/PID/DSD/workbook × release/vintage
× lifecycle-definition/cohort/horizon × measure/numerator/denominator/scale
× weekly/monthly/annual/reference window × actual/projected/spliced
× SA/NSA/reactivation/exit-model/classification-hold/noise/suppression
× geography/industry/size/legal-form × quality/status/rights/access
```

Counters与gauges至少包括：

- requested/returned/retained/dropped/quarantined/suppressed/noise-flagged cells、series与files；
- unknown program/dataset/series/PID/dimension/lifecycle/unit/population/status/classification；
- application-as-business、registration-as-birth、opening-as-entrant、closure-as-exit拒绝；
- legal-unit/enterprise/firm/establishment/employer/job/person mismatch；
- activity-test/window、cohort/horizon、numerator/denominator/scale missing；
- weekly/monthly/annual、point/activity/lifecycle、4Q/8Q mismatch；
- actual/projected/spliced、SA/NSA、reactivation/model/noise/suppression mismatch；
- employer birth/death误作enterprise birth/death、job flow误作hire/separation拒绝；
- preliminary/provisional/late-filer/reactivation/classification/method/correction revision count；
- schema/DSD/catalogue/workbook/PID digest drift、series retirement、route/key/quota/rate failure；
- licence/attribution/no-identification/no-linkage/retention drift与zero effects。

Health分别发布`concept-fixture`、`route-fixture`、`schema-fixture`、`selected-manual`、`sandbox-live`、`operational-canary`、`callable`和`durable`，不能用HTTP 200、official MCP或current workbook代替domain readiness。

## 5. 合成 conformance

Synthetic fixtures至少证明：

1. tax-ID/business application不升级为legal entity、active business或birth；
2. high-propensity/planned-wage application不升级为will-form employer；
3. registration/incorporation不自动升级为statistical birth；
4. application、legal unit、enterprise、firm、establishment、employer、job、person分开；
5. one enterprise with multiple legal units/establishments不重复解释为多个enterprise births；
6. active-at-any-time annual population不当point-in-time或monthly payroll population；
7. registered population不当全部formal/informal business population；
8. opening不当entrant；reopening不当new entrant；
9. employer formation/first employee不当enterprise birth；
10. employer death/no employees不当enterprise ceased trading；
11. closure不当permanent exit、death、bankruptcy或failure；
12. temporary/extended closure不当identified firm state；
13. legal dissolution不当statistical death；
14. merger/takeover/break-up/change of ownership/activity不当birth/death；
15. establishment birth/closing不当firm startup/shutdown；
16. actual formation不与projected formation merge；
17. spliced series保留actual/projected boundary；
18. 4-quarter cohort不与8-quarter cohort merge；
19. weekly application不当monthly/annual且不生成formation；
20. SA不与NSA merge；percentage change不当event count/rate；
21. rate必须绑定numerator、denominator、scale、population和window；
22. survival绑定exact birth cohort、age horizon与activity test；
23. survival不当identified business health、profit或future probability；
24. high growth绑定starting size、employee measure、threshold、3-year window与age；
25. high growth不当startup/revenue/valuation/product success；
26. job creation/destruction不当hire/separation/vacancy/unique worker；
27. same industry/geography label不跨classification revision join；
28. projected/reactivation-adjusted/exit-modelled/noise-infused/suppressed不当raw observed final；
29. preliminary/provisional/current/corrected/final不覆盖历史；missing/suppressed不当zero；
30. generic API/client/MCP/Skill或company lookup成功不升级domain maturity、identity relation或cross-member comparability。

## 6. 隐私、权利与安全

- 默认只保留published aggregates及semantic metadata；EIN/company/legal-unit/address/owner/employee/respondent、register/LBD/IDBR/LEAP microdata和free text pre-gate drop。
- Census与Statistics Canada no-identification/no-linkage规则进入policy；不得用aggregate和公司登记库尝试定位business/person。
- API key/credential只以Host credential ref存在，不进入snapshot/chat/log/fixture/Git。
- 衍生视图保留publisher/program/dataset/table/series/PID/release/vintage/access date/licence/adaptation/method lineage。
- official/community hosted MCP都不是自动可信processor；安装、seed、execute、network、download、local DB/mirror、retention与tool surface逐项授权。

## 7. Probe与副作用边界

本Channel没有平台Probe。申请API key、请求restricted register/longitudinal microdata、下载full history、联系statistical authority/business、提交business/tax/register application、填报survey、订阅release、配置hosted MCP、seed local database、建立长期mirror或任何admin/write均保持zero effect。虚假注册、虚假创业申请、虚假关闭/开业声明或联系企业测试需求不属于Probe；主动验证只能走自有landing page、问卷、访谈或真实且获批的销售/产品实验。

## 8. 晋级顺序

1. evidence review：固定四成员program/population/unit/lifecycle/cohort/method/route/rights与fixed source；
2. static contract：编译`PublicBusinessDemography*`，验证EvidenceSpan/Observation/SourceItemCandidate承载；
3. synthetic fixture conformance：先证明30项拒绝边界；
4. route/schema fixture：只验证static catalogue/variables/DSD/workbook/PID envelope与status，不取observation；
5. sandbox live：逐成员approved tiny aggregate query/file，固定row/cell/byte/TTL/no-fallback；
6. operational canary：监控definition/schema/classification/revision/licence drift并可自动降级；
7. 用户另行授权后，才可能发布`callable`和`durable`成员revision。

