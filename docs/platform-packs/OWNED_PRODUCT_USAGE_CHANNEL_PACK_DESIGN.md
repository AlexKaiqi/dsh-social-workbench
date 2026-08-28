# Owned Product Usage Channel Pack 设计

状态：`researched` 组合设计；成员 Pack 均未发布、未调用  
核验日期：2026-08-26  
Channel Pack ref：`owned-product-usage-demand/v0-design`

## 1. 为什么这是独立信号层

CRM 记录组织内部的销售判断，Billing 记录开票、付款与订阅结果，Product Analytics 则记录团队定义并埋点后被观察到的产品行为。三者属于同一价值链，却不能压成一个“customer health”字段：赢单不等于付款，付款不等于使用，事件发生不等于获得价值，未见事件也不等于未使用或感到痛。

```text
Owned Sales Decisions ── commercial commitment
            │
            ▼
Owned Subscription Outcomes ── payment / continuation / reversal
            │
            ▼
PostHog Product Analytics ─┐
                           ├─> Owned Product Usage Channel
Amplitude Analytics ───────┘      ├─ product surface + authority roster
                                  ├─ taxonomy/instrumentation definitions
                                  ├─ identity/window/metric semantics
                                  ├─ aggregate-first projection + coverage
                                  └─ read-only research/acquire/verify skills
```

本 Channel 用于发现“承诺后哪些关键行为被采用、路径在哪一步中断、用户是否按固定行为定义返回、哪些产品面存在 adoption gap”。它不做用户级监控、自动客户健康分、员工绩效、因果归因、订阅 churn 判定或自动外联。

## 2. 成员 Pack 与共同能力

| Member | 原生 surface | 当前状态 | 关键 coverage 边界 |
| --- | --- | --- | --- |
| [PostHog Product Analytics](POSTHOG_PRODUCT_ANALYTICS_PLATFORM_PACK_DESIGN.md) | owned project；event/person/group/action/query/funnel/retention | `researched` design | event/client/server time、identity merge、action revision、query 50k/export boundary、partial period |
| [Amplitude Analytics](AMPLITUDE_PRODUCT_ANALYTICS_PLATFORM_PACK_DESIGN.md) | owned project；event/user/chart/funnel/retention/cohort/export | `researched` design | project timezone、chart definition/filter、identity、Export upload-hour/2h lag/4GB、TTL |

共同 capability proposal：

- `taxonomy.list.owned-product-events/v1`
- `analytics.query.owned-behavior-aggregate/v1`
- `analytics.read.owned-saved-analysis/v1`
- `analytics.observe.instrumentation-health/v1`
- `analytics.read.authorized-aggregate-export/v1`

raw events/persons/users/cohort members/session replay、identity/profile/property expansion、arbitrary SQL、LLM traces、MCP broad tools、chart/action/view/taxonomy/flag/experiment/survey/workflow writes均不进入共同 allowlist。

## 3. Roster、定义与事实权威

同一产品可能只用一家analytics，也可能迁移、双写或按web/mobile/backend分平台。Channel 必须固定 `ChannelRosterRevision` 和 `BehaviorDefinitionRevision`，不能按同名event/chart或相似曲线拼接。

| 字段 | 作用 |
| --- | --- |
| product/surface subject ref | 用户确认产品、environment、web/mobile/backend和功能边界；不从project/chart名称猜 |
| member pack + exact surface | PostHog region+project或Amplitude region+project；授权和timezone固定 |
| ownership/authorization evidence | 证明组织对埋点数据和分析目的有权；第三方客户数据仍需purpose/consent审查 |
| authoritative member by behavior | 每个surface/event/definition/window指定权威成员；平台没有内在优先级 |
| event/action/custom-event registry | concept、native selector、owner、description、property schema、valid window和revision |
| instrumentation revision | SDK/source/version、trigger semantics、known missing/duplicate/clock issues、release/effective window |
| identity policy | event/session/person/group/device unit、anonymous/merge/group rules和valid window |
| metric definition | criteria/filter/order/window/interval/time basis/timezone/numerator/denominator/cohort/completeness |
| instrumentation health SLO | expected volume/heartbeat/lag/error/quota、known outage与能否解释absence |
| data-handling policy | exact field allowlist、aggregation threshold、pseudonymization、retention/deletion和model/index eligibility |
| exclusions | staff/test/demo/bot/synthetic/free/internal surfaces、legacy events、migration gap和invalid releases |
| valid window | taxonomy、SDK、identity、project、timezone、definition或authority变化时追加revision |

