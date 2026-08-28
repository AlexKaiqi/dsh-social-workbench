# Eurostat Business Demography Platform Pack

## 1. 选择与边界

Eurostat Business Demography提供跨国active enterprise、birth、death、survival、employer demography、employment与high-growth aggregates。harmonised EBS概念不代表各国register source、profiling、coverage、revision或quality完全相同；EU aggregate也不能反推national enterprise或legal unit。

本Pack只固定current catalogue、methodology和machine-route contract；不请求JSON-stat/SDMX observations或bulk table，不实现Connector。

## 2. 稳定概念与能力

- [information on data](https://ec.europa.eu/eurostat/web/business-demography/information-data)固定active enterprise、employer enterprise、birth/death/survival、birth/death/survival/churn rates、employees/persons employed、high-growth与young-high-growth populations及breakdowns。
- statistical unit是enterprise，可由多个legal units组成；active要求reference year任一时点有turnover和/或employed persons。legal registration、local unit与enterprise activity不能互换。
- birth/death要求production-factor combination从零创建/终止且不由merger、takeover、break-up或其他restructuring产生；death需要未来观察排除reactivation，preliminary/final timing必须保留。
- high-growth要求起点至少10 employees、三年average annualised employee growth大于10%；young high-growth另有4–5 year age rule。它不是startup、revenue growth、融资、盈利或产品成功。
- current catalogue固定`bd_size`、`bd_l_form`、`bd_salge1_size`、`bd_salge1_l_form`、`bd_hg`、`bd_hg_micro`与regional products；`bd_9bd_sz_cl_r2`等明确是2004–2020 historical products，不能静默替代current dataset。
- T+18/T+20 preliminary death、T+30/T+32 final death以及annual exceptional revision形成release lineage；country revision可触发EU aggregate revision。

## 3. 接入、权利与成熟度

- exact Statistics API shape为`https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/{datasetCode}`；SDMX route用于DSD/codelist。`bd_size`等必须逐dataset固定dimension/status，generic API成功不证明domain semantics。
- 本轮仅调用Eurostat public navtree metadata `getCategoryTree`来固定dataset codes，没有请求observation。
- [Eurostat reuse](https://ec.europa.eu/eurostat/help/copyright-notice)允许统计data/metadata reuse但要求source/access date、changes与third-party exceptions。
- fixed official client：[eurostat/restatapi@`a0bce06`](https://github.com/eurostat/restatapi/tree/a0bce063c60aef1033ea696d91d26e1158c2c4b0)，EUPL，支持TOC/DSD/SDMX/TSV bulk/cache；不会自动执行enterprise/legal-unit、current/historical、preliminary/final death或country comparability gate。
- fixed community MCP：[cyanheads/eurostat-mcp-server@`7aa545d`](https://github.com/cyanheads/eurostat-mcp-server/tree/7aa545dca0a8848e4aa0e51a4f8265b633600d11)，Apache-2.0，提供catalogue/dimension/query/download及optional dataframe；hosted processor、whole-dataset download与broad query surface不进入默认信任边界，未安装或执行。
- 未发现Eurostat维护、同时固定business-demography lifecycle、cohort、high-growth、quality与revision的domain Agent Skill。

成员成熟度：`concept-fixture / exact official machine route-fixture / official table-or-bulk route-fixture / selected-manual`；`callable=0 / durable=0`。

## 4. Fixture与拒绝条件

fixture必须固定enterprise/legal-unit、active/employer population、birth/death/survival、high-growth threshold/cohort、NACE/NUTS revision、dataset code、status、country coverage与release standing。registration→birth、legal-unit count→enterprise count、restructuring→birth/death、preliminary death→final、survival→current health、high-growth→startup success、historical code→current product、harmonised→identical population、community MCP→authority一律拒绝。

