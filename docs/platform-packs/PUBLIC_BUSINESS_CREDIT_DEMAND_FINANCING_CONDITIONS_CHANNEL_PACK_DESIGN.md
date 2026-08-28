# Public Business Credit Demand & Financing Conditions Channel Pack

## 1. 目的与不可合并事实

本Channel用于发现企业融资供需、授信收紧、贷款条件、credit performance和reported drivers的aggregate变化，补齐business formation与formal insolvency之间的pressure signal。它统一`PublicBusinessCredit*` projection，但不统一survey、panel、question、loan category、borrower segment、measure、direction、balance、weighting、past/current/expected role、quality、release或rights。

可比较partition至少固定：

```text
member + jurisdiction + publisher + survey/program + panel/respondent population
+ question/revision + standard/ad-hoc + borrower segment + loan category
+ standards/availability/demand/price/non-price/approval/performance/driver
+ response scale + balance/net-percentage/diffusion-index + sign convention
+ weighting/denominator + past/current/expected + horizon/reference period
+ geography + response quality + release/vintage + rights/access
```

`PublicLaborDemand*`、`PublicBusinessDemography*`、`PublicBusinessInsolvency*`与`PublicCorporateDisclosure*`只可形成aggregate hypothesis relation。credit demand不回填vacancy/investment，tightening不回填business death/insolvency，reported driver不回填company plan。

## 2. 成员与能力矩阵

| 成员 | Availability/standards | Demand | Price/non-price terms | Expectation/current level | Performance/drivers | Exact official access |
| --- | --- | --- | --- | --- | --- | --- |
| Federal Reserve SLOOS | C&I/CRE standards | regular demand | spreads/premiums/lines/maturity/covenants/collateral | special expectations与historical range | special asset quality/approval/factors | DDP CSV/XML-SDMX；distribution migrating |
| ECB BLS | enterprise credit standards | regular net demand | margins/charges/collateral/covenants/maturity | regular past/next-quarter | factors；ad-hoc topics | ECB Data Portal SDMX `BLS` |
| Bank of England CCS | corporate credit availability | current + expected | spreads/fees/collateral/lines/covenants | regular past/next-quarter | defaults/LGD/drawdowns/factors | HTML + annex/questionnaire XLSX；无API |
| Bank of Canada SLOS | overall/price/non-price conditions | historical narrative only | price/non-price aggregate | current conditions；无current expectation proof | historical demand/factors | Valet group `slos` CSV/JSON/XML |

成熟度：`requested=4 / concept-fixture=4 / exact official machine route-fixture=3 / official table-or-bulk route-fixture=4 / availability-or-standard fixture=4 / current-demand fixture=3 / historical-demand fixture=4 / price-term fixture=4 / non-price-term fixture=4 / regular-or-ad-hoc expectation fixture=3 / credit-performance fixture=2 / reported-driver fixture=4 / response-quality fixture=4 / selected-manual=4 / callable=0 / durable=0`。generic macro API、MCP、SDMX parser或HTTP 200不会提高domain maturity。

## 3. Snapshot、分析库与动态物化

Dolt/Git snapshot保存member/program/panel/question/response scale、loan/borrower taxonomy、measure/direction/balance/weighting、past/current/expected、quality/release/revision/rights、fixed OSS/Skill revision、adoption decision与verification lineage；不保存credential、未授权observations/files、respondent identity、application、loan、borrower或open text。

未来获得durable授权后，分析数据库只接field-approved aggregate cells。动态物化视图至少包括：

- `lender-reported-supply-vs-borrower-demand-vs-observed-volume-isolation`；
- `standard-extensive-margin-vs-term-intensive-margin-vs-availability`；
- `respondent-response-weighted-response-loan-category-borrower-segment-grain`；
- `ci-cre-enterprise-corporate-small-business-capital-market-native-category`；
- `large-middle-large-medium-small-very-small-sme-pnfc-definition`；
- `net-percentage-weighted-balance-diffusion-index-balance-of-opinion-mean`；
- `positive-tightening-easing-availability-demand-default-quality-direction`；
- `unweighted-market-share-loan-stock-national-share-intensity-weighting`；
- `past-three-month-next-three-month-annual-expectation-current-historical-level`；
- `spread-reference-rate-fee-premium-price-term`；
- `collateral-covenant-maturity-credit-line-non-price-term`；
- `approval-willingness-vs-observed-credit-decision`；
- `default-rate-lgd-delinquency-chargeoff-quality-change-vs-count-or-amount`；
- `reported-driver-vs-causal-effect-and-company-action`；
- `standard-ad-hoc-question-panel-response-na-confidentiality-coverage`；
- `question-sign-weight-panel-backcast-schema-distribution-release-lineage`；
- `member-question-quality-rights-and-comparability-gate`。

跨成员credit-pressure view默认发布member-native direction/trend，不发布未经question/sign/weighting gate的country rank或synthetic global index。物化按knowledge/release revision可重建；index缺失时回退canonical scan，不回退FRED mirror、generic MCP、另一个member或网页抓取。

## 4. 可观测性

每次request/fixture/canary记录：

```text
member × jurisdiction/publisher × survey/program/panel/respondent population
× publication/dataset/resource/table/series/question/revision × release/vintage
× loan category/borrower segment × measure/term × response scale/balance/sign
× weighting/denominator × past/current/expected/horizon/reference period
× geography × quality/status/rights/access
```