### 3.1 Overlap 与冲突规则

- 一项行为定义在一个时间窗原则上只有一个 authoritative member。第二成员只作 comparison/corroboration，不能直接相加或平均。
- 只有相同instrumentation plan、exact event insertion/reference、identity unit、filters、window和time basis均有可审计关系时，才可声明两个平台表示同一observed event population；名称、时间、数量相似不足以dedupe。
- dual-write差异生成 instrumentation reconciliation item；不以“较大数值”或last-write-wins决定事实。
- migration前后可以用不同authority，但必须分段。跨段趋势只有通过bridge fixture和accepted comparability assessment才可连接。
- raw exact-event overlap可能需要身份化relation；默认不采集。没有安全exact key时宁可保留两个aggregate observations和unknown overlap。

## 4. `BehaviorDefinitionRevision`

行为指标不是一个名字或SQL字符串。每个可比较结果必须绑定以下不可变语义：

| 维度 | 必须固定的内容 |
| --- | --- |
| kind | event activity、funnel、retention、stickiness、lifecycle、cohort或provider-defined |
| criteria | entry/step/return/activity/exclusion event或action concept、selector、filter revision、occurrence |
| counting unit | event/session/person/group/device；group type另固定 |
| identity | anonymous、identify/merge、alias、cross-device/group规则和revision |
| order | not-applicable、sequential、strict、any-order或provider-defined |
| window/interval | conversion/return window、calendar/rolling interval、period 0和lookback |
| time basis | client/event、server-received/upload、processed time；timezone和late-data policy |
| measure | numerator、denominator、unique/count/rate、overall/previous-step、weighted/simple等 |
| cohort | first-ever/first-in-window/recurring、entry eligibility、exclusions和segment filters |
| completeness | data watermark、current-period policy、TTL、sampling/truncation/privacy threshold |
| provenance | Pack/surface、taxonomy/instrumentation/query/chart/action refs、assessedAt和evidence |

Go 静态契约用 `BehavioralDatasetMetadata` 承载这些引用；provider-specific JSON、event properties和聚合值继续留在schema-bound payload。任何一项变化都生成新definition revision，不能用相同display name覆盖历史。

## 5. `owned-product-usage-analysis` Projection

| 字段 | 来源与规则 |
| --- | --- |
| member/pack/surface | exact project/region/environment、member Pack revision和representation |
| product/surface subject | roster exact ref；不得从event/project名称推断产品 |
| definition/taxonomy/instrumentation refs | accepted immutable revisions；全部列入lineage |
| native analysis refs | platform-local action/chart/query/insight refs；不共享ID namespace |
| criteria/unit/identity/order | 依据BehaviorDefinitionRevision完整投影 |
| window/time basis/timezone | analysis window与source receive/upload watermark分开 |
| numerator/denominator/result schema | 值留payload；ratio不可当additive amount重复rollup |
| data state/completeness | final/provisional/incomplete/unknown、first incomplete period和reason |
| instrumentation health | pass/degraded/unknown、outage/lag/quota/schema drift evidence |
| coverage | tenant/surface/event roster、filters、privacy threshold、TTL、sampling/truncation和exclusions |
| evidence mapping | 仅在条件满足时映射`observed-usage`；unknown absence保留counter-evidence |

Projection 默认不包含用户级 row、ID、email/name、URL/IP/geo、property values、session/replay、free text或可联系名单。若分析确需group-level cohort，也优先输出thresholded aggregate，不向Agent暴露member IDs。

## 6. 证据映射与推断边界

