# US EPA AirNow + AQS/AirData Platform Pack 设计

状态：`concept + exact-official-route-fixture / architecture-only / no-connector`  
核验日期：2026-08-26  
Member ref：`us-epa-airnow-aqs`

## 1. 价值与成员边界

本Pack把同一EPA生态中的两种不可互换产品保持在一个member下：AirNow用于及时AQI、current/NowCast、forecast、Action Day/advisory communication；AQS/AirData用于monitor/sample/method/QA、daily/annual aggregate和regulatory analysis。价值在于同时发现“及时但preliminary”与“可信但延迟”的用户痛点，而不是让Connector用一个product静默填补另一个product。

```text
contributing agency -> AirNow observation/forecast -> reporting area AQI/action message
monitoring agency   -> AQS monitor/sample/method/QA -> regulatory aggregate/assessment input

AirNow preliminary != AQS quality-assured
reporting-area maximum != requested ZIP point
NowCast != daily AQI != raw concentration
```

## 2. 稳定概念

- `station/site`、`monitor`、`parameter`、`method`和`sample`是AQS的独立identity；state/county/site/parameter/POC等key不能被display name替代。
- AirNow `reporting area`由air agency定义，ZIP/lat-long查询映射到reporting area；area observation可能是多个station的最大AQI，不是该坐标实测。
- AirNow observation为preliminary；AQS并非实时，入库可延迟六个月以上，历史记录仍可被提交者修订。
- US daily AQI、NowCast AQI、pollutant concentration、forecast AQI和Action Day/advisory是不同record kind。
- forecast和advisory的authority属于发布它们的federal/state/local/tribal agency；API aggregator不是自动issuer。
- AQI breakpoint与NAAQS legal compliance calculation不能合并；AQI 100附近的公共沟通含义不等于对完整法定period、completeness和design value的合规认定。

## 3. 能力与路由

| Capability | Exact product/resource fixture | 设计状态 |
| --- | --- | --- |
| definition/index/methodology | AirNow AQI/NowCast docs + AQS data docs | knowledge fixture |
| current/forecast by reporting area/location | AirNow Web Services；旧ZIP/lat-long接口fall 2026 retirement alert | route fixture only |
| area/file/bulk current and forecast | `reportingarea.dat`、hourly/daily files、GRIB2/file products | route/schema fixture only |
| monitoring-site observation | AirNow monitoring-site query/file products | route fixture only |
| regulatory sample/summary/monitor/method/QA | AQS API v2/OpenAPI and AirData pre-generated files | route/schema fixture only |
| Action Day/advisory/feed | AirNow RSS/data feeds and source agency attribution | selected/feed fixture only |
| API signup/key | AirNow/AQS account services | denied until explicit credential approval |
| data submission、forecast/advisory mutation、contact/admin/write | platform operations | denied |

当前`callable=0 / durable=0`。`airnow`、`aqs`、`airdata`分别是product ref；任何fallback必须显式失败并记录，不得把AQS lag当AirNow outage，也不得把AirNow current值填入regulatory history。

## 4. Snapshot、动态视图与可观测性

Snapshot固定API/file product、schema/OpenAPI digest、AQI/NowCast revision、reporting-area/ZIP mapping policy、data-use guideline、contributing authority、quality/lag、rate/caching guidance、retirement notice和rights。动态视图包括：

- `airnow-reporting-area-station-and-zip-assignment-lineage`；
- `airnow-preliminary-current-nowcast-daily-forecast-action-day-separation`；
- `airnow-to-aqs-same-monitor-candidate-without-quality-upgrade`；
- `aqs-site-monitor-parameter-poc-method-sample-qa-lineage`；
- `raw-sample-daily-annual-design-value-and-compliance-gap`；
- `retiring-web-service-to-file-product-or-new-service-migration-readiness`。

观测按product/resource、agency/reporting area/site/monitor/parameter、method/unit/period、preliminary/validated、API/file、request scope、cache age、publication lag、revision、retirement date、attribution、data-use compliance、drop/quarantine和effect count分维。重点告警：旧接口距退休窗口、AirNow值被标成regulatory、AQS被误当real-time、reporting-area maximum被标成point observation、advisory text被改写、API key进入普通日志。

## 5. 合成验证与拒绝规则

Fixture至少覆盖：多个station汇成一个reporting-area maximum；相同station的AirNow preliminary与AQS late validated revisions；NowCast与daily averaging不同；forecast只给category而无number；retired route；AQS historical correction；missing method/POC；Action Day issuer与API publisher不同。

必须拒绝：ZIP query→ZIP measurement、AirNow→validated/regulatory、AQS→current、AQI→NAAQS violation、forecast→issued alert、API publisher→local issuer、`latest`→history overwrite、community MCP→approved Connector，以及任何真实observation/forecast/advisory row或credential probe。

## 6. 官方依据与开源候选

- [AirNow API](https://docs.airnowapi.org/)、[Web Services](https://docs.airnowapi.org/webservices)、[FAQ](https://docs.airnowapi.org/faq)、[Data Use Guidelines](https://docs.airnowapi.org/docs/DataUseGuidelines.pdf)
- [Using the AQI](https://www.airnow.gov/aqi/aqi-basics/using-air-quality-index/)、[2026 AQI technical assistance](https://www.airnow.gov/publications/air-quality-index/technical-assistance-document-for-reporting-the-daily-aqi/)
- [AQS API v2](https://aqs.epa.gov/aqsweb/documents/data_api.html)、[About AQS Data](https://aqs.epa.gov/aqsweb/documents/about_aqs_data.html)
- 静态参考：[USEPA/RAQSAPI@c727ff3](https://github.com/USEPA/RAQSAPI/tree/c727ff390bcac90b14a939a05af80e0059068561)、[cyanheads/epa-mcp-server@2cb5766](https://github.com/cyanheads/epa-mcp-server/tree/2cb57664319e77994604453e690834ddee3a1063)；均未安装或执行。
