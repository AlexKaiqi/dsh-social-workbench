# Amplitude Product Analytics Platform Pack 设计

状态：`researched` 设计候选；未发布、未调用 API、未读取任何 Amplitude 数据  
核验日期：2026-08-26  
Pack ref：`amplitude-owned-product-usage/v0-design`

## 1. 定位与边界

本 Pack 只读取组织拥有并明确授权的 Amplitude project 中，经版本化 tracking plan、analysis definition 和字段最小化约束的产品行为聚合。Dashboard REST 是默认路线；Export API 仅作显式、高风险、已授权的 raw fallback，不进入普通需求发现。

它不能把“未发生事件”当作不用产品，把 funnel drop-off 当作痛点，把 behavioral retention 当作订阅留存，或把同名 chart 当作相同指标。Amplitude user/device/amplitude IDs、IP、精确经纬度、user/event properties、session replay和自由文本默认不进入需求知识。

```text
platform             Amplitude Analytics
surface              owned project/app; US/EU and project timezone fixed
state                researched
verified level       evidence-review design only
callable routes      none
external effects     none
```

## 2. Platform Concepts

| Concept ID | Kind | 身份候选 | 必须保留的语义 |
| --- | --- | --- | --- |
| `amplitude.project/v1` | tenant/surface | region + project API key/ref | project timezone、environment、retention/TTL和授权边界 |
| `amplitude.event/v1` | observed behavior | project + event/native IDs | event type、event/user properties、event/client/server upload times分开 |
| `amplitude.event-definition/v1` | tracking taxonomy | project + event type + plan revision | active/inactive/hidden/custom event、description/property schema和owner |
| `amplitude.user-identity/v1` | mutable identity relation | project + amplitude/user/device IDs | merge、anonymous/device到user、group unit和duplicate identity影响人数 |
| `amplitude.chart-query/v1` | analysis definition/result | project + chart ID/query revision | metric、events、filters、segments、group-by、timezone和result一起固定 |
| `amplitude.funnel/v1` | behavioral analysis | chart/query revision | order、exclusion、conversion window、resolution和filter作用范围 |
| `amplitude.retention/v1` | behavioral analysis | chart/query revision | start/return event、Return On/On or After、rolling/calendar interval和recent completeness |
| `amplitude.behavioral-cohort/v1` | derived membership definition | project + cohort ID/revision | rule definition与person membership分开；成员下载是身份化高风险 surface |
| `amplitude.export/v1` | raw event export | project + UTC hour window | 按 `server_upload_time` 分区、约2小时可用、zip JSONL、4GB/request |
| `amplitude.privacy-deletion/v2` | destructive privacy lifecycle | organization + request ID | org-wide staged/submitted/done、最多30天、删除不停止未来追踪/上游重灌 |

### 2.1 不能压平的语义

