# 新平台发现与 Platform Pack 长期架构

状态：长期目标设计，不代表当前运行时能力
核验日期：2026-08-26
范围：持续发现、研究、建模、验证和维护新平台；只定义架构与抽象，不实现自动安装、采集或真实平台调用。

## 1. 长期目标

长期目标不是维护一个不断变长的“支持平台”列表，而是建立一条可持续的平台能力生产线：

> 从真实需求和生态变化中发现候选平台，以官方证据和固定版本的开源项目理解其概念、能力与接入方法，通过可重复测试验证后发布 Platform Pack，并在平台变化时自动降级或重新验证。

成功不以平台数量衡量，而以以下结果衡量：

- 能否持续找到提供新需求信号、支付/预算证据或 Probe 渠道的平台；
- 一个候选从发现到形成可审阅知识 snapshot 的 lead time；
- 每项 capability 有官方证据、fixture 和 live verification 的覆盖率；
- 已发布能力的过期率、漂移发现时间和恢复时间；
- 单位维护成本带来的独特信号覆盖，而不是重复接入十个相似社媒；
- 上游失效时是否能降级为另一 adapter 或 manual path，而不丢历史事实。

## 2. 终态：Platform Pack 是发布单位

每个平台以版本化 `PlatformPackManifest` 发布：

```text
Platform Pack: douyin/vN
├── PlatformKnowledgeSnapshot
│   ├── concepts         video / creator / comment / metric / ...
│   ├── capabilities     search / read / analytics / publish / ...
│   └── access methods   official API / export / browser / manual
├── Platform Skills
│   ├── research         如何更新官方知识与证据
│   ├── acquire          如何请求已治理的采集能力
│   ├── probe            如何预览、批准、执行与对账
│   ├── verify           如何运行 fixture/sandbox/live 场景
│   └── diagnose         如何解释授权、健康与漂移
├── Research Artifacts
│   ├── official docs / terms / SDK / changelog
│   └── pinned open-source connectors / MCP / pieces / actors
├── Adapter refs
├── capability adoption decisions（eligible/manual/partner/defer/reject）
├── capability-scoped support declarations
└── verification reports + expiry
```

Pack 是目录和发布边界，不复制 adapter 代码、credential 或观测事实。即使 Pack 标为 `operational`，某项 capability 仍可以是 `experimental`、`blocked` 或 `suspended`；不能用 Pack 总状态覆盖细粒度事实。

### 2.1 Channel Pack 只做跨平台组合

当一个需求场域需要多个平台时，不能把它们压成一个假平台。例如 Greenhouse 和 Lever 都提供公开职位，但仍拥有独立 concept、namespace、API、条款与验证。`ChannelPackManifest` 引用固定版本的成员 Platform Pack，并拥有共同 projection、roster/scope、coverage、dedupe、rights policy 和 Channel Skills；它不复制成员知识，不持有 credential，也不能让成员借用彼此的 support/verification。`ChannelVerificationReport` 必须显式引用成员 VerificationReport，并只证明组合层场景。`ChannelRosterRevision` 适合枚举 board/site；采购、搜索等 query-driven channel 使用一等 `ChannelScopeRevision` 固定 surface、dialect、query template、window 和 exclusions，不能把可复用模板误称为全市场目录。

Channel 统一的是研究目的与派生视图，不是来源对象。成员可以分别发布 `PublicDiscussion*`、`ProductLaunch*` 等异构 representation；Channel projection 必须保留成员类型、原生 identity、evidence attribution 和 coverage，不能为了统一查询把它们压成字段最小公倍数。跨 representation 只形成带 evidence 的 relation candidate，不建立模糊 canonical merge。

一方客服等高敏 channel 还必须发布 field-level data-handling profile，并把 `required` 与 `applied` 分开；rights policy 不能替代 personal/internal/secret 字段的 restrict/drop/quarantine 证明。成员发出的 deletion、redaction 和 privacy change 必须穿透 canonical、evidence 与 index，Channel Pack 不得为“统一分析”保留已删除原文。

一方客服和销售还暴露另一种跨平台风险：同一段文本可能由需求主体直接表达、由客服/销售转述、由平台计算或由模型推断。高价值 Channel Pack 必须发布 evidence-attribution policy；未知或 counterparty-authored 证据不能被 Agent 改写为 customer quote。该政策只描述作者关系，不保存个人身份，也不能代替 Rights/DataHandling。

订阅、支付和退款场域还可能由 billing system、payment processor 和 CRM 同时描述同一业务过程。此类 Channel Pack 必须按 subscription/invoice/payment/refund-credit/dispute 等 fact class 发布 authority map，并只依据平台 exact reference、用户确认映射或迁移账册建立跨成员 economic-event relation；金额、时间或客户相似不能触发模糊去重。非权威成员保留为 corroborating lineage，冲突进入 review/coverage degradation，不能 last-write-wins。

产品分析场域的“事实”又多一层人为定义：event是否埋点、Action/custom event如何组合、person/group如何识别、funnel顺序、retention窗口、timezone、分子分母和当前周期处理都会改变结果。此类Channel Pack必须按product surface/behavior definition发布authority map，并固定taxonomy、instrumentation、identity和analysis definition revision。双写平台只有exact event/instrumentation relation和完全兼容语义时才可reconcile；名称、数量或曲线相似不能模糊dedupe。“无事件”在instrumentation health未证明前也不能升级为non-use。

产品实验 Channel 还会主动改变被授权产品 surface，不能沿用只读成员的 failover 或“平台动词”抽象。一个 phase 只有一个 serving/assignment authority；另一 analytics member只能提供有确切 exposure/metric relation的观测。Pack必须把 draft、publish、start assignment、stop assignment、stop analysis、serve treatment 与 rollback 分成具有精确 effect 的 capability，并固定 eligibility、allocation、assignment、exposure、metric/analysis definition和integrity checks。成员 UI 中相同的“stop”若会 rollout winner 或改变 flag targeting，就是不同高影响能力，必须重新 preview/approve/reconcile。

问卷 Channel 的主要风险不是字段映射，而是 measurement definition 与 selection bias。成员 Pack必须固定question wording/options/scale/logic/locale、sample frame/recruitment/incentive、targeting/display/recontact、consent/respondent mode和response lifecycle；同名问题或ID不足以建立跨成员可比关系。publish、invite/reminder、response write、close和delete是不同effect；push webhook与pull API必须组合reconcile，且withdrawal/deletion要穿透原文、evidence和index。

授权客户会话 Channel 的主要风险是把一次会话的多个平台 representation、ASR speaker label 和 AI 洞察错误地压成“用户原话”。成员 Pack 必须固定 occurrence、artifact/transcript revision、speaker attribution、participant business role、consent/purpose、completeness/redaction/private/retention/delete 与 original-vs-derived authorship。Zoom、Gong、Teams之间只建立 evidence-backed relation，不合并 native IDs 或 transcript；标题、时间、参会者相似不能 fuzzy dedupe。成员各自的v1/beta、RSC/tenant policy、raw media、bot join/record、MCP insight 与 deterministic transcript read 都是不同 capability，不能共享授权或成熟度。

授权客户邮件 Channel 的主要风险是把provider thread、mailbox copy与quoted history压成一个“客户说过多少次”。成员 Pack必须固定mailbox/folder-or-label roster、message revision、provider thread/conversation、transformed RFC relation、MIME/body representation、authored/quoted/forward/signature/automated role、participant/header role、metadata-vs-body权限、sync reset、retention/delete/hold。Gmail threadId与Graph conversationId不跨成员等价；同主题/地址/时间/body相似不能fuzzy dedupe。metadata read、body read、attachment bytes、watch/subscription配置、MCP search和send/modify/delete是不同capability，不能共享credential或成熟度。

授权客户社区 Channel 的主要风险是把“平台能读”误写成“组织与平台允许长期挖掘/索引”，以及把长期多方stream塞进meeting或email抽象。成员 Pack必须固定platform-use、organization approval和technical grant三重authority，deployment class、workspace/guild与channel roster、public/private/shared/direct/thread visibility、scope/intent/effective permissions、message revision、available-vs-omitted content、member/bot/app/webhook/system与forward/embed role、exact reply/thread/forward/crosspost relation、reaction definition、event gap、retention/delete。community只标记来源；complaint/workaround等需求语义仍需span review。Slack internal app、external/Marketplace app与Hosted MCP不能共享storage/rate成熟度；Discord在mining/scraping用途许可未解除前必须保持policy-blocked。post/reply/reaction/join/invite/unarchive/moderation始终是独立Probe/write capability。

交易市场 Channel 的主要风险是把seller供给主张、平台曝光和真实购买结果压成一个“需求/价格”事实。成员 Pack必须固定product/inventory/offer/listing identity链、listing format、price role、native与reviewed state、query placement和coverage；结果侧分别固定exposure、consideration、negotiation、commitment、payment、fulfillment、reversal、feedback及其exact listing/order-line relation。public discovery、owned seller、sandbox和Probe receipt是不同authority population；asking price/current bid/negotiated amount/checkout total不能互换，listing消失也不能推断sold。Channel只有在成员精确data-use与rights允许时才可物化跨平台价格、市场、seller performance或conversion视图。真实Probe必须是合法、自有、可履约offer，publish/update/withdraw/message/marketing/order/refund/fulfillment/feedback各自审批。

服务采购/自由职业 Channel 的主要风险是把client-authored request、服务方response、binding agreement和经济结果压成同一个“有预算需求”。成员 Pack必须固定request/brief/requirement/placement与invitation/proposal/interview/offer/contract/milestone/time/invoice/payment/reversal/feedback的identity、revision、state和exact relation；advertised、proposed、binding、funded、released、billed、paid金额角色不可互换。技术上可调用的即时user-directed route与允许长期Observation/warehouse/index的research route是不同产品：前者可以零持久对象完成任务，后者只有成员用途许可明确允许时才能加入Channel materialization。真实Probe必须确实准备hire/pay，ghost/free job禁止；publish、invite、proposal、message、offer、contract、milestone和资金动作逐项治理。

本地服务/反向需求场域进一步要求每个 Pack 声明自己的 authority population：public marketplace、user-directed supply search、provider-owned leads、partner-owned checkout、partner-owned fulfillment与marketplace-wide research不得互换。共同抽象保留service item/location、短期Search Context与supply placement、matched lead或partner booking、estimate、availability、quote、booking、appointment、reschedule、completion、invoice/payment、cancellation和financial outcome，但Channel只组合成员允许的representation。一个client Request生成多个provider-scoped Lead时仍是一项需求，不能按Business数量放大。Lead purchase、Request submission、quote reservation、message、job-status和booking即使不是最终付款，也可能扣费、揭示联系人、调用外部模型、改变平台统计、占用真人时段或触发通知；每个effect独立治理。一个只提供合作方自有Project/Business Lead的官方API必须报告`public coverage = not-applicable`或exact search context，不能因技术完整而被Opportunity Miner当成全市场来源。

公开软件工单 Channel 的主要风险是把不同host、项目和工单模型压成一个泛化“issue”，或把公开可见误当成允许系统化采集。成员 Pack必须固定host/deployment/version、project/repository roster、item type、native state/reason、label/milestone/iteration/relation taxonomy、item/comment/reply/system/resource-event role、ID/IID、pagination/search/permission/deletion coverage。跨平台层只统一 `SoftwareWorkItem*` representation，complaint/workaround等需求语义仍由reviewed span产生；closed、duplicate、answered、reaction和comment count不能自动推断解决、复现或规模。GitLab.com在API Terms policy gate未通过时保持bulk/systematic collection blocked；Self-Managed/Dedicated也必须逐实例固定版本、协议和组织授权。create/comment/reaction/label/close/move/link/webhook等写能力不属于只读Channel Pack。

公开产品支持论坛 Channel 的主要风险是把Discourse、NodeBB或Flarum软件品牌误当成统一authority，或把一个站点的插件能力、权限和Terms外推到所有deployment。成员 Pack必须逐站点固定owner/host/software/version/hosting、plugin/extension roster、capability core/extension/site origin与scope、guest GET allowlist、thread/post/relation/state、canonical/search/included/federated representation与origin、pagination/history coverage、Terms/robots/rate/retention。accepted/solved只表达exact native state，不证明修复或满意；federated/search copies不增加独立authority。软件template通过fixture不等于具体站点可读，Channel只组合用户批准deployment roster；HTML/browser/search-engine/MCP/auth fallback及PM/chat/admin/upload/federation/write均拒绝。

```text
Platform Pack A ─┐
                 ├─> Channel Pack ─> versioned roster + derived projection
Platform Pack B ─┘
```

成员 Platform Pack 是平台支持发布单位；Channel Pack 是研究策略发布单位。新增成员必须先形成独立 Platform Pack，再发布新的 Channel Pack revision。

## 3. 平台发现工厂

```text
Observed demand / 用户提名 / 生态目录 / 官方平台变化
                         │
                         ▼
                 Discovery Campaign
                         │ bounded search
                         ▼
                Platform Candidate
                         │ value/risk/access triage
                         ▼
                  Research Dossier
          official evidence + skills + OSS artifacts
                         │
                         ▼ Agent 提案
              Platform Knowledge Proposal
                         │ review + CAS commit
                         ▼
             Platform Knowledge Snapshot
                         │ adapter mapping + test plan
                         ▼
      evidence → contract → fixture → sandbox → canary
                         │
                         ▼
                  Platform Pack release
                         │
                         └── drift → reverify/degrade/suspend/retire
```

### 3.1 Discover

`DiscoveryCampaign` 必须有业务垂直、信号类型、来源白名单、时间窗、候选数和成本上限。Scout 可以发现候选，不能自动安装外部 skill、MCP server、包或 adapter。

发现来源包括：

- 当前 Observation 中反复出现的平台、替代方案或分享链接；
- 用户提名和业务垂直的 channel gap；
- 官方开发者门户、App/Integration Marketplace、changelog 和 status page；
- GitHub repository/code/topic 搜索；
- connector、workflow、MCP、skill、package、crawler 和 feed-route 目录。

