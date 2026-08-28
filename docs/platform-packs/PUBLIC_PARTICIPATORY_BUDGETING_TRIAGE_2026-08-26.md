# 公共参与式预算：提案、优先级、分配与执行平台分流（2026-08-26）

状态：`researched / architecture-only / no-connector`
核验日期：2026-08-26

## 1. 为什么是独立领域

参与式预算提供一条跨越需求表达与资源选择的链：`resident idea/proposal → admissibility/feasibility/costing → prioritization → ballot → vote/grade/rank → selected under envelope → budget inclusion/appropriation → implementation milestone`。它不同于普通公共预算、采购、支出、请愿与民调：核心不是“政府花了什么”或“多少人支持某观点”，而是居民提出什么项目、项目如何进入选择、预算约束怎样影响结果，以及官方随后报告了什么执行状态。

发布只证明一个拟议用途进入公开过程；支持、投票、等级和排名只是在特定资格、渠道、核验、权重与选票规则下的aggregate；入选、预算纳入、拨款、采购、付款、完工和效果必须分开。

## 2. 首批成员与成熟度

| Member | 官方表面 | 信号增量 | 当前成熟度 |
| --- | --- | --- | --- |
| Barcelona Participatory Budgets | Decidim process +市政府流程/结果页 | proposal、technical validation、prioritization、co-development、budget-constrained final vote、follow-up | concept + provider-schema candidate + selected/manual |
| Madrid Participatory Budgets | Decide Madrid process/results/execution + CONSUL docs | support与final vote分离、正负票加权净分、按剩余envelope选择 | concept + provider-schema candidate + selected/manual |
| Paris Budget Participatif | Paris process/results + official open-data winner tracker | majority judgment、winner-only implementation population、状态与计划日期 | concept + official winner/implementation route fixture |
| NYC Participatory Budgeting | Council process/results + NYC Open Data historical datasets | capital-project eligibility、district ballot、winner-to-budget-to-agency chain | concept + historical route fixture + current selected/manual |

requested=4、concept-fixture=4、exact-member data route-fixture=2、provider-schema candidate=2、selected/manual=4、callable=0、durable-approved=0。Barcelona与Madrid的开源provider schema不能升级为具体deployment route；Paris数据只覆盖winners，NYC机器数据仅覆盖历史年份，均不是完整或当前总体。

本轮只读取官方网页、文档、数据目录/schema与固定官方源码。没有调用数据route、查询或保留数据row，没有安装或执行第三方代码，也没有提案、支持、投票、评论、关注、状态更新或其他平台写入。

## 3. 共同事实边界

- proposal exact span最多形成`EvidencePublishedParticipatoryBudgetNeed`；不证明内容真实、代表性、可行、入选、获资助或有效；
- prioritization support与final vote必须分开；一个人可支持或选择多个项目，所以action count不是unique people或独立需求数；
- vote、positive/negative vote、weighted net score、majority grade、rank与participant aggregate都是不同measure kind，不跨城市或轮次比较；
- eligibility、年龄、resident verification、online/paper reconciliation、minimum/maximum projects与envelope约束必须绑定exact process revision；
- proposal、merged/grouped proposal、officially developed ballot project和winner通过source-declared relation连接，不能按标题相似自动合并；
- `selected`、`selected-under-envelope`、`included-in-budget`、`appropriated`、`procurement`、`reported spend`与`source-declared completed/opened`是不同事实；
- proposer estimate、technical estimate、ballot price、selected amount、appropriation与spend必须保留amount role；
- authority tracker写`completed`最多形成`EvidenceReportedParticipatoryBudgetExecution`，不是独立验收、质量、影响或满意度证明；
- winner-only数据缺少未入围或未入选项目，不得把absence解释为no-demand；历史数据不得冒充当前coverage；
- proposer/voter identity、contact、exact address/coordinates、demographics、political profile、attachments、comments与未审查敏感全文默认drop或quarantine。

## 4. Agent Skill、MCP与开源审计

| Artifact | 固定revision / license | 可借鉴 | 结论 |
| --- | --- | --- | --- |
| [decidim/decidim](https://github.com/decidim/decidim/tree/1bf59790e1043ad0faed974ca7480263f20c86e4) | `1bf59790…` / AGPL-3.0 | budgets project、投票规则、accountability result与GraphQL概念 | 官方provider源码证据；不安装/执行，不证明Barcelona部署schema/config |
| [consuldemocracy/consuldemocracy](https://github.com/consuldemocracy/consuldemocracy/tree/9d072cca7a68cd960d5c871484265585dbd060d9) | `9d072cca…` / AGPL-3.0 | budget investment、milestone与GraphQL route概念 | 官方provider源码证据；不安装/执行，不证明Madrid部署schema/config |

未发现可验证的城市官方Agent Skill或MCP；结论是`discovery-incomplete`，不是不存在证明。搜索到的无关community MCP/skill不进入候选。通用浏览器、HTML scraper或未知代码不是Connector fallback。

规划Skill：

- `public-participatory-budget-source-contract-research/v1`：只读官方流程、schema、隐私、rights与固定源码，输出versioned Pack proposal；
- `public-participatory-budget-conformance/v1`：只消费synthetic fixtures；
- 未来`approved-public-participatory-budget-read/v1`：必须绑定exact member/deployment/process/round/scope/phases/fields/purpose/retention/deletion；当前返回`no-authorized-public-participatory-budget-binding`。

## 5. Probe结论

本Channel没有Probe。create/edit/withdraw proposal、support/un-support、vote/unvote/grade、comment、follow、share/campaign、提交评估、标记selected、更新milestone/status或改动budget/admin配置，都属于政治参与、公共预算过程或官方记录副作用。真实参与只能进入另一个由本人发起、逐动作展示并确认的manual civic workflow。

