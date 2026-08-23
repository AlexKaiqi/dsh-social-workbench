# 平台接入矩阵

核验日期：2026-08-23。状态描述的是本轮查到的公开官方证据，不代表用户的应用或账号已经获权。平台政策变化后必须重新验证。

## 评级

- A：存在可验证的官方服务器 API，可作为首选直连候选。
- B：存在官方能力，但限定账号类型、应用审核、分享 SDK 或特定业务场景。
- C：没有验证到满足本项目场景的通用官方能力；只能人工交接或继续商务核验。
- D：仅发现 Cookie、私有接口或浏览器自动化方案；默认不接入生产。

## 总览

| 平台 | 获取/检索 | 发布 | 当前评级 | 研究结论 |
| --- | --- | --- | --- | --- |
| RSS / Atom / JSON Feed | 标准公开 feed | 不适用 | A | 第一批采集接口；仍需按来源记录许可和删除策略。 |
| YouTube | Data API 支持搜索、频道/视频元数据和自有数据 | `videos.insert` 上传 | A/B | 官方路径完整；配额、OAuth 和未审核项目的可见性限制需实测。 |
| X | API 支持读取、搜索和发帖，能力与价格分层 | `POST /2/tweets` | A/B | 技术上可行，但成本、配额和权限是持续变量。 |
| LinkedIn | 读取成员社交内容受限；组织/授权资产按产品权限开放 | Posts API | B | 适合已授权成员或组织发布，不适合作为全网舆情采集器。 |
| TikTok | Display/Research 等产品分开申请，公开采集不是 Content Posting 的能力 | Content Posting API 支持直接发布或上传草稿 | B | 需要应用审核和 scope；发布与研究数据必须是两个连接器 profile。 |
| Instagram | 只覆盖授权的 Professional account 及相应资产 | API 可发布图片、视频、Reels、轮播 | B | 个人消费者账号不适用；媒体 URL、权限和发布额度受约束。 |
| Facebook Pages | Page/授权资产可读；不存在通用个人/群组全网搜索承诺 | Pages API 可管理 Page 内容 | B | 只设计 Page 连接器，不承诺个人主页和任意群组。 |
| Reddit | OAuth Data API/Devvit 可读写相应社区数据 | 可发帖/评论，受应用与社区规则约束 | B | 需要标明机器人身份、遵循 Data API 条款与 subreddit 规则。 |
| Telegram | Bot API 可接收 bot 可见更新 | bot 可向有权限的 chat/channel 发消息 | A/B | 协议稳定，适合做发布基线；能力取决于 bot 在目标频道的权限。 |
| Discord | bot/gateway 获取授权事件；webhook 接收有限事件 | Incoming Webhook 或 bot | A/B | 适合团队/社区通道，不等同于公开社媒搜索。 |
| Mastodon | 实例公开/授权 API | statuses API，支持幂等与定时字段 | A | 开放、可自托管，适合验证发布 outbox。 |
| Bluesky | AT Protocol 公开仓库和 PDS API | `createRecord` / `putRecord` | A | 开放协议，适合验证读取、发帖和外部 ID 回流。 |
| 抖音 | Open API 可查授权用户及其视频/数据；不代表全站任意采集 | 视频/图片发布 API | B | 应用审核、用户授权和 `video.create` 等权限必需；发布需让用户明确感知。 |
| 哔哩哔哩 | 开放平台提供授权账号内容和数据能力 | 视频、文章等官方发布接口 | B | 适合国内直连候选，但要以实际主体、应用和授权账号做 sandbox 验证。 |
| 微博 | 官方 OpenAPI/CLI 提供搜索、发布和数据类能力 | 官方 CLI/API 可发布 | B | 2026 年官方 CLI 支持 MCP/结构化输出，是优先验证入口；价格和 credits 需纳入能力状态。 |
| 微信公众号 | 自有账号素材、草稿和发布状态 | `draft/add`、`freepublish/submit` 等 | B | “发布文章”不等于所有账号都能群发；账号类型、认证和接口权限必须现场验证。 |
| 快手 | 授权用户和内容能力 | 官方视频上传/发布 API 或移动分享 SDK | B | 网站应用需 OAuth 和 `user_video_publish`；权限可能要单独申请。 |
| 小红书 | 未验证到通用公开内容采集 API | 官方分享平台调起 App 内发布能力 | B/C | 官方能力是用户可见的分享/快速发布，不应描述为服务器静默发布；Headless 发布先人工交接。 |
| 微信视频号 | 未验证到通用公开采集 API | 未验证到通用内容发布 API | C | 在拿到官方文档或商务授权前只生成交接包，不使用 Cookie/DOM 自动发布。 |
| 知乎 | 数据开放平台提供知乎/全网搜索，但当前需申请/邀测 | 未验证到面向本场景的通用发布 API | B/C | 搜索可作为付费/商务候选；发布保持人工交接。 |

