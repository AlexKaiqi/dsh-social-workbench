# Chicago Building Permits & Violations Platform Pack 设计

状态：`concept-fixture + exact Socrata dataset fixtures / architecture-only`
核验日期：2026-08-26
Platform Pack ref：`chicago-building-permits-violations/v0-design`

## 1. 稳定概念与官方证据

[Building Permits](https://data.cityofchicago.org/Buildings/Building-Permits/ydr8-5enu)固定dataset ID `ydr8-5enu`，描述2006年以来currently-valid issued permits。building或zoning fee未付时permit不有效；voided/revoked permits与若干permit类别不在population中。因此“没出现”不能映射为未申请、未批准或已撤销，“issue date”也必须结合fee rule解释。

[2024字段变更](https://data.cityofchicago.org/stories/s/Change-Notice-Building-Permits-5-1-2024/2mfe-wq8d/)新增/调整status、milestone、work type、fees和PIN list，[2025字段变更](https://data.cityofchicago.org/stories/s/Change-Notice-Building-Permits-10-15-2025/2gan-mdca/)新增permit condition。schema revision是解释permit validity和history的必需事实。

[Building Violations](https://data.cityofchicago.org/Buildings/Building-Violations/22u3-xenr)固定dataset ID `22u3-xenr`。violation总是关联inspection，一次inspection可有多条violation；inspection category包括complaint、periodic、permit等，`Open/Complied/No Entry`需分解为inspection result与compliance status。dataset包含liable和not liable记录，且官方警告其为历史信息、不一定反映property当前状况。

## 2. 概念映射

| Native | `PublicBuildingRegulation*` |
| --- | --- |
| PERMIT# / ID / review type | permit identity + provider record + plan-review process |
| permit type / work type / work description | work item, discipline and approved proposed-work span |
| issue date / milestone / status | lifecycle + authorization posture；issue可能仍受fee条件约束 |
| building/zoning/other fees | fee-validity binding；不作财务需求信号 |
| permit condition | authorization condition；非inspection result |
| inspection ID/category/status | inspection event/category/result identity |
| multiple violations per inspection | exact one-to-many relation；不按row数计inspection |
| violation status / waived | finding posture、compliance、waiver分别保存 |
| liable / not liable | adjudication posture；violation-issued不自动liable |
| PIN/address/geography | exact property fields restricted；仅approved coarse area进入分析 |

## 3. 期望只读能力与边界

`definition.read`、`dataset.metadata/schema.read`、`selected-valid-permit.metadata.read`、`selected-inspection-linked-violation.metadata.read`与`relation.metadata.read`仅为fixture capability。未来Socrata canary必须固定dataset ID、schema/change-notice revision、currently-valid population、excluded permit classes、fee-validity rule、inspection→violation relation、liability/current-condition disclaimer、field allowlist和location/privacy policy。

本Pack没有全application、void/revoked、certificate或independent inspection population；`22u3-xenr`只能提供产生violation的inspection-linked子集。community-created filters、maps和derived views全部拒绝作为authority。permit application、inspection request/result、complaint、payment、correction filing、status/admin及任何write为zero effect。

## 4. Synthetic fixtures与可观测性

Synthetic覆盖issued+building fee unpaid→invalid、other fee unpaid但仍valid、void/revoked absent、one permit→multiple work items/PINs、one inspection→multiple violations、complaint inspection≠verified violation、No Entry≠failed、waived≠passed、violation issued但not liable、Open/Complied与current condition分离、schema列删除/新增及exact address/PIN drop。

Telemetry逐`dataset ID × schema/change-notice revision × permit population/fee rule × inspection ID/category/result × violation/finding/adjudication/compliance posture × property/location/privacy/rights policy`记录returned/retained/dropped、one-to-many dedupe、validity conflict、current-condition warning、missing population、community fallback rejection和zero writes。本轮没有调用任何Socrata数据行。
