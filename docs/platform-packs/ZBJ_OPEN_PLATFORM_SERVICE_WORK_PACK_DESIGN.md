# 猪八戒开放平台服务交易 Platform Pack 设计样本

状态：`researched` 设计候选；未注册开发者、未创建应用、未接受开放平台协议、未取得 App Key/Secret 或 access token、未调用业务 API/测试工具、未读取需求/交易/稿件、未投标/签约/验收/评价  
核验日期：2026-08-26  
目标：固定猪八戒公开交易场、开放平台和授权服务商运营三种不同 population，准确表达需求、比稿/计件/招标/众包、投标/稿件、合同、托管、验收、支付、退款和评价；判断它能否用于需求发现，而不把“所有需求类目”误读成“所有需求实例”。

## 1. Pack 摘要

```text
pack ref             zbj-open-platform-service-work/v0-design
platform             zbj
surface              open-platform-zop-v1
state                researched
knowledge snapshot   proposal only; no committed snapshot ID
verified level       evidence-review design only
callable routes      none
external effects     none
```

猪八戒当前公开 API 目录包含类目、用户、交易、工具市场、店铺、服务、评价、需求和工作台 API。需求 API 只有一个 `zbj.task.getDetailById`：必须提供已知 `taskId`，没有需求 search/list。可分页枚举的高价值接口是 `querySellerList`、`queryParticipatedPieceWorks` 和 `queryParticipatedCrowdsourcings`，它们都要求授权用户 `openid`，且语义是“服务商参与的交易/需求”。因此官方 route 只可能覆盖 authorized-provider participation population，不能表示公开交易大厅或全市场需求。

开放平台协议进一步规定：收集用户数据前须告知目的、范围和方式并取得同意；只获取应用运行所必需的数据；特定应用取得的数据只能用于该应用，不得转移或作应用外用途；必须提供修改/删除方式；用户退订或停止使用时立即删除；未经书面批准不得保存或使用开放平台运营数据。长期跨用户需求数仓、Dolt、索引、RAG/AI 和派生数据集因此默认 `policy-blocked`。

## 2. 平台面与 authority population

| Profile | 真实 population | 当前决定 |
| --- | --- | --- |
| `public-transaction-hall` | 雇主公开发布、尚未被某服务商参与的需求与当前 placement | `no-official-list-route`；开放目录未提供 search/list，禁止网页/cookie/private endpoint补位 |
| `public-demand-taxonomy` | 基础类目、需求类目、类目扩展属性与导购类目 | `app-authorized-taxonomy-candidate`；`getCategoryPubAll`只返回需求类目，不是需求实例 |
| `known-task-detail` | 一个已知 taskId 的需求详情 | `app-authorized-object-read/deferred`；需证明 taskId 来源、用户权限与应用用途，不可枚举猜测ID |
| `provider-participated-trades` | exact OAuth openid 对应服务商已参与的交易、计件、众包 | `provider-owned-read-candidate`；可分页、按状态/时间过滤，但不是全市场或未参与商机 |
| `provider-contract-outcome` | 该服务商交易的合同、验收、支付、退款和雇主评价 | `provider-owned-read-candidate`；按 task/work exact relation 读取，金额与状态不可互换 |
| `provider-supply-operations` | 自有店铺、服务、案例、上/下架、入驻类目 | `out-of-demand/deferred`；属于供给运营，不作为需求证据 |
| `provider-transaction-effects` | 投标/交稿、签署合同、申请验收、修改金额、放弃/拒绝、评价解释 | `rejected-default/deferred-high-impact`；可能扣推广金、提交知识成果、形成合同或资金流程 |
| `full-time-or-flexible-recruitment` | 招聘职位、兼职招募/雇佣 | `out-of-pack`；应进入Job/ATS或单独灵活用工 Pack，不能与项目外包交易静默合并 |
| `durable-demand-research` | Observation、数仓、全文/semantic/vector index、RAG/training/eval | `policy-blocked`；需平台书面批准与逐应用用户授权、用途、保留/删除证据 |

开发者、应用、App Key/Secret、OAuth resource owner、openid、主/子账号、雇主、服务商、店铺与 transaction principal 都是不同 authority。一个用户授权某应用不授权另一个应用；服务商授权也不等于雇主或全市场授权。

