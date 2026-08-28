# Canada CMHC Rental Market Survey Platform Pack

## 1. 概念与能力

`canada-cmhc-rental-market-survey`只描述Canada Mortgage and Housing Corporation Rental Market Survey（RMS）公开统计，不代表全部加拿大出租住房、realtime listing或social/affordable housing。稳定概念是eligible structure/unit universe、urban centre、apartment/row structure、bedroom/structure breakdown、market/occupied/vacant/turnover/non-turnover rent、vacancy、immediate availability、turnover、same-sample rent change、survey reference、reliability code、suppression与release。

只发布knowledge/fixture能力：`rental-housing.program.read`、`population.read`、`universe.read`、`rent-level.read`、`vacancy.read`、`turnover.read`、`estimate-quality.read`、`release.read`与selected `aggregate.read`。不发布property/manager identity、social-housing inference、listing、contact或写能力。

## 2. 接入、成熟度与访问

当前`callable=0 / durable=0`。固定official route为CMHC Rental Market Survey Data Tables XLSX、Housing Market Information Portal selected table与RMS methodology；没有官方公开API contract。`mountainMath/cmhc`使用portal内部接口，只是community candidate，不能把其endpoint当official route。

RMS每年10月前两周采样人口10,000以上urban areas，目标是privately initiated、至少3个rental units且上市至少3个月的structures，排除social/affordable housing frame。vacant要求survey时physically unoccupied且available for immediate rental；turnover表示过去12个月有new tenant，unit可被重复计数。average rent与same-sample percentage change不是同一measure。

## 3. Snapshot、字段与权利

Snapshot保存survey frame、structure/unit eligibility、urban geography、October reference、rent basis、vacancy/immediate definition、turnover/repeat policy、same-sample/significance method、CV/reliability/suppression、table/workbook/HMIP selection、licence/attribution、release/revision与decision。projection只保留aggregate geography、typed measure/universe、quality和period；不保存owner/manager/superintendent、building address或respondent detail。

CMHC Data Licence授予可撤销、全球、免版税、非独占复用并要求准确再现和指定source/adaptation声明。它不把community wrapper变成CMHC endorsed，也不保证portal endpoint稳定。

## 4. 动态视图、可观测性与fixture

动态视图：`survey-frame-structure-unit-universe`、`urban-geography-zone-and-vintage`、`all-vs-occupied-vs-vacant-vs-turnover-rent`、`vacancy-vs-immediate-availability-definition`、`turnover-window-repeat-count`、`same-sample-change-vs-level-change`、`estimate-cv-reliability-significance-suppression`、`table-workbook-hmip-route-lineage`与`licence-attribution-drift`。

Telemetry逐`survey year × table/workbook/HMIP selection × geography/zone × structure/bedroom/year-built/size × universe/rent/vacancy/turnover measure × rent basis × sample/common-sample × CV/reliability/significance/suppression × licence`记录requested/returned/dropped、file digest、schema/label drift、unknown marker、universe change、suppressed estimate、low reliability、non-significant change、portal/table mismatch、community endpoint rejection与zero effects。

Synthetic至少覆盖：RMS universe不当全部rental stock；vacancy不当listing count；available immediate不当future availability；vacant asking rent不当occupied rent；turnover unit不当unique tenant；same-sample change不从published average levels直接重算；`**`不当zero；D-quality不当precise；social/affordable housing不从RMS absence推断；community wrapper成功不证明official API。

## 5. 不可推断与官方资料

必须拒绝：survey vacancy→individual unit availability、average rent→individual lease、vacant asking→achieved rent、turnover→eviction/displacement、universe growth→construction completion、occupied units→household demand、suppressed→zero、October snapshot→annual continuity、HMIP HTML→documented API、community package→CMHC authority。

- [CMHC Rental Market Survey data tables](https://www.cmhc-schl.gc.ca/professionals/housing-markets-data-and-research/housing-data/data-tables/rental-market)
- [Current RMS report data tables](https://www.cmhc-schl.gc.ca/professionals/housing-markets-data-and-research/housing-data/data-tables/rental-market/rental-market-report-data-tables)
- [RMS methodology and definitions](https://www.cmhc-schl.gc.ca/professionals/housing-markets-data-and-research/housing-research/surveys/methods/methodology-rental-market-survey)
- [CMHC Housing Market Information Portal](https://www03.cmhc-schl.gc.ca/hmip-pimh/en)
- [CMHC data licence](https://www.cmhc-schl.gc.ca/professionals/housing-markets-data-and-research/housing-data/cmhc-licence-agreement-use-of-data)
