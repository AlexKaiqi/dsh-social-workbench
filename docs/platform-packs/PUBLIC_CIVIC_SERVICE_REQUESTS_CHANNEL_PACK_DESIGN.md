# Public Civic Service Requests & Reported Dispositions Channel Pack 设计

状态：`researched`；4个concept-fixture成员，4个route-fixture成员，0个callable成员，0个durable-approved成员  
核验日期：2026-08-26  
Channel Pack ref：`public-civic-service-requests/v0-design`

## 1. 目标、成员与分母

本Channel发现公共311/市政服务数据中被报告的service need、classification、agency assignment、status和source-declared disposition。它统一`PublicCivicServiceRequest*` projection，但不统一jurisdiction、participating agency/type、public/protected population、status/disposition taxonomy、location policy、history或refresh。

| Member | Pack | 当前coverage |
| --- | --- | --- |
| NYC 311 | [Pack](NYC_311_SERVICE_REQUESTS_PLATFORM_PACK_DESIGN.md) | concept + Socrata temporal-split route fixture |
| SF311 | [Pack](SF_311_CASES_PLATFORM_PACK_DESIGN.md) | concept + Socrata/Open311-read-boundary route fixture |
| Austin 3-1-1 | [Pack](AUSTIN_311_PUBLIC_DATA_PLATFORM_PACK_DESIGN.md) | concept + Socrata current-state route fixture |
| 311 Toronto | [Pack](TORONTO_311_SERVICE_REQUESTS_PLATFORM_PACK_DESIGN.md) | concept + CKAN yearly-export route fixture |

request、classification、assignment、status、disposition和location分别报告coverage。route fixture只证明静态官方machine contract可生成synthetic conformance，不代表已调用、可系统采集或可长期保存。

## 2. 共同证据语义

- exact public row/record最多形成`EvidencePublishedCivicServiceRequest`：证明发布请求记录，不证明unique person/incident、verified condition、validity、agency fault、prevalence或independent recurrence；
- exact agency status/update/closure span最多形成`EvidenceReportedCivicServiceDisposition`：证明source-declared workflow，不证明physical resolution、SLA、满意、持续效果或没有复发；
- source/origin分别保留public、contact centre、business、visitor、agency-internal和system；不能把channel或row count解释为unique users；
- duplicate必须是source-declared exact relation；基于时间/位置/category的相似项只能是candidate，不得静默dedup或合并证据；
- current-state row、status update和历史snapshot分开；没有history coverage不能从两个快照补造完整事件链；
- dataset/API/file/view common-origin去重；annual partition或NYC temporal split必须无gap/overlap验证；
- exact address、coordinates、unit/premise、media、contact和unreviewed free text默认drop；coarse geography仍需purpose和minimum-cell治理；
- missing service type/location/record可能来自protected data、participating-agency范围、validation、period或publication policy，不能当negative outcome。

## 3. 动态物化与知识数仓

- `requests-by-exact-service-type-origin-and-coarse-area`：输出request-record count，不命名people/incidents；
- `open-age-and-source-declared-disposition-by-native-status`：不把closed当实际resolved；
- `request-assignment-and-routing-history`：仅在source history足够时构建；
- `possible-repeat-patterns-with-duplicate-uncertainty`：候选聚类不改变canonical request identity；
- `service-type-roster-and-participating-agency-coverage`：显示新增/重命名/排除；
- `current-state-vs-observation-history-gaps`：禁止补造event；
- `annual-temporal-partition-and-common-origin-conflicts`：检查gap/overlap/duplicate；
- `location-coarsening-and-privacy-drop-audit`：验证输出无精确地点；
- `member-schema-refresh-rights-privacy-drift`：逐成员失效。

Dolt只保存Pack、definition、service/status/disposition/source taxonomy digest、dataset/resource/partition manifest、schema/licence/privacy/refresh digest、identity/relation/location-policy review、view、decision、lineage和tombstone。分析库只接获准的jurisdiction/service/category/agency/native status/coarse location metadata；不接natural-person/contact、exact address/coordinates、media、raw description或敏感status note，也不物化neighbourhood/agency performance ranking。

materialization key固定`member × jurisdiction × dataset/resource/partition × request/revision × service taxonomy × native status/disposition authority × origin × approved coarse geography × representation × rights-purpose`。schema、taxonomy、partition、privacy、location、rights、history或refresh contract变化使对应partition invalidation/rebuild。

## 4. Capability、Skill与Probe边界

共同read capabilities是official dataset/resource discovery、schema/taxonomy revision、selected record metadata representation、partition manifest和publication/refresh observation。Open311 GET capability按member独立绑定；标准含POST不代表成员开放，不允许从Socrata/CKAN route fallback到Open311 create或第三方MCP。

`public-civic-service-source-contract-research/v1`只读官方docs/catalogue metadata和固定静态source，输出Pack/drift proposal；`public-civic-service-conformance/v1`只用synthetic fixtures。未来`approved-public-civic-service-read/v1`必须绑定exact member/resource/window/service roster/coarse geography/fields/budget/purpose/retention；当前返回`no-authorized-public-civic-service-binding`。

本Channel没有Probe。创建报修、重复报修、附图/位置提交、status update、contact或subscribe均拒绝；Open311 POST、NYC partner-create和任何app report route invocation恒为零。

## 5. Synthetic fixtures、可观测性与晋级

| 场景 | 必须结果 |
| --- | --- |
| 一人对同一incident提交4次 | 4 request records；不生成4 people/incidents |
| 四人报告同一incident | 4 requests；只有exact/candidate relation，不静默合并 |
| closed后同地点同类再次发生 | 新request；不推断前次从未解决或永久解决 |
| source status=closed/resolved | source-declared disposition；不生成physical resolution evidence |
| duplicate closure | exact duplicate relation；不把duplicate当resolved repair |
| current-state row被更新 | observation history；不补造中间events |
| NYC 2019/2020 boundary | archive/current分区无gap/overlap，一个request identity |
| SF historical ward rewrite | taxonomy/boundary revision使旧geography projection失效 |
| Toronto original type/division后来改变 | original与current分类分开，不制造新request |
| annual file + API/view row | common-origin；只计一次request |
| Open311默认90日/1000条 | coverage truncated；不得声称complete |
| agency-internal source | 不映射resident demand |
| protected/nonparticipating type缺失 | population exclusion，不作negative |
| exact address/coordinates/media/free text | drop/coarsen；privacy telemetry增加 |
| report/create/contact/subscribe/status write | policy拒绝；zero external effects |

Telemetry按`Channel × member/jurisdiction × dataset/resource/partition × request/revision × service/native-status/disposition × origin × coarse-geography × representation × schema/taxonomy/privacy/rights revision`记录requested/concept-fixture/route-fixture/callable/succeeded/blocked/degraded/quarantined、returned/retained/dropped、identity/common-origin/duplicate conflict、history/classification/assignment/status/disposition/location coverage、privacy/coarsening drop、rights block、lag/refresh conflict/drift和zero writes。

至少一个成员经用户批准完成metadata-only或bounded-row canary才可`modeled-partial`。dataset rows、exact-ID lookup、Open311 GET、annual files、full history、free text/media、fine location和durable materialization均需逐成员另审；一个成员成功不能提升其他成员。
