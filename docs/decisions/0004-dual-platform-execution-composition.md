# ADR-0004：以两个可核验执行 sidecar 组合双平台 walking skeleton

- 状态：Accepted for spike
- 日期：2026-08-23

## 背景

小红书和抖音已有多个浏览器自动化、MCP 和一体化内容工作台项目。代码审计与本机测试表明，没有单一候选同时满足双平台、许可证清晰、干净安装、人工确认、平台反查和无误报 success。

闭环的核心事实不是“调用了同名 publish 函数”，而是冻结的内容 revision 经用户授权后，在指定账号和可见性下产生了可反查的平台对象。

## 决策

1. 小红书执行采用固定版本 `xpzouying/xiaohongshu-mcp@6fb866a7db4e3dcce8dc00a0dde07370f3b12946` sidecar。
2. 抖音执行采用修补后的 `broadcast-kit@94cf038f7ed65f0b6d351368c7236ba6faaf9849` sidecar；修补许可证元数据，并让所有入口执行封面、提交、创作者队列三重 success gate。
3. DSH 拥有 revision、一次性确认、attempt、receipt、去重、证据索引和状态迁移；sidecar 只拥有平台浏览器执行。
4. `submitted` 与 `confirmed` 分离。小红书必须以本人主页新增 feed 加详情匹配反查；抖音必须以创作者队列反查。超时落为 `unknown`。
5. 测试模式强制显式私密可见性。不能证明私密设置时，只允许 dry-run、保存草稿或人工/官方分享交接。
6. `search_public`、`fetch_account_feedback`、`publish_creator_browser`、`publish_official_openapi` 和 `mobile_share_handoff` 保持不同操作语义，不合并成万能 adapter 方法。

## 可复用范围

- 从 `agent-xiaohongshu-workbench` 复用阶段状态机、发布默认关闭、revision confirmation、unknown 不进历史和 verifier 测试思想。
- 从 OmniPost 参考素材/账号/任务/锁和前后端组织，不采用其 publish success 作为业务事实。
- 从现有 DSH 复用 Credentials、Settings、WorkSurface、Personal Knowledge、附件、Locale 和 Cordis 生命周期。
- 不复制无许可证候选代码；AGPL 或限非商业候选仅以独立 sidecar/设计参考方式评估。

## 后果

- 首次实现只需薄控制面、两个 adapter bridge 和 verifier，不重写平台自动化。
- 系统会诚实产生 `unknown`，需要反查/人工处理；这是防止重复发布和虚假成功所必需的。
- 浏览器页面变化仍会导致维护成本，但故障被限制在可替换 sidecar 内。
- 真实闭环验收仍需用户扫码、用户自有测试素材和逐次确认；无账号测试不能替代平台证据。

## 复审条件

以下任一条件发生时复审：

- 抖音官方 OpenAPI 权限已获批并完成真实创建/查询回执；
- 小红书提供可用的服务器发布/查询官方 API；
- sidecar 连续两次因页面变化失效；
- 两个平台各两次私密发布成功后，发现 control-plane contract 无法表达真实失败语义。

完整证据和候选矩阵见 `docs/OPEN_SOURCE_DUAL_PLATFORM_AUDIT.md`。
