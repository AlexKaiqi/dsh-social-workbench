# NYC MTA Transit Service Platform Pack

## 1. 稳定概念与成员边界

NYC MTA不是单一feed：NYC Subway、NYCT/MTA Bus、LIRR与Metro-North拥有不同agency ID、schedule/realtime feed partition、extension、认证历史与coverage。Pack固定`network -> agency/operator -> mode -> feed product -> route/direction/pattern -> service day/trip -> stop/platform/event`，不让一个feed的健康或ID补齐另一个。

GTFS schedule描述计划服务；GTFS-RT TripUpdate、VehiclePosition和Alert是不同entity。MTA subway reference说明VehiclePosition通常在列车开始移动后才出现，因此assigned/not-started、stalled candidate、missing entity和cancelled必须分开。MTA Alerts为GTFS-RT 2.0 FULL_DATASET并含MTA extension、clone/message/service-plan与station alternative lineage；FULL_DATASET只定义单次feed替换语义，不提供历史。

MTA current alert、公开elevator/escalator页面与绩效aggregate是不同surface。alert的`ACCESSIBILITY_ISSUE`或station alternative不等于完整facility topology；公开availability百分比也不等于某个lift当前working。

## 2. 能力与访问

| capability | official surface | 当前姿态 |
| --- | --- | --- |
| schedule/route/stop/trip | product-specific GTFS ZIP | exact route fixture；no download |
| trip update/prediction | product-specific GTFS-RT protobuf | exact route fixture；no request |
| vehicle/progress | subway/bus/rail product-specific realtime | exact product fixture；absence semantics guarded |
| service alerts | GTFS-RT 2.0 full feed + MTA extension | exact route/schema fixture；no request |
| facility/accessibility | alert effect + selected official status/report | selected/static candidate；no exact live asset route bound |
| performance/history | data.ny.gov/MTA methodology datasets | aggregate route fixture；raw realtime history unavailable by default |

当前`callable=0 / durable=0`。未来canary必须固定当前developer terms、exact feed URL/partition、agency/product、GTFS/extension revision、service-day/timezone、freshness、FULL_DATASET handling、native ID continuity与field allowlist。Bus Time旧key文档、subway current no-key feed和commuter feed不能共享credential posture；历史网页/third-party catalogue不能替代当前official contract。

## 3. Snapshot、字段与权利

Snapshot保存MTA官方GTFS/GTFS-RT/MTA extension文档、feed/agency roster、terms digest、Open Data Plan、绩效overview/data dictionary、method/threshold/denominator与valid window。实时feed通常没有官方完整history，不能用本系统未采集期补成continuous coverage。

默认projection保留opaque agency/feed/route/trip/stop/alert identity、service date、typed schedule relationship、coarse prediction/actual posture、alert cause/effect/standing和approved aggregate。exact live coordinate、vehicle/train serial、crew/employee、internal service-plan/security identifiers、rider/journey/contact、full alert free text与station security detail默认drop/quarantine。

## 4. 动态视图、可观测性与fixture

动态视图：`agency-product-feed-partition-roster`、`schedule-to-realtime-exact-trip-stop-lineage`、`assigned-not-moving-stalled-missing-cancelled-gap`、`full-dataset-alert-clone-update-end-history`、`route-stop-informed-entity-scope`、`alert-accessibility-vs-facility-status-gap`、`realtime-unarchived-vs-performance-aggregate-history`、`legacy-current-metric-definition-separation`与`vehicle-employee-rider-security-drop-audit`。

Telemetry逐`agency/product/feed × GTFS/MTA extension revision × service date × route/trip/stop × header/entity/vehicle age × trip/stop relationship × alert cause/effect/standing × history/metric definition × terms/privacy`记录fetch/parse、returned/retained/dropped、partition gap、unresolved schedule ID、stale/stalled candidate、FULL_DATASET delete、clone/message drift、aggregate methodology drift、fallback rejection和zero effects。

Synthetic至少覆盖：assigned trip无position；position timestamp旧于header；一个feed正常另一个stale；alert clone更新；route-wide与single-stop alert；alert结束但无实际恢复证据；current status无historical continuity；旧KPI同名不同method不merge；exact coordinate/vehicle/employee drop。

## 5. 不可推断与官方资料

必须拒绝：schedule→operated、no VehiclePosition→cancelled、prediction→actual、alert→measured impact/root cause、alert missing→restored、accessibility alert→whole station inaccessible、performance aggregate→每班车/每名乘客、旧/新metric同名→可比、GTFS catalogue/MCP→official member route。

- [MTA Developers / GTFS documentation](https://github.com/nymta/gtfs-documentation)
- [NYC Subway GTFS-RT Reference](https://api.mta.info/GTFS.pdf)
- [MTA GTFS Alerts Feed Documentation](https://www.mta.info/document/90881)
- [MTA Open Data Plan](https://www.mta.info/document/85366)
- [MTA performance datasets](https://data.ny.gov/browse?Dataset-Information_Agency=Metropolitan+Transportation+Authority)

