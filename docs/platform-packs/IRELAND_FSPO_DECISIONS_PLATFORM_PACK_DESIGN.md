# Ireland FSPO Legally Binding Decisions Platform Pack 设计

状态：`researched / concept+selected-record-fixture / no-local-binding`  
核验日期：2026-08-26  
Pack ref：`ireland-fspo-decisions/v0-design`

## 1. 概念与价值

[FSPO decision database](https://www.fspo.ie/complaint-outcomes/investigation-services/legally-binding-decisions/display.asp)公开financial services与pensions的legally binding decisions，可按sector、product/service、conduct、outcome、year和decision reference筛选。它能揭示claim handling、information、fees、service与pension administration中的正式纠纷和救济。

| Native concept | `PublicDisputeDecision*` | 约束 |
| --- | --- | --- |
| complaint/investigation | case/lifecycle | settled/withdrawn与formal decision分开 |
| preliminary decision | preliminary stage | parties可提交意见，不是final binding decision |
| legally binding decision | final + source-declared-binding | 仍可能在35日内statutory appeal |
| upheld/substantially/partially/not upheld | native outcome + family | 不代表全部complaint population |
| compensation/rectification direction | remedy | domain-specific power、direction与implementation分开 |
| active statutory appeal | appeal relation/state | pending appeal影响publication/compliance解释 |

## 2. Procedure、publication与remedy fixture

[FSPO services](https://www.fspo.ie/our-services/)说明preliminary decision经双方意见后才形成legally binding decision，任一方可在35日内向High Court上诉；[investigation services](https://www.fspo.ie/complaint-outcomes/investigation-services/)固定formal outcome；[compensation and redress](https://www.fspo.ie/complaint-outcomes/Compensation/)区分financial-service与pension complaint的remedy powers。发布政策还要求complainant和provider不被name/address识别，并延迟或暂缓有pending appeal的decisions；因此public database不是全部issued-decision或complaint denominator。

当前只有selected official-record fixture，不调用database query、不下载PDF、不读取active appeals list。HTML form/internal query参数不升级成API contract。

## 3. 隐私、物化与验证

ordinary projection drop complainant与provider name/address、自然人信息、account/policy/claim ref及可重识别case detail；provider仅保留scope-local opaque ref。不得以decision counts形成provider ranking。

synthetic fixtures覆盖preliminary→binding final、35-day appeal pending、appealed decision withheld、upheld with compensation direction、pension remedy power不同、direction未验证implementation/payment、provider/complainant identity drop、database/PDF common-origin、route unavailable无fallback和complaint/appeal/contact zero effects。真实record、PDF、appeal或durable materialization均需另批。
