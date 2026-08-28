# US EPA Superfund / SEMS Platform Pack 设计

状态：`concept-fixture + exact official route fixture / architecture-only`  
核验日期：2026-08-26  
Platform Pack ref：`us-epa-superfund-sems/v0-design`

## 1. 稳定概念

[SEMS](https://www.epa.gov/enviro/sems-search-user-guide)是CERCLA site/non-site Superfund数据的官方repository。[Superfund process](https://www.epa.gov/superfund/about-superfund-cleanup-process)区分discovery/notification、PA/SI、NPL、RI/FS、ROD、RD/RA、construction completion、post-construction、deletion与reuse；emergency response、enforcement和community involvement可在多阶段发生。

[Cleanup Process](https://www.epa.gov/superfund/superfund-cleanup-process)明确construction complete时final cleanup levels可能尚未达到；[Post Construction Completion](https://www.epa.gov/superfund/superfund-post-construction-completion)继续覆盖O&M、LTRA、institutional controls、five-year review及partial/site deletion。因此NPL standing、action、operable-unit milestone、sitewide milestone、control与reuse不可压成单一cleanup status。

## 2. 概念映射

| Native | `PublicContaminationRemediation*` |
| --- | --- |
| SEMS EPA ID / site / non-site | exact program subject；site、parcel与operable unit分离 |
| discovery / PA / SI / HRS | notification、assessment与source-defined priority；不等于listing或harm |
| proposed/final/deleted NPL | listing standing及effective revision |
| contaminant / affected media | observation metadata；无方法/单位/qualifier则coverage缺失 |
| ROD / amendment / ESD | remedy decision；不等于implementation |
| RD / RA / construction complete | design、action与exact-scope milestone |
| O&M / LTRA / institutional control / five-year review | operation、control与stewardship |
| deletion / reuse | closure/listing/reuse posture；不抹除residual controls |

## 3. 能力与边界

`definition.read`、`SEMS search/schema.read`、`report-resource.read`和`selected-site-record.read`仅为fixture capability。未来读取必须固定SEMS resource、program/NPL population、site/operable-unit scope、schema/history、boundary revision、official disclaimer、field allowlist与retention；不得回退到HTML crawling、community MCP或generic EPA aggregation。

SEMS/official reports用于information discovery，不是liability、cost recovery、statute-of-limitations、exposure或property-safety判断。exact location/boundary、sensitive infrastructure/community、party/contact与documents先经过field gate。全部notification/contact/subscribe/report/admin/write拒绝。

## 4. Synthetic conformance与遥测

Fixtures覆盖potential site→PA/SI no-further-action、proposed→final NPL、multiple operable units、ROD amended、one RA complete while treatment operates、construction complete before goals met、five-year review/control deficiency、partial deletion、site deletion with retained stewardship及reuse before deletion。

Telemetry按`SEMS resource × definition/schema revision × site/operable unit × lifecycle/listing × remedy/action/completion/control × authority × coverage/rights`记录retained/dropped/quarantined、orphan/mismatched relation、boundary/status drift、missing phase、unsafe upgrade rejection与effects=0。本轮没有请求场地行或文档。
