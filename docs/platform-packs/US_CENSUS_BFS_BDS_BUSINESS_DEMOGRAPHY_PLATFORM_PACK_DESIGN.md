# U.S. Census BFS/BDS Business Formation & Dynamics Platform Pack

## 1. 选择与边界

U.S. Census在同一publisher下提供两个不可合并的program：Business Formation Statistics（BFS）从EIN application cohort观察或预测首次payroll formation；Business Dynamics Statistics（BDS）从Longitudinal Business Database发布firm/establishment opening、closing、startup、shutdown与job flow。BFS application不是business birth；BDS establishment birth不是firm startup；first payroll、positive employment与legal incorporation也不是同一事件。

本Pack只定义`PublicBusinessDemography*`知识与读取候选，不把aggregate连接到EDGAR/Companies House/州注册主体，不请求API key、data row或bulk file，不实现Connector。

## 2. 稳定概念与能力

- [BFS methodology](https://www.census.gov/econ/bfs/methodology.html)固定BA、HBA、WBA、CBA application subsets，以及BF4Q/BF8Q actual、PBF4Q/PBF8Q projected、SBF4Q/SBF8Q spliced和DUR4Q/DUR8Q application-to-formation duration。weekly只提供not-seasonally-adjusted application series且不产生formation series。
- employer formation以application对应EIN首次出现payroll tax liability识别；不是申请当月成立、营业、获客、存活或成功。projected与spliced必须保留estimate standing。
- [BDS program](https://www.census.gov/programs-surveys/bds/about.html)区分固定物理地点的establishment与共同运营控制下的firm；发布establishment opening/closing、firm startup/shutdown、employment、job creation/destruction及age/size breakdown。
- BDS firm age zero表示组成该firm的establishments均为当年entrant；收购既有establishment形成的new firm可带非零年龄。因此firm birth、firm age zero、establishment entrant不能互换。
- [BDS methodology](https://www.census.gov/programs-surveys/bds/documentation/methodology.html)要求保留longitudinal revision sensitivity、late filer correction与Hybrid Balanced Multiplicative Noise Infusion。job flow不是hire/separation，noise-infused value不是原始企业记录。
- BFS industry code与formation会annual revise；BDS recent years尤其birth/job-flow更易随着新增longitudinal information修订。current API不能充当完整revision history。

## 3. 接入、权利与成熟度

- BFS exact API family为`https://api.census.gov/data/timeseries/eits/bfs`；[static variables](https://api.census.gov/data/timeseries/eits/bfs/variables.html)固定`data_type_code/category_code/seasonally_adj/time/cell_value`等shape。
- BDS exact API family为`https://api.census.gov/data/timeseries/bds`；[developer page](https://www.census.gov/data/developers/data-sets/business-dynamics.html)固定indicator、geography、NAICS、firm/establishment age/size及flag surface。
- 2026 developer documentation说明所有data query需要API key。本轮只读static HTML metadata，未申请key或请求observation。
- [API Terms](https://www.census.gov/data/developers/about/terms-of-service.html)要求no identification/linkage、API notice、no endorsement/no false representation并允许access limits；所有snapshot保存source、program、vintage与access date。
- fixed official Agent surface：[uscensusbureau/us-census-bureau-data-api-mcp@`5dcaa63`](https://github.com/uscensusbureau/us-census-bureau-data-api-mcp/tree/5dcaa637871b9ded5dab415118f9008c06d13f2a)，CC0-1.0。它提供dataset discovery、geography resolution与generic aggregate query，需要API key并可seed本地Postgres；当前只有population prompt，没有BFS/BDS lifecycle/estimate/denominator domain Skill，因此只能作为待隔离候选，未安装或执行。
- community候选[georgemandis/mcp-census-data@`e0491dc`](https://github.com/georgemandis/mcp-census-data/tree/e0491dccd1b784776df794e5ee92f1899e0d5c7e)提供generic dataset discovery/query；固定revision未发现明确license文件，且不证明time-series BFS/BDS conformance，保持reference-only。

成员成熟度：`concept-fixture / exact official machine route-fixture / official table-or-bulk route-fixture / selected-manual`；`callable=0 / durable=0`。

## 4. Fixture与拒绝条件

fixture必须分别固定BFS/BDS program、application cohort、actual/projected/spliced、4Q/8Q、weekly/monthly/annual、firm/establishment、birth/opening/startup、death/closing/shutdown、job-flow denominator、NAICS revision、noise/suppression与release vintage。application→business、HBA→will form、PBF→observed BF、opening→entrant、closing→permanent exit、establishment birth→firm startup、job creation→hire、firm age zero→all new legal units、missing/suppressed/noise→zero或exact raw、MCP connected→domain callable一律拒绝。

