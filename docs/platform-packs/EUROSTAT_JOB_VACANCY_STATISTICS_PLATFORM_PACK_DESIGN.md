# Eurostat Job Vacancy Statistics Platform Pack

## 1. 概念与能力

`eurostat-job-vacancy-statistics`描述Eurostat JVS aggregate dissemination，不代表成员国相同survey implementation或逐条欧盟职位。稳定概念是paid vacant post、occupied post、enterprise/local unit、active outside recruitment、intended fill、job vacancy rate、NACE/size/country、recording time、SA/NSA、flash/final、imputation、CV、status与revision。

JVR固定为`vacant posts / (occupied posts + vacant posts) × 100`；quarter-on-quarter/year-on-year change是percentage points。各国季度stock可能记录一个specific date或三个月average，population/size/public-sector coverage也可能不同。

## 2. 接入、成熟度与访问

当前`callable=0 / durable=0`。exact Statistics API为`https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/{datasetCode}`，核心dataset为当前NACE Rev. 2.1季度产品`jvs_q_r21`；SDMX 3.0用于DSD/codelist。每次fixture必须重新确认dataset、DSD、unit、geo、NACE、size、time、adjustment与status，不能只按旧`jvs_q_nace2`或文章label晋级。

Statistics API只提供latest observation；historical revisions必须由本系统snapshot。flash aggregate可能impute missing countries，final/country observations与flash不能覆盖合并。

## 3. Snapshot、字段与权利

Dolt/Git保存JVS regulation/method、country population/recording-time/quality refs、dataset/DSD/codelist/DOI、NACE revision、vacant/occupied/rate definition、SA/NSA/direct aggregate adjustment、flash/final/imputation/status/revision、reuse/access date与fixed OSS/MCP revision。分析库未来只接批准aggregate observations，不保存national respondent microdata。

Eurostat statistical data/metadata通常可在attribution与access date下复用；修改、third-party content和non-EU/EFTA/candidate country exception需检查。

## 4. 动态视图、可观测性与fixture

动态视图：`paid-vacant-vs-occupied-post`、`enterprise-vs-local-unit`、`country-reference-date-vs-period-average`、`vacancy-occupied-denominator-and-JVR`、`rate-vs-percentage-point-change`、`NACE-revision-and-country-coverage`、`country-SA-vs-direct-EU-aggregate-SA`、`flash-imputed-vs-final`与`status-CV-revision-lineage`。

Telemetry逐`API/version × dataset/DSD/DOI × unit/geo/NACE/size/time/adjustment/status × country/EU/EA × vacancy/occupied/rate/change × reference-date/average × SA/NSA/direct × flash/final/imputed × CV/coverage/break/revision × reuse`记录dimension decode、requested/returned/null/flagged、unknown category、population mismatch、country omission、rate denominator rejection、revision与zero effects。

Synthetic至少覆盖：vacancy不当posting；occupied post不当person；rate不当level；percentage point不当percent；country date不当quarter average；harmonised definition不当identical collection；EU aggregate不当unweighted mean；country SA sum不当direct EU SA；flash/imputed不当final; null/flag不当zero。

## 5. 不可推断与官方资料

必须拒绝：JVS vacancy→advertised job、active recruitment→hire、occupied post→employment person、JVR→unemployment rate、same NACE label→same population、EU aggregate→country fact、flash→complete member transmission、API latest→revision history、generic Eurostat MCP→JVS semantics complete。

- [JVS metadata](https://ec.europa.eu/eurostat/cache/metadata/en/jvs_esms.htm)
- [`jvs_q_r21` dataset](https://ec.europa.eu/eurostat/databrowser/view/jvs_q_r21/default/table?lang=en)
- [Job vacancies information](https://ec.europa.eu/eurostat/web/labour-market/information-data/job-vacancies)
- [Statistics and SDMX APIs](https://ec.europa.eu/eurostat/web/user-guides/data-browser/api-data-access/api-getting-started)
- [Eurostat copyright and reuse](https://ec.europa.eu/eurostat/help/copyright-notice)

