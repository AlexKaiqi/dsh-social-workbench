# Toronto Building Permits Platform Pack 设计

状态：`concept-fixture + exact CKAN metadata/resource fixtures / architecture-only`
核验日期：2026-08-26
Platform Pack ref：`toronto-building-permits/v0-design`

## 1. 稳定概念与官方证据

City Open Data Team的[Building Permits data story](https://open.toronto.ca/exploring-cleared-building-permits/)定义五阶段：Application、Review、Issue、Inspection、Close。Issue表示计划获批且construction可开始；inspection完成并通过后工作被认为符合permit；Close还需要applicant联系City并确认inspection result。阶段相邻不证明实际开工或因果。

Active与Cleared是不同population。CKAN metadata-only核验固定：

- `building-permits-active-permits`：package `108c2bd1-6945-46f6-af92-02f5658ee7f7`，datastore resource `6d0229af-bc54-46de-9c2b-26759b01dd05`；
- `building-permits-cleared-permits`：package `9e42a85b-180f-4dc5-b0d7-d46661a6c0ec`，2017+ datastore resource `a96c0ba4-3026-402b-b09d-5b1268b8f810`，2000–2016 archive `c647bdae-0127-425e-86e6-2d88ff0e2adf`。

两个package均日更并由City of Toronto发布，但metadata中的`license_id`为`notspecified`。[Open Government Licence – Toronto](https://open.toronto.ca/open-data-licence/)是portal级官方许可并排除personal information与未授权third-party rights；dataset-level license metadata冲突必须先解决，不能据此批准durable ingest。

## 2. 概念映射

| Native | `PublicBuildingRegulation*` |
| --- | --- |
| permit number + revision | permit identity and revision/amend relation |
| Application / Review / Issue / Inspection / Close | lifecycle；authorization、inspection result和close分别绑定 |
| Active dataset | ongoing application/permit population；不含cleared denominator |
| Cleared 2017+ datastore / 2000–2016 archive | closed population with distinct resource/history revision |
| mechanical/plumbing companion permits | separate work item/permit relations；不按project计一次 |
| application/issued/completed dates | process milestones；derived review/inspection interval非事件事实 |
| current/proposed use, units, work description | approved coarse analytical fields；source claims retain role |
| GeoID/address/postal | exact location governed；postal only FSA due third-party licence |

## 3. 期望只读能力与边界

`definition.read`、`package/resource.metadata.read`、`selected-active-permit.metadata.read`、`selected-cleared-permit.metadata.read`与`permit-revision.relation.read`仅为fixture capability。未来CKAN canary必须固定host、package/resource ID、metadata/resource revision、active/cleared population、2017 split、field schema/order/pagination、public-field allowlist、FSA/GeoID/address policy、dataset license resolution、purpose/retention/deletion；禁止选择“first datastore resource”、任意package search、community MCP ranking或hosted server fallback。

当前开放dataset在permit级记录阶段与日期，不证明有可用的individual inspection event/result、violation、order、adjudication或certificate population，这些coverage保持missing。application、plan upload、inspection request/result、payment、complaint、certificate和任何write恒拒绝。

## 4. Synthetic fixtures与可观测性

Synthetic覆盖active+cleared分母组合、active多年未close、one project→multiple permits、permit revision lineage、2005前后classification drift、2017 resource split、derived inspection interval≠inspection event、cancelled permit exclusion、package metadata日更但resource schema drift、portal licence与package `notspecified`冲突、FSA-only postal policy及GeoID/address drop。

Telemetry逐`package/resource ID × metadata/schema/history revision × active/cleared/archive population × permit/revision/work item/stage × classification era × location/third-party-rights/privacy/licence policy`记录returned/retained/dropped、population gap、resource replacement、license conflict、quarantine、generic-resource fallback rejection和zero writes。本轮只调用CKAN `package_search/package_show` metadata action，没有调用datastore/resource数据记录。