| Source fact | 可形成的 evidence | 禁止自动推断 |
| --- | --- | --- |
| fixed event/action aggregate | `observed-usage` | 产品价值、满意、正确用户、成功完成任务 |
| fixed funnel conversion | `observed-usage` for observed steps | drop-off原因、痛点、投诉、用户意图 |
| fixed behavioral retention | `observed-usage` for return behavior | subscription/payment `retention-outcome`、忠诚、满意 |
| feature adoption distribution | observed usage/cohort contrast | 该feature导致留存或适合所有用户 |
| no event in complete healthy window | absence under definition | 用户未使用产品、无法完成、流失或不需要 |
| no event in degraded/partial window | coverage/counter-evidence only | 任何行为或需求结论 |
| activation model/score | derived hypothesis with definition/model evidence | source fact、causal activation、个体客户真值 |

Activation 应被建模为“候选定义 + predictive/holdout evidence +业务review”，而非稳定平台概念。即使某行为与未来return/payment相关，也可能受用户类型、实施成熟度、销售筛选或埋点变化共同影响。Signal Miner必须读取definition、instrumentation health、identity、coverage和counter-evidence，并把相关性与因果陈述分开。

## 7. Aggregate、DataHandling 与 Coverage policy

### 7.1 Aggregate与rollup

- raw result先附 `AggregateDatasetMetadata`：window/timezone/grain/measures/data state/watermark/privacy threshold；行为语义另附 `BehavioralDatasetMetadata`；
- event count可按disjoint cells求和；unique person/group通常不可跨segment/window相加；conversion/retention ratio必须从兼容numerator/denominator重算；provider-defined或weighted result不擅自rollup；
- 相同definition ref仍需window、timezone、watermark和privacy treatment兼容；不同definition ref默认不可比。

### 7.2 DataHandling

- raw analytics payload默认restricted、tenant partition、purpose-bound、短retention；
- reviewed aggregate schema allowlist优先；unknown property/column quarantine，identity/profile/replay/URL/IP/geo/free text drop/restrict；
- pseudonymous ID仍是personal data；不因hash而进入模型上下文或跨tenant join；
- source deletion、TTL、identity correction、taxonomy/action/chart revision传播到projection/evidence/index；audit只留不可逆最小receipt。

### 7.3 Coverage与instrumentation health

Channel coverage是向量：project/surface/event roster、release/instrumentation revision、identity population、query/filter/window、data watermark、partial current period、late events、rate/truncation/sampling/privacy threshold、TTL/deletion和member outages。Instrumentation health至少监测expected heartbeat/volume、SDK/ingest/query lag、invalid/quota/dropped events、duplicate/identity split、schema drift和known release gaps。

“所有query成功”只证明这些query在当时返回结果；不证明全部用户被追踪、所有事件正确、历史未被TTL删除、identity无误或市场需求存在。

## 8. Channel Skills

### `owned-product-usage-research/v1`

- purpose：`research/curate`；发现/复核成员官方概念、API/auth/rate/export/privacy/terms、tracking/metric方法、MCP/Agent Skill和固定OSS artifacts；
- 只生成Pack/roster/definition proposal；不安装skill/MCP/SDK、不建chart/view/export、不改埋点/flag/experiment。

### `owned-product-usage-acquire/v1`

- purpose：`acquire`；逐member解析已验证capability，输入固定roster/authority/definition/DataHandling/Aggregate/Behavioral/Coverage policy；
- allowed effects：`none`、本地不可变事实写入；
- 输出member-native aggregate observations + common projection + definition/coverage/reconciliation report；
- 禁止raw identity/replay/property expansion、MCP任意查询fallback、平台对象创建、用户外联或因一成员degraded借用另一成员成熟度。

### `owned-product-usage-conformance/v1`

- purpose：`verify/diagnose`；组合member reports，检查roster、authority、definition comparability、aggregate semantics、data handling、instrumentation health、coverage和degradation；
- fixture默认无网络；live仅在用户另行授权的synthetic projects中执行，Connector只读。

本 Channel 不定义 Probe Skill。未来若测试activation、onboarding或feature-value假设，应由独立产品实验系统管理truthful treatment、assignment、exposure、metric revision、sample/stop rule、consent和approval；不得让采集器自行发布flag、survey、消息或外联。

## 9. Verification Plan

### static-contract

