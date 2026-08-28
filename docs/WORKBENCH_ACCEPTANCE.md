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

- runtime：25/25 tests passed；
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

## 0.1.0 回归验收

2026-08-23 在 Node 24.17.0、DSH 0.1.1-rc.2 和隔离端口 3081 重新验收：

- `npm run check` 为 runtime 25/25、root 17/17；兼容 0.3 spec 的 plugin checker 为 0 error、0 warning；
- `--dump-config` 显示单一 `$DSH_HOME/social-workbench` root，并由 Host 派生 `runtime/` 与 `sidecars/`；
- 设置页仍显示 8 张能力卡，健康刷新时间从 `22:05:33` 更新为 `22:05:45`；
- Client 中没有登录、确认、执行或发布按钮，浏览器 console error/warning 为 0；
- 小红书 sidecar 停止、抖音未登录时仍分别显示 blocked，没有把安装完成或历史登录冒充当前可发布。

## 0.2.0 发布与反馈闭环验收

2026-08-23 在 Node 24.17.0、隔离端口 3081 重新构建 Host/Client 并验收：

- `npm run check` 为 runtime 31/31、root 17/17；plugin checker 的 0.3→0.2 兼容视图为 0 error、0 warning；`npm pack --dry-run` 包含全部 runtime 与 0.2.0 schema；
- `--dump-config` 仍只装配一个 `@dsh/social-workbench`，root 为 `$DSH_HOME/social-workbench`；
- 工作台导航为“当前闭环 / 发布 / 反馈 / 系统”，发布页展示 plan、queued、reconcile、published 与最近 outbox，反馈页展示 metric snapshot、feedback item 和 hypothesis review；
- 系统页从 8 项扩展到 10 项能力，新增“发布计划与 Outbox”和“反馈与假设复盘”，两者的条件来自执行测试而非静态完成度；
- 刷新时间从 `23:23:47` 更新为 `23:24:19`，证明 health snapshot 与 loop dashboard RPC 均完成真实装配；
- Client 中没有登录、计划批准、确认、执行、对账或反馈采集按钮，浏览器 console error/warning 为 0；
- 暗色主题首次截图暴露统计卡白底/浅色字的对比度问题；改用 DSH theme layer 后强刷复验，卡片、刷新按钮和导航均清晰可读。

## 0.3.0 抖音研究 ingress 契约验收

2026-08-25 在 Node 24.17.0 完成离线契约与模拟 sidecar 验收：

- `npm run check` 为 runtime 35/35、root 18/18；三个新增 Draft 2020-12 schema 均编译通过；
- 模拟二维码登录只使用专用 profile，adapter 参数不含 Cookie，wrapper 强制关闭 CDP 和“连接现有 Chrome”；
- 模拟搜索把视频文案、评论和公开计数写入 canonical store，作者 hash、昵称和临时视频 URL 均未进入结果；
- 视频下载只接受已经登记的单条 Douyin video source item，ASR 只读取 research artifacts root 内且 SHA-256 未变化的文件；
- Host 只把 `source-items`、`research-runs`、`video-transcripts` 开放为按 ID 读取；`research-media` 路径、登录、搜索、下载和转写仍不在模型工具 surface；
- `research douyin doctor` 在未安装可选 sidecar 时如实返回 `ready=false`，没有把 wrapper 存在误判为采集可用。

尚未执行真实账号扫码或真实抖音请求；受限许可证的接受、sidecar 安装和平台 live 验收保留给用户。
