# Public Ambient Air Quality, Health Advisories & Pollution Events Channel Pack 设计

状态：`architecture-only / synthetic-conformance / zero-platform-effects`  
核验日期：2026-08-26  
Channel Pack ref：`public-ambient-air-quality-advisories/v0-design`

## 1. 目标与共同事实模型

本Channel用于发现monitoring coverage、data quality、index解释、forecast、event attribution、health communication、alert lifecycle和regulatory assessment中的需求与痛点。它统一`PublicAmbientAirQuality*` projection，但不统一jurisdiction、network population、station representativeness、method、quality stage、index formula、forecast model、alert authority、legal standard、denominator或rights。

```text
network -> station -> monitor/method -> pollutant observation
                               |          [unit + statistic + averaging + quality + revision]
                               +-> aggregate / model / interpolation / gap fill

observation/model -> exact index definition -> pollutant subindex -> overall category
                  \-> forecast [issue + amendment + valid window + uncertainty]

observation/index/forecast -> episode candidate -> cause attribution
                           \-> trigger match != issued advisory
authority message -> statement/advisory/alert/update/ending -> audience health guidance

validated aggregate -> exact legal standard + completeness + zone + period
                    -> authority attainment/exceedance assessment
```

只有source-declared exact relation可连线；station名称、坐标邻近、reporting-area/forecast-area polygon重叠、相同pollutant/unit或provider统一结果最多形成restricted candidate。

## 2. Connector能力路由

| Capability | 设计状态 | 硬边界 |
| --- | --- | --- |
| `ambient-air-quality.definition.read` | knowledge/fixture | exact member/product/deployment/network/index/methodology/authority/revision |
| `ambient-air-quality.resource-schema.read` | knowledge/fixture | exact API/feed/file/service、schema、quality/lag/history、rights/data-use alert |
| `ambient-air-quality.selected-record.read` | manual fixture | approved exact span；user location/private sensor/contact/full message/raw high-frequency value先治理 |
| `ambient-air-quality.conformance` | synthetic | 手写fixture，zero network/platform data |
| `ambient-air-quality.public-read` | future gated | 逐member/product/resource/purpose批准；不得在AirNow↔AQS、E1a↔E2a、old↔new UK service间fallback |
| `ambient-air-quality.federated-read` | future restricted | 逐contributing agency/network/area roster、coverage、rights和field allowlist |
| station/sensor registration、submission、incident report、alert issue/update/end、subscribe/contact/complaint/API signup/admin/write | denied | 数据、公共卫生、紧急消息、费用、通知或资源副作用 |

requested=4、concept=4、machine/bulk route fixture=4、index/methodology fixture=4、alert/advisory machine-route fixture=2、manual=4、callable=0、durable=0。OSS、MCP和Skill不提高member成熟度。

## 3. Snapshot、分析库与动态物化

Dolt类snapshot保存Platform Pack、definition/index/method/product revision、authority/contributor/network/station-context/pollutant/method/unit/statistic/averaging/quality/production/forecast/event/advisory/health/compliance taxonomy、schema/resource digest、route retirement/migration、publication/correction lag、known alert、rights/data-use/message-integrity/retention policy、opaque identity/relation、decision、lineage和tombstone。分析库只接获准必要精度metadata；user-entered location、private sensor、sensitive facility、person/contact、full alert body和raw high-frequency values默认不进入。

动态物化视图至少包括：

- `network-station-monitor-method-pollutant-identity-lineage`；
- `station-context-and-spatial-representativeness-vs-requested-area-gap`；
- `observation-by-method-unit-statistic-averaging-production-quality-and-revision`；
- `preliminary-screened-corrected-validated-invalid-superseded-lineage`；
- `measured-vs-modelled-assimilated-downscaled-interpolated-gap-filled-separation`；
- `index-definition-formula-breakpoint-pollutant-coverage-special-mode-revision`；
- `subindex-to-overall-index-completeness-and-dominant-pollutant-audit`；
- `us-aqi-uk-daqi-european-aqi-canada-aqhi-noncomparability`；
- `observation-nowcast-daily-history-forecast-validity-separation`；
- `forecast-issue-amendment-lead-time-uncertainty-and-expiry`；
- `episode-observation-support-vs-cause-attribution-posture`；
- `trigger-match-vs-issuer-statement-advisory-alert-gap`；
- `alert-issue-update-cancel-expire-end-and-message-integrity-lineage`；
- `general-vs-at-risk-health-guidance-and-short-vs-long-term-risk`；
- `index-or-hourly-high-value-vs-legal-standard-completeness-zone-period-gap`；
- `hours-stations-areas-people-episodes-forecasts-alerts-denominator-separation`；
- `user-location-private-sensor-sensitive-facility-person-contact-message-raw-value-drop-audit`；
- `member-product-schema-index-quality-route-retirement-lag-rights-drift`。

schema、quality flag、index formula/breakpoint、forecast product、station/area boundary、alert taxonomy/issuer、standard、publication/correction lag、route retirement、security/privacy/rights或data-use guideline变化只失效受影响partition，不做全局last-write-wins。

## 4. 可观测性与验证阶梯

每次fixture/conformance按`member × exact product/resource × definition/index revision × network/station-context/monitor/method × pollutant/unit/statistic/averaging × production/quality/revision × index basis/completeness × forecast issue/validity × event/attribution × advisory/standing/issuer × health audience/horizon × standard/comparison/compliance × coverage × rights/data-use/message-integrity`记录requested/returned/retained/dropped/quarantined、missing/late/corrected/superseded、model-substitution、partial-index、incompatible comparison、authority conflict、trigger-without-alert、route retirement、fallback rejection、rights expiry与effect count。

验证阶梯：official evidence review → static contract → synthetic fixture conformance → 另行批准的sandbox live → 另行批准的operational canary。任一级失败只降级对应member/product/resource，不以dashboard robot、commercial provider、community MCP/Skill、model fill、相邻station或另一quality stage补绿。

Conformance必须拒绝：station→postcode/area/person exposure、same unit→comparable、preliminary→validated、model/gap-fill→measurement、partial subindex→complete overall index、cross-index numeric comparison、NowCast→daily history、forecast→observation/advisory、trigger→issued alert、high index→legal exceedance、episode→confirmed cause、health guidance→diagnosis/harm、alert ended→zero residual pollution，以及public visibility→all-field durable profiling right。

## 5. Skills与Probe

仅设计`public-ambient-air-source-contract-research/v1`与`public-ambient-air-conformance/v1`；future read Skill只有逐member/product/resource/purpose批准后才可存在。本Channel没有平台Probe，主动测试必须使用系统自有实验面。

依据与OSS审计见[平台分流](./PUBLIC_AMBIENT_AIR_QUALITY_ADVISORIES_TRIAGE_2026-08-26.md)，成员见[US EPA](./US_EPA_AIRNOW_AQS_PLATFORM_PACK_DESIGN.md)、[UK Defra](./UK_DEFRA_AMBIENT_AIR_PLATFORM_PACK_DESIGN.md)、[EEA](./EEA_AMBIENT_AIR_PLATFORM_PACK_DESIGN.md)和[Canada ECCC](./CANADA_ECCC_AQHI_ALERTS_PLATFORM_PACK_DESIGN.md)。
