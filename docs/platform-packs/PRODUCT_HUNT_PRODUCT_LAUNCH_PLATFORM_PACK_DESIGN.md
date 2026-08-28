# Product Hunt Product Launch Platform Pack（设计）

检查日期：2026-08-26
Pack：`product-hunt-product-launch/v0-design`
状态：`researched / commercial-partner-only / schema-currentness-unverified / no-callable-api-route`

## 1. 采用结论

Product Hunt 对产品定位、launch/relaunch、maker statement、早期评论、替代方案、topic、featured/rank 和外部产品链接有很高价值。但 API 2.0 明确默认不得用于商业用途，商业应用需联系 Product Hunt；Terms 还禁止 crawl/scrape 和保存大量 Content。需求挖掘通常服务产品或商业决策，本 Pack 因此不能默认采用 public scope。

另有实质 schema 漂移风险：当前产品概念是一个 Product Page 聚合多年 launches、reviews、team、awards 和 news；公开 GraphQL reference 仍主要暴露 `Post`，未给出 Product Page 与多次 launch 的 exact relation。没有获批 token 下的 schema artifact/introspection 与官方映射，不能从相同 root domain 或名称推断 `ProductRef`。

结论：API acquire 为 `partner-only`，取得商业书面批准并完成 schema conformance 前无 callable route。对用户本人真实、可使用产品的网页 launch，可保留独立 `manual-package` 设计候选，但不是 API Connector，也不在本阶段执行。

## 2. 稳定概念

| 概念 | 必须保留的语义 |
| --- | --- |
| Product Page | 产品跨年份的中心实体；可聚合多次 launches、reviews、team、awards、news |
| Launch / API Post | 某次发布或重大更新；同产品可 relaunch，不能覆盖旧 launch |
| Hunter | 提交 launch 的个人，不一定参与产品创造 |
| Maker | 产品/launch 创建者角色；不自动等于公司所有者或数据主体 |
| Topic / Collection | provider taxonomy 与用户策展关系；不能当全球产品分类真相 |
| Comment / Reply | 人际讨论；parent relation 与 maker badge/role需 exact evidence |
| Review | 与 comment 不同；API Post 只暴露 aggregate count/rating 时不能虚构 review text |
| Featured / All | homepage selection 与公开可见性不同；未 featured 的 post 仍可见和互动 |
| Rank | daily/weekly/monthly/yearly 等时变 placement；不是 launch 固有字段 |
| Promoted | 付费曝光，必须与 organic featuring/rank 分离；无字段时保持 unknown |
| Media / product link | 外部 artifact descriptor；API 可见 URL 不授权获取媒体或产品网站正文 |
| Removed | 可能由自动或人工审核产生；不等于产品不存在或需求无效 |

同一公司/root domain 的六个月规则与重大更新审查证明 product、company、launch 和 domain 是相关但不同的身份维度。

## 3. API 能力与采用状态

| Capability | 官方 GraphQL surface | 当前采用 | 说明 |
| --- | --- | --- | --- |
| `launch.list.public-posts` | `posts` connection | `partner-only` | after/before cursor、featured/order/date/topic；postedAfter 默认最近一月 |
| `launch.read.public-post` | `post(id/slug)` | `partner-only` | Post 不是已验证的持久 Product identity |
| `launch.read.public-comments` | Post.comments / Comment.replies | `partner-only` | comments 默认 NEWEST；parent exact |
| `taxonomy.list.public-topics` | topics | `partner-only` | topic slug/provider taxonomy |
| `launch.list.public-collections` | collections | `deferred` | 用户策展与产品 taxonomy 不同 |
| vote actors / user followers/profile graph | votes/users | `rejected` | 不读取个人投票、社交图或跨站身份 |
| private/viewer fields | private scope | `rejected` | 公共需求研究不需要 |
| follow mutations | write scope | `rejected` | 不属于 research/Probe |
| launch/comment/vote/write | partial write use-case approval or website | `rejected-api` | API 默认 read-only；不得推断未文档化 mutation |
| HTML/Algolia/third-party realtime | alternate surfaces | `rejected-fallback` | API/Terms/商业批准不能由 alternate route 绕过 |

## 4. 技术与 Schema 契约

