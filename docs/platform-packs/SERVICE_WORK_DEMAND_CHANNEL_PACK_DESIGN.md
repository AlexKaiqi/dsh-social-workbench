# Service Work Demand & Truthful Procurement Probe Channel Pack 设计

状态：`researched` purpose-level设计；三个成员均无callable durable route  
核验日期：2026-08-26  
成员：Upwork、Freelancer.com、猪八戒开放平台服务交易  
目标：以统一但不失真的`ServiceRequest*`/`ServiceEngagement*`组合client-authored服务需求与交易结果，同时允许成员因用途许可被明确报告为missing，而不是静默降级采集。

## 1. Channel 摘要

```text
channel ref          service-work-demand/v0-design
roster revision      2
member packs         upwork-service-work-demand/v0-design
                     freelancer-com-service-work-demand/v0-design
                     zbj-open-platform-service-work/v0-design
published state      researched
callable members     0
durable members      0
probe routes         0
verified level       evidence-review + static design only
```

Channel回答的是“哪里出现了真实的定制服务请求，以及后来是否进入响应、协议、交付和付款”，不是“自动帮用户抢单/选人”。共同抽象不授予成员权限，也不要求成员必须产生持久数据。一个平台可以支持即时用户任务但禁止warehouse；另一个平台可以有sandbox但仍缺书面自动访问和storage许可。

## 2. 成员采用矩阵

| Member | 官方接入 | Durable research | Ephemeral user task | Sandbox | Probe | 当前状态 |
| --- | --- | --- | --- | --- | --- | --- |
| Upwork | hosted MCP、OAuth、API | Terms v2.3禁止目标bulk/systematic/index/RAG等用途，除非精确书面许可 | 官方MCP/API候选，但MCP完整scope过宽，当前不绑定 | 无第三方sandbox/test account | 仅真实hire/pay；当前无route | `missing-policy-and-least-scope` |
| Freelancer.com | REST API 0.1、OAuth2、官方SDK | User Agreement需明确书面自动访问许可；API Terms不提供足够长期存储依据 | 仍需书面许可和data-use审查，当前不绑定 | 官方sandbox存在；未授权、未验证 | 仅真实hire/pay；当前无route | `missing-written-permission-and-storage` |
| 猪八戒 | ZOP v1、OAuth2、method-version scope、旧Java SDK | 开放协议限定特定应用/最小必要并要求退订或停用立即删除；平台运营数据保存需书面批准 | known Task与授权openid服务商已参与交易候选；无public search/list，HTTP与权限/schema gap未解决 | 只有API测试工具证据，未证明隔离sandbox | 真实投标/交稿/签约/验收；当前无route | `missing-public-route-transport-and-durable-rights` |

`callable members = 0`是可验证事实，不是Pack失败。Channel不得用网页、搜索引擎、Cookie、community MCP、SDK、scraper、顺序Task ID扫描、manual copy或另一个成员的许可填补missing coverage。

## 3. 共同稳定概念

### 3.1 Request plane

`ServiceRequestRecordMetadata`表达：

- client-authored request、brief、requirement、screening question、attachment manifest、placement与activity summary；
- fixed-price、hourly、contest、competitive tender、piecework、catalog purchase、direct-hire和provider-defined format；
- provider-native state与reviewed draft/open/paused/closed/filled/cancelled/removed lifecycle；
- visible、accepting responses和filled三个正交事实；
- category/skill/work arrangement；
- advertised budget、hourly range和contest prize等非binding金额role；
- exact revision、relation、history/search/response/attachment coverage；
- member-local opaque client attribution，禁止跨平台身份合并。

Upwork Project Catalog、Freelancer seller Service和猪八戒店铺服务属于seller供给，映射`MarketplaceOffer*`，不进入Request plane。猪八戒“所有需求类目”也只是taxonomy；known Task与openid服务商已参与人口必须分别报告。Employment job/全职招聘仍属于招聘Channel，不能只因页面使用“job/需求”一词而合并。

### 3.2 Engagement plane

`ServiceEngagementRecordMetadata`表达：

- invitation、proposal/bid、interview/message；
- offer/award、acceptance/contract；
- milestone request、milestone、time record、work submission；
- Freelancer contest entry/award/handover；
- 猪八戒投标/稿件、双方Agreement、验收请求/结果、托管/分期支付/退款；
- invoice、payment、refund、dispute和feedback；
- discovery/response/evaluation/offer/contract/delivery/payment/reversal/feedback phase；
- exact request→response→offer/award→contract→delivery→settlement relation；
- proposed、binding、funded、released、billed、paid和refunded金额role。

Upwork proposal、Freelancer bid与猪八戒招标投标可共享`proposal` reviewed kind，但保留`ProviderTypeRef`。Freelancer contest entry与猪八戒比稿/计件稿件不得伪装proposal；Upwork fixed milestone、Freelancer milestone payment与猪八戒托管/验收/支付也只共享reviewed phase和exact relation，不共享native state或资金语义。

