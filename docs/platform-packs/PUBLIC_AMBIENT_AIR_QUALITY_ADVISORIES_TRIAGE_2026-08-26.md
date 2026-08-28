# 公共环境空气质量、健康警报与污染事件平台分流（2026-08-26）

状态：`researched / architecture-only / no-connector`  
核验日期：2026-08-26

## 1. 第一性原理结论

这条Channel回答：`哪个network/station/monitor以什么method、unit、period和spatial representativeness报告哪种pollutant observation → 数据是raw、screened、preliminary、corrected、validated、modelled还是gap-filled → 哪版index definition如何用breakpoint、formula、pollutant coverage和averaging rule形成subindex/overall category → 哪个forecast/model run对什么area和valid window有效 → 哪个episode及其cause attribution处于reported/modelled/confirmed何种状态 → 谁对什么scope和audience发布、更新或结束哪种statement/advisory/alert/health guidance → 哪个legal standard/objective在什么assessment period、completeness rule和zone下由authority认定`。

以下事实不可互相升级：station observation≠postcode、reporting area或个人暴露；同单位浓度≠method、period和quality可比；preliminary≠validated；model、downscale、interpolation和gap-fill≠measurement；一个pollutant subindex≠完整overall index；US AQI、UK DAQI、European AQI与Canada AQHI数值/类别≠跨体系直接可比；current/NowCast≠daily historical value；forecast≠observation或issued advisory；trigger match≠issuer已发布alert；high index≠legal exceedance/nonattainment；episode≠cause confirmed；health recommendation≠诊断、实际exposure或harm证明；alert ended/expired≠污染已完全消失；hours、stations、areas、people、episodes、forecasts和alerts不是同一分母。

## 2. 首批成员与成熟度

| Member | 互补价值 | 当前成熟度 |
| --- | --- | --- |
| US EPA AirNow + AQS/AirData | preliminary real-time/forecast/AQI与delayed quality-assured regulatory archive明确分离；reporting area、NowCast、Action Day和AQS QA | concept + exact official API/file/OpenAPI fixture + selected/manual |
| UK Defra UK-AIR / Check air quality / Get air pollution data | AURN provisional→ratified生命周期、DAQI 1–10及health advice、5-day forecast、2026服务迁移 | concept + exact official CSV/Atom/XML route fixture + selected/manual |
| EEA European Air Quality Index + Air Quality Download Service | E1a validated与E2a UTD分流、Parquet/OGC download、station/model gap-fill与index completeness | concept + exact official API/Parquet/OGC fixture + selected/manual |
| Canada ECCC MSC AQHI + CAP alerts | AQHI 1–10+短期健康风险、observation/forecast/amendment、GeoMet OGC API、Datamart/AMQP、CAP alert | concept + exact official OGC/GeoJSON/CSV/CAP fixture + selected/manual |

requested=4、concept-fixture=4、exact official machine/bulk route-fixture=4、official index/methodology fixture=4、official alert/advisory machine-route fixture=2、selected/manual=4、callable=0、durable-approved=0。machine route fixture只证明官方文档中的route/schema/product存在，不证明已获准读取、完整覆盖、当前可用或可以长期物化。

本轮只读取官方说明、dataset/API metadata、固定Git revision和静态文本；没有请求station、observation、concentration、index、forecast、event、advisory或alert数据行，没有注册API key、安装或执行第三方项目，也没有订阅警报、发布健康信息、联系authority或产生平台副作用。

## 3. 官方资料与平台边界

### US EPA AirNow + AQS/AirData

