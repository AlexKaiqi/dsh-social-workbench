# New Zealand Taumata Arowai / Hinekōrako Drinking Water Platform Pack 设计

状态：`concept-fixture + exact official report-XLSX fixture + public-register manual / architecture-only`  
核验日期：2026-08-26  
Platform Pack ref：`new-zealand-taumata-arowai-drinking-water/v0-design`

## 1. 稳定概念与coverage

[Public registers](https://www.taumataarowai.govt.nz/for-the-public/public-registers)指向Hinekōrako official drinking-water supply register；部分既有supplies可到2028前才需登记，因此absence不是无supply。register中的lapsed表示未定期确认/更新，信息可能过期；公共利益、privacy或supply security可导致withholding。

[Water services insights](https://www.taumataarowai.govt.nz/about-us/reports-and-publications/water-services-insights-and-performance)提供supplier-reported Drinking Water Regulation Reports与部分supply summary/detailed XLSX。[Notify us](https://www.taumataarowai.govt.nz/drinking-water-suppliers-and-operators/notify-us)说明supplier和laboratory各有non-compliant/unsafe/notifiable event报告义务；[notice guidance](https://www.taumataarowai.govt.nz/drinking-water-suppliers-and-operators/for-drinking-water-suppliers/how-to-guidance/issuing-a-drinking-water-notice)把boil、do-not-drink、do-not-use与actual supplier communication/lift分开。

## 2. 概念映射

| Native | `PublicDrinkingWaterSafety*` |
| --- | --- |
| supplier / supply public ID | exact supplier/system registration identity |
| current/lapsed/withheld/not-yet-required | registration standing与coverage，不推potability |
| source/treatment/service area/document | components/relations；location/document先security gate |
| supplier-reported regulation XLSX | exact reporting population/revision/aggregate |
| lab vs supplier notification | separate origin authority |
| informational/BWN/DND/DNU | advisory kind与instruction |
| consumer advisory in place/lifted | standing与issuer authority；不推exposure/illness |

## 3. 能力与社区Skill审计边界

`definition.read`、`report XLSX/schema.read`、`selected supply registration.read`和`selected notice metadata.read`只作fixture/manual。Hinekōrako public UI不是documented API；禁止Power Pages reverse-engineering、HTML crawler、community Skill fallback、documents bulk discovery或nearby inference。

社区[drinking-water-register-nz Skill](https://github.com/thecolab-ai/.skills/tree/a9bc79239ce64cad1f710c94ce5ebb373830fb05/skills/drinking-water-register-nz)正确声明registration≠safety、missing document≠noncompliance且near unsupported，但自身为community HTML wrapper并标记degraded；只能借鉴bounded result/stable failure，不能成为Connector。

## 4. Synthetic conformance与遥测

Fixtures覆盖current/lapsed/withheld/not-yet-required、supplier change、missing public document、same supply in report/register revisions、lab and supplier duplicate notification、potential risk without confirmed detection、BWN/DND/DNU、supplier lift与reissue，以及security-redacted component/service area。

Telemetry按`register/report-XLSX resource × schema/reporting year × supplier/supply/component × registration × notification origin × advisory kind/standing × coverage/security/privacy/rights`记录returned/retained/dropped/quarantined、withheld/lapsed/missing population、duplicate origin、schema drift、fallback rejection与effects=0。本轮未请求register rows、documents或XLSX data。
