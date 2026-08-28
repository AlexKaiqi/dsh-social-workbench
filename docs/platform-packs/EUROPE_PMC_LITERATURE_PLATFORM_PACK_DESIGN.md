# Europe PMC Literature Platform Pack 设计

状态：`researched / concept+metadata-route-fixture / no-local-binding`  
核验日期：2026-08-26  
Pack ref：`europe-pmc-literature/v0-design`

## 1. 产品、概念与价值

本Pack描述Europe PMC [REST service](https://europepmc.org/RestfulWebService)及其开放获取子集。Europe PMC聚合PubMed、Agricola、EPO、NICE和preprint等来源，提供search的idlist/lite/core结果、references、citations、database links、text-mined terms，并对相应开放获取记录提供`fullTextXML`。它适合统一发现生命科学论文/preprint和候选全文，但不拥有所有源记录，不能把聚合记录、text-mined annotation或citation coverage当成author finding、完整关系或独立证据。

| Native concept | `PublicResearchLiterature*` | 约束 |
| --- | --- | --- |
| source + external ID（MED/PPR等） | provider record/external identity | source必须保留；相同数字跨source不合并 |
| lite/core result | metadata/provider representation | core字段更多不代表full text获准 |
| references/citations | provider relation coverage | 可能不完整；不当作总影响或独立验证 |
| text-mined terms | provider annotation/classification | 与author-authored span分开，不能产生limitation evidence |
| article/preprint/version relation | work/version/relation | preprint与published version不静默合并 |
| `fullTextXML` | OA full-text expression | 仅适用subset且逐篇license/purpose校验 |
| synonym expansion | query population revision | expansion on/off的结果不可直接比较 |

## 2. route、rights 与common origin

concept capability为literature search/read、reference/citation/database-link/annotation read和OA full-text availability/read fixture。metadata route固定query syntax、source、result type、format、cursor/page、synonym expansion、API release/schema和error；full-text route作为独立rights-gated fixture，不因metadata成功而自动选择。

[OA subset](https://europepmc.org/downloads/openaccess)说明开放获取全文仍受版权保护并采用各自Creative Commons或相似license。每个expression都保存licence、content version、purpose、attribution和TDM evidence；`fullTextXML`成功或OA label也不能给另一个版本授权。

Europe PMC MED记录与PubMed、Crossref、OpenAlex常同源，PPR记录也可能来自arXiv或其他preprint repository。exact DOI/PMID/PMCID/repository ID建立common-origin relation；同一记录的XML/JSON/DC、lite/core、语言或query结果是alternate representation，不重复计数。

## 3. 开源、Fixture 与晋级

[ropensci/europepmc@86ccdfc](https://github.com/ropensci/europepmc/tree/86ccdfc262965d0d46ba0349a744208cc228b4f1)是GPL-3社区R client，可研究REST/annotation能力但不是Europe PMC官方contract；不安装、执行或vendoring。

synthetic fixture覆盖MED/PPR source隔离、PubMed common-origin、preprint→published relation、lite/core、synonym expansion population drift、incomplete citations、provider-mined annotation、OA/non-OA、per-article licence、fullTextXML missing、API release drift和zero writes。Telemetry按`source × result type × query/synonym revision × work/version × representation × licence`记录returned/retained、relation/citation coverage、annotation provenance、identity conflict、rights block和zero effects。

metadata-only canary与full-text span canary分别授权；后者必须绑定exact record/version/licence/purpose。author identity、bulk corpus、durable materialization和任何submission/annotation/write拒绝。
