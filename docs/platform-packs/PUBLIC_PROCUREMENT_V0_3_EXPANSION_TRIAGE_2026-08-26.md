# Public Procurement Demand & Contract Execution v0.3 扩展分诊

状态：`researched / selected-for-v0.3`  
核验日期：2026-08-26  
决策ref：`public-procurement-v0.3-expansion-triage/2026-08-26`

## 1. 信号缺口与选择标准

既有v0.2已覆盖SAM.gov、EU TED、UK FTS和CCGP，证明跨jurisdiction opportunity/notice projection，却没有一等`PublicProcurement*` Go契约，也没有充分覆盖“授标后发生什么”。本轮目标不是再堆tender search，而是让`plan/requirement → procedure/lot → award → contract/call-up → amendment/financial action → performance/completion/termination`可追溯。

选择标准依次为：能补award/contract/execution事实；官方机器合同可静态核验；population/threshold/reporting duty可固定；identity/history/amount role可表达；不用HTML/private endpoint或第三方执行器。

## 2. 候选结果

| 候选 | 增量价值 | 官方证据 | 决策 |
| --- | --- | --- | --- |
| USAspending.gov | prime award、transaction、subaward、obligation/outlay与agency/recipient关系 | 官方API docs + official source | **加入v0.3；route fixture** |
| Canada Proactive Publication – Contracts | contract/amendment、original/current value、threshold、quarter与nil report | 官方dataset、schema/dictionary、CSV resources | **加入v0.3；route fixture** |
| Prozorro/OpenProcurement | plan/tender/award/contract/change/implementation feed与native history | 官方API docs + official source | **加入v0.3；route fixture，version drift gate** |
| AusTender | Commonwealth contract notices/amendments可能补合同执行 | 官方help URL本轮HTTP 403 | concept候选；不以镜像/HTML绕过 |
| Brazil PNCP | national procurement/contract data可能补拉美覆盖 | 官方integration manual URL本轮HTTP 401 | concept候选；不以非官方Swagger/wrapper绕过 |
| Patents & technical claims | solution space | API成熟但离预算兑现远 | 后续候选 |
| Broad public litigation | 高成本纠纷 | 程序、许可、自然人风险高 | 后续窄域审查 |

第一性结论：优先补采购兑现链，因为它比专利更接近组织实际资源配置，也比宽泛诉讼更容易定义authority、amount和coverage。官方文档访问失败是member-local missing evidence，不是使用community fallback的理由。

## 3. 固定 OSS / source evidence

只运行`git ls-remote`并读取固定revision的raw README/licence；未clone、安装、构建或执行。

| Artifact | Revision | Licence | 用途与边界 |
| --- | --- | --- | --- |
| `fedspendingtransparency/usaspending-api` | `ee4a5bd4d3d361d46064844a23cf40837997bb54` | CC0-1.0 | official endpoint/schema/ETL drift source；不运行本地全栈，不用code licence替代record rights |
| `ProzorroUKR/openprocurement.api` | `cdfdff58d367a8d285cf4e1be66f526355eb2363` | Apache-2.0 | official CDB API/data model source；docs 2.5 vs package 2.7.40需drift gate |
| `open-data/ckanext-canada` | `fb4263fb23e93bef342e0ea3f867a43629172a9e` | MIT with Crown/trademark terms | official portal implementation reference；不是dataset schema或route contract替代品 |
| `open-contracting/kingfisher-collect` | `77cc188e32c77e4c8b9c46c9fb4d5513b8c34b16` | BSD-3-Clause | pagination/collection negative-fixture参考；禁止执行 |
| `open-contracting/standard` | `e6b5503e06944daa287efec972c9ce12a3813c39` | Apache-2.0 | OCDS normative reference；不把非OCDS成员伪装为provider OCDS |

## 4. 成熟度与下一门

v0.3总计requested=7、concept-fixture=7、route-fixture=6、manual-only=1、callable=0、durable-approved=0。新增三成员均停在静态route fixture；没有业务API/feed/CSV调用或数据下载。

下一门是synthetic conformance：验证amount role、award/contract/transaction identity、threshold/nil/late correction、native feed history、representation、personal-data drop和zero writes。任何metadata-only sandbox仍需用户批准exact member、route、query/window、fields、budget、purpose、retention与rights；bulk、documents和durable materialization另审。

