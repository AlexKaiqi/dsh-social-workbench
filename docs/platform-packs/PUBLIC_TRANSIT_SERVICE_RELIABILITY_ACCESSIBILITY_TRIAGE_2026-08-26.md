# 公共交通服务可靠性、中断与无障碍候选分流（2026-08-26）

## 1. 结论

本轮选择四个能共同覆盖schedule、realtime、service alert、facility/accessibility与history/performance差异的平台，但不把“支持GTFS”当成同一种能力：

| 成员 | 核心价值 | 当前成熟度 | 主要缺口 |
| --- | --- | --- | --- |
| NYC MTA | 多agency/mode GTFS与GTFS-RT、MTA alert extension、公开绩效aggregate | concept + schedule/realtime/alert route fixture + performance fixture + selected accessibility | subway/bus/commuter feed与认证历史不同；无固定live facility-status机器合同；实时全量历史通常不发布 |
| TfL Unified API | multimodal status/disruption、prediction、timetable、stop/facility及Lift Disruptions | concept + exact unified API/status/accessibility route fixture + selected performance | 注册/token、500 calls/min与专门Transport Data Service licence；API facade隐藏上游差异；历史绩效非同一合同 |
| MBTA V3 + LAMP | JSON:API schedule/realtime/alerts/facilities/live facilities，历史GTFS/alerts/performance | concept + exact V3/GTFS/GTFS-RT/facility/history route fixture | pathway并非全站完整；实验字段、LAMP early-days schema与license revision需固定 |
| Transport for NSW | multimodal GTFS/GTFS-RT alerts/positions/trip updates、静态facility与历史Studio | concept + exact schedule/realtime/alert route fixture + facility/history candidate | 必须账号/API key、无sandbox、不同mode刷新率不同；历史extract当前存在技术可用性告警 |

成熟度固定为：`requested=4 / concept-fixture=4 / exact official schedule route-fixture=4 / exact official realtime route-fixture=4 / exact official alert route-fixture=4 / accessibility topology-or-facility fixture=3 / live facility-status route-fixture=2 / official history-or-performance fixture=3 / selected-manual=4 / callable=0 / durable=0`。

本轮只读取官方文档、developer portal/schema说明、固定Git revision及静态源码文本；没有请求GTFS ZIP、GTFS-RT protobuf、arrival/prediction、vehicle position、alert、facility status或performance数据行，没有注册账号/key，没有安装或执行开源项目、Skill或MCP，也没有发布通告、提交事故报告、订阅、联系机构或产生运营副作用。

## 2. 第一性原理边界

1. agency、operator、network、mode、line、route、direction、pattern、stop、station、platform、entrance、pathway、service、trip、vehicle和stop event是不同identity；同名、近坐标或相同时刻不能自动merge。
2. GTFS schedule只描述发布的计划服务；它不证明trip已分配、已发车、到站、完成或载客。
3. TripUpdate、Prediction、VehiclePosition与source-reported actual stop event分别保存；预测时间不能回填为actual。
4. realtime feed缺少trip/vehicle可能是not realtime-capable、尚未开始、feed partition、stale、删除或采集缺口，不足以推断cancelled。
5. `CANCELED`、`SKIPPED`、`NO_DATA`、`ADDED`、`DUPLICATED`、replacement和changed stopping pattern分别保存。
6. feed header timestamp、entity timestamp、vehicle measurement time、prediction issue time、event time、service date与calendar timezone不能互换。
7. alert的active period表示issuer希望展示或生效的窗口；alert存在不证明每班车或每名乘客受到影响，消失/expiry也不证明恢复。
8. alert cause是publisher assertion，不自动成为经调查确认的root cause；cause、effect、severity与measured delay分开。
9. static `wheelchair_boarding`、pathway或step-free topology只描述固定版本属性；还需当前设施、入口、platform、vehicle、assistance和transfer条件才能形成current journey candidate。
10. 一个elevator outage不自动等于整个station inaccessible；restored也不证明所有可达路径恢复。
11. on-time performance、service delivered、headway adherence、wait assessment、journey time、incident count和facility availability使用不同population、threshold与denominator，不能跨成员按名称或百分比排名。
12. GTFS/GTFS-RT标准一致只证明wire representation相近，不证明agency population、扩展字段、质量、history、rights或metric可比。
13. exact vehicle coordinate、vehicle/operator/employee identifier、security-sensitive infrastructure、rider/journey/account/search/subscribe identity与自由文本默认drop或降精度；不建立人员或车辆轨迹画像。

