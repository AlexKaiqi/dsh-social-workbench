# FDA openFDA Enforcement Reports Platform Pack 设计

状态：`researched / concept+native-route-fixture / no-local-binding`  
核验日期：2026-08-26  
Pack ref：`fda-openfda-enforcement/v0-design`

## 1. 产品与population

本Pack只描述openFDA公开enforcement report products。官方[food enforcement overview](https://open.fda.gov/apis/food/enforcement/)说明其来源是Recall Enterprise System、公开记录从2004年至今、每周更新，并可能改名字段和转为JSON。food、drug、device enforcement以及device recall是不同endpoint/population，不能以共同`event_id`假定完整或同一representation。

FDA说明recall通常由firm自愿发起，也可能在FDA提出关切、正式请求或命令后发起；FDA监督strategy、进行hazard classification和adequacy assessment。classification之后进入Enforcement Report，但该页面还明确警告此数据不应用于公共alert或追踪recall lifecycle，且published status不会继续更新。因此“open/completed/terminated”只保存为source-declared state，不能冒充最新处置事实。

## 2. 概念与字段边界

| Native concept | `PublicProductRecall*` | 约束 |
| --- | --- | --- |
| `event_id` / `recall_number` | event/report/recall identity | 一个event可有多个product report；不得按title/firm合并 |
| `classification` | risk native class | Class I/II/III不是实际injury count或医疗建议 |
| `voluntary_mandated` | action mandate | 保留native值和mapping revision，不由文本猜测 |
| `reason_for_recall` / description / code info | defect/product/affected range spans | lot/code/date range必须精确定位；不扩张到未列产品 |
| distribution / quantity | scope/quantity content | 不是recovered quantity或market denominator |
| initiation/report/termination/status | schedule/native lifecycle | status可能停止更新；termination不证明所有单位已回收 |

firm/manufacturer/operator只作机构authority ref，不进入person/lead graph；consumer contact、地址和个人信息默认drop。openFDA [authentication](https://open.fda.gov/apis/authentication/)的HTTPS、key和rate policy属于未来route definition，不等于当前授权。

## 3. 开源、Fixture 与晋级

[FDA/openfda@fdbe543](https://github.com/FDA/openfda/tree/fdbe54327901a0c1e30130d1d6a2bbe67b79b77c)是官方pipeline/API source，可静态见证provider transformation；根许可证未发现，所以不vendoring、不执行。社区[openFDA Skill@95be136](https://github.com/synthetic-sciences/openscience/tree/95be136c06386eb18546ce94d134d2c7e66976ac/backend/cli/skills/databases/fda-database)即使为Apache-2.0也不获得FDA authority或数据用途许可。

synthetic fixture覆盖event→multiple enforcement reports、food/drug/device population隔离、field rename drift、voluntary/requested/ordered、class/status、expanded lots correction、missing values、API rate block和zero report/contact/write。Telemetry按`endpoint × schema revision × event × report × product × native status/class`记录coverage、lag、field completeness、correction lineage与rights。真实metadata canary也需用户批准；medical alert、full lifecycle inference和durable corpus不因此开放。
