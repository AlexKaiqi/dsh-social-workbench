# Ireland National Planning Applications Platform Pack 设计

状态：`concept-fixture + exact ArcGIS route fixture with catalogue drift / architecture-only`
核验日期：2026-08-26
Platform Pack ref：`ireland-national-planning-applications/v0-design`

## 1. 稳定概念与官方证据

[National Planning Applications](https://data.gov.ie/dataset/national-planning-applications)由Department of Housing发布，标注CC BY 4.0、全国范围、weekly更新及ESRI REST/GeoJSON resource；其exact landing为[IrishPlanningApplications FeatureServer](https://services.arcgis.com/NzlPQPKn5QF9v2US/arcgis/rest/services/IrishPlanningApplications/FeatureServer)。2026年更新的[IrishPlanningApplications catalogue](https://data.gov.ie/dataset/irishplanningapplications1)又说明它是participating local authorities规划登记的合并视图、包含2012年以来application，和旧项的2010起始、resource更新时间形成明显metadata drift。

因此成员定义必须同时固定catalogue record、ArcGIS service/layer、participating-authority roster、temporal coverage、refresh watermark和license evidence。一个catalogue项或FeatureServer响应不能自动证明所有local authority、所有历史申请、每个字段或document/representation population完整。

[planning.localgov.ie用户指南](https://planning.localgov.ie/sites/default/files/content-page/attachments/LGMA_User_Guide.pdf)说明用户可对valid application作observation/submission。它是独立写surface；没有官方exact relation前，不能推断public submission与NPAD feature一一对应，也不能把表单能力补成representation read capability。

## 2. 概念映射

| Native | `PublicPlanningApplication*` |
| --- | --- |
| planning application feature | application + local-authority jurisdiction identity |
| point / polygon layers | spatial representation；exact geometry默认restricted |
| participating local authorities | member population denominator，不等于全体authority |
| weekly/update metadata | refresh/watermark contract；冲突catalogue形成drift |
| ArcGIS REST / GeoJSON | common-origin representations；不能重复计数 |
| observation/submission surface | formal write surface；不是当前read/Probe |
| CC BY 4.0 | dataset licence；不自动覆盖third-party documents/personal data |

data.gov.ie开放许可指引排除未经匿名化的personal data，并不授予第三方权利；地址、geometry、applicant/agent、documents和submission content必须逐字段/逐artifact复核。

## 3. 期望只读能力

`definition.read`、`catalogue.metadata.read`、`service/layer.schema.read`、`selected-public-application.metadata.read`与`spatial-coverage.metadata.read`为route fixture only，当前无PortBinding。未来canary锁定exact service/layer ID、catalogue revision、participating-authority roster、temporal coverage、outFields allowlist、where clause、geometry=false或coarsening、pagination/order、rights、purpose、retention和deletion。通用ArcGIS MCP的arbitrary host/layer、geocode/reverse-geocode与credential modes不允许作为fallback。

## 4. Synthetic fixtures、可观测性与zero effects

Synthetic覆盖2010/2012 metadata conflict、old/new duplicate catalogue、participating authority missing、point/polygon common origin、local register update late、feature deleted/changed、exact address/coordinate/parcel drop、dataset CC BY≠document reuse、submission UI≠NPAD relation及ArcGIS layer/schema drift。

Telemetry逐`catalogue × service/layer × participating-authority roster × temporal/refresh revision × representation × geometry/location policy`报告returned/retained/dropped、catalogue conflict、missing authorities、watermark lag、common-origin、quarantine、fallback rejection与zero writes。本轮没有调用FeatureServer query或读取任何feature row。observation/submission、attachment、application、payment、appeal、contact、subscribe与edit/admin全部拒绝。
