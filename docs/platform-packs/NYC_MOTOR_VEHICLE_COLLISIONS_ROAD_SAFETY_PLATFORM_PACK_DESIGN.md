# NYC Motor Vehicle Collisions Road Safety Platform Pack

## 1. 概念与能力

`nyc-motor-vehicle-collisions-road-safety`描述 NYPD/NYC Open Data 的 Motor Vehicle Collisions 产品族。稳定概念是 crash event、vehicle row、person row、collision ID、occurrence time/location、injured/killed counts、road-user category、vehicle type 与 contributing-factor assertion。

三个官方表必须独立：Crashes `h9gi-nx95`、Vehicles `bm4k-52h4`、Person `f55k-p6yu`。一条 crash 可以关联多个 vehicle/person；crash aggregate count 不能替代 person casualty row，portal 共址也不证明 schema、更新水位或 coverage 相同。

只发布 knowledge/fixture 能力：`road-safety.definition.read`、`collision.read`、`unit.read`、`casualty.read`、`release.read` 与 selected aggregate reference。SODA producer 的 add/update/delete/upsert/truncate 永不进入此 Connector 能力。

## 2. 接入、成熟度与访问

当前 `callable=0 / durable=0`。未来 SODA read binding 固定 domain、dataset ID、API-field/schema digest、primary/join key、`$select/$where/$order/$limit`、pagination、app-token posture、update watermark 和 row revision policy。browser view、community-created view、data.gov mirror 或复制到 Kaggle 的数据不得 fallback 为 official dataset。

警方上报总体不等于所有实际 collision；报告门槛、电子 reporting 迁移与 preliminary/corrected standing必须固定。NYC Open Data policy声明 agency 为 authority，数据可更新、更正、覆盖或刷新且旧版本不保留，因此当前 row不能冒充 immutable history。

## 3. Snapshot、字段与权利

Snapshot 保存 dataset-ID roster、官方 description/schema digest、table grain/key rules、reporting threshold、update policy、Open Data terms、attribution、decision 与 verification。合法 snapshot 只保存 contract/revision evidence，不在未授权时复制实际 rows。

未来默认 projection 使用 opaque collision/unit/person key、coarse borough/grid/segment、typed injury/fatal counts、road-user/vehicle category和factor assertion。street address、exact rare-event coordinate、plate/VIN/licence、person detail、free text和可重识别小群体组合默认drop、coarsen或suppress。

## 4. 动态视图、可观测性与 fixture

动态视图：`dataset-id-schema-and-watermark-roster`、`crash-to-vehicle-to-person-exact-key-lineage`、`crash-count-vs-person-casualty-gap`、`preliminary-corrected-overwritten-history`、`location-missing-point-street-intersection-grid`、`contributing-factor-assertion-not-liability`、`reporting-threshold-and-electronic-system-era`与`sensitive-field-drop-audit`。

Telemetry逐 `dataset ID × table grain × schema revision × update watermark × collision ID × join key × injury/fatal category × factor slot/posture × borough/location precision × terms/privacy`记录returned/retained/dropped、429/pagination、sort instability、duplicate/changed/disappeared row、orphan vehicle/person、count mismatch、null coordinate、community-view fallback rejection、terms drift和zero effects。

Synthetic 至少覆盖：one crash/multiple vehicles/persons；crash killed count与person rows暂不一致；correction更新而旧 evidence保留；同时间/坐标不同 collision ID不merge；factor slot为`Unspecified`；missing coordinate保持unknown；exact street/person field drop；SODA producer capability拒绝。

## 5. 不可推断与官方资料

必须拒绝：police-reported→all collisions、crash row→complete casualty detail、factor→fault/cause、preliminary→final、row disappearance→event未发生、street/coordinate/time→identity、count→risk、community view→official、SODA wire→write authority。

- [NYC Vision Zero Open Data](https://www.nyc.gov/content/visionzero/pages/open-data)
- [Crashes SODA contract `h9gi-nx95`](https://dev.socrata.com/foundry/data.cityofnewyork.us/h9gi-nx95)
- [Motor Vehicle Collisions – Crashes](https://data.cityofnewyork.us/Public-Safety/Motor-Vehicle-Collisions-Crashes/h9gi-nx95/about_data)
- [NYC Open Data public policies and terms](https://cityofnewyork.github.io/opendatatsm/publicpolicies.html)
- [NYC Open Data Technical Standards Manual](https://cityofnewyork.github.io/opendatatsm/citystandards.html)
