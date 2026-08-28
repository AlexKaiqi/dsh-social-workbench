# Public Household Expenditure, Consumption & Budget Allocation Channel Pack

## 1. 目的与比较键

本Channel用官方aggregate survey观察家庭预算配置、类别变化与消费约束候选。它不是个人/家庭支出画像、市场规模数据库、支付能力模型或因果需求证明。

```text
member + jurisdiction/publisher + programme/standing + questionnaire/diary/release
+ consumer-unit/household/reference-person/member/reporting-unit population
+ interview/diary/admin/integrated instrument + recall/diary/annualisation window
+ expenditure/consumption/non-consumption/income/imputed-service definition
+ CE-UCC/integrated-stub/COICOP/ECOICOP/SHS classification revision/category
+ acquisition/payment/liability/use + tax/reimbursement/gift/business/in-kind treatment
+ amount/share/reporting-percent/aggregate/median/per-capita/adult-equivalent
+ nominal/constant/PPS/currency/deflator + week/quarter/year/wave time role
+ weight/calibration/integration/imputation/outlier/denominator
+ sample/response/SE/RSE/confidence/suppression/method/classification break
+ table/workbook/PID/series/coordinate/schema/correction/rights
```

成熟度见[triage](./PUBLIC_HOUSEHOLD_EXPENDITURE_CONSUMPTION_BUDGET_ALLOCATION_TRIAGE_2026-08-26.md)，当前`callable=0 / durable=0`。

## 2. Snapshot、分析库与动态物化

Dolt/Git snapshot保存programme/lifecycle、population/unit、expenditure definition、instrument/recall/overlap、classification/correspondence、question/diary rule、representation/value basis/time、weight/integration/quality、release/rights、fixed OSS/Skill decision、verification lineage和adoption decision；不保存credential、response、diary、microdata、household/person identity、rare cell或下载文件。

未来durable授权后的分析库只接approved aggregate cells。动态物化至少包括：

- `consumer-unit-household-reference-person-member-reporting-unit`；
- `interview-diary-integrated-source-and-overlap`；
- `purchase-acquisition-payment-liability-consumption-use`；
- `consumption-vs-nonconsumption-tax-transfer-saving-debt-asset`；
- `all-units-mean-vs-reporters-mean-vs-percent-reporting`；
- `weekly-quarterly-twelve-month-annualised-calendar-financial-wave`；
- `nominal-vs-real-vs-PPS-with-price-reference`；
- `amount-share-aggregate-market-size-rejection`；
- `zero-no-purchase-missing-not-collected-suppressed-unreliable`；
- `rent-owner-cost-mortgage-principal-interest-utilities-imputed-rent`；
- `gift-given-received-third-party-paid-reimbursement-business-expense`；
- `CE-UCC-COICOP-ECOICOP-SHS-versioned-correspondence`；
- `income-before-after-tax-disposable-wealth-affordability-separation`；
- `questionnaire-fielded-vs-results-published-vs-route-current`；
- `sensitive-breakdown-aggregate-only-small-cell-gate`。

materialization key固定`member × programme/release × population/unit × instrument/window × definition/classification/category × measure/representation/value-basis/time × weight/denominator × breakdown × quality × rights-purpose`。definition、classification、instrument、weight、price reference、quality或rights漂移只失效受影响partition；失败回退canonical scan，不回退microdata、generic MCP、republisher或其他成员。

## 3. 可观测性

每次fixture/canary记录完整比较键，并至少发布：requested/returned/retained/dropped/quarantined/suppressed cells；unknown programme/population/unit/instrument/definition/category/window/representation/value-basis/weight/denominator/quality/release；Interview/Diary/integrated conflict；mean-all/mean-reporter/percent-reporting conflict；nominal/real/PPS/currency conflict；classification/correspondence drift；questionnaire/result/route/lifecycle conflict；sensitive breakdown/small-cell拒绝；effects恒为zero。

Health分别发布`concept-fixture`、`table-fixture`、`schema-fixture`、`selected-manual`、`sandbox-live`、`operational-canary`、`callable`和`durable`。成员不能借用成熟度。

## 4. Synthetic conformance

至少证明：

1. consumer unit、household、reference person、member和reporting unit不合并；
2. Interview、Diary和integrated estimate保留sample/weight/coverage/overlap；
3. purchase/acquisition/payment/liability/use/consumption不互推；
4. expenditure不当need、preference、satisfaction、welfare或demand；
5. consumption、tax、transfer、saving、debt、asset和business flow不合并；
6. weekly/quarterly/12-month与annualised/year/wave不互换；
7. mean-all、mean-reporters、median、aggregate、share、percent reporting不互换；
8. percent reporting不当annual buyer penetration、unique customer或ownership；
9. zero不当no product/no use/no need；missing/not-collected/suppressed/unreliable不当zero；
10. nominal change不当quantity，real value不当physical volume；
11. aggregate不当merchant revenue/market size，share不当market share/priority；
12. rent、principal、interest、owner cost、utility和imputed rent不互填；
13. gifts、third-party payment、reimbursement和business expense保留treatment；
14. CE UCC、COICOP/ECOICOP与SHS category只经exact correspondence映射；
15. income不当wealth/affordability/credit capacity；equivalised value不当welfare；
16. current questionnaire不当published result；latest table不覆盖correction history；
17. aggregate breakdown不反推家庭/个人或用于consequential decision/Probe targeting；
18. generic SDK/MCP/Skill/parser成功不提升domain maturity；
19. route失败不得回退microdata、HTML scraping、unknown code或write surface。

## 5. Probe、隐私与晋级

本Channel没有平台Probe。survey/diary submission、respondent recruitment/contact、special tabulation request、PUMD/PUMF/RDC/scientific-use申请或下载、MCP/Skill install/connect、mirror、materialization/index与任何write均需另行授权。需求验证只能把aggregate模式转成去群体化假设，再走自有landing page、访谈或获批实验。

敏感breakdown必须purpose-bound并经过minimum-cell/precision review；禁止用于credit、insurance、housing、employment、education、health或公共服务资格等consequential decision。
