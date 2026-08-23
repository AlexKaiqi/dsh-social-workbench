# Adapter 生态与平台能力交叉调研

核验日期：2026-08-23。本文件不是“支持平台列表”，而是对开源 adapter 目录进行能力拆分。一个项目出现某个平台名称，只能证明存在某种连接，不能自动推导它能公开检索、读取账号内容、获取分析数据和发布内容。

## 结论

目前不存在一个成熟、许可清晰、同时覆盖国内外平台双向能力的 adapter catalog。可复用生态实际分成四组：

1. Airbyte、Meltano、dlt 擅长 **数据摄取**，但社交平台连接器常是广告或自有账号分析，不是公开内容搜索。
2. RSSHub、LangChain loaders、LlamaIndex readers 擅长把内容变成统一输入，但很多 route/reader 是社区实现，不能当作平台授权。
3. Postiz、Activepieces、n8n 擅长 **动作和发布编排**；其中 Postiz 最贴近多平台内容发布，Activepieces 更适合长尾 SaaS action。
4. 国内多平台发布项目通常依赖 Cookie、Playwright 或浏览器扩展，能证明 UI 流程可被自动化，不能证明有稳定、获授权的服务器 API。

因此 catalog 应按“平台 × capability × acquisition/execution mode”登记，而不是按平台打一个总勾。

## 1. 能力与接入方式标记

### 1.1 Capability

| 标记 | 含义 | 不能混淆成 |
| --- | --- | --- |
| `discover` | 发现 stream、频道、账号或可用字段 | 全网搜索 |
| `read-public` | 读取明确公开对象 | 读取任意登录态内容 |
| `read-owned` | 读取用户已授权账号或组织资产 | 舆情采集 |
| `search` | 平台官方提供的检索能力 | 用搜索引擎或抓网页模拟平台 API |
| `analytics` | 自有账号、帖子或广告指标 | 真实市场需求的完整度量 |
| `publish` | 创建平台内容 | 上传草稿、打开分享面板或填充网页表单 |
| `engage` | 评论、回复或社区动作 | 自动私信、自动互动或养号 |
| `reconcile` | 查询外部内容的最终状态并对账 | 收到一次 HTTP 200 即视为成功 |

### 1.2 Mode

| Mode | 证据与稳定性 | 默认策略 |
| --- | --- | --- |
| `official-api` | 官方文档、OAuth/scope、版本和配额可核验 | 首选；仍需账号级 live probe |
| `delegated-api` | 调用 Postiz 等外部服务，由其维护平台 API | 隔离部署、固定版本、保存外部 receipt |
| `public-feed` | RSS/Atom/JSON Feed 或站点明确提供的公开 feed | 可采集；保留原 URL、许可和删除策略 |
| `community-route` | RSSHub、reader、tap 等社区 adapter | 可替换；每条 route 独立健康检查 |
| `share-sdk` | 官方 SDK 唤起 App，用户在平台 UI 中确认 | 归类为人工在环，不是 headless publish |
| `browser-assisted` | 浏览器扩展、Playwright/CDP 填表 | 默认研究/人工辅助，不进无人值守生产 |
| `private-api/cookie` | Cookie、逆向接口、非公开签名或设备态 | 默认拒绝；不能包装成“API” |
| `manual-package` | 生成素材、字段和操作清单，由用户发布 | 无通用官方 API 时的正式降级路径 |

## 2. 通用开源生态审计

