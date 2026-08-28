# England & Wales DWI Drinking Water Platform Pack 设计

状态：`concept-fixture + exact official report/schema fixture + selected-manual / architecture-only`  
核验日期：2026-08-26  
Platform Pack ref：`england-wales-dwi-drinking-water/v0-design`

## 1. 稳定概念与representation

[Drinking Water 2025](https://www.dwi.gov.uk/what-we-do/annual-report/drinking-water-2025/)分别发布England/Wales public supplies与private supplies、company performance及annual summary。[Annex B](https://www.dwi.gov.uk/what-we-do/annual-report/drinking-water-2025/drinking-water-2025-summary-of-the-chief-inspectors-report-for-drinking-water-in-wales/annex-b-compliance-with-standards/)按treatment works、service reservoir、consumer tap/zone、parameter、standard、test count与failure count呈现aggregate；单个failure、annual percentage与company compliance不是同一representation。

[quality events](https://www.dwi.gov.uk/what-we-do/annual-report/drinking-water-2025/drinking-water-2025-summary-of-the-chief-inspectors-report-for-drinking-water-in-england/drinking-water-quality-events/)由company notification触发，再由Inspectorate investigation/classification/assessment；有些事件来自consumer distribution system且未证明unwholesome water进入public supply。[2024 file specification](https://dwi.gov.uk/wp-content/uploads/2024/08/Annex-A-File-specification.pdf)定义company向DWI提交的CSV/XLSX schema，但这是监管submission contract，不是public read API。

## 2. 概念映射

| Native | `PublicDrinkingWaterSafety*` |
| --- | --- |
| company / works / reservoir / zone / tap | supplier、treatment、storage、zone、sampling stage |
| public vs private supply | separate published populations |
| parameter standard / tests / failures | standard + aggregate numerator/denominator；无individual result inference |
| compliance sample failure | comparison/failure；按regulation scope决定violation |
| notified event / ERI / final classification | event origin、severity、finality与DWI authority |
| legal instrument / recommendation | enforcement/action；不等于restoration |
| consumer contact | consumer concern population；不是独立event或quality fact |

## 3. 能力、安全与Conformance

`definition.read`、`annual report/table/schema.read`与`selected event/legal instrument metadata.read`只作fixture/manual。未来machine route必须另有DWI明确public download contract；不得把company submission portal/schema当read authority，也不得抓取consumer contacts、case documents或company websites补齐。

Synthetic fixtures覆盖same parameter at works/reservoir/tap with different standards、aggregate 100% hiding sparse coverage、test failure→investigation but no confirmed supply impact、company-notified event→DWI final classification、consumer-side origin、legal instrument open/closed及public/private supply denominator separation。

Telemetry按`report/table × year/schema/regulation revision × public/private population × company/component/stage × parameter/standard × tests/failures × event origin/classification × enforcement × coverage/rights`记录retained/dropped/quarantined、denominator mismatch、stage incompatibility、missing detail、fallback rejection与effects=0。本轮未请求company/sample/event数据行。