## 3. Platform Concepts

| Concept ID | Kind | 稳定身份候选 | 关键语义 |
| --- | --- | --- | --- |
| `zbj.developer/v1` | restricted principal | developer account + agreement revision | 通过申请/验证的开放平台开发者，不自动拥有用户数据权限 |
| `zbj.application/v1` | access principal | App Key + app label/permission revision | 自用或他用型应用；App Secret只停在credential边界 |
| `zbj.open-user/v1` | OAuth principal | application + openid | 用户对特定应用授权后的opaque identity；不可跨应用合并 |
| `zbj.employer/v1` | demand actor | scoped openid/user ref | 发布需求或购买服务的用户；昵称不是可靠跨平台身份 |
| `zbj.provider/v1` | supply actor | scoped openid/user/shop ref | 参与外包、卖服务或承接兼职的服务商；Pack只覆盖其项目服务交易角色 |
| `zbj.demand-category/v1` | provider taxonomy | category ID + revision | 需求类目及扩展属性；taxonomy completeness不等于需求population coverage |
| `zbj.task/v1` | client-authored request | taskId + observed revision | 需求/任务；title、content、mode、预算、托管、地区、时间、附件和里程节点按权限隔离 |
| `zbj.task-mode/v1` | provider taxonomy | rules/API revision + native code | 比稿、计件、招标、众包、服务购买、雇佣等；current rules与旧API code需version-aware mapping |
| `zbj.provider-participation/v1` | provider-scoped relation | openid + taskId + activeTime/revision | 服务商已参与需求的事实；不能证明公开大厅完整性或独立需求仍open |
| `zbj.bid-or-work/v1` | proposal/submission | taskId + worksId + revision | 招标报价、比稿/众包稿件或计件作品；必须由native mode确定角色 |
| `zbj.agreement/v1` | binding contract | agreementId + taskId + worksId + version | 买卖双方协议、附加协议和工期阶段；双方同意状态与时间分开 |
| `zbj.escrow/v1` | protected funding claim | taskId + amount revision | `hostedAmount`是托管金额，不是已支付给服务商的款项 |
| `zbj.acceptance-request/v1` | provider effect | taskId + workId + attempt/receipt | 服务商以金额和理由向雇主发起验收申请；不是验收通过或支付 |
| `zbj.acceptance-outcome/v1` | employer decision | task/work + revision | 雇主是否同意验收及拒绝理由；应与completion/payment分离 |
| `zbj.payment-state/v1` | financial evidence | taskId + revision | 需求金额、托管金额和分期支付列表；三种amount role不可互换 |
| `zbj.refund/v1` | financial reversal | refund/order/task ref + revision | 全额/部分退款及交易结束状态；不是负payment |
| `zbj.evaluation/v1` | feedback | evaluationId + task/work + revision | 雇主评价/服务商评价或解释；评分、正文、印象标签与订单金额受限 |

主要对象链：

```text
demand category
  -> employer Task / requirement
  -> provider participation
  -> proposal or Work/manuscript
  -> selection / award
  -> Agreement + optional staged terms
  -> delivery / acceptance request
  -> employer acceptance or refusal
  -> escrow release / installment payment
  -> refund / dispute / evaluation
```

不同交易模式不能压成同一漏斗：

- 比稿是一个需求面向多个服务商征集初稿，再选一个或多个中标；
- 多人计件是多个合格稿件分别获付；
- 招标是服务商提交报价/解决方案后由雇主选择；
- catalog service purchase 从服务商供给项开始，不证明公开client-authored request；
- direct hire 从雇主选定服务商开始；
- 旧 API 的 `taskMode` code 与当前规则的中文模式仅在同一证据版本内映射，冲突时保留native value并fail closed。

## 4. Capability 与 adoption decision

