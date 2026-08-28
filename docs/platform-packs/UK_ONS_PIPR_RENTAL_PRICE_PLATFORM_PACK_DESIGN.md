# UK ONS Price Index of Private Rents Platform Pack

## 1. 概念与能力

`uk-ons-pipr-rental-price`只描述ONS Price Index of Private Rents（PIPR）公开产品，不代表实时listing、全部private tenancy、Local Housing Allowance或UK House Price Index。稳定概念是administrative rent input、achieved/advertised/mixed basis、new/existing tenancy stock、fixed basket、hedonic double imputation、predicted price、price level、elementary aggregate、expenditure weight、rental price index、annual change、geography/property breakdown、release与method revision。

只发布knowledge/fixture能力：`rental-housing.program.read`、`population.read`、`rent-level.read`、`rent-index.read`、`weight-method.read`、`estimate-quality.read`、`release.read`与selected `aggregate.read`。不发布property microdata、vacancy、turnover、household burden、listing或写能力。

## 2. 接入、成熟度与访问

当前`callable=0 / durable=0`。固定官方route是PIPR monthly price statistics、annual weights、data volumes与historical series的版本化ONS dataset页面及逐edition XLSX；本轮没有把`api.beta.ons.gov.uk/v1/datasets`泛化为PIPR exact API route。每个workbook必须固定dataset slug、edition/release date、asset URL/digest、sheet/schema、geography/property breakdown与supersession。

PIPR从2024年3月替代Great Britain旧IPHRP、从2025年3月替代Northern Ireland旧measure。England/Wales主要是achieved rent；Scotland自2025年9月混合advertised与achieved；Northern Ireland是advertised rent。低于region的indices使用3-month moving average；published price levels由reference-period level按index growth extrapolate。它们不能变成逐月observed average transaction rent。

## 3. Snapshot、字段与权利

Snapshot保存PIPR population、national source posture、14-month validity、fixed basket、hedonic/imputation/stratification/weight/index/chain-link/smoothing/price-level method、dataset edition/workbook digest、geography/property classification、IPHRP replacement/history link、quality/accreditation、OGL与revision。projection不保存property/address、rent officer、landlord/agent或restricted administrative microdata。

ONS多数内容按Open Government Licence复用，需source accreditation并检查third-party exemptions；不得暗示ONS endorsement。方法、edition和correction必须与数值同行。

## 4. 动态视图、可观测性与fixture

动态视图：`country-source-achieved-advertised-mixed-posture`、`fixed-basket-monthly-dataset-and-validity`、`observed-vs-imputed-vs-predicted-rent`、`price-level-vs-index-vs-annual-change`、`geography-property-bedroom-furnishing-breakdown`、`weight-reference-index-reference-and-link-period`、`smoothing-and-extrapolation`、`IPHRP-to-PIPR-method-break`与`edition-workbook-correction-lineage`。

Telemetry逐`dataset/edition/file/sheet × country/source basis × geography/property/bedroom/furnishing × level/index/change/weight × observed/imputed/predicted × basket/reference/link/smoothing × release/method/accreditation × OGL`记录file digest、sheet/schema drift、requested/returned/dropped、unknown marker、source-mix drift、model/method change、coverage/data-volume change、edition correction、cross-basis rejection与zero effects。

Synthetic至少覆盖：achieved不等于advertised；mixed nation不当pure achieved；fixed-basket predicted rent不当current listing；price level不当index；index point不当currency；annual change不当monthly change；3-month-smoothed local series不与unsmoothed national series盲比；old IPHRP不与PIPR按label merge；modelled price level不归因到property；missing workbook cell不当zero/vacancy。

## 5. 不可推断与官方资料

必须拒绝：PIPR→all tenancies、predicted level→observed transaction、advertised→achieved、rent inflation→rent burden、sample coverage→market share、price level→available listing、method replacement→continuous identical series、local estimate→individual property、generic ONS client→PIPR schema complete。

- [PIPR monthly price statistics](https://www.ons.gov.uk/economy/inflationandpriceindices/datasets/priceindexofprivaterentsukmonthlypricestatistics)
- [PIPR annual weights](https://www.ons.gov.uk/economy/inflationandpriceindices/datasets/priceindexofprivaterentsukannualweights)
- [PIPR detailed methodology](https://www.ons.gov.uk/economy/inflationandpriceindices/methodologies/priceindexofprivaterentsdetailedmethodology)
- [PIPR quality and methodology information](https://www.ons.gov.uk/peoplepopulationandcommunity/housing/methodologies/priceindexofprivaterentsqmi)
- [Quality assurance of PIPR administrative data](https://www.ons.gov.uk/economy/inflationandpriceindices/methodologies/qualityassuranceofadministrativedatausedinthepriceindexofprivaterents)
- [ONS terms and OGL posture](https://www.ons.gov.uk/help/terms-conditions)
