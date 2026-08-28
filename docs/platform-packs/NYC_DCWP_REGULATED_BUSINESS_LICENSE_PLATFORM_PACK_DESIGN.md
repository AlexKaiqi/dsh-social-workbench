# NYC DCWP Regulated Business License Platform Pack 设计

状态：`concept-fixture + exact Socrata dataset fixtures / architecture-only`  
核验日期：2026-08-26  
Platform Pack ref：`nyc-dcwp-regulated-business-license/v0-design`

## 1. 稳定概念与官方证据

[Issued Licenses](https://data.cityofnewyork.us/Business/Issued-Licenses/w7w3-xahh)是DCWP签发许可及当前状态的population；`license_nbr`、`business_unique_id`和natural-person/organization `license_type`语义不同。[DCWP Inspections](https://data.cityofnewyork.us/Business/DCWP-Inspections/jzhd-m6uv)覆盖business、licensed vehicle/asset和Business Education visit；`inspection_status`是一次检查结果。[DCWP Charges](https://data.cityofnewyork.us/Business/DCWP-Charges/5fn4-dr26)覆盖inspection或General Counsel investigation产生的charge。charge不是最终finding，inspection pass也不是持续合规。

## 2. 概念映射

| Native | `PublicRegulatedLicense*` |
| --- | --- |
| business / individual / premises / vehicle | exact subject kind；不跨identity合并 |
| issued license / status / expiry | credential + standing + validity；非能力或营业事实 |
| inspection type / Business Education | inspection scope；education-only不等于pass |
| Pass / No Violation Issued / Violation Issued / Out of Business | exact result；非持续合规、finding或注销 |
| Enforcement inspection / General Counsel investigation | distinct origin and authority |
| charge / law section | allegation content；非sustained finding |
| phone/address/license number/name | governed personal/exact projection；普通索引drop |

## 3. 期望只读能力与边界

`definition.read`、`dataset.metadata/schema.read`、`selected-public-license.metadata.read`、`selected-public-inspection.metadata.read`和`selected-public-charge.metadata.read`仅为fixture capability。未来canary逐dataset固定NYC portal、ID `w7w3-xahh`/`jzhd-m6uv`/`5fn4-dr26`、agency ownership、schema revision、row identity/order/pagination、official base dataset、field allowlist与privacy/rights；禁止community view、任意SoQL、derived dashboard或其他DCWP dataset fallback。

申请、续期、预约/填写检查结果、投诉、hearing、payment、document、contact、subscription及status/admin write恒拒绝。

## 4. Synthetic fixtures与可观测性

Synthetic覆盖organization与individual同表、one business→multiple licenses/sites/assets、expired≠revoked、Business Education≠pass、no-entry/out-of-business、inspection→multiple charges、investigation charge without inspection、charge≠finding、name/address collision only candidate，以及identity/contact/exact address/license-number/charge narrative drop。

Telemetry逐`dataset ID × schema/source revision × subject kind × license category/standing × inspection type/result × charge origin/posture × relation × privacy/rights purpose`记录returned/retained/dropped、missing stage、schema drift、community-view rejection、quarantine和zero effects。本轮没有读取任何数据行。
