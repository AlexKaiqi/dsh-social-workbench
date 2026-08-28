# Public Operational Status & Incident Communications Channel Pack 设计

状态：`researched`；3 个 fixture-eligible candidate，0 个 callable member  
核验日期：2026-08-26  
Channel Pack ref：`public-operational-status/v0-design`

## 1. 目的与成员

本Channel组合服务提供者公开发布的运行状态、事故更新、维护和复盘，用于发现厂商承认的可靠性问题及其变化。它统一`OperationalStatus*` projection，不统一监控真实性、page/component taxonomy、history窗口、impact算法、uptime方法或发布完整性。

| Member | Pack | 状态 | 当前coverage |
| --- | --- | --- | --- |
| Atlassian Statuspage | [Statuspage Public Incidents Pack](ATLASSIAN_STATUSPAGE_PUBLIC_INCIDENTS_PLATFORM_PACK_DESIGN.md) | `fixture-eligible / no route` | current/components/unresolved/recent-50/maintenance；history truncated |
| Better Stack | [Better Stack Public Status Pack](BETTER_STACK_PUBLIC_STATUS_PLATFORM_PACK_DESIGN.md) | `fixture-eligible / no route` | public JSON current reports/resources + 90-day status history |
| Instatus | [Instatus Public Summary Pack](INSTATUS_PUBLIC_STATUS_SUMMARY_PLATFORM_PACK_DESIGN.md) | `fixture-eligible-limited / no route` | current page + active incidents/maintenances only |

requested=3、fixture-eligible=3、callable=0。某成员的history窗口、MCP或管理API不能补另一个成员的coverage。

## 2. 共同契约与不可比较边界

共同projection固定definition、publisher/page roster、surface/access/schema、component hierarchy、record/representation/event kind、condition/lifecycle/impact、publisher mode、computation/override、relations/placements、history/coverage、rights/sanitization/retention/deletion和evidence。

必须保留：

- page是publisher communication surface，不是independent monitoring source；
- Statuspage component、Better resource、Instatus summary item不按名称直接合并；
- incident、incident update、component state、scheduled maintenance和postmortem是不同records；
- active-only、unresolved、recent-50与90-day history绝不提升为complete history；
- investigating/identified/monitoring/resolved等生命周期保留publisher attribution；
- page condition/impact的provider computation、manual override、manual/automatic/mirror来源保持显式；
- uptime/downtime duration不跨成员比较，也不直接声称SLA breach；
- 公开事故可与owned telemetry/support evidence通过exact service/component/time/release bridge关联，但相似标题和时间接近只生成relation candidate；
- 空状态页可由无事故、未发布、延迟、删除、过滤或访问失败造成，不能自动生成“无可靠性痛点”。

## 3. 动态物化视图

- `publisher-acknowledged-disruptions-by-service-window`：只聚合reviewed unplanned incidents，固定publisher/member/page/component/time和coverage；
- `incident-communication-lifecycle-latency`：基于exact published/display times，称communication latency而非detection/repair MTTR；
- `status-component-and-owned-telemetry-correlation-candidates`：只生成候选关联，需exact service mapping与overlap evidence；
- `maintenance-versus-unplanned-disruption`：严格分开计划维护和非计划事故；
- `public-history-and-edit-gap`：显示active/recent/window cap、last-seen、edit/delete与missing coverage；
- `status-contract-and-taxonomy-drift`：API/schema、condition/lifecycle/impact、component hierarchy、computation/override与rights变化。

所有view固定Channel/member/definition、page roster、representation、window/cap、rights/sanitizer revision与watermark。没有统一分母时不做“最不稳定平台/服务”排行。

## 4. Channel Skills 与 Probe

### `public-operational-status-source-research/v1`

研究官方docs/schema、Agent Skills/MCP与固定OSS，输出member/Pack/drift proposal；不调用真实status page。

### `public-operational-status-research/v1`（未来）

只调度用户批准且verified的public member route，返回成员独立coverage。当前三个成员均返回`no-authorized-binding`；不得用MCP、Manage API、private token或另一个成员fallback。

### `public-operational-status-channel-conformance/v1`

验证page/component/incident/update/maintenance/postmortem、active/recent/bounded coverage、publisher lifecycle、computation/override、manual/automatic/mirror provenance、HTML quarantine、partial degradation、dynamic views和zero-write。

Channel没有发布型Probe Skill。创建“测试事故”、修改component/resource状态、安排maintenance、订阅通知或评论/ack incident都会污染公开沟通或组织运营状态，必须拒绝。产品需求probe应在其他获准Channel发布，不伪造事故信号。

## 5. Fixture 与可观测性

| 场景 | 必须结果 |
| --- | --- |
| Statuspage recent-50，Better 90-day，Instatus active-only | 三个coverage并列报告，不合成complete history |
| same outage title across members/pages | 不merge；有exact service bridge才生成relation candidate |
| public incident + owned Sentry errors overlap | 只生成correlation candidate，不自动确认因果或用户影响 |
| component degraded without incident | component state独立，communication completeness gap可见 |
| incident resolved但owned errors持续 | publisher recovery claim与telemetry反证并存，不覆盖任一事实 |
| maintenance overlaps incident | records/evidence分开，不重复计数或把维护当unplanned |
| one member HTML quarantined | Channel partial；其他成员成功不掩盖quarantine |
| empty/404/schema drift | missing/blocked原因可见，不解释为operational |
| MCP/private API/subscription/write | effect拒绝且zero-write成立 |

Telemetry按`Channel × member × definition × page × representation × endpoint/window`记录expected/fixture/callable/succeeded/blocked/quarantined、page/component/incident/update/maintenance/postmortem counts、history/cap/last-seen、state/impact computation/override、publisher/mirror provenance、HTML/field quarantine、schema/docs/rights drift、HTTP budget/cache与zero-write。单一“status fetch成功”不是Channel健康指标。

## 6. 晋级

至少一个成员通过fixture conformance后，Channel才可成为`modeled-partial`。每个成员只有在用户批准的公开测试page完成read-only sandbox后才增加callable coverage；不同representation独立晋级。任何private page/token、MCP、管理API、subscription或status write不会随public read自动开放。