## 4. Channel capability contract

| Capability | Channel语义 | Member resolution rule |
| --- | --- | --- |
| `channel.discover.service-requests/v1` | 在获准成员中发现client-authored request | 每成员独立policy、route、coverage；当前返回两个missing-member |
| `channel.read.service-request/v1` | 读取用户选择的request及最小获准内容 | exact member/object；无route时拒绝，不fallback网页 |
| `channel.observe.service-engagement/v1` | 观察自有且获准的响应/结果链 | 只允许明确owned/authorized population；默认无成员 |
| `channel.materialize.service-demand/v1` | 构建可追溯request/opportunity projection | 仅rights允许持久化/聚合/index的成员；当前planning blocked、zero bytes |
| `channel.probe.truthful-service-request/v1` | 预览真实采购请求并规划回执 | 必须真实hire/pay；逐成员、逐effect批准；当前只生成本地proposal |

Channel Resolver不能选择“最能返回数据”的成员。它先评估研究目的与成员许可，再按coverage/reliability/cost排序。被blocked成员保留`reason/evidence/expiry`，Channel结果显示member roster、eligible/missing counts和coverage boundary。

## 5. Evidence 与推断规则

- request title/description/deliverable/requirement可以形成问题、workaround、urgency等候选span，但必须保存subject/counterparty/provider/derived attribution；
- 一个request最多证明一个client-authored request occurrence；repost/duplicate/translated listing需exact relation或保持duplicate candidate；
- proposal/bid/entry数量是供方响应context，不是independent recurrence；
- open/visible、recently viewed、interviewing、bid count或provider ranking不证明仍在hire或最终选择；
- advertised budget/contest prize不等于愿付；offer/award不等于accepted contract；contract不等于delivery/payment；
- funded、release requested、released、invoice、paid、refund/dispute分别解释；
- feedback与人才profile不得进入跨平台identity、ranking、training、RAG或自动selection；
- member内容只有在精确rights允许时才能生成Observation和EvidenceSpan，技术返回值本身不是证据许可。

## 6. Dynamic materialization

Channel只定义目的级候选视图，不承诺构建：

| Projection | 输入 | 发布条件 |
| --- | --- | --- |
| `service_problem_language` | reviewed request spans | 所有成员允许保存、派生与lexical/semantic indexing |
| `service_budget_context` | schema-bound advertised term | currency/unit/role明确；不得与contract/payment混算 |
| `request_response_funnel` | exact request/response/award/contract relation | owned/authorized results且counting/coverage兼容 |
| `service_outcome_calibration` | delivery/payment/reversal/feedback | identity最小化、经济authority和用途许可明确 |
| `probe_learning` | approved plan + receipt + outcome | production truthful Probe，不能混入observational denominator |

`MaterializationPolicy`逐成员计算`allowStore/allowAggregate/allowLexical/allowSemantic/allowVector/allowAI/useExpiry`。任一用途被禁止就排除该成员；不能用去身份化、hash、summary或embedding声称没有保存Data。当前所有跨成员projection返回`blocked-no-eligible-members`，构建、checkpoint、index和warehouse bytes必须为零。

## 7. Truthful Probe contract

有效服务采购Probe必须固定：

- 真实problem、custom deliverable与目标受众；
- Buyer/Client主体、权利、预算或contest prize、hire/pay intent；
- deadline、acceptance、IP/confidentiality、履约与沟通owner；
- success metric、成本/通知/响应guardrail；
- platform-specific preview、approval、receipt、unknown reconcile与关闭/履约计划。

下列效果永不由generic Channel capability代发：

```text
draft != publish/update/close
invite != proposal/bid != message
offer/award != accept/contract
milestone request != create/fund != release/cancel
contest entry != award != handover
payment != refund/dispute != feedback
```

ghost job、free sample work、spam/duplicate、虚假身份、不可履约scope、违法/侵权/歧视、站外导流、自动投标/私信、Agent自主人才ranking/selection和虚假feedback全部拒绝。sandbox synthetic write只证明协议，不证明production Probe或需求。

## 8. Platform Skill composition

Channel Skill只编排已发布成员Skill contract：

```text
service-work-channel-research/v1
  -> upwork-pack-research/v1
  -> freelancer-com-pack-research/v1
  -> zbj-pack-research/v1

service-work-channel-resolve/v1
  -> member policy-before-binding
  -> independent route/coverage decision
  -> missing-member report

service-work-truthful-probe-plan/v1
  -> member truthful probe validator
  -> local preview/manual handoff proposal
  -> no generic execution authority
```

Skill不得安装SDK/MCP、读取credential、访问账号、调用sandbox/production或把community artifact提升为Connector。成员Pack drift/expiry会自动使Channel resolution过期，而不是继续使用旧能力。

