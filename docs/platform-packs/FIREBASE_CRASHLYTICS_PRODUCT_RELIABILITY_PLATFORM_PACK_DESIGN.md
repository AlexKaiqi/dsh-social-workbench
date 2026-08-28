# Firebase Crashlytics Product Reliability Platform Pack 设计

状态：`researched / fixture-eligible / v1alpha+privacy-gated / no-callable-route`  
核验日期：2026-08-26  
Pack ref：`firebase-crashlytics-product-reliability/v0-design`

## 1. 定位

本 Pack 只设计用户拥有并明确授权的 Firebase project/app Crashlytics 只读可靠性研究。它不启用SDK/collection、BigQuery link/streaming、Cloud Logging sink，不读任意项目，不写issue state/note，不删除用户crash reports，也不通过MCP修改产品或代码。

## 2. 概念与表示

官方来源：[Crashlytics REST v1alpha](https://firebase.google.com/docs/reference/crashlytics/rest)、[Issue resource](https://firebase.google.com/docs/reference/crashlytics/rest/v1alpha/projects.apps.issues)、[Reports](https://firebase.google.com/docs/reference/crashlytics/rest/v1alpha/projects.apps.reports)、[BigQuery schema](https://firebase.google.com/docs/crashlytics/bigquery-dataset-schema)、[privacy/retention](https://firebase.google.com/support/privacy)。

| Concept ref | 身份/表示 | 限制 |
| --- | --- | --- |
| `firebase.crashlytics-app/v1alpha` | project + app resource | app roster、platform和API discovery revision属于definition |
| `firebase.crashlytics-issue/v1alpha` | immutable issue ID + current state snapshot | 相似blamed-thread stacktrace的provider grouping；不是一次event或root cause |
| `firebase.crashlytics-variant/v1alpha` | issue + variant ID | 必须exact parent，不用title/file相似合并 |
| `firebase.crashlytics-event/v1alpha` | event resource + occurrence time | fatal、non-fatal、ANR occurrence；可能无stacktrace |
| `firebase.crashlytics-report/v1alpha` | named report + exact filters/window/page | provider aggregate；usage字段和known caveat属于definition evidence |
| `firebase.crashlytics-bigquery-row/v1` | app table + event row + export mode | batch/realtime copy；和REST report/API是独立representation/coverage |
| `firebase.crashlytics-signal/v1alpha` | early/fresh/regressed/repetitive | provider analyzer特征，不是用户严重度或verified cause |

## 3. Capability

| Access profile | Capability proposal | 状态/限制 |
| --- | --- | --- |
| reports list/get | `product-reliability.aggregate.read.crashlytics/v1alpha` | fixture-eligible；default 7d、允许最近90 calendar days、page default25、token约10分钟且绑定exact filters |
| issue get | `product-reliability.issue.read.crashlytics/v1alpha` | fixture-eligible；single exact issue，list/top population经report得到 |
| events list/batchGet | `product-reliability.event.read.crashlytics/v1alpha` | restricted fixture；issue filter、descending time、batch最多100 |
| BigQuery batch export | `product-reliability.event.import.crashlytics-bigquery/v1` | authorized-export research；daily sync、首次可到48h、backfill最多近30日/enable date边界 |
| BigQuery realtime | separate import profile | deferred；需非Spark且非BigQuery sandbox，费用/late/duplicate/reconcile另验 |
| official Firebase MCP | generic agent route | rejected；同表面含create/delete note和update issue，工具发现也有公开operational risk evidence |
| state/note/delete/config/export mutation | write/effect | rejected；删除是独立治理义务，不能由research agent自动执行 |

REST目前是`v1alpha`，OAuth scope列出`cloud-platform`或`firebase`，比本Pack语义宽；scope存在不证明app roster、字段、retention和用途已批准。

## 4. `ProductReliability*` 映射

- Issue → `IssueRecord/CurrentIssueRepresentation`；title/subtitle、first/last version/time、state和signals分字段；
- variant → `VariantRecord` + exact `VariantOfRelation`；
- REST event / BigQuery row → `OccurrenceRecord`，分别使用occurrence/export representation；
- report group → `AggregateRecord` + `AggregateDatasetMetadata` + exact report usage/filter/window/granularity；
- FATAL/NON_FATAL/ANR → reviewed failure kind；fatal不自动等于业务严重度；
- early/fresh/regressed/repetitive → provider-derived signals；
- app/build/display version → scope-local release binding；
- event/user/session/crash-free measures → 独立impact refs；session export未启用时不能补造denominator；
- issue state `OPEN/CLOSED/MUTED/ACKNOWLEDGED` → triage lifecycle；closed不证明代码修复。

REST、BigQuery batch、BigQuery realtime和Cloud Logging是独立representation。某一路成功不补全另一路；batch/realtime相同event只有exact resource/event identity和reviewed dedup规则才能关联。

## 5. 隐私、保留与采集定义

官方说明Crashlytics可包含stacktrace、minidump处理结果、installation identifiers，并允许应用写入custom keys、logs和user identifier；BigQuery raw export还包含device/OS、errors/exceptions和自定义字段。Crashlytics live/backup移除流程前通常保留stacktrace、minidump-derived data和相关identifier 90天。

默认处理：

- hard drop：user ID、installation/Firebase IDs、IP、device instance、contact、request/account identity和任意secret；
- restricted：stacktrace paths/symbols、exception message、custom keys、logs、breadcrumbs、source context；通过secret/PII扫描才可形成最小span；
- aggregate eligible：app/release/environment/failure kind、provider state/signal、window、事件/会话measure refs和coverage；
- 不把“anonymous/hashed/arbitrary ID”当非个人数据；
- provider 90日retention不自动传递给BigQuery/Cloud Logging副本；unlink只停止后续export，已导出数据有独立retention与费用；
- user crash-report deletion API是治理能力，不是read Pack能力；未来deletion reconciliation必须跟踪request/receipt/completion而非静默丢弃。

## 6. 官方 MCP/OSS 与 Skills

[firebase/firebase-tools](https://github.com/firebase/firebase-tools/tree/5c167cb0c3186ab11a68bd6bda407530317f649b)固定于`5c167cb0c3186ab11a68bd6bda407530317f649b`，version `15.28.1`、MIT，是官方CLI/MCP实现。官方 [Crashlytics MCP docs](https://firebase.google.com/docs/crashlytics/ai-assistance-mcp)列出issue/event/report读取，也列出create/delete note与update issue；因此只能作为tool taxonomy和fixture参考，不能整体授予Connector权限。本轮未安装、执行或连接。

Pack Skills：

- `crashlytics-pack-research/v1`：只读官方docs/discovery/固定source，输出schema/drift proposal；
- `crashlytics-fixture-conformance/v1`：只消费synthetic REST/report/BigQuery fixtures；
- `crashlytics-owned-reliability-read/v1`（未来）：只允许批准app roster、report/filter/window和field allowlist；当前返回`capability-unavailable:no-authorized-binding`；
- `crashlytics-production-test-crash/v1`：返回`unsupported:production-test-effect`。

## 7. Fixture 与可观测性

| 场景 | 必须结果 |
| --- | --- |
| one issue, multiple variants/events | exact层次，issue/event/user/session计数不混 |
| fatal/non-fatal/ANR | failure kind保留；不生成统一severity或root cause |
| provider signals | derived attribution，不升级为事实 |
| default 7d / 90d limit | exact window与coverage；不能称all history |
| page token expired/filter changed | restart/reconcile，不能续错population |
| BigQuery initial 48h/daily/30d backfill | watermark与gap显式；realtime不掩盖batch缺口 |
| row lacks stacktrace | available-empty/omitted状态，不伪造content |
| custom key/log/user ID/secret | pre-persistence drop/quarantine，日志/索引无值 |
| REST vs export duplicate | 仅exact identity关联；不同representation均保留 |
| MCP state/note/delete/config | effect policy拒绝，zero-write成立 |

Telemetry按`definition × app × API/export representation × report/filter/window × release`保存page/token/watermark、issue/variant/event counts、failure/state/signal、aggregate/session coverage、batch/realtime latency、drop/quarantine、schema/retention/MCP drift与zero-write；不记录event/issue/user/installation ID原值或诊断正文。

进入`available`前需要用户批准synthetic sandbox app、exact IAM/OAuth、field allowlist、REST discovery/schema hash、BigQuery dataset contract（若启用）、费用预算、PII proof、deletion reconciliation、canary和kill switch。REST read与BigQuery import分别晋级。

