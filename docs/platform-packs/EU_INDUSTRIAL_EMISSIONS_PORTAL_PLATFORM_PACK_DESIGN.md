# EU/EEA Industrial Emissions Portal Platform Pack 设计

状态：`concept-fixture + exact bulk dataset fixture / architecture-only`  
核验日期：2026-08-26  
Platform Pack ref：`eu-eea-industrial-emissions-portal/v0-design`

## 1. 稳定概念与官方证据

[Industrial Emissions dataset](https://industry.eea.europa.eu/industrial-emissions/dataset)组合EU Registry行政/位置数据和E-PRTR/LCP年度release、transfer、energy与emission reporting；[EEA Datahub](https://www.eea.europa.eu/en/datahub/datahubitem-view/9405f714-8015-4b5b-a63c-280b82861b3d/folder_contents)提供2007–2024版本化CSV/XLS、metadata与DOI。数据由设施年度上报、主管机关汇编和质量检查，但不因此成为permit limit或compliance determination。

[About](https://industry.eea.europa.eu/industrial-emissions/about)说明activity capacity与pollutant/waste reporting threshold共同限定population；国家/年份、土地排放和production volume存在缺口。新Regulation 2024/1244计划从2028起将reporting unit从facility改为installation，不能靠名称/坐标延续身份。

## 2. 概念映射

| Native | `PublicEnvironmentalRegulation*` |
| --- | --- |
| industrial site / facility / installation | 三种subject identity；按报告制度与年份版本化 |
| activity and capacity threshold | reporting population；不是permit condition |
| pollutant release to air/water/land | annual release inventory，绑定pollutant/media/year/unit/method |
| off-site transfer / waste transfer | transfer type；不与on-site release合并 |
| measured/calculated/estimated method | value derivation；与facility reporting basis分开，缺失时unknown |
| confidential field/grouped pollutant | withheld qualifier与coverage gap |

## 3. 期望能力与边界

`definition.read`、`bulk-resource/schema.read`和`selected-public-inventory.metadata.read`仅为fixture capability。future bulk canary固定Datahub resource/version/digest、reporting obligation、schema、threshold、country/year coverage、method/confidentiality、CC-BY 4.0 attribution和facility→installation migration。

本Pack明确拒绝把年度total与permit limit直接比较，也不生成exposure、health impact、“top polluter”或noncompliance标签。permit application/condition、measurement、inspection、violation和enforcement coverage均保持missing，不得由E-PRTR值补齐。

## 4. Synthetic fixtures与可观测性

Synthetic覆盖same site→multiple facilities/installations、annual threshold进出population、air/water/land与off-site transfer隔离、measured/calculated/estimated/unknown、confidential grouped pollutant、missing country-year、2007–2016 mapped history、UK reporting break和2028 unit migration。

Telemetry逐`dataset version × obligation × reporting year × country × site/facility/installation × activity/threshold × pollutant/media/transfer × measurement-kind/derivation/reporting-basis/unit × confidentiality/coverage`记录retained/dropped/quarantined、schema/identity drift、attribution和zero effects。本轮没有下载数据文件或行。
