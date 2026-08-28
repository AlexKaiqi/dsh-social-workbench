# Hacker News Public Discussion Platform Pack（设计）

检查日期：2026-08-26
Pack：`hacker-news-public-discussion/v0-design`
状态：`researched / policy-blocked-until-written-clarification / no-callable-route`

## 1. 采用结论

Hacker News 官方 Firebase API v0 提供稳定的公开 item graph、排行列表和更新提示，技术上适合研究 Ask HN、Show HN、story 讨论、Jobs 与评论树。但 YC Terms 同时限制未经授权的商业利用、scraping/data mining/robots/data gathering，本次未定位到对系统性需求挖掘和持久 AI 索引的明确 API carve-out 或第三方内容再利用许可。

因此，Pack 对本系统当前用途采取保守判断：系统性采集与持久索引在取得 YC 书面澄清前为 `policy-blocked-until-written-clarification`，不发布 callable route。官方 API 的存在只证明技术 surface，不证明预期数据用途与长期保存获准。

## 2. 稳定概念

| 概念 | 必须保留的语义 |
| --- | --- |
| Item | `job`、`story`、`comment`、`poll`、`pollopt` 的共同 envelope |
| Story | Ask/Show 是榜单/类别语义，API `type` 仍是 `story` |
| Comment | 通过 `parent` 和 `kids` 形成树；`kids` 顺序是展示顺序 |
| Poll / pollopt | 独立 item 与 exact relation，不扁平进 story body |
| Ranking-list snapshot | top/new/best/ask/show/job 的有序、时变成员快照 |
| Updates snapshot | changed item/profile ID 提示；不是 durable ordered change log |
| Dead / Deleted | `dead` 与 `deleted` 不同；dead 可能恢复，deleted 必须传播 tombstone/redaction |
| External URL | HN story 指向的独立 artifact；API URL 不授权抓取外部正文 |

score、descendants、榜单 rank 与 comment 数都是 provider-derived context，不能当作独立需求人数、正确性、商业价值或真实解决率。HN 官方 FAQ 说明排名不能仅由 votes/time 推导。

## 3. 能力目录与采用状态

| Capability | 官方 surface | 采用状态 | 说明 |
| --- | --- | --- | --- |
| `discussion.list.public-ranked-threads` | top/new/best stories | `rejected-current-purpose` | 最多 500；必须保存 list、rank、observedAt |
| `discussion.list.public-ask-show-job` | ask/show/job stories | `rejected-current-purpose` | Ask/Show 最多 200；Job 非 discussion reply surface |
| `discussion.read.public-item` | `/item/{id}` | `rejected-current-purpose` | null/missing 不自动等于 deleted |
| `discussion.read.public-thread` | item graph traversal | `rejected-current-purpose` | parent/kids exact relation；coverage 独立记录 |
| `discussion.receive.public-change-wakeup` | `/updates` | `rejected-current-purpose` | 只作 wake-up，随后 exact pull；不作 checkpoint log |
| search | 无官方 search API | `unsupported` | 不以 Algolia 或 HTML 抓取静默降级 |
| submit/comment/vote/flag | 无 v0 write API；社区规则另限 | `rejected` | 本 Pack 零写入 |

## 4. 接入与运行契约

- API 固定为 `v0`；client 必须忽略新增字段，不能假定未声明字段永远缺失。
- `/topstories`、`/newstories`、`/beststories` 最多 500；`/askstories`、`/showstories`、`/jobstories` 最多 200。
- list response 必须落为 ordered snapshot，包含 list kind、rank、observedAt 和 selection revision；不同时间的 rank 不能覆盖成 item 属性。
- `/updates` 没有 durable cursor、顺序、窗口和 completeness 保证；只能降低轮询延迟，不能替代 roster reconciliation。
- thread traversal 固定 root、parent、ordered kids、visited set、missing child IDs、depth/node budget 与 partial coverage。
- `dead=true`、`deleted=true`、null、字段缺失和不可达必须分开；后续 observed deletion 触发内容 redaction/tombstone。
- 默认不读取 `/user`、karma、about 或 submitted history；`by` 仅在必要时投影为 scope-local opaque attribution。
- story external URL 只建 descriptor；获取外部 artifact 需要独立 source Pack、rights 和 retrieval observation。
- 官方文档当前称 API 无 rate limit，但运行预算仍应克制；HN FAQ 表明快速访问大量网页可能导致 IP ban，HTML 站点绝不作为 fallback。

## 5. Probe 与写入边界

