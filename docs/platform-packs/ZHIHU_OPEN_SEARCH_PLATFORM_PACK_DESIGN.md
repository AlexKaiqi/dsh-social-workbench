# 知乎开放搜索 Platform Pack 设计

状态：`researched/contract-gated/no-callable-route`；未注册开放平台、未登录、未申请Access Secret、未调用API/MCP、未安装或执行Skill/CLI/第三方项目、未获取真实搜索结果、未发布任何内容  
核验日期：2026-08-26  
目标：固定知乎站内搜索的问题/回答/文章摘要、精选评论、查询placement、作者归因与官方API/Skill/MCP表面；在开放平台用途合同和数据处理权利不完整时，阻止技术可用性被误写成长期需求数仓授权。

## 1. Pack 摘要

```text
pack ref             zhihu-open-search/v0-design
platform             zhihu
surface              data-open-platform/zhihu-search
state                researched/contract-gated/no-callable-route
knowledge snapshot   proposal only; no committed snapshot ID
verified level       documentation + static artifact review design
callable routes      none
credential bindings  none
external effects     none
```

知乎站内搜索对需求发现的价值很高：用户会描述完整问题、失败经历、替代方案、决策理由与相互反驳，且内容覆盖消费、职业、技术、商业和生活场景。当前官方数据开放平台已提供真正面向AI的REST API、Skill、CLI和MCP，因此不应再把网页抓取或private `/api/v4`当成默认方案。

但系统必须保留五个事实：

1. search item是provider-selected摘要表示，不是完整question/answer/article；
2. 单次最多10条且当前无分页，不是query-complete或site-complete；
3. authority level、ranking score、赞同数和评论数是平台上下文，不是事实正确性、作者专业性或需求人数；
4. official API、downloadable Skill、CLI、MCP、OAuth本人数据与网页是不同access surface；
5. “官方为AI提供数据”不自动回答目标应用的长期保存、全文/向量索引、训练、再分发和删除传播权利。

当前technical contract存在，但adoption contract不足，所以`callable routes = 0`。

## 2. 官方技术契约

### 2.1 REST `zhihu_search`

