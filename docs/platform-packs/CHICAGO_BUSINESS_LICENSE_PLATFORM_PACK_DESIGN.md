# Chicago Business License Platform Pack 设计

状态：`concept-fixture + exact Socrata dataset fixture / architecture-only`  
核验日期：2026-08-26  
Platform Pack ref：`chicago-business-license/v0-design`

## 1. 稳定概念与官方证据

[Business Licenses](https://data.cityofchicago.org/Community-Economic-Development/Business-Licenses/r5kz-chrr)是BACP从2002年至今的官方base dataset。application type区分`ISSUE`、`RENEW`、`C_LOC`、`C_CAPA`、`C_EXPA`和`C_SBA`；status区分issued `AAI`、cancelled `AAC`、revoked `REV`和revocation appealed `REA`。account、site、application、license与business activity分别建模，不能用一个“企业ID”覆盖。

[2025-02 change notice](https://data.cityofchicago.org/stories/s/Change-Notice-Business-Licenses-2-20-2025/yu97-as3j/)新增community area/neighborhood字段；[2025-09 change notice](https://data.cityofchicago.org/stories/s/Change-Notice-Business-Licenses-9-25-2025/pnmi-a3z5/)又改变部分短租activity的地址发布。schema和privacy revision必须进入definition。

## 2. 概念映射

| Native | `PublicRegulatedLicense*` |
| --- | --- |
| account / site / legal entity / DBA | business entity与establishment分层；name不是identity |
| application number/type | application/change request；`RENEW`不是新主体 |
| license number/code/description | credential/category；可能一site多license |
| AAI/AAC/REV/REA | standing与appeal/finality分开；REA不是restored/current |
| start/expiration/issued/status-change | exact lifecycle dates；非actual operation |
| address/community area/neighborhood | exact vs coarse location policy；随revision重审 |

## 3. 期望只读能力与边界

`definition.read`、`dataset.metadata/schema.read`和`selected-public-license.metadata.read`仅为fixture capability。未来Socrata canary固定domain、base ID `r5kz-chrr`、schema/change-notice revision、row identity/order/pagination、application/status mapping和field allowlist；任何community-created view都拒绝。Business Owners `ezma-pppn`包含自然人owner信息，不在当前Pack allowlist。

当前没有固定inspection、complaint、charge、finding、sanction document或reinstatement的exact公共member route；对应coverage必须为missing，不能由REV/REA字段补齐。申请/续期/迁址/容量或activity变更、payment、appeal、contact及任何write恒拒绝。

## 4. Synthetic fixtures与可观测性

Synthetic覆盖one account→multiple sites/licenses、ISSUE→RENEW lineage、C_LOC/C_CAPA/C_EXPA/C_SBA不互换、AAC≠REV、REV→REA但未恢复、expired≠cancelled、schema/address publication drift、community view rejection、natural-person owner与exact address drop。

Telemetry逐`dataset ID × schema/change-notice revision × account/site/application/license/category × application type × standing/appeal posture × coarse-location/privacy/rights`记录coverage、returned/retained/dropped、orphan lineage、mapping drift、quarantine和zero effects。本轮没有读取数据行。
