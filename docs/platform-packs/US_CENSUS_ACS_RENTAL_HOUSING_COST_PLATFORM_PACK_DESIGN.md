# U.S. Census ACS Rental Housing Cost Platform Pack

## 1. 概念与能力

`us-census-acs-rental-housing-cost`只描述American Community Survey公开的租赁住房、gross rent、rental vacancy与住房成本占收入统计，不代表实时租赁市场、Census全部住房产品或HUD项目。稳定概念是ACS 1-year/5-year period estimate、table/group/variable、universe、estimate/MOE、renter-occupied unit、cash rent、gross rent、rental vacancy、household income、rent-to-income distribution、geography与vintage。

只发布knowledge/fixture能力：`rental-housing.program.read`、`population.read`、`tenure.read`、selected `rent-level.read`、`vacancy.read`、`burden.read`、`estimate-quality.read`与`release.read`。不发布listing、address、respondent/PUMS、individual affordability或写能力。

## 2. 接入、成熟度与访问

当前`callable=0 / durable=0`。固定机器route为`https://api.census.gov/data/{year}/acs/acs1`与`acs5`，租赁fixture固定Detailed Table `B25064`（median gross rent）、`B25070`（gross rent as a percentage of household income）及Data Profile `DP04`中的rental vacancy。2026年5月12日起Census Data API query均需key；本Pack没有申请或使用key。

1-year是12个月period estimate，主要覆盖人口65,000以上地区；5-year是60个月period estimate并覆盖更小geography。它们不能按同一year/geography直接互换。binding必须固定year、dataset family、table/group/variable、estimate/MOE/annotation sibling、universe、geography summary level/FIPS、period、table/geography change与errata。

## 3. Snapshot、字段与权利

Snapshot保存ACS program/method、1-year/5-year population、table shell、variable label/concept/universe、estimate/MOE/annotation relation、geography vintage、gross-rent components、vacancy和burden definitions、API key posture、Terms、revision与decision。分析projection默认只保留aggregate geography ref、typed estimate、MOE/quality、universe、period与release；不保存address、person/household identity、PUMS row或可重识别小群体组合。

Census API Terms禁止用公开数据单独或联结识别个人、家庭、企业或其他实体，要求API产品说明非Census背书，且不得修改或虚假表示内容后仍声称来自Census。数据引用与分析结论责任分别保存。

## 4. 动态视图、可观测性与fixture

动态视图：`year-dataset-table-group-variable-universe-roster`、`estimate-moe-annotation-and-suppression`、`one-year-vs-five-year-period-and-geography`、`contract-vs-gross-rent-components`、`median-rent-vs-rent-band-distribution`、`rental-vacancy-numerator-denominator`、`rent-income-burden-population`、`table-geography-change-errata`与`api-key-terms-drift`。

Telemetry逐`year × acs1/acs5 × detailed/profile/subject × group/variable × estimate/MOE/annotation × universe × geography/vintage × rent/vacancy/burden measure × period × key/terms`记录requested/returned/retained/dropped、unknown variable、sentinel/annotation、MOE missing、geography rejection、period mismatch、table change、errata、key/rate failure、identity-risk drop、cross-measure rejection与zero effects。

Synthetic至少覆盖：1-year不当point-in-time；5-year不当单年；median gross rent不当listing/asking rent；B25070 population不当所有households；estimate与MOE不相加；negative sentinel/annotation不当负租金；DP04 vacancy不当available listing count；median rent÷median income不替代published burden distribution；tract与place不按名称merge；API key不进入日志/知识/Git。

## 5. 不可推断与官方资料

必须拒绝：ACS estimate→census count、gross rent→contract rent、median→individual rent、rental vacancy→实时listing supply、renter household→person、1-year→5-year、MOE→error correction、missing/suppressed→zero、geographic aggregate→household hardship、generic Census MCP/client→住房语义完整。

- [ACS 1-Year Data API](https://www.census.gov/data/developers/data-sets/acs-1year.html)
- [ACS 1-year/5-year release and geography guidance](https://www.census.gov/programs-surveys/acs/library/information-guide.html)
- [B25064 variable group](https://api.census.gov/data/2024/acs/acs1/groups/B25064.html)
- [B25070 variable group](https://api.census.gov/data/2024/acs/acs1/groups/B25070.html)
- [2024 ACS subject definitions](https://www2.census.gov/programs-surveys/acs/tech_docs/subject_definitions/2024_ACSSubjectDefinitions.pdf)
- [ACS technical documentation](https://www.census.gov/programs-surveys/acs/technical-documentation.html)
- [Census Data API Terms](https://www.census.gov/data/developers/about/terms-of-service.html)
- [Census citation policy](https://www.census.gov/about/policies/citation.html)
