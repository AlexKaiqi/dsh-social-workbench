# Madrid Participatory Budgets Platform Pack 设计

状态：`concept-fixture + provider-schema candidate + selected-record/manual / architecture-only`
核验日期：2026-08-26
Platform Pack ref：`madrid-participatory-budgets/v0-design`

## 1. 稳定概念与官方证据

Decide Madrid的[官方流程页](https://decide.madrid.es/mas-informacion/dm/presupuestos)说明2026–2027过程面向2028/2029预算、总额€50m，30% city-wide、70%按人口分配至district；阶段为proposal、support/prioritization、evaluation与final vote。16岁以上可提案且可非resident，support/vote则要求16岁以上registered/verified Madrid resident；paper support计入online aggregate。support阶段不受budget limit，与final vote不同。final vote可选city与一个district项目、受envelope约束且关闭前可修改；positive/negative规则以negative按三分之一扣减，可能产生fractional net score。项目按net result排序，并在剩余envelope可容纳时选择；winner进入preliminary city budget，随后仍需approval/control与execution tracking。

官方[2024结果](https://decide.madrid.es/presupuestos/presupuestos-participativos-2024/resultados)展示net score、positive/negative与estimate，[execution tracker](https://decide.madrid.es/presupuestos/presupuestos-participativos-2024/ejecuciones)提供后续状态。官方[privacy policy](https://decide.madrid.es/politica-de-privacidad)说明会处理姓名、DNI、地址和IP；[terms](https://decide.madrid.es/condiciones-de-uso)不应被解读为所有公开第三方内容可任意索引复用。

CONSUL Democracy的[GraphQL文档](https://docs.consuldemocracy.org/tech_docs/features/graphql)与[固定官方源码](https://github.com/consuldemocracy/consuldemocracy/tree/9d072cca7a68cd960d5c871484265585dbd060d9)只证明provider层存在Budget、Investment、Milestone等概念；不能证明Decide Madrid当前部署schema、version或customization。

## 2. 概念映射

| Native | `PublicParticipatoryBudget*` |
| --- | --- |
| city/district allocation | scope envelope；非项目spend |
| proposal / grouped duplicate | need + source-declared merged/duplicate relation |
| support | prioritization aggregate；与final vote分离 |
| feasibility / estimate | evaluation + technical estimate |
| positive / negative / net score | distinct measures + exact weighting rule |
| ranked selection under remaining budget | rank + selected/skipped-under-envelope |
| preliminary budget / approval | budget inclusion；非appropriation/payment |
| execution page | authority status；非独立验收 |

## 3. 期望只读能力

`definition.read`、`proposal.selected.read`、`priority.aggregate.read`、`evaluation.read`、`ballot-result.read`和`execution.read`当前均不可调用。HTML只允许selected/manual package；CONSUL schema仅为provider-schema candidate。未来exact route必须验证deployment revision、pagination、current fields、paper/online reconciliation、history、rights、privacy与retention。

## 4. 数据、安全与Conformance

普通projection不接姓名、DNI、地址、IP、账户、contact、precise location、comments、attachments、demographics、political profile与未审查文本。公开可见不自动授予全文索引或embedding权利。

Synthetic必须覆盖support≠vote、paper/online common origin、positive/negative三分之一权重与fractional net score、vote可修改、一个人可选多个项目、budget-fit跳过较高rank项目、winner仅进入preliminary budget，以及provider schema不能升级exact deployment。create/support/vote/unvote/comment/follow/share与admin/status mutation恒拒绝。
