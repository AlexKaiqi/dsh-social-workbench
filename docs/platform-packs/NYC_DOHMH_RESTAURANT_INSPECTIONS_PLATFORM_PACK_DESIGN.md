# NYC DOHMH Restaurant Inspection Results Platform Pack 设计

## 1. 稳定概念

[DOHMH dataset `43nn-pn8j`](https://data.cityofnewyork.us/Health/DOHMH-New-York-City-Restaurant-Inspection-Results/43nn-pn8j/)把CAMIS定义为restaurant permit identity，每行是一条citation。一次inspection有多条violations时CAMIS、inspection date/type、action、score和grade会重复；inspection是聚合root，citation row不是inspection count。

公开population只包括record date仍active的restaurants和college cafeterias，并保留从most recent inspection向前三年的sustained或not-yet-adjudicated citations。permit applied但未inspection的establishment以`1/1/1900`表示；no-violation inspection有单行。missing/illogical administrative values必须保留为quality flag。

`ACTION`可表示violations cited、no violations、closed、reclosed或reopened；`SCORE`会随adjudication更新；`GRADE`的A/B/C、pending/not-yet-graded和closure后reopening pending各有standing。[评分说明](https://www.nyc.gov/assets/doh/downloads/pdf/rii/restaurant-grading-faq.pdf)说明initial high-score、monitoring、reopening及部分complaint inspection虽有score但不graded。

closure、reopening inspection和supervisor reopening authorization是独立事实。[operator guide](https://www.nyc.gov/assets/doh/downloads/pdf/rii/blue-book.pdf)说明closed establishment在获准前必须停止营业，提交correction statement后仍需closed-to-public reopening inspection；reopened不保证以后条件或抹除原closure。

## 2. Capability与路由

| capability | route fixture | 当前状态 |
| --- | --- | --- |
| definition/process/data-dictionary read | official NYC/DOHMH docs and dataset attachments | knowledge only |
| dataset metadata/schema read | Socrata asset `43nn-pn8j` / OData metadata | exact route fixture only |
| selected inspection/citation metadata read | SODA/OData row route with fixed field allowlist | manual/fixture only |
| selected closure/reopen lineage read | exact `ACTION` within one source-declared inspection/CAMIS lineage | manual/fixture only |
| arbitrary SoQL/HTML/ABCEats/browser read | none | rejected |
| complaint、inspection、permit、hearing、payment或write | none | rejected |

当前`callable=0 / durable=0`。未来canary必须固定portal、dataset ID、agency owner、data dictionary/schema revision、record date、active population、history window、row order/pagination、inspection aggregation key、citation/adjudication semantics和field allowlist；community view、derived map、ABCEats UI或另一个restaurant dataset不得fallback。

## 3. Snapshot、rights与字段边界

[NYC Open Data terms](https://opendata.cityofnewyork.us/overview/)明确DOHMH是authority、数据仅供information、可随时update/correct/refresh且无completeness/currentness warranty。Snapshot固定dataset/schema/dictionary/process/grade threshold、population/history、known quality warning、rights/terms digest与valid window。

默认分析projection只保留opaque CAMIS、inspection/cycle、violation code、severity/critical flag、action、score/grade standing和coarse borough/business type。DBA、building/street/ZIP/phone、owner/operator、exact permit、free-text description、latitude/longitude默认drop；cuisine不能用于族群或声誉画像。

## 4. 动态视图、可观测性与fixture

动态视图：`active-population-vs-history-window`、`inspection-root-to-citation-row-dedupe`、`inspection-kind-score-grade-standing`、`citation-unadjudicated-to-sustained-or-dismissed`、`closed-reopened-reclosed-lineage`、`administrative-missing-illogical-value-quarantine`与`location-contact-drop-audit`。

Telemetry逐`dataset/schema/dictionary revision × record date × CAMIS/inspection cycle × inspection type/action × citation code/critical flag/posture × score/grade/standing × active/history coverage × privacy/rights`记录returned/retained/dropped、duplicate ratio、missing root、adjudication delta、closure lineage gap、stale watermark、schema drift、fallback rejection与zero effects。

Synthetic至少覆盖：one inspection three citations；no-violation single row；`1/1/1900` not inspected；initial high score ungraded；score correction after adjudication；closed→reopened→reclosed；inactive establishment absent但不推断safe/closed；phone/address drop。

必须拒绝：citation row→inspection count、critical→illness、grade A→continuing safety/endorsement、C→closure、closed→permanent business failure/outbreak、reopened→history erased、active population absence→no violation，以及sodapy/MCP→authorized Connector。

## 5. 官方资料

- [Restaurant Inspection Results dataset](https://data.cityofnewyork.us/Health/DOHMH-New-York-City-Restaurant-Inspection-Results/43nn-pn8j/)
- [Food Establishment Inspections / ABCEats](https://www.nyc.gov/site/doh/services/restaurant-grades.page)
- [How We Score and Grade](https://www.nyc.gov/assets/doh/downloads/pdf/rii/restaurant-grading-faq.pdf)
- [What to Expect / closure and reopening](https://www.nyc.gov/assets/doh/downloads/pdf/rii/blue-book.pdf)
- [NYC Open Data terms](https://opendata.cityofnewyork.us/overview/)

本轮没有请求任何Socrata/OData/ABCEats restaurant、inspection、citation或closure row。
