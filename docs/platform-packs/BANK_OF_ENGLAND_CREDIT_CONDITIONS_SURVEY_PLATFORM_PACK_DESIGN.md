# Bank of England Credit Conditions Survey Platform Pack

## 1. 稳定概念

本成员描述Bank of England Credit Conditions Survey（CCS）公开聚合，调查对象是banks和building societies等lenders，而不是borrowers。

- CCS自2007 Q2开始，quarterly release同时描述past three months与expected next three months；expectation只是方向和幅度指标，不是realised outturn。
- lender responses先按“a lot”与“a little”赋分，再按market share加权并计算范围为±100的net percentage balance。
- positive balance的含义随问题变化：credit availability/demand/default可能表示increase，而terms/conditions可能表示cheaper或looser；不能设全局`positive=tightening`。
- corporate lending区分small businesses、medium PNFCs、large PNFCs和OFCs，并覆盖availability、demand、spreads、fees、collateral、credit lines、covenants、drawdowns、defaults与LGD。
- question wording、firm-size definition、fieldwork window和sign convention变化会产生新definition revision；2009的sign backcast必须保留lineage。
- published balances是lender assessments，不是actual credit volume、individual default、loan price或企业融资申请。

官方入口：[2026 Q2 release](https://www.bankofengland.co.uk/credit-conditions-survey/2026/2026-q2)、[compilation guide](https://www.bankofengland.co.uk/credit-conditions-survey/compilation-guide)、[publication archive](https://www.bankofengland.co.uk/sitemap/credit-conditions-survey)。

## 2. 能力与接入

| Capability | 官方表面 | 本轮结论 |
| --- | --- | --- |
| corporate availability/demand | release HTML + annex XLSX | official table/file route-fixture |
| price/non-price terms | annex + corporate questionnaire | question/term fixture |
| past vs next-quarter expectation | every release | exact time-role fixture |
| defaults/LGD/drawdowns/factors | corporate annex | selected-question fixture |
| developer API for CCS | none documented | unsupported；不得退到generic Bankstats |

release page链接完整annex XLSX和versioned questionnaire。HTML表可证明公开presentation，不证明XLSX sheet schema永不变化；Bankstats/IADB的其他series也不能代替CCS questionnaire results。

## 3. Agent、MCP 与固定开源候选

- 未发现Bank of England维护的CCS SDK、MCP或Agent Skill。
- generic spreadsheet、HTML或Bankstats clients只能成为parser/transport reference；没有任何候选同时固定question wording、market-share weight、sign convention、past/expected和2009 backcast。
- [sdmx-twg/sdmx-rest@`46bba52`](https://github.com/sdmx-twg/sdmx-rest/tree/46bba52cb8a8a21704019f949987ee21adefdd5e)不适用：CCS本轮没有证实的SDMX route。

本轮未下载annex/questionnaire、未运行parser/browser/MCP，也未订阅email updates。

## 4. 权利、隐私与安全

- [Bank legal terms](https://www.bankofengland.co.uk/legal)只明确Bank of England Database中的data按OGL复用；CCS page/annex是否属于Database未在成员页明确，因此durable/commercial reuse保持`rights-review-required`，不能自动套OGL。
- respondent、institution、borrower、application、loan或default identity全部drop；只保存publisher aggregate和method metadata。
- results不代表Bank自身观点，也不用于个体信用、投资或融资建议。
- 本成员没有Probe；questionnaire submission、subscription/contact或任何借贷动作均不在范围内。

## 5. 成熟度与下一门槛

成员成熟度：`concept-fixture / official table-or-file route-fixture / selected-manual`；`exact official machine route-fixture=0 / rights-cleared durable=0 / callable=0 / durable=0`。

下一门槛是手写HTML/annex/workbook envelope覆盖question ID、sheet、past/expected、firm segment、weight、sign和backcast，并获得exact CCS reuse posture；真实XLSX读取另行授权。
