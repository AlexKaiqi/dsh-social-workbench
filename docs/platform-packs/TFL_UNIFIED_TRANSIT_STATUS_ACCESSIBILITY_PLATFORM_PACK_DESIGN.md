# TfL Unified Transit Status & Accessibility Platform Pack

## 1. 稳定概念与成员边界

TfL Unified API是一个跨mode facade：Journey、Line/Mode、StopPoint、Vehicle、status/disruption、arrival prediction、timetable、facility与Lift Disruptions共享customer-facing representation，但上游bus Countdown、rail polling和其他运营系统仍可能拥有不同latency、quality与coverage。canonical NaPTAN ID减少映射复杂度，不等于每个上游source已成为同一事实或完整历史。

Pack固定`mode -> line/route -> direction -> stop point/station/platform -> journey/prediction/status`，并将static step-free topology、required facility、live lift disruption和journey candidate分开。static topology + no reported outage仍不保证完整可达；partial Thameslink、manual boarding ramp、toilet/facility missingness必须保留。

## 2. 能力与访问

| capability | official surface | 当前姿态 |
| --- | --- | --- |
| timetable/route/stop | Unified API + selected static feeds | exact route/schema fixture；no request |
| arrivals/predictions | Unified instant/websocket products | exact route fixture；no token/no request |
| status/disruption/planned work | Line/Status/NetworkStatus APIs | exact route fixture；current/future分开 |
| vehicle/occupancy | Vehicle/Occupancy product | schema fixture；field/privacy gate required |
| accessibility topology | Station Data/Stop Structure/step-free GTFS+CSV | exact static route fixture |
| lift status | Lift Disruptions v2 | exact route fixture；must join exact facility IDs |
| historical performance | selected official reports/exports | manual/selected only；not Unified API population |

当前`callable=0 / durable=0`。live feed需要注册和token；未来binding固定API product/version、token scope、500 calls/min、refresh/display windows、mode/product roster、NaPTAN mapping revision与field allowlist。Unified API、legacy feed和public website不得互相fallback；example feed不是live coverage。

## 3. Snapshot、字段与权利

[Transport Data Service licence](https://tfl.gov.uk/corporate/terms-and-conditions/transport-data-service)基于修改过的OGL 2.0，要求`Powered by TfL Open Data`、OS/Geomni attribution、rate限制和non-endorsement，并可随时更新；它不是普通OGL snapshot。特定Oyster/Congestion Charging/Santander Cycles网站禁止自动提取，不能把统一transport licence扩大到其他surface。

Snapshot保存API/Swagger/product roster、step-free topology spec、refresh/display rule、licence/branding digest、NaPTAN/identity、facility mapping、coverage caveat与valid window。默认projection保留opaque line/stop/facility/status ID、mode、prediction/alert/facility posture和coarse aggregate；exact vehicle coordinate、registration account、user journey、search/favourite/subscription、raw disruption/security text和logo/map asset默认drop或另行治理。

## 4. 动态视图、可观测性与fixture

动态视图：`unified-product-to-upstream-mode-authority`、`current-vs-future-status-and-planned-work`、`arrival-prediction-freshness-by-mode`、`naptan-stop-platform-identity-lineage`、`step-free-topology-required-facility-graph`、`lift-disruption-to-current-journey-candidate`、`partial-missing-accessibility-coverage`、`unified-api-vs-legacy-feed-drift`与`branding-location-user-journey-drop-audit`。

Telemetry逐`API product/version × mode/line/stop/facility × upstream/source posture × prediction timestamp/age × status/disruption window × NaPTAN revision × topology/lift status × token/rate/display window × licence/attribution`记录returned/retained/dropped、429/throttle、stale arrival、mode disagreement、identity drift、facility join failure、topology gap、licence drift、fallback rejection与zero effects。

Synthetic至少覆盖：bus prediction30秒后stale；current status和future planned work分开；same NaPTAN parent/child platform；static step-free path需要两个lifts且一个outage；manual boarding ramp missing；Thameslink partial coverage；lift restored但另一个facility unknown；legacy/example feed拒绝冒充live；attribution缺失fail closed。

## 5. 不可推断与官方资料

必须拒绝：Unified schema→same upstream quality、latest API→complete history、prediction→actual、status severity→measured delay、disruption ended→restored、static step-free→current accessible journey、no lift outage→all facilities working、partial facility missing→absent、OGL→logo/map/website scraping rights。

- [TfL Unified API](https://tfl.gov.uk/info-for/open-data-users/unified-api?intcmp=29422)
- [TfL API portal](https://api-portal.tfl.gov.uk/api-details)
- [Our open data](https://tfl.gov.uk/info-for/open-data-users/our-open-data?intcmp=3671)
- [Step-free station topology specification](https://content.tfl.gov.uk/step-free-access-and-toilet-data-guide.pdf)
- [Transport Data Service licence](https://tfl.gov.uk/corporate/terms-and-conditions/transport-data-service)

