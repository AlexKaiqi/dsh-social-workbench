# U.S. BLS American Time Use Survey Platform Pack

## 1. 稳定概念与官方事实

[ATUS overview](https://www.bls.gov/tus/overview.htm)把ATUS定义为全国代表性、覆盖market与nonmarket activity的time-use survey；样本可与CPS连接。[2025 questionnaire](https://www.bls.gov/tus/questionnaires/tuquestionnaire.pdf)定义4 a.m.至次日4 a.m.的单次telephone recall diary，并明确一般不采集simultaneous activities；work、volunteering、eldercare和secondary childcare另有follow-up。[2025 files](https://www.bls.gov/tus/data/datafiles-2025.htm)把respondent、roster、activity、activity-summary、who、eldercare、CPS和replicate-weight文件分开。

## 2. 能力与采用边界

| Capability | 当前采用 | 边界 |
| --- | --- | --- |
| programme/population/questionnaire/lexicon/user-guide | `fixture` | designated person age 15+、CPS lag与revision固定 |
| annual news/tables/LABSTAT TU series | `table-or-api-fixture` | series ID、population/participant denominator固定 |
| annual/multi-year microdata | `not-adopted` | activity/roster/who/eldercare/person-level files在高风险门外 |

一个assigned diary day不是usual routine。`average day`按全人口与一周日型加权；population mean包含未参与者，people-who-did mean只含参与者。ATUS的primary activity和secondary childcare不可相加成24小时分类；location/with-whom不是精确轨迹或身份。

## 3. 开源、Skill与验证

[bls_data@`6d13208`](https://github.com/kovashikawa/bls_data/tree/6d1320872dccba3703e44026758714778d3b5c93)是community/MIT BLS v2/MCP transport，可参考TU series request，但key rotation与generic resolver不进入本系统policy边界。[TUSK@`957ecb3`](https://github.com/sbirch/TUSK/tree/957ecb36c4409f0ba7ca55553f5f66b769860a3b)是MIT的2003–2012 SQLite/lexicon/dictionary研究工具，README明确PDF抽取可能出错且会处理microdata，只作static counterexample。未发现BLS-owned ATUS Agent Skill/MCP；均未安装或执行。

Synthetic覆盖4 a.m. boundary、one respondent/one day、weekday/weekend assignment、primary/no-general-simultaneous、secondary childcare、population/participant mean、participation、episode/activity summary、CPS 2–5 month lag、lexicon revision、replicate weights和microdata rejection。

## 4. Snapshot与可观测性

Snapshot保存programme、sample/diary rule、questionnaire/lexicon、file/table/series、weight/denominator、release/rights和OSS decision。Telemetry逐`year × table/series × population × activity-role/category × representation × diary-day/time × weight`记录retained/dropped、series/category drift、mean-denominator mismatch、CPS-lag warning、secondary-care overlap和zero effects。