Counters与gauges至少包括：

- requested/returned/retained/dropped/quarantined/suppressed series、questions、cells与files；
- unknown program/panel/question/loan category/borrower segment/measure/balance/sign/weight/time role；
- lender response as application/approval/volume/firm pain rejection；
- standards/availability/terms、price/non-price与extensive/intensive margin conflict；
- positive-direction ambiguity与measure-specific sign mismatch；
- net percentage/diffusion index/balance/mean/qualitative representation mismatch；
- unweighted/market-share/loan-stock/national-share/intensity weighting conflict；
- past/current/expected/historical-range/annual horizon mismatch；
- expectation-as-outturn、reported-driver-as-cause与survey-performance-as-event rejection；
- spread-as-rate-level、direction-as-magnitude、default-change-as-count/loss rejection；
- standard/ad-hoc、question wording/number、panel/response count、NA/nonresponse/confidentiality drift；
- DDP migration、SDMX DSD/key、workbook sheet、Valet group/series/schema digest drift；
- licence/attribution/third-party/non-endorsement/retention drift与zero effects。

Health分别发布`concept-fixture`、`route-fixture`、`schema-fixture`、`selected-manual`、`sandbox-live`、`operational-canary`、`callable`和`durable`。data client connected或数字返回成功不能替代domain readiness。

## 5. 合成 conformance

Synthetic fixtures至少证明：

1. lender-reported supply不当borrower-stated demand或actual loan volume；
2. survey demand不当application count、approved amount、investment或identified need；
3. standard不当term，availability不当approval，term不当contract outcome；
4. respondent institution、response、weighted response、loan category、segment和series分开；
5. domestic bank与foreign branch panel不合并；country result不当euro-area aggregate；
6. C&I、CRE、enterprise、corporate、small-business和capital-market access不互换；
7. large/middle-market、large、medium、small、very small、SME与PNFC按source threshold隔离；
8. same question number跨release不在wording/revision缺失时join；
9. standard question不与ad-hoc/special question补齐历史；
10. past three months不当survey fieldwork quarter或publication quarter；
11. next-three-month/annual expectation不当realised outturn或publisher forecast；
12. current level relative to historical range不当quarter-on-quarter tightening；
13. positive SLOOS standards当tightening，但positive demand当stronger demand；
14. positive BoE availability/demand/terms/default按question convention分别解释；
15. positive BoC business balance当net tightening，不与BoE availability正值合并；
16. net percentage、weighted balance、diffusion index、mean和qualitative band不互换；
17. diffusion index的considerably/somewhat intensity不丢失；
18. unweighted response share不与market-share或loan-stock weighted balance比较；
19. ECB national→euro-area two-step weighting不被简单平均替代；
20. missing/NA/nonresponse/confidential/special-not-asked不当zero或unchanged；
21. spread over base/reference rate不当contract rate或policy rate；
22. fees、premium、collateral、covenant、maturity和credit-line size保持独立terms；
23. approval likelihood/willingness不当observed approval或denial；
24. default/LGD/quality direction不当count、level、loss amount或insolvency；
25. factor contribution不当causal estimate或individual business purpose；
26. publication discontinued不当series discontinued，series continued也不回填narrative fields；
27. sign backcast/question redesign/panel/method/distribution migration形成新lineage；
28. aggregate不得反推respondent institution、borrower、application或facility；
29. generic API/MCP/client/SDMX parser成功不升级question/sign/weight/domain maturity；
30. route失败不得回退republisher、another member、HTML scraping、latest install或写操作。

## 6. 隐私、权利与安全

- 默认只保留publisher aggregates与semantic metadata；institution/respondent identity、market share、individual answer、open text、borrower、application、loan/facility、account/contact和credit decision全部pre-gate drop。
- public aggregate、public endpoint与durable commercial reuse不是同一rights conclusion。Fed public-domain default、ECB reuse conditions、BoC attribution terms和BoE CCS rights-review分别保存。
- credential只以Host reference存在；FRED key、MCP OAuth、cookies和account metadata不进入snapshot/chat/log/fixture/Git。
- 不提供credit scoring、underwriting、lender ranking、investment/financial advice或对困境企业的定向profiling。

## 7. Probe与副作用边界

本Channel没有平台Probe。survey response/submission、loan application、credit enquiry、quote、pre-qualification、bank contact、FRED key registration、email subscription、MCP install/connect、data download、full-history mirror、index materialization或任何financial/admin write均保持zero effect。主动验证需求只能走自有landing page、问卷、访谈或获批的销售/产品实验，不能伪造融资申请或向金融机构制造调查信号。

## 8. 晋级顺序

1. evidence review：固定四成员program/panel/question/loan/borrower/measure/sign/balance/weight/time/quality/route/rights；
2. static contract：编译`PublicBusinessCredit*`并验证EvidenceSpan/Observation/SourceItemCandidate承载；
3. synthetic fixture conformance：先证明30项拒绝边界；
4. route/schema fixture：只验证Fed DDP、ECB BLS metadata/DSD、BoE page/workbook envelope与BoC Valet group/series metadata，不取observation；
5. sandbox live：逐成员approved single-series/small-cell read，固定question/period/cell/byte/TTL/no-fallback；
6. operational canary：监控question/sign/weight/panel/schema/rights/distribution drift并自动降级；
7. 用户另行授权后，才可能发布`callable`和`durable`成员revision。
