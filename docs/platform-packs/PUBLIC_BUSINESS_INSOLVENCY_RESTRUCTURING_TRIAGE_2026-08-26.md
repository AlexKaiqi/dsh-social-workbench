# 公共企业破产、清算与重组统计候选分流（2026-08-26）

## 1. 结论

下一Channel选择U.S. Courts bankruptcy caseload、UK Insolvency Service company/business insolvency、Eurostat quarterly bankruptcy declarations与Canada OSB BIA/receivership/CCAA。现有Business Demography Channel解释business population birth/opening/closure/death/exit，却不能证明formal financial-distress procedure；本Channel补上court/administrative filing、liquidation、reorganisation、proposal、receivership、moratorium与case-flow信号。

它不是identified distressed-company lead源，不证明failure cause、business cessation、creditor loss、job loss、commercial recovery或未来需求。正式procedure可以在企业继续经营时开始，也可能dismiss/close而没有实现重组成功。

| 成员 | 独特价值 | 官方接入 | 本轮成熟度 | 主要边界 |
| --- | --- | --- | --- | --- |
| U.S. Courts | business/nonbusiness cases by chapter；filed/terminated/pending caseload | official HTML catalogue + PDF/XLSX tables | table route + selected manual | case/chapter/window；PACER不是aggregate route |
| UK Insolvency Service | company procedure mix/rate；business demography by size/age/turnover/industry/region | versioned XLSX/ODS/CSV + methodology | file route + selected manual | registered company vs IDBR business；effective vs active denominator |
| Eurostat | comparable quarterly bankruptcy-declaration index by country/NACE | Statistics API/SDMX `sts_rb_q` | exact machine route + selected manual | legal-unit declaration可能provisional且不等于enterprise death |
| Canada OSB | BIA bankruptcy/proposal、receivership、CCAA、rates与declared financial aggregates | HTML reports + Open Data XLS/XLSX | file route + selected manual | business includes individual with ≥50% business liabilities；programs分开 |

成熟度固定为：`requested=4 / concept-fixture=4 / exact official machine route-fixture=1 / official table-or-bulk route-fixture=4 / filing-or-commencement fixture=4 / liquidation fixture=3 / reorganization-or-rescue fixture=3 / receivership-or-moratorium fixture=2 / case-flow fixture=1 / outcome fixture=1 / rate fixture=2 / financial-aggregate fixture=1 / estimate-quality fixture=4 / selected-manual=4 / callable=0 / durable=0`。

本轮只读official webpages、methodology、licence、static API/catalogue contract、fixed-SHA repository text与`git ls-remote`；没有请求statistical observation、XLS/XLSX/CSV/ODS/SDMX/PDF data file、PACER/CourtListener/case record、account/key/token或subscription，没有clone/install/build/execute Skill/MCP/OSS，也没有创建alert、购买plan、联系debtor/creditor/agency或产生法律/平台副作用。

## 2. 第一性原理边界

1. economic distress、inability to pay、petition/application、filing、assignment、court order、bankruptcy declaration、proceeding registration与formal legal status是不同事实。
2. proceeding、case、filing、debtor、registered company、business、enterprise、legal unit、establishment、individual business、consumer与person是不同unit。
3. business/nonbusiness或business/consumer是publisher/jurisdiction-specific classification；自然人可能是business debtor，company也不自动等于active business。
4. bankruptcy、liquidation、administration、CVA、proposal、reorganisation、receivership、moratorium、restructuring plan和CCAA不是跨辖区同义词。
5. Chapter 7通常指liquidation procedure但不证明liquidation complete；Chapter 11、administration、proposal或CCAA不证明plan confirmed、business saved或creditor recovery。
6. voluntary与involuntary、CVL与compulsory liquidation、petition与order、plan proposed与confirmed、case dismissed/terminated/closed/discharged必须分开。
7. filed和terminated是flow，pending是stock；terminated不等于discharged、paid、successful或enterprise death。
8. one registered company、one constituent company、one IDBR business、one legal unit与one debtor的counting rule不同；一个business可包含多个companies。
9. monthly、quarterly、annual、one/three/twelve-month ending window、calendar/fiscal year不能按period label直接join。
10. count、rate、index、procedure share、percent change、assets与liabilities不同；index point不是case count，percent change不是rate。
11. rate必须保留numerator、effective register/active business/business population denominator、scale、reference window与denominator vintage。
12. Eurostat national indices、EU weighted aggregate和annual summed absolute values是不同representation；index不能消除national bankruptcy-law差异。
13. SA/NSA、calendar adjustment、rebase、register matching、deduplication、system migration与confidentiality treatment必须保留lineage。
14. declared assets/liabilities、debtor claims与allowed claims/recovery/payment不同；missing financial data不能补零。
15. administrative lag、unmatched IDBR company、small-cell suppression、debtor-supplied data、provisional status与method break决定quality standing。
16. formal insolvency procedure不等于business-demography death、Companies House dissolution、closure、failure cause、job loss、customer pain或identified sales opportunity。
17. public aggregate、public docket、public document和licensed durable reuse是四个不同rights decisions；不能用aggregate反识别或link debtor/person。
18. current official page/table不等于revision archive；correction、seasonal re-estimation、classification change和source-system migration必须append lineage。