- endpoint 为 `POST /v2/api/graphql`，必须携带 Product Hunt 提供的 access token；public client 使用 PKCE，server confidential client 保管 secret。
- Pack 固定 GraphQL schema hash/introspection artifact、query document hash、selected fields、variables、auth context 与 API evidence date；GraphQL endpoint 名不等于 schema 不变。
- connection 通过 `after/before/first/last` 和 `pageInfo` 分页；`totalCount` 与 fetched coverage 分开。
- `posts.postedAfter` 官方 reference 当前默认一月前，未显式传值不得宣称全历史。
- PostsOrder 的 `FEATURED_AT/NEWEST/RANKING/VOTES` 是不同 selection；rank/count不能互换。
- Post 暴露 name/tagline/description、makers/user、media/productLinks、topics、comments、votesCount、review aggregates、featuredAt 和多时间窗 rank；每个字段都需固定 schema revision。
- 当前 Product Page 支持多次 launch，但公开 `Post` schema 未提供 exact product relation；`ProductRef` 允许为空，不能用 slug/name/domain模糊合并。
- placement 保存 ranking family/window、rank、featured、promotion status 和 observedAt；新的 snapshot 追加，不覆盖历史。
- Product Hunt 可由团队编辑 launch name/tagline/thumbnail/description/gallery；payload hash 变化只能形成 observed revision，不能冒充完整官方编辑历史。
- API 对应用限流，达到上限返回 429；响应的 limit/remaining/reset headers进入 rate-limit telemetry，官方可动态调整。

## 5. 权利、身份与删除

- API commercial approval、approved use case、scope、attribution和valid window在 route resolution 前验证。
- Terms 对网页默认只允许个人、内部、非商业使用，并禁止抓取/爬取与保存大量 Content；API public scope不覆盖商业数仓。
- hunter、maker、commenter和reviewer只保留 scope-local opaque actor ref 与 exact role，不保存姓名、头像、headline、社交账号、followers/voters。
- vote actors、followers、user collections/upvotes和viewer-specific fields为默认 forbidden；只接受聚合 measure definition/snapshot。
- launch website、productLinks、YouTube/gallery/media只形成 descriptor，不下载 bytes、不访问外部产品网站。
- removed/hidden comment/post、API omission、Product Page/launch relation变化与批准终止必须传播 tombstone/redaction；没有官方history时 coverage 标成latest-only/partial/unknown。
- Product Hunt 对 User Submission 获得的许可不自动转授第三方；maker claim、comment、review和外部产品内容分别判断 rights。

## 6. 官方资料、Skill/MCP 与开源候选

