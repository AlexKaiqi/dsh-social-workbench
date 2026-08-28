# Public Time Use, Care, Mobility & Daily Activity Allocation Channel Pack

## 1. 目的与比较键

本Channel用官方aggregate time-use statistics观察时间配置、照护/家务不平衡、通勤挤压和休息/社交空间，形成待验证的friction hypothesis。它不是个人日程、生活方式画像、生产率/健康/幸福评分或服务需求证明。

```text
member + jurisdiction/publisher + programme/standing + questionnaire/diary/release
+ population/respondent/statistical-unit + age/geography/exclusions
+ diary-boundary/assigned-day/count + episode/slot + mode/recall
+ primary/secondary/secondary-childcare/supervisory role
+ activity-classification/revision/category/composite mapping
+ duration/participation/episode-count/share/time-of-day + unit
+ population-mean/participant-mean/rate/distribution representation
+ weekday/weekend/average-day/wave/collection-period + season
+ weight/calibration/imputation/valid-diary/variance/denominator
+ sample/response/SE/confidence/suppression/mode/method/classification break
+ table/workbook/dataset/series/coordinate/schema/correction/rights
```

成熟度见[triage](./PUBLIC_TIME_USE_CARE_MOBILITY_DAILY_ACTIVITY_ALLOCATION_TRIAGE_2026-08-26.md)，当前`callable=0 / durable=0`。

## 2. Snapshot、分析库与动态物化

Dolt/Git snapshot保存programme/lifecycle、population/unit、instrument/diary boundary、activity role、classification/composite mapping、question/context rule、measure/representation/time、weight/denominator/quality、release/rights、fixed OSS/Skill decision、verification lineage和adoption decision；不保存credential、response、microdata、respondent diary、precise schedule、identity、rare cell或下载文件。

未来durable授权后的分析库只接approved aggregate cells。动态物化至少包括：

- `diary-day-vs-usual-day-week-year`；
- `person-respondent-diary-day-episode-slot-series`；
- `primary-secondary-simultaneous-secondary-childcare-supervisory-care`；
- `population-mean-participant-mean-participation-rate`；
- `duration-episode-count-share-of-day-time-of-day-profile`；
- `paid-work-vs-contract-hours-employment-output`；
- `unpaid-work-care-duration-vs-burden-need-willingness`；
- `travel-time-vs-trip-distance-delay-reliability`；
- `sleep-rest-duration-vs-quality-health`；
- `media-digital-classification-vs-app-telemetry-attention`；
- `zero-vs-never-missing-not-collected-suppressed-unreliable`；
- `weekday-weekend-average-day-season-wave-COVID-context`；
- `ATUS-OTUS-HETUS-Canada-classification-versioned-correspondence`；
- `collection-active-vs-results-published-vs-route-current`；
- `aggregate-only-no-person-profile-no-targeting`。

materialization key固定`member × programme/release × population/unit × instrument/diary rule × activity-role/classification/category × measure/representation/time × weight/denominator × breakdown × quality × rights-purpose`。任一diary rule、classification、role、weight、denominator、quality、release或rights漂移只失效受影响partition；失败回退canonical scan，不回退microdata、generic MCP、republisher或其他成员。

## 3. 可观测性

每次fixture/canary记录完整比较键，并至少发布：requested/returned/retained/dropped/quarantined/suppressed cells；unknown programme/population/unit/instrument/diary/activity-role/category/measure/representation/time/weight/denominator/quality/release；primary/secondary冲突；population/participant mean冲突；weekday/weekend与average-day冲突；slot/episode冲突；classification/composite drift；collection/result/route/lifecycle冲突；sensitive breakdown拒绝；effects恒为zero。

Health分别发布`concept-fixture`、`table-fixture`、`schema-fixture`、`selected-manual`、`sandbox-live`、`operational-canary`、`callable`和`durable`。成员不能借用成熟度。

## 4. Synthetic conformance

至少证明：

1. respondent、diary day、episode、slot和aggregate series不合并；
2. diary day不当usual day/week/year，zero不当never/no need；
3. primary、secondary、simultaneous、secondary childcare和supervisory care不互填或重复相加；
4. duration不当effort、burden、productivity、preference、satisfaction、outcome或demand；
5. population mean、participant mean、participation rate、episode count、share和time-of-day不互换；
6. paid work不当employment/contract hours/output，unpaid work/care不当service willingness；
7. travel time不当trip/distance/delay/reliability，sleep time不当quality/health；
8. media/digital activity不当verified app usage、attention或engagement；
9. “free time”不当available capacity；location/with-whom不当身份或关系质量；
10. 10-minute slot、开放episode、telephone/online/paper/mixed-mode保留方法差异；
11. weekday/weekend、season、wave与pandemic context不静默合并；
12. ATUS/OTUS/HETUS/Canada分类只经exact revision correspondence映射；
13. current collection不当published result，latest-only API不覆盖历史revision；
14. aggregate breakdown不反推个人routine或用于consequential decision/Probe targeting；
15. generic SDK/MCP/Skill/parser成功不提升domain maturity；
16. route失败不得回退microdata、HTML scraping、unknown code或write surface。

## 5. Probe、隐私与晋级

本Channel没有平台Probe。survey/diary submission、respondent recruitment/contact、special tabulation、PUMF/scientific-use申请或下载、MCP/Skill install/connect、mirror、materialization/index与任何write都需另行授权。需求验证只能把aggregate模式转成去群体化假设，再走自有landing page、访谈或获批实验。
