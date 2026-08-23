# 抖音 + 小红书：最小可运行闭环

更新时间：2026-08-23

## 结论

第一阶段不实现“统一社交平台中台”。先跑通一条可观察、可重复的真实链路：

```text
3–10 条用户提供的素材/链接
  → 提取需求与内容 brief
  → 生成抖音版和小红书版草稿
  → 人工审阅同一组媒体与文案
  → 手机端进入平台官方发布界面
  → 用户确认发布
  → 回填可核验的发布结果
```

这条链路刻意避开两个当前没有可靠官方依据的承诺：全站自动采集，以及小红书服务器静默发布。

## 1. 什么算“跑通”

一次运行必须保存以下最小证据：

- 输入：原始 URL、截图、文字或媒体附件；
- 中间结果：一个 brief、两个平台草稿、被用户确认的最终媒体；
- 执行：平台、账号引用、执行方式、开始时间；
- 结果：`confirmed`、`cancelled`、`failed` 或 `unknown`；
- receipt：平台回调/session id、公开 URL、截图或用户确认，至少一种；
- 第二次使用同一流程重复成功，才认为链路成立。

不要用“点击过发布按钮”代替发布成功，也不要在没有公开 URL 或平台回执时伪造平台内容 ID。

## 2. 已验证的平台现实

### 2.1 抖音

抖音存在两条不同路径，不应过早合并：

1. **移动分享 SDK**：把本地图片或视频交给抖音编辑/发布页面，由用户继续编辑并确认。Android 回调可区分成功、取消、保存草稿、素材不支持等结果，并可携带 `share_id`。
2. **服务器 OpenAPI**：OAuth 后上传视频，再调用创建视频接口。`video.create`、`video.list`、`video.data`、`video.delete` 等权限需申请和用户授权；创建后还要经过平台审核。官方明确要求每次代用户发布都应让用户感知。

采集也有边界：`video.list` 是授权账号自己的作品列表；关键词视频搜索属于特殊权限，不能当作默认可用的全站数据源。

官方依据：

