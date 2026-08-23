# 小红书 / 抖音闭环：开源实现审计与组合结论

更新时间：2026-08-23

## 0. 执行结论

没有一个已审计的开源项目可以不经修正，可靠地完成“素材进入 → 内容处理 → 人工确认 → 小红书/抖音发布 → 可核验回执 → 后续反馈”的双平台闭环。

但以下组合已经覆盖了闭环所需的主要执行能力，不需要从浏览器自动化、登录态、上传和发布页面重新造轮子：

| 闭环部位 | 首选实现 | 复用方式 | 选择理由 |
| --- | --- | --- | --- |
| DSH 控制面 | `dsh-social-workbench` + WorkSurface + Credentials/Settings | 自有薄编排层 | 保存版本、确认、状态和证据；不复制平台自动化 |
| 小红书发布与本人账号反馈 | [`xpzouying/xiaohongshu-mcp`](https://github.com/xpzouying/xiaohongshu-mcp) | 固定版本的本机 sidecar | Apache-2.0；图片/视频发布、本人主页、笔记详情；构建和包测试通过 |
| 抖音发布与队列核验 | [`ChronoAIProject/broadcast-kit`](https://github.com/ChronoAIProject/broadcast-kit) | 修补后固定版本 sidecar | 已实现封面检查、提交稳定等待、作品队列核验和证据文件；测试通过 |
| 内容阶段与确认模型 | [`agent-xiaohongshu-workbench`](https://github.com/EthanYoQ/agent-xiaohongshu-workbench) | 复用契约、状态机和测试思想 | 发布默认关闭、一次性确认、不可变产物、只有已核验结果进入历史 |
| 素材/任务/账号工作台 | [`OmniPost`](https://github.com/RbBtSn0w/omni-post) | 参考或选择性移植有许可证的组件 | 完整的素材、账号、任务、锁和前后端结构；不采用其发布成功判定 |
| 公开趋势采集 | 小红书 MCP 搜索；用户提供的抖音 URL/自有账号数据 | 可选、风险分级 | 第一阶段不把非官方全站爬虫当必需依赖 |

这不是把两个 sidecar 包装成一个假的通用 `publish()`。控制面只统一有共同语义的部分：草稿快照、账号引用、用户确认、执行尝试和 receipt。平台动作保持独立 adapter contract。

## 1. 审计方法：以闭环事实为准

### 1.1 最小闭环

```text
用户素材 / 已授权账号数据
  → 可追溯的 brief
  → 平台专属草稿和媒体
  → 冻结 revision
  → 用户对账号、平台、可见性、revision 单次确认
  → 平台 adapter 提交
  → 平台侧反查
  → confirmed / failed / unknown receipt
  → 只有 confirmed 进入发布历史与反馈分析
```

### 1.2 验收不变量

一个候选项目只有同时满足下列事实才算“闭环执行器”，而不是演示脚本：

1. 能在固定版本上安装、构建或运行测试；
2. 登录态和凭据不经过模型上下文，不提交进 Git；
3. 发布前能冻结内容和目标账号，并要求用户确认；
4. “点击发布按钮”只代表 `submitted`，不代表 `confirmed`；
5. 能通过创作者中心、本人主页、官方 API、SDK 回调或公开 URL 反查结果；
6. 超时或页面变化返回 `unknown`/`failed`，不得伪造成功；
7. 保存足以复核的机器可读 receipt 和必要截图/响应证据；
8. 同一流程至少重复成功两次，才称为可重复闭环。

### 1.3 状态语义

第一阶段只采用以下状态：

```text
prepared
  → confirmed_for_submit
  → submitted
  → confirmed
  ↘ cancelled | failed | unknown
```

- `submitted`：执行器有证据表明提交动作已发生。
- `confirmed`：平台侧反查到与本次 revision 相符的新作品。
- `unknown`：提交可能发生，但没有足够证据判断最终状态。它不能进入发布历史，也不能自动重试。

## 2. 固定版本与本机验证

所有结果均在 2026-08-23 的独立临时 checkout 上完成，按 commit 固定，而不是按会移动的默认分支判断。

| 项目 / commit | 许可证 | 实际验证 | 发布事实审计 | 结论 |
| --- | --- | --- | --- | --- |
| `xpzouying/xiaohongshu-mcp` `6fb866a7db4e3dcce8dc00a0dde07370f3b12946` | Apache-2.0 | `go test ./pkg/...`、全包编译检查、`go build ./...` 通过 | 必须离开发布页才返回成功；仍不直接返回笔记 ID/URL | **小红书首选 sidecar**，外加本人主页反查 |
| `ChronoAIProject/broadcast-kit` `94cf038f7ed65f0b6d351368c7236ba6faaf9849` | LICENSE 为 MIT；包元数据错误写为 Proprietary | 28 个测试和 4 个 subtest 通过；`doctor` 通过浏览器检查，发现本机缺 ffmpeg | 抖音平台 CLI 有封面+提交+队列三重判定；通用 dispatcher 会绕过三重判定 | **抖音首选 sidecar**，先修 truth gate 与许可证元数据 |
| `EthanYoQ/agent-xiaohongshu-workbench` `c918fe1e6975084a867a388f75b0f598b2f7e70b` | MIT | 47/47 测试通过；Vite build 通过 | 明确 preview/confirm/publish；要求 ID/URL；unknown 不进 story | **复用状态机、schema、guard tests**，不整体嵌入 DSH |
| `RbBtSn0w/omni-post` `06e0ac33cef824b9cc53f0d5dfffbbf49e090c79` | MIT | workspace check、build、前端 185/185、shared 18/18；后端 161 通过/1 失败/1 跳过，另有两个 suite 缺指定 Playwright 浏览器 | 小红书会吞掉等待超时后把任务标为完成；无结构化平台 receipt | **只参考工作台和锁设计** |
| `dreammis/social-auto-upload` `1c66b7db4b30585bbb40c58eb0aa572ffa3cce97` | MIT | 补临时配置后定向测试 14 通过/3 失败 | 小红书等待成功 URL，抖音等待管理页；没有结构化 ID；干净安装缺 gitignored 配置且 Playwright 依赖漂移 | **参考/选择性 fork 模块**，不直接依赖 |
| `bin0o0o0/social_media_pubulish_MCP` `905947ee478c3b5134c8b815304c3dcb9bd46ceb` | 未发现许可证 | 45/45 测试、typecheck 通过；生产依赖 5 个审计问题 | 有私密可见性和短信续接；抖音成功仅代表点击按钮，状态字段也自相矛盾 | **仅参考交互设计** |
| `lancelin111/douyin-mcp-server` `594290ded2d02611f361475782d20d3bd0dac417` | MIT | 14/14 测试和 build 通过；生产依赖 15 个审计问题 | 点击发布后即返回 `success: true`；测试未覆盖真实发布事实 | **拒绝作为执行依赖** |
| `Kuhakucai/douyin-mcp` `53c888a5e1d83ea70978e71432ad8774707d69b7` | AGPL-3.0-only | `doctor` ready；仓库未发现可运行测试，pytest 返回 no tests | 自有账号可见数据同步/分析，不负责发布 | 可选独立分析 sidecar；MVP 不引入 |
| `NanmiCoder/MediaCrawler` `d6f7c5bb906b6dac40ddf343ef9e26438a3de092` | 限非商业学习用途 | 代码与入口审阅 | 浏览器 Cookie、私有接口和签名，能采集抖音/小红书公开内容 | 仅作显式风险确认的个人研究 sidecar，默认关闭 |
| `content-pilot` `061eb9c2ea2b387084ac217cdc81c38f3cd522f9` | MIT | 154 测试通过；ruff 发现 189 项 | 小红书/抖音等待超时后仍返回成功；小红书视频路径调用图片发布 | **拒绝运行时**；可参考内容/UI 分层 |
| `mcp-social-publisher` `1c0059ea295ed16ee48c81f8f5bf5bd1e199d27a` | MIT | 1 个测试 | 小红书为人工交接，未提供双平台真实执行 | 不承担双平台闭环 |
| `DouPipeline` `7525494da3854b06c878528567f43139e4fbb693` | 未发现许可证 | 无测试；代码审阅 | 硬编码默认值且存在误报成功 | 拒绝 |
| `qianjin-content-repurposer` `5d5a0a1d6950972437b84932c0695301f2f272f8` | MIT | 内容审阅 | 提示词/检查表库，不是运行时 | 可选择性复用 prompts/checklists |

说明：这些测试证明的是仓库在固定版本上的可安装性和局部契约，不等于已使用用户账号完成真实发布。真实平台写入必须在用户登录并确认测试内容后单独验收。

## 3. 为什么选择组合，而不是某个“一体化平台”

### 3.1 `xpzouying/xiaohongshu-mcp` 补齐小红书执行事实

它已具备登录、图片/视频发布、搜索、本人主页、feed 详情、评论、点赞和收藏等能力。发布函数的成功门至少要求浏览器离开 `/publish/publish`，比“按钮点击成功”更可靠，但还不是最终平台 receipt。

可以用其已有能力补齐反查：

1. 发布前读取 `get_my_profile(tab=note)`，记录基线 feed ID 集合；
2. 使用唯一的测试 marker 和冻结的 title/body/media count 发布；
3. 发布后轮询本人主页，寻找基线后新增且标题相符的 feed；
4. 取得 `feed.id` 和 `xsec_token` 后调用 `get_feed_detail`；
5. 校验正文 marker、媒体数量和类型；
6. 全部吻合才生成 `confirmed` receipt，否则保留 `submitted` 并最终落为 `unknown`。

测试模式必须由 DSH wrapper 强制 `仅自己可见`；不能依赖上游默认值，因为该项目省略可见性时默认公开。

### 3.2 `broadcast-kit` 最接近可核验的抖音发布器

它已经实现了最难重复造的浏览器执行细节：上传稳定等待、封面生成与核验、提交后的页面稳定、作品队列按标题/定时信息反查、截图和文本证据、统一 receipt 外形、dry-run 与 doctor。

但接入前必须修复两个问题：

1. 平台 CLI 要求 `verdict=success && cover_verified && queue_verified=true`，通用 dispatcher 却只看 `verdict` 就写顶层 `status=success`。DSH adapter 必须直接执行三重 gate，不能信任当前顶层 success。
2. 仓库 LICENSE 是 MIT，`pyproject.toml` 却声明 Proprietary。固定 fork 必须先把包元数据改为与 LICENSE 一致，并保留上游版权信息。

此外还需把账号和可见性放入确认快照；测试运行应优先选择仅自己可见。如果上游无法可靠选择可见性，则第一次真发布必须改走平台草稿或人工发布，不以默认公开内容做自动化测试。

### 3.3 OmniPost 和 agent-xhs-workbench 各取所长

OmniPost 的价值是成熟产品骨架：素材、账号、任务、并发锁、前后端 API 和多平台扩展位置。它的小红书执行器会吞掉成功页等待超时，并让任务完成，因此不能作为 receipt 真相源。

agent-xhs-workbench 的价值是安全和事实模型：

- 新账号默认空白、发布能力默认关闭；
- research → draft → humanize → images → review → publish 的阶段状态机；
- 发布前冻结 revision，确认只对该 revision 生效；
- `failed`/`unknown` 不进入已发布 story；
- 保存草稿时以“新增记录 + 精确标题 + 图片数量”反查，而不是以点击行为判定。

这些契约适合移植到 DSH；其 React/Vite 应用和 OpenCLI runtime 不需要整体嵌入。

## 4. 目标组合架构

```text
DSH Social Workbench（控制面）
├── Ingress
│   ├── user_asset / user_url                 默认、安全
│   ├── xhs.search_public                     xhs-mcp，可选
│   ├── xhs.account_feedback                  xhs-mcp
│   └── douyin.account_feedback               broadcast-kit metrics / 后续官方 API
├── Knowledge
│   ├── WorkSurface revision                  素材、brief、草稿、证据
│   └── Personal Knowledge proposal           只保存用户确认的长期偏好
├── Processing
│   ├── brief extractor
│   ├── xhs graphic/video renderer
│   └── douyin video/caption renderer
├── Approval
│   └── one-time confirmation(platform, accountRef, visibility, revisionHash)
├── Execution adapters
│   ├── xhs.creator_browser → xiaohongshu-mcp
│   ├── douyin.creator_browser → patched broadcast-kit
│   ├── douyin.official_openapi               凭据/权限可用后优先
│   └── mobile_share_handoff                  浏览器执行失效时的官方/人工降级
└── Receipt verifier
    ├── xhs: baseline + my-profile + detail
    └── douyin: cover + submit + creator-queue
```

这里有共同语义的只有控制记录，不是平台动作本身。建议的 adapter operations 是：

```text
doctor()
ensure_session(accountRef)
prepare(revision, options)
submit(confirmationToken)
verify(attemptId)
cancel(attemptId)
```

`search_public`、`fetch_account_feedback`、`save_draft`、`publish_creator_browser`、`publish_official_openapi` 是不同操作语义，不能为了接口数量少而合并。

## 5. 最小 receipt contract

```json
{
  "schemaVersion": "social-workbench.receipt/v1",
  "attemptId": "attempt_...",
  "platform": "xiaohongshu",
  "operation": "publish_creator_browser",
  "accountRef": "credential-ref-only",
  "revisionHash": "sha256:...",
  "visibility": "private",
  "state": "confirmed",
  "submittedAt": "2026-08-23T00:00:00Z",
  "confirmedAt": "2026-08-23T00:00:20Z",
  "platformObject": {
    "id": "opaque-platform-id",
    "url": "https://..."
  },
  "checks": [
    {"name": "new_creator_record", "result": "pass"},
    {"name": "title_marker", "result": "pass"},
    {"name": "media_count", "result": "pass"}
  ],
  "evidenceRefs": ["worksurface://.../evidence/..."],
  "error": null
}
```

约束：

- receipt 不保存 Cookie、二维码、短信或明文凭据；
- adapter 原始输出作为 evidence 保存，但领域状态由 verifier 得出；
- `platformObject.id/url` 缺失且没有等价平台回执时，不得标为 `confirmed`；
- 自动重试仅允许发生在明确未提交的可恢复步骤；`submitted`/`unknown` 必须先反查或人工处理，防止重复发帖。

## 6. Walking skeleton：按真实风险排序

### Phase A：无账号的契约闭环

1. 建立 revision、一次性确认、attempt 和 receipt schema；
2. 用 fake adapter 覆盖 success、timeout、unknown、重复提交和 revision 变化；
3. 接入 sidecar `doctor`，验证浏览器、ffmpeg、profile root、版本和许可证清单；
4. 确认日志中只有 credential ref，没有 Cookie/短信/密钥。

这不是用 mock 代替平台验收，而是先证明控制面不会把误报放大成业务事实。

### Phase B：小红书真实私密闭环

1. 用户扫码登录测试账号；
2. 选择一组用户自有图片或视频；
3. DSH 生成带唯一 marker 的草稿并冻结 revision；
4. 用户确认账号、`仅自己可见`、内容和本次执行；
5. sidecar 发布；
6. 本人主页和详情反查得到 feed ID，保存 receipt；
7. 换一份内容重复一次。

### Phase C：抖音真实私密闭环

1. 安装 ffmpeg，固定并修补 `broadcast-kit`；
2. 用户扫码登录测试账号；
3. 先 dry-run，保存封面/页面证据但不提交；
4. 用户再次确认账号、可见性和 revision；
5. 提交后要求封面核验、submit verdict、creator queue 三者都通过；
6. 保存队列证据与 receipt；
7. 换一份内容重复一次。

若无法明确设置私密可见性，Phase C 停在 dry-run，改走人工/官方移动分享，不擅自公开发布。

### Phase D：输入与反馈闭环

1. 小红书使用受控搜索和本人主页数据作为第一批输入；
2. 抖音默认接收用户 URL 与本人创作者数据；
3. 把新观察写成 research observation，不直接写长期用户画像；
4. 发布后按 receipt ID 拉取表现数据，生成“继续/修改/停止”建议；
5. 只有用户确认的稳定偏好才提交 Personal Knowledge proposal。

## 7. 不进入 MVP 的能力

- 不默认启用 MediaCrawler 或逆向私有接口做全站采集；
- 不自动给陌生用户评论、点赞、私信或批量关注；
- 不把相亲/社交账号的敏感个人信息收集作为通用 ingestion；
- 不做无人值守公开发布；
- 不把模型猜测的偏好直接写入长期知识；
- 不因两个平台都有“发布”按钮，就假定参数、审核、可见性和 receipt 语义相同。

## 8. 当前已知缺口与真实运行门

无账号可完成的 1–5 项现已实现并有自动化证据；当前剩余工程缺口是：

1. 将 staging Host 插件实际链接到本机 DSH profile，并验证新 Agent 的 L1 tool surface；
2. Credentials/Settings 与 sidecar 进程生命周期的正式 Host 装配；当前固定 sidecar 由本机 CLI 管理，登录态不进入模型或仓库；
3. 两个平台各两次用户参与的真实私密发布证据；
4. 以 receipt ID 回读本人账号表现数据并形成第一轮反馈建议。

真实发布前必须由用户提供或确认：

- 可用于测试的账号并亲自完成扫码/短信；
- 用户拥有权利的测试媒体；
- 每次执行的最终内容、目标账号和可见性；
- 是否允许在测试失败时保留本地页面截图作为诊断证据。

这些是外部授权门，不是理由不做控制面、sidecar 修补、无账号测试和 dry-run。

## 9. 决策

1. **不采用单一一体化开源项目。** 当前候选不是存在误报成功，就是缺双平台、缺许可证或不适合作为 DSH 事实源。
2. **小红书选择 `xpzouying/xiaohongshu-mcp` 固定 sidecar。** 复用其真实浏览器操作，并由 DSH 增加私密默认、基线反查和 receipt gate。
3. **抖音选择修补后的 `broadcast-kit` 固定 sidecar。** 复用上传/封面/队列核验，但 DSH 不接受其当前通用 dispatcher 的宽松 success。
4. **控制面只实现无法外包的领域事实。** 包括 revision、确认、attempt、状态迁移、receipt、去重和证据引用。
5. **优先复用契约和组件，不复制整套产品。** agent-xhs-workbench 提供安全状态机；OmniPost 提供工作台和并发设计参考；现有 DSH 服务提供身份、凭据、文件、知识和 UI 生命周期。
6. **官方能力可用时优先。** 抖音 OpenAPI/Share SDK 与小红书 Share SDK 是独立 adapter；浏览器自动化是本机回退，不是永久唯一通道。

该决策把“先跑通”落实为两条可验证的垂直链路，同时保留将来替换执行器的边界；不会为了未来扩展先造一个没有真实平台证据的通用中台。
