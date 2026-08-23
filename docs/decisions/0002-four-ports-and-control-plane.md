# ADR-0002：四类运行时 Port，加独立 Control Plane

- 状态：Provisional
- 日期：2026-08-23

## 背景

用户把系统分为 Ingress、Knowledge Repo、Knowledge Access 和 Tools。这个分层比按具体平台拆模块稳定，但若所有外部能力仍共用一个 Connector 接口，增量读取、存储事务、权限检索和外部副作用的语义会被压扁。

## 决策

1. 保留四个产品阶段，但定义 Ingress、Repository、Knowledge Access 和 Tool/Action 四类独立运行时 port；内容转换是第五个纯派生 port。
2. 所有 adapter 共享静态 Adapter Manifest 和 Connector Registry，而不共享执行方法。
3. DSH 持有跨层 Control Plane：Credentials、实际 capability、policy、approval、outbox、audit、telemetry 和 lineage。
4. PostgreSQL canonical store 是首版真相；vector/search/graph/analytics 都是可重建 projection。
5. MCP 是 Resources/Tools 调用表面，不是执行、审批和事务框架。
6. 外部框架通过进程/API seam 复用，不允许其内部对象成为领域契约或第二事实源。

## 后果

- 适配器 catalog 可以统一发现和评级，但每一类有正确的失败/恢复语义。
- 同一平台可有多个 adapter，例如官方 read、Postiz publish、manual handoff，并按 capability 选择。
- 初期需要维护少量桥接代码，但避免被 Airbyte、LangChain、RAGFlow 或 Postiz 任一框架锁定。
- 控制面成为真实产品工作量，不能误以为安装一个自动化框架即可获得安全发布。

## 复审条件

完成 dlt/Meltano、Haystack/SQL baseline、Postiz/direct API 三个对照 spike 后复审 port 是否过度抽象。若两个真实 adapter 无法自然实现同一 port，再按证据修改契约。
