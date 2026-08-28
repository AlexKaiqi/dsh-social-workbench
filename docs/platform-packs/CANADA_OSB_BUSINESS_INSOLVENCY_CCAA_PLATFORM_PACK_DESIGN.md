# Canada OSB Business Insolvency, Receivership & CCAA Platform Pack

## 1. 稳定概念

Office of the Superintendent of Bankruptcy同时发布BIA insolvency、receivership与CCAA statistics；三者不能合成一个“business failure”计数。

- BIA `business`包括非individual commercial entity/organization，也包括因经营business产生至少50% total liabilities的individual；它不等于corporation、employer business或StatCan enterprise。
- BIA insolvency包括bankruptcy和proposal。bankruptcy是assignment made或bankruptcy order issued后的法律状态；proposal是BIA下与creditors改变偿债条件的formal agreement。
- receivership、BIA proposal与CCAA proceeding是不同法律程序。CCAA面向欠creditors超过法定门槛的insolvent corporations并受court supervision；filing不证明arrangement confirmed或business rescued。
- consumer/business由liability nature分流；individual business不得因是自然人被并入consumer，也不得反推person identity。
- monthly volume波动大，quarterly/annual更适合趋势；rate、count、assets、liabilities与percentage change是不同measure。

官方入口：[Statistics and research](https://ised-isde.canada.ca/site/office-superintendent-bankruptcy/en/statistics-and-research)、[Insolvency and CCAA releases](https://ised-isde.canada.ca/site/office-superintendent-bankruptcy/en/insolvency-and-ccaa-statistics-canada)、[definitions](https://ised-isde.canada.ca/site/office-superintendent-bankruptcy/en/definitions)。

## 2. 能力与接入

| Capability | 官方表面 | 本轮结论 |
| --- | --- | --- |
| BIA business bankruptcy/proposal volumes | monthly/quarterly/annual HTML + XLS/XLSX | official table/bulk route-fixture eligible |
| business rate per 1,000 businesses | annual rate files | exact denominator/source required |
| NAICS/geography breakdown | annual/monthly files, ER/CMA/FSA products | classification/privacy/coverage逐product |
| declared assets/liabilities | annual report tables | aggregate debtor-reported financial fixture |
| receivership and CCAA filings | annual/quarterly reports | separate program/procedure fixture |
| recently closed CCAA files | quarterly report | selected outcome representation；not rescue success |

Open Government Portal提供versioned resource metadata和XLS/XLSX files，例如[Insolvency Statistics in Canada dataset](https://open.canada.ca/data/en/dataset/4444b25a-cd38-46b8-bfb8-15e5d28ba4e7)；本轮没有请求文件内容或CKAN API payload。自2024年1月起NAICS reports使用2022 revision，不能按label静默拼接历史。

## 3. Agent、SDK 与固定开源候选

- [open-data/ckanext-canada@`fb4263f`](https://github.com/open-data/ckanext-canada/tree/fb4263fb23e93bef342e0ea3f867a43629172a9e)是Government of Canada CKAN extension，MIT，证明Open Data portal provider schema、resource/catalogue与内部/public功能边界；它是部署端扩展而非OSB domain client，包含dataset creation/index/notification等宽管理面，不能安装为read connector。
- 未发现OSB维护的BIA/CCAA Agent Skill、MCP或versioned client。generic CKAN MCP/client、spreadsheet parser与commercial bankruptcy service不能固定business/consumer 50% liability rule、program separation、denominator或release lineage。

本轮只读official pages、fixed-SHA source text与`git ls-remote`，没有安装、执行或连接任何项目。

## 4. 权利、隐私、质量与副作用

- Open Government Licence – Canada要求attribution并排除personal information、third-party rights、official marks与endorsement；snapshot保存licence/access date/adaptation lineage。[licence](https://open.canada.ca/en/open-government-licence-canada)。
- 默认只保留published aggregate；debtor/corporation/person name、address、FSA small-cell、estate number、creditor、trustee、case document和individual assets/liabilities全部drop或restricted。
- business rate必须绑定per-1,000 scale与exact business denominator；consumer rate、corporate population或MBOC employer population不能替代。
- assets/liabilities为declared aggregate，不自动等于verified valuation、claim allowed、recovery或payment。
- 本成员没有Probe；assignment、proposal、court application、claim、Licensed Insolvency Trustee contact、case lookup、subscription和open-data admin write均为副作用。

## 5. 成熟度与下一门槛

成员成熟度：`concept-fixture / official table-or-bulk route-fixture / selected-manual`；`exact official machine route-fixture=0 / callable=0 / durable=0`。

下一门槛是用synthetic XLSX/HTML envelopes分别验证BIA bankruptcy/proposal、receivership、CCAA、business/consumer/individual-business、rate denominator、NAICS revision与financial missingness；不得用CKAN provider code、case search或commercial API替代official resource contract。

