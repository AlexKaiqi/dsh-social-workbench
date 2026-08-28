# England Planning Data Applications Platform Pack 设计

状态：`concept-fixture + exact route-fixture / architecture-only`
核验日期：2026-08-26
Platform Pack ref：`england-planning-data-applications/v0-design`

## 1. 稳定概念与官方证据

[Planning Data API](https://www.planning.data.gov.uk/docs)提供`GET /entity.json?dataset=planning-application`、OpenAPI和CSV/JSON/GeoJSON/Parquet bulk。该事实只固定公开技术表面，不固定全国完整性。[planning-application dataset](https://www.planning.data.gov.uk/dataset/planning-application)当前显示有限provider，并标明数据由MHCLG创建、未来由authoritative sources替换；[About](https://www.planning.data.gov.uk/about/)也明确coverage不完整、specification仍为draft。[roadmap](https://www.planning.data.gov.uk/about/roadmap)与[design project](https://design.planning.data.gov.uk/project/planning-applications)必须作为process/schema drift源。

官方[planning application specification source](https://github.com/digital-land/planning-application-data-specification/tree/8c7eee9ffc7ef1e0063d4112931cb12e2ba4e714)区分application、site、document、timeline、decision、condition和decision maker；`public-register-status`含publish/withhold/not-assessed。固定revision未发现license file，因此只引用规范知识，不假定可复制实现或内容。

## 2. 概念映射

| Native | `PublicPlanningApplication*` |
| --- | --- |
| entity / planning-application | application record + exact dataset/entity identity |
| site / geometry / address refs | restricted source location + approved coarse projection |
| document / timeline | typed document/event + revision relation |
| decision / decision-maker / condition | decision binding + authority + condition relation |
| publish / withhold / not-assessed | public visibility gate；not-assessed不得当publish |
| provider / dataset / endpoint | member、provider、population与representation独立coverage |
| draft specification | definition revision + valid window；不得永久化当前字段 |

community consultation module描述applicant-side consultation，不代表法定public representation corpus；decision specification中的officer report、appeal linkage等缺口必须保持missing coverage，不能从status或文本推断。

## 3. 期望只读能力

`definition.read`、`dataset.metadata.read`、`schema.read`、`selected-public-application.metadata.read`、`decision.metadata.read`与`history.metadata.read`为fixture capability，当前没有PortBinding。未来canary必须锁定exact endpoint/schema revision、provider roster、origin、public-register filter、pagination/order、watermark、field allowlist、coarse location、rights、purpose、retention和delete propagation；大范围读取只允许官方bulk，并与metadata canary分审。

## 4. 数据、安全、可观测性与Conformance

普通projection只保留opaque application/action/site-area/stage/decision/condition refs和approved requested-change span；exact address/coordinate/UPRN/parcel、applicant/agent/person、unreviewed document、withhold/not-assessed row均drop/quarantine。

Synthetic覆盖MHCLG-created origin≠LPA authoritative、6 providers≠national denominator、draft schema field rename、publish/withhold/not-assessed、application completed≠approved、officer recommendation≠decision、decision condition≠implementation、GeoJSON/JSON/CSV common origin与deleted/changed revision。Telemetry逐`endpoint × dataset/provider roster × schema/process revision × origin × visibility × field/location policy`报告returned/retained/dropped、coverage、drift、quarantine、fallback rejection与zero writes。

本轮没有调用`entity`或bulk data route。任何提交application、comment/representation、document、status或admin能力恒拒绝。
