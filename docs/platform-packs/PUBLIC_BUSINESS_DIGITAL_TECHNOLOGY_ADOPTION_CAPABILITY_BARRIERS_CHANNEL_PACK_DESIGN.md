# Public Business Digital Technology Adoption, Capability & Barriers Channel Pack

## 1. 目的与可比较键

本Channel发现企业报告的digital connectivity、presence、e-commerce、technology adoption stage、intensity、skills、security、spending、purpose/source、barrier、impact和future support intent。它不提供identified lead、installed inventory、verified deployment、procurement或causal impact。

最小partition：

```text
member + jurisdiction/publisher + programme/standing + population/frame/unit
+ questionnaire/question/revision/role/routing/scale + technology/taxonomy revision
+ measure/adoption-stage + survey/collection/reference period/time role/horizon
+ business/employee/turnover/money/count/intensity/composite representation
+ weighting/estimator/denominator + geography/industry/size
+ sample/response/error/suppression/mode/method/country deviation
+ release/result/schema/correction/lifecycle + route/access/rights
```

## 2. 成员能力

| 成员 | Adoption | Barriers/support | Commerce/security/skills | Official route | Lifecycle |
| --- | --- | --- | --- | --- | --- |
| Census/NCSES ABS | cloud、AI、software、robotics、emerging technologies；stage/intensity | expertise、innovation barriers、AI workforce | selected technology/workforce modules | Census API historical groups + files | active/transitioning；module rotating |
| UK ONS | internet、presence、software、cloud | digital-regulatory difficulty | e-commerce、ICT security controls | historical workbook landing | paused；archive only |
| Eurostat | cloud、AI、analytics、IoT、robotics | topic-specific reasons/purposes | e-commerce、skills/training、security controls/incidents | Statistics API + SDMX/bulk | active/harmonised |
| Statistics Canada | internet、ICT、cloud、AI、IoT、blockchain、analytics | non-use reasons、external implementation、financing/plans | e-commerce、spend、skills/security | WDS PID/cube + official tables | latest 2023 results；biennial |

成熟度与[triage](./PUBLIC_BUSINESS_DIGITAL_TECHNOLOGY_ADOPTION_TRIAGE_2026-08-26.md)完全一致；`callable=0 / durable=0`。

## 3. Snapshot、分析库与动态物化

Dolt/Git snapshot保存programme/lifecycle、population/unit、question/routing/scale、taxonomy/stage、measure/time、representation/weight/estimator、quality/release/rights、fixed OSS/Skill revision、verification与adoption decision；不保存credential、未授权observations/files、respondent/business identity、microdata或free text。

未来durable授权后的分析库只接approved aggregate cells。动态物化至少包括：

- `applicability-vs-tested-vs-current-use-vs-intensity-vs-planned-use`；
- `internet-presence-ecommerce-software-cloud-ai-analytics-iot-automation-security-skills`；
- `ai-vs-generative-ai-by-question-and-taxonomy-revision`；
- `online-order-vs-online-payment-vs-turnover-vs-fulfilment`；
- `business-share-vs-employee-share-vs-turnover-share-vs-money-vs-count`；
- `internal-vs-external-expertise-and-current-vs-planned-support`；
- `non-use-reason-vs-barrier-vs-plan-with-exact-denominator`；
- `security-control-vs-reported-incident-vs-verified-security-fact`；
- `ict-specialist-vs-training-vs-hard-to-fill-vs-workforce-impact`；
- `raw-adoption-vs-year-specific-digital-intensity-composite`；
- `survey-year-vs-collection-year-vs-reference-year-vs-planned-horizon`；
- `questionnaire-published-vs-results-published-vs-route-current-vs-programme-active`；
- `method-break-mode-effect-country-deviation-suppression-and-comparability-gate`。

index按knowledge/release revision可重建；失败时回退canonical scan，不回退republisher、generic MCP、other member或HTML scraping。

## 4. 可观测性

每次fixture/canary记录完整partition key，并至少发布：

- requested/returned/retained/dropped/quarantined/suppressed questions、series、cells、files；
- unknown programme/population/unit/technology/question/stage/time/representation/weight/quality/release/lifecycle；
- use-as-installed、barrier-as-cause-or-lead、plan-as-procurement、control-as-effective rejection；
- order/payment/fulfilment、AI/generative-AI、business/employee/turnover/money/count conflict；
- question wording/routing/options、taxonomy/components、survey/reference year、denominator drift；
- API group/dataset code/PID/cube/SDMX DSD、file、archive与programme lifecycle drift；
- attribution/licence/third-party/no-endorsement/anti-identification/retention drift；
- effects必须为zero。

Health分别发布`concept-fixture`、`route-fixture`、`schema-fixture`、`selected-manual`、`sandbox-live`、`operational-canary`、`callable`、`durable`。HTTP 200、client connected或numeric result不替代domain readiness。

## 5. Synthetic conformance

至少证明：

1. reported use不当installed/entitled/configured/successful/value-realised；
2. aggregate不反推identified firm、employee、customer、provider或respondent；
3. firm、enterprise、establishment、reporting/local unit不合并；
4. not applicable、not tested、tested-not-used、use、intensity、plan不合并；
5. internet、presence、commerce、software、cloud、AI、analytics、IoT、automation、安全、技能不互填；
6. AI不自动细化为generative AI；
7. online order不当payment、fulfilment、customer demand或transaction truth；
8. external implementation不当contract/procurement/lead；financing intent不当application/approval；
9. no need/non-use不自动当pain；barrier不当cause/severity/loss/WTP；
10. security control不当effective/compliant；incident不当breach/vulnerability/root cause；
11. ICT specialist/training/hard-to-fill/workforce impact不互换或下钻到person；
12. business/employee/turnover/money/count/intensity/composite不互换；
13. DII components跨year变化不得直接join；
14. current/prior-calendar/multi-year/planned/collection/publication time不互换；
15. questionnaire不当result，current route不当active programme，archive不当current；
16. mandatory survey不转为Probe或submission；
17. ABS collection/reference naming transition与rotating module不静默跨接；
18. ONS paused programme不由历史workbook升级current；
19. Eurostat 10+主population不由optional micro补齐，country deviation不丢失；
20. StatCan release 5+ narrative不覆盖table 1-4 micro，PID必须绑定question/release；
21. generic MCP/SDK/parser不提升domain maturity；
22. route失败不得回退republisher、other member、scraping、latest install或write surface。

## 6. Probe、隐私与晋级

本Channel无平台Probe。问卷提交、API key申请、subscription/contact、restricted access、download、MCP install/connect、unknown code、full mirror、materialization/index与任何平台write保持zero effect。主动验证需求只能使用自有landing page、访谈或获批实验。

默认只持久化publisher aggregate与semantic metadata；credential只存Host reference；禁止保存respondent identity、microdata、rare cell、owner/employee/customer/provider identity或restricted attributes。

晋级：evidence review → static contract → synthetic conformance → route/schema fixture → sandbox live → operational canary → 用户授权后的callable/durable。
