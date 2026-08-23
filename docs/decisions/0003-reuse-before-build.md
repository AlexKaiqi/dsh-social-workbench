# ADR-0003：组件优先复用，领域事实保持自有

- 状态：Provisional
- 日期：2026-08-23

## 背景

Ingress、知识仓库、知识访问、内容转换和发布都已有成熟开源组件。如果 Social Workbench 重写分页、增量状态、文档解析、检索 pipeline、媒体转换、任务队列、MCP transport 和平台 OAuth，不但交付慢，还会重复承担上游长期维护成本。

另一方面，直接采用一个一体化平台会产生第二套 Credentials、账号、内容版本、审批、调度和知识真相，并把 DSH 领域对象耦合到外部框架。

## 决策

1. 只自建领域 schema/ID、Adapter Port/Manifest、anti-corruption mapping、approval/outbox 领域状态和 DSH 产品装配。
2. 复用优先级为：现有 DSH service、兼容的进程内 library/开放 protocol、隔离 delegated service、设计参考，最后才是自建。
3. WorkSurface 承担人类可读的研究/内容工作区；PostgreSQL 承担高体量 canonical social data、权限、索引元数据和发布 receipt。两者通过不可变 revision ref 连接。
4. Personal Knowledge 只提供已确认的用户偏好和当前工作上下文，不保存采集内容或模型推断。
5. 外部框架对象不能进入领域 schema。所有 adapter 必须通过 JSON 边界、版本化 manifest 和 conformance suite。
6. AGPL、ELv2、source-available、不同语言 runtime 或独立升级价值较高的项目优先进程/API 委托，不复制代码。
7. 每个依赖在进入实现前必须固定版本，并完成许可证、凭据、网络目标、失败/撤权、live probe 和替换路径审查。

## 首批候选

- DSH：Cordis、Credentials、Settings、ModelCatalog/TaskModelRuntime、Attachment、WorkSurface、Personal Knowledge、Locale 和插件 checker。
- 进程内：PostgreSQL/pgvector、pg-boss、remark/rehype、Sharp、MCP SDK、OpenTelemetry。
- 委托：dlt、Singer/Meltano taps、RSSHub、Docling、Postiz、Activepieces。
- 仅参考：Airbyte/NiFi 治理模型、国内 Playwright 发布项目。

## 后果

- 新插件代码量集中在领域价值和安全边界，而不是通用基础设施。
- 需要维护 adapter bridge、版本清单和 conformance fixtures；这是可控的必要成本。
- 外部服务可能增加部署复杂度，但可以独立升级、隔离凭据并被替换。
- “复用”不能成为跳过许可证审查或把框架状态当业务真相的理由。

## 复审条件

完成 WorkSurface、dlt、PostgreSQL/pgvector/pg-boss、Postiz 四个组件 spike 后复审。若桥接成本持续高于直接实现，必须用代码量、失败语义、升级成本和许可证证据说明，而不能仅凭开发偏好改为自建。