| 生态 | 实际 adapter 单元 | 已核验的社交相关例子 | 主要能力 | 不能据此宣称 | 采用判断 |
| --- | --- | --- | --- | --- | --- |
| [Airbyte Catalog](https://airbyte.com/connectors) | replication source/destination、agent connector | Facebook Pages、Facebook Marketing、LinkedIn Ads，以及营销分析类来源 | 增量同步、schema、state、广告/自有资产数据 | 600+ connectors 等于 600 个公开内容源或发布器 | 适合独立 ingress 服务；按连接器逐项审查 ELv2/Agent connector 许可和产品边界 |
| [Meltano Hub](https://hub.meltano.com/extractors/) / Singer | tap、target、utility variant | Facebook Ads；社区 `tap-twitter` 可按用户、URL pattern 抽取 | ELT、catalog、state、可替换社区 variant | Hub 中出现平台名就代表官方维护、完整或可写 | 长尾 ingress 候选；优先采用维护状态清楚且有增量测试的 tap |
| [dlt REST API source](https://dlthub.com/docs/dlt-ecosystem/verified-sources/rest_api) | Python source/resource、declarative REST endpoint | 通用 REST/OAuth/pagination/incremental；没有依赖庞大社交目录 | 快速包裹官方读 API，并写入数据库/对象存储 | 自动获得平台 scope、发布语义或删除对账 | 第一批自建官方 API ingress 的轻量 runtime 候选 |
| [RSSHub Routes](https://rsshub.netlify.app/routes) | 每站 route -> feed | 大量国内外站点和平台公开页面 route | 公开内容观察、统一 feed、低接入成本 | route 是官方 API、长期稳定或允许登录态批量采集 | 作为 delegated/community ingress；每条 route 有独立 SLA 与许可记录 |
| [LangChain document loaders](https://docs.langchain.com/oss/python/integrations/document_loaders/index) | loader package | Airbyte、Apify、BiliBili、Discord、Mastodon、Reddit、RSS、Slack、Telegram、Twitter、YouTube 等 | 把来源内容装入文档/RAG pipeline | loader 具备持续增量同步、删除传播、发布和生产 SLA | 作为 adapter 代码来源，不让 `Document` 成为 canonical knowledge object |
| [LlamaIndex integrations](https://github.com/run-llama/llama_index) | 独立 reader/vector store/index package | 300+ integration packages，覆盖数据读取与检索后端 | reader 和 retrieval 原型速度快 | 每个 integration 都是 MIT、同等维护或适合生产 | 用于 spike；逐包锁版本、审许可证和测试，不采用总目录背书 |
| [Postiz integrations API](https://docs.postiz.com/public-api/integrations/list) | provider + connected integration/account | X、LinkedIn、Facebook、Instagram、Threads、YouTube、TikTok、Reddit、Discord、Telegram、Mastodon、Bluesky 等 27+ provider | 发布、调度、媒体、平台 settings schema、部分评论/分析 | 所列平台都支持相同 post type、读取、搜索或分析 | 国际 `delegated-api` 发布首选 spike；每次发帖前发现有效 schema |
| [Activepieces catalog](https://www.activepieces.com/pieces/) | TypeScript piece；trigger/action/auth/property | 757 pieces；LinkedIn 有个人/公司 update，另有 Telegram Bot、RSS、Buffer 等 | SaaS actions、flow、重试、人工输入、MCP exposure | piece 目录天然具备本项目批准、证据和对账语义 | 外部 action runner/长尾工具；PublicationPlan 仍由 DSH 控制面持有 |
| [n8n integrations](https://n8n.io/integrations/) | node、credential、trigger/action | 广泛的社交与营销节点、HTTP fallback | 用户自动化、模板和社区节点 | 可自由嵌入本产品后端，或所有社区节点同等可信 | 只对接用户自有外部实例；先处理 Sustainable Use License |
| [Apache Camel components](https://camel.apache.org/components/next/index.html) | component/endpoint/route/Kamelet | HTTP、消息、云服务和企业系统覆盖广，少量社交组件 | 路由、协议转换、重试、saga、企业集成 | 350+ components 是 350 个社交平台 connector | 企业 action/ingress bus 候选，不承担内容领域模型 |

### 关键辨析

- **广告数据 adapter ≠ 社交内容 adapter**：Facebook Marketing、LinkedIn Ads、TikTok Marketing 常返回 campaign/ad/creative 指标，不提供平台全网帖子搜索。
- **RAG loader ≠ ingestion service**：loader 常完成一次读取；cursor、checkpoint、tombstone、撤权和数据保留仍需工作台实现。
- **workflow action ≠ 安全发布工具**：action 能调用 API，不代表它有 preview、批准绑定、幂等、unknown reconciliation 和 kill switch。
- **MCP server ≠ connector implementation**：MCP 只规范模型如何发现/调用工具；底层仍可能是官方 API、浏览器自动化，甚至只是返回人工步骤。

## 3. 国际平台：可复用 adapter 路线

此表只列建议的实现顺序，不重复官方能力细节；账号和 scope 证据见[平台接入矩阵](PLATFORM_MATRIX.md)。

| 平台组 | Ingress 首选 | Tool/发布首选 | 可复用生态 | 主要缺口 |
| --- | --- | --- | --- | --- |
| RSS/公开网站 | 原生 feed；RSSHub；白名单网页 adapter | 不适用 | RSSHub、Crawlee、dlt | route 失效、许可、删除和正文抽取质量 |
| YouTube | 官方 Data API；字幕/自有分析另分 capability | 官方 API 或 Postiz | dlt、自建 client、Postiz；LangChain loader 仅用于实验读取 | OAuth、配额、媒体上传恢复、未审核应用限制 |
| X | 官方 API；读取与搜索分别登记 tier | 官方 API 或 Postiz | Meltano `tap-twitter` 仅作读取参考；Postiz 发布 | 价格、配额和权限变化频繁，不能依赖 application-only token 发用户内容 |
| LinkedIn | 已授权成员/组织资产；广告 connector 单列 | Posts API、Postiz 或 Activepieces | Airbyte LinkedIn Ads、Postiz、Activepieces LinkedIn action | 广告数据、组织发布、成员内容是三个不同产品面 |
| Facebook/Instagram | Pages/Professional/Marketing 各自建 profile | 官方 API或 Postiz | Airbyte Pages/Marketing、Postiz | 个人账号、Page、Professional account 和广告资产不能合并成一个账号类型 |
| TikTok | Display/Research/自有分析分开申请 | Content Posting API 或 Postiz | Postiz；通用 REST adapter | 研究数据与发布 scope 完全不同，应用审核和可见性限制较强 |
| Reddit | OAuth Data API；社区规则作为 policy 输入 | 官方 API 或 Postiz | LangChain loader、Postiz | 应用审批、机器人身份、subreddit 规则和 flair 动态字段 |
| Telegram/Discord | Bot/Gateway/Webhook，仅处理 bot 可见范围 | Bot API/Webhook；Postiz 可委托 | Activepieces、Postiz | “bot 看得到”不等于平台公开搜索；频道权限必须实例化检查 |
| Mastodon/Bluesky | 官方开放协议 | 官方 API优先，Postiz 可委托 | Postiz | 实例差异、内容 moderation、外部 record/status ID 对账 |

建议用 Telegram、Mastodon 或 Bluesky 验证第一条发布 outbox，因为官方接口透明且适合测试幂等/对账；不要从权限最复杂的平台开始验证整体框架。

## 4. 国内平台开源 adapter 审计

国内开源项目的价值主要是 UI 流程、字段约束和失败模式样本。除非代码确实调用已核验官方接口，否则统一标记为 `browser-assisted` 或 `private-api/cookie`。

| 项目 | 声称覆盖 | 已看到的接入方式 | 可借鉴 | 风险与结论 |
| --- | --- | --- | --- | --- |
| [multi-platform-publisher](https://github.com/mguozhen/multi-platform-publisher) | X、LinkedIn、微信公众号、小红书等 13 平台，并引用其他项目扩展抖音 | 官方 API、草稿、browser automation、manual/HITL 混合 | capability manifest、平台变体、dry-run、微信落草稿、红线分级 | 项目较新；适合设计参考与逐 adapter 代码审计，不应整体授予发布权限 |
| [social-auto-upload](https://github.com/kuloutoussssss/social-auto-upload) | 抖音、视频号、B 站、小红书、快手、百家号、腾讯视频、TikTok | Playwright、Cookie JSON、部分平台专用 uploader | 多账号、调度、上传进度、媒体字段和网页失败模式 | 凭据/账号风控面很大；作为隔离测试样本，不作为生产依赖 |
| [PostFlow](https://github.com/jefftko/PostFlow) | 抖音、小红书、视频号、B 站、快手、百家号、TikTok | Playwright browser automation | 国内创作者中心表单流程与发布字段矩阵 | MIT 不等于平台允许无人值守自动化；DOM/风控变化会持续破坏 adapter |
| [Wechatsync](https://github.com/wechatsync/Wechatsync) | 公众号文章到知乎、头条、简书、掘金、CSDN 等，并扩展微博/小红书/抖音图文/B 站专栏 | 浏览器扩展/页面端同步 | 长文格式转换、平台编辑器差异、人工可见操作 | 更接近浏览器辅助编辑器，不是服务器 API connector |
| [mcp-social-publisher](https://github.com/kevinten-ai/mcp-social-publisher) | X、微博、B 站文章、小红书 manual | 官方 API 声明、Cookie 和 manual 混合 | MCP tool 表面与 capability degradation | B 站明确用 Cookie；X 写入认证声明需与官方 user-context 要求复核；只能作为代码审计样本 |

### 国内平台的建议分级

| 平台 | 首选路径 | 社区 adapter 的定位 | 无官方可用权限时 |
| --- | --- | --- | --- |
| 抖音、B 站、微博、微信公众号、快手 | 用户主体申请官方 API 并做 capability probe | 用于学习字段、媒体流程和错误分类，不复用 Cookie | 生成草稿/交接包；允许用户跳转官方后台 |
| 小红书 | 官方 Share SDK 的用户可见确认流程 | browser-assisted 只做隔离研究 | 图文/视频素材包 + 字段清单 + 人工发布 |
| 微信视频号 | 继续核验用户主体是否有定向官方能力 | Playwright 项目只作为 UI 流程样本 | 视频、封面、标题、描述和发布时间交接包 |
| 知乎 | 数据开放平台用于搜索；发布能力另行核验 | 浏览器扩展可参考富文本转换 | 文章包 + 人工发布 |

## 5. 不应直接复用的 adapter 形态

出现以下任一项时，adapter 默认进入 `suspended` 或只允许离线 fixture：

- 要求把 Cookie、localStorage、设备指纹或扫码 session 交给模型或普通 Settings；
- 依赖私有签名算法、逆向接口、验证码规避、反检测或代理池维持登录；
- 不能区分 preview、draft、submit 和 published；
- 网络超时后盲目重发，没有外部 ID 查询和重复检测；
- 把账号读取权限扩大成全网采集，或把分享 SDK 描述成服务器静默发布；
- 没有 LICENSE、固定版本、维护者、测试和最近成功验证日期；
- 通过 MCP 暴露后就跳过 DSH Credentials、批准和审计边界。

## 6. Catalog 的最小数据模型

建议每条 catalog 记录按 capability 展开，而不是一个平台一行：

```json
{
  "platform": "example",
  "capability": "publish.video",
  "mode": "official-api",
  "adapter": "example-publisher",
  "adapterVersion": "1.2.3",
  "accountTypes": ["creator"],
  "requiredScopes": ["video.publish"],
  "maturity": "verified",
  "lastContractCheckAt": "2026-08-23T00:00:00Z",
  "lastLiveProbeAt": null,
  "officialEvidence": ["https://example.invalid/docs"],
  "supports": {
    "preview": true,
    "idempotency": false,
    "reconcile": true
  }
}
```

`officialEvidence` 证明平台产品面存在；`lastLiveProbeAt` 才证明某个 connector instance 最近真实可用。两者缺一时不能标成 `production`。

## 7. 推荐的 Adapter Backlog

### P0：证明框架，不追平台数

1. `ingress-rss`：标准 feed、ETag/Last-Modified、更新和删除策略。
2. `repo-postgres`：observation/canonical/projection 分离。
3. `access-hybrid`：全文 + pgvector + evidence span + ACL filter。
4. `publish-telegram` 或 `publish-mastodon`：preview、批准、outbox、幂等/对账。
5. `publish-manual-package`：任何不具备官方发布能力的平台都能完成可审计交接。

### P1：验证复用边界

1. 用同一个 REST 官方 API 比较原生 TypeScript、dlt 和 Meltano tap。
2. 包裹 Postiz 的 `list integrations -> settings schema -> create post -> reconcile`，不复制其账号数据库。
3. 用 Activepieces 执行一个非社交长尾 action，验证 DSH 批准和 receipt 仍是事实源。
4. 选一个国内官方 API 做真实 sandbox probe；不要用 Cookie 自动化代替。

### P2：在数据证明需求后扩展

- Airbyte delegated ingress、OpenSearch/Qdrant projection、Temporal durable workflow。
- 更多国际 Postiz provider 和国内官方账号连接器。
- browser-assisted 仅在用户明确选择、条款允许、隔离运行且有人工确认时单独立项。

## 8. 实现前的逐 Adapter 验证卡

每个 adapter 进入实现前回答：

1. 它具体覆盖哪个 capability，而不是哪个平台？
2. 调用的是官方 API、委托 API、公开 feed、分享 SDK、浏览器 UI，还是私有接口？
3. 账号类型、应用审核、scope、速率限制、价格和数据保留是什么？
4. 凭据停留在哪里，能否只把短期 token/credential ref 给隔离 worker？
5. 是否支持 cursor/checkpoint/tombstone，或 preview/idempotency/reconcile？
6. 上游许可证是否允许嵌入、修改、作为服务提供以及用用户自己的凭据？
7. fixture、contract test、sandbox probe 和 live probe 分别如何执行？
8. 上游失效时能否降级到别的 adapter 或 `manual-package`，而不破坏 canonical ID？

答案应进入 catalog 和 conformance report，不只留在 README 或聊天记录。
