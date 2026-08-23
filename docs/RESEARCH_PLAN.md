# 调研计划与证据标准

## 需要回答的产品问题

1. 最终要优化的是发现选题、验证需求、获取线索、建立品牌，还是直接转化？
2. 需要跟踪的是关键词、特定账号、社区、评论、榜单，还是自有账号表现？
3. 允许处理哪些公开内容，原文/媒体保存多久，用户删除后如何同步？
4. 内容生产需要哪些形态：短文、长文、图文卡片、播客、短视频、长视频？
5. 发布前由谁批准，单条批准还是 campaign 批准，批准多久失效？
6. 首批账号是什么类型，是否有企业主体和应用审核能力？

## 平台研究模板

每个平台单独建立 evidence record：

```yaml
platform: bilibili
checkedAt: 2026-08-23
accountTypes: []
capabilities:
  discover: unverified
  read: authorized-only
  search: unverified
  publish: official-api
  analytics: authorized-only
  comments: unverified
auth:
  method: oauth2
  scopes: []
accessReview: required
rateLimits: unverified
pricing: unverified
retentionRules: unverified
officialSources: []
testEvidence: null
confidence: medium
```

只有官方文档和真实测试共同存在时，`confidence` 才能变成 `high`。

## 证据优先级

1. 当前官方 API 文档、开发者协议、更新日志和应用后台。
2. 官方 SDK、CLI、示例和 schema。
3. 目标开源项目的代码、LICENSE、测试和 issue。
4. 维护者说明或社区故障报告，用于发现风险，不能代替官方能力证据。
5. 博客、视频和聚合列表只作为线索。

## 技术 spike（需用户批准实现后）

- Spike 0：复用边界，验证 WorkSurface、Personal Knowledge、ModelCatalog、Attachment 等现有 DSH 服务，禁止建立第二事实源。
- Spike A：RSS + RSSHub 输入，验证 provenance、去重和更新/删除。
- Spike B：一个官方 OAuth 平台，验证授权、刷新、撤权和最小发布。
- Spike C：Postiz 委托层，验证动态 schema、草稿、定时、媒体和部分失败。
- Spike D：国内官方平台，验证主体审核和 sandbox，而不使用 Cookie。
- Spike E：人工交接包，验证小红书/视频号的格式检查和用户体验。

每个 spike 只使用测试账号和无敏感内容，产生可复现的证据记录；不能因为一次成功就宣称长期稳定。

## 组件复用研究模板

每个候选框架必须落实到组件，而不是只记录项目名：

```yaml
component: dlt.sources.rest_api
checkedAt: 2026-08-23
reuseMode: delegate
reuseUnit:
  - RESTClient
  - pagination
  - Incremental
ownedByWorkbench:
  - Observation envelope
  - connector instance
  - capability evidence
stateMapping: opaque checkpoint
credentialBoundary: DSH credential ref -> short-lived worker input
licenseEvidence: []
fixedVersion: null
contractFixture: null
liveProbe: null
fallback: native REST adapter
decision: research
```

完整候选和复用边界见[组件复用策略](COMPONENT_REUSE_PLAN.md)。

## 风险登记

| 风险 | 早期信号 | 缓解 |
| --- | --- | --- |
| 平台 API 取消/涨价 | 文档版本 sunset、价格或 scope 变化 | 能力登记带 TTL；连接器可降级为人工交接 |
| 账号处罚 | 验证码、限流、异常登录 | 只用官方授权；逐账号速率与 kill switch |
| 隐私/条款违规 | 需要登录 Cookie 或存个人敏感资料 | 默认拒绝；单独法律与产品审批 |
| AI 误判需求 | 结论没有证据或忽略反例 | 强制 evidence refs、置信度、人工复核 |
| AI 编造事实 | 内容主张找不到来源 | claim ledger；无证据主张不能进入批准态 |
| 重复/误发布 | 超时后重试、批准后内容变化 | plan hash、幂等键、outbox、批准失效 |
| 许可证传染/限制 | AGPL 或 source-available 被嵌入发行物 | 优先进程/HTTP 边界；发布前法律审查 |
| 外部内容 prompt injection | 网页要求模型调用工具/泄露信息 | 来源按不可信数据处理，分析和执行分离 |

## 调研完成标准

- 用户选定 3–5 个首批平台和实际账号类型。
- 每个平台至少一个官方证据记录，并把未知项显式列出。
- 选定获取、发布、人工交接各一条可行路径。
- 完成候选开源依赖的许可证和安全初审。
- 每个采用候选明确到可复用模块、集成方式、事实所有权、固定版本、替换路径和 conformance fixture。
- 用户确认数据边界、发布批准方式和 MVP 指标。
- 形成可测试的 runtime facts 后，才创建真正的 DSH plugin spec。