- member refs/maturity、project/surface roster、authority、definition registry和valid windows固定；
- Pack、credential、IDs、cursor、query/chart/action和verification claims按member隔离；
- Aggregate/Behavioral/DataHandling/Coverage metadata被每个result引用；
- observed usage、activation、pain/value、billing retention和causality不混写；
- raw identity/replay/property/SQL/MCP/write/export-creation capability静态拒绝。

### fixture-conformance

| Fixture | 必须证明 |
| --- | --- |
| CRM won + payment + no usage event | 三层事实保留；tracking unhealthy时不推断non-use |
| payment active + healthy complete zero key event | 只形成定义下absence，不标无价值/churn |
| high usage + refund/cancel | usage与subscription outcome并存，不互相覆盖 |
| same event name, different filters/unit | definition refs不同，不合并趋势 |
| action/custom event revised retroactively | 新revision；旧result不被重写 |
| person vs group counting | 分母/unique语义隔离，不拿group adoption当user adoption |
| sequential vs any-order funnel | 结果不可比，order进入definition |
| rolling vs calendar retention | interval/timezone/reference固定，不标billing retention |
| current period partial | provisional/incomplete；不与完整period直接比较 |
| SDK outage / quota / late upload | instrumentation degraded，absence不产生usage结论 |
| identity split then merge | unique count correction可追溯，旧index supersede |
| PostHog+Amplitude dual-write exact relation | 可做reconciliation；authority result只计一次 |
| similar aggregate without exact relation | 不做fuzzy dedupe，输出unknown overlap |
| platform migration bridge | 按valid window分段；无accepted bridge不连接趋势 |
| ratio/unique跨segment rollup | 拒绝非法sum；按兼容分子分母重算 |
| user ID/IP/geo/property/replay appears | drop/quarantine；不可进model/index/log fixture |
| one member/MCP suspended | partial coverage；另一成员不借成熟度或broad fallback |
| Agent attempts chart/view/export/flag/survey write | policy拒绝，零external effect |

### sandbox-live / operational-canary

经用户授权后，用synthetic project/identity/events验证member read-only routes，再运行组合report。Canary监测Pack/report expiry、roster/authority/taxonomy/instrumentation/definition drift、event lag/duplicates/identity split、partial-period ratio、member reconciliation delta、rate/truncation/privacy thresholds、PII quarantine、TTL/deletion propagation、correction backlog、manual fallback success和零平台写入不变量。

## 10. 与其他 Channel 的连接

- [Owned Sales Decisions](OWNED_SALES_DECISIONS_CHANNEL_PACK_DESIGN.md) 提供purchase-decision，不证明付款或使用；
- [Owned Subscription Outcomes](OWNED_SUBSCRIPTION_OUTCOMES_CHANNEL_PACK_DESIGN.md) 提供payment/retention/value-reversal/dispute，不证明实际产品行为；
- 三者只有通过用户确认的product/offering roster、exact tenant relations和valid windows连接。Customer/user identity默认不跨Channel展开；分析优先使用thresholded product/group aggregates。

## 11. Go 抽象影响

本轮只增加平台无关静态契约：

- `SignalEvidenceType` 新增 `observed-usage`，注释限制activation/value/pain/satisfaction/causality/subscription-retention推断；
- `BehavioralAnalysisKind`、`BehavioralCountingUnit`、`BehavioralCriterionRole`、`BehavioralOccurrence`、`BehavioralSequenceOrder`、`BehavioralTimeBasis`、`BehavioralCriterion` 和 `BehavioralDatasetMetadata` 描述行为定义；
- `Observation` 与 `SourceItemCandidate` 可附Behavioral metadata；provider JSON和值继续留在版本化payload schema；
- 未增加PostHog/Amplitude SDK类型、client、credential或实现接口。

## 12. 晋级缺口

当前三文件仅为evidence-reviewed design。进入 `modeled` 需要accepted member snapshots、ChannelRoster/authority、BehaviorDefinition registry、common projection及Aggregate/Behavioral/DataHandling/Coverage schemas；进入 `verified` 需要member fixture reports、Channel conformance report，并经用户授权完成read-only synthetic sandbox。真实Connector、credential、MCP、Export、SDK、live data和任何平台副作用继续不存在。
