# Public Consumer Prices, Inflation & Affordability Channel Pack

## 1. 目的与不可合并事实

本Channel用于发现价格上涨、品类通胀、产品替换、质量调整、区域差异、数据发布摩擦和生活成本解释中的需求与痛点。它统一`PublicConsumerPrice*` projection，但不统一program population、basket、classification、quote population、average-price method、weight、index formula、base/reference period、change window、seasonal treatment、release vintage、availability、affordability denominator或rights。

最小事实链：

```text
program population + classification + method revision
          -> quote + item/outlet/package/time posture
          -> average price (defined quote population + weighting)
          -> index component (quality/replacement/imputation treatment)
          -> index observation (formula + basket weight + reference periods)

compatible income/earnings/expenditure denominator + price numerator
          -> affordability aggregate for an exact household population

publisher-explicit availability -----------------> separate posture
missing/imputed/suppressed quote ----------------> never inventory by default
```

所有实线关系必须由exact member native identity、classification、program、release与method证明。同名品类、相同index value、相同currency、相邻月份或同一API只生成review candidate。

## 2. 成员与能力矩阵

| capability | BLS CPI | ONS CPIH/CPI | Eurostat HICP | Statistics Canada CPI | 当前发布 |
| --- | --- | --- | --- | --- | --- |
| `consumer-price.program.read` | CPI-U/W/C-CPI-U fixture | CPIH/CPI/RPI/HCI fixture | HICP/HICP-CT fixture | Canadian CPI fixture | knowledge/fixture only |
| `consumer-price.classification.read` | item/area catalog fixture | COICOP/segment framework fixture | ECOICOP v2/DSD fixture | product/dimension/member fixture | knowledge/fixture only |
| `consumer-price.index.read` | series/API fixture | cpih01/MM23 fixture | prc_hicp_minr fixture | PID 1810000401 fixture | knowledge/fixture only |
| `consumer-price.weight.read` | relative/cost weight fixture | annual weight/method fixture | item/country weight fixture | PID 1810000701 fixture | knowledge/fixture only |
| `consumer-price.average-price.read` | selected official series | selected/aggregated outputs | not asserted | PID 1810024501/02 | 3 member fixtures |
| `consumer-price.quote.read` | no public quote route asserted | local quote research files, reduced 2026 coverage | not asserted | no transaction microdata route asserted | 1 member fixture |
| `consumer-price.availability.read` | missing/imputed only, not stock | indicator/missing posture only | not measured | WDS/table availability only, not stock | no inventory capability |
| `consumer-price.affordability.read` | denominator absent | denominator absent | denominator absent | denominator absent | no published member binding |

成熟度：`requested=4 / concept=4 / exact official index route-fixture=4 / weight route-or-method fixture=4 / average-price route-fixture=3 / quote-microdata route-fixture=1 / source availability posture=2 / inventory availability=0 / affordability denominator=0 / selected-manual=4 / callable=0 / durable=0`。共同使用percentage、COICOP、CSV、SDMX或REST不会提高成熟度。

## 3. Snapshot、分析库与动态物化

Dolt/Git snapshot保存Platform/Channel Pack、program/population/method/classification、dataset/series/PID/cube/DSD、weight/index/price reference periods、formula/seasonal/adjustment/missing/release/revision/rights定义、固定OSS/Skill revision、decision、verification、lineage与tombstone；不保存未授权quote/scanner/transaction bulk或restricted outlet identity。

未来获得durable授权后，分析数据库只接field-approved aggregate和受治理的quote reference。动态物化视图至少包括：

- `member-publisher-program-dataset-product-route-roster`；
- `program-population-territory-household-and-consumption-scope`；
- `classification-version-item-segment-code-and-mapping-lineage`；
- `quote-vs-average-price-vs-index-vs-change-measure`；
- `currency-tax-discount-quantity-package-outlet-channel-and-geography`；
- `basket-weight-vs-price-reference-vs-index-reference-vs-publication-period`；
- `monthly-vs-twelve-month-vs-annual-average-vs-index-point-change`；
- `quality-replacement-imputation-carry-forward-seasonal-tax-and-package-treatment`；
- `missing-imputed-suppressed-quote-vs-explicit-availability`；
- `preliminary-current-revised-corrected-rebased-backcast-superseded-history`；
- `SA-vs-NSA-HICP-vs-HICP-CT-and-program-family-separation`；
- `first-published-vs-current-observation-lineage`；
- `price-numerator-plus-compatible-income-earnings-expenditure-denominator`；
- `household-population-specific-burden-not-individual-hardship`；
- `restricted-outlet-transaction-and-provider-identity-drop-audit`；
- `schema-classification-method-api-rate-licence-and-publication-drift`。

每个view携带member/program/product/release、population、classification/method revision、measure/change、base/weight/reference periods、seasonal/adjustment/missing posture、coverage、rights、input snapshot和rebuild reason。rebase、classification、weight或method变化只重建受影响partition，不改写旧evidence。

