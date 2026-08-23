# 社交能力工作台：真实装配与浏览器验收

验收日期：2026-08-23
环境：macOS arm64、Node 24.17.0、DSH `social-workbench-dev` 隔离 web profile、`http://127.0.0.1:3080`

## 验收对象

不是静态页面，而是完整装配链：

```text
package dsh.client
  → Client bundle
  → settings.section Slot
  → trusted-host RPC
  → CapabilityRegistry
  → storage / XHS / Douyin probes
```

主 `web` profile 已加入 `@dsh/social-workbench` 本地链接，但当时被一个目标目录已不存在的旧 `dsh-realtime-voice` profile 依赖和其他源码插件读取问题阻塞。为避免把无关环境修复混入本插件验收，浏览器验收使用只包含 DSH Web 基座与本插件的 `social-workbench-dev` profile。

## 自动化证据

- runtime：19/19 tests passed；
- root plugin：17/17 tests passed；
- Client bundle 由 esbuild 从 `client/src/index.jsx` 生成；
- capability snapshot 通过 Draft 2020-12 schema；
- `dsh --profile social-workbench-dev --dump-config` 出现 `@dsh/social-workbench`、runtime root、sidecar root 和 loopback XHS URL；
- 本机 Web 根返回 HTTP 200。

## 浏览器证据

在真实 DSH 设置对话框中：

- 导航出现“社交能力工作台”；
- 页面显示 8 项能力和 5 类 canonical object 计数；
- 当时聚合为 4 正常、1 受限、2 阻塞、0 未知、1 规划；
- 小红书 sidecar 已停止，因此 `SidecarReachable=false`，没有沿用较早的登录成功冒充当前可用；
- 抖音运行时已安装但未登录，因此 `AuthStatePresent=false`、`LoginValid=unknown`；
- 知识访问与需求分析为 `planned/not-applicable`，不参与 overall health；
- 点击“刷新健康状态”后时间从 `17:46:41` 更新为 `17:47:01`；
- 8 张 capability card 保持可见，浏览器 console error 为 0；
- Client 中没有 login、confirm、execute、publish 或直接 fetch 调用。

### 动态状态切换

首次 live 切换暴露登录 probe 的 4 秒超时过短：sidecar 健康接口通过，但浏览器登录检查被主动取消，工作台按契约显示 `unknown`。随后将快速 `/health` 探测与浏览器 `/login/status` 探测拆成 3 秒和 30 秒两个时限，并重新验证：

1. 启动可见 sidecar 后刷新：小红书从 `blocked` 变为 `degraded`；`SidecarReachable=true`、`LoginValid=true`、`HeadlessCompatible=false`。
2. 停止 sidecar 后刷新：小红书恢复 `blocked`，补救动作指向启动可见 sidecar。
3. 两次切换后浏览器 console error 均为 0。

这证明页面不是静态状态表，也不会把较早的登录成功沿用为当前健康。

## 结论

首个垂直切片已经满足“用户只看能力层”的最低标准：能力、实现成熟度、当前健康、证据条件和补救动作在同一界面可见；每个 probe 故障隔离，且 UI 不复制发布状态机或获得外部写权限。