[HN Guidelines](https://news.ycombinator.com/newsguidelines.html) 禁止主要目的为推广、索取投票/评论/提交，并明确要求不要发布 generated 或 AI-edited text。故本系统不得生成 HN 投稿或评论供自动执行，也不应把 Agent 生成文案作为“人工 handoff”绕过规则。

所有 submit、comment、vote、flag、profile 或 moderation effect 均为 `rejected`。若用户未来自行进行真实的人类讨论，那是平台外人工行为，不能冒充本 Pack 的 Probe capability 或自动归因为受控实验。

## 6. 官方资料、Skill/MCP 与开源候选

| 候选 | 固定证据 | 结论 |
| --- | --- | --- |
| [HackerNews/API](https://github.com/HackerNews/API/tree/8a0528f538bca407c2ceeeefc9bee48bdb99c1c8) | official；commit `8a0528f…`；MIT | 协议文档与 sample 的事实源，不是用途授权 |
| [selesy/hn](https://github.com/selesy/hn/tree/9bbd7bce6649d234f3e9ae23643f14543464c467) | commit `9bbd7bc…`；Apache-2.0 | 小型 Go client；reference-only、未执行 |
| [alexferrari88/GoHN](https://github.com/alexferrari88/GoHN/tree/897680e407ae02dca2b9dd66a6897f497fffc1c7) | tag `v0.8.0` commit `897680e…`；MIT | descendant/concurrency 参考；性能能力不等于授权 |
| [tamnd/hackernews-cli](https://github.com/tamnd/hackernews-cli/tree/06685c022da91d3e2b767b462f7387016f449408) | tag `v0.2.1` commit `06685c0…`；Apache-2.0 | 混合官方 Firebase 与非官方 Algolia；必须 route/policy 分离，reference-only |
| [karanb192/hn-mcp](https://github.com/karanb192/hn-mcp/tree/f8d96930296a45b1aea06122f1b76a691be766b0) | tag `v1.0.0` commit `f8d9693…`；MIT | 社区 MCP，含 Algolia/cache/user analysis；仅 schema-discovery 候选 |
| `pp-hackernews` Skill | tag `hackernews-current` commit `99b8f93…`；大型 generated CLI 仓库、root license 未确认 | supply-chain 面广、SQLite sync/search、可选 webhook；排除/延期，不安装 |

未识别到 YC 官方 Agent Skill 或 MCP。社区 MCP/Skill 的代码许可证不授予 HN 内容权利，也不能把非官方 Algolia 路径变成官方 search capability。

## 7. Projection 与推断边界

映射到 `PublicDiscussion*`：story/Ask/Show/job/poll 为 thread kind，comment 为 record，parent/kids 为 exact relation，list rank 作为 selection/ranking observation，dead/deleted 为正交 provider state。外链文章不属于 HN authored span，除非另有独立 retrieval 与 rights evidence。

只有 reviewed title/text/comment 的 human-authored span 才可能派生 complaint、workaround、failed-attempt、switching 或 urgency。榜单位置、score、descendants、dead、deleted、job 类型和外链域名不能自动生成需求证据。

## 8. 验证与可观测性设计

当前仅运行文档审查、静态契约和离线 fixtures：

- positive fixtures：Ask story + nested comments、Show story + external descriptor、poll + pollopts、dead 和 deleted transition；
- coverage fixtures：missing child、cycle/duplicate child、node budget 截断、updates 丢失后全量 roster reconcile；
- negative fixtures：Ask 被当 native type、rank 覆盖为 item 字段、`updates` 被当 durable log、URL 触发外链下载；
- privacy fixtures：user/karma/submitted 被拒绝，`by` 仅 scope-local opaque ref；
- policy fixtures：systematic warehouse/index plan 在 network/binding 前被阻止；Algolia/HTML fallback 被拒绝；
- zero-write fixtures：submit/comment/vote/flag 与 generated/AI-edited handoff 不可解析为 capability。

若取得书面澄清，新增观测：API/schema drift、list membership/rank churn、list snapshot age、updates-to-pull lag、missing/null/dead/deleted transition、parent/kids graph completeness、external artifact leakage、user field rejection、terms/guideline evidence expiry 与 zero-write conformance age。

## 9. 主要官方证据

- [Hacker News API](https://github.com/HackerNews/API)
- [YC: Hacker News API launch](https://www.ycombinator.com/blog/hacker-news-api)
- [Hacker News FAQ](https://news.ycombinator.com/newsfaq.html)
- [Hacker News Guidelines](https://news.ycombinator.com/newsguidelines.html)
- [Y Combinator Terms](https://www.ycombinator.com/legal/)
