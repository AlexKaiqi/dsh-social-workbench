# U.S. BLS JOLTS Labor Demand Platform Pack

## 1. 概念与能力

`us-bls-jolts-labor-demand`只描述Bureau of Labor Statistics Job Openings and Labor Turnover Survey，不代表全部BLS employment数据或逐条美国职位。稳定概念是establishment population、job opening、employment benchmark、hire、quit、layoff/discharge、other/total separation、level/rate、NAICS/ownership/region/state/size、seasonal adjustment、estimate quality与release revision。

Job opening是last business day stock：specific position存在、work available、可在30天内开始并active external recruitment。Hires和separations是entire reference month flow。它们不能相减生成“unfilled jobs”，也不能绑定到一个公开posting或unique person。

## 2. 接入、成熟度与访问

当前`callable=0 / durable=0`。exact official endpoint为`https://api.bls.gov/publicAPI/v2/timeseries/data/`；public v2可按SeriesID访问，registration key扩大query/series/year和catalog/calculation能力。JOLTS series allowlist必须从official database/LABSTAT `jt.series` catalogue固定并以title、area/industry、data element、rate/level、SA/NSA交叉验证，本轮没有请求catalogue file或data response。

[API signatures](https://www.bls.gov/developers/api_signature_v2.htm)只定义transport；[JOLTS Concepts](https://www.bls.gov/opub/hom/jlt/concepts.htm)、[Calculation](https://www.bls.gov/opub/hom/jlt/calculation.htm)和[Presentation](https://www.bls.gov/opub/hom/jlt/presentation.htm)才定义domain semantics。generic BLS survey/series search成功不能升级JOLTS fixture。

## 3. Snapshot、字段与权利

Dolt/Git保存program/population/statistical-unit、vacancy definition、series catalogue identity、data element、level/rate、numerator/denominator、reference window、SA/NSA、alignment/benchmark/model、preliminary/final/annual revision、significant-change method、API terms/access date与fixed OSS revision。分析库未来只保存批准的aggregate observations，不保存respondent establishment、business contact或restricted microdata。

BLS发布内容通常public domain但logo/trademark除外；API Terms要求retrieval date、派生分析免责声明、不得虚假表示并允许限流/termination。API key只保存credential ref。

## 4. 动态视图、可观测性与fixture

动态视图：`opening-stock-vs-payroll-flow`、`job-opening-hire-separation-level-and-rate`、`employment-plus-opening-denominator`、`quit-layoff-discharge-other-component`、`national-state-synthetic-posture`、`NAICS-ownership-region-size`、`SA-NSA-alignment-benchmark`与`preliminary-final-five-year-revision-lineage`。

Telemetry逐`API/version × series/catalogue digest × national/state/region/industry/ownership/size × opening/employment/hire/quit/layoff/other/total × level/rate × stock/flow × numerator/denominator × SA/NSA/aligned/modelled × preliminary/final/benchmark × SE/significance × terms/key/quota`记录requested/returned/dropped、unknown series、title-code mismatch、period mismatch、footnote/status、revision、quota/locked/rate failure、cross-measure rejection与zero effects。

Synthetic至少覆盖：opening stock不当posting或flow；hire不当filled opening；separation不当churn；employment denominator不替换为persons；annual opening average不当sum；annual flow sum不当average；SA/NSA不merge；state synthetic不当establishment observation；preliminary不覆盖final；non-significant不当zero。

## 5. 不可推断与官方资料

必须拒绝：opening→public job advert/unique employer、hire→vacancy filled、quit→dissatisfaction、layoff/discharge→具体cause、separation→net job loss、rate→level、employment→people、state estimate→local company、missing series→zero、generic BLS MCP→JOLTS semantics complete。

- [JOLTS overview](https://www.bls.gov/opub/hom/jlt/home.htm)
- [JOLTS concepts](https://www.bls.gov/opub/hom/jlt/concepts.htm)
- [JOLTS calculation](https://www.bls.gov/opub/hom/jlt/calculation.htm)
- [JOLTS presentation and revisions](https://www.bls.gov/opub/hom/jlt/presentation.htm)
- [BLS Public Data API v2](https://www.bls.gov/developers/api_signature_v2.htm)
- [BLS API Terms](https://www.bls.gov/developers/termsOfService.htm)
- [BLS copyright](https://www.bls.gov/opub/copyright-information.htm)

