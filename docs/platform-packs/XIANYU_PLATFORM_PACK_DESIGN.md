# 闲鱼 Platform Pack 设计样本

状态：`researched` 设计候选；未发布、未登录、未采集、未执行 Probe  
核验日期：2026-08-26  
目标：验证官方通用 API 不完整的平台，如何用 manual baseline、partner-only route 和明确的 adoption rejection 保留需求研究与真实 Probe 价值。

## 1. Pack 摘要

```text
pack ref             goofish-demand-probe/v0-design
platform             goofish-cn
state                researched
knowledge snapshot   proposal only; no committed snapshot ID
verified level       evidence-review design only
callable routes      none
external effects     none
```

这不是“闲鱼已接入”的声明。当前没有 ConnectorInstance、登录态、账号授权、fixture report、sandbox run 或 operational canary。社区项目声称能搜索、发布或收发 IM，只证明实现声称存在，不证明平台授权、稳定性、安全性或本系统可调用。

闲鱼的价值来自交易漏斗而非讨论规模：listing 的描述与定价形成供给假设，收藏/咨询表示进一步兴趣，订单、退款和争议更接近真实支付与履约。但任何单一信号都不能自动解释为需求强度；价格可能是引流价，收藏可能没有购买意愿，咨询也可能是砍价、骚扰或售后。

## 2. 平台边界与账号画像

本 Pack 只覆盖中国大陆闲鱼社区的 `goofish.com`、闲鱼 App 以及当前官方闲鱼小程序开放平台。境外版服务、淘宝通用开放平台能力、特定行业签约方案和未来 Goofish 国际产品应作为独立 platform variant，不继承本 Pack 的验证结果。

需要区分三类 account profile：

| Profile | 说明 | 本 Pack 基线 |
| --- | --- | --- |
| `community-user` | 普通用户在官方 App/网站浏览、发布与交易 | manual observation / manual package |
| `operating-seller` | 经过相应声明或认证的经营性卖家 | manual package；承担卖家和消费者保障义务 |
| `invited-miniapp-partner` | 闲鱼定向邀请、签约主体一致、申请 appKey/权限并在聚石塔部署的服务商 | partner-only；仅声明文档实际证明的订单/授权能力 |

