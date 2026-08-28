# Public Road Safety Crashes, Casualties & Hazardous Locations Channel Pack

## 1. 目的与不可合并事实

本 Channel 用于发现事故报告、道路设计、弱势道路使用者伤害、严重程度口径、修订传播、危险位置识别和统计解释中的需求与痛点。它统一 `RoadSafety*` projection，但不统一 jurisdiction、reporting threshold、police coverage、fatality window、sample design、table grain、severity basis、factor authority、release vintage、geocode precision、exposure denominator、privacy 或 rights。

最小事实链：

```text
population definition + schema + release vintage
        -> collision -> traffic unit -> road user -> casualty -> linked outcome
                    \-> location      \-> reported/coded factor

exposure definition + compatible collision/casualty population -> aggregate/rate
active hazard/work zone + validity window -----------------------> separate event surface
```

所有实线关系都必须由 exact member native key、schema 与 release 证明。街道名、坐标、时刻、人数或因素相似只生成 review candidate。

## 2. 成员与能力矩阵

| capability | NHTSA FARS | NYC MVC | DfT STATS19 | NSW Crash Data | 当前发布 |
| --- | --- | --- | --- | --- | --- |
| `road-safety.definition.read` | census/manual fixture | dataset/terms fixture | codebook/spec fixture | dataset/manual fixture | knowledge/fixture only |
| `road-safety.collision.read` | fatal crash fixture | crash fixture | collision fixture | crash fixture | knowledge/fixture only |
| `road-safety.unit.read` | vehicle fixture | vehicle fixture | vehicle fixture | traffic-unit fixture | knowledge/fixture only |
| `road-safety.casualty.read` | person/fatality fixture | person fixture | casualty fixture | selected injury fields candidate | knowledge/fixture only |
| `road-safety.release.read` | ARF/final fixture | mutable portal fixture | provisional/final/revision fixture | annual five-year fixture | knowledge/fixture only |
| `road-safety.aggregate.read` | selected query/rate fixture | Vision Zero selected aggregate | official tables/rates fixture | interactive statistics fixture | knowledge/fixture only |
| `road-safety.hazard.read` | WZDx adjacent candidate | separate city event products | separate operational products | Live Traffic adjacent product | no member crash-route fallback |

成熟度：`requested=4 / concept=4 / dataset route fixture=4 / collision=4 / unit=4 / person-or-casualty=3 / release-or-revision=3 / aggregate-or-exposure=3 / manual=4 / callable=0 / durable=0`。同为 CSV、Socrata、CKAN、road-safety 或相同字段名都不提高成员成熟度。

## 3. Snapshot、分析库与动态物化

Dolt/Git snapshot 保存 Platform/Channel Pack、population/schema/codebook digest、table grain/key relation、severity/factor/release/revision/geocode/exposure/suppression/privacy/rights定义、官方资源 roster、decision、verification、lineage 与 tombstone；不保存未经授权的 record-level crash/person/vehicle/casualty bulk 数据。

未来获得 durable 授权后，分析数据库只接 field-approved opaque identity、coarse geography、typed severity/release/factor/risk posture 和 approved aggregate。动态物化视图至少包括：

- `member-jurisdiction-publisher-dataset-product-release-roster`；
- `population-threshold-road-scope-reporting-source-and-fatality-window`；
- `release-vintage-schema-codebook-table-grain-and-key-lineage`；
- `collision-to-unit-to-road-user-to-casualty-to-linked-outcome`；
- `collision-severity-vs-casualty-severity-vs-outcome-basis`；
- `preliminary-provisional-annual-final-corrected-superseded-history`；
- `factor-reporter-scope-posture-and-confirmed-cause-gap`；
- `coordinate-crs-geocode-snap-coarsen-suppress-and-location-drift`；
- `count-vs-compatible-exposure-normalized-rate`；
- `hotspot-candidate-by-fixed-grid-segment-period-and-minimum-support`；
- `active-hazard-work-zone-vs-historical-collision-separation`；
- `weak-road-user-category-and-classification-drift`；
- `small-cell-sensitive-field-exact-location-and-free-text-drop-audit`；
- `schema-resource-release-licence-access-and-methodology-drift`。

每个 view 携带 definition revision、member/dataset/release、population、schema/codebook、watermark、geography/precision、coverage、suppression、rights、privacy、input snapshot 和 rebuild reason。schema、release、severity、factor、geocode、exposure 或 licence 变化只重建受影响 partition，不改写旧 evidence。

## 4. 可观测性

Telemetry 维度至少为：

`member × jurisdiction/publisher × dataset/product/resource × release/vintage/standing × schema/codebook revision × population/reporting threshold × collision/unit/person/casualty grain × severity/basis × road-user/unit kind × factor posture × location/CRS/precision × aggregate/exposure/method × privacy/rights`

