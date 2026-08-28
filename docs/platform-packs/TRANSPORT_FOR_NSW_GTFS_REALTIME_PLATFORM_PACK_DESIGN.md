# Transport for NSW GTFS & Realtime Platform Pack

## 1. 稳定概念与成员边界

Transport for NSW Open Data Hub按产品和mode发布Complete/Realtime GTFS、Vehicle Positions、Trip Updates、Alerts、Trip Planner、Location Facilities与Historical GTFS/GTFS-RT。bus、Sydney Trains、NSW Trains、ferry、light rail、metro、coach和regional service拥有不同endpoint、operator population和更新频率；Pack固定exact mode/operator/feed roster，不让一个mode的coverage补齐另一个。

Trip Update可描述active trip stop-time updates、replacement vehicle和changed stopping pattern；Vehicle Position描述当前position；Alert按stop/trip/service line描述service status/incident。三者共享GTFS-RT wire但不是同一事实。Location Facilities的access type和station设施是static/csv属性，不等于实时lift availability。

## 2. 能力与访问

| capability | official surface | 当前姿态 |
| --- | --- | --- |
| schedule/route/stop/trip | Complete GTFS + Timetables for Realtime | exact route/schema fixture |
| prediction/trip update | GTFS-RT Trip Update v1/v2 by mode | exact route fixture |
| vehicle position | GTFS-RT Vehicle Positions v1/v2 by mode | exact route fixture |
| alerts | Realtime Alerts v2, stop/trip/service line | exact route fixture |
| static facility/accessibility | Location Facilities and GTFS pathways | exact product fixture |
| live facility status | no bound exact cross-mode live-facility contract | missing/degraded |
| history | Historical GTFS/GTFS-RT + GTFS Studio | account/product candidate；availability degraded |

当前`callable=0 / durable=0`。Open Data Hub必须注册并创建API key，默认Bronze为60,000 calls/day、5/sec且无sandbox；production key不能标记为sandbox validation。未来binding固定API version/endpoint、mode/operator roster、GTFS local implementation revision、API key ref、update interval、quota、historical extraction status和field allowlist。

## 3. Snapshot、字段与权利

Portal datasets以CC BY 4.0发布并要求TfNSW/relevant agency attribution、non-endorsement和trademark/logo隔离；Hub内容/格式可变，third-party data未必完整、及时或准确。Snapshot保存Hub Terms、dataset/product metadata、implementation spec、mode refresh table、portal alert、historical coverage与valid window。

默认projection保留opaque agency/operator/mode/feed/route/trip/stop/alert identity、typed relationship/time/freshness、coarse facility属性和approved aggregate。exact vehicle coordinates、vehicle/operator/employee identifiers、customer/contact/journey data、facility exact security detail、free-text incident和third-party content默认drop/quarantine。

## 4. 动态视图、可观测性与fixture

动态视图：`mode-operator-feed-endpoint-roster`、`complete-vs-realtime-gtfs-schedule-lineage`、`trip-update-replacement-pattern-change`、`vehicle-position-vs-trip-update-freshness`、`alert-stop-trip-line-scope`、`location-facility-static-accessibility-gap`、`historical-gtfsrt-nine-month-coverage-and-extract-health`、`v1-v2-local-extension-drift`与`vehicle-employee-customer-security-drop-audit`。

Telemetry逐`mode/operator/feed/version × GTFS/local schema revision × service date × route/trip/stop × vehicle/trip-update/alert timestamp × endpoint update interval × account/quota × history extraction status × licence/third-party posture`记录returned/retained/dropped、401/403/429、feed stale、mode partition gap、schedule/realtime unresolved、replacement/changed pattern conflict、portal technical alert、history truncation、terms drift、fallback rejection和zero effects。

Synthetic至少覆盖：bus 10秒与ferry 30秒freshness分开；v1/v2 route不fallback；replacement vehicle不改写trip identity；changed stopping pattern保留revision；alert stop-specific不扩为line-wide；static access type无live status；historical nine-month window不冒充full history；portal extract unavailable降级；API key存在但未授权network；third-party field quarantine。

## 5. 不可推断与官方资料

必须拒绝：schedule→actual、TripUpdate→measured actual、missing vehicle→cancelled、alert→every trip impacted、static facility→currently accessible、history tool说明→实际可用/完整、production key→sandbox、CC BY dataset→logo/Hub software/third-party rights、one mode success→all NSW coverage。

- [Transport Open Data documentation](https://opendata.transport.nsw.gov.au/developers/documentation)
- [How to develop an application](https://opendata.transport.nsw.gov.au/blog/devapp)
- [Realtime Alerts v2](https://opendata.transport.nsw.gov.au/data/dataset/public-transport-realtime-alerts-v2)
- [GTFS & GTFS-R Implementation Specification](https://opendata.transport.nsw.gov.au/sites/default/files/2023-08/TfNSW_GTFS_GTFS-R__Implementation_Specification.pdf)
- [GTFS Studio v2](https://opendata.transport.nsw.gov.au/sites/default/files/2025-05/GTFS%20Studio%20V2.0.pdf)
- [Open Data Hub Terms](https://opendata.transport.nsw.gov.au/sites/default/files/2024-09/TfNSW-Open-Data-Portal-Terms.pdf)

