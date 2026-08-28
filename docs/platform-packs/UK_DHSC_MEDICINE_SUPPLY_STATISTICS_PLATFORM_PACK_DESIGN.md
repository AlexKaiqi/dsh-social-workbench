# UK DHSC Medicine Supply Disruption Statistics Platform Pack 设计

状态：`researched / concept+official-aggregate-route-fixture / no-local-binding`  
核验日期：2026-08-26  
Pack ref：`uk-dhsc-medicine-supply-statistics/v0-design`

## 1. 产品、概念与价值

本Pack描述UK Department of Health and Social Care发布的[medicine supply disruption statistics](https://www.gov.uk/government/statistics/medicine-supply-disruption-statistics-uk-data-to-june-2026)及[resilience data pack](https://www.gov.uk/government/publications/managing-a-robust-and-resilient-supply-of-medicines-data-pack)。官方统计给出pharmaceutical suppliers通过DaSH portal提交的supply issue/discontinuation notification月度数量及root-cause aggregates，并提供方法学和ODS tables。

它的独特价值是稳定、可引用的aggregate趋势与定义，不是逐medicine公共registry。notification count不等于unique shortage、unique product、company、patient、prescription、unmet unit或market demand。

## 2. 能力与统计契约

concept capabilities为publication discovery、HTML methodology read、ODS table download discovery、release/revision history和aggregate measure read。route fixture固定release、coverage window、geography、reporting portal population、notification unit、root-cause taxonomy、revision status、table/sheet/cell schema、missing/suppression policy、licence和valid window。

DaSH是supplier reporting portal，不是本Pack读写route；不登录、不提交。Medicine Supply Notifications及其他NHS/DHSC communications也不自动与DaSH notification或统计行合并。

GOV.UK页面声明除另有说明外适用Open Government Licence v3.0；每个附件仍固定其licence/attribution和方法学revision。aggregate没有产品identity时不得与FDA/TGA等event records做record-level common-origin，只能在共同定义的高层view中并列。

## 3. Fixture与晋级

synthetic fixture覆盖monthly notifications、revised release、root-cause table、missing/suppressed cell、window overlap、notification-vs-shortage denominator、ODS sheet drift、DaSH write-route refusal和zero writes。Telemetry按`release × table/sheet × measure definition × period/geography × methodology/licence revision`记录revision、cell/schema mismatch、coverage和denominator conflicts。

aggregate-only canary需用户批准；不得从统计推断具体产品、企业、患者或医疗行动。DaSH login/report、supplier contact和任何平台副作用拒绝。