| Capability | 官方面 | Adoption | 设计边界 |
| --- | --- | --- | --- |
| `taxonomy.read.zbj-demand-categories/v1` | category APIs | `app-authorized/deferred` | 类目与扩展属性作为平台知识；不得输出需求数、热度或市场机会 |
| `service-work.search.public-requests/v1` | 官方目录无search/list | `rejected` | 不使用网页、cookie、ID scan、private API、browser automation或community scraper |
| `service-work.read.known-request/v1` | `zbj.task.getDetailById` | `app-authorized/deferred` | 只读authorized/known taskId；taskId provenance与access denial可审计；附件默认不下载 |
| `service-work.list.owned-participated-requests/v1` | seller/participated list APIs | `provider-authorized/deferred` | exact openid、page/time/state/mode coverage；不得命名为all market demand |
| `service-work.read.owned-contract-outcome/v1` | agreement、acceptance、pay、refund、evaluation APIs | `provider-authorized/deferred` | task/work ownership校验；contract/escrow/acceptance/payment/refund/feedback exact relation |
| `service-work.submit.bid-or-manuscript/v1` | uploadManuscript + bidWork | `rejected-default/deferred-high-impact` | 提交知识成果/版权价格且可能收费；禁止自动投标、模板稿、免费劳动或批量交稿 |
| `service-work.sign.contract/v1` | `zbj.trade.agree` | `deferred-binding` | 法律/商业承诺；独立人工确认、exact agreement revision、receipt/reconcile |
| `service-work.request.acceptance/v1` | `noticeBuyerPay` | `deferred-financial-effect` | 申请金额和理由影响验收/付款；不是只读completion signal |
| `service-work.manage.transaction/v1` | edit amount、give up、refuse、evaluate/interpret | `deferred-per-effect` | 每个效果独立capability，timeout先reconcile，不以generic trade.write暴露 |
| `research.materialize.zbj-market-demand/v1` | 协议未覆盖当前用途 | `policy-blocked` | zero cross-user/cross-app dataset、durable history、index/vector、RAG/training/eval |

## 5. Access Methods

### 5.1 `zbj-zop-router-v1/v1`

- 所有 API 通过统一 `http://openapi.zbj.com/router`，公共参数包含 appKey、accessToken、method、`v=1.0`、format、locale、13位 timestamp和40字符sign；
- 当前文档仍只展示 HTTP 而非 HTTPS。凭据和用户数据不可通过明文传输；在官方提供并书面确认 TLS endpoint 前，任何 route 均为 `transport-security-blocked`；
- API目录将方法标为基础/增值，但应用权限文档又明确“所有API均需要授权后调用”；基础仅表示无需额外申请，不代表匿名/public；
- 文档存在 schema/示例漂移，例如需求详情 API 名称为 `zbj.task.getDetailById`，Java示例却传 `zbj.trade.getDetailById`。必须由隔离conformance固定，不能猜测；
- 没有发现官方OpenAPI/JSON Schema、分页统一contract、webhook/event目录或独立sandbox host。

### 5.2 `zbj-oauth2-authorization-code/v1`

- current portal发布的文档采用OAuth2 authorization code，要求Web Server保管应用secret；
- scope格式为`API方法名-版本号`，空格分隔；支持`all`，但Connector resolver必须拒绝broad-all并请求exact methods；
- access token默认7天；工具市场应用token时长可等同购买时长，且此场景不支持普通refresh流程；
- state被文档列为推荐而非必需，但本系统必须强制使用并绑定session/redirect；
- openid只在应用授权域内稳定；redirect、code、token、refresh token与secret不进入日志、snapshot或Git；
- OAuth文档更新时间为2018-02-28，只支持PC端的陈述、HTTP endpoints、TTL和refresh行为均需当前conformance重新确认。

### 5.3 `zbj-app-permission-and-quota/v1`

- 应用标签决定权限类目，每个 API 属于某个权限类目；当前页面未给出可机器固定的app-label→exact-method完整矩阵；
- 文档宣称上线前5000次/日、上线后50000次/日，但更新时间为2016-10-14，只能作为stale evidence，不可作为当前budget；
- 创建应用、测试、发布和工具市场购买是不同状态；“API测试工具”不证明存在隔离sandbox或synthetic data。

### 5.4 `zbj-official-java-sdk-2.x/v1`

- 官方 SDK 下载页更新时间2017-05-26，提供zip名`SDK_JAVA_2.3.6_2017052617.zip`；
- 同一页Maven示例却是`com.zbj.zop:openapi-java-sdk:2.3.2`，版本不一致；
- 页面未提供source repository、license、checksum、signature、SBOM或security/support policy；
- current decision：`official-artifact-unverified/do-not-install`。只有固定来源、hash、license、依赖和源码审计后才可作为未来adapter参考，且SDK不授予数据用途。

