# 开源项目评估

核验日期：2026-08-23。本表用于决定“复用、适配还是只参考”，不等于完成了供应链、许可证或安全审计。

## 结论

没有一个成熟项目同时可靠覆盖“跨平台采集 + 证据化需求分析 + 多模态生产 + 国内外合规发布”。最可行的路线是组合：

- 获取层：RSS/官方 API 为主，RSSHub 为公开网页到 feed 的可替换适配层。
- 工作流层：DSH 自己持有证据、分析、版本、批准和审计；不把核心事实寄存在第三方调度器中。
- 国际发布层：优先验证 Postiz 的 API/MCP，而不是复制其全部平台适配代码。
- 国内发布层：有官方 API 时直连；无通用 API 时生成交接包。
- 通用自动化：Activepieces 可作为外部工作流/连接器参考，不应替代本插件的领域状态机。

## 重点项目

| 项目 | 许可证/开放性 | 可复用价值 | 主要限制 | 决策倾向 |
| --- | --- | --- | --- | --- |
| [RSSHub](https://github.com/DIYgod/RSSHub) | AGPL-3.0 | 大量网站到 RSS 的 route；适合作为公开信息输入 | 非官方 route 会随 DOM/风控失效；自托管和网络服务分发需做 AGPL 审查 | 通过 HTTP 委托集成，保留原来源 URL，不复制 route 代码 |
| [Folo](https://github.com/RSSNext/Folo) | AGPL-3.0 + 图标例外 | AI 阅读、摘要、翻译和多媒体 feed 的产品参考 | 是完整阅读器，不是轻量 connector SDK | 参考 Inbox/阅读体验，不作为核心依赖 |
| [Crawl4AI](https://github.com/unclecode/crawl4ai) | Apache-2.0 | 对没有 feed 的、允许抓取的网页做结构化提取 | 通用爬虫不提供平台授权；不能绕过条款和访问控制 | 仅用于白名单网页 connector，默认禁用社媒登录态抓取 |
| [yt-dlp](https://github.com/yt-dlp/yt-dlp) | 源码 Unlicense；发行包含多种许可证 | 获取公开媒体元数据、字幕或用户有权处理的媒体 | extractor 易变，下载行为有版权/条款风险，可能需额外 JS runtime | 不作为默认采集器；按来源、权利和子进程风险单独评审 |
| [gallery-dl](https://github.com/mikf/gallery-dl) | GPL-2.0 | 图片/媒体提取能力广 | 常需 Cookie/OAuth；登录态与账号风控风险高 | 不纳入 MVP；仅研究参考 |
| [Postiz](https://github.com/gitroomhq/postiz-app) | AGPL-3.0 | 多平台 OAuth、媒体上传、调度、分析、公开 API 和 MCP；平台 schema 可发现 | 国内平台覆盖弱；服务依赖和 AGPL 边界需审查；平台权限仍由账号决定 | 首选“委托发布层”候选，通过 API/MCP 集成 |
| [Mixpost Lite](https://github.com/inovector/mixpost) | 仓库标为 MIT，Pro/Enterprise 商业 | 自托管日历、排程和社媒管理 UI | Lite 与商业版功能边界需逐项确认；不是需求挖掘系统 | 产品交互参考，非首选运行时依赖 |
| [Activepieces](https://github.com/activepieces/activepieces) | Community/core 与企业能力并存，需文件级审查 | TypeScript pieces、MCP、人工审批、重试和版本化 workflow | 通用编排不理解证据/需求/内容批准语义 | 参考 connector SDK；必要时作为外部执行器 |
| [n8n](https://github.com/n8n-io/n8n) | fair-code/source-available，不是标准 OSI 开源 | 广泛集成和工作流生态 | 许可证与可嵌入/再分发限制；领域状态仍需自建 | 可作为用户已有服务的适配对象，不嵌入 |
| [multi-platform-publisher](https://github.com/mguozhen/multi-platform-publisher) | MIT | MCP/CLI、平台变体、dry-run、微信草稿和国内平台 playbook | 项目较新；部分平台使用 Cookie、浏览器自动化或人工流程 | 参考 capability manifest、错误模型和交接流程，不直接信任其“支持”标签 |
| [mcp-social-publisher](https://github.com/kevinten-ai/mcp-social-publisher) | MIT | 面向 AI 的多平台发布工具表面 | README 宣称与实际 adapter、官方/非官方方式需逐项代码验证 | 作为候选代码审计样本，不进 MVP 依赖 |
| [OmniPost](https://github.com/RbBtSn0w/omni-post) | 本轮未完成许可证确认 | 国内短视频多平台 UI/流程参考 | 多数能力可能依赖浏览器自动化；成熟度和许可待查 | 暂不复用 |
| [tubban1/leadgen](https://github.com/tubban1/leadgen) | README 称 MIT，但固定版本无 LICENSE、API 未识别 | 发现→富化→配置生成→部署→草稿的纵向闭环；配置驱动多租户 renderer | 仓库极新，无测试/CI，关键模块不可导入、schema 冲突、明文密码、事实生成和外部动作安全问题；不是社交 adapter 框架 | 仅 `reference`；详见[专项审计](candidates/tubban1-leadgen.md) |

## 可借鉴的设计

### 从 Postiz 借鉴

- 平台能力/字段 schema 动态发现，而不是在 AI 提示词里硬编码全部字段。
- 上传媒体和发布分步，返回可追踪的 integration/post ID。
- MCP 只是一个调用表面，真实授权和调度仍由服务端控制。

官方文档：[Postiz MCP](https://docs.postiz.com/mcp/introduction)。

### 从 RSSHub/Folo 借鉴

- route/来源定义和阅读状态分离。
- 输入统一为 feed 后，下游不再依赖每个站点 DOM。
- 摘要和翻译是派生视图，原始条目仍然保留。

RSSHub route 索引：[Routes](https://rsshub.netlify.app/routes)。

### 从 Activepieces 借鉴

- connector/piece 使用统一类型系统。
- 自动重试、分支、人工输入和版本化 flow 是执行层基本能力。
- 每个 piece 可暴露 MCP，但工作台不能把所有外部动作无差别交给模型。

### 从国内小型项目借鉴

- “平台变体”要包含字符限制、标题、话题、封面和媒体检查，不只是改语气。
- 微信公众号默认落草稿是合理的安全产品决策。
- 对无 API 平台应明确显示 `manual` 或 `browser-assisted`，不能用一个绿色“支持”掩盖方式差异。

### 从 `tubban1/leadgen` 借鉴

- 保留 Discovery、Enrichment、Transformation、Deployment、Outreach 的阶段边界，但用 typed result、checkpoint、policy gate 和 receipt 重新定义。
- 参考“一份配置驱动一个多租户 renderer”，不复制它的模板、数据库或凭据实现。
- 把邮件默认草稿的局部选择推广成所有发布 Tool 的强制批准边界。
- 把它暴露出的失败模式纳入 conformance：生成事实不得伪装成观察事实，partial failure 不得写成 deployed，admin/credential 字段不得出现在公开 API 或日志。

## 明确不采用的做法

- 把浏览器 Cookie 写进普通 JSON、环境示例、聊天或 Agent 上下文。
- 把 CDP、Playwright 或 Appium 自动操作包装成“官方 API”。
- 通过私有接口、签名逆向或反检测来追求平台数量。
- 直接 fork 一个完整发布系统并在 DSH 内维护第二套账号、日历、审批和凭据真相。
- 只看 stars 或 README 平台列表，不验证许可证、commit 活跃度、测试、官方权限和失败处理。

## 进入实现前的代码审计项

对每个候选依赖至少检查：固定 commit/tag、LICENSE 和依赖许可证、凭据存储、网络目标、遥测、SSRF/文件上传、OAuth state/PKCE、token 刷新、队列幂等、失败重试、删除/撤权、维护活跃度和平台条款。审计结论记录为 ADR，不能只写在聊天里。