## 9. Verification matrix

### evidence review

- 三个成员分别固定official docs/Terms/API/MCP/SDK/support evidence与observedAt；
- 每个member decision保留purpose、storage/index/AI、retention/deletion与written-permission requirement；
- Channel只引用已发布member revision，不复制成员原生schema为第二事实源。

### static contract

- employment job、service request、seller offer、proposal/bid、contest entry、offer/award、contract、delivery和payment identity分离；
- member policy gate位于credential/network/PortBinding/storage/index之前；
- blocked member不可fallback、不可被另一个成员的route/coverage替代；
- ephemeral route不能写Observation/SourceItem/EvidenceSpan/checkpoint/index；
- no eligible member时返回完整missing report且零持久字节；
- read/channel Skill无任何platform write或binding/financial port。

### shared fixture conformance

| Scenario | Expected |
| --- | --- |
| 相同title的Upwork job与Freelancer Project | 保持两个member-local request；只形成duplicate candidate |
| Upwork proposal与Freelancer bid | 可映射response/proposal phase；native type与coverage独立 |
| Freelancer Contest Entry | 不映射Upwork proposal；使用contest exact relations |
| 猪八戒需求类目与known Task | taxonomy不生成Request；只有合法taskId来源与授权时才形成member-local Request |
| 同一猪八戒Task出现在seller/计件/众包list | 一个request加多个representation/engagement relation，不重复计需求 |
| 猪八戒amount/hostedAmount/installments | advertised/contract候选、escrowed与payment amount role分离 |
| 猪八戒验收申请 | acceptance-request effect，不生成acceptance、completion或payment |
| 预算500、bid400、contract450、released450 | 四个amount role；不覆盖历史 |
| 30 proposals/bids | 一个request + response context，不生成30个需求 |
| open但不再hire | lifecycle与current intent保持unknown |
| member A允许ephemeral、B blocked | 屏幕任务只含A；durable projection仍无成员 |
| member permission expires mid-plan | binding失效；不切换member或fallback |
| timeout after publish/award/payment attempt | unknown + same-route reconcile；不重发 |
| community MCP/SDK/scraper available | 仍因member policy/route conformance拒绝 |

### sandbox live / operational canary

Upwork当前无第三方sandbox；Freelancer.com有sandbox但未授权；猪八戒只有API测试工具证据，未证明独立sandbox/TLS/synthetic population。未来sandbox只提升exact member capability，Channel maturity仍为mixed且durable member count不变。任何production canary都需member-specific书面许可、真实hire/pay目的、逐effect批准与真人履约owner；当前不执行。

## 10. 可观测性

- roster：member Pack revision、eligible/missing/blocked/degraded counts与reason；
- policy：Terms/evidence age、written permission、purpose/storage/index/AI/retention/deletion decision；
- resolution：member candidate、principal/environment、scope、no-fallback、expiry和re-resolve；
- coverage：query/filter/order/population、partial/unknown、response omission与duplicate candidate；
- semantics：request/offer、proposal/entry、award/accept、milestone request/payment和amount-role conflict；
- materialization：eligible member count、blocked proposal、source watermark、bytes/index/vector rows与deletion propagation；
- probe：truthful/hire/pay/fulfillable checks、effect-specific approval、attempt/unknown/reconcile、notifications/fees/funds与guardrail；
- conformance：HTML/cookie/MCP/SDK/scraper/manual fallback、autonomous ranking/selection、write and cross-member credential attempts。

所有通用metrics使用低基数member/capability/status标签；账号、request、bid、message、URL、正文、token和金额仅保留opaque受控审计ref。

## 11. 发布与演进规则

1. 当前revision可发布为`researched`知识/fixture设计，不能声明任何平台已接入。
2. 成员取得许可时只升级该member capability；Channel重新resolve，不整体升级。
3. 新成员必须先发布独立Platform Pack，证明概念映射、permission、coverage和negative-write conformance。
4. 任何成员Terms、API/schema、SDK、MCP、许可或storage规则漂移都会使相关resolution/materialization失效。
5. 只有至少一个成员具备明确durable rights和fixture conformance后，Channel才可进入`fixture-verified-durable-candidate`；sandbox成功不足以满足。

## 12. 成员 Pack

- [Upwork Service Work Platform Pack](UPWORK_SERVICE_WORK_PLATFORM_PACK_DESIGN.md)
- [Freelancer.com Service Work Platform Pack](FREELANCER_COM_SERVICE_WORK_PLATFORM_PACK_DESIGN.md)
- [猪八戒开放平台服务交易 Platform Pack](ZBJ_OPEN_PLATFORM_SERVICE_WORK_PACK_DESIGN.md)
- [服务采购 / 自由职业市场候选分流](SERVICE_WORK_MARKETPLACE_TRIAGE_2026-08-26.md)
