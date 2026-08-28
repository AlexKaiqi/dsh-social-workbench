# Paris Budget Participatif Platform Pack 设计

状态：`concept-fixture + winner/implementation route-fixture / architecture-only`
核验日期：2026-08-26
Platform Pack ref：`paris-participatory-budget/v0-design`

## 1. 稳定概念与官方证据

Paris官方[2024流程与结果说明](https://www.paris.fr/pages/dernieres-semaines-pour-deposer-vos-idees-au-budget-participatif-2024-25838)描述general-interest idea、eligibility/feasibility、vote，以及约143,000 voters、235 ballot proposals与121 winners。[2025官方说明](https://presse.paris.fr/communiques/10313)记录2,079 ideas、261 admissible/feasible projects，并说明投票年龄至少7岁且无nationality条件。官方[投票说明](https://cdn.paris.fr/paris/2025/08/27/1-sommaire-Lent.pdf)说明自2021年采用majority judgment、四档grade，并允许参与Paris-wide与district ballot。majority grade不能转换成普通vote count，也不能跨城市排行；官方关于consensus/representativeness的目标不能升级为统计代表性证明。

[Paris Open Data winner dataset](https://opendata.paris.fr/explore/dataset/bp_projets_gagnants/)及其[API说明](https://opendata.paris.fr/explore/dataset/bp_projets_gagnants/api/)采用ODbL，覆盖2014年以来winner从planning到realization，字段包括winner ID、edition、title、theme、implementing direction、global budget、scale、address/arrondissement、progress state与study/procurement/work/projected delivery/opening dates。它是winner/implementation population，不含全部submitted、ineligible、infeasible、ballot或not-selected记录。

## 2. 概念映射

| Native | `PublicParticipatoryBudget*` |
| --- | --- |
| idea / admissibility / feasibility | need + evaluation，当前selected/manual |
| Paris/district ballot | exact round/scope/ballot roster |
| four grades / majority judgment | majority-grade measure + weighting rule |
| winning project | selected；非appropriated或delivered |
| global budget | exact source amount role；不得猜测spend |
| implementing direction / progress | implementer authority + source-declared status |
| study/procurement/work/opening dates | distinct schedule/milestone events |

## 3. 期望只读能力

`definition.read`、`proposal.selected.read`、`evaluation.selected.read`、`ballot-result.selected.read`保持manual。`winner.list.read`、`winner.read`与`implementation.status.read`有official route fixture，但当前没有PortBinding：未调用API、未读取row，也未验证分页、持续coverage、deletion propagation或长期保存权利。winner route不得被用于估计proposal denominator、rejection rate或总体需求。

## 4. 数据、安全与Conformance

普通projection保留opaque edition/scope/project/theme/implementer、approved project span、amount role、state、dates与relations；exact address/coordinates应drop或coarsen，姓名、contact、demographics、political profile、attachments/comments与未审查文本不进入分析库。

Synthetic覆盖majority grade≠vote count、一个参与者可投两类ballot、winner-only absence不是no-demand、2,079→261是不同population、selected≠appropriated、procurement milestone≠contract/spend、`completed/opened`仅source-declared，以及exact location drop。所有idea/vote/grade/comment/follow/status更新routes恒拒绝。

