# Better Stack Public Status Platform Pack 设计

状态：`researched / fixture-eligible / current+90-day / no-callable-route`  
核验日期：2026-08-26  
Pack ref：`better-stack-public-status/v0-design`

## 1. 定位与禁止边界

本Pack只设计用户明确选择的公开Better Stack status page `/index.json`读取，用于研究公开page、section、resource、status report/update和近期status history。它不访问组织Uptime API、Telemetry、incident details或on-call数据，不使用OAuth/API token，不连接官方MCP，不acknowledge/comment incident，也不创建monitor/status page/report/resource。

当前无可调用route。公开JSON合同存在不等于获准批量发现或轮询任意页面。

## 2. 稳定概念与公开合同

官方来源：[Subscribe through API](https://betterstack.com/docs/uptime/status-pages/subscribing-to-status-updates/subscribing-to-api/)、[Working with incidents](https://betterstack.com/docs/uptime/working-with-incidents/)、[Manually tracked item](https://betterstack.com/docs/uptime/working-with-status-pages/manually-tracked-item/)、[MCP comparison](https://betterstack.com/docs/ai-sre/mcp-server-comparison/)。

| Concept ref | 原生身份/表示 | 稳定语义与限制 |
| --- | --- | --- |
| `betterstack.public-status-page/v1` | page JSON:API resource + observed revision | publisher page；aggregate state为operational/degraded/downtime/maintenance |
| `betterstack.status-section/v1` | section ID + ordered resources | publisher信息架构，不是服务依赖图 |
| `betterstack.status-resource/v1` | resource ID + current status/history | monitor-backed或manual item；二者观测来源不同 |
| `betterstack.status-report/v1` | report ID + type + lifecycle snapshot | manual/automatic/maintenance；automatic也只是provider monitor result |
| `betterstack.status-update/v1` | update ID + report + published time | publisher message、subscriber notification flag与受影响resource state |
| `betterstack.resource-history/v1` | resource + day/status/durations | 官方JSON含90天；不是无限history、独立SLI或SLA证明 |

公开合同通过在status page URL追加`/index.json`暴露JSON:API文档。官方称“complete status page data”，本Pack解释为该次公开文档的完整结构，而不是全部历史、所有后台incident、所有监控检查或删除前revision。

## 3. Capability 与 representation

| Surface | Capability proposal | 状态/约束 |
| --- | --- | --- |
| public `/index.json` page/sections/resources | `operational-status.summary.read.better-stack/v1` | fixture-eligible；current summary/resources |
| public status reports/updates | `operational-status.incidents.read.better-stack/v1` | fixture-eligible；以公开文档实际包含项为coverage，不承诺后台完整incident history |
| public resource `status_history` | `operational-status.history.read.better-stack/v1` | fixture-eligible；官方文档为90天day/status/downtime/maintenance duration |
| authenticated Uptime API v3 incidents | any fallback | rejected；需要token，响应可含URL、response content、actor和metadata，且与public report语义不同 |
| official remote MCP | any generic route | rejected；覆盖owned telemetry/incidents/status pages并含写工具，不能绕过PortBinding和zero-write gate |
| Terraform provider | any execution route | reference-only；是配置管理工具，不是public JSON collector |

manual、automatic与maintenance report必须保留publisher mode。manually tracked resource没有自动monitor，不能因为status相同就与monitor-backed resource视为同等观测。

## 4. `OperationalStatus*` 映射

每个page固定definition revision：page roster、public JSON schema、timezone、section/resource taxonomy、state/report/update taxonomy、monitor/manual provenance、notification、90-day history semantics、selection、rights/retention/deletion和valid window。

| Better Stack fact | 映射 |
| --- | --- |
| page aggregate state | `PageSnapshotRecord` + `CurrentSummaryRepresentation` + provider-derived condition |
| section/resource | `ComponentRecord` + publisher hierarchy；不推断真实依赖 |
| resource current status | component binding current condition；monitor/manual source分别保存 |
| status report type manual/automatic | incident record + publisher mode；automatic不等于独立root-cause proof |
| maintenance report | separate maintenance record/event kind，不生成disruption evidence |
| status update | exact update record/relation，保存published_at与notify_subscribers声明 |
| affected resource status | exact affects relation + state at update；不推导用户/region/customer count |
| 90-day history | `BoundedHistoryRepresentation` + exact window + provider-computed duration measures |
| message/body | sanitized publisher span；rights review前不进入长期全文索引 |

只有非计划report/update在固定provenance下可候选派生`EvidenceOperationalDisruption`。resource downtime duration仍是provider-computed measure，不自动等于contractual downtime。

## 5. Skills 与固定开源候选

- [Better Stack Cursor plugin](https://github.com/BetterStackHQ/cursor-plugin/tree/478942e7bede2c255d4675c41fc68e146abeee98)，revision `478942e7bede2c255d4675c41fc68e146abeee98`，MIT；manifest指向官方remote MCP。它证明存在Agent/MCP表面，不证明read-only、public-only或本Pack schema conformance。
- [Terraform provider](https://github.com/BetterStackHQ/terraform-provider-better-uptime/tree/f462bd230fd1d3e42d663840f5a801fa8c6a89b7)，revision `f462bd230fd1d3e42d663840f5a801fa8c6a89b7`，Apache-2.0；适合研究status page/resource等provider概念，但包含创建/更新配置，不安装或执行。

Pack Skills：

- `better-stack-public-status-research/v1`：只读官方docs与固定OSS，提出definition/drift revision；
- `better-stack-public-status-fixture-conformance/v1`：只消费合成JSON:API fixtures；
- `better-stack-public-status-read/v1`（未来）：只调用户批准page `/index.json`；当前返回`capability-unavailable:no-authorized-binding`；
- `better-stack-status-probe/v1`：返回`unsupported:status-page-effect`。

## 6. Fixture、可观测性与晋级

| 场景 | 必须结果 |
| --- | --- |
| public JSON结构完整但history只有90天 | current document complete、history bounded；两种coverage分开 |
| automatic vs manual report | publisher mode不同，不统一为监控事实 |
| manual resource changes state | 保留manual来源，不声称探针观察到downtime |
| downtime与maintenance duration同日 | 独立measure；maintenance不算unplanned disruption |
| report update修改/重排 | append observed revision，保留display/publish order与edit gap |
| empty reports | 只表示该JSON未暴露report，不表示90天无事故 |
| HTML/secret/PII-like message | pre-index sanitize/quarantine，无EvidenceSpan泄漏 |
| MCP/API token/ack/comment/create/update | policy拒绝，zero platform side effect |

Telemetry按`definition × page × JSON representation`记录resource/report/update/history counts、90-day window、manual/automatic/maintenance provenance、condition/duration measure、document/history coverage、field quarantine、schema/docs/rights drift、HTTP cache/budget和zero-write；不记录API token、actor、on-call或私有incident response body。

晋级需fixture report；sandbox live需用户批准测试page、固定`/index.json`、request budget/cache、schema hash、rights/sanitizer、edit/delete reconciliation、canary和kill switch。authenticated Uptime API与MCP永远独立验证，不随public JSON开放。