- [网站应用 OAuth](https://open.douyin.com/platform/resource/docs/develop/permission/web/oauth2)
- [应用类型与权限](https://open.douyin.com/platform/resource/docs/accession-guide/type-and-permission)
- [视频上传](https://open.douyin.com/platform/resource/docs/openapi/video-management/douyin/create/upload/)
- [创建视频](https://open.douyin.com/platform/resource/docs/openapi/video-management/douyin/create/create-video)
- [授权账号视频列表](https://open.douyin.com/platform/resource/docs/openapi/video-management/douyin/search-video/account-video-list)
- [Android 分享 SDK](https://open.douyin.com/platform/resource/docs/develop/share/android)
- [分享结果与 `share_id`](https://open.douyin.com/platform/resource/docs/openapi/video-management/douyin/search-video/video-share-result)

### 2.2 小红书

当前公开官方能力是移动分享 SDK。Android SDK 需要登记包名和 App Key，支持 1–18 张图片，或一个视频和可选封面；`shareNote` 返回 `sessionId`，回调可区分成功、用户取消、授权失败、素材缺失等结果。

公开文档没有证明存在可供普通应用使用的通用服务器静默发布 API，也没有证明存在全站搜索/采集 API。因此第一阶段只能承诺：

- 手工把发布包交给小红书 App；或
- 通过官方 Share SDK 调起小红书，由用户确认；
- 以 SDK session、用户回填的公开 URL/截图作为 receipt，不能假定回调会返回公开笔记 ID。

官方依据：

- [小红书分享开放平台](https://agora.xiaohongshu.com/doc)
- [Android 分享 SDK](https://agora.xiaohongshu.com/doc/android)
- [常见问题](https://agora.xiaohongshu.com/doc/qa)

## 3. 三次运行，而不是一次造平台

### Run 0：人工交接，先证明业务闭环

复用已有 DSH 能力：

- WorkSurface/附件保存输入、brief、平台草稿和确认记录；
- Personal Knowledge Base 只存经确认的长期规则，不复制原始会话；
- Pocket 让手机打开同一个 DSH 工作台；
- 工作台生成两个“发布包”：媒体、标题/正文、话题、封面建议和检查表；
- 用户在手机复制/下载，进入官方 App 发布，再回填 URL 或截图。

这一步不需要平台 App Key，也不需要自动化浏览器。它验证的是内容加工、人工确认、移动交接和 receipt 是否真的可用。

### Run 1：薄 Android 分享桥

只有在能申请到两个平台的 App Key 后再做。它不是完整客户端，只负责：

```text
DSH Host 创建一次性 ShareTask
  → 手机打开一次性链接
  → Android 下载已确认媒体
  → 用户选择平台
  → 调用平台官方 Share SDK
  → 回传 ShareResult
  → 用户补充公开 URL（如 SDK 不返回）
```

最小数据形状可以先写成：

```json
{
  "taskId": "share_123",
  "platform": "douyin",
  "mediaType": "video",
  "mediaUrls": ["https://one-time.example/media/123"],
  "title": "已确认标题",
  "body": "已确认正文",
  "hashtags": ["话题一", "话题二"]
}
```

```json
{
  "taskId": "share_123",
  "status": "confirmed",
  "platformSessionId": "opaque-sdk-session",
  "platformUrl": null,
  "errorCode": null,
  "observedAt": "2026-08-23T00:00:00Z"
}
```

只有下列语义现在值得共用：**把已确认媒体交给平台编辑器、用户确认、接收流程结果**。抖音服务器 OpenAPI 不属于这个语义，不塞进同一个 `publish()` 接口。

### Run 2：抖音服务器发布

申请并实际获得 `video.create` 后，再实现 OAuth、token 保管、上传、创建、审核状态与授权账号作品列表。请求字段必须依据届时可访问的官方 schema 和真实沙箱/测试结果实现；当前公开页面没有完整展示创建接口 body 时，不猜字段。

这一条和移动分享桥并存。前者适合已授权账号的工作台发布，后者适合用户在官方 App 中完成最终编辑与确认。

## 4. 信息获取的第一阶段边界

第一阶段 ingress 只接受用户有权提供的内容：

- URL；
- 截图；
- 复制的文字；
- 自有媒体附件；
- 平台允许导出的账号数据；
- 抖音已授权账号 API 返回的数据（权限获得后）。

暂不把“抖音/小红书全站自动采集”列入完成标准。遇到登录墙、验证码、设备指纹或没有公开 API 时，状态必须是 `blocked` 或 `manual_required`，不能降级成暗中保存 Cookie、逆向私有签名或绕过风控。

## 5. 开源项目怎么复用

### `dreammis/social-auto-upload`

固定审计版本：`1c66b7db4b30585bbb40c58eb0aa572ffa3cce97`（2026-08-20）。仓库已有 MIT LICENSE、Playwright/Patchright 上传实现和一定数量的测试。

可参考：

- 抖音和小红书创作者页面的媒体上传步骤；
- 页面元素变化时的错误诊断思路；
- 浏览器 profile 与登录态的本机试跑方法；
- 参数校验和 selector mock 测试。

不直接复用：

- Cookie 数据库、Cookie 导入/导出；
- 小红书私有签名或远程签名服务；
- 无认证 Web 后端；
- 绕过自动化检测的启动参数；
- 无人值守的自动发布承诺。

项目已有公开 issue 对旧 Web 后端提出无认证、Cookie 下载、CSRF、路径处理和依赖风险。因此它只可作为用户明确同意的、本机隔离浏览器 profile 下的非 headless 人工确认 fallback；不能成为 DSH 的默认平台适配层。

依据：

- [`dreammis/social-auto-upload`](https://github.com/dreammis/social-auto-upload)
- [旧 Web 后端安全审计 issue #214](https://github.com/dreammis/social-auto-upload/issues/214)

## 6. 开跑前的真实前置条件

| 项目 | Run 0 | Run 1 | Run 2 |
| --- | --- | --- | --- |
| 抖音和小红书可登录账号 | 必需 | 必需 | 抖音必需 |
| 一条自有测试视频或图片组 | 必需 | 必需 | 必需 |
| Android 手机 | 推荐 | 必需 | 非必需 |
| 平台 App Key | 不需要 | 两个平台需要 | 抖音需要 |
| 抖音 `video.create` | 不需要 | 不需要 | 必需 |
| 用户逐条确认 | 必需 | 必需 | 必需 |

## 7. 验收清单

第一阶段只有满足以下条件才算完成：

1. 同一组来源生成了抖音版和小红书版，而不是复制同一段文字；
2. 用户能在发布前看到最终媒体、正文和目标账号；
3. 两个平台各完成一次真实的、用户确认的发布或草稿保存；
4. 每次都有不夸大的 receipt；
5. 取消和失败不会被记成成功；
6. 同一流程第二次重复时无需改代码；
7. 只有第二次运行暴露出重复逻辑后，才提取共用组件。

## 8. 何时重构

满足以下任一条件再抽象：

- 抖音和小红书的移动交接出现第二份相同状态机；
- 第三个具有同样“官方 App 交接 + 用户确认 + 回调”语义的平台接入；
- 同一种 receipt 校验或重试逻辑在两个实现中重复；
- Run 2 的上传、发布、审核轮询在另一个服务器 API 平台上出现相同语义。

在此之前，不冻结全量领域模型，不拆微服务，不建事件总线，也不要求每个平台实现一套看似统一但实际含义不同的 CRUD 接口。