## 当前 MVP 的解释

当前只跑抖音和小红书，但二者不是同一种“发布 API”：

- 抖音先走官方移动分享或人工交接；服务器 OpenAPI 等 `video.create` 实际获批后再接。`video.list` 只代表授权账号作品，关键词搜索是特殊权限。
- 小红书先走人工交接；取得 App Key 后接官方 Share SDK。公开官方资料没有证明存在通用服务器静默发布或全站搜索 API。
- 两个平台现在唯一可复用的操作语义是“把已确认媒体交给官方 App、用户确认、接收流程结果”。服务器上传/创建另建路径，不硬塞进统一 `publish()`。

具体运行步骤与验收见[抖音 + 小红书最小可运行闭环](MVP_DOUYIN_XIAOHONGSHU.md)。

## 官方证据索引

### 国际平台

- YouTube：[videos.insert](https://developers.google.com/youtube/v3/docs/videos/insert)
- X：[API overview](https://docs.x.com/x-api/overview)、[Create Post](https://docs.x.com/x-api/posts/create-post)
- LinkedIn：[Posts API](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api)
- TikTok：[Content Posting API](https://developers.tiktok.com/products/content-posting-api/)、[Get Started](https://developers.tiktok.com/doc/content-posting-api-get-started)
- Instagram：[Meta 官方 API collection](https://www.postman.com/meta/instagram/documentation/6yqw8pt/instagram-api)
- Facebook Pages：[Pages API posts](https://developers.facebook.com/docs/pages-api/posts/)
- Reddit：[Data API Wiki](https://support.reddithelp.com/hc/en-us/articles/16160319875092-Reddit-Data-API-Wiki)、[Devvit Reddit API](https://developers.reddit.com/docs/capabilities/server/reddit-api)
- Telegram：[Bot API](https://core.telegram.org/bots/api)
- Discord：[Webhooks](https://docs.discord.com/developers/platform/webhooks)
- Mastodon：[statuses API](https://docs.joinmastodon.org/methods/statuses/)
- Bluesky：[Create a post](https://docs.bsky.app/blog/create-post)、[putRecord](https://docs.bsky.app/docs/api/com-atproto-repo-put-record)

### 国内平台

- 抖音：[内容发布解决方案](https://open.douyin.com/platform/resource/docs/ability/content-management/douyin-publish-solution)、[视频创建](https://open.douyin.com/platform/resource/docs/openapi/video-management/douyin/create/create-video)、[图片发布](https://open.douyin.com/platform/resource/docs/openapi/video-management/douyin/publish-img/publish/)、[开放数据](https://open.douyin.com/platform/resource/docs/ability/open-data/video-data-solution)
- 哔哩哔哩：[开放平台文档](https://openhome.bilibili.com/doc)
- 微博：[官方 CLI](https://open.weibo.com/cli)、[微博开放平台账号](https://weibo.com/openapi)
- 微信公众号：[新增草稿](https://developers.weixin.qq.com/doc/service/api/draftbox/draftmanage/api_draft_add)、[发布草稿](https://developers.weixin.qq.com/doc/service/api/public/api_freepublish_submit)
- 快手：[开放平台介绍](https://open.kuaishou.com/platform/openApi?grop=GROUP_OPEN_PLATFORM)、[发布视频](https://open.kuaishou.com/platform/openApi?menu=20)、[网站应用 OAuth](https://open.kuaishou.com/platformDocs/develop/web-app.html)
- 小红书：[分享开放平台](https://agora.xiaohongshu.com/)
- 知乎：[数据开放平台](https://developer.zhihu.com/docs?key=global_search)

## 连接器验收清单

一个平台只有同时满足以下条件，才能从 `registered-only` 进入 `callable`：

1. 官方产品和 API 文档仍在线，并记录版本/更新时间。
2. 明确账号类型、主体资格、应用审核和 OAuth scope。
3. 在用户自己的测试账号完成最小读/写探针。
4. 有速率限制、成本、token 刷新和撤权处理。
5. 发布支持 dry-run/preview、幂等或重复检测、结果查询和失败分类。
6. 数据字段有保留期限、删除和权限撤销行为。
7. 平台条款允许目标用途；“非商业使用”不自动免除条款和隐私义务。

## 仍需人工验证的问题

- 用户现有账号分别是个人、创作者、企业、机构号还是专业账号。
- 抖音、B 站、快手、微博、微信公众号实际可申请到哪些 scope。
- 微信视频号是否能通过用户主体获得未公开或定向的服务接口。
- 知乎数据 API 的价格、配额、数据保留和二次处理条件。
- 小红书分享 SDK 在桌面工作台中的用户体验，以及能否安全落到“打开官方 App 并确认”。