### 5.5 manual / browser / MCP / Skill

公开交易大厅只允许用户选中task的manual evidence review候选，不允许自动search/list或批量导入。当前未发现猪八戒官方MCP Server、Agent Skill、CLI或官方GitHub SDK repository，也未找到值得候选的维护中第三方connector。搜索结果中的browser定时访问/反爬方案仅作为拒绝证据，不安装执行。

## 6. Platform Skills

### `zbj-pack-research/v1`

- 固定API group/method目录、detail schema、wiki document id/updateTime、开放平台协议、现行平台/交易/投标/比稿规则与SDK metadata；
- 输出exact population、concept/capability revision、rights decision、transport/schema gap、expiry与drift trigger；
- 禁止登录、接受协议、注册开发者、创建应用、下载/安装SDK或调用测试/业务API。

### `zbj-access-resolution/v1`

- 输入：developer legal principal、app/type/label、exact methods/scopes、OAuth openid/role、purpose、user disclosure/consent、data classes、storage/AI/index/derivative、retention/deletion、transport endpoint与environment；
- `scope=all`、HTTP-only、permission matrix缺失、用户/应用用途不匹配或书面保存权缺失时返回blocked；
- credential/network/PortBinding之前完成，不允许先授权再判断用途。

### `zbj-owned-participation-research/v1`

- 只列举exact authorized provider已参与的交易；固定mode/state/bidState/time/page filters、total/totalPage与observedAt；
- 需求详情只能由列表/用户选择产生的known taskId读取，禁止顺序ID扫描；
- employer nickname、正文、地区、附件、稿件、合同、评价和金额默认restricted，不进入通用模型/索引；
- 输出coverage必须为`provider-participated`，不得改写为public market、all opportunities或current open demand。

### `zbj-truthful-service-procurement-probe/v1`

- 只面向真实、合法、具备预算与履约意图的项目；
- 禁止“试流程/测试”、广告引流、联系方式、重复需求、虚假交易、刷单、学术作弊、批量模板稿或无关稿件；官方比稿规则也明确禁止带“试流程、测试”的需求；
- 付费投标可能在确认后扣推广金且不因未成交退回；upload、bid、sign、acceptance request、give-up/refuse、evaluation各自独立preview/approval/receipt/reconcile；
- 本 Pack 没有需求发布 API evidence，也不允许用网页自动发布；本轮无执行route。

### `zbj-contract-fixture-conformance/v1`

- 仅使用本地合成fixture验证v1 method、scope、signature、pagination、native modes/states、amount roles、ownership denial和effect state machine；
- 未来API测试工具只能在明确隔离、synthetic principal和无生产效果的证据下升级；
- test pass不提升public discovery、production rights、durable storage或AI/index maturity。

这些是本系统拟定义的Skill contract，不是猪八戒官方发布或已安装的Skills。

## 7. 数据、推断与 Probe 边界

- `getCategoryPubAll`的“所有”修饰需求类目，不修饰需求实例；不得从方法名构造全市场coverage。
- `getDetailById`返回title/content/budget/hostedAmount/location/time/requirements/attachment等高价值需求证据，但它是known-object read；没有合法taskId来源时route为零。
- `querySellerList`的分页、状态、时间和标题过滤只覆盖该openid已经参与的交易；`activeTime`是服务商参与时间，不是需求创建或首次公开时间。
- `queryParticipatedPieceWorks`与`queryParticipatedCrowdsourcings`包含Task、稿件和结果摘要；同一Task在多个endpoint出现必须按taskId/exact mode relation去重，不能计作新需求。
- amount是需求/订单金额，hostedAmount是托管，installments是支付列表，copyrightPrice是稿件版权报价；它们分别映射advertised/contract/escrowed/payment/proposed term，不能统一成“客单价”。
- task state、bid/work state、agreement双方同意、acceptance outcome、payment/refund与evaluation是正交事实。`交易成功`也不能自动证明客户满意、无退款/纠纷或全部版权已合法交付。
- `noticeBuyerPay`虽然名称含pay，实际是服务商发起验收申请；它产生验收/资金流程效果，不是payment read。
- 比稿/众包稿件可能包含未公开知识产权和附件；默认只保存受限metadata，不下载work bytes，不交给Agent评分，也不用于训练/benchmark。
- 付费投标带来交易机会但不保证成交；推广金扣除是lead/proposal access成本，不是项目收入。
- 用户退订/停用应用时，来自该用户的数据必须立即删除；平台要求删除时同样执行。删除传播到canonical、evidence、Dolt/history、warehouse、lexical/semantic/vector index与缓存，并生成receipt。
- 在书面许可覆盖跨用户研究、AI/索引/派生与保存前，真实ZBJ数据不进入长期需求系统。

