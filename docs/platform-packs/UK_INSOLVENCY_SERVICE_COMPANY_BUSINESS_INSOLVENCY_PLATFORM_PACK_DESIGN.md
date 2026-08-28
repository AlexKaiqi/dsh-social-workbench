# UK Insolvency Service Company & Business Insolvency Platform Pack

## 1. 稳定概念

本成员包含两个不能合并的official products：monthly `Company Insolvency Statistics`与annual `Business Insolvency Demography`。

- monthly product以registered companies entering formal insolvency procedures为中心，按compulsory liquidation、creditors' voluntary liquidation、administration、company voluntary arrangement与receivership拆分；moratorium和restructuring plan另表报告。
- annual demography把“至少一个constituent company经历formal company insolvency procedure”的IDBR business定义为business insolvency。一个business可由多个companies组成，因此company count/rate与business count/rate不可比较。
- company insolvency rate使用Companies House effective register；business insolvency rate使用active business population。两个per-10,000 rate即使同年同地区也不能共享denominator。
- IDBR match约90%–95%；未匹配company进入Unknown，并从部分breakdown/totals排除，可能导致低估。registration location、business region、industry、age、employees与turnover均有各自来源与coverage。
- entering procedure不证明liquidation complete、plan confirmed、creditor recovery、business cessation、dissolution或cause。

官方入口：[Company insolvency collection](https://www.gov.uk/government/collections/company-insolvency-statistics-releases)、[June 2026 release](https://www.gov.uk/government/statistics/company-insolvencies-june-2026)、[Business insolvency demography 2015–2025](https://www.gov.uk/government/statistics/business-insolvency-demography-2015-to-2025)、[methodology](https://www.gov.uk/government/statistics/business-insolvency-demography-2015-to-2025/methodology-and-quality-document-business-insolvency-demography-2015-to-2025)。

## 2. 能力与接入

| Capability | 官方表面 | 本轮结论 |
| --- | --- | --- |
| monthly company procedure counts/rates | versioned XLSX/ODS + HTML methodology | official workbook route-fixture eligible |
| industry time series | separate industry XLSX/ODS | independent resource/grain |
| long-run series | release CSV metadata/series | exact edition and revision required |
| annual business counts/rates by region/industry/age/employees/turnover | XLSX + full CSV | official file route-fixture eligible |
| moratorium/restructuring plan counts | monthly table | formal protection/proposal only；not outcome |

GOV.UK Content API可以按已知path读取页面content metadata，但不能替代附件edition、sheet/schema或revision contract。数据route保持`official-feed-export/selected-manual`，不声明Insolvency Service developer API。[GOV.UK reuse/API](https://www.gov.uk/help/reuse-govuk-content)、[terms](https://www.gov.uk/help/terms-conditions)。

## 3. Agent、SDK 与固定开源候选

- [alphagov/content-store@`50090ae`](https://github.com/alphagov/content-store/tree/50090ae8a77dd0a92838f82a5266db32f32e03e8)是GDS official Content API implementation，MIT，OpenAPI只提供known path lookup和current published content item。它不证明Insolvency XLSX/CSV sheet schema、history或domain conformance，也含更宽publishing ecosystem概念。
- 未发现Insolvency Service维护的company/business insolvency Agent Skill、MCP或domain SDK。generic GOV.UK search/content MCP、browser和spreadsheet parser都不能提高member maturity。

本轮未请求Content API payload或任何XLSX/CSV/ODS内容，未执行源码，也未订阅release或联系统计团队。

## 4. 修订、质量与边界

- monthly administrative data会因late data、duplicate liquidation、seasonal model、method change和source correction修订；2025系统迁移还影响较老England & Wales history的验证范围。[Revisions policy](https://www.gov.uk/government/publications/insolvency-statistics-policy-and-procedures/insolvency-service-statistics-revisions-policy)。
- SA/NSA、monthly/annual、company/business、registered/effective/active denominator必须分开；current workbook不能覆盖历史edition。
- OGL适用时保留source、licence、access date、adaptation与non-endorsement；third-party exceptions继续审查。
- company number、name、address、director、creditor、practitioner与case narrative不进入aggregate Channel。
- 本成员没有Probe；petition、winding-up action、filing、claim、contact、subscription与Companies House mutation均为正式副作用。

## 5. 成熟度与下一门槛

成员成熟度：`concept-fixture / official table-or-file route-fixture / selected-manual`；`exact official machine route-fixture=0 / callable=0 / durable=0`。

下一门槛是分别冻结monthly company和annual business-demography synthetic workbooks，验证procedure、company/business unit、denominator、matching gap、SA/NSA与revision lineage；不得用Content API、Companies House record或当前附件推断另一edition。