[知乎搜索API](https://developer.zhihu.com/docs?key=zhihu_search)：

```text
GET https://developer.zhihu.com/api/v1/content/zhihu_search
Authorization: Bearer <your_access_secret>
X-Request-Timestamp: <unix-seconds>
Query: required string
Count: optional int32, default/max 10
```

当前响应包含：

- envelope：`Code`、`Message`；
- query result：`HasMore`（文档称固定false）、`SearchHashId`、`Items`、optional `EmptyReason`；
- item：`Title`、`ContentType`、`ContentID`、`ContentText`摘要、带溯源参数的`Url`、`CommentCount`、`VoteUpCount`、作者显示字段、`EditTime`、`CommentInfoList`、`AuthorityLevel`、`RankingScore`；
- errors：参数、鉴权、频率限制、内部错误。

`ContentType`文档只概括为问题、回答或文章，没有发布closed enum/version；ContentText可能来自不同原生对象，也可能包含高亮标签。Connector不能凭标题或URL猜父question、完整正文、revision或license。

### 2.2 官方 Skill `2.0.0`

[知乎搜索Skill](https://developer.zhihu.com/docs?key=zhihu_search_skill)的mutable download URL在2026-08-26返回：

```text
version        2.0.0
sha256         a11c735d43ca3aaf9afd4eb533bd1017b90421f246f27fcd86f413630b843f5d
archive files  SKILL.md + scripts/zhihu-search.py
license        common archive paths not found
```

静态审计显示Python wrapper只用stdlib，接受query/count，读取`ZHIHU_ACCESS_SECRET`，5秒timeout并输出raw JSON；endpoint/base URL可由环境变量覆盖。它没有固定response schema、artifact signature、data-use policy或license。代码会在error body/raw output中只按secret字符串替换做redaction；这不等于整个系统日志安全。

Skill文档示例的`Data.HasMore=true`与REST API“当前固定false”冲突。两者不能任意选一个作为事实；ContractSnapshot必须记录source、hash、observedAt和conflict，fixture同时覆盖true/false，route在live schema确认前保持blocked。

### 2.3 Official CLI Skill `0.4.0`

[Zhihu CLI文档](https://developer.zhihu.com/docs?key=zhihu_cli)的stable Skill archive在本轮固定：

```text
skill version        0.4.0
skill sha256         dedd3b30d04424c06acad489d9f1614536f86ed32493d9aa40187d462a2335c9
manifest generated   2026-08-24T05:02:05Z
min CLI              0.4.0
license              common archive paths not found
```

CLI surface远大于本Pack：知乎/全网搜索、热榜、直答、本人创作/关注/收藏、知识库read/search/upload。它以系统credential store保存Access Secret，并区分Access Secret本人模式与third-party OAuth。

本系统不继承Skill中“安装并初始化”可同时授权安装、凭证验证和最小本人数据读取的组合规则。三者是不同effect：

- artifact install/update；
- credential create/store/verify；
- business data read。

每项需独立decision和用户授权。当前三项均未发生，CLI binary未下载。

### 2.4 Official MCP

[知乎搜索MCP](https://developer.zhihu.com/docs?key=zhihu_search_mcp)当前为MCP over SSE，示例protocol `2024-11-05`，tool=`zhihu_search`，只提供tools；query 2–100字符，count 1–10。tools/call结果通过SSE异步返回，MCP content type是text，正文为XML。

官方建议把完整XML交给模型，但本系统必须先执行：

- transport/session和message endpoint校验；
- XML size/depth/entity限制及schema parse；
- untrusted-content boundary和prompt-injection标记；
- fields minimization、author/avatar剥离与content-role mapping；
- representation=`search-summary`、query-scoped placement和coverage；
- evidence span选择后才进入模型上下文。

因此official MCP最多是另一个access method candidate，不能直接成为Agent tool或绕过Normalizer/Policy/Indexer。

## 3. Stable Concept Model

### 3.1 原生内容与表示

| Concept | 稳定含义 | 当前search可证明的范围 |
| --- | --- | --- |
| `Question` | 知乎问题根对象 | 结果声明ContentType=Question时可引用native ID/URL和摘要；不证明全部回答、状态或revision |
| `Answer` | 对某Question的回答 | 可引用answer ID/URL/摘要；若响应未给question relation，不生成`answers` relation |
| `Article` | 独立专栏/文章内容 | 映射`PublicDiscussionArticleThread`；不冒充question root |
| `Comment` | 附着于内容的评论 | `CommentInfoList`只是selected excerpt；缺comment ID/author/time/parent时不创建canonical comment record |
| `SearchSummary` | provider为当前query生成/选取的标题与摘要表示 | 不是full body、revision或author-provided excerpt，必须标`search-summary` |
| `SelectedExcerpt` | 搜索结果内附带的精选评论/片段 | 选择机制和coverage未知，不等于comment list或thread history |
| `SourceURL` | 回到原始内容的溯源链接 | URL可做descriptor；打开网页/抓全文需要独立access decision |

`PublicDiscussionRepresentationKind`将canonical record、search summary、selected excerpt和ranking snapshot分开。一个search item可以指向原生answer，但其本次payload仍是search-summary representation。

### 3.2 Query 与 placement

一次查询的事实链：

```text
QueryDefinition revision
  -> SearchRequestRef / SearchHashRef
  -> provider-selected Items[0..9]
  -> Position + AuthorityLevelRef + RankingScoreRef
  -> observedAt + coverage
```

`PublicDiscussionPlacementMetadata`保存query/search/filter/sort/selection、position和provider score refs。原始query、SearchHashId和score值留在受治理schema payload，不作为普通metric label。

同一内容在不同query、时间或search surface中的position不可覆盖。`RankingScore`没有公开跨query标尺；`AuthorityLevel`是content selection context，不写入`PublicDiscussionActorAttribution.Kind/Basis`来宣称作者专家身份。

### 3.3 作者、参与和互动

- AuthorName/avatar/badge是平台展示字段，不证明现实身份、专业资质、客户/买家/员工角色或跨平台同一人；
- 本用途默认舍弃avatar；只有引用/许可确有必要时保存scope-local opaque author ref和最小display attribution；
- VoteUpCount、CommentCount是mutable provider counters；不等于独立需求人数、购买意愿或观点正确；
- selected comments可能是平台选择样本，不能用其正负比例推断全部评论情绪；
- EditTime文档描述为发布时间或更新时间，语义不唯一；固定provider field并用`ObservedAt`，不自动同时填CreatedAt/UpdatedAt。

## 4. Capability Catalog 与 Adoption

| Capability | 官方surface | Effect | Adoption | 当前边界 |
| --- | --- | --- | --- | --- |
| `discussion.search.zhihu-public/v1` | REST `zhihu_search` | read | `contract-gated/deferred` | 技术schema足够建模；缺目标用途的正式data-use/retention/index contract、credential和fixture/live验证 |
| `discussion.search.zhihu-public.skill/v1` | downloadable Skill 2.0.0 | install+read | `reference-only` | mutable ZIP、无LICENSE、wrapper不替代Connector契约 |
| `discussion.search.zhihu-public.mcp/v1` | remote MCP over SSE | read/model-text | `deferred/not-preferred` | XML text/untrusted content、旧SSE transport；不绕过typed normalization |
| `discussion.read.zhihu-original/v1` | source URL / human product | read | `not-implied` | Search API只返回摘要；不得自动抓网页或private API补全原文 |
| `discussion.list.zhihu-question-answers/v1` | 未见本search contract | read | `not-a-capability` | answer item不证明存在thread list/page route |
| `discussion.read.zhihu-comments/v1` | selected `CommentInfoList` only | read | `selected-excerpt-only` | 无comment identity/parent/history/coverage，不注册canonical comment list |
| `ranking.read.zhihu-hot/v1` | official hot API/Skill/CLI | read | `out-of-pack/deferred` | 热榜是独立ranking population，需独立Pack revision；不混入query search |
| `answer.read.zhihu-direct/v1` |直答API/Skill/MCP | generated read | `out-of-pack` | 综合答案不是原始社区证据，不作为SourceItem替代 |
| `search.global.zhihu-platform/v1` |全网搜索API/Skill/MCP | read | `out-of-pack` | 外部web sources的identity/license/robots与知乎结果不同 |
| `user-context.read.own-zhihu/v1` | CLI Access Secret / user APIs | sensitive read | `out-of-purpose` | 本人创作/关注/收藏不进入public demand Pack |
| `knowledge.read-or-upload.own/v1` | CLI knowledge APIs | read/write | `out-of-purpose` | 本地文件上传是高影响write，明确排除 |
| `discussion.publish-or-interact.zhihu/v1` | 网页/community tools | write | `rejected` | 不发问题/回答/文章/评论/赞同；private/browser tools不补齐 |
| `research.materialize.zhihu-public/v1` | warehouse/fulltext/vector/RAG/training | durable processing | `policy-blocked` | 未取得exact storage/index/derivative/training/redistribution/deletion合同 |

API技术成熟度不能被Skill/CLI/MCP数量加权为adoption成熟度。每个surface独立version、schema、auth、data representation和failure mode。

## 5. Access Profiles

### 5.1 `open-platform-search-rest`

- principal：经知乎开放平台批准的exact developer/account；
- credential：Access Secret，只以Credentials ref驻留Host；
- scope：当前文档称Access Secret具有完整API访问能力，不是最小`zhihu_search`scope；
- route policy：本地只allowlist exact GET capability，拒绝本人数据、知识库、PDF/PPT和其他API；
- decision：definition candidate，未申请/未绑定/未调用。

上游credential过宽必须明确报告，不能声称平台least privilege。查询字符串也可能包含商业敏感信息，不进入普通日志。

### 5.2 `official-search-skill`

- artifact：version/hash固定的ZIP；
- runtime：Python process + environment secret + network；
- risk：endpoint overrides、raw JSON/stdout、mutable stable URL、无license；
- decision：只作schema/failure reference，不安装、不注册为Connector。

### 5.3 `official-cli`

- artifact与CLI binary分离；Skill会通过manifest下载平台binary并安装到用户目录；
- credential保存在系统store，headless可用环境变量；
- tool surface包含public search和敏感本人数据/write；
- decision：研究参考，不安装。未来若采用必须有binary provenance/signature、tool allowlist、no-auto-update和独立effect approval。

### 5.4 `official-remote-mcp`

- remote SSE session，Bearer secret在SSE与message请求中使用；
- tool output为XML text，不是typed connector payload；
- decision：不直接暴露给模型。即使live verified，也只能通过受控MCP adapter -> parser -> normalizer -> policy -> evidence pipeline。

### 5.5 `oauth-user-data`

- third-party application代表授权用户访问本人数据，应走独立OAuth，而不是分发Access Secret；
- public search与user context不是同一principal/population；
- decision：本Pack不建route，防止“官方CLI支持”造成scope creep。

### 5.6 rejected fallbacks

- www.zhihu.com DOM/SSR/API capture；
- Cookie、`d_c0`、`z_c0`、`x-zse-96`、private `/api/v4`；
- browser automation、扫码、反检测、proxy；
- third-party MCP/search engine cache；
- manual install of unknown Skill/CLI。

这些surface不能在official route blocked/expired/rate-limited时自动启用。

## 6. Platform Skills 设计

### `zhihu-pack-research/v1`

- 固定official homepage/docs、REST/Skill/MCP/CLI schema、terms/privacy、artifact version/hash/license和negative data-use evidence；
- 输出KnowledgeProposal、ContractConflict、expiry和drift triggers；
- 禁止注册/登录、申请试用、生成secret、下载binary、安装/执行Skill或访问业务endpoint。

### `zhihu-access-resolution/v1`

- 输入legal principal、approved use case、contract ref、capability、surface、population、fields、retention、index/AI/training、redistribution、deletion和effect；
- 在CredentialBinding/PortBinding/network前判定；
- “主页说适合AI”“免费5000次”“官方Skill/MCP可用”“社区wrapper能跑”均不能单独满足contract；
- exact business approval和公开文档冲突未解决时fail closed。

### `zhihu-public-problem-search/v1`

- future purpose：query-scoped public problem discovery；
- 输入versioned query portfolio、count≤10、领域/时间/purpose、result budget和retention；
- 输出search-summary representation、placement、selected-only coverage和source URLs；
- 默认剥离avatar，author display按attribution必要性最小化；
- 禁止自动query expansion/crawling、URL全文抓取、跨query score比较或market-complete声明；
- 当前不可调用。

### `zhihu-search-result-curation/v1`

- 从已批准的summary payload选择支撑complaint/failed-attempt/workaround/switching的最小span；
- 任何结论引用query、position、record representation、observedAt和source URL；
- summary不足时输出`needs-original-review`，不能编造完整语境；
- selected comment只能标`selected-excerpt`，不能代表全部评论；
- provider authority/rank只作selection context。

### `zhihu-contract-fixture-conformance/v1`

- 使用合成REST/Skill/MCP fixtures验证field casing、ContentType、summary/highlight、HasMore冲突、placement、author minimization、XML安全、untrusted text、coverage和zero-write；
- 不包含真实知乎内容、账号、Access Secret或network response。

### `zhihu-probe-review/v1`

- 当前只返回`no-write-route`与理由；
- 社区发问题/回答/文章/评论/赞同不是读能力的延伸；
- 不生成或交接AI写作以绕过平台write禁用。

## 7. Snapshot、数仓和索引

### 7.1 版本化snapshot

可保存：

- official docs URL/key、schema、observedAt、hash/valid window；
- concept/capability/access profile/skill definitions；
- artifact version/hash/manifest/license evidence；
- contract conflicts、negative discovery和adoption decisions；
- fixture schema与VerificationReport。

这些适合Git/Dolt式版本化知识。Mutable URL或stable alias每次变化产生新proposal，不覆盖旧证据。

### 7.2 真实数据面

即使future read获批，真实query/items也应进入分析database而非平台知识snapshot，并明确：

- query-scoped、max10、provider-selected coverage；
- representation=`search-summary`；
- source content type/ID/URL和observedAt；
- selected comment coverage unknown；
- field handling、retention/deletion和content license；
- exact contract/purpose decision。

SearchHashId、query、author fields和ranking score不作为普通metric label。原始payload按最短保留；永久证据只保留必要span和lineage。

### 7.3 动态物化与索引

`research.materialize.zhihu-public/v1`当前blocked。因此不能因为数据已在分析库就自动建立：

- full-text/dedup index；
- vector/embedding/RAG；
- cross-query author/profile graph；
- model training/eval corpus；
- product/competitor ranking dataset。

未来每个IndexDefinition需固定contract ref、purpose、source population、field whitelist、representation、model/provider、retention、delete propagation、build watermark和expiry。Search summary embedding与full original embedding是不同处理，不能共享同一rights decision。

## 8. Artifact 与 OSS 审计

以下对象于2026-08-26只读固定；未clone、install、build、execute或调用：

| Artifact | Ownership / License | 结论 |
| --- | --- | --- |
| official search Skill `2.0.0` / `a11c735d…` | developer.zhihu.com；archive common paths未见LICENSE | `official-artifact-reference`；typed wrapper设计可研究，禁止复用/执行 |
| official CLI Skill `0.4.0` / `dedd3b30…` | developer-cdn.zhihu.com；archive common paths未见LICENSE | `official-agent-reference`；capability/credential/update设计可研究，安装与本人数据副作用不采用 |
| official stable manifest `generated_at=2026-08-24T05:02:05Z` | official CDN | 固定各平台binary version/size/hash；未下载binary；mutable manifest需drift monitor |
| [klarkxy/zhihu-search](https://github.com/klarkxy/zhihu-search/tree/e1e2fedf20336933365da761fa07d30e704a749f) `e1e2fedf…` | community；SATA 2.0，不是OSI开源许可 | official API CLI/MCP allowlist与secret隔离参考；不作为依赖 |
| [iteng007/zhihu-mcp-server](https://github.com/iteng007/zhihu-mcp-server/tree/0475902fd52472a9484a56cadd6183d01048118a) `0475902f…` | community；未见LICENSE | Cookie/zse96/private API；`rejected-private-api` |
| [Douyh123/zhihu-mcp](https://github.com/Douyh123/zhihu-mcp/tree/d3b8d3c4a016ea0f5976eda283be5c032d31f369) `d3b8d3c4…` | community；未见LICENSE | Playwright、扫码、Cookie、反检测、搜索/发布/评论；`rejected-browser-write-automation` |
| [WloBy-Labs/ZhihuMCP](https://github.com/WloBy-Labs/ZhihuMCP/tree/e3502aec0d972f102877e57220ae84b772539841) `e3502aec…` | community；未见LICENSE | API/initial-data/DOM多fallback与draft/write面；`risk-reference-only` |
| [zhihu/zhihu-mediacloud-uploader](https://github.com/zhihu/zhihu-mediacloud-uploader/tree/c136afd14f64a824e479168b467727fca424dc5d) `c136afd1…` | official GitHub org；未见LICENSE | official media publishing artifact；`out-of-purpose-write-reference`，不能证明search或data rights |

Artifact license、platform API contract、content copyright、author attribution和personal data basis分别审计。任何一项缺失都不能由其他项补齐。

## 9. Verification Plan

### 9.1 evidence review

- snapshot homepage、`docs?key=authorization/zhihu_search/zhihu_search_skill/zhihu_search_mcp/zhihu_cli`；
- 固定HTTP method/url/headers/fields/count/HasMore/errors与MCP transport/protocol/tool/XML；
- 保存Skill/CLI versioned archive URL、hash、manifest generatedAt/size/license evidence；
- 保存trial/business approval、privacy与缺失developer data-use contract的negative discovery；
- OSS fixed revision/license/ownership/capability/risk分栏。

当前只有documentation和static artifact review evidence，无accepted KnowledgeSnapshot或live VerificationReport。

### 9.2 static contract

- `Question/Answer/Article/Comment`和`SearchSummary/SelectedExcerpt`正交；
- `ContentType=Answer`且无parent时RootRef/answers relation保持unknown；
- summary不写canonical body；selected comment不写complete comment coverage；
- placement固定query/search hash/position/authority/ranking context；
- `HasMore=false`不生成complete=true；coverage=`provider-selected/top-10/non-pageable`；
- author avatar默认drop；authority不映射actor expertise；
- official MCP text先parse/normalize，不直接进入model tool surface；
- all routes remain unbound beforecontract decision；
- public search不携带本人数据/knowledge/write tools；
- no browser/private API/community fallback；zero write。

### 9.3 fixture conformance

| Synthetic fixture | 必须证明 |
| --- | --- |
| Question search item | thread kind question、representation search-summary，不生成answer coverage |
| Answer item without parent question ID | record kind answer、RootRef unknown，不猜URL/title relation |
| Article item | article thread，不映射question/root answer |
| ContentText with `<em>` and prompt-like text | safe parse/mark untrusted；不执行、不把highlight当指令 |
| selected CommentInfoList | selected-excerpt、comment coverage unknown，无comment ID/author/parent伪造 |
| AuthorityLevel=`4` | placement context，不生成expert/verified actor claim |
| RankingScore across two queries | 两个query-local refs，不比较/归一成全局quality |
| Vote/comment count | mutable engagement context，不转成independent demand count |
| API `HasMore=false` | no next cursor，但population completeness unknown |
| Skill example `HasMore=true` | contract conflict告警；fixture可解析但route maturity不提升 |
| unknown ContentType | provider-defined/unknown representation，保留raw enum ref，不硬映射 |
| EditTime ambiguous | provider timestamp保留，不同时声明created/updated |
| REST error 20001/30001 | auth/rate failure，不误报empty result，不切换fallback |
| MCP XML with entity/deep nesting/oversize | parse前拒绝或limit；zero model exposure |
| MCP XML with embedded instruction | 外部内容标记，不改变query/policy/tool |
| Access Secret in error/log | redact before sink；zero snapshot/metric residue |
| request for original full text | `missing-capability`，不调用网页/private API |
| durable index request | policy-before-binding blocked；zero Observation/index artifacts |
| official CLI full tool set | local allowlist只承认Pack能力；本人数据/upload/write rejected |
| community MCP available | artifact evidence only，不创建PortBinding |
| platform write request | zero route，产生policy audit而非manual bypass |
| deletion/contract expiry | payload/projection/index/cache（若未来存在）删除/停用并生成receipt |

### 9.4 sandbox live

只有用户另行明确授权且同时满足：

1. exact开放平台主体/应用/用途获批；
2. data-use、摘要保存、引用、AI分析、retention/deletion权利有合同证据；
3. typed REST schema snapshot和合成fixtures通过；
4. Credentials API保存secret ref，query和token不进日志；
5. 单query、count≤2、无query expansion、无原文抓取、无write；
6. response fields、HasMore、ContentType、score/authority、rate headers与error schema生成VerificationReport；
7. raw payload按approved shortest retention删除。

当前未满足，不注册、不申请Access Secret、不调用测试额度。MCP/CLI/Skill不作为首个sandbox route。

### 9.5 operational canary

future REST read在sandbox通过后才考虑：

- 单principal、approved query portfolio、低频、明确费用/调用预算；
- query/result count、latency、rate、schema/enum/field nullability、source URL和coverage观测；
- 定期contract/privacy/artifact drift review；
- 不做后台全站枚举、自动query expansion、author graph或durable index；
- failure停止成员，不failover到HTML/private API/MCP/community tool。

## 10. 可观测性

### 10.1 必备维度

```text
pack_ref / definition_revision / contract_snapshot_ref
surface_ref / access_profile_ref / capability_ref / purpose_ref
legal_principal_ref / credential_ref / credential_scope_state
api_doc_hash / artifact_version / artifact_sha256 / license_state
query_definition_ref / search_request_ref / search_hash_ref
requested_count / returned_count / position
content_type_ref / representation_kind / selected_excerpt_count
has_more / pagination_state / coverage_kind
authority_level_ref / ranking_score_schema_ref
author_field_policy_ref / attribution_coverage
payload_schema_hash / parser_revision / untrusted_content_state
rate_limit_state / quota_state / latency / error_class
retention_ref / deletion_ref / index_decision_ref
policy_decision_ref / verification_report_ref
observed_at / valid_window / evidence_refs
```

不记录Access Secret、raw Authorization、完整query、author avatar、selected comment全文、raw response或高基数ContentID/SearchHashId到普通metrics。需要审计时只保存受控opaque ref。

### 10.2 Drift/alert

- `rest.skill.schema_conflict`：HasMore/field/casing/enum冲突；
- `artifact.stable_alias_changed`：hash/version/manifest变化只生成proposal；
- `mcp.transport_or_protocol_drift`：SSE/message/tool/schema变化；
- `contract.missing_or_expired`：阻断resolution；
- `credential.scope.too_broad`：报告upstream full access和local allowlist；
- `coverage.overclaim`：任何top-10结果被写成complete即失败；
- `representation.canonicalization_error`：summary被当full body；
- `authority.identity_leak`：provider authority被当actor expertise；
- `untrusted_content.bypass`：rawXML/HTML进入prompt/tool policy；
- `fallback.violation`：网页/private API/community route被尝试；
- `durable.processing.violation`：blocked数据产生index/embedding；
- `write.surface.exposed`：任何publish/comment/vote/upload tool进入Pack。

### 10.3 Zero-route SLO

当前SLO是知识和治理质量，而非采集成功率：

- official docs/artifacts在expiry前重新核验；
- schema conflict始终open且不会静默择一；
-每个surface/capability有explicit adoption和missing evidence；
- artifact revision/hash/license完整；
- fixture证明summary/placement/coverage、secret安全、no-fallback/zero-write；
- drift不会自动下载、安装、绑定或调用。

## 11. Release Gates

### 当前：`researched/contract-gated/no-callable-route`

- official identity/API/Skill/MCP evidence：有；
- typed search schema：有，但存在HasMore冲突和未版本化enum；
- target-purpose developer/data-use contract：不足；
- storage/index/training/redistribution/deletion rights：不足；
- artifact version/hash：有；license：不足；
- fixtures：设计完成，尚无独立fixture files/runner；
- credential/live/sandbox：无；
- callable route：0。

### 升级 `contract-modeled`

需要exact主体/用途合同或公开versioned terms，明确API使用、content representation、attribution、缓存/保存、AI分析/index/RAG/training、再分发、retention/deletion和费用；并解决REST/Skill schema conflict、固定ContentType/field schema和artifact license/provenance。

### 升级 `sandbox-verified`

用户另行授权后，以typed REST执行一次最小无副作用查询，生成schema/coverage/rate/redaction/delete VerificationReport。MCP/CLI/Skill maturity不从REST继承。

### `operational-canary`

需单独批准query portfolio、frequency/cost budget、retention、no-index和kill switch；任何contract/schema drift立即撤销route，不启动fallback。

## 12. 当前决策

- 发布本Pack为knowledge proposal；
- 增加`PublicDiscussionArticleThread`、representation和query placement抽象；
- 知乎以`contract-gated`第三成员加入Public Technical Discussions Channel，但eligible/bound/observed仍为0；
- REST优先于MCP作为future typed candidate；Skill/CLI只作静态参考；
- 不申请Access Secret、不安装Skill/CLI、不调用API/MCP、不抓原文、不建立数仓/索引、不发布内容；
- V2EX已完成独立Pack并作为`purpose-clarification-required`第四成员加入Channel；仍不作为知乎fallback。

相关设计：

- [中国公开问题与技术社区候选分流](CHINA_PUBLIC_PROBLEM_COMMUNITIES_TRIAGE_2026-08-26.md)
- [Public Technical Discussions Channel Pack](PUBLIC_TECHNICAL_DISCUSSION_CHANNEL_PACK_DESIGN.md)
- [V2EX Node Discussion Platform Pack](V2EX_NODE_DISCUSSION_PLATFORM_PACK_DESIGN.md)
- [Stack Exchange Public Q&A Platform Pack](STACK_EXCHANGE_PUBLIC_QA_PLATFORM_PACK_DESIGN.md)
- [Hacker News Public Discussion Platform Pack](HACKER_NEWS_PUBLIC_DISCUSSION_PLATFORM_PACK_DESIGN.md)
- [平台调研总览](../DEMAND_PLATFORM_SURVEY.md)
- [平台发现长期架构](../PLATFORM_DISCOVERY_LONG_TERM_ARCHITECTURE.md)
