# NHTSA Vehicle Safety Complaints Platform Pack 设计

状态：`researched / fixture-eligible / schema+PII-gated / no-callable-route`  
核验日期：2026-08-26  
Pack ref：`nhtsa-vehicle-safety-complaints/v0-design`

## 1. 定位与禁止边界

本 Pack 只设计 NHTSA Office of Defects Investigation 公开 consumer complaint 的只读知识契约，用于发现车辆、轮胎、儿童约束系统和设备的具体故障叙述与消费者报告的影响。它不查询或解码 VIN，不保存投诉人/vehicle operator/dealer身份，不提交安全投诉，不下载 live bulk file，也不把 complaint、crash/fire/injury/death count 自动解释成缺陷、因果、违法、发生率或购买建议。

官方 API/文件存在不等于本机已可调用。真实 sandbox 需用户另行批准 exact车型roster、字段allowlist、rights/PII decision、频率与retention；当前没有 Connector、ConnectionProfile、PortBinding 或网络 route。

## 2. 稳定概念与身份

官方来源：[NHTSA complaints data/API](https://www.nhtsa.gov/nhtsa-datasets-and-apis)、[flat-file dictionary](https://static.nhtsa.gov/odi/ffdd/cmpl/CMPL.txt)。

| Concept ref | 类型 | 原生身份/关系 | 关键限制 |
| --- | --- | --- | --- |
| `nhtsa.odi-complaint-reference/v1` | complaint root candidate | `ODINO` + identity-policy revision | 可因多component重复；2002-12-15前还可能因同一投诉人的多产品重复，不能跨期当全局唯一root |
| `nhtsa.complaint-row/v1` | mutable subject row | `CMPLID` + output snapshot | dictionary称记录可更新；ID不是内容revision，旧snapshot不能覆盖 |
| `nhtsa.complaint-product/v1` | subject | product type + make/model/model year | product type为vehicle/tire/equipment/child restraint；`9999`表示unknown/N/A |
| `nhtsa.complaint-component/v1` | subject/component | provider component description | 同一 ODI 可有多个component rows；不能把row count当独立投诉数 |
| `nhtsa.consumer-narrative/v1` | complainant claim | row/root + content hash + snapshot | 叙述可能含个人信息且未经监管核验 |
| `nhtsa.reported-impact/v1` | source assertion | crash/fire/injury/death/medical/towed + value ref | reported flag/count，不是verified finding或causal outcome |
| `nhtsa.investigation/v1` | regulator process | exact investigation ref | 只有官方link/evidence才能关联；投诉数量本身不代表已调查 |
| `nhtsa.recall/v1` | regulator action | campaign ref | recall与complaint分概念；不能由文本或车型相似自动关联 |

Root identity 必须按 validity window 版本化。对 2002-12-15 前的 `ODINO` 只允许 provider grouping hint；没有额外官方关系时，各 `CMPLID` row独立，禁止把可能属于不同产品的记录合并成一个人或一次投诉。

## 3. Capability 与 Access Profiles

| Access profile | Capability proposal | 状态 | Population/限制 |
| --- | --- | --- | --- |
| `nhtsa-complaints-by-vehicle/v1` | `regulatory-complaint.list.vehicle-safety/v1` | fixture-eligible | fixed modelYear/make/model；API response schema仍需fixture/live discovery；无全市场分母 |
| `nhtsa-complaint-by-odi/v1` | `regulatory-complaint.read.vehicle-safety/v1` | fixture-eligible | exact ODI lookup；返回多row不代表多投诉；pre-2002 root ambiguity保留 |
| `nhtsa-complaint-product-taxonomy/v1` | `taxonomy.list.vehicle-complaint-products/v1` | fixture-eligible | modelYear→make→model，仅作query roster；拼写/大小写与case-sensitive method需固定 |
| `nhtsa-daily-bulk-complaints/v1` | `regulatory-complaint.import.vehicle-safety-bulk/v1` | research/fixture-only | 全量/五年分片；包含PII与mutable rows；在pre-persistence field gate验证前不得route |
| HTML/browser/MCP | any read fallback | rejected | public UI、Hosted MCP、community normalization不替代官方schema或field gate |
| complaint submission | `regulatory-complaint.submit.*` | rejected | 不是Probe；只有真实安全事件的本人/授权监管流程才可能提交，本系统不提供 |
| VIN lookup/decode | vehicle identity | out-of-purpose | API policy限制bulk VIN；本Pack输入、payload、telemetry和Skills均不接受VIN |

API 与 bulk 是不同 representation。API page/result completion不能声明bulk population complete；bulk snapshot完整也只代表该次published output，不代表所有事故、所有车辆、所有真实缺陷或完整修改/删除历史。

## 4. `RegulatoryComplaint*` 映射

每个 snapshot 先固定 `RegulatoryComplaintDefinitionMetadata`：regulator/jurisdiction/program/surface、API/schema、root/row identity、subject/issue/state taxonomy、response/disposition/impact/publication/consent/redaction/deidentification/verification、selection/population/rights/retention/deletion policy与valid window。

| NHTSA fact | 映射 |
| --- | --- |
| one ODI + multiple CMPLID/component rows | `RootComplaintRef` + multiple `SubjectRecord`；exact root/component relations，row count不升级为complaint count |
| current API/bulk row | `PublishedSnapshotRepresentation`或`BulkExportRepresentation` + observed revision/history coverage |
| CDESCR/summary | `NarrativeRecord` + `NarrativeContent` span；authority=`complainant-claim` |
| crash/fire/injury/death/medical/towed | `RegulatoryComplaintImpactAssertion`；reporter role、value ref、verified=nil unless exact regulator evidence |
| make/model/year/product type/component | `RegulatoryComplaintSubjectBinding`；scope-local native taxonomy |
| investigation/recall | 独立 subject/record + exact official relation；文本/数量相似只生成review candidate |
| API search/list position | `RegulatoryComplaintPlacementMetadata`；query/filter/sort/observedAt固定 |
| identity/contact/location fields | 不映射person attribution；按field policy drop/quarantine |

只有经过rights/PII review的叙述span能派生 `EvidenceComplaint`、failed-attempt、urgency或workaround。reported crash/fire/injury/death本身只增强“自述影响”上下文，不证明严重度、缺陷或因果；regulator investigation/recall也必须使用自身官方record，不能从 complaint 聚合猜出。

## 5. Schema、隐私与权利治理

### 5.1 pre-persistence allowlist

未来任何 route 都必须在日志、raw blob、dead-letter和telemetry之前完成字段分类：

- hard drop：VIN、vehicle operator name、consumer city、dealer name/telephone/city/ZIP、任意联系人/账号标识；
- default drop或coarsen：consumer state、incident state、purchase date、original-owner、mileage等非研究必需或可提高可识别性的字段；
- restricted + PII scan：complaint narrative；检测到姓名、电话、地址、VIN、车牌、账号等则quarantine，不进入索引；
- eligible metadata：product type、make/model/model year（unknown保留）、component、source/incident/received dates、reported impact flags/count refs、root/row IDs与evidence。

[NHTSA Terms](https://www.nhtsa.gov/about-nhtsa/terms-use)允许复制/分发public information，并明确accuracy/completeness disclaimer。每个 content class仍绑定exact terms evidence；外链、第三方材料和调查附件不继承本决策。rights decision变化时停止新materialization并使受影响projection失效。

### 5.2 schema/history conflict

- dataset page称time period `1949-present`，flat-file dictionary称complaints file包含自1995-01-01起的记录；coverage同时保存两项冲突，不选方便的一方；
- 2021 cleanup把blank Y/N变成`N`、blank numeric变成`0`，因此跨cutover比较不能把新`N/0`当真实否定/零发生；
- dictionary记录2021生成系统造成持续flat-file差异；snapshot消失、字段变化或值回写都不自动产生tombstone；
- 2026新增incident state与vehicle operator字段。后者必须触发schema quarantine而非自动进入payload；
- `CMPLID`对应记录可更新；每次观察生成append-first revision，不覆盖旧事实，也不宣称取得完整edit history。

## 6. Platform Skills

### `nhtsa-complaints-pack-research/v1`

读取官方docs/dictionary/terms和固定OSS snapshots，输出concept/capability/schema/PII/drift proposal；不调用API、下载bulk或注册route。

### `nhtsa-vehicle-roster-curation/v1`

从用户研究问题生成bounded modelYear/make/model query roster；不接收VIN、不枚举个人、不扩大全市场。

### `nhtsa-public-complaint-read/v1`（未来候选）

只允许用户批准roster上的official by-vehicle/by-ODI read；强制schema hash、field allowlist、query/rate budget、PII quarantine、history/coverage与no-write。当前必须返回 `capability-unavailable:no-authorized-binding`。

### `nhtsa-complaint-fixture-conformance/v1`

只消费synthetic/hand-authored fixtures，验证root/row/subject/impact mapping、schema cutover、PII drop、coverage、rights与zero-write。

### `nhtsa-complaint-probe-review/v1`

始终返回 `unsupported:not-a-demand-probe`。不得为了验证市场需求制造安全投诉、事故、伤害声明、监管记录或重复提交。

## 7. OSS/Agent 接入审计

社区 [NHTSA Vehicle Safety MCP Server](https://github.com/cyanheads/nhtsa-vehicle-safety-mcp-server/tree/f359e7303ae84f8ada76ac2f09de5fa901cc8ff5) 固定于 `f359e7303ae84f8ada76ac2f09de5fa901cc8ff5`，Apache-2.0。其优点是区分section availability、对异常incident date给出标记、提供OpenTelemetry，并暴露投诉/召回/调查的映射经验。

它不进入 route：Hosted MCP会把查询交给第三方实例；工具表面包含VIN、ratings、recalls、investigations和综合safety profile；summary/count与源record的lineage、PII field drop和root/row语义不符合本Pack最小合同。即使本地部署，也必须先拆成official endpoint adapter并通过相同conformance，不能把MCP成功当官方API/rights/coverage证明。本轮未安装、执行或连接该MCP。

## 8. Fixture Conformance

| Scenario | 必须证明 |
| --- | --- |
| one ODI, three components | 一个root candidate + 三个subject rows；不计为三次独立投诉 |
| pre-2002 repeated ODI across products | 不合并person或root；history policy标ambiguous |
| same CMPLID changed next snapshot | append observed revision，旧值保留，history不标complete |
| model year `9999` | unknown/N/A；不转成真实年份 |
| pre/post-2021 blank→N/0 | 保留cutover/unknown，禁止趋势伪差异 |
| 2021 file discrepancy | coverage degraded；API成功不掩盖bulk conflict |
| 2026 vehicle operator field appears | schema drift quarantine + hard drop；raw/log/index均无值 |
| VIN/dealer/contact in fixture | pre-persistence reject/drop；telemetry只计field class |
| PII embedded in narrative | restricted quarantine，无EvidenceSpan或search index |
| crash/fire/injury/death flags | source assertion，verified=nil；不生成regulator finding |
| complaint absent in later snapshot | not-observed，不生成tombstone |
| complaint count without exposure | 不生成发生率、市场份额或安全排名 |
| HTML/MCP/VIN/write fallback | policy拒绝，zero platform side effect |

## 9. Verification 与可观测性

晋级固定为 `evidence-review → static-contract → fixture-conformance → sandbox-live → operational-canary`。本轮只完成设计与Go静态编译；无 live API/bulk。

未来 telemetry 按 `Pack definition × schema × access profile × query roster × representation` 保存：requested/returned/root/row counts、multi-component rate、ambiguous-root count、unknown-year、narrative selected/quarantined、field-drop class counts、impact assertion counts、verified-null rate、API/bulk coverage、snapshot/dictionary/terms hash、2021/2026 cutover、schema conflict、429/4xx/5xx、rights decision、retention/deletion watermark与zero-write assertion。日志不得含VIN、车型之外的位置、正文、ODI/CMPLID原值或任何身份字段。

Sandbox 必须由用户批准一个最小车型roster，只验证read/schema/empty/partial/error，不下载全量bulk。Canary监测docs/dictionary/terms、API response schema、daily freshness、field additions、PII policy、root grouping与source disclaimer；drift先quarantine新snapshot，不静默修改mapper或历史解释。

## 10. 晋级缺口

进入`modeled`需接受definition/schema、field allowlist、root identity policy、fixture corpus与rights decision；进入`verified`需fixture report。进入`available`前还需用户授权sandbox、官方API exact response schema、rate/backoff、PII gate proof、deletion reconciliation、canary和kill switch。Bulk route需额外证明流式pre-persistence field drop，不能随API route自动晋级。任何级别都不开放投诉提交或VIN能力。
