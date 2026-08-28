# Atlassian Statuspage Public Incidents Platform Pack 设计

状态：`researched / fixture-eligible / recent-50 / no-callable-route`  
核验日期：2026-08-26  
Pack ref：`atlassian-statuspage-public-incidents/v0-design`

## 1. 定位与禁止边界

本Pack只设计用户明确选择的公开Statuspage页面的只读事故通信研究。它读取公开page-level Status API，不连接Manage API，不使用private/trial page的全权限API key，不创建/更新incident、maintenance、component、subscriber、metric或team member，也不注册webhook订阅。

当前没有ConnectionProfile、PortBinding或可调用route；官方存在公开endpoint不等于本系统已获准抓取任意客户页面。

## 2. 稳定概念

官方来源：[Status API](https://status.atlassian.com/api)、[Statuspage API边界](https://support.atlassian.com/statuspage/docs/what-are-the-different-apis-under-statuspage/)、[Components](https://support.atlassian.com/statuspage/docs/show-service-status-with-components/)、[Incidents](https://support.atlassian.com/statuspage/docs/create-an-incident/)、[Impact calculation](https://support.atlassian.com/statuspage/docs/top-level-status-and-incident-impact-calculations/)、[Historical uptime](https://support.atlassian.com/statuspage/docs/display-historical-uptime-of-components/)。

| Concept ref | 原生身份/表示 | 稳定语义与限制 |
| --- | --- | --- |
| `statuspage.page/v1` | page ID + observed summary/status revision | publisher公开通信页面；top-level status由组件状态计算，0组件时仍可能受active incident影响 |
| `statuspage.component/v1` | component ID + group ID + observed state | 服务/功能部件；两级group；可独立改状态，也可mirror third-party component并本地override |
| `statuspage.incident/v1` | incident ID + mutable projection | 非计划事故通信；impact可由组件状态计算或人工override |
| `statuspage.incident-update/v1` | update ID + incident ID + display/update time | publisher update；body可含有限HTML，status是发布时沟通state |
| `statuspage.scheduled-maintenance/v1` | maintenance incident ID + schedule/update | 计划维护，不等于unplanned disruption |
| `statuspage.postmortem/v1` | incident + published postmortem fields | publisher复盘声明；不是独立root-cause验证 |
| `statuspage.uptime-history/v1` | component + 90-day/full-history view | 基于component状态且可编辑；incident未改component状态时可能不计入 |

## 3. Capability 与 coverage

| Endpoint/profile | Capability proposal | 状态/约束 |
| --- | --- | --- |
| `/api/v2/summary.json` | `operational-status.summary.read.statuspage/v1` | fixture-eligible；page + components + unresolved incidents + scheduled maintenances的current summary |
| `/api/v2/status.json` | `operational-status.page-state.read.statuspage/v1` | fixture-eligible；provider-computed top-level condition |
| `/api/v2/components.json` | `operational-status.components.read.statuspage/v1` | fixture-eligible；current component roster/state，不代表history |
| `/api/v2/incidents/unresolved.json` | `operational-status.incidents.active.read.statuspage/v1` | fixture-eligible；investigating/identified/monitoring only |
| `/api/v2/incidents.json` | `operational-status.incidents.recent.read.statuspage/v1` | fixture-eligible；官方明确只返回最近50个，永远不是complete history |
| maintenance upcoming/active/all | `operational-status.maintenance.read.statuspage/v1` | fixture-eligible；representation分别固定 |
| private/trial Status API with key | any route | rejected；key没有read-only scope且同时能写Manage API |
| Manage API / webhook subscription | any read/write fallback | rejected；管理和订阅是独立effect surface |

公开active paid page Status API无需鉴权且官方称不受rate limit；未来仍必须有本地请求预算、缓存、退避和页面allowlist，不能把“无官方rate limit”解释为无限采集权。

## 4. `OperationalStatus*` 映射

每个页面先固定`OperationalStatusDefinitionMetadata`：provider/publisher/page roster、public access class、API/schema、timezone、component hierarchy、condition/lifecycle/impact taxonomy、computation/override、notification、uptime/history/selection、sanitization、rights/retention/deletion与valid window。

| Statuspage fact | 映射 |
| --- | --- |
| summary/status | `PageSnapshotRecord` + `CurrentSummaryRepresentation`；condition标`ProviderDerived` |
| component/group | `ComponentRecord` + hierarchy binding；第三方mirror保留upstream ref和local override |
| incident current object | `IncidentRecord` + event kind `UnplannedIncident`；append observed revision，不覆盖旧state |
| incident update | 独立`IncidentUpdateRecord` + exact `UpdateOfRelation` + display/published/updated times |
| maintenance | 独立maintenance record/event kind，不生成disruption evidence |
| impact/impact_override | `OperationalStatusStateBinding`分别保存provider-derived与overridden状态 |
| affected components | exact `AffectsRelation`与component binding；不推导用户数或业务面 |
| postmortem | exact `PostmortemOfRelation`；publisher assertion保持显式 |
| recent incidents | `RecentHistoryRepresentation` + provider cap 50 + truncated coverage |
| body/title/postmortem | sanitized `OperationalStatusSpanMetadata`；保持publisher authorship |

只有经review的非计划事故publisher span可派生`EvidenceOperationalDisruption`；它不自动产生complaint、urgency、severity、root cause、SLA breach或recovery proof。

## 5. Fixture Conformance

| 场景 | 必须结果 |
| --- | --- |
| incident list有50条 | coverage=`truncated/recent-50`，不声明complete history |
| unresolved为空 | 只表示当前未暴露unresolved，不表示历史无事故或服务正常 |
| component degraded但无incident | component state保留，不制造incident |
| incident存在但component未变化 | incident保留；uptime coverage不推断包含该事故 |
| impact计算后人工override | 两个provenance都保存，最终impact不当独立severity事实 |
| identified→monitoring→resolved | publisher lifecycle；不自动验证root cause/fix/recovery |
| third-party mirror + local override | 上游与本地publisher分开，不冒充上游实时状态 |
| HTML/script-like body | sanitize/quarantine先于EvidenceSpan与索引 |
| maintenance与incident重叠 | 两类record与coverage分开，不重复算一次disruption |
| private key / Manage API / subscribe/write | policy拒绝且zero platform side effect |

## 6. Skills、可观测性与晋级

未发现Statuspage public API专用官方Skill/MCP/OSS client；Pack Skills仅设计为：

- `statuspage-public-contract-research/v1`：更新官方docs、endpoint与drift proposal；
- `statuspage-public-fixture-conformance/v1`：只消费合成fixtures；
- `statuspage-public-read/v1`（未来）：只调用户批准page allowlist和公开endpoint；当前返回`capability-unavailable:no-authorized-binding`；
- `statuspage-incident-probe/v1`：返回`unsupported:public-incident-write`。

Telemetry按`definition × page × endpoint × representation`记录requested/returned、cap/window、component/incident/update/maintenance/postmortem coverage、state/impact computed/override、mirror/local override、HTML quarantine、schema/docs/rights drift和zero-write；不记录subscriber、private token或未经review正文。

晋级需合成fixture report；进入sandbox live前需用户批准测试page、endpoint roster、缓存/预算、User-Agent/terms review、schema hash、HTML sanitizer、deletion/edit reconciliation、canary与kill switch。每个representation独立晋级，recent-50永远不能提升为complete history。
