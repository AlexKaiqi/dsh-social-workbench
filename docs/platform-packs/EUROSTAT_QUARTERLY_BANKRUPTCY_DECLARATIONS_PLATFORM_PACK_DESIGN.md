# Eurostat Quarterly Bankruptcy Declarations Platform Pack

## 1. 稳定概念

Eurostat Quarterly Business Demography dataset `sts_rb_q`同时发布business registrations与declarations of bankruptcies，但两者都不是annual enterprise birth/death。

- registration是在reference quarter按administrative/legal procedure进入registration register的legal unit；它是business-intention proxy，不是enterprise birth或active business。
- bankruptcy是legal unit通过court declaration开始being-declared-bankrupt procedure；declaration常为provisional，不一定导致activity cessation。
- national registration/bankruptcy rules不同。Eurostat用index series改善趋势比较，但index同样不能消除population、legal procedure、coverage与country-method差异。
- `REG`、`BKRT`、SA/NSA、index base、NACE、geo、quarter与release必须完整同行；percent change不等于declaration count或bankruptcy rate。
- QBD bankruptcy declaration与annual business-demography death之间没有一对一关系，不能把两者join为identified event或“failure rate”。

官方入口：[dataset `sts_rb_q`](https://ec.europa.eu/eurostat/web/products-datasets/-/sts_rb_q)、[Statistics Explained](https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Quarterly_registrations_of_new_businesses_and_declarations_of_bankruptcies_-_statistics)、[national reference metadata example](https://ec.europa.eu/eurostat/cache/metadata/en/sts_tot_rb_esms_no.htm)。

## 2. 能力与接入

| Capability | 官方表面 | 本轮结论 |
| --- | --- | --- |
| quarterly registration/bankruptcy index | `sts_rb_q` Statistics API | exact official machine route-fixture eligible |
| dimensions/codelists/constraints | SDMX structure APIs | schema fixture required before data |
| country/NACE/adjustment breakdown | dataset dimensions | exact code coverage逐release验证 |
| absolute values | national transmission/selected publications | 不假定public dataset cell；逐unit验证 |
| annual bankruptcy totals derived from quarterly data | Statistics Explained/data product | separate representation/window |

exact route family为`https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/sts_rb_q`；本轮只确认official dataset code与API contract，没有请求observation。Statistics API的HTTP成功不会证明indicator/unit/adjustment/base/country comparability。[API guide](https://ec.europa.eu/eurostat/web/user-guides/data-browser/api-data-access/api-getting-started/api)、[reuse](https://ec.europa.eu/eurostat/help/copyright-notice)。

## 3. Agent、MCP 与固定开源候选

- [eurostat/restatapi@`a0bce06`](https://github.com/eurostat/restatapi/tree/a0bce063c60aef1033ea696d91d26e1158c2c4b0)是Eurostat official EUPL client，支持TOC、DSD、SDMX、TSV bulk和cache；它不自动执行bankruptcy declaration、enterprise death、legal-unit population、index base或country comparability gates。
- [cyanheads/eurostat-mcp-server@`7aa545d`](https://github.com/cyanheads/eurostat-mcp-server/tree/7aa545dca0a8848e4aa0e51a4f8265b633600d11)为Apache-2.0 community MCP，提供catalogue/dimension/query/download与optional dataframe；hosted processor和broad download surface不进入默认信任边界。
- 未发现Eurostat维护、专门固定QBD registration/bankruptcy definitions、DSD、adjustment和annual-death rejection的Agent Skill。

本轮没有安装或执行client/MCP，也没有调用dataset observations、SDMX data或bulk download。

## 4. 可比性、修订与安全边界

- country administrative procedure、market/non-market coverage、natural/legal person inclusion与sector coverage必须保留national metadata；EU aggregate不能回填country completeness。
- current index以2021年平均值为base；base revision、SA/NSA、voluntary pre-2021与mandatory Q1 2021 onward transmission posture、current revision必须同行。
- missing/confidential/provisional不等于zero；cross-country rank必须经population/procedure/unit/base/adjustment/coverage gate。
- 只保留aggregate cells；legal-unit identity、court case、debtor、address和natural person不进入本成员。
- 本成员没有Probe；registry submission、court declaration、contact、subscription或data-provider action均禁止。

## 5. 成熟度与下一门槛

成员成熟度：`concept-fixture / exact official machine route-fixture / official table-or-bulk route-fixture / selected-manual`；`callable=0 / durable=0`。

下一门槛是固定`sts_rb_q`的current DSD/constraint digest并手写REG/BKRT、SA/NSA、index/count、country coverage fixtures；随后经授权只查询一个bounded aggregate cell，不得跨到annual `bd_*`、national register或community MCP fallback。
