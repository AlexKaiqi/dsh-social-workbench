# Public Research Literature 候选调研（2026-08-26）

状态：`researched / selected-for-concept-and-route-fixtures / no-live-access`

## 1. 选择结论

本轮选择`Public Research Literature & Reported Limitations`，成员为Crossref、OpenAlex、PubMed、Europe PMC和arXiv。它补齐的是作者、编辑或review在固定工作版本中明确报告的限制、失败条件、证据缺口和未来工作，不把论文存在、被引用、被收录或开放获取误报为用户需求、科学真理或市场规模。

对比候选`Public Regulatory Enforcement & Consent Orders`暂缓：它与规则制定、投诉和产品召回的对象重叠更高；跨法域machine contract、案件法律状态、party identity/privacy和settlement≠admission的解释成本更高。后续只有在能形成独立、可核验的案件/命令/义务/状态/当事方契约时再晋级。

## 2. 成员价值与边界

| Member | 独特价值 | 官方surface | 不能推断 |
| --- | --- | --- | --- |
| Crossref | DOI注册元数据、版本/更新关系、funding/license/abstract（若成员deposit） | [REST API](https://www.crossref.org/documentation/retrieve-metadata/rest-api/)、[metadata retrieval](https://www.crossref.org/documentation/retrieve-metadata/) | deposit≠独立验证；DOI record≠全文/同行评审；abstract rights另计 |
| OpenAlex | provider-normalized scholarly graph、跨来源external IDs、topics/citation graph、snapshot | [API](https://help.openalex.org/api/)、[data](https://help.openalex.org/data/)、[snapshot](https://help.openalex.org/access/snapshot/) | OpenAlex ID/merge/topic/citation count是provider判断；core≠expansion；CC0 data claim不替代每篇full text licence |
| PubMed | 生物医学citation/abstract index、MEDLINE/MeSH authority、baseline+daily updates | [E-utilities](https://www.ncbi.nlm.nih.gov/books/NBK25499/)、[download](https://pubmed.ncbi.nlm.nih.gov/download/) | PubMed citation≠PMC全文；index status≠publication truth；abstract版权可能属publisher/author |
| Europe PMC | PubMed等多来源life-science聚合、preprint、citation/reference、OA fullTextXML subset | [REST](https://europepmc.org/RestfulWebService)、[OA subset](https://europepmc.org/downloads/openaccess) | MED/PPR等source必须保留；annotation是provider-derived；OA subset每篇license不同 |
| arXiv | 预印本/e-print元数据、显式版本、OAI-PMH和Atom API | [API](https://info.arxiv.org/help/api/index.html)、[OAI-PMH](https://info.arxiv.org/help/oa/index.html) | preprint≠同行评审；withdrawal≠journal retraction；datestamp≠original submission date；metadata rights≠content rights |

## 3. API、访问、rights 与身份核验

- Crossref public REST无需注册；polite/Plus有不同rate/concurrency，必须按响应header限速、识别client并缓存。[access docs](https://www.crossref.org/documentation/retrieve-metadata/rest-api/access-and-authentication/)是当前事实源。年度public data file、Plus snapshot和Retraction Watch CSV是不同产品，不能混为一个population。
- OpenAlex basic API可无key起步，key提高budget；API默认core corpus，snapshot包含expansion且有deleted IDs/manifest。API、snapshot和full-text content archive是不同coverage/cost/rights surface。[full text docs](https://help.openalex.org/access/fulltext/)中的PDF/TEI还受单篇来源许可、解析误差和entitlement约束。
- NCBI E-utilities要求`tool`/`email`，无key默认不超过3 requests/s；baseline需年度替换后按序应用daily update。PMC自动化和重用只能走其列明surface且逐篇检查license，[NCBI policies](https://www.ncbi.nlm.nih.gov/home/about/policies/)适用。
- Europe PMC search的synonym expansion改变候选population，query revision必须固定；`fullTextXML`只对相应OA subset开放，不能从metadata availability推断TDM许可。
- arXiv OAI-PMH夜间metadata harvest和Atom query API分开；version `vN`、latest-only OAI展示、resumption token、category sets、schema/taxonomy和2025 endpoint迁移都进入definition revision。商业用途仍需复核[API terms](https://info.arxiv.org/help/api/tou.html)与单篇许可。

所有成员优先以DOI、PMID、PMCID、arXiv ID/version和provider-native ID建立有证据的exact relation；title/author/year只能形成candidate。Crossref、OpenAlex、PubMed、Europe PMC和arXiv经常投影同一来源，不能按平台数量重复计为独立证据。

## 4. Skills、MCP 与开源项目

| Artifact | 固定revision / licence | 允许用途 | 限制 |
| --- | --- | --- | --- |
| [CrossRef/rest-api-doc](https://github.com/CrossRef/rest-api-doc/tree/00b1cc2c90e62d49c82f5381710590a6d9ca53ff) | `00b1cc2` / CC-BY-4.0 | 历史schema/route见证 | repo已deprecated；当前网页docs才是事实源 |
| [ourresearch/openalex-help](https://github.com/ourresearch/openalex-help/tree/5ad807039582c5c05c7ace600588e51906414ebb) | `5ad8070` / 根license未发现 | 官方help source见证 | 不vendoring；不能替代当前服务响应 |
| [ncbi/docker](https://github.com/ncbi/docker/tree/a8bc179e2f78876e7b4d683ab0619a38f17e23b1) | `a8bc179` / public-domain notice | EDirect packaging/source见证 | 不拉取或执行image |
| [ropensci/europepmc](https://github.com/ropensci/europepmc/tree/86ccdfc262965d0d46ba0349a744208cc228b4f1) | `86ccdfc` / GPL-3 | 社区REST client能力研究 | 非Europe PMC官方contract；不安装/执行 |
| [arXiv/oaipmh](https://github.com/arXiv/oaipmh/tree/27ad99e3e37ab7919869bd3d4cd24449dea78135) | `27ad99e` / MIT | 官方OAI-PMH实现见证 | 不运行服务 |
| [arXiv/arxiv-docs](https://github.com/arXiv/arxiv-docs/tree/7dd9f1db40d92d4debf72632aee36538fd3dc527) | `7dd9f1d` / MIT | 官方API/OAI文档source见证 | 文档不等于本地binding |
| [cyanheads/openalex-mcp-server](https://github.com/cyanheads/openalex-mcp-server/tree/46f8782376126e26d4c4c332c712e4bab6c3ac5f) | `46f8782` / Apache-2.0 | 社区MCP capability vocabulary | hosted endpoint、server和key均不可信任/不执行；不获得官方authority |
| [UCL-ERL/skills](https://github.com/UCL-ERL/skills/tree/0f08643d63b332a7479824ed467d87aea4d1b5be) | `0f08643` / MIT | limitation/failure-case阅读workflow研究 | 是分析Skill，不是connector、rights或identity contract |

OpenAlex官方Agents页面提供agent用法和OpenAPI，但不是MCP/Skill契约；其中“把API key粘进聊天”的建议不适用于本系统。凭据只能保存为Credentials ref/environment binding，不能进入prompt、聊天、普通Settings、日志、Git或fixture。

## 5. 当前成熟度与下一门槛

requested=5、concept-fixture=5、metadata-route-fixture=5、callable=0、durable-approved=0。`metadata-route-fixture=5`只说明有官方、可静态描述的候选发现路径，不代表有5条rights-cleared evidence-yielding全文路径。

晋级顺序固定为：synthetic metadata/identity/version/rights conformance → 用户批准的单成员metadata-only canary → 单独核验abstract/full-text entitlement与purpose → exact span extraction canary → durable materialization review。当前禁止真实API/feed/snapshot/full-text、MCP/Skill执行、第三方安装、credential、作者person graph、submit/correct/curate/write和任何platform side effect。
