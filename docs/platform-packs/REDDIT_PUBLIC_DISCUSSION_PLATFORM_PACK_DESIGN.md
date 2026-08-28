# Reddit Public Discussion Platform Pack（设计）

检查日期：2026-08-26
Pack：`reddit-public-discussion/v0-design`
状态：`researched / explicit-approval-required / no-callable-route`

## 1. 采用结论

Reddit 的 Data API 能表达 subreddit、post、comment tree、listing、search、rules、flair、duplicate/crosspost 和多种排序，需求密度很高；但现行 Responsible Builder Policy 要求访问任何 Reddit data 前先申请并获得明确批准，商业用途还需明确书面批准。研究者只能使用 Reddit for Researchers Program 获批的数据，且不得长期保留超出即时项目所必需的副本。

本系统的持续需求挖掘、append warehouse、索引和产品机会分析不能在未批准 use case 下调用 Data API、`.json` 页面、RSS、第三方搜索、MCP 或 wrapper。因此本 Pack 只发布知识与 fixture 契约，不发布 PortBinding/callable route。未来批准必须固定 use case、subreddit roster、数据字段、保留/删除、是否允许模型辅助分析及商业范围，不能用通用“API access”替代。

## 2. 稳定概念

| 概念 | 必须保留的语义 |
| --- | --- |
| Subreddit | 独立 community、rules、visibility、moderation、flair 和 approved scope；不是全网统一 tag |
| Thing / fullname | `t1_` comment、`t3_` Link/post、`t5_` subreddit 等 provider identity |
| Link / post | text、link、media 等根讨论；“Link”是 API 历史名称，不代表都指向外站 |
| Comment | parent/root 明确的 authored record；reply tree 不等于扁平 feed |
| MoreComments | comment tree 的未展开占位，证明当前返回不完整，不是 authored comment |
| Listing | `after/before/count/limit/show` 的移动切片；不是稳定页码或完整历史 |
| Sort snapshot | hot/new/top/rising/controversial 等选择结果，必须固定 sort/time/observedAt |
| Duplicate / crosspost | exact provider relation；同 URL、同标题或相似文本不自动证明独立发生 |
| Flair / rules | subreddit-local taxonomy/policy，随时间变化 |
| Removed / deleted / locked / archived | 正交状态；不可从正文占位符猜完整原因或原始内容 |

score、upvote ratio、comment count、karma 和排行都是平台派生上下文，不等于独立需求人数、真实性、严重度或商业价值。

## 3. 能力目录与采用状态

| Capability | 官方 surface | 当前采用 | 说明 |
| --- | --- | --- | --- |
| `taxonomy.read.public-subreddit-definition` | `/r/{subreddit}/about`、rules | `approval-required` | 仅允许 approved subreddit roster |
| `discussion.list.public-posts` | hot/new/top/rising/sort listings | `approval-required` | moving cursor snapshot，最大通常 100 |
| `discussion.search.public-posts` | `[/r/subreddit]/search` | `approval-required` | 搜索 Link/post，不宣称官方 comment full-text search |
| `discussion.read.public-thread` | comments/article + morechildren | `approval-required` | base tree 可截断；MoreComments 必须回补或报告 partial |
| `discussion.read.public-duplicates` | `/duplicates/{article}` | `approval-required` | exact same-URL/crosspost listing，不是语义去重 |
| subreddit/user discovery | subreddit/users routes | `rejected-default` | 先由人工 query portfolio 固定 roster，不做全网人群发现 |
| user profile/history/karma | users routes | `rejected` | 不建立个人画像或跨平台身份 |
| private messages/modmail/private subreddit | private/mod scopes | `rejected` | 超出公开需求研究 |
| submit/comment/edit/delete/vote/save/follow/report/moderate | write routes | `rejected` | 不进入 acquire Pack，也不能用于 live conformance |

