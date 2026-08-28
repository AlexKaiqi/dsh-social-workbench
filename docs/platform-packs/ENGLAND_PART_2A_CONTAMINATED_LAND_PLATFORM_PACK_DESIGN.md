# England Part 2A Contaminated Land / EA Special Sites Platform Pack 设计

状态：`concept-fixture + exact official XLSX fixture + federated-manual / architecture-only`  
核验日期：2026-08-26  
Platform Pack ref：`england-part-2a-contaminated-land/v0-design`

## 1. 稳定概念与coverage

[Part 2A statutory guidance](https://www.gov.uk/government/publications/contaminated-land-statutory-guidance)约束local authority对法律意义`contaminated land`的判定与reasonable remediation；历史工业用途、污染物存在或接受调查都不自动达到法律门槛。[UKHSA factsheet](https://www.gov.uk/government/publications/use-of-potentially-contaminated-residential-land-gardens-and-allotments/contaminated-land-in-residential-settings-factsheet)要求source-pathway-receptor contaminant linkage与use-specific risk，并指出实际determination数由各council分别持有。

[EA Special Sites dataset](https://environment.data.gov.uk/dataset/f7971865-e434-4743-ab60-51cc25714971)只包含截至2025-12-31由local authorities designated的Special Sites及部分terminated sites；XLSX受OGL及attribution约束。这是全国子集，不是全部Part 2A determinations、potential sites、planning remediation或England contaminated land。

## 2. 概念映射

| Native | `PublicContaminationRemediation*` |
| --- | --- |
| potential/historic land | potential posture；不是legal determination |
| pollutant/contaminant linkage | hazard/source、pathway、receptor与current-use risk assessment |
| local authority determination | authority-confirmed statutory designation |
| special-site designation | listing/authority transfer relation；不是新的污染观测 |
| remediation notice/statement/declaration | action/authority/completion posture分别映射 |
| appeal/conviction | review/enforcement relation；不自动改写designation |
| termination/revocation | listing standing与effective time；历史仍保留 |

## 3. Federated route边界

`definition.read`、`EA special-sites XLSX schema.read`和`selected local-register entry.read`为fixture/manual capability。未来federated read必须先有exact local-authority roster、register URL/resource、Part 2A population、last-reviewed time、rights/attribution、representation与missing coverage；不存在“全国无结果即无场地”的查询。

不得把planning-system investigation/remediation、commercial property search或alpha planning-data geography当Part 2A register。地址/geometry、residential/community detail、appropriate-person identity与documents先field gate；contact、environmental search order、complaint、appeal及全部write/effect拒绝。

## 4. Synthetic conformance与遥测

Fixtures覆盖potential-but-not-determined、Category/risk boundary、local determination→special-site authority transfer、multiple designation areas、remediation statement without unrestricted-use claim、appeal/stay、termination、local register with no entries、unavailable register和EA subset gap。

Telemetry按`EA/local-authority resource × legal/process/schema revision × population × site/designation × pathway/receptor/use × action/completion × authority × federated coverage/rights`记录missing local member、stale register、termination/history、boundary drift、drop/quarantine、fallback rejection与effects=0。本轮未下载XLSX或地方文件。