小程序快速接入文档明确说明当前不公开开放申请、只面向定向邀请服务商，并要求企业主体、审批和权限包：[小程序快速接入](https://open.goofish.com/doc/quick-start.html)。因此 `invited-miniapp-partner` 不是普通用户账号的升级选项，也不能成为默认 connector prerequisite。

## 3. Platform Concepts

以下是平台原生概念候选，不是具体商品、用户或订单数据：

| Concept ID | Kind | 稳定身份候选 | 关键语义 |
| --- | --- | --- | --- |
| `goofish.account/v1` | entity | 平台 account ID；只在授权边界内使用 | community user、seller 或 partner operator；默认不建个人画像 |
| `goofish.listing/v1` | entity | item ID | 闲置物品、商品或服务的信息载体；标题、描述、价格和状态均可变化 |
| `goofish.listing-media/v1` | entity | item ID + media position/hash | 图片/视频证据；不能把 CDN URL 当永久身份 |
| `goofish.category/v1` | enumeration/entity | category ID（若界面/授权 API 可得） | 发布与检索分类；可能随规则变化 |
| `goofish.favorite/v1` | event/metric | 仅在授权产品面可见时记录 | 兴趣动作，不等于购买意愿；聚合数与明细是不同权限面 |
| `goofish.conversation/v1` | entity | conversation ID（restricted） | listing 相关或其他交流容器；属于授权/私密数据 |
| `goofish.message/v1` | event/entity | message ID（restricted） | 咨询、议价、交付或售后语境；不得进入公共研究库 |
| `goofish.order/v1` | entity | business order ID | 买卖双方交易关系；状态与金额是敏感业务事实 |
| `goofish.refund/v1` | entity/event | refund/order ID | 逆向交易及其状态，不等于单纯负面反馈 |
| `goofish.delivery/v1` | entity/event | order + delivery ID | 实物或约定服务交付；涉及地址等个人信息时必须剥离 |
| `goofish.review/v1` | entity | review ID（若可得） | 交易后的公开评价；必须与具体交易相关且真实 |
| `goofish.partner-miniapp/v1` | entity | appKey/application ID | 受邀服务商应用，不是通用社区账号 |
| `goofish.authorization-grant/v1` | policy/entity | app + authorized user + scope | OAuth/TOP 权限和过期事实；secret/token 只用 credential ref |
| `goofish.order-event/v1` | event | provider delivery/message ID | partner 订单正向/逆向消息；需去重和对账 |

主要关系：

```text
account ── owns ──> listing ── has ──> listing-media
listing ── classified-by ──> category
account ── favorites ──> listing
conversation ── concerns ──> listing
conversation ── contains ──> message
buyer + seller ── participate-in ──> order ── fulfills-via ──> delivery
order ── may-transition-via ──> refund / order-event
partner-miniapp ── receives ──> authorization-grant
```

### 3.1 不能提前规范化掉的差异

- “闲置物品”“经营性商品”“服务”可能对应不同资格、类目、保障和交付义务；不能统一成无类型的 offer。
- listing 的展示排序由多因素共同决定，搜索位置不是稳定排名事实；官方卖家协议列举价格、活跃度、信用、服务水平、需求偏好等可能因素：[闲鱼社区卖家服务协议](https://terms.alicdn.com/legal-agreement/terms/platform_service/20220929192826912/20220929192826912.html)。
- 询价、议价、订单、付款、交付、退款和评价是不同阶段，不能都折叠成 `engagement` 数量。
- partner 小程序自己的商品目录与 App 内用于拉起订单的通用闲鱼商品不是同一概念；官方 FAQ 要求服务商先在 App 发布通用商品，再用 item ID 拉起创单：[常见问题](https://open.goofish.com/doc/development/other/questions.html)。
- UI 可见字段、当前账号可见字段与官方 partner API 字段必须保留 provenance，不能合并成“闲鱼全量字段”。

## 4. Capability 候选与 adoption decision

能力 ID 是平台无关的 knowledge proposal。`Adoption` 记录本 Pack 是否愿意为目标用途建立 route；它与“平台产品里存在这个动作”是两件事。

| Capability | Subject → Result | 平台产品面 | Adoption | 首版路线 |
| --- | --- | --- | --- | --- |
| `discovery.search.listings/v1` | query → listing refs | 官方 UI 支持关键词搜索/筛选 | `manual-only` | 用户选择结果后导入；不声明自动搜索 |
| `content.read.listing/v1` | listing ref → listing revision | 官方 UI | `manual-only` | manual import；browser-assisted 待专项条款审查 |
| `account.listing.create.owned/v1` | owned offer → listing receipt | 官方 App/UI | `manual-only` | 只生成 truthful package；用户本人发布并回填证据 |
| `feedback.read.owned-listing-funnel/v1` | owned listing → selected funnel observations | 账号可见产品面 | `manual-only` | 用户导出/选择性回填收藏、咨询、订单、退款等，不读取陌生人身份 |
| `engagement.read.owned-conversations/v1` | owned listing/account → restricted conversations | 官方账号产品面 | `deferred` | 未找到稳定官方 export/API；仅允许用户提供去身份化摘要 |
| `commerce.read.owned-orders/v1` | authorized seller/user → orders | partner TOP API | `partner-only` | 只对受邀、获批 profile 研究；普通账号不可继承 |
| `change.receive.owned-order-events/v1` | partner grant → order/refund events | partner message topics | `partner-only` | 需官方审批、验权、去重、retention 和 sandbox |
| `account.message.send/v1` | conversation → outbound message | 官方产品存在；社区 private API 有实现声称 | `rejected` | 不做自动私信、陌生触达或无人值守回复 |
| `account.listing.create.owned/v1` via private mtop/Cookie | payload → listing | 社区非官方实现 | `rejected` | 不注册 delegated/private route |

“manual-only”不是低质量的自动 Connector，而是明确的执行语义：系统可以校验和准备本地 artifact，但平台 effect 由用户在可见界面完成；没有人工 receipt 就只能是 `prepared`，不能记为 `submitted` 或 `confirmed`。

## 5. Access Methods

### 5.1 `goofish-selected-observation/v1`

- mode：`manual-import`
- official：`false`（来源是官方产品面，但导入流程是本系统设计，不是闲鱼机器接口）；
- scope：用户主动选择的公开 listing 或自有账号事实；
- effect：`local-write`；
- requirements：保存 canonical URL、observedAt、可见字段、选择理由和字段 provenance；个人昵称、头像、位置精度和聊天内容默认剥离；
- coverage：`sampled`，且 sampling basis 必须是 `user-selected`，禁止解释为全站趋势。

### 5.2 `goofish-truthful-listing-package/v1`

- mode：`manual-package`
- official：`false`；它只准备供官方 App/UI 使用的本地交接包；
- capability：`account.listing.create.owned/v1`；
- capability outcome effect：`platform-write`；route execution 为 `manual-handoff`，系统自身只允许 preview/prepare 的 `local-write`，但不能因此绕过平台写入批准；
- requirements：自有账号、真实所有权/交付权、真实价格/库存、允许类目、交付与退款方案、一次性批准、内容 hash；
- receipt：必须由用户回填 external URL/ID、发布时间、最终页面截图或等价证据；对账前不得产生成功结论。

### 5.3 `goofish-invited-miniapp-top/v1`

- mode：`official-api`
- official：`true`
- access：`partner/authorized`
- requirements：定向邀请、签约/企业主体一致、appKey、权限审批、聚石塔部署、按用户/卖家角色获取 access token；
- evidenced capabilities：订单创建/查询、授权用户信息的文档化子集，以及正向/逆向交易消息；
- exclusions：没有证据证明它提供全站 listing 搜索、普通账号 listing 自动发布、任意聊天读取或陌生人触达；
- 官方服务端文档要求只申请确定需要的 API，并说明订单相关调用可能分别需要买家或卖家的 access token：[服务端接入](https://open.goofish.com/doc/development/dev/server.html)。

### 5.4 不合格方法

| Method | 状态 | 原因 |
| --- | --- | --- |
| `goofish-private-mtop-cookie/v1` | `rejected` | private endpoint + 长期 Cookie；无官方开放授权证据，权限/风控/schema 漂移不可控 |
| `goofish-headless-dom/v1` | `deferred` | DOM/selector 和风控脆弱；即使可见浏览器也需用途、频率和条款专项审查 |
| `goofish-automated-im/v1` | `rejected` | 私密通信、陌生触达、身份与骚扰风险；不满足当前需求研究最小化原则 |

## 6. Platform Skills

### 6.1 `goofish-pack-research/v1`

- purpose：`research/curate`；
- 输入：官方页面、协议、开放平台文档、待核验 claim 和 artifact revision；
- 输出：带 EvidenceLink、有效期和 rejected claim 的 KnowledgeProposal；
- 允许：只读核验概念、账号类型、partner API、条款和开源项目；
- 禁止：登录闲鱼、导入 Cookie、调用 mtop、安装/运行 MCP 或发布测试商品。

### 6.2 `goofish-selected-demand-observation/v1`

- purpose：`acquire`；
- 输入：用户主动提供的 listing URL/截图/导出 artifact、研究问题和选择理由；
- 输出：`sampled` CoverageAssessment 的 Observation，保留 listing type、price、category、observedAt 和 provenance；
- 允许 capability：`content.read.listing/v1` 的 manual route；
- 禁止：自动搜索、扩展抓取关联用户、恢复被剥离身份、读取聊天或订单。

### 6.3 `goofish-truthful-probe-package/v1`

- purpose：`probe`；
- 输入：获批 ProbePlan、用户自有且可履约的商品/服务事实、价格、图片权利、交付/退款约束；
- 输出：本地 listing package、policy findings、人工发布 checklist 和 receipt form；
- allowed effects：`local-write`；required ports：`probe-validate/probe-preview/probe-prepare`；
- block conditions：虚假商品/库存/身份、无法履约、误导价格、禁售类目、无图片权利、把自动化研究冒充真实交易；
- 禁止：点击发布、导入账号 Cookie、自动回复、自动改价或自动生成虚假成交。

### 6.4 `goofish-conformance/v1`

- purpose：`verify/diagnose`；
- fixture 默认无网络、无账号、无 Cookie；
- 必须验证 manual receipt 状态机、内容 hash、字段最小化、adoption rejection 与 partner profile 隔离；
- live 场景只有用户另行授权后才可生成 plan，且 Skill 自身不得扩大 scope。

## 7. 治理与真实性边界

闲鱼官方用户协议将搜索、发布、交易和交流定义为社区服务，同时要求发布者对信息拥有合法权利，并禁止欺诈、虚假、不准确或误导信息：[闲鱼社区用户服务协议](https://terms.alicdn.com/legal-agreement/terms/suit_bu1_other/suit_bu1_other201708081618_51146.html)。经营性卖家还必须确保商品/服务与实际销售或提供内容相符并履行交易承诺：[闲鱼社区卖家服务协议](https://terms.alicdn.com/legal-agreement/terms/platform_service/20220929192826912/20220929192826912.html)。

本 Pack 因此要求：

- Probe 不是“假装卖东西测点击”，而是对用户确实愿意出售/提供且能履约的 offer 做受控验证；
- 所有订单、付款、交付、退款和争议都是真实义务，不能由 Agent 为实验目的制造；
- 研究默认只保存 listing 级聚合事实；chat、地址、手机号、支付、实名、买家/卖家身份等受限数据不进入普通数仓和索引；
- 自动私信、批量联系、操纵收藏/交易/评价以及虚假库存永远不是该 Pack 的降级 route；
- 协议和社区规则会变动，正式 Probe 前必须重新核验当时类目、卖家、消费者保障和内容规则。

## 8. 开源 Artifact 候选

这里只做 evidence review；所有 revision 于 2026-08-26 通过只读 `git ls-remote <repo> HEAD` 核验，没有 clone、安装或执行代码：

| Artifact / revision | License | 研究价值 | 主要风险与 adoption |
| --- | --- | --- | --- |
| [babachen/xianyu-mcp](https://github.com/babachen/xianyu-mcp) `44cbaa9630ceb03c89dc6101c7a1cbb60543abfa` | Apache-2.0 | Go/Rod/MCP 的登录、search、publish、图片、client token 和超时语义样本 | Cookie/独立浏览器 profile、DOM 和 platform write；README 甚至允许把发布等待超时按成功处理，只能研究 unknown/reconcile 反例，`reference-only` |
| [Tsinglung-Tseng/ali-mcp](https://github.com/Tsinglung-Tseng/ali-mcp) `29d083a80f0b13224ada6831aad125499122990a` | MIT | 浏览器 route、工具注册和 selector drift 样本 | 社区浏览器自动化、页面/风控依赖；不证明官方 access，`reference-only` |
| [fancyboi999/goofish-cli](https://github.com/fancyboi999/goofish-cli) `771382c2ea3fd281b78c015bf2bf8ed68cc873ff` | Apache-2.0 | 单一 registry 生成 CLI/MCP/Skills、写入限流/熔断、命令 taxonomy 和回执研究 | 依赖导入 Cookie、private mtop、WebSocket IM，并暴露 publish/delete/message send；不能进入默认 connector，`reference-only` |

开源许可证只回答代码再利用条件，不回答平台是否允许某个账号、数据或自动化用途。即使未来做 adapter spike，也必须先有新的 access-method/terms review，再固定 source archive digest、SBOM、tool allowlist、secret boundary 和独立 fixture；不能沿用本次 HEAD 观察作为采用授权。

## 9. Verification Plan

### 9.1 evidence-review

| Scenario | 预期 |
| --- | --- |
| 官方协议和产品概念 | 确认 search/browse/favorite/publish/trade/review/message 是产品概念，不推导机器 API |
| 小程序准入与 API | 记录定向邀请、主体、appKey、权限、聚石塔、token 角色和订单 API/message 范围 |
| listing 真实性 | 记录合法权利、真实准确、履约与消费者保障义务 |
| OSS ownership/license/version | 固定 repo、commit、license；区分技术 claim 与平台证据 |
| rejected methods | private mtop、Cookie、auto-IM、unattended publish 必须有拒绝理由和复核日期 |

当前只形成 evidence-reviewed design candidate；没有 evidence content hash、accepted KnowledgeProposal 或 VerificationReport，不能发布为 verified Pack。

### 9.2 static-contract

- platform product capability、AccessMethodDefinition、Adapter route 和 ConnectorInstance 不得互相替代；
- `community-user`、`operating-seller`、`invited-miniapp-partner` 不能共享授权声明；
- manual package route 必须是 `ExecutionManualHandoff` 且不得暴露 `probe-execute` port；capability outcome 仍是 `platform-write`，availability 为 `manual-action-required`；
- receipt 缺失时 ProbeRun 不得越过 `prepared`，人工截图也只能按证据置信度确认；
- search/manual observations 的 CoverageAssessment 固定为 `sampled` 或 `unknown`，不能是 `complete`；
- listing、conversation、order、refund、review 不得合并为一个通用 engagement record；
- private API/Cookie artifacts 的 claimed capability 必须形成 `rejected` adoption decision，不能物化 CapabilityRoute；
- token、Cookie、手机号、地址、昵称、conversation ID 不得进入 canonical ID、log 或 metric dimension。

### 9.3 fixture-conformance

| Fixture | 必须证明 |
| --- | --- |
| 用户选择的同类 listing 集 | 保存选择依据和 `sampled` coverage；不声称市场全量 |
| 同一 listing 多次截图/导入 | 以 item ID/URL + observation time 去重并保留 revision，不覆盖价格历史 |
| 商品/服务/闲置物三类 listing | 保留类型、资格和交付差异；未知时标记 unknown |
| 缺字段/登录后才可见字段 | 保留 field provenance 与 visibility，不用空值推断不存在 |
| listing package preview | 真实性、权利、价格、库存、类目、交付、退款和图片检查完整 |
| package 无人工 receipt | 保持 `prepared/manual-action-required` |
| receipt URL 与最终内容 hash 不一致 | 标记 drift/unknown，要求人工 reconcile |
| 收藏、咨询、订单、退款样本 | 分阶段记录；不得用收藏替代订单或支付 |
| chat/订单含个人字段 | policy blocker 或字段剥离；不可进入普通索引 |
| partner order + refund messages | 不同 topic/schema、delivery 去重、partial/unknown 状态 |
| private mtop/MCP declaration | static evaluator 拒绝生成 callable route |
| 虚假/不可履约 ProbePlan | `FindingBlocker`，不得生成发布交接包 |

### 9.4 sandbox-live

只有用户另行授权且明确测试对象后才可执行：

1. 用户手动选择少量公开 listing，导入最小证据并核对 coverage/provenance；
2. 用户提供一个真实、自有、可履约 offer，系统只生成 preview/package；
3. 用户在自有账号可见界面内自行发布或放弃，随后选择性回填 receipt；
4. 对自有 listing 人工记录少量聚合漏斗信号，不导入陌生用户聊天身份；
5. 若用户确为受邀 partner，另建隔离 plan 验证最小订单 query/message scope、撤权和 token 过期；
6. 全程不运行上述社区项目，不导入浏览器 Cookie，不调用 private mtop，不自动发消息。

### 9.5 operational-canary

- `community-user` manual route 不做无人值守线上 canary；以定期官方文档/协议 hash、fixture replay 和人工 smoke review 替代；
- `invited-miniapp-partner` 只有 sandbox 通过后，才可对自有测试订单设计只读/低影响 canary；
- 监测用户协议、卖家/买家保障规则、小程序准入、API 列表、permission、消息 topic 和 partner 部署要求；
- 监测三个 OSS revision 的 release、license、security 和 tool surface，但发现更新不会自动改变 adoption decision；
- 任一 terms/access drift 会使相关 capability 到期并进入 `reverify/degrade/suspend`，不会自动退回 private API。

## 10. 需求分析与 Probe 解释

推荐 projection：

- offer：listing type、交付物、价格、地区粒度、时效和保障；
- pain：标题/描述中出现的场景、限制、替代方案和人工成本；
- funnel：曝光（若自有且可得）→ 收藏 → 咨询 → 订单 → 支付/交付 → 退款/争议；每一层单独计量；
- competition：相似 listing 的价格带与承诺结构，仅用于方向性研究；
- probe：variant、发布时间、最终 listing hash、人工 receipt、真实履约成本和 guardrail。

禁止推断：

- 人工选择的 listing 样本代表全站供需；
- 排名靠前代表平台背书或稳定高需求；
- 收藏/咨询等于购买；
- 低价代表真实成交价或可持续交付价；
- 昵称、头像、位置或聊天语言可用于跨平台身份归并；
- 没有公开 API 等于可以使用 private API、Cookie 或浏览器规避。

## 11. Pack 晋级缺口

从 `researched` 到 `modeled`：

- 将 concept、capability、access method 和 adoption decision 转成 accepted KnowledgeProposal；
- 为 manual import/package、receipt 和 partner order/message 分配 normative SchemaRef；
- 固定平台 boundary、account profiles、字段分级、retention 和删除规则；
- 生成 evidence hash，并确认最新版社区、卖家、买家保障和小程序规则。

从 `modeled` 到 `verified`：

- 完成无网络 fixture-conformance；
- 证明 manual route 无 `probe-execute` 能力且状态机不会虚报发布成功；
- 经用户另行授权完成最小 manual sandbox；
- partner capability 仅在真实受邀/获批账号存在时单独验证；
- 每项 adoption decision、capability maturity 和 evidence 都有 expiresAt。

本样本不授权这些后续动作。

跨市场组合使用 [Marketplace Offer Discovery & Truthful Probe Channel Pack](./MARKETPLACE_OFFER_DISCOVERY_CHANNEL_PACK_DESIGN.md)。闲鱼记录可投影到共同 `MarketplaceOffer*`/`MarketplaceOutcome*`，但 App listing、partner order、人工receipt和平台原生身份保持独立；不得借用 eBay 的API成熟度、字段、coverage或用途许可。
