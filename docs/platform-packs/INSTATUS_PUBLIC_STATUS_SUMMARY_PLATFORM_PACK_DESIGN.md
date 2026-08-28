# Instatus Public Status Summary Platform Pack 设计

状态：`researched / fixture-eligible-limited / active-only / no-callable-route`  
核验日期：2026-08-26  
Pack ref：`instatus-public-status-summary/v0-design`

## 1. 定位与禁止边界

本Pack只设计用户明确选择的公开Instatus page `/summary.json`读取。它用于发现当前page condition、active incidents和active maintenances；不承诺incident history、component roster或postmortem，不调用bearer-token API，不读取workspace users/subscribers/on-call，不创建/更新/删除page、component、incident、maintenance或monitor。

当前无可调用route。active-only能力不能fallback到私有API来补齐历史。

## 2. 稳定概念与合同漂移

官方来源：[Public data](https://instatus.com/help/api/public-data)、[API overview](https://instatus.com/help/api)、[Incidents API](https://instatus.com/help/api/incidents)、[Public page](https://instatus.com/help/status-page/public-page)。

| Concept ref | 原生身份/表示 | 稳定语义与限制 |
| --- | --- | --- |
| `instatus.public-page-summary/v1` | page URL + observed summary revision | page status `UP/HASISSUES/UNDERMAINTENANCE`；current only |
| `instatus.active-incident/v1` | incident ID/URL + active projection | investigating/identified/monitoring；resolved通常退出active集合 |
| `instatus.active-maintenance/v1` | maintenance ID/URL + active projection | notstarted/inprogress/completed；公开summary只暴露active集合 |

[官方OpenAPI仓库](https://github.com/instatusHQ/openapi/tree/bc179f00aee86fbef198af03694d3753fbfe4d2e)固定revision `bc179f00aee86fbef198af03694d3753fbfe4d2e`、spec version 2.0.0，包含`/summary.json`和`PublicStatusSummary`。但spec顶层有bearer security且该operation未显式`security: []`，与公开数据文档的page URL无鉴权用法存在表达冲突。此差异进入`contract-drift`，不通过猜测或真实token调用消解。

仓库无许可证文件，因此只链接和审阅；不复制spec、生成client或打包再分发。未发现Instatus官方Skill/MCP。

## 3. Capability 与 mapping

| Surface | Capability proposal | 状态/约束 |
| --- | --- | --- |
| public `/summary.json` page | `operational-status.summary.read.instatus/v1` | fixture-eligible-limited；current page condition |
| `activeIncidents` | `operational-status.incidents.active.read.instatus/v1` | fixture-eligible-limited；active-only，不含resolved history |
| `activeMaintenances` | `operational-status.maintenance.active.read.instatus/v1` | fixture-eligible-limited；active-only |
| authenticated incident/page APIs | any fallback | rejected；token表面含create/update/delete，incident响应可含workspace user ID/name/email |

每个page固定`OperationalStatusDefinitionMetadata`：page roster、public access/schema revision、timezone、page/incident/maintenance state taxonomies、active-only selection、HTML/rights/retention/deletion与valid window。

| Instatus fact | 映射 |
| --- | --- |
| page status | page snapshot + current summary；provider condition mapping |
| active incident | incident record + `ActiveOnlyRepresentation` + unplanned event kind |
| incident status/impact | publisher lifecycle/impact；不验证root cause、severity或recovery |
| active maintenance | maintenance record + active-only；不生成disruption evidence |
| name/url/time | exact record ref/time/artifact；正文不存在时不伪造update span |
| missing resolved history | `HistoryLatestOnly`或`HistoryUnknown`，incident coverage partial |

## 4. Fixture Conformance

| 场景 | 必须结果 |
| --- | --- |
| page UP + activeIncidents empty | 只陈述current published state，不声明历史无事故或监控正常 |
| HASISSUES + one active incident | page/incident两条事实，避免双计disruption |
| UNDERMAINTENANCE + active maintenance | maintenance独立，不派生unplanned evidence |
| incident从active集合消失 | 记录last-seen/gap；无resolved record时不推断resolved/deleted |
| public docs vs OpenAPI auth conflict | drift gate可见；fixture不擅自加bearer token |
| private incident list used as fallback | policy拒绝；active-only coverage保持partial |
| user/email/subscriber fixture | pre-persistence drop/quarantine |
| create/update/delete/MCP-like write | policy拒绝且zero platform side effect |

## 5. Skills、可观测性与晋级

Pack Skills：

- `instatus-public-contract-research/v1`：只读官方docs与固定OpenAPI revision，输出drift proposal；
- `instatus-public-summary-fixture-conformance/v1`：只消费合成summary fixtures；
- `instatus-public-summary-read/v1`（未来）：只调用户批准page `/summary.json`；当前返回`capability-unavailable:no-authorized-binding`；
- `instatus-status-probe/v1`：返回`unsupported:status-page-effect`。

Telemetry按`definition × page × active-only representation`记录page condition、active incident/maintenance counts、missing/history coverage、docs/OpenAPI/schema/auth drift、field quarantine、request budget和zero-write；不得把private API、token或workspace identity纳入fallback telemetry。

晋级需fixture report；sandbox live需用户批准测试page、contract drift处置、固定endpoint、schema hash、请求预算、rights/sanitization、disappearance reconciliation、canary和kill switch。即使live成功，Pack仍只拥有active-only capability，除非另行设计并批准独立history source。