## 3. 官方成员证据

### 3.1 U.S. Courts

- [Bankruptcy table catalogue](https://www.uscourts.gov/data-table-topics/bankruptcy)发布F、F-2、F-5A及不同reporting windows/formats；[F-2](https://www.uscourts.gov/data-table-numbers/f-2)固定business/nonbusiness by chapter的official table identity。
- [Bankruptcy Basics](https://www.uscourts.gov/court-programs/bankruptcy/bankruptcy-basics)与[Chapter 11](https://www.uscourts.gov/court-programs/bankruptcy/bankruptcy-basics/chapter-11-bankruptcy-basics)固定chapter的程序含义，但明确不是法律/财务建议或outcome evidence。
- [PACER pricing](https://pacer.uscourts.gov/pacer-pricing-how-fees-work)证明case search/document是account/fee-bearing separate surface；即使zero result也可能计费，不能成为table fallback。

### 3.2 UK Insolvency Service

- [Company insolvency collection](https://www.gov.uk/government/collections/company-insolvency-statistics-releases)固定monthly registered-company product、procedure types与annual business-demography product。
- [June 2026 release](https://www.gov.uk/government/statistics/company-insolvencies-june-2026)提供versioned XLSX/ODS/industry files和methodology；[revisions policy](https://www.gov.uk/government/publications/insolvency-statistics-policy-and-procedures/insolvency-service-statistics-revisions-policy)固定seasonal、duplicate、late-data、method与migration revisions。
- [Business Insolvency Demography](https://www.gov.uk/government/statistics/business-insolvency-demography-2015-to-2025)与[methodology](https://www.gov.uk/government/statistics/business-insolvency-demography-2015-to-2025/methodology-and-quality-document-business-insolvency-demography-2015-to-2025)固定constituent-company→business matching、90%–95% match、unknown exclusions与active-business denominator。

### 3.3 Eurostat

- [dataset `sts_rb_q`](https://ec.europa.eu/eurostat/web/products-datasets/-/sts_rb_q)固定exact product code；[Statistics API](https://ec.europa.eu/eurostat/web/user-guides/data-browser/api-data-access/api-getting-started/api)固定machine route family。
- [Statistics Explained](https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Quarterly_registrations_of_new_businesses_and_declarations_of_bankruptcies_-_statistics)固定legal-unit registration/declaration、provisional/non-cessation、2021 base、active-enterprise weighting、SA aggregation、pre-2021 voluntary与annual absolute-value derivation。
- [reuse notice](https://ec.europa.eu/eurostat/help/copyright-notice)要求source/access date/change声明并保留exceptions。

### 3.4 Canada OSB

- [Statistics and research](https://ised-isde.canada.ca/site/office-superintendent-bankruptcy/en/statistics-and-research)固定BIA business/consumer volumes、NAICS/geography/rates、Open Data files与release lag。
- [Definitions](https://ised-isde.canada.ca/site/office-superintendent-bankruptcy/en/definitions)和[annual 2025 report](https://ised-isde.canada.ca/site/office-superintendent-bankruptcy/en/statistics-and-research/insolvency-statistics-canada-2025)固定bankruptcy、proposal、business ≥50% liability rule、receivership、CCAA与assets/liabilities measures。
- [Open Data dataset](https://open.canada.ca/data/en/dataset/4444b25a-cd38-46b8-bfb8-15e5d28ba4e7)发布annual/monthly XLS/XLSX resources；[Open Government Licence](https://open.canada.ca/en/open-government-licence-canada)要求attribution且排除personal information与non-endorsement。

## 4. 固定版本 OSS、MCP 与 Agent Skill 审计

| 候选 | 身份/许可 | 有价值能力 | 不能证明/风险 |
| --- | --- | --- | --- |
| [freelawproject/courtlistener-api-client@`e0644db`](https://github.com/freelawproject/courtlistener-api-client/tree/e0644db8ecfb11a169e01578ad0fa1bcac56f70c) | Free Law Project/CourtListener official，BSD-2 | REST SDK、official hosted/self-hosted MCP、schema/search/docket/health | 需要account/OAuth/token；RECAP不是完整PACER或AO statistics；generic endpoint与alert/subscription writes过宽 |
| [jmtroller/bankruptcy-observer-mcp-api-public-documentation@`c968354`](https://github.com/jmtroller/bankruptcy-observer-mcp-api-public-documentation/tree/c968354ceac9c704b8beb04cd2e7ea2b516c4bdb) | commercial documentation only，server/data licence未给出 | business case/name/EIN/NAICS/docket REST+MCP description | 无source；$1,500–$5,000/月；MCP含purchase-plan；case-level lead surface，不是official aggregate |
| [alphagov/content-store@`50090ae`](https://github.com/alphagov/content-store/tree/50090ae8a77dd0a92838f82a5266db32f32e03e8) | GDS official，MIT | known-path Content API/OpenAPI/current published content | 不证明attachment bytes、sheet schema、history或Insolvency domain contract |
| [eurostat/restatapi@`a0bce06`](https://github.com/eurostat/restatapi/tree/a0bce063c60aef1033ea696d91d26e1158c2c4b0) | Eurostat official，EUPL | catalogue/DSD/SDMX/TSV/cache | generic client不执行procedure/unit/base/adjustment/comparability gate |
| [cyanheads/eurostat-mcp-server@`7aa545d`](https://github.com/cyanheads/eurostat-mcp-server/tree/7aa545dca0a8848e4aa0e51a4f8265b633600d11) | community，Apache-2.0 | catalogue/dimension/query/download/observability | hosted processor、broad download/dataframe；非domain authority |
| [open-data/ckanext-canada@`fb4263f`](https://github.com/open-data/ckanext-canada/tree/fb4263fb23e93bef342e0ea3f867a43629172a9e) | Government of Canada official provider extension，MIT | catalogue/resource/provider schema与portal implementation evidence | server extension含create/index/admin/notify；不是OSB client或member route |

CourtListener MCP是本轮最成熟的source-adjacent Agent surface，但它服务case-law/docket research且含writes，不是U.S. Courts aggregate statistics Skill。没有发现四成员authority维护、同时固定case/debtor/company/business/legal-unit、procedure lifecycle、rate denominator、adjustment、quality与revision的Business Insolvency Agent Skill。所有候选只进入versioned snapshot，不进入active registry。

## 5. 晋级建议

1. 四成员先停在`selected-manual`，冻结program/population/unit/proceeding/event/measure/denominator/adjustment/quality/release/rights。
2. 用synthetic fixtures先证明filing≠order/declaration/cessation、case≠debtor/business、liquidation/reorganisation/receivership不互换、terminated≠outcome、index≠count、rate denominators不兼容。
3. 分别验证U.S. table envelope、UK exact workbook/CSV edition、Eurostat `sts_rb_q` DSD/constraint与Canada Open Data resource metadata；禁止跨member/product fallback。
4. MCP/clients须先通过tool allowlist、no account/write/purchase、credential/network/processor isolation、bounded response、retention与domain conformance；official/source-adjacent身份不跳过。
5. sandbox/canary只允许approved aggregate cells/files，限制member/product/procedure/period/row/cell/byte/TTL，并监控legislation/definition/schema/base/classification/revision/licence drift。
6. 当前不实现真实Connector，不安装或执行上述项目，不请求case-level或statistical observations。
