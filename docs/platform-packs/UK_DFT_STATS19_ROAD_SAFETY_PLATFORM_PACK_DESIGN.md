# UK DfT STATS19 Road Safety Platform Pack

## 1. 概念与能力

`uk-dft-stats19-road-safety`描述英国 Department for Transport 的 reported road casualty statistics open data。稳定概念是 police-reported personal-injury collision on a public road、collision、vehicle、casualty、coded variable、police force、severity definition、provisional/final release、historical revision 与 aggregate table。

它不覆盖未向警方报告、非公共道路或无人身伤害 collision。collision、vehicle、casualty 三表有不同 grain；2011 与 2024 specification、contributory factor (CF) 与 road safety factor (RSF)、police severity 与 injury-based/adjusted severity必须保留 revision 边界。

只发布 knowledge/fixture 能力：`road-safety.definition.read`、`collision.read`、`unit.read`、`casualty.read`、`release.read`、`revision.read` 与 selected `aggregate.read`。

## 2. 接入、成熟度与访问

当前 `callable=0 / durable=0`。官方按 single year、latest five years 与 1979-latest complete dataset 发布 collision/vehicle/casualty CSV，另有 unvalidated provisional mid-year、final annual、data guide、severity adjustment 和 historical revision log。未来 binding 固定 resource URL、period、release standing、schema/specification、code lookup digest、table grain/key、compression/content digest 与 OGL attribution。

同一页面的 latest、five-year 与 complete 文件不能按文件名猜相同 revision；provisional不能覆盖 final，complete refresh也不能消灭旧 evidence。敏感字段申请是独立受限能力，不进入公开 Connector fallback。

## 3. Snapshot、字段与权利

Snapshot 保存 STATS19/STATS20 specification、open data guide、resource roster、release schedule、severity adjustment、historical schema/revision log、OGL v3、decision 与 verification；未授权时不下载 CSV data rows。

未来 projection 只保留 opaque collision/vehicle/casualty key、typed road-user/unit/severity/factor posture、approved coarse location和aggregate。敏感 contributory/road-safety factor、casualty postcode、free text、exact rare point 与 demographic small cells按官方开放范围和本系统更严格purpose/suppression policy处理。

## 4. 动态视图、可观测性与 fixture

动态视图：`resource-period-release-schema-roster`、`collision-vehicle-casualty-exact-key-lineage`、`provisional-to-final-to-revision-history`、`2011-to-2024-specification-mapping`、`police-vs-injury-based-vs-adjusted-severity`、`CF-vs-RSF-and-conversion-posture`、`exact-coordinate-to-coarse-geography`、`reported-population-vs-exposure-rate` 与 `sensitive-field-drop-audit`。

Telemetry逐 `resource × period × release standing × specification/codebook × collision/vehicle/casualty grain × police force × severity/basis × CF/RSF posture × coordinate/CRS × revision/OGL/privacy`记录download metadata、parse、returned/retained/dropped、file digest drift、schema/code change、orphan key、provisional/final delta、historical revision match、severity conversion、suppression、fallback rejection和zero effects。

Synthetic 至少覆盖：non-injury crash拒绝进入总体；provisional collision在final修正；historical revision只影响exact records；2011/2024同名code不盲merge；police serious与injury-based serious分开；CF不能与RSF直接拼接；sensitive factor缺失不推断为none；count无exposure不输出risk。

## 5. 不可推断与官方资料

必须拒绝：reported injury collisions→all crashes、collision severity→每个casualty outcome、provisional→final、code label相同→跨spec可比、CF→RSF、factor→cause/liability、missing sensitive field→factor absent、count→risk、community R package→DfT authority。

- [Road safety open data](https://www.gov.uk/government/statistical-data-sets/road-safety-open-data)
- [STATS19 forms and STATS20 guidance](https://www.gov.uk/government/publications/stats19-forms-and-guidance)
- [Road safety statistics guidance](https://www.gov.uk/guidance/road-accident-and-safety-statistics-guidance)
- [Road safety statistics data tables](https://www.gov.uk/government/statistical-data-sets/road-safety-statistics-data-tables)
- [Personal information and data protection](https://www.gov.uk/guidance/personal-information-and-data-protection)