GitHub Search API 可搜索 repository/code 等项目，但有结果、范围、超时和 rate-limit 限制，因此只能作为候选发现器，不能当完整生态清单：[GitHub Search API](https://docs.github.com/en/rest/search/search)。

### 3.2 Triage

候选按带证据的多维 assessment 排序，不只保存一个神秘总分：

| 维度 | 关键问题 |
| --- | --- |
| pain specificity | 是否能看到问题、情境、失败原因和替代方案？ |
| action proximity | 是讨论，还是搜索、询价、预算、申请、下单？ |
| audience clarity | 能否合法地区分受众，而不建立个人画像？ |
| longitudinal signal | 是否有稳定 ID、时间和增量观察能力？ |
| probe fitness | 能否诚实、可归因地发布最小测试？ |
| official access | 是否存在可证实的 API/feed/export/share/manual path？ |
| ecosystem leverage | 是否已有可审计 SDK、connector、skill 或测试资产？ |
| maintenance burden | API/DOM/价格/审核变化带来的长期成本？ |
| legal/account risk | 条款、PII、账号处罚和跨境风险是否可接受？ |

优先补“信号类型缺口”。例如系统已有多个内容社媒后，公开 ATS、采购/RFP、交易市场或一方支持数据通常比再接一个同质内容平台更有增量价值。

### 3.3 Research and Model

Researcher 产出 `ResearchDossier`：

- 平台身份、账号类型、地区和产品面；
- 概念、字段、生命周期和关系候选；
- capability、access method、scope、限流、价格、审核和条款证据；
- skill/MCP/connector/SDK/开源项目候选；
- 未证实和已拒绝的 claim；
- capability/access-method 的 adoption decision、理由、证据和复核触发器；
- `KnowledgeProposal` 及下一步验证建议。

Agent 可以提取、对齐和生成 proposal，不能把 README 声称、一次请求成功或页面可操作直接提交为 verified capability。

## 4. 外部生态是发现源，不是信任根

首批应持续扫描的生态：

| 生态 | 可发现什么 | 主要复用价值 | 必须再验证什么 |
| --- | --- | --- | --- |
| Official developer portals | API、scope、SDK、审核、配额、changelog | capability 与 access-method 最高权威证据 | 账号是否获权、live 行为、错误和删除语义 |
| [Airbyte Connector Development](https://docs.airbyte.com/platform/connector-development) | replication/agent connectors、schema/state/testing pattern | ingress、cursor、schema discovery、低代码 REST mapping | 具体 connector 许可证、实际 stream、删除/撤权和本项目边界 |
| [Activepieces Pieces](https://www.activepieces.com/docs/build-pieces/building-pieces/overview) | TypeScript auth/trigger/action pieces | 长尾 SaaS action、认证和字段样本 | action 是否有 preview、批准、幂等和 reconcile；其测试在官方文档中也是可选项：[Testing Pieces](https://www.activepieces.com/docs/build-pieces/misc/testing-pieces) |
| n8n nodes / community nodes | credential、trigger/action、用户自动化 | action schema 与社区实现样本 | 许可证、嵌入边界、社区节点来源和测试 |
| [MCP Registry](https://github.com/modelcontextprotocol/registry) | 可发现的 MCP server metadata | tool surface、schema 和服务器候选 | 底层究竟是官方 API、浏览器还是私有接口；MCP 本身不证明能力安全 |
| RSSHub routes | 页面到 feed 的社区 route | 公开内容 route、字段和失败样本 | route 许可、DOM 稳定性、删除和访问依据 |
| [Apify Actors](https://docs.apify.com/actors/development/quick-start/locally) | 带 input/output/dataset schema 的 crawler/agent | 快速 fixture、隔离执行和字段研究 | Store artifact 可能由社区维护且源码默认可隐藏，必须检查 ownership、source、价格和可靠性：[Actor ownership](https://docs.apify.com/actors/running/store/actor-developers) |
| GitHub/package registries | SDK、crawler、CLI、skill、MCP、connector | 固定 commit 的代码、测试和失败模式 | license、维护、安全、secret 处理、官方性和平台条款 |

开源项目审计至少固定：repository、commit/tag、digest、license、publisher、维护证据、source availability、测试、安全证据、接入模式、声称 capability 和实际验证 capability。可用 [OpenSSF Scorecard](https://scorecard.dev/) 作为供应链风险输入，但分数不替代人工的许可证、权限和平台条款判断。

## 5. Platform Skill 的边界

这里的 skill 是 `PlatformSkillDefinition`：面向 Agent 的版本化程序知识。它可以告诉 Agent：

- 调研某平台时优先读取哪些官方来源、如何生成 evidence-bound proposal；
- 采集时应请求哪个 capability、允许哪些 mode 和 typed port；
- Probe 需要哪些 preview/approval/reconcile 步骤；
- 如何运行 fixture、sandbox 或 live verification；
- 授权过期、schema drift 或 adapter blocked 时如何解释和降级。

skill 不包含：

- credential、Cookie、token 或账号身份；
- 平台 API/DOM 的执行实现；
- 未进入 knowledge snapshot 的事实 claim；
- 绕过验证码、风控、条款或批准门的步骤；
- “如果失败就换路线重发”这类破坏对账的指令。

外部 skill 先作为 `ResearchArtifact(kind=external-skill)` 进入审计；只有重新绑定 knowledge snapshot、capability、allowed effects、input/output schema 和 verification scenarios 后，才能发布为内部 Platform Skill。安装和启用始终是独立动作，不由 Scout 自动完成。

## 6. 概念与能力提取

每个新平台至少回答五组问题：

1. **Concepts**：平台有哪些稳定对象、事件、指标、枚举和关系？
2. **Capabilities**：系统能对哪些对象执行 search/read/receive/create/reconcile？
3. **Access methods**：每项能力通过哪个官方 API、feed、export、share、browser 或 manual surface？
4. **Adoption**：目标用途下是 eligible、manual-only、partner-only、deferred 还是 rejected，为什么，何时复核？
5. **Runtime truth**：当前 adapter、账号、scope、地区和健康是否让它实际可用？

概念优先保留平台原生语义，再映射通用需求对象。例如 `job-posting`、`listing`、`rfp-notice` 和 `video` 不应都过早压成 `content-item`；跨平台分析通过 mapping/projection 完成，原始概念仍可追溯。

能力 ID 保持平台无关，但 `PlatformCapabilityDefinition` 明确 subject/result concept、access method 和证据。新增平台应尽量复用已有 capability；只有输入、输出或副作用确有不兼容语义时才发布新版本。

缺少 route 只能说明“当前没有支持”，不能区分尚未研究、技术未就绪、只允许人工、仅合作伙伴可用或经审查明确拒绝。`CapabilityAdoptionDecision` 因此作为 Pack 的一等、可过期记录；它保存 capability、可选 access method、目标 purpose、disposition、证据、理由和 reconsider trigger。`rejected` 是当前 Pack 的采用决策，不是假装做普遍法律结论，也不能被 Agent 因发现新开源项目而自动改写。

## 7. 验证阶梯

平台支持必须逐 capability/access-method/adapter 验证：

| Level | 证明什么 | 典型检查 | 不能证明什么 |
| --- | --- | --- | --- |
| evidence-review | 平台产品面和条款有可信来源 | 官方 docs/SDK/terms、日期、scope、账号类型 | 本机账号可调用 |
| static-contract | knowledge、skill、mapping 和 schema 自洽 | ref 完整性、schema、effects、secret/PII policy | adapter 真执行 |
| fixture-conformance | adapter 对稳定样本满足契约 | pagination、cursor、dedupe、tombstone、mapping、429/5xx；或 preview/idempotency/unknown/reconcile | 平台当前未变化 |
| sandbox-live | 当前版本和授权账号能完成受控调用 | success、denial、revoke、rate limit、真实 receipt/read-back | 长期 SLO |
| operational-canary | 能持续维护生产声明 | canary、lag/error/SLO、schema drift、成本与降级 | 所有账号/地区都可用 |

关键负向测试：

- scope 不足和 token 撤销必须拒绝；
- 同一 cursor/batch 重放不得产生重复事实；
- schema 未知字段不能污染核心对象；
- platform-write 未批准不能执行；
- execute 超时/unknown 只能 reconcile，不能换 adapter 重发；
- tombstone、权利删除和 retention 必须传播到事实与 projection；
- skill 不得请求其 allowed capability/effect 之外的端口；
- fixture 和日志不得包含真实 secret 或个人身份数据。

`VerificationReport` 必须固定 knowledge snapshot、adapter/skill version、平台 API version、account type、region、config hash、场景和证据，并有 expiresAt。一次 live 成功不会永久升级为 production。

`Page.Complete` 只代表 cursor 已耗尽；平台抽样、权限、排序或 search truncation 必须另写 `CoverageAssessment`，不能把“翻完页”解释为“全量市场”。`CoverageAssessment.Boundary` 还必须保存 population、native scope refs、included/excluded criteria；例如“某 Greenhouse board 当次公开 posts 完整”不能被扩大成“招聘市场完整”。

版本密集平台还必须区分两类谱系：平台声明的 native editorial version/change relation，与采集器根据 payload hash 观察到的 snapshot revision。来源只公开 latest 时，后者不能被描述成完整平台历史。远程附件/格式链接先进入 `SourceArtifactDescriptor`；只有单独获批并完成 retrieval、rights 与安全检查后，内容 bytes 才成为 Evidence Store blob。链接存在、下载成功、可解析和可再利用是四个不同事实。

同一个事实还可能通过 provider-native、provider-projection、presentation 或 manual-extract 表示。`SourceRepresentationMetadata` 固定 schema/standard/version/extensions、mapping ref 和 known losses；官方把原生公告映射成 OCDS 仍是 provider projection，公开 HTML 仍是 presentation。统一标准有助查询，但不能擦除平台原生身份或信息损失。

平台 analytics 往往返回预聚合 cells，而不是原始事件。此时 payload schema 只证明字段形状，不能阻止分析层平均 CTR、再次平均 average position 或把 `final` 当 `complete`。`AggregateDatasetMetadata` 因此固定 window/timezone、有序 grain、measure aggregation（sum-if-disjoint/ratio/weighted mean/non-additive/provider-defined）、data state/watermark 和 provider privacy treatment；具体 row values 仍留在 schema-bound payload。CoverageAssessment 继续单独表达 top-row、row cap、privacy omission、export gap 和 market boundary。

产品行为cells还需要schema-bound `BehavioralDatasetMetadata`：analysis kind、immutable definition/taxonomy/instrumentation refs、entry/step/return/activity/exclusion criteria、counting unit、identity policy、sequence、window/interval、time basis/timezone、numerator/denominator、cohort和completeness rule。它不保存result value，也不把provider chart对象提升为core ontology。Aggregate metadata回答“cell能否rollup”，Behavioral metadata回答“cell按什么行为定义产生”；任一行为语义变化都创建新revision。fixture必须覆盖identity split/merge、definition retroactivity、funnel order、retention reference、late data、partial period、tracking outage和TTL。

平台涉及金额时还必须发布 schema-bound `MonetaryDatasetMetadata`：每个 selector 的 amount role、currency selector/fixed currency、unit encoding、sign convention、rounding 和 conversion ref。它不保存 row value；空 conversion ref 就是不允许跨币合并。fixture 必须覆盖零位币、多小数表示、cash refund 与 credit、gross/due/paid/outstanding，以及双系统同一经济事件，防止 SDK 的整数类型或字段名被误当成稳定金融语义。

Aggregate privacy 不是缺失值修复任务。Search Console 的 anonymized query、广告/分析平台的阈值或 support analytics 的小样本抑制都必须原样保存，并明确 suppressed cells 是否有条件包含在 totals。系统禁止通过多次不同维度/过滤器查询重建受保护值。

可变的一方反馈进一步验证了这两个抽象必须同时存在：App Store/Google Play 的当前 review 会被用户更新，API、月度 CSV、自动翻译和 provider summary 又是不同 representation。系统保存每次 observed snapshot，而不是覆盖事实；同时把 provider history window、written-only/rating-only、production/test track 和 export delay 写进 CoverageAssessment。连接器成功翻完页面只证明某个明确 population 完成。

`owned` 也不是“低风险”的同义词。读取自有评论和公开回复是不同 capability：回复会通知真实用户、改变公开页面，并可能影响后续反馈。需求研究 Pack 应保持 read-only；客服回复若被批准，必须进入独立产品工作流，不能因为底层 API 同时提供 GET/POST 就复用采集 route，也不能把回复冒充 Probe。

## 8. 发布与成熟度门

```text
candidate: discovered -> triaged -> researching -> modeled

pack: draft -> researched -> modeled -> verified -> operational
                                                ├-> degraded
                                                ├-> suspended
                                                └-> retired
```

最低发布门：

- `researched`：官方身份/条款/能力证据和开源候选审计完成；
- 每个高价值但未进入 route 的 capability/access method 都有 adoption decision，不能用“省略”隐藏风险；
- `modeled`：concept/capability/access-method snapshot 已 review/commit；
- `verified`：至少一项 capability 通过 fixture，live capability 必须另有 sandbox report；
- `operational`：有 owner、SLO、canary、成本/限流和正式降级路径；
- `suspended`：条款/许可/安全/官方 sunset、长期验证失败或维护者失联。

“未验证”应保留为 `blocked/inconclusive`，不能为了平台覆盖率降级标准。manual-import/manual-package 是正式能力，不是伪装成自动化失败的兜底。

## 9. 漂移与持续维护

Platform Pack 发布后持续接收 `DriftSignal`：

- official docs、OpenAPI、SDK、scope、价格、审核和 terms 变化；
- subscription/entitlement、OAuth tool surface、vendor export schema、content license、AI/storage/index purpose和retention/revocation变化；
- 开源项目新 release、归档、license、安全或 maintainer 变化；
- fixture schema diff、live canary、授权、限流和错误分布变化；
- skill 引用 snapshot 过旧，或 adapter conformance 落后于最新知识。
- search-demand methodology、sampling/normalization/scaling、rolling window、rank truncation或subject taxonomy变化；Google Trends alpha/BigQuery schema与entitlement变化；Google Ads developer-token/access/permissible-use/OAuth/tool surface变化；Microsoft monthly-volume lag/date anchoring、sandbox/production与estimate contract变化；百度公开版/API商业声明、weighted-index定义或合同schema变化。

Drift assessment 只能产生：no-change、reverify、degrade、suspend 或 retire。它不能自动接受新的知识 claim，也不能在 adapter 失效时扩大权限。受影响声明按 capability 局部降级，不必让整个 Pack 同时失效。

## 10. 可观测性

长期系统应观测四组指标：

| 视角 | 指标 |
| --- | --- |
| Discovery funnel | campaigns、candidate yield、triage time、reject/defer reason、独特信号类型覆盖 |
| Knowledge quality | proposal/review lead time、evidence coverage/expiry、CAS conflict、open questions、snapshot drift |
| Verification | 各 level pass/blocked/fail、fixture flake、sandbox cost、live expiry、负向测试覆盖 |
| Portfolio health | capability coverage、operational/degraded/suspended 数量、maintenance hours、MTTD/MTTR、manual fallback success |
| Behavioral integrity | instrumentation health/lag、definition/taxonomy/identity drift、partial-period exposure、TTL/deletion gap、illegal unique/ratio rollup |

公开产品评价还要求观测“缺失成员”而非只观测成功成员：Channel 同时报告 requested、fixture-eligible、callable、unsupported、manual/policy-gated、succeeded 与 quarantined；每个成员再按 product/version/record/representation、rating scale、history/rights coverage、identity drop、license attribution、schema drift 和 zero-write 断言展开。AMO 成功不能让 Chrome/JetBrains 变绿，公开网页存在也不能让 route 变为 available。

监管投诉要求把publication capability drift视为一等事件：CFPB停止narrative publication时只局部degrade对应capability，并保留公告、旧docs冲突和最后有效窗口；NHTSA/CPSC不能被当作内容fallback。Portfolio同时观测root/row identity policy、claim/finding authority、PII pre-persistence gate、population/exposure coverage、schema cutover和zero-write。公开机构、政府数据或一次API成功都不能跳过这些门。

外部搜索需求要求按representation报告可比性而非只报告row count：Channel同时报告requested、fixture-eligible、callable、contract/alpha-gated、schema-blocked与quarantined；每个成员再按population、subject/seed/target、geo/language/network/window、sampling/normalization/scaling/approximation、rank truncation、account/config dependence、rights和watermark展开。Google Trends相对值、Google Ads/Microsoft近似计数或forecast与百度weighted index不能因为都使用“关键词”就被合并或统一排名。

商业体验反馈要求同时报告requested、fixture-eligible、callable和durable四个分母，并按business unit/location/service identity、owned/sample/excerpt/feed/provider-answer representation、sample-total gap、attribution、cache/retention、deletion completeness和rights valid window展开。Google Places/GBP技术成功不能替代持久分析许可，Yelp普通API不能fallback为AI语料，Trustpilot Display不能补成Insights full feed；任一member被政策或合同隔离时Channel只局部degrade，并显示missing-member reason。

公共采购v0.3要求同时报告requested、concept-fixture、route-fixture、manual-only、callable和durable六个分母，并按population/regime/threshold/reporting duty、process/notice/procedure/lot/award/contract/transaction identity、amount role、authority、representation/history、late/correction/nil、rights和privacy展开。USAspending/Canada/Prozorro的official machine surfaces不能让CCGP变自动，也不能彼此补全award、contract或payment population；Prozorro docs/source version mismatch、Canada unaudited/threshold disclosure和USAspending bulk-job effect必须局部degrade。官方API POST-read、OCDS、CSV或开源source都不能把estimated、award、contract、obligation与outlay变成同一金额。

公共资助优先级与已资助研发也要求同时报告requested、fixture-eligible、callable和durable四个分母，并按programme/call/opportunity/topic/award/project identity、representation、classification、authority、金额role、API/bulk/MCP surface、refresh/lag、Terms/license与PI/contact drop展开。Funding & Tenders中的tender必须分流到采购Channel，grant不得因含金额和截止期而伪装procurement；官方POC MCP、社区server或一次API成功不得提升durable成熟度。SBIR API维护、Grants目录与MCP source drift、NIH sampled preview和EU live/dataset差异都必须局部degrade并给出machine-readable reason。

公开规则制定与政策咨询进一步要求拆分requested、concept-fixture、route-fixture、callable和durable分母：一个成员可以拥有稳定概念，却没有可采用的官方机器schema。Portfolio按jurisdiction/authority、proposal/final/submission/outcome identity、official status、comment window、campaign/duplicate、PII/content rights、common-origin和watermark展开。Regulations/Federal Register/GOV.UK的机器表面不能让EU/中国成员变绿；GSA官方MCP无root license、GOV.UK Search unsupported、EU/中国missing machine contract都必须局部degrade并禁止HTML/internal/community fallback。

公开公司披露同样拆分concept、format、route、entitlement、callable与durable：ESEF taxonomy/Reporting Manual只证明格式，future ESAP ITS不证明当前public endpoint；HKEX IIS公开spec只证明协议候选，不证明订阅、AI/index或document rights；CNINFO法定网页不证明developer contract。Portfolio按entity/form/filing/document/fact、official status、authority、taxonomy/context/unit/dimensions、amendment/restatement、PII/content rights、common-origin和watermark展开。SEC/Companies House的公开读表面不能让EU/HKEX/CNINFO变绿，community Skill/MCP/parser也不能跨过policy或contract gate。

公开技术标准同样拆分concept、process taxonomy、native/provider route、callable与durable：IETF/W3C有native metadata contract，WHATWG/TC39只允许固定official repository/commit的GitHub provider route，OpenJDK网页表格不构成machine contract。Portfolio按organization/group/work item、process revision/native state、normativity/authority、edition/commit、transition/relation、implementation/test evidence、compatibility role、rights与watermark展开；任一组织的route、stage名称或GitHub可读性都不能让其他成员变绿。

公开产品召回同样拆分concept、native route、manual export、callable与durable：FDA/NHTSA/CPSC/Canada有official machine surface只代表route-fixture eligibility，Safety Gate的portal/export与未文档化路径不构成API contract。Portfolio按jurisdiction/authority、event/campaign/product/range/action、native state/class、risk/source assertion、mandate、representation/language common-origin、PII/rights与watermark展开；官方发布、社区Skill/wrapper或一次API成功都不能让hazard变成因果、status变成完整回收、recall变成需求规模或另一个成员变绿。

公开科研文献还要拆分concept、metadata route、content rights、callable与durable：Crossref/OpenAlex/PubMed/Europe PMC/arXiv都有official metadata surface，只代表候选发现fixture eligibility；abstract/full text的exact version、licence、purpose和entitlement必须另审。Portfolio按member/corpus/query、work/version/expression/record、native lifecycle、authority/classification、provider merge/delete、representation/common-origin、metadata/abstract/full-text rights与watermark展开；同源多平台、社区MCP/Skill、OA/index/citation或一次API成功都不能让content route、科学真值、需求证据或另一个成员变绿。

公开临床研究注册继续拆分concept、metadata/export route、results/document rights、callable与durable：ClinicalTrials.gov/WHO/ISRCTN有official machine surface只代表route-fixture eligibility，CTIS/DRKS的public search/export与内部请求不构成versioned API。Portfolio按member/registry/population、study/protocol/record revision、native status/authority、anticipated/actual enrollment、outcome/results/history representation、common-origin、terms/rights和contact/site/participant/IPD drop展开；community patient-matching MCP、registry quality review或一次API成功都不能让scientific/clinical truth、需求证据或另一个成员变绿。

公开药品供应短缺继续拆分concept、record route、aggregate route、restricted reporting port、callable与durable：FDA/Canada/TGA的公开机器表面和UK aggregate只代表各自route-fixture eligibility，EMA public catalogue不能借ESMP report API补成public read。Portfolio按member/population/jurisdiction、event/notification/product/presentation、native state/availability/impact、authority、cause/mitigation、history/common-origin、aggregate denominator、terms/rights和contact/clinical-advice drop展开；community MCP/Skill、同成分名称、一次API成功或受限报送能力都不能让临床可替代、需求规模、另一个成员或write port变绿。

公共监管执法继续拆分concept、service/feed/selected-record route、document rights、callable与durable：EPA ECHO service及SEC/CMA feed只代表各自route-fixture eligibility，不能让CFPB/FTC获得机器合同，也不能让feed entry补成完整case。Portfolio按member/authority/jurisdiction、matter/case/proceeding/instrument、assertion posture、final/effective/stayed/appeal、obligation status、amount role、history/common-origin/parallel action、terms/rights和natural-person/victim/witness/contact drop展开；complaint、settlement、closed、商业MCP或一次read成功都不能让finding、admission、completion、另一个成员或write port变绿。

公共申诉专员裁决继续拆分concept、official feed/selected-record route、document rights、callable与durable：Housing页面声明RSS只代表其route-fixture eligibility，不能让FOS/TPO/FSPO获得机器合同，也不能让feed entry补成完整decision或complaint population。Portfolio按member/authority/jurisdiction/domain、case/decision revision、investigator/preliminary/final stage、native outcome、binding/acceptance、remedy、appeal/stay/variation、reported compliance、publication lag/withholding、terms/rights和complainant drop展开；published、upheld、order、generic scraper或一次read成功都不能让accepted/binding、representative、completed/paid、另一个成员或write port变绿。

公共审计继续拆分concept、official feed/open-data/selected-record route、document/dataset rights、callable与durable：GAO reports RSS与ECA exact open-data catalogue只代表各自route-fixture eligibility，不能让NAO/ANAO/OAG获得机器合同，也不能让feed/dataset补成完整finding/recommendation/follow-up population。Portfolio按member/publisher/jurisdiction、report revision、scope/criteria/method/selection、finding posture/assurance、recommendation、auditee response、自报implementation、auditor confirmation/follow-up、benefit role、history/common-origin、terms/rights和natural-person/contact drop展开；recommendation、agreement、self-report、closed/no-longer-valid、generic scraper或一次read成功都不能让implemented/auditor-confirmed、另一个成员或write port变绿。

公共311继续拆分concept、dataset/export/Open311/exact-ID route、location/content rights、callable与durable：NYC/SF/Austin的Socrata与Toronto的CKAN只代表各自route-fixture eligibility，不能让另一个城市获得schema或rights，也不能用Open311 standard/community MCP补成bulk history或POST authority。Portfolio按member/jurisdiction、published/excluded population、dataset/resource/partition、request revision、service taxonomy、origin、assignment、native status/source-declared disposition、duplicate uncertainty、current-state/history、coarse-location/privacy、terms/rights和refresh展开；row count、closed、similarity、公开精确地点、generic scraper或一次read成功都不能让unique person/incident、physical resolution/exact duplicate、durable index、另一个成员或write port变绿。

公共请愿继续拆分concept、register/list/selected-record route、content/support geography rights、callable与durable：UK/Senedd静态JSON representation只代表各自route-fixture eligibility，不能让Scotland/EU获得machine contract，也不能用同族GDS source、HTML/browser或community MCP补成另一个部署。Portfolio按member/jurisdiction/legislature/process、eligibility/admissibility/moderation、petition revision、mutable support snapshot/counting rule、member-specific threshold、actual response/committee/debate/report/closure、language/common-origin、terms/rights/privacy和identity drop展开；publication、signature count、threshold、debate、一次read或官方source licence都不能让truth/representativeness/guaranteed action/adoption、durable index、另一个成员或write port变绿。

公共参与式预算继续拆分concept、provider-schema candidate、exact-member route、selected/manual、callable与durable：Paris winner和NYC historical datasets只代表各自有限population，Decidim/CONSUL provider schema不能让Barcelona/Madrid deployment获得exact route，也不能用HTML/browser/community MCP或另一个城市补齐。Portfolio按member/deployment/process/round、scope与proposal/ballot roster、admissibility/feasibility/costing/merge、support/final-vote measure、weighting/ballot/envelope rule、selection、amount role、budget inclusion/appropriation、execution authority/status/milestone、winner-only/stale history、terms/rights/privacy和identity/location drop展开；proposal、support、winner、tracker completed、一次read或官方source licence都不能让representativeness、funded/spent/delivered、durable index、另一个stage/member或write port变绿。

公共信息公开请求继续拆分concept、provider/source-schema candidate、exact-member route、selected/manual、callable与durable：FragDenStaat official `/api/v1/`只代表该部署的route-fixture eligibility，Alaveteli源码不能让WhatDoTheyKnow/AskTheEU获得exact deployment contract，MuckRock/Froide源码也不能替代生产route/version/customization；HTML/browser/community MCP或兄弟部署均不得补齐。Portfolio按member/deployment/provider、jurisdiction/legal regime/public-body roster、published/excluded population、visibility/embargo、request/message/event/release revision、delivery/authentication、native lifecycle/disposition/classification authority、deadline/calendar/extension、fee/withholding、release/redaction、review/appeal lineage、terms/rights/privacy和identity/contact drop展开；request、successful/done/not-held/refused、release、verified email、一次read或官方source licence都不能让truth/fault/legal compliance/unique people/full disclosure/reuse right、durable index、另一个成员或write port变绿。

公共规划申请继续拆分concept、catalogue/schema、exact-member route、selected/manual、callable与durable：England/NYC/Ireland route fixture只代表各自固定dataset/service，NSW catalogue不能补成endpoint；England synthetic-derived origin/incomplete provider、NYC public subset/migration与Ireland duplicate catalogue/participating-authority drift必须显式降级，HTML/browser/community Socrata/ArcGIS MCP、private CRM与另一个jurisdiction都不得补齐。Portfolio按member/deployment/jurisdiction/process、authority roster、application/action/site/document revision、exhibition/window/renotification、published representation population、assessment/recommendation/decision/finality、condition/appeal/implementation、spatial precision、terms/rights/privacy和identity/contact/donation drop展开；application、count、completed/determined、recommendation、approval、一次read或source licence都不能让truth/representativeness/final authority/built/occupied、durable index、另一个stage/member或write port变绿。

平台数、GitHub stars、外部目录的 connector 数量和一次 live success 都只能作为维度，不能成为北极星指标。

## 11. 演进顺序

### Phase A：手工 Platform Pack

- 为抖音和一个非社交平台手工建立 Pack；
- 固定 knowledge snapshot、skills、artifact commits 和验证报告；
- 验证同一套模型能表达 video 与 job/listing/RFP 等不同概念。

### Phase B：半自动研究

- Scout 只读扫描官方门户、GitHub 和 connector/MCP/skill 目录；
- Agent 生成 candidate、dossier 和 proposal；
- 人工 review/commit，不自动安装或运行外部项目。

### Phase C：验证工厂

- 生成共享 fixture、contract/negative scenarios；
- 在隔离环境运行 adapter/skill；
- live probe 始终绑定凭据引用、预算、批准和 expiry。

### Phase D：持续发现与维护

- 根据需求数据和 channel gap 自动建议 discovery campaign；
- 监控 docs/release/schema/license/health drift；
- 按 capability 自动提出 reverify/degrade 建议，由策略或用户决定发布状态。

公共技术讨论 Channel 进一步证明：平台存在官方API，不等于特定数据用途、长期保存和AI辅助索引已获准。共同抽象只统一thread/record/revision/relation/coverage，不合并Q&A acceptance与news ranking；所有policy-blocked成员必须保留为missing-member，不得由MCP、Skill、CLI、非官方search或网页抓取静默补位。

公开早期采用者发现 Channel 进一步证明：同一研究目标可以由完全不同的稳定平台概念支持。Reddit保留subreddit/post/comment/thread的`PublicDiscussion*`，Product Hunt保留Product Page/launch/Post/maker/topic/comment/review/placement的`ProductLaunch*`；只有派生机会视图共享查询。Reddit批准、Product Hunt商业/API批准与schema conformance分别决定成员coverage，任何成员blocked都不能借另一个成员或HTML/MCP/Skill fallback伪装完整。

交易市场 Channel 进一步证明：技术接入成熟度与用途可用性必须分开。eBay有官方Browse/Sell API和官方MCP，但public需求warehouse及多种价格/市场/转化衍生受partner与书面许可门约束；闲鱼缺少通用公开search/publish API，却仍可保留用户选择的manual observation/package。共同`MarketplaceOffer*`/`MarketplaceOutcome*`只统一可审计representation，不让eBay借闲鱼manual maturity绕过许可，也不让闲鱼借eBay API maturity伪装自动化能力。

服务采购Channel进一步证明：官方Agent/API能力越完整，越需要把“可即时协助用户”“可在sandbox验证协议”与“可作为长期研究来源”拆开。Upwork hosted MCP只允许具体用户任务并限制bulk/index/RAG等；Freelancer.com有REST API/OAuth/sandbox但缺明确书面自动访问许可与长期storage依据；猪八戒有known Task与openid服务商已参与交易/合同/验收/支付链，却无public search/list，且逐应用用途隔离、HTTP/schema/SDK和立即删除门未解决。三个Pack共同证明`ServiceRequest*`/`ServiceEngagement*`，Channel roster revision 2仍诚实发布`callable/durable members = 0`与missing-member report。Fiverr保持Reject-auto，不因需要凑成员而接入。

公共采购v0.3进一步证明：同一个“花了多少钱”问题至少包含estimated budget、award amount、original/current contract、amendment、obligation/deobligation、outlay和threshold aggregate八类不可替换事实。SAM/TED/FTS/CCGP/USAspending/Canada/Prozorro只共享`PublicProcurement*`可审计表示；官方award不证明签约，合同值不证明支付，outlay不自动证明供应商收到款项，completion/termination不证明成功或过错。只有exact buyer/authority record revision可形成requirement、commitment或execution evidence；bid/contact/publication/write都不是需求Probe。

本地服务第三轮进一步证明：发现批次不决定Channel归属。Taskrabbit提供partner checkout的estimate到履约结果；Thumbtack同时存在user-directed supply search、真实Request与Business-scoped Negotiation；两者组成location-first Local Service Channel，诚实发布`callable/durable/probe members = 0`。猪八戒虽在同一候选批次被发现，但其稳定对象是数字服务采购、比稿/计件/招标和合同履约，因此进入Service Work Channel roster revision 2，而不为凑本地成员污染概念树。Bark/58继续等待正式developer/partner/export用途证据。

公共资助Channel进一步证明：领域名称不能替代事实语义。资助机会表达机构声明的优先方向，award/project表达来源报告的资源配置活动，采购notice表达买方准备购买的范围与程序；三者即使共享预算、截止期、主体和分类字段，也不能复用同一种Evidence。Grants.gov、NIH RePORTER、EU Funding & Tenders/CORDIS与SBIR/STTR只共享`PublicFunding*`的可审计表示，申请、提交、联系人触达和任何MCP write均不属于研究Connector。

公开规则制定Channel进一步证明：正式流程中的“公开”仍包含不同authority与法律状态。proposal/draft只表示可能变化，stakeholder response只表示正式提交，authority response/outcome只表示来源的处理说明，只有official final/effective record才可能支持法律状态判断且仍需人工/法律审查。Regulations.gov和Federal Register的common-origin必须去重，EU mass campaign、GOV.UK same-page lifecycle和中国结果汇总必须保留population/coverage缺口；真实comment submission不是需求Probe。

公开公司披露Channel进一步证明：法定发布、监管接收、审计标记和结构化标签是不同事实。issuer statement仍是issuer authority；XBRL fact只有在taxonomy/context/unit/dimensions/period一致时才可比较；amendment/restatement必须使旧projection可定位失效；cross-listed或provider-normalized文档不能增加独立证据。SEC/Companies House提供当前route fixture，EU等待public ESAP，HKEX只允许licensed IIS且网站明确blocked，CNINFO等待official contract；法定filing、证券交易与高管联系都不是需求Probe。

公开技术标准Channel进一步证明：formal process并不产生一条跨组织统一成熟度轴。draft/proposal、published standard、living latest、stage transition、source integration、implementation interest与test result分别保留；process revision与native lifecycle不能丢。IETF/W3C native route和WHATWG/TC39 provider route只提供fixture eligibility，OpenJDK保持machine-contract missing；提交draft/proposal、comment、ballot、issue/PR或test result都不是需求Probe。

公开产品召回Channel进一步证明：监管发布不产生统一风险或完成度轴。FDA enforcement report、NHTSA campaign/product、CPSC recall、Safety Gate alert/follow-up与Canada recall/advisory只共享`PublicProductRecall*`的可审计表示；native class/status、voluntary/requested/ordered measure、incident assertion与coverage分别保存。报告安全问题、联系企业、订阅或发布alert、创建/更新recall都不是需求Probe。

公开科研文献Channel进一步证明：索引覆盖与正文证据是两条成熟度轴。DOI record、provider graph、citation index、aggregator record和repository version只共享`PublicResearchLiterature*`的可审计表示；work/version/expression、author/provider authority、correction/retraction、classification与metadata/abstract/full-text rights分别保存。只有获准exact content span才能形成“来源报告的限制/未满足研究需要”，仍不能升级成科学真理、代表性用户痛点或市场规模；投稿、更新、撤稿、curation、联系作者和citation操作都不是需求Probe。

公开临床研究注册Channel进一步证明：prospective registration和results disclosure能补足publication bias，却不产生疗效或需求真值。ClinicalTrials.gov protocol/results、WHO provider projection、ISRCTN contribution、CTIS regulatory record与DRKS study export只共享`PublicClinicalStudy*`的可审计表示；native status、sponsor/registry/regulator authority、anticipated/actual enrollment、outcome/results、rights和cross-registry identity分别保存。只有exact source revision可形成registry-declared activity或reported constraint，仍不能升级为actual recruitment、scientific validity、patient demand或医疗建议；register/update/results upload/contact/recruit/referral都不是需求Probe。

公开药品供应短缺Channel进一步证明：公共供给约束比召回或一般运行状态更接近未满足需求，却仍不是需求分母。FDA/Canada/EMA/TGA逐产品记录与UK统计只共享`PublicMedicineSupply*`的可审计表示；presentation identity、native status/availability/impact、regulator/notifier authority、cause/mitigation、event与aggregate denominator分别保存。只有exact source revision可形成regulator-reported constraint或reported mitigation，仍不能升级为local stock、root cause、patient harm、clinical substitution或market size；report/update/contact/subscribe和医疗建议都不是需求Probe。

公共监管执法Channel进一步证明：越接近formal authority，越需要保留程序而不是提高一个笼统“可信度分”。EPA/CFPB/FTC/SEC/CMA只共享`PublicRegulatoryEnforcement*`的可审计表示；allegation、agency/tribunal/court finding、admission/no-admission、finality、appeal与obligation分别保存。只有exact official instrument revision可形成带姿态的compliance assertion或remedial obligation，仍不能升级为guilt、prevalence、payment、completion或respondent ranking；filing/comment/petition/report/contact/subscribe都不是需求Probe。

公共申诉专员裁决Channel进一步证明：正式裁决的可信authority不能替代程序、分母和执行证据。FOS/TPO/FSPO/Housing只共享`PublicDisputeDecision*`的可审计表示；investigator/preliminary/final、native outcome、acceptance/binding、appeal/stay/variation、remedy与reported compliance分别保存。只有exact final decision span可形成带stage/binding的determination evidence，exact remedy span仍不能升级为implementation、payment、普遍责任、投诉率或respondent ranking；complaint/evidence submission、accept/reject、appeal/contact/subscribe都不是需求Probe。

公共审计Channel进一步证明：更强的审计authority仍不能替代scope、method、selection与后续authority。GAO/NAO/ECA/ANAO/Canada OAG只共享`PublicAuditFinding*`的可审计表示；draft/final finding、recommendation、auditee response、自报implementation、auditor confirmation/follow-up audit和benefit role分别保存。只有exact auditor-authored final span可形成scoped finding/recommendation evidence，exact follow-up仍不能升级为组织普遍事实、因果成功、持续有效、全部建议分母或benefit receipt；audit request、举报/证据提交、auditee status update、contact/subscribe都不是需求Probe。

公共311Channel进一步证明：更直接的痛点记录也不天然拥有独立事件分母或结果真值。NYC/SF/Austin/Toronto只共享`PublicCivicServiceRequest*`的可审计表示；request、origin、classification、assignment、status、duplicate assertion、source-declared disposition、current-state/history和location precision分别保存。只有exact public record可形成published request evidence，exact closure/update仍不能升级为unique person/incident、verified defect、physical resolution、SLA、满意或持续效果；报修、重复提交、附图/位置、contact/subscribe都不是需求Probe。

公共请愿Channel进一步证明：形式化政治参与链越清晰，越不能把平台门槛压成单一热度分。UK/Scotland/Senedd/European Parliament只共享`PublicPetition*`的可审计表示；petitioner request、moderation、mutable support snapshot、member threshold、government response、committee action、debate/report与closure分别保存。只有approved exact span可形成published request、platform-accepted support或official response evidence，仍不能升级为truth、representative opinion、guaranteed debate、adoption、implementation或issue resolution；创建、签名、验证、campaign、提交证据、contact/subscribe都不是需求Probe。

公共参与式预算Channel进一步证明：一个公开过程即使同时展示需求、优先级、钱和进度，也不能压成单一“validated demand”或“delivery”分数。Barcelona/Madrid/Paris/NYC只共享`PublicParticipatoryBudget*`的可审计表示；proposal、evaluation、prioritization、ballot、vote/grade/rank、selection、budget inclusion/appropriation和execution分别保存。只有approved exact span/aggregate/authority record可形成published need、priority aggregate、reported allocation或reported execution evidence，仍不能升级为truth、representative opinion、payment/spend、physical acceptance、quality或impact；提案、支持、投票、评论、campaign与official status/admin mutation都不是需求Probe。

公共信息公开请求Channel进一步证明：平台把正式请求、通信、状态和披露串在一页，也不能压成单一“已验证痛点”或“机关已解决”分数。WhatDoTheyKnow/MuckRock/FragDenStaat/AskTheEU只共享`PublicInformationAccess*`的可审计表示；requester request、public-body correspondence、platform/requester/body/review-body classification、fee/withholding、release/redaction和review/appeal分别保存。只有approved exact span可形成published request、attributed body correspondence、reported disposition或published release evidence，仍不能升级为request truth、机关过错、法律有效性/合规、representative opinion、unique people、完整披露或released-content truth/reuse right；draft/send/follow-up、缴费、review/appeal、annotation、upload、embargo与status/admin mutation都不是需求Probe。

公共规划申请Channel进一步证明：把application、公众意见、officer report和decision放在同一个register，也不能压成一个“validated demand”或“获批项目”分数。England/NSW/NYC/Ireland只共享`PublicPlanningApplication*`的可审计表示；requested change、exhibition/representation、applicant response/amendment、officer/advisory assessment、competent decision/condition、appeal与implementation分别保存。只有approved exact span可形成published application/representation、reported assessment或reported decision evidence，仍不能升级为truth、unique people/representative opinion、法律正确、built/occupied/compliant/effective；application、comment/testimony、donation、upload、payment、appeal与status/admin mutation都不是需求Probe。

公共建筑监管Channel进一步证明：planning approval之后仍存在不能互相替代的authorization、inspection、enforcement与certificate事实。NYC/Chicago/Toronto/NSW只共享`PublicBuildingRegulation*`的可审计表示；work application、permit/work item、plan review/fee validity、inspection stage/result、complaint、violation/order/adjudication、correction/compliance、CC/OC/TCO/partial/final/BIC分别保存。只有approved exact span可形成published work application、reported permit authorization、inspection result、code finding或certificate evidence，仍不能升级为truth、commencement/completion、whole-project/continued compliance、liability/current condition、current safety或actual occupancy；permit/renewal、inspection、complaint、correction、certificate、payment与status/admin mutation都不是需求Probe。

公共职业/经营许可Channel进一步证明：主体准入、当前standing、检查、指控、认定、处分和恢复不能压成一个“可信/不可信”分数。NYC DCWP、Chicago BACP、California DCA、Ahpra只共享`PublicRegulatedLicense*`的可审计表示；business entity/establishment/natural-person professional、application/license/endorsement、inspection、complaint/investigation/charge、finding/finality、sanction/condition/undertaking、appeal/stay、remediation/reinstatement分别保存。七种approved exact span evidence仍不能升级为approval、competence、reputation、actual practice、continued compliance、discipline或历史清除；public register也不自动授予bulk demand profiling权利。申请/续期、检查、投诉、付款、申诉、restriction removal、reinstatement与status/admin mutation都不是需求Probe。

公共环境监管Channel进一步证明：许可、限值、监测值、超限、法律违规、执法和整改不能压成一个“污染/合规”分数。US EPA ECHO、England EA、EU/EEA Industrial Emissions Portal与NSW EPA只共享`PublicEnvironmentalRegulation*`的可审计表示；site/facility/installation/source/outfall、permit/condition/limit、requirement/measurement、measurement kind/method/unit/statistic/period/value derivation/reporting basis/qualifier、comparison、system/self-report/authority finding、enforcement/remediation分别保存，年度release/transfer inventory另有独立reporting population。九种approved exact span evidence仍不能升级为operation、automatic comparability、legal violation、authority finding、whole-site compliance、exposure/harm或verified recovery；known-data alert、process cutover和conditional-rights expiry会主动降级或失效partition。许可/监测/不合规/incident申报、投诉、联系、订阅与admin mutation都不是需求Probe。

污染场地Channel进一步证明：notification、contaminant observation、risk classification、statutory designation、responsibility/liability、remedy、milestone、control与cost不能压成一个“污染严重度/清理进度”分数。US EPA SEMS、Canada FCSI/FCSAP、England Part 2A与NSW CLM只共享`PublicContaminationRemediation*`的可审计表示；各自program population、site/parcel/operable-unit边界、authority、legal posture、completion scope和rights仍独立。construction complete、listing deletion、reuse和funding都不能升级为whole-site goals verified、unrestricted safe use、no residual stewardship或payment。污染通知、采样提交、责任方联系、投诉、appeal与admin mutation都不是需求Probe。

饮用水Channel进一步证明：登记、采样值、标准比较、违规、事件、consumer advisory、纠正行动和解除警报不能压成一个“水安全分数”。US EPA SDWIS、DWI、Canada ISC与Taumata Arowai只共享`PublicDrinkingWaterSafety*`的可审计表示；各自supply population、stage/standard、violation law、event/advisory authority、publication lag、denominator与security边界仍独立。single result、health-based flag、event、boil notice、project completion和lift recommendation都不能升级为whole-system exposure/illness或actual restoration。sample/noncompliance/incident report、advisory issue/lift、contact与admin mutation都不是需求Probe。

环境空气质量Channel进一步证明：观测、质量状态、指数、预报、污染事件、健康建议、主管机关警报和法律合规不能压成一个“AQI事实”。AirNow/AQS、UK Defra、EEA与ECCC只共享`PublicAmbientAirQuality*`的可审计表示；成员自身monitoring product、pollutant/method/period、quality lifecycle、index formula、model fill、forecast、alert authority、coverage与rights仍独立。station不代表postcode/area/person，preliminary不代表validated，forecast/trigger不代表issued advisory，高指数不代表legal exceedance，episode不代表cause，health guidance不代表diagnosis/exposure/harm。incident report、advisory/alert issue、subscription、contact、API signup与admin mutation都不是需求Probe。

公共食品安全Channel进一步证明：场所、检查、引文/违规、评分、执法、关闭、复检/恢复与食源性暴发不能压成一个“卫生/声誉事实”。NYC DOHMH、UK FSA、Toronto DineSafe与CDC NORS只共享`PublicFoodSafety*`的可审计表示；各自establishment/permit identity、inspection population、severity/rating scheme、process authority、history、coverage与rights仍独立。pass不代表持续安全，critical/crucial不代表疾病，closure不代表永久失败或暴发，reopening不清除历史，complaint-origin不代表投诉成立，NORS setting/vehicle/etiology也不能通过地址或名称相似绑定到exact premises。inspection/rerating/appeal、complaint、correction、closure/reopen、outbreak report、contact与admin mutation都不是需求Probe。

公共交通Channel进一步证明：计划、预测、车辆位置、实际stop event、通告、运营中断、设施状态、无障碍路径与绩效aggregate不能压成一个“实时/可靠性事实”。MTA、TfL、MBTA与TfNSW只共享`PublicTransitService*`的可审计表示；各自agency/operator/mode/feed、service-day identity、GTFS extension、prediction model、alert authority、facility topology、history和metric denominator仍独立。schedule不代表operated，missing realtime不代表cancelled，prediction不代表actual，alert不代表measured impact或root cause，static accessibility不代表当前可达，一个lift outage/restore也不代表whole station inaccessible/accessible。同名on-time、headway、wait与facility availability不能跨method比较。alert/incident/facility-status publication、issue report、paratransit booking、subscription、contact、API registration与schedule/dispatch/admin mutation都不是需求Probe。

公共道路安全Channel进一步证明：fatal-crash census、police-reported injury registry、threshold-based city collision table、probability sample、linked health outcome、aggregate statistic与active hazard不能压成一个“事故事实”。NHTSA FARS、NYC MVC、DfT STATS19与NSW Crash Data只共享`RoadSafety*`的可审计表示；各自population/reporting threshold、release vintage、table grain/key、severity basis、factor authority、geocode precision、exposure denominator、privacy与rights仍独立。fatal census不代表all crashes，police report不代表完整发生总体，factor不代表cause/fault/liability，provisional不代表final，count不代表risk，cluster不代表道路因果，active hazard不代表collision。crash/hazard report、emergency/contact、enforcement/road-work request、map/status edit、subscription、API registration与Socrata/CKAN/MCP write都不是需求Probe。

公共消费价格Channel进一步证明：price quote、transaction、average price、basket weight、index point、rate/contribution、source-defined availability与affordability aggregate不能压成一个“价格事实”。BLS CPI、ONS CPIH/CPI、Eurostat HICP与Statistics Canada CPI只共享`PublicConsumerPrice*`的可审计表示；各自program population、classification、quote/average method、formula、base/price/weight/reference period、seasonal/adjustment/missing/release、rights仍独立。quote不代表average/index，weight不代表demand，rebase不代表price shock，missing/imputed/suppressed quote不代表stockout，harmonised不代表identical basket，CPI不代表individual household burden。API registration、restricted microdata request、subscription/contact、statistical submission、dashboard share与MCP/admin write都不是需求Probe。

公共租赁住房Channel进一步证明：advertised/asking、achieved/paid、contract、gross、occupied/vacant、turnover与modelled rent不能压成一个“租金事实”，dwelling/unit、household与person也不是可互换的统计grain。U.S. Census ACS、UK ONS PIPR、Eurostat EU-SILC与Canada CMHC RMS只共享`PublicRentalHousing*`的可审计表示；各自program population、tenure、rent basis、level/index、vacancy/availability、turnover window、housing-cost components、income denominator、threshold、estimate quality、revision与rights仍独立。vacancy aggregate不代表live listing，turnover不代表unique tenant/churn/eviction，rent index不代表货币金额，persons in burdened households不代表households或individual hardship，missing/suppressed/not-significant不代表zero。API key申请、restricted microdata、workbook/API data row、subscription/contact、survey response与MCP/admin write都不是需求Probe。

公共劳动力需求统计Channel进一步证明：公开job posting、统计vacancy/opening、occupied/employment stock、hire/separation flow、rate与offered wage不能压成一个“招聘热度”。BLS JOLTS、ONS Vacancy Survey、Eurostat JVS与Statistics Canada JVWS只共享`PublicLaborDemand*`的可审计表示；各自program population、statistical unit、vacancy definition、reference timing、numerator/denominator、adjustment、classification、quality、revision与rights仍独立。month-end stock不代表whole-month flow，hire不代表opening filled，quit/layoff不代表满意度或企业困境，offered wage不代表actual pay，harmonised definition不代表identical national collection。API key申请、restricted microdata、full-history mirror、contact/subscription、survey response与MCP/admin write都不是需求Probe。

公共企业形成与人口学Channel进一步证明：business/tax-ID application、legal registration、statistical enterprise birth、employer formation、establishment opening、firm startup、closure/death/exit、survival与high growth不能压成一个“新增/倒闭企业”。U.S. Census BFS/BDS、ONS、Eurostat与Statistics Canada MBOC只共享`PublicBusinessDemography*`表示；各自population/unit/activity test、lifecycle continuity、cohort/horizon、denominator、estimate standing、adjustment/disclosure、classification、quality、revision与rights仍独立。opening可能是reopening而非entrant，closure可能是temporary而非exit，employer first/no-employee transition不是enterprise birth/death，projected/spliced不是observed，job creation/destruction不是hire/separation。API key、restricted register/longitudinal microdata、bulk mirror、contact/subscription/submission、MCP/DB/admin write都不是需求Probe。

公共企业破产、清算与重组Channel进一步证明：economic distress、petition、filing、assignment、court order、bankruptcy declaration、liquidation、administration、proposal、reorganisation、receivership、moratorium、case termination与business death不能压成一个“企业失败”。U.S. Courts、UK Insolvency Service、Eurostat与Canada OSB只共享`PublicBusinessInsolvency*`表示；各自legislation、case/debtor/company/business/legal-unit population、procedure/event authority、window、denominator、index base/weight、adjustment、matching、quality、revision与rights仍独立。PACER、CourtListener与commercial bankruptcy MCP是case-level或fee/account-bearing separate surfaces，不能补official aggregate route；filing/alert/subscription/purchase/contact与法律程序写入都不是需求Probe。

公共企业信贷需求与融资条件Channel进一步证明：lender-reported supply、borrower demand、actual credit volume、application/approval、contract term与default event不能压成一个“融资压力”。Federal Reserve SLOOS、ECB BLS、Bank of England CCS与Bank of Canada SLOS只共享`PublicBusinessCredit*`表示；各自panel/question、loan/borrower taxonomy、measure-specific sign、net/diffusion/balance、weighting、past/current/expected、response quality、distribution与rights仍独立。FRED/ECB MCP、pyvalet和generic SDMX是transport/source-adjacent candidates，不能补domain definition或跨成员fallback；survey submission、loan application、key/subscription、MCP install、download/mirror和金融动作都不是需求Probe。

公共企业经营状况、约束与预期Channel进一步证明：business-reported activity、demand、price/cost、workforce、supply-chain、obstacle、resilience/liquidity、confidence/uncertainty、capacity/investment、expectation与planned action不能压成一个“企业信心”。Census BTOS、ONS BICS、European Commission BCS business surveys与Statistics Canada CSBC只共享`PublicBusinessConditions*`表示；各自population/statistical unit、question roster、response scale、measure-specific direction、weighting、time horizon、estimate/quality、release和programme lifecycle仍独立。respondent view、official estimate、publisher composite、administrative outturn与audited fact必须隔离；generic Census/ONS/SDMX/WDS MCP或SDK不能补domain definition或跨成员fallback。CSBC已进入final collection/final release阶段，programme status不能从仍可访问的route反推active；survey submission、microdata申请、key/subscription/contact、download/mirror、MCP/Skill安装执行和全部平台写入都不是需求Probe。

公共企业数字技术采用、能力与障碍Channel补齐另一类缺口：企业在用什么技术、处于什么采用阶段、为何不用、由谁实施、缺什么技能/安全能力以及是否计划外部支持。Census/NCSES ABS、ONS Digital Economy Survey、Eurostat ICT Usage in Enterprises与Statistics Canada SDTIU只共享`PublicBusinessDigitalAdoption*`；programme/lifecycle、firm/enterprise/unit、question/taxonomy/stage、current/prior/multi-year/planned time、business/employee/turnover/money/count/composite representation、estimator/quality/release/rights仍独立。reported use不是installed/verified/successful/value realised，barrier不是cause/pain/lead，external provider/financing intent不是procurement/application，security control不是effectiveness，DII不是raw adoption。programme active、questionnaire published、results published与machine route current必须分别证明；ONS paused和ABS transition/module rotation不能由可访问archive或current questionnaire掩盖。survey submission、API key申请、observation/file download、MCP/Skill安装执行和全部平台写入都不是Probe。

公共企业创新活动、约束与协作Channel进一步补足“企业正在尝试改变什么以及为何停下”的证据。Census/NCSES ABS Innovation、UKIS、Eurostat CIS与Statistics Canada SIBS只共享`PublicBusinessInnovation*`；Oslo/innovation definition、population/unit、product/process、novelty、activity status、question、time、representation、estimator、quality和lifecycle独立。idea、invention、R&D、technology acquisition与ongoing/abandoned activity不是introduced innovation；innovation-active不是成功、增长或价值；cooperation不是information source、outsourcing或contract；barrier不是cause/lead；support use不是award/payment；IP filing不是valid right；reported benefit不是causal outcome。ABS/SIBS current questionnaire、UKIS current report、CIS latest round和各machine route必须分别证明。survey submission、restricted microdata、key/contact、download、MCP/Skill执行和全部write都不是Probe。

公共数字接入、技能与线上参与Channel补足真实用户侧的结构性摩擦。NTIA/Census、Ofcom、Eurostat `isoc_i`与Statistics Canada CIUS只共享`PublicDigitalAccessParticipation*`；household/person/respondent/proxy/user population、access/use/device/barrier/skill/activity/concern、question routing、3/12-month window、representation、weight、quality和lifecycle独立。household access不是individual use或network availability，self-reported activity不是tested skill，online activity不是completion/benefit，concern不是incident，reported incident不是verified harm，barrier不是cause/WTP/vulnerability/lead。proposed instrument、fielded questionnaire、published result和machine route必须分别证明；respondent file/microdata、survey submission/contact、MCP/Skill执行、sensitive targeting和全部write都不是Probe。

公共家庭支出、消费与预算配置Channel补足“家庭实际把预算放在哪里”的aggregate信号。BLS CE、ONS LCF/Family Spending、Eurostat HBS与Statistics Canada SHS只共享`PublicHouseholdExpenditure*`；consumer unit/household、Interview/Diary/integrated、definition/classification/category、recall/annualisation、mean/share/reporting prevalence/aggregate、nominal/real/PPS、weight/quality/lifecycle独立。expenditure不是use/need/preference/satisfaction/demand，zero不是no need，share不是market share，aggregate不是market size，real change不是quantity，income不是affordability。current instrument、latest result、corrected table和machine route必须分别证明；microdata、survey/diary submission、special tabulation/contact、MCP/Skill执行、sensitive targeting和全部write都不是Probe。

公共时间使用、照护、流动与日常活动配置Channel补足“人的时间被什么占用”的aggregate信号。BLS ATUS、ONS OTUS、Eurostat HETUS与Statistics Canada TUS只共享`PublicTimeUse*`；population/respondent、diary-day/episode/slot、primary/secondary/secondary-childcare、classification、duration/participation/episode-count/time-of-day、population/participant mean、weekday/weekend/season/wave、weight/quality/lifecycle独立。diary day不是usual routine，duration不是burden/productivity/preference/outcome/demand，travel time不是trip/reliability，sleep time不是quality/health，zero不是never/no need。collection、latest result、corrected table、file/API和microdata route必须分别证明；respondent diary/microdata、survey submission/recruitment/contact、MCP/Skill执行、schedule/profile targeting和全部write都不是Probe。

公共医疗服务可及性、未满足需求与患者报告障碍Channel补足最接近“需要但没有获得服务”的aggregate信号。NHIS、GPPS、EU-SILC和ABS Patient Experiences只共享`PublicHealthCareAccess*`；service、need/outcome、barrier、question/window、denominator、weight/quality/lifecycle独立。self-reported need不是clinical necessity，delay/nonreceipt不是provider denial，experience不是objective quality。questionnaire、preliminary/final result、file/API/microdata分别证明；response、care contact、health profiling、MCP/Skill执行和全部write都不是Probe。

公共家庭能源可负担性、能源不安全与服务连续性Channel补足“价格和支出之外，家庭是否实际遭遇能源服务困难”的aggregate信号。EIA RECS、England LILEE、Eurostat EU-SILC与Australia AER只共享`PublicHouseholdEnergy*`；self-reported/modelled/retailer-reported authority、housing-unit/household/person/account population、service、indicator/event、amount role、denominator、quality和lifecycle独立。price不是bill/debt/gap，LILEE不是通用贫困定义，notice不是disconnection，disconnection不是outage，reconnection不是resolution。questionnaire、model、regulatory guideline、result/file/API/microdata分别证明；respondent/customer profiling、assistance/contact、MCP/Skill执行和全部write都不是Probe。

## 12. 本阶段不做

- 不实现自治爬虫、自动安装 skill/MCP/package 或执行未知代码；
- 不以开源目录替代官方能力和条款证据；
- 不为追求平台数接入 Cookie/private API/反检测项目；
- 不让 Platform Skill 直接持有 credential 或绕过 Connector resolver；
- 不把一次验证结果永久化；
- 不把外部 artifact 的对象模型写进核心事实 Schema。

对应抽象：

- `design/go/demandintel/platform_discovery.go`
- `design/go/demandintel/channel_pack.go`
- `design/go/demandintel/platform_knowledge.go`
- `design/go/demandintel/connector.go`
- `design/go/demandintel/governance.go`
- `design/go/demandintel/observability.go`

具体设计样本：

- [GitHub Platform Pack](./platform-packs/GITHUB_PLATFORM_PACK_DESIGN.md)：官方 API 完整度较高的只读研究型 Pack；
- [GitLab Platform Pack](./platform-packs/GITLAB_PLATFORM_PACK_DESIGN.md)：GitLab.com API Terms gate、Self-Managed/Dedicated实例差异、REST/GraphQL/webhook与官方MCP/Skill边界；
- [Public Software Issues Channel Pack](./platform-packs/PUBLIC_SOFTWARE_ISSUES_CHANNEL_PACK_DESIGN.md)：GitHub/GitLab的跨平台work-item representation、exact relation、coverage、动态物化与零写入验证；
- [Stack Exchange Public Q&A Platform Pack](./platform-packs/STACK_EXCHANGE_PUBLIC_QA_PLATFORM_PACK_DESIGN.md)：API 2.3、Q&A/revision/license语义、AUP用途门和MCP禁止持久索引边界；
- [Hacker News Public Discussion Platform Pack](./platform-packs/HACKER_NEWS_PUBLIC_DISCUSSION_PLATFORM_PACK_DESIGN.md)：item graph、ordered ranking snapshot、dead/deleted、外链artifact与YC Terms澄清门；
- [中国公开问题与技术社区候选分流](./platform-packs/CHINA_PUBLIC_PROBLEM_COMMUNITIES_TRIAGE_2026-08-26.md)：知乎/V2EX的信号增量、官方API/Skill/MCP/PAT证据与选择；
- [知乎开放搜索 Platform Pack](./platform-packs/ZHIHU_OPEN_SEARCH_PLATFORM_PACK_DESIGN.md)：typed REST、official Skill/CLI/MCP、search-summary/selected-excerpt/placement、合同门、固定artifact和zero-route验证；
- [V2EX Node Discussion Platform Pack](./platform-packs/V2EX_NODE_DISCUSSION_PLATFORM_PACK_DESIGN.md)：Node/Topic/Reply、可变独占container、legacy/v2 profile、用途澄清门、固定开源候选和zero-route验证；
- [Public Technical Discussions Channel Pack](./platform-packs/PUBLIC_TECHNICAL_DISCUSSION_CHANNEL_PACK_DESIGN.md)：Stack Exchange/HN/知乎/V2EX四成员`PublicDiscussion*`来源抽象、mixed representation/container/placement、合同/政策/用途门coverage、动态物化和零写入验证；
- [Reddit Public Discussion Platform Pack](./platform-packs/REDDIT_PUBLIC_DISCUSSION_PLATFORM_PACK_DESIGN.md)：subreddit/post/comment/thread、批准/用途/保留/删除门、官方Devvit边界与零route决定；
- [Product Hunt Product Launch Platform Pack](./platform-packs/PRODUCT_HUNT_PRODUCT_LAUNCH_PLATFORM_PACK_DESIGN.md)：Product Page与launch/Post概念、GraphQL schema/商业批准门、placement历史和人工首发边界；
- [Public Early-Adopter Product Discovery Channel Pack](./platform-packs/PUBLIC_EARLY_ADOPTER_DISCOVERY_CHANNEL_PACK_DESIGN.md)：异构`PublicDiscussion*`/`ProductLaunch*`组合、成员独立coverage、动态物化与no-fallback/no-write验证；
- [BOSS/闲鱼第二轮分流](./platform-packs/BOSS_XIANYU_TRIAGE_2026-08-26.md)：高价值、低自动化可行平台的候选决策；
- [BOSS 直聘招聘需求 Platform Pack](./platform-packs/BOSS_ZHIPIN_RECRUITING_PLATFORM_PACK_DESIGN.md)：`JobPosting*`/`RecruitingEngagement*`概念、现行协议与招聘规则、manual-only零route决定和固定社区自动化风险审计；
- [中国招聘平台 Agent 接入候选分流](./platform-packs/CHINA_RECRUITING_AGENT_SURFACES_TRIAGE_2026-08-26.md)：BOSS、猎聘与智联的官方机器接入证据、用途边界和下一平台选择；
- [猎聘 Agent 招聘 Platform Pack](./platform-packs/LIEPIN_AGENT_RECRUITING_PLATFORM_PACK_DESIGN.md)：B-H-C角色、官方用户Agent/CLI候选、CIL产品声明与contract分层、个人数据/副作用隔离和zero-route验证；
- [闲鱼 Platform Pack](./platform-packs/XIANYU_PLATFORM_PACK_DESIGN.md)：manual baseline、partner-only route 和 rejected automation 并存的受限型 Pack；
- [eBay Marketplace Platform Pack](./platform-packs/EBAY_MARKETPLACE_PLATFORM_PACK_DESIGN.md)：Browse与owned seller对象链、production/书面用途门、account deletion、真实offer Probe和固定MCP/SDK审计；
- [Marketplace Offer Discovery & Truthful Probe Channel Pack](./platform-packs/MARKETPLACE_OFFER_DISCOVERY_CHANNEL_PACK_DESIGN.md)：`MarketplaceOffer*`/`MarketplaceOutcome*`、成员独立rights/coverage、受限materialization与真实可履约Probe验证。
- [服务采购 / 自由职业市场候选分流](./platform-packs/SERVICE_WORK_MARKETPLACE_TRIAGE_2026-08-26.md)：Upwork/Freelancer.com/Fiverr的信号价值、正式接入证据与风险排序；
- [Upwork Service Work Platform Pack](./platform-packs/UPWORK_SERVICE_WORK_PLATFORM_PACK_DESIGN.md)：`ServiceRequest*`/`ServiceEngagement*`、官方MCP/API即时任务边界、durable用途阻断、固定SDK/MCP审计与真实hire/pay Probe。
- [Freelancer.com Service Work Platform Pack](./platform-packs/FREELANCER_COM_SERVICE_WORK_PLATFORM_PACK_DESIGN.md)：REST API 0.1、OAuth/sandbox、Project/Contest/Bid/Milestone语义、书面许可/storage gate与固定SDK/MCP审计；
- [Service Work Demand & Truthful Procurement Probe Channel Pack](./platform-packs/SERVICE_WORK_DEMAND_CHANNEL_PACK_DESIGN.md)：Upwork/Freelancer.com/猪八戒三成员共同request/engagement表示、成员独立许可/coverage、零成员materialization与真实采购Probe验证。
- [本地服务 / 反向需求市场候选分流](./platform-packs/LOCAL_SERVICE_REVERSE_MARKETPLACE_TRIAGE_2026-08-26.md)：Taskrabbit/Thumbtack/猪八戒/Bark/58的authority population、官方接入与用途排序；
- [Taskrabbit Partner Home Services Platform Pack](./platform-packs/TASKRABBIT_PARTNER_HOME_SERVICES_PLATFORM_PACK_DESIGN.md)：OpenAPI `2025-12`、partner checkout/fulfillment概念、auth/schema冲突、AUP/AI gate、signed webhook与真实预约Probe边界；
- [Thumbtack Partner Platform Pack](./platform-packs/THUMBTACK_PARTNER_PLATFORM_PACK_DESIGN.md)：Marketplace/Pro双表面、Search/Request/Negotiation分离、external LLM disclosure、Business-owned leads、消息/状态效果、API Data用途与删除门；
- [猪八戒开放平台服务交易 Platform Pack](./platform-packs/ZBJ_OPEN_PLATFORM_SERVICE_WORK_PACK_DESIGN.md)：known Task与provider-participated population、比稿/计件/招标/众包交易链、OAuth/HTTP/schema/SDK drift、逐应用用途与立即删除门；
- [Local Service Intent & Truthful Fulfillment Probe Channel Pack](./platform-packs/LOCAL_SERVICE_INTENT_FULFILLMENT_CHANNEL_PACK_DESIGN.md)：Taskrabbit/Thumbtack的location-first intent、供给搜索/Request/Lead/checkout/履约分层、成员独立coverage、zero-member materialization与逐effect真实Probe；
- [Greenhouse Job Board Platform Pack](./platform-packs/GREENHOUSE_JOB_BOARD_PLATFORM_PACK_DESIGN.md)：board-scoped public GET 与明确拒绝 application write；
- [Lever Postings Platform Pack](./platform-packs/LEVER_POSTINGS_PLATFORM_PACK_DESIGN.md)：site/region-scoped public v0 与 authenticated v1 隔离；
- [Public ATS Channel Pack](./platform-packs/PUBLIC_ATS_CHANNEL_PACK_DESIGN.md)：两个独立成员 Pack 的 roster、projection、coverage 与组合验证。
- [SAM.gov Opportunities Platform Pack](./platform-packs/SAM_GOV_OPPORTUNITIES_PLATFORM_PACK_DESIGN.md)：public-key read、latest-only history、文档 manifest 与明确拒绝采购写入；
- [EU TED Published Notices Platform Pack](./platform-packs/EU_TED_PLATFORM_PACK_DESIGN.md)：anonymous Search v3、notice/procedure/lot/change ontology 与官方公告格式；
- [Public Procurement Channel Pack v0](./platform-packs/PUBLIC_PROCUREMENT_CHANNEL_PACK_DESIGN.md)：已 supersede 的两成员历史设计，保留 query portfolio、stage-aware projection、双重历史与文档治理证据；
- [CCGP 公共公告 Platform Pack](./platform-packs/CCGP_PUBLIC_PROCUREMENT_PLATFORM_PACK_DESIGN.md)：官方 schema evidence、manual-first public notice 与明确 deferred automation；
- [UK Find a Tender Platform Pack](./platform-packs/UK_FIND_A_TENDER_PLATFORM_PACK_DESIGN.md)：OGL/OCDS public API、release/record 与 Procurement Act notice sequence；
- [Public Procurement Channel Pack v0.2](./platform-packs/PUBLIC_PROCUREMENT_CHANNEL_PACK_V0_2_DESIGN.md)：四成员 ChannelScope、mixed maturity coverage 与 representation-aware projection。
- [Public Procurement v0.3 Expansion Triage](./platform-packs/PUBLIC_PROCUREMENT_V0_3_EXPANSION_TRIAGE_2026-08-26.md)：USAspending、Canada、Prozorro入选，AusTender/PNCP access-gated，固定OSS与采购兑现链选择；
- [USAspending Award & Transaction](./platform-packs/USASPENDING_AWARD_TRANSACTION_PLATFORM_PACK_DESIGN.md)、[Canada Proactive Contracts](./platform-packs/CANADA_PROACTIVE_CONTRACTS_PLATFORM_PACK_DESIGN.md)、[Prozorro/OpenProcurement](./platform-packs/PROZORRO_OPENPROCUREMENT_PLATFORM_PACK_DESIGN.md)：逐成员award/transaction/subaward、contract/amendment/threshold、native feed/change/version边界；
- [Public Procurement Demand & Contract Execution Channel Pack v0.3](./platform-packs/PUBLIC_PROCUREMENT_CHANNEL_PACK_V0_3_DESIGN.md)：七成员`PublicProcurement*`、amount-role/history/mixed-maturity/zero-write组合设计。
- [Public Funding Priorities & Funded R&D Triage](./platform-packs/PUBLIC_FUNDING_PRIORITIES_TRIAGE_2026-08-26.md)：Grants.gov、NIH RePORTER、EU Funding & Tenders/CORDIS与SBIR/STTR的价值、官方接入、Skills/MCP/OSS与成熟度分流；
- [Grants.gov Public Funding Platform Pack](./platform-packs/GRANTS_GOV_PUBLIC_FUNDING_PLATFORM_PACK_DESIGN.md)：legacy/Simpler read surfaces、required attribution、CommonGrants映射与application write隔离；
- [NIH RePORTER Funded Research Platform Pack](./platform-packs/NIH_REPORTER_FUNDED_RESEARCH_PLATFORM_PACK_DESIGN.md)：award/project/support-year、funding amount roles、PI/PO drop、publication linkage与preview/full隔离；
- [EU Funding & CORDIS Platform Pack](./platform-packs/EU_FUNDING_CORDIS_PLATFORM_PACK_DESIGN.md)：Funding & Tenders grant/tender分流、CORDIS API/bulk/linked-data、live/dataset drift与结果材料权利；
- [SBIR/STTR Public Funding Platform Pack](./platform-packs/SBIR_STTR_PUBLIC_FUNDING_PLATFORM_PACK_DESIGN.md)：solicitation/topic/award/company概念、API维护状态、bulk字段与完整性滞后；
- [Public Funding Priorities & Funded R&D Channel Pack](./platform-packs/PUBLIC_FUNDING_PRIORITIES_CHANNEL_PACK_DESIGN.md)：`PublicFunding*`、member/representation/classification/amount-role coverage与zero application effects。
- [Public Rulemaking & Consultation Triage](./platform-packs/PUBLIC_RULEMAKING_CONSULTATION_TRIAGE_2026-08-26.md)：Regulations.gov、Federal Register、EU Have Your Say、GOV.UK与中国司法部的独特信号、official access、Skills/MCP/OSS和concept-vs-route maturity分流；
- [Regulations.gov Public Rulemaking Platform Pack](./platform-packs/REGULATIONS_GOV_PUBLIC_RULEMAKING_PLATFORM_PACK_DESIGN.md)：docket/document/comment、agency fields、5,000 pagination、official MCP与zero Comment API；
- [Federal Register Rulemaking Publication Platform Pack](./platform-packs/FEDERAL_REGISTER_RULEMAKING_PUBLICATION_PLATFORM_PACK_DESIGN.md)：proposal/rule/notice、official-vs-informational status、public inspection与common-origin；
- [EU Have Your Say Consultation Platform Pack](./platform-packs/EU_HAVE_YOUR_SAY_CONSULTATION_PLATFORM_PACK_DESIGN.md)：initiative/publication/feedback/position paper、4/12周、mass campaign与missing official machine contract；
- [GOV.UK Consultations Platform Pack](./platform-packs/GOV_UK_CONSULTATIONS_PLATFORM_PACK_DESIGN.md)：Content API known-path read、same-page lifecycle、OGL与unsupported Search隔离；
- [中国司法部立法意见征集 Platform Pack](./platform-packs/CHINA_MOJ_LEGISLATIVE_CONSULTATION_PLATFORM_PACK_DESIGN.md)：central notice、转载authority、manual relation、结果汇总与zero submit；
- [Public Rulemaking & Consultation Pressure Channel Pack](./platform-packs/PUBLIC_RULEMAKING_CONSULTATION_CHANNEL_PACK_DESIGN.md)：`PublicRulemaking*`、official status/campaign/common-origin/rights coverage与zero comment effects。
- [Public Corporate Disclosures Triage](./platform-packs/PUBLIC_CORPORATE_DISCLOSURES_TRIAGE_2026-08-26.md)：SEC、Companies House、EU ESEF/ESAP、HKEX IIS与CNINFO的组织层信号、official access、Skills/MCP/OSS和concept/format/route maturity分流；
- [SEC EDGAR Corporate Disclosure Platform Pack](./platform-packs/SEC_EDGAR_CORPORATE_DISCLOSURE_PLATFORM_PACK_DESIGN.md)：submissions/archive/XBRL、CIK/accession、fact context、Fair Access与zero filer APIs；
- [UK Companies House Corporate Filing Platform Pack](./platform-packs/UK_COMPANIES_HOUSE_CORPORATE_FILING_PLATFORM_PACK_DESIGN.md)：company/transaction/document、stream timepoint、person pre-gate与zero filing write；
- [EU ESEF / ESAP Corporate Disclosure Platform Pack](./platform-packs/EU_ESEF_ESAP_CORPORATE_DISCLOSURE_PLATFORM_PACK_DESIGN.md)：official ESEF package、taxonomy/language、OAM与2027 public ESAP gate；
- [HKEX Issuer Disclosure Platform Pack](./platform-packs/HKEX_ISSUER_DISCLOSURE_PLATFORM_PACK_DESIGN.md)：licensed IIS v4.7、website mining policy block与community circumvention拒绝；
- [CNINFO Corporate Disclosure Platform Pack](./platform-packs/CNINFO_CORPORATE_DISCLOSURE_PLATFORM_PACK_DESIGN.md)：法定披露authority、missing official machine contract、manual selected-only与internal endpoint拒绝；
- [Public Corporate Disclosures & Investment Priorities Channel Pack](./platform-packs/PUBLIC_CORPORATE_DISCLOSURES_CHANNEL_PACK_DESIGN.md)：`PublicCorporateDisclosure*`、filing/fact/amendment/authority/rights coverage与zero disclosure/trade effects。
- [Public Technical Standards Triage](./platform-packs/PUBLIC_TECHNICAL_STANDARDS_TRIAGE_2026-08-26.md)：IETF、W3C、WHATWG、TC39与OpenJDK的process/native state、official/provider access、Skills/OSS与concept-vs-route成熟度分流；
- [IETF Datatracker / RFC Platform Pack](./platform-packs/IETF_DATATRACKER_RFC_PLATFORM_PACK_DESIGN.md)、[W3C Technical Reports Platform Pack](./platform-packs/W3C_TECHNICAL_REPORTS_PLATFORM_PACK_DESIGN.md)、[WHATWG Living Standards Platform Pack](./platform-packs/WHATWG_LIVING_STANDARDS_PLATFORM_PACK_DESIGN.md)、[TC39 Proposals Platform Pack](./platform-packs/TC39_PROPOSALS_PLATFORM_PACK_DESIGN.md)、[OpenJDK JEP Platform Pack](./platform-packs/OPENJDK_JEP_PLATFORM_PACK_DESIGN.md)：逐成员process、authority、edition/commit、route和rights边界；
- [Public Technical Standards & Compatibility Change Channel Pack](./platform-packs/PUBLIC_TECHNICAL_STANDARDS_CHANNEL_PACK_DESIGN.md)：`PublicTechnicalStandard*`、native lifecycle/normativity/compatibility/provider-source coverage与zero standards-process effects。
- [Public Product Recalls Triage](./platform-packs/PUBLIC_PRODUCT_RECALLS_TRIAGE_2026-08-26.md)：FDA、NHTSA、CPSC、EU Safety Gate与Canada的official access、Skills/OSS、recall-vs-alert与concept-vs-route成熟度分流；
- [FDA openFDA Enforcement](./platform-packs/FDA_OPENFDA_ENFORCEMENT_PLATFORM_PACK_DESIGN.md)、[NHTSA Recalls](./platform-packs/NHTSA_RECALLS_PLATFORM_PACK_DESIGN.md)、[CPSC Recalls](./platform-packs/CPSC_RECALLS_PLATFORM_PACK_DESIGN.md)、[EU Safety Gate](./platform-packs/EU_SAFETY_GATE_PLATFORM_PACK_DESIGN.md)、[Canada Recalls and Safety Alerts](./platform-packs/CANADA_RECALLS_SAFETY_ALERTS_PLATFORM_PACK_DESIGN.md)：逐成员event/campaign/product/action、authority、route与rights边界；
- [Public Product Recalls & Corrective Actions Channel Pack](./platform-packs/PUBLIC_PRODUCT_RECALLS_CHANNEL_PACK_DESIGN.md)：`PublicProductRecall*`、risk/source assertion、mandate/common-origin/coverage与zero recall/report effects。
- [Public Research Literature Triage](./platform-packs/PUBLIC_RESEARCH_LITERATURE_TRIAGE_2026-08-26.md)：Crossref、OpenAlex、PubMed、Europe PMC与arXiv的metadata/content、identity/version、rights、Skills/MCP/OSS和成熟度分流；
- [Crossref Scholarly Metadata](./platform-packs/CROSSREF_SCHOLARLY_METADATA_PLATFORM_PACK_DESIGN.md)、[OpenAlex Scholarly Graph](./platform-packs/OPENALEX_SCHOLARLY_GRAPH_PLATFORM_PACK_DESIGN.md)、[PubMed Biomedical Literature](./platform-packs/PUBMED_BIOMEDICAL_LITERATURE_PLATFORM_PACK_DESIGN.md)、[Europe PMC Literature](./platform-packs/EUROPE_PMC_LITERATURE_PLATFORM_PACK_DESIGN.md)、[arXiv Preprint](./platform-packs/ARXIV_PREPRINT_PLATFORM_PACK_DESIGN.md)：逐成员work/version/record、provider authority、route和content-rights边界；
- [Public Research Literature & Reported Limitations Channel Pack](./platform-packs/PUBLIC_RESEARCH_LITERATURE_CHANNEL_PACK_DESIGN.md)：`PublicResearchLiterature*`、reported limitation/unmet need、common-origin与zero research-platform effects。
- [Public Clinical Study Registries Triage](./platform-packs/PUBLIC_CLINICAL_STUDY_REGISTRIES_TRIAGE_2026-08-26.md)：ClinicalTrials.gov、WHO ICTRP、ISRCTN、EU CTIS与DRKS的prospective registry value、official access、rights、Skills/MCP/OSS与成熟度分流；
- [ClinicalTrials.gov](./platform-packs/CLINICALTRIALS_GOV_STUDY_REGISTRY_PLATFORM_PACK_DESIGN.md)、[WHO ICTRP](./platform-packs/WHO_ICTRP_CLINICAL_STUDY_PLATFORM_PACK_DESIGN.md)、[ISRCTN](./platform-packs/ISRCTN_STUDY_REGISTRY_PLATFORM_PACK_DESIGN.md)、[EU CTIS](./platform-packs/EU_CTIS_CLINICAL_TRIAL_PLATFORM_PACK_DESIGN.md)、[DRKS](./platform-packs/DRKS_CLINICAL_STUDY_REGISTRY_PLATFORM_PACK_DESIGN.md)：逐成员study/protocol/record/status/results、authority、route与rights边界；
- [Public Clinical Study Registries & Reported Constraints Channel Pack](./platform-packs/PUBLIC_CLINICAL_STUDY_REGISTRIES_CHANNEL_PACK_DESIGN.md)：`PublicClinicalStudy*`、registry-declared activity/reported constraints、common-origin与zero registry/medical effects。
- [Public Medicine Supply Shortages Triage](./platform-packs/PUBLIC_MEDICINE_SUPPLY_SHORTAGES_TRIAGE_2026-08-26.md)：FDA、Canada、EMA、TGA与UK DHSC的shortage-vs-recall、record-vs-aggregate、public-read-vs-restricted-report、Skills/MCP/OSS和成熟度分流；
- [FDA Drug Shortages](./platform-packs/FDA_DRUG_SHORTAGES_PLATFORM_PACK_DESIGN.md)、[Health Product Shortages Canada](./platform-packs/HEALTH_PRODUCT_SHORTAGES_CANADA_PLATFORM_PACK_DESIGN.md)、[EMA Medicine Shortages](./platform-packs/EMA_MEDICINE_SHORTAGES_PLATFORM_PACK_DESIGN.md)、[TGA Medicine Shortage Reports](./platform-packs/TGA_MEDICINE_SHORTAGE_REPORTS_PLATFORM_PACK_DESIGN.md)、[UK DHSC Supply Statistics](./platform-packs/UK_DHSC_MEDICINE_SUPPLY_STATISTICS_PLATFORM_PACK_DESIGN.md)：逐成员product/presentation、native state、authority、route、aggregate和rights边界；
- [Public Medicine Supply Shortages & Availability Constraints Channel Pack](./platform-packs/PUBLIC_MEDICINE_SUPPLY_SHORTAGES_CHANNEL_PACK_DESIGN.md)：`PublicMedicineSupply*`、reported constraint/mitigation、common-origin/denominator与zero regulatory/medical effects。
- [Public Regulatory Enforcement Triage](./platform-packs/PUBLIC_REGULATORY_ENFORCEMENT_TRIAGE_2026-08-26.md)：监管执法相对patent/public litigation的选择、五成员official surface、Skills/MCP/OSS与concept-vs-route成熟度分流；
- [EPA ECHO Enforcement Cases](./platform-packs/EPA_ECHO_ENFORCEMENT_CASES_PLATFORM_PACK_DESIGN.md)、[CFPB Enforcement Actions](./platform-packs/CFPB_ENFORCEMENT_ACTIONS_PLATFORM_PACK_DESIGN.md)、[FTC Cases & Proceedings](./platform-packs/FTC_CASES_PROCEEDINGS_PLATFORM_PACK_DESIGN.md)、[SEC Enforcement Proceedings](./platform-packs/SEC_ENFORCEMENT_PROCEEDINGS_PLATFORM_PACK_DESIGN.md)、[UK CMA Cases](./platform-packs/UK_CMA_CASES_PLATFORM_PACK_DESIGN.md)：逐成员case/proceeding/assertion/instrument、authority、route/feed、rights与privacy边界；
- [Public Regulatory Enforcement & Remedial Obligations Channel Pack](./platform-packs/PUBLIC_REGULATORY_ENFORCEMENT_CHANNEL_PACK_DESIGN.md)：`PublicRegulatoryEnforcement*`、posture/finality/obligation/common-origin与zero filing/contact effects。
- [Public Ombudsman Determinations Triage](./platform-packs/PUBLIC_OMBUDSMAN_DETERMINATIONS_TRIAGE_2026-08-26.md)：申诉专员裁决相对patent/public litigation的选择、四成员official surface、OSS发现缺口与concept-vs-route成熟度分流；
- [UK FOS Decisions](./platform-packs/UK_FINANCIAL_OMBUDSMAN_DECISIONS_PLATFORM_PACK_DESIGN.md)、[UK Pensions Ombudsman Decisions](./platform-packs/UK_PENSIONS_OMBUDSMAN_DECISIONS_PLATFORM_PACK_DESIGN.md)、[Ireland FSPO Decisions](./platform-packs/IRELAND_FSPO_DECISIONS_PLATFORM_PACK_DESIGN.md)、[UK Housing Ombudsman Decisions](./platform-packs/UK_HOUSING_OMBUDSMAN_DECISIONS_PLATFORM_PACK_DESIGN.md)：逐成员stage/outcome/binding/remedy/appeal、route、publication与privacy边界；
- [Public Ombudsman Determinations & Reported Remedies Channel Pack](./platform-packs/PUBLIC_OMBUDSMAN_DETERMINATIONS_CHANNEL_PACK_DESIGN.md)：`PublicDisputeDecision*`、publication denominator/common-origin、complainant drop与zero procedural effects。
- [Public Audit Findings Triage](./platform-packs/PUBLIC_AUDIT_FINDINGS_RECOMMENDATIONS_TRIAGE_2026-08-26.md)：公共审计相对patent/public litigation的选择、五成员official surface、Skills/MCP/OSS与concept-vs-route成熟度分流；
- [US GAO Audit Reports](./platform-packs/US_GAO_AUDIT_REPORTS_RECOMMENDATIONS_PLATFORM_PACK_DESIGN.md)、[UK NAO Reports](./platform-packs/UK_NAO_REPORTS_RECOMMENDATIONS_PLATFORM_PACK_DESIGN.md)、[ECA Reports & Open Data](./platform-packs/EU_ECA_AUDIT_REPORTS_OPEN_DATA_PLATFORM_PACK_DESIGN.md)、[Australia ANAO Performance Audits](./platform-packs/AUSTRALIA_ANAO_PERFORMANCE_AUDITS_PLATFORM_PACK_DESIGN.md)、[Canada OAG Performance Audits](./platform-packs/CANADA_OAG_PERFORMANCE_AUDITS_PLATFORM_PACK_DESIGN.md)：逐成员scope/method、finding/recommendation、response/implementation authority、route、rights与coverage边界；
- [Public Audit Findings, Recommendations & Follow-up Channel Pack](./platform-packs/PUBLIC_AUDIT_FINDINGS_RECOMMENDATIONS_CHANNEL_PACK_DESIGN.md)：`PublicAuditFinding*`、selected denominator/common-origin、natural-person drop与zero audit-process effects。
- [Public Civic Service Requests Triage](./platform-packs/PUBLIC_CIVIC_SERVICE_REQUESTS_TRIAGE_2026-08-26.md)：公共311相对预算/专利的选择、四成员official dataset、Open311、Skills/MCP/OSS与concept-vs-route成熟度分流；
- [NYC 311](./platform-packs/NYC_311_SERVICE_REQUESTS_PLATFORM_PACK_DESIGN.md)、[SF311](./platform-packs/SF_311_CASES_PLATFORM_PACK_DESIGN.md)、[Austin 3-1-1](./platform-packs/AUSTIN_311_PUBLIC_DATA_PLATFORM_PACK_DESIGN.md)、[311 Toronto](./platform-packs/TORONTO_311_SERVICE_REQUESTS_PLATFORM_PACK_DESIGN.md)：逐成员population/origin/status/disposition、partition、duplicate、location/privacy、route与rights边界；
- [Public Civic Service Requests & Reported Dispositions Channel Pack](./platform-packs/PUBLIC_CIVIC_SERVICE_REQUESTS_CHANNEL_PACK_DESIGN.md)：`PublicCivicServiceRequest*`、request-vs-incident、closed-vs-resolved、coarse location与zero report effects。
- [Public Petitions Triage](./platform-packs/PUBLIC_PETITIONS_SUPPORT_RESPONSES_TRIAGE_2026-08-26.md)：公共请愿相对预算/专利的选择、四成员official process、GDS source、Skills/MCP/OSS与concept-vs-route成熟度分流；
- [UK Parliament Petitions](./platform-packs/UK_PARLIAMENT_PETITIONS_PLATFORM_PACK_DESIGN.md)、[Scottish Parliament Petitions](./platform-packs/SCOTTISH_PARLIAMENT_PETITIONS_PLATFORM_PACK_DESIGN.md)、[Senedd Petitions](./platform-packs/SENEDD_PETITIONS_PLATFORM_PACK_DESIGN.md)、[European Parliament Petitions](./platform-packs/EUROPEAN_PARLIAMENT_PETITIONS_PLATFORM_PACK_DESIGN.md)：逐成员process/threshold/counting/response/language/privacy与route边界；
- [Public Petitions, Support & Official Responses Channel Pack](./platform-packs/PUBLIC_PETITIONS_SUPPORT_RESPONSES_CHANNEL_PACK_DESIGN.md)：`PublicPetition*`、mutable support、threshold-to-action gap、identity drop与zero political-participation effects。
- [Public Participatory Budgeting Triage](./platform-packs/PUBLIC_PARTICIPATORY_BUDGETING_TRIAGE_2026-08-26.md)：四成员official process/data/provider-source、Skills/MCP/OSS与concept/provider-schema/route/manual成熟度分流；
- [Barcelona](./platform-packs/BARCELONA_PARTICIPATORY_BUDGETS_PLATFORM_PACK_DESIGN.md)、[Madrid](./platform-packs/MADRID_PARTICIPATORY_BUDGETS_PLATFORM_PACK_DESIGN.md)、[Paris](./platform-packs/PARIS_PARTICIPATORY_BUDGET_PLATFORM_PACK_DESIGN.md)、[NYC Participatory Budgeting](./platform-packs/NYC_PARTICIPATORY_BUDGETING_PLATFORM_PACK_DESIGN.md)：逐成员process/round、measure/rules、amount/status、route/history/privacy边界；
- [Public Participatory Budgeting Channel Pack](./platform-packs/PUBLIC_PARTICIPATORY_BUDGETING_CHANNEL_PACK_DESIGN.md)：`PublicParticipatoryBudget*`、stage/population/amount-role coverage、dynamic views与zero political-budget effects。
- [Public Information Access Requests Triage](./platform-packs/PUBLIC_INFORMATION_ACCESS_REQUESTS_TRIAGE_2026-08-26.md)：四成员official process/API/source/privacy、Skills/MCP/OSS与concept/provider-source/route/manual成熟度分流；
- [WhatDoTheyKnow](./platform-packs/WHATDOTHEYKNOW_INFORMATION_ACCESS_PLATFORM_PACK_DESIGN.md)、[MuckRock](./platform-packs/MUCKROCK_PUBLIC_RECORDS_PLATFORM_PACK_DESIGN.md)、[FragDenStaat](./platform-packs/FRAGDENSTAAT_INFORMATION_ACCESS_PLATFORM_PACK_DESIGN.md)、[AskTheEU](./platform-packs/ASKTHEEU_ACCESS_TO_DOCUMENTS_PLATFORM_PACK_DESIGN.md)：逐成员deployment/law/body roster、message/status/deadline/fee/withholding/release/review、visibility/privacy/rights与route边界；
- [Public Information Access Requests, Public-Body Responses & Releases Channel Pack](./platform-packs/PUBLIC_INFORMATION_ACCESS_REQUESTS_CHANNEL_PACK_DESIGN.md)：`PublicInformationAccess*`、classification authority、release/review lineage、identity/embargo drop、dynamic views与zero formal-request effects。
- [Public Planning Applications & Decisions Triage](./platform-packs/PUBLIC_PLANNING_APPLICATIONS_DECISIONS_TRIAGE_2026-08-26.md)：四成员official process/dataset/schema/privacy、Skills/MCP/OSS与concept/catalogue/route/manual成熟度分流；
- [England Planning Data](./platform-packs/ENGLAND_PLANNING_DATA_APPLICATIONS_PLATFORM_PACK_DESIGN.md)、[NSW Planning Portal](./platform-packs/NSW_PLANNING_PORTAL_DEVELOPMENT_APPLICATIONS_PLATFORM_PACK_DESIGN.md)、[NYC ZAP](./platform-packs/NYC_ZAP_LAND_USE_APPLICATIONS_PLATFORM_PACK_DESIGN.md)、[Ireland NPAD](./platform-packs/IRELAND_NATIONAL_PLANNING_APPLICATIONS_PLATFORM_PACK_DESIGN.md)：逐成员process/authority/application/exhibition/representation/decision/spatial/privacy/rights与route边界；
- [Public Planning Applications, Representations & Decisions Channel Pack](./platform-packs/PUBLIC_PLANNING_APPLICATIONS_REPRESENTATIONS_DECISIONS_CHANNEL_PACK_DESIGN.md)：`PublicPlanningApplication*`、authority/stage/posture/finality、dynamic views与zero formal-planning effects。
- [Public Building Regulation Triage](./platform-packs/PUBLIC_BUILDING_REGULATION_TRIAGE_2026-08-26.md)：四成员official dataset/package/process/API/privacy、Skill/MCP/OSS与route/restricted-schema/manual成熟度分流；
- [NYC DOB](./platform-packs/NYC_DOB_BUILDING_REGULATION_PLATFORM_PACK_DESIGN.md)、[Chicago](./platform-packs/CHICAGO_BUILDING_PERMITS_VIOLATIONS_PLATFORM_PACK_DESIGN.md)、[Toronto](./platform-packs/TORONTO_BUILDING_PERMITS_PLATFORM_PACK_DESIGN.md)、[NSW Post-Consent](./platform-packs/NSW_POST_CONSENT_CERTIFICATES_PLATFORM_PACK_DESIGN.md)：逐成员permit/inspection/finding/certificate、population/history/location/privacy/rights与route边界；
- [Public Building Permits, Inspections, Certificates & Enforcement Channel Pack](./platform-packs/PUBLIC_BUILDING_PERMITS_INSPECTIONS_CERTIFICATES_ENFORCEMENT_CHANNEL_PACK_DESIGN.md)：`PublicBuildingRegulation*`、正交posture、dynamic views与zero building-regulation effects。
- [Public Regulated Licenses Triage](./platform-packs/PUBLIC_REGULATED_LICENSES_INSPECTIONS_DISCIPLINE_TRIAGE_2026-08-26.md)：四成员official dataset/file/register/contract、Skill/MCP/OSS与route/restricted-contract/manual成熟度分流；
- [NYC DCWP](./platform-packs/NYC_DCWP_REGULATED_BUSINESS_LICENSE_PLATFORM_PACK_DESIGN.md)、[Chicago BACP](./platform-packs/CHICAGO_BUSINESS_LICENSE_PLATFORM_PACK_DESIGN.md)、[California DCA](./platform-packs/CALIFORNIA_DCA_PROFESSIONAL_LICENSE_PLATFORM_PACK_DESIGN.md)、[Ahpra](./platform-packs/AHPRA_PRACTITIONER_REGISTER_PLATFORM_PACK_DESIGN.md)：逐成员subject/license/standing/inspection/discipline/publication/privacy/rights与route边界；
- [Public Regulated Licenses, Inspections & Discipline Channel Pack](./platform-packs/PUBLIC_REGULATED_LICENSES_INSPECTIONS_DISCIPLINE_CHANNEL_PACK_DESIGN.md)：`PublicRegulatedLicense*`、七类evidence、dynamic views与zero licensing effects。
- [Public Environmental Regulation Triage](./platform-packs/PUBLIC_ENVIRONMENTAL_PERMITS_MONITORING_COMPLIANCE_TRIAGE_2026-08-26.md)：四成员official service/API/bulk/register、Skill/MCP/OSS、rights与machine/manual成熟度分流；
- [US EPA ECHO](./platform-packs/US_EPA_ECHO_NPDES_PLATFORM_PACK_DESIGN.md)、[England EA](./platform-packs/ENGLAND_ENVIRONMENT_AGENCY_PUBLIC_REGISTERS_PLATFORM_PACK_DESIGN.md)、[EU/EEA](./platform-packs/EU_INDUSTRIAL_EMISSIONS_PORTAL_PLATFORM_PACK_DESIGN.md)、[NSW EPA](./platform-packs/NSW_EPA_POEO_PUBLIC_REGISTER_PLATFORM_PACK_DESIGN.md)：逐成员permit/limit/measurement/release/compliance、coverage、known alert/process migration、privacy/rights与route边界；
- [Public Environmental Permits, Monitoring & Compliance Channel Pack](./platform-packs/PUBLIC_ENVIRONMENTAL_PERMITS_MONITORING_COMPLIANCE_CHANNEL_PACK_DESIGN.md)：`PublicEnvironmentalRegulation*`、九类evidence、comparability gate、dynamic views与zero environmental-regulation effects。
- [Public Contaminated Sites Triage](./platform-packs/PUBLIC_CONTAMINATED_SITES_REMEDIATION_TRIAGE_2026-08-26.md)：四成员official search/file/register、Skill/MCP/OSS、federated coverage与machine/manual成熟度分流；
- [US EPA Superfund](./platform-packs/US_EPA_SUPERFUND_SEMS_PLATFORM_PACK_DESIGN.md)、[Canada FCSI/FCSAP](./platform-packs/CANADA_FCSI_FCSAP_PLATFORM_PACK_DESIGN.md)、[England Part 2A](./platform-packs/ENGLAND_PART_2A_CONTAMINATED_LAND_PLATFORM_PACK_DESIGN.md)、[NSW CLM](./platform-packs/NSW_CONTAMINATED_LAND_RECORD_PLATFORM_PACK_DESIGN.md)：逐成员population/process/boundary、designation/responsibility/remedy/control/cost、privacy/rights与route边界；
- [Public Contaminated Sites, Responsibility & Remediation Channel Pack](./platform-packs/PUBLIC_CONTAMINATED_SITES_REMEDIATION_CHANNEL_PACK_DESIGN.md)：`PublicContaminationRemediation*`、十一类evidence、dynamic views、field-drop与zero contamination-process effects。
- [Public Drinking Water Safety Triage](./platform-packs/PUBLIC_DRINKING_WATER_SAFETY_ADVISORIES_TRIAGE_2026-08-26.md)：四成员official bulk/report/register/advisory surface、Skill/MCP/OSS、security/privacy与machine/manual成熟度分流；
- [US EPA SDWIS](./platform-packs/US_EPA_SDWIS_ECHO_PLATFORM_PACK_DESIGN.md)、[DWI](./platform-packs/ENGLAND_DWI_DRINKING_WATER_PLATFORM_PACK_DESIGN.md)、[Canada ISC](./platform-packs/CANADA_FIRST_NATIONS_DRINKING_WATER_ADVISORIES_PLATFORM_PACK_DESIGN.md)、[Taumata Arowai](./platform-packs/NEW_ZEALAND_TAUMATA_AROWAI_DRINKING_WATER_PLATFORM_PACK_DESIGN.md)：逐成员population/supply/stage/standard、violation/event/advisory/lift authority、route、coverage与rights边界；
- [Public Drinking Water Safety, Compliance & Advisories Channel Pack](./platform-packs/PUBLIC_DRINKING_WATER_SAFETY_ADVISORIES_CHANNEL_PACK_DESIGN.md)：`PublicDrinkingWaterSafety*`、十二类evidence、dynamic views、critical-infrastructure drop与zero public-health effects。
- [Public Ambient Air Quality & Advisories Triage](./platform-packs/PUBLIC_AMBIENT_AIR_QUALITY_ADVISORIES_TRIAGE_2026-08-26.md)：四成员official observation/index/forecast/alert surface、固定OSS/Skill/MCP、质量状态与route成熟度分流；
- [US EPA AirNow/AQS](./platform-packs/US_EPA_AIRNOW_AQS_PLATFORM_PACK_DESIGN.md)、[UK Defra](./platform-packs/UK_DEFRA_AMBIENT_AIR_PLATFORM_PACK_DESIGN.md)、[EEA](./platform-packs/EEA_AMBIENT_AIR_PLATFORM_PACK_DESIGN.md)、[Canada ECCC](./platform-packs/CANADA_ECCC_AQHI_ALERTS_PLATFORM_PACK_DESIGN.md)：逐成员network/station/area/grid、method/quality/index/forecast/alert authority、coverage与rights边界；
- [Public Ambient Air Quality, Health Advisories & Pollution Events Channel Pack](./platform-packs/PUBLIC_AMBIENT_AIR_QUALITY_ADVISORIES_CHANNEL_PACK_DESIGN.md)：`PublicAmbientAirQuality*`、十二类evidence、dynamic views、cross-index隔离与zero alert/public-health effects。
- [Public Food Safety Inspections & Outbreaks Triage](./platform-packs/PUBLIC_FOOD_SAFETY_INSPECTIONS_OUTBREAKS_TRIAGE_2026-08-26.md)：四成员official inspection/rating/closure/outbreak surface、固定OSS/Skill/MCP、history/denominator/rights与route成熟度分流；
- [NYC DOHMH](./platform-packs/NYC_DOHMH_RESTAURANT_INSPECTIONS_PLATFORM_PACK_DESIGN.md)、[UK FSA](./platform-packs/UK_FSA_FHRS_FHIS_PLATFORM_PACK_DESIGN.md)、[Toronto DineSafe](./platform-packs/TORONTO_DINESAFE_FOOD_PREMISES_PLATFORM_PACK_DESIGN.md)、[CDC NORS](./platform-packs/CDC_NORS_FOODBORNE_OUTBREAKS_PLATFORM_PACK_DESIGN.md)：逐成员establishment/inspection/violation/rating/enforcement/closure/correction/outbreak/etiology/vehicle、coverage与rights边界；
- [Public Food Safety Inspections, Outbreaks, Closures & Reopening Channel Pack](./platform-packs/PUBLIC_FOOD_SAFETY_INSPECTIONS_OUTBREAKS_CHANNEL_PACK_DESIGN.md)：`PublicFoodSafety*`、十二类evidence、dynamic views、cross-scheme隔离与zero inspection/public-health effects。
- [Public Transit Service Reliability & Accessibility Triage](./platform-packs/PUBLIC_TRANSIT_SERVICE_RELIABILITY_ACCESSIBILITY_TRIAGE_2026-08-26.md)：四成员official schedule/realtime/alert/facility/history surface、固定OSS/Skill/MCP、freshness/identity/rights与route成熟度分流；
- [NYC MTA](./platform-packs/NYC_MTA_TRANSIT_SERVICE_PLATFORM_PACK_DESIGN.md)、[TfL](./platform-packs/TFL_UNIFIED_TRANSIT_STATUS_ACCESSIBILITY_PLATFORM_PACK_DESIGN.md)、[MBTA](./platform-packs/MBTA_V3_LAMP_TRANSIT_PERFORMANCE_PLATFORM_PACK_DESIGN.md)、[Transport for NSW](./platform-packs/TRANSPORT_FOR_NSW_GTFS_REALTIME_PLATFORM_PACK_DESIGN.md)：逐成员agency/operator/mode/feed、schedule/realtime/alert/facility/accessibility/performance、coverage与rights边界；
- [Public Transit Service Reliability, Disruptions & Accessibility Channel Pack](./platform-packs/PUBLIC_TRANSIT_SERVICE_RELIABILITY_ACCESSIBILITY_CHANNEL_PACK_DESIGN.md)：`PublicTransitService*`、十二类evidence、dynamic views、cross-metric隔离与zero operational effects。
- [Public Road Safety Crashes, Casualties & Hazardous Locations Triage](./platform-packs/PUBLIC_ROAD_SAFETY_CRASH_CASUALTY_HAZARD_TRIAGE_2026-08-26.md)：四成员official crash/unit/person/casualty/release/aggregate surface、固定OSS/Skill/MCP、population/severity/exposure/privacy与route成熟度分流；
- [NHTSA FARS](./platform-packs/NHTSA_FARS_ROAD_SAFETY_PLATFORM_PACK_DESIGN.md)、[NYC MVC](./platform-packs/NYC_MOTOR_VEHICLE_COLLISIONS_ROAD_SAFETY_PLATFORM_PACK_DESIGN.md)、[UK DfT STATS19](./platform-packs/UK_DFT_STATS19_ROAD_SAFETY_PLATFORM_PACK_DESIGN.md)、[Transport for NSW](./platform-packs/TRANSPORT_FOR_NSW_CRASH_DATA_ROAD_SAFETY_PLATFORM_PACK_DESIGN.md)：逐成员population/release/table-grain/severity/factor/location/exposure、coverage与rights边界；
- [Public Road Safety Crashes, Casualties & Hazardous Locations Channel Pack](./platform-packs/PUBLIC_ROAD_SAFETY_CRASH_CASUALTY_HAZARD_CHANNEL_PACK_DESIGN.md)：`RoadSafety*`、十二类evidence、release/severity/exposure隔离、hotspot candidate与zero public-safety effects。
- [Public Consumer Prices, Inflation & Affordability Triage](./platform-packs/PUBLIC_CONSUMER_PRICE_INFLATION_AFFORDABILITY_TRIAGE_2026-08-26.md)：四成员official index/weight/average/quote surface、固定OSS/MCP/Skill、rebase/revision/availability/affordability与route成熟度分流；
- [U.S. BLS CPI](./platform-packs/US_BLS_CPI_PUBLIC_DATA_PLATFORM_PACK_DESIGN.md)、[UK ONS Consumer Prices](./platform-packs/UK_ONS_CONSUMER_PRICE_INFLATION_PLATFORM_PACK_DESIGN.md)、[Eurostat HICP](./platform-packs/EUROSTAT_HICP_PLATFORM_PACK_DESIGN.md)、[Statistics Canada CPI/WDS](./platform-packs/STATISTICS_CANADA_CPI_WDS_PLATFORM_PACK_DESIGN.md)：逐成员program/population/product/measure/period/release、coverage与rights边界；
- [Public Consumer Prices, Inflation & Affordability Channel Pack](./platform-packs/PUBLIC_CONSUMER_PRICE_INFLATION_AFFORDABILITY_CHANNEL_PACK_DESIGN.md)：`PublicConsumerPrice*`、十二类evidence、quote/average/weight/index隔离、denominator-gated affordability与zero statistical-platform effects。
- [Public Rental Housing Cost, Vacancy & Burden Triage](./platform-packs/PUBLIC_RENTAL_HOUSING_COST_VACANCY_BURDEN_TRIAGE_2026-08-26.md)：四成员official program/API/dataset/workbook/methodology surface、固定OSS/MCP/Skill、rent-basis/population/burden/quality与route成熟度分流；
- [U.S. Census ACS](./platform-packs/US_CENSUS_ACS_RENTAL_HOUSING_COST_PLATFORM_PACK_DESIGN.md)、[UK ONS PIPR](./platform-packs/UK_ONS_PIPR_RENTAL_PRICE_PLATFORM_PACK_DESIGN.md)、[Eurostat EU-SILC](./platform-packs/EUROSTAT_EU_SILC_HOUSING_COST_BURDEN_PLATFORM_PACK_DESIGN.md)、[Canada CMHC RMS](./platform-packs/CANADA_CMHC_RENTAL_MARKET_SURVEY_PLATFORM_PACK_DESIGN.md)：逐成员program/population/tenure、rent level/index、vacancy/turnover/burden、quality/revision、coverage与rights边界；
- [Public Rental Housing Cost, Vacancy & Burden Channel Pack](./platform-packs/PUBLIC_RENTAL_HOUSING_COST_VACANCY_BURDEN_CHANNEL_PACK_DESIGN.md)：`PublicRentalHousing*`、十三类evidence、rent-basis/population/period/quality隔离、dynamic views与zero statistical/housing-platform effects。
- [Public Labor Demand, Vacancies & Turnover Statistics Triage](./platform-packs/PUBLIC_LABOR_DEMAND_VACANCIES_TURNOVER_TRIAGE_2026-08-26.md)：四成员official survey/API/SDMX/workbook/methodology surface、固定OSS/MCP/Skill、stock/flow/denominator/adjustment/quality与route成熟度分流；
- [U.S. BLS JOLTS](./platform-packs/US_BLS_JOLTS_LABOR_DEMAND_PLATFORM_PACK_DESIGN.md)、[UK ONS Vacancy Survey](./platform-packs/UK_ONS_VACANCY_SURVEY_PLATFORM_PACK_DESIGN.md)、[Eurostat JVS](./platform-packs/EUROSTAT_JOB_VACANCY_STATISTICS_PLATFORM_PACK_DESIGN.md)、[Statistics Canada JVWS](./platform-packs/STATISTICS_CANADA_JVWS_PLATFORM_PACK_DESIGN.md)：逐成员program/population/statistical-unit/vacancy-definition、stock/denominator/rate/flow/wage、quality/revision、coverage与rights边界；
- [Public Labor Demand, Vacancies & Turnover Statistics Channel Pack](./platform-packs/PUBLIC_LABOR_DEMAND_VACANCIES_TURNOVER_CHANNEL_PACK_DESIGN.md)：`PublicLaborDemand*`、十四类evidence、posting/statistical-vacancy、stock/flow、denominator/adjustment/classification隔离、dynamic views与zero survey/employer effects。
- [公共企业形成、人口学与存续统计候选分流](./platform-packs/PUBLIC_BUSINESS_FORMATION_DEMOGRAPHY_SURVIVAL_TRIAGE_2026-08-26.md)：Census BFS/BDS、ONS、Eurostat、StatCan的population/lifecycle增量、official route、Agent surface、Skill/MCP/OSS与风险排序；
- [U.S. Census](./platform-packs/US_CENSUS_BFS_BDS_BUSINESS_DEMOGRAPHY_PLATFORM_PACK_DESIGN.md)、[UK ONS](./platform-packs/UK_ONS_BUSINESS_DEMOGRAPHY_PLATFORM_PACK_DESIGN.md)、[Eurostat](./platform-packs/EUROSTAT_BUSINESS_DEMOGRAPHY_PLATFORM_PACK_DESIGN.md)、[Statistics Canada](./platform-packs/STATISTICS_CANADA_MBOC_PLATFORM_PACK_DESIGN.md)成员Platform Packs；
- [Public Business Formation, Demography & Survival Channel Pack](./platform-packs/PUBLIC_BUSINESS_FORMATION_DEMOGRAPHY_SURVIVAL_CHANNEL_PACK_DESIGN.md)：`PublicBusinessDemography*`、十六类evidence、application/lifecycle/cohort/estimate/denominator隔离、dynamic views与zero registration/business effects。
- [公共企业破产、清算与重组统计候选分流](./platform-packs/PUBLIC_BUSINESS_INSOLVENCY_RESTRUCTURING_TRIAGE_2026-08-26.md)：U.S. Courts、UK Insolvency Service、Eurostat与Canada OSB的procedure/population增量、official route、Agent/MCP/SDK/Skill候选与风险排序；
- [U.S. Courts Bankruptcy Caseload Platform Pack](./platform-packs/US_COURTS_BANKRUPTCY_CASELOAD_PLATFORM_PACK_DESIGN.md)：F/F-2/F-5A、business/nonbusiness、chapter/window/case flow与PACER隔离；
- [UK Insolvency Service Company & Business Insolvency Platform Pack](./platform-packs/UK_INSOLVENCY_SERVICE_COMPANY_BUSINESS_INSOLVENCY_PLATFORM_PACK_DESIGN.md)：registered company/IDBR business、procedure、denominator、matching、seasonal与revision隔离；
- [Eurostat Quarterly Bankruptcy Declarations Platform Pack](./platform-packs/EUROSTAT_QUARTERLY_BANKRUPTCY_DECLARATIONS_PLATFORM_PACK_DESIGN.md)：`sts_rb_q`、legal-unit declaration、index/base/weight/SA与annual death隔离；
- [Canada OSB Business Insolvency, Receivership & CCAA Platform Pack](./platform-packs/CANADA_OSB_BUSINESS_INSOLVENCY_CCAA_PLATFORM_PACK_DESIGN.md)：BIA business/consumer、bankruptcy/proposal、receivership/CCAA、rate与financial aggregate隔离；
- [Public Business Insolvency, Liquidation & Restructuring Statistics Channel Pack](./platform-packs/PUBLIC_BUSINESS_INSOLVENCY_LIQUIDATION_RESTRUCTURING_CHANNEL_PACK_DESIGN.md)：`PublicBusinessInsolvency*`、十五类evidence、procedure/event/denominator/outcome隔离、dynamic views与zero legal/account effects。
- [公共企业信贷需求与融资条件候选分流](./platform-packs/PUBLIC_BUSINESS_CREDIT_CONDITIONS_TRIAGE_2026-08-26.md)：Fed/ECB/BoE/BoC的survey/panel/question/sign/weight增量、official route、Agent/MCP/SDK/Skill候选与风险排序；
- [U.S. Federal Reserve SLOOS Platform Pack](./platform-packs/US_FEDERAL_RESERVE_SLOOS_PLATFORM_PACK_DESIGN.md)：standards/terms/demand、domestic/foreign panel、special question、DDP/FRED迁移隔离；
- [ECB Bank Lending Survey Platform Pack](./platform-packs/ECB_BANK_LENDING_SURVEY_PLATFORM_PACK_DESIGN.md)：question、net percentage/diffusion index、two-step weighting、past/expected与SDMX `BLS`隔离；
- [Bank of England Credit Conditions Survey Platform Pack](./platform-packs/BANK_OF_ENGLAND_CREDIT_CONDITIONS_SURVEY_PLATFORM_PACK_DESIGN.md)：market-share balance、measure-specific sign、annex/questionnaire与rights review；
- [Bank of Canada Senior Loan Officer Survey Platform Pack](./platform-packs/BANK_OF_CANADA_SENIOR_LOAN_OFFICER_SURVEY_PLATFORM_PACK_DESIGN.md)：balance-of-opinion、price/non-price、Valet group与publication continuity隔离；
- [Public Business Credit Demand & Financing Conditions Channel Pack](./platform-packs/PUBLIC_BUSINESS_CREDIT_DEMAND_FINANCING_CONDITIONS_CHANNEL_PACK_DESIGN.md)：`PublicBusinessCredit*`、十六类evidence、question/sign/balance/weight/time隔离、dynamic views与zero financial effects。
- [公共企业经营状况、约束与预期候选分流](./platform-packs/PUBLIC_BUSINESS_CONDITIONS_CONSTRAINTS_EXPECTATIONS_TRIAGE_2026-08-26.md)：BTOS/BICS/EC BCS/CSBC的population/question/scale/time/weight/quality/lifecycle增量、official route、Agent/Skill/MCP/SDK/OSS与风险排序；
- [U.S. Census BTOS Platform Pack](./platform-packs/US_CENSUS_BTOS_PLATFORM_PACK_DESIGN.md)：双周official programme、panel rotation、core/supplement、current/future index、API与XLSX coverage隔离；
- [UK ONS BICS Platform Pack](./platform-packs/UK_ONS_BICS_PLATFORM_PACK_DESIGN.md)：twice-monthly wave、question routing、count/turnover/employment weights、national/subnational与method break隔离；
- [European Commission Business Surveys Platform Pack](./platform-packs/EU_COMMISSION_BUSINESS_CONSUMER_SURVEYS_PLATFORM_PACK_DESIGN.md)：business-sector harmonised survey、balance/composite、country/sector weight、Redisstat transition与SA/NSA隔离；
- [Statistics Canada CSBC Platform Pack](./platform-packs/STATISTICS_CANADA_CSBC_PLATFORM_PACK_DESIGN.md)：quarterly questionnaire、obstacle/most-challenging/impact/duration、liquidity/plan、WDS PID绑定与final programme lifecycle；
- [Public Business Conditions, Constraints & Expectations Channel Pack](./platform-packs/PUBLIC_BUSINESS_CONDITIONS_CONSTRAINTS_EXPECTATIONS_CHANNEL_PACK_DESIGN.md)：`PublicBusinessConditions*`、十九类evidence、respondent/estimate/composite/outturn、scale/weight/time/lifecycle隔离、dynamic views与zero survey/business effects。
- [公共企业数字技术采用候选分流](./platform-packs/PUBLIC_BUSINESS_DIGITAL_TECHNOLOGY_ADOPTION_TRIAGE_2026-08-26.md)：ABS/ONS/Eurostat/SDTIU的能力增量、lifecycle、official route、fixed OSS/MCP/SDK与Skill空缺；
- [U.S. Census / NSF NCSES ABS Digital Technology Adoption Platform Pack](./platform-packs/US_CENSUS_ABS_DIGITAL_TECHNOLOGY_ADOPTION_PLATFORM_PACK_DESIGN.md)：rotating technology module、adoption stage、ABS/BERD与collection/reference-year transition；
- [UK ONS Digital Economy Survey Platform Pack](./platform-packs/UK_ONS_DIGITAL_ECONOMY_SURVEY_PLATFORM_PACK_DESIGN.md)：paused programme、historical workbook、questionnaire/result与mode-break隔离；
- [Eurostat ICT Usage and E-commerce in Enterprises Platform Pack](./platform-packs/EUROSTAT_ICT_USAGE_ENTERPRISES_PLATFORM_PACK_DESIGN.md)：harmonised enterprise ICT、Statistics API/SDMX、country deviation与year-specific DII；
- [Statistics Canada SDTIU Platform Pack](./platform-packs/STATISTICS_CANADA_SDTIU_PLATFORM_PACK_DESIGN.md)：non-use reason、external implementation/financing intent、PID/WDS与population gate；
- [Public Business Digital Technology Adoption, Capability & Barriers Channel Pack](./platform-packs/PUBLIC_BUSINESS_DIGITAL_TECHNOLOGY_ADOPTION_CAPABILITY_BARRIERS_CHANNEL_PACK_DESIGN.md)：`PublicBusinessDigitalAdoption*`、二十二类evidence、dynamic materialization、observability与zero survey/platform effects。
- [公共企业创新活动、约束与协作候选分流](./platform-packs/PUBLIC_BUSINESS_INNOVATION_ACTIVITIES_CONSTRAINTS_COLLABORATION_TRIAGE_2026-08-26.md)：ABS/UKIS/CIS/SIBS的定义、状态、population、route、fixed OSS与Agent Skill空缺；
- [U.S. Census / NSF NCSES ABS Business Innovation Platform Pack](./platform-packs/US_CENSUS_NCSES_ABS_BUSINESS_INNOVATION_PLATFORM_PACK_DESIGN.md)：product/process、activity status、partner/barrier/support和current-questionnaire/result隔离；
- [UK Innovation Survey Platform Pack](./platform-packs/UK_INNOVATION_SURVEY_PLATFORM_PACK_DESIGN.md)：2022–2024 activity、2024 amount、weighted 10+ population与official report/workbook；
- [Eurostat Community Innovation Survey Platform Pack](./platform-packs/EUROSTAT_COMMUNITY_INNOVATION_SURVEY_PLATFORM_PACK_DESIGN.md)：HDC mandatory/optional、enterprise/legal-unit、three-year/single-year与non-panel边界；
- [Statistics Canada SIBS Platform Pack](./platform-packs/STATISTICS_CANADA_SIBS_PLATFORM_PACK_DESIGN.md)：2023–2025 current questionnaire、2020–2022 PIDs、20+/$250k population与WDS fixture；
- [Public Business Innovation Activities, Constraints & Collaboration Channel Pack](./platform-packs/PUBLIC_BUSINESS_INNOVATION_ACTIVITIES_CONSTRAINTS_COLLABORATION_CHANNEL_PACK_DESIGN.md)：`PublicBusinessInnovation*`、二十三类evidence、dynamic views、observability与zero survey/platform effects。
- [公共数字接入、技能与线上参与候选分流](./platform-packs/PUBLIC_DIGITAL_ACCESS_SKILLS_ONLINE_PARTICIPATION_TRIAGE_2026-08-26.md)：NTIA/Ofcom/Eurostat/CIUS的population、question、route、fixed OSS与Agent Skill空缺；
- [U.S. NTIA Internet Use Survey Platform Pack](./platform-packs/US_NTIA_INTERNET_USE_SURVEY_PLATFORM_PACK_DESIGN.md)：CPS household/person、replicate weights、Explorer/table与2025 proposed instrument隔离；
- [UK Ofcom Adults’ Media Literacy Tracker Platform Pack](./platform-packs/UK_OFCOM_ADULTS_MEDIA_LITERACY_PLATFORM_PACK_DESIGN.md)：2026 report/2025 tracker、mode/base、respondent-file拒绝与no-domain-client；
- [Eurostat ICT Usage in Households and by Individuals Platform Pack](./platform-packs/EUROSTAT_ICT_HOUSEHOLDS_INDIVIDUALS_PLATFORM_PACK_DESIGN.md)：`isoc_i` household/person/user、annual modules、skill composite与country quality；
- [Statistics Canada CIUS Platform Pack](./platform-packs/STATISTICS_CANADA_CIUS_PLATFORM_PACK_DESIGN.md)：survey 4432、question IDs、WDS/SDMX PIDs、occasional lifecycle与microdata gate；
- [Public Digital Access, Skills & Online Participation Channel Pack](./platform-packs/PUBLIC_DIGITAL_ACCESS_SKILLS_ONLINE_PARTICIPATION_CHANNEL_PACK_DESIGN.md)：`PublicDigitalAccessParticipation*`、二十四类evidence、aggregate-only materialization、observability与zero survey/platform effects。
- [公共家庭支出、消费与预算配置候选分流](./platform-packs/PUBLIC_HOUSEHOLD_EXPENDITURE_CONSUMPTION_BUDGET_ALLOCATION_TRIAGE_2026-08-26.md)：BLS/ONS/Eurostat/StatsCan的unit、instrument、classification、route、fixed OSS与Agent Skill空缺；
- [U.S. BLS Consumer Expenditure Surveys Platform Pack](./platform-packs/US_BLS_CONSUMER_EXPENDITURE_SURVEYS_PLATFORM_PACK_DESIGN.md)：consumer unit、Interview/Diary/integrated、table statistic与PUMD gate；
- [UK ONS Family Spending / LCF Platform Pack](./platform-packs/UK_ONS_FAMILY_SPENDING_LCF_PLATFORM_PACK_DESIGN.md)：FYE、COICOP、nominal/real、workbook/correction与small-sample quality；
- [Eurostat Household Budget Survey Platform Pack](./platform-packs/EUROSTAT_HOUSEHOLD_BUDGET_SURVEY_PLATFORM_PACK_DESIGN.md)：2020 wave/2026 transition、country method、ECOICOP与HBS/HFCE隔离；
- [Statistics Canada Survey of Household Spending Platform Pack](./platform-packs/STATISTICS_CANADA_SURVEY_HOUSEHOLD_SPENDING_PLATFORM_PACK_DESIGN.md)：questionnaire/diary weights、window/annualisation、PID/WDS与2025 questionnaire-only；
- [Public Household Expenditure, Consumption & Budget Allocation Channel Pack](./platform-packs/PUBLIC_HOUSEHOLD_EXPENDITURE_CONSUMPTION_BUDGET_ALLOCATION_CHANNEL_PACK_DESIGN.md)：`PublicHouseholdExpenditure*`、二十二类evidence、aggregate-only materialization、observability与zero survey/platform effects。
- [公共时间使用、照护、流动与日常活动配置候选分流](./platform-packs/PUBLIC_TIME_USE_CARE_MOBILITY_DAILY_ACTIVITY_ALLOCATION_TRIAGE_2026-08-26.md)：ATUS/OTUS/HETUS/StatsCan的diary、activity、denominator、lifecycle、route、fixed OSS与Agent Skill空缺；
- [U.S. BLS American Time Use Survey Platform Pack](./platform-packs/US_BLS_AMERICAN_TIME_USE_SURVEY_PLATFORM_PACK_DESIGN.md)：4 a.m. diary、primary/secondary-childcare、LABSTAT/file与microdata gate；
- [UK ONS Online Time Use Survey Platform Pack](./platform-packs/UK_ONS_ONLINE_TIME_USE_SURVEY_PLATFORM_PACK_DESIGN.md)：weekday/weekend diary、main/secondary、development status、XLSX与collection/result split；
- [Eurostat HETUS Platform Pack](./platform-packs/EUROSTAT_HARMONISED_TIME_USE_SURVEYS_PLATFORM_PACK_DESIGN.md)：round/country、ACL/10-minute slot、indicator/denominator、API与scientific-use gate；
- [Statistics Canada Time Use Survey Platform Pack](./platform-packs/STATISTICS_CANADA_TIME_USE_SURVEY_PLATFORM_PACK_DESIGN.md)：2022 population/diary、PID/WDS、time pressure/satisfaction与PUMF gate；
- [Public Time Use, Care, Mobility & Daily Activity Allocation Channel Pack](./platform-packs/PUBLIC_TIME_USE_CARE_MOBILITY_DAILY_ACTIVITY_ALLOCATION_CHANNEL_PACK_DESIGN.md)：`PublicTimeUse*`、二十四类evidence、aggregate-only materialization、observability与zero survey/platform effects。
- [公共医疗服务可及性候选分流](./platform-packs/PUBLIC_HEALTH_CARE_ACCESS_UNMET_NEED_PATIENT_REPORTED_BARRIERS_TRIAGE_2026-08-26.md)：NHIS/GPPS/EU-SILC/ABS的service、question、denominator、route与fixed OSS；
- [U.S. NCHS NHIS Health-Care Access Platform Pack](./platform-packs/US_NCHS_NHIS_HEALTH_CARE_ACCESS_PLATFORM_PACK_DESIGN.md)：cost-related unmet need、DQS、sample break与microdata gate；
- [England GP Patient Survey Platform Pack](./platform-packs/ENGLAND_GP_PATIENT_SURVEY_PLATFORM_PACK_DESIGN.md)：2024 series、2026 CSV/XLSX、weights/suppression与registered denominator；
- [Eurostat EU-SILC Unmet Health-Care Needs Platform Pack](./platform-packs/EUROSTAT_EU_SILC_UNMET_HEALTH_CARE_NEEDS_PLATFORM_PACK_DESIGN.md)：medical/dental、reason/composite、denominator与SDMX；
- [Australia ABS Patient Experiences Platform Pack](./platform-packs/AUSTRALIA_ABS_PATIENT_EXPERIENCES_PLATFORM_PACK_DESIGN.md)：service cubes、MPHS population、RSE/MOE与coverage break；
- [Public Health-Care Access, Unmet Need & Patient-Reported Barriers Channel Pack](./platform-packs/PUBLIC_HEALTH_CARE_ACCESS_UNMET_NEED_PATIENT_REPORTED_BARRIERS_CHANNEL_PACK_DESIGN.md)：`PublicHealthCareAccess*`、二十四类evidence、aggregate-only与zero health/platform effects。
- [公共家庭能源可负担性、能源不安全与服务连续性候选分流](./platform-packs/PUBLIC_HOUSEHOLD_ENERGY_AFFORDABILITY_INSECURITY_SERVICE_CONTINUITY_TRIAGE_2026-08-26.md)：RECS/LILEE/EU-SILC/AER的authority、indicator、denominator、route与fixed OSS/MCP；
- [U.S. EIA RECS Energy Insecurity Platform Pack](./platform-packs/US_EIA_RECS_ENERGY_INSECURITY_PLATFORM_PACK_DESIGN.md)：2024 preliminary HC、energy-insecurity items、housing-unit denominator与microdata gate；
- [England DESNZ Fuel Poverty Platform Pack](./platform-packs/ENGLAND_DESNZ_FUEL_POVERTY_PLATFORM_PACK_DESIGN.md)：LILEE/FPEER/required bill/gap、final/projection/correction与restricted dataset gate；
- [Eurostat EU-SILC Energy Poverty Platform Pack](./platform-packs/EUROSTAT_EU_SILC_ENERGY_POVERTY_PLATFORM_PACK_DESIGN.md)：warmth/utility arrears、person denominator、SDMX与reuse；
- [Australia AER Retail Energy Performance Platform Pack](./platform-packs/AUSTRALIA_AER_RETAIL_ENERGY_PERFORMANCE_PLATFORM_PACK_DESIGN.md)：debt/hardship/disconnection/reconnection、schedule/guideline与account denominator；
- [Public Household Energy Affordability, Insecurity & Service Continuity Channel Pack](./platform-packs/PUBLIC_HOUSEHOLD_ENERGY_AFFORDABILITY_INSECURITY_SERVICE_CONTINUITY_CHANNEL_PACK_DESIGN.md)：`PublicHouseholdEnergy*`、二十九类evidence、aggregate-only与zero energy/platform effects。
- [Apple App Store Connect Reviews Platform Pack](./platform-packs/APPLE_APP_STORE_CONNECT_REVIEWS_PLATFORM_PACK_DESIGN.md)：owned current written reviews、mutable snapshot 与 deferred public response；
- [Google Play Developer Reviews Platform Pack](./platform-packs/GOOGLE_PLAY_DEVELOPER_REVIEWS_PLATFORM_PACK_DESIGN.md)：recent API 与 monthly authorized export 的双 representation/coverage；
- [Owned App Reviews Channel Pack](./platform-packs/OWNED_APP_REVIEWS_CHANNEL_PACK_DESIGN.md)：自有 app roster、跨店 pain projection、版本回归、身份最小化和只读组合验证。
- [公开扩展市场反馈候选分流](./platform-packs/PUBLIC_EXTENSION_MARKETPLACE_FEEDBACK_TRIAGE_2026-08-26.md)：Mozilla AMO/Chrome Web Store/JetBrains Marketplace的官方公开评论读取面、许可与fallback缺口比较；
- [Mozilla AMO Public Feedback Platform Pack](./platform-packs/MOZILLA_AMO_PUBLIC_FEEDBACK_PLATFORM_PACK_DESIGN.md)：frozen v4 add-on/rating、latest projection、版本/reply关系、CC attribution与PII drop设计；
- [Public Extension Marketplace Feedback Channel Pack](./platform-packs/PUBLIC_EXTENSION_MARKETPLACE_FEEDBACK_CHANNEL_PACK_DESIGN.md)：`ProductFeedback*`、三候选逐成员missing coverage、动态物化与zero-write验证。
- [公开监管投诉与事故报告候选分流](./platform-packs/PUBLIC_REGULATORY_COMPLAINTS_TRIAGE_2026-08-26.md)：NHTSA/CFPB/CPSC的官方API/export、publication drift、PII与人口边界比较；
- [NHTSA Vehicle Safety Complaints Platform Pack](./platform-packs/NHTSA_VEHICLE_SAFETY_COMPLAINTS_PLATFORM_PACK_DESIGN.md)：ODINO/CMPLID root-row、reported impact、2021/2026 schema cutover、PII pre-gate与社区MCP审计；
- [Public Regulatory Complaints Channel Pack](./platform-packs/PUBLIC_REGULATORY_COMPLAINTS_CHANNEL_PACK_DESIGN.md)：`RegulatoryComplaint*`、claim/company/regulator authority、三候选missing/drift coverage与零投诉写入。
- [自有产品可靠性候选分流](./platform-packs/OWNED_PRODUCT_RELIABILITY_TRIAGE_2026-08-26.md)：Sentry/Crashlytics/Datadog的真实失败信号、官方API/export、Skills/MCP、grouping/sampling与诊断隐私边界；
- [Sentry Product Reliability Platform Pack](./platform-packs/SENTRY_PRODUCT_RELIABILITY_PLATFORM_PACK_DESIGN.md)：issue/event/release/environment、API v0、grouping/fingerprint、sampling、PII pre-gate与官方Skills/MCP审计；
- [Firebase Crashlytics Product Reliability Platform Pack](./platform-packs/FIREBASE_CRASHLYTICS_PRODUCT_RELIABILITY_PLATFORM_PACK_DESIGN.md)：v1alpha issue/event/report、BigQuery representation、90日窗口/保留、signals与官方MCP写边界；
- [Owned Product Reliability Channel Pack](./platform-packs/OWNED_PRODUCT_RELIABILITY_CHANNEL_PACK_DESIGN.md)：`ProductReliability*`、两成员独立coverage、动态物化、diagnostic quarantine与zero production test-crash。
- [公开运行状态与事故通告候选分流](./platform-packs/PUBLIC_OPERATIONAL_STATUS_TRIAGE_2026-08-26.md)：Statuspage/Better Stack/Instatus的公开合同、history窗口、publisher truth、Skills/MCP/OSS与管理面隔离；
- [Atlassian Statuspage Public Incidents Platform Pack](./platform-packs/ATLASSIAN_STATUSPAGE_PUBLIC_INCIDENTS_PLATFORM_PACK_DESIGN.md)：page/component/incident/update/maintenance/postmortem、recent-50、impact override与mirror provenance；
- [Better Stack Public Status Platform Pack](./platform-packs/BETTER_STACK_PUBLIC_STATUS_PLATFORM_PACK_DESIGN.md)：公开`/index.json`、manual/automatic report、90-day resource history与官方MCP写边界；
- [Instatus Public Status Summary Platform Pack](./platform-packs/INSTATUS_PUBLIC_STATUS_SUMMARY_PLATFORM_PACK_DESIGN.md)：active-only summary、OpenAPI auth drift、无许可spec与private API fallback拒绝；
- [Public Operational Status Channel Pack](./platform-packs/PUBLIC_OPERATIONAL_STATUS_CHANNEL_PACK_DESIGN.md)：`OperationalStatus*`、三成员独立coverage、publisher/telemetry correlation candidate、HTML quarantine与zero fake incident。
- [公开软件漏洞与已利用风险候选分流](./platform-packs/PUBLIC_SOFTWARE_VULNERABILITY_TRIAGE_2026-08-26.md)：OSV/GitHub/CISA的advisory、range、known-exploitation、source overlap、license与zero scan边界；
- [OSV Public Vulnerability Platform Pack](./platform-packs/OSV_PUBLIC_VULNERABILITY_PLATFORM_PACK_DESIGN.md)：query/querybatch/get、OSV 1.9.0 range/withdrawal、mixed-source license、official scanner/MCP隔离；
- [GitHub Advisory Database Platform Pack](./platform-packs/GITHUB_ADVISORY_DATABASE_PLATFORM_PACK_DESIGN.md)：reviewed/unreviewed/malware population、GHSA/range/CVSS/EPSS、CC-BY与official MCP toolset；
- [CISA KEV Platform Pack](./platform-packs/CISA_KEV_PLATFORM_PACK_DESIGN.md)：catalog snapshot、known exploitation、ransomware Unknown、federal action scope、CC0 mirror与external reference拒绝；
- [Public Software Vulnerability Channel Pack](./platform-packs/PUBLIC_SOFTWARE_VULNERABILITY_CHANNEL_PACK_DESIGN.md)：`SoftwareVulnerability*`、member/authority/common-origin三层coverage、dynamic views与zero PoC/asset/remediation。
- [公开软件包生态与迁移压力候选分流](./platform-packs/PUBLIC_SOFTWARE_PACKAGE_ECOSYSTEM_TRIAGE_2026-08-26.md)：npm/PyPI/crates.io的identity、resolver、lifecycle、usage proxy、Skills/MCP/OSS与zero artifact/write边界；
- [npm Public Package Ecosystem Platform Pack](./platform-packs/NPM_PUBLIC_PACKAGE_ECOSYSTEM_PLATFORM_PACK_DESIGN.md)：packument/version/dist-tag/range deprecation/unpublish/search/download metric与community Skill/MCP隔离；
- [PyPI Public Package Ecosystem Platform Pack](./platform-packs/PYPI_PUBLIC_PACKAGE_ECOSYSTEM_PLATFORM_PACK_DESIGN.md)：project/release/file、Simple/JSON/RSS、yank/delete与BigQuery独立cost/quality gate；
- [crates.io Public Package Ecosystem Platform Pack](./platform-packs/CRATES_IO_PUBLIC_PACKAGE_ECOSYSTEM_PLATFORM_PACK_DESIGN.md)：git/sparse index、version yank、1rps/User-Agent与unstable dump schema边界；
- [Public Software Package Ecosystem Channel Pack](./platform-packs/PUBLIC_SOFTWARE_PACKAGE_ECOSYSTEM_CHANNEL_PACK_DESIGN.md)：`SoftwarePackageEcosystem*`、member/representation/metric coverage、dynamic views与zero install/write验证。
- [公开产品支持论坛基础设施候选分流](./platform-packs/PUBLIC_SUPPORT_FORUM_INFRASTRUCTURE_TRIAGE_2026-08-26.md)：Discourse/NodeBB/Flarum的deployment authority、capability origin、Skills/MCP/OSS与zero auth/write边界；
- [Discourse Public Support Forum Platform Pack](./platform-packs/DISCOURSE_PUBLIC_SUPPORT_FORUM_PLATFORM_PACK_DESIGN.md)：topic/post/search、post stream coverage、Solved范围与官方MCP隔离；
- [NodeBB Public Support Forum Platform Pack](./platform-packs/NODEBB_PUBLIC_SUPPORT_FORUM_PLATFORM_PACK_DESIGN.md)：Read API exact GET allowlist、plugin/permission与v4 federation origin；
- [Flarum Public Support Forum Platform Pack](./platform-packs/FLARUM_PUBLIC_SUPPORT_FORUM_PLATFORM_PACK_DESIGN.md)：1.x/2.x、JSON:API included/pagination与extension-driven schema；
- [Public Product Support Forum Channel Pack](./platform-packs/PUBLIC_SUPPORT_FORUM_CHANNEL_PACK_DESIGN.md)：deployment-aware `PublicDiscussion*`、member/capability/representation coverage、dynamic views与zero forum write验证。
- [Public B2B Software Review Triage](./platform-packs/PUBLIC_B2B_SOFTWARE_REVIEW_TRIAGE_2026-08-26.md)：G2/Capterra/TrustRadius的public/API/export/licensed/intent population、Terms、Skills/MCP/OSS与zero review write分流；
- [G2 B2B Software Review Platform Pack](./platform-packs/G2_B2B_SOFTWARE_REVIEW_PLATFORM_PACK_DESIGN.md)：official API/MCP、OAuth read scope、verification/incentive/switching与Research Board write隔离；
- [Capterra B2B Software Review Platform Pack](./platform-packs/CAPTERRA_B2B_SOFTWARE_REVIEW_PLATFORM_PACK_DESIGN.md)：own-product export、Reviews Insights、licensed comparison与public-web blocked边界；
- [TrustRadius B2B Software Review Platform Pack](./platform-packs/TRUSTRADIUS_B2B_SOFTWARE_REVIEW_PLATFORM_PACK_DESIGN.md)：vendor API、score/TrustQuotes/traffic/intent population和licensed excerpt coverage；
- [Public B2B Software Review Channel Pack](./platform-packs/PUBLIC_B2B_SOFTWARE_REVIEW_CHANNEL_PACK_DESIGN.md)：`ProductFeedback*`、contract/member/population coverage、dynamic views与zero web/write验证。
- [外部搜索需求与趋势候选分流](./platform-packs/EXTERNAL_SEARCH_DEMAND_TRENDS_TRIAGE_2026-08-26.md)：Google Trends/Google Ads/Microsoft Advertising/百度指数的signal、methodology、entitlement、Skills/MCP/OSS与rights比较；
- [Google Trends External Search Demand Platform Pack](./platform-packs/GOOGLE_TRENDS_EXTERNAL_SEARCH_DEMAND_PLATFORM_PACK_DESIGN.md)：alpha consistently-scaled interest与public BigQuery ranked/top-list population分离；
- [Google Ads Keyword Planning Platform Pack](./platform-packs/GOOGLE_ADS_KEYWORD_PLANNING_PLATFORM_PACK_DESIGN.md)：keyword ideas、近似历史量、auction metrics与account/config-dependent forecast分层；
- [Microsoft Advertising Keyword Planning Platform Pack](./platform-packs/MICROSOFT_ADVERTISING_KEYWORD_PLANNING_PLATFORM_PACK_DESIGN.md)：Ad Insight v13、月度量lag/date anchoring、sandbox/production和estimate caveat；
- [百度指数 External Search Demand Platform Pack](./platform-packs/BAIDU_INDEX_EXTERNAL_SEARCH_DEMAND_PLATFORM_PACK_DESIGN.md)：commercial-contract-only/schema-blocked、weighted index与rejected private-route边界；
- [External Search Demand & Trends Channel Pack](./platform-packs/EXTERNAL_SEARCH_DEMAND_TRENDS_CHANNEL_PACK_DESIGN.md)：`ExternalSearchDemand*`、member/representation/methodology coverage、restricted materialization与zero ad/write验证。
- [Business Experience Feedback Triage](./platform-packs/BUSINESS_EXPERIENCE_FEEDBACK_TRIAGE_2026-08-26.md)：Google Business Profile/Places、Yelp、Trustpilot的population、representation、Skills/MCP/OSS与rights分诊；
- [Google Business Profile Experience Feedback Platform Pack](./platform-packs/GOOGLE_BUSINESS_PROFILE_EXPERIENCE_FEEDBACK_PLATFORM_PACK_DESIGN.md)：获授权自有地点、review/reply/aggregate与无sandbox/持久政策边界；
- [Google Places Business Experience Feedback Platform Pack](./platform-packs/GOOGLE_PLACES_BUSINESS_EXPERIENCE_FEEDBACK_PLATFORM_PACK_DESIGN.md)：max-5相关性样本、review summary、署名/display与Maps Content边界；
- [Yelp Business Experience Feedback Platform Pack](./platform-packs/YELP_BUSINESS_EXPERIENCE_FEEDBACK_PLATFORM_PACK_DESIGN.md)：Places节选、AI API/MCP provider answer与普通API AI-use阻断；
- [Trustpilot Business Experience Feedback Platform Pack](./platform-packs/TRUSTPILOT_BUSINESS_EXPERIENCE_FEEDBACK_PLATFORM_PACK_DESIGN.md)：Business Unit、Display/Insights、private字段与deletions sync；
- [Business Experience Feedback Channel Pack](./platform-packs/BUSINESS_EXPERIENCE_FEEDBACK_CHANNEL_PACK_DESIGN.md)：`BusinessExperienceFeedback*`、member/representation/rights/deletion coverage与zero effects。
- [Google Search Console Platform Pack](./platform-packs/GOOGLE_SEARCH_CONSOLE_PLATFORM_PACK_DESIGN.md)：owned property aggregate、top-row/50K/privacy 与 BigQuery representation；
- [Bing Webmaster Tools Platform Pack](./platform-packs/BING_WEBMASTER_TOOLS_PLATFORM_PACK_DESIGN.md)：2026-08-31 protocol cutover、manual degraded path 与 migration-blocked REST；
- [Owned Search Intent Channel Pack](./platform-packs/OWNED_SEARCH_INTENT_CHANNEL_PACK_DESIGN.md)：site roster、aggregate rollup、privacy/coverage 与 mixed-maturity member verification。
- [Algolia Site Search Analytics Platform Pack](./platform-packs/ALGOLIA_SITE_SEARCH_ANALYTICS_PLATFORM_PACK_DESIGN.md)：application/index analytics、total/tracked、zero/null、queryID归因与官方只读MCP边界；
- [Typesense Site Search Analytics Platform Pack](./platform-packs/TYPESENSE_SITE_SEARCH_ANALYTICS_PLATFORM_PACK_DESIGN.md)：v30.2 rule/destination、popular/nohits、4秒typeahead、flush和counter写边界；
- [Owned Site Search Intent Channel Pack](./platform-packs/OWNED_SITE_SEARCH_INTENT_CHANNEL_PACK_DESIGN.md)：站内surface/config/capture/event定义、搜索表示、隐私/coverage、动态物化视图和反误判验证。
- [Canny Product Request Platform Pack](./platform-packs/CANNY_PRODUCT_REQUEST_PLATFORM_PACK_DESIGN.md)：idea/post双representation、vote/status/merge、signed webhook与broad secret key边界；
- [UserVoice Product Request Platform Pack](./platform-packs/USERVOICE_PRODUCT_REQUEST_PLATFORM_PACK_DESIGN.md)：suggestion/support/status/merge、cursor/date/rate与admin credential边界；
- [Owned Product Request Channel Pack](./platform-packs/OWNED_PRODUCT_REQUEST_CHANNEL_PACK_DESIGN.md)：authored/curated/support/admin四层事实、merge lineage、动态物化、隐私/coverage和组合验证。
- [Slack Customer Community Platform Pack](./platform-packs/SLACK_CUSTOMER_COMMUNITY_PLATFORM_PACK_DESIGN.md)：workspace/conversation/thread/message/edit/delete、internal-vs-external deployment、Events回补、官方Skills/MCP与API Terms边界；
- [Discord Customer Community Platform Pack](./platform-packs/DISCORD_CUSTOMER_COMMUNITY_PLATFORM_PACK_DESIGN.md)：guild/channel/forum/thread/message/reference/reaction、permissions/intents/Gateway一致性与policy-blocked用途边界；
- [Authorized Customer Community Channel Pack](./platform-packs/OWNED_CUSTOMER_COMMUNITY_CHANNEL_PACK_DESIGN.md)：三重authority、community definition/message/span、动态物化、隐私/coverage和mixed-policy组合验证。
- [Zendesk Support Platform Pack](./platform-packs/ZENDESK_SUPPORT_PLATFORM_PACK_DESIGN.md)：ticket snapshot、audit/event、comment、`generated_timestamp` 与 deletion/redaction 分层；
- [Intercom Conversations Platform Pack](./platform-packs/INTERCOM_CONVERSATIONS_PLATFORM_PACK_DESIGN.md)：2.16 version pin、search mutation risk、最近 500 parts 与 deleted reconciliation；
- [Owned Customer Support Channel Pack](./platform-packs/OWNED_CUSTOMER_SUPPORT_CHANNEL_PACK_DESIGN.md)：一方客服 roster、共同 pain projection、field-level minimization、处理偏差与删除级联。
- [Salesforce Sales Cloud Platform Pack](./platform-packs/SALESFORCE_SALES_CLOUD_PLATFORM_PACK_DESIGN.md)：REST v67 Opportunity/Stage/History、QueryAll、CDC/MCP 边界和 minimum-access policy；
- [HubSpot CRM Deals Platform Pack](./platform-packs/HUBSPOT_CRM_DEALS_PLATFORM_PACK_DESIGN.md)：2026-03 Search/Deals/Pipelines/Properties/Archived、10K/window 与 MCP tool drift；
- [Owned Sales Decisions Channel Pack](./platform-packs/OWNED_SALES_DECISIONS_CHANNEL_PACK_DESIGN.md)：org/pipeline roster、taxonomy binding、purchase-decision、evidence attribution、currency/history/process bias。
- [Stripe Billing Platform Pack](./platform-packs/STRIPE_BILLING_PLATFORM_PACK_DESIGN.md)：GA API version、Subscription/Invoice/Payment/Refund/Credit/Dispute 分层、event reconciliation 与 read-only 最小数据面；
- [Chargebee Billing Platform Pack](./platform-packs/CHARGEBEE_BILLING_PLATFORM_PACK_DESIGN.md)：API v2/catalog schema、resource version/lookback、transaction/credit note 语义以及 MCP/Agent Skill 权限审计；
- [Owned Subscription Outcomes Channel Pack](./platform-packs/OWNED_SUBSCRIPTION_OUTCOMES_CHANNEL_PACK_DESIGN.md)：fact authority、exact gateway overlap、monetary/data/attribution/coverage policy 和价值兑现证据边界。
- [PostHog Product Analytics Platform Pack](./platform-packs/POSTHOG_PRODUCT_ANALYTICS_PLATFORM_PACK_DESIGN.md)：event/person/group/action/query语义、aggregate query/export边界、identity与instrumentation health及窄read-only数据面；
- [Amplitude Product Analytics Platform Pack](./platform-packs/AMPLITUDE_PRODUCT_ANALYTICS_PLATFORM_PACK_DESIGN.md)：Dashboard/Export/identity/timezone/TTL语义、raw event风险和MCP/Skills权限审计；
- [Owned Product Usage Channel Pack](./platform-packs/OWNED_PRODUCT_USAGE_CHANNEL_PACK_DESIGN.md)：behavior definition/authority、aggregate-first projection、跨平台exact overlap、observed-usage推断边界和组合验证。
- [GrowthBook Product Experiment Platform Pack](./platform-packs/GROWTHBOOK_PRODUCT_EXPERIMENT_PLATFORM_PACK_DESIGN.md)：feature revision/phase/assignment/result snapshot、审批绕过风险、snapshot compute effect与精确stop/rollout语义；
- [LaunchDarkly Experimentation Platform Pack](./platform-packs/LAUNCHDARKLY_EXPERIMENTATION_PLATFORM_PACK_DESIGN.md)：project/environment/flag config/iteration/exposure、API version与deprecated result边界、stop-and-serve语义；
- [Owned Product Experiment Channel Pack](./platform-packs/OWNED_PRODUCT_EXPERIMENT_CHANNEL_PACK_DESIGN.md)：主动产品Probe的phase、assignment/exposure、integrity、exact lifecycle effects、审批/对账和因果晋级门。
- [Formbricks Survey Feedback Platform Pack](./platform-packs/FORMBRICKS_SURVEY_FEEDBACK_PLATFORM_PACK_DESIGN.md)：workspace/survey/question/display/response/recontact、v1/v2 Beta、response pipeline副作用和AGPL/EE边界；
- [Typeform Survey Response Platform Pack](./platform-packs/TYPEFORM_SURVEY_RESPONSE_PLATFORM_PACK_DESIGN.md)：form/field/ref/response/partial/webhook、30分钟pull lag、HMAC/retry/disable与MCP宽权限；
- [Owned Survey Feedback Channel Pack](./platform-packs/OWNED_SURVEY_FEEDBACK_CHANNEL_PACK_DESIGN.md)：instrument/sample/consent/response lifecycle、signed push+pull reconcile、non-response/PII/deletion和组合验证。
- [Zoom Cloud Conversation Platform Pack](./platform-packs/ZOOM_CLOUD_CONVERSATION_PLATFORM_PACK_DESIGN.md)：meeting instance/cloud recording/transcript/consent/smart recording、artifact revision/processing lag和media/bot/write边界；
- [Gong Conversation Intelligence Platform Pack](./platform-packs/GONG_CONVERSATION_INTELLIGENCE_PLATFORM_PACK_DESIGN.md)：call/transcript/topic/tracker/scorecard/summary、private/redaction/retention与官方MCP raw-data边界；
- [Owned Customer Conversation Channel Pack](./platform-packs/OWNED_CUSTOMER_CONVERSATION_CHANNEL_PACK_DESIGN.md)：跨representation exact relation、speaker/role/consent、original-vs-derived、最小span索引与组合验证。
- [Microsoft Teams Conversation Platform Pack](./platform-packs/MICROSOFT_TEAMS_CONVERSATION_PLATFORM_PACK_DESIGN.md)：onlineMeeting/callTranscript/callRecording、v1/beta文档冲突、RSC/tenant speaker policy、notification/delta与storage lifecycle；
- [Owned Customer Conversation Channel Pack v0.1](./platform-packs/OWNED_CUSTOMER_CONVERSATION_CHANNEL_PACK_V0_1_DESIGN.md)：三成员revision、Teams mixed maturity/missing-member、unattributed fallback与新增组合fixtures。
- [Gmail Correspondence Platform Pack](./platform-packs/GMAIL_CORRESPONDENCE_PLATFORM_PACK_DESIGN.md)：message/thread/label/MIME/history/watch、restricted scopes、quoted-body与history reset；
- [Microsoft Graph Mail Correspondence Platform Pack](./platform-packs/MICROSOFT_GRAPH_MAIL_CORRESPONDENCE_PLATFORM_PACK_DESIGN.md)：message/changeKey/conversation/folder delta/subscription、ImmutableId、shared/delegated与Mail MCP宽权限；
- [Owned Customer Correspondence Channel Pack](./platform-packs/OWNED_CUSTOMER_CORRESPONDENCE_CHANNEL_PACK_DESIGN.md)：mailbox-copy identity、authored/quoted/forward分段、metadata-first、跨成员exact relation和动态索引/删除验证。
