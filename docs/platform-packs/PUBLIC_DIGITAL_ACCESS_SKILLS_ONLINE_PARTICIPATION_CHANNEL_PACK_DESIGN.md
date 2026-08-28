# Public Digital Access, Skills & Online Participation Channel Pack

## 1. 目的与比较键

本Channel用官方aggregate survey发现数字接入、非使用、技能、线上活动和信任/伤害方面的结构性摩擦。它不建立自然人画像、不评分“数字弱势”、不做因果诊断，也不把aggregate差异直接变成Probe定向。

```text
member + jurisdiction/publisher + programme/standing + survey/questionnaire/release
+ household/individual/respondent/proxy/internet-user population + age/geography/exclusions
+ question/routing/options/scale + access/use/device/barrier/skill/activity/concern definition
+ current/3-month/12-month/survey/collection time role
+ household-share/individual-share/user-share/count/frequency/ordinal/composite
+ weight/replicate-weight/calibration/denominator + breakdown
+ sample/response/error/suppression/mode/proxy/method/country deviation
+ table/series/coordinate/file/API/explorer + schema/correction/rights
```

成熟度见[triage](./PUBLIC_DIGITAL_ACCESS_SKILLS_ONLINE_PARTICIPATION_TRIAGE_2026-08-26.md)，当前`callable=0 / durable=0`。

## 2. Snapshot、分析库与动态物化

Dolt/Git snapshot保存programme/lifecycle、population/unit、definition、question/routing/scale、time/representation/estimator/quality、composite algorithm、release/rights、fixed OSS/Skill decision、verification lineage和adoption decision；不保存credential、responses、microdata、respondent identity、rare cells、free text或下载文件。

未来durable授权后的分析库只接approved aggregate cells。动态物化至少包括：

- `household-access-vs-individual-use-vs-routed-user`；
- `availability-vs-access-vs-subscription-vs-reliability-vs-affordability`；
- `device-access-vs-ownership-vs-use-vs-smartphone-only`；
- `non-use-reason-vs-causal-claim-vs-wtp-vs-lead`；
- `self-reported-activity-vs-tested-skill-vs-publisher-composite`；
- `activity-vs-completion-vs-benefit-vs-satisfaction`；
- `commerce-government-health-work-learning-by-exact-question-window`；
- `concern-vs-protective-action-vs-incident-vs-verified-harm`；
- `self-vs-proxy-response-and-mode-effect`；
- `current-vs-three-month-vs-twelve-month-reference-window`；
- `questionnaire-proposed-vs-fielded-vs-results-published-vs-route-current`；
- `sensitive-breakdown-aggregate-only-and-small-cell-gate`。

materialization key固定`member × programme/release × population/unit/routing × definition/question × measure/time × representation/weight/denominator × breakdown × quality × rights-purpose`；revision或rights变化只失效受影响partition，失败回退canonical scan，不回退HTML scraper、generic MCP、microdata或其他成员。

## 3. 可观测性

每次fixture/canary记录比较键，并发布：requested/returned/retained/dropped/quarantined/suppressed cells；unknown programme/population/unit/question/routing/time/representation/weight/denominator/quality/release；household/person/user冲突；access/availability/subscription/quality冲突；self-report/tested/composite冲突；question、module、population、mode、schema和rights drift；sensitive breakdown与small-cell拒绝；effects恒为zero。

Health分别发布`concept-fixture`、`route-fixture`、`schema-fixture`、`selected-manual`、`sandbox-live`、`operational-canary`、`callable`和`durable`。成员不能借用彼此成熟度。

## 4. Synthetic conformance

至少证明：

1. household access不补成individual use；internet-user question不外推全体；
2. availability、subscription、access、speed、reliability、affordability不合并；
3. device access/ownership/use/smartphone-only不互换；
4. non-use/barrier不当cause、severity、WTP、vulnerability、lead或Probe audience；
5. reported activity/confidence不当tested skill；composite保留component与algorithm；
6. online activity不当completion、benefit、satisfaction或service quality；
7. purchase/banking/government/health/work/learning保留原生question与window；
8. concern、protective action、incident、harm、breach和legal finding不互推；
9. self/proxy、online/face-to-face/telephone mode不丢；
10. household/person/user share、count、frequency、ordinal、composite不互换；
11. current/3-month/12-month/survey/collection period不互换；
12. proposed questionnaire不当fielded programme或published results；
13. missing/not asked/inapplicable/suppressed不当zero；
14. aggregate不反推自然人、家庭、health/disability或其他敏感身份；
15. generic SDK/MCP/Skill成功不提升domain maturity；
16. route失败不得回退microdata、republisher、HTML scraping、unknown code或write surface。

## 5. Probe、隐私与晋级

本Channel没有平台内Probe。官方survey response、recruitment、contact、PUMF/restricted microdata申请、download、MCP/Skill install/connect、mirror、materialization/index与任何write均需另行授权。需求验证只可转化为去群体化的假设，再走自有landing page、访谈或获批实验。

默认只保存publisher aggregate和semantic metadata。敏感breakdown必须purpose-bound、minimum-cell/precision reviewed；不得用于housing/employment/credit/insurance/education/health等consequential decision或排除性投放。
