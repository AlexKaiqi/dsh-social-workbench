# US EPA SDWIS / ECHO SDWA Platform Pack 设计

状态：`concept-fixture + exact official bulk/schema fixture / architecture-only`  
核验日期：2026-08-26  
Platform Pack ref：`us-epa-sdwis-echo/v0-design`

## 1. 稳定概念与官方合同

[SDWA Data Download Summary](https://echo.epa.gov/tools/data-downloads/sdwa-download-summary)把SDWIS定义为PWSS program下public water systems的monitoring、enforcement与violation system。quarterly ZIP包含PWS、facility、geographic/service area、site visit、event/milestone、lead/copper、public-notification及violations/enforcement等CSV，并以`SUBMISSIONYEARQUARTER + PWSID`及各table key形成历史snapshot关系。

[Primacy Agency Data](https://www.epa.gov/DWdata/primacy-agency-drinking-water-data)说明PWS先向state/tribe/territory primacy agency报告，只有subset进入federal SDWIS；primacy data可更及时、更细，但成员与覆盖不一致。[Dashboard Help](https://echo.epa.gov/help/drinking-water-qlik-dashboard-help)又明确约三个月lag，特定violation实时状态应向implementing authority或PWS确认。

## 2. 概念映射

| Native | `PublicDrinkingWaterSafety*` |
| --- | --- |
| PWSID / facility / service area | system、component、service-area exact identity；quarter revision固定 |
| community/non-community type / population | supply kind + population basis；不是unique exposed people |
| MCL/MRDL/TT/MR requirement | standard kind与applicability |
| violation category/status/originator | compliance posture、origin/finality与resolution basis |
| health-based indicator | source taxonomy only；不是illness/exposure |
| public notification tier | regulatory notification requirement；不是consumer notice已送达 |
| enforcement / RTC date | action与return assertion；Resolved可能有多种basis |

## 3. 期望能力与边界

`definition.read`、`quarterly ZIP/schema.read`、`selected PWS/violation metadata.read`只作fixture。未来canary固定exact ZIP/table、submission quarter、PWS population、join keys、code dictionary、lag/known-alert、field allowlist和retention；禁止ECHO dashboard robot、old Envirofacts wrapper、community MCP及跨primacy fallback。

Federal SDWIS缺少部分sample-level detail且可能滞后；不能由missing row、Archived、Resolved或inactive推断当前安全。exact service area/facility coordinates、critical infrastructure、contact/comments/documents和raw values先治理。report/public-notification/contact/subscribe/admin/write全部拒绝。

## 4. Synthetic conformance与遥测

Fixtures覆盖same PWS across quarters、community→inactive、MCL vs monitoring/reporting violation、system-generated vs state-origin finding、addressed/unaddressed/resolved/archived、resolution because rule not applicable、public-notification requirement without delivery proof、site visit without compliance conclusion和federal-vs-primacy coverage gap。

Telemetry按`ZIP/table × quarter/schema/code revision × PWS/component × standard/violation category/status/origin × enforcement/RTC × coverage/lag/rights`记录returned/retained/dropped/quarantined、orphan join、quarter correction、missing subset、unsafe upgrade rejection与effects=0。本轮未下载ZIP或请求PWS行。
