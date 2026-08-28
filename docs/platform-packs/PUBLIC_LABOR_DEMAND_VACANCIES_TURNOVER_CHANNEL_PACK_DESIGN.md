# Public Labor Demand, Vacancies & Turnover Statistics Channel Pack

## 1. 目的与不可合并事实

本Channel用于发现组织招人压力、未满足劳动力需求、招聘周期/要求摩擦、劳动力流动与统计解释中的需求。它统一`PublicLaborDemand*` projection，但不统一survey population、statistical unit、vacancy definition、stock/flow、rate denominator、recording time、adjustment、classification、quality或rights。

可比较partition至少固定：

```text
member + program + population + statistical unit + vacancy definition
+ measure + stock/flow timing + numerator + denominator + scale
+ adjustment + geography + industry/occupation revision
+ reference window + release/vintage + quality standing + rights
```

`JobPosting*`与`PublicLaborDemand*`只能通过显式、非身份化的analytical comparison并置。平台posting count不能校准为official vacancy count；official vacancy aggregate也不能反推company、posting或available job。

## 2. 成员与能力矩阵

| 成员 | Vacancy stock | Filled/occupied denominator | Rate | Hire/separation flow | Offered wage/characteristics | Exact official access |
| --- | --- | --- | --- | --- | --- | --- |
| BLS JOLTS | yes，last business day | employment benchmark | openings rate | hires、quits、layoffs/discharges、other/total separations | no | Public Data API v2 + LABSTAT catalogue |
| ONS Vacancy Survey | yes，specified date；headline 3-month MA | employee jobs/filled+unfilled method | old/new transition | no | industry/size only | versioned VACS/X06 XLS/XLSX |
| Eurostat JVS | yes，country date or period average | occupied posts | JVR | no | voluntary industry/size/region/occupation coverage | Statistics API + SDMX 3.0 `jvs_q_r21` |
| StatCan JVWS | yes，first-day/upcoming month；quarter distinct | payroll employees | vacancy rate | no | offered wage、NOC、duration、education、experience、position/work type、strategy | WDS/SDMX/full-table PIDs |

成熟度：`requested=4 / concept-fixture=4 / exact official machine route-fixture=3 / official table-or-workbook route-fixture=4 / vacancy-stock fixture=4 / occupied-or-employment-denominator fixture=4 / vacancy-rate fixture=4 / hire-flow fixture=1 / separation-flow fixture=1 / offered-wage fixture=1 / recruitment-characteristic fixture=1 / estimate-quality fixture=4 / selected-manual=4 / callable=0 / durable=0`。generic statistics API、MCP、spreadsheet reader或percentage parser不会提高domain maturity。

## 3. Snapshot、分析库与动态物化

Dolt/Git snapshot保存Platform/Channel Pack、program/population/statistical-unit/vacancy definition、dataset/table/group/variable/series/PID/DSD/workbook、measure/timing/numerator/denominator/adjustment/classification、quality/release/revision/rights、fixed OSS/Skill revision、decision、verification、lineage与tombstone；不保存API key、未授权data rows/files、restricted establishment microdata、respondent、business contact或person identity。

未来获得durable授权后，分析数据库只接field-approved aggregates。动态物化视图至少包括：

- `posting-vs-statistical-vacancy-isolation`；
- `establishment-enterprise-location-post-employee-person-grain`；
- `vacancy-definition-and-active-recruitment-rule`；
- `reference-date-stock-vs-moving-average-vs-quarter-distinct-stock`；
- `stock-vs-monthly-flow-vs-annual-sum-or-average`；
- `vacancy-level-vs-rate-vs-percentage-vs-percentage-point-change`；
- `numerator-denominator-scale-and-reference-time`；
- `SA-NSA-direct-adjusted-weighted-calibrated-aligned-modelled-imputed`；
- `hire-quit-layoff-discharge-other-total-separation-components`；
- `offered-minimum-converted-vs-actual-paid-compensation`；
- `industry-occupation-geography-size-classification-revision`；
- `preliminary-flash-current-revised-benchmarked-corrected-final-lineage`；
- `standard-error-CV-confidence-response-significance-suppression-status`；
- `member-definition-and-rights-comparability-gate`。

任何跨成员trend/ranking只消费通过population、unit、definition、timing、denominator、adjustment、classification和quality gate的partition。物化视图按snapshot/release revision可重建；index不存在时回退canonical scan，不回退另一成员、posting或community MCP。

## 4. 可观测性

每次请求/fixture/canary都记录：

```text
member × publisher/jurisdiction × program/population/statistical-unit
× dataset/product/table/group/variable/series/PID/DSD/workbook × release/vintage
× vacancy-definition × vacancy/occupied/employment/hire/separation/wage/characteristic measure
× stock/flow/moving-average/quarter-distinct timing × numerator/denominator/scale
× SA/NSA/weighted/calibrated/aligned/modelled/imputed × geography/industry/occupation/size
× reference/publication/revision period × estimate/SE/CV/confidence/response/significance/suppression/status
× rights/access
```

