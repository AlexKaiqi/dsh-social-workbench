# Transport for NSW Crash Data Road Safety Platform Pack

## 1. 概念与能力

`transport-for-nsw-crash-data-road-safety`描述 Transport for NSW 的 record-level NSW Crash Data 与相邻 Crash Statistics，不与 Public Transit GTFS 产品共用 Connector。稳定概念是 crash、traffic unit、location/environment、vehicle type、driver/road-user、injury/fatality、five-year release、annual update 与 interactive aggregate。

当前公开资源明确列出 `CRASH.xlsx` 与 `TRAFFIC UNIT.xlsx`；dataset description提到 drivers 与 injured/killed people，但 person/casualty是否为独立 grain、嵌入 traffic unit 还是受控字段必须由当前 data manual 证明。Live Traffic Hazards 是独立 active-event产品，不是历史 crash fallback。

只发布 knowledge/fixture 能力：`road-safety.definition.read`、`collision.read`、`unit.read`、selected `casualty.read` candidate、`release.read` 与 selected `aggregate.read`。

## 2. 接入、成熟度与访问

当前 `callable=0 / durable=0`。Open Data Hub 将当前 2020–2024 crash resource固定为 `c6351d27-b1b0-48e9-93a6-a612cba88f99`，traffic-unit resource为 `fbd0a0da-aa1f-4233-a974-d674713ad4a5`；Data.NSW mirror显示 direct download metadata 和 CC BY，而 Hub 页面显示 `Login to download`。这是 access-contract 冲突证据，不是可匿名调用证明。

未来 canary 必须固定 portal/dataset/package/resource ID、manual/schema revision、five-year coverage、annual replacement、login/token posture、direct URL、content digest、CC BY attribution 与 CKAN route。旧 five-year file不得与当前 file按相同记录无条件覆盖或去重。

## 3. Snapshot、字段与权利

Snapshot 保存 dataset/resource roster、data manual digest、crash/traffic-unit grain/key、coverage years、annual update、portal/Data.NSW access evidence、CC BY/portal terms、privacy statement、decision 与 verification；未授权不下载 XLSX rows。

未来 projection 只保留 opaque crash/unit relation、typed severity/road-user/unit/location/factor posture、coarse LGA/grid/segment 和 approved aggregate。driver/person identity、address、plate/VIN/licence、free text、health linkage detail、exact rare point 和 small-cell demographics默认drop、coarsen或suppress。

## 4. 动态视图、可观测性与 fixture

动态视图：`portal-package-resource-manual-release-roster`、`five-year-overlap-and-annual-replacement-lineage`、`crash-to-traffic-unit-key-coverage`、`person-casualty-grain-unknown-gap`、`location-environment-vehicle-injury-separation`、`portal-login-vs-direct-resource-access`、`record-data-vs-interactive-statistic`、`historical-crash-vs-live-hazard` 与 `sensitive-field-drop-audit`。

Telemetry逐 `portal/mirror × resource ID × coverage years × manual/schema × crash/unit grain × severity/road-user × location precision × access/login × CC BY/privacy`记录metadata fetch、returned/retained/dropped、403/login、direct-route mismatch、resource replacement、overlap duplicate/correction、orphan key、unknown casualty grain、licence drift、fallback rejection和zero effects。

Synthetic 至少覆盖：same crash across overlapping five-year releases建立revision candidate；crash/unit exact key join；description提到person但schema未证明时保持unknown；portal login与direct URL冲突fail closed；interactive total不回填record rows；live hazard不变成crash；exact point/person field drop。

## 5. 不可推断与官方资料

必须拒绝：description→verified person schema、five-year window→only five years exist、new file→old records unchanged、portal resource visible→anonymous durable access、traffic unit→driver identity、factor→cause/liability、interactive aggregate→record completeness、Live Traffic hazard→crash、CC BY→third-party field unrestricted。

- [TfNSW NSW Crash Data](https://opendata.transport.nsw.gov.au/data/dataset/nsw-crash-data)
- [Data.NSW mirror](https://www.data.nsw.gov.au/data/dataset/2-nsw-crash-data)
- [Current crash resource metadata](https://opendata.transport.nsw.gov.au/data/dataset/nsw-crash-data/resource/c6351d27-b1b0-48e9-93a6-a612cba88f99)
- [Current traffic-unit resource metadata](https://opendata.transport.nsw.gov.au/data/dataset/nsw-crash-data/resource/fbd0a0da-aa1f-4233-a974-d674713ad4a5)
- [NSW Crash Statistics](https://www.data.nsw.gov.au/data/dataset/2-crash-statistics)