`.json`、RSS、网页抓取或搜索引擎 cache 不是 approval fallback；访问方式改变不改变 Reddit data 的用途政策。

## 4. 技术契约

- 官方 Data API Wiki 提醒 legacy API 文档可能过时；Pack 固定 documentation evidence snapshot，而不是虚构稳定 API version。
- 所有 client 使用 Reddit 批准的 OAuth access info 和唯一、可联系的 User-Agent；匿名或伪装身份不合规。
- listing 以 fullname `after/before` 滑动，常见 default 25、max 100；排序列表变化时 cursor 只证明一次遍历，不证明全历史 coverage。
- comment tree 的 `depth/limit/sort` 进入 selection definition；MoreComments 不是空结果。
- `/api/morechildren` 每次最多取 100 个 child，官方要求该 endpoint 同时只能一个请求；必须观测串行回补、missing child 和 partial coverage。
- search 固定 subreddit scope、query、restrict_sr、sort、time filter、cursor 与 field representation；搜索结果数量不能当完整总体。
- `raw_json=1` 与默认 HTML entity encoding 是不同 representation；正文仍需 schema-bound sanitization。
- rules、flair、lock/archive/removal/deletion 和 comment tree 必须定期 reconcile；获批研究还需按最新 export/query 重跑以传播删除。
- rate limit 由 Reddit 动态设置并可阻断；不能把旧社区资料中的固定 requests/minute 当当前契约。

## 5. 用途、身份、权利与删除

- `ApprovedUseCaseRef`、批准 evidence、商业/非商业范围和 valid window 在 Connector resolution 之前校验。
- Reddit for Researchers 只适用于获批非商业研究；本系统不能自行声称研究例外。
- User Content 仍由用户拥有；Data API Terms 只授予为批准 App 展示所需的有限许可，不自动授予模型训练、长期再利用或衍生内容权利。
- 默认不读取 profile、karma、followers、用户历史、私信、modmail、IP 或 off-platform link identity；author 仅保留 scope-local opaque ref。
- 禁止推断健康、政治、性取向等敏感属性，禁止跨平台匹配、重识别或去匿名。
- 删除请求、removed/deleted observation、批准终止和 use case 结束都必须产生 tombstone/redaction；终止时不能保留“历史研究副本”。
- 外链只保存 `SourceArtifactDescriptor`；Reddit post URL 不授权读取或保存目标页面。

## 6. 官方 Skill/MCP 与固定开源候选

