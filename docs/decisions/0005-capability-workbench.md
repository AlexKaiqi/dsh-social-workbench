# ADR 0005：以能力目录和可证据健康状态构成可见工作台

- 状态：accepted（capability/condition 模型保留；主界面决策由 ADR 0006 替代）
- 日期：2026-08-23
- 决策范围：DSH Social Workbench 的 Host/Client 边界、能力目录与健康状态

## 问题

用户不应通过脚本、进程名或仓库结构理解系统。工作台必须回答四个稳定问题：

1. 系统现在具备什么能力；
2. 每项能力是否真的可用；
3. 不可用时卡在哪个可验证条件；
4. 下一步由系统、Agent 还是用户做什么。

“有 adapter”“有文件”“命令退出 0”和“平台闭环可用”不是同一语义。若把它们压成一个绿色布尔值，工作台会重复现有开源发布器的误报成功问题。

## 调研依据

### 本地可复用对象

- `dsh-mini-game-workbench`：复用 Host RPC、Client Slot、React bundle、locale 和浏览器契约测试的装配方式。
- `dsh-plugin-inventory`：参考面向人的目录与分类，不复制其 profile patch 管理职责。
- `dsh-persona-studio`：参考 readiness、blocker、next actions 的产品语义。
- 本仓库现有 `PublicationLoop`：继续作为发布事实和一次性确认的唯一真相源；Client 不复制发布状态机。

### 外部成熟模型

- [Backstage System Model](https://backstage.io/docs/features/software-catalog/system-model/)：借鉴 System / Component / API / Resource 的分离，以及 API 作为机器可读边界；不引入 Backstage 运行时。
- [Backstage Frontend Plugins](https://backstage.io/docs/frontend-system/architecture/plugins/)：借鉴前后端插件分层和独立扩展面；DSH 已有自己的 Cordis/Slot 体系，因此只复用概念。
- [Kubernetes Pod Conditions](https://kubernetes.io/docs/concepts/workloads/pods/pod-condition/)：采用 `type/status/reason/message/observedAt` 条件模型，并保留 `unknown`，避免把未探测当成功。
- [Airbyte Python CDK](https://airbytehq.github.io/airbyte-python-cdk/airbyte_cdk.html)：借鉴 spec/check/discover/read 的操作分离；adapter 的“声明能力”和“检查连接”必须分开。
- [OpenTelemetry service semantic conventions](https://opentelemetry.io/docs/specs/semconv/resource/service/)：借鉴稳定的服务身份和版本字段；首版不引入遥测后端。

## 不变量

1. `lifecycle` 表示实现成熟度，`health.state` 表示当前运行状态，两者不能合并。
2. 每项健康结论必须由 conditions 组成；没有探测证据就是 `unknown`。
3. adapter 只实现自己的 probe/operation，不能直接修改工作台 UI。
4. Client 只读取 Host 的版本化 snapshot；Cookie、token、绝对凭据路径和原始日志不进入浏览器 payload。
5. 模型工具仍只有 staging 权限；登录、确认和真实发布不会因为增加 UI 自动扩权。
6. 每个模块必须有独立纯契约测试或带 fake 依赖的 probe 测试，再做组合和浏览器测试。

## 决策

### 1. 四层而不是一个大服务

```text
Capability definitions ──► Probe adapters ──► Snapshot registry ──► Workbench Client
       静态语义              可替换检查          聚合/版本化            只读投影
                                  │
                                  └────────► PublicationLoop（执行事实，保持独立）
```

- Capability definition：稳定 ID、版本、所属 area、操作语义、授权边界和生命周期。
- Probe adapter：对存储、sidecar、登录态等做有界只读检查。
- Snapshot registry：隔离单个 probe 故障，聚合 `ready/degraded/blocked/unknown`。
- Client：显示能力、条件、补救动作与流水线计数；不自行推断健康。

### 2. 首批能力

| 能力 | 当前 lifecycle | 独立验证 |
| --- | --- | --- |
| 已授权素材进入 | available | 临时 Workspace + 路径逃逸负测 |
| 证据仓库 | partial | canonical object/count 测试 |
| 知识访问与需求分析 | planned | 只展示 planned，不伪造 health |
| 双平台内容包 | available | source → brief → package 契约测试 |
| 小红书发布 | partial | HTTP fake probe + 真实只读 doctor |
| 抖音发布 | partial | 安装/auth-state passive probe；真实 CLI doctor 仍在用户边界 |
| 一次性确认与 receipt | available | one-time、expiry、unknown 测试 |
| 可见工作台 | available | Client bundle/Slot/RPC/browser 测试 |

### 3. 首版 UI 边界（历史决定）

首版提供系统总览、流水线对象计数、能力卡片、conditions、补救动作和手动刷新。它不会在 Client 里新增登录、上传或发布按钮。后续动作必须通过 capability operation 注册，按 `read/write/execute/decision` 风险类型逐项加入。

真实使用证明该界面适合作为诊断面而不是日常工作面。ADR 0006 保留其只读与授权边界，将完整能力目录降为 Social Workbench 的“系统”二级视图，并把主界面迁移到 `conversation.view`。

## 明确不采用

- 不引入 Backstage、Airbyte 或 Kubernetes 作为运行时；当前规模只复用经过验证的语义。
- 不建立通用 DAG、事件总线或数据库抽象；现有文件事实核心足够支撑首个垂直切片。
- 不用“文件存在”宣称账号可用；被动检查最多得到 `unknown`，真实登录需要 live probe。
- 不把 planned 能力算成故障，也不让 planned 能力影响系统 overall health。

## 复审触发器

出现以下任一证据时复审：三个以上第三方 adapter 重复实现相同 probe；Client 需要两种以上独立呈现面；单机 snapshot 无法表达远程实例；健康历史和事件量证明需要 OpenTelemetry 后端。
