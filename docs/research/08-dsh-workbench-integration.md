# 08：DSH 工作台集成

## 研究问题

如何把前七条轨道装配成一个 DSH 插件，同时复用现有服务、保持 Host/Client/Agent 边界并给用户一个连贯工作台？

## 复用现有 DSH 能力

| 现有组件 | 直接复用 | 本插件不做什么 |
| --- | --- | --- |
| Cordis / DSH Host | service 注入、lifecycle/effect/disposer、Remote、route | 不建全局 service locator，不留下不可回收 worker/socket |
| DSH Credentials | credential ref、Host resolve、rotation/revoke | 不建 `.env`/JSON secret store，不把 token 给 Client/模型 |
| DSH Settings | namespace、live/non-live setting | 不把 Observation、Receipt、内容版本放普通 settings |
| `dsh-multi-model-provider` | model catalog、task runtime、route status | 不重复维护模型目录或 provider key |
| DSH Attachment | 原始/生成媒体 ID 与 metadata | 不允许 PublicationPlan 接受任意 Host 绝对路径 |
| WorkSurface | Brief、Master、Variant、研究和评审 revision/DAG | 不把高体量索引、账号和 outbox 塞进文件工作区 |
| `dsh-block-to-file` | 经 WorkSurface 的原子文件落盘 | 不复制 parser 或 Git CAS |
| Personal Knowledge | 已确认的用户偏好和有界当前上下文 | 不把外部社交语料自动写成长期个人知识 |
| Persona Studio | 可选、已确认的品牌/Persona profile | 不读取私有实现文件；未经确认的 persona 不参与发布 |
| `dsh-client-locale` | UI locale namespace、fallback、RTL | 不建立第二个全局语言状态 |
| `dsh-plugin-develop` | checker、L0/L1 testkit | 不用 checker 代替 L2 effect 和 L3 Agent eval |

## 推荐 Host 服务

```text
socialConnectorRegistry
socialIngress
socialRepository
socialKnowledgeAccess
socialSignalMiner
socialContentPlanner
socialApproval
socialPublisher
socialFeedback
```

服务通过领域 ID/revision 交换数据，不传框架 class、数据库 row 或绝对文件路径。模型工具只暴露有界操作，例如“查询证据”“生成 brief 提案”“创建发布计划”“提交批准请求”“查询结果”，不直接暴露底层 HTTP client。

## 推荐 Client 工作台

```text
Inbox             新 Observation/SourceItem、去重和删除状态
Evidence Explorer 证据定位、来源、权限和历史 revision
Signals           需求信号、支持/反证、聚类和人工合并
Studio            WorkSurface brief/master/variant/媒体
Approval Queue    immutable preview、账号、风险和差异
Calendar/Outbox   queued/executing/unknown/partial/reconcile
Results           平台指标、业务结果和 hypothesis review
Connectors        capability、授权、健康、成本和证据 TTL
```

UI 是投影，不是第二事实源；刷新或重建 Client bundle 后不丢领域状态。

## Host / Client / Agent 边界

- Host：文件、数据库、网络、凭据、worker、policy 和外部副作用。
- Client：显示状态、编辑稿件、发起授权/批准；不持有长期 token 或任意路径。
- Agent：读取模型可见 contract，提出分析/内容/action plan；不能确认自己的提案或绕过 Host policy。
- 外部服务：dlt/RSSHub/Docling/Postiz/Activepieces 通过版本化 adapter 边界，不能访问 DSH 私有 store。

## 实现顺序

1. 先定义 schema/Port/conformance，没有 runtime side effect。
2. 装配只读 RSS fixture + PostgreSQL repo + Evidence Explorer。
3. 组合 WorkSurface 做 Brief/Variant，不复制内容版本系统。
4. 加 manual-package，验证 preview/approval/receipt。
5. 再接一个官方/委托 publisher；最后才增加平台数量。

## 验收层级

- L0：schema、模型 tool surface、状态机和错误分类。
- L1：真实 plugin apply 后服务、提示、工具和 Client Remote 装配。
- L2：SQLite/PostgreSQL、outbox、权限拒绝、重试、reconcile、撤权和恢复。
- L3：真实 Agent loop 是否在正确时机引用证据、请求批准并停止在边界前。

进入实现前仍需用户确认首批平台、账号类型、数据保留、批准方式、外部服务接受度和 MVP 指标；确认前不创建虚假的 `plugin-spec.json` runtime facts。
