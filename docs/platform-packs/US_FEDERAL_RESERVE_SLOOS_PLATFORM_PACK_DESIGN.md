# U.S. Federal Reserve SLOOS Platform Pack

## 1. 稳定概念

本成员描述Federal Reserve Board的Senior Loan Officer Opinion Survey on Bank Lending Practices（SLOOS）公开聚合，不描述identified business、loan application、facility、bank decision或underwriting score。

- `standards`是银行批准某类申请的policy，属于extensive margin；`terms`是在批准条件下的contract conditions，属于intensive margin。两者不能合并成“融资难度”。
- business lending至少区分C&I、CRE、firm size、domestic banks与U.S. branches/agencies of foreign banks；相同问题在不同panel不是同一population。
- standards/terms的net percentage通常是tightened minus eased；demand是stronger minus weaker。正值的业务方向随measure变化。
- regular questions、July historical-range questions与其他special questions有不同question identity和coverage；special result不能回填完整历史序列。
- reported previous-quarter change、current level relative to historical range和annual expectation不是同一time role。
- survey responses是银行观点的aggregate，不是business-reported pain、actual credit volume、approval rate或causal estimate。

官方入口：[SLOOS index](https://www.federalreserve.gov/data/sloos.htm)、[About](https://www.federalreserve.gov/data/sloos/about.htm)、[July 2026 release](https://www.federalreserve.gov/data/sloos/sloos-202607.htm)、[chart-data example](https://www.federalreserve.gov/data/sloos/sloos-202504-chart-data.htm)。

## 2. 能力与接入

| Capability | 官方表面 | 本轮结论 |
| --- | --- | --- |
| standards/terms/demand by loan and firm size | release HTML/PDF/table/chart data | concept + table fixture |
| aggregate time series | Data Download Program CSV/XML-SDMX | exact official machine route-fixture |
| panel/question/method | About、release footnotes、tables | definition fixture |
| special expectations/current level/approval likelihood | release-specific tables | selected-question fixture；不得外推 |
| respondent-level answers | confidential | unsupported |

[DDP package chooser](https://www.federalreserve.gov/datadownload/Choose.aspx?rel=sloos)提供chart CSV与all-data XML/SDMX；[DDP help](https://www.federalreserve.gov/datadownload/help/)描述结构文件和自动下载。2026-07-16公告指出Build Your Package将在2026年11月移除并最终退休，推荐转向FRED；因此route必须标记`distribution-migrating`，不能宣称durable endpoint。

## 3. Agent、MCP 与固定开源候选

- [shanehull/fred-mcp@`427dc12`](https://github.com/shanehull/fred-mcp/tree/427dc125f8c503662ab4be13d69cf9045dfab6a0)是community MIT MCP，覆盖FRED 37类read endpoints、ALFRED vintages和GeoFRED，需要FRED API key。FRED是Federal Reserve Bank of St. Louis的再分发表面，不是Federal Reserve Board SLOOS program authority；series metadata、units、transform和release relation必须逐项复核。
- [sdmx-twg/sdmx-rest@`46bba52`](https://github.com/sdmx-twg/sdmx-rest/tree/46bba52cb8a8a21704019f949987ee21adefdd5e)是SDMX Technical Working Group维护的REST规范/OpenAPI参考，当前仓库未声明LICENSE，不能按开源代码依赖采用；它也不包含SLOOS question/sign/panel语义。
- 未发现Federal Reserve Board维护、能固定SLOOS question revision、panel、measure direction、weighting和special-question coverage的Agent Skill或MCP。

本轮仅阅读official pages与固定SHA源码文本；未下载SLOOS observations/XML/CSV/PDF、未申请FRED key、未安装/执行MCP或创建服务。

## 4. 权利、隐私与安全

- [Federal Reserve disclaimer](https://www.federalreserve.gov/disclaimer.htm)说明除另有标记外Board网站信息为public domain并要求引用来源；third-party material仍需单独授权。
- respondent identity、institution-level response、contact、loan/application/borrower data和open-ended text全部pre-gate drop。
- aggregate result不用于评价单一银行或企业，也不提供信用、投资或融资建议。
- 本成员没有Probe；survey submission、FRED key registration、subscription/contact、loan application或任何金融动作均为独立副作用。

## 5. 成熟度与下一门槛

成员成熟度：`concept-fixture / exact official machine route-fixture / selected-manual`；`sandbox-live=0 / callable=0 / durable=0`。

下一门槛是用手写release/DDP envelopes验证panel/question/loan category/firm size/sign/time role/series/revision，并为DDP→FRED迁移建立双route但不互相冒充authority的fixture；真实单series读取须另行授权。