记录：

- requested/returned/retained/dropped/quarantined/suppressed；
- fetch/parse/schema/type/code lookup 错误、pagination/truncation、resource missing 与 field drift；
- release lag、provisional→final gap、revision/backfill、duplicate key、record disappearance 与 tombstone；
- collision/unit/person/casualty join coverage、orphan key、cross-release join rejection；
- severity basis unknown、death-window mismatch、linked-outcome completeness 与禁止伪 outcome 计数；
- factor reporter/scope unknown、CF/RSF/schema conversion 与禁止因果/责任升级计数；
- coordinate missing/invalid/CRS mismatch、snap distance、coarsening/suppression 与 rare-event rejection；
- count/rate denominator missing、population incompatibility、small-cell suppression 与 cross-member comparison rejection；
- active hazard freshness/expiry 与 hazard→collision rejection；
- licence/attribution/rate/login/retention/correction drift、fallback rejection 与 zero effects。

告警必须按 member/dataset/resource/release 隔离。NYC 当前 API 健康不能掩盖历史版本不可追溯，STATS19 final 文件健康也不能掩盖 provisional 或 revision log 缺口。

## 5. 合成 conformance

至少验证：

1. FARS fatal collision 不扩展成“所有美国事故”；
2. probability-sample weighted row 不与 census row 去重或相加；
3. 未向警方报告的事故保持 coverage unknown，不推断为零；
4. property-damage-only 与 personal-injury population 分开；
5. crash overall severity 不覆盖每个 casualty severity；
6. police serious、injury-based serious、hospital-linked outcome 不按同名 merge；
7. 30 日后死亡不自动进入固定 30 日 fatality definition；
8. crash/unit/person/casualty只按 exact key + exact release 连接；
9. 同坐标同时间但 native ID 不同只建 candidate；
10. preliminary/provisional值保留，final/corrected通过 predecessor relation连接；
11. record 在 portal 消失不自动解释为事故未发生；
12. officer factor 保持 assertion，不升级为 root cause、fault 或 liability；
13. converted/imputed factor 与原始 reported factor 分开；
14. 精确坐标缺失时不从街道名伪造 exact point；
15. exact point 与 snapped/coarsened point不混为同一精度；
16. 三起事故形成 hotspot candidate，但没有 exposure 时不输出 risk ranking；
17. 每十万人 rate 不与每亿 vehicle-distance rate比较；
18. active work zone/hazard 不物化为 collision；
19. hazard expiry 不证明道路安全恢复或事故未发生；
20. 姓名、地址、plate/VIN/licence、free text、medical/toxicology、contact 与 rare exact point 全部 drop/quarantine。

## 6. 隐私、权利与安全

- 默认 drop 或 quarantine 姓名、详细住址、车牌、VIN、驾照/driver record、自由文本 narrative、medical/toxicology、victim/family/contact、internal police case material 与 restricted factor；
- 年龄、性别、族群、伤害、酒药因素等即使以 coded form 发布，也按 governed demographic/sensitive policy 做最小化、small-cell suppression 和 purpose binding；
- exact collision coordinate 可作为官方公开字段仍不代表适合长期稀有事件/个体画像，默认分析使用受控 grid/segment/area projection；
- NHTSA web terms、NYC Open Data terms、OGL v3、TfNSW CC BY 与 portal-specific terms 分别绑定，不能由美国政府/public data、Socrata、CKAN 或 OSS licence 相互覆盖；
- correction、overwrite、withdrawal 和 source revision 必须传播到 derived view，同时保留合法的 evidence lineage。

## 7. Probe 与副作用边界

本 Channel 没有平台 Probe。报警、提交/修改 crash 或 hazard report、呼叫 emergency/roadside service、联系警方/受害者/家属、请求执法或道路工程、修改地图/road status、订阅通知、注册/提升 API access、写入 Socrata/CKAN/MCP 或任何 admin action 都可能产生公共安全、法律、隐私、运营或账户副作用，全部保持 zero effect。主动需求测试只能走系统自有 landing page、问卷、访谈或产品实验 Channel。

## 8. 晋级顺序

1. 冻结 member/dataset/resource、population、schema/codebook、table grain/key、release/revision、severity、geocode、privacy 与 rights；
2. 先用 synthetic fixture 验证所有不可推断项与 sensitive-field drop；
3. 另行授权后只做 metadata canary，再做受限年份/地区/列的小样本 read；
4. 验证 pagination、历史覆盖、incremental watermark、overwrite/correction 和 release transition；
5. collision/unit/person/casualty exact join 与 coverage 对账通过后，才允许 record projection；
6. compatible exposure、suppression 和 method 对账通过后，才允许 rate/hotspot view；
7. operational canary 必须能因 schema、release、severity、factor、geocode、access、licence 或 privacy drift 自动 fail closed。
