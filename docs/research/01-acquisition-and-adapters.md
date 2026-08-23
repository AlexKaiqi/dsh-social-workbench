# 01：采集与适配器

## 研究问题

如何从公开 feed、官方 API、用户授权账号、文档和允许抓取的网页中获取信息，同时支持增量、去重、撤权、删除和来源证明？

本轨道止于 `Observation`。它不判断需求、不生成内容、不执行发布，也不把上游对象直接写成领域事实。

## 最小契约

```text
ConnectorManifest
  + ConnectorInstance(credentialRef, accountType, effectiveCapabilities)
  + Checkpoint(opaque, versioned)
  -> ConnectorRun
  -> Observation(rawRef, sourceUrl, observedAt, accessMode,
                 rights, contentHash, upstreamId, cursor, schemaVersion)
```

Adapter 必须按 `platform × capability × mode` 登记。平台名称不能替代能力；`read-owned`、`search`、`analytics` 和 `publish` 是不同 profile。

## 候选组件结论

| 组件 | 复用单位 | 集成方式 | 结论 |
| --- | --- | --- | --- |
| [dlt REST API source](https://dlthub.com/docs/dlt-ecosystem/verified-sources/rest_api/basic) | 认证、分页、declarative endpoint、incremental cursor | Python worker | 首个官方 REST adapter 的首选 spike；dlt state 只作为 opaque checkpoint |
| [Singer specification](https://hub.meltano.com/singer/spec/) / Meltano Hub | `SCHEMA`、`RECORD`、`STATE`、catalog 与社区 tap variant | stdio protocol + 隔离进程 | 长尾来源出现后复用；逐 tap 审许可证、维护状态和删除能力 |
| [Airbyte CDK](https://github.com/airbytehq/airbyte-python-cdk) | declarative manifest、source state、connector test 模式 | 独立服务 | catalog 很强但部署和 ELv2 边界较重；MVP 不嵌入 |
| [RSSHub](https://github.com/DIYgod/RSSHub) | 社区 route → RSS | 独立 HTTP 服务 | 公开观察低成本入口；每条 route 独立健康检查，保留原始 URL，不复制 AGPL route |
| [Crawlee](https://crawlee.dev/) | request queue、HTTP/Cheerio/Playwright crawler | Node library/worker | 仅用于允许抓取的白名单网页；反阻断能力不代表授权 |
| [Docling](https://docling.org/) | PDF/Office/HTML 的布局、表格、OCR 和结构化文档 | Python service/CLI | 富文档解析首选；解析结果是 projection，原文件仍为证据 |
| 官方平台 API | OAuth、cursor、webhook、官方字段 | 生成 client + 自有 mapper | 社交平台默认首选；每个账号实际 scope 需要 live probe |

dlt 官方文档显示 REST source 已覆盖声明式 endpoint、认证、多种分页和 incremental；Singer 把 schema、record、state 分成标准消息。这两者分别适合“新写少量官方 REST adapter”和“复用已有 tap”，不需要二选一。

## 工作台自己实现

- `ConnectorManifest`、capability evidence 和状态：`registered`、`authorized`、`callable`、`degraded`。
- Observation envelope、来源/权利元数据、content hash 和 adapter version。
- checkpoint 的事务提交规则：Observation 成功持久化后才推进 cursor。
- tombstone/delete/revoke 传播和 per-source retention。
- credential ref 到短期 worker 输入的安全桥，不使用框架自己的长期 secret 文件。
- 连接器 conformance suite：fixture、分页、重复、断点续传、撤权、限流和 schema drift。

## 不采用

- Cookie 重放、私有接口、签名逆向、验证码代过和反检测。
- 把 Playwright/CDP 包装成“官方 API”。
- 仅因 Airbyte/Meltano/LangChain 目录出现平台名，就宣称具备全网搜索或发布能力。
- 让 connector 直接生成 DemandSignal 或执行外部动作。

## 验收

1. RSS fixture 首次同步、重复同步、更新和删除均得到确定结果。
2. 一个官方 REST API 在断点后不漏不重；cursor 只在事务完成后推进。
3. 撤销 credential 后 connector 进入 `unauthorized`，下游已有证据仍可按保留策略访问。
4. 每条 Observation 都能回答来源、时间、模式、版本、权利和原始 payload 在哪里。
5. 社交平台失败时可降级到 feed、公开网页或 manual import，而不改变领域 schema。

平台逐项证据见[平台接入矩阵](../PLATFORM_MATRIX.md)，adapter 目录交叉核验见[Adapter 生态调研](../ADAPTER_CATALOG_SURVEY.md)。
