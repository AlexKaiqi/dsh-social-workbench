# Owned Product Reliability & Failure Signals Channel Pack 设计

状态：`researched`；2 个 fixture-eligible candidate，0 个 callable member  
核验日期：2026-08-26  
Channel Pack ref：`owned-product-reliability/v0-design`

## 1. 目的与成员

本 Channel 组合组织自有产品的错误、崩溃、ANR、版本回归和release/session稳定性信号，用来发现未主动表达的产品失败。它统一 `ProductReliability*` projection，不统一SDK覆盖、grouping算法、failure taxonomy、user/session identity、sampling、retention或severity。

| Member | Pack | 状态 | 当前coverage |
| --- | --- | --- | --- |
| Sentry | [Sentry Product Reliability Pack](SENTRY_PRODUCT_RELIABILITY_PLATFORM_PACK_DESIGN.md) | `fixture-eligible / no route` | issue/event/release/health官方read存在；privacy/grouping/sampling gate未过 |
| Firebase Crashlytics | [Firebase Crashlytics Product Reliability Pack](FIREBASE_CRASHLYTICS_PRODUCT_RELIABILITY_PLATFORM_PACK_DESIGN.md) | `fixture-eligible / no route` | v1alpha REST reports/issues/events与BigQuery export存在；alpha/privacy/export gate未过 |

requested=2、fixture-eligible=2、callable=0。某成员fixture通过不能让另一成员可用；MCP/Skill/CLI成功不能提高Connector coverage。

## 2. 共同契约与不可比较边界

共同projection固定definition、owned app/project roster、issue/variant/event/report、representation、failure kind、triage lifecycle、provider signal、release/environment、grouping/sampling/filtering、impact measure、history/coverage、privacy/retention/deletion和evidence。

必须保留：

- Sentry issue grouping/fingerprint与Crashlytics blamed-thread grouping各自版本化，不能跨成员按title/stack相似合并；
- fatal、non-fatal、ANR、handled/unhandled和performance issue不进入一个无来源severity scale；
- event、affected user/installation、device和session count不可相加；
- Sentry Explore sampling/extrapolation、Crashlytics report window/BigQuery export coverage分别报告；
- resolved/closed/muted/archived/acknowledged只是triage状态；
- provider new/fresh/early/escalating/regressed/repetitive只是derived signal；
- telemetry absence可能来自SDK未覆盖、采样、filter、quota、network/offline、upload延迟或权限，不证明无痛点；
- telemetry signal不是用户原话，和support/review/behavior只有exact app/release/time/instrumentation bridge时才能关联。

## 3. 动态物化视图

- `failure-regressions-by-release-environment`：只在exact release/environment binding和definition revision内聚合；
- `issue-to-occurrence-coverage`：区分group count、event count、selected samples和history gaps；
- `crash-free-or-error-free-session-trends`：固定session definition、numerator/denominator、sampling与completeness；成员间默认不比较；
- `high-impact-unexpressed-pain-candidates`：provider failure + exact owned support/review/usage evidence，输出candidate而非自动Opportunity；
- `grouping-and-instrumentation-drift`：group algorithm、fingerprint、SDK roster、sampling/filter/schema与retention变化；
- `sensitive-diagnostic-quarantine`：仅按field class统计，不暴露值。

所有view固定Channel/member/definition、app/project roster、representation、window、rights/privacy revision与watermark。没有session/exposure denominator时不计算failure rate；没有独立用户证据时不称“用户痛点规模”。

## 4. Channel Skills 与 Probe

### `product-reliability-source-research/v1`

研究官方API/schema/privacy/retention、Agent Skills/MCP与固定OSS，输出member/Pack/drift proposal；不连接真实项目。

### `owned-product-reliability-research/v1`（未来）

只调度已verified且用户批准的member read。当前两个成员均返回`no-authorized-binding`，不能用official MCP、CLI、BigQuery或另一个成员fallback。

### `product-reliability-channel-conformance/v1`

验证issue/group/event、release/environment、state/signal、sampling/filtering、aggregate denominator、member-specific coverage、PII/secret pre-gate、partial degradation、dynamic view和zero-write。

Channel没有通用Probe Skill。production synthetic crash、SDK instrumentation、采样/scrub rule、issue/note/alert/release状态或export配置都会改变产品/平台状态；若未来需要测试，只能在用户批准的隔离sandbox app中作为独立effect experiment执行，不能写入需求采集器。

## 5. Fixture 与可观测性

| 场景 | 必须结果 |
| --- | --- |
| Sentry passes, Crashlytics blocked | Channel partial；requested=2、callable=0/missing reasons可见 |
| same title/stack across members | 不merge，只生成有evidence的relation candidate |
| one issue has 1K events | group/event count分开，不称1K users或1K defects |
| high event count after SDK loop | instrumentation alternative explanation保持显式 |
| resolved/closed issue recurs | provider lifecycle/signal；不自动判断修复部署失败 |
| session denominator missing | 不生成rate、排行或跨member comparison |
| PII/secret in diagnostic content | member quarantine；其他成员成功不掩盖 |
| MCP/Skill/write/test crash | effect拒绝且zero-write成立 |

Telemetry按`Channel × member × definition × app/project × representation × capability/query/window`记录expected/fixture/callable/succeeded/blocked/quarantined、issue/variant/event/report counts、state/signal、release/session/aggregate/history/grouping/sampling coverage、field drop、schema/SDK/privacy/retention drift和zero-write。单一“错误数据读取成功”不是健康指标。

## 6. 晋级

至少一个成员通过fixture conformance后，Channel才可成为`modeled-partial`。每个成员只有在用户批准的isolated synthetic project/app完成read-only sandbox后才增加callable coverage。Sentry full event/Explore、Crashlytics REST/BigQuery分别晋级；任何write、真实用户identity、attachment/replay/minidump或production test crash不会随read自动开放。

