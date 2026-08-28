# EU Funding & Tenders / CORDIS Platform Pack 设计

状态：`researched / synthetic-fixture-eligible / public-open-data-canary-candidate / no-local-binding`  
核验日期：2026-08-26  
Pack ref：`eu-funding-cordis/v0-design`

## 1. 两个权威表面

| Surface | 稳定对象 | `PublicFunding*` representation |
| --- | --- | --- |
| EU Funding & Tenders Portal | programme、call、grant topic、eligibility、budget、deadline/status | current opportunity/search placement |
| CORDIS | funded project、participant、EC contribution、summary、deliverable/publication reference | project snapshot/bulk/linked data |

[F&T API page](https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/support/apis)列出Grants & Tenders、Topic Details、Grant Updates、Organisation、Partner Search、Projects & Results等public REST surfaces。grant call/topic与call for tender共享search基础设施，但本Pack只允许grant类型；tender继续进入Public Procurement Channel。reference codes、language和portal query/schema revision必须固定，不能把internal code当长期ontology。

CORDIS提供search export、RSS、SPARQL/EURIO、framework-programme bulk dataset和注册用户DET API。[CORDIS services](https://cordis.europa.eu/about/services)说明bulk包含全量framework projects/参考数据；DET API需EU Login/API key并由CORDIS限流。不同representation可能有refresh差异，不能按同一project ID直接叠加金额或计数。

## 2. 概念、许可与内容权威

- programme、call、topic、type of action、project、participant/PIC、deliverable/publication/result summary分别建record/relation；
- call budget、expected contribution、EC grant、participant share是不同amount role；
- programme/call expected outcome为EU authority statement；project abstract/result summary可来自beneficiary，不能证明实际结果；
- linked publication/deliverable只是external artifact，默认不下载或索引正文；
- CORDIS provider classification/EuroSciVoc需保留method/taxonomy revision。

[CORDIS legal notice](https://cordis.europa.eu/about/legal)对EU拥有的editorial content默认使用CC BY 4.0，并要求credit/change indication；beneficiary materials只能按各grant适用条件使用，第三方内容/个人信息可能需另行许可。因此definition固定content ownership/authority；participant contacts和个人身份默认drop。

Horizon Europe公开数据集按月生成，官方页面也提示live网站和dataset可能不一致、JSON格式会发生结构性迁移；每次snapshot固定distribution URL/hash、format/schema、generatedAt和programme coverage。

## 3. Agent/开源审计

未发现EC/CORDIS官方领域MCP或Agent Skill。固定community[EU F&T MCP `bff2e2c…`](https://github.com/pipeworx-io/mcp-eu-funding-tenders/tree/bff2e2c6ec89daa6257cea35519d7c8ea332cac7)为MIT，但实现含deadline/status修正和provider query解释，属于derived adapter logic，不能替代官方schema。固定[CORDIS MCP `3254e4c…`](https://github.com/tavitatavi/cordis-mcp-server/tree/3254e4c1b70e43d3dde44bc89207d4abc3c4ba9c)root license未发现，使用本地DuckDB、ad-hoc SQL和外部LLM eval，只作负向权限/warehouse/eval参考。

## 4. Skills、fixture、观测与晋级

`eu-funding-cordis-contract-research/v1`只读官方API/open-data/legal/taxonomy；fixture验证grant-vs-tender、call/topic/project层级、reference-code/language drift、amount roles、participant identity drop、live/bulk/LOD overlap、EU-vs-beneficiary content rights和zero application/write。

Telemetry按`F&T/CORDIS product × API/bulk/LOD schema × programme/call/topic/project × language/window`记录requested/returned/retained/dropped、grant/tender rejection、reference-code/taxonomy drift、live/bulk lag、project/participant/result coverage、attribution/license ownership、identity quarantine、DET quota与zero writes。未来public API或open-data canary逐representation批准；DET key、full bulk、SPARQL和result content分别晋级。
