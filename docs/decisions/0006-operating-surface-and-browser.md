# ADR 0006：工作台是闭环操作面，浏览器是同一 Session 的执行面

- 状态：accepted
- 日期：2026-08-23
- 决策范围：Social Workbench 产品定位、DSH Client Slot、浏览器组合与 Settings 边界
- 修订：ADR 0005 的 capability/condition 模型继续有效；其“能力目录作为首版主界面”的 UI 决策由本文替代

## 纠正的问题

现有界面把八项 capability、conditions、对象计数和权限边界同时铺在 Settings 中。它证明了 Host snapshot 可以真实反映健康，却没有形成一个能持续工作的操作面：用户看见的是系统内部结构，而不是当前目标、下一步、待审内容、平台执行和反馈。

用户要的不是“另一个监控页”，而是一个从信息到学习的工作面，并且在同一个 DSH Session 内与 Agent 共享浏览器状态。Settings 只应保存连接、账号引用、默认策略和风险门，不承担日常工作。

## 不变量

1. 主界面首先回答：现在在做什么、进行到哪一步、下一步是什么、需要谁决定。
2. 工作对象按业务语义组织，不按代码目录组织：Sources、Signals、Content、Publishing、Learning。
3. capability lifecycle 与 runtime health 仍是系统事实，但只在异常、阻塞和“系统”视图中占据主要空间。
4. 浏览器页面、Cookie、local storage 与登录态由浏览器执行器持有；Social Workbench 不复制或导出凭据。
5. 用户和 Agent 必须操作同一浏览器页面。并行启动第二个 Provider 会产生两份登录态和两份页面真相，因此默认禁止。
6. 发布仍需绑定平台、账号、冻结 revision、可见性和一次性确认；把浏览器嵌入工作台不会降低授权门。

## 现成实现审计

### 直接组合：`JeremyGuo/dsh-playwright`

- 固定审计 commit：`9e8faf48cdcd479a777e52f5600899206a77f8af`
- 许可证：MIT
- 可复用部分：同一 DSH Session 一份 `BrowserContext/Page`、Host RPC、CDP screencast、Canvas 交互、`shell.overlay` 可调整侧栏、模型浏览器工具、异常退出后的 URL 恢复。
- 与目标的匹配：用户和 Agent 同看同一页面，浏览器留在 DSH Shell 内，不需要跳到外部 Chromium。
- 当前限制：Browser service 是包内实现，尚未作为稳定 `ctx.browser` seam 提供给其他插件；登录态按 Session 隔离，长期账号复用策略仍需单独验证；弹窗和下载未暴露。

### 组件参考：`ChenyuHeee/dsh-browser-playwright`

- 固定审计 commit：`57ebe45fb906b6977312a0c7562d407faee4b449`
- 许可证：MIT
- 可复用部分：`ctx.browser` provider registry、稳定 a11y ref、tabs、URL policy、owner/session 生命周期、LRU/idle disposal、真实 scenario 测试。
- 不直接并装的原因：它会创建另一套 Playwright Context，与可见 Browser Use 面板不共享登录态。首个闭环中“同一页面真相”比同时拥有两套浏览器工具更重要。
- 后续方向：优先推动/适配 `dsh-playwright` 的共享 page 实现 `ctx.browser` 契约，或把它的可见面板作为选中 provider 的 presenter；不复制两套完整实现。

### DSH 官方事实

- DSH Web 通过 Slot 组合 UI；`conversation.view` 是增加完整 Session tab 的稳定入口，`shell.overlay` 是增加 frame-wide surface 的入口。
- 当前官方核心的 `ctx.web` / `web_search` / `web_fetch` 是 HTTP 检索能力，不是有登录态的交互浏览器。
- 因此“DSH 内置浏览器”在当前组合中应理解为一个可组合浏览器插件能力，而不是 Social Workbench 自己造浏览器或把第三方站点 iframe 进 Settings。

参考：

- [DeepSeek Harness GUI Web Client Architecture](https://github.com/deepseek-ai/deepseek-harness/blob/master/.agents/notes/implemented/architecture/2026-07-19-gui-web-client-architecture.md)
- [`dsh-playwright`](https://github.com/JeremyGuo/dsh-playwright)
- [`dsh-browser-playwright`](https://github.com/ChenyuHeee/dsh-browser-playwright)

## 产品概念

```text
Source（证据）
  -> Signal（需求假设，含支持与反证）
  -> Content（brief、素材、平台变体、冻结 revision）
  -> Publication（计划、批准、attempt、receipt）
  -> Learning（指标、结论、下一轮假设）

Browser Session = 上述流程的观察/执行上下文，不是知识仓库
Capability/Condition = 系统控制面，不是日常工作对象
```

首版不新增一个空泛的 Campaign、Project 或 DAG 实体。当前闭环通过已有 canonical objects 和当前 Session 组织；只有真实使用证明需要跨 Session 聚合时，才提升新的顶层对象。

## 信息架构

Social Workbench 注册为 `conversation.view`，默认视图包含：

1. **当前闭环**：目标、阶段、下一步和需要用户决定的事项。
2. **流水线**：Sources → Signals → Content → Publishing → Learning 的对象与阻塞。
3. **待处理队列**：只列能采取行动的异常、审核与缺口，不平铺所有 conditions。
4. **平台执行**：平台登录/适配器状态、冻结 revision 和回执；浏览器由右侧 Browser Use 面板呈现。
5. **系统**：完整 capability/condition 诊断，作为二级视图。

Settings 后续只保留：

- Browser provider 与允许域；
- 平台账号的 credential/auth-state 引用（不显示值）；
- 默认可见性、确认策略与 retention；
- live probe 频率和资源上限。

当前没有这些可安全编辑的 Settings 契约，因此先移除 Settings section，而不是放一个伪设置页。

## 布局决策

```text
┌ DSH Session Header ─────────────────────────────────────────────────────┐
│ Chat | Social Workbench | Trajectory                         Browser Use │
├────────────────────────────────┬─────────────────────────────────────────┤
│ Social Workbench               │ shared browser page                     │
│  当前闭环 / 流水线 / 待处理     │ login / observe / operate               │
│  内容与发布事实 / 系统异常       │ user and Agent share this page          │
└────────────────────────────────┴─────────────────────────────────────────┘
```

Browser Use 继续使用 `shell.overlay` 的可调侧栏，不嵌入 Social Workbench DOM。这样浏览器可以与 Chat、Workbench、Trajectory 任一 Session view 并存，也不会让 Social Workbench 接管 DSH Shell。

## 验收标准

1. Settings 中不再出现“社交能力工作台”。
2. 已连接 Session 出现独立“Social Workbench” tab。
3. 默认画面在一个视口内显示当前目标、五阶段流水线、下一步和平台状态；完整 capability conditions 不再铺满首屏。
4. Browser Use 侧栏与工作台同屏，二者使用同一 Session id。
5. 工作台仍保持只读；任何登录、上传、确认和发布都走各自授权边界。
6. 插件卸载/HMR 后 view、样式和浏览器资源都能回收。
