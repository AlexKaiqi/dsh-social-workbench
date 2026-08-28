# Local Service Intent & Truthful Fulfillment Probe Channel Pack 设计

状态：`researched` purpose-level设计；两个成员均无callable或durable route  
核验日期：2026-08-26  
成员：Taskrabbit Partner Home Services、Thumbtack Partner Platform  
目标：组合真实本地服务意图、服务商匹配与履约链，同时完整暴露成员缺失人口、用途阻断和Probe副作用，不把供给搜索、自有Lead或合作方checkout冒充全市场需求。

## 1. Channel 摘要

```text
channel ref          local-service-intent-fulfillment/v0-design
roster revision      1
member packs         taskrabbit-partner-home-services/v0-design
                     thumbtack-partner-platform/v0-design
published state      researched
callable members     0
durable members      0
probe routes         0
verified level       evidence-review + static design only
```

Channel回答三个不同问题：

1. 当前用户在何种location/service context下寻找服务；
2. 是否产生真实客户Request并匹配给一个或多个服务商；
3. 是否进入quote、booking、appointment、completion、invoice/payment或cancellation。

成员不必同时覆盖三问。Taskrabbit从partner-owned checkout开始，强于estimate→appointment→outcome；Thumbtack Marketplace可做user-directed Business search，真实Request才生成Lead，Pro surface再覆盖授权Business的Negotiation/Message/status。两者均不提供当前可用于长期全市场痛点挖掘的route。

## 2. 成员与排除矩阵

| Member | Intent / discovery population | Fulfillment population | Durable research | Probe | 当前状态 |
| --- | --- | --- | --- | --- | --- |
| Taskrabbit | 无public Task/Tasker discovery；partner service catalog、estimate、availability只服务既有brand checkout | partner创建的Project/Appointment与signed outcome webhook | AUP禁止通用mining/index和提交平台信息到AI，除非合作协议明确覆盖 | bid会锁价/占时段，book/appointment/cancel触发真人、付款/通知 | `missing-partner-contract-and-data-rights` |
| Thumbtack | user-directed category/request-form/Business search；Search Context短期；供给结果不是需求 | 真实Request→一个或多个Business Negotiation；授权Business的message/job status/review | API Terms只支持Professional的CRM/acquisition workflow，未自动覆盖cross-Business warehouse/index/AI | Request制造Lead；message是沟通；job status改变平台标签/业绩统计 | `missing-partner-contract-purpose-and-durable-rights` |

以下候选不加入本Channel roster：

| Candidate | 原因 | 正确归属 |
| --- | --- | --- |
| 猪八戒开放平台 | 核心对象是数字服务采购、比稿/计件/招标、合同/验收/支付；地点不是稳定主轴 | [Service Work Demand Channel](SERVICE_WORK_DEMAND_CHANNEL_PACK_DESIGN.md) roster revision 2 |
| Bark | 只有产品/帮助页的付费Lead证据，未发现官方developer route | 继续candidate drift watch |
| 58同城本地服务 | 合作平台存在，但缺exact endpoint/scope/schema与研究用途证据 | 继续partner evidence watch |

发现批次不决定Channel归属。成员必须由稳定事实模型、authority population和用途相似性决定。

## 3. 共同 representation

### 3.1 Intent 与 Request

`ServiceRequest*`只承载client-authored需求或其受治理表示：

- `matched-lead`：一个客户Request被交付给服务商；
- `partner-booking`：合作方已有checkout/order触发的服务请求；
- request、brief、requirement、screening question/request-form answer、attachment manifest；
- location/travel/time等受限schema只以ref进入metadata；
- query/filter/sort/Search Context和Business placement保留为placement metadata，不升级为Request；
- 一个Request匹配多个Business时，需求occurrence仍为一项。

Taskrabbit Service Catalog与Thumbtack Category/Business Profile都是供给/平台知识。Estimate、availability、popular category、starting quote、rating、hire count和activeServices也不自动成为client demand。

### 3.2 Engagement 与 outcome

`ServiceEngagement*`表达：

```text
lead delivery/access
  -> estimate / availability
  -> proposal or quote
  -> booking / contract
  -> appointment / reschedule
  -> completion / cancellation
  -> invoice / payment / refund
  -> feedback
```

这不是必然顺序。Taskrabbit bid是quote/reservation；Thumbtack Negotiation是Business-scoped lead relationship。Taskrabbit completed webhook和Thumbtack partner-authored `job_complete`状态的authorship不同，不能因reviewed kind相同而合并证据强度。

金额role独立：estimated price、starting/quoted price、client charged、lead access fee、contract amount、invoice amount、payment、refund和cancellation fee。任何“总金额”视图都必须先通过currency/unit/role与economic authority gate。

## 4. Channel capability contract

