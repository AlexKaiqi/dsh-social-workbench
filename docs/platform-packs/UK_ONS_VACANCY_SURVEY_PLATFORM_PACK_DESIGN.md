# UK ONS Vacancy Survey Platform Pack

## 1. 概念与能力

`uk-ons-vacancy-survey`只描述ONS Vacancy Survey及VACS01/02/03和X06产品，不代表online job adverts、全部UK jobs或regional vacancy count。稳定概念是business population、specified-date active outside recruitment vacancy、single-month stock、three-month moving-average stock、industry/size、employee-jobs/filled-unfilled denominator、vacancy rate/ratio、weight/imputation、SA/NSA、CV与revision。

GB businesses构成sample，结果按employment estimates加权到UK；agriculture/forestry/fishing、households as employers、employment agencies等有source-defined exclusions，Northern Ireland businesses不直接approach。vacancy statistics不提供region breakdown。

## 2. 接入、成熟度与访问

当前`callable=0 / durable=0`。exact official route是[VACS02 versioned dataset page](https://www.ons.gov.uk/employmentandlabourmarket/peoplenotinwork/unemployment/datasets/vacanciesbyindustryvacs02)及逐release XLS/XLSX edition；VACS01/VACS03/X06分别提供vacancy-unemployment、size与single-month products。当前不把generic ONS Dataset API或`dp-api-clients-go`声明为VACS exact API route。

headline是seasonally adjusted three-month moving average；X06是not seasonally adjusted single-month observation。2026年7–8月旧`vacancies per 100 employee jobs`与新`vacancies / (filled + unfilled jobs)`并行，目标自2026年9月只发布新法；每个edition必须固定denominator method和validity。

## 3. Snapshot、字段与权利

Dolt/Git保存survey population/exclusions、IDBR frame、question/definition、sample/weight/imputation、VACS/X06 product、edition/asset digest/sheet/schema/series、single/3-month timing、SA/NSA、old/new rate denominator、SIC revision、CV/confidence、late-response/annual revision和OGL rights。分析库未来只接批准aggregate cells，不保存business respondent/contact或survey response microdata。

ONS content通常受OGL约束，但third-party assets、endorsement与current-site authority需逐artifact检查。

## 4. 动态视图、可观测性与fixture

动态视图：`GB-sample-to-UK-weighted-population`、`specified-date-vacancy-definition`、`single-month-vs-three-month-moving-average`、`SA-vs-NSA`、`industry-vs-size`、`old-vacancies-per-employee-jobs-vs-new-openings-rate`、`CV-confidence-response-imputation`与`edition-late-response-annual-revision-lineage`。

Telemetry逐`dataset/product × edition/file/sheet/series × GB/UK population × SIC/industry/size × single/3-month × stock/rate × old/new denominator × SA/NSA × weighted/modelled/imputed × CV/confidence/response × release/revision/OGL`记录digest/schema drift、requested/returned/dropped、unknown symbol、denominator cutover、revision、cross-window rejection与zero effects。

Synthetic至少覆盖：GB respondent sample不当UK census；3-month不当single month；SA不与NSA merge；vacancy不当Adzuna posting；old ratio不与new rate merge；employee jobs不当persons；no region不由job-ad data fallback；late response revision不覆盖earlier release；suppression/missing不当zero。

## 5. 不可推断与官方资料

必须拒绝：vacancy→posting/company、UK aggregate→region、three-month average→current month、active recruitment→eventual hire、rate change→vacancy level change、new denominator→continuous old series、employment agency exclusion→no agency demand、generic ONS client→VACS route/schema complete。

- [Vacancy Survey QMI](https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/employmentandemployeetypes/methodologies/vacancysurveyqmi)
- [VACS02 dataset](https://www.ons.gov.uk/employmentandlabourmarket/peoplenotinwork/unemployment/datasets/vacanciesbyindustryvacs02)
- [Vacancies and jobs in the UK](https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/employmentandemployeetypes/bulletins/jobsandvacanciesintheuk)
- [Guide to labour market data](https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/employmentandemployeetypes/methodologies/aguidetolabourmarketdata)
- [ONS terms and OGL posture](https://www.ons.gov.uk/help/terms-conditions)