## 3. 官方平台证据

### 3.1 NYC MTA

[MTA GTFS documentation](https://github.com/nymta/gtfs-documentation)明确其文档补充而不替代GTFS/GTFS-RT标准；[subway GTFS-RT reference](https://api.mta.info/GTFS.pdf)指出VehiclePosition在列车开始移动后才出现，且timestamp可用于判断stalled candidate，因此“无position”不能直接解释为取消。[GTFS Alerts documentation](https://www.mta.info/document/90881)声明feed为GTFS-RT 2.0 FULL_DATASET并有MTA extension、agency/route/stop informed entity与message lineage。

[MTA Open Data Plan](https://www.mta.info/document/85366)说明实时feed主要用于customer information，因数据量通常不发布完整历史，而公开performance metrics是运营数据的aggregate。data.ny.gov的绩效数据必须连同overview/data dictionary、agency/mode、metric definition、month/line population和static/active状态使用；旧KPI名称不能与当前metric自动拼接。当前data-feed terms入口与历史API-key要求存在迁移证据，durable授权前必须重新固定当前协议文本。

### 3.2 TfL Unified API

[Unified API](https://tfl.gov.uk/info-for/open-data-users/unified-api?intcmp=29422)提供current/future status、disruption/planned work、arrival/departure prediction、timetable、stop/facility与multimodal canonical facade；TfL同时提醒来源数据质量和格式不同，实时arrival可在30秒内过期。统一schema不证明上游mode语义或coverage相同。

[step-free topology specification](https://content.tfl.gov.uk/step-free-access-and-toilet-data-guide.pdf)要求将静态station topology与Step-Free Disruptions API组合才能判断当前step-free journey candidate，并明确部分Thameslink、manual boarding ramp和toilet/facility信息可能缺失。[Transport Data Service licence](https://tfl.gov.uk/corporate/terms-and-conditions/transport-data-service)要求注册、`Powered by TfL Open Data`及OS/Geomni attribution、单feed最多500 calls/min、非背书，并禁止对特定网站screen scraping；许可可无通知更新。

### 3.3 MBTA V3 + LAMP

[V3 portal](https://api-v3.mbta.com/)把V3定义为schedule、realtime和alert接口；可无key实验，但正式使用/更高额度需developer account。官方[Swagger](https://api-v3.mbta.com/docs/swagger)公开alerts、predictions、schedules、vehicles、facilities与live facilities等独立resource，不能把facility静态属性与live status压成一个字段。

[MBTA GTFS documentation](https://github.com/mbta/gtfs-documentation/)固定feed version、persistent字段、experimental facilities/pathways和linked realtime datasets，并明确pathways尚未覆盖所有station。[LAMP Public Data](https://performancedata.mbta.com/)保存2009年以来GTFS archive、按service date的subway performance、alerts与Tableau tables，但页面声明仍在early days且可能频繁变化；LAMP输出和V3 current API是不同population/authority。[MassDOT Developers License Agreement](https://github.com/mbta/gtfs-documentation/blob/master/developers-license-agreement.pdf)必须绑定每个materialization。

### 3.4 Transport for NSW

[developer documentation](https://opendata.transport.nsw.gov.au/developers/documentation)和[application guide](https://opendata.transport.nsw.gov.au/blog/devapp)将Complete/Realtime GTFS、Vehicle Positions、Trip Updates、Alerts、Trip Planner和Location Facilities分成独立产品；各mode的GTFS与realtime更新频率不同。[Realtime Alerts v2](https://opendata.transport.nsw.gov.au/data/dataset/public-transport-realtime-alerts-v2)按stop/trip/service line覆盖bus、train、ferry、light rail、metro和coach。

账号默认Bronze plan为60,000 calls/day、5 calls/sec，需要API key且无sandbox；[GTFS implementation specification](https://opendata.transport.nsw.gov.au/sites/default/files/2023-08/TfNSW_GTFS_GTFS-R__Implementation_Specification.pdf)定义本地扩展和positions/trip updates/alerts。GTFS Studio声称提供约九个月历史GTFS-RT，但portal同时显示realtime extract技术告警，必须按实际可用性降级。[Hub Terms](https://opendata.transport.nsw.gov.au/sites/default/files/2024-09/TfNSW-Open-Data-Portal-Terms.pdf)将datasets置于CC BY 4.0并要求attribution/non-endorsement、禁止logo/trademark误用，同时提醒第三方数据可能不完整、不及时或不准确。

## 4. 固定版本 OSS、MCP 与 Skill 审计

以下只做`git ls-remote`和固定SHA静态文件读取，没有clone、install、build或execute：

| 候选 | 固定revision / license | 可借鉴 | 不可晋级原因 |
| --- | --- | --- | --- |
| [MobilityData/gtfs-realtime-bindings@`339b754`](https://github.com/MobilityData/gtfs-realtime-bindings/tree/339b75416196f6988a3cd5599ba33f7762807a48) | Apache-2.0 | 官方维护的protobuf schema/bindings、Go/JS/Python等parse层 | 只解析wire；不提供member identity、freshness、rights、history或语义验证 |
| [MobilityData/gtfs-validator@`21b27a4`](https://github.com/MobilityData/gtfs-validator/tree/21b27a4ac903bc2bc43d42a89bb3dbb47cc8921d) | Apache-2.0 | static GTFS schema/integrity/range规则与JSON report | validator通过不证明实时质量、运营事实、可达性、rights或可比性；会读取URL/file |
| [MobilityData/gtfs-realtime-validator@`7041fa3`](https://github.com/MobilityData/gtfs-realtime-validator/tree/7041fa3fcaf674bf730e17325c179d329cdff6f2) | Apache-2.0 | GTFS-RT rule、batch与feed quality思路 | 运行面含webapp/database/network；规则通过不证明成员coverage或历史完整 |
| [mbta/api@`1b0fc5a`](https://github.com/mbta/api/tree/1b0fc5a499f66b3d8395fa52a8f564123d5cc4d8) | MIT，官方MBTA | JSON:API resource拆分、Swagger、GTFS/RT source mapping | 是完整服务实现且含AWS/账户/部署依赖；只证明MBTA实现，不是通用Connector |
| [mbta/lamp@`e266440`](https://github.com/mbta/lamp/tree/e266440db994ed33eede5e44a137b205e4a1e8dd) | MIT，官方MBTA | archive、performance definition、Parquet lineage与publication pattern | 完整pipeline并含内部S3/Tableau/AWS能力；不能跨agency复用metric或运行 |
| [nymta/gtfs-rt-metrics@`e7e2f46`](https://github.com/nymta/gtfs-rt-metrics/tree/e7e2f460979ff6ed2fb297ec2c0d713bc9526eb0) | repo根未发现LICENSE | feed/entity age、response time/size与route count telemetry | InfluxDB-era collector；无license evidence、member semantics、rights和data minimization |
| [jdamcd/gtfs-mcp@`53226df`](https://github.com/jdamcd/gtfs-mcp/tree/53226df56fd67a70a02343c77fa2fb373fd35247) | MIT，community | system config、feed health、schedule/realtime tool separation | 首次查询会download/cache schedule并持续刷新；暴露nearby/live vehicle等宽工具，无per-member rights/history/accessibility/performance契约 |

没有发现由四个transport authority或MobilityData发布、能同时固定member roster、rights、service-day identity、prediction/actual、facility/accessibility与performance definition的Agent Skill。通用GTFS MCP、Mobility Database/Transitland feed目录、route planner或consumer transit skill只能做候选发现/协议参考，不能提升任何成员到callable。

## 5. 分级验证计划

1. `evidence review`：固定四成员官方schema/process/licence/history/freshness文档和OSS revision；
2. `static contract`：验证schedule/realtime/alert/facility/performance authority、coverage和全部write/effect为零；
3. `fixture conformance`：只用手写synthetic fixtures验证service day、trip identity、prediction→actual、cancellation、alert scope、facility topology/status与metric denominator；
4. `sandbox live`：仅在另行授权账号/key后请求官方metadata或小样本GET；TfNSW没有sandbox，不得用production key冒充sandbox；
5. `operational canary`：freshness、feed partition、schema/extension、ID continuity、rights、retention、correction/delete、rate和人工停机门全部通过后，才讨论durable route。

