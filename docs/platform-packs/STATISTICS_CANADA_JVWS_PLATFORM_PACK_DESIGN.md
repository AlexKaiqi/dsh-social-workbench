# Statistics Canada Job Vacancy and Wage Survey Platform Pack

## 1. 概念与能力

`statistics-canada-jvws`只描述Job Vacancy and Wage Survey及其public aggregates，不代表全部Canada jobs、employers或actual wages。稳定概念是business location population、first-day/upcoming-month vacancy、payroll employee、labour demand、vacancy rate、monthly/quarterly estimate、NAICS/NOC/SGC、offered wage、duration/education/experience/position/work type/recruitment strategy、quality A–F、suppression与revision。

vacancy要求reference date为空或当月将空、当月有tasks且employer active recruiting outside。quarterly vacancies/payroll employees是三个月distinct positions/counts，不是monthly weighted average。rate denominator是payroll employees+vacancies。

## 2. 接入、成熟度与访问

当前`callable=0 / durable=0`。[WDS User Guide](https://www.statcan.gc.ca/en/developers/wds/user-guide)提供metadata/vector/change/full-table CSV/SDMX routes；fixture PIDs固定14100398、14100399、14100400、14100441、14100442、14100443与14100444，并必须保存table/PID、coordinate/vector、symbol/status/scalar、release time、classification和correction。

monthly/quarterly、SA/NSA、geography/industry/occupation与characteristic products分别晋级。generic WDS/SDMX client或full-table download成功不证明JVWS semantic conformance。

## 3. Snapshot、字段与权利

Dolt/Git保存program/population/location unit、definition、sample/calibration、PID/table/DOI/coordinate/vector/schema、monthly/quarter timing、SA/NSA、vacancy/payroll/rate、offered-wage conversion/components、NAICS/NOC/SGC revision、quality/symbol/status/suppression、correction/reclassification与Open Licence attribution。分析库未来只接批准aggregate cells，不保存respondent location/name/contact或restricted microdata。

Open Licence要求exact source/adaptation notice、no endorsement/no misrepresentation，并禁止以linkage尝试识别person/business/organization。

## 4. 动态视图、可观测性与fixture

动态视图：`business-location-population-and-exclusion`、`first-day-or-upcoming-month-vacancy`、`monthly-one-third-sample-vs-quarter-distinct-positions`、`vacancy-payroll-labour-demand-rate`、`SA-vs-NSA`、`offered-lower-bound-converted-vs-actual-paid-wage`、`NOC-NAICS-SGC-revision`、`duration-education-experience-position-work-strategy`、`quality-A-F-symbol-status-suppression`与`PID-correction-reclassification-lineage`。

Telemetry逐`WDS/SDMX × PID/table/DOI/coordinate/vector × geography/NAICS/NOC/SGC × monthly/quarterly × vacancy/payroll/rate/wage/characteristic × SA/NSA × first-day/quarter-distinct × quality/CV/symbol/status/suppression × release/correction/licence`记录requested/returned/dropped、unknown member/symbol/status、schema/PID drift、classification revision、offered-paid rejection、period mismatch、licence rejection与zero effects。

Synthetic至少覆盖：location不当enterprise/person；upcoming-month vacancy不当month-end stock；quarter distinct不当monthly average；payroll employees不当persons；offered lower-bound不当actual pay；salary-to-hour conversion不丢规则；A–F不当ordinal performance score；F/suppressed不当zero；old classification不按label merge；generic MCP不提升authority。

## 5. 不可推断与官方资料

必须拒绝：vacancy→public posting、rate→unfilled share of people、payroll employee→unique worker、offered wage→actual wage/total compensation、duration→time-to-fill、constantly recruiting→permanent vacancy、education/experience aggregate→individual requirement、quality grade→employer quality、WDS success→JVWS semantics complete。

- [JVWS Guide](https://www150.statcan.gc.ca/n1/pub/75-514-g/75-514-g2024001-eng.htm)
- [WDS](https://www.statcan.gc.ca/en/developers/wds)
- [WDS User Guide](https://www.statcan.gc.ca/en/developers/wds/user-guide)
- [Table 14-10-0398-01](https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1410039801)
- [Table 14-10-0442-01](https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1410044201)
- [Statistics Canada Open Licence](https://www.statcan.gc.ca/en/terms-conditions/open-licence)
