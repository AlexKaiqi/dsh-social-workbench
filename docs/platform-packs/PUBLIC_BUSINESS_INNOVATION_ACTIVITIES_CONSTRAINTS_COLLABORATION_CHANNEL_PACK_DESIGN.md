# Public Business Innovation Activities, Constraints & Collaboration Channel Pack

## 1. 目的与比较键

本Channel发现企业报告的product/business-process innovation、activity status、novelty、expenditure、turnover share、developer source、cooperation、information source、objective/benefit、barrier、public support、protection和environmental benefit。它不提供identified company lead、verified launch/success、procurement、IP opinion或causal ROI。

```text
member + jurisdiction/publisher + programme/standing + Oslo/definition revision
+ population/frame/unit/sector/size/revenue threshold + questionnaire/question/routing/scale
+ innovation kind + introduced/completed-not-implemented/ongoing/abandoned/no-activity
+ novelty + measure + multi-year/single-year/period-end/future time role
+ business share/count/money/turnover share/employee share/importance representation
+ weighting/estimator/denominator + geography/industry/size
+ sample/response/error/imputation/suppression/method/optional/country deviation
+ questionnaire/result/release/schema/lifecycle + route/access/rights
```

成熟度与[triage](./PUBLIC_BUSINESS_INNOVATION_ACTIVITIES_CONSTRAINTS_COLLABORATION_TRIAGE_2026-08-26.md)一致；`callable=0 / durable=0`。

## 2. Snapshot、分析库与动态物化

Dolt/Git snapshot保存programme/lifecycle、Oslo/innovation definition、population/unit、question/routing/scale、activity status、novelty、measure/time、representation/estimator/quality、release/rights、fixed OSS/Skill revision、verification/adoption decision和lineage；不保存credential、survey response、microdata、identified business/person、free text或未授权file/cell。

未来durable授权后的分析库只存approved aggregate cells。动态物化至少包括：

- `idea-invention-randd-activity-introduced-innovation-separation`；
- `product-goods-service-business-process-combined-innovation`；
- `new-to-business-new-to-market-new-to-world-significant-difference`；
- `introduced-completed-not-implemented-ongoing-abandoned-no-activity`；
- `three-year-activity-vs-single-year-expenditure-turnover-employment`；
- `internal-joint-adapted-external-development`；
- `cooperation-vs-information-source-vs-outsourcing-vs-business-cooperation`；
- `partner-type-location-critical-partner-and-denominator`；
- `active-innovator-vs-noninnovator-barrier-and-no-activity-reason`；
- `support-used-vs-application-award-payment-effectiveness`；
- `protection-method-filing-grant-ownership-enforceability`；
- `reported-objective-benefit-expectation-vs-independent-outcome`；
- `environmental-benefit-vs-verified-impact-lca-compliance`；
- `questionnaire-published-result-published-route-current-programme-active`；
- `country-optional-variable-method-break-and-comparability-gate`。

物化按knowledge/release revision重建；失败回退canonical scan，不回退republisher、generic MCP、other member或HTML scraping。

## 3. 可观测性

每次fixture/canary记录完整比较键，并至少发布：

- requested/returned/retained/dropped/quarantined/suppressed questions、series、cells、files；
- unknown programme/population/unit/definition/question/status/novelty/measure/time/representation/weight/quality/release/lifecycle；
- activity-as-innovation、innovation-as-success、barrier-as-cause/lead、support-as-award/payment rejection；
- product/process、new-to-business/market/world、introduced/ongoing/abandoned conflict；
- three-year/single-year、business/count/money/turnover/employee/importance conflict；
- cooperation/information/source/outsourcing、partner type/location/critical partner conflict；
- question wording/routing/options、Oslo definition、classification、optional/mandatory/denominator drift；
- ABS questionnaire/NCSES table/API、UKIS report/annex、CIS dataset/DSD、SIBS PID/cube/release drift；
- licence/attribution/third-party/no-endorsement/anti-identification/retention drift；
- effects恒为zero。

Health分别发布`concept-fixture`、`route-fixture`、`schema-fixture`、`selected-manual`、`sandbox-live`、`operational-canary`、`callable`和`durable`。

## 4. Synthetic conformance

至少证明：

1. idea、invention、R&D、technology acquisition、innovation activity与introduced innovation不合并；
2. product必须made available、process必须brought into use，questionnaire定义不可省略；
3. aggregate不反推identified company、founder、employee、partner、supplier或customer；
4. firm/company、business、enterprise、legal/reporting unit不合并；
5. goods、services、product、business process与combined innovation不互填；
6. new-to-business、new-to-market、new-to-world与similar-existing不互换；
7. introduced、completed-not-implemented、ongoing、abandoned/suspended、no activity不合并；
8. innovation-active不当launch、success、growth、value、capability或procurement；
9. 三年activity与单年amount/turnover/employment不互换；
10. internal/joint/adapted/external developer不当IP owner或supplier contract；
11. cooperation不由information source、outsourcing或ordinary cooperation补齐；
12. partner type/location/critical partner不丢失或下钻为named entity；
13. active-innovator barrier与noninnovator no-activity reason不共享denominator；
14. barrier不当cause、severity、loss、WTP或lead；
15. public support use不当application/award/obligation/payment/effectiveness；
16. protection method/filing不当grant/ownership/enforceability/FTO；
17. turnover share不当incremental revenue、profit、ROI或market size；
18. objective/benefit/environmental contribution不当independent causal outcome；
19. count、share、money、turnover share、employee share、importance scale不互换；
20. questionnaire/result/route/programme standing不互推；
21. ABS current questionnaire不当current result，rotating content不静默续series；
22. UKIS voluntary response与weighted 10+ population必须保留；
23. CIS mandatory/optional、country deviation、enterprise/legal-unit break与non-panel边界不丢失；
24. SIBS 2023–2025 active questionnaire不当published result，20+/$250k population不外推全体；
25. missing/not-asked/optional/suppressed/unreliable不当zero/no innovation；
26. generic MCP/SDK/parser成功不提升domain maturity；
27. route失败不得回退republisher、other member、HTML scraping、latest install或write surface。

## 5. Probe、隐私与晋级

本Channel无平台Probe。survey response/submission、key申请、subscription/contact、restricted microdata application、data download、MCP/Skill install/connect、full mirror、materialization/index及任何write保持zero effect。需求验证只能走自有landing page、访谈或获批实验。

默认只保存publisher aggregate和semantic metadata；credential只以Host reference存在；禁止保存respondent/business/partner identity、microdata、rare cell、free text或restricted attributes。

晋级：evidence review → static contract → synthetic conformance → route/schema fixture → approved sandbox small aggregate read → operational canary → 用户授权后的callable/durable。