| Capability | Channel语义 | 当前 resolution |
| --- | --- | --- |
| `channel.read.local-service-taxonomy/v1` | 读取获准成员的service/category/request-form knowledge | 两成员均partner-restricted且未绑定；返回missing-member report |
| `channel.search.local-service-supply/v1` | 当前用户在exact location/context下找服务商 | 仅Thumbtack有候选；external LLM disclosure与partner access未决，blocked |
| `channel.observe.local-service-request/v1` | 读取真实Request或partner checkout request | 两成员均exact principal/purpose受限，durable path blocked |
| `channel.observe.owned-local-service-lead/v1` | 读取授权provider/Business收到的matched lead | 仅Thumbtack候选；Business-owned、unknown history、disabled |
| `channel.observe.local-service-fulfillment/v1` | 观察自有quote/booking/appointment/outcome | Taskrabbit partner Project、Thumbtack Business Negotiation分别deferred |
| `channel.materialize.local-service-pain/v1` | 构建跨成员长期痛点视图 | `blocked-no-eligible-durable-members`，zero bytes |
| `channel.probe.truthful-local-service/v1` | 规划真实找服务/预约及回执 | 仅本地preview contract；所有平台effect route为零 |

Resolver先判断purpose和member rights，再判断principal/environment/scope与技术health。不能选择“最容易返回数据”的成员；不能由Taskrabbit履约数据填Thumbtack discovery，也不能由Thumbtack search填Taskrabbit public coverage。

## 5. Authority 与 coverage

每次结果必须同时报告：

```text
member roster
eligible / missing / blocked members
population: public-market | user-directed-search | partner-checkout |
            provider-owned-lead | partner-owned-fulfillment
query/location/service/request-form definition
history/search/record/event coverage
rights/purpose expiry
```

Coverage rules：

- Taskrabbit Partner Project列表的public market coverage=`not-applicable`；
- Thumbtack Business search coverage只对short-lived Search Context有效；
- Thumbtack Negotiation list的history=`unknown`，不能写all-history或forward-only；
- webhook delivery window不等于source history；push成功也不证明pull完整；
- 无eligible member时返回完整missing report，不生成空洞的“0条需求”结论。

## 6. Evidence 与推断

- user query/request-form answer可以成为当前intent context；只有精确rights允许的client-authored Request span才能成为durable pain evidence；
- Business placement、Tasker availability、Lead数量、response metrics和review count不证明客户痛点规模；
- 一个Request产生N个Negotiation仍只贡献一个client request occurrence；
- estimate与starting quote是provider computation/supply claim，不是成交价格；
- lead fee是服务商接触机会成本，不是客户预算或项目收入；
- booking/appointment不证明completion；completion label不证明invoice paid或满意；
- invoice amount不证明payment；verified review不证明完成/支付；
- provider/partner-authored status必须保留authorship，不能写成系统独立观测事实；
- 技术可读、去身份化或生成summary都不替代storage/AI/index/derivative rights。

## 7. Dynamic materialization

当前只允许形成不含平台数据的设计proposal：

| Projection | 候选输入 | 发布门 |
| --- | --- | --- |
| `local_service_problem_language` | reviewed client Request spans | member允许长期保存、派生和lexical/semantic indexing |
| `service_location_time_pattern` | purpose-bound location/time schema | aggregation threshold、geography policy与成员rights |
| `request_to_provider_match` | Request→lead-delivery exact relation | Request dedupe、Business population与history coverage明确 |
| `quote_booking_funnel` | quote/booking/appointment exact relation | amount role、selection bias和member outcome authority明确 |
| `fulfillment_reversal_calibration` | completion/invoice/payment/cancel/refund/review | authorship、economic authority与deletion propagation完整 |
| `probe_learning` | approved intent + receipt + observed outcome | 真实用户任务；不能进入observational denominator |

当前所有projection返回`blocked-no-eligible-durable-members`；Observation、SourceItem、EvidenceSpan、warehouse row、Dolt commit、checkpoint、lexical/semantic/vector index和RAG bytes必须为零。

## 8. Truthful Probe contract

有效Probe必须具有真实customer、真实location/service need、当前寻找/预约意图、预算/付款能力、可履约时间、隐私授权、人工owner与取消/沟通方案。

效果分层：

```text
category/request-form read
  != Business search / estimate / availability compute
  != quote / bid / slot reservation
  != Project Request / matched Lead
  != message
  != booking / appointment / reschedule
  != job-status write / completion
  != cancel / refund / review
```

每一层独立preview、approval、idempotency、attempt、receipt与reconcile。禁止ghost/fake request、无意购买的lead generation、虚假身份/地址、重复/spam、为了测试而占用真人时段、未披露的外部模型处理、自动消息/评价、站外绕费或不可履约服务。

## 9. Skill composition