## 4. 可观测性

Telemetry维度至少为：

`member × publisher/jurisdiction × program/population × dataset/product/series/PID/cube × release/vintage × classification/item/segment × quote/average/weight/index/affordability grain × measure/change × currency/unit/package/tax/discount × geography/outlet/channel × base/price/weight/reference/publication period × seasonal/adjustment/missing/availability posture × rights/access`

记录：

- requested/returned/retained/dropped/quarantined/suppressed；
- fetch/parse/schema/dimension/code错误、pagination/truncation、bulk size和format drift；
- API rate budget、429/409/update window、registration/key posture、retry/fallback rejection；
- series/PID/dataset replacement、classification/code remap、dimension order/category drift；
- null/zero/missing/suppressed/imputed区分和forbidden stock inference计数；
- quote→average、average→index、index point→percent、weight→demand的拒绝计数；
- index/base/price/weight period mismatch、SA/NSA和change-window mismatch；
- preliminary/first-published/current/revised/rebased/backcast delta与release lag；
- average-price sample/package/quality rotation和quote coverage变化；
- affordability denominator missing/incompatible、household population mismatch和个体化拒绝；
- licence/attribution/confidentiality/retention/method drift与zero effects。

告警必须按member/program/product/release隔离。BLS API健康不能掩盖catalog/weight drift；ONS cpih01健康不能掩盖quote coverage减少；Eurostat current dataset健康不能掩盖旧classification替换；WDS健康不能掩盖PID correction或full-table digest变化。

## 5. 合成conformance

至少验证：

1. nominal quote不物化为average price或index；
2. average price不物化为pure price change；
3. index point不解释为currency或percentage；
4. monthly、12-month、annual-average和moving-average rate分开；
5. index-point change与percent change分开；
6. expenditure weight不解释为quantity、purchase count或demand；
7. price reference、weight reference、index reference和publication period不互换；
8. rebasing/re-referencing只改变scale，不生成price shock；
9. SA和NSA series不merge；
10. CPI-U/W、C-CPI-U、CPI/CPIH/RPI、HICP/HICP-CT不按headline label merge；
11. harmonised method不证明national basket相同；
12. ECOICOP v1/v2和item/consumption-segment只按versioned mapping连接；
13. regular、sale、clearance、transaction、tax-inclusive和constant-tax price分开；
14. specific package与unit-normalized package分开；
15. quality-adjusted replacement不等于同一物理product；
16. imputed/carried price保持derived posture；
17. missing/imputed/suppressed quote不输出stockout；
18. publisher明确availability仍不自动成为inventory quantity；
19. first-published、current、corrected、rebased和backcast保留lineage；
20. null、flag、409或429不解释为zero；
21. CPI没有兼容income/earnings/expenditure denominator时不输出affordability；
22. national/typical household aggregate不归因到individual household；
23. cross-member comparison缺population/formula/base/measure compatibility时拒绝；
24. credential、outlet identity、restricted transaction、provider agreement和可重识别组合全部drop/quarantine。

## 6. 隐私、权利与安全

- 默认drop/quarantine精确retailer/outlet/provider identity、restricted scanner transaction、合同字段、credential、customer/household identity和可重识别组合；
- 公开quote microdata仍受research standing、coverage reduction、geographic coarsening和provider confidentiality约束；
- BLS public-domain/API Terms、ONS OGL v3、Eurostat reuse exceptions和Statistics Canada Open Licence分别绑定，OSS licence不能覆盖数据许可；
- correction、withdrawal、rebase、classification replacement和source revision必须传播到derived view，同时保留合法evidence lineage；
- 不将aggregate statistical signal用于个体信用、保险、就业、福利、定价或歧视性决策。

## 7. Probe与副作用边界

本Channel没有平台Probe。注册API key、绕过rate limit、请求restricted microdata、联系统计机构/retailer、提交/修改统计、订阅发布、创建dashboard share、写入MCP或任何admin action都属于账户、法律、运营或外部副作用，保持zero effect。主动需求测试只能走系统自有landing page、问卷、访谈或产品实验Channel，并且不得冒充统计机构或引用虚构官方数字。

## 8. 晋级顺序

1. 冻结member/program/product、population、classification、measure、formula、base/weight/reference periods、release/revision、coverage和rights；
2. 先用synthetic fixture验证所有不可推断项、dimension decode和sensitive-field drop；
3. 另行授权后只做metadata/catalogue canary，再做单series/PID/dataset的小时间窗read；
4. 验证rate/update window、pagination、flags、revision、rebase、replacement和classification drift；
5. 只有quote/average/index/weight语义对账通过，才允许aggregate materialization；
6. 只有compatible denominator与household population对账通过，才允许affordability view；
7. operational canary必须能因program、method、classification、base、weight、release、access、licence或confidentiality drift自动fail closed。
