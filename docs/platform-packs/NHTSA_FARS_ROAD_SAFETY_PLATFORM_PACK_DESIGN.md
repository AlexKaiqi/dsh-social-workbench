# NHTSA FARS Road Safety Platform Pack

## 1. 概念与能力

`nhtsa-fars-road-safety`描述美国 NHTSA Fatality Analysis Reporting System，不代表 NHTSA 全部 crash systems。FARS 的稳定概念是：qualifying fatal traffic crash、state case、vehicle/traffic unit、person/non-motorist、fatality、coded circumstance、annual release、final release 与 analytical/coding manual。

核心总体必须固定为：50 states、District of Columbia 与 Puerto Rico；motor vehicle 在通常向公众开放的 trafficway 上行驶；occupant 或 nonoccupant 在 crash 后 30 日内死亡。FARS 是这个总体的 census，不是所有警方事故、所有伤害、property-damage-only、non-traffic event 或 CRSS probability sample。

只发布 knowledge/fixture 能力：`road-safety.definition.read`、`collision.read`、`unit.read`、`casualty.read`、`release.read` 与 selected `aggregate.read`。Crash API、query tool 与 bulk annual files 是不同 product route；不能自动互相 fallback。

## 2. 接入、成熟度与访问

当前 `callable=0 / durable=0`。官方提供 1975 至今 download/query 入口以及 Crash API 的 dataset/year/state/output-format contract；未来 canary 必须固定 API/bulk product、year coverage、state code、dataset name、manual revision、Annual Report File/Final File standing、content digest 与 field allowlist。API 页面陈述的年份范围、实际 route 可用年份和 bulk 最新年份必须分别观测。

公开站点无需被推断为无限制、无限频率或永久兼容。NHTSA web terms/disclaimer、attribution、API rate/availability 和 raw-file correction posture在 durable 前重新固定。FARS 公开文件无姓名、地址、SSN 不等于所有 person/vehicle/medical/toxicology字段都适合长期索引。

## 3. Snapshot、字段与权利

Snapshot 保存 population/death-window定义、manual/codebook digest、dataset/table roster、release standing、schema/year drift、API route fixture、web terms、decision 与 verification。分析 projection 仅保留 opaque state/case/unit/person relation、typed severity/release/factor posture、coarse geography 和 approved aggregate。

默认 drop/quarantine driver record、plate/VIN/licence、exact rare-event point、free text、death certificate/toxicology/EMS detail、contact 或任何可重识别组合。state source document 不因被 FARS 编码就成为本系统可访问对象。

## 4. 动态视图、可观测性与 fixture

动态视图：`year-state-dataset-manual-release-roster`、`annual-to-final-case-lineage`、`crash-vehicle-person-key-coverage`、`fatality-window-and-person-outcome`、`code-and-label-drift`、`factor-assertion-not-cause`、`FARS-census-vs-CRSS-sample-separation`、`count-vs-VMT-population-exposure` 与 `sensitive-field-drop-audit`。

Telemetry逐 `product × year/state × dataset/table × manual/schema × ARF/final × crash/unit/person × severity/death-window × factor posture × coordinate precision × rights/privacy`记录 fetch/parse、returned/retained/dropped、API/bulk year mismatch、missing dataset、orphan key、late final case、changed code、release digest drift、rate denominator rejection、fallback rejection与 zero effects。

Synthetic 至少覆盖：fatal within 30 days；death after window；ARF case later corrected in final；same case number across state/year namespace；CRSS weighted row rejected from FARS census；factor not cause；count without compatible VMT not risk；exact sensitive fields dropped。

## 5. 不可推断与官方资料

必须拒绝：FARS→all crashes、fatal crash→all persons fatal、ARF→final、missing case→deleted event、coded factor→fault/root cause、state/year similarity→identity、count→risk、Crash API failure→silent bulk fallback、public file→unbounded personal profiling。

- [Fatality Analysis Reporting System definition](https://www.nhtsa.gov/crash-data-systems/fatality-analysis-reporting-system)
- [FARS data access](https://www.nhtsa.gov/research-data/fatality-analysis-reporting-system-fars)
- [NHTSA Crash API](https://crashviewer.nhtsa.dot.gov/crashviewer/CrashAPI)
- [FARS manuals index](https://static.nhtsa.gov/nhtsa/downloads/FARS/Links%20for%20FARS%20Manuals.pdf)
- [NHTSA web policies](https://www.nhtsa.gov/about-nhtsa/web-policies-notices)
