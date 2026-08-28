# EMA Medicine Shortages Catalogue / ESMP Platform Pack 设计

状态：`researched / concept+selected-public-record-fixture / restricted-report-route-only / no-local-binding`  
核验日期：2026-08-26  
Pack ref：`ema-medicine-shortages/v0-design`

## 1. 产品、概念与价值

本Pack严格区分两个产品面：EMA[public shortages catalogue](https://www.ema.europa.eu/en/human-regulatory-overview/post-authorisation/medicine-shortages-availability-issues/public-information-medicine-shortages)公布EMA评估的ongoing/resolved shortages；[ESMP](https://www.ema.europa.eu/en/human-regulatory-overview/post-authorisation/medicine-shortages-availability-issues/european-shortages-monitoring-platform-esmp)收集NCA与MAH在routine、preparedness和crisis场景的availability/supply/demand报告。

public catalogue不是全部EU/EEA shortages。nationally authorised products通常由member-state authorities处理，EMA页面也列出独立national registers。一个EU-level record和多个national records只有exact identifier/evidence才能建立common origin。

## 2. 能力与权限边界

public concept capabilities为ongoing/resolved catalogue navigation、selected record/document/communication read及national-register discovery。当前未发现版本化public catalogue API contract，所以只设计selected public-record/manual fixture，不采用页面内部JSON或community scraper。

ESMP的M2M API是reporting capability，不是public read capability。[ESMP页面](https://www.ema.europa.eu/en/human-regulatory-overview/post-authorisation/medicine-shortages-availability-issues/european-shortages-monitoring-platform-esmp)要求MAH/NCA账户和role；[API specification](https://www.ema.europa.eu/en/documents/other/european-shortages-monitoring-platform-esmp-application-programming-interface-api-specifications_en.pdf)描述OpenAPI 3.0.1报送结构。它只作为概念/能力知识保存，永不路由到普通Connector，也不进入Probe。

公开record的medicine、extent/reason/status、patient/HCP communication、recommendation和document分别做rights与authority。recommendation只保留source content，不转换成个体医疗建议。public catalogue、ESMP submission、MSC、national register不是同一population。

## 3. OSS、Fixture与晋级

[openpharma-org/ema-mcp@3d340f7](https://github.com/openpharma-org/ema-mcp/tree/3d340f73f83ff3d07aea075c1d22a95e9fee9b6e)是MIT community MCP，可见证`get_supply_shortages`工具形状；其“real-time/public JSON API”主张必须逐route与EMA官方材料对照，当前不安装、执行或提升为binding。

synthetic fixture覆盖EU vs national population、ongoing→resolved、MAH claim vs EMA assessment、record/MSC/document relation、member-state duplicates、public catalogue无machine route、ESMP read/write confusion拒绝、clinical-advice exclusion和zero writes。Telemetry按`surface/population × record × authority/status × representation × rights revision`记录route absence、authority conflict、coverage gap和restricted-port block。

只有在EMA发布稳定public machine contract或用户批准selected-record canary后才能提升读取成熟度。ESMP credential、submission/update、crisis reporting和任何医疗建议永久不随public read自动晋级。