```text
local-service-channel-research/v1
  -> taskrabbit-pack-research/v1
  -> thumbtack-pack-research/v1

local-service-channel-resolve/v1
  -> member purpose/data-use gate
  -> exact principal/population/environment/scope
  -> eligible + missing member report

local-service-truthful-probe-plan/v1
  -> member truthful probe validator
  -> effect-separated local preview
  -> no generic execution authority
```

Channel Skill不安装SDK/MCP/Skill、不持有credential、不注册webhook、不连接sandbox/production，也不把浏览器、private API或community artifact提升为Connector。

## 10. Verification matrix

### static contract

- Service Catalog/Category、Search Context、Business placement、Request、Lead/Negotiation、Project、Appointment与outcome identity分离；
- member policy gate位于credential/network/PortBinding/persistence/AI之前；
- Request→多个lead不放大需求；partner checkout不冒充public request；
- blocked member不可fallback，也不可由另一成员的coverage填补；
- no eligible member返回missing report且zero durable bytes；
- Channel read/plan capability不暴露平台write或generic execute。

### shared fixture conformance

| Scenario | Expected |
| --- | --- |
| Taskrabbit service item + address estimate | partner checkout compute，不生成public demand |
| Taskrabbit availability → bid → booking | availability、reservation/quote、live Project逐步分离 |
| Taskrabbit completed then cancel/refund evidence | completion、cancellation、refund按exact revision/relation保留 |
| Thumbtack query → Search Context → 5 Businesses | 5个supply placements，zero client Request |
| Thumbtack one Request → 3 Negotiations | 1个demand occurrence、3个provider relationships |
| Thumbtack message before Negotiation webhook | orphan暂存/后补parent，delivery去重，不伪造顺序 |
| same local need across members | 保持member-local Request/checkout；只有evidence-backed relation，不fuzzy merge |
| estimate 100 / quote 130 / invoice 140 / paid 140 | 四个amount role，不覆盖历史或推断利润 |
| member A blocked, B blocked | eligible=0、missing=2、coverage unknown/not-applicable、zero rows |
| community MCP/browser route present | resolver仍拒绝，记录negative conformance event |
| effect timeout | state unknown + same-member/same-route reconcile，禁止跨成员重发 |

### sandbox / operational

Taskrabbit合作sandbox/auth仍有文档冲突；Thumbtack提供staging但需Account Manager credential。未来任一member sandbox pass只提升该member exact capability，不改变durable member count、public market coverage或另一成员成熟度。Production canary从最小用户指向read/compute开始；Request、message、booking、appointment、status、cancel分别升级。当前不执行。

## 11. 可观测性

- roster：member revision、eligible/missing/blocked/degraded count、reason与expiry；
- authority：partner/app/brand/Business/customer/environment/scope/purpose class；
- coverage：population、Search Context expiry、query/location/service/form revision、history/search/event window；
- semantics：request/placement/lead/project identity conflict、amount-role和status authorship conflict；
- external processing：LLM disclosure/consent与sensitive free-text block；
- events：signature/auth contract、duplicate/out-of-order/replay、orphan parent和pull reconcile；
- effects：真实intent、notification/lead charge/slot/contract/payment/downstream-stat impact、attempt/unknown/reconcile；
- rights/deletion：AUP/API Terms/partner agreement age、AI/index/storage decision、retention与删除SLA；
- conformance：HTML/cookie/private API/browser/community MCP/Skill/proxy fallback attempt与zero-write invariant。

普通telemetry只使用低基数member/capability/status标签。客户/服务商身份、地址、query/description/message、Project/Request/Negotiation ID、URL、token、金额和raw webhook只保留在purpose-bound受限审计域，或根本不持久化。

## 12. 发布与演进

1. 当前Channel只发布`researched`知识、映射与fixture设计，`callable=0`、`durable=0`、`probe=0`。
2. 成员按capability独立升级；Thumbtack supply search获准不提升Taskrabbit或durable materialization。
3. 只有至少一个member具备精确durable rights及fixture conformance，才可提出materialization candidate。
4. Terms、partner agreement、schema、auth、LLM processing、webhook或deletion drift使相关resolution立即过期。
5. 新成员先发布独立Platform Pack；稳定事实模型不属于local service时进入其他Channel，不为凑数量扩张roster。

## 13. 成员 Pack

- [Taskrabbit Partner Home Services Platform Pack](TASKRABBIT_PARTNER_HOME_SERVICES_PLATFORM_PACK_DESIGN.md)
- [Thumbtack Partner Platform Pack](THUMBTACK_PARTNER_PLATFORM_PACK_DESIGN.md)
- [本地服务 / 反向需求市场候选分流](LOCAL_SERVICE_REVERSE_MARKETPLACE_TRIAGE_2026-08-26.md)
