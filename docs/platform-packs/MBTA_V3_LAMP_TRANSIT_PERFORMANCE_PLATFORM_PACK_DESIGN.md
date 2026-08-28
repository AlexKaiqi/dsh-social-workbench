# MBTA V3, GTFS & LAMP Transit Performance Platform Pack

## 1. 稳定概念与成员边界

MBTA同时发布GTFS schedule、GTFS-RT、V3 JSON:API和LAMP历史/绩效。V3把Route、RoutePattern、Stop、Trip、Schedule、Prediction、Vehicle、Alert、Facility、LiveFacility和StopEvent分成resource；Pack保持这些原生identity，并只在official relationship或exact ID下建立schedule/realtime/facility lineage。

GTFS中的`facilities.txt`、pathways、levels和本地experimental fields描述静态拓扑；官方文档明确pathways尚未覆盖所有station。LiveFacility/alert描述当前状态；静态facility存在、no outage或单个facility restored都不证明current accessible journey。

LAMP保存GTFS archive、alerts和按service date的performance output，是与V3 current API不同的publication surface。LAMP performance是方法定义下的derived aggregate，不是raw feed truth，也不能跨成员借用。

## 2. 能力与访问

| capability | official surface | 当前姿态 |
| --- | --- | --- |
| schedule/topology | GTFS ZIP + V3 routes/stops/trips/schedules | exact route fixture |
| prediction/vehicle/actual event | GTFS-RT + V3 predictions/vehicles/stop events | exact route/schema fixture |
| alerts | GTFS-RT + V3 alerts/informed entities | exact route/schema fixture |
| facility/accessibility | GTFS facilities/pathways + V3 facilities/live_facilities | exact static/live route fixture |
| history | LAMP GTFS archive/alerts tables | exact bulk construction fixture |
| performance | LAMP subway on-time performance and OPMI tables | exact bulk fixture + evolving schema |

当前`callable=0 / durable=0`。V3可无key做实验，但正式app应注册独立key；未来binding固定API version、JSON:API includes/filter、GTFS feed_version/feed_id、linked dataset auth、experimental field revision、service date、LAMP partition/index与license digest。公开source code可审计不等于允许部署官方服务或访问内部S3。

## 3. Snapshot、字段与权利

Snapshot保存V3 Swagger/schema、GTFS/GTFS-RT implementation docs、feed/version/persistent/experimental字段、facility/pathway coverage、LAMP data dictionary/partition规则、MassDOT Developers License Agreement与valid window。

默认projection保留opaque route/pattern/stop/trip/prediction/alert/facility identity、typed time/standing/relation、service date和approved aggregate。exact vehicle coordinate/ID、operator/employee、rider/account/journey、station security detail、raw alert/contact text与内部S3/Tableau reference默认drop/quarantine。

## 4. 动态视图、可观测性与fixture

动态视图：`gtfs-feed-version-active-service-date-history`、`route-pattern-trip-stop-sequence`、`prediction-to-stop-event-actual-gap`、`gtfsrt-v3-representation-common-origin`、`facility-pathway-incomplete-coverage`、`static-facility-to-live-status-to-access-path`、`lamp-schedule-alert-performance-partition-lineage`、`performance-method-and-late-backfill`与`vehicle-employee-rider-internal-source-drop-audit`。

Telemetry逐`V3/GTFS/GTFS-RT/LAMP product × feed/schema/experimental revision × service date × route/pattern/trip/stop × prediction/actual age × alert/informed activity × facility/pathway/live status × LAMP partition/method/denominator × API key/licence`记录returned/retained/dropped、include/filter truncation、identity drift、missing actual、facility join gap、incomplete pathway、archive partition missing、late performance backfill、fallback rejection和zero effects。

Synthetic至少覆盖：persistent stop ID但feed version变化；route pattern revision；prediction later replaced by actual StopEvent；GTFS-RT与V3 common-origin不重复计数；facility in pathway但LiveFacility outage；pathways absent for station；restored facility但path incomplete；LAMP service-date partition missing；same on-time label/different threshold不merge；internal S3 path rejected。

## 5. 不可推断与官方资料

必须拒绝：schedule→operated、prediction→actual、no prediction→cancelled、V3 resource missing→entity absent、facility exists→working、pathway incomplete→inaccessible或accessible、LiveFacility restored→whole journey accessible、LAMP aggregate→raw trip事实、API source MIT→MBTA data rights、official code→production deployment authority。

- [MBTA V3 API portal](https://api-v3.mbta.com/)
- [MBTA V3 Swagger](https://api-v3.mbta.com/docs/swagger)
- [MBTA GTFS documentation](https://github.com/mbta/gtfs-documentation/)
- [MBTA LAMP Public Data](https://performancedata.mbta.com/)
- [MassDOT Developers License Agreement](https://github.com/mbta/gtfs-documentation/blob/master/developers-license-agreement.pdf)
- [MBTA V3 source](https://github.com/mbta/api)