Counters与gauges至少包括：

- requested/returned/retained/dropped/quarantined/suppressed cells、series与files；
- unknown series/PID/dataset/dimension/category/status/symbol/classification；
- posting-as-vacancy、stock-as-flow、flow-netting、unit mismatch、population mismatch拒绝；
- numerator/denominator/scale missing与cross-rate rejection；
- SA/NSA、moving-average/single-month、quarter-distinct/monthly-average、annual-sum/average mismatch；
- offered-as-paid、rate-as-level、percentage-point-as-percent rejection；
- preliminary/flash/late-response/benchmark/correction/classification/method revision count；
- SE/CV/confidence/response/significance/suppression/status pairing；
- file/schema/DSD/catalogue digest drift、series/PID retirement、route/key/quota/rate failure；
- licence/attribution/confidentiality/retention drift与zero effects。

Health必须分别发布`concept-fixture`、`route-fixture`、`schema-fixture`、`selected-manual`、`sandbox-live`、`operational-canary`、`callable`和`durable`，不能用HTTP 200或MCP connected代替domain readiness。

## 5. 合成 conformance

Synthetic fixtures至少证明：

1. posting不升级为statistical vacancy；
2. vacancy aggregate不反推posting/company/person；
3. establishment、enterprise、location、post、employee job与person分开；
4. vacancy/opening stock不与hire/separation flow相减；
5. hire不解释为vacancy filled或net employment growth；
6. quit不解释为dissatisfaction，layoff/discharge不解释为redundancy/firing cause；
7. separation total只按source-defined exact components组合；
8. month-end、specified-date、first-day-or-upcoming与country-specific reference time分开；
9. three-month moving average不当single month；
10. quarter distinct positions不当monthly average或flow；
11. annual vacancy average不当flow sum；
12. vacancy level不当rate；
13. percent不当percentage points；
14. rate必须绑定numerator、denominator和scale；
15. employment+openings不与occupied+vacant或employee-jobs-only denominator merge；
16. old ONS ratio不与new openings-rate method merge；
17. SA不与NSA merge；direct aggregate adjustment不当sum of country SA；
18. weighted/calibrated/aligned/modelled/imputed不当raw census；
19. offered wage不当actual paid wage；
20. lower-bound/range wage不当midpoint；salary conversion规则不丢失；
21. occupation/education/experience/duration/strategy aggregate不当individual requirement；
22. same industry label不跨NAICS/SIC/NACE/revision join；
23. same occupation label不跨NOC/revision join；
24. country aggregate不当unweighted mean或identical national population；
25. flash/imputed aggregate不当complete final member data；
26. preliminary/current/revised/benchmarked/corrected/final不覆盖历史；
27. missing/null/symbol/suppressed/low-reliability/not-significant不解释为zero；
28. SE/CV/confidence和significance不互换；
29. current/latest API不冒充revision history；
30. generic client/MCP/Skill成功不升级domain maturity、authority或cross-member comparability。

## 6. 隐私、权利与安全

- 默认只保留published aggregates及其semantic metadata；respondent、business contact、name/address、free text与restricted microdata pre-gate drop。
- Statistics Canada禁止为识别person/business/organization而link；其他成员即使公开aggregate也不得反推respondent。
- API key/credential只以credential ref存在Host侧，不进入snapshot、chat、日志或Git。
- 所有衍生视图保留publisher、dataset/table/series/PID、release/vintage、access date、licence、adaptation和method lineage。
- community hosted MCP不是authority也不是默认processor；安装、执行、联网、download、local mirror、SQLite/DataCanvas和retention均需独立审查与授权。

## 7. Probe 与副作用边界

本Channel没有平台Probe。申请API key、请求restricted microdata、下载full history、联系统计机构/respondent/employer、提交或修改survey、订阅release、分享dashboard、配置hosted MCP、建立长期mirror，或任何admin/write action都保持zero effect。虚假职位、虚假申请和对企业的测试性招聘联系不属于需求Probe；主动验证只能走系统自有landing page、问卷、访谈或真实且已授权的招聘流程。

## 8. 晋级顺序

1. evidence review：固定四成员定义、总体、方法、route、rights与固定源码；
2. static contract：编译`PublicLaborDemand*`，验证EvidenceSpan/Observation/SourceItemCandidate均可承载；
3. synthetic fixture conformance：先证明30项拒绝边界；
4. route/schema fixture：只验证catalogue/metadata/DSD/workbook envelope与status，不取observation；
5. sandbox live：逐成员approved tiny aggregate query/file，固定row/cell/byte/TTL与no-fallback；
6. operational canary：监控definition/schema/classification/revision/rights drift并可自动降级；
7. 用户另行授权后，才可能发布`callable`与`durable`成员revision。
