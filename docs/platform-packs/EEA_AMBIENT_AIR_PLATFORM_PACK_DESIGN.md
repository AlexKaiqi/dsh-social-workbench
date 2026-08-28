# EEA European Ambient Air Quality Platform Pack 设计

状态：`concept + exact-official-route-fixture / architecture-only / no-connector`  
核验日期：2026-08-26  
Member ref：`eea-european-ambient-air`

## 1. 价值与成员边界

本Pack覆盖EEA Air Quality Download Service、AQ e-Reporting E1a/E2a、station spatial services、European Air Quality Index和CAMS补洞/forecast层。价值在于把跨国家harmonisation与真实来源差异同时保留：EEA统一了schema和公共index，但member country仍是measurement provider，UTD、validated、modelled和gap-filled数据不具有相同authority。

## 2. 稳定概念

- `country/reporting authority`、`network`、`station`、`sampling point`、`assessment regime`、`zone/agglomeration`和`pollutant`是独立identity。
- E1a是annual primary validated assessment data；E2a/UTD为near-real-time、未由country正式验证的数据，二者不能last-write-wins合并。
- European AQI使用PM2.5、PM10、NO2、O3、SO2最多五种pollutant的hourly concentration并取poorest subindex。
- station type影响minimum pollutant coverage；minimum不满足时仍可能显示partial/high-pollutant signal，但不能称完整overall station index。
- station UTD gap可能以CAMS downscaled forecast补齐；UI透明度/asterisk是provenance，不是装饰字段。
- station layer、1×1km modelled grid、verified annual statistics与legal compliance assessment分别是不同population和production kind。

## 3. 能力与路由

| Capability | Exact product/resource fixture | 设计状态 |
| --- | --- | --- |
| dataset/catalogue definition | EEA Datahub/GeoNetwork metadata | knowledge fixture |
| verified + UTD time series | Air Quality Download Service API、zipped Parquet | exact route/schema fixture only |
| station spatial metadata/statistics | OGC WMS/WFS、ArcGIS REST station service | exact route fixture only |
| European AQI current station/grid | official index viewer/methodology | definition + selected/manual fixture |
| modelled/interpolated products | CAMS-linked index/grid and Datahub products | selected/bulk fixture only |
| annual legal statistics/compliance | EEA statistics/status resources | selected/manual fixture only |
| national data fallback、catalogue edit/upload/delete、profile/subscription/write | federated or mutation operations | denied |

当前`callable=0 / durable=0`。GeoNetwork catalogue discovery、download API、Parquet object、ArcGIS/OGC station service和index viewer是不同route；catalogue metadata成功不能证明download成功，UTD缺口不得静默改查national portal或model grid。

## 4. Rights、Snapshot与动态视图

EEA自有材料一般CC-BY，需acknowledge source且不得扭曲原意；third-party/member-country data按dataset metadata和data policy保留额外conditions。Snapshot固定E1a/E2a dataflow、country/network/station identity、schema/Parquet/OGC digest、index methodology revision、CAMS dependency、minimum coverage、license/attribution和third-party rights。

动态视图包括：

- `country-network-station-sampling-point-assessment-zone-lineage`；
- `e1a-validated-vs-e2a-utd-quality-publication-and-correction-history`；
- `station-hourly-observed-vs-cams-downscaled-gap-fill-provenance`；
- `traffic-vs-industrial-background-minimum-pollutant-completeness`；
- `pollutant-subindex-to-poorest-overall-index-and-partial-display-audit`；
- `station-layer-vs-model-grid-vs-annual-statistics-population-separation`；
- `catalogue-to-download-object-schema-and-rights-lineage`。

观测重点：country reporting freshness、E1a/E2a revision、Parquet schema/partition、station identifier drift、missing pollutants、gap-fill fraction、CAMS run age、index band revision、catalogue/download disagreement、third-party licence和effect count。

## 5. 合成验证与拒绝规则

Fixture至少覆盖：同一station的E2a preliminary和次年E1a corrected/validated值；missing pollutant由CAMS gap-fill；minimum coverage不足但单pollutant poor；traffic与background completeness rule不同；station和grid相同坐标但production不同；catalogue record存在而download object缺失；member-country third-party rights覆盖EEA默认license。

必须拒绝：UTD→validated、gap-fill→measurement、partial→complete index、station→grid或city exposure、index→annual legal compliance、catalogue→data availability、EEA default CC-BY→third-party unconditional reuse、community MCP write工具，以及任何真实time-series/index/grid row。

## 6. 官方依据与开源候选

- [Air Quality Download Service](https://www.eea.europa.eu/en/datahub/datahubitem-view/778ef9f5-6293-4846-badd-56a29c70880d)、[service metadata](https://sdi.eea.europa.eu/catalogue/datahub/api/records/fe809728-9cec-41c0-a9be-3a8f04600974/formatters/xsl-view?approved=true&language=eng&output=pdf)
- [European Air Quality Index methodology](https://airindex.eea.europa.eu/AQI/?webgl=0)、[EEA data access FAQ](https://www.eea.europa.eu/en/about/contact-us/faqs/where-can-i-access-the-latest-air-quality-data-in-europe)
- [Station spatial service](https://air.discomap.eea.europa.eu/arcgis/rest/services/AirQuality/AirQualityDownloadServiceEUMonitoringStations/MapServer)
- [Legal notice](https://www.eea.europa.eu/en/legal-notice)、[EEA data policy](https://www.eea.europa.eu/en/datahub/eea-data-policy)
- 静态参考：[EEA GeoNetwork MCP@12fa0c3](https://github.com/seb999/EEA_sdi_mcp/tree/12fa0c3e366b061ebbb6d8b7254e3db8fc14e2b9)；其write surface和许可证据不满足本Pack，未安装或执行。
