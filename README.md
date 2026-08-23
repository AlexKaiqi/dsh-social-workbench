# DSH Social Workbench

一个面向 DSH 的“社会信息与内容工作台”研究项目：从多个公开或已授权来源获取信息，保留证据，挖掘需求信号，形成内容 brief 和平台变体，经人工批准后发布，再把表现数据回流到下一轮判断。

> 状态：Research complete / executable Host + Client capability workbench + dual-platform walking skeleton，创建于 2026-08-23。仓库已有可见能力/健康工作台、DSH 模型侧素材—brief—内容包装配、发布事实核心和固定 sidecar 安装器；真实发布仍要求用户登录、私密可见性和逐次一次性确认。

## 结论先行

目标不应实现成一个包含大量脆弱脚本的“万能社媒机器人”。更稳定的结构是：

```text
公开/授权来源
  -> 连接器能力登记
  -> 原始证据与标准化 SourceItem
  -> 需求信号与主题聚类
  -> ContentBrief 与可追溯主张
  -> 各平台独立内容变体
  -> 人工批准 + 发布 Outbox
  -> 官方 API / 委托发布层 / 人工交接
  -> 指标回流与假设复盘
```

连接器是可替换的边缘，证据、分析对象、内容版本、批准记录和结果回流才是工作台的长期资产。

## 第一阶段范围

- 采集：RSS/Atom、官方搜索或数据 API、用户授权账号、可审计的外部聚合器。
- 分析：去重、主题聚类、需求信号、证据引用、置信度和反例。
- 生产：内容 brief、事实主张、素材引用、平台格式约束和版本化变体。
- 发布：预览、批准、幂等队列、状态追踪、失败隔离、人工交接。
- 反馈：官方可得的曝光、互动和内容状态；不把代理指标伪装成真实需求。

暂不进入范围：私密资料采集、相亲或社交 App 中个人档案批量筛选、跨平台身份归并、自动私信、账号养号、验证码绕过、风控规避，以及无人工批准的自主发布。

## 调研导航

- [最终架构与组件调研报告](docs/FINAL_ARCHITECTURE_REPORT.md)
- [双平台开源执行器固定版本审计](docs/OPEN_SOURCE_DUAL_PLATFORM_AUDIT.md)
- [双平台运行手册](docs/DUAL_PLATFORM_RUNBOOK.md)
- [能力工作台真实装配与浏览器验收](docs/WORKBENCH_ACCEPTANCE.md)
- [工作台操作面与共享浏览器决策](docs/decisions/0006-operating-surface-and-browser.md)
- [八条独立研究问题](docs/research/README.md)
- [架构推导](docs/ARCHITECTURE.md)
- [四阶段开源框架与适配器生态](docs/FRAMEWORK_MATRIX.md)
- [Adapter 架构与 conformance](docs/ADAPTER_ARCHITECTURE.md)
- [Adapter 生态与平台能力交叉调研](docs/ADAPTER_CATALOG_SURVEY.md)
- [组件复用策略与候选清单](docs/COMPONENT_REUSE_PLAN.md)
- [小型、团队和平台化参考组合](docs/REFERENCE_STACKS.md)
- [平台接入矩阵](docs/PLATFORM_MATRIX.md)
- [开源项目评估](docs/OPEN_SOURCE_LANDSCAPE.md)
- [调研问题与证据标准](docs/RESEARCH_PLAN.md)
- [分阶段路线](docs/ROADMAP.md)
- [关键架构决策](docs/decisions/0001-research-baseline.md)
- [四类 Port 与控制面决策](docs/decisions/0002-four-ports-and-control-plane.md)
- [组件优先复用决策](docs/decisions/0003-reuse-before-build.md)
- [双平台执行组合决策](docs/decisions/0004-dual-platform-execution-composition.md)
- [能力目录与健康工作台决策](docs/decisions/0005-capability-workbench.md)
- [候选领域契约](spec/README.md)

### 候选项目专项审计

- [`tubban1/leadgen`](docs/candidates/tubban1-leadgen.md)：已完成固定版本审计；仅作阶段化闭环与多租户配置渲染参考，不进入运行时。

## 当前可运行切片

- `dsh/`：Cordis Host staging service、模型提示和有界工具；工具只有 `ingest/create_brief/build_package/read/status/help`，不暴露登录、确认或发布。
- `client/`：DSH Session 中的只读 Social Workbench view；主屏围绕当前闭环、流水线、下一步和平台执行，完整能力 conditions 下沉到“系统”视图。
- `spec/capability-snapshot.schema.json`：Host 与 Client 的版本化能力快照；实现成熟度与当前健康状态分开表达。
- `runtime/`：不可变 revision、媒体/执行 manifest SHA-256、一次性确认、attempt/receipt 状态机；19 个执行层测试通过。
- `third_party/sidecars.json`：小红书与抖音执行器的固定 commit 和许可证清单。
- `scripts/bootstrap-sidecars.mjs`：幂等安装、固定 commit、补丁哈希、Go/Python/Chromium/ffmpeg 构建；不会登录或发布。
- 小红书 adapter：强制测试私密可见、发布前本人主页基线、发布后新增 feed 与详情反查。
- 抖音 adapter：只调用严格平台 CLI，要求 submit、封面、私密可见性和创作者队列全部通过。

根级契约、Host、RPC、probe 与 Client 测试另有 17 个。运行 `npm run check`；进一步操作见 [双平台运行手册](docs/DUAL_PLATFORM_RUNBOOK.md)。

## 当前建议

1. 用 RSSHub/RSS 作为公开信息采集的第一条通路，但把路由失效、版权和平台条款视为连接器风险。
2. 国际平台发布优先评估 Postiz 作为委托发布层，避免重复维护十几个 OAuth 和媒体上传协议。
3. 国内平台仅对已经验证的官方能力做直连；小红书、视频号等没有通用服务器发布证据的平台先采用“生成素材 + 人工交接”。
4. MVP 先证明一条完整、可追溯的闭环，而不是追求平台数量。

## 当前 DSH 装配边界

`plugin-spec.json` 声明已经完成的 Host staging 与只读 Client 工作台事实：模型提示、一个 staging 工具、本地不可变对象写入、健康探测 RPC 和版本化 JSON 契约。Social Workbench 通过 `conversation.view` 成为 Session 工作面；可见浏览器由 profile 组合的 Browser Use 插件持有，同一 Session 的用户与 Agent 共享页面，不把 Cookie 交给本插件。真实发布仍没有注册成模型工具；Client 只接收不含凭据的 snapshot，也不持有确认或发布权限。
