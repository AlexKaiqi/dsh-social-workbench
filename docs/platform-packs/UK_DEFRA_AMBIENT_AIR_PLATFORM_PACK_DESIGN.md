# UK Defra Ambient Air Quality Platform Pack 设计

状态：`concept + exact-official-route-fixture / architecture-only / no-connector`  
核验日期：2026-08-26  
Member ref：`uk-defra-ambient-air`

## 1. 价值与成员边界

本Pack覆盖UK-AIR旧服务、2026迁移中的Check air quality / Get air pollution data、AURN monitoring、DAQI、forecast和public alert surface。它的核心价值是验证同一network数据的`hourly provisional → QA/QC → ratified → later correction`生命周期，以及防止DAQI的短期health communication被误当长期安全阈值或法定compliance结果。

## 2. 稳定概念

- `network`、`station`、`site type`、`monitoring method`、`pollutant`、`hourly/daily sample`和`assessment zone/agglomeration`是不同identity。
- AURN site context包括urban/rural background、traffic和industrial等；background forecast/location不能代表busy roadside。
- provisional data每小时发布并标为unverified；ratified通常在次年6月1日前完成，verified之后仍可能修改。
- DAQI为1–10、Low/Moderate/High/Very High，overall由五种pollutant最高等级决定；pollutant-specific concentration boundary与averaging time必须绑定revision。
- DAQI只沟通短期health risk，不是“safe threshold”，也不代表长期exposure风险或个人诊断。
- current measurement、retrospective daily DAQI、5-day forecast、alert和annual compliance assessment不能互换。

## 3. 能力与路由

| Capability | Exact product/resource fixture | 设计状态 |
| --- | --- | --- |
| network/station/method/QA definition | AURN guidance、UK-AIR network/site metadata | knowledge fixture |
| provisional/ratified measured data | Get air pollution data、UK-AIR Data Selector/per-site CSV | route fixture only |
| large-volume/e-reporting data | UK-AIR Atom Download Services/XML/spatial object register | exact route/schema fixture only |
| DAQI definition/concentration/health advice | GOV.UK/UK-AIR DAQI documents | knowledge fixture |
| current/forecast/alert | Check air quality and UK-AIR forecast surfaces | selected/manual fixture only |
| annual compliance/modelled data | UK-AIR compliance/data archive resources | selected/bulk fixture only |
| email alert subscription、data upload、contact/admin/write | user/platform operations | denied |

当前`callable=0 / durable=0`。新旧服务、Data Selector、flat CSV、Atom/XML、spatial register和public alert UI分别建route；迁移期间一个route缺失不能由HTML robot或旧undocumented endpoint补绿。

## 4. Rights、Snapshot与动态视图

Defra/UK-AIR资料一般为OGL v3.0并要求attribution；postcode、Ordnance Survey、Northern Ireland和third-party material按resource metadata单独治理。Snapshot保存network/site/method、DAQI revision、provisional/ratified process、route migration、schema/feed digest、attribution和third-party rights。

动态视图包括：

- `aurn-network-station-site-context-monitor-method-pollutant-lineage`；
- `hourly-provisional-screened-quarterly-reviewed-ratified-corrected-history`；
- `daqI-pollutant-breakpoint-averaging-overall-worst-pollutant-completeness`；
- `current-retrospective-daily-vs-five-day-forecast-separation`；
- `background-location-vs-roadside-representativeness-gap`；
- `uk-air-old-route-to-new-service-resource-migration-and-coverage`；
- `ogl-vs-os-ni-third-party-rights-attribution-audit`。

观测重点：station inactive/fault、unverified→verified lag、post-ratification change、method or scale revision、DAQI threshold drift、forecast age/lead、new-service network coverage、old-route retirement、rights mismatch和effect count。

## 5. 合成验证与拒绝规则

Fixture至少覆盖：provisional value later corrected then ratified；ratified value later amended；urban background与roadside station同pollutant不可替代；PM 24-hour running mean与O3 8-hour basis；overall DAQI取worst pollutant；forecast越期；新服务暂缺某network而旧Atom仍有；postcode-derived material带额外rights。

必须拒绝：unverified→verified、station→local population exposure、DAQI→legal exceedance或long-term safety、forecast→alert、old/new route silent fallback、OGL member-level assumption→third-party geometry reuse、subscription/contact/data-upload，以及任何真实station/value/forecast/alert row。

## 6. 官方依据

- [AURN monitoring and QA](https://www.gov.uk/guidance/air-pollution-monitoring-automatic-urban-and-rural-network-aurn)
- [DAQI](https://uk-air.defra.gov.uk/air-pollution/daqi)、[pollutant concentrations](https://www.gov.uk/government/publications/health-effects-of-air-pollution/pollutant-concentrations-for-the-daily-air-quality-index-daqi)、[forecast meaning](https://uk-air.defra.gov.uk/forecasting/what-forecasts-mean)
- [Get air pollution data](https://get-air-pollution-data.defra.gov.uk/)、[Check air quality](https://check-air-quality.service.gov.uk/)、[Data Archive](https://uk-air.defra.gov.uk/data/)、[Atom downloads](https://uk-air.defra.gov.uk/data/atom-dls/)
- [UK-AIR licensing](https://uk-air.defra.gov.uk/about-these-pages)、[mapping licence exceptions](https://uk-air.defra.gov.uk/data/gis-licences)
