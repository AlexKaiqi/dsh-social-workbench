# Canada ECCC AQHI + Air Quality Alerts Platform Pack 设计

状态：`concept + exact-official-route-fixture / architecture-only / no-connector`  
核验日期：2026-08-26  
Member ref：`canada-eccc-aqhi-alerts`

## 1. 价值与成员边界

本Pack覆盖ECCC/MSC AQHI observations、public forecasts、model products与CAP alert messages。其互补价值是提供与“worst pollutant subindex”不同的multi-pollutant relative-health-risk index，并展示observation、forecast、amendment、corrected/backfilled product和public alert生命周期如何保持独立。

## 2. 稳定概念

- AQHI location/community使用CGNDB code；observation station、community、administrative region、forecast area和CAP alert polygon不是同一identity。
- AQHI通常为1–10，极高时为10+，表示hours/days尺度的short-term health risk；formula可随health evidence修订。
- real-time AQHI由未经完整quality verification的observations计算；monthly/corrected/backfilled product与real-time row是不同revision population。
- public forecast通常每天两次发布并带issue time、forecast period和amendment flag；forecast不是observation或alert。
- wildfire smoke期间可进入PM2.5-dominant/special calculation mode；必须保留formula/mode revision，不能与普通multi-pollutant AQHI静默拼接。
- provincial/municipal jurisdictions提供observations并控制公开方式；例如Quebec current AQHI coverage存在官方说明的缺口，不能从AirNow或相邻community补齐。
- Special Air Quality Statement、Air Quality Advisory、CAP message update/ending和AQHI health category是不同record kind。

## 3. 能力与路由

| Capability | Exact product/resource fixture | 设计状态 |
| --- | --- | --- |
| AQHI definition/location schema | MSC AQHI docs + `aqhi-stations`/CGNDB resources | knowledge/schema fixture |
| real-time observation | GeoMet OGC API `aqhi-observations-realtime`、Datamart GeoJSON/CSV | exact route/schema fixture only |
| public forecast/amendment | GeoMet `aqhi-forecasts-realtime`、Datamart GeoJSON/CSV | exact route/schema fixture only |
| corrected/monthly history | Datamart monthly/corrected CSV products | route/schema fixture only |
| model/analysis grids | GeoMet WMS/WCS、RAQDPS/RDAQA products | selected/bulk fixture only |
| official current alerts | GeoMet Current-Alerts + Datamart CAP XML/AMQP | exact route/schema fixture only |
| alert-me/email subscribe、report/contact、publication/admin/write | notification or platform operations | denied |

当前`callable=0 / durable=0`。OGC API collection、Datamart real-time/monthly、WMS model layer、CAP file和alert feature layer分别建route；English/French payload可common-origin关联但不以字符串翻译猜message identity。

## 4. Rights、Snapshot与动态视图

ECCC open data匿名免费；data-server end-use licence要求attribution，并要求weather/alert内容不得改变原意。Snapshot固定AQHI formula/risk/category/special-mode revision、CGNDB/location/region mapping、observation/forecast/correction cadence、amendment semantics、OGC/GeoJSON/CSV/CAP schema、bilingual message relation、coverage exclusion、licence和attribution。

动态视图包括：

- `province-region-community-cgndb-station-forecast-area-alert-polygon-lineage`；
- `realtime-unverified-vs-48h-corrected-vs-monthly-history-revision`；
- `multi-pollutant-aqhi-vs-wildfire-pm25-special-mode`；
- `observation-vs-public-forecast-vs-model-grid-separation`；
- `forecast-issue-period-amendment-and-expiry-lineage`；
- `aqhi-category-vs-special-statement-vs-air-quality-advisory-gap`；
- `cap-issue-update-ending-bilingual-message-integrity`；
- `published-region-community-coverage-and-quebec-gap`。

观测重点：observation latency、missing pollutant、corrected delta、forecast amendment count、model run/lead age、special-mode transition、CAP issue/update/end lineage、bilingual mismatch、coverage gap、licence attribution和effect count。

## 5. 合成验证与拒绝规则

Fixture至少覆盖：real-time unverified value later corrected；forecast amended twice；same community code across bilingual payload；ordinary AQHI and wildfire PM2.5 special mode；AQHI 7–10 category without issued statement；AQHI 10+ duration trigger without CAP advisory；CAP update then ending；Quebec observation absent by policy；station and community coordinates differ。

必须拒绝：AQHI→individual health outcome、real-time→verified、community→station measurement、forecast/model→observation、threshold→issued CAP alert、alert ending→zero pollution、AirNow→Quebec fallback、translated text→new alert identity、licence→message alteration，以及任何真实AQHI/forecast/CAP item或subscription。

## 6. 官方依据与开源候选

- [AQHI overview](https://eccc-msc.github.io/open-data/msc-data/aqhi/readme_aqhi_en/)、[OGC observations collection](https://api.weather.gc.ca/collections/aqhi-observations-realtime?f=html)、[OGC API usage](https://eccc-msc.github.io/open-data/msc-geomet/ogc_api_en/)
- [AQHI GeoJSON spec](https://eccc-msc.github.io/open-data/msc-data/aqhi/readme_aqhi-datamartjson_en/)、[CSV/history spec](https://eccc-msc.github.io/open-data/msc-data/aqhi/readme_aqhi-datamartcsv_en/)
- [CAP alerts](https://eccc-msc.github.io/open-data/msc-data/alerts/readme_alerts-datamart_en/)、[GeoMet alerts](https://eccc-msc.github.io/open-data/msc-data/alerts/readme_alerts-geomet_en/)、[Air Quality Advisory policy announcement](https://www.canada.ca/en/environment-climate-change/news/2024/06/new-public-alert-makes-it-easier-to-understand-air-quality-conditions-during-wildfire-events-and-year-round.html)
- [ECCC data-server licence](https://eccc-msc.github.io/open-data/licence/readme_en/)
- 静态参考：[ECCC-MSC/msc-pygeoapi@0ff9dc4](https://github.com/ECCC-MSC/msc-pygeoapi/tree/0ff9dc4567fdf3d61e2c722f6f9d3cb2d4a695af)、[env_canada@ebf17f2](https://github.com/michaeldavie/env_canada/tree/ebf17f296c6ea315b86cc867185a6043404565c1)；均未安装或执行。
