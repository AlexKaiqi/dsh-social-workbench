# 架构推导

## 1. 从目标提取不变量

用户表面上需要“四件事”：跨平台获取、需求挖掘、内容生产、跨平台发布。真正长期稳定的不变量不是某个平台的 URL 或 DOM，而是：

1. 每条结论能回到原始证据。
2. 平台差异被显式建模，不能假设同一内容、同一权限或同一指标在所有平台等价。
3. AI 的推断与来源事实分开保存。
4. 内容从 brief 到平台变体有版本和批准记录。
5. 外部副作用可预览、可拒绝、可重试、可审计。
6. 连接器失效时，核心资料和工作流仍然可用。

这意味着工作台的中心应是“证据和内容生命周期”，不是“爬虫列表”。

用户提出的 Ingress、Knowledge Repo、Knowledge Access、Tools 四阶段可以保留，但还必须有横跨全链路的 Control Plane：Connector Registry、Credentials、capability evidence、权限策略、审批、幂等、审计、telemetry 和 lineage。四阶段的成熟框架与 adapter 选择见[框架矩阵](FRAMEWORK_MATRIX.md)，运行时 port 见[Adapter 架构](ADAPTER_ARCHITECTURE.md)。

实现遵循“组件优先复用、领域事实保持自有”：先注入现有 DSH 服务，再选择兼容 library/protocol，其次调用隔离服务，最后才自建最小桥接。具体模块和所有权边界见[组件复用策略](COMPONENT_REUSE_PLAN.md)。

## 2. 基本事实、约束与假设

### 基本事实

- 平台 API 的权限、价格、审核、速率限制和字段会变化。
- 公开网页可见不代表允许自动化采集、长期保存或二次发布。
- 发布是不可逆的外部动作；重复请求可能产生重复内容。
- 各平台对标题、正文、话题、媒体比例、视频编码、链接和定时发布要求不同。
- “用户讨论很多”只证明讨论量，不自动证明购买意愿或真实需求。

### 硬约束

- 只处理公开、自己账号或明确授权的数据。
- 凭据留在 Host 的 Credentials API；Client 和模型只看到 credential ref 与能力状态。
- 每次真实发布均需要具体内容、具体账号、具体时间范围的一次性批准。
- 默认不使用私有 API、Cookie 重放、验证码代过或反检测方案。
- 来源、派生结论和生成内容分别保存并设置保留策略。

### 待验证假设

- 用户主要关心的平台优先级及账号类型。
- 是否需要团队协作，还是单人工作台。
- 是否接受自托管 Postiz/RSSHub 等外部服务。
- 需求信号最终服务于什么业务目标和衡量指标。
- 哪些平台能够通过用户现有主体资质完成应用审核。

## 3. 候选组件

```text
┌──────────────── Workbench Client ────────────────┐
│ Inbox │ Evidence │ Signals │ Studio │ Calendar  │
│ Connector status │ Approval queue │ Results      │
└──────────────────────┬───────────────────────────┘
                       │ versioned Host protocol
┌──────────────────────▼───────────────────────────┐
│ Social Workbench Host                            │
│                                                  │
│ Connector Registry ─ Acquisition ─ Normalizer    │
│             │             │             │         │
│          Credentials   Evidence Store  Dedup      │
│                                      │           │
│ Signal Miner ─ Brief/Claims ─ Variant Renderer   │
│                                      │           │
│ Approval Gate ─ Transactional Outbox ─ Publishers│
│                                      │           │
│ Result/Analytics Ingest ─ Evaluation Loop        │
└──────────────────────────────────────────────────┘
```

### Connector Registry

它登记“一个已配置实例现在能做什么”，而不是只登记平台名。关键字段包括接入模式、账号类型、能力、授权范围、速率限制、证据链接、最后验证时间和风险等级。`registered`、`authorized`、`callable`、`degraded` 必须分开。

### Acquisition 与 Evidence Store

采集任务只产生不可变的原始 observation 和标准化 `SourceItem`。正文、作者、时间、URL、媒体、抓取时间、访问方式、内容哈希和可见性分类都要保留。后续清洗不能覆盖原始证据。

### Signal Miner

输出 `DemandSignal`，每个信号必须包含证据引用、受众、问题、出现频率、紧迫度、替代方案、反例和置信度。模型生成的概括属于 inference，不能写回 source 字段。

### Content Studio

`ContentBrief` 连接目标受众、需求信号、事实主张、允许引用的素材和渠道意图。主内容与 `ChannelVariant` 分离，避免把一段文字机械复制到所有平台。

### Approval Gate 与 Transactional Outbox

批准对象是不可变的 `PublicationPlan` revision。批准后任何文本、媒体、账号、可见性或时间变化都会使批准失效。发布任务使用 idempotency key，并按平台隔离重试；不把部分成功回滚成“全部失败”。

### Result Loop

保存平台返回的外部 ID、状态、错误、实际发布时间和可得指标。分析要区分曝光、互动、点击、询盘和转化，避免把不同平台指标直接横向相加。

## 4. 接入层级

按可靠性和授权强度从高到低：

1. `official-api`：官方 OAuth/API，能力和审核条件有证据。
2. `official-feed-export`：RSS、Webhook、数据导出或官方分享 SDK。
3. `delegated-service`：Postiz、RSSHub 等独立服务；仍要保存底层平台和能力来源。
4. `browser-assisted`：只作为用户可见、逐次确认的辅助操作，不声称稳定 API。
5. `manual-handoff`：生成符合格式的文件、文案和检查表，由用户在官方客户端完成。
6. `unsupported`：违反权限、缺乏授权或风险不可控。

连接器必须支持能力降级。例如平台发布 API 权限过期后，仍可以产出人工交接包，而不是伪造成功。

## 5. 与现有 DSH 插件的边界

- `dsh-multi-model-provider`：拥有模型目录和 route；本插件只选择能力，不保存模型密钥。
- `dsh-progressive-formulation-worksurface`：可承载长周期研究/内容 revision 和 DAG；本插件拥有社交领域对象及发布状态。
- `dsh-block-to-file`：仍由 WorkSurface 组合，不在本插件复制文件落盘协议。
- `dsh-client-locale`：未来 Client 注册自己的 namespace。
- DSH Credentials/Settings：分别拥有密钥引用和普通配置，不另建明文配置文件。

## 6. 安全与隐私

- 数据最小化：默认不保存与需求分析无关的个人标识；可用来源 ID 替代复制完整个人资料。
- 可见性分类：`public`、`owned`、`authorized`、`restricted`；`restricted` 默认拒绝进入采集管线。
- 权利元数据：保存来源、许可/使用依据、引用限制和删除请求状态。
- Prompt injection：外部内容永远是不可信数据，不能借由正文触发工具或发布。
- 发布批准：批准 token 绑定 plan hash、账号、范围、到期时间和批准人。
- 审计：保存谁在何时批准了什么，以及平台实际返回了什么；日志不含 token、Cookie 或完整私密正文。

## 7. 最小稳定切片

第一版不追求“全平台”。建议用以下闭环验证架构：

- 输入：RSS/Atom + 一个官方数据 API。
- 处理：SourceItem 去重、需求信号、带证据 ContentBrief。
- 输出：一个人工交接平台 + 一个官方 API/委托发布平台。
- 安全：预览、一次性批准、幂等发布、状态回执。
- 反馈：至少一种官方可得指标，并能回到内容 revision。

只有这条闭环稳定后，平台连接器数量才值得扩展。
