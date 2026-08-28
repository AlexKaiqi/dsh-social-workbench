# V2EX Node Discussion Platform Pack（设计）

检查日期：2026-08-26
Pack：`v2ex-node-discussion/v0-design`
状态：`researched / purpose-clarification-required / no-callable-route`

## 1. 采用结论

V2EX 的 `Node -> Topic -> Reply` 很适合发现中文开发者、独立开发者和小团队公开表达的工具缺口、失败尝试、迁移、成本、产品评价与早期采用阻力。API 2.0 Beta 提供 PAT 鉴权的 Node、Topic、Reply 读取；旧匿名 API 提供 hot/latest 等小型榜单。技术 surface 足以设计 Connector，但还不足以发布本系统的 callable route。

当前阻止条件有四个：

1. [旧 API 公平使用规则](https://www.v2ex.com/p/7v9TEc53)鼓励学术研究、移动应用和浏览器扩展，同时反对用 API 结果填充商业/个人网站和 content farm；本系统的产品研究、长期数仓、全文/向量索引、AI 派生和可能的商业使用不应自行解释为已获准；
2. [API 2.0](https://www.v2ex.com/help/api)仍是 Beta，当前页面没有给出完整 response schema、page size、终止条件、删除/修订历史和系统化数据用途条款；
3. 同一 API 2.0 页面正文写默认 `600 requests/IP/hour`，示例 rate-limit header 仍为 `120`，不能在未验证前形成可靠预算；
4. V2EX 的社区规则明确约束 AI-generated topic/reply、推广、无意义回复和链接 spam；当前 API 也没有创建 Topic 或 Reply 的公开 route。

因此 Pack 仅发布概念、能力、访问 profile、静态证据和验证设计。当前 `eligible=0`、`bound=0`、`observed=0`；不申请 PAT、不调用匿名 API、不读取网页、不安装或执行社区项目、不建立索引、不产生平台副作用。

## 2. 稳定概念

| 概念 | 必须保留的语义 |
| --- | --- |
| Node | Topic 的独占分类容器；有完整名称和 URL 短名，不是 free-form tag |
| Topic | 讨论 root；属于一个 Node，可包含正文、作者、时间、回复计数和 provider state |
| Reply | Topic 下的 authored response；当前官方 API 页未发布足以证明 nested reply graph 的 schema，不臆造 parent tree |
| Member | scope-local author attribution；默认不采集完整 profile、站外账号或跨站身份 |
| Node membership | Topic 作者创建后前 10 分钟内可移动，之后管理员仍可移动且不通知；必须按 observation reconcile，不覆盖旧事实 |
| Hot/latest placement | 某一时点的 provider list snapshot；position 不是 Topic 固有属性，也不等于需求强度 |
| Thank/count | provider-derived engagement context；不是独立用户需求、认可、正确性或购买意愿 |
| Sticky/boost | 改变 Topic 可见性/首页分发的写入效果；boost 会消耗平台虚拟货币 |
| PAT | bearer credential；有 scope、过期与数量限制，不进入普通配置、日志、fixture 或 Git |

[Node 说明](https://www.v2ex.com/help/node)明确每个 Topic 只属于一个 Node，并说明移动规则。故通用抽象新增 `PublicDiscussionContainerMembership`，用 `ContainerRef + Kind + EffectiveAt/EndedAt` 保存 membership；Node 与 `TagRefs` 不合并。Reply 只有在 provider schema 或经过审查的 thread rule 明确时才继承 root 的 container，不能自动复制。

特殊 Node 是政策与用途上下文，不是运行时捷径：

- `/go/create`面向独立开发者展示新作品、寻找第一批用户与反馈；
- `/go/sandbox`用于测试发帖效果且不进入首页，它不是需求 Probe 的目标人群；
- `/go/promotions`承载营销内容，营销帖不应投向其他 Node。

这些定义只说明人类如何正确参与社区；不授权 Agent 发布，也不把 sandbox 变成自动测试环境。

## 3. 访问 profile 必须分离

### 3.1 `legacy-anonymous-rankings`

- 官方明确 surface：`/api/topics/hot.json`、`/api/topics/latest.json`、`/api/nodes/show.json`、`/api/members/show.json`；
- 无 credential；旧页面记载默认 `120/IP/hour`；
- hot 是首页每日 top 10，latest 是 All 最新列表；两者保存独立 `ListDefinitionRef`、position、observedAt 与 coverage；
- 当前用途为 `purpose-clarification-required`，不调用；
- 默认拒绝 member profile；历史社区文档或 wrapper 中出现但现行官方页未列出的 topic/reply/node-list endpoint，不能悄悄加入 profile。

### 3.2 `v2-pat-node-roster`

- `GET /api/v2/nodes/:node_name`；
- `GET /api/v2/nodes/:node_name/topics?p=`；
- 只能做 exact node roster，不提供通用搜索；
- page size、total/has-more、空页含义和稳定排序未由当前官方页面固定，不能宣称 complete coverage；
- 当前为 `purpose-clarification-required / no route`。

### 3.3 `v2-pat-thread-read`

- `GET /api/v2/topics/:topic_id`；
- `GET /api/v2/topics/:topic_id/replies?p=`；
- Topic 与 Reply 分别记录 content representation、schema revision、page observation 与 reply coverage；
- 当前官方页面未给完整 field schema、reply nesting、revision history、删除传播或 page termination contract；
- 当前为 `purpose-clarification-required / no route`。

### 3.4 `v2-account-private`

notifications、current member、current token 与 token creation 是账号管理 surface，不属于公开需求发现。全部 `out-of-purpose`，即使未来 read route 获准也不随之启用。

### 3.5 `v2-distribution-effects`

set-sticky 与 boost 会改变内容分发；boost 还消耗虚拟货币。全部 `rejected`。notification deletion 与 token creation 也是写入，不能包装为 read-side 辅助能力。

### 3.6 `web-or-third-party-fallback`

`unsupported/rejected`。V2EX 没有官方 search API，不允许在 node roster 不足时退到 HTML、站内私有接口、搜索引擎、第三方 scraper、MCP 或另一平台。

Legacy 与 v2 的 auth、schema、rate、coverage 和用途证据必须形成不同 `CapabilityRoute`；不能因 host 相同而合并。

## 4. 能力目录与采用状态

| Capability | 官方 surface | 当前状态 | 原因 |
| --- | --- | --- | --- |
| `discussion.list.public-hot` | legacy hot JSON | `purpose-gated` | small ranked snapshot；用途未澄清 |
| `discussion.list.public-latest` | legacy latest JSON | `purpose-gated` | ordered snapshot；不可当全量 change feed |
| `discussion.read.public-node` | legacy/v2 node | `purpose-gated` | 两 profile schema 和 rate 独立 |
| `discussion.list.public-node-topics` | v2 node topics | `purpose-gated` | 无 search；pagination contract 不完整 |
| `discussion.read.public-topic` | v2 topic | `purpose-gated` | schema、history、deletion contract 不完整 |
| `discussion.list.public-topic-replies` | v2 replies | `purpose-gated` | pagination/nesting/完整性未固定 |
| `discussion.search.public` | 无 | `unsupported` | 不使用 HTML/第三方 fallback |
| `account.read.private` | v2 notifications/member/token | `out-of-purpose` | 私有账号数据不是公开需求信号 |
| `credential.create` | v2 tokens | `rejected` | credential write；regular/everything scope 不够细 |
| `notification.delete` | v2 notification | `rejected` | 破坏性账号副作用 |
| `distribution.set-sticky` | v2 topic sticky | `rejected` | 改变分发 |
| `distribution.boost` | v2 topic boost | `rejected` | 改变分发且消耗虚拟货币 |
| `topic.create/reply.create` | 当前文档无公开 API | `unsupported/rejected` | 无 write route，且社区 AI/推广规则阻止自动 Probe |

没有 generic search 意味着 V2EX 的 future population 只能由显式、版本化 Node portfolio 或榜单定义形成；不能先采集再让 Agent 猜哪些 Node 有价值。

## 5. Connector 与 projection 契约

### 5.1 Definition

每个不可变 `PublicDiscussionDefinitionMetadata` 至少固定：

- host、`legacy`或`v2-beta` surface 与 API doc revision；
- Node taxonomy、container policy、Topic/Reply record taxonomy；
- exact node/list portfolio、排序和 selection 定义；
- community rules、AI content、anti-flood、link spam、promotion policy；
- rate contract 与文档冲突状态；
- identity minimization、data-use decision、retention/deletion 和 valid window。

### 5.2 Record

- Topic 映射 `ThreadKind=text-post`、`RecordKind=root`；
- Reply 映射 `RecordKind=threaded-reply`，但没有官方字段证据时不生成 reply-to-reply relation；
- exact Node membership 进入 `Containers`，不进入 `TagRefs`；
- hot/latest 或 node roster 中的位置进入 `PublicDiscussionPlacementMetadata`；
- legacy/v2 payload 保存各自 schema ref，不能字段并集后假装统一 canonical response；
- content、rendered HTML、member 字段与原始计数留在受治理 payload；普通索引只接收已允许且最小化的 projection；
- Topic 被移动后，新 observation 结束旧 membership 并开始新 membership；没有历史证据时只记录“当前 observed node”，不猜移动时间；
- missing、empty page、not found、deleted、moderated hidden、rate limited 与 decode failure 分开。

### 5.3 Placement

`PublicDiscussionPlacementMetadata`新增：

- `ListDefinitionRef`：hot/latest/node-roster 等列表定义；
- `DeliveryContextRef`：home、All tab、node page 等投放上下文；
- `Position`与`ObservedAt`：只对该 snapshot 有效。

已有 query/search 字段可为空。不得为了复用知乎 search 而虚构 V2EX query。

### 5.4 Evidence 推断边界

只有经过 review 的 authored title/body/reply span 才可能派生 complaint、failed-attempt、workaround、switching、urgency 等 `SignalEvidenceType`。以下不能直接形成需求证据：

- hot/latest rank、reply/thank/topic/star count；
- Node 名称或进入 `/go/create`；
- author profile、PRO 状态、站外链接或自报身份；
- sticky/boost、被移动、被锁定或被删除；
- Agent 对“今日热点”的摘要。

同一 Topic 在 legacy hot、latest 与 v2 Node roster 出现时可通过 exact native Topic ID 去重 Observation，但各 placement 仍独立保留；跨平台 URL/昵称相同不建立身份或需求人数关系。

## 6. 预期 Agent Skills

这些是 future Pack 内部的受控能力说明，不是当前可执行工具：

| Skill | 输入 | 只允许的输出 | 当前门 |
| --- | --- | --- | --- |
| `v2ex-pack-research` | official evidence refs | immutable concept/capability/policy proposal | 可做静态研究 |
| `v2ex-purpose-resolution` | intended purpose、主体、保存/索引/AI用途 | reviewed policy decision + expiry | 需书面澄清 |
| `v2ex-node-portfolio-design` | demand hypothesis、node evidence | versioned node/list definitions | 仅设计 |
| `v2ex-node-roster` | approved definition + binding | observations + placement/coverage | 当前无 binding |
| `v2ex-thread-read` | approved topic refs + binding | Topic/Reply records + spans | 当前无 binding |
| `v2ex-fixture-conformance` | synthetic provider-shaped fixtures | contract report，不产生网络调用 | 未来可实现测试 |
| `v2ex-probe-review` | experiment intent、copy provenance | `rejected/no-platform-write` | 固定拒绝 |

本轮未识别到 V2EX 官方 Agent Skill、MCP 或官方 SDK。社区 wrapper/MCP 的工具描述只可帮助发现 schema 问题，不能成为官方合同、内容权利或 runtime route。

## 7. 官方资料与固定开源候选

### 7.1 官方证据

- [API 2.0 Beta](https://www.v2ex.com/help/api)：PAT、Node/Topic/Reply、账号与分发副作用、rate headers；
- [Personal Access Token](https://www.v2ex.com/help/personal-access-token)：token 只在创建后前 10 分钟完整显示，最长 180 天，过期响应；
- [旧 API 公平使用规则](https://www.v2ex.com/p/7v9TEc53)：匿名 surface、历史稳定性承诺、120/IP/hour 与用途表达；
- [Node](https://www.v2ex.com/help/node)：独占容器、移动规则、create/sandbox/promotions；
- [Anti Flood](https://www.v2ex.com/help/anti-flood)、[Good Communication](https://www.v2ex.com/help/assertive)、[Link Spam](https://www.v2ex.com/help/spam)：AI-generated text、无意义回复、相关性、推广和链接边界。

历史页面对旧 URI/字段的稳定性表达不能自动延伸为 v2 Beta 的 schema 保证，也不能替代当前 data-use contract。

### 7.2 社区项目静态审计

| 候选 | 固定证据 | 价值 | 采用结论 |
| --- | --- | --- | --- |
| [tamnd/v2ex-cli](https://github.com/tamnd/v2ex-cli/tree/69822ce8803f9e6c2c317686556eb47d62e3488d) | commit `69822ce…`；Apache-2.0；Go；2026-06-29 push | legacy hot/latest/topic/node/member/replies；有timeout、body limit、pace、retry与typed model | `reference-only`；依赖部分当前官方公平使用页未列出的 legacy endpoint，且用途门仍在；未安装/执行 |
| [isaced/V2exAPI](https://github.com/isaced/V2exAPI/tree/2e15716b7315a2f274fa17eedaa399095f5d0156) | commit `2e15716…`；MIT；Swift；2023-08-29 push | 同时展示 legacy/v2 model 和 `success/message/result` envelope | `schema-witness-only`；较旧，create-token path 与现行官方文档不一致，不能作 contract source；未安装/执行 |
| [funnythingfunnylove/mcp-server-v2ex](https://github.com/funnythingfunnylove/mcp-server-v2ex/tree/e912dd572d4701a6dbe7a7458792842928b54ff0) | commit `e912dd5…`；MIT；npm `0.1.1`；2026-06-30 push | 公开了 node/topic/reply/account MCP tool 与 summary prompt | `rejected`；无测试，raw JSON 直接进入模型，无HTTP状态/schema治理，notification delete实现未使用DELETE，package start script还提交了token-like literal；不得安装、执行或复制 credential |
| [djyde/V2EX-API](https://github.com/djyde/V2EX-API) | 历史非官方 API 文档；无运行依赖 | 可提示 legacy 字段和 endpoint 的历史形态 | `historical-reference-only`；非官方、陈旧，不能提升 capability |

代码许可证只覆盖项目代码，不授予 V2EX 内容的保存、索引、再分发或 AI 使用权。固定 commit 也不意味着候选通过 supply-chain、安全或契约审查。

## 8. Probe 与平台副作用

本 Pack 没有 Probe route。

- 当前 API 2.0 文档没有创建 Topic/Reply 的公开 API；
- Anti Flood 明确对 Topic/Reply 中的 AI-generated text 施加长时间账户限制，并对无关技术回复处理；AI 相关 Node 的例外不等于本系统获得写入授权；
- Good Communication 要求基于事实、建设性和技术细节，并反对把 AI-generated reply 当作自己的回复；
- Link Spam 反对为重复发布自有/affiliate 链接而注册账号；
- `/go/sandbox`只是不进入首页的格式测试区，不是自动 market Probe sandbox；
- `/go/create`与`/go/promotions`也要求真实、相关、由人承担责任的社区参与，不能由 Agent 生成文案后以 manual handoff 绕过。

sticky、boost、notification delete、token creation 全部作为副作用负向 fixture。即使未来用户亲自发帖，也不得把该行为自动记为 Connector 执行或受控 Probe 成功。

## 9. 验证阶梯

### 9.1 Evidence review

- 固定 API/help/rules 页面 hash、last-updated、获取时间与 evidence expiry；
- 取得目标主体与具体用途的书面澄清，覆盖系统采集、长期保存、全文/向量索引、AI 摘要/派生、再分发、删除与商业使用；
- 分开判断 legacy anonymous 与 v2 PAT，不做“一个获准、全部获准”。

### 9.2 Static contract

- 当前 decision 必须在 credential resolution 和 network binding 之前拒绝；
- capability registry 中 account/write/search route 均不可解析；
- legacy/v2 schema、rate、auth、coverage 不能 fallback 或 union；
- PAT 只允许 credential ref；最多 10 个、30/60/90/180 天和首次展示窗口成为未来 lifecycle constraint。

### 9.3 Fixture conformance

由于官方页面当前没有完整 response schema，本阶段 fixture 只能称 `provider-shaped synthetic fixture`，不能称官方 contract fixture：

- Node + Topic + flat Reply；
- Topic 在两个 observation 中 Node 变化，旧 membership 不被覆盖；
- hot/latest/node-list 的同 Topic ID、多个独立 placements；
- page 为空、字段新增、字段缺失、unknown state、HTML/plain content；
- reply count 与 observed replies 不一致，coverage 保持 partial/unknown；
- rate header 120、600、缺失或非法值；
- token expired envelope；
- legacy/v2 response 被错误解码时 fail closed。

### 9.4 Negative conformance

- 不把 Node 当 tag、rank 当 Topic 属性、thank/reply count 当需求人数；
- 不猜 reply tree、Topic move timestamp、deleted state或pagination终点；
- 不读取 member profile/notifications/token；
- 不调用 HTML、非官方 search/scraper/MCP；
- 不生成 topic/reply manual-package；
- 不执行 token create、notification delete、sticky或boost。

### 9.5 Sandbox live 与 operational canary

当前均禁止。只有用途书面决策、官方 schema/分页契约或审查过的 observed schema、独立 sandbox/live 授权、credential scope 和预算全部通过后，才能为单一 read route 建立 canary；任何一个 read route 通过都不会解锁 account、search 或 write。

## 10. 可观测性设计

当前即使零网络 route，也记录知识漂移：

- API Beta 状态、页面 last-updated/hash、endpoint surface 与 response-schema completeness；
- legacy fair-use 与 v2 用途澄清状态、decision expiry、review backlog age；
- `600`正文与`120`示例 header冲突是否被修正；
- PAT max/expiry/scope/first-display规则漂移，且禁止 credential value 进入 telemetry；
- Node taxonomy、special-node policy、Topic移动规则与community rules漂移；
- OSS commit/license/archive/security finding 与未执行证明；
- `eligible/bound/observed/purpose-gated/failed` coverage；
- 无意生成 binding、HTML/third-party fallback、member/account field leakage 和 write capability leakage。

未来 read canary 还需：request/page、rate headers、server request ID、payload schema hash、unknown field/state、decode error、empty-page reason、list snapshot age、Node membership change、reply coverage、tombstone propagation、credential expiry warning、purpose decision revision。任何内容值、用户名、PAT 或全文不得作为低基数 metric label。

## 11. 进入 Channel 的条件

V2EX 作为第四个、`purpose-clarification-required`成员进入 [Public Technical Discussions Channel](PUBLIC_TECHNICAL_DISCUSSION_CHANNEL_PACK_DESIGN.md)，因为它补充了中文 forum Node/Topic/Reply 语义；加入 roster 不代表 callable。

首个 read route 的最低门：

1. 目标主体与用途获得可引用的书面允许；
2. legacy 或 v2 中的一个 profile 单独通过，不做双 surface fallback；
3. schema与pagination的 observed contract 足以计算 partial/complete，而不是猜空页；
4. retention、deletion、attribution、identity minimization 和 index policy固定；
5. synthetic fixture、negative conformance、明确授权的 read-only canary通过；
6. 所有 account/write/search capability继续不可解析。

在此之前，Channel 的 V2EX member coverage 必须显示为 missing/purpose-gated，而不是空结果或自动由知乎、HN、Stack Exchange补齐。