| Artifact | 固定版本/许可 | 能说明什么 | 采用判断 |
| --- | --- | --- | --- |
| [`reddit/devvit`](https://github.com/reddit/devvit/tree/b829a87d9cb184cb1523333f054da4b7b409b1af) | commit `b829a87…`；BSD-3-Clause | 官方 Devvit SDK/CLI，构建 Reddit 内应用 | 不是外部 Data API acquire Connector；含应用发布/平台动作，reference-only |
| [`reddit/devvit-mcp`](https://github.com/reddit/devvit-mcp/tree/90bb744e3a245eb0d35f8c0f516a87fc752a8ceb) | `v0.0.27`；BSD-3-Clause | 官方 companion MCP，帮助编写 Devvit apps | 不是 Reddit 内容 MCP；安装用 `npx -y` 且默认有 telemetry，未安装/执行 |
| [`reddit/devvit-skills`](https://github.com/reddit/devvit-skills/tree/71ce34c6bec0d6f7c2f2c4cb7d70c509013bcbae) | commit `71ce34c…`；BSD-3-Clause | 实验性 `devvit-docs` Agent Skill，按项目版本搜索/缓存官方文档 | 仅 Devvit 开发知识；不是采集 Skill，未安装 |
| [`praw-dev/praw`](https://github.com/praw-dev/praw/tree/fdc29bb103ad652eea6740c77c2be099d1c1357e) | `v8.0.3`；BSD-2-Clause | 成熟 Python OAuth wrapper，read/write 面广 | schema/fixture reference；批准和最小权限不能由 wrapper 替代 |
| [`vartanbeno/go-reddit`](https://github.com/vartanbeno/go-reddit/tree/ff5b4e8f918595fc1fe18a27e0fd46f4ce13257b) | `v2.0.0`；MIT | Go read/write client；示例含 comment 与 vote | 2024 后未见活跃更新；write surface 过宽，reference-only |
| [`zicochaos/reddit-mcp`](https://github.com/zicochaos/reddit-mcp/tree/ed286ae086a266d6c88368f02680087695c8343f) | commit `ed286ae…`；MIT | 社区 MCP，subreddit/user feed、search、comments、本地 cache | 用户画像与缓存面超出默认政策；仅 schema discovery，不安装 |

未识别到 Reddit 官方公共内容采集 MCP/Agent Skill。官方 Devvit MCP/Skill 解决“如何开发 Reddit app”，不授予本系统读取、保存或分析 Reddit data 的权利。

## 7. Projection 与推断边界

Reddit 映射到扩展后的 `PublicDiscussion*`：subreddit 为 Definition 的 community，Link/post 为 root thread，comment/reply 为 record，MoreComments 进入 coverage，flair/rules/selection 固定在 definition，crosspost/duplicate 只使用 exact relation。

不新增 `EvidenceReddit`。只有获批范围内 reviewed human-authored title/body/comment/reply span 才可能派生 complaint、failed-attempt、workaround、switching、urgency 等既有 evidence。removed、deleted、score、rank、award、karma、comment count、flair 和 moderator action 默认只作状态或导航上下文。

## 8. Probe 边界

读取批准不授权 post/comment/edit/delete/vote/save/follow/report 或 moderation。Responsible Builder Policy 要求 app 透明、目的/范围明确，禁止操纵 voting/karma 及自动 spam；每个 subreddit 还有独立 rules。

当前 Pack 对所有 write capability 为 `rejected`，不生成 Reddit 文案、不使用 synthetic account、不执行 sandbox Probe。未来若用户获得 Reddit 与目标 subreddit 的明确批准，仍需新的 write Pack revision、真实 app profile、人工 owner、truthful content、频率/通知、subreddit rules、preview/approval/receipt/reconcile 和零投票操纵证明。

## 9. 验证与可观测性

当前仅允许 evidence review、静态契约与离线 fixtures：

- positive：text/link post、nested comments、MoreComments、crosspost、locked/archived/removed/deleted；
- coverage：moving listing cursor、comment depth/limit、morechildren partial/serial、search truncation；
- negative：score当需求人数、同URL当独立复现、removed正文被恢复、user history/karma进入索引；
- policy：无 exact approval/use-case/retention/AI-analysis evidence 时在 network 和 PortBinding 前阻断；
- no-fallback：`.json`、RSS、HTML、search cache、MCP/wrapper 均不得绕过；
- zero-write：submit/comment/vote/report/save/follow/moderation 不得物化。

若批准门通过，再观测 OAuth/User-Agent、subreddit roster/rules/flair、listing cursor/sort/time、search query portfolio、MoreComments backlog、tree gaps、rate-limit/429、removed/deleted/retention refresh、approval expiry、sensitive-inference rejection、profile/user-history bytes=0 与 negative-write conformance age。

## 10. 官方证据

- [Responsible Builder Policy](https://support.reddithelp.com/hc/en-us/articles/42728983564564-Responsible-Builder-Policy)
- [Data API Terms](https://redditinc.com/policies/data-api-terms)、[Developer Terms](https://redditinc.com/policies/developer-terms)
- [Data API Wiki](https://support.reddithelp.com/hc/en-us/articles/16160319875092-Reddit-Data-API-Wiki)
- [Data API reference](https://www.reddit.com/dev/api/)
- [Devvit documentation](https://developers.reddit.com/docs/)
