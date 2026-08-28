# Sentry Product Reliability Platform Pack 设计

状态：`researched / fixture-eligible / privacy+grouping-gated / no-callable-route`  
核验日期：2026-08-26  
Pack ref：`sentry-product-reliability/v0-design`

## 1. 定位与禁止边界

本 Pack 只设计用户组织拥有并明确授权的 Sentry organization/project 的只读错误可靠性研究。它用于发现错误类型、版本回归、环境差异和潜在未表达痛点；不配置SDK/采样/PII scrubber，不取任意组织，不写issue状态、assignee、comment、alert、release或integration，不触发Seer/autofix/PR，也不制造production error。

官方API存在不等于当前可调用。当前没有credential、ConnectionProfile、PortBinding或网络route。

## 2. 稳定概念

官方来源：[API Reference](https://docs.sentry.io/api/)、[Organization Issues](https://docs.sentry.io/api/events/list-an-organizations-issues/)、[Issue Events](https://docs.sentry.io/api/events/list-an-issues-events/)、[Issue Details](https://docs.sentry.io/product/issues/issue-details/)、[Release Health](https://docs.sentry.io/api/releases/retrieve-release-health-session-statistics/)。

| Concept ref | 原生身份/表示 | 稳定语义与限制 |
| --- | --- | --- |
| `sentry.organization-project/v1` | org + project | 项目roster与region/base URL属于definition；跨org/project同名不合并 |
| `sentry.issue-group/v1` | issue/group ID + observed snapshot | 多event的provider grouping；算法/fingerprint/merge会变，issue不等于一次失败或唯一root cause |
| `sentry.error-event/v1` | event ID + project + observed body revision | issue occurrence；full body可含stacktrace和敏感上下文 |
| `sentry.release/v1` | organization-scoped version + exact project binding | 同org同version可跨project共享；不能仅凭字符串跨org/member合并 |
| `sentry.environment/v1` | project/definition-scoped native value | filter和count均受environment选择影响 |
| `sentry.issue-state/v1` | current state + activity evidence | open/resolved/archived/regressed等是triage lifecycle，不是修复/恢复证明 |
| `sentry.issue-signal/v1` | provider-computed state/sort/signal | new/escalating/regressed/recommended等保持provider attribution |
| `sentry.release-health/v1` | query/window/group/measure snapshot | session状态aggregate；10K datapoint、interval/window和selection限制必须固定 |

## 3. Capability 与 representation

| Access profile | Capability proposal | 状态/约束 |
| --- | --- | --- |
| organization issue list | `product-reliability.issue.list.sentry/v1` | fixture-eligible；默认query是`is:unresolved`，全状态必须显式空query；max 100 + Link cursor |
| exact issue read | `product-reliability.issue.read.sentry/v1` | fixture-eligible；latest event/owner/comment/user-report等字段逐类allowlist |
| issue event list | `product-reliability.event.list.sentry/v1` | restricted fixture；`full=false`最小表面，`full=true`是独立高敏capability；max 100 + cursor |
| release list/health | `product-reliability.release-health.read.sentry/v1` | fixture-eligible aggregate；project/environment/window/session definition必须固定 |
| Explore table/timeseries | `product-reliability.aggregate.query.sentry/v1` | research-only；官方说明table不是full export，采样/外推/高基数近似与top groups要进入coverage |
| hosted MCP / official Skills | any generic route | rejected as Connector binding；混合debug、triage、配置、autofix和write |
| issue/release/alert/config mutation | any write | rejected；必须另建effect contract和用户批准 |

Web API当前称`v0`，public endpoints generally stable，beta仍会变化。能力按endpoint分别固定scope：issue/event通常需`event:read`，release可需`project:read`/`project:releases`，release health与Explore可需`org:read`。不能因一个token能读issue就宣称全Pack授权。

## 4. `ProductReliability*` 映射

每个dataset先固定 `ProductReliabilityDefinitionMetadata`：deployment/region、org/project roster、API/schema、SDK/instrumentation、environment/release/failure/state/signal taxonomy、grouping/fingerprint、ingestion filter、sampling、session、query/report、identity/scrubbing/rights/retention/deletion与valid window。

| Sentry fact | 映射 |
| --- | --- |
| issue current object | `IssueRecord` + `CurrentIssueRepresentation`；append observed revision，不覆盖旧state/count |
| event under issue | `OccurrenceRecord` + exact `OccurrenceOfRelation` |
| latest/oldest/recommended event | `SampleRepresentation` + selection basis；不是完整event population |
| status/activity/regression | `LifecycleRecord`或current lifecycle；resolved不等于fixed，regressed保持provider signal |
| title/message/culprit/frame | reviewed `ProductReliabilitySpanMetadata`；provider-derived与source diagnostic分开 |
| release/environment | scope-local `ProductReliabilityReleaseBinding` + exact relations |
| event/user/session counts | 独立 `ProductReliabilityImpactMeasure`；数值留在payload，ratio需denominator |
| issue search/sort/top/recommended | `ProductReliabilityPlacementMetadata`；query/filter/sort/window/position固定 |
| trace/replay/attachment/work item | descriptor/exact relation only；默认不下载或展开 |

本来源不新增“用户投诉”证据类型。仅凭exception、stacktrace或provider summary不能生成用户原话；可产生`observed-product-failure`类候选上下文，只有与exact support/review/session evidence关联后才能形成用户痛点表述。

## 5. 隐私与诊断内容

Sentry响应示例本身展示owner姓名/邮箱，event/hash示例可含user name/email/IP；full event还可能带request headers/body/cookies、locals、breadcrumbs、logs、source context、server/device、custom tags、attachments和replay。

未来任何route必须：

- 默认只读issue summary，drop owner/assignee/subscriber/viewer/user和所有identity值；
- `full=true`、attachments、replay、trace、source map debug和external link expansion全部独立拒绝，直到逐字段review；
- title/message/culprit/route也先进入secret/PII scan，不能假定技术字符串安全；
- 日志、raw blob、dead-letter和telemetry之前执行allowlist；只记录field class/drop count，不记录值；
- 保存Sentry dataScrubber/defaults/scrubIP/advanced rule的evidence，但provider配置只对新incoming events生效，不能证明历史数据已清洁；
- deletion/retention与issue disappearance分开；未观察到不能自动生成tombstone。

## 6. Skills 与开源审计

官方 [Sentry for AI](https://github.com/getsentry/sentry-for-ai/tree/c1aab39520fc1f28ba23e969a2d6b74a87088038) Skills覆盖instrument、debug issue、alert、autofix等工程工作；[Codex plugin](https://github.com/getsentry/plugin-codex/tree/1f076eb1d71fa0ec2d761e7d5c9d315068b09e32)连接hosted MCP。两者适合作Skill taxonomy参考，但不符合本Pack read-only、no-code-change、no-platform-write边界。

[sentry-api-schema](https://github.com/getsentry/sentry-api-schema/tree/022cd04e649b493057f510207d4ad4690aec6bd7)可用于schema diff、cursor和fixture validator研究；其FSL许可、生成时点和API v0/beta状态需随snapshot审核。本轮均未安装或执行。

Pack Skills：

- `sentry-reliability-pack-research/v1`：只读官方docs/schema与固定OSS，输出definition/drift proposal；
- `sentry-reliability-fixture-conformance/v1`：只消费合成fixtures；
- `sentry-owned-issue-read/v1`（未来）：只调用户批准project roster、query/window和issue summary allowlist；当前返回`capability-unavailable:no-authorized-binding`；
- `sentry-production-failure-probe/v1`：返回`unsupported:production-test-effect`。

## 7. Fixture Conformance

| 场景 | 必须结果 |
| --- | --- |
| omitted query vs empty query | default unresolved与all-status population分开，不误报完整 |
| one issue, many events | 一个provider group + 多occurrence，不把issue count当event/user count |
| grouping/fingerprint revision | 新definition；旧issue lineage保留，不静默重算历史 |
| issue merge/split | exact provider relation或candidate；不按title相似硬合并 |
| resolved then event recurs | triage lifecycle + provider regression；不自动生成“修复失败”结论 |
| latest/recommended sample only | sample coverage，不声明event history complete |
| event/user/session counts | counting unit分开；缺denominator不生成率 |
| sampled/extrapolated Explore | sampling/extrapolation显式；table不标full export |
| owner/user/IP/request/secret fixture | pre-persistence drop/quarantine，日志/索引无值 |
| stacktrace/message contains PII | quarantine，无EvidenceSpan |
| MCP/Seer/state/config/write | policy拒绝，zero platform side effect |

## 8. 可观测性与晋级

Telemetry按`definition × project × environment × release × capability × representation × query/window`保存requested/returned/page/cursor、issue/event/variant counts、state/signal、sampling/extrapolation、history/aggregate/diagnostic coverage、field drop/quarantine、schema/grouping/scrubbing/terms drift、rate-limit headers和zero-write；不记录issue/event ID原值或诊断正文。

晋级为`verified`需synthetic fixture report；进入`available`前需用户批准sandbox project、exact scopes、最小query roster、schema hash、rate/backoff、pre-persistence scrub proof、deletion/retention reconciliation、canary与kill switch。full event、Explore和release health分别晋级，不随issue summary自动开放。