| Artifact | 固定版本/许可 | 能说明什么 | 采用判断 |
| --- | --- | --- | --- |
| [`producthunt/producthunt-api`](https://github.com/producthunt/producthunt-api/tree/16d9463ba0b7c2d025dec7343d13062dac73d8c2) | commit `16d9463…`；未发现 root LICENSE | 官方 OAuth/API 2.0 starter app | 不是 schema client；许可不明且最后更新于2024，reference-only |
| [`mavagio/producthunt-graphql-api-client`](https://github.com/mavagio/producthunt-graphql-api-client/tree/04fa56d161e6c883dd15673b47497050917251e4) | commit `04fa56d…`；MIT | 极小 GraphQL client sample | 低成熟度、无 release；fixture reference only |
| [`pipeworx-io/mcp-producthunt`](https://github.com/pipeworx-io/mcp-producthunt/tree/68721d494cb6492d71bf571e2ce522c36fce4eaa) | commit `68721d4…`；MIT | 社区 read-only MCP，仅 `top_launches`/`get_post` | 窄 schema-discovery 候选；0-star快照、商业批准仍必需，未安装 |
| [`jaipandya/producthunt-mcp-server`](https://github.com/jaipandya/producthunt-mcp-server/tree/fdfff827eec0904a0139e1fbdbe71ad13232c1c5) | commit `fdfff82…`；README称MIT但未发现root LICENSE | 广泛读取posts/comments/collections/topics/users/votes | license与identity面未过门，排除/延期 |
| [`teslashibe/producthunt-go`](https://github.com/teslashibe/producthunt-go/tree/0712417a3ae263a7a6641c19822025d43ef8ae5c) | `v0.4.1`；未发现root LICENSE | Go client，含官方GraphQL与browser-cookie/Cloudflare路径 | private/front-end fallback违反route边界，拒绝采用 |
| [`inference-sh/skills` Product Hunt Launch](https://github.com/inference-sh/skills/tree/becc25649700d5457772a00e5143e28ccf9e5afa/guides/product/product-hunt-launch) | commit `becc256…`；未发现root LICENSE | 社区launch优化Skill，调用外部CLI生成素材/研究并给maker comment模板 | 依赖外部执行、部分规格未经官方固定，且生成comment与当前no-LLM评论规则冲突；拒绝 |

未识别到 Product Hunt 官方 MCP 或 Agent Skill。代码许可证不授予 Product Hunt API 商业用途，也不授予内容保存、身份处理或平台写权限。

## 7. Projection 与证据边界

Product Hunt 映射到独立 `ProductLaunch*`，不强迫复用 `PublicDiscussion*`：

- Definition 固定 Product/Launch identity、API representation、topic/pricing/availability、ranking/featuring/promotion、engagement/moderation、data-use/rights；
- Record 区分 Product、Launch、maker statement、comment/reply、review、provider editorial、placement与engagement snapshot；
- State 将 lifecycle、public、interaction-open、featured、promoted、product-available分开；
- Placement 是带window/observedAt的快照；
- Span 区分 name、tagline、description、maker introduction、comment/reply、review、provider editorial等role。

不新增 `EvidenceProductHuntLaunch`。Maker name/tagline/description是subject自述与定位证据，不是用户痛点或采用事实；只有reviewed community comment/reply/review原文才可能派生 complaint、workaround、switching等需求证据。rank、featured、votes、comments、reviews aggregate只作selection/engagement上下文，不能证明市场规模、收入、留存或产品成功。

## 8. Probe 边界

API write全部拒绝。对用户本人控制、真实可用且符合Featuring Guidelines的产品，可在未来单独发布 `manual-package` capability：仅准备事实字段、media manifest、外链、preview、schedule建议和人工检查表；最终由真实个人账号人工创建draft/schedule，回执人工对账。

必须满足：

- product真实可体验或有明确可用路径，不以纯邮箱收集页、vaporware或虚假产品测试需求；
- Product/Launch/relaunch identity准确，遵守同产品/同root domain至少六个月与重大更新规则；
- hunter/maker身份真实，company account不冒充个人；
- 不索取、激励或协调upvote，不用bot/mass messaging；
- 不自动comment/reply/vote；Product Hunt明确禁止AI-generated comments，因此系统不得生成maker first comment或回复，必须由真人自行撰写；
- 每次launch revision有独立preview/approval、外链/media rights、schedule、receipt/reconcile和删除计划。

本阶段不创建manual package、不登录、不上传、不schedule、不发布。

## 9. 验证与可观测性

当前仅允许 documentation review、静态契约与离线 fixtures：

- positive：Product Page + two launches、API-v2 Post without ProductRef、hunter≠maker、nested comments、review aggregate、featured/all/removed；
- placement：daily/weekly/monthly/yearly rank按window追加，rank/vote/featured/promoted不可互换；
- schema drift：Product Page relation缺失时拒绝domain/name dedupe，postedAfter默认一月时coverage必须partial；
- privacy：user/vote/follower/profile graph拒绝，media/external website bytes=0；
- policy：无商业书面批准时API route在network/PortBinding前阻断，HTML/Algolia/MCP/cookie不能fallback；
- Probe：AI comment、bot vote、incentive、company-account post、vaporware、重复launch均拒绝。

批准门通过后再观测 schema/introspection/query hash、cursor/pageInfo/totalCount、postedAfter/before、selection/ranking/featured/promotion、Post↔Product mapping coverage、comment/review/engagement coverage、rate headers/429、provider edits、removed/hidden/tombstone、identity bytes=0、external artifact leakage、approval expiry与zero-write conformance age。

## 10. 官方证据

- [Product Hunt API 2.0](https://api.producthunt.com/v2/docs)、[Rate Limits](https://api.producthunt.com/v2/docs/rate_limits/headers)
- [GraphQL Posts](https://api-v2-docs.producthunt.com/query/posts/)、[Post](https://api-v2-docs.producthunt.com/object/post/)、[Comment](https://api-v2-docs.producthunt.com/object/comment/)
- [Product Pages](https://help.producthunt.com/en/articles/6255061-what-are-product-pages)、[Relaunch](https://help.producthunt.com/en/articles/484934-can-i-relaunch-my-product)
- [How to post](https://help.producthunt.com/en/articles/479557-how-to-post-a-product)、[Featuring Guidelines](https://help.producthunt.com/en/articles/9883485-product-hunt-featuring-guidelines)
- [Commenting Guidelines](https://help.producthunt.com/en/articles/10030102-commenting-guidelines)、[Community Guidelines](https://help.producthunt.com/en/articles/3615694-community-guidelines)
- [Terms of Service](https://www.producthunt.com/legal)
