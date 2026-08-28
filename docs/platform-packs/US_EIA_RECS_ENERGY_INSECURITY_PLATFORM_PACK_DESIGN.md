# U.S. EIA RECS Energy Insecurity Platform Pack

[2024 RECS](https://www.eia.gov/consumption/residential/data/2024/)当前发布preliminary housing-characteristics tables；housing data在late 2024/early 2025采集，consumption/expenditure计划spring 2027发布。[HC11.1](https://www.eia.gov/consumption/residential/data/2024/hc/pdf/HC11.1_2024.pdf)把“any household energy insecurity”限定为问卷收集项目，包含减少/放弃food or medicine、让住宅处于unhealthy temperature、disconnect/delivery-stop notice，以及因无法维修或nonpayment disruption而无法使用heating/cooling equipment；多个项目可重叠。

population是50 states/DC的occupied primary housing units；vacant、seasonal、second homes、military housing和group quarters排除。2024 Household Survey近17,000 responses；published weighted housing-unit counts、percent和RSE必须分开，preliminary不能提升为final或与后续consumption release互填。

采用official programme/questionnaire/method/HC PDF-XLSX table fixture，不采用PUMF、household identifiers、respondent characteristics组合或supplier billing records。[EIA reuse policy](https://www.eia.gov/about/copyrights_reuse.php)说明美国政府出版物为public domain并建议attribution；logo、photograph和third-party material例外。

固定候选：

- [energy-insecurity@`5653de7`](https://github.com/hilarybg/energy-insecurity/tree/5653de70ca689576bfea4046b566905d3d3a2c73)直接分析RECS但无明确license，且依赖microdata；拒绝执行与adoption；
- [eia-energy-mcp-server@`533d26e`](https://github.com/cyanheads/eia-energy-mcp-server/tree/533d26e3804bdad8b290342db6b55d2c33f78f2a)为Apache-2.0 EIA API v2 generic MCP，需要key并可把结果staging至DuckDB；RECS HC table/file route和energy-insecurity semantics并未因此成立。

Snapshot/telemetry按`survey year × preliminary/final × housing-unit population × question/item × energy service × count/percent × RSE × release revision`记录question overlap、method/sample change、future release与zero effects。