## 8. 官方与开源证据审计

以下只读核验官方HTML/JSON文档端点、规则页、搜索结果和artifact metadata；未注册、下载、安装或执行：

| Artifact / revision | Ownership / License | 价值 | 决策 |
| --- | --- | --- | --- |
| [猪八戒开放平台API目录](https://open.zbj.com/api/apiIndex) | 猪八戒官方 | current group/method清单；证明需求API仅known ID、交易list为服务商参与人口 | `canonical-catalog-candidate`；dynamic docs需snapshot hash与schema conformance |
| [开放平台文档中心](https://open.zbj.com/wiki/getWikiCategoryAll) | 猪八戒官方；agreement valid=1但updated 2018 | OAuth、permission、调用、签名、协议和SDK入口 | `stale-current-evidence`；必须按document id/updateTime固定并设置短expiry |
| official Java SDK zip `2.3.6` / Maven example `2.3.2` | 猪八戒官方分发；license/source/checksum未知 | 旧ZOP request/signature model参考 | `do-not-install/unverified`；版本冲突、无源码/许可证/校验和 |
| GitHub/search ecosystem | 未发现官方仓库、MCP或Skill | negative discovery evidence | `no-maintained-candidate-found`；browser/反爬/定时访问方案拒绝 |

官方SDK、基础API标签或平台用户授权都不自动授予跨应用、跨用户、平台运营数据、AI、长期保存或再分发权利。

## 9. Verification Plan

### evidence-review

- 固定九类API group及method ID/name/description、关键detail页HTML/hash/observedAt；
- 固定开放协议valid/updateTime、OAuth/permission/call/signature/SDK doc id与rules version/effective date；
- 获得正式资料后固定HTTPS endpoint、application label→method matrix、environment、quota、OAuth TTL/refresh、schema、pagination、webhook absence/presence、user consent UI、storage/AI/index/delete书面范围；
- OSS/SDK固定source/revision/license/hash/dependency，不下载执行未知artifact。

### static-contract

- demand category与demand instance、known-object与list、public hall与provider-participated population不互换；
- 比稿/计件/招标/众包/catalog purchase/direct hire按exact native version映射；
- task、provider participation、work/bid、agreement、acceptance request/outcome、escrow/payment/refund/evaluation分离；
- HTTP-only route、`scope=all`、unknown app permission、missing user consent或durable-rights gap在network前blocked；
- known task read拒绝ID scan；official route失败不切HTML/cookie/browser/private API；
- read credential不能调用upload/bid/sign/acceptance/evaluate或service/store mutations。

### fixture-conformance

| Fixture | 必须证明 |
| --- | --- |
| all demand categories response | 只产生taxonomy knowledge，zero Task/Opportunity |
| known task detail | taskId provenance与app/user authority齐备；附件只存manifest，不下载 |
| guessed/sequential taskId | 在network前拒绝并记录negative-path audit |
| seller list two pages | openid、mode/state/time filters、page/total/totalPage与partial coverage保留 |
| same task in seller/piecework/crowdsourcing lists | 按exact taskRef关联，不重复计client demand；native mode冲突进入review |
| task amount + hostedAmount | advertised/contract候选与escrowed amount分离，不生成payment |
| agreement version/addendum/stages | 双方同意和版本链保留，查询不等于合同仍有效或已履约 |
| upload then bid work | 两个独立effect intent；work bytes、content、copyright price受限；timeout先reconcile |
| paid bid confirmation | 推广金/交稿费是proposal access cost，不是contract/payment；确认前必须显示费用 |
| acceptance request | amount/reason形成acceptance-request，不生成acceptance/payment/completion |
| buyer refuse then later accept | outcome revision链与理由保留，不覆盖前一证据 |
| installments + refund | payment items与refund/reversal exact relation，不以负数或交易状态替代 |
| review with order amount | feedback与financial amount隔离；昵称/正文不进入通用telemetry |
| user unsubscription | 立即删除该app+openid范围的canonical/evidence/index/cache并生成receipt |
| platform delete request | exact scope可执行且不可由append-only history阻断 |
| blocked durable use | zero Observation/SourceItem/EvidenceSpan/Dolt/warehouse/index/vector/RAG/eval residue |

### sandbox-live / operational-canary

当前无已证明的独立sandbox，故不定义可运行live级别。未来只有在官方确认TLS、隔离测试环境、synthetic principal与无生产费用/交易效果后才能执行sandbox conformance。Production canary必须先从exact provider-owned read开始；upload/bid/sign/acceptance/evaluation逐能力另行批准，且public discovery与durable research不能随read canary自动升级。

## 10. Observability Contract

允许的低基数通用字段：

```text
pack_ref
surface_ref
document_revision
application_class
authority_role
capability_ref
native_mode_class
coverage_class
rights_decision
transport_security_outcome
schema_outcome
policy_outcome
effect_class
reconcile_outcome
deletion_outcome
```

受限audit/trace还需：evidence snapshot、developer/app/openid opaque refs、exact scope/method/version、task/work/agreement/evaluation opaque refs、page/filter/checkpoint、native state、amount-role schema refs、approval/attempt/receipt/reconcile、user unsubscribe/platform delete receipt。

禁止进入普通log/metric label：App Key/Secret、access/refresh token、openid、task/work/agreement ID、雇主/服务商昵称、title/content、地区、附件URL/bytes、合同/稿件/评价正文、IP、金额或原始响应。一个`success`指标不得同时表示HTTP成功、投标生效、合同签署、验收通过、已支付、无退款和好评。

关键alert：

- API目录/method/detail schema与rules revision drift；
- HTTP/HTTPS、method-name示例、SDK 2.3.6/2.3.2、permission matrix和environment unresolved gap；
- `scope=all`、cross-app/openid、public-coverage overclaim、sequential task scan和HTML/browser fallback attempt；
- pagination gap、native mode/state mapping conflict、duplicate Task、amount-role conflict；
- bid/稿件/合同/验收/评价unknown effect与未对账费用；
- 用户退订或平台删除后残留canonical/evidence/index/cache bytes；
- platform operating data、cross-user materialization、AI/RAG/index attempt必须在network/persistence前产生policy-blocked audit。

## 11. 发布决定

```text
research state            researched
route state               no-route
public demand discovery   no official list/search route
known task detail         app-authorized / disabled
provider-owned read       app+user authorized / disabled
external writes           disabled
durable research          policy-blocked
official SDK              stale unverified artifact / not installed
official MCP/Skill        not found
```

这一决定保留平台价值，但不虚构自动发现能力。未来最现实的升级路径是：用户拥有服务商主体并授权具体应用后，对其已参与交易做有界、可删除、purpose-bound的只读复盘；全市场需求发现仍等待官方search/list/export及书面数据用途，不以公开网页或第三方自动化替代。

## 12. 主要官方证据

- [猪八戒开放平台首页](https://open.zbj.com/)
- [API目录](https://open.zbj.com/api/apiIndex)
- [开放平台文档中心](https://open.zbj.com/wiki/getWikiCategoryAll)
- [猪八戒平台服务协议（2025-05-16版）](https://rule.zbj.com/ruleshow-0?categoryId=289&pid=2)
- [猪八戒平台服务规则（2024-10-01版）](https://rule.zbj.com/ruleshow-0?categoryId=278&pid=710)
- [猪八戒平台交易规则（2025-01-02版）](https://rule.zbj.com/ruleshow-0?categoryId=278&pid=716)
- [服务商付费投标规则（2025-08-07版）](https://rule.zbj.com/ruleshow-0?categoryId=278&pid=512)
- [比稿需求发布与稿件处理规则（2023-10-07版）](https://rule.zbj.com/ruleshow-0?pid=715)
- [平台纠纷处理规则（2024-10-01版）](https://rule.zbj.com/ruleshow-0?categoryId=278&pid=280)