[AirNow API](https://docs.airnowapi.org/)明确其observation为preliminary、subject to change，只用于AQI reporting/forecasting，不得替代AQS regulatory data；[Data Use Guidelines](https://docs.airnowapi.org/docs/DataUseGuidelines.pdf)要求保留来源、preliminary标识，并且forecast/advisory原文不得被改写。[Web Services](https://docs.airnowapi.org/webservices)区分current/historical forecast、reporting-area observation、monitoring-site observation和contour products，同时列出fall 2026退休接口；[FAQ](https://docs.airnowapi.org/faq)说明reporting-area current observation是area内stations所报最大AQI，zip只是agency配置的area关联，批量数据库应使用file products而非循环zip API。

[AQS API](https://aqs.epa.gov/aqsweb/documents/data_api.html)是row-level regulatory archive入口，包含sample、daily/annual summary、monitor、method和QA等服务并需要key；它不提供real-time data，可能从采集到入库延迟六个月以上。[About AQS Data](https://aqs.epa.gov/aqsweb/documents/about_aqs_data.html)还说明提交者可在法定deadline后增删改旧数据，因此validated/history也必须保留revision lineage。AirNow与AQS是同一member下两个不可fallback互换的product。

### UK Defra

[AURN guidance](https://www.gov.uk/guidance/air-pollution-monitoring-automatic-urban-and-rural-network-aurn)说明hourly provisional data带`unverified`标记，经过自动筛查、季度人工QA/QC和独立audit后，前一calendar year通常在6月1日前ratified；verified data之后仍可能因audit或新研究修改。[DAQI](https://uk-air.defra.gov.uk/air-pollution/daqi)是1–10、四band的短期health communication index，overall取五种pollutant中最高等级，但各pollutant使用不同averaging period；[forecast meaning](https://uk-air.defra.gov.uk/forecasting/what-forecasts-mean)明确5-day forecast越远越不确定，background location也可能漏掉roadside高值。

UK-AIR在2026年迁移到[Check air quality](https://check-air-quality.service.gov.uk/)和[Get air pollution data](https://get-air-pollution-data.defra.gov.uk/)；旧站仍提供[Data Archive](https://uk-air.defra.gov.uk/data/)、per-site CSV与[Atom Download Services](https://uk-air.defra.gov.uk/data/atom-dls/)。这些route按exact resource独立建模；旧UI、new UI、CSV、Atom/XML和alert页面之间不得静默fallback。Defra资料一般按OGL v3.0，但postcode、OS、Northern Ireland或第三方地理材料可能有额外rights。

### EEA

[Air Quality Download Service](https://www.eea.europa.eu/en/datahub/datahubitem-view/778ef9f5-6293-4846-badd-56a29c70880d)提供2013年至今measurement time series的API与zipped Parquet；官方metadata区分E1a annual validated data和E2a up-to-date/unverified data。[European Air Quality Index](https://airindex.eea.europa.eu/AQI/?webgl=0)用最多五种pollutant的hourly concentration并取poorest level；station layer的UTD空缺可能由CAMS downscaled forecast补齐，minimum pollutant coverage不足或forecast/gap-filled值用不同透明度表示。它用于recent public information，不等同annual legal compliance。

[EEA legal notice](https://www.eea.europa.eu/en/legal-notice)一般允许CC-BY再利用并要求来源与原意不被扭曲；[EEA data policy](https://www.eea.europa.eu/en/datahub/eea-data-policy)同时提醒third-party datasets可有单独条件，具体dataset metadata优先。因此member级“open”不能覆盖resource-level licence和attribution。

### Canada ECCC MSC

[AQHI OGC API collection](https://api.weather.gc.ca/collections/aqhi-observations-realtime?f=html)提供schema/queryables/GeoJSON，明确AQHI为1–10或10+的短期健康风险指数，实时observation未经验证。[AQHI documentation](https://eccc-msc.github.io/open-data/msc-data/aqhi/readme_aqhi_en/)与[GeoJSON/Datamart spec](https://eccc-msc.github.io/open-data/msc-data/aqhi/readme_aqhi-datamartjson_en/)区分hourly observations、twice-daily forecasts、region/CGNDB community identity和amendment；Quebec等coverage不能由相邻产品补齐。[CSV spec](https://eccc-msc.github.io/open-data/msc-data/aqhi/readme_aqhi-datamartcsv_en/)还区分real-time、48-hour corrected/backfilled与monthly products。

[CAP alert documentation](https://eccc-msc.github.io/open-data/msc-data/alerts/readme_alerts-datamart_en/)是alert message machine route；[2024 Air Quality Advisory announcement](https://www.canada.ca/en/environment-climate-change/news/2024/06/new-public-alert-makes-it-easier-to-understand-air-quality-conditions-during-wildfire-events-and-year-round.html)区分AQHI 7–10的Special Air Quality Statement与wildfire smoke期间AQHI 10+持续三小时以上的Air Quality Advisory。ECCC data-server licence要求alert内容与意图不得被扭曲，故alert原文、issuer、message lifecycle和derived summary必须分开。

## 4. OSS、Agent Skill与MCP静态审计

| Artifact | fixed revision / licence | 可借鉴 | 结论 |
| --- | --- | --- | --- |
| [USEPA RAQSAPI](https://github.com/USEPA/RAQSAPI/tree/c727ff390bcac90b14a939a05af80e0059068561) | `c727ff3…` / MIT / official USEPA org | AQS service families、header/status retention、one-year query split、throttle、keyring建议 | 是R client且只覆盖AQS，不处理AirNow/index/advisory双产品语义；API/key仍需逐route批准；仅作参考，不执行 |
| [cyanheads EPA MCP](https://github.com/cyanheads/epa-mcp-server/tree/2cb57664319e77994604453e690834ddee3a1063) | `2cb5766…` / Apache-2.0 / community | typed output、cache、partial failure、OTel | `epa_get_air_quality`把current/forecast压成单工具，缺AQS、method/quality/revision、reporting-area aggregation、issuer-message和rights gates；拒绝安装/调用 |
| [ECCC-MSC msc-pygeoapi](https://github.com/ECCC-MSC/msc-pygeoapi/tree/0ff9dc4567fdf3d61e2c722f6f9d3cb2d4a695af) | `0ff9dc4…` / MIT / official MSC org | OGC collection/schema/paging、bilingual deployment与operational configuration | 是官方server deployment/config，不是bounded client或Agent Skill；依赖pygeoapi/Elasticsearch，且不提供AQHI/index/alert语义门；不执行 |
| [env_canada](https://github.com/michaeldavie/env_canada/tree/ebf17f296c6ea315b86cc867185a6043404565c1) | `ebf17f2…` / MIT / community | async AQHI current/forecast、GeoMet alert categories、timestamped route migration处理 | coordinate-nearest selection、weather/AQHI/alert聚合会隐藏product/authority/coverage差异；无definition revision、quality/compliance/rights/drop；拒绝安装/调用 |
| [Google Maps Platform Agent Skill](https://github.com/googlemaps/agent-skills/tree/84f0e9a2527403a408a61b8705bea0c3900b76a8/skills/google-maps-platform) | `84f0e9a…` / Apache-2.0 / official Google org | fresh-doc grounding、key restriction、ToS/cost提醒 | 面向Google commercial Air Quality API并要求dynamic docs/MCP/key，不是四个official member的数据authority；不得用作source fallback或成熟度证明；不安装 |
| [EEA GeoNetwork MCP](https://github.com/seb999/EEA_sdi_mcp/tree/12fa0c3e366b061ebbb6d8b7254e3db8fc14e2b9) | `12fa0c3…` / package声明MIT但仓库无显式LICENSE文件 / community | catalogue search、metadata relation与formatter discovery | 暴露duplicate/update/tag/upload/delete等write工具，且只到GeoNetwork metadata，未覆盖AQ download/index语义；许可证据不足；拒绝安装/调用 |

未发现四个平台运营方正式发布、同时满足exact product/deployment、observation-quality-index-forecast-alert-compliance分层、message integrity、privacy/security/rights、field-drop和zero-effects的通用Agent Skill或MCP；结论为`discovery-incomplete`。

## 5. Probe结论

本Channel没有平台Probe。station/sensor registration、data submission、incident/smoke report、forecast/advisory/alert issue-update-end、public message、subscription、contact、complaint、API-key signup、admin/write及MCP write都可能触发数据治理、公共卫生、紧急信息、费用、通知或资源副作用。主动需求测试只能走系统自有landing page、问卷或实验Channel。