- user properties 是 event 发生时的 snapshot，并非 retroactive current profile；event properties只属于事件：[User properties and events](https://amplitude.com/docs/data/user-properties-and-events)。
- hidden/inactive property 不等于已删除；inactive-user properties 在规定条件下可能自动删除，历史可见性需和 schema状态分开。
- Retention 的 start/return event、24-hour rolling或strict calendar、Return On或Return On or After会改变结果；最近周期可能未完整：[Build retention analysis](https://www.amplitude.com/docs/analytics/charts/retention-analysis/retention-analysis-build)、[Retention time](https://www.amplitude.com/docs/analytics/charts/retention-analysis/retention-analysis-time)。
- Funnel filter 可能只作用于某一步/首事件，order/exclusion/resolution也影响分母与路径；chart title不能代表定义：[Funnel filters](https://amplitude.com/docs/analytics/charts/funnel-analysis/funnel-analysis-how-filters-work)。
- Export 按 `server_upload_time` 的 UTC 小时返回原始事件；event time 不能直接作无重叠 checkpoint：[Export API](https://amplitude.com/docs/apis/analytics/export)。

## 3. Capability 与 adoption decision

| Capability | Subject → Result | Access | Adoption | 说明 |
| --- | --- | --- | --- | --- |
| `taxonomy.list.owned-product-events/v1` | project → reviewed event taxonomy | Dashboard REST/manual plan | `eligible-with-policy` | tracking plan revision/active status/known gaps固定 |
| `analytics.query.owned-behavior-aggregate/v1` | fixed query + bounded window → aggregate result | Dashboard REST | `eligible-with-policy` | event segmentation、active/new users、funnel、retention、session metrics等按definition固定 |
| `analytics.read.owned-saved-chart/v1` | approved chart refs → definition/result | Dashboard REST | `eligible-with-policy` | dashboard filter不能假设自动继承到chart query |
| `analytics.export.owned-raw-events/v1` | project + UTC hours → zipped JSONL | Export API | `deferred/high-risk` | 2h lag、4GB/request、365-day max；只在显式授权+强最小化时使用 |
| `analytics.download.behavioral-cohort-members/v1` | cohort → user IDs | Cohort API | `rejected-default` | identity-heavy、并发/下载额度/2M cohort限制，聚合研究无必要 |
| `analytics.query.agent-amplitude/v1` | prompt → chart/cohort/taxonomy/experiment result | hosted MCP | `deferred` | MCP可读写且第三方AI处理数据；不作确定性Connector baseline |
| `privacy.delete.analytics-user/v2` | org request → destructive deletion | Privacy API | `rejected` | org-wide secret和不可取消/异步写副作用；属于privacy control plane |
| `analytics.write.chart-taxonomy-flag-experiment/v1` | instruction → platform/code mutation | MCP/API/SDK | `rejected` | 改变分析定义、埋点、实验或用户体验 |

本 Pack 不定义 Probe Skill。埋点部署、tracking plan改写、feature flag/experiment发布及对用户外联都需独立变更和实验治理。

## 4. Access Methods

### 4.1 `amplitude-dashboard-rest/v1`

- mode：`official-api`；access class：`owned`；effect：`none/local-write`；
- host：US/EU按project固定；所有分析明确project timezone；
- auth：Dashboard/Export 使用 project API key + secret key。公开文档未给这组接口细粒度只读 scope，因此把 credential视作 project-level强边界，单独保管、轮转和撤销，不宣传不存在的least privilege：[Authentication](https://amplitude.com/docs/apis/authentication)；
- queries：只允许 versioned templates，固定 event definitions、segments、filters、group-by、interval、window、unit、identity和completeness；
- budget：组织内 Dashboard REST/cohort download合计最多5 concurrent，另有 5-minute/hourly cost budget；必须中央限流并记录cost，不能靠并行keys绕过：[Dashboard REST API](https://amplitude.com/docs/apis/analytics/dashboard-rest)；
- saved chart：读取实际query payload；MCP或dashboard展示使用default chart settings而非saved dashboard filters时，标definition mismatch而不是复用title。

### 4.2 `amplitude-export/v1`

- 只在用户显式批准raw export、目的和field allowlist后启用；普通Pack维持deferred；
- checkpoint按UTC `server_upload_time` 小时窗，并保留至少文档允许的处理延迟/重叠；event_time、client_event_time、processed/server upload time分别保存；
- 数据约2小时后可用；单请求最大4GB、范围最大365天；404可表示该时间窗无数据，不等于auth failure；
- raw fields可含 user/device/amplitude IDs、IP、precise latitude/longitude、user/group/event properties，默认在进入 canonical 前 drop/quarantine；zip JSONL payload短期隔离、解析后按policy清理；
- Export completeness、TTL、late upload、oversize split和deletion propagation均显式，不由“每小时请求成功”推断完整。

### 4.3 `amplitude-mcp/v1`

官方 hosted MCP 通过 OAuth 提供 charts、dashboards、experiments、cohorts、taxonomy、flags、warehouse 等广泛读写；roles可有 `USE_MCP_READ/WRITE`，但tool list仍可能可见，禁止调用常在call time失败。第三方AI会处理数据，大结果可能截断，dashboard filters也可能未继承：[Amplitude MCP](https://amplitude.com/docs/amplitude-ai/amplitude-mcp)。当前只作为 discovery/diagnose 候选；采用前需固定tool allowlist、read-only role、result schema/coverage、data processor、prompt injection和drift canary。

### 4.4 privacy 与 authorized export

Privacy API v2 是组织级 destructive control plane，不是Connector read route；删除请求不可由需求Agent创建。若用户提供完成receipt，Connector只做本地撤销传播。Amplitude删除不阻止未来同ID继续追踪，上游warehouse也可能重新导入，因此必须联合source-of-truth deletion policy：[User Privacy API v2](https://amplitude.com/docs/apis/analytics/user-privacy-v2)。

## 5. Platform Skills

### `amplitude-product-analytics-pack-research/v1`

- purpose：`research/curate`；核验ontology、Dashboard/Export/Cohort/Privacy API、auth/rates/TTL/terms、MCP、官方Skills与固定OSS；
- 只生成proposal；禁止创建credential、chart/cohort、MCP connection、tracking plan、experiment或deletion request。

### `amplitude-owned-product-usage/v1`

- purpose：`acquire`；输入固定Pack/snapshot、project/region/timezone roster、approved definition refs、window、tracking/identity/DataHandling/Coverage policy；
- allowlist：taxonomy metadata、approved saved chart definition和bounded Dashboard aggregates；
- 输出 aggregate Observation、`BehavioralDatasetMetadata`、coverage/instrumentation health和最小projection；
- 禁止 cohort-member/raw identity/replay/property expansion、MCP fallback、chart/taxonomy/experiment writes。Export route保持单独deferred grant。

### `amplitude-product-analytics-conformance/v1`

- purpose：`verify/diagnose`；fixture默认无网络；
- 验证identity、property snapshots、funnel/retention definition、project timezone、incomplete period、rate/cost、Export watermark/lag/limits、TTL/deletion和forbidden writes；
- sandbox live仅在用户另行授权的synthetic project和read-only usage policy下执行。

官方 marketplace skills 中，journey/opportunity/account-health 方法可作问题清单，但“始终识别并联系具体用户”、自动判断 at-risk/upsell、读取replay或修改taxonomy/code均违反默认去身份化和零副作用边界，不直接复用。

## 6. Projection、数据治理与证据强度

`owned-product-usage-analysis` 必须记录project/region/timezone/Pack revision、tracking/analysis definition、criteria/filter、person/group/session unit、identity policy、sequence/window/interval/time basis、numerator/denominator、cohort/completeness、aggregate state、coverage和lineage。

- 默认聚合优先；API key/secret、user/device/amplitude ID、IP、exact location、email/name、session/replay、user/group/event properties、URL和free text不进入模型/索引。未知字段默认quarantine。
- `observed-usage` 不是activation/value/satisfaction/pain/causality；retention chart不是billing `retention-outcome`；funnel absence不是complaint。Activation只能是固定definition下、经predictive/业务review的派生候选。
- tracking plan/version、inactive/hidden state、identity merge、project timezone、chart filter、TTL或return mode任一变化，都创建新definition/result lineage；不能无声续接旧时间序列。
- “无数据”需先区分404 empty window、Export约2h lag、SDK故障、identity split、TTL删除、hidden/inactive definition、filter mismatch、current period不完整和真正未使用。
- 用户负责Customer Data权利、通知、同意与准确性；敏感数据限制及当期服务条款需由组织审查：[Amplitude Terms](https://www.amplitude.com/terms)、[Privacy and consent implementation](https://amplitude.com/docs/data/privacy-and-consent-implementation)。

## 7. 开源与 Agent Artifact 候选

以下 revision 于2026-08-26只读固定；未clone、安装或执行：

| Artifact / revision | Ownership / License | 价值 | 决策 |
| --- | --- | --- | --- |
| [amplitude/mcp-marketplace](https://github.com/amplitude/mcp-marketplace/tree/7dcd19575c504e6e6270edc32dae5222e3b78bac) `7dcd195...` | Amplitude 官方；MIT | account health、opportunity、journey、taxonomy、instrumentation方法和tool dependencies | `methodology-only`；用户级识别/外联/replay/写入建议需删去，不安装 |
| [Amplitude-TypeScript](https://github.com/amplitude/Amplitude-TypeScript/tree/f831aba44bf8259d105ee7c632e48ac553bf3a64) `f831aba...` | Amplitude 官方；MIT | client ingestion、identity/property/event语义与synthetic fixture参考 | `official-reference`；是写入SDK，不是read Connector |
| [amplitude/mcp-server-guide](https://github.com/amplitude/mcp-server-guide/tree/ee77a55c846c499027212589285d6ef9d637a87d) `ee77a55...` | Amplitude 官方；固定revision未发现LICENSE | MCP setup/discovery历史 | `discovery-only/license-blocked`；官方docs为authority |
| [Airbyte Amplitude source](https://github.com/airbytehq/airbyte/tree/1339a9ecca6f8fb547ffb7b19665d6980c069026/airbyte-integrations/connectors/source-amplitude) `1339a9e...` / 0.7.38 | Airbyte；ELv2 path；certified GA | Export hourly raw、active users、annotations、cohorts、event list schemas和state fixture | `reference-only`；raw identity面过宽、许可/运行时不直接复用 |

## 8. Verification Plan

### evidence-review / static-contract

- region/project/timezone、tracking/analysis/identity refs、schema/field policy固定；
- Dashboard aggregate、saved chart、Export、cohort download、MCP和privacy control plane互不冒充；
- project credential、5 concurrent/cost budgets、Export lag/4GB/365d/UTC-hour coverage固定；
- identity/raw/replay/properties/cohort-member/MCP write/privacy delete静态拒绝；
- `observed-usage` 与activation/pain/value/causality/billing retention隔离。

### fixture-conformance

| Fixture | 必须证明 |
| --- | --- |
| anonymous device later user merge | identity revision影响unique count；旧result不可无声比较 |
| user property changes | 每event snapshot保留；不retroactive回写旧event |
| hidden/inactive property/event | 管理状态不是删除；历史/TTL另建模 |
| funnel filter only on first step | filter scope固定；不外推所有steps |
| order/exclusion/resolution changes | 生成新definition ref和不可比result |
| Return On vs On or After | retention语义分开；不映射subscription outcome |
| rolling 24h vs calendar/project timezone | interval/timezone固定，边界不漂移 |
| recent period incomplete | provisional/incomplete，不拿当前格比较完整历史格 |
| Export event_time vs server_upload_time | checkpoint按upload hour；late event仍可捕获 |
| Export 2h lag / 404 empty | 正确等待或标empty；不制造failure/complete claim |
| Export >4GB or >365d | 窗口拆分且coverage可审计；不丢 silently |
| TTL removes old events | chart zero标retention boundary，不解释需求变化 |
| chart defaults differ from dashboard filters | definition mismatch，禁止用title拼接 |
| ID/IP/lat-lng/property appears | drop/quarantine；不进入model/index/log fixture |
| Privacy deletion then upstream reingest | 本地撤销+future-source gap显式；不声称永久删除 |
| MCP attempts chart/cohort/flag/taxonomy write | policy gate拒绝，零platform-write |

### sandbox-live / operational-canary

经用户授权后，由独立测试管理员在synthetic project发送固定events，Connector只读。Canary监测API/MCP/tool/schema drift、cost/concurrency、query lag/error、Export availability/size/late data、tracking definition drift、identity split、timezone/filter mismatch、partial-period exposure、TTL/deletion propagation、PII quarantine、correction backlog和零平台写入不变量。

## 9. 晋级缺口

进入 `modeled` 需要 accepted concepts/capabilities/access/adoption snapshots、project roster、tracking/analysis registry、native schemas、DataHandling/Behavioral/Coverage policy；进入 `verified` 需要fixture report，并经用户授权完成synthetic read-only sandbox report。当前没有Connector、credential、MCP、Export、live data、Amplitude object mutation或callable route。
